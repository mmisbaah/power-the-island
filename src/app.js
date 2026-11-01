// Power the Island: screens and interaction.
// Every screen is rendered from the saved record, so a reload lands in the
// same place. Model results always come from models.js via progress.js.

import { ROSTER, missionById, HOUSES_PER_GRADE } from './missions.js';
import {
  STEPS, MAX_TRIALS, freshMission, freshTransfer, makeTrial, meetsGoal,
  evidenceStatus, explainCorrect, deriveIndicators, loadRecord, openStore,
} from './progress.js';
import { pic, stamp, islandMark, esc } from './art.js';
import { houseView, roomFor, roomName, buildingSvg, BUILDING_NAMES } from './house.js';
import { shownResult, resultText, trialLine, artFor, controlsFor, describeFor, stateDot } from './lab.js';

const STEP_LABELS = {
  brief: 'Mission', prediction: 'Predict', play: 'Test', evidence: 'Evidence',
  explain: 'Explain', transfer: 'New challenge', summary: 'Discovery',
};
const NEXT_LABELS = {
  brief: 'Make a prediction', prediction: 'Start testing', play: 'Look at my evidence',
  evidence: 'Explain it', explain: 'Try a new challenge', transfer: 'See my discovery',
};

const app = document.getElementById('app');
const store = openStore(() => window.localStorage);
let record;
let notices;
const ui = { mission: null, panel: null, confirmReset: false, inspect: -1, busy: false, flash: null, sub: null, pages: {}, sel: {}, inside: false };

function boot(hotData) {
  const loaded = hotData?.record ? loadRecord(hotData.record) : loadRecord(store.read() ?? 'null');
  record = loaded.record;
  notices = loaded.notices;
  if (hotData?.ui) Object.assign(ui, hotData.ui, { busy: false });
  window.claude?.hot?.snapshot?.(() => ({ record, ui }));
  applyPrefs();
  render();
}

function save() {
  store.write(record);
}

function applyPrefs() {
  document.documentElement.classList.toggle('calm', record.prefs.reducedMotion);
}

// ---------- helpers ----------

const mission = () => missionById(ui.mission);
const rec = () => {
  const m = mission();
  if (!record.missions[m.missionId]) record.missions[m.missionId] = freshMission(m);
  return record.missions[m.missionId];
};
const transferSpec = (m, r) => m.transfer.find((t) => t.variant === r.transfer.variant) || m.transfer[0];
const sameSettings = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const shortName = (label) => label.split(':')[0];

function lab(ctx) {
  const m = mission();
  const r = rec();
  if (ctx === 'transfer') {
    const spec = transferSpec(m, r);
    return { layout: spec.layout, state: r.transfer, alt: spec.alt };
  }
  return { layout: m.play.layout, state: { settings: r.play.settings, trials: r.trials }, alt: m.play.alt };
}

// ---------- sound and narration ----------

let audio = null;
function tone(lit) {
  if (!record.prefs.sound) return;
  try {
    audio ||= new (window.AudioContext || window.webkitAudioContext)();
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.frequency.value = lit ? 660 : 220;
    g.gain.setValueAtTime(0.08, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.35);
    o.connect(g).connect(audio.destination);
    o.start();
    o.stop(audio.currentTime + 0.36);
  } catch { /* sound is optional */ }
}

const canSpeak = () => 'speechSynthesis' in window;
function readAloud() {
  if (!canSpeak()) return;
  const parts = [...app.querySelectorAll('#screen-title, [data-say]')].map((el) => el.textContent.trim());
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(parts.join('. '));
  u.rate = 0.9;
  speechSynthesis.speak(u);
}

// ---------- paging ----------

// Lists never scroll: they show a page at a time, newest page first.
const PAGE = 3;
function paged(list, key) {
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const page = Math.min(pages - 1, Math.max(0, ui.pages[key] ?? pages - 1));
  return { items: list.slice(page * PAGE, page * PAGE + PAGE), page, pages };
}
function pager(key, { page, pages }, label) {
  if (pages <= 1) return '';
  return `<div class="pager" role="group" aria-label="${esc(label)}">
    <button class="iconbtn" id="${key}-prev" data-act="page" data-key="${key}" data-to="${page - 1}" ${page === 0 ? 'disabled' : ''} aria-label="Earlier">◀</button>
    <span>${page + 1} / ${pages}</span>
    <button class="iconbtn" id="${key}-next" data-act="page" data-key="${key}" data-to="${page + 1}" ${page === pages - 1 ? 'disabled' : ''} aria-label="Later">▶</button>
  </div>`;
}

// ---------- overview ----------


function statusMarks(ind) {
  const mark = (on, label) => `<span class="mark ${on ? 'on' : ''}" title="${label}">${on ? '◆' : '◇'}<span class="sr">${label}: ${on ? 'yes' : 'not yet'}</span></span>`;
  return `<span class="marks">${mark(ind.explored, 'Explored')}${mark(ind.practised, 'Practised')}${mark(ind.demonstrated, 'Demonstrated')}</span>`;
}

