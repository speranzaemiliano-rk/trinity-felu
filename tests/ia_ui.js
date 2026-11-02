const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const p=await b.newPage({viewport:{width:430,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  window.__sys=window.__sys||[];window.__sys.push(sys.slice(0,60));window.__schema=window.__schema||!!(params.generationConfig&&params.generationConfig.responseSchema);
  if(/friendly English teacher/.test(sys))return {response:{text:()=>JSON.stringify({en:'dog',example:'I have a dog.',example_es:'Tengo un perro.'})}};
  const n=(window.__n=(window.__n||0)+1);
  const turnos=[
   {reply:'Hello Felu! How are you today?',ok:true,tip:'',model:'',end:false,picture:'',hints:[{es:'estoy bien',en:"I'm fine"}],help:''},
   {reply:"Nice! Now, let's talk about your home. How many rooms are there in your house?",ok:true,tip:'',model:'',end:false,picture:'',hints:[{es:'hay',en:'there are'},{es:'habitaciones',en:'rooms'}],help:'«cuarto» se dice room.'},
   {reply:'Look at this picture. What is he doing?',ok:true,tip:'',model:'',end:false,picture:'🏊',hints:[{es:'nadando',en:'swimming'}],help:''},
   {reply:'Now, do you have a question for me?',ok:true,tip:'',model:'',end:false,picture:'',hints:[{es:'¿Tenés…?',en:'Do you have…?'}],help:''},
   {reply:'I like pizza. Thank you, goodbye!',ok:true,tip:'',model:'',end:true,picture:'',hints:[],help:''}];
  return {response:{text:()=>JSON.stringify(turnos[Math.min(n-1,turnos.length-1)])}};
}}}`)));
await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[];});
await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(t)}});
await p.click('#t-speak');await p.evaluate(()=>{const c=document.getElementById('practice-tap');if(c)c.checked=true});await p.click('#practice-start');
await p.waitForSelector('#practice-talk:not([hidden])',{timeout:20000});
await p.click('#practice-kb');await p.waitForTimeout(300);
for(let i=0;i<5;i++){
  const fin=await p.evaluate(()=>!document.getElementById('practice-start').hidden);if(fin)break;
  await p.waitForSelector('#practice-in:visible',{timeout:15000}).catch(()=>{});
  await p.fill('#practice-in','I live in a house with four rooms and a garden');await p.click('#practice-send');await p.waitForTimeout(700);
}
const r=await p.evaluate(()=>({dibujo:[...document.querySelectorAll('#practice-chat .bigpic')].map(x=>x.textContent),
  fichas:[...document.querySelectorAll('#practice-chat .hchip')].map(x=>x.textContent.replace(/\s+/g,' ').trim()),
  ayudaIA:[...document.querySelectorAll('#practice-chat .msg.tip')].map(x=>x.innerText).filter(t=>/cuarto/.test(t)),
  dichos:window.__dichos.slice(0,6),turnos:window.__n}));
console.log(JSON.stringify(r,null,1));
// ❓ ¿Cómo se dice…?
await p.click('#practice-how');
await p.fill('#practice-howin','cocina');await p.click('#practice-howgo');await p.waitForTimeout(300);
await p.fill('#practice-howin','perro');await p.click('#practice-howgo');await p.waitForTimeout(800);
console.log('esquema enviado a la IA:',await p.evaluate(()=>window.__schema));console.log('cómo se dice →',JSON.stringify(await p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg.tip')].slice(-2).map(x=>x.innerText.replace(/\s+/g,' ')))));
console.log('errores de página:',errs);await b.close()})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
