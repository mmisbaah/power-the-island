/* ================= Circuit drawing ================= */
function circuitSVG(L,set,o){
  o=o||{};
  const hl=o.hl||[], h=+L.viewBox.split(' ')[3];
  let s=`<svg viewBox="${L.viewBox}" role="img" aria-label="${esc(o.alt||describeCircuit(L,set,o.lit))}"><rect class="board" width="400" height="${h}"/>`;
  for(const c of L.connectors) if(hl.includes(c.id)) s+=`<path class="hl" d="${c.d}"/>`;
  if(L.loose&&hl.includes('loose')) s+=`<path class="hl" d="${L.loose.d}"/>`;
  for(const k of L.components) if(hl.includes(k.id)) s+=`<circle class="hl-c" cx="${k.cx}" cy="${k.cy}" r="36"/>`;
  for(const c of L.connectors){
    const m=set.connectors[c.id], act=o.act?`data-action="${o.act}" data-id="${c.id}"`:'';
    s+=`<g ${act}><path class="hit" d="${c.d}"/>`;
    if(m==null) s+=`<path class="w-gap" d="${c.d}"/><text class="lbl-gap" x="${c.lab[0]}" y="${c.lab[1]}" text-anchor="middle">✕ gap</text>`;
    else if(cond(m)) s+=`<path class="w-metal" d="${c.d}"/>${m!=='metal'?`<text class="lbl-plastic" x="${c.lab[0]}" y="${c.lab[1]}" text-anchor="middle">${esc(MAT_NAME[m])}</text>`:''}`;
    else s+=`<path class="w-plastic" d="${c.d}"/><path class="w-plastic-dash" d="${c.d}"/><text class="lbl-plastic" x="${c.lab[0]}" y="${c.lab[1]}" text-anchor="middle">${esc(MAT_NAME[m]||'?')}</text>`;
    s+=`</g>`;
  }
  if(L.loose){
    const lw=L.loose, act=o.act?`data-action="${o.act}" data-id="loose"`:'';
    s+=`<g ${act}><path class="hit" d="${lw.d}"/><path class="w-loose" d="${lw.d}"/>${lw.ends.map(e=>`<circle class="term" cx="${e[0]}" cy="${e[1]}" r="5"/>`).join('')}<text class="lbl" x="${lw.lab[0]}" y="${lw.lab[1]}" text-anchor="middle">loose wire</text></g>`;
  }
  for(const k of L.components){
    const act=o.act?`data-action="${o.act}" data-id="${k.id}"`:'';
    s+=`<g ${act}><circle class="hit-c" cx="${k.cx}" cy="${k.cy}" r="32"/>${drawComp(k,set,o)}</g>`;
  }
  for(const k of L.components) for(const w of (k.type==='battery'?['p','n']:['a','b'])){const [x,y]=termPos(k,w);s+=`<circle class="term" cx="${x}" cy="${y}" r="5"/>`;}
  return s+'</svg>';
}
function drawComp(k,set,o){
  const {cx,cy,ori}=k; let s='';
  if(k.type==='battery'){
    if(ori==='v') s+=`<path class="sym" d="M${cx} ${cy-30} V${cy-8} M${cx-20} ${cy-8} H${cx+20} M${cx} ${cy+8} V${cy+30}"/><path class="sym" style="stroke-width:6" d="M${cx-10} ${cy+8} H${cx+10}"/><text class="lbl-strong" x="${cx-28}" y="${cy-12}" text-anchor="middle">+</text><text class="lbl-strong" x="${cx-28}" y="${cy+22}" text-anchor="middle">−</text><text class="lbl" x="${cx+48}" y="${cy+4}" text-anchor="middle">battery</text>`;
    else s+=`<path class="sym" d="M${cx-30} ${cy} H${cx-8} M${cx-8} ${cy-20} V${cy+20} M${cx+8} ${cy} H${cx+30}"/><path class="sym" style="stroke-width:6" d="M${cx+8} ${cy-10} V${cy+10}"/><text class="lbl-strong" x="${cx-20}" y="${cy-24}" text-anchor="middle">+</text><text class="lbl-strong" x="${cx+20}" y="${cy-24}" text-anchor="middle">−</text><text class="lbl" x="${cx}" y="${cy+36}" text-anchor="middle">battery</text>`;
  } else if(k.type==='switch'){
    const closed=set.switches[k.id]==='closed';
    if(ori==='h') s+=`<path class="sym" d="M${cx-30} ${cy} L${closed?cx+30:cx+20} ${closed?cy:cy-26}"/><text class="lbl" x="${cx}" y="${cy+30}" text-anchor="middle">switch: ${closed?'closed':'open'}</text>`;
    else s+=`<path class="sym" d="M${cx} ${cy-30} L${closed?cx:cx+26} ${closed?cy+30:cy+20}"/><text class="lbl" x="${cx-14}" y="${cy+4}" text-anchor="end">switch: ${closed?'closed':'open'}</text>`;
  } else if(k.type==='bulb'){
    const st=o.lit?o.lit[k.id]:undefined;
    const lead=ori==='v'?`M${cx} ${cy-30} V${cy-20} M${cx} ${cy+20} V${cy+30}`:`M${cx-30} ${cy} H${cx-20} M${cx+20} ${cy} H${cx+30}`;
    const word=st===true?'ON':st===false?'OFF':'not tested';
    const tx=ori==='v'?`<text class="lbl" x="${cx-44}" y="${cy-4}" text-anchor="end">${esc(k.name.toLowerCase())}</text><text class="lbl-strong" x="${cx-44}" y="${cy+14}" text-anchor="end">${word}</text>`
      :`<text class="lbl" x="${cx}" y="${cy+42}" text-anchor="middle">${esc(k.name.toLowerCase())}</text><text class="lbl-strong" x="${cx}" y="${cy+58}" text-anchor="middle">${word}</text>`;
    s+=`<g class="${st===true?'lit':''}">${st===true?rays(cx,cy,27,38):''}<path class="sym" d="${lead}"/><circle class="glass" cx="${cx}" cy="${cy}" r="20"/><path class="sym" style="stroke-width:2.5" d="M${cx-13} ${cy-13} L${cx+13} ${cy+13} M${cx+13} ${cy-13} L${cx-13} ${cy+13}"/></g>${tx}`;
  }
  return s;
}
function describeCircuit(L,set,lit){
  const parts=L.connectors.map(c=>`${c.name}: ${matName(set.connectors[c.id])}`);
  const bulbs=L.components.filter(k=>k.type==='bulb').map(b=>`${b.name} ${lit&&lit[b.id]!==undefined?(lit[b.id]?'on':'off'):'not tested'}`);
  return `${L.title} circuit. Switch ${set.switches.sw}. ${parts.join('. ')}.${L.loose?' A loose wire crosses the lamp-to-switch wire on the drawing but is not joined to any terminal.':''} ${bulbs.join(', ')}.`;
}
function inspectText(L,set,step){
  if(step==='start') return 'Start at the battery + terminal.';
  if(step==='end') return 'Back at the battery − terminal. Every part on the way must conduct for the loop to be complete.';
  const k=L.components.find(x=>x.id===step);
  if(k&&k.type==='switch') return `Switch: ${set.switches.sw}. ${set.switches.sw==='closed'?'It joins its two terminals.':'It leaves a gap between its terminals.'}`;
  if(k&&k.type==='bulb') return `${k.name}: its filament joins its two terminals.`;
  const c=L.connectors.find(x=>x.id===step),m=set.connectors[step];
  return `${c.name}: ${m==null?'nothing joins these two terminals. There is a gap here.':cond(m)?`a ${MAT_NAME[m]} joins these terminals. It conducts.`:`a ${MAT_NAME[m]} joins these terminals. It does not conduct.`}`;
}
function cleanCircuit(L,s,fallback){
  const out=clone(fallback);
  if(!s||typeof s!=='object') return out;
  for(const c of L.connectors){const v=s.connectors&&s.connectors[c.id]; if(v===null||(typeof v==='string'&&v in CONDUCTS)) out.connectors[c.id]=v;}
  const v=s.switches&&s.switches.sw; if(v==='open'||v==='closed') out.switches.sw=v;
  return out;
}
function cleanSolar(s,fallback){const out=clone(fallback);if(s&&typeof s==='object') for(const k in SOLAR_KEYS) if(SOLAR_KEYS[k].includes(s[k])) out[k]=s[k];return out;}

