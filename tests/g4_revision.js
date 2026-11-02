// Raphina: lo que salió de la revisión independiente del contenido en inglés. Que cada corrección siga corregida:
//  · el examinador contesta la pregunta de quien rinde con algo que no contradice lo que se preguntó;
//  · el repaso escrito tiene UNA respuesta correcta y ninguna pista que la delate (a/an);
//  · el saludo y la despedida no traban con una respuesta corta; las reacciones valen para cualquier respuesta;
//  · las expresiones que reconocen el pasado / los comparativos / los adverbios no dan falsos positivos;
//  · las preguntas no dependen del día de la semana; la IA no nombra el título del tema ni supone género.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
async function pagina(){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await p.goto(URL);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  return {p,ctx};
}
let t=await pagina();let p=t.p;

// ---- 1) la respuesta del examinador a la pregunta de quien rinde
const casos=[
 ["Do you like football?",/^Yes, I do\./],["Did you go on holiday last summer?",/^Yes, I did\.$/],["Are you going to travel this year?",/^Yes, I am\.$/],
 ["Is your dog big?",/^Yes, it is\.$/],["Does your mum like football?",/^Yes, she does\.$/],["Do they play football?",/^Yes, they do\.$/],["Can I ask you something?",/^Yes, you can\.$/],
 ["Would you like to play?",/^Yes, I would\.$/],["Were you there?",/^Yes, I was\.$/],["Is there a park?",/^Yes, there is\.$/],["Is your best friend nice?",/^Yes, I think so\.$/],
 ["Do you like dogs or cats?",/both/i],
 ["What is your favourite sport?",/^(?!Yes).*(football|tennis)/],["What's your favourite colour?",/blue/],["What is your name?",/^My name is/],
 ["How often do you play sport?",/twice a week|often/],["How old are you?",/years old/],["How are you?",/very well/],
 ["Where did you celebrate your last birthday?",/^At home/],["Where do you live?",/^I live/],["When did you start playing football?",/ago/],
 ["Who is your favourite player?",/choose/],["Why do you like football?",/^Because/],["Which team do you like?",/difficult choice/],
 ["What do you do at the weekend?",/^I read/],["What did you eat yesterday?",/^I had/],
 ["Yes, I do. Where do you live?",/^I live/],["yes i do do you like football",/^Yes, I do\./],["Pipa?",/good question/]];
const rr=await p.evaluate(c=>c.map(([q])=>{const a=[];for(let i=0;i<30;i++)a.push(reaccionPregunta(q));return [...new Set(a)]}),casos);
const malas=casos.map(([q,re],i)=>rr[i].every(x=>re.test(x))?null:q+' → '+JSON.stringify(rr[i])).filter(Boolean);
chk('el examinador contesta '+casos.length+' preguntas distintas con algo coherente (sí/no según el auxiliar, datos generales para where/when/who/how…)',malas.length===0,JSON.stringify(malas));
const todas=await p.evaluate(()=>PREGUNTAS_MUESTRA.map(q=>[q,reaccionPregunta(q)]));
chk('y a ninguna de las '+todas.length+' preguntas de muestra le contesta algo vacío ni con una palabra suelta de «no sé»',todas.every(([q,a])=>typeof a==="string"&&a.length>5&&!/I'm not sure|I don't know/.test(a)),JSON.stringify(todas.filter(([q,a])=>!(typeof a==="string"&&a.length>5)||/I'm not sure|I don't know/.test(a))));
chk('las preguntas de sí/no que empiezan con auxiliar siempre se contestan con «Yes, …» (salvo «or» y «Have you»)',todas.filter(([q])=>/^(Do|Does|Did|Is|Are|Was|Were|Can|Will|Would|Has)\b/.test(q)&&!/ or /.test(q)).every(([q,a])=>/^Yes, /.test(a)),JSON.stringify(todas.filter(([q,a])=>/^(Do|Does|Did|Is|Are|Was|Were|Can|Will|Would|Has)\b/.test(q)&&!/ or /.test(q)&&!/^Yes, /.test(a))));
// las tres preguntas que le hace el examinador a Raphina para que pregunte tienen su respuesta modelo coherente
const preg4=await p.evaluate(()=>PREG4.map(s=>[s.q,s.a]));
chk('«Would you like…?» se contesta «Yes, I would.» y las otras «Yes, I do.» (antes las tres decían «Yes, I do.»)',preg4.every(([q,a])=>/^Would you/.test(q)?/^Yes, I would\./.test(a):/^Yes, I do\./.test(a))&&preg4.length===3,JSON.stringify(preg4));
chk('las ayudas de la pregunta obligatoria ya no usan el presente perfecto (es del Grade 5)',!(await p.evaluate(()=>PREG4.some(s=>s.hints.some(h=>/have you ever/i.test(h.en))||/have you ever/i.test(JSON.stringify(s.need[0][1]))))));

