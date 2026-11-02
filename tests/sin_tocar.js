// Que no haga falta apretar «Hablar» ni «Listo»:
//  · «Listo» queda escondido (la respuesta termina sola con una pausa) y aparece TARDE, sólo si el micrófono sigue escuchando;
//  · un corte automático del micrófono pasa a «tocar 🎤» SÓLO por esa charla (no se guarda) y la siguiente vuelve a probar sin tocar;
//  · la clave vieja (trinity_tap2) se descarta: era la que dejaba «Hablar» pegado para siempre;
//  · iPhone que quedó en «tocar 🎤» por la revisión de sonido: un botón deja probar manos libres, y lo elegido manda sobre la revisión.
const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const LIBRES='{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1}';
const TOQUE='{"tts":0,"mp3":1,"mp3d":1,"ttsd":0}';   // se oye el audio grabado, pero no con el micrófono abierto → la revisión deja «tocar 🎤»
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){window.__tr=(window.__tr||0)+1;await new Promise(r=>setTimeout(r,200));return {response:{text:()=>'My name is Felu'}}}
  return {response:{text:()=>'hi'}};}}}`;
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
async function pagina(b,o){
  o=o||{};
  const ctx=await b.newContext(Object.assign({viewport:{width:390,height:900},serviceWorkers:'block'},o.pc?{}:{userAgent:UA}));
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await p.addInitScript(oo=>{
    if(oo.semilla&&!sessionStorage.getItem('__yaSembrado'))localStorage.setItem('trinity_sonido3',JSON.stringify(Object.assign({t:Date.now()},JSON.parse(oo.semilla))));
    if(oo.tap2&&!sessionStorage.getItem('__yaSembrado'))localStorage.setItem('trinity_tap2',oo.tap2);
    sessionStorage.setItem('__yaSembrado','1');   // (sólo la primera carga: al recargar queda lo que la persona dejó guardado)
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__gum=0;window.__pistas=[];window.__dichos=[];window.__gesto=false;window.__listoVisto=0;
    document.addEventListener('click',()=>{window.__gesto=true;setTimeout(()=>{window.__gesto=false},120)},true);
    const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia=async c=>{window.__gum++;
      if(window.__soloGesto&&!window.__gesto)throw new DOMException('no','NotAllowedError');
      const s=await real(c);s.getTracks().forEach(t=>window.__pistas.push(t));return s};
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
    HTMLMediaElement.prototype.play=function(){const s=this,src=this.src;
      Object.defineProperty(s,'paused',{value:false,configurable:true});
      setTimeout(()=>{if(s.src!==src)return;Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()},120);return Promise.resolve()};
    window.addEventListener('DOMContentLoaded',()=>setInterval(()=>{const d=document.getElementById('practice-done');if(d&&getComputedStyle(d).display!=='none')window.__listoVisto++},40));
  },o);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  return {p,ctx};
}
const ESTADO=()=>({tap:document.getElementById('practice-tap').checked,guardado:localStorage.getItem('trinity_tap3'),viejo:localStorage.getItem('trinity_tap2'),
  persistente:PERSISTENTE,tr:window.__tr||0,gum:window.__gum,vivas:window.__pistas.filter(x=>x.readyState==='live').length,
  listoVisto:window.__listoVisto,talk:getComputedStyle(document.getElementById('practice-talk')).display!=='none',
  listoAhora:getComputedStyle(document.getElementById('practice-done')).display!=='none',
  chat:document.getElementById('practice-chat').innerText,estado:document.getElementById('practice-st').hidden?'':document.getElementById('practice-st').innerText});
const escuchando=()=>!document.getElementById('practice-mic').hidden&&/Te escucho/.test(document.getElementById('practice-mict').textContent);
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
let t,e;

// 1) iPhone con manos libres: el cartel de inicio no manda a tocar nada, «Listo» no está a la vista y las respuestas terminan solas
t=await pagina(b,{semilla:LIBRES});
await t.p.click('#t-speak');
e=await t.p.evaluate(ESTADO);
chk('el cartel de inicio ya no manda a tocar «Listo» y avisa que se le puede preguntar al examinador',!/Listo/.test(e.chat)&&/pregunt/i.test(e.chat));
chk('«Listo» viene escondido de entrada (también en el examen)',await t.p.evaluate(()=>getComputedStyle(document.getElementById('practice-done')).display==='none'&&getComputedStyle(document.getElementById('oral-done')).display==='none'));
chk('«Listo» tarda en aparecer (valor normal: '+await t.p.evaluate(()=>LISTO_TARDE_MS)+' ms)',await t.p.evaluate(()=>LISTO_TARDE_MS>=8000));
await t.p.evaluate(()=>{LISTO_TARDE_MS=15000});   // (el audio de prueba da vueltas: se deja margen para que un turno largo no lo muestre)
await t.p.click('#practice-start');
await t.p.waitForFunction(escuchando,null,{timeout:40000});
chk('manos libres: mientras escucha, «Listo» no está a la vista y tampoco «Hablar»',await t.p.evaluate(()=>getComputedStyle(document.getElementById('practice-done')).display==='none'&&getComputedStyle(document.getElementById('practice-talk')).display==='none'));
await t.p.waitForFunction(()=>(window.__tr||0)>=4,null,{timeout:120000});
e=await t.p.evaluate(ESTADO);
chk('encadenó '+e.tr+' respuestas sin tocar «Hablar» ni «Listo» («Listo» se vio '+e.listoVisto+' veces)',e.tr>=4&&e.listoVisto===0&&!e.talk);
await t.p.click('#practice-stop');await t.ctx.close();

// 2) «Listo» aparece TARDE si el micrófono sigue escuchando (acá, un sonido sin pausas: la respuesta no termina sola), y apretarlo termina la respuesta
{
  const b2=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'habla_sin_pausa.wav','--autoplay-policy=no-user-gesture-required']});
  t=await pagina(b2,{semilla:LIBRES});
  await t.p.click('#t-speak');
  await t.p.evaluate(()=>{LISTO_TARDE_MS=2500});
  await t.p.click('#practice-start');
  await t.p.waitForFunction(escuchando,null,{timeout:40000});
  const t0=Date.now();
  await t.p.waitForTimeout(800);
  chk('a los 0,8 s de escuchar «Listo» todavía no está a la vista',!(await t.p.evaluate(ESTADO)).listoAhora);
  await t.p.waitForFunction(()=>getComputedStyle(document.getElementById('practice-done')).display!=='none',null,{timeout:20000});
  const dem=Date.now()-t0;
  chk('si se sigue escuchando, «Listo» aparece pasado el tiempo ('+dem+' ms de 2500)',dem>=1500&&dem<6000);
  const tr0=await t.p.evaluate(()=>window.__tr||0);
  await t.p.click('#practice-done');
  await t.p.waitForFunction(a=>(window.__tr||0)>a,tr0,{timeout:20000});
  await t.p.waitForTimeout(300);
  e=await t.p.evaluate(ESTADO);
  chk('apretar «Listo» termina la respuesta (se transcribió) y vuelve a esconderse',e.tr>tr0&&!e.listoAhora);
  await t.p.click('#practice-stop');await t.ctx.close();await b2.close();
}

// 3) un corte del micrófono pasa a «tocar 🎤» sólo por esta charla: no se guarda, y la próxima charla vuelve a probar sin tocar
t=await pagina(b,{semilla:LIBRES});
await t.p.click('#t-speak');await t.p.click('#practice-start');
await t.p.waitForFunction(()=>(window.__tr||0)>=1,null,{timeout:60000});
await t.p.evaluate(()=>{window.__soloGesto=true;window.__pistas.forEach(x=>{x.stop();x.dispatchEvent(new Event('ended'))})});
await t.p.waitForFunction(()=>getComputedStyle(document.getElementById('practice-talk')).display!=='none',null,{timeout:40000});
e=await t.p.evaluate(ESTADO);
chk('corte del micrófono: pasa a «tocar 🎤» (casilla tildada) y NO lo guarda (guardado: '+e.guardado+')',e.tap&&e.guardado===null);
chk('corte del micrófono: el aviso dice que es sólo por esta charla',/sólo por esta charla/.test(e.estado));
await t.p.click('#practice-stop');await t.p.waitForTimeout(400);
await t.p.evaluate(()=>{window.__soloGesto=false});
const tr1=await t.p.evaluate(()=>window.__tr||0);
await t.p.click('#practice-start');
await t.p.waitForFunction(a=>(window.__tr||0)>a+1,tr1,{timeout:90000});
e=await t.p.evaluate(ESTADO);
chk('la charla siguiente vuelve a manos libres sin tocar (casilla destildada, micrófono abierto, '+(e.tr-tr1)+' respuestas nuevas, «Hablar» no hizo falta)',!e.tap&&e.persistente&&e.vivas>=1&&!e.talk);
await t.p.click('#practice-stop');
chk('sin errores de página',t.p.errs.length===0);await t.ctx.close();

// 4) la clave vieja que había dejado «Hablar» pegado se descarta
t=await pagina(b,{semilla:LIBRES,tap2:'1'});
e=await t.p.evaluate(ESTADO);
chk('«trinity_tap2» (la clave vieja) ya no obliga a tocar: casilla destildada y clave borrada ('+e.viejo+')',!e.tap&&e.viejo===null);
await t.ctx.close();

// 5) iPhone que la revisión dejó en «tocar 🎤»: se ofrece probar manos libres; lo elegido se guarda y manda sobre la revisión
t=await pagina(b,{semilla:TOQUE});
await t.p.click('#t-speak');
e=await t.p.evaluate(ESTADO);
chk('revisión «sólo audio grabado»: viene en «tocar 🎤» y todavía no hay nada guardado',e.tap&&e.guardado===null);
await t.p.click('#practice-start');
await t.p.waitForSelector('#practice-chat .msg.tip button',{timeout:30000});
chk('el chat ofrece «Probar manos libres»',/Probar manos libres/.test(await t.p.evaluate(()=>document.querySelector('#practice-chat .msg.tip button').textContent)));
await t.p.uncheck('#practice-txt');   // (para comprobar que la prueba deja a la vista lo que dice el examinador)
await t.p.click('#practice-chat .msg.tip button');
await t.p.waitForFunction(()=>PERSISTENTE===true&&(window.__tr||0)>=2,null,{timeout:90000});
e=await t.p.evaluate(ESTADO);
chk('al aceptar: queda guardado «sin tocar» (0), la casilla destildada y la charla es manos libres ('+e.tr+' respuestas sin tocar «Hablar»)',e.guardado==='0'&&!e.tap&&e.persistente&&!e.talk);
chk('al aceptar: avisa que es una prueba y deja a la vista lo que dice el examinador',/Es una prueba/.test(e.chat)&&await t.p.evaluate(()=>document.getElementById('practice-txt').checked&&!document.querySelector('#practice-chat .msg.ex.hide')));
await t.p.click('#practice-stop');
await t.p.reload();await t.p.click('#t-speak');
e=await t.p.evaluate(ESTADO);
chk('al recargar sigue sin tocar aunque la revisión diga «tocar 🎤» (lo elegido manda)',!e.tap&&e.guardado==='0');
await t.p.check('#practice-tap');
e=await t.p.evaluate(ESTADO);
chk('si tilda «Tocar 🎤 para hablar» a mano, se guarda como elegido (1)',e.tap&&e.guardado==='1');
await t.p.click('#practice-start');
await t.p.waitForFunction(()=>getComputedStyle(document.getElementById('practice-talk')).display!=='none',null,{timeout:40000});
chk('y entonces no se le insiste con el botón de probar manos libres',(await t.p.evaluate(()=>document.querySelectorAll('#practice-chat .msg.tip button').length))===0);
await t.p.click('#practice-stop');
chk('sin errores de página',t.p.errs.length===0);await t.ctx.close();

// 6) PC (el micrófono se abre solo en cada turno): «Listo» tampoco está a la vista
t=await pagina(b,{pc:true});
await t.p.click('#t-speak');await t.p.evaluate(()=>{LISTO_TARDE_MS=15000});await t.p.click('#practice-start');
await t.p.waitForFunction(escuchando,null,{timeout:40000});
chk('PC: mientras escucha, «Listo» no está a la vista',await t.p.evaluate(()=>getComputedStyle(document.getElementById('practice-done')).display==='none'));
await t.p.waitForFunction(()=>(window.__tr||0)>=3,null,{timeout:120000});
e=await t.p.evaluate(ESTADO);
chk('PC: encadenó '+e.tr+' respuestas sin tocar nada («Listo» se vio '+e.listoVisto+' veces)',e.tr>=3&&e.listoVisto===0);
await t.p.click('#practice-stop');await t.ctx.close();

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