// Progress for every room in one house, used inside and outside.
function houseRooms(grade, house) {
  let lit = 0;
  const rooms = ROSTER.filter((m) => m.grade === grade && m.house === house).map((m) => {
    const r = record.missions[m.missionId];
    const ind = deriveIndicators(missionById(m.missionId), r);
    if (ind.demonstrated) lit += 1;
    const glow = ind.demonstrated ? 'bright' : ind.practised ? 'warm' : r ? 'dim' : 'dark';
    const state = !r ? 'Not started' : r.step === 'summary' ? (ind.demonstrated ? 'Room lit' : 'Review') : `Saved at: ${STEP_LABELS[r.step]}`;
    return { mission: m, number: m.number, title: m.title, ind, glow, state, started: !!r };
  });
  return { rooms, lit };
}

function homeHeader(extra = '') {
  return `<header class="topbar home">
      ${islandMark()}
      <div class="home-title">
        <h1 id="screen-title" tabindex="-1">Power the Island</h1>
        <p class="muted small" data-say>Fix safe model circuits, test ideas, explain what you find.</p>
      </div>
      ${extra}
      <button class="iconbtn" id="toggle-settings" data-act="panel" data-panel="settings" aria-label="Settings">⚙</button>
    </header>`;
}

function overviewView() {
  if (ui.panel === 'settings') return settingsView();
  return ui.inside ? insideView() : streetView();
}

// The neighbourhood: the grade's ten houses. Each building is drawn from its
// floor plan, with one window per room lit to match progress.
function streetView() {
  const grade = record.grade;
  const last = record.houses[grade] ?? 1;
  let total = 0;
  const lots = Array.from({ length: HOUSES_PER_GRADE }, (_, i) => {
    const h = i + 1;
    const { rooms, lit } = houseRooms(grade, h);
    total += lit;
    const glows = Object.fromEntries(rooms.map((r) => [r.number, r.glow]));
    const name = BUILDING_NAMES[i];
    return `<li class="lot" style="--r2:${Math.floor(i / 2) + 1};--c2:${(i % 2) + 1};--r5:${Math.floor(i / 5) + 1};--c5:${(i % 5) + 1}">
      <button class="lotbtn ${h === last ? 'last' : ''} ${lit === 10 ? 'done' : ''}" id="building-${h}" data-act="enter" data-house="${h}"
        aria-label="${esc(name)}, house ${h}: ${lit} of 10 rooms lit${h === last ? '. You were here last.' : ''}">
        ${buildingSvg(grade, h, glows)}
        <span class="lot-sign"><span class="lot-n">${h}</span><span class="lot-name">${esc(name)}</span><span class="lot-lit">💡${lit}</span></span>
      </button></li>`;
  }).join('');
  const grades = [1, 2, 3, 4, 5, 6].map((g) =>
    `<button class="seg ${g === grade ? 'on' : ''}" id="grade-${g}" data-act="grade" data-grade="${g}" aria-pressed="${g === grade}">${g}</button>`).join('');
  return `
    ${homeHeader()}
    <main class="stage"><div class="fit">
      ${noticeView()}
      <div class="graderow"><span class="clabel">Grade</span><div class="segs" role="group" aria-label="Grade">${grades}</div>
        <span class="litcount street-count">💡 ${total} of ${HOUSES_PER_GRADE * 10} rooms lit</span></div>
      <ol class="street" aria-label="Grade ${grade} neighbourhood: tap a building to go inside">${lots}</ol>
    </div></main>
    <footer class="bottombar foot"><p>Tap a building to go inside. Progress saves on this device only.</p></footer>`;
}

// Inside one building: the cutaway house, its rooms and the selected mission.
function insideView() {
  const grade = record.grade;
  const house = record.houses[grade] ?? 1;
  const { rooms, lit } = houseRooms(grade, house);
  const fallback = rooms.find((x) => !x.ind.demonstrated)?.number ?? 1;
  const selKey = `${grade}-${house}`;
  const selected = ui.sel[selKey] ?? fallback;
  ui.sel[selKey] = selected;
  const pickedRoom = rooms.find((x) => x.number === selected);
  const pm = pickedRoom.mission;
  const card = `<div class="roomcard" aria-live="polite">
      <div class="roomcard-text">
        <span class="eyebrow">${esc(roomName(roomFor(grade, pm.number, house)))} · Mission ${pm.number}<span class="sr">. ${esc(pickedRoom.state)}</span></span>
        <strong class="roomcard-title">${esc(pm.title)}</strong>
        <span class="roomcard-goal">${esc(missionById(pm.missionId).learningGoal)}</span>
      </div>
      <button class="btn primary" id="open-${pm.missionId}" data-act="open" data-id="${pm.missionId}">${!pickedRoom.started ? 'Start' : pickedRoom.state === 'Review' || pickedRoom.state === 'Room lit' ? 'Review' : 'Continue'} →</button>
    </div>`;
  const name = BUILDING_NAMES[house - 1];
  return `
    <header class="topbar">
      <button class="iconbtn" id="to-street" data-act="street" aria-label="Back to the neighbourhood">⌂</button>
      <div class="mtitle">
        <span class="eyebrow">Grade ${grade} · House ${house} of ${HOUSES_PER_GRADE} · 💡 ${lit}/10 rooms lit</span>
        <h1 id="screen-title" tabindex="-1" class="mname">${esc(name)}</h1>
      </div>
      <button class="iconbtn" id="house-prev" data-act="house" data-to="${house - 1}" ${house <= 1 ? 'disabled' : ''} aria-label="Previous building">◀</button>
      <button class="iconbtn" id="house-next" data-act="house" data-to="${house + 1}" ${house >= HOUSES_PER_GRADE ? 'disabled' : ''} aria-label="Next building">▶</button>
    </header>
    <main class="stage"><div class="fit">
      ${noticeView()}
      ${houseView(grade, house, rooms, selected)}${card}
    </div></main>
    <footer class="bottombar foot"><p>Tap a room to see its mission. Tap it again to go in.</p></footer>`;
}

