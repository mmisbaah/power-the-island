// Grade 4: complete circuits, conductors and insulators, diagnosis.
// Visible model diagrams; one transfer problem after each tutorial.

import { loop, tester } from '../layouts.js';
import { mission, ok, no, opt, lit, dark, sw, conn, and, noGaps } from './helpers.js';

const S = (closed = true, label = 'Switch', id = 'sw') => ({ id, type: 'switch', label, closed });
const B = (id = 'bulb', label = 'Bulb') => ({ id, type: 'bulb', label });
const allMetal = (t) => Object.values(t.settings.connectors).every((m) => m === 'metal');
const plasticCount = (t) => Object.values(t.settings.connectors).filter((m) => m === 'plastic').length;
const CONDUCT_SHOW = { conductors: ['metal', 'foil', 'paperclip', 'coin', 'coated'] };
const conductsIn = (wire) => (t) => CONDUCT_SHOW.conductors.includes(t.settings.connectors[wire]);

// Figure-of-eight layout: wires tB and tD cross on screen without sharing a
// terminal. Tests check that the crossing is not treated as a join.
function crossing({ gap = 'tC', plastic = null, scene = 'noticeboard' } = {}) {
  const mats = { tA: 'metal', tB: 'metal', tC: 'metal', tD: 'metal' };
  if (gap) mats[gap] = 'missing';
  if (plastic) mats[plastic] = 'plastic';
  return {
    rule: 'closed_conducting_loop',
    kind: 'diagram',
    scene,
    terminals: ['bat+', 'bat-', 'sw.a', 'sw.b', 'n.a', 'n.b', 'post'],
    components: [
      { id: 'cell', type: 'battery', terminals: ['bat+', 'bat-'], label: 'Battery' },
      { id: 'sw', type: 'switch', terminals: ['sw.a', 'sw.b'], closed: true, label: 'Switch' },
      { id: 'boardBulb', type: 'bulb', terminals: ['n.a', 'n.b'], label: 'Noticeboard bulb' },
    ],
    connectors: [
      { id: 'tA', from: 'bat+', to: 'sw.a', material: mats.tA, label: 'Wire A: battery + to switch' },
      { id: 'tB', from: 'sw.b', to: 'post', material: mats.tB, label: 'Wire B: switch, across, to corner post' },
      { id: 'tC', from: 'post', to: 'n.a', material: mats.tC, label: 'Wire C: corner post to bulb' },
      { id: 'tD', from: 'n.b', to: 'bat-', material: mats.tD, label: 'Wire D: bulb, across, to battery −' },
    ],
    required: ['boardBulb'],
    loopOrder: ['tA', 'sw', 'tB', 'tC', 'boardBulb', 'tD', 'cell'],
    controls: { switches: ['sw'], connectors: ['tA', 'tB', 'tC', 'tD'], materials: ['metal', 'plastic'], bulbs: [] },
    draw: {
      view: '0 0 400 260',
      pos: { 'bat-': [40, 60], 'bat+': [100, 60], 'sw.a': [170, 60], 'sw.b': [230, 60], post: [60, 205], 'n.a': [170, 205], 'n.b': [230, 205] },
      routes: { tA: [[100, 60], [170, 60]], tB: [[230, 60], [345, 60], [60, 205]], tC: [[60, 205], [170, 205]], tD: [[230, 205], [345, 205], [40, 60]] },
      over: ['tD'],
      parts: { cell: [70, 60, 'h'], sw: [200, 60, 'h'], boardBulb: [200, 205, 'h'] },
    },
  };
}
export { crossing };

