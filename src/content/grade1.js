// Grade 1: everyday electricity, cause and effect, keeping safe.
// Wiring stays hidden. One instruction per screen, picture choices.

import { catalogue, hidden, rooms } from '../layouts.js';
import { mission, ok, no, opt, lit, dark, sw, conn, item, prop, and } from './helpers.js';

const devices = (ids) => Object.fromEntries(ids.map((id) => [id, DEVICES[id]]));
const DEVICES = {
  radio: { label: 'Radio', pic: '📻', props: { electric: true, clue: 'It has a battery inside.' } },
  tv: { label: 'Television', pic: '📺', props: { electric: true, clue: 'It has a plug. Only grown-ups plug things in.' } },
  torch: { label: 'Torch', pic: '🔦', props: { electric: true, clue: 'It has a battery inside.' } },
  efan: { label: 'Electric fan', pic: 'efan', props: { electric: true, clue: 'It has a plug and a switch.' } },
  broom: { label: 'Broom', pic: '🧹', props: { electric: false, clue: 'Your arms make it work.' } },
  scissors: { label: 'Scissors', pic: '✂️', props: { electric: false, clue: 'Your hand makes it work.' } },
  handfan: { label: 'Hand fan', pic: '🪭', props: { electric: false, clue: 'You wave it with your hand.' } },
  kite: { label: 'Kite', pic: '🪁', props: { electric: false, clue: 'The wind lifts it.' } },
  bell: { label: 'Doorbell', pic: '🔔', props: { electric: true, clue: 'It is joined to the house electricity.' } },
};
const showElectric = (r, it) => `${it.label}: ${r.props.electric ? 'needs electricity' : 'works without electricity'}. ${r.props.clue}`;

const safety = (items) => catalogue({ items, prompt: 'Choose what to do', show: (r) => r.props.outcome, goal: (r) => r.props.safe === true });
const SAFE = (label, pic, outcome) => ({ label, pic, props: { safe: true, outcome } });
const UNSAFE = (label, pic, outcome) => ({ label, pic, props: { safe: false, outcome } });

