// Si quien rinde le pregunta algo al examinador, en cualquier momento, el examinador lo contesta (escucha.js + turn()/conversation() del motor), en los dos módulos.
// Lo más importante es lo que NO debe pasar: una respuesta normal («I have a dog», «It is a big house», «when it is hot…») jamás se toma por una pregunta.
const {chromium}=require('playwright');const path=require('path');
const RAIZ=path.resolve(__dirname,'..');
const MODULOS=[
  {nom:'Felu (Grade 3)',url:process.env.URL_FELU||'file://'+path.join(RAIZ,'felu','index.html'),id:'g3'},
  {nom:'Raphina (Grade 4)',url:process.env.URL_RAPHINA||'file://'+path.join(RAIZ,'raphina','index.html'),id:'g4'}];
// lo que NO es una pregunta para el examinador
const NO_PREGUNTAS=["I have a dog","It is a big house","My mum has a car and my dad is a doctor","I do my homework every day","I go to the beach when it is hot","When it is sunny I play football",
  "There is a park near my house","She is my sister","My name is Felu","I live in a house with my family and I have a dog","I play football and my friends are the best","Have a nice day",
  "I know what you do","What I like is pizza","We are the champions","I was at the park with my friends","They have a big garden","He is the best player","This is my house","I like pizza and pasta",
  "I can swim and I can play the guitar","Yes","No, thank you","I don't know","Do my homework","Have lunch","Play football with my friends","Do the dishes","Have a shower","Where we live is very nice","My favourite food is the pizza","I like how it is","I think you are right",
  // pedir que se repita o que se explique NO es preguntarle algo al examinador
  "Can you repeat please","Sorry, can you repeat the question?","Pardon?","What?","I don't understand","What do you mean?","Can you say that again, please?","Excuse me?"];
