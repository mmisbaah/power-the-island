// Power the Island: circuit model.
//
// A circuit is stored as topology. Terminals are nodes; a metal connector,
// a closed switch or a bulb filament is a conducting edge between two
// terminals. Drawing coordinates are never read here, so two wires that
// cross on screen are not joined unless they share a terminal ID.
//
// Supported: one battery and a single series loop. Branches (parallel
// networks), loops with no bulb (short circuits) and mains parts are
// rejected as unsupported instead of being given a guessed result.

export const MATERIALS = {
  metal: { conducts: true, label: 'Metal wire' },
  plastic: { conducts: false, label: 'Plastic strip' },
  missing: { conducts: false, label: 'Gap' },
  foil: { conducts: true, label: 'Kitchen foil' },
  paperclip: { conducts: true, label: 'Steel paperclip' },
  coin: { conducts: true, label: 'Metal coin' },
  wood: { conducts: false, label: 'Wooden stick' },
  string: { conducts: false, label: 'Cotton string' },
  rubber: { conducts: false, label: 'Rubber band' },
  coated: { conducts: true, label: 'Plastic-coated wire, bare metal ends' },
  // Looks like any other wire on screen; its break is inside. Used for
  // systematic fault finding, where the learner must test to find it.
  broken: { conducts: false, label: 'Old wire' },
  old: { conducts: true, label: 'Old wire' },
};

const COMPONENT_TYPES = new Set(['battery', 'bulb', 'switch']);
const UNSUPPORTED_TYPES = new Set(['mains', 'socket', 'plug']);

function result(status, extra = {}) {
  return { status, lit: {}, path: [], ...extra };
}

export function evaluateCircuit(circuit) {
  if (!circuit || !Array.isArray(circuit.terminals) || !Array.isArray(circuit.components)) {
    return result('unavailable', { reason: 'malformed_circuit' });
  }
  const terminals = new Set(circuit.terminals);
  if (terminals.size !== circuit.terminals.length) {
    return result('unavailable', { reason: 'duplicate_terminal' });
  }

  const adj = new Map(circuit.terminals.map((t) => [t, []]));
  const addEdge = (id, kind, a, b) => {
    adj.get(a).push({ id, kind, to: b });
    adj.get(b).push({ id, kind, to: a });
  };

  let battery = null;
  const bulbs = [];
  for (const c of circuit.components) {
    if (UNSUPPORTED_TYPES.has(c.type)) return result('unsupported', { reason: 'mains' });
    if (!COMPONENT_TYPES.has(c.type)) return result('unavailable', { reason: 'unknown_component' });
    const [a, b] = c.terminals || [];
    if (!terminals.has(a) || !terminals.has(b) || a === b) {
      return result('unavailable', { reason: 'bad_terminals', id: c.id });
    }
    if (c.type === 'battery') {
      if (battery) return result('unsupported', { reason: 'multiple_sources' });
      battery = c;
    } else if (c.type === 'bulb') {
      // A bulb taken out of its holder leaves its two terminals unjoined.
      bulbs.push(c);
      if (!c.removed) addEdge(c.id, 'bulb', a, b);
    } else if (c.type === 'switch') {
      if (typeof c.closed !== 'boolean') return result('unavailable', { reason: 'switch_state', id: c.id });
      if (c.closed) addEdge(c.id, 'switch', a, b);
    }
  }
  if (!battery) return result('unavailable', { reason: 'no_source' });

  for (const w of circuit.connectors || []) {
    const material = MATERIALS[w.material];
    if (!material) return result('unavailable', { reason: 'unknown_material', id: w.id });
    if (!terminals.has(w.from) || !terminals.has(w.to) || w.from === w.to) {
      return result('unavailable', { reason: 'bad_terminals', id: w.id });
    }
    if (material.conducts) addEdge(w.id, 'wire', w.from, w.to);
  }

  const [plus, minus] = battery.terminals;
  for (const [t, edges] of adj) {
    const limit = t === plus || t === minus ? 1 : 2;
    if (edges.length > limit) return result('unsupported', { reason: 'parallel_networks', at: t });
  }

  // Every terminal has at most two conducting edges, so the route from the
  // positive terminal is a single walk with no choices to make.
  const path = [];
  let cur = plus;
  let came = null;
  for (let steps = 0; steps <= adj.size; steps++) {
    const next = adj.get(cur).find((e) => e.id !== came);
    if (!next) break;
    path.push(next.id);
    came = next.id;
    cur = next.to;
    if (cur === minus) {
      const onPath = new Set(path);
      const litBulbs = bulbs.filter((b) => onPath.has(b.id));
      if (litBulbs.length === 0) return result('unsupported', { reason: 'short_circuit_layouts', path });
      const lit = Object.fromEntries(bulbs.map((b) => [b.id, onPath.has(b.id)]));
      return result('closed', { lit, path });
    }
  }
  return result('open', { lit: Object.fromEntries(bulbs.map((b) => [b.id, false])), path });
}

const RULES = {
  closed_conducting_loop: evaluateCircuit,
};

// Missions name their rule. A rule we do not have returns 'unavailable';
// the game shows a message instead of inventing a scientific result.
export function runRule(ruleName, circuit) {
  const rule = RULES[ruleName];
  if (!rule) return result('unavailable', { reason: 'missing_rule', rule: ruleName });
  return rule(circuit);
}

// Build a concrete circuit from a mission layout plus the learner's settings.
export function applySettings(layout, settings) {
  return {
    terminals: layout.terminals,
    components: layout.components.map((c) => {
      if (c.type === 'switch') return { ...c, closed: settings.switches?.[c.id] ?? c.closed };
      if (c.type === 'bulb') return { ...c, removed: settings.bulbs?.[c.id] === false };
      return { ...c };
    }),
    connectors: layout.connectors.map((w) => ({
      ...w,
      material: settings.connectors?.[w.id] ?? w.material,
    })),
  };
}

export function allLit(res, bulbIds) {
  return res.status === 'closed' && bulbIds.every((id) => res.lit[id]);
}
