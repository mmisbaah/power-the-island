// Grade 5: energy stores and transfers, storage for after dark, fair
// comparisons, observation versus interpretation.

import { catalogue, loop, tester, solar, rooms } from '../layouts.js';
import { mission, ok, no, opt, lit, dark, sw, conn, val, res, item, prop, and, onlyChanged } from './helpers.js';

const pick = (src, ids) => Object.fromEntries(ids.map((k) => [k, src[k]]));
const S = (closed = true) => ({ id: 'sw', type: 'switch', label: 'Switch', closed });
const B = (id = 'bulb', label = 'Bulb') => ({ id, type: 'bulb', label });

const SYSTEM = {
  battery: { label: 'Battery', pic: '🔋', props: { role: 'store', text: 'A chemical energy store. It does not contain light, and it does not make energy from nothing.' } },
  wires: { label: 'Wires', pic: '〰️', props: { role: 'path', text: 'The conducting path. The electric current transfers energy from the battery to the lamp.' } },
  lamp: { label: 'Lamp', pic: 'lamp-on', props: { role: 'output', text: 'Transfers energy to the surroundings by light, and by heating.' } },
  panel: { label: 'Solar panel', pic: '🟦', props: { role: 'input', text: 'Light falling on it transfers energy into the circuit.' } },
  fan: { label: 'Fan motor', pic: 'efan', props: { role: 'output', text: 'Transfers energy as movement, with some sound and heating.' } },
};
const showSystem = (r, it) => `${it.label}: ${r.props.text}`;

const g5m1 = mission({
  grade: 5, number: 1, title: 'Track the energy', concept: 'energy_transfer',
  goal: 'Describe how energy is transferred from a battery to a lamp’s light and heating.',
  brief: ['Follow the energy', 'Energy is stored in the battery. Where does it go when the lamp is on?', 'A battery, wires and a glowing lamp, with the lamp’s surroundings feeling warm.'],
  predict: ['When the lamp is on, where does the energy end up?', [opt('light', 'Only as light'), opt('both', 'As light and heating'), opt('gone', 'It is destroyed')]],
  lab: ['Check each part', 'Tap a part of the system. Then press Check.', catalogue({ items: pick(SYSTEM, ['battery', 'wires', 'lamp']), show: showSystem }), 'A battery, wires and a lamp.'],
  evidence: [['store', 'Check the store', item('battery')], ['output', 'Check where energy leaves', item('lamp')]],
  explain: {
    q: 'Which is the best description?',
    choices: [ok('transfer', 'Energy stored in the battery is transferred by the circuit to the lamp, which gives out light and heats its surroundings'), no('usedup', 'The battery is full of electricity that gets used up in the lamp', 'Current is not used up; it flows all the way round. It is the battery’s stored energy that is transferred.'), no('make', 'The lamp makes energy', 'Energy is not made. The lamp transfers energy it receives.')],
    hints: ['Check the battery and the lamp.', 'Store → path → output.', 'Battery stores; current transfers; lamp gives out light and heating.'],
  },
  transfer: [{
    heading: 'The solar fan', text: 'A solar panel runs a small fan on the jetty.',
    alt: 'A solar panel wired to a fan motor.',
    layout: catalogue({ items: pick(SYSTEM, ['panel', 'wires', 'fan']), show: showSystem }),
    q: 'Describe the energy transfer.',
    choices: [ok('chain', 'Light transfers energy to the panel; the current carries it to the fan, which moves air'), no('make', 'The fan makes wind energy from nothing', 'Energy comes in from light at the panel.')],
    hints: ['Check the panel first.', 'Where does energy enter? Where does it leave?', 'Light in, movement out.'],
  }],
  idea: 'Energy is stored in the battery and transferred by the circuit to the lamp, which gives it out as light and heating. Energy is not created or destroyed.',
  lesson: 'Science Lagoon lesson: Energy transfers',
});

