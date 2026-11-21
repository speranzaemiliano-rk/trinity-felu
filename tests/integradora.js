// «Prueba final integradora · Felipe» (carpeta integradora/): Sociales → las 23 provincias argentinas y la Ciudad de Buenos Aires con sus capitales, con un mapa; y los TEMAS DE IDEAS (Naturales: páginas 122 a 127 del libro; Sociales: las colonias, páginas 100 a 105), con resúmenes, cuadros, dibujos, mapas conceptuales y ejercicios.
// Cubre: que los DATOS estén bien (provincias, países limítrofes, capitales, nombres para escribir y ciudades «trampa», contrastados con una tabla aparte); que los MAPAS sean los de la Argentina (las 24 piezas, cada una
// donde corresponde: se comprueba tocando de verdad el punto de cada provincia, y que cada una esté al norte / sur / este / oeste de sus vecinas); que TODAS las preguntas que arma el programa (cada tipo ×
// cada provincia, muchas veces) tengan UNA sola respuesta correcta, opciones distintas y coherentes con los datos; el recorrido (inicio, tema, mapa para estudiar, cada actividad, el memotest, el simulacro de 30
// en 6 partes, el repaso de lo que salió mal, ajustes); que lo escrito valga sin tildes ni mayúsculas; que lo guardado roto no rompa nada y que ande con el almacenamiento bloqueado; que no pida nada a
// otros sitios (sólo las fuentes de Google); y el DISEÑO: nada se sale de la pantalla ni se pisa ni se corta, en 12 tamaños (de celular chico a compu, de pie y de costado), con el mapa y todos los tipos de
// pregunta (sin corregir y corregidos), y con contraste suficiente en claro y en oscuro.
// Los temas de ideas (integradora/ideas.js, nat-*.js, soc-*.js) se prueban TODOS con las mismas pruebas: que cada dato esté completo y contrastado con una tabla aparte, que cada pregunta que arma el programa tenga una sola respuesta
// correcta, el recorrido (estudiar, practicar, cada actividad, el memotest, el simulacro de Naturales) y el diseño y el contraste de sus pantallas. Sumar un tema nuevo no obliga a tocar estas pruebas.
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
vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora','contenido.js'),'utf8'),sb);vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora','mapa.js'),'utf8'),sb);vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora','mapa-limitrofes.js'),'utf8'),sb);
const SCRIPTS=[...fs.readFileSync(path.join(RAIZ,'integradora','index.html'),'utf8').matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f!=='app.js'&&f!=='oral.js'&&!/^\.\.\//.test(f)&&!['contenido.js','mapa.js','mapa-limitrofes.js'].includes(f));   // (oral.js es del navegador —micrófono, voz, IA—: tiene su propia prueba, tests/integradora_oral.js; y ../firebase-config.js es del sitio)
SCRIPTS.forEach(f=>vm.runInContext(fs.readFileSync(path.join(RAIZ,'integradora',f),'utf8'),sb));   // dibujos.js, ideas.js y los temas (nat-*.js, soc-*.js), en el orden de la página
const INT=sb.window.INT,MAPA=sb.window.MAPA,LIM=sb.window.MAPA_LIM;
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
const formas=x=>[x.corto,x.nombre,x.abrev,...x.altNombre];
chk('ninguna forma de escribir una provincia (ni su abreviatura del mapa) es el nombre de otra: no hay respuestas ambiguas (la única coincidencia a propósito es «Buenos Aires», que vale para la provincia pintada y para el punto de la Ciudad: son preguntas distintas)',INT.ITEMS.every(a=>INT.ITEMS.every(b=>a===b||(a.id==='caba'&&b.id==='buenosaires')||(a.id==='buenosaires'&&b.id==='caba')||!formas(a).some(x=>formas(b).some(y=>NORMT(x)===NORMT(y)))))&&!INT.item('buenosaires').altNombre.some(x=>NORMT(x)==='ciudad de buenos aires')&&INT.CABA.altNombre.some(x=>NORMT(x)==='buenos aires'));
chk('las notas no afirman superlativos discutibles («la provincia más chica del país»: Tierra del Fuego, sin la Antártida ni las islas, es menor que Tucumán)',!INT.TODOS.some(x=>/más chic|más peque|más grande del país/i.test(x.nota)));
chk('el área Sociales trae dos temas, «Provincias y capitales» (las 24 piezas) y «Países limítrofes» (los 5 países), y Naturales ya no figura como «pronto»',INT.AREAS.length===2&&INT.AREAS[0].id==='sociales'&&INT.AREAS[0].temas.length>=2&&INT.AREAS[0].temas[0].id==='provincias'&&INT.AREAS[0].temas[0].items.length===24&&INT.AREAS[0].temas[1].id==='limitrofes'&&INT.AREAS[0].temas[1].items.length===5&&INT.AREAS[1].id==='naturales'&&INT.AREAS[1].pronto===false&&INT.AREAS[1].temas.length>=3);
// los países limítrofes (la Argentina limita con cinco países: Chile, Bolivia, Paraguay, Brasil y Uruguay)
const ORO_PAISES={chile:['Chile','Santiago'],bolivia:['Bolivia','Sucre'],paraguay:['Paraguay','Asunción'],brasil:['Brasil','Brasilia'],uruguay:['Uruguay','Montevideo']};
chk('los países limítrofes son exactamente Chile, Bolivia, Paraguay, Brasil y Uruguay, cada uno con su capital (contrastado con una tabla aparte)',INT.PAISES.length===5&&INT.PAISES.every(x=>x.tipo==='pais'&&ORO_PAISES[x.id]&&x.corto===ORO_PAISES[x.id][0]&&x.capital===ORO_PAISES[x.id][1])&&INT.TODOS.length===29&&INT.ITEMS.length===24,j(INT.PAISES.map(x=>x.id+':'+x.capital)));
const bol=INT.item('bolivia'),TODAS_CAP=INT.TODOS.filter(x=>x.capital).map(x=>NORMT(x.capital));
chk('Bolivia tiene dos capitales: se muestra Sucre (la constitucional) y al escribir se acepta también La Paz (la sede del gobierno); la nota lo explica y «La Paz» NUNCA aparece como ciudad «trampa»',bol.capital==='Sucre'&&bol.altCapital.includes('la paz')&&/Sucre/.test(bol.nota)&&/La Paz/.test(bol.nota)&&!bol.trampas.some(t=>NORMT(t)==='la paz')&&!INT.TODOS.some(x=>x.trampas.some(t=>NORMT(t)==='la paz'))&&bol.capitalTxt==='Sucre y La Paz');
const CIUDAD_PAIS={'Valparaíso':'chile','Viña del Mar':'chile','Santa Cruz de la Sierra':'bolivia','Cochabamba':'bolivia','Ciudad del Este':'paraguay','Encarnación':'paraguay','Río de Janeiro':'brasil','San Pablo':'brasil','Punta del Este':'uruguay','Colonia del Sacramento':'uruguay'};
chk('las ciudades «trampa» de los países (conocidas pero que NO son la capital) están en el país que dicen y ninguna es una capital ni una forma aceptada de escribirla',INT.PAISES.every(x=>x.trampas.length>=2&&x.trampas.every(t=>CIUDAD_PAIS[t]===x.id&&!TODAS_CAP.includes(NORMT(t))&&!x.altCapital.some(a=>NORMT(a)===NORMT(t)))),j(INT.PAISES.flatMap(x=>x.trampas.filter(t=>CIUDAD_PAIS[t]!==x.id).map(t=>x.id+':'+t))));
chk('hay trampas en los países donde una ciudad conocida confunde (Brasil→Río de Janeiro, Uruguay→Punta del Este, Chile→Valparaíso) y la nota de Brasil explica que Río fue la capital hasta 1960',INT.item('brasil').trampas.includes('Río de Janeiro')&&INT.item('uruguay').trampas.includes('Punta del Este')&&INT.item('chile').trampas.includes('Valparaíso')&&/1960/.test(INT.item('brasil').nota)&&/Río de Janeiro/.test(INT.item('brasil').nota));
chk('un país no se confunde con una provincia: los ids, los nombres y las formas de escribirlos son todos distintos (y «Santiago» de Chile NO es «Santiago del Estero»: no se aceptan entre sí)',INT.PAISES.every(x=>INT.ITEMS.every(y=>x.id!==y.id&&![x.corto,x.nombre,...x.altNombre].some(a=>[y.corto,y.nombre,...y.altNombre].some(b=>NORMT(a)===NORMT(b)))&&!(y.capital&&[x.capital,...x.altCapital].some(a=>NORMT(a)===NORMT(y.capital)))))&&!INT.item('santiago').altCapital.some(a=>NORMT(a)==='santiago'));
chk('cada país dice por dónde limita con la Argentina, con los puntos cardinales y las provincias que corresponden (Chile al oeste y al sur, Bolivia al norte con Jujuy y Salta, Paraguay al norte, Brasil al noreste con Misiones y Corrientes, Uruguay al este)',/oeste/.test(INT.item('chile').limita)&&/sur/.test(INT.item('chile').limita)&&/norte/.test(bol.limita)&&/Jujuy/.test(bol.limita)&&/Salta/.test(bol.limita)&&/norte/.test(INT.item('paraguay').limita)&&/noreste/.test(INT.item('brasil').limita)&&/Misiones/.test(INT.item('brasil').limita)&&/Corrientes/.test(INT.item('brasil').limita)&&/este/.test(INT.item('uruguay').limita)&&/río Uruguay/.test(INT.item('uruguay').limita));

// ---- los temas de ideas (Naturales: páginas 122 a 127 del libro; Sociales: las colonias, páginas 100 a 105): los datos. Todos los textos son PROPIOS (con otras palabras), el repositorio es público
const IDE=INT.IDEAS,DIBS=sb.window.DIB,ideC=IDE.conceptos,ideT=IDE.temas;
const piezasDe=d=>d==='arboles'||!DIBS[d]?[]:[...new Set([...DIBS[d]({clic:true}).matchAll(/data-id="([^"]+)"/g)].map(m=>m[1]))];
const natT=ideT.filter(t=>t.area==='naturales');
chk('Naturales trae los 3 temas de las páginas 122 a 127 (El Sol sobre el horizonte · página 122, Las estaciones del año · 123 a 126, Observación y registro: el gnomon · 127) con 14, 20 y 10 ideas, y figura en el inicio con esos mismos temas',
  INT.AREAS[1].id==='naturales'&&INT.AREAS[1].pronto===false&&natT.map(t=>t.id).join()==='sol,estaciones,gnomon'&&natT.map(t=>t.conceptos.length).join()==='14,20,10'&&natT.map(t=>t.paginas).join('|')==='página 122|páginas 123 a 126|página 127'&&INT.AREAS[1].temas.map(t=>t.id).join()==='sol,estaciones,gnomon'&&INT.AREAS[1].temas.every(t=>t.tipo==='ciencia'&&t.items.length===t.def.conceptos.length));
const idsI=ideC.map(c=>c.id);
chk('los ids de las ideas no se repiten ni chocan con los de provincias y países, cada idea es de su tema y de un grupo que existe, y cada grupo tiene ideas; cada tema está en el área que dice',new Set(idsI).size===idsI.length&&idsI.every(id=>!INT.TODOS.some(x=>x.id===id)&&/^[a-z0-9_]+$/.test(id))&&ideT.every(t=>['naturales','sociales'].includes(t.area)&&t.conceptos.every(c=>c.tema===t.id&&t.grupos.some(g=>g.id===c.grupo)&&c.tipo==='concepto')&&t.grupos.every(g=>t.conceptos.some(c=>c.grupo===g.id))&&INT.AREAS.find(a=>a.id===t.area).temas.some(x=>x.id===t.id)));
const malI=[];const pn=(c,m)=>{if(malI.length<30)malI.push(c+': '+m)};
const preguntasVistas=new Map();
ideC.forEach(c=>{
  const x=c.id,rep=(q,w)=>{const k=NORMT(q);if(preguntasVistas.has(k))pn(x,w+': la misma pregunta que '+preguntasVistas.get(k));preguntasVistas.set(k,x+' '+w)};
  if(typeof c.resumen!=='string'||c.resumen.length<40||c.resumen.length>520)pn(x,'resumen de '+(c.resumen&&c.resumen.length)+' letras');
  if(!c.ico||!c.titulo)pn(x,'sin ícono o título');
  if(!c.mc.length)pn(x,'sin pregunta de elegir');
  if(c.mc.length+c.vf.length+c.tipear.length+c.ordenar.length+c.tocar.length+(c.estacion?1:0)<2)pn(x,'menos de 2 preguntas');
  c.mc.forEach((m,i)=>{const [q,ok,mal]=m;rep(q,'mc'+i);
    if(typeof q!=='string'||q.length<12||q.length>140)pn(x,'mc'+i+': enunciado de '+(q&&q.length)+' letras');
    if(typeof ok!=='string'||!ok||ok.length>90)pn(x,'mc'+i+': correcta rara');
    if(!Array.isArray(mal)||mal.length<3)pn(x,'mc'+i+': menos de 3 malas');
    else{if(new Set(mal.concat([ok]).map(NORMT)).size!==mal.length+1)pn(x,'mc'+i+': opciones repetidas (o una mala igual a la correcta)');if(mal.some(t=>typeof t!=='string'||!t||t.length>90))pn(x,'mc'+i+': mala rara');
      if(mal.concat([ok]).some(t=>/todas las anteriores|ninguna de las anteriores|\bambas\b/i.test(t)))pn(x,'mc'+i+': opción «todas/ninguna/ambas»')}});
  c.vf.forEach((v,i)=>{rep(v[0],'vf'+i);if(typeof v[0]!=='string'||v[0].length<12||typeof v[1]!=='boolean'||typeof v[2]!=='string'||v[2].length<10)pn(x,'vf'+i+' incompleto')});
  c.tipear.forEach((t,i)=>{rep(t[0],'tipear'+i);if(typeof t[0]!=='string'||!Array.isArray(t[1])||!t[1].length||t[1].some(a=>typeof a!=='string'||!NORMT(a))||typeof t[2]!=='string'||!t[2])pn(x,'tipear'+i+' incompleto')});
  c.ordenar.forEach((o,i)=>{const pasos=o[1];if(typeof o[0]!=='string'||!Array.isArray(pasos)||pasos.length<3||pasos.length>7||new Set(pasos.map(NORMT)).size!==pasos.length||pasos.some(t=>typeof t!=='string'||t.length>120))pn(x,'ordenar'+i+' mal (3 a 7 pasos distintos de hasta 120 letras)')});
  c.tocar.forEach((t,i)=>{const [d,cons,pieza]=t;rep(cons,'tocar'+i);if(typeof cons!=='string'||!DIBS[d]||d==='arboles'||!piezasDe(d).includes(pieza)||!IDE.info[d]||!IDE.info[d][pieza]||!IDE.info[d][pieza].t||!IDE.info[d][pieza].d)pn(x,'tocar'+i+': el dibujo o la pieza no existen, o la pieza no tiene su explicación ('+d+'/'+pieza+')')});
  if(typeof c.estacion!=='boolean')pn(x,'estacion no es booleano');
});
chk('cada una de las '+ideC.length+' ideas trae su resumen y al menos una pregunta de elegir, y TODAS las preguntas escritas están completas y sin repetirse: de elegir con 3 o más opciones malas distintas de la correcta, verdadero/falso con su explicación, de escribir con sus respuestas y su pista, de ordenar con 3 a 7 pasos distintos, y de tocar en un dibujo que existe y en una pieza que existe (con su explicación)',malI.length===0,malI.join(' | '));
const malT=[];const pt=(c,m)=>{if(malT.length<20)malT.push(c+': '+m)};
ideT.forEach(t=>{
  if(!t.nombre||!t.ico||!t.es||!t.paginas)pt(t.id,'falta nombre, ícono, descripción o páginas');
  t.tableros.forEach((tb,n)=>{const c=t.id+'#'+n,ps=tb.pares;
    if(typeof tb.titulo!=='string'||!Array.isArray(tb.cols)||tb.cols.length!==2||tb.cols.some(x=>typeof x!=='string'||!x))pt(c,'sin título o sin los 2 títulos de columna');
    if(ps.length<4||ps.length>5)pt(c,ps.length+' pares (tienen que ser 4 o 5)');
    if(new Set(ps.map(p=>p[0])).size!==ps.length)pt(c,'una idea repetida');
    if(new Set(ps.map(p=>NORMT(p[1]))).size!==ps.length||new Set(ps.map(p=>NORMT(p[2]))).size!==ps.length)pt(c,'textos repetidos en una columna');
    ps.forEach(p=>{if(!t.conceptos.find(x=>x.id===p[0]))pt(c,p[0]+' no es una idea de este tema');if(typeof p[1]!=='string'||typeof p[2]!=='string'||!p[1]||!p[2]||p[1].length>46||p[2].length>56)pt(c,'textos vacíos o largos en '+p[0])})});
  const est=t.estudio||[];
  if(!est.length||est[0].id!=='resumen')pt(t.id,'el estudio tiene que empezar por el resumen');
  est.forEach(e=>{if(e.id==='cuadro'&&!(t.cuadro&&t.cuadro.cols.length>=2&&t.cuadro.filas.length>=3&&t.cuadro.filas.every(f=>typeof f.t==='string'&&f.v.length===t.cuadro.cols.length&&f.v.every(v=>typeof v==='string'&&v))))pt(t.id,'cuadro roto');
    if(e.id==='dibujos'&&!(e.dibujos&&e.dibujos.length&&e.dibujos.every(d=>d==='arboles'||(DIBS[d]&&IDE.info[d]&&piezasDe(d).length>0&&piezasDe(d).every(pz=>IDE.info[d][pz]&&IDE.info[d][pz].t&&IDE.info[d][pz].d)))))pt(t.id,'dibujos rotos o con piezas sin explicación');
    if(e.id==='mapa'&&!(t.mapa&&typeof t.mapa.raiz==='string'&&t.mapa.ramas.length>=4&&t.mapa.ramas.every(r=>typeof r.t==='string'&&r.h.length>=2&&r.h.every(h=>typeof h==='string'&&h))))pt(t.id,'mapa conceptual roto');
    if(!['resumen','cuadro','dibujos','mapa'].includes(e.id))pt(t.id,'pestaña rara '+e.id)});
});
chk('los tableros de «unir» (4 o 5 pares cada uno, con sus dos títulos de columna, ideas y textos sin repetir, de ideas de su tema) y las pestañas de estudio (resumen, cuadro, dibujos con todas sus piezas explicadas, mapa conceptual) de cada tema están completos',malT.length===0,malT.join(' | '));
// los DATOS CLAVE de Naturales, contrastados con una tabla aparte (lo que dicen las páginas del libro, tomado a mano): si alguien cambia una fecha, una hora o un punto cardinal mal, esto lo agarra
const resumenDe=id=>(ideC.find(c=>c.id===id)||{resumen:''}).resumen;
const ORO_NAT={
  sol_verano:[/entre el 20 y el 23 de diciembre/,/casi 14 horas y media/,/5:37/,/sureste/,/20:06/,/suroeste/,/más grande/,/más largo/,/más cortas/],
  eq_otono:[/entre el 20 y el 23 de marzo/,/casi por el este/,/casi por el oeste/,/12 horas/,/6:57/,/19:05/,/acortando/],
  sol_invierno:[/entre el 20 y el 23 de junio/,/noreste/,/noroeste/,/más baja/,/más chico/,/más corto/,/8:00/,/17:50/,/14 horas y 10 minutos de noche/],
  eq_primavera:[/entre el 20 y el 23 de septiembre/,/casi por el este/,/casi por el oeste/,/12 horas/,/6:43/,/18:50/,/alargando/],
  puntos_sale_pone:[/verano sale por el sureste y se pone por el suroeste/,/casi por el este y se pone casi por el oeste/,/invierno sale por el noreste y se pone por el noroeste/],
  altura_mediodia:[/más alta del año es el primer día del verano/,/más baja es el primer día del invierno/],
  dia_noche_duracion:[/verano y en primavera los días duran más que las noches/,/otoño y en invierno los días duran menos que las noches/,/12 horas/],
  cambio_diario:[/2 minutos/,/verano y en otoño[^.]*menos/,/invierno y en primavera[^.]*más/],
  mediodia_solar:[/posición más alta/,/norte/,/13 horas, no a las 12/],
  mismo_tiempo:[/mismo tiempo/,/mitad/],
  un_dia:[/24 horas/],
  sombra_mediodia:[/sombra más corta/,/posición más alta/,/13 h/,/sur/,/norte/],
  sombra_manana:[/oeste/,/corta/],
  sombra_tarde:[/este/,/larga/],
  gnomon:[/varilla vertical/,/fija/],
  shamash:[/Mesopotamia/,/dios del Sol/,/carro de fuego/],
  ano:[/cuatro estaciones/,/entre el 20 y el 23/]
};
const malO=[];Object.keys(ORO_NAT).forEach(id=>ORO_NAT[id].forEach(re=>{if(!re.test(resumenDe(id)))malO.push(id+' no dice '+re)}));
const estT=ideT.find(t=>t.id==='estaciones'),cu=estT.cuadro;
const ORO_CUADRO=[[/Empieza/,[/21 de diciembre/,/20 de marzo/,/21 de junio/,/22 de septiembre/]],[/se llama/,[/Solsticio de verano/,/Equinoccio de otoño/,/Solsticio de invierno/,/Equinoccio de primavera/]],[/sale por/,[/sureste/,/casi el este/,/noreste/,/casi el este/]],[/se pone por/,[/suroeste/,/casi el oeste/,/noroeste/,/casi el oeste/]],
  [/Cuánto dura/,[/14 h y media/,/12 h/,/Menos de 10 h/,/12 h/]],[/arco/,[/más grande/,/achicando/,/más chico/,/agrandando/]],[/mediodía/,[/más alta/,/bajando/,/más baja/,/subiendo/]],[/sombras/,[/más cortas/,/más largas que en verano/,/más largas del año/,/acortando/]],
  [/Días y noches/,[/duran más que las noches/,/duran menos que las noches/,/duran menos que las noches/,/duran más que las noches/]],[/temperaturas/,[/Elevadas/,/Menores que en verano/,/Bajas/,/Mayores que en invierno/]],[/Cada día/,[/2 minutos menos/,/2 minutos menos/,/2 minutos más/,/2 minutos más/]]];
if(cu.cols.join()!=='Verano,Otoño,Invierno,Primavera'||cu.filas.length!==ORO_CUADRO.length)malO.push('el cuadro de las estaciones no tiene las 4 columnas y las '+ORO_CUADRO.length+' filas');
ORO_CUADRO.forEach(([re,vals],i)=>{const f=cu.filas[i];if(!f||!re.test(f.t))return malO.push('cuadro fila '+i+': el título no es el esperado '+re);vals.forEach((v,k)=>{if(!new RegExp(v.source,'i').test(f.v[k]))malO.push('cuadro «'+f.t+'» / '+cu.cols[k]+': «'+f.v[k]+'» no dice '+v)})});
chk('los datos clave de Naturales coinciden con una tabla aparte (las fechas de cada estación, las horas de salida y puesta del Sol, dónde sale y se pone, la duración del día, el mediodía solar a las 13 h, la sombra que apunta al sur, el gnomon…) y el cuadro de las estaciones tiene sus 11 filas × 4 estaciones bien',malO.length===0,malO.slice(0,6).join(' | '));

// los DATOS CLAVE de Sociales (la época colonial: páginas 100 a 105 del libro), contrastados con una tabla aparte: fechas, nombres, quién hacía qué
const socT=ideT.filter(t=>t.area==='sociales');
chk('Sociales trae los tres temas de las páginas 100 a 105 (la organización de las colonias · 100 y 101, la sociedad colonial · 102 y 103, los Borbones y el Virreinato del Río de la Plata · 104 y 105) después de los dos de geografía, y el inicio los muestra',
  socT.map(t=>t.id).join()==='colonias,sociedad,borbones'&&socT.map(t=>t.paginas).join('|')==='páginas 100 y 101|páginas 102 y 103|páginas 104 y 105'&&INT.AREAS[0].temas.map(t=>t.id).join()==='provincias,limitrofes,colonias,sociedad,borbones'&&INT.AREAS[0].temas.slice(2).every(t=>t.tipo==='ciencia'&&t.items.length===t.def.conceptos.length));
const ORO_SOC={
  instituciones:[/instituciones/],
  consejo_indias:[/Consejo de Indias/,/leyes/,/funcionarios/],
  casa_contratacion:[/Casa de Contratación/,/Sevilla/,/comercio/,/navegación/],
  dificil_gobernar:[/costaba|difícil|dificultad/,/medidas/],
  virreinatos:[/virreinatos/,/Nueva España/,/Perú/,/dos/],
  dos_primeros_virreinatos:[/1535/,/Ciudad de México/,/1542/,/Lima/],
  nueva_espana:[/1535/,/Ciudad de México/],
  peru:[/1542/,/Lima/],
  capitanias:[/capitanías generales|capitanía general/,/capitán general/,/militar/],
  virrey:[/virrey/,/rey/,/autoridad máxima|máxima autoridad|autoridad más importante/],
  audiencias:[/audiencias/,/justicia/],
  cabildos:[/cabildos/,/ciudades/,/vecinos/,/una vez (al|por) año|cada año/],
  vecinos:[/varón/,/español/,/casa/,/jefe de familia/,/sangre limpia/],
  funciones_cabildo:[/calles/,/seguridad/,/mercados/,/precios/,/impuestos/],
  cabildo_abierto:[/Cabildo Abierto/,/emergencia/,/vecinos/],
  cabildos_historicos:[/Buenos Aires/,/Luján/,/Córdoba/,/Salta/,/Jujuy/],
  desigualdad:[/desigual/,/piel/],
  espanoles:[/España/,/privilegi/,/cargos/],
  criollos:[/América/,/privilegios/,/cargos/],
  indigenas_libres:[/libres/,/tributos?/],
  africanos:[/África|africanos/,/esclaviz/,/derechos/],
  castas:[/castas/,/origen/],
  mestizos:[/blancos/,/indígenas/],
  mulatos:[/blancos/,/africanos/],
  zambos:[/indígenas/,/africanos/],
  encomienda:[/encomienda/,/trabajo forzado/,/conquistadores/],
  encomendero_tributo:[/encomendero/,/tributo/],
  jesuitas_reducciones:[/jesuitas/,/reducciones/,/misiones/],
  borbones:[/1700/,/Borbones/,/reformas/],
  contrabando:[/contrabando/,/ilegal|sin que España lo supiera/],
  nuevos_virreinatos:[/Río de la Plata/,/1776/,/Nueva Granada/,/1717/],
  nuevas_capitanias:[/Chile/,/Cuba/,/Venezuela/,/Guatemala/],
  intendencias:[/intendencias/,/control/],
  expulsion_jesuitas:[/jesuitas/,/expuls/],
  cargos_peninsulares:[/criollos/,/descontento/],
  rio_plata_1776:[/1776/,/Argentina/,/Uruguay/,/Paraguay/,/Bolivia/],
  capital_buenos_aires:[/Buenos Aires/,/puerto/,/virrey/],
  intendencias_1782:[/1782/,/ocho/,/intendencias/],
  intendente:[/intendente/,/impuestos/,/España/],
  gobernaciones_militares:[/gobernaciones militares/,/frontera/,/defensa/]
};
const malS=[];Object.keys(ORO_SOC).forEach(id=>{const c=ideC.find(x=>x.id===id);if(!c)return malS.push(id+': no existe esa idea');ORO_SOC[id].forEach(re=>{if(!new RegExp(re.source,'i').test(c.resumen))malS.push(id+' no dice '+re)})});
const FECHAS_OK=[['nueva_espana',/1535/],['peru',/1542/],['borbones',/1700/],['rio_plata_1776',/1776/],['intendencias_1782',/1782/]];
FECHAS_OK.forEach(([id,re])=>{const c=ideC.find(x=>x.id===id);if(c&&!c.tipear.concat(c.mc.map(m=>[m[0],[m[1]]])).some(q=>q[1].some(a=>re.test(a))))malS.push(id+': ninguna pregunta de escribir o de elegir trae el año '+re)});
chk('los datos clave de Sociales coinciden con una tabla aparte (1535 Nueva España con capital en la Ciudad de México, 1542 Perú con capital en Lima, Consejo de Indias y Casa de Contratación de Sevilla, virrey, audiencias, cabildos y vecinos, los cinco cabildos históricos, castas, encomienda, jesuitas, los Borbones desde 1700, Nueva Granada 1717, Río de la Plata 1776 con capital en Buenos Aires y ocho intendencias en 1782) y cada fecha está en alguna pregunta',malS.length===0,malS.slice(0,6).join(' | '));

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
// ---- el mapa de los vecinos: se comprueba con la GEOGRAFÍA de verdad (ciudades conocidas que tienen que caer dentro del país correcto)
const RAD=Math.PI/180,A1=-30*RAD,A2=-50*RAD,A0=-40*RAD,L0=-64*RAD,NN=(Math.sin(A1)+Math.sin(A2))/2,CC=Math.cos(A1)**2+2*NN*Math.sin(A1),RHO0=Math.sqrt(CC-2*NN*Math.sin(A0))/NN;
const proy=(lon,lat)=>{const rho=Math.sqrt(CC-2*NN*Math.sin(lat*RAD))/NN,th=NN*(lon*RAD-L0);return [rho*Math.sin(th),-(RHO0-rho*Math.cos(th))]};
const ptDib=(lon,lat)=>{const [x,y]=proy(lon,lat);return [(x+0.1073188264620532)*1238.853632048909+14,(y+0.3172344058876646)*1238.853632048909+14]};   // las mismas constantes que usa tools/mapa_integradora.js (la escala sale del tamaño de la Argentina)
const dentroD=(d,x,y)=>{let c=false;d.split('M').filter(Boolean).forEach(sp=>{const r=sp.replace(/Z$/,'').split('L').map(t=>t.trim().split(' ').map(Number));for(let i=0,k=r.length-1;i<r.length;k=i++){const [xi,yi]=r[i],[xk,yk]=r[k];if((yi>y)!==(yk>y)&&x<(xk-xi)*(y-yi)/(yk-yi)+xi)c=!c}});return c};
const quienEs=(lon,lat)=>{const [x,y]=ptDib(lon,lat);for(const id of Object.keys(LIM.pais))if(dentroD(LIM.pais[id].d,x,y))return id;for(const id of Object.keys(MAPA.prov))if(dentroD(MAPA.prov[id].d,x,y))return 'ARG:'+id;return null};
const CIUDADES=[['La Paz',-68.15,-16.5,'bolivia'],['Sucre',-65.26,-19.04,'bolivia'],['Santa Cruz de la Sierra',-63.18,-17.78,'bolivia'],['Asunción',-57.64,-25.28,'paraguay'],['Villarrica',-56.43,-25.75,'paraguay'],['Montevideo',-56.19,-34.9,'uruguay'],['Punta del Este',-54.95,-34.96,'uruguay'],
  ['Santiago de Chile',-70.65,-33.45,'chile'],['Temuco',-72.59,-38.74,'chile'],['Calama',-68.93,-22.46,'chile'],['Punta Arenas',-70.91,-53.16,'chile'],['Porto Alegre',-51.23,-30.03,'brasil'],['Curitiba',-49.27,-25.43,'brasil'],
  ['Buenos Aires',-58.4,-34.65,'ARG:'],['Mendoza',-68.84,-32.89,'ARG:mendoza'],['Salta',-65.41,-24.79,'ARG:salta'],['Posadas',-55.9,-27.37,'ARG:misiones'],['Rosario',-60.65,-32.95,'ARG:santafe'],['Bariloche',-71.31,-41.13,'ARG:rionegro'],['Tolhuin',-67.19,-54.51,'ARG:tierradelfuego'],['Resistencia',-59,-27.45,'ARG:chaco']];
const malCiudad=CIUDADES.filter(([n,lo,la,esp])=>{const q=quienEs(lo,la);return !(esp==='ARG:'?String(q).startsWith('ARG:'):q===esp)}).map(([n,lo,la,esp])=>n+' → '+quienEs(lo,la)+' (debía ser '+esp+')');
chk('el mapa de los vecinos está bien ubicado: '+CIUDADES.length+' ciudades conocidas caen en el país correcto (La Paz y Sucre en Bolivia, Asunción en Paraguay, Montevideo en Uruguay, Santiago en Chile, Porto Alegre en Brasil…) y las argentinas siguen en su provincia',malCiudad.length===0,j(malCiudad));
chk('el mapa de los vecinos trae los 5 países (los mismos ids que el contenido) con su trazado y su punto bien adentro de lo que se ve de cada uno (y fuera de la Argentina), y su ventana incluye el dibujo entero de la Argentina',Object.keys(LIM.pais).sort().join()===INT.PAISES.map(x=>x.id).sort().join()&&Object.entries(LIM.pais).every(([id,p])=>/^M[\d. -]+(L[\d. -]+)+Z/.test(p.d)&&dentroD(p.d,p.cx,p.cy)&&!Object.values(MAPA.prov).some(a=>dentroD(a.d,p.cx,p.cy)))&&LIM.vb.length===4&&LIM.vb[0]<=0&&LIM.vb[1]<=0&&LIM.vb[0]+LIM.vb[2]>=MAPA.w&&LIM.vb[1]+LIM.vb[3]>=MAPA.h,j(LIM.vb));
const limTxt=fs.readFileSync(path.join(RAIZ,'integradora','mapa-limitrofes.js'),'utf8');
chk('el archivo del mapa de los vecinos es liviano ('+Math.round(limTxt.length/1024)+' KB) y dice de dónde salen los datos y que no se edita a mano',limTxt.length<60*1024&&/Natural Earth/.test(limTxt)&&/NO se edita a mano/.test(limTxt));
const mapaTxt=fs.readFileSync(path.join(RAIZ,'integradora','mapa.js'),'utf8');
chk('el archivo del mapa es liviano ('+Math.round(mapaTxt.length/1024)+' KB) y dice de dónde salen los datos y que no se edita a mano',mapaTxt.length<60*1024&&/Natural Earth/.test(mapaTxt)&&/NO se edita a mano/.test(mapaTxt));
const html=fs.readFileSync(path.join(RAIZ,'integradora','index.html'),'utf8');
chk('la página está en español, con viewport para celular, título, manifiesto e ícono, se puede hacer zoom, y anota «trinity_ultimo = 7» para el menú del inicio',/<html lang="es">/.test(html)&&/name="viewport"/.test(html)&&!/user-scalable\s*=\s*no/.test(html)&&/<title>Prueba final integradora · Felipe/.test(html)&&/rel="manifest"/.test(html)&&/rel="apple-touch-icon"/.test(html)&&/trinity_ultimo","7"/.test(html));
const fuente=['app.js','contenido.js'].map(f=>fs.readFileSync(path.join(RAIZ,'integradora',f),'utf8').replace(/^\s*\/\/.*$/gm,'').replace(/\s\/\/ .*$/gm,'')).concat([html]).join('\n');
// la ÚNICA excepción: el aviso de «versión nueva» pide la propia página (misma dirección + «?c=hora», sin método, cuerpo ni cabeceras: es un GET que no lleva nada del alumno)
const LECTURA_PROPIA='fetch(location.pathname+"?c="+Date.now(),{cache:"no-store"})';
chk('no usa nada que mande datos afuera: ni fetch (salvo la lectura de la propia página para el aviso de versión nueva: un GET sin cuerpo ni cabeceras), ni XMLHttpRequest, ni eval, ni confirm/alert/prompt del navegador',fuente.split(LECTURA_PROPIA).length-1===1&&!/\bfetch\s*\(|XMLHttpRequest|\beval\s*\(|new Function|\bconfirm\s*\(|\balert\s*\(|\bprompt\s*\(|sendBeacon|WebSocket/.test(fuente.split(LECTURA_PROPIA).join('')));

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
    window.__INT_SIN_ESPERA=!oo.conEspera;   // las pruebas tocan rapidísimo: la espera anti doble toque se apaga (y se prueba aparte, con conEspera)
    window.__F=new Date(oo.fecha).getTime();const D=Date;window.Date=class extends D{constructor(...a){if(a.length)super(...a);else super(window.__F)}static now(){return window.__F}};
    if(oo.estado&&!localStorage.getItem('__sembrado')){localStorage.setItem('__sembrado','1');localStorage.setItem('integradora_estado',typeof oo.estado==='string'?oo.estado:JSON.stringify(oo.estado))}
  },{estado:o.estado,fecha:o.fecha||'2026-11-16T12:00:00',conEspera:!!o.conEspera});
  await p.goto(URL);await p.waitForSelector('#pInicio .area');
  return p;
}
const cerrar=async p=>{await p.ctx.close()};
const estado=p=>p.evaluate(()=>JSON.parse(localStorage.getItem('integradora_estado')||'null'));
const fechaST=p=>p.evaluate(()=>INT.estado().fecha);   // lo que la app tiene en memoria (el almacenamiento puede no existir todavía)
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const r=e.getBoundingClientRect(),c=getComputedStyle(e);return !e.closest('[hidden]')&&r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'},sel);
const irTema=async(p,tema)=>{await p.click('.tema-btn[data-tema="'+(tema||'provincias')+'"]');await p.waitForSelector('#bPracticar')};
// toca de verdad el punto de una provincia en el mapa que está en pantalla (así se prueba que el trazado ESTÁ donde dice)
async function tocarProv(p,id,cont){
  const pos=await p.evaluate(([id,cont])=>{const sv=document.querySelector(cont+' svg.mapa');sv.scrollIntoView({block:'center'});const r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal,s=Math.min(r.width/vb.width,r.height/vb.height),ox=r.left+(r.width-vb.width*s)/2,oy=r.top+(r.height-vb.height*s)/2,pt=window.MAPA.prov[id]||window.MAPA_LIM.pais[id];return {x:ox+(pt.cx-vb.x)*s,y:oy+(pt.cy-vb.y)*s}},[id,cont]);
  await p.mouse.click(pos.x,pos.y);
}
// toca de verdad una pieza de un dibujo: el centro de su zona sensible (el círculo «hit», la línea ancha o el rectángulo) o, si trae data-px/data-py, su punto interior en las coordenadas del dibujo
async function tocarPieza(p,cont,id){
  const pos=await p.evaluate(([cont,id])=>{const sv=document.querySelector(cont+' svg.dibujo'),g=sv.querySelector('[data-id="'+id+'"]');sv.scrollIntoView({block:'center'});
    if(g.dataset.px!==undefined){const r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal,s=Math.min(r.width/vb.width,r.height/vb.height),ox=r.left+(r.width-vb.width*s)/2,oy=r.top+(r.height-vb.height*s)/2;return {x:ox+(+g.dataset.px-vb.x)*s,y:oy+(+g.dataset.py-vb.y)*s}}
    const h=g.querySelector('.hit')||g.querySelector('.som-hit')||g.querySelector('rect,circle,line,path')||g,r=h.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}},[cont,id]);
  await p.mouse.click(pos.x,pos.y);
}
// responde la pregunta que está en pantalla, bien o mal, tocando de verdad los botones (y el mapa o el dibujo)
async function responder(p,bien){
  const q=await p.evaluate(()=>{const q=INT.actual();return {tipo:q.tipo,tag:q.tag,ids:q.ids,ops:q.opciones&&q.opciones.map(o=>!!o.ok),aceptar:q.aceptar,izq:q.izq&&q.izq.map(x=>x.id),der:q.der&&q.der.map(x=>x.id),dib:q.dib,objetivo:q.objetivo,pasos:q.pasos,correcto:q.correcto}});
  if(q.tipo==='mc'){const i=bien?q.ops.indexOf(true):q.ops.indexOf(false);await p.click('#pPreg .opcion[data-i="'+i+'"]')}
  else if(q.tipo==='tipear'){await p.fill('#resp',bien?q.aceptar[0]:'zzz');await p.click('#bCheck')}
  else if(q.tipo==='mapa'&&q.dib){const otra=await p.evaluate(o=>[...document.querySelectorAll('#pPreg svg.dibujo [data-id]')].map(e=>e.dataset.id).find(x=>x!==o),q.objetivo);await tocarPieza(p,'#pPreg',bien?q.objetivo:otra)}
  else if(q.tipo==='ordenar'){const orden=q.correcto.map(t=>q.pasos.indexOf(t));for(const k of (bien?orden:orden.slice().reverse()))await p.click('#pPreg .paso[data-p="'+k+'"]');await p.click('#bOrdenListo')}
  else if(q.tipo==='mapa'){const lejos={jujuy:'santacruz',chile:'brasil',brasil:'chile',bolivia:'uruguay',paraguay:'chile',uruguay:'bolivia'},malo=lejos[q.ids[0]]||(q.ids[0]==='mendoza'?'misiones':'jujuy');await tocarProv(p,bien?q.ids[0]:malo,'#pPreg')}
  else if(q.tipo==='unir'){
    const par=async(i,jx)=>{await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+jx+'"]')};
    if(await p.evaluate(()=>INT.ronda().test)){   // simulacro: no dice si está bien; se arman las 5 parejas (bien, o todas corridas de lugar) y se toca «Listo»
      for(let i=0;i<q.izq.length;i++)await par(i,bien?q.der.indexOf(q.izq[i]):q.der.indexOf(q.izq[(i+1)%q.izq.length]));
      await p.click('#bUnirListo');
    }else{
    if(!bien){const jx=q.der.findIndex(id=>id!==q.izq[0]);await par(0,jx);await par(0,jx)}   // dos confusiones: se cuenta como mal
    for(let i=0;i<q.izq.length;i++)await par(i,q.der.indexOf(q.izq[i]));
    }
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
    if(/la paz/i.test(strip(q.cuerpo||'')+' '+(q.opciones||[]).map(o=>o.t).join(' ')))pr(ctx,'«La Paz» no puede aparecer en el enunciado ni en las opciones: Bolivia tiene dos capitales y sería ambiguo');
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
      const esP=it.tipo==='pais';
      if(q.tipo==='mapa'){if(pintadas.length)pr(ctx,'«tocá en el mapa» no puede traer una pieza pintada');if(!/class="mapa(?: mapa-lim)? clic"/.test(q.cuerpo))pr(ctx,'el mapa no se puede tocar')}
      else if(pintadas.length!==1||pintadas[0]!==it.id)pr(ctx,'la pieza pintada no es la que se pregunta: '+j(pintadas)+' vs '+it.id);
      if(clases.length!==(esP?5:24))pr(ctx,'el mapa no trae las '+(esP?5:24)+' piezas ('+clases.length+')');
      if(esP!==/mapa-lim/.test(q.cuerpo))pr(ctx,'se usó el mapa equivocado ('+(esP?'un país con el mapa de provincias':'una provincia con el mapa de los vecinos')+')');
    }
  };
  I.TODOS.forEach(it=>TIPOS.forEach(tipo=>{
    if(!I.ELEGIBLES[tipo].includes(it))return;
    [0,1,3].forEach(c=>{for(let k=0;k<(tipo==='unir'?4:8);k++){
      let q;try{q=I.gen(tipo,it.id,c)}catch(e){pr(it.id+'/'+tipo,'se rompió: '+e.message);continue}
      const ctx=it.id+'/'+tipo+'/c'+c,txt=strip(q.cuerpo||''),bien=q.opciones&&q.opciones.find(o=>o.ok);
      val(q,ctx,it,c);
      const [nombre,cap]=oro[it.id]||[];
      if(tipo==='capEleg'){if(bien.t!==cap||!txt.includes(nombre))pr(ctx,'capEleg mal');if(c>=1&&it.trampas.length&&!q.opciones.some(o=>it.trampas.includes(o.t)))pr(ctx,'falta la trampa');if(q.opciones.some(o=>!o.ok&&oro[it.id]&&(o.t===cap||it.altCapital.some(a=>N(a)===N(o.t)))))pr(ctx,'una mala es la buena');if(it.tipo==='pais'&&q.opciones.some(o=>!o.ok&&!I.PAISES.some(x=>x.capital===o.t)&&!it.trampas.includes(o.t)&&o.t!=='Buenos Aires'&&o.t!=='Santiago del Estero'))pr(ctx,'capEleg de un país con una opción rara: '+j(q.opciones.map(o=>o.t)))}
      if(tipo==='provEleg'){if(bien.t!==nombre||!txt.includes(cap))pr(ctx,'provEleg mal');if(it.id==='buenosaires'&&!q.opciones.some(o=>o.t==='Ciudad de Buenos Aires'))pr(ctx,'falta la Ciudad de Buenos Aires de trampa');if(it.tipo==='pais'&&(q.opciones.length!==4||q.opciones.some(o=>!I.PAISES.some(x=>x.corto===o.t))))pr(ctx,'provEleg de un país: las opciones tienen que ser países: '+j(q.opciones.map(o=>o.t)))}
      if(tipo==='vf'){
        if(it.tipo==='ciudad'){const verdad=/capital de la Argentina/.test(txt);if(bien.t!==(verdad?'Verdadero':'Falso')||!/Ciudad de Buenos Aires es la capital de (la Argentina|la provincia de Buenos Aires)\.$/.test(txt))pr(ctx,'vf de la Ciudad mal: «'+txt+'»')}
        else{const m=txt.match(it.tipo==='pais'?/^La capital de (.+) es (.+)\.$/:/^La capital de la provincia de (.+) es (.+)\.$/);if(!m||m[1]!==nombre)pr(ctx,'vf: no habla de «'+nombre+'»: «'+txt+'»');else if(bien.t!==(m[2]===cap?'Verdadero':'Falso'))pr(ctx,'vf: la respuesta no coincide con la realidad: «'+txt+'» → '+bien.t);
          if(m&&m[2]!==cap&&oro[Object.keys(oro).find(k=>oro[k][1]===m[2])||'']===undefined&&!it.trampas.includes(m[2].replace(/^la (?=Ciudad)/,''))&&!(it.tipo==='pais'&&m[2]==='Buenos Aires'))pr(ctx,'vf: la capital falsa «'+m[2]+'» no es ni una capital ni una trampa');
          if(m&&m[2]==='Ciudad de Buenos Aires')pr(ctx,'vf: falta el «la» de «la Ciudad de Buenos Aires»')}
      }
      if(tipo==='capTipear'){if(q.aceptar[0]!==cap||!txt.includes(nombre))pr(ctx,'capTipear mal');if(INT_OTRAS(I,it,q.aceptar,'capital'))pr(ctx,'capTipear acepta la capital de otra provincia o de otro país')}
      if(tipo==='provTipear'){if(q.aceptar[0]!==nombre||!txt.includes(cap))pr(ctx,'provTipear mal')}
      if(tipo==='mapaEleg'){if(bien.t!==(it.tipo==='ciudad'?'Ciudad de Buenos Aires':nombre))pr(ctx,'mapaEleg: la correcta no es '+nombre)}
      if(tipo==='mapaTipear'){if(!q.aceptar.some(a=>N(a)===N(it.tipo==='ciudad'?'Ciudad de Buenos Aires':nombre)))pr(ctx,'mapaTipear mal')}
      if(tipo==='mapaToca'){if(q.mostrar!==nombre||!txt.includes(nombre))pr(ctx,'mapaToca mal')}
      if(tipo==='unir'){
        if(q.izq.length!==5||new Set(q.ids).size!==5||q.ids.join()!==q.izq.map(x=>x.id).join())pr(ctx,'unir: no son 5 distintas');
        if((it.tipo==='pais')!==q.ids.every(id=>I.PAISES.some(x=>x.id===id)))pr(ctx,'unir: mezcla países con provincias');
        if(it.tipo==='pais'&&q.colA!=='Países')pr(ctx,'unir de países: la columna dice «'+q.colA+'»');
        q.izq.forEach(x=>{const d=q.der.find(y=>y.id===x.id);if(!oro[x.id]||x.t!==oro[x.id][0]||!d||d.t!==oro[x.id][1])pr(ctx,'unir: par mal '+x.id)});
        if(q.izq.map(x=>x.id).join()===q.der.map(x=>x.id).join())pr(ctx,'unir: la derecha ya viene en el mismo orden');
        if(!q.ids.includes(it.id))pr(ctx,'unir: no incluye a la provincia elegida');
      }
    }});
  }));
  function INT_OTRAS(I,it,aceptar,campo){return I.TODOS.some(o=>o!==it&&o.capital&&aceptar.some(a=>I.NORM(a)===I.NORM(o.capital)))}
  // el simulacro entero
  for(let k=0;k<20;k++){const qs=I.armarSimulacro();qs.forEach((q,i)=>val(q,'simulacro/'+i,I.item(q.ids[0]),1))}
  return out;
},Object.assign({},ORO,ORO_PAISES));
const pr1=await probar();
chk('TODAS las preguntas (9 tipos × las 24 piezas y los 5 países × 3 niveles de caja, muchas veces) salen bien armadas: UNA sola correcta, opciones distintas, coherentes con los datos, la pieza pintada es la que se pregunta (con el mapa que corresponde), las trampas aparecen, «La Paz» no se ofrece nunca y los verdadero/falso dicen la verdad',pr1.length===0,pr1.slice(0,8).join(' | '));
chk('armar preguntas no rompió la página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 2b) todas las preguntas de los temas de ideas: completas, con UNA sola respuesta correcta y coherentes con sus datos
{
const p=await abrir();
const probar2=async()=>p.evaluate(()=>{
  const I=window.INT,N=I.NORM,out=[],pr=(c,m)=>{if(out.length<40)out.push(c+': '+m)};
  const strip=h=>String(h||'').replace(/<svg[\s\S]*?<\/svg>/g,' [dibujo] ').replace(/<[^>]*>/g,' ').replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\s+/g,' ').trim();
  const TN=['cnMc','cnVf','cnTipear','cnOrdenar','cnUnir','cnTocar','cnEstacion'];
  const val=(q,ctx)=>{
    if(!q||typeof q!=='object')return pr(ctx,'no hay pregunta');
    if(!['mc','tipear','unir','mapa','ordenar'].includes(q.tipo))pr(ctx,'tipo raro '+q.tipo);
    if(!q.consigna||!q.ayuda||!q.mostrar||!q.explic||!q.resumen||!q.clave)pr(ctx,'falta consigna, ayuda, respuesta, explicación, resumen o clave');
    if(!Array.isArray(q.ids)||!q.ids.length||q.ids.some(id=>!I.item(id)))pr(ctx,'ids raros '+JSON.stringify(q.ids));
    const todo=strip((q.cuerpo||'')+' '+(q.opciones||[]).map(o=>o.t).join(' ')+' '+q.mostrar+' '+q.explic+' '+q.consigna);
    if(/undefined|NaN|\[object|\bnull\b/.test(todo))pr(ctx,'texto con restos: '+todo.slice(0,80));
    if(q.tipo==='mc'){const o=q.opciones;if(o.length<2||o.length>4)pr(ctx,o.length+' opciones');if(o.filter(x=>x.ok).length!==1)pr(ctx,'hay '+o.filter(x=>x.ok).length+' correctas');if(new Set(o.map(x=>N(x.t))).size!==o.length)pr(ctx,'opciones repetidas');if(!o.find(x=>x.ok)||o.find(x=>x.ok).t!==q.mostrar)pr(ctx,'«mostrar» no es la correcta')}
    if(q.tipo==='tipear'&&(!q.aceptar||!q.aceptar.some(a=>N(a)===N(q.mostrar))))pr(ctx,'«mostrar» no está entre las aceptadas');
    if(q.tipo==='ordenar'){
      if(!Array.isArray(q.pasos)||!Array.isArray(q.correcto)||q.pasos.length!==q.correcto.length||[...q.pasos].sort().join('|')!==[...q.correcto].sort().join('|'))pr(ctx,'ordenar: los pasos no son los mismos que el orden correcto');
      if(q.pasos.join('|')===q.correcto.join('|'))pr(ctx,'ordenar: ya vienen en orden');
      if(q.mostrar.split('  ·  ').length!==q.correcto.length)pr(ctx,'ordenar: «mostrar» no lista todos los pasos');
    }
    if(q.tipo==='unir'){const ids=q.izq.map(x=>x.id);
      if(new Set(ids).size!==ids.length||ids.join()!==q.ids.join()||q.der.map(x=>x.id).sort().join()!==ids.slice().sort().join())pr(ctx,'unir: los ids no coinciden');
      if(ids.join()===q.der.map(x=>x.id).join())pr(ctx,'unir: la derecha ya viene en orden');
      if(new Set(q.izq.map(x=>N(x.t))).size!==ids.length||new Set(q.der.map(x=>N(x.t))).size!==ids.length)pr(ctx,'unir: textos repetidos');
      if(!q.colA||!q.colB)pr(ctx,'unir: sin títulos de columna');if(ids.length<4||ids.length>5)pr(ctx,'unir: '+ids.length+' pares');
    }
    if(q.tipo==='mapa'){const cu=String(q.cuerpo);
      if(!q.dib||!q.objetivo)pr(ctx,'tocar: sin dibujo u objetivo');
      if(!/<svg class="dibujo [^"]*clic"/.test(cu))pr(ctx,'tocar: el dibujo no se puede tocar');
      if(cu.indexOf('data-id="'+q.objetivo+'"')<0)pr(ctx,'tocar: el dibujo no trae la pieza '+q.objetivo);
      if(/class="[^"]*\b(?:res|ok|mal)\b[^"]*"\s+data-id/.test(cu))pr(ctx,'tocar: hay una pieza ya pintada');
    }
  };
  I.IDEAS.conceptos.forEach(it=>TN.forEach(tipo=>{
    const elegible=I.ELEGIBLES[tipo].includes(it);
    const trae={cnMc:it.mc.length>0,cnVf:it.vf.length>0,cnTipear:it.tipear.length>0,cnOrdenar:it.ordenar.length>0,cnTocar:it.tocar.length>0,cnEstacion:!!it.estacion,cnUnir:I.tablerosDe(it).length>0}[tipo];
    if(elegible!==trae)pr(it.id+'/'+tipo,'ELEGIBLES dice '+elegible+' pero la idea '+(trae?'sí':'no')+' trae preguntas de ese tipo');
    if(!elegible)return;
    const vistas=new Set();
    for(let k=0;k<60;k++){let q;try{q=I.gen(tipo,it.id,k%4)}catch(e){pr(it.id+'/'+tipo,'se rompió: '+e.message);return}
      val(q,it.id+'/'+tipo);vistas.add(q.clave);
      if(tipo==='cnUnir'?!q.ids.includes(it.id):q.ids[0]!==it.id)pr(it.id+'/'+tipo,'la pregunta no es de esa idea');
      if(q.tag!==tipo)pr(it.id+'/'+tipo,'la marca «tag» es '+q.tag);
    }
    const esperadas={cnMc:it.mc.length,cnVf:it.vf.length,cnTipear:it.tipear.length,cnOrdenar:it.ordenar.length,cnTocar:it.tocar.length,cnEstacion:4,cnUnir:I.tablerosDe(it).length}[tipo];
    if(vistas.size!==esperadas)pr(it.id+'/'+tipo,'salieron '+vistas.size+' variantes distintas y se escribieron '+esperadas);
  }));
  // lo que no se puede preguntar tiene que fallar clarito (no devolver algo roto)
  const sinMc=I.IDEAS.conceptos.find(c=>!c.ordenar.length);try{I.gen('cnOrdenar',sinMc.id,0);pr('cnOrdenar','una idea sin pasos para ordenar no falló')}catch(e){}
  // el simulacro de Naturales entero
  const nat=I.IDEAS.temas.filter(t=>t.area==='naturales');
  for(let k=0;k<30;k++){const qs=I.armarSimulacroNat();
    if(qs.length!==I.N_SIM_NAT)pr('simulacro de Naturales','tiene '+qs.length+' preguntas y N_SIM_NAT dice '+I.N_SIM_NAT);
    const por={};qs.forEach(q=>{por[q.parte]=(por[q.parte]||0)+1});
    if(JSON.stringify(por)!==JSON.stringify({'A · Elegí la respuesta':6,'B · Verdadero o falso':4,'C · Mirá el dibujo':4,'D · Ordená':2,'E · Uní las ideas':2,'F · Escribí':3}))pr('simulacro de Naturales','partes '+JSON.stringify(por));
    qs.forEach((q,i)=>{val(q,'simulacro de Naturales/'+i);if(!q.ids.every(id=>nat.some(t=>t.conceptos.some(c=>c.id===id))))pr('simulacro de Naturales/'+i,'trae una idea que no es de Naturales')});
    const claves=qs.map(q=>q.clave);if(new Set(claves).size!==claves.length)pr('simulacro de Naturales','hay una pregunta repetida');
    const prot=qs.filter(q=>q.tipo!=='unir').map(q=>q.ids[0]);if(new Set(prot).size<prot.length-4)pr('simulacro de Naturales','demasiadas ideas repetidas: '+prot.length+' preguntas con '+new Set(prot).size+' ideas');
    const tabs=qs.filter(q=>q.tipo==='unir').map(q=>q.clave.split('|')[0]);if(new Set(tabs).size!==tabs.length)pr('simulacro de Naturales','los dos tableros son del mismo tema');
  }
  return out;
});
const pr2=await probar2();
chk('TODAS las preguntas de las ideas (7 tipos × cada idea que las trae × 4 niveles de caja, 60 veces cada una) salen bien armadas: UNA sola correcta, opciones distintas, ordenar con los mismos pasos mezclados, unir con sus ids, tocar con un dibujo que se puede tocar y trae la pieza; salen TODAS las variantes que se escribieron; y el simulacro de Naturales sale siempre completo, sin preguntas repetidas',pr2.length===0,pr2.slice(0,8).join(' | '));
chk('armar las preguntas de las ideas no rompió la página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 3) el recorrido, de verdad, tocando los botones
{
const p=await abrir({fecha:'2026-11-16T12:00:00',estado:{fecha:'2026-11-19'}});
const inicio=await p.innerText('#pInicio');
chk('el inicio muestra el nombre del módulo, la cuenta regresiva («Faltan 3 días», «Jueves 19 de noviembre»), Sociales y Naturales con su progreso (los temas son botones) y sin ningún «Pronto»',/Prueba final integradora/.test(inicio)&&/Faltan 3 días/.test(inicio)&&/Jueves,? 19 de noviembre/.test(inicio)&&/Sociales[\s\S]*Provincias y capitales[\s\S]*0 de 24 aprendidas[\s\S]*Países limítrofes[\s\S]*0 de 5 aprendidas/.test(inicio)&&/Naturales[\s\S]*El Sol sobre el horizonte[\s\S]*0 de 14 aprendidas[\s\S]*Las estaciones del año[\s\S]*0 de 20 aprendidas[\s\S]*Observación y registro: el gnomon[\s\S]*0 de 10 aprendidas/.test(inicio)&&!/Pronto/.test(inicio),inicio);
chk('el inicio ofrece un simulacro de cada materia («Simulacro de Sociales» y «Simulacro de Naturales»), prendidos, mientras «Repasar lo que me salió mal» está apagado; cada tarjeta de materia trae sus temas como botones',await p.evaluate(()=>!document.querySelector('.area.pronto')&&document.getElementById('bErrores').disabled&&!document.getElementById('bSim').disabled&&!document.getElementById('bSimNat').disabled&&/Simulacro de Sociales/.test(document.getElementById('bSim').innerText)&&/Simulacro de Naturales/.test(document.getElementById('bSimNat').innerText)&&document.querySelectorAll('.area[data-area="naturales"] .tema-btn').length===3&&document.querySelectorAll('.area[data-area="sociales"] .tema-btn').length>=2));
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

// ---------- 3a) los temas de ideas: estudiar (resumen, cuadro, dibujos, mapa conceptual), practicar, cada actividad y el memotest — en CADA tema de Naturales y de Sociales
{
const p0=await abrir();const temasIds=await p0.evaluate(()=>INT.IDEAS.temas.map(t=>t.id));await cerrar(p0);
const ACT_IDEAS=['cnMc','cnVf','cnTipear','cnOrdenar','cnUnir','cnTocar','cnEstacion'];
for(const tid of temasIds){
  const p=await abrir({fecha:'2026-11-16T12:00:00'});
  const def=await p.evaluate(id=>{const t=INT.IDEAS.temas.find(x=>x.id===id);return {id:t.id,area:t.area,nombre:t.nombre,paginas:t.paginas,grupos:t.grupos.map(g=>g.titulo),conceptos:t.conceptos.map(c=>({id:c.id,titulo:c.titulo,resumen:c.resumen,mc:c.mc.length,vf:c.vf.length,tipear:c.tipear.length,ordenar:c.ordenar.length,tocar:c.tocar.length,estacion:c.estacion})),tableros:t.tableros.map(tb=>tb.pares.map(x=>x[0])),estudio:t.estudio.map(e=>({id:e.id,titulo:e.titulo,dibujos:e.dibujos||null})),cuadro:t.cuadro||null,mapa:t.mapa||null}},tid);
  const hay={cnMc:c=>c.mc>0,cnVf:c=>c.vf>0,cnTipear:c=>c.tipear>0,cnOrdenar:c=>c.ordenar>0,cnTocar:c=>c.tocar>0,cnEstacion:c=>c.estacion,cnUnir:c=>def.tableros.some(tb=>tb.includes(c.id))};
  const esperadas=ACT_IDEAS.filter(k=>def.conceptos.some(hay[k]));
  const distintas={cnMc:def.conceptos.reduce((s,c)=>s+c.mc,0),cnVf:def.conceptos.reduce((s,c)=>s+c.vf,0),cnTipear:def.conceptos.reduce((s,c)=>s+c.tipear,0),cnOrdenar:def.conceptos.reduce((s,c)=>s+c.ordenar,0),cnTocar:def.conceptos.reduce((s,c)=>s+c.tocar,0),cnEstacion:4,cnUnir:def.tableros.length};
  const NT='«'+def.nombre+'»: ';
  await irTema(p,tid);
  // la pantalla del tema
  const tema=await p.evaluate(()=>({titulo:document.querySelector('#pTema .barra .titulo').innerText,acts:[...document.querySelectorAll('#pTema .act')].map(a=>a.dataset.act||a.id),filas:[...document.querySelectorAll('#pTema .fila-con')].map(f=>f.innerText.replace(/\s+/g,' ').trim()),estudiar:!!document.getElementById('bEstudiar'),practicar:!!document.getElementById('bPracticar')}));
  chk(NT+'la pantalla del tema trae «Practicar», «Estudiar este tema», las actividades que tienen preguntas ('+esperadas.length+') y el memotest, y la lista con sus '+def.conceptos.length+' ideas',tema.practicar&&tema.estudiar&&tema.acts.join()===esperadas.concat(['bMemo']).join()&&tema.filas.length===def.conceptos.length&&def.conceptos.every((c,i)=>tema.filas[i].includes(c.titulo))&&tema.titulo.includes(def.nombre),j(tema).slice(0,300));
  // estudiar: las pestañas
  await p.click('#bEstudiar');await p.waitForSelector('#pEst .tab');
  const tabs=await p.evaluate(()=>[...document.querySelectorAll('#pEst .tab')].map(b=>({id:b.dataset.tab,t:b.innerText.trim(),on:b.classList.contains('on')})));
  chk(NT+'la pantalla de estudio trae sus pestañas ('+def.estudio.map(e=>e.id).join(', ')+') con sus títulos y en orden, más «🎤 Examen oral» al final (se prueba aparte, en tests/integradora_oral.js), y arranca en el resumen',tabs.map(t=>t.id).join()===def.estudio.map(e=>e.id).concat('oral').join()&&tabs[0].on&&tabs.slice(1).every(t=>!t.on)&&def.estudio.every((e,i)=>tabs[i].t===e.titulo)&&tabs[tabs.length-1].t==='🎤 Examen oral',j(tabs));
  const res=await p.evaluate(()=>({grupos:[...document.querySelectorAll('#pEst .grupo h2')].map(h=>h.innerText.trim()),cards:[...document.querySelectorAll('#pEst .con')].map(c=>({id:c.id,t:c.querySelector('h3').innerText.trim(),p:c.querySelector('p').innerText.trim()})),nota:(document.querySelector('#pEst .nota-aj')||{innerText:''}).innerText}));
  chk(NT+'el resumen es una tarjeta por idea con SU resumen exacto, agrupadas con los títulos de los grupos, y al pie dice las páginas del libro y que si algo no coincide vale el libro',res.cards.length===def.conceptos.length&&def.conceptos.every(c=>res.cards.some(k=>k.id==='c-'+c.id&&k.p===c.resumen&&k.t.includes(c.titulo)))&&res.grupos.join('|')===def.grupos.join('|')&&res.nota.includes(def.paginas)&&/vale el libro/.test(res.nota),j({g:res.grupos,n:res.cards.length,nota:res.nota}).slice(0,300));
  if(def.cuadro){
    await p.click('#pEst .tab[data-tab="cuadro"]');
    const cu=await p.evaluate(()=>({cabeza:[...document.querySelectorAll('#pEst .cuadro thead th')].map(h=>h.innerText.trim()),filas:[...document.querySelectorAll('#pEst .cuadro tbody tr')].map(tr=>({t:tr.querySelector('th').innerText.trim(),v:[...tr.querySelectorAll('td')].map(td=>td.innerText.trim()),rot:[...tr.querySelectorAll('td')].map(td=>getComputedStyle(td,'::before').content.replace(/^"|"$/g,''))}))}));
    chk(NT+'el cuadro comparativo tiene sus '+def.cuadro.filas.length+' filas con los valores exactos y, en el celular, cada valor lleva el rótulo de su columna',cu.filas.length===def.cuadro.filas.length&&def.cuadro.filas.every((f,i)=>cu.filas[i].t===f.t&&cu.filas[i].v.join('|')===f.v.join('|')&&cu.filas[i].rot.join('|')===def.cuadro.cols.join('|'))&&cu.cabeza.slice(1).join('|')===def.cuadro.cols.join('|'),j(cu.filas[0]));
  }
  const dibs=(def.estudio.find(e=>e.id==='dibujos')||{}).dibujos||[];
  if(dibs.length){
    await p.click('#pEst .tab[data-tab="dibujos"]');await p.waitForSelector('#pEst .dib-est');
    const sec=await p.evaluate(()=>[...document.querySelectorAll('#pEst .dib-est')].map(s=>s.dataset.dib));
    chk(NT+'la pestaña de dibujos trae '+dibs.join(', ')+' en ese orden',sec.join()===dibs.join(),j(sec));
    for(const d of dibs){
      const info=await p.evaluate(d=>({piezas:[...new Set([...document.querySelectorAll('#pEst [data-dib="'+d+'"] svg.dibujo [data-id]')].map(e=>e.dataset.id))],inf:INT.IDEAS.info[d]||null}),d);
      if(!info.inf)continue;   // los árboles no se tocan
      const malos=[];
      for(const id of info.piezas){
        await tocarPieza(p,'#pEst [data-dib="'+d+'"]',id);await p.waitForTimeout(15);
        const r=await p.evaluate(([d,id])=>({box:document.getElementById('info-'+d).innerText.replace(/\s+/g,' '),res:[...document.querySelectorAll('#pEst [data-dib="'+d+'"] svg.dibujo .res')].map(e=>e.dataset.id).join()}),[d,id]);
        const esp=info.inf[id];if(!esp||!r.box.includes(esp.t)||!r.box.includes(esp.d.replace(/\s+/g,' '))||r.res!==id)malos.push(id+' → '+r.box.slice(0,60)+' ['+r.res+']');
      }
      chk(NT+'dibujo «'+d+'»: tocando de verdad cada una de sus '+info.piezas.length+' piezas aparece SU explicación y queda marcada sólo esa',malos.length===0&&info.piezas.length>=3,malos.slice(0,4).join(' | '));
    }
  }
  await p.click('#pEst .tab[data-tab="mapa"]');
  const mc=await p.evaluate(()=>({raiz:document.querySelector('#pEst .mc-raiz').innerText.trim(),ramas:[...document.querySelectorAll('#pEst .mc-rama')].map(r=>({t:r.querySelector('h3').innerText.trim(),h:[...r.querySelectorAll('li')].map(l=>l.innerText.trim())}))}));
  chk(NT+'el mapa conceptual muestra la idea central y sus '+def.mapa.ramas.length+' ramas con todas sus frases',mc.raiz===def.mapa.raiz&&mc.ramas.length===def.mapa.ramas.length&&def.mapa.ramas.every((r,i)=>mc.ramas[i].t===r.t&&mc.ramas[i].h.join('|')===r.h.join('|')),j(mc.raiz));
  // desde la lista de ideas se abre el resumen en esa idea
  await p.click('#pEst .atras');await p.waitForSelector('#bPracticar');
  const ult=def.conceptos[def.conceptos.length-1];
  await p.click('#pTema .fila-con[data-ver="'+ult.id+'"]');await p.waitForSelector('#pEst .con.foco');
  chk(NT+'tocar una idea de la lista abre el resumen y la deja marcada (la última: «'+ult.titulo+'»)',await p.evaluate(id=>document.querySelector('#pEst .tab.on').dataset.tab==='resumen'&&document.querySelector('#pEst .con.foco').id==='c-'+id&&document.querySelectorAll('#pEst .con.foco').length===1,ult.id));
  await p.click('#pEst .atras');await p.waitForSelector('#bPracticar');
  // practicar
  await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
  const r0=await p.evaluate(()=>({n:INT.ronda().qs.length,claves:INT.ronda().qs.map(q=>q.clave),ids:INT.ronda().qs.map(q=>q.ids[0])}));
  await jugar(p,()=>true);const fin=await textoFin(p),st=await estado(p),idsT=def.conceptos.map(c=>c.id);
  chk(NT+'«Practicar» arma 10 preguntas mezcladas sin repetir ninguna y todas de ideas de este tema; todo bien → «10 de 10», sin errores, y sube la caja de lo que apareció',r0.n===10&&new Set(r0.claves).size===10&&r0.ids.every(id=>idsT.includes(id))&&/10 de 10/.test(fin)&&/Sin errores/.test(fin)&&Object.keys(st.items).length>=5&&Object.keys(st.items).every(id=>idsT.includes(id))&&Object.values(st.items).every(e=>e.c>=1&&e.mal===0),j(r0.claves)+fin.slice(0,100)+j(st.items).slice(0,200));
  // cada actividad
  for(const k of esperadas){
    await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p,tid);
    await p.click('#pTema .act[data-act="'+k+'"]');await p.waitForSelector('#pPreg .consigna');
    const r=await p.evaluate(()=>({n:INT.ronda().qs.length,tags:[...new Set(INT.ronda().qs.map(q=>q.tag))],claves:INT.ronda().qs.map(q=>q.clave)}));
    const n=Math.max(1,Math.min(k==='cnUnir'?3:10,distintas[k]));
    const t=await jugar(p,()=>true);const f2=await textoFin(p);
    chk(NT+'actividad «'+k+'»: una ronda de '+n+' preguntas de ese tipo (hay '+distintas[k]+' distintas), sin repetir ninguna, todas bien → «'+n+' de '+n+'»',r.n===n&&r.tags.join()===k&&new Set(r.claves).size===r.claves.length&&new RegExp(n+' de '+n+'\\b').test(f2)&&/Sin errores/.test(f2),j(r)+f2.slice(0,100));
  }
  // el memotest: 5 parejas de un tablero (con alguna de otros), una equivocada y después todas bien
  await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p,tid);
  await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');
  const mm=await p.evaluate(()=>({n:document.querySelectorAll('#pMemo .cm').length,largo:document.querySelector('#pMemo .memo').classList.contains('largo'),ids:[...new Set(INT.memo().cartas.map(c=>c.id))],cartas:INT.memo().cartas.map(c=>c.id+'|'+c.lado+'|'+c.t),txt:document.querySelector('#pMemo .sub').innerText}));
  chk(NT+'el memotest arma las cartas de UN tablero del tema (4 o 5 parejas: una idea y lo que le corresponde), sin textos repetidos',mm.n===mm.ids.length*2&&mm.ids.length>=4&&mm.ids.length<=5&&mm.largo&&def.tableros.some(tb=>mm.ids.length===tb.length&&mm.ids.every(id=>tb.includes(id)))&&new Set(mm.cartas.map(x=>NORMT(x.split('|')[2]))).size===mm.n&&/una idea y lo que le corresponde/.test(mm.txt),j(mm).slice(0,300));
  const malos=await p.evaluate(()=>{const c=INT.memo().cartas;for(let i=0;i<c.length;i++)for(let k=i+1;k<c.length;k++)if(c[i].id!==c[k].id)return [i,k]});
  await p.click('#pMemo .cm[data-c="'+malos[0]+'"]');await p.click('#pMemo .cm[data-c="'+malos[1]+'"]');await p.waitForTimeout(1100);
  const pares=await p.evaluate(()=>{const c=INT.memo().cartas,m={};c.forEach((x,i)=>(m[x.id]=m[x.id]||[]).push(i));return Object.values(m)});
  for(const [a,c] of pares){await p.click('#pMemo .cm[data-c="'+a+'"]');await p.click('#pMemo .cm[data-c="'+c+'"]')}
  await p.waitForSelector('#pFin:not([hidden])',{timeout:5000});
  const fm=await textoFin(p),sm=await estado(p);
  chk(NT+'al encontrar todas las parejas termina: dice los intentos (uno equivocado y uno por pareja) y se anota en las cajas',new RegExp((mm.ids.length+1)+'\\s+intentos').test(fm)&&sm.rondas>=2&&idsT.filter(id=>sm.items[id]).length>=mm.ids.length,fm.slice(0,160));
  chk(NT+'no hubo errores de página',p.errs.length===0,j(p.errs));
  await cerrar(p);
}
}

// ---------- 3b) el tema «Países limítrofes»
{
const p=await abrir();
const temasIni=await p.evaluate(()=>[...document.querySelectorAll('#pInicio .area[data-area="sociales"] .tema-btn')].slice(0,2).map(b=>b.innerText.replace(/\s+/g,' ').trim()));
chk('el inicio muestra los dos primeros temas de Sociales con su progreso cada uno («0 de 24 aprendidas» y «0 de 5 aprendidas»)',temasIni.length===2&&/Provincias y capitales 0 de 24 aprendidas/.test(temasIni[0])&&/Países limítrofes 0 de 5 aprendidas/.test(temasIni[1]),j(temasIni));
await irTema(p,'limitrofes');
const tp=await p.evaluate(()=>({titulo:document.querySelector('#pTema .titulo').innerText,acts:[...document.querySelectorAll('.act')].map(a=>a.querySelector('b').textContent),filas:[...document.querySelectorAll('.fila-prov')].map(f=>f.innerText.replace(/\s+/g,' ').trim()),txt:document.getElementById('pTema').innerText.replace(/\s+/g,' ')}));
chk('la pantalla de «Países limítrofes» trae las 8 actividades con las palabras de un país, el memotest, el mapa para estudiar, el aviso de las DOS capitales de Bolivia y la lista de los 5 países con su capital (sin el aviso de la Ciudad de Buenos Aires)',/Países limítrofes/.test(tp.titulo)&&tp.acts.join('|')==='Elegir la capital|Elegir el país|¿Cuál está en el mapa?|Tocá en el mapa|Escribir la capital|Mapa mudo|Unir|Verdadero o falso|Memotest'&&tp.filas.join('|')==='Chile Santiago|Bolivia Sucre y La Paz|Paraguay Asunción|Brasil Brasilia|Uruguay Montevideo'&&/Bolivia tiene dos capitales/.test(tp.txt)&&/Valen las dos/.test(tp.txt)&&!/Ciudad de Buenos Aires/.test(tp.txt),j(tp));
// una fila de la lista abre el mapa con ESE país elegido
await p.click('.fila-prov[data-ver="bolivia"]');await p.waitForSelector('#pMapa svg.mapa-lim');
chk('tocar una fila de la lista de países abre el mapa de los vecinos con ese país elegido (Bolivia: sus dos capitales y pintada en el mapa)',/Bolivia/.test(await p.innerText('#pMapa .info'))&&/Sucre y La Paz/.test(await p.innerText('#pMapa .info'))&&await p.evaluate(()=>document.querySelector('#pMapa .res').dataset.id==='bolivia'));
await p.click('#pMapa .atras');await p.waitForSelector('#bPracticar');
chk('«⬅» del mapa vuelve al tema de los países (no al de las provincias)',/Países limítrofes/.test(await p.innerText('#pTema .titulo')));
// el mapa para estudiar de los vecinos: se toca de verdad el punto de cada país
await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa-lim');
const malLim=[];
for(const it of INT.PAISES){
  await tocarProv(p,it.id,'#pMapa');await p.waitForTimeout(25);
  const info=await p.innerText('#pMapa .info'),pintada=await p.evaluate(()=>[...document.querySelectorAll('#pMapa .res')].map(e=>e.dataset.id).join());
  if(!(info.includes(it.nombre)&&info.includes('Capital: '+it.capitalTxt)&&info.includes(it.limita)&&(!it.nota||info.includes(it.nota))&&pintada===it.id))malLim.push(it.id+' → '+info.replace(/\s+/g,' ').slice(0,70)+' ['+pintada+']');
}
chk('mapa de los vecinos para estudiar: tocando el punto de cada uno de los 5 países aparece SU nombre, SU capital (Bolivia: «Sucre y La Paz»), por dónde limita con la Argentina y su nota, y queda pintado',malLim.length===0,malLim.join(' | '));
const antes=await p.innerText('#pMapa .info');await tocarProv(p,'mendoza','#pMapa');await p.waitForTimeout(25);
chk('tocar la Argentina en ese mapa no cambia nada (no es un país para elegir)',(await p.innerText('#pMapa .info'))===antes&&await p.evaluate(()=>document.querySelectorAll('#pMapa .res').length===1));
await p.click('#mEtq');
chk('«Mostrar los nombres» escribe el nombre de los 5 países y «ARGENTINA»',await p.evaluate(()=>[...document.querySelectorAll('#pMapa svg.mapa-lim .et')].map(e=>e.textContent).sort().join()==='ARGENTINA,Bolivia,Brasil,Chile,Paraguay,Uruguay'));
await p.click('#mEtq');await p.click('#pMapa .atras');await p.waitForSelector('#bPracticar');
// cada actividad arma una ronda sólo de países y se puede jugar entera
for(const [k,n] of [['capEleg',10],['provEleg',10],['mapaEleg',10],['mapaToca',10],['capTipear',10],['mapaTipear',10],['unir',2],['vf',10]]){
  await p.click('.act[data-act="'+k+'"]');await p.waitForSelector('#pPreg .consigna');
  const r=await p.evaluate(()=>({n:INT.ronda().qs.length,tags:[...new Set(INT.ronda().qs.map(q=>q.tag))],pais:INT.ronda().qs.every(q=>q.ids.every(id=>INT.PAISES.some(x=>x.id===id)))}));
  await jugar(p,()=>true);const fin=await textoFin(p);
  chk('países · actividad «'+k+'»: una ronda de '+n+' preguntas de ese tipo, todas de países, todas bien → «'+n+' de '+n+'»',r.n===n&&r.tags.join()===k&&r.pais&&new RegExp(n+' de '+n+'\\b').test(fin)&&/Sin errores/.test(fin),j(r)+fin.slice(0,100));
  await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p,'limitrofes');
}
const stP=await estado(p);
chk('lo contestado bien sube la caja de los países (y de ninguna provincia) y se anota en «Hoy» como PREGUNTAS (72 = 7 actividades de 10 + un «unir» de 2 tableros)',Object.keys(stP.items).sort().join()==='bolivia,brasil,chile,paraguay,uruguay'&&Object.values(stP.items).every(e=>e.c>=1&&e.mal===0)&&stP.rondas===8&&j(stP.dias['2026-11-16'])===j([72,0]),j(stP.dias)+j(Object.keys(stP.items)));
// practicar: 10 mezcladas de países; con errores; «Otra ronda» sigue siendo de países
await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
const rp=await p.evaluate(()=>({n:INT.ronda().qs.length,pais:INT.ronda().qs.every(q=>q.ids.every(id=>INT.PAISES.some(x=>x.id===id)))}));
await jugar(p,i=>i>=3);
chk('«Practicar» en «Países limítrofes» arma 10 preguntas sólo de países y se puede jugar con errores (3 mal → «7 de 10»)',rp.n===10&&rp.pais&&/7 de 10/.test(await textoFin(p)));
await p.click('#bOtraMezcla');await p.waitForSelector('#pPreg .consigna');
chk('«Otra ronda» sigue siendo de países',await p.evaluate(()=>INT.ronda().qs.every(q=>q.ids.every(id=>INT.PAISES.some(x=>x.id===id)))&&INT.ronda().qs.length===10));
await cerrar(p);
}
// los dos temas no se mezclan aunque se pase de uno a otro (la ronda anterior no decide la siguiente)
{
const p=await abrir();
await irTema(p,'provincias');await p.click('.fila-prov[data-ver="tucuman"]');await p.waitForSelector('#pMapa svg.mapa');
chk('tocar una fila de la lista de provincias abre el mapa de las provincias con esa elegida (Tucumán, San Miguel de Tucumán)',/San Miguel de Tucumán/.test(await p.innerText('#pMapa .info'))&&await p.evaluate(()=>!document.querySelector('#pMapa svg.mapa').classList.contains('mapa-lim')&&document.querySelector('#pMapa .res').dataset.id==='tucuman'));
await p.click('#pMapa .atras');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');await p.waitForSelector('#pInicio .area');
await irTema(p,'provincias');await p.click('.act[data-act="capEleg"]');await p.waitForSelector('#pPreg .consigna');await jugar(p,()=>true);
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p,'limitrofes');
await p.click('.act[data-act="capEleg"]');await p.waitForSelector('#pPreg .consigna');
const a1=await p.evaluate(()=>INT.ronda().qs.every(q=>INT.PAISES.some(x=>x.id===q.ids[0])));await jugar(p,()=>true);
await p.click('#bOtra');await p.waitForSelector('#pPreg .consigna');
const a2=await p.evaluate(()=>INT.ronda().qs.every(q=>INT.PAISES.some(x=>x.id===q.ids[0])));await jugar(p,()=>true);
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await irTema(p,'provincias');
await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
const a3=await p.evaluate(()=>INT.ronda().qs.every(q=>INT.PROVINCIAS.some(x=>x.id===q.ids[0])||q.ids[0]==='caba'));
chk('después de jugar uno de los temas, el otro pregunta SÓLO lo suyo (países ↔ provincias), y «Otra ronda» se queda en el mismo tema',a1&&a2&&a3,j([a1,a2,a3]));
await cerrar(p);
}
// lo que se escribe en los países
{
const p=await abrir();
const tipear=async(tipo,id,texto)=>{
  await p.evaluate(([t,i])=>{INT.rondaCon([INT.gen(t,i,3)],false)},[tipo,id]);await p.waitForSelector('#resp');
  await p.fill('#resp',texto);await p.press('#resp','Enter');await p.waitForSelector('#feedback:not([hidden])');
  return {ok:await p.evaluate(()=>INT.ronda().ok===1),fb:await p.innerText('#feedback')};
};
let r=await tipear('capTipear','bolivia','Sucre');chk('la capital de Bolivia se acepta como «Sucre»',r.ok,r.fb);
r=await tipear('capTipear','bolivia','la paz');chk('y también como «La Paz» (la sede del gobierno): no se corrige como error',r.ok,r.fb);
r=await tipear('capTipear','bolivia','Sucre y La Paz');chk('o con las dos («Sucre y La Paz»)',r.ok,r.fb);
r=await tipear('capTipear','bolivia','Santiago');chk('pero «Santiago» está mal para Bolivia, y la corrección dice que Bolivia tiene dos capitales (Sucre y La Paz)',!r.ok&&/Sucre/.test(r.fb)&&/La Paz/.test(r.fb)&&/dos capitales/.test(r.fb),r.fb);
r=await tipear('capTipear','chile','Santiago de Chile');chk('la capital de Chile vale como «Santiago» o «Santiago de Chile»',r.ok,r.fb);
r=await tipear('capTipear','chile','Santiago del Estero');chk('«Santiago del Estero» está mal para Chile y la corrección aclara que es una provincia argentina',!r.ok&&/Santiago del Estero/.test(r.fb)&&/provincia argentina/.test(r.fb),r.fb);
r=await tipear('capTipear','brasil','Brasília');chk('«Brasília» (con tilde) vale para la capital de Brasil',r.ok,r.fb);
r=await tipear('capTipear','brasil','Rio de Janeiro');chk('«Río de Janeiro» está mal y la corrección explica que fue la capital hasta 1960',!r.ok&&/1960/.test(r.fb)&&/Brasilia/.test(r.fb),r.fb);
r=await tipear('provTipear','brasil','Brazil');chk('«Brazil» (en inglés) vale como nombre del país',r.ok,r.fb);
r=await tipear('mapaTipear','uruguay','URUGUAY');chk('en el mapa, el país pintado se acepta con mayúsculas («URUGUAY»)',r.ok,r.fb);
r=await tipear('mapaTipear','paraguay','Bolivia');chk('y otro país está mal',!r.ok&&/Paraguay/.test(r.fb),r.fb);
// «Tocá en el mapa» con un país
await p.evaluate(()=>{INT.rondaCon([INT.gen('mapaToca','uruguay',1)],false)});await p.waitForSelector('#pPreg svg.mapa-lim.clic');
await tocarProv(p,'chile','#pPreg');await p.waitForSelector('#feedback:not([hidden])');
const mal=await p.evaluate(()=>({ok:INT.ronda().ok,mal:INT.ronda().mal,verde:document.querySelector('#pPreg .prov.ok').dataset.id,rojo:document.querySelector('#pPreg .prov.mal').dataset.id,clic:document.querySelector('#pPreg svg.mapa').classList.contains('clic')}));
chk('«Tocá en el mapa» con un país: tocar otro se cuenta mal (en rojo), se muestra en verde el correcto y ya no se puede tocar más',mal.ok===0&&mal.mal===1&&mal.verde==='uruguay'&&mal.rojo==='chile'&&!mal.clic&&/Montevideo/.test(await p.innerText('#feedback')),j(mal));
await p.evaluate(()=>{INT.rondaCon([INT.gen('mapaToca','paraguay',1)],false)});await p.waitForSelector('#pPreg svg.mapa-lim.clic');
await tocarProv(p,'mendoza','#pPreg');await p.waitForTimeout(80);
chk('tocar la Argentina (que está en el mapa pero no es una respuesta) no corrige nada y se puede seguir probando',await p.evaluate(()=>INT.ronda().ok===0&&INT.ronda().mal===0&&document.getElementById('feedback').hidden&&document.querySelector('#pPreg svg.mapa').classList.contains('clic')));
await tocarProv(p,'paraguay','#pPreg');await p.waitForSelector('#feedback:not([hidden])');
chk('y tocar el país correcto se cuenta bien',await p.evaluate(()=>INT.ronda().ok===1&&document.querySelector('#pPreg .prov.ok').dataset.id==='paraguay'));
await cerrar(p);
}
// el memotest de los países: 5 pares, 10 cartas
{
const p=await abrir();await irTema(p,'limitrofes');
await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');
const m5=await p.evaluate(()=>({n:document.querySelectorAll('#pMemo .cm').length,pares:new Set(INT.memo().cartas.map(c=>c.id)).size,todosPaises:INT.memo().cartas.every(c=>INT.PAISES.some(x=>x.id===c.id)),sub:document.querySelector('#pMemo .sub').innerText,cols:getComputedStyle(document.querySelector('#pMemo .memo')).gridTemplateColumns.split(' ').length}));
chk('el memotest de los países arma 10 cartas de 5 pares (un país y su capital), en dos columnas, y dice «un país y su capital»',m5.n===10&&m5.pares===5&&m5.todosPaises&&/un país y su capital/.test(m5.sub)&&m5.cols===2,j(m5));
const malos=await p.evaluate(()=>{const c=INT.memo().cartas;for(let i=0;i<10;i++)for(let k=i+1;k<10;k++)if(c[i].id!==c[k].id)return [i,k]});
await p.click('#pMemo .cm[data-c="'+malos[0]+'"]');await p.click('#pMemo .cm[data-c="'+malos[1]+'"]');await p.waitForTimeout(1100);
const pares=await p.evaluate(()=>{const c=INT.memo().cartas,m={};c.forEach((x,i)=>(m[x.id]=m[x.id]||[]).push(i));return Object.values(m)});
for(const [a,c] of pares){await p.click('#pMemo .cm[data-c="'+a+'"]');await p.click('#pMemo .cm[data-c="'+c+'"]')}
await p.waitForSelector('#pFin:not([hidden])',{timeout:5000});
const fin=await textoFin(p),stm=await estado(p);
chk('al encontrar las 5 parejas termina: «6 intentos» (uno equivocado y cinco bien), «lo mejor posible son 5», y se anota en las cajas de los 5 países',/6\s+intentos/.test(fin)&&/lo mejor posible son 5/.test(fin)&&Object.keys(stm.items).sort().join()==='bolivia,brasil,chile,paraguay,uruguay',fin.slice(0,200)+j(Object.keys(stm.items)));
await p.click('#bOtraMemo');await p.waitForSelector('#pMemo .cm');
chk('«Otro memotest» sigue siendo de países (10 cartas)',await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').length===10&&INT.memo().cartas.every(c=>INT.PAISES.some(x=>x.id===c.id))));
await cerrar(p);
}
// repasar lo que salió mal mezcla los dos temas
{
const p=await abrir({estado:{items:{mendoza:{c:0,ok:0,mal:2,u:'2026-11-15'},bolivia:{c:1,ok:1,mal:1,u:'2026-11-15'},chile:{c:3,ok:3,mal:1,u:'2026-11-15'}}}});
const t=await p.innerText('#bErrores');
chk('«Repasar lo que me salió mal» junta lo de los dos temas: una provincia y un país (2 cosas; Chile ya lleva 3 en la caja y no cuenta)',/2 cosas/.test(t),t);
await p.click('#bErrores');await p.waitForSelector('#pPreg .consigna');
const rep=await p.evaluate(()=>({n:INT.ronda().qs.length,prot:[...new Set(INT.ronda().qs.map(q=>q.ids[0]))].sort().join()}));
chk('el repaso arma una ronda de 5 a 10 preguntas con esas dos protagonistas (mendoza y bolivia), cada una con el tipo de pregunta de lo suyo',rep.n>=5&&rep.n<=10&&rep.prot==='bolivia,mendoza',j(rep));
await jugar(p,()=>true);
const st=await estado(p);
chk('contestar bien sube las cajas de las dos (mendoza y bolivia) y no baja la de Chile',st.items.mendoza.c>=1&&st.items.bolivia.c>=2&&st.items.chile.c>=3,j(st.items));
await cerrar(p);
}

// ---------- 3c) lo que halló la revisión independiente
// el primer toque después de abrir la app se atiende enseguida (la espera anti doble toque no corre al arrancar)
{
const p=await abrir({conEspera:true});
await p.click('.tema-btn[data-tema="provincias"]');
chk('el primer toque después de abrir la app (aunque sea apenas aparece el inicio) se atiende: no se pierde',await p.waitForSelector('#bPracticar',{timeout:1500}).then(()=>true).catch(()=>false));
await cerrar(p);
}
// doble toque: «Siguiente» no contesta la pregunta que viene (con la espera de 400 ms prendida, como en un celular de verdad)
{
const p=await abrir({conEspera:true});
await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','mendoza',0),INT.gen('mapaToca','salta',1),INT.gen('unir','chaco',1)],false)});await p.waitForSelector('#pPreg .opcion');
const ant=await p.evaluate(()=>{document.querySelector('#pPreg .opcion').click();return INT.ronda().ok+INT.ronda().mal});   // apenas aparece la pregunta: no cuenta
chk('apenas aparece una pregunta nueva no se atiende ningún toque (400 ms): lo contestado al toque no cuenta',ant===0);
await p.waitForTimeout(500);
await p.evaluate(()=>{document.querySelectorAll('#pPreg .opcion')[INT.actual().opciones.findIndex(o=>o.ok)].click()});await p.waitForSelector('#bSig');await p.waitForTimeout(500);   // «Siguiente» no se atiende en los primeros 400 ms de la corrección
const c1=await p.evaluate(()=>new Promise(ok=>{document.getElementById('bSig').click();   // el segundo toque del doble toque cae sobre lo que quedó debajo del dedo
  const sv=document.querySelector('#pPreg svg.mapa path[data-id="mendoza"]');if(sv)sv.dispatchEvent(new MouseEvent('click',{bubbles:true}));
  setTimeout(()=>ok({i:INT.ronda().i,res:INT.actual().estado.resuelta,mal:INT.ronda().mal,tipo:INT.actual().tipo}),60)}));
chk('un doble toque en «Siguiente» pasa UNA sola pregunta y no contesta la que viene (aunque el segundo toque caiga sobre el mapa o una opción)',c1.i===1&&c1.res===false&&c1.mal===0&&c1.tipo==='mapa',j(c1));
await p.waitForTimeout(500);await tocarProv(p,'salta','#pPreg');await p.waitForSelector('#bSig');
await p.waitForTimeout(500);
const c2=await p.evaluate(()=>new Promise(ok=>{document.getElementById('bSig').click();const b=document.querySelector('#pPreg .par');if(b)b.click();setTimeout(()=>ok({i:INT.ronda().i,sel:INT.actual().estado.sel.length}),60)}));
chk('lo mismo con «unir»: el segundo toque no elige nada',c2.i===2&&c2.sel===0,j(c2));
// «Siguiente» tampoco se activa con una segunda tecla Enter pegada a la respuesta
await p.evaluate(()=>{INT.rondaCon([INT.gen('capTipear','mendoza',3),INT.gen('capTipear','salta',3)],false)});await p.waitForSelector('#resp');await p.waitForTimeout(500);
await p.fill('#resp','mendoza');await p.keyboard.press('Enter');await p.waitForSelector('#bSig');
await p.evaluate(()=>document.getElementById('bSig').click());await p.waitForTimeout(80);
chk('«Siguiente» no se activa dentro de los 400 ms de haber contestado (por ejemplo, con un segundo Enter)',await p.evaluate(()=>INT.ronda().i===0));
await p.waitForTimeout(450);await p.evaluate(()=>document.getElementById('bSig').click());
chk('y pasados esos 400 ms funciona normal',await p.evaluate(()=>INT.ronda().i===1));
await cerrar(p);
}
{
const p=await abrir({conEspera:true});
await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','mendoza',0),INT.gen('capEleg','salta',0)],true)});await p.waitForSelector('#pPreg .opcion');await p.waitForTimeout(500);
const r=await p.evaluate(()=>new Promise(ok=>{document.querySelector('#pPreg .opcion').click();setTimeout(()=>{const o=document.querySelector('#pPreg .opcion');if(o)o.click()},290);setTimeout(()=>ok({i:INT.ronda().i,res:INT.actual().estado.resuelta}),700)}));
chk('en el simulacro, un segundo toque a los 290 ms (justo cuando aparece la pregunta que sigue) no la contesta',r.i===1&&r.res===false,j(r));
await cerrar(p);
}
// «unir» en el simulacro: no dice si está bien (parejas numeradas que se pueden deshacer; se corrige con «Listo»)
{
const p=await abrir();
await p.evaluate(()=>{INT.rondaCon([INT.armarSimulacro().find(x=>x.tipo==='unir')],true)});await p.waitForSelector('#pPreg .par');
const q=await p.evaluate(()=>({izq:INT.actual().izq.map(x=>x.id),der:INT.actual().der.map(x=>x.id)}));
const par=async(i,jx)=>{await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+jx+'"]')};
await par(0,q.der.indexOf(q.izq[0]));await par(1,q.der.indexOf(q.izq[2]));   // una bien y una mal: no se nota
const e1=await p.evaluate(()=>({colores:document.querySelectorAll('#pPreg .par.hecho,#pPreg .par.no').length,bloq:[...document.querySelectorAll('#pPreg .par')].filter(b=>b.disabled).length,unidos:[...document.querySelectorAll('#pPreg .par.unido')].map(b=>b.dataset.n).sort().join(),listo:document.getElementById('bUnirListo').disabled,ayuda:document.querySelector('#pPreg .consigna small').innerText}));
chk('en el simulacro «unir» NO dice si una pareja está bien o mal (ni verde ni rojo, nada se bloquea): quedan numeradas (1, 1, 2, 2), «Listo» sigue apagado y la ayuda explica cómo deshacer',e1.colores===0&&e1.bloq===0&&e1.unidos==='1,1,2,2'&&e1.listo===true&&/tocala de nuevo/.test(e1.ayuda)&&/Listo/.test(e1.ayuda),j(e1));
await p.click('#pPreg .par[data-lado="i"][data-i="1"]');
chk('tocar una pareja armada la deshace (y su número queda libre)',await p.evaluate(()=>[...document.querySelectorAll('#pPreg .par.unido')].map(b=>b.dataset.n).join()==='1,1'&&document.getElementById('bUnirListo').disabled));
await par(1,q.der.indexOf(q.izq[1]));await par(2,q.der.indexOf(q.izq[3]));await par(3,q.der.indexOf(q.izq[2]));await par(4,q.der.indexOf(q.izq[4]));   // 2 y 3 quedan cambiadas
chk('con las 5 parejas armadas se prende «Listo» y todavía no se corrigió nada',await p.evaluate(()=>!document.getElementById('bUnirListo').disabled&&INT.actual().estado.resuelta===false&&INT.ronda().ok+INT.ronda().mal===0));
await p.click('#bUnirListo');await p.waitForFunction(()=>document.getElementById('pFin')&&!document.getElementById('pFin').hidden);
chk('al tocar «Listo» se corrige todo junto: dos parejas cambiadas = el tablero cuenta mal, y las 4 provincias mezcladas quedan para repasar',await p.evaluate(()=>INT.ronda().mal===1&&INT.ronda().ok===0&&INT.ronda().errores[0].estado.malos.length===4)&&/Para repasar \(1\)/.test(await textoFin(p)));
await cerrar(p);
}
// «unir» en la práctica: un solo tropiezo cuenta como bien y NO manda a nadie a repasar (antes decía «¡Muy bien!» y dejaba 2 provincias en la caja 0)
{
const p=await abrir();
const probar=async(tropiezos)=>{
  await p.evaluate(()=>{INT.rondaCon([INT.gen('unir','mendoza',1)],false)});await p.waitForSelector('#pPreg .par');
  const q=await p.evaluate(()=>({izq:INT.actual().izq.map(x=>x.id),der:INT.actual().der.map(x=>x.id)}));
  const par=async(i,jx)=>{await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+jx+'"]')};
  for(let k=0;k<tropiezos;k++){await par(0,q.der.findIndex(id=>id!==q.izq[0]));await p.waitForTimeout(500)}
  for(let i=0;i<5;i++)await par(i,q.der.indexOf(q.izq[i]));
  await p.waitForSelector('#feedback:not([hidden])');
  return p.evaluate(()=>({ok:INT.ronda().ok,mal:INT.ronda().mal,items:INT.actual().ids.map(id=>[id,INT.estado().items[id].c,INT.estado().items[id].mal])}));
};
const u1=await probar(1);
chk('un tablero de «unir» con UN solo tropiezo cuenta como bien y no baja a ninguna provincia a la caja 0',u1.ok===1&&u1.mal===0&&u1.items.every(([id,c,m])=>c>=1&&m===0),j(u1));
const u2=await probar(2);
chk('con dos tropiezos cuenta como mal, y sólo las provincias que se mezclaron vuelven a la caja 0',u2.mal===1&&u2.items.filter(([id,c,m])=>m>0&&c===0).length===2&&u2.items.filter(([id,c,m])=>m===0).length===3,j(u2));
await cerrar(p);
}
// el simulacro reparte las provincias: lo que se muestra en una parte no regala la respuesta de otra
{
const p=await abrir();
const mal=await p.evaluate(()=>{const mal=[];for(let k=0;k<300;k++){const qs=INT.armarSimulacro(),ids=n=>qs.filter(q=>q.parte&&q.parte[0]===n).flatMap(q=>q.ids);
  const BC=new Set([...ids('B'),...ids('C')]),DF=[...ids('D'),...ids('F')],A=ids('A');
  if(DF.length!==9||new Set(DF).size!==9||DF.some(id=>BC.has(id)))mal.push('D/F repiten o coinciden con B/C ('+k+')');
  if(A.length!==7||new Set(A).size!==7||A.some(id=>!BC.has(id)))mal.push('A fuera de B/C ('+k+')');
  if(ids('B').length!==10||new Set(ids('B')).size!==10||ids('C').length!==4)mal.push('B/C mal ('+k+')')}return mal.slice(0,5)});
chk('en 300 simulacros, D («Escribí la capital») y F («¿De qué provincia es capital?») preguntan SÓLO por provincias que NO aparecieron antes en B (unir) ni en C (verdadero o falso): 9 distintas; y A, que va primero, usa 7 de las que se muestran después',mal.length===0,j(mal));
await cerrar(p);
}
// fechas: una fecha a medio teclear no se guarda ni rompe el campo; una imposible se descarta; la cuenta se actualiza al volver
{
const p=await abrir();
await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');
await p.evaluate(()=>{window.__nodo=document.getElementById('aFecha')});
await p.fill('#aFecha','0002-11-19');
chk('en Ajustes, un año a medio teclear («0002-11-19») no se guarda y el campo no se pierde (sigue siendo el mismo input)',(await fechaST(p))===''&&await p.evaluate(()=>window.__nodo===document.getElementById('aFecha')));
await p.fill('#aFecha','2026-11-20');
chk('una fecha buena sí se guarda, sin volver a pintar el campo, y prende «Sacar la fecha»',(await fechaST(p))==='2026-11-20'&&(await estado(p)).fecha==='2026-11-20'&&await p.evaluate(()=>window.__nodo===document.getElementById('aFecha')&&!document.getElementById('aSinFecha').disabled));
await p.fill('#aFecha','');
chk('y vaciarla la saca (y apaga «Sacar la fecha»)',(await fechaST(p))===''&&(await estado(p)).fecha===''&&await p.evaluate(()=>document.getElementById('aSinFecha').disabled));
await cerrar(p);
const p2=await abrir({estado:{fecha:'2026-13-45'}});
chk('una fecha imposible guardada («2026-13-45») se descarta: no sale «Faltan 90 días» sino el saludo',/¡Hola, Felipe!/.test(await p2.innerText('.cuenta'))&&(await fechaST(p2))==='');
await cerrar(p2);
const p3=await abrir({fecha:'2026-11-18T23:50:00',estado:{fecha:'2026-11-19'}});
const a0=await p3.innerText('.cuenta');
await p3.evaluate(()=>{window.__F=new Date('2026-11-19T07:30:00').getTime();document.dispatchEvent(new Event('visibilitychange'))});
const a1=await p3.innerText('.cuenta');
await p3.evaluate(()=>{window.__F=new Date('2026-11-20T07:30:00').getTime();window.dispatchEvent(new Event('pageshow'))});
const a2=await p3.innerText('.cuenta');
chk('la cuenta regresiva se actualiza sola al volver a la pestaña después de la medianoche («¡Es mañana!» → «¡Es hoy! Mucha suerte» → «La prueba fue el jueves…»)',/¡Es mañana!/.test(a0)&&/¡Es hoy! Mucha suerte/.test(a1)&&/La prueba fue el jueves/.test(a2),[a0,a1,a2].join(' → '));
await cerrar(p3);
}
// la Ciudad de Buenos Aires y las abreviaturas del mapa
{
const p=await abrir();
const r=await p.evaluate(()=>{const o={n:0,ba:0,prov:0,ph:new Set(),vfMal:0,vfBien:0};for(let k=0;k<300;k++){const q=INT.gen('mapaEleg','caba',k%4);o.n++;if(q.opciones.some(x=>!x.ok&&x.t==='Buenos Aires'))o.ba++;if(q.opciones.some(x=>x.t==='Provincia de Buenos Aires'))o.prov++;o.ph.add(INT.gen('mapaTipear','caba',3).pista);
  const v=INT.gen('vf','buenosaires',1).resumen;if(/es Ciudad de Buenos Aires\./.test(v))o.vfMal++;if(/es la Ciudad de Buenos Aires\./.test(v))o.vfBien++}return {n:o.n,ba:o.ba,prov:o.prov,ph:[...o.ph],vfMal:o.vfMal,vfBien:o.vfBien}});
chk('para el punto de la Ciudad la opción incorrecta nunca es «Buenos Aires» (para un chico el punto ES Buenos Aires): es «Provincia de Buenos Aires», y aparece siempre; al escribir, el cartelito dice «Es…» y no «La provincia es…»',r.ba===0&&r.prov===r.n&&r.ph.join()==='Es…',j(r));
chk('«Provincia de Buenos Aires» no se confunde con nada: la provincia pintada sigue ofreciendo «Ciudad de Buenos Aires» como trampa, y el verdadero/falso dice «la Ciudad de Buenos Aires» con su artículo',r.vfMal===0&&r.vfBien>0,j(r));
const abrevMal=await p.evaluate(()=>INT.PROVINCIAS.filter(x=>!INT.gen('mapaTipear',x.id,3).aceptar.some(a=>INT.NORM(a)===INT.NORM(x.abrev))||!INT.gen('provTipear',x.id,3).aceptar.some(a=>INT.NORM(a)===INT.NORM(x.abrev))).map(x=>x.id));
chk('todas las abreviaturas que la app escribe en el mapa («Sta. Cruz», «Sgo. del Estero», «T. del Fuego», «Bs. As.»…) se aceptan al escribirlas',abrevMal.length===0,j(abrevMal));
// el memotest: el lector de pantalla oye lo que dice la carta abierta
await irTema(p);await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');
const m0=await p.evaluate(()=>{const c=INT.memo().cartas;let k=0;for(let i=1;i<c.length;i++)if(c[i].id!==c[0].id){k=i;break}return {a:0,b:k,ta:c[0].t,tb:c[k].t}});
await p.click('#pMemo .cm[data-c="0"]');
const l1=await p.evaluate(()=>document.querySelector('#pMemo .cm[data-c="0"]').getAttribute('aria-label'));
await p.click('#pMemo .cm[data-c="'+m0.b+'"]');await p.waitForTimeout(1100);
const l2=await p.evaluate(b=>[document.querySelector('#pMemo .cm[data-c="0"]').getAttribute('aria-label'),document.querySelector('#pMemo .cm[data-c="'+b+'"]').getAttribute('aria-label')],m0.b);
chk('en el memotest, una carta abierta se anuncia con su texto (no «Carta 1») y al taparse vuelve a «Carta N»',l1===m0.ta&&l2[0]==='Carta 1'&&l2[1]==='Carta '+(m0.b+1),j([l1,l2,m0]));
await cerrar(p);
}
chk('los textos de la revisión están corregidos en el código: «Seguí practicando» (no «Sigan») y la fecha en minúscula dentro de la oración',/Seguí practicando/.test(fs.readFileSync(path.join(RAIZ,'integradora','app.js'),'utf8'))&&!/Sigan/.test(fs.readFileSync(path.join(RAIZ,'integradora','app.js'),'utf8')));

// ---------- 4) el simulacro de Sociales: 40 preguntas (30 de provincias, 5 de países y 5 de la época colonial), sin ver si estuvo bien hasta el final, con resultado por parte
{
const p=await abrir();
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
const sim=await p.evaluate(()=>{const R=INT.ronda(),por={};R.qs.forEach(q=>{por[q.parte]=(por[q.parte]||0)+1});return {n:R.qs.length,test:R.test,por,parte:document.querySelector('.parte')&&document.querySelector('.parte').textContent}});
chk('el simulacro de Sociales tiene 40 preguntas en 8 partes (A · Elegí la capital 7, B · Uní provincias y capitales 2, C · Verdadero o falso 4, D · Escribí la capital 5, E · Mirá el mapa 8, F · ¿De qué provincia es capital? 4, G · Países limítrofes 5, H · La época colonial 5) y muestra la parte en cada pregunta',sim.n===40&&sim.test&&sim.por['H · La época colonial']===5&&sim.por['G · Países limítrofes']===5&&sim.por['A · Elegí la capital']===7&&sim.por['B · Uní provincias y capitales']===2&&sim.por['C · Verdadero o falso']===4&&sim.por['D · Escribí la capital']===5&&sim.por['E · Mirá el mapa']===8&&sim.por['F · ¿De qué provincia es capital?']===4&&/^A · /.test(sim.parte||''),j(sim));
await responder(p,true);await p.waitForTimeout(80);
chk('en el simulacro no se ve si estuvo bien o mal hasta el final (ni cartel, ni colores, ni «Siguiente»)',!(await visible(p,'#feedback'))&&!(await p.evaluate(()=>!!document.querySelector('#pPreg .opcion.si, #pPreg .opcion.no, #pPreg .resp.si, #pPreg .resp.no, #pPreg #bSig'))));
await p.waitForFunction(()=>INT.ronda().i===1);
const tipos=await jugar(p,()=>true,true);
const fin=await textoFin(p),st=await estado(p);
chk('simulacro de Sociales todo bien: «40 de 40», 100 %, «Por parte» con las 8 partes, sin errores, y queda guardado el resultado como de Sociales ('+[...new Set(tipos)].join('/')+')',/40 de 40/.test(fin)&&/100 %/.test(fin)&&/Por parte/.test(fin)&&(await p.locator('#pFin .pt').count())===8&&st.sims.length===1&&st.sims[0].p===40&&st.sims[0].t===40&&st.sims[0].a==='sociales'&&!/Para repasar/.test(fin),fin.slice(0,260)+j(st.sims));
chk('el resultado por parte muestra cuántas salieron bien en cada una (7 / 7, 2 / 2, 4 / 4, 5 / 5, 8 / 8, 4 / 4, 5 / 5, 5 / 5)',await p.evaluate(()=>[...document.querySelectorAll('#pFin .pt b')].map(x=>x.textContent).join()==='7 / 7,2 / 2,4 / 4,5 / 5,8 / 8,4 / 4,5 / 5,5 / 5'));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');
chk('el inicio muestra «tu mejor resultado: 100 %»',/tu mejor resultado: 100 %/.test(await p.innerText('#bSim')));
await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');
await jugar(p,()=>false,true);
const finM=await textoFin(p),stM=await estado(p);
chk('simulacro de Sociales todo mal: «0 de 40», muchas cosas «para repasar» y el mejor resultado sigue siendo el de antes',/0 de 40/.test(finM)&&/Para repasar \(40\)/.test(finM)&&stM.sims.length===2&&stM.sims[1].p===0&&Math.max(...stM.sims.map(s=>s.p))===40,finM.slice(0,200));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');
chk('después de fallar el simulacro hay muchas cosas para repasar (botón prendido)',await p.evaluate(()=>!document.getElementById('bErrores').disabled&&/\d+ cosas/.test(document.getElementById('bErrores').innerText)));
chk('el simulacro no produjo errores de página',p.errs.length===0,j(p.errs));
await cerrar(p);
}

// ---------- 4b) el simulacro de Naturales: 21 preguntas en 6 partes, sin ver si estuvo bien hasta el final, con su resultado por parte (y no se mezcla con el de Sociales)
{
const p=await abrir();
await p.click('#bSimNat');await p.waitForSelector('#pPreg .consigna');
const sim=await p.evaluate(()=>{const R=INT.ronda(),por={};R.qs.forEach(q=>{por[q.parte]=(por[q.parte]||0)+1});return {n:R.qs.length,test:R.test,area:R.area,por,parte:document.querySelector('.parte')&&document.querySelector('.parte').textContent}});
chk('el simulacro de Naturales tiene 21 preguntas en 6 partes (A · Elegí la respuesta 6, B · Verdadero o falso 4, C · Mirá el dibujo 4, D · Ordená 2, E · Uní las ideas 2, F · Escribí 3), es de Naturales y muestra la parte en cada pregunta',sim.n===21&&sim.test&&sim.area==='naturales'&&JSON.stringify(sim.por)===JSON.stringify({'A · Elegí la respuesta':6,'B · Verdadero o falso':4,'C · Mirá el dibujo':4,'D · Ordená':2,'E · Uní las ideas':2,'F · Escribí':3})&&/^A · /.test(sim.parte||''),j(sim));
await responder(p,true);await p.waitForTimeout(80);
chk('en el simulacro de Naturales no se ve si estuvo bien o mal hasta el final (ni cartel, ni colores, ni «Siguiente»)',!(await visible(p,'#feedback'))&&!(await p.evaluate(()=>!!document.querySelector('#pPreg .opcion.si, #pPreg .opcion.no, #pPreg .resp.si, #pPreg .resp.no, #pPreg #bSig, #pPreg .paso.si, #pPreg .paso.no'))));
await p.waitForFunction(()=>INT.ronda().i===1);
const tipos=await jugar(p,()=>true,true);
const fin=await textoFin(p),st=await estado(p);
chk('simulacro de Naturales todo bien: «21 de 21», 100 %, «Por parte» con las 6 partes, sin errores, y queda guardado como un simulacro de Naturales ('+[...new Set(tipos)].join('/')+')',/21 de 21/.test(fin)&&/100 %/.test(fin)&&(await p.locator('#pFin .pt').count())===6&&st.sims.length===1&&st.sims[0].a==='naturales'&&st.sims[0].p===21&&st.sims[0].t===21&&!/Para repasar/.test(fin),fin.slice(0,200)+j(st.sims));
chk('el resultado por parte muestra cuántas salieron bien en cada una (6 / 6, 4 / 4, 4 / 4, 2 / 2, 2 / 2, 3 / 3)',await p.evaluate(()=>[...document.querySelectorAll('#pFin .pt b')].map(x=>x.textContent).join()==='6 / 6,4 / 4,4 / 4,2 / 2,2 / 2,3 / 3'));
await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');
chk('el inicio muestra «tu mejor resultado: 100 %» en el simulacro de Naturales, y el de Sociales sigue sin resultado propio',/tu mejor resultado: 100 %/.test(await p.innerText('#bSimNat'))&&/preguntas como las de una prueba/.test(await p.innerText('#bSim')));
await p.click('#bSimNat');await p.waitForSelector('#pPreg .consigna');
await jugar(p,()=>false,true);
const finM=await textoFin(p),stM=await estado(p);
chk('simulacro de Naturales todo mal: «0 de 21», «Para repasar (21)», y el mejor resultado sigue siendo el de antes',/0 de 21/.test(finM)&&/Para repasar \(21\)/.test(finM)&&stM.sims.length===2&&stM.sims[1].p===0&&Math.max(...stM.sims.map(s=>s.p))===21,finM.slice(0,200));
chk('cada error del simulacro de Naturales dice qué se preguntaba, la respuesta buena (✔) y qué contestó (✘), sin repetir la pregunta dos veces',await p.evaluate(()=>{const e=[...document.querySelectorAll('#pFin .err')];return e.length===21&&e.every(x=>x.querySelector('.er')&&x.querySelector('.ee').textContent.length>5)&&e.every(x=>{const q=x.querySelector('.eq').textContent.trim(),pp=x.querySelector('.ep');return !pp||pp.textContent.trim()!==q})}));
await p.click('#bRepetirErr');await p.waitForSelector('#pPreg .consigna');
chk('«Repasar lo que falló» después del simulacro de Naturales arma una ronda de 5 a 10 preguntas de ideas de Naturales',await p.evaluate(()=>{const R=INT.ronda();return R.qs.length>=5&&R.qs.length<=10&&R.qs.every(q=>q.ids.every(id=>INT.IDEAS.temas.some(t=>t.area==='naturales'&&t.conceptos.some(c=>c.id===id))))}));
chk('el simulacro de Naturales no produjo errores de página',p.errs.length===0,j(p.errs));
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
r=await tipear('mapaTipear','caba','Buenos Aires');chk('y también «Buenos Aires» (el punto es la ciudad de Buenos Aires)',r.ok,r.fb);
r=await tipear('mapaTipear','santacruz','Sta. Cruz');chk('la abreviatura que se ve en el mapa («Sta. Cruz») se acepta al escribir',r.ok,r.fb);
r=await tipear('provTipear','santiago','sgo. del estero');chk('«Sgo. del Estero» también (con o sin mayúsculas y puntos)',r.ok,r.fb);
r=await tipear('mapaTipear','tierradelfuego','T. del Fuego');chk('y «T. del Fuego»',r.ok,r.fb);
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
for(const [f,fecha,esp] of [['2026-11-16T09:00:00','2026-11-19',/Faltan 3 días/],['2026-11-18T23:50:00','2026-11-19',/¡Es mañana!/],['2026-11-19T08:00:00','2026-11-19',/¡Es hoy! Mucha suerte/],['2026-11-20T08:00:00','2026-11-19',/La prueba fue el jueves,? 19 de noviembre/]]){
  const p=await abrir({fecha:f,estado:{fecha}});
  const t=await p.innerText('.cuenta');chk('la cuenta regresiva el '+f.slice(0,10)+' (prueba el '+fecha+') dice «'+t.split('\n')[0]+'»',esp.test(t),t);await cerrar(p);
}

// ---------- 7) lo guardado roto no rompe nada, y se anda sin almacenamiento
{
const j2=JSON.stringify;
const casos=[['no es JSON','esto no es json{'],['es una lista','[1,2,3]'],['es un número','42'],['es null','null'],
  ['campos del tipo equivocado',j2({v:'x',fecha:42,etq:'sí',items:[1,2],dias:'hoy',sims:{a:1},rondas:'muchas'})],
  ['fecha imposible',j2({fecha:'2026-13-45'})],
  ['valores locos (también «__proto__» y «constructor»)',j2({fecha:'2026-11-19',items:{mendoza:{c:99,ok:-5,mal:'x',u:'mañana'},chile:{c:77,ok:'1',mal:-3,u:'ayer'},bolivia:{c:1e12,ok:1e12,mal:NaN},salta:{c:1e12,ok:1e12,mal:NaN},'__proto__':{c:3},constructor:{c:1},toString:{c:2}},dias:{hoy:[1,2],'2026-11-09':[3,'x'],'2026-11-08':'no'},sims:[{f:'x',p:999,t:0},null,5],rondas:-3})]];
for(const [n,e] of casos){
  const p=await abrir({estado:e});
  const ok=await p.evaluate(()=>{const ST=INT.estado(),it=Object.values(ST.items);return it.every(x=>x.c>=0&&x.c<=4&&x.ok>=0&&x.mal>=0&&Number.isFinite(x.ok)&&(x.u===''||/^\d{4}-\d{2}-\d{2}$/.test(x.u)))&&ST.sims.every(s=>s.p>=0&&s.t>=1)&&Object.values(ST.dias).every(d=>Array.isArray(d)&&d.length===2&&d.every(Number.isFinite))&&Number.isFinite(ST.rondas)&&(ST.fecha===''||/^\d{4}-\d{2}-\d{2}$/.test(ST.fecha))&&!Array.isArray(ST.items)});
  chk('lo guardado roto («'+n+'») no rompe: abre normal, sin errores, con valores sanos',ok&&await visible(p,'#pInicio .area')&&p.errs.length===0,j(p.errs));
  await irTema(p);await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');await responder(p,true);
  await cerrar(p);
}
// lo guardado de los temas de ideas: los simulacros recuerdan de qué materia son (los viejos, sin materia, cuentan como de Sociales) y las ideas guardadas se conservan (con el mismo filtro de ids raros)
{
  const p=await abrir({estado:j2({fecha:'2026-11-19',sims:[{f:'2026-11-10',p:20,t:30},{f:'2026-11-11',p:15,t:21,a:'naturales'},{f:'2026-11-12',p:3,t:21,a:'otra cosa'},{f:'2026-11-13',p:5,t:21,a:{x:1}},null],items:{verano:{c:2,ok:3,mal:1,u:'2026-11-15'},sol_verano:{c:1,ok:1,mal:0,u:'2026-11-15'},arco:{c:99,ok:-5,mal:'x',u:'mañana'},constructor:{c:4},toString:{c:1},idea_que_no_existe:{c:3}}})});
  const st=await p.evaluate(()=>INT.estado());
  chk('los simulacros guardados recuerdan su materia: sin materia o con una rara cuentan como de Sociales, «naturales» se conserva',st.sims.map(x=>x.a).join()==='sociales,naturales,sociales,sociales',j(st.sims));
  chk('las ideas de los temas de ideas guardadas se conservan con sus cajas sanas, y los ids que no son ideas ni provincias («constructor», «toString», uno inventado) se descartan',Object.keys(st.items).sort().join()==='arco,sol_verano,verano'&&st.items.verano.c===2&&st.items.sol_verano.c===1&&st.items.arco.c===4&&st.items.arco.ok===0&&st.items.arco.mal===0&&st.items.arco.u==='',j(st.items));
  chk('el inicio muestra el mejor resultado de CADA materia por separado (Sociales 67 %, Naturales 71 %)',/tu mejor resultado: 67 %/.test(await p.innerText('#bSim'))&&/tu mejor resultado: 71 %/.test(await p.innerText('#bSimNat')));
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
  const todos=[...pant.querySelectorAll('button,input,svg.mapa,svg.dibujo')].filter(vis);
  todos.forEach(e=>{const c=caja(e);
    if(c.l<-0.5||c.r>vw+0.5)out.push('se sale de la pantalla: '+desc(e)+' ['+Math.round(c.l)+','+Math.round(c.r)+']');
    if(e.matches('svg.mapa')&&(c.h<150||c.w<70))out.push('el mapa quedó muy chico: '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('svg.dibujo')&&!e.matches('svg.arbol')&&(c.h<60||c.w<110))out.push('el dibujo quedó muy chico: '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('button,input')&&!e.matches('input[type=checkbox]')&&(c.w<34||c.h<34))out.push('muy chico para el dedo: '+desc(e)+' '+Math.round(c.w)+'×'+Math.round(c.h));
    if(e.matches('input[type=checkbox]')){const fila=e.closest('label');if(!fila||fila.getBoundingClientRect().height<44)out.push('casillero sin una fila grande para tocar: '+desc(e))}
    if(e.matches('.opcion,.par,.btn,.act,.fila-prov,.cm,.area,.tema-btn,.resp,.paso,.tab')&&e.scrollWidth>e.clientWidth+1)out.push('texto cortado: '+desc(e)+' '+e.scrollWidth+'>'+e.clientWidth);
    if(e.matches('.opcion,.par,.btn,.act,.cm,.area,.tema-btn,.paso,.tab')&&e.scrollHeight>e.clientHeight+2)out.push('texto cortado (alto): '+desc(e))});
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
  await p.click('#pTema .atras');
  await irTema(p,'limitrofes');await m('tema: países limítrofes');
  await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa-lim');await m('mapa de los vecinos');
  await tocarProv(p,'bolivia','#pMapa');await m('mapa de los vecinos (Bolivia elegida: la nota más larga)');
  await p.click('#mEtq');await m('mapa de los vecinos con nombres');await p.click('#mEtq');
  await p.click('#pMapa .atras');
  await p.click('#pTema .atras');await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');await m('ajustes');await p.click('#pAjustes .atras');
  // las preguntas: cada tipo, con la provincia de nombres más largos
  const lote=await p.evaluate(()=>{
    const I=window.INT,tipos=['capEleg','provEleg','vf','capTipear','provTipear','mapaEleg','mapaTipear','mapaToca','unir'];window.__lote=[];
    const largo=q=>(q.cuerpo||'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,'').length+(q.opciones||[]).reduce((s,o)=>s+o.t.length,0)+(q.izq||[]).reduce((s,x)=>s+x.t.length,0)+(q.der||[]).reduce((s,x)=>s+x.t.length,0);
    tipos.forEach(tipo=>{const qs=[];I.ITEMS.filter(it=>I.ELEGIBLES[tipo].includes(it)).forEach(it=>{for(let k=0;k<3;k++){try{qs.push(I.gen(tipo,it.id,1))}catch(e){}}});qs.sort((a,b)=>largo(b)-largo(a));qs.slice(0,3).forEach(q=>window.__lote.push(q))});
    ['catamarca','tierradelfuego','santiago','tucuman','jujuy'].forEach(id=>{window.__lote.push(I.gen('capEleg',id,1));window.__lote.push(I.gen('mapaEleg',id,1))});window.__lote.push(I.gen('mapaEleg','caba',1));window.__lote.push(I.gen('vf','caba',1));
    [['capEleg','bolivia'],['capEleg','chile'],['provEleg','brasil'],['vf','bolivia'],['capTipear','bolivia'],['provTipear','paraguay'],['mapaEleg','paraguay'],['mapaEleg','chile'],['mapaTipear','uruguay'],['mapaToca','brasil'],['mapaToca','chile'],['unir','chile']].forEach(([t,id])=>window.__lote.push(I.gen(t,id,1)));
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
  // «unir» del simulacro, con las 5 parejas numeradas y el botón «Listo»
  await p.evaluate(()=>{INT.rondaCon([INT.armarSimulacro().find(x=>x.tipo==='unir')],true)});await p.waitForSelector('#bUnirListo');
  const qu=await p.evaluate(()=>({izq:INT.actual().izq.map(x=>x.id),der:INT.actual().der.map(x=>x.id)}));
  for(let i=0;i<5;i++){await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+qu.der.indexOf(qu.izq[i])+'"]')}
  await m('unir del simulacro (5 parejas numeradas y «Listo»)');
  // el memotest
  await p.evaluate(()=>{window.scrollTo(0,0)});await p.click('#pPreg .barra .atras').catch(()=>{});
  await p.evaluate(()=>{});
  await p.waitForSelector('#modal:not([hidden])').then(()=>p.click('#mSi')).catch(()=>{});
  await p.waitForSelector('#pInicio:not([hidden])');await irTema(p);
  await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');await m('memotest (boca abajo)');
  await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').forEach(c=>c.classList.add('abierta')));await m('memotest (todas abiertas)');
  await p.click('#bSalirMemo');await p.click('#mSi');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');await p.waitForSelector('#bSim');
  await irTema(p,'limitrofes');await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');await m('memotest de países (boca abajo)');
  await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').forEach(c=>c.classList.add('abierta')));await m('memotest de países (todas abiertas)');
  // el resultado del simulacro
  await p.click('#bSalirMemo');await p.click('#mSi');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');await p.waitForSelector('#bSim');
  await p.click('#bSim');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3===0,true);await m('resultado del simulacro (con errores)');
  chk('diseño '+nombre+': inicio, los dos temas, los dos mapas para estudiar (con y sin nombres), ajustes, '+lote+' preguntas (sin corregir y corregidas), los dos memotest y el resultado del simulacro — nada se sale, se pisa ni se corta, y los mapas se ven',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
  await cerrar(p);
}


// ---------- 8b) DISEÑO de los temas de ideas (resumen, cuadro, dibujos, mapa conceptual, cada tipo de pregunta, el memotest de ideas y el resultado del simulacro de Naturales), en 12 tamaños
for(const [nombre,w,h] of (RAPIDO?TAMANOS.slice(3,4):TAMANOS)){
  const p=await abrir({vp:{width:w,height:h}});
  const falla=[];
  const m=async(que)=>{const o=await p.evaluate(medir);o.forEach(x=>falla.push(que+' → '+x))};
  const temas=await p.evaluate(()=>INT.IDEAS.temas.map(t=>({id:t.id,tabs:t.estudio.map(e=>e.id),dibs:(t.estudio.find(e=>e.id==='dibujos')||{}).dibujos||[]})));
  await m('inicio (con Naturales)');
  for(const t of temas){
    await irTema(p,t.id);await m('tema '+t.id);
    await p.click('#bEstudiar');await p.waitForSelector('#pEst .tab');
    for(const tab of t.tabs){
      await p.click('#pEst .tab[data-tab="'+tab+'"]');await p.waitForTimeout(40);await m('estudio '+t.id+' · '+tab);
      if(tab==='dibujos')for(const d of t.dibs){
        const pz=await p.evaluate(d=>{const ids=[...new Set([...document.querySelectorAll('#pEst [data-dib="'+d+'"] svg.dibujo [data-id]')].map(e=>e.dataset.id))],inf=INT.IDEAS.info[d];if(!inf)return null;return ids.sort((a,b)=>(inf[b].t+inf[b].d).length-(inf[a].t+inf[a].d).length)[0]},d);
        if(pz){await tocarPieza(p,'#pEst [data-dib="'+d+'"]',pz);await m('estudio '+t.id+' · dibujo '+d+' con la explicación más larga ('+pz+')')}
      }
    }
    await p.click('#pEst .atras');await p.click('#pTema .atras');await p.waitForSelector('#bSimNat');
  }
  // las preguntas: de cada tipo, las de enunciado y opciones más largos (y una de cada dibujo en «tocar»)
  const lote=await p.evaluate(()=>{
    const I=window.INT,tipos=['cnMc','cnVf','cnTipear','cnOrdenar','cnUnir','cnTocar','cnEstacion'];window.__lote=[];
    const largo=q=>(q.consigna||'').length+(q.cuerpo||'').replace(/<svg[\s\S]*?<\/svg>/g,'').replace(/<[^>]*>/g,'').length+(q.opciones||[]).reduce((s,o)=>s+o.t.length,0)+(q.izq||[]).reduce((s,x)=>s+x.t.length,0)+(q.der||[]).reduce((s,x)=>s+x.t.length,0)+(q.pasos||[]).reduce((s,x)=>s+x.length,0);
    tipos.forEach(tipo=>{const qs=[];I.IDEAS.conceptos.filter(it=>I.ELEGIBLES[tipo].includes(it)).forEach(it=>{for(let k=0;k<6;k++){try{qs.push(I.gen(tipo,it.id,1))}catch(e){}}});
      qs.sort((a,b)=>largo(b)-largo(a));qs.slice(0,3).forEach(q=>window.__lote.push(q));
      if(tipo==='cnTocar')[...new Set(qs.map(q=>q.dib))].forEach(d=>{const q=qs.find(x=>x.dib===d);if(q&&!window.__lote.includes(q))window.__lote.push(q)})});
    return window.__lote.length;
  });
  for(let i=0;i<lote;i++){
    await p.evaluate(i=>{INT.rondaCon([window.__lote[i]],false)},i);
    await p.waitForSelector('#pPreg .consigna');
    const info=await p.evaluate(()=>INT.actual().tag+(INT.actual().dib?'/'+INT.actual().dib:''));
    await m('pregunta '+i+' '+info);
    let colocado=false;
    if(info.startsWith('cnOrdenar')){   // con todos los pasos puestos (numerados, en el orden al revés) y el botón «Listo» prendido
      const orden=await p.evaluate(()=>{const q=INT.actual();return q.correcto.map(t=>q.pasos.indexOf(t))});
      for(const k of orden.slice().reverse())await p.click('#pPreg .paso[data-p="'+k+'"]');
      await m('ordenar con todos los pasos puestos '+i);colocado=true;
    }
    if(i%2===0||colocado){
      if(colocado)await p.click('#bOrdenListo');else await responder(p,false);
      await p.waitForSelector('#feedback:not([hidden])');
      await p.evaluate(()=>{window.scrollTo(0,0)});await p.waitForTimeout(20);
      await m('corregida '+i+' '+info);
      const sig=await p.evaluate(()=>{const e=document.getElementById('bSig');if(!e)return 'no hay «Siguiente»';e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect(),bar=document.querySelector('#pPreg .barra').getBoundingClientRect();return r.top>=bar.bottom-1&&r.bottom<=innerHeight+1&&r.left>=0&&r.right<=innerWidth+1?'':'«Siguiente» no se ve entero (o queda bajo la barra de arriba): '+Math.round(r.top)+'–'+Math.round(r.bottom)+' de '+innerHeight+', barra hasta '+Math.round(bar.bottom)});
      if(sig)falla.push('corregida '+i+' '+info+' → '+sig);
    }
  }
  // «unir» del simulacro de Naturales, con las parejas numeradas y «Listo»
  await p.evaluate(()=>{INT.rondaCon([INT.armarSimulacroNat().find(x=>x.tipo==='unir')],true)});await p.waitForSelector('#bUnirListo');
  const qu=await p.evaluate(()=>({izq:INT.actual().izq.map(x=>x.id),der:INT.actual().der.map(x=>x.id)}));
  for(let i=0;i<qu.izq.length;i++){await p.click('#pPreg .par[data-lado="i"][data-i="'+i+'"]');await p.click('#pPreg .par[data-lado="d"][data-i="'+qu.der.indexOf(qu.izq[i])+'"]')}
  await m('unir del simulacro de Naturales (parejas numeradas y «Listo»)');
  // el memotest de ideas (cartas con frases): boca abajo y con todas abiertas
  await p.evaluate(()=>{window.scrollTo(0,0)});await p.click('#pPreg .barra .atras').catch(()=>{});
  await p.waitForSelector('#modal:not([hidden])').then(()=>p.click('#mSi')).catch(()=>{});
  await p.waitForSelector('#pInicio:not([hidden])');
  for(const t of temas){
    await irTema(p,t.id);await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');await m('memotest de ideas '+t.id+' (boca abajo)');
    await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').forEach(c=>c.classList.add('abierta')));await m('memotest de ideas '+t.id+' (todas abiertas)');
    await p.click('#bSalirMemo');await p.click('#mSi');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');await p.waitForSelector('#bSimNat');
  }
  // el resultado del simulacro de Naturales, con errores
  await p.click('#bSimNat');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3===0,true);await m('resultado del simulacro de Naturales (con errores)');
  chk('diseño de los temas de ideas '+nombre+': inicio, '+temas.length+' temas con todas sus pestañas de estudio (y cada dibujo con una pieza elegida), '+lote+' preguntas (sin corregir y corregidas), unir del simulacro, el memotest de ideas y el resultado del simulacro de Naturales — nada se sale, se pisa ni se corta, y los dibujos se ven',falla.length===0&&p.errs.length===0,falla.slice(0,6).join(' | ')+j(p.errs));
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
      if(e.closest('.cuenta,.area,.mc-raiz'))return;   // blanco sobre degradé: se mide aparte
      const cs=getComputedStyle(e),a=lum(cs.color),b=lum(fondo(e)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
      const grande=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&+cs.fontWeight>=700);
      if(ratio<(grande?3:4.5))out.push(e.className.split(' ')[0]+'«'+(e.innerText||'').slice(0,20).replace(/\n/g,' ')+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(e)+')')});
    [...pant.querySelectorAll('.cuadro td')].forEach(td=>{const cs=getComputedStyle(td,'::before');if(cs.content==='none'||cs.content==='normal')return;const a=lum(cs.color),b=lum(fondo(td)),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);if(ratio<4.5)out.push('rótulo del cuadro «'+td.dataset.col+'» '+ratio.toFixed(2)+' (color '+cs.color+' sobre '+fondo(td)+')')});
    // lo que va sobre un degradé (la cuenta regresiva y las tarjetas de las materias): se mide contra CADA color del degradé que dice el CSS de verdad (el peor caso), con la transparencia del texto y de lo que lo contiene
    const rgb=c=>num(c).slice(0,3),lumRGB=a=>.2126*lin(a[0])+.7152*lin(a[1])+.0722*lin(a[2]);
    const ratioRGB=(a,b)=>{const x=lumRGB(a),y=lumRGB(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const opac=(e,tope)=>{let o=1;while(e){o*=+getComputedStyle(e).opacity;if(e===tope)break;e=e.parentElement}return o};
    pant.querySelectorAll('.cuenta,.area,.mc-raiz').forEach(cont=>{
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
  await p.click('#pTema .atras');await irTema(p,'limitrofes');await medirContraste('tema: países limítrofes');
  await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa-lim');await tocarProv(p,'bolivia','#pMapa');await p.click('#mEtq');await medirContraste('mapa de los vecinos');await p.click('#mEtq');await p.click('#pMapa .atras');await p.click('#pTema .atras');await irTema(p);
  await p.click('#bMapaEst');await p.waitForSelector('#pMapa svg.mapa');await tocarProv(p,'mendoza','#pMapa');await medirContraste('mapa para estudiar');await p.click('#pMapa .atras');
  for(const [tipo,id] of [['capEleg','santafe'],['capTipear','salta'],['mapaEleg','cordoba'],['mapaToca','jujuy'],['unir','mendoza'],['vf','chaco'],['mapaEleg','paraguay'],['mapaToca','chile'],['unir','brasil'],['capEleg','bolivia']]){
    await p.evaluate(([t,i])=>{INT.rondaCon([INT.gen(t,i,1)],false)},[tipo,id]);await p.waitForSelector('#pPreg .consigna');
    await medirContraste('pregunta '+tipo);
    await responder(p,false);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (mal) '+tipo);
  }
  await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','chaco',0)],false)});await p.waitForSelector('#pPreg .opcion');await responder(p,true);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (bien)');
  await p.evaluate(()=>{INT.rondaCon([INT.gen('capEleg','chaco',0),INT.gen('capEleg','salta',0)],false)});await p.waitForSelector('#pPreg .opcion');await jugar(p,i=>i>0);await medirContraste('resultado');
  // los temas de ideas: cada tema, todas sus pestañas de estudio (con una pieza de cada dibujo elegida), cada tipo de pregunta (sin corregir, con los pasos puestos y corregida) y el memotest
  await p.click('#bInicioFin');await p.waitForSelector('#pInicio .area');await medirContraste('inicio (con Naturales)');
  const temasC=await p.evaluate(()=>INT.IDEAS.temas.map(t=>({id:t.id,tabs:t.estudio.map(e=>e.id),dibs:(t.estudio.find(e=>e.id==='dibujos')||{}).dibujos||[]})));
  for(const t of temasC){
    await irTema(p,t.id);await medirContraste('tema '+t.id);
    await p.click('#bEstudiar');await p.waitForSelector('#pEst .tab');
    for(const tab of t.tabs){
      await p.click('#pEst .tab[data-tab="'+tab+'"]');await p.waitForTimeout(30);
      if(tab==='dibujos')for(const d of t.dibs){const pz=await p.evaluate(d=>(INT.IDEAS.info[d]?[...new Set([...document.querySelectorAll('#pEst [data-dib="'+d+'"] svg.dibujo [data-id]')].map(e=>e.dataset.id))][0]:null)||null,d);if(pz)await tocarPieza(p,'#pEst [data-dib="'+d+'"]',pz)}
      await medirContraste('estudio '+t.id+' · '+tab);
    }
    await p.click('#pEst .atras');await p.click('#pTema .atras');
  }
  for(const [tipo,id] of [['cnMc','verano'],['cnVf','arco'],['cnTipear','gnomon'],['cnOrdenar','estaciones'],['cnUnir','verano'],['cnTocar','sombra_mediodia'],['cnEstacion','estaciones']]){
    await p.evaluate(([t,i])=>{INT.rondaCon([INT.gen(t,i,1)],false)},[tipo,id]);await p.waitForSelector('#pPreg .consigna');await medirContraste('pregunta '+tipo);
    if(tipo==='cnOrdenar'){const orden=await p.evaluate(()=>{const q=INT.actual();return q.correcto.map(t=>q.pasos.indexOf(t))});for(const k of orden.slice().reverse())await p.click('#pPreg .paso[data-p="'+k+'"]');await medirContraste('ordenar con los pasos puestos (al revés)');await p.click('#bOrdenListo')}
    else await responder(p,false);
    await p.waitForSelector('#feedback:not([hidden])');await medirContraste('corregida (mal) '+tipo);
  }
  await p.evaluate(()=>{INT.rondaCon([INT.gen('cnOrdenar','estaciones',1)],false)});await p.waitForSelector('#pPreg .paso');await responder(p,true);await p.waitForSelector('#feedback:not([hidden])');await medirContraste('ordenar corregida (bien)');
  await p.click('#pPreg .barra .atras');await p.click('#mSi');await p.waitForSelector('#pInicio:not([hidden])');
  await irTema(p,'sol');await p.click('#bMemo');await p.waitForSelector('#pMemo .cm');await p.evaluate(()=>document.querySelectorAll('#pMemo .cm').forEach(c=>c.classList.add('abierta')));await medirContraste('memotest de ideas (abiertas)');await p.click('#bSalirMemo');await p.click('#mSi');await p.waitForSelector('#bPracticar');await p.click('#pTema .atras');
  await p.click('#bSimNat');await p.waitForSelector('#pPreg .consigna');await jugar(p,i=>i%3===0,true);await medirContraste('resultado del simulacro de Naturales');
  await p.click('#bInicioFin');await p.click('#pInicio .barra .atras');await p.waitForSelector('#aFecha');await medirContraste('ajustes');
  chk('contraste de los textos en modo '+(oscuro?'oscuro':'claro')+' (4,5 a 1; 3 a 1 en texto grande) en inicio, tema, mapa, preguntas, corregidas, resultado, ajustes, y en los temas de ideas (resumen, cuadro, dibujos, mapa conceptual, cada tipo de pregunta, memotest y resultado del simulacro de Naturales)',malos.length===0,malos.slice(0,6).join(' | '));
  await cerrar(p);
}

// ---------- 10) aviso de «versión nueva» (este módulo no usa motor.js, que es quien avisa en Felu y Raphina: sin esto una app instalada o dejada abierta sigue con la versión de antes)
{
  const p=await abrir();
  const miMarca=await p.evaluate(()=>{const e=document.querySelector('script[src*="app.js"]');return (/app\.js\?b=([^"'&\s>]+)/.exec(e.getAttribute('src'))||[])[1]||''});
  chk('en http (como en estas pruebas) el aviso de versión no hace nada: no consulta, no recarga, no muestra nada',await p.evaluate(()=>INT.vigilarVersion()===null&&!document.querySelector('.int-nuevo'))&&!p.pedidos.some(x=>/[?&]c=\d+/.test(x.u)));
  chk('la página tiene su propia marca de versión («?b=») en sus scripts: es lo que se compara con la publicada',/\S/.test(miMarca),miMarca);
  // helper: arma un vigilante con el index.html «publicado» simulado y lo corre
  const vigilar=(op)=>p.evaluate(async op=>{
    window.__rec=[];
    const v=INT.vigilarVersion({https:true,mia:op.mia,sinEventos:true,leer:op.falla?(async()=>{throw new Error('sin red')}):(async()=>'<html><script src="oral.js?b='+op.pub+'"></script><script src="app.js?b='+op.pub+'"></script></html>'),recargar:n=>window.__rec.push(n)});
    await v.revisar(op.alAbrir);
    return {rec:window.__rec.slice(),aviso:!!document.querySelector('.int-nuevo'),flag:sessionStorage.getItem('integradora_recarga')};
  },op);
  const quitar=()=>p.evaluate(()=>{document.querySelectorAll('.int-nuevo').forEach(e=>e.remove());sessionStorage.removeItem('integradora_recarga')});
  let r=await vigilar({mia:'v1',pub:'v1',alAbrir:true});
  chk('si la versión publicada es la misma, no pasa nada',r.rec.length===0&&!r.aviso);
  r=await vigilar({mia:'v1',pub:'v2',alAbrir:true,falla:true});
  chk('si no se puede consultar (sin internet), no pasa nada',r.rec.length===0&&!r.aviso);
  r=await vigilar({mia:'v1',pub:'v2',alAbrir:true});
  chk('recién abierta, en el inicio y sin nada empezado, con una versión nueva publicada: se recarga SOLA una vez (v2), sin cartel',r.rec.join()==='v2'&&!r.aviso&&r.flag==='v2',JSON.stringify(r));
  r=await vigilar({mia:'v1',pub:'v2',alAbrir:true});
  chk('… pero si ya se recargó por esa versión en esta sesión (y la página sigue vieja), no entra en un ciclo: muestra el cartel',r.rec.length===0&&r.aviso,JSON.stringify(r));
  await quitar();
  r=await vigilar({mia:'v1',pub:'v3',alAbrir:false});
  chk('al VOLVER de otra aplicación (la app quedó abierta en segundo plano) no recarga sola: muestra «🔄 Hay una versión nueva de la app» con «Actualizar»',r.rec.length===0&&r.aviso&&await p.evaluate(()=>/Hay una versión nueva de la app/.test(document.querySelector('.int-nuevo').innerText)&&document.querySelector('.int-nuevo .ok').innerText==='Actualizar'),JSON.stringify(r));
  const med=await p.evaluate(()=>{const c=document.querySelector('.int-nuevo'),r=c.getBoundingClientRect(),bs=[...c.querySelectorAll('button')].map(b=>{const q=b.getBoundingClientRect();return [Math.round(q.width),Math.round(q.height)]});
    const num=x=>x.match(/[\d.]+/g).map(Number),lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)},lum=x=>{const [a,b,d]=num(x);return .2126*lin(a)+.7152*lin(b)+.0722*lin(d)};
    const cs=getComputedStyle(c),fondo=cs.backgroundColor,ratio=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
    return {izq:r.left,der:r.right,ancho:innerWidth,bs,txt:ratio(cs.color,fondo),btn:ratio(getComputedStyle(c.querySelector('.ok')).color,getComputedStyle(c.querySelector('.ok')).backgroundColor),scroll:document.documentElement.scrollWidth}});
  chk('el cartel entra en la pantalla (sin scroll de costado), sus botones miden 44 px o más y el texto contrasta (≥ 4,5 a 1)',med.izq>=0&&med.der<=med.ancho&&med.scroll<=med.ancho&&med.bs.every(x=>x[1]>=40&&x[0]>=40)&&med.txt>=4.5&&med.btn>=4.5,JSON.stringify(med));
  await p.click('.int-nuevo .ok');
  chk('«Actualizar» guarda la marca de la versión para no entrar en un ciclo y recarga',await p.evaluate(()=>sessionStorage.getItem('integradora_recarga')==='v3'&&window.__rec.join()==='v3'));
  await p.click('.int-nuevo .x');
  chk('«✕» cierra el cartel',await p.evaluate(()=>!document.querySelector('.int-nuevo')));
  await quitar();
  // con algo empezado no se recarga sola aunque se acabe de abrir: no se pierde lo que se está haciendo
  await irTema(p,'provincias');await p.click('#bPracticar');await p.waitForSelector('#pPreg .consigna');
  r=await vigilar({mia:'v1',pub:'v4',alAbrir:true});
  chk('con una ronda empezada no se recarga sola (no se pierde lo que se está haciendo): muestra el cartel',r.rec.length===0&&r.aviso,JSON.stringify(r));
  await quitar();
  await p.click('#pPreg .barra .atras');await p.click('#mSi');await p.waitForSelector('#pInicio:not([hidden])');
  await p.evaluate(()=>{window.__enc=INT.oral.enCurso;INT.oral.enCurso=()=>true});   // (hay un examen oral en curso: no se empieza uno de verdad acá, que pediría micrófono e IA)
  r=await vigilar({mia:'v1',pub:'v5',alAbrir:true});
  chk('ni en medio de un examen oral',r.rec.length===0&&r.aviso,JSON.stringify(r));
  await p.evaluate(()=>{INT.oral.enCurso=window.__enc});
  chk('sin errores de página (aviso de versión)',p.errs.length===0,JSON.stringify(p.errs));
  await cerrar(p);
}

await b.close();if(srv)srv.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length+' de '+res.length);
process.exit(res.every(Boolean)?0:1);
})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)});
