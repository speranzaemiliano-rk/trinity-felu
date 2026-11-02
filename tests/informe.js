const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const ctx=await b.newContext({userAgent:UA,viewport:{width:390,height:900}});await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:'file://'}).catch(()=>{});
const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){await new Promise(r=>setTimeout(r,250));return {response:{text:()=>'My name is Felu'}}}
  if(/turn=/.test(String(params.systemInstruction))){const n=(window.__n=(window.__n||0)+1);
    return {response:{text:()=>JSON.stringify({reply:'Nice! Question number '+n+'?',ok:true,tip:'',model:'',end:n>=9,picture:'',hints:[],help:''})}}}
  return {response:{text:()=>'hi'}};}}}`)));
await p.addInitScript(()=>{try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1}')}catch(e){};Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
  speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),120)}});
await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
await p.click('#t-speak');await p.click('#practice-start');
await p.waitForFunction(()=>window.rkInforme&&window.rkInforme().split('\n').filter(l=>/ say \[/.test(l)).length>=4,null,{timeout:170000});   // 4 frases del examinador (manos libres: preguntas grabadas)
await p.click('#practice-stop');await p.waitForTimeout(400);
await p.click('#diagSonido summary');await p.click('#dsCopy');await p.waitForTimeout(400);
const r=await p.evaluate(async()=>({area:document.getElementById('dsInforme').value,visible:!document.getElementById('dsInforme').hidden,msg:document.getElementById('dsCopiado').textContent,
  portapapeles:await navigator.clipboard.readText().catch(e=>'(no se pudo leer: '+e.name+')')}));
console.log(r.area);console.log('\n--- aviso:',r.msg,'| cuadro visible:',r.visible,'| portapapeles = cuadro:',r.portapapeles===r.area);
const t=r.area;const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
chk('trae versión, dispositivo e iOS',/módulos \d/.test(t)&&/iPhone\/iPad · iOS 17\.5/.test(t));
chk('trae la apertura del micrófono de manos libres',/mic abierto/.test(t));
chk('registra cada voz del examinador (mp3 o voz) y su resultado',/say \[(mp3|voz)\]/.test(t)&&/examinador: voz ok/.test(t));
chk('registra que el micrófono se abre y se SUELTA',/mic abierto/.test(t)&&/mic soltado/.test(t));
chk('en manos libres NO se usa la voz del navegador (ningún «voz del navegador» en el registro)',!/voz del navegador: (speak|empezó|fin)/.test(t));
chk('sin errores de página',errs.length===0);
await b.close();process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
