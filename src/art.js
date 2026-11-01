// Power the Island: drawings. Every function returns an SVG string built
// from theme tokens, so scenes follow light and dark mode.

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function rays(cx, cy, r0, r1, n = 10) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    out += `<line x1="${cx + Math.cos(a) * r0}" y1="${cy + Math.sin(a) * r0}" x2="${cx + Math.cos(a) * r1}" y2="${cy + Math.sin(a) * r1}" />`;
  }
  return `<g class="rays">${out}</g>`;
}

// state: 'on' | 'off' | 'unknown'
function lampHead(cx, cy, state, r = 22) {
  const glow = state === 'on' ? `<circle class="glow" cx="${cx}" cy="${cy}" r="${r * 2.6}" />${rays(cx, cy, r + 6, r + 18)}` : '';
  const fill = state === 'on' ? 'bulb-on' : 'bulb-off';
  const mark = state === 'unknown' ? `<text class="bulb-mark" x="${cx}" y="${cy + 7}">?</text>` : '';
  return `${glow}<circle class="${fill}" cx="${cx}" cy="${cy}" r="${r}" /><path class="filament" d="M${cx - 8} ${cy + 4} q4 -12 8 0 q4 -12 8 0" />${mark}`;
}

function wallSwitch(x, y, on, id) {
  return `<g class="wall-switch" ${id ? `id="${id}"` : ''}>
    <rect class="plate" x="${x - 16}" y="${y - 24}" width="32" height="48" rx="6" />
    <rect class="rocker" x="${x - 8}" y="${on ? y - 2 : y - 16}" width="16" height="18" rx="3" />
    <text class="tiny" x="${x}" y="${y + 40}">${on ? 'ON' : 'OFF'}</text>
  </g>`;
}

// ---------- Hidden-circuit scenes: wiring is not shown on purpose ----------

function device(kind, x, y, state) {
  const q = state === 'unknown' ? `<circle class="gap-badge" cx="${x + 26}" cy="${y - 22}" r="11" /><text class="gap-mark" x="${x + 26}" y="${y - 17}">?</text>` : '';
  if (kind === 'fan') {
    const blades = [0, 120, 240].map((a) => `<ellipse class="blade" cx="${x}" cy="${y - 20}" rx="9" ry="20" transform="rotate(${a} ${x} ${y})" />`).join('');
    const wind = state === 'on' ? `<path class="wind" d="M${x + 40} ${y - 14} q14 -6 28 0 M${x + 42} ${y + 2} q14 -6 30 0 M${x + 40} ${y + 18} q14 -6 28 0" />` : '';
    return `<rect class="post" x="${x - 3}" y="${y}" width="6" height="46" /><rect class="desk" x="${x - 22}" y="${y + 44}" width="44" height="8" rx="3" />
      <circle class="fan-guard" cx="${x}" cy="${y}" r="34" /><g class="blades ${state === 'on' ? 'spin' : ''}" style="transform-origin:${x}px ${y}px">${blades}</g>
      <circle class="cell" cx="${x}" cy="${y}" r="6" />${wind}${q}`;
  }
  if (kind === 'torch') {
    const beam = state === 'on' ? `<path class="beam" d="M${x + 40} ${y - 12} L${x + 150} ${y - 50} L${x + 150} ${y + 50} L${x + 40} ${y + 12}z" />` : '';
    return `${beam}<rect class="torch-body" x="${x - 50}" y="${y - 12}" width="70" height="24" rx="6" />
      <path class="torch-head" d="M${x + 20} ${y - 12} l20 -8 v40 l-20 -8z" />
      <circle class="${state === 'on' ? 'bulb-on' : 'bulb-off'}" cx="${x + 38}" cy="${y}" r="7" />${q}`;
  }
  if (kind === 'radio') {
    const waves = state === 'on' ? `<path class="wind" d="M${x + 44} ${y - 16} q10 16 0 32 M${x + 54} ${y - 24} q16 24 0 48" />` : '';
    return `<rect class="torch-body" x="${x - 40}" y="${y - 24}" width="80" height="48" rx="8" />
      <circle class="fan-guard" cx="${x - 14}" cy="${y}" r="14" /><rect class="plate" x="${x + 8}" y="${y - 10}" width="22" height="8" rx="2" />
      <line class="cord" x1="${x + 20}" y1="${y - 24}" x2="${x + 34}" y2="${y - 48}" />${waves}${q}`;
  }
  return `${lampHead(x, y, state, 16)}`;
}

