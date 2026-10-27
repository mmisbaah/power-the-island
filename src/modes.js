/* ================= Rewards =================
   Sparks are earned by playing and spent only on looks (companions, island decorations).
   Nothing bought changes a science result. Mission sparks and badges are recomputed from
   mission records; only extra-game tallies are stored, bounded and validated on load. */
const SHOP=[
  {id:'turtle',type:'companion',name:'Turtle',price:0,desc:'Your first island friend.'},
  {id:'crab',type:'companion',name:'Crab',price:40,desc:'Walks sideways, thinks straight.'},
  {id:'fish',type:'companion',name:'Reef fish',price:60,desc:'Bright as a lagoon.'},
  {id:'bird',type:'companion',name:'Seabird',price:90,desc:'Sees the whole island from above.'},
  {id:'flag',type:'deco',name:'Island flag',price:20,desc:'Flies over the sand.'},
  {id:'boat',type:'deco',name:'Sailing dhoni',price:30,desc:'Floats past the island.'},
  {id:'hammock',type:'deco',name:'Hammock',price:35,desc:'For resting between missions.'},
  {id:'dolphins',type:'deco',name:'Dolphins',price:50,desc:'Jump in the lagoon.'},
  {id:'lighthouse',type:'deco',name:'Lighthouse',price:70,desc:'Guides boats at night.'},
  {id:'fireworks',type:'deco',name:'Celebration lights',price:120,desc:'Sparkles in the sky.'}
];
const LEVELS=[[0,'Spark Spotter'],[40,'Switch Flipper'],[100,'Wire Wrangler'],[180,'Loop Builder'],[280,'Solar Helper'],[400,'Energy Detective'],[550,'Island Engineer'],[750,'Power Keeper'],[1000,'Island Hero']];
const BADGES=[
  ['first-light','First light','Finish your first mission.','lampOn',c=>c.fin>=1],
  ['bright-five','Bright five','Finish 5 missions.','torchOn',c=>c.fin>=5],
  ['twenty','Twenty lights','Finish 20 missions.','pathlight',c=>c.fin>=20],
  ['island-lit','Island lit','Switch on all 10 lights on one island.','tree',c=>c.lit>=1],
  ['island-chain','Island chain','Light up 3 whole islands.','boat',c=>c.lit>=3],
  ['all-islands','Power the Island','Switch on all 60 lights.','sun',c=>c.fin>=60],
  ['on-my-own','On my own','Solve 3 new problems with no hints.','eye',c=>c.demo>=3],
  ['clear-thinker','Clear thinker','Finish 5 missions without any hints.','book',c=>c.perfect>=5],
  ['fixer','Circuit fixer','Finish 3 circuit-model missions.','symBulb',c=>(c.eng.circuit||0)>=3],
  ['sun-catcher','Sun catcher','Finish 3 solar-model missions.','panel',c=>(c.eng.solar||0)>=3],
  ['sorter','Super sorter','Finish 5 sorting missions.','cardboard',c=>(c.eng.sort||0)>=5],
  ['step-by-step','Step by step','Finish 3 put-in-order missions.','wire',c=>(c.eng.sequence||0)>=3],
  ['quiz-starter','Quiz starter','Finish a quick quiz.','bell',c=>c.quiz.length>=1],
  ['quiz-ace','Quiz ace','Get 5 out of 5 first try in a quick quiz.','sun',c=>c.quiz.includes(5)],
  ['regular','Regular visitor','Do the daily challenge on 3 different days.','moon',c=>c.daily.length>=3],
  ['pair-finder','Pair finder','Finish a Spark Pairs game.','mirror',c=>c.match>=1],
  ['tinkerer','Tinkerer','Run 10 tests in the Workshop.','battery',c=>c.workshop>=10],
  ['decorator','Island decorator','Get your first item from the shop.','hands',c=>c.owned>=1]
];
function freshRewards(){return {owned:[],equip:{companion:'turtle',hide:[]},quiz:[],daily:[],match:0,workshop:0,seen:[],seenLevel:0};}
function cleanRewards(r){
  const out=freshRewards();if(!r||typeof r!=='object') return out;
  const ids=SHOP.filter(i=>i.price>0).map(i=>i.id);
  if(Array.isArray(r.owned)) out.owned=r.owned.filter((x,i,a)=>ids.includes(x)&&a.indexOf(x)===i);
  if(r.equip){if(SHOP.some(i=>i.type==='companion'&&i.id===r.equip.companion)) out.equip.companion=r.equip.companion;if(Array.isArray(r.equip.hide)) out.equip.hide=r.equip.hide.filter(x=>ids.includes(x));}
  if(Array.isArray(r.quiz)) out.quiz=r.quiz.filter(n=>Number.isInteger(n)&&n>=0&&n<=5).slice(-300);
  if(Array.isArray(r.daily)) out.daily=r.daily.filter((x,i,a)=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&a.indexOf(x)===i).slice(-400);
  if(Number.isInteger(r.match)) out.match=Math.max(0,Math.min(1000,r.match));
  if(Number.isInteger(r.workshop)) out.workshop=Math.max(0,Math.min(100000,r.workshop));
  if(Array.isArray(r.seen)) out.seen=r.seen.filter(x=>BADGES.some(b=>b[0]===x));
  if(Number.isInteger(r.seenLevel)) out.seenLevel=Math.max(0,Math.min(LEVELS.length-1,r.seenLevel));
  return out;
}
const R=()=>S.rewards;
function missionStars(d,ms){
  const st=statusOf(d,ms);
  if(!(st.demonstrated||st.assisted)) return 0;
  return st.demonstrated?(hintsUsed(ms)===0?3:2):1;
}
const STAR_SPARKS=[0,10,15,20];
function progressCtx(){
  const c={fin:0,demo:0,perfect:0,lit:0,eng:{},stars:0,missionSparks:0};
  for(let g=1;g<=6;g++){
    let n=0;
    for(const d of Object.values(MISSIONS).filter(x=>x.grade===g)){
      const s=missionStars(d,S.missions[d.id]);
      if(s){n++;c.fin++;c.eng[d.play.engine]=(c.eng[d.play.engine]||0)+1;c.stars+=s;c.missionSparks+=STAR_SPARKS[s];if(s>=2)c.demo++;if(s===3)c.perfect++;}
    }
    if(n===10) c.lit++;
  }
  const r=R();Object.assign(c,{quiz:r.quiz,daily:r.daily,match:r.match,workshop:r.workshop,owned:r.owned.length});
  c.badges=BADGES.filter(b=>b[4](c)).map(b=>b[0]);
  c.earned=c.missionSparks+r.quiz.reduce((a,n)=>a+2*n,0)+15*r.daily.length+5*r.match+10*c.badges.length;
  c.spent=r.owned.reduce((a,id)=>a+(SHOP.find(i=>i.id===id)||{price:0}).price,0);
  c.balance=c.earned-c.spent;
  c.level=LEVELS.reduce((a,l,i)=>c.earned>=l[0]?i:a,0);
  return c;
}
/* Saved purchases that cost more than was ever earned are dropped (stale or edited data). */
function reconcileRewards(){let c=progressCtx();while(c.balance<0&&R().owned.length){R().owned.pop();c=progressCtx();}}
const levelTitle=i=>LEVELS[i][1];
function levelBar(c){
  const cur=LEVELS[c.level],next=LEVELS[c.level+1];
  const pct=next?Math.round(100*(c.earned-cur[0])/(next[0]-cur[0])):100;
  return `<div class="lvl"><div class="lvl-top"><b>Level ${c.level+1} · ${esc(cur[1])}</b><span class="muted small">${next?`${next[0]-c.earned} sparks to ${esc(next[1])}`:'Top level reached'}</span></div>
  <div class="bar" role="progressbar" aria-label="Level progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div></div>`;
}
const sparkIcon=`<svg class="spark-ic" viewBox="0 0 24 24" aria-hidden="true"><path class="sc-sun" d="M13 2 L5 13 h6 l-2 9 l9 -12 h-6 l2 -8Z" style="stroke:var(--sun-deep);stroke-width:1.2;stroke-linejoin:round"/></svg>`;
function starsHTML(n,label){return `<span class="stars" aria-label="${n} of 3 stars${label?': '+label:''}">${[1,2,3].map(i=>`<span class="${i<=n?'on':''}" aria-hidden="true">★</span>`).join('')}</span>`;}
const STAR_TEXT=['Not finished yet','Finished','New problem solved on your own','Finished with no hints at all'];
function medal(b,on){return `<svg viewBox="0 0 100 100" class="medal${on?' on':''}" aria-hidden="true"><circle cx="50" cy="50" r="44" class="${on?'sc-sun':'sc-surface'}" style="stroke:${on?'var(--sun-deep)':'var(--line)'};stroke-width:4"/><g transform="translate(22 22) scale(.56)" ${on?'':'opacity=".35"'}>${PIC[b[3]]().replace(/^<svg[^>]*>|<\/svg>$/g,'')}</g></svg>`;}

