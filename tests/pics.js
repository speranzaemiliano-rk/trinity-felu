// Etapa 2: dibujos. La IA simulada se equivoca de cuatro formas distintas y la página tiene que arreglarlo.
const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const p=await b.newPage({viewport:{width:430,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  if(!/turn=/.test(sys))return {response:{text:()=>'hi'}};
  window.__sysUltimo=sys;
  const k=+(/turn=(\\d+)/.exec(sys)||[0,0])[1];
  window.__hist=window.__hist||{};window.__hist[k]=(req.contents||[]).map(c=>c.role+': '+c.parts[0].text);
  const base={ok:true,tip:'',model:'',end:false,hints:[],help:''};
  const T={
   1:{reply:'Hello Felu! How are you today?',picture:''},
   // 1) habla de un dibujo y NO manda ninguno
   2:{reply:'Nice! Look at this picture. What is he doing?',picture:''},
   // 2) manda un dibujo que no existe en la lista
   3:{reply:'Good. Look at the picture. What is her job?',picture:'🐉'},
   // 3) manda un dibujo válido pero no habla de él
   4:{reply:'I see. Do you like pizza?',picture:'🏊'},
   // 4) todo bien
   5:{reply:'Great. Look at this picture. What is she doing?',picture:'👩‍🍳'},
   6:{reply:'Thank you. Goodbye!',picture:'',end:true}
  };
  const t=Object.assign({},base,T[Math.min(k,6)]);
  return {response:{text:()=>JSON.stringify(t)}};
}}}`)));
await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});window.__dichos=[];});
await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(t)}});
await p.click('#t-speak');await p.evaluate(()=>{const c=document.getElementById('practice-tap');if(c)c.checked=true});await p.click('#practice-start');
await p.waitForSelector('#practice-talk:not([hidden])',{timeout:20000});
await p.click('#practice-kb');await p.waitForTimeout(300);
for(let i=0;i<7;i++){
  const fin=await p.evaluate(()=>!document.getElementById('practice-start').hidden);if(fin)break;
  await p.waitForSelector('#practice-in:visible',{timeout:15000}).catch(()=>{});
  await p.fill('#practice-in','I am swimming in the pool');await p.click('#practice-send');await p.waitForTimeout(700);
}
// cada burbuja del examinador con su dibujo
const r=await p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg.ex')].map(m=>({texto:m.innerText.replace(/\s+/g,' ').slice(0,70),dibujo:(m.querySelector('.bigpic')||{}).textContent||'',leyenda:!!m.querySelector('.piccap')})));
r.forEach((x,i)=>console.log(i+1,JSON.stringify(x)));
const h=await p.evaluate(()=>window.__hist);
console.log('--- lo que la IA recibe como historial ---');
for(const k of [3,4,5,6]){const l=(h[k]||[]).filter(x=>/PICTURE/.test(x));console.log('turno',k,'→',JSON.stringify(l))}
console.log('--- la lista de dibujos viaja en el sistema ---', await p.evaluate(()=>/PICTURES AVAILABLE/.test(window.__sysUltimo)&&/🏊 = a boy swimming/.test(window.__sysUltimo)));
console.log('errores de página:',errs);
// comprobaciones duras
const dib=r.map(x=>x.dibujo);
const trab=['👩‍⚕️','👨‍🚒','👩‍🏫','🧑‍✈️','👨‍🌾','👮','👨‍🍳','👷'];
const acc=['🏊','👩‍🍳','🧒⚽🧒','🚴','🧒📖','👩‍🎨','💃','🎸','🏃','🧒🍎','👧🎤','🧒📺'];
const ok=[
 ['turno 2 (mencionó un dibujo sin mandarlo): ahora hay dibujo de acción',acc.includes(dib[1])],
 ['turno 3 (dibujo inventado 🐉): se reemplazó por uno de trabajo',trab.includes(dib[2])],
 ['turno 4 (mandó 🏊 sin hablar del dibujo): no se muestra',dib[3]===''],
 ['turno 5 (dibujo correcto): se muestra tal cual',dib[4]==='👩‍🍳'],
 ['las burbujas con dibujo tienen leyenda',r.filter(x=>x.dibujo).every(x=>x.leyenda)],
 ['el historial le avisa a la IA qué se mostró (turno 2→3)',(h[3]||[]).some(x=>/PICTURE SHOWN TO THE CHILD: .* = a /.test(x))],
 ['no se anota un dibujo que no se mostró (turno 4→5)',!(h[5]||[]).some(x=>/🏊 = a boy swimming/.test(x)&&/pizza/.test(x))],
 ['sin errores de página',errs.length===0]
];
ok.forEach(([n,v])=>console.log(v?'✓':'✗',n));
await b.close();process.exit(ok.every(x=>x[1])?0:1)})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
