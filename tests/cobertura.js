// ¿Cuántas frases del examinador «de siempre» (guion) NO tienen audio grabado? Se recorre el guion muchas veces con respuestas distintas.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const faltan=new Map();let total=0,vueltas=16;
for(let v=0;v<vueltas;v++){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));
  await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  const exam=v%2===1;const pre=exam?'oral-':'practice-';
  await p.click(exam?'#t-exam':'#t-speak');
  await p.click('#'+pre+'start');await p.waitForTimeout(500);
  const resp=['I live with my mum and I get up at seven o\'clock and then I play football. It was good. Yes I can swim. It is sunny. It is the first of November. Do you like your job? He is swimming she is cooking they are playing football I am a doctor','Sorry, can you repeat, please?','how old are you','do you like music',
              'si','no se','I have two brothers','my name is Felu','blue'];
  for(let i=0;i<140;i++){
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    await p.waitForSelector('#'+pre+'in:visible',{timeout:4000}).catch(()=>{});
    const vis=await p.evaluate(x=>{const e=document.getElementById(x+'in');return !!(e&&e.offsetParent)},pre);
    if(!vis){await p.click('#'+pre+'kb').catch(()=>{});await p.waitForTimeout(250)}
    await p.fill('#'+pre+'in',resp[(i+v)%resp.length]);await p.click('#'+pre+'send');await p.waitForTimeout(160);
  }
  const dichos=await p.evaluate(()=>window.__dichos);
  const keyset=await p.evaluate(ds=>ds.map(t=>[t,_claveAudio(t)!==null]),dichos);
  keyset.forEach(([t,ok])=>{total++;if(!ok)faltan.set(t,(faltan.get(t)||0)+1)});
  await ctx.close();
}
console.log('frases dichas por el examinador del guion (en',vueltas,'recorridos):',total,'| sin audio grabado:',[...faltan.values()].reduce((a,b)=>a+b,0),'| distintas sin audio:',faltan.size);
[...faltan.entries()].slice(0,60).forEach(([t,n])=>console.log('  SIN AUDIO ×'+n+':',JSON.stringify(t.slice(0,150))));
await b.close()})().catch(e=>{console.log('FALLO',e.message)})
