// Raphina con el examinador con IA (Firebase AI Logic simulado): el plan con la hoja del tema y los 2 temas, 17 turnos, sin dibujos, y la corrección con sus datos.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const MOCK=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),integer:()=>({t:'integer'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  if(/You have just examined/.test(sys)){window.__eval={sys,user:req.contents[0].parts[0].text};
    return {response:{text:()=>JSON.stringify({comprension:9,gramatica:9,vocabulario:9,fluidez:9,pregunto:!!window.__preguntaTrue,resumen:'Muy bien.',bien:['Bien'],mejorar:[],repasar:['Pasado']})}}}
  if(!/turn=/.test(sys))return {response:{text:()=>'hi'}};
  (window.__sys=window.__sys||[]).push(sys);
  const k=+(/turn=(\\d+)/.exec(sys)||[0,0])[1];
  const t={reply:k>=18?'Thank you. Goodbye!':(k===5?'Look at this picture. What is he doing?':'Nice! Question number '+k+'?'),ok:true,tip:'',model:'',end:k>=18,picture:k===5?'🏊':'',hints:[],help:''};
  return {response:{text:()=>JSON.stringify(t)}};
}}}`;
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
async function pagina(){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK)));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true})});
  await p.goto(URL);await p.evaluate(()=>{window.say=async t=>{}});
  await p.evaluate(()=>{temaGuardar({t:"My dog Pipa",p:[["How we got her","pasado"],["What she likes to eat","gustos"],["How often we walk","frecuencia"],["Pipa and my cat: who is faster?","comparar"]]})});
  return {p,ctx};
}
async function correr(p,pre,pregunta){
  await p.click(pre==='oral-'?'#t-exam':'#t-speak');
  await p.evaluate(x=>{const t=document.getElementById(x+'tap');if(t)t.checked=true;const i=document.getElementById(x+'ia');if(i)i.checked=true},pre);
  await p.click('#'+pre+'start');
  await p.waitForSelector('#'+pre+'talk:not([hidden])',{timeout:20000});await p.click('#'+pre+'kb');await p.waitForTimeout(250);
  for(let i=0;i<30;i++){
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    await p.waitForSelector('#'+pre+'in:visible',{timeout:8000}).catch(()=>{});
    if(await p.evaluate(x=>!document.getElementById(x+'start').hidden,pre))break;
    await p.fill('#'+pre+'in',pregunta&&i===5?"Do you like dogs?":"Last summer we went to the beach and I played with my dog.");await p.click('#'+pre+'send');await p.waitForTimeout(250);
  }
  await p.waitForSelector('#'+pre+'chat .msg.nota',{timeout:25000}).catch(()=>{});
}
// ---- 1) el examen con IA, sin hacer ninguna pregunta
let t=await pagina();let p=t.p;
await correr(p,'practice-',false);
const sys=await p.evaluate(()=>window.__sys||[]);
const plan=s=>(s.split('SESSION PLAN (chosen by the page')[1]||'').split('\nturn=')[0];
chk('la charla con IA llegó hasta la nota ('+sys.length+' turnos pedidos)',sys.length>=18&&await p.evaluate(()=>!!document.querySelector('#practice-chat .msg.nota')));
chk('el sistema es el del Grade 4 y habla de Raphina (no de Felu)',sys.every(s=>/Grade 4 oral exam \(CEFR A2\.2/.test(s)&&/Raphina/.test(s)&&!/Felu/.test(s)));
chk('el plan trae la hoja del tema (título y 4 puntos con su función) y los 2 temas de la conversación',sys.every(s=>{const q=plan(s);return /title "My dog Pipa"/.test(q)&&(q.match(/ point \d: /g)||[]).length===4&&/How we got her/.test(q)&&/talking about past events/.test(q)&&/expressing simple comparisons/.test(q)&&/FIRST CONVERSATION AREA/.test(q)&&/SECOND CONVERSATION AREA/.test(q)}));
chk('el plan es el mismo en todos los turnos y «turn=N max=17» aparece una sola vez',sys.every(s=>plan(s)===plan(sys[0])&&(s.match(/turn=\d+ max=17/g)||[]).length===1));
chk('no se le pasa la lista de dibujos y, aunque la IA mande uno, no se muestra',sys.every(s=>!/PICTURES AVAILABLE/.test(s))&&await p.evaluate(()=>!document.querySelector('#practice-chat .bigpic')));
const ev=await p.evaluate(()=>window.__eval);
chk('la corrección recibe el sistema del Grade 4, el nombre «RAPHINA:» y los datos del lenguaje del grado',ev&&/Grade 4 oral exam/.test(ev.sys)&&/RAPHINA: /.test(ev.user)&&/GRADE 4 LANGUAGE FOUND BY THE APP/.test(ev.user)&&/Raphina answered/.test(ev.user)&&/past tense forms: [1-9]/.test(ev.user));
const nota=await p.evaluate(()=>({n:document.querySelector('#practice-chat .nota-num').childNodes[0].textContent,c:[...document.querySelectorAll('#practice-chat .nc b')].map(x=>+x.textContent),aj:(document.querySelector('.nota-aj')||{}).innerText||''}));
chk('sin ninguna pregunta de quien rinde, «Entender y responder» no pasa de 6 aunque la IA ponga 9 (nota '+nota.n+')',nota.c[0]===6&&nota.c[1]===9);
chk('la nota se guarda con la clave de este módulo y no con la de Felu',await p.evaluate(()=>{const a=JSON.parse(localStorage.getItem("trinity_g4_notas")||"[]");return a.length===1&&localStorage.getItem("trinity_notas")===null&&localStorage.getItem("trinity_vistas")===null&&!!localStorage.getItem("trinity_g4_vistas")}));
chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));await t.ctx.close();

// ---- 2) haciéndole una pregunta al examinador: no hay tope
t=await pagina();p=t.p;await p.evaluate(()=>{window.__preguntaTrue=true});
await correr(p,'practice-',true);
const nota2=await p.evaluate(()=>({c:[...document.querySelectorAll('#practice-chat .nc b')].map(x=>+x.textContent)}));
chk('con una pregunta suya al examinador, «Entender y responder» queda en 9',nota2.c[0]===9);
await t.ctx.close();

// ---- 3) el examen oral (pestaña Examen) también usa la IA con el mismo plan
t=await pagina();p=t.p;await p.evaluate(()=>{window.__preguntaTrue=true});
await correr(p,'oral-',true);
const sys3=await p.evaluate(()=>window.__sys||[]);
chk('el examen oral con IA tiene el mismo plan y termina con nota ('+sys3.length+' turnos)',sys3.length>=18&&/title "My dog Pipa"/.test(sys3[0])&&await p.evaluate(()=>!!document.querySelector('#oral-chat .msg.nota')));
await t.ctx.close();

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
