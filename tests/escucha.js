// El examinador del guion grabado ESCUCHA (escucha.js), en los dos módulos: reacciona a lo que se dijo, repregunta con criterio, se interesa por lo que se mencionó
// y se acuerda antes de despedirse. Se prueba la lógica (con el azar controlado) y una charla completa tecleada.
const {chromium}=require('playwright');const path=require('path');
const RAIZ=path.resolve(__dirname,'..');
const MODULOS=[
  {nom:'Felu (Grade 3)',url:process.env.URL_FELU||'file://'+path.join(RAIZ,'felu','index.html'),id:'g3',
   paso:"MIDDLE.find(s=>s.g==='libre'&&seguidas(s).length)",yaStep:"MIDDLE.find(s=>seguidas(s).some(f=>f('x').q==='Can you swim?'))",yaQ:'Can you swim?',yaResp:'i swim and i play tennis',
   perroQ:"What's your dog's name?",futbolQ:"Who's your favourite player?",neutra:'it is a nice place for me',sinSeg:"CALENT[0]",pasoR:"MIDDLE.find(s=>s.escucha&&s.react.generica)",saludo:"OPEN[0]"},
  {nom:'Raphina (Grade 4)',url:process.env.URL_RAPHINA||'file://'+path.join(RAIZ,'raphina','index.html'),id:'g4',
   paso:"CONV4.find(s=>/last holiday/.test(s.q)&&seguidas(s).length)",yaStep:"CONV4.find(s=>seguidas(s).some(f=>f('x').q==='Who did you go with?'))",yaQ:'Who did you go with?',yaResp:'i went to the beach with my family',
   perroQ:'How did you get your dog?',futbolQ:'Who is your favourite player?',neutra:'it was a nice place for me',sinSeg:"SALUDO4",pasoR:"CONV4.find(s=>s.escucha&&s.react.generica)",saludo:"SALUDO4"}];
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
async function pagina(url){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await p.goto(url);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  return {p,ctx};
}
for(const M of MODULOS){
  console.log('\n===== '+M.nom);
  let t=await pagina(M.url);let p=t.p;
  // ---- 1) cómo se reconoce lo que se dijo
  const an=await p.evaluate(()=>{const f=x=>{const a=escuchaAnalizar(x);return {n:a.n,temas:a.temas.join(),neg:a.neg,triste:a.triste,nose:a.nose,esp:a.espanol,no:a.no,rica:a.rica,corta:a.corta,pos:a.pos}};
    return {perro:f("I have a dog and I love it"),hot:f("I eat a hot dog"),neg:f("I don't like dogs"),triste:f("my dog died last year"),nose:f("I don't know"),no:f("no"),esp:f("mi perro se llama Max"),
      varios:f("I play football with my friends"),rica:f("I like swimming and I play the guitar with my brother and we have a lot of fun together on Saturdays"),corta:f("football")}});
  chk('reconoce de qué se habló («dog», «football» + «friends») y no confunde «hot dog» con un perro',an.perro.temas==='perro'&&an.hot.temas===''&&an.varios.temas==='futbol,amigos',JSON.stringify([an.perro,an.hot,an.varios]));
  chk('reconoce lo negativo («I don\'t like dogs» no cuenta como tema), lo triste, el «no sé», el español, el «no» y las respuestas cortas y largas',
    an.neg.neg&&an.neg.temas===''&&an.triste.triste&&an.triste.temas===''&&an.nose.nose&&an.esp.esp&&an.no.no&&an.rica.rica&&an.corta.corta&&!an.rica.corta,JSON.stringify(an));
  // ---- 2) reacciones (el azar queda fijo en 0,1: siempre «sí» a las probabilidades)
  const rx=await p.evaluate((M)=>{const R0=Math.random;Math.random=()=>0.1;try{
    const G=eval(M.pasoR);const mem=()=>escuchaNueva();const r=(tx,m)=>escuchaReaccion(G,tx,escuchaAnalizar(tx),m||mem());const r2=(tx,fl)=>escuchaReaccion(G,tx,escuchaAnalizar(tx),mem(),fl);
    const m1=mem();const a=r("I have a dog and I love it",m1),b=r("my dog is called Max and I walk him",m1);   // el mismo tema dos veces: la segunda ya no es sobre los perros
    const dos=r("we play football with my friends",mem());
    return {perro:a,perroOtraVez:b,ESC_PERRO:ESC_IDX.perro.r,noMeGusta:r("I don't like dogs"),triste:r("my dog died last year"),trist:ESC_TRIST,nose:r("I don't know"),esp:r("mi perro se llama Max"),nosel:ESC_NOSE,no:r("no"),nol:ESC_NO,
      pos:r("it was great"),posl:ESC_POS,rica:r("we went to the park and we played with a ball and then we had a snack and we went home"),ricaL:ESC_RICA,futbol:dos,futbolL:ESC_IDX.futbol.r,
      flojo:r2("yes i like it",true),sinFlojo:r2("yes i like it",false),neutroL:ESC_NEUTRO,
      saludo:escuchaReaccion(eval(M.saludo),"my dog is great",escuchaAnalizar("my dog is great"),mem()),
      ultimo:escuchaReaccion(Object.assign({},G,{last:true}),"I have a dog",escuchaAnalizar("I have a dog"),mem()),solo:escuchaReaccion(Object.assign({},G,{solo:true}),"I have a dog",escuchaAnalizar("I have a dog"),mem()),
      propia:escuchaReaccion({react:t=>"x",q:"a?"},"I have a dog",escuchaAnalizar("I have a dog"),mem())}}finally{Math.random=R0}},M);
  chk('«I have a dog and I love it» → una reacción sobre los perros («'+rx.perro+'»), y si vuelve a salir el tema ya no repite la felicitación',rx.ESC_PERRO.includes(rx.perro)&&!rx.ESC_PERRO.includes(rx.perroOtraVez),JSON.stringify([rx.perro,rx.perroOtraVez]));
  chk('«I don\'t like dogs» no recibe un elogio de los perros',rx.noMeGusta===null||!rx.ESC_PERRO.includes(rx.noMeGusta),rx.noMeGusta);
  chk('algo triste se acompaña («'+rx.triste+'»), el «no sé» y el español se tranquilizan («'+rx.nose+'»), el «no» se acepta («'+rx.no+'»)',rx.trist.includes(rx.triste)&&rx.nosel.includes(rx.nose)&&rx.nosel.includes(rx.esp)&&rx.nol.includes(rx.no));
  chk('lo que gustó mucho («it was great» → «'+rx.pos+'»), una respuesta larga («'+rx.rica+'») y el fútbol («'+rx.futbol+'») tienen su reacción',rx.posl.includes(rx.pos)&&rx.ricaL.includes(rx.rica)&&rx.futbolL.includes(rx.futbol));
  chk('si no contestó lo que se preguntaba (le costó) la reacción es neutra («'+rx.flojo+'») y no un festejo «de la pregunta»; si contestó bien no se toca (null)',rx.neutroL.includes(rx.flojo)&&rx.sinFlojo===null,JSON.stringify([rx.flojo,rx.sinFlojo]));
  chk('el saludo, la despedida, el paso «solo» y los pasos con reacción propia NO se tocan',rx.saludo===null&&rx.ultimo===null&&rx.solo===null&&rx.propia===null,JSON.stringify([rx.saludo,rx.ultimo,rx.solo,rx.propia]));
  // ---- 3) repreguntas
  const sg=await p.evaluate((M)=>{
    const St=eval(M.paso);const vez=(tx,n,opt)=>{const c={};for(let i=0;i<n;i++){const mem=escuchaNueva();mem.n=4;Object.assign(mem,opt||{});const a=escuchaAnalizar(tx);const f=elegirSeguida(St,tx,new Set(),{an:a,mem,flojo:false});const k=f?f.q:'(ninguna)';c[k]=(c[k]||0)+1}return c};
    const frac=(c,n)=>1-(c['(ninguna)']||0)/n;
    const out={};
    out.neutra=frac(vez(M.neutra,400),400);                                                   // una respuesta común: el 65% de siempre
    out.rica=frac(vez("we went to the park and we played with a ball and then we had a snack and we went home very happy",400),400);
    out.corta=frac(vez("blue",300),300);out.cortaE=vez("blue",300);
    out.no=frac(vez("no",100),100);out.nose=frac(vez("i don't know",100),100);out.triste=frac(vez("my dog died",100),100);out.esp=frac(vez("mi casa es grande",100),100);
    // flojo: le costó contestar
    out.flojo=(()=>{let n=0;for(let i=0;i<100;i++){const mem=escuchaNueva();mem.n=4;if(elegirSeguida(St,"blue",new Set(),{an:escuchaAnalizar("blue"),mem,flojo:true}))n++}return n})();
    // se interesa: menciona un perro / el fútbol
    out.perro=vez("i have a dog",300);out.futbol=vez("i like football",300);
    // lo ya dicho
    const Sy=eval(M.yaStep);out.ya=(()=>{let n=0;for(let i=0;i<300;i++){const mem=escuchaNueva();mem.n=4;const a=escuchaAnalizar(M.yaResp);const f=elegirSeguida(Sy,M.yaResp,new Set(),{an:a,mem,flojo:false});if(f&&f.q===M.yaQ)n++}return n})();
    out.yaPide=(()=>{let n=0;for(let i=0;i<300;i++){const mem=escuchaNueva();mem.n=4;const a=escuchaAnalizar("it is nice");const f=elegirSeguida(Sy,"it is nice",new Set(),{an:a,mem,flojo:false});if(f&&f.q===M.yaQ)n++}return n})();
    // pasos que NO son de contenido (saludo, despedida…): como siempre, sin pedir más ni interesarse
    const Sn=eval(M.sinSeg);out.sinSeg=(()=>{let n=0;for(let i=0;i<100;i++){const mem=escuchaNueva();mem.n=4;if(elegirSeguida(Sn,"i have a dog",new Set(),{an:escuchaAnalizar("i have a dog"),mem,flojo:false}))n++}return n})();
    // una pregunta de sí/no con respuesta corta: la probabilidad de siempre (no se fuerza)
    const SiNo=Object.assign({},St,{q:"Do you like it?"});out.siNo=frac((()=>{const c={};for(let i=0;i<300;i++){const mem=escuchaNueva();mem.n=4;const f=elegirSeguida(SiNo,"yes",new Set(),{an:escuchaAnalizar("yes"),mem,flojo:false});const k=f?f.q:'(ninguna)';c[k]=(c[k]||0)+1}return c})(),300);
    const Dato=Object.assign({},St,{q:"What time do you get up?"});out.dato=frac((()=>{const c={};for(let i=0;i<300;i++){const mem=escuchaNueva();mem.n=4;const f=elegirSeguida(Dato,"seven",new Set(),{an:escuchaAnalizar("seven"),mem,flojo:false});const k=f?f.q:'(ninguna)';c[k]=(c[k]||0)+1}return c})(),300);
    return out},M);
  chk('una respuesta común sigue repreguntándose cerca del 65% ('+Math.round(sg.neutra*100)+'%) y una larga bastante menos ('+Math.round(sg.rica*100)+'%)',sg.neutra>.5&&sg.neutra<.82&&sg.rica<.4,JSON.stringify([sg.neutra,sg.rica]));
  chk('si contestó cortito una pregunta abierta («blue») casi siempre le pide un poco más ('+Math.round(sg.corta*100)+'%), pero con «Yes» a un sí/no o un dato («seven») no se fuerza ('+Math.round(sg.siNo*100)+'% y '+Math.round(sg.dato*100)+'%)',sg.corta>=.95&&sg.siNo<.85&&sg.dato<.85,JSON.stringify([sg.corta,sg.siNo,sg.dato,sg.cortaE]));
  chk('no se apila una pregunta sobre quien dijo «no», «I don\'t know», algo triste o contestó en español, ni sobre quien le costó contestar',sg.no===0&&sg.nose===0&&sg.triste===0&&sg.esp===0&&sg.flojo===0,JSON.stringify([sg.no,sg.nose,sg.triste,sg.esp,sg.flojo]));
  chk('se interesa: «I have a dog» → «'+M.perroQ+'» y «I like football» → «'+M.futbolQ+'» (la mayoría de las veces)',(sg.perro[M.perroQ]||0)>=180&&(sg.futbol[M.futbolQ]||0)>=180,JSON.stringify([sg.perro,sg.futbol]));
  chk('no pregunta lo que ya se dijo («'+M.yaQ+'» con «'+M.yaResp+'»: '+sg.ya+' veces) pero sí si no se había dicho ('+sg.yaPide+' de 300)',sg.ya===0&&sg.yaPide>=60,JSON.stringify([sg.ya,sg.yaPide]));
  chk('el saludo y la despedida no se interesan ni piden más (siguen como siempre)',sg.sinSeg===0,sg.sinSeg);
  // límites por charla
  const lim=await p.evaluate((M)=>{const R0=Math.random;Math.random=()=>0.1;try{
    const St=eval(M.paso);const mem=escuchaNueva();const pre=new Set();const inter=[],eli=[];
    for(let i=0;i<14;i++){mem.n++;const tx=i%2?"i have a dog":"blue";const a=escuchaAnalizar(tx);escuchaRecordar(mem,a);const f=elegirSeguida(St,tx,pre,{an:a,mem,flojo:false});
      if(f){pre.add(_audioKey(f.q));if(ELICITAR.includes(f))eli.push(i);else if(/dog/i.test(f.q))inter.push(i)}}
    return {inter,eli,interes:mem.interes}}finally{Math.random=R0}},M);
  chk('como mucho 2 preguntas «de interés» por charla, separadas, y no más de 3 pedidos de «más»: '+JSON.stringify(lim),lim.interes<=2&&lim.eli.length<=3&&lim.inter.every((x,i,a)=>i===0||x-a[i-1]>=3));
  // ---- 4) el recuerdo antes de despedirse
  const rec=await p.evaluate(()=>{const R0=Math.random;Math.random=()=>0.1;try{
    const mk=(n,temas)=>{const m=escuchaNueva();m.n=n;m.temas=temas;return m};
    return {perroYFamilia:escuchaRecuerdo(mk(8,{familia:5,perro:2})),pocas:escuchaRecuerdo(mk(2,{perro:3})),nada:escuchaRecuerdo(mk(8,{})),soloGeneral:escuchaRecuerdo(mk(8,{verano:3})),esperado:ESC_IDX.perro.rec}}finally{Math.random=R0}});
  chk('antes de despedirse se acuerda del tema más específico («'+rec.perroYFamilia+'»), no si se habló poco o de nada',rec.perroYFamilia===rec.esperado&&rec.pocas===""&&rec.nada===""&&rec.soloGeneral==="");
  // ---- 5) todo lo que puede decir tiene su audio grabado
  const aud=await p.evaluate(()=>{const sin=[];const falta=x=>{if(_claveAudio(x)===null)sin.push(x)};
    const frases=escuchaFrases();frases.forEach(falta);const pasos=[...ELICITAR];Object.keys(ESC_SEG).forEach(k=>ESC_SEG[k].forEach(s=>pasos.push(s)));
    pasos.forEach(s=>{falta(s.q);falta("Good try! You can say: "+s.a+" Now you try.");(s.hints||[]).forEach(h=>falta(h.en))});
    return {n:frases.length+pasos.length,sin:[...new Set(sin)].slice(0,8),nsin:new Set(sin).size,temas:Object.keys(ESC_SEG).length,pasos:pasos.length}});
  chk('las '+aud.n+' frases y preguntas del examinador que escucha ('+aud.temas+' temas con pregunta de interés) tienen su audio grabado ('+aud.nsin+' sin audio)',aud.nsin===0&&aud.temas>=25,JSON.stringify(aud.sin));
  // cada pregunta de interés cumple lo que pide: su respuesta modelo satisface su «need» y tiene 3 ayudas
  const modelo=await p.evaluate(()=>{const mal=[];Object.keys(ESC_SEG).forEach(k=>ESC_SEG[k].forEach(s=>{const low=s.a.toLowerCase().replace(/[.,!?]/g,"");
    const fallan=(s.need||[]).filter(([re])=>!re.test(low));if(fallan.length||(s.hints||[]).length!==3||!s.q||!s.react||(s.ya&&!(s.ya instanceof RegExp)))mal.push(s.q)}));return mal});
  chk('la respuesta modelo de cada pregunta de interés cumple su propio «need» y trae 3 ayudas',modelo.length===0,JSON.stringify(modelo));
  chk('el prompt de la IA tiene las reglas «LISTEN LIKE A REAL EXAMINER»',await p.evaluate(()=>/LISTEN LIKE A REAL EXAMINER[\s\S]*mention ONE concrete detail[\s\S]*do NOT cheer/.test(SISTEMA_IA)));
  chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();

  // ---- 6) una charla completa tecleada (el azar fijo en 0,1): se nota que escucha
  t=await pagina(M.url);p=t.p;
  await p.evaluate(()=>{Math.random=()=>0.1});
  if(M.id==='g4')await p.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})});
  await p.reload();await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))};Math.random=()=>0.1});
  await p.click('#t-speak');await p.click('#practice-start');
  const SALUDO="I'm fine, thank you.",BUENA=M.id==='g4'?"I have a dog and I like playing football at the park. Last summer we went to the beach by car. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well.":"I have a dog and I play football with my friends at the park";let cont=0;
  for(let i=0;i<260;i++){
    if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    await p.waitForFunction(()=>!document.getElementById('practice-mic').hidden||!document.getElementById('practice-start').hidden,null,{timeout:10000}).catch(()=>{});
    if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    const q=await p.evaluate(()=>{const e=[...document.querySelectorAll('#practice-chat .msg.ex')].pop();return e?e.innerText.replace(/^EXAMINADOR\s*/i,''):''});
    let r;
    if(/How are you/.test(q))r=SALUDO;else if(/name\?/.test(q)&&!/dog/.test(q))r="My name is Felu.";else if(/topic form/.test(q))r="Here you are.";else if(/question for me|ask me/.test(q))r="Do you like dogs?";
    else if(/what are we going to talk about|your topic|title of your topic/i.test(q))r="My dog Pipa";else if(/Goodbye|That's all|end of the exam|end of our conversation/.test(q))r="Goodbye!";
    else if(++cont>=4&&cont<=9)r="my cat was sick and it was very sad";   // varias preguntas seguidas: alguna tiene que ser de las que escuchan (no todas las de Felu tienen reacción genérica)
    else r=BUENA;
    await p.fill('#practice-in',r);await p.click('#practice-send');await p.waitForTimeout(90);
  }
  const chat=await p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg')].filter(m=>/\b(ex|kid)\b/.test(m.className)).map(m=>(/\bex\b/.test(m.className)?'E: ':'K: ')+m.innerText.replace(/^EXAMINADOR\s*/i,'').replace(/\s+/g,' ')));
  const E=chat.filter(x=>x[0]==='E').map(x=>x.slice(3));
  const dogR=await p.evaluate(()=>ESC_IDX.perro.r),futR=await p.evaluate(()=>ESC_IDX.futbol.r),trist=await p.evaluate(()=>ESC_TRIST),rec1=await p.evaluate(()=>ESC_IDX.perro.rec);
  const iDog=E.findIndex(x=>dogR.includes(x)),iQ=E.indexOf(M.perroQ);
  chk('en una charla de verdad, contar «I have a dog…» recibe una reacción sobre los perros («'+(E[iDog]||'—')+'») una sola vez, y más adelante, en una pregunta de contenido, la de interés «'+M.perroQ+'»',iDog>=0&&E.filter(x=>dogR.includes(x)).length===1&&iQ>iDog&&E.filter(x=>x===M.perroQ).length===1,JSON.stringify(E.slice(0,16)));
  chk('también el fútbol tiene su reacción («'+(E.find(x=>futR.includes(x))||'—')+'»)',E.some(x=>futR.includes(x)));
  chk('lo triste («my cat was sick…») recibe una frase de acompañar («'+(E.find(x=>trist.includes(x))||'—')+'»)',E.some(x=>trist.includes(x)));
  chk('justo antes de despedirse recuerda de qué se habló («'+rec1+'»)',E.includes(rec1)&&/Goodbye|That's all|end of the exam|end of our conversation/.test(E[E.indexOf(rec1)+1]||''),JSON.stringify(E.slice(-4)));
  chk('el saludo y la despedida no reciben «Can you tell me a little more?» ni una pregunta de más',!/little more|tell me more/i.test(E[1]||'')&&!/little more|tell me more/i.test(E[E.length-1]||''),JSON.stringify([E.slice(0,3),E.slice(-3)]));
  chk('la charla termina sola y sin errores de página ('+E.length+' frases del examinador)',await p.evaluate(()=>!document.getElementById('practice-start').hidden)&&p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();
}
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