/* ================= Shared UI pieces ================= */
const big=d=>d.grade<=2;
function choiceBtn(action,q,o,selected,extra){
  return `<button type="button" class="choice" id="${q}-${o.id}" data-action="${action}" data-q="${q}" data-v="${o.id}" aria-pressed="${selected===o.id}" ${extra||''}><span class="dot" aria-hidden="true"></span><span>${esc(o.label)}</span></button>`;
}
function picBtn(action,q,o,selected,extra){
  return `<button type="button" class="pic" id="${q}-${o.id}" data-action="${action}" data-q="${q}" data-v="${o.id}" aria-pressed="${selected===o.id}" ${extra||''}>${PIC[o.pic]?PIC[o.pic]():''}<span>${esc(o.label)}</span></button>`;
}
function optionGroup(d,action,q,opts,selected,label,lock){
  const usePics=big(d)&&opts.every(o=>o.pic&&PIC[o.pic]);
  const ex=lock?'aria-disabled="true"':'';
  const act=lock?'noop':action;
  return usePics?`<div class="pics" role="group" aria-label="${esc(label)}">${opts.map(o=>picBtn(act,q,o,selected,ex)).join('')}</div>`
    :`<div class="choices" role="group" aria-label="${esc(label)}">${opts.map(o=>choiceBtn(act,q,o,selected,ex)).join('')}</div>`;
}
function feedbackHTML(scope){
  if(!UI.feedback||(scope&&UI.feedback.scope!==scope)) return '';
  return `<div class="feedback ${UI.feedback.ok?'ok':'retry'}" role="status"><span>${esc(UI.feedback.text)}</span></div>`;
}
function hintList(d,scope){
  const h=d.hints[scope]||[];
  return scope==='play'?h:[...h.slice(0,2),'Worked example: '+d.learned];
}
function hintHTML(d,ms,scope){
  const list=hintList(d,scope),level=ms.hints[scope]||0,shown=list.slice(0,level);
  return `<div class="stack">${shown.length?`<div class="hintbox" role="status">${shown.map((h,i)=>`<p><b>Hint ${i+1}.</b> ${esc(h)}</p>`).join('')}</div>`:''}
    ${level<list.length?`<div><button type="button" class="btn" id="hint-${scope}" data-action="hint" data-scope="${scope}">${level?'Another hint':'Show a hint'}</button></div>`:''}</div>`;
}
function sayBtn(text){
  if(!('speechSynthesis' in window)) return '';
  return `<div><button type="button" class="btn quiet" id="say-${Math.abs(hash(text))}" data-action="say" data-text="${esc(text)}" ${S.prefs.mute?'disabled':''}>🔈 Read aloud</button></div>`;
}
function checklist(reqs){
  return `<ul class="check">${reqs.map(r=>`<li class="${r.met?'met':''}"><span class="box" aria-hidden="true"></span><span>${esc(r.label)}<span class="sr">${r.met?' Done.':' Not done yet.'}</span></span></li>`).join('')}</ul>`;
}
function pill(on){return `<span class="pill ${on?'on':'off'}">${on?'On':'Off'}</span>`;}
function chipsFor(st){
  return `<div class="chips"><span class="chip ${st.explored?'yes':''}">Explored</span><span class="chip ${st.practised?'yes':''}">Practised</span><span class="chip ${st.demonstrated?'yes':''}">Demonstrated</span>${st.assisted?'<span class="chip assist">New problem done with hints</span>':''}</div>`;
}
function hash(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h;}
function shuffled(arr,seed){
  const a=arr.slice();let h=hash(seed);
  for(let i=a.length-1;i>0;i--){h=(h*1103515245+12345)|0;const j=Math.abs(h)%(i+1);[a[i],a[j]]=[a[j],a[i]];}
  if(a.every((x,i)=>x===arr[i])) a.push(a.shift());
  return a;
}
const DEVICE={
  lamp:{name:'lamp',obs:[{id:'on',label:'Lamp on',pic:'lampOn'},{id:'off',label:'Lamp off',pic:'lampOff'}],scene:on=>classroomScene(on)},
  fan:{name:'fan',obs:[{id:'on',label:'Fan spinning',pic:'fanOn'},{id:'off',label:'Fan still',pic:'fan'}],scene:on=>classroomScene(false,on)},
  path:{name:'path light',obs:[{id:'on',label:'Light on',pic:'pathlight'},{id:'off',label:'Light off',pic:'lampOff'}],scene:(on,sw)=>pathScene(on,sw)}
};
const CHECK_TIMES=['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

/* ================= Engines =================
   Each activity type supplies its own state, trial record, default requirements and screens.
   Requirements are always recomputed from the trial records. */
const ENG={
sort:{
  init:()=>({place:{}}),
  clean(cfg,p){const out={place:{}};const bins=cfg.bins.map(b=>b[0]);if(p&&p.place) for(const it of cfg.items) if(bins.includes(p.place[it[0]])) out.place[it[0]]=p.place[it[0]];return out;},
  cleanTrial(cfg,t){return t&&t.place?{n:t.n,place:ENG.sort.clean(cfg,t).place}:null;},
  evalT:(cfg,T)=>T.map(t=>({placed:cfg.items.every(i=>t.place[i[0]]),correct:cfg.items.every(i=>t.place[i[0]]===i[2]),wrong:cfg.items.filter(i=>t.place[i[0]]&&t.place[i[0]]!==i[2]).map(i=>i[0])})),
  reqs:[['Put every card in a group, then check.',T=>T.some(x=>x.placed)],['Fix any cards until every card is in the right group.',T=>T.some(x=>x.correct)]],
  view(d,ms){
    const cfg=d.play,p=ms.play,last=ms.trials[ms.trials.length-1];
    const fresh=last&&sameSet(last.place,p.place);
    const wrong=fresh?ENG.sort.evalT(cfg,[last])[0].wrong:[];
    const all=cfg.items.every(i=>p.place[i[0]]);
    if(big(d)) return ENG.sort.oneAtATime(d,ms,wrong,all);
    return `<p>${esc(cfg.instr)}</p>${sayBtn(cfg.instr)}
    <div class="sortlist">${cfg.items.map(i=>`<div class="sortitem ${wrong.includes(i[0])?'redo':''}"><div class="what">${picHTML(i[4],52)}<span>${esc(i[1])}${wrong.includes(i[0])?' <span class="flag">↻ look again</span>':''}</span></div>
      <div class="binbtns" role="group" aria-label="Group for ${esc(i[1])}">${cfg.bins.map(b=>`<button type="button" class="btn" id="pl-${i[0]}-${b[0]}" data-action="sort-place" data-item="${i[0]}" data-bin="${b[0]}" aria-pressed="${p.place[i[0]]===b[0]}">${esc(b[1])}</button>`).join('')}</div></div>`).join('')}</div>
    <div class="row"><button type="button" class="btn primary big" id="sort-check" data-action="sort-check" ${all?'':'disabled'}>Check my groups</button><span class="muted small">${cfg.items.filter(i=>p.place[i[0]]).length} of ${cfg.items.length} placed</span></div>`;
  },
  /* Grades 1–2: one big card and one decision at a time; placed cards stay visible and can be changed. */
  oneAtATime(d,ms,wrong,all){
    const cfg=d.play,p=ms.play,n=cfg.items.length;
    let focus=UI.sortFocus&&cfg.items.find(i=>i[0]===UI.sortFocus);
    if(!focus&&!all) focus=cfg.items.find(i=>!p.place[i[0]]);
    const k=focus?cfg.items.indexOf(focus)+1:n;
    const binLabel=id=>(cfg.bins.find(b=>b[0]===id)||[])[1];
    return `<p style="font-size:1.2rem">${esc(cfg.instr)}</p>${sayBtn(cfg.instr)}
    ${focus?`<div class="bigcard" aria-live="polite"><p class="eyebrow">Card ${k} of ${n}</p>${picHTML(focus[4],120)}<p class="bigcard-name">${esc(focus[1])}</p></div>
      <p style="font-size:1.1rem"><b>Where does it go?</b></p>
      <div class="pics" role="group" aria-label="Group for ${esc(focus[1])}">${cfg.bins.map(b=>`<button type="button" class="pic" id="pl-${focus[0]}-${b[0]}" data-action="sort-place" data-item="${focus[0]}" data-bin="${b[0]}" aria-pressed="${p.place[focus[0]]===b[0]}">${b[2]&&PIC[b[2]]?PIC[b[2]]():''}<span>${esc(b[1])}</span></button>`).join('')}</div>`
      :`<div class="row"><button type="button" class="btn primary big" id="sort-check" data-action="sort-check">Check my groups</button></div>`}
    ${Object.keys(p.place).length?`<div class="stack"><p class="small muted">Your cards. Tap one to change it.</p><div class="minis">${cfg.items.filter(i=>p.place[i[0]]).map(i=>`<button type="button" class="mini ${wrong.includes(i[0])?'redo':''}" id="mini-${i[0]}" data-action="sort-focus" data-item="${i[0]}" aria-label="${esc(i[1])}: ${esc(binLabel(p.place[i[0]]))}${wrong.includes(i[0])?'. Look again.':''}">${picHTML(i[4],40)}<span>${esc(binLabel(p.place[i[0]]))}</span>${wrong.includes(i[0])?'<span class="flag">↻</span>':''}</button>`).join('')}</div></div>`:''}`;
  },
  evidence(d,ms){
    const cfg=d.play,first=ms.trials[0],r=first?ENG.sort.evalT(cfg,[first])[0]:null;
    const firstRight=first?cfg.items.filter(i=>first.place[i[0]]===i[2]).length:0;
    return `<div class="panel"><p class="eyebrow">Your groups</p><div class="tablewrap"><table><thead><tr><th>Card</th><th>Group</th><th>Why</th></tr></thead><tbody>
    ${cfg.items.map(i=>`<tr><td><div class="row">${picHTML(i[4],36)}<b>${esc(i[1])}</b></div></td><td>${esc(cfg.bins.find(b=>b[0]===i[2])[1])}</td><td>${esc(i[3])}</td></tr>`).join('')}</tbody></table></div>
    ${r?`<p class="muted small">First check: ${firstRight} of ${cfg.items.length} right. Checks made: ${ms.trials.length}.</p>`:''}</div>`;
  }
},
sequence:{
  init:()=>({seq:[]}),
  clean(cfg,p){const ids=cfg.cards.map(c=>c[0]);const seq=(p&&Array.isArray(p.seq)?p.seq:[]).filter((x,i,a)=>ids.includes(x)&&a.indexOf(x)===i);return {seq};},
  cleanTrial(cfg,t){return t&&Array.isArray(t.seq)?{n:t.n,seq:ENG.sequence.clean(cfg,t).seq}:null;},
  evalT:(cfg,T)=>T.map(t=>({complete:t.seq.length===cfg.cards.length,correct:t.seq.length===cfg.cards.length&&t.seq.every((x,i)=>x===cfg.cards[i][0])})),
  reqs:[['Put all the cards in order, then check.',T=>T.some(x=>x.complete)],['Fix the order until it is right.',T=>T.some(x=>x.correct)]],
  view(d,ms){
    const cfg=d.play,seq=ms.play.seq,byId=Object.fromEntries(cfg.cards.map(c=>[c[0],c]));
    const left=shuffled(cfg.cards.map(c=>c[0]),d.id).filter(x=>!seq.includes(x));
    return `<p${big(d)?' style="font-size:1.2rem"':''}>${esc(cfg.instr)}</p>${sayBtn(cfg.instr)}
    <ol class="slots" aria-label="Your order">${cfg.cards.map((_,i)=>{const c=byId[seq[i]];return `<li class="${c?'filled':''}"><span class="n" aria-hidden="true">${i+1}</span>${c?`${picHTML(c[2],44)}<b>${esc(c[1])}</b>`:'<span class="muted">Empty</span>'}</li>`;}).join('')}</ol>
    ${left.length?`<p><b>Tap the card that comes next.</b></p><div class="cards">${left.map(id=>`<button type="button" class="card" id="sq-${id}" data-action="seq-add" data-id="${id}">${picHTML(byId[id][2],44)}<span>${esc(byId[id][1])}</span></button>`).join('')}</div>`:''}
    <div class="row"><button type="button" class="btn primary big" id="seq-check" data-action="seq-check" ${left.length?'disabled':''}>Check my order</button>
    <button type="button" class="btn" id="seq-undo" data-action="seq-undo" ${seq.length?'':'disabled'}>Undo last</button><button type="button" class="btn quiet" id="seq-clear" data-action="seq-clear" ${seq.length?'':'disabled'}>Clear</button></div>`;
  },
  evidence(d,ms){
    const cfg=d.play,first=ms.trials[0];
    const firstRun=first?first.seq.findIndex((x,i)=>x!==cfg.cards[i][0]):-1;
    return `<div class="panel"><p class="eyebrow">The order you found</p><div class="chain">${cfg.cards.map((c,i)=>`${i?'<div class="arrow" aria-hidden="true">↓</div>':''}<div class="link">${picHTML(c[2],40)}<span>${i+1}. ${esc(c[1])}</span></div>`).join('')}</div>
    <p class="muted small">Checks made: ${ms.trials.length}.${first?` Your first check had ${firstRun<0?cfg.cards.length:firstRun} card${firstRun===1?'':'s'} right from the start.`:''}</p></div>`;
  }
},
switch:{
  init:cfg=>({sw:cfg.start||'open'}),
  clean(cfg,p){return {sw:p&&(p.sw==='open'||p.sw==='closed')?p.sw:(cfg.start||'open')};},
  cleanTrial(cfg,t){if(!t||(t.sw!=='open'&&t.sw!=='closed')||(t.observed!=='on'&&t.observed!=='off')) return null;return (t.observed==='on')===deviceOn(t.sw)?{n:t.n,sw:t.sw,observed:t.observed}:null;},
  evalT:(cfg,T)=>T.map(t=>({s:t.sw,o:t.observed})),
  reqs:[['Switch on. Say what happens.',T=>T.some(x=>x.s==='closed'&&x.o==='on')],['Switch off. Say what happens.',T=>T.some(x=>x.s==='open'&&x.o==='off')]],
  view(d,ms){
    const cfg=d.play,dev=DEVICE[cfg.device],sw=ms.play.sw,on=deviceOn(sw);
    const last=ms.trials[ms.trials.length-1],recorded=last&&last.sw===sw;
    const reqs=reqsOf(d,ms),next=reqs.find(r=>!r.met);
    const instr=next?(recorded?'Press the switch again.':cfg.checkpoints?`Checkpoint ${ms.trials.length+1} (${CHECK_TIMES[ms.trials.length%12]}): set the switch, then record what the ${dev.name} does.`:`Press the switch. Then tap the picture that matches the ${dev.name}.`):'You found out what the switch does. Go to Next.';
    return `<p${big(d)?' style="font-size:1.2rem"':''}>${esc(instr)}</p>${sayBtn(instr)}
    <div class="figure">${dev.scene(on,cfg.device==='path'?sw==='closed':undefined)}</div>
    <div class="row" style="justify-content:center"><button type="button" class="pic" id="sw-toggle" data-action="sw-toggle" aria-pressed="${sw==='closed'}" aria-label="Switch, now ${sw==='closed'?'on':'off'}. Press to turn it ${sw==='closed'?'off':'on'}.">${switchPic(sw==='closed')}<span>Switch ${sw==='closed'?'ON':'OFF'}</span></button></div>
    ${(next||cfg.checkpoints)&&!recorded&&ms.interacted?`<p style="font-size:1.1rem"><b>What is the ${dev.name} doing?</b></p><div class="pics" role="group" aria-label="Observation">${dev.obs.map(o=>picBtn('sw-observe','obs',o,null)).join('')}</div>`:''}
    ${cfg.checkpoints&&ms.trials.length?`<div class="panel"><h3>My record</h3>${ENG.switch.table(d,ms)}</div>`:''}`;
  },
  table(d,ms){
    const dev=DEVICE[d.play.device];
    return `<div class="tablewrap"><table><thead><tr><th>${d.play.checkpoints?'Checkpoint':'Try'}</th><th>Switch</th><th>${esc(dev.name)}</th></tr></thead><tbody>${ms.trials.map((t,i)=>`<tr><td>${d.play.checkpoints?`${i+1} · ${CHECK_TIMES[i%12]}`:i+1}</td><td>${t.sw==='closed'?'ON':'OFF'}</td><td>${pill(t.observed==='on')}</td></tr>`).join('')}</tbody></table></div>${d.play.checkpoints?'<p class="muted small">Times are example checkpoints, not real clock readings.</p>':''}`;
  },
  evidence(d,ms){
    if(d.play.checkpoints) return `<div class="panel"><p class="eyebrow">Your record</p>${ENG.switch.table(d,ms)}</div>`;
    const dev=DEVICE[d.play.device],sm=k=>picHTML(k,56);
    return `<div class="panel"><p class="eyebrow">You saw</p><div class="tablewrap"><table><thead><tr><th>Switch</th><th>${esc(dev.name)}</th></tr></thead><tbody>
    <tr><td><div class="row">${sm('switchOn')} ON</div></td><td><div class="row">${sm(dev.obs[0].pic)} ${pill(true)}</div></td></tr>
    <tr><td><div class="row">${sm('switchOff')} OFF</div></td><td><div class="row">${sm(dev.obs[1].pic)} ${pill(false)}</div></td></tr></tbody></table></div></div>`;
  }
},
circuit:{
  init:cfg=>({set:clone(cfg.initial)}),
  clean(cfg,p){return {set:cleanCircuit(LAYOUTS[cfg.layout],p&&p.set,cfg.initial)};},
  cleanTrial(cfg,t){return t&&t.set?{n:t.n,set:cleanCircuit(LAYOUTS[cfg.layout],t.set,cfg.initial)}:null;},
  evalT:(cfg,T)=>T.map(t=>({s:t.set,r:runModel(LAYOUTS[cfg.layout],t.set)})),
  reqs:[],
  view(d,ms){
    const cfg=d.play,L=LAYOUTS[cfg.layout],set=ms.play.set;
    const reqs=reqsOf(d,ms),ni=reqs.findIndex(r=>!r.met);
    const last=ms.trials[ms.trials.length-1],fresh=last&&sameSet(last.set,set);
    const res=fresh?runModel(L,last.set):null,lit=res&&res.status==='ok'?res.lit:undefined;
    const editable=cfg.edit||L.connectors.map(c=>c.id);
    const sel=UI.sel&&L.connectors.find(c=>c.id===UI.sel);
    const instr=ni<0?'All the tests are done. Go to Next to look at your evidence.':cfg.steps[ni]||reqs[ni].label;
    const bulbs=L.components.filter(k=>k.type==='bulb');
    const cap=res&&res.status!=='ok'?`Model unavailable for this layout (${esc(res.reason)}). No result is shown.`:lit?`Test ${last.n}: ${bulbs.map(b=>`${esc(b.name)} ${pill(lit[b.id])}`).join(' ')}`:'Not tested since the last change. Press Test.';
    const mats=cfg.mats.concat(cfg.allowGap?['gap']:[]);
    return `<p>${esc(instr)}</p>${sayBtn(instr)}
    <figure class="figure">${circuitSVG(L,set,{act:'c-part',hl:UI.hl,lit})}<figcaption class="status" role="status">${cap}</figcaption></figure>
    ${UI.msg?`<div class="feedback retry" role="status"><span>${esc(UI.msg)}</span></div>`:''}
    ${UI.inspect>=0?`<div class="note" role="status"><b>Follow the path:</b> ${esc(inspectText(L,set,L.path[UI.inspect]))}</div>`:''}
    <div class="row"><button type="button" class="btn primary big" id="c-test" data-action="c-test" ${UI.testing?'disabled aria-busy="true"':''}>${UI.testing?'Testing…':'Test'}</button>
    <button type="button" class="btn" id="c-follow" data-action="c-follow">${UI.inspect<0?'Follow the path':UI.inspect>=L.path.length-1?'Start the path again':'Next part of the path'}</button></div>
    <div class="stack"><h3>Parts you can change</h3><div class="parts">
    ${L.connectors.filter(c=>editable.includes(c.id)).map(c=>`<button type="button" class="part" id="part-${c.id}" data-action="c-part" data-id="${c.id}" aria-pressed="${UI.sel===c.id}"><b>${esc(c.name)}</b><span>${esc(matName(set.connectors[c.id]))}</span></button>`).join('')}
    ${cfg.lockSwitch?'':`<button type="button" class="part" id="part-sw" data-action="c-part" data-id="sw" aria-pressed="false"><b>Switch</b><span>${set.switches.sw} · tap to ${set.switches.sw==='closed'?'open':'close'}</span></button>`}</div>
    ${sel?`<div class="chooser" role="group" aria-label="Choose a connector for ${esc(sel.name)}"><p><b>${esc(sel.name)}</b>: choose what joins these terminals.</p><div class="row">
      ${mats.map(m=>`<button type="button" class="btn" id="mat-${m}" data-action="c-mat" data-mat="${m}">${m==='gap'?'Remove it (leave a gap)':esc(MAT_NAME[m][0].toUpperCase()+MAT_NAME[m].slice(1))}</button>`).join('')}
      <button type="button" class="btn quiet" id="mat-cancel" data-action="c-mat" data-mat="cancel">Leave it</button></div></div>`:''}</div>
    ${ms.trials.length?`<details><summary>Test log (${ms.trials.length})</summary>${ENG.circuit.table(d,ms.trials)}</details>`:''}`;
  },
  table(d,trials){
    const L=LAYOUTS[d.play.layout],bulbs=L.components.filter(k=>k.type==='bulb');
    if(!trials.length) return '<p class="muted">No tests yet.</p>';
    return `<div class="tablewrap"><table><thead><tr><th>Test</th><th>Switch</th>${L.connectors.map(c=>`<th>${esc(c.name)}</th>`).join('')}${bulbs.map(b=>`<th>${esc(b.name)}</th>`).join('')}</tr></thead><tbody>
    ${trials.map(t=>{const r=runModel(L,t.set);return `<tr><td>${t.n}</td><td>${t.set.switches.sw}</td>${L.connectors.map(c=>`<td>${t.set.connectors[c.id]==null?'<b>gap</b>':esc(MAT_NAME[t.set.connectors[c.id]])}</td>`).join('')}${bulbs.map(b=>`<td>${r.status==='ok'?pill(r.lit[b.id]):'unavailable'}</td>`).join('')}</tr>`;}).join('')}</tbody></table></div>`;
  },
  evidence(d,ms){return `<div class="panel"><p class="eyebrow">Your tests</p>${ENG.circuit.table(d,ms.trials)}<p class="muted small">Results come from the game’s circuit model, not from measurements of real wires. Brightness is not modelled.</p></div>`;}
},
solar:{
  init:cfg=>({set:clone(cfg.initial)}),
  clean(cfg,p){return {set:cleanSolar(p&&p.set,cfg.initial)};},
  cleanTrial(cfg,t){return t&&t.set?{n:t.n,set:cleanSolar(t.set,cfg.initial)}:null;},
  evalT:(cfg,T)=>T.map(t=>({s:t.set,r:runSolar(t.set)})),
  reqs:[],
  view(d,ms){
    const cfg=d.play,set=ms.play.set,reqs=reqsOf(d,ms),ni=reqs.findIndex(r=>!r.met);
    const last=ms.trials[ms.trials.length-1],fresh=last&&sameSet(last.set,set),res=fresh?runSolar(set):null;
    const instr=ni<0?'All the tests are done. Go to Next to look at your evidence.':cfg.steps[ni]||reqs[ni].label;
    return `<p>${esc(instr)}</p>${sayBtn(instr)}
    <figure class="figure">${solarScene(set,res)}<figcaption class="status" role="status">${res?(res.status==='ok'?`Test ${last.n}: lamp ${pill(res.lit)}`:'Model unavailable.'):'Not tested since the last change. Press Test.'}</figcaption></figure>
    <div class="panel"><h3>Settings</h3>${Object.keys(SOLAR_KEYS).map(k=>cfg.edit.includes(k)
      ?`<div class="seg" role="group" aria-label="${SOLAR_LABEL[k]}"><span class="k">${SOLAR_LABEL[k]}</span>${SOLAR_KEYS[k].map(v=>`<button type="button" class="btn" id="s-${k}-${v}" data-action="s-set" data-k="${k}" data-v="${v}" aria-pressed="${set[k]===v}">${esc(SOLAR_VAL[k][v])}</button>`).join('')}</div>`
      :`<div class="seg"><span class="k">${SOLAR_LABEL[k]}</span><span class="muted">${esc(SOLAR_VAL[k][set[k]])} (fixed)</span></div>`).join('')}</div>
    <div class="row"><button type="button" class="btn primary big" id="s-test" data-action="s-test" ${UI.testing?'disabled aria-busy="true"':''}>${UI.testing?'Testing…':'Test'}</button></div>
    ${ms.trials.length?`<details><summary>Test log (${ms.trials.length})</summary>${ENG.solar.table(ms.trials)}</details>`:''}`;
  },
  table(trials){
    return `<div class="tablewrap"><table><thead><tr><th>Test</th>${Object.keys(SOLAR_KEYS).map(k=>`<th>${SOLAR_LABEL[k]}</th>`).join('')}<th>Lamp</th></tr></thead><tbody>
    ${trials.map(t=>{const r=runSolar(t.set);return `<tr><td>${t.n}</td>${Object.keys(SOLAR_KEYS).map(k=>`<td>${esc(SOLAR_VAL[k][t.set[k]])}</td>`).join('')}<td>${r.status==='ok'?pill(r.lit):'unavailable'}</td></tr>`;}).join('')}</tbody></table></div>`;
  },
  evidence(d,ms){return `<div class="panel"><p class="eyebrow">Your tests</p>${ENG.solar.table(ms.trials)}<p class="muted small">Idealised example rules: a panel in open sun by day makes enough electricity for the lamp and fully charges a store; shade gives too little; no light, no electricity. Not real measurements.</p></div>`;}
}
};

/* ================= Progress ================= */
function reqsOf(d,ms){
  const cfg=d.play,E=ENG[cfg.engine],T=E.evalT(cfg,ms.trials),R=cfg.reqs||E.reqs;
  return R.map(([label,fn])=>({label,met:!!fn(T)}));
}
const okOpt=(q,v)=>{const o=q.options.find(x=>x.id===v);return !!(o&&o.ok);};
const qDone=(ms,qs,pre)=>qs.every((q,i)=>ms.checked[pre+i]&&okOpt(q,ms.answers[pre+i]));
const explainCorrect=(d,ms)=>qDone(ms,d.explain,'e');
const transferDone=(d,ms)=>qDone(ms,d.transfer.qs,'t');
function statusOf(d,ms){
  if(!ms) return {started:false,explored:false,practised:false,demonstrated:false,assisted:false};
  const practised=reqsOf(d,ms).every(r=>r.met),ex=explainCorrect(d,ms),td=transferDone(d,ms);
  return {started:true,explored:ms.interacted||ms.trials.length>0,practised,demonstrated:practised&&ex&&td&&ms.hints.transfer===0,assisted:practised&&ex&&td&&ms.hints.transfer>0};
}
function maxStep(d,ms){
  if(!ms.prediction) return 1;
  if(!reqsOf(d,ms).every(r=>r.met)) return 2;
  if(!explainCorrect(d,ms)) return 4;
  if(!transferDone(d,ms)) return 5;
  return 6;
}
const hintsUsed=ms=>ms.hints.play+ms.hints.explain+ms.hints.transfer;

/* ================= Store ================= */
function freshStore(){return {schema:1,game:'power-the-island',grade:4,prefs:{mute:false,reducedMotion:false,sfx:true},missions:{},archived:{},current:null,rewards:freshRewards()};}
function freshTState(d){
  const f=d.transfer.fig;
  if(!f) return {tested:false};
  if(f.type==='circuit'||f.type==='solar') return {set:clone(f.set),tested:false};
  if(f.type==='switch') return {sw:f.sw,tested:false};
  return {tested:false};
}
function freshMission(d){
  return {missionId:d.id,contentVersion:d.version,grade:d.grade,step:'brief',interacted:false,prediction:null,
    play:ENG[d.play.engine].init(d.play),trials:[],trialCount:0,answers:{},checked:{},
    hints:{play:0,explain:0,transfer:0},tState:freshTState(d),switchCloses:0,updatedAt:null};
}
function sanitizeMission(d,m){
  const f=freshMission(d),E=ENG[d.play.engine];
  if(!m||typeof m!=='object') return f;
  f.interacted=m.interacted===true;
  const p=m.prediction;
  if(p&&d.predict.options.some(o=>o.id===p.choice)) f.prediction={choice:p.choice,reason:d.predict.reasons.some(r=>r.id===p.reason)?p.reason:null,aloud:p.aloud===true};
  f.play=E.clean(d.play,m.play);
  f.trials=(Array.isArray(m.trials)?m.trials.slice(-MAX_TRIALS):[]).map(t=>{const c=E.cleanTrial(d.play,t);if(c) c.n=Number.isInteger(t.n)&&t.n>0?t.n:0;return c;}).filter(Boolean);
  f.trialCount=f.trials.reduce((a,t)=>Math.max(a,t.n),0);
  const qs=[...d.explain.map((q,i)=>['e'+i,q]),...d.transfer.qs.map((q,i)=>['t'+i,q])];
  for(const [k,q] of qs){
    const v=m.answers&&m.answers[k];
    if(q.options.some(o=>o.id===v)){f.answers[k]=v;if(m.checked&&m.checked[k]===true) f.checked[k]=true;}
  }
  if(m.answers&&m.answers.aloud===true) f.answers.aloud=true;
  for(const k in f.hints){const v=m.hints&&m.hints[k];if(Number.isInteger(v)) f.hints[k]=Math.max(0,Math.min(3,v));}
  const fig=d.transfer.fig,ts=m.tState||{};
  if(fig&&fig.type==='circuit') f.tState.set=cleanCircuit(LAYOUTS[fig.layout],ts.set,fig.set);
  if(fig&&fig.type==='solar') f.tState.set=cleanSolar(ts.set,fig.set);
  if(fig&&fig.type==='switch'&&(ts.sw==='open'||ts.sw==='closed')) f.tState.sw=ts.sw;
  f.tState.tested=ts.tested===true;
  f.switchCloses=Number.isInteger(m.switchCloses)?Math.max(0,m.switchCloses):0;
  f.updatedAt=typeof m.updatedAt==='string'?m.updatedAt:null;
  const want=STEPS.indexOf(m.step);
  f.step=STEPS[Math.max(0,Math.min(want<0?0:want,maxStep(d,f)))];
  return f;
}
let storageOK=true,loadNotices=[];
function probeStorage(){try{const k=KEY+'.probe';localStorage.setItem(k,'1');localStorage.removeItem(k);return true;}catch(e){return false;}}
function loadStore(){
  const out=freshStore();
  storageOK=probeStorage();
  if(!storageOK) return out;
  let raw=null;
  try{const s=localStorage.getItem(KEY);raw=s?JSON.parse(s):null;}catch(e){loadNotices.push('Saved progress couldn’t be read, so the game started fresh.');return out;}
  if(!raw||typeof raw!=='object') return out;
  if(raw.schema!==1){loadNotices.push('Saved progress came from a version this game doesn’t recognise. It started fresh.');return out;}
  if([1,2,3,4,5,6].includes(raw.grade)) out.grade=raw.grade;
  if(raw.prefs){out.prefs.mute=raw.prefs.mute===true;out.prefs.reducedMotion=raw.prefs.reducedMotion===true;out.prefs.sfx=raw.prefs.sfx!==false;}
  if(raw.archived&&typeof raw.archived==='object') out.archived=raw.archived;
  out.rewards=raw.rewards;   /* cleaned once the reward rules have loaded */
  for(const id in (raw.missions||{})){
    const d=MISSIONS[id],m=raw.missions[id];
    if(!d){out.archived[id]=m;continue;}
    if(!m||m.contentVersion!==d.version){
      out.archived[id+'@'+(m&&m.contentVersion||'unknown')]=m;
      loadNotices.push(`“${d.title}” has changed since you last played, so it will start fresh. Your old record is kept in the export.`);
      continue;
    }
    out.missions[id]=sanitizeMission(d,m);
  }
  if(raw.current&&out.missions[raw.current]) out.current=raw.current;
  return out;
}
function save(){
  const m=cur();if(m) m.updatedAt=new Date().toISOString();
  if(!storageOK) return;
  try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){storageOK=false;}
}

