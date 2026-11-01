// Grade 3: responsible energy use, solar panels need light, records,
// energy changes, safety audits. Children start keeping paired records.

import { catalogue, hidden, rooms, solar } from '../layouts.js';
import { mission, ok, no, opt, lit, dark, conn, sw, val, res, item, prop, and, onlyChanged } from './helpers.js';

const pick = (src, ids) => Object.fromEntries(ids.map((k) => [k, src[k]]));
const PANEL = { strong: 'plenty of electricity', weak: 'only a little electricity', none: 'no electricity' };

const g3m1 = mission({
  grade: 3, number: 1, title: 'Switch off waste', concept: 'responsible_energy_use',
  goal: 'Find wasted lighting and choose an adult-approved saving action.',
  brief: ['The energy patrol', 'You are on the school energy patrol at lunchtime. Check every room.', 'A school plan with four rooms: science lab, library, staff room and art room.'],
  predict: ['How many rooms are wasting light?', [opt('one', 'One'), opt('two', 'Two'), opt('three', 'Three')], [opt('empty', 'I counted the empty rooms with lights on'), opt('guess', 'Just a guess')]],
  lab: ['Patrol the rooms', 'Switch lights to match who is in each room. Then press Check.', rooms({ list: [['lab', 'Science lab', false, true], ['library', 'Library', true, true], ['staff', 'Staff room', false, true], ['art', 'Art room', true, false]] }), 'Four school rooms and their lights.'],
  evidence: [['waste', 'A check that found waste', (t) => t.result.wasted.length > 0], ['fair', 'A check with no waste and nobody left in the dark', res('fair', true)]],
  explain: {
    q: 'Which saving action is right for the patrol?',
    choices: [ok('lights', 'Switch off lights in empty rooms, and ask a teacher before switching off anything else'), no('all', 'Switch off everything, even computers that are running', 'Some equipment must stay on. Ask a teacher first.'), no('dark', 'Switch off the art room light too', 'Children are working in the art room. They need light.')],
    hints: ['Look at the first check: which rooms wasted light?', 'Lights in empty rooms are waste.', 'Patrol rule: empty room, light off. Anything else, ask a teacher.'],
  },
  transfer: [{
    heading: 'Evening at the youth centre', text: 'The youth centre is open in the evening. Patrol it.',
    alt: 'A youth centre with a hall, a kitchen and a games room.',
    layout: rooms({ list: [['hall', 'Hall', true, true], ['kitchen', 'Kitchen', false, true], ['games', 'Games room', false, true]] }),
    q: 'What makes your plan fair?',
    choices: [ok('fair', 'It saves energy where nobody is, and keeps light where people are'), no('most', 'It switches off the most lights', 'Switching off the hall would leave people in the dark.')],
    hints: ['Who is in each room?', 'Waste is light nobody uses.', 'Hall on; kitchen and games room off.'],
  }],
  idea: 'Energy is wasted when lights are on and nobody needs them. Switch those off, and ask an adult before switching off equipment.',
  lesson: 'Science Lagoon lesson: Saving energy',
});

