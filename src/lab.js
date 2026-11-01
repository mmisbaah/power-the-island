// Power the Island: the test bench. Draws any layout kind, its controls and
// its results. Pure functions of (mission, layout, settings, trials, ui);
// app.js owns state and actions.

import { evaluate, defaultSettings, meetsGoal, isCircuit } from './progress.js';
import { materialLabel } from './layouts.js';
import { scene, diagram, pic, solarScene, lightScene, esc } from './art.js';

const sameSettings = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const shortName = (label) => label.split(':')[0];
const DEVICE = {
  lamp: ['lamp', 'on', 'off'], fan: ['fan', 'spinning', 'still'],
  torch: ['torch', 'shining', 'dark'], radio: ['radio', 'playing', 'quiet'],
};
const LAMP_WORDS = { on: 'on all evening', short: 'on for a short time only', off: 'off' };
const PANEL_WORDS = { strong: 'plenty of electricity', weak: 'only a little electricity', none: 'no electricity' };

// The result to draw: the last test if nothing changed since, the starting
// clue for circuits before any change, otherwise null (not tested yet).
export function shownResult(layout, settings, trials) {
  const last = trials[trials.length - 1];
  if (last && sameSettings(last.settings, settings)) return last.result;
  if (!last && isCircuit(layout) && sameSettings(defaultSettings(layout), settings)) return evaluate(layout, settings);
  return null;
}

const valuesOf = (layout, settings) => ({ ...(layout.initial || {}), ...settings.values });
const optionLabel = (layout, id, v) => layout.controls.values.find((c) => c.id === id)?.options.find((o) => o.id === v)?.label ?? v;

function settingsText(layout, s) {
  if (layout.kind === 'hidden') {
    const parts = [];
    if (layout.controls.switches.length) parts.push(`switch ${s.switches.sw ? 'on' : 'off'}`);
    if (layout.controls.connectors.length) parts.push(s.connectors.wA === 'metal' ? 'battery in' : 'no battery');
    return parts.join(', ');
  }
  if (isCircuit(layout)) {
    const parts = [];
    const sws = layout.components.filter((c) => c.type === 'switch');
    for (const c of sws) parts.push(`${sws.length > 1 ? c.label.toLowerCase() : 'switch'} ${s.switches[c.id] ? 'closed' : 'open'}`);
    for (const c of layout.components) if (c.type === 'bulb' && s.bulbs[c.id] === false) parts.push(`${c.label.toLowerCase()} out`);
    const odd = layout.connectors.filter((w) => s.connectors[w.id] !== 'metal')
      .map((w) => `${shortName(w.label)}: ${materialLabel(layout, s.connectors[w.id]).toLowerCase()}`);
    parts.push(odd.length ? odd.join(', ') : 'every wire metal');
    return parts.join(', ');
  }
  if (layout.kind === 'catalogue') return layout.items[s.values.item]?.label ?? '';
  if (layout.kind === 'rooms') {
    const on = layout.rooms.filter((r) => s.values[r.id] === 'on').map((r) => r.label);
    return on.length ? `lights on: ${on.join(', ')}` : 'every light off';
  }
  return layout.controls.values.map((c) => optionLabel(layout, c.id, s.values[c.id]).toLowerCase()).join(', ');
}

export function resultText(layout, r) {
  if (!r) return null;
  if (r.status === 'unavailable') return 'The model cannot test this, so there is no result.';
  if (r.status === 'unsupported') return 'This layout is outside what the model covers, so there is no result.';
  if (layout.kind === 'hidden') {
    const [name, on, off] = DEVICE[layout.device] || DEVICE.lamp;
    return `The ${name} is ${r.lit[layout.required[0]] ? on : off}.`;
  }
  if (isCircuit(layout)) {
    const bulbs = layout.components.filter((c) => c.type === 'bulb');
    if (bulbs.length === 1) return `Bulb ${r.lit[bulbs[0].id] ? 'ON: it is lit' : 'OFF: it is not lit'}.`;
    const on = bulbs.filter((b) => r.lit[b.id]);
    if (on.length === bulbs.length) return 'Every bulb is ON.';
    if (on.length === 0) return 'Every bulb is OFF.';
    return bulbs.map((b) => `${b.label} ${r.lit[b.id] ? 'ON' : 'OFF'}`).join(', ') + '.';
  }
  if (layout.kind === 'catalogue') {
    const it = layout.items[r.item];
    return layout.show ? layout.show(r, it) : it.label;
  }
  if (layout.kind === 'solar') return `Panel makes ${PANEL_WORDS[r.panel]}. Path light: ${LAMP_WORDS[r.lamp]}.`;
  if (layout.kind === 'light') {
    const what = layout.object || 'book';
    return `${r.seen ? `You can see the ${what}.` : `You cannot see the ${what}.`}${r.shadow ? ' A shadow forms behind the cardboard.' : ''}`;
  }
  if (layout.kind === 'rooms') {
    const name = (id) => layout.rooms.find((x) => x.id === id).label;
    if (r.fair) return 'Every light matches who is in the room. No waste, nobody in the dark.';
    const bits = [];
    if (r.wasted.length) bits.push(`Wasting: ${r.wasted.map(name).join(', ')}`);
    if (r.dark.length) bits.push(`Too dark for people in: ${r.dark.map(name).join(', ')}`);
    return bits.join('. ') + '.';
  }
  return '';
}

