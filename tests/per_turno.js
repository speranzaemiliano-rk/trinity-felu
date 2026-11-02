// El micrófono se abre sólo para escuchar y se suelta ANTES de que hable el examinador (si no, en iPhone la voz queda muda).
const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const UA_IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
const lanzar=(wav)=>chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+wav,'--autoplay-policy=no-user-gesture-required']});
async function pagina(ctx,o){
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){window.__tr=(window.__tr||0)+1;await new Promise(r=>setTimeout(r,250));return {response:{text:()=>'My name is Felu'}}}
  if(/turn=/.test(String(params.systemInstruction))){const n=(window.__n=(window.__n||0)+1);
    return {response:{text:()=>JSON.stringify({reply:'Nice! Question number '+n+'?',ok:true,tip:'',model:'',end:n>=9,picture:'',hints:[],help:''})}}}
  return {response:{text:()=>'hi'}};}}}`)));
  await p.addInitScript(o=>{
    try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1}')}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    window.__gum=0;window.__pistas=[];window.__ev=[];window.__vivoEnSay=[];window.__gesto=false;window.__exigirGesto=!!o.exigirGesto;window.__bloquear=!!o.bloquearAudio;
    document.addEventListener('click',()=>{window.__gesto=true;setTimeout(()=>{window.__gesto=false},120)},true);   // la «activación» de un toque dura poco
    const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async c=>{window.__gum++;
      if(window.__exigirGesto&&!window.__gesto)throw new DOMException('sin toque','NotAllowedError');
      const s=await real(c);s.getTracks().forEach(t=>window.__pistas.push(t));return s};
    if(o.bloquearAudio){   // el audio del navegador queda «suspended» y resume() nunca vuelve (iPhone sin un toque)
      const Real=window.AudioContext;
      window.AudioContext=function(){const c=new Real();if(window.__bloquear){Object.defineProperty(c,'state',{get:()=>'suspended'});c.resume=()=>new Promise(()=>{})}return c};
      window.AudioContext.prototype=Real.prototype;window.webkitAudioContext=window.AudioContext}
  },o||{});
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  await p.evaluate(()=>{window.say=async t=>{window.__ev.push(String(t).slice(0,30));
    window.__vivoEnSay.push({vivas:window.__pistas.filter(x=>x.readyState==='live').length,ctx:(typeof _actx!=='undefined'&&_actx)?_actx.state:'cerrado',sesion:navigator.audioSession.type})}});
  return p;
}
const ESTADO=()=>({vivas:window.__pistas.filter(x=>x.readyState==='live').length,gum:window.__gum,tr:window.__tr||0,ev:window.__ev.length,
  tap:document.getElementById('practice-tap').checked,guardado:localStorage.getItem('trinity_tap3'),
  talkVisible:getComputedStyle(document.getElementById('practice-talk')).display!=='none',
  aviso:(document.getElementById('practice-st').hidden?'':document.getElementById('practice-st').innerText),
  sonaron:window.__vivoEnSay.length,conMicAbierto:window.__vivoEnSay.filter(x=>x.vivas>0||x.ctx!=='cerrado'||x.sesion==='play-and-record').length,
  sesion:navigator.audioSession.type,ctxAhora:(typeof _actx!=='undefined'&&_actx)?_actx.state:'cerrado'});
(async()=>{
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
let b=await lanzar('speech_ruido.wav');

// A) PC: automático de verdad: encadena turnos sin tocar y el micrófono NUNCA está abierto cuando habla el examinador
for(const [nombre,ua] of [['PC',undefined]]){
  const ctx=await b.newContext(ua?{userAgent:ua,viewport:{width:390,height:900},serviceWorkers:'block'}:{viewport:{width:430,height:900},serviceWorkers:'block'});
  const p=await pagina(ctx,{});
  await p.click('#t-speak');await p.click('#practice-start');
  await p.waitForFunction(()=>window.__ev.length>=5,null,{timeout:70000});
  const e=await p.evaluate(ESTADO);
  chk(nombre+': encadenó '+e.tr+' respuestas SIN tocar 🎤 (el examinador dijo '+e.ev+' frases)',e.tr>=4&&!e.tap);
  chk(nombre+': cuando habló el examinador ('+e.sonaron+' veces) había '+e.conMicAbierto+' veces el micrófono, el audio o el modo «grabar y reproducir» abiertos',e.sonaron>=5&&e.conMicAbierto===0);
  chk(nombre+': abrió el micrófono por turno (pedidos: '+e.gum+') y no dejó ninguno abierto ahora ('+e.vivas+' pistas vivas)',e.gum>=e.tr&&e.vivas<=1);
  await p.click('#practice-stop');await p.waitForTimeout(500);
  chk(nombre+': al pausar no queda ninguna pista viva',(await p.evaluate(ESTADO)).vivas===0);
  chk(nombre+': no se guardó «tocar 🎤» (sigue automático)',(await p.evaluate(ESTADO)).guardado===null&&p.errs.length===0);
  await ctx.close()}

// D) PC: si no se puede abrir solo, avisa con el motivo y NO recuerda nada (puede ser algo pasajero)
{
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});
  const p=await pagina(ctx,{exigirGesto:true});
  await p.click('#t-speak');await p.click('#practice-start');
  await p.waitForFunction(()=>getComputedStyle(document.getElementById('practice-talk')).display!=='none',null,{timeout:30000});
  const e=await p.evaluate(ESTADO);
  chk('PC sin permiso de abrir solo: pasa a «tocar 🎤» con el motivo y sin recordarlo',e.tap&&e.guardado===null&&/No pude abrir el micrófono solo \(NotAllowedError\)/.test(e.aviso));
  chk('PC sin permiso de abrir solo: modo de audio «'+e.sesion+'» y AudioContext '+e.ctxAhora,e.sesion==='auto'&&e.ctxAhora==='cerrado');
  await ctx.close()}

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
