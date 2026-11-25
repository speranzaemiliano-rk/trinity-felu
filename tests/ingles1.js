// «English · 1.er grado» (carpeta ingles1/): inglés para un chico de 6-7 años, escribiendo y hablando.
// Cubre: que el CONTENIDO sea el pedido (las 12 partes del cuerpo con su traducción, los números del 1 al 10 —y hasta 20 como «más palabras»—, los días, los meses, la fecha con sus
// ordinales, el alfabeto con cómo se dice cada letra, los colores, los útiles del aula, saludos y consignas, el verbo to be, I like / I don't like, This is a… / It's a… y My name is…);
// que cada pregunta que arma el programa (todos los temas × todos los tipos, con y sin «más palabras») tenga UNA sola respuesta correcta y no repita opciones; el recorrido (inicio,
// cada tema, una ronda, un error y el segundo error —que deja la respuesta a la vista sin pasar sola—, la prueba escrita + oral); lo guardado (roto, bloqueado, con trampas);
// la parte ORAL: las reglas que deciden si lo que dijo vale (con el acento y las palabras que la IA oye parecidas), y el recorrido completo con un micrófono de mentira y la IA
// simulada (bien, mal, «casi», silencio, sin permiso, IA caída); la voz; que no se pida nada a otros sitios; y el DISEÑO: nada se sale ni se pisa ni se corta en 12 tamaños (de
// celular chico a compu, de pie y de costado), con letra grande, con movimiento reducido, y con contraste suficiente en claro y en oscuro.
// Se puede probar el sitio publicado:  URL=https://speranzaemiliano-rk.github.io/trinity-felu/ node tests/ingles1.js
// Con  RAPIDO=1  el diseño se mira sólo en un tamaño (iPhone 14) y el contraste sólo en claro.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const vm=require('vm');const os=require('os');
const RAIZ=path.resolve(__dirname,'..');
const RAPIDO=!!process.env.RAPIDO;
let BASE=process.env.URL||null,srv=null;   // sin URL: se levanta un servidor local con la carpeta del proyecto (un origen http de verdad)
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
const servir=()=>new Promise(ok=>{const sv=http.createServer((rq,rs)=>{
  let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);
  if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);return rs.end('no')}
  rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});rs.end(fs.readFileSync(f))});
  sv.listen(0,'127.0.0.1',()=>ok(sv))});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);
const leer=f=>fs.readFileSync(path.join(RAIZ,f),'utf8');
const pausa=ms=>new Promise(r=>setTimeout(r,ms));

// un WAV con algo parecido a una voz (armónicos con un vaivén, como sílabas) y después silencio: lo usa Chrome como «micrófono» de mentira
const hacerWav=(ruta,vozMs,silMs,amp,ruido,o)=>{   // amp: volumen de la voz (por defecto fuerte: .32) · ruido: ruido de fondo (amplitud) · o.desde: ms que pasan antes de la voz · o.rafaga: [desde ms, duración ms, amplitud] de un ruido corto
  amp=amp==null?.32:amp;ruido=ruido||0;o=o||{};let sem=12345;const rnd=()=>{sem=(sem*1664525+1013904223)>>>0;return sem/4294967296-.5};
  const SR=48000,n=Math.round(SR*((o.desde||0)+vozMs+silMs)/1000),v0=Math.round(SR*(o.desde||0)/1000),nv=Math.round(SR*vozMs/1000),b=Buffer.alloc(44+n*2);
  const [rd,rl,ra]=o.rafaga||[0,0,0],r0=Math.round(SR*rd/1000),nr=Math.round(SR*rl/1000);
  b.write('RIFF',0);b.writeUInt32LE(36+n*2,4);b.write('WAVE',8);b.write('fmt ',12);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);
  for(let i=0;i<n;i++){let v=ruido*2*rnd();if(i>=r0&&i<r0+nr)v+=ra*2*rnd();if(i>=v0&&i<v0+nv){const t=(i-v0)/SR,env=.5+.5*Math.sin(2*Math.PI*3.2*t);v+=amp*env*(Math.sin(2*Math.PI*140*t)+.6*Math.sin(2*Math.PI*280*t)+.35*Math.sin(2*Math.PI*560*t))/1.6}b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,v))*32767),44+i*2)}
  fs.writeFileSync(ruta,b);
};
const WAV_VOZ=path.join(os.tmpdir(),'ingles1_voz.wav'),WAV_SIL=path.join(os.tmpdir(),'ingles1_silencio.wav');
hacerWav(WAV_VOZ,1300,9000);hacerWav(WAV_SIL,0,9000);
const WAV_BAJA=path.join(os.tmpdir(),'ingles1_voz_baja.wav'),WAV_RUIDO=path.join(os.tmpdir(),'ingles1_ruido.wav');
hacerWav(WAV_BAJA,1300,9000,.02);hacerWav(WAV_RUIDO,0,9000,0,.004);   // una voz bajita (el micrófono la oye con un nivel de ≈ 0,01) y un cuarto con ruido de fondo y nadie hablando
const WAV_RAFAGA=path.join(os.tmpdir(),'ingles1_rafaga.wav'),WAV_RUIDO12=path.join(os.tmpdir(),'ingles1_ruido12.wav'),WAV_FUERTE=path.join(os.tmpdir(),'ingles1_voz_fuerte.wav');
hacerWav(WAV_RAFAGA,1300,9000,.1,0,{desde:2300,rafaga:[200,300,.012]});   // un ruido corto y bajito (300 ms) al abrir y la voz 2 s después
hacerWav(WAV_RUIDO12,1300,9000,.1,.012,{desde:2500});                       // ruido de fondo constante (el que despierta al control de volumen del navegador) y la voz a los 2,5 s
hacerWav(WAV_FUERTE,1300,9000,1);                                           // una voz tan fuerte que se recorta

// ---------- 1) los archivos y el contenido
const html=leer('ingles1/index.html');
chk('la página está en español, con viewport para celular, título, manifiesto, ícono y fuentes; se puede hacer zoom (sin «user-scalable=no»)',/<html lang="es">/.test(html)&&/name="viewport"/.test(html)&&!/user-scalable\s*=\s*no/.test(html)&&/<title>English · 1\.er grado<\/title>/.test(html)&&/rel="manifest"/.test(html)&&/rel="apple-touch-icon"/.test(html)&&/fonts\.googleapis\.com/.test(html));
const rutas=[...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>m[1]).filter(r=>!/^(https?:)?\/\//.test(r)&&!r.startsWith('data:'));
const rotas=rutas.filter(r=>!fs.existsSync(path.join(RAIZ,'ingles1',r.split('?')[0])));
chk('todo lo que la página nombra (scripts, estilos, manifiesto, íconos, la configuración de la IA) existe ('+rutas.length+' archivos)',rotas.length===0,j(rotas));
const orden=['firebase-config.js','audio/manifest.js','contenido.js','dibujos.js','oral.js','app.js'].map(f=>html.indexOf('src="'+(f==='firebase-config.js'?'../':'')+f));
chk('los scripts se cargan en el orden que necesitan (configuración de la IA, lista de audios, contenido, dibujos, oral y app)',orden.every((x,i)=>x>=0&&(i===0||x>orden[i-1])),j(orden));
chk('todas las páginas llevan la marca «?b=» de la versión en sus scripts y estilos (sin eso el navegador puede mezclar una página nueva con un script viejo)',[...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css))(\?[^"]*)?"/g)].filter(m=>!/^(https?:)?\/\/|^\.\.\//.test(m[1])).every(m=>/^\?b=[a-z0-9-]+$/.test(m[2]||'')));
const man=JSON.parse(leer('ingles1/manifest.json'));
const pngTam=f=>{const b=fs.readFileSync(path.join(RAIZ,'ingles1',f));return b.slice(1,4).toString()==='PNG'?[b.readUInt32BE(16),b.readUInt32BE(20)]:null};
chk('el manifiesto es propio (id /trinity-felu/ingles1/, alcance «../», inicio «./», en español, con íconos de 192 y 512 que existen y miden eso)',man.id==='/trinity-felu/ingles1/'&&man.scope==='../'&&man.start_url==='./'&&man.lang==='es'&&man.display==='standalone'&&j(pngTam('icon-192.png'))==='[192,192]'&&j(pngTam('icon-512.png'))==='[512,512]'&&man.icons.some(i=>i.purpose==='maskable')&&/English/.test(man.name),j(man));
const audioMan=leer('ingles1/audio/manifest.js'),listaAudio=JSON.parse((audioMan.match(/I1_AUDIO=(\[[\s\S]*?\]);/)||[])[1]||'null'),mp3s=fs.readdirSync(path.join(RAIZ,'ingles1/audio')).filter(f=>/\.mp3$/.test(f)).map(f=>f.replace(/\.mp3$/,''));
chk('la lista de audios grabados (audio/manifest.js) y los mp3 de la carpeta son exactamente los mismos ('+mp3s.length+'; mientras no haya, habla la voz del aparato)',Array.isArray(listaAudio)&&listaAudio.length===mp3s.length&&listaAudio.every(k=>mp3s.includes(k)));

const sb={window:{}};vm.createContext(sb);vm.runInContext(leer('ingles1/contenido.js'),sb);
const I1=sb.window.I1,TM=id=>I1.TEMA[id];
chk('hay 11 temas, en este orden: saludos, cuerpo, números, días, meses, fecha, alfabeto, colores, aula, yo y frases',j(I1.TEMAS.map(t=>t.id))===j(['saludos','cuerpo','numeros','dias','meses','fecha','abc','colores','aula','yo','frases']));
const CUERPO={head:'cabeza',eyes:'ojos',nose:'nariz',mouth:'boca',ears:'orejas',hands:'manos',arms:'brazos',legs:'piernas',feet:'pies',fingers:'dedos',toes:'deditos de los pies',body:'cuerpo'};
chk('El cuerpo: las 12 palabras de la tabla pedida, cada una con su traducción (head/cabeza … toes/deditos de los pies, body/cuerpo)',TM('cuerpo').items.length===12&&Object.entries(CUERPO).every(([en,es])=>TM('cuerpo').items.some(x=>x.en===en&&x.es===es)));
chk('Números: del 1 al 10 siempre (one … ten) y del 11 al 20 como «más palabras» (extra), con su traducción',TM('numeros').items.length===20&&TM('numeros').items.every((x,i)=>x.n===i+1&&x.en===I1.NUM_EN[i+1]&&x.es&&x.extra===(i+1>10))&&j(TM('numeros').items.slice(0,10).map(x=>x.en))===j(['one','two','three','four','five','six','seven','eight','nine','ten']));
chk('Días: Monday … Sunday (lunes … domingo), en orden',j(TM('dias').items.map(x=>[x.en,x.es]))===j([['Monday','lunes'],['Tuesday','martes'],['Wednesday','miércoles'],['Thursday','jueves'],['Friday','viernes'],['Saturday','sábado'],['Sunday','domingo']]));
chk('Meses: January … December (enero … diciembre), en orden',j(TM('meses').items.map(x=>[x.en,x.es]))===j([['January','enero'],['February','febrero'],['March','marzo'],['April','abril'],['May','mayo'],['June','junio'],['July','julio'],['August','agosto'],['September','septiembre'],['October','octubre'],['November','noviembre'],['December','diciembre']]));
const ORD=['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth','thirteenth','fourteenth','fifteenth','sixteenth','seventeenth','eighteenth','nineteenth','twentieth','twenty-first','twenty-second','twenty-third','twenty-fourth','twenty-fifth','twenty-sixth','twenty-seventh','twenty-eighth','twenty-ninth','thirtieth','thirty-first'];
chk('La fecha: los 31 ordinales (1st … 31st) bien escritos y bien dichos; del 1 al 10 siempre y del 11 al 31 como «más palabras»',TM('fecha').items.length===31&&TM('fecha').items.every((x,i)=>x.n===i+1&&x.say===ORD[i]&&x.en===I1.ordNum(i+1)&&x.extra===(i+1>10))&&[1,2,3,4,11,12,13,21,22,23,30,31].map(n=>I1.ordNum(n)).join(' ')==='1st 2nd 3rd 4th 11th 12th 13th 21st 22nd 23rd 30th 31st');
const NOM_LETRAS='ay bee see dee ee eff jee aitch eye jay kay el em en oh pee cue ar ess tee you vee double-you ex why zed'.split(' ');
chk('Alfabeto: las 26 letras (A–Z) con el nombre en inglés de cada una y una palabra de ejemplo que empieza con esa letra (la X, con «box»)',TM('abc').items.length===26&&TM('abc').items.every((x,i)=>x.en===String.fromCharCode(65+i)&&x.say.replace(' ','-')===NOM_LETRAS[i]&&x.ej&&x.ej.e&&(x.en==='X'?/x/i.test(x.ej.en):x.ej.en[0].toUpperCase()===x.en)),j(TM('abc').items.filter((x,i)=>!(x.en===String.fromCharCode(65+i)&&x.ej&&(x.en==='X'?/x/i.test(x.ej.en):x.ej.en[0].toUpperCase()===x.en))).map(x=>x.en)));
chk('Colores: red, blue, green, yellow (y orange, pink, purple, black, white, brown) cada uno con su color real',['red','blue','green','yellow','orange','pink','purple','black','white','brown'].every(c=>TM('colores').items.some(x=>x.en===c&&x.es&&x.p.c&&/^#[0-9a-f]{6}$/i.test(x.p.c))));
chk('Objetos del aula: book, pencil, chair, desk, board (y más como «más palabras»), con dibujo y traducción',['book','pencil','chair','desk','board'].every(c=>TM('aula').items.some(x=>x.en===c&&x.es&&x.p&&!x.extra))&&TM('aula').items.filter(x=>x.extra).length>=4);
chk('Saludos y rutinas: Hello, Goodbye, Good morning, Sit down, Stand up, Open your book, Close your book',['Hello','Goodbye','Good morning','Sit down','Stand up','Open your book','Close your book'].every(c=>TM('saludos').items.some(x=>x.en===c&&x.es&&!x.extra)));
const VERBO={I:'am',You:'are',He:'is',She:'is',It:'is',We:'are',They:'are'};
const tobe=I1.PAT.tobe;
chk('Verbo to be: frases con I am, you are, he is, she is, it is; cada hueco se completa con UNA sola forma (am / is / are) y la oración queda bien en inglés',tobe.length>=8&&['I','You','He','She','It'].every(s=>tobe.some(p=>p.f.startsWith(s+' ')))&&tobe.every(p=>VERBO[p.f.split(' ')[0]]===p.ok&&p.f.includes('___')&&p.es&&p.p));
chk('«My name is…», «I\'m six years old», «How are you?»: el tema «Yo» tiene nombre, edad y estado, y cada respuesta correcta es la única que contesta bien',I1.PAT.yo.length>=6&&['What\'s your name?','How old are you?','How are you?'].every(q=>I1.PAT.yo.some(p=>p.q===q))&&I1.PAT.yo.every(p=>p.mal.length===3&&!p.mal.includes(p.ok)&&new Set([p.ok].concat(p.mal)).size===4)&&I1.PAT.edad.includes(6));
const GU=I1.GUSTOS;chk('I like / I don\'t like y This is a… / It\'s a…: hay cosas para gustar (comida, animales) y cosas para señalar, todas con dibujo',GU.length>=8&&GU.every(x=>x.p&&x.p.e&&x.en)&&I1.PAT.armarfrase.some(p=>/^I like/.test(p.f))&&I1.PAT.armarfrase.some(p=>/^This is a/.test(p.f)));
chk('ningún tema repite una palabra, ni un dibujo (cada dibujo es de UNA sola palabra: si no, una pregunta «mirá y elegí» tendría dos respuestas)',I1.TEMAS.every(t=>{const en=t.items.map(x=>x.en),ps=t.items.map(x=>j(x.p));return new Set(en).size===en.length&&new Set(ps).size===ps.length}),j(I1.TEMAS.filter(t=>{const ps=t.items.map(x=>j(x.p));return new Set(ps).size!==ps.length}).map(t=>t.id)));
chk('todas las palabras tienen traducción, dibujo, el texto que se dice y su clave de audio (en_…)',I1.TEMAS.every(t=>t.items.every(x=>x.es&&x.p&&x.say&&/^en_[a-z0-9-]+$/.test(x.k)&&I1.audio[x.k]===x.say)));
const pares=I1.AMB.filter(([a,b])=>!(I1.ITEM[a]&&I1.ITEM[b]));
chk('las parejas que no se muestran juntas (hello/hi, pen/pencil…) son palabras que existen',pares.length===0,j(pares));
chk('cada tipo de pregunta tiene su consigna en inglés y su ayuda en castellano, y las frases de ánimo son varias',[...new Set(I1.TEMAS.flatMap(t=>t.esc))].every(t=>I1.CONSIGNA[t]&&I1.CONSIGNA[t].length===2&&I1.CONSIGNA[t].every(s=>s&&s.length>3))&&I1.BIEN.length>=5&&I1.PROBA.length>=2&&I1.CASI.length>=2);

(async()=>{
if(!BASE){srv=await servir();BASE='http://127.0.0.1:'+srv.address().port+'/'}
const ARGS=['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'];
const b=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_VOZ+'%noloop'])});
const bSil=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_SIL+'%noloop'])});
const bBaja=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_BAJA+'%noloop'])});
const bRuido=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_RUIDO+'%noloop'])});
const bRafaga=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_RAFAGA+'%noloop'])});
const bRuido12=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_RUIDO12+'%noloop'])});
const bFuerte=await chromium.launch({args:ARGS.concat(['--use-file-for-fake-audio-capture='+WAV_FUERTE+'%noloop'])});

// ---------- utilidades de página
// o: {vp, oscuro, rm (movimiento reducido), rapido (sin esperas: __I1_SIN_ESPERA), estado (lo guardado), bloquear (localStorage que falla), sinMic (permiso denegado), micDesde (n: el permiso se da pero desde la n-ésima apertura el micrófono se niega), silencio (micrófono mudo), nav (otro navegador: voz bajita, ruido…), sinAGC (sin el control automático de volumen del navegador: como un iPhone), sinIr}
const abrir=async(o={})=>{
  const ctx=await (o.nav||(o.silencio?bSil:b)).newContext({viewport:o.vp||{width:390,height:844},hasTouch:true,deviceScaleFactor:1,colorScheme:o.oscuro?'dark':'light',reducedMotion:o.rm?'reduce':'no-preference',serviceWorkers:'block',permissions:['microphone']});
  const p=await ctx.newPage();p.errs=[];p.externos=[];p.ctx=ctx;
  const propio=new URL(BASE).hostname;
  await ctx.route(u=>u.hostname!==propio&&!/^(127\.0\.0\.1|localhost)$/.test(u.hostname),r=>{p.externos.push(new URL(r.request().url()).hostname);r.abort()});
  p.on('pageerror',e=>{p.errs.push('pageerror: '+e.message);console.log('   [error de la página]',e.message.slice(0,200))});
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_FAILED/i.test(m.text())){p.errs.push('console: '+m.text());console.log('   [consola]',m.text().slice(0,200))}});
  await ctx.addInitScript(({rapido,estado,bloquear,sinMic,sinAGC,micDesde,micError})=>{
    window.__dichos=[];if(rapido)window.__I1_SIN_ESPERA=true;
    if(sinAGC&&navigator.mediaDevices){const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=c=>{if(c&&c.audio&&typeof c.audio==='object')c.audio.autoGainControl=false;return g(c)}}
    const s=window.speechSynthesis;if(s){s.speak=u=>{if(u.volume!==0)window.__dichos.push(u.text);setTimeout(()=>{try{u.onstart&&u.onstart({});u.onend&&u.onend({})}catch(e){}},5)};s.cancel=()=>{};s.getVoices=()=>[]}
    if(bloquear)Object.defineProperty(window,'localStorage',{get(){throw new Error('bloqueado')}});
    else if(estado!==undefined&&!sessionStorage.getItem('__sem')){try{localStorage.setItem('ingles1_estado',estado);sessionStorage.setItem('__sem','1')}catch(e){}}
    if(sinMic&&navigator.mediaDevices)navigator.mediaDevices.getUserMedia=()=>Promise.reject(Object.assign(new Error('Permission denied'),{name:'NotAllowedError'}));
    if(micDesde&&navigator.mediaDevices){const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);let n=0;navigator.mediaDevices.getUserMedia=c=>{n++;return n>=micDesde?Promise.reject(Object.assign(new Error('mic negado'),{name:micError||'NotAllowedError'})):g(c)}}   // (el permiso se da al empezar y después el aparato no deja abrir el micrófono solo)
  },{rapido:!!o.rapido,estado:o.estado,bloquear:!!o.bloquear,sinMic:!!o.sinMic,sinAGC:!!o.sinAGC,micDesde:o.micDesde||0,micError:o.micError||''});
  if(!o.sinIr){await p.goto(BASE+'ingles1/');await p.waitForSelector('#pInicio .tema',{timeout:15000})}
  return p;
};
const MANUAL=JSON.stringify({v:1,auto:false});   // el estado guardado de quien conversa TOCANDO el micrófono (las pruebas de a mano; por defecto la conversación es manos libres)
const cerrar=async p=>{await p.ctx.close()};
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&e.getBoundingClientRect().width>0},sel);
const textoVisible=p=>p.evaluate(()=>{const e=document.querySelector('.pantalla:not([hidden])');return e?e.innerText:''});

// contesta la pregunta que está en pantalla. bien=false: la contesta mal hasta que se cierra (en la prueba alcanza con una vez; al practicar el primer error sólo pide «Try again!»)
const responder=async(p,bien,prueba)=>{
  const q=await p.evaluate(()=>{const r=I1_T.ronda(),q=r.qs[r.i];return {tipo:q.tipo,ops:q.ops&&q.ops.map(o=>!!o.ok),w:q.w,dados:q.dados,sol:q.sol,pares:q.pares&&q.pares.map(x=>x.id),parte:q.parte,sub:q.sub}});
  const vecesMal=prueba?1:2;
  if(q.tipo==='mc'){
    if(bien)await p.click('#area .op[data-i="'+q.ops.findIndex(x=>x)+'"]');
    else{const mal=q.ops.map((o,i)=>o?-1:i).filter(i=>i>=0);for(let k=0;k<Math.min(vecesMal,mal.length);k++){if(!await visible(p,'#area .op[data-i="'+mal[k]+'"]'))break;await p.click('#area .op[data-i="'+mal[k]+'"]')}}
  }else if(q.tipo==='armar'){
    const need=q.w.slice(q.dados).split('');
    const llenar=async letras=>{for(const c of letras){const idx=await p.evaluate(c=>[...document.querySelectorAll('#banco .ficha')].findIndex(f=>!f.disabled&&f.textContent===c),c);if(idx<0)return;await p.click('#banco .ficha:nth-child('+(idx+1)+')')}};
    if(bien)await llenar(need);
    else{let mal=need.slice(1).concat(need[0]);if(mal.join('')===need.join(''))mal=need.slice().reverse();
      for(let k=0;k<vecesMal;k++){await llenar(mal);if(k<vecesMal-1)await p.waitForFunction(()=>!document.querySelector('#slots .slot.puesta:not(.dado)'),null,{timeout:4000}).catch(()=>{})}}
  }else if(q.tipo==='ordenar'){
    const orden=bien?q.sol:q.sol.slice().reverse();
    for(let k=0;k<(bien?1:vecesMal);k++){for(const id of orden)await p.click('#banco .ficha[data-id="'+id+'"]:not(:disabled)').catch(()=>{});if(!bien&&k<vecesMal-1)await p.waitForFunction(()=>!document.querySelector('#ofila .hueco-o.puesta'),null,{timeout:4000}).catch(()=>{})}
  }else if(q.tipo==='unir'){
    if(!bien&&prueba){for(const [a,b] of [[0,1],[1,0],[2,2],[3,3]]){await p.click('.u-i[data-id="'+q.pares[a]+'"]');await p.click('.u-d[data-id="'+q.pares[b]+'"]')}}
    else{
      if(!bien){await p.click('.u-i[data-id="'+q.pares[0]+'"]');await p.click('.u-d[data-id="'+q.pares[1]+'"]');await p.click('.u-i[data-id="'+q.pares[0]+'"]');await p.click('.u-d[data-id="'+q.pares[1]+'"]')}
      for(const id of q.pares){await p.click('.u-i[data-id="'+id+'"]');await p.click('.u-d[data-id="'+id+'"]')}}
  }else if(q.tipo==='parte'){
    const otra=await p.evaluate(pt=>I1.PARTES.find(x=>x!==pt),q.parte);
    const tocar=pt=>p.evaluate(pt=>document.querySelector('#pPreg .hit[data-parte="'+pt+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true})),pt);
    if(bien)await tocar(q.parte);else for(let k=0;k<vecesMal;k++)await tocar(otra);
  }
  return q.tipo;
};
// juega todas las preguntas de la ronda (patron: i → bien o mal)
const jugar=async(p,patron,prueba)=>{
  const n=await p.evaluate(()=>I1_T.ronda().qs.length),tipos=[];
  for(let i=0;i<n;i++){
    await p.waitForFunction(i=>{const r=I1_T.ronda();return r&&r.i===i&&document.querySelector('#pPreg .preg')&&!document.querySelector('#pPreg').hidden},i,{timeout:8000});
    tipos.push(await responder(p,patron(i),prueba));
    await p.waitForFunction(i=>{const r=I1_T.ronda();return !r||r.i>i},i,{timeout:8000});
  }
  return tipos;
};

