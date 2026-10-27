/* ================= Constants ================= */
const KEY='scienceLagoon.game.power-the-island.v1';
const STEPS=['brief','predict','play','evidence','explain','transfer','summary'];
const STEP_LABEL={brief:'Brief',predict:'Predict',play:'Investigate',evidence:'Evidence',explain:'Explain',transfer:'New problem',summary:'Summary'};
const MAX_TRIALS=12;
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const sameSet=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* ================= Circuit model =================
   Terminals are nodes; conducting connectors, closed switches and bulb filaments are edges.
   Position on screen plays no part: a wire drawn across another is not joined to it. */
const CONDUCTS={metal:true,foil:true,clip:true,plastic:false,wood:false,string:false,rubber:false};
const MAT_NAME={metal:'metal wire',foil:'foil strip',clip:'steel paper clip',plastic:'plastic strip',wood:'wooden stick',string:'string',rubber:'rubber band'};
const matName=m=>m==null?'nothing (gap)':MAT_NAME[m]||'unknown part';
function runModel(L,set){
  const edges=[];
  for(const c of L.connectors){
    const m=set.connectors[c.id];
    if(m===null||m===undefined) continue;
    if(!(m in CONDUCTS)) return {status:'unavailable',reason:'unknown material'};
    if(CONDUCTS[m]) edges.push({u:c.a,v:c.b,bulb:null});
  }
  let src=null;
  for(const k of L.components){
    if(k.type==='battery'){src=k;continue;}
    if(k.type==='switch'){
      const st=set.switches[k.id];
      if(st!=='open'&&st!=='closed') return {status:'unavailable',reason:'unknown switch state'};
      if(st==='closed') edges.push({u:k.a,v:k.b,bulb:null});
    } else if(k.type==='bulb') edges.push({u:k.a,v:k.b,bulb:k.id});
    else return {status:'unavailable',reason:'unknown part'};
  }
  if(!src) return {status:'unavailable',reason:'no energy source'};
  const adj={};
  edges.forEach((e,i)=>{(adj[e.u]=adj[e.u]||[]).push(i);(adj[e.v]=adj[e.v]||[]).push(i);});
  const paths=[],seen=new Set([src.p]),used=[];
  (function dfs(node){
    if(node===src.n){paths.push(used.slice());return;}
    for(const i of adj[node]||[]){
      const e=edges[i],nx=e.u===node?e.v:e.u;
      if(seen.has(nx)) continue;
      seen.add(nx);used.push(i);dfs(nx);used.pop();seen.delete(nx);
    }
  })(src.p);
  if(paths.some(p=>!p.some(i=>edges[i].bulb))) return {status:'unsupported',reason:'short-circuit layout'};
  if(paths.length>1) return {status:'unsupported',reason:'parallel network'};
  const lit={};
  L.components.filter(k=>k.type==='bulb').forEach(b=>lit[b.id]=false);
  if(paths.length===1) paths[0].forEach(i=>{if(edges[i].bulb) lit[edges[i].bulb]=true;});
  return {status:'ok',closed:paths.length===1,lit};
}

/* ================= Solar model =================
   Idealised example rules, not measurements: a panel in open sun by day makes enough electricity
   for the lamp and fully charges a battery store; shade gives too little; a panel makes nothing after dark. */
const SOLAR_KEYS={panel:['yes','no'],site:['sun','shade'],storage:['yes','no'],time:['day','night']};
const SOLAR_LABEL={panel:'Solar panel',site:'Panel spot',storage:'Battery store',time:'Time'};
const SOLAR_VAL={panel:{yes:'fitted',no:'none'},site:{sun:'open sun',shade:'under the palm (shade)'},storage:{yes:'fitted',no:'none'},time:{day:'daytime',night:'after dark'}};
function runSolar(s){
  for(const k in SOLAR_KEYS) if(!SOLAR_KEYS[k].includes(s[k])) return {status:'unavailable',reason:'unknown setting'};
  const generating=s.panel==='yes'&&s.site==='sun'&&s.time==='day';
  const charged=s.storage==='yes'&&s.panel==='yes'&&s.site==='sun';
  return {status:'ok',generating,charged,lit:s.time==='day'?(generating||charged):charged};
}

