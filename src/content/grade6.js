// Grade 6: series circuits, systematic fault finding, system design with
// limitations, repeated evidence and uncertainty.

import { loop, solar, rooms } from '../layouts.js';
import { mission, ok, no, opt, lit, dark, sw, conn, bulbIn, val, res, and, allOff, onlyChanged } from './helpers.js';

const S = (closed = true, id = 'sw', label = 'Switch') => ({ id, type: 'switch', label, closed });
const B = (n) => ({ id: `b${n}`, type: 'bulb', label: `Bulb ${n}` });
const bothLit = and(lit('b1'), lit('b2'));
const CLIP = { metal: 'Clipped in', missing: 'Unclipped' };
const OLD = { metal: 'New wire', broken: 'Old wire', old: 'Old wire' };

const g6m1 = mission({
  grade: 6, number: 1, title: 'Two bulbs, one loop', concept: 'series_circuit',
  goal: 'Explain a series circuit without claiming current is used up.',
  brief: ['The noticeboard needs two lights', 'Put two identical bulbs in one loop. Bulb 2’s holder is empty for now.', 'A loop with a switch, bulb 1 and an empty holder for bulb 2.'],
  predict: ['With bulb 2’s holder empty, will bulb 1 light?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('own', 'Bulb 1 has its own wires'), opt('loop', 'The empty holder is a gap in the loop'), opt('guess', 'Just a guess')]],
  lab: ['Fill the loop', 'Put bulb 2 in or take it out, use the switch, and test.', (() => { const l = loop({ parts: [S(), B(1), B(2)], controls: { switches: ['sw'], bulbs: ['b2'] }, scene: 'noticeboard' }); l.initialBulbs = { b2: false }; return l; })(), 'A loop with two bulb holders.'],
  evidence: [['empty', 'Bulb 2 out: bulb 1 off', and(bulbIn('b2', false), sw('sw', true), dark('b1'))], ['both', 'Bulb 2 in: both on', bothLit]],
  explain: {
    q: 'Trace the current when both bulbs are lit.',
    choices: [ok('route', 'From +, through bulb 1, through bulb 2, back to −; the same current all the way round'), no('used', 'Bulb 1 uses some current, so bulb 2 gets less', 'Current is not used up in a bulb. The same current flows through both.'), no('split', 'The current splits between the bulbs', 'In a single loop there is only one path. Nothing splits.')],
    hints: ['Look at the test with the holder empty.', 'There is only one path.', '+ → bulb 1 → bulb 2 → −. One loop, one current.'],
  },
  transfer: [{
    heading: 'Three bulbs', text: 'A path with three bulbs in one loop. Bulb 3 is missing.',
    alt: 'A loop with a switch and three bulb holders, the third empty.',
    layout: (() => { const l = loop({ parts: [S(), B(1), B(2), B(3)], controls: { bulbs: ['b3'] }, scene: 'path-night' }); l.initialBulbs = { b3: false }; return l; })(),
    q: 'Why did all the bulbs go off when bulb 3 was out?',
    choices: [ok('loop', 'Its empty holder broke the only path'), no('last', 'Bulb 3 was the last one, so the current had run out', 'Current does not run out. The path was broken.')],
    hints: ['Put bulb 3 in.', 'One loop, one path.', 'Test with all three in.'],
  }],
  idea: 'In a series circuit there is one path. The same current flows through every bulb and back to the battery.',
  lesson: 'Science Lagoon lesson: Series circuits',
});

const g6m2 = mission({
  grade: 6, number: 2, version: 1, title: 'Break anywhere', concept: 'series_fault',
  goal: 'Predict that a single break anywhere turns all bulbs off.',
  brief: ['Where does it matter?', 'Unclip one wire at a time: before the bulbs, between them, after them.', 'A loop with a switch and two bulbs; every wire can be unclipped.'],
  predict: ['If you unclip the wire between the two bulbs, what happens?', [opt('both', 'Both go off'), opt('second', 'Only bulb 2 goes off'), opt('none', 'Nothing changes')]],
  lab: ['Break the loop', 'Unclip one wire, test, clip it back. Try different places.', loop({ parts: [S(), B(1), B(2)], controls: { connectors: [0, 1, 2, 3], materials: ['metal', 'missing'], materialLabels: CLIP } }), 'A loop with two bulbs.'],
  evidence: [
    ['before', 'Break before the bulbs: both off', and(conn('wB', 'missing'), (t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length === 1, allOff)],
    ['between', 'Break between the bulbs: both off', and(conn('wC', 'missing'), (t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length === 1, allOff)],
    ['after', 'Break after the bulbs: both off', and(conn('wD', 'missing'), (t) => Object.values(t.settings.connectors).filter((m) => m === 'missing').length === 1, allOff)],
  ],
  explain: {
    q: 'What rule fits all your tests?',
    choices: [ok('any', 'A break anywhere in a series loop stops the current everywhere'), no('after', 'Only bulbs after the break go off', 'Your break after the bulbs turned both off too.'), no('first', 'Bulb 1 stays on because it gets current first', 'Bulb 1 went off in every break test.')],
    hints: ['Compare all three tests.', 'Did the break’s position change the result?', 'Before, between, after: both off every time.'],
  },
  transfer: [{
    heading: 'Three-bulb path', text: 'One wire on the path lights is unclipped. Fix it.',
    alt: 'A loop with three bulbs and one unclipped wire.',
    layout: loop({ parts: [S(), B(1), B(2), B(3)], wires: { 2: 'missing' }, controls: { connectors: [0, 1, 2, 3, 4], materials: ['metal', 'missing'], materialLabels: CLIP }, scene: 'path-night' }),
    q: 'Before you fixed it, which bulbs were off?',
    choices: [ok('all', 'All three'), no('after', 'Only bulbs after the break', 'In a series loop, one break stops them all.')],
    hints: ['Find the unclipped wire.', 'Clip it in.', 'Test.'],
  }],
  idea: 'In a series loop, a break anywhere stops the current everywhere, so every bulb goes off.',
  lesson: 'Science Lagoon lesson: Series circuits',
});

const g6m3 = mission({
  grade: 6, number: 3, title: 'Design the night light', concept: 'system_design',
  goal: 'Justify a design for a shaded site that must work after dark, and name a limitation.',
  brief: ['The shaded path', 'The path by the mosque is under big trees. It needs a light that works all evening. You can put the panel on a nearby sunny roof.', 'A shaded path at night, with a sunny roof nearby.'],
  predict: ['Which design will work all evening?', [opt('shade', 'Panel on the shaded path, no battery'), opt('roof', 'Panel on the sunny roof, with a battery'), opt('shadebat', 'Panel in the shade, with a battery')]],
  lab: ['Design and test', 'Choose place and storage, then test after dark.', solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }), 'The path light design after dark.'],
  evidence: [['fail', 'A design that fails after dark', and((t) => t.result.lamp !== 'on')], ['works', 'A design that works all evening', res('lamp', 'on')]],
  explain: {
    q: 'Which condition could still limit your design?',
    choices: [ok('cloud', 'A cloudy week could leave the battery only partly charged'), no('none', 'Nothing; the design always works', 'Models have limits. What could reduce daytime light?'), no('moon', 'A full moon', 'Moonlight is far too weak to matter here.')],
    hints: ['What does the battery depend on?', 'Daytime light fills the battery.', 'Clouds reduce daytime light.'],
  },
  transfer: [{
    heading: 'Check the limitation', text: 'Your design: roof panel and battery. Test it in a cloudy week.',
    alt: 'The path light design with a weather setting.',
    layout: solar({ controls: ['weather'], fixed: { time: 'night', site: 'sunny', storage: 'battery' }, initial: { weather: 'cloudy' } }),
    q: 'What did the cloudy test show?',
    choices: [ok('short', 'The light ran for only a short time, so weather limits the design'), no('fine', 'No difference', 'Look at your cloudy result.')],
    hints: ['Test the cloudy week.', 'Then a clear week.', 'Compare.'],
  }],
  idea: 'A good design meets its requirements, and an honest designer names the conditions that could limit it.',
  lesson: 'Science Lagoon lesson: Designing systems',
});

const g6m4 = mission({
  grade: 6, number: 4, title: 'Take a bulb out', concept: 'series_circuit',
  goal: 'Predict what happens when one bulb in a series loop is removed.',
  brief: ['The festival lights', 'Three bulbs in one loop light the stage. One bulb is going to be replaced.', 'A loop with a switch and three bulbs.'],
  predict: ['If you take out bulb 2, what happens to bulbs 1 and 3?', [opt('stay', 'They stay on'), opt('off', 'They go off'), opt('brighter', 'They get brighter')]],
  lab: ['Remove bulbs', 'Take bulbs out and put them back. Test each time.', loop({ parts: [S(), B(1), B(2), B(3)], controls: { bulbs: ['b1', 'b2', 'b3'] }, scene: 'noticeboard' }), 'A loop with three bulbs.'],
  evidence: [['b2out', 'Bulb 2 out: the others off', and(bulbIn('b2', false), dark('b1'), dark('b3'))], ['all', 'All in: all on', and(lit('b1'), lit('b2'), lit('b3'))]],
  explain: {
    q: 'Why did removing one bulb turn off the others?',
    choices: [ok('gap', 'The empty holder left a gap in the only path'), no('share', 'The bulbs share power and one was missing', 'It is not sharing. The path was broken.'), no('brighter', 'The others got too bright and broke', 'They went off as soon as the holder was empty.')],
    hints: ['Look at the empty holder.', 'Is the loop complete?', 'Empty holder = gap.'],
  },
  transfer: [{
    heading: 'Two bulbs, two problems', text: 'A two-bulb loop with bulb 1 removed and a wire unclipped.',
    alt: 'A loop with two bulb holders, one empty, and one unclipped wire.',
    layout: (() => { const l = loop({ parts: [S(), B(1), B(2)], wires: { 3: 'missing' }, controls: { bulbs: ['b1'], connectors: [3], materials: ['metal', 'missing'], materialLabels: CLIP } }); l.initialBulbs = { b1: false }; return l; })(),
    q: 'What did you need to fix?',
    choices: [ok('both', 'Put bulb 1 back and clip the wire in'), no('one', 'Only the wire', 'With the holder empty, the path was still broken.')],
    hints: ['Check every part of the loop.', 'Two gaps.', 'Fix both and test.'],
  }],
  idea: 'Removing a bulb from a series loop leaves a gap, so every other bulb goes off.',
  lesson: 'Science Lagoon lesson: Series circuits',
});

const g6m5 = mission({
  grade: 6, number: 5, version: 2, title: 'Find the faulty wire', concept: 'systematic_fault_finding',
  goal: 'Use one-change-at-a-time testing to find a fault you cannot see.',
  brief: ['Looks fine, does not work', 'All wires look the same, but the lights are off. One old wire is broken inside.', 'A loop with two bulbs and four wires that all look the same.'],
  predict: ['What is the best way to find the broken wire?', [opt('one', 'Replace one wire at a time and test'), opt('all', 'Replace all wires at once'), opt('look', 'Look closely at the wires')]],
  lab: ['Test systematically', 'Swap one old wire for a new one, test, and record.', loop({ parts: [S(), B(1), B(2)], wires: { 0: 'old', 1: 'old', 2: 'broken', 3: 'old' }, controls: { connectors: [0, 1, 2, 3], materials: ['metal'], materialLabels: OLD } }), 'A loop with four old wires.'],
  evidence: [
    ['one', 'A test with only one wire replaced', { all: (ts) => ts.some((t) => Object.values(t.settings.connectors).filter((m) => m === 'metal').length === 1) }],
    ['found', 'A test where replacing just the broken wire lit both bulbs', and(bothLit, (t) => Object.values(t.settings.connectors).filter((m) => m === 'metal').length === 1)],
    ['fixed', 'Lights on', bothLit],
  ],
  explain: {
    q: 'Why replace one wire at a time?',
    choices: [ok('evidence', 'Then each test tells you about one wire'), no('fast', 'It is faster', 'It can be slower; the point is clear evidence.'), no('all', 'Replacing all at once tells you which was broken', 'If you change everything, you cannot tell which one mattered.')],
    hints: ['Look at your tests in order.', 'One change per test.', 'The test that changed the result points to the fault.'],
  },
  transfer: [{
    heading: 'The jetty lights', text: 'The jetty has three bulbs and five old wires. One is broken.',
    alt: 'A loop with three bulbs and five old wires.',
    layout: loop({ parts: [S(), B(1), B(2), B(3)], wires: { 0: 'old', 1: 'old', 2: 'old', 3: 'broken', 4: 'old' }, controls: { connectors: [0, 1, 2, 3, 4], materials: ['metal'], materialLabels: OLD }, scene: 'path-night' }),
    q: 'How do you know which wire was faulty?',
    choices: [ok('test', 'Replacing that wire alone made all the bulbs light'), no('look', 'It looked old', 'They all looked the same. The test showed it.')],
    hints: ['Replace one wire.', 'Test.', 'Keep going until the result changes.'],
  }],
  idea: 'When you cannot see a fault, change one thing at a time and test. Each result is evidence.',
  lesson: 'Science Lagoon lesson: Fixing circuits',
});

const g6m6 = mission({
  grade: 6, number: 6, title: 'Where should the switch go?', concept: 'switch_position_series',
  goal: 'Show that any switch in a series loop controls every bulb.',
  brief: ['Two switches', 'This loop has two switches in different places. Which one controls which bulb?', 'A loop with switch 1, bulb 1, switch 2 and bulb 2.'],
  predict: ['Does switch 2 control bulb 1?', [opt('yes', 'Yes'), opt('no', 'No, it only controls bulb 2')]],
  lab: ['Test the switches', 'Open one switch at a time, and test.', loop({ parts: [S(true, 's1', 'Switch 1'), B(1), S(true, 's2', 'Switch 2'), B(2)], controls: { switches: ['s1', 's2'] } }), 'A loop with two switches and two bulbs.'],
  evidence: [['s1', 'Switch 1 open: both off', and(sw('s1', false), sw('s2', true), allOff)], ['s2', 'Switch 2 open: both off', and(sw('s2', false), sw('s1', true), allOff)], ['on', 'Both closed: both on', bothLit]],
  explain: {
    q: 'Why does either switch control both bulbs?',
    choices: [ok('loop', 'Opening any switch breaks the one loop that both bulbs are in'), no('near', 'Each switch controls the bulb next to it', 'Switch 2 also turned off bulb 1.'), no('first', 'Only the first switch matters', 'Switch 2 turned both off too.')],
    hints: ['Compare the two open-switch tests.', 'One loop, one path.', 'Any break stops everything.'],
  },
  transfer: [{
    heading: 'Wiring the noticeboard', text: 'The noticeboard loop has two bulbs and one switch, opened.',
    alt: 'A loop with two bulbs and a switch at the end.',
    layout: loop({ parts: [B(1), B(2), S(false)], controls: { switches: ['sw'] }, scene: 'noticeboard' }),
    q: 'Where could the switch go to control both bulbs?',
    choices: [ok('any', 'Anywhere in the loop'), no('between', 'Only between the bulbs', 'Here it is after both, and it still controls them.')],
    hints: ['Close the switch and test.', 'It controls both.', 'Position in a series loop does not matter.'],
  }],
  idea: 'In a series loop, a switch anywhere controls everything in the loop.',
  lesson: 'Science Lagoon lesson: Series circuits',
});

const g6m7 = mission({
  grade: 6, number: 7, title: 'Repeat and be sure', concept: 'repeated_evidence',
  goal: 'Repeat a test and say how confident the evidence makes you.',
  brief: ['One test is not enough', 'The council will spend money on lights only if your evidence is strong.', 'A solar path light with settings for place, weather and storage.'],
  predict: ['Should you repeat a test before deciding?', [opt('yes', 'Yes'), opt('no', 'No, once is enough')]],
  lab: ['Test and repeat', 'Choose settings, test, then repeat the exact same test.', solar({ controls: ['site', 'weather', 'storage'], fixed: { time: 'night' } }), 'A path light after dark.'],
  evidence: [['repeat', 'The same settings tested twice', { pair: (a, b) => JSON.stringify(a.settings) === JSON.stringify(b.settings) }], ['works', 'A design that lit all evening', res('lamp', 'on')]],
  explain: {
    q: 'The model gave the same result twice. What should you say?',
    choices: [ok('confident', 'The model result is consistent, but real panels may vary, so we should also check real lights'), no('proved', 'It is proved for every real light', 'Your evidence is from a simplified model. Real conditions vary.'), no('pointless', 'Repeating was pointless', 'Repeating checks the result was not a mistake.')],
    hints: ['Look at your repeated tests.', 'Is this a real light or a model?', 'Consistent model + real-world checks = stronger case.'],
  },
  transfer: [{
    heading: 'Circuit repeat', text: 'Repeat a circuit test to be sure about a fault.',
    alt: 'A loop with one unclipped wire.',
    layout: loop({ parts: [S(), B(1), B(2)], wires: { 1: 'missing' }, controls: { connectors: [1], materials: ['metal', 'missing'], materialLabels: CLIP } }),
    q: 'Why repeat after fixing a fault?',
    choices: [ok('check', 'To check the fix works every time'), no('no', 'To make the bulbs brighter', 'Repeating does not change brightness.')],
    hints: ['Fix and test.', 'Test again.', 'Same result? Good.'],
  }],
  idea: 'Repeating a test checks your result. Model results still need checking against real conditions.',
  lesson: 'Science Lagoon lesson: Thinking like a scientist',
});

const g6m8 = mission({
  grade: 6, number: 8, title: 'Limits of solar', concept: 'system_limits',
  goal: 'Identify conditions that limit a solar system.',
  brief: ['A hard season', 'Test your path light design in different conditions.', 'A solar path light with settings for place, weather and storage.'],
  predict: ['Which condition will limit the light most after dark?', [opt('nobat', 'No battery'), opt('cloud', 'Cloudy week'), opt('shade', 'Shade')]],
  lab: ['Stress test', 'Try different conditions after dark.', solar({ controls: ['site', 'weather', 'storage'], fixed: { time: 'night' }, initial: { storage: 'battery' } }), 'A path light after dark.'],
  evidence: [['cloud', 'Cloudy week with battery: short time', and(val('weather', 'cloudy'), val('storage', 'battery'), res('lamp', 'short'))], ['nobat', 'No battery: off', and(val('storage', 'none'), res('lamp', 'off'))], ['good', 'Good conditions: all evening', res('lamp', 'on')]],
  explain: {
    q: 'Which statement about limits is supported?',
    choices: [ok('limits', 'Without storage it fails; with storage, cloud or shade can still shorten the evening'), no('battery', 'A battery solves every problem', 'Your cloudy test with a battery ran short.'), no('panel', 'The panel is the problem', 'The panel worked when it had enough light.')],
    hints: ['Compare your three tests.', 'Which ones failed or ran short?', 'Storage is needed; daylight fills it.'],
  },
  transfer: [{
    heading: 'Fix it', text: 'A shaded panel with no battery. Make it work all evening.',
    alt: 'A path light design after dark.',
    layout: solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }),
    q: 'Which two changes did you need?',
    choices: [ok('both', 'Add a battery and move the panel into sun'), no('one', 'Just add a battery', 'In shade it ran for only a short time.')],
    hints: ['Add storage.', 'Then think about the shade.', 'Sun + battery.'],
  }],
  idea: 'Solar lights depend on daylight and storage. Shade, clouds and missing storage all limit them.',
  lesson: 'Science Lagoon lesson: Designing systems',
});