const g3m2 = mission({
  grade: 3, number: 2, title: 'Sunlight to electricity', concept: 'solar_needs_light',
  goal: 'Show that a solar panel needs suitable light to make electricity.',
  brief: ['The solar noticeboard light', 'The jetty has a light that runs straight from a solar panel. Today the panel is under a tree.', 'A solar panel on a pole under a palm tree, wired to a small lamp on the jetty.'],
  predict: ['Will the panel make more electricity in the shade or in full sun?', [opt('sun', 'Full sun'), opt('shade', 'Shade'), opt('same', 'The same')]],
  lab: ['Move the panel', 'Choose where the panel goes. Then press Test.', solar({ controls: ['site'], initial: { site: 'shaded' } }), 'A daytime jetty with a solar panel and lamp.'],
  evidence: [['shade', 'Test in the shade', and(val('site', 'shaded'), res('panel', 'weak'))], ['sun', 'Test in full sun', and(val('site', 'sunny'), res('panel', 'strong'))]],
  explain: {
    q: 'Why did the panel make more electricity in full sun?',
    choices: [ok('light', 'A solar panel needs plenty of light to make electricity'), no('same', 'Panels work the same anywhere', 'Your two tests gave different results. Only the place changed.'), no('hot', 'The shade made the panel too hot', 'Shade is cooler, not hotter. What did the tree block?')],
    hints: ['Compare your two tests.', 'What does the tree block?', 'Full sun: plenty of light, plenty of electricity.'],
  },
  transfer: [{
    heading: 'A cloudy week', text: 'The panel is in full sun, but the weather is changing.',
    alt: 'The jetty solar panel under a sky that might be cloudy.',
    layout: solar({ controls: ['weather'], initial: { weather: 'cloudy' }, goal: (r) => r.panel === 'strong' }),
    q: 'Why did the panel make less electricity on cloudy days?',
    choices: [ok('clouds', 'Clouds let less sunlight reach the panel'), no('wet', 'Clouds make the panel wet', 'The model has no rain. What do clouds block?')],
    hints: ['Try both kinds of weather.', 'Clouds block some sunlight.', 'Clear days: plenty of light.'],
  }],
  idea: 'A solar panel changes light into electricity. Less light, less electricity.',
  lesson: 'Science Lagoon lesson: Energy from the Sun',
});

const g3m3 = mission({
  grade: 3, number: 3, title: 'Keep a power record', concept: 'recording_observations',
  goal: 'Keep each switch setting paired with what you saw.',
  brief: ['The light record', 'The teacher wants a record of the classroom lamp at three checkpoints.', 'A classroom lamp, a wall switch and a record sheet with three empty rows.'],
  predict: ['What should each row of the record show?', [opt('both', 'The switch and the lamp'), opt('lamp', 'Only the lamp'), opt('time', 'Only the time')]],
  lab: ['Fill the record', 'Set the switch, then press Look. Do this three times.', hidden({ scene: 'classroom', device: 'lamp' }), 'The classroom lamp and the wall switch.'],
  evidence: [
    ['three', 'Three checkpoints recorded', { all: (ts) => ts.length >= 3 }],
    ['on', 'A row with the lamp on', lit('lamp')],
    ['off', 'A row with the lamp off', dark('lamp')],
  ],
  explain: {
    q: 'Why keep the switch setting next to the lamp result?',
    choices: [ok('pair', 'So each result shows what caused it'), no('neat', 'So the record looks neat', 'Neat is nice, but why does the switch matter?'), no('lamp', 'The lamp result is enough on its own', 'Without the switch setting, you cannot see why the lamp changed.')],
    evidenceQ: 'Which row shows the lamp on?',
    evidenceTest: lit('lamp'),
    hints: ['Look at your record rows.', 'The switch is the cause, the lamp is the result.', 'Switch on → lamp on. Keep them together.'],
  },
  transfer: [{
    heading: 'The fan record', text: 'Now record the bedroom fan at checkpoints.',
    alt: 'A bedroom fan and wall switch.',
    layout: hidden({ scene: 'bedroom', device: 'fan' }),
    q: 'A row says “Switch on → fan spinning”. What does it tell you?',
    choices: [ok('cause', 'When the switch was on, the fan spun'), no('always', 'The fan always spins', 'The row tells you about one setting. What about switch off?')],
    hints: ['Record a row with the fan spinning.', 'Each row pairs a setting and a result.', 'Switch on, Look, and read the row.'],
  }],
  idea: 'A good record keeps each setting next to the result it gave.',
  lesson: 'Science Lagoon lesson: Recording results',
});

