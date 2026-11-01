// Grade 2: light sources and sight, devices and their jobs, safety.
// Short predictions with one reason; reading stays optional.

import { catalogue, hidden, light, rooms } from '../layouts.js';
import { mission, ok, no, opt, lit, conn, sw, val, res, item, prop, and } from './helpers.js';

const pick = (src, ids) => Object.fromEntries(ids.map((k) => [k, src[k]]));
const safety = (items) => catalogue({ items, prompt: 'Choose what to do', show: (r) => r.props.outcome, goal: (r) => r.props.safe === true });
const SAFE = (label, pic, outcome) => ({ label, pic, props: { safe: true, outcome } });
const UNSAFE = (label, pic, outcome) => ({ label, pic, props: { safe: false, outcome } });

const SRC = {
  torch: { label: 'Torch (switched on)', pic: '🔦', props: { source: true, note: 'It makes its own light.' } },
  mirror: { label: 'Mirror', pic: '🪞', props: { source: false, note: 'It reflects light that falls on it.' } },
  book: { label: 'Book', pic: '📖', props: { source: false, note: 'We see it when light bounces off it.' } },
  sun: { label: 'Sun', pic: '☀️', props: { source: true, note: 'It makes its own light.' } },
  foil: { label: 'Kitchen foil', pic: '🥈', props: { source: false, note: 'It is shiny and reflects light.' } },
  moon: { label: 'Moon', pic: '🌙', props: { source: false, note: 'It reflects light from the Sun.' } },
  star: { label: 'Star', pic: '⭐', props: { source: true, note: 'It makes its own light.' } },
  reflector: { label: 'Bicycle reflector', pic: '🚲', props: { source: false, note: 'It reflects car lights back.' } },
};
const showSrc = (r, it) => `${it.label}: ${r.props.source ? 'a light source' : 'not a light source'}. ${r.props.note}`;

const g2m1 = mission({
  grade: 2, number: 1, title: 'Source or reflector', concept: 'light_source_vs_reflector',
  goal: 'Tell a light source from a thing that reflects light.',
  brief: ['Bright things', 'The torch, the mirror and the foil all look bright. Do they all make light?', 'A dark table with a lit torch, a mirror and a crumpled piece of foil.'],
  predict: ['Does the mirror make its own light?', [opt('yes', 'Yes', '🪞'), opt('no', 'No, it reflects light', '↩️'), opt('unsure', 'Not sure', 'question')]],
  lab: ['Sort the bright things', 'Tap a thing. Then press Check.', catalogue({ items: pick(SRC, ['torch', 'mirror', 'book', 'sun', 'foil']), show: showSrc }), 'Things that look bright.'],
  evidence: [['source', 'Check a light source', prop('source', true)], ['mirror', 'Check the mirror', item('mirror')]],
  explain: {
    q: 'Why does the mirror look bright?',
    choices: [ok('reflect', 'It reflects light from a source, like the torch'), no('makes', 'It makes its own light', 'Check the mirror again. In the dark it does not shine at all.'), no('new', 'It is new and clean', 'Clean helps it reflect, but it still needs light falling on it.')],
    hints: ['Check the torch and the mirror.', 'A source makes light. A reflector bounces it.', 'Torch: source. Mirror: reflects the torch’s light.'],
  },
  transfer: [{
    heading: 'Lights in the night sky', text: 'Look up at night. Some lights in the sky are sources. Some are not.',
    alt: 'A night sky over the lagoon with the Moon and stars, and a bicycle on the jetty.',
    layout: catalogue({ items: pick(SRC, ['moon', 'star', 'reflector']), show: showSrc, goal: (r) => r.status === 'ok' }),
    q: 'Which one is a light source?',
    choices: [ok('star', 'The star'), no('moon', 'The Moon', 'The Moon looks bright, but it reflects light from the Sun.'), no('reflector', 'The bicycle reflector', 'It only shines when car lights fall on it.')],
    hints: ['Check each one.', 'Does it make light or bounce light?', 'Stars make their own light. The Moon reflects sunlight.'],
  }],
  idea: 'A light source makes its own light. A mirror, foil or the Moon only reflect light that falls on them.',
  lesson: 'Science Lagoon lesson: Light and seeing',
});

