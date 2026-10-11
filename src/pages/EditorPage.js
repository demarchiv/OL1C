import React, { useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StateContext } from '../State';
import { encodedFonts } from '../assets/fonts/Fonts.js';
import { EDITOR_MODELS, EDITOR_MODEL_ORDER, EDITOR_DEFAULT_MODEL } from '../data/editorModels';
import '../styles/pages/EditorPage.css';

/* ------------------------------------------------------------------ */
/*  Wave shape: the same outline and label path used in Wave.js        */
/* ------------------------------------------------------------------ */
const WAVE_PATH = "m82.54,14.01c-.44.31-.88.61-1.32.92-.54.38-1.09.77-1.63,1.16-.34.24-.69.48-1.03.72-.55.39-1.1.78-1.65,1.17-.55.38-1.09.76-1.64,1.15-.47.33-.93.66-1.4.99-.43.3-.86.6-1.29.9-.44.31-.89.62-1.34.93-.26.18-.51.35-.77.52-.29.19-.58.38-.88.56-.26.15-.52.29-.78.43-.36.19-.71.4-1.07.58-.62.3-1.24.59-1.87.86-.59.25-1.19.49-1.79.69-.95.31-1.91.63-2.9.83-.37.08-.74.18-1.12.25-.28.06-.57.09-.85.14-.38.06-.77.14-1.15.18-1.17.13-2.35.21-3.53.21-.19,0-.38,0-.57,0-.3,0-.6-.03-.9-.04-.37-.02-.74-.02-1.11-.05-.59-.06-1.18-.13-1.76-.22-.9-.14-1.79-.29-2.67-.52-.55-.14-1.1-.28-1.64-.44-.4-.12-.79-.26-1.19-.4-.34-.12-.68-.22-1.01-.36-.44-.19-.87-.38-1.31-.57-.41-.18-.82-.36-1.23-.54-.62-.27-1.23-.56-1.84-.84-.61-.28-1.21-.56-1.82-.85-.62-.29-1.24-.57-1.85-.85-.6-.28-1.2-.56-1.8-.84-.62-.29-1.25-.57-1.87-.86-.6-.28-1.19-.55-1.79-.83-.61-.28-1.22-.56-1.82-.84-.61-.28-1.21-.57-1.82-.85-.61-.28-1.23-.56-1.84-.84-.62-.28-1.23-.57-1.85-.86-.48-.22-.95-.44-1.43-.65-.36-.16-.73-.3-1.09-.44-.29-.11-.58-.21-.88-.31-.26-.09-.51-.19-.78-.27-.56-.16-1.13-.32-1.7-.45-.45-.11-.9-.19-1.35-.28-.37-.07-.75-.15-1.12-.21-.28-.05-.57-.07-.85-.11-.31-.04-.63-.09-.94-.11-.46-.04-.93-.06-1.39-.08-.34-.02-.68-.02-1.02-.03-.18,0-.36,0-.54,0-.38,0-.75-.01-1.13,0-.61.03-1.22.07-1.83.14-.63.07-1.25.18-1.88.27-.2.03-.4.07-.6.12-.3.06-.6.13-.89.2-.33.07-.65.14-.98.23-.59.16-1.17.35-1.75.51-.27.08-.52-.04-.63-.27-.12-.24-.06-.5.17-.67.29-.21.59-.42.89-.63.34-.24.68-.47,1.01-.7.47-.33.93-.66,1.4-.99.34-.24.68-.47,1.01-.7.55-.39,1.1-.78,1.65-1.17.55-.38,1.09-.76,1.64-1.15.55-.38,1.09-.77,1.63-1.16.55-.39,1.1-.78,1.65-1.16.65-.44,1.29-.88,1.96-1.29.65-.39,1.32-.75,1.99-1.09.55-.28,1.1-.55,1.67-.79,1.36-.56,2.74-1.05,4.16-1.41.55-.14,1.09-.29,1.64-.38,1.04-.18,2.09-.39,3.19-.43.38-.03.81-.1,1.24-.11.79-.01,1.59-.06,2.39,0,.46.03.93.03,1.4.08.64.06,1.27.12,1.9.22.89.14,1.78.29,2.65.53.57.15,1.15.29,1.71.47.75.24,1.49.51,2.23.79.39.15.77.32,1.16.48.1.05.21.09.32.13.63.28,1.26.58,1.89.87.59.27,1.17.54,1.76.81.62.29,1.24.57,1.85.86.52.24,1.03.47,1.55.71.61.28,1.21.57,1.82.85.62.29,1.25.57,1.87.86.6.28,1.19.55,1.79.83.62.29,1.25.57,1.87.86.6.28,1.19.55,1.79.83.62.29,1.25.57,1.87.86.46.22.92.46,1.38.66.63.28,1.26.55,1.89.81.32.13.65.23.98.34.38.13.76.29,1.15.4.62.18,1.24.34,1.86.49.39.1.78.16,1.17.24.3.06.6.13.91.18.54.08,1.09.14,1.63.2.15.02.3.04.44.05.37.02.75.04,1.13.06.26.02.52.04.79.05.42,0,.85-.02,1.27-.01.6,0,1.21-.04,1.81-.09.49-.04.99-.1,1.48-.16.82-.11,1.64-.22,2.45-.43.37-.09.75-.15,1.12-.25.64-.17,1.28-.37,1.93-.55.04-.01.09-.02.14-.02.24.02.42.16.48.37.06.23-.01.45-.22.6Z";
const TEXT_PATH = "m119.67,8.06c-7.54,3.59-12.67,7.32-27.44,8.01-16.45.77-25.71-4.5-32.34-7.85-7.56-3.55-12.7-7.29-27.47-7.91C15.97-.38,6.73,4.93.11,8.31";

