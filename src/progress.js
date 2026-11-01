// Power the Island: local progress record.
//
// Nothing here trusts a saved flag. Completion indicators are derived again
// from the saved settings by re-running the science model, so edited or stale
// data cannot mark a mission Demonstrated.

import { GAME_ID, MISSIONS, missionById } from './missions.js';
import { MATERIALS } from './circuit.js';
import { runModel, meetsGoal, isCircuit } from './models.js';

export const STORAGE_KEY = 'scienceLagoon.game.power-the-island.v1';
export const SCHEMA = 1;
export const STEPS = ['brief', 'prediction', 'play', 'evidence', 'explain', 'transfer', 'summary'];
export const MAX_TRIALS = 20;

// One settings shape for every model. Circuits use switches, connectors and
// bulbs; the other models use values keyed by control ID.
export function defaultSettings(layout) {
  const comps = layout.components || [];
  return {
    switches: Object.fromEntries(comps.filter((c) => c.type === 'switch').map((c) => [c.id, c.closed])),
    connectors: Object.fromEntries((layout.connectors || []).map((w) => [w.id, w.material])),
    bulbs: Object.fromEntries(comps.filter((c) => c.type === 'bulb').map((c) => [c.id, layout.initialBulbs?.[c.id] ?? true])),
    values: Object.fromEntries((layout.controls.values || []).map((v) => [v.id, layout.initial?.[v.id] ?? null])),
  };
}

export function freshMission(mission) {
  return {
    missionId: mission.missionId,
    contentVersion: mission.contentVersion,
    grade: mission.grade,
    step: 'brief',
    prediction: null,
    play: { settings: defaultSettings(mission.play.layout), closeRepeats: 0, highlight: null },
    trials: [],
    explain: { choice: null, evidenceTrial: null, aloud: false, checked: false, hintLevel: 0, attempts: 0, feedback: null },
    transfer: freshTransfer(mission, 'A'),
    transferHistory: [],
  };
}

export function freshTransfer(mission, variant) {
  const t = mission.transfer.find((x) => x.variant === variant) || mission.transfer[0];
  return {
    variant: t.variant,
    settings: defaultSettings(t.layout),
    trials: [],
    choice: null,
    checked: false,
    hintLevel: 0,
    attempts: 0,
    feedback: null,
  };
}

export function emptyRecord() {
  return {
    schema: SCHEMA,
    gameId: GAME_ID,
    grade: 4,
    prefs: { narration: true, sound: true, reducedMotion: false },
    houses: {},
    missions: {},
    retired: [],
  };
}

// Settings may only change what the layout lists as a control, and only to
// materials the mission supplies. Anything else is rejected, not repaired.
export function settingsAllowed(layout, settings) {
  if (!settings || typeof settings !== 'object') return false;
  const base = defaultSettings(layout);
  const { switches = [], connectors = [], materials = [], bulbs = [], values = [] } = layout.controls;
  for (const key of ['switches', 'connectors', 'bulbs', 'values']) {
    const got = settings[key];
    if (!got || typeof got !== 'object') return false;
    if (Object.keys(got).length !== Object.keys(base[key]).length) return false;
  }
  for (const [id, closed] of Object.entries(settings.switches)) {
    if (!(id in base.switches) || typeof closed !== 'boolean') return false;
    if (!switches.includes(id) && closed !== base.switches[id]) return false;
  }
  for (const [id, m] of Object.entries(settings.connectors)) {
    if (!(id in base.connectors) || !MATERIALS[m]) return false;
    if (m !== base.connectors[id] && (!connectors.includes(id) || !materials.includes(m))) return false;
  }
  for (const [id, present] of Object.entries(settings.bulbs)) {
    if (!(id in base.bulbs) || typeof present !== 'boolean') return false;
    if (!bulbs.includes(id) && present !== true) return false;
  }
  for (const [id, v] of Object.entries(settings.values)) {
    const control = values.find((c) => c.id === id);
    if (!control) return false;
    if (v !== base.values[id] && !control.options.some((o) => o.id === v)) return false;
  }
  return true;
}

export function evaluate(layout, settings) {
  return runModel(layout, settings);
}

