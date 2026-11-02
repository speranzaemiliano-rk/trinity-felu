// Examinador con IA: la página sortea el orden de los temas y una pregunta-idea de cada uno, y se lo pasa a la IA como «plan de la charla».
const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const MOCK=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),integer:()=>({t:'integer'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  if(/You have just examined Felu/.test(sys))return {response:{text:()=>JSON.stringify({comprension:8,gramatica:8,vocabulario:8,fluidez:8,pregunto:true,resumen:'Bien.',bien:['Bien'],mejorar:[],repasar:['Nada']})}};
  if(!/turn=/.test(sys))return {response:{text:()=>'hi'}};
  (window.__sys=window.__sys||[]).push(sys);
  const k=+(/turn=(\\d+)/.exec(sys)||[0,0])[1];const fin=window.__finEn||14;
  const t={reply:k>=fin?'Thank you. Goodbye!':'Nice! Question number '+k+'?',ok:true,tip:'',model:'',end:k>=fin,picture:'',hints:[],help:''};
  return {response:{text:()=>JSON.stringify(t)}};
}}}`;
async function charla(b){
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK)));
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__finEn=14});
  await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));await p.evaluate(()=>{window.say=async t=>{}});
  return {p,ctx};
}
async function correr(t,mismaMemoria){
  const p=t.p;await p.click('#t-speak');await p.evaluate(()=>{document.getElementById('practice-tap').checked=true});await p.click('#practice-start');
  await p.waitForSelector('#practice-talk:not([hidden])',{timeout:20000});await p.click('#practice-kb');await p.waitForTimeout(250);
  for(let i=0;i<20;i++){
    if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    await p.waitForSelector('#practice-in:visible',{timeout:6000}).catch(()=>{});
    if(await p.evaluate(()=>!document.getElementById('practice-start').hidden))break;
    await p.fill('#practice-in','I live in a house with a garden').catch(()=>{});await p.click('#practice-send').catch(()=>{});await p.waitForTimeout(250);
  }
  await p.waitForSelector('#practice-chat .msg.nota',{timeout:20000}).catch(()=>{});
}
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const planes=[];
for(let v=0;v<5;v++){
  const t=await charla(b);
  if(v>0)await t.p.evaluate(m=>localStorage.setItem('trinity_vistas',m),planes.memoria||'{}');   // misma memoria entre «charlas» del mismo equipo
  await correr(t,true);
  const sys=await t.p.evaluate(()=>window.__sys||[]);
  const mem=await t.p.evaluate(()=>localStorage.getItem('trinity_vistas'));planes.memoria=mem;
  const r=await t.p.evaluate(()=>({plan:_planIA,bancoQ:MIDDLE.map(s=>s.q)}));
  const planTxt=(sys[0].split('SESSION PLAN')[1]||'').split('\nPICTURES AVAILABLE')[0];
  planes.push({sys,planTxt,errs:t.p.errs.slice(),hecho:await t.p.evaluate(()=>!!document.querySelector('#practice-chat .msg.nota')),planDespues:r.plan,banco:r.bancoQ});
  await t.ctx.close();
}
const P=planes[0];
const lineas=P.planTxt.split('\n').filter(l=>/^ turn \d+:/.test(l));
const turnos=lineas.map(l=>+/^ turn (\d+):/.exec(l)[1]);
const ideas=P.planTxt.split('\n').filter(l=>/Question idea/.test(l)).map(l=>/"(.+)"\s*$/.exec(l)[1]);
chk('la charla con IA llegó hasta la nota ('+planes.filter(x=>x.hecho).length+' de 5)',planes.every(x=>x.hecho));
chk('el sistema trae el «plan de la charla» (SESSION PLAN) con los 9 turnos 3,4,5,6,7,8,10,11,12',turnos.join()==='3,4,5,6,7,8,10,11,12');
chk('cada turno trae una pregunta-idea que existe en el banco ('+ideas.length+')',ideas.length===9&&ideas.every(q=>P.banco.includes(q)));
chk('las dos ideas de «lugares del barrio» son preguntas distintas y todas las ideas son distintas entre sí',new Set(ideas).size===9);
chk('el plan avisa que reemplaza el orden de la AGENDA y que los turnos 1, 2, 9, 13 quedan como estaban',/REPLACES the order of topics/.test(P.planTxt)&&/turns 1, 2, 9, 13/.test(P.planTxt));
chk('el plan es el mismo en todos los turnos de la charla (se sortea una sola vez)',P.sys.length>=10&&P.sys.every(s=>(s.split('SESSION PLAN')[1]||'').split('\nPICTURES AVAILABLE')[0]===P.planTxt));
chk('«turn=N max=14» sigue apareciendo una sola vez y la AGENDA de siempre sigue en el sistema',P.sys.every(s=>(s.match(/turn=\d+/g)||[]).length===1&&/AGENDA \(the real Grade 3 syllabus\)/.test(s)&&/PICTURES AVAILABLE/.test(s)));
chk('el plan se suelta al terminar la charla',P.planDespues==='');
const ordenes=new Set(planes.map(x=>x.planTxt.split('\n').filter(l=>/^ turn \d+:/.test(l)).map(l=>l.slice(9,25)).join('|')));
chk('el orden de los temas cambia de una charla a otra ('+ordenes.size+' órdenes distintos en 5)',ordenes.size>=4);
const todas=planes.map(x=>x.planTxt.split('\n').filter(l=>/Question idea/.test(l)).map(l=>/"(.+)"\s*$/.exec(l)[1]));
const repetidas=todas.slice(1).reduce((n,ideas2,i)=>n+ideas2.filter(q=>todas[i].includes(q)).length,0);
chk('las preguntas-idea no se repiten en la charla siguiente (repetidas: '+repetidas+')',repetidas===0);
chk('sin errores de página',planes.every(x=>x.errs.length===0));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