/* Companions */
function companionSVG(id,mood){
  const smile=`<path d="M80 39 q5 ${mood==='happy'?4:2} 9 0" style="fill:none;stroke:var(--ink);stroke-width:1.8;stroke-linecap:round"/>`;
  if(id==='crab') return `<svg class="turtle" viewBox="0 0 100 80" aria-hidden="true"><path d="M14 30 q-8 -14 6 -18 q-2 8 6 10 M86 30 q8 -14 -6 -18 q2 8 -6 10" style="fill:var(--coral);stroke:var(--ink);stroke-width:2"/><path d="M30 64 l-10 10 M38 66 l-6 12 M70 64 l10 10 M62 66 l6 12" style="stroke:var(--coral);stroke-width:4;stroke-linecap:round"/><ellipse cx="50" cy="52" rx="32" ry="18" style="fill:var(--coral);stroke:var(--ink);stroke-width:2.5"/><path d="M42 34 V24 M58 34 V24" style="stroke:var(--ink);stroke-width:2.5"/><circle cx="42" cy="22" r="4.5" class="sc-surface" style="stroke:var(--ink);stroke-width:2"/><circle cx="58" cy="22" r="4.5" class="sc-surface" style="stroke:var(--ink);stroke-width:2"/><circle cx="43" cy="22" r="2" class="sc-ink"/><circle cx="59" cy="22" r="2" class="sc-ink"/><path d="M44 56 q6 ${mood==='happy'?6:3} 12 0" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/></svg>`;
  if(id==='fish') return `<svg class="turtle" viewBox="0 0 100 80" aria-hidden="true"><path d="M16 40 L2 24 L2 56Z" style="fill:var(--sun);stroke:var(--ink);stroke-width:2.5;stroke-linejoin:round"/><ellipse cx="54" cy="40" rx="38" ry="24" style="fill:var(--sun);stroke:var(--ink);stroke-width:2.5"/><path d="M36 20 q4 20 0 40 M52 17 q4 23 0 46" style="fill:none;stroke:var(--coral);stroke-width:5"/><circle cx="76" cy="34" r="5" class="sc-surface" style="stroke:var(--ink);stroke-width:2"/><circle cx="77" cy="34" r="2.4" class="sc-ink"/><path d="M78 48 q5 ${mood==='happy'?4:2} 9 -2" style="fill:none;stroke:var(--ink);stroke-width:2;stroke-linecap:round"/></svg>`;
  if(id==='bird') return `<svg class="turtle" viewBox="0 0 100 80" aria-hidden="true"><path d="M20 70 l8 -12 M40 70 l-4 -12" style="stroke:var(--sun-deep);stroke-width:3;stroke-linecap:round"/><ellipse cx="42" cy="46" rx="30" ry="18" class="sc-surface" style="stroke:var(--ink);stroke-width:2.5"/><path d="M22 42 q18 -24 40 -4 q-20 6 -40 4Z" style="fill:var(--plastic);stroke:var(--ink);stroke-width:2"/><circle cx="72" cy="30" r="13" class="sc-surface" style="stroke:var(--ink);stroke-width:2.5"/><path d="M84 30 l14 4 l-14 4Z" style="fill:var(--sun-deep);stroke:var(--ink);stroke-width:1.5"/><circle cx="76" cy="27" r="2.4" class="sc-ink"/>${mood==='happy'?'<path d="M66 22 q4 -3 8 0" style="fill:none;stroke:var(--ink);stroke-width:1.5"/>':''}</svg>`;
  return `<svg class="turtle" viewBox="0 0 100 80" aria-hidden="true"><ellipse class="sc-leaf" cx="22" cy="58" rx="12" ry="6" transform="rotate(-25 22 58)"/><ellipse class="sc-leaf" cx="74" cy="60" rx="12" ry="6" transform="rotate(25 74 60)"/><circle class="sc-leaf" cx="82" cy="34" r="12"/><circle class="sc-ink" cx="86" cy="31" r="2.2"/>${smile}<ellipse class="sc-lagoon" cx="46" cy="44" rx="32" ry="22" style="stroke:var(--ink);stroke-width:2.5"/><path d="M46 24 L46 64 M22 36 L70 52 M22 52 L70 36" style="stroke:var(--on-lagoon);stroke-width:2;opacity:.6"/></svg>`;
}

