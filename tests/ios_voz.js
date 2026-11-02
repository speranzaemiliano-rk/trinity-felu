const {chromium}=require('playwright');
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';
(async()=>{const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
for(const escenario of ['Safari NUEVO: voz del celular (regla del iPhone simulada)','la voz del celular NUNCA arranca (peor caso) y la IA ya agotó su cupo','la voz del celular NUNCA arranca pero la voz de la IA funciona']){
 const ctx=await b.newContext({userAgent:UA,viewport:{width:390,height:900}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
 await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
 await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(params.generationConfig.responseModalities){ if(window.__ttsQuota)throw new Error('[429 Too Many Requests] Quota exceeded for metric generate_content_free_tier_requests, limit: 10');
    window.__ttsCalls=(window.__ttsCalls||0)+1;return {response:{inlineDataParts:()=>[{inlineData:{mimeType:'audio/L16;codec=pcm;rate=24000',data:btoa(String.fromCharCode(...new Uint8Array(480)))}}],text:()=>''}}}
  const n=(window.__n=(window.__n||0)+1);
  return {response:{text:()=>JSON.stringify({reply:n<=1?'Hello Felu! How are you today?':'Nice! What is your name?',ok:true,tip:'',model:'',end:false,picture:'',hints:[],help:''})}}}}}`)));
 await p.addInitScript(esc=>{try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1,"mp3d":1,"ttsd":1,"mp3a":0}')}catch(e){};
  let gesto=false;['click','touchend','keydown'].forEach(ev=>window.addEventListener(ev,()=>{gesto=true;setTimeout(()=>{gesto=false},0)},true));
  let desbloqueado=false;window.__speak=[];window.__ttsQuota=esc.startsWith('la voz del celular NUNCA arranca (peor');
  const Audio0=window.Audio;window.Audio=function(){const a=new Audio0();a.play=function(){window.__aud=(window.__aud||[]);window.__aud.push(a.src.startsWith('blob:')?'blob(voz de la IA)':a.src.replace(/.*\/(audio\/.*)/,'$1'));setTimeout(()=>a.onended&&a.onended(),40);return Promise.resolve()};return a};
  speechSynthesis.speak=u=>{
    if(esc.startsWith('la voz del celular NUNCA'))return;                 // el motor no arranca: ni eventos ni error
    if(!desbloqueado&&!gesto)return;                                      // regla de Safari: descarta en silencio si no fue dentro de un toque
    if(gesto)desbloqueado=true;
    window.__speak.push(u.text);setTimeout(()=>u.onstart&&u.onstart(),5);setTimeout(()=>u.onend&&u.onend(),30)};
 },escenario);
 await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
 await p.evaluate(()=>{VOZ_IOS='celu'});
 await p.click('#t-speak');
 // el chico toca (apoya el dedo y levanta): primero touchstart/pointerdown y después click, como en un iPhone
 await p.dispatchEvent('#practice-start','touchstart');await p.dispatchEvent('#practice-start','pointerdown');
 await p.click('#practice-start');
 await p.waitForFunction(()=>document.querySelectorAll('#practice-chat .msg.ex').length>=1,null,{timeout:25000});
 await p.waitForTimeout(escenario.startsWith('Safari NUEVO')?800:9000);
 const r=await p.evaluate(()=>({habladas:window.__speak.filter(x=>x.trim().length>2),aud:window.__aud||[],tts:window.__ttsCalls||0,
   texto:document.getElementById('practice-chat').innerText.slice(0,300).replace(/\n/g,' | '),aviso:document.getElementById('practice-st').hidden?'':document.getElementById('practice-st').innerText.slice(0,80)}));
 console.log('--',escenario);
 console.log('   voz del celular dijo:',JSON.stringify(r.habladas),'| audios:',JSON.stringify(r.aud.filter(x=>!/silencio/.test(x))),'| pedidos a la voz de la IA:',r.tts);
 console.log('   pantalla:',r.texto.slice(0,230));console.log('   errores de página:',errs);await ctx.close()}
await b.close()})().catch(e=>{console.log('FALLO',e.message);process.exit(1)})
