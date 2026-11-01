// Power the Island: the grade houses.
//
// Each grade is a cutaway house. Every mission sits in a room chosen to fit
// what it teaches, and each grade has its own floor plan. Rooms are drawn as
// 3D boxes (back wall, side walls, floor, ceiling) with their own furniture,
// and they light up as the learner progresses.

import { esc } from './art.js';

// Room shells. Colours are the room's own decor, the same in light and dark
// mode, because the house is an illustration.
const ROOMS = {
  porch: { name: 'Front porch', wall: '#e9d3a8', floor: '#b98a5a', draw: porch },
  living: { name: 'Living room', wall: '#cfe3e0', floor: '#a9784a', draw: living },
  kitchen: { name: 'Kitchen', wall: '#f3e6c9', floor: '#c9b28a', draw: kitchen },
  dining: { name: 'Dining room', wall: '#e8d9ef', floor: '#9c6b44', draw: dining },
  bedroom: { name: 'Bedroom', wall: '#d6e4f5', floor: '#a47a52', draw: bedroom },
  kids: { name: 'Kids’ room', wall: '#fbe1d2', floor: '#c49a6c', draw: kids },
  bathroom: { name: 'Bathroom', wall: '#d4eef0', floor: '#9fb8bd', draw: bathroom },
  study: { name: 'Study', wall: '#e6e0cf', floor: '#8e6a46', draw: study },
  laundry: { name: 'Laundry', wall: '#dde9df', floor: '#a9b3ae', draw: laundry },
  workshop: { name: 'Workshop', wall: '#d9cdb8', floor: '#7f6a52', draw: workshop },
  attic: { name: 'Attic', wall: '#d8c09a', floor: '#8a6a45', draw: attic },
  store: { name: 'Storeroom', wall: '#e1d6c3', floor: '#94775a', draw: store },
  hallway: { name: 'Hallway', wall: '#efe4d0', floor: '#a07850', draw: hallway },
  terrace: { name: 'Rooftop terrace', wall: '#bfe4f2', floor: '#c7b08f', draw: terrace, outdoor: true },
  boatshed: { name: 'Boat shed', wall: '#c9d6d2', floor: '#6f8f97', draw: boatshed },
};

// Floor plans, top floor first. Each room is [mission number, room type,
// width in sixths of the house]. Every floor adds up to six.
const PLANS = {
  1: [
    [[6, 'kids', 2], [2, 'study', 2], [9, 'bathroom', 2]],
    [[5, 'bedroom', 2], [3, 'hallway', 1], [7, 'dining', 1], [10, 'kitchen', 2]],
    [[4, 'porch', 2], [1, 'living', 2], [8, 'workshop', 2]],
  ],
  2: [
    [[8, 'attic', 3], [7, 'terrace', 3]],
    [[2, 'kids', 2], [1, 'bathroom', 2], [5, 'bedroom', 2]],
    [[4, 'living', 3], [9, 'hallway', 1], [3, 'store', 2]],
    [[6, 'porch', 3], [10, 'workshop', 3]],
  ],
  3: [
    [[2, 'terrace', 2], [5, 'attic', 2], [3, 'study', 1], [10, 'laundry', 1]],
    [[7, 'living', 3], [1, 'hallway', 1], [8, 'kitchen', 2]],
    [[9, 'porch', 2], [4, 'workshop', 2], [6, 'boatshed', 2]],
  ],
  4: [
    [[7, 'attic', 2], [5, 'kids', 2], [8, 'laundry', 2]],
    [[3, 'study', 2], [9, 'hallway', 2], [10, 'dining', 2]],
    [[4, 'porch', 1], [1, 'workshop', 2], [2, 'kitchen', 2], [6, 'store', 1]],
  ],
  5: [
    [[2, 'terrace', 4], [8, 'attic', 2]],
    [[9, 'bedroom', 2], [3, 'study', 2], [10, 'hallway', 2]],
    [[1, 'living', 3], [5, 'kitchen', 3]],
    [[7, 'porch', 2], [4, 'workshop', 2], [6, 'boatshed', 2]],
  ],
  6: [
    [[3, 'terrace', 3], [8, 'attic', 3]],
    [[6, 'bedroom', 2], [7, 'study', 2], [2, 'hallway', 1], [1, 'dining', 1]],
    [[4, 'living', 2], [5, 'workshop', 1], [9, 'boatshed', 2], [10, 'porch', 1]],
  ],
};

