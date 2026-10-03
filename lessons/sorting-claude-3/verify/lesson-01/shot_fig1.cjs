const path=require('path');
const S='/tmp/claude-1000/-home-jau-Desktop-interview-prep-dsa-algo/6dabc22b-1d21-41fe-8be2-4d878f9962b7/scratchpad';
const puppeteer=require(path.join(S,'node_modules','puppeteer-core'));
const html='file://'+path.resolve(__dirname,'../../lesson-01.html');
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--allow-file-access-from-files']});
 for(const w of [1280,390]){
  const p=await b.newPage(); await p.setViewport({width:w,height:900});
  await p.goto(html,{waitUntil:'load'}); await new Promise(r=>setTimeout(r,600));
  await p.evaluate(()=>{document.querySelector('#pr-requests .reveal').classList.add('open')});
  await new Promise(r=>setTimeout(r,200));
  const sw=await p.evaluate(()=>document.documentElement.scrollWidth);
  const over=await p.evaluate(()=>{const f=document.querySelector('#fig-1');const r=f.getBoundingClientRect();return [r.left,r.right,Array.from(f.querySelectorAll('*')).filter(e=>e.getBoundingClientRect().right>innerWidth+0.5).length]});
  console.log(w,sw,over);
  const el=await p.$('#fig-1'); await el.screenshot({path:path.join(S,'shots',`fig1-${w}.png`)});
  // s01 and s02 sections
  for(const id of ['s01','s02']){const e=await p.$('#'+id); await e.screenshot({path:path.join(S,'shots',`${id}-${w}.png`)});}
 }
 await b.close();
})();