function noticeView() {
  const items = [...notices];
  if (!store.available) items.unshift('This browser is not saving progress. Closing the page will lose your work.');
  if (!items.length) return '';
  return `<div class="notice" role="status"><p>${items.map(esc).join(' ')}</p>
    ${notices.length ? '<button class="btn quiet small" id="dismiss-notice" data-act="dismiss">OK</button>' : ''}</div>`;
}

function toggle(id, label, on, pref) {
  return `<button class="toggle" id="${id}" data-act="pref" data-pref="${pref}" aria-pressed="${on}">
    <span class="knob" aria-hidden="true"></span>${esc(label)}: <strong>${on ? 'on' : 'off'}</strong></button>`;
}

function settingsView() {
  const grades = [1, 2, 3, 4, 5, 6].map((g) =>
    `<button class="seg ${g === record.grade ? 'on' : ''}" id="grade-${g}" data-act="grade" data-grade="${g}" aria-pressed="${g === record.grade}">Grade ${g}</button>`
  ).join('');
  return `
    <header class="topbar"><h1 id="screen-title" tabindex="-1">Settings</h1></header>
    <main class="stage"><div class="fit" id="settings-panel">
      <h2 class="sub">Learner grade</h2>
      <div class="segs" role="group" aria-label="Learner grade">${grades}</div>
      <h2 class="sub">Sound and motion</h2>
      <div class="toggles">
        ${canSpeak() ? toggle('pref-narration', 'Read aloud button', record.prefs.narration, 'narration') : ''}
        ${toggle('pref-sound', 'Sounds', record.prefs.sound, 'sound')}
        ${toggle('pref-motion', 'Reduce motion', record.prefs.reducedMotion, 'reducedMotion')}
      </div>
    </div></main>
    <footer class="bottombar"><span></span><button class="btn primary" id="close-settings" data-act="panel" data-panel="settings">Done</button></footer>`;
}

// ---------- mission frame ----------

function missionView() {
  const m = mission();
  const r = rec();
  const idx = STEPS.indexOf(r.step);
  const dots = STEPS.map((s, i) => `<li class="${i < idx ? 'past' : i === idx ? 'now' : ''}"></li>`).join('');
  const body = ui.confirmReset ? resetView() : {
    brief: briefView, prediction: predictionView, play: () => labView('play'),
    evidence: evidenceView, explain: explainView, transfer: transferView, summary: summaryView,
  }[r.step]();
  const can = canAdvance(m, r);
  const next = r.step === 'summary'
    ? `<button class="btn primary" id="nav-home" data-act="home">Back to the island</button>`
    : `<button class="btn primary" id="nav-next" data-act="next" ${can.ok ? '' : 'aria-disabled="true" aria-describedby="next-why"'}>${NEXT_LABELS[r.step]} →</button>`;
  return `
    <header class="topbar">
      <button class="iconbtn" id="nav-exit" data-act="home" aria-label="Back to the island">⌂</button>
      <div class="mtitle">
        <span class="eyebrow"><span class="sr">Grade ${m.grade}, house ${m.house}, mission ${m.number}. </span><span aria-hidden="true">G${m.grade} · H${m.house} · ${esc(roomName(roomFor(m.grade, m.number, m.house)))} · </span>Step ${idx + 1}/${STEPS.length}: ${STEP_LABELS[r.step]}</span>
        <span class="mname">${esc(m.title)}</span>
        <ol class="dots" aria-hidden="true">${dots}</ol>
      </div>
      ${record.prefs.narration && canSpeak() ? '<button class="iconbtn" id="read-aloud" data-act="speak" aria-label="Read aloud">🔊</button>' : ''}
      <button class="iconbtn" id="reset" data-act="reset" aria-label="Start this mission again">↺</button>
    </header>
    <main class="stage"><div class="fit">${noticeView()}${body}</div></main>
    <footer class="bottombar">
      ${idx > 0 && !ui.confirmReset ? `<button class="btn quiet" id="nav-back" data-act="back">← Back</button>` : '<span></span>'}
      ${!can.ok && can.why && !ui.confirmReset ? `<p class="why" id="next-why">${esc(can.why)}</p>` : '<span class="why"></span>'}
      ${ui.confirmReset ? '' : next}
    </footer>`;
}