// Rooms that suit each idea, best first. Houses 2 to 10 pick from these so a
// mission usually sits somewhere that fits what it teaches.
const AFFINITY = {
  '1-1': ['living', 'kitchen', 'study', 'kids'], '1-2': ['study', 'bedroom', 'living', 'kids'], '1-3': ['hallway', 'living', 'study', 'store'],
  '1-4': ['porch', 'boatshed', 'kids', 'store'], '1-5': ['bedroom', 'living', 'kids', 'study'], '1-6': ['kids', 'attic', 'bedroom', 'living'],
  '1-7': ['dining', 'hallway', 'living', 'kitchen'], '1-8': ['workshop', 'store', 'porch', 'kids'], '1-9': ['bathroom', 'laundry', 'kitchen'],
  '1-10': ['kitchen', 'living', 'dining', 'store'],
  '2-1': ['bathroom', 'bedroom', 'living', 'hallway'], '2-2': ['kids', 'attic', 'store', 'bedroom'], '2-3': ['store', 'workshop', 'laundry', 'kitchen'],
  '2-4': ['living', 'kids', 'attic', 'dining'], '2-5': ['bedroom', 'bathroom', 'attic', 'hallway'], '2-6': ['porch', 'hallway', 'store', 'boatshed'],
  '2-7': ['terrace', 'porch', 'attic', 'boatshed'], '2-8': ['attic', 'study', 'workshop', 'kids'], '2-9': ['hallway', 'living', 'dining', 'bedroom'],
  '2-10': ['workshop', 'boatshed', 'porch', 'terrace'],
  '3-1': ['hallway', 'study', 'living', 'dining'], '3-2': ['terrace', 'attic', 'porch'], '3-3': ['study', 'kids', 'living', 'bedroom'],
  '3-4': ['workshop', 'store', 'porch', 'hallway'], '3-5': ['attic', 'terrace', 'boatshed', 'porch'], '3-6': ['boatshed', 'terrace', 'attic', 'workshop'],
  '3-7': ['living', 'dining', 'hallway', 'bedroom'], '3-8': ['kitchen', 'laundry', 'dining', 'living'], '3-9': ['porch', 'boatshed', 'terrace', 'hallway'],
  '3-10': ['laundry', 'bathroom', 'kitchen', 'workshop'],
  '4-1': ['workshop', 'study', 'store', 'kids'], '4-2': ['kitchen', 'store', 'workshop', 'laundry'], '4-3': ['study', 'workshop', 'kids', 'dining'],
  '4-4': ['porch', 'hallway', 'bedroom', 'living'], '4-5': ['kids', 'store', 'workshop', 'laundry'], '4-6': ['store', 'attic', 'workshop', 'study'],
  '4-7': ['attic', 'study', 'hallway', 'kids'], '4-8': ['laundry', 'workshop', 'kitchen', 'store'], '4-9': ['hallway', 'living', 'dining', 'porch'],
  '4-10': ['dining', 'study', 'workshop', 'living'],
  '5-1': ['living', 'study', 'kids', 'bedroom'], '5-2': ['terrace', 'porch', 'boatshed', 'attic'], '5-3': ['study', 'workshop', 'kids', 'store'],
  '5-4': ['workshop', 'study', 'store', 'attic'], '5-5': ['kitchen', 'dining', 'laundry', 'living'], '5-6': ['boatshed', 'terrace', 'porch', 'attic'],
  '5-7': ['porch', 'terrace', 'boatshed', 'hallway'], '5-8': ['attic', 'study', 'kids', 'workshop'], '5-9': ['bedroom', 'living', 'study', 'kitchen'],
  '5-10': ['hallway', 'dining', 'living', 'study'],
  '6-1': ['dining', 'living', 'hallway', 'kids'], '6-2': ['hallway', 'workshop', 'store', 'attic'], '6-3': ['terrace', 'porch', 'boatshed', 'attic'],
  '6-4': ['living', 'dining', 'kids', 'bedroom'], '6-5': ['workshop', 'store', 'attic', 'laundry'], '6-6': ['bedroom', 'hallway', 'study', 'living'],
  '6-7': ['study', 'attic', 'terrace', 'kids'], '6-8': ['attic', 'terrace', 'boatshed', 'porch'], '6-9': ['boatshed', 'terrace', 'porch', 'workshop'],
  '6-10': ['porch', 'living', 'hallway', 'dining'],
};
const TOP_ONLY = new Set(['terrace', 'attic']);
const GROUND_ONLY = new Set(['porch', 'boatshed']);
const FLOOR_SHAPES = [[3, 4, 3], [4, 3, 3], [3, 3, 4], [2, 4, 4], [4, 4, 2], [2, 3, 3, 2], [3, 2, 3, 2], [2, 2, 3, 3], [3, 3, 2, 2], [2, 3, 2, 3]];
const SPANS = { 1: [[6]], 2: [[3, 3], [4, 2], [2, 4]], 3: [[2, 2, 2], [3, 2, 1], [1, 2, 3], [2, 3, 1], [1, 3, 2]], 4: [[2, 1, 2, 1], [1, 2, 1, 2], [2, 2, 1, 1], [1, 1, 2, 2], [1, 2, 2, 1]] };

