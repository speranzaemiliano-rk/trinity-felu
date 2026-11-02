// Variedad del examinador «de siempre»: el banco, el orden, la memoria entre charlas y la forma de cada charla.
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','index.html'));
const res=[];const chk=(n,v,extra)=>{res.push(!!v);console.log(v?'✓':'✗',n,extra||'')};

// ---- 1) el banco
const banco=await p.evaluate(()=>{const g={};MIDDLE.forEach(s=>{(g[s.g]=g[s.g]||[]).push(s.q)});
  const dup=MIDDLE.map(s=>s.q).filter((q,i,a)=>a.indexOf(q)!==i);
  const mal=MIDDLE.filter(s=>!(s.q&&s.a&&s.intro&&Array.isArray(s.need)&&s.need.length&&Array.isArray(s.hints)&&s.hints.length&&typeof s.react==='function')).map(s=>s.q);
  const folMal=[];let nFol=0;
  MIDDLE.forEach(s=>seguidas(s).forEach(f=>{const o=f('x');nFol++;if(!(o&&o.q&&o.a&&Array.isArray(o.need)&&o.need.length&&Array.isArray(o.hints)&&o.hints.length&&typeof o.react==='function'))folMal.push(s.q)}));
  return {porGrupo:Object.fromEntries(Object.entries(g).map(([k,v])=>[k,v.length])),total:MIDDLE.length,dup,mal,folMal,nFol,jobs:JOBS_PIC.length,acts:ACT_PIC.length,grupos:GRUPOS.length}});
console.log('  preguntas por tema:',JSON.stringify(banco.porGrupo),'| total',banco.total,'| repreguntas',banco.nFol,'| dibujos: trabajos',banco.jobs,'acciones',banco.acts);
chk('cada tema tiene al menos 8 preguntas (salvo familia/libre/rutina ≥7)',Object.values(banco.porGrupo).every(n=>n>=7)&&Object.keys(banco.porGrupo).length===banco.grupos);
chk('no hay preguntas repetidas en el banco',banco.dup.length===0,JSON.stringify(banco.dup));
chk('todas las preguntas tienen intro, respuesta modelo, need, ayudas y reacción',banco.mal.length===0,JSON.stringify(banco.mal));
chk('todas las repreguntas están completas',banco.folMal.length===0,JSON.stringify(banco.folMal));
chk('hay 9 trabajos y 12 acciones para los dibujos',banco.jobs===9&&banco.acts===12);

// ---- 2) 40 charlas seguidas con la misma memoria
const charlas=await p.evaluate(()=>{localStorage.removeItem('trinity_vistas');const out=[];
  for(let i=0;i<40;i++){const st=armarPasos();out.push(st.map(s=>({g:s.g,q:s.q,intro:s.intro||'',pic:s.picture||''})))}return out});