/* ================= State ================= */
let S=loadStore();
let UI={view:'home',settings:false,teacher:false,confirm:null,sel:null,inspect:-1,msg:null,feedback:null,testing:false,copy:'',hl:[]};
const cur=()=>S.current?S.missions[S.current]:null;
const def=()=>S.current?MISSIONS[S.current]:null;
function applyPrefs(){document.documentElement.classList.toggle('rm',S.prefs.reducedMotion);}
function announce(t){const el=document.getElementById('live');if(el){el.textContent='';setTimeout(()=>{el.textContent=t;},30);}}
function speak(t){if(S.prefs.mute||!('speechSynthesis' in window)) return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=.95;u.lang='en';speechSynthesis.speak(u);}catch(e){}}
function resetUI(){UI.feedback=null;UI.msg=null;UI.sel=null;UI.inspect=-1;UI.hl=[];UI.confirm=null;UI.sortFocus=null;UI.celebrate=false;}

/* Short synthesised sounds. They only repeat what the screen already shows, so they need no captions. */
let AC=null;
const TONES={tap:[[620,.05]],ok:[[660,.09],[880,.16]],retry:[[392,.1],[330,.16]],lit:[[523,.07],[659,.07],[784,.18]],off:[[300,.12]],stamp:[[523,.09],[659,.09],[784,.09],[1047,.3]]};
function sfx(kind){
  if(!S.prefs.sfx) return;
  try{
    AC=AC||new (window.AudioContext||window.webkitAudioContext)();
    let t=AC.currentTime+.01;
    for(const [f,dur] of TONES[kind]||[]){
      const o=AC.createOscillator(),g=AC.createGain();
      o.type='triangle';o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.09,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
      o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+dur+.03);t+=dur*.85;
    }
  }catch(e){}
}

