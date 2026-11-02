// Módulo de Raphina (Trinity GESE Grade 4): el banco de preguntas, el armado del examen, los modos de práctica, la memoria y lo que se reconoce del lenguaje del grado.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
await p.goto(URL);
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const E=f=>p.evaluate(f);

// ---- 1) el banco
const bn=await E(()=>{
  const norm=t=>t.toLowerCase().replace(/[.,!?]/g,"");const mal=[];
  const chequear=(s,ctx)=>{const a=norm(s.a);(s.need||[]).forEach(([re],i)=>{if(!re.test(a))mal.push(ctx+' | '+s.q+' | need#'+i)});if(!s.q||!s.a)mal.push(ctx+' | falta q o a')};
  CONV4.forEach(s=>{chequear(s,s.g);seguidas(s).forEach(f=>chequear(f('x'),s.g+' (repregunta)'))});
  Object.keys(TIPOS).forEach(k=>TIPOS[k].seg.forEach(s=>chequear(s,'tipo '+k)));
  const dist={};CONV4.forEach(s=>{dist[s.g]=dist[s.g]||{};dist[s.g][s.f]=(dist[s.g][s.f]||0)+1});
  const qs=CONV4.map(s=>s.q);
  return {mal,dist,dup:qs.filter((q,i)=>qs.indexOf(q)!==i),n:CONV4.length,areas:AREAS_KEYS.length,hintsMal:CONV4.filter(s=>!s.hints||s.hints.length!==3).length,
    sinReact:CONV4.filter(s=>typeof s.react!=='function').length,nFollow:CONV4.reduce((n,s)=>n+seguidas(s).length,0)}});
chk('hay 6 temas de conversación con 10 preguntas cada uno (60)',bn.areas===6&&bn.n===60);
chk('cada tema tiene las 5 funciones del grado: pasado ×3, planes ×2, gustos ×2, comparar ×2, frecuencia ×1',Object.values(bn.dist).every(d=>d.pasado===3&&d.futuro===2&&d.gustos===2&&d.comparar===2&&d.frecuencia===1));
chk('no hay preguntas repetidas y todas tienen 3 ayudas y reacción',bn.dup.length===0&&bn.hintsMal===0&&bn.sinReact===0);
chk('la respuesta modelo de cada pregunta (y de cada repregunta) cumple lo que la propia pregunta exige ('+bn.mal.length+' que no)',bn.mal.length===0,JSON.stringify(bn.mal.slice(0,3)));
chk('hay repreguntas ('+bn.nFollow+')',bn.nFollow>=20);
const ex=await E(()=>{
  const mal=bank.filter(x=>!(x.length===4&&Array.isArray(x[2])&&x[2].length===3&&new Set(x[2]).size===3&&Number.isInteger(x[3])&&x[3]>=0&&x[3]<3)).length;
  const q=bank.map(x=>x[1]);return {n:bank.length,mal,dup:q.filter((x,i)=>q.indexOf(x)!==i).length,temas:new Set(bank.map(x=>x[0])).size,
    gram:["Past simple (regular)","Past simple (irregular)","Past simple (questions and negatives)","Going to (plans)","Comparatives","Superlatives","Like + -ing","Adverbs of manner","Adverbs of frequency","The link word but","Past time expressions","Pronunciation of -ed"].every(t=>bank.some(x=>x[0]===t)),
    areas:["Holidays","Shopping","School and work","Hobbies and sports","Food","Weekend and seasonal activities"].every(t=>bank.some(x=>x[0]===t))}});
chk('el examen escrito tiene '+ex.n+' preguntas bien armadas, sin repetir, de '+ex.temas+' temas (toda la gramática del grado y los 6 temas)',ex.n>=100&&ex.mal===0&&ex.dup===0&&ex.gram&&ex.areas);

// una respuesta «completa» (la que usa g4_charla.js) cumple lo que exige CADA pregunta, repregunta y función del banco
const TODO="Yes, I did. It was great and I was happy. Last summer we went to the beach by car with my family and my friends, and I played at the shop. I don't like waiting, but I like swimming. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well. I felt tired at home, then we had lunch. The weather was sunny and warm. It cost a lot of money.";
const falla=await p.evaluate(T=>{const t=T.toLowerCase().replace(/[.,!?]/g,"");const mal=[];
  const ver=(s,ctx)=>(s.need||[]).forEach(([re])=>{if(!re.test(t))mal.push(ctx+' | '+s.q)});
  CONV4.forEach(s=>{ver(s,s.g);seguidas(s).forEach(f=>ver(f('x'),s.g+' (repregunta)'))});
  Object.keys(TIPOS).forEach(k=>{ver({q:'tipo '+k,need:TIPOS[k].need},'tipo');TIPOS[k].seg.forEach(s=>ver(s,'tipo '+k+' seg'))});return mal},TODO);