/* Decorations drawn onto the home island */
const shownDecos=()=>R().owned.filter(id=>SHOP.find(i=>i.id===id).type==='deco'&&!R().equip.hide.includes(id));
function decoSVG(id){
  return {
    flag:`<g transform="translate(476 64)"><rect class="sc-ink" x="0" y="0" width="3" height="56"/><path class="sc-coral" d="M3 2 h30 l-8 9 l8 9 h-30Z"/></g>`,
    boat:`<g transform="translate(600 150)"><path class="sc-wood" d="M0 18 h70 l-10 14 h-50Z"/><rect class="sc-ink" x="33" y="-30" width="3" height="48"/><path class="sc-paper" d="M37 -28 L64 12 H37Z" style="stroke:var(--ink);stroke-width:1.5"/></g>`,
    hammock:`<g transform="translate(270 124)"><path d="M0 0 Q40 26 80 0" style="fill:none;stroke:var(--coral);stroke-width:6;stroke-linecap:round"/><rect class="sc-wood" x="76" y="-24" width="5" height="44"/></g>`,
    dolphins:`<g transform="translate(40 168)"><path class="sc-lagoon" d="M0 20 Q20 -10 46 10 L52 4 L50 16 Q30 6 10 24Z" style="stroke:var(--ink);stroke-width:1.5"/><path class="sc-lagoon" d="M60 24 Q76 2 96 16 L100 10 L99 20 Q84 12 68 28Z" style="stroke:var(--ink);stroke-width:1.5"/></g>`,
    lighthouse:`<g transform="translate(712 70)"><path class="sc-ink" d="M-20 100 h40 l-6 -12 h-28Z" opacity=".6"/><path class="sc-paper" d="M-10 88 L-6 20 H6 L10 88Z" style="stroke:var(--ink);stroke-width:2"/><path class="sc-coral" d="M-8.5 60 h17 l1 12 h-19Z M-7.2 36 h14.4 l.7 10 h-15.8Z"/><rect class="sc-sun" x="-7" y="8" width="14" height="12" style="stroke:var(--ink);stroke-width:2"/><path class="sc-ink" d="M-10 8 h20 l-10 -10Z"/></g>`,
    fireworks:`<g class="lit">${rays(180,46,8,22,10)}${rays(520,36,6,18,10)}${rays(330,28,5,14,8)}</g>`
  }[id]||'';
}

/* ================= Shared nav for the main screens ================= */
const TABS=[['home','Home'],['games','Games'],['badges','Badges'],['shop','Shop']];
function tabsHTML(){
  return `<nav class="tabs" aria-label="Main">${TABS.map(([v,l])=>`<button type="button" class="tab" id="tab-${v}" data-action="view" data-v="${v}" ${UI.view===v?'aria-current="page"':''}>${l}</button>`).join('')}</nav>`;
}
function playerCard(c){
  return `<section class="panel player" aria-label="Your progress"><div class="player-row">${companionSVG(R().equip.companion,'happy')}
    <div class="stack" style="flex:1;min-width:0;gap:6px">${levelBar(c)}
    <div class="statrow"><span class="stat">${sparkIcon}<b>${c.balance}</b> sparks</span><span class="stat"><span class="stars"><span class="on" aria-hidden="true">★</span></span><b>${c.stars}</b> of 180 stars</span><span class="stat">🏅 <b>${c.badges.length}</b> of ${BADGES.length} badges</span></div></div></div></section>`;
}