const g2m2 = mission({
  grade: 2, number: 2, title: 'Light reaches the eye', concept: 'light_path_to_eye',
  goal: 'Show that we see an object when light from a source bounces off it into our eyes.',
  brief: ['The dark den', 'Musa is in a dark den with a book. He cannot see the book. He has a torch.', 'A dark den with a book on a shelf, a torch and an eye looking at the book.'],
  predict: ['With the torch off, can Musa see the book?', [opt('yes', 'Yes', '👀'), opt('no', 'No', '🙈'), opt('unsure', 'Not sure', 'question')], [opt('dark', 'It is too dark'), opt('eyes', 'His eyes can see in the dark'), opt('book', 'The book is white')]],
  lab: ['Torch on, torch off', 'Switch the torch. Then press Test.', light({ controls: ['torch'] }), 'A torch, a book and an eye in a dark den.'],
  evidence: [['off', 'A test with the torch off: book not seen', and(val('torch', 'off'), res('seen', false))], ['on', 'A test with the torch on: book seen', and(val('torch', 'on'), res('seen', true))]],
  explain: {
    q: 'Why could Musa see the book with the torch on?',
    choices: [ok('path', 'Light went from the torch to the book, then into his eyes'), no('eyes', 'His eyes send out light', 'With the torch off he saw nothing, so his eyes do not make the light.'), no('glow', 'The book glows', 'The book was dark when the torch was off. It does not glow.')],
    hints: ['Compare torch off and torch on.', 'Light has to travel from a source to the book.', 'Torch → book → eye. No torch, no light to see by.'],
  },
  transfer: [{
    heading: 'Curtains', text: 'Now the torch battery is flat. There is a window with curtains.',
    alt: 'The same den with a curtained window.',
    layout: light({ controls: ['room'], initial: { torch: 'off' } }),
    q: 'How did Musa see the book this time?',
    choices: [ok('sun', 'Sunlight came through the window to the book, then to his eyes'), no('eyes', 'His eyes got used to it', 'With the curtains closed he saw nothing. What changed?')],
    hints: ['What else gives light?', 'The Sun is a light source.', 'Open the curtains, then Test.'],
  }],
  idea: 'We see things when light from a source bounces off them and reaches our eyes.',
  lesson: 'Science Lagoon lesson: Light and seeing',
});

const TOOLS = {
  lamp: { label: 'Lamp', pic: 'lamp-on', props: { job: 'light', electric: true } },
  efan: { label: 'Electric fan', pic: 'efan', props: { job: 'cooling', electric: true } },
  handfan: { label: 'Hand fan', pic: '🪭', props: { job: 'cooling', electric: false } },
  broom: { label: 'Broom', pic: '🧹', props: { job: 'cleaning', electric: false } },
  torch: { label: 'Torch', pic: '🔦', props: { job: 'light', electric: true } },
  walllamp: { label: 'Wall lamp', pic: 'lamp-on', props: { job: 'light', electric: true, wall: true } },
  book: { label: 'Book', pic: '📖', props: { job: 'reading', electric: false } },
};
const showTool = (r, it) => `${it.label}: job is ${r.props.job}; ${r.props.electric ? (r.props.wall ? 'needs electricity from the wall' : 'needs electricity') : 'needs no electricity'}.`;

