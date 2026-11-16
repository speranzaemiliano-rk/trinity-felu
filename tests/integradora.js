// «Prueba final integradora · Felipe» (carpeta integradora/): Sociales → las 23 provincias argentinas y la Ciudad de Buenos Aires con sus capitales, con un mapa. Naturales todavía no tiene temas.
// Cubre: que los DATOS estén bien (provincias, capitales, nombres para escribir y ciudades «trampa», contrastados con una tabla aparte); que el MAPA sea el de la Argentina (las 24 piezas, cada una
// donde corresponde: se comprueba tocando de verdad el punto de cada provincia, y que cada una esté al norte / sur / este / oeste de sus vecinas); que TODAS las preguntas que arma el programa (cada tipo ×
// cada provincia, muchas veces) tengan UNA sola respuesta correcta, opciones distintas y coherentes con los datos; el recorrido (inicio, tema, mapa para estudiar, cada actividad, el memotest, el simulacro de 30
// en 6 partes, el repaso de lo que salió mal, ajustes); que lo escrito valga sin tildes ni mayúsculas; que lo guardado roto no rompa nada y que ande con el almacenamiento bloqueado; que no pida nada a
// otros sitios (sólo las fuentes de Google); y el DISEÑO: nada se sale de la pantalla ni se pisa ni se corta, en 12 tamaños (de celular chico a compu, de pie y de costado), con el mapa y todos los tipos de
// pregunta (sin corregir y corregidos), y con contraste suficiente en claro y en oscuro.
// Se puede probar el sitio publicado:  URL=https://speranzaemiliano-rk.github.io/trinity-felu/integradora/ node tests/integradora.js
// Con  RAPIDO=1  el diseño se mira sólo en un tamaño (iPhone 14) y el contraste sólo en claro.
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');const vm=require('vm');
const RAIZ=path.resolve(__dirname,'..');
const RAPIDO=!!process.env.RAPIDO;
let URL=process.env.URL||null;   // sin URL: se levanta un servidor local con la carpeta del proyecto
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8'};
const servir=()=>new Promise(ok=>{const sv=http.createServer((rq,rs)=>{
  let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);
  if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);return rs.end('no')}
  rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});rs.end(fs.readFileSync(f))});
  sv.listen(0,'127.0.0.1',()=>ok(sv))});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);

