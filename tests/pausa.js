// Que no corte la oración cuando quien habla hace una pausa para buscar una palabra (listenRec + escuchaIncompleta).
// El micrófono falso repite el mismo archivo desde el principio en cada turno, así que se sabe exactamente cuándo habla y cuándo calla:
//   habla_con_pausa.wav : 0,7 s de silencio · 1,4 s de voz · PAUSA DE 1,6 s · 1,4 s de voz · silencio
//   habla_una_frase.wav : 0,7 s de silencio · 1,4 s de voz · silencio
// (Antes se daba por terminada la respuesta a los 1,25 s de silencio: la pausa de 1,6 s la cortaba y se perdía la segunda mitad.)
const {chromium}=require('playwright');
const D=require('path').join(__dirname,'assets')+'/';
const MOCK_AI=`export class GoogleAIBackend{} export function getAI(){return {}}
export const Schema={object:o=>o,string:()=>1,boolean:()=>1,integer:()=>1,array:a=>a};
export function getGenerativeModel(ai,params){return {async generateContent(req){
  if(Array.isArray(req)){
    const d=(req[1]&&req[1].inlineData&&req[1].inlineData.data)||'';const bytes=Math.floor(d.length*3/4);
    const n=(window.__wavs=window.__wavs||[]);const k=n.length;n.push({dur:Math.max(0,(bytes-44)/2/16000),t:performance.now()});
    await new Promise(r=>setTimeout(r,200));
    const f=window.__texto;const txt=typeof f==='function'?f(k):'My name is Felu';
    return {response:{text:()=>txt}}}
  return {response:{text:()=>'hi'}};}}}`;