function resetView() {
  return `<div class="confirm" role="alertdialog" aria-labelledby="screen-title">
    <h1 id="screen-title" tabindex="-1">Start this mission again?</h1>
    <p>Your current attempt will be cleared.</p>
    <div class="row">
      <button class="btn danger" id="reset-yes" data-act="reset-yes">Yes, start again</button>
      <button class="btn quiet" id="reset-no" data-act="reset-no">Keep my work</button>
    </div>
  </div>`;
}

function transferSolved(m, r) {
  const spec = transferSpec(m, r);
  const lit = r.transfer.trials.some((t) => meetsGoal(spec.layout, t.result));
  const right = spec.choices.find((c) => c.id === r.transfer.choice)?.correct && r.transfer.checked;
  return { lit, right: !!right };
}

function canAdvance(m, r) {
  switch (r.step) {
    case 'brief': return { ok: true };
    case 'prediction': return r.prediction?.choice ? { ok: true } : { ok: false, why: 'Choose a prediction first. Any answer is fine.' };
    case 'play': return r.trials.length ? { ok: true } : { ok: false, why: `Press ${m.testWord} at least once first.` };
    case 'evidence': return evidenceStatus(m, r).every((x) => x.met) ? { ok: true } : { ok: false, why: 'You still need some evidence. Go back and test again.' };
    case 'explain': return explainCorrect(m, r) && r.explain.checked ? { ok: true } : { ok: false, why: 'Check an explanation first.' };
    case 'transfer': {
      const s = transferSolved(m, r);
      if (!s.lit) return { ok: false, why: `Solve the new challenge, then press ${m.testWord}.` };
      return s.right ? { ok: true } : { ok: false, why: 'Answer the question and press Check.' };
    }
    default: return { ok: false };
  }
}

// ---------- steps ----------

function figure(inner, alt) {
  return `<figure class="art" role="img" aria-label="${esc(alt)}">${inner}</figure>`;
}

function briefView() {
  const m = mission();
  const b = m.brief;
  const layout = m.play.layout;
  const settings = rec().play.settings;
  const start = shownResult(layout, settings, []);
  const art = layout.kind === 'rooms' ? artFor('brief', layout, settings, null) : artFor('brief', layout, settings, start);
  return `
    <h1 id="screen-title" tabindex="-1">${esc(b.heading)}</h1>
    <div class="grow" inert>${layout.kind === 'rooms' ? `<div class="art rooms-art" role="img" aria-label="${esc(b.alt)}">${art}</div>` : figure(art, b.alt)}</div>
    <p class="lead" data-say>${esc(b.text)}</p>
    ${start && layout.kind === 'diagram' ? `<p class="status" data-say><span class="dot ${stateDot(layout, start)}" aria-hidden="true"></span>Status: ${esc(resultText(layout, start))}</p>` : ''}
    <p class="goal"><span class="eyebrow">Today you will</span>${esc(m.learningGoal)}</p>`;
}

function predictionView() {
  const m = mission();
  const r = rec();
  const p = m.prediction;
  const choices = p.choices.map((c) => {
    const on = r.prediction?.choice === c.id;
    return `<button class="choice ${c.pic ? 'pic-choice' : ''} ${on ? 'on' : ''}" id="pred-${c.id}" data-act="predict" data-id="${c.id}" aria-pressed="${on}">
      ${c.pic ? pic(c.pic) : ''}<span>${esc(c.label)}</span></button>`;
  }).join('');
  const reasons = p.reasons
    ? `<h2 class="sub">${esc(p.reasonQuestion)}</h2>
       <div class="choices list">${p.reasons.map((c) => {
         const on = r.prediction?.reason === c.id;
         return `<button class="choice ${on ? 'on' : ''}" id="reason-${c.id}" data-act="reason" data-id="${c.id}" aria-pressed="${on}" ${r.prediction ? '' : 'disabled'}>${esc(c.label)}</button>`;
       }).join('')}</div>`
    : '';
  return `
    <h1 id="screen-title" tabindex="-1">${esc(p.question)}</h1>
    <p class="muted small" data-say>${m.pictures ? 'Tap your answer.' : 'There is no wrong guess. You will test it next.'} You can also say it out loud; nothing is recorded.</p>
    <div class="choices ${m.pictures ? 'big' : 'list'}" role="group" aria-label="Prediction">${choices}</div>
    ${reasons}`;
}

function testButton(ctx) {
  const word = mission().testWord;
  const icon = word === 'Look' ? '👀' : word === 'Check' ? '🔎' : '⚡';
  return `<button class="btn primary big" id="${ctx}-test" data-act="test" data-ctx="${ctx}" ${ui.busy ? 'disabled' : ''}>${ui.busy ? 'Working…' : `${icon} ${word}`}</button>`;
}