const g5m2 = mission({
  grade: 5, number: 2, title: 'Solar after sunset', concept: 'storage_requirement',
  goal: 'Show that a solar light needs stored energy to work after dark.',
  brief: ['The jetty path light', 'The new path light must work after sunset. It has a panel. Is that enough?', 'A jetty path light with a solar panel and an empty space for a battery.'],
  predict: ['With only a panel, will the light work after dark?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('charged', 'The panel charged up in the day'), opt('store', 'It needs somewhere to store energy'), opt('guess', 'Just a guess')]],
  lab: ['Test day and night', 'Change the time and storage. Then press Test.', solar({ controls: ['time', 'storage'] }), 'A jetty panel and lamp.'],
  evidence: [['nightnone', 'After dark, no battery: off', and(val('time', 'night'), val('storage', 'none'), res('lamp', 'off'))], ['nightbat', 'After dark, with battery: on', and(val('time', 'night'), val('storage', 'battery'), res('lamp', 'on'))]],
  explain: {
    q: 'Why does the light need a battery?',
    choices: [ok('store', 'The panel makes no electricity in the dark, so a battery must store energy from the day'), no('panel', 'The panel stores sunlight', 'With no battery, it was off after dark. The panel stores nothing.'), no('bright', 'The battery makes it brighter', 'Brightness is not in this model. The battery is the only energy source after dark.')],
    hints: ['Compare night with and without a battery.', 'What does the panel make at night?', 'Day: panel charges battery. Night: battery runs lamp.'],
  },
  transfer: [{
    heading: 'Pick the parts', text: 'It is after dark. Choose where the panel goes and whether to add storage.',
    alt: 'A path light at night with choices for panel place and storage.',
    layout: solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }),
    q: 'Which design lights the path all evening?',
    choices: [ok('both', 'Panel in full sun, with a battery'), no('panel', 'Panel in full sun, no battery', 'After dark the panel gives nothing. Something must store energy.')],
    hints: ['Try with and without a battery.', 'Shade means only a part charge.', 'Full sun plus battery.'],
  }],
  idea: 'A solar panel cannot light the path at night. A battery stores energy in the day for use after dark.',
  lesson: 'Science Lagoon lesson: Energy from the Sun',
});

const g5m3 = mission({
  grade: 5, number: 3, title: 'A fair circuit comparison', concept: 'control_variables',
  goal: 'Change only the material and use the result as evidence.',
  brief: ['A fair contest', 'Which is better in the test slot: foil or wood? Make the comparison fair.', 'A loop with a switch and a test slot.'],
  predict: ['To compare foil and wood, what must stay the same?', [opt('rest', 'Battery, bulb, switch and wires'), opt('nothing', 'Nothing'), opt('material', 'The material')]],
  lab: ['Compare fairly', 'Change one thing at a time, and test.', loop({ parts: [S(), B()], wires: { 2: 'missing' }, wireNames: { 2: 'Test slot: bulb to battery −' }, controls: { switches: ['sw'], connectors: [2], materials: ['foil', 'wood'] } }), 'A loop with a switch and a test slot.'],
  evidence: [['fair', 'Two tests where only the material changed', { pair: onlyChanged('wC') }], ['lit', 'A test where the bulb lit', lit('bulb')]],
  explain: {
    q: 'What can you conclude?',
    choices: [ok('mat', 'Only the material changed, so the material caused the difference'), no('switch', 'The switch caused the difference', 'In a fair pair, the switch was the same in both tests.'), no('luck', 'It was luck', 'The model gives the same result every time for the same setup.')],
    evidenceQ: 'Which test is part of your fair pair with the bulb off?',
    evidenceTest: and(sw('sw', true), dark('bulb'), (t) => t.settings.connectors.wC === 'wood'),
    hints: ['Find two tests with the same switch setting.', 'Only the material should differ.', 'Foil: on. Wood: off. Same everything else.'],
  },
  transfer: [{
    heading: 'Paperclip or string', text: 'Compare a paperclip and string fairly.',
    alt: 'A loop with a switch and test slot.',
    layout: loop({ parts: [S(false), B()], wires: { 2: 'missing' }, wireNames: { 2: 'Test slot: bulb to battery −' }, controls: { switches: ['sw'], connectors: [2], materials: ['paperclip', 'string'] } }),
    q: 'What must stay the same to compare them fairly?',
    choices: [ok('rest', 'The switch, battery and bulb'), no('material', 'The material', 'The material is what you are comparing.')],
    hints: ['Close the switch.', 'Then change only the slot.', 'Get the bulb to light.'],
  }],
  idea: 'In a fair test you change only one thing, so any difference in result comes from that change.',
  lesson: 'Science Lagoon lesson: Fair tests',
});