// ---------- 2) lo que decide si lo que dijo vale (con el acento de un chico y lo que la IA oye parecido)
{
const p=await abrir({rapido:true});
const SER={contar5:{lista:['one','two','three','four','five'],min:5,casi:3},contar10:{lista:['one','two','three','four','five','six','seven','eight','nine','ten'],min:10,casi:6},dias:{lista:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],min:6,casi:4},
  meses:{lista:['January','February','March','April','May','June','July','August','September','October','November','December'],min:10,casi:6}};
const NUMS=['one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'],ID=x=>NUMS.includes(x)?'n'+(NUMS.indexOf(x)+1):/^[A-Z]$/.test(x)?'l'+x:x;   // (los números y las letras se llaman n3, lC…)
const P=(it,dijo,esp)=>[{k:'palabra',it:ID(it)},dijo,esp],S=(s,dijo,esp)=>[Object.assign({k:'serie'},SER[s]),dijo,esp],A=(de,dijo,esp,x)=>[Object.assign({k:'abierta',de},x||{}),dijo,esp],F=(frase,dijo,esp)=>[{k:'frase',frase},dijo,esp],D=(dia,n,dijo,esp)=>[{k:'fecha',dia,n},dijo,esp];
const CASOS=[
  // palabras sueltas: la forma de decirlas y lo que la IA suele escribir
  P('red','red','ok'),P('red','Red.','ok'),P('red',"it's red",'ok'),P('red','its red','ok'),P('red','a red','ok'),P('red','read','ok'),P('red','yes red please','ok'),P('red','blue','no'),P('red','','no'),P('red','rad','casi'),P('red','bed','casi'),P('red','hello how are you today my friend red','no'),
  P('blue','blue','ok'),P('blue','blu','ok'),P('blue','green','no'),P('green','grin','ok'),P('yellow','yelow','ok'),P('yellow','yellow yellow','ok'),P('purple','purpel','casi'),P('grey','gray','ok'),P('orange','oranje','ok'),
  P('three','three','ok'),P('three','tree','ok'),P('three','free','ok'),P('three','3','ok'),P('three','thre','casi'),P('three','two','no'),P('three','tree three','ok'),
  P('two','two','ok'),P('two','to','ok'),P('two','too','ok'),P('two','2','ok'),P('two','ten','no'),P('four','for','ok'),P('four','4','ok'),P('four','five','no'),P('one','won','ok'),P('one','1','ok'),P('eight','ate','ok'),P('eight','8','ok'),P('six','six','ok'),P('ten','10','ok'),P('twenty','20','ok'),
  P('A','A','ok'),P('A','ay','ok'),P('A','eh','ok'),P('A','letter a','ok'),P('A','b','no'),P('C','see','ok'),P('C','sea','ok'),P('C','c','ok'),P('B','bee','ok'),P('B','be','ok'),P('G','jee','ok'),P('G','gee','ok'),P('J','jay','ok'),P('W','double you','ok'),P('W','double u','ok'),P('Q','cue','ok'),P('Q','queue','ok'),P('Y','why','ok'),P('Z','zed','ok'),P('Z','zee','ok'),P('I','eye','ok'),P('O','oh','ok'),
  P('eyes','eyes','ok'),P('eyes','eye','ok'),P('feet','foot','ok'),P('head','my head','ok'),P('head','the head','ok'),P('nose','nose','ok'),P('nose','knows','no'),P('toes','toes','ok'),P('mouth','mout','casi'),
  P('book','a book',"ok"),P('pencil','pensil','ok'),P('pencil','pen','no'),P('chair','chair','ok'),P('chair','desk','no'),P('desk','desk','ok'),P('board','board','ok'),P('crayons','crayon','ok'),
  P('morning','good morning','ok'),P('morning','morning','ok'),P('morning','good mornin','ok'),P('morning','good','casi'),P('morning','hello','no'),P('sit','sit down','ok'),P('sit','sit','casi'),P('sit','stand up','no'),P('open','open your book','ok'),P('open','open book','casi'),P('open','open','no'),P('open','close your book','casi'),P('hello','hello','ok'),P('hello','hi','no'),
  P('d1','monday','ok'),P('d1','today is sunday','no'),P('d1','today is monday','ok'),P('d3','it is tuesday','no'),P('d1','mondey','ok'),P('d1',"it's monday",'ok'),P('d1','tuesday','no'),P('d3','wednesday','ok'),P('m6','june','ok'),P('m5','may','ok'),P('o5','fifth','ok'),P('o5','5th','ok'),P('o5','five','ok'),P('o3','third','ok'),P('o3','second','no'),
  // contar y decir series
  S('contar5','one two three four five','ok'),S('contar5','1 2 3 4 5','ok'),S('contar5','one, two, three, for, five','ok'),S('contar5','one two tree four five','ok'),S('contar5','one two three','casi'),S('contar5','one two','no'),S('contar5','five four three two one','no'),S('contar5','','no'),
  S('contar10','one two three four five six seven eight nine ten','ok'),S('contar10','1 2 3 4 5 6 7 8 9 10','ok'),S('contar10','one two three four five six seven','casi'),S('contar10','one two three','no'),
  S('dias','monday tuesday wednesday thursday friday saturday sunday','ok'),S('dias','Monday, Tuesday, Wednesday, Thursday, Friday, Saturday','ok'),S('dias','monday tuesday wednesday thursday','casi'),S('dias','monday tuesday','no'),S('dias','mon day tues day wednesday thursday friday saturday sun day','ok'),S('dias','sunday saturday friday','no'),
  S('meses','january february march april may june july august september october november december','ok'),S('meses','january february march april may june july august september october','ok'),S('meses','january february march april may june july','casi'),S('meses','january february march','no'),
  // la fecha
  D('monday',5,'today is tuesday the fifth','casi'),D('monday',5,'today is the fifth','casi'),D('monday',5,'today is sunday the fifth','casi'),D('monday',5,'monday the twenty fifth','casi'),D('monday',1,'monday the thirty first','casi'),D('monday',3,'monday twenty third','casi'),D('monday',5,'monday the fifth','ok'),D('monday',5,'mondey the 5th','ok'),D('friday',25,'friday the twenty-fifth','ok'),
  D('monday',5,'today is monday the fifth','ok'),D('monday',5,'monday the 5th','ok'),D('monday',5,'monday five','ok'),D('monday',5,"it's monday 5",'ok'),D('monday',5,'monday','casi'),D('monday',5,'the fifth','casi'),D('monday',5,'tuesday the fifth','casi'),D('monday',5,'friday the third','no'),D('friday',25,'today is friday the twenty fifth','ok'),D('friday',25,'friday the 25th','ok'),D('friday',25,'','no'),
  // datos personales
  A('nombre',"My name's Ana",'ok'),A('nombre','I am six','no'),A('nombre','I am fine','no'),A('nombre','Hello','no'),A('nombre','yes','no'),A('nombre','red','no'),A('nombre','my name is six','no'),
  A('nombre','my name is Ana','ok'),A('nombre','My name is Tom.','ok'),A('nombre',"I'm Ana",'ok'),A('nombre','I am Lia','ok'),A('nombre','name is max','ok'),A('nombre','Ana','casi'),A('nombre','my name is','no'),A('nombre','','no'),
  A('edad',"I'm six",'ok'),A('edad','I am six years old','ok'),A('edad','six years old','ok'),A('edad','six','casi'),A('edad','6','casi'),A('edad',"I'm seven",'ok'),A('edad',"I'm fine",'no'),A('edad','I am twenty','no'),A('edad','','no'),
  A('estado',"I'm fine thank you",'ok'),A('estado','fine','casi'),A('estado','I am good','ok'),A('estado','very well thank you','ok'),A('estado',"i'm tired",'ok'),A('estado','hello','no'),A('estado','','no'),
  A('gusto','I do','ok',{cosa:'pizza'}),A('gusto',"I don't",'ok',{cosa:'pizza'}),A('gusto',"I don't know",'no',{cosa:'pizza'}),A('gusto',"I don't understand",'no',{cosa:'pizza'}),A('gusto','no I do','casi',{cosa:'pizza'}),A('gusto','yes I like pizza please','ok',{cosa:'pizza'}),
  A('gusto','yes I do','ok',{cosa:'pizza'}),A('gusto','yes I like pizza','ok',{cosa:'pizza'}),A('gusto',"no I don't",'ok',{cosa:'pizza'}),A('gusto','no I dont like pizza','ok',{cosa:'pizza'}),A('gusto','I like pizza','ok',{cosa:'pizza'}),A('gusto',"I don't like pizza",'ok',{cosa:'pizza'}),A('gusto','yes','casi',{cosa:'pizza'}),A('gusto','no','casi',{cosa:'pizza'}),A('gusto','yes no','no',{cosa:'pizza'}),A('gusto',"yes I don't",'casi',{cosa:'pizza'}),A('gusto','maybe','no',{cosa:'pizza'}),
  // una frase entera
  F('I am six.',"I'm six",'ok'),F('It is a cat.',"it's a cat",'ok'),F('He is a boy.',"he's a boy",'ok'),F('Hello, I am Ana.',"hello I'm Ana",'ok'),F('She is a girl.',"she's a girl",'ok'),
  F('I like pizza.','I like pizza','ok'),F('I like pizza.','i like','casi'),F('I like pizza.','pizza','no'),F('I like pizza.','','no'),F('He is a boy.','he is boy','ok'),F('He is a boy.','she is a boy','casi'),F('He is a boy.','he is a boy','ok'),F('This is a pencil.','this is a pencil','ok'),F('This is a pencil.','this is a pen','casi'),F('Hello, I am Ana.','hello I am Ana','ok'),F('Hello, I am Ana.','hello i am','casi'),F('Today is Monday.','today is monday','ok'),F('Today is Monday.','today is tuesday','casi'),F('I am six.','I am 6','ok')
];
const malos=await p.evaluate(({casos,AMB})=>{
  const out=[];
  casos.forEach(([ev,dijo,esp])=>{const e=Object.assign({},ev);if(e.it){e.acepta=I1.oral.aceptaDe(I1.ITEM[e.it]);delete e.it}
    const r=I1.oral.evaluar(e,dijo,I1_T.estado());if(r.res!==esp)out.push(JSON.stringify([ev.it||ev.k+':'+(ev.de||ev.dia||ev.frase||ev.lista&&ev.lista[0]),dijo,'esperaba '+esp,'dio '+r.res]))});
  return out;
},{casos:CASOS,AMB:0});
chk('el evaluador oral: '+CASOS.length+' casos (palabras con acento, letras con su nombre, números en cifras, series, fecha, nombre, edad, estado, gustos y frases) dan lo esperado',malos.length===0,malos.slice(0,12).join('\n   '));
const cosas=await p.evaluate(()=>{
  const O=I1.oral,out=[];
  const todo=Object.keys(I1.ITEM).map(k=>I1.ITEM[k]);
  // cada palabra, dicha tal cual, tiene que valer; y dicha como otra palabra del mismo tema, no
  todo.forEach(it=>{const ev={k:'palabra',acepta:O.aceptaDe(it)};if(O.evaluar(ev,it.say).res!=='ok')out.push('no vale su propia voz: '+it.id+' «'+it.say+'»');
    if(it.en!==it.say&&O.evaluar(ev,it.en).res!=='ok'&&!/^l[A-Z]$|^o\d+$/.test(it.id))out.push('no vale su escritura: '+it.id+' «'+it.en+'»')});
  I1.TEMAS.forEach(t=>{if(t.id==='abc'||t.id==='fecha')return;t.items.forEach(a=>t.items.forEach(c=>{if(a===c||I1.ambiguos(a.id,c.id))return;const ev={k:'palabra',acepta:O.aceptaDe(a)};const r=O.evaluar(ev,c.say).res;if(r==='ok')out.push('se confunde '+c.say+' con '+a.say)}))});
  return out;
});
chk('cada palabra del programa vale cuando se la dice bien y NO vale cuando se dice otra palabra del mismo tema ('+'sin falsos aciertos)',cosas.length===0,cosas.slice(0,8).join(' | '));
chk('el evaluador no se rompe con basura: vacío, números raros, símbolos, textos larguísimos, objetos',await p.evaluate(()=>{const O=I1.oral,evs=[{k:'palabra',acepta:['red']},{k:'serie',lista:['one','two'],min:2,casi:1},{k:'fecha',dia:'monday',n:5},{k:'abierta',de:'nombre'},{k:'frase',frase:'I like pizza.'},{k:'rara'},null,{}];
  const malos=['',' ','???','123456789','😀😀😀','a'.repeat(5000),'<script>alert(1)</script>',null,undefined,{},[],NaN,0,'\n\t'];
  try{return evs.every(ev=>malos.every(m=>{const r=O.evaluar(ev,m);return r&&['ok','casi','no'].includes(r.res)&&typeof r.dijo==='string'}))}catch(e){return false}}));
await cerrar(p);
}

