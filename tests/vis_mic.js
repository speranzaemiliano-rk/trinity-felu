const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const vis=(p,id)=>p.evaluate(i=>{const e=document.getElementById(i);return getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0},id);
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v)=>{res.push(v);console.log(v?'✓':'✗',n)};
for(const [nombre,ua] of [['PC',undefined],['iPhone simulado',UA]]){
 const ctx=await b.newContext(ua?{userAgent:ua,viewport:{width:390,height:900}}:{viewport:{width:430,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
 await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
 await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){await new Promise(r=>setTimeout(r,300));return {response:{text:()=>'My name is Felu'}}}
  if(/turn=/.test(String(params.systemInstruction))){const n=(window.__n=(window.__n||0)+1);
    return {response:{text:()=>JSON.stringify({reply:'Nice! Question number '+n+'?',ok:true,tip:'',model:'',end:false,picture:'',hints:[],help:''})}}}
  return {response:{text:()=>'hi'}};}}}`)));
 await p.addInitScript(()=>{try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1}')}catch(e){};Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__ev=[]});
 await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));
 await p.evaluate(()=>{window.say=async t=>{window.__ev.push(String(t).slice(0,30))}});
 await p.click('#t-speak');
 chk(nombre+': en reposo la caja roja NO se ve',!(await vis(p,'practice-mic')));
 await p.click('#practice-start');
 await p.waitForFunction(()=>{const e=document.getElementById('practice-mic');return getComputedStyle(e).display!=='none'&&/Te escucho/.test(e.innerText)},null,{timeout:30000});
 chk(nombre+': mientras escucha SÍ se ve («Te escucho…»)',await vis(p,'practice-mic'));
 await p.waitForFunction(()=>window.__ev.length>=3,null,{timeout:70000});
 await p.click('#practice-stop');await p.waitForTimeout(500);
 chk(nombre+': al tocar «Pausa» desaparece',!(await vis(p,'practice-mic')));
 chk(nombre+': sin errores de página',errs.length===0);
 await ctx.close()}
await b.close();console.log(res.every(Boolean)?'TODO OK':'HAY FALLOS');process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
