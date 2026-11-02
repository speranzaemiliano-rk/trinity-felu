// Etapa 3: corrección con IA y nota. La IA se simula, pero la página es la real.
const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const MOCK=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>({t:'object',o}),string:()=>({t:'string'}),boolean:()=>({t:'boolean'}),integer:()=>({t:'integer'}),array:a=>({t:'array',a})};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  const sys=String(params.systemInstruction||'');
  if(/You have just examined Felu/.test(sys)){
    window.__eval=(window.__eval||0)+1;window.__evalTexto=req.contents[0].parts[0].text;window.__evalCfg={json:params.generationConfig.responseMimeType,schema:!!params.generationConfig.responseSchema,modelo:params.model};
    const m=window.__evalMode||'ok';
    if(window.__evalLento)await new Promise(r=>setTimeout(r,window.__evalLento));
    if(m==='fail')throw new Error('[500 ] internal error');
    if(m==='badjson')return {response:{text:()=>'esto no es json'}};
    if(m==='incompleta')return {response:{text:()=>JSON.stringify({comprension:8,gramatica:7})}};
    const o={comprension:8,gramatica:6,vocabulario:7,fluidez:7,pregunto:m!=='sinpregunta',resumen:'Contestaste casi todo con oraciones. Probá agregar más detalles.',
      bien:['Usaste oraciones completas, por ejemplo «I live in a house».','Contestaste la pregunta del dibujo.'],
      mejorar:[{dijo:'I have two sister',mejor:'I have two sisters',porque:'Con dos o más se agrega una s.'},
               {dijo:'I goed to school yesterday',mejor:'I went to school yesterday',porque:'Go cambia a went en pasado.'},
               {dijo:'I live in a house',mejor:'I live in a house',porque:'igual'},
               {dijo:'My mother are a doctor',mejor:'My mother is a doctor',porque:'INVENTADA: el chico nunca dijo esto'}],
      repasar:['Plurales: two sisters','Pasado de to be']};
    return {response:{text:()=>JSON.stringify(o)}};
  }
  if(!/turn=/.test(sys))return {response:{text:()=>'hi'}};
  const k=+(/turn=(\\d+)/.exec(sys)||[0,0])[1];const fin=window.__finEn||5;
  const t={reply:k>=fin?'Thank you. Goodbye!':'Nice! Question number '+k+'?',ok:true,tip:'',model:'',end:k>=fin,picture:'',hints:[],help:''};
  return {response:{text:()=>JSON.stringify(t)}};
}}}`;
async function pagina(b,ctx,opts){
  const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.errs=errs;
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["rapido","medio","fuerte"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK)));
  await p.addInitScript(o=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__dichos=[];window.__vioEspera=false;setInterval(()=>{if(document.body&&/corrigiendo tu examen/.test(document.body.innerText))window.__vioEspera=true},40);window.__evalMode=o.evalMode;window.__finEn=o.finEn;window.__evalLento=o.lento||0},opts);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','index.html'));
  await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(t)}});
  return p;
}
async function charla(p,pref,tab,respuestas){
  await p.click('#'+tab);await p.evaluate(x=>{const c=document.getElementById(x+'tap');if(c)c.checked=true},pref);
  await p.click('#'+pref+'start');
  await p.waitForSelector('#'+pref+'talk:not([hidden])',{timeout:20000});
  await p.click('#'+pref+'kb');await p.waitForTimeout(250);
  for(let i=0;i<respuestas.length;i++){
    const fin=await p.evaluate(x=>!!document.querySelector('#'+x+'chat .msg.nota,#'+x+'chat .msg.tip b'),pref);
    await p.waitForSelector('#'+pref+'in:visible',{timeout:8000}).catch(()=>{});
    const vis=await p.evaluate(x=>{const e=document.getElementById(x+'in');return !!(e&&e.offsetParent)},pref);
    if(!vis)break;
    await p.fill('#'+pref+'in',respuestas[i]);await p.click('#'+pref+'send');await p.waitForTimeout(450);
  }
}
const R5=['I live in a house with four rooms','I have two sister and one brother','I goed to school yesterday','Yes, I do. Do you like pizza?'];   // finEn 5 = 4 respuestas
const leer=(p,pref)=>p.evaluate(x=>{const n=document.querySelector('#'+x+'chat .msg.nota');
  return n?{texto:n.innerText.replace(/\s+/g,' '),num:(n.querySelector('.nota-num')||{}).childNodes?n.querySelector('.nota-num').childNodes[0].textContent:'',letra:(n.querySelector('.nota-let b')||{}).textContent,
   barras:n.querySelectorAll('.nc').length,mejorar:[...n.querySelectorAll('.mej li')].map(li=>li.innerText.replace(/\s+/g,' ')),bien:n.querySelectorAll('ul:not(.mej) li').length,
   chips:[...n.querySelectorAll('.nrep span')].map(s=>s.textContent),tit:(n.querySelector('.nota-tit')||{}).textContent,say:[...n.querySelectorAll('.mej .hchip')].map(h=>h.dataset.say)}:null},pref);
const viejo=(p,pref)=>p.evaluate(x=>document.getElementById(x+'chat').innerText.replace(/\s+/g,' '),pref);
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const res=[];const chk=(n,v)=>{res.push(v);console.log(v?'✓':'✗',n)};
let ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});

// 1) práctica: puntaje, letra, barras, frases reales vs inventadas
let p=await pagina(b,ctx,{evalMode:'ok',finEn:5});
await charla(p,'practice-','t-speak',R5);
await p.waitForSelector('#practice-chat .msg.nota',{timeout:20000});
let n=await leer(p,'practice-');console.log(JSON.stringify(n,null,1));
chk('nota = promedio de los 4 criterios (8,6,7,7 → 7)',n.num==='7');
chk('letra B (Merit) con 7',n.letra==='B'&&/Merit/.test(n.texto));
chk('4 barras de criterios',n.barras===4);
chk('la frase real «I have two sister» queda',n.mejorar.some(x=>/I have two sister\b/.test(x)));
chk('una frase que el chico SÍ dijo («I goed…») se conserva',n.mejorar.some(x=>/I goed to school/.test(x)));
chk('una frase INVENTADA por la IA («My mother are a doctor») se descarta',!n.mejorar.some(x=>/My mother are/.test(x))&&!/INVENTADA/.test(n.texto));
chk('«mejor igual a dijo» se descarta',!n.mejorar.some(x=>/porque|igual/.test(x)&&/I live in a house/.test(x)));
chk('cada «mejor» tiene 🔊 con su texto',n.say.includes('I have two sisters')&&n.say.includes('I went to school yesterday'));
chk('lista «lo que hiciste bien» (2)',n.bien===2);
chk('temas para repasar',n.chips.length===2);
chk('título de práctica',/Nota de la charla/.test(n.tit));
chk('le preguntó al examinador ✅',/✅ Le hiciste una pregunta/.test(n.texto));
const ev=await p.evaluate(()=>({t:window.__evalTexto,c:window.__evalCfg,n:window.__eval}));
chk('la IA recibió la charla entera con EXAMINER/FELU',/EXAMINER: Nice! Question number 1\?/.test(ev.t)&&/FELU: I have two sister and one brother/.test(ev.t));
chk('pidió JSON con esquema y UNA sola vez',ev.c.json==='application/json'&&ev.c.schema&&ev.n===1);
chk('probó primero el modelo más capaz («fuerte»)',ev.c.modelo==='fuerte');
chk('guardó la nota en el historial',(await p.evaluate(()=>JSON.parse(localStorage.getItem('trinity_notas'))))[0].n===7);
chk('sin errores de página'+(p.errs.length?' → '+JSON.stringify(p.errs):''),p.errs.length===0);

// 2) historial: segunda charla en el mismo navegador
await p.close();
p=await pagina(b,ctx,{evalMode:'sinpregunta',finEn:5});
await charla(p,'practice-','t-speak',R5);
await p.waitForSelector('#practice-chat .msg.nota',{timeout:20000});
n=await leer(p,'practice-');
chk('sin pregunta: «Entender y responder» queda en 6 → (6+6+7+7)/4 = 6,5',n.num==='6,5');
chk('sin pregunta: letra C (Pass)',n.letra==='C');
chk('sin pregunta: avisa que falta la pregunta',/No le hiciste ninguna pregunta/.test(n.texto));
chk('historial: muestra la nota anterior (7) y baja a 6,5',/Tus últimas notas: 7 → 6,5/.test(n.texto)&&/parecida|bajaste/.test(n.texto));
chk('sin errores de página'+(p.errs.length?' → '+JSON.stringify(p.errs):''),p.errs.length===0);
await p.close();

// 3) examen oral
ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});
p=await pagina(b,ctx,{evalMode:'ok',finEn:5});
await charla(p,'oral-','t-exam',R5);
await p.waitForSelector('#oral-chat .msg.nota',{timeout:20000});
n=await leer(p,'oral-');
chk('examen oral: la tarjeta dice «Nota del examen oral»',/Nota del examen oral/.test(n.tit)&&n.num==='7');
chk('examen: el historial guarda aparte (modo examen)',(await p.evaluate(()=>JSON.parse(localStorage.getItem('trinity_notas'))))[0].m==='examen');
chk('examen: el botón vuelve a «Hacer otro examen oral»',(await p.evaluate(()=>document.getElementById('oral-start').textContent))==='Hacer otro examen oral');
await p.close();

// 4) la IA falla al corregir: queda el resumen simple y un aviso
for(const modo of ['fail','badjson','incompleta']){
  p=await pagina(b,ctx,{evalMode:modo,finEn:5});
  await charla(p,'practice-','t-speak',R5);
  await p.waitForFunction(()=>/Terminaste la conversación|Te dejo el resumen simple/.test(document.getElementById('practice-chat').innerText),null,{timeout:30000});
  const t=await viejo(p,'practice-');
  chk('corrección «'+modo+'»: avisa y deja el resumen de siempre',/No pude conectarme con la IA para ponerte la nota/.test(t)&&/Terminaste la conversación/.test(t)&&!/Corrigiendo|corrigiendo tu examen/.test(t)&&!(await p.evaluate(()=>!!document.querySelector('.msg.nota'))));
  chk('corrección «'+modo+'»: reintentó una vez ('+(await p.evaluate(()=>window.__eval))+' pedidos)',(await p.evaluate(()=>window.__eval))>=1);
  chk('corrección «'+modo+'»: sin errores de página',p.errs.length===0);
  await p.close();
}

// 5) charla demasiado corta: no se gasta una corrección
p=await pagina(b,ctx,{evalMode:'ok',finEn:3});
await charla(p,'practice-','t-speak',R5.slice(0,2));
await p.waitForFunction(()=>/Hablaste muy poco/.test(document.getElementById('practice-chat').innerText),null,{timeout:20000});
chk('charla corta (2 respuestas): avisa y NO llama a la IA para corregir',(await p.evaluate(()=>window.__eval||0))===0);
await p.close();

// 6) tocar «Empezar» otra vez mientras corrige: no aparece una nota vieja
p=await pagina(b,ctx,{evalMode:'ok',finEn:5,lento:6000});
await charla(p,'practice-','t-speak',R5);
await p.waitForFunction(()=>window.__vioEspera===true,null,{timeout:20000});
chk('mientras corrige se vio «⏳ La IA está corrigiendo tu examen…»',true);
chk('mientras corrige NO hay nota todavía',!(await p.evaluate(()=>!!document.querySelector('#practice-chat .msg.nota'))));
await p.evaluate(()=>{window.__finEn=99});
await p.click('#practice-start');   // otra charla: cancela la corrección pendiente
await p.waitForTimeout(7500);
chk('la corrección cancelada no deja una nota en la charla nueva',!(await p.evaluate(()=>!!document.querySelector('#practice-chat .msg.nota'))));
chk('el cartel de «corrigiendo» se fue',!(await p.evaluate(()=>/corrigiendo tu examen/.test(document.getElementById('practice-chat').innerText))));
chk('sin errores de página'+(p.errs.length?' → '+JSON.stringify(p.errs):''),p.errs.length===0);
await p.close();
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