const SCENE_ANCHOR = {
  classroom: [200, 76], bedroom: [270, 120], 'path-dusk': [280, 110], noticeboard: [200, 34],
  kitchen: [200, 120], porch: [210, 100], workshop: [150, 130],
};

function backgroundFor(id) {
  switch (id) {
    case 'classroom':
      return `<rect class="wall" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
        <rect class="window" x="40" y="40" width="100" height="80" rx="6" /><path class="cloud" d="M60 95 q10 -22 30 -10 q14 -16 30 4 q18 2 10 18 h-66 q-14 -4 -4 -12z" />
        <line class="frame" x1="90" y1="40" x2="90" y2="120" /><rect class="door" x="320" y="70" width="60" height="130" rx="4" />
        <line class="cord" x1="200" y1="0" x2="200" y2="38" /><path class="shade" d="M178 38 h44 l10 22 h-64z" />
        <rect class="desk" x="150" y="170" width="120" height="12" rx="3" /><rect class="book" x="190" y="160" width="40" height="10" rx="2" />`;
    case 'bedroom':
      return `<rect class="wall" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
        <rect class="window night" x="40" y="40" width="110" height="80" rx="6" /><circle class="moon" cx="120" cy="66" r="12" />
        <rect class="bed" x="40" y="160" width="170" height="40" rx="8" /><rect class="pillow" x="50" y="150" width="50" height="18" rx="8" />
        <rect class="desk" x="235" y="160" width="70" height="40" rx="4" />`;
    case 'path-dusk':
      return `<rect class="sky-dusk" width="400" height="170" /><circle class="sunset" cx="330" cy="168" r="30" />
        <rect class="sea" y="150" width="400" height="30" /><path class="sandbank" d="M0 175 q200 -20 400 0 v85 h-400z" />
        <path class="path" d="M150 260 q30 -50 90 -85 h30 q-40 40 -40 85z" /><path class="palm-trunk" d="M60 230 q10 -60 0 -120" />
        <path class="palm-leaf" d="M60 110 q-40 -10 -55 10 q30 -18 55 -10 q-10 -35 -40 -40 q35 5 40 40 q20 -35 55 -30 q-35 0 -55 30 q45 -5 60 20 q-30 -20 -60 -20z" />
        <rect class="post" x="276" y="120" width="8" height="90" />`;
    case 'noticeboard':
      return `<rect class="sky-dusk" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
        <rect class="post" x="96" y="150" width="10" height="70" /><rect class="post" x="294" y="150" width="10" height="70" />
        <rect class="board" x="80" y="60" width="240" height="110" rx="6" />
        <rect class="note" x="100" y="78" width="60" height="44" transform="rotate(-3 130 100)" />
        <rect class="note alt" x="175" y="84" width="54" height="64" transform="rotate(2 200 116)" />
        <rect class="note" x="244" y="76" width="56" height="40" transform="rotate(4 272 96)" /><line class="cord" x1="200" y1="40" x2="200" y2="60" />`;
    case 'kitchen':
      return `<rect class="wall" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
        <rect class="desk" x="60" y="170" width="280" height="30" rx="4" /><rect class="window" x="270" y="40" width="90" height="70" rx="6" />
        <rect class="note alt" x="40" y="40" width="70" height="50" rx="4" />`;
    case 'porch':
      return `<rect class="sky-night" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
        <rect class="door" x="150" y="100" width="70" height="100" rx="4" /><rect class="wall" x="40" y="80" width="330" height="20" />
        <circle class="moon" cx="340" cy="40" r="12" />`;
    case 'workshop':
      return `<rect class="wall" width="400" height="200" /><rect class="bench" y="160" width="400" height="100" />
        <path class="grain" d="M0 190 q180 12 400 -4 M0 230 q140 -10 400 8" /><rect class="note" x="250" y="40" width="110" height="70" rx="4" />`;
    default:
      return `<rect class="wall" width="400" height="260" />`;
  }
}

