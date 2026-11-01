import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateCircuit, runRule } from '../src/circuit.js';
import { runModel, meetsGoal } from '../src/models.js';
import { missionById, MISSIONS, GAME_ID } from '../src/missions.js';
import { planFor } from '../src/house.js';
import {
  loadRecord, freshMission, makeTrial, deriveIndicators, defaultSettings,
  settingsAllowed, openStore, SCHEMA, requirementMet,
} from '../src/progress.js';

const g4 = missionById('power-g4-03');
const g1 = missionById('power-g1-02');
const bench = g4.play.layout;
const board = g4.transfer.find((t) => t.variant === 'A').layout;

const run = (layout, changes = {}) => {
  const s = defaultSettings(layout);
  for (const k of ['switches', 'connectors', 'bulbs', 'values']) Object.assign(s[k], changes[k]);
  return runModel(layout, s);
};

// A generic single loop: battery, switch, n bulbs, metal wires between each part.
function seriesLoop(bulbCount, { switchClosed = true, materials = {} } = {}) {
  const parts = [{ id: 'sw', type: 'switch', closed: switchClosed }];
  for (let i = 1; i <= bulbCount; i++) parts.push({ id: `b${i}`, type: 'bulb' });
  const terminals = ['bat+', 'bat-'];
  const components = [{ id: 'cell', type: 'battery', terminals: ['bat+', 'bat-'] }];
  for (const p of parts) {
    terminals.push(`${p.id}.a`, `${p.id}.b`);
    components.push({ ...p, terminals: [`${p.id}.a`, `${p.id}.b`] });
  }
  const chain = ['bat+', ...parts.flatMap((p) => [`${p.id}.a`, `${p.id}.b`]), 'bat-'];
  const connectors = [];
  for (let i = 0; i < chain.length; i += 2) {
    const id = `w${i / 2}`;
    connectors.push({ id, from: chain[i], to: chain[i + 1], material: materials[id] || 'metal' });
  }
  return { terminals, components, connectors };
}

// Every settings combination a learner could reach with the mission's controls.
function* everySetting(layout) {
  const base = defaultSettings(layout);
  const c = layout.controls;
  const axes = [];
  for (const id of c.switches || []) axes.push(['switches', id, [true, false]]);
  for (const id of c.connectors || []) axes.push(['connectors', id, [...new Set([base.connectors[id], ...c.materials])]]);
  for (const id of c.bulbs || []) axes.push(['bulbs', id, [true, false]]);
  for (const v of c.values || []) axes.push(['values', v.id, v.options.map((o) => o.id)]);
  function* walk(i, s) {
    if (i === axes.length) { yield structuredClone(s); return; }
    const [k, id, opts] = axes[i];
    for (const o of opts) { s[k][id] = o; yield* walk(i + 1, s); }
  }
  yield* walk(0, structuredClone(base));
}

// Each setting twice: learners can repeat a test, and some evidence asks for that.
const reachableTrials = (layout) => [...everySetting(layout), ...everySetting(layout)].map((s, i) => makeTrial(layout, s, i + 1));

test('acceptance: a visual wire crossing is not an electrical connection', () => {
  const filled = run(board, { connectors: { tC: 'metal' } });
  assert.equal(filled.status, 'closed');
  assert.equal(filled.lit.boardBulb, true);
  const gap = run(board);
  assert.equal(gap.status, 'open');
  assert.equal(gap.lit.boardBulb, false);
  const moved = structuredClone(board);
  moved.draw.routes.tB = [[230, 60], [230, 205]];
  assert.deepEqual(run(moved), gap);
});

test('acceptance: a closed switch plus a plastic connector leaves the bulb off', () => {
  for (const id of ['wA', 'wB', 'wC']) {
    const all = { wA: 'metal', wB: 'metal', wC: 'metal', [id]: 'plastic' };
    const res = run(bench, { switches: { sw: true }, connectors: all });
    assert.equal(res.lit.bulb, false, `plastic at ${id}`);
    assert.equal(res.status, 'open');
  }
});

