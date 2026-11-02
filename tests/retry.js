const {chromium}=require('playwright');
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mobile/15E148 Safari/604.1';
const UA2='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const ctx=await b.newContext({userAgent:UA2,viewport:{width:390,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export function getGenerativeModel(ai,params){return {async generateContent(req){const n=(window.__n=(window.__n||0)+1);
 if(Array.isArray(req))return {response:{text:()=>'My name is Felu'}};
 return {response:{text:()=>JSON.stringify({reply:n===1?'Hello Felu! What is your name?':'Nice! How old are you?',ok:true,tip:'',model:'',end:false})}}}}}`)));
await p.addInitScript(()=>{
  try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1}')}catch(e){}
  window.__negar=true;
  const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  navigator.mediaDevices.getUserMedia=async c=>{if(window.__negar)throw new DOMException('denied','NotAllowedError');return real(c)};
  speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),5);setTimeout(()=>u.onend&&u.onend(),30)};});
await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
await p.click('#t-speak');await p.click('#practice-start');
await p.waitForFunction(()=>!document.getElementById('practice-type').hidden,null,{timeout:30000});
const txt=()=>p.evaluate(()=>({tmsg:document.getElementById('practice-tmsg').innerText.slice(0,120),kb:document.getElementById('practice-kb').textContent,typeVisible:!document.getElementById('practice-type').hidden}));
console.log('1) con el permiso DENEGADO:',JSON.stringify(await txt()));
await p.evaluate(()=>{window.__negar=false});          // el usuario arregló el permiso en Ajustes
await p.click('#practice-kb');
await p.waitForFunction(()=>!document.getElementById('practice-mic').hidden&&/Te escucho|Grabando/.test(document.getElementById('practice-mict').textContent),null,{timeout:30000});
console.log('2) tras tocar «Probar el micrófono otra vez»:',JSON.stringify(await txt()),'| el micrófono quedó escuchando solo: sí | aviso:',await p.evaluate(()=>document.getElementById('practice-st').innerText.slice(0,70)));
console.log('errores de página:',errs);await b.close()})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