const g1m1 = mission({
  grade: 1, number: 1, title: 'What needs power', concept: 'electrical_devices',
  goal: 'Tell which things need electricity and which do not.',
  brief: ['Some things need electricity', 'The classroom has lots of things in it. Some need electricity to work. Some do not. Let’s find out which.', 'A classroom shelf with a radio, a television, a broom and scissors.'],
  predict: ['Which one needs electricity?', [opt('radio', 'The radio', '📻'), opt('broom', 'The broom', '🧹'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Check each thing', 'Tap a thing. Then press Check.', catalogue({ items: devices(['radio', 'tv', 'broom', 'scissors']), show: showElectric }), 'Four classroom things to check.'],
  evidence: [
    ['needs', 'Check one thing that needs electricity', prop('electric', true)],
    ['without', 'Check one thing that works without electricity', prop('electric', false)],
  ],
  explain: {
    q: 'How can you tell the radio needs electricity?',
    aloud: true,
    choices: [
      ok('battery', 'It has a battery or a plug', '🔋'),
      no('big', 'It is big', 'The television is big and needs electricity, but the broom is big too and does not. Look for a battery or a plug.', '🐘'),
      no('new', 'It is new', 'New or old does not matter. Look for a battery or a plug.', '✨'),
    ],
    hints: ['Look at what the radio has inside.', 'Things that need electricity have a battery or a plug.', 'Radio: battery, needs electricity. Broom: no battery, no plug, no electricity.'],
  },
  transfer: [{
    heading: 'Two fans', text: 'It is hot. There is an electric fan and a hand fan. Check them both.',
    alt: 'An electric fan with a plug and a folded hand fan.',
    layout: catalogue({ items: devices(['efan', 'handfan', 'kite']), show: showElectric, goal: (r) => r.item === 'handfan' || r.item === 'efan' }),
    q: 'Which fan needs electricity?',
    choices: [ok('efan', 'The electric fan', 'efan'), no('hand', 'The hand fan', 'You wave a hand fan with your hand. It has no battery or plug.', '🪭')],
    hints: ['Check the electric fan.', 'Look for a plug or a battery.', 'The electric fan has a plug. The hand fan does not.'],
  }],
  idea: 'Things that need electricity have a battery or a plug. Many useful things work without electricity.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const g1m2 = mission({
  grade: 1, number: 2, version: 4, title: 'A light for the room', concept: 'cause_and_effect_switch',
  goal: 'See that pressing a switch turns a lamp on or off.',
  brief: ['The classroom is dark', 'Aisha wants to read her book. The room is too dark. Can you help?', 'An island classroom with a desk, a window showing grey clouds, a ceiling lamp that is off, and a light switch on the wall.'],
  predict: ['What will happen to the lamp if you press the switch?', [opt('on', 'The lamp turns on', 'lamp-on'), opt('off', 'The lamp stays off', 'lamp-off'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Try the switch', 'Press the switch. Then press Look.', hidden({ scene: 'classroom', device: 'lamp' }), 'The classroom lamp and the wall switch.'],
  evidence: [['saw-on', 'A look with the lamp on', lit('lamp')], ['saw-off', 'A look with the lamp off', dark('lamp')]],
  explain: {
    q: 'What made the lamp light up?', aloud: true,
    choices: [
      ok('switch', 'I pressed the switch', 'press'),
      no('clap', 'I clapped my hands', 'Look at your two tries. The lamp changed when the switch changed.', 'clap'),
      no('sun', 'The sun came out', 'The sun did not change in the room. Only the switch changed.', 'sun'),
    ],
    hints: ['Look at the switch in your two tries.', 'When the switch was on, the lamp was on.', 'Try 1: switch off, lamp off. Try 2: switch on, lamp on. Only the switch changed.'],
  },
  transfer: [
    {
      heading: 'The path is getting dark', text: 'The sun is going down. The path light is off. Help the children see the path.',
      alt: 'A sandy island path between palm trees at sunset, with a path light and a switch box.',
      layout: hidden({ scene: 'path-dusk', device: 'lamp' }),
      q: 'How did you light the path?',
      choices: [ok('switch', 'I pressed the path light switch', 'press'), no('wait', 'I waited for the sun', 'The sun was going down, not up. What did you press?', 'sun'), no('blow', 'I blew on the lamp', 'Blowing does not change a lamp. What did you press?', 'blow')],
      hints: ['Find the switch box next to the path light.', 'Press the switch, then press Look.', 'The switch makes the light go on, just like in the classroom.'],
    },
    {
      heading: 'Read the noticeboard', text: 'It is evening. The noticeboard lamp is off. Help everyone read the notices.',
      alt: 'A community noticeboard with notices pinned to it, a small lamp above it and a switch on its side.',
      layout: hidden({ scene: 'noticeboard', device: 'lamp' }),
      q: 'How did you light the noticeboard?',
      choices: [ok('switch', 'I pressed the switch', 'press'), no('clap', 'I clapped my hands', 'Clapping does not change a lamp. What did you press?', 'clap')],
      hints: ['Find the switch on the board.', 'Press the switch, then press Look.', 'The switch makes the light go on.'],
    },
  ],
  idea: 'A switch turns a lamp on and off.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const g1m3 = mission({
  grade: 1, number: 3, title: 'Safe choices', concept: 'electrical_hazard',
  goal: 'Keep away from a damaged cable and tell a grown-up.',
  brief: ['A broken cable', 'Ibrahim sees a cable on the classroom floor. Its cover is torn and the metal inside shows.', 'A picture of a cable on the floor with its outer cover torn open.'],
  predict: ['What should Ibrahim do?', [opt('tell', 'Keep away and tell a grown-up', '🙋'), opt('touch', 'Pick it up', '✋'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Choose what to do', 'Tap a choice. Then press Check to see what happens.', safety({
    tell: SAFE('Keep away and tell a grown-up', '🙋', 'Well done. The grown-up switches off the power and gets it fixed. Everyone stays safe.'),
    touch: UNSAFE('Pick it up', '✋', 'Stop. A damaged cable can give an electric shock. Keep away and tell a grown-up.'),
    fix: UNSAFE('Wrap it with tape yourself', '🩹', 'Stop. Only a trained grown-up should fix cables. Keep away and tell a grown-up.'),
  }), 'Three things Ibrahim could do.'],
  evidence: [['safe', 'Find the safe choice', prop('safe', true)]],
  explain: {
    q: 'Why should Ibrahim keep away?', aloud: true,
    choices: [ok('shock', 'A broken cable can hurt him', '⚠️'), no('dirty', 'The cable is dirty', 'Dirt is not the problem. A broken cable can give an electric shock.', '🧽'), no('teacher', 'The teacher wants it', 'The teacher wants to know so they can keep everyone safe. Why is it dangerous?', '🧑‍🏫')],
    hints: ['Look at what happens when you pick it up.', 'A broken cable can give an electric shock.', 'Keep away, then tell a grown-up.'],
  },
  transfer: [{
    heading: 'Water near the socket', text: 'Some water spilled on the floor near a plug in the wall.',
    alt: 'A puddle of water on the floor near a plug in a wall socket.',
    layout: safety({
      tell: SAFE('Tell a grown-up straight away', '🙋', 'Well done. The grown-up switches off the power before cleaning up.'),
      push: UNSAFE('Push the plug in tighter', '✋', 'Stop. Never touch plugs near water. Tell a grown-up.'),
      wipe: UNSAFE('Wipe the water near the plug', '🧽', 'Stop. Water and electricity are dangerous together. Tell a grown-up.'),
    }),
    q: 'What is the safe thing to do?',
    choices: [ok('tell', 'Keep away and tell a grown-up', '🙋'), no('wipe', 'Clean it up myself', 'Water and electricity together are dangerous. Let a grown-up switch off the power first.', '🧽')],
    hints: ['Think about water and electricity together.', 'Do not touch plugs or water near them.', 'Keep away and tell a grown-up, just like with the broken cable.'],
  }],
  idea: 'If something electrical looks broken or wet, keep away and tell a grown-up.',
  lesson: 'Science Lagoon lesson: Staying safe with electricity',
});

const SOURCES = {
  torch: { label: 'Torch', pic: '🔦', props: { source: 'battery', note: 'It carries its own battery.' } },
  car: { label: 'Toy car', pic: '🚗', props: { source: 'battery', note: 'It carries its own battery.' } },
  clock: { label: 'Alarm clock', pic: '⏰', props: { source: 'battery', note: 'It carries its own battery.' } },
  tv: { label: 'Television', pic: '📺', props: { source: 'wall', note: 'It plugs into the wall. Only grown-ups plug things in.' } },
  broom: { label: 'Broom', pic: '🧹', props: { source: 'none', note: 'It needs no electricity.' } },
  watch: { label: 'Wristwatch', pic: '⌚', props: { source: 'battery', note: 'A tiny battery is inside.' } },
  computer: { label: 'Desk computer', pic: '🖥️', props: { source: 'wall', note: 'It plugs into the wall.' } },
};
const showSource = (r, it) => `${it.label}: ${r.props.source === 'battery' ? 'gets power from a battery' : r.props.source === 'wall' ? 'gets power from the wall' : 'needs no power'}. ${r.props.note}`;

const g1m4 = mission({
  grade: 1, number: 4, title: 'Battery or wall', concept: 'electricity_sources',
  goal: 'Tell whether a device gets power from a battery or from the wall.',
  brief: ['Where does the power come from?', 'We are going on a picnic on the beach. There are no plugs on the beach! Which things can we take?', 'A beach picnic mat with a basket, next to palm trees and the lagoon.'],
  predict: ['Will the television work on the beach?', [opt('yes', 'Yes', '📺'), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Check the power', 'Tap a thing. Then press Check.', catalogue({ items: Object.fromEntries(['torch', 'car', 'tv', 'broom'].map((k) => [k, SOURCES[k]])), show: showSource }), 'Things we might take on a picnic.'],
  evidence: [['battery', 'Check one thing with a battery', prop('source', 'battery')], ['wall', 'Check one thing that plugs into the wall', prop('source', 'wall')]],
  explain: {
    q: 'Why can we take the torch to the beach?', aloud: true,
    choices: [ok('own', 'It has its own battery', '🔋'), no('small', 'It is small', 'Size does not matter. Where does the torch get its power?', '🤏'), no('none', 'Torches do not need power', 'A torch needs power to shine. Where does it come from?', '🔦')],
    hints: ['Look at where the torch gets power.', 'Some things carry a battery with them.', 'Torch: battery, works on the beach. Television: wall plug, does not.'],
  },
  transfer: [{
    heading: 'The boat trip', text: 'We are going on a boat. There are no plugs on the boat. Check these things.',
    alt: 'A small dhoni boat on the lagoon.',
    layout: catalogue({ items: Object.fromEntries(['watch', 'computer', 'clock'].map((k) => [k, SOURCES[k]])), show: showSource, goal: (r) => r.status === 'ok' }),
    q: 'Which one will work on the boat?',
    choices: [ok('watch', 'The wristwatch', '⌚'), no('computer', 'The desk computer', 'The desk computer plugs into the wall. There are no plugs on the boat.', '🖥️')],
    hints: ['Check each thing.', 'Things with a battery work without plugs.', 'The watch has a tiny battery inside.'],
  }],
  idea: 'Some things get power from a battery they carry. Others need the wall, and only grown-ups plug those in.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const g1m5 = mission({
  grade: 1, number: 5, title: 'The fan on a hot day', concept: 'cause_and_effect_switch',
  goal: 'See that a switch turns a fan on and off.',
  brief: ['It is so hot', 'Hassan is hot in his bedroom. There is a fan by the bed. It is not moving.', 'A bedroom at night with a fan on the desk that is not moving, and a wall switch.'],
  predict: ['What will the fan do when you press the switch?', [opt('spin', 'It will spin', 'efan'), opt('still', 'It will stay still', '🛑'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Try the fan switch', 'Press the switch. Then press Look.', hidden({ scene: 'bedroom', device: 'fan' }), 'The bedroom fan and the wall switch.'],
  evidence: [['on', 'A look with the fan spinning', lit('fan')], ['off', 'A look with the fan still', dark('fan')]],
  explain: {
    q: 'What made the fan spin?', aloud: true,
    choices: [ok('switch', 'I pressed the switch', 'press'), no('wind', 'The wind blew it', 'The window was closed. What did you press?', '🌬️'), no('clap', 'I clapped my hands', 'The fan changed when the switch changed, not when you clapped.', 'clap')],
    hints: ['Look at the switch in each look.', 'Switch on: fan spins.', 'Switch off: fan still. Switch on: fan spins.'],
  },
  transfer: [{
    heading: 'Music in the kitchen', text: 'Grandma wants to hear the radio in the kitchen. It is quiet.',
    alt: 'A kitchen with a radio on the counter and a switch on the wall.',
    layout: hidden({ scene: 'kitchen', device: 'radio' }),
    q: 'How did you make the radio play?',
    choices: [ok('switch', 'I pressed the switch', 'press'), no('shake', 'I shook the radio', 'Shaking does not turn it on. What did you press?', '🤲')],
    hints: ['Find the switch.', 'Press the switch, then press Look.', 'The switch turns the radio on, like the fan.'],
  }],
  idea: 'A switch turns many things on and off: lamps, fans and radios.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const LIGHT = {
  sun: { label: 'Sun', pic: '☀️', props: { gives: true } },
  torch: { label: 'Torch (switched on)', pic: '🔦', props: { gives: true } },
  lamp: { label: 'Lamp (switched on)', pic: 'lamp-on', props: { gives: true } },
  spoon: { label: 'Shiny spoon', pic: '🥄', props: { gives: false } },
  book: { label: 'Book', pic: '📖', props: { gives: false } },
  ball: { label: 'Ball', pic: '⚽', props: { gives: false } },
  star: { label: 'Star', pic: '⭐', props: { gives: true } },
  shell: { label: 'Shell', pic: '🐚', props: { gives: false } },
  teddy: { label: 'Teddy', pic: '🧸', props: { gives: false } },
};
const showLight = (r, it) => `${it.label}: ${r.props.gives ? 'gives its own light' : 'does not give its own light'}.`;
const pick = (src, ids) => Object.fromEntries(ids.map((k) => [k, src[k]]));

const g1m6 = mission({
  grade: 1, number: 6, title: 'Light givers', concept: 'light_sources',
  goal: 'Tell things that give light from things that do not.',
  brief: ['What gives light?', 'Some things give their own light. Other things do not. Let’s check.', 'A table with a torch, a lamp, a shiny spoon and a book.'],
  predict: ['Does the shiny spoon give its own light?', [opt('yes', 'Yes', '🥄'), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Check for light', 'Tap a thing. Then press Check.', catalogue({ items: pick(LIGHT, ['sun', 'torch', 'lamp', 'spoon', 'book', 'ball']), show: showLight }), 'Things to check for light.'],
  evidence: [['gives', 'Check one thing that gives light', prop('gives', true)], ['spoon', 'Check the shiny spoon', item('spoon')]],
  explain: {
    q: 'The spoon looks shiny. Does it give its own light?', aloud: true,
    choices: [ok('no', 'No. It shines only when light falls on it', '🥄'), no('yes', 'Yes, shiny things make light', 'Check the spoon again. Shiny things shine only when light falls on them.', '✨')],
    hints: ['Check the spoon.', 'Shiny is not the same as giving light.', 'Torch: gives light. Spoon: shiny, but no light of its own.'],
  },
  transfer: [{
    heading: 'Night on the beach', text: 'It is night on the beach. Check these things.',
    alt: 'A dark beach at night with a star in the sky, a shell and a teddy on the sand.',
    layout: catalogue({ items: pick(LIGHT, ['star', 'shell', 'teddy']), show: showLight, goal: (r) => r.status === 'ok' }),
    q: 'Which one gives its own light?',
    choices: [ok('star', 'The star', '⭐'), no('shell', 'The shell', 'The shell does not give light. Which one shines by itself?', '🐚')],
    hints: ['Check each thing.', 'Look for the one that shines by itself.', 'Stars give their own light, like the Sun.'],
  }],
  idea: 'Some things give their own light. Shiny things only shine when light falls on them.',
  lesson: 'Science Lagoon lesson: Light around us',
});

const g1m7 = mission({
  grade: 1, number: 7, title: 'Lights off when we leave', concept: 'responsible_energy_use',
  goal: 'Switch off lights in empty rooms.',
  brief: ['Who left the lights on?', 'It is break time. Some rooms are empty, but their lights are still on.', 'A school seen from above with three rooms. Two are empty with lights on; one has children inside.'],
  predict: ['Should the light stay on in an empty room?', [opt('yes', 'Yes', 'lamp-on'), opt('no', 'No', 'lamp-off'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Fix the lights', 'Tap a room to switch its light. Then press Check.', rooms({ list: [['class', 'Classroom', false, true], ['library', 'Library', true, true], ['art', 'Art room', false, true]] }), 'Three school rooms and their lights.'],
  evidence: [['fair', 'A check where no light is wasted', (t) => t.result.fair === true]],
  explain: {
    q: 'Why switch off the light in the empty room?', aloud: true,
    choices: [ok('waste', 'Nobody needs it, so we save energy', 'lamp-off'), no('scary', 'Lights are scary', 'Lights are not scary. Who needs a light in an empty room?', '👻'), no('library', 'Switch off every light', 'The children in the library still need light.', '📚')],
    hints: ['Look at who is in each room.', 'Empty rooms do not need light.', 'Empty room: light off. Children inside: light on.'],
  },
  transfer: [{
    heading: 'Home at night', text: 'The family is eating in the kitchen. The bedroom is empty.',
    alt: 'A house with a kitchen where the family is eating in the dark and an empty bedroom with its light on.',
    layout: rooms({ list: [['kitchen', 'Kitchen', true, false], ['bedroom', 'Bedroom', false, true]] }),
    q: 'Why did you switch the kitchen light on?',
    choices: [ok('need', 'People are there and need light', '👪'), no('all', 'All lights should be on', 'The empty bedroom does not need light.', 'lamp-on')],
    hints: ['Who is in the kitchen?', 'People need light. Empty rooms do not.', 'Kitchen: on. Bedroom: off.'],
  }],
  idea: 'Switch lights off in empty rooms. Leave them on where people need them.',
  lesson: 'Science Lagoon lesson: Saving energy',
});

const g1m8 = mission({
  grade: 1, number: 8, title: 'The torch needs a battery', concept: 'battery_needed',
  goal: 'See that a torch needs a battery to shine.',
  brief: ['The torch will not shine', 'Mariyam found a torch in the workshop. The switch is on, but it does not shine. The battery is missing!', 'A workshop bench with a torch and an empty battery space.'],
  predict: ['If you put a battery in, will the torch shine?', [opt('yes', 'Yes', '🔦'), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Try the battery', 'Put the battery in or take it out. Then press Look.', hidden({ scene: 'workshop', device: 'torch', battery: true, switchStart: true }), 'The torch on the workshop bench.'],
  evidence: [['out', 'A look with no battery', and(conn('wA', 'missing'), dark('torch'))], ['in', 'A look with the battery in and the torch shining', lit('torch')]],
  explain: {
    q: 'Why did the torch shine at the end?', aloud: true,
    choices: [ok('battery', 'It had a battery and the switch was on', '🔋'), no('shake', 'I shook it', 'Shaking did not change anything. What did you put in?', '🤲'), no('sun', 'The sun charged it', 'The torch was inside the workshop. What did you put in?', 'sun')],
    hints: ['Look at your two looks.', 'No battery: no light.', 'Battery out: dark. Battery in: shining.'],
  },
  transfer: [{
    heading: 'The quiet radio', text: 'The beach radio has no battery. Make it play.',
    alt: 'A radio on a kitchen counter with an open battery space.',
    layout: hidden({ scene: 'kitchen', device: 'radio', battery: true, switchStart: true }),
    q: 'What did the radio need?',
    choices: [ok('battery', 'A battery', '🔋'), no('louder', 'More buttons', 'Buttons do not give power. What did it need?', '🔘')],
    hints: ['Look at the battery space.', 'Put the battery in.', 'Battery in, switch on, then Look.'],
  }],
  idea: 'A torch needs a battery to shine. The battery gives it energy.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const g1m9 = mission({
  grade: 1, number: 9, title: 'Wet hands, dry hands', concept: 'electrical_hazard',
  goal: 'Keep water away from electrical things.',
  brief: ['Wet hands', 'Zara has been swimming. Her hands are wet. She wants to switch on the fan.', 'A child with dripping wet hands next to a wall switch.'],
  predict: ['What should Zara do first?', [opt('dry', 'Dry her hands', '🧻'), opt('now', 'Switch on now', '✋'), opt('unsure', 'I am not sure', 'question')]],
  lab: ['Choose what to do', 'Tap a choice. Then press Check.', safety({
    dry: SAFE('Dry hands, then ask a grown-up', '🧻', 'Well done. Dry hands and a grown-up nearby keep Zara safe.'),
    wet: UNSAFE('Switch on with wet hands', '✋', 'Stop. Water and electricity are dangerous together. Dry your hands first.'),
    splash: UNSAFE('Splash water on the fan to cool it', '💦', 'Stop. Never put water on electrical things. Tell a grown-up.'),
  }), 'Three things Zara could do.'],
  evidence: [['safe', 'Find the safe choice', prop('safe', true)]],
  explain: {
    q: 'Why must Zara dry her hands?', aloud: true,
    choices: [ok('water', 'Water and electricity are dangerous together', '⚠️'), no('clean', 'To keep the switch clean', 'It is about safety, not cleaning.', '🧽')],
    hints: ['What happens with wet hands?', 'Water and electricity do not mix.', 'Dry hands first, and ask a grown-up.'],
  },
  transfer: [{
    heading: 'The ball by the power box', text: 'Your ball rolled next to a big electricity box with a danger sign.',
    alt: 'A green electricity box with a yellow danger sign behind a fence, and a ball next to it.',
    layout: safety({
      tell: SAFE('Leave it and tell a grown-up', '🙋', 'Well done. The grown-up can ask the electricity company to help.'),
      climb: UNSAFE('Climb the fence to get it', '🧗', 'Stop. Never go near a power box with a danger sign.'),
      stick: UNSAFE('Poke it out with a stick', '🪵', 'Stop. Keep away from the power box. Tell a grown-up.'),
    }),
    q: 'What is the safe choice?',
    choices: [ok('tell', 'Leave it and tell a grown-up', '🙋'), no('climb', 'Get it quickly', 'Even quickly is not safe. Keep away.', '🏃')],
    hints: ['Look at the danger sign.', 'Danger signs mean keep away.', 'Keep away and tell a grown-up.'],
  }],
  idea: 'Keep water away from electricity. Keep away from danger signs and tell a grown-up.',
  lesson: 'Science Lagoon lesson: Staying safe with electricity',
});

const JOBS = {
  lamp: { label: 'Lamp', pic: 'lamp-on', props: { job: 'light' } },
  efan: { label: 'Electric fan', pic: 'efan', props: { job: 'cool' } },
  radio: { label: 'Radio', pic: '📻', props: { job: 'sound' } },
  cooker: { label: 'Rice cooker', pic: '🍚', props: { job: 'heat' } },
  torch: { label: 'Torch', pic: '🔦', props: { job: 'light' } },
  bell: { label: 'Doorbell', pic: '🔔', props: { job: 'sound' } },
};
const JOB_WORDS = { light: 'gives light', cool: 'cools us down', sound: 'makes sound', heat: 'heats food' };
const showJob = (r, it) => `${it.label}: its job is that it ${JOB_WORDS[r.props.job]}.`;

const g1m10 = mission({
  grade: 1, number: 10, title: 'Power helpers', concept: 'device_purpose',
  goal: 'Match an electrical helper to its job.',
  brief: ['Helpers with jobs', 'Electrical helpers each have a job. Let’s find out what each one does.', 'A shelf with a lamp, a fan, a radio and a rice cooker.'],
  predict: ['Which helper do we need to read at night?', [opt('lamp', 'The lamp', 'lamp-on'), opt('fan', 'The fan', 'efan'), opt('radio', 'The radio', '📻')]],
  lab: ['Find each job', 'Tap a helper. Then press Check.', catalogue({ items: pick(JOBS, ['lamp', 'efan', 'radio', 'cooker']), show: showJob }), 'Four electrical helpers.'],
  evidence: [['lamp', 'Check the lamp', item('lamp')], ['other', 'Check one more helper', (t) => t.result.item && t.result.item !== 'lamp']],
  explain: {
    q: 'Aisha is very hot. Which helper’s job fits?', aloud: true,
    choices: [ok('fan', 'The fan', 'efan'), no('radio', 'The radio', 'The radio makes sound. Which one cools us down?', '📻'), no('lamp', 'The lamp', 'The lamp gives light. Which one cools us down?', 'lamp-on')],
    hints: ['Think about being hot.', 'Which helper moves air?', 'The fan cools us down.'],
  },
  transfer: [{
    heading: 'The boat comes home', text: 'The fishing boat is coming in after dark. Check these helpers.',
    alt: 'A dark jetty at night with a fishing boat coming in.',
    layout: catalogue({ items: pick(JOBS, ['torch', 'bell', 'cooker']), show: showJob, goal: (r) => r.status === 'ok' }),
    q: 'Which helper should we take to the jetty?',
    choices: [ok('torch', 'The torch', '🔦'), no('bell', 'The doorbell', 'A doorbell makes sound. It is dark. What do we need?', '🔔'), no('cooker', 'The rice cooker', 'The rice cooker heats food. It is dark. What do we need?', '🍚')],
    hints: ['It is dark at the jetty.', 'We need light.', 'The torch gives light.'],
  }],
  idea: 'Each electrical helper has a job: light, cooling, sound or heat.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

export default [g1m1, g1m2, g1m3, g1m4, g1m5, g1m6, g1m7, g1m8, g1m9, g1m10];
