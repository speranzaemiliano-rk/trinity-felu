// Aviso de versión nueva: un «servidor» falso (https://trinity.test) sirve el index.html real, a veces con una versión «vieja».
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const RAIZ=require('path').resolve(__dirname,'..');const D=require('path').join(__dirname,'assets')+'/';
const REAL=fs.readFileSync(RAIZ+'/index.html','utf8');const BUILD_REAL=/const BUILD="([^"]+)"/.exec(REAL)[1];
const VIEJA=REAL.replace(/const BUILD="[^"]*"/,'const BUILD="vieja"');
const TIPOS={'.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){await new Promise(r=>setTimeout(r,200));return {response:{text:()=>'My name is Felu'}}}
  if(/turn=/.test(String(params.systemInstruction))){const n=(window.__n=(window.__n||0)+1);
    return {response:{text:()=>JSON.stringify({reply:'Nice! Question number '+n+'?',ok:true,tip:'',model:'',end:false,picture:'',hints:[],help:''})}}}
  return {response:{text:()=>'hi'}};}}}`;
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
async function nuevo(b,srv){
  const ctx=await b.newContext({viewport:{width:390,height:844},serviceWorkers:'block'});
  const docs=[];
  await ctx.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await ctx.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await ctx.route('https://trinity.test/**',async r=>{
    const u=new URL(r.request().url());let f=u.pathname==='/'?'/index.html':u.pathname;
    if(f==='/firebase-config.js')return r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`));
    if(f==='/index.html'){
      const esSonda=/[?&]c=\d+/.test(u.search),esV=/[?&]v=\d+/.test(u.search);
      if(!esSonda)docs.push(u.pathname+u.search);
      let sirve=esSonda?srv.sonda:(esV&&!srv.ignorarV?'real':srv.documento);
      return r.fulfill({status:200,contentType:'text/html; charset=utf-8',headers:{'cache-control':'no-store'},body:sirve==='real'?REAL:VIEJA});
    }
    try{const cuerpo=fs.readFileSync(RAIZ+f);r.fulfill({status:200,contentType:TIPOS[path.extname(f)]||'application/octet-stream',body:cuerpo})}catch(e){r.fulfill({status:404,body:''})}
  });
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.docs=docs;
  await p.addInitScript(()=>{Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),100)}});
  return {ctx,p};
}
const banner=p=>p.evaluate(()=>{const e=document.querySelector('.rk-nuevo');return !!(e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0)});
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
let t,srv;

// D) misma versión: no pasa nada
srv={documento:'real',sonda:'real'};t=await nuevo(b,srv);await t.p.goto('https://trinity.test/');await t.p.waitForTimeout(4500);
chk('misma versión: no recarga ni muestra cartel (cargas: '+t.p.docs.length+')',t.p.docs.length===1&&!(await banner(t.p)));
chk('la versión se ve siempre en un rincón: «'+BUILD_REAL+' · sonido: …»',(await t.p.evaluate(b=>{const e=document.getElementById('rkVer');const r=e.getBoundingClientRect();return e.textContent.indexOf(b)===0&&r.height>0&&r.bottom<=innerHeight&&r.left>=0},BUILD_REAL)));
await t.ctx.close();

// A) se abre con una versión vieja guardada: se recarga sola UNA vez y queda la nueva
srv={documento:'vieja',sonda:'real'};t=await nuevo(b,srv);await t.p.goto('https://trinity.test/');
await t.p.waitForFunction(()=>typeof BUILD!=='undefined'&&BUILD!=='vieja',null,{timeout:15000}).catch(()=>{});
await t.p.waitForTimeout(1200);
const urlFinal=t.p.url(),ver=await t.p.evaluate(()=>BUILD);
chk('abre vieja: se recargó sola y ahora es la nueva ('+ver+')',ver===BUILD_REAL);
chk('abre vieja: lo hizo con una sola recarga (cargas: '+t.p.docs.join(' → ')+')',t.p.docs.length===2&&/[?&]v=\d+/.test(t.p.docs[1]));
chk('abre vieja: la dirección quedó limpia sin ?v= ('+urlFinal+')',!/[?&]v=/.test(urlFinal));
chk('abre vieja: sin cartel y sin errores',!(await banner(t.p))&&t.p.errs.length===0);
await t.ctx.close();

// B) recarga y sigue vieja (caché del navegador): NO entra en un ciclo, avisa
srv={documento:'vieja',sonda:'real',ignorarV:true};t=await nuevo(b,srv);await t.p.goto('https://trinity.test/');
await t.p.waitForFunction(()=>true);await t.p.waitForTimeout(9000);
chk('sigue vieja tras recargar: se detiene (cargas: '+t.p.docs.length+') y muestra el cartel',t.p.docs.length===2&&(await banner(t.p)));
await t.ctx.close();

// C) vuelve del fondo con la versión vieja en memoria: sólo avisa; «Actualizar» recarga
srv={documento:'vieja',sonda:'vieja'};t=await nuevo(b,srv);await t.p.goto('https://trinity.test/');await t.p.waitForTimeout(3500);
chk('en memoria con versión vieja y el servidor aún sin novedades: sin cartel',!(await banner(t.p)));
srv.sonda='real';   // se publica una versión nueva mientras la app estaba en el fondo
await t.p.waitForTimeout(8000);
await t.p.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'))});await t.p.waitForTimeout(1200);
chk('vuelve del fondo: aparece «Hay una versión nueva» y NO se recargó sola (cargas: '+t.p.docs.length+')',(await banner(t.p))&&t.p.docs.length===1);
await t.p.click('.rk-nuevo .ok');
await t.p.waitForFunction(()=>typeof BUILD!=='undefined'&&BUILD!=='vieja',null,{timeout:15000}).catch(()=>{});
chk('tocar «Actualizar» carga la versión nueva ('+(await t.p.evaluate(()=>BUILD))+')',(await t.p.evaluate(()=>BUILD))===BUILD_REAL);
await t.ctx.close();

// E) en medio de una charla no se recarga ni se corta: sólo avisa
srv={documento:'vieja',sonda:'vieja'};t=await nuevo(b,srv);await t.p.goto('https://trinity.test/');
await t.p.click('#t-speak');await t.p.click('#practice-start');
await t.p.waitForFunction(()=>document.querySelector('#practice-chat .msg.kid'),null,{timeout:40000});
srv.sonda='real';await t.p.waitForTimeout(9000);await t.p.evaluate(()=>{document.dispatchEvent(new Event('visibilitychange'))});await t.p.waitForTimeout(1500);
chk('con una charla en curso: avisa y no la corta (cargas: '+t.p.docs.length+')',(await banner(t.p))&&t.p.docs.length===1);
await t.ctx.close();

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