const g3m4 = mission({
  grade: 3, number: 4, title: 'Batteries store energy', concept: 'battery_energy_store',
  goal: 'Say that a battery is a store of energy for a device.',
  brief: ['Porch torch', 'The porch torch helps everyone at night. Where does its energy come from?', 'A porch at night with a torch and a battery beside it.'],
  predict: ['Where does the torch get its energy?', [opt('battery', 'From the battery'), opt('switch', 'From the switch'), opt('air', 'From the air')]],
  lab: ['Test the torch', 'Change the battery and switch. Then press Look.', hidden({ scene: 'porch', device: 'torch', battery: true, switchStart: true }), 'The porch torch.'],
  evidence: [['out', 'Battery out, switch on: dark', and(conn('wA', 'missing'), sw('sw', true), dark('torch'))], ['in', 'Battery in: shining', lit('torch')]],
  explain: {
    q: 'What is the battery’s job?',
    choices: [ok('store', 'It stores energy, and the torch changes it into light'), no('light', 'It is full of light', 'A battery is dark inside. It stores energy, not light.'), no('switch', 'The switch makes the energy', 'With no battery, the switch did nothing.')],
    hints: ['Compare battery in and battery out.', 'The battery is an energy store.', 'Battery: stores energy. Torch: gives light.'],
  },
  transfer: [{
    heading: 'Radio at the beach', text: 'The radio is at the beach, far from any socket.',
    alt: 'A radio with a battery space.',
    layout: hidden({ scene: 'kitchen', device: 'radio', battery: true, switchStart: true }),
    q: 'Where does the radio’s energy come from at the beach?',
    choices: [ok('battery', 'The energy stored in its battery'), no('sun', 'The sunshine', 'This radio has no solar panel. What is inside it?')],
    hints: ['Look at the battery space.', 'The battery stores energy.', 'Battery in, then Look.'],
  }],
  idea: 'A battery is a store of energy. A device changes that energy into light, sound or movement.',
  lesson: 'Science Lagoon lesson: Energy stores',
});

const g3m5 = mission({
  grade: 3, number: 5, title: 'Panels after dark', concept: 'solar_needs_light',
  goal: 'Show that a solar panel makes no electricity in the dark.',
  brief: ['The jetty at night', 'The jetty lamp runs straight from its panel, with no battery. Will it work after sunset?', 'The jetty solar panel and lamp at dusk.'],
  predict: ['Will the panel make electricity after dark?', [opt('yes', 'Yes'), opt('no', 'No'), opt('little', 'A little')]],
  lab: ['Day and night', 'Choose the time. Then press Test.', solar({ controls: ['time'] }), 'The jetty panel and lamp.'],
  evidence: [['day', 'Daytime test', and(val('time', 'day'), res('panel', 'strong'))], ['night', 'After-dark test', and(val('time', 'night'), res('panel', 'none'))]],
  explain: {
    q: 'Why did the lamp go off after dark?',
    choices: [ok('nolight', 'There is no sunlight at night, so the panel makes no electricity'), no('tired', 'The panel got tired', 'Panels do not get tired. What was missing?'), no('cold', 'The night air is too cold', 'Temperature is not in this model. What was missing?')],
    hints: ['Compare day and night.', 'What does a panel need?', 'No sunlight, no electricity.'],
  },
  transfer: [{
    heading: 'Daytime in the shade', text: 'It is daytime. Get the jetty lamp working.',
    alt: 'The jetty panel under a tree.',
    layout: solar({ controls: ['site'], initial: { site: 'shaded' } }),
    q: 'What did the panel need?',
    choices: [ok('light', 'Plenty of sunlight'), no('night', 'Darkness', 'Darkness gave no electricity. What does a panel need?')],
    hints: ['Where is the panel?', 'Move it into the sun.', 'Full sun, then Test.'],
  }],
  idea: 'A solar panel needs light. In the dark it makes no electricity.',
  lesson: 'Science Lagoon lesson: Energy from the Sun',
});

