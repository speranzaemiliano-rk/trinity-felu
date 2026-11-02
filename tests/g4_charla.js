// Raphina: una charla completa con el examinador, escribiendo las respuestas (sin micrófono ni IA): la hoja del tema, los 4 puntos en pantalla,
// la pregunta de quien rinde, los pasos «solo», las pistas de la gramática del grado, «Of course.» y el examen oral.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
const TODO="Yes, I did. It was great and I was happy. Last summer we went to the beach by car with my family and my friends, and I played at the shop. I don't like waiting, but I like swimming. I'm going to travel next year. My dog is bigger than my cat and the best. I always play twice a week quickly and well. I felt tired at home, then we had lunch. The weather was sunny and warm. It cost a lot of money.";   // una respuesta «completa»: g4_banco.js comprueba que cumple lo que exige CADA pregunta del banco
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
async function pagina(){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[]});
  await p.goto(URL);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
  return {p,ctx};
}
// responde hasta que termina la charla; elegir(ultimaDelExaminador,ctx,n) devuelve lo que se escribe
async function charla(p,pre,elegir){
  const log=[];
  for(let i=0;i<220;i++){
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    // se espera a que el examinador esté esperando de verdad una respuesta (el cartel «Escribí tu respuesta…») o a que termine la charla
    await p.waitForFunction(x=>!document.getElementById(x+'mic').hidden||!document.getElementById(x+'start').hidden,pre,{timeout:10000}).catch(()=>{});
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    const est=await p.evaluate(x=>{const ex=[...document.querySelectorAll('#'+x+'chat .msg.ex')].pop();return ex?{t:ex.innerText.replace(/^EXAMINADOR\s*/i,''),ctx:(ex.querySelector('.ctx')||{}).textContent||''}:{t:'',ctx:''}},pre);
    const r=elegir(est.t,est.ctx,i);log.push({q:est.t,ctx:est.ctx,r});
    await p.fill('#'+pre+'in',r);await p.click('#'+pre+'send');await p.waitForTimeout(150);
  }
  return log;
}
const TIP_DE={pasado:/pasado/,futuro:/going to/,gustos:/te gusta/,comparar:/Comparalo/,frecuencia:/cada cuánto/};
let t=await pagina();const p=t.p;

// ---- la hoja se completa desde la pantalla
await p.click('#t-speak');
await p.fill('#temaTitulo','My dog Pipa');
const puntos=[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]];
for(let i=0;i<4;i++){await p.fill('#temaP'+(i+1),puntos[i][0]);await p.selectOption('#temaT'+(i+1),puntos[i][1])}
chk('la hoja se guarda en el equipo',await p.evaluate(()=>{const f=temaLeer();return f&&f.t==="My dog Pipa"&&f.p.length===4&&f.p[3][1]==="comparar"}));
chk('el aviso de la hoja dice que está lista',/La hoja está lista/.test(await p.textContent('#temaAviso')));