/* ================= Layouts ================= */
function comp(id,type,ori,cx,cy,name){
  const k={id,type,ori,cx,cy,name};
  if(type==='battery'){k.p=id+'.p';k.n=id+'.n';} else {k.a=id+'.a';k.b=id+'.b';}
  return k;
}
const LAYOUTS={
  path:{id:'path',title:'Path light',viewBox:'0 0 400 260',
    components:[comp('bat','battery','v',60,130,'Battery'),comp('sw','switch','h',200,40,'Switch'),comp('bulb','bulb','v',340,130,'Bulb')],
    connectors:[
      {id:'w1',a:'bat.p',b:'sw.a',d:'M60 100 V40 H170',lab:[115,28],name:'Battery + to switch'},
      {id:'w2',a:'sw.b',b:'bulb.a',d:'M230 40 H340 V100',lab:[285,28],name:'Switch to bulb'},
      {id:'w3',a:'bulb.b',b:'bat.n',d:'M340 160 V222 H60 V160',lab:[200,244],name:'Bulb back to battery −'}],
    path:['start','w1','sw','w2','bulb','w3','end']},
  class:{id:'class',title:'Classroom lamp',viewBox:'0 0 400 260',
    components:[comp('bat','battery','h',200,220,'Battery'),comp('bulb','bulb','h',90,60,'Lamp'),comp('sw','switch','v',340,120,'Switch')],
    connectors:[
      {id:'c1',a:'bat.p',b:'bulb.a',d:'M170 220 H30 V60 H60',lab:[30,150],name:'Battery + to lamp'},
      {id:'c2',a:'bulb.b',b:'sw.a',d:'M120 60 H340 V90',lab:[200,47],name:'Lamp to switch'},
      {id:'c3',a:'sw.b',b:'bat.n',d:'M340 150 V220 H230',lab:[290,242],name:'Switch back to battery −'}],
    loose:{id:'loose',d:'M272 22 V112',ends:[[272,22],[272,112]],lab:[272,13],name:'Loose wire'},
    path:['start','c1','bulb','c2','sw','c3','end']},
  series:{id:'series',title:'Two-bulb noticeboard light',viewBox:'0 0 400 290',
    components:[comp('bat','battery','v',60,130,'Battery'),comp('sw','switch','h',200,40,'Switch'),comp('b1','bulb','v',340,130,'Bulb 1'),comp('b2','bulb','h',200,222,'Bulb 2')],
    connectors:[
      {id:'s1',a:'bat.p',b:'sw.a',d:'M60 100 V40 H170',lab:[115,28],name:'Battery + to switch'},
      {id:'s2',a:'sw.b',b:'b1.a',d:'M230 40 H340 V100',lab:[285,28],name:'Switch to bulb 1'},
      {id:'s3',a:'b1.b',b:'b2.b',d:'M340 160 V222 H230',lab:[296,210],name:'Bulb 1 to bulb 2'},
      {id:'s4',a:'b2.a',b:'bat.n',d:'M170 222 H60 V160',lab:[110,210],name:'Bulb 2 back to battery −'}],
    path:['start','s1','sw','s2','b1','s3','b2','s4','end']},
  room:{id:'room',components:[comp('bat','battery','v',0,0,'Battery'),comp('sw','switch','h',0,0,'Wall switch'),comp('lamp','bulb','v',0,0,'Device')],
    connectors:[{id:'r1',a:'bat.p',b:'sw.a'},{id:'r2',a:'sw.b',b:'lamp.a'},{id:'r3',a:'lamp.b',b:'bat.n'}]}
};
const deviceOn=sw=>{const r=runModel(LAYOUTS.room,{connectors:{r1:'metal',r2:'metal',r3:'metal'},switches:{sw}});return r.status==='ok'&&r.lit.lamp;};
function termPos(k,which){
  const {cx,cy,ori}=k;
  if(ori==='v') return which==='p'||which==='a'?[cx,cy-30]:[cx,cy+30];
  return which==='p'||which==='a'?[cx-30,cy]:[cx+30,cy];
}

/* ================= Pictures =================
   One small symbol library; every card also carries a text label. */