/* ================= Home: grade selection ================= */
const GRADE_TOPIC={1:'Switches, safety and things that need power',2:'Light, shadows and mirrors',3:'Saving energy and solar panels',4:'Circuits, conductors and finding faults',5:'Energy transfer, storage and fair tests',6:'Series circuits, design and model limits'};
function gradeIsland(g,st){
  const pts=[[40,78],[58,62],[78,74],[96,56],[114,70],[132,54],[150,68],[166,56],[178,74],[160,84]];
  return `<svg viewBox="0 0 220 110" aria-hidden="true"><rect class="sc-night" width="220" height="110"/>
    <circle class="sc-moon" cx="196" cy="18" r="7"/><rect class="sc-sea" y="70" width="220" height="40" opacity=".55"/>
    <path class="sc-sand" d="M18 82 C26 46 80 36 112 40 C150 36 200 48 204 80 C196 102 140 104 112 104 C70 104 22 104 18 82Z"/>
    ${pts.map(([x,y],i)=>{const on=st[i]&&(st[i].demonstrated||st[i].assisted);return `${on?`<circle class="glow" cx="${x}" cy="${y-6}" r="9"/>`:''}<rect class="sc-moon" x="${x-1}" y="${y-4}" width="2" height="10"/><circle cx="${x}" cy="${y-6}" r="3" class="${on?'sc-sun':'glass'}"/>`;}).join('')}
    <text x="112" y="88" text-anchor="middle" class="lbl-strong" style="font-size:22px;fill:var(--ink)">${g}</text></svg>`;
}
const GRADE_SHORT={1:'Switches and safety',2:'Light and shadows',3:'Saving energy and solar',4:'Circuits and faults',5:'Energy and fair tests',6:'Series circuits and design'};
/* Home fits one screen: compact progress strip, an optional Continue button, and six grade tiles
   that share whatever height is left. Teacher material lives on its own page. */