const g5m4 = mission({
  grade: 5, number: 4, title: 'Current is not used up', concept: 'current_vs_energy',
  goal: 'Explain that current flows all the way round while energy is transferred.',
  brief: ['A common mix-up', 'Rashid says: “The bulb uses up the current, so none comes back to the battery.” Is he right?', 'A loop with a battery, a switch and a bulb.'],
  predict: ['Is there current in the wire after the bulb?', [opt('yes', 'Yes, the same as before the bulb'), opt('less', 'Less'), opt('none', 'None')]],
  lab: ['Test the loop', 'Open and close the switch and test. Then try unclipping the wire after the bulb.', loop({ parts: [S(false), B()], controls: { switches: ['sw'], connectors: [2], materials: ['metal', 'missing'], materialLabels: { metal: 'Clipped in', missing: 'Unclipped' } } }), 'A loop with a switch and bulb.'],
  evidence: [['on', 'A test with the bulb on', lit('bulb')], ['after', 'Wire after the bulb unclipped: off', and(conn('wC', 'missing'), sw('sw', true), dark('bulb'))]],
  explain: {
    q: 'Why does unclipping the wire after the bulb turn it off?',
    choices: [ok('loop', 'Current must flow all the way round; it is not used up in the bulb'), no('used', 'The bulb had used up the current anyway', 'If the current were used up, the wire after it would not matter. It did.'), no('battery', 'The battery needs the current back to recharge', 'The battery does not recharge in this circuit.')],
    hints: ['Look at the unclipped test.', 'The wire after the bulb matters.', 'Current flows round the whole loop. Energy is what is transferred.'],
  },
  transfer: [{
    heading: 'Two bulbs', text: 'Two bulbs in one loop. Unclip and re-clip wires and test.',
    alt: 'A loop with two bulbs.',
    layout: loop({ parts: [S(), B('b1', 'Bulb 1'), B('b2', 'Bulb 2')], wires: { 3: 'missing' }, controls: { connectors: [0, 1, 2, 3], materials: ['metal', 'missing'], materialLabels: { metal: 'Clipped in', missing: 'Unclipped' } } }),
    q: 'Does bulb 1 use up current before bulb 2?',
    choices: [ok('no', 'No; the same current flows through both and back'), no('yes', 'Yes, so bulb 2 gets less', 'The model shows both light together and both go off together.')],
    hints: ['Find the unclipped wire.', 'Clip it in.', 'Both bulbs light together.'],
  }],
  idea: 'Current flows round the whole loop and is not used up. Energy from the battery is what gets transferred.',
  lesson: 'Science Lagoon lesson: Energy transfers',
});

const KITCHEN = {
  cooker: { label: 'Rice cooker', pic: '🍚', props: { useful: 'heating the rice', other: 'some heating of the kitchen' } },
  blender: { label: 'Blender', pic: '🥤', props: { useful: 'movement of the blades', other: 'sound and some heating' } },
  kettle: { label: 'Electric kettle', pic: '🫖', props: { useful: 'heating the water', other: 'some heating of the air and some sound' } },
  fridgelight: { label: 'Fridge light', pic: 'lamp-on', props: { useful: 'light', other: 'some heating' } },
  dryer: { label: 'Hair dryer', pic: '💨', props: { useful: 'heating and moving air', other: 'sound' } },
  radio: { label: 'Radio', pic: '📻', props: { useful: 'sound', other: 'some heating' } },
  lamp: { label: 'Desk lamp', pic: 'lamp-on', props: { useful: 'light', other: 'some heating' } },
};
const showKitchen = (r, it) => `${it.label}: useful output is ${r.props.useful}; also ${r.props.other}.`;

