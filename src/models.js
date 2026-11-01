// Power the Island: every science model the missions can run.
//
// Each layout names a `rule`. runModel looks the rule up, builds its input
// from the learner's settings and returns a plain result object. An unknown
// rule returns 'unavailable' so the game never shows a guessed result.
//
// The non-circuit models are deliberately categorical: on / short time /
// off, seen / not seen. They carry no numbers, so nothing here can be read
// as a real measurement.

import { runRule as runCircuitRule, applySettings, allLit } from './circuit.js';

const CIRCUIT_RULES = new Set(['closed_conducting_loop']);

// Look up reviewed facts about one item: a device, a material, a light
// source or a safety action. The catalogue is mission content, so an
// educator can review every fact in one place.
function catalogue(layout, values) {
  const item = layout.items[values.item];
  if (!item) return { status: 'unavailable', reason: 'unknown_item' };
  return { status: 'ok', item: values.item, props: { ...item.props } };
}

// Solar path light. The panel needs suitable light; after dark the lamp
// needs stored energy. A panel on its own is never a night-time source.
export function solar(_layout, v) {
  const { site = 'sunny', time = 'day', storage = 'none', weather = 'clear' } = v;
  const goodLight = site === 'sunny' && weather === 'clear';
  const panel = time === 'night' ? 'none' : goodLight ? 'strong' : 'weak';
  const charge = storage === 'battery' ? (goodLight ? 'full' : 'part') : 'none';
  let lamp;
  if (time === 'day') lamp = panel === 'strong' ? 'on' : charge === 'none' ? 'off' : 'short';
  else lamp = charge === 'full' ? 'on' : charge === 'part' ? 'short' : 'off';
  return { status: 'ok', panel, charge, lamp };
}

// Light and sight. We see an object when light from a source reaches it
// and then reaches our eyes. A card blocks light; clear glass lets it pass.
export function light(_layout, v) {
  const { torch = 'on', blocker = 'none', holes = 'lined', room = 'dark' } = v;
  const sourceOn = torch === 'on' || room === 'sunlit';
  const blocked = blocker === 'card' || holes === 'not';
  const reaches = sourceOn && !blocked;
  return {
    status: 'ok',
    sourceOn,
    reaches,
    seen: reaches,
    shadow: sourceOn && blocker === 'card',
  };
}

// Responsible energy use. A light left on in an empty room is waste; an
// occupied room left dark is not a fair saving either.
export function rooms(layout, v) {
  const wasted = [];
  const dark = [];
  for (const r of layout.rooms) {
    const on = v[r.id] === 'on';
    if (on && !r.occupied) wasted.push(r.id);
    if (!on && r.occupied) dark.push(r.id);
  }
  return { status: 'ok', wasted, dark, fair: wasted.length === 0 && dark.length === 0 };
}

const MODEL_RULES = { catalogue, solar, light, rooms };

export function runModel(layout, settings) {
  if (CIRCUIT_RULES.has(layout.rule)) return runCircuitRule(layout.rule, applySettings(layout, settings));
  const fn = MODEL_RULES[layout.rule];
  if (!fn) return { status: 'unavailable', reason: 'missing_rule', rule: layout.rule, lit: {} };
  return fn(layout, { ...(layout.initial || {}), ...(settings.values || {}) });
}

// Did this result meet the layout's job? Circuits: every required bulb lit.
export function meetsGoal(layout, result) {
  if (!result || result.status === 'unavailable' || result.status === 'unsupported') return false;
  if (layout.goal) return layout.goal(result) === true;
  return allLit(result, layout.required || []);
}

export const isCircuit = (layout) => CIRCUIT_RULES.has(layout.rule);
