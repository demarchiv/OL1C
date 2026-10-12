import { WAVES, WAVE_IDS } from '../data/waveList';

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */
export const DEFAULT_MODEL = 'gemini-3.6-flash';
// Google renames its models often. These are only suggestions: the page lets
// you type any model name.
export const MODEL_SUGGESTIONS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];

const API_ROOT = 'https://generativelanguage.googleapis.com/v1beta/models';
const MAX_SIDE = 2400;          // longest side sent to the model, in pixels
const THUMB_SIDE = 260;         // longest side of the small preview
const MAX_RETRIES = 3;          // how many times to retry when the free tier says "slow down"
const REQUEST_TIMEOUT_MS = 120000;

/* ------------------------------------------------------------------ */
/*  Small helpers                                                      */
/* ------------------------------------------------------------------ */
export const sleep = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal && signal.aborted) { reject(new DOMException('Aborted', 'AbortError')); return; }
    const timer = setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    }
  });

const mimeFromName = (file) => {
  if (file.type) return file.type;
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (ext === 'heic') return 'image/heic';
  if (ext === 'heif') return 'image/heif';
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  return 'image/jpeg';
};

const readAsBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Could not read the file.'));
    reader.readAsDataURL(file);
  });

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('This browser cannot display the file.')); };
    img.src = url;
  });

const drawScaled = (img, maxSide) => {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
};

/* ------------------------------------------------------------------ */
/*  Photos                                                             */
/* ------------------------------------------------------------------ */

// Small preview for the table. Returns null if the browser cannot decode the
// file (typically iPhone HEIC photos outside Safari); that is fine, the photo
// can still be analysed.
export const makeThumb = async (file) => {
  try {
    const img = await loadImage(file);
    return drawScaled(img, THUMB_SIDE).toDataURL('image/jpeg', 0.8);
  } catch (e) {
    return null;
  }
};

// Prepares the photo for the model. The picture is only made smaller: nothing
// is "enhanced", so no words on the waves can be changed. If the browser cannot
// decode the file (HEIC), the original bytes are sent untouched.
export const prepareImage = async (file) => {
  try {
    const img = await loadImage(file);
    const canvas = drawScaled(img, MAX_SIDE);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    return { mime: 'image/jpeg', base64: dataUrl.split(',')[1] };
  } catch (e) {
    return { mime: mimeFromName(file), base64: await readAsBase64(file) };
  }
};

/* ------------------------------------------------------------------ */
/*  The instructions sent to the model                                 */
/* ------------------------------------------------------------------ */
const listFor = (type) =>
  WAVES.filter((w) => w.type === type)
    .map((w) => {
      const alt = w.aliases.length ? ` (also written: ${w.aliases.join(', ')})` : '';
      return `  ${w.id} = ${w.label}${alt}`;
    })
    .join('\n');

export const buildPrompt = () => `You are reading a photo of a paper "working template" sheet from an Ocean Literacy workshop. Participants placed coloured, wave-shaped pieces ("waves") on the white working canvas of the sheet and drew and wrote around them. Report WHICH of the 24 official waves are physically placed on the canvas.

The 24 official waves (id = label printed on the piece):
Principles (green pieces):
${listFor('Principle')}
Perspectives (light blue pieces):
${listFor('Perspective')}
Dimensions (dark blue pieces):
${listFor('Dimension')}

Rules:
- Count only physical wave pieces: coloured, wave-shaped pieces with a printed label, lying on the sheet. Each wave exists once, so each id is either present or not.
- Do NOT count words that are handwritten or drawn, and do not count the printed title or the printed instructions on the sheet.
- Some photos also show a round board called "The OL-in-One Compass". Waves still sitting on that board do NOT count, and neither do the empty white or grey outlines left on the board where a wave was removed. Count only waves that were moved onto the white sheet.
- Waves can overlap, be rotated or upside down, be partly hidden, or be cut by the edge of the sheet. If enough of the printed label is legible to be sure which wave it is, count it.
- Do not guess from the context or from what is written nearby. If you suspect a piece is a certain wave but cannot read its label, put its id in "uncertain" instead of "present".

Reply with JSON only, in exactly this shape (ids from the list above, no other text):
{"present": ["P6", "D1"], "uncertain": []}`;

/* ------------------------------------------------------------------ */
/*  Reading the model's answer                                         */
/* ------------------------------------------------------------------ */
const normalize = (text) => String(text).toUpperCase().replace(/[^A-Z0-9]/g, '');