/* ================= Toasts (badge and level announcements) ================= */
/* One announcement at a time, so a burst of rewards never covers the screen. Taps pass through to the page. */
const toastQueue=[];let toastBusy=false;
function toast(html,text){toastQueue.push([html,text]);if(!toastBusy) nextToast();}
function nextToast(){
  const box=document.getElementById('toasts'),item=toastQueue.shift();
  if(!box||!item){toastBusy=false;return;}
  toastBusy=true;
  const t=document.createElement('div');t.className='toast';t.innerHTML=item[0]+(toastQueue.length?`<span class="more">+${toastQueue.length}</span>`:'');box.appendChild(t);announce(item[1]);
  let gone=false;
  const close=()=>{if(gone) return;gone=true;t.classList.add('out');setTimeout(()=>{t.remove();nextToast();},S.prefs.reducedMotion?0:350);};
  setTimeout(close,3200);
}
function checkRewards(){
  if(!S.rewards) return;
  const c=progressCtx(),r=R();let changed=false;
  for(const id of c.badges) if(!r.seen.includes(id)){
    r.seen.push(id);changed=true;const b=BADGES.find(x=>x[0]===id);
    toast(`${medal(b,true)}<div><b>Badge earned: ${esc(b[1])}</b><br><span class="small">${esc(b[2])} +10 sparks</span></div>`,`Badge earned: ${b[1]}. Plus 10 sparks.`);sfx('stamp');
  }
  if(c.level>r.seenLevel){r.seenLevel=c.level;changed=true;toast(`${companionSVG(r.equip.companion,'happy')}<div><b>Level ${c.level+1}!</b><br><span class="small">You are now a ${esc(levelTitle(c.level))}.</span></div>`,`Level up. You are now a ${levelTitle(c.level)}.`);}
  if(changed) save();
}

/* ================= Games menu ================= */
const todayKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
function gamesHTML(){
  const doneToday=R().daily.includes(todayKey());
  const card=(id,title,desc,extra,btn)=>`<article class="gamecard"><div class="gc-art">${extra}</div><div class="stack" style="gap:6px"><h3>${title}</h3><p class="small">${desc}</p><div class="row">${btn}</div></div></article>`;
  return `<div class="wrap">${topBar()}${tabsHTML()}${settingsHTML()}${notices()}
  <div class="stack"><h1 id="screen-title" tabindex="-1">Games</h1>${guide('Missions are the big adventures. These are quick games to practise between them. No clocks, no rush.')}</div>
  <div class="gamegrid">
  ${card('daily','Daily challenge',`Three questions picked for today from Grade ${S.grade}. ${doneToday?'You’ve done today’s. Come back tomorrow for a new one.':'Finish them for 15 sparks.'}`,PIC.sun(),`<button type="button" class="btn primary" id="go-daily" data-action="daily">${doneToday?'Play again (no sparks)':'Play today’s challenge'}</button><span class="small muted">${R().daily.length} day${R().daily.length===1?'':'s'} played</span>`)}
  ${card('quiz','Quick quiz',`Five questions from Grade ${S.grade} missions. 2 sparks for each one you get right first time.`,PIC.bell(),`<button type="button" class="btn primary" id="go-quiz" data-action="quiz">Start a quiz</button>`)}
  ${card('match','Spark Pairs',`Flip cards to match each ${S.grade<=3?'word with its picture':'part with its circuit symbol'}. Take as many turns as you like. 5 sparks when you finish.`,PIC.mirror(),`<button type="button" class="btn primary" id="go-match" data-action="match">Play Spark Pairs</button>`)}
  ${card('workshop','Workshop',`Build any circuit or solar light you like and test it. No goals, just experiments.`,PIC.battery(),`<button type="button" class="btn primary" id="go-workshop" data-action="workshop">Open the Workshop</button><span class="small muted">${R().workshop} tests run</span>`)}
  </div><p class="small muted">Change the grade for these games on the Home screen.</p></div>`;
}