const g2m3 = mission({
  grade: 2, number: 3, title: 'Power and purpose', concept: 'device_purpose',
  goal: 'Choose a tool for a job, and see that not every tool needs electricity.',
  brief: ['The right tool', 'Every tool has a job. Some need electricity, some do not.', 'A cupboard with a lamp, an electric fan, a hand fan and a broom.'],
  predict: ['Does every useful tool need electricity?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
  lab: ['Check each tool', 'Tap a tool. Then press Check.', catalogue({ items: pick(TOOLS, ['lamp', 'efan', 'handfan', 'broom']), show: showTool }), 'Four tools.'],
  evidence: [['efan', 'Check the electric fan', item('efan')], ['handfan', 'Check the hand fan', item('handfan')]],
  explain: {
    q: 'Ali wants to cool down at the beach. There are no plugs. Which tool fits?',
    choices: [ok('handfan', 'The hand fan: same job, no electricity'), no('efan', 'The electric fan', 'Its job fits, but it needs electricity and there are no plugs.'), no('lamp', 'The lamp', 'A lamp gives light, not cooling.')],
    hints: ['Both fans have the same job.', 'Which one works without electricity?', 'Hand fan: cools you, no plug needed.'],
  },
  transfer: [{
    heading: 'Reading on the boat', text: 'Leila wants to read on the boat after dark. There are no plugs on the boat.',
    alt: 'A dhoni at night with a child holding a book.',
    layout: catalogue({ items: pick(TOOLS, ['walllamp', 'torch', 'book']), show: showTool, goal: (r) => r.status === 'ok' }),
    q: 'Which tool should Leila take?',
    choices: [ok('torch', 'The torch'), no('walllamp', 'The wall lamp', 'It needs the wall for electricity. There are no plugs on the boat.')],
    hints: ['She needs light.', 'Which light works without a plug?', 'A torch carries its own battery.'],
  }],
  idea: 'Choose a tool by its job. Many tools do their job without electricity.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const g2m4 = mission({
  grade: 2, number: 4, title: 'Shadow puppets', concept: 'shadows',
  goal: 'Show that an object that blocks light makes a shadow.',
  brief: ['Shadow show', 'The class is putting on a shadow show. They have cardboard and clear glass.', 'A torch shining at a wall, with a piece of cardboard and a sheet of clear glass nearby.'],
  predict: ['Will clear glass make a shadow?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')], [opt('see', 'You can see through glass'), opt('solid', 'Glass is solid'), opt('guess', 'Just a guess')]],
  lab: ['Make a shadow', 'Choose what goes between the torch and the book. Then press Test.', light({ controls: ['blocker'], initial: { torch: 'on' } }), 'A torch, a space in the middle and a book by the wall.'],
  evidence: [['card', 'A test with cardboard: shadow', and(val('blocker', 'card'), res('shadow', true))], ['glass', 'A test with glass: no shadow', and(val('blocker', 'glass'), res('shadow', false))]],
  explain: {
    q: 'Why did cardboard make a shadow but glass did not?',
    choices: [ok('block', 'Cardboard blocks light. Clear glass lets light through.'), no('size', 'The glass is smaller', 'They are the same size in the model. What does each one do to light?'), no('dark', 'Shadows are dark stuff from the cardboard', 'A shadow is a place light cannot reach.')],
    hints: ['Look at where the light went.', 'Some things let light through.', 'Card: light stopped, shadow. Glass: light passes, no shadow.'],
  },
  transfer: [{
    heading: 'Hide the book', text: 'Make the book disappear in the dark using what you have learned.',
    alt: 'A torch shining on a book in a dark den.',
    layout: light({ controls: ['blocker'], initial: { torch: 'on' }, goal: (r) => r.sourceOn && !r.reaches }),
    q: 'Why can’t you see the book now?',
    choices: [ok('card', 'The cardboard stops light reaching the book'), no('torch', 'The torch went off', 'The torch is still on. What is in the way?')],
    hints: ['Put something between the torch and the book.', 'Which one blocks light?', 'Cardboard, then Test.'],
  }],
  idea: 'A shadow forms where an object blocks light. Clear glass lets light through, so it makes no dark shadow.',
  lesson: 'Science Lagoon lesson: Light and shadows',
});

