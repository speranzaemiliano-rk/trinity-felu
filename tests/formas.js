// Revisión de sonido, paso 3: si «Friday» no se oye, se prueban las otras formas de reproducir el audio (cada una con un toque).
const {chromium}=require('playwright');
const http=require('http'),fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'..'),D=path.join(__dirname,'assets')+'/';
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/27.2 Mobile/15E148 Safari/604.1';
const MIME={'.html':'text/html','.js':'application/javascript','.mp3':'audio/mpeg','.json':'application/json','.png':'image/png','.svg':'image/svg+xml'};
const srv=http.createServer((rq,rs)=>{let f=path.join(RAIZ,decodeURIComponent(rq.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';
  fs.readFile(f,(e,d)=>{if(e){rs.writeHead(404);rs.end();return}rs.writeHead(200,{'content-type':MIME[path.extname(f)]||'application/octet-stream','access-control-allow-origin':'*'});rs.end(d)})});
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
let PORT;
async function pagina(b,vivas){
  const ctx=await b.newContext({userAgent:UA,viewport:{width:390,height:900},serviceWorkers:'block'});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js('window.TRINITY_FB={config:{},models:[]};')));
  await p.addInitScript(v=>{
    try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true,writable:true})}catch(e){}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__vivas=v;window.__nivel=0.004;window.__plays=[];
    const d=Object.getOwnPropertyDescriptor(ScriptProcessorNode.prototype,'onaudioprocess');
    Object.defineProperty(ScriptProcessorNode.prototype,'onaudioprocess',{configurable:true,get(){return d.get.call(this)},
      set(fn){d.set.call(this,fn?()=>fn({inputBuffer:{getChannelData:()=>{const a=new Float32Array(4096);a.fill(window.__nivel);return a}}}):fn)}});
    const suena=(tipo,fin)=>{window.__plays.push(tipo);if(window.__vivas[tipo])window.__nivel=0.2;setTimeout(()=>{window.__nivel=0.004;fin()},700)};
    HTMLMediaElement.prototype.play=function(){const src=this.src.split('/').pop();if(/silencio/.test(src))return Promise.resolve();
      const tipo=this.tagName==='VIDEO'?2:((typeof _aud!=='undefined'&&this===_aud)?0:1);
      const s=this;Object.defineProperty(s,'paused',{value:false,configurable:true});
      suena(tipo,()=>{Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()});return Promise.resolve()};
    AudioBufferSourceNode.prototype.start=function(){const s=this;suena(3,()=>{s.onended&&s.onended()})};
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
  },vivas);
  await p.goto('http://localhost:'+PORT+'/index.html');
  return {p,ctx};
}
// la persona de la prueba: marca lo que "oye" según qué forma está viva en este momento
async function paso(p,{p1=['tts','mp3'],p2=['mp3d','ttsd']}={}){
  await p.waitForSelector('#rkSnPlay',{timeout:15000});await p.click('#rkSnPlay');await p.waitForSelector('.rk-chip',{timeout:30000});
  return true;
}
async function recorrer(p,opts){   // devuelve las formas probadas en el paso 3
  const probadas=[];
  await p.click('#rkSnIni');
  // paso 1
  await paso(p);for(const k of ['tts','mp3'])await p.click('.rk-chip[data-k="'+k+'"]');await p.click('#rkSnListo');
  // paso 2
  await paso(p);for(const k of ['mp3d','ttsd'])await p.click('.rk-chip[data-k="'+k+'"]');await p.click('#rkSnListo');
  // paso 3 (y sus reintentos)
  for(let i=0;i<6;i++){
    await p.waitForSelector('#rkSnPlay,#rkSnGo',{timeout:15000});if(await p.$('#rkSnGo'))break;
    const tit=await p.evaluate(()=>document.querySelector('#rkSonido h3').textContent);
    await p.click('#rkSnPlay');await p.waitForSelector('.rk-chip,#rkSnGo',{timeout:30000});if(await p.$('#rkSnGo'))break;
    const forma=await p.evaluate(()=>_estrategia),oye=await p.evaluate(f=>!!window.__vivas[f],forma);
    probadas.push({forma,oye,tit});
    if(oye)await p.click('.rk-chip[data-k="mp3a"]');
    await p.click('#rkSnListo');
  }
  await p.waitForSelector('#rkSnGo',{timeout:15000});
  return probadas;
}
(async()=>{
await new Promise(r=>srv.listen(0,r));PORT=srv.address().port;
const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+'speech_ruido.wav','--autoplay-policy=no-user-gesture-required']});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const estado=p=>p.evaluate(()=>({g:JSON.parse(localStorage.getItem('trinity_sonido3')||'null'),estr:localStorage.getItem('trinity_estr'),forma:_estrategia,modo:modoDe(leerSonido()),res:document.querySelector('#rkSonido .rk-caja').innerText}));
let t,pr,e;