const g5m5 = mission({
  grade: 5, number: 5, title: 'Energy in the kitchen', concept: 'useful_and_other_outputs',
  goal: 'Name the useful output of a device and the other ways energy is transferred.',
  brief: ['Kitchen survey', 'Every kitchen device transfers energy. Some of it is useful, some is not.', 'A kitchen with a rice cooker, blender, kettle and fridge.'],
  predict: ['Does a blender transfer all its energy to blade movement?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('noise', 'Blenders are noisy'), opt('all', 'Machines are perfect'), opt('guess', 'Just a guess')]],
  lab: ['Survey the kitchen', 'Tap a device. Then press Check.', catalogue({ items: pick(KITCHEN, ['cooker', 'blender', 'kettle', 'fridgelight']), show: showKitchen }), 'Four kitchen devices.'],
  evidence: [['blender', 'Check the blender', item('blender')], ['heat', 'Check a device whose useful output is heating', (t) => /heating/.test(t.result.props?.useful || '')]],
  explain: {
    q: 'Where does the blender’s energy go?',
    choices: [ok('mixed', 'Mostly into blade movement, with some sound and heating'), no('all', 'All into blade movement', 'You can hear it, so some energy is transferred as sound.'), no('lost', 'Some is destroyed', 'Energy is not destroyed. It spreads out as sound and heating.')],
    hints: ['Check the blender.', 'Useful output plus other outputs.', 'Movement (useful) + sound + heating.'],
  },
  transfer: [{
    heading: 'Bedroom survey', text: 'Survey three devices in the bedroom.',
    alt: 'A hair dryer, radio and desk lamp.',
    layout: catalogue({ items: pick(KITCHEN, ['dryer', 'radio', 'lamp']), show: showKitchen }),
    q: 'Which device has heating as part of its useful output?',
    choices: [ok('dryer', 'The hair dryer'), no('lamp', 'The desk lamp', 'The lamp’s heating is not the job it is for.')],
    hints: ['Check each one.', 'What job is each device for?', 'A hair dryer’s job includes heating air.'],
  }],
  idea: 'Devices transfer energy in useful ways and in other ways, often sound and heating. The energy is not destroyed.',
  lesson: 'Science Lagoon lesson: Energy transfers',
});

const g5m6 = mission({
  grade: 5, number: 6, title: 'Shade and the battery', concept: 'fair_test_solar',
  goal: 'Compare panel places fairly when a battery is used at night.',
  brief: ['Night-time check', 'Two families have solar path lights with batteries. One panel is under a tree. Compare fairly.', 'Two jetty path lights, one panel in sun and one under a tree.'],
  predict: ['With a battery, will a shaded panel light the path all evening?', [opt('yes', 'Yes'), opt('short', 'Only for a short time'), opt('no', 'Not at all')]],
  lab: ['Compare fairly', 'Change one setting at a time. Then press Test.', solar({ controls: ['site', 'weather'], fixed: { time: 'night', storage: 'battery' } }), 'A path light with a battery, after dark.'],
  evidence: [['fair', 'Two tests where only the place changed', { pair: onlyChanged('site') }], ['short', 'A test that lit for only a short time', res('lamp', 'short')]],
  explain: {
    q: 'Why did the shaded light work for only a short time?',
    choices: [ok('charge', 'Less light reached the panel in the day, so the battery was only partly charged'), no('battery', 'The battery was smaller', 'Both used the same battery in the model.'), no('night', 'Night is darker under trees', 'At night both panels make nothing. The difference comes from the day.')],
    evidenceQ: 'Which test shows the short-time result?',
    evidenceTest: res('lamp', 'short'),
    hints: ['Find your fair pair.', 'Think about the daytime charging.', 'Shade in the day → part charge → short time at night.'],
  },
  transfer: [{
    heading: 'Cloudy week', text: 'Now the panel is in full sun, but it has been a cloudy week.',
    alt: 'A path light in full sun after a cloudy week.',
    layout: solar({ controls: ['weather'], fixed: { time: 'night', storage: 'battery' }, initial: { weather: 'cloudy' } }),
    q: 'Why could cloudy weather limit the light?',
    choices: [ok('charge', 'Clouds mean less light, so the battery charges less'), no('rain', 'Rain gets in the battery', 'Rain is not in this model.')],
    hints: ['Test both weathers.', 'Clouds reduce daylight.', 'Clear week → full charge.'],
  }],
  idea: 'How well a solar light works at night depends on how much light the panel gets during the day.',
  lesson: 'Science Lagoon lesson: Energy from the Sun',
});

const g5m7 = mission({
  grade: 5, number: 7, title: 'Which store lasts the night', concept: 'storage_requirement',
  goal: 'Choose a design that stores enough energy for the whole evening.',
  brief: ['The school gate light', 'The school gate light must work all evening. You can move the panel and add a battery.', 'A school gate at night with a light, a panel under a tree and an empty battery box.'],
  predict: ['Which matters most after dark?', [opt('battery', 'Having a battery'), opt('panel', 'A bigger panel'), opt('both', 'A battery and a sunny place')]],
  lab: ['Design and test', 'Choose the place and storage. Then press Test.', solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }), 'The gate light after dark.'],
  evidence: [['none', 'No battery: off', and(val('storage', 'none'), res('lamp', 'off'))], ['short', 'Battery in shade: short time', and(val('storage', 'battery'), val('site', 'shaded'), res('lamp', 'short'))], ['on', 'Battery in sun: all evening', res('lamp', 'on')]],
  explain: {
    q: 'Which design works all evening, and why?',
    choices: [ok('both', 'Battery plus panel in full sun: storage for the night, and enough light in the day to fill it'), no('battery', 'Any design with a battery', 'Your shaded test with a battery lit for a short time only.'), no('sun', 'Any panel in full sun', 'Without a battery, it was off after dark.')],
    hints: ['Look at all three tests.', 'Two things matter: storage and daytime light.', 'Battery + sun = all evening.'],
  },
  transfer: [{
    heading: 'Cloudy season', text: 'Your design has a battery and full sun. Now the cloudy season arrives.',
    alt: 'The gate light in cloudy weather.',
    layout: solar({ controls: ['weather', 'storage'], fixed: { time: 'night' }, initial: { weather: 'cloudy', storage: 'battery' } }),
    q: 'What limits the design in the cloudy season?',
    choices: [ok('light', 'Less daylight, so less energy stored'), no('battery', 'The battery wears out in clouds', 'The battery is the same. What reaches the panel?')],
    hints: ['Test cloudy and clear.', 'Clouds cut daytime light.', 'Clear weather fills the battery.'],
  }],
  idea: 'After dark a solar light needs a battery, and the battery needs enough daytime light to fill it.',
  lesson: 'Science Lagoon lesson: Energy from the Sun',
});