// preguntas: [texto, ¿es TODO lo que dijo? (no contestó)]
const PREGUNTAS=[["What is your name?",true],["What's your name?",true],["Do you like football?",true],["do you like football",true],["How old are you?",true],["Where do you live?",true],["Where do you live",true],
  ["Sorry, what time do you get up?",true],["Excuse me, what time is it?",true],["Is your dog big?",true],["Can I ask you something?",true],["And you?",true],["What about you?",true],["Thank you. What is your name?",true],
  ["Does your mum like football?",true],["Did you go on holiday last summer?",true],["Which team do you like?",true],["How many friends do you have?",true],["Why do you like it?",true],["Have you got a dog?",true],
  ["What can't you do?",true],["What kind of music do you like?",true],["Who cooks pasta at your house?",true],["Is maths difficult for you?",true],["What new hobby or sport are you going to try?",true],["And what food don't you like?",true],
  ["I like football. And you?",false],["I like football and you",false],["My name is Felu, what is your name?",false],["My name is Felu what is your name",false],["Yes, I do. Do you?",false],["I'm fine how are you",false],
  ["I live in a flat near the park. Do you live in a house?",false],["I play tennis, what about you?",false]];
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
async function pagina(url){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true})});
  await p.goto(url);await p.evaluate(()=>{window.say=async t=>{}});
  return {p,ctx};
}
for(const M of MODULOS){
  console.log('\n===== '+M.nom);
  let t=await pagina(M.url);let p=t.p;
  // ---- 1) qué es una pregunta y qué no
  const det=await p.evaluate(([nop,pre])=>({
    nop:nop.map(x=>[x,escuchaPregunta(x).pregunta]),
    pre:pre.map(([x,solo])=>{const e=escuchaPregunta(x);return [x,e.pregunta,e.solo,solo,e.q]})}),[NO_PREGUNTAS,PREGUNTAS]);
  const mal1=det.nop.filter(([x,v])=>v).map(x=>x[0]);
  chk('ninguna de las '+NO_PREGUNTAS.length+' frases normales (o pedidos de repetir) se toma por una pregunta al examinador',mal1.length===0,JSON.stringify(mal1));
  const mal2=det.pre.filter(([x,v])=>!v).map(x=>x[0]);
  chk('las '+PREGUNTAS.length+' preguntas se reconocen',mal2.length===0,JSON.stringify(mal2));
  const mal3=det.pre.filter(([x,v,s,esp])=>v&&s!==esp).map(x=>[x[0],x[2]]);
  chk('se distingue la que es TODO lo que dijo («What is your name?») de la que viene después de contestar («I like football. And you?»)',mal3.length===0,JSON.stringify(mal3));
  // ---- 2) qué contesta
  const ans=await p.evaluate(()=>{const R0=Math.random;Math.random=()=>0.1;try{const a=x=>escuchaResponder(x);
    return {nombre:a("What is your name?"),gusta:a("Do you like football?"),edad:a("How old are you?"),vive:a("Where do you live?"),y:a("And you?"),que:a("What about you?"),perro:a("Is your dog big?"),puedo:a("Can I ask you something?"),
      o:a("Do you like dogs or cats?"),hora:a("What time do you get up?"),combo:a("I like football. And you?"),llevaEnMedio:a("My name is Felu, what is your name?"),nada:a("I have a dog"),
      gracias:ESC_GRACIAS,vuelta:ESC_VUELTA}}finally{Math.random=R0}});
  chk('contesta con sentido: nombre («'+ans.nombre+'»), «Do you like football?» («'+ans.gusta+'»), edad («'+ans.edad+'»), dónde vive («'+ans.vive+'»), «Is your dog big?» («'+ans.perro+'»), «Can I ask you something?» («'+ans.puedo+'»)',
    /Alex/.test(ans.nombre)&&/^Yes, I do/.test(ans.gusta)&&/thirty-five/.test(ans.edad)&&/^I live in/.test(ans.vive)&&ans.perro==="Yes, it is."&&ans.puedo==="Yes, you can.");
  chk('«And you?» y «What about you?» se agradecen («'+ans.y+'» / «'+ans.que+'»); «dogs or cats» elige («'+ans.o+'»); la hora contesta una hora («'+ans.hora+'»)',ans.gracias.includes(ans.y)&&ans.gracias.includes(ans.que)&&/^(Both|I like both)/i.test(ans.o)&&/seven/.test(ans.hora));
  chk('si dice algo y después pregunta, contesta la pregunta («'+ans.combo+'» / «'+ans.llevaEnMedio+'»); si no preguntó nada, no contesta nada ('+ans.nada+')',ans.gracias.includes(ans.combo)&&/Alex/.test(ans.llevaEnMedio)&&ans.nada===null);
  chk('lo que puede contestar tiene su audio grabado (la lista de frases)',await p.evaluate(()=>{const sin=[];escuchaFrases().forEach(x=>{if(_claveAudio(x)===null)sin.push(x)});window.__sinAudio=[...new Set(sin)];return sin.length===0}),JSON.stringify(await p.evaluate(()=>window.__sinAudio.slice(0,6))));
  chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();

  // ---- 3) una charla completa tecleada: una pregunta suelta, una respuesta con pregunta, pedir que repita y la pregunta del final
  t=await pagina(M.url);p=t.p;
  await p.evaluate(()=>{Math.random=()=>0.1});
  if(M.id==='g4')await p.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})});
  await p.reload();await p.evaluate(()=>{window.say=async t=>{};Math.random=()=>0.1});
  await p.click('#t-speak');await p.click('#practice-start');
  const BUENA=M.id==='g4'?"I have a dog and I like playing football at the park. Last summer we went to the beach by car. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well.":"I have a dog and I play football with my friends at the park";
  const msgsE=()=>p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg.ex')].map(e=>e.innerText.replace(/^EXAMINADOR\s*/i,'').trim()));
  const esperar=async n=>{await p.waitForFunction(k=>document.querySelectorAll('#practice-chat .msg.ex').length>=k&&(!document.getElementById('practice-mic').hidden||!document.getElementById('practice-start').hidden),n,{timeout:15000})};
  const enviar=async txt=>{await p.fill('#practice-in',txt);await p.click('#practice-send')};
  const esContenido=q=>!/^Good try!/.test(q)&&!/How are you|name\?|topic form|question for me|ask me|what are we going to talk about|your topic|title of your topic|Goodbye|That's all|end of the exam|end of our conversation/i.test(q);   // (si lo último que dijo es «Good try!» está en el segundo intento: ahí no se prueba nada)
  const norm=x=>String(x||'').replace(/\s+/g,' ').trim(),igual=(a,b)=>norm(a).slice(-30)===norm(b).slice(-30);   // (la misma pregunta; el globo original puede traer además el cartel del tema)
  const log={suelta:null,combo:null,repetir:null,fin:null};let cont=0,hecho={suelta:false,combo:false,repetir:false};
  await esperar(1);
  for(let i=0;i<260;i++){
    if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    const antes=await msgsE();const q=antes[antes.length-1]||'';let r;
    if(/How are you/.test(q))r="I'm fine, thank you.";else if(/name\?/.test(q)&&!/dog/.test(q))r="My name is Felu.";else if(/topic form/.test(q))r="Here you are.";
    else if(/question for me|ask me/.test(q))r="Do you like dogs?";
    else if(/what are we going to talk about|your topic|title of your topic/i.test(q))r="My dog Pipa";else if(/Goodbye|That's all|end of the exam|end of our conversation/.test(q))r="Goodbye!";
    else if(esContenido(q)&&++cont===2&&!hecho.suelta){hecho.suelta=true;r="What is your name?";log.suelta={q,antes:antes.length}}
    else if(esContenido(q)&&cont>=4&&!hecho.combo){hecho.combo=true;r=BUENA+" And you?";log.combo={q,antes:antes.length,intento:true}}
    else if(esContenido(q)&&cont>=7&&!hecho.repetir){hecho.repetir=true;r="Sorry, can you repeat, please?";log.repetir={q,antes:antes.length}}
    else r=BUENA;
    await enviar(r);
    await p.waitForFunction(k=>document.querySelectorAll('#practice-chat .msg.ex').length>k||!document.getElementById('practice-start').hidden,antes.length,{timeout:15000}).catch(()=>{});
    await p.waitForTimeout(110);
    if(!(await p.evaluate(()=>!document.getElementById('practice-start').hidden)))await esperar(antes.length+1);
    if(log.suelta&&!log.suelta.despues&&hecho.suelta){log.suelta.despues=await msgsE()}
    if(log.combo&&log.combo.intento&&hecho.combo){   // si el paso pedía una respuesta específica («Good try!») ese intento no sirve: se prueba en el próximo paso
      const d=await msgsE();if(d.slice(log.combo.antes).some(x=>/^Good try!/.test(x))){hecho.combo=false;log.combo=null}else{log.combo.despues=d;log.combo.intento=false}}
    if(log.repetir&&!log.repetir.despues&&hecho.repetir){log.repetir.despues=await msgsE()}
  }
  const E=await msgsE();
  const [vuelta,gracias,repite]=await p.evaluate(()=>[ESC_VUELTA,ESC_GRACIAS,REPITE]);
  // pregunta suelta: contesta, vuelve a la pregunta y la repite
  const s=log.suelta,sd=s&&s.despues?s.despues.slice(s.antes,s.antes+3):[];
  chk('«What is your name?» en medio de la charla: el examinador contesta («'+(sd[0]||'—')+'»), dice que vuelve a su pregunta («'+(sd[1]||'—')+'») y repite la pregunta que había hecho',
    sd.length===3&&/Alex/.test(sd[0])&&vuelta.includes(sd[1])&&igual(sd[2],s&&s.q),JSON.stringify({sd,preguntaOriginal:s&&s.q}));
  // y la charla siguió: lo que viene después NO es la misma pregunta
  const sig=s?E[s.antes+3]:'';
  chk('...y después de que contesta lo que se le había preguntado, sigue con otra cosa («'+(sig||'—')+'»)',!!sig&&!igual(sig,s&&s.q)&&!vuelta.includes(sig));
  // respuesta + pregunta: reacciona a la respuesta y contesta la pregunta, sin volver a preguntar lo mismo
  const c=log.combo,cd=c&&c.despues?c.despues.slice(c.antes):[];
  const iG=cd.findIndex(x=>gracias.includes(x));
  chk('contó algo y preguntó «And you?»: el examinador contesta («'+(cd[iG]||'—')+'») sin repetir su pregunta ni pedirle que conteste de nuevo',iG>=0&&!cd.some(x=>vuelta.includes(x))&&cd.filter(x=>igual(x,c&&c.q)).length===0,JSON.stringify(cd));
  // pedir que repita sigue igual: «Of course.» y la misma pregunta
  const r2=log.repetir,rd=r2&&r2.despues?r2.despues.slice(r2.antes,r2.antes+2):[];
  chk('«Sorry, can you repeat, please?» sigue funcionando como siempre («'+(rd[0]||'—')+'» y la misma pregunta)',rd.length===2&&repite.includes(rd[0])&&igual(rd[1],r2&&r2.q),JSON.stringify({rd,preguntaOriginal:r2&&r2.q}));
  // en toda la charla: sólo las dos veces que se preguntó; nada de «Yes, I think so.» ni agradecimientos de más
  const nV=E.filter(x=>vuelta.includes(x)).length,nG=E.filter(x=>gracias.includes(x)).length,nT=E.filter(x=>/^Yes, I think so\.$/.test(x)).length;
  chk('en toda la charla ('+E.length+' frases) el examinador sólo volvió a su pregunta una vez ('+nV+'), agradeció una vez ('+nG+') y no contestó nada que no le preguntaron ('+nT+')',nV===1&&nG===1&&nT===0);
  chk('la pregunta del final («Do you like dogs?», que el examen pide) se contesta como siempre y no se le suma un «volvé a mi pregunta»',hecho.suelta&&E.some(x=>/^Yes, I do/.test(x)&&true)&&nV===1);
  chk('la charla termina sola y sin errores de página',await p.evaluate(()=>!document.getElementById('practice-start').hidden)&&p.errs.length===0,JSON.stringify(p.errs));
  await t.ctx.close();
}
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