// ---------- 3) las preguntas que arma el programa (todos los temas × todos los tipos, con y sin «más palabras»): una sola respuesta correcta, sin opciones repetidas
{
const p=await abrir({rapido:true});
const fallas=await p.evaluate(()=>{
  const bad=[],ST=I1_T.estado(),ID=/^[a-z][a-z0-9:_-]{0,23}$/i;
  const ids=new Set(Object.keys(I1.ITEM).concat(Object.keys(I1.PATID),['nm','edad']));I1.GUSTOS.forEach(x=>{ids.add(x.id);ids.add('g-'+x.id)});
  const sano=s=>!/undefined|NaN|\[object|\bnull\b/.test(String(s));
  let total=0;const porTipo={};
  const ver=(q,et)=>{
    total++;porTipo[et]=(porTipo[et]||0)+1;
    if(!(Array.isArray(q.cons)&&q.cons.length===2&&q.cons.every(s=>typeof s==='string'&&s.length>3)))bad.push(et+': consigna rara '+JSON.stringify(q.cons));
    if(!(Array.isArray(q.ids)&&q.ids.length&&q.ids.every(i=>ID.test(i)&&ids.has(i))))bad.push(et+': ids raros '+JSON.stringify(q.ids));
    if(!sano((q.cuerpo||'')+q.cons.join(' ')+(q.mostrar||'')+JSON.stringify(q.hablar||[])))bad.push(et+': texto con «undefined»/«NaN»/«[object»');
    if(typeof q.mostrar!=='string'||!q.mostrar)bad.push(et+': sin «mostrar»');
    if(q.tema!=='abc'){   // gramática: «a/an» bien puestos y sin plurales con «a»
      const txts=[q.mostrar,q.cons[0]].concat((q.ops||[]).map(o=>o.aria),q.hablar||[],[String(q.cuerpo||'').replace(/<[^>]*>/g,' ')]).filter(x=>typeof x==='string');
      txts.forEach(x=>{if(/\b[Aa] [aeiouAEIOU]\w/.test(x)&&!/\ba u(se|nit)\b/i.test(x))bad.push(et+': «a» delante de vocal en «'+x.slice(0,50)+'»');
        if(/\b[Aa]n [bcdfgjklmnpqrstvwxyzBCDFGJKLMNPQRSTVWXYZ]\w/.test(x))bad.push(et+': «an» delante de consonante en «'+x.slice(0,50)+'»');
        if(/\b(It's|This is|that is) an? (crayons|scissors|eyes|ears|hands|arms|legs|feet|fingers|toes)\b/i.test(x))bad.push(et+': plural con «a/an» en «'+x.slice(0,50)+'»')})}
    if(!Array.isArray(q.hablar)||q.hablar.some(x=>typeof x!=='string'||!x))bad.push(et+': hablar raro');
    if(q.tipo==='mc'){
      if(!(q.ops.length>=2&&q.ops.length<=4))bad.push(et+': '+q.ops.length+' opciones');
      if(q.ops.filter(o=>o.ok).length!==1)bad.push(et+': '+q.ops.filter(o=>o.ok).length+' correctas');
      if(new Set(q.ops.map(o=>o.aria)).size!==q.ops.length||new Set(q.ops.map(o=>o.h)).size!==q.ops.length)bad.push(et+': opciones repetidas '+JSON.stringify(q.ops.map(o=>o.aria)));
      if(q.ops.some(o=>!o.h||!o.aria))bad.push(et+': opción vacía');
    }else if(q.tipo==='armar'){
      const need=q.w.slice(q.dados).split(''),pool=q.fichas.slice();
      if(!/^[A-Z]+$/.test(q.w)||q.dados>=q.w.length)bad.push(et+': palabra rara '+q.w+' dados '+q.dados);
      for(const c of need){const i=pool.indexOf(c);if(i<0){bad.push(et+': falta la letra '+c+' de '+q.w);break}pool.splice(i,1)}
    }else if(q.tipo==='ordenar'){
      const fi=q.fichas.map(f=>f.id);
      if(q.sol.length<2||new Set(q.sol).size!==q.sol.length||fi.length!==q.sol.length||!q.sol.every(i=>fi.includes(i))||q.fichas.some(f=>!f.h))bad.push(et+': ordenar roto '+JSON.stringify(q.sol));
    }else if(q.tipo==='unir'){
      if(q.pares.length!==4||new Set(q.pares.map(x=>x.id)).size!==4||new Set(q.pares.map(x=>x.der)).size!==4||new Set(q.pares.map(x=>x.izq)).size!==4)bad.push(et+': unir roto');
    }else if(q.tipo==='parte'){
      if(!I1.PARTES.includes(q.parte))bad.push(et+': parte rara '+q.parte);
    }else if(q.tipo==='oral'){
      const e=q.ev;if(!['palabra','serie','fecha','abierta','frase'].includes(e.k))bad.push(et+': evaluación rara '+e.k);
      if(e.k==='palabra'&&!(Array.isArray(e.acepta)&&e.acepta.length&&e.acepta.every(x=>typeof x==='string'&&x)))bad.push(et+': sin respuestas válidas');
      if(e.k==='serie'&&!(e.lista.length>=e.min&&e.min>=e.casi&&e.casi>0))bad.push(et+': serie rara');
      if(e.k==='frase'&&!e.frase)bad.push(et+': frase vacía');
      const dich=q.dire||q.mostrar;if(/[·\/…]/.test(dich))bad.push(et+': lo que se dice de la respuesta tiene símbolos «'+dich+'»');
      if(q.sub==='fecha'&&!(q.ids[0]==='o'+e.n&&(ST.extra||e.n<=10)))bad.push(et+': la fecha pide un ordinal que no se estudia o acredita otro ('+q.ids+' / '+e.n+')');
    }else bad.push(et+': tipo desconocido '+q.tipo);
    if(q.tipo!=='oral'){const hab=q.refuerzo||(q.hablar&&q.hablar[0])||q.mostrar;if(/ [·\/] /.test(hab))bad.push(et+': lo que se dice al mostrar la respuesta tiene símbolos «'+hab+'»')}
  };
  for(const extra of [false,true]){ST.extra=extra;
    for(const modo of ['escrito','oral']){
      for(const t of I1.TEMAS){
        const tipos=modo==='oral'?t.ora:t.esc,G=modo==='oral'?I1_T.ORAL:I1_T.GEN;
        for(const tp of tipos){
          const its=t.items.length?I1_T.itemsDe(t):[null];let n=0;const et=modo+' '+t.id+'/'+tp+(extra?' +extra':'');
          for(const it of its)for(let k=0;k<4;k++){let q=null;try{q=G[tp](t,it)}catch(e){bad.push(et+': lanzó '+e.message);continue}if(!q)continue;n++;ver(q,et)}
          if(!n)bad.push(et+': no arma ninguna pregunta');
        }}}}
  ST.extra=false;
  return {bad,total,tipos:Object.keys(porTipo).length};
});
chk('todas las preguntas que arma el programa ('+fallas.total+', de '+fallas.tipos+' combinaciones tema × tipo, escritas y orales, con y sin «más palabras») tienen UNA sola respuesta correcta, opciones distintas, letras suficientes y textos sanos',fallas.bad.length===0&&fallas.total>500,fallas.bad.slice(0,6).join('\n   ')+' ('+fallas.bad.length+')');
// las rondas reales: no repiten pregunta, usan todos los temas, no mezclan «más palabras» si no se prendieron
const rondas=await p.evaluate(()=>{
  const bad=[],ST=I1_T.estado();ST.extra=false;
  for(const t of I1.TEMAS)for(const modo of ['escrito','oral']){
    if(!(modo==='oral'?t.ora:t.esc).length)continue;
    for(let k=0;k<12;k++){const qs=I1_T.armarRonda(modo,t.id,modo==='oral'?5:6),cl=qs.map(q=>q.gen+'|'+q.ids.join(','));
      if(!qs.length)bad.push('ronda vacía '+modo+' '+t.id);if(new Set(cl).size!==cl.length)bad.push('repite pregunta '+modo+' '+t.id);
      qs.forEach(q=>q.ids.forEach(i=>{const x=I1.ITEM[i];if(x&&x.extra)bad.push('«más palabras» sin pedirlas: '+i+' en '+modo+' '+t.id)}))}}
  const mixtas=I1_T.armarRonda('escrito',null,6);if(mixtas.length<5||new Set(mixtas.map(q=>q.tema)).size<3)bad.push('la ronda mezclada usa pocos temas: '+new Set(mixtas.map(q=>q.tema)).size);
  const pr=I1_T.armarPrueba();if(pr.escritas.length!==14)bad.push('la prueba escrita tiene '+pr.escritas.length+' preguntas');if(pr.orales.length!==8||new Set(pr.orales.map(q=>q.tema)).size!==8)bad.push('la prueba oral no tiene 8 tareas de 8 temas distintos: '+pr.orales.length);
  if(new Set(pr.escritas.map(q=>q.tema)).size<8)bad.push('la prueba escrita usa pocos temas');
  return bad;
});
chk('las rondas y la prueba: sin preguntas repetidas, con varios temas, la prueba con 14 escritas + 8 orales de temas distintos, y sin «más palabras» si no se prendieron',rondas.length===0,rondas.slice(0,5).join(' | '));
// las estrellas de cada tema se cuentan con palabras que ESE tema practica (si no, un tema podría quedarse sin llegar nunca a las 3 estrellas)
const cobertura=await p.evaluate(()=>{
  const bad=[],ST=I1_T.estado();
  for(const extra of [false,true]){ST.extra=extra;
    for(const t of I1.TEMAS){
      const prod=new Set(),its=t.items.length?I1_T.itemsDe(t):[null];
      for(const [modo,tipos,G] of [['escrito',t.esc,I1_T.GEN],['oral',t.ora,I1_T.ORAL]])for(const tp of tipos)for(const it of its)for(let k=0;k<(t.items.length?6:120);k++){let q=null;try{q=G[tp](t,it)}catch(e){}if(q&&modo==='escrito')q.ids.forEach(i=>prod.add(i))}   // (los temas sin lista de palabras eligen una frase al azar: se prueba muchas veces)
      const falta=I1_T.dominio(t).ids.filter(i=>!prod.has(i));
      if(falta.length)bad.push((extra?'+extra ':'')+t.id+': las estrellas cuentan '+falta.join(',')+' pero la práctica escrita nunca lo pregunta');
    }}
  ST.extra=false;return bad;
});
chk('las estrellas de cada tema se cuentan con palabras que la práctica escrita de ESE tema sí pregunta (cada tema puede llegar a las 3 estrellas)',cobertura.length===0,cobertura.slice(0,5).join(' | '));
chk('armar rondas no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 4) el recorrido: inicio, temas, una ronda, el primer error y el segundo
{
const p=await abrir({rapido:true});
const ini=await p.evaluate(()=>({temas:document.querySelectorAll('#pInicio .tema').length,modos:[...document.querySelectorAll('#pInicio .modo')].map(x=>x.querySelector('b').textContent),hoy:document.querySelector('.hoyc').textContent,ests:document.querySelectorAll('#pInicio .tema .star.on').length}));
chk('el inicio: 11 temas, los 3 botones (Escribir, Hablar, Mi prueba), saludo y el resumen de hoy en cero, ninguna estrella al empezar',ini.temas===11&&j(ini.modos)===j(['Escribir','Hablar','Mi prueba'])&&/Hoy: 0 bien · 0 a repasar/.test(ini.hoy)&&ini.ests===0,j(ini));
// cada tema: pantalla de estudio con contenido, y tocar una tarjeta dice la palabra
const estudio=[];
for(const t of ['saludos','cuerpo','numeros','dias','meses','fecha','abc','colores','aula','yo','frases']){
  await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#pTema .tcab');
  const r=await p.evaluate(()=>({n:document.querySelectorAll('#estudio button, #estudio .fr').length,t:document.getElementById('estudio').innerText,hab:!!document.getElementById('bEsc')&&!!document.getElementById('bHab')}));
  if(r.n<3||!r.hab||/undefined|NaN|\[object/.test(r.t))estudio.push(t+' '+j(r.n));
  await p.click('#pTema [data-act="atras"]');await p.waitForSelector('#pInicio .tema');
}
chk('los 11 temas se abren: cada uno con su tablero para tocar y escuchar y los botones Escribir y Hablar, sin textos rotos',estudio.length===0,estudio.join(' | '));
// tocar una tarjeta dice la palabra
await p.click('#pInicio .tema[data-tema="colores"]');await p.waitForSelector('#pTema .card');
await p.evaluate(()=>{window.__dichos.length=0});await p.click('#pTema .card:nth-child(1)');await p.waitForTimeout(120);
const dicho=await p.evaluate(()=>window.__dichos.slice());
chk('tocar una tarjeta dice la palabra en inglés con la voz del aparato ('+j(dicho)+')',dicho.length>=1&&dicho[0]==='red',j(dicho));
await p.click('#pTema [data-act="atras"]');
// el muñeco: tocar una parte la dice y la marca
await p.click('#pInicio .tema[data-tema="cuerpo"]');await p.waitForSelector('#pTema .muneco');
await p.evaluate(()=>{window.__dichos.length=0});await p.evaluate(()=>document.querySelector('#pTema .hit[data-parte="eyes"]').dispatchEvent(new MouseEvent('click',{bubbles:true})));await p.waitForTimeout(150);
const mu=await p.evaluate(()=>({d:window.__dichos.slice(),on:[...document.querySelectorAll('#pTema .hit.on')].map(x=>x.dataset.parte),eti:document.getElementById('figEti').innerText,chip:[...document.querySelectorAll('#pTema .chip.on')].map(x=>x.dataset.parte)}));
chk('en «El cuerpo», tocar el ojo del muñeco dice «eyes», lo ilumina y marca la palabra',mu.d[0]==='eyes'&&j(mu.on)===j(['eyes'])&&/eyes/.test(mu.eti)&&j(mu.chip)===j(['eyes']),j(mu));
await p.click('#pTema [data-act="atras"]');
// una ronda de «Escribir» contestada bien
await p.click('#pInicio .tema[data-tema="colores"]');await p.click('#bEsc');await p.waitForSelector('#pPreg .preg');
const n0=await p.evaluate(()=>I1_T.ronda().qs.length);
const dichosPreg=await p.evaluate(()=>window.__dichos.slice(-3));
await jugar(p,()=>true);await p.waitForSelector('#pFin:not([hidden])');
const fin=await p.evaluate(()=>({e:document.querySelectorAll('#pFin .fin-ests .star.on').length,t:document.querySelector('#pFin h1').textContent,c:document.querySelector('.fin-cuenta').innerText,st:I1_T.estado(),ok:I1_T.ronda().ok}));
chk('una ronda de 6 preguntas de colores, toda bien: 3 estrellas, «Excellent!», «6 de 6 bien», las palabras suben de caja y se suman al día ('+n0+' preguntas)',n0===6&&fin.e===3&&fin.t==='Excellent!'&&/6 de 6 bien/.test(fin.c)&&fin.ok===6&&fin.st.estrellas===3&&fin.st.rondas===1&&fin.st.dias[Object.keys(fin.st.dias)[0]][0]===6&&Object.values(fin.st.items).every(x=>x.c>=1&&x.mal===0),j(fin));
chk('al mostrar cada pregunta se dicen la consigna y la frase («'+dichosPreg.join('» · «')+'»)',dichosPreg.length>=1&&dichosPreg.every(x=>typeof x==='string'&&x.length>1));
await p.click('#bInicio');await p.waitForSelector('#pInicio .tema');
const sti=await p.evaluate(()=>({hoy:document.querySelector('.hoyc').innerText,gd:localStorage.getItem('ingles1_estado')}));
chk('al volver al inicio se ve lo de hoy (6 bien) y todo quedó guardado en este aparato',/6 bien/.test(sti.hoy)&&/"estrellas":3/.test(sti.gd),j(sti));
await cerrar(p);
}
{
// el primer error pide «Try again!», el segundo deja la respuesta a la vista SIN pasar sola, y se sigue con «Next» (sin esperas «de prueba»: tiempos reales)
const p=await abrir({});
await p.evaluate(()=>{const t=I1.TEMA.colores,it=I1.ITEM.red,q=I1_T.GEN.look(t,it);q.gen='look';const q2=I1_T.GEN.look(t,I1.ITEM.blue);q2.gen='look';
  I1_T.estado().voz=true;
  window.__R={qs:[q,q2]};
  // una ronda de dos preguntas armadas a mano
  const r=I1_T.probar(q);const R=I1_T.ronda();R.qs=[q,q2];});
await p.waitForSelector('#area .op');await p.waitForTimeout(450);
const info=await p.evaluate(()=>{const q=I1_T.ronda().qs[0];return {mal:q.ops.map((o,i)=>o.ok?-1:i).filter(i=>i>=0),bien:q.ops.findIndex(o=>o.ok)}});
await p.click('#area .op[data-i="'+info.mal[0]+'"]');await p.waitForTimeout(250);
const e1=await p.evaluate(i=>({msg:document.getElementById('msg').innerText,cls:document.querySelector('#area .op[data-i="'+i+'"]').className,dis:document.querySelector('#area .op[data-i="'+i+'"]').disabled,sig:!document.getElementById('bSig').hidden,r:I1_T.ronda().i,ya:I1_T.ronda().res.length}),info.mal[0]);
chk('el PRIMER error no se marca como error de verdad: dice «Try again!», tacha la opción y deja intentar de nuevo (sin «Next» ni cuenta)',/Try again|Let's try again/.test(e1.msg)&&/mal/.test(e1.cls)&&e1.dis&&!e1.sig&&e1.r===0&&e1.ya===0,j(e1));
await p.click('#area .op[data-i="'+info.mal[1]+'"]');await p.waitForTimeout(300);
const e2=await p.evaluate(b=>({msg:document.getElementById('msg').innerText,ok:document.querySelector('#area .op[data-i="'+b+'"]').className,sig:!document.getElementById('bSig').hidden,r:I1_T.ronda().i,mal:I1_T.ronda().mal}),info.bien);
chk('el SEGUNDO error muestra la respuesta («It\'s: red»), marca la correcta en verde y cuenta como error',/It's: /.test(e2.msg)&&/ok/.test(e2.ok)&&e2.sig&&e2.mal===1,j(e2));
await p.waitForTimeout(2200);
const e3=await p.evaluate(()=>({r:I1_T.ronda().i,sig:!document.getElementById('bSig').hidden,msg:document.getElementById('msg').innerText}));
chk('después de fallar, la respuesta se queda a la vista hasta que el chico toca «Next» (no pasa sola a los 2 segundos)',e3.r===0&&e3.sig&&/It's: /.test(e3.msg),j(e3));
await p.click('#bSig');await p.waitForFunction(()=>I1_T.ronda().i===1,null,{timeout:3000});
chk('«Next» pasa a la pregunta que sigue',await visible(p,'#pPreg .preg'));
// responder bien: pasa sola después de decir la palabra
await p.waitForTimeout(450);
const bien=await p.evaluate(()=>I1_T.ronda().qs[1].ops.findIndex(o=>o.ok));await p.click('#area .op[data-i="'+bien+'"]');
await p.waitForFunction(()=>!document.querySelector('#pFin').hidden,null,{timeout:6000});
const f2=await p.evaluate(()=>({t:document.querySelector('#pFin h1').textContent,e:document.querySelectorAll('#pFin .star.on').length,c:document.querySelector('.fin-cuenta').innerText,rep:[...document.querySelectorAll('#pFin .card b')].map(x=>x.textContent)}));
chk('al terminar con 1 bien y 1 mal: se ve cuántas estuvieron bien, las estrellas y «Para repasar» con la palabra que falló ('+j(f2)+')',/1 de 2 bien/.test(f2.c)&&f2.e>=1&&f2.rep.includes('red'),j(f2));
// doble toque: el segundo toque no contesta la pregunta de la pantalla nueva
await p.click('#bInicio');await p.waitForTimeout(450);
await p.dblclick('#pInicio .modo.m-esc');await p.waitForTimeout(500);
const dt=await p.evaluate(()=>({res:I1_T.ronda().res.length,i:I1_T.ronda().i,mal:document.querySelectorAll('#area .op.mal,#area .op.ok').length}));
chk('un doble toque en «Escribir» empieza UNA ronda y el segundo toque no contesta la primera pregunta',dt.res===0&&dt.i===0&&dt.mal===0,j(dt));
// tocar «Next» justo después de acertar la última pregunta (cuando estaba por pasar sola): la ronda se cuenta UNA sola vez
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.look(t,I1.ITEM.red);q.gen='look';I1_T.probar(q,'escrito');I1_T.ronda().permiso='ok'});
await p.waitForTimeout(450);
const antes=await p.evaluate(()=>({r:I1_T.estado().rondas,e:I1_T.estado().estrellas}));
const bien2=await p.evaluate(()=>I1_T.ronda().qs[0].ops.findIndex(o=>o.ok));await p.click('#area .op[data-i="'+bien2+'"]');
await p.click('#bSig');await p.waitForTimeout(2800);
const desp=await p.evaluate(()=>({r:I1_T.estado().rondas,e:I1_T.estado().estrellas,fin:!document.querySelector('#pFin').hidden}));
chk('tocar «Next» justo después de acertar la última pregunta cuenta la ronda UNA sola vez (aunque estuviera por pasar sola) y muestra el resultado',desp.fin&&desp.r===antes.r+1&&desp.e>=antes.e&&desp.e<=antes.e+3,j([antes,desp]));
await cerrar(p);
}


// ---------- 4b) lo que halló la revisión independiente: la letra regalada, las fichas repetidas, el nombre, los lectores de pantalla y la fecha oral
{
const p=await abrir({rapido:true});
// armar: la letra que se regala no se pinta de rojo cuando se equivoca (ni queda roja al acertar en el 2.º intento) y cada letra puesta se lee
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.armar(t,I1.ITEM.red);q.gen='armar';I1_T.probar(q,'escrito');I1_T.ronda().permiso='ok'});
await p.waitForSelector('#slots .slot.dado');await p.waitForTimeout(450);
const qa=await p.evaluate(()=>{const q=I1_T.ronda().qs[0];return {w:q.w,dados:q.dados}});
const poner=async letras=>{for(const c of letras){const idx=await p.evaluate(c=>[...document.querySelectorAll('#banco .ficha')].findIndex(f=>!f.disabled&&f.textContent===c),c);await p.click('#banco .ficha:nth-child('+(idx+1)+')')}};
const need=qa.w.slice(qa.dados).split('');
await poner(need.slice(0,1));
const aria1=await p.evaluate(()=>document.querySelector('#slots button.slot').getAttribute('aria-label'));
await poner(need.slice(1));
let mal=need.slice(1).concat(need[0]);
// (si la palabra ya se armó bien con ese orden no hay error que mirar: se arma al revés)
const estado1=await p.evaluate(()=>({q:I1_T.ronda().qs[0].errores,hecho:I1_T.ronda().qs[0].hecho}));
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.armar(t,I1.ITEM.blue);q.gen='armar';I1_T.probar(q,'escrito');I1_T.ronda().permiso='ok'});await p.waitForTimeout(450);
const need2=await p.evaluate(()=>{const q=I1_T.ronda().qs[0];return q.w.slice(q.dados).split('')});
mal=need2.slice().reverse();if(mal.join('')===need2.join(''))mal=need2.slice(1).concat(need2[0]);
await poner(mal);
const dado=await p.evaluate(()=>({cls:document.querySelector('#slots .slot.dado').className,rojo:getComputedStyle(document.querySelector('#slots .slot.dado')).color}));
chk('armar: al equivocarse la letra que se regala NO se pinta de rojo, y al poner una letra el lector de pantalla la lee («'+aria1+'»)',!/\bmal\b/.test(dado.cls)&&/^Letra \d+: [A-Z]$/.test(aria1),j([dado,aria1]));
// ordenar: dos fichas con el mismo texto valen lo mismo
await p.evaluate(()=>{const q={tipo:'ordenar',tema:'frases',ids:['af2'],cons:['Put the words in order.','Poné las palabras en orden.'],cuerpo:'',hablar:[],fichas:[{id:'w0',h:'the'},{id:'w1',h:'the'},{id:'w2',h:'cat'}],sol:['w0','w1','w2'],mostrar:'the the cat',frase:true,gen:'armarfrase'};I1_T.probar(q,'escrito');I1_T.ronda().permiso='ok'});
await p.waitForSelector('#banco .ficha');await p.waitForTimeout(450);
for(const id of ['w1','w0','w2'])await p.click('#banco .ficha[data-id="'+id+'"]');
await p.waitForTimeout(200);
chk('ordenar: si dos fichas dicen lo mismo («the … the»), ponerlas en cualquier orden está bien',await p.evaluate(()=>I1_T.ronda().res.length===1&&I1_T.ronda().res[0].res==='ok'));
// el nombre: sólo símbolos no es un nombre; «is» o «name» como nombre no rompen la pregunta
await p.evaluate(()=>{const s=I1_T.estado();s.nombre='- -';I1_T.pintarInicio()});
const hola=await p.evaluate(()=>document.querySelector('.hola').innerText.replace(/\s+/g,' ').trim());
await p.evaluate(()=>{I1_T.estado().nombre='is'});
const nm=await p.evaluate(()=>{const q=I1_T.GEN.nombre(I1.TEMA.yo);return {sol:q.sol,fi:q.fichas.map(f=>f.id),h:q.fichas.map(f=>f.h)}});
chk('un nombre que son sólo guiones no se usa para saludar («'+hola+'»), y si el nombre es «is» la pregunta de «My name is…» sigue teniendo solución',/^Hi! /.test(hola)&&new Set(nm.fi).size===4&&nm.sol.every(i=>nm.fi.includes(i)),j([hola,nm]));
await p.evaluate(()=>{I1_T.estado().nombre=''});
// la fecha oral: sin «Más palabras» sólo pide fechas del 1 al 10 y acredita ESE ordinal
const fechas=await p.evaluate(()=>{const ST=I1_T.estado(),out=[];const RD=Date;
  for(const dia of [3,9,10,11,25,31]){for(const extra of [false,true]){ST.extra=extra;
    window.Date=class extends RD{constructor(...a){if(a.length)super(...a);else super(2026,9,dia)}};
    const q=I1_T.ORAL.fecha(I1.TEMA.fecha,null);window.Date=RD;out.push([dia,extra,q.ev.n,q.ids[0]])}}
  ST.extra=false;return out});
chk('la fecha oral: sin «Más palabras» no pide el día 25 (usa un calendario del 1 al 10) y siempre acredita el ordinal que pidió; con «Más palabras» usa la fecha de hoy ('+j(fechas.slice(6,10))+')',fechas.every(([dia,extra,n,id])=>id==='o'+n&&(extra?n===dia:(dia<=10?n===dia:n<=10))),j(fechas));
// el cartel de «¿Salir de la prueba?» se cierra con Esc y devuelve el foco
await p.evaluate(()=>I1_T.empezarPrueba());await p.waitForSelector('#pPreg .preg');await p.waitForTimeout(100);
await p.focus('#bSalir');await p.click('#bSalir');const abierto=await visible(p,'#modal');await p.keyboard.press('Escape');
const cerrado=!(await visible(p,'#modal')),foco=await p.evaluate(()=>document.activeElement&&document.activeElement.id);
chk('el cartel «¿Salir de la prueba?» se cierra con Esc y el foco vuelve al botón ✕ ('+foco+')',abierto&&cerrado&&foco==='bSalir',j([abierto,cerrado,foco]));
// con el cartel abierto la prueba no sigue sola a la pregunta que viene (se prueba con una pregunta de opciones)
let espera=null;
for(let k=0;k<14&&!espera;k++){
  await p.evaluate(()=>I1_T.empezarPrueba());await p.waitForSelector('#pPreg .preg');await p.waitForTimeout(80);
  if(await p.evaluate(()=>I1_T.ronda().qs[0].tipo)!=='mc')continue;
  await p.waitForSelector('#area .op');await p.click('#bSalir');
  await p.evaluate(()=>document.querySelector('#area .op').click());await p.waitForTimeout(900);
  const i1=await p.evaluate(()=>I1_T.ronda().i);await p.click('#mNo');
  await p.waitForFunction(()=>I1_T.ronda().i===1,null,{timeout:3000}).catch(()=>{});
  espera=[i1,await p.evaluate(()=>I1_T.ronda().i)];
}
chk('la prueba no sigue avanzando mientras el cartel de salir está abierto, y sigue al cerrarlo ('+j(espera)+')',!!espera&&espera[0]===0&&espera[1]===1,j(espera));
chk('estas pruebas no dejaron errores en la consola',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 5) «Mi prueba»: parte escrita (sin decir si estuvo bien) + parte oral
{
const p=await abrir({rapido:true});
await p.click('#bPrueba');await p.waitForSelector('#bEmpPrueba');
const intro=await textoVisible(p);
chk('«Mi prueba» explica las dos partes: escrita (14 preguntas, sin decir si estuvo bien) y oral (8 tareas)',/14 preguntas/.test(intro)&&/Oral/.test(intro)&&/8 tareas/.test(intro)&&/hasta el final/.test(intro),intro.slice(0,200));
await p.evaluate(()=>{window.__marcas=[];new MutationObserver(ms=>ms.forEach(m=>{const c=m.target.classList;['ok','mal','hecho','on'].forEach(k=>{if(c.contains(k)&&!(m.oldValue||'').split(' ').includes(k)&&!m.target.closest('.pbarra'))window.__marcas.push(k+':'+m.target.className)})})).observe(document.getElementById('pPreg'),{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['class']})});
await p.click('#bEmpPrueba');await p.waitForSelector('#pPreg .preg');
const durante=[];
// 14 preguntas: las dos primeras de cada tres bien, la tercera mal → 10 bien
const tipos=[];
for(let i=0;i<14;i++){
  await p.waitForFunction(i=>{const r=I1_T.ronda();return r&&r.i===i&&!document.querySelector('#pPreg').hidden},i,{timeout:8000});
  tipos.push(await responder(p,i%3!==2,true));
  const v=await p.evaluate(()=>({msg:document.getElementById('msg').innerText.trim(),ok:document.querySelectorAll('#area .op.ok,#area .op.mal,#area .slot.ok,#area .slot.mal,#area .hueco-o.ok,#area .hueco-o.mal,#area .u.hecho').length,sig:!document.getElementById('bSig').hidden}));
  durante.push(v);
  await p.waitForFunction(i=>{const r=I1_T.ronda();return !r||r.i>i||r.parte==='oral'},i,{timeout:8000});
}
const marcas=await p.evaluate(()=>window.__marcas);
chk('en la parte escrita NO se dice si estuvo bien ni mal mientras se contesta (ni mensaje, ni «Next», ni ningún color de acierto/error en armar, ordenar, unir o tocar el muñeco): '+tipos.length+' preguntas de '+new Set(tipos).size+' tipos',durante.filter(v=>v.msg!==''||v.sig).length===0&&marcas.length===0,j([durante.filter(v=>v.msg!==''||v.sig).slice(0,3),marcas.slice(0,5),[...new Set(tipos)]]));
await p.waitForSelector('#bEmpOral');
const t2=await textoVisible(p);
chk('terminada la parte escrita aparece la parte oral («Part 2 · Speaking»), con «Empezar» y «Terminar sin la parte oral»',/Speaking/.test(t2)&&await visible(p,'#bEmpOral')&&await visible(p,'#bSinOral'),t2.slice(0,150));
await p.click('#bSinOral');await p.waitForSelector('#pFin:not([hidden])');
const f1=await p.evaluate(()=>({t:document.querySelector('#pFin h1').textContent,notas:document.querySelector('.dos-notas').innerText,pr:I1_T.estado().pruebas,rondas:I1_T.estado().rondas}));
chk('si se termina sin la parte oral: se ve la nota escrita (10 de 14), no hay nota oral, y queda anotada en «pruebas hechas»',/10 de 14/.test(f1.notas)&&!/Oral/.test(f1.notas)&&f1.pr.length===1&&f1.pr[0].e[0]===10&&f1.pr[0].e[1]===14&&f1.pr[0].o===null&&f1.rondas===1,j(f1));
// la parte oral, salteando las 8 tareas (con el micrófono permitido)
await p.click('#bOtraPrueba');await p.waitForSelector('#pPreg .preg');
await jugar(p,i=>true,true);await p.waitForSelector('#bEmpOral');await p.click('#bEmpOral');await p.waitForSelector('#pPreg .oral-caja',{timeout:8000});
const orales=[];
for(let i=0;i<8;i++){
  await p.waitForFunction(i=>{const r=I1_T.ronda();return r&&r.parte==='oral'&&r.i===i&&document.querySelector('#bSaltar')},i,{timeout:8000});
  orales.push(await p.evaluate(()=>({sub:I1_T.ronda().qs[I1_T.ronda().i].sub,mic:!!document.getElementById('bMic'),lodije:!!document.getElementById('bHecho'),sig:!document.getElementById('bSig').hidden,msg:document.getElementById('msg').innerText.trim()})));
  await p.click('#bSaltar');await p.waitForFunction(i=>{const r=I1_T.ronda();return !r||r.i>i},i,{timeout:8000});
}
await p.waitForSelector('#pFin:not([hidden])');
const f2=await p.evaluate(()=>({notas:document.querySelector('.dos-notas').innerText,pr:I1_T.estado().pruebas}));
chk('la parte oral tiene 8 tareas, cada una con el micrófono; saltearlas todas cuenta 0 de 8 y la prueba queda anotada con sus dos notas',orales.length===8&&orales.every(o=>o.mic&&!o.sig&&o.msg==='')&&/Oral/.test(f2.notas)&&f2.pr.length===2&&f2.pr[1].o&&f2.pr[1].o[1]===8&&f2.pr[1].o[0]===0,j([orales.slice(0,2),f2]));
chk('salir de la prueba a la mitad pide confirmación (con un cartel propio) y «No, seguir» no pierde nada',await (async()=>{
  await p.click('#bInicio');await p.waitForSelector('#bPrueba');await p.click('#bPrueba');await p.click('#bEmpPrueba');await p.waitForSelector('#pPreg .preg');await p.waitForTimeout(100);
  await p.click('#bSalir');const m1=await visible(p,'#modal');await p.click('#mNo');const m2=await visible(p,'#modal'),sigue=await visible(p,'#pPreg .preg');
  await p.click('#bSalir');await p.click('#mSi');await p.waitForSelector('#pInicio .tema');return m1&&!m2&&sigue})());
chk('la prueba no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 6) ajustes («Para grandes»: se abren manteniendo apretado el engranaje), lo guardado y los datos de afuera
{
const p=await abrir({});   // tiempos reales: el engranaje pide 1,4 segundos
const bb=await p.$eval('#bAj',e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});
await p.mouse.move(bb[0],bb[1]);await p.mouse.down();await p.waitForTimeout(500);await p.mouse.up();await p.waitForTimeout(300);
chk('un toque corto al engranaje NO abre los ajustes (es para los grandes)',!(await visible(p,'#pAjustes')));
await p.mouse.move(bb[0],bb[1]);await p.mouse.down();await p.waitForTimeout(1700);await p.mouse.up();
await p.waitForSelector('#pAjustes:not([hidden])');
chk('mantener apretado el engranaje (1,4 s) abre «Para grandes»',await visible(p,'#ajNombre'));
await p.fill('#ajNombre','Valentina');await p.check('#ajExtra');await p.uncheck('#ajEs');await p.selectOption('#ajVel','lenta');await p.uncheck('#ajSon');
await p.fill('#ajNombre','<b>Va</b>lenti"na 99');
const st=await p.evaluate(()=>I1_T.estado());
chk('los ajustes se guardan al instante: nombre (sólo letras: «'+st.nombre+'»), más palabras, sin castellano, velocidad pausada, sin sonidos',st.nombre==='bVabValentina'.slice(0,0)+st.nombre&&/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]{0,16}$/.test(st.nombre)&&st.nombre.length>0&&st.extra===true&&st.es===false&&st.vel==='lenta'&&st.sonido===false,j(st));
await p.click('#pAjustes [data-act="atras"]');await p.waitForSelector('#pInicio .tema');await p.waitForTimeout(400);
const hi=await p.evaluate(()=>({hola:document.querySelector('.hola').innerText,html:document.querySelector('.hola').innerHTML}));
chk('el saludo del inicio usa el nombre, escapado (nada de etiquetas ni comillas sueltas): «'+hi.hola.trim().replace(/\s+/g,' ')+'»',/^Hi, /.test(hi.hola.trim())&&!/<b>|<\/b>|"/.test(hi.html.replace(/<span[^>]*>.*?<\/span>|<button.*?<\/button>/g,'')),hi.html);
// «más palabras»: aparecen los números hasta 20 y los ordinales hasta 31
const pool=await p.evaluate(()=>({n:I1_T.itemsDe(I1.TEMA.numeros).length,f:I1_T.itemsDe(I1.TEMA.fecha).length,a:I1_T.itemsDe(I1.TEMA.aula).length}));
chk('con «Más palabras» los números llegan a 20 (20), las fechas a 31 (31) y el aula suma sus útiles ('+pool.a+')',pool.n===20&&pool.f===31&&pool.a===13,j(pool));
await p.reload();await p.waitForSelector('#pInicio .tema');
const dsp=await p.evaluate(()=>I1_T.estado());
chk('al recargar la página se recuerda todo lo anterior (nombre, más palabras, velocidad…)',dsp.extra===true&&dsp.es===false&&dsp.vel==='lenta'&&dsp.nombre===st.nombre,j(dsp));
// borrar todo: con cartel
const bb2=await p.$eval('#bAj',e=>{const r=e.getBoundingClientRect();return [r.x+r.width/2,r.y+r.height/2]});
await p.mouse.move(bb2[0],bb2[1]);await p.mouse.down();await p.waitForTimeout(1700);await p.mouse.up();await p.waitForSelector('#ajBorrar');
await p.click('#ajBorrar');const cartel=await visible(p,'#modal');await p.click('#mNo');const cerrado=!(await visible(p,'#modal'));
const antes=await p.evaluate(()=>I1_T.estado().nombre);
await p.click('#ajBorrar');await p.click('#mSi');await p.waitForSelector('#pInicio .tema');
const despues=await p.evaluate(()=>({n:I1_T.estado().nombre,gd:localStorage.getItem('ingles1_estado')}));
chk('«Borrar todo» pide confirmar con un cartel propio (sin diálogos del navegador); «No» no borra y «Sí» deja todo en blanco',cartel&&cerrado&&antes.length>0&&despues.n===''&&despues.gd===null,j([cartel,cerrado,antes,despues]));
await cerrar(p);
}
{
// lo guardado roto, con trampas o bloqueado no rompe nada
const raro=JSON.stringify({v:1,voz:'no',sonido:1,es:null,extra:'sí',ia:0,vel:'turbo',vozNombre:'x'.repeat(500),nombre:'<img src=x onerror="window.__xss=1">Ana',rondas:-5,estrellas:'mucho',items:{red:{c:99,ok:'x',mal:-1,u:'ayer'},'__proto__':{c:1},'<script>':{c:1},toString:{c:2}},or:[1,2],dias:{hoy:[1,2],'2026-11-02':[3,'x'],'2026-11-03':'no'},pruebas:[null,1,{f:'x',e:5},{f:'2026-11-03',e:[3,0],o:[1,0]}]});
for(const [nombre,o] of [['con datos absurdos',{estado:raro,rapido:true}],['con JSON roto',{estado:'{"items":',rapido:true}],['con un texto cualquiera',{estado:'hola',rapido:true}],['con el almacenamiento bloqueado',{bloquear:true,rapido:true}]]){
  const p=await abrir(o);
  await p.click('#pInicio .tema[data-tema="colores"]');await p.click('#bEsc');await p.waitForSelector('#pPreg .preg');await jugar(p,()=>true);await p.waitForSelector('#pFin:not([hidden])');
  const r=await p.evaluate(()=>({xss:window.__xss||0,img:document.querySelectorAll('img').length,st:I1_T.estado(),t:document.body.innerText}));
  chk('la app arranca y se juega una ronda entera '+nombre+' (sin errores, sin NaN, sin código metido por el nombre)',p.errs.length===0&&!r.xss&&r.img===0&&!/NaN|undefined|\[object/.test(r.t)&&r.st.estrellas>=0&&['normal','lenta','rapida'].includes(r.st.vel)&&Array.isArray(r.st.pruebas),j([p.errs.slice(0,2),r.xss,r.img,r.st.vel]));
  await cerrar(p);
}
}
{
// la voz se apaga y se vuelve a prender
const p=await abrir({rapido:true,estado:JSON.stringify({v:1,voz:false})});
await p.click('#pInicio .tema[data-tema="colores"]');await p.waitForSelector('#pTema .card');
await p.click('#pTema .card:nth-child(1)');await p.waitForTimeout(150);
const mudo=await p.evaluate(()=>window.__dichos.length);
chk('con «Que hable en inglés» apagado no se dice nada (ni al tocar una tarjeta)',mudo===0,String(mudo));
await cerrar(p);
}

// ---------- 7) la parte oral de punta a punta: micrófono de mentira (una voz de 1,3 s y silencio) + la IA simulada (lo que «oyó» lo decide la prueba)
{
const p=await abrir({rapido:true});
const prep=(modo)=>p.evaluate(async m=>{I1.oral._t.mock(m==='falla'?{generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;throw new Error('boom 503 unavailable')}}:{generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;return window.__dijo}});window.__llamadas=0;return I1.oral.preparar(I1_T.estado())},modo||'ok');
const preg=(tema,tp,id)=>p.evaluate(([tema,tp,id])=>{const t=I1.TEMA[tema],q=I1_T.ORAL[tp](t,id?I1.ITEM[id]:null);q.gen=tp;I1_T.probar(q,'oral');I1_T.ronda().permiso='ok'},[tema,tp,id]);
const decir=async texto=>{await p.evaluate(t=>{window.__dijo=t},texto);await p.waitForSelector('#bMic');await p.click('#bMic');
  await p.waitForFunction(()=>{const o=document.getElementById('oyo'),m=document.getElementById('msg');return (o&&o.innerText)||(m&&m.innerText)},null,{timeout:14000});await p.waitForTimeout(120);
  return p.evaluate(()=>({oyo:document.getElementById('oyo')?document.getElementById('oyo').innerText:'',msg:document.getElementById('msg')?document.getElementById('msg').innerText:'',cls:document.getElementById('msg')?document.getElementById('msg').className:'',R:{ok:I1_T.ronda().ok,casi:I1_T.ronda().casi,mal:I1_T.ronda().mal,res:I1_T.ronda().res.map(x=>x.res),i:I1_T.ronda().i},q:{hecho:I1_T.ronda().qs[Math.min(I1_T.ronda().i,I1_T.ronda().qs.length-1)].hecho,intentos:I1_T.ronda().qs[0].intentos},sig:!!document.getElementById('bSig')&&!document.getElementById('bSig').hidden,mic:!!document.getElementById('bMic'),lodije:!!document.getElementById('bHecho')}))};
const perm=await prep();
chk('el permiso del micrófono se pide una vez al empezar a hablar y la IA está lista («'+perm+'»)',perm==='ok');
await preg('colores','nombrar','red');
let r=await decir("it's red");
chk('HABLAR bien: tocar el micrófono abre el micrófono, detecta la voz, la corta sola al callarse (1,5 s), la IA «oye» «it\'s red», la app decide que está bien («Escuché…»), cuenta 1 bien y festeja ('+r.msg+')',/Escuché: .*it's red/.test(r.oyo)&&r.R.ok===1&&r.R.res[0]==='ok'&&r.cls.includes('bien'),j(r));
const log1=await p.evaluate(()=>I1.oral._t.log.join('|'));
chk('el micrófono se abre sólo mientras contesta y se SUELTA al terminar (si no, en iPhone la voz del profe queda muda)',(log1.match(/mic abierto/g)||[]).length===(log1.match(/mic soltado/g)||[]).length&&/mic soltado/.test(log1),log1);
// mal dos veces: el primero pide «Try again!», el segundo muestra la respuesta y se queda
await preg('colores','nombrar','red');
r=await decir('blue');
chk('HABLAR mal (1.er intento): «Try again!», sigue la misma pregunta con el micrófono a mano y sin «Next»',/Try again|Let's try again/.test(r.msg)&&!r.q.hecho&&r.mic&&!r.sig&&r.R.res.length===0,j(r));
r=await decir('green');
chk('HABLAR mal (2.º intento): muestra la respuesta («Listen: red»), cuenta como error, queda a la vista con «Next» y NO pasa sola',/Listen: red/.test(r.msg)&&r.R.mal===1&&r.sig&&r.q.hecho,j(r));
await p.waitForTimeout(1500);
chk('…y la respuesta se queda hasta que el chico toca «Next» (1,5 s después sigue ahí)',await p.evaluate(()=>I1_T.ronda().i===0&&!document.getElementById('bSig').hidden&&/Listen: red/.test(document.getElementById('msg').innerText)));
// «casi»
await preg('colores','nombrar','pink');
r=await decir('pinc');
chk('HABLAR «casi» (la IA oyó «pinc»): dice «Almost!», deja intentar otra vez; al segundo «casi» cuenta medio punto y muestra cómo se dice',/Almost|Nearly/.test(r.msg)&&!r.q.hecho&&r.R.res.length===0,j(r));
r=await decir('pinc');
chk('HABLAR «casi» dos veces: queda como «casi» (no como error), con la respuesta a la vista, y NO sube ni baja la caja de la palabra',r.R.casi===1&&r.R.mal===0&&/Almost! pink/.test(r.msg)&&r.sig&&await p.evaluate(()=>!('pink' in I1_T.estado().items)),j(r));
// al fallar la 2.ª vez se dice la RESPUESTA (no la pregunta)
await preg('dias','hoy');await p.evaluate(()=>{window.__dichos.length=0});
r=await decir('banana');r=await decir('banana');await p.waitForTimeout(200);
const diaHoy=await p.evaluate(()=>I1_T.ronda().qs[0].mostrar);
chk('al fallar la segunda vez la voz dice la respuesta («'+diaHoy+'») y no repite la pregunta',await p.evaluate(d=>{const x=window.__dichos;return x.length>0&&x[x.length-1]===d},diaHoy),j(await p.evaluate(()=>window.__dichos.slice(-3))));
// series, fecha, datos personales y frases
const casos=[['numeros','contar',null,'one two three four five six seven eight nine ten','ok'],['numeros','contar',null,'one two','no'],['dias','dias',null,'monday tuesday wednesday thursday friday saturday sunday','ok'],['meses','meses',null,'january february march april may june july august september october november december','ok'],['yo','yo',null,"my name is Ana",'ok'],['frases','gusto',null,'yes I do','ok'],['frases','frase',null,'xx','no']];
const resultados=[];
for(const [tema,tp,id,dijo,esp] of casos){
  await preg(tema,tp,id);
  // contar hasta 5 o 10 según lo aprendido: se dice la serie más larga y vale en los dos casos
  const dicho=tp==='frase'?await p.evaluate(()=>I1_T.ronda().qs[0].ev.frase):tp==='yo'?await p.evaluate(()=>({nombre:"My name is Ana",edad:"I'm six",estado:"I'm fine thank you"}[I1_T.ronda().qs[0].ev.de])):tp==='gusto'?'yes I do':dijo;
  r=await decir(esp==='no'&&tp==='frase'?'pizza':dicho);resultados.push([tp,esp==='no'?(r.R.res.length===0?'reintento':r.R.res[0]):(r.R.res[0]||'?'),dicho.slice(0,30)]);
}
chk('HABLAR series y frases: contar, decir los días y los meses, «My name is…», «Yes, I do» y repetir una frase entera dan «bien» cuando se dicen bien y no cuando no ('+j(resultados)+')',resultados.map(x=>x[1]).join()==='ok,reintento,ok,ok,ok,ok,reintento',j(resultados));
// tocar el micrófono otra vez = «ya terminé»
await preg('colores','nombrar','blue');
await p.evaluate(()=>{window.__dijo='blue'});await p.click('#bMic');await p.waitForFunction(()=>/Te escucho/.test(document.getElementById('micT').textContent),null,{timeout:5000});
const t0=Date.now();await p.waitForTimeout(700);await p.click('#bMic');await p.waitForFunction(()=>/Escuché/.test(document.getElementById('oyo').innerText),null,{timeout:6000});const seg=(Date.now()-t0)/1000;
chk('tocar el micrófono de nuevo mientras habla termina la grabación sin esperar el silencio ('+seg.toFixed(1)+' s)',seg<2.6&&await p.evaluate(()=>I1_T.ronda().ok===1));
// un segundo toque justo después de abrir (menos de 0,6 s) no corta la grabación
await preg('colores','nombrar','blue');await p.evaluate(()=>{window.__dijo='blue';I1.oral._t.log.length=0});await p.click('#bMic');
await p.waitForFunction(()=>/Te escucho/.test(document.getElementById('micT').textContent),null,{timeout:5000});await p.click('#bMic');
await p.waitForFunction(()=>/Escuché/.test(document.getElementById('oyo').innerText),null,{timeout:9000});
const motivo=await p.evaluate(()=>(I1.oral._t.log.join('|').match(/escuchar: (\w+)/)||[])[1]);
chk('un segundo toque justo después de abrir el micrófono no corta la grabación (se cerró por «'+motivo+'», no por «pedido»)',motivo==='silencio',String(motivo));
// saltear
await preg('colores','nombrar','red');await p.click('#bSaltar');
chk('«Saltear · Skip» deja la tarea sin contestar (cuenta como no lograda) y sigue',await p.evaluate(()=>I1_T.ronda().res.length===1&&I1_T.ronda().res[0].res==='no'));
chk('la parte oral no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
// salir mientras escucha suelta el micrófono
await preg('colores','nombrar','red');await p.evaluate(()=>{I1.oral._t.mock({generar:async()=>'red'})});
const a0=await p.evaluate(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length);
await p.click('#bMic');await p.waitForFunction(()=>/Te escucho/.test(document.getElementById('micT').textContent),null,{timeout:5000});
await p.click('#bSalir');await p.waitForSelector('#pInicio .tema');await p.waitForTimeout(300);
const lg=await p.evaluate(()=>I1.oral._t.log.join('|'));
chk('salir de la pregunta (✕) mientras el micrófono escucha lo suelta enseguida y no queda nada pendiente',(lg.match(/mic abierto/g)||[]).length===(lg.match(/mic soltado/g)||[]).length&&(lg.match(/mic abierto/g)||[]).length>a0&&p.errs.length===0,lg+j(p.errs));
await cerrar(p);
}
{
// la IA falla: «Probá de nuevo»; a la segunda se pasa a «Lo dije» (autoevaluación) también para las tareas que siguen
const p=await abrir({rapido:true});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{throw new Error('boom 503 unavailable')}});return I1.oral.preparar(I1_T.estado())});
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red),q2=I1_T.ORAL.nombrar(t,I1.ITEM.blue);q.gen=q2.gen='nombrar';I1_T.probar(q,'oral');const R=I1_T.ronda();R.permiso='ok';R.qs=[q,q2]});
await p.waitForSelector('#bMic');await p.click('#bMic');await p.waitForFunction(()=>/No pude escuchar/.test(document.getElementById('msg').innerText),null,{timeout:15000});
const e1=await p.evaluate(()=>({msg:document.getElementById('msg').innerText,mic:!!document.getElementById('bMic'),hecho:!!document.getElementById('bHecho')}));
chk('si la IA falla una vez: «No pude escuchar bien. Probá de nuevo.» y el micrófono sigue a mano',/Probá de nuevo/.test(e1.msg)&&e1.mic&&!e1.hecho,j(e1));
await p.click('#bMic');await p.waitForFunction(()=>document.getElementById('bHecho'),null,{timeout:15000});
const e2=await p.evaluate(()=>({msg:document.getElementById('msg').innerText,mic:!!document.getElementById('bMic'),dis:I1.oral.disponible(I1_T.estado()).ia}));
chk('si la IA falla dos veces seguidas la pantalla pasa a «Lo dije» (sin micrófono) y avisa ('+e2.msg+')',/Lo dije/.test(e2.msg)&&!e2.mic&&e2.dis===false,j(e2));
await p.click('#bHecho');await p.waitForFunction(()=>I1_T.ronda().i===1,null,{timeout:4000});
const e3=await p.evaluate(()=>({mic:!!document.getElementById('bMic'),hecho:!!document.getElementById('bHecho'),ok:I1_T.ronda().ok}));
chk('«Lo dije» cuenta como bien y las tareas que siguen se contestan también con «Lo dije»',e3.ok===1&&e3.hecho&&!e3.mic,j(e3));
await cerrar(p);
}
{
// sin permiso de micrófono: se explica y se contesta con «Lo dije»; con la IA apagada ni se pide el permiso
const p=await abrir({rapido:true,sinMic:true});
await p.evaluate(()=>{window.__pidio=0;const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=c=>{window.__pidio++;return g(c)}});
await p.click('#pInicio .tema[data-tema="colores"]');await p.click('#bHab');await p.waitForSelector('#pPreg .oral-caja',{timeout:8000});
const d=await p.evaluate(()=>({mic:!!document.getElementById('bMic'),hecho:!!document.getElementById('bHecho'),msg:document.getElementById('msg').innerText,perm:I1_T.ronda().permiso}));
chk('si el navegador NO deja usar el micrófono: se explica cómo permitirlo y se contesta con «Lo dije» ('+d.perm+')',d.perm==='denied'&&!d.mic&&d.hecho&&/micrófono/i.test(d.msg),j(d));
await p.click('#bHecho');await p.waitForFunction(()=>I1_T.ronda().i>=1||!document.querySelector('#pFin').hidden,null,{timeout:4000});
chk('con «Lo dije» la tarea cuenta como lograda',await p.evaluate(()=>I1_T.ronda().ok===1&&I1_T.ronda().res[0].res==='ok'));
await cerrar(p);
const p2=await abrir({rapido:true,estado:JSON.stringify({v:1,ia:false})});
await p2.evaluate(()=>{window.__pidio=0;const g=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=c=>{window.__pidio++;return g(c)}});
await p2.click('#pInicio .tema[data-tema="colores"]');await p2.click('#bHab');await p2.waitForSelector('#pPreg .oral-caja',{timeout:8000});
const d2=await p2.evaluate(()=>({mic:!!document.getElementById('bMic'),hecho:!!document.getElementById('bHecho'),pidio:window.__pidio}));
chk('con «Hablar con ayuda de la IA» apagado no se pide ningún permiso de micrófono y se contesta con «Lo dije»',!d2.mic&&d2.hecho&&d2.pidio===0,j(d2));
await cerrar(p2);
}
{
// micrófono mudo: no se oye nada → se avisa, no se manda nada a la IA
const p=await abrir({rapido:true,silencio:true});
await p.evaluate(async()=>{window.__llamadas=0;I1.oral._t.mock({generar:async()=>{window.__llamadas++;return 'red'}});return I1.oral.preparar(I1_T.estado())});
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok'});
await p.waitForSelector('#bMic');await p.click('#bMic');
await p.waitForFunction(()=>/No te escuch/.test(document.getElementById('msg').innerText),null,{timeout:12000});
const m=await p.evaluate(()=>({msg:document.getElementById('msg').innerText,mic:!!document.getElementById('bMic'),llam:window.__llamadas,res:I1_T.ronda().res.length}));
chk('si no se oye ninguna voz: «No te escuché. Try again!», no se manda nada a la IA y se puede intentar de nuevo',m.llam===0&&m.mic&&m.res===0&&/Try again/.test(m.msg),j(m));
await cerrar(p);
}

// ---------- 7b) el MICRÓFONO que escucha bajito: voces suaves, ruido de fondo, el ajuste de sensibilidad y la prueba del micrófono
{
// escucha una vez con la sensibilidad pedida y devuelve lo que vio la pantalla (resultado, avisos y el punto más alto del medidor)
const ESC=(p,o)=>p.evaluate(async o=>{const niv=[];let bajo=0,voz=0;const x=await I1.oral.escuchar(Object.assign({onNivel:v=>niv.push(v),onBajo:()=>bajo++,onVoz:()=>voz++},o));
  return {mudo:!!x.mudo,bajo:x.bajo,pico:x.pico==null?null:+x.pico.toFixed(4),ms:x.ms||0,error:x.error,nivMax:Math.max(0,...niv),avBajo:bajo,avVoz:voz}},o);
let p=await abrir({rapido:true,nav:bBaja,sinAGC:true});   // una voz bajita (en el micrófono llega con un nivel de ≈ 0,01), sin el control de volumen del navegador (como un iPhone)
let r=await ESC(p,{mic:'alta'});
chk('MICRÓFONO BAJO: con la sensibilidad «alta» (la de siempre) se detecta una voz bajita (nivel ≈ 0,01), se avisa que fue bajita y el medidor se mueve ('+j(r)+')',!r.mudo&&r.bajo===true&&r.pico>0.004&&r.pico<0.02&&r.nivMax>=30&&r.avVoz===1&&!r.error,j(r));
r=await ESC(p,{mic:'normal'});
chk('MICRÓFONO BAJO: con «normal» esa misma voz NO alcanza (queda «mudo»), pero la pantalla se entera de que hubo sonido bajito y avisa «te oigo muy bajito» ('+j(r)+')',r.mudo===true&&r.bajo===true&&r.avBajo===1&&r.avVoz===0,j(r));
r=await ESC(p,{mic:'muy'});
chk('MICRÓFONO BAJO: con «muy alta» también se oye ('+j(r)+')',!r.mudo&&r.bajo===true&&r.avVoz===1,j(r));
await cerrar(p);
p=await abrir({rapido:true,nav:bRuido,sinAGC:true});
r=await ESC(p,{mic:'muy'});
chk('MICRÓFONO BAJO: un cuarto con ruido de fondo y nadie hablando NO se toma por voz, ni con la sensibilidad «muy alta» (y el medidor queda abajo) ('+j(r)+')',r.mudo===true&&r.avVoz===0&&r.nivMax<=15&&!r.error,j(r));
await cerrar(p);
// un ruido corto y bajito al abrir (un golpe, un soplido) y la voz que llega 2 s después: la grabación no se cierra a los 1,5 s del ruido
p=await abrir({rapido:true,nav:bRafaga,sinAGC:true});
r=await ESC(p,{mic:'alta'});
chk('MICRÓFONO: un ruido corto y bajito (300 ms) al abrir y la voz 2 s después: se graba la VOZ (la grabación no se da por terminada a los 1,5 s del ruido) ('+j(r)+')',!r.mudo&&r.ms>=3000&&r.pico>0.03,j(r));
await cerrar(p);
// el arranque del control automático de volumen del navegador (ruido fuerte los primeros segundos) no se toma por voz
p=await abrir({rapido:true,nav:bRuido12});
r=await ESC(p,{mic:'alta'});
chk('MICRÓFONO: con el control de volumen del navegador y ruido de fondo constante, el arranque no se toma por voz: se graba la voz que llega a los 2,5 s ('+j(r)+')',!r.mudo&&r.ms>=1500&&r.pico>0.03,j(r));
await cerrar(p);
// el audio que va a la IA se sube siempre a un buen volumen
p=await abrir({rapido:true});
const w=await p.evaluate(async()=>{
  const T=I1.oral._t,dec=async b=>new Int16Array((await b.arrayBuffer()).slice(44));
  const seno=(n,amp)=>{const a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=amp*Math.sin(2*Math.PI*220*i/16000);return a};
  const pico=a=>{let m=0;for(const v of a)m=Math.max(m,Math.abs(v));return m/32767};
  const bajo=await dec(T.aWav([seno(16000,.01)],16000));
  const golpe=seno(16000,.01);golpe[8000]=.9;const bg=await dec(T.aWav([golpe],16000));let mid=0;for(let i=7000;i<7900;i++)mid=Math.max(mid,Math.abs(bg[i]));
  const fuerte=await dec(T.aWav([seno(16000,.8)],16000)),cero=await dec(T.aWav([new Float32Array(16000)],16000));
  return {bajo:+pico(bajo).toFixed(3),conGolpe:+(mid/32767).toFixed(3),fuerte:+pico(fuerte).toFixed(3),cero:pico(cero),n:bajo.length}});
chk('el audio que va a la IA se sube siempre a un buen volumen: una voz de 0,01 llega a ≈ 0,4, un golpe suelto no impide subirla, lo fuerte no se toca y el silencio queda en silencio ('+j(w)+')',w.bajo>0.35&&w.bajo<0.5&&w.conGolpe>0.3&&w.fuerte>0.75&&w.fuerte<0.82&&w.cero===0&&w.n===16000,j(w));
await cerrar(p);
// el ajuste: arranca en «alta», se guarda, se recuerda y la grabación lo usa; los valores absurdos no rompen nada
p=await abrir({rapido:true});
const m0=await p.evaluate(()=>I1_T.estado().mic);
await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});
const ops=await p.evaluate(()=>[...document.querySelectorAll('#ajMic option')].map(o=>o.value+(o.selected?'*':'')).join());
const etiquetas=await p.evaluate(()=>[...document.querySelectorAll('#ajMic option')].map(o=>o.textContent));
await p.selectOption('#ajMic','muy');
const m1=await p.evaluate(()=>({mic:I1_T.estado().mic,guardado:JSON.parse(localStorage.getItem('ingles1_estado')).mic}));
await p.reload();await p.waitForSelector('#pInicio .tema');
const m2=await p.evaluate(()=>I1_T.estado().mic);
chk('Ajustes → «Sensibilidad del micrófono»: tiene normal / alta / muy alta (con nombres cortos, que entran en una pantalla de 320 px), arranca en «alta», se guarda y se recuerda al recargar ('+ops+')',m0==='alta'&&ops==='normal,alta*,muy'&&etiquetas.every(t=>t.length<=9)&&m1.mic==='muy'&&m1.guardado==='muy'&&m2==='muy',j([m0,ops,etiquetas,m1,m2]));
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>window.__dijo});window.__micPedido=[];const o=I1.oral.escuchar;I1.oral.escuchar=a=>{window.__micPedido.push(a&&a.mic);return o(a)};await I1.oral.preparar(I1_T.estado())});
await p.evaluate(()=>{window.__dijo='red';const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok'});
await p.waitForSelector('#bMic');await p.click('#bMic');await p.waitForFunction(()=>/Escuché/.test(document.getElementById('oyo').innerText),null,{timeout:12000});
chk('al hablar, la grabación usa la sensibilidad elegida en Ajustes',await p.evaluate(()=>window.__micPedido[0]==='muy'),j(await p.evaluate(()=>window.__micPedido)));
await cerrar(p);
const absurdos=[];
for(const v of ['ultra',7,null,{},['muy'],'MUY','']){const q=await abrir({rapido:true,estado:JSON.stringify({v:1,mic:v})});absurdos.push(await q.evaluate(()=>I1_T.estado().mic));await cerrar(q)}
chk('un valor absurdo de sensibilidad guardado se ignora y queda «alta» ('+absurdos.join()+')',absurdos.every(x=>x==='alta'),j(absurdos));
// «Probar el micrófono» (Ajustes): escucha unos segundos y dice cómo se oyó
const probar=async(o)=>{const q=await abrir(Object.assign({rapido:true},o));await q.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});await q.click('#ajProbarMic');
  const ocupado=await q.evaluate(()=>document.getElementById('ajProbarMic').disabled);
  await q.waitForFunction(()=>!document.getElementById('ajProbarMic').disabled,null,{timeout:20000});
  const t=await q.evaluate(()=>document.getElementById('ajMicRes').textContent);await cerrar(q);return {t,ocupado,errs:q.errs}};
