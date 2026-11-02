// Sitio completo, como en GitHub Pages: Raphina se abre desde /raphina/ y usa el motor, los estilos y los audios de la raíz;
// el service worker guarda las dos páginas y las abre sin internet cada una con la suya; el aviso de versión nueva mira el motor compartido;
// y los datos de Felu y de Raphina (mismo origen = mismo localStorage) no se mezclan.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const vm=require('vm');
const RAIZ=path.resolve(__dirname,'..');
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
// un servidor estático mínimo: «/carpeta/» → su index.html
const leerSitio=ruta=>{
  let rel=decodeURIComponent(ruta).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory())return null;
  return {cuerpo:fs.readFileSync(f),tipo:TIPOS[path.extname(f)]||'application/octet-stream'}};
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};

// ---------- 1) las páginas apuntan sólo a archivos que existen (una ruta mal puesta rompería el módulo sin avisar)
function rutasRotas(htmlRel){
  const dir=path.dirname(path.join(RAIZ,htmlRel));const h=fs.readFileSync(path.join(RAIZ,htmlRel),'utf8');const rotas=[],vistas=[];
  for(const m of h.matchAll(/\b(?:src|href)="([^"]+)"/g)){
    const u=m[1];if(/^(https?:|data:|mailto:|#|javascript:)/.test(u))continue;
    const sin=u.split('#')[0].split('?')[0];if(!sin)continue;vistas.push(u);
    const f=path.resolve(dir,sin);if(!fs.existsSync(f)||(fs.statSync(f).isDirectory()&&!fs.existsSync(path.join(f,'index.html'))))rotas.push(u)}
  return {rotas,n:vistas.length,tokens:[...h.matchAll(/\?b=([^"']+)/g)].map(m=>m[1])};
}
const pFelu=rutasRotas('index.html'),pRaph=rutasRotas('raphina/index.html');
chk('Felu: las '+pFelu.n+' rutas de la página existen',pFelu.rotas.length===0,JSON.stringify(pFelu.rotas));
chk('Raphina: las '+pRaph.n+' rutas de la página existen (con «../» hacia el motor, los estilos y los audios)',pRaph.rotas.length===0,JSON.stringify(pRaph.rotas));
const toks=new Set(pFelu.tokens.concat(pRaph.tokens));
chk('las dos páginas piden los scripts y estilos con la MISMA marca de versión «?b=» ('+[...toks].join(',')+')',toks.size===1&&pFelu.tokens.length>=4&&pRaph.tokens.length>=4);
const man=JSON.parse(fs.readFileSync(path.join(RAIZ,'raphina/manifest.json'),'utf8')),manF=JSON.parse(fs.readFileSync(path.join(RAIZ,'manifest.json'),'utf8'));
const png=f=>{const b=fs.readFileSync(path.join(RAIZ,'raphina',f));return b.readUInt32BE(16)+'x'+b.readUInt32BE(20)};
chk('el manifiesto de Raphina: nombre propio, abre en su carpeta, íconos del tamaño que dicen',/Grade 4/.test(man.name)&&man.start_url==='./'&&man.scope==='./'&&man.icons.every(i=>png(i.src)===i.sizes));
chk('Raphina y Felu se instalan como apps distintas (otro «id»)',man.id&&manF.id!==man.id&&man.id.endsWith('/raphina/'),JSON.stringify([manF.id,man.id]));

// ---------- 2) el service worker, simulado: instala todo, y sin internet cada módulo abre SU página
function simularSW(){
  const SITIO='https://trinity.test/trinity-felu/';   // la carpeta del proyecto en GitHub Pages
  const guardado=new Map(),oyentes={},log={borrados:[],skip:0};let enLinea=true,nombreCache='';
  const url=x=>new URL(typeof x==='string'?x:x.url,SITIO+'sw.js').href;
  const sirve=u=>{const p=new URL(u).pathname;if(!p.startsWith('/trinity-felu/'))return new Response('no',{status:404});
    const s=leerSitio(p.slice('/trinity-felu/'.length));return s?new Response(s.cuerpo,{status:200,headers:{'content-type':s.tipo}}):new Response('no',{status:404})};
  const fetchF=async x=>{if(!enLinea)throw new TypeError('Failed to fetch');return sirve(url(x))};
  const sinBusq=u=>{const y=new URL(u);y.search='';return y.href};
  const buscar=(x,o)=>{const u=url(x);let r=guardado.get(u);if(!r&&o&&o.ignoreSearch){const k=[...guardado.keys()].find(k=>sinBusq(k)===sinBusq(u));if(k)r=guardado.get(k)}return r?r.clone():undefined};
  const cache={
    addAll:async l=>{const rs=await Promise.all(l.map(async x=>{const r=await fetchF(x);if(!r.ok)throw new TypeError('addAll falló con '+url(x)+' → '+r.status);return [url(x),r]}));rs.forEach(([u,r])=>guardado.set(u,r))},
    put:async(x,r)=>{guardado.set(url(x),r)},match:async(x,o)=>buscar(x,o)};
  const caches={open:async()=>cache,match:async(x,o)=>buscar(x,o),keys:async()=>['trinity-felu-v1',nombreCache],delete:async k=>{log.borrados.push(k);return true}};
  const sb={URL,Response,Request,caches,fetch:fetchF,console,location:{origin:'https://trinity.test'},
    self:{addEventListener:(t,f)=>{oyentes[t]=f},skipWaiting:()=>{log.skip++;return Promise.resolve()},clients:{claim:async()=>{}}}};
  vm.createContext(sb);vm.runInContext(fs.readFileSync(path.join(RAIZ,'sw.js'),'utf8'),sb);
  nombreCache=vm.runInContext('CACHE',sb);const ARCHIVOS=vm.runInContext('ARCHIVOS',sb);
  async function evento(tipo,datos){let p;const e=Object.assign({waitUntil:x=>{p=x},respondWith:x=>{e.respondio=true;p=x}},datos);oyentes[tipo](e);return {respondio:!!e.respondio,res:p?await p:undefined}}
  const pedir=(u,extra)=>evento('fetch',{request:Object.assign({url:SITIO+u,method:'GET'},extra)});
  return {ARCHIVOS,guardado,log,evento,pedir,linea:v=>{enLinea=v},nombreCache,SITIO};
}
(async()=>{
const sw=simularSW();
let ok=true,motivo='';try{await sw.evento('install')}catch(e){ok=false;motivo=e.message}
chk('el service worker instala: los '+sw.ARCHIVOS.length+' archivos de su lista existen (si falta uno, no se instala nada)',ok&&sw.guardado.size===sw.ARCHIVOS.length&&sw.log.skip===1,motivo);
chk('guarda la carpeta de Raphina («./raphina/», que es lo que abre la app instalada) además de su index.html',sw.guardado.has(sw.SITIO+'raphina/')&&sw.guardado.has(sw.SITIO+'raphina/index.html')&&sw.guardado.has(sw.SITIO+'contenido-g4.js'));
let a=await sw.evento('activate');
chk('al activarse borra los cachés viejos y no el actual',sw.log.borrados.join()==='trinity-felu-v1',sw.log.borrados.join());
sw.linea(false);
const txt=async r=>{const x=r.res;return x?await x.text():''};
let r=await sw.pedir('raphina/',{mode:'navigate'});let t=await txt(r);
chk('SIN INTERNET: abrir /raphina/ muestra el módulo de Raphina',r.respondio&&/Grade 4/.test(t)&&/Raphina/.test(t)&&!/Trinity GESE Grade 3/.test(t));
r=await sw.pedir('',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: abrir la raíz muestra el módulo de Felu',/Trinity GESE Grade 3/.test(t)&&!/Raphina · Trinity GESE/.test(t));
r=await sw.pedir('raphina/?lo=que-sea',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: /raphina/ con otra marca en la dirección sigue siendo Raphina',/Grade 4/.test(t));
r=await sw.pedir('raphina/una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida dentro de /raphina/ cae en la portada de Raphina (no en la de Felu)',/Grade 4/.test(t)&&!/Trinity GESE Grade 3/.test(t));
r=await sw.pedir('una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida de la raíz cae en la portada de Felu',/Trinity GESE Grade 3/.test(t));
r=await sw.pedir('estilos.css?b=otra-marca-que-nunca-se-guardo');t=await txt(r);
chk('SIN INTERNET: los estilos se encuentran aunque la página pida otra marca «?b=»',t===fs.readFileSync(path.join(RAIZ,'estilos.css'),'utf8'));
for(const [n,u,extra] of [['la consulta de versión nueva (?c=)','motor.js?c=123'],['la recarga (?v=)','raphina/?v=123'],['un audio mp3','audio/abc.mp3'],['un POST','motor.js',{method:'POST'}]]){
  r=await sw.pedir(u,extra);chk('el service worker no se mete con '+n,!r.respondio)}
r=await evento_otroOrigen();
async function evento_otroOrigen(){return sw.evento('fetch',{request:{url:'https://otro.sitio/x.js',method:'GET'}})}
chk('ni con lo que viene de otro sitio',!r.respondio);
sw.linea(true);
r=await sw.pedir('no-existe.js');const tOn=r.res.status;await new Promise(x=>setTimeout(x,20));
sw.linea(false);r=await sw.pedir('no-existe.js');
chk('un 404 con internet no se guarda para devolverlo después sin internet (sale la portada, no el error)',tOn===404&&r.res.status===200&&/Trinity GESE/.test(await txt(r)));

// ---------- 3) el navegador de verdad, contra un «sitio» falso con la carpeta del proyecto
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
async function crear(srv){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});
  const est={docs:[],motor:[],resp:[],fallos:[]};let ultimaEsV=false;
  await ctx.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
  await ctx.route('https://fonts.gstatic.com/**',r=>r.abort());
  await ctx.route('https://trinity.test/**',async r=>{
    const u=new URL(r.request().url());
    if(u.pathname==='/firebase-config.js')return r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'});
    const s=leerSitio(u.pathname);if(!s)return r.fulfill({status:404,contentType:'text/plain',body:'no'});
    if(/\/$|\/index\.html$/.test(u.pathname)){ultimaEsV=/[?&]v=\d+/.test(u.search);est.docs.push(u.pathname+u.search);return r.fulfill({status:200,contentType:s.tipo,headers:{'cache-control':'no-store'},body:s.cuerpo})}
    if(u.pathname==='/motor.js'){
      const sonda=/[?&]c=\d+/.test(u.search);est.motor.push(u.search);
      const quien=sonda?srv.sonda:(ultimaEsV?'real':srv.documento);
      return r.fulfill({status:200,contentType:s.tipo,headers:{'cache-control':'no-store'},body:quien==='real'?s.cuerpo:s.cuerpo.toString().replace(/const BUILD="[^"]*"/,'const BUILD="vieja"')})}
    r.fulfill({status:200,contentType:s.tipo,body:s.cuerpo});
  });
  await ctx.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),100)}});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  p.on('response',r=>{const u=new URL(r.url());if(u.origin==='https://trinity.test')est.resp.push([u.pathname,r.status(),r.headers()['content-type']||''])});
  p.on('requestfailed',r=>{if(r.url().startsWith('https://trinity.test'))est.fallos.push(r.url())});
  return {ctx,p,est};
}

// 3a) Raphina carga todo desde la raíz
let T=await crear({documento:'real',sonda:'real'});let p=T.p;
await p.goto('https://trinity.test/raphina/');await p.waitForSelector('#v-study');await p.waitForTimeout(400);
const rutas=T.est.resp.map(x=>x[0]);
const propias=rutas.filter(x=>x.startsWith('/raphina/'));
chk('Raphina abre desde /raphina/ y no falta ningún archivo ('+T.est.resp.length+' pedidos, ninguno con error)',['/raphina/','/firebase-config.js'].every(x=>rutas.includes(x))&&T.est.resp.every(x=>x[1]<400)&&T.est.fallos.length===0,JSON.stringify(T.est.resp.filter(x=>x[1]>=400).concat(T.est.fallos)));
chk('trae el motor, los estilos, lo común, su contenido y los audios de la raíz — y NO el contenido de Felu',['/motor.js','/estilos.css','/comun.js','/contenido-g4.js','/audio/manifest.js'].every(x=>rutas.includes(x))&&!rutas.includes('/contenido-g3.js'),JSON.stringify(rutas));
chk('de su propia carpeta sólo pide la página, el manifiesto y los íconos (nada de /raphina/motor.js ni /raphina/audio/)',propias.every(x=>/^\/raphina\/(|index\.html|manifest\.json|icon[^/]*\.(png|svg))$/.test(x)),JSON.stringify(propias));
chk('BASE vale «../» y la página no tuvo errores',await p.evaluate(()=>BASE==="../"&&MOD.id==="g4")&&p.errs.length===0,JSON.stringify(p.errs));
// un audio: tocar una palabra pide el mp3 a /audio/ (la raíz), no a /raphina/audio/
await p.evaluate(()=>document.querySelectorAll('#v-study details').forEach(d=>d.open=true));
T.est.resp.length=0;
await p.locator('#vocab .chip').nth(3).click();await p.waitForTimeout(900);
const mp3=T.est.resp.filter(x=>/\.mp3$/.test(x[0]));
chk('tocar una palabra pide su audio a /audio/… y llega bien ('+(mp3[0]?mp3[0][0]+' '+mp3[0][1]+' '+mp3[0][2]:'ninguno')+')',mp3.length>=1&&mp3.every(x=>x[0].startsWith('/audio/')&&x[1]<400&&/audio\/mpeg/.test(x[2])));
// manifiesto e íconos tal como los ve el navegador
const mf=await p.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');const m=await (await fetch(l.href)).json();
  const out=[];for(const i of m.icons){const u=new URL(i.src,l.href).href;const r=await fetch(u);out.push([u,r.status,r.headers.get('content-type'),(await r.arrayBuffer()).byteLength])}
  const ap=document.querySelector('link[rel=apple-touch-icon]'),ic=document.querySelector('link[rel=icon]');const extra=[];for(const e of [ap,ic]){const r=await fetch(e.href);extra.push([e.href,r.status])}
  return {href:l.href,m,out,extra}});
chk('el manifiesto de Raphina se descarga de /raphina/manifest.json y sus íconos, el ícono de iPhone y el de la pestaña existen',/trinity\.test\/raphina\/manifest\.json$/.test(mf.href)&&mf.out.every(x=>x[1]===200&&/image\/png/.test(x[2])&&x[3]>500)&&mf.extra.every(x=>x[1]===200),JSON.stringify([mf.out,mf.extra]));
await T.ctx.close();

// 3b) Felu sigue cargando lo suyo desde la raíz, sin tocar nada de Raphina
T=await crear({documento:'real',sonda:'real'});p=T.p;
await p.goto('https://trinity.test/');await p.waitForSelector('#v-study');await p.waitForTimeout(400);
const rF=T.est.resp.map(x=>x[0]);
chk('Felu abre desde la raíz con su contenido y SIN pedir nada de /raphina/ ni el contenido de Raphina',T.est.resp.every(x=>x[1]<400)&&['/motor.js','/comun.js','/contenido-g3.js','/estilos.css'].every(x=>rF.includes(x))&&!rF.some(x=>x.startsWith('/raphina/')||x==='/contenido-g4.js')&&p.errs.length===0,JSON.stringify(rF));
chk('Felu: BASE vale vacío y el módulo es g3',await p.evaluate(()=>BASE===""&&MOD.id==="g3"));
await T.ctx.close();

// 3c) el aviso de versión nueva en Raphina: consulta el motor de la raíz y, si está vieja, se recarga en SU carpeta
T=await crear({documento:'real',sonda:'real'});p=T.p;
await p.goto('https://trinity.test/raphina/');await p.waitForTimeout(4500);
const ban=await p.evaluate(()=>{const e=document.querySelector('.rk-nuevo');return !!(e&&getComputedStyle(e).display!=='none')});
chk('misma versión: Raphina consulta /motor.js?c=… (no /raphina/motor.js), no se recarga y no muestra cartel',T.est.motor.some(q=>/^\?c=\d+$/.test(q))&&T.est.docs.length===1&&!ban,JSON.stringify([T.est.motor,T.est.docs]));
await T.ctx.close();
T=await crear({documento:'vieja',sonda:'real'});p=T.p;
await p.goto('https://trinity.test/raphina/');
await p.waitForFunction(()=>typeof BUILD!=='undefined'&&BUILD!=='vieja',null,{timeout:15000}).catch(()=>{});await p.waitForTimeout(1200);
const ver=await p.evaluate(()=>BUILD),real=/const BUILD="([^"]+)"/.exec(fs.readFileSync(path.join(RAIZ,'motor.js'),'utf8'))[1];
chk('abre con una versión vieja guardada: se recarga sola UNA vez, dentro de /raphina/, y queda la nueva ('+ver+')',ver===real&&T.est.docs.length===2&&/^\/raphina\/\?v=\d+$/.test(T.est.docs[1])&&new URL(p.url()).pathname==='/raphina/',JSON.stringify(T.est.docs)+' '+p.url());
await T.ctx.close();

// 3d) los datos de cada módulo en el mismo celular (mismo origen): ni se pisan ni se leen entre sí
T=await crear({documento:'real',sonda:'real'});p=T.p;
await p.goto('https://trinity.test/');
const felu=await p.evaluate(()=>({id:MOD.id,notas:MOD.notasKey,vistas:VISTAS_KEY,hoja:!!document.getElementById('temaTitulo')}));
const SEM_N=JSON.stringify([{f:1,m:'charla',n:9}]),SEM_V=JSON.stringify({'felu:visto':3,_n:4});
await p.evaluate(([n,v])=>{localStorage.setItem('trinity_notas',n);localStorage.setItem('trinity_vistas',v)},[SEM_N,SEM_V]);
const antes=await p.evaluate(()=>Object.keys(localStorage).sort());
await p.goto('https://trinity.test/raphina/');await p.waitForSelector('#v-study');
const rap=await p.evaluate(()=>({id:MOD.id,notas:MOD.notasKey,vistas:VISTAS_KEY,tema:TEMA_KEY,modo:MODO_KEY,leidas:Object.keys(vistasLeer()),propias:localStorage.getItem(MOD.notasKey),hoja:!!temaLeer()}));
chk('cada módulo tiene sus propias claves (notas, vistos, hoja del tema, modo de práctica)',felu.id==='g3'&&rap.id==='g4'&&![felu.notas,felu.vistas].some(k=>[rap.notas,rap.vistas,rap.tema,rap.modo].includes(k)),JSON.stringify([felu,rap]));
chk('Raphina no ve lo de Felu: ni sus notas, ni lo que ya se le preguntó, ni una hoja del tema',rap.leidas.length===0&&rap.propias===null&&!rap.hoja&&felu.hoja===false);
// Raphina usa la app: guarda su hoja, lo que ya se le preguntó, una nota, elige un modo y cambia la velocidad del examinador
await p.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat","comparar"]]});
  vistasGuardar({'raphina:visto':2,_n:3});localStorage.setItem(MOD.notasKey,JSON.stringify([{f:2,m:'examen',n:6}]));localStorage.setItem(MODO_KEY,JSON.stringify({modo:'tema',area:'azar'}));
  const v=document.getElementById('vel');if(v){v.value=v.options[v.options.length-1].value;v.dispatchEvent(new Event('change'))}});