// state: 'on' | 'off' | 'unknown'
export function scene(id, { state = 'off', switchOn = false, deviceKind = 'lamp', showSwitch = true, battery = null } = {}) {
  const [x, y] = SCENE_ANCHOR[id] || [200, 100];
  const dark = state !== 'on' && !['kitchen', 'workshop'].includes(id);
  const sw = showSwitch ? wallSwitch(id === 'path-dusk' ? 318 : id === 'noticeboard' ? 342 : 350, id === 'path-dusk' ? 190 : 120, switchOn) : '';
  const bat = battery === null ? '' : `<g class="battag"><rect class="plate" x="20" y="214" width="120" height="32" rx="8" /><rect class="${battery ? 'cell' : 'gap'}" x="30" y="222" width="34" height="16" rx="3" /><text class="tiny" x="102" y="235">${battery ? 'battery in' : 'no battery'}</text></g>`;
  return `<svg viewBox="0 0 400 260" class="scene" aria-hidden="true">${backgroundFor(id)}${device(deviceKind, x, y, state)}${sw}${bat}
    ${dark ? '<rect class="shadow" width="400" height="260" />' : ''}</svg>`;
}

// ---------- Grade 4 circuit diagrams ----------

function backdrop(id) {
  if (id === 'bench') {
    return `<rect class="bench" x="0" y="0" width="400" height="260" rx="10" />
      <path class="grain" d="M0 70 q120 -14 400 6 M0 150 q180 18 400 -4 M0 230 q140 -10 400 8" />`;
  }
  if (id === 'noticeboard') {
    return `<rect class="cork" x="0" y="0" width="400" height="260" rx="10" />
      <rect class="cork-frame" x="4" y="4" width="392" height="252" rx="8" />
      <circle class="pin" cx="20" cy="20" r="5" /><circle class="pin" cx="380" cy="20" r="5" />
      <circle class="pin" cx="20" cy="240" r="5" /><circle class="pin" cx="380" cy="240" r="5" />`;
  }
  if (id === 'path-night') {
    return `<rect class="sky-night" x="0" y="0" width="400" height="260" rx="10" />
      <g class="planks">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 52 - 6}" y="226" width="46" height="26" rx="3" />`).join('')}</g>
      <circle class="moon" cx="370" cy="24" r="10" />`;
  }
  return '';
}

function partSvg(c, at, lit, layoutDraw, state) {
  const [x, y, dir] = at;
  const title = `<title>${esc(c.label || c.id)}</title>`;
  if (c.type === 'battery') {
    const [px, py] = layoutDraw.pos[c.terminals[0]];
    const [mx, my] = layoutDraw.pos[c.terminals[1]];
    if (dir === 'v') {
      return `<g class="part">${title}<rect class="cell" x="${x - 18}" y="${y - 28}" width="36" height="56" rx="6" />
        <rect class="cell-cap" x="${x - 7}" y="${y - 34}" width="14" height="6" rx="2" />
        <text class="sym" x="${px + 26}" y="${py + 6}">+</text><text class="sym" x="${mx + 26}" y="${my + 4}">−</text></g>`;
    }
    return `<g class="part">${title}<rect class="cell" x="${x - 24}" y="${y - 16}" width="48" height="32" rx="6" />
      <rect class="cell-cap" x="${x + 24}" y="${y - 6}" width="6" height="12" rx="2" />
      <text class="sym" x="${px}" y="${py - 22}">+</text><text class="sym" x="${mx}" y="${my - 22}">−</text></g>`;
  }
  if (c.type === 'switch') {
    const [ax, ay] = layoutDraw.pos[c.terminals[0]];
    const [bx, by] = layoutDraw.pos[c.terminals[1]];
    // An open switch is drawn as the closed blade turned 30 degrees away.
    const rot = (-30 * Math.PI) / 180;
    const ex = ax + (bx - ax) * Math.cos(rot) - (by - ay) * Math.sin(rot);
    const ey = ay + (bx - ax) * Math.sin(rot) + (by - ay) * Math.cos(rot);
    const lever = c.closed
      ? `<line class="lever" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" />`
      : `<line class="lever" x1="${ax}" y1="${ay}" x2="${ex}" y2="${ey}" />`;
    const [tx, ty] = dir === 'v' ? [x - 44, y + 4] : [x, y + (y > 130 ? -18 : 28)];
    return `<g class="part">${title}${lever}<text class="tag" x="${tx}" y="${ty}">${esc(c.label && c.label !== 'Switch' ? c.label + ': ' : '')}${c.closed ? 'closed' : 'open'}</text></g>`;
  }
  if (c.type === 'bulb') {
    const [ax, ay] = layoutDraw.pos[c.terminals[0]];
    const [bx, by] = layoutDraw.pos[c.terminals[1]];
    const label = c.removed ? 'empty holder' : state === 'on' ? 'ON' : state === 'off' ? 'OFF' : 'not tested';
    const name = /\d/.test(c.label || '') ? `${c.label.replace(/^Bulb /, 'B')} ` : '';
    const head = c.removed
      ? `<circle class="gap" cx="${x}" cy="${y}" r="20" />`
      : `<line class="lead" x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" />${lampHead(x, y, state, 18)}`;
    const [tx, ty] = dir === 'v' ? [x - 58, y + 4] : [x, y > 130 ? y - 30 : y + 40];
    return `<g class="part">${title}${head}
      <text class="tag ${state === 'on' ? 'tag-on' : ''}" x="${tx}" y="${ty}">${esc(name)}${label}</text></g>`;
  }
  return '';
}