let pm=await probar({nav:bBaja,sinAGC:true,estado:JSON.stringify({v:1,mic:'normal'})});
chk('Probar el micrófono con una voz bajita: dice «se oye muy bajito» y sugiere acercarse o subir la sensibilidad ('+pm.t+')',/Se oye muy bajito/.test(pm.t)&&/sensibilidad/.test(pm.t)&&pm.ocupado&&pm.errs.length===0,j(pm));
pm=await probar({silencio:true});
chk('Probar el micrófono sin sonido: dice «no se oyó nada» ('+pm.t+')',/No se oyó nada/.test(pm.t)&&pm.errs.length===0,j(pm));
pm=await probar({});
chk('Probar el micrófono con una voz normal: dice que se oye bien (o que se oye fuerte) ('+pm.t+')',/Se oye (bien|muy fuerte)/.test(pm.t)&&pm.errs.length===0,j(pm));
pm=await probar({nav:bFuerte,sinAGC:true});
chk('Probar el micrófono con una voz tan fuerte que se recorta: dice «se oye muy fuerte» ('+pm.t+')',/Se oye muy fuerte/.test(pm.t)&&pm.errs.length===0,j(pm));
pm=await probar({sinMic:true});
chk('Probar el micrófono sin permiso: explica cómo permitirlo ('+pm.t+')',/micrófono/i.test(pm.t)&&/permit/i.test(pm.t),j(pm));
}