// The wave is drawn in its own coordinate system (about 83 x 27 units).
// The app rotates every wave around the point (45, 10), so we do the same.
const WAVE_CENTER = { x: 45, y: 10 };
const WAVE_WIDTH = 82.8;
const FONT_SIZE = 5.6;        // same as Wave.js (0.35em of 16px)
const MAX_LABEL_UNITS = 17;   // longest label that fits on one line

// Ring geometry (SVG units)
const VIEW = 1000;
const CX = VIEW / 2;
const CY = VIEW / 2;
const RING_RADIUS = 410;
const MAX_WAVE_SCALE = 4.2;
const MAX_LABEL_LENGTH = 26;

const labelUnits = (text) => {
  const narrow = (text.match(/I/g) || []).length;
  return text.length - narrow + narrow * 0.5;
};

const splitLabel = (text) => {
  if (labelUnits(text) <= MAX_LABEL_UNITS || !text.includes(' ')) return [text];
  const middle = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === ' ' && (best === -1 || Math.abs(i - middle) < Math.abs(best - middle))) best = i;
  }
  return [text.slice(0, best).trim(), text.slice(best + 1).trim()];
};

const WaveShape = ({ id, label, flipped, fill, textFill, stroke, strokeWidth, dashed }) => {
  const text = (label || '').toUpperCase();
  const lines = splitLabel(text);
  const longest = Math.max(...lines.map(labelUnits));
  const fontSize = FONT_SIZE * Math.min(1, MAX_LABEL_UNITS / Math.max(longest, 1));
  const textTransform = flipped ? 'rotate(180) translate(-83, -26.5)' : undefined;
  const spacing = longest > 10 ? '0.06em' : '0.15em';
  const dys = lines.length === 1 ? ['0.35em'] : ['-0.13em', '0.73em'];

  return (
    <>
      <path
        d={WAVE_PATH}
        fill={fill}
        stroke={stroke || 'none'}
        strokeWidth={strokeWidth || 0}
        strokeDasharray={dashed ? '2.5 1.8' : undefined}
      />
      <defs>
        <path id={`ed-tp-${id}`} d={TEXT_PATH} transform="translate(0, 8) rotate(-0.5) scale(0.7)" />
      </defs>
      {lines.map((line, i) => (
        <text
          key={i}
          fill={textFill}
          fontFamily="Manrope"
          fontWeight="600"
          fontSize={fontSize}
          letterSpacing={spacing}
          dy={dys[i]}
          transform={textTransform}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <textPath href={`#ed-tp-${id}`} startOffset="50%" textAnchor="middle">{line}</textPath>
        </text>
      ))}
    </>
  );
};

