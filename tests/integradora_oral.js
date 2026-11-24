// «Examen oral» de la Prueba final integradora (integradora/oral.js), con la IA de Firebase simulada y el micrófono de prueba de Chromium:
//  · la pestaña «🎤 Examen oral» y el botón de la pantalla del tema, en cada tema de ideas (y no en los de geografía); la intro no pide nada a la IA;
//  · el examen corto y el completo, escribiendo: qué se le manda a la IA (el tema, las ideas con su texto, la respuesta), que se pregunte CADA idea del tema una vez y en orden,
//    que lo que dice el examinador suene en español, el resultado (bien / a medias / a repasar / sin preguntar), el historial y el «Ver el resumen»;
//  · lo que decide la aplicación y no la IA («no sé» nunca es «bien»; «repetí» no gasta un pedido a la IA; «repite» sólo vale si de verdad preguntó);
//  · sin IA configurada, y con la IA que falla a mitad: el examen sigue con la corrección simple;
//  · con el micrófono de prueba (audio con voz y silencio): graba, corta sola, pasa a texto y el micrófono queda SUELTO mientras habla el examinador (en iPhone, si no, la voz queda muda);
//    en iPhone se toca 🎤; si la IA no puede pasar la voz a texto se sigue escribiendo;
//  · pausa al irse a otra aplicación, «Terminar», la flecha de arriba, la voz que se apaga, las pestañas que se esconden durante el examen;
//  · la corrección simple contra los resúmenes reales, lo guardado roto, que no se toque lo aprendido, y el diseño y el contraste de las pantallas (claro y oscuro).
// Se corre con:  NODE_PATH=/opt/node-tools/node_modules node tests/integradora_oral.js   (con  RAPIDO=1  el diseño se mira en menos tamaños y el contraste sólo en claro)
const {chromium}=require('playwright');const http=require('http'),fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'..'),WAV=path.join(__dirname,'assets','habla_una_frase.wav'),WAV_PAUSA=path.join(__dirname,'assets','habla_con_pausa.wav'),RAPIDO=!!process.env.RAPIDO;
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8'};
const srv=http.createServer((rq,rs)=>{let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';const f=path.resolve(RAIZ,rel);if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)){rs.writeHead(404);return rs.end('no')}rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(rs)});
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
// La IA simulada: el sistema y el mensaje de cada turno quedan en window.__turnos; window.__guion[n] cambia la respuesta de la evaluación n (1 = la primera después de la apertura);
// window.__iaFalla / window.__transFalla / window.__juntoFalla hacen que falle (todo / cualquier audio / sólo la llamada que junta la voz con la corrección); window.__voz es lo que «dijo» el chico
// en el audio (y window.__vozLista, uno por cada audio que llega); window.__audios guarda los audios que llegaron; window.__llamadas, la configuración de cada llamada (para ver «pensar poco»);
// window.__rechazaPensar hace que el modelo rechace «pensar poco» (como uno que no lo acepta); window.__demoraAudio / __demora / __demoraInicio atrasan las respuestas.
// Los campos de la respuesta salen con número adelante (p1_veredicto…), como los pide la aplicación; con window.__sinPrefijo salen sin él.
const MOCK=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),integer:()=>({t:'integer'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const W=window,gc=params.generationConfig||{},sys=String(params.systemInstruction||'');
  if(W.__rechazaPensar&&gc.thinkingConfig){W.__rechazos=(W.__rechazos||0)+1;throw new Error('[400 ] Thinking level MINIMAL is not supported for this model')}
  (W.__llamadas=W.__llamadas||[]).push({modelo:params.model,gc:JSON.parse(JSON.stringify(gc)),sys:!!sys,t:Date.now()});
  const audio=Array.isArray(req)&&req[1]&&req[1].inlineData;let voz=null;
  if(audio){
    const k=(W.__audios=W.__audios||[]).length;
    W.__audios.push({junto:!!sys,prompt:String(req[0]),sys,mime:audio.mimeType,largo:audio.data.length,t:Date.now()});
    if(W.__demoraAudio)await new Promise(r=>setTimeout(r,W.__demoraAudio));
    if(W.__transFalla)throw new Error(W.__transFalla);
    voz=(W.__vozLista&&W.__vozLista[Math.min(k,W.__vozLista.length-1)])||W.__voz||'el consejo de indias hacía las leyes';
    if(!sys){(W.__trans=W.__trans||[]).push({prompt:String(req[0]),mime:audio.mimeType,largo:audio.data.length,t:Date.now()});return {response:{text:()=>voz}}}   // sólo pasar a texto (el camino de siempre)
    if(W.__juntoFalla)throw new Error(W.__juntoFalla);
  }
  const user=audio?String(req[0]):req.contents[0].parts[0].text;
  if(!sys){(W.__calentadas=(W.__calentadas||0)+1);return {response:{text:()=>'hi'}}}   // el precalentamiento (sin sistema) no es un turno
  (W.__turnos=W.__turnos||[]).push({sys,user,t:Date.now(),audio:!!audio});
  if(W.__demora&&!/^COMIENZO/.test(user))await new Promise(r=>setTimeout(r,W.__demora));
  if(W.__demoraInicio&&/^COMIENZO/.test(user))await new Promise(r=>setTimeout(r,W.__demoraInicio));
  if(W.__iaFalla)throw new Error(W.__iaFalla);
  const num={transcripcion:'p0_',veredicto:'p1_',devolucion:'p2_',falto:'p3_',pregunta:'p4_'};
  const salida=o=>JSON.stringify(W.__sinPrefijo?o:Object.fromEntries(Object.entries(o).map(([k,v])=>[(num[k]||'')+k,v])));
  if(/^COMIENZO DEL EXAMEN/.test(user))return {response:{text:()=>salida(W.__inicio||{veredicto:'inicio',falto:'',devolucion:'Hola Felipe, empecemos.',pregunta:'Primera pregunta de prueba?'})}};
  const n=W.__turnos.length-1,g=(W.__guion||[])[n-1]||{},fin=/NO HAY IDEA SIGUIENTE/.test(user);
  return {response:{text:()=>salida(Object.assign({},audio?{transcripcion:voz}:{},{veredicto:'bien',falto:'',devolucion:'Devolución '+n,pregunta:fin?'':'Pregunta número '+(n+1)+'?'},g))}};
}}}`;
const UA_IPHONE='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
let PORT=0,B=null,B2=null,B3=null;
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const seg=ms=>new Promise(r=>setTimeout(r,ms));

async function pagina(o){
  o=o||{};
  const ctx=await (o.mic3?B3:o.mic?B2:B).newContext({viewport:o.vp||{width:390,height:844},serviceWorkers:'block',colorScheme:o.oscuro?'dark':'light',userAgent:o.ua,hasTouch:!!o.touch,permissions:['microphone']});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.gstatic=0;p.on('request',r=>{if(/gstatic\.com\/firebasejs/.test(r.url()))p.gstatic++});
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await p.route('**/firebase-config.js',r=>r.fulfill(js(o.ia===false?'window.TRINITY_FB={config:{},models:[]};':'window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};')));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js('export function initializeApp(c){return {}}')));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK)));
  await p.addInitScript(a=>{
    const est=a.est;if(!a.espera)window.__INT_SIN_ESPERA=true;
    if(a.sinAC){window.AudioContext=undefined;window.webkitAudioContext=undefined}
    if(a.sinSP&&window.AudioContext)window.AudioContext.prototype.createScriptProcessor=function(){throw new Error('no se pudo crear el procesador de audio')};
    window.__voces=[];window.__cancel=0;window.__streams=[];window.__wake=0;
    Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__wake++;return {release:async()=>{window.__wake--},addEventListener(){}}}}});
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    const real=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices):null;
    if(real)navigator.mediaDevices.getUserMedia=async c=>{const s=await real(c);window.__streams.push(s);return s};
    window.__micVivo=()=>window.__streams.filter(s=>s.getTracks().some(t=>t.readyState==='live')).length;
    if(a.voces){   // voces de mentira (el navegador de prueba no trae ninguna) y un «utterance» simple, para poder asignarles cualquier voz
      const V=a.voces.map(([name,lang])=>({name,lang,voiceURI:name,localService:true,default:false}));
      speechSynthesis.getVoices=()=>V;window.SpeechSynthesisUtterance=function(t){this.text=t;this.lang='';this.voice=null;this.rate=1;this.pitch=1;this.volume=1};
    }
    speechSynthesis.speak=u=>{window.__voces.push({texto:u.text,lang:u.lang,vol:u.volume,rate:u.rate,voz:u.voice&&u.voice.name||'',mic:window.__micVivo(),t:Date.now()});setTimeout(()=>u.onstart&&u.onstart(),10);setTimeout(()=>u.onend&&u.onend(),30)};
    speechSynthesis.cancel=()=>{window.__cancel++};
    if(est)try{for(const k of Object.keys(est))localStorage.setItem(k,typeof est[k]==='string'?est[k]:JSON.stringify(est[k]))}catch(e){}
  },{est:o.est||null,espera:!!o.espera,sinAC:!!o.sinAC,sinSP:!!o.sinSP,voces:o.voces||null});
  await p.goto('http://127.0.0.1:'+PORT+'/integradora/');await p.waitForSelector('#pInicio .area');
  return {p,ctx};
}
const irATema=async(p,id)=>{await p.click('.tema-btn[data-tema="'+id+'"]');await p.waitForSelector('#pTema:not([hidden]) #bOral')};
const abrirOral=async(p,id)=>{await irATema(p,id);await p.click('#bOral');await p.waitForSelector('#oralEmpezar')};
const empezar=async(p,o)=>{o=o||{};if(o.modo)await p.click('[data-oral-modo="'+o.modo+'"]');await p.click('#oralEmpezar');await p.waitForSelector('#oralChat .ob.ex',{timeout:20000});if(o.escribir!==false)await p.click('#oralKb')};
// contesta escribiendo cada vez que se espera una respuesta (lista = lo que se escribe; si se acaba, se repite la última) hasta que aparece el resultado
async function escribirHasta(p,lista,opc){
  opc=opc||{};let i=0;
  for(let v=0;v<80;v++){
    await p.waitForSelector('#oralType:not([hidden]), .oral-res, #oralSeguir',{timeout:25000});
    if(await p.$('.oral-res'))return i;
    if(opc.antes&&await opc.antes(i))return i;
    if(await p.$('#oralSeguir:visible'))return i;
    await p.fill('#oralIn',lista[Math.min(i,lista.length-1)]);await p.click('#oralSend');i++;await p.waitForTimeout(60);
  }
  return i;
}
const estado=p=>p.evaluate(()=>{const s=INT.oral._t.estado();return s&&{idx:s.idx,ia:s.ia,pausado:s.pausado,terminado:s.terminado,modo:s.modo,pasar:s.pasar,repetir:s.repetir,fase:s.fase,pregunta:s.pregunta,res:s.res.map(r=>({id:r.id,v:r.v,ia:r.ia,pasar:r.pasar,dijo:r.dijo,falto:r.falto})),agenda:s.agenda.map(a=>a.id)}});
const turnos=p=>p.evaluate(()=>window.__turnos||[]);
const tema=(p,id)=>p.evaluate(id=>{const t=INT.tema(id);return {n:t.items.length,ids:t.items.map(i=>i.id),grupos:t.items.map(i=>i.grupo),nombre:t.nombre,titulos:t.items.map(i=>i.titulo),resumenes:t.items.map(i=>i.resumen)}},id);
const IDEAS=['colonias','sociedad','borbones','sol','estaciones','gnomon'];
// ---- diseño y contraste (copiados de tests/integradora.js, con el degradé de la nota)
const medir=()=>{
  const vw=innerWidth,out=[],pant=document.querySelector('.pantalla:not([hidden])');if(!pant)return ['no hay pantalla'];
  const desc=e=>e.tagName.toLowerCase()+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).split(' ')[0]+'«'+(e.innerText||e.value||e.getAttribute('aria-label')||'').slice(0,18).replace(/\n/g,' ')+'»';
  const de=document.documentElement;if(de.scrollWidth>vw+1)out.push('scroll horizontal: '+de.scrollWidth+' > '+vw);
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
  const caja=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top+scrollY,b:r.bottom+scrollY,w:r.width,h:r.height}};
  const todos=[...pant.querySelectorAll('button,input,select')].filter(vis);
  todos.forEach(e=>{const c=caja(e);
    if(c.l<-0.5||c.r>vw+0.5)out.push('se sale de la pantalla: '+desc(e)+' ['+Math.round(c.l)+','+Math.round(c.r)+']');
    if(!e.matches('input[type=checkbox]')&&(c.w<40||c.h<40))out.push('muy chico para el dedo: '+desc(e)+' '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('input[type=checkbox]')){const fila=e.closest('label');if(!fila||fila.getBoundingClientRect().height<44)out.push('casillero sin una fila grande para tocar: '+desc(e))}
    if(e.matches('.btn,.oral-modo,.tab')&&e.scrollWidth>e.clientWidth+1)out.push('texto cortado: '+desc(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.matches('.btn,.oral-modo,.tab')&&e.scrollHeight>e.clientHeight+2)out.push('texto cortado (alto): '+desc(e))});
  const bs=scrollY>2?[]:todos.filter(e=>e.matches('button,input'));
  for(let i=0;i<bs.length;i++)for(let k=i+1;k<bs.length;k++){if(bs[i].contains(bs[k])||bs[k].contains(bs[i]))continue;const a=caja(bs[i]),c=caja(bs[k]);const ix=Math.min(a.r,c.r)-Math.max(a.l,c.l),iy=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(ix>2&&iy>2)out.push('se pisan: '+desc(bs[i])+' y '+desc(bs[k]))}
  [...pant.querySelectorAll('*:not(svg *)')].forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();if(r.right>vw+1||r.left<-1){if(!out.some(x=>x.includes(desc(e))))out.push('contenido fuera de la pantalla: '+desc(e))}});
  return out;
};
const contrastar=()=>{
  const num=c=>c.match(/[\d.]+/g).map(Number),lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
  const lum=c=>{const [r,g,b]=num(c);return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)};
  const fondo=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const a=num(c)[3];if(c!=='rgba(0, 0, 0, 0)'&&(a===undefined||a>0.5))return c;e=e.parentElement}return 'rgb(255,255,255)'};
  const out=[],pant=document.querySelector('.pantalla:not([hidden])');
  [...pant.querySelectorAll('*:not(svg *)')].filter(e=>e.children.length===0||e.matches('button')).forEach(e=>{
    const r=e.getBoundingClientRect();if(!r.width||!r.height)return;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
    if(e.closest('.or-nota'))return;   // blanco sobre degradé: se mide aparte
    const cs=getComputedStyle(e),a=lum(cs.color),b=lum(fondo(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
    if(ratio<(grande?3:4.5))out.push(e.className.split(' ')[0]+'«'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(e)+')')});
  const rgb=c=>num(c).slice(0,3),lumRGB=a=>.2126*lin(a[0])+.7152*lin(a[1])+.0722*lin(a[2]);
  const ratioRGB=(a,b)=>{const x=lumRGB(a),y=lumRGB(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
  pant.querySelectorAll('.or-nota').forEach(cont=>{
    const st=(getComputedStyle(cont).backgroundImage.match(/rgba?\([^)]*\)/g)||[]).map(rgb);
    [cont,...cont.querySelectorAll('*')].forEach(e=>{
      if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
      const cs=getComputedStyle(e),cc=num(cs.color),grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
      let peor=99;st.forEach(b=>{peor=Math.min(peor,ratioRGB(cc.slice(0,3),b))});
      if(peor<(grande?3:4.5))out.push('or-nota › «'+(e.innerText||'').slice(0,22).replace(/\n/g,' ')+'» '+peor.toFixed(2))})});
  return out;
};

(async()=>{
await new Promise(r=>srv.listen(0,'127.0.0.1',r));PORT=srv.address().port;
B=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
B2=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+WAV,'--autoplay-policy=no-user-gesture-required']});
B3=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+WAV_PAUSA,'--autoplay-policy=no-user-gesture-required']});
let t,p;

// ---------- 1) la pestaña y el botón, en cada tema de ideas; la intro no le pide nada a la IA
t=await pagina();p=t.p;
const malT=[],malI=[];
for(const id of IDEAS){
  await abrirOral(p,id);const tm=await tema(p,id);
  const info=await p.evaluate(()=>({tabs:[...document.querySelectorAll('#pEst .tab')].map(x=>x.textContent.trim()),on:(document.querySelector('#pEst .tab.on')||{}).textContent,ultima:(document.querySelector('#pEst .tab:last-child')||{}).textContent,
    modos:[...document.querySelectorAll('[data-oral-modo]')].map(x=>x.innerText.replace(/\n/g,' ')),boton:(document.getElementById('oralEmpezar')||{}).textContent,verdad:document.getElementById('pEst').classList.contains('en-oral')}));
  if(!/Examen oral/.test(info.on)||!/Examen oral/.test(info.ultima)||info.tabs.length<4)malT.push(id+': '+JSON.stringify(info.tabs));
  if(tm.n>7?!(info.modos.length===2&&info.modos[0].includes('las '+tm.n+' ideas')&&/6 preguntas/.test(info.modos[1])):info.modos.length!==0)malI.push(id+': '+JSON.stringify(info.modos));
  await p.click('#pEst .atras');await p.waitForSelector('#pTema:not([hidden])');await p.click('#pTema .atras');await p.waitForSelector('#pInicio:not([hidden])');
}
chk('los 6 temas de ideas (Sociales: colonias, sociedad, Borbones · Naturales: Sol, estaciones, gnomon) tienen la pestaña «🎤 Examen oral» al final de la pantalla de estudio, abierta con el botón del tema',malT.length===0,malT.join(' | '));
chk('la intro ofrece «Completo» (con la cantidad de ideas del tema) y «Corto» (6 preguntas) y el botón de empezar',malI.length===0,malI.join(' | '));
await p.click('.tema-btn[data-tema="provincias"]');await p.waitForSelector('#pTema:not([hidden]) #bPracticar');
chk('los temas de geografía (provincias) no tienen el botón del examen oral',await p.evaluate(()=>!document.getElementById('bOral')));
chk('abrir la pestaña no le pide nada a la IA: no se cargó el SDK de Firebase ni hubo ningún pedido',p.gstatic===0&&(await turnos(p)).length===0);
// la pestaña también se abre desde «Estudiar este tema» (tocando la pestaña)
await p.click('#pTema .atras');await irATema(p,'sol');await p.click('#bEstudiar');await p.waitForSelector('#pEst .tab');await p.click('#pEst .tab:last-child');await p.waitForSelector('#oralEmpezar');
chk('también se llega tocando la pestaña dentro de «Estudiar este tema»',await p.evaluate(()=>/Examen oral/.test(document.querySelector('#pEst .tab.on').textContent)));
const ayuda=await p.evaluate(()=>document.querySelector('.oral-ayuda').textContent);   // (textContent: la ayuda está plegada y innerText no devuelve lo que no se ve)
chk('la intro explica que se manda el audio a la IA de Google y que acá no se guarda (hay IA configurada)',/IA de Google/.test(ayuda)&&/no se guarda ningún audio/.test(ayuda));
chk('sin errores de página (intro)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 2) el examen corto con IA, escribiendo
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__guion=[{veredicto:'bien'},{veredicto:'parcial',falto:'faltó nombrar a los funcionarios'},{veredicto:'mal',falto:'no coincide con el texto'},{veredicto:'bien'},{veredicto:'bien'},{veredicto:'bien'}]});
const estadoAntes=await p.evaluate(()=>localStorage.getItem('integradora_estado'));
await abrirOral(p,'colonias');const col=await tema(p,'colonias');
await empezar(p,{modo:'corto'});
const resp=['el consejo de indias hacía las leyes','algo de los virreyes','respuesta que no coincide','no sé','no me acuerdo','ya me acordé: los cabildos gobernaban las ciudades'];
await escribirHasta(p,resp);
const tu=await turnos(p),e2=await estado(p);
chk('corto: 7 pedidos a la IA (la apertura y una evaluación por cada una de las 6 respuestas) y se preguntaron 6 ideas distintas',tu.length===7&&e2.res.length===6&&new Set(e2.res.map(r=>r.id)).size===6,tu.length+' pedidos, '+e2.res.length+' ideas');
const ord=e2.res.map(r=>col.ids.indexOf(r.id));
chk('… son ideas de ESTE tema, en el orden en que se estudian, y salen de los 3 grupos del tema (no todas del mismo)',ord.every(x=>x>=0)&&ord.every((x,i)=>i===0||x>ord[i-1])&&new Set(e2.res.map(r=>col.grupos[col.ids.indexOf(r.id)])).size===3);
chk('al tocar «Empezar» se precalienta la IA UNA vez (sin contarse como turno del examen: la primera llamada en frío tarda varios segundos)',await p.evaluate(()=>window.__calentadas===1));
chk('el sistema (en español rioplatense) nombra el tema, a Felipe y la materia, y no menciona el inglés ni Trinity',tu.every(x=>x.sys.includes(col.nombre)&&x.sys.includes('Felipe')&&x.sys.includes('Ciencias Sociales')&&/rioplatense/.test(x.sys)&&!/Trinity|English/i.test(x.sys)));
const i0=col.ids.indexOf(e2.agenda[0]);
chk('la apertura pide saludar y preguntar la PRIMERA idea con su texto de referencia',/^COMIENZO DEL EXAMEN/.test(tu[0].user)&&tu[0].user.includes(col.titulos[i0])&&tu[0].user.includes(col.resumenes[i0].slice(0,60))&&/PREGUNTA NÚMERO 1 DE 6/.test(tu[0].user));
let malM=[];
for(let k=1;k<=6;k++){
  const u=tu[k].user,ia=col.ids.indexOf(e2.agenda[k-1]),sg=k<6?col.ids.indexOf(e2.agenda[k]):-1,pregQ=k===1?'Primera pregunta de prueba?':'Pregunta número '+k+'?';
  if(!u.includes('IDEA QUE SE ACABA DE PREGUNTAR: '+col.titulos[ia]))malM.push(k+': idea');
  if(!u.includes('TEXTO DE REFERENCIA: '+col.resumenes[ia].slice(0,50)))malM.push(k+': texto');
  if(!u.includes('PREGUNTA QUE SE LE HIZO: '+pregQ))malM.push(k+': pregunta ('+u.split('\n')[2]+')');
  if(!u.includes('RESPUESTA DE FELIPE: «'+resp[k-1]+'»'))malM.push(k+': respuesta');
  if(k<6?!u.includes('IDEA SIGUIENTE: '+col.titulos[sg]):!/NO HAY IDEA SIGUIENTE/.test(u))malM.push(k+': siguiente');
  if(!u.includes('PREGUNTA NÚMERO '+k+' DE 6'))malM.push(k+': número');
}
chk('cada evaluación lleva la idea que se preguntó con su texto, la pregunta, lo que contestó, la idea siguiente (o «no hay») y el número',malM.length===0,malM.join(' | '));
chk('«no sé» y «no me acuerdo» valen «no contestó» aunque la IA diga «bien» (lo cuenta la aplicación)',e2.res[3].v==='nose'&&e2.res[4].v==='nose'&&e2.res.map(r=>r.v).join()==='bien,parcial,mal,nose,nose,bien',e2.res.map(r=>r.v).join());
const vo=(await p.evaluate(()=>window.__voces)).filter(x=>x.texto!=='ok');   // (la frase muda «ok», volumen 0, sólo desbloquea la voz en el celular)
chk('el examinador habla en español: dice el saludo, la primera pregunta y cada devolución JUNTO con la pregunta que sigue (una sola frase de voz, sin el hueco entre una y otra; con voz es-…, volumen normal)',vo.length===8&&vo.every(x=>/^es/i.test(x.lang)&&x.vol===1)&&vo.some(x=>/^¡Hola, Felipe! /.test(x.texto)&&x.texto.includes(col.nombre))&&vo.some(x=>x.texto==='Primera pregunta de prueba?')&&vo.some(x=>x.texto==='Devolución 1 Pregunta número 2?')&&vo.some(x=>x.texto==='Devolución 5 Pregunta número 6?')&&vo.some(x=>x.texto==='Devolución 6'),vo.length+' frases: '+JSON.stringify(vo.map(x=>x.texto).slice(0,4)));
chk('… y en la charla siguen siendo dos burbujas (la devolución y la pregunta), cada una con lo suyo',await p.evaluate(()=>{const l=[...document.querySelectorAll('.oral-charla .ob.ex')].map(x=>x.textContent.replace(/^Profe/,'').trim());return l.includes('Devolución 1')&&l.includes('Pregunta número 2?')&&!l.some(x=>/Devolución \d+ Pregunta/.test(x))}));
chk('el micrófono está suelto cada vez que habla el examinador (con el micrófono abierto, en iPhone la voz queda muda)',vo.every(x=>x.mic===0),JSON.stringify(vo.filter(x=>x.mic!==0).slice(0,2)));
const r2=await p.evaluate(()=>({pct:document.querySelector('.or-pct').innerText.replace(/\s+/g,''),cuenta:document.querySelector('.or-cuenta').innerText,h3:[...document.querySelectorAll('.oral-res h3')].map(x=>x.innerText),
  filas:[...document.querySelectorAll('.oral-res .or-lista:not(.bien):not(.sin) .or-fila')].map(x=>x.className+'|'+x.innerText.replace(/\n/g,' ')),botones:[...document.querySelectorAll('[data-oral-ver]')].length,tabsVisibles:getComputedStyle(document.querySelector('#pEst .tabs')).display,
  nota:document.querySelector('.oral-res .nota-aj').innerText}));
chk('resultado: 42 % ((2 bien + ½ de la parcial) de 6) y la cuenta «2 bien · 1 a medias · 3 a repasar»',r2.pct==='42%'&&/✅ 2 bien · 🟡 1 a medias · ❌ 3 a repasar/.test(r2.cuenta)&&!/sin preguntar/.test(r2.cuenta),r2.pct+' · '+r2.cuenta);
chk('… separa «Para repasar» (3), «A medias» (1, con lo que faltó) y «Lo sabe» (2)',r2.h3.join()==='❌ Para repasar,🟡 A medias,✅ Lo sabe'&&r2.filas.filter(x=>/mal|nose/.test(x.split('|')[0])).length===3&&r2.filas.some(x=>/parcial/.test(x)&&/faltó nombrar a los funcionarios/.test(x)),JSON.stringify(r2.h3));
chk('… cada idea para repasar trae lo que dijo, y «Ver el resumen»; dice que la corrección la hizo la IA y que no es una nota oficial',r2.filas.some(x=>/Dijo: «respuesta que no coincide»/.test(x))&&r2.botones>=4&&/hecha por la IA/.test(r2.nota)&&/no una nota oficial/.test(r2.nota));
chk('al terminar las pestañas vuelven a verse (durante el examen se esconden)',r2.tabsVisibles!=='none');
// «Ver el resumen» abre el resumen justo en esa idea
const idRep=e2.res[2].id;
await p.click('.or-fila.mal [data-oral-ver]');await p.waitForSelector('#pEst .con.foco');
const ver=await p.evaluate(()=>({tab:document.querySelector('#pEst .tab.on').textContent,foco:document.querySelector('#pEst .con.foco').id}));
chk('«Ver el resumen» abre la pestaña Resumen en esa idea',/Resumen/.test(ver.tab)&&ver.foco==='c-'+idRep,JSON.stringify(ver));
// el historial, la intro y el botón del tema
await p.click('#pEst .tab:last-child');await p.waitForSelector('#oralEmpezar');
const intro2=await p.evaluate(()=>({ult:(document.querySelector('.oral-ult')||{}).innerText,hist:localStorage.getItem('integradora_oral')}));
chk('el resultado queda guardado (42 %, 6 de 6, corto) y la intro dice «Último examen oral de este tema: 42 %»',/Último examen oral de este tema: 42 %/.test(intro2.ult)&&/"p":42/.test(intro2.hist)&&/"modo":"corto"/.test(intro2.hist),intro2.ult);
await p.click('#pEst .atras');await p.waitForSelector('#pTema:not([hidden])');
chk('en la pantalla del tema el botón del examen oral muestra «Último: 42 %»',await p.evaluate(()=>/Último: 42 %/.test(document.getElementById('bOral').innerText)));
chk('el examen oral no toca lo aprendido (el estado de las cajitas queda igual)',await p.evaluate(()=>localStorage.getItem('integradora_estado'))===estadoAntes);
chk('sin errores de página (examen corto)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 3) el examen completo pregunta TODAS las ideas del tema, una vez cada una y en orden
t=await pagina();p=t.p;
await abrirOral(p,'gnomon');const gn=await tema(p,'gnomon');
await empezar(p,{modo:'completo'});
const ped=await escribirHasta(p,['contesto con mis palabras lo que me acuerdo del tema']);
const e3=await estado(p),tu3=await turnos(p);
chk('completo: se hacen '+gn.n+' preguntas, una por cada idea del tema, en el orden de estudio y ninguna repetida',ped===gn.n&&e3.res.map(r=>r.id).join()===gn.ids.join()&&e3.modo==='completo',ped+' respuestas');
chk('… y la IA recibe el texto de CADA idea (para comparar con lo que contesta)',gn.resumenes.every(r=>tu3.some(x=>x.user.includes(r.slice(0,70)))));
chk('… con todo bien: 100 % y sin «sin preguntar»',await p.evaluate(()=>document.querySelector('.or-pct').innerText.replace(/\s+/g,'')==='100%'&&!/sin preguntar/.test(document.querySelector('.or-cuenta').innerText)&&!document.querySelector('.or-lista.sin')));
chk('sin errores de página (examen completo)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 4) sin IA configurada: el examen sigue, con preguntas «Contame…» y la corrección simple
t=await pagina({ia:false});p=t.p;
await abrirOral(p,'sociedad');const so=await tema(p,'sociedad');
const ayuda4=await p.evaluate(()=>document.querySelector('.oral-ayuda').textContent);
chk('sin IA, la intro lo dice (corrección simple, palabras clave) y no habla de mandar audio a ningún lado',/no hay IA configurada/.test(ayuda4)&&!/IA de Google/.test(ayuda4));
await p.click('[data-oral-modo="corto"]');await p.click('#oralEmpezar');await p.waitForSelector('#oralChat .ob.ex');
const ent4=await p.evaluate(()=>INT.oral._t.ent());
chk('sin IA ni dictado del navegador se contesta escribiendo (modo «texto»), sin pedir nada a la red',ent4==='texto'&&p.gstatic===0,ent4);
await p.waitForSelector('#oralType:not([hidden])');
const ag=await estado(p);const idsAg=ag.agenda,idx0=so.ids.indexOf(idsAg[0]);
const preg0=await p.evaluate(()=>[...document.querySelectorAll('#oralChat .ob.ex')].map(x=>x.innerText.replace(/^(EXAMINADOR|PROFE)\s*/i,'').trim()));
const esperada=await p.evaluate(id=>INT.oral._t.preguntaPlantilla(INT.item(id)),idsAg[0]);
chk('el saludo y la primera pregunta salen de la plantilla («Contame…» con el título de la idea, o el título mismo si ya es una pregunta)',preg0.some(x=>/^¡Hola, Felipe!/.test(x))&&preg0.includes(esperada)&&(esperada===so.titulos[idx0]||esperada.includes(so.titulos[idx0])),JSON.stringify(preg0)+' · '+esperada);
const r4=['__RESUMEN__','no sé','hola, un perro','__MITAD__','__RESUMEN__','__RESUMEN__'];
const respuestas4=idsAg.map((id,k)=>{const rs=so.resumenes[so.ids.indexOf(id)];return r4[k]==='__RESUMEN__'?rs:r4[k]==='__MITAD__'?rs.split(' ').slice(0,Math.ceil(rs.split(' ').length/2)).join(' '):r4[k]});
await escribirHasta(p,respuestas4);
const e4=await estado(p);
chk('corrección simple: el resumen completo = bien, «no sé» = no contestó, algo sin relación = mal, la mitad del texto = bien o a medias',e4.res[0].v==='bien'&&e4.res[1].v==='nose'&&e4.res[2].v==='mal'&&/bien|parcial/.test(e4.res[3].v)&&e4.res[4].v==='bien'&&e4.res.every(r=>r.ia===false),e4.res.map(r=>r.v).join());
chk('… y el resultado avisa que se corrigió sin IA (menos precisa)',await p.evaluate(()=>/sin IA/.test(document.querySelector('.oral-res .nota-aj').innerText)&&/menos precisa/.test(document.querySelector('.oral-res .nota-aj').innerText)&&/sin IA/.test(document.querySelector('.or-fila').innerText)));
chk('… el resultado se guarda marcado «sin IA»',await p.evaluate(()=>/"ia":false/.test(localStorage.getItem('integradora_oral'))));
chk('sin errores de página (sin IA)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 5) la IA se cae a mitad del examen: se avisa y se sigue con la corrección simple
t=await pagina();p=t.p;
await abrirOral(p,'estaciones');const es=await tema(p,'estaciones');
await empezar(p,{modo:'corto'});
let avisos5=[];
await escribirHasta(p,['primera respuesta bien pensada','segunda respuesta que me acuerdo','tercera','cuarta','quinta','sexta'],{antes:async i=>{if(i===2)await p.evaluate(()=>{window.__iaFalla='503 service unavailable'});if(i===5)avisos5=await p.evaluate(()=>[...document.querySelectorAll('#oralChat .ob.tip')].map(x=>x.innerText));return false}});
const e5=await estado(p);
chk('con la IA caída desde la 3.ª respuesta el examen igual termina las 6 preguntas',e5.res.length===6&&e5.terminado===true,e5.res.length+' ideas');
chk('… las 2 primeras se corrigieron con IA y las otras sin ella; tras 2 fallas seguidas se deja la IA («Sigo con una corrección más simple»)',e5.res[0].ia===true&&e5.res[1].ia===true&&e5.res.slice(2).every(r=>!r.ia)&&e5.ia===false);
const nota5=await p.evaluate(()=>document.querySelector('.oral-res .nota-aj').innerText);
chk('… durante el examen se avisó («La IA no respondió… Corrijo esta respuesta de una forma más simple», y después «Sigo con una corrección más simple») y el resultado dice que alguna respuesta se corrigió sin IA',avisos5.some(x=>/La IA no respondió/.test(x)&&/de una forma más simple/.test(x))&&avisos5.some(x=>/Sigo con una corrección más simple/.test(x))&&/sin IA/.test(nota5),JSON.stringify(avisos5).slice(0,200));
chk('sin errores de página (la IA se cae)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 6) «repetí la pregunta» (no gasta un pedido), la IA que «repite» sólo vale si preguntó de verdad, y «Pasar»
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__guion=[{},{veredicto:'repite',devolucion:'El virrey era la autoridad máxima.',pregunta:'¿Qué hacía el virrey?'}]});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
let nPed=0;const conteo=[];
await escribirHasta(p,['¿me repetís la pregunta, por favor?','el consejo de indias hacía las leyes','¿qué es un virrey?','el virrey era la máxima autoridad','respuesta','respuesta','respuesta','respuesta'],{antes:async i=>{conteo.push((await turnos(p)).length);return false}});
const tu6=await turnos(p),e6=await estado(p);
chk('«repetime la pregunta» no gasta ningún pedido a la IA: el examinador la dice de nuevo («Claro. …»)',conteo[0]===1&&conteo[1]===1&&await p.evaluate(()=>[...document.querySelectorAll('.oral-charla .ob.ex')].some(x=>/Claro\. Primera pregunta de prueba\?/.test(x.textContent))),conteo.slice(0,3).join());
chk('si la IA dice «repite» y el chico de verdad preguntó (¿qué es un virrey?), se contesta, se vuelve a preguntar lo mismo y NO se avanza de idea (8 pedidos: apertura + 6 + el de la repregunta)',tu6.length===8&&e6.res.length===6&&await p.evaluate(()=>[...document.querySelectorAll('.oral-charla .ob.ex')].some(x=>/El virrey era la autoridad máxima\./.test(x.textContent))&&[...document.querySelectorAll('.oral-charla .ob.ex')].some(x=>/¿Qué hacía el virrey\?/.test(x.textContent))),tu6.length+' pedidos');
chk('lo que se le contestó a la repregunta se evalúa como respuesta de la MISMA idea',tu6[3].user.includes('RESPUESTA DE FELIPE: «el virrey era la máxima autoridad»')&&tu6[3].user.includes('PREGUNTA QUE SE LE HIZO: ¿Qué hacía el virrey?'));
await t.ctx.close();
// la IA dice «repite» pero el chico no preguntó nada: se corrige como respuesta
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__guion=[{veredicto:'repite',devolucion:'Algo sin sentido.',pregunta:'Otra vez lo mismo?'}]});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await escribirHasta(p,['una respuesta cualquiera sobre el tema']);
const e6b=await estado(p);
chk('si la IA dice «repite» pero el chico no pidió repetir ni preguntó, no se frena el examen: se corrige como respuesta y se sigue',e6b.res.length===6&&e6b.res[0].v!=='repite'&&e6b.res[0].ia===false,e6b.res[0].v);
await t.ctx.close();
// Pasar
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');await p.click('#oralPasar');
await p.waitForSelector('#oralType:not([hidden])');
const e7=await estado(p),tu7=await turnos(p);
chk('«Pasar» cuenta como «no contestó» (la IA recibe «(no contestó)») y se sigue con la pregunta que viene',e7.res.length===1&&e7.res[0].v==='nose'&&e7.res[0].pasar===true&&/RESPUESTA DE FELIPE: \(no contestó\)/.test(tu7[1].user));
await t.ctx.close();

// ---------- 7) la pausa al irse a otra aplicación, «Terminar» y la flecha de arriba
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');await p.fill('#oralIn','primera respuesta');await p.click('#oralSend');
await p.waitForSelector('#oralType:not([hidden])');
chk('durante el examen las pestañas de estudio se esconden (no se puede cambiar sin querer) y la pantalla se mantiene encendida (si no, el celu se bloquea mientras el chico habla)',await p.evaluate(()=>getComputedStyle(document.querySelector('#pEst .tabs')).display==='none'&&window.__wake===1));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForSelector('#oralSeguir',{timeout:5000});
chk('al irse a otra aplicación el examen queda en pausa («Examen en pausa» con «Seguir»), se suelta el micrófono y se suelta la pantalla',await p.evaluate(()=>window.__micVivo()===0&&window.__wake===0&&/en pausa/.test(document.getElementById('oralPausa').innerText)&&INT.oral._t.estado().pausado===true));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})});
const vAntes=(await p.evaluate(()=>window.__voces)).length;
await p.click('#oralSeguir');await p.waitForSelector('#oralType:not([hidden])');
const volvio=await p.evaluate(()=>[...document.querySelectorAll('#oralChat .ob.ex')].map(x=>x.innerText).some(x=>/Seguimos\. /.test(x)));
chk('«Seguir» retoma por la pregunta donde estaba («Seguimos. …»), vuelve a pedir la pantalla encendida y el examen continúa hasta el final',volvio&&await p.evaluate(()=>window.__wake===1)&&await escribirHasta(p,['sigo contestando'])>=1&&(await estado(p)).res.length===6);
chk('al terminar el examen la pantalla se suelta (queda como siempre)',await p.evaluate(()=>window.__wake===0));
await t.ctx.close();
// Terminar con 2 respondidas
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await escribirHasta(p,['una respuesta','otra respuesta','tercera'],{antes:async i=>{if(i===2){await p.click('#oralTerminar');return true}return false}});
await p.waitForSelector('#modal:not([hidden]) #mSi');
chk('«Terminar» pregunta antes y, si se confirma, muestra el resultado de lo contestado («2 sin preguntar» no cuenta como mal)',await p.evaluate(()=>/Terminar el examen ahora/.test(document.getElementById('modal').innerText)));
await p.click('#mSi');await p.waitForSelector('.oral-res');
const r8=await p.evaluate(()=>({cuenta:document.querySelector('.or-cuenta').innerText,sin:!!document.querySelector('.or-lista.sin'),nota:document.querySelector('.oral-res .nota-aj').innerText}));
chk('… con 2 contestadas: 100 % de las 2, y las otras 4 quedan «sin preguntar»',/⏭️ 4 sin preguntar/.test(r8.cuenta)&&r8.sin&&/Contestó 2 de 6/.test(r8.nota),r8.cuenta);
await t.ctx.close();
// Terminar sin haber contestado nada: vuelve a la intro
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});await p.waitForSelector('#oralType:not([hidden])');
await p.click('#oralTerminar');await p.waitForSelector('#modal:not([hidden]) #mSi');
chk('«Terminar» sin haber contestado nada pregunta «¿Dejar el examen oral?» y vuelve a la intro (no guarda un resultado vacío)',await p.evaluate(()=>/Dejar el examen oral/.test(document.getElementById('modal').innerText)));
await p.click('#mSi');await p.waitForSelector('#oralEmpezar');
chk('… sin guardar nada en el historial',await p.evaluate(()=>!localStorage.getItem('integradora_oral')&&!INT.oral.enCurso()));
// la flecha de arriba pregunta; «No, seguir» sigue; «Dejarlo» sale y suelta la voz y el micrófono
await p.click('#oralEmpezar');await p.waitForSelector('#oralChat .ob.ex');await p.click('#oralKb');await p.waitForSelector('#oralType:not([hidden])');
await p.click('#pEst .atras');await p.waitForSelector('#modal:not([hidden]) #mNo');
chk('la flecha de arriba, en pleno examen, pregunta «¿Dejar el examen oral? Se pierde lo que va hecho»',await p.evaluate(()=>/Dejar el examen oral\? Se pierde lo que va hecho/.test(document.getElementById('modal').innerText)));
chk('con el cartel abierto el examen queda frenado: no habla ni abre el micrófono por detrás',await p.evaluate(()=>INT.oral._t.estado().pausado===true&&window.__micVivo()===0));
await p.click('#mNo');await p.waitForSelector('#oralType:not([hidden])',{timeout:8000});
chk('«No, seguir» retoma el examen por la misma pregunta («Seguimos. …») y deja todo como estaba',await p.evaluate(()=>INT.oral.enCurso()&&!document.getElementById('pEst').hidden&&!document.getElementById('oralType').hidden&&[...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Seguimos\. /.test(x.textContent))));
const canc0=await p.evaluate(()=>window.__cancel);
await p.click('#pEst .atras');await p.click('#mSi');await p.waitForSelector('#pTema:not([hidden])');
chk('«Dejarlo» sale a la pantalla del tema, corta la voz y deja el micrófono y la pantalla sueltos',await p.evaluate(c=>!INT.oral.enCurso()&&window.__micVivo()===0&&window.__wake===0&&window.__cancel>c,canc0));
chk('sin errores de página (cortes)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 7b) la voz del celular no suena: se avisa una vez, no se pierde tiempo esperándola y el examen sigue leyéndose en pantalla
t=await pagina();p=t.p;
await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__voces.push({texto:u.text})}});   // nunca arranca (ni onstart ni onend)
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
const t0v=Date.now();
let avisosVoz=-1;
await escribirHasta(p,['respuesta una','respuesta dos','respuesta tres','respuesta cuatro','respuesta cinco','respuesta seis'],{antes:async i=>{if(i===5)avisosVoz=await p.evaluate(()=>[...document.querySelectorAll('#oralChat .ob.tip')].filter(x=>/No pude hacer sonar la voz/.test(x.textContent)).length);return false}});
const seg7=(Date.now()-t0v)/1000,e7b=await estado(p);
const tipos=await p.evaluate(()=>({sin:INT.oral._t.estado().sinVoz,avisos:[...document.querySelectorAll('.oral-charla .ob')].length,voces:window.__voces.filter(x=>x.texto!=='ok').length}));
chk('si la voz no suena el examen igual se completa leyendo en pantalla (6 preguntas) y no se queda esperando una voz muda en cada frase: tras 2 intentos fallidos se sigue sin voz',e7b.res.length===6&&tipos.sin===true&&tipos.voces<=6&&seg7<60,seg7.toFixed(1)+' s · '+JSON.stringify(tipos));
chk('… y avisa UNA sola vez («No pude hacer sonar la voz del examinador»)',avisosVoz===1,String(avisosVoz));
await t.ctx.close();

// ---------- 7c) lo que halló la revisión independiente
// (1) pausar mientras el examinador comenta una respuesta no pierde la pregunta que sigue
t=await pagina();p=t.p;
await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__voces.push({texto:u.text,lang:u.lang,vol:u.volume,mic:0});setTimeout(()=>u.onstart&&u.onstart(),10);setTimeout(()=>u.onend&&u.onend(),/^Devolución/.test(u.text)?1500:30)}});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');await p.fill('#oralIn','respuesta uno');await p.click('#oralSend');
await p.waitForFunction(()=>[...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Devolución 1/.test(x.textContent)),null,{timeout:8000});
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForSelector('#oralSeguir');
const e1pausa=await estado(p);
chk('si se pausa mientras el examinador comenta una respuesta, la pregunta NUEVA ya está guardada (idea 2, «Pregunta número 2?»): no se retoma por la vieja',e1pausa.idx===1&&e1pausa.pregunta==='Pregunta número 2?',JSON.stringify(e1pausa));
chk('al pausar el foco pasa a «▶️ Seguir» (lectores de pantalla)',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='oralSeguir'));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})});
await p.click('#oralSeguir');await p.waitForSelector('#oralType:not([hidden])');
const dec1=await p.evaluate(()=>[...document.querySelectorAll('#oralChat .ob.ex')].map(x=>x.textContent.replace(/^Profe/,'').trim()));
await p.fill('#oralIn','respuesta dos');await p.click('#oralSend');await p.waitForSelector('#oralType:not([hidden])');
const tu1=await turnos(p),ag1=(await estado(p)).agenda,tm1=await tema(p,'colonias');
chk('«Seguir» dice «Seguimos. Pregunta número 2?» y la respuesta siguiente se corrige contra la idea 2 con SU pregunta (no contra la idea 3 con la pregunta de la 1)',dec1.includes('Seguimos. Pregunta número 2?')&&tu1[2].user.includes('IDEA QUE SE ACABA DE PREGUNTAR: '+tm1.titulos[tm1.ids.indexOf(ag1[1])])&&tu1[2].user.includes('PREGUNTA QUE SE LE HIZO: Pregunta número 2?'),dec1.join(' | '));
await t.ctx.close();
// … y si se pausa mientras el examinador se despide de la ÚLTIMA pregunta, «Seguir» va directo al resultado (una sola vez en el historial)
t=await pagina();p=t.p;
await p.evaluate(()=>{speechSynthesis.speak=u=>{window.__voces.push({texto:u.text,lang:u.lang,vol:u.volume,mic:0});setTimeout(()=>u.onstart&&u.onstart(),10);setTimeout(()=>u.onend&&u.onend(),/^Devolución/.test(u.text)?1500:30)}});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await escribirHasta(p,['respuesta'],{antes:async i=>i===5});
await p.fill('#oralIn','la última respuesta');await p.click('#oralSend');
await p.waitForFunction(()=>INT.oral._t.estado()&&INT.oral._t.estado().idx===6,null,{timeout:8000});
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForSelector('#oralSeguir');await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true})});
await p.click('#oralSeguir');await p.waitForSelector('.oral-res',{timeout:8000});
const e1fin=await estado(p),h1b=await p.evaluate(()=>JSON.parse(localStorage.getItem('integradora_oral')).colonias.length);
chk('pausar durante la despedida de la última pregunta y tocar «Seguir» muestra el resultado (6 ideas, sin repetir ninguna pregunta ni decir «Seguimos») y lo guarda una sola vez',e1fin.res.length===6&&e1fin.terminado&&h1b===1&&await p.evaluate(()=>![...document.querySelectorAll('.oral-charla .ob.ex')].some(x=>/Seguimos/.test(x.textContent))),h1b+' en el historial');
chk('al mostrarse el resultado el foco pasa a la tarjeta del resultado (lectores de pantalla)',await p.evaluate(()=>document.activeElement&&document.activeElement.id==='oralResultado'));
await t.ctx.close();

// (2) «se repite» dentro de una respuesta correcta NO es un pedido de repetir; los pedidos de verdad sí, y no gastan un pedido a la IA
t=await pagina();p=t.p;
const reps=await p.evaluate(()=>{const L=INT.oral._t,si=['repetí','repetime','repetí la pregunta','me repetís la pregunta','me la repetís','podés repetir la pregunta','puedes repetir','otra vez','de nuevo','otra vez por favor','la pregunta otra vez','decila de nuevo','no te escuché','no entendí','no entiendo la pregunta','qué dijiste','perdón','¿qué?','cómo'],
  no=['Cada vez que se repite el mediodía solar','el ciclo se repite','Repetir los registros','Si se repite el registro cada día','otra vez no','de nuevo se forman las estaciones','el Sol sale de nuevo cada mañana','la sombra otra vez se acorta','No se les reconocían derechos','los virreyes repetían las órdenes','','   '];
  return {mal:si.filter(x=>!L.pidioRepetir(x)).concat(no.filter(x=>L.pidioRepetir(x)))}});
chk('«repetí» y parecidos se reconocen SÓLO por su forma de pedido (19 pedidos reales sí; 12 respuestas como «se repite el mediodía solar», «Repetir los registros» o «otra vez no», no)',reps.mal.length===0,JSON.stringify(reps.mal));
await abrirOral(p,'sol');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');const n0r=(await turnos(p)).length;
await p.fill('#oralIn','Cada vez que se repite el mediodía solar');await p.click('#oralSend');await p.waitForSelector('#oralType:not([hidden])');
chk('una respuesta correcta que dice «se repite» se evalúa (1 pedido a la IA) y el examinador no contesta «Claro. …»',(await turnos(p)).length===n0r+1&&await p.evaluate(()=>![...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Claro\./.test(x.textContent))));
await t.ctx.close();
// (9) lo mismo con «no sé»
t=await pagina({ia:false});p=t.p;
const nosr=await p.evaluate(()=>{const L=INT.oral._t,si=['no sé','No sé nada','no lo sé','no la sé','ni idea','no me acuerdo','no recuerdo','me olvidé','no tengo idea','no tengo ni idea','paso','pasar','siguiente','mmm no sé','no sé profe','',null],
  no=['No se mueve el Sol','No se les reconocían derechos','No se elegían entre todos','Pasó que el Sol se puso','siguiente era el virreinato','Paso a paso se ordenan los registros','no existían los cabildos'];
  return {mal:si.filter(x=>!L.esNoSe(x)).concat(no.filter(x=>L.esNoSe(x)))}});
chk('«no sé» y parecidos se reconocen sólo como frases enteras (17 sí; «No se mueve el Sol», «No se les reconocían derechos», «Pasó que…» y otras 4 respuestas, no)',nosr.mal.length===0,JSON.stringify(nosr.mal));
const plan=await p.evaluate(()=>{const L=INT.oral._t,f=t=>L.preguntaPlantilla({titulo:t});return ['Qué hacía el cabildo','Qué tan alto llega el Sol','¿Para qué hicieron las reformas?','Cómo se hacen las sombras','Los virreyes','Cuándo empieza el otoño'].map(f)});
chk('la pregunta sin IA («Qué hacía el cabildo» → «¿Qué hacía el cabildo?») se arma bien aunque el título empiece con tilde',plan.join('|')==='¿Qué hacía el cabildo?|¿Qué tan alto llega el Sol?|¿Para qué hicieron las reformas?|¿Cómo se hacen las sombras?|Contame con tus palabras lo que estudiaste sobre: Los virreyes.|¿Cuándo empieza el otoño?',plan.join('|'));
await t.ctx.close();

// (3) «Pasar» y «Repetir» sólo valen mientras se hace la pregunta o se espera la respuesta: no se «arman» mientras la IA piensa ni por un doble toque
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__demora=900});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');
await p.fill('#oralIn','una respuesta');await p.click('#oralSend');
await p.waitForFunction(()=>document.getElementById('oralPasar').disabled&&document.getElementById('oralRep').disabled,null,{timeout:3000});
await p.evaluate(()=>{document.getElementById('oralPasar').click();document.getElementById('oralRep').click()});
await p.waitForSelector('#oralType:not([hidden])',{timeout:10000});
const e3flags=await estado(p);
chk('mientras la IA piensa y el examinador comenta, «Pasar» y «Repetir» están apagados: un toque ahí no se come la pregunta que viene (quedó 1 sola respondida, sin banderas armadas)',e3flags.res.length===1&&e3flags.res[0].v==='bien'&&!e3flags.pasar&&!e3flags.repetir,JSON.stringify(e3flags.res.map(r=>r.v))+' '+e3flags.pasar+e3flags.repetir);
chk('cuando se espera la respuesta los dos botones se prenden',await p.evaluate(()=>!document.getElementById('oralPasar').disabled&&!document.getElementById('oralRep').disabled));
await p.evaluate(()=>{const b=document.getElementById('oralPasar');b.click();b.click()});   // doble toque
await p.waitForSelector('#oralType:not([hidden])',{timeout:10000});
const e3pasar=await estado(p);
chk('un doble toque en «Pasar» salta UNA sola pregunta (2 respondidas, la segunda «pasó»; la que viene se espera)',e3pasar.res.length===2&&e3pasar.res[1].pasar===true&&e3pasar.res[1].v==='nose'&&!e3pasar.pasar,JSON.stringify(e3pasar.res.map(r=>r.v+(r.pasar?'*':''))));
await t.ctx.close();

// (6) lo que estaba por sonar no suena después de salir (la voz del celu tarda en arrancar y al cancelar avisa «interrupted»)
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__pend=null;speechSynthesis.speak=u=>{window.__voces.push({texto:u.text,lang:u.lang,vol:u.volume,mic:0});window.__pend=u;setTimeout(()=>{if(window.__pend===u){window.__pend=null;u.onstart&&u.onstart();setTimeout(()=>u.onend&&u.onend(),30)}},700)};speechSynthesis.cancel=()=>{window.__cancel++;const u=window.__pend;window.__pend=null;if(u)setTimeout(()=>u.onerror&&u.onerror({error:'interrupted'}),0)}});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForFunction(()=>window.__voces.filter(x=>x.texto!=='ok').length>=1,null,{timeout:10000});
await p.click('#pEst .atras');await p.waitForSelector('#modal:not([hidden]) #mSi');await p.click('#mSi');await p.waitForSelector('#pTema:not([hidden])');
const antesV=(await p.evaluate(()=>window.__voces)).filter(x=>x.texto!=='ok').length;await p.waitForTimeout(1800);
chk('si se sale del examen cuando una frase todavía no había empezado a sonar, esa frase no se reintenta ni suena después',(await p.evaluate(()=>window.__voces)).filter(x=>x.texto!=='ok').length===antesV&&await p.evaluate(()=>window.__pend===null),String(antesV));
await t.ctx.close();

// (7) con el cartel de «Terminar» abierto el examen está frenado (no habla ni abre el micrófono), «No, seguir» lo retoma y el resultado se guarda UNA vez
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');await p.fill('#oralIn','una respuesta');await p.click('#oralSend');await p.waitForSelector('#oralType:not([hidden])');
await p.click('#oralTerminar');await p.waitForSelector('#modal:not([hidden]) #mNo');
const v1=(await p.evaluate(()=>window.__voces)).length;
chk('con el cartel de «Terminar» abierto el examen queda frenado (en pausa, micrófono suelto)',await p.evaluate(()=>INT.oral._t.estado().pausado===true&&window.__micVivo()===0));
await p.waitForTimeout(900);
chk('… y no habla por detrás',(await p.evaluate(()=>window.__voces)).length===v1);
await p.keyboard.press('Escape');await p.waitForSelector('#oralType:not([hidden])',{timeout:8000});
chk('cerrar el cartel con Escape también retoma el examen («Seguimos. …»)',await p.evaluate(()=>INT.oral.enCurso()&&[...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Seguimos\. /.test(x.textContent))));
await escribirHasta(p,['sigo contestando']);
chk('el resultado se guarda una sola vez en el historial',await p.evaluate(()=>JSON.parse(localStorage.getItem('integradora_oral')).colonias.length===1));
await t.ctx.close();

// (8) un examen sin terminar no se presenta como «excelente» y no cuenta como «mejor»
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await escribirHasta(p,['una respuesta','otra respuesta','tercera'],{antes:async i=>{if(i===2){await p.click('#oralTerminar');return true}return false}});
await p.waitForSelector('#modal:not([hidden]) #mSi');await p.click('#mSi');await p.waitForSelector('.oral-res');
const r8b=await p.evaluate(()=>({msg:document.querySelector('.or-msg').innerText,de:(document.querySelector('.or-de')||{}).innerText||''}));
chk('con «Terminar» antes de tiempo el resultado dice «Examen sin terminar: quedaron 4 ideas sin preguntar» y que el porcentaje es «de lo contestado» (no un «¡Excelente!»)',/Examen sin terminar: quedaron 4 ideas sin preguntar/.test(r8b.msg)&&/de lo contestado/.test(r8b.de)&&!/Excelente/.test(r8b.msg),JSON.stringify(r8b));
await p.click('#pEst .tab:last-child');await p.waitForSelector('#oralEmpezar');
const ult8=await p.evaluate(()=>document.querySelector('.oral-ult').innerText);
await p.click('#pEst .atras');await p.waitForSelector('#pTema:not([hidden])');
chk('la intro y el botón del tema dicen «(2 de 6: quedó sin terminar)» / «Último: 100 % (2 de 6)»',/\(2 de 6: quedó sin terminar\)/.test(ult8)&&await p.evaluate(()=>/Último: 100 % \(2 de 6\)/.test(document.getElementById('bOral').innerText)),ult8);
await t.ctx.close();

// (10) el veredicto de la IA se normaliza, y una sola palabra no es «bien» (como en la corrección simple)
t=await pagina();p=t.p;
await p.evaluate(()=>{window.__guion=[{veredicto:'Bien.'},{veredicto:'Correcto'},{veredicto:'???'},{veredicto:'MAL'},{veredicto:'a medias'},{veredicto:'excelente'}]});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await escribirHasta(p,['virreinato','el consejo hacía las leyes','algo de eso','respuesta mal dicha','creo que era así','ya me acordé todo']);
const e10ver=await estado(p);
chk('«Bien.» con una sola palabra → a medias («Contestó con una sola palabra»); «Correcto» → bien; «???» → a medias; «MAL» → mal; «a medias» → a medias; «excelente» → bien',e10ver.res.map(r=>r.v).join()==='parcial,bien,parcial,mal,parcial,bien'&&/una sola palabra/.test(e10ver.res[0].falto),e10ver.res.map(r=>r.v).join());
await t.ctx.close();

// (15) un doble toque en «Examen oral con IA» no aprieta «Empezar» de la pantalla nueva (durante 0,4 s no se atiende, como en el resto de la app)
t=await pagina({espera:true});p=t.p;
await p.click('.tema-btn[data-tema="colonias"]');await p.waitForTimeout(450);await p.click('#bOral');await p.waitForSelector('#oralEmpezar');
await p.evaluate(()=>document.getElementById('oralEmpezar').click());await p.waitForTimeout(250);
chk('un segundo toque apurado sobre la pantalla nueva no empieza el examen',await p.evaluate(()=>!INT.oral.enCurso()&&!document.getElementById('oralExam')));
await p.waitForTimeout(350);await p.evaluate(()=>document.getElementById('oralEmpezar').click());await p.waitForSelector('#oralChat .ob.ex');
chk('… y pasado ese instante, sí',await p.evaluate(()=>INT.oral.enCurso()));
await t.ctx.close();

// accesibilidad: los botones de cuántas preguntas indican cuál está elegido, y el aviso del micrófono llega a los lectores de pantalla
t=await pagina();p=t.p;
await abrirOral(p,'colonias');
const aria=await p.evaluate(()=>({botones:[...document.querySelectorAll('[data-oral-modo]')].map(b=>b.getAttribute('aria-pressed')),grupo:document.querySelector('.oral-modos').getAttribute('role')}));
await p.click('[data-oral-modo="corto"]');
const aria2=await p.evaluate(()=>[...document.querySelectorAll('[data-oral-modo]')].map(b=>b.getAttribute('aria-pressed')));
await p.click('#oralEmpezar');await p.waitForSelector('#oralChat .ob.ex');
const aria3=await p.evaluate(()=>({mic:document.getElementById('oralMic').getAttribute('role'),foco:document.activeElement&&document.activeElement.id}));
chk('los botones «Completo / Corto» marcan cuál está elegido (aria-pressed, en un grupo) y el examen toma el foco al empezar; el aviso del micrófono es un «status»',aria.grupo==='group'&&aria.botones.join()==='true,false'&&aria2.join()==='false,true'&&aria3.mic==='status'&&/oralExam|oralIn|oralHablar|oralKb|oralTerminar/.test(aria3.foco),JSON.stringify([aria,aria2,aria3]));
await t.ctx.close();

// ---------- 8) la voz se puede apagar a mitad del examen
t=await pagina();p=t.p;
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});await p.waitForSelector('#oralType:not([hidden])');
await p.click('#oralVozBtn');const n0=(await p.evaluate(()=>window.__voces)).length;
await p.fill('#oralIn','respuesta');await p.click('#oralSend');await p.waitForSelector('#oralType:not([hidden])');
const n1=(await p.evaluate(()=>window.__voces)).length;
chk('con 🔇 el examinador deja de hablar (se sigue leyendo en pantalla) y el examen sigue',n1===n0&&(await estado(p)).res.length===1&&await p.evaluate(()=>document.getElementById('oralVozBtn').getAttribute('aria-pressed')==='false'&&JSON.parse(localStorage.getItem('integradora_oral_cfg')).voz===false),n0+' → '+n1);
await t.ctx.close();

// ---------- 9) con el micrófono de prueba (voz y silencio): graba, corta sola, pasa a texto, y el micrófono queda suelto mientras habla el examinador
t=await pagina({mic:true});p=t.p;
await p.evaluate(()=>{window.__voz='el consejo de indias hacía las leyes para américa'});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
await p.waitForSelector('#oralMic:not([hidden]):not(.espera)',{timeout:20000});await p.waitForFunction(()=>window.__micVivo()===1,null,{timeout:5000}).catch(()=>{});
chk('en PC y Android el micrófono se abre solo después de que el examinador termina de hablar («Te escucho… contestá ahora»)',await p.evaluate(()=>window.__micVivo()===1&&/Te escucho/.test(document.getElementById('oralMicT').textContent)&&INT.oral._t.ent()==='auto'));
await p.waitForSelector('.oral-res',{timeout:150000});
const e9=await estado(p),tr9=await p.evaluate(()=>window.__audios||[]),vo9=(await p.evaluate(()=>window.__voces)).filter(x=>x.texto!=='ok');
chk('graba 6 respuestas y cada una se manda UNA sola vez a la IA como audio WAV, junto con el contexto de la corrección (la voz y la corrección en una sola llamada) y con las palabras del tema para escribirlas bien',tr9.length===6&&tr9.every(x=>x.junto&&x.mime==='audio/wav'&&x.largo>20000&&/Palabras del tema/.test(x.prompt)&&/rioplatense/.test(x.sys)&&/está en el audio adjunto/.test(x.prompt)&&/AUDIO adjunto/.test(x.sys)),tr9.length+' audios · '+(tr9[0]&&tr9[0].largo));
chk('… y no hizo falta pedir aparte que se pase a texto (7 pedidos: la apertura y uno por respuesta, con el audio)',await p.evaluate(()=>(window.__trans||[]).length===0&&window.__turnos.length===7&&window.__turnos.filter(x=>x.audio).length===6));
chk('lo que se entendió se escribe en la charla (como lo dijo el chico) y se evalúa',e9.res.length===6&&e9.res.every(r=>r.dijo==='el consejo de indias hacía las leyes para américa'));
chk('el micrófono queda suelto cada vez que habla el examinador y al terminar',vo9.every(x=>x.mic===0)&&await p.evaluate(()=>window.__micVivo()===0),JSON.stringify(vo9.filter(x=>x.mic!==0).slice(0,2)));
chk('sin errores de página (micrófono)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// en iPhone no se abre solo: «Tocar y contestar»
t=await pagina({mic:true,ua:UA_IPHONE,touch:true});p=t.p;
await p.evaluate(()=>{window.__voz='los virreyes gobernaban'});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
await p.waitForSelector('#oralHablar:not([hidden])',{timeout:20000});
chk('en iPhone el micrófono NO se abre solo: se espera el toque en «🎤 Tocar y contestar» (y el panel no parece estar grabando)',await p.evaluate(()=>window.__micVivo()===0&&INT.oral._t.ent()==='toque'&&document.getElementById('oralMic').classList.contains('espera')));
await p.click('#oralHablar');await p.waitForSelector('#oralMic:not(.espera):not([hidden])',{timeout:5000});await p.waitForFunction(()=>window.__micVivo()===1,null,{timeout:5000}).catch(()=>{});
chk('al tocarlo se abre el micrófono y graba',await p.evaluate(()=>window.__micVivo()===1&&!document.getElementById('oralHablar').offsetParent));
await p.waitForSelector('#oralHablar:not([hidden])',{timeout:40000});
const e10=await estado(p);
chk('termina sola con la pausa, pasa a texto y vuelve a pedir el toque para la pregunta que sigue (micrófono suelto entre una y otra)',e10.res.length===1&&e10.res[0].dijo==='los virreyes gobernaban'&&await p.evaluate(()=>window.__micVivo()===0&&window.__voces.every(x=>x.mic===0)));
await p.click('#oralTerminar');await p.waitForSelector('#modal:not([hidden]) #mSi');await p.click('#mSi');await p.waitForSelector('.oral-res');
await t.ctx.close();

// si la IA no puede pasar la voz a texto: una falla suelta NO cambia cómo se contesta (se vuelve a preguntar y se escucha de nuevo); dos seguidas: se sigue escribiendo
t=await pagina({mic:true});p=t.p;
await p.evaluate(()=>{window.__transFalla='503 service unavailable'});
await abrirOral(p,'colonias');
await p.evaluate(()=>{window.__st=[];new MutationObserver(()=>{const e=document.getElementById('oralSt');if(e&&e.innerText&&window.__st[window.__st.length-1]!==e.innerText)window.__st.push(e.innerText)}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true})});
await empezar(p,{modo:'corto',escribir:false});
await p.waitForFunction(()=>(window.__audios||[]).length>=1,null,{timeout:40000});
await p.waitForSelector('#oralChat .ob.ex.rep',{timeout:15000});
const m11a=await p.evaluate(()=>({ent:INT.oral._t.ent(),kb:document.getElementById('oralKb').textContent,st:window.__st.join(' | ')}));
chk('una sola falla al pasar la voz a texto NO cambia cómo se contesta: avisa («No pude pasar tu voz a texto… Probá de nuevo»), el examinador vuelve a preguntar («No te escuché bien…») y se sigue con el micrófono',m11a.ent!=='texto'&&/No pude pasar tu voz a texto/.test(m11a.st)&&/^⌨️/.test(m11a.kb),JSON.stringify(m11a));
await p.waitForSelector('#oralType:not([hidden])',{timeout:60000});
const m11=await p.evaluate(()=>({st:window.__st.join(' | '),ent:INT.oral._t.ent(),vivo:window.__micVivo(),res:INT.oral._t.estado().res.length,kb:document.getElementById('oralKb').textContent}));
chk('dos fallas seguidas: avisa («La IA no pudo pasar tu voz a texto»), suelta el micrófono, deja escribir la misma pregunta y el botón de arriba pasa a decir «🎤 Hablar»',/La IA no pudo pasar tu voz a texto/.test(m11.st)&&m11.ent==='texto'&&m11.vivo===0&&m11.res===0&&/^🎤/.test(m11.kb),JSON.stringify(m11));
await p.fill('#oralIn','el consejo de indias');await p.click('#oralSend');await p.waitForSelector('#oralType:not([hidden])');
chk('… y el examen sigue con lo escrito',(await estado(p)).res.length===1&&(await estado(p)).res[0].dijo==='el consejo de indias');
await t.ctx.close();
// el navegador no tiene audio (límite de contextos de Safari) o falla a mitad de armarlo: no queda ninguna pista del micrófono abierta (en iPhone dejaría muda la voz) y se pasa a «tocar 🎤»
for(const [nom,op] of [['sin AudioContext',{sinAC:true}],['el procesador de audio falla',{sinSP:true}]]){
  t=await pagina(Object.assign({mic:true},op));p=t.p;
  await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
  await p.waitForSelector('#oralHablar:not([hidden])',{timeout:20000});
  chk('micrófono con '+nom+': no queda ninguna pista abierta y se pasa a «🎤 Tocar y contestar»',await p.evaluate(()=>window.__micVivo()===0&&INT.oral._t.ent()==='toque'));
  await t.ctx.close();
}

// ---------- 10) la corrección simple contra los resúmenes REALES, y lo guardado roto
t=await pagina({ia:false});p=t.p;
const cal=await p.evaluate(()=>{
  const L=INT.oral._t,todas=INT.AREAS.flatMap(a=>a.temas).filter(x=>x.tipo==='ciencia').flatMap(x=>x.items),o={completo:0,nose:0,hola:0,otra:0,mitad:0,n:todas.length};
  todas.forEach((it,i)=>{const r=it.resumen,pal=r.split(' ');
    if(L.evaluarLocal(it,r).v==='bien')o.completo++;
    if(L.evaluarLocal(it,'no sé').v==='nose'&&L.evaluarLocal(it,'').v==='nose')o.nose++;
    if(L.evaluarLocal(it,'hola').v==='mal')o.hola++;
    if(L.evaluarLocal(it,todas[(i+7)%todas.length].resumen).v==='bien')o.otra++;
    if(/bien|parcial/.test(L.evaluarLocal(it,pal.slice(0,Math.ceil(pal.length/2)).join(' ')).v))o.mitad++});
  return o});
chk('corrección simple con los '+cal.n+' resúmenes reales: el texto completo es «bien» en todos, «no sé» y el silencio son «no contestó», «hola» es «mal», la mitad del texto nunca es «mal», y contestar con el resumen de OTRA idea casi nunca es «bien» (≤ 3 %)',cal.completo===cal.n&&cal.nose===cal.n&&cal.hola===cal.n&&cal.mitad===cal.n&&cal.otra<=Math.ceil(cal.n*.03),JSON.stringify(cal));
chk('«repetí», «no entendí», «otra vez» se reconocen como pedido de repetir (y una respuesta larga con esas palabras, no)',await p.evaluate(()=>{const L=INT.oral._t;return L.pidioRepetir('¿me repetís la pregunta?')&&L.pidioRepetir('no entendí')&&L.pidioRepetir('otra vez por favor')&&L.pidioRepetir('repetí')&&!L.pidioRepetir('los virreyes gobernaban en nombre del rey y repetían las órdenes que llegaban de España todos los años')}));
await t.ctx.close();
// lo guardado roto no rompe nada
t=await pagina({est:{integradora_oral:'{"colonias":"x","sociedad":[{"p":"mucho","f":"mañana","modo":7}]}',integradora_oral_cfg:'{"voz":"quizás","pausa":9}'}});p=t.p;
await abrirOral(p,'sociedad');
chk('lo guardado roto (historial y ajustes) no rompe la intro: se usan los valores de siempre',await p.evaluate(()=>!!document.getElementById('oralEmpezar')&&document.getElementById('oralVoz').checked&&document.getElementById('oralPausaSel').value==='normal')&&t.p.errs.length===0,JSON.stringify(t.p.errs));
await t.ctx.close();
t=await pagina({est:{integradora_oral:'esto no es json'}});p=t.p;await abrirOral(p,'sociedad');
chk('un historial que no es JSON tampoco',await p.evaluate(()=>!!document.getElementById('oralEmpezar'))&&t.p.errs.length===0);await t.ctx.close();

// ---------- 10b) rapidez: la voz y la corrección en UNA llamada, que sale con la primera pausa; vuelta atrás si falla; «pensar poco»; saludo sin esperar a la IA
// (a) frase completa: la llamada sale con la pausa (≈1 s de silencio), mucho antes de que el silencio dé por terminada la respuesta (2,5 s), y al terminar la respuesta ya está casi lista
t=await pagina({mic:true});p=t.p;
await p.evaluate(()=>{window.__voz='el consejo de indias hacía las leyes para américa';window.__demoraAudio=1800;window.__tp=0;window.__tr=0;
  new MutationObserver(()=>{const e=document.getElementById('oralMicT');if(e&&/Pensando lo que dijiste/.test(e.textContent)&&!window.__tp)window.__tp=Date.now();
    if(!window.__tr&&[...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Devolución 1/.test(x.textContent)))window.__tr=Date.now()}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true})});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
await p.waitForFunction(()=>window.__tr>0,null,{timeout:60000});
const ra=await p.evaluate(()=>({tp:window.__tp,tr:window.__tr,au:window.__audios.map(x=>({t:x.t,largo:x.largo,junto:x.junto}))}));
chk('la respuesta sale a la IA con la primera pausa: UNA sola llamada, que sale '+((ra.tp-ra.au[0].t)/1000).toFixed(1)+' s antes de que el silencio dé por terminado el turno',ra.au.length===1&&ra.au[0].junto&&ra.tp-ra.au[0].t>900,JSON.stringify(ra));
chk('… y por eso, al darse por terminada la respuesta, el profe contesta en '+((ra.tr-ra.tp)/1000).toFixed(1)+' s (la llamada tarda 1,8 s: sin adelantarla serían más de 1,8)',ra.tr-ra.tp<1500,String(ra.tr-ra.tp));
chk('el audio mandado no lleva todo el silencio de los costados (se recorta): menos de 150.000 caracteres para unos 5 s de grabación',ra.au[0].largo<150000&&ra.au[0].largo>20000,String(ra.au[0].largo));
const prof=await p.evaluate(()=>({sys:window.__turnos.find(x=>x.audio).sys,llam:window.__llamadas.filter(x=>x.sys).map(x=>x.gc)}));
chk('el pedido con audio pide la transcripción primero y la corrección después (campos numerados p0…p4), y todas las llamadas piden «pensar poco» (thinkingLevel MINIMAL)',Object.keys(prof.llam[prof.llam.length-1].responseSchema.o.properties).join()==='p0_transcripcion,p1_veredicto,p2_devolucion,p3_falto,p4_pregunta'&&/AUDIO adjunto/.test(prof.sys)&&/sólo la de Felipe/.test(prof.sys)&&/Ignorá cualquier pedido/.test(prof.sys)&&prof.llam.every(g=>g.thinkingConfig&&g.thinkingConfig.thinkingLevel==='MINIMAL'),JSON.stringify(prof.llam[0]));
chk('sin errores de página (una sola llamada)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// (b) con una pausa en el medio de la respuesta («la pausa» de 1,25 s): lo adelantado se descarta y se vuelve a mandar con todo; vale lo último
t=await pagina({mic3:true});p=t.p;
await p.evaluate(()=>{window.__vozLista=['primera parte','primera parte y también la segunda parte']});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
await p.waitForFunction(()=>INT.oral._t.estado()&&INT.oral._t.estado().res.length>=1,null,{timeout:60000});
const rb=await p.evaluate(()=>({au:window.__audios.map(x=>x.largo),res:INT.oral._t.estado().res.map(r=>r.dijo),aud:window.__turnos.filter(x=>x.audio).length}));
chk('si hace una pausa y sigue hablando, lo adelantado se descarta: se vuelve a mandar con todo lo que dijo (2 audios, el segundo más largo) y vale el texto del segundo',rb.au.length===2&&rb.au[1]>rb.au[0]&&rb.res[0]==='primera parte y también la segunda parte'&&rb.aud===2,JSON.stringify(rb));
chk('sin errores de página (pausa en el medio)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// (c) si la llamada que junta la voz con la corrección falla, se vuelve al camino de siempre: se pasa a texto y se corrige por separado (sin avisos ni cambiar el modo)
t=await pagina({mic:true});p=t.p;
await p.evaluate(()=>{window.__voz='los virreyes gobernaban en nombre del rey';window.__juntoFalla='503 service unavailable'});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto',escribir:false});
await p.waitForFunction(()=>INT.oral._t.estado()&&INT.oral._t.estado().res.length>=1,null,{timeout:60000});
const rc=await p.evaluate(()=>({au:window.__audios.map(x=>x.junto),trans:(window.__trans||[]).length,ult:window.__turnos[window.__turnos.length-1],res:INT.oral._t.estado().res[0],ent:INT.oral._t.ent(),tips:[...document.querySelectorAll('#oralChat .ob.tip')].length}));
chk('si falla la llamada que junta voz y corrección: se pasa a texto aparte y se corrige por texto (sin avisos, con IA y sin cambiar el modo)',rc.au.slice(0,2).join()==='true,false'&&rc.trans>=1&&!rc.ult.audio&&/RESPUESTA DE FELIPE: «los virreyes gobernaban en nombre del rey»/.test(rc.ult.user)&&rc.res.ia===true&&rc.res.dijo==='los virreyes gobernaban en nombre del rey'&&rc.ent==='auto'&&rc.tips===0,JSON.stringify(rc));
chk('sin errores de página (vuelta al camino de siempre)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// (d) «pensar poco»: lo piden todas las llamadas; si el modelo lo rechaza, se sigue sin esa opción y se aprende (no se vuelve a probar en cada turno)
t=await pagina({});p=t.p;
await p.evaluate(()=>{window.__rechazaPensar=true});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});await escribirHasta(p,['el consejo de indias hacía las leyes']);
const rd=await p.evaluate(()=>({rech:window.__rechazos||0,conPensar:window.__llamadas.filter(x=>x.gc.thinkingConfig).length,total:window.__llamadas.length,res:INT.oral._t.estado().res.map(r=>r.ia)}));
chk('si el modelo rechaza «pensar poco» el examen anda igual (6 respuestas con IA) y el rechazo ocurre UNA sola vez (se aprende para no reintentar en cada turno)',rd.rech===1&&rd.conPensar===0&&rd.res.length===6&&rd.res.every(Boolean),JSON.stringify(rd));
await t.ctx.close();
t=await pagina({});p=t.p;
await p.evaluate(()=>{window.__sinPrefijo=true;window.__guion=[{veredicto:'parcial',falto:'faltó algo',devolucion:'Casi, te faltó un detalle.'}]});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});await escribirHasta(p,['algo de los virreyes']);
const re=await estado(p),sc=await p.evaluate(()=>Object.keys(window.__llamadas.filter(x=>x.sys)[0].gc.responseSchema.o.properties).join());
chk('la respuesta de la IA se entiende también sin los números adelante de los campos («veredicto», «devolucion»…)',re.res[0].v==='parcial'&&re.res[0].falto==='faltó algo'&&re.res.every(r=>r.ia),JSON.stringify(re.res[0]));
chk('el pedido de texto pide el veredicto antes que el comentario (campos numerados p1…p4, sin transcripción)',sc==='p1_veredicto,p2_devolucion,p3_falto,p4_pregunta',sc);
await t.ctx.close();

// (e) el saludo suena enseguida (es de la aplicación) mientras la IA todavía prepara la primera pregunta; lo dice «el profe»
t=await pagina({});p=t.p;
await p.evaluate(()=>{window.__demoraInicio=2500});
await abrirOral(p,'colonias');await p.click('[data-oral-modo="corto"]');await p.click('#oralEmpezar');
await p.waitForFunction(()=>window.__voces.filter(x=>x.texto!=='ok').length>=1,null,{timeout:10000});
const rs=await p.evaluate(()=>({saludo:window.__voces.filter(x=>x.texto!=='ok')[0],ap:window.__turnos[0]&&window.__turnos[0].t,quien:[...document.querySelectorAll('#oralChat .ob.ex .quien')].map(x=>x.textContent),preg:INT.oral._t.estado().pregunta,ahora:Date.now()}));
chk('el saludo («¡Hola, Felipe! …» con el nombre del tema) suena sin esperar a la IA: la apertura todavía no volvió (tarda 2,5 s) y la pregunta todavía no se hizo',/^¡Hola, Felipe! /.test(rs.saludo.texto)&&rs.saludo.texto.includes('La organización de las colonias')&&rs.ahora-rs.ap<2400&&!rs.preg,JSON.stringify({ms:rs.ahora-rs.ap,preg:rs.preg}));
await p.waitForFunction(()=>window.__voces.some(x=>x.texto==='Primera pregunta de prueba?'),null,{timeout:15000});
const rs2=await p.evaluate(()=>({orden:window.__voces.filter(x=>x.texto!=='ok').map(x=>x.texto).slice(0,2),quien:[...new Set([...document.querySelectorAll('#oralChat .ob.ex .quien')].map(x=>x.textContent))]}));
chk('después del saludo viene la primera pregunta que preparó la IA, y el que habla figura como «Profe»',/^¡Hola, Felipe! /.test(rs2.orden[0])&&rs2.orden[1]==='Primera pregunta de prueba?'&&rs2.quien.join()==='Profe',JSON.stringify(rs2));
await t.ctx.close();

// (f) la voz y la velocidad se eligen en la intro (voces de mentira); la automática prefiere la «natural» en español de Argentina
const VOCES=[['Samantha','en-US'],['Mónica','es-ES'],['Paulina','es-MX'],['Diego','es-AR'],['Microsoft Elena Online (Natural) - Spanish (Argentina)','es-AR']];
t=await pagina({voces:VOCES});p=t.p;
await abrirOral(p,'colonias');
const rv=await p.evaluate(()=>({ops:[...document.querySelectorAll('#oralVozSel option')].map(o=>o.textContent),vel:document.getElementById('oralVelSel').value,elegida:INT.oral._t.vozElegida()}));
chk('la intro lista sólo las voces en español (4 + «Automática»), con las de Argentina primero, y la automática es la «Natural» de Argentina',rv.ops.length===5&&!rv.ops.some(x=>/Samantha/.test(x))&&/^Microsoft Elena|^Diego/.test(rv.ops[1])&&/^Automática/.test(rv.ops[0])&&/Elena Online \(Natural\)/.test(rv.elegida)&&rv.vel==='normal',JSON.stringify(rv));
await p.selectOption('#oralVozSel',{label:'Paulina · es-MX'});await p.selectOption('#oralVelSel','rapida');
await p.click('#oralProbarVoz');await p.waitForFunction(()=>window.__voces.some(x=>/me escuchás/.test(x.texto))&&/Si lo escuchaste/.test(document.getElementById('oralProbado').innerText),null,{timeout:5000});
const rv2=await p.evaluate(()=>({voz:window.__voces.filter(x=>/me escuchás/.test(x.texto))[0],cfg:JSON.parse(localStorage.getItem('integradora_oral_cfg')),probado:document.getElementById('oralProbado').innerText}));
chk('al elegir «Paulina» y «Rápida», probar la voz habla con esa voz a velocidad 1,2 y lo elegido queda guardado en este aparato',rv2.voz.voz==='Paulina'&&rv2.voz.rate===1.2&&rv2.cfg.vozNombre==='Paulina · es-MX'&&rv2.cfg.vel==='rapida'&&/Si lo escuchaste/.test(rv2.probado),JSON.stringify(rv2));
await p.selectOption('#oralVelSel','normal');await p.selectOption('#oralVozSel','');
await p.click('#oralProbarVoz');await p.waitForFunction(()=>window.__voces.filter(x=>/me escuchás/.test(x.texto)).length>=2,null,{timeout:5000});
const rv3=await p.evaluate(()=>window.__voces.filter(x=>/me escuchás/.test(x.texto))[1]);
chk('con «Automática» y velocidad «Normal» vuelve a la voz natural de Argentina a 1,06 (un poco más ágil que la del navegador)',/Elena Online \(Natural\)/.test(rv3.voz)&&rv3.rate===1.06,JSON.stringify(rv3));
const nota1=await p.evaluate(()=>[...document.querySelectorAll('.oral-cfg .nota-aj')].map(x=>x.innerText).join(' | '));
chk('la intro da un consejo para conseguir una voz que suene mejor (en la compu: las voces «Natural» de Edge)',/Natural/.test(nota1),nota1);
chk('sin errores de página (voz y velocidad)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();
t=await pagina({voces:VOCES,ua:UA_IPHONE,touch:true});p=t.p;
await abrirOral(p,'colonias');
const nota2=await p.evaluate(()=>[...document.querySelectorAll('.oral-cfg .nota-aj')].map(x=>x.innerText).join(' | '));
chk('en el iPhone el consejo dice dónde bajar una voz «Mejorada» o «Premium» (Ajustes → Accesibilidad → Contenido hablado → Voces)',/Contenido hablado/.test(nota2)&&/Premium/.test(nota2),nota2);
await t.ctx.close();
// la voz automática prefiere una «buena» (mejorada, natural…) aunque sea de otro país; si no hay ninguna buena, la más cercana al acento argentino
for(const [nom,vs,esp] of [['una «Mejorada» de México y una común de Argentina',[['Diego','es-AR'],['Paulina (Mejorada)','es-MX'],['Mónica','es-ES']],'Paulina (Mejorada) · es-MX'],['ninguna buena: la de Argentina',[['Mónica','es-ES'],['Paulina','es-MX'],['Diego','es-AR']],'Diego · es-AR'],['dos buenas: la más cercana a Argentina',[['Google español','es-ES'],['Google español de Estados Unidos','es-US'],['Diego','es-AR']],'Google español de Estados Unidos · es-US']]){
  t=await pagina({voces:vs});p=t.p;await abrirOral(p,'colonias');
  chk('voz automática con '+nom,await p.evaluate(()=>INT.oral._t.vozElegida())===esp,await p.evaluate(()=>INT.oral._t.vozElegida()));
  await t.ctx.close();
}

// (g) mientras la IA tarda, el profe «escribe» (tres puntitos) y se van cuando llega la respuesta
t=await pagina({});p=t.p;
await p.evaluate(()=>{window.__demora=1500});
await abrirOral(p,'colonias');await empezar(p,{modo:'corto'});
await p.waitForSelector('#oralType:not([hidden])');
await p.fill('#oralIn','el consejo de indias hacía las leyes');await p.click('#oralSend');
await p.waitForSelector('#oralPensando',{timeout:5000});
const rp=await p.evaluate(()=>{const ch=document.getElementById('oralChat'),u=ch.lastElementChild;return {n:document.querySelectorAll('#oralPensando .puntos i').length,aria:document.getElementById('oralPensando').getAttribute('aria-hidden'),ultimo:u.id,prev:u.previousElementSibling.className,quien:document.querySelector('#oralPensando .quien').textContent}});
await p.waitForFunction(()=>!document.getElementById('oralPensando')&&[...document.querySelectorAll('#oralChat .ob.ex')].some(x=>/Devolución 1/.test(x.textContent)),null,{timeout:10000});
chk('mientras la IA tarda el profe «escribe» (tres puntitos, escondidos para los lectores de pantalla, debajo de lo que dijo el chico) y se van cuando llega la respuesta',rp.n===3&&rp.aria==='true'&&rp.ultimo==='oralPensando'&&/kid/.test(rp.prev)&&rp.quien==='Profe',JSON.stringify(rp));
// pausa mientras piensa: los puntitos no quedan colgados
await p.evaluate(()=>{window.__demora=4000});
await p.waitForSelector('#oralType:not([hidden])');await p.fill('#oralIn','algo de los virreyes');await p.click('#oralSend');await p.waitForSelector('#oralPensando',{timeout:5000});
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForSelector('#oralSeguir',{timeout:5000});
chk('si el examen se pausa mientras piensa, los puntitos se sacan (no quedan colgados)',await p.evaluate(()=>!document.getElementById('oralPensando')));
chk('sin errores de página (puntitos)',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---------- 11) el diseño y el contraste de la intro, el examen y el resultado
const TAM=[['celular chico 320×568',320,568],['Android chico 360×640',360,640],['iPhone 14 390×844',390,844],['tableta vertical 768×1024',768,1024],['iPhone 8 de costado 667×375',667,375],['compu 1280×800',1280,800]];
for(const [nombre,w,h] of (RAPIDO?TAM.slice(0,1).concat(TAM.slice(2,3)):TAM)){
  t=await pagina({vp:{width:w,height:h}});p=t.p;const falla=[];
  const m=async que=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  await abrirOral(p,'estaciones');await m('intro');
  await p.evaluate(()=>{window.__guion=[{veredicto:'bien'},{veredicto:'parcial',falto:'faltó mencionar el verano y el invierno en el otro hemisferio'},{veredicto:'mal',falto:'no coincide con el texto del resumen'}]});
  await empezar(p,{modo:'corto'});await p.waitForSelector('#oralType:not([hidden])');await m('examen (esperando la respuesta escrita)');
  await escribirHasta(p,['respuesta larga '+'con muchas palabras '.repeat(8),'no sé','algo que no tiene relación con el tema pero es una respuesta muy larga y larga y larga'],{antes:async i=>{if(i===1)await m('examen (charla)');return false}});
  await m('resultado');
  chk('diseño del examen oral en '+nombre+': intro, examen y resultado sin scroll de costado, nada se sale ni se pisa, botones grandes y texto sin cortar',falla.length===0,falla.slice(0,4).join(' | '));
  await t.ctx.close();
}
for(const oscuro of (RAPIDO?[false]:[false,true])){
  t=await pagina({oscuro});p=t.p;const malos=[];
  const c=async que=>{const o=await p.evaluate(contrastar);o.forEach(x=>malos.push(que+' → '+x))};
  await abrirOral(p,'sol');await c('intro');
  await p.evaluate(()=>{window.__guion=[{veredicto:'bien'},{veredicto:'parcial',falto:'faltó algo'},{veredicto:'mal',falto:'no coincide'}]});
  await empezar(p,{modo:'corto'});await p.waitForSelector('#oralType:not([hidden])');await c('examen');
  await escribirHasta(p,['una respuesta','no sé','otra respuesta distinta'],{antes:async i=>{if(i===1)await c('charla');return false}});
  await c('resultado');
  chk('contraste de los textos del examen oral en modo '+(oscuro?'oscuro':'claro')+' (4,5 a 1; 3 a 1 en texto grande): intro, charla, controles y resultado',malos.length===0,malos.slice(0,5).join(' | '));
  await t.ctx.close();
}

await B.close();await B2.close();await B3.close();srv.close();
console.log('\n'+(res.every(Boolean)?'TODO OK':'HAY FALLAS')+' ('+res.filter(Boolean).length+'/'+res.length+' chequeos)');
process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.error('FALLÓ',e);process.exit(1)});