function homeHTML(){
  const resume=S.current&&MISSIONS[S.current]&&S.missions[S.current]&&(()=>{const s=statusOf(MISSIONS[S.current],S.missions[S.current]);return !(s.demonstrated||s.assisted);})()?MISSIONS[S.current]:null;
  const played=Object.keys(S.missions).length>0;
  const cards=[1,2,3,4,5,6].map(g=>{
    const list=Object.values(MISSIONS).filter(d=>d.grade===g).sort((a,b)=>a.number-b.number);
    const st=list.map(d=>statusOf(d,S.missions[d.id])),lit=st.filter(x=>x.demonstrated||x.assisted).length;
    const last=played&&S.grade===g;
    return `<button type="button" class="gradecard${last?' current':''}" id="pick-grade-${g}" data-action="pick-grade" data-grade="${g}" aria-label="Grade ${g}: ${GRADE_TOPIC[g]}. ${lit} of 10 lights on.${last?' Last played.':''}">
      ${gradeIsland(g,st).replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" ')}<span class="gc-name">Grade ${g}</span><span class="gc-topic">${GRADE_SHORT[g]}</span>
      <span class="gc-lights">${lit}/10 lights</span></button>`;
  }).join('');
  const c=progressCtx(),next=LEVELS[c.level+1],pct=next?Math.round(100*(c.earned-LEVELS[c.level][0])/(next[0]-LEVELS[c.level][0])):100;
  return `<div class="wrap home">${topBar()}${tabsHTML()}${settingsHTML()}${notices()}
  <header class="band homeband">${islandBand(shownDecos()).replace('<svg ','<svg preserveAspectRatio="xMidYMid slice" ')}<h1 id="screen-title" tabindex="-1">Power the Island</h1></header>
  <section class="pstrip" aria-label="Your progress">${companionSVG(R().equip.companion,'happy')}
    <div class="pmid"><b>Level ${c.level+1} · ${esc(levelTitle(c.level))}</b><div class="bar" role="progressbar" aria-label="Level progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><span style="width:${pct}%"></span></div></div>
    <div class="pstats"><span class="stat">${sparkIcon}<b>${c.balance}</b><span class="sr"> sparks</span></span><span class="stat"><span class="stars"><span class="on" aria-hidden="true">★</span></span><b>${c.stars}</b><span class="sr"> stars</span></span><span class="stat"><span aria-hidden="true">🏅</span><b>${c.badges.length}</b><span class="sr"> badges</span></span></div></section>
  ${resume?`<button type="button" class="btn primary" id="continue" data-action="start" data-id="${resume.id}">▶ Continue: ${esc(resume.title)} <span class="muted-on">(Grade ${resume.grade})</span></button>`:''}
  <section aria-labelledby="pick-title" class="pick"><h2 id="pick-title">Choose your grade</h2><div class="gradegrid fill">${cards}</div></section>
  <p class="homefoot small muted">Pretend circuits only: real plugs and wires are for grown-ups. <button type="button" class="btn quiet small" id="to-teacher" data-action="view" data-v="teacher">For teachers</button></p></div>`;
}
function teacherViewHTML(){
  UI.teacher=true;
  return `<div class="wrap">${topBar()}${tabsHTML()}${settingsHTML()}<div class="stack"><h1 id="screen-title" tabindex="-1">For teachers and reviewers</h1>
  <p>Model checks, all 60 mission records and the release checklist.</p></div>${teacherHTML()}
  <div class="row"><button type="button" class="btn" id="teacher-back" data-action="view" data-v="home">← Back to home</button></div></div>`;
}

/* ================= Hub ================= */
function topBar(){
  return `<div class="top"><div class="brand"><svg viewBox="0 0 32 32" aria-hidden="true"><circle class="sc-sea" cx="16" cy="16" r="15"/><path class="sc-sand" d="M5 22 C10 16 22 16 27 22Z"/><g class="lit"><circle class="glass" cx="16" cy="11" r="4"/></g></svg>Science Lagoon</div>
  <div class="row">${UI.view==='mission'?`<button type="button" class="btn" id="to-hub" data-action="to-hub">← Missions</button>`:UI.view==='hub'?`<button type="button" class="btn" id="to-home" data-action="home">← All grades</button>`:''}<button type="button" class="btn" id="open-settings" data-action="settings" aria-expanded="${UI.settings}">Settings</button></div></div>`;
}
function settingsHTML(){
  if(!UI.settings) return '';
  return `<section class="panel" aria-labelledby="settings-title">
    <div class="spread"><h2 id="settings-title" tabindex="-1">Learner settings</h2><button type="button" class="btn" id="close-settings" data-action="settings">Close</button></div>
    <div class="stack"><h3>Grade</h3><div class="gradesel" role="group" aria-label="Grade">${[1,2,3,4,5,6].map(g=>`<button type="button" class="btn" id="grade-${g}" data-action="grade" data-grade="${g}" aria-pressed="${S.grade===g}">Grade ${g}</button>`).join('')}</div></div>
    <div class="row"><button type="button" class="btn" id="pref-mute" data-action="pref" data-pref="mute" aria-pressed="${!S.prefs.mute}">Read-aloud: ${S.prefs.mute?'off':'on'}</button>
    <button type="button" class="btn" id="pref-sfx" data-action="pref" data-pref="sfx" aria-pressed="${S.prefs.sfx}">Sound effects: ${S.prefs.sfx?'on':'off'}</button>
    <button type="button" class="btn" id="pref-rm" data-action="pref" data-pref="reducedMotion" aria-pressed="${S.prefs.reducedMotion}">Reduce motion: ${S.prefs.reducedMotion?'on':'off'}</button></div>
    ${'speechSynthesis' in window?'':'<p class="muted small">This browser has no read-aloud voice, so narration buttons are hidden.</p>'}
    <details><summary>Export progress</summary><div class="stack">
      <p class="small">Progress is saved in this browser only. It doesn’t sync between devices. The record has no names, voice, photos or locations.</p>
      <label for="export-box" class="small muted">Progress record (version ${S.schema})</label>
      <textarea id="export-box" readonly>${esc(JSON.stringify(S,null,2))}</textarea>
      <div class="row"><button type="button" class="btn" id="copy-export" data-action="copy">Copy record</button><span role="status" class="small" id="copy-status">${esc(UI.copy)}</span></div></div></details>
    ${UI.confirm==='all'?`<div class="note warn stack"><p><b>Clear all progress on this device?</b> Every mission starts fresh. This can’t be undone.</p><div class="row"><button type="button" class="btn danger" id="confirm-yes" data-action="confirm-yes">Clear progress</button><button type="button" class="btn" id="confirm-no" data-action="confirm-no">Keep it</button></div></div>`
      :`<div><button type="button" class="btn danger" id="reset-all" data-action="reset-all">Clear all progress…</button></div>`}
  </section>`;
}
function notices(){
  let s='';
  if(!storageOK) s+=`<div class="note warn" role="status">This browser isn’t letting the game save. You can still play, but progress will be lost when you close the page.</div>`;
  for(const n of loadNotices) s+=`<div class="note" role="status">${esc(n)}</div>`;
  return s;
}
const ENGINE_NAME={sort:'Sort',sequence:'Put in order',switch:'Switch and observe',circuit:'Circuit model',solar:'Solar model'};
/* The grade's island at night: each finished mission switches on one light along the path.
   The map repeats what the mission cards say, so it is a picture; the cards are the controls. */
const MAP_SPOTS=[[112,214],[176,168],[246,204],[306,148],[372,196],[440,140],[506,190],[566,146],[628,200],[676,152]];
function islandMap(list,st){
  const lit=st.filter(x=>x.demonstrated||x.assisted).length;
  const spot=(d,i)=>{
    const [x,y]=MAP_SPOTS[i],s=st[i],on=s.demonstrated||s.assisted,started=s.started&&!on;
    const pop=on&&UI.justLit===d.id?' pop':'';
    return `<g class="spot${on?' lit':''}${pop}" data-action="start" data-id="${d.id}" transform="translate(${x} ${y})">
      ${on?'<circle class="glow" cx="0" cy="-30" r="26"/>'+rays(0,-30,12,20):''}
      ${started?'<circle cx="0" cy="-30" r="15" style="fill:none;stroke:var(--sun);stroke-width:2.5;stroke-dasharray:4 4"/>':''}
      <rect class="sc-moon" x="-2.5" y="-24" width="5" height="30" rx="2"/><path class="sc-lagoon" d="M-11 -32 h22 l-5 -9 h-12Z"/><circle class="glass" cx="0" cy="-28" r="5.5"/>
      <circle cx="0" cy="16" r="11" class="sc-surface" style="stroke:var(--lagoon);stroke-width:2"/><text x="0" y="20.5" text-anchor="middle" class="lbl-strong" style="font-size:12px">${d.number}</text></g>`;
  };
  return `<svg viewBox="0 0 760 290" role="img" aria-label="Grade ${list[0].grade} island at night. ${lit} of 10 lights are on.">
    <rect class="sc-night" width="760" height="290"/>
    ${[[60,40],[150,24],[260,56],[420,30],[530,52],[610,22],[700,60],[340,18]].map(([x,y])=>`<circle class="sc-moon" cx="${x}" cy="${y}" r="1.6" opacity=".8"/>`).join('')}
    <path class="sc-moon" d="M690 30 a18 18 0 1 0 11 29 a14 14 0 1 1 -11 -29Z"/>
    <rect class="sc-sea" y="150" width="760" height="140" opacity=".55"/>
    <path class="sc-sand" d="M50 236 C70 140 220 104 380 110 C540 102 700 128 718 214 C700 270 520 280 380 278 C220 280 64 282 50 236Z"/>
    <path d="M112 214 C140 190 160 170 176 168 S230 206 246 204 S290 150 306 148 S356 196 372 196 S420 142 440 140 S490 190 506 190 S550 148 566 146 S610 200 628 200 S664 154 676 152" style="fill:none;stroke:var(--wood);stroke-width:4;stroke-dasharray:2 8;stroke-linecap:round;opacity:.7"/>
    ${palmShape(84,196,.5)}${palmShape(700,190,.45)}${palmShape(410,226,.42)}
    ${list.map(spot).join('')}</svg>`;
}
function guide(text,mood){
  return `<div class="guide">${companionSVG(S.rewards&&S.rewards.equip?S.rewards.equip.companion:'turtle',mood)}
    <div class="bubble"><p>${esc(text)}</p></div></div>`;
}
function hubHTML(){
  const g=S.grade,list=Object.values(MISSIONS).filter(d=>d.grade===g).sort((a,b)=>a.number-b.number);
  const st=list.map(d=>statusOf(d,S.missions[d.id]));
  const demo=st.filter(x=>x.demonstrated||x.assisted).length;
  const cards=list.map((d,i)=>{
    const ms=S.missions[d.id],s=st[i],label=!ms?'Start':s.demonstrated||s.assisted?'Replay':'Continue';
    return `<article class="mcard"><div class="num" aria-hidden="true">${g}·${d.number}</div><h3>${esc(d.title)}</h3><p class="muted small">${esc(d.goal)}</p>
      <div class="acts"><button type="button" class="btn primary" id="start-${d.id}" data-action="start" data-id="${d.id}">${label}<span class="sr"> ${esc(d.title)}</span></button><span class="chip">${ENGINE_NAME[d.play.engine]}</span>${ms?starsHTML(missionStars(d,ms),STAR_TEXT[missionStars(d,ms)]):''}${ms?chipsFor(s):''}${ms&&!s.demonstrated&&!s.assisted?`<span class="small muted">Saved at: ${STEP_LABEL[ms.step]}</span>`:''}</div></article>`;
  }).join('');
  const total=Object.values(MISSIONS).filter(d=>{const s=statusOf(d,S.missions[d.id]);return s.demonstrated||s.assisted;}).length;
  const resume=S.current&&MISSIONS[S.current]&&S.missions[S.current]&&(()=>{const s=statusOf(MISSIONS[S.current],S.missions[S.current]);return !(s.demonstrated||s.assisted);})()?MISSIONS[S.current]:null;
  const nextUp=resume||list.find((d,i)=>!(st[i].demonstrated||st[i].assisted));
  return `<div class="wrap">${topBar()}${settingsHTML()}${notices()}
  <header class="band map">${islandMap(list,st)}</header>
  <div class="stack"><p class="eyebrow">Grade ${g} · 10 missions · ${demo} finished · ${total} of 60 lights on across the islands</p><h1 id="screen-title" tabindex="-1">Power the Island</h1>
  ${guide(demo===10?`Grade ${g} island is fully lit! Try another grade, or replay a mission without hints.`:demo?`${demo} light${demo>1?'s are':' is'} on. Each mission you finish switches on another one.`:'The island is dark tonight. Finish a mission to switch on its light.',demo?'happy':'')}
  <p class="small muted">Every circuit here is pretend. Real plugs, sockets and wires are for grown-ups.</p>
  <div class="row">${nextUp?`<button type="button" class="btn primary big" id="continue" data-action="start" data-id="${nextUp.id}">${resume?'Continue':'Play'}: ${esc(nextUp.title)}</button>`:''}<button type="button" class="btn" id="change-grade" data-action="home">Choose another grade</button></div></div>
  <section class="mgrid" aria-label="Grade ${g} missions">${cards}</section></div>`;
}