function labView(ctx, extra = '') {
  const m = mission();
  const { layout, state, alt } = lab(ctx);
  const r = shownResult(layout, state.settings, state.trials);
  const highlight = ui.inspect >= 0 && layout.loopOrder ? layout.loopOrder[ui.inspect] : null;
  const inner = artFor(ctx, layout, state.settings, r, highlight);
  const art = layout.kind === 'rooms'
    ? `<div class="art rooms-art">${inner}</div>`
    : figure(inner, `${alt} ${describeFor(layout, state.settings)} ${resultText(layout, r) || 'Not tested yet.'}`);
  const text = resultText(layout, r);
  const count = state.trials.length;
  const status = `<p class="status" role="status"><span class="dot ${stateDot(layout, r)}" aria-hidden="true"></span><span>${
    text ? esc(text) : `You changed something. Press ${m.testWord} to find out.`}</span>${count ? `<span class="count">${m.testWord}s: ${count}</span>` : ''}</p>`;
  const flash = ui.flash ? `<p class="flash" role="alert">${esc(ui.flash)}</p>` : '';
  const head = ctx === 'play'
    ? `<h1 id="screen-title" tabindex="-1">${esc(m.play.heading)}</h1><p class="lead small-lead" data-say>${esc(m.play.instruction)}</p>`
    : '';
  return `${head}<div class="lab kind-${layout.kind}">
    <div class="lab-art">${art}${status}</div>
    <div class="lab-side">${flash}${controlsFor(ctx, m, layout, state.settings, ui.inspect)}${extra}${testButton(ctx)}</div>
  </div>`;
}

function predictionCard(m, r) {
  if (!r.prediction) return '';
  const c = m.prediction.choices.find((x) => x.id === r.prediction.choice);
  const reason = m.prediction.reasons?.find((x) => x.id === r.prediction.reason);
  return `<div class="predcard"><span class="eyebrow">Your prediction</span>
    <span>${c.pic ? pic(c.pic) : ''}${esc(c.label)}${reason ? `, because: ${esc(reason.label.toLowerCase())}` : ''}</span></div>`;
}

function trialItems(list, layout, word) {
  return list.map((t) => `<li><span class="tn">${word} ${t.n}</span><span>${esc(trialLine(layout, t))}</span></li>`).join('');
}

function evidenceView() {
  const m = mission();
  const r = rec();
  const reqs = evidenceStatus(m, r);
  const pg = paged(r.trials, 'evidence');
  return `
    <h1 id="screen-title" tabindex="-1">${esc(m.evidence.heading)}</h1>
    ${predictionCard(m, r)}
    <ul class="checks">${reqs.map((q) => `<li class="${q.met ? 'met' : ''}"><span class="tick" aria-hidden="true">${q.met ? '✔' : '○'}</span>${esc(q.label)}<span class="sr">${q.met ? ': done' : ': not yet'}</span></li>`).join('')}</ul>
    <div class="trialbox">
      <div class="row between"><span class="eyebrow">What the model showed (not real measurements)</span>${pager('evidence', pg, 'Your results')}</div>
      <ol class="trials">${trialItems(pg.items, m.play.layout, m.testWord)}</ol>
    </div>
    ${reqs.every((q) => q.met)
      ? '<p class="good" data-say>You have the evidence you need. Did it match your prediction?</p>'
      : '<button class="btn quiet" id="back-to-test" data-act="back">← Back to testing</button>'}`;
}

// One hint box: the latest hint replaces the one before, so nothing grows.
function hintBox(hints, level, ctx) {
  return `<div class="hints">
    ${level ? `<p class="hint"><span class="eyebrow">Hint ${level} of ${hints.length}</span>${esc(hints[level - 1])}</p>` : ''}
    ${level < hints.length ? `<button class="btn quiet small" id="${ctx}-hint" data-act="hint" data-ctx="${ctx}">${level ? 'Another hint' : 'Need a hint?'}</button>` : ''}
  </div>`;
}

function choiceButtons(ctx, choices, selected, big) {
  return `<div class="choices ${big ? 'big' : 'list'}" role="group">${choices.map((c) => {
    const on = selected === c.id;
    return `<button class="choice ${c.pic ? 'pic-choice' : ''} ${on ? 'on' : ''}" id="${ctx}-c-${c.id}" data-act="choose" data-ctx="${ctx}" data-id="${c.id}" aria-pressed="${on}">${c.pic ? pic(c.pic) : ''}<span>${esc(c.label)}</span></button>`;
  }).join('')}</div>`;
}

function feedbackView(fb) {
  if (!fb) return '';
  return `<p class="feedback ${fb.ok ? 'good' : 'retry'}" role="status">${esc(fb.text)}</p>`;
}