chk('una respuesta completa cumple lo que exige cada pregunta del banco ('+falla.length+' que no)',falla.length===0,JSON.stringify(falla.slice(0,3)));

// ---- 2) reconocer el lenguaje del grado
const rec=await E(()=>{
  const t=(re,s)=>re.test(s.toLowerCase().replace(/[.,!?]/g,""));
  return {
   pasadoSi:["I went to the beach","We played football","It was fun","I didn't like it","She bought a bag"].every(s=>t(PAS,s)),
   pasadoNo:["I need a bed","It is red","I like hundred things","I go to school"].every(s=>!t(PAS,s)),
   futuro:t(FUT,"I'm going to play")&&t(FUT,"we are going to travel")&&!t(FUT,"I go to school"),
   gustos:t(GUS,"I like swimming")&&t(GUS,"I love pizza")&&t(GUS,"I don't like fish")&&!t(GUS,"I swim"),
   comp:t(COMP,"my dog is bigger than my cat")&&t(COMP,"it is more expensive than that")&&t(COMP,"the best pizza")&&t(COMP,"the tallest")&&!t(COMP,"the rest of the day")&&!t(COMP,"it is big"),
   frec:t(FREC,"twice a week")&&t(FREC,"I always play")&&t(FREC,"every day")&&t(FREC,"quickly")&&!t(FREC,"my family is big")&&!t(FREC,"I swim")}});
chk('el pasado se reconoce (went, played, was, didn\'t…) y no se confunde «need», «red»',rec.pasadoSi&&rec.pasadoNo);
chk('going to, gustos, comparativos/superlativos y frecuencia se reconocen y no dan falsos positivos («family», «the rest»)',rec.futuro&&rec.gustos&&rec.comp&&rec.frec);
const ev=await E(()=>evalExtra([{r:"E",t:"What did you do?"},{r:"K",t:"I went to the beach and we played"},{r:"K",t:"I'm going to swim. I like swimming, but it is bigger than the pool."},{r:"K",t:"(no answer)"},{r:"K",t:"I swim twice a week"}]));
chk('evalExtra cuenta lo que se usó: «'+ev+'»',/past tense forms: 2;/.test(ev)&&/going to: 1;/.test(ev)&&/comparatives or superlatives: 1;/.test(ev)&&/like\/love\/enjoy: 1;/.test(ev)&&/the word but: 1\./.test(ev)&&/frequency or manner words: 2;/.test(ev));
chk('«Holidays», «Food», «School and work» no sirven de tema de la hoja y «My trip to Bariloche» sí',await E(()=>["Holidays","food","School and work","Hobbies and sports","Weekend","Seasons"].every(x=>TEMAS_PROHIBIDOS.test(x))&&!TEMAS_PROHIBIDOS.test("My trip to Bariloche")&&!TEMAS_PROHIBIDOS.test("My dog")));

// ---- 3) el armado del examen completo, 30 veces
const forma=await E(()=>{localStorage.removeItem(VISTAS_KEY);localStorage.removeItem(TEMA_KEY);const out=[];
  for(let i=0;i<30;i++){const st=armarPasos("exam");out.push(st.map(s=>({g:s.g,solo:!!s.solo,q:s.q,intro:s.intro||"",ctx:s.contexto||"",tipo:s.tipo||"",f:s.f||"",rot:s.rotulo||""})))}return out});