const despues=await p.evaluate(()=>Object.keys(localStorage).sort());
const nuevas=despues.filter(k=>!antes.includes(k));
chk('lo que Raphina guarda lleva SU prefijo (trinity_g4_…) o es un ajuste del aparato compartido ('+nuevas.join(', ')+')',nuevas.length>=4&&nuevas.every(k=>/^trinity_(g4_|vel$|voz2$|tap2$|estr$|eco_off$|sonido3$|ia_url$|aviso_pwa$)/.test(k)),nuevas.join());
await p.goto('https://trinity.test/');await p.waitForSelector('#v-study');
const f2=await p.evaluate(()=>({notas:localStorage.getItem('trinity_notas'),vistas:localStorage.getItem('trinity_vistas'),leidas:Object.keys(vistasLeer()),hoja:!!document.getElementById('temaTitulo'),g4:Object.keys(localStorage).filter(k=>/^trinity_g4_/.test(k)).length}));
chk('Felu, después de usar Raphina, tiene sus notas y lo ya preguntado EXACTAMENTE como estaban',f2.notas===SEM_N&&f2.vistas===SEM_V&&f2.leidas.join()==='felu:visto,_n');
chk('y no le aparece nada de Raphina (sin hoja del tema); lo de Raphina sigue guardado aparte',!f2.hoja&&f2.g4>=3);
chk('sin errores de página en ningún momento',p.errs.length===0,JSON.stringify(p.errs));
await T.ctx.close();
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
