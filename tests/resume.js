// iPhone con iOS 26+ y la app instalada: al volver del fondo (si no se está haciendo nada) la página se recarga sola, para que el audio no quede mudo.
const {chromium}=require('playwright');
const UA27='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const UA18='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1';
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
(async()=>{
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']});
const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
async function pagina(ua,instalada,semilla){
  const ctx=await b.newContext({userAgent:ua,viewport:{width:390,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js('window.TRINITY_FB={config:{},models:[]};')));
  await p.addInitScript(([inst,sem])=>{
    if(inst)Object.defineProperty(navigator,'standalone',{value:true,configurable:true});
    if(sem)localStorage.setItem('trinity_sonido3',JSON.stringify(Object.assign({t:Date.now()},sem)));
    window.__salto=0;const r=Date.now.bind(Date);Date.now=()=>r()+window.__salto;
    Object.defineProperty(document,'hidden',{get:()=>!!window.__oculto,configurable:true});
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
  },[instalada,semilla||null]);
  await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));await p.waitForTimeout(300);
  await p.evaluate(()=>{window.__marca=1});
  return {p,ctx};
}
// vuelve del fondo después de `seg` segundos; devuelve true si la página se recargó
async function volver(p,seg){
  await p.evaluate(()=>{window.__oculto=true;document.dispatchEvent(new Event('visibilitychange'))});
  await p.evaluate(s=>{window.__salto+=s*1000;window.__oculto=false;document.dispatchEvent(new Event('visibilitychange'))},seg);
  await p.waitForTimeout(1500);
  return !(await p.evaluate(()=>window.__marca===1).catch(()=>false));
}
let t,r;

t=await pagina(UA27,true);
await t.p.click('#t-speak');
r=await volver(t.p,30);
chk('app instalada en iOS 27, sin hacer nada, vuelve tras 30 s → se recarga',r);
chk('… y vuelve a la misma pestaña (Speaking)',await t.p.evaluate(()=>document.getElementById('t-speak').getAttribute('aria-selected')==='true'&&!document.getElementById('v-speak').hidden));
chk('… la recarga usa una dirección nueva (?v=…), como cuando se actualiza (en https la deja limpia después)',await t.p.evaluate(()=>/[?&]v=\d+/.test(location.search)));
chk('… el registro anotó por qué se recargó',await t.p.evaluate(()=>/se recargó sola al volver del fondo \(30 s\)/.test(window.rkInforme())));
await t.p.evaluate(()=>{window.__marca=1});r=await volver(t.p,30);
chk('… otra vuelta del fondo dentro del minuto NO vuelve a recargar (no entra en un ciclo)',r===false);
chk('sin errores de página',t.p.errs.length===0);await t.ctx.close();

t=await pagina(UA27,false);r=await volver(t.p,30);chk('en Safari (no instalada) NO se recarga',r===false);await t.ctx.close();
t=await pagina(UA18,true);r=await volver(t.p,30);chk('app instalada pero iOS 18 (sin el error) NO se recarga',r===false);await t.ctx.close();
t=await pagina(UA27,true);r=await volver(t.p,4);chk('si estuvo menos de 10 s en el fondo NO se recarga',r===false);await t.ctx.close();

t=await pagina(UA27,true);await t.p.evaluate(()=>{activeStop=function(){}});r=await volver(t.p,30);
chk('con una charla andando NO se recarga',r===false);await t.ctx.close();

t=await pagina(UA27,true);await t.p.click('#t-speak');await t.p.click('#practice-how');await t.p.fill('#practice-howin','perro');r=await volver(t.p,30);
chk('con texto escrito a medias NO se recarga',r===false);await t.ctx.close();

t=await pagina(UA27,true);await t.p.click('#t-exam');await t.p.evaluate(()=>{const b=document.getElementById('start');if(b)b.click()});
const enExamen=await t.p.evaluate(()=>qs.length>0&&i<qs.length);r=await volver(t.p,30);
chk('con el examen escrito empezado NO se recarga (el examen estaba en curso: '+enExamen+')',enExamen&&r===false);await t.ctx.close();

t=await pagina(UA27,true);await t.p.evaluate(()=>{const d=document.createElement('div');d.id='rkSonido';document.body.appendChild(d)});r=await volver(t.p,30);
chk('con la revisión de sonido abierta NO se recarga',r===false);await t.ctx.close();

t=await pagina(UA27,true);await t.p.click('#t-speak');await t.p.evaluate(()=>{const c=document.getElementById('practice-chat');const d=document.createElement('div');d.className='msg nota';c.appendChild(d)});r=await volver(t.p,30);
chk('con la tarjeta de la nota a la vista NO se recarga (se puede seguir leyendo)',r===false);await t.ctx.close();

await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