export { meetsGoal, isCircuit };

// A trial records a snapshot. Later changes to settings never rewrite it.
export function makeTrial(layout, settings, n) {
  const snapshot = structuredClone(settings);
  const res = evaluate(layout, snapshot);
  const { path, ...result } = res;
  return { n, settings: snapshot, result: { lit: {}, reason: null, ...result } };
}

function cleanTrials(layout, trials) {
  if (!Array.isArray(trials)) return [];
  return trials
    .filter((t) => t && settingsAllowed(layout, t.settings))
    .slice(-MAX_TRIALS)
    .map((t, i) => makeTrial(layout, t.settings, i + 1));
}

const choiceIds = (choices) => new Set((choices || []).map((c) => c.id));

function cleanMission(mission, raw) {
  const rec = freshMission(mission);
  rec.step = STEPS.includes(raw.step) ? raw.step : 'brief';
  if (raw.prediction && choiceIds(mission.prediction.choices).has(raw.prediction.choice)) {
    const reasons = choiceIds(mission.prediction.reasons);
    rec.prediction = { choice: raw.prediction.choice, reason: reasons.has(raw.prediction.reason) ? raw.prediction.reason : null };
  }
  if (settingsAllowed(mission.play.layout, raw.play?.settings)) rec.play.settings = structuredClone(raw.play.settings);
  rec.play.closeRepeats = Number.isInteger(raw.play?.closeRepeats) ? Math.max(0, raw.play.closeRepeats) : 0;
  rec.trials = cleanTrials(mission.play.layout, raw.trials);

  const ex = raw.explain || {};
  rec.explain.choice = choiceIds(mission.explain.choices).has(ex.choice) ? ex.choice : null;
  rec.explain.evidenceTrial = rec.trials.some((t) => t.n === ex.evidenceTrial) ? ex.evidenceTrial : null;
  rec.explain.aloud = ex.aloud === true && mission.explain.allowAloud === true;
  rec.explain.checked = ex.checked === true && (rec.explain.choice !== null || rec.explain.aloud);
  rec.explain.hintLevel = clampInt(ex.hintLevel, 0, 3);
  rec.explain.attempts = clampInt(ex.attempts, 0, 99);

  rec.transfer = cleanTransfer(mission, raw.transfer) || rec.transfer;
  rec.transferHistory = (Array.isArray(raw.transferHistory) ? raw.transferHistory : [])
    .map((h) => cleanTransfer(mission, h))
    .filter(Boolean)
    .slice(-10);
  return rec;
}

function cleanTransfer(mission, raw) {
  if (!raw) return null;
  const spec = mission.transfer.find((x) => x.variant === raw.variant);
  if (!spec) return null;
  const t = freshTransfer(mission, spec.variant);
  if (settingsAllowed(spec.layout, raw.settings)) t.settings = structuredClone(raw.settings);
  t.trials = cleanTrials(spec.layout, raw.trials);
  t.choice = choiceIds(spec.choices).has(raw.choice) ? raw.choice : null;
  t.checked = raw.checked === true && t.choice !== null;
  t.hintLevel = clampInt(raw.hintLevel, 0, 3);
  t.attempts = clampInt(raw.attempts, 0, 99);
  return t;
}

function clampInt(v, lo, hi) {
  return Number.isInteger(v) ? Math.min(hi, Math.max(lo, v)) : lo;
}

