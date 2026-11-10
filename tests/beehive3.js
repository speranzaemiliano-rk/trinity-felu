// «Beehive 3 · Prueba de inglés» (carpeta beehive3/): estudiar, practicar y hacer un simulacro de la evaluación de 4.º grado (Units 7 y 8).
// Cubre: que cada frase tenga su mp3 (y no sobre ninguno) y que sean audio de verdad; que el CONTENIDO esté bien (cada pasado regular o irregular, cada
// oración con su negativo, was/were, had to, las oraciones con hueco que sólo encajan con UNA palabra) contrastado con una tabla aparte; que todas las
// preguntas que arma el programa (todos los temas × todos los tipos) tengan UNA sola respuesta correcta, opciones distintas y su audio; el recorrido
// (inicio, cada tema, práctica, repetir lo que falló, simulacro, resultado por parte, repasar errores); que lo que se escribe valga con mayúsculas, puntos,
// «did not» y «didnt»; que equivocarse sume y acertar suba de caja; que lo guardado roto no rompa nada y que ande con el almacenamiento bloqueado;
// los ajustes (sonido, traducciones, verbos «por si acaso», borrar con cartel); la voz del aparato si un mp3 no baja; la cuenta regresiva; que no se pida nada
// a otros sitios (sólo las fuentes de Google); y el DISEÑO: nada se sale de la pantalla ni se pisa ni se corta, en 12 tamaños (de celular chico a compu, de pie y
// de costado), con todos los tipos de pregunta en su peor caso y también ya corregidas, y con contraste suficiente en claro y en oscuro.
// Se puede probar el sitio publicado:  URL=https://speranzaemiliano-rk.github.io/trinity-felu/beehive3/ node tests/beehive3.js
// Con  RAPIDO=1  el diseño se mira sólo en un tamaño (iPhone 14) y el contraste sólo en claro: unos 90 segundos en lugar de unos 4 minutos.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const vm=require('vm');const cp=require('child_process');
const RAIZ=path.resolve(__dirname,'..');
const RAPIDO=!!process.env.RAPIDO;
let URL=process.env.URL||null;   // sin URL: se levanta un servidor local con la carpeta del proyecto (un origen http de verdad)
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
const servir=()=>new Promise(ok=>{const sv=http.createServer((rq,rs)=>{
  let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);
  if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);return rs.end('no')}
  rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});rs.end(fs.readFileSync(f))});
  sv.listen(0,'127.0.0.1',()=>ok(sv))});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);