/* ================= Quiz and daily challenge ================= */
function rng(seed){let h=hash(String(seed))>>>0;return ()=>{h=(h*1664525+1013904223)>>>0;return h/4294967296;};}
function quizPool(g){
  const out=[];
  for(const d of Object.values(MISSIONS).filter(x=>x.grade===g)) d.transfer.qs.forEach((q,i)=>{if(i===0||!d.transfer.qs[0].tap) out.push({id:d.id,i});});
  return out;
}
function startQuiz(kind){
  const g=S.grade,pool=quizPool(g),rand=kind==='daily'?rng(todayKey()+':'+g):Math.random,n=kind==='daily'?3:5;
  const items=[];const p=pool.slice();
  while(items.length<n&&p.length){items.push(p.splice(Math.floor(rand()*p.length),1)[0]);}
  UI.quiz={kind,grade:g,items,idx:0,answer:null,ok:false,tries:0,first:[],done:false,paid:false};
  UI.view='quiz';UI.settings=false;resetUI();render(true);
}
function staticFig(d){
  const f=d.transfer.fig;if(!f) return '';
  if(f.type==='circuit') return `<figure class="figure">${circuitSVG(LAYOUTS[f.layout],f.set,{})}</figure>`;
  if(f.type==='solar') return `<figure class="figure">${solarScene(f.set,null)}</figure>`;
  if(f.type==='switch') return `<div class="figure"><div class="row" style="justify-content:center">${switchPic(f.sw==='closed').replace('<svg','<svg style="width:120px;height:120px"')}</div></div>`;
  return `<div class="figure">${sceneHTML(f.key)}</div>`;
}
function quizHTML(){
  const Q=UI.quiz,n=Q.items.length,title=Q.kind==='daily'?'Daily challenge':'Quick quiz';
  if(Q.done){
    const right=Q.first.filter(Boolean).length,doneBefore=Q.kind==='daily'&&!Q.paid;
    const earned=Q.kind==='daily'?(Q.paid?15:0):2*right;
    return `<div class="wrap">${topBar()}${tabsHTML()}<div class="stack"><p class="eyebrow">${title} · Grade ${Q.grade}</p><h1 id="screen-title" tabindex="-1">All done!</h1>
      ${guide(right===n?`${right} out of ${n} right first time. Brilliant thinking!`:`${right} out of ${n} right first time, and you fixed the rest. That’s how scientists learn.`,'happy')}
      <div class="panel"><div class="statrow"><span class="stat">${sparkIcon}<b>+${earned}</b> sparks</span><span class="stat"><b>${right}/${n}</b> first try</span></div>
      ${doneBefore?'<p class="small muted">You already earned today’s sparks. A new challenge comes tomorrow.</p>':''}</div>
      <div class="row"><button type="button" class="btn primary" id="qz-again" data-action="${Q.kind==='daily'?'quiz':'quiz'}">${Q.kind==='daily'?'Try a quick quiz':'Play again'}</button><button type="button" class="btn" id="qz-games" data-action="view" data-v="games">Back to games</button></div></div></div>`;
  }
  const it=Q.items[Q.idx],d=MISSIONS[it.id],q=d.transfer.qs[it.i];
  const fb=UI.feedback&&UI.feedback.scope==='qz'?feedbackHTML('qz'):'';
  return `<div class="wrap">${topBar()}${tabsHTML()}
  <div class="stack"><p class="eyebrow">${title} · Grade ${Q.grade} · Question ${Q.idx+1} of ${n}</p>
  <div class="dots" aria-hidden="true">${Q.items.map((_,i)=>`<span class="${i<Q.idx?(Q.first[i]?'ok':'fix'):i===Q.idx?'now':''}"></span>`).join('')}</div>
  <h1 id="screen-title" tabindex="-1">${esc(d.title)}</h1></div>
  <section class="screen stack"><p>${esc(d.transfer.intro)}</p>${staticFig(d)}
  <p${big(d)?' style="font-size:1.15rem"':''}><b>${esc(q.q)}</b></p>${sayBtn(q.q)}
  ${optionGroup(d,'qz-answer','qz',q.options,Q.answer,q.q,Q.ok)}
  ${Q.ok?`<div><button type="button" class="btn primary big" id="qz-next" data-action="qz-next">${Q.idx+1<n?'Next question →':'See my result'}</button></div>`
    :`<div><button type="button" class="btn primary" id="qz-check" data-action="qz-check" ${Q.answer?'':'disabled'}>Check</button></div>`}
  ${fb}</section>
  <div class="nav"><button type="button" class="btn quiet" id="qz-quit" data-action="view" data-v="games">Leave this game</button></div></div>`;
}
function finishQuiz(){
  const Q=UI.quiz;Q.done=true;const right=Q.first.filter(Boolean).length;
  if(Q.kind==='quiz') R().quiz.push(right),R().quiz.splice(0,Math.max(0,R().quiz.length-300));
  else if(!R().daily.includes(todayKey())){R().daily.push(todayKey());Q.paid=true;}
  sfx('stamp');save();
}

