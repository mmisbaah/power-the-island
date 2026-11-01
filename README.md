# Power the Island

A science game for Grades 1 to 6, built for Science Lagoon. Each grade is a neighbourhood of ten buildings; each building has ten rooms, and each room holds a mission. Rooms light up as children finish missions, so a finished grade is a fully lit street.

600 playable missions in all, running on deterministic science models. No server, login or build step.

## Play it

The game uses JavaScript modules, so open it through a web server rather than by double-clicking the file:

```
python3 -m http.server 8000
```

then visit http://localhost:8000.

To put it online, any static host works. On GitHub: Settings → Pages → deploy from the `main` branch, root folder. It is then served at `https://mmisbaah.github.io/power-the-island/`.

Run the tests with `npm test` (Node 20 or newer).

## How it plays

- **Neighbourhood:** the home screen shows the grade's ten buildings. Each is drawn from its own floor plan, with one window per room lit to match progress. Tap a building to go inside.
- **Inside a building:** a cutaway house with ten 3D rooms. Tap a room to see its mission, tap again (or press Start) to go in. ◀ ▶ move to the next building.
- **A mission:** brief → prediction → test on a model → evidence → explanation → a new challenge on its own → summary. Every screen fits without scrolling.

## What each grade covers

| Grade | Focus | Main model types |
|---|---|---|
| 1 | Things that need electricity, switches, battery or wall, light givers, safe choices | Hidden circuit scenes, picture checks, rooms |
| 2 | Sources vs reflectors, light reaching the eye, shadows, straight lines, purpose, safety | Light model, picture checks, hidden circuits |
| 3 | Saving energy, solar needs light, power records, energy changes, fair tests, safety audits | Rooms, solar, hidden circuits, checks |
| 4 | Complete circuits, conductors and insulators, gaps, crossings, coated wire, diagnosis | Circuit diagrams |
| 5 | Energy stores and transfers, storage after dark, fair comparisons, observation vs idea | Circuits, solar, checks, rooms |
| 6 | Series circuits, break anywhere, systematic fault finding, system design and limits, repeats | Circuits (up to 3 bulbs), solar, rooms |

The original prototype IDs `power-g1-02` and `power-g4-03` are kept. Their content version moved to 4, so older saves of those two missions start again with a notice.

## Houses

House 1 of each grade holds the ten hand-written missions. Houses 2 to 10 are built by `src/content/generated.js` from the same ten ideas per grade, each time with a different setting: items, places, characters, buildings, circuit layouts, fault positions, materials and starting conditions. Every house has its own floor plan (`src/house.js`), with each mission in a room chosen to suit it. Generated IDs are `power-g<grade>-h<house>-<number>`.

## Files

- `src/circuit.js`: topology-only circuit model. Single series loop, one battery, removable bulbs. Branches, short circuits and mains parts are refused as unsupported.
- `src/models.js`: solar, light, rooms and catalogue models, plus the rule dispatcher. Unknown rules return "unavailable".
- `src/layouts.js`: builders, so mission content never hand-places terminals.
- `src/content/grade1.js` … `grade6.js`: house 1 missions. `src/content/gen/`: generators for houses 2 to 10. `src/content/helpers.js` turns compact authoring into full mission records.
- `src/progress.js`: local save. On load it re-runs every saved trial through the model, so completion is rebuilt from evidence.
- `src/lab.js`, `src/app.js`, `src/art.js`, `index.html`: screens, drawings, styles.

## Tests

`test/model.test.js` covers all four game-specific acceptance checks from the outline (crossing wires, plastic with a closed switch, break anywhere, night-time solar without storage) checks that all 600 missions differ in title and content, that every house plan is valid and different, and, for every mission, enumerates every setting a learner can reach and asserts that each evidence requirement, evidence link and transfer goal is achievable and that no transfer starts already solved.

## Known limits and open review items

- Every mission has curriculum status `Proposed` with no outcome code. The outline asked for 18 missions; this build has 600, so educator review needs a sampling plan.
- Houses 2 to 10 practise the same ten ideas per grade in new settings; they are not new topics.
- Brightness is not modelled. Solar results are categorical (on all evening, short time, off) and carry no numbers.
- Many item pictures are emoji placeholders until the commissioned symbol library arrives.
- Most missions have one transfer layout. Only `power-g1-02` and `power-g4-03` have a second layout for retrying the transfer without hints.
- Lesson links all point to the Science Lagoon home page; the named lessons are placeholders.