test('acceptance: a break anywhere in a series loop turns all its bulbs off', () => {
  const loop = seriesLoop(3);
  assert.deepEqual(evaluateCircuit(loop).lit, { b1: true, b2: true, b3: true });
  for (const w of loop.connectors) {
    for (const material of ['missing', 'plastic']) {
      const res = evaluateCircuit(seriesLoop(3, { materials: { [w.id]: material } }));
      assert.deepEqual(res.lit, { b1: false, b2: false, b3: false }, `${material} at ${w.id}`);
    }
  }
  // A bulb taken out of its holder is a break too.
  const out = seriesLoop(3);
  out.components.find((c) => c.id === 'b2').removed = true;
  assert.deepEqual(evaluateCircuit(out).lit, { b1: false, b2: false, b3: false });
});

test('acceptance: night-time solar cannot succeed with only an unlit panel', () => {
  for (const site of ['sunny', 'shaded']) {
    for (const weather of ['clear', 'cloudy']) {
      const r = runModel({ rule: 'solar', initial: {} }, { values: { site, weather, time: 'night', storage: 'none' } });
      assert.equal(r.panel, 'none');
      assert.equal(r.lamp, 'off', `${site}/${weather}`);
    }
  }
  // And no night-time solar mission can be completed without storage.
  for (const m of MISSIONS) {
    for (const layout of [m.play.layout, ...m.transfer.map((t) => t.layout)]) {
      if (layout.rule !== 'solar') continue;
      for (const s of everySetting(layout)) {
        const v = { ...layout.initial, ...s.values };
        if (v.time === 'night' && v.storage === 'none') {
          assert.equal(runModel(layout, s).lamp, 'off', m.missionId);
        }
      }
    }
  }
});

test('unsupported layouts are refused, not guessed', () => {
  const short = seriesLoop(1);
  short.connectors.push({ id: 'jump', from: 'bat+', to: 'bat-', material: 'metal' });
  assert.equal(evaluateCircuit(short).status, 'unsupported');
  const branch = seriesLoop(1);
  branch.terminals.push('x');
  branch.connectors.push({ id: 'extra', from: 'b1.a', to: 'x', material: 'metal' });
  assert.equal(evaluateCircuit(branch).reason, 'parallel_networks');
  const mains = seriesLoop(1);
  mains.components.push({ id: 'plug', type: 'mains', terminals: ['bat+', 'bat-'] });
  assert.equal(evaluateCircuit(mains).reason, 'mains');
});

test('a missing rule returns unavailable', () => {
  assert.equal(runRule('two_loop_brightness', seriesLoop(1)).status, 'unavailable');
  const r = runModel({ rule: 'tides', controls: {} }, defaultSettings({ controls: {} }));
  assert.equal(r.status, 'unavailable');
  assert.equal(meetsGoal({ rule: 'tides' }, r), false);
});

test('light model: a card blocks light, glass lets it through, no source means nothing seen', () => {
  const L = { rule: 'light', initial: {} };
  assert.equal(runModel(L, { values: { torch: 'off' } }).seen, false);
  assert.equal(runModel(L, { values: { torch: 'on', blocker: 'card' } }).shadow, true);
  assert.equal(runModel(L, { values: { torch: 'on', blocker: 'glass' } }).seen, true);
  assert.equal(runModel(L, { values: { torch: 'on', holes: 'not' } }).seen, false);
});

test('settings outside the mission controls are rejected', () => {
  const s = defaultSettings(g1.play.layout);
  assert.ok(settingsAllowed(g1.play.layout, s));
  s.connectors.wA = 'plastic';
  assert.equal(settingsAllowed(g1.play.layout, s), false);
  const t = defaultSettings(bench);
  t.connectors.wA = 'missing';
  assert.equal(settingsAllowed(bench, t), false);
  const sol = missionById('power-g5-02').play.layout;
  const u = defaultSettings(sol);
  u.values.storage = 'nuclear';
  assert.equal(settingsAllowed(sol, u), false);
});