const g5m8 = mission({
  grade: 5, number: 8, title: 'Observation or idea', concept: 'measurement_vs_interpretation',
  goal: 'Tell an observation from an interpretation.',
  brief: ['Write it up', 'Your report must separate what you saw from what you think it means.', 'A loop with a test slot and a report sheet with two columns.'],
  predict: ['Is “plastic is an insulator” an observation?', [opt('yes', 'Yes'), opt('no', 'No, it is an idea from the results')]],
  lab: ['Collect results', 'Test metal and plastic in the slot.', tester({ materials: ['metal', 'plastic'] }), 'A loop with a test slot.'],
  evidence: [['on', 'A test with the bulb on', lit('bulb')], ['off', 'A test with the bulb off', and(conn('wB', 'plastic'), dark('bulb'))]],
  explain: {
    q: 'Which sentence is an observation?',
    choices: [ok('obs', 'With plastic in the slot, the bulb stayed off'), no('idea', 'Plastic is an insulator', 'That is an interpretation: an idea that explains what you saw.'), no('all', 'All plastics stop current everywhere', 'You tested one plastic in one model. That claim goes beyond your evidence.')],
    evidenceQ: 'Which test is that observation about?',
    evidenceTest: and(conn('wB', 'plastic'), dark('bulb')),
    hints: ['An observation is what you saw.', 'An interpretation explains it.', '“Bulb off” is seen; “insulator” is an idea.'],
  },
  transfer: [{
    heading: 'Solar report', text: 'Test the panel in sun and shade, then sort sentences.',
    alt: 'The jetty solar panel.',
    layout: solar({ controls: ['site'], initial: { site: 'shaded' }, goal: (r) => r.panel === 'strong' }),
    q: 'Which sentence is an interpretation?',
    choices: [ok('idea', 'Panels need plenty of light to work well'), no('obs', 'In full sun the model showed strong output', 'That is what you saw: an observation.')],
    hints: ['Test in full sun.', 'Which sentence explains, not reports?', 'The general rule is the interpretation.'],
  }],
  idea: 'An observation reports what happened. An interpretation explains it and should stay within the evidence.',
  lesson: 'Science Lagoon lesson: Thinking like a scientist',
});

const LAMPS = {
  filament: { label: 'Old filament bulb', pic: '💡', props: { light: 'some light', heating: 'a lot of heating' } },
  led: { label: 'LED lamp', pic: 'lamp-on', props: { light: 'more of its energy as light', heating: 'a little heating' } },
  fan: { label: 'Electric fan', pic: 'efan', props: { light: 'no light; useful movement', heating: 'some heating and sound' } },
  radio: { label: 'Radio', pic: '📻', props: { light: 'no light; useful sound', heating: 'a little heating' } },
  cooker: { label: 'Rice cooker', pic: '🍚', props: { light: 'no light; useful heating', heating: 'heating is its job' } },
};
const showLamp = (r, it) => `${it.label}: ${r.props.light}, ${r.props.heating}. (Simplified model; no measured values.)`;

