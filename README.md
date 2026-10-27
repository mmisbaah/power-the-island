# Power the Island

A science game for Grades 1 to 6, built for Science Lagoon. Children repair model circuits, test solar lights and sort out energy ideas to switch on the lights of six islands, one island per grade.

Everything runs in one HTML file. There's no server, no login and no build step needed to play.

## Play it

Open `index.html` in a browser. That's it.

To put it online, any static host works. On GitHub: Settings → Pages → deploy from the `main` branch, root folder. It will then be served at `https://mmisbaah.github.io/power-the-island/`.

## What's in the game

**60 missions**, 10 per grade. Each one follows the same steps: brief, prediction, investigation, evidence, explanation, a new problem, and a summary. The investigation uses one of five activities:

| Activity | What the child does |
|---|---|
| Sort | Put cards into groups, check, fix the ones marked ↻ (Grades 1–2 get one big card at a time) |
| Put in order | Build a chain, e.g. light source → object → eye |
| Switch and observe | Press a switch and match a picture to what happens |
| Circuit model | Swap connector materials, open and close the switch, press Test |
| Solar model | Choose panel, spot, battery store and time of day, press Test |

**Games tab:** a daily challenge (same three questions for everyone on a grade that day), a quick quiz, Spark Pairs (a memory game), and a free-play Workshop for circuits and solar lights.

**Rewards:** sparks earned by playing, 1–3 stars per mission based on hints used, nine levels, 18 badges, and an island shop with companions and decorations. Sparks can't be bought, and nothing in the shop changes a science result.

**Design limits kept on purpose:** no timers or speed scoring, no leaderboards, no chat, no accounts, no real-money purchases. Progress is saved in the browser only and can be exported from Settings. It doesn't sync between devices.

## Science model

Circuits are a graph of terminals. Conducting connectors, closed switches and bulb filaments are edges. A bulb lights only if it sits on a closed conducting route from the battery's + terminal back to −. Where wires are drawn on screen plays no part, so a wire that only crosses another on the drawing isn't connected. Short circuits and parallel networks are rejected as unsupported. An unknown part returns "model unavailable" rather than a guess. Brightness isn't modelled.

The solar model uses simple example rules, not measurements: a panel in open sun by day makes enough electricity for the lamp and fully charges a battery store; shade gives too little; no light means no electricity.

The teacher page (link at the bottom of the home screen) runs the model's acceptance checks live each time the game loads.

## Curriculum status

All 60 missions are **proposed** teaching selections. None is yet mapped to an outcome code in the adopted NIE syllabus. Missions 1–3 in each grade come from the original design outline; missions 4–10 were added later and need the closest review. A Maldivian science educator should check the science, the grade demand and the curriculum mapping before release.

The drawings are placeholders built from a small shared symbol set, and read-aloud uses the browser's built-in voice. Commissioned art and recorded narration are still to do.

## Working on the code

```
src/head.html     title and font links
src/style.css     all styles (light and dark themes)
src/core.js       circuit and solar models, layouts, pictures, scenes
src/content1.js   mission content, Grades 1–3
src/content2.js   mission content, Grades 4–6
src/app.js        mission engine, saving, home, island map, mission screens
src/modes.js      games, rewards, badges, shop
build.py          joins src/ into index.html
```

Edit files in `src/`, then rebuild:

```
python3 build.py
```

Mission content is plain data passed to `mk(grade, number, {...})`. Each mission has a stable ID such as `power-g4-03` and a content version. Bump the version when you change a mission's rules, and saved attempts for that mission will start fresh instead of loading stale answers.

## Tests

The tests drive the real page in a headless browser with [Playwright](https://playwright.dev/).

```
python3 build.py --test      # writes test.html with a small hook the tests use
node tests/play-all-missions.js   # plays all 60 missions to the end through the buttons
node tests/game-modes.js          # daily challenge, quiz, pairs, workshop, shop, badges
node tests/home-fits.js           # checks the home screen fits without scrolling at 7 screen sizes
```

Screenshots from the tests go to `tests/output/`.