test('a trial is a snapshot: later setting changes do not rewrite it', () => {
  const s = defaultSettings(bench);
  s.connectors.wC = 'metal';
  const trial = makeTrial(bench, s, 1);
  s.connectors.wC = 'plastic';
  assert.equal(trial.settings.connectors.wC, 'metal');
  assert.equal(trial.result.lit.bulb, true);
});

function completedRecord({ transferHints = 0 } = {}) {
  const rec = freshMission(g4);
  const lit = defaultSettings(bench);
  lit.connectors.wC = 'metal';
  const plastic = structuredClone(lit);
  plastic.connectors.wB = 'plastic';
  rec.trials = [makeTrial(bench, lit, 1), makeTrial(bench, plastic, 2)];
  rec.explain.choice = 'loop';
  rec.explain.evidenceTrial = 2;
  rec.explain.checked = true;
  const fixed = defaultSettings(board);
  fixed.connectors.tC = 'metal';
  rec.transfer.trials = [makeTrial(board, fixed, 1)];
  rec.transfer.choice = 'loop';
  rec.transfer.checked = true;
  rec.transfer.hintLevel = transferHints;
  return rec;
}

test('indicators: independent transfer demonstrates, hinted transfer is assisted', () => {
  assert.deepEqual(deriveIndicators(g4, completedRecord()), { explored: true, practised: true, demonstrated: true, assisted: false });
  assert.deepEqual(deriveIndicators(g4, completedRecord({ transferHints: 2 })), { explored: true, practised: true, demonstrated: false, assisted: true });
});

test('tampered saved data cannot bypass completion rules', () => {
  const rec = completedRecord();
  rec.transfer.trials = [{ n: 1, settings: defaultSettings(board), result: { status: 'closed', lit: { boardBulb: true } } }];
  rec.demonstrated = true;
  const saved = { schema: SCHEMA, gameId: GAME_ID, grade: 4, missions: { [g4.missionId]: rec } };
  const { record } = loadRecord(JSON.stringify(saved));
  assert.equal(deriveIndicators(g4, record.missions[g4.missionId]).demonstrated, false);
  assert.equal(record.missions[g4.missionId].transfer.trials[0].result.lit.boardBulb, false);

  const rec2 = completedRecord();
  rec2.transfer.trials[0].settings.connectors.tA = 'missing';
  const loaded = loadRecord({ ...saved, missions: { [g4.missionId]: rec2 } }).record;
  assert.equal(loaded.missions[g4.missionId].transfer.trials.length, 0);
});

test('stale content versions are retired with a notice', () => {
  const rec = completedRecord();
  rec.contentVersion = g4.contentVersion - 1;
  const { record, notices } = loadRecord({ schema: SCHEMA, gameId: GAME_ID, grade: 4, missions: { [g4.missionId]: rec } });
  assert.equal(record.missions[g4.missionId], undefined);
  assert.equal(record.retired[0].reason, 'content_changed');
  assert.equal(notices.length, 1);
});

test('choices that no longer exist reopen safely', () => {
  const rec = completedRecord();
  rec.prediction = { choice: 'maybe-later', reason: 'gone' };
  rec.step = 'not-a-step';
  const { record } = loadRecord({ schema: SCHEMA, gameId: GAME_ID, grade: 4, missions: { [g4.missionId]: rec } });
  assert.equal(record.missions[g4.missionId].prediction, null);
  assert.equal(record.missions[g4.missionId].step, 'brief');
});

test('broken JSON and missing storage do not throw', () => {
  assert.equal(loadRecord('{nope').notices.length, 1);
  const store = openStore(() => { throw new Error('blocked'); });
  assert.equal(store.available, false);
  assert.equal(store.write({ a: 1 }), false);
  assert.equal(store.read(), '{"a":1}');
});

test('every grade has ten houses of ten missions with stable, unique IDs', () => {
  const ids = new Set(MISSIONS.map((m) => m.missionId));
  assert.equal(MISSIONS.length, 600);
  assert.equal(ids.size, 600);
  for (let g = 1; g <= 6; g++) {
    for (let h = 1; h <= 10; h++) {
      const nums = MISSIONS.filter((m) => m.grade === g && m.house === h).map((m) => m.number).sort((a, b) => a - b);
      assert.deepEqual(nums, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], `grade ${g} house ${h}`);
    }
  }
  assert.ok(ids.has('power-g1-02') && ids.has('power-g4-03'), 'original IDs kept');
});