const js=body=>({status:200,contentType:'application/javascript',headers:{'access-control-allow-origin':'*'},body});
const lanzar=wav=>chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--use-file-for-fake-audio-capture='+D+wav,'--autoplay-policy=no-user-gesture-required']});
async function pagina(b,texto,crudo){   // crudo: sin el filtrado del navegador (eco, ruido, ganancia automática), para que el micrófono falso llegue tal cual
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});
  const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.route('**/firebase-config.js',r=>r.fulfill(js(`window.TRINITY_FB={config:{apiKey:"k",projectId:"p",appId:"a"},models:["m1"]};`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-app.js',r=>r.fulfill(js(`export function initializeApp(c){return {}}`)));
  await p.route('https://www.gstatic.com/firebasejs/**/firebase-ai.js',r=>r.fulfill(js(MOCK_AI)));
  await p.addInitScript(([tx,crudo])=>{
    try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1}')}catch(e){}
    if(crudo){const real=navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);navigator.mediaDevices.getUserMedia=()=>real({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}})}
    Object.defineProperty(window,'webkitSpeechRecognition',{value:undefined,configurable:true});Object.defineProperty(window,'SpeechRecognition',{value:undefined,configurable:true});
    window.__texto=tx?new Function('k','return ('+tx+')(k)'):null;window.__tEnt=[];
    speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
    HTMLMediaElement.prototype.play=function(){const s=this,src=this.src;Object.defineProperty(s,'paused',{value:false,configurable:true});
      setTimeout(()=>{if(s.src!==src)return;Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()},100);return Promise.resolve()};
    window.addEventListener('DOMContentLoaded',()=>{   // cuándo pasa a «Entendiendo lo que dijiste…» (= la app dio por terminada la respuesta)
      new MutationObserver(()=>{const m=document.getElementById('practice-mict');if(m&&/Entendiendo/.test(m.textContent)&&!window.__tEnt.some(x=>performance.now()-x<500))window.__tEnt.push(performance.now())})
        .observe(document.body,{subtree:true,childList:true,characterData:true})});
  },[texto||null,!!crudo]);
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  return {p,ctx};
}
const kids=p=>p.evaluate(()=>[...document.querySelectorAll('#practice-chat .msg.kid')].map(m=>m.innerText.replace(/\s+/g,' ').trim()));
(async()=>{
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
let t,e;

// 0) cuándo una frase parece cortada a la mitad (la función sola)
{
  const b=await chromium.launch();const p=await b.newPage();
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.goto('file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  const CASOS=[['I went to the beach with my',1],['I went to the beach with my family.',0],['My name is Felu',0],['My name is',1],['My favourite colour is',1],['Yes, it is.',0],['Yes, it is',0],['It is',1],['I like',1],
    ['I like football',0],['I like football and',1],['Because',1],['I play football, ',1],['Um...',1],['I live in',1],['I live in a house.',0],['I think so.',0],['I want to',1],['I want to.',0],['Yes, I do',0],["No, I don't",0],
    ["I'm",1],["It's",1],['I have a dog and a',1],['Me too',0],['Blue',0],['',0],['I like playing with my',1],["I'm from Argentina.",0],['And you?',0],['I have',1],['Yes, I have.',0],['yes i have',0],['I go to school by',1],
    // las cifras cuentan como palabra y una pregunta cerrada con «?» está completa
    ["I'm 10.",0],["It's 5.",0],['I have 2',0],["I'm 10",0],['Where are you from?',0],['What are you looking at?',0],['Who do you live with?',0],
    // palabras que pueden cerrar una frase con punto, y respuestas cortas que terminan en «am», «is», «don't»
    ['So do I.',0],['Come on.',0],['Yes, very.',0],["It's Felu's.",0],['Yes, I am.',0],['Yes, I am',0],['No, I am not',0],
    // frases a medias que antes pasaban por completas
    ['I am',1],["I don't",1],['Yes, I want to',1],['Yes, I would like to',1],['No, I like',1],
    // respuestas cortas y comunes de un chico: completas
    ['Two brothers',0],['Monday and Tuesday',0],['In the kitchen',0],["I'm ten.",0],['Yes, it is.',0],
    // «yes/no» + una oración que termina en ser/tener NO es una respuesta corta: está a medias
    ['No, my favourite colour is',1],['Yes, my name is',1],['No, my brother is',1],['Yes, the dog is',1],['No, I am not',0],["No, he isn't",0],['Yes, there are',0],
    // las palabras que nunca cierran una frase la dejan a medias aunque tenga punto (la IA a veces se lo pone)
    ['I live in.',1],["I'm.",1],["It's.",1],['Because I.',1],['In.',1],["My name's.",1],["I've.",1],
    // frases hechas y preguntas del chico sin «?» (el dictado no las pone): completas
    ['Here you are.',0],['here you are',0],['so do i',0],['me too',0],['Where are you from',0],['What food do you like',0],['Who did you go with',0],['What are you looking at',0],
    // frases que no se sostienen solas
    ['I want',1],['I need',1],['I went',1],['I think',1],['My name',1],['My favourite colour',1],['They',1],['Because it',1],['I play',1],
    // sin puntuación y en minúsculas, como el dictado
    ['my name is felu',0],['i like football',0],['yes i do',0],['yes i am',0],['i live in',1],['i like pizza and',1],['i want to',1]];
  const mal=await p.evaluate(c=>c.filter(([t,e])=>(escuchaIncompleta(t)?1:0)!==e).map(x=>x[0]),CASOS);
  chk('«parece cortada a la mitad» acierta en '+CASOS.length+' frases (termina en «and», «with my», «because», «I\'m», una coma, «um…»: sí · «Yes, it is.», «I like football», «Me too»: no)',mal.length===0,JSON.stringify(mal));
  await b.close();
}

// 1) una pausa de 1,6 s en medio de la frase ya no la corta
{
  const b=await lanzar('habla_con_pausa.wav');
  t=await pagina(b,'k=>"I went to the beach with my family"');
  await t.p.click('#t-speak');await t.p.click('#practice-start');
  await t.p.waitForFunction(()=>document.querySelectorAll('#practice-chat .msg.kid').length>=1,null,{timeout:60000});
  await t.p.waitForTimeout(400);
  e=await t.p.evaluate(()=>({wavs:window.__wavs||[],kids:document.querySelectorAll('#practice-chat .msg.kid').length}));
  const largo=Math.max(...e.wavs.map(w=>w.dur));
  chk('pausa de 1,6 s entre dos mitades (voz 1,4 s + pausa + voz 1,4 s): el audio que se pasa a texto incluye la segunda mitad ('+largo.toFixed(1)+' s; antes se cortaba a los ~3,2 s)',largo>=5.5,JSON.stringify(e.wavs.map(w=>+w.dur.toFixed(1))));
  chk('...y es UNA sola respuesta, no dos ('+e.kids+' burbuja)',e.kids===1);
  await t.p.waitForFunction(()=>document.querySelectorAll('#practice-chat .msg.ex').length>=3,null,{timeout:30000});
  chk('la charla sigue sin errores de página',t.p.errs.length===0,JSON.stringify(t.p.errs));
  await t.p.click('#practice-stop');await t.ctx.close();await b.close();
}

// 2) si lo que dijo parece cortado a la mitad se espera más; si no, se sigue enseguida
{
  const b=await lanzar('habla_una_frase.wav');
  const medir=async(tx)=>{
    const u=await pagina(b,tx);
    await u.p.click('#t-speak');await u.p.click('#practice-start');
    await u.p.waitForFunction(()=>document.querySelectorAll('#practice-chat .msg.kid').length>=1,null,{timeout:60000});
    const r=await u.p.evaluate(()=>({tEarly:(window.__wavs||[])[0]&&window.__wavs[0].t,tEnt:window.__tEnt[0],n:(window.__wavs||[]).length}));
    const k=await kids(u.p);await u.p.click('#practice-stop');await u.ctx.close();
    return {espera:r.tEnt-r.tEarly,n:r.n,kid:k[0]}};
  const completa=await medir('k=>"I went to the beach with my family."');
  const cortada=await medir('k=>k===0?"I went to the beach with my":"I went to the beach with my family."');
  chk('frase completa: se la da por terminada enseguida (pasan '+completa.espera.toFixed(0)+' ms entre el primer pedido y «Entendiendo…»; esperable ~1000)',completa.espera>600&&completa.espera<1800,JSON.stringify(completa));
  chk('frase cortada a la mitad («…with my»): se espera bastante más ('+cortada.espera.toFixed(0)+' ms; esperable ~2500) y no se la corta ahí',cortada.espera>2000&&cortada.espera<4200&&cortada.espera>completa.espera+900,JSON.stringify(cortada));
  chk('ninguna de las dos es doble: una sola transcripción adelantada y la burbuja dice lo transcripto',completa.n===1&&cortada.n===1&&/beach/.test(completa.kid)&&/with my/.test(cortada.kid),JSON.stringify([completa.n,cortada.n,completa.kid,cortada.kid]));
  await b.close();
}
// 3) el selector «⏳ Pausas»: Más paciencia espera más, se guarda y vale para la práctica y el examen
{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',x=>p.errs.push(x.message));
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
  const est=()=>p.evaluate(()=>({fin:SIL_FIN_MS,max:SIL_FIN_MAX_MS,g:localStorage.getItem('trinity_pausa'),a:document.getElementById('practice-pausa').value,o:document.getElementById('oral-pausa').value}));
  e=await est();
  chk('por defecto «Normal»: espera 2 s de pausa (y hasta 3,5 s si la frase parece cortada)',e.fin===2000&&e.max===3500&&e.g===null&&e.a==='normal');
  await p.click('#t-speak');await p.selectOption('#practice-pausa','larga');e=await est();
  chk('«Más paciencia»: 3,2 s de pausa (hasta 5 s), se guarda y el selector del examen queda igual',e.fin===3200&&e.max===5000&&e.g==='larga'&&e.o==='larga');
  await p.reload();e=await est();
  chk('al recargar sigue en «Más paciencia»',e.fin===3200&&e.a==='larga'&&e.o==='larga');
  await p.click('#t-speak');await p.selectOption('#practice-pausa','normal');e=await est();
  chk('y volver a «Normal» borra lo guardado',e.fin===2000&&e.g===null&&e.o==='normal'&&p.errs.length===0,JSON.stringify([e,p.errs]));
  await b.close();
}
// 4) un ruido que SUBE después de hablar (control automático de ganancia, un ventilador) no puede «seguir hablando» para siempre: la respuesta termina igual
//    (una versión intermedia usaba el umbral bajo de voz sin límite de tiempo y la respuesta recién cerraba a los 45 s)
{
  const b=await lanzar('habla_y_ruido_que_sube.wav');
  t=await pagina(b,'k=>"I like football"',true);
  await t.p.click('#t-speak');await t.p.click('#practice-start');
  await t.p.waitForFunction(()=>!document.getElementById('practice-mic').hidden&&/Te escucho/.test(document.getElementById('practice-mict').textContent),null,{timeout:40000});
  const t0=Date.now();let llego=true;
  await t.p.waitForFunction(()=>document.querySelectorAll('#practice-chat .msg.kid').length>=1,null,{timeout:25000}).catch(()=>{llego=false});
  const seg=((Date.now()-t0)/1000);
  chk('el ruido sube después de hablar (picos entre el umbral bajo y el de voz): la respuesta se da por terminada a los '+seg.toFixed(1)+' s (esperable ~5; sin el límite de tiempo no terminaba hasta los 45 s)',llego&&seg<10);
  await t.ctx.close();await b.close();
}

// 5) dictado del navegador (sin IA): quien se queda callado no espera 45 s, y las esperas siguen al selector «Pausas»
{
  const b=await chromium.launch({args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream','--autoplay-policy=no-user-gesture-required']});
  const medir=async(habla,larga)=>{
    const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',x=>p.errs.push(x.message));
    await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
    await p.addInitScript(([habla,larga])=>{
      try{localStorage.setItem('trinity_sonido3','{"tts":1,"mp3":1}');if(larga)localStorage.setItem('trinity_pausa','larga')}catch(e){}
      class FakeSR{start(){setTimeout(()=>{this.onstart&&this.onstart();this.onaudiostart&&this.onaudiostart()},30);
          if(habla)setTimeout(()=>{window.__tRes=performance.now();this.onresult&&this.onresult({results:[[{transcript:'I like football'}]]})},400);
          else this._t=setTimeout(()=>{this.onerror&&this.onerror({error:'no-speech'});this.onend&&this.onend()},5000)}   // como Chrome con nadie hablando: «no-speech» a los ~5 s y se cierra
        stop(){clearTimeout(this._t)} abort(){clearTimeout(this._t)}}
      window.SpeechRecognition=window.webkitSpeechRecognition=FakeSR;
      speechSynthesis.speak=u=>{setTimeout(()=>u.onstart&&u.onstart(),20);setTimeout(()=>u.onend&&u.onend(),80)};
      HTMLMediaElement.prototype.play=function(){const s=this,src=this.src;Object.defineProperty(s,'paused',{value:false,configurable:true});
        setTimeout(()=>{if(s.src!==src)return;Object.defineProperty(s,'paused',{value:true,configurable:true});s.onended&&s.onended()},100);return Promise.resolve()};
      window.__ev=[];
      window.addEventListener('DOMContentLoaded',()=>{
        new MutationObserver(()=>{
          const m=document.getElementById('practice-mict');if(m&&/Te escucho/.test(m.textContent)&&!window.__ev.some(x=>x[1]==='escucha'))window.__ev.push([performance.now(),'escucha']);
          const k=document.querySelectorAll('#practice-chat .msg.kid').length;if(k>=1&&!window.__ev.some(x=>x[1]==='kid'))window.__ev.push([performance.now(),'kid']);
          const ex=document.querySelectorAll('#practice-chat .msg.ex').length;if(ex>=2&&!window.__ev.some(x=>x[1]==='ex2'))window.__ev.push([performance.now(),'ex2'])
        }).observe(document.body,{subtree:true,childList:true,characterData:true})});
    },[habla,larga]);
    await p.goto(process.env.URL||'file://'+require('path').resolve(__dirname,'..','felu','index.html'));
    await p.click('#t-speak');await p.click('#practice-start');
    await p.waitForFunction(w=>(window.__ev||[]).some(x=>x[1]===w),habla?'kid':'ex2',{timeout:70000}).catch(()=>{});
    const r=await p.evaluate(()=>({ev:window.__ev,tRes:window.__tRes}));await ctx.close();
    const g=k=>(r.ev.find(x=>x[1]===k)||[])[0];
    return habla?(g('kid')-r.tRes)/1000:(g('ex2')-g('escucha'))/1000};
  const normal=await medir(true,false),larga=await medir(true,true),callado=await medir(false,false);
  chk('dictado: tras la última palabra espera '+normal.toFixed(1)+' s con «Normal» (3) y '+larga.toFixed(1)+' s con «Más paciencia» (4,2)',normal>2.5&&normal<4&&larga>3.7&&larga<5.2);
  chk('dictado: quien no dice nada espera '+callado.toFixed(1)+' s hasta el «Sorry, I can\'t hear you» (esperable ~20; antes del arreglo eran 45)',callado>16&&callado<28);
  await b.close();
}
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