export function trialLine(layout, t) {
  if (layout.kind === 'catalogue') return resultText(layout, t.result);
  return `${settingsText(layout, t.settings)} → ${resultText(layout, t.result)}`;
}

function bulbStates(layout, r) {
  return Object.fromEntries(layout.components.filter((c) => c.type === 'bulb')
    .map((c) => [c.id, r ? (r.lit?.[c.id] ? 'on' : 'off') : 'unknown']));
}

function stateDot(layout, r) {
  if (!r) return 'unknown';
  if (r.status === 'unavailable' || r.status === 'unsupported') return 'unknown';
  if (layout.kind === 'catalogue') return 'neutral';
  return meetsGoal(layout, r) ? 'on' : 'off';
}

// ---------- art ----------

function catalogueArt(layout, settings, r) {
  const it = layout.items[settings.values.item];
  return `<div class="cat-card ${r ? 'checked' : ''}">
    <div class="cat-pic">${pic(it.pic, true)}</div>
    <p class="cat-name">${esc(it.label)}</p>
  </div>`;
}

function roomsArt(ctx, layout, settings, r) {
  return `<ul class="rooms" aria-label="Rooms">${layout.rooms.map((room) => {
    const on = settings.values[room.id] === 'on';
    const flag = r ? (r.wasted.includes(room.id) ? '<span class="chip warn">wasting</span>' : r.dark.includes(room.id) ? '<span class="chip warn">too dark</span>' : '<span class="chip done">✔ right</span>') : '';
    return `<li class="room ${on ? 'lit' : ''}">
      <button class="room-btn" id="${ctx}-room-${room.id}" data-act="value" data-ctx="${ctx}" data-key="${room.id}" data-val="${on ? 'off' : 'on'}" aria-pressed="${on}">
        <span class="room-name">${esc(room.label)}</span>
        <span class="room-who">${room.occupied ? '🧑‍🤝‍🧑 People here' : 'Empty'}</span>
        <span class="room-light">${pic(on ? 'lamp-on' : 'lamp-off')} Light ${on ? 'on' : 'off'}</span>
      </button>${flag}
    </li>`;
  }).join('')}</ul>`;
}

export function artFor(ctx, layout, settings, r, highlight) {
  switch (layout.kind) {
    case 'diagram': return diagram(layout, settings, bulbStates(layout, r), { scene: layout.scene, highlight });
    case 'hidden': {
      const state = bulbStates(layout, r)[layout.required[0]];
      return scene(layout.scene, {
        state, switchOn: settings.switches.sw, deviceKind: layout.device,
        showSwitch: layout.controls.switches.length > 0,
        battery: layout.controls.connectors.length ? settings.connectors.wA === 'metal' : null,
      });
    }
    case 'catalogue': return catalogueArt(layout, settings, r);
    case 'solar': return solarScene(valuesOf(layout, settings), r);
    case 'light': return lightScene(valuesOf(layout, settings), r, layout.object, layout.controls.values.map((c) => c.id));
    case 'rooms': return roomsArt(ctx, layout, settings, r);
    default: return '';
  }
}

export function describeFor(layout, settings) {
  if (layout.kind === 'catalogue') return `Selected: ${layout.items[settings.values.item].label}.`;
  return `Settings: ${settingsText(layout, settings)}.`;
}

// ---------- controls ----------

const seg = (id, on, act, data, label) =>
  `<button class="seg ${on ? 'on' : ''}" id="${id}" data-act="${act}" ${Object.entries(data).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ')} aria-pressed="${on}">${label}</button>`;

function partText(layout, settings, id) {
  const comp = layout.components.find((c) => c.id === id);
  const w = layout.connectors.find((c) => c.id === id);
  if (w) {
    const mat = settings.connectors[id];
    return `${w.label}. ${mat === 'missing' ? 'Nothing is here. This is a gap.' : `${materialLabel(layout, mat)} joins both ends.`}`;
  }
  if (comp.type === 'switch') return `${comp.label}: ${settings.switches[id] ? 'closed. Its two ends touch.' : 'open. Its two ends do not touch.'}`;
  if (comp.type === 'bulb') return settings.bulbs[id] === false ? `${comp.label}: the holder is empty, so its ends are not joined.` : `${comp.label}: in its holder, joined on both sides.`;
  return 'Battery, − end. The path returns here. You have followed the whole loop.';
}

