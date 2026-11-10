// Sitio completo, como en GitHub Pages: la raíz es el INICIO (un menú para entrar al Trinity 3, al Trinity 4, a Sala de 5 o a Beehive 3), Felu se abre desde /felu/ y Raphina desde /raphina/,
// Felu y Raphina usan el motor, los estilos y los audios de la raíz (Sala de 5 y Beehive 3 traen lo suyo); el service worker guarda las páginas y las abre sin internet cada una con la suya;
// el aviso de versión nueva mira el motor compartido; y los datos de Felu y de Raphina (mismo origen = mismo localStorage) no se mezclan.
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
const pHub=rutasRotas('index.html'),pFelu=rutasRotas('felu/index.html'),pRaph=rutasRotas('raphina/index.html'),pSala=rutasRotas('sala5/index.html'),pBee=rutasRotas('beehive3/index.html');
chk('Inicio: las '+pHub.n+' rutas de la página existen',pHub.rotas.length===0&&pHub.n>=5,JSON.stringify(pHub.rotas));
chk('Felu: las '+pFelu.n+' rutas de la página existen (con «../» hacia el motor, los estilos y los audios)',pFelu.rotas.length===0,JSON.stringify(pFelu.rotas));
chk('Raphina: las '+pRaph.n+' rutas de la página existen (con «../» hacia el motor, los estilos y los audios)',pRaph.rotas.length===0,JSON.stringify(pRaph.rotas));
chk('Sala de 5: las '+pSala.n+' rutas de la página existen (sus estilos, sus scripts, su lista de audios, el manifiesto y los íconos: no usa el motor de Trinity)',pSala.rotas.length===0&&pSala.n>=7,JSON.stringify(pSala.rotas));
chk('Beehive 3: las '+pBee.n+' rutas de la página existen (sus estilos, sus scripts, su lista de audios, el manifiesto y los íconos: tampoco usa el motor de Trinity)',pBee.rotas.length===0&&pBee.n>=7,JSON.stringify(pBee.rotas));
const toks=new Set(pFelu.tokens.concat(pRaph.tokens,pSala.tokens,pBee.tokens));
chk('los cuatro módulos piden los scripts y estilos con la MISMA marca de versión «?b=» ('+[...toks].join(',')+') y el inicio no carga el motor',toks.size===1&&pFelu.tokens.length>=4&&pRaph.tokens.length>=4&&pSala.tokens.length>=4&&pBee.tokens.length>=4&&pHub.tokens.length===0&&!/motor\.js/.test(fs.readFileSync(path.join(RAIZ,'index.html'),'utf8')));
const leerJ=f=>JSON.parse(fs.readFileSync(path.join(RAIZ,f),'utf8'));
const manH=leerJ('manifest.json'),manF=leerJ('felu/manifest.json'),manR=leerJ('raphina/manifest.json'),manS=leerJ('sala5/manifest.json'),manB=leerJ('beehive3/manifest.json');
const png=(dir,f)=>{const b=fs.readFileSync(path.join(RAIZ,dir,f));return b.readUInt32BE(16)+'x'+b.readUInt32BE(20)};
const BASE_PAGES='https://x.test/trinity-felu/';
const dentro=(m,dir)=>{const sc=new URL(m.scope,BASE_PAGES+dir+'manifest.json').href,st=new URL(m.start_url,BASE_PAGES+dir+'manifest.json').href;return st.startsWith(sc)};
chk('los cinco manifiestos: nombre propio, íconos del tamaño que dicen y la página de inicio dentro de su alcance',
  [[manH,'','Trinity GESE'],[manF,'felu/','Grade 3'],[manR,'raphina/','Grade 4'],[manS,'sala5/','Sala de 5'],[manB,'beehive3/','Beehive 3']].every(([m,d,n])=>m.name.includes(n)&&m.start_url==='./'&&dentro(m,d)&&m.icons.every(i=>png(d.replace(/\/$/,''),i.src)===i.sizes)));