// Explain has two short pages when the mission asks for an evidence link:
// first the claim, then the test that supports it.
function explainView() {
  const m = mission();
  const r = rec();
  const e = m.explain;
  const claimRight = e.choices.find((c) => c.id === r.explain.choice)?.correct;
  const onEvidence = e.evidenceQuestion && ui.sub === 'evidence' && claimRight;
  if (onEvidence) {
    const pg = paged(r.trials, 'pick');
    return `
      <h1 id="screen-title" tabindex="-1">${esc(e.evidenceQuestion)}</h1>
      <div class="row between"><span class="eyebrow">Your results</span>${pager('pick', pg, 'Your results')}</div>
      <div class="choices list" role="group">${pg.items.map((t) => {
        const on = r.explain.evidenceTrial === t.n;
        return `<button class="choice ${on ? 'on' : ''}" id="ev-${t.n}" data-act="evidence-pick" data-n="${t.n}" aria-pressed="${on}"><span class="tn">${m.testWord} ${t.n}</span> ${esc(trialLine(m.play.layout, t))}</button>`;
      }).join('')}</div>
      <div class="row"><button class="btn quiet" id="explain-claim" data-act="sub" data-sub="claim">← My answer</button>
        <button class="btn primary" id="explain-check" data-act="check" data-ctx="explain">Check</button></div>
      ${feedbackView(r.explain.feedback)}
      ${hintBox(e.hints, r.explain.hintLevel, 'explain')}`;
  }
  return `
    <h1 id="screen-title" tabindex="-1" data-say>${esc(e.question)}</h1>
    ${choiceButtons('explain', e.choices, r.explain.choice, m.pictures)}
    <div class="row">
      <button class="btn primary" id="explain-check" data-act="check" data-ctx="explain">${e.evidenceQuestion ? 'Next: pick your evidence' : 'Check my answer'}</button>
      ${e.allowAloud ? '<button class="btn quiet" id="explain-aloud" data-act="aloud">A grown-up heard me explain</button>' : ''}
    </div>
    ${feedbackView(r.explain.feedback)}
    ${hintBox(e.hints, r.explain.hintLevel, 'explain')}
    ${e.allowAloud ? '<p class="muted tiny">Nothing is recorded. The game only notes that a grown-up listened.</p>' : ''}`;
}

// The new challenge is two pages: solve it, then answer its question.
function transferView() {
  const m = mission();
  const r = rec();
  const spec = transferSpec(m, r);
  const solved = transferSolved(m, r);
  if (solved.lit && ui.sub === 'question') {
    return `
      <h1 id="screen-title" tabindex="-1" data-say>${esc(spec.question)}</h1>
      ${choiceButtons('transfer', spec.choices, r.transfer.choice, m.pictures)}
      <div class="row"><button class="btn quiet" id="transfer-lab" data-act="sub" data-sub="lab">← The challenge</button>
        <button class="btn primary" id="transfer-check" data-act="check" data-ctx="transfer">Check</button></div>
      ${feedbackView(r.transfer.feedback)}
      ${hintBox(spec.hints, r.transfer.hintLevel, 'transfer')}`;
  }
  const extra = `${hintBox(spec.hints, r.transfer.hintLevel, 'transfer')}${solved.lit ? '<button class="btn primary" id="to-question" data-act="sub" data-sub="question">Answer the question →</button>' : ''}`;
  return `
    <h1 id="screen-title" tabindex="-1">${esc(spec.heading)} <span class="chip help">On your own</span></h1>
    <p class="lead small-lead" data-say>${esc(spec.text)}</p>
    ${labView('transfer', extra)}`;
}

function summaryView() {
  const m = mission();
  const r = rec();
  const ind = deriveIndicators(m, r);
  const other = m.transfer.find((t) => t.variant !== r.transfer.variant && !r.transferHistory.some((h) => h.variant === t.variant));
  const support = [];
  if (r.explain.hintLevel) support.push(`${r.explain.hintLevel} hint${r.explain.hintLevel > 1 ? 's' : ''} while explaining`);
  if (r.explain.aloud) support.push('explained aloud to a grown-up');
  if (r.transfer.hintLevel) support.push(`${r.transfer.hintLevel} hint${r.transfer.hintLevel > 1 ? 's' : ''} on the new challenge`);
  return `
    <h1 id="screen-title" tabindex="-1">${ind.practised ? 'You earned a discovery stamp' : 'Your discovery so far'}</h1>
    <div class="discovery">
      ${ind.practised ? `<div class="stampwrap">${stamp()}</div>` : ''}
      <div>
        <span class="eyebrow">The idea</span>
        <p class="lead" data-say>${esc(m.summary.idea)}</p>
      </div>
    </div>
    <div class="chips">${[['Explored', ind.explored], ['Practised', ind.practised], ['Demonstrated', ind.demonstrated]].map(([l, on]) => `<span class="chip ${on ? 'done' : ''}">${on ? '◆' : '◇'} ${l}</span>`).join('')}${ind.assisted ? '<span class="chip help">Finished with hints</span>' : ''}</div>
    <p><strong>${r.trials.length}</strong> ${m.testWord.toLowerCase()}s run. Help used: ${support.length ? esc(support.join('; ')) : 'none, you did it on your own'}.</p>
    ${ind.assisted && other
      ? `<div class="note row"><span>Try a fresh challenge on your own to show what you know.</span>
          <button class="btn primary" id="fresh-transfer" data-act="fresh-transfer" data-variant="${other.variant}">Fresh challenge</button></div>`
      : ''}
    <p class="muted tiny">These are learning notes in this app, not school grades. <a class="link" href="https://science.atollingo.com/" target="_blank" rel="noopener">${esc(m.summary.lesson)} ↗</a></p>`;
}

// ---------- actions ----------

