// Power the Island: layout builders.
//
// Mission content calls these instead of hand-placing every terminal.
// A layout always has `rule`, `kind` (how it is drawn) and `controls`.

import { MATERIALS } from './circuit.js';

const W = { x0: 60, x1: 340, y0: 45, y1: 215 };
const P = 2 * (W.x1 - W.x0) + 2 * (W.y1 - W.y0); // 900
const CORNERS = [
  [85, [W.x0, W.y0]],
  [365, [W.x1, W.y0]],
  [535, [W.x1, W.y1]],
  [815, [W.x0, W.y1]],
];

// Walk the rectangle clockwise from the middle of the left edge.
function at(s) {
  s = ((s % P) + P) % P;
  if (s < 85) return [W.x0, 130 - s];
  if (s < 365) return [W.x0 + (s - 85), W.y0];
  if (s < 535) return [W.x1, W.y0 + (s - 365)];
  if (s < 815) return [W.x1 - (s - 535), W.y1];
  return [W.x0, W.y1 - (s - 815)];
}

function route(s1, s2) {
  if (s2 < s1) s2 += P;
  const pts = [at(s1)];
  for (const [c, p] of [...CORNERS, ...CORNERS.map(([c, p]) => [c + P, p])]) if (c > s1 && c < s2) pts.push(p);
  pts.push(at(s2));
  return pts;
}

const SLOTS = {
  1: [450],
  2: [225, 450],
  3: [225, 450, 675],
  4: [165, 285, 450, 675],
  5: [165, 285, 450, 615, 735],
};

const orient = (s) => (s > 365 && s < 535 ? 'v' : 'h');

/**
 * A single series loop drawn round a rectangle.
 * parts: [{ id, type: 'switch'|'bulb', label, closed? }] in loop order after the battery.
 * wires: optional { index: material } for the wire that leaves part `index`
 *        (index 0 leaves the battery + terminal).
 * controls: { switches, connectors (wire indexes), materials, bulbs, materialLabels }.
 */
export function loop({ parts, wires = {}, controls = {}, scene = 'bench', kind = 'diagram', required, wireNames }) {
  if (parts.length > 5) throw new Error('loop() supports up to five parts');
  const slots = SLOTS[parts.length];
  const terminals = ['bat+', 'bat-'];
  const components = [{ id: 'cell', type: 'battery', terminals: ['bat+', 'bat-'], label: 'Battery' }];
  const pos = { 'bat+': at(35), 'bat-': at(-35) };
  const drawParts = { cell: [W.x0, 130, 'v'] };
  parts.forEach((p, i) => {
    const a = `${p.id}.a`;
    const b = `${p.id}.b`;
    terminals.push(a, b);
    components.push({ ...p, terminals: [a, b], ...(p.type === 'switch' ? { closed: p.closed ?? true } : {}) });
    pos[a] = at(slots[i] - 30);
    pos[b] = at(slots[i] + 30);
    drawParts[p.id] = [...at(slots[i]), orient(slots[i])];
  });
  const stops = [35, ...slots.flatMap((s) => [s - 30, s + 30]), P - 35];
  const ends = ['bat+', ...parts.flatMap((p) => [`${p.id}.a`, `${p.id}.b`]), 'bat-'];
  const letters = 'ABCDEFG';
  const connectors = [];
  const routes = {};
  for (let i = 0; i <= parts.length; i++) {
    const id = `w${letters[i]}`;
    const from = ends[i * 2];
    const to = ends[i * 2 + 1];
    const name = (n) => (n === 'bat+' ? 'battery +' : n === 'bat-' ? 'battery −' : parts.find((p) => n.startsWith(`${p.id}.`)).label.toLowerCase());
    connectors.push({
      id, from, to, material: wires[i] || 'metal',
      label: wireNames?.[i] || `Wire ${letters[i]}: ${name(from)} to ${name(to)}`,
    });
    routes[id] = route(stops[i * 2], stops[i * 2 + 1]);
  }
  const loopOrder = [];
  connectors.forEach((w, i) => {
    loopOrder.push(w.id);
    if (parts[i]) loopOrder.push(parts[i].id);
  });
  loopOrder.push('cell');
  return {
    rule: 'closed_conducting_loop',
    kind,
    scene,
    terminals,
    components,
    connectors,
    required: required || parts.filter((p) => p.type === 'bulb').map((p) => p.id),
    loopOrder,
    controls: {
      switches: controls.switches || [],
      connectors: (controls.connectors || []).map((i) => `w${letters[i]}`),
      materials: controls.materials || [],
      bulbs: controls.bulbs || [],
      materialLabels: controls.materialLabels,
    },
    draw: { view: '0 0 400 260', pos, routes, parts: drawParts },
  };
}