// ---- 2) el repaso escrito: una sola respuesta posible y sin pistas
const bk=await p.evaluate(()=>bank.map(([t,q,o,a])=>({t,q,o,a})));
const vocal=w=>/^(?!uni)[aeiou]/i.test(w);
const delata=bk.filter(x=>{const m=/\b(a|an) ___/.exec(x.q);if(!m)return false;const compat=x.o.filter(o=>m[1]==="an"?vocal(o):!vocal(o));return compat.length<2});
chk('ninguna pregunta delata la respuesta con «a / an» ('+bk.length+' preguntas)',delata.length===0,JSON.stringify(delata.map(x=>x.q)));
chk('cada pregunta tiene un solo hueco (salvo las de pronunciación), 3 opciones distintas y la correcta dentro del rango',bk.every(x=>(x.t==='Pronunciation of -ed'?(x.q.match(/___/g)||[]).length===0:(x.q.match(/___/g)||[]).length===1)&&new Set(x.o).size===3&&x.o.length===3&&x.a>=0&&x.a<3));
const q=s=>bk.find(x=>x.q===s);
chk('las 6 preguntas que tenían dos respuestas posibles ahora llevan el dato que decide (Last summer / Yesterday / of all / in the world / when it snows)',
  [q("Last summer we ___ in the sea every day."),q("Yesterday I ___ a letter to my friend."),q("Yesterday we ___ lunch at one o'clock."),q("Where ___ you go on holiday last summer?"),q("That is the ___ expensive phone of all."),q("Football is the ___ popular sport in the world."),q("In winter, when it snows, you can build a ___.")].every(Boolean)
  &&!bk.some(x=>["We ___ in the sea every day.","I ___ a letter to my friend.","We ___ lunch at one o'clock.","Where ___ you go on holiday?","That is the ___ expensive phone.","Football is the ___ popular sport.","In winter you can build a ___."].includes(x.q)));
const optsDe=s=>(q(s)||{o:[]}).o.slice().sort().join('|');
chk('en «but» y en los demás ya no hay un «and» / «so» / «because» que también quede bien',
  optsDe("I like pizza, ___ I don't like pasta.")==="but|or|then"&&optsDe("It was sunny, ___ we stayed at home.")==="but|or|too");
chk('«We have English ___ day» ya no admite «all», «last» no compite con «before» y «cooked pasta» no es opción',
  optsDe("We have English ___ day.")==="each of|every|many"&&optsDe("I went to the beach ___ summer.")==="last|next|past"&&optsDe("She likes ___ pasta.")==="cook|cooking|cooks"&&optsDe("She called me two days ___.")==="ago|last|next");

// ---- 3) las expresiones que reconocen el lenguaje del grado
const re=await p.evaluate(()=>{const t=(r,s)=>r.test(s);return {
  pas:[["I'm tired",0],["I was tired",1],["I'm excited",0],["I'm bored",0],["We drove to the beach",1],["I broke my arm",1],["I fed my dog",1],["we blew out the candles",1],["I played football",1],["I visited my aunt",1],["I need help",0],["I like football",0]].map(([s,e])=>t(PAS,s)===!!e?null:s),
  comp:[["the test",0],["the forest",0],["the guest",0],["the rest",0],["the best",1],["the tallest",1],["my dog is bigger than my cat",1],["more interesting than",1]].map(([s,e])=>t(COMP,s)===!!e?null:s),
  frec:[["Well, I think",0],["I play well",1],["I play very well.",1],["I always play",1],["I do it twice a week",1],["I don't know",0]].map(([s,e])=>t(FREC,s)===!!e?null:s)}});
chk('«I\'m tired / excited / bored» ya no cuentan como pasado y «drove, broke, fed, blew…» sí',re.pas.every(x=>x===null),JSON.stringify(re.pas.filter(Boolean)));
chk('«the test / forest / guest / rest» ya no cuentan como superlativo',re.comp.every(x=>x===null),JSON.stringify(re.comp.filter(Boolean)));
chk('«Well, I think…» ya no cuenta como adverbio de modo («I play well» sí)',re.frec.every(x=>x===null),JSON.stringify(re.frec.filter(Boolean)));

// ---- 4) reacciones y preguntas del guion
const rx=await p.evaluate(()=>{const out=new Set(),ms=["no","yes","i went to the beach","i play twice a week","once a year","no we lost","i never eat vegetables"];
  [...CONV4,...Object.values(TIPOS)].forEach(s=>{if(typeof s.react==="function")for(let n=0;n<14;n++)ms.forEach(m=>{try{const x=s.react(m);if(typeof x==="string")out.add(x)}catch(e){}})});return [...out]});