const g2m5 = mission({
  grade: 2, number: 5, title: 'Shiny in the dark', concept: 'reflector_needs_light',
  goal: 'Show that a mirror can only be seen when light reaches it.',
  brief: ['The hidden mirror', 'There is a mirror in the dark den. Musa says, “Mirrors shine, so I will see it.”', 'A dark den with a mirror on the wall and a torch that is off.'],
  predict: ['In the dark with the torch off, will Musa see the mirror?', [opt('yes', 'Yes, it shines'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
  lab: ['Test the mirror', 'Switch the torch. Then press Test.', light({ controls: ['torch'], object: 'mirror' }), 'A torch, a mirror and an eye in a dark den.'],
  evidence: [['off', 'Torch off: mirror not seen', and(val('torch', 'off'), res('seen', false))], ['on', 'Torch on: mirror seen', and(val('torch', 'on'), res('seen', true))]],
  explain: {
    q: 'What does the mirror need so Musa can see it?',
    choices: [ok('light', 'Light from a source falling on it'), no('shine', 'Nothing, mirrors shine by themselves', 'With the torch off, the mirror was not seen.'), no('clean', 'A clean cloth', 'Clean helps, but without light it stays dark.')],
    hints: ['Compare torch off and torch on.', 'A mirror is not a light source.', 'No light in, no light out.'],
  },
  transfer: [{
    heading: 'Glass or card', text: 'The torch is on, but something is between it and the mirror.',
    alt: 'A torch, a space for a card or glass, and a mirror.',
    layout: light({ controls: ['blocker'], initial: { torch: 'on', blocker: 'card' }, object: 'mirror' }),
    q: 'What did you change so you could see the mirror?',
    choices: [ok('path', 'I let light reach the mirror'), no('mirror', 'I made the mirror shine by itself', 'The mirror does not make light. What reached it?')],
    hints: ['What is blocking the light?', 'Try clear glass or nothing.', 'Light must reach the mirror first.'],
  }],
  idea: 'Shiny things are not light sources. We see them only when light reaches them.',
  lesson: 'Science Lagoon lesson: Light and seeing',
});

const g2m6 = mission({
  grade: 2, number: 6, title: 'Torch for the night walk', concept: 'battery_and_switch',
  goal: 'Show that a torch needs a battery and the switch on.',
  brief: ['The night walk', 'The family is going for a walk at night. The torch needs checking.', 'A porch at night with a torch on a table and its battery beside it.'],
  predict: ['If the battery is in but the switch is off, will it shine?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')], [opt('battery', 'The battery is enough'), opt('both', 'It needs the switch too'), opt('guess', 'Just a guess')]],
  lab: ['Check the torch', 'Change the battery and the switch. Then press Look.', hidden({ scene: 'porch', device: 'torch', battery: true }), 'A torch on the porch table.'],
  evidence: [
    ['nobattery', 'Switch on, no battery: dark', and(sw('sw', true), conn('wA', 'missing'), (t) => !t.result.lit.torch)],
    ['noswitch', 'Battery in, switch off: dark', and(sw('sw', false), conn('wA', 'metal'), (t) => !t.result.lit.torch)],
    ['both', 'Battery in, switch on: shining', lit('torch')],
  ],
  explain: {
    q: 'What does the torch need to shine?',
    choices: [ok('both', 'A battery and the switch on'), no('switch', 'Only the switch on', 'Look at your test with no battery. The switch was on but it was dark.'), no('battery', 'Only a battery', 'Look at your test with the switch off.')],
    hints: ['Look at all three looks.', 'It was dark if either was missing.', 'Battery in + switch on = light.'],
  },
  transfer: [{
    heading: 'Beach radio', text: 'The beach radio is quiet. Make it play.',
    alt: 'A radio on a kitchen counter with a battery space and a switch.',
    layout: hidden({ scene: 'kitchen', device: 'radio', battery: true }),
    q: 'What did the radio need?',
    choices: [ok('both', 'A battery and the switch on'), no('switch', 'Only the switch', 'Try the switch with no battery. Does it play?')],
    hints: ['Check the battery and the switch.', 'It needs both, like the torch.', 'Battery in, switch on, then Look.'],
  }],
  idea: 'A torch needs energy from a battery, and the switch must be on.',
  lesson: 'Science Lagoon lesson: Electricity around us',
});

const NIGHT = {
  sun: { label: 'Sun', pic: '☀️', props: { night: false, note: 'At night the Sun is not in our sky.' } },
  torch: { label: 'Torch', pic: '🔦', props: { night: true, note: 'You can switch it on any time.' } },
  path: { label: 'Path light', pic: 'lamp-on', props: { night: true, note: 'It is switched on after dark.' } },
  window: { label: 'Window', pic: '🪟', props: { night: false, note: 'A window only lets light in. At night there is little to let in.' } },
  moon: { label: 'Moon', pic: '🌙', props: { night: false, note: 'It reflects sunlight. Some nights it is not in the sky.' } },
  phone: { label: 'Phone screen', pic: '📱', props: { night: true, note: 'It gives its own light.' } },
};
const showNight = (r, it) => `${it.label}: ${r.props.night ? 'can light the way at night' : 'cannot light the way at night'}. ${r.props.note}`;

const g2m7 = mission({
  grade: 2, number: 7, title: 'Day light, night light', concept: 'sources_at_night',
  goal: 'Pick light sources that work after dark.',
  brief: ['After sunset', 'In the day the Sun lights the island. What lights the way at night?', 'The island at sunset with path lights, a torch and a window.'],
  predict: ['Can the Sun light the path at night?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
  lab: ['Check the lights', 'Tap a thing. Then press Check.', catalogue({ items: pick(NIGHT, ['sun', 'torch', 'path', 'window']), show: showNight }), 'Things that light the island.'],
  evidence: [['sun', 'Check the Sun', item('sun')], ['night', 'Check one light that works at night', prop('night', true)]],
  explain: {
    q: 'Why do we need path lights at night?',
    choices: [ok('sun', 'At night the Sun is not in our sky, so we need another light source'), no('off', 'The Sun gets switched off', 'Nobody switches the Sun off. Our side of Earth turns away from it.'), no('dark', 'Darkness blocks the Sun', 'Darkness is just no light. It does not block anything.')],
    hints: ['Check the Sun.', 'Where is the Sun at night?', 'No Sun in the sky, so we use lights we can switch on.'],
  },
  transfer: [{
    heading: 'Camping on the sandbank', text: 'The class is camping on the sandbank. What can light the tent?',
    alt: 'A tent on a sandbank at night.',
    layout: catalogue({ items: pick(NIGHT, ['moon', 'torch', 'phone']), show: showNight, goal: (r) => r.status === 'ok' }),
    q: 'Which light source can you carry and switch on?',
    choices: [ok('torch', 'The torch'), no('moon', 'The Moon', 'The Moon is not a source, and some nights it is not in the sky.')],
    hints: ['Check each one.', 'Which ones work every night?', 'A torch is a source you carry and switch on.'],
  }],
  idea: 'At night the Sun is not in our sky, so we use light sources we can switch on.',
  lesson: 'Science Lagoon lesson: Light and seeing',
});

const g2m8 = mission({
  grade: 2, number: 8, title: 'Light goes straight', concept: 'light_straight_lines',
  goal: 'Show that light travels in straight lines.',
  brief: ['Cards with holes', 'Two cards stand between the torch and the book. Each card has a small hole.', 'A torch, two upright cards with holes, and a book.'],
  predict: ['If the holes are not in a line, will light reach the book?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')], [opt('bend', 'Light can bend round'), opt('straight', 'Light goes straight'), opt('guess', 'Just a guess')]],
  lab: ['Line up the holes', 'Move the cards. Then press Test.', light({ controls: ['holes'], initial: { torch: 'on', holes: 'not' } }), 'A torch shining at two cards with holes and a book.'],
  evidence: [['not', 'Holes not lined up: book not seen', and(val('holes', 'not'), res('seen', false))], ['lined', 'Holes lined up: book seen', and(val('holes', 'lined'), res('seen', true))]],
  explain: {
    q: 'Why must the holes line up?',
    choices: [ok('straight', 'Light travels in straight lines'), no('bend', 'Light bends round corners', 'If it could bend, it would reach the book with the holes out of line.'), no('thick', 'The cards are too thick', 'The cards did not change. Only the holes moved.')],
    hints: ['Compare your two tests.', 'Only the hole position changed.', 'In line: light gets through. Out of line: blocked.'],
  },
  transfer: [{
    heading: 'Mirror at the end', text: 'Now there is a mirror at the end. The holes are out of line again.',
    alt: 'A torch, two cards and a mirror.',
    layout: light({ controls: ['holes'], initial: { torch: 'on', holes: 'not' }, object: 'mirror' }),
    q: 'What did you do so the light reached the mirror?',
    choices: [ok('line', 'Put the holes in a straight line'), no('bright', 'Made the torch brighter', 'The torch did not change. What about the holes?')],
    hints: ['Look at the holes.', 'Light only goes straight.', 'Line them up and Test.'],
  }],
  idea: 'Light travels in straight lines. It cannot bend round a card.',
  lesson: 'Science Lagoon lesson: Light and shadows',
});

