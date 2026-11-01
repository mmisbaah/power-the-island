// Generated light and solar missions. Light missions change the object,
// the dark space and the follow-up challenge; solar missions change the
// place, the starting conditions and the follow-up challenge.

import { light, solar } from '../../layouts.js';
import { ok, no, opt, val, res, and, onlyChanged } from '../helpers.js';
import { generated, nameFor, placeFor, cap } from './common.js';

const OBJECTS = ['book', 'shell', 'cup', 'ball', 'toy'];
const SPACES = ['a dark den', 'a tent at night', 'a dark cupboard', 'a box theatre', 'a storeroom with no window', 'a cave model', 'a blanket fort', 'a dark stage', 'a shed at night', 'a hide-and-seek corner'];

function lightCommon(number, house) {
  const name = nameFor(2, number, house);
  const space = SPACES[(number + house) % SPACES.length];
  const obj = OBJECTS[(number * 2 + house) % OBJECTS.length];
  const tobj = OBJECTS[(number * 2 + house + 2) % OBJECTS.length];
  return { name, space, obj, tobj };
}

export function lightMission(number, house) {
  const { name, space, obj, tobj } = lightCommon(number, house);
  const base = { grade: 2, number, house, lesson: 'Science Lagoon lesson: Light and seeing' };
  if (number === 2) {
    return generated({
      ...base, title: `Seeing the ${obj} in ${space}`, concept: 'light_path_to_eye',
      goal: 'Show that we see an object when light from a source bounces off it into our eyes.',
      brief: [cap(space), `${name} is in ${space} with a ${obj}. It is too dark to see it. There is a torch.`, `${cap(space)} with a ${obj}, a torch and an eye.`],
      predict: [`With the torch off, can ${name} see the ${obj}?`, [opt('yes', 'Yes', '👀'), opt('no', 'No', '🙈'), opt('unsure', 'Not sure', 'question')], [opt('dark', 'It is too dark'), opt('eyes', 'Eyes can see in the dark'), opt('bright', `The ${obj} is bright`)]],
      lab: ['Torch on, torch off', 'Switch the torch. Then press Test.', light({ controls: ['torch'], object: obj }), `A torch, a ${obj} and an eye.`],
      evidence: [['off', `Torch off: ${obj} not seen`, and(val('torch', 'off'), res('seen', false))], ['on', `Torch on: ${obj} seen`, and(val('torch', 'on'), res('seen', true))]],
      explain: { q: `Why could ${name} see the ${obj} with the torch on?`, choices: [ok('path', `Light went from the torch to the ${obj}, then into the eyes`), no('eyes', 'Eyes send out light', 'With the torch off, nothing was seen, so eyes do not make the light.'), no('glow', `The ${obj} glows`, `The ${obj} was dark when the torch was off.`)], hints: ['Compare torch off and on.', 'Light travels from a source.', `Torch → ${obj} → eye.`] },
      transfer: [{ heading: 'Curtains instead', text: `Now the torch is flat. ${cap(space)} has curtains you can open.`, alt: `A ${tobj} by a curtained window.`, layout: light({ controls: ['room'], initial: { torch: 'off' }, object: tobj }), q: `How did you see the ${tobj}?`, choices: [ok('sun', `Sunlight reached the ${tobj}, then my eyes`), no('used', 'My eyes got used to it', 'With the curtains shut, nothing was seen.')], hints: ['What else gives light?', 'The Sun.', 'Open the curtains, then Test.'] }],
      idea: 'We see things when light from a source bounces off them and reaches our eyes.',
    });
  }
  if (number === 4) {
    return generated({
      ...base, title: `Shadow of the ${obj} in ${space}`, concept: 'shadows', goal: 'Show that an object that blocks light makes a shadow.',
      brief: [`Shadows in ${space}`, `${name} is making shadows in ${space}. There is cardboard and clear glass.`, `A torch, a ${obj}, cardboard and glass.`],
      predict: ['Will clear glass make a dark shadow?', [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')], [opt('see', 'You can see through glass'), opt('solid', 'Glass is solid'), opt('guess', 'Just a guess')]],
      lab: ['Make a shadow', 'Choose what goes in the middle. Then press Test.', light({ controls: ['blocker'], initial: { torch: 'on' }, object: obj }), `A torch, a gap and a ${obj}.`],
      evidence: [['card', 'Cardboard: shadow', and(val('blocker', 'card'), res('shadow', true))], ['glass', 'Glass: no dark shadow', and(val('blocker', 'glass'), res('shadow', false))]],
      explain: { q: 'Why did cardboard make a shadow but glass did not?', choices: [ok('block', 'Cardboard blocks light. Clear glass lets light through.'), no('size', 'The glass is smaller', 'They are the same size here.'), no('stuff', 'Shadows are dark stuff from the cardboard', 'A shadow is a place light cannot reach.')], hints: ['Look where the light went.', 'Some things let light through.', 'Card: blocked. Glass: through.'] },
      transfer: [{ heading: `Hide the ${tobj}`, text: `Make the ${tobj} disappear in the dark.`, alt: `A torch shining on a ${tobj}.`, layout: light({ controls: ['blocker'], initial: { torch: 'on', blocker: 'glass' }, object: tobj, goal: (r) => r.sourceOn && !r.reaches }), q: `Why can’t you see the ${tobj} now?`, choices: [ok('card', `The cardboard stops light reaching the ${tobj}`), no('torch', 'The torch went off', 'The torch is still on.')], hints: ['Put something in the way.', 'Which one blocks light?', 'Cardboard, then Test.'] }],
      idea: 'A shadow forms where something blocks light. Clear glass lets light through.',
    });
  }
  if (number === 5) {
    const tr = [
      { controls: ['blocker'], initial: { torch: 'on', blocker: 'card' }, text: 'The torch is on, but cardboard is in the way.' },
      { controls: ['holes'], initial: { torch: 'on', holes: 'not' }, text: 'The torch is on, but two cards with holes are out of line.' },
      { controls: ['room'], initial: { torch: 'off' }, text: 'The torch is flat, but there are curtains.' },
    ][house % 3];
    return generated({
      ...base, title: `The mirror in ${space}`, concept: 'reflector_needs_light', goal: 'Show that a mirror can only be seen when light reaches it.',
      brief: [`The mirror in ${space}`, `${name} says, “Mirrors shine, so I will see it in ${space}.”`, `${cap(space)} with a mirror and a torch.`],
      predict: ['With the torch off, will the mirror be seen?', [opt('yes', 'Yes, it shines'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')]],
      lab: ['Test the mirror', 'Switch the torch. Then press Test.', light({ controls: ['torch'], object: 'mirror' }), 'A torch, a mirror and an eye.'],
      evidence: [['off', 'Torch off: mirror not seen', and(val('torch', 'off'), res('seen', false))], ['on', 'Torch on: mirror seen', and(val('torch', 'on'), res('seen', true))]],
      explain: { q: 'What does the mirror need so it can be seen?', choices: [ok('light', 'Light from a source falling on it'), no('self', 'Nothing; mirrors shine by themselves', 'With the torch off, it was not seen.'), no('clean', 'A clean cloth', 'Without light it stays dark.')], hints: ['Compare torch off and on.', 'A mirror is not a source.', 'No light in, no light out.'] },
      transfer: [{ heading: 'Let the light reach', text: tr.text, alt: 'A mirror and a light source.', layout: light({ ...tr, object: 'mirror' }), q: 'What did you change?', choices: [ok('path', 'I let light reach the mirror'), no('shine', 'I made the mirror shine by itself', 'Mirrors make no light.')], hints: ['What stops the light?', 'Clear the way for light.', 'Then Test.'] }],
      idea: 'Shiny things are not light sources. We see them only when light reaches them.',
    });
  }
  return generated({
    ...base, title: `Straight light to the ${obj} in ${space}`, concept: 'light_straight_lines', goal: 'Show that light travels in straight lines.',
    brief: [`Cards in ${space}`, `${name} sets up two cards with holes between a torch and a ${obj}.`, `A torch, two cards with holes and a ${obj}.`],
    predict: [`If the holes are not in line, will light reach the ${obj}?`, [opt('yes', 'Yes'), opt('no', 'No'), opt('unsure', 'Not sure', 'question')], [opt('bend', 'Light bends'), opt('straight', 'Light goes straight'), opt('guess', 'Just a guess')]],
    lab: ['Line up the holes', 'Move the cards. Then press Test.', light({ controls: ['holes'], initial: { torch: 'on', holes: 'not' }, object: obj }), `A torch, cards and a ${obj}.`],
    evidence: [['not', 'Out of line: not seen', and(val('holes', 'not'), res('seen', false))], ['lined', 'In line: seen', and(val('holes', 'lined'), res('seen', true))]],
    explain: { q: 'Why must the holes line up?', choices: [ok('straight', 'Light travels in straight lines'), no('bend', 'Light bends round corners', 'Then it would have got through out of line.'), no('thick', 'The cards are too thick', 'Only the holes moved.')], hints: ['Compare your tests.', 'Only the holes changed.', 'In line: through. Out of line: blocked.'] },
    transfer: [{ heading: `Two problems for the ${tobj}`, text: 'Now the holes are out of line and something else may be in the way.', alt: `Cards, a blocker and a ${tobj}.`, layout: light({ controls: ['holes', 'blocker'], initial: { torch: 'on', holes: 'not', blocker: house % 2 ? 'card' : 'glass' }, object: tobj }), q: `What did the light need to reach the ${tobj}?`, choices: [ok('line', 'A straight, clear path'), no('bright', 'A brighter torch', 'The torch did not change.')], hints: ['Line up the holes.', 'Check what is in the middle.', 'Straight and clear.'] }],
    idea: 'Light travels in straight lines. It cannot bend round a card.',
  });
}

// ---------- solar ----------

const LAMP = { on: 'all evening', short: 'a short time', off: 'not at all' };

export function solarMission(grade, number, house) {
  const place = placeFor(grade, number, house);
  const tplace = placeFor(grade, number, house, 1);
  const name = nameFor(grade, number, house);
  const at = place.name;
  const base = { grade, number, house, lesson: 'Science Lagoon lesson: Energy from the Sun' };
  const flip = house % 2 === 0;
  const key = `${grade}-${number}`;
  switch (key) {
    case '3-2': return generated({
      ...base, title: `Sunlight to electricity at ${place.short.toLowerCase()}`, concept: 'solar_needs_light', goal: 'Show that a solar panel needs suitable light to make electricity.',
      brief: [`The panel at ${at}`, `The light at ${at} runs straight from a solar panel. ${flip ? 'Today the panel is under a tree.' : 'A tree might shade it.'}`, `A solar panel and lamp at ${at}.`],
      predict: ['Will the panel make more electricity in shade or full sun?', [opt('sun', 'Full sun'), opt('shade', 'Shade'), opt('same', 'The same')]],
      lab: ['Move the panel', 'Choose where it goes. Then press Test.', solar({ controls: ['site'], initial: { site: flip ? 'shaded' : 'sunny' }, scene: place.id }), `The panel at ${at}.`],
      evidence: [['shade', 'Test in shade', and(val('site', 'shaded'), res('panel', 'weak'))], ['sun', 'Test in full sun', and(val('site', 'sunny'), res('panel', 'strong'))]],
      explain: { q: 'Why did the panel make more electricity in full sun?', choices: [ok('light', 'A solar panel needs plenty of light'), no('same', 'Panels work the same anywhere', 'Your tests differed when only the place changed.'), no('hot', 'Shade made it too hot', 'Shade is cooler.')], hints: ['Compare your tests.', 'What does the tree block?', 'More light, more electricity.'] },
      transfer: [{ heading: `Cloudy days at ${tplace.name}`, text: 'This panel is in full sun, but the weather changes.', alt: 'A panel under clouds.', layout: solar({ controls: ['weather'], initial: { weather: 'cloudy' }, goal: (r) => r.panel === 'strong' }), q: 'Why less electricity on cloudy days?', choices: [ok('clouds', 'Clouds let less sunlight through'), no('wet', 'Clouds make it wet', 'There is no rain in this model.')], hints: ['Try both weathers.', 'Clouds block light.', 'Clear days.'] }],
      idea: 'A solar panel changes light into electricity. Less light, less electricity.',
    });
    case '3-5': return generated({
      ...base, title: `After dark at ${place.short.toLowerCase()}`, concept: 'solar_needs_light', goal: 'Show that a solar panel makes no electricity in the dark.',
      brief: [`${place.short} at sunset`, `The light at ${at} runs straight from its panel, with no battery. Will it work after sunset?`, `The panel and lamp at ${at}.`],
      predict: ['Will the panel make electricity after dark?', [opt('yes', 'Yes'), opt('no', 'No'), opt('little', 'A little')]],
      lab: ['Day and night', 'Choose the time. Then press Test.', solar({ controls: ['time'], initial: { time: flip ? 'night' : 'day' }, scene: place.id }), `The panel at ${at}.`],
      evidence: [['day', 'Daytime test', and(val('time', 'day'), res('panel', 'strong'))], ['night', 'After-dark test', and(val('time', 'night'), res('panel', 'none'))]],
      explain: { q: 'Why did the lamp go off after dark?', choices: [ok('nolight', 'No sunlight, so the panel makes no electricity'), no('tired', 'The panel got tired', 'Panels do not get tired.'), no('cold', 'Night air is too cold', 'Temperature is not in this model.')], hints: ['Compare day and night.', 'What does a panel need?', 'No light, no electricity.'] },
      transfer: [{ heading: `Shade at ${tplace.name}`, text: 'It is daytime, but this panel is in shade.', alt: 'A shaded panel.', layout: solar({ controls: ['site'], initial: { site: 'shaded' } }), q: 'What did the panel need?', choices: [ok('light', 'Plenty of sunlight'), no('dark', 'Darkness', 'Darkness gives nothing.')], hints: ['Where is the panel?', 'Move it into sun.', 'Then Test.'] }],
      idea: 'A solar panel needs light. In the dark it makes no electricity.',
    });
    case '3-6': return generated({
      ...base, title: `A fair panel test at ${place.short.toLowerCase()}`, concept: 'fair_test', goal: 'Compare two panel places while keeping everything else the same.',
      brief: [`Where should the panel go?`, `${name} must find the best place for a panel at ${at}. Test fairly.`, `A panel at ${at} with place and weather settings.`],
      predict: ['To compare places fairly, what stays the same?', [opt('weather', 'The weather'), opt('nothing', 'Nothing'), opt('place', 'The place')]],
      lab: ['Test fairly', 'Change one thing at a time.', solar({ controls: ['site', 'weather'], initial: { weather: flip ? 'cloudy' : 'clear' }, scene: place.id }), `A panel at ${at}.`],
      evidence: [['fair', 'Two tests where only the place changed', { pair: onlyChanged('site') }]],
      explain: { q: 'Why change only the place?', choices: [ok('cause', 'Then any difference comes from the place'), no('quick', 'It is quicker', 'It is about knowing the cause.'), no('both', 'Changing both is fine', 'Then you cannot tell which mattered.')], evidenceQ: 'Pick a test in full sun.', evidenceTest: val('site', 'sunny'), hints: ['Find two tests with the same weather.', 'Change one thing.', 'Same weather, different place.'] },
      transfer: [{ heading: `Weather check at ${tplace.name}`, text: 'Now test the weather, keeping the place the same.', alt: 'A panel in full sun.', layout: solar({ controls: ['weather'], initial: { weather: 'cloudy' }, goal: (r) => r.panel === 'strong' }), q: 'What did you keep the same?', choices: [ok('place', 'The place'), no('weather', 'The weather', 'That is what you changed.')], hints: ['Only weather changes here.', 'The place stays put.', 'Try clear days.'] }],
      idea: 'A fair test changes one thing and keeps the rest the same.',
    });
    case '5-2': return generated({
      ...base, title: `Solar after sunset at ${place.short.toLowerCase()}`, concept: 'storage_requirement', goal: 'Show that a solar light needs stored energy to work after dark.',
      brief: [`The new light at ${at}`, `The new light at ${at} must work after sunset. It has a panel. Is that enough?`, `A path light at ${at} with a panel and an empty battery box.`],
      predict: ['With only a panel, will the light work after dark?', [opt('yes', 'Yes'), opt('no', 'No')], [opt('charged', 'The panel charged in the day'), opt('store', 'It needs storage'), opt('guess', 'Just a guess')]],
      lab: ['Test day and night', 'Change time and storage. Then press Test.', solar({ controls: ['time', 'storage'], initial: { time: flip ? 'night' : 'day' }, scene: place.id }), `The light at ${at}.`],
      evidence: [['nightnone', 'After dark, no battery: off', and(val('time', 'night'), val('storage', 'none'), res('lamp', 'off'))], ['nightbat', 'After dark, battery: on', and(val('time', 'night'), val('storage', 'battery'), res('lamp', 'on'))]],
      explain: { q: 'Why does the light need a battery?', choices: [ok('store', 'The panel makes nothing in the dark, so a battery stores energy from the day'), no('panel', 'The panel stores sunlight', 'With no battery it was off after dark.'), no('bright', 'The battery makes it brighter', 'Brightness is not modelled. The battery is the only source after dark.')], hints: ['Compare night with and without a battery.', 'What does the panel make at night?', 'Day: charge. Night: battery runs the lamp.'] },
      transfer: [{ heading: `Choose the parts for ${tplace.name}`, text: 'It is after dark. Choose the place and storage.', alt: 'A light at night.', layout: solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }), q: 'Which design lights the path all evening?', choices: [ok('both', 'Panel in full sun, with a battery'), no('panel', 'Panel in full sun, no battery', 'After dark the panel gives nothing.')], hints: ['Try with a battery.', 'Shade gives only a part charge.', 'Sun + battery.'] }],
      idea: 'A solar panel cannot light the path at night. A battery stores energy for after dark.',
    });
    case '5-6': return generated({
      ...base, title: `Shade and the battery at ${place.short.toLowerCase()}`, concept: 'fair_test_solar', goal: 'Compare panel places fairly when a battery is used at night.',
      brief: [`Night lights at ${at}`, `Two lights at ${at} have batteries. One panel is under a tree. Compare them fairly.`, `Two lights at ${at}.`],
      predict: ['With a battery, will a shaded panel light the path all evening?', [opt('yes', 'Yes'), opt('short', 'Only a short time'), opt('no', 'Not at all')]],
      lab: ['Compare fairly', 'Change one setting at a time.', solar({ controls: ['site', 'weather'], fixed: { time: 'night', storage: 'battery' }, initial: { site: flip ? 'shaded' : 'sunny' }, scene: place.id }), `A light at ${at} after dark.`],
      evidence: [['fair', 'Two tests where only the place changed', { pair: onlyChanged('site') }], ['short', 'A test that lit only a short time', res('lamp', 'short')]],
      explain: { q: 'Why did the shaded light work for only a short time?', choices: [ok('charge', 'Less daylight reached the panel, so the battery was only partly charged'), no('battery', 'Its battery was smaller', 'Both batteries are the same here.'), no('night', 'Night is darker under trees', 'At night both panels make nothing.')], evidenceQ: 'Which test shows the short time?', evidenceTest: res('lamp', 'short'), hints: ['Find your fair pair.', 'Think about daytime charging.', 'Shade → part charge → short time.'] },
      transfer: [{ heading: `Cloudy week at ${tplace.name}`, text: 'This panel is in full sun after a cloudy week.', alt: 'A light after a cloudy week.', layout: solar({ controls: ['weather'], fixed: { time: 'night', storage: 'battery' }, initial: { weather: 'cloudy' } }), q: 'Why could clouds limit the light?', choices: [ok('charge', 'Less light, so less charge'), no('rain', 'Rain gets in', 'Rain is not modelled.')], hints: ['Test both weathers.', 'Clouds reduce light.', 'Clear week → full charge.'] }],
      idea: 'How long a solar light works at night depends on how much light the panel got in the day.',
    });
    case '5-7': return generated({
      ...base, title: `A light that lasts at ${place.short.toLowerCase()}`, concept: 'storage_requirement', goal: 'Choose a design that stores enough energy for the whole evening.',
      brief: [`The light at ${at}`, `The light at ${at} must work all evening. You can move the panel and add a battery.`, `A light at ${at} at night.`],
      predict: ['Which matters most after dark?', [opt('battery', 'A battery'), opt('panel', 'A bigger panel'), opt('both', 'A battery and a sunny place')]],
      lab: ['Design and test', 'Choose place and storage. Then press Test.', solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded', storage: flip ? 'battery' : 'none' }, scene: place.id }), `The light at ${at}.`],
      evidence: [['none', 'No battery: off', and(val('storage', 'none'), res('lamp', 'off'))], ['short', 'Battery in shade: short time', and(val('storage', 'battery'), val('site', 'shaded'), res('lamp', 'short'))], ['on', 'Battery in sun: all evening', res('lamp', 'on')]],
      explain: { q: 'Which design works all evening, and why?', choices: [ok('both', 'Battery plus panel in full sun: storage for the night and enough daylight to fill it'), no('battery', 'Any design with a battery', 'In shade it lit only a short time.'), no('sun', 'Any panel in full sun', 'Without a battery it was off after dark.')], hints: ['Look at all three tests.', 'Two things matter.', 'Battery + sun.'] },
      transfer: [{ heading: `Cloudy season at ${tplace.name}`, text: 'A good design, but the cloudy season arrives.', alt: 'A light in cloudy weather.', layout: solar({ controls: ['weather', 'storage'], fixed: { time: 'night' }, initial: { weather: 'cloudy', storage: 'none' } }), q: 'What limits the design in cloudy weather?', choices: [ok('light', 'Less daylight, so less stored energy'), no('wear', 'Clouds wear out the battery', 'The battery is the same.')], hints: ['Add the battery.', 'Test cloudy and clear.', 'Clear weather fills it.'] }],
      idea: 'After dark a solar light needs a battery, and the battery needs enough daylight to fill it.',
    });
    case '6-3': return generated({
      ...base, title: `Design the night light for ${place.short.toLowerCase()}`, concept: 'system_design', goal: 'Justify a design for a shaded site that must work after dark, and name a limitation.',
      brief: [`The shaded site at ${at}`, `${cap(at)} is under big trees. It needs a light that works all evening. You can put the panel on a nearby sunny roof.`, `A shaded site at ${at} at night.`],
      predict: ['Which design will work all evening?', [opt('shade', 'Panel in shade, no battery'), opt('roof', 'Panel on the sunny roof, with a battery'), opt('shadebat', 'Panel in shade, with a battery')]],
      lab: ['Design and test', 'Choose place and storage, then test after dark.', solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded', storage: flip ? 'battery' : 'none' }, scene: place.id }), `The light at ${at}.`],
      evidence: [['fail', 'A design that fails after dark', (t) => t.result.lamp !== 'on'], ['works', 'A design that works all evening', res('lamp', 'on')]],
      explain: { q: 'Which condition could still limit your design?', choices: [ok('cloud', 'A cloudy week could leave the battery only partly charged'), no('none', 'Nothing; it always works', 'Every design has limits.'), no('moon', 'A full moon', 'Moonlight is far too weak to matter.')], hints: ['What does the battery depend on?', 'Daylight fills it.', 'Clouds reduce daylight.'] },
      transfer: [{ heading: `Test the limit at ${tplace.name}`, text: 'Your design: sunny panel and battery. Test a cloudy week.', alt: 'The design with weather settings.', layout: solar({ controls: ['weather'], fixed: { time: 'night', site: 'sunny', storage: 'battery' }, initial: { weather: 'cloudy' } }), q: 'What did the cloudy test show?', choices: [ok('short', 'It ran only a short time, so weather limits the design'), no('fine', 'No difference', 'Look at the cloudy result.')], hints: ['Test cloudy.', 'Then clear.', 'Compare.'] }],
      idea: 'A good design meets its requirements and names the conditions that could limit it.',
    });
    case '6-7': return generated({
      ...base, title: `Repeat and be sure at ${place.short.toLowerCase()}`, concept: 'repeated_evidence', goal: 'Repeat a test and say how confident the evidence makes you.',
      brief: [`Evidence for ${at}`, `The council will only buy lights for ${at} if your evidence is strong.`, `A light at ${at} with settings.`],
      predict: ['Should you repeat a test before deciding?', [opt('yes', 'Yes'), opt('no', 'No, once is enough')]],
      lab: ['Test and repeat', 'Test, then repeat the exact same test.', solar({ controls: ['site', 'weather', 'storage'], fixed: { time: 'night' }, initial: { site: flip ? 'shaded' : 'sunny' }, scene: place.id }), `A light at ${at}.`],
      evidence: [['repeat', 'The same settings tested twice', { pair: (a, b) => JSON.stringify(a.settings) === JSON.stringify(b.settings) }], ['works', 'A design that lit all evening', res('lamp', 'on')]],
      explain: { q: 'The model gave the same result twice. What should you say?', choices: [ok('confident', 'The model is consistent, but real lights may vary, so check real ones too'), no('proved', 'It is proved for every real light', 'This is a simplified model.'), no('pointless', 'Repeating was pointless', 'Repeating checks for mistakes.')], hints: ['Look at your repeats.', 'Model or real?', 'Consistent model + real checks.'] },
      transfer: [{ heading: `Another site: ${tplace.name}`, text: 'Repeat a test for this site.', alt: 'A light at another site.', layout: solar({ controls: ['storage', 'weather'], fixed: { time: 'night' }, initial: { weather: 'cloudy' } }), q: 'Why repeat tests for a new site?', choices: [ok('check', 'Each site’s results need checking'), no('copy', 'Copy the first site’s results', 'Conditions can differ.')], hints: ['Find a working setup.', 'Test it.', 'Then think about repeats.'] }],
      idea: 'Repeating a test checks your result. Model results still need checking against real conditions.',
    });
    case '6-8': return generated({
      ...base, title: `Limits of solar at ${place.short.toLowerCase()}`, concept: 'system_limits', goal: 'Identify conditions that limit a solar system.',
      brief: [`A hard season at ${at}`, `Stress-test the light at ${at} in different conditions.`, `A light at ${at} with settings.`],
      predict: ['Which condition limits the light most after dark?', [opt('nobat', 'No battery'), opt('cloud', 'Cloudy week'), opt('shade', 'Shade')]],
      lab: ['Stress test', 'Try different conditions after dark.', solar({ controls: ['site', 'weather', 'storage'], fixed: { time: 'night' }, initial: { storage: 'battery', weather: flip ? 'cloudy' : 'clear' }, scene: place.id }), `A light at ${at}.`],
      evidence: [['cloud', 'Cloudy week with battery: short', and(val('weather', 'cloudy'), val('storage', 'battery'), res('lamp', 'short'))], ['nobat', 'No battery: off', and(val('storage', 'none'), res('lamp', 'off'))], ['good', 'Good conditions: all evening', res('lamp', 'on')]],
      explain: { q: 'Which statement about limits is supported?', choices: [ok('limits', 'Without storage it fails; with storage, cloud or shade can still shorten the evening'), no('battery', 'A battery solves everything', 'The cloudy test ran short.'), no('panel', 'The panel is the problem', 'It worked with enough light.')], hints: ['Compare your tests.', 'Which failed or ran short?', 'Storage needed; daylight fills it.'] },
      transfer: [{ heading: `Fix it at ${tplace.name}`, text: 'A shaded panel, no battery. Make it work all evening.', alt: 'A light design.', layout: solar({ controls: ['site', 'storage'], fixed: { time: 'night' }, initial: { site: 'shaded' } }), q: 'Which two changes were needed?', choices: [ok('both', 'Add a battery and move the panel into sun'), no('one', 'Just add a battery', 'In shade it ran short.')], hints: ['Add storage.', 'Think about shade.', 'Sun + battery.'] }],
      idea: 'Solar lights depend on daylight and storage. Shade, clouds and missing storage all limit them.',
    });
    default: return generated({
      ...base, title: `Compare designs for ${place.short.toLowerCase()}`, concept: 'design_evaluation', goal: 'Compare two designs fairly and justify a choice.',
      brief: [`Design A or B for ${at}?`, `Design A: panel only. Design B: panel and battery. Compare them fairly after dark at ${at}.`, `Two lights at ${at}.`],
      predict: ['Which design will win after dark?', [opt('a', 'Design A'), opt('b', 'Design B'), opt('same', 'The same')]],
      lab: ['Compare fairly', 'Change only the storage between tests.', solar({ controls: ['storage', 'site', 'weather'], fixed: { time: 'night' }, initial: { site: flip ? 'shaded' : 'sunny', weather: house % 3 ? 'clear' : 'cloudy' }, scene: place.id }), `A light at ${at}.`],
      evidence: [['fair', 'Two tests where only the storage changed', { pair: onlyChanged('storage') }]],
      explain: { q: 'Which design would you recommend and why?', choices: [ok('b', 'Design B: in a fair comparison only it lit the path after dark'), no('a', 'Design A: it is simpler', 'It failed the after-dark requirement.'), no('either', 'Either', 'Your fair pair gave different results.')], evidenceQ: 'Pick the test that shows design B working.', evidenceTest: and(val('storage', 'battery'), (t) => t.result.lamp !== 'off'), hints: ['Find your fair pair.', 'Only storage changed.', 'B lit; A did not.'] },
      transfer: [{ heading: `Second site: ${tplace.name}`, text: 'Find a setup that lights this site all evening in cloudy weather.', alt: 'A light in cloudy weather.', layout: solar({ controls: ['storage', 'weather'], fixed: { time: 'night' }, initial: { weather: 'cloudy' } }), q: 'Does your choice still hold in a cloudy week?', choices: [ok('partly', 'B still beats A, but it runs short in cloudy weather'), no('fails', 'B fails completely', 'B ran a short time; A not at all.')], hints: ['Test B in cloud.', 'Then clear.', 'Compare with A.'] }],
      idea: 'Compare designs fairly, choose the one that meets the need, and say where it could fall short.',
    });
  }
}