// ---------- 7c) HABLAR dice sin vueltas si estuvo bien o no (✅ ¡Correcto! · 🟡 Casi · ❌ Todavía no), con lo que escuchó
{
const p=await abrir({rapido:true});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;return window.__dijo}});window.__llamadas=0;return I1.oral.preparar(I1_T.estado())});
const preg=(tema,tp,id,modo)=>p.evaluate(([tema,tp,id,modo])=>{const t=I1.TEMA[tema],q=I1_T.ORAL[tp](t,id?I1.ITEM[id]:null);q.gen=tp;I1_T.probar(q,modo||'oral');I1_T.ronda().permiso='ok'},[tema,tp,id,modo]);
const decir=async texto=>{await p.evaluate(t=>{window.__dijo=t},texto);await p.waitForSelector('#bMic');await p.click('#bMic');
  await p.waitForFunction(()=>{const o=document.getElementById('oyo');return o&&o.innerText.trim()},null,{timeout:14000});await p.waitForTimeout(150);
  return p.evaluate(()=>{const o=document.getElementById('oyo'),v=o.querySelector('.vere');return {cls:v?v.className:'',txt:o.innerText.replace(/\s+/g,' ').trim(),mod:!!o.querySelector('.mod'),oir:[...o.querySelectorAll('.mod .oir')].map(b=>b.dataset.dec),baj:!!o.querySelector('.baj'),msg:document.getElementById('msg').innerText}})};