const g4m1 = mission({
  grade: 4, number: 1, title: 'Close the loop', concept: 'complete_circuit',
  goal: 'Build a complete circuit and explain the conducting path.',
  brief: ['A kit in pieces', 'The model lamp kit arrived with every wire loose. Connect it so the bulb lights.', 'A battery, a closed switch and a bulb on a bench, with no wires joining them.'],
  predict: ['If you connect only two of the three wires, will the bulb light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('most', 'Most of the path is there'), opt('all', 'The whole path is needed'), opt('guess', 'Just a guess')]],
  lab: ['Build the loop', 'Add wires, then press Test. Try one test before every wire is in.', loop({ parts: [S(), B()], wires: { 0: 'missing', 1: 'missing', 2: 'missing' }, controls: { connectors: [0, 1, 2], materials: ['metal'] } }), 'Battery, switch and bulb with three empty wire places.'],
  evidence: [['part', 'A test with one wire still missing: bulb off', and((t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length === 1, dark('bulb'))], ['whole', 'A test with every wire in: bulb on', lit('bulb')]],
  explain: {
    q: 'Why did the bulb light only at the end?',
    choices: [ok('loop', 'There was a complete loop from + through the bulb and back to −'), no('most', 'Enough wires were connected', 'With two of three wires, the bulb stayed off. Every part of the loop counts.'), no('battery', 'The battery warmed up', 'The battery was the same in every test.')],
    evidenceQ: 'Which test shows that one gap is enough to stop the bulb?',
    evidenceTest: and((t) => Object.values(t.settings.connectors).includes('missing'), dark('bulb')),
    hints: ['Look at your test with one wire missing.', 'Current needs a complete path out and back.', 'Two wires: off. Three wires: on. The loop must be complete.'],
  },
  transfer: [{
    heading: 'The door light', text: 'This kit has the bulb first and the switch second. One wire is missing and the switch is open.',
    alt: 'A loop with a bulb, then an open switch, and one missing wire.',
    layout: loop({ parts: [B(), S(false)], wires: { 2: 'missing' }, controls: { switches: ['sw'], connectors: [2], materials: ['metal'] }, scene: 'bench' }),
    q: 'What did this circuit need?',
    choices: [ok('both', 'The gap filled and the switch closed, so the loop was complete'), no('order', 'The bulb moved after the switch', 'Order around the loop does not matter in this model.')],
    hints: ['Follow the path from +.', 'Two things are breaking the loop.', 'Fill the gap and close the switch.'],
  }],
  idea: 'A bulb lights only when there is a complete loop from the battery’s + end, through the bulb, back to the − end.',
  lesson: 'Science Lagoon lesson: Simple circuits',
});

const g4m2 = mission({
  grade: 4, number: 2, title: 'Choose a conductor', concept: 'conductors_insulators',
  goal: 'Compare materials in the same loop and link the result to the material.',
  brief: ['Out of wire', 'The kit has one wire missing and no spare wire. What else could fill the gap?', 'A loop with one empty test slot and a tray of foil, plastic and wood.'],
  predict: ['Will a plastic strip light the bulb?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('touch', 'It touches both ends'), opt('material', 'It depends on the material'), opt('guess', 'Just a guess')]],
  lab: ['Try materials', 'Put a material in the test slot, then press Test.', tester({ materials: ['metal', 'plastic', 'foil', 'wood'] }), 'A loop with a test slot.'],
  evidence: [['conductor', 'A material that lit the bulb', and(conductsIn('wB'), lit('bulb'))], ['insulator', 'A material that left it off', and((t) => ['plastic', 'wood'].includes(t.settings.connectors.wB), dark('bulb'))]],
  explain: {
    q: 'Why did foil light the bulb but plastic did not?',
    choices: [ok('conduct', 'Foil is a metal and conducts. Plastic is an insulator.'), no('thick', 'Plastic is too thick', 'Thickness was not tested. The material changed.'), no('used', 'Plastic used up the electricity', 'Nothing was used up. Plastic just does not let current pass.')],
    hints: ['Compare a lit test and an unlit test.', 'Only the material changed.', 'Metals conduct. Plastic and wood are insulators.'],
  },
  transfer: [{
    heading: 'The desk drawer', text: 'Search the desk drawer for something to fill the gap.',
    alt: 'A loop with a test slot and a drawer of paperclips, rubber bands, string and coins.',
    layout: tester({ materials: ['paperclip', 'rubber', 'string', 'coin'] }),
    q: 'What do the materials that worked have in common?',
    choices: [ok('metal', 'They are metals'), no('shiny', 'They are small', 'The rubber band is small too, and it did not work.')],
    hints: ['Test a few materials.', 'Which ones lit the bulb?', 'Paperclip and coin are metal.'],
  }],
  idea: 'Metals are conductors: they let current pass. Plastic, wood and rubber are insulators.',
  lesson: 'Science Lagoon lesson: Conductors and insulators',
});

const benchGap = loop({ parts: [S(), B()], wires: { 2: 'missing' }, controls: { switches: ['sw'], connectors: [0, 1, 2], materials: ['metal', 'plastic'] }, wireNames: { 2: 'Wire C: bulb to battery −' } });
const pathPlastic = loop({ parts: [S(), B('pathBulb', 'Path light bulb')], wires: { 1: 'plastic' }, scene: 'path-night', controls: { switches: ['sw'], connectors: [0, 1, 2], materials: ['metal', 'plastic'] } });

const g4m3 = mission({
  grade: 4, number: 3, version: 4, title: 'Find the hidden gap', concept: 'complete_conducting_path',
  goal: 'Diagnose why a circuit with a closed switch still does not light.',
  brief: ['The classroom lamp kit is dead', 'Ibrahim built a model lamp on the science bench. The switch is closed, but the bulb is off. Your job: find out why.', 'A model circuit on a science bench: a battery, a closed switch and a bulb, with one wire section missing.'],
  predict: ['The switch is closed. Will the bulb light when you test it?', [opt('yes', 'Yes, it will light'), opt('no', 'No, it will stay off')], [opt('switch', 'The switch is closed, so it should work'), opt('gap', 'There might be a gap somewhere in the path'), opt('battery', 'The battery might be flat')]],
  lab: ['Inspect and test the loop', 'Follow the path. Fix what you find, then press Test. After that, swap one wire for plastic and test again with the switch still closed.', benchGap, 'Circuit diagram of the bench lamp kit.'],
  misconception: { after: 2, message: 'The switch is closed. Follow the rest of the path to find a gap.' },
  evidenceHeading: 'Compare your tests',
  evidence: [
    ['lit', 'A test with the switch closed and every wire metal: the bulb lights', and(sw('sw', true), allMetal, lit('bulb'))],
    ['plastic', 'A test with the switch closed and one plastic strip: the bulb stays off', and(sw('sw', true), (t) => plasticCount(t) === 1, noGaps, dark('bulb'))],
  ],
  explain: {
    q: 'Why did the bulb light in only one of your tests?',
    choices: [
      ok('loop', 'The bulb needs a complete loop of conducting material. A closed switch is not enough on its own.'),
      no('switch', 'Closing the switch is enough to light the bulb.', 'Look at your test with the plastic strip. The switch was closed, but the bulb stayed off.'),
      no('usedup', 'The plastic strip used up the electricity.', 'Plastic does not use anything up. It does not let charge flow through it, so the loop is not a conducting path.'),
      no('battery', 'The battery got stronger between the tests.', 'You used the same battery in every test. Only the connectors changed.'),
    ],
    evidenceQ: 'Which of your tests shows that a closed switch is not enough?',
    evidenceTest: and(sw('sw', true), dark('bulb')),
    hints: [
      'Look at your tests. What was the same about the switch each time?',
      'Metal conducts. Plastic is an insulator: it does not let charge flow, even when the switch is closed.',
      'Test with all metal: switch closed, bulb on. Test with one plastic strip: switch closed, bulb off. Only the connector changed, so the connector decided the result.',
    ],
  },
  transfer: [
    {
      heading: 'The noticeboard light', text: 'The community noticeboard has its own model light. The switch is closed and the bulb is off. Two of its wires cross over each other. Get it working.',
      alt: 'A figure-of-eight circuit: battery and closed switch along the top, a bulb along the bottom, two wires crossing without joining, and one missing wire next to the bulb.',
      layout: crossing({ gap: 'tC' }),
      q: 'Which idea from your bench tests helped here?',
      choices: [ok('loop', 'The bulb lights only when there is a complete loop of conducting material.'), no('cross', 'The crossing wires join, so the loop was already complete.', 'Wires that cross on the board do not touch. Only joined ends make a connection.'), no('press', 'Pressing the switch again fixes a gap.', 'The switch was already closed. The gap was somewhere else.')],
      hints: ['Start at the battery and follow the path.', 'A gap or a plastic strip anywhere in the loop stops the bulb.', 'On the bench, filling the gap with metal wire made the bulb light. Look for the same kind of fault here.'],
    },
    {
      heading: 'The path light', text: 'The path light by the jetty is off. The switch is closed and there are no gaps. Find out why and fix it.',
      alt: 'A path light circuit by a jetty at night: battery, closed switch and bulb, with one connector made of plastic.',
      layout: pathPlastic,
      q: 'Why was the path light off?',
      choices: [ok('loop', 'One connector was plastic, so the loop was not a complete conducting path.'), no('switch', 'The switch needed to be closed again.', 'The switch was closed the whole time. Look at what the connectors are made of.'), no('usedup', 'The bulb used up all the current before it reached the plastic.', 'Current is not used up by a bulb. The plastic stops the whole loop.')],
      hints: ['Look at what each connector is made of.', 'Plastic is an insulator.', 'Swap the plastic connector for metal wire, then test.'],
    },
  ],
  idea: 'A bulb needs a complete loop of conducting material. A closed switch does not make up for a gap or a plastic connector elsewhere.',
  lesson: 'Science Lagoon lesson: Conductors and insulators',
});

const g4m4 = mission({
  grade: 4, number: 4, title: 'What a switch does', concept: 'switch_as_gap',
  goal: 'Explain a switch as a gap you can open and close.',
  brief: ['The porch switch', 'Every wire in the porch light is metal. Only the switch changes.', 'A loop with a battery, an open switch and a bulb.'],
  predict: ['When the switch is open, is there a gap in the loop?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('gap', 'Open means the ends do not touch'), opt('power', 'The switch makes electricity'), opt('guess', 'Just a guess')]],
  lab: ['Open and close', 'Change the switch, then press Test.', loop({ parts: [S(false), B()], controls: { switches: ['sw'] } }), 'A loop with a switch and a bulb.'],
  evidence: [['open', 'Switch open: bulb off', and(sw('sw', false), dark('bulb'))], ['closed', 'Switch closed: bulb on', and(sw('sw', true), lit('bulb'))]],
  explain: {
    q: 'What does a switch do in a circuit?',
    choices: [ok('gap', 'It opens or closes a gap in the loop'), no('makes', 'It makes the electricity', 'The battery is the energy source. The switch only joins or breaks the path.'), no('stores', 'It stores electricity until you press it', 'Nothing is stored in the switch.')],
    hints: ['Follow the path at the switch when it is open.', 'An open switch is a gap.', 'Open: gap, off. Closed: joined, on.'],
  },
  transfer: [{
    heading: 'Switch on the other side', text: 'Here the switch is after the bulb. The bulb is off.',
    alt: 'A loop with a bulb and then an open switch.',
    layout: loop({ parts: [B(), S(false)], controls: { switches: ['sw'] } }),
    q: 'Did the switch still control the bulb?',
    choices: [ok('yes', 'Yes, a gap anywhere in the loop stops it'), no('no', 'No, the switch must be before the bulb', 'Test it. The switch works here too.')],
    hints: ['Close the switch and test.', 'The loop is one path.', 'Anywhere in the loop, a switch opens or closes the path.'],
  }],
  idea: 'A switch is a gap you can open and close. Closed completes the loop; open breaks it.',
  lesson: 'Science Lagoon lesson: Simple circuits',
});

const g4m5 = mission({
  grade: 4, number: 5, title: 'Conductor hunt', concept: 'conductors_insulators',
  goal: 'Test many materials and group them as conductors or insulators.',
  brief: ['The classroom hunt', 'Test six classroom materials. Which ones could replace a wire?', 'A loop with a test slot, and a tray of coin, string, paperclip, rubber band, foil and wooden stick.'],
  predict: ['How many of the six materials will light the bulb?', [opt('two', 'Two'), opt('three', 'Three'), opt('five', 'Five')]],
  lab: ['Test six materials', 'Put each material in the slot and press Test.', tester({ materials: ['coin', 'string', 'paperclip', 'rubber', 'foil', 'wood'] }), 'A loop with a test slot.'],
  evidence: [
    ['four', 'Test at least four different materials', { all: (ts) => new Set(ts.map((t) => t.settings.connectors.wB).filter((m) => m !== 'missing')).size >= 4 }],
    ['cond', 'Find a conductor', and(conductsIn('wB'), lit('bulb'))],
    ['ins', 'Find an insulator', and((t) => ['string', 'rubber', 'wood'].includes(t.settings.connectors.wB), dark('bulb'))],
  ],
  explain: {
    q: 'Which group lit the bulb?',
    choices: [ok('metals', 'The metals: coin, paperclip and foil'), no('hard', 'The hard things', 'Wood is hard, and it did not light the bulb.'), no('small', 'The small things', 'The rubber band is small too.')],
    hints: ['Sort your results into lit and not lit.', 'What are the lit ones made of?', 'Coin, paperclip, foil: metal.'],
  },
  transfer: [{
    heading: 'Prediction first', text: 'A new kit uses a plastic-coated wire with bare metal ends. Test it.',
    alt: 'A loop with a test slot and a coated wire.',
    layout: tester({ materials: ['coated', 'rubber'] }),
    q: 'Why did the coated wire work?',
    choices: [ok('core', 'The metal inside joins the bare ends, so it conducts'), no('plastic', 'Plastic conducts after all', 'Plastic strips did not conduct. What is inside the coating?')],
    hints: ['Test the coated wire.', 'Look at what is inside it.', 'Metal inside, plastic outside.'],
  }],
  idea: 'Metals conduct. Most other everyday materials are insulators.',
  lesson: 'Science Lagoon lesson: Conductors and insulators',
});

const g4m6 = mission({
  grade: 4, number: 6, title: 'Two gaps', concept: 'complete_conducting_path',
  goal: 'Show that every gap must be fixed before the bulb lights.',
  brief: ['Double trouble', 'This kit has more than one problem.', 'A loop with a closed switch, a bulb and two missing wires.'],
  predict: ['If you fix one gap, will the bulb light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('one', 'One fix is enough'), opt('every', 'Every gap matters'), opt('guess', 'Just a guess')]],
  lab: ['Fix the gaps', 'Fix one gap and test. Then fix the next and test.', loop({ parts: [S(), B()], wires: { 0: 'missing', 2: 'missing' }, controls: { connectors: [0, 1, 2], materials: ['metal', 'plastic'] } }), 'A loop with two missing wires.'],
  evidence: [['one', 'A test with one gap still left: bulb off', and((t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length === 1, dark('bulb'))], ['both', 'Both gaps fixed with metal: bulb on', lit('bulb')]],
  explain: {
    q: 'Why did one fix not work?',
    choices: [ok('every', 'One gap anywhere is enough to break the loop'), no('first', 'I fixed the wrong one first', 'Either gap alone stops the bulb.'), no('weak', 'The bulb needed more wires to be bright enough', 'It is about a complete path, not how many wires.')],
    hints: ['Look at the test after the first fix.', 'Was there still a gap?', 'One gap: off. No gaps: on.'],
  },
  transfer: [{
    heading: 'Three parts', text: 'This loop has a switch and two bulbs. Some wires are missing.',
    alt: 'A loop with a switch, two bulbs and missing wires.',
    layout: loop({ parts: [S(), B('b1', 'Bulb 1'), B('b2', 'Bulb 2')], wires: { 1: 'missing', 3: 'missing' }, controls: { connectors: [0, 1, 2, 3], materials: ['metal', 'plastic'] } }),
    q: 'What did you need to do?',
    choices: [ok('all', 'Fill every gap with metal'), no('one', 'Fill the gap nearest the battery', 'Any gap anywhere stops the loop.')],
    hints: ['Find every gap.', 'Fill each one with metal wire.', 'Then test.'],
  }],
  idea: 'Any single gap breaks the loop. Every gap must be fixed with a conductor.',
  lesson: 'Science Lagoon lesson: Simple circuits',
});

const g4m7 = mission({
  grade: 4, number: 7, title: 'Trace the route', concept: 'topology_not_appearance',
  goal: 'Follow a loop by its joins, not by where wires cross.',
  brief: ['The tangled board', 'This board has wires that cross. One wire is plastic. Trace the real route.', 'A figure-of-eight circuit with two crossing wires and one plastic strip.'],
  predict: ['Do wires that cross on the board make a connection?', [opt('yes', 'Yes'), opt('no', 'No')]],
  lab: ['Trace and fix', 'Follow the path part by part. Fix the fault, then press Test.', crossing({ gap: null, plastic: 'tB' }), 'A figure-of-eight circuit.'],
  evidence: [['before', 'A test with the plastic still in: off', and(conn('tB', 'plastic'), dark('boardBulb'))], ['after', 'A test after fixing: on', lit('boardBulb')]],
  explain: {
    q: 'How do you know crossing wires do not join here?',
    choices: [ok('ends', 'Connections are only where wire ends meet a terminal'), no('touch', 'Crossing wires always join', 'If they joined, the plastic strip could be skipped, and it was not.'), no('colour', 'They are different colours', 'Colour does not decide connections.')],
    hints: ['Use Follow the path.', 'Each wire goes from one terminal to another.', 'Crossing is not joining.'],
  },
  transfer: [{
    heading: 'Back to the bench', text: 'A simple loop again. The switch is closed, one wire is plastic.',
    alt: 'A loop with a plastic connector.',
    layout: loop({ parts: [S(), B()], wires: { 2: 'plastic' }, controls: { connectors: [0, 1, 2], materials: ['metal', 'plastic'] } }),
    q: 'What did you change?',
    choices: [ok('plastic', 'Swapped the plastic for metal'), no('switch', 'Pressed the switch', 'The switch was closed already.')],
    hints: ['Follow the path.', 'Which connector is not metal?', 'Swap it for metal.'],
  }],
  idea: 'A circuit is defined by its joins. Wires that cross on a drawing are not connected unless their ends meet.',
  lesson: 'Science Lagoon lesson: Circuit diagrams',
});

const g4m8 = mission({
  grade: 4, number: 8, title: 'Coated wires', concept: 'insulated_wire',
  goal: 'Explain why real wires have a plastic coating.',
  brief: ['Wires with coats', 'Real wires are covered in plastic. Does the plastic stop them working?', 'A coated wire with bare metal ends next to a loop.'],
  predict: ['Will a plastic-coated wire light the bulb?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('plastic', 'It is covered in plastic'), opt('inside', 'There is metal inside'), opt('guess', 'Just a guess')]],
  lab: ['Test the wires', 'Put each wire in the slot and test.', tester({ materials: ['coated', 'plastic', 'metal'] }), 'A loop with a test slot.'],
  evidence: [['coated', 'Coated wire: bulb on', and(conn('wB', 'coated'), lit('bulb'))], ['plastic', 'Plain plastic strip: bulb off', and(conn('wB', 'plastic'), dark('bulb'))]],
  explain: {
    q: 'Why do real wires have a plastic coating?',
    choices: [ok('safe', 'Metal inside carries the current; the plastic keeps it from touching other things or people'), no('stop', 'The coating stops the current', 'Your coated wire lit the bulb.'), no('look', 'It makes them look nice', 'It has a safety job.')],
    hints: ['Compare coated wire and plastic strip.', 'The current goes through the metal core.', 'Plastic outside is an insulator that protects.'],
  },
  transfer: [{
    heading: 'Mixed kit', text: 'This kit uses coated wires, but one connector is plain plastic.',
    alt: 'A loop with coated wires and one plastic strip.',
    layout: loop({ parts: [S(), B()], wires: { 0: 'coated', 1: 'coated', 2: 'plastic' }, controls: { connectors: [2], materials: ['coated', 'plastic'] } }),
    q: 'Which connector stopped the bulb?',
    choices: [ok('plastic', 'The plain plastic strip'), no('coated', 'The coated wires', 'Coated wires have metal inside.')],
    hints: ['Follow the path.', 'Which one has no metal?', 'Swap the plastic strip for coated wire.'],
  }],
  idea: 'Real wires have metal inside to conduct and plastic outside to insulate.',
  lesson: 'Science Lagoon lesson: Conductors and insulators',
});

const g4m9 = mission({
  grade: 4, number: 9, title: 'Fix the noticeboard light', concept: 'diagnosis',
  goal: 'Find and fix more than one kind of fault.',
  brief: ['Everything is wrong', 'The noticeboard kit has a gap, a plastic strip and an open switch.', 'A loop with an open switch, a plastic connector and a missing wire.'],
  predict: ['How many faults must you fix?', [opt('one', 'One'), opt('two', 'Two'), opt('three', 'Three')]],
  lab: ['Fix every fault', 'Fix one fault at a time and test.', loop({ parts: [S(false), B()], wires: { 1: 'plastic', 2: 'missing' }, scene: 'noticeboard', controls: { switches: ['sw'], connectors: [0, 1, 2], materials: ['metal', 'plastic'] } }), 'A loop with three faults.'],
  evidence: [['partial', 'A test with the switch closed but a fault left: off', and(sw('sw', true), dark('bulb'))], ['fixed', 'All fixed: on', lit('bulb')]],
  explain: {
    q: 'Why did the bulb stay off after you closed the switch?',
    choices: [ok('other', 'Other faults still broke the loop'), no('switch', 'The switch was broken', 'The switch worked once the other faults were fixed.')],
    evidenceQ: 'Which test shows the switch was not the only problem?',
    evidenceTest: and(sw('sw', true), dark('bulb')),
    hints: ['Look at your test with the switch closed.', 'Was there still a gap or plastic?', 'All three faults must go.'],
  },
  transfer: [{
    heading: 'Crossing board', text: 'The crossing board has a gap and a plastic strip.',
    alt: 'A figure-of-eight circuit with a gap and a plastic strip.',
    layout: crossing({ gap: 'tA', plastic: 'tD' }),
    q: 'How did you find both faults?',
    choices: [ok('trace', 'I followed the whole loop, part by part'), no('switch', 'I kept pressing the switch', 'The switch was closed. Following the path finds faults.')],
    hints: ['Follow the path.', 'Look at every connector.', 'Fill the gap and swap the plastic.'],
  }],
  idea: 'A circuit can have several faults. Follow the whole loop to find them all.',
  lesson: 'Science Lagoon lesson: Fixing circuits',
});

const g4m10 = mission({
  grade: 4, number: 10, title: 'Circuit detective', concept: 'diagnosis_with_evidence',
  goal: 'Use test results as evidence for which part was faulty.',
  brief: ['Who broke it?', 'The workshop lamp is off. Was it the switch or the wooden stick someone used as a wire?', 'A loop with an open switch and a wooden stick in place of one wire.'],
  predict: ['Which do you think is the problem?', [opt('switch', 'The switch'), opt('wood', 'The wooden stick'), opt('both', 'Both')]],
  lab: ['Collect evidence', 'Change one thing at a time and test.', loop({ parts: [S(false), B()], wires: { 0: 'wood' }, scene: 'bench', controls: { switches: ['sw'], connectors: [0, 1, 2], materials: ['metal', 'wood'] } }), 'A loop with a wooden connector and an open switch.'],
  evidence: [['wood', 'Switch closed, wood still in: off', and(sw('sw', true), conn('wA', 'wood'), dark('bulb'))], ['fixed', 'Both fixed: on', lit('bulb')]],
  explain: {
    q: 'What was wrong?',
    choices: [ok('both', 'Both: the open switch and the wooden stick each broke the loop'), no('switch', 'Only the switch', 'With the switch closed and the wood in, it stayed off.'), no('wood', 'Only the wood', 'The switch was open too.')],
    evidenceQ: 'Which test proves the wood was a problem?',
    evidenceTest: and(sw('sw', true), conn('wA', 'wood'), dark('bulb')),
    hints: ['Change one thing, then test.', 'Which test had the switch closed but still failed?', 'Both faults had to go.'],
  },
  transfer: [{
    heading: 'Three-part puzzle', text: 'A new loop with two bulbs has one hidden problem.',
    alt: 'A loop with a switch, two bulbs and one plastic connector.',
    layout: loop({ parts: [S(), B('b1', 'Bulb 1'), B('b2', 'Bulb 2')], wires: { 2: 'plastic' }, controls: { switches: ['sw'], connectors: [0, 1, 2, 3], materials: ['metal', 'plastic'] } }),
    q: 'How do you know you found the right fault?',
    choices: [ok('test', 'After I changed only that connector, the test lit both bulbs'), no('look', 'It looked wrong', 'Looking helps, but the test is the evidence.')],
    hints: ['Follow the path.', 'Change one thing and test.', 'Swap the plastic, then test.'],
  }],
  idea: 'Change one thing at a time and test. The result is your evidence.',
  lesson: 'Science Lagoon lesson: Fixing circuits',
});

export default [g4m1, g4m2, g4m3, g4m4, g4m5, g4m6, g4m7, g4m8, g4m9, g4m10];