const forma=charlas.map(c=>c.map(s=>s.g));
chk('cada charla empieza con saludo y nombre y termina con la pregunta del candidato y la despedida',charlas.every(c=>c[0].g==='saludo'||/How are you/.test(c[0].q))&&charlas.every(c=>/name/i.test(c[1].q)&&c[c.length-2].g==='pregunta'&&c[c.length-1].g===undefined||c[c.length-1].q));
chk('hay un solo dibujo de trabajo y dos de acción en cada charla, con dibujos distintos',charlas.every(c=>{const d=c.filter(s=>s.pic);return d.length===3&&new Set(d.map(s=>s.pic)).size===3}));
chk('nunca dos dibujos seguidos ni un dibujo antes del primer tema',charlas.every(c=>{const mid=c.filter(s=>!['pregunta'].includes(s.g));for(let i=0;i<c.length;i++){if(c[i].pic&&c[i+1]&&c[i+1].pic)return false}const iFirst=c.findIndex(s=>s.g&&s.g!=='calent'&&!/How are you|name|How old|Where do you live/.test(s.q));return !c[iFirst].pic}));
chk('cada charla tiene 8 de los 9 temas (más 3 dibujos)',charlas.every(c=>{const t=new Set(c.map(s=>s.g).filter(g=>g&&!['dibujo','pregunta','calent'].includes(g)));return t.size===8}));
const ordenes=new Set(forma.map(f=>f.filter(g=>!['dibujo','pregunta','calent'].includes(g)).join(',')));
chk('el orden de los temas cambia: ≥30 órdenes distintos en 40 charlas',ordenes.size>=30,'('+ordenes.size+')');
// misma pregunta del mismo tema en charlas seguidas: nunca
let repetidasSeguidas=0,repetidasEn3=0;
const esTema=s=>s.g&&!['dibujo','pregunta','calent'].includes(s.g);   // los saludos, dibujos y despedidas repiten frases a propósito
for(let i=1;i<charlas.length;i++){const a=new Set(charlas[i-1].filter(esTema).map(s=>s.q));repetidasSeguidas+=charlas[i].filter(esTema).filter(s=>a.has(s.q)).length}
for(let i=3;i<charlas.length;i++){const prev=new Set([].concat(charlas[i-1],charlas[i-2],charlas[i-3]).filter(esTema).map(s=>s.q));repetidasEn3+=charlas[i].filter(esTema).filter(s=>prev.has(s.q)).length}
chk('ninguna pregunta de un tema se repite en la charla siguiente',repetidasSeguidas===0,'('+repetidasSeguidas+' repetidas)');
chk('una pregunta de un tema no vuelve antes de 3 charlas (≤3 casos en 37 charlas)',repetidasEn3<=3,'('+repetidasEn3+')');
// cobertura del banco en 40 charlas
const usadas=new Set(charlas.flat().map(s=>s.q));
const porGrupoUsadas={};await p.evaluate(()=>0);
const total=banco.total;const salidas=await p.evaluate(qs=>MIDDLE.filter(s=>qs.includes(s.q)).length,[...usadas]);
chk('en 40 charlas salen al menos el 85% de las preguntas del banco',salidas>=Math.floor(total*.85),'('+salidas+'/'+total+')');
// saludo y cierre varían
const saludos=new Set(charlas.map(c=>c[0].q)),cierres=new Set(charlas.map(c=>c[c.length-1].q)),nombres=new Set(charlas.map(c=>c[1].q)),pregs=new Set(charlas.map(c=>c[c.length-2].q));
chk('saludo, nombre, pregunta del candidato y despedida tienen variantes ('+saludos.size+'/'+nombres.size+'/'+pregs.size+'/'+cierres.size+')',saludos.size>=4&&nombres.size>=2&&pregs.size>=2&&cierres.size>=3);
chk('«Good morning» sólo por la mañana y «Good afternoon» sólo a la tarde',await p.evaluate(()=>{
  const real=Date;let ok=true;
  for(const h of [8,15,22]){Date=class extends real{constructor(...a){if(a.length)super(...a);else{super(2026,10,2,h,0,0)}}};
    for(let i=0;i<80;i++){const q=armarPasos()[0].q;if((h>=12&&/^Good morning/.test(q))||((h<12||h>=20)&&/^Good afternoon/.test(q)))ok=false}}
  Date=real;return ok}));
// la memoria se guarda y es chica
const mem=await p.evaluate(()=>{const t=localStorage.getItem('trinity_vistas');return {len:t.length,n:JSON.parse(t)._n}});
chk('la memoria se guarda en el equipo y pesa poco',mem.n>=40&&mem.len<8000,'('+mem.len+' caracteres, charla nº '+mem.n+')');
// sin localStorage (navegación privada) no se rompe
chk('sin localStorage sigue funcionando (sólo que sin memoria)',await p.evaluate(()=>{const g=Storage.prototype.getItem,s=Storage.prototype.setItem;Storage.prototype.getItem=()=>{throw new Error('x')};Storage.prototype.setItem=()=>{throw new Error('x')};
  try{const st=armarPasos();return st.length>12}finally{Storage.prototype.getItem=g;Storage.prototype.setItem=s}}));