function connectorSvg(w, route, material, highlighted, halo) {
  const pts = route.map((p) => p.join(',')).join(' ');
  const mid = route[Math.floor((route.length - 1) / 2)];
  const nxt = route[Math.floor((route.length - 1) / 2) + 1] || mid;
  const lx = (mid[0] + nxt[0]) / 2;
  const ly = (mid[1] + nxt[1]) / 2;
  const hl = highlighted ? `<polyline class="hl" points="${pts}" />` : '';
  const under = halo ? `<polyline class="halo" points="${pts}" />` : '';
  const title = `<title>${esc(w.label)}: ${material === 'missing' ? 'gap, nothing joined' : esc(MATERIAL_TAG[material] || 'metal wire')}</title>`;
  if (material === 'missing') {
    return `<g class="conn">${title}${hl}<polyline class="gap" points="${pts}" />
      <circle class="gap-badge" cx="${lx}" cy="${ly}" r="13" /><text class="gap-mark" x="${lx}" y="${ly + 5}">?</text></g>`;
  }
  // An old wire looks exactly like a new one: its fault is inside.
  const shown = material === 'broken' || material === 'old' ? 'metal' : material;
  const conducts = ['metal', 'foil', 'paperclip', 'coin', 'coated'].includes(shown);
  const cls = conducts ? `metal m-${shown}` : `ins m-${shown}`;
  const word = shown === 'metal' ? '' : MATERIAL_TAG[shown];
  const tw = word ? word.length * 6.4 + 16 : 0;
  const tag = word ? `<rect class="tag-bg" x="${lx - tw / 2}" y="${ly - 10}" width="${tw}" height="18" rx="9" /><text class="tag-sm" x="${lx}" y="${ly + 3}">${esc(word)}</text>` : '';
  const stripe = conducts ? '' : `<polyline class="ins-stripe" points="${pts}" />`;
  return `<g class="conn">${title}${hl}${under}<polyline class="${cls}" points="${pts}" />${stripe}${tag}</g>`;
}