const prohibidas=["That's a lot!","Well done!","That's true!","Happy birthday in advance!","I like art too!","That's a long time!","That's very healthy!"];
chk('ninguna reacción afirma algo que depende de lo que se contestó («That\'s a lot!», «Well done!», «I like art too!»…) ni supone género («good for him»)',rx.length>20&&!rx.some(x=>prohibidas.includes(x)||/\b(him|her)\b/i.test(x)),JSON.stringify(rx.filter(x=>prohibidas.includes(x)||/\b(him|her)\b/i.test(x))));
const preg=await p.evaluate(()=>{const o=[];CONV4.forEach(s=>{o.push(s.q);(s.follow||[]).forEach(f=>o.push(f("x").q))});Object.values(TIPOS).forEach(T=>{T.preg.forEach(v=>o.push(v.q));T.seg.forEach(s=>o.push(s.q))});return o});
chk('ninguna pregunta del examinador usa «yesterday» con la escuela o el trabajo (ayer puede haber sido domingo)',!preg.some(x=>/yesterday/i.test(x)&&/school|work|after school/i.test(x)),JSON.stringify(preg.filter(x=>/yesterday/i.test(x))));
chk('la repregunta sobre la escuela ya no da por hecho que se jugó («Who were you with at break?») y las preguntas de «cocinar» y «lo más caro» están corregidas',
  preg.includes("Who were you with at break?")&&!preg.includes("Who did you play with?")&&preg.includes("What did you cook, or help to cook, last time?")&&preg.includes("What is the most expensive thing you want to buy?")&&!preg.some(x=>/in your bedroom/.test(x)));
const gen=await p.evaluate(()=>TIPOS.pasado.seg.concat(TIPOS.futuro.seg).map(s=>s.a).filter(a=>/It was really interesting/.test(a)));
chk('«Can you tell me more about that?» ya no se modela en pasado para un plan o un gusto («Yes. I can tell you more…»)',gen.length===0&&await p.evaluate(()=>GEN_SEG[0].a==="Yes. I can tell you more. I like it a lot."));
chk('«Is there anything you don\'t like?» se modela con «Yes, there is. I don\'t like…»',await p.evaluate(()=>TIPOS.gustos.seg[0].a.startsWith("Yes, there is.")));

// ---- 5) compasión: si lo que se cuenta es triste, el examinador no festeja (escucha.js: vale para todos los pasos con reacción genérica)
const comp=await p.evaluate(()=>{const pasos=armarPasos("practice");
  const conv=pasos.filter(s=>!s.solo&&s.g!=="saludo"&&s.g!=="cierre"&&s.react!==reaccionPregunta);   // los del tema y los de las 2 áreas (g:"food", "hobbies"…)
  const tx="my dog died last year and we were very sad",an=escuchaAnalizar(tx),mem=escuchaNueva();
  const triste=conv.slice(0,12).map(s=>escuchaReaccion(s,tx,an,mem));
  const tx2="we went to the beach and it was great",an2=escuchaAnalizar(tx2);
  const alegre=new Set();conv.slice(0,12).forEach(s=>{for(let i=0;i<5;i++)alegre.add(escuchaReaccion(s,tx2,an2,escuchaNueva()))});
  const saludo=pasos.find(s=>s.g==="saludo"),preg=pasos.find(s=>s.react===reaccionPregunta);
  return {n:conv.length,triste,alegre:[...alegre],saludoNo:escuchaReaccion(saludo,tx,an,mem)===null,pregNo:preg?escuchaReaccion(preg,tx,an,mem)===null:true,
    pregResponde:preg?preg.react("do you like football"):'',trist:ESC_TRIST}});
chk('si lo que se contó es triste («my dog died… we were very sad») TODAS las reacciones son de acompañar, y con algo alegre ninguna',comp.n>=12&&comp.triste.every(x=>comp.trist.includes(x))&&comp.alegre.every(x=>!comp.trist.includes(x)),JSON.stringify([comp.triste,comp.alegre]));
chk('el saludo y la pregunta obligatoria no se tocan (siguen con su propia respuesta)',comp.saludoNo&&comp.pregNo&&/^Yes, I do\./.test(comp.pregResponde));