// ---------- 1) los archivos: cada frase tiene su mp3, no sobra ninguno y son audio de verdad
const sb={window:{}};vm.createContext(sb);vm.runInContext(fs.readFileSync(path.join(RAIZ,'beehive3','contenido.js'),'utf8'),sb);
const B3=sb.window.B3;
const frases=B3.frases();
const dirAudio=path.join(RAIZ,'beehive3','audio');
const mp3s=fs.readdirSync(dirAudio).filter(f=>/\.mp3$/.test(f)).map(f=>f.replace(/\.mp3$/,''));
const manifestTxt=fs.readFileSync(path.join(dirAudio,'manifest.js'),'utf8');
const manifest=JSON.parse(manifestTxt.match(/B3_AUDIO=(\[[\s\S]*?\]);/)[1]);
chk('cada frase que la página puede decir ('+frases.length+') tiene su mp3 y no sobra ninguno',frases.length===mp3s.length&&frases.every(x=>mp3s.includes(x.k))&&mp3s.every(k=>frases.some(x=>x.k===k)),j([frases.filter(x=>!mp3s.includes(x.k)).slice(0,5),mp3s.filter(k=>!frases.some(x=>x.k===k)).slice(0,5)]));
chk('la lista de audios (audio/manifest.js) y los mp3 de la carpeta son exactamente los mismos',manifest.length===mp3s.length&&manifest.every(k=>mp3s.includes(k))&&mp3s.every(k=>manifest.includes(k)));
const raros=mp3s.filter(k=>{const b=fs.readFileSync(path.join(dirAudio,k+'.mp3'));return b.length<1200||!(b.slice(0,3).toString('latin1')==='ID3'||(b[0]===0xff&&(b[1]&0xe0)===0xe0))});
chk('todos los mp3 son audio de verdad (no una página de error guardada con extensión .mp3)',raros.length===0,j(raros.slice(0,5)));
const peso=mp3s.reduce((s,k)=>s+fs.statSync(path.join(dirAudio,k+'.mp3')).size,0);
chk('los audios pesan poco ('+(peso/1e6).toFixed(1)+' MB en total): se bajan de a uno, sólo los que se usan',peso<9e6);
const verManifiesto=(manifestTxt.match(/B3_AUDIO_V="([0-9a-f]{8})"/)||[])[1];
const resumenAudio=require('crypto').createHash('md5');manifest.slice().sort().forEach(k=>{resumenAudio.update(k);resumenAudio.update(fs.readFileSync(path.join(dirAudio,k+'.mp3')))});
chk('el manifiesto trae la versión de los audios (B3_AUDIO_V) y coincide con los mp3 que hay (si no, hay que volver a correr «node tools/audio/beehive3.js»: el navegador seguiría usando audios viejos guardados)',verManifiesto===resumenAudio.digest('hex').slice(0,8),String(verManifiesto));
const sinMarca=mp3s.filter(k=>!fs.readFileSync(path.join(dirAudio,k+'.mp3')).slice(0,600).includes('sala5-audio-v2'));
chk('todos los mp3 pasaron por el proceso de volumen (marca «sala5-audio-v2»: más fuertes y sin silencios al principio y al final; ver tools/audio/procesar_sala5.py)',sinMarca.length===0,j(sinMarca.slice(0,5)));
if(cp.spawnSync('ffmpeg',['-version']).status===0){
  const muestra=mp3s.filter((k,i)=>i%9===0);const flojos=[],picos=[],cortos=[];
  for(const k of muestra){
    const r=cp.spawnSync('ffmpeg',['-hide_banner','-nostats','-i',path.join(dirAudio,k+'.mp3'),'-af','volumedetect','-f','null','-'],{encoding:'utf8'}).stderr||'';
    const media=+(r.match(/mean_volume: (-?[\d.]+)/)||[])[1],pico=+(r.match(/max_volume: (-?[\d.]+)/)||[])[1],d=r.match(/Duration: (\d+):(\d+):([\d.]+)/),dur=d?(+d[1])*3600+(+d[2])*60+(+d[3]):0;
    if(!(media>-17.5))flojos.push(k+' '+media);if(!(pico<=-0.9))picos.push(k+' '+pico);if(!(dur>=0.3&&dur<=9))cortos.push(k+' '+dur);
  }
  chk('volumen de las voces (medido en '+muestra.length+' mp3): ninguna queda bajita (mejor que -17,5 dB) ni satura (pico a -0,9 dB o menos), y ninguna quedó vacía ni eterna',flojos.length===0&&picos.length===0&&cortos.length===0,j([flojos.slice(0,3),picos.slice(0,3),cortos.slice(0,3)]));
}else console.log('(omitida: la medición del volumen necesita ffmpeg)');
chk('todas las frases con voz son inglés simple y sin símbolos raros (se lo lee un motor de voz)',frases.every(x=>/^[A-Za-z][A-Za-z' ,.!?-]*$/.test(x.tts)&&x.tts.length<=90),j(frases.filter(x=>!/^[A-Za-z][A-Za-z' ,.!?-]*$/.test(x.tts)||x.tts.length>90).slice(0,4)));
const html=fs.readFileSync(path.join(RAIZ,'beehive3','index.html'),'utf8');
chk('la página está en español, con viewport para celular, título, manifiesto e ícono, y se puede hacer zoom (sin «user-scalable=no»)',/<html lang="es">/.test(html)&&/name="viewport"/.test(html)&&!/user-scalable\s*=\s*no/.test(html)&&/<title>Beehive 3 · Prueba de inglés/.test(html)&&/rel="manifest"/.test(html)&&/rel="apple-touch-icon"/.test(html)&&/trinity_ultimo","6"/.test(html));
const fuente=['app.js','contenido.js'].map(f=>fs.readFileSync(path.join(RAIZ,'beehive3',f),'utf8').replace(/^\s*\/\/.*$/gm,'').replace(/\s\/\/ .*$/gm,'')).concat([html]).join('\n');
chk('no usa nada que mande datos afuera: ni fetch, ni XMLHttpRequest, ni eval, ni confirm/alert/prompt del navegador',!/\bfetch\s*\(|XMLHttpRequest|\beval\s*\(|new Function|\bconfirm\s*\(|\balert\s*\(|\bprompt\s*\(|sendBeacon|WebSocket/.test(fuente));

// ---------- 2) el contenido, contrastado con tablas aparte (si alguien cambia un verbo mal, esto lo agarra)
const REG_ORO={load:'loaded',wash:'washed',hoover:'hoovered',water:'watered',cook:'cooked',clear:'cleared',clean:'cleaned',help:'helped',want:'wanted',visit:'visited',play:'played',decorate:'decorated',invite:'invited',prepare:'prepared',live:'lived',use:'used',tidy:'tidied',watch:'watched',listen:'listened',paint:'painted',design:'designed',bake:'baked',dance:'danced',study:'studied',carry:'carried',stop:'stopped',plan:'planned'};
// los verbos que aparecen en las páginas 86, 87, 93, 95, 98 y 99 del libro (se miraron una por una): ninguno puede faltar ni quedar como «por si acaso»
const REG_LIBRO=['clean','wash','cook','watch','play','listen','load','water','clear','hoover','paint','design','tidy','decorate','prepare','invite','help','dance','bake','want'];
const IRR_LIBRO=['go','have','make','eat','drink','see','write','fly','build','buy','wear'];
const IRR_ORO={eat:'ate',go:'went',make:'made',fly:'flew',wear:'wore',have:'had',build:'built',see:'saw',take:'took',buy:'bought',come:'came',give:'gave',get:'got',write:'wrote',run:'ran',swim:'swam',drink:'drank',sleep:'slept',find:'found',sing:'sang'};
const BE_ORO={be1:'were',be2:'was',be3:"weren't",be4:'was',be5:"wasn't",be6:'were',be7:"wasn't",be8:"weren't"};
const palabra=(s,w)=>new RegExp("(^|[^A-Za-z'])"+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+"($|[^A-Za-z'])","i").test(s);
chk('los verbos que aparecen en las páginas del libro están TODOS y ninguno quedó como «por si acaso» (regulares: '+REG_LIBRO.length+', irregulares: '+IRR_LIBRO.length+')',REG_LIBRO.every(b=>B3.REG.some(v=>v.base===b&&!v.extra))&&IRR_LIBRO.every(b=>B3.IRR.some(v=>v.base===b&&!v.extra))&&B3.IRR.filter(v=>!v.extra).length===IRR_LIBRO.length&&B3.REG.filter(v=>v.extra).map(v=>v.base).join()==='study,carry,stop,plan'&&B3.IRR.filter(v=>v.extra).length===9,j([REG_LIBRO.filter(b=>!B3.REG.some(v=>v.base===b&&!v.extra)),IRR_LIBRO.filter(b=>!B3.IRR.some(v=>v.base===b&&!v.extra))]));
chk('los verbos regulares son exactamente los del libro más los «por si acaso» y cada pasado es el correcto ('+B3.REG.length+')',B3.REG.length===Object.keys(REG_ORO).length&&B3.REG.every(v=>REG_ORO[v.base]===v.past),j(B3.REG.filter(v=>REG_ORO[v.base]!==v.past).map(v=>v.base+'→'+v.past)));
chk('los verbos irregulares tienen el pasado correcto ('+B3.IRR.length+') y sus «errores típicos» (eated, goed, buy…) no incluyen el pasado bueno',B3.IRR.length===Object.keys(IRR_ORO).length&&B3.IRR.every(v=>IRR_ORO[v.base]===v.past&&v.mal.length>=2&&!v.mal.includes(v.past)),j(B3.IRR.filter(v=>IRR_ORO[v.base]!==v.past||v.mal.includes(v.past)).map(v=>v.base)));
const reglaOk=v=>v.regla==='ed'?v.past===v.base+'ed':v.regla==='d'?/e$/.test(v.base)&&v.past===v.base+'d':v.regla==='ied'?/[^aeiou]y$/.test(v.base)&&v.past===v.base.slice(0,-1)+'ied':v.regla==='doble'?v.past===v.base+v.base.slice(-1)+'ed':false;
chk('cada irregular trae la frase para «escribí una oración» (cue = verbo + lo que sigue, cueRest = lo que va después del pasado)',B3.IRR.every(v=>v.cue===v.base+' '+v.cueRest),j(B3.IRR.filter(v=>v.cue!==v.base+' '+v.cueRest).map(v=>v.base)));
chk('cada verbo regular declara la regla con la que se escribe (+ed, +d, y→ied, letra doble) y es la que corresponde',B3.REG.every(reglaOk),j(B3.REG.filter(v=>!reglaOk(v)).map(v=>v.base)));
chk('en cada oración afirmativa está el pasado y no hay «didn\'t»; en cada negativa está «didn\'t + verbo» y no el pasado (regulares e irregulares)',
  B3.REG.concat(B3.IRR).every(v=>palabra(v.aff,v.past)&&!/n't\b/.test(v.aff)&&v.neg.includes("didn't "+v.base+' ')||v.neg.includes("didn't "+v.base+'.')&&!palabra(v.neg,v.past)),j(B3.REG.concat(B3.IRR).filter(v=>!(palabra(v.aff,v.past)&&!/n't\b/.test(v.aff)&&(v.neg.includes("didn't "+v.base+' ')||v.neg.includes("didn't "+v.base+'.'))&&!palabra(v.neg,v.past))).map(v=>v.base)));
chk('todas las oraciones empiezan con mayúscula y terminan en punto, y traen su traducción al castellano',B3.REG.concat(B3.IRR,B3.HADTO).every(v=>[v.aff,v.neg].every(s=>/^[A-Z].*\.$/.test(s))&&[v.affEs,v.negEs].every(s=>/^[A-ZÁÉÍÓÚÑ¡¿].*\.$/.test(s))));
chk('«had to»: cada afirmativa dice «had to» (sin «didn\'t») y cada negativa «didn\'t have to» ('+B3.HADTO.length+' pares)',B3.HADTO.every(h=>palabra(h.aff,'had to')&&!/n't/.test(h.aff)&&h.neg.includes("didn't have to ")&&!palabra(h.neg,'had to')),j(B3.HADTO.filter(h=>!(palabra(h.aff,'had to')&&h.neg.includes("didn't have to "))).map(h=>h.id)));
chk('la lista de cosas por hacer de «had to»: cada renglón apunta a un ítem que existe, están los '+B3.HADTO.length+' ítems cubiertos y cada oración tiene su traducción y su audio',B3.LISTAS.flatMap(l=>l.items).every(e=>B3.HADTO.some(h=>h.id===e.id)&&e.oracion===e.who+' had to '+e.task+'.'&&B3.audio[e.k]===e.oracion&&/^[A-ZÁÉÍÓÚ].*\.$/.test(e.es))&&B3.HADTO.every(h=>B3.LISTAS.flatMap(l=>l.items).filter(e=>e.id===h.id).length===1),j(B3.HADTO.filter(h=>B3.LISTAS.flatMap(l=>l.items).filter(e=>e.id===h.id).length!==1).map(h=>h.id)));
const PAS_ORO=Object.assign({},REG_ORO,IRR_ORO);
chk('preguntas en pasado (p. 101): cada una es «Did + sujeto + verbo en forma base …?», el pasado de su oración afirmativa es el correcto, la respuesta corta usa el pronombre que corresponde y todo tiene audio ('+B3.DID.length+')',
  B3.DID.length===12&&B3.DID.every(d=>d.q==='Did '+d.sujeto+' '+d.base+' '+d.resto+'?'&&PAS_ORO[d.base]===d.past&&palabra(d.decl,d.past)&&d.decl.toLowerCase().startsWith(d.sujeto.toLowerCase())&&d.decl.endsWith(d.resto+'.')&&d.si==='Yes, '+d.pron+' did.'&&d.no==='No, '+d.pron+" didn't."&&/^(he|she|they|I)$/.test(d.pron)&&(['you','I'].includes(d.sujeto)?d.pron==='I':true)&&/^¿.*\?$/.test(d.es)&&[d.kQ,d.kSi,d.kNo,d.kDecl].every(k=>B3.audio[k])&&B3.audio[d.kQ]===d.q&&B3.audio[d.kSi]===d.si&&B3.audio[d.kNo]===d.no),j(B3.DID.filter(d=>!(d.q==='Did '+d.sujeto+' '+d.base+' '+d.resto+'?'&&PAS_ORO[d.base]===d.past&&palabra(d.decl,d.past))).map(d=>d.id)));
chk('las preguntas en pasado cubren verbos del libro (have, wear, make, buy, play) y de las dos clases (regulares e irregulares), con respuestas cortas de he, she, they e I',['have','wear','make','buy','play'].every(b=>B3.DID.some(d=>d.base===b))&&B3.DID.some(d=>REG_ORO[d.base])&&B3.DID.some(d=>IRR_ORO[d.base])&&['he','she','they','I'].every(x=>B3.DID.some(d=>d.pron===x)));
chk('was / were: cada oración tiene la respuesta correcta según el sujeto y es negativa sólo si lleva «n\'t» ('+B3.BE.length+')',B3.BE.length===Object.keys(BE_ORO).length&&B3.BE.every(b=>BE_ORO[b.id]===b.ok&&(b.neg===1)===/n't$/.test(b.ok)&&(b.s.match(/____/g)||[]).length===1),j(B3.BE.filter(b=>BE_ORO[b.id]!==b.ok).map(b=>b.id)));
const vocab=B3.VOCAB.flatMap(t=>t.items.map(it=>({t,it})));
chk('el vocabulario es el del libro, en su orden (pp. 84, 88, 96 y 100): Housework (8), Party preparations (6), Everyday things (8) y A Roman town (6)',B3.VOCAB.map(t=>t.items.map(i=>i.en).join('|')).join('/')==='hoover the floor|wash the dishes|load the dishwasher|water the plants|clean my room|clear the table|cook the dinner|wash the car/invite guests|prepare food|tidy up|decorate|dress up|set the table/helmet|cup|bowl|fan|lamp|phone|comb|coins/walls|gate|street|market square|theatre|town hall');
chk('el vocabulario cuenta con todas las palabras (8, 6, 8 y 6)',B3.VOCAB.map(t=>t.items.length).join()==='8,6,8,6'&&B3.VOCAB.map(t=>t.pag).join()==='84,88,96,100'&&['water the plants','wash the dishes','clear the table','hoover the floor','wash the car','clean my room','tidy up','dress up','set the table','prepare food','decorate','invite guests','bowl','phone','cup','coins','helmet','fan','lamp','comb','town hall','walls','gate','market square','theatre','street'].every(w=>vocab.some(x=>x.it.en===w)));
chk('los 8 temas, en el orden de las units, con su unit y sus páginas del libro (84, 86 y 87, 88, 89, 96, 98 a 101, 100, 101)',B3.TEMAS.map(t=>t.id+':'+t.unit+':'+t.pag).join('|')==='housework:7:84|regular:7:86 y 87|party:7:88|hadto:7:89|everyday:8:96|irregular:8:98, 99 y 101|roman:8:100|preguntas:8:101');
const ids=vocab.map(x=>x.it.id).concat(B3.REG.map(v=>v.id),B3.IRR.map(v=>v.id),B3.HADTO.map(h=>h.id));
chk('todos los ítems tienen un id propio',new Set(ids).size===ids.length&&ids.every(Boolean));
chk('cada oración con hueco tiene un solo «____», no dice la respuesta y no menciona a ninguna de las otras palabras del mismo tema (así encaja una sola)',
  vocab.every(({t,it})=>(it.ctx.match(/____/g)||[]).length===1&&!it.ctx.toLowerCase().includes(it.en.toLowerCase())&&t.items.every(o=>o===it||!it.ctx.toLowerCase().includes(o.en.toLowerCase()))&&it.lleno===it.ctx.replace('____',it.en)),j(vocab.filter(({t,it})=>!(t.items.every(o=>o===it||!it.ctx.toLowerCase().includes(o.en.toLowerCase()))&&!it.ctx.toLowerCase().includes(it.en.toLowerCase()))).map(x=>x.it.id)));
chk('dos palabras de un mismo tema nunca comparten dibujo (en las actividades de «mirá y elegí» se confundiría)',B3.VOCAB.every(t=>{const e=t.items.map(i=>i.emoji).filter(Boolean);return new Set(e).size===e.length}));
const emojis=[...new Set(vocab.map(x=>x.it.emoji).concat(B3.TEMAS.map(t=>t.ico)).filter(Boolean))];
chk('los dibujos son emojis viejos que todo aparato muestra (nada de Unicode 12 en adelante, que en un iPhone o un Android viejo salen como un cuadradito)',emojis.length>=20&&!emojis.some(e=>/[\u{1FA70}-\u{1FAFF}\u{1F6D6}-\u{1F6DF}\u{1F7F0}\u{1F972}\u{1F977}-\u{1F978}\u{1F90C}]/u.test(e)),j(emojis));
chk('cada tema trae su explicación en castellano y las reglas que se muestran al corregir',B3.TEMAS.every(t=>t.es&&t.nombre&&t.ico)&&['ed','d','ied','doble','didnt','irr','irrNeg','hadto','was'].every(k=>B3.REGLAS[k]&&B3.REGLAS[k].length>20));
const toda=JSON.stringify([B3.REG,B3.IRR,B3.HADTO,B3.BE,B3.VOCAB]);
chk('el contenido no tiene restos de edición («undefined», «null», «TODO», dobles espacios)',!/undefined|null|TODO|XXX|\s{2,}/.test(toda.replace(/\\u[0-9a-f]{4}/g,'')));

(async()=>{
let srv=null;if(!URL){srv=await servir();URL='http://127.0.0.1:'+srv.address().port+'/beehive3/'}
const ORIGEN_PROPIO=new globalThis.URL(URL).origin;
const b=await chromium.launch();

// ---------- ayudas
async function abrir(o){
  o=o||{};
  const ctx=await b.newContext({viewport:o.vp||{width:390,height:844},hasTouch:true,deviceScaleFactor:1,colorScheme:o.oscuro?'dark':'light',serviceWorkers:'block'});
  const pedidos=[];ctx.on('request',r=>pedidos.push({u:r.url(),m:r.method()}));
  const p=await ctx.newPage();p.errs=[];p.pedidos=pedidos;p.ctx=ctx;
  p.on('pageerror',e=>p.errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))p.errs.push('console: '+m.text())});
  p.on('dialog',d=>{p.errs.push('diálogo nativo: '+d.message());d.dismiss()});
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  if(o.storageRoto)await p.addInitScript(()=>{const t=()=>{throw new DOMException('bloqueado','SecurityError')};Storage.prototype.getItem=t;Storage.prototype.setItem=t;Storage.prototype.removeItem=t});
  await p.addInitScript(oo=>{
    window.__plays=[];window.__voz=[];
    HTMLMediaElement.prototype.pause=function(){this.__tok=null};
    HTMLMediaElement.prototype.play=function(){const s=this,src=String(s.src);window.__plays.push({src:src.replace(/^.*\/audio\//,'').replace(/\?.*$/,''),url:src});
      if(oo.audioRoto)return new Promise((ok,no)=>setTimeout(()=>{s.onerror&&s.onerror(new Event('error'));no(new DOMException('no hay fuente','NotSupportedError'))},10));
      const tok=s.__tok={};setTimeout(()=>{if(s.__tok===tok&&String(s.src)===src)s.onended&&s.onended()},10);return Promise.resolve()};
    speechSynthesis.speak=u=>{window.__voz.push({texto:u.text,lang:u.lang,rate:u.rate});setTimeout(()=>u.onend&&u.onend(),10)};
    speechSynthesis.cancel=()=>{};
    // la fecha de «hoy» queda fija (así la cuenta regresiva se puede probar)
    const F=new Date(oo.fecha).getTime(),D=Date;window.Date=class extends D{constructor(...a){if(a.length)super(...a);else super(F)}static now(){return F}};
    if(oo.estado&&!localStorage.getItem('__sembrado')){localStorage.setItem('__sembrado','1');localStorage.setItem('beehive3_estado',typeof oo.estado==='string'?oo.estado:JSON.stringify(oo.estado))}
  },{estado:o.estado,audioRoto:o.audioRoto,fecha:o.fecha||'2026-11-10T12:00:00'});
  await p.goto(URL);await p.waitForSelector('#pInicio .tema');
  return p;
}
const cerrar=async p=>{await p.ctx.close()};
const estado=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('beehive3_estado')||'null'));
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return !e.closest('[hidden]')&&r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'},sel);

// responde la pregunta que está en pantalla, bien o mal, tocando de verdad los botones
async function responder(p,bien){
  const q=await p.evaluate(()=>{const q=B3.actual();return {tipo:q.tipo,ops:q.opciones&&q.opciones.map(o=>!!o.ok),aceptar:q.aceptar,fichas:q.fichas,sol:q.sol,izq:q.izq&&q.izq.map(x=>x.id),der:q.der&&q.der.map(x=>x.id)}});
  if(q.tipo==='mc'){const i=bien?q.ops.indexOf(true):q.ops.indexOf(false);await p.click('#pPreg .opcion[data-i="'+i+'"]')}
  else if(q.tipo==='tipear'){await p.fill('#resp',bien?q.aceptar[0]:'zzz');await p.click('#bCheck')}
  else if(q.tipo==='ordenar'){const usadas=new Set(),orden=bien?q.sol:q.sol.slice().reverse();
    for(const w of orden){const i=q.fichas.findIndex((f,k)=>f===w&&!usadas.has(k));usadas.add(i);await p.click('#fichas .ficha[data-f="'+i+'"]')}
    await p.click('#bCheck')}
  else if(q.tipo==='unir'){
    const par=async(i,jx)=>{await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+jx+'"]')};
    if(!bien){const jx=q.der.findIndex(id=>id!==q.izq[0]);await par(0,jx);await par(0,jx)}   // dos confusiones: el programa lo cuenta como mal
    for(let i=0;i<q.izq.length;i++)await par(i,q.der.indexOf(q.izq[i]));
  }
  return q.tipo;
}
// juega una ronda entera: «politica(i)» dice si esa pregunta se contesta bien o mal; devuelve cuántas se contestaron y de qué tipo
async function jugar(p,politica,test){
  const tipos=[];
  for(let i=0;i<120;i++){
    if(await visible(p,'#pFin'))break;
    const idx=await p.evaluate(()=>B3.ronda().i);
    tipos.push(await responder(p,politica(idx)));
    if(test)await p.waitForFunction(k=>{const R=B3.ronda();return R.i>k},idx,{timeout:4000});
    else{await p.waitForSelector('#bSig',{timeout:4000});await p.click('#bSig')}
  }
  await p.waitForSelector('#pFin:not([hidden])');
  return tipos;
}
const textoFin=p=>p.evaluate(()=>document.getElementById('pFin').innerText.replace(/\s+/g,' '));

// ---------- 3) todas las preguntas que arma el programa: una sola respuesta correcta y bien armadas
{
const p=await abrir();
const probar=async es=>p.evaluate(es=>{
  const out=[],B=window.B3,ST=B.estado();ST.es=es;
  const ITEMS={};B.TEMAS.forEach(t=>t.items.forEach(i=>{ITEMS[i.id]={t,i}}));
  const strip=h=>String(h||'').replace(/<\/?(span|b|i)(\s[^>]*)?>/g,'').replace(/<[^>]*>/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
  const N=B.NORM,audio=new Set(window.B3_AUDIO);
  const TIPOS={vocab:['emoji2en','audio2en','en2es','es2en','cloze','spell','write','unir'],regular:['choosePast','forma','typePast','typeForma','chooseNeg','typeNeg','ordenarAff','ordenarNeg','spot','listen','tabla'],hadto:['choose','typeFill','ordenarAff','ordenarNeg','es2en','spot','lista'],irregular:['choosePast','baseToPast','pastToBase','typePast','typeForma','chooseNeg','typeNeg','ordenarAff','ordenarNeg','spot','listen','escribir','unir'],preguntas:['qDid','qSpot','qResp','qOrdenar','qTipear','qEscribirQ']};
  const pr=(ctx,m)=>{if(out.length<40)out.push(ctx+': '+m)};
  B.TEMAS.forEach(t=>{const usados=B.tipos(t.id).flat(),permitidos=TIPOS[t.tipo];usados.forEach(x=>{if(!permitidos.includes(x))pr(t.id,'tipo no previsto en la prueba: '+x)})});
  const val=(q,ctx,v)=>{
    if(!q||typeof q!=='object')return pr(ctx,'no hay pregunta');
    if(!['mc','tipear','ordenar','unir'].includes(q.tipo))pr(ctx,'tipo raro '+q.tipo);
    if(!/^[A-Z].*[.?]$/.test(q.consigna||''))pr(ctx,'consigna rara «'+q.consigna+'»');
    if(!q.ayuda||!/[a-záéíóúñ]/.test(q.ayuda))pr(ctx,'sin ayuda en castellano');
    if(!q.mostrar)pr(ctx,'sin «mostrar»');if(!q.explic)pr(ctx,'sin explicación');
    if(!Array.isArray(q.ids)||!q.ids.length||q.ids.some(id=>!ITEMS[id]))pr(ctx,'ids raros '+JSON.stringify(q.ids));
    const todo=strip((q.cuerpo||'')+' '+(q.opciones||[]).map(o=>o.t).join(' ')+' '+(q.fichas||[]).join(' ')+' '+q.mostrar+' '+q.explic);
    if(/undefined|NaN|\[object|\bnull\b/.test(todo))pr(ctx,'texto con restos: '+todo.slice(0,80));
    [q.hablar,q.audio].concat((q.izq||[]).map(x=>x.k),(q.der||[]).map(x=>x.k)).forEach(k=>{if(k&&(!B.audio[k]||!audio.has(k)))pr(ctx,'audio sin grabar: '+k)});
    if(q.tipo==='mc'){
      const o=q.opciones;
      if(o.length<2||o.length>4)pr(ctx,o.length+' opciones');
      if(o.filter(x=>x.ok).length!==1)pr(ctx,'hay '+o.filter(x=>x.ok).length+' correctas');
      if(new Set(o.map(x=>N(x.t))).size!==o.length)pr(ctx,'opciones repetidas '+JSON.stringify(o.map(x=>x.t)));
      if(o.some(x=>!x.t||x.t.length>70))pr(ctx,'opción vacía o enorme');
      if(o.some(x=>!x.ok&&/^(doesn't|don't|does not|do not)\b/i.test(x.t)))pr(ctx,'una opción mala es inglés correcto en presente: '+o.map(x=>x.t).join(' / '));
      const bien=o.find(x=>x.ok);
      if(q.tag!=='tabla'&&bien&&bien.t!==q.mostrar)pr(ctx,'«mostrar» ('+q.mostrar+') no es la correcta ('+bien.t+')');
    }
    if(q.tipo==='tipear'){
      if(!q.aceptar||!q.aceptar.length)pr(ctx,'sin respuestas aceptadas');
      else{if(!q.aceptar.some(a=>N(a)===N(q.mostrar)))pr(ctx,'«mostrar» no está entre las aceptadas');if(q.aceptar.some(a=>N(a)==='' ))pr(ctx,'respuesta vacía aceptada')}
      if(q.banco&&!q.banco.includes(q.mostrar))pr(ctx,'el banco de palabras no trae la respuesta');
    }
    if(q.tipo==='ordenar'){
      if(q.fichas.length!==q.sol.length||q.fichas.slice().sort().join('|')!==q.sol.slice().sort().join('|'))pr(ctx,'fichas distintas de la solución');
      if(q.fichas.join(' ')===q.sol.join(' '))pr(ctx,'las fichas ya vienen en orden');
      if(q.sol.join(' ').replace(' ?','?')!==q.mostrar)pr(ctx,'«mostrar» no es la solución');
      if(q.sol.length<4||q.sol.length>10)pr(ctx,q.sol.length+' fichas');
      (q.alt||[]).forEach(a=>{if(N(a).split(' ').sort().join(' ')!==N(q.sol.join(' ')).split(' ').sort().join(' ')||N(a)===N(q.sol.join(' ')))pr(ctx,'variante de orden rara: '+a)});
    }
    if(q.tipo==='unir'){
      const idsI=q.izq.map(x=>x.id),idsD=q.der.map(x=>x.id);
      if(q.izq.length<3||q.izq.length!==q.der.length)pr(ctx,'pares raros');
      if(new Set(idsI).size!==idsI.length||idsI.slice().sort().join()!==idsD.slice().sort().join())pr(ctx,'los pares no se corresponden');
      if(new Set(q.der.map(x=>x.t)).size!==q.der.length)pr(ctx,'respuestas repetidas en el lado derecho');
      if(idsI.join()===idsD.join())pr(ctx,'el lado derecho ya viene en el mismo orden');
      q.izq.forEach(x=>{const it=ITEMS[x.id].i;if(!(x.t===it.en||x.t===it.base))pr(ctx,'izq no es el ítem: '+x.t)});
      q.der.forEach(x=>{const it=ITEMS[x.id].i;if(!(x.t===it.es||x.t===it.emoji||x.t===it.past))pr(ctx,'der no es el ítem: '+x.t)});
    }
    if(v)v(q,strip(q.cuerpo||''),q.opciones&&q.opciones.find(o=>o.ok));
  };
  // ---- vocabulario
  B.TEMAS.filter(t=>t.tipo==='vocab').forEach(t=>t.items.forEach(it=>TIPOS.vocab.forEach(tipo=>{
    if((tipo==='emoji2en'||tipo==='write')&&!it.emoji)return;
    for(let k=0;k<(tipo==='unir'?6:12);k++){
      let q;try{q=B.gen(t.id,it.id,tipo)}catch(e){pr(t.id+'/'+it.id+'/'+tipo,'se rompió: '+e.message);continue}
      const ctx=t.id+'/'+it.id+'/'+tipo;
      val(q,ctx,(q,txt,bien)=>{
        if(tipo==='emoji2en'){if(!txt.includes(it.emoji)||bien.t!==it.en)pr(ctx,'emoji2en mal')}
        if(tipo==='audio2en'){if(q.audio!==it.k||bien.t!==it.en)pr(ctx,'audio2en mal')}
        if(tipo==='en2es'){if(!txt.startsWith(it.en)||bien.t!==it.es)pr(ctx,'en2es mal')}
        if(tipo==='es2en'){if(!txt.startsWith(it.es)||bien.t!==it.en)pr(ctx,'es2en mal')}
        if(tipo==='cloze'){if(txt!==it.ctx||bien.t!==it.en||q.hablar!==it.kLleno)pr(ctx,'cloze mal: «'+txt+'»')}
        if(tipo==='spell'){if(q.audio!==it.k||q.aceptar[0]!==it.en)pr(ctx,'spell mal')}
        if(tipo==='write'){const mismos=B.TEMAS.filter(x=>x.tipo==='vocab').flatMap(x=>x.items).filter(x=>x.emoji===it.emoji).map(x=>x.en);if(q.aceptar.slice().sort().join()!==mismos.sort().join()||!txt.includes(it.emoji))pr(ctx,'write mal '+JSON.stringify(q.aceptar))}
        if(tipo==='unir'){q.izq.forEach(x=>{const m=ITEMS[x.id].i,d=q.der.find(y=>y.id===x.id);if(x.t!==m.en||(d.emoji?d.t!==m.emoji:d.t!==m.es))pr(ctx,'unir mal')})}
      });
    }})));
  // ---- verbos regulares e irregulares
  const verbos=(tema,lista)=>lista.forEach(v=>{
    if(v.be)return;
    TIPOS[tema.tipo].forEach(tipo=>{
      if(tipo==='tabla'||tipo==='unir')return;
      for(let k=0;k<14;k++){
        let q;try{q=B.gen(tema.id,v.id,tipo)}catch(e){pr(tema.id+'/'+v.id+'/'+tipo,'se rompió: '+e.message);continue}
        const ctx=tema.id+'/'+v.id+'/'+tipo,stem=v.aff.replace(v.past,'____')+' ('+v.base+')',stemN=v.neg.replace("didn't "+v.base,'____')+' (✘ '+v.base+')';
        val(q,ctx,(q,txt,bien)=>{
          if(tipo==='choosePast'){if(!txt.startsWith(stem)||bien.t!==v.past)pr(ctx,'choosePast mal: «'+txt+'»')}
          if(tipo==='typePast'){if(!txt.startsWith(stem)||q.aceptar.join()!==v.past)pr(ctx,'typePast mal')}
          if(tipo==='forma'||tipo==='baseToPast'){if(!txt.startsWith(v.base)||bien.t!==v.past)pr(ctx,tipo+' mal')}
          if(tipo==='typeForma'){if(!txt.startsWith(v.base)||q.aceptar.join()!==v.past||q.hablar!==v.kPast)pr(ctx,'typeForma mal')}
          if(tipo==='pastToBase'){if(!txt.startsWith(v.past)||bien.t!==v.base)pr(ctx,'pastToBase mal')}
          if(tipo==='chooseNeg'){if(!txt.startsWith(stemN)||bien.t!=="didn't "+v.base)pr(ctx,'chooseNeg mal: «'+txt+'»')}
          if(tipo==='typeNeg'){if(!txt.startsWith(stemN)||q.aceptar.join()!=="didn't "+v.base)pr(ctx,'typeNeg mal')}
          if(tipo==='ordenarAff'){if(q.sol.join(' ')!==v.aff||(es&&!txt.includes(v.affEs))||(!es&&txt!==''))pr(ctx,'ordenarAff mal')}
          if(tipo==='ordenarNeg'){if(q.sol.join(' ')!==v.neg||(es&&!txt.includes(v.negEs)))pr(ctx,'ordenarNeg mal')}
          if(tipo==='spot'){const neg=bien.t===v.neg;if(!neg&&bien.t!==v.aff)pr(ctx,'spot: la correcta no es ninguna de las dos');if(!txt.includes(neg?v.negEs:v.affEs))pr(ctx,'spot: la traducción no es la de la oración correcta');
            q.opciones.filter(o=>!o.ok).forEach(o=>{if(o.t===(neg?v.neg:v.aff))pr(ctx,'spot: una mala es igual a la buena')})}
          if(tipo==='listen'){if(q.audio!==v.kPast||bien.t!==v.past)pr(ctx,'listen mal')}
          if(tipo==='escribir'){const neg=q.aceptar[0]==="I didn't "+v.cue+'.';if(!neg&&q.aceptar[0]!=='I '+v.past+' '+v.cueRest+'.')pr(ctx,'escribir mal: '+q.aceptar[0]);if(!txt.includes('('+v.cue+')'))pr(ctx,'escribir: no muestra la pista');
            const sin=q.aceptar[0].slice(0,-1);if(q.aceptar.length!==3||q.aceptar[1]!==sin+' yesterday.'||q.aceptar[2]!=='Yesterday '+sin+'.')pr(ctx,'escribir: faltan las variantes con yesterday');
            if(B.audio[q.hablar]!==q.mostrar)pr(ctx,'escribir: el audio de la corrección dice «'+B.audio[q.hablar]+'» y la respuesta es «'+q.mostrar+'»')}
        });
      }
    });
  });
  verbos(B.tema('regular'),B.REG);verbos(B.tema('irregular'),B.IRR);
  // ---- la tabla de «ayer» (✔ lo hizo, ✘ no lo hizo): se lee el dibujo y se comprueba la respuesta
  for(let k=0;k<120;k++){
    let q;try{q=B.genTabla()}catch(e){pr('tabla','se rompió: '+e.message);continue}
    val(q,'tabla',null);
    const d=new DOMParser().parseFromString('<div>'+q.cuerpo+'</div>','text/html'),marca=d.querySelector('td.marca'),hizo=marca.classList.contains('si');
    const fila=marca.parentElement.querySelector('th').textContent,cols=[...marca.parentElement.children].indexOf(marca),base=d.querySelectorAll('tr')[0].children[cols].querySelector('small').textContent;
    const v=B.REG.find(x=>x.base===base),nombre=fila.replace(/^\S+\s+/,'');
    if(!v){pr('tabla','verbo desconocido '+base);continue}
    const bien=q.opciones.find(o=>o.ok).t;
    if(bien!==(hizo?v.past:"didn't "+v.base))pr('tabla','respuesta equivocada: celda '+(hizo?'✔':'✘')+' → «'+bien+'»');
    if(!d.querySelector('.frase').textContent.includes(nombre+' ____ '+v.obj))pr('tabla','la frase no es la de la celda');
    if(q.mostrar!==nombre+' '+bien+' '+v.obj+'.')pr('tabla','«mostrar» raro: '+q.mostrar);
    if(B.audio[q.hablar]!==bien)pr('tabla','el audio de la corrección dice «'+B.audio[q.hablar]+'» y la respuesta es «'+bien+'»');
  }
  // ---- «had to»
  B.HADTO.forEach(h=>TIPOS.hadto.forEach(tipo=>{for(let k=0;k<14;k++){
    let q;try{q=B.gen('hadto',h.id,tipo)}catch(e){pr('hadto/'+h.id+'/'+tipo,'se rompió: '+e.message);continue}
    const ctx='hadto/'+h.id+'/'+tipo;
    val(q,ctx,(q,txt,bien)=>{
      if(tipo==='choose'||tipo==='typeFill'){const resp=tipo==='choose'?bien.t:q.aceptar[0],neg=resp==="didn't have to";
        if(!neg&&resp!=='had to')pr(ctx,'respuesta rara '+resp);
        if(!txt.startsWith(neg?h.neg.replace("didn't have to",'____'):h.aff.replace('had to','____')))pr(ctx,'el hueco no es el de la oración: «'+txt+'»');
        if(!txt.includes(neg?'✘':'✔'))pr(ctx,'falta la marca ✔/✘')}
      if(tipo==='lista'){const e=B.LISTAS.flatMap(l=>l.items).find(x=>x.id===h.id);if(!e||!txt.includes(e.task+' – '+e.who)||!txt.includes('Before the party, '+e.who+' ____')||q.aceptar[0]!=='had to '+e.task||q.aceptar[1]!==e.who+' had to '+e.task||q.hablar!==e.k||(es&&!txt.includes(e.es)))pr(ctx,'lista mal: «'+txt+'»')}
      if(tipo==='ordenarAff'&&q.sol.join(' ')!==h.aff)pr(ctx,'ordenarAff mal');
      if(tipo==='ordenarNeg'&&q.sol.join(' ')!==h.neg)pr(ctx,'ordenarNeg mal');
      if(tipo==='es2en'||tipo==='spot'){const neg=bien.t===h.neg;if(!neg&&bien.t!==h.aff)pr(ctx,'la correcta no es ninguna');if(!txt.includes(neg?h.negEs:h.affEs))pr(ctx,'traducción que no corresponde');
        q.opciones.filter(o=>!o.ok).forEach(o=>{if(o.t===(neg?h.neg:h.aff))pr(ctx,'una mala es igual a la buena')})}
    });
  }}));
  // ---- preguntas en pasado (p. 101)
  B.DID.forEach(d=>TIPOS.preguntas.forEach(tipo=>{for(let k=0;k<14;k++){
    let q;try{q=B.gen('preguntas',d.id,tipo)}catch(e){pr('preguntas/'+d.id+'/'+tipo,'se rompió: '+e.message);continue}
    const ctx='preguntas/'+d.id+'/'+tipo;
    val(q,ctx,(q,txt,bien)=>{
      const marca=txt.includes('✔')?'✔':txt.includes('✘')?'✘':'',resp=marca==='✔'?d.si:d.no;
      if(tipo==='qDid'){if(bien.t!=='Did'||!txt.startsWith('____ '+d.sujeto+' '+d.base+' '+d.resto+'?')||q.opciones.some(o=>!o.ok&&!/^(Do|Does|Were)$/.test(o.t)))pr(ctx,'qDid mal: «'+txt+'»')}
      if(tipo==='qSpot'){if(bien.t!==d.q||!txt.includes(d.es)||q.opciones.some(o=>!o.ok&&(o.t===d.q||!/^(Did|Do|Does) /.test(o.t)||(/^Did /.test(o.t)&&!o.t.includes(' '+d.past+' ')&&!o.t.includes(' '+d.base+' ')))))pr(ctx,'qSpot mal: '+j(q.opciones.map(o=>o.t)))}
      if(tipo==='qResp'||tipo==='qTipear'){const r=tipo==='qResp'?bien.t:q.aceptar[0];if(!marca||r!==resp||!txt.startsWith(d.q)||q.hablar!==(marca==='✔'?d.kSi:d.kNo)||B.audio[q.hablar]!==resp)pr(ctx,tipo+' mal: «'+txt+'» → '+r);
        if(tipo==='qResp'&&(q.opciones.length!==4||q.opciones.map(o=>o.t).sort().join('|')!==[d.si,d.no,'Yes, '+d.pron+" didn't.",'No, '+d.pron+' did.'].sort().join('|')))pr(ctx,'qResp: opciones raras')}
      if(tipo==='qOrdenar'){if(q.sol.join(' ')!==d.q.replace('?',' ?')||q.mostrar!==d.q||q.sol[q.sol.length-1]!=='?')pr(ctx,'qOrdenar mal');if(N(q.sol.join(' '))!==N(d.q))pr(ctx,'qOrdenar: no arma la pregunta')}
      if(tipo==='qEscribirQ'){if(q.aceptar.join()!==d.q||!txt.startsWith(d.decl)||q.hablar!==d.kQ)pr(ctx,'qEscribirQ mal: «'+txt+'»')}
    });
  }}));
  // ---- was / were
  for(let k=0;k<150;k++){
    const q=B.genBe();val(q,'be',null);
    const txt=strip(q.cuerpo),be=B.BE.find(x=>txt.startsWith(x.s)),bien=q.opciones.find(o=>o.ok);
    if(!be)pr('be','oración desconocida «'+txt+'»');else if(bien.t!==be.ok||q.opciones.length!==2)pr('be','respuesta mal en '+be.id);
  }
  return out;
},es);
let pr1=await probar(true);
chk('TODAS las preguntas de los 8 temas (cada ítem × cada tipo, muchas veces) salen bien armadas: UNA sola correcta, opciones distintas, las oraciones coinciden con el contenido, hay audio para todo lo que se dice',pr1.length===0,pr1.slice(0,8).join(' | '));
let pr2=await probar(false);
chk('lo mismo sin traducciones (se pueden apagar en Ajustes): las preguntas siguen entendiéndose y bien armadas',pr2.length===0,pr2.slice(0,6).join(' | '));
chk('armar preguntas no rompió la página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 4) cada ronda, de verdad, tocando los botones
{
const p=await abrir();
const tarjetas=await p.evaluate(()=>[...document.querySelectorAll('#pInicio .tema')].map(e=>({t:e.dataset.tema,txt:e.innerText.replace(/\s+/g,' ')})));
chk('el inicio muestra los 8 temas, cada uno con su unit y su página, la cuenta regresiva («Faltan 2 días») y el simulacro',tarjetas.length===8&&/Past simple: questions.*Unit 8 · p\. 101/.test(tarjetas[7].txt)&&/Housework.*Unit 7 · p\. 84/.test(tarjetas[0].txt)&&/Past simple: irregular verbs.*Unit 8 · p\. 98, 99 y 101/.test(tarjetas[5].txt)&&/Faltan 2 días/.test(await p.innerText('.cuenta'))&&/30 preguntas/.test(await p.innerText('#bSim')),j(tarjetas));
chk('al empezar no hay nada para repasar (el botón está apagado) y el inicio sugiere seguir con el primer tema',await p.evaluate(()=>document.getElementById('bErrores').disabled)&&/Seguí con: Housework/.test(await p.innerText('.seguir')));
// el tema: estudio con voz
for(const t of ['housework','regular','party','hadto','everyday','irregular','roman','preguntas']){
  await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#bPracticar');
  const info=await p.evaluate(()=>({botones:[...document.querySelectorAll('#pTema [data-k]')].map(e=>e.dataset.k),tema:document.getElementById('pTema').dataset.tema,txt:document.getElementById('pTema').innerText.replace(/\s+/g,' ')}));
  const esperado=await p.evaluate(t=>{const x=B3.tema(t);return {n:x.items.filter(i=>!i.extra).length,nombre:x.nombre}},t);
  chk('«'+t+'»: la pantalla de estudio muestra todo lo del tema con 🔊 para cada cosa, y cada 🔊 tiene su mp3',info.tema===t&&info.txt.includes(esperado.nombre)&&info.botones.length>=esperado.n&&info.botones.every(k=>manifest.includes(k)),j([info.botones.filter(k=>!manifest.includes(k)),info.botones.length,esperado]));
  await p.click('#pTema .atras');await p.waitForSelector('#pInicio .tema');
}
chk('la pantalla de estudio no mostró los verbos «por si acaso» (sólo si se prenden en Ajustes) y los irregulares muestran «was / were»',await (async()=>{await p.click('#pInicio .tema[data-tema="irregular"]');const t=await p.innerText('#pTema');await p.click('#pTema .atras');return !/por si acaso/i.test(t)&&/was \/ were/.test(t)&&/\bsaw\b/.test(t)&&!/\bswam\b/.test(t)})());
// una ronda de práctica, todo bien
await p.click('#pInicio .tema[data-tema="housework"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
const prim=await p.evaluate(()=>({n:B3.ronda().qs.length,barra:document.querySelector('.pasos small').textContent,consigna:document.querySelector('.consigna b').textContent}));
chk('empezar a practicar abre una ronda de 10 preguntas con su barra «1 / 10» y la consigna en inglés',prim.n===10&&prim.barra==='1 / 10'&&/[A-Za-z]/.test(prim.consigna),j(prim));
const t1=await jugar(p,()=>true);
const fin1=await textoFin(p),st1=await estado(p);
chk('practicar todo bien: «10 de 10», 100 %, sin «para repasar», y quedan los botones «Otra ronda» e «Inicio» ('+[...new Set(t1)].join('/')+')',/10 de 10/.test(fin1)&&/100 %/.test(fin1)&&!/Para repasar/.test(fin1)&&await visible(p,'#bOtra')&&await visible(p,'#bInicioFin')&&st1.rondas===1&&j(st1.dias[Object.keys(st1.dias)[0]])==='[10,0]',fin1.slice(0,200)+j(st1.dias));
chk('lo contestado bien sube la caja de cada palabra (cada ítem preguntado quedó en caja 1 o más) y se anota en «Hoy»',Object.values(st1.items).length>=3&&Object.values(st1.items).every(e=>e.c>=1&&e.ok>=1&&e.mal===0));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .tema');
chk('al volver al inicio se ve el progreso (barras y «n de 8 aprendidas») y «Hoy: 10 bien · 0 mal»',/Hoy: 10 bien · 0 mal/.test(await p.innerText('#pInicio'))&&await p.evaluate(()=>[...document.querySelectorAll('#pInicio .prog i')].some(i=>parseInt(i.style.width)>=0)));
// una ronda donde se falla lo primero: lo que falló vuelve al final y no cuenta en el puntaje
await p.click('#pInicio .tema[data-tema="regular"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
const t2=await jugar(p,i=>i>=3);
const fin2=await textoFin(p),r2=await p.evaluate(()=>({n:B3.ronda().qs.length,reint:B3.ronda().qs.filter(q=>q.reintento).length,ok:B3.ronda().ok,mal:B3.ronda().mal,err:B3.ronda().errores.length}));
chk('fallar las 3 primeras: el puntaje es «7 de 10», hay «Para repasar (3)» y las 3 vuelven a preguntarse al final sin sumar al puntaje (sale «'+fin2.match(/\d+ de \d+/)+'»)',/7 de 10/.test(fin2)&&/Para repasar \(3\)/.test(fin2)&&r2.n===13&&r2.reint===3&&r2.ok===7&&r2.mal===3&&r2.err===3,j(r2)+fin2.slice(0,160));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .tema');
// «Repasar lo que me salió mal», con un estado sembrado: se equivocó en 2 cosas que todavía no lleva 2 aciertos seguidos, y en otras 2 que ya domina
{
const p2=await abrir({estado:{items:{vb_wash:{c:0,ok:0,mal:2,u:'2026-11-09'},vb_help:{c:1,ok:1,mal:1,u:'2026-11-09'},vb_go:{c:3,ok:3,mal:1,u:'2026-11-09'},vb_play:{c:2,ok:2,mal:1,u:'2026-11-09'}}}});
const errTxt=await p2.innerText('#bErrores'),errHab=await p2.evaluate(()=>!document.getElementById('bErrores').disabled);
chk('«Repasar lo que me salió mal» se prende y dice «2 cosas»: las que se equivocó y todavía no lleva 2 aciertos seguidos (no las que ya domina)',errHab&&/2 cosas/.test(errTxt),errTxt);
await p2.click('#bErrores');await p2.waitForSelector('#pPreg .consigna');
const rep=await p2.evaluate(()=>{const R=B3.ronda();return {n:R.qs.length,ids:[...new Set(R.qs.flatMap(q=>q.ids))].sort().join(),unir:R.qs.some(q=>q.tipo==='unir'),tema:R.tema}});
chk('repasar arma una ronda de 5 a 10 preguntas sólo con esas 2 cosas (vb_help y vb_wash), sin «unir» que traería otras',rep.n>=5&&rep.n<=10&&rep.ids==='vb_help,vb_wash'&&!rep.unir,j(rep));
await jugar(p2,()=>true);
const stR=await estado(p2);
chk('contestar bien lo repasado sube su caja (vb_wash y vb_help) y no toca lo que ya dominaba',stR.items.vb_wash.c>=1&&stR.items.vb_help.c>=2&&stR.items.vb_go.c===3&&stR.items.vb_play.c===2,j(stR.items));
chk('repasar no produjo errores de página',p2.errs.length===0,j(p2.errs));
await cerrar(p2);
}
// la pantalla de resultado de una ronda mixta: el botón «Repasar lo que falló»
await p.click('#pInicio .tema[data-tema="irregular"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
await jugar(p,i=>i%2===0);
chk('una ronda a medias muestra «Repasar lo que falló» y lo que se erró con la respuesta buena (✔) y la explicación',await visible(p,'#bRepetirErr')&&await p.evaluate(()=>document.querySelectorAll('#pFin .err').length>=1&&[...document.querySelectorAll('#pFin .err')].every(e=>e.querySelector('.er')&&e.querySelector('.ee').textContent.length>8)));
await p.click('#bRepetirErr');await p.waitForSelector('#pPreg .consigna');
chk('«Repasar lo que falló» arma una ronda nueva con esas cosas',await p.evaluate(()=>B3.ronda().qs.length>=5));
chk('jugar rondas enteras no produjo errores de página ni diálogos del navegador',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 5) el simulacro: 30 preguntas, sin ver si estuvo bien hasta el final, con resultado por parte
{
const p=await abrir();
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
const sim=await p.evaluate(()=>{const R=B3.ronda();const por={};R.qs.forEach(q=>{por[q.parte]=(por[q.parte]||0)+1});return {n:R.qs.length,test:R.test,por,parte:document.querySelector('.parte')&&document.querySelector('.parte').textContent}});
chk('el simulacro tiene 30 preguntas en 6 partes (A · Look and write 6, B · Complete with the past simple 5, C · Order the words 6 —3 de had to y 3 preguntas en pasado—, D · Write sentences and answers 4, E · Read and circle 5, F · Read and complete 4) y muestra la parte en cada pregunta',sim.n===30&&sim.test&&sim.por['A · Look and write']===6&&sim.por['B · Complete with the past simple']===5&&sim.por['C · Order the words']===6&&sim.por['D · Write sentences and answers']===4&&sim.por['E · Read and circle']===5&&sim.por['F · Read and complete']===4&&/^A · /.test(sim.parte||''),j(sim));
// una pregunta contestada: no se ve ni «bien» ni «mal»
await responder(p,true);await p.waitForTimeout(80);
chk('en el simulacro no se ve si estuvo bien o mal hasta el final (ni cartel, ni colores, ni «Next»)',!(await visible(p,'#feedback'))&&!(await p.evaluate(()=>!!document.querySelector('#pPreg .opcion.si, #pPreg .opcion.no, #pPreg .resp.si, #pPreg .resp.no, #pPreg #bSig'))));
await p.waitForFunction(()=>B3.ronda().i===1);
const tipos=await jugar(p,()=>true,true);
const finS=await textoFin(p),stS=await estado(p);
chk('simulacro todo bien: «30 de 30», 100 %, «Por parte» con las 6 partes, sin errores, y queda guardado el resultado ('+[...new Set(tipos)].join('/')+')',/30 de 30/.test(finS)&&/100 %/.test(finS)&&/Por parte/.test(finS)&&(await p.locator('#pFin .pt').count())===6&&stS.sims.length===1&&stS.sims[0].p===30&&stS.sims[0].t===30&&!/Para repasar/.test(finS),finS.slice(0,300)+j(stS.sims));
chk('el resultado por parte muestra cuántas salieron bien en cada una (6 / 6, 5 / 5, 6 / 6, 4 / 4, 5 / 5, 4 / 4)',await p.evaluate(()=>[...document.querySelectorAll('#pFin .pt b')].map(b=>b.textContent).join()==='6 / 6,5 / 5,6 / 6,4 / 4,5 / 5,4 / 4'));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .tema');
chk('el inicio muestra «tu mejor resultado: 100 %»',/tu mejor resultado: 100 %/.test(await p.innerText('#bSim')));
// otro simulacro, todo mal
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
await responder(p,false);await p.waitForTimeout(60);
chk('tampoco se ve cuando una respuesta está mal (mismo aspecto que una bien contestada)',!(await visible(p,'#feedback'))&&!(await p.evaluate(()=>!!document.querySelector('#pPreg .opcion.si, #pPreg .opcion.no, #pPreg .resp.si, #pPreg .resp.no, #pPreg .armada.si, #pPreg .armada.no, #pPreg #bSig'))));
await p.waitForFunction(()=>B3.ronda().i===1);
await jugar(p,()=>false,true);
const finM=await textoFin(p),stM=await estado(p);
chk('simulacro todo mal: «0 de 30», 30 cosas «para repasar», y el mejor resultado sigue siendo el de antes',/0 de 30/.test(finM)&&/Para repasar \(30\)/.test(finM)&&stM.sims.length===2&&stM.sims[1].p===0&&Math.max(...stM.sims.map(s=>s.p))===30,finM.slice(0,200));
chk('al terminar un simulacro la parte «Por parte» marca 0 en cada una',await p.evaluate(()=>[...document.querySelectorAll('#pFin .pt b')].every(b=>/^0 \//.test(b.textContent))));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .tema');
chk('después de fallar el simulacro hay muchas cosas para repasar (botón prendido)',await p.evaluate(()=>!document.getElementById('bErrores').disabled&&/\d+ cosas/.test(document.getElementById('bErrores').innerText)));
chk('el simulacro no produjo errores de página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 6) lo que se escribe: mayúsculas, puntos, «did not», apóstrofo
{
const p=await abrir();
const tipear=async(tema,id,tipo,texto)=>{
  await p.evaluate(([t,i,ti])=>{B3.rondaCon([B3.gen(t,i,ti)],false)},[tema,id,tipo]);await p.waitForSelector('#resp');
  await p.fill('#resp',texto);await p.press('#resp','Enter');await p.waitForSelector('#feedback:not([hidden])');
  return {ok:await p.evaluate(()=>B3.ronda().ok===1),fb:await p.innerText('#feedback')};
};
let r=await tipear('regular','vb_wash','typeNeg',"Didn't Wash.");chk('se acepta con mayúsculas y con punto («Didn\'t Wash.» = didn\'t wash)',r.ok,r.fb);
r=await tipear('regular','vb_wash','typeNeg',"did not wash");chk('«did not wash» vale igual que «didn\'t wash»',r.ok,r.fb);
r=await tipear('regular','vb_wash','typeNeg',"didn’t wash");chk('el apóstrofo curvo del teclado del iPhone (’) vale',r.ok,r.fb);
r=await tipear('regular','vb_wash','typeNeg',"  didn't   wash ");chk('los espacios de más no importan',r.ok,r.fb);
r=await tipear('regular','vb_wash','typeNeg',"didnt wash");chk('sin apóstrofo («didnt wash») también vale, pero avisa cómo se escribe',r.ok&&/apóstrofo/.test(r.fb)&&/didn't wash/.test(r.fb),r.fb);
r=await tipear('regular','vb_wash','typeNeg',"didn't washed");chk('«didn\'t washed» está mal y muestra la respuesta («didn\'t wash») y la regla',!r.ok&&/didn't wash/.test(r.fb)&&/didn't/.test(r.fb)&&/forma base|sin -ed/.test(r.fb),r.fb);
r=await tipear('regular','vb_tidy','typePast',"tidyed");chk('«tidyed» está mal (es «tidied») y la corrección explica la regla de la y',!r.ok&&/tidied/.test(r.fb)&&/consonante \+ y|ied/.test(r.fb),r.fb);
r=await tipear('irregular','vb_go','typePast',"went");chk('pasado irregular escrito bien («went»)',r.ok,r.fb);
r=await tipear('irregular','vb_go','typePast',"goed");chk('«goed» está mal y dice que es irregular',!r.ok&&/went/.test(r.fb)&&/irregular/.test(r.fb),r.fb);
r=await tipear('irregular','vb_go','escribir',"Yesterday I went to school.");const esp0=await p.evaluate(()=>B3.ronda().qs[0].mostrar);chk('«escribí una oración»: «Yesterday I went to school.» y «I went to school yesterday.» valen igual que «I went to school.» (si le tocó la negativa se prueba con ella)',/went to school|didn't go to school/.test(esp0),esp0);
for(const [t,id] of [['irregular','vb_go']]){for(const [a,b] of [['I went to school yesterday.','I didn\'t go to school yesterday.'],['Yesterday I went to school.','Yesterday I didn\'t go to school.']]){await p.evaluate(([t,i])=>{B3.rondaCon([B3.gen(t,i,'escribir')],false)},[t,id]);await p.waitForSelector('#resp');const neg=await p.evaluate(()=>/didn't/.test(B3.actual().mostrar));await p.fill('#resp',neg?b:a);await p.press('#resp','Enter');await p.waitForSelector('#feedback:not([hidden])');chk('«'+(neg?b:a)+'» se acepta',await p.evaluate(()=>B3.ronda().ok===1),await p.innerText('#feedback'))}}
r=await tipear('irregular','vb_fly','escribir',"i didn't fly a kite");
const esperada=await p.evaluate(()=>B3.ronda().qs[0].mostrar);
chk('«escribí una oración»: se acepta sin mayúscula ni punto final (esperada: «'+esperada+'»)',/^I (didn't fly a kite|flew a kite)\.$/.test(esperada)&&(r.ok===/didn't/.test(esperada)));
// ordenar: el «cuándo / dónde» del final también puede ir al principio (es inglés válido)
for(const [tema,id,tipo] of [['regular','vb_wash','ordenarAff'],['regular','vb_clean','ordenarNeg'],['hadto','ht_dishes','ordenarAff'],['irregular','vb_go','ordenarNeg']]){
  await p.evaluate(([t,i,ti])=>{B3.rondaCon([B3.gen(t,i,ti)],false)},[tema,id,tipo]);await p.waitForSelector('#fichas .ficha');
  const info=await p.evaluate(()=>{const q=B3.actual();return {fichas:q.fichas,alt:q.alt,sol:q.sol}});
  const nf=w=>w.toLowerCase().replace(/[.,!?]/g,''),usadas=new Set();
  for(const w of (info.alt[0]||'').split(' ')){const i=info.fichas.findIndex((f,k)=>!usadas.has(k)&&nf(f)===nf(w));usadas.add(i);await p.click('#fichas .ficha[data-f="'+i+'"]')}
  await p.click('#bCheck');await p.waitForSelector('#feedback:not([hidden])');
  chk('ordenar «'+info.sol.join(' ')+'»: con el «cuándo / dónde» al principio («'+info.alt[0]+'») también vale',info.alt.length===1&&await p.evaluate(()=>B3.ronda().ok===1),await p.innerText('#feedback'));
}
r=await tipear('housework','hw_dishes','write',"wash the dishes");chk('«Look and write»: «wash the dishes» vale (dibujo 🧽)',r.ok,r.fb);
r=await tipear('party','pp_set','write',"set the table");chk('«Look and write» con el dibujo 🍴: «set the table» vale',r.ok,r.fb);
r=await tipear('housework','hw_table','write',"clear the table");chk('«Look and write» con el dibujo 🍽️: «clear the table» vale',r.ok,r.fb);
r=await tipear('housework','hw_dishes','write',"set the table");chk('«set the table» para el dibujo de lavar los platos (🧽) está mal: ya no comparten dibujo',!r.ok&&/wash the dishes/.test(r.fb),r.fb);
r=await tipear('housework','hw_dishes','write',"wash the car");chk('«wash the car» para el dibujo de los platos está mal',!r.ok&&/wash the dishes/.test(r.fb),r.fb);
await p.evaluate(()=>{B3.rondaCon([B3.gen('housework','hw_car','write')],false)});await p.waitForSelector('#resp');
const antesBlanco=await p.evaluate(()=>JSON.stringify(B3.estado().dias));
await p.fill('#resp','   ');await p.click('#bCheck');await p.press('#resp','Enter');await p.waitForTimeout(120);
chk('con la respuesta en blanco no se corrige ni cuenta como error (por apretar sin querer): sigue la misma pregunta',await p.evaluate(a=>document.getElementById('feedback').hidden&&B3.ronda().mal===0&&B3.ronda().ok===0&&JSON.stringify(B3.estado().dias)===a&&!document.getElementById('resp').disabled,antesBlanco));
chk('lo que se escribe nunca se interpreta como código (se muestra como texto) y no hay errores de página',await (async()=>{
  await p.evaluate(()=>{B3.rondaCon([B3.gen('regular','vb_wash','typePast')],true);window.__pwn=0});await p.waitForSelector('#resp');
  await p.fill('#resp','<img src=x onerror="window.__pwn=1">');await p.press('#resp','Enter');
  await p.waitForSelector('#pFin:not([hidden])');const t=await p.innerText('#pFin');const pwn=await p.evaluate(()=>window.__pwn);const img=await p.evaluate(()=>document.querySelectorAll('#pFin img').length);
  return pwn===0&&img===0&&/<img src=x/.test(t)})()&&p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 7) doble toque, salir, ajustes, borrar
{
const p=await abrir();
await p.evaluate(()=>B3.rondaCon([B3.gen('regular','vb_wash','forma')],false));await p.waitForSelector('#pPreg .opcion');
const mala=await p.evaluate(()=>B3.actual().opciones.findIndex(o=>!o.ok));
await p.dblclick('#pPreg .opcion[data-i="'+mala+'"]');await p.waitForSelector('#feedback:not([hidden])');
const e1=await estado(p),dia=Object.values(e1.dias)[0];
chk('un doble toque sobre una opción cuenta UNA sola vez (no dos errores)',dia[0]===0&&dia[1]===1&&e1.items.vb_wash.mal===1&&await p.evaluate(()=>B3.ronda().mal===1));
chk('después de contestar las opciones quedan apagadas (no se puede cambiar) y se marca la buena en verde y la elegida en rojo',await p.evaluate(()=>{const b=[...document.querySelectorAll('#pPreg .opcion')];return b.every(x=>x.disabled)&&b.filter(x=>x.classList.contains('si')).length===1&&b.filter(x=>x.classList.contains('no')).length===1}));
chk('con la respuesta mal aparece «Casi…», la respuesta buena y la explicación en castellano',/Casi/.test(await p.innerText('#feedback'))&&/washed/.test(await p.innerText('#feedback'))&&/regulares/.test(await p.innerText('#feedback')));
// salir de una ronda: cartel propio
await p.evaluate(()=>B3.rondaCon([B3.gen('regular','vb_wash','forma'),B3.gen('regular','vb_help','forma')],false));await p.waitForSelector('#pPreg .opcion');
await p.click('#bSalir');await p.waitForSelector('#modal:not([hidden])');
chk('la ✕ abre un cartel propio («¿Salir de la ronda?») con «Salir» y «No, seguir» (no un diálogo del navegador)',/Salir de la ronda/.test(await p.innerText('#modal'))&&await visible(p,'#mSi')&&await visible(p,'#mNo')&&p.errs.length===0,j(p.errs));
await p.click('#mNo');
chk('«No, seguir» cierra el cartel y la pregunta sigue ahí',!(await visible(p,'#modal'))&&await visible(p,'#pPreg .opcion'));
await p.click('#bSalir');await p.keyboard.press('Escape');
chk('Escape también cierra el cartel',!(await visible(p,'#modal')));
await p.click('#bSalir');await p.click('#mSi');await p.waitForSelector('#pInicio:not([hidden])');
chk('«Salir» vuelve al inicio',await visible(p,'#pInicio .tema'));
// ajustes
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aVoz');
const aj=await p.evaluate(()=>({voz:document.getElementById('aVoz').checked,es:document.getElementById('aEs').checked,extra:document.getElementById('aExtra').checked,txt:document.getElementById('pAjustes').innerText}));
chk('Ajustes: sonido y traducciones prendidos, «por si acaso» apagado, versión de los audios y borrar progreso',aj.voz&&aj.es&&!aj.extra&&/Versión de los audios: [0-9a-f]{8} · \d+ frases/.test(aj.txt)&&/Borrar mi progreso/.test(aj.txt),aj.txt);
await p.click('#aVoz');await p.click('#aEs');await p.click('#aExtra');
const e2=await estado(p);
chk('los ajustes se guardan en el momento',e2.voz===false&&e2.es===false&&e2.extra===true);
await p.click('#pAjustes .atras');await p.waitForSelector('#pInicio .tema');
chk('con «por si acaso» prendido, los irregulares son 21 en lugar de 12 y los regulares 27 en lugar de 23',await p.evaluate(()=>B3.dominio(B3.tema('irregular')).n===21&&B3.dominio(B3.tema('regular')).n===27));
await p.click('#pInicio .tema[data-tema="irregular"]');await p.waitForSelector('#bPracticar');
chk('con las traducciones apagadas el estudio no las muestra, y con «por si acaso» aparecen los verbos extra marcados',await p.evaluate(()=>{const t=document.getElementById('pTema');return !t.querySelector('.vt')&&/por si acaso/.test(t.innerText)&&/\bswam\b/.test(t.innerText)}));
await p.evaluate(()=>{window.__plays.length=0;window.__voz.length=0});
await p.click('#pTema .oir >> nth=0');await p.waitForTimeout(150);
chk('con el sonido apagado no suena nada (ni mp3 ni la voz del aparato)',await p.evaluate(()=>window.__plays.length===0&&window.__voz.length===0));
await p.click('#pTema .atras');
// borrar el progreso: con cartel, conserva los ajustes
await p.evaluate(()=>{const ST=B3.estado();ST.items.vb_go={c:3,ok:5,mal:1,u:'2026-11-09'};ST.sims.push({f:'2026-11-09',p:20,t:30});localStorage.setItem('beehive3_estado',JSON.stringify(ST))});
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aBorrar');
await p.click('#aBorrar');await p.waitForSelector('#modal:not([hidden])');
chk('«Borrar mi progreso» pide confirmar con un cartel que dice que no se puede deshacer',/No se puede deshacer/.test(await p.innerText('#modal')));
await p.click('#mNo');
chk('si se dice que no, no se borra nada',(await estado(p)).items.vb_go.c===3);
await p.click('#aBorrar');await p.click('#mSi');
const e3=await estado(p);
chk('si se dice que sí, se borran las palabras aprendidas, los simulacros y los días, pero se conservan los ajustes',Object.keys(e3.items).length===0&&e3.sims.length===0&&Object.keys(e3.dias).length===0&&e3.voz===false&&e3.es===false&&e3.extra===true,j(e3));
await cerrar(p);
}

// ---------- 8) la voz: mp3 grabados, y la del aparato si no bajan
{
let p=await abrir();
await p.click('#pInicio .tema[data-tema="housework"]');await p.waitForSelector('#bPracticar');
await p.evaluate(()=>{window.__plays.length=0});
await p.click('#pTema .carta .oir >> nth=0');await p.waitForTimeout(200);
const pl=await p.evaluate(()=>window.__plays);
chk('tocar el 🔊 de una palabra baja su mp3 de audio/ con la versión de los audios (?a=)',pl.length===1&&/\/beehive3\/audio\/en_hoover-the-floor\.mp3\?a=[0-9a-f]{8}$/.test(pl[0].url),j(pl));
await p.evaluate(()=>{window.__plays.length=0});
await p.click('#pTema .carta .oir[data-lento] >> nth=0');await p.waitForTimeout(150);
chk('el 🐢 repite la palabra despacio',await p.evaluate(()=>window.__plays.length===1&&document.querySelector('#pTema .carta .oir[data-lento]')!==null));
// una pregunta que empieza hablando
await p.evaluate(()=>{window.__plays.length=0;B3.rondaCon([B3.gen('housework','hw_water','audio2en')],false)});await p.waitForSelector('#pPreg .opcion');await p.waitForTimeout(100);
chk('una pregunta de «Listen and choose» dice la palabra apenas aparece y el botón 🔊 de arriba la repite',await p.evaluate(()=>window.__plays.length===1&&/en_water-the-plants/.test(window.__plays[0].src))&&await (async()=>{await p.evaluate(()=>{window.__plays.length=0});await p.click('#bOir');await p.waitForTimeout(80);return await p.evaluate(()=>window.__plays.length===1)})());
// al contestar mal dice la respuesta correcta en voz alta
await p.evaluate(()=>{window.__plays.length=0});
await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');await p.waitForTimeout(100);
chk('al corregir, la frase correcta se dice en voz alta',await p.evaluate(()=>window.__plays.some(x=>/en_water-the-plants/.test(x.src))));
await cerrar(p);
// si el mp3 no baja, habla la voz del aparato en inglés británico
p=await abrir({audioRoto:true});
await p.click('#pInicio .tema[data-tema="housework"]');await p.waitForSelector('#bPracticar');
await p.click('#pTema .carta .oir >> nth=0');await p.waitForTimeout(250);
const vz=await p.evaluate(()=>window.__voz);
chk('si el mp3 no baja, habla la voz del aparato en inglés británico (en-GB) con la misma palabra',vz.length===1&&vz[0].lang==='en-GB'&&vz[0].texto==='hoover the floor'&&p.errs.length===0,j([vz,p.errs]));
await cerrar(p);
}

// ---------- 9) la cuenta regresiva
for(const [f,esp] of [['2026-11-10T09:00:00',/Faltan 2 días/],['2026-11-11T23:50:00',/¡Es mañana!/],['2026-11-12T08:00:00',/¡Es hoy! Mucha suerte/],['2026-11-13T08:00:00',/La prueba fue el jueves 12 de noviembre/],['2026-11-05T08:00:00',/Faltan 7 días/]]){
  const p=await abrir({fecha:f});
  const t=await p.innerText('.cuenta');chk('la cuenta regresiva el '+f.slice(0,10)+' dice «'+t.split('\n')[0]+'»',esp.test(t),t);await cerrar(p);
}

// ---------- 10) lo guardado roto no rompe nada, y se anda sin almacenamiento
{
const casos=[['no es JSON','esto no es json{'],['es una lista','[1,2,3]'],['es un número','42'],['es null','null'],
  ['campos del tipo equivocado',j({v:'x',voz:'no',es:0,extra:'sí',items:[1,2],dias:'hoy',sims:{a:1},rondas:'muchas'})],
  ['valores locos',j({items:{vb_wash:{c:99,ok:-5,mal:'x',u:'mañana'},vb_go:{c:1e12,ok:1e12,mal:NaN},'__proto__':{c:3},constructor:{c:1}},dias:{hoy:[1,2],'2026-11-09':[3,'x'],'2026-11-08':'no'},sims:[{f:'x',p:999,t:0},null,5],rondas:-3})]];
for(const [n,e] of casos){
  const p=await abrir({estado:e});
  const ok=await p.evaluate(()=>{const ST=B3.estado();const it=Object.values(ST.items);return it.every(x=>x.c>=0&&x.c<=4&&x.ok>=0&&x.mal>=0&&Number.isFinite(x.ok)&&(x.u===''||/^\d{4}-\d{2}-\d{2}$/.test(x.u)))&&ST.sims.every(s=>s.p>=0&&s.t>=1)&&Object.values(ST.dias).every(d=>Array.isArray(d)&&d.length===2&&d.every(Number.isFinite))&&ST.voz===true&&Number.isFinite(ST.rondas)&&Array.isArray(ST.sims)&&!Array.isArray(ST.items)});
  chk('lo guardado roto («'+n+'») no rompe: abre normal, sin errores, con valores sanos',ok&&await visible(p,'#pInicio .tema')&&p.errs.length===0,j(p.errs));
  await p.click('#pInicio .tema[data-tema="regular"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await responder(p,true);
  await cerrar(p);
}
const p=await abrir({storageRoto:true});
await p.click('#pInicio .tema[data-tema="housework"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
await jugar(p,()=>true);
chk('con el almacenamiento bloqueado (navegación privada, cookies cerradas) se puede igual estudiar, practicar y ver el resultado, sin errores',/10 de 10/.test(await textoFin(p))&&p.errs.length===0,j(p.errs));
await cerrar(p);
}
// lo que se guardó se conserva al recargar
{
const p=await abrir();
await p.click('#pInicio .tema[data-tema="hadto"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await jugar(p,()=>true);
const antes=await estado(p);await p.reload();await p.waitForSelector('#pInicio .tema');
chk('al recargar la página se conserva lo hecho (cajas, hoy, rondas) y el inicio lo refleja',j(await estado(p))===j(antes)&&/Hoy: 10 bien/.test(await p.innerText('#pInicio'))&&antes.rondas===1&&Object.keys(antes.items).length>=2,j(antes).slice(0,200));
await cerrar(p);
}

// ---------- 11) no pide nada a otros sitios, y no usa cosas del navegador que fallen
{
const p=await abrir();
await p.click('#pInicio .tema[data-tema="irregular"]');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3!==0);
await p.click('#bInicioFin');await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');await jugar(p,()=>true,true);
const ajenos=p.pedidos.filter(x=>!x.u.startsWith(ORIGEN_PROPIO)&&!/^data:|^blob:/.test(x.u)&&!/fonts\.(googleapis|gstatic)\.com/.test(x.u));
chk('en toda una sesión (estudio, práctica, simulacro) no pide nada a otros sitios (sólo las fuentes de Google) y todos los pedidos son GET',ajenos.length===0&&p.pedidos.every(x=>x.m==='GET'),j(ajenos.slice(0,4)));
chk('sin errores de página en toda la sesión',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 12) DISEÑO: nada se sale, se pisa ni se corta, en 12 tamaños, con cada tipo de pregunta en su peor caso (y ya corregida)
const medir=()=>{
  const vw=innerWidth,out=[],pant=document.querySelector('.pantalla:not([hidden])');if(!pant)return ['no hay pantalla'];
  const desc=e=>e.tagName.toLowerCase()+'.'+String(e.className).split(' ')[0]+'«'+(e.innerText||e.value||e.getAttribute('aria-label')||'').slice(0,18).replace(/\n/g,' ')+'»';
  const de=document.documentElement;if(de.scrollWidth>vw+1)out.push('scroll horizontal: '+de.scrollWidth+' > '+vw);
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
  const caja=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top+scrollY,b:r.bottom+scrollY,w:r.width,h:r.height}};
  const todos=[...pant.querySelectorAll('button,input,.cej,.ve')].filter(vis);
  todos.forEach(e=>{const c=caja(e);
    if(c.l<-0.5||c.r>vw+0.5)out.push('se sale de la pantalla: '+desc(e)+' ['+Math.round(c.l)+','+Math.round(c.r)+']');
    if(e.matches('button,input')&&!e.matches('input[type=checkbox]')&&(c.w<34||c.h<34))out.push('muy chico para el dedo: '+desc(e)+' '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('input[type=checkbox]')){const fila=e.closest('label');if(!fila||fila.getBoundingClientRect().height<44)out.push('casillero sin una fila grande para tocar: '+desc(e))}
    if(e.matches('.opcion,.ficha,.par,.btn,.chip,.tema,.seguir,.carta,.resp')&&e.scrollWidth>e.clientWidth+1)out.push('texto cortado: '+desc(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.matches('.opcion,.ficha,.par,.btn,.tema,.seguir')&&e.scrollHeight>e.clientHeight+2)out.push('texto cortado (alto): '+desc(e))});
  const bs=scrollY>2?[]:todos.filter(e=>e.matches('button,input'));   // la barra de arriba es fija: al bajar tapa lo que pasa por abajo (a propósito), así que los solapamientos se miran arriba de todo
  for(let i=0;i<bs.length;i++)for(let k=i+1;k<bs.length;k++){if(bs[i].contains(bs[k])||bs[k].contains(bs[i]))continue;const a=caja(bs[i]),c=caja(bs[k]);const ix=Math.min(a.r,c.r)-Math.max(a.l,c.l),iy=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(ix>2&&iy>2)out.push('se pisan: '+desc(bs[i])+' y '+desc(bs[k]))}
  [...pant.querySelectorAll('*')].forEach(e=>{if(!vis(e)||e.closest('.tabla'))return;const r=e.getBoundingClientRect();if(r.right>vw+1||r.left<-1){if(!out.some(x=>x.includes(desc(e))))out.push('contenido fuera de la pantalla: '+desc(e))}});
  return out;
};
const TAMANOS=[['celular chico 320×568',320,568],['Android chico 360×640',360,640],['iPhone 8 375×667',375,667],['iPhone 14 390×844',390,844],['iPhone Pro Max 430×932',430,932],['tableta vertical 768×1024',768,1024],['tableta horizontal 1024×768',1024,768],['compu 1280×800',1280,800],['iPhone 8 de costado 667×375',667,375],['Android de costado 740×360',740,360],['Android de costado 640×360',640,360],['iPhone 14 de costado 844×390',844,390]];
for(const [nombre,w,h] of (RAPIDO?TAMANOS.slice(3,4):TAMANOS)){
  const p=await abrir({vp:{width:w,height:h}});
  const falla=[];
  const m=async(que)=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  await m('inicio');
  for(const t of ['housework','regular','party','hadto','everyday','irregular','roman','preguntas']){await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#bPracticar');await m('estudio '+t);await p.click('#pTema .atras');await p.waitForSelector('#pInicio .tema')}
  await p.evaluate(()=>{window.scrollTo(0,0)});
  await p.click('#pInicio .barra .atras');await p.waitForSelector('#aVoz');await m('ajustes');await p.click('#pAjustes .atras');
  // las preguntas: por cada tema y tipo, las 3 de más texto (el peor caso)
  const lote=await p.evaluate(()=>{
    const ST=B3.estado();ST.extra=true;ST.es=true;const lista=[];
    const TIPOS={vocab:['emoji2en','audio2en','en2es','es2en','cloze','spell','write','unir'],regular:['choosePast','forma','typePast','typeForma','chooseNeg','typeNeg','ordenarAff','ordenarNeg','spot','listen','tabla'],hadto:['choose','typeFill','ordenarAff','ordenarNeg','es2en','spot','lista'],irregular:['choosePast','baseToPast','pastToBase','typePast','typeForma','chooseNeg','typeNeg','ordenarAff','ordenarNeg','spot','listen','escribir','unir'],preguntas:['qDid','qSpot','qResp','qOrdenar','qTipear','qEscribirQ']};
    const largo=q=>(q.cuerpo||'').replace(/<[^>]*>/g,'').length+(q.opciones||[]).reduce((s,o)=>s+o.t.length,0)+(q.fichas||[]).join(' ').length+(q.banco||[]).join(' ').length+(q.izq||[]).reduce((s,x)=>s+x.t.length,0);
    B3.TEMAS.forEach(t=>{TIPOS[t.tipo].forEach(tipo=>{
      const qs=[];t.items.forEach(it=>{if(it.be)return;if((tipo==='emoji2en'||tipo==='write')&&!it.emoji)return;for(let k=0;k<(tipo==='tabla'?10:2);k++){try{qs.push(tipo==='tabla'?B3.genTabla():B3.gen(t.id,it.id,tipo))}catch(e){}}});
      qs.sort((a,b)=>largo(b)-largo(a));qs.slice(0,3).forEach(q=>lista.push({t:t.id,tipo,i:lista.length}));
      window.__lote=window.__lote||[];qs.slice(0,3).forEach(q=>window.__lote.push(q))});});
    for(let k=0;k<6;k++)window.__lote.push(B3.genBe());
    return window.__lote.length;
  });
  for(let i=0;i<lote;i++){
    await p.evaluate(i=>{B3.rondaCon([window.__lote[i]],false)},i);
    await p.waitForSelector('#pPreg .consigna');
    const info=await p.evaluate(()=>{const q=B3.actual();return q.tag+'/'+q.tipo});
    await m('pregunta '+i+' '+info);
    if(i%2===0){   // ya corregida (mal): el cartel de la respuesta también tiene que entrar
      await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');
      await p.evaluate(()=>{window.scrollTo(0,0)});await p.waitForTimeout(20);
      await m('corregida '+i+' '+info);
      const sig=await p.evaluate(()=>{const e=document.getElementById('bSig');if(!e)return 'no hay «Next»';e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),bar=document.querySelector('#pPreg .barra').getBoundingClientRect();return r.top>=bar.bottom-1&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1?'':'«Next» no se ve entero (o queda bajo la barra de arriba): '+Math.round(r.top)+'–'+Math.round(r.bottom)+' de '+innerHeight+', barra hasta '+Math.round(bar.bottom)});
      if(sig)falla.push('corregida '+i+' '+info+' → '+sig);
    }
  }
  // el resultado, con una lista larga de errores
  await p.evaluate(()=>{B3.rondaCon(window.__lote.slice(0,10).map((q,i)=>Object.assign({},q,{parte:['A · Look and write','B · Complete with the past simple','C · Order the words'][i%3]})),true)});
  await jugar(p,()=>false,true);await m('resultado del simulacro (10 errores)');
  chk('diseño '+nombre+': inicio, 8 temas de estudio, ajustes, '+lote+' preguntas (peor caso, sin corregir y corregidas) y resultado — nada se sale, se pisa ni se corta',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
  await cerrar(p);
}

// ---------- 13) contraste de los colores (WCAG AA = 4,5 a 1 para texto normal) en claro y en oscuro
for(const oscuro of (RAPIDO?[false]:[false,true])){
  const p=await abrir({oscuro});
  const malos=[];
  const medirContraste=async(que)=>{const r=await p.evaluate(()=>{
    const num=c=>c.match(/[\d.]+/g).map(Number),lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    const lum=c=>{const [r,g,b]=num(c);return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)};
    const fondo=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const a=num(c)[3];if(c!=='rgba(0, 0, 0, 0)'&&(a===undefined||a>0.5))return c;e=e.parentElement}return 'rgb(255,255,255)'};
    const out=[];const pant=document.querySelector('.pantalla:not([hidden])');
    [...pant.querySelectorAll('*')].filter(e=>e.children.length===0||e.matches('button,.frase,.fbt,.fbr,.fbe,.ttxt b,.pal')).forEach(e=>{
      const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const t=(e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));if(!t)return;
      const cs=getComputedStyle(e),a=lum(cs.color),b=lum(fondo(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
      if(ratio<(grande?3:4.5)&&!e.closest('.cuenta'))out.push(e.className.split(' ')[0]+'«'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(e)+')')});
    return out}) ;r.forEach(x=>malos.push(que+' → '+x))};
  await medirContraste('inicio');
  await p.click('#pInicio .tema[data-tema="irregular"]');await p.waitForSelector('#bPracticar');await medirContraste('estudio irregular');await p.click('#pTema .atras');
  await p.click('#pInicio .tema[data-tema="housework"]');await p.waitForSelector('#bPracticar');await medirContraste('estudio vocabulario');await p.click('#pTema .atras');
  for(const [id,tipo] of [['vb_wash','choosePast'],['vb_wash','chooseNeg'],['vb_go','typePast'],['vb_go','ordenarNeg'],['hw_water','unir'],['vb_wash','tabla']]){
    const tema=id.startsWith('hw_')?'housework':id==='vb_wash'?'regular':'irregular';
    await p.evaluate(([t,i,ti])=>{B3.rondaCon([ti==='tabla'?B3.genTabla():B3.gen(t,i,ti)],false)},[tema,id,tipo]);await p.waitForSelector('#pPreg .consigna');
    await medirContraste('pregunta '+tipo);
    await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (mal) '+tipo);
  }
  await p.evaluate(()=>{B3.rondaCon([B3.gen('regular','vb_wash','forma')],false)});await p.waitForSelector('#pPreg .opcion');await responder(p,true);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (bien)');
  await p.evaluate(()=>{B3.rondaCon([B3.gen('regular','vb_wash','forma'),B3.gen('regular','vb_help','forma')],false)});await p.waitForSelector('#pPreg .opcion');await jugar(p,i=>i>0);await medirContraste('resultado');
  await p.click('#bInicioFin');await p.click('#pInicio .barra .atras');await p.waitForSelector('#aVoz');await medirContraste('ajustes');
  chk('contraste de los textos en modo '+(oscuro?'oscuro':'claro')+' (4,5 a 1; 3 a 1 en texto grande) en inicio, estudio, preguntas, corregidas, resultado y ajustes',malos.length===0,malos.slice(0,6).join(' | '));
  await cerrar(p);
}

await b.close();if(srv)srv.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length+' de '+res.length);
process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)});