const g6m9 = mission({
  grade: 6, number: 9, title: 'Compare two designs', concept: 'design_evaluation',
  goal: 'Compare two designs fairly and justify a choice.',
  brief: ['Design A or B?', 'Design A: panel, no battery. Design B: panel and battery. Compare them fairly after dark.', 'Two path lights side by side.'],
  predict: ['Which design will win after dark?', [opt('a', 'Design A'), opt('b', 'Design B'), opt('same', 'The same')]],
  lab: ['Compare fairly', 'Change only the storage between tests.', solar({ controls: ['storage', 'site', 'weather'], fixed: { time: 'night' } }), 'A path light after dark.'],
  evidence: [['fair', 'Two tests where only the storage changed', { pair: onlyChanged('storage') }]],
  explain: {
    q: 'Which design would you recommend and why?',
    choices: [ok('b', 'Design B, because in a fair comparison only it lit the path after dark'), no('a', 'Design A, because it is simpler', 'Simple is good, but it failed the after-dark requirement.'), no('either', 'Either; they are the same', 'Your fair pair gave different results.')],
    evidenceQ: 'Pick the test that shows design B working.',
    evidenceTest: and(val('storage', 'battery'), (t) => t.result.lamp !== 'off'),
    hints: ['Find your fair pair.', 'Only storage changed.', 'B lit after dark; A did not.'],
  },
  transfer: [{
    heading: 'Second scenario', text: 'A new site with cloudy weather. Find a setup that lights the path all evening.',
    alt: 'A path light after dark in cloudy weather.',
    layout: solar({ controls: ['storage', 'weather'], fixed: { time: 'night' }, initial: { weather: 'cloudy' } }),
    q: 'Does your recommendation still hold on a cloudy week?',
    choices: [ok('partly', 'Design B still beats A, but it runs short in cloudy weather'), no('fails', 'B fails completely', 'B ran for a short time, A not at all.')],
    hints: ['Test B in cloud.', 'Then clear.', 'Compare with A.'],
  }],
  idea: 'Compare designs fairly, choose the one that meets the requirement, and say where it could fall short.',
  lesson: 'Science Lagoon lesson: Designing systems',
});