const g2m9 = mission({
  grade: 2, number: 9, title: 'Saving energy at home', concept: 'responsible_energy_use',
  goal: 'Switch off lights that nobody is using.',
  brief: ['Evening at home', 'It is evening. Some lights are on in rooms with nobody inside.', 'A house with a bedroom, living room and bathroom.'],
  predict: ['How many lights are on with nobody using them?', [opt('none', 'None'), opt('one', 'One'), opt('two', 'Two')]],
  lab: ['Switch off the waste', 'Tap rooms to switch lights. Then press Check.', rooms({ list: [['bed', 'Bedroom', false, true], ['living', 'Living room', true, true], ['bath', 'Bathroom', false, true]] }), 'Three rooms at home.'],
  evidence: [['fair', 'A check with no wasted light', res('fair', true)]],
  explain: {
    q: 'Why turn off lights nobody is using?',
    choices: [ok('save', 'They use energy but help nobody'), no('break', 'Lights break if they stay on', 'That is not the reason here. Who is using them?'), no('all', 'All lights should be off', 'People in the living room need light.')],
    hints: ['Who is in each room?', 'Lights in empty rooms are waste.', 'Empty: off. People inside: on.'],
  },
  transfer: [{
    heading: 'Is all off fair?', text: 'Dad is cooking in the dark. The porch is empty with its light on. Grandma is reading.',
    alt: 'A kitchen with Dad cooking in the dark, an empty lit porch and Grandma reading.',
    layout: rooms({ list: [['kitchen', 'Kitchen', true, false], ['porch', 'Porch', false, true], ['reading', 'Reading room', true, true]] }),
    q: 'Should we turn every light off to save energy?',
    choices: [ok('no', 'No, people in a room still need light'), no('yes', 'Yes, all off saves the most', 'Dad and Grandma need light to cook and read safely.')],
    hints: ['Who needs light?', 'Save energy without leaving people in the dark.', 'Kitchen on, porch off, reading room on.'],
  }],
  idea: 'Save energy by switching off lights nobody is using, while keeping light where people need it.',
  lesson: 'Science Lagoon lesson: Saving energy',
});