/* ================= Spark Pairs ================= */
const PAIR_DECKS={
  pictures:[['Torch','torch'],['Sun','sun'],['Fan','fanOn'],['Mirror','mirror'],['Battery','battery'],['Solar panel','panel'],['Switch','switchOn'],['Bell','bell']],
  symbols:[['Battery symbol','symBattery'],['Open switch','symSwitchOpen'],['Closed switch','symSwitchClosed'],['Bulb symbol','symBulb'],['Conductor (foil)','foil'],['Insulator (wood)','wood'],['Solar panel','panel'],['Wire','wire']]
};
function startMatch(){
  const deck=S.grade<=3?'pictures':'symbols',rand=Math.random,pairs=PAIR_DECKS[deck].slice().sort(()=>rand()-.5).slice(0,6);
  const cards=[];pairs.forEach((p,i)=>{cards.push({pid:i,kind:'word',label:p[0]});cards.push({pid:i,kind:'pic',label:p[0],pic:p[1]});});
  for(let i=cards.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
  UI.match={deck,cards,up:[],matched:[],turns:0,done:false};UI.view='match';UI.settings=false;resetUI();render(true);
}
function matchHTML(){
  const M=UI.match,left=6-M.matched.length;
  return `<div class="wrap">${topBar()}${tabsHTML()}
  <div class="stack"><p class="eyebrow">Spark Pairs · ${M.deck==='pictures'?'words and pictures':'parts and symbols'}</p><h1 id="screen-title" tabindex="-1">${M.done?'All pairs found!':'Find the pairs'}</h1>
  ${M.done?guide(`You matched all 6 pairs in ${M.turns} turns. +5 sparks!`,'happy'):`<p>Flip two cards. If they match, they stay up. ${left} pair${left===1?'':'s'} left · ${M.turns} turn${M.turns===1?'':'s'}</p>`}</div>
  <div class="pairgrid">${M.cards.map((c,i)=>{const up=M.up.includes(i)||M.matched.includes(c.pid);const done=M.matched.includes(c.pid);
    return `<button type="button" class="paircard${up?' up':''}${done?' matched':''}" id="pc-${i}" data-action="flip" data-i="${i}" ${done?'aria-disabled="true"':''} aria-label="${up?`${esc(c.label)}${c.kind==='pic'?' picture':' word'}${done?', matched':''}`:`Card ${i+1}, face down`}">
      ${up?(c.kind==='pic'?picHTML(c.pic,64):`<span class="pw">${esc(c.label)}</span>`):'<span class="back" aria-hidden="true">⚡</span>'}</button>`;}).join('')}</div>
  <div class="row">${M.done?`<button type="button" class="btn primary" id="pairs-again" data-action="match">Play again</button>`:''}<button type="button" class="btn" id="pairs-back" data-action="view" data-v="games">Back to games</button></div></div>`;
}

/* ================= Workshop (free play) ================= */
function wsInit(){
  const sets={};for(const k of ['path','class','series']){const L=LAYOUTS[k];sets[k]={connectors:Object.fromEntries(L.connectors.map(c=>[c.id,'metal'])),switches:{sw:'closed'}};}
  return {kind:'circuit',layout:'path',sets,sel:null,tested:null,solar:{panel:'yes',site:'sun',storage:'no',time:'day'},stested:null};
}
function wsExplain(L,set,r){
  if(r.status!=='ok') return `The model can’t give a result for this layout (${r.reason}).`;
  if(Object.values(r.lit).every(Boolean)) return 'Complete conducting loop: current flows from the battery, through every part, and back.';
  const breaks=[];
  if(set.switches.sw==='open') breaks.push('the switch is open');
  for(const c of L.connectors){const m=set.connectors[c.id];if(m==null) breaks.push(`gap at “${c.name}”`);else if(!cond(m)) breaks.push(`${MAT_NAME[m]} at “${c.name}” doesn’t conduct`);}
  return 'The loop is broken: '+breaks.join('; ')+'.';
}
function workshopHTML(){
  const W=UI.ws||(UI.ws=wsInit());
  let body='';
  if(W.kind==='circuit'){
    const L=LAYOUTS[W.layout],set=W.sets[W.layout],r=W.tested&&sameSet(W.tested,set)?runModel(L,set):null;
    const sel=W.sel&&L.connectors.find(c=>c.id===W.sel);
    body=`<div class="seg" role="group" aria-label="Circuit">${['path','class','series'].map(k=>`<button type="button" class="btn" id="ws-l-${k}" data-action="ws-layout" data-l="${k}" aria-pressed="${W.layout===k}">${esc(LAYOUTS[k].title)}</button>`).join('')}</div>
    <figure class="figure">${circuitSVG(L,set,{act:'ws-part',hl:W.sel?[W.sel]:[],lit:r&&r.status==='ok'?r.lit:undefined})}<figcaption class="status" role="status">${r?esc(wsExplain(L,set,r)):'Change anything you like, then press Test.'}</figcaption></figure>
    <div class="row"><button type="button" class="btn primary big" id="ws-test" data-action="ws-test">Test</button><button type="button" class="btn" id="ws-reset" data-action="ws-reset">Reset this circuit</button></div>
    <div class="parts">${L.connectors.map(c=>`<button type="button" class="part" id="ws-p-${c.id}" data-action="ws-part" data-id="${c.id}" aria-pressed="${W.sel===c.id}"><b>${esc(c.name)}</b><span>${esc(matName(set.connectors[c.id]))}</span></button>`).join('')}
    <button type="button" class="part" id="ws-p-sw" data-action="ws-part" data-id="sw"><b>Switch</b><span>${set.switches.sw} · tap to ${set.switches.sw==='closed'?'open':'close'}</span></button></div>
    ${sel?`<div class="chooser" role="group" aria-label="Choose for ${esc(sel.name)}"><p><b>${esc(sel.name)}</b>: choose what joins these terminals.</p><div class="row">${Object.keys(MAT_NAME).map(m=>`<button type="button" class="btn" id="ws-m-${m}" data-action="ws-mat" data-m="${m}">${esc(MAT_NAME[m])}</button>`).join('')}<button type="button" class="btn" id="ws-m-gap" data-action="ws-mat" data-m="gap">Remove it (gap)</button></div></div>`:''}`;
  } else {
    const s=W.solar,r=W.stested&&sameSet(W.stested,s)?runSolar(s):null;
    body=`<figure class="figure">${solarScene(s,r)}<figcaption class="status" role="status">${r?(r.lit?(s.time==='day'&&r.generating?'Lamp on: the panel is making electricity in the sun.':'Lamp on: the charged battery store is lighting it.'):'Lamp off: '+(s.panel==='no'?'there is no panel to collect energy.':s.site==='shade'?'the shaded panel makes too little electricity.':s.time==='night'&&s.storage==='no'?'no sunlight now and no stored energy.':'not enough energy.')):'Change the settings, then press Test.'}</figcaption></figure>
    <div class="panel">${Object.keys(SOLAR_KEYS).map(k=>`<div class="seg" role="group" aria-label="${SOLAR_LABEL[k]}"><span class="k">${SOLAR_LABEL[k]}</span>${SOLAR_KEYS[k].map(v=>`<button type="button" class="btn" id="ws-s-${k}-${v}" data-action="ws-solar" data-k="${k}" data-v="${v}" aria-pressed="${s[k]===v}">${esc(SOLAR_VAL[k][v])}</button>`).join('')}</div>`).join('')}</div>
    <div class="row"><button type="button" class="btn primary big" id="ws-stest" data-action="ws-stest">Test</button></div>`;
  }
  return `<div class="wrap">${topBar()}${tabsHTML()}
  <div class="stack"><p class="eyebrow">Workshop · free play · ${R().workshop} tests run</p><h1 id="screen-title" tabindex="-1">Workshop</h1>
  <div class="seg" role="group" aria-label="Workbench"><button type="button" class="btn" id="ws-k-circuit" data-action="ws-kind" data-k="circuit" aria-pressed="${W.kind==='circuit'}">Circuits</button><button type="button" class="btn" id="ws-k-solar" data-action="ws-kind" data-k="solar" aria-pressed="${W.kind==='solar'}">Solar light</button></div>
  <p class="small muted">Everything here is a pretend model. Try to break it, fix it, and predict before you press Test.</p></div>
  <section class="stack">${body}</section>
  <div class="row"><button type="button" class="btn" id="ws-back" data-action="view" data-v="games">Back to games</button></div></div>`;
}
function wsTestDone(){R().workshop=Math.min(100000,R().workshop+1);save();}

/* ================= Badges and shop ================= */
function badgesHTML(){
  const c=progressCtx();
  return `<div class="wrap">${topBar()}${tabsHTML()}${settingsHTML()}
  <div class="stack"><h1 id="screen-title" tabindex="-1">Badges</h1>${playerCard(c)}
  <p>${c.badges.length} of ${BADGES.length} badges earned. Each badge adds 10 sparks.</p></div>
  <div class="badgegrid">${BADGES.map(b=>{const on=c.badges.includes(b[0]);return `<div class="badge${on?' on':''}">${medal(b,on)}<b>${esc(b[1])}</b><span class="small">${esc(b[2])}</span><span class="small ${on?'pass':'muted'}">${on?'✓ Earned':'Not yet'}</span></div>`;}).join('')}</div>
  <div class="panel"><h2>Stars</h2><p class="small">Every finished mission shows up to 3 stars. They measure how you worked, not how fast.</p>
  <ul class="small">${[1,2,3].map(i=>`<li>${starsHTML(i)} ${STAR_TEXT[i]} · ${STAR_SPARKS[i]} sparks</li>`).join('')}</ul>
  <p class="small muted">A wrong first prediction never costs a star. Replay a mission any time to try for more.</p></div></div>`;
}
function shopHTML(){
  const c=progressCtx(),r=R();
  const item=i=>{
    const owned=i.price===0||r.owned.includes(i.id),need=i.price-c.balance;
    const art=i.type==='companion'?companionSVG(i.id,'happy'):`<svg viewBox="${i.id==='fireworks'?'120 0 460 90':i.id==='lighthouse'?'680 50 70 130':i.id==='dolphins'?'30 160 120 50':i.id==='boat'?'590 110 90 80':i.id==='hammock'?'260 90 100 70':'466 56 50 72'}" aria-hidden="true"><rect x="0" y="0" width="760" height="210" class="sc-sky"/>${decoSVG(i.id)}</svg>`;
    let btn;
    if(i.type==='companion') btn=owned?(r.equip.companion===i.id?'<span class="chip yes">With you</span>':`<button type="button" class="btn" id="eq-${i.id}" data-action="equip" data-id="${i.id}">Choose</button>`):'';
    else btn=owned?`<button type="button" class="btn" id="eq-${i.id}" data-action="toggle-deco" data-id="${i.id}" aria-pressed="${!r.equip.hide.includes(i.id)}">${r.equip.hide.includes(i.id)?'Show on island':'Hide from island'}</button>`:'';
    if(!owned) btn=need>0?`<button type="button" class="btn" disabled>${sparkIcon} ${i.price}</button><span class="small muted">${need} more sparks needed</span>`:`<button type="button" class="btn primary" id="buy-${i.id}" data-action="buy" data-id="${i.id}">${sparkIcon} Get for ${i.price}</button>`;
    return `<article class="shopitem${owned?' owned':''}"><div class="si-art">${art}</div><h3>${esc(i.name)}</h3><p class="small muted">${esc(i.desc)}</p><div class="row">${btn}</div></article>`;
  };
  return `<div class="wrap">${topBar()}${tabsHTML()}${settingsHTML()}
  <div class="stack"><h1 id="screen-title" tabindex="-1">Island shop</h1>${playerCard(c)}
  <p class="note small">Sparks are earned by playing. They can’t be bought with money, and nothing here changes a mission or a science result.</p></div>
  <h2>Island friends</h2><div class="shopgrid">${SHOP.filter(i=>i.type==='companion').map(item).join('')}</div>
  <h2>Island decorations</h2><p class="small muted">Decorations appear on the island at the top of the Home screen.</p><div class="shopgrid">${SHOP.filter(i=>i.type==='deco').map(item).join('')}</div></div>`;
}

/* ================= Actions for the new screens ================= */
Object.assign(A,{
  view(el){UI.view=el.dataset.v;UI.settings=false;resetUI();save();render(true);},
  daily(){startQuiz('daily');},
  quiz(){startQuiz('quiz');},
  'qz-answer'(el){if(UI.quiz.ok) return;UI.quiz.answer=el.dataset.v;UI.feedback=null;render();},
  'qz-check'(){
    const Q=UI.quiz,it=Q.items[Q.idx],q=MISSIONS[it.id].transfer.qs[it.i],o=q.options.find(x=>x.id===Q.answer);if(!o) return;
    Q.tries++;if(o.ok){Q.ok=true;Q.first[Q.idx]=Q.tries===1;}
    UI.feedback={scope:'qz',ok:o.ok,text:(o.fb||(o.ok?'Yes.':'Not quite.'))+(o.ok?'':' Try again.')};
    sfx(o.ok?'ok':'retry');render();announce(UI.feedback.text);if(o.ok){const n=document.getElementById('qz-next');n&&n.focus();}
  },
  'qz-next'(){const Q=UI.quiz;if(Q.idx+1>=Q.items.length) finishQuiz();else{Q.idx++;Q.answer=null;Q.ok=false;Q.tries=0;}UI.feedback=null;render(true);},
  match(){startMatch();},
  flip(el){
    const M=UI.match,i=+el.dataset.i,c=M.cards[i];if(M.done||M.matched.includes(c.pid)||M.up.includes(i)) return;
    if(M.up.length===2) M.up=[];
    M.up.push(i);
    if(M.up.length===2){
      M.turns++;const [a,b]=M.up.map(k=>M.cards[k]);
      if(a.pid===b.pid){M.matched.push(a.pid);M.up=[];sfx('ok');announce(`Match: ${a.label}.`);
        if(M.matched.length===6){M.done=true;R().match=Math.min(1000,R().match+1);save();sfx('stamp');render(true);return;}}
      else{sfx('off');announce(`${a.label} and ${b.label} don’t match. Tap another card to keep going.`);}
    } else sfx('tap');
    render();
  },
  workshop(){UI.ws=UI.ws||wsInit();UI.view='workshop';UI.settings=false;resetUI();render(true);},
  'ws-kind'(el){UI.ws.kind=el.dataset.k;UI.ws.sel=null;render();},
  'ws-layout'(el){UI.ws.layout=el.dataset.l;UI.ws.sel=null;UI.ws.tested=null;render();},
  'ws-part'(el){const W=UI.ws,set=W.sets[W.layout],id=el.dataset.id;
    if(id==='sw'){set.switches.sw=set.switches.sw==='closed'?'open':'closed';W.sel=null;}
    else if(LAYOUTS[W.layout].connectors.some(c=>c.id===id)) W.sel=W.sel===id?null:id;
    sfx('tap');render();},
  'ws-mat'(el){const W=UI.ws,m=el.dataset.m;if(W.sel){W.sets[W.layout].connectors[W.sel]=m==='gap'?null:m;}const id=W.sel;W.sel=null;render();const t=document.getElementById('ws-p-'+id);t&&t.focus();},
  'ws-test'(){const W=UI.ws,set=W.sets[W.layout];W.tested=clone(set);const r=runModel(LAYOUTS[W.layout],set);sfx(r.status==='ok'&&Object.values(r.lit).some(Boolean)?'lit':'off');wsTestDone();render();announce(wsExplain(LAYOUTS[W.layout],set,r));},
  'ws-reset'(){const W=UI.ws,fresh=wsInit();W.sets[W.layout]=fresh.sets[W.layout];W.tested=null;W.sel=null;render();},
  'ws-solar'(el){UI.ws.solar[el.dataset.k]=el.dataset.v;sfx('tap');render();},
  'ws-stest'(){const W=UI.ws;W.stested=clone(W.solar);const r=runSolar(W.solar);sfx(r.lit?'lit':'off');wsTestDone();render();announce(`Lamp ${r.lit?'on':'off'}.`);},
  buy(el){const i=SHOP.find(x=>x.id===el.dataset.id),c=progressCtx();if(!i||R().owned.includes(i.id)||c.balance<i.price) return;
    R().owned.push(i.id);if(i.type==='companion') R().equip.companion=i.id;sfx('stamp');save();render();announce(`You got the ${i.name}.`);},
  equip(el){if(R().owned.includes(el.dataset.id)||el.dataset.id==='turtle'){R().equip.companion=el.dataset.id;sfx('tap');save();render();}},
  'toggle-deco'(el){const h=R().equip.hide,id=el.dataset.id;const k=h.indexOf(id);if(k<0) h.push(id);else h.splice(k,1);save();render();}
});
const VIEWS={teacher:teacherViewHTML,games:gamesHTML,quiz:quizHTML,match:matchHTML,workshop:workshopHTML,badges:badgesHTML,shop:shopHTML};

/* ================= Start ================= */
{
  const had=S.rewards&&typeof S.rewards==='object'&&Array.isArray(S.rewards.seen);
  S.rewards=cleanRewards(S.rewards);reconcileRewards();
  /* Players from before rewards existed keep what they earned without a burst of announcements. */
  if(!had){const c=progressCtx();S.rewards.seen=c.badges.slice();S.rewards.seenLevel=c.level;save();}
}
window.__pti={MISSIONS,ENG,reqsOf,LAYOUTS,runModel,runSolar,PIC,freshMission,progressCtx};
applyPrefs();
render();
