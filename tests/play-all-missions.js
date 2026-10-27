const {chromium}=require('playwright');
const path=require('path');const fs=require('fs');
const PAGE='file://'+path.resolve(__dirname,'..','test.html');
const OUT=path.join(__dirname,'output');fs.mkdirSync(OUT,{recursive:true});

(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(PAGE);
// static content validation
const issues=await p.evaluate(()=>{
  const {MISSIONS,PIC}=window.__pti;const out=[];
  for(const d of Object.values(MISSIONS)){
    const chk=(k,w)=>{if(k&&!PIC[k]) out.push(d.id+' missing pic '+k+' at '+w);};
    d.predict.options.forEach(o=>chk(o.pic,'predict'));
    [...d.explain,...d.transfer.qs].forEach((q,i)=>{if(q.options.filter(o=>o.ok).length!==1) out.push(d.id+' q'+i+' ok count '+q.options.filter(o=>o.ok).length);q.options.forEach(o=>chk(o.pic,'q'));});
    const p=d.play;
    if(p.engine==='sort'){const bins=p.bins.map(b=>b[0]);p.items.forEach(i=>{if(!bins.includes(i[2]))out.push(d.id+' bad bin '+i[0]);chk(i[4],'item');});p.bins.forEach(b=>chk(b[2],'bin'));}
    if(p.engine==='sequence') p.cards.forEach(c=>chk(c[2],'card'));
    if(d.grade<=2 && p.engine==='sort' && p.items.some(i=>!i[4])) out.push(d.id+' grade<=2 item without pic');
    if(d.grade<=2 && d.predict.options.some(o=>!o.pic)) out.push(d.id+' grade<=2 predict without pic');
    for(const k of ['play','explain','transfer']) if(!d.hints[k]||d.hints[k].length<(k==='play'?3:2)) out.push(d.id+' hints '+k);
    if(p.engine==='circuit'&&p.steps.length!==p.reqs.length) out.push(d.id+' steps/reqs mismatch');
    if(p.engine==='solar'&&p.steps.length!==p.reqs.length) out.push(d.id+' steps/reqs mismatch');
    if(d.transfer.fig&&d.transfer.fig.type==='circuit'&&d.transfer.qs.some(q=>q.tap)){const L=window.__pti.LAYOUTS[d.transfer.fig.layout];const ids=[...L.connectors.map(c=>c.id),...L.components.map(c=>c.id),'loose'];d.transfer.qs.filter(q=>q.tap).forEach(q=>q.options.forEach(o=>{if(!ids.includes(o.id))out.push(d.id+' tap option not a part '+o.id);}));}
  }
  return out;
});
console.log('content issues:',issues);
// plan for circuit/solar: greedy settings list
const plans=await p.evaluate(()=>{
  const {MISSIONS,ENG,LAYOUTS}=window.__pti;const out={};
  for(const d of Object.values(MISSIONS)){
    const cfg=d.play;if(!['circuit','solar'].includes(cfg.engine)) continue;
    let combos=[];
    if(cfg.engine==='circuit'){
      const L=LAYOUTS[cfg.layout],ed=cfg.edit||L.connectors.map(c=>c.id);
      const vals=[...cfg.mats,...(cfg.allowGap?[null]:[])];
      let sets=[JSON.parse(JSON.stringify(cfg.initial))];
      for(const id of ed){const n=[];for(const s of sets)for(const v of new Set([...vals,cfg.initial.connectors[id]])){const c=JSON.parse(JSON.stringify(s));c.connectors[id]=v;n.push(c);}sets=n;}
      if(!cfg.lockSwitch){sets=sets.flatMap(s=>['open','closed'].map(w=>{const c=JSON.parse(JSON.stringify(s));c.switches.sw=w;return c;}));}
      combos=sets;
    } else {
      let sets=[JSON.parse(JSON.stringify(cfg.initial))];
      const K={panel:['yes','no'],site:['sun','shade'],storage:['yes','no'],time:['day','night']};
      for(const k of cfg.edit){sets=sets.flatMap(s=>K[k].map(v=>Object.assign({},s,{[k]:v})));}
      combos=sets;
    }
    const ev=T=>cfg.reqs.map(([l,f])=>!!f(ENG[cfg.engine].evalT(cfg,T)));
    const T=[];const plan=[];
    if(ev([{set:cfg.initial}]).every(Boolean)) out[d.id]={err:'initial satisfies all'};
    for(let r=0;r<cfg.reqs.length;r++){
      if(ev(T)[r]) continue;
      let found=false;
      for(const reps of [1,2]){for(const c of combos){const t2=T.concat(Array(reps).fill({set:c}));if(ev(t2)[r]){for(let i=0;i<reps;i++){T.push({set:c});plan.push(c);}found=true;break;}}if(found)break;}
      if(!found){out[d.id]={err:'req '+r+' unsatisfiable'};break;}
    }
    if(!out[d.id]) out[d.id]={plan};
  }
  return out;
});
const mk=v=>({connectors:{w1:'metal',w2:'metal',w3:v},switches:{sw:'closed'}});plans['power-g4-02']={plan:['metal','foil','plastic','wood'].map(mk)};
for(const [k,v] of Object.entries(plans)) if(v.err) console.log('PLAN',k,v.err);
const ids=await p.evaluate(()=>Object.keys(window.__pti.MISSIONS));
const meta=await p.evaluate(()=>Object.fromEntries(Object.values(window.__pti.MISSIONS).map(d=>[d.id,{grade:d.grade,play:{engine:d.play.engine,items:d.play.items,cards:d.play.cards,checkpoints:d.play.checkpoints,layout:d.play.layout,initial:d.play.initial,lockSwitch:d.play.lockSwitch},ex:d.explain.map(q=>q.options.find(o=>o.ok).id),tr:d.transfer.qs.map(q=>q.options.find(o=>o.ok).id),pred:d.predict.options[0].id}])));
const c=async s=>{await p.click(s,{timeout:3000});};
const results=[];
for(const id of ids){
  const m=meta[id];
  try{
    await p.evaluate(g=>{},0);
    // go to hub & set grade
    if(await p.$('#to-hub')) await c('#to-hub');
    if(await p.$('#to-home')) await c('#to-home');
    await c('#pick-grade-'+m.grade);
    await c('#start-'+id);await c('#next');
    await c('#pred-'+m.pred);await c('#next');
    const e=m.play.engine;
    if(e==='sort'){for(const it of m.play.items) await c(`#pl-${it[0]}-${it[2]}`);await c('#sort-check');}
    if(e==='sequence'){for(const cd of m.play.cards) await c('#sq-'+cd[0]);await c('#seq-check');}
    if(e==='switch'){await c('#sw-toggle');await c('#obs-on');await c('#sw-toggle');await c('#obs-off');if(m.play.checkpoints){await c('#sw-toggle');await c('#obs-on');}}
    if(e==='circuit'){
      for(const target of plans[id].plan){
        const curSet=await p.evaluate(()=>null);
        // read current displayed state via part buttons is messy; track locally
        if(!m._cur) m._cur=JSON.parse(JSON.stringify(m.play.initial));
        for(const k in target.connectors){if(target.connectors[k]!==m._cur.connectors[k]){await c('#part-'+k);await c('#mat-'+(target.connectors[k]===null?'gap':target.connectors[k]));m._cur.connectors[k]=target.connectors[k];}}
        if(target.switches.sw!==m._cur.switches.sw){await c('#part-sw');m._cur.switches.sw=target.switches.sw;}
        await c('#c-test');await p.waitForTimeout(450);
      }
    }
    if(e==='solar'){
      for(const target of plans[id].plan){for(const k in target){const btn=await p.$(`#s-${k}-${target[k]}`);if(btn&&(await btn.getAttribute('aria-pressed'))!=='true') await btn.click();}await c('#s-test');await p.waitForTimeout(450);}
    }
    if(await p.isDisabled('#next')) throw new Error('play reqs not met');
    await c('#next');await c('#next');
    for(let i=0;i<m.ex.length;i++){await c(`#e${i}-${m.ex[i]}`);await c('#check-e'+i);}
    await c('#next');
    for(let i=0;i<m.tr.length;i++){await c(`#t${i}-${m.tr[i]}`);await c('#check-t'+i);}
    if(await p.$('#t-test')) await c('#t-test');
    if(await p.$('#t-toggle')) await c('#t-toggle');
    await c('#next');
    const title=await p.textContent('#screen-title');const chips=(await p.textContent('.chips')).replace(/\s+/g,' ');
    results.push([id,title.includes('Discovery')&&chips.includes('Demonstrated')?'OK':'?? '+chips]);
    if(['power-g1-03','power-g2-07','power-g4-02','power-g6-02','power-g6-03'].includes(id)) await p.screenshot({path:path.join(OUT,'sum-')+id+'.png'});
  }catch(err){results.push([id,'FAIL '+err.message.split('\n')[0]]);await p.screenshot({path:path.join(OUT,'fail-')+id+'.png',fullPage:true});}
}
console.log(results.filter(r=>r[1]!=='OK'));console.log('ok count',results.filter(r=>r[1]==='OK').length);
await p.reload();await p.waitForTimeout(200);
console.log('home after reload:',(await p.textContent('.pstrip')));await p.screenshot({path:path.join(OUT,'home.png')});await p.emulateMedia({colorScheme:'dark'});await p.screenshot({path:path.join(OUT,'home-dark.png')});
console.log('scrollWidth',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errors',errs.slice(0,10));await b.close();})();
