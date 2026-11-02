// iPhone, manos libres: la frase "suena" pero no llega al micrófono (audio mudo). La app lo detecta, muestra el texto, prueba otras formas de reproducir y, si ninguna anda, explica.
// El micrófono y el audio se SIMULAN: el nivel que "oye" el micrófono lo decide esta prueba según qué forma de reproducir esté "viva".
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'..'),D=path.join(__dirname,'assets')+'/';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const MIME={'.html':'text/html','.js':'application/javascript','.mp3':'audio/mpeg','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((rq,rs)=>{let f=path.join(RAIZ,decodeURIComponent(rq.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
  fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end();return}rs.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream','access-control-allow-origin':'*'});rs.end(d)})});
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){window.__tr=(window.__tr||0)+1;await new Promise(r=>setTimeout(r,200));return {response:{text:()=>'My name is Felu'}}}
  return {response:{text:()=>'hi'}};}}}`;
const REF='{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1,"ecoA":20,"ecoAmb":1}';      // la persona oyó el audio y el micrófono también (20% vs 1%)
const SIN_REF='{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":1,"ecoA":0.5,"ecoAmb":0.4}'; // la persona lo oyó pero el micrófono casi no: medir el eco no sirve
let PORT;
async function pagina(b,o){
  const ctx=await b.newContext({userAgent:UA,viewport:{width:390,height:900},serviceWorkers:'block'});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await p.addInitScript(oo=>{
    localStorage.setItem('trinity_sonido3',JSON.stringify(Object.assign({t:Date.now()},JSON.parse(oo.semilla))));
    if(oo.estr!==undefined)localStorage.setItem('trinity_estr',String(oo.estr));
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__vivas=oo.vivas;window.__nivel=0.004;window.__dur=oo.dur||600;window.__plays=[];
    // el micrófono "oye" lo que decide la prueba: ambiente bajito, y alto mientras suena una forma de reproducir que está "viva"
    const d=Object.getOwnPropertyDescriptor(ScriptProcessorNode.prototype,'onaudioprocess');
    Object.defineProperty(ScriptProcessorNode.prototype,'onaudioprocess',{configurable:true,get(){return d.get.call(this)},
      set(fn){d.set.call(this,fn?()=>fn({inputBuffer:{getChannelData:()=>{const a=new Float32Array(4096);a.fill(window.__nivel);return a}}}):fn)}});
    const suena=(tipo,fin)=>{window.__plays.push(tipo);if(window.__vivas[tipo])window.__nivel=0.2;
      setTimeout(()=>{window.__nivel=0.004;fin()},window.__dur)};
    HTMLMediaElement.prototype.play=function(){const src=this.src.split('/').pop();if(/silencio/.test(src))return Promise.resolve();
      const tipo=this.tagName==='VIDEO'?2:((typeof _aud!=='undefined'&&this===_aud)?0:1);
      if(window.__rechazar&&window.__rechazar.includes(tipo))return Promise.reject(new DOMException('no','NotAllowedError'));
      const s=this;Object.defineProperty(s,'paused',{value:false,configurable:true});
      suena(tipo,()=>{Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()});return Promise.resolve()};
    AudioBufferSourceNode.prototype.start=function(){const s=this;suena(3,()=>{s.onended&&s.onended()})};
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
  },o);
  await p.goto('http://localhost:'+PORT+'/felu/index.html');
  await p.evaluate(()=>{ECO_MIN_MS=300});
  return {p,ctx};
}
const INF=p=>p.evaluate(()=>window.rkInforme());
const cuenta=(t,re)=>(t.match(re)||[]).length;
(async()=>{
await new Promise(r=>srv.listen(0,r));PORT=srv.address().port;
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const empezar=async(t,minBurbujas,examen)=>{const pre=examen?'oral':'practice';t.pre=pre;await t.p.click(examen?'#t-exam':'#t-speak');await t.p.click('#'+pre+'-start');
  await t.p.waitForFunction(([n,pre])=>document.querySelectorAll('#'+pre+'-chat .msg.ex').length>=n,[minBurbujas,pre],{timeout:60000});await t.p.waitForTimeout(900)};
const CHAT=t=>t.p.evaluate(pre=>document.getElementById(pre+'-chat').innerText,t.pre);
let t,inf;

// A) todo suena: no se juzga nada raro
t=await pagina(b,{semilla:REF,vivas:[true,true,true,true]});
chk('la revisión guardó una referencia de eco válida (20% contra 1%)',await t.p.evaluate(()=>Math.abs(ecoRef()-0.2)<1e-9));
await empezar(t,4,true);inf=await INF(t.p);
chk('A) si todo suena: ningún «AUDIO MUDO», ningún aviso y el micrófono midió la referencia',cuenta(inf,/AUDIO MUDO/g)===0&&!/No detecto que el examinador/.test(await CHAT(t))&&/referencia 20\.0%/.test(inf));
chk('A) usa la forma 0 (audio compartido) y no repite ninguna frase',await t.p.evaluate(()=>window.__plays.every(x=>x===0)));
chk('A) con el audio andando el texto del examinador sigue oculto (como en el examen real)',await t.p.evaluate(()=>[...document.querySelectorAll('#oral-chat .msg.ex')].every(m=>m.classList.contains('hide'))&&!document.getElementById('oral-txt').checked));
chk('A) sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));await t.ctx.close();

// B) la forma 0 está muda y la 1 anda: se detecta, se lee, se repite la primera frase con la forma 1 y se queda con ella
t=await pagina(b,{semilla:REF,vivas:[false,true,true,true]});
await empezar(t,4,true);inf=await INF(t.p);
const planes=await t.p.evaluate(()=>window.__plays.slice());
chk('B) detecta el audio mudo de la primera frase ('+cuenta(inf,/AUDIO MUDO/g)+' vez)',cuenta(inf,/AUDIO MUDO/g)===1);
chk('B) la repite con la otra forma de reproducir: 0, 1 y de ahí en adelante sólo la 1 ('+planes.slice(0,6)+')',planes[0]===0&&planes[1]===1&&planes.slice(2).every(x=>x===1)&&/se repite la frase con otra forma de reproducirla: audio nuevo en cada frase/.test(inf));
chk('B) la forma que funcionó queda guardada para la próxima vez (trinity_estr = 1)',await t.p.evaluate(()=>localStorage.getItem('trinity_estr')==='1'&&_estrategia===1));
chk('B) no aparece el aviso grande: se arregló sola',!/No detecto que el examinador/.test(await CHAT(t)));
chk('B) la primera frase se mostró escrita (por si no se oía) y el interruptor «Ver lo que dice» quedó tildado',await t.p.evaluate(()=>!document.querySelector('#oral-chat .msg.ex').classList.contains('hide')&&document.getElementById('oral-txt').checked));
chk('B) sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));await t.ctx.close();

// B2) arranca ya con la forma guardada (1): suena a la primera, sin repetir
t=await pagina(b,{semilla:REF,vivas:[false,true,true,true],estr:1});
await empezar(t,3);inf=await INF(t.p);
chk('B2) con la forma guardada (1) suena a la primera: ningún audio mudo ni repetición',cuenta(inf,/AUDIO MUDO/g)===0&&await t.p.evaluate(()=>window.__plays.every(x=>x===1)));await t.ctx.close();

// B3) la forma 1 y la 2 están mudas y la 3 (Web Audio) anda: llega hasta la 3
t=await pagina(b,{semilla:REF,vivas:[false,false,false,true]});
await empezar(t,4,true);inf=await INF(t.p);
const pl3=await t.p.evaluate(()=>window.__plays.slice());
chk('B3) prueba 0 → 1 → 2 → 3 y se queda con Web Audio ('+pl3.slice(0,6)+')',pl3.slice(0,4).join()==='0,1,2,3'&&pl3.slice(4).every(x=>x===3)&&await t.p.evaluate(()=>localStorage.getItem('trinity_estr')==='3'),'');
chk('B3) 3 avisos de audio mudo en la primera frase y ningún aviso grande',cuenta(inf,/AUDIO MUDO/g)===3&&!/No detecto que el examinador/.test(await CHAT(t)));await t.ctx.close();

// C) ninguna forma suena: lee, prueba las 4 una sola vez, avisa una sola vez y sigue la charla
t=await pagina(b,{semilla:REF,vivas:[false,false,false,false]});
await empezar(t,4,true);inf=await INF(t.p);
const pl4=await t.p.evaluate(()=>window.__plays.slice());
const chatTxt=await CHAT(t);
chk('C) la primera frase se prueba con las 4 formas (0,1,2,3) y después cada frase suena una sola vez ('+pl4.slice(0,8)+')',pl4.slice(0,4).join()==='0,1,2,3'&&pl4.slice(4).every(x=>x===0));
chk('C) aparece UN solo aviso grande, con pasos claros (cerrar la app del todo / Safari) y los dos botones',cuenta(chatTxt,/No detecto que el examinador se esté oyendo/g)===1&&/cerrando la app del todo/.test(chatTxt)&&/Safari/.test(chatTxt)&&await t.p.evaluate(()=>!!document.querySelector('#oral-chat [data-a="snd"]')&&!!document.querySelector('#oral-chat [data-a="oigo"]')));
chk('C) todas las frases del examinador se muestran escritas',await t.p.evaluate(()=>[...document.querySelectorAll('#oral-chat .msg.ex')].every(m=>!m.classList.contains('hide'))));
chk('C) no se deja guardada ninguna forma (no funcionó ninguna) y vuelve a la de antes',await t.p.evaluate(()=>localStorage.getItem('trinity_estr')===null&&_estrategia===0));
chk('C) la charla sigue después del aviso (hay más de 3 frases del examinador)',await t.p.evaluate(()=>document.querySelectorAll('#oral-chat .msg.ex').length>=4));
// el botón «Sí lo oigo bien» apaga la vigilancia
await t.p.click('#oral-chat [data-a="oigo"]');
chk('C) «Sí lo oigo bien» saca el aviso y apaga la vigilancia (queda guardado)',await t.p.evaluate(()=>!document.querySelector('#oral-chat [data-a="oigo"]')&&ecoIgnorado()&&localStorage.getItem('trinity_eco_off')==='1'));
const antes=await t.p.evaluate(()=>window.__plays.length);await t.p.waitForTimeout(2500);
const nuevas=await t.p.evaluate(a=>window.__plays.slice(a),antes);
chk('C) con la vigilancia apagada ya no se repite nada ('+nuevas+')',nuevas.every(x=>x===0));
chk('C) sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));
// rehacer la revisión de sonido vuelve a prender la vigilancia
chk('C) rehacer la revisión de sonido vuelve a activar la vigilancia (ecoIgnorar(false) en fin())',await t.p.evaluate(()=>{ecoIgnorar(true);ecoIgnorar(false);return !ecoIgnorado()}));await t.ctx.close();

// D) sin referencia (la persona oyó pero el micrófono casi no): no se juzga nada
t=await pagina(b,{semilla:SIN_REF,vivas:[false,false,false,false]});
chk('D) referencia de eco inválida (0,5% contra 0,4%) → ecoRef = 0',await t.p.evaluate(()=>ecoRef()===0));
await empezar(t,4);inf=await INF(t.p);
chk('D) sin referencia no se dice «audio mudo», no se repite nada y no hay aviso ('+cuenta(inf,/AUDIO MUDO/g)+' avisos)',cuenta(inf,/AUDIO MUDO/g)===0&&await t.p.evaluate(()=>window.__plays.every(x=>x===0))&&!/No detecto que el examinador/.test(await CHAT(t)));
chk('D) el informe lo dice: «no hay (no se vigila)»',/referencia de eco: no hay \(no se vigila\)/.test(inf));await t.ctx.close();

// E) las frases cortitas no se juzgan (una palabra suelta no deja eco medible)
t=await pagina(b,{semilla:REF,vivas:[false,false,false,false],dur:300});
await t.p.evaluate(()=>{ECO_MIN_MS=1300});
await empezar(t,3);inf=await INF(t.p);
chk('E) frases de menos de 1,3 s no se juzgan',cuenta(inf,/AUDIO MUDO/g)===0);await t.ctx.close();

// F) una forma que el navegador rechaza (NotAllowedError) se salta sin esperar a medir
t=await pagina(b,{semilla:REF,vivas:[false,true,true,true],estr:1});
await t.p.evaluate(()=>{window.__rechazar=[1]});
await empezar(t,3);inf=await INF(t.p);
chk('F) si el navegador rechaza la forma guardada (1) pasa a la siguiente sin quedarse callado ('+await t.p.evaluate(()=>window.__plays.slice(0,4))+')',/rechazada por el navegador/.test(inf)&&await t.p.evaluate(()=>window.__plays.includes(2)));await t.ctx.close();

// G) fuera de manos libres (tocar 🎤) siempre se usa la forma 0, aunque haya otra guardada
t=await pagina(b,{semilla:'{"tts":1,"mp3":1,"mp3d":1,"ttsd":0,"mp3a":0}',vivas:[true,true,true,true],estr:2});
const g=await t.p.evaluate(async()=>{PERSISTENTE=false;window.__plays.length=0;await say('Hello! Come in and sit down, please. How are you today?',()=>{},{ex:true});return window.__plays.slice()});
chk('G) fuera de manos libres se usa la forma 0 ('+g+')',g.length===1&&g[0]===0);await t.ctx.close();

srv.close();await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
