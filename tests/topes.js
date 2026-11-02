// Topes objetivos: la IA simulada infla SIEMPRE todo a 9 (peor caso). La página tiene que frenarla según lo que de verdad dijo el chico.
const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const MOCK=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),integer:()=>({t:'integer'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  if(/You have just examined Felu/.test(sys)){window.__evalTexto=req.contents[0].parts[0].text;
    return {response:{text:()=>JSON.stringify({comprension:9,gramatica:9,vocabulario:9,fluidez:9,pregunto:true,resumen:'Todo perfecto.',bien:['Bien'],mejorar:[],repasar:['Nada']})}}}
  if(!/turn=/.test(sys))return {response:{text:()=>'hi'}};
  const k=+(/turn=(\\d+)/.exec(sys)||[0,0])[1];const fin=window.__finEn||8;const bien=window.__okTurnos!==false;
  const t={reply:k>=fin?'Thank you. Goodbye!':'Nice! Question number '+k+'?',ok:bien,tip:bien?'':'Probá con una oración.',model:bien?'':'I live in a house.',end:k>=fin,picture:'',hints:[],help:''};
  return {response:{text:()=>JSON.stringify(t)}};
}}}`;
const PERFILES={
 fuerte:{r:['I live in a house with a garden','There are four rooms','The supermarket is near my house','I get up at seven and then I go to school','I can play football and swim','It is sunny today','Yes, I do. Do you like football?']},
 medio:{r:['I have two sister','He play football','my house is big','yes','I go to school at eight','It is sunny','Do you like pizza?']},
 flojo:{r:['yes','ehh','blue','football','mi casa es grande','no sé',"I don't know"]},
 espanol:{r:['mi casa es grande','yo tengo un perro','no sé','me gusta el fútbol','vivo con mi mamá','hola profe','mi escuela es linda']},
 errores:{r:['I live in a house with a garden','There are four rooms','The supermarket is near my house','I get up at seven and then I go to school','I can play football and swim','It is sunny today','Yes, I do. Do you like football?'],okTurnos:false}
};
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const res=[];const chk=(n,v)=>{res.push(v);console.log(v?'✓':'✗',n)};
const corre=async(nombre)=>{
  const P=PERFILES[nombre];const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["rapido","fuerte"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK)));
  await p.addInitScript(o=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__finEn=8;if(o.okTurnos===false)window.__okTurnos=false},P);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','index.html'));await p.evaluate(()=>{window.say=async t=>{}});
  await p.click('#t-speak');await p.evaluate(()=>{document.getElementById('practice-tap').checked=true});await p.click('#practice-start');
  await p.waitForSelector('#practice-talk:not([hidden])',{timeout:20000});await p.click('#practice-kb');await p.waitForTimeout(250);
  for(const r of P.r){await p.waitForSelector('#practice-in:visible',{timeout:8000});await p.fill('#practice-in',r);await p.click('#practice-send');await p.waitForTimeout(450)}
  await p.waitForSelector('#practice-chat .msg.nota',{timeout:20000});
  const n=await p.evaluate(()=>{const e=document.querySelector('#practice-chat .msg.nota');return {num:e.querySelector('.nota-num').childNodes[0].textContent,letra:e.querySelector('.nota-let b').textContent,
    c:[...e.querySelectorAll('.nc b')].map(x=>+x.textContent),aj:(e.querySelector('.nota-aj')||{}).innerText||'',txt:window.__evalTexto}});
  console.log('  ['+nombre+'] nota',n.num,n.letra,'criterios',JSON.stringify(n.c),'|',(n.aj||'(sin ajustes)').slice(0,230));
  await ctx.close();return {n,errs}};
let r;
r=await corre('fuerte');chk('FUERTE: sin topes → nota 9 (A) y sin ajustes',r.n.num==='9'&&r.n.letra==='A'&&!r.n.aj&&r.errs.length===0);
chk('FUERTE: la IA recibe los datos contados (7 respuestas, 0 sueltas, promedio de palabras)',/FACTS COUNTED BY THE APP: Felu answered 7 times; 0 answers were a single word; there was no answer 0 times; 0 answers had Spanish words; "I don't know" was said 0 times/.test(r.n.txt)&&/TRANSCRIPT:\nEXAMINER:/.test(r.n.txt));
r=await corre('medio');chk('MEDIO (1 palabra suelta de 7): no se aplica ningún tope',r.n.num==='9'&&!r.n.aj);
r=await corre('flojo');chk('FLOJO (4 de 7 respuestas de una palabra): fluidez ≤3, resto ≤5 → nota 4,5 y letra D',r.n.c[3]===3&&r.n.c[1]<=5&&r.n.c[0]<=5&&r.n.c[2]<=5&&r.n.num==='4,5'&&r.n.letra==='D');
chk('FLOJO: la tarjeta explica el tope',/una sola palabra o silencio/.test(r.n.aj)&&/Fluidez \(máx\. 3\)/.test(r.n.aj));
chk('FLOJO: la IA recibió «4 answers were a single word» y «Spanish»',/4 answers were a single word/.test(r.n.txt)&&/2 answers had Spanish words/.test(r.n.txt));
r=await corre('espanol');chk('ESPAÑOL (todo en español): los cuatro criterios ≤4 → nota 4 y letra D',r.n.c.every(x=>x<=4)&&r.n.letra==='D'&&/en español/.test(r.n.aj));
r=await corre('errores');chk('RESPUESTAS QUE NO COINCIDÍAN (juez por turno): «Entender y responder» ≤5',r.n.c[0]===5&&/no coincidían/.test(r.n.aj)&&r.n.c[1]===9);
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
