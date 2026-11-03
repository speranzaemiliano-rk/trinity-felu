// «Sala de 5» (carpeta sala5/): los juegos para una nena de 5 años que todavía no lee (inglés, lengua y matemática).
// Cubre: que cada frase tenga su mp3 (y no sobre ninguno) y que los mp3 sean audio de verdad; que los 30 juegos armen siempre preguntas bien hechas
// (UNA sola respuesta correcta, opciones distintas, todo lo que se dice con audio); el recorrido (¡Jugar!, áreas, juegos, figuritas, álbum);
// que el primer sonido salga DENTRO del toque (así el iPhone habilita el audio); rondas de cada tipo (elegir, contar, canasta, armar el nombre);
// que equivocarse nunca trabe (probá de nuevo → el bueno late → se lo muestra y sigue); que si no toca nada repita la consigna y marque la respuesta;
// niveles que suben solos, figuritas y álbum lleno; el panel para grandes (se abre apretando 1,4 s, nombre, sonido, dificultad, borrar en dos toques);
// que lo guardado roto no rompa nada; que no pida nada a otros sitios (sólo las fuentes de Google) y ande sin ellas; la voz del aparato si un audio no baja;
// y el DISEÑO: ningún botón se sale de la pantalla ni se pisa, en 5 tamaños (celular chico, celular, tablet vertical y horizontal, celular de costado).
// Se puede probar el sitio publicado:  URL=https://speranzaemiliano-rk.github.io/trinity-felu/sala5/ node tests/sala5.js
const {chromium,devices}=require('playwright');const fs=require('fs');const path=require('path');
const RAIZ=path.resolve(__dirname,'..');
let URL=process.env.URL||null;   // sin URL: se levanta un servidor local con la carpeta del proyecto (un origen http de verdad: con file:// el almacenamiento del navegador falla a veces al recargar)
const http=require('http');
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
const servir=()=>new Promise(ok=>{const sv=http.createServer((rq,rs)=>{
  let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);
  if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);return rs.end('no')}
  rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});rs.end(fs.readFileSync(f))});
  sv.listen(0,'127.0.0.1',()=>ok(sv))});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);
const dormir=ms=>new Promise(r=>setTimeout(r,ms));

// ---------- 1) los archivos: cada frase tiene su mp3, no sobra ninguno y son audio de verdad
const dirAudio=path.join(RAIZ,'sala5','audio');
const mp3s=fs.readdirSync(dirAudio).filter(f=>/\.mp3$/.test(f)).map(f=>f.replace(/\.mp3$/,''));
const manifest=JSON.parse(fs.readFileSync(path.join(dirAudio,'manifest.js'),'utf8').match(/\[[\s\S]*\]/)[0]);
chk('la lista de audios (audio/manifest.js) y los mp3 de la carpeta son exactamente los mismos ('+mp3s.length+')',manifest.length===mp3s.length&&manifest.every(k=>mp3s.includes(k))&&mp3s.every(k=>manifest.includes(k)),j([manifest.filter(k=>!mp3s.includes(k)).slice(0,5),mp3s.filter(k=>!manifest.includes(k)).slice(0,5)]));
const raros=mp3s.filter(k=>{const b=fs.readFileSync(path.join(dirAudio,k+'.mp3'));return b.length<1200||!(b.slice(0,3).toString('latin1')==='ID3'||(b[0]===0xff&&(b[1]&0xe0)===0xe0))});
chk('todos los mp3 son audio de verdad (no una página de error guardada con extensión .mp3)',raros.length===0,j(raros.slice(0,5)));
const peso=mp3s.reduce((s,k)=>s+fs.statSync(path.join(dirAudio,k+'.mp3')).size,0);
chk('los audios pesan poco ('+(peso/1e6).toFixed(1)+' MB en total): se bajan de a uno, sólo los que se usan',peso<12e6);
const html=fs.readFileSync(path.join(RAIZ,'sala5','index.html'),'utf8');
chk('la página está en español, con viewport para celular, título, manifiesto e ícono',/<html lang="es">/.test(html)&&/name="viewport"/.test(html)&&/<title>Sala de 5/.test(html)&&/rel="manifest"/.test(html)&&/rel="apple-touch-icon"/.test(html));

