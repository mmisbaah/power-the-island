// Generated circuit missions. Each house changes the parts, their order,
// where the faults are, which materials are tested and the scene.

import { loop, tester } from '../../layouts.js';
import { crossing } from '../grade4.js';
import { ok, no, opt, lit, dark, sw, conn, bulbIn, and, allOff, noGaps, onlyChanged } from '../helpers.js';
import { generated, nameFor, placeFor, cap } from './common.js';

const S = (id = 'sw', label = 'Switch', closed = true) => ({ id, type: 'switch', label, closed });
const B = (i, n) => (n === 1 ? { id: 'bulb', type: 'bulb', label: 'Bulb' } : { id: `b${i}`, type: 'bulb', label: `Bulb ${i}` });
const bulbs = (n) => Array.from({ length: n }, (_, i) => B(i + 1, n));
const L = 'ABCDEFG';
const wire = (i) => `w${L[i]}`;
const SCENES = ['bench', 'noticeboard', 'path-night'];
const CONDUCTORS = ['metal', 'foil', 'paperclip', 'coin'];
const INSULATORS = ['plastic', 'wood', 'string', 'rubber'];
const MAT = { metal: 'metal wire', foil: 'kitchen foil', paperclip: 'a steel paperclip', coin: 'a metal coin', plastic: 'a plastic strip', wood: 'a wooden stick', string: 'cotton string', rubber: 'a rubber band', coated: 'coated wire' };
const allLitT = (t) => t.result.status === 'closed' && Object.values(t.result.lit).every(Boolean);
const missingCount = (t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length;

// Put a switch into a row of bulbs at a given position.
function arrange(n, swPos, closed = true) {
  const parts = bulbs(n);
  parts.splice(swPos % (n + 1), 0, S('sw', 'Switch', closed));
  return parts;
}

function ctx(grade, number, house) {
  const place = placeFor(grade, number, house);
  return {
    place, tplace: placeFor(grade, number, house, 1),
    name: nameFor(grade, number, house),
    scene: SCENES[(number + house) % SCENES.length],
    tscene: SCENES[(number + house + 1) % SCENES.length],
  };
}
const base = (grade, number, house, lesson) => ({ grade, number, house, lesson: `Science Lagoon lesson: ${lesson}` });

export function circuitMission(grade, number, house) {
  const c = ctx(grade, number, house);
  const key = `${grade}-${number}`;
  const kit = `the ${c.place.short.toLowerCase()} light kit`;
  switch (key) {
    case '4-1': {
      const n = house % 3 === 0 ? 2 : 1;
      const parts = arrange(n, house);
      const wires = Object.fromEntries(parts.map((_, i) => [i, 'missing']).concat([[parts.length, 'missing']]));
      const tparts = arrange(n === 1 ? 2 : 1, house + 1, false);
      return generated({
        ...base(grade, number, house, 'Simple circuits'), title: `Close the loop: ${c.place.short.toLowerCase()} kit`, concept: 'complete_circuit',
        goal: 'Build a complete circuit and explain the conducting path.',
        brief: [`${cap(kit)} in pieces`, `${c.name} unpacked ${kit}. Every wire is loose.`, `A battery, a switch and ${n} bulb${n > 1 ? 's' : ''} with no wires joining them.`],
        predict: ['If one wire is still missing, will it light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('most', 'Most of the path is there'), opt('all', 'The whole path is needed'), opt('guess', 'Just a guess')]],
        lab: ['Build the loop', 'Add wires and test. Try one test before every wire is in.', loop({ parts, wires, scene: c.scene, controls: { connectors: parts.map((_, i) => i).concat(parts.length), materials: ['metal'] } }), 'Parts with empty wire places.'],
        evidence: [['part', 'One wire still missing: off', and((t) => missingCount(t) === 1, allOff)], ['whole', 'Every wire in: on', allLitT]],
        explain: { q: 'Why did it light only at the end?', choices: [ok('loop', 'There was a complete loop from + through the bulbs and back to −'), no('most', 'Enough wires were connected', 'One gap kept it off.'), no('warm', 'The battery warmed up', 'The battery did not change.')], evidenceQ: 'Which test shows one gap is enough to stop it?', evidenceTest: and((t) => missingCount(t) >= 1, allOff), hints: ['Look at the test with one gap.', 'The path must be complete.', 'Gap: off. No gaps: on.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} kit`, text: 'This kit has an open switch and one missing wire.', alt: 'A loop with an open switch and a gap.', layout: loop({ parts: tparts, wires: { [tparts.length]: 'missing' }, scene: c.tscene, controls: { switches: ['sw'], connectors: [tparts.length], materials: ['metal'] } }), q: 'What did this circuit need?', choices: [ok('both', 'The gap filled and the switch closed'), no('order', 'The parts in a different order', 'Order does not matter in one loop.')], hints: ['Follow the path.', 'Two things break it.', 'Fill the gap; close the switch.'] }],
        idea: 'A circuit works only with a complete loop from the battery’s + end, through every part, back to the − end.',
      });
    }
    case '4-3': {
      const n = house % 2 ? 1 : 2;
      const parts = [S(), ...bulbs(n)];
      const gap = house % (parts.length + 1);
      const ids = parts.filter((p) => p.type === 'bulb').map((p) => p.id);
      const cross = ['tA', 'tB', 'tC', 'tD'][house % 4];
      return generated({
        ...base(grade, number, house, 'Conductors and insulators'), title: `Find the hidden gap at ${c.place.short.toLowerCase()}`, concept: 'complete_conducting_path',
        goal: 'Diagnose why a circuit with a closed switch still does not light.',
        brief: [`${cap(kit)} is dead`, `At ${c.place.name}, the switch is closed but nothing lights. Find out why.`, `A loop with a closed switch and ${n} bulb${n > 1 ? 's' : ''}.`],
        predict: ['The switch is closed. Will it light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('switch', 'The switch is closed'), opt('gap', 'There may be a gap'), opt('battery', 'The battery may be flat')]],
        lab: ['Inspect and test', 'Find and fix the gap, test, then swap one wire for plastic and test again.', loop({ parts, wires: { [gap]: 'missing' }, scene: c.scene, controls: { switches: ['sw'], connectors: parts.map((_, i) => i).concat(parts.length), materials: ['metal', 'plastic'] } }), 'A loop with a hidden gap.'],
        misconception: { after: 2, message: 'The switch is closed. Follow the rest of the path to find a gap.' },
        evidence: [['lit', 'Switch closed, every wire metal: lit', and(sw('sw', true), (t) => Object.values(t.settings.connectors).every((m) => m === 'metal'), allLitT)], ['plastic', 'Switch closed, one plastic strip: off', and(sw('sw', true), (t) => Object.values(t.settings.connectors).filter((m) => m === 'plastic').length === 1, noGaps, allOff)]],
        explain: { q: 'Why did it light in only one test?', choices: [ok('loop', 'It needs a complete loop of conducting material; a closed switch is not enough'), no('switch', 'Closing the switch is enough', 'With plastic in, the switch was closed but it stayed off.'), no('usedup', 'The plastic used up the electricity', 'Plastic does not let current pass; nothing is used up.')], evidenceQ: 'Which test shows a closed switch is not enough?', evidenceTest: and(sw('sw', true), (t) => !t.result.lit[ids[0]]), hints: ['Compare your tests.', 'Plastic is an insulator.', 'Only the connector changed.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} board`, text: 'Two wires cross on this board. The switch is closed and the bulb is off.', alt: 'A figure-of-eight circuit with crossing wires.', layout: crossing({ gap: house % 2 ? cross : null, plastic: house % 2 ? null : cross }), q: 'Which idea helped here?', choices: [ok('loop', 'It lights only with a complete conducting loop'), no('cross', 'The crossing wires join', 'Crossing wires do not touch.')], hints: ['Follow the path.', 'Look at every connector.', 'Fix the fault and test.'] }],
        idea: 'A closed switch cannot make up for a gap or an insulator elsewhere in the loop.',
      });
    }
    case '4-4': {
      const n = house % 3 === 2 ? 2 : 1;
      const parts = arrange(n, house + 1, false);
      const tparts = arrange(n === 1 ? 2 : 1, house + 2, false);
      return generated({
        ...base(grade, number, house, 'Simple circuits'), title: `What a switch does at ${c.place.short.toLowerCase()}`, concept: 'switch_as_gap',
        goal: 'Explain a switch as a gap you can open and close.',
        brief: [`The switch at ${c.place.name}`, `Every wire in ${kit} is metal. Only the switch changes.`, 'A loop with an open switch.'],
        predict: ['When the switch is open, is there a gap?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('gap', 'Open means the ends do not touch'), opt('power', 'The switch makes electricity'), opt('guess', 'Just a guess')]],
        lab: ['Open and close', 'Change the switch and test.', loop({ parts, scene: c.scene, controls: { switches: ['sw'] } }), 'A loop with a switch.'],
        evidence: [['open', 'Switch open: off', and(sw('sw', false), allOff)], ['closed', 'Switch closed: on', and(sw('sw', true), allLitT)]],
        explain: { q: 'What does a switch do?', choices: [ok('gap', 'It opens or closes a gap in the loop'), no('makes', 'It makes the electricity', 'The battery is the source.'), no('stores', 'It stores electricity', 'Nothing is stored in a switch.')], hints: ['Look at the open switch.', 'Open = gap.', 'Closed: joined.'] },
        transfer: [{ heading: `Switch somewhere else`, text: 'Here the switch is in a different place in the loop.', alt: 'A different loop with an open switch.', layout: loop({ parts: tparts, scene: c.tscene, controls: { switches: ['sw'] } }), q: 'Did the switch still control it?', choices: [ok('yes', 'Yes, a gap anywhere stops it'), no('no', 'No, the switch must be first', 'Test it: it works here too.')], hints: ['Close the switch.', 'One loop, one path.', 'Test.'] }],
        idea: 'A switch is a gap you can open and close.',
      });
    }
    case '4-6': {
      const n = house % 2 ? 1 : 2;
      const parts = [S(), ...bulbs(n)];
      const w = parts.length + 1;
      const g1 = house % w;
      const g2 = (house + 2) % w === g1 ? (g1 + 1) % w : (house + 2) % w;
      const tparts = [S(), ...bulbs(n === 1 ? 2 : 1)];
      const tw = tparts.length + 1;
      return generated({
        ...base(grade, number, house, 'Simple circuits'), title: `Two gaps at ${c.place.short.toLowerCase()}`, concept: 'complete_conducting_path',
        goal: 'Show that every gap must be fixed before it lights.',
        brief: [`Double trouble at ${c.place.name}`, `${cap(kit)} has more than one problem.`, 'A loop with two missing wires.'],
        predict: ['If you fix one gap, will it light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('one', 'One fix is enough'), opt('every', 'Every gap matters'), opt('guess', 'Just a guess')]],
        lab: ['Fix the gaps', 'Fix one gap and test, then the other.', loop({ parts, wires: { [g1]: 'missing', [g2]: 'missing' }, scene: c.scene, controls: { connectors: Array.from({ length: w }, (_, i) => i), materials: ['metal', 'plastic'] } }), 'A loop with two gaps.'],
        evidence: [['one', 'One gap left: off', and((t) => missingCount(t) === 1, allOff)], ['both', 'Both fixed with metal: on', allLitT]],
        explain: { q: 'Why did one fix not work?', choices: [ok('every', 'One gap anywhere breaks the loop'), no('first', 'I fixed the wrong one first', 'Either gap alone stops it.'), no('more', 'It needed more wires to be bright', 'It is about a complete path.')], hints: ['Look at the test after the first fix.', 'Was there still a gap?', 'One gap: off.'] },
        transfer: [{ heading: `Another kit`, text: 'This kit also has two gaps.', alt: 'A loop with two gaps.', layout: loop({ parts: tparts, wires: { 0: 'missing', [tw - 1]: 'missing' }, scene: c.tscene, controls: { connectors: Array.from({ length: tw }, (_, i) => i), materials: ['metal', 'plastic'] } }), q: 'What did you need to do?', choices: [ok('all', 'Fill every gap with metal'), no('one', 'Fill the nearest gap', 'Any gap stops the loop.')], hints: ['Find every gap.', 'Fill each with metal.', 'Test.'] }],
        idea: 'Any single gap breaks the loop. Every gap must be fixed with a conductor.',
      });
    }
    case '4-7': {
      const faults = ['tA', 'tB', 'tC', 'tD'];
      const f = faults[house % 4];
      const kind = house % 3 === 0 ? 'gap' : 'plastic';
      const tparts = [S(), ...bulbs(house % 2 ? 2 : 1)];
      return generated({
        ...base(grade, number, house, 'Circuit diagrams'), title: `Trace the route: ${c.place.short.toLowerCase()} board`, concept: 'topology_not_appearance',
        goal: 'Follow a loop by its joins, not by where wires cross.',
        brief: [`The tangled board at ${c.place.name}`, `Two wires cross on this board. One connector is faulty. Trace the real route.`, 'A figure-of-eight circuit.'],
        predict: ['Do wires that cross make a connection?', [opt('yes', 'Yes'), opt('no', 'No')]],
        lab: ['Trace and fix', 'Follow the path part by part. Fix the fault, then test.', crossing(kind === 'gap' ? { gap: f } : { gap: null, plastic: f }), 'A figure-of-eight circuit.'],
        evidence: [['before', 'Fault still in: off', and((t) => t.settings.connectors[f] !== 'metal', dark('boardBulb'))], ['after', 'Fixed: on', lit('boardBulb')]],
        explain: { q: 'How do you know crossing wires do not join?', choices: [ok('ends', 'Connections are only where wire ends meet a terminal'), no('touch', 'Crossing wires always join', 'If they joined, the fault could be skipped. It was not.'), no('colour', 'They are different colours', 'Colour does not decide connections.')], hints: ['Use Follow the path.', 'Each wire runs from one terminal to another.', 'Crossing is not joining.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} loop`, text: 'A simple loop with one plastic connector.', alt: 'A loop with plastic.', layout: loop({ parts: tparts, wires: { [house % (tparts.length + 1)]: 'plastic' }, scene: c.tscene, controls: { connectors: Array.from({ length: tparts.length + 1 }, (_, i) => i), materials: ['metal', 'plastic'] } }), q: 'What did you change?', choices: [ok('plastic', 'Swapped the plastic for metal'), no('switch', 'Pressed the switch', 'The switch was closed.')], hints: ['Follow the path.', 'Which is not metal?', 'Swap it.'] }],
        idea: 'A circuit is defined by its joins. Crossing wires are not connected unless their ends meet.',
      });
    }
    case '4-9': {
      const n = house % 2 ? 2 : 1;
      const parts = [S('sw', 'Switch', false), ...bulbs(n)];
      const w = parts.length + 1;
      const p1 = house % w;
      const p2 = (house + 1) % w;
      return generated({
        ...base(grade, number, house, 'Fixing circuits'), title: `Fix the light at ${c.place.short.toLowerCase()}`, concept: 'diagnosis',
        goal: 'Find and fix more than one kind of fault.',
        brief: [`Everything is wrong at ${c.place.name}`, `${cap(kit)} has a gap, a plastic strip and an open switch.`, 'A loop with three faults.'],
        predict: ['How many faults must you fix?', [opt('one', 'One'), opt('two', 'Two'), opt('three', 'Three')]],
        lab: ['Fix every fault', 'Fix one fault at a time and test.', loop({ parts, wires: { [p1]: 'plastic', [p2]: 'missing' }, scene: c.scene, controls: { switches: ['sw'], connectors: Array.from({ length: w }, (_, i) => i), materials: ['metal', 'plastic'] } }), 'A loop with faults.'],
        evidence: [['partial', 'Switch closed but a fault left: off', and(sw('sw', true), allOff)], ['fixed', 'All fixed: on', allLitT]],
        explain: { q: 'Why did it stay off after you closed the switch?', choices: [ok('other', 'Other faults still broke the loop'), no('switch', 'The switch was broken', 'It worked once the rest was fixed.')], evidenceQ: 'Which test shows the switch was not the only problem?', evidenceTest: and(sw('sw', true), allOff), hints: ['Look at the test with the switch closed.', 'Was there still a fault?', 'All faults must go.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} board`, text: 'This crossing board has two faults.', alt: 'A crossing circuit with two faults.', layout: crossing({ gap: ['tA', 'tB', 'tC', 'tD'][house % 4], plastic: ['tA', 'tB', 'tC', 'tD'][(house + 2) % 4] }), q: 'How did you find both faults?', choices: [ok('trace', 'I followed the whole loop'), no('switch', 'I kept pressing the switch', 'The switch was closed.')], hints: ['Follow the path.', 'Check every connector.', 'Fix both.'] }],
        idea: 'A circuit can have several faults. Follow the whole loop to find them all.',
      });
    }
    case '4-10': {
      const ins = INSULATORS.slice(1)[house % 3];
      const n = house % 2 ? 2 : 1;
      const parts = [S('sw', 'Switch', false), ...bulbs(n)];
      const p = house % (parts.length + 1);
      const tparts = [S(), ...bulbs(n === 1 ? 2 : 1)];
      const tp = (house + 1) % (tparts.length + 1);
      return generated({
        ...base(grade, number, house, 'Fixing circuits'), title: `Circuit detective at ${c.place.short.toLowerCase()}: the ${MAT[ins].replace(/^a /, '')}`, concept: 'diagnosis_with_evidence',
        goal: 'Use test results as evidence for which part was faulty.',
        brief: [`Who broke it?`, `${cap(kit)} is off. Was it the switch, or the ${MAT[ins].replace(/^a /, '')} someone used as a wire?`, `A loop with an open switch and ${MAT[ins]} in place of a wire.`],
        predict: ['Which do you think is the problem?', [opt('switch', 'The switch'), opt('mat', `The ${MAT[ins].replace(/^a /, '')}`), opt('both', 'Both')]],
        lab: ['Collect evidence', 'Change one thing at a time and test.', loop({ parts, wires: { [p]: ins }, scene: c.scene, controls: { switches: ['sw'], connectors: Array.from({ length: parts.length + 1 }, (_, i) => i), materials: ['metal', ins] } }), 'A loop with a non-metal connector.'],
        evidence: [['mat', `Switch closed, ${ins} still in: off`, and(sw('sw', true), conn(wire(p), ins), allOff)], ['fixed', 'Both fixed: on', allLitT]],
        explain: { q: 'What was wrong?', choices: [ok('both', `Both: the open switch and the ${MAT[ins].replace(/^a /, '')} each broke the loop`), no('switch', 'Only the switch', `With the switch closed and the ${ins} in, it stayed off.`), no('mat', `Only the ${MAT[ins].replace(/^a /, '')}`, 'The switch was open too.')], evidenceQ: `Which test proves the ${MAT[ins].replace(/^a /, '')} was a problem?`, evidenceTest: and(sw('sw', true), conn(wire(p), ins), allOff), hints: ['Change one thing, then test.', 'Which test had the switch closed but failed?', 'Both faults had to go.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} puzzle`, text: 'One hidden problem in this loop.', alt: 'A loop with one plastic connector.', layout: loop({ parts: tparts, wires: { [tp]: 'plastic' }, scene: c.tscene, controls: { switches: ['sw'], connectors: Array.from({ length: tparts.length + 1 }, (_, i) => i), materials: ['metal', 'plastic'] } }), q: 'How do you know you found the fault?', choices: [ok('test', 'Changing only that connector made it light'), no('look', 'It looked wrong', 'The test is the evidence.')], hints: ['Follow the path.', 'Change one thing.', 'Test.'] }],
        idea: 'Change one thing at a time and test. The result is your evidence.',
      });
    }
    case '5-4': {
      const n = house % 2 ? 2 : 1;
      const parts = [S('sw', 'Switch', false), ...bulbs(n)];
      const after = parts.length; // the wire from the last bulb back to the battery
      const CLIP = { metal: 'Clipped in', missing: 'Unclipped' };
      return generated({
        ...base(grade, number, house, 'Energy transfers'), title: `Current is not used up at ${c.place.short.toLowerCase()}`, concept: 'current_vs_energy',
        goal: 'Explain that current flows all the way round while energy is transferred.',
        brief: ['A common mix-up', `${c.name} says: “The bulb uses up the current, so none comes back.” Test it with ${kit}.`, 'A loop with a switch and bulbs.'],
        predict: ['Is there current in the wire after the last bulb?', [opt('yes', 'Yes, the same'), opt('less', 'Less'), opt('none', 'None')]],
        lab: ['Test the loop', 'Close the switch and test. Then unclip the wire after the last bulb.', loop({ parts, scene: c.scene, controls: { switches: ['sw'], connectors: [after], materials: ['metal', 'missing'], materialLabels: CLIP } }), 'A loop with a switch.'],
        evidence: [['on', 'Lit', allLitT], ['after', 'Wire after the last bulb unclipped: off', and(conn(wire(after), 'missing'), sw('sw', true), allOff)]],
        explain: { q: 'Why does unclipping the wire after the bulb turn it off?', choices: [ok('loop', 'Current must flow all the way round; it is not used up'), no('used', 'The bulb had used up the current anyway', 'If so, that wire would not matter. It did.'), no('recharge', 'The battery needs it back to recharge', 'The battery does not recharge here.')], hints: ['Look at the unclipped test.', 'The wire after the bulb matters.', 'Current flows round the whole loop.'] },
        transfer: [{ heading: 'Unclip a different wire', text: 'Now a wire before the bulbs is unclipped.', alt: 'A loop with an unclipped wire.', layout: loop({ parts: [S(), ...bulbs(n === 1 ? 2 : 1)], wires: { 0: 'missing' }, scene: c.tscene, controls: { connectors: [0], materials: ['metal', 'missing'], materialLabels: CLIP } }), q: 'Is current used up along the loop?', choices: [ok('no', 'No; the same current flows all the way round'), no('yes', 'Yes, it runs out', 'The bulbs light together or not at all.')], hints: ['Clip it in.', 'Test.', 'All parts light together.'] }],
        idea: 'Current flows round the whole loop and is not used up. Energy from the battery is what is transferred.',
      });
    }
    case '6-1': {
      const n = house % 2 ? 3 : 2;
      const out = `b${(house % n) + 1}`;
      const l = loop({ parts: arrange(n, house), scene: c.scene, controls: { switches: ['sw'], bulbs: [out] } });
      l.initialBulbs = { [out]: false };
      const tn = n === 2 ? 3 : 2;
      const tout = `b${((house + 1) % tn) + 1}`;
      const tl = loop({ parts: arrange(tn, house + 1), scene: c.tscene, controls: { bulbs: [tout] } });
      tl.initialBulbs = { [tout]: false };
      return generated({
        ...base(grade, number, house, 'Series circuits'), title: `${n} bulbs, one loop at ${c.place.short.toLowerCase()}`, concept: 'series_circuit',
        goal: 'Explain a series circuit without claiming current is used up.',
        brief: [`Lights for ${c.place.name}`, `${n} identical bulbs go in one loop. Bulb ${out.slice(1)}’s holder is empty for now.`, `A loop with ${n} bulb holders, one empty.`],
        predict: ['With one holder empty, will the other bulbs light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('own', 'They have their own wires'), opt('loop', 'The empty holder is a gap'), opt('guess', 'Just a guess')]],
        lab: ['Fill the loop', 'Put the bulb in or take it out, use the switch, and test.', l, 'A loop with bulb holders.'],
        evidence: [['empty', 'Holder empty: all off', and(bulbIn(out, false), sw('sw', true), allOff)], ['all', 'All in: all on', allLitT]],
        explain: { q: 'Trace the current when all are lit.', choices: [ok('route', 'From +, through each bulb in turn, back to −; the same current all the way'), no('used', 'The first bulb uses some, so the next gets less', 'Current is not used up.'), no('split', 'The current splits between bulbs', 'There is only one path.')], hints: ['Look at the empty-holder test.', 'One path only.', '+ → each bulb → −.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} lights`, text: `${tn} bulbs in one loop; one is out.`, alt: 'A loop with one empty holder.', layout: tl, q: 'Why were all off with one bulb out?', choices: [ok('loop', 'The empty holder broke the only path'), no('last', 'The current ran out', 'Current does not run out.')], hints: ['Put the bulb in.', 'One loop.', 'Test.'] }],
        idea: 'In a series circuit there is one path. The same current flows through every bulb.',
      });
    }
    case '6-2': {
      const n = house % 2 ? 3 : 2;
      const parts = arrange(n, house % 2 ? 0 : n);
      const bIdx = parts.map((p, i) => (p.type === 'bulb' ? i : -1)).filter((i) => i >= 0);
      const before = bIdx[0];
      const between = bIdx[0] + 1;
      const afterW = bIdx[bIdx.length - 1] + 1;
      const CLIP = { metal: 'Clipped in', missing: 'Unclipped' };
      const one = (w) => and(conn(wire(w), 'missing'), (t) => missingCount(t) === 1, allOff);
      return generated({
        ...base(grade, number, house, 'Series circuits'), title: `Break anywhere: ${n} bulbs at ${c.place.short.toLowerCase()}`, concept: 'series_fault',
        goal: 'Predict that a single break anywhere turns all bulbs off.',
        brief: ['Where does it matter?', `Unclip one wire at a time in ${kit}: before, between and after the bulbs.`, `A loop with ${n} bulbs.`],
        predict: ['If you unclip a wire between two bulbs, what happens?', [opt('all', 'All go off'), opt('after', 'Only bulbs after it go off'), opt('none', 'Nothing')]],
        lab: ['Break the loop', 'Unclip one wire, test, clip it back. Try different places.', loop({ parts, scene: c.scene, controls: { connectors: Array.from({ length: parts.length + 1 }, (_, i) => i), materials: ['metal', 'missing'], materialLabels: CLIP } }), `A loop with ${n} bulbs.`],
        evidence: [['before', 'Break before the bulbs: all off', one(before)], ['between', 'Break between bulbs: all off', one(between)], ['after', 'Break after the bulbs: all off', one(afterW)]],
        explain: { q: 'What rule fits all your tests?', choices: [ok('any', 'A break anywhere in a series loop stops the current everywhere'), no('after', 'Only bulbs after the break go off', 'The break after the bulbs turned all off too.'), no('first', 'The first bulb stays on', 'It went off every time.')], hints: ['Compare all three tests.', 'Did the position matter?', 'Every break: all off.'] },
        transfer: [{ heading: 'Find the break', text: 'One wire is unclipped somewhere.', alt: 'A loop with an unclipped wire.', layout: loop({ parts: arrange(n === 2 ? 3 : 2, house + 1), wires: { [house % 3]: 'missing' }, scene: c.tscene, controls: { connectors: Array.from({ length: (n === 2 ? 3 : 2) + 2 }, (_, i) => i), materials: ['metal', 'missing'], materialLabels: CLIP } }), q: 'Before you fixed it, which bulbs were off?', choices: [ok('all', 'All of them'), no('some', 'Only some', 'One break stops them all.')], hints: ['Find the unclipped wire.', 'Clip it in.', 'Test.'] }],
        idea: 'In a series loop, a break anywhere stops the current everywhere.',
      });
    }
    case '6-4': {
      const n = house % 2 ? 4 : 3;
      const parts = arrange(n, house);
      const mid = `b${2 + (house % (n - 2))}`;
      const others = Array.from({ length: n }, (_, i) => `b${i + 1}`).filter((b) => b !== mid);
      const tl = loop({ parts: arrange(2, house + 1), wires: { [house % 4]: 'missing' }, scene: c.tscene, controls: { bulbs: ['b1'], connectors: [house % 4], materials: ['metal', 'missing'], materialLabels: { metal: 'Clipped in', missing: 'Unclipped' } } });
      tl.initialBulbs = { b1: false };
      return generated({
        ...base(grade, number, house, 'Series circuits'), title: `Take a bulb out: ${n} lights at ${c.place.short.toLowerCase()}`, concept: 'series_circuit',
        goal: 'Predict what happens when one bulb in a series loop is removed.',
        brief: [`The lights at ${c.place.name}`, `${n} bulbs in one loop light ${c.place.name}. One will be replaced.`, `A loop with ${n} bulbs.`],
        predict: [`If you take out bulb ${mid.slice(1)}, what happens to the others?`, [opt('stay', 'They stay on'), opt('off', 'They go off'), opt('brighter', 'They get brighter')]],
        lab: ['Remove bulbs', 'Take bulbs out and put them back. Test each time.', loop({ parts, scene: c.scene, controls: { bulbs: Array.from({ length: n }, (_, i) => `b${i + 1}`) } }), `A loop with ${n} bulbs.`],
        evidence: [['out', `Bulb ${mid.slice(1)} out: the others off`, and(bulbIn(mid, false), ...others.map((b) => dark(b)))], ['all', 'All in: all on', allLitT]],
        explain: { q: 'Why did removing one bulb turn the others off?', choices: [ok('gap', 'The empty holder left a gap in the only path'), no('share', 'The bulbs share power', 'The path was broken.'), no('bright', 'The others got too bright', 'They went off straight away.')], hints: ['Look at the empty holder.', 'Is the loop complete?', 'Empty holder = gap.'] },
        transfer: [{ heading: 'Two problems', text: 'A bulb is out and a wire is unclipped.', alt: 'A loop with an empty holder and an unclipped wire.', layout: tl, q: 'What did you need to fix?', choices: [ok('both', 'Put the bulb back and clip the wire in'), no('one', 'Only the wire', 'The holder was still a gap.')], hints: ['Check every part.', 'Two gaps.', 'Fix both.'] }],
        idea: 'Removing a bulb from a series loop leaves a gap, so every other bulb goes off.',
      });
    }
    case '6-5': {
      const n = house % 2 ? 3 : 2;
      const parts = [S(), ...bulbs(n)];
      const w = parts.length + 1;
      const bad = house % w;
      const OLD = { metal: 'New wire', broken: 'Old wire', old: 'Old wire' };
      const wires = Object.fromEntries(Array.from({ length: w }, (_, i) => [i, i === bad ? 'broken' : 'old']));
      const tn = n === 2 ? 3 : 2;
      const tw = tn + 2;
      const tbad = (house + 2) % tw;
      const twires = Object.fromEntries(Array.from({ length: tw }, (_, i) => [i, i === tbad ? 'broken' : 'old']));
      const newCount = (t) => Object.values(t.settings.connectors).filter((m) => m === 'metal').length;
      return generated({
        ...base(grade, number, house, 'Fixing circuits'), title: `The faulty wire at ${c.place.short.toLowerCase()}`, concept: 'systematic_fault_finding',
        goal: 'Use one-change-at-a-time testing to find a fault you cannot see.',
        brief: ['Looks fine, does not work', `All the wires in ${kit} look the same, but the lights are off. One old wire is broken inside.`, `A loop with ${n} bulbs and ${w} old wires.`],
        predict: ['What is the best way to find it?', [opt('one', 'Replace one wire at a time and test'), opt('all', 'Replace all at once'), opt('look', 'Look closely')]],
        lab: ['Test systematically', 'Swap one old wire for a new one, test, and keep going.', loop({ parts, wires, scene: c.scene, controls: { connectors: Array.from({ length: w }, (_, i) => i), materials: ['metal'], materialLabels: OLD } }), 'A loop with old wires.'],
        evidence: [['one', 'A test with only one wire replaced', { all: (ts) => ts.some((t) => newCount(t) === 1) }], ['found', 'Replacing just the broken wire lit them', and(allLitT, (t) => newCount(t) === 1)]],
        explain: { q: 'Why replace one wire at a time?', choices: [ok('evidence', 'Then each test tells you about one wire'), no('fast', 'It is faster', 'The point is clear evidence.'), no('all', 'Replacing all tells you which was broken', 'Then you cannot tell which mattered.')], hints: ['Look at your tests in order.', 'One change per test.', 'The test that lit points to the fault.'] },
        transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} lights`, text: `${tn} bulbs and ${tw} old wires. One is broken.`, alt: 'A loop with old wires.', layout: loop({ parts: [S(), ...bulbs(tn)], wires: twires, scene: c.tscene, controls: { connectors: Array.from({ length: tw }, (_, i) => i), materials: ['metal'], materialLabels: OLD } }), q: 'How do you know which wire was faulty?', choices: [ok('test', 'Replacing that wire alone made them light'), no('look', 'It looked old', 'They all looked the same.')], hints: ['Replace one wire.', 'Test.', 'Keep going until it lights.'] }],
        idea: 'When you cannot see a fault, change one thing at a time and test.',
      });
    }
    case '6-6': {
      const orders = [
        [S('s1', 'Switch 1'), B(1, 2), S('s2', 'Switch 2'), B(2, 2)],
        [B(1, 2), S('s1', 'Switch 1'), B(2, 2), S('s2', 'Switch 2')],
        [S('s1', 'Switch 1'), B(1, 2), B(2, 2), S('s2', 'Switch 2')],
        [S('s1', 'Switch 1'), S('s2', 'Switch 2'), B(1, 2), B(2, 2)],
        [B(1, 3), S('s1', 'Switch 1'), B(2, 3), S('s2', 'Switch 2'), B(3, 3)],
      ];
      const parts = orders[house % orders.length];
      const tparts = arrange(house % 2 ? 3 : 2, house, false);
      return generated({
        ...base(grade, number, house, 'Series circuits'), title: `Two switches at ${c.place.short.toLowerCase()}`, concept: 'switch_position_series',
        goal: 'Show that any switch in a series loop controls every bulb.',
        brief: ['Which switch controls which?', `${cap(kit)} has two switches in different places.`, 'A loop with two switches and bulbs.'],
        predict: ['Does switch 2 control bulb 1?', [opt('yes', 'Yes'), opt('no', 'No, only the bulb near it')]],
        lab: ['Test the switches', 'Open one switch at a time and test.', loop({ parts, scene: c.scene, controls: { switches: ['s1', 's2'] } }), 'A loop with two switches.'],
        evidence: [['s1', 'Switch 1 open: all off', and(sw('s1', false), sw('s2', true), allOff)], ['s2', 'Switch 2 open: all off', and(sw('s2', false), sw('s1', true), allOff)], ['on', 'Both closed: all on', allLitT]],
        explain: { q: 'Why does either switch control every bulb?', choices: [ok('loop', 'Opening any switch breaks the one loop all the bulbs are in'), no('near', 'Each switch controls the bulb next to it', 'Either switch turned all off.'), no('first', 'Only the first switch matters', 'Switch 2 worked too.')], hints: ['Compare the open-switch tests.', 'One loop.', 'Any break stops all.'] },
        transfer: [{ heading: 'Where should it go?', text: 'This loop has one open switch.', alt: 'A loop with an open switch.', layout: loop({ parts: tparts, scene: c.tscene, controls: { switches: ['sw'] } }), q: 'Where could the switch go to control every bulb?', choices: [ok('any', 'Anywhere in the loop'), no('between', 'Only between bulbs', 'It controls them from here too.')], hints: ['Close it and test.', 'It controls all.', 'Position does not matter in one loop.'] }],
        idea: 'In a series loop, a switch anywhere controls everything in the loop.',
      });
    }
    default: return null;
  }
}

// ---------- material tester missions ----------

function pickMats(house, nc, ni, shift = 0) {
  const cs = Array.from({ length: nc }, (_, i) => CONDUCTORS[(house + shift + i) % CONDUCTORS.length]);
  const is = Array.from({ length: ni }, (_, i) => INSULATORS[(house + shift * 2 + i) % INSULATORS.length]);
  return { cs, is };
}

export function testerMission(grade, number, house) {
  const c = ctx(grade, number, house);
  const key = `${grade}-${number}`;
  const slotIs = (list) => (t) => list.includes(t.settings.connectors.wB);
  if (key === '4-2' || key === '4-5') {
    const hunt = key === '4-5';
    const { cs, is } = pickMats(house, hunt ? 3 : 2, hunt ? 3 : 2);
    const t = pickMats(house, 2, 2, 2);
    const mats = [...cs, ...is].sort((a, b) => (a + house).localeCompare(b + house));
    return generated({
      grade, number, house, lesson: 'Science Lagoon lesson: Conductors and insulators',
      title: hunt ? `Conductor hunt at ${c.place.short.toLowerCase()}` : `Choose a conductor at ${c.place.short.toLowerCase()}`,
      concept: 'conductors_insulators', goal: hunt ? 'Test many materials and group them as conductors or insulators.' : 'Compare materials in the same loop and link the result to the material.',
      brief: [hunt ? `Hunt at ${c.place.name}` : 'Out of wire', hunt ? `Test ${mats.length} materials found at ${c.place.name}.` : `The kit at ${c.place.name} has a gap and no spare wire. What could fill it?`, `A loop with a test slot and ${mats.map((m) => MAT[m]).join(', ')}.`],
      predict: hunt ? [`How many of the ${mats.length} will light the bulb?`, [opt('two', 'Two'), opt('three', 'Three'), opt('five', 'Five')]] : [`Will ${MAT[is[0]]} light the bulb?`, [opt('yes', 'Yes'), opt('no', 'No')], [opt('touch', 'It touches both ends'), opt('material', 'It depends on the material'), opt('guess', 'Just a guess')]],
      lab: [hunt ? 'Test the materials' : 'Try materials', 'Put a material in the slot, then press Test.', tester({ materials: mats, scene: c.scene }), 'A loop with a test slot.'],
      evidence: [
        ...(hunt ? [['four', 'Test at least four materials', { all: (ts) => new Set(ts.map((x) => x.settings.connectors.wB).filter((m) => m !== 'missing')).size >= 4 }]] : []),
        ['cond', 'A material that lit the bulb', and(slotIs(cs), lit('bulb'))],
        ['ins', 'A material that left it off', and(slotIs(is), dark('bulb'))],
      ],
      explain: { q: hunt ? 'Which group lit the bulb?' : `Why did ${MAT[cs[0]]} light the bulb but ${MAT[is[0]]} did not?`, choices: hunt ? [ok('metals', 'The metals'), no('hard', 'The hard things', 'Some hard things did not light it.'), no('small', 'The small things', 'Size did not decide it.')] : [ok('conduct', `${cap(MAT[cs[0]])} is metal and conducts; ${MAT[is[0]]} is an insulator`), no('thick', 'Thickness decided it', 'Thickness was not tested.'), no('used', 'The insulator used up the electricity', 'Nothing was used up.')], hints: ['Sort your results.', 'What are the lit ones made of?', 'Metals conduct.'] },
      transfer: [{ heading: `The ${c.tplace.short.toLowerCase()} drawer`, text: 'Try materials from another drawer.', alt: 'A loop with a test slot.', layout: tester({ materials: [...t.cs, ...t.is], scene: c.tscene }), q: 'What do the materials that worked have in common?', choices: [ok('metal', 'They are metals'), no('shiny', 'They are small', 'Size did not decide it.')], hints: ['Test a few.', 'Which lit it?', 'The metal ones.'] }],
      idea: 'Metals conduct. Plastic, wood, string and rubber are insulators.',
    });
  }
  if (key === '4-8') {
    const ins = INSULATORS[house % 4];
    const cnd = CONDUCTORS[house % 4];
    return generated({
      grade, number, house, lesson: 'Science Lagoon lesson: Conductors and insulators', title: `Coated wire or ${MAT[ins].replace(/^a /, '')} at ${c.place.short.toLowerCase()}`,
      concept: 'insulated_wire', goal: 'Explain why real wires have a plastic coating.',
      brief: ['Wires with coats', `At ${c.place.name}, ${c.name} wonders if the plastic on wires stops them working.`, `A coated wire, ${MAT[ins]} and ${MAT[cnd]} next to a loop.`],
      predict: ['Will a plastic-coated wire light the bulb?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('plastic', 'It is covered in plastic'), opt('inside', 'There is metal inside'), opt('guess', 'Just a guess')]],
      lab: ['Test the wires', 'Put each in the slot and test.', tester({ materials: ['coated', ins, cnd].filter((v, i, a) => a.indexOf(v) === i), scene: c.scene }), 'A loop with a test slot.'],
      evidence: [['coated', 'Coated wire: on', and(conn('wB', 'coated'), lit('bulb'))], ['ins', `${cap(ins)}: off`, and(conn('wB', ins), dark('bulb'))]],
      explain: { q: 'Why do real wires have a plastic coating?', choices: [ok('safe', 'Metal inside carries the current; the plastic keeps it from touching people or other things'), no('stop', 'The coating stops the current', 'Your coated wire lit the bulb.'), no('look', 'It looks nice', 'It has a safety job.')], hints: ['Compare coated wire and the insulator.', 'The current goes through the metal core.', 'Plastic outside insulates.'] },
      transfer: [{ heading: 'Mixed kit', text: `This kit uses coated wires, but one connector is ${MAT[INSULATORS[(house + 1) % 4]]}.`, alt: 'A loop with coated wires and one insulator.', layout: loop({ parts: [S(), B(1, 1)], wires: { 0: 'coated', 1: 'coated', 2: INSULATORS[(house + 1) % 4] }, scene: c.tscene, controls: { connectors: [2], materials: ['coated', INSULATORS[(house + 1) % 4]] } }), q: 'Which connector stopped the bulb?', choices: [ok('ins', `The ${MAT[INSULATORS[(house + 1) % 4]].replace(/^a /, '')}`), no('coated', 'The coated wires', 'They have metal inside.')], hints: ['Follow the path.', 'Which has no metal?', 'Swap it for coated wire.'] }],
      idea: 'Real wires have metal inside to conduct and plastic outside to insulate.',
    });
  }
  if (key === '5-3') {
    const cnd = CONDUCTORS[(house + 1) % 4];
    const ins = INSULATORS[(house + 1) % 4];
    const tc = CONDUCTORS[(house + 2) % 4];
    const ti = INSULATORS[(house + 3) % 4];
    const slot = { 2: 'missing' };
    const names = { 2: 'Test slot: bulb to battery −' };
    return generated({
      grade, number, house, lesson: 'Science Lagoon lesson: Fair tests', title: `A fair contest at ${c.place.short.toLowerCase()}`,
      concept: 'control_variables', goal: 'Change only the material and use the result as evidence.',
      brief: ['A fair contest', `${c.name} wants to compare ${MAT[cnd]} and ${MAT[ins]} at ${c.place.name}. Make it fair.`, 'A loop with a switch and a test slot.'],
      predict: ['What must stay the same?', [opt('rest', 'Battery, bulb, switch and wires'), opt('nothing', 'Nothing'), opt('material', 'The material')]],
      lab: ['Compare fairly', 'Change one thing at a time and test.', loop({ parts: [S('sw', 'Switch', house % 2 === 0), B(1, 1)], wires: slot, wireNames: names, scene: c.scene, controls: { switches: ['sw'], connectors: [2], materials: [cnd, ins] } }), 'A loop with a switch and a test slot.'],
      evidence: [['fair', 'Two tests where only the material changed', { pair: onlyChanged('wC') }], ['lit', 'A test where the bulb lit', lit('bulb')]],
      explain: { q: 'What can you conclude?', choices: [ok('mat', 'Only the material changed, so it caused the difference'), no('switch', 'The switch caused it', 'In a fair pair the switch was the same.'), no('luck', 'It was luck', 'The model gives the same result every time.')], evidenceQ: `Which test had ${MAT[ins]} with the switch closed?`, evidenceTest: and(sw('sw', true), conn('wC', ins), dark('bulb')), hints: ['Find two tests with the same switch.', 'Only the material differs.', 'Same everything else.'] },
      transfer: [{ heading: `${cap(MAT[tc].replace(/^a /, ''))} or ${MAT[ti].replace(/^a /, '')}`, text: 'Compare these two fairly.', alt: 'A loop with a switch and test slot.', layout: loop({ parts: [S('sw', 'Switch', false), B(1, 1)], wires: slot, wireNames: names, scene: c.tscene, controls: { switches: ['sw'], connectors: [2], materials: [tc, ti] } }), q: 'What must stay the same?', choices: [ok('rest', 'The switch, battery and bulb'), no('material', 'The material', 'That is what you compare.')], hints: ['Close the switch.', 'Change only the slot.', 'Light the bulb.'] }],
      idea: 'In a fair test you change only one thing, so any difference comes from that change.',
    });
  }
  // 5-8 observation or interpretation
  const cnd = CONDUCTORS[house % 4];
  const ins = INSULATORS[house % 4];
  return generated({
    grade, number, house, lesson: 'Science Lagoon lesson: Thinking like a scientist', title: `Observation or idea at ${c.place.short.toLowerCase()}`,
    concept: 'measurement_vs_interpretation', goal: 'Tell an observation from an interpretation.',
    brief: ['Write it up', `${c.name}’s report from ${c.place.name} must separate what was seen from what it means.`, 'A loop with a test slot and a report sheet.'],
    predict: [`Is “${MAT[ins].replace(/^a /, '')} is an insulator” an observation?`, [opt('yes', 'Yes'), opt('no', 'No, it is an idea from the results')]],
    lab: ['Collect results', `Test ${MAT[cnd]} and ${MAT[ins]} in the slot.`, tester({ materials: [cnd, ins], scene: c.scene }), 'A loop with a test slot.'],
    evidence: [['on', 'Bulb on', lit('bulb')], ['off', `${cap(MAT[ins])}: bulb off`, and(conn('wB', ins), dark('bulb'))]],
    explain: { q: 'Which sentence is an observation?', choices: [ok('obs', `With ${MAT[ins]} in the slot, the bulb stayed off`), no('idea', `${cap(MAT[ins].replace(/^a /, ''))} is an insulator`, 'That explains what you saw: an interpretation.'), no('all', `All ${ins} stops current everywhere`, 'That goes far beyond your evidence.')], evidenceQ: 'Which test is that observation about?', evidenceTest: and(conn('wB', ins), dark('bulb')), hints: ['An observation is what you saw.', 'An interpretation explains it.', '“Bulb off” is seen.'] },
    transfer: [{ heading: 'A second report', text: 'Test two more materials, then sort the sentences.', alt: 'A loop with a test slot.', layout: tester({ materials: [CONDUCTORS[(house + 1) % 4], INSULATORS[(house + 1) % 4]], scene: c.tscene }), q: 'Which sentence is an interpretation?', choices: [ok('idea', 'Metals let current pass'), no('obs', 'With metal in the slot, the bulb lit', 'That is what you saw: an observation.')], hints: ['Light the bulb.', 'Which sentence explains?', 'The general rule.'] }],
    idea: 'An observation reports what happened. An interpretation explains it and should stay within the evidence.',
  });
}
