// Generated "check the items" missions. Each idea has a pool of items with
// reviewed facts; every house draws a different set of items, a different
// focus item, a different character and place, and a different new challenge.

import { catalogue } from '../../layouts.js';
import { ok, no, opt, prop, item } from '../helpers.js';
import { generated, nameFor, placeFor, rng, shuffle, cap } from './common.js';

const I = (label, pic, props) => ({ label, pic, props });

function pickSets(spec, house) {
  const rand = rng('cat', spec.grade, spec.number, house);
  const t = spec.target(house);
  const ids = shuffle(Object.keys(spec.pool), rand);
  const yes = ids.filter((id) => t.test(spec.pool[id].props));
  const forced = spec.include ? spec.include(t) : [];
  const nos = [...forced, ...ids.filter((id) => !t.test(spec.pool[id].props) && !forced.includes(id))];
  const labYes = spec.labYes === 'one' ? 1 : 2;
  const lab = shuffle([...yes.slice(0, labYes), ...nos.slice(0, 4 - labYes)], rand);
  const tYes = yes[labYes % yes.length];
  const tNo = nos.slice(4 - labYes, 6 - labYes);
  const transfer = shuffle([tYes, ...(tNo.length === 2 ? tNo : nos.slice(0, 2))], rand);
  return { t, lab, transfer, tYes, labYesIds: lab.filter((id) => t.test(spec.pool[id].props)) };
}

export function catalogueMission(spec, house) {
  const { t, lab, transfer, tYes, labYesIds } = pickSets(spec, house);
  const P = spec.pool;
  const sub = (ids) => Object.fromEntries(ids.map((id) => [id, P[id]]));
  const pics = spec.grade <= 2;
  const yesId = labYesIds[0];
  const noIds = lab.filter((id) => !labYesIds.includes(id));
  const focus = spec.focusKind === 'no' ? (noIds.find((id) => spec.focusPrefer?.(P[id].props)) || noIds[0]) : yesId;
  const ctx = {
    grade: spec.grade, house, t,
    name: nameFor(spec.grade, spec.number, house), name2: nameFor(spec.grade, spec.number, house, 1),
    place: placeFor(spec.grade, spec.number, house),
    focus: { id: focus, ...P[focus] }, yes: { id: yesId, ...P[yesId] },
    lab: lab.map((id) => ({ id, ...P[id] })),
    tYes: { id: tYes, ...P[tYes] },
  };
  const show = (r, it) => spec.show(r, it, t);
  const ex = spec.explain(ctx);
  const tr = spec.transfer(ctx);
  return generated({
    grade: spec.grade, number: spec.number, house,
    title: spec.title(ctx), concept: spec.concept, goal: spec.goal,
    brief: spec.brief(ctx),
    predict: spec.predict(ctx),
    lab: ['Check each one', `Tap one. Then press Check.`, catalogue({ items: sub(lab), show }), `${lab.length} things to check.`],
    evidence: [
      ['yes', `Check one that ${t.yesWord}`, (x) => x.result.props && t.test(x.result.props)],
      ['no', `Check one that ${t.noWord}`, (x) => x.result.props && !t.test(x.result.props)],
      ['focus', `Check the ${ctx.focus.label.toLowerCase()}`, item(focus)],
    ],
    explain: { ...ex, aloud: spec.grade === 1 },
    transfer: [{
      heading: tr.heading, text: tr.text, alt: tr.alt,
      layout: catalogue({ items: sub(transfer), show }),
      q: tr.q,
      choices: transfer.map((id) => (id === tYes
        ? ok(id, P[id].label, pics ? P[id].pic : undefined)
        : no(id, P[id].label, `Check the ${P[id].label.toLowerCase()} again: it ${t.noWord}.`, pics ? P[id].pic : undefined))),
      hints: tr.hints,
    }],
    idea: spec.idea(ctx), lesson: spec.lesson,
  });
}

// ---------- idea specs ----------

const ELECTRIC = {
  radio: I('Radio', '📻', { electric: true, clue: 'It has a battery inside.' }),
  tv: I('Television', '📺', { electric: true, clue: 'It has a plug.' }),
  torch: I('Torch', '🔦', { electric: true, clue: 'It has a battery inside.' }),
  efan: I('Electric fan', 'efan', { electric: true, clue: 'It has a plug and a switch.' }),
  bell: I('Doorbell', '🔔', { electric: true, clue: 'It is joined to the house electricity.' }),
  computer: I('Computer', '🖥️', { electric: true, clue: 'It has a plug.' }),
  kettle: I('Electric kettle', '🫖', { electric: true, clue: 'It has a plug.' }),
  toycar: I('Toy car', '🚗', { electric: true, clue: 'It has a battery inside.' }),
  watch: I('Wristwatch', '⌚', { electric: true, clue: 'A tiny battery is inside.' }),
  phone: I('Phone', '📱', { electric: true, clue: 'It has a battery inside.' }),
  broom: I('Broom', '🧹', { electric: false, clue: 'Your arms make it work.' }),
  scissors: I('Scissors', '✂️', { electric: false, clue: 'Your hand makes it work.' }),
  handfan: I('Hand fan', '🪭', { electric: false, clue: 'You wave it with your hand.' }),
  kite: I('Kite', '🪁', { electric: false, clue: 'The wind lifts it.' }),
  book: I('Book', '📖', { electric: false, clue: 'You just open it and read.' }),
  bucket: I('Bucket', '🪣', { electric: false, clue: 'You carry it with your hands.' }),
  umbrella: I('Umbrella', '☂️', { electric: false, clue: 'You open it with your hands.' }),
  ball: I('Ball', '⚽', { electric: false, clue: 'You kick it.' }),
  rod: I('Fishing rod', '🎣', { electric: false, clue: 'You cast it with your arms.' }),
  drum: I('Drum', '🥁', { electric: false, clue: 'You hit it with your hands.' }),
};

