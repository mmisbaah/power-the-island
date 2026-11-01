// Houses 2 to 10 of every grade. Each house repeats the grade's ten ideas
// in new settings, so a learner meets each idea ten times in ten different
// ways. House 1 is the hand-written set in grade1.js to grade6.js.

import { catalogueMission, CATALOGUE_SPECS, systemMission, wasteMission } from './gen/catalogue.js';
import { safetyMission, switchMission, batteryMission, roomsMission } from './gen/everyday.js';
import { lightMission, solarMission } from './gen/lightsolar.js';
import { circuitMission, testerMission } from './gen/circuits.js';

export const HOUSES_PER_GRADE = 10;

const catalogueSpec = (g, n) => CATALOGUE_SPECS.find((s) => s.grade === g && s.number === n);

const KIND = {
  1: ['cat', 'switch', 'safety', 'cat', 'switch', 'cat', 'rooms', 'battery', 'safety', 'cat'],
  2: ['cat', 'light', 'cat', 'light', 'light', 'battery', 'cat', 'light', 'rooms', 'safety'],
  3: ['rooms', 'solar', 'switch', 'battery', 'solar', 'solar', 'rooms', 'cat', 'cat', 'cat'],
  4: ['circuit', 'tester', 'circuit', 'circuit', 'tester', 'circuit', 'circuit', 'tester', 'circuit', 'circuit'],
  5: ['system', 'solar', 'tester', 'circuit', 'cat', 'solar', 'solar', 'tester', 'waste', 'rooms'],
  6: ['circuit', 'circuit', 'solar', 'circuit', 'circuit', 'circuit', 'solar', 'solar', 'solar', 'rooms'],
};

function build(grade, number, house) {
  switch (KIND[grade][number - 1]) {
    case 'cat': return catalogueMission(catalogueSpec(grade, number), house);
    case 'switch': return switchMission(grade, number, house);
    case 'safety': return safetyMission(grade, number, house);
    case 'battery': return batteryMission(grade, number, house);
    case 'rooms': return roomsMission(grade, number, house);
    case 'light': return lightMission(number, house);
    case 'solar': return solarMission(grade, number, house);
    case 'circuit': return circuitMission(grade, number, house);
    case 'tester': return testerMission(grade, number, house);
    case 'system': return systemMission(house);
    case 'waste': return wasteMission(house);
    default: throw new Error(`No generator for grade ${grade} mission ${number}`);
  }
}

export const GENERATED = [];
for (let grade = 1; grade <= 6; grade++) {
  for (let house = 2; house <= HOUSES_PER_GRADE; house++) {
    for (let number = 1; number <= 10; number++) GENERATED.push(build(grade, number, house));
  }
}
