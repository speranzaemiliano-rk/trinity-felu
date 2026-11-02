// Manos libres en iPhone: micrófono abierto toda la charla (se abre con el toque de «Empezar») + el examinador habla SÓLO con audios grabados.
const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const LIBRES='{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1}';
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){window.__tr=(window.__tr||0)+1;await new Promise(r=>setTimeout(r,200));return {response:{text:()=>'My name is Felu'}}}
  return {response:{text:()=>'hi'}};}}}`;
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
async function pagina(b,o){
  const ctx=await b.newContext({userAgent:UA,viewport:{width:390,height:900},serviceWorkers:'block'});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await p.addInitScript(oo=>{
    if(oo.semilla)localStorage.setItem('trinity_sonido3',JSON.stringify(Object.assign({t:Date.now()},JSON.parse(oo.semilla))));
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__gum=0;window.__pistas=[];window.__speak=[];window.__mp3=[];window.__dichos=[];window.__gesto=false;window.__negar=!!oo.negarGum;
    document.addEventListener('click',()=>{window.__gesto=true;setTimeout(()=>{window.__gesto=false},120)},true);
    const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async c=>{window.__gum++;
      if(window.__negar||(window.__soloGesto&&!window.__gesto))throw new DOMException('no','NotAllowedError');
      const s=await real(c);s.getTracks().forEach(t=>window.__pistas.push(t));return s};
    speechSynthesis.speak=u=>{window.__speak.push(u.text);setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
    HTMLMediaElement.prototype.play=function(){const src=this.src.split('/').pop();if(!/silencio/.test(src))window.__mp3.push(src);const s=this;
      Object.defineProperty(s,'paused',{value:false,configurable:true});
      setTimeout(()=>{if(s.src.split('/').pop()!==src)return;Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()},120);return Promise.resolve()}},o);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','index.html'));
  await p.evaluate(()=>{const orig=window.say;window.__say0=orig;
    window.say=function(t,st,op){window.__dichos.push({t:String(t).slice(0,40),vivas:window.__pistas.filter(x=>x.readyState==='live').length,persistente:PERSISTENTE,ctx:(typeof _actx!=='undefined'&&_actx)?_actx.state:'cerrado',sesion:navigator.audioSession.type});return orig(t,st,op)}});
  return {p,ctx};
}
const ESTADO=()=>({vivas:window.__pistas.filter(x=>x.readyState==='live').length,gum:window.__gum,tr:window.__tr||0,hablo:window.__dichos.length,speak:window.__speak.filter(x=>x!=='ok').length,mp3:window.__mp3.length,
  rep:getComputedStyle(document.getElementById('oral-rep')).display!=='none',ia:document.getElementById('oral-ia')?document.getElementById('oral-ia').checked:null,
  tap:document.getElementById('oral-tap').checked,guardado:localStorage.getItem('trinity_tap2'),persistente:PERSISTENTE,ctx:(typeof _actx!=='undefined'&&_actx)?_actx.state:'cerrado'});
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
let t,e;

// 1) manos libres: se abre UNA vez, encadena respuestas sin tocar, el examinador usa sólo audios grabados y no hay botón «Repetir»
t=await pagina(b,{semilla:LIBRES});
chk('iPhone con la revisión «manos libres»: «tocar 🎤» y el examinador con IA vienen destildados',await t.p.evaluate(()=>!document.getElementById('oral-tap').checked&&!document.getElementById('oral-ia').checked));
await t.p.click('#t-exam');await t.p.click('#oral-start');
await t.p.waitForFunction(()=>(window.__tr||0)>=3&&window.__dichos.length>=6,null,{timeout:90000});
e=await t.p.evaluate(ESTADO);const dichos=await t.p.evaluate(()=>window.__dichos);
chk('encadenó '+e.tr+' respuestas SIN tocar 🎤 (el examinador dijo '+e.hablo+' frases)',e.tr>=3);
chk('el micrófono se abrió UNA sola vez en toda la charla (pedidos: '+e.gum+') y sigue abierto ('+e.vivas+' pista viva)',e.gum===1&&e.vivas>=1&&e.persistente);
chk('el examinador habló SÓLO con audios grabados ('+e.mp3+' audios, voz del celular: '+e.speak+' veces)',e.mp3>=4&&e.speak===0);
chk('mientras hablaba el examinador el micrófono estaba abierto (manos libres)',dichos.every(d=>d.vivas>=1&&d.persistente===true));
chk('no hay botón «Repetir pregunta» (se le pide al examinador, como en el examen real)',!e.rep);
chk('un aviso explica la charla manos libres',/Charla manos libres/.test(await t.p.evaluate(()=>document.getElementById('oral-chat').innerText)));
const eco=await t.p.evaluate(()=>window.rkInforme());
chk('el registro mide si el audio del examinador llega al micrófono (eco)',/eco del examinador en el micrófono: máx/.test(eco));
await t.p.click('#oral-stop');await t.p.waitForTimeout(400);
e=await t.p.evaluate(ESTADO);
chk('al pausar se suelta TODO: pistas '+e.vivas+', AudioContext '+e.ctx+', manos libres '+e.persistente,e.vivas===0&&e.ctx==='cerrado'&&!e.persistente);
chk('sin errores de página',t.p.errs.length===0);await t.ctx.close();

// 2) el examinador con IA en iPhone necesita «tocar 🎤»: al tildarlo se tilda solo; y si queda tildado con manos libres, «Empezar» lo apaga y avisa
t=await pagina(b,{semilla:LIBRES});
await t.p.click('#t-exam');await t.p.check('#oral-ia');
chk('tildar «Examinador con IA» en iPhone tilda «Tocar 🎤» (la voz del celular no anda con el micrófono abierto)',await t.p.evaluate(()=>document.getElementById('oral-tap').checked));
await t.p.uncheck('#oral-tap');   // la persona vuelve a manos libres con la IA tildada
await t.p.click('#oral-start');await t.p.waitForSelector('#oral-chat .msg.tip',{timeout:20000});
chk('con manos libres «Empezar» apaga el examinador con IA y lo explica',await t.p.evaluate(()=>!document.getElementById('oral-ia').checked&&/tildá «Tocar 🎤 para hablar»/.test(document.getElementById('oral-chat').innerText)));
await t.ctx.close();

// 3) una frase sin audio grabado se LEE (sólo esa), sin voz del celular
t=await pagina(b,{semilla:LIBRES});
await t.p.click('#t-exam');await t.p.click('#oral-start');await t.p.waitForFunction(()=>window.__dichos.length>=1,null,{timeout:30000});
const r3=await t.p.evaluate(async()=>{const s0=window.__speak.length;const x=await say('Qwerty zxcv unrecorded sentence for the test.',()=>{},{ex:true});return {x,speak:window.__speak.length-s0}});
chk('frase sin audio en manos libres: devuelve false y no usa la voz del celular ('+JSON.stringify(r3)+')',r3.x===false&&r3.speak===0);
await t.ctx.close();

// 4) se corta el micrófono de manos libres (una llamada, otra app): pasa a «tocar 🎤» SÓLO por esta vez y lo explica
t=await pagina(b,{semilla:LIBRES});
await t.p.click('#t-exam');await t.p.click('#oral-start');await t.p.waitForFunction(()=>window.__dichos.length>=2,null,{timeout:40000});
await t.p.evaluate(()=>{window.__soloGesto=true;window.__pistas.forEach(x=>{x.stop();x.dispatchEvent(new Event('ended'))})});   // iOS corta la captura; reabrir sin un toque falla
await t.p.waitForFunction(()=>getComputedStyle(document.getElementById('oral-talk')).display!=='none',null,{timeout:40000});
e=await t.p.evaluate(ESTADO);const aviso=await t.p.evaluate(()=>document.getElementById('oral-st').innerText);
chk('micrófono cortado: pasa a «tocar 🎤», muestra el botón Hablar y vuelve «Repetir pregunta»',e.tap&&e.rep&&!e.persistente);
chk('micrófono cortado: lo explica («Se cortó el micrófono») y NO lo recuerda para siempre (guardado: '+e.guardado+')',/Se cortó el micrófono/.test(aviso)&&e.guardado===null);
await t.ctx.close();

// 5) sin permiso del micrófono: escribir, y el audio no se abre
t=await pagina(b,{semilla:LIBRES,negarGum:true});
await t.p.click('#t-exam');await t.p.click('#oral-start');
await t.p.waitForFunction(()=>!document.getElementById('oral-type').hidden,null,{timeout:30000});
e=await t.p.evaluate(ESTADO);
chk('micrófono denegado: se pasa a escribir y no queda manos libres ni pistas abiertas',!e.persistente&&e.vivas===0);
await t.ctx.close();
// 6) iPhone en «tocar 🎤» (preguntas grabadas): el micrófono se abre al tocar y se SUELTA antes de que hable el examinador
t=await pagina(b,{semilla:'{"tts":0,"mp3":1,"mp3d":1,"ttsd":0}'});
await t.p.click('#t-exam');
chk('iPhone con la revisión «sólo audio grabado»: viene «Tocar 🎤» tildado y el examinador con IA destildado',await t.p.evaluate(()=>document.getElementById('oral-tap').checked&&!document.getElementById('oral-ia').checked));
await t.p.click('#oral-start');
for(let i=0;i<3;i++){
  await t.p.waitForFunction(()=>getComputedStyle(document.getElementById('oral-talk')).display!=='none',null,{timeout:40000});
  const antes=await t.p.evaluate(()=>window.__tr||0);
  await t.p.click('#oral-talk');
  await t.p.waitForFunction(a=>(window.__tr||0)>a,antes,{timeout:40000});await t.p.waitForTimeout(500)}
e=await t.p.evaluate(ESTADO);const d6=await t.p.evaluate(()=>window.__dichos);
chk('iPhone en «tocar 🎤»: cada voz del examinador sonó con el micrófono SUELTO, sin AudioContext y sin el modo «grabar y reproducir» ('+d6.length+' voces)',d6.length>=4&&d6.every(d=>d.vivas===0&&d.ctx==='cerrado'&&d.sesion!=='play-and-record'&&d.persistente===false));
chk('iPhone en «tocar 🎤»: audios grabados ('+e.mp3+') y ninguna voz del celular ('+e.speak+')',e.mp3>=4&&e.speak===0);
await t.ctx.close();
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
