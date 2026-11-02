// iOS 26+: app instalada con audio roto (WebKit 295518/291892) y los defectos propios que lo empeoraban (desbloqueo que interrumpe, AbortError).
const {chromium}=require('playwright');
const UA27='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const UA27MAC='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Safari/605.1.15';   // el que mandó el iPhone del usuario
const UA18='Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
const FRASE='Hello! Welcome. Sit down, please. How are you feeling today?';
async function pagina(b,o){
  const ctx=await b.newContext({userAgent:o.ua,viewport:{width:402,height:812},serviceWorkers:'block'});
  if(o.mac)await ctx.addInitScript(()=>{Object.defineProperty(navigator,'platform',{get:()=>'MacIntel'});Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5})});
  await ctx.addInitScript(oo=>{
    if(oo.standalone)Object.defineProperty(navigator,'standalone',{value:true,configurable:true});
    if(oo.semilla)localStorage.setItem('trinity_sonido3',oo.semilla);
    window.__speak=[];window.__playLog=[];window.__abortar=oo.abortar||0;window.__dur=oo.dur||40;window.__eventosVoz=!!oo.eventosVoz;
    speechSynthesis.speak=u=>{window.__speak.push({t:u.text,sonandoAudio:(typeof _audioSonando==='function')?_audioSonando():false});
      if(window.__eventosVoz){setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)}};   // sin eventos = como el iPhone con la voz de desbloqueo en silencio
    HTMLMediaElement.prototype.play=function(){const src=this.src.split('/').pop();window.__playLog.push(src);const self=this;
      if(window.__abortar>0&&!/silencio/.test(src)){window.__abortar--;return Promise.reject(new DOMException('interrumpido','AbortError'))}
      Object.defineProperty(self,'paused',{value:false,configurable:true});
      setTimeout(()=>{if(self.src.split('/').pop()!==src)return;   // si ya se cargó otro archivo, éste se abortó y no termina
        Object.defineProperty(self,'paused',{value:true,configurable:true});self.onended&&self.onended()},window.__dur);
      return Promise.resolve()}},o);
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.goto('file://'+require('path').resolve(__dirname,'..','index.html'));
  return {p,ctx};
}
const banner=p=>p.evaluate(()=>{const e=document.querySelector('.rk-pwa');return !!(e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0)});
(async()=>{
const b=await chromium.launch();const res=[];const chk=(n,v)=>{res.push(!!v);console.log(v?'✓':'✗',n)};
let t,e;

// 1) aviso de la app instalada: sólo iPhone + iOS 26 o más nuevo + app instalada
t=await pagina(b,{ua:UA27,standalone:true});
chk('iOS 27 + app instalada: aparece el aviso del error de Apple con «Safari»',(await banner(t.p))&&/Safari/.test(await t.p.evaluate(()=>document.querySelector('.rk-pwa').innerText)));
await t.p.click('#rkPwaOk');await t.p.reload();await t.p.waitForTimeout(300);
chk('«Entendido»: no vuelve a molestar el mismo día',!(await banner(t.p)));await t.ctx.close();
t=await pagina(b,{ua:UA27MAC,standalone:true,mac:true});
chk('el iPhone que manda UA de Mac (como el tuyo, Version/27.2) también se detecta',await banner(t.p));
chk('el informe dice la versión de iOS y que es app instalada',/iOS\/Safari 27 · app instalada: sí/.test(await t.p.evaluate(()=>window.rkInforme())));await t.ctx.close();
t=await pagina(b,{ua:UA27,standalone:false});chk('iOS 27 en Safari (no instalada): sin aviso',!(await banner(t.p)));await t.ctx.close();
t=await pagina(b,{ua:UA18,standalone:true});chk('iOS 18 con app instalada: sin aviso (el error es de iOS 26+)',!(await banner(t.p)));await t.ctx.close();
t=await pagina(b,{ua:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138.0 Safari/537.36',standalone:true});chk('PC con app instalada: sin aviso',!(await banner(t.p)));await t.ctx.close();

// 2) si algo interrumpe el arranque del audio (AbortError) se reintenta
t=await pagina(b,{ua:UA27,abortar:1,eventosVoz:true,semilla:'{"tts":1,"mp3":1}'});
const r2=await t.p.evaluate(f=>say(f,()=>{},{ex:true}),FRASE);
const n2=await t.p.evaluate(()=>window.__playLog.filter(x=>!/silencio/.test(x)).length);
chk('AbortError en el primer intento: se reintenta y suena (say → '+r2+', intentos '+n2+')',r2===true&&n2===2);
chk('el registro anota el reintento',/audio play .* \(reintento 2\)/.test(await t.p.evaluate(()=>window.rkInforme())));await t.ctx.close();
t=await pagina(b,{ua:UA27,abortar:9,eventosVoz:true,semilla:'{"tts":1,"mp3":1}'});
const r2b=await t.p.evaluate(f=>say(f,()=>{},{ex:true}),FRASE);
const n2b=await t.p.evaluate(()=>({mp3:window.__playLog.filter(x=>!/silencio/.test(x)).length,voz:window.__speak.length}));
chk('si el audio sigue interrumpido tras 3 intentos, pasa a la voz del celular (say → '+r2b+', intentos de audio '+n2b.mp3+', voz '+n2b.voz+')',r2b===true&&n2b.mp3===3&&n2b.voz>=1);await t.ctx.close();

// 3) la voz silenciosa de «desbloqueo» no puede arrancar con un audio sonando (en Safari speak() interrumpe los demás medios)
t=await pagina(b,{ua:UA27,dur:900,eventosVoz:false,semilla:'{"tts":1,"mp3":1}'});
await t.p.evaluate(f=>{window.__sp=say(f,()=>{},{ex:true})},FRASE);await t.p.waitForTimeout(250);
const src0=await t.p.evaluate(()=>_aud.src);
await t.p.evaluate(()=>{for(const ev of ['touchend','click','keydown'])document.dispatchEvent(new Event(ev))});await t.p.waitForTimeout(150);
const durante=await t.p.evaluate(()=>({speak:window.__speak.length,src:_aud.src}));
chk('con el audio sonando, tocar la pantalla NO dispara la voz de desbloqueo ni cambia el audio (voces: '+durante.speak+')',durante.speak===0&&durante.src===src0);
await t.p.waitForTimeout(900);
await t.p.evaluate(()=>{document.dispatchEvent(new Event('click'))});
for(let i=0;i<6;i++){await t.p.evaluate(()=>{_unlockPend=false;document.dispatchEvent(new Event('click'))})}
const total=await t.p.evaluate(()=>window.__speak.length);
chk('el desbloqueo no se repite en cada toque: máximo 3 intentos (hubo '+total+')',total>=1&&total<=3);await t.ctx.close();

// 3b) frases con nombre: si sólo existe grabada sin el nombre, suena ésa
t=await pagina(b,{ua:UA27,eventosVoz:true,semilla:'{"tts":1,"mp3":1}'});
const nom=await t.p.evaluate(async()=>{const salida={};
  for(const f of ["Thank you, Felu. That's the end of our conversation. Goodbye!","Nice to meet you, Marta!","OK, that's the end of the exam. Thank you, Felu. Goodbye!"]){
    const antes=window.__playLog.filter(x=>!/silencio/.test(x)).length,voz0=window.__speak.filter(x=>x.t!=='ok').length;
    const r=await say(f,()=>{},{ex:true});
    salida[f]={r,audio:window.__playLog.filter(x=>!/silencio/.test(x)).length-antes,voz:window.__speak.filter(x=>x.t!=='ok').length-voz0}}
  return salida});
chk('frases con un nombre cualquiera suenan con la grabada sin nombre, no con la voz del celular: '+JSON.stringify(Object.values(nom).map(x=>x.audio+'/'+x.voz)),Object.values(nom).every(x=>x.r===true&&x.audio===1&&x.voz===0));
await t.ctx.close();

// 4) la revisión guardada vence: «no se oye nada» a los 10 minutos, lo demás a los 7 días
const ahora=Date.now();
const caso=async(r,minutos)=>{const t=await pagina(b,{ua:UA27,semilla:JSON.stringify(Object.assign({},r,{t:ahora-minutos*60000}))});
  const x=await t.p.evaluate(()=>({sinvoz:SIN_VOZ,muda:_localMuda,mp3:MP3_OK,ok:SONIDO_OK}));await t.ctx.close();return x};
let x=await caso({tts:0,mp3:0,mp3d:0,ttsd:0,mp3a:0},5);chk('«no se oye nada» de hace 5 min: sigue aplicándose (sin voz: '+x.sinvoz+')',x.sinvoz===true);
x=await caso({tts:0,mp3:0,mp3d:0,ttsd:0,mp3a:0},11);chk('«no se oye nada» de hace 11 min: ya venció, se vuelve a intentar con voz (sin voz: '+x.sinvoz+')',x.sinvoz===false&&x.muda===false);
x=await caso({tts:0,mp3:1,mp3d:1,ttsd:0},60*24*6);chk('«sólo audio grabado» de hace 6 días: sigue valiendo',x.muda===true&&x.mp3===true&&x.ok===true);
x=await caso({tts:0,mp3:1,mp3d:1,ttsd:0},60*24*8);chk('«sólo audio grabado» de hace 8 días: venció',x.muda===false&&x.ok===false);
chk('sin errores de página',true);
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