function seeded(...keys) {
  let h = 2166136261;
  for (const ch of keys.join('|')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return (h % 100000) / 100000;
  };
}

// House 1 of each grade uses the hand-drawn plan above. Every other house
// gets its own plan: a floor shape, room widths and rooms picked to suit
// each mission, with terraces and attics upstairs and porches downstairs.
const planCache = new Map();
export function planFor(grade, house) {
  if (house === 1) return PLANS[grade];
  const key = `${grade}-${house}`;
  if (planCache.has(key)) return planCache.get(key);
  const rand = seeded('plan', grade, house);
  const shape = FLOOR_SHAPES[(grade * 3 + house * 7) % FLOOR_SHAPES.length];
  const used = new Set();
  const types = {};
  const order = Array.from({ length: 10 }, (_, i) => i + 1).sort(() => rand() - 0.5);
  const cap = { top: 0, ground: 0 };
  for (const n of order) {
    const prefs = AFFINITY[`${grade}-${n}`];
    const rot = prefs.map((_, i) => prefs[(i + house) % prefs.length]);
    const fits = (t) => !used.has(t)
      && !(TOP_ONLY.has(t) && cap.top >= shape[0])
      && !(GROUND_ONLY.has(t) && cap.ground >= shape[shape.length - 1]);
    const pick = rot.find(fits) || Object.keys(ROOMS).find((t) => fits(t) && !TOP_ONLY.has(t) && !GROUND_ONLY.has(t));
    used.add(pick);
    types[n] = pick;
    if (TOP_ONLY.has(pick)) cap.top += 1;
    if (GROUND_ONLY.has(pick)) cap.ground += 1;
  }
  const nums = Object.keys(types).map(Number);
  const top = nums.filter((n) => TOP_ONLY.has(types[n]));
  const ground = nums.filter((n) => GROUND_ONLY.has(types[n]));
  const rest = nums.filter((n) => !TOP_ONLY.has(types[n]) && !GROUND_ONLY.has(types[n])).sort(() => rand() - 0.5);
  const floors = shape.map(() => []);
  floors[0].push(...top);
  floors[floors.length - 1].push(...ground);
  for (let f = 0; f < floors.length; f++) {
    while (floors[f].length < shape[f]) floors[f].push(rest.shift());
  }
  const plan = floors.map((floor) => {
    const row = floor.sort(() => rand() - 0.5);
    const spans = SPANS[row.length][Math.floor(rand() * SPANS[row.length].length)];
    return row.map((n, i) => [n, types[n], spans[i]]);
  });
  planCache.set(key, plan);
  return plan;
}

export function roomFor(grade, number, house = 1) {
  for (const floor of planFor(grade, house)) for (const [n, type] of floor) if (n === number) return type;
  return null;
}
export const roomName = (type) => ROOMS[type]?.name ?? '';
export { PLANS, ROOMS };