const g1n1 = {
  grade: 1, number: 1, concept: 'electrical_devices', goal: 'Tell which things need electricity and which do not.',
  lesson: 'Science Lagoon lesson: Electricity around us', pool: ELECTRIC, labYes: 'mixed',
  target: () => ({ test: (p) => p.electric, yesWord: 'needs electricity', noWord: 'works without electricity' }),
  show: (r, it) => `${it.label}: ${r.props.electric ? 'needs electricity' : 'works without electricity'}. ${r.props.clue}`,
  title: (c) => `What needs power at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`${c.name} looks around ${c.place.name}`, `${c.name} sees lots of things at ${c.place.name}. Some need electricity. Some do not.`, `A busy scene at ${c.place.name} with ${c.lab.map((x) => x.label.toLowerCase()).join(', ')}.`],
  predict: (c) => [`Does the ${c.focus.label.toLowerCase()} need electricity?`, [opt('yes', 'Yes', c.focus.pic), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  explain: (c) => ({
    q: `How can you tell the ${c.yes.label.toLowerCase()} needs electricity?`,
    choices: [ok('plug', 'It has a battery or a plug', '🔋'), no('big', 'It is big', 'Size does not matter. Look for a battery or a plug.', '🐘'), no('metal', 'It is made of metal', 'Scissors are metal and need no electricity. Look for a battery or a plug.', '✂️')],
    hints: [`Look at the ${c.yes.label.toLowerCase()} again.`, 'Things that need electricity have a battery or a plug.', `${c.yes.label}: ${c.yes.props.clue}`],
  }),
  transfer: (c) => ({ heading: `${c.name2}’s bag`, text: `${c.name2} packed three things. Check them.`, alt: 'Three things on a mat.', q: 'Which one needs electricity?', hints: ['Check each one.', 'Look for a battery or a plug.', `The ${c.tYes.label.toLowerCase()} needs electricity.`] }),
  idea: () => 'Things that need electricity have a battery or a plug. Many things work without electricity.',
};

const SOURCES = {
  torch: I('Torch', '🔦', { source: 'battery', note: 'It carries its own battery.' }),
  toycar: I('Toy car', '🚗', { source: 'battery', note: 'It carries its own battery.' }),
  clock: I('Alarm clock', '⏰', { source: 'battery', note: 'It carries its own battery.' }),
  watch: I('Wristwatch', '⌚', { source: 'battery', note: 'A tiny battery is inside.' }),
  phone: I('Phone', '📱', { source: 'battery', note: 'It has a rechargeable battery.' }),
  calc: I('Calculator', '🧮', { source: 'battery', note: 'A small battery is inside.' }),
  camera: I('Camera', '📷', { source: 'battery', note: 'It carries its own battery.' }),
  tv: I('Television', '📺', { source: 'wall', note: 'It plugs into the wall. Only grown-ups plug things in.' }),
  computer: I('Desk computer', '🖥️', { source: 'wall', note: 'It plugs into the wall.' }),
  kettle: I('Electric kettle', '🫖', { source: 'wall', note: 'It plugs into the wall.' }),
  cooker: I('Rice cooker', '🍚', { source: 'wall', note: 'It plugs into the wall.' }),
  fridge: I('Fridge', '🧊', { source: 'wall', note: 'It plugs into the wall.' }),
  washer: I('Washing machine', '🧺', { source: 'wall', note: 'It plugs into the wall.' }),
  efan: I('Ceiling fan', 'efan', { source: 'wall', note: 'It is wired to the house.' }),
};
const TRIPS = ['beach picnic', 'boat trip', 'sandbank camp', 'fishing trip', 'island walk', 'jetty picnic', 'reef snorkel trip', 'football match', 'nature walk', 'lagoon swim'];
const g1n4 = {
  grade: 1, number: 4, concept: 'electricity_sources', goal: 'Tell whether a device gets power from a battery or from the wall.',
  lesson: 'Science Lagoon lesson: Electricity around us', pool: SOURCES, labYes: 'mixed',
  target: () => ({ test: (p) => p.source === 'battery', yesWord: 'runs on a battery', noWord: 'needs the wall' }),
  show: (r, it) => `${it.label}: ${r.props.source === 'battery' ? 'gets power from a battery' : 'gets power from the wall'}. ${r.props.note}`,
  title: (c) => `Power for the ${TRIPS[c.house - 1]}`,
  brief: (c) => [`Getting ready for the ${TRIPS[c.house - 1]}`, `${c.name} is going on a ${TRIPS[c.house - 1]}. There are no plugs there. Which things can come?`, `A bag being packed for a ${TRIPS[c.house - 1]}.`],
  predict: (c) => [`Will the ${c.focus.label.toLowerCase()} work on the ${TRIPS[c.house - 1]}?`, [opt('yes', 'Yes', c.focus.pic), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  explain: (c) => ({
    q: `Why can the ${c.yes.label.toLowerCase()} come on the ${TRIPS[c.house - 1]}?`,
    choices: [ok('own', 'It has its own battery', '🔋'), no('small', 'It is small', 'Size does not matter. Where does it get power?', '🤏'), no('none', 'It needs no power', 'It does need power. Where does it come from?', '⚡')],
    hints: [`Check the ${c.yes.label.toLowerCase()}.`, 'Some things carry a battery with them.', `${c.yes.label}: ${c.yes.props.note}`],
  }),
  transfer: (c) => ({ heading: 'No sockets here', text: `${c.name2} is going somewhere with no sockets. Check these.`, alt: 'Three things to take on a trip.', q: 'Which one will work with no sockets?', hints: ['Check each one.', 'Look for a battery.', `The ${c.tYes.label.toLowerCase()} has a battery.`] }),
  idea: () => 'Some things carry a battery. Others need the wall, and only grown-ups plug those in.',
};

const LIGHTS = {
  sun: I('Sun', '☀️', { gives: true }),
  torch: I('Torch (switched on)', '🔦', { gives: true }),
  lamp: I('Lamp (switched on)', 'lamp-on', { gives: true }),
  star: I('Star', '⭐', { gives: true }),
  phone: I('Phone screen (on)', '📱', { gives: true }),
  lighthouse: I('Lighthouse lamp', '🗼', { gives: true }),
  spoon: I('Shiny spoon', '🥄', { gives: false, shiny: true }),
  mirror: I('Mirror', '🪞', { gives: false, shiny: true }),
  foil: I('Kitchen foil', '🥈', { gives: false, shiny: true }),
  book: I('Book', '📖', { gives: false }),
  ball: I('Ball', '⚽', { gives: false }),
  shell: I('Shell', '🐚', { gives: false }),
  teddy: I('Teddy', '🧸', { gives: false }),
  cup: I('Cup', '🥤', { gives: false }),
  glasses: I('Sunglasses', '🕶️', { gives: false, shiny: true }),
};
const g1n6 = {
  grade: 1, number: 6, concept: 'light_sources', goal: 'Tell things that give light from things that do not.',
  lesson: 'Science Lagoon lesson: Light around us', pool: LIGHTS, labYes: 'mixed', focusKind: 'no', focusPrefer: (p) => p.shiny,
  target: () => ({ test: (p) => p.gives, yesWord: 'gives its own light', noWord: 'does not give its own light' }),
  show: (r, it) => `${it.label}: ${r.props.gives ? 'gives its own light' : 'does not give its own light'}.`,
  title: (c) => `Light givers with ${c.name}`,
  brief: (c) => [`${c.name}’s light hunt`, `${c.name} wants to know which things give their own light. Let’s check.`, `A table with ${c.lab.map((x) => x.label.toLowerCase()).join(', ')}.`],
  predict: (c) => [`Does the ${c.focus.label.toLowerCase()} give its own light?`, [opt('yes', 'Yes', c.focus.pic), opt('no', 'No', '🚫'), opt('unsure', 'I am not sure', 'question')]],
  explain: (c) => ({
    q: `The ${c.focus.label.toLowerCase()} can look bright. Does it give its own light?`,
    choices: [ok('no', 'No. It shines only when light falls on it', c.focus.pic), no('yes', 'Yes, bright things make light', 'Check it again. It only looks bright when light falls on it.', '✨')],
    hints: [`Check the ${c.focus.label.toLowerCase()}.`, 'Looking bright is not the same as giving light.', `${cap(c.focus.label)}: no light of its own.`],
  }),
  transfer: (c) => ({ heading: 'Night time', text: `It is dark. ${c.name2} finds three things.`, alt: 'Three things in the dark.', q: 'Which one gives its own light?', hints: ['Check each one.', 'Look for the one that shines by itself.', `The ${c.tYes.label.toLowerCase()} gives light.`] }),
  idea: () => 'Some things give their own light. Shiny things only shine when light falls on them.',
};

const JOBS = { light: 'gives light', cool: 'cools us down', sound: 'makes sound', heat: 'heats food or water' };
const JOB_NEED = { light: 'needs light to read', cool: 'is very hot', sound: 'wants to hear music', heat: 'wants to cook rice' };
const HELPERS = {
  lamp: I('Lamp', 'lamp-on', { job: 'light' }), torch: I('Torch', '🔦', { job: 'light' }), pathlight: I('Path light', '💡', { job: 'light' }),
  efan: I('Electric fan', 'efan', { job: 'cool' }), ac: I('Air conditioner', '❄️', { job: 'cool' }), ceilingfan: I('Ceiling fan', '🌀', { job: 'cool' }),
  radio: I('Radio', '📻', { job: 'sound' }), bell: I('Doorbell', '🔔', { job: 'sound' }), speaker: I('Speaker', '🔊', { job: 'sound' }),
  cooker: I('Rice cooker', '🍚', { job: 'heat' }), kettle: I('Electric kettle', '🫖', { job: 'heat' }), iron: I('Clothes iron', '👕', { job: 'heat' }),
};
const JOB_ORDER = ['light', 'cool', 'sound', 'heat', 'cool', 'sound', 'light', 'heat', 'sound', 'cool'];
const g1n10 = {
  grade: 1, number: 10, concept: 'device_purpose', goal: 'Match an electrical helper to its job.',
  lesson: 'Science Lagoon lesson: Electricity around us', pool: HELPERS, labYes: 'one',
  target: (h) => { const j = JOB_ORDER[h - 1]; return { test: (p) => p.job === j, yesWord: JOBS[j], noWord: `does a different job`, job: j }; },
  show: (r, it) => `${it.label}: its job is that it ${JOBS[r.props.job]}.`,
  title: (c) => `A helper for ${c.name}`,
  brief: (c) => [`${c.name} needs a helper`, `${c.name} ${JOB_NEED[c.t.job]}. Which helper has the right job?`, `${c.name} next to a shelf of electrical helpers.`],
  predict: (c) => [`Which helper fits?`, c.lab.slice(0, 3).map((x) => opt(x.id, x.label, x.pic))],
  explain: (c) => ({
    q: `${c.name} ${JOB_NEED[c.t.job]}. Which helper’s job fits?`,
    choices: c.lab.map((x) => (x.id === c.yes.id ? ok(x.id, x.label, x.pic) : no(x.id, x.label, `The ${x.label.toLowerCase()} ${JOBS[x.props.job]}.`, x.pic))),
    hints: ['Check each helper’s job.', `Which one ${JOBS[c.t.job]}?`, `The ${c.yes.label.toLowerCase()} ${JOBS[c.t.job]}.`],
  }),
  transfer: (c) => ({ heading: 'Another job', text: `${c.name2} also ${JOB_NEED[c.t.job]}. Check these helpers.`, alt: 'Three electrical helpers.', q: 'Which helper fits the job?', hints: ['Check each one.', `Find the one that ${JOBS[c.t.job]}.`, `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Each electrical helper has a job: light, cooling, sound or heat.',
};