const PencilIcon = ({ x, y, selected, onActivate, label }) => (
  <g
    transform={`translate(${x} ${y})`}
    className={`ed-icon-button${selected ? ' selected' : ''}`}
    role="button"
    tabIndex={0}
    aria-label={label}
    onClick={(e) => { e.stopPropagation(); onActivate(); }}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
  >
    <circle r="19" className="ed-icon-circle" />
    <g transform="rotate(45) scale(1.15)" className="ed-icon-glyph">
      <rect x="-2.6" y="-9" width="5.2" height="12" rx="0.7" />
      <path d="M-2.6 3.6 L0 8.6 L2.6 3.6 Z" />
    </g>
  </g>
);

const PlusIcon = ({ x, y, onActivate, label }) => (
  <g
    transform={`translate(${x} ${y})`}
    className="ed-icon-button plus"
    role="button"
    tabIndex={0}
    aria-label={label}
    onClick={(e) => { e.stopPropagation(); onActivate(); }}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onActivate(); } }}
  >
    <circle r="19" className="ed-icon-circle plus" />
    <rect x="-9" y="-2.6" width="18" height="5.2" rx="1" className="ed-icon-glyph" />
    <rect x="-2.6" y="-9" width="5.2" height="18" rx="1" className="ed-icon-glyph" />
  </g>
);

/* ------------------------------------------------------------------ */
/*  Helpers for the record of edits                                    */
/* ------------------------------------------------------------------ */
const nowISO = () => new Date().toISOString();

const buildElements = (modelKey, nextUid) =>
  EDITOR_MODELS[modelKey].dimensions.map((d) => ({
    uid: nextUid(),
    label: d.label,
    originalLabel: d.label,
    sources: [d.id],          // IDs of the original dimension(s) this one comes from
    isNew: false,
    status: 'active',         // 'active' (on the ring) or 'aside'
  }));

