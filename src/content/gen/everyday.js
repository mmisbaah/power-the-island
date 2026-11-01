// Generated everyday missions: safety choices, hidden-circuit scenes and
// room-lighting plans. Each house gets a different scenario.

import { catalogue, hidden, rooms } from '../../layouts.js';
import { ok, no, opt, lit, dark, sw, conn, prop, and, res } from '../helpers.js';
import { generated, nameFor, placeFor, rng, shuffle, cap } from './common.js';

// ---------- safety ----------

// [heading, situation, alt, safe action, [unsafe, outcome], [unsafe, outcome], why-wrong]
const CABLES = [
  ['The chewed cable', 'The cat chewed the lamp cable. Now the wires show.', 'A lamp cable with bite marks and wires showing.', 'Pick the cable up and tape it', 'Stop. Only a trained grown-up fixes cables.', 'Switch the lamp on to test it', 'Stop. A damaged cable can give a shock.'],
  ['The bent plug', 'A plug on the floor has a bent pin.', 'A plug with one bent pin.', 'Push it into the socket anyway', 'Stop. Never touch damaged plugs.', 'Bend the pin back yourself', 'Stop. Leave it for a grown-up.'],
  ['The squashed cable', 'A cable is trapped under the heavy table leg.', 'A table leg pressing on a cable.', 'Pull the cable out hard', 'Stop. Pulling can damage it more.', 'Lift the table yourself', 'Stop. Tell a grown-up instead.'],
  ['The cracked extension lead', 'The extension lead has a crack in its case.', 'An extension lead with a cracked case.', 'Plug the radio into it', 'Stop. A cracked lead is not safe to use.', 'Hold the crack shut with your hand', 'Stop. Keep your hands away.'],
  ['The taped-up cord', 'The fan cord has lots of tape wrapped round it.', 'A fan cord wrapped in tape.', 'Unwrap the tape to look', 'Stop. There may be damage underneath.', 'Add more tape', 'Stop. A grown-up should replace it.'],
  ['The sparking socket', 'Mum’s charger made a spark at the socket.', 'A wall socket with a small scorch mark.', 'Pull the charger out quickly', 'Stop. Let a grown-up switch the power off.', 'Try another plug in it', 'Stop. Keep away from it.'],
  ['The smoky fan', 'The fan smells of smoke.', 'A fan with a wisp of smoke.', 'Blow on it to cool it', 'Stop. Keep away and tell a grown-up.', 'Open it up to look', 'Stop. Never open electrical things.'],
  ['The burnt plug', 'A plug has a black burnt mark on it.', 'A plug with a burn mark.', 'Wipe the mark off', 'Stop. Burn marks mean danger.', 'Keep using it', 'Stop. Tell a grown-up.'],
  ['The dangling wire', 'A wire is hanging loose from the ceiling.', 'A loose wire hanging from a ceiling.', 'Jump up and pull it', 'Stop. Never touch loose wires.', 'Poke it with a broom', 'Stop. Keep away.'],
  ['The hot charger', 'The phone charger is very hot and smells strange.', 'A charger plugged in, looking too hot.', 'Pick it up to feel it', 'Stop. It could burn or shock you.', 'Cover it with a cloth', 'Stop. That could start a fire.'],
];
const WATER = [
  ['The wet towel', 'A wet towel is hanging over the lamp.', 'A damp towel draped on a lamp.', 'Move the towel yourself', 'Stop. Water and electricity are dangerous together.', 'Switch the lamp on to dry it', 'Stop. Never put water near electricity.'],
  ['Spilled juice', 'Juice spilled next to the computer.', 'A juice puddle by a computer.', 'Wipe it up near the plug', 'Stop. Let a grown-up switch off first.', 'Keep playing on the computer', 'Stop. Tell a grown-up.'],
  ['Radio by the bath', 'Someone left a plugged-in radio next to the bath.', 'A radio on the edge of a bath.', 'Move it while standing in water', 'Stop. Get a grown-up.', 'Splash it to see if it still works', 'Stop. Never.'],
  ['Rain by the TV', 'Rain is coming through the window onto the TV.', 'Rain dripping near a TV.', 'Unplug the TV yourself', 'Stop. Let a grown-up do it.', 'Dry the TV with your shirt', 'Stop. Keep away.'],
  ['Watering plants', 'You are watering plants next to a socket.', 'A watering can near a socket.', 'Keep watering near the socket', 'Stop. Keep water away from sockets.', 'Spray the socket to clean it', 'Stop. Never.'],
  ['Wet feet', 'Your feet are wet and the floor is wet by the washing machine.', 'A wet floor by a washing machine.', 'Press the machine switch', 'Stop. Dry off and ask a grown-up.', 'Mop under the machine', 'Stop. Tell a grown-up.'],
  ['Charging by the sink', 'A phone is charging right next to the full sink.', 'A charging phone by a sink.', 'Grab the phone with wet hands', 'Stop. Dry your hands; tell a grown-up.', 'Pull the cable out of the water', 'Stop. Keep away.'],
  ['Kettle cable', 'The kettle cable is hanging into the wet sink.', 'A kettle cable dangling into a sink.', 'Pull the cable out', 'Stop. A grown-up must switch off first.', 'Turn on the kettle', 'Stop. Never.'],
  ['Puddle under the fridge', 'There is a puddle under the fridge.', 'Water under a fridge.', 'Lie down and look under it', 'Stop. Keep away and tell a grown-up.', 'Unplug the fridge yourself', 'Stop. Let a grown-up do it.'],
  ['Water fight', 'Your friends want a water fight near the TV.', 'Water pistols near a TV.', 'Play by the TV', 'Stop. Play outside, away from electricity.', 'Squirt the TV for fun', 'Stop. Never.'],
];
const OUTDOOR = [
  ['Coconut climbing', 'A friend wants to climb a palm next to the power lines.', 'A palm tree beside overhead lines.', 'Climb up to help', 'Stop. Never climb near power lines.', 'Throw stones at the coconuts', 'Stop. You might hit the lines.'],
  ['Ball over the fence', 'Your ball went over the fence of the power station.', 'A ball behind a fence with a danger sign.', 'Climb the fence', 'Stop. Never go inside.', 'Reach through with a stick', 'Stop. Keep away.'],
  ['Fishing on the jetty', 'There are cables above the jetty where you want to fish.', 'Overhead cables above a jetty.', 'Cast your rod up high anyway', 'Stop. A rod could touch the cables.', 'Climb the cable pole', 'Stop. Never.'],
  ['Flooded street', 'After heavy rain, a cable is lying in a puddle.', 'A cable in a flooded street.', 'Walk through the water', 'Stop. The water could carry electricity.', 'Splash the cable', 'Stop. Keep far away.'],
  ['Leaning lamp post', 'A street lamp post is leaning after the storm.', 'A street light leaning over a path.', 'Push it straight', 'Stop. Keep far away.', 'Play underneath it', 'Stop. It is not safe.'],
  ['The generator shed', 'The island generator shed door is open.', 'An open door with a danger sign.', 'Go in to look around', 'Stop. Never go inside.', 'Close the door yourself', 'Stop. Tell a grown-up.'],
  ['Harbour kite', 'You want to fly your kite by the harbour cables.', 'Cables near the harbour.', 'Fly it near the cables', 'Stop. Fly kites in open spaces.', 'Use a wet string', 'Stop. Still not safe near cables.'],
  ['Storm swim', 'There is thunder and lightning while you are swimming.', 'Dark clouds over the lagoon.', 'Keep swimming', 'Stop. Get out and go indoors.', 'Shelter under a tall tree', 'Stop. Go indoors.'],
  ['The ladder', 'Workers left a metal ladder by the power lines.', 'A metal ladder near overhead lines.', 'Climb the ladder', 'Stop. Never.', 'Move the ladder', 'Stop. Leave it and tell a grown-up.'],
  ['Damaged meter box', 'The meter box on a wall is open and broken.', 'An open, damaged meter box.', 'Close it with your hands', 'Stop. Keep away.', 'Look inside', 'Stop. Tell a grown-up.'],
];