const LOOKUP = (() => {
  const map = {};
  WAVES.forEach((w) => {
    map[normalize(w.id)] = w.id;
    map[normalize(w.label)] = w.id;
    map[normalize(w.name)] = w.id;
    w.aliases.forEach((a) => { map[normalize(a)] = w.id; });
  });
  return map;
})();

const toIds = (list) => {
  if (!Array.isArray(list)) return [];
  const out = [];
  list.forEach((item) => {
    const id = LOOKUP[normalize(item)];
    if (id && !out.includes(id)) out.push(id);
  });
  // keep the official order
  return WAVE_IDS.filter((id) => out.includes(id));
};

const parseAnswer = (text) => {
  const cleaned = String(text).replace(/```json|```/gi, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('The model did not answer in the expected format.');
  let data;
  try {
    data = JSON.parse(cleaned.slice(start, end + 1));
  } catch (e) {
    throw new Error('The model answer could not be read as JSON.');
  }
  const present = toIds(data.present);
  const uncertain = toIds(data.uncertain).filter((id) => !present.includes(id));
  return { present, uncertain };
};

/* ------------------------------------------------------------------ */
/*  The request                                                        */
/* ------------------------------------------------------------------ */
const fail = (message, fatal) => {
  const error = new Error(message);
  error.fatal = !!fatal;   // fatal = no point in trying the next photo
  return error;
};

export const detectWaves = async ({ apiKey, model, image, signal, onWait }) => {
  const url = `${API_ROOT}/${encodeURIComponent(model)}:generateContent`;
  // Note: no "temperature" here. Google's newest Flash models reject it.
  const body = JSON.stringify({
    contents: [{
      role: 'user',
      parts: [
        { text: buildPrompt() },
        { inline_data: { mime_type: image.mime, data: image.base64 } },
      ],
    }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), REQUEST_TIMEOUT_MS);
    const onUserAbort = () => timeout.abort();
    if (signal) signal.addEventListener('abort', onUserAbort, { once: true });

    let response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body,
        signal: timeout.signal,
      });
    } catch (e) {
      if (signal && signal.aborted) throw new DOMException('Aborted', 'AbortError');
      if (timeout.signal.aborted) throw fail('Google took too long to answer (more than 2 minutes).');
      throw fail('Could not reach Google. Check your internet connection, or whether a browser extension blocks the request.');
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', onUserAbort);
    }

    let data = null;
    try { data = await response.json(); } catch (e) { /* no JSON body */ }
    const apiMessage = data && data.error && data.error.message ? data.error.message : '';

    // Free tier is busy or the per-minute limit was hit: wait and try again.
    if ((response.status === 429 || response.status === 503) && attempt < MAX_RETRIES) {
      const waitSeconds = 20 * (attempt + 1);
      for (let s = waitSeconds; s > 0; s--) {
        if (onWait) onWait(s);
        await sleep(1000, signal);
      }
      continue;
    }
    if (response.status === 429) {
      throw fail('Free-tier limit reached. Wait a few minutes (or until tomorrow) and press Run again; finished photos are kept.', true);
    }
    if (response.status === 503) throw fail('Google is overloaded right now. Try again in a few minutes.');
    if (response.status === 401 || response.status === 403) {
      throw fail(`Google refused the key. ${apiMessage}`.trim(), true);
    }
    if (response.status === 404) {
      throw fail(`Model "${model}" was not found. Change the model name (see the suggestions) and try again.`, true);
    }
    if (response.status === 400) {
      const keyProblem = /api key/i.test(apiMessage);
      throw fail(`Google rejected the request. ${apiMessage}`.trim(), keyProblem);
    }
    if (!response.ok) throw fail(`Google returned an error (${response.status}). ${apiMessage}`.trim());

    const candidate = data && data.candidates && data.candidates[0];
    const parts = candidate && candidate.content && candidate.content.parts;
    const text = parts ? parts.map((p) => p.text || '').join('') : '';
    if (!text) {
      const reason = (data && data.promptFeedback && data.promptFeedback.blockReason) || (candidate && candidate.finishReason) || 'no answer';
      throw fail(`The model returned no answer (${reason}).`);
    }
    return parseAnswer(text);
  }
  throw fail('Could not get an answer. Try again later.');
};
