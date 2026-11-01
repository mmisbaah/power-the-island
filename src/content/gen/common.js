// Shared pieces for generated missions (houses 2 to 10 of every grade).
//
// Every generator is deterministic: the same grade, mission number and
// house always produce the same mission, so saved progress stays valid.

import { mission } from '../helpers.js';

export const NAMES = ['Aisha', 'Ibrahim', 'Mariyam', 'Hassan', 'Zara', 'Ahmed', 'Leila', 'Musa', 'Ali', 'Hawwa',
  'Yoosuf', 'Shifa', 'Nihan', 'Raisa', 'Ismail', 'Aminath', 'Mohamed', 'Fathimath', 'Shiyam', 'Liusha'];

// Places on the island, used to set scenes. `at` reads after "at" or "by".
export const PLACES = [
  { id: 'harbour', name: 'the harbour', short: 'Harbour' },
  { id: 'school', name: 'the school gate', short: 'School gate' },
  { id: 'mosque', name: 'the mosque path', short: 'Mosque path' },
  { id: 'clinic', name: 'the health centre', short: 'Health centre' },
  { id: 'ferry', name: 'the ferry terminal', short: 'Ferry terminal' },
  { id: 'football', name: 'the football ground', short: 'Football ground' },
  { id: 'market', name: 'the fish market', short: 'Fish market' },
  { id: 'council', name: 'the island council office', short: 'Council office' },
  { id: 'beach', name: 'the beach path', short: 'Beach path' },
  { id: 'library', name: 'the island library', short: 'Library' },
  { id: 'youth', name: 'the youth centre', short: 'Youth centre' },
  { id: 'jetty', name: 'the jetty', short: 'Jetty' },
];

// Small seeded random numbers so each house gets a different arrangement.
export function rng(...keys) {
  let h = 2166136261;
  for (const ch of keys.join('|')) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle(list, rand) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const nameFor = (grade, n, house, k = 0) => NAMES[(grade * 7 + n * 3 + house * 7 + k * 11) % NAMES.length];
export const placeFor = (grade, n, house, k = 0) => PLACES[(grade * 5 + n * 7 + house + k * 3) % PLACES.length];
export const pad = (x) => String(x).padStart(2, '0');

// Wrap the compact authoring helper with house-aware IDs.
export function generated(m) {
  return mission({
    ...m,
    id: `power-g${m.grade}-h${pad(m.house)}-${pad(m.number)}`,
    prerequisites: m.number > 1 ? [`power-g${m.grade}-h${pad(m.house)}-${pad(m.number - 1)}`] : [],
  });
}

export const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
