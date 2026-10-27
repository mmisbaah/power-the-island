const {chromium}=require('playwright');
const path=require('path');const fs=require('fs');
const PAGE='file://'+path.resolve(__dirname,'..','test.html');
const OUT=path.join(__dirname,'output');fs.mkdirSync(OUT,{recursive:true});

(async()=>{
const b=await chromium.launch();
for(const [w,h] of [[360,640],[375,667],[400,800],[768,1024],[1280,720],[1440,900],[667,375]]){
  for(const resume of [false,true]){
    const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();
    const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto(PAGE);
    if(resume){await p.click('#pick-grade-4');await p.click('#start-power-g4-01');await p.click('#to-hub');await p.click('#to-home');}
    const m=await p.evaluate(()=>({sh:document.documentElement.scrollHeight,ih:innerHeight,sw:document.documentElement.scrollWidth,tile:document.querySelector('#pick-grade-1').getBoundingClientRect().height,cont:!!document.getElementById('continue')}));
    console.log(w+'x'+h,resume?'resume':'fresh',m.sh<=m.ih?'FITS':'SCROLLS '+(m.sh-m.ih)+'px','tile',Math.round(m.tile),'sw',m.sw,errs.join(';'));
    if((w===375&&h===667)||(w===1280)) await p.screenshot({path:path.join(OUT,`fit-${w}-${resume?'r':'f'}.png`)});
    await ctx.close();
  }
}
await b.close();})();