// Returns { record, notices }. Notices explain anything that was reset.
export function loadRecord(json) {
  const notices = [];
  let raw;
  try {
    raw = typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return { record: emptyRecord(), notices: ['Saved progress could not be read, so the game started fresh.'] };
  }
  if (!raw || raw.gameId !== GAME_ID || raw.schema !== SCHEMA) {
    if (raw) notices.push('Saved progress was from a different version, so the game started fresh.');
    return { record: emptyRecord(), notices };
  }
  const record = emptyRecord();
  record.grade = Number.isInteger(raw.grade) && raw.grade >= 1 && raw.grade <= 6 ? raw.grade : 4;
  record.prefs = {
    narration: raw.prefs?.narration !== false,
    sound: raw.prefs?.sound !== false,
    reducedMotion: raw.prefs?.reducedMotion === true,
  };
  record.retired = Array.isArray(raw.retired) ? raw.retired.slice(-20) : [];
  for (const [g, h] of Object.entries(raw.houses || {})) {
    if (/^[1-6]$/.test(g) && Number.isInteger(h) && h >= 1 && h <= 10) record.houses[g] = h;
  }
  for (const [id, m] of Object.entries(raw.missions || {})) {
    const mission = missionById(id);
    if (!mission || !m || typeof m !== 'object') {
      record.retired.push({ reason: 'unknown_mission', data: m });
      continue;
    }
    if (m.contentVersion !== mission.contentVersion) {
      record.retired.push({ reason: 'content_changed', data: m });
      notices.push(`“${mission.title}” has new content, so it starts again.`);
      continue;
    }
    record.missions[id] = cleanMission(mission, m);
  }
  return { record, notices };
}

function transferSolved(mission, t) {
  const spec = mission.transfer.find((x) => x.variant === t.variant);
  if (!spec) return false;
  const lit = t.trials.some((tr) => meetsGoal(spec.layout, evaluate(spec.layout, tr.settings)));
  const right = spec.choices.find((c) => c.id === t.choice)?.correct === true;
  return lit && right && t.checked;
}

export function explainCorrect(mission, rec) {
  // Grade 1 may explain aloud to a grown-up. Nothing is recorded; the game
  // only notes that an adult listened.
  if (mission.explain.allowAloud && rec.explain.aloud) return true;
  const choice = mission.explain.choices.find((c) => c.id === rec.explain.choice);
  if (!choice?.correct) return false;
  if (!mission.explain.evidenceQuestion) return true;
  const trial = rec.trials.find((t) => t.n === rec.explain.evidenceTrial);
  return !!trial && mission.explain.evidenceTest({ ...trial, result: evaluate(mission.play.layout, trial.settings) });
}

export function evidenceStatus(mission, rec) {
  const layout = mission.play.layout;
  const trials = rec.trials.map((t) => ({ ...t, result: evaluate(layout, t.settings) }));
  return mission.evidence.requirements.map((req) => ({ ...req, met: requirementMet(req, trials) }));
}

// Three kinds of requirement: one trial that passes `test`, two different
// trials that pass `pair` (a fair comparison or a repeat), or the whole
// set passing `all` (for example, four materials tested).
export function requirementMet(req, trials) {
  if (req.all) return req.all(trials);
  if (req.pair) {
    for (let i = 0; i < trials.length; i++) {
      for (let j = i + 1; j < trials.length; j++) if (req.pair(trials[i], trials[j])) return true;
    }
    return false;
  }
  return trials.some((t) => req.test(t));
}

export function deriveIndicators(mission, rec) {
  if (!rec) return { explored: false, practised: false, demonstrated: false, assisted: false };
  const explored = rec.trials.length > 0;
  const practised = explored && evidenceStatus(mission, rec).every((r) => r.met)
    && rec.explain.checked && explainCorrect(mission, rec);
  const attempts = [...rec.transferHistory, rec.transfer];
  const solved = attempts.filter((t) => transferSolved(mission, t));
  const demonstrated = practised && solved.some((t) => t.hintLevel === 0);
  const assisted = practised && !demonstrated && solved.length > 0;
  return { explored, practised, demonstrated, assisted };
}

// Storage that never throws. If the browser refuses, play continues in memory.
export function openStore(getStorage) {
  let available = true;
  let memory = null;
  let storage = null;
  try {
    storage = getStorage();
    const probe = '__pti_probe__';
    storage.setItem(probe, '1');
    storage.removeItem(probe);
  } catch {
    available = false;
  }
  return {
    get available() { return available; },
    read() {
      if (!available) return memory;
      try { return storage.getItem(STORAGE_KEY); } catch { available = false; return memory; }
    },
    write(record) {
      memory = JSON.stringify(record);
      if (!available) return false;
      try { storage.setItem(STORAGE_KEY, memory); return true; } catch { available = false; return false; }
    },
  };
}

export { MISSIONS };