/* ================= Teacher review ================= */
function modelChecks(){
  const A=LAYOUTS.path,B=LAYOUTS.class,K=LAYOUTS.series;
  const r=(L,c)=>runModel(L,{connectors:c,switches:{sw:'closed'}});
  const cross=r(B,{c1:'metal',c2:'metal',c3:'metal'});
  const plastic=r(A,{w1:'metal',w2:'metal',w3:'plastic'});
  const brk=['s1','s2','s3','s4'].map(k=>{const c={s1:'metal',s2:'metal',s3:'metal',s4:'metal'};c[k]=null;return allOff(r(K,c));});
  const whole=r(K,{s1:'metal',s2:'metal',s3:'metal',s4:'metal'});
  const short=runModel({components:[comp('bat','battery','v',0,0,''),comp('b1','bulb','v',0,0,'')],connectors:[{id:'k1',a:'bat.p',b:'b1.a'},{id:'k2',a:'b1.b',b:'bat.n'},{id:'k3',a:'bat.p',b:'bat.n'}]},{connectors:{k1:'metal',k2:'metal',k3:'metal'},switches:{}});
  const bad=r(A,{w1:'metal',w2:'copper?',w3:'metal'});
  const night=runSolar({panel:'yes',site:'sun',storage:'no',time:'night'});
  const nightStore=runSolar({panel:'yes',site:'sun',storage:'yes',time:'night'});
  return [
    ['A visual wire crossing is not an electrical connection (classroom lamp lights with the loose wire ignored).',allOn(cross)],
    ['A closed switch plus a plastic connector leaves the bulb off.',allOff(plastic)],
    ['A break anywhere in the two-bulb series loop turns both bulbs off (4 break positions).',brk.every(Boolean)&&allOn(whole)],
    ['Night-time solar missions can’t succeed with only an unlit panel.',night.status==='ok'&&!night.lit&&nightStore.lit],
    ['Short-circuit layouts are rejected as unsupported.',short.status==='unsupported'],
    ['An unknown material returns “model unavailable”, never a guessed result.',bad.status==='unavailable']];
}
function teacherHTML(){
  const checks=modelChecks();
  return `<details id="teacher" ${UI.teacher?'open':''}><summary data-action="teacher">For teachers and reviewers</summary><div class="stack">
    <h3>Science model checks</h3><p class="small muted">These run live against the game’s models each time this page loads.</p>
    <ul class="check">${checks.map(([t,ok])=>`<li class="${ok?'met':''}"><span class="box" aria-hidden="true"></span><span>${esc(t)} ${ok?'<span class="pass">Pass</span>':'<span class="fail">Fail</span>'}</span></li>`).join('')}</ul>
    <h3>Mission records (all 60)</h3>
    <p class="small muted">Curriculum source for every mission: proposed teaching selection, not yet mapped to an adopted NIE syllabus outcome code. Verification: Proposed, awaiting Maldivian science educator review. Demonstrated needs correct explanations and the new problem solved with no hints.</p>
    <div class="tablewrap"><table><thead><tr><th>ID</th><th>Title</th><th>Concept</th><th>Activity</th><th>Version</th></tr></thead><tbody>
    ${Object.values(MISSIONS).map(d=>`<tr><td><code>${d.id}</code></td><td>${esc(d.title)}</td><td>${esc(d.concept)}</td><td>${ENGINE_NAME[d.play.engine]}</td><td>${d.version}</td></tr>`).join('')}</tbody></table></div>
    <h3>Before release</h3><ul class="small"><li>Record the adopted syllabus edition, strand, outcome code and page for each mission.</li><li>Educator sign-off on science rules, misconceptions and grade demand for all 60 missions.</li><li>Child usability and accessibility sessions, with school or parent consent.</li><li>Commissioned art and narration replace the placeholder drawings and browser voice.</li></ul>
  </div></details>`;
}