const MATERIAL_TAG = {
  metal: 'metal wire', plastic: 'plastic', foil: 'foil', paperclip: 'paperclip', coin: 'coin',
  coated: 'coated wire', wood: 'wood', string: 'string', rubber: 'rubber band', broken: 'metal wire', old: 'metal wire',
};

// shown: { [bulbId]: 'on' | 'off' | 'unknown' }
export function diagram(layout, settings, shown, { scene: sceneId, highlight } = {}) {
  const d = layout.draw;
  const over = new Set(d.over || []);
  const conns = layout.connectors
    .slice()
    .sort((a, b) => Number(over.has(a.id)) - Number(over.has(b.id)))
    .map((w) => connectorSvg(w, d.routes[w.id], settings.connectors[w.id], highlight === w.id, over.has(w.id)))
    .join('');
  const parts = layout.components.map((c) => {
    const comp = c.type === 'switch' ? { ...c, closed: settings.switches[c.id] }
      : c.type === 'bulb' ? { ...c, removed: settings.bulbs?.[c.id] === false } : c;
    const hl = highlight === c.id ? `<circle class="hl-ring" cx="${d.parts[c.id][0]}" cy="${d.parts[c.id][1]}" r="34" />` : '';
    return hl + partSvg(comp, d.parts[c.id], null, d, shown[c.id]);
  }).join('');
  const dots = layout.terminals.map((t) => {
    const [x, y] = d.pos[t];
    return `<circle class="terminal" cx="${x}" cy="${y}" r="5"><title>Terminal ${esc(t)}</title></circle>`;
  }).join('');
  return `<svg viewBox="${d.view}" class="diagram" aria-hidden="true">${backdrop(sceneId)}${conns}${parts}${dots}</svg>`;
}

// ---------- Picture choices ----------

const PICS = {
  'lamp-on': `<path class="shade" d="M22 10 h20 l6 14 h-32z" />${lampHead(32, 38, 'on', 12)}`,
  'lamp-off': `<path class="shade" d="M22 10 h20 l6 14 h-32z" />${lampHead(32, 38, 'off', 12)}`,
  question: `<circle class="pic-bg" cx="32" cy="32" r="24" /><text class="pic-q" x="32" y="42">?</text>`,
  press: `<rect class="plate" x="20" y="8" width="24" height="36" rx="5" /><rect class="rocker" x="26" y="24" width="12" height="14" rx="2" /><path class="hand" d="M30 62 v-18 q0 -6 5 -6 q5 0 5 6 v8 h6 q6 0 6 6 v4z" />`,
  clap: `<path class="hand" d="M18 54 l8 -32 q2 -6 7 -4 l2 30z" /><path class="hand" d="M46 54 l-8 -32 q-2 -6 -7 -4 l-2 30z" /><path class="burst" d="M32 6 v8 M20 10 l4 6 M44 10 l-4 6" />`,
  sun: `<circle class="sun" cx="32" cy="32" r="12" />${rays(32, 32, 16, 26, 8)}`,
  efan: `<circle class="fan-guard" cx="32" cy="26" r="20" />${[0, 120, 240].map((r) => `<ellipse class="blade" cx="32" cy="14" rx="5" ry="11" transform="rotate(${r} 32 26)" />`).join('')}<circle class="cell" cx="32" cy="26" r="4" /><rect class="post" x="30" y="46" width="4" height="10" /><rect class="desk" x="20" y="54" width="24" height="5" rx="2" />`,
  blow: `<circle class="face" cx="24" cy="32" r="16" /><circle class="mouth" cx="34" cy="34" r="3" /><path class="burst" d="M42 30 h14 M42 36 h10 M42 42 h14" />`,
};

// Named pictures are drawn; anything else is treated as an emoji
// placeholder until the commissioned symbol set arrives.
export function pic(name, big = false) {
  if (!name) return '';
  if (PICS[name]) return `<svg viewBox="0 0 64 64" class="pic ${big ? 'pic-big' : ''}" aria-hidden="true">${PICS[name]}</svg>`;
  return `<span class="emoji ${big ? 'pic-big' : ''}" aria-hidden="true">${esc(name)}</span>`;
}