const actions = {
  open({ id }) {
    ui.mission = id;
    ui.inspect = -1;
    ui.flash = null;
    ui.confirmReset = false;
    rec();
    save();
    render({ newScreen: true });
  },
  home() {
    ui.mission = null;
    ui.sub = null;
    ui.pages = {};
    ui.flash = null;
    ui.confirmReset = false;
    if (canSpeak()) speechSynthesis.cancel();
    render({ newScreen: true });
  },
  panel({ panel }) {
    ui.panel = ui.panel === panel ? null : panel;
    render();
  },
  grade({ grade }) {
    record.grade = Number(grade);
    save();
    render();
  },
  pref({ pref }) {
    record.prefs[pref] = !record.prefs[pref];
    applyPrefs();
    save();
    render();
  },
  dismiss() {
    notices = [];
    render();
  },
  speak: readAloud,
  'select-room'({ n }) {
    const grade = record.grade;
    const house = record.houses[grade] ?? 1;
    const num = Number(n);
    const key = `${grade}-${house}`;
    // Tapping the room that is already selected opens it.
    if (ui.sel[key] === num) {
      const m = ROSTER.find((x) => x.grade === grade && x.house === house && x.number === num);
      actions.open({ id: m.missionId });
      return;
    }
    ui.sel[key] = num;
    render();
  },
  house({ to }) {
    const h = Math.min(HOUSES_PER_GRADE, Math.max(1, Number(to)));
    record.houses[record.grade] = h;
    save();
    render({ newScreen: true });
  },
  enter({ house }) {
    record.houses[record.grade] = Number(house);
    ui.inside = true;
    save();
    render({ newScreen: true });
  },
  street() {
    ui.inside = false;
    render({ newScreen: true });
    document.getElementById(`building-${record.houses[record.grade] ?? 1}`)?.focus();
  },
  page({ key, to }) {
    ui.pages[key] = Number(to);
    render();
  },
  sub({ sub }) {
    ui.sub = sub;
    render({ newScreen: true });
  },
  next() {
    const m = mission();
    const r = rec();
    if (!canAdvance(m, r).ok) {
      document.getElementById('next-why')?.focus?.();
      return;
    }
    go(STEPS[STEPS.indexOf(r.step) + 1]);
  },
  back() {
    const r = rec();
    const target = r.step === 'evidence' ? 'play' : STEPS[Math.max(0, STEPS.indexOf(r.step) - 1)];
    go(target);
  },
  reset() { ui.confirmReset = true; render(); document.getElementById('reset-yes')?.focus(); },
  'reset-no'() { ui.confirmReset = false; render(); document.getElementById('reset')?.focus(); },
  'reset-yes'() {
    record.missions[ui.mission] = freshMission(mission());
    ui.confirmReset = false;
    ui.inspect = -1;
    ui.flash = null;
    save();
    render({ newScreen: true });
  },
  predict({ id }) {
    const r = rec();
    r.prediction = { choice: id, reason: r.prediction?.reason ?? null };
    save();
    render();
  },
  reason({ id }) {
    const r = rec();
    if (!r.prediction) return;
    r.prediction.reason = r.prediction.reason === id ? null : id;
    save();
    render();
  },
  flip({ ctx, id }) {
    const { state } = lab(ctx);
    state.settings.switches[id] = !state.settings.switches[id];
    save();
    render();
  },
  switch({ ctx, id, closed }) {
    const m = mission();
    const r = rec();
    const { state, layout } = lab(ctx);
    const want = closed === 'true';
    const mis = m.play.misconception;
    if (want && state.settings.switches[id] && ctx === 'play' && mis) {
      r.play.closeRepeats += 1;
      if (r.play.closeRepeats >= mis.after) {
        ui.flash = mis.message;
        ui.inspect = layout.loopOrder.indexOf(id) + 1;
      }
    }
    state.settings.switches[id] = want;
    save();
    render();
  },
  material({ ctx, id, mat }) {
    const { state, layout } = lab(ctx);
    state.settings.connectors[id] = mat;
    ui.inspect = layout.loopOrder.indexOf(id);
    ui.flash = null;
    save();
    render();
  },
  bulb({ ctx, id, present }) {
    const { state, layout } = lab(ctx);
    state.settings.bulbs[id] = present === 'true';
    ui.inspect = layout.loopOrder.indexOf(id);
    save();
    render();
  },
  value({ ctx, key, val }) {
    const { state } = lab(ctx);
    state.settings.values[key] = val;
    save();
    render();
  },
  inspect({ dir }) {
    const { layout } = lab(rec().step === 'transfer' ? 'transfer' : 'play');
    ui.flash = null;
    ui.inspect = Math.min(layout.loopOrder.length - 1, Math.max(0, ui.inspect + Number(dir)));
    render();
  },
  'inspect-at'({ ctx, id }) {
    ui.inspect = lab(ctx).layout.loopOrder.indexOf(id);
    render();
  },
  test({ ctx }) {
    if (ui.busy) return;
    ui.busy = true;
    render();
    const { layout, state } = lab(ctx);
    const n = (state.trials[state.trials.length - 1]?.n ?? 0) + 1;
    const trial = makeTrial(layout, state.settings, n);
    const delay = record.prefs.reducedMotion ? 0 : 350;
    setTimeout(() => {
      state.trials.push(trial);
      if (state.trials.length > MAX_TRIALS) state.trials.shift();
      if (ctx === 'play') rec().trials = state.trials;
      const res = trial.result;
      if (res.status === 'unavailable') ui.flash = 'The model cannot test this layout, so there is no result.';
      else if (res.status === 'unsupported') ui.flash = 'This layout is outside what the model covers, so there is no result.';
      else ui.flash = null;
      tone(meetsGoal(layout, res));
      ui.busy = false;
      save();
      render();
      document.getElementById(`${ctx}-test`)?.focus({ preventScroll: true });
    }, delay);
  },
  choose({ ctx, id }) {
    const r = rec();
    const target = ctx === 'explain' ? r.explain : r.transfer;
    target.choice = id;
    target.checked = false;
    target.feedback = null;
    save();
    render();
  },
  'evidence-pick'({ n }) {
    const r = rec();
    r.explain.evidenceTrial = Number(n);
    r.explain.checked = false;
    r.explain.feedback = null;
    save();
    render();
  },
  aloud() {
    const r = rec();
    r.explain.aloud = true;
    r.explain.checked = true;
    r.explain.feedback = { ok: true, text: 'Great explaining. You can press Next when you are ready.' };
    save();
    render();
  },
  check({ ctx }) {
    const m = mission();
    const r = rec();
    if (ctx === 'explain') {
      const e = m.explain;
      const c = e.choices.find((x) => x.id === r.explain.choice);
      r.explain.attempts += 1;
      r.explain.checked = true;
      if (!c) r.explain.feedback = { ok: false, text: 'Choose an answer first.' };
      else if (!c.correct) r.explain.feedback = { ok: false, text: `${c.feedback} Try again.` };
      else if (e.evidenceQuestion && ui.sub !== 'evidence') {
        r.explain.feedback = null;
        ui.sub = 'evidence';
        save();
        render({ newScreen: true });
        return;
      } else if (e.evidenceQuestion && !r.explain.evidenceTrial) r.explain.feedback = { ok: false, text: 'Pick the test that shows it.' };
      else if (!explainCorrect(m, r)) r.explain.feedback = { ok: false, text: 'Look at that result again. Does it really show your answer? Pick another one.' };
      else r.explain.feedback = { ok: true, text: 'Yes. Your evidence supports that.' };
    } else {
      const spec = transferSpec(m, r);
      const c = spec.choices.find((x) => x.id === r.transfer.choice);
      r.transfer.attempts += 1;
      r.transfer.checked = true;
      r.transfer.feedback = !c
        ? { ok: false, text: 'Choose an answer first.' }
        : c.correct ? { ok: true, text: 'Yes. The same idea worked in a new place.' } : { ok: false, text: `${c.feedback} Try again.` };
    }
    save();
    render();
  },
  hint({ ctx }) {
    const r = rec();
    const target = ctx === 'explain' ? r.explain : r.transfer;
    target.hintLevel = Math.min(3, target.hintLevel + 1);
    save();
    render();
    (document.getElementById(`${ctx}-hint`) || document.getElementById('screen-title'))?.focus();
  },
  'fresh-transfer'({ variant }) {
    const m = mission();
    const r = rec();
    r.transferHistory.push(r.transfer);
    r.transfer = freshTransfer(m, variant);
    ui.inspect = -1;
    go('transfer');
  },
};