// ---- charla completa de práctica
await p.click('#practice-start');
let pedirRepetir=true,primerPunto=true,errorForzado=null,preguntaAntes="";
const log=await charla(p,'practice-',(q,ctx,i)=>{
  if(/topic form/.test(q))return "Here you are.";
  if(/what are we going to talk about|What is your topic|title of your topic/i.test(q))return "My dog Pipa";
  if(/question for me|ask me/.test(q))return "Do you like dogs?";
  if(ctx&&primerPunto){primerPunto=false;errorForzado=ctx;return "yes ok"}   // primer punto: respuesta floja a propósito
  if(!ctx&&pedirRepetir&&i>10&&!/Goodbye|how are you|\bwhat do you like\b/i.test(q)&&!/^(Of course|Sure|No problem)/.test(q)){pedirRepetir=false;preguntaAntes=q;return "Sorry, can you repeat, please?"}
  if(/Goodbye|That's all|end of the exam/.test(q))return "Goodbye!";
  if(/how are you/.test(q))return "I'm fine, thank you. And you?";
  return TODO;
});
const chat=await p.evaluate(()=>[...document.querySelectorAll('#practice-chat > *')].map(e=>({c:e.className,t:e.innerText.replace(/\s+/g,' ').trim().slice(0,160),ctx:(e.querySelector&&e.querySelector('.ctx'))?e.querySelector('.ctx').textContent:''})));
const exs=chat.filter(x=>/msg ex/.test(x.c));
chk('la charla terminó sola y mostró el resumen ('+log.length+' respuestas)',/Terminaste la conversación/.test(chat.map(x=>x.t).join(' '))&&log.length>=17);
// los 4 puntos se ven escritos arriba de cada pregunta
const ctxs=[...new Set(exs.map(x=>x.ctx).filter(Boolean))];
chk('cada uno de los 4 puntos se ve en pantalla («📌 …»): '+JSON.stringify(ctxs.filter(c=>!/«/.test(c))),puntos.every(([pt])=>ctxs.includes('📌 '+pt)));
chk('el título del tema se ve («📌 «My dog Pipa»»)',ctxs.some(c=>/«My dog Pipa»/.test(c)));
chk('el texto del tema queda a la vista aunque el examinador se esconda (la clase .ctx no se oculta en el examen)',await p.evaluate(()=>{const e=document.createElement('div');e.className='msg ex hide';e.innerHTML='<span class="ctx">📌 x</span>texto';document.getElementById('practice-chat').appendChild(e);const c=getComputedStyle(e.querySelector('.ctx')),m=getComputedStyle(e);const ok=c.color!==m.color||c.webkitTextFillColor!=='rgba(0, 0, 0, 0)';e.remove();return ok}));
// pasos «solo»: el examinador anuncia el tema y sigue sin esperar respuesta
const soloIdx=chat.map((x,i)=>/msg ex/.test(x.c)&&/(Let's|let's) talk about (holidays|shopping|school and work|hobbies and sports|food|the weekend)/.test(x.t)?i:-1).filter(i=>i>=0);
chk('hay 2 anuncios de tema y después de cada uno viene otra pregunta del examinador (sin respuesta en el medio)',soloIdx.length===2&&soloIdx.every(i=>/msg ex/.test(chat[i+1].c)||/msg hint/.test(chat[i+1].c)));
chk('la pregunta de quien rinde al examinador recibe una respuesta del examinador',chat.some((x,i)=>/msg kid/.test(x.c)&&/Do you like dogs\?/.test(x.t)&&/msg ex/.test((chat[i+1]||{}).c)&&/Yes|like it/.test(chat[i+1].t)));
// pistas de gramática: la respuesta floja del primer punto
const tipoFlojo=(puntos.find(([pt])=>'📌 '+pt===errorForzado)||[])[1];
chk('una respuesta floja en un punto de «'+(tipoFlojo||'?')+'» recibe la pista del grado',tipoFlojo&&chat.some(x=>/msg tip/.test(x.c)&&/Casi/.test(x.t)&&TIP_DE[tipoFlojo].test(x.t)),JSON.stringify(chat.filter(x=>/msg tip/.test(x.c)).map(x=>x.t.slice(0,90))));
chk('las respuestas completas no reciben pistas (sólo la floja: '+chat.filter(x=>/msg tip/.test(x.c)&&/Casi/.test(x.t)).length+' «Casi»)',chat.filter(x=>/msg tip/.test(x.c)&&/Casi/.test(x.t)).length===1);
// «Of course.» y la misma pregunta
const iRep=chat.findIndex(x=>/msg kid/.test(x.c)&&/Sorry, can you repeat/.test(x.t));
chk('al pedir que repita: «Of course.» y la misma pregunta otra vez',iRep>0&&/^(EXAMINADOR )?(Of course|Sure|No problem)\./i.test(chat[iRep+1].t)&&chat[iRep+2].t.replace(/^EXAMINADOR\s*/i,'').includes(preguntaAntes.slice(0,25)),preguntaAntes.slice(0,40));
// el rótulo de la barra de avance
chk('la nota se guarda con la clave de este módulo y no toca la de Felu',await p.evaluate(()=>MOD.notasKey==="trinity_g4_notas"&&localStorage.getItem("trinity_notas")===null));
chk('lo que dijo el examinador es todo en inglés y sin textos de Felu',(await p.evaluate(()=>window.__dichos)).every(x=>!/Felu/.test(x)));
chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
await t.ctx.close();

// ---- «Sólo mi tema» y «Sólo la conversación» en la pantalla
t=await pagina();const q=t.p;
await q.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})});
await q.reload();await q.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});
await q.click('#t-speak');await q.selectOption('#g4modo','tema');
chk('con «Sólo mi tema» el selector de conversación se esconde',await q.evaluate(()=>document.getElementById('g4area').closest('label').hidden));
await q.click('#practice-start');
const l2=await charla(q,'practice-',(qq,ctx)=>/topic form/.test(qq)?"Here you are.":/talk about|your topic\?/.test(qq)&&!ctx?"My dog Pipa":/question for me|ask me/.test(qq)?"Do you like dogs?":/Goodbye|That's all|end of the exam/.test(qq)?"Goodbye!":/how are you/.test(qq)?"I'm fine, thank you.":TODO);
chk('«Sólo mi tema»: no hay anuncios de temas de conversación ('+l2.length+' respuestas)',!(await q.evaluate(()=>/(Let's|let's) talk about (holidays|shopping|school and work|hobbies and sports|food|the weekend)/.test(document.getElementById('practice-chat').innerText))));
await q.selectOption('#g4modo','conv');await q.selectOption('#g4area','food');
chk('con «Sólo la conversación» vuelve a verse el selector',await q.evaluate(()=>!document.getElementById('g4area').closest('label').hidden));
await q.click('#practice-start');
const l3=await charla(q,'practice-',(qq)=>/Goodbye|That's all|end of the exam/.test(qq)?"Goodbye!":/how are you/.test(qq)?"I'm fine, thank you.":TODO);
const txt3=await q.evaluate(()=>document.getElementById('practice-chat').innerText);
chk('«Sólo la conversación» con Food: «Let\'s talk about food.» y ninguna pregunta del tema ('+l3.length+' respuestas)',/Let's talk about food\./.test(txt3)&&!/topic form/.test(txt3)&&l3.length>=6);
chk('sin errores de página',q.errs.length===0,JSON.stringify(q.errs));
await t.ctx.close();

// ---- el examen oral (pestaña Examen): sin ayudas y sin pistas
t=await pagina();const x=t.p;
await x.click('#t-exam');await x.click('#oral-start');
const l4=await charla(x,'oral-',(qq,ctx)=>/topic form/.test(qq)?"Here you are.":/talk about|your topic\?/.test(qq)&&!ctx?"My dog":/question for me|ask me/.test(qq)?"Do you like dogs?":/Goodbye|That's all|end of the exam/.test(qq)?"Goodbye!":/how are you/.test(qq)?"I'm fine, thank you.":"yes");
const ch4=await x.evaluate(()=>document.getElementById('oral-chat').innerText);
chk('el examen oral termina solo ('+l4.length+' respuestas) y no da pistas aunque las respuestas sean flojas',/Terminaste|Distinction|Merit|Pass|Todavía no/.test(ch4)&&!/Casi\./.test(ch4)&&!(await x.evaluate(()=>document.querySelector('#oral-chat .msg.hint'))));
chk('en el examen el texto del examinador está escondido pero el «📌 punto» se ve',await x.evaluate(()=>{const e=[...document.querySelectorAll('#oral-chat .msg.ex')].filter(m=>m.querySelector('.ctx'))[0];return !!e&&e.classList.contains('hide')}));
chk('sin errores de página',x.errs.length===0,JSON.stringify(x.errs));
await t.ctx.close();

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
