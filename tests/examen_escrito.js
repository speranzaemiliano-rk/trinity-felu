// Examen escrito: que las preguntas CAMBIEN en cada examen (armarExamen + la memoria de cada módulo) y que el banco sea lo bastante grande para que sea cierto.
// Antes eran 30 al azar de un banco de 70 (Felu) o 118 (Raphina) y sin memoria: de un examen al siguiente se repetían ~13 y ~8 preguntas.
const {chromium}=require('playwright');const path=require('path');
const RAIZ=path.resolve(__dirname,'..');
const MODULOS=[
  {nom:'Felu (Grade 3)',url:process.env.URL_FELU||'file://'+path.join(RAIZ,'felu','index.html'),minBanco:200,minTema:8},
  {nom:'Raphina (Grade 4)',url:process.env.URL_RAPHINA||'file://'+path.join(RAIZ,'raphina','index.html'),minBanco:230,minTema:11}];
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
async function pagina(url){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{window.__dichos=[]});
  await p.goto(url);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  return {p,ctx};
}
// hace un examen entero contestando siempre la primera opción; devuelve los textos de las 30 preguntas
async function examen(p){
  const textos=[];
  for(let i=0;i<30;i++){
    textos.push(await p.evaluate(()=>document.querySelector('#exam .qtext').textContent));
    await p.evaluate(()=>{document.querySelector('.opt[data-k="0"]').click();document.getElementById('next').click()});
  }
  return textos;
}
for(const M of MODULOS){
  console.log('\n===== '+M.nom);
  let t=await pagina(M.url);let p=t.p;
  // ---- 1) el banco
  const bk=await p.evaluate(()=>{
    const mal=[],vistos=new Set(),porTema={};
    bank.forEach(([tema,tx,o,a],i)=>{
      if(!Array.isArray(o)||o.length!==3||new Set(o.map(x=>String(x).toLowerCase())).size!==3)mal.push('opciones: '+tx);
      if(!(a>=0&&a<3))mal.push('índice: '+tx);
      const k=tx.toLowerCase().replace(/\s+/g,' ').trim();if(vistos.has(k))mal.push('texto repetido: '+tx);vistos.add(k);
      if(!/___/.test(tx)&&!/[?:.…]$/.test(tx)&&!/[?:]\s*$/.test(tx)&&!/—\s*$/.test(tx))mal.push('forma: '+tx);
      porTema[tema]=(porTema[tema]||0)+1});
    const pos=[0,0,0];bank.forEach(q=>pos[q[3]]++);
    return {n:bank.length,mal,temas:Object.keys(porTema).length,minTema:Math.min(...Object.values(porTema)),chico:Object.entries(porTema).filter(([k,v])=>v<8).map(x=>x.join(':')),pos}});
  chk('el banco tiene '+bk.n+' preguntas ('+bk.temas+' temas, al menos '+bk.minTema+' por tema)',bk.n>=M.minBanco&&bk.minTema>=M.minTema,JSON.stringify({n:bk.n,minTema:bk.minTema,chico:bk.chico}));
  chk('cada pregunta tiene 3 opciones distintas, una correcta válida, y ninguna se repite',bk.mal.length===0,JSON.stringify(bk.mal.slice(0,5)));
  chk('la opción correcta no está siempre en el mismo lugar del banco ('+bk.pos.join('/')+' en 1ª/2ª/3ª)',bk.pos.every(x=>x>=bk.n*.15));   // (sólo el dato; en pantalla las opciones se mezclan siempre)
  // ---- 2) la elección (sin pantalla): 8 exámenes seguidos
  const sim=await p.evaluate(()=>{
    const V={},exs=[];
    for(let e=0;e<8;e++){const pick=armarExamen(bank,N,V);V._n=(V._n||0)+1;pick.forEach(q=>V[escClave(q)]=V._n);exs.push(pick)}
    const txt=exs.map(x=>x.map(q=>q[1])),solape=[];
    for(let e=1;e<txt.length;e++){const prev=new Set(txt[e-1]);solape.push(txt[e].filter(x=>prev.has(x)).length)}
    const todas=txt.slice(0,6).flat();   // los primeros 6 exámenes: 180 preguntas (el 7.º ya agota el banco de Felu: 210 > 200)
    const temas=new Set(bank.map(q=>q[0])).size;
    return {solape,repetidasEn5:todas.length-new Set(todas).size,largo:txt.map(x=>x.length),temasPorExamen:exs.map(x=>new Set(x.map(q=>q[0])).size),temas,
      sinRepetir:exs.map(x=>new Set(x.map(q=>q[1])).size)}});
  chk('exámenes seguidos: ninguna pregunta se repite con el examen anterior ('+sim.solape.join(' ')+') ni en los primeros 6 ('+sim.repetidasEn5+' repetidas)',sim.solape.every(x=>x===0)&&sim.repetidasEn5===0,JSON.stringify(sim));
  chk('cada examen trae 30 preguntas sin repetirse entre sí y de TODOS los temas ('+sim.temas+')',sim.largo.every(x=>x===30)&&sim.sinRepetir.every(x=>x===30)&&sim.temasPorExamen.every(x=>x===sim.temas),JSON.stringify([sim.largo,sim.temasPorExamen]));
  chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();

  // ---- 3) en pantalla: dos exámenes distintos, la memoria sobrevive a recargar, y se cuenta cuántas eran nuevas
  t=await pagina(M.url);p=t.p;
  await p.click('#t-exam');
  chk('el cartel de inicio explica que cada examen trae preguntas distintas y cuántas hay en el banco',await p.evaluate(()=>new RegExp('preguntas distintas[\\s\\S]*'+bank.length).test(document.getElementById('exam').innerText)));
  await p.click('#start');
  const e1=await examen(p);
  const r1=await p.evaluate(()=>document.getElementById('exam').innerText);
  chk('examen 1: 30 preguntas distintas; el resultado todavía no habla de «nuevas» (es el primero)',new Set(e1).size===30&&!/eran nuevas/.test(r1)&&/resultado/i.test(r1),r1.slice(0,200));
  await p.click('#again');
  const e2=await examen(p);
  const r2=await p.evaluate(()=>document.getElementById('exam').innerText);
  const comun=e2.filter(x=>e1.includes(x)).length;
  chk('«Hacer otro examen»: 30 preguntas nuevas, ninguna del examen anterior ('+comun+' repetidas)',new Set(e2).size===30&&comun===0);
  chk('el resultado cuenta cuántas preguntas eran nuevas para quien rinde',/🆕 30 de las 30 preguntas de este examen eran nuevas para vos/.test(r2),r2.slice(0,260));
  const mem=await p.evaluate(()=>JSON.parse(localStorage.getItem(ESC_KEY)||'{}'));
  chk('queda anotado en el aparato (examen n.º '+mem._n+', '+(Object.keys(mem).length-1)+' preguntas vistas)',mem._n===2&&Object.keys(mem).length-1===60);
  await p.reload();await p.evaluate(()=>{window.say=async t=>{}});
  await p.click('#t-exam');await p.click('#start');
  const e3=await examen(p);
  chk('al recargar la página sigue acordándose: el examen 3 no repite nada de los dos primeros ('+e3.filter(x=>e1.includes(x)||e2.includes(x)).length+' repetidas)',new Set(e3).size===30&&!e3.some(x=>e1.includes(x)||e2.includes(x)));
  // la opción correcta no cae siempre en el mismo lugar
  await p.click('#again');
  const pos=await p.evaluate(()=>{const c=[0,0,0];qs.forEach(q=>c[q.a]++);return c});
  chk('las opciones de cada pregunta se mezclan (la correcta cae en 1ª/2ª/3ª: '+pos.join('/')+')',pos.filter(x=>x>0).length>=2);
  chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();

  // ---- 4) un examen dejado a medias: lo que no llegó a ver sigue siendo «nuevo»
  t=await pagina(M.url);p=t.p;
  await p.click('#t-exam');await p.click('#start');
  const visto=await p.evaluate(()=>document.querySelector('#exam .qtext').textContent);
  const m1=await p.evaluate(()=>JSON.parse(localStorage.getItem(ESC_KEY)||'{}'));
  chk('si se deja el examen en la 1ª pregunta, sólo esa queda anotada como vista ('+(Object.keys(m1).length-1)+')',Object.keys(m1).length-1===1);
  await p.reload();await p.evaluate(()=>{window.say=async t=>{}});
  await p.click('#t-exam');await p.click('#start');
  const nuevas=await p.evaluate(()=>examNuevas);
  const e4=await p.evaluate(()=>qs.map(q=>q.q));
  chk('...y el examen siguiente vuelve a traer 30 preguntas nunca vistas, sin la que ya se vio ('+nuevas+' nuevas)',nuevas===30&&!e4.includes(visto));
  await t.ctx.close();

  // ---- 5) las preguntas nuevas tienen su audio grabado (el botón «Escuchar la pregunta»)
  t=await pagina(M.url);p=t.p;
  const aud=await p.evaluate(()=>{const sin=[];bank.forEach(q=>{const tx=String(q[1]).replace(/_{2,}/g,' blank ').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim();if(_claveAudio(tx)===null)sin.push(tx)});return {n:bank.length,sin:sin.slice(0,6),nsin:sin.length}});
  chk('las '+aud.n+' preguntas del banco se pueden escuchar (audio grabado; '+aud.nsin+' sin audio)',aud.nsin===0,JSON.stringify(aud.sin));
  await t.ctx.close();
}
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
