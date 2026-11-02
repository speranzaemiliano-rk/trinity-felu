// Raphina: ¿todo lo que puede decir el examinador, lo que se toca para estudiar y las preguntas del examen escrito tienen su audio grabado?
// (en iPhone con manos libres no hay otra voz: una frase sin audio se queda sin decir)
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
const TODO="Yes, I did. It was great and I was happy. Last summer we went to the beach by car with my family and my friends, and I played at the shop. I don't like waiting, but I like swimming. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well. I felt tired at home, then we had lunch. The weather was sunny and warm. It cost a lot of money.";
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
async function nueva(){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await p.goto(URL);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});return {p,ctx};
}
// ---- 1) todas las frases posibles (rkTextosGuion), el estudio y el examen escrito
let t=await nueva();let p=t.p;
const est=await p.evaluate(()=>{
  const sin=[];const falta=x=>{if(_claveAudio(x)===null)sin.push(x)};
  const todas=window.rkTextosGuion();todas.forEach(falta);const n1=todas.length;
  const tocables=[];document.querySelectorAll('[data-say], ul.ex li').forEach(el=>{const r=_sonidoDe(el);if(r)tocables.push(r.txt)});tocables.forEach(falta);
  const preg=bank.map(x=>String(x[1]).replace(/_{2,}/g,' blank ').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim());preg.forEach(falta);
  return {n1,n2:tocables.length,n3:preg.length,sin:[...new Set(sin)].slice(0,12),nsin:new Set(sin).size,audios:_AUDIO_SET.size}});
chk('las '+est.n1+' frases del examinador, las '+est.n2+' cosas que se tocan para estudiar y las '+est.n3+' preguntas del examen escrito tienen audio ('+est.nsin+' sin audio)',est.nsin===0,JSON.stringify(est.sin));
await t.ctx.close();

// ---- 2) lo que de verdad dice el examinador en charlas completas (los tres modos)
async function charla(p,pre){
  for(let i=0;i<220;i++){
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    await p.waitForFunction(x=>!document.getElementById(x+'mic').hidden||!document.getElementById(x+'start').hidden,pre,{timeout:10000}).catch(()=>{});
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    const q=await p.evaluate(x=>{const e=[...document.querySelectorAll('#'+x+'chat .msg.ex')].pop();return e?e.innerText:''},pre);
    const r=/topic form/.test(q)?"Here you are.":/question for me|ask me/.test(q)?"Do you like dogs?":/Goodbye|That's all|end of the exam/.test(q)?"Goodbye!":/how are you/.test(q)?"I'm fine, thank you.":/what are we going to talk about|What is your topic|title of your topic/i.test(q)?"My dog Pipa":(i%7===3?"Sorry, can you repeat, please?":(i%9===5?"yes":TODO));
    await p.fill('#'+pre+'in',r);await p.click('#'+pre+'send');await p.waitForTimeout(110);
  }
}
let dichas=0,sinAudio=new Map();
for(const [vuelta,modo,area,pre] of [[0,'completo','azar','practice-'],[1,'tema','azar','practice-'],[2,'conv','azar','practice-'],[3,'conv','food','practice-'],[4,'completo','azar','oral-'],[5,'completo','azar','practice-'],[6,'completo','azar','oral-']]){
  t=await nueva();p=t.p;
  await p.evaluate(m=>{localStorage.setItem(MODO_KEY,JSON.stringify({modo:m.modo,area:m.area}));if(m.hoja)temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})},{modo,area,hoja:vuelta%2});
  await p.reload();await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  await p.click(pre==='oral-'?'#t-exam':'#t-speak');await p.click('#'+pre+'start');await charla(p,pre);
  const r=await p.evaluate(()=>window.__dichos.map(t=>[t,_claveAudio(t)!==null]));
  r.forEach(([x,ok])=>{dichas++;if(!ok)sinAudio.set(x,(sinAudio.get(x)||0)+1)});
  if(p.errs.length)console.log('  error de página:',p.errs[0]);
  await t.ctx.close();
}
chk('en 7 charlas completas el examinador dijo '+dichas+' frases y '+[...sinAudio.values()].reduce((a,b)=>a+b,0)+' no tenían audio',sinAudio.size===0,JSON.stringify([...sinAudio.keys()].slice(0,6)));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