// ---------- furniture (viewBox 0 0 120 60, floor line at y = 60) ----------

const R = (x, y, w, h, fill, rx = 1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const C = (x, y, r, fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
const P = (d, fill, stroke = 'none', sw = 0) => `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const plant = (x) => `${R(x - 4, 50, 8, 10, '#b5653d', 1)}${C(x, 46, 6, '#3f8f5a')}${C(x - 4, 42, 4, '#4fa36a')}${C(x + 4, 41, 4, '#4fa36a')}`;
const window_ = (x, y, w, h, night) => `${R(x, y, w, h, night ? '#1d3b57' : '#9fd6e6', 1)}<path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#fff" stroke-width="1.2"/>`;

function porch() {
  return `${R(14, 14, 22, 46, '#7a5532', 1)}${R(17, 17, 16, 40, '#9a6b3c', 1)}${C(30, 38, 1.4, '#e8c46a')}
    ${R(48, 44, 34, 4, '#8a5a34')}${R(50, 48, 3, 12, '#6d4728')}${R(77, 48, 3, 12, '#6d4728')}${R(48, 36, 34, 3, '#8a5a34')}
    ${plant(98)}${P('M0 50h120', 'none', '#7a5532', 1.5)}`;
}
function living() {
  return `${window_(46, 8, 28, 18)}${P('M8 60c0-4 104-4 104 0z', '#c94f3d')}
    ${R(10, 36, 46, 14, '#3f7ea6', 4)}${R(10, 30, 46, 10, '#4a8fb8', 4)}${R(6, 34, 8, 18, '#3a7298', 3)}${R(52, 34, 8, 18, '#3a7298', 3)}
    ${R(76, 30, 30, 18, '#1c2b33', 2)}${R(78, 32, 26, 14, '#2f4f5f', 1)}${R(80, 48, 22, 12, '#7a5532', 1)}${plant(112)}`;
}
function kitchen() {
  return `${window_(40, 6, 26, 16)}${R(4, 36, 76, 24, '#e7e2d6', 1)}${R(4, 33, 76, 4, '#8a8f91', 1)}
    ${R(10, 40, 14, 16, '#cfc8b8', 1)}${R(28, 40, 14, 16, '#cfc8b8', 1)}${C(54, 34, 3, '#3d3d3d')}${C(64, 34, 3, '#3d3d3d')}
    ${R(52, 26, 12, 7, '#9a9fa3', 2)}${R(88, 12, 24, 48, '#e9eef0', 2)}${R(88, 30, 24, 1.5, '#b9c1c4')}${R(108, 18, 2, 8, '#8a8f91')}`;
}
function dining() {
  return `${window_(46, 6, 28, 18)}${R(26, 36, 68, 5, '#7a5532', 1)}${R(30, 41, 4, 19, '#6d4728')}${R(86, 41, 4, 19, '#6d4728')}
    ${C(60, 32, 5, '#e3a33b')}${C(56, 31, 3, '#c94f3d')}${C(64, 31, 3, '#6aa84f')}
    ${R(8, 30, 4, 30, '#8a5a34')}${R(8, 44, 14, 3, '#8a5a34')}${R(20, 44, 3, 16, '#8a5a34')}
    ${R(108, 30, 4, 30, '#8a5a34')}${R(98, 44, 14, 3, '#8a5a34')}${R(97, 44, 3, 16, '#8a5a34')}`;
}
function bedroom() {
  return `${window_(70, 6, 26, 18, true)}${R(8, 38, 64, 16, '#f2f0ea', 2)}${R(8, 44, 64, 12, '#5b7fc4', 2)}${R(10, 34, 16, 8, '#ffffff', 3)}
    ${R(6, 28, 5, 32, '#7a5532', 1)}${R(10, 54, 60, 6, '#7a5532')}${R(84, 42, 20, 18, '#9a6b3c', 1)}
    ${R(92, 32, 4, 10, '#6d4728')}${P('M86 32l6-8h4l6 8z', '#f1d27a')}`;
}
function kids() {
  return `${window_(46, 6, 24, 16)}${R(6, 40, 44, 12, '#f5c84c', 2)}${R(6, 36, 12, 8, '#fff', 3)}${R(6, 52, 44, 8, '#e07a3c')}
    ${R(62, 48, 10, 10, '#d9534f')}${R(72, 48, 10, 10, '#4a90d9')}${R(67, 38, 10, 10, '#5cb85c')}${C(96, 54, 6, '#f08a24')}
    ${P('M90 54h12M96 48v12', 'none', '#fff', 1.2)}${R(100, 20, 14, 10, '#ffffff', 1)}${P('M102 27l4-5 3 3 3-4', 'none', '#4a90d9', 1.2)}`;
}
function bathroom() {
  return `${R(8, 38, 52, 18, '#ffffff', 6)}${R(8, 36, 52, 4, '#e3eef0', 2)}${R(12, 56, 4, 4, '#b9c1c4')}${R(52, 56, 4, 4, '#b9c1c4')}
    ${R(78, 10, 18, 22, '#cfe9f2', 2)}${P('M80 30l14-18', 'none', '#fff', 1.4)}${R(76, 38, 22, 6, '#ffffff', 2)}${R(84, 44, 6, 16, '#e3eef0')}
    ${R(104, 20, 10, 24, '#5cb8b2', 1)}${R(102, 18, 14, 2, '#8a8f91')}`;
}
function study() {
  return `${R(8, 8, 32, 52, '#7a5532', 1)}${[14, 28, 42].map((y) => `${R(10, y, 28, 1.5, '#5a3d22')}${R(11, y - 9, 4, 9, '#c94f3d')}${R(16, y - 8, 3, 8, '#3f7ea6')}${R(20, y - 9, 5, 9, '#e3a33b')}${R(27, y - 7, 3, 7, '#5cb85c')}`).join('')}
    ${R(50, 36, 56, 4, '#9a6b3c')}${R(52, 40, 3, 20, '#7a5532')}${R(100, 40, 3, 20, '#7a5532')}
    ${R(70, 20, 22, 14, '#1c2b33', 1)}${R(72, 22, 18, 10, '#3f7ea6')}${R(79, 34, 4, 2, '#1c2b33')}${R(54, 30, 2, 6, '#3d3d3d')}${P('M50 30l6-4 6 4z', '#f1d27a')}`;
}
function laundry() {
  return `${P('M6 14h108', 'none', '#7a7f82', 0.8)}${P('M20 14v10h10v-10M44 14v12h8v-12M70 14v9h12v-9', '#7ab0d9', '#4a7fa6', 0.6)}
    ${R(10, 30, 30, 30, '#f2f4f5', 3)}${C(25, 47, 9, '#9cc3d6')}${C(25, 47, 6, '#cfe6ef')}${R(12, 32, 26, 4, '#d5dadd', 1)}
    ${R(46, 30, 30, 30, '#f2f4f5', 3)}${C(61, 47, 9, '#9cc3d6')}${R(48, 32, 26, 4, '#d5dadd', 1)}
    ${P('M88 44h22l-3 16h-16z', '#c9a36b')}${R(90, 40, 18, 5, '#e07a3c', 2)}`;
}
function workshop() {
  return `${R(10, 8, 60, 22, '#c9a36b', 1)}${[16, 26, 36, 46, 56].map((x, i) => P(i % 2 ? `M${x} 12v12` : `M${x - 3} 12h6v4h-2v8h-2v-8h-2z`, i % 2 ? 'none' : '#6d7a80', '#6d7a80', 2)).join('')}
    ${R(6, 36, 76, 5, '#8a5a34')}${R(10, 41, 4, 19, '#6d4728')}${R(74, 41, 4, 19, '#6d4728')}${R(10, 50, 68, 3, '#6d4728')}
    ${R(20, 30, 14, 6, '#c94f3d', 1)}${R(40, 32, 18, 4, '#3f7ea6', 1)}${R(88, 44, 24, 16, '#d9534f', 2)}${R(94, 40, 12, 4, '#8a8f91', 1)}`;
}
function attic() {
  return `${window_(52, 8, 16, 14)}
    ${R(8, 40, 24, 20, '#c9a36b', 1)}${R(12, 26, 18, 14, '#d6b07a', 1)}${P('M8 50h24M21 40v20', 'none', '#a37a45', 1)}
    ${R(42, 44, 34, 16, '#7a5532', 3)}${R(42, 42, 34, 6, '#8a5a34', 3)}${R(57, 46, 4, 5, '#e3a33b')}
    ${R(88, 46, 22, 14, '#d6b07a', 1)}${R(92, 34, 16, 12, '#c9a36b', 1)}`;
}
function store() {
  return [12, 28, 44].map((y) => `${R(6, y + 12, 108, 2, '#7a5532')}${[10, 26, 42, 58, 74, 90].map((x, i) =>
    i % 3 === 0 ? R(x, y + 2, 12, 10, '#d6b07a', 1) : i % 3 === 1 ? `${R(x + 2, y + 3, 8, 9, '#cfe6ef', 2)}${R(x + 2, y + 1, 8, 2, '#c94f3d')}` : C(x + 6, y + 8, 4, '#e3a33b')).join('')}`).join('')
    + R(6, 12, 2, 48, '#6d4728') + R(112, 12, 2, 48, '#6d4728');
}
function hallway() {
  return `${P('M50 60h70v-48h-12v8h-12v8h-12v8h-12v8h-12v8h-10z', '#b98a5a')}${P('M50 60l58-48', 'none', '#7a5532', 1.4)}
    ${R(10, 14, 22, 46, '#7a5532', 1)}${R(13, 17, 16, 40, '#9a6b3c', 1)}${C(26, 38, 1.4, '#e8c46a')}
    ${R(34, 52, 14, 8, '#6d4728', 1)}${R(36, 48, 4, 4, '#c94f3d', 1)}${R(42, 48, 4, 4, '#3f7ea6', 1)}`;
}
function terrace() {
  return `${C(100, 12, 7, '#ffd04d')}${P('M10 44l30-10l8 14l-30 10z', '#1d4f8a', '#9cc3ef', 0.8)}${P('M25 39l8 14M18 46l30-10', 'none', '#9cc3ef', 0.8)}
    ${R(30, 52, 2, 8, '#6d7a80')}${R(4, 42, 112, 1.6, '#e6e0cf')}${[8, 24, 40, 56, 72, 88, 104].map((x) => R(x, 42, 1.6, 18, '#e6e0cf')).join('')}
    ${plant(70)}${plant(90)}`;
}
function boatshed() {
  return `${R(0, 48, 120, 12, '#3f8fb0')}${P('M2 52q6-3 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0', 'none', '#bfe4f2', 0.8)}
    ${P('M18 40h70l-10 12h-50z', '#c9733d')}${P('M18 40h70', 'none', '#8a4a24', 1.5)}${R(50, 14, 2, 26, '#7a5532')}${P('M52 16l20 18h-20z', '#f2f0ea')}
    ${R(96, 10, 3, 38, '#8a5a34')}${R(104, 12, 3, 36, '#8a5a34')}${P('M95 46h6l-3 6zM103 46h6l-3 6z', '#8a5a34')}`;
}

// The room box: a perspective shell stretched to the room's size, with the
// furniture drawn on top so it keeps its proportions.
function shell(type) {
  const r = ROOMS[type];
  const dark = (c, f) => {
    const n = parseInt(c.slice(1), 16);
    const ch = (k) => Math.round(((n >> k) & 255) * f).toString(16).padStart(2, '0');
    return `#${ch(16)}${ch(8)}${ch(0)}`;
  };
  const back = r.outdoor ? '#bfe4f2' : r.wall;
  return `<svg class="shell" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <polygon points="0,0 100,0 86,12 14,12" fill="${r.outdoor ? '#9fd6e6' : dark(r.wall, 0.8)}"/>
    <polygon points="0,0 14,12 14,74 0,100" fill="${dark(r.wall, 0.86)}"/>
    <polygon points="100,0 86,12 86,74 100,100" fill="${dark(r.wall, 0.78)}"/>
    <rect x="14" y="12" width="72" height="62" fill="${back}"/>
    <polygon points="0,100 14,74 86,74 100,100" fill="${r.floor}"/>
    <polygon points="0,100 14,74 86,74 100,100" fill="url(#floorShade)"/>
  </svg>
  <svg class="furniture" viewBox="0 -12 120 72" preserveAspectRatio="xMidYMax meet" aria-hidden="true">${r.draw()}</svg>`;
}

function marks(ind) {
  return ['Explored', 'Practised', 'Demonstrated'].map((l, i) => {
    const on = [ind.explored, ind.practised, ind.demonstrated][i];
    return `<span class="${on ? 'on' : ''}">${on ? '◆' : '◇'}</span>`;
  }).join('');
}

/**
 * rooms: [{ mission, number, title, ind, glow, state }] for this grade.
 * selected: mission number currently selected.
 */
export function houseView(grade, house, rooms, selected) {
  const plan = planFor(grade, house);
  const byNumber = new Map(rooms.map((r) => [r.number, r]));
  const placed = [];
  plan.forEach((floor, fi) => {
    let col = 1;
    for (const [n, type, span] of floor) {
      placed.push({ n, type, row: fi + 1, col, span });
      col += span;
    }
  });
  // DOM order follows mission order so keyboard and screen readers go 1 to 10.
  placed.sort((a, b) => a.n - b.n);
  const cells = placed.map(({ n, type, row, col, span }) => {
    const r = byNumber.get(n);
    const sel = n === selected;
    return `<li class="cell" style="grid-row:${row};grid-column:${col} / span ${span}">
      <button class="room3d ${r.glow} ${sel ? 'sel' : ''}" id="room-${r.mission.missionId}" data-act="select-room" data-n="${n}"
        aria-pressed="${sel}" aria-label="Mission ${n}, ${esc(ROOMS[type].name)}: ${esc(r.title)}. ${esc(r.state)}">
        ${shell(type)}
        <span class="lamp" aria-hidden="true"></span>
        <span class="room-plate" aria-hidden="true"><span class="room-n">${n}</span><span class="room-label">${esc(ROOMS[type].name)}</span></span>
        <span class="room-marks" aria-hidden="true">${marks(r.ind)}</span>
        <span class="room-title" aria-hidden="true">${esc(r.title)}</span>
      </button></li>`;
  }).join('');
  return `<div class="house3d">
    <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
      <linearGradient id="floorShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    </defs></svg>
    <div class="roof3d" aria-hidden="true"><span class="chimney3d"></span><span class="roof-sign">${esc(BUILDING_NAMES[house - 1])}</span></div>
    <ol class="floors3d" style="grid-template-rows:repeat(${plan.length}, minmax(0, 1fr))" aria-label="Grade ${grade}, house ${house} rooms">${cells}</ol>
    <div class="ground3d" aria-hidden="true"></div>
  </div>`;
}

// ---------- the neighbourhood ----------

export const BUILDING_NAMES = ['Coral House', 'Palm House', 'Lagoon House', 'Reef House', 'Breeze House',
  'Shell House', 'Sunrise House', 'Harbour House', 'Turtle House', 'Moonlight House'];
const WALLS = ['#f3e3c3', '#cfe6e3', '#f6d1c1', '#e2d9f3', '#fbe7a1', '#d7ecd0', '#f1c9d6', '#cfe0f5', '#efe2cf', '#e0e7c8'];
const ROOFS = ['#c4553d', '#3f7ea6', '#5a8f5a', '#a8432f', '#7a5532', '#c9733d'];
const WINDOW = { dark: '#25394a', dim: '#4d6779', warm: '#f0c35a', bright: '#ffe27a' };

/**
 * The outside of one house, drawn from its floor plan: one window per room,
 * as wide as the room, lit to match that room's progress.
 * glows: { [missionNumber]: 'dark' | 'dim' | 'warm' | 'bright' }
 */
export function buildingSvg(grade, house, glows) {
  const plan = planFor(grade, house);
  const floors = plan.length;
  const fh = 26;
  const roofH = 22;
  const W = 120;
  const x0 = 10;
  const ww = W - 2 * x0;
  const H = roofH + floors * fh + 8;
  const wall = WALLS[(grade * 3 + house) % WALLS.length];
  const roof = ROOFS[(grade + house * 2) % ROOFS.length];
  const hasTerrace = plan[0].some((r) => r[1] === 'terrace');
  const style = hasTerrace ? 'flat' : house % 2 ? 'gable' : 'hip';
  let roofSvg;
  if (style === 'flat') {
    roofSvg = `<rect x="${x0 - 3}" y="${roofH - 6}" width="${ww + 6}" height="6" fill="${roof}"/>
      ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect x="${x0 + 4 + i * 15}" y="${roofH - 14}" width="1.5" height="8" fill="#e6e0cf"/>`).join('')}
      <rect x="${x0 + 2}" y="${roofH - 15}" width="${ww - 4}" height="1.5" fill="#e6e0cf"/>
      <path d="M${x0 + 56} ${roofH - 7}l22 -10l6 8l-22 10z" fill="#1d4f8a" stroke="#9cc3ef" stroke-width=".6"/>`;
  } else if (style === 'gable') {
    roofSvg = `<path d="M${x0 - 6} ${roofH}L${W / 2} 2L${W - x0 + 6} ${roofH}z" fill="${roof}"/>
      <rect x="${W - x0 - 22}" y="6" width="8" height="12" fill="#a7744d"/>`;
  } else {
    roofSvg = `<path d="M${x0 - 6} ${roofH}L${x0 + 18} 4H${W - x0 - 18}L${W - x0 + 6} ${roofH}z" fill="${roof}"/>`;
  }
  const windows = plan.map((floor, fi) => {
    const y = roofH + fi * fh;
    let col = 0;
    return floor.map(([n, type, span]) => {
      const x = x0 + (col / 6) * ww;
      const w = (span / 6) * ww;
      col += span;
      const g = glows[n] || 'dark';
      const fill = WINDOW[g];
      const glow = g === 'bright' ? `<rect x="${x + 2}" y="${y + 4}" width="${w - 4}" height="${fh - 9}" rx="2" fill="#ffd95a" opacity=".45" filter="url(#bglow)"/>` : '';
      if (fi === floors - 1 && (type === 'porch' || (!floor.some((r) => r[1] === 'porch') && col === span))) {
        // The front door sits in the porch, or in the first ground-floor room.
        const dw = Math.min(14, w - 6);
        return `${glow}<rect x="${x + w / 2 - dw / 2}" y="${y + 6}" width="${dw}" height="${fh - 6}" rx="2" fill="${g === 'dark' ? '#7a5532' : fill}" stroke="#5a3d22" stroke-width="1.2"/>`;
      }
      return `${glow}<rect x="${x + 3}" y="${y + 5}" width="${w - 6}" height="${fh - 11}" rx="1.5" fill="${fill}" stroke="#fff" stroke-width="1.2"/>
        <path d="M${x + w / 2} ${y + 5}v${fh - 11}" stroke="#fff" stroke-width=".8" opacity=".7"/>`;
    }).join('');
  }).join('');
  const palm = house % 3 === 0 ? `<path d="M${W - 2} ${H - 4}q-3 -18 2 -34" stroke="#7a5532" stroke-width="2.5" fill="none"/><path d="M${W} ${H - 38}q-10 -2 -14 4q8 -5 14 -4q-2 -8 -9 -10q8 1 9 10q5 -8 12 -6" fill="#3f8f5a"/>` : '';
  return `<svg class="building" viewBox="0 0 ${W + 6} ${H}" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
    <defs><filter id="bglow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter></defs>
    ${roofSvg}
    <rect x="${x0}" y="${roofH}" width="${ww}" height="${floors * fh}" fill="${wall}" stroke="#b9a27e" stroke-width="1.5"/>
    ${plan.slice(1).map((_, i) => `<rect x="${x0}" y="${roofH + (i + 1) * fh - 1}" width="${ww}" height="2" fill="#b9a27e"/>`).join('')}
    ${windows}
    <rect x="${x0 - 4}" y="${roofH + floors * fh}" width="${ww + 8}" height="4" fill="#9a8a6a"/>
    ${palm}
  </svg>`;
}