const g3m6 = mission({
  grade: 3, number: 6, title: 'A fair panel test', concept: 'fair_test',
  goal: 'Compare two panel places while keeping everything else the same.',
  brief: ['Which place is better?', 'The council wants to know: is the roof or the garden better for a panel? You must test fairly.', 'The jetty panel with options for place and weather.'],
  predict: ['To compare places fairly, what should stay the same?', [opt('weather', 'The weather'), opt('nothing', 'Nothing needs to stay the same'), opt('place', 'The place')]],
  lab: ['Test fairly', 'Change one thing at a time. Then press Test.', solar({ controls: ['site', 'weather'] }), 'The jetty panel with place and weather settings.'],
  evidence: [['fair', 'Two tests where only the place changed', { pair: onlyChanged('site') }]],
  explain: {
    q: 'Why change only the place?',
    choices: [ok('cause', 'Then any difference must come from the place'), no('quick', 'It is quicker', 'Fair tests are about knowing the cause, not speed.'), no('both', 'Changing both is fine', 'If both changed, you could not tell which one caused the difference.')],
    evidenceQ: 'Pick a test where the panel was in full sun.',
    evidenceTest: val('site', 'sunny'),
    hints: ['Find two tests with the same weather.', 'Change only one thing.', 'Same weather, different place: that is fair.'],
  },
  transfer: [{
    heading: 'Weather check', text: 'Now find out if the weather matters. Keep the place the same.',
    alt: 'The jetty panel in full sun.',
    layout: solar({ controls: ['weather'], initial: { weather: 'cloudy' }, goal: (r) => r.panel === 'strong' }),
    q: 'In this test, what did you keep the same?',
    choices: [ok('place', 'The place'), no('weather', 'The weather', 'The weather is what you changed.')],
    hints: ['Only the weather can change here.', 'The place stays in full sun.', 'Try clear days.'],
  }],
  idea: 'A fair test changes one thing and keeps the rest the same.',
  lesson: 'Science Lagoon lesson: Fair tests',
});

const g3m7 = mission({
  grade: 3, number: 7, title: 'Our saving plan', concept: 'responsible_energy_use',
  goal: 'Make a light plan for a whole house.',
  brief: ['House plan', 'Make a plan for the house this evening.', 'A house with five rooms.'],
  predict: ['Will the best plan switch off the most lights?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure')]],
  lab: ['Plan the lights', 'Switch lights to match each room. Then press Check.', rooms({ list: [['kitchen', 'Kitchen', true, true], ['bed1', 'Big bedroom', false, true], ['bed2', 'Small bedroom', true, false], ['bath', 'Bathroom', false, true], ['porch', 'Porch', false, true]] }), 'Five rooms at home.'],
  evidence: [['fair', 'A fair plan', res('fair', true)]],
  explain: {
    q: 'What makes a good saving plan?',
    choices: [ok('match', 'Lights on only where people are'), no('most', 'As many lights off as possible', 'The small bedroom needs a light. Off is not always right.'), no('all', 'Leave them all on to be safe', 'Empty rooms do not need light.')],
    hints: ['Check who is in each room.', 'Some rooms need light, some do not.', 'Kitchen and small bedroom on; others off.'],
  },
  transfer: [{
    heading: 'Mosque courtyard', text: 'Make a plan for the community buildings this evening.',
    alt: 'A courtyard with a hall, a store room and a washroom.',
    layout: rooms({ list: [['hall', 'Hall', true, false], ['store', 'Store room', false, true], ['wash', 'Washroom', false, true]] }),
    q: 'Why is your plan fair?',
    choices: [ok('match', 'People have light, empty rooms are off'), no('most', 'Most lights are off', 'Counting is not enough. People need light.')],
    hints: ['Who is there?', 'The hall needs light.', 'Hall on; store and washroom off.'],
  }],
  idea: 'A good energy plan matches light to who needs it.',
  lesson: 'Science Lagoon lesson: Saving energy',
});

const CHANGE = {
  lamp: { label: 'Lamp', pic: 'lamp-on', props: { into: 'light, and some heating' } },
  efan: { label: 'Electric fan', pic: 'efan', props: { into: 'movement, and some sound' } },
  radio: { label: 'Radio', pic: '📻', props: { into: 'sound' } },
  cooker: { label: 'Rice cooker', pic: '🍚', props: { into: 'heating' } },
  kettle: { label: 'Electric kettle', pic: '🫖', props: { into: 'heating' } },
  bell: { label: 'Doorbell', pic: '🔔', props: { into: 'sound' } },
  toycar: { label: 'Toy car', pic: '🚗', props: { into: 'movement' } },
};
const showChange = (r, it) => `${it.label}: changes electrical energy into ${r.props.into}.`;