const rays=(cx,cy,r1,r2,n)=>Array.from({length:n||8},(_,i)=>{const a=2*Math.PI*i/(n||8);return `<line class="ray" x1="${(cx+r1*Math.cos(a)).toFixed(1)}" y1="${(cy+r1*Math.sin(a)).toFixed(1)}" x2="${(cx+r2*Math.cos(a)).toFixed(1)}" y2="${(cy+r2*Math.sin(a)).toFixed(1)}"/>`;}).join('');
const SV=b=>`<svg viewBox="0 0 100 100" aria-hidden="true">${b}</svg>`;
const STROKE='style="stroke:var(--ink);stroke-width:3"';
function switchPic(on){
  return SV(`<rect class="sc-surface" x="28" y="10" width="44" height="80" rx="10" ${STROKE}/><rect class="${on?'sc-lagoon':'sc-ink'}" x="38" y="${on?20:50}" width="24" height="30" rx="6"/><text x="50" y="${on?66:40}" text-anchor="middle" class="lbl-strong">${on?'ON':'OFF'}</text>`);
}
const PIC={
  lampOn:()=>SV(`<g class="lit">${rays(50,56,30,42)}<path class="sc-lagoon" d="M30 40 L70 40 L62 22 L38 22Z"/><circle class="glass" cx="50" cy="56" r="17"/></g>`),
  lampOff:()=>SV(`<path class="sc-lagoon" d="M30 40 L70 40 L62 22 L38 22Z"/><circle class="glass" cx="50" cy="56" r="17"/><path class="sc-line" d="M42 56 h16"/>`),
  fan:()=>SV(`<circle class="glass" cx="50" cy="44" r="30"/><g class="sc-lagoon"><ellipse cx="50" cy="29" rx="7" ry="14"/><ellipse cx="63" cy="52" rx="7" ry="14" transform="rotate(120 63 52)"/><ellipse cx="37" cy="52" rx="7" ry="14" transform="rotate(240 37 52)"/></g><circle class="sc-ink" cx="50" cy="44" r="4"/><path class="sc-line" d="M50 74 V90 M36 92 H64"/>`),
  fanOn:()=>SV(`<circle class="glass" cx="50" cy="44" r="30"/><g class="sc-lagoon"><ellipse cx="50" cy="29" rx="7" ry="14"/><ellipse cx="63" cy="52" rx="7" ry="14" transform="rotate(120 63 52)"/><ellipse cx="37" cy="52" rx="7" ry="14" transform="rotate(240 37 52)"/></g><circle class="sc-ink" cx="50" cy="44" r="4"/><path class="sc-line" d="M50 74 V90 M36 92 H64 M86 30 q6 14 0 28 M92 24 q9 20 0 40"/>`),
  switchOn:()=>switchPic(true), switchOff:()=>switchPic(false),
  hands:()=>SV(`<g class="sc-sand"><rect x="24" y="30" width="22" height="46" rx="11" transform="rotate(-14 35 53)" ${STROKE}/><rect x="54" y="30" width="22" height="46" rx="11" transform="rotate(14 65 53)" ${STROKE}/></g>`),
  sun:()=>SV(`<g class="lit">${rays(50,50,26,40)}<circle class="sc-sun" cx="50" cy="50" r="19"/></g>`),
  moon:()=>SV(`<rect class="sc-night" x="8" y="8" width="84" height="84" rx="16"/><path class="sc-moon" d="M58 22 a28 28 0 1 0 16 46 a22 22 0 1 1 -16 -46Z"/>`),
  torch:()=>SV(`<rect class="sc-lagoon" x="14" y="40" width="44" height="22" rx="5" ${STROKE}/><path class="sc-surface" d="M58 36 L76 28 L76 74 L58 66Z" ${STROKE}/><rect class="sc-ink" x="28" y="34" width="10" height="6" rx="2"/>`),
  torchOn:()=>SV(`<path class="glow" d="M76 28 L98 12 L98 90 L76 74Z"/><rect class="sc-lagoon" x="10" y="40" width="44" height="22" rx="5" ${STROKE}/><path class="sc-sun" d="M54 36 L76 28 L76 74 L54 66Z" ${STROKE}/>`),
  radio:()=>SV(`<rect class="sc-lagoon" x="14" y="34" width="72" height="46" rx="8" ${STROKE}/><circle class="sc-surface" cx="36" cy="57" r="13" ${STROKE}/><path class="sc-line" d="M60 50 h16 M60 60 h16 M30 34 L64 14"/>`),
  broom:()=>SV(`<path class="sc-line" d="M62 8 L46 60"/><path class="sc-sand" d="M30 56 L62 64 L56 92 L18 84Z" ${STROKE}/>`),
  handfan:()=>SV(`<path class="sc-coral" d="M50 74 L14 34 A50 50 0 0 1 86 34Z" ${STROKE}/><path class="sc-line" d="M50 74 L50 26 M50 74 L30 30 M50 74 L70 30 M50 74 V94"/>`),
  pencil:()=>SV(`<path class="sc-sun" d="M20 70 L66 24 L78 36 L32 82Z" ${STROKE}/><path class="sc-sand" d="M20 70 L32 82 L14 88Z" ${STROKE}/>`),
  scissors:()=>SV(`<circle class="sc-surface" cx="28" cy="72" r="11" ${STROKE}/><circle class="sc-surface" cx="52" cy="80" r="11" ${STROKE}/><path class="sc-line" d="M34 63 L82 16 M48 70 L66 20"/>`),
  candle:()=>SV(`<rect class="sc-paper" x="38" y="44" width="24" height="44" rx="3" ${STROKE}/><path class="sc-sun" d="M50 12 C60 26 60 36 50 40 C40 36 40 26 50 12Z"/><path class="sc-line" d="M50 40 V44"/>`),
  mirror:()=>SV(`<ellipse class="sc-sky" cx="50" cy="44" rx="26" ry="32" ${STROKE}/><path style="stroke:var(--surface);stroke-width:4;fill:none" d="M36 32 L46 22 M38 46 L58 26"/><path class="sc-line" d="M50 76 V94"/>`),
  book:()=>SV(`<path class="sc-lagoon" d="M14 24 L48 30 L48 84 L14 78Z" ${STROKE}/><path class="sc-coral" d="M86 24 L52 30 L52 84 L86 78Z" ${STROKE}/>`),
  spoon:()=>SV(`<ellipse class="sc-sky" cx="50" cy="30" rx="16" ry="22" ${STROKE}/><path class="sc-line" d="M50 52 V94"/>`),
  eye:()=>SV(`<path class="sc-surface" d="M8 50 Q50 10 92 50 Q50 90 8 50Z" ${STROKE}/><circle class="sc-lagoon" cx="50" cy="50" r="15"/><circle class="sc-ink" cx="50" cy="50" r="6"/>`),
  cable:()=>SV(`<path style="fill:none;stroke:var(--ink);stroke-width:8;stroke-linecap:round" d="M8 70 Q30 50 44 58"/><path style="fill:none;stroke:var(--ink);stroke-width:8;stroke-linecap:round" d="M56 58 Q72 66 92 40"/><path style="stroke:var(--coral);stroke-width:3;fill:none" d="M46 48 l4 -10 l4 10 M44 70 l6 8 l6 -8"/><text x="50" y="26" text-anchor="middle" class="lbl-gap">!</text>`),
  adult:()=>SV(`<circle class="sc-sand" cx="36" cy="26" r="12" ${STROKE}/><path class="sc-lagoon" d="M20 92 V54 a16 16 0 0 1 32 0 V92Z" ${STROKE}/><circle class="sc-sand" cx="72" cy="50" r="8" ${STROKE}/><path class="sc-coral" d="M62 92 V72 a10 10 0 0 1 20 0 V92Z" ${STROKE}/>`),
  stop:()=>SV(`<path class="sc-coral" d="M34 10 H66 L90 34 V66 L66 90 H34 L10 66 V34Z"/><path style="stroke:var(--surface);stroke-width:8;stroke-linecap:round" d="M32 50 H68"/>`),
  bell:()=>SV(`<path class="sc-sun" d="M24 70 C24 40 32 24 50 24 C68 24 76 40 76 70Z" ${STROKE}/><path class="sc-line" d="M18 72 H82 M50 14 V24"/><circle class="sc-ink" cx="50" cy="80" r="6"/>`),
  toycar:()=>SV(`<path class="sc-coral" d="M10 66 V50 L28 50 L38 34 H66 L78 50 H90 V66Z" ${STROKE}/><circle class="sc-ink" cx="30" cy="70" r="9"/><circle class="sc-ink" cx="72" cy="70" r="9"/>`),
  tv:()=>SV(`<rect class="sc-window" x="12" y="18" width="76" height="52" rx="6" ${STROKE}/><path class="sc-line" d="M40 84 H60 M50 70 V84"/>`),
  window:()=>SV(`<rect class="sc-sky" x="18" y="12" width="64" height="76" rx="4" ${STROKE}/><path class="sc-line" d="M50 12 V88 M18 50 H82"/><circle class="sc-sun" cx="36" cy="30" r="8"/>`),
  water:()=>SV(`<path class="sc-sea" d="M50 10 C64 34 76 48 76 64 a26 26 0 0 1 -52 0 C24 48 36 34 50 10Z" ${STROKE}/>`),
  pathlight:()=>SV(`<rect class="sc-night" x="6" y="6" width="88" height="88" rx="14"/><circle class="glow" cx="50" cy="32" r="22"/><rect class="sc-moon" x="47" y="34" width="6" height="52"/><path class="sc-lagoon" d="M36 32 h28 l-6 -12 h-16Z"/><circle class="sc-sun" cx="50" cy="36" r="6"/>`),
  wall:()=>SV(`<rect class="sc-paper" x="10" y="10" width="80" height="80" rx="6" ${STROKE}/><path class="sc-ink" d="M38 74 V44 a6 6 0 0 1 12 0 V36 a6 6 0 0 1 12 0 V74Z" opacity=".75"/>`),
  glass:()=>SV(`<path class="sc-sky" d="M26 14 H74 L68 88 H32Z" style="stroke:var(--ink);stroke-width:3;opacity:.7"/><path style="stroke:var(--surface);stroke-width:4" d="M38 24 L36 60"/>`),
  wood:()=>SV(`<rect class="sc-wood" x="10" y="38" width="80" height="24" rx="4" ${STROKE}/><path style="stroke:var(--sand);stroke-width:2;fill:none" d="M18 46 h30 M40 54 h40"/>`),
  foil:()=>SV(`<path class="sc-plast" style="fill:var(--plastic);stroke:var(--ink);stroke-width:3" d="M12 30 L80 20 L88 70 L20 80Z"/><path style="stroke:var(--surface);stroke-width:3;fill:none" d="M28 40 l20 -4 M30 60 l36 -6"/>`),
  cloth:()=>SV(`<path class="sc-ink" d="M14 24 Q50 14 86 24 L80 80 Q50 90 20 80Z" opacity=".85"/>`),
  cardboard:()=>SV(`<rect class="sc-sand" x="14" y="28" width="72" height="50" rx="3" ${STROKE}/><path style="stroke:var(--wood);stroke-width:3" d="M14 42 H86"/>`),
  phone:()=>SV(`<rect class="sc-ink" x="30" y="10" width="40" height="80" rx="8"/><rect class="sc-window" x="35" y="18" width="30" height="58" rx="2"/>`),
  battery:()=>SV(`<rect class="sc-lagoon" x="16" y="32" width="62" height="36" rx="5" ${STROKE}/><rect class="sc-ink" x="78" y="42" width="8" height="16" rx="2"/><text x="34" y="56" text-anchor="middle" class="lbl-strong" style="fill:var(--on-lagoon)">+</text>`),
  panel:()=>SV(`<path class="sc-window" d="M14 30 L86 22 L90 66 L18 74Z" ${STROKE}/><path style="stroke:var(--surface);stroke-width:2" d="M38 27 L42 71 M62 25 L66 69 M16 52 L88 44"/><path class="sc-line" d="M54 72 V92"/>`),
  tree:()=>SV(palmShape(46,96,.62)),
  symBattery:()=>SV(`<path class="sym" d="M10 50 H42 M42 26 V74 M58 50 H90"/><path class="sym" style="stroke-width:7" d="M58 38 V62"/>`),
  symBattery2:()=>SV(`<path class="sym" d="M50 10 V42 M26 42 H74 M50 58 V90"/><path class="sym" style="stroke-width:7" d="M38 58 H62"/>`),
  symSwitchOpen:()=>SV(`<path class="sym" d="M10 60 H28 L66 34 M72 60 H90"/><circle class="term" cx="28" cy="60" r="5"/><circle class="term" cx="72" cy="60" r="5"/>`),
  symSwitchClosed:()=>SV(`<path class="sym" d="M10 60 H90"/><circle class="term" cx="28" cy="60" r="5"/><circle class="term" cx="72" cy="60" r="5"/>`),
  symBulb:()=>SV(`<path class="sym" d="M8 50 H28 M72 50 H92"/><circle class="glass" cx="50" cy="50" r="22"/><path class="sym" d="M35 35 L65 65 M65 35 L35 65"/>`),
  heat:()=>SV(`<path style="fill:none;stroke:var(--coral);stroke-width:5;stroke-linecap:round" d="M30 86 q-10 -14 0 -28 q10 -14 0 -28 M50 86 q-10 -14 0 -28 q10 -14 0 -28 M70 86 q-10 -14 0 -28 q10 -14 0 -28"/>`),
  wire:()=>SV(`<path style="fill:none;stroke:var(--copper);stroke-width:7;stroke-linecap:round" d="M10 70 C30 20 70 80 90 30"/>`),
  boat:()=>SV(`<path class="sc-sea" d="M0 80 H100 V100 H0Z"/><path class="sc-coral" d="M12 62 H88 L78 80 H22Z" ${STROKE}/><rect class="sc-ink" x="62" y="46" width="14" height="16"/>`),
  bike:()=>SV(`<circle class="sc-surface" cx="26" cy="66" r="16" ${STROKE}/><circle class="sc-surface" cx="74" cy="66" r="16" ${STROKE}/><path class="sc-line" d="M26 66 L44 40 L68 40 L74 66 M44 40 L52 66 L68 40 M40 32 H50"/>`),
  cooker:()=>SV(`<rect class="sc-surface" x="18" y="34" width="64" height="48" rx="12" ${STROKE}/><path class="sc-lagoon" d="M24 34 a26 12 0 0 1 52 0Z"/><path style="fill:none;stroke:var(--coral);stroke-width:4;stroke-linecap:round" d="M40 22 q-6 -8 0 -16 M60 22 q-6 -8 0 -16"/>`),
  computer:()=>SV(`<rect class="sc-window" x="16" y="16" width="68" height="46" rx="5" ${STROKE}/><path class="sc-sand" d="M8 70 H92 L84 84 H16Z" ${STROKE}/>`)
};
const picHTML=(k,size)=>k&&PIC[k]?PIC[k]().replace('<svg',`<svg style="width:${size||52}px;height:${size||52}px;flex:none"`):'';