(async()=>{
let srv=null;if(!URL){srv=await servir();URL='http://127.0.0.1:'+srv.address().port+'/sala5/'}
const ORIGEN_PROPIO=new globalThis.URL(URL).origin;
const b=await chromium.launch();

// ---------- ayudas
async function abrir(o){
  o=o||{};
  const ctx=await b.newContext(Object.assign(o.dispositivo?devices[o.dispositivo]:{viewport:o.vp||{width:390,height:844},hasTouch:true},{serviceWorkers:'block'}));
  const pedidos=[];ctx.on('request',r=>pedidos.push({u:r.url(),m:r.method()}));
  const p=await ctx.newPage();p.errs=[];p.pedidos=pedidos;
  p.on('pageerror',e=>p.errs.push(e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR/.test(m.text()))p.errs.push('console: '+m.text())});
  await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());   // sin las fuentes de Google tiene que andar igual
  if(o.storageRoto)await p.addInitScript(()=>{const t=()=>{throw new DOMException('bloqueado','SecurityError')};Storage.prototype.getItem=t;Storage.prototype.setItem=t;Storage.prototype.removeItem=t});
  await p.addInitScript(oo=>{
    window.__plays=[];window.__voz=[];window.__enClic=false;window.S5_SIN_BLOQUEO=!oo.conBloqueo;
    document.addEventListener('click',()=>{window.__enClic=true;setTimeout(()=>{window.__enClic=false},0)},true);
    // el audio se parece al de un navegador de verdad: tarda un rato en sonar; si lo pausan o le cambian el archivo, ESA frase ya no termina; y si el mp3 no baja, avisa con «error» y rechaza la promesa
    HTMLMediaElement.prototype.pause=function(){this.__tok=null};
    HTMLMediaElement.prototype.play=function(){const s=this,src=String(s.src);window.__plays.push({src:src.replace(/^.*\/audio\//,''),enClic:window.__enClic});
      if(oo.audioRoto)return new Promise((ok,no)=>setTimeout(()=>{s.onerror&&s.onerror(new Event('error'));no(new DOMException('no hay fuente','NotSupportedError'))},12));
      const tok=s.__tok={};setTimeout(()=>{if(s.__tok===tok&&String(s.src)===src)s.onended&&s.onended()},oo.audioLento||12);return Promise.resolve()};
    speechSynthesis.speak=u=>{window.__voz.push({texto:u.text,lang:u.lang});setTimeout(()=>u.onend&&u.onend(),oo.vozLenta||12)};
    speechSynthesis.cancel=()=>{};
    if(oo.rapido){const st=window.setTimeout,d=oo.rapido===true?100:oo.rapido;window.setTimeout=(f,ms,...a)=>st(f,ms>=5000?ms/d:ms,...a)}   // lo que tarda 5 s o más pasa 100 veces más rápido (o «rapido» veces): la espera de «no toca nada»
    if(oo.estado&&!localStorage.getItem('__sembrado')){localStorage.setItem('__sembrado','1');localStorage.setItem('sala5_estado',typeof oo.estado==='string'?oo.estado:JSON.stringify(oo.estado))}   // se siembra una sola vez (si no, al recargar volvería a pisar lo que la página guardó)
  },{estado:o.estado,rapido:o.rapido,audioRoto:o.audioRoto,audioLento:o.audioLento,vozLenta:o.vozLenta,conBloqueo:o.conBloqueo});
  await p.goto(URL);await p.waitForSelector('#bJugar');
  if(!o.sinSplash){await p.click('#bJugar',{force:true});await p.waitForSelector('#pInicio:not([hidden])')}
  return {ctx,p};
}
const estado=p=>p.evaluate(()=>JSON.parse(JSON.stringify(S5.estado())));
const hablados=p=>p.evaluate(()=>S5.hablados.slice());
const iniciar=(p,id,niv)=>p.evaluate(([id,niv])=>{if(niv){S5.estado().juegos[id]=Object.assign({nivel:niv,rondas:0,perfectas:0,mejor:0},S5.estado().juegos[id]||{},{nivel:niv})}S5.hablados.length=0;S5.jugar(id)},[id,niv]);
const punto=p=>p.evaluate(()=>[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora')));
const esperarPunto=(p,n)=>p.waitForFunction(n=>[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora'))===n,n,{timeout:9000});
const esperarPregunta=p=>p.waitForFunction(()=>document.querySelectorAll('#jOps button').length>0||document.querySelector('#jEst .letra-f'),null,{timeout:9000});
// contesta lo que hay en pantalla: «ok» = lo correcto, «mal» = algo equivocado. Devuelve qué tipo de pregunta era.
const contestar=(p,que,nombre)=>p.evaluate(([que,nombre])=>{
  const listo=document.querySelector('#jOps .listo');
  if(listo){   // canasta: «poné N»
    const est=document.getElementById('jEst'),n=+est.querySelector('.canasta-meta').textContent;
    if(que==='ok'){[...est.querySelectorAll('.pila .ficha')].slice(0,n).forEach(f=>f.click())}
    listo.click();return 'canasta';
  }
  const fichas=[...document.querySelectorAll('#jEst .letra-f:not(.usada)')];
  if(fichas.length||document.querySelector('#jEst .hueco-l')){   // armar el nombre: letras en orden
    const L=[...nombre.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase()].filter(x=>/[A-ZÑ]/.test(x));
    const hechas=document.querySelectorAll('#jEst .hueco-l.puesto').length;
    if(que==='ok'){const f=fichas.find(x=>x.dataset.l===L[hechas]);if(f)f.click()}
    else{const f=fichas.find(x=>x.dataset.l!==L[hechas]);if(f)f.click()}
    return 'nombre';
  }
  const o=que==='ok'?document.querySelector('#jOps [data-ok]'):document.querySelector('#jOps .op:not([data-ok]),#jOps .panel:not([data-ok])');
  if(o)o.click();return 'eleccion';
},[que,nombre||'']);
// una ronda entera: plan = 5 entradas: 'bien' (de una), 'mal1' (una equivocación y después bien), 'mal3' (tres equivocaciones: se la muestran y sigue sola)
async function ronda(p,plan,nombre){
  for(let i=0;i<plan.length;i++){
    await esperarPunto(p,i);await esperarPregunta(p);
    const t=plan[i];
    if(t==='bien')await contestar(p,'ok',nombre);
    else if(t==='mal1'){await contestar(p,'mal',nombre);await contestar(p,'ok',nombre)}
    else if(t==='mal3'){await contestar(p,'mal',nombre);await contestar(p,'mal',nombre);await contestar(p,'mal',nombre)}
    if(plan[i]==='bien'&&await p.evaluate(()=>!!document.querySelector('#jEst .letra-f')))   // el nombre se arma letra por letra
      for(let k=0;k<20&&await p.evaluate(()=>!!document.querySelector('#jEst .letra-f:not(.usada)'));k++)await contestar(p,'ok',nombre);
  }
  await p.waitForSelector('#premio:not([hidden])',{timeout:12000});
}
const visible=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&!e.hidden&&getComputedStyle(e).display!=='none'},sel);

// ---------- 2) lo que sabe decir: registro de frases, audios y contenido
let {ctx,p}=await abrir({sinSplash:true});
const data=await p.evaluate(()=>{
  const C=S5.C,HAY=new Set(S5_AUDIO),reg=Object.keys(S5.audio);
  const pal=C.PAL.map(x=>({p:x.p,ok:x.sil.join('')===x.p&&x.ini===C.sinAcento(x.p)[0].toUpperCase()&&x.n===x.p.length&&!!x.e&&/^(el|la)$/.test(x.art)&&x.sil.every(s=>s.length>0)&&HAY.has(C.palClip(x))&&HAY.has(C.palArtClip(x))}));
  return {n:reg.length,sinAudio:reg.filter(k=>!HAY.has(k)),sobra:[...HAY].filter(k=>!S5.audio[k]),idioma:reg.filter(k=>(k.startsWith('en_')?'en':'es')!==S5.audio[k].l),
    sinTexto:reg.filter(k=>!String(S5.audio[k].tts||'').trim()),pal:pal.filter(x=>!x.ok).map(x=>x.p),nPal:pal.length,
    rimas:C.RIMAS.every(g=>g.every(w=>C.PALBY[w])&&g.length>=2),packs:C.PACKS.map(k=>({id:k.id,n:k.items.length})),juegos:S5.juegos.map(g=>g.id)};
});
chk('todo lo que la app puede decir ('+data.n+' frases) tiene su mp3, y no hay mp3 de frases que ya no existen',data.sinAudio.length===0&&data.sobra.length===0,j([data.sinAudio.slice(0,5),data.sobra.slice(0,5)]));
chk('cada frase tiene texto y su idioma (es_/en_) coincide con el de la voz que se grabó',data.sinTexto.length===0&&data.idioma.length===0,j([data.sinTexto.slice(0,3),data.idioma.slice(0,3)]));
chk('las '+data.nPal+' palabras con dibujo están bien armadas (sílabas que suman la palabra, inicial, artículo, dibujo y audio) y las rimas son de palabras que existen',data.pal.length===0&&data.rimas,j(data.pal));
chk('los 12 temas de inglés tienen al menos 6 cosas cada uno, y hay 30 juegos en total',data.packs.length===12&&data.packs.every(k=>k.n>=6)&&data.juegos.length===30,j([data.packs,data.juegos.length]));
await ctx.close();

// ---------- 3) los generadores: preguntas bien hechas, muchas veces, en todos los niveles
({ctx,p}=await abrir({sinSplash:true}));
const gen=await p.evaluate(()=>{
  const mal=[],HAY=new Set(S5_AUDIO);let preguntas=0;
  S5.estado().nombre='Sofía';
  const clavesDe=q=>[].concat(q.decir||[],q.alAcertar||[],...(q.opciones||[]).map(o=>o.decir||[]));
  S5.juegos.forEach(j=>{for(let n=1;n<=j.niv;n++)for(let i=0;i<120;i++){
    let q;try{q=j.gen(n)}catch(e){mal.push(j.id+' n'+n+': '+e.message);break}
    preguntas++;
    const sin=clavesDe(q).filter(k=>!HAY.has(k));if(sin.length)mal.push(j.id+' n'+n+': sin audio '+sin.slice(0,3));
    if(!(q.decir&&q.decir.length))mal.push(j.id+': no dice nada');
    if(q.tipo==='eleccion'){
      const oks=q.opciones.filter(o=>o.ok).length;if(oks!==1)mal.push(j.id+' n'+n+': '+oks+' correctas');
      if(q.opciones.length<2||q.opciones.length>6)mal.push(j.id+': '+q.opciones.length+' opciones');
      const k=q.opciones.map(o=>(o.aria||'')+'|'+o.h);if(new Set(k).size!==k.length)mal.push(j.id+' n'+n+': opciones repetidas '+JSON.stringify(k).slice(0,90));
      if(q.opciones.some(o=>!o.aria))mal.push(j.id+': una opción sin nombre para lector de pantalla');
    }else if(q.tipo==='canasta'){
      if(!(q.n>=1&&q.n<=10&&q.total>=q.n&&q.total<=12))mal.push(j.id+' n'+n+': canasta n='+q.n+' total='+q.total);
    }else if(q.tipo==='nombre'){
      if(!(q.letras&&q.letras.length>=2))mal.push(j.id+': nombre con menos de 2 letras');
    }else mal.push(j.id+': tipo raro '+q.tipo);
  }});
  return {preguntas,mal:[...new Set(mal)].slice(0,15)};
});
chk('los 30 juegos arman '+gen.preguntas+' preguntas (todos los niveles) sin una sola mal hecha: UNA respuesta correcta, opciones distintas y con nombre, y todo lo que dicen tiene audio',gen.mal.length===0,j(gen.mal));
await ctx.close();

// ---------- 4) el recorrido: ¡Jugar!, el sonido sale dentro del toque, áreas, juegos, álbum
({ctx,p}=await abrir({sinSplash:true}));
chk('arranca con la pantalla de «¡Jugar!» tapando todo (el primer toque habilita el sonido)',await p.evaluate(()=>{const s=document.getElementById('splash'),r=s.getBoundingClientRect();return !s.hidden&&r.width>=innerWidth-1&&r.height>=innerHeight-1&&!!s.querySelector('#bJugar')}));
await p.click('#bJugar',{force:true});await p.waitForSelector('#pInicio:not([hidden])');await p.waitForTimeout(150);
const plays0=await p.evaluate(()=>window.__plays.slice());
chk('el primer sonido (el «Hola») sale DENTRO del toque de ¡Jugar! — así el iPhone y el iPad dejan sonar los siguientes ('+(plays0[0]?plays0[0].src:'ninguno')+')',plays0.length>=1&&plays0[0].enClic===true&&/^es_hola/.test(plays0[0].src),j(plays0));
const ini=await p.evaluate(()=>({splash:document.getElementById('splash').hidden,areas:[...document.querySelectorAll('.area')].map(a=>a.dataset.area+':'+a.innerText.replace(/\s+/g,' ').trim()),saludo:document.getElementById('saludo').textContent,peg:document.getElementById('nPeg').textContent}));
chk('el inicio tiene tres botones enormes (Lengua, Matemática, English), un saludo sin nombre y 0 figuritas',ini.splash&&ini.areas.length===3&&/lengua:.*Lengua/.test(ini.areas[0])&&/mates:.*Matem/.test(ini.areas[1])&&/ingles:.*English/.test(ini.areas[2])&&ini.saludo==='¡Hola!'&&ini.peg==='0',j(ini));
const cuentaTiles={};
for(const a of ['lengua','mates','ingles']){
  await p.click('.area[data-area="'+a+'"]');await p.waitForSelector('#pArea:not([hidden])');
  cuentaTiles[a]=await p.evaluate(()=>({tit:document.getElementById('aTitulo').textContent,ids:[...document.querySelectorAll('#tiles .tile')].map(t=>t.dataset.j)}));
  await p.click('#aAtras');await p.waitForSelector('#pInicio:not([hidden])');
}
chk('cada área abre sus juegos con «Sorpresa» primero: Lengua 6 (sin «Mi nombre» hasta que haya nombre), Matemática 10, English 13',cuentaTiles.lengua.ids[0]==='*'&&cuentaTiles.lengua.ids.length===1+6&&!cuentaTiles.lengua.ids.includes('l_nombre')&&cuentaTiles.mates.ids.length===1+10&&cuentaTiles.ingles.ids.length===1+13&&cuentaTiles.mates.tit==='Matemática'&&cuentaTiles.ingles.tit==='English',j(cuentaTiles));
const hab1=await hablados(p);
chk('al entrar a un área la voz dice cuál es (Lengua / Matemática / English)',await p.evaluate(()=>{const E=S5.C.ES;return [E.lengua,E.mates,E.ingles].every(k=>S5.hablados.includes(k))}),j(hab1.slice(0,8)));
await p.click('#bAlbum');await p.waitForSelector('#pAlbum:not([hidden])');
chk('el álbum muestra las 30 figuritas como «❔» y vuelve al inicio con ⬅',await p.evaluate(()=>document.querySelectorAll('#pegatinas .peg').length===30&&document.querySelectorAll('#pegatinas .peg.no').length===30));
await p.click('#gAtras');await p.waitForSelector('#pInicio:not([hidden])');
chk('sin errores de página en el recorrido',p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 5) una ronda de cada tipo de juego, todas bien: elegir, contar, canasta y armar el nombre
({ctx,p}=await abrir({estado:{nombre:'Sofi'}}));
await iniciar(p,'e_animals');await ronda(p,['bien','bien','bien','bien','bien']);
let st=await estado(p);
chk('una ronda de elegir (English · Animals) con 5 aciertos: premio con 5 estrellas, 1 figurita, el juego sube de nivel y queda anotada la ronda perfecta',await p.evaluate(()=>document.getElementById('premioEst').textContent==='⭐⭐⭐⭐⭐'&&/figurita/.test(document.getElementById('premioTit').textContent))&&st.peg.length===1&&st.rondas===1&&st.juegos.e_animals.nivel===2&&st.juegos.e_animals.perfectas===1&&st.juegos.e_animals.mejor===5,j(st));
await p.click('#premioSalir');await p.waitForSelector('#pArea:not([hidden])');
chk('🏠 del premio vuelve a la lista de juegos del área, y la figurita ya suma en el contador',await p.evaluate(()=>document.getElementById('aTitulo').textContent==='English'&&document.getElementById('aPeg').textContent==='1'));
// contar: tocar cada cosa la cuenta en voz alta
// (el juego sortea cuántas cosas hay, de 1 a 5: se vuelve a empezar hasta que haya al menos 3, para poder tocar tres)
for(let k=0;k<40;k++){await iniciar(p,'m_contar',1);await esperarPregunta(p);if(await p.evaluate(()=>document.querySelectorAll('#jEst .obj').length>=3))break}
const cont=await p.evaluate(async()=>{
  const objs=[...document.querySelectorAll('#jEst .obj')];const n=objs.length;
  objs[0].click();objs[1].click();objs[1].click();   // el segundo toque sobre la misma cosa no la cuenta de nuevo
  await new Promise(r=>setTimeout(r,80));
  const E=S5.C;return {n,contados:document.querySelectorAll('#jEst .obj.contado').length,badges:[...document.querySelectorAll('#jEst .cuenta')].map(x=>x.textContent),dicho:S5.hablados.filter(k=>k===E.numES(1)||k===E.numES(2)||k===E.numES(3))}});
chk('contar: tocar cada cosa la marca con su número y dice «uno, dos…» (y tocar la misma dos veces no la cuenta dos veces)',cont.contados===2&&cont.badges.join()==='1,2'&&cont.dicho.length>=2,j(cont));
await p.click('#jAtras');await p.waitForSelector('#pArea:not([hidden])');
await iniciar(p,'m_dame',1);
await ronda(p,['bien','bien','bien','bien','bien']);
st=await estado(p);
chk('canasta (Poné N en la canasta): 5 aciertos poniendo la cantidad justa y tocando ✔',st.juegos.m_dame&&st.juegos.m_dame.perfectas===1&&st.juegos.m_dame.mejor===5,j(st.juegos));
await p.click('#premioSalir');await p.waitForSelector('#pArea:not([hidden])');
await iniciar(p,'l_nombre');
await ronda(p,['bien','bien','bien'],'Sofi');
st=await estado(p);
chk('«Mi nombre»: se arma letra por letra con el nombre que cargaron los grandes; la ronda son 3 veces (no 5: repetir el mismo nombre cinco veces cansa) y da su figurita con 3 estrellas',st.juegos.l_nombre&&st.juegos.l_nombre.perfectas===1&&await p.evaluate(()=>document.getElementById('premioEst').textContent==='⭐⭐⭐'&&document.querySelectorAll('#jPuntos i').length===3),j(st.juegos));
chk('sin errores de página en las rondas',p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 6) equivocarse nunca traba: probá de nuevo → el bueno late → se lo muestra y sigue
({ctx,p}=await abrir());
await iniciar(p,'e_animals');await esperarPregunta(p);
await p.evaluate(()=>{window.__retry=S5.C.ES.retry});
await p.locator('#jOps .op:not([data-ok])').first().click({force:true});await p.waitForTimeout(300);
let e1=await p.evaluate(()=>({no:document.querySelectorAll('#jOps .op.no').length,pista:document.querySelectorAll('#jOps .op.pista').length,punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora')),dicho:S5.hablados.slice(-3),retry:window.__retry}));
chk('1ª equivocación: la opción se apaga y se sacude, la voz dice «Probá de nuevo» y sigue en la misma pregunta (todavía no marca la buena)',e1.no===1&&e1.pista===0&&e1.punto===0&&e1.dicho.includes(e1.retry),j(e1));
await p.locator('#jOps .op:not([data-ok]):not(.no)').first().click({force:true});await p.waitForTimeout(150);
e1=await p.evaluate(()=>({no:document.querySelectorAll('#jOps .op.no').length,pistaOk:!!document.querySelector('#jOps .op.pista[data-ok]'),punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora'))}));
chk('2ª equivocación: ahora la opción correcta late (pista) y sigue en la misma pregunta',e1.no===2&&e1.pistaOk&&e1.punto===0,j(e1));
await p.locator('#jOps .op.no').first().click({force:true});
await esperarPunto(p,1);
e1=await p.evaluate(()=>({punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora')),dicho:S5.hablados.slice(-12).includes(S5.C.ES.esEste)}));
chk('3ª equivocación: la app se lo muestra («¡Es este!») y pasa sola a la pregunta siguiente: nunca queda trabada',e1.punto===1&&e1.dicho,j(e1));
// una ronda donde falla de todas las formas: igual termina y da figurita (con menos estrellas)
await p.click('#jAtras');await p.waitForSelector('#pArea:not([hidden])');await iniciar(p,'e_animals');
await ronda(p,['mal1','mal3','bien','mal3','mal1']);
st=await estado(p);
chk('una ronda con errores (2 «mal1», 2 «mal3» y 1 bien) termina igual: 1 estrella, figurita y el juego NO sube de nivel',await p.evaluate(()=>document.getElementById('premioEst').textContent)==='⭐☆☆☆☆'&&st.peg.length===1&&st.juegos.e_animals.nivel===1&&st.juegos.e_animals.mejor===1,j(st));
// canasta: tocar ✔ sin nada en la canasta también es un error que se corrige
await p.click('#premioSalir');await p.waitForSelector('#pArea:not([hidden])');
await iniciar(p,'m_dame',1);await esperarPregunta(p);
await contestar(p,'mal');await p.waitForTimeout(300);
e1=await p.evaluate(()=>({punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora')),dicho:S5.hablados.includes(S5.C.ES.retry)}));
chk('canasta: tocar ✔ con la cantidad equivocada dice «Probá de nuevo» y deja seguir',e1.punto===0&&e1.dicho,j(e1));
await contestar(p,'mal');await contestar(p,'mal');await esperarPunto(p,1);
chk('canasta: a la 3ª equivocación se la arma y pasa a la siguiente',await p.evaluate(()=>[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora')))===1);
// armar el nombre: una letra equivocada se sacude y no traba
await p.click('#jAtras');await p.waitForSelector('#pArea:not([hidden])');
await p.evaluate(()=>{S5.estado().nombre='Sofi'});
await iniciar(p,'l_nombre');await esperarPregunta(p);
await contestar(p,'mal','Sofi');await contestar(p,'mal','Sofi');await p.waitForTimeout(100);
e1=await p.evaluate(()=>({puestas:document.querySelectorAll('#jEst .hueco-l.puesto').length,pista:document.querySelectorAll('#jEst .letra-f.pista').length}));
chk('nombre: dos letras equivocadas seguidas no ponen nada en los huecos y la letra que sigue empieza a latir',e1.puestas===0&&e1.pista===1,j(e1));
for(let k=0;k<4;k++)await contestar(p,'ok','Sofi');
await esperarPunto(p,1);
chk('nombre: con las letras en orden se completa y pasa a la pregunta siguiente',await punto(p)===1);
chk('sin errores de página con tantos errores',p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 7) volver a mitad de ronda, doble toque, nada se pisa
({ctx,p}=await abrir());
await iniciar(p,'e_colors');await esperarPregunta(p);
await p.evaluate(()=>{const o=document.querySelector('#jOps [data-ok]');o.click();o.click();o.click()});   // triple toque rápido en la buena
await esperarPunto(p,1);await p.waitForTimeout(250);
chk('tocar la respuesta buena varias veces seguidas cuenta UNA sola vez (pasa a la pregunta 2, no salta a la 3)',await punto(p)===1,String(await punto(p)));
await p.click('#jAtras');await p.waitForSelector('#pArea:not([hidden])');await p.waitForTimeout(500);
st=await estado(p);
chk('⬅ en medio de una ronda vuelve a la lista de juegos, sin premio ni figurita, y la voz se corta',await visible(p,'#pArea')&&!(await visible(p,'#premio'))&&st.peg.length===0&&st.rondas===0&&await p.evaluate(()=>document.querySelector('.mascota.habla')===null));
await iniciar(p,'e_colors');await esperarPregunta(p);
chk('empezar otra vez después de volver arranca de cero (pregunta 1 de 5)',await punto(p)===0&&p.errs.length===0,j(p.errs));
await p.evaluate(()=>{window.__plays.length=0});await p.click('#jRepetir');await p.waitForTimeout(200);
chk('🔊 repite la consigna de la pregunta que está en pantalla',await p.evaluate(()=>window.__plays.length>=1));
await ctx.close();

// ---------- 8) si no toca nada: repite la consigna y después marca la respuesta
({ctx,p}=await abrir({rapido:true}));
await iniciar(p,'e_animals');await esperarPregunta(p);
const clave=await p.evaluate(()=>S5.hablados.slice());
await p.waitForTimeout(900);
const quieto=await p.evaluate(()=>({dicho:S5.hablados.slice(),pista:document.querySelectorAll('#jOps .op.pista[data-ok]').length,punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora'))}));
await p.waitForTimeout(500);const despues=await p.evaluate(()=>S5.hablados.length);
chk('quieta: a los ~13 s repite la consigna y ~10 s después hace latir la respuesta correcta; no contesta por ella ni sigue repitiendo sin parar',quieto.dicho.length>clave.length&&quieto.dicho.slice(clave.length).includes(clave[0])&&quieto.pista===1&&quieto.punto===0&&despues===quieto.dicho.length,j([clave,quieto,despues]));
await ctx.close();

// ---------- 9) niveles que suben solos, figuritas y álbum lleno
({ctx,p}=await abrir());
await iniciar(p,'m_contar');await ronda(p,['bien','bien','mal1','bien','bien']);
st=await estado(p);
chk('4 de 5 sube de nivel (Contar: 1 → 2)',st.juegos.m_contar.nivel===2&&st.juegos.m_contar.perfectas===0&&st.juegos.m_contar.mejor===4,j(st.juegos));
await p.click('#premioOtra');await p.waitForFunction(()=>document.getElementById('premio').hidden);
chk('🔁 del premio arranca otra ronda del mismo juego (pregunta 1) y esconde el premio',await punto(p)===0&&await visible(p,'#pJuego'));
await ronda(p,['bien','mal1','mal1','bien','mal1']);
st=await estado(p);
chk('con 2 de 5 NO sube de nivel (sigue en 2) y la ronda suma igual',st.juegos.m_contar.nivel===2&&st.juegos.m_contar.rondas===2&&st.rondas===2&&st.peg.length===2,j(st));
await p.click('#premioOtra');await ronda(p,['bien','bien','bien','bien','bien']);
st=await estado(p);
chk('5 de 5 en el nivel 2 sube al 3 (el tope de Contar) y no pasa de ahí aunque siga acertando',st.juegos.m_contar.nivel===3,j(st.juegos));
await p.click('#premioOtra');await ronda(p,['bien','bien','bien','bien','bien']);
st=await estado(p);
chk('en el nivel más alto sigue en 3 (no se pasa) y las figuritas son todas distintas ('+st.peg.length+')',st.juegos.m_contar.nivel===3&&st.peg.length===4&&new Set(st.peg).size===4,j(st));
await p.click('#premioSalir');await p.waitForSelector('#pArea:not([hidden])');
await p.click('#aAlbum');await p.waitForSelector('#pAlbum:not([hidden])');
chk('el álbum muestra las 4 figuritas ganadas y 26 por ganar; ⬅ vuelve al área de donde vino',await p.evaluate(()=>document.querySelectorAll('#pegatinas .peg:not(.no)').length===4&&document.querySelectorAll('#pegatinas .peg.no').length===26&&document.getElementById('gPeg').textContent==='4'));
await p.click('#gAtras');await p.waitForSelector('#pArea:not([hidden])');
await ctx.close();
({ctx,p}=await abrir({estado:{peg:Array.from({length:30},(_,i)=>i),juegos:{e_animals:{nivel:2,rondas:3,perfectas:1,mejor:5}}}}));
await iniciar(p,'e_animals');await ronda(p,['bien','bien','bien','bien','bien']);
chk('con el álbum lleno el premio dice «¡Completaste el álbum!» con un trofeo y no repite ni rompe nada',await p.evaluate(()=>/álbum/.test(document.getElementById('premioTit').textContent)&&document.getElementById('premioPeg').textContent==='🏆')&&(await estado(p)).peg.length===30&&p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 10) el panel para grandes: se abre apretando el ⚙️ 1,4 s
({ctx,p}=await abrir());
const bp=await p.locator('#bPadres').boundingBox();
await p.mouse.move(bp.x+bp.width/2,bp.y+bp.height/2);await p.mouse.down();await p.waitForTimeout(300);
const apretando=await p.evaluate(()=>document.getElementById('bPadres').classList.contains('apretando'));
await p.mouse.up();await p.waitForTimeout(1300);
chk('un toque corto en el ⚙️ NO abre el panel de los grandes (mientras se aprieta muestra el aro que se llena)',apretando&&!(await visible(p,'#padres')));
await p.mouse.move(bp.x+bp.width/2,bp.y+bp.height/2);await p.mouse.down();await p.waitForTimeout(1700);await p.mouse.up();
chk('apretarlo 1,4 s lo abre',await visible(p,'#padres'));
await p.fill('#pNombre','  Sofía 123!! ');await p.click('#pCerrar');
st=await estado(p);
chk('el nombre se limpia (sin números ni signos, sin espacios de más) y el saludo lo usa: «¡Hola, Sofía!»',st.nombre==='Sofía'&&await p.evaluate(()=>document.getElementById('saludo').textContent==='¡Hola, Sofía!'),j(st.nombre));
await p.click('.area[data-area="lengua"]');await p.waitForSelector('#pArea:not([hidden])');
chk('con nombre aparece «Mi nombre» en Lengua (y se arma con las letras SOFIA, sin acento)',await p.evaluate(()=>!!document.querySelector('#tiles [data-j="l_nombre"]')&&S5.gen('l_nombre').letras.join('')==='SOFIA'));
await p.click('#aAtras');
await p.evaluate(()=>{S5.estado().nombre='Ñandú'});
chk('un nombre con Ñ conserva la Ñ (ÑANDU)',await p.evaluate(()=>S5.gen('l_nombre').letras.join('')==='ÑANDU'));
await ctx.close();
({ctx,p}=await abrir({estado:{nombre:'A'}}));
await p.click('.area[data-area="lengua"]');await p.waitForSelector('#pArea:not([hidden])');
chk('con una sola letra de nombre «Mi nombre» queda escondido (no se puede armar un nombre de una letra)',await p.evaluate(()=>!document.querySelector('#tiles [data-j="l_nombre"]')));
await ctx.close();
// con el dedo de verdad: pantalla táctil (iPhone, Android y iPad emulados): los toques, responder y mantener apretado el ⚙️ con un dedo
for(const dev of ['iPhone 13','Pixel 7','iPad (gen 7)']){
  ({ctx,p}=await abrir({dispositivo:dev}));
  await p.tap('.area[data-area="mates"]',{force:true});await p.waitForSelector('#pArea:not([hidden])');
  await p.tap('#tiles [data-j="m_contar"]',{force:true});await p.waitForSelector('#jOps button');
  const rr=await p.evaluate(()=>document.querySelector('#jOps [data-ok]').getBoundingClientRect().toJSON());
  await p.touchscreen.tap(rr.x+rr.width/2,rr.y+rr.height/2);await esperarPunto(p,1);
  await p.tap('#jAtras',{force:true});await p.waitForSelector('#pArea:not([hidden])');await p.tap('#aAtras',{force:true});await p.waitForSelector('#pInicio:not([hidden])');
  const cdp=await ctx.newCDPSession(p),bb=await p.locator('#bPadres').boundingBox(),dx=bb.x+bb.width/2,dy=bb.y+bb.height/2;
  await p.tap('#bPadres',{force:true});await p.waitForTimeout(1700);const tocoCorto=await visible(p,'#padres');
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:dx,y:dy}]});await p.waitForTimeout(500);
  const aro=await p.evaluate(()=>document.getElementById('bPadres').classList.contains('apretando'));
  await p.waitForTimeout(1200);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.waitForTimeout(300);
  chk('con el dedo ('+dev+'): los toques andan (área, juego, respuesta, volver), un toque corto en el ⚙️ no abre nada y mantenerlo apretado con un dedo muestra el aro y abre el panel de los grandes',!tocoCorto&&aro&&await visible(p,'#padres')&&p.errs.length===0,j([tocoCorto,aro,p.errs]));
  await ctx.close();
}
// ajustes: sonido, dificultad, minúsculas, borrar en dos toques, persistencia
({ctx,p}=await abrir({estado:{nombre:'Sofía',peg:[0,1,2],rondas:3,juegos:{e_animals:{nivel:2,rondas:3,perfectas:0,mejor:4}}}}));
const abrirPadres=async()=>{const r=await p.locator('#bPadres').boundingBox();await p.mouse.move(r.x+r.width/2,r.y+r.height/2);await p.mouse.down();await p.waitForTimeout(1700);await p.mouse.up();await p.waitForSelector('#padres:not([hidden])')};
await abrirPadres();
const campos=await p.evaluate(()=>({nombre:document.getElementById('pNombre').value,voz:document.getElementById('pVoz').checked,dif:document.getElementById('pDif').value,min:document.getElementById('pMin').checked,volver:document.querySelector('#padres a').getAttribute('href')}));
chk('el panel muestra lo guardado (nombre, sonido encendido, dificultad fácil) y tiene el enlace para volver al inicio del sitio',campos.nombre==='Sofía'&&campos.voz&&campos.dif==='0'&&!campos.min&&campos.volver==='../',j(campos));
await p.uncheck('#pVoz');await p.selectOption('#pDif','1');await p.check('#pMin');await p.click('#pCerrar');
await p.evaluate(()=>{window.__plays.length=0});
await iniciar(p,'e_colors');await esperarPregunta(p);await contestar(p,'ok');await p.waitForTimeout(400);
const mudo=await p.evaluate(()=>({plays:window.__plays.length,voz:window.__voz.length,hablo:S5.hablados.length}));
chk('con el sonido apagado no suena nada (ni mp3 ni voz del aparato) y el juego sigue andando igual',mudo.plays===0&&mudo.voz===0&&mudo.hablo>=1,j(mudo));
await p.click('#jAtras');
chk('«dificultad: un poco más difícil» arranca los juegos nuevos en el nivel 2 (y los que ya tenían nivel lo conservan)',await p.evaluate(()=>S5.nivelDe(S5.juegos.find(g=>g.id==='e_colors'))===2&&S5.nivelDe(S5.juegos.find(g=>g.id==='l_nombre'))===1&&S5.nivelDe(S5.juegos.find(g=>g.id==='e_animals'))===2));
await p.reload();await p.waitForSelector('#bJugar');
st=await estado(p);
chk('lo elegido sobrevive a cerrar y abrir la página (sonido, dificultad y minúsculas)',st.voz===false&&st.dif===1&&st.min===true&&st.nombre==='Sofía'&&st.peg.length===3,j(st));
await p.click('#bJugar',{force:true});await p.waitForSelector('#pInicio:not([hidden])');
await abrirPadres();
await p.click('#pBorrar');
st=await estado(p);
const txt1=await p.evaluate(()=>document.getElementById('pBorrar').textContent);
chk('«Borrar figuritas y avances» pide confirmar con un segundo toque y NO borra con el primero',/Seguro/.test(txt1)&&st.peg.length===3&&Object.keys(st.juegos).length>=1,txt1);
await p.click('#pBorrar');st=await estado(p);
chk('un doble toque apurado sobre «Borrar» no borra nada (el segundo toque tiene que esperar un momento)',st.peg.length===3&&Object.keys(st.juegos).length>=1,j(st));
await p.waitForTimeout(1300);await p.click('#pBorrar');st=await estado(p);
chk('con el segundo toque (después de un momento) borra figuritas, avances y rondas, pero deja el nombre y los ajustes',st.peg.length===0&&Object.keys(st.juegos).length===0&&st.rondas===0&&st.nombre==='Sofía'&&st.dif===1&&await p.evaluate(()=>document.getElementById('nPeg').textContent==='0'),j(st));
await p.click('#pCerrar');
chk('sin errores de página con el panel',p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 11) lo guardado roto no rompe nada; sin almacenamiento también anda
const rotos=[['no es JSON','{esto no es json'],['nulo','null'],['un número','7'],['una lista','[1,2,3]'],
  ['campos de otro tipo',{nombre:12345,voz:'si',dif:'x',min:'no',juegos:[1,2],peg:'hola',rondas:'muchas'}],
  ['figuritas inventadas',{peg:[0,1,99,-1,'x',null,1.5,1,2],juegos:{e_animals:{nivel:99,rondas:-4,perfectas:'a',mejor:77},m_contar:null,otro:5}}],
  ['nombre con etiquetas',{nombre:'<img src=x onerror=alert(1)>Sofi'}]];
for(const [nom,v] of rotos){
  ({ctx,p}=await abrir({estado:v}));
  const r=await p.evaluate(()=>{const s=S5.estado();return {nombre:s.nombre,peg:s.peg,niv:s.juegos.e_animals&&s.juegos.e_animals.nivel,tipos:[typeof s.voz,typeof s.dif,typeof s.min,typeof s.rondas]}});
  await p.click('.area[data-area="lengua"]');await p.waitForSelector('#pArea:not([hidden])');await p.click('#aAtras');
  await iniciar(p,'e_colors');await esperarPregunta(p);await contestar(p,'ok');await p.waitForTimeout(150);
  const bien=r.tipos.join()==='boolean,number,boolean,number'&&typeof r.nombre==='string'&&r.peg.every((i,k,a)=>Number.isInteger(i)&&i>=0&&i<30&&a.indexOf(i)===k)&&(r.niv===undefined||(r.niv>=1&&r.niv<=3));
  chk('guardado roto («'+nom+'»): la página abre, el estado queda limpio y se puede jugar',bien&&!/[<>=]/.test(r.nombre)&&p.errs.length===0,j([r,p.errs]));
  await ctx.close();
}
({ctx,p}=await abrir({storageRoto:true}));
await iniciar(p,'e_colors');await ronda(p,['bien','bien','bien','bien','bien']);
chk('con el almacenamiento del navegador bloqueado (modo privado) igual se puede jugar una ronda entera y ver el premio',await visible(p,'#premio')&&p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 12) privacidad y sin internet
({ctx,p}=await abrir({estado:{nombre:'Sofi'}}));
for(const a of ['lengua','mates','ingles']){await p.click('.area[data-area="'+a+'"]');await p.waitForSelector('#pArea:not([hidden])');await p.click('#aAtras')}
await iniciar(p,'m_sumar');await esperarPregunta(p);await contestar(p,'ok');await p.waitForTimeout(300);
const ajenos=p.pedidos.filter(r=>!/^(data:|blob:)/.test(r.u)&&!r.u.startsWith(ORIGEN_PROPIO)&&!/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(r.u));
chk('no se comunica con ningún sitio (sólo sus propios archivos y las fuentes de Google): nada de estadísticas ni de enviar el nombre ni los avances',ajenos.length===0&&p.pedidos.every(r=>r.m==='GET'),j(ajenos.slice(0,5)));
chk('anda aunque las fuentes de Google no carguen (acá se bloquearon): sin errores',p.errs.length===0,j(p.errs));
await ctx.close();
({ctx,p}=await abrir({audioRoto:true}));
await p.waitForTimeout(300);
const oidos=await p.evaluate(()=>window.__voz.slice());
chk('si un mp3 no baja (sin internet la primera vez) habla el aparato con su voz en español de Argentina y nada se traba ('+(oidos[0]?'«'+oidos[0].texto+'» '+oidos[0].lang:'nada')+')',oidos.length>=1&&/Hola/.test(oidos[0].texto)&&oidos[0].lang==='es-AR',j(oidos));
await iniciar(p,'e_animals');await esperarPregunta(p);await p.waitForTimeout(300);
chk('y en inglés con voz británica (en-GB) cuando es una frase en inglés',await p.evaluate(()=>window.__voz.some(v=>/^Touch the /.test(v.texto)&&v.lang==='en-GB')),j(await p.evaluate(()=>window.__voz.slice(-3))));
chk('sin errores de página con los audios caídos',p.errs.length===0,j(p.errs));
await ctx.close();

// ---------- 12b) la voz: una frase nueva corta la anterior y nunca queda nada colgado esperando
({ctx,p}=await abrir({audioLento:400,sinSplash:true}));
await p.click('#bJugar',{force:true});await p.waitForSelector('#pInicio:not([hidden])');
const v=await p.evaluate(async()=>{
  const V=S5.voz,K=S5_AUDIO.filter(k=>/^es_n\d$/.test(k)).slice(0,6),tarda=(pr,ms)=>Promise.race([pr,new Promise(r=>setTimeout(()=>r('colgado'),ms))]);
  V.parar();await new Promise(r=>setTimeout(r,50));window.__plays.length=0;
  const t0=performance.now();
  const p1=V.decir([K[0],K[1],K[2]]);
  await new Promise(r=>setTimeout(r,100));
  const p2=V.decir([K[3]]);                       // se toca algo mientras todavía habla
  const r1=await tarda(p1,1500),t1=Math.round(performance.now()-t0);
  const r2=await tarda(p2,3000),t2=Math.round(performance.now()-t0);
  const r3=await tarda(V.decir([K[4],K[5]]),4000),t3=Math.round(performance.now()-t0);
  return {r1,t1,r2,t2,r3,t3,sono:window.__plays.map(x=>x.src.replace('.mp3','')),K};
});
chk('tocar mientras todavía habla: la frase vieja se corta de inmediato (no queda esperando 9 segundos) y la nueva suena entera ('+v.t1+' ms y '+v.t2+' ms)',v.r1===false&&v.t1<400&&v.r2===true&&v.t2<900,j(v));
chk('de la frase cortada no suenan las palabras que le faltaban, y la voz sigue andando después (frases de a una y de a dos)',!v.sono.includes(v.K[1])&&!v.sono.includes(v.K[2])&&v.sono.includes(v.K[3])&&v.sono.includes(v.K[4])&&v.sono.includes(v.K[5])&&v.r3===true&&v.t3<2600,j(v));
// ráfaga de toques (contar rápido): ninguna espera queda colgada y lo último que se pidió es lo que suena
const rafaga=await p.evaluate(async()=>{
  const V=S5.voz,K=S5_AUDIO.filter(k=>/^es_n\d+$/.test(k)).slice(0,8);window.__plays.length=0;
  const ps=K.map((k,i)=>new Promise(r=>setTimeout(()=>r(V.decir(k)),i*40)));
  const todas=Promise.all(ps.map(x=>x.then(y=>y)));
  const fin=await Promise.race([todas,new Promise(r=>setTimeout(()=>r('colgado'),2500))]);
  return {fin:Array.isArray(fin)?fin.map(x=>x):fin,ultimo:window.__plays[window.__plays.length-1].src.replace('.mp3',''),esperado:K[K.length-1]};
});
chk('8 toques seguidos (contar rápido) no dejan nada colgado: la última frase pedida es la que termina sonando',Array.isArray(rafaga.fin)&&rafaga.fin.filter(x=>x===true).length===1&&rafaga.ultimo===rafaga.esperado,j(rafaga));
chk('sin errores de página con la voz',p.errs.length===0,j(p.errs));
await ctx.close();
// si el mp3 no baja, habla el aparato y se ESPERA a que termine cada frase (antes la promesa rechazada del audio la daba por terminada enseguida)
({ctx,p}=await abrir({audioRoto:true,vozLenta:200,sinSplash:true}));
await p.click('#bJugar',{force:true});await p.waitForSelector('#pInicio:not([hidden])');await p.waitForTimeout(500);
const loc=await p.evaluate(async()=>{const K=S5_AUDIO.filter(k=>/^es_n\d$/.test(k)).slice(0,2);S5.voz.parar();await new Promise(r=>setTimeout(r,60));window.__voz.length=0;
  const t0=performance.now();const r=await S5.voz.decir(K);return {r,ms:Math.round(performance.now()-t0),dijo:window.__voz.map(x=>x.texto)}});
chk('con el audio caído, dos frases seguidas se dicen con la voz del aparato una después de la otra (≈2×200 ms), sin amontonarse',loc.r===true&&loc.dijo.length===2&&loc.ms>=380,j(loc));
await ctx.close();

// ---------- 12c) lo que halló la revisión independiente: doble toque, ayudas, álbum, ABC, letras que suenan igual, dibujos que se confunden, subtítulo…
// (a) el doble toque: el segundo toque justo después de cambiar de pantalla no cae sobre lo que apareció debajo
({ctx,p}=await abrir({conBloqueo:true,sinSplash:true}));
await p.dblclick('#bJugar',{force:true,delay:30});await p.waitForTimeout(120);
chk('doble toque en «¡Jugar!»: entra al inicio y el segundo toque no abre ningún área',await visible(p,'#pInicio')&&!(await visible(p,'#pArea'))&&!(await visible(p,'#pJuego')));
await p.waitForTimeout(450);
await p.click('.area[data-area="mates"]');await p.waitForSelector('#pArea:not([hidden])');await p.waitForTimeout(450);
await p.click('#tiles [data-j="m_contar"]');await p.click('#jOps [data-ok]',{force:true});   // un toque apurado justo sobre lo que apareció
chk('un toque apurado justo después de abrir un juego se ignora (no contesta la 1ª pregunta por la nena)',await p.evaluate(()=>!document.querySelector('#jOps .si,#jOps .no'))&&await punto(p)===0);
await p.waitForTimeout(450);await p.click('#jOps [data-ok]',{force:true});
chk('pasado un instante, los toques andan normal',await p.evaluate(()=>!!document.querySelector('#jOps .si')));
await p.evaluate(()=>{window.S5_SIN_BLOQUEO=true});await ronda(p,['bien','bien','bien','bien','bien']).catch(()=>{});
await p.evaluate(()=>{window.S5_SIN_BLOQUEO=false});
if(!(await visible(p,'#premio')))await p.waitForSelector('#premio:not([hidden])',{timeout:12000});
await p.click('#premioOtra');await p.waitForTimeout(100);
chk('un toque apurado sobre el premio (la nena sigue tocando de la emoción) no lo cierra ni arranca otra ronda',await visible(p,'#premio'));
await p.waitForTimeout(800);await p.click('#premioOtra');await p.waitForFunction(()=>document.getElementById('premio').hidden);
chk('pasado un momento, 🔁 del premio anda',await visible(p,'#pJuego'));
await ctx.close();
// (b) el ⬅ del álbum vuelve al área desde la que se abrió, no al área del último juego
({ctx,p}=await abrir());
await iniciar(p,'e_colors');await esperarPregunta(p);await p.click('#jAtras');await p.waitForSelector('#pArea:not([hidden])');await p.click('#aAtras');await p.waitForSelector('#pInicio:not([hidden])');
await p.click('.area[data-area="mates"]');await p.waitForSelector('#pArea:not([hidden])');await p.click('#aAlbum');await p.waitForSelector('#pAlbum:not([hidden])');await p.click('#gAtras');await p.waitForSelector('#pArea:not([hidden])');
chk('⬅ del álbum vuelve al área desde la que se abrió (Matemática), no al área del último juego jugado (English)',await p.evaluate(()=>document.getElementById('aTitulo').textContent==='Matemática'));
await p.click('#aAtras');await p.waitForSelector('#pInicio:not([hidden])');await p.click('#bAlbum');await p.waitForSelector('#pAlbum:not([hidden])');await p.click('#gAtras');
chk('y el del álbum abierto desde el inicio vuelve al inicio',await visible(p,'#pInicio'));
// (c) English · ABC llega a las 26 letras; (d) letras que suenan igual; (e) dibujos que se confunden; (f) subtítulo; contenido nuevo
const rev=await p.evaluate(()=>{
  const out={},C=S5.C,juego=id=>S5.juegos.find(x=>x.id===id);
  const abc=juego('e_abc'),vistas=new Set();for(let i=0;i<1500;i++){vistas.add(abc.gen(3).opciones.find(o=>o.ok).aria)}
  out.abc={niv:abc.niv,n:vistas.size,faltan:'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(l=>!vistas.has(l))};
  const ini=juego('l_inicial'),mal=[];for(let n=1;n<=3;n++)for(let i=0;i<1500;i++){const q=ini.gen(n),ok=q.opciones.find(o=>o.ok).aria.replace('letra ','');q.opciones.forEach(o=>{const L=o.aria.replace('letra ','');if(L!==ok&&(C.SUENAN_IGUAL[ok]||'').includes(L))mal.push(ok+'/'+L)})}
  out.suenan=[...new Set(mal)];
  const amb=[],pares=[['flor','rosa'],['flor','girasol'],['boca','beso'],['uno','dedo'],['mano','dedo'],['iguana','dinosaurio']];
  // (un par que se confunde sólo es problema si uno de los dos ES la respuesta: con «fish» de respuesta, pájaro y pato juntos no molestan)
  const choca=(q,lista)=>{const ok=q.opciones.find(o=>o.ok).aria,otros=q.opciones.filter(o=>!o.ok).map(o=>o.aria);return lista.some(([a,b])=>(ok===a&&otros.includes(b))||(ok===b&&otros.includes(a)))};
  for(let n=1;n<=2;n++)for(let i=0;i<1500;i++){
    for(const id of ['e_animals','e_body']){const q=juego(id).gen(n);if(choca(q,[['bird','duck'],['foot','leg']]))amb.push(id+': '+q.opciones.map(o=>o.aria).join()+' → '+q.opciones.find(o=>o.ok).aria)}
    const q=juego('l_palabra').gen(n);if(choca(q,pares))amb.push('palabras: '+q.opciones.map(o=>o.aria).join()+' → '+q.opciones.find(o=>o.ok).aria)}
  out.amb=[...new Set(amb)].slice(0,4);
  out.pal=['fresa','escalera','silla','jugo','rojo','llama'].filter(x=>C.PALBY[x]).concat(C.PALBY.frutilla?[]:['falta frutilla']);
  out.packs=C.PACKS.map(k=>k.tit).join(',');
  const ap=document.createElement('div');return out});
chk('English · ABC tiene 3 niveles y en el último salen las 26 letras (Q a Z también)',rev.abc.niv===3&&rev.abc.n===26,j(rev.abc));
chk('«¿Con qué letra empieza?» nunca ofrece una letra que suena igual a la correcta (B/V, S/Z, C/Q, G/J, y las vocales con la H muda)',rev.suenan.length===0,j(rev.suenan));
chk('los dibujos que se confunden no aparecen juntos como opciones (pájaro/pato, pie/pierna, flor/rosa/girasol, boca/beso, uno/dedo, mano/dedo, iguana/dinosaurio)',rev.amb.length===0,j(rev.amb));
chk('se dice «frutilla» (no «fresa»), y no quedan palabras con dibujos que se confunden o son muy nuevos (escalera, silla, jugo, rojo, llama); el tema de colores se llama «Colours» como la voz británica',rev.pal.length===0&&/Colours/.test(rev.packs)&&!/Colors/.test(rev.packs),j(rev));
for(const [id,esperado] of [['l_leer',/^Tocá la palabra …$/],['l_inicial',/^… ¿Con qué letra empieza\?$/]]){
  await iniciar(p,id,id==='l_leer'?1:1);await esperarPregunta(p);
  const t=await p.evaluate(()=>document.getElementById('jTexto').textContent);
  chk('el subtítulo de «'+id+'» no imprime la palabra (sería la respuesta para quien ya conoce algunas letras): «'+t+'»',esperado.test(t),t);
}
const fig=await p.evaluate(()=>{const textos=[document.body.textContent].concat([...document.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')),S5.frases().map(x=>x.tts));return textos.filter(t=>/pegatina/i.test(t)).length});
chk('la app dice «figurita» (como se dice acá) y no «pegatina» (de España) en ningún texto ni frase hablada',fig===0,String(fig));
await ctx.close();
// (g) «Poné N»: con la cantidad justa el ✔ late solo; si no toca nada, la canasta marca dónde va
({ctx,p}=await abrir({rapido:20}));
await iniciar(p,'m_dame',1);await esperarPregunta(p);
const c1=await p.evaluate(()=>{const est=document.getElementById('jEst'),n=+est.querySelector('.canasta-meta').textContent;[...est.querySelectorAll('.pila .ficha')].slice(0,n).forEach(f=>f.click());
  const listo=document.querySelector('#jOps .listo'),late=listo.classList.contains('pista'),anim=getComputedStyle(listo).animationName;
  est.querySelector('.canasta .ficha').click();return {n,late,anim,apagado:!listo.classList.contains('pista')}});
chk('«Poné N»: con la cantidad justa el ✔ late solo (y deja de latir si se saca una)',c1.late&&c1.anim==='late'&&c1.apagado,j(c1));
await p.waitForTimeout(1500);
const c2=await p.evaluate(()=>({canasta:document.querySelector('#jEst .canasta').classList.contains('pista'),punto:[...document.querySelectorAll('#jPuntos i')].findIndex(i=>i.classList.contains('ahora'))}));
chk('«Poné N»: si no toca nada con la cantidad equivocada, la canasta late para marcar dónde van las cosas (antes no se marcaba nada y esperaba para siempre)',c2.canasta&&c2.punto===0,j(c2));
await ctx.close();
// (h) «Mi nombre»: la letra que sigue late de verdad y a la 3ª equivocación seguida se la pone solo
({ctx,p}=await abrir({estado:{nombre:'Sofi'}}));
await iniciar(p,'l_nombre');await esperarPregunta(p);
await contestar(p,'mal','Sofi');await contestar(p,'mal','Sofi');
const anim=await p.evaluate(()=>{const f=document.querySelector('#jEst .letra-f.pista');return f?getComputedStyle(f).animationName:null});
await contestar(p,'mal','Sofi');await p.waitForTimeout(250);
const r3=await p.evaluate(()=>({puestas:document.querySelectorAll('#jEst .hueco-l.puesto').length,dijo:S5.hablados.includes(S5.C.ES.esEste)}));
chk('«Mi nombre»: la letra que sigue late de verdad (tiene estilo) y a la 3ª equivocación seguida la app se la pone sola: no hay que adivinar fichas mucho rato',anim==='late'&&r3.puestas===1&&r3.dijo,j([anim,r3]));
await ctx.close();
// (i) la espera de «no toca nada» se rearma con cada toque de contar; (j) en segundo plano no se repite la consigna
({ctx,p}=await abrir({rapido:20}));
for(let k=0;k<40;k++){await iniciar(p,'m_contar',1);await esperarPregunta(p);if(await p.evaluate(()=>document.querySelectorAll('#jEst .obj').length>=3))break}
const cuentaConsigna=()=>p.evaluate(()=>S5.hablados.filter(k=>k===S5.C.ES.cuantos).length);
const cAntes=await cuentaConsigna();
for(let i=0;i<3;i++){await p.evaluate(i=>document.querySelectorAll('#jEst .obj')[i].click(),i);await p.waitForTimeout(100)}
const cDurante=await cuentaConsigna(),pistaYa=await p.evaluate(()=>document.querySelectorAll('#jOps .op.pista').length);
await p.waitForTimeout(1000);const cDespues=await cuentaConsigna();
chk('contar: mientras toca las cosas no se repite la consigna ni se marca la respuesta (la espera se rearma con cada toque); si se queda quieta, sí',cDurante===cAntes&&pistaYa===0&&cDespues>cAntes,j([cAntes,cDurante,cDespues,pistaYa]));
await ctx.close();
({ctx,p}=await abrir({rapido:20}));
await iniciar(p,'e_animals');await esperarPregunta(p);
const h0=await p.evaluate(()=>S5.hablados.length);
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:true,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(1000);const h1=await p.evaluate(()=>({n:S5.hablados.length,pista:document.querySelectorAll('#jOps .pista').length}));
await p.evaluate(()=>{Object.defineProperty(document,'hidden',{value:false,configurable:true});document.dispatchEvent(new Event('visibilitychange'))});
await p.waitForTimeout(1000);const h2=await p.evaluate(()=>S5.hablados.length);
chk('con la página en segundo plano no se repite la consigna ni se marca nada; al volver se rearma la espera',h1.n===h0&&h1.pista===0&&h2>h1.n,j([h0,h1,h2]));
await ctx.close();
// (k) «vh» de verdad y el campo del nombre
({ctx,p}=await abrir());
const v1=await p.evaluate(()=>({v:getComputedStyle(document.documentElement).getPropertyValue('--vh').trim(),h:innerHeight,sel:getComputedStyle(document.getElementById('pNombre')).userSelect}));
await p.setViewportSize({width:390,height:600});await p.waitForTimeout(150);
const v2=await p.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--vh').trim());
chk('«vh» se mide con el alto que se ve (--vh) y se actualiza al cambiar el tamaño de la pantalla (en Safari 100vh es más alto que lo que se ve: las opciones quedaban cortadas)',v1.v===(v1.h/100)+'px'&&v2==='6px',j([v1,v2]));
chk('el campo del nombre admite texto aunque el resto de la pantalla no deje seleccionar (con «user-select:none» heredado, en Safari no se podía escribir)',v1.sel==='text',v1.sel);
await ctx.close();
// (l) nada de emoji de Unicode 12 o más nuevos en las listas (no existen en aparatos de 2018–2019 y salen como cuadrados vacíos)
const fuente=['contenido.js','juego.js','index.html'].map(f=>fs.readFileSync(path.join(RAIZ,'sala5',f),'utf8')).join('\n');
const nuevos=['🪜','🪑','🧃','🪁','🟠','🟡','🟢','🟣','🟤'].filter(e=>fuente.includes(e));
chk('ninguna lista usa emoji de Unicode 12 o más nuevo (🪜 🪑 🧃 🪁 🟠🟡🟢🟣): en aparatos de antes de 2019 salen como cuadrados vacíos',nuevos.length===0,nuevos.join(' '));

// ---------- 13) DISEÑO: cinco tamaños de pantalla × todos los juegos × todos los niveles
const TAMANOS=[[360,640,'celular chico'],[390,844,'celular'],[768,1024,'tablet vertical'],[1024,768,'tablet horizontal'],[844,390,'celular de costado']];
for(const [w,h,nom] of TAMANOS){
  ({ctx,p}=await abrir({vp:{width:w,height:h},estado:{nombre:'Sofía'}}));
  const rr=await p.evaluate(async()=>{
    const out=[],W=innerWidth,H=innerHeight,S=window.S5;
    const caja=e=>{const r=e.getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}};
    const fuera=r=>r.l<-1||r.t<-1||r.r>W+1||r.b>H+1;
    const espera=ms=>new Promise(r=>setTimeout(r,ms));
    // inicio y áreas
    const pantalla=async(id,nom)=>{const prob=[];const doc=document.documentElement;
      if(doc.scrollWidth>W+1)prob.push('scroll horizontal');
      document.querySelectorAll('#'+id+' button').forEach(b=>{const r=caja(b);if(r.w>0&&(r.l<-1||r.r>W+1))prob.push('fuera a los costados: '+(b.className||b.id));if(r.w>0&&r.h>0&&(r.w<44||r.h<44)&&!b.closest('.tiles'))prob.push('toque chico '+(b.className||b.id)+' '+Math.round(r.w)+'x'+Math.round(r.h))});
      if(prob.length)out.push({nom,prob:[...new Set(prob)]})};
    await pantalla('pInicio','inicio');
    for(const a of ['lengua','mates','ingles']){document.querySelector('.area[data-area="'+a+'"]').click();await espera(30);await pantalla('pArea','área '+a);
      document.querySelectorAll('#tiles .tile').forEach(t=>{const r=caja(t);if(r.w<80||r.h<80)out.push({nom:'tile '+a,prob:['tile chico '+Math.round(r.w)+'x'+Math.round(r.h)]})});
      document.getElementById('aAtras').click();await espera(20)}
    // todos los juegos, todos los niveles, 3 sorteos
    for(const g of S.juegos){for(let niv=1;niv<=g.niv;niv++){for(let k=0;k<3;k++){
      S.estado().juegos[g.id]={nivel:niv,rondas:0,perfectas:0,mejor:0};S.jugar(g.id);await espera(25);
      const prob=[],doc=document.documentElement;
      if(doc.scrollWidth>W+1)prob.push('scroll horizontal '+doc.scrollWidth+'>'+W);
      if(doc.scrollHeight>H+1)prob.push('scroll vertical '+doc.scrollHeight+'>'+H);
      const est=document.getElementById('jEst'),ops=document.getElementById('jOps'),re=caja(est),ro=caja(ops);
      const toc=[...document.querySelectorAll('#pJuego button')];
      toc.forEach(e=>{const r=caja(e);if(r.w>0&&fuera(r))prob.push('fuera de pantalla: '+(e.className||e.id));if(r.w>0&&!e.closest('.barra')&&(r.w<40||r.h<40))prob.push('toque chico '+(e.className||'?')+' '+Math.round(r.w)+'x'+Math.round(r.h))});
      if(est.scrollWidth>est.clientWidth+2&&est.clientWidth>0)prob.push('lo de arriba desborda a lo ancho');
      [...est.querySelectorAll('*')].forEach(e=>{const r=caja(e);if(r.w>0&&(r.b>re.b+3||r.t<re.t-3||r.r>re.r+3||r.l<re.l-3))prob.push('algo de arriba se sale de su lugar: '+e.className)});
      if(est.children.length&&ops.children.length&&!(re.r<=ro.l+1||re.l>=ro.r-1||re.b<=ro.t+1||re.t>=ro.b-1))prob.push('lo de arriba y las opciones se pisan');
      [...document.querySelectorAll('#jOps .op')].forEach(o=>{const ro=caja(o);[...o.children].forEach(c=>{const rc=caja(c);if(rc.w>0&&(rc.l<ro.l+5||rc.r>ro.r-5||rc.t<ro.t+4||rc.b>ro.b-4))prob.push('lo de adentro de una opción toca el borde: '+c.className)})});
      const cajas=[...est.querySelectorAll('.seq .caja')];if(cajas.length){if(new Set(cajas.map(c=>Math.round(caja(c).t))).size!==1)prob.push('la secuencia no entra en una sola fila');cajas.forEach(c=>{if(c.scrollWidth>c.clientWidth+1||c.scrollHeight>c.clientHeight+1)prob.push('algo no entra en su caja de la secuencia')})}
      [...document.querySelectorAll('#jEst *,#jOps *')].forEach(e=>{if(e.clientWidth>0&&e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).overflowX==='visible')prob.push('algo se sale de su caja: '+(e.className||e.tagName))});
      const nombres=toc.filter(e=>!(e.getAttribute('aria-label')||e.innerText||'').trim());if(nombres.length)prob.push('botón sin nombre');
      if(prob.length)out.push({nom:g.id+' n'+niv,prob:[...new Set(prob)]})}}}
    // el premio y el panel para grandes tienen que entrar en la pantalla (o poder desplazarse)
    S.jugar('e_animals');await espera(20);document.getElementById('premioPeg').textContent='🦄';document.getElementById('premio').hidden=false;
    const cmE=document.querySelector('#premio .caja-modal'),cm=caja(cmE);if(fuera(cm))out.push({nom:'premio',prob:['no entra en la pantalla']});
    if(cmE.scrollHeight>cmE.clientHeight+1)out.push({nom:'premio',prob:['hay que desplazar para llegar a los botones '+cmE.scrollHeight+'>'+cmE.clientHeight]});
    document.getElementById('premio').hidden=true;
    document.getElementById('padres').hidden=false;const pm=document.querySelector('#padres .caja-modal');
    if(caja(pm).b>H+1||caja(pm).t<-1)out.push({nom:'panel de grandes',prob:['se sale de la pantalla']});
    if(pm.scrollHeight>pm.clientHeight+1&&getComputedStyle(pm).overflowY==='visible')out.push({nom:'panel de grandes',prob:['no se puede desplazar']});
    document.getElementById('padres').hidden=true;
    return out;
  });
  chk('DISEÑO en '+nom+' ('+w+'×'+h+'): ningún juego se sale de la pantalla, se pisa o deja botones chicos, y el premio y el panel de grandes entran',rr.length===0&&p.errs.length===0,j(rr.slice(0,4))+j(p.errs));
  await ctx.close();
}

await b.close();if(srv)srv.close();
const mal=res.filter(x=>!x).length;
console.log(mal?'HAY FALLOS ('+mal+' de '+res.length+')':'TODO OK ('+res.length+' chequeos)');
process.exit(mal?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