function go(step) {
  rec().step = step;
  ui.flash = null;
  ui.inspect = -1;
  ui.sub = null;
  ui.pages = {};
  ui.confirmReset = false;
  if (canSpeak()) speechSynthesis.cancel();
  save();
  render({ newScreen: true });
}

app.addEventListener('click', (ev) => {
  const el = ev.target.closest('[data-act]');
  if (!el || el.disabled) return;
  const fn = actions[el.dataset.act];
  if (fn) fn({ ...el.dataset });
});

function render({ newScreen = false } = {}) {
  const focusId = document.activeElement?.id;
  try {
    app.innerHTML = ui.mission && mission() ? missionView() : overviewView();
  } catch (err) {
    console.error(err);
    app.innerHTML = `<div class="notice"><h1 id="screen-title" tabindex="-1">Something went wrong</h1>
      <p>This screen could not be shown. Your saved work is still here.</p>
      <button class="btn primary" id="nav-home" data-act="home">Back to the island</button></div>`;
  }
  fit();
  if (newScreen) {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.getElementById('screen-title')?.focus({ preventScroll: true });
  } else if (focusId) {
    document.getElementById(focusId)?.focus({ preventScroll: true });
  }
}

// Nothing in the game scrolls. Layouts are built to fit; if a very small or
// landscape screen still cannot hold a step, the stage shrinks to fit
// instead of scrolling.
function fit() {
  const stage = app.querySelector('.stage');
  const inner = stage?.querySelector('.fit');
  if (!inner) return;
  inner.style.transform = '';
  inner.style.width = '';
  inner.style.height = '';
  let scale = 1;
  for (let i = 0; i < 4; i++) {
    const over = Math.max(inner.scrollHeight / stage.clientHeight, inner.scrollWidth / stage.clientWidth);
    if (over <= 1.002) break;
    scale = Math.max(0.55, scale / over);
    inner.style.transform = `scale(${scale})`;
    inner.style.width = `${100 / scale}%`;
    inner.style.height = `${100 / scale}%`;
  }
  stage.dataset.scale = scale.toFixed(2);
}
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(fit, 80);
});

const hot = window.claude?.hot;
if (hot?.ready) hot.ready(boot);
else boot(hot?.data ?? {});