const SAFETY_SPECS = {
  '1-3': { pool: CABLES, concept: 'electrical_hazard', goal: 'Keep away from damaged electrical things and tell a grown-up.', idea: 'If something electrical looks broken, hot or smoky, keep away and tell a grown-up.' },
  '1-9': { pool: WATER, concept: 'electrical_hazard', goal: 'Keep water away from electrical things.', idea: 'Keep water away from electricity. Dry hands, keep away, and tell a grown-up.' },
  '2-10': { pool: OUTDOOR, concept: 'electrical_hazard', goal: 'Keep away from power lines and danger signs and tell a grown-up.', idea: 'Keep far away from power lines, fallen cables and danger signs. Tell a grown-up.' },
};

function safetyLayout(sc) {
  const [, , , u1, o1, u2, o2] = sc;
  return catalogue({
    items: {
      tell: { label: 'Keep away and tell a grown-up', pic: '🙋', props: { safe: true, outcome: 'Well done. The grown-up makes it safe. Everyone stays safe.' } },
      u1: { label: u1, pic: '✋', props: { safe: false, outcome: o1 } },
      u2: { label: u2, pic: '⚠️', props: { safe: false, outcome: o2 } },
    },
    prompt: 'Choose what to do',
    show: (r) => r.props.outcome,
    goal: (r) => r.props.safe === true,
  });
}