const g3m8 = mission({
  grade: 3, number: 8, title: 'Energy changers', concept: 'energy_changes',
  goal: 'Name what an electrical device changes energy into.',
  brief: ['What comes out?', 'Electrical energy goes in. What comes out of each device?', 'A shelf of devices: lamp, fan, radio, rice cooker.'],
  predict: ['What does a fan change electrical energy into?', [opt('move', 'Movement'), opt('light', 'Light'), opt('heat', 'Heating')]],
  lab: ['Check the devices', 'Tap a device. Then press Check.', catalogue({ items: pick(CHANGE, ['lamp', 'efan', 'radio', 'cooker']), show: showChange }), 'Four devices.'],
  evidence: [['fan', 'Check the fan', item('efan')], ['two', 'Check two other devices', { all: (ts) => new Set(ts.map((t) => t.result.item).filter((i) => i && i !== 'efan')).size >= 2 }]],
  explain: {
    q: 'Which device changes electrical energy mainly into sound?',
    choices: [ok('radio', 'The radio'), no('lamp', 'The lamp', 'The lamp gives light. Which one makes sound?'), no('cooker', 'The rice cooker', 'The rice cooker heats food.')],
    hints: ['Check the radio.', 'Sound is what you hear.', 'Radio: sound. Lamp: light. Fan: movement.'],
  },
  transfer: [{
    heading: 'More devices', text: 'Check three new devices.',
    alt: 'A kettle, a doorbell and a toy car.',
    layout: catalogue({ items: pick(CHANGE, ['kettle', 'bell', 'toycar']), show: showChange }),
    q: 'Which device changes electrical energy into movement?',
    choices: [ok('toycar', 'The toy car'), no('kettle', 'The kettle', 'The kettle heats water.')],
    hints: ['Check each one.', 'Movement means something moves.', 'The toy car’s wheels move.'],
  }],
  idea: 'Electrical devices change electrical energy into light, sound, movement or heating.',
  lesson: 'Science Lagoon lesson: Energy changes',
});

const MOVERS = {
  sail: { label: 'Sailing dhoni', pic: '⛵', props: { electric: false, energy: 'the wind' } },
  bike: { label: 'Bicycle', pic: '🚲', props: { electric: false, energy: 'your muscles' } },
  solarlamp: { label: 'Solar path light', pic: 'lamp-on', props: { electric: true, energy: 'sunlight changed into electricity' } },
  ferry: { label: 'Electric ferry', pic: '🛳️', props: { electric: true, energy: 'its big battery' } },
  handfan: { label: 'Hand fan', pic: '🪭', props: { electric: false, energy: 'your arm' } },
  kite: { label: 'Kite', pic: '🪁', props: { electric: false, energy: 'the wind' } },
  torch: { label: 'Torch', pic: '🔦', props: { electric: true, energy: 'its battery' } },
};
const showMover = (r, it) => `${it.label}: ${r.props.electric ? 'uses electricity' : 'no electricity'}. Energy comes from ${r.props.energy}.`;

const g3m9 = mission({
  grade: 3, number: 9, title: 'Not all energy is electric', concept: 'energy_sources',
  goal: 'Find where things get their energy, electric or not.',
  brief: ['Island energy hunt', 'On the island, things get energy in many ways. Find out where each gets its energy.', 'The lagoon with a sailing dhoni, a bicycle and a solar path light.'],
  predict: ['Does a sailing dhoni need electricity to move?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure')]],
  lab: ['Energy hunt', 'Tap a thing. Then press Check.', catalogue({ items: pick(MOVERS, ['sail', 'bike', 'solarlamp', 'ferry']), show: showMover }), 'Island things.'],
  evidence: [['sail', 'Check the dhoni', item('sail')], ['elec', 'Check something that uses electricity', prop('electric', true)]],
  explain: {
    q: 'Where does a sailing dhoni get energy to move?',
    choices: [ok('wind', 'The wind pushes the sail'), no('elec', 'Electricity from a battery', 'Check it again. A sail uses the wind.')],
    hints: ['Check the dhoni.', 'What fills a sail?', 'Wind: no electricity needed.'],
  },
  transfer: [{
    heading: 'Beach day energy', text: 'Check these beach things.',
    alt: 'A hand fan, a kite and a torch on the sand.',
    layout: catalogue({ items: pick(MOVERS, ['handfan', 'kite', 'torch']), show: showMover }),
    q: 'Which one uses electricity?',
    choices: [ok('torch', 'The torch'), no('kite', 'The kite', 'The kite uses the wind.')],
    hints: ['Check each one.', 'Look for a battery.', 'The torch has a battery.'],
  }],
  idea: 'Energy comes from many places: wind, muscles, sunlight and batteries. Not everything needs electricity.',
  lesson: 'Science Lagoon lesson: Energy changes',
});

