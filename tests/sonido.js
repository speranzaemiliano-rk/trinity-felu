// Revisión de sonido en 3 pasos: la persona marca lo que oye y la app elige sola cómo hacer la charla en ese celular.
const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const UA_IOS='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){window.__tr=(window.__tr||0)+1;await new Promise(r=>setTimeout(r,200));return {response:{text:()=>'My name is Felu'}}}
  if(/turn=/.test(String(params.systemInstruction))){const n=(window.__n=(window.__n||0)+1);
    return {response:{text:()=>JSON.stringify({reply:'Nice! Question number '+n+'?',ok:true,tip:'',model:'',end:false,picture:'',hints:[],help:''})}}}
  return {response:{text:()=>'hi'}};}}}`;
async function pagina(ctx,o){
  o=o||{};const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await p.addInitScript(oo=>{
    if(oo.semilla)localStorage.setItem('trinity_sonido3',JSON.stringify(Object.assign({t:Date.now()},JSON.parse(oo.semilla))));
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__gum=0;window.__pistas=[];window.__tts=[];window.__mp3=[];window.__negar=!!oo.negarGum;
    const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async c=>{window.__gum++;if(window.__negar)throw new DOMException('no','NotAllowedError');const s=await real(c);s.getTracks().forEach(t=>window.__pistas.push(t));return s};
    speechSynthesis.speak=u=>{window.__tts.push(u.text);setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
    HTMLMediaElement.prototype.play=function(){const src=this.src.split('/').pop();if(!/silencio/.test(src))window.__mp3.push(src);const s=this;
      Object.defineProperty(s,'paused',{value:false,configurable:true});
      setTimeout(()=>{if(s.src.split('/').pop()!==src)return;Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()},80);return Promise.resolve()}},o);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  return p;
}
async function recorrer(p,marcas){   // marcas: [[chips del paso 1],[paso 2],[paso 3]]
  await p.click('#rkSnIni');
  for(let n=0;n<6;n++){   // (3 pasos; si en el paso 3 no se oye nada, la revisión prueba otras formas de reproducir: hasta 3 intentos más)
    await p.waitForSelector('#rkSnPlay,#rkSnGo',{timeout:15000});
    if(await p.$('#rkSnGo'))break;
    await p.click('#rkSnPlay');
    await p.waitForSelector('.rk-chip,#rkSnGo',{timeout:30000});
    if(await p.$('#rkSnGo'))break;   // se saltó (el micrófono no abrió)
    for(const k of (marcas[Math.min(n,2)]||[]))await p.click('.rk-chip[data-k="'+k+'"]');
    await p.click('#rkSnListo');
  }
  await p.waitForSelector('#rkSnGo',{timeout:15000});
}
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!(e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0)},sel);
const estado=p=>p.evaluate(()=>({guardado:JSON.parse(localStorage.getItem('trinity_sonido3')||'null'),ia:[...document.querySelectorAll('input[id$="-ia"]')].map(x=>x.checked),tap:[...document.querySelectorAll('input[id$="-tap"]')].map(x=>x.checked),
  txt:[...document.querySelectorAll('input[id$="-txt"]')].map(x=>x.checked),mp3ok:MP3_OK,sinvoz:SIN_VOZ,muda:_localMuda,vivas:window.__pistas.filter(x=>x.readyState==='live').length,gum:window.__gum,
  texto:document.querySelector('#rkSonido .rk-caja')?document.querySelector('#rkSonido .rk-caja').innerText.replace(/\s+/g,' '):'',pastilla:document.getElementById('rkVer').textContent,
  tts:window.__tts.filter(x=>x!=='ok'),mp3:window.__mp3.length}));
const OK=['tts','mp3'],OK2=['mp3d','ttsd'],OK3=['mp3a'];
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
const nuevoCtx=ua=>b.newContext(ua?{userAgent:ua,viewport:{width:390,height:900},serviceWorkers:'block'}:{viewport:{width:430,height:900},serviceWorkers:'block'});
let ctx,p,e;

// 1) iPhone: se oye todo, también con el micrófono abierto → MANOS LIBRES
ctx=await nuevoCtx(UA_IOS);p=await pagina(ctx);
await p.click('#t-speak');await p.evaluate(()=>{localStorage.setItem('trinity_tap3','1');document.querySelectorAll('input[id$="-tap"]').forEach(x=>x.checked=true)});   // (venía eligiendo «tocar 🎤»)
await p.click('#practice-snd');
chk('el botón «Probar el sonido» abre la revisión de 3 pasos',await visible(p,'#rkSonido #rkSnIni'));
await recorrer(p,[OK,OK2,OK3]);e=await estado(p);
chk('rehacer la revisión borra el «tocar 🎤» elegido antes (la revisión decide de nuevo)',await p.evaluate(()=>localStorage.getItem('trinity_tap3'))===null);
chk('suena «Monday» y «Thursday» con la voz del celular ('+JSON.stringify(e.tts)+') y 3 audios grabados ('+e.mp3+')',e.tts.includes('Monday')&&e.tts.includes('Thursday')&&e.mp3===3);
chk('el micrófono se abrió 2 veces (pasos 2 y 3) y quedó suelto ('+e.gum+' pedidos, '+e.vivas+' pistas vivas)',e.gum===2&&e.vivas===0);
chk('resultado «manos libres» y lo explica',/manos libres/.test(e.texto)&&/sin botón «Hablar»/.test(e.texto)&&e.guardado.mp3a===1);
chk('iPhone manos libres: «Tocar 🎤» y «Examinador con IA» destildados; pastilla «sonido: manos libres»',e.tap.every(x=>!x)&&e.ia.every(x=>!x)&&/sonido: manos libres$/.test(e.pastilla));
const inf=await p.evaluate(()=>document.querySelector('.rk-inf').value);
chk('el resultado muestra el informe a la vista con cada paso',/prueba de sonido 1\/3: se oyó «Monday» «Tuesday»/.test(inf)&&/prueba de sonido 3\/3: se oyó «Friday»/.test(inf)&&/el micrófono oyó el audio/.test(inf));
await p.close();

// 2) iPhone: sólo se oye el audio grabado DESPUÉS del micrófono → preguntas grabadas, tocando 🎤
p=await pagina(ctx);await p.click('#t-speak');await p.click('#practice-snd');
await recorrer(p,[['mp3'],['mp3d'],[]]);e=await estado(p);
chk('sólo audio grabado (sin micrófono abierto): modo «tocar 🎤» con las preguntas grabadas y pista del modo silencio',/preguntas grabadas/.test(e.texto)&&/modo silencio/.test(e.texto)&&e.tap.every(Boolean)&&e.ia.every(x=>!x));
chk('...y no usa la voz del celular ni la IA ('+JSON.stringify({muda:e.muda,mp3ok:e.mp3ok})+')',e.muda===true&&e.mp3ok===true&&!e.sinvoz);
await p.reload();await p.waitForTimeout(400);e=await estado(p);
chk('al recargar se acuerda: tocar 🎤 tildado, IA destildada ('+JSON.stringify({tap:e.tap,ia:e.ia})+')',e.tap.every(Boolean)&&e.ia.every(x=>!x)&&/sonido: preguntas grabadas, tocando/.test(e.pastilla));
await p.close();

// 3) iPhone: la voz del celular se oye después del micrófono → examinador con IA, tocando 🎤
p=await pagina(ctx);await p.click('#t-speak');await p.click('#practice-snd');
await recorrer(p,[OK,OK2,[]]);e=await estado(p);
chk('voz del celular después del micrófono: «examinador con IA» y «tocar 🎤» tildados',/examinador con IA/.test(e.texto)&&e.tap.every(Boolean)&&e.ia.every(Boolean));
await p.close();

// 4) iPhone: no se oye nada → se leen las preguntas, sin intentar voces
p=await pagina(ctx);await p.click('#t-exam');await p.click('#oral-snd');
await recorrer(p,[[],[],[]]);e=await estado(p);
chk('no se oye nada: lo explica (volumen, silencio, Bluetooth) y deja leer las preguntas (texto visible en Examen)',/No se oyó nada/.test(e.texto)&&/Bluetooth/.test(e.texto)&&e.txt.every(Boolean)&&e.sinvoz);
const r4=await p.evaluate(f=>{const m0=window.__mp3.length,t0=window.__tts.length;return say(f,()=>{},{ex:true}).then(x=>({x,mp3:window.__mp3.length-m0,tts:window.__tts.length-t0}))},'Hello! Welcome. Sit down, please. How are you feeling today?');
chk('no se oye nada: no gasta voces (say → '+r4.x+', audios +'+r4.mp3+', voz +'+r4.tts+')',r4.x===false&&r4.mp3===0&&r4.tts===0);
await p.close();

// 5) no se pudo abrir el micrófono: los pasos 2 y 3 se saltan y se decide con lo que se oyó sin micrófono
p=await pagina(ctx,{negarGum:true});await p.click('#t-speak');await p.click('#practice-snd');
await recorrer(p,[OK,[],[]]);e=await estado(p);
chk('micrófono denegado: se saltan los pasos 2 y 3 ('+e.gum+' intento) y se decide con el paso 1 (guardado: '+JSON.stringify(e.guardado&&{tts:e.guardado.tts,mp3:e.guardado.mp3,mp3a:e.guardado.mp3a})+')',e.guardado&&e.guardado.tts===1&&e.guardado.mp3===1&&e.guardado.mp3a===undefined&&e.vivas===0);
await p.close();await ctx.close();

// 6) vence: «nada» a los 10 minutos, lo demás a los 7 días
const ahora=Date.now();
const caso=async(r,min)=>{const c=await nuevoCtx(UA_IOS);const q=await pagina(c,{semilla:JSON.stringify(Object.assign({},r,{t:ahora-min*60000}))});
  const x=await q.evaluate(()=>({sinvoz:SIN_VOZ,modo:document.getElementById('rkVer').textContent,leida:!!leerSonido()}));await c.close();return x};
let x=await caso({tts:0,mp3:0,mp3d:0,ttsd:0,mp3a:0},5);chk('«no se oye nada» de hace 5 min: sigue aplicándose (sin voz: '+x.sinvoz+')',x.sinvoz===true);
x=await caso({tts:0,mp3:0,mp3d:0,ttsd:0,mp3a:0},11);chk('«no se oye nada» de hace 11 min: venció, se vuelve a intentar con voz (sin voz: '+x.sinvoz+')',x.sinvoz===false&&!x.leida);
x=await caso({tts:1,mp3:1,mp3d:1,ttsd:1,mp3a:1},60*24*6);chk('«manos libres» de hace 6 días: sigue valiendo',x.leida);
x=await caso({tts:1,mp3:1,mp3d:1,ttsd:1,mp3a:1},60*24*8);chk('«manos libres» de hace 8 días: venció (se vuelve a revisar)',!x.leida);

// 7) iPhone: la primera vez «Empezar» abre la revisión; al terminar «Empezar» arranca en el modo elegido; la segunda vez no molesta
ctx=await nuevoCtx(UA_IOS);p=await pagina(ctx);
await p.click('#t-speak');await p.click('#practice-start');
chk('iPhone, primera vez: «Empezar» abre la revisión y todavía no arranca la charla',await visible(p,'#rkSonido #rkSnIni')&&(await p.evaluate(()=>document.querySelectorAll('#practice-chat .msg.ex').length))===0);
await p.evaluate(()=>ecoIgnorar(true));   // la persona había apagado la vigilancia: rehacer la revisión la vuelve a prender
await recorrer(p,[OK,OK2,OK3]);await p.click('#rkSnGo');
{const g=await p.evaluate(()=>JSON.parse(localStorage.getItem('trinity_sonido3')||'null'));
 chk('la revisión guarda lo que el micrófono oyó con el audio sonando (referencia para vigilar el eco: ecoA '+(g&&g.ecoA)+'%, ambiente '+(g&&g.ecoAmb)+'%)',g&&typeof g.ecoA==='number'&&typeof g.ecoAmb==='number');
 chk('al terminar la revisión se vuelve a activar la vigilancia (trinity_eco_off borrado)',await p.evaluate(()=>localStorage.getItem('trinity_eco_off')===null&&!ecoIgnorado()));}
await p.waitForSelector('#practice-chat .msg.ex',{timeout:40000});
e=await estado(p);
chk('iPhone: «Empezar» arranca en MANOS LIBRES (micrófono abierto: '+e.vivas+' pista viva) con el aviso de la charla manos libres',e.vivas>=1&&/Charla manos libres/.test(await p.evaluate(()=>document.getElementById('practice-chat').innerText)));
await p.click('#practice-stop');await p.waitForTimeout(300);
await p.click('#practice-start');await p.waitForTimeout(1500);
chk('iPhone: la segunda vez no vuelve a pedir la revisión',!(await visible(p,'#rkSonido')));
await p.click('#practice-stop');await p.waitForTimeout(300);
// en plena charla: «¿No se oye?» pausa, suelta el micrófono y vuelve a «tocar 🎤» (sin guardarlo: lo decide la revisión de sonido)
await p.click('#practice-start');await p.waitForSelector('#practice-chat .msg.ex',{timeout:40000});
await p.click('#practice-snd');await p.waitForTimeout(500);
e=await estado(p);const g=await p.evaluate(()=>localStorage.getItem('trinity_tap3'));
chk('en plena charla «¿No se oye?»: pausa, suelta el micrófono ('+e.vivas+' pistas), vuelve a «tocar 🎤» y NO lo guarda ('+g+')',e.vivas===0&&e.tap.every(Boolean)&&g===null&&(await visible(p,'#rkSonido #rkSnIni')));
await p.close();
// si cierra la revisión sin hacerla no se la vuelve a imponer
p=await pagina(ctx);await p.evaluate(()=>localStorage.removeItem('trinity_sonido3'));
await p.click('#t-speak');await p.click('#practice-start');await p.click('#rkSnCerrar');
await p.click('#practice-start');await p.waitForSelector('#practice-chat .msg.ex',{timeout:40000});
chk('iPhone: si cierra la revisión, la próxima «Empezar» arranca igual (no insiste)',true);
chk('sin errores de página',p.errs.length===0);
await ctx.close();await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