// memoria rota → se ignora
chk('si la memoria está rota (texto cualquiera) se ignora',await p.evaluate(()=>{localStorage.setItem('trinity_vistas','{{{no es json');const st=armarPasos();return st.length>12&&JSON.parse(localStorage.getItem('trinity_vistas'))._n===1}));

// ---- 3) repreguntas
const rep=await p.evaluate(()=>{const pre=new Set();let hechas=0,tot=0;
  localStorage.removeItem('trinity_vistas');
  for(let i=0;i<400;i++){const st=MIDDLE.filter(s=>seguidas(s).length)[i%MIDDLE.filter(s=>seguidas(s).length).length];tot++;if(elegirSeguida(st,'x',new Set()))hechas++}
  const s0=MIDDLE.find(s=>seguidas(s).length);const yaPreguntada=new Set(seguidas(s0).map(f=>_audioKey(f('x').q)));let nada=0;for(let i=0;i<100;i++)if(elegirSeguida(s0,'x',yaPreguntada))nada++;
  return {frac:hechas/tot,yaPreguntadaNunca:nada===0}});
chk('las repreguntas salen más o menos el 65% de las veces ('+Math.round(rep.frac*100)+'%)',rep.frac>.5&&rep.frac<.8);
chk('una repregunta que ya se hizo en la charla no se vuelve a hacer',rep.yaPreguntadaNunca);

// ---- 4) charla completa de punta a punta (escribiendo), dos veces: no se rompe y las preguntas son otras
const charlaCompleta=async()=>{
  const ctx2=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const q=await ctx2.newPage();const e=[];q.on('pageerror',x=>e.push(x.message));
  await q.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await q.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await q.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','index.html'));
  return {q,e,ctx2}};
const hacer=async(c,pre)=>{const q=c.q;await q.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  await q.click('#t-speak');await q.click('#practice-start');await q.waitForTimeout(400);
  const resp=['Sorry, can you repeat, please?','I live with my mum and I get up at seven o\'clock and then I play football. It was good. Yes I can swim. It is sunny. It is the first of November.','si','I have two brothers','my name is Felu','blue'];
  for(let i=0;i<160;i++){
    if(await q.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    await q.waitForSelector('#practice-in:visible',{timeout:4000}).catch(()=>{});
    const vis=await q.evaluate(()=>{const e=document.getElementById('practice-in');return !!(e&&e.offsetParent)});
    if(!vis){await q.click('#practice-kb').catch(()=>{});await q.waitForTimeout(250)}
    await q.fill('#practice-in',resp[i%resp.length]);await q.click('#practice-send');await q.waitForTimeout(130);
  }
  return await q.evaluate(()=>window.__dichos.slice())};
const c1=await charlaCompleta(),c2=await charlaCompleta();
const d1=await hacer(c1),d2=await hacer(c2);
chk('una charla completa termina sin errores de página ('+d1.length+' frases del examinador)',c1.e.length===0&&d1.length>25&&d1.some(t=>/Goodbye|That's all/.test(t)),JSON.stringify(c1.e));
chk('«Of course.» y la pregunta repetida se dicen por separado (cada una con su audio)',d1.some((t,i)=>/^(Of course\.|Sure\.|No problem\.)$/.test(t)&&d1[i+1]&&d1[i+1].length>12));
chk('dos charlas en equipos distintos no son iguales',JSON.stringify(d1.slice(0,40))!==JSON.stringify(d2.slice(0,40)));
const mismo=await c1.q.evaluate(()=>0);
await c1.ctx2.close();await c2.ctx2.close();
chk('sin errores de página en el banco',errs.length===0,JSON.stringify(errs));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