export function stamp() {
  return `<svg viewBox="0 0 120 120" class="stamp" aria-hidden="true">
    <circle class="stamp-ring" cx="60" cy="60" r="52" />
    <circle class="stamp-ring thin" cx="60" cy="60" r="44" />
    ${lampHead(60, 52, 'on', 16)}
    <text class="stamp-text" x="60" y="96">DISCOVERY</text>
  </svg>`;
}

export function islandMark() {
  return `<svg viewBox="0 0 160 80" class="island" aria-hidden="true">
    <path class="sea" d="M0 62 q20 -6 40 0 t40 0 t40 0 t40 0 v18 h-160z" />
    <path class="sandbank" d="M30 62 q50 -26 100 0z" />
    <path class="palm-trunk" d="M66 58 q6 -20 0 -40" />
    <path class="palm-leaf" d="M66 18 q-18 -4 -26 6 q14 -8 26 -6 q-4 -14 -18 -16 q16 2 18 16 q10 -14 24 -12 q-16 0 -24 12 q20 0 26 10 q-12 -8 -26 -10z" />
    <rect class="post" x="100" y="34" width="4" height="26" />
    ${lampHead(102, 30, 'on', 7)}
  </svg>`;
}

// ---------- Solar path light ----------

// v: the settings values; r: model result or null before a test.
export function solarScene(v, r) {
  const night = v.time === 'night';
  const shaded = v.site === 'shaded';
  const cloudy = v.weather === 'cloudy';
  const lamp = r ? (r.lamp === 'on' ? 'on' : r.lamp === 'short' ? 'on' : 'off') : 'unknown';
  const clouds = cloudy ? `<path class="cloud" d="M40 60 q14 -26 40 -12 q18 -18 40 4 q22 4 12 22 h-86 q-16 -4 -6 -14z" /><path class="cloud" d="M230 44 q14 -26 40 -12 q18 -18 40 4 q22 4 12 22 h-86 q-16 -4 -6 -14z" />` : '';
  const sky = night ? '<rect class="sky-night" width="400" height="200" /><circle class="moon" cx="330" cy="44" r="14" />'
    : `<rect class="sky-day" width="400" height="200" />${cloudy ? '' : `<circle class="sun" cx="330" cy="44" r="20" />${rays(330, 44, 26, 38, 10)}`}`;
  const tree = shaded ? `<path class="palm-trunk" d="M70 214 q14 -70 34 -130" /><path class="palm-leaf big" d="M104 84 q-60 -20 -90 10 q50 -30 90 -10 q-10 -50 -50 -60 q50 10 50 60 q30 -50 80 -40 q-50 0 -80 40 q60 0 80 34 q-40 -30 -80 -34z" /><path class="shade-patch" d="M110 214 q40 -10 90 0 v8 h-90z" />` : '';
  const store = v.storage === 'battery'
    ? `<path class="metal thin" d="M160 160 V200 H226" /><rect class="cell" x="226" y="186" width="44" height="28" rx="5" />
       <rect class="charge ${r ? r.charge : 'unknown'}" x="231" y="191" width="${r ? (r.charge === 'full' ? 34 : r.charge === 'part' ? 14 : 0) : 0}" height="18" rx="2" />
       <path class="metal thin" d="M270 200 H316 V176" />`
    : '<path class="metal thin" d="M160 160 V200 H316 V176" />';
  return `<svg viewBox="0 0 400 260" class="scene" aria-hidden="true">${sky}${clouds}
    <rect class="sandbank" y="200" width="400" height="60" />
    <g class="planks">${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 52 - 6}" y="230" width="46" height="22" rx="3" />`).join('')}</g>
    ${tree}
    <rect class="post" x="157" y="120" width="6" height="94" />
    <path class="panel" d="M120 104 l80 -14 l10 30 l-80 14z" /><path class="panel-grid" d="M147 99 l10 30 M174 94 l10 30 M125 118 l80 -14" />
    ${store}
    <rect class="post" x="313" y="150" width="6" height="64" />${lampHead(316, 138, lamp, 14)}
    ${night ? '<rect class="shadow" width="400" height="260" />' : ''}
  </svg>`;
}

// ---------- Light and sight ----------

export function lightScene(v, r, object = 'book', controlIds = []) {
  const sunlit = v.room === 'sunlit';
  const on = v.torch === 'on';
  const reach = r ? r.reaches : null;
  const beamEnd = v.blocker === 'card' || v.holes === 'not' ? 200 : 300;
  const beam = on ? `<path class="beam" d="M92 110 L${beamEnd} ${110 - (beamEnd - 92) * 0.25} L${beamEnd} ${110 + (beamEnd - 92) * 0.25}z" />` : '';
  let middle = '';
  if (v.blocker === 'card') middle = '<rect class="card" x="196" y="70" width="12" height="80" rx="2" />';
  if (v.blocker === 'glass') middle = '<rect class="glass" x="196" y="70" width="12" height="80" rx="2" />';
  if (controlIds.includes('holes')) {
    const off = v.holes === 'not' ? 18 : 0;
    middle = `<rect class="card" x="150" y="70" width="10" height="80" /><rect class="ground" x="150" y="105" width="10" height="10" />
      <rect class="card" x="200" y="70" width="10" height="80" /><rect class="ground" x="200" y="${105 + off}" width="10" height="10" />`;
  }
  const OBJECTS = {
    mirror: '<rect class="mirror" x="306" y="74" width="16" height="72" rx="4" />',
    book: '<rect class="book" x="300" y="84" width="34" height="50" rx="3" /><rect class="note" x="306" y="92" width="22" height="6" />',
    shell: '<path d="M296 134q20-52 44 0z" fill="#f2c9b0" stroke="#c98a6a" stroke-width="2" /><path d="M318 134v-40M306 134l8-34M330 134l-8-34" stroke="#c98a6a" stroke-width="1.5" />',
    cup: '<path d="M300 96h32l-4 40h-24z" fill="#4a90d9" /><path d="M332 104q12 2 0 18" fill="none" stroke="#4a90d9" stroke-width="4" />',
    ball: '<circle cx="316" cy="116" r="20" fill="#f08a24" /><path d="M296 116h40M316 96v40" stroke="#fff" stroke-width="2" />',
    toy: '<rect x="300" y="104" width="34" height="30" rx="4" fill="#d9534f" /><circle cx="308" cy="138" r="6" fill="#333" /><circle cx="326" cy="138" r="6" fill="#333" />',
  };
  const obj = OBJECTS[object] || OBJECTS.book;
  const toEye = reach ? '<path class="ray" d="M314 140 L300 206" />' : '';
  const shadow = r?.shadow ? '<rect class="shadow-mark" x="240" y="78" width="16" height="72" rx="3" />' : '';
  const q = r === null ? '<circle class="gap-badge" cx="352" cy="74" r="11" /><text class="gap-mark" x="352" y="79">?</text>' : '';
  return `<svg viewBox="0 0 400 260" class="scene" aria-hidden="true">
    <rect class="${sunlit ? 'wall' : 'sky-night'}" width="400" height="200" /><rect class="floor" y="200" width="400" height="60" />
    ${sunlit ? '<rect class="window" x="20" y="20" width="60" height="50" rx="4" />' : ''}
    ${beam}${shadow}
    <rect class="torch-body" x="30" y="98" width="54" height="24" rx="6" /><path class="torch-head" d="M84 98 l14 -6 v36 l-14 -6z" />
    <circle class="${on ? 'bulb-on' : 'bulb-off'}" cx="94" cy="110" r="6" />
    ${middle}
    <g class="${reach === false ? 'dimmed' : ''}">${obj}</g>
    ${toEye}
    <ellipse class="eye" cx="296" cy="222" rx="24" ry="13" /><circle class="iris" cx="296" cy="222" r="7" />
    ${q}
    ${!sunlit && !reach ? '<rect class="shadow" width="400" height="260" />' : ''}
  </svg>`;
}

export { esc };