const HAZ = {
  frayed: { label: 'Cable with a torn cover', pic: '🔌', props: { hazard: true, action: 'Keep away and tell a teacher.' } },
  water: { label: 'Water bottle on the socket shelf', pic: '💧', props: { hazard: true, action: 'Ask a teacher to move it.' } },
  adapter: { label: 'Adapter with too many plugs', pic: '🧩', props: { hazard: true, action: 'Tell a teacher. Too many plugs can overheat.' } },
  shelf: { label: 'Tidy bookshelf', pic: '📚', props: { hazard: false, action: 'No hazard here.' } },
  cord: { label: 'Cable across the doorway', pic: '〰️', props: { hazard: true, action: 'Tell an adult. Someone could trip and pull it.' } },
  dryer: { label: 'Hair dryer by the sink', pic: '🚿', props: { hazard: true, action: 'Tell an adult. Water and electricity are dangerous together.' } },
  lampok: { label: 'Lamp on a desk', pic: 'lamp-on', props: { hazard: false, action: 'No hazard here.' } },
};
const showHaz = (r, it) => `${it.label}: ${r.props.hazard ? 'hazard' : 'safe'}. ${r.props.action}`;

const g3m10 = mission({
  grade: 3, number: 10, title: 'Safety audit', concept: 'electrical_hazard',
  goal: 'Spot electrical hazards and say who to tell.',
  brief: ['Classroom audit', 'Walk round the classroom. Look for electrical hazards. Do not touch anything.', 'A classroom with a torn cable, a water bottle by a socket, a crowded adapter and a tidy bookshelf.'],
  predict: ['What should you do when you find a hazard?', [opt('tell', 'Keep away and tell a teacher'), opt('fix', 'Fix it yourself'), opt('ignore', 'Leave it')]],
  lab: ['Audit the room', 'Tap something. Then press Check.', catalogue({ items: pick(HAZ, ['frayed', 'water', 'adapter', 'shelf']), show: showHaz }), 'Four places in the classroom.'],
  evidence: [['two', 'Find two hazards', { all: (ts) => new Set(ts.filter((t) => t.result.props?.hazard).map((t) => t.result.item)).size >= 2 }], ['safe', 'Find something safe', prop('hazard', false)]],
  explain: {
    q: 'What do you do when you find a hazard?',
    choices: [ok('tell', 'Keep away and tell a teacher'), no('fix', 'Fix it myself carefully', 'Only trained adults fix electrical things.'), no('unplug', 'Pull out the plug', 'Do not touch. Tell a teacher.')],
    hints: ['Look at the action for each hazard.', 'Children do not touch hazards.', 'Keep away and tell a teacher.'],
  },
  transfer: [{
    heading: 'Home audit', text: 'Now check the house. Do not touch anything.',
    alt: 'A house with a cable across a doorway, a hair dryer by a sink and a lamp on a desk.',
    layout: catalogue({ items: pick(HAZ, ['cord', 'dryer', 'lampok']), show: showHaz }),
    q: 'Who should deal with the hair dryer by the sink?',
    choices: [ok('adult', 'An adult'), no('me', 'Me, quickly', 'Water nearby makes it dangerous. Tell an adult.')],
    hints: ['Check the hair dryer.', 'Water is near it.', 'Keep away and tell an adult.'],
  }],
  idea: 'Spot hazards with your eyes, not your hands. Keep away and tell an adult.',
  lesson: 'Science Lagoon lesson: Staying safe with electricity',
});

export default [g3m1, g3m2, g3m3, g3m4, g3m5, g3m6, g3m7, g3m8, g3m9, g3m10];