const ok1=forma.every(c=>c[0].g==="saludo"&&/How are you/.test(c[0].q)&&/topic form/.test(c[1].q)&&c[1].g==="tema"&&/topic\?|talk about/.test(c[2].q)&&c[2].ctx.startsWith("📌"));
chk('cada examen empieza con saludo → «hoja del tema» → título del tema',ok1);
const puntos=c=>c.filter(s=>s.g==="tema"&&s.tipo);
chk('en el tema hay 4 puntos, cada uno con su «📌 …» a la vista',forma.every(c=>puntos(c).length===4&&puntos(c).every(s=>s.ctx.startsWith("📌 "))));
chk('la pregunta de quien rinde al examinador viene justo después del 2.º punto',forma.every(c=>{const i=c.findIndex(s=>/question for me|ask me/.test(s.q));return i>0&&puntos(c).indexOf(c[i-1])===1&&c[i-1].tipo}));
chk('hay 2 temas de conversación distintos, cada uno anunciado con un paso «solo» y con 4 preguntas de 4 funciones distintas',forma.every(c=>{const solos=c.filter(s=>s.solo);if(solos.length!==2||solos[0].q===solos[1].q)return false;
  const i0=c.indexOf(solos[0]),i1=c.indexOf(solos[1]);const a=c.slice(i0+1,i1),bq=c.slice(i1+1,c.length-1);
  return a.length===4&&bq.length===4&&new Set(a.map(s=>s.f)).size===4&&new Set(bq.map(s=>s.f)).size===4&&a.every(s=>s.g===a[0].g)&&bq.every(s=>s.g===bq[0].g)&&a[0].g!==bq[0].g}));
chk('el primer anuncio dice «something different» (viene del tema) y el segundo «Now let\'s talk about…»',forma.every(c=>{const s=c.filter(x=>x.solo);return /something different/.test(s[0].q)&&/^Thank you\. Now let's talk about/.test(s[1].q)}));
chk('termina con la despedida',forma.every(c=>/Goodbye/.test(c[c.length-1].q)));
chk('el orden de los 4 puntos cambia ('+new Set(forma.map(c=>puntos(c).map(s=>s.ctx).join("|"))).size+' órdenes en 30; con tema de ejemplo cambia también el tema)',new Set(forma.map(c=>c.filter(s=>s.tipo).map(s=>s.ctx).join("|"))).size>=10);
chk('los temas de conversación salen parejo: los 6 aparecen y hay más de 8 combinaciones distintas',await E(()=>{const k=new Set(),par=new Set();for(let i=0;i<40;i++){const a=armarPasos("exam").filter(s=>s.solo).map(s=>s.rotulo);a.forEach(x=>k.add(x));par.add(a.slice().sort().join("|"))}return k.size===6&&par.size>=8}));

// ---- 4) la hoja propia
const hoja=await E(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]});
  const f=temaOEjemplo();const st=armarPasos("exam");return {ej:f.ejemplo,t:f.t,ctx:st.filter(s=>s.tipo).map(s=>s.contexto).sort(),titulo:st[2].contexto,tipos:st.filter(s=>s.tipo).map(s=>s.tipo).sort()}});
chk('con la hoja completa se usa SU tema y SUS 4 puntos, y no se avisa de «tema de ejemplo»',!hoja.ej&&hoja.t==="My dog Pipa"&&hoja.ctx.join("|")==="📌 How often we walk|📌 How we got her|📌 Pipa and my cat: who is faster?|📌 What she likes to eat"&&!/ejemplo/.test(hoja.titulo)&&hoja.titulo.indexOf("My dog Pipa")>0);
chk('cada punto pregunta según su función (pasado, gustos, frecuencia y comparar)',hoja.tipos.join()==="comparar,frecuencia,gustos,pasado");
chk('con la hoja incompleta se usa un tema de ejemplo y se le avisa',await E(()=>{temaGuardar({t:"My dog",p:[["a b c","pasado"],["","gustos"],["","gustos"],["","gustos"]]});const f=temaOEjemplo(),st=armarPasos("exam");return f.ejemplo&&/tema de ejemplo/.test(st[2].contexto)}));

// ---- 5) cómo se practica
const modos=await E(()=>{localStorage.removeItem(TEMA_KEY);const sm=$("g4modo"),sa=$("g4area");const r={};
  sm.value="tema";sa.value="azar";let st=armarPasos("practice");r.tema={solo:st.filter(s=>s.solo).length,puntos:st.filter(s=>s.tipo).length,conv:st.filter(s=>s.f).length,preg:st.some(s=>/question for me|ask me/.test(s.q))};
  sm.value="conv";sa.value="azar";st=armarPasos("practice");r.conv={solo:st.filter(s=>s.solo).length,puntos:st.filter(s=>s.tipo).length,conv:st.filter(s=>s.f).length,forma:st.some(s=>/topic form/.test(s.q)),abre:st.filter(s=>s.solo).map(s=>s.q)};
  sm.value="conv";sa.value="food";st=armarPasos("practice");r.uno={solo:st.filter(s=>s.solo).length,conv:st.filter(s=>s.f).length,areas:new Set(st.filter(s=>s.f).map(s=>s.g)).size,fs:new Set(st.filter(s=>s.f).map(s=>s.f)).size,abre:st.filter(s=>s.solo)[0].q};
  sm.value="completo";sa.value="azar";st=armarPasos("practice");r.comp={solo:st.filter(s=>s.solo).length,puntos:st.filter(s=>s.tipo).length};
  sm.value="tema";st=armarPasos("exam");r.examen={solo:st.filter(s=>s.solo).length,puntos:st.filter(s=>s.tipo).length};   // la pestaña Examen no mira el selector: siempre completo
  return r});