export function safetyMission(grade, number, house) {
  const spec = SAFETY_SPECS[`${grade}-${number}`];
  const sc = spec.pool[(house - 2) % spec.pool.length];
  const tc = spec.pool[(house - 1) % spec.pool.length];
  const name = nameFor(grade, number, house);
  return generated({
    grade, number, house, title: `Safe choices: ${sc[0].toLowerCase()}`, concept: spec.concept, goal: spec.goal,
    brief: [sc[0], `${name} sees a problem. ${sc[1]}`, sc[2]],
    predict: [`What should ${name} do?`, [opt('tell', 'Keep away and tell a grown-up', '🙋'), opt('do', 'Sort it out myself', '✋'), opt('unsure', 'I am not sure', 'question')]],
    lab: ['Choose what to do', 'Tap a choice. Then press Check.', safetyLayout(sc), 'Three things to do.'],
    evidence: [['safe', 'Find the safe choice', prop('safe', true)]],
    explain: {
      q: `Why should ${name} keep away?`, aloud: grade === 1,
      choices: [ok('danger', 'It could give an electric shock or start a fire', '⚠️'), no('dirty', 'It is messy', 'Mess is not the problem. Electricity can hurt you.', '🧽'), no('grownup', 'Grown-ups like fixing things', 'Grown-ups can switch the power off safely. Why is it dangerous?', '🧑')],
      hints: ['Look at what happens with each choice.', 'Damaged things, water and power lines can give a shock.', 'Keep away and tell a grown-up.'],
    },
    transfer: [{
      heading: tc[0], text: tc[1], alt: tc[2], layout: safetyLayout(tc),
      q: 'What is the safe choice?',
      choices: [ok('tell', 'Keep away and tell a grown-up', '🙋'), no('me', tc[3], tc[4], '✋')],
      hints: ['Think about the danger.', 'Do not touch.', 'Keep away and tell a grown-up.'],
    }],
    idea: spec.idea, lesson: 'Science Lagoon lesson: Staying safe with electricity',
  });
}

// ---------- hidden circuits ----------

const SCENES = {
  classroom: { where: 'the classroom', lamp: 'the classroom', },
  bedroom: { where: 'the bedroom' },
  'path-dusk': { where: 'the beach path' },
  noticeboard: { where: 'the noticeboard' },
  kitchen: { where: 'the kitchen' },
  porch: { where: 'the porch' },
  workshop: { where: 'the workshop' },
};
const SCENE_IDS = Object.keys(SCENES);
const DEVICE = {
  lamp: { name: 'lamp', on: 'on', off: 'off', need: 'It is too dark', pics: ['lamp-on', 'lamp-off'], why: 'light' },
  fan: { name: 'fan', on: 'spinning', off: 'still', need: 'It is too hot', pics: ['efan', '🛑'], why: 'a breeze' },
  radio: { name: 'radio', on: 'playing', off: 'quiet', need: 'It is too quiet', pics: ['📻', '🔇'], why: 'music' },
  torch: { name: 'torch', on: 'shining', off: 'dark', need: 'It is too dark to see', pics: ['🔦', '🌑'], why: 'light' },
};

