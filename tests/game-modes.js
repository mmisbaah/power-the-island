const {chromium}=require('playwright');
const path=require('path');const fs=require('fs');
const PAGE='file://'+path.resolve(__dirname,'..','test.html');
const OUT=path.join(__dirname,'output');fs.mkdirSync(OUT,{recursive:true});

(async()=>{
const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto(PAGE);
const c=s=>p.click(s,{timeout:3000});
const okId=()=>p.evaluate(()=>{const t=document.querySelector('#screen-title').textContent;const qt=[...document.querySelectorAll('.screen p b')].map(x=>x.textContent);const d=Object.values(window.__pti.MISSIONS).find(m=>m.title===t);for(const q of d.transfer.qs) if(qt.includes(q.q)) return q.options.find(o=>o.ok).id;});
async function playQuiz(n){for(let i=0;i<n;i++){const id=await okId();await c('#qz-'+id);await c('#qz-check');await c('#qz-next');}}
// play two missions first to earn sparks
await c('#pick-grade-1');
for(const [id,plan] of [['power-g1-01',null]]){
  await c('#start-'+id);await c('#next');await c('#pred-no');await c('#next');
  for(const [i,bn] of [['lamp','elec'],['efan','elec'],['radio','elec'],['torch','elec'],['broom','none'],['hfan','none'],['pencil','none'],['scissors','none']]) await c(`#pl-${i}-${bn}`);
  await c('#sort-check');await c('#next');await c('#next');await c('#e0-elec');await c('#check-e0');await c('#next');await c('#t0-bell');await c('#check-t0');await c('#next');
}
await p.waitForTimeout(300);
console.log('toasts after mission:',await p.$$eval('.toast',t=>t.map(x=>x.textContent.replace(/\s+/g,' ').trim())));
await p.screenshot({path:path.join(OUT,'m-summary.png'),fullPage:true});
await c('#sum-hub');await c('#to-home');
await c('#tab-games');await c('#go-daily');await playQuiz(3);
console.log('daily result:',(await p.textContent('.panel')).replace(/\s+/g,' '));
await c('#qz-games');await c('#go-quiz');await playQuiz(5);
console.log('quiz result:',(await p.textContent('.panel')).replace(/\s+/g,' '));
await c('#qz-games');await c('#go-match');
// memory solve: reveal pairs by flipping all in pairs, record labels
const labels={};
for(let i=0;i<12;i+=2){await c('#pc-'+i);labels[i]=await p.getAttribute('#pc-'+i,'aria-label');await c('#pc-'+(i+1));labels[i+1]=await p.getAttribute('#pc-'+(i+1),'aria-label');}
const key=l=>l.replace(/ (picture|word)(, matched)?$/,'');
const groups={};for(const [i,l] of Object.entries(labels)){(groups[key(l)]=groups[key(l)]||[]).push(+i);}
for(const g of Object.values(groups)){const done=await p.getAttribute('#pc-'+g[0],'aria-disabled');if(done) continue;await c('#pc-'+g[0]);await c('#pc-'+g[1]);}
console.log('match:',await p.textContent('#screen-title'));
await p.screenshot({path:path.join(OUT,'m-pairs.png')});
await c('#pairs-back');await c('#go-workshop');
await c('#ws-p-w3');await c('#ws-m-plastic');await c('#ws-test');
console.log('ws:',await p.textContent('.status'));
for(let i=0;i<10;i++) await c('#ws-test');
await c('#ws-k-solar');await c('#ws-s-time-night');await c('#ws-stest');console.log('ws solar:',await p.textContent('.status'));
await p.screenshot({path:path.join(OUT,'m-workshop.png'),fullPage:true});
await c('#tab-shop');await p.screenshot({path:path.join(OUT,'m-shop.png'),fullPage:true});
const buy=await p.$('[id^="buy-"]');if(buy){const id=await buy.getAttribute('id');await buy.click();console.log('bought',id);}
await c('#tab-badges');console.log('badges:',(await p.textContent('.badgegrid')).match(/✓ Earned/g)?.length);
await p.screenshot({path:path.join(OUT,'m-badges.png'),fullPage:true});
await c('#tab-home');await p.screenshot({path:path.join(OUT,'m-home.png')});
await p.reload();console.log('after reload player:',(await p.textContent('.pstrip')).replace(/\s+/g,' '));
console.log('scrollWidth',await p.evaluate(()=>document.documentElement.scrollWidth));
console.log('errors',errs);await b.close();})();