// ---------- 1) los datos, contrastados con una tabla aparte (si alguien cambia una capital mal, esto lo agarra)
const sb={window:{}};vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora','contenido.js'),'utf8'),sb);vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora','mapa.js'),'utf8'),sb);
const INT=sb.window.INT,MAPA=sb.window.MAPA;
const NORMT=s=>String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
const ORO={buenosaires:['Buenos Aires','La Plata'],catamarca:['Catamarca','San Fernando del Valle de Catamarca'],chaco:['Chaco','Resistencia'],chubut:['Chubut','Rawson'],cordoba:['Córdoba','Córdoba'],corrientes:['Corrientes','Corrientes'],entrerios:['Entre Ríos','Paraná'],formosa:['Formosa','Formosa'],jujuy:['Jujuy','San Salvador de Jujuy'],lapampa:['La Pampa','Santa Rosa'],larioja:['La Rioja','La Rioja'],mendoza:['Mendoza','Mendoza'],misiones:['Misiones','Posadas'],neuquen:['Neuquén','Neuquén'],rionegro:['Río Negro','Viedma'],salta:['Salta','Salta'],sanjuan:['San Juan','San Juan'],sanluis:['San Luis','San Luis'],santacruz:['Santa Cruz','Río Gallegos'],santafe:['Santa Fe','Santa Fe'],santiago:['Santiago del Estero','Santiago del Estero'],tierradelfuego:['Tierra del Fuego','Ushuaia'],tucuman:['Tucumán','San Miguel de Tucumán']};
chk('son exactamente las 23 provincias argentinas, cada una con su capital (contrastado con una tabla aparte)',INT.PROVINCIAS.length===23&&Object.keys(ORO).length===23&&INT.PROVINCIAS.every(p=>ORO[p.id]&&p.corto===ORO[p.id][0]&&p.capital===ORO[p.id][1]),j(INT.PROVINCIAS.filter(p=>!ORO[p.id]||p.corto!==ORO[p.id][0]||p.capital!==ORO[p.id][1]).map(p=>p.id)));
chk('la provincia más austral lleva su nombre oficial completo (Tierra del Fuego, Antártida e Islas del Atlántico Sur) y acepta también «Tierra del Fuego»',INT.item('tierradelfuego').nombre==='Tierra del Fuego, Antártida e Islas del Atlántico Sur'&&INT.item('tierradelfuego').altNombre.includes('tierra del fuego'));
chk('la Ciudad Autónoma de Buenos Aires está aparte: no es una provincia, no tiene «capital» (es la capital del país) y su nota lo explica y nombra a La Plata',INT.CABA.tipo==='ciudad'&&INT.CABA.capital===null&&/no es una provincia/i.test(INT.CABA.nota)&&/La Plata/.test(INT.CABA.nota)&&INT.ITEMS.length===24&&INT.ITEMS.filter(x=>x.tipo==='provincia').length===23);
const ids=INT.ITEMS.map(x=>x.id),cortos=INT.PROVINCIAS.map(x=>NORMT(x.corto)),caps=INT.PROVINCIAS.map(x=>NORMT(x.capital));
chk('los nombres no se repiten (ni los ids, ni las provincias, ni las capitales)',new Set(ids).size===24&&new Set(cortos).size===23&&new Set(caps).size===23);
const CIUDAD_DE={'Mar del Plata':'buenosaires','Bahía Blanca':'buenosaires','Roque Sáenz Peña':'chaco','Comodoro Rivadavia':'chubut','Trelew':'chubut','Villa Carlos Paz':'cordoba','Goya':'corrientes','Concordia':'entrerios','Gualeguaychú':'entrerios','Clorinda':'formosa','Palpalá':'jujuy','General Pico':'lapampa','Chilecito':'larioja','San Rafael':'mendoza','Oberá':'misiones','Puerto Iguazú':'misiones','San Martín de los Andes':'neuquen','Bariloche':'rionegro','General Roca':'rionegro','Tartagal':'salta','Villa Mercedes':'sanluis','Caleta Olivia':'santacruz','El Calafate':'santacruz','Rosario':'santafe','La Banda':'santiago','Río Grande':'tierradelfuego','Concepción':'tucuman'};
chk('las ciudades «trampa» (conocidas pero que NO son la capital) están en la provincia que dicen y ninguna es una capital',INT.PROVINCIAS.every(p=>p.trampas.every(t=>t==='Ciudad de Buenos Aires'?p.id==='buenosaires':CIUDAD_DE[t]===p.id&&!caps.includes(NORMT(t)))),j(INT.PROVINCIAS.flatMap(p=>p.trampas.filter(t=>t==='Ciudad de Buenos Aires'?p.id!=='buenosaires':CIUDAD_DE[t]!==p.id).map(t=>p.id+':'+t))));
chk('hay trampas en las provincias donde una ciudad grande confunde (Santa Fe→Rosario, Río Negro→Bariloche, Chubut→Comodoro Rivadavia, Buenos Aires→la Ciudad de Buenos Aires)',INT.item('santafe').trampas.includes('Rosario')&&INT.item('rionegro').trampas.includes('Bariloche')&&INT.item('chubut').trampas.includes('Comodoro Rivadavia')&&INT.item('buenosaires').trampas.includes('Ciudad de Buenos Aires'));
const alias=(id,tipo,x)=>INT.item(id)[tipo].includes(x);
chk('lo que se escribe vale de varias formas: «San Fernando» o «Catamarca», «San Salvador» o «Jujuy», «San Miguel» o «Tucumán», «Bs As»',alias('catamarca','altCapital','san fernando')&&alias('catamarca','altCapital','catamarca')&&alias('jujuy','altCapital','san salvador')&&alias('jujuy','altCapital','jujuy')&&alias('tucuman','altCapital','san miguel')&&alias('tucuman','altCapital','tucuman')&&alias('buenosaires','altNombre','bs as'));
chk('ninguna forma de escribir una provincia es el nombre de otra (no hay respuestas ambiguas), y «Buenos Aires» solo es la provincia, no la Ciudad',INT.ITEMS.every(a=>INT.ITEMS.every(b=>a===b||![a.corto,a.nombre,...a.altNombre].some(x=>[b.corto,b.nombre,...b.altNombre].some(y=>NORMT(x)===NORMT(y)))))&&!INT.item('buenosaires').altNombre.some(x=>NORMT(x)==='ciudad de buenos aires')&&!INT.CABA.altNombre.some(x=>NORMT(x)==='buenos aires'));
chk('el área Sociales trae el tema «Provincias y capitales» con las 24 piezas y Naturales figura como «pronto» (sin temas todavía)',INT.AREAS.length===2&&INT.AREAS[0].id==='sociales'&&INT.AREAS[0].temas.length===1&&INT.AREAS[0].temas[0].items.length===24&&INT.AREAS[1].id==='naturales'&&INT.AREAS[1].pronto===true&&INT.AREAS[1].temas.length===0);
// el mapa
chk('el mapa trae las 23 provincias y la Ciudad de Buenos Aires (los mismos ids que el contenido), cada una con su trazado y su punto, todo dentro del dibujo',Object.keys(MAPA.prov).sort().join()===ids.slice().sort().join()&&Object.values(MAPA.prov).every(p=>/^M[\d. -]+(L[\d. -]+)+Z/.test(p.d)&&p.cx>0&&p.cx<MAPA.w&&p.cy>0&&p.cy<MAPA.h),j(Object.keys(MAPA.prov)));
const caja=id=>{const n=(MAPA.prov[id].d.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number),x=n.filter((_,i)=>i%2===0),y=n.filter((_,i)=>i%2===1);return {x0:Math.min(...x),x1:Math.max(...x),y0:Math.min(...y),y1:Math.max(...y)}};
const P=id=>MAPA.prov[id];
// norte / sur / este / oeste entre vecinas (con los puntos «bien adentro» de cada provincia)
const NS=[['jujuy','tucuman'],['salta','catamarca'],['formosa','chaco'],['chaco','santafe'],['santafe','entrerios'],['entrerios','buenosaires'],['catamarca','sanjuan'],['sanjuan','mendoza'],['mendoza','neuquen'],['neuquen','rionegro'],['rionegro','chubut'],['chubut','santacruz'],['santacruz','tierradelfuego'],['cordoba','lapampa'],['lapampa','rionegro'],['sanluis','lapampa'],['misiones','corrientes'],['tucuman','santiago'],['santiago','cordoba'],['corrientes','entrerios'],['larioja','sanjuan'],['cordoba','buenosaires']];
const EO=[['mendoza','cordoba'],['sanjuan','sanluis'],['sanluis','cordoba'],['cordoba','santafe'],['santafe','entrerios'],['entrerios','misiones'],['lapampa','buenosaires'],['neuquen','rionegro'],['jujuy','formosa'],['catamarca','tucuman'],['tucuman','santiago'],['santiago','chaco'],['chaco','corrientes'],['corrientes','misiones'],['larioja','cordoba'],['santacruz','tierradelfuego'],['mendoza','lapampa']];
const malNS=NS.filter(([a,b])=>!(P(a).cy<P(b).cy)),malEO=EO.filter(([a,b])=>!(P(a).cx<P(b).cx));
chk('en el mapa cada provincia está donde corresponde: '+NS.length+' pares norte-sur y '+EO.length+' pares oeste-este de provincias vecinas (Jujuy al norte de Tucumán, Mendoza al oeste de Córdoba, Misiones al este de Corrientes, Tierra del Fuego al sur de todas…)',malNS.length===0&&malEO.length===0,j([malNS,malEO]));
const cb=caja('buenosaires'),cc=P('caba');
chk('el punto de la Ciudad de Buenos Aires cae sobre la costa nordeste de la provincia de Buenos Aires (el Río de la Plata) y al este de Entre Ríos y de Santa Fe',cc.cx>cb.x0&&cc.cx<cb.x1+6&&cc.cy>cb.y0-6&&cc.cy<cb.y0+35&&cc.cx>P('entrerios').cx&&cc.cy>P('entrerios').cy);
chk('el país mide más de alto que de ancho (Argentina es larga y angosta) y las Malvinas (parte de Tierra del Fuego, Antártida e Islas del Atlántico Sur) están al este de la Patagonia, en el dibujo',MAPA.h>MAPA.w*1.8&&(MAPA.prov.tierradelfuego.d.match(/M/g)||[]).length>=3&&Math.max(...(MAPA.prov.tierradelfuego.d.match(/M[\d.]+/g)||[]).map(m=>+m.slice(1)))>P('santacruz').cx+80);
const mapaTxt=fs.readFileSync(path.join(RAIZ,'integradora','mapa.js'),'utf8');
chk('el archivo del mapa es liviano ('+Math.round(mapaTxt.length/1024)+' KB) y dice de dónde salen los datos y que no se edita a mano',mapaTxt.length<60*1024&&/Natural Earth/.test(mapaTxt)&&/NO se edita a mano/.test(mapaTxt));
const html=fs.readFileSync(path.join(RAIZ,'integradora','index.html'),'utf8');
chk('la página está en español, con viewport para celular, título, manifiesto e ícono, se puede hacer zoom, y anota «trinity_ultimo = 7» para el menú del inicio',/<html lang="es">/.test(html)&&/name="viewport"/.test(html)&&!/user-scalable\s*=\s*no/.test(html)&&/<title>Prueba final integradora · Felipe/.test(html)&&/rel="manifest"/.test(html)&&/rel="apple-touch-icon"/.test(html)&&/trinity_ultimo","7"/.test(html));
const fuente=['app.js','contenido.js'].map(f=>fs.readFileSync(path.join(RAIZ,'integradora',f),'utf8').replace(/^\s*\/\/.*$/gm,'').replace(/\s\/\/ .*$/gm,'')).concat([html]).join('\n');
chk('no usa nada que mande datos afuera: ni fetch, ni XMLHttpRequest, ni eval, ni confirm/alert/prompt del navegador',!/\bfetch\s*\(|XMLHttpRequest|\beval\s*\(|new Function|\bconfirm\s*\(|\balert\s*\(|\bprompt\s*\(|sendBeacon|WebSocket/.test(fuente));

(async()=>{
let srv=null;if(!URL){srv=await servir();URL='http://127.0.0.1:'+srv.address().port+'/integradora/'}
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
    const F=new Date(oo.fecha).getTime(),D=Date;window.Date=class extends D{constructor(...a){if(a.length)super(...a);else super(F)}static now(){return F}};
    if(oo.estado&&!localStorage.getItem('__sembrado')){localStorage.setItem('__sembrado','1');localStorage.setItem('integradora_estado',typeof oo.estado==='string'?oo.estado:JSON.stringify(oo.estado))}
  },{estado:o.estado,fecha:o.fecha||'2026-11-16T12:00:00'});
  await p.goto(URL);await p.waitForSelector('#pInicio .area');
  return p;
}
const cerrar=async p=>{await p.ctx.close()};
const estado=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('integradora_estado')||'null'));
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return !e.closest('[hidden]')&&r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'},sel);
const irTema=async p=>{await p.click('.area[data-area="sociales"]');await p.waitForSelector('#bPracticar')};
// toca de verdad el punto de una provincia en el mapa que está en pantalla (así se prueba que el trazado ESTÁ donde dice)
async function tocarProv(p,id,cont){
  const pos=await p.evaluate(([id,cont])=>{const sv=document.querySelector(cont+' svg.mapa');sv.scrollIntoView({block:'center'});const r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal,s=Math.min(r.width/vb.width,r.height/vb.height),ox=r.left+(r.width-vb.width*s)/2,oy=r.top+(r.height-vb.height*s)/2,pt=window.MAPA.prov[id];return {x:ox+pt.cx*s,y:oy+pt.cy*s}},[id,cont]);
  await p.mouse.click(pos.x,pos.y);
}
// responde la pregunta que está en pantalla, bien o mal, tocando de verdad los botones (y el mapa)
async function responder(p,bien){
  const q=await p.evaluate(()=>{const q=INT.actual();return {tipo:q.tipo,tag:q.tag,ids:q.ids,ops:q.opciones&&q.opciones.map(o=>!!o.ok),aceptar:q.aceptar,izq:q.izq&&q.izq.map(x=>x.id),der:q.der&&q.der.map(x=>x.id)}});
  if(q.tipo==='mc'){const i=bien?q.ops.indexOf(true):q.ops.indexOf(false);await p.click('#pPreg .opcion[data-i="'+i+'"]')}
  else if(q.tipo==='tipear'){await p.fill('#resp',bien?q.aceptar[0]:'zzz');await p.click('#bCheck')}
  else if(q.tipo==='mapa'){const lejos={jujuy:'santacruz'},malo=lejos[q.ids[0]]||(q.ids[0]==='mendoza'?'misiones':'jujuy');await tocarProv(p,bien?q.ids[0]:malo,'#pPreg')}
  else if(q.tipo==='unir'){
    const par=async(i,jx)=>{await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+jx+'"]')};
    if(!bien){const jx=q.der.findIndex(id=>id!==q.izq[0]);await par(0,jx);await par(0,jx)}   // dos confusiones: se cuenta como mal
    for(let i=0;i<q.izq.length;i++)await par(i,q.der.indexOf(q.izq[i]));
  }
  return q.tag;
}
async function jugar(p,politica,test){
  const tipos=[];
  for(let i=0;i<120;i++){
    if(await visible(p,'#pFin'))break;
    const idx=await p.evaluate(()=>INT.ronda().i);
    tipos.push(await responder(p,politica(idx)));
    if(test)await p.waitForFunction(k=>INT.ronda().i>k,idx,{timeout:4000});
    else{await p.waitForSelector('#bSig',{timeout:4000});await p.click('#bSig')}
  }
  await p.waitForSelector('#pFin:not([hidden])');
  return tipos;
}
const textoFin=p=>p.evaluate(()=>document.getElementById('pFin').innerText.replace(/\s+/g,' '));

// ---------- 2) todas las preguntas que arma el programa: una sola respuesta correcta y coherentes con los datos
{
const p=await abrir();
const probar=async()=>p.evaluate(oro=>{
  const out=[],I=window.INT,N=I.NORM,pr=(ctx,m)=>{if(out.length<40)out.push(ctx+': '+m)};
  const strip=h=>String(h||'').replace(/<svg[\s\S]*?<\/svg>/g,' [mapa] ').replace(/<\/?(span|b|i)(\s[^>]*)?>/g,'').replace(/<[^>]*>/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
  const porCorto={};I.PROVINCIAS.forEach(x=>{porCorto[x.corto]=x});
  const TIPOS=['capEleg','provEleg','vf','capTipear','provTipear','mapaEleg','mapaTipear','mapaToca','unir'];
  const val=(q,ctx,it,c)=>{
    if(!q||typeof q!=='object')return pr(ctx,'no hay pregunta');
    if(!['mc','tipear','unir','mapa'].includes(q.tipo))pr(ctx,'tipo raro '+q.tipo);
    if(!q.consigna||!q.ayuda||!q.mostrar||!q.explic||!q.resumen)pr(ctx,'falta consigna, ayuda, respuesta, explicación o resumen');
    if(!Array.isArray(q.ids)||!q.ids.length||q.ids.some(id=>!I.item(id)))pr(ctx,'ids raros '+j(q.ids));
    const todo=strip((q.cuerpo||'')+' '+(q.opciones||[]).map(o=>o.t).join(' ')+' '+q.mostrar+' '+q.explic);
    if(/undefined|NaN|\[object|\bnull\b/.test(todo))pr(ctx,'texto con restos: '+todo.slice(0,80));
    if(q.tipo==='mc'){
      const o=q.opciones;
      if(o.length<2||o.length>4)pr(ctx,o.length+' opciones');
      if(o.filter(x=>x.ok).length!==1)pr(ctx,'hay '+o.filter(x=>x.ok).length+' correctas');
      if(new Set(o.map(x=>N(x.t))).size!==o.length)pr(ctx,'opciones repetidas '+j(o.map(x=>x.t)));
      if(q.opciones.find(x=>x.ok).t!==q.mostrar)pr(ctx,'«mostrar» no es la correcta');
    }
    if(q.tipo==='tipear'){if(!q.aceptar||!q.aceptar.length||!q.aceptar.some(a=>N(a)===N(q.mostrar)))pr(ctx,'«mostrar» no está entre las aceptadas')}
    if(q.mapa&&q.tipo!=='mapa'||q.tipo==='mapa'){
      const res=[...String(q.cuerpo).matchAll(/class="(?:prov|caba)[^"]*\bres\b[^"]*"[^>]*data-id="([a-z]+)"|data-id="([a-z]+)"[^>]*class="[^"]*\bres\b/g)].map(m=>m[1]||m[2]);
      const clases=[...String(q.cuerpo).matchAll(/<(?:path|g) class="((?:prov|caba)[^"]*)" data-id="([a-z]+)"/g)];
      const pintadas=clases.filter(m=>/\bres\b/.test(m[1])).map(m=>m[2]);
      if(q.tipo==='mapa'){if(pintadas.length)pr(ctx,'«tocá en el mapa» no puede traer una provincia pintada');if(!/class="mapa clic"/.test(q.cuerpo))pr(ctx,'el mapa no se puede tocar')}
      else if(pintadas.length!==1||pintadas[0]!==it.id)pr(ctx,'la provincia pintada no es la que se pregunta: '+j(pintadas)+' vs '+it.id);
      if(clases.length!==24)pr(ctx,'el mapa no trae las 24 piezas ('+clases.length+')');
    }
  };
  I.ITEMS.forEach(it=>TIPOS.forEach(tipo=>{
    if(!I.ELEGIBLES[tipo].includes(it))return;
    [0,1,3].forEach(c=>{for(let k=0;k<(tipo==='unir'?4:8);k++){
      let q;try{q=I.gen(tipo,it.id,c)}catch(e){pr(it.id+'/'+tipo,'se rompió: '+e.message);continue}
      const ctx=it.id+'/'+tipo+'/c'+c,txt=strip(q.cuerpo||''),bien=q.opciones&&q.opciones.find(o=>o.ok);
      val(q,ctx,it,c);
      const [nombre,cap]=oro[it.id]||[];
      if(tipo==='capEleg'){if(bien.t!==cap||!txt.includes(nombre))pr(ctx,'capEleg mal');if(c>=1&&it.trampas.length&&!q.opciones.some(o=>it.trampas.includes(o.t)))pr(ctx,'falta la trampa');if(q.opciones.some(o=>!o.ok&&oro[it.id]&&o.t===cap))pr(ctx,'una mala es la buena')}
      if(tipo==='provEleg'){if(bien.t!==nombre||!txt.includes(cap))pr(ctx,'provEleg mal');if(it.id==='buenosaires'&&!q.opciones.some(o=>o.t==='Ciudad de Buenos Aires'))pr(ctx,'falta la Ciudad de Buenos Aires de trampa')}
      if(tipo==='vf'){
        if(it.tipo==='ciudad'){const verdad=/capital de la Argentina/.test(txt);if(bien.t!==(verdad?'Verdadero':'Falso')||!/Ciudad de Buenos Aires es la capital de (la Argentina|la provincia de Buenos Aires)\.$/.test(txt))pr(ctx,'vf de la Ciudad mal: «'+txt+'»')}
        else{const m=txt.match(/^La capital de la provincia de (.+) es (.+)\.$/);if(!m||m[1]!==nombre)pr(ctx,'vf: no habla de la provincia: «'+txt+'»');else if(bien.t!==(m[2]===cap?'Verdadero':'Falso'))pr(ctx,'vf: la respuesta no coincide con la realidad: «'+txt+'» → '+bien.t);
          if(m&&m[2]!==cap&&oro[Object.keys(oro).find(k=>oro[k][1]===m[2])||'']===undefined&&!it.trampas.includes(m[2]))pr(ctx,'vf: la capital falsa «'+m[2]+'» no es ni una capital ni una trampa')}
      }
      if(tipo==='capTipear'){if(q.aceptar[0]!==cap||!txt.includes(nombre))pr(ctx,'capTipear mal');if(INT_OTRAS(I,it,q.aceptar,'capital'))pr(ctx,'capTipear acepta la capital de otra provincia')}
      if(tipo==='provTipear'){if(q.aceptar[0]!==nombre||!txt.includes(cap))pr(ctx,'provTipear mal')}
      if(tipo==='mapaEleg'){if(bien.t!==(it.tipo==='ciudad'?'Ciudad de Buenos Aires':nombre))pr(ctx,'mapaEleg: la correcta no es '+nombre)}
      if(tipo==='mapaTipear'){if(!q.aceptar.some(a=>N(a)===N(it.tipo==='ciudad'?'Ciudad de Buenos Aires':nombre)))pr(ctx,'mapaTipear mal')}
      if(tipo==='mapaToca'){if(q.mostrar!==nombre||!txt.includes(nombre))pr(ctx,'mapaToca mal')}
      if(tipo==='unir'){
        if(q.izq.length!==5||new Set(q.ids).size!==5||q.ids.join()!==q.izq.map(x=>x.id).join())pr(ctx,'unir: no son 5 distintas');
        q.izq.forEach(x=>{const d=q.der.find(y=>y.id===x.id);if(!oro[x.id]||x.t!==oro[x.id][0]||!d||d.t!==oro[x.id][1])pr(ctx,'unir: par mal '+x.id)});
        if(q.izq.map(x=>x.id).join()===q.der.map(x=>x.id).join())pr(ctx,'unir: la derecha ya viene en el mismo orden');
        if(!q.ids.includes(it.id))pr(ctx,'unir: no incluye a la provincia elegida');
      }
    }});
  }));
  function INT_OTRAS(I,it,aceptar,campo){return I.PROVINCIAS.some(o=>o!==it&&aceptar.some(a=>I.NORM(a)===I.NORM(o.capital)))}
  // el simulacro entero
  for(let k=0;k<20;k++){const qs=I.armarSimulacro();qs.forEach((q,i)=>val(q,'simulacro/'+i,I.item(q.ids[0]),1))}
  return out;
},ORO);
const pr1=await probar();
chk('TODAS las preguntas (9 tipos × las 24 piezas × 3 niveles de caja, muchas veces) salen bien armadas: UNA sola correcta, opciones distintas, coherentes con los datos, la provincia pintada es la que se pregunta, las trampas aparecen y los verdadero/falso dicen la verdad',pr1.length===0,pr1.slice(0,8).join(' | '));
chk('armar preguntas no rompió la página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 3) el recorrido, de verdad, tocando los botones
{
const p=await abrir({fecha:'2026-11-16T12:00:00',estado:{fecha:'2026-11-19'}});
const inicio=await p.innerText('#pInicio');
chk('el inicio muestra el nombre del módulo, la cuenta regresiva («Faltan 3 días», «Jueves 19 de noviembre»), Sociales con su progreso y Naturales como «Pronto»',/Prueba final integradora/.test(inicio)&&/Faltan 3 días/.test(inicio)&&/Jueves,? 19 de noviembre/.test(inicio)&&/Sociales[\s\S]*Provincias y capitales[\s\S]*0 de 24 aprendidas/.test(inicio)&&/Naturales[\s\S]*Pronto/.test(inicio),inicio);
chk('Naturales no se puede tocar todavía (no es un botón) y el simulacro está prendido mientras «Repasar lo que me salió mal» está apagado',await p.evaluate(()=>!document.querySelector('.area.pronto').matches('button')&&document.getElementById('bErrores').disabled&&!document.getElementById('bSim').disabled));
await irTema(p);
const tema=await p.evaluate(()=>({acts:[...document.querySelectorAll('.act')].map(a=>a.querySelector('b').textContent),filas:[...document.querySelectorAll('.fila-prov')].map(f=>f.innerText.replace(/\s+/g,' ').trim()),txt:document.getElementById('pTema').innerText}));
chk('la pantalla del tema trae las 8 actividades y el memotest, el mapa para estudiar, la advertencia de la Ciudad de Buenos Aires y la lista de las 24 piezas con su capital',tema.acts.length===9&&['Elegir la capital','Elegir la provincia','¿Cuál está en el mapa?','Tocá en el mapa','Escribir la capital','Mapa mudo','Unir','Verdadero o falso','Memotest'].every(a=>tema.acts.includes(a))&&tema.filas.length===24&&/Buenos Aires La Plata/.test(tema.filas[0])&&/Tierra del Fuego Ushuaia/.test(tema.filas.join('|'))&&/Ciudad de Buenos Aires capital del país/.test(tema.filas[23])&&/no es una provincia/.test(tema.txt)&&/La Plata/.test(tema.txt));
// el mapa para estudiar: se toca de verdad el punto de CADA provincia y aparece su nombre y su capital
await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa');
const malMapa=[];
for(const it of [...INT.PROVINCIAS,INT.CABA]){
  await tocarProv(p,it.id,'#pMapa');await p.waitForTimeout(25);
  const info=await p.innerText('#pMapa .info'),pintada=await p.evaluate(()=>[...document.querySelectorAll('#pMapa .res')].map(e=>e.dataset.id).join());
  const ok=it.tipo==='ciudad'?(/Ciudad Autónoma de Buenos Aires/.test(info)&&/capital del país/.test(info)):(info.includes(it.nombre)&&info.includes('Capital: '+it.capital));
  if(!ok||pintada!==it.id)malMapa.push(it.id+' → '+info.replace(/\s+/g,' ').slice(0,60)+' ['+pintada+']');
}
chk('mapa para estudiar: tocando el punto de cada una de las 24 piezas aparece SU nombre y SU capital (y queda pintada) — o sea, los trazados están donde dicen y ninguno tapa a otro',malMapa.length===0,malMapa.slice(0,5).join(' | '));
await p.click('#mEtq');
chk('«Mostrar los nombres en el mapa» escribe el nombre de cada provincia y «CABA», y la elección se recuerda',await p.evaluate(()=>document.querySelectorAll('#pMapa svg.mapa .et').length===24&&document.querySelector('#pMapa .caba-et').textContent==='CABA')&&(await estado(p)).etq===true);
await p.click('#mEtq');await p.click('#pMapa .atras');await p.waitForSelector('#bPracticar');
// cada actividad arma una ronda de SU tipo y se puede jugar entera
for(const [k,n] of [['capEleg',10],['provEleg',10],['mapaEleg',10],['mapaToca',10],['capTipear',10],['mapaTipear',10],['unir',4],['vf',10]]){
  await p.click('.act[data-act="'+k+'"]');await p.waitForSelector('#pPreg .consigna');
  const r=await p.evaluate(()=>({n:INT.ronda().qs.length,tags:[...new Set(INT.ronda().qs.map(q=>q.tag))]}));
  const t=await jugar(p,()=>true);const fin=await textoFin(p);
  chk('actividad «'+k+'»: una ronda de '+n+' preguntas de ese tipo, todas bien → «'+n+' de '+n+'» ('+[...new Set(t)].join('/')+')',r.n===n&&r.tags.join()===k&&new RegExp(n+' de '+n+'\\b').test(fin)&&/Sin errores/.test(fin),j(r)+fin.slice(0,120));
  await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p);
}
const st1=await estado(p);
chk('lo contestado bien sube la caja de cada provincia que apareció, no suma errores y se anota en «Hoy» como PREGUNTAS (74 = 7 actividades de 10 + un «unir» de 4 tableros, no 20 pares)',Object.values(st1.items).length>=10&&Object.values(st1.items).every(e=>e.c>=1&&e.mal===0)&&st1.rondas===8&&j(st1.dias['2026-11-16'])===j([74,0]),j(st1.dias)+' rondas '+st1.rondas+' provincias '+Object.keys(st1.items).length);
await cerrar(p);
}
// una ronda de práctica mezclada, con errores: lo que falló vuelve al final y no cuenta en el puntaje
{
const p=await abrir();await irTema(p);
await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
const prim=await p.evaluate(()=>({n:INT.ronda().qs.length,barra:document.querySelector('.pasos small').textContent}));
chk('«Practicar» arma una ronda de 10 preguntas mezcladas con su barra «1 / 10»',prim.n===10&&prim.barra==='1 / 10',j(prim));
await jugar(p,i=>i>=3);
const fin=await textoFin(p),r2=await p.evaluate(()=>({n:INT.ronda().qs.length,reint:INT.ronda().qs.filter(q=>q.reintento).length,ok:INT.ronda().ok,mal:INT.ronda().mal}));
chk('fallar las 3 primeras: el puntaje es «7 de 10», hay «Para repasar (3)» y se vuelve a preguntar lo que falló sin sumar al puntaje (sale «'+fin.match(/\d+ de \d+/)+'»)',/7 de 10/.test(fin)&&/Para repasar \(3\)/.test(fin)&&r2.reint>=2&&r2.ok===7&&r2.mal===3,j(r2)+fin.slice(0,160));
chk('cada error de la lista dice qué se preguntaba, la respuesta buena (✔) y la explicación',await p.evaluate(()=>[...document.querySelectorAll('#pFin .err')].every(e=>e.querySelector('.eq')&&e.querySelector('.ep')&&e.querySelector('.er')&&e.querySelector('.ee').textContent.length>5)&&document.querySelectorAll('#pFin .err').length===3));
chk('queda el botón «Repasar lo que falló» y «Otra ronda»',await visible(p,'#bRepetirErr')&&await visible(p,'#bOtraMezcla'));
await p.click('#bRepetirErr');await p.waitForSelector('#pPreg .consigna');
chk('«Repasar lo que falló» arma una ronda de 5 a 10 con esas provincias',await p.evaluate(()=>INT.ronda().qs.length>=5&&INT.ronda().qs.length<=10));
await cerrar(p);
}
// repasar lo que salió mal, con un estado sembrado
{
const p=await abrir({estado:{items:{mendoza:{c:0,ok:0,mal:2,u:'2026-11-15'},salta:{c:1,ok:1,mal:1,u:'2026-11-15'},chaco:{c:3,ok:3,mal:1,u:'2026-11-15'},jujuy:{c:2,ok:2,mal:1,u:'2026-11-15'}}}});
const t=await p.innerText('#bErrores');
chk('«Repasar lo que me salió mal» se prende y dice «2 cosas»: las que se equivocó y todavía no lleva 2 aciertos seguidos (no las que ya domina)',/2 cosas/.test(t)&&await p.evaluate(()=>!document.getElementById('bErrores').disabled),t);
await p.click('#bErrores');await p.waitForSelector('#pPreg .consigna');
const rep=await p.evaluate(()=>({n:INT.ronda().qs.length,prot:[...new Set(INT.ronda().qs.map(q=>q.ids[0]))].sort().join()}));
chk('repasar arma una ronda de 5 a 10 preguntas cuyas protagonistas son esas 2 provincias (mendoza y salta; en un «unir» las otras 4 del tablero son de relleno)',rep.n>=5&&rep.n<=10&&rep.prot==='mendoza,salta',j(rep));
await jugar(p,()=>true);
const st=await estado(p);
chk('contestar todo bien en el repaso sube la caja de lo repasado (mendoza 0→1 o más, salta 1→2 o más) y no baja ninguna de las otras',st.items.mendoza.c>=1&&st.items.salta.c>=2&&st.items.chaco.c>=3&&st.items.jujuy.c>=2&&Object.values(st.items).every(x=>x.mal<=2),j(st.items));
await cerrar(p);
}
// el memotest
{
const p=await abrir();await irTema(p);
await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');
const m0=await p.evaluate(()=>({n:document.querySelectorAll('#pMemo .cm').length,pares:new Set(INT.memo().cartas.map(c=>c.id)).size}));
chk('el memotest arma 12 cartas de 6 pares (una provincia y su capital), todas boca abajo',m0.n===12&&m0.pares===6&&await p.evaluate(()=>[...document.querySelectorAll('#pMemo .cm')].every(c=>!c.classList.contains('abierta')&&c.querySelector('.cm-f').offsetParent!==null&&c.querySelector('.cm-b').offsetParent===null)));
// dos que no son pareja: se dan vuelta y vuelven a taparse
const malos=await p.evaluate(()=>{const c=INT.memo().cartas;for(let i=0;i<12;i++)for(let k=i+1;k<12;k++)if(c[i].id!==c[k].id)return [i,k]});
await p.click('#pMemo .cm[data-c="'+malos[0]+'"]');await p.click('#pMemo .cm[data-c="'+malos[1]+'"]');
const abiertas=await p.evaluate(()=>document.querySelectorAll('#pMemo .cm.abierta').length);await p.waitForTimeout(1100);
chk('dos cartas que no son pareja se ven un momento y vuelven a taparse; el contador sube a 1 intento',abiertas===2&&await p.evaluate(()=>document.querySelectorAll('#pMemo .cm.abierta').length===0&&document.getElementById('mmInt').textContent==='1'));
// ahora todas las parejas
const pares=await p.evaluate(()=>{const c=INT.memo().cartas,m={};c.forEach((x,i)=>(m[x.id]=m[x.id]||[]).push(i));return Object.values(m)});
for(const [a,c] of pares){await p.click('#pMemo .cm[data-c="'+a+'"]');await p.click('#pMemo .cm[data-c="'+c+'"]')}
await p.waitForSelector('#pFin:not([hidden])',{timeout:5000});
const fin=await textoFin(p),stm=await estado(p);
chk('al encontrar las 6 parejas termina: dice los intentos (7: uno equivocado y seis bien), vuelve a ofrecer otro memotest y se anota en las cajas',/7\s+intentos/.test(fin)&&await visible(p,'#bOtraMemo')&&stm.rondas===1&&Object.keys(stm.items).length===6&&Object.values(stm.items).every(e=>e.c>=1),fin.slice(0,200)+j(stm.items));
chk('«Otro memotest» arma otro tablero',await (async()=>{await p.click('#bOtraMemo');await p.waitForSelector('#pMemo .cm');return (await p.$$('#pMemo .cm')).length===12})());
await p.click('#bSalirMemo');await p.waitForSelector('#modal:not([hidden])');await p.click('#mSi');await p.waitForSelector('#bPracticar');
chk('salir del memotest pide confirmar con un cartel propio y vuelve al tema',await visible(p,'#bPracticar')&&p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 4) el simulacro: 30 preguntas, sin ver si estuvo bien hasta el final, con resultado por parte
{
const p=await abrir();
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
const sim=await p.evaluate(()=>{const R=INT.ronda(),por={};R.qs.forEach(q=>{por[q.parte]=(por[q.parte]||0)+1});return {n:R.qs.length,test:R.test,por,parte:document.querySelector('.parte')&&document.querySelector('.parte').textContent}});
chk('el simulacro tiene 30 preguntas en 6 partes (A · Elegí la capital 7, B · Uní provincias y capitales 2, C · Verdadero o falso 4, D · Escribí la capital 5, E · Mirá el mapa 8, F · ¿De qué provincia es capital? 4) y muestra la parte en cada pregunta',sim.n===30&&sim.test&&sim.por['A · Elegí la capital']===7&&sim.por['B · Uní provincias y capitales']===2&&sim.por['C · Verdadero o falso']===4&&sim.por['D · Escribí la capital']===5&&sim.por['E · Mirá el mapa']===8&&sim.por['F · ¿De qué provincia es capital?']===4&&/^A · /.test(sim.parte||''),j(sim));
await responder(p,true);await p.waitForTimeout(80);
chk('en el simulacro no se ve si estuvo bien o mal hasta el final (ni cartel, ni colores, ni «Siguiente»)',!(await visible(p,'#feedback'))&&!(await p.evaluate(()=>!!document.querySelector('#pPreg .opcion.si, #pPreg .opcion.no, #pPreg .resp.si, #pPreg .resp.no, #pPreg #bSig'))));
await p.waitForFunction(()=>INT.ronda().i===1);
const tipos=await jugar(p,()=>true,true);
const fin=await textoFin(p),st=await estado(p);
chk('simulacro todo bien: «30 de 30», 100 %, «Por parte» con las 6 partes, sin errores, y queda guardado el resultado ('+[...new Set(tipos)].join('/')+')',/30 de 30/.test(fin)&&/100 %/.test(fin)&&/Por parte/.test(fin)&&(await p.locator('#pFin .pt').count())===6&&st.sims.length===1&&st.sims[0].p===30&&st.sims[0].t===30&&!/Para repasar/.test(fin),fin.slice(0,260)+j(st.sims));
chk('el resultado por parte muestra cuántas salieron bien en cada una (7 / 7, 2 / 2, 4 / 4, 5 / 5, 8 / 8, 4 / 4)',await p.evaluate(()=>[...document.querySelectorAll('#pFin .pt b')].map(x=>x.textContent).join()==='7 / 7,2 / 2,4 / 4,5 / 5,8 / 8,4 / 4'));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');
chk('el inicio muestra «tu mejor resultado: 100 %»',/tu mejor resultado: 100 %/.test(await p.innerText('#bSim')));
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
await jugar(p,()=>false,true);
const finM=await textoFin(p),stM=await estado(p);
chk('simulacro todo mal: «0 de 30», muchas cosas «para repasar» y el mejor resultado sigue siendo el de antes',/0 de 30/.test(finM)&&/Para repasar \(30\)/.test(finM)&&stM.sims.length===2&&stM.sims[1].p===0&&Math.max(...stM.sims.map(s=>s.p))===30,finM.slice(0,200));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');
chk('después de fallar el simulacro hay muchas cosas para repasar (botón prendido)',await p.evaluate(()=>!document.getElementById('bErrores').disabled&&/\d+ cosas/.test(document.getElementById('bErrores').innerText)));
chk('el simulacro no produjo errores de página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 5) lo que se escribe, doble toque, mapa, salir, ajustes y borrar
{
const p=await abrir();
const tipear=async(tipo,id,texto)=>{
  await p.evaluate(([t,i])=>{INT.rondaCon([INT.gen(t,i,3)],false)},[tipo,id]);await p.waitForSelector('#resp');
  await p.fill('#resp',texto);await p.press('#resp','Enter');await p.waitForSelector('#feedback:not([hidden])');
  return {ok:await p.evaluate(()=>INT.ronda().ok===1),fb:await p.innerText('#feedback')};
};
let r=await tipear('capTipear','cordoba','cordoba');chk('se acepta sin tilde ni mayúscula («cordoba» = Córdoba)',r.ok,r.fb);
r=await tipear('capTipear','neuquen','  NEUQUEN. ');chk('y con mayúsculas, punto y espacios de más («  NEUQUEN. »)',r.ok,r.fb);
r=await tipear('capTipear','catamarca','San Fernando');chk('la capital de Catamarca vale como «San Fernando» (y también como «Catamarca» y completa)',r.ok,r.fb);
r=await tipear('capTipear','jujuy','jujuy');chk('la capital de Jujuy vale como «Jujuy»',r.ok,r.fb);
r=await tipear('capTipear','santafe','Rosario');chk('«Rosario» para la capital de Santa Fe está mal, y la corrección dice que la capital es Santa Fe y que Rosario es la ciudad más grande',!r.ok&&/Santa Fe/.test(r.fb)&&/Rosario/.test(r.fb),r.fb);
r=await tipear('capTipear','buenosaires','Ciudad de Buenos Aires');chk('«Ciudad de Buenos Aires» para la capital de la provincia de Buenos Aires está mal y la corrección explica que es La Plata',!r.ok&&/La Plata/.test(r.fb)&&/NO es la capital|no es la capital/i.test(r.fb),r.fb);
r=await tipear('provTipear','tierradelfuego','tierra del fuego');chk('la provincia de Ushuaia se escribe «Tierra del Fuego» (alcanza con eso)',r.ok,r.fb);
r=await tipear('provTipear','rionegro','Rio Negro');chk('«Rio Negro» (sin tilde) vale',r.ok,r.fb);
r=await tipear('mapaTipear','caba','CABA');chk('en el mapa, el punto de la Ciudad de Buenos Aires se acepta como «CABA»',r.ok,r.fb);
r=await tipear('mapaTipear','caba','Buenos Aires');chk('pero «Buenos Aires» solo no vale para el punto de la Ciudad (es la provincia)',!r.ok,r.fb);
r=await tipear('mapaTipear','buenosaires','Ciudad de Buenos Aires');chk('y «Ciudad de Buenos Aires» no vale para la provincia pintada',!r.ok,r.fb);
// en blanco no corrige
await p.evaluate(()=>{INT.rondaCon([INT.gen('capTipear','mendoza',3)],false)});await p.waitForSelector('#resp');
await p.fill('#resp','   ');await p.click('#bCheck');await p.press('#resp','Enter');await p.waitForTimeout(100);
chk('con la respuesta en blanco no se corrige ni cuenta como error: sigue la misma pregunta',await p.evaluate(()=>document.getElementById('feedback').hidden&&INT.ronda().mal===0&&!document.getElementById('resp').disabled));
// «tocá en el mapa»: bien y mal, con los colores
await p.evaluate(()=>{INT.rondaCon([INT.gen('mapaToca','tucuman',1)],false)});await p.waitForSelector('#pPreg svg.mapa.clic');
await tocarProv(p,'santacruz','#pPreg');await p.waitForSelector('#feedback:not([hidden])');
const mal=await p.evaluate(()=>({ok:INT.ronda().ok,mal:INT.ronda().mal,verde:document.querySelector('#pPreg .prov.ok').dataset.id,rojo:document.querySelector('#pPreg .prov.mal').dataset.id,clic:document.querySelector('#pPreg svg.mapa').classList.contains('clic')}));
chk('«Tocá en el mapa»: tocar la provincia equivocada se cuenta mal, se pinta de rojo, se muestra en verde la correcta y ya no se puede tocar más',mal.ok===0&&mal.mal===1&&mal.verde==='tucuman'&&mal.rojo==='santacruz'&&!mal.clic&&/Tucumán/.test(await p.innerText('#feedback'))&&/San Miguel de Tucumán/.test(await p.innerText('#feedback')),j(mal));
await p.evaluate(()=>{INT.rondaCon([INT.gen('mapaToca','mendoza',1)],false)});await p.waitForSelector('#pPreg svg.mapa.clic');
await tocarProv(p,'mendoza','#pPreg');await p.waitForSelector('#feedback:not([hidden])');
chk('y tocar la correcta se cuenta bien y se pinta de verde',await p.evaluate(()=>INT.ronda().ok===1&&document.querySelector('#pPreg .prov.ok').dataset.id==='mendoza'&&!document.querySelector('#pPreg .prov.mal')));
// doble toque sobre una opción mala: cuenta una sola vez
await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','salta',0)],false)});await p.waitForSelector('#pPreg .opcion');
const mala=await p.evaluate(()=>INT.actual().opciones.findIndex(o=>!o.ok));
await p.dblclick('#pPreg .opcion[data-i="'+mala+'"]');await p.waitForSelector('#feedback:not([hidden])');
const e1=await estado(p);
chk('un doble toque sobre una opción cuenta UNA sola vez, y las opciones quedan apagadas con la buena en verde y la elegida en rojo',e1.items.salta.mal===1&&await p.evaluate(()=>INT.ronda().mal===1&&[...document.querySelectorAll('#pPreg .opcion')].every(x=>x.disabled)&&document.querySelectorAll('#pPreg .opcion.si').length===1&&document.querySelectorAll('#pPreg .opcion.no').length===1));
// salir de una ronda: cartel propio
await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','salta',0),INT.gen('capEleg','chaco',0)],false)});await p.waitForSelector('#pPreg .opcion');
await p.click('#bSalir');await p.waitForSelector('#modal:not([hidden])');
chk('la ✕ abre un cartel propio («¿Salir de la ronda?») con «Salir» y «No, seguir» (no un diálogo del navegador)',/Salir de la ronda/.test(await p.innerText('#modal'))&&await visible(p,'#mSi')&&await visible(p,'#mNo')&&p.errs.length===0,j(p.errs));
await p.click('#mNo');chk('«No, seguir» cierra el cartel y la pregunta sigue ahí',!(await visible(p,'#modal'))&&await visible(p,'#pPreg .opcion'));
await p.click('#bSalir');await p.keyboard.press('Escape');chk('Escape también cierra el cartel',!(await visible(p,'#modal')));
await p.click('#bSalir');await p.click('#mSi');await p.waitForSelector('#pInicio:not([hidden])');
// ajustes
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');
await p.fill('#aFecha','2026-11-20');
chk('en Ajustes se puede poner la fecha de la prueba y la cuenta regresiva del inicio la usa («Faltan 4 días»)',(await estado(p)).fecha==='2026-11-20'&&await (async()=>{await p.click('#pAjustes .atras');return /Faltan 4 días/.test(await p.innerText('#pInicio'))})());
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aSinFecha');await p.click('#aSinFecha');
chk('«Sacar la fecha» la borra y el inicio vuelve a saludar',(await estado(p)).fecha===''&&await (async()=>{await p.click('#pAjustes .atras');return /¡Hola, Felipe!/.test(await p.innerText('#pInicio'))})());
// borrar el progreso
await p.evaluate(()=>{const ST=INT.estado();ST.items.mendoza={c:3,ok:5,mal:1,u:'2026-11-15'};ST.sims.push({f:'2026-11-15',p:20,t:30});ST.etq=true;ST.fecha='2026-11-30';localStorage.setItem('integradora_estado',JSON.stringify(ST))});
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aBorrar');await p.click('#aBorrar');await p.waitForSelector('#modal:not([hidden])');
chk('«Borrar mi progreso» pide confirmar con un cartel que dice que no se puede deshacer',/No se puede deshacer/.test(await p.innerText('#modal')));
await p.click('#mNo');chk('si se dice que no, no se borra nada',(await estado(p)).items.mendoza.c===3);
await p.click('#aBorrar');await p.click('#mSi');
const e3=await estado(p);
chk('si se dice que sí, se borran las provincias aprendidas, los simulacros y los días, pero se conservan la fecha y los nombres del mapa',Object.keys(e3.items).length===0&&e3.sims.length===0&&Object.keys(e3.dias).length===0&&e3.fecha==='2026-11-30'&&e3.etq===true,j(e3));
await cerrar(p);
}

// ---------- 6) la cuenta regresiva
for(const [f,fecha,esp] of [['2026-11-16T09:00:00','2026-11-19',/Faltan 3 días/],['2026-11-18T23:50:00','2026-11-19',/¡Es mañana!/],['2026-11-19T08:00:00','2026-11-19',/¡Es hoy! Mucha suerte/],['2026-11-20T08:00:00','2026-11-19',/La prueba fue el Jueves,? 19 de noviembre/]]){
  const p=await abrir({fecha:f,estado:{fecha}});
  const t=await p.innerText('.cuenta');chk('la cuenta regresiva el '+f.slice(0,10)+' (prueba el '+fecha+') dice «'+t.split('\n')[0]+'»',esp.test(t),t);await cerrar(p);
}

// ---------- 7) lo guardado roto no rompe nada, y se anda sin almacenamiento
{
const j2=JSON.stringify;
const casos=[['no es JSON','esto no es json{'],['es una lista','[1,2,3]'],['es un número','42'],['es null','null'],
  ['campos del tipo equivocado',j2({v:'x',fecha:42,etq:'sí',items:[1,2],dias:'hoy',sims:{a:1},rondas:'muchas'})],
  ['fecha imposible',j2({fecha:'2026-13-45'})],
  ['valores locos (también «__proto__» y «constructor»)',j2({fecha:'2026-11-19',items:{mendoza:{c:99,ok:-5,mal:'x',u:'mañana'},salta:{c:1e12,ok:1e12,mal:NaN},'__proto__':{c:3},constructor:{c:1},toString:{c:2}},dias:{hoy:[1,2],'2026-11-09':[3,'x'],'2026-11-08':'no'},sims:[{f:'x',p:999,t:0},null,5],rondas:-3})]];
for(const [n,e] of casos){
  const p=await abrir({estado:e});
  const ok=await p.evaluate(()=>{const ST=INT.estado(),it=Object.values(ST.items);return it.every(x=>x.c>=0&&x.c<=4&&x.ok>=0&&x.mal>=0&&Number.isFinite(x.ok)&&(x.u===''||/^\d{4}-\d{2}-\d{2}$/.test(x.u)))&&ST.sims.every(s=>s.p>=0&&s.t>=1)&&Object.values(ST.dias).every(d=>Array.isArray(d)&&d.length===2&&d.every(Number.isFinite))&&Number.isFinite(ST.rondas)&&(ST.fecha===''||/^\d{4}-\d{2}-\d{2}$/.test(ST.fecha))&&!Array.isArray(ST.items)});
  chk('lo guardado roto («'+n+'») no rompe: abre normal, sin errores, con valores sanos',ok&&await visible(p,'#pInicio .area')&&p.errs.length===0,j(p.errs));
  await irTema(p);await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await responder(p,true);
  await cerrar(p);
}
const p=await abrir({storageRoto:true});
await irTema(p);await p.click('.act[data-act="capEleg"]');await p.waitForSelector('#pPreg .consigna');
await jugar(p,()=>true);
chk('con el almacenamiento bloqueado (navegación privada, cookies cerradas) se puede igual estudiar, practicar y ver el resultado, sin errores',/10 de 10/.test(await textoFin(p))&&p.errs.length===0,j(p.errs));
await cerrar(p);
}
{
const p=await abrir();
await irTema(p);await p.click('.act[data-act="provEleg"]');await p.waitForSelector('#pPreg .consigna');await jugar(p,()=>true);
const antes=await estado(p);await p.reload();await p.waitForSelector('#pInicio .area');
chk('al recargar la página se conserva lo hecho (cajas, hoy, rondas) y el inicio lo refleja',j(await estado(p))===j(antes)&&/Hoy: 10 bien/.test(await p.innerText('#pInicio'))&&antes.rondas===1&&Object.keys(antes.items).length>=3);
await cerrar(p);
}
// no pide nada a otros sitios
{
const p=await abrir();
await irTema(p);await p.click('#bMapaEst');await p.waitForSelector('svg.mapa');await p.click('#pMapa .atras');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3!==0);
await p.click('#bInicioFin');await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');await jugar(p,()=>true,true);
const ajenos=p.pedidos.filter(x=>!x.u.startsWith(ORIGEN_PROPIO)&&!/^data:|^blob:/.test(x.u)&&!/fonts\.(googleapis|gstatic)\.com/.test(x.u));
chk('en toda una sesión (estudio, mapa, práctica, simulacro) no pide nada a otros sitios (sólo las fuentes de Google) y todos los pedidos son GET',ajenos.length===0&&p.pedidos.every(x=>x.m==='GET'),j(ajenos.slice(0,4)));
chk('sin errores de página en toda la sesión',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 8) DISEÑO: nada se sale, se pisa ni se corta, en 12 tamaños (con el mapa y cada tipo de pregunta, sin corregir y corregidas)
const medir=()=>{
  const vw=innerWidth,out=[],pant=document.querySelector('.pantalla:not([hidden])');if(!pant)return ['no hay pantalla'];
  const desc=e=>e.tagName.toLowerCase()+'.'+String(e.className&&e.className.baseVal!==undefined?e.className.baseVal:e.className).split(' ')[0]+'«'+(e.innerText||e.value||e.getAttribute('aria-label')||'').slice(0,18).replace(/\n/g,' ')+'»';
  const de=document.documentElement;if(de.scrollWidth>vw+1)out.push('scroll horizontal: '+de.scrollWidth+' > '+vw);
  const vis=e=>{const r=e.getBoundingClientRect(),c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
  const caja=e=>{const r=e.getBoundingClientRect();return {l:r.left,r:r.right,t:r.top+scrollY,b:r.bottom+scrollY,w:r.width,h:r.height}};
  const todos=[...pant.querySelectorAll('button,input,svg.mapa')].filter(vis);
  todos.forEach(e=>{const c=caja(e);
    if(c.l<-0.5||c.r>vw+0.5)out.push('se sale de la pantalla: '+desc(e)+' ['+Math.round(c.l)+','+Math.round(c.r)+']');
    if(e.matches('svg.mapa')&&(c.h<150||c.w<70))out.push('el mapa quedó muy chico: '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('button,input')&&!e.matches('input[type=checkbox]')&&(c.w<34||c.h<34))out.push('muy chico para el dedo: '+desc(e)+' '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('input[type=checkbox]')){const fila=e.closest('label');if(!fila||fila.getBoundingClientRect().height<44)out.push('casillero sin una fila grande para tocar: '+desc(e))}
    if(e.matches('.opcion,.par,.btn,.act,.fila-prov,.cm,.area,.resp')&&e.scrollWidth>e.clientWidth+1)out.push('texto cortado: '+desc(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.matches('.opcion,.par,.btn,.act,.cm,.area')&&e.scrollHeight>e.clientHeight+2)out.push('texto cortado (alto): '+desc(e))});
  const bs=scrollY>2?[]:todos.filter(e=>e.matches('button,input'));
  for(let i=0;i<bs.length;i++)for(let k=i+1;k<bs.length;k++){if(bs[i].contains(bs[k])||bs[k].contains(bs[i]))continue;const a=caja(bs[i]),c=caja(bs[k]);const ix=Math.min(a.r,c.r)-Math.max(a.l,c.l),iy=Math.min(a.b,c.b)-Math.max(a.t,c.t);if(ix>2&&iy>2)out.push('se pisan: '+desc(bs[i])+' y '+desc(bs[k]))}
  [...pant.querySelectorAll('*:not(svg *)')].forEach(e=>{if(!vis(e))return;const r=e.getBoundingClientRect();if(r.right>vw+1||r.left<-1){if(!out.some(x=>x.includes(desc(e))))out.push('contenido fuera de la pantalla: '+desc(e))}});
  return out;
};
const TAMANOS=[['celular chico 320×568',320,568],['Android chico 360×640',360,640],['iPhone 8 375×667',375,667],['iPhone 14 390×844',390,844],['iPhone Pro Max 430×932',430,932],['tableta vertical 768×1024',768,1024],['tableta horizontal 1024×768',1024,768],['compu 1280×800',1280,800],['iPhone 8 de costado 667×375',667,375],['Android de costado 740×360',740,360],['Android de costado 640×360',640,360],['iPhone 14 de costado 844×390',844,390]];
for(const [nombre,w,h] of (RAPIDO?TAMANOS.slice(3,4):TAMANOS)){
  const p=await abrir({vp:{width:w,height:h}});
  const falla=[];
  const m=async(que)=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  await m('inicio');
  await irTema(p);await m('tema');
  await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa');await m('mapa para estudiar');
  await tocarProv(p,'tierradelfuego','#pMapa');await m('mapa para estudiar (Tierra del Fuego elegida: nombre largo)');
  await p.click('#mEtq');await m('mapa con nombres');await p.click('#mEtq');
  await p.click('#pMapa .atras');
  await p.click('#pTema .atras');await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');await m('ajustes');await p.click('#pAjustes .atras');
  // las preguntas: cada tipo, con la provincia de nombres más largos
  const lote=await p.evaluate(()=>{
    const I=window.INT,tipos=['capEleg','provEleg','vf','capTipear','provTipear','mapaEleg','mapaTipear','mapaToca','unir'];window.__lote=[];
    const largo=q=>(q.cuerpo||'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,'').length+(q.opciones||[]).reduce((s,o)=>s+o.t.length,0)+(q.izq||[]).reduce((s,x)=>s+x.t.length,0)+(q.der||[]).reduce((s,x)=>s+x.t.length,0);
    tipos.forEach(tipo=>{const qs=[];I.ITEMS.filter(it=>I.ELEGIBLES[tipo].includes(it)).forEach(it=>{for(let k=0;k<3;k++){try{qs.push(I.gen(tipo,it.id,1))}catch(e){}}});qs.sort((a,b)=>largo(b)-largo(a));qs.slice(0,3).forEach(q=>window.__lote.push(q))});
    ['catamarca','tierradelfuego','santiago','tucuman','jujuy'].forEach(id=>{window.__lote.push(I.gen('capEleg',id,1));window.__lote.push(I.gen('mapaEleg',id,1))});window.__lote.push(I.gen('mapaEleg','caba',1));window.__lote.push(I.gen('vf','caba',1));
    return window.__lote.length;
  });
  for(let i=0;i<lote;i++){
    await p.evaluate(i=>{INT.rondaCon([window.__lote[i]],false)},i);
    await p.waitForSelector('#pPreg .consigna');
    const info=await p.evaluate(()=>INT.actual().tag);
    await m('pregunta '+i+' '+info);
    if(i%2===0){
      await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');
      await p.evaluate(()=>{window.scrollTo(0,0)});await p.waitForTimeout(20);
      await m('corregida '+i+' '+info);
      const sig=await p.evaluate(()=>{const e=document.getElementById('bSig');if(!e)return 'no hay «Siguiente»';e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),bar=document.querySelector('#pPreg .barra').getBoundingClientRect();return r.top>=bar.bottom-1&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1?'':'«Siguiente» no se ve entero (o queda bajo la barra de arriba): '+Math.round(r.top)+'–'+Math.round(r.bottom)+' de '+innerHeight+', barra hasta '+Math.round(bar.bottom)});
      if(sig)falla.push('corregida '+i+' '+info+' → '+sig);
    }
  }
  // el memotest
  await p.evaluate(()=>{window.scrollTo(0,0)});await p.click('#pPreg .barra .atras').catch(()=>{});
  await p.evaluate(()=>{});
  await p.waitForSelector('#modal:not([hidden])').then(()=>p.click('#mSi')).catch(()=>{});
  await p.waitForSelector('#pInicio:not([hidden])');await irTema(p);
  await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');await m('memotest (boca abajo)');
  await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').forEach(c=>c.classList.add('abierta')));await m('memotest (todas abiertas)');
  // el resultado del simulacro
  await p.click('#bSalirMemo');await p.click('#mSi');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');await p.waitForSelector('#bSim');
  await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3===0,true);await m('resultado del simulacro (con errores)');
  chk('diseño '+nombre+': inicio, tema, mapa para estudiar (con y sin nombres), ajustes, '+lote+' preguntas (sin corregir y corregidas), memotest y resultado — nada se sale, se pisa ni se corta, y el mapa se ve',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
  await cerrar(p);
}

// ---------- 9) contraste de los colores (WCAG AA = 4,5 a 1 para texto normal) en claro y en oscuro
for(const oscuro of (RAPIDO?[false]:[false,true])){
  const p=await abrir({oscuro,estado:{fecha:'2026-11-19',items:{mendoza:{c:2,ok:2,mal:1,u:'2026-11-15'}}}});
  const malos=[];
  const medirContraste=async(que)=>{const r=await p.evaluate(()=>{
    const num=c=>c.match(/[\d.]+/g).map(Number),lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};
    const lum=c=>{const [r,g,b]=num(c);return .2126*lin(r)+.7152*lin(g)+.0722*lin(b)};
    const fondo=e=>{while(e){const c=getComputedStyle(e).backgroundColor;const a=num(c)[3];if(c!=='rgba(0, 0, 0, 0)'&&(a===undefined||a>0.5))return c;e=e.parentElement}return 'rgb(255,255,255)'};
    const out=[];const pant=document.querySelector('.pantalla:not([hidden])');
    [...pant.querySelectorAll('*:not(svg *)')].filter(e=>e.children.length===0||e.matches('button,.frase,.fbt,.fbr,.fbe,.pal,.fp-n,.fp-c')).forEach(e=>{
      const r=e.getBoundingClientRect();if(!r.width||!r.height)return;const t=(e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()));if(!t)return;
      if(e.closest('.cuenta,.area'))return;   // blanco sobre degradé: se mide aparte
      const cs=getComputedStyle(e),a=lum(cs.color),b=lum(fondo(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
      if(ratio<(grande?3:4.5))out.push(e.className.split(' ')[0]+'«'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(e)+')')});
    // lo que va sobre un degradé (la cuenta regresiva y las tarjetas de las materias): se mide contra CADA color del degradé que dice el CSS de verdad (el peor caso), con la transparencia del texto y de lo que lo contiene
    const rgb=c=>num(c).slice(0,3),lumRGB=a=>.2126*lin(a[0])+.7152*lin(a[1])+.0722*lin(a[2]);
    const ratioRGB=(a,b)=>{const x=lumRGB(a),y=lumRGB(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const opac=(e,tope)=>{let o=1;while(e){o*=+getComputedStyle(e).opacity;if(e===tope)break;e=e.parentElement}return o};
    pant.querySelectorAll('.cuenta,.area').forEach(cont=>{
      let st=(getComputedStyle(cont).backgroundImage.match(/rgba?\([^)]*\)/g)||[]).map(rgb);
      if(!st.length)st=[rgb(fondo(cont))];
      [cont,...cont.querySelectorAll('*')].forEach(e=>{
        if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
        const r=e.getBoundingClientRect();if(!r.width||!r.height)return;
        const cs=getComputedStyle(e),cc=num(cs.color),al=(cc[3]===undefined?1:cc[3])*opac(e,cont),grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
        let peor=99;st.forEach(b=>{const comp=[0,1,2].map(i=>cc[i]*al+b[i]*(1-al));peor=Math.min(peor,ratioRGB(comp,b))});
        if(peor<(grande?3:4.5))out.push((cont.className.split(' ').slice(0,2).join('.'))+' › «'+(e.innerText||'').slice(0,22).replace(/\n/g,' ')+'» '+peor.toFixed(2)+' (texto '+cs.color+', opacidad '+al.toFixed(2)+', fondo '+st.map(x=>'rgb('+x+')').join(' → ')+')')})});
    return out}) ;r.forEach(x=>malos.push(que+' → '+x))};
  await medirContraste('inicio');
  await irTema(p);await medirContraste('tema');
  await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa');await tocarProv(p,'mendoza','#pMapa');await medirContraste('mapa para estudiar');await p.click('#pMapa .atras');
  for(const [tipo,id] of [['capEleg','santafe'],['capTipear','salta'],['mapaEleg','cordoba'],['mapaToca','jujuy'],['unir','mendoza'],['vf','chaco']]){
    await p.evaluate(([t,i])=>{INT.rondaCon([INT.gen(t,i,1)],false)},[tipo,id]);await p.waitForSelector('#pPreg .consigna');
    await medirContraste('pregunta '+tipo);
    await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (mal) '+tipo);
  }
  await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','chaco',0)],false)});await p.waitForSelector('#pPreg .opcion');await responder(p,true);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (bien)');
  await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','chaco',0),INT.gen('capEleg','salta',0)],false)});await p.waitForSelector('#pPreg .opcion');await jugar(p,i=>i>0);await medirContraste('resultado');
  await p.click('#bInicioFin');await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');await medirContraste('ajustes');
  chk('contraste de los textos en modo '+(oscuro?'oscuro':'claro')+' (4,5 a 1; 3 a 1 en texto grande) en inicio, tema, mapa, preguntas, corregidas, resultado y ajustes',malos.length===0,malos.slice(0,6).join(' | '));
  await cerrar(p);
}

await b.close();if(srv)srv.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length+' de '+res.length);
process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)});