const g2m10 = mission({
  grade: 2, number: 10, title: 'Kites and power lines', concept: 'electrical_hazard',
  goal: 'Keep away from power lines and tell a grown-up.',
  brief: ['Kite day', 'It is windy. Ahmed wants to fly his kite. There are power lines along the road.', 'A windy road with tall power lines and an open field nearby.'],
  predict: ['Where should Ahmed fly his kite?', [opt('field', 'In the open field'), opt('road', 'By the road'), opt('unsure', 'Not sure', 'question')]],
  lab: ['Choose what to do', 'Tap a choice. Then press Check.', safety({
    field: SAFE('Fly it in the open field, far from the lines', '🪁', 'Good choice. Far from power lines, the kite is safe.'),
    road: UNSAFE('Fly it by the power lines', '⚡', 'Stop. A kite string touching power lines can give an electric shock.'),
    climb: UNSAFE('If it gets stuck in the lines, climb up to get it', '🧗', 'Stop. Never climb near power lines. Leave it and tell a grown-up.'),
  }), 'Three choices for flying the kite.'],
  evidence: [['safe', 'Find the safe choice', prop('safe', true)], ['stuck', 'Check what to do if a kite gets stuck', item('climb')]],
  explain: {
    q: 'Why fly kites far from power lines?',
    choices: [ok('shock', 'The string could touch the lines and give a shock'), no('wind', 'There is less wind near lines', 'It is about danger, not wind.')],
    hints: ['Check each choice.', 'Power lines carry a lot of electricity.', 'Far away is safe; stuck kites stay stuck.'],
  },
  transfer: [{
    heading: 'After the storm', text: 'After a storm, a power line is lying on the road.',
    alt: 'A road after a storm with a fallen power line across it.',
    layout: safety({
      away: SAFE('Stay far away and tell a grown-up', '🙋', 'Well done. The grown-up calls the electricity company.'),
      poke: UNSAFE('Poke it with a stick', '🪵', 'Stop. Fallen lines can still carry electricity.'),
      walk: UNSAFE('Walk past it quickly', '🏃', 'Stop. Keep far away from fallen lines.'),
    }),
    q: 'What is the safe choice?',
    choices: [ok('away', 'Stay far away and tell a grown-up'), no('look', 'Go closer to see if it is working', 'Never go closer. It could still carry electricity.')],
    hints: ['Fallen lines can still be dangerous.', 'Keep far away.', 'Stay away and tell a grown-up.'],
  }],
  idea: 'Keep far away from power lines and fallen cables. Tell a grown-up.',
  lesson: 'Science Lagoon lesson: Staying safe with electricity',
});

export default [g2m1, g2m2, g2m3, g2m4, g2m5, g2m6, g2m7, g2m8, g2m9, g2m10];