const g6m10 = mission({
  grade: 6, number: 10, title: 'Island power plan', concept: 'capstone_plan',
  goal: 'Combine saving and design to justify a plan for an island building.',
  brief: ['Community centre at night', 'The community centre runs on solar with a battery. Each evening the battery holds a limited amount of energy. Plan the lights.', 'A community centre with five rooms at night.'],
  predict: ['Why does saving matter more with solar and a battery?', [opt('limited', 'The battery holds a limited amount of energy each night'), opt('free', 'Solar is free, so it does not matter'), opt('unsure', 'Not sure')]],
  lab: ['Plan the evening', 'Set each light. Then press Check.', rooms({ list: [['hall', 'Main hall', true, true], ['class', 'Classroom', true, true], ['office', 'Office', false, true], ['store', 'Store', false, true], ['yard', 'Yard light', true, true]] }), 'Five community centre rooms.'],
  evidence: [['plan', 'A fair plan', res('fair', true)]],
  explain: {
    q: 'Which justification is strongest?',
    choices: [ok('both', 'Only needed lights are on, so the limited stored energy lasts the evening for the people using the centre'), no('solar', 'Solar is free, so leave them on', 'The battery’s stored energy is limited each night.'), no('dark', 'Switch all off to save the most', 'People in the hall, classroom and yard need light.')],
    hints: ['Who needs light?', 'The battery stores a limited amount.', 'Needed lights on; others off.'],
  },
  transfer: [{
    heading: 'Check the supply', text: 'Now check the centre’s solar supply on a cloudy week.',
    alt: 'The centre’s solar panel and battery after dark.',
    layout: solar({ controls: ['weather', 'site'], fixed: { time: 'night', storage: 'battery' }, initial: { weather: 'cloudy' } }),
    q: 'What should the plan say about cloudy weeks?',
    choices: [ok('limit', 'Lights may run short, so saving matters even more'), no('fine', 'Nothing changes', 'Your cloudy test ran short.')],
    hints: ['Test cloudy.', 'Then clear.', 'What does the plan need to warn about?'],
  }],
  idea: 'A good island plan combines careful use with a design that stores enough energy, and it states its limits.',
  lesson: 'Science Lagoon lesson: Designing systems',
});

export default [g6m1, g6m2, g6m3, g6m4, g6m5, g6m6, g6m7, g6m8, g6m9, g6m10];