await preg('colores','nombrar','red');
let v=await decir("it's red");
chk('VEREDICTO bien: ✅ «¡Correcto!» con lo que escuchó, sin repetir la respuesta ('+v.txt+')',/vere ok/.test(v.cls)&&/¡Correcto!/.test(v.txt)&&/Escuché: «it's red»/.test(v.txt)&&!v.mod&&!v.baj,j(v));
await preg('colores','nombrar','red');
v=await decir('blue');
chk('VEREDICTO mal (1.er intento): ❌ «Todavía no» con lo que escuchó, sin mostrar la respuesta todavía y con «Try again!» ('+v.txt+')',/vere no/.test(v.cls)&&/Todavía no/.test(v.txt)&&/Escuché: «blue»/.test(v.txt)&&!v.mod&&/Try again|Let's try/.test(v.msg),j(v));
v=await decir('green');
chk('VEREDICTO mal (2.º intento): ❌ y ahora sí «Había que decir: red» con el 🔊 para escucharlo ('+v.txt+')',/vere no/.test(v.cls)&&v.mod&&/Había que decir: «red»/.test(v.txt)&&v.oir.length===2&&v.oir.every(x=>/red/i.test(x)),j(v));
await preg('colores','nombrar','pink');
v=await decir('pinc');
chk('VEREDICTO «casi»: 🟡 «Casi» y se puede intentar de nuevo ('+v.txt+')',/vere casi/.test(v.cls)&&/Casi/.test(v.txt)&&/Almost|Nearly/.test(v.msg),j(v));
// la IA no entendió ninguna palabra (un ruido que se tomó por voz, una voz muy baja): no hay nada que juzgar → se avisa, NO cuenta como intento
await preg('colores','nombrar','red');
await p.evaluate(()=>{window.__dijo=''});await p.click('#bMic');await p.waitForFunction(()=>/No entendí/.test(document.getElementById('msg').innerText),null,{timeout:14000});
const vacio=await p.evaluate(()=>({msg:document.getElementById('msg').innerText,oyo:document.getElementById('oyo').innerText.trim(),intentos:I1_T.ronda().qs[0].intentos||0,res:I1_T.ronda().res.length,mic:!!document.getElementById('bMic')}));
chk('SIN PALABRAS (la IA no entendió nada): «No entendí lo que dijiste. Try again!», sin ❌ y SIN gastar un intento ('+vacio.msg+')',/No entendí lo que dijiste. Try again/.test(vacio.msg)&&vacio.oyo===''&&vacio.intentos===0&&vacio.res===0&&vacio.mic,j(vacio));
v=await decir('blue');
chk('…y lo que se diga después sigue siendo el PRIMER intento: ❌ «Todavía no» sin mostrar la respuesta todavía ('+v.txt+')',/vere no/.test(v.cls)&&!v.mod&&/Try again|Let's try/.test(v.msg),j(v));
// en la prueba no se dice si estuvo bien
await preg('colores','nombrar','red','prueba');
v=await decir('blue');
chk('en «Mi prueba» NO se dice si estuvo bien: sólo «Escuché: …», sin ✅/❌ ni la respuesta ('+v.txt+')',v.cls===''&&/Escuché: «blue»/.test(v.txt)&&!/Correcto|Todavía no|Había que decir/.test(v.txt+v.msg),j(v));
chk('el veredicto no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// con una voz bajita: se avisa en el momento (el cartel del micrófono), si no alcanza no se manda nada a la IA y, si se equivoca, el veredicto explica que se oyó bajito
const p=await abrir({rapido:true,nav:bBaja,sinAGC:true,estado:JSON.stringify({v:1,mic:'normal'})});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;return window.__dijo}});window.__llamadas=0;return I1.oral.preparar(I1_T.estado())});
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok'});
await p.waitForSelector('#bMic');await p.click('#bMic');
await p.waitForFunction(()=>/Te oigo muy bajito/.test(document.getElementById('micT').textContent),null,{timeout:9000});
const vivo=await p.evaluate(()=>document.getElementById('micT').textContent);
await p.waitForFunction(()=>/Te escuché muy bajito/.test(document.getElementById('msg').innerText),null,{timeout:12000});
const fin=await p.evaluate(()=>({msg:document.getElementById('msg').innerText,llam:window.__llamadas,mic:!!document.getElementById('bMic'),res:I1_T.ronda().res.length}));
chk('VOZ BAJITA con sensibilidad «normal»: mientras escucha el cartel dice «Te oigo muy bajito: acercate y hablá más fuerte»; al cerrar, «Te escuché muy bajito… Try again!», sin llamar a la IA y con el micrófono a mano ('+vivo+')',/acercate/.test(vivo)&&/Try again/.test(fin.msg)&&fin.llam===0&&fin.mic&&fin.res===0,j([vivo,fin]));
await p.evaluate(()=>{window.__dijo='blue'});
await p.evaluate(()=>{I1_T.estado().mic='alta'});
await p.click('#bMic');await p.waitForFunction(()=>document.getElementById('oyo').innerText.trim(),null,{timeout:12000});await p.waitForTimeout(120);
const mal=await p.evaluate(()=>({txt:document.getElementById('oyo').innerText.replace(/\s+/g,' '),baj:!!document.querySelector('#oyo .baj'),cls:document.querySelector('#oyo .vere').className}));
chk('con la sensibilidad «alta» esa voz bajita SÍ se oye; si la IA entiende otra cosa el veredicto lo explica («Se oyó muy bajito: acercate…») ('+mal.txt+')',/vere no/.test(mal.cls)&&mal.baj&&/Se oyó muy bajito/.test(mal.txt),j(mal));
await p.evaluate(()=>{window.__dijo='red'});
await p.click('#bMic');await p.waitForFunction(()=>/vere ok/.test((document.querySelector('#oyo .vere')||{}).className||''),null,{timeout:12000});
chk('…y si dijo bien, ✅ «¡Correcto!» sin ningún reproche por el volumen',await p.evaluate(()=>!document.querySelector('#oyo .baj')&&/Correcto/.test(document.getElementById('oyo').innerText)));
chk('la voz bajita no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 7d) CONVERSAR: el profe pregunta lo básico (nombre, edad, cómo está, gustos, colores, contar, objetos, cuerpo, día) y el chico contesta hablando
{
const p=await abrir({rapido:true,estado:MANUAL,vp:{width:360,height:640}});
// 1) la conversación que se arma: siempre válida, con la respuesta modelo aceptada por el evaluador y sin repetir vueltas
const g=await p.evaluate(()=>{
  const bad=[],ST=I1_T.estado(),largos=new Set(),subs=new Set();
  for(const extra of [false,true])for(const nombre of ['','Valentina Sofía']){ST.extra=extra;ST.nombre=nombre;
    for(let k=0;k<120;k++){const T=I1_T.armarConv();largos.add(T.length);T.forEach(t=>subs.add(t.sub));
      if(T.length<9||T.length>10)bad.push('largo '+T.length);
      if(T[0].sub!=='hola'||T[1].sub!=='nombre'||T[2].sub!=='edad'||T[3].sub!=='estado'||T[T.length-1].sub!=='chau')bad.push('orden fijo roto');
      if(new Set(T.map(t=>t.sub)).size!==T.length)bad.push('vueltas repetidas');
      T.forEach(t=>{
        if(!t.dice||!t.es||!t.cuerpo||!t.ev||!t.mostrar||!t.dire||!(t.rea&&t.rea.length))bad.push('falta algo en «'+t.sub+'»');
        if(/[<>]/.test(t.dice+t.dire+t.rea.join('')))bad.push('etiquetas en «'+t.sub+'»');
        const ok=I1.oral.evaluar(t.ev,t.dire,ST);if(ok.res!=='ok')bad.push('«'+t.sub+'»: la respuesta modelo «'+t.dire+'» da '+ok.res);
        if(I1.oral.evaluar(t.ev,'',ST).res==='ok')bad.push('«'+t.sub+'»: el silencio da ok');
        if(I1.oral.evaluar(t.ev,'banana split',ST).res==='ok')bad.push('«'+t.sub+'»: cualquier cosa da ok');
        t.ids.forEach(id=>{if(!(I1.ITEM[id]||I1.PATID[id]||I1.GUSTOS.some(x=>'g-'+x.id===id)))bad.push('«'+t.sub+'»: id desconocido '+id)})})}}
  return {bad:[...new Set(bad)].slice(0,6),largos:[...largos].sort().join(),subs:[...subs].sort().join()}});
chk('CONVERSAR: 480 conversaciones armadas (con y sin «más palabras», con y sin nombre) tienen 9 o 10 vueltas en orden (hola, nombre, edad, cómo está, … , chau), sin repetir, con respuesta modelo que el evaluador acepta, el silencio y «banana split» no valen y los ítems existen ('+g.largos+' vueltas; '+g.subs.split(',').length+' tipos)',g.bad.length===0&&g.largos==='10,9'&&g.subs.split(',').length>=10,j(g));
// 2) entrar desde el inicio: el profe saluda y pregunta, el chico tiene el micrófono
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;return window.__dijo}});window.__llamadas=0;return I1.oral.preparar(I1_T.estado())});
const botonInicio=await p.evaluate(()=>{const b=document.getElementById('bConv');return {hay:!!b,txt:b?b.innerText.replace(/\s+/g,' '):''}});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvMic',{timeout:8000});
const ini=await p.evaluate(()=>{const C=I1_T.conv();return {n:C.turnos.length,prof:document.querySelectorAll('#chat .burb.prof').length,dice:document.querySelector('#chat .burb.prof .dice b').innerText,oir:!!document.querySelector('#chat .burb.prof .dice .oir'),num:document.getElementById('convNum').textContent,hablado:window.__dichos.slice(),skip:!!document.getElementById('bConvSaltar')}});
chk('CONVERSAR: el inicio tiene el botón «Conversar» y al tocarlo el profe saluda («Hello!»/«Hi!») con su 🔊, en voz alta, y el chico ve el micrófono, «Saltear» y el avance 1/'+ini.n+' ('+botonInicio.txt+')',botonInicio.hay&&/Conversar/.test(botonInicio.txt)&&/^(Hello|Hi)!$/.test(ini.dice)&&ini.oir&&ini.prof===1&&ini.num==='1/'+ini.n&&ini.hablado.some(x=>x.replace(/[!.?,]/g,'')===ini.dice.replace(/[!.?,]/g,''))&&ini.skip,j([botonInicio,ini]));
// 3) la conversación entera contestando bien cada vuelta (la IA simulada «oye» la respuesta modelo), en un celular chico (360×640)
const hechos=[],tapadas=[];
for(let k=0;k<11;k++){
  const T=await p.evaluate(()=>{const C=I1_T.conv();if(!C)return null;const t=C.turnos[C.i];return {i:C.i,sub:t.sub,dire:t.dire,tema:t.tema}});
  if(!T)break;
  // la pregunta nueva tiene que quedar a la vista, entre la barra de arriba y el pie fijo (el pie de la vuelta se dibuja después de la burbuja: antes la tapaba)
  await p.waitForTimeout(700);
  const vis=await p.evaluate(()=>{const ps=[...document.querySelectorAll('#chat .burb')],u=ps[ps.length-1],r=u.getBoundingClientRect(),c=document.getElementById('convCtl').getBoundingClientRect(),h=document.querySelector('#pConv .pbarra').getBoundingClientRect();return {abajo:Math.round(Math.max(0,r.bottom-c.top)),arriba:Math.round(Math.max(0,h.bottom-r.top)),alto:Math.round(r.height),libre:Math.round(innerHeight-h.bottom-c.height)}});
  if(!(vis.arriba<=1&&(vis.abajo<=1||vis.alto>vis.libre)))tapadas.push(k+': '+j(vis));
  const n=await p.evaluate(()=>document.querySelectorAll('#chat .burb.yo').length);
  await p.evaluate(t=>{window.__dijo=t},T.dire);await p.click('#bConvMic');
  await p.waitForFunction(n=>document.querySelectorAll('#chat .burb.yo').length>n,n,{timeout:18000});
  const bub=await p.evaluate(()=>{const b=[...document.querySelectorAll('#chat .burb.yo')].pop();return b?b.className+'|'+b.innerText.replace(/\s+/g,' '):''});
  hechos.push(T.sub+':'+(bub.split('|')[0].replace('burb yo ','')));
  if(!/burb yo ok/.test(bub)){hechos.push('«'+bub+'»');break}
  await p.waitForFunction(i=>{const C=I1_T.conv();return !C||C.i>i},T.i,{timeout:8000});
}
chk('CONVERSAR: en cada vuelta la pregunta nueva queda a la vista, entre la barra de arriba y el pie fijo del micrófono, sin quedar tapada ('+(tapadas.length?tapadas.join(' | '):hechos.length+' vueltas bien')+')',tapadas.length===0&&hechos.length>=9,j(tapadas));
await p.waitForSelector('#pFin:not([hidden])',{timeout:8000});
const fin=await p.evaluate(()=>{const S=I1_T.estado();return {h1:document.querySelector('#pFin h1').innerText,cuenta:document.querySelector('#pFin .fin-cuenta').innerText.replace(/\s+/g,' '),otra:!!document.getElementById('bConvOtra'),inicio:!!document.getElementById('bInicio'),convs:S.convs,estrellas:S.estrellas,rondas:S.rondas,dia:Object.values(S.dias).map(x=>x.join('/')).join(),C:I1_T.conv(),llam:window.__llamadas,repaso:document.querySelectorAll('#pFin .repaso li').length}});
chk('CONVERSAR de punta a punta contestando todo bien ('+hechos.length+' vueltas): cada vuelta muestra ✅ y pasa a la siguiente, al final «'+fin.h1+'» con «'+fin.cuenta+'», 3 estrellas, queda registrada y se puede empezar otra',hechos.every(x=>/:ok$/.test(x))&&fin.convs.length===1&&fin.convs[0].ok===hechos.length&&fin.convs[0].n===hechos.length&&fin.convs[0].casi===0&&fin.estrellas===3&&fin.rondas===1&&fin.C===null&&fin.otra&&fin.inicio&&fin.llam===hechos.length&&fin.repaso===0&&/Excellent/.test(fin.h1),j([hechos,fin]));
chk('CONVERSAR cuenta lo practicado: el día suma todas las vueltas como «bien» y las palabras practicadas suben de caja',/^\d+\/0$/.test(fin.dia)&&+fin.dia.split('/')[0]>=hechos.length&&await p.evaluate(()=>Object.keys(I1_T.estado().items).length>=3),fin.dia);
await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});
const aj=await p.evaluate(()=>document.querySelector('#pAjustes').innerText);
chk('Ajustes lista las conversaciones hechas («'+(aj.match(/\d+ de \d+ bien/g)||[]).join()+'»)',/Conversaciones/.test(aj)&&new RegExp(fin.convs[0].ok+' de '+fin.convs[0].n+' bien').test(aj));
chk('conversar no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// 4) equivocarse dos veces, saltear y salir
const p=await abrir({rapido:true,estado:MANUAL});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{window.__llamadas=(window.__llamadas||0)+1;return window.__dijo}});window.__llamadas=0;return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvMic',{timeout:8000});
const yo=()=>p.evaluate(()=>[...document.querySelectorAll('#chat .burb.yo')].map(b=>b.className.replace('burb yo ','')+'|'+b.innerText.replace(/\s+/g,' ')));
const hablar=async t=>{const n=await p.evaluate(()=>document.querySelectorAll('#chat .burb.yo').length);await p.evaluate(x=>{window.__dijo=x},t);await p.click('#bConvMic');await p.waitForFunction(n=>document.querySelectorAll('#chat .burb.yo').length>n,n,{timeout:16000});await p.waitForTimeout(100)};
await hablar('banana');
let y=await yo();let st=await p.evaluate(()=>({i:I1_T.conv().i,prof:[...document.querySelectorAll('#chat .burb.prof')].map(b=>b.innerText.replace(/\s+/g,' ')).pop(),sig:!!document.getElementById('bConvSig'),mic:!!document.getElementById('bConvMic'),res:I1_T.conv().res.length}));
chk('CONVERSAR mal (1.er intento): ❌ «Todavía no» con lo que escuchó, el profe dice «Try again!» y sigue la MISMA vuelta con el micrófono a mano (sin mostrar la respuesta todavía)',/^no\|.*Todavía no.*Escuché: «banana»/.test(y[0])&&!/Había que decir/.test(y[0])&&/Try again/.test(st.prof)&&st.i===0&&st.mic&&!st.sig&&st.res===0,j([y,st]));
await hablar('banana');
y=await yo();st=await p.evaluate(()=>({i:I1_T.conv().i,prof:[...document.querySelectorAll('#chat .burb.prof')].map(b=>b.innerText.replace(/\s+/g,' ')).pop(),sig:!!document.getElementById('bConvSig'),mic:!!document.getElementById('bConvMic'),res:I1_T.conv().res.map(x=>x.res),mal:I1_T.conv().mal,hecho:I1_T.conv().turnos[0].hecho}));
chk('CONVERSAR mal (2.º intento): ❌ con «Había que decir: Hello!», el profe dice «Listen: Hello!», cuenta como error, desaparece el micrófono y queda «Seguir ➜» (no pasa sola) ',/^no\|.*Había que decir: «Hello!»/.test(y[1])&&/Listen: Hello!/.test(st.prof)&&st.sig&&!st.mic&&st.res.join()==='no'&&st.mal===1&&st.hecho&&st.i===0,j([y,st]));
await p.waitForTimeout(800);
chk('…y espera: 0,8 s después sigue en la misma vuelta con «Seguir ➜»',await p.evaluate(()=>I1_T.conv().i===0&&!!document.getElementById('bConvSig')));
await p.click('#bConvSig');await p.waitForFunction(()=>I1_T.conv().i===1,null,{timeout:5000});
const sg=await p.evaluate(()=>({dice:[...document.querySelectorAll('#chat .burb.prof .dice b')].pop().innerText,mic:!!document.getElementById('bConvMic'),sig:!!document.getElementById('bConvSig')}));
chk('«Seguir ➜» pasa a la vuelta siguiente (el nombre): «What\'s your name?», con el micrófono de nuevo',sg.dice==="What's your name?"&&sg.mic&&!sg.sig,j(sg));
// «casi»: sólo el nombre suelto
await hablar('Ana');
y=await yo();
chk('CONVERSAR «casi» («Ana» sin «My name is…»): 🟡 «Casi» y se intenta otra vez ('+y[2]+')',/^casi\|.*Casi/.test(y[2])&&await p.evaluate(()=>I1_T.conv().i===1&&!I1_T.conv().turnos[1].hecho),j(y));
await hablar('my name is Ana');
await p.waitForFunction(()=>I1_T.conv().i===2,null,{timeout:6000});
y=await yo();
chk('…y al decir «My name is Ana» ✅ «¡Correcto!» y el profe reacciona con el nombre («Nice to meet you!»)',/^ok\|.*Correcto/.test(y[3])&&await p.evaluate(()=>/Nice to meet you/.test([...document.querySelectorAll('#chat .burb.prof')].pop().innerText)),j(y));
// saltear
await p.click('#bConvSaltar');
st=await p.evaluate(()=>({res:I1_T.conv().res.map(x=>x.res).join(),prof:[...document.querySelectorAll('#chat .burb.prof')].pop().innerText.replace(/\s+/g,' '),sig:!!document.getElementById('bConvSig')}));
chk('«Saltear · Skip» cuenta la vuelta como no lograda, el profe dice cómo era y queda «Seguir ➜» ('+st.prof+')',st.res==='no,ok,no'&&/Listen: I'm six/.test(st.prof)&&st.sig,j(st));
// salir mientras escucha suelta el micrófono
await p.click('#bConvSig');await p.waitForFunction(()=>I1_T.conv().i===3,null,{timeout:5000});
const a0=await p.evaluate(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length);
await p.click('#bConvMic');await p.waitForFunction(()=>/Te escucho/.test(document.getElementById('convMicT').textContent),null,{timeout:5000});
await p.click('#bConvSalir');await p.waitForSelector('#pInicio .tema');await p.waitForTimeout(300);
const lg=await p.evaluate(()=>({log:I1.oral._t.log.join('|'),C:I1_T.conv(),convs:I1_T.estado().convs.length}));
chk('salir de la conversación (✕) mientras el micrófono escucha lo suelta enseguida, no deja nada a medias y no cuenta como conversación hecha',(lg.log.match(/mic abierto/g)||[]).length===(lg.log.match(/mic soltado/g)||[]).length&&(lg.log.match(/mic abierto/g)||[]).length>a0&&lg.C===null&&lg.convs===0&&p.errs.length===0,j([lg,p.errs]));
await cerrar(p);
}
{
// 5) sin micrófono (sin permiso) se conversa con «Lo dijo bien» (lo confirma un grande)
const p=await abrir({rapido:true,sinMic:true});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvDije',{timeout:8000});
const sm=await p.evaluate(()=>({mic:!!document.getElementById('bConvMic'),dije:!!document.getElementById('bConvDije'),rep:!!document.getElementById('bConvRep'),skip:!!document.getElementById('bConvSaltar'),nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|'),notaEnPie:!!document.querySelector('#convCtl .aviso-c.nota')}));
chk('CONVERSAR sin permiso de micrófono: cómo permitirlo se explica UNA vez, como nota en el chat (no en el pie fijo), y quedan «Lo dijo bien», «Otra vez» y «Saltear» ('+sm.nota.slice(0,50)+'…)',!sm.mic&&sm.dije&&sm.rep&&sm.skip&&/micrófono/i.test(sm.nota)&&!sm.notaEnPie,j(sm));
await p.click('#bConvDije');await p.waitForFunction(()=>I1_T.conv().i===1,null,{timeout:6000});
chk('«Lo dijo bien» cuenta la vuelta como lograda y sigue (y la nota del permiso no se repite en cada vuelta)',await p.evaluate(()=>I1_T.conv().ok===1&&I1_T.conv().res[0].res==='ok'&&document.querySelectorAll('#chat .burb.yo.ok').length===1&&document.querySelectorAll('#chat .burb.sis').length===1));
chk('sin micrófono no se pide nada a la IA ni se rompe nada',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// 6) lo guardado de las conversaciones: con trampas no rompe y se recorta a 10
const raro=JSON.stringify({v:1,convs:[null,1,'x',{f:'x',ok:'9',casi:-3,n:0},{f:'2026-11-03',ok:99999,casi:2,n:5}].concat(Array(20).fill({f:'2026-11-04',ok:1,casi:0,n:2}))});
const p=await abrir({rapido:true,estado:raro});
const c=await p.evaluate(()=>({convs:I1_T.estado().convs,btn:document.getElementById('bConv').innerText.replace(/\s+/g,' ')}));
chk('las conversaciones guardadas con datos absurdos se limpian (fechas válidas, números acotados, a lo sumo 10) y el inicio sigue andando ('+c.convs.length+' guardadas)',c.convs.length<=10&&c.convs.every(x=>(x.f===''||/^\d{4}-\d{2}-\d{2}$/.test(x.f))&&x.ok>=0&&x.ok<=50&&x.casi>=0&&x.casi<=50&&x.n>=1&&x.n<=50)&&!/NaN|undefined/.test(c.btn)&&p.errs.length===0,j(c));
await cerrar(p);
}

// ---------- 7e) lo que halló la revisión independiente de Conversar: pie fijo alto sin permiso, doble toque, IA caída, resultado viejo, última vuelta, teclado y transparencia
{
// sin permiso de micrófono el pie no tapa la pregunta (celulares chicos, de costado y con letra grande)
const fallas=[];
for(const [w,h,zoom] of [[320,568,100],[360,640,100],[375,667,100],[640,360,100],[360,640,150],[320,568,150]]){
  const p=await abrir({rapido:true,sinMic:true,rm:true,vp:{width:w,height:h}});   // (con movimiento reducido el desplazamiento es instantáneo: se puede medir enseguida)
  if(zoom!==100)await p.evaluate(z=>{document.documentElement.style.fontSize=z+'%'},zoom);
  await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvDije',{timeout:8000});
  for(let k=0;k<2;k++){await p.click('#bConvDije');await p.waitForFunction(i=>I1_T.conv().i>i,k,{timeout:6000})}   // hasta la 3.ª vuelta (la de la tarta de cumpleaños)
  await p.waitForTimeout(300);
  const m=await p.evaluate(()=>{const ps=[...document.querySelectorAll('#chat .burb')],u=ps[ps.length-1],r=u.getBoundingClientRect(),cc=document.getElementById('convCtl'),c=cc.getBoundingClientRect(),hb=document.querySelector('#pConv .pbarra').getBoundingClientRect(),fijo=getComputedStyle(cc).position==='sticky';
    return {pie:Math.round(c.height),vh:innerHeight,fijo,abajo:Math.round(fijo?Math.max(0,r.bottom-c.top):0),arriba:Math.round(Math.max(0,hb.bottom-r.top)),alto:Math.round(r.height),libre:Math.round(innerHeight-hb.bottom-(fijo?c.height:0)),sx:document.documentElement.scrollWidth-innerWidth}});
  if(!(m.arriba<=1&&(m.abajo<=1||m.alto>m.libre)&&m.sx<=1))fallas.push(w+'×'+h+' letra '+zoom+'%: tapa/desborda '+j(m));
  if(w<h&&zoom===100&&!(m.fijo&&m.pie<=m.vh*0.45))fallas.push(w+'×'+h+': el pie sin micrófono mide '+m.pie+' de '+m.vh+' px (más de 45 %) o no es fijo');
  if(p.errs.length)fallas.push(w+'×'+h+': '+j(p.errs));
  await cerrar(p);
}
chk('CONVERSAR sin permiso de micrófono en 6 tamaños (320×568, 360×640, 375×667, de costado y con letra al 150 %): la pregunta nueva queda a la vista, el pie sin micrófono ocupa menos de 45 % de la pantalla y con letra enorme deja de ser fijo en vez de taparla',fallas.length===0,fallas.slice(0,4).join(' | '));
}
{
// doble toque en «Saltear»: el segundo toque cae sobre «Seguir ➜» (el pie cambia en el mismo lugar) y no tiene que apretarlo
const p=await abrir({estado:MANUAL});   // (sin «rapido»: la guarda del doble toque está activa)
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>window.__dijo});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvSaltar',{timeout:8000});await p.waitForTimeout(800);
const bx=await p.locator('#bConvSaltar').boundingBox(),x=bx.x+bx.width/2,y=bx.y+bx.height/2;
await p.touchscreen.tap(x,y);await p.waitForTimeout(120);await p.touchscreen.tap(x,y);await p.waitForTimeout(1300);
const dt=await p.evaluate(()=>({i:I1_T.conv().i,res:I1_T.conv().res.map(r=>r.res).join(),sig:!!document.getElementById('bConvSig'),prof:[...document.querySelectorAll('#chat .burb.prof')].pop().innerText.replace(/\s+/g,' ')}));
chk('CONVERSAR: un doble toque en «Saltear» salta UNA vez: el profe dice cómo era y queda «Seguir ➜» (el segundo toque no lo aprieta) ('+dt.prof+')',dt.i===0&&dt.res==='no'&&dt.sig&&/Listen: Hello|Listen: Hi/.test(dt.prof),j(dt));
await p.waitForTimeout(500);await p.touchscreen.tap(x,y);
await p.waitForFunction(()=>I1_T.conv().i===1,null,{timeout:6000});
chk('…y un toque después de esperar sí pasa a la vuelta siguiente',await p.evaluate(()=>I1_T.conv().i===1&&!!document.getElementById('bConvMic')));
chk('el doble toque no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// la IA cae dos veces seguidas: el aviso de la primera queda en el pie; el de la segunda (que explica el cambio a «Lo dijo bien») queda como nota del chat
const p=await abrir({rapido:true,estado:MANUAL});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>{throw new Error('boom 503 unavailable')}});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvMic',{timeout:8000});
await p.click('#bConvMic');await p.waitForFunction(()=>/No pude escuchar/.test(document.getElementById('convAviso').textContent),null,{timeout:15000});
const f1=await p.evaluate(()=>({aviso:document.getElementById('convAviso').textContent,mic:!!document.getElementById('bConvMic'),notas:document.querySelectorAll('#chat .burb.sis').length}));
await p.click('#bConvMic');await p.waitForSelector('#bConvDije',{timeout:15000});
const f2=await p.evaluate(()=>({mic:!!document.getElementById('bConvMic'),notas:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText)}));
chk('CONVERSAR con la IA caída: la 1.ª falla avisa «Probá de nuevo» en el pie y deja el micrófono; la 2.ª pasa a «Lo dijo bien» Y deja en el chat la explicación («Se contesta con «Lo dije»») ('+j(f2.notas)+')',/Probá de nuevo/.test(f1.aviso)&&f1.mic&&f1.notas===0&&!f2.mic&&f2.notas.length===1&&/Lo dije/.test(f2.notas[0]),j([f1,f2]));
await cerrar(p);
}
{
// un resultado viejo (la IA tardó y el chico ya saltó a la vuelta siguiente) no pisa el micrófono de la vuelta nueva
const p=await abrir({rapido:true,estado:MANUAL});
await p.evaluate(async()=>{window.__n=0;I1.oral._t.mock({generar:async()=>{window.__n++;if(window.__n===1){await new Promise(r=>setTimeout(r,2400));const m=document.getElementById('bConvMic');window.__alResolver={oyendo:!!m&&m.classList.contains('oyendo'),txt:(document.getElementById('convMicT')||{}).textContent};window.__rancia=true}return window.__dijo}});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvMic',{timeout:8000});
await p.evaluate(()=>{window.__dijo='Hello'});await p.click('#bConvMic');
await p.waitForFunction(()=>document.getElementById('bConvMic').classList.contains('pensando'),null,{timeout:9000});   // la IA «piensa» (2,4 s)
await p.click('#bConvSaltar');await p.waitForSelector('#bConvSig');await p.click('#bConvSig');
await p.waitForFunction(()=>I1_T.conv().i===1&&!!document.getElementById('bConvMic'),null,{timeout:6000});
await p.evaluate(()=>{window.__dijo='My name is Ana'});await p.click('#bConvMic');
await p.waitForFunction(()=>document.getElementById('bConvMic').classList.contains('oyendo'),null,{timeout:6000});
await p.waitForFunction(()=>window.__rancia===true,null,{timeout:8000});await p.waitForTimeout(250);
const st=await p.evaluate(()=>({alResolver:window.__alResolver,ahora:{oyendo:document.getElementById('bConvMic').classList.contains('oyendo')||document.getElementById('bConvMic').classList.contains('pensando'),txt:document.getElementById('convMicT').textContent},res:I1_T.conv().res.map(r=>r.res).join()}));
chk('CONVERSAR: la respuesta vieja de una vuelta saltada llega mientras se graba la nueva y NO pisa su micrófono (sigue «Te escucho…»; la vieja se descarta) ('+j(st)+')',st.alResolver&&st.alResolver.oyendo===true&&st.ahora.oyendo&&!/Tocá el micrófono/.test(st.ahora.txt)&&st.res==='no',j(st));
await p.waitForFunction(()=>I1_T.conv().i===2,null,{timeout:12000});
chk('…y la vuelta nueva se contesta bien después',await p.evaluate(()=>I1_T.conv().res.map(r=>r.res).join()==='no,ok'),j(await p.evaluate(()=>I1_T.conv().res)));
chk('el resultado viejo no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// «sin palabras» en Conversar: no cuenta como intento
const p=await abrir({rapido:true,estado:MANUAL});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>window.__dijo});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvMic',{timeout:8000});
await p.evaluate(()=>{window.__dijo=''});await p.click('#bConvMic');
await p.waitForFunction(()=>/No entendí/.test(document.getElementById('convAviso').textContent),null,{timeout:14000});
const v0=await p.evaluate(()=>({yo:document.querySelectorAll('#chat .burb.yo').length,intentos:I1_T.conv().turnos[0].intentos,mic:!!document.getElementById('bConvMic'),res:I1_T.conv().res.length}));
chk('CONVERSAR sin palabras (un ruido que se tomó por voz): «No entendí lo que dijiste. Try again!», sin burbuja ❌ y SIN gastar un intento',v0.yo===0&&v0.intentos===0&&v0.mic&&v0.res===0,j(v0));
await p.evaluate(()=>{window.__dijo='banana'});await p.click('#bConvMic');await p.waitForFunction(()=>document.querySelectorAll('#chat .burb.yo').length===1,null,{timeout:14000});
const v1=await p.evaluate(()=>({txt:document.querySelector('#chat .burb.yo').innerText.replace(/\s+/g,' '),intentos:I1_T.conv().turnos[0].intentos,sig:!!document.getElementById('bConvSig')}));
chk('…y lo siguiente es el PRIMER intento (❌ sin mostrar la respuesta, sigue la misma vuelta)',/Todavía no/.test(v1.txt)&&!/Había que decir/.test(v1.txt)&&v1.intentos===1&&!v1.sig,j(v1));
await cerrar(p);
}
{
// una conversación salteada de punta a punta: la última vuelta no dice «sigamos» (viene el resultado) y el teclado sigue en el pie
const p=await abrir({rapido:true,estado:MANUAL});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>window.__dijo});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#pConv:not([hidden]) #bConvSaltar',{timeout:8000});
const total=await p.evaluate(()=>I1_T.conv().turnos.length),foco=[];
await p.click('#bConvSaltar');await p.waitForSelector('#bConvSig');await p.click('#bConvSig');await p.waitForFunction(()=>I1_T.conv().i===1,null,{timeout:5000});
// con el teclado: «Saltear» → el foco pasa a «Seguir ➜»; «Seguir» → el foco pasa al micrófono de la vuelta nueva
await p.focus('#bConvSaltar');await p.keyboard.press('Enter');await p.waitForSelector('#bConvSig');foco.push(await p.evaluate(()=>document.activeElement.id));
await p.keyboard.press('Enter');await p.waitForFunction(()=>I1_T.conv().i===2,null,{timeout:5000});await p.waitForTimeout(120);foco.push(await p.evaluate(()=>document.activeElement.id));
// el resto se saltea con el mouse hasta que aparece el resultado
let guardia=0;
while(guardia++<40&&await p.evaluate(()=>!!I1_T.conv())){
  const e=await p.evaluate(()=>({sig:!!document.getElementById('bConvSig'),salt:!!document.getElementById('bConvSaltar')}));
  if(e.sig)await p.click('#bConvSig').catch(()=>{});else if(e.salt)await p.click('#bConvSaltar').catch(()=>{});
  await p.waitForTimeout(60);
}
await p.waitForSelector('#pFin:not([hidden])',{timeout:8000});
const fin=await p.evaluate(()=>({prof:[...document.querySelectorAll('#chat .burb.prof .rea')].map(x=>x.innerText),h1:document.querySelector('#pFin h1').innerText,cuenta:document.querySelector('#pFin .fin-cuenta').innerText.replace(/\s+/g,' '),repaso:document.querySelectorAll('#pFin .repaso li').length,convs:I1_T.estado().convs}));
chk('CONVERSAR salteada entera: la última vuelta termina con «OK! See you soon!» (no «sigamos»), el resultado dice «'+fin.cuenta+'» con «'+fin.h1+'» y lista todas las vueltas para repasar ('+fin.repaso+')',/See you soon/.test(fin.prof[fin.prof.length-1])&&!/continue|go on/i.test(fin.prof[fin.prof.length-1])&&/^0 de \d+ bien$/.test(fin.cuenta)&&fin.repaso===total&&/Let's talk again/.test(fin.h1)&&fin.convs.length===1,j(fin));
chk('con el teclado, al saltear el foco pasa a «Seguir ➜» y al seguir pasa al micrófono de la vuelta nueva ('+foco.join(' → ')+')',foco.join()==='bConvSig,bConvMic',j(foco));
chk('saltear todo no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// transparencia reducida, sin backdrop-filter e impresión: el pie de Conversar entra igual que las otras barras
const css=leer('ingles1/estilos.css');
chk('el pie de Conversar respeta «transparencia reducida» (sólido y sin blur), el respaldo sin backdrop-filter y no se imprime',/prefers-reduced-transparency:\s*reduce\)\s*\{\s*\.barra,\.pbarra,\.pie,\.convctl\{[^}]*backdrop-filter:\s*none/.test(css)&&/@supports not[^\n]*\.convctl\{background:var\(--bg\)\}/.test(css)&&/@media print\{[^}]*\.convctl/.test(css));
}

// ---------- 7f) CONVERSAR MANOS LIBRES: el micrófono se abre solo después de cada pregunta (no hay que tocarlo) y, si el aparato no deja, se vuelve a tocar
const IA_SEGUN_TURNO="I1.oral._t.mock({generar:async()=>{const C=I1_T.conv();return C?C.turnos[C.i].dire:''}})";   // la IA simulada «oye» la respuesta modelo de la vuelta en curso
const CUENTA_CLICS="window.__clicsMic=0;window.__clicsSig=0;document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#bConvMic,#bConvSig');if(t)window[t.id==='bConvMic'?'__clicsMic':'__clicsSig']++},true)";
const ABIERTOS=p=>p.evaluate(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length);
{
// una conversación entera SIN tocar el micrófono
const p=await abrir({rapido:true});
await p.evaluate(async([ia,clics])=>{window.__textos=new Set();new MutationObserver(()=>{const e=document.getElementById('convMicT');if(e)window.__textos.add(e.textContent)}).observe(document.body,{subtree:true,childList:true,characterData:true});eval(clics);eval(ia);return I1.oral.preparar(I1_T.estado())},[IA_SEGUN_TURNO,CUENTA_CLICS]);
const ini=await p.evaluate(()=>I1_T.estado().auto);
await p.click('#bConv');
await p.waitForSelector('#pFin:not([hidden])',{timeout:90000});
const f=await p.evaluate(()=>{const S=I1_T.estado(),lg=I1.oral._t.log.join('|');return {h1:document.querySelector('#pFin h1').innerText,cuenta:document.querySelector('#pFin .fin-cuenta').innerText.replace(/\s+/g,' '),convs:S.convs,abiertos:(lg.match(/mic abierto/g)||[]).length,soltados:(lg.match(/mic soltado/g)||[]).length,clicsMic:window.__clicsMic,clicsSig:window.__clicsSig,textos:[...window.__textos]}});
chk('MANOS LIBRES: el ajuste viene encendido y una conversación ENTERA ('+f.cuenta+') se hace sin tocar el micrófono ni «Seguir»: el micrófono se abre solo en cada vuelta ('+f.abiertos+' veces) y se suelta siempre',ini===true&&/^10 de 10 bien$|^9 de 9 bien$/.test(f.cuenta)&&f.abiertos===f.convs[0].n&&f.soltados===f.abiertos&&f.clicsMic===0&&f.clicsSig===0,j(f));
chk('MANOS LIBRES: el cartel del micrófono acompaña cada momento («Escuchá al profe…» → «Te escucho… ¡hablá!» → «Pensando…») ('+f.textos.join(' | ')+')',['Escuchá al profe…','Te escucho… ¡hablá!','Pensando…'].every(t=>f.textos.includes(t)),j(f.textos));
chk('MANOS LIBRES: de punta a punta sin errores en la consola',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// un error pide intentar otra vez SOLO («Try again!» y se vuelve a escuchar); al segundo error el profe da la respuesta y sigue solo
const p=await abrir({rapido:true});
await p.evaluate(async clics=>{eval(clics);window.__n={};I1.oral._t.mock({generar:async()=>{const C=I1_T.conv(),T=C.turnos[C.i];window.__n[C.i]=(window.__n[C.i]||0)+1;if(C.i===0&&window.__n[0]===1)return 'banana';if(C.i===1)return "I'm six";return T.dire}});return I1.oral.preparar(I1_T.estado())},CUENTA_CLICS);
await p.click('#bConv');
await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.i>=3},null,{timeout:60000});
const e=await p.evaluate(()=>{const C=I1_T.conv();return {res:C.res.map(r=>r.res).join(),i:C.i,intentos:[0,1].map(k=>C.turnos[k].intentos),clicsMic:window.__clicsMic,clicsSig:window.__clicsSig,tryAgain:[...document.querySelectorAll('#chat .burb.prof .rea')].filter(x=>/Try again/.test(x.innerText)).length,listen:[...document.querySelectorAll('#chat .burb.prof .rea')].filter(x=>/Listen:/.test(x.innerText)).length,intentosPedidos:window.__n}});
chk('MANOS LIBRES con errores, sin tocar nada: la vuelta 1 falla una vez («Try again!») y se vuelve a escuchar sola; la vuelta 2 falla dos veces, el profe da la respuesta («Listen: …») y SIGUE SOLO ('+e.res+')',e.res==='ok,no,ok'&&e.intentos[0]===2&&e.intentos[1]===2&&e.tryAgain>=2&&e.listen===1&&e.clicsMic===0&&e.clicsSig===0,j(e));
chk('MANOS LIBRES con errores: sin errores en la consola',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// sin contestar: «Try again!» y se escucha de nuevo; a la 2.ª vez sin contestar el profe da la respuesta y sigue; con 2 vueltas seguidas así se queda esperando («Seguir ➜»)
const p=await abrir({rapido:true,nav:bRuido,sinAGC:true});   // (un cuarto con un poco de ruido y nadie habla)
await p.evaluate(async clics=>{eval(clics);window.__I1_ESPERA=900;I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())},CUENTA_CLICS);
await p.click('#bConv');
await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.pausa===true},null,{timeout:40000});
await p.waitForTimeout(1500);
const s1=await p.evaluate(()=>{const C=I1_T.conv();return {tryAgain:window.__dichos.filter(x=>/Try again/.test(x)).length,res:C.res.map(r=>r.res).join(),i:C.i,pausa:C.pausa,sig:!!document.getElementById('bConvSig'),nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|'),abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length,intentos:C.turnos[0].intentos,sil:C.turnos[0].silencios}});
chk('MANOS LIBRES sin contestar: nada que juzgar (no gasta intentos), «Try again!» UNA vez por vuelta (no justo antes de dar la respuesta) y el profe da la respuesta; con 2 vueltas seguidas así se queda esperando en «Seguir ➜» con una nota ('+s1.res+')',s1.res==='no,no'&&s1.i===1&&s1.pausa&&s1.sig&&/El profe espera/.test(s1.nota)&&s1.intentos===0&&s1.sil===2&&s1.abiertos===4&&s1.tryAgain===2,j(s1));
await p.click('#bConvSig');await p.waitForFunction(()=>I1_T.conv().i===2&&I1_T.conv().pausa===false,null,{timeout:6000});
await p.waitForFunction(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length>=5,null,{timeout:8000});
chk('…y tocar «Seguir ➜» saca de la pausa: la vuelta siguiente vuelve a abrir el micrófono sola',true);
chk('sin contestar no rompe nada (sin errores en la consola)',p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
// el aparato no deja abrir el micrófono solo: vuelve a tocar, con un aviso, y no insiste
const p=await abrir({rapido:true,silencio:true});   // (un micrófono que llega en silencio total)
await p.evaluate(async()=>{window.__I1_ESPERA=1500;I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');
await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.auto===false},null,{timeout:20000});
await p.waitForTimeout(2500);
const d=await p.evaluate(()=>({nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|'),txt:document.getElementById('convMicT').textContent,espera:document.getElementById('bConvMic').classList.contains('espera'),abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length,i:I1_T.conv().i}));
d.fallas=await p.evaluate(()=>I1_T.estado().autoFalla);
chk('MANOS LIBRES con un micrófono que llega mudo (silencio total): lo avisa («tocá el micrófono para contestar»), vuelve a tocar, NO insiste abriéndolo otra vez y cuenta una falla ('+d.nota.slice(0,60)+'…)',/tocá el micrófono para contestar/.test(d.nota)&&d.txt==='Tocá el micrófono y contestá'&&!d.espera&&d.abiertos===1&&d.i===0&&d.fallas===1,j(d));
await p.click('#bConvMic');await p.waitForFunction(()=>/No te escuch/.test(document.getElementById('convAviso').textContent),null,{timeout:15000});
chk('…y tocándolo funciona como siempre (a mano)',await p.evaluate(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length===2));
await cerrar(p);
}
{
// el permiso se da al empezar pero después el aparato no deja abrir el micrófono solo (iPhone, por ejemplo): se vuelve a tocar con un aviso
const p=await abrir({rapido:true,micDesde:2});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');
await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.auto===false},null,{timeout:15000});
const q=await p.evaluate(()=>({nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|'),aviso:(document.getElementById('convAviso')||{}).textContent,i:I1_T.conv().i}));
q.fallas=await p.evaluate(()=>I1_T.estado().autoFalla);
chk('MANOS LIBRES: si el aparato no deja abrir el micrófono solo (permiso negado al reabrir), el motivo se avisa en el chat (no en el pie) y la conversación queda en la misma vuelta, contando una falla ('+q.nota.slice(0,50)+'…)',/micrófono/.test(q.nota)&&/permit/.test(q.nota)&&q.aviso===''&&q.i===0&&q.fallas===1&&p.errs.length===0,j([q,p.errs]));
await cerrar(p);
}
{
// un aparato que NUNCA deja abrir el micrófono solo (un iPhone, por ejemplo): a la 2.ª vez seguida deja de probarse y en «Para grandes» se ve por qué; volver a marcar la casilla vuelve a probar
const p=await abrir({rapido:true,micDesde:2,micError:'NotReadableError'});
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
const empezar=async()=>{await p.evaluate(()=>{I1_T.pintarInicio();I1_T.ir('pInicio')});await p.click('#bConv');await p.waitForSelector('#bConvMic')};
await empezar();await p.waitForFunction(()=>I1_T.conv().auto===false,null,{timeout:15000});
const f1=await p.evaluate(()=>({falla:I1_T.estado().autoFalla,auto:I1_T.estado().auto,nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|')}));
await empezar();await p.waitForFunction(()=>I1_T.conv().auto===false&&I1_T.estado().autoFalla===2,null,{timeout:15000});
const f2=await p.evaluate(()=>({falla:I1_T.estado().autoFalla,auto:I1_T.estado().auto,guardado:JSON.parse(localStorage.getItem('ingles1_estado')),nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|')}));
await p.evaluate(()=>{window.__abrir3=0;const g=navigator.mediaDevices.getUserMedia;navigator.mediaDevices.getUserMedia=c=>{window.__abrir3++;return g.call(navigator.mediaDevices,c)}});
await empezar();await p.waitForTimeout(1200);
const f3=await p.evaluate(()=>({auto:I1_T.conv().auto,intentos:window.__abrir3,txt:document.getElementById('convMicT').textContent}));
await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});
const aj=await p.evaluate(()=>({marcado:document.getElementById('ajAuto').checked,aviso:/Se apagó solo/.test(document.getElementById('pAjustes').innerText)}));
await p.click('#ajAuto');
const aj2=await p.evaluate(()=>({auto:I1_T.estado().auto,falla:I1_T.estado().autoFalla}));
chk('MANOS LIBRES en un aparato que nunca deja: 1.ª falla avisa; la 2.ª seguida apaga la prueba automática y lo dice; la 3.ª conversación ya empieza a mano sin intentar abrir el micrófono; en «Para grandes» se ve «Se apagó solo» y marcar la casilla lo vuelve a encender',f1.falla===1&&f1.auto===true&&f2.falla===2&&f2.auto===false&&f2.guardado.auto===false&&/ya no se prueba/.test(f2.nota)&&f3.auto===false&&f3.intentos===0&&f3.txt==='Tocá el micrófono y contestá'&&aj.marcado===false&&aj.aviso&&aj2.auto===true&&aj2.falla===0&&p.errs.length===0,j([f1,f2,f3,aj,aj2,p.errs]));
await cerrar(p);
}
{
// tocar el micrófono mientras el profe todavía habla: lo calla y se contesta YA (el micrófono no se abre dos veces); tocar el 🔊 de la pregunta la repite y después se escucha
const p=await abrir({rapido:true});
await p.evaluate(async([ia,clics])=>{eval(clics);eval(ia);const sy=window.speechSynthesis;sy.speak=u=>{window.__dichos.push(u.text);setTimeout(()=>{try{u.onstart&&u.onstart({});u.onend&&u.onend({})}catch(e){}},1800)};return I1.oral.preparar(I1_T.estado())},[IA_SEGUN_TURNO,CUENTA_CLICS]);   // (el profe tarda 1,8 s en cada frase)
await p.click('#bConv');await p.waitForSelector('#bConvMic');await p.waitForTimeout(400);
await p.click('#bConvMic');
await p.waitForFunction(()=>I1_T.conv().i===1||I1_T.conv().res.length>=1,null,{timeout:15000});
const a1=await p.evaluate(()=>({res:I1_T.conv().res.map(r=>r.res).join(),clics:window.__clicsMic,abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length}));
await p.waitForTimeout(2600);   // (la frase vieja del profe termina sola a los 1,8 s: no tiene que abrir otro micrófono)
const a2=await p.evaluate(()=>({abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length,i:I1_T.conv().i}));
chk('MANOS LIBRES: tocar el micrófono mientras el profe habla contesta ya (1 sola apertura, sin que la pregunta cortada abra otra) ('+j([a1,a2])+')',a1.res==='ok'&&a1.clics===1&&a1.abiertos===1&&a2.abiertos<=2&&p.errs.length===0,j([a1,a2,p.errs]));
await cerrar(p);
const p2=await abrir({rapido:true});
await p2.evaluate(async([ia])=>{eval(ia);const sy=window.speechSynthesis;sy.speak=u=>{window.__dichos.push(u.text);setTimeout(()=>{try{u.onstart&&u.onstart({});u.onend&&u.onend({})}catch(e){}},1500)};return I1.oral.preparar(I1_T.estado())},[IA_SEGUN_TURNO]);
await p2.click('#bConv');await p2.waitForSelector('#chat .burb.prof .dice .oir');await p2.waitForTimeout(300);
await p2.click('#chat .burb.prof .dice .oir');
await p2.waitForFunction(()=>I1_T.conv().res.length>=1,null,{timeout:20000});
const o=await p2.evaluate(()=>{const d=I1_T.conv().turnos[0].dice.replace(/[!.?,]/g,'');return {res:I1_T.conv().res.map(r=>r.res).join(),abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length,pregunta:d,veces:window.__dichos.filter(x=>x===d).length}});
chk('MANOS LIBRES: tocar el 🔊 de la pregunta la repite y después el micrófono se abre solo ('+j(o)+')',o.res==='ok'&&o.abiertos===1&&o.veces>=2&&p2.errs.length===0,j([o,p2.errs]));
await cerrar(p2);
}
{
// al irse la pantalla al fondo se pausa (no se escucha ni se sigue solo) y tocar el micrófono retoma
const p=await abrir({rapido:true});
await p.evaluate(async ia=>{eval(ia);const sy=window.speechSynthesis;sy.speak=u=>{window.__dichos.push(u.text);setTimeout(()=>{try{u.onstart&&u.onstart({});u.onend&&u.onend({})}catch(e){}},1800)};return I1.oral.preparar(I1_T.estado())},IA_SEGUN_TURNO);
await p.click('#bConv');await p.waitForSelector('#bConvMic');await p.waitForTimeout(300);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(2600);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});
const z=await p.evaluate(()=>({pausa:I1_T.conv().pausa,txt:document.getElementById('convMicT').textContent,abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length}));
chk('MANOS LIBRES: si la pantalla se va al fondo se pausa («En pausa · tocá el micrófono para seguir»), no abre el micrófono sola y no sigue ('+z.txt+')',z.pausa===true&&/En pausa/.test(z.txt)&&z.abiertos===0,j(z));
await p.click('#bConvMic');await p.waitForFunction(()=>I1_T.conv().res.length>=1,null,{timeout:15000});
chk('…y tocar el micrófono retoma: se contesta y la conversación sigue sola',await p.evaluate(()=>I1_T.conv().pausa===false&&I1_T.conv().res[0].res==='ok'));
await cerrar(p);
}
{
// el ajuste: encendido por defecto, se apaga en «Para grandes» (queda guardado) y entonces nada se abre solo; sin la voz del profe tampoco se abre solo
const p=await abrir({rapido:true});
await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});
const on=await p.evaluate(()=>({hay:!!document.getElementById('ajAuto'),marcado:document.getElementById('ajAuto').checked,label:document.getElementById('ajAuto').closest('label').getBoundingClientRect().height}));
await p.click('#ajAuto');
const off=await p.evaluate(()=>({auto:I1_T.estado().auto,guardado:JSON.parse(localStorage.getItem('ingles1_estado')).auto}));
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p.evaluate(()=>{I1_T.pintarInicio();I1_T.ir('pInicio')});await p.click('#bConv');await p.waitForSelector('#bConvMic');await p.waitForTimeout(2500);
const m=await p.evaluate(()=>({auto:I1_T.conv().auto,txt:document.getElementById('convMicT').textContent,espera:document.getElementById('bConvMic').classList.contains('espera'),abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length}));
chk('MANOS LIBRES: el ajuste «Conversar sin tocar» está en «Para grandes» (encendido), se apaga y queda guardado; apagado la conversación espera el toque del micrófono ('+m.txt+')',on.hay&&on.marcado&&on.label>=44&&off.auto===false&&off.guardado===false&&m.auto===false&&m.txt==='Tocá el micrófono y contestá'&&!m.espera&&m.abiertos===0,j([on,off,m]));
await cerrar(p);
const p2=await abrir({rapido:true,estado:JSON.stringify({v:1,voz:false})});
await p2.evaluate(async()=>{I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p2.click('#bConv');await p2.waitForSelector('#bConvMic');await p2.waitForTimeout(2000);
const v=await p2.evaluate(()=>({auto:I1_T.conv().auto,abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length}));
chk('MANOS LIBRES: con la voz del profe apagada no se abre solo (el chico no oye la pregunta): se toca el micrófono',v.auto===false&&v.abiertos===0,j(v));
await cerrar(p2);
const q=await abrir({rapido:true,estado:JSON.stringify({v:1,auto:'no sé'})});
chk('un valor absurdo de «sin tocar» guardado se ignora y queda encendido',await q.evaluate(()=>I1_T.estado().auto===true));
await cerrar(q);
}
{
// el «Seguir» tocado y el que viene solo no pasan dos vueltas
const p=await abrir({rapido:true,estado:MANUAL});
await p.click('#bConv');await p.waitForSelector('#bConvSaltar');await p.click('#bConvSaltar');await p.waitForSelector('#bConvSig');
await p.evaluate(()=>{const C=I1_T.conv(),T=C.turnos[C.i];I1_T.convSigue(T,true);I1_T.convSigue(T,true);I1_T.convSigue(T,true)});
await p.waitForTimeout(500);
chk('«Seguir» (tocado o solo) pasa UNA sola vuelta aunque se llame varias veces juntas',await p.evaluate(()=>I1_T.conv().i===1),j(await p.evaluate(()=>I1_T.conv().i)));
chk('…sin errores en la consola',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 7g) lo que halló la revisión independiente del modo manos libres: pantalla encendida, 🔊 en cualquier momento, voz que no anda, pausa con algo en vuelo
// una voz del aparato de mentira que corta de verdad (cancel() corta la frase que suena, como Chrome) y anota el orden de lo que pasa
const TTS_REAL=ms=>`(()=>{const sy=window.speechSynthesis;let cur=null;window.__orden=[];sy.cancel=()=>{if(cur){const c=cur;cur=null;try{c.onerror&&c.onerror({error:'canceled'})}catch(e){}}};sy.speak=u=>{if(u.volume===0)return;window.__dichos.push(u.text);window.__orden.push('dice:'+u.text);cur=u;setTimeout(()=>{if(cur===u)try{u.onstart&&u.onstart({})}catch(e){}},0);setTimeout(()=>{if(cur!==u)return;cur=null;window.__orden.push('fin:'+u.text);try{u.onend&&u.onend({})}catch(e){}},${ms})};const o=I1.oral.escuchar;I1.oral.escuchar=a=>{window.__orden.push('mic');return o(a)}})()`;
const ORDEN=p=>p.evaluate(()=>window.__orden.slice());
{
// la pantalla se mantiene encendida mientras dura la conversación manos libres (el chico no toca nada: sin esto el celular se bloquea a mitad); a mano no hace falta
const wake=`Object.defineProperty(navigator,'wakeLock',{configurable:true,value:{request:async()=>{window.__wake=(window.__wake||0)+1;const l={escuchas:[],released:false,release:async()=>{l.released=true;window.__wakeLibre=(window.__wakeLibre||0)+1},addEventListener:(n,f)=>{if(n==='release')l.escuchas.push(f)}};window.__wakeUlt=l;return l}}})`;
const p=await abrir({rapido:true});
await p.addInitScript(wake);await p.reload();await p.waitForSelector('#pInicio .tema');
await p.evaluate(async()=>{window.__wake=0;window.__wakeLibre=0;I1.oral._t.mock({generar:async()=>{const C=I1_T.conv();return C?C.turnos[C.i].dire:''}});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForSelector('#bConvMic');await p.waitForTimeout(400);
const w1=await p.evaluate(()=>({pidio:window.__wake,libre:window.__wakeLibre}));
// el navegador la suelta al irse al fondo; al volver se pide de nuevo
await p.evaluate(()=>{window.__wakeUlt.released=true;window.__wakeUlt.escuchas.forEach(f=>f());Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(200);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(300);
const w2=await p.evaluate(()=>({pidio:window.__wake}));
await p.click('#bConvSalir');await p.waitForSelector('#pInicio .tema');await p.waitForTimeout(200);
const w3=await p.evaluate(()=>({libre:window.__wakeLibre,ult:window.__wakeUlt.released}));
chk('MANOS LIBRES mantiene la PANTALLA ENCENDIDA (Wake Lock) mientras dura la conversación, la vuelve a pedir si el navegador la soltó al irse al fondo y la suelta al salir ('+j([w1,w2,w3])+')',w1.pidio===1&&w1.libre===0&&w2.pidio===2&&w3.ult===true&&p.errs.length===0,j([w1,w2,w3,p.errs]));
await cerrar(p);
const q=await abrir({rapido:true,estado:MANUAL});
await q.addInitScript(wake);await q.reload();await q.waitForSelector('#pInicio .tema');
await q.evaluate(async()=>{window.__wake=0;I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await q.click('#bConv');await q.waitForSelector('#bConvMic');await q.waitForTimeout(500);
chk('…y a mano (sin manos libres) no pide mantener la pantalla encendida',await q.evaluate(()=>window.__wake===0));
await cerrar(q);
}
{
// tocar el 🔊 de una burbuja VIEJA (el «Listen: …» de la vuelta anterior) mientras el profe pregunta no deja la vuelta colgada: después de oírlo se escucha solo
const p=await abrir({rapido:true});
await p.evaluate(async tts=>{eval(tts);I1.oral._t.mock({generar:async()=>{const C=I1_T.conv();return C.i===0?'banana':C.turnos[C.i].dire}});return I1.oral.preparar(I1_T.estado())},TTS_REAL(900));
await p.click('#bConv');
await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.i===1},null,{timeout:40000});   // (la vuelta 1 falló dos veces: el profe dio la respuesta y pasó a la 2)
await p.waitForSelector('#chat .burb.prof:last-of-type .dice');
await p.evaluate(()=>window.__orden.push('TOQUE'));
await p.evaluate(()=>{const b=[...document.querySelectorAll('#chat .burb.prof .oir')].find(x=>x.closest('.cb').innerText.includes('Listen:'));b.click()});
await p.waitForFunction(()=>{const C=I1_T.conv();return C.res.length>=2},null,{timeout:30000});
const o=await ORDEN(p);const i=o.indexOf('TOQUE');
const despues=o.slice(i+1);
chk('MANOS LIBRES: tocar el 🔊 de una burbuja VIEJA durante la vuelta nueva lo reproduce y, al terminar, el micrófono se abre solo (la vuelta no queda colgada) ('+despues.slice(0,5).join(' › ')+')',i>=0&&despues.some(x=>x==='mic')&&despues.indexOf('mic')>despues.findIndex(x=>/^fin:/.test(x))&&await p.evaluate(()=>I1_T.conv().res.map(r=>r.res).join()==='no,ok'),j(o.slice(-8)));
await cerrar(p);
}
{
// tocar el 🔊 de la pregunta justo después de «Try again!» (tras un silencio) o en los primeros 600 ms: la repetición no se corta, el micrófono espera a que termine
const p=await abrir({rapido:true,nav:bRuido,sinAGC:true});
await p.evaluate(async tts=>{eval(tts);window.__I1_ESPERA=900;I1.oral._t.mock({generar:async()=>{const C=I1_T.conv();return C?C.turnos[C.i].dire:''}});return I1.oral.preparar(I1_T.estado())},TTS_REAL(1200));
await p.click('#bConv');
await p.waitForFunction(()=>window.__orden.filter(x=>/^dice:Try again/.test(x)).length>=1,null,{timeout:20000});   // (empezó el «Try again!» de la 1.ª vez sin contestar)
await p.waitForTimeout(250);
const preg=await p.evaluate(()=>I1_T.conv().turnos[I1_T.conv().i].dice.replace(/[!.?,]/g,''));
await p.evaluate(()=>window.__orden.push('TOQUE'));
await p.click('#chat .burb.prof:last-of-type .dice .oir');
await p.waitForFunction(()=>{const o=window.__orden,i=o.indexOf('TOQUE');return o.slice(i).some(x=>/^fin:/.test(x))&&o.slice(i).filter(x=>x==='mic').length>=1},null,{timeout:20000});
const o=await ORDEN(p);const i=o.indexOf('TOQUE'),d=o.slice(i+1);
const finPreg=d.findIndex(x=>x==='fin:'+preg),mic=d.indexOf('mic');
chk('MANOS LIBRES: tocar el 🔊 de la pregunta mientras suena «Try again!» repite la pregunta COMPLETA y recién después abre el micrófono ('+d.slice(0,6).join(' › ')+')',finPreg>=0&&mic>finPreg,j(o.slice(-9)));
await cerrar(p);
}
{
// si la voz del aparato no anda (no hay o falla), el chico no oye la pregunta: no se abre el micrófono solo, se avisa y se sigue tocando
const p=await abrir({rapido:true});
await p.evaluate(async()=>{window.speechSynthesis.speak=u=>{if(u.volume===0)return;setTimeout(()=>{try{u.onerror&&u.onerror({error:'synthesis-failed'})}catch(e){}},5)};I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p.click('#bConv');await p.waitForFunction(()=>{const C=I1_T.conv();return C&&C.auto===false},null,{timeout:15000});
await p.waitForTimeout(1500);
const sv=await p.evaluate(()=>({nota:[...document.querySelectorAll('#chat .burb.sis')].map(x=>x.innerText).join('|'),abiertos:(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length,falla:I1_T.estado().autoFalla,i:I1_T.conv().i,res:I1_T.conv().res.length}));
chk('MANOS LIBRES con la VOZ del aparato rota: no se abre el micrófono solo ni se anota nada (el chico no oyó la pregunta), se avisa en el chat y se sigue tocando ('+sv.nota.slice(0,50)+'…)',/No se oye la voz del profe/.test(sv.nota)&&sv.abiertos===0&&sv.falla===1&&sv.i===0&&sv.res===0&&p.errs.length===0,j([sv,p.errs]));
await cerrar(p);
const p2=await abrir({rapido:true});
await p2.evaluate(async()=>{window.speechSynthesis.speak=()=>{throw new Error('el motor de voz no anda')};I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())});
await p2.click('#bConv');await p2.waitForFunction(()=>{const C=I1_T.conv();return C&&C.auto===false},null,{timeout:15000});
chk('…y si el motor de voz lanza un error pasa lo mismo',await p2.evaluate(()=>(I1.oral._t.log.join('|').match(/mic abierto/g)||[]).length===0&&I1_T.conv().res.length===0)&&p2.errs.length===0,j(p2.errs));
await cerrar(p2);
}
{
// la pantalla se va al fondo con la IA «pensando»: el veredicto se muestra pero la conversación no habla ni escucha estando en pausa; tocar el micrófono repite la pregunta y sigue
const p=await abrir({rapido:true});
await p.evaluate(async tts=>{eval(tts);I1.oral._t.mock({generar:async()=>{await new Promise(r=>setTimeout(r,1800));const C=I1_T.conv();return C?C.turnos[C.i].dire:''}});return I1.oral.preparar(I1_T.estado())},TTS_REAL(200));
await p.click('#bConv');
await p.waitForFunction(()=>document.getElementById('bConvMic')&&document.getElementById('bConvMic').classList.contains('pensando'),null,{timeout:15000});
await p.evaluate(()=>{window.__orden.push('OCULTA');Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(3500);
const z=await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));const C=I1_T.conv();return {i:C.i,pausa:C.pausa,res:C.res.map(r=>r.res).join(),txt:document.getElementById('convMicT')&&document.getElementById('convMicT').textContent,espera:document.getElementById('bConvMic')&&document.getElementById('bConvMic').classList.contains('espera'),orden:window.__orden.slice(window.__orden.indexOf('OCULTA')+1)}});
chk('MANOS LIBRES: si la pantalla se va con la IA pensando, el veredicto se muestra pero la conversación queda en PAUSA (no habla la pregunta siguiente ni abre el micrófono) y el micrófono no se ve «esperando» ('+j(z.orden)+')',z.res==='ok'&&z.i===1&&z.pausa===true&&/En pausa/.test(z.txt)&&z.espera===false&&z.orden.length===0,j(z));
await p.click('#bConvMic');
await p.waitForFunction(()=>I1_T.conv().res.length>=2,null,{timeout:30000});
const o=await ORDEN(p);const i=o.indexOf('OCULTA');
const resumen=o.slice(i+1);
chk('…y tocar el micrófono retoma: repite la pregunta y después escucha solo ('+resumen.slice(0,3).join(' › ')+')',/^dice:/.test(resumen[0])&&resumen[1]&&/^fin:/.test(resumen[1])&&resumen[2]==='mic'&&await p.evaluate(()=>I1_T.conv().pausa===false),j(resumen));
await cerrar(p);
}
{
// el micrófono «esperando al profe» se ve apagado SIN transparencia (un botón activo no baja de contraste)
const p=await abrir({rapido:true});
await p.evaluate(async tts=>{eval(tts);I1.oral._t.mock({generar:async()=>'red'});return I1.oral.preparar(I1_T.estado())},TTS_REAL(3000));
await p.click('#bConv');await p.waitForSelector('#bConvMic.espera');
const e=await p.evaluate(()=>{const c=getComputedStyle(document.getElementById('bConvMic'));return {op:c.opacity,filtro:c.filter}});
chk('MANOS LIBRES: el micrófono «esperando al profe» se ve apagado con un filtro de color y SIN bajar la opacidad (un botón activo mantiene el contraste) ('+j(e)+')',e.op==='1'&&/saturate/.test(e.filtro),j(e));
await cerrar(p);
}

// ---------- 8) lo que se pide afuera: sólo las fuentes de Google (y el SDK de la IA cuando se usa)
{
const p=await abrir({rapido:true});
await p.click('#pInicio .tema[data-tema="colores"]');await p.click('#bEsc');await p.waitForSelector('#pPreg .preg');await jugar(p,()=>true);await p.waitForSelector('#pFin:not([hidden])');
await p.evaluate(async()=>{I1.oral._t.mock({generar:async()=>'red'});await I1.oral.preparar(I1_T.estado())});
const ext=[...new Set(p.externos)];
chk('el sitio no le pide nada a otros servidores salvo las fuentes de Google y el SDK de Firebase de la IA ('+(ext.join(', ')||'ninguno')+')',ext.every(h=>/^(fonts\.googleapis\.com|fonts\.gstatic\.com|www\.gstatic\.com)$/.test(h)),j(ext));
chk('no se usan alert/confirm/prompt del navegador (los carteles son propios)',!/\b(alert|confirm|prompt)\s*\(/.test(leer('ingles1/app.js')+leer('ingles1/oral.js')));
chk('el código no usa eval ni new Function ni document.write',!/\beval\s*\(|new Function\s*\(|document\.write\s*\(/.test(leer('ingles1/app.js')+leer('ingles1/oral.js')+leer('ingles1/dibujos.js')+leer('ingles1/contenido.js')));
await cerrar(p);
}

// ---------- 9) DISEÑO: nada se sale, se pisa ni se corta, en 12 tamaños, con cada tipo de pregunta en su peor caso (y ya corregida)
const medir=()=>{
  const vw=innerWidth,out=[],pant=document.querySelector('.pantalla:not([hidden])');if(!pant)return ['no hay pantalla'];
  const desc=e=>e.tagName.toLowerCase()+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).split(' ')[0]+'«'+(e.innerText||e.value||e.getAttribute('aria-label')||'').slice(0,18).replace(/\n/g,' ')+'»';
  const de=document.documentElement;if(de.scrollWidth>vw+1)out.push('scroll horizontal: '+de.scrollWidth+' > '+vw);
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
  const caja=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top+scrollY,b:r.bottom+scrollY,w:r.width,h:r.height}};
  const botones=[...pant.querySelectorAll('button,input,select')].filter(vis);
  botones.forEach(e=>{const c=caja(e);
    if(c.l<-0.5||c.r>vw+0.5)out.push('se sale de la pantalla: '+desc(e)+' ['+Math.round(c.l)+','+Math.round(c.r)+']');
    if(e.matches('button,select,input[type=text]')&&(c.w<38||c.h<38))out.push('muy chico para el dedo: '+desc(e)+' '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('input[type=checkbox]')){const fila=e.closest('label');if(!fila||fila.getBoundingClientRect().height<44)out.push('casillero sin una fila grande para tocar: '+desc(e))}
    if(e.matches('.op,.ficha,.btn,.chip,.tema,.u,.fr,.card,.hueco-o,.slot,.modo')&&e.scrollWidth>e.clientWidth+1)out.push('texto cortado: '+desc(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.matches('.op,.ficha,.btn,.chip,.tema,.u,.fr,.card,.modo')&&e.scrollHeight>e.clientHeight+2)out.push('texto cortado (alto): '+desc(e));
    const nombre=(e.innerText||e.getAttribute('aria-label')||e.getAttribute('title')||'').trim();
    if(e.matches('button')&&!nombre)out.push('botón sin nombre (no lo lee un lector de pantalla): '+desc(e));
    if(e.matches('input,select')&&!(e.getAttribute('aria-label')||e.closest('label')))out.push('campo sin etiqueta: '+desc(e))});
  // lo de arriba de todo no se pisa entre sí (las barras fijas tapan lo que pasa por debajo a propósito, así que sólo se mira sin scroll)
  if(scrollY<=2){
    const bs=botones.filter(e=>!e.closest('.pie,.convctl'));
    for(let i=0;i<bs.length;i++)for(let k=i+1;k<bs.length;k++){if(bs[i].contains(bs[k])||bs[k].contains(bs[i]))continue;const a=caja(bs[i]),c=caja(bs[k]);const ix=Math.min(a.r,c.r)-Math.max(a.l,c.l),iy=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(ix>2&&iy>2)out.push('se pisan: '+desc(bs[i])+' y '+desc(bs[k]))}
    const bl=[...pant.querySelectorAll('.cons,.dib,.frase,.pal,.grupo,.slots,.ofila,.banco,.ops,.unir,.msg,.oral-caja>*,.cuerpo>.muneco,.fin-ests,.dos-notas,.tcab,.acciones,.modos,.temas')].filter(e=>vis(e)&&!e.closest('.pbarra'));
    for(let i=0;i<bl.length;i++)for(let k=i+1;k<bl.length;k++){if(bl[i].contains(bl[k])||bl[k].contains(bl[i]))continue;const a=caja(bl[i]),c=caja(bl[k]);const ix=Math.min(a.r,c.r)-Math.max(a.l,c.l),iy=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(ix>3&&iy>3)out.push('se pisan los bloques: '+desc(bl[i])+' y '+desc(bl[k]))}
  }
  [...pant.querySelectorAll('*')].forEach(e=>{if(!vis(e)||e.closest('svg'))return;const r=e.getBoundingClientRect();if(r.right>vw+1||r.left<-1){if(!out.some(x=>x.includes(desc(e))))out.push('contenido fuera de la pantalla: '+desc(e))}});
  return out;
};
const TAMANOS=[['celular chico 320×568',320,568],['Android chico 360×640',360,640],['iPhone 8 375×667',375,667],['iPhone 14 390×844',390,844],['iPhone Pro Max 430×932',430,932],['tableta vertical 768×1024',768,1024],['tableta horizontal 1024×768',1024,768],['compu 1280×800',1280,800],['iPhone 8 de costado 667×375',667,375],['Android de costado 740×360',740,360],['Android de costado 640×360',640,360],['iPhone 14 de costado 844×390',844,390]];
// por cada tema y tipo: las n preguntas de más texto (el peor caso) con «más palabras» y la ayuda en castellano
const lotePeor=(p,n)=>p.evaluate(n=>{
  const ST=I1_T.estado();ST.extra=true;ST.es=true;const lista=[];
  const tam=q=>JSON.stringify([q.ops&&q.ops.map(o=>o.aria),q.fichas&&q.fichas.length,q.pares&&q.pares.map(x=>x.der),q.cuerpo&&q.cuerpo.length,q.sol,q.w]).length;
  for(const modo of ['escrito','oral'])for(const t of I1.TEMAS){const G=modo==='oral'?I1_T.ORAL:I1_T.GEN;
    for(const tp of (modo==='oral'?t.ora:t.esc)){const its=t.items.length?I1_T.itemsDe(t):[null],qs=[];
      for(let k=0;k<10;k++){const it=its.length?its[Math.floor(Math.random()*its.length)]:null;let q=null;try{q=G[tp](t,it)}catch(e){}if(q){q.gen=tp;qs.push(q)}}
      qs.sort((a,b)=>tam(b)-tam(a));qs.slice(0,n).forEach(q=>lista.push({modo,tema:t.id,tp,q}))}}
  window.__lote=lista;return lista.map(x=>x.modo+' '+x.tema+'/'+x.tp);
},n);
for(const [nombre,w,h] of (RAPIDO?TAMANOS.slice(3,4):TAMANOS)){
  const p=await abrir({vp:{width:w,height:h},rapido:true});
  const falla=[];const m=async que=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  await p.evaluate(()=>{const s=I1_T.estado();s.extra=true;s.es=true;s.nombre='Valentina Sofía';I1_T.pintarInicio()});
  await m('inicio');
  for(const t of ['saludos','cuerpo','numeros','dias','meses','fecha','abc','colores','aula','yo','frases']){await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#pTema .tcab');await p.waitForTimeout(60);await m('estudio '+t);await p.click('#pTema [data-act="atras"]');await p.waitForSelector('#pInicio .tema')}
  await p.evaluate(()=>{I1_T.pintarPrueba()});await m('prueba (intro)');await p.evaluate(()=>{I1_T.pintarPruebaOral()});await m('prueba (parte oral)');
  await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});await m('ajustes');
  // conversar (con micrófono y sin él), el inicio con «Última: …» y el veredicto de «Hablar» en sus tres versiones (con un texto largo)
  await p.evaluate(()=>{I1_T.estado().convs=[{f:'2026-11-03',ok:7,casi:1,n:9}];I1_T.pintarInicio();I1_T.ir('pInicio')});await m('inicio con la última conversación');
  await p.evaluate(()=>{I1_T.convDemo(4,'ok')});await p.waitForTimeout(60);await m('conversar');
  await p.evaluate(()=>{I1_T.convDemo(2,'denied')});await p.waitForTimeout(60);await m('conversar (sin micrófono)');
  await p.evaluate(()=>{I1_T.convDemo(4,'ok',true)});await p.waitForTimeout(60);await m('conversar (manos libres)');
  for(const r of ['ok','casi','no']){await p.evaluate(r=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok';document.getElementById('oyo').innerHTML=I1_T.vereHTML(r,'it is a very long answer that the child said out loud','a long model sentence to say aloud',"It's red.",r!=='ok')},r);await p.waitForTimeout(40);await m('hablar: veredicto '+r)}
  await p.evaluate(()=>{I1_T.estado().convs=[];I1_T.pintarInicio();I1_T.ir('pInicio')});
  const corregidas=!RAPIDO&&['iPhone 14 390×844','celular chico 320×568','Android de costado 640×360'].some(x=>nombre===x);
  const lote=await lotePeor(p,corregidas?2:1);
  for(let i=0;i<lote.length;i++){
    await p.evaluate(i=>{const x=window.__lote[i];const s=I1_T.estado();s.ia=x.modo==='oral'&&window.__lote.__sinIA?false:s.ia;I1_T.probar(x.q,x.modo);I1_T.ronda().permiso='ok'},i);
    await p.waitForSelector('#pPreg .preg');await p.waitForTimeout(40);
    await m(lote[i]);
    if(corregidas&&lote[i].startsWith('escrito')&&i%2===0){await responder(p,false,false).catch(()=>{});await p.waitForTimeout(150);await m(lote[i]+' (corregida)')}
  }
  // la parte oral sin micrófono («Lo dije»)
  await p.evaluate(()=>{I1_T.estado().ia=false});
  for(const i of lote.map((x,k)=>x.startsWith('oral')?k:-1).filter(k=>k>=0).filter((k,n)=>n%3===0)){
    await p.evaluate(i=>{const x=window.__lote[i];I1_T.probar(x.q,x.modo);I1_T.ronda().permiso='ok'},i);await p.waitForSelector('#bHecho');await m(lote[i]+' (sin micrófono)')}
  await p.evaluate(()=>{I1_T.estado().ia=true;I1_T.terminarParte&&0;});
  // resultado
  await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.look(t,I1.ITEM.red),q2=I1_T.GEN.look(t,I1.ITEM.blue);q.gen=q2.gen='look';I1_T.probar(q,'escrito');const R=I1_T.ronda();R.qs=[q,q2];R.res=[{gen:'look',ids:['red'],res:'ok',tema:'colores'},{gen:'look',ids:['blue'],res:'no',tema:'colores'}];R.ok=1;R.mal=1;R.i=2;I1_T.terminarParte()});
  await p.waitForSelector('#pFin:not([hidden])');await p.waitForTimeout(200);await m('resultado');
  chk('diseño '+nombre+': inicio, 11 temas, prueba, ajustes, conversar, veredicto, '+lote.length+' preguntas (peor caso'+(corregidas?', sin corregir y corregidas':'')+') y resultado — nada se sale, se pisa ni se corta, todo tiene nombre',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
  await cerrar(p);
}
// letra grande (el chico o la familia agrandaron el texto del navegador: 150 %) y celular chico
for(const [nombre,w,h] of [['letra al 150 % en 390×844',390,844],['letra al 150 % en 320×568',320,568]]){
  const p=await abrir({vp:{width:w,height:h},rapido:true});await p.evaluate(()=>{document.documentElement.style.fontSize='150%'});
  const falla=[];const m=async que=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  await m('inicio');
  for(const t of ['cuerpo','abc','frases']){await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#pTema .tcab');await m('estudio '+t);await p.click('#pTema [data-act="atras"]');await p.waitForSelector('#pInicio .tema')}
  await p.evaluate(()=>{I1_T.convDemo(4,'ok')});await p.waitForTimeout(60);await m('conversar');
  await p.evaluate(()=>{I1_T.convDemo(2,'denied')});await p.waitForTimeout(60);await m('conversar (sin micrófono)');
  await p.evaluate(()=>{I1_T.convDemo(4,'ok',true)});await p.waitForTimeout(60);await m('conversar (manos libres)');
  await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok';document.getElementById('oyo').innerHTML=I1_T.vereHTML('no','it is a very long answer that the child said out loud','a long model sentence to say aloud',"It's red.",true)});await p.waitForTimeout(40);await m('hablar: veredicto');
  const lote=await lotePeor(p,1);
  for(let i=0;i<lote.length;i+=(RAPIDO?3:1)){await p.evaluate(i=>{const x=window.__lote[i];I1_T.probar(x.q,x.modo);I1_T.ronda().permiso='ok'},i);await p.waitForSelector('#pPreg .preg');await m(lote[i])}
  chk('diseño con '+nombre+': nada se sale, se pisa ni se corta',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
  await cerrar(p);
}

// ---------- 10) movimiento reducido: sin deslizamientos ni sacudidas (sólo cambia el color) y lo mismo funciona
{
const p=await abrir({rm:true,rapido:true});
const a=await p.evaluate(()=>{const cs=e=>getComputedStyle(document.querySelector(e));const dur=s=>Math.max(...String(s).split(',').map(x=>parseFloat(x)||0));
  return {pant:cs('#pInicio').animationName,btn:dur(cs('.modo').transitionDuration),tema:dur(cs('.tema').transitionDuration)}});
chk('con «reducir movimiento» las pantallas aparecen sólo con un fundido y los botones no animan ('+j(a)+')',a.pant==='velo'&&a.btn<0.001&&a.tema<0.001,j(a));
await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.look(t,I1.ITEM.red);q.gen='look';I1_T.probar(q,'escrito');I1_T.ronda().permiso='ok'});await p.waitForSelector('#area .op');
const b=await p.evaluate(()=>{const o=getComputedStyle(document.querySelector('#area .op'));return {anim:o.animationName,dur:parseFloat(o.animationDuration)}});
chk('con movimiento reducido las opciones tampoco suben ni se sacuden (fundido de 0,15 s) y se puede contestar igual',b.anim==='velo'&&b.dur<=0.2,j(b));
await jugar(p,()=>true);await p.waitForSelector('#pFin:not([hidden])');
chk('una ronda entera con movimiento reducido llega al resultado sin errores',p.errs.length===0&&await visible(p,'#pFin h1'),j(p.errs));
await cerrar(p);
}
{
const css=leer('ingles1/estilos.css');
chk('el estilo respeta transparencia reducida, contraste alto y modo oscuro, y no usa «user-select» en el texto de lectura',/prefers-reduced-transparency:\s*reduce/.test(css)&&/prefers-contrast:\s*more/.test(css)&&/prefers-color-scheme:\s*dark/.test(css)&&/prefers-reduced-motion:\s*reduce/.test(css)&&/backdrop-filter/.test(css));
chk('lo que se toca responde al APRETAR (:active con 80 ms) y vuelve con un resorte; el rebote queda sólo para las estrellas del final',/:active[^{]*\{[^}]*transition-duration:\s*80ms/.test(css)&&/--suave:\s*linear\(/.test(css)&&(css.match(/var\(--salto\)/g)||[]).length===1&&/\.fin-ests \.star\{[^}]*var\(--salto\)/.test(css));
}

// ---------- 11) contraste de los colores (WCAG AA = 4,5 a 1 para texto normal; 3 a 1 grande) en claro y en oscuro
for(const oscuro of (RAPIDO?[false]:[false,true])){
  const p=await abrir({oscuro,rapido:true});
  const malos=[];
  const medirContraste=async que=>{const r=await p.evaluate(()=>{
    const num=c=>c.match(/[\d.]+/g).map(Number),lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    const lum=c=>{const [r,g,b]=num(c);return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)};
    const fondo=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const a=num(c)[3];if(c!=='rgba(0, 0, 0, 0)'&&(a===undefined||a>0.5))return c;e=e.parentElement}return getComputedStyle(document.body).backgroundColor};
    const out=[];const pant=document.querySelector('.pantalla:not([hidden])');
    [...pant.querySelectorAll('*')].filter(e=>!e.closest('svg')&&!e.matches('.star,.pe,.mi,.ico,.mic-ico,.pic.pe,.par,.par i')&&!e.closest('.star,.pe,.mi,.ico,.mic-ico,.par')).forEach(e=>{
      const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const t=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());if(!t)return;
      const cs=getComputedStyle(e);if(+cs.opacity<.99&&e.matches('.u,.op,.ficha'))return;   // (las opciones ya usadas se atenúan a propósito)
      const a=lum(cs.color),b=lum(fondo(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
      if(ratio<(grande?3:4.5))out.push(e.className.split(' ')[0]+'«'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(e)+')')});
    return out});r.forEach(x=>malos.push(que+' → '+x))};
  await medirContraste('inicio');
  for(const t of ['cuerpo','abc','fecha','frases']){await p.click('#pInicio .tema[data-tema="'+t+'"]');await p.waitForSelector('#pTema .tcab');await medirContraste('estudio '+t);await p.click('#pTema [data-act="atras"]');await p.waitForSelector('#pInicio .tema')}
  await p.evaluate(()=>{I1_T.pintarPrueba()});await medirContraste('prueba');
  await p.evaluate(()=>{I1_T.pintarAjustes();I1_T.ir('pAjustes')});await medirContraste('ajustes');
  await p.evaluate(()=>{I1_T.estado().convs=[{f:'2026-11-03',ok:7,casi:1,n:9}];I1_T.pintarInicio();I1_T.ir('pInicio')});await medirContraste('inicio con la última conversación');
  await p.evaluate(()=>{I1_T.convDemo(4,'ok')});await p.waitForTimeout(450);await medirContraste('conversar');
  await p.evaluate(()=>{I1_T.convDemo(2,'denied')});await p.waitForTimeout(450);await medirContraste('conversar (sin micrófono)');
  await p.evaluate(()=>{I1_T.convDemo(4,'ok',true)});await p.waitForTimeout(450);await medirContraste('conversar (manos libres)');
  for(const r of ['ok','casi','no']){await p.evaluate(r=>{const t=I1.TEMA.colores,q=I1_T.ORAL.nombrar(t,I1.ITEM.red);q.gen='nombrar';I1_T.probar(q,'oral');I1_T.ronda().permiso='ok';document.getElementById('oyo').innerHTML=I1_T.vereHTML(r,'red','red',"It's red.",true)},r);await p.waitForTimeout(450);await medirContraste('hablar: veredicto '+r)}
  const lote=await lotePeor(p,2);
  for(let i=0;i<lote.length;i+=2){
    await p.evaluate(i=>{const x=window.__lote[i];I1_T.probar(x.q,x.modo);I1_T.ronda().permiso='ok'},i);await p.waitForSelector('#pPreg .preg');await p.waitForTimeout(450);   // (esperar a que terminen las entradas con fundido)
    await medirContraste(lote[i]);
    if(lote[i].startsWith('escrito')&&i%6===0){await responder(p,false,false).catch(()=>{});await p.waitForTimeout(400);await medirContraste(lote[i]+' (corregida)')}
    if(lote[i].startsWith('escrito')&&i%6===2){await responder(p,true,false).catch(()=>{});await p.waitForTimeout(400);await medirContraste(lote[i]+' (bien)')}
  }
  await p.evaluate(()=>{const t=I1.TEMA.colores,q=I1_T.GEN.look(t,I1.ITEM.red);q.gen='look';I1_T.probar(q,'escrito');const R=I1_T.ronda();R.res=[{gen:'look',ids:['red'],res:'no',tema:'colores'}];R.mal=1;R.i=1;I1_T.terminarParte()});await p.waitForTimeout(900);await medirContraste('resultado');
  chk('contraste de los textos en modo '+(oscuro?'oscuro':'claro')+' (4,5 a 1; 3 a 1 en texto grande) en inicio, estudio, prueba, ajustes, conversar, veredicto, preguntas, corregidas y resultado',malos.length===0,malos.slice(0,8).join(' | '));
  await cerrar(p);
}

await b.close();await bSil.close();await bBaja.close();await bRuido.close();await bRafaga.close();await bRuido12.close();await bFuerte.close();if(srv)srv.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length+' de '+res.length);
process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)});