chk('«Sólo mi tema»: 4 puntos y la pregunta de quien rinde, sin temas de conversación',modos.tema.puntos===4&&modos.tema.conv===0&&modos.tema.solo===0&&modos.tema.preg);
chk('«Sólo la conversación»: 2 temas con «Let\'s talk about…» (sin «something different» porque no hubo tema)',modos.conv.puntos===0&&modos.conv.forma===false&&modos.conv.solo===2&&modos.conv.conv===8&&/^Let's talk about /.test(modos.conv.abre[0])&&!/something different/.test(modos.conv.abre[0])&&/^Thank you\. Now let's talk about/.test(modos.conv.abre[1]));
chk('un tema elegido (Food): una sola área con 5 preguntas de las 5 funciones',modos.uno.solo===1&&modos.uno.conv===5&&modos.uno.areas===1&&modos.uno.fs===5&&/food/.test(modos.uno.abre));
chk('«Examen completo»: tema + 2 áreas; y la pestaña Examen siempre es completa aunque el selector diga otra cosa',modos.comp.solo===2&&modos.comp.puntos===4&&modos.examen.solo===2&&modos.examen.puntos===4);

// ---- 6) memoria: la pregunta de un tema no se repite en el examen siguiente
const memo=await E(()=>{localStorage.removeItem(VISTAS_KEY);const ex=[];for(let i=0;i<40;i++)ex.push(armarPasos("exam").filter(s=>s.f).map(s=>s.q));
  let rep=0;for(let i=1;i<ex.length;i++){const a=new Set(ex[i-1]);rep+=ex[i].filter(q=>a.has(q)).length}
  const usadas=new Set(ex.flat());return {rep,usadas:usadas.size,mem:localStorage.getItem(VISTAS_KEY).length,propia:!localStorage.getItem("trinity_vistas")}});
chk('una pregunta de la conversación no se repite en el examen siguiente ('+memo.rep+' repetidas en 40) y en 40 exámenes salen '+memo.usadas+' de las 60',memo.rep===0&&memo.usadas>=45);
chk('la memoria de este módulo es propia (trinity_g4_vistas) y pesa poco ('+memo.mem+' caracteres)',memo.propia&&memo.mem<6000);

// ---- 7) los textos de la IA son de este módulo
const ia=await E(()=>({ia:/Raphina/.test(SISTEMA_IA)&&!/Felu/.test(SISTEMA_IA)&&/Grade 4/.test(SISTEMA_IA),ev:/RAPHINA:/.test(SISTEMA_EVAL)&&!/Felu|FELU/.test(SISTEMA_EVAL)&&/A2\.2/.test(SISTEMA_EVAL),tr:/Raphina/.test(PROMPT_TRANSCRIBIR)&&!/Felu/.test(PROMPT_TRANSCRIBIR),
  pic:PIC_LISTA.length===0,max:MOD.iaMax,notas:MOD.notasKey,id:MOD.id,nombre:MOD.nombre}));
chk('los textos para la IA son del Grade 4 y de Raphina (nada de Felu), sin dibujos, 17 turnos y notas propias',ia.ia&&ia.ev&&ia.tr&&ia.pic&&ia.max===17&&ia.notas==="trinity_g4_notas"&&ia.id==="g4"&&ia.nombre==="Raphina");
chk('el plan de la IA trae el tema, los 4 puntos y las 2 áreas',await E(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]});const t=planIA(true);
  return /title "My dog Pipa"/.test(t)&&(t.match(/ point \d: /g)||[]).length===4&&/FIRST CONVERSATION AREA/.test(t)&&/SECOND CONVERSATION AREA/.test(t)&&/talking about past events/.test(t)&&!/SAMPLE/.test(t)}));
chk('sin errores de página',errs.length===0,JSON.stringify(errs));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