// ---- 6) saludo y despedida: una respuesta corta o distinta no traba la charla
await p.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})});
await p.reload();await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
await p.click('#t-speak');await p.click('#practice-start');
const ult=async()=>p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg.ex')].pop().innerText.replace(/^EXAMINADOR\s*/i,''));
const esperar=async()=>{await p.waitForFunction(()=>!document.getElementById('practice-mic').hidden||!document.getElementById('practice-start').hidden,null,{timeout:10000}).catch(()=>{})};
await esperar();
await p.fill('#practice-in',"I'm tired");await p.click('#practice-send');await esperar();await p.waitForTimeout(300);
const chat1=await p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg')].map(m=>m.className+': '+m.innerText.replace(/\s+/g,' ')).join('\n'));
chk('saludo con «I\'m tired»: el examinador lo acompaña («Don\'t worry…») y sigue con la hoja del tema, sin pedir otra oración',/Don't worry/.test(chat1)&&/topic form/.test(await ult())&&!/Good try|oración completa/.test(chat1),chat1);
// hasta el final: contestar «Thank you.» a la despedida tiene que cerrar la charla
const TODO="Yes, I did. It was great and I was happy. Last summer we went to the beach by car with my family and my friends, and I played at the shop. I don't like waiting, but I like swimming. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well. I felt tired at home, then we had lunch. The weather was sunny and warm. It cost a lot of money.";
let cierre=null;
for(let i=0;i<120;i++){
  if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
  await esperar();if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
  const x=await ult();
  if(/Goodbye|That's all|end of the exam|end of our conversation/.test(x)){cierre=x;await p.fill('#practice-in',"Thank you.");await p.click('#practice-send');await p.waitForTimeout(500);break}
  const r=/topic form/.test(x)?"Here you are.":/question for me|ask me/.test(x)?"Do you like dogs?":/what are we going to talk about|What is your topic|title of your topic/i.test(x)?"My dog Pipa":TODO;
  await p.fill('#practice-in',r);await p.click('#practice-send');await p.waitForTimeout(120);
}
await p.waitForFunction(()=>!document.getElementById('practice-start').hidden,null,{timeout:8000}).catch(()=>{});
const fin=await p.evaluate(()=>({listo:!document.getElementById('practice-start').hidden,chat:[...document.querySelectorAll('#practice-chat .msg')].map(m=>m.innerText.replace(/\s+/g,' ')).slice(-4).join(' | ')}));
chk('despedirse con «Thank you.» cierra la charla (antes pedía «Goodbye»): «'+(cierre||'').slice(0,40)+'»',cierre&&fin.listo&&!/Goodbye!? You can|Good try/.test(fin.chat),JSON.stringify(fin));
await t.ctx.close();

// ---- 7) textos para la IA y la pantalla de estudio
t=await pagina();p=t.p;
const ia=await p.evaluate(()=>({sis:SISTEMA_IA,ev:SISTEMA_EVAL}));
chk('la IA no dice el título del tema en el turno 3: pregunta «So, we\'re going to talk about…?» y ESPERA (como la guía oficial)',/turn 3:[^\n]*WAIT for the candidate to tell you the title/.test(ia.sis)&&!/name the title of the topic/.test(ia.sis));
chk('los dos textos de la IA piden no mostrar el género (ni «he/she» ni «contento/a»)',/Never guess the child's gender/.test(ia.sis)&&/Never show the child's gender/.test(ia.ev));
chk('el ejemplo de «pregunto» en la corrección ya no usa el presente perfecto',!/Have you ever been there/.test(ia.ev)&&/When did you start\?/.test(ia.ev));
const pg=await p.evaluate(()=>document.getElementById('v-study').textContent);   // (textContent: los temas cerrados no figuran en innerText)
chk('la pantalla de estudio: sin «Have you ever…», con la regla completa de la consonante doble, con «than» sólo cuando comparás y sin prometer que el examinador te da el momento de preguntar',
  !/Have you ever been to the mountains/.test(pg)&&/When did you start playing football\?/.test(pg)&&/una sílaba/.test(pg)&&/visit → visited/.test(pg)&&/cuando decís con qué comparás/.test(pg)&&/no siempre te lo piden/.test(pg)&&!/En el examen real también: preguntá/.test(pg));
chk('los temas de ejemplo ya no son casi las áreas de la conversación («My favourite sport: football», «My favourite food: pizza», «My hobby: drawing»)',await p.evaluate(()=>!IDEAS4.some(i=>/^My (favourite sport|favourite food|hobby):/.test(i.t))&&IDEAS4.length===12));
chk('las ilustraciones: «when i was six» no es un bebé, el uniforme no es una camiseta de running y «cheap» no tiene ojos de billete',await p.evaluate(()=>DIB["when i was six"]!=="👶"&&DIB.uniform!=="🎽"&&DIB.cheap!=="🤑"));
chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