function sceneFor(grade, number, house, k = 0) {
  return SCENE_IDS[(grade * 3 + number * 5 + house * 2 + k * 3) % SCENE_IDS.length];
}

export function switchMission(grade, number, house) {
  const devs = number === 2 ? ['lamp'] : number === 5 ? ['fan', 'radio', 'fan'] : ['lamp', 'fan', 'radio', 'torch'];
  const dv = devs[house % devs.length];
  const tdv = devs[(house + 1) % devs.length];
  const D = DEVICE[dv];
  const T = DEVICE[tdv];
  const sc = sceneFor(grade, number, house);
  const tsc = sceneFor(grade, number, house, 1) === sc ? sceneFor(grade, number, house, 2) : sceneFor(grade, number, house, 1);
  const name = nameFor(grade, number, house);
  const name2 = nameFor(grade, number, house, 1);
  const record = number === 3;
  return generated({
    grade, number, house,
    title: record ? `${name}’s ${D.name} record` : `${name}’s ${D.name} in ${SCENES[sc].where}`,
    concept: record ? 'recording_observations' : 'cause_and_effect_switch',
    goal: record ? 'Keep each switch setting paired with what you saw.' : `See that pressing a switch turns a ${D.name} on or off.`,
    brief: [`${cap(SCENES[sc].where)}`, `${D.need} in ${SCENES[sc].where}. ${name} wants ${D.why}. Can you help?`, `${cap(SCENES[sc].where)} with a ${D.name} that is ${D.off} and a switch on the wall.`],
    predict: record
      ? ['What should each row of the record show?', [opt('both', 'The switch and what happened'), opt('device', 'Only what happened'), opt('time', 'Only the time')]]
      : [`What will the ${D.name} do if you press the switch?`, [opt('on', `It will be ${D.on}`, D.pics[0]), opt('off', `It will stay ${D.off}`, D.pics[1]), opt('unsure', 'I am not sure', 'question')]],
    lab: [record ? 'Fill the record' : `Try the ${D.name} switch`, record ? 'Set the switch, then press Look. Do this three times.' : 'Press the switch. Then press Look.',
      hidden({ scene: sc, device: dv }), `The ${D.name} and the wall switch.`],
    evidence: record
      ? [['three', 'Three checkpoints recorded', { all: (ts) => ts.length >= 3 }], ['on', `A row with the ${D.name} ${D.on}`, lit(dv)], ['off', `A row with the ${D.name} ${D.off}`, dark(dv)]]
      : [['on', `A look with the ${D.name} ${D.on}`, lit(dv)], ['off', `A look with the ${D.name} ${D.off}`, dark(dv)]],
    explain: record ? {
      q: 'Why keep the switch setting next to the result?',
      choices: [ok('pair', 'So each result shows what caused it'), no('neat', 'So the record looks neat', 'Neat is nice, but why does the switch matter?'), no('alone', 'The result is enough on its own', 'Without the switch setting, you cannot see why it changed.')],
      evidenceQ: `Which row shows the ${D.name} ${D.on}?`, evidenceTest: lit(dv),
      hints: ['Look at your rows.', 'The switch is the cause; the result is what happened.', `Switch on → ${D.name} ${D.on}.`],
    } : {
      q: `What made the ${D.name} ${D.on}?`, aloud: grade === 1,
      choices: [ok('switch', 'I pressed the switch', 'press'), no('clap', 'I clapped my hands', `The ${D.name} changed when the switch changed.`, 'clap'), no('wish', 'I wished for it', `Wishing does not change a ${D.name}. What did you press?`, '✨')],
      hints: ['Look at the switch in each look.', `Switch on: ${D.name} ${D.on}.`, `Switch off: ${D.off}. Switch on: ${D.on}.`],
    },
    transfer: [{
      heading: cap(SCENES[tsc].where), text: `${name2} wants ${T.why} in ${SCENES[tsc].where}. The ${T.name} is ${T.off}.`,
      alt: `A ${T.name} and a switch in ${SCENES[tsc].where}.`, layout: hidden({ scene: tsc, device: tdv }),
      q: `How did you make the ${T.name} ${T.on}?`,
      choices: [ok('switch', 'I pressed its switch', 'press'), no('shake', 'I shook it', 'Shaking does not change it. What did you press?', '🤲')],
      hints: ['Find the switch.', 'Press it, then press Look.', 'The switch turns it on.'],
    }],
    idea: record ? 'A good record keeps each setting next to the result it gave.' : 'A switch turns lamps, fans and radios on and off.',
    lesson: record ? 'Science Lagoon lesson: Recording results' : 'Science Lagoon lesson: Electricity around us',
  });
}