const relationOf = (el) => {
  if (el.isNew || el.sources.length === 0) return 'new';
  return el.label.trim().toUpperCase() === el.originalLabel.trim().toUpperCase() ? 'unchanged' : 'renamed';
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
const EditorPage = () => {
  const { colors } = useContext(StateContext);

  const uidCounter = useRef(0);
  const logSeq = useRef(0);
  const nextUid = useCallback(() => `w${++uidCounter.current}`, []);

  const [modelKey, setModelKey] = useState(EDITOR_DEFAULT_MODEL);
  const [elements, setElements] = useState(() => buildElements(EDITOR_DEFAULT_MODEL, nextUid));
  const [deleted, setDeleted] = useState([]);
  const [log, setLog] = useState(() => [{
    seq: ++logSeq.current, time: nowISO(), action: 'start_model', model: EDITOR_DEFAULT_MODEL,
  }]);
  const [startedAt, setStartedAt] = useState(nowISO());

  const [selectedUid, setSelectedUid] = useState(null);
  const [panelMode, setPanelMode] = useState(null);       // null | 'rename' | 'move'
  const [draft, setDraft] = useState('');
  const [confirm, setConfirm] = useState(null);           // null | 'delete' | { model }

  const active = elements.filter((e) => e.status === 'active');
  const aside = elements.filter((e) => e.status === 'aside');
  const selected = elements.find((e) => e.uid === selectedUid && e.status === 'active') || null;

  const waveFill = colors['Wave']['Dimension'];
  const labelFill = colors['Label']['Dimension'];
  const selectionColor = colors['Selection'];

  const record = useCallback((action, el, detail) => {
    setLog((prev) => [...prev, {
      seq: ++logSeq.current,
      time: nowISO(),
      action,
      uid: el ? el.uid : undefined,
      label: el ? el.label : undefined,
      sources: el ? el.sources : undefined,
      ...detail,
    }]);
  }, []);

  const select = (uid) => {
    setSelectedUid(uid);
    setPanelMode(null);
    setConfirm(null);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') { setSelectedUid(null); setPanelMode(null); setConfirm(null); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /* ------------------------------ actions ------------------------------ */
  const startRename = () => {
    if (!selected) return;
    setDraft(selected.label);
    setPanelMode('rename');
    setConfirm(null);
  };

  const saveRename = () => {
    const value = draft.trim().slice(0, MAX_LABEL_LENGTH);
    if (!selected || !value) return;
    if (value !== selected.label) {
      setElements((prev) => prev.map((e) => (e.uid === selected.uid ? { ...e, label: value } : e)));
      record('rename', selected, { from: selected.label, to: value });
    }
    setPanelMode(null);
  };

  const putAside = () => {
    if (!selected) return;
    setElements((prev) => prev.map((e) => (e.uid === selected.uid ? { ...e, status: 'aside' } : e)));
    record('put_aside', selected);
    setSelectedUid(null);
    setPanelMode(null);
  };

  const restore = (uid) => {
    const el = elements.find((e) => e.uid === uid);
    if (!el) return;
    setElements((prev) => prev.map((e) => (e.uid === uid ? { ...e, status: 'active' } : e)));
    record('restore', el);
    setSelectedUid(uid);
    setPanelMode(null);
  };

  const deleteSelected = () => {
    if (!selected) return;
    setElements((prev) => prev.filter((e) => e.uid !== selected.uid));
    setDeleted((prev) => [...prev, { ...selected, deletedAt: nowISO() }]);
    record('delete', selected);
    setSelectedUid(null);
    setPanelMode(null);
    setConfirm(null);
  };

  const move = (direction) => {
    if (!selected || active.length < 2) return;
    const activeIdx = active.findIndex((e) => e.uid === selected.uid);
    const other = active[(activeIdx + direction + active.length) % active.length];
    setElements((prev) => {
      const copy = [...prev];
      const i = copy.findIndex((e) => e.uid === selected.uid);
      const j = copy.findIndex((e) => e.uid === other.uid);
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
    record('move', selected, {
      direction: direction > 0 ? 'clockwise' : 'counterclockwise',
      swapped_with: other.uid,
      from_position: activeIdx + 1,
      to_position: ((activeIdx + direction + active.length) % active.length) + 1,
    });
  };

  // Add a new wave after the active wave with index `afterActiveIndex` (-1 = at the start)
  const addAfter = (afterActiveIndex) => {
    const uid = nextUid();
    const newEl = {
      uid, label: 'NEW DIMENSION', originalLabel: 'NEW DIMENSION',
      sources: [], isNew: true, status: 'active',
    };
    setElements((prev) => {
      if (active.length === 0 || afterActiveIndex < 0) {
        return [newEl, ...prev];
      }
      const anchor = active[afterActiveIndex];
      const idx = prev.findIndex((e) => e.uid === anchor.uid);
      const copy = [...prev];
      copy.splice(idx + 1, 0, newEl);
      return copy;
    });
    record('add', newEl, {
      after: afterActiveIndex >= 0 && active[afterActiveIndex] ? active[afterActiveIndex].uid : null,
    });
    setSelectedUid(uid);
    setDraft('');
    setPanelMode('rename');
    setConfirm(null);
  };

  const hasEdits = log.length > 1;

  const loadModel = (key) => {
    uidCounter.current = 0;
    logSeq.current = 0;
    setModelKey(key);
    setElements(buildElements(key, nextUid));
    setDeleted([]);
    setLog([{ seq: ++logSeq.current, time: nowISO(), action: 'start_model', model: key }]);
    setStartedAt(nowISO());
    setSelectedUid(null);
    setPanelMode(null);
    setConfirm(null);
  };

  const chooseModel = (key) => {
    if (key === modelKey && !hasEdits) return;
    if (hasEdits) setConfirm({ model: key });
    else loadModel(key);
  };

  const downloadRecord = () => {
    const model = EDITOR_MODELS[modelKey];
    const describe = (e, i) => ({
      position: i === undefined ? undefined : i + 1,
      uid: e.uid,
      label: e.label,
      original_label: e.isNew ? null : e.originalLabel,
      built_on: e.sources,
      relation_to_starting_model: relationOf(e),
    });
    const payload = {
      tool: 'OL1C Ocean Literacy Dimensions Editor',
      format_version: 1,
      starting_model: { key: model.key, name: model.name, cite: model.cite },
      started_at: startedAt,
      exported_at: nowISO(),
      final_dimensions: active.map(describe),
      set_aside: aside.map((e) => describe(e)),
      deleted: deleted.map((e) => ({ ...describe(e), deleted_at: e.deletedAt })),
      log,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ol-dimensions-edits-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /* ------------------------------ geometry ----------------------------- */
  const n = active.length;
  const step = n > 0 ? (2 * Math.PI) / n : 0;
  const waveScale = n > 0 ? Math.min(MAX_WAVE_SCALE, ((2 * Math.PI * RING_RADIUS) / n) * 0.97 / WAVE_WIDTH) : MAX_WAVE_SCALE;
  const waveHalfThickness = 13.6 * waveScale;

  const polar = (angle, radius) => ({ x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) });

  /* ------------------------------ details ------------------------------ */
  const sourceInfo = (selected ? selected.sources : []).map((id) => {
    for (const key of EDITOR_MODEL_ORDER) {
      const found = EDITOR_MODELS[key].dimensions.find((d) => d.id === id);
      if (found) {
        return {
          id,
          name: found.name,
          description: found.description,
          cite: found.descriptionSource || EDITOR_MODELS[key].cite,
        };
      }
    }
    return { id, name: id, description: null, cite: '' };
  });

  const selectedFlipped = true;   // the preview is drawn like a wave at the top of the ring

  return (
    <div className="ed-page">
      <style type="text/css">
        {`@font-face { font-family: 'Manrope'; font-weight: 600; src: url(data:font/ttf;base64,${encodedFonts['Manrope-600']}) format('truetype'); }`}
      </style>

      <Link to="/home" className="ed-home" aria-label="Back to home">&larr; Home</Link>

      {/* ------------------------------ Ring ------------------------------ */}
      <div className="ed-ring" onClick={() => select(null)}>
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} role="group" aria-label="Ocean Literacy Dimensions">
          <text x={CX} y={CY - 52} textAnchor="middle" className="ed-center-title">Ocean Literacy</text>
          <text x={CX} y={CY + 4} textAnchor="middle" className="ed-center-title">Dimensions</text>
          <text x={CX} y={CY + 64} textAnchor="middle" className="ed-center-title strong">EDITOR</text>

          {active.map((el, i) => {
            const theta = -Math.PI / 2 + i * step;
            const rotation = (i * step * 180) / Math.PI;
            const { x, y } = polar(theta, RING_RADIUS);
            const cosR = Math.cos((rotation * Math.PI) / 180);
            const flipped = cosR > 0.001;          // upper half of the ring
            const isSelected = selectedUid === el.uid;
            return (
              <g
                key={el.uid}
                transform={`translate(${x} ${y}) rotate(${rotation}) scale(${waveScale}) translate(${-WAVE_CENTER.x} ${-WAVE_CENTER.y})`}
                className={`ed-wave${isSelected ? ' selected' : ''}`}
                onClick={(e) => { e.stopPropagation(); select(el.uid); }}
              >
                <WaveShape
                  id={el.uid}
                  label={el.label}
                  flipped={flipped}
                  fill={waveFill}
                  textFill={labelFill}
                  stroke={isSelected ? selectionColor : (el.isNew ? labelFill : undefined)}
                  strokeWidth={isSelected ? 1.2 : (el.isNew ? 0.6 : 0)}
                  dashed={el.isNew && !isSelected}
                />
              </g>
            );
          })}

          {/* Plus buttons between waves */}
          {n > 0 && active.map((el, i) => {
            const theta = -Math.PI / 2 + (i + 0.5) * step;
            const { x, y } = polar(theta, RING_RADIUS + 4);
            return <PlusIcon key={`plus-${el.uid}`} x={x} y={y} label="Add a new dimension here" onActivate={() => addAfter(i)} />;
          })}
          {n === 0 && (
            <PlusIcon x={CX} y={CY - RING_RADIUS} label="Add a new dimension" onActivate={() => addAfter(-1)} />
          )}

          {/* Pencil buttons */}
          {active.map((el, i) => {
            const theta = -Math.PI / 2 + (i - 0.4) * step;
            const { x, y } = polar(theta, RING_RADIUS + waveHalfThickness * 0.95 + 4);
            return (
              <PencilIcon
                key={`pencil-${el.uid}`}
                x={x}
                y={y}
                selected={selectedUid === el.uid}
                label={`Edit ${el.label}`}
                onActivate={() => select(el.uid)}
              />
            );
          })}
        </svg>
      </div>

      {/* ------------------------------ Panel ----------------------------- */}
      <div className="ed-panel">
        <div className="ed-card">
          {!selected && (
            <div className="ed-hint">
              <p className="ed-hint-title">Edit the dimensions</p>
              <p>Click the pencil on a wave to edit it, or click a <strong>+</strong> between two waves to add a new one.</p>
              <p className="ed-hint-small">Press Esc to deselect.</p>
            </div>
          )}

          {selected && (
            <>
              <svg className="ed-preview" viewBox="-6 -3 96 34" aria-hidden="true">
                <WaveShape
                  id="preview"
                  label={selected.label}
                  flipped={selectedFlipped}
                  fill={waveFill}
                  textFill={labelFill}
                  stroke={selected.isNew ? labelFill : undefined}
                  strokeWidth={selected.isNew ? 0.6 : 0}
                  dashed={selected.isNew}
                />
              </svg>

              {panelMode === 'rename' ? (
                <div className="ed-rename">
                  <label htmlFor="ed-rename-input">New name</label>
                  <input
                    id="ed-rename-input"
                    autoFocus
                    value={draft}
                    maxLength={MAX_LABEL_LENGTH}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') saveRename(); }}
                  />
                  <div className="ed-row">
                    <button className="ed-pill dark" onClick={saveRename} disabled={!draft.trim()}>Save</button>
                    <button className="ed-pill" onClick={() => setPanelMode(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <ul className="ed-actions">
                  <li><button onClick={startRename}>rename</button></li>
                  <li><button onClick={putAside}>put aside</button></li>
                  <li>
                    <button onClick={() => setPanelMode(panelMode === 'move' ? null : 'move')}>change position</button>
                    {panelMode === 'move' && (
                      <div className="ed-row ed-move">
                        <button className="ed-pill" onClick={() => move(-1)} disabled={n < 2}>&larr; counterclockwise</button>
                        <button className="ed-pill" onClick={() => move(1)} disabled={n < 2}>clockwise &rarr;</button>
                      </div>
                    )}
                  </li>
                  <li>
                    {confirm === 'delete' ? (
                      <div className="ed-confirm">
                        <span>Delete this wave?</span>
                        <div className="ed-row">
                          <button className="ed-pill dark" onClick={deleteSelected}>Yes, delete</button>
                          <button className="ed-pill" onClick={() => setConfirm(null)}>Keep</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setConfirm('delete')}>delete</button>
                    )}
                  </li>
                  <li className="ed-soon">combine &middot; split &middot; group with<span>coming soon</span></li>
                </ul>
              )}

              {panelMode !== 'rename' && (
                <div className="ed-source">
                  {sourceInfo.length === 0 && <p className="ed-source-note">New dimension, not built on an existing one.</p>}
                  {sourceInfo.map((s) => (
                    <p key={s.id} className="ed-source-note">
                      <strong>{s.id} &middot; {s.name}.</strong>{' '}
                      {s.description ? <>{s.description} <em>({s.cite})</em></> : <em>No description available yet.</em>}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {aside.length > 0 && (
          <div className="ed-aside">
            <p className="ed-section-title">Set aside</p>
            <div className="ed-chips">
              {aside.map((el) => (
                <button key={el.uid} className="ed-chip" onClick={() => restore(el.uid)} title="Put back on the ring">
                  {el.label.toUpperCase()} <span>&#8634;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="ed-bottom">
          {confirm && confirm.model && (
            <div className="ed-confirm box">
              <span>Starting from another model will discard your current edits.</span>
              <div className="ed-row">
                <button className="ed-pill dark" onClick={() => loadModel(confirm.model)}>Start over</button>
                <button className="ed-pill" onClick={() => setConfirm(null)}>Cancel</button>
              </div>
            </div>
          )}

          <button className="ed-download" onClick={downloadRecord}>Download my edits (.json)</button>

          <p className="ed-section-title">STARTING VERSION:</p>
          {EDITOR_MODEL_ORDER.map((key) => {
            const m = EDITOR_MODELS[key];
            return (
              <button
                key={key}
                className={`ed-model${key === modelKey ? ' current' : ''}`}
                onClick={() => chooseModel(key)}
              >
                <span>{m.dimensions.length}-DIMENSIONS MODEL</span>
                <small>({m.cite})</small>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