const g5m9 = mission({
  grade: 5, number: 9, title: 'Useful or wasted', concept: 'efficiency_qualitative',
  goal: 'Compare devices by how much of their energy goes where we want it.',
  brief: ['Choosing a classroom lamp', 'The school wants new lamps. Compare an old filament bulb and an LED lamp.', 'Two lamps on a bench, one glowing and warm, one glowing and cool.'],
  predict: ['Which lamp transfers more energy as heating?', [opt('filament', 'The old filament bulb'), opt('led', 'The LED lamp'), opt('same', 'The same')]],
  lab: ['Compare the lamps', 'Tap a device. Then press Check.', catalogue({ items: pick(LAMPS, ['filament', 'led']), show: showLamp }), 'Two lamps.'],
  evidence: [['f', 'Check the filament bulb', item('filament')], ['l', 'Check the LED lamp', item('led')]],
  explain: {
    q: 'Why might the school choose LED lamps?',
    choices: [ok('useful', 'More of their energy goes to light and less to heating'), no('bright', 'LEDs always give exactly twice the light', 'The model has no numbers. Do not claim an exact amount.'), no('free', 'LEDs need no energy', 'They still need energy; they waste less as heating.')],
    hints: ['Compare the heating for each.', 'Which one is cooler?', 'LED: more light, less heating.'],
  },
  transfer: [{
    heading: 'Useful outputs', text: 'For each device, the useful output is different.',
    alt: 'A fan, a radio and a rice cooker.',
    layout: catalogue({ items: pick(LAMPS, ['fan', 'radio', 'cooker']), show: showLamp }),
    q: 'For which device is heating the useful output?',
    choices: [ok('cooker', 'The rice cooker'), no('fan', 'The fan', 'A fan’s job is movement.')],
    hints: ['Check each device.', 'What is each one for?', 'A rice cooker is meant to heat.'],
  }],
  idea: 'Whether an output is useful depends on the job. Choose devices that send more energy to the job.',
  lesson: 'Science Lagoon lesson: Energy transfers',
});

const g5m10 = mission({
  grade: 5, number: 10, title: 'Island energy audit', concept: 'energy_audit',
  goal: 'Use observations to make and justify an energy-saving plan.',
  brief: ['The island office', 'Audit the island office at 4 pm and make a saving plan.', 'An office building with six rooms.'],
  predict: ['How many lights can be switched off without leaving anyone in the dark?', [opt('one', 'One'), opt('three', 'Three'), opt('six', 'All six')]],
  lab: ['Audit and plan', 'Switch lights to match each room. Then press Check.', rooms({ list: [['reception', 'Reception', true, true], ['meeting', 'Meeting room', false, true], ['office1', 'Office 1', true, true], ['office2', 'Office 2', false, true], ['store', 'Store room', false, true], ['kitchen', 'Staff kitchen', true, false]] }), 'Six office rooms.'],
  evidence: [['audit', 'A first check that found waste', (t) => t.result.wasted.length >= 2], ['plan', 'A fair plan', res('fair', true)]],
  explain: {
    q: 'What evidence supports your plan?',
    choices: [ok('check', 'The audit showed which rooms were empty with lights on'), no('feel', 'It feels like a good plan', 'A plan needs evidence from the audit.'), no('count', 'More lights off is always better', 'The staff kitchen was dark with people in it.')],
    evidenceQ: 'Which check found the waste?',
    evidenceTest: (t) => t.result.wasted.length >= 1,
    hints: ['Look at your first check.', 'Which rooms were wasting?', 'Use the audit as your reason.'],
  },
  transfer: [{
    heading: 'Health centre evening', text: 'Audit the health centre in the evening.',
    alt: 'A health centre with a waiting room, two clinic rooms and an office.',
    layout: rooms({ list: [['wait', 'Waiting room', true, true], ['clinic1', 'Clinic room 1', true, false], ['clinic2', 'Clinic room 2', false, true], ['office', 'Office', false, true]] }),
    q: 'What makes this plan right for a health centre?',
    choices: [ok('people', 'Patients and nurses have light; empty rooms are off'), no('dark', 'Every room is dark to save money', 'People are being cared for. They need light.')],
    hints: ['Check who is where.', 'Clinic 1 needs light.', 'Waiting room and clinic 1 on; others off.'],
  }],
  idea: 'A good energy plan starts with an audit and uses that evidence to justify each change.',
  lesson: 'Science Lagoon lesson: Saving energy',
});

export default [g5m1, g5m2, g5m3, g5m4, g5m5, g5m6, g5m7, g5m8, g5m9, g5m10];