t=await pagina(b,[true,true,true,true]);await t.p.click('#t-speak');await t.p.click('#practice-snd');
pr=await recorrer(t.p);e=await estado(t.p);
chk('la forma 0 se oye: una sola prueba en el paso 3 ('+JSON.stringify(pr.map(x=>x.forma))+') y queda «manos libres»',pr.length===1&&pr[0].forma===0&&e.modo==='libres'&&e.g.mp3a===1);
chk('… se guarda la forma 0 y la referencia de eco',e.estr==='0'&&e.g.ecoA>0);
chk('… el resultado no menciona formas especiales',!/forma especial/.test(e.res));
chk('sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));await t.ctx.close();

t=await pagina(b,[false,false,true,true]);await t.p.click('#t-speak');await t.p.click('#practice-snd');
pr=await recorrer(t.p);e=await estado(t.p);
chk('la forma 0 y la 1 no se oyen: prueba 0 → 1 → 2 y se queda con la 2 ('+JSON.stringify(pr.map(x=>x.forma+(x.oye?'✓':'✗')))+')',pr.map(x=>x.forma).join()==='0,1,2'&&e.modo==='libres'&&e.g.mp3a===1);
chk('… los títulos van avisando («otra forma de reproducir (2 de 4)» y «(3 de 4)»)',/otra forma de reproducir \(2 de 4\)/.test(pr[1].tit)&&/\(3 de 4\)/.test(pr[2].tit));
chk('… la forma 2 (video) queda guardada y el resultado lo explica',e.estr==='2'&&e.forma===2&&/forma especial de reproducir el audio: video/.test(e.res));
chk('… la referencia de eco es la del intento que SÍ se oyó (≥ 15%)',e.g.ecoA>=15);
chk('sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));await t.ctx.close();

t=await pagina(b,[false,false,false,false]);await t.p.click('#t-speak');await t.p.click('#practice-snd');
pr=await recorrer(t.p);e=await estado(t.p);
chk('ninguna forma se oye: prueba las 4 ('+JSON.stringify(pr.map(x=>x.forma))+') y NO queda «manos libres» ('+e.modo+')',pr.map(x=>x.forma).join()==='0,1,2,3'&&e.modo!=='libres'&&e.g.mp3a===0);
chk('… no se guarda ninguna forma y todo vuelve a como estaba',e.estr===null&&e.forma===0);
chk('sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));await t.ctx.close();

// cerrar a mitad de los reintentos devuelve la forma de antes
t=await pagina(b,[false,true,true,true]);await t.p.click('#t-speak');await t.p.click('#practice-snd');
await t.p.click('#rkSnIni');
await paso(t.p);for(const k of ['tts','mp3'])await t.p.click('.rk-chip[data-k="'+k+'"]');await t.p.click('#rkSnListo');
await paso(t.p);for(const k of ['mp3d','ttsd'])await t.p.click('.rk-chip[data-k="'+k+'"]');await t.p.click('#rkSnListo');
await t.p.waitForSelector('#rkSnPlay');await t.p.click('#rkSnPlay');await t.p.waitForSelector('.rk-chip');await t.p.click('#rkSnListo');   // forma 0: no se oye
await t.p.waitForSelector('#rkSnPlay');
const mitad=await t.p.evaluate(()=>({forma:_estrategia,tit:document.querySelector('#rkSonido h3').textContent}));
await t.p.click('#rkSnCerrar');
const luego=await t.p.evaluate(()=>({forma:_estrategia,guardado:localStorage.getItem('trinity_estr'),modal:!!document.getElementById('rkSonido')}));
chk('si se cierra la revisión a mitad de los reintentos, la forma vuelve a la de antes (en pleno intento era '+mitad.forma+', después '+luego.forma+')',mitad.forma===1&&luego.forma===0&&luego.guardado===null&&!luego.modal);
await t.ctx.close();

srv.close();await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