test('every mission is unique: no repeated titles or content', () => {
  const titles = new Set(MISSIONS.map((m) => m.title));
  assert.equal(titles.size, MISSIONS.length, 'titles');
  const strip = (x) => JSON.stringify(x, (k, v) => (k === 'draw' || typeof v === 'function' ? undefined : v));
  const prints = new Set(MISSIONS.map((m) => strip([m.brief.text, m.play.layout, m.prediction.question,
    m.explain.question, m.explain.choices.map((c) => c.label), m.transfer.map((t) => [t.text, t.layout])])));
  assert.equal(prints.size, MISSIONS.length, 'content');
});

test('every house has its own valid floor plan', () => {
  for (let g = 1; g <= 6; g++) {
    const seen = new Set();
    for (let h = 1; h <= 10; h++) {
      const plan = planFor(g, h);
      const rooms = plan.flat();
      assert.deepEqual(rooms.map((r) => r[0]).sort((a, b) => a - b), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], `g${g} h${h} missions`);
      assert.equal(new Set(rooms.map((r) => r[1])).size, 10, `g${g} h${h} room types unique`);
      for (const floor of plan) assert.equal(floor.reduce((a, r) => a + r[2], 0), 6, `g${g} h${h} widths`);
      assert.ok(!plan.slice(1).flat().some((r) => ['attic', 'terrace'].includes(r[1])), 'attics and terraces upstairs');
      assert.ok(!plan.slice(0, -1).flat().some((r) => ['porch', 'boatshed'].includes(r[1])), 'porches downstairs');
      seen.add(JSON.stringify(plan));
    }
    assert.equal(seen.size, 10, `grade ${g} plans differ`);
  }
});

for (const m of MISSIONS) {
  test(`${m.missionId}: content contract and every step can be completed`, () => {
    for (const key of ['missionId', 'contentVersion', 'grade', 'concept', 'learningGoal', 'curriculum', 'prerequisites', 'brief', 'prediction', 'play', 'evidence', 'explain', 'transfer', 'summary']) {
      assert.ok(m[key] !== undefined, `missing ${key}`);
    }
    assert.equal(m.curriculum.status, 'Proposed');
    assert.ok(m.brief.alt && m.play.alt, 'alt text');
    assert.ok(m.prediction.choices.length >= 2 && m.prediction.choices.length <= 4);
    assert.equal(m.explain.hints.length, 3);
    assert.ok(m.explain.choices.some((c) => c.correct), 'explain has a correct answer');
    for (const c of m.explain.choices) assert.ok(c.correct || c.feedback, `feedback for ${c.id}`);

    const layout = m.play.layout;
    assert.ok(settingsAllowed(layout, defaultSettings(layout)), 'default settings allowed');
    const trials = reachableTrials(layout);
    for (const t of trials) assert.notEqual(t.result.status, 'unavailable', 'model available');
    for (const req of m.evidence.requirements) {
      assert.ok(requirementMet(req, trials), `evidence "${req.label}" is reachable`);
    }
    if (m.explain.evidenceQuestion) assert.ok(trials.some(m.explain.evidenceTest), 'evidence link reachable');

    assert.ok(m.transfer.length >= 1);
    for (const t of m.transfer) {
      assert.equal(t.hints.length, 3);
      assert.ok(t.choices.some((c) => c.correct), `transfer ${t.variant} has a correct answer`);
      const tt = reachableTrials(t.layout);
      assert.ok(tt.some((x) => meetsGoal(t.layout, x.result)), `transfer ${t.variant} goal reachable`);
      assert.ok(!meetsGoal(t.layout, makeTrial(t.layout, defaultSettings(t.layout), 1).result) || t.layout.kind === 'catalogue',
        `transfer ${t.variant} is not already solved at the start`);
    }
  });
}
