const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const p=await b.newPage({viewport:{width:430,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true})});
await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
await p.evaluate(()=>{window.say=async()=>{}});            // sin voz: la prueba es del guion
await p.click('#t-speak');
await p.evaluate(()=>{const c=document.getElementById('practice-ia');if(c)c.checked=false});   // charla guiada (sin IA)
await p.click('#practice-start');
await p.waitForTimeout(800);
// modo escribir
const turnos=[];
for(let i=0;i<90;i++){
  const hecho=await p.evaluate(()=>!document.getElementById('practice-start').hidden);   // terminó: vuelve el botón «Empezar»
  if(hecho)break;
  await p.waitForSelector('#practice-in:visible',{timeout:15000}).catch(()=>{});
  const visible=await p.evaluate(()=>!document.getElementById('practice-type').hidden);
  if(!visible){await p.click('#practice-kb').catch(()=>{});await p.waitForTimeout(300)}
  await p.fill('#practice-in','I live with my mum and I get up at seven o\'clock and then I play football. It was good. Yes I can swim. It is sunny. It is the first of November. Do you like your job? He is swimming she is cooking they are playing football She is a doctor');
  await p.click('#practice-send');
  await p.waitForTimeout(450);
}
await p.waitForFunction(()=>/Terminaste la conversación|Nota de la charla|resumen simple/.test(document.getElementById('practice-chat').innerText),null,{timeout:60000});   // espera la corrección (o su aviso)
const res=await p.evaluate(()=>{
  const ex=[...document.querySelectorAll('#practice-chat .msg.ex')].map(m=>m.innerText.replace(/^EXAMINADOR\s*/i,'').replace(/\n/g,' ').slice(0,95));
  return {preguntas:ex,dibujos:[...document.querySelectorAll('#practice-chat .bigpic')].map(x=>x.textContent),ayudas:document.querySelectorAll('#practice-chat .msg.hint').length,fichas:document.querySelectorAll('#practice-chat .hchip').length,fin:document.getElementById('practice-chat').innerText.includes('¡Terminaste la conversación!')}
});
console.log('preguntas del examinador:',res.preguntas.length);res.preguntas.forEach((q,i)=>console.log(' ',String(i+1).padStart(2),q));
console.log('dibujos mostrados:',JSON.stringify(res.dibujos),'| bloques de ayuda:',res.ayudas,'| fichas «cómo se dice»:',res.fichas,'| terminó:',res.fin);
console.log('errores de página:',errs);

await b.close()})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
