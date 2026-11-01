// Power the Island: mission roster.
//
// Every grade has ten houses of ten missions: 600 in all. House 1 of each
// grade is hand-written (src/content/grade1.js to grade6.js); houses 2 to 10
// are built by src/content/generated.js. Mission IDs are stable:
// power-g<grade>-<number> for house 1 and power-g<grade>-h<house>-<number>
// for the others.

import grade1 from './content/grade1.js';
import grade2 from './content/grade2.js';
import grade3 from './content/grade3.js';
import grade4 from './content/grade4.js';
import grade5 from './content/grade5.js';
import grade6 from './content/grade6.js';
import { GENERATED, HOUSES_PER_GRADE } from './content/generated.js';

export const GAME_ID = 'power-the-island';
export const MISSIONS_PER_HOUSE = 10;
export { HOUSES_PER_GRADE };

export const MISSIONS = [grade1, grade2, grade3, grade4, grade5, grade6].flat().concat(GENERATED)
  .map((m) => ({ ...m, playable: true }));

export const ROSTER = MISSIONS.slice().sort((a, b) => a.grade - b.grade || a.house - b.house || a.number - b.number);

const byId = new Map(MISSIONS.map((m) => [m.missionId, m]));
export const missionById = (id) => byId.get(id) || null;