// A circuit the child never sees: a scene with a device and big controls.
// battery: true adds a "battery in / out" control on the battery wire.
export function hidden({ scene, device = 'lamp', battery = false, switchStart = false, noSwitch = false }) {
  const parts = noSwitch
    ? [{ id: device, type: 'bulb', label: device }]
    : [{ id: 'sw', type: 'switch', label: 'Switch', closed: switchStart }, { id: device, type: 'bulb', label: device }];
  const l = loop({
    parts,
    kind: 'hidden',
    scene,
    wires: battery ? { 0: 'missing' } : {},
    controls: {
      switches: noSwitch ? [] : ['sw'],
      connectors: battery ? [0] : [],
      materials: battery ? ['metal', 'missing'] : [],
      materialLabels: { metal: 'Battery in', missing: 'Battery out' },
    },
  });
  l.device = device;
  return l;
}

// Swap the connector that a tester clip holds. One wire is the test slot.
export function tester({ materials, scene = 'bench', start = 'missing' }) {
  return loop({
    parts: [{ id: 'bulb', type: 'bulb', label: 'Bulb' }],
    wires: { 1: start },
    scene,
    wireNames: { 1: 'Test slot: bulb to battery −' },
    controls: { connectors: [1], materials },
  });
}

function valueControl(id, label, options) {
  return { id, label, options: options.map(([oid, olabel, pic]) => ({ id: oid, label: olabel, pic })) };
}

export function catalogue({ items, prompt = 'Choose one to check', scene, goal, show }) {
  const ids = Object.keys(items);
  return {
    rule: 'catalogue',
    kind: 'catalogue',
    scene,
    items,
    show,
    initial: { item: ids[0] },
    controls: { values: [valueControl('item', prompt, ids.map((id) => [id, items[id].label, items[id].pic]))] },
    goal: goal || ((r) => r.status === 'ok'),
  };
}

const SOLAR_OPTIONS = {
  site: ['Where is the panel?', [['sunny', 'In full sun'], ['shaded', 'Under a tree']]],
  time: ['Time of day', [['day', 'Daytime'], ['night', 'After dark']]],
  storage: ['Storage', [['none', 'No battery'], ['battery', 'Rechargeable battery']]],
  weather: ['Weather this week', [['clear', 'Clear days'], ['cloudy', 'Cloudy days']]],
};

export function solar({ controls, initial, goal, scene = 'jetty', fixed = {} }) {
  return {
    rule: 'solar',
    kind: 'solar',
    scene,
    initial: { site: 'sunny', time: 'day', storage: 'none', weather: 'clear', ...fixed, ...initial },
    controls: { values: controls.map((c) => valueControl(c, ...SOLAR_OPTIONS[c])) },
    goal: goal || ((r) => r.lamp === 'on'),
  };
}

const LIGHT_OPTIONS = {
  torch: ['Torch', [['on', 'Torch on'], ['off', 'Torch off']]],
  blocker: ['Between torch and object', [['none', 'Nothing'], ['card', 'Cardboard'], ['glass', 'Clear glass']]],
  holes: ['Cards with holes', [['lined', 'Holes in a line'], ['not', 'Holes not in a line']]],
  room: ['Room', [['dark', 'Curtains closed'], ['sunlit', 'Curtains open']]],
};

export function light({ controls, initial, goal, object = 'book', scene = 'den' }) {
  return {
    rule: 'light',
    kind: 'light',
    scene,
    object,
    initial: { torch: 'off', blocker: 'none', holes: 'lined', room: 'dark', ...initial },
    controls: { values: controls.map((c) => valueControl(c, ...LIGHT_OPTIONS[c])) },
    goal: goal || ((r) => r.seen),
  };
}

export function rooms({ list, goal }) {
  return {
    rule: 'rooms',
    kind: 'rooms',
    rooms: list.map(([id, label, occupied]) => ({ id, label, occupied })),
    initial: Object.fromEntries(list.map(([id, , , start]) => [id, start ? 'on' : 'off'])),
    controls: {
      values: list.map(([id, label]) => valueControl(id, label, [['on', 'Light on'], ['off', 'Light off']])),
    },
    goal: goal || ((r) => r.fair),
  };
}

export const materialLabel = (layout, m) => layout.controls.materialLabels?.[m] || MATERIALS[m]?.label || m;