/* ================= Mission screens ================= */
function briefFig(d){
  const p=d.play;
  if(p.engine==='circuit') return circuitSVG(LAYOUTS[p.layout],p.initial,{});
  if(p.engine==='solar') return solarScene(p.initial,null);
  if(p.engine==='switch') return DEVICE[p.device].scene(false,p.device==='path'?false:undefined);
  return sceneHTML(d.scene);
}
const SCREENS={
brief(d){
  return `<h2 id="screen-title" tabindex="-1">${esc(d.title)}</h2><div class="figure">${briefFig(d)}</div>
  ${guide(d.brief)}${sayBtn(d.brief)}
  <p class="note small">Goal: ${esc(d.goal)}</p>
  ${['circuit','solar'].includes(d.play.engine)||/cable|socket|water/i.test(d.title+d.brief)?'<p class="note warn small">This is a model on a screen. Never open or touch real wires, plugs or sockets.</p>':''}`;
},
predict(d,ms){
  const p=ms.prediction||{};
  return `<h2 id="screen-title" tabindex="-1">Make a prediction</h2>
  <p${big(d)?' style="font-size:1.2rem"':''}><b>${esc(d.predict.q)}</b></p>${sayBtn(d.predict.q)}
  ${optionGroup(d,'predict','pred',d.predict.options,p.choice,'Prediction')}
  ${d.predict.reasons.length?`<p><b>Why do you think so?</b> <span class="muted">(optional)</span></p><div class="choices" role="group" aria-label="Reason">${d.predict.reasons.map(o=>choiceBtn('reason','reason',o,p.reason)).join('')}</div>`:''}
  ${big(d)?`<div class="row"><button type="button" class="btn" id="aloud-pred" data-action="aloud" aria-pressed="${!!p.aloud}">${p.aloud?'✓ ':''}I told a grown-up why</button><span class="muted small">Say it out loud. This app doesn’t record your voice.</span></div>`:''}
  <p class="muted small">Your prediction stays next to your results, even if they turn out different.</p>`;
},
play(d,ms){
  const reqs=reqsOf(d,ms);
  return `<h2 id="screen-title" tabindex="-1">Investigate</h2>${ENG[d.play.engine].view(d,ms)}
  ${feedbackHTML('play')}
  <div class="panel"><h3>${big(d)?'What to do':'Tests to do'}</h3>${checklist(reqs)}</div>
  ${reqs.every(r=>r.met)?'':hintHTML(d,ms,'play')}`;
},
evidence(d,ms){
  const pr=ms.prediction,po=d.predict.options.find(o=>o.id===pr.choice),rs=d.predict.reasons.find(o=>o.id===pr.reason);
  return `<h2 id="screen-title" tabindex="-1">What did you find?</h2>
  <div class="panel"><p class="eyebrow">Your prediction</p><div class="row">${big(d)?picHTML(po.pic,56):''}<p><b>${esc(po.label)}</b>${rs?` because “${esc(rs.label.toLowerCase())}”`:''}.</p></div></div>
  ${ENG[d.play.engine].evidence(d,ms)}
  <p>${big(d)?'Point to the results and tell a grown-up what happened.':'Compare your prediction with the evidence. What changed between your tests?'}</p>`;
},
explain(d,ms){
  return `<h2 id="screen-title" tabindex="-1">Explain what you found</h2>${qFlow(d,ms,d.explain,'e')}
  ${big(d)?`<div class="row"><button type="button" class="btn" id="aloud-explain" data-action="aloud-ex" aria-pressed="${ms.answers.aloud===true}">${ms.answers.aloud?'✓ ':''}I explained it to a grown-up</button><span class="muted small">Optional. Nothing is recorded.</span></div>`:''}
  ${explainCorrect(d,ms)?'':hintHTML(d,ms,'explain')}`;
},
transfer(d,ms){
  const done=transferDone(d,ms);
  return `<h2 id="screen-title" tabindex="-1">A new problem</h2><p${big(d)?' style="font-size:1.15rem"':''}>${esc(d.transfer.intro)}</p>
  ${transferFig(d,ms,done)}${qFlow(d,ms,d.transfer.qs,'t')}${done?tryIt(d,ms):hintHTML(d,ms,'transfer')}`;
},
summary(d,ms){
  const st=statusOf(d,ms),h=ms.hints;
  const ev=[...reqsOf(d,ms).map(r=>r.label.replace(/\.$/,'')+': done.'),...d.explain.map((q,i)=>'You explained: '+q.options.find(o=>o.ok).label)];
  return `<h2 id="screen-title" tabindex="-1">Discovery stamp earned</h2>
  ${guide(st.demonstrated?'You did the new problem all by yourself. Another light is on!':'You finished it. Another light is on! Replay later to try the new problem without hints.','happy')}
  <div class="row${UI.celebrate?' celebrate':''}" style="align-items:center;gap:18px">
    <svg class="stamp" viewBox="0 0 120 120" role="img" aria-label="Discovery stamp for ${esc(d.title)}"><circle cx="60" cy="60" r="54" style="fill:none;stroke:var(--lagoon);stroke-width:5;stroke-dasharray:4 5"/><circle class="sc-surface" cx="60" cy="60" r="44" style="stroke:var(--lagoon);stroke-width:3"/><g class="lit" transform="translate(10 4)">${rays(50,52,20,28,6)}<circle class="glass" cx="50" cy="52" r="13"/></g><text x="60" y="100" text-anchor="middle" class="lbl-strong">${d.grade}·${d.number}</text></svg>
    <div class="stack" style="flex:1;min-width:220px"><div class="summary-line">${starsHTML(missionStars(d,ms),STAR_TEXT[missionStars(d,ms)])}<span class="stat">${sparkIcon}<b>${STAR_SPARKS[missionStars(d,ms)]}</b> sparks for this mission</span></div><p class="small muted">${STAR_TEXT[missionStars(d,ms)]}.${missionStars(d,ms)<3?' Replay without hints to reach 3 stars.':''}</p><p class="eyebrow">The idea</p><p style="font-size:1.15rem"><b>${esc(d.learned)}</b></p></div></div>
  <div class="panel"><p class="eyebrow">Your evidence</p><ul>${ev.map(e=>`<li>${esc(e)}</li>`).join('')}</ul></div>
  <div class="panel"><p class="eyebrow">Support used</p><div class="tablewrap"><table><tbody>${[['Investigation',h.play],['Explanation',h.explain],['New problem',h.transfer]].map(([k,v])=>`<tr><td>${k}</td><td>${v?`${v} hint${v>1?'s':''}`:'No hints'}</td></tr>`).join('')}</tbody></table></div>
    ${chipsFor(st)}<p class="small muted">${st.demonstrated?'You solved the new problem on your own.':'You solved the new problem with some hints. Try a replay later to do it on your own.'} These are learning notes for this app, not school grades.</p></div>
  <div class="row"><button type="button" class="btn primary" id="sum-next" data-action="next-mission">Next mission →</button><button type="button" class="btn" id="sum-hub" data-action="to-hub">Back to missions</button><button type="button" class="btn" id="sum-replay" data-action="reset-mission">Replay this mission</button><a class="btn quiet" href="https://science.atollingo.com/" target="_blank" rel="noopener">Science Lagoon lessons ↗</a></div>`;
}
};
function qFlow(d,ms,qs,pre){
  let out='';
  for(let i=0;i<qs.length;i++){
    const q=qs[i],k=pre+i,ok=ms.checked[k]&&okOpt(q,ms.answers[k]);
    out+=`<div class="stack"><p${big(d)?' style="font-size:1.15rem"':''}><b>${qs.length>1?`${i+1}. `:''}${esc(q.q)}</b></p>${sayBtn(q.q)}
      ${optionGroup(d,'q-answer',k,q.options,ms.answers[k],q.q,ok)}
      ${ok?'':`<div><button type="button" class="btn primary" id="check-${k}" data-action="q-check" data-k="${k}" ${ms.answers[k]?'':'disabled'}>Check</button></div>`}
      ${feedbackHTML(k)}</div>`;
    if(!ok) break;
  }
  return out;
}
function currentTapQ(d,ms){
  const i=d.transfer.qs.findIndex((q,j)=>!(ms.checked['t'+j]&&okOpt(q,ms.answers['t'+j])));
  return i>=0&&d.transfer.qs[i].tap?i:-1;
}
function transferFig(d,ms,done){
  const f=d.transfer.fig;if(!f) return '';
  if(f.type==='scene') return `<div class="figure">${sceneHTML(f.key)}</div>`;
  if(f.type==='circuit'){
    const L=LAYOUTS[f.layout],ti=currentTapQ(d,ms),sel=ti>=0?ms.answers['t'+ti]:null;
    const r=ms.tState.tested?runModel(L,ms.tState.set):null;
    return `<figure class="figure">${circuitSVG(L,ms.tState.set,{act:ti>=0?'tq':null,hl:sel?[sel]:[],lit:r&&r.status==='ok'?r.lit:undefined})}</figure>`;
  }
  if(f.type==='solar'){const r=ms.tState.tested?runSolar(ms.tState.set):null;return `<figure class="figure">${solarScene(ms.tState.set,r)}</figure>`;}
  if(f.type==='switch'){
    const on=ms.tState.sw==='closed',dev=DEVICE[f.device];
    if(!done) return `<div class="figure"><div class="row" style="justify-content:center">${switchPic(on).replace('<svg','<svg style="width:140px;height:140px"')}</div><p class="muted small" style="text-align:center">The ${dev.name} is hidden until you answer.</p></div>`;
    return `<div class="figure">${dev.scene(deviceOn(ms.tState.sw),f.device==='path'?on:undefined)}</div>`;
  }
  return '';
}
function tryIt(d,ms){
  const f=d.transfer.fig;if(!f||f.type==='scene') return '';
  if(f.type==='switch'){const on=ms.tState.sw==='closed';return `<div class="panel"><p><b>Check it.</b> Press the switch and watch.</p><div class="row" style="justify-content:center"><button type="button" class="pic" id="t-toggle" data-action="t-toggle" aria-pressed="${on}" aria-label="Switch, now ${on?'on':'off'}.">${switchPic(on)}<span>Switch ${on?'ON':'OFF'}</span></button></div><p role="status">The ${DEVICE[f.device].name} is ${pill(deviceOn(ms.tState.sw))}.</p></div>`;}
  const r=ms.tState.tested?(f.type==='circuit'?runModel(LAYOUTS[f.layout],ms.tState.set):runSolar(ms.tState.set)):null;
  const res=r?(r.status!=='ok'?'Model unavailable.':f.type==='circuit'?LAYOUTS[f.layout].components.filter(k=>k.type==='bulb').map(b=>`${esc(b.name)} ${pill(r.lit[b.id])}`).join(' '):`Lamp ${pill(r.lit)}`):'';
  return `<div class="panel"><p><b>Check it.</b> Run the model on this new layout.</p><div class="row"><button type="button" class="btn" id="t-test" data-action="t-test">Test it</button></div>${res?`<p role="status">${res}</p>`:''}</div>`;
}
function missionHTML(){
  const d=def(),ms=cur(),i=STEPS.indexOf(ms.step),max=maxStep(d,ms);
  return `<div class="wrap">${topBar()}${settingsHTML()}${notices()}
  <div class="stack"><p class="eyebrow">Grade ${d.grade} · Mission ${d.number} of 10 · ${ENGINE_NAME[d.play.engine]}</p><p style="font-family:var(--display);font-size:1.25rem;font-weight:600;color:var(--lagoon-strong)">${esc(d.title)}</p>
  <ol class="steps" aria-label="Mission steps">${STEPS.map((s,j)=>`<li class="${j<i?'done':''}" ${j===i?'aria-current="step"':''}>${STEP_LABEL[s]}</li>`).join('')}</ol></div>
  <section class="screen stack" aria-labelledby="screen-title">${SCREENS[ms.step](d,ms)}</section>
  <div class="nav"><div class="row">${i>0?`<button type="button" class="btn" id="back" data-action="go" data-step="${i-1}">← Back</button>`:''}
    ${UI.confirm==='mission'?`<span class="note warn row"><span>Start a fresh attempt? Your tests and answers for this mission will be cleared.</span><button type="button" class="btn danger" id="confirm-yes" data-action="confirm-yes">Start fresh</button><button type="button" class="btn" id="confirm-no" data-action="confirm-no">Keep my work</button></span>`
      :`<button type="button" class="btn quiet" id="reset-mission" data-action="reset-mission">Start again</button>`}</div>
    ${i<6?`<button type="button" class="btn primary big" id="next" data-action="go" data-step="${i+1}" ${i+1<=max?'':'disabled'}>Next →</button>`:''}</div></div>`;
}