function partOptions(ctx, layout, settings, id) {
  const c = layout.controls;
  if (c.switches.includes(id)) {
    const on = settings.switches[id];
    return seg(`${ctx}-${id}-open`, !on, 'switch', { ctx, id, closed: 'false' }, 'Open')
      + seg(`${ctx}-${id}-closed`, on, 'switch', { ctx, id, closed: 'true' }, 'Closed');
  }
  if ((c.bulbs || []).includes(id)) {
    const inn = settings.bulbs[id];
    return seg(`${ctx}-${id}-in`, inn, 'bulb', { ctx, id, present: 'true' }, 'In its holder')
      + seg(`${ctx}-${id}-out`, !inn, 'bulb', { ctx, id, present: 'false' }, 'Taken out');
  }
  if (c.connectors.includes(id)) {
    const now = settings.connectors[id];
    // The part's starting material is always offered, so it can be put back.
    const start = layout.connectors.find((w) => w.id === id).material;
    return [...new Set([start, ...c.materials])].map((mat) => seg(`${ctx}-${id}-${mat}`, now === mat, 'material', { ctx, id, mat }, esc(materialLabel(layout, mat)))).join('');
  }
  return '';
}

// One part at a time: arrows follow the loop, chips jump to a part you can
// change, and only the current part's options are shown. This keeps the
// whole bench on one screen.
function circuitPanel(ctx, layout, settings, i) {
  const order = layout.loopOrder;
  const current = i >= 0 ? order[i] : null;
  const c = layout.controls;
  const changeable = order.filter((id) => c.switches.includes(id) || (c.bulbs || []).includes(id) || c.connectors.includes(id));
  const chips = changeable.map((id) => {
    const w = layout.connectors.find((x) => x.id === id);
    const comp = layout.components.find((x) => x.id === id);
    const name = w ? shortName(w.label) : comp.label;
    const gap = w && settings.connectors[id] === 'missing' ? ' gap' : '';
    return `<button class="partchip${current === id ? ' on' : ''}${gap}" id="${ctx}-pick-${id}" data-act="inspect-at" data-ctx="${ctx}" data-id="${id}" aria-pressed="${current === id}">${esc(name)}</button>`;
  }).join('');
  const text = current ? partText(layout, settings, current) : 'Follow the path from the battery’s + end, or tap a part to change it.';
  const opts = current ? partOptions(ctx, layout, settings, current) : '';
  return `<div class="partpanel">
    <div class="partbar">
      <button class="iconbtn" id="inspect-prev" data-act="inspect" data-dir="-1" aria-label="Previous part" ${i <= 0 ? 'disabled' : ''}>◀</button>
      <p class="part-text" aria-live="polite">${i >= 0 ? `<span class="eyebrow">Part ${i + 1} of ${order.length}</span>` : ''}${esc(text)}</p>
      <button class="iconbtn" id="inspect-next" data-act="inspect" data-dir="1" aria-label="${i < 0 ? 'Start following the path' : 'Next part'}" ${i >= order.length - 1 ? 'disabled' : ''}>▶</button>
    </div>
    <div class="partchips" role="group" aria-label="Parts you can change">${chips}</div>
    ${opts ? `<div class="segs partopts" role="group" aria-label="Change this part">${opts}</div>` : ''}
  </div>`;
}

function hiddenControls(ctx, layout, settings) {
  const out = [];
  if (layout.controls.switches.length) {
    const on = settings.switches.sw;
    out.push(`<button class="bigswitch ${on ? 'on' : ''}" id="${ctx}-switch" data-act="flip" data-ctx="${ctx}" data-id="sw" aria-pressed="${on}">
      <span class="rocker" aria-hidden="true"></span>Switch ${on ? 'ON' : 'OFF'}</button>`);
  }
  if (layout.controls.connectors.length) {
    const inn = settings.connectors.wA === 'metal';
    out.push(`<div class="segs big" role="group" aria-label="Battery">
      ${seg(`${ctx}-bat-in`, inn, 'material', { ctx, id: 'wA', mat: 'metal' }, '🔋 Battery in')}
      ${seg(`${ctx}-bat-out`, !inn, 'material', { ctx, id: 'wA', mat: 'missing' }, '⭕ Battery out')}</div>`);
  }
  return out.join('');
}

function valueControls(ctx, layout, settings, pictures) {
  return layout.controls.values.map((c) => {
    const big = pictures || c.options.some((o) => o.pic);
    const buttons = c.options.map((o) => {
      const on = settings.values[c.id] === o.id;
      return `<button class="${big && o.pic ? 'choice pic-choice' : 'seg'} ${on ? 'on' : ''}" id="${ctx}-${c.id}-${o.id}" data-act="value" data-ctx="${ctx}" data-key="${c.id}" data-val="${o.id}" aria-pressed="${on}">${o.pic ? pic(o.pic) : ''}<span>${esc(o.label)}</span></button>`;
    }).join('');
    return `<div class="control"><p class="clabel">${esc(c.label)}</p><div class="${big && c.options.some((o) => o.pic) ? 'choices big items' : 'segs'}" role="group" aria-label="${esc(c.label)}">${buttons}</div></div>`;
  }).join('');
}

export function controlsFor(ctx, m, layout, settings, inspect) {
  switch (layout.kind) {
    case 'diagram': return circuitPanel(ctx, layout, settings, inspect);
    case 'hidden': return `<div class="bigcontrols">${hiddenControls(ctx, layout, settings)}</div>`;
    case 'rooms': return '';
    default: return `<div class="controls">${valueControls(ctx, layout, settings, m.pictures)}</div>`;
  }
}

export { stateDot, settingsText };