export function batteryMission(grade, number, house) {
  const devs = ['torch', 'radio', 'fan', 'torch', 'radio'];
  const dv = devs[house % devs.length];
  const tdv = devs[(house + 2) % devs.length];
  const D = DEVICE[dv];
  const T = DEVICE[tdv];
  const sc = sceneFor(grade, number, house);
  const tsc = sceneFor(grade, number, house, 1) === sc ? sceneFor(grade, number, house, 2) : sceneFor(grade, number, house, 1);
  const name = nameFor(grade, number, house);
  const both = number === 6;
  const store = number === 4;
  const startOn = !both;
  const evidence = both
    ? [['nobat', 'Switch on, no battery: nothing happens', and(sw('sw', true), conn('wA', 'missing'), dark(dv))],
      ['noswitch', 'Battery in, switch off: nothing happens', and(sw('sw', false), conn('wA', 'metal'), dark(dv))],
      ['both', `Battery in, switch on: ${D.on}`, lit(dv)]]
    : [['out', 'A look with no battery', and(conn('wA', 'missing'), dark(dv))], ['in', `A look with the battery in and the ${D.name} ${D.on}`, lit(dv)]];
  const explain = both ? {
    q: `What does the ${D.name} need?`,
    choices: [ok('both', 'A battery and the switch on'), no('switch', 'Only the switch on', 'Look at your test with no battery.'), no('battery', 'Only a battery', 'Look at your test with the switch off.')],
    hints: ['Look at all your looks.', 'It failed if either was missing.', 'Battery in + switch on.'],
  } : store ? {
    q: 'What is the battery’s job?',
    choices: [ok('store', `It stores energy, and the ${D.name} changes it into ${D.why}`), no('full', `It is full of ${D.why}`, 'A battery stores energy, not light or sound.'), no('switch', 'The switch makes the energy', 'With no battery, the switch did nothing.')],
    hints: ['Compare battery in and out.', 'The battery is an energy store.', `Battery: stores energy. ${cap(D.name)}: gives ${D.why}.`],
  } : {
    q: `Why did the ${D.name} work at the end?`, aloud: grade === 1,
    choices: [ok('battery', 'It had a battery and the switch was on', '🔋'), no('shake', 'I shook it', 'Shaking did not change anything. What did you put in?', '🤲'), no('sun', 'The sun charged it', 'It was indoors. What did you put in?', 'sun')],
    hints: ['Look at your looks.', 'No battery: nothing.', 'Battery out: nothing. Battery in: working.'],
  };
  return generated({
    grade, number, house,
    title: store ? `Energy store for ${name}’s ${D.name}` : both ? `${name}’s ${D.name} check` : `${name}’s ${D.name} needs a battery`,
    concept: store ? 'battery_energy_store' : both ? 'battery_and_switch' : 'battery_needed',
    goal: store ? 'Say that a battery is a store of energy for a device.' : both ? `Show that a ${D.name} needs a battery and the switch on.` : `See that a ${D.name} needs a battery to work.`,
    brief: [`The ${D.name} in ${SCENES[sc].where}`, `${name} found a ${D.name} in ${SCENES[sc].where}. ${both ? 'Check it before using it.' : 'It does not work. The battery is missing!'}`, `${cap(SCENES[sc].where)} with a ${D.name} and a battery beside it.`],
    predict: both
      ? ['If the battery is in but the switch is off, will it work?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]]
      : store ? [`Where does the ${D.name} get its energy?`, [opt('battery', 'From the battery'), opt('switch', 'From the switch'), opt('air', 'From the air')]]
        : [`If you put a battery in, will the ${D.name} work?`, [opt('yes', 'Yes', D.pics[0]), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
    lab: [`Test the ${D.name}`, 'Change the battery and the switch. Then press Look.', hidden({ scene: sc, device: dv, battery: true, switchStart: startOn }), `The ${D.name}.`],
    evidence, explain,
    transfer: [{
      heading: `The ${T.name} in ${SCENES[tsc].where}`, text: `This ${T.name} has no battery. Make it work.`, alt: `A ${T.name} with an empty battery space.`,
      layout: hidden({ scene: tsc, device: tdv, battery: true, switchStart: startOn }),
      q: `What did the ${T.name} need?`,
      choices: [ok('battery', both ? 'A battery and the switch on' : 'A battery'), no('buttons', 'More buttons', 'Buttons do not give energy.')],
      hints: ['Look at the battery space.', 'Put the battery in.', both ? 'Battery in, switch on, then Look.' : 'Battery in, then Look.'],
    }],
    idea: store ? 'A battery is a store of energy. A device changes it into light, sound or movement.' : both ? 'A device needs energy from a battery, and the switch must be on.' : 'A device needs a battery to work. The battery gives it energy.',
    lesson: store ? 'Science Lagoon lesson: Energy stores' : 'Science Lagoon lesson: Electricity around us',
  });
}

// ---------- room lighting ----------

const BUILDINGS = [
  ['the family home', ['Kitchen', 'Big bedroom', 'Small bedroom', 'Bathroom', 'Porch', 'Living room']],
  ['the school', ['Science lab', 'Library', 'Staff room', 'Art room', 'Computer room', 'Hall']],
  ['the health centre', ['Waiting room', 'Clinic room 1', 'Clinic room 2', 'Office', 'Store', 'Pharmacy']],
  ['the island library', ['Reading room', 'Children’s corner', 'Study room', 'Office', 'Store', 'Entrance']],
  ['the youth centre', ['Hall', 'Kitchen', 'Games room', 'Office', 'Music room', 'Store']],
  ['the ferry terminal', ['Waiting area', 'Ticket office', 'Café', 'Store', 'Staff room', 'Washrooms']],
  ['the council office', ['Reception', 'Meeting room', 'Office 1', 'Office 2', 'Store room', 'Staff kitchen']],
  ['the fish market', ['Market floor', 'Ice room', 'Office', 'Washroom', 'Store', 'Loading bay']],
  ['the sports hall', ['Court', 'Changing room A', 'Changing room B', 'Office', 'Store', 'Café']],
  ['the island shop', ['Shop floor', 'Storeroom', 'Office', 'Staff room', 'Washroom', 'Back door']],
  ['the guest house', ['Lobby', 'Room 1', 'Room 2', 'Room 3', 'Kitchen', 'Laundry']],
];

function roomList(grade, number, house, k, offset = 0) {
  const b = BUILDINGS[(grade * 3 + number * 2 + house + offset) % BUILDINGS.length];
  const rand = rng('rooms', grade, number, house, offset);
  const names = shuffle(b[1], rand).slice(0, k);
  // At least one empty room with the light on (waste) and, for three or more
  // rooms, one occupied room left dark, so "all off" is never the answer.
  const list = names.map((label, i) => {
    const occupied = i === 0 ? false : i === 1 && k >= 3 ? true : rand() < 0.5;
    const on = i === 0 ? true : i === 1 && k >= 3 ? false : rand() < 0.6;
    return [label.toLowerCase().replace(/[^a-z0-9]+/g, '-'), label, occupied, on];
  });
  return { building: b[0], list: shuffle(list, rand) };
}

const ROOM_SPECS = {
  '1-7': { k: 3, label: 'Lights off at', concept: 'responsible_energy_use', goal: 'Switch off lights in empty rooms.', q: 'Why switch off the light in an empty room?', ok: 'Nobody needs it, so we save energy', idea: 'Switch lights off in empty rooms. Leave them on where people need them.' },
  '2-9': { k: 3, label: 'Saving energy at', concept: 'responsible_energy_use', goal: 'Switch off lights that nobody is using.', q: 'Why turn off lights nobody is using?', ok: 'They use energy but help nobody', idea: 'Save energy by switching off lights nobody is using, while keeping light where people need it.' },
  '3-1': { k: 4, label: 'Energy patrol at', concept: 'responsible_energy_use', goal: 'Find wasted lighting and choose an adult-approved saving action.', q: 'Which saving action is right for the patrol?', ok: 'Switch off lights in empty rooms, and ask an adult before switching off anything else', idea: 'Lights on with nobody there waste energy. Switch those off, and ask an adult about equipment.' },
  '3-7': { k: 5, label: 'A saving plan for', concept: 'responsible_energy_use', goal: 'Make a light plan for a whole building.', q: 'What makes a good saving plan?', ok: 'Lights on only where people are', idea: 'A good energy plan matches light to who needs it.' },
  '5-10': { k: 6, label: 'Energy audit at', concept: 'energy_audit', goal: 'Use an audit to make and justify an energy-saving plan.', q: 'What evidence supports your plan?', ok: 'The audit showed which rooms were empty with lights on', idea: 'A good plan starts with an audit and uses that evidence for each change.' },
  '6-10': { k: 5, label: 'Power plan for', concept: 'capstone_plan', goal: 'Justify a lighting plan for a building that runs on stored solar energy.', q: 'Which justification is strongest?', ok: 'Only needed lights are on, so the limited stored energy lasts for the people using the building', idea: 'With limited stored energy, careful use and good design work together.' },
};

export function roomsMission(grade, number, house) {
  const spec = ROOM_SPECS[`${grade}-${number}`];
  const main = roomList(grade, number, house, spec.k);
  const tr = roomList(grade, number, house, Math.max(3, spec.k - 1), 5);
  const name = nameFor(grade, number, house);
  const pics = grade <= 2;
  return generated({
    grade, number, house, title: `${spec.label} ${main.building}`, concept: spec.concept, goal: spec.goal,
    brief: [`Energy patrol at ${main.building}`, `${name} is on energy patrol at ${main.building}. Some lights are on in empty rooms; some people are in the dark.`, `A plan of ${main.building} with ${spec.k} rooms.`],
    predict: ['Will the best plan switch off every light?', [opt('yes', 'Yes', pics ? 'lamp-off' : undefined), opt('no', 'No', pics ? 'lamp-on' : undefined), opt('unsure', 'Not sure', pics ? 'question' : undefined)]],
    lab: ['Fix the lights', 'Tap a room to switch its light. Then press Check.', rooms({ list: main.list }), `${spec.k} rooms at ${main.building}.`],
    evidence: number === 1 && grade === 3 || grade === 5
      ? [['waste', 'A check that found waste', (t) => t.result.wasted.length > 0], ['fair', 'A fair plan', res('fair', true)]]
      : [['fair', 'A check with no waste and nobody in the dark', res('fair', true)]],
    explain: {
      q: spec.q, aloud: grade === 1,
      choices: [ok('ok', spec.ok, pics ? 'lamp-off' : undefined), no('all', 'Switch every light off', 'People in some rooms need light.', pics ? '🌑' : undefined), no('on', 'Leave every light on to be safe', 'Empty rooms do not need light.', pics ? 'lamp-on' : undefined)],
      ...(grade === 5 ? { evidenceQ: 'Which check found the waste?', evidenceTest: (t) => t.result.wasted.length > 0 } : {}),
      hints: ['Check who is in each room.', 'Empty rooms do not need light; people do.', 'Empty: off. People inside: on.'],
    },
    transfer: [{
      heading: `Evening at ${tr.building}`, text: `Now patrol ${tr.building}.`, alt: `A plan of ${tr.building}.`, layout: rooms({ list: tr.list }),
      q: 'Why is your plan fair?',
      choices: [ok('fair', 'People have light and empty rooms are off'), no('most', 'It switches off the most lights', 'Counting is not enough. People need light.')],
      hints: ['Who is in each room?', 'Match the lights to the people.', 'People: on. Empty: off.'],
    }],
    idea: spec.idea, lesson: 'Science Lagoon lesson: Saving energy',
  });
}