/* ================= Actions ================= */
function markInteracted(){const m=cur();if(m) m.interacted=true;}
function setStep(i){
  const d=def(),ms=cur();if(i<0||i>maxStep(d,ms)) return;
  const was=ms.step;ms.step=STEPS[i];resetUI();
  if(STEPS[i]==='summary'&&was!=='summary'){UI.celebrate=true;UI.justLit=d.id;sfx('stamp');}
  save();render(true);
}
function pushTrial(ms,t){ms.trialCount++;t.n=ms.trialCount;ms.trials.push(t);if(ms.trials.length>MAX_TRIALS) ms.trials.shift();}
function openMission(id){
  const d=MISSIONS[id];if(!d) return;
  if(!S.missions[id]) S.missions[id]=freshMission(d);
  else{const st=statusOf(d,S.missions[id]);if(st.demonstrated||st.assisted) S.missions[id].step='brief';}
  S.current=id;S.grade=d.grade;UI.view='mission';UI.settings=false;resetUI();save();render(true);
}
const A={
  settings(){UI.settings=!UI.settings;UI.confirm=null;render();if(UI.settings){const h=document.getElementById('settings-title');h&&h.focus();}},
  teacher(_,e){e.preventDefault();UI.teacher=!UI.teacher;render();},
  grade(el){S.grade=+el.dataset.grade;save();render();announce(`Grade ${S.grade} selected.`);},
  'pick-grade'(el){S.grade=+el.dataset.grade;UI.view='hub';UI.settings=false;resetUI();sfx('tap');save();render(true);},
  home(){UI.view='home';UI.settings=false;resetUI();save();render(true);},
  pref(el){const k=el.dataset.pref;S.prefs[k]=!S.prefs[k];if(k==='mute'&&S.prefs.mute&&'speechSynthesis' in window)try{speechSynthesis.cancel();}catch(e){}applyPrefs();save();render();},
  copy(){
    const box=document.getElementById('export-box'),txt=box.value;
    const done=m=>{UI.copy=m;const st=document.getElementById('copy-status');if(st)st.textContent=m;};
    try{navigator.clipboard.writeText(txt).then(()=>done('Copied.'),()=>{box.select();done('Selected. Press Ctrl+C or ⌘C to copy.');});}
    catch(e){box.select();done('Selected. Press Ctrl+C or ⌘C to copy.');}
  },
  'reset-all'(){UI.confirm='all';render();},
  'reset-mission'(){UI.confirm='mission';render();},
  'confirm-no'(){UI.confirm=null;render();},
  'confirm-yes'(){
    if(UI.confirm==='all'){const g=S.grade,p=S.prefs;S=freshStore();S.grade=g;S.prefs=p;loadNotices=[];UI.view='home';resetUI();save();render(true);announce('All progress cleared.');}
    else if(UI.confirm==='mission'){const d=def();S.missions[d.id]=freshMission(d);resetUI();save();render(true);announce('Fresh attempt started.');}
  },
  start(el){openMission(el.dataset.id);},
  'next-mission'(){const d=def(),ids=Object.keys(MISSIONS),i=ids.indexOf(d.id);if(i<ids.length-1) openMission(ids[i+1]);else A['to-hub']();},
  'to-hub'(){UI.view='hub';UI.settings=false;resetUI();if(S.current&&MISSIONS[S.current]) S.grade=MISSIONS[S.current].grade;if('speechSynthesis' in window)try{speechSynthesis.cancel();}catch(e){}save();render(true);},
  go(el){setStep(+el.dataset.step);},
  say(el){speak(el.dataset.text);},
  noop(){},
  predict(el){const ms=cur();ms.prediction=Object.assign({reason:null,aloud:false},ms.prediction,{choice:el.dataset.v});markInteracted();save();render();},
  reason(el){const ms=cur();if(!ms.prediction){announce('Choose a prediction first.');return;}ms.prediction.reason=ms.prediction.reason===el.dataset.v?null:el.dataset.v;save();render();},
  aloud(){const ms=cur();if(!ms.prediction){announce('Choose a picture first.');return;}ms.prediction.aloud=!ms.prediction.aloud;save();render();},
  'aloud-ex'(){const ms=cur();if(ms.answers.aloud) delete ms.answers.aloud;else ms.answers.aloud=true;save();render();},
  hint(el){const ms=cur(),k=el.dataset.scope;ms.hints[k]=Math.min(3,(ms.hints[k]||0)+1);save();render();
    if(!document.getElementById('hint-'+k)){const h=document.querySelector('.hintbox');if(h){h.setAttribute('tabindex','-1');h.focus();}}},
  'q-answer'(el){const ms=cur(),k=el.dataset.q;ms.answers[k]=el.dataset.v;ms.checked[k]=false;UI.feedback=null;markInteracted();save();render();},
  'q-check'(el){
    const d=def(),ms=cur(),k=el.dataset.k,qs=k[0]==='e'?d.explain:d.transfer.qs,q=qs[+k.slice(1)],o=q.options.find(x=>x.id===ms.answers[k]);
    if(!o) return;
    ms.checked[k]=!!o.ok;
    UI.feedback={scope:k,ok:o.ok,text:(o.fb||(o.ok?'Yes.':'Not quite.'))+(o.ok?'':' Try again.')};
    sfx(o.ok?'ok':'retry');save();render();announce(UI.feedback.text);
    if(o.ok){const n=document.querySelector(`[id^="${k[0]}${+k.slice(1)+1}-"]`)||document.getElementById('next');n&&n.focus();}
  },
  tq(el){const d=def(),ms=cur(),i=currentTapQ(d,ms);if(i<0) return;const q=d.transfer.qs[i],id=el.dataset.id;
    if(!q.options.some(o=>o.id===id)){announce('That part isn’t one of the choices. Try another part.');return;}
    ms.answers['t'+i]=id;ms.checked['t'+i]=false;UI.feedback=null;save();render();},
  't-test'(){const ms=cur();ms.tState.tested=true;save();render();announce('Model result shown.');},
  't-toggle'(){const ms=cur();ms.tState.sw=ms.tState.sw==='closed'?'open':'closed';save();render();announce(`Switch ${ms.tState.sw==='closed'?'on':'off'}.`);},
  /* sort */
  'sort-place'(el){const ms=cur();ms.play.place[el.dataset.item]=el.dataset.bin;markInteracted();UI.feedback=null;UI.sortFocus=null;sfx('tap');save();render();
    if(big(def())){const n=document.querySelector('.bigcard')?document.querySelector('.pics .pic'):document.getElementById('sort-check');n&&n.focus({preventScroll:true});}},
  'sort-focus'(el){UI.sortFocus=el.dataset.item;UI.feedback=null;render();const n=document.querySelector('.pics .pic');n&&n.focus();},
  'sort-check'(){
    const d=def(),ms=cur(),cfg=d.play;if(!cfg.items.every(i=>ms.play.place[i[0]])) return;
    pushTrial(ms,{place:clone(ms.play.place)});
    const r=ENG.sort.evalT(cfg,[ms.trials[ms.trials.length-1]])[0];
    UI.feedback={scope:'play',ok:r.correct,text:r.correct?'Every card is in the right group.':`${r.wrong.length} card${r.wrong.length>1?'s need':' needs'} another look. They are marked ↻.`};
    sfx(r.correct?'ok':'retry');save();render();announce(UI.feedback.text);
  },
  /* sequence */
  'seq-add'(el){const ms=cur();if(!ms.play.seq.includes(el.dataset.id)) ms.play.seq.push(el.dataset.id);markInteracted();UI.feedback=null;save();render();
    const n=document.querySelector('.cards .card')||document.getElementById('seq-check');n&&n.focus();},
  'seq-undo'(){const ms=cur();ms.play.seq.pop();UI.feedback=null;save();render();},
  'seq-clear'(){const ms=cur();ms.play.seq=[];UI.feedback=null;save();render();},
  'seq-check'(){
    const d=def(),ms=cur(),cfg=d.play;if(ms.play.seq.length!==cfg.cards.length) return;
    pushTrial(ms,{seq:ms.play.seq.slice()});
    const firstWrong=ms.play.seq.findIndex((x,i)=>x!==cfg.cards[i][0]);
    UI.feedback={scope:'play',ok:firstWrong<0,text:firstWrong<0?'That order is right.':firstWrong===0?'The first card isn’t right yet. What happens at the very start?':`The first ${firstWrong} card${firstWrong>1?'s are':' is'} in the right place. Look again from card ${firstWrong+1}.`};
    sfx(firstWrong<0?'ok':'retry');save();render();announce(UI.feedback.text);
  },
  /* switch */
  'sw-toggle'(){const ms=cur(),d=def();ms.play.sw=ms.play.sw==='closed'?'open':'closed';markInteracted();UI.feedback=null;save();render();announce(`Switch ${ms.play.sw==='closed'?'on':'off'}. What is the ${DEVICE[d.play.device].name} doing?`);},
  'sw-observe'(el){
    const ms=cur(),d=def(),on=deviceOn(ms.play.sw),v=el.dataset.v,dev=DEVICE[d.play.device];
    if((v==='on')!==on){UI.feedback={scope:'play',ok:false,text:d.play.device==='fan'?(on?'Look again. Can you see wavy air lines next to the fan?':'Look again. Are the blades blurred or still?'):(on?'Look again. Can you see light rays and a glow?':'Look again. Is it bright or dim?')};sfx('retry');render();announce(UI.feedback.text);return;}
    sfx('ok');
    pushTrial(ms,{sw:ms.play.sw,observed:v});
    UI.feedback={scope:'play',ok:true,text:`Yes. Switch ${ms.play.sw==='closed'?'on':'off'}, ${dev.name} ${v==='on'?(d.play.device==='fan'?'spinning':'on'):(d.play.device==='fan'?'still':'off')}.`};
    save();render();announce(UI.feedback.text);
  },
  /* circuit */
  'c-part'(el){
    const d=def(),ms=cur(),cfg=d.play,L=LAYOUTS[cfg.layout],id=el.dataset.id,set=ms.play.set;markInteracted();UI.msg=null;
    const editable=cfg.edit||L.connectors.map(c=>c.id);
    if(id==='sw'){
      if(cfg.lockSwitch){announce('The switch stays closed in this mission.');render();return;}
      set.switches.sw=set.switches.sw==='closed'?'open':'closed';UI.sel=null;UI.hl=[];announce(`Switch ${set.switches.sw}.`);
      if(set.switches.sw==='closed'&&ms.trials.length&&vals(set).some(v=>!cond(v))){
        ms.switchCloses++;UI.msg='The switch is closed. Follow the rest of the path to find a gap.';
        const after=L.path[L.path.indexOf('sw')+1];UI.hl=after?[after]:[];
      }
    } else if(editable.includes(id)){UI.sel=UI.sel===id?null:id;UI.hl=UI.sel?[UI.sel]:[];}
    else announce(L.connectors.some(c=>c.id===id)?'That connector stays as it is in this mission.':'That part stays in place in this mission.');
    save();render();
  },
  'c-mat'(el){
    const ms=cur(),m=el.dataset.mat,id=UI.sel,L=LAYOUTS[def().play.layout];
    if(id&&m!=='cancel'){ms.play.set.connectors[id]=m==='gap'?null:m;announce(`${L.connectors.find(c=>c.id===id).name}: ${matName(ms.play.set.connectors[id])}. Press Test to check.`);}
    UI.sel=null;UI.hl=[];save();render();const t=document.getElementById(id?'part-'+id:'c-test');t&&t.focus();
  },
  'c-follow'(){const L=LAYOUTS[def().play.layout];UI.sel=null;UI.msg=null;markInteracted();UI.inspect=UI.inspect>=L.path.length-1?0:UI.inspect+1;const st=L.path[UI.inspect];UI.hl=st==='start'||st==='end'?['bat']:[st];render();},
  'c-test'(){runTest('circuit');},
  /* solar */
  's-set'(el){const ms=cur(),d=def();if(!d.play.edit.includes(el.dataset.k)) return;ms.play.set[el.dataset.k]=el.dataset.v;markInteracted();UI.feedback=null;save();render();},
  's-test'(){runTest('solar');}
};
function runTest(kind){
  if(UI.testing) return;
  const d=def(),ms=cur();UI.testing=true;UI.sel=null;UI.msg=null;markInteracted();render();
  setTimeout(()=>{
    const snap=clone(ms.play.set);pushTrial(ms,{set:snap});UI.testing=false;UI.hl=[];UI.inspect=-1;save();render();
    const r=kind==='circuit'?runModel(LAYOUTS[d.play.layout],snap):runSolar(snap);
    const anyLit=r.status==='ok'&&(kind==='circuit'?Object.values(r.lit).some(Boolean):r.lit);
    sfx(anyLit?'lit':'off');
    announce(r.status!=='ok'?'Model unavailable for this layout.':kind==='circuit'?`Test ${ms.trialCount}: `+Object.entries(r.lit).map(([k,v])=>`${LAYOUTS[d.play.layout].components.find(c=>c.id===k).name} ${v?'on':'off'}`).join(', ')+'.':`Test ${ms.trialCount}: lamp ${r.lit?'on':'off'}.`);
  },S.prefs.reducedMotion?0:380);
}

/* ================= Render & events ================= */
const $app=document.getElementById('app');
function render(toTop){
  const active=document.activeElement&&document.activeElement.id;
  if(UI.view==='mission'&&!cur()) UI.view='hub';
  $app.innerHTML=UI.view==='home'?homeHTML():UI.view==='hub'?hubHTML():UI.view==='mission'?missionHTML():(VIEWS[UI.view]||homeHTML)();
  if(UI.view==='hub') UI.justLit=null;
  document.documentElement.classList.toggle('onescreen',UI.view==='home'&&!UI.settings);
  if(toTop){window.scrollTo(0,0);const h=document.getElementById('screen-title');h&&h.focus({preventScroll:true});}
  else if(active){const el=document.getElementById(active);if(el&&!el.disabled) el.focus({preventScroll:true});}
}
$app.addEventListener('click',e=>{
  const el=e.target.closest('[data-action]');
  if(!el||!$app.contains(el)||el.disabled) return;
  const fn=A[el.dataset.action];if(fn){fn(el,e);checkRewards();}
});
window.addEventListener('beforeunload',save);
