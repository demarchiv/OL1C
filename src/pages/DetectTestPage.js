import React, { useContext, useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StateContext } from '../State';
import { encodedFonts } from '../assets/fonts/Fonts.js';
import { WAVES, REFERENCE_MAPS, referenceKey } from '../data/waveList';
import { DEFAULT_MODEL, MODEL_SUGGESTIONS, makeThumb, prepareImage, detectWaves } from '../utils/geminiDetect';
import '../styles/pages/DetectTestPage.css';

const PARALLEL = 3;   // photos analysed at the same time (the free tier allows roughly 10 per minute)
const IMAGE_FILE = /\.(jpe?g|png|webp|heic|heif)$/i;

const stripExtension = (name) => name.replace(/\.[^.]+$/, '');
const naturalSort = (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });

const download = (content, fileName, mime) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const stamp = () => new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');

const DetectTestPage = () => {
  const { colors } = useContext(StateContext);

  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState(DEFAULT_MODEL);
  const [files, setFiles] = useState([]);
  const [running, setRunning] = useState(false);
  const [useReference, setUseReference] = useState(true);
  const [notice, setNotice] = useState('');
  const [fast, setFast] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [runTime, setRunTime] = useState(null);

  useEffect(() => {
    if (!running) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const cancelRef = useRef(false);
  const abortRef = useRef(null);

  /* ------------------------------ files ------------------------------ */
  const updateFile = (name, patch) =>
    setFiles((prev) => prev.map((f) => (f.name === name ? { ...f, ...patch } : f)));

  const addFiles = async (fileList) => {
    const picked = Array.from(fileList || []).filter((f) => IMAGE_FILE.test(f.name) || (f.type || '').startsWith('image/'));
    if (!picked.length) {
      setNotice('No photos found in that selection (JPG, PNG, WEBP or HEIC).');
      return;
    }
    setNotice('');
    const entries = picked.map((f) => ({
      name: f.name,
      label: stripExtension(f.name),
      file: f,
      status: 'queued',
      message: '',
      present: [],
      uncertain: [],
      thumb: null,
    }));
    setFiles((prev) => {
      const byName = new Map(prev.map((f) => [f.name, f]));
      entries.forEach((e) => byName.set(e.name, e));
      return Array.from(byName.values()).sort(naturalSort);
    });
    entries.forEach(async (e) => {
      const thumb = await makeThumb(e.file);
      if (thumb) updateFile(e.name, { thumb });
    });
  };

  const onPick = (event) => {
    addFiles(event.target.files);
    event.target.value = '';   // so picking the same photos again still works
  };

  const clearAll = () => {
    if (running) return;
    setFiles([]);
    setNotice('');
  };

  /* ------------------------------- run ------------------------------- */
  const run = async () => {
    if (!apiKey.trim()) { setNotice('Paste your Gemini API key first (step 1).'); return; }
    if (!model.trim()) { setNotice('Type a model name (step 2).'); return; }
    const todo = files.filter((f) => f.status !== 'done');
    if (!todo.length) { setNotice(files.length ? 'All photos are already done.' : 'Add some photos first (step 3).'); return; }

    setNotice('');
    setRunTime(null);
    cancelRef.current = false;
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    const began = Date.now();

    let next = 0;
    const worker = async () => {
      while (!cancelRef.current && next < todo.length) {
        const f = todo[next++];
        const started = Date.now();
        updateFile(f.name, { status: 'working', message: 'preparing photo…', startedAt: started });
        try {
          const image = await prepareImage(f.file);
          updateFile(f.name, { message: 'asking Gemini…' });
          const out = await detectWaves({
            apiKey: apiKey.trim(),
            model: model.trim(),
            image,
            fast,
            signal: controller.signal,
            onWait: (s) => updateFile(f.name, { message: `limit hit, retry in ${s}s` }),
          });
          updateFile(f.name, { status: 'done', message: '', present: out.present, uncertain: out.uncertain, seconds: Math.round((Date.now() - started) / 1000) });
        } catch (e) {
          if (e && e.name === 'AbortError') {
            updateFile(f.name, { status: 'queued', message: '' });
            return;
          }
          updateFile(f.name, { status: 'error', message: e.message || 'Something went wrong.' });
          if (e && e.fatal) {
            setNotice(e.message);
            cancelRef.current = true;
            controller.abort();
            return;
          }
        }
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL, todo.length) }, worker));
    setRunTime(Math.round((Date.now() - began) / 1000));
    setRunning(false);
  };

  const stop = () => {
    cancelRef.current = true;
    if (abortRef.current) abortRef.current.abort();
  };

  /* ---------------------------- the numbers --------------------------- */
  const analysis = useMemo(() => {
    const perFile = {};
    const totals = { files: 0, cells: 0, correct: 0, tp: 0, fp: 0, fn: 0, perfect: 0 };
    files.forEach((f) => {
      if (f.status !== 'done') return;
      const key = useReference ? referenceKey(f.name) : null;
      if (!key) return;
      const truth = REFERENCE_MAPS[key];
      let tp = 0, fp = 0, fn = 0;
      WAVES.forEach((w) => {
        const found = f.present.includes(w.id);
        const expected = truth.includes(w.id);
        if (found && expected) tp++;
        else if (found && !expected) fp++;
        else if (!found && expected) fn++;
      });
      const correct = WAVES.length - fp - fn;
      perFile[f.name] = { key, truth, tp, fp, fn, correct };
      totals.files++;
      totals.cells += WAVES.length;
      totals.correct += correct;
      totals.tp += tp;
      totals.fp += fp;
      totals.fn += fn;
      if (fp === 0 && fn === 0) totals.perfect++;
    });
    const doneFiles = files.filter((f) => f.status === 'done');
    const allHaveReference = doneFiles.length > 0 && doneFiles.every((f) => perFile[f.name]);
    return { perFile, totals, allHaveReference, doneCount: doneFiles.length };
  }, [files, useReference]);

  const frequency = (id) => files.filter((f) => f.status === 'done' && f.present.includes(id)).length;
  const referenceFrequency = (id) =>
    files.filter((f) => f.status === 'done' && analysis.perFile[f.name] && analysis.perFile[f.name].truth.includes(id)).length;

  const { totals } = analysis;
  const percent = totals.cells ? Math.round((100 * totals.correct) / totals.cells) : 0;
  const expectedTotal = totals.tp + totals.fn;
  const foundTotal = totals.tp + totals.fp;

  /* ----------------------------- downloads ---------------------------- */
  const doneFiles = files.filter((f) => f.status === 'done');

  const downloadJson = () => {
    const record = {
      description: 'Wave detection: one column per photo, one row per wave. 1 = the wave is on the map, 0 = it is not.',
      generated: new Date().toISOString(),
      model: model.trim(),
      columns: doneFiles.map((f) => f.label),
      rows: WAVES.map((w) => ({
        id: w.id,
        type: w.type,
        wave: w.name,
        values: doneFiles.map((f) => (f.present.includes(w.id) ? 1 : 0)),
      })),
    };
    download(JSON.stringify(record, null, 2), `wave-detection-${stamp()}.json`, 'application/json');
  };

  const downloadCsv = () => {
    const q = (text) => `"${String(text).replace(/"/g, '""')}"`;
    const lines = [['id', 'type', 'wave', ...doneFiles.map((f) => f.label)].map(q).join(',')];
    WAVES.forEach((w) => {
      lines.push([q(w.id), q(w.type), q(w.name), ...doneFiles.map((f) => (f.present.includes(w.id) ? 1 : 0))].join(','));
    });
    download(lines.join('\n'), `wave-detection-${stamp()}.csv`, 'text/csv');
  };

  /* ------------------------------ helpers ----------------------------- */
  const typeColors = (type) => ({
    background: colors.Wave[type],
    borderColor: colors.Label[type],
    color: colors.Label[type],
  });

  const columnScore = (f) => {
    if (f.status === 'queued') return <span className="dt-score muted">waiting</span>;
    if (f.status === 'working') {
      const secs = f.startedAt ? Math.max(0, Math.round((now - f.startedAt) / 1000)) : 0;
      return <span className="dt-score working">{f.message || 'reading…'} {f.message && f.message.startsWith('limit') ? '' : `${secs}s`}</span>;
    }
    if (f.status === 'error') return <span className="dt-score bad" title={f.message}>error</span>;
    const stat = analysis.perFile[f.name];
    if (!stat) return <span className="dt-score">{f.present.length} waves</span>;
    if (stat.fp === 0 && stat.fn === 0) return <span className="dt-score good">{stat.correct}/{WAVES.length} ✓</span>;
    return (
      <span className="dt-score bad">
        {stat.fn > 0 ? `−${stat.fn} missed` : ''}{stat.fn > 0 && stat.fp > 0 ? ' ' : ''}{stat.fp > 0 ? `+${stat.fp} extra` : ''}
      </span>
    );
  };

  const renderCell = (f, wave) => {
    if (f.status !== 'done') return <td key={f.name} className="dt-cell" />;
    const found = f.present.includes(wave.id);
    const maybe = !found && f.uncertain.includes(wave.id);
    const stat = analysis.perFile[f.name];
    const expected = stat ? stat.truth.includes(wave.id) : null;
    let state = '';
    let mark = '';
    if (stat && found && !expected) { state = 'fp'; mark = '+'; }
    else if (stat && !found && expected) { state = 'fn'; mark = '−'; }
    else if (maybe) { state = 'maybe'; mark = '?'; }
    const title = `${wave.name} · ${f.label}: ${found ? 'detected' : (maybe ? 'uncertain' : 'not detected')}${stat ? ` · reference: ${expected ? 'yes' : 'no'}` : ''}`;
    return (
      <td key={f.name} className="dt-cell" title={title}>
        <span
          className={`dt-dot${found ? ' on' : ''}${state ? ` ${state}` : ''}`}
          style={found ? { ...typeColors(wave.type), '--err': colors.Selection } : { '--err': colors.Selection }}
        >
          {mark}
        </span>
      </td>
    );
  };

  /* ------------------------------- view ------------------------------- */
  const canRun = !running && files.some((f) => f.status !== 'done');

  return (
    <div className="dt-page">
      <style type="text/css">
        {`@font-face { font-family: 'Manrope'; font-weight: 400; src: url(data:font/ttf;base64,${encodedFonts['Manrope-400']}) format('truetype'); }
          @font-face { font-family: 'Manrope'; font-weight: 600; src: url(data:font/ttf;base64,${encodedFonts['Manrope-600']}) format('truetype'); }
          @font-face { font-family: 'Manrope'; font-weight: 800; src: url(data:font/ttf;base64,${encodedFonts['Manrope-800']}) format('truetype'); }`}
      </style>

      <Link to="/home" className="dt-home" aria-label="Back to home">&larr; Home</Link>

      {/* ------------------------------ Controls ------------------------------ */}
      <div className="dt-side">
        <h1 className="dt-title">Wave detection test</h1>
        <p className="dt-lead">Checks how well Gemini finds the waves on photos of your maps, against the six reference maps.</p>

        <div className="dt-step">
          <label className="dt-label" htmlFor="dt-key">1 · Gemini API key</label>
          <input
            id="dt-key"
            className="dt-input"
            type="password"
            autoComplete="off"
            spellCheck="false"
            placeholder="Paste your free key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={running}
          />
          <p className="dt-note">
            Free at <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">aistudio.google.com/apikey</a>.
            It stays in this tab only and is never saved. Photos are sent to Google.
          </p>
        </div>

        <div className="dt-step">
          <label className="dt-label" htmlFor="dt-model">2 · Model</label>
          <input
            id="dt-model"
            className="dt-input"
            list="dt-models"
            spellCheck="false"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={running}
          />
          <datalist id="dt-models">
            {MODEL_SUGGESTIONS.map((m) => <option key={m} value={m} />)}
          </datalist>
          <p className="dt-note">Google renames its models often. If you get "model not found", try another one from the list.</p>
        </div>

        <div className="dt-step">
          <label className="dt-check first">
            <input type="checkbox" checked={fast} onChange={(e) => setFast(e.target.checked)} disabled={running} />
            <span>Fast mode (the model thinks less). Untick to compare accuracy; slower.</span>
          </label>
        </div>

        <div className="dt-step">
          <span className="dt-label">3 · Photos</span>
          <div className="dt-row">
            <label className={`dt-pill${running ? ' disabled' : ''}`}>
              Choose photos
              <input type="file" accept="image/*,.heic,.heif" multiple onChange={onPick} disabled={running} hidden />
            </label>
            <label className={`dt-pill${running ? ' disabled' : ''}`}>
              Choose a folder
              <input type="file" webkitdirectory="" directory="" multiple onChange={onPick} disabled={running} hidden />
            </label>
            {files.length > 0 && (
              <button className="dt-link" onClick={clearAll} disabled={running}>clear</button>
            )}
          </div>
          <p className="dt-note">
            {files.length ? `${files.length} photo${files.length === 1 ? '' : 's'} selected. ` : ''}
            Use the <strong>original</strong> photos: AI "enhancers" can change the words on the waves.
          </p>
          <label className="dt-check">
            <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} />
            <span>Compare with the 6 reference maps (files named 01 to 06)</span>
          </label>
        </div>

        <div className="dt-row dt-run">
          {!running ? (
            <button className="dt-pill dark" onClick={run} disabled={!canRun && !!files.length}>Detect waves</button>
          ) : (
            <button className="dt-pill" onClick={stop}>Stop</button>
          )}
        </div>
        {notice && <p className="dt-notice" role="alert">{notice}</p>}
        {runTime !== null && !running && (
          <p className="dt-note">Finished in {runTime}s ({fast ? 'fast' : 'careful'} mode, {model.trim()}).</p>
        )}

        <div className="dt-step dt-export">
          <span className="dt-label">Download what was detected</span>
          <div className="dt-row">
            <button className="dt-pill" onClick={downloadJson} disabled={!doneFiles.length}>.json</button>
            <button className="dt-pill" onClick={downloadCsv} disabled={!doneFiles.length}>.csv (Excel)</button>
          </div>
        </div>
      </div>

      {/* ------------------------------ Results ------------------------------ */}
      <div className="dt-main">
        <div className="dt-summary">
          {totals.files > 0 ? (
            <>
              <div className="dt-metric big">
                <span className="dt-metric-value">{percent}%</span>
                <span className="dt-metric-label">of {totals.cells} cells correct<br />({totals.files} map{totals.files === 1 ? '' : 's'}, {WAVES.length} waves each)</span>
              </div>
              <div className="dt-metric">
                <span className="dt-metric-value">{totals.tp}/{expectedTotal}</span>
                <span className="dt-metric-label">waves found</span>
              </div>
              <div className="dt-metric">
                <span className="dt-metric-value" style={totals.fn ? { color: colors.Selection } : undefined}>{totals.fn}</span>
                <span className="dt-metric-label">missed (−)</span>
              </div>
              <div className="dt-metric">
                <span className="dt-metric-value" style={totals.fp ? { color: colors.Selection } : undefined}>{totals.fp}</span>
                <span className="dt-metric-label">extra (+)<br />{foundTotal} reported</span>
              </div>
              <div className="dt-metric">
                <span className="dt-metric-value">{totals.perfect}/{totals.files}</span>
                <span className="dt-metric-label">maps with no error</span>
              </div>
            </>
          ) : (
            <p className="dt-empty">
              {analysis.doneCount > 0
                ? `${analysis.doneCount} photo${analysis.doneCount === 1 ? '' : 's'} analysed. Accuracy appears here when the file names are 01 to 06 and the comparison box is ticked.`
                : 'Results appear here: one column per photo, one row per wave.'}
            </p>
          )}
        </div>

        <div className="dt-table-wrap">
          {files.length === 0 ? (
            <div className="dt-placeholder">
              <p className="dt-placeholder-title">No photos yet</p>
              <p>Paste your key, then choose the original photos of maps 01–06 (or any set) on the left.</p>
            </div>
          ) : (
            <table className="dt-table">
              <thead>
                <tr>
                  <th className="dt-corner">
                    <span className="dt-legend"><i className="dt-dot on sample" />detected</span>
                    <span className="dt-legend"><i className="dt-dot sample" />not</span>
                    <span className="dt-legend err"><i className="dt-dot fp sample" style={{ '--err': colors.Selection }}>+</i>extra</span>
                    <span className="dt-legend err"><i className="dt-dot fn sample" style={{ '--err': colors.Selection }}>−</i>missed</span>
                    <span className="dt-legend"><i className="dt-dot maybe sample">?</i>unsure</span>
                  </th>
                  {files.map((f) => (
                    <th key={f.name} className="dt-col" title={f.message && f.status === 'error' ? f.message : f.name}>
                      {f.thumb ? <img className="dt-thumb" src={f.thumb} alt="" /> : <span className="dt-thumb empty">no preview</span>}
                      <span className="dt-col-name">{f.label}</span>
                      {columnScore(f)}
                    </th>
                  ))}
                  <th className="dt-sum">found<br />in</th>
                  {analysis.allHaveReference && <th className="dt-sum ref">ref.<br />in</th>}
                </tr>
              </thead>
              <tbody>
                {WAVES.map((w, index) => {
                  const newGroup = index === 0 || WAVES[index - 1].type !== w.type;
                  return (
                    <tr key={w.id} className={newGroup && index > 0 ? 'dt-group-start' : ''}>
                      <th className="dt-rowhead">
                        <span className="dt-tag" style={typeColors(w.type)} />
                        <span className="dt-wave-name">{w.name}</span>
                        <span className="dt-wave-id">{w.id}</span>
                      </th>
                      {files.map((f) => renderCell(f, w))}
                      <td className="dt-sum-cell">{analysis.doneCount ? frequency(w.id) : ''}</td>
                      {analysis.allHaveReference && <td className="dt-sum-cell ref">{referenceFrequency(w.id)}</td>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {files.some((f) => f.status === 'error') && (
            <div className="dt-errors">
              {files.filter((f) => f.status === 'error').map((f) => (
                <p key={f.name}><strong>{f.label}:</strong> {f.message}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetectTestPage;