const SRC2 = {
  torch: I('Torch (on)', '🔦', { source: true, note: 'It makes its own light.' }), sun: I('Sun', '☀️', { source: true, note: 'It makes its own light.' }),
  lamp: I('Lamp (on)', 'lamp-on', { source: true, note: 'It makes its own light.' }), star: I('Star', '⭐', { source: true, note: 'It makes its own light.' }),
  screen: I('Phone screen (on)', '📱', { source: true, note: 'It makes its own light.' }), lighthouse: I('Lighthouse lamp', '🗼', { source: true, note: 'It makes its own light.' }),
  mirror: I('Mirror', '🪞', { source: false, note: 'It reflects light that falls on it.' }), foil: I('Kitchen foil', '🥈', { source: false, note: 'It is shiny and reflects light.' }),
  moon: I('Moon', '🌙', { source: false, note: 'It reflects light from the Sun.' }), reflector: I('Bicycle reflector', '🚲', { source: false, note: 'It reflects car lights back.' }),
  spoon: I('Shiny spoon', '🥄', { source: false, note: 'It reflects light.' }), paper: I('White paper', '📄', { source: false, note: 'It reflects light but makes none.' }),
  vest: I('Safety vest stripe', '🦺', { source: false, note: 'Its stripe reflects light back.' }),
};
const g2n1 = {
  grade: 2, number: 1, concept: 'light_source_vs_reflector', goal: 'Tell a light source from a thing that reflects light.',
  lesson: 'Science Lagoon lesson: Light and seeing', pool: SRC2, labYes: 'mixed', focusKind: 'no',
  target: () => ({ test: (p) => p.source, yesWord: 'is a light source', noWord: 'only reflects light' }),
  show: (r, it) => `${it.label}: ${r.props.source ? 'a light source' : 'not a light source'}. ${r.props.note}`,
  title: (c) => `Source or reflector at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`Bright things at ${c.place.name}`, `At ${c.place.name}, ${c.name} sees bright things. Do they all make light?`, `Bright things at ${c.place.name}.`],
  predict: (c) => [`Does the ${c.focus.label.toLowerCase()} make its own light?`, [opt('yes', 'Yes'), opt('no', 'No, it reflects light'), opt('unsure', 'Not sure', 'question')]],
  explain: (c) => ({
    q: `Why does the ${c.focus.label.toLowerCase()} look bright?`,
    choices: [ok('reflect', 'It reflects light from a source'), no('makes', 'It makes its own light', 'In the dark it would not shine at all.'), no('clean', 'It is clean and new', 'Clean helps it reflect, but it still needs light falling on it.')],
    hints: [`Check the ${c.focus.label.toLowerCase()}.`, 'A source makes light. A reflector bounces it.', `${c.focus.label}: ${c.focus.props.note}`],
  }),
  transfer: (c) => ({ heading: 'More bright things', text: `${c.name2} finds three more bright things.`, alt: 'Three bright things.', q: 'Which one is a light source?', hints: ['Check each one.', 'Does it make light or bounce it?', `The ${c.tYes.label.toLowerCase()} makes light.`] }),
  idea: () => 'A light source makes its own light. Mirrors, foil and the Moon only reflect light that falls on them.',
};

const TOOLS = {
  efan: I('Electric fan', 'efan', { job: 'cooling', electric: true }), handfan: I('Hand fan', '🪭', { job: 'cooling', electric: false }),
  vacuum: I('Vacuum cleaner', '🔌', { job: 'cleaning', electric: true }), broom: I('Broom', '🧹', { job: 'cleaning', electric: false }),
  radio: I('Radio', '📻', { job: 'music', electric: true }), drum: I('Drum', '🥁', { job: 'music', electric: false }),
  blender: I('Blender', '🥤', { job: 'mixing', electric: true }), spoon: I('Wooden spoon', '🥄', { job: 'mixing', electric: false }),
  dryer: I('Hair dryer', '💨', { job: 'drying hair', electric: true }), towel: I('Towel', '🧣', { job: 'drying hair', electric: false }),
  washer: I('Washing machine', '🧺', { job: 'washing clothes', electric: true }), bucket: I('Bucket and soap', '🪣', { job: 'washing clothes', electric: false }),
  clock: I('Electric clock', '⏰', { job: 'telling time', electric: true }), hourglass: I('Sand timer', '⏳', { job: 'telling time', electric: false }),
};
const TOOL_JOBS = ['cooling', 'cleaning', 'music', 'mixing', 'drying hair', 'washing clothes', 'telling time', 'cleaning', 'music', 'mixing'];
const g2n3 = {
  grade: 2, number: 3, concept: 'device_purpose', goal: 'Choose a tool for a job, and see that not every tool needs electricity.',
  lesson: 'Science Lagoon lesson: Electricity around us', pool: TOOLS, labYes: 'one',
  target: (h) => { const j = TOOL_JOBS[h - 1]; return { test: (p) => p.job === j && !p.electric, yesWord: `does ${j} with no electricity`, noWord: 'is not the no-plug tool for this job', job: j }; },
  include: (t) => Object.keys(TOOLS).filter((id) => TOOLS[id].props.job === t.job && TOOLS[id].props.electric),
  show: (r, it) => `${it.label}: job is ${r.props.job}; ${r.props.electric ? 'needs electricity' : 'needs no electricity'}.`,
  title: (c) => `${cap(c.t.job)} with no plugs at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`No plugs at ${c.place.name}`, `${c.name} needs a tool for ${c.t.job} at ${c.place.name}, where there are no plugs.`, `Tools laid out at ${c.place.name}.`],
  predict: () => ['Does every useful tool need electricity?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
  explain: (c) => ({
    q: `${c.name} needs a tool for ${c.t.job}, with no plugs. Which fits?`,
    choices: c.lab.map((x) => (x.id === c.yes.id ? ok(x.id, x.label) : no(x.id, x.label, x.props.job !== c.t.job ? `The ${x.label.toLowerCase()} is for ${x.props.job}.` : `The ${x.label.toLowerCase()} needs electricity, and there are no plugs.`))),
    hints: ['Find the tools for this job.', 'Which one needs no electricity?', `The ${c.yes.label.toLowerCase()}.`],
  }),
  transfer: (c) => ({ heading: 'Another place, no plugs', text: `${c.name2} also needs a tool for ${c.t.job}, far from any plug.`, alt: 'Three tools.', q: 'Which tool fits with no plugs?', hints: ['Check each one.', 'Same job, no electricity.', `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Choose a tool by its job. Many tools do their job without electricity.',
};

const NIGHT = {
  sun: I('Sun', '☀️', { night: false, note: 'At night the Sun is not in our sky.' }), torch: I('Torch', '🔦', { night: true, note: 'You can switch it on any time.' }),
  path: I('Path light', 'lamp-on', { night: true, note: 'It is switched on after dark.' }), window: I('Window', '🪟', { night: false, note: 'It only lets light in.' }),
  moon: I('Moon', '🌙', { night: false, note: 'It reflects sunlight, and some nights it is not in the sky.' }), phone: I('Phone screen', '📱', { night: true, note: 'It gives its own light.' }),
  street: I('Street light', '💡', { night: true, note: 'It is switched on after dark.' }), lighthouse: I('Lighthouse', '🗼', { night: true, note: 'It shines all night.' }),
  mirror: I('Mirror', '🪞', { night: false, note: 'It only reflects light.' }), glasses: I('Sunglasses', '🕶️', { night: false, note: 'They block light; they make none.' }),
  sky: I('Blue sky', '🌤️', { night: false, note: 'The blue sky is lit by the Sun.' }),
};
const g2n7 = {
  grade: 2, number: 7, concept: 'sources_at_night', goal: 'Pick light sources that work after dark.',
  lesson: 'Science Lagoon lesson: Light and seeing', pool: NIGHT, labYes: 'mixed',
  target: () => ({ test: (p) => p.night, yesWord: 'can light the way at night', noWord: 'cannot light the way at night' }),
  show: (r, it) => `${it.label}: ${r.props.night ? 'can light the way at night' : 'cannot light the way at night'}. ${r.props.note}`,
  title: (c) => `After sunset at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`Night at ${c.place.name}`, `${c.name} is at ${c.place.name} after sunset. What can light the way?`, `${c.place.short} at dusk.`],
  predict: () => ['Can the Sun light our way at night?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
  explain: () => ({
    q: 'Why do we need lights we can switch on at night?',
    choices: [ok('sun', 'At night the Sun is not in our sky, so we need another light source'), no('off', 'The Sun gets switched off', 'Nobody switches the Sun off. Our side of Earth turns away from it.'), no('dark', 'Darkness blocks the Sun', 'Darkness is just no light. It does not block anything.')],
    hints: ['Think about where the Sun is at night.', 'It is on the other side of Earth.', 'No Sun in our sky, so we use lights we can switch on.'],
  }),
  transfer: (c) => ({ heading: 'Walking home', text: `${c.name2} is walking home after dark.`, alt: 'A path at night.', q: 'Which one can light the way?', hints: ['Check each one.', 'Which works every night?', `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'At night the Sun is not in our sky, so we use light sources we can switch on.',
};

const CHANGE = {
  lamp: I('Lamp', 'lamp-on', { into: 'light, and some heating', main: 'light' }), torch: I('Torch', '🔦', { into: 'light', main: 'light' }),
  tv: I('Television', '📺', { into: 'light and sound', main: 'light' }),
  efan: I('Electric fan', 'efan', { into: 'movement, and some sound', main: 'movement' }), toycar: I('Toy car', '🚗', { into: 'movement', main: 'movement' }),
  blender: I('Blender', '🥤', { into: 'movement and sound', main: 'movement' }),
  radio: I('Radio', '📻', { into: 'sound', main: 'sound' }), bell: I('Doorbell', '🔔', { into: 'sound', main: 'sound' }), speaker: I('Speaker', '🔊', { into: 'sound', main: 'sound' }),
  cooker: I('Rice cooker', '🍚', { into: 'heating', main: 'heating' }), kettle: I('Electric kettle', '🫖', { into: 'heating', main: 'heating' }), iron: I('Clothes iron', '👕', { into: 'heating', main: 'heating' }),
};
const OUT_ORDER = ['sound', 'movement', 'heating', 'light', 'movement', 'sound', 'heating', 'light', 'sound', 'heating'];
const g3n8 = {
  grade: 3, number: 8, concept: 'energy_changes', goal: 'Name what an electrical device changes energy into.',
  lesson: 'Science Lagoon lesson: Energy changes', pool: CHANGE, labYes: 'one',
  target: (h) => { const o = OUT_ORDER[h - 1]; return { test: (p) => p.main === o, yesWord: `changes energy mainly into ${o}`, noWord: `changes energy mainly into something else`, out: o }; },
  show: (r, it) => `${it.label}: changes electrical energy into ${r.props.into}.`,
  title: (c) => `Energy into ${c.t.out} at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`What comes out?`, `${c.name} is checking devices at ${c.place.name}. Electrical energy goes in. What comes out?`, 'A shelf of devices.'],
  predict: (c) => [`Which one do you think changes energy into ${c.t.out}?`, c.lab.slice(0, 3).map((x) => opt(x.id, x.label))],
  explain: (c) => ({
    q: `Which device changes electrical energy mainly into ${c.t.out}?`,
    choices: c.lab.map((x) => (x.id === c.yes.id ? ok(x.id, x.label) : no(x.id, x.label, `The ${x.label.toLowerCase()} changes it into ${x.props.into}.`))),
    hints: ['Check each device.', `Look for ${c.t.out}.`, `The ${c.yes.label.toLowerCase()}.`],
  }),
  transfer: (c) => ({ heading: 'More devices', text: `${c.name2} brings three more devices.`, alt: 'Three devices.', q: `Which one changes energy mainly into ${c.t.out}?`, hints: ['Check each one.', `Look for ${c.t.out}.`, `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Electrical devices change electrical energy into light, sound, movement or heating.',
};

const MOVERS = {
  sail: I('Sailing dhoni', '⛵', { electric: false, energy: 'the wind' }), bike: I('Bicycle', '🚲', { electric: false, energy: 'your muscles' }),
  kite: I('Kite', '🪁', { electric: false, energy: 'the wind' }), handfan: I('Hand fan', '🪭', { electric: false, energy: 'your arm' }),
  rowboat: I('Rowing boat', '🛶', { electric: false, energy: 'your arms' }), windmill: I('Toy windmill', '🎐', { electric: false, energy: 'the wind' }),
  skate: I('Skateboard', '🛹', { electric: false, energy: 'your legs' }),
  solarlamp: I('Solar path light', 'lamp-on', { electric: true, energy: 'sunlight changed into electricity' }), ferry: I('Electric ferry', '🛳️', { electric: true, energy: 'its big battery' }),
  torch: I('Torch', '🔦', { electric: true, energy: 'its battery' }), scooter: I('Electric scooter', '🛴', { electric: true, energy: 'its battery' }),
  fan: I('Electric fan', 'efan', { electric: true, energy: 'electricity from the wall' }),
};
const g3n9 = {
  grade: 3, number: 9, concept: 'energy_sources', goal: 'Find where things get their energy, electric or not.',
  lesson: 'Science Lagoon lesson: Energy changes', pool: MOVERS, labYes: 'mixed', focusKind: 'no',
  target: () => ({ test: (p) => p.electric, yesWord: 'uses electricity', noWord: 'works without electricity' }),
  show: (r, it) => `${it.label}: ${r.props.electric ? 'uses electricity' : 'no electricity'}. Energy comes from ${r.props.energy}.`,
  title: (c) => `Energy hunt at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`Energy hunt at ${c.place.name}`, `Things at ${c.place.name} get energy in different ways. Find out how.`, `${c.place.short} with boats, bikes and lights.`],
  predict: (c) => [`Does the ${c.focus.label.toLowerCase()} need electricity?`, [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure')]],
  explain: (c) => ({
    q: `Where does the ${c.focus.label.toLowerCase()} get its energy?`,
    choices: [ok('src', cap(c.focus.props.energy)), no('elec', 'Electricity from a battery', 'Check it again. It has no battery.'), no('sun', 'Sunlight on a panel', 'It has no solar panel.')],
    hints: [`Check the ${c.focus.label.toLowerCase()}.`, 'Not everything uses electricity.', `${cap(c.focus.props.energy)}.`],
  }),
  transfer: (c) => ({ heading: 'More things to check', text: `${c.name2} finds three more things.`, alt: 'Three things.', q: 'Which one uses electricity?', hints: ['Check each one.', 'Look for a battery or a panel.', `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Energy comes from many places: wind, muscles, sunlight and batteries.',
};

const HAZ = {
  frayed: I('Cable with a torn cover', '🔌', { hazard: true, action: 'Keep away and tell an adult.' }),
  water: I('Water near a socket', '💧', { hazard: true, action: 'Ask an adult to move it.' }),
  adapter: I('Adapter with too many plugs', '🧩', { hazard: true, action: 'Tell an adult. Too many plugs can overheat.' }),
  doorway: I('Cable across the doorway', '〰️', { hazard: true, action: 'Tell an adult. Someone could trip.' }),
  dryer: I('Hair dryer by the sink', '💨', { hazard: true, action: 'Tell an adult. Water and electricity are dangerous together.' }),
  hot: I('Charger that feels very hot', '🔥', { hazard: true, action: 'Do not touch. Tell an adult.' }),
  cracked: I('Cracked socket cover', '⚠️', { hazard: true, action: 'Keep away and tell an adult.' }),
  shelf: I('Tidy bookshelf', '📚', { hazard: false, action: 'No hazard here.' }),
  lampok: I('Lamp on a desk', 'lamp-on', { hazard: false, action: 'No hazard here.' }),
  plant: I('Pot plant', '🪴', { hazard: false, action: 'No hazard here.' }),
  chair: I('Chair', '🪑', { hazard: false, action: 'No hazard here.' }),
  rug: I('Flat rug', '🟫', { hazard: false, action: 'No hazard here.' }),
};
const g3n10 = {
  grade: 3, number: 10, concept: 'electrical_hazard', goal: 'Spot electrical hazards and say who to tell.',
  lesson: 'Science Lagoon lesson: Staying safe with electricity', pool: HAZ, labYes: 'mixed',
  target: () => ({ test: (p) => p.hazard, yesWord: 'is a hazard', noWord: 'is safe' }),
  show: (r, it) => `${it.label}: ${r.props.hazard ? 'hazard' : 'safe'}. ${r.props.action}`,
  title: (c) => `Safety audit: ${c.place.short.toLowerCase()}`,
  brief: (c) => [`Audit ${c.place.name}`, `Walk round ${c.place.name} with ${c.name}. Look for hazards. Do not touch anything.`, `Inside ${c.place.name}.`],
  predict: () => ['What should you do when you find a hazard?', [opt('tell', 'Keep away and tell an adult'), opt('fix', 'Fix it yourself'), opt('ignore', 'Leave it')]],
  explain: () => ({
    q: 'What do you do when you find a hazard?',
    choices: [ok('tell', 'Keep away and tell an adult'), no('fix', 'Fix it myself carefully', 'Only trained adults fix electrical things.'), no('unplug', 'Pull out the plug', 'Do not touch. Tell an adult.')],
    hints: ['Look at the action for each hazard.', 'Children do not touch hazards.', 'Keep away and tell an adult.'],
  }),
  transfer: (c) => ({ heading: 'Another room', text: `${c.name2} checks another room. Do not touch anything.`, alt: 'Another room with three things.', q: 'Which one is a hazard to report?', hints: ['Check each one.', 'Look for damage, water or heat.', `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Spot hazards with your eyes, not your hands. Keep away and tell an adult.',
};

// Energy systems: store, path, output. Each house looks at a different system.
const SYSTEMS = [
  { store: 'Battery', storePic: '🔋', out: 'Lamp', outPic: 'lamp-on', gives: 'gives out light and heats its surroundings' },
  { store: 'Battery', storePic: '🔋', out: 'Fan motor', outPic: 'efan', gives: 'moves air, with some sound and heating' },
  { store: 'Battery', storePic: '🔋', out: 'Buzzer', outPic: '🔔', gives: 'makes sound, with a little heating' },
  { store: 'Rechargeable battery', storePic: '🔋', out: 'Radio', outPic: '📻', gives: 'makes sound, with some heating' },
  { store: 'Battery', storePic: '🔋', out: 'Toy car motor', outPic: '🚗', gives: 'makes the car move, with some sound and heating' },
  { store: 'Battery pack', storePic: '🔋', out: 'Torch bulb', outPic: '🔦', gives: 'gives out light and some heating' },
  { store: 'Phone battery', storePic: '📱', out: 'Phone screen', outPic: '📱', gives: 'gives out light, with some heating' },
  { store: 'Battery', storePic: '🔋', out: 'Electric toothbrush motor', outPic: '🪥', gives: 'makes the brush move, with some sound' },
  { store: 'Battery', storePic: '🔋', out: 'Clock motor', outPic: '⏰', gives: 'moves the hands, with a little sound' },
  { store: 'Battery', storePic: '🔋', out: 'Doorbell speaker', outPic: '🔔', gives: 'makes sound, with a little heating' },
];
function systemPool(s) {
  return {
    store: I(s.store, s.storePic, { role: 'store', text: 'A chemical energy store. It does not contain light and does not make energy from nothing.' }),
    wires: I('Wires', '〰️', { role: 'path', text: 'The conducting path. The current transfers energy from the store to the device.' }),
    out: I(s.out, s.outPic, { role: 'output', text: `Transfers energy to the surroundings: it ${s.gives}.` }),
    switch: I('Switch', '🔘', { role: 'control', text: 'Opens or closes the path. It stores no energy.' }),
  };
}
export function systemMission(house) {
  const s = SYSTEMS[(house - 1) % SYSTEMS.length];
  const t = SYSTEMS[house % SYSTEMS.length];
  const name = nameFor(5, 1, house);
  const show = (r, it) => `${it.label}: ${r.props.text}`;
  const tp = { ...systemPool(t) };
  return generated({
    grade: 5, number: 1, house, title: `Track the energy: ${s.out.toLowerCase()}`, concept: 'energy_transfer',
    goal: 'Describe how energy is transferred from a store to a device and its surroundings.',
    brief: [`Follow the energy in the ${s.out.toLowerCase()}`, `${name} switches on a ${s.out.toLowerCase()} powered by a ${s.store.toLowerCase()}. Where does the energy go?`, `A ${s.store.toLowerCase()}, wires, a switch and a ${s.out.toLowerCase()}.`],
    predict: [`When the ${s.out.toLowerCase()} is on, where does the energy end up?`, [opt('one', 'Only in one useful form'), opt('spread', 'In useful and other forms'), opt('gone', 'It is destroyed')]],
    lab: ['Check each part', 'Tap a part. Then press Check.', catalogue({ items: systemPool(s), show }), 'The parts of the system.'],
    evidence: [['store', 'Check the store', item('store')], ['out', 'Check where energy leaves', item('out')]],
    explain: {
      q: 'Which is the best description?',
      choices: [ok('transfer', `Energy stored in the ${s.store.toLowerCase()} is transferred by the circuit to the ${s.out.toLowerCase()}, which ${s.gives}`),
        no('usedup', 'The battery is full of electricity that gets used up', 'Current flows all the way round and is not used up. It is the stored energy that is transferred.'),
        no('make', `The ${s.out.toLowerCase()} makes energy`, 'Energy is not made. The device transfers energy it receives.')],
      hints: ['Check the store and the output.', 'Store → path → output.', 'Stored energy is transferred, then spread to the surroundings.'],
    },
    transfer: [{
      heading: `The ${t.out.toLowerCase()}`, text: `Now look at a ${t.out.toLowerCase()} system.`, alt: `A ${t.store.toLowerCase()} and a ${t.out.toLowerCase()}.`,
      layout: catalogue({ items: tp, show }),
      q: 'Which part stores the energy?',
      choices: [ok('store', t.store), no('wires', 'Wires', 'Wires carry the current; they do not store energy.'), no('switch', 'Switch', 'A switch opens and closes the path; it stores nothing.')],
      hints: ['Check each part.', 'Look for the energy store.', `The ${t.store.toLowerCase()}.`],
    }],
    idea: `Energy stored in the ${s.store.toLowerCase()} is transferred to the ${s.out.toLowerCase()} and then to the surroundings. It is not created or destroyed.`,
    lesson: 'Science Lagoon lesson: Energy transfers',
  });
}

const OUTPUTS = {
  cooker: I('Rice cooker', '🍚', { useful: 'heating the rice', other: 'some heating of the kitchen', mainType: 'heating' }),
  blender: I('Blender', '🥤', { useful: 'movement of the blades', other: 'sound and some heating', mainType: 'movement' }),
  kettle: I('Electric kettle', '🫖', { useful: 'heating the water', other: 'some heating of the air and some sound', mainType: 'heating' }),
  fridgelight: I('Fridge light', 'lamp-on', { useful: 'light', other: 'some heating', mainType: 'light' }),
  dryer: I('Hair dryer', '💨', { useful: 'heating and moving air', other: 'sound', mainType: 'heating' }),
  radio: I('Radio', '📻', { useful: 'sound', other: 'some heating', mainType: 'sound' }),
  lamp: I('Desk lamp', 'lamp-on', { useful: 'light', other: 'some heating', mainType: 'light' }),
  fan: I('Electric fan', 'efan', { useful: 'moving air', other: 'sound and some heating', mainType: 'movement' }),
  toaster: I('Toaster', '🍞', { useful: 'heating the bread', other: 'some heating of the air', mainType: 'heating' }),
  tv: I('Television', '📺', { useful: 'light and sound', other: 'some heating', mainType: 'light' }),
  drill: I('Electric drill', '🔧', { useful: 'turning the drill bit', other: 'sound and heating', mainType: 'movement' }),
};
const USEFUL_ORDER = ['heating', 'movement', 'light', 'sound', 'heating', 'movement', 'light', 'heating', 'movement', 'light'];
const g5n5 = {
  grade: 5, number: 5, concept: 'useful_and_other_outputs', goal: 'Name the useful output of a device and the other ways energy is transferred.',
  lesson: 'Science Lagoon lesson: Energy transfers', pool: OUTPUTS, labYes: 'one',
  target: (h) => { const o = USEFUL_ORDER[h - 1]; return { test: (p) => p.mainType === o, yesWord: `has ${o} as its useful output`, noWord: 'has a different useful output', out: o }; },
  show: (r, it) => `${it.label}: useful output is ${r.props.useful}; also ${r.props.other}.`,
  title: (c) => `Useful ${c.t.out} at ${c.place.short.toLowerCase()}`,
  brief: (c) => [`Survey at ${c.place.name}`, `${c.name} is surveying devices at ${c.place.name}. Some energy is useful, some is not.`, `Devices at ${c.place.name}.`],
  predict: (c) => [`Does the ${c.yes.label.toLowerCase()} transfer all its energy usefully?`, [opt('yes', 'Yes'), opt('no', 'No')], [opt('noise', 'Devices make noise or get warm'), opt('all', 'Machines are perfect'), opt('guess', 'Just a guess')]],
  explain: (c) => ({
    q: `Where does the ${c.yes.label.toLowerCase()}’s energy go?`,
    choices: [ok('mixed', `Mostly into ${c.yes.props.useful}, with ${c.yes.props.other}`), no('all', `All into ${c.yes.props.useful}`, 'Some energy always spreads out as sound or heating.'), no('lost', 'Some is destroyed', 'Energy is not destroyed. It spreads into the surroundings.')],
    hints: [`Check the ${c.yes.label.toLowerCase()}.`, 'Useful output plus other outputs.', `${cap(c.yes.props.useful)} + ${c.yes.props.other}.`],
  }),
  transfer: (c) => ({ heading: 'Another survey', text: `${c.name2} checks three more devices.`, alt: 'Three devices.', q: `Which device has ${c.t.out} as its useful output?`, hints: ['Check each one.', 'What job is each device for?', `The ${c.tYes.label.toLowerCase()}.`] }),
  idea: () => 'Devices transfer energy usefully and in other ways, often sound and heating. Energy is not destroyed.',
};

// Pairs of devices doing the same job; one sends more energy to the job.
const PAIRS = [
  ['Old filament bulb', '💡', 'some light', 'a lot of heating', 'LED lamp', 'lamp-on', 'more light', 'a little heating', 'light'],
  ['Halogen spotlight', '🔦', 'some light', 'a lot of heating', 'LED spotlight', 'lamp-on', 'more light', 'a little heating', 'light'],
  ['Old fan with worn bearings', 'efan', 'some air movement', 'a lot of noise and heating', 'New fan', 'efan', 'more air movement', 'less noise and heating', 'movement'],
  ['Old fridge with a broken seal', '🧊', 'some cooling', 'a lot of extra running and heating', 'Fridge with a good seal', '🧊', 'cooling with less running', 'less heating', 'cooling'],
];
export function wasteMission(house) {
  const p = PAIRS[(house - 1) % PAIRS.length];
  const q = PAIRS[house % PAIRS.length];
  const place = placeFor(5, 9, house);
  const name = nameFor(5, 9, house);
  const items = (x) => ({
    a: I(x[0], x[1], { good: false, text: `${x[2]}, ${x[3]}` }),
    b: I(x[4], x[5], { good: true, text: `${x[6]}, ${x[7]}` }),
  });
  const show = (r, it) => `${it.label}: ${r.props.text}. (Simplified model; no measured values.)`;
  const job = p[8];
  return generated({
    grade: 5, number: 9, house, title: `Useful or wasted at ${place.short.toLowerCase()}`, concept: 'efficiency_qualitative',
    goal: 'Compare devices by how much of their energy goes where we want it.',
    brief: [`Choosing for ${place.name}`, `${name} must choose between a ${p[0].toLowerCase()} and a ${p[4].toLowerCase()} for ${place.name}.`, `Two devices side by side at ${place.name}.`],
    predict: [`Which one sends more of its energy to ${job}?`, [opt('a', p[0]), opt('b', p[4]), opt('same', 'The same')]],
    lab: ['Compare them', 'Tap a device. Then press Check.', catalogue({ items: items(p), show }), 'Two devices.'],
    evidence: [['a', `Check the ${p[0].toLowerCase()}`, item('a')], ['b', `Check the ${p[4].toLowerCase()}`, item('b')]],
    explain: {
      q: `Why choose the ${p[4].toLowerCase()}?`,
      choices: [ok('useful', `More of its energy goes to ${job} and less is wasted`), no('exact', 'It always uses exactly half the energy', 'The model has no numbers. Do not claim an exact amount.'), no('free', 'It needs no energy', 'It still needs energy; it wastes less.')],
      hints: ['Compare the wasted part for each.', 'Which wastes less?', `The ${p[4].toLowerCase()} wastes less.`],
    },
    transfer: [{
      heading: 'A second choice', text: `${name} also compares a ${q[0].toLowerCase()} and a ${q[4].toLowerCase()}.`, alt: 'Two more devices.',
      layout: catalogue({ items: items(q), show }),
      q: 'Which one wastes less energy?',
      choices: [ok('b', q[4]), no('a', q[0], `Check it again: ${q[3]}.`)],
      hints: ['Check both.', 'Look at the wasted part.', `The ${q[4].toLowerCase()}.`],
    }],
    idea: 'Choose devices that send more of their energy to the job and waste less.',
    lesson: 'Science Lagoon lesson: Energy transfers',
  });
}

export const CATALOGUE_SPECS = [g1n1, g1n4, g1n6, g1n10, g2n1, g2n3, g2n7, g3n8, g3n9, g3n10, g5n5];