chk('el inicio, Felu, Raphina, Sala de 5 y Beehive 3 se instalan como cinco apps distintas (otro «id») y los módulos tienen alcance «../» para que «Inicio» y el otro módulo abran dentro de la misma app',
  new Set([manH.id,manF.id,manR.id,manS.id,manB.id]).size===5&&manH.id==='/trinity-felu/'&&manF.id==='/trinity-felu/felu/'&&manR.id==='/trinity-felu/raphina/'&&manS.id==='/trinity-felu/sala5/'&&manB.id==='/trinity-felu/beehive3/'&&manF.scope==='../'&&manR.scope==='../'&&manS.scope==='../'&&manB.scope==='../'&&manH.scope==='./',JSON.stringify([manH.id,manF.id,manR.id,manS.id,manB.id]));
const hHub=fs.readFileSync(path.join(RAIZ,'index.html'),'utf8'),hFelu=fs.readFileSync(path.join(RAIZ,'felu/index.html'),'utf8'),hRaph=fs.readFileSync(path.join(RAIZ,'raphina/index.html'),'utf8');
chk('el inicio tiene las cuatro tarjetas (Trinity 3 → felu/, Trinity 4 → raphina/, Sala de 5 → sala5/, Beehive 3 → beehive3/) y cada módulo de Trinity una barra con Inicio · Trinity 3 · Trinity 4',
  /class="mod m3" href="felu\/"/.test(hHub)&&/class="mod m4" href="raphina\/"/.test(hHub)&&/class="mod m5" href="sala5\/"/.test(hHub)&&/class="mod m6" href="beehive3\/"/.test(hHub)&&[hFelu,hRaph].every(h=>/class="modbar"[\s\S]*href="\.\.\/"[\s\S]*Trinity 3[\s\S]*Trinity 4/.test(h))&&/class="on" href=".\/" aria-current="page">Trinity 3/.test(hFelu)&&/class="on" href=".\/" aria-current="page">Trinity 4/.test(hRaph));

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
chk('guarda las carpetas de Felu, de Raphina, de Sala de 5 y de Beehive 3 («./felu/», «./raphina/», «./sala5/», «./beehive3/»: es lo que abre cada app instalada) además de sus index.html, y el inicio',['felu/','felu/index.html','raphina/','raphina/index.html','sala5/','sala5/index.html','beehive3/','beehive3/index.html','beehive3/manifest.json','beehive3/icon.svg','beehive3/icon-192.png','beehive3/icon-512.png','beehive3/estilos.css','beehive3/contenido.js','beehive3/app.js','beehive3/audio/manifest.js','sala5/sala5.css','sala5/contenido.js','sala5/contenido2.js','sala5/adaptar.js','sala5/juego.js','sala5/juegos2.js','sala5/audio/manifest.js','','index.html','contenido-g3.js','contenido-g4.js'].every(x=>sw.guardado.has(sw.SITIO+x)));
let a=await sw.evento('activate');
chk('al activarse borra los cachés viejos y no el actual',sw.log.borrados.join()==='trinity-felu-v1',sw.log.borrados.join());
sw.linea(false);
const txt=async r=>{const x=r.res;return x?await x.text():''};
let r=await sw.pedir('raphina/',{mode:'navigate'});let t=await txt(r);
chk('SIN INTERNET: abrir /raphina/ muestra el módulo de Raphina',r.respondio&&/Grade 4/.test(t)&&/Raphina/.test(t)&&!/Trinity GESE Grade 3/.test(t));
r=await sw.pedir('felu/',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: abrir /felu/ muestra el módulo de Felu',r.respondio&&/<title>Trinity GESE Grade 3<\/title>/.test(t)&&!/Raphina · Trinity GESE/.test(t));
r=await sw.pedir('',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: abrir la raíz muestra el INICIO con las cuatro opciones (no un módulo)',/<title>Trinity GESE · Inicio<\/title>/.test(t)&&/href="felu\/"/.test(t)&&/href="raphina\/"/.test(t)&&/href="sala5\/"/.test(t)&&/href="beehive3\/"/.test(t)&&!/id="v-study"/.test(t));
r=await sw.pedir('sala5/',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: abrir /sala5/ muestra «Sala de 5» (no el inicio ni otro módulo)',r.respondio&&/<title>Sala de 5 · Jugar y aprender<\/title>/.test(t)&&/id="bJugar"/.test(t));
r=await sw.pedir('sala5/una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida dentro de /sala5/ cae en la portada de Sala de 5',/<title>Sala de 5 · Jugar y aprender<\/title>/.test(t)&&!/Trinity GESE · Inicio/.test(t));
r=await sw.pedir('sala5/juego.js?b=otra-marca-que-nunca-se-guardo');t=await txt(r);
chk('SIN INTERNET: los scripts de Sala de 5 se encuentran aunque la página pida otra marca «?b=»',t===fs.readFileSync(path.join(RAIZ,'sala5/juego.js'),'utf8'));
r=await sw.pedir('sala5/audio/es_hola.mp3');
chk('el service worker tampoco se mete con los audios de Sala de 5 (Safari pide los mp3 por partes)',!r.respondio);
r=await sw.pedir('beehive3/',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: abrir /beehive3/ muestra «Beehive 3» (no el inicio ni otro módulo)',r.respondio&&/<title>Beehive 3 · Prueba de inglés<\/title>/.test(t)&&/id="pInicio"/.test(t)&&!/Trinity GESE · Inicio/.test(t));
r=await sw.pedir('beehive3/una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida dentro de /beehive3/ cae en la portada de Beehive 3',/<title>Beehive 3 · Prueba de inglés<\/title>/.test(t)&&!/Trinity GESE · Inicio/.test(t));
r=await sw.pedir('beehive3/app.js?b=otra-marca-que-nunca-se-guardo');t=await txt(r);
chk('SIN INTERNET: los scripts de Beehive 3 se encuentran aunque la página pida otra marca «?b=»',t===fs.readFileSync(path.join(RAIZ,'beehive3/app.js'),'utf8'));
r=await sw.pedir('beehive3/audio/en_ate.mp3?a=abcd1234');
chk('el service worker tampoco se mete con los audios de Beehive 3',!r.respondio);
r=await sw.pedir('raphina/?lo=que-sea',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: /raphina/ con otra marca en la dirección sigue siendo Raphina',/Grade 4/.test(t));
r=await sw.pedir('felu/?lo=que-sea',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: /felu/ con otra marca en la dirección sigue siendo Felu',/<title>Trinity GESE Grade 3<\/title>/.test(t));
r=await sw.pedir('raphina/una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida dentro de /raphina/ cae en la portada de Raphina (no en la de Felu)',/Grade 4/.test(t)&&!/Trinity GESE Grade 3/.test(t));
r=await sw.pedir('felu/una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida dentro de /felu/ cae en la portada de Felu (no en la de Raphina ni en el inicio)',/<title>Trinity GESE Grade 3<\/title>/.test(t)&&!/<title>Trinity GESE Grade 4/.test(t)&&/id="v-study"/.test(t));
r=await sw.pedir('una-pagina-que-no-esta.html',{mode:'navigate'});t=await txt(r);
chk('SIN INTERNET: una dirección desconocida de la raíz cae en el inicio',/<title>Trinity GESE · Inicio<\/title>/.test(t));
r=await sw.pedir('estilos.css?b=otra-marca-que-nunca-se-guardo');t=await txt(r);
chk('SIN INTERNET: los estilos se encuentran aunque la página pida otra marca «?b=»',t===fs.readFileSync(path.join(RAIZ,'estilos.css'),'utf8'));
for(const [n,u,extra] of [['la consulta de versión nueva (?c=)','motor.js?c=123'],['la recarga (?v=)','raphina/?v=123'],['un audio mp3','audio/abc.mp3'],['un audio mp3 con su versión (?a=…, como los pide Sala de 5)','sala5/audio/es_hola.mp3?a=b9008605'],['un POST','motor.js',{method:'POST'}]]){
  r=await sw.pedir(u,extra);chk('el service worker no se mete con '+n,!r.respondio)}
r=await evento_otroOrigen();
async function evento_otroOrigen(){return sw.evento('fetch',{request:{url:'https://otro.sitio/x.js',method:'GET'}})}
chk('ni con lo que viene de otro sitio',!r.respondio);
sw.linea(true);
r=await sw.pedir('no-existe.js');const tOn=r.res.status;await new Promise(x=>setTimeout(x,20));
sw.linea(false);r=await sw.pedir('no-existe.js');
chk('un 404 con internet no se guarda para devolverlo después sin internet (sale el inicio, no el error)',tOn===404&&r.res.status===200&&/Trinity GESE · Inicio/.test(await txt(r)));

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

// 3-0) el INICIO: un menú; desde ahí se entra al Trinity 3 o al 4, y cada módulo tiene la barra para volver o pasar al otro
let T=await crear({documento:'real',sonda:'real'});let p=T.p;
await p.goto('https://trinity.test/');await p.waitForSelector('.mod');await p.waitForTimeout(300);
const rH=T.est.resp.map(x=>x[0]);
chk('el inicio abre desde la raíz sin errores y es liviano: no carga el motor ni ningún contenido ('+T.est.resp.length+' pedidos)',T.est.resp.every(x=>x[1]<400)&&T.est.fallos.length===0&&!rH.some(x=>/motor\.js|contenido-g|comun\.js|estilos\.css/.test(x))&&p.errs.length===0,JSON.stringify([rH,p.errs]));
const tarj=await p.evaluate(()=>[...document.querySelectorAll('.mod')].map(a=>({href:a.getAttribute('href'),txt:a.innerText.replace(/\s+/g,' '),w:a.getBoundingClientRect().width,h:a.getBoundingClientRect().height,visible:getComputedStyle(a).display!=='none'})));
chk('el inicio muestra las cuatro opciones, grandes y tocables: «Trinity 3 · Felu», «Trinity 4 · Raphina», «Sala de 5» y «Beehive 3»',tarj.length===4&&/Trinity 3/.test(tarj[0].txt)&&/Felu/.test(tarj[0].txt)&&/Trinity 4/.test(tarj[1].txt)&&/Raphina/.test(tarj[1].txt)&&/Sala de 5/.test(tarj[2].txt)&&/Beehive 3/.test(tarj[3].txt)&&tarj.every(c=>c.visible&&c.w>=300&&c.h>=100),JSON.stringify(tarj));
chk('sin haber entrado a ninguno todavía, el inicio no marca ninguna «Última vez»',await p.evaluate(()=>[...document.querySelectorAll('.ult')].every(e=>e.hidden)));
// entrar al 3 desde el menú
await Promise.all([p.waitForURL('**/felu/'),p.click('.mod.m3')]);await p.waitForSelector('#v-study');
chk('tocar «Trinity 3» abre el módulo de Felu (/felu/, Grade 3) con todo funcionando',new URL(p.url()).pathname==='/felu/'&&await p.evaluate(()=>MOD.id==="g3"&&BASE==="../"&&/Grade 3/.test(document.title)&&typeof armarPasos==="function")&&p.errs.length===0,p.url()+JSON.stringify(p.errs));
// la barra: pasar al 4, al inicio, y de nuevo al 3
await Promise.all([p.waitForURL('**/raphina/'),p.click('.modbar a[href="../raphina/"]')]);await p.waitForSelector('#v-study');
chk('desde Felu, «Trinity 4» de la barra de arriba abre el módulo de Raphina en un toque',new URL(p.url()).pathname==='/raphina/'&&await p.evaluate(()=>MOD.id==="g4"));
chk('la barra marca en cuál estás («Trinity 4») y tiene Inicio y Trinity 3',await p.evaluate(()=>{const a=[...document.querySelectorAll('.modbar a')];return a.length===3&&a.find(x=>x.classList.contains('on')).textContent.trim()==="Trinity 4"&&a.some(x=>/Inicio/.test(x.textContent))&&a.some(x=>x.textContent.trim()==="Trinity 3")}));
await Promise.all([p.waitForURL('**/felu/'),p.click('.modbar a[href="../felu/"]')]);await p.waitForSelector('#v-study');
chk('desde Raphina, «Trinity 3» de la barra abre otra vez el módulo de Felu: los dos siguen estando',new URL(p.url()).pathname==='/felu/'&&await p.evaluate(()=>MOD.id==="g3"));
await Promise.all([p.waitForURL('https://trinity.test/'),p.click('.modbar a.home')]);await p.waitForSelector('.mod');
chk('«🏠 Inicio» vuelve al menú, que ahora marca «Última vez» en el Trinity 3 (el último que se abrió) y en ninguno más',await p.evaluate(()=>{const m=[...document.querySelectorAll('.mod')];return m.length===4&&!m[0].querySelector('.ult').hidden&&m[1].querySelector('.ult').hidden&&m[2].querySelector('.ult').hidden&&m[3].querySelector('.ult').hidden}));
await Promise.all([p.waitForURL('**/raphina/'),p.click('.mod.m4')]);await p.waitForSelector('#v-study');
chk('tocar «Trinity 4» en el menú abre el módulo de Raphina',new URL(p.url()).pathname==='/raphina/'&&await p.evaluate(()=>MOD.id==="g4"));
// «Sala de 5»: se entra desde el menú, carga lo suyo (sus estilos, scripts y audios; nada del motor de Trinity) y queda marcada como «Última vez»
await p.goto('https://trinity.test/');await p.waitForSelector('.mod');
T.est.resp.length=0;T.est.fallos.length=0;p.errs.length=0;
await Promise.all([p.waitForURL('**/sala5/'),p.click('.mod.m5')]);await p.waitForSelector('#bJugar');await p.waitForTimeout(300);
const rS=T.est.resp.map(x=>x[0]);
chk('tocar «Sala de 5» en el menú abre /sala5/ con todo funcionando: sus estilos, scripts y lista de audios ('+T.est.resp.length+' pedidos, ninguno con error), sin el motor de Trinity y sin errores de página',
  new URL(p.url()).pathname==='/sala5/'&&await p.evaluate(()=>typeof S5==='object'&&S5.juegos.length>=43&&/Sala de 5/.test(document.title))&&['/sala5/sala5.css','/sala5/contenido.js','/sala5/contenido2.js','/sala5/adaptar.js','/sala5/juego.js','/sala5/juegos2.js','/sala5/audio/manifest.js'].every(x=>rS.includes(x))&&!rS.some(x=>/motor\.js|contenido-g|comun\.js|\/estilos\.css/.test(x))&&T.est.resp.every(x=>x[1]<400)&&T.est.fallos.length===0&&p.errs.length===0,JSON.stringify([rS,p.errs,T.est.fallos]));
T.est.resp.length=0;await p.click('#bJugar',{force:true});await p.waitForTimeout(800);
const mp3S=T.est.resp.filter(x=>/\.mp3$/.test(x[0]));
chk('en «Sala de 5» la voz sale de /sala5/audio/ (mp3 grabados, no los de Trinity) y llega bien ('+(mp3S[0]?mp3S[0][0]:'ninguno')+')',mp3S.length>=1&&mp3S.every(x=>x[0].startsWith('/sala5/audio/')&&x[1]<400&&/audio\/mpeg/.test(x[2])),JSON.stringify(mp3S));
await p.goto('https://trinity.test/');await p.waitForSelector('.mod');
chk('al volver al inicio, «Sala de 5» queda marcada como «Última vez» (y ya no el Trinity 4)',await p.evaluate(()=>{const m=[...document.querySelectorAll('.mod')];return m.length===4&&m[0].querySelector('.ult').hidden&&m[1].querySelector('.ult').hidden&&!m[2].querySelector('.ult').hidden&&m[3].querySelector('.ult').hidden}));
// «Beehive 3»: se entra desde el menú, carga lo suyo (sus estilos, scripts y audios; nada del motor de Trinity), anda y queda marcada como «Última vez»
T.est.resp.length=0;T.est.fallos.length=0;p.errs.length=0;
await Promise.all([p.waitForURL('**/beehive3/'),p.click('.mod.m6')]);await p.waitForSelector('#pInicio .tema');await p.waitForTimeout(300);
const rB=T.est.resp.map(x=>x[0]);
chk('tocar «Beehive 3» en el menú abre /beehive3/ con todo funcionando: sus estilos, scripts y lista de audios ('+T.est.resp.length+' pedidos, ninguno con error), sin el motor de Trinity y sin errores de página',
  new URL(p.url()).pathname==='/beehive3/'&&await p.evaluate(()=>typeof B3==='object'&&B3.TEMAS.length===7&&/Beehive 3/.test(document.title)&&document.querySelectorAll('#pInicio .tema').length===7)&&['/beehive3/estilos.css','/beehive3/contenido.js','/beehive3/app.js','/beehive3/audio/manifest.js'].every(x=>rB.includes(x))&&!rB.some(x=>/^\/(motor\.js|comun\.js|estilos\.css|contenido-g\d\.js)$/.test(x))&&T.est.resp.every(x=>x[1]<400)&&T.est.fallos.length===0&&p.errs.length===0,JSON.stringify([rB,p.errs,T.est.fallos]));
T.est.resp.length=0;
await p.click('.tema[data-tema="housework"]');await p.waitForSelector('#bPracticar');await p.click('#pTema .oir >> nth=0');await p.waitForTimeout(700);
const mp3B=T.est.resp.filter(x=>/\.mp3$/.test(x[0]));
chk('en «Beehive 3» la voz sale de /beehive3/audio/ (mp3 grabados, con su versión ?a=) y llega bien ('+(mp3B[0]?mp3B[0][0]:'ninguno')+')',mp3B.length>=1&&mp3B.every(x=>x[0].startsWith('/beehive3/audio/')&&x[1]<400&&/audio\/mpeg/.test(x[2])),JSON.stringify(mp3B));
await p.goto('https://trinity.test/');await p.waitForSelector('.mod');
chk('al volver al inicio, «Beehive 3» queda marcada como «Última vez» (y ya no Sala de 5)',await p.evaluate(()=>{const m=[...document.querySelectorAll('.mod')];return m.length===4&&m[0].querySelector('.ult').hidden&&m[1].querySelector('.ult').hidden&&m[2].querySelector('.ult').hidden&&!m[3].querySelector('.ult').hidden}));
await T.ctx.close();

// 3a) Raphina carga todo desde la raíz
T=await crear({documento:'real',sonda:'real'});p=T.p;
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

// 3b) Felu carga lo suyo desde /felu/ con el motor y los audios de la raíz, sin tocar nada de Raphina
T=await crear({documento:'real',sonda:'real'});p=T.p;
await p.goto('https://trinity.test/felu/');await p.waitForSelector('#v-study');await p.waitForTimeout(400);
const rF=T.est.resp.map(x=>x[0]),propiasF=rF.filter(x=>x.startsWith('/felu/'));
chk('Felu abre desde /felu/ con su contenido y SIN pedir nada de /raphina/ ni el contenido de Raphina',T.est.resp.every(x=>x[1]<400)&&T.est.fallos.length===0&&['/felu/','/motor.js','/comun.js','/contenido-g3.js','/estilos.css','/audio/manifest.js'].every(x=>rF.includes(x))&&!rF.some(x=>x.startsWith('/raphina/')||x==='/contenido-g4.js')&&p.errs.length===0,JSON.stringify(rF));
chk('de su propia carpeta sólo pide la página, el manifiesto y los íconos (nada de /felu/motor.js ni /felu/audio/)',propiasF.every(x=>/^\/felu\/(|index\.html|manifest\.json|icon[^/]*\.(png|svg))$/.test(x)),JSON.stringify(propiasF));
chk('Felu: BASE vale «../» y el módulo es g3',await p.evaluate(()=>BASE==="../"&&MOD.id==="g3"));
T.est.resp.length=0;await p.evaluate(()=>document.querySelectorAll('#v-study details').forEach(d=>d.open=true));
await p.locator('#v-study .chip, #v-study [data-say]').nth(2).click();await p.waitForTimeout(900);
const mp3F=T.est.resp.filter(x=>/\.mp3$/.test(x[0]));
chk('en Felu, tocar una palabra pide su audio a /audio/… y llega bien ('+(mp3F[0]?mp3F[0][0]+' '+mp3F[0][1]:'ninguno')+')',mp3F.length>=1&&mp3F.every(x=>x[0].startsWith('/audio/')&&x[1]<400&&/audio\/mpeg/.test(x[2])));
const mfF=await p.evaluate(async()=>{const l=document.querySelector('link[rel=manifest]');const m=await (await fetch(l.href)).json();const out=[];for(const i of m.icons){const r=await fetch(new URL(i.src,l.href).href);out.push([r.status,(await r.arrayBuffer()).byteLength])}
  const ap=document.querySelector('link[rel=apple-touch-icon]');const r=await fetch(ap.href);return {href:l.href,name:m.name,out,ap:r.status}});
chk('el manifiesto de Felu se descarga de /felu/manifest.json (Trinity GESE Grade 3 · Felu) y sus íconos existen',/trinity\.test\/felu\/manifest\.json$/.test(mfF.href)&&/Grade 3/.test(mfF.name)&&mfF.out.every(x=>x[0]===200&&x[1]>500)&&mfF.ap===200,JSON.stringify(mfF));
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
await p.goto('https://trinity.test/felu/');
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
chk('lo que Raphina guarda lleva SU prefijo (trinity_g4_…) o es un ajuste del aparato compartido ('+nuevas.join(', ')+')',nuevas.length>=4&&nuevas.every(k=>/^trinity_(g4_|ultimo$|vel$|voz2$|tap2$|estr$|eco_off$|sonido3$|ia_url$|aviso_pwa$)/.test(k)),nuevas.join());
await p.goto('https://trinity.test/felu/');await p.waitForSelector('#v-study');
const f2=await p.evaluate(()=>({notas:localStorage.getItem('trinity_notas'),vistas:localStorage.getItem('trinity_vistas'),leidas:Object.keys(vistasLeer()),hoja:!!document.getElementById('temaTitulo'),g4:Object.keys(localStorage).filter(k=>/^trinity_g4_/.test(k)).length}));
chk('Felu, después de usar Raphina, tiene sus notas y lo ya preguntado EXACTAMENTE como estaban',f2.notas===SEM_N&&f2.vistas===SEM_V&&f2.leidas.join()==='felu:visto,_n');
chk('y no le aparece nada de Raphina (sin hoja del tema); lo de Raphina sigue guardado aparte',!f2.hoja&&f2.g4>=3);
chk('sin errores de página en ningún momento',p.errs.length===0,JSON.stringify(p.errs));
await T.ctx.close();
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