/* ================= Scenes ================= */
function palmShape(x,y,s){return `<g transform="translate(${x} ${y}) scale(${s})"><path class="sc-wood" d="M-4 0 C-2 -40 6 -70 14 -96 L20 -94 C12 -68 6 -40 6 0Z"/><g class="sc-leaf"><ellipse cx="38" cy="-98" rx="26" ry="7" transform="rotate(14 38 -98)"/><ellipse cx="-6" cy="-100" rx="26" ry="7" transform="rotate(-18 -6 -100)"/><ellipse cx="18" cy="-114" rx="7" ry="22"/><ellipse cx="36" cy="-82" rx="22" ry="6" transform="rotate(40 36 -82)"/><ellipse cx="2" cy="-84" rx="22" ry="6" transform="rotate(-40 2 -84)"/></g></g>`;}
function islandBand(decos){
  return `<svg viewBox="0 0 760 210" role="img" aria-label="A small island at dusk with a palm tree, a noticeboard, a solar panel and a path light.">
  <rect class="sc-sky" width="760" height="210"/><circle class="sc-sun" cx="660" cy="60" r="30" opacity=".85"/>
  <rect class="sc-sea" y="128" width="760" height="82"/><path class="sc-sand" d="M140 210 C220 128 540 110 660 210Z"/>
  ${palmShape(250,170,1)}
  <g transform="translate(400 118)"><rect class="sc-wood" x="6" y="30" width="6" height="34"/><rect class="sc-wood" x="70" y="30" width="6" height="34"/><rect class="sc-wood" x="0" y="0" width="82" height="40" rx="4"/><rect class="sc-paper" x="8" y="6" width="28" height="26" rx="2"/><rect class="sc-paper" x="42" y="6" width="32" height="18" rx="2"/></g>
  <g transform="translate(330 120)"><path class="sc-window" d="M-24 0 L24 -6 L26 18 L-22 24Z" style="stroke:var(--ink);stroke-width:2"/><rect class="sc-ink" x="-2" y="20" width="4" height="40"/></g>
  <g transform="translate(560 94)"><rect class="sc-ink" x="-3" y="10" width="6" height="74"/><path class="sc-lagoon" d="M-14 12 h28 l-6 -14 h-16Z"/><g class="lit"><circle class="glass" cx="0" cy="18" r="7"/></g></g>${(decos||[]).map(decoSVG).join('')}</svg>`;
}
function pathScene(lightOn,switchOn){
  return `<svg viewBox="0 0 400 170" role="img" aria-label="Evening at the noticeboard path. The path light is ${lightOn?'on':'off'}${switchOn===undefined?'':` and its wall switch shows ${switchOn?'ON':'OFF'}`}.">
  <rect class="sc-sky" width="400" height="170"/><rect class="sc-sea" y="96" width="400" height="74"/>
  <path class="sc-sand" d="M0 170 C80 112 250 104 400 130 V170Z"/>${palmShape(56,150,.9)}
  <g transform="translate(150 86)"><rect class="sc-wood" x="6" y="34" width="6" height="34"/><rect class="sc-wood" x="84" y="34" width="6" height="34"/><rect class="sc-wood" width="96" height="44" rx="4"/><rect class="sc-paper" x="8" y="7" width="34" height="30" rx="2"/><rect class="sc-paper" x="50" y="7" width="38" height="20" rx="2"/></g>
  <g transform="translate(300 52)">${lightOn?'<circle class="glow" cx="0" cy="20" r="34"/>':''}<rect class="sc-ink" x="-3" y="18" width="6" height="84"/><path class="sc-lagoon" d="M-16 16 h32 l-7 -16 h-18Z"/><g class="${lightOn?'lit':''}"><circle class="glass" cx="0" cy="24" r="8"/></g></g>
  ${switchOn===undefined?'':`<g transform="translate(332 104) scale(.42)">${switchPic(switchOn).replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g>`}</svg>`;
}
function classroomScene(lampOn,fan){
  const f=fan===undefined?'':`<g transform="translate(96 112)"><circle class="glass" cx="0" cy="0" r="22"/><g class="sc-lagoon">${fan?'<ellipse cx="0" cy="-10" rx="16" ry="5" transform="rotate(20)"/><ellipse cx="0" cy="10" rx="16" ry="5" transform="rotate(20)"/>':'<ellipse cx="0" cy="-11" rx="4" ry="10"/><ellipse cx="9" cy="6" rx="4" ry="10" transform="rotate(120 9 6)"/><ellipse cx="-9" cy="6" rx="4" ry="10" transform="rotate(240 -9 6)"/>'}</g><circle class="sc-ink" r="3"/><path class="sc-line" d="M0 22 V38 M-12 38 H12${fan?' M30 -14 q6 14 0 28 M38 -20 q9 20 0 40':''}"/></g>`;
  return `<svg viewBox="0 0 400 190" role="img" aria-label="An island classroom. The ceiling lamp is ${lampOn?'on':'off'}${fan===undefined?'':fan?' and the desk fan is spinning':' and the desk fan is still'}.">
  <rect class="${lampOn?'sc-wall':'sc-dim'}" width="400" height="190"/>
  <rect class="sc-window" x="26" y="26" width="92" height="60" rx="6"/><path class="sc-line" d="M72 26 V86 M26 56 H118"/>
  <rect class="sc-wood" y="150" width="400" height="40" opacity=".55"/>
  <g transform="translate(150 132)"><rect class="sc-wood" width="80" height="10" rx="3"/><rect class="sc-wood" x="6" y="10" width="6" height="26"/><rect class="sc-wood" x="68" y="10" width="6" height="26"/></g>
  <g transform="translate(270 132)"><rect class="sc-wood" width="80" height="10" rx="3"/><rect class="sc-wood" x="6" y="10" width="6" height="26"/><rect class="sc-wood" x="68" y="10" width="6" height="26"/></g>
  <line x1="250" y1="0" x2="250" y2="28" style="stroke:var(--ink);stroke-width:3"/>${lampOn?'<circle class="glow" cx="250" cy="50" r="60"/>':''}
  <g class="${lampOn?'lit':''}">${lampOn?[200,225,250,275,300].map(x=>`<line class="ray" x1="${250+(x-250)*.5}" y1="62" x2="${x}" y2="84"/>`).join(''):''}<path class="sc-lagoon" d="M222 46 h56 l-10 -18 h-36Z"/><circle class="glass" cx="250" cy="54" r="12"/></g>${f}</svg>`;
}
function solarScene(s,res){
  const night=s.time==='night', lit=res&&res.status==='ok'?res.lit:null;
  const px=s.site==='sun'?70:200;
  const panel=s.panel==='yes'?`<g transform="translate(${px} 96)"><path class="sc-window" d="M-30 0 L30 -8 L33 22 L-27 30Z" style="stroke:var(--ink);stroke-width:2.5"/><path style="stroke:var(--surface);stroke-width:1.5" d="M-10 -2 L-7 28 M10 -5 L13 25 M-28 14 L31 7"/><rect class="sc-ink" x="-2" y="26" width="4" height="40"/></g>`:`<text x="${px}" y="130" text-anchor="middle" class="lbl">no panel</text>`;
  const store=s.storage==='yes'?`<g transform="translate(300 150)"><rect class="sc-lagoon" x="-18" y="-12" width="36" height="22" rx="4" style="stroke:var(--ink);stroke-width:2"/><text x="0" y="4" text-anchor="middle" class="lbl-strong" style="fill:var(--on-lagoon);font-size:10px">store</text></g>`:'';
  const wire=s.panel==='yes'?`<path style="fill:none;stroke:var(--copper);stroke-width:3" d="M${px} 160 V172 H${s.storage==='yes'?282:330} ${s.storage==='yes'?'M318 160 H330 V':'V'}150"/>`:'';
  const status=lit===null?'not tested':lit?'ON':'OFF';
  return `<svg viewBox="0 0 400 200" role="img" aria-label="Solar path light model. ${night?'After dark':'Daytime'}. Panel ${SOLAR_VAL.panel[s.panel]}${s.panel==='yes'?' in '+SOLAR_VAL.site[s.site]:''}. Battery store ${SOLAR_VAL.storage[s.storage]}. Lamp ${status}.">
  <rect class="${night?'sc-night':'sc-sky'}" width="400" height="200"/>
  ${night?'<path class="sc-moon" d="M352 18 a20 20 0 1 0 12 32 a16 16 0 1 1 -12 -32Z"/>':`<g class="lit">${rays(350,36,22,32)}<circle class="sc-sun" cx="350" cy="36" r="16"/></g>`}
  <path class="sc-sand" d="M0 200 V160 Q200 140 400 160 V200Z"/>
  ${palmShape(196,170,1.05)}${s.site==='shade'||true?'':''}
  <path d="M150 70 Q200 40 250 70 L262 168 H138Z" style="fill:var(--ink);opacity:.12"/>
  ${panel}${wire}${store}
  <g transform="translate(330 70)">${lit?'<circle class="glow" cx="0" cy="12" r="34"/>':''}<rect class="sc-ink" x="-3" y="12" width="6" height="80"/><path class="sc-lagoon" d="M-16 10 h32 l-7 -16 h-18Z"/><g class="${lit?'lit':''}">${lit?rays(0,18,12,20):''}<circle class="glass" cx="0" cy="18" r="8"/></g></g>
  <text x="330" y="190" text-anchor="middle" class="lbl-strong">lamp ${status}</text></svg>`;
}
function sceneHTML(key){
  if(key==='classroom') return classroomScene(false);
  if(key==='classroomLit') return classroomScene(true);
  if(key==='path') return pathScene(false);
  if(key==='pathLit') return pathScene(true);
  if(key==='solar') return solarScene({panel:'yes',site:'sun',storage:'no',time:'day'},null);
  return islandBand();
}

/* ================= Content helpers ================= */
const O=a=>({id:a[0],label:a[1],ok:!!a[2],fb:a[3]||'',pic:a[4]});
const cond=v=>v!=null&&CONDUCTS[v]===true;
const isClosed=s=>s.switches.sw==='closed';
const allOn=r=>r.status==='ok'&&Object.values(r.lit).every(Boolean);
const allOff=r=>r.status==='ok'&&Object.values(r.lit).every(v=>!v);
const has=f=>T=>T.some(x=>f(x.s,x.r,x));
const vals=s=>Object.values(s.connectors);
function onlyDiffer(a,b,key){
  if(!sameSet(a.switches,b.switches)) return false;
  for(const k in a.connectors) if(k!==key&&a.connectors[k]!==b.connectors[k]) return false;
  return a.connectors[key]!==b.connectors[key];
}
function oneGapIn(s,ids){const g=Object.keys(s.connectors).filter(k=>s.connectors[k]==null);return g.length===1&&ids.includes(g[0])&&vals(s).filter(v=>v!=null).every(v=>v==='metal');}
