// «English · 1.er grado» — la parte ORAL: abrir el micrófono, pasar la voz a texto con la IA y decidir si lo que dijo es lo que se pedía.
// Se apoya en lo ya probado con el examen oral de inglés (motor.js) y con el de la integradora: grabación en WAV (anda igual en PC, Android e iPhone), Firebase AI Logic con la configuración
// PÚBLICA de ../firebase-config.js (sin servidor ni claves secretas en el sitio) y el micrófono se abre sólo mientras contesta y se SUELTA enseguida (en iPhone, con el micrófono abierto la
// voz del navegador queda muda).
// Acá la IA hace UNA sola cosa: pasar la voz a texto. Decidir si estuvo bien lo hace la aplicación con reglas fijas (evaluar): así un chico de 6 años no depende de lo que se le ocurra a un
// modelo, la respuesta es la misma siempre y se puede probar. Las reglas son generosas a propósito: el acento de un chico hispanohablante no es un error («tree» por «three» vale),
// y se acepta cualquier forma razonable de decirlo («red», «it's red», «a red»).
// Lo que se manda afuera: el audio de cada respuesta, a la IA de Google (Gemini) por Firebase, sólo para pasarlo a texto. Acá no se guarda ningún audio.
// Sin IA (no hay configuración, no hay permiso de micrófono o la IA falló dos veces seguidas) la pantalla pasa sola a «decilo en voz alta y tocá ✔» (la autoevaluación de siempre).
(function(){
"use strict";
const I1=window.I1;if(!I1)return;
const pausa=ms=>new Promise(r=>setTimeout(r,ms));
const IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const LOG=[];function rklog(t){try{LOG.push(new Date().toTimeString().slice(0,8)+" "+t);if(LOG.length>60)LOG.shift()}catch(e){}}

// ---------------- la IA (Firebase AI Logic). Copiado de integradora/oral.js y motor.js: lo que ahí se ajustó con el uso real, vale acá.
const FB=window.TRINITY_FB||{},FB_VERSION="13.1.0",FB_MODELOS=["gemini-3.1-flash-lite","gemini-3.5-flash-lite","gemini-3.5-flash"];
const fbListo=()=>{const c=FB.config;return !!(c&&c.apiKey&&c.projectId&&c.appId)};
let _fbP=null,_fbBueno="";const _sinPensar=Object.create(null);   // modelos que rechazaron la opción de pensar poco
function fbCargar(){
  if(_fbP)return _fbP;
  _fbP=(async()=>{
    const base="https://www.gstatic.com/firebasejs/"+FB_VERSION+"/";
    const [A,I]=await Promise.all([import(base+"firebase-app.js"),import(base+"firebase-ai.js")]);
    const app=A.initializeApp(FB.config,"ingles1");   // (con nombre propio: otra pantalla del sitio puede haber iniciado la app por defecto)
    if(FB.appCheckSiteKey){   // App Check: sin esto Firebase rechaza los pedidos cuando se lo exige
      const C=await import(base+"firebase-app-check.js");
      const prov=FB.appCheckEnterprise?new C.ReCaptchaEnterpriseProvider(FB.appCheckSiteKey):new C.ReCaptchaV3Provider(FB.appCheckSiteKey);
      C.initializeAppCheck(app,{provider:prov,isTokenAutoRefreshEnabled:true});
    }
    return {ai:I.getAI(app,{backend:new I.GoogleAIBackend()}),getGenerativeModel:I.getGenerativeModel};
  })();
  _fbP.catch(()=>{_fbP=null});
  return _fbP;
}
// Prueba cada modelo de la lista: si uno no existe o no está disponible, pasa al siguiente (y si uno tarda, pide al siguiente en paralelo)
async function _fbGenerar(o){
  let tCarga;
  const {ai,getGenerativeModel}=await Promise.race([fbCargar(),new Promise((_,ko)=>{tCarga=setTimeout(()=>ko(new Error("tiempo agotado: no cargó la IA")),15000)})]).finally(()=>clearTimeout(tCarga));
  let nombres=(FB.models&&FB.models.length)?FB.models.slice():FB_MODELOS.slice();
  if(_fbBueno&&nombres.indexOf(_fbBueno)>0)nombres=[_fbBueno].concat(nombres.filter(x=>x!==_fbBueno));
  const total=o.ms||10000,cobertura=o.hedge||2500;
  const reintentable=/404|not found|not_found|not supported|unsupported|not available|429|500|502|503|504|overload|high demand|unavailable|resource.?exhausted|tiempo agotado|internal|failed to fetch/i;
  return new Promise((resolve,reject)=>{
    let hecho=false,pend=0,sig=0,ultimo=null,tCob=null;
    const fin=(f,v)=>{if(hecho)return;hecho=true;clearTimeout(tCob);clearTimeout(tTotal);f(v)};
    const tTotal=setTimeout(()=>fin(reject,ultimo||new Error("tiempo agotado")),total);
    const lanzar=()=>{
      if(hecho||sig>=nombres.length)return false;
      const nombre=nombres[sig++];pend++;
      (async()=>{
        try{
          const una=async pensar=>{
            const gc={temperature:o.temp,maxOutputTokens:o.tokens};
            if(pensar)gc.thinkingConfig={thinkingLevel:"MINIMAL"};   // sin «pensar» de más: acá no hace falta razonar y cada segundo se nota (sólo en los modelos que lo aceptan)
            const m=getGenerativeModel(ai,{model:nombre,generationConfig:gc});
            const r=await m.generateContent(o.partes);
            return r.response.text();
          };
          let txt;
          if(o.pensar&&!_sinPensar[nombre]){
            try{txt=await una(true)}
            catch(e){
              if(!/thinking/i.test(String(e&&e.message||e)))throw e;
              txt=await una(false);_sinPensar[nombre]=true;rklog("IA: "+nombre+" no acepta «pensar poco»");
            }
          }else txt=await una(false);
          if(!hecho){_fbBueno=nombre;fin(resolve,txt)}
        }catch(e){
          ultimo=e;console.warn("[IA ingles1] "+nombre+":",e);pend--;
          if(hecho)return;
          if(!reintentable.test(String(e&&e.message||e))){if(pend===0)fin(reject,e);return}
          if(!lanzar()&&pend===0)fin(reject,e);
        }
      })();
      clearTimeout(tCob);tCob=setTimeout(lanzar,cobertura);
      return true;
    };
    lanzar();
  });
}
let _calentada=false;
function calentarIA(){
  if(_calentada||!fbListo()||MOCK)return;_calentada=true;
  fbCargar().then(()=>_fbGenerar({partes:["hi"],temp:0,tokens:8,ms:20000,pensar:true})).catch(()=>{_calentada=false});   // (se entera ahora si el modelo no acepta «pensar poco», no en la primera respuesta)
}
function _iaMsg(e){
  let m=String((e&&e.message)||e||"").replace(/^AI:\s*/,"").replace(/Error fetching from \S+?:(\s+|$)/,"").trim();
  let pista="";
  if(/failed to fetch|networkerror|load failed|network request/i.test(m)||!m)pista=" · Revisá la conexión a internet.";
  else if(/quota|429|resource.?exhausted/i.test(m))pista=" · Se acabó el cupo gratis de la IA por ahora.";
  return (m||"sin detalle").slice(0,160)+pista;
}
const _blobB64=blob=>new Promise((ok,ko)=>{const f=new FileReader();f.onload=()=>ok(String(f.result).split(",")[1]);f.onerror=ko;f.readAsDataURL(blob)});

// ---------------- micrófono (grabación en WAV). Copiado de integradora/oral.js.
let _actx=null,_cap=null;
function primeAudio(){   // se llama DENTRO de un toque: en iPhone el audio sólo arranca así
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!_actx||_actx.state==="closed")_actx=new AC();if(_actx.state==="suspended")_actx.resume()}catch(e){}
}
function audioSesion(tipo){try{if(navigator.audioSession)navigator.audioSession.type=tipo}catch(e){}}
async function abrirMic(constraints){   // en iPhone, si el audio quedó en «sólo reproducir», Safari lo rechaza con InvalidStateError: se pasa a «grabar» antes de pedirlo y se reintenta una vez
  audioSesion("play-and-record");
  try{return await navigator.mediaDevices.getUserMedia(constraints)}
  catch(e){
    if(e&&e.name==="InvalidStateError"){audioSesion("auto");await pausa(400);audioSesion("play-and-record");return await navigator.mediaDevices.getUserMedia(constraints)}
    throw e;
  }
}
async function capIniciar(){
  if(_cap&&_cap.stream&&_cap.stream.getTracks().some(t=>t.readyState==="live"))return _cap;
  if(_cap)capDetener();
  primeAudio();
  const ctx=_actx;let stream;
  if(!ctx){const e=new Error("el navegador no pudo abrir el audio");e.name="AudioSuspendido";throw e}   // sin audio no se abre ni el micrófono: la pista quedaría abierta y en iPhone la voz queda muda
  try{stream=await abrirMic({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}})}   // sin supresión de ruido: en varias notebooks «recorta» la voz suave
  catch(e){if(_actx===ctx){_actx=null;try{ctx.close().catch(()=>{})}catch(x){}}audioSesion("auto");rklog("mic: no se pudo abrir ("+(e&&e.name||e)+")");throw e}
  const soltar=()=>{stream.getTracks().forEach(t=>t.stop());if(_actx===ctx)_actx=null;try{ctx.close().catch(()=>{})}catch(e){}audioSesion("auto")};
  let cap=null;
  try{
    if(_actx!==ctx){soltar();const e=new Error("cancelado");e.name="Cancelado";throw e}   // la pantalla se cerró mientras se abría
    if(ctx.state!=="running")await Promise.race([ctx.resume(),pausa(1500)]);
    if(ctx.state!=="running"){soltar();const e=new Error("el audio del navegador no arrancó sin un toque");e.name="AudioSuspendido";throw e}   // iPhone: sin un toque el audio queda «suspended»
    const src=ctx.createMediaStreamSource(stream),proc=ctx.createScriptProcessor(4096,1,1);
    cap={stream,src,proc,rate:ctx.sampleRate,onFrame:null,frames:0};
    proc.onaudioprocess=e=>{cap.frames++;if(cap.onFrame)cap.onFrame(e.inputBuffer.getChannelData(0))};
    src.connect(proc);proc.connect(ctx.destination);
    stream.getTracks().forEach(t=>{t.onended=()=>{if(_cap===cap)_cap=null}});
  }catch(e){soltar();throw e}   // lo que falle después de abrir el micrófono no puede dejar la pista viva
  _cap=cap;rklog("mic abierto ("+Math.round(ctx.sampleRate)+" Hz)");return cap;
}
function capDetener(){   // suelta TODO (pistas, AudioContext y modo de audio), aunque no hubiera captura
  const c=_cap;_cap=null;
  if(c){rklog("mic soltado");try{c.proc.onaudioprocess=null;c.proc.disconnect()}catch(e){}try{c.src.disconnect()}catch(e){}c.stream.getTracks().forEach(t=>t.stop())}
  if(_actx){const x=_actx;_actx=null;try{x.close().catch(()=>{})}catch(e){}}
  audioSesion("auto");
}
let micPerm="unknown";   // "ok" | "denied" | "nodev" | "error:X"
async function prepMic(){   // pide el permiso UNA vez al empezar (el cartel del navegador tarda) y suelta el micrófono: se abre de nuevo en cada respuesta
  if(micPerm==="ok")return "ok";
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){micPerm="nodev";return "nodev"}
  try{const st=await abrirMic({audio:true});st.getTracks().forEach(t=>t.stop());audioSesion("auto");micPerm="ok";rklog("permiso de micrófono: ok");return "ok"}
  catch(e){audioSesion("auto");const n=e&&e.name;micPerm=(n==="NotAllowedError"||n==="SecurityError")?"denied":(n==="NotFoundError"||n==="OverconstrainedError")?"nodev":"error:"+(n||"desconocido");rklog("permiso de micrófono: "+micPerm);return micPerm}
}
function _aWav(chunks,rate){   // 16 kHz, mono, 16 bits; si el micrófono grabó muy bajito se sube el volumen (máx. 20×)
  let n=0;chunks.forEach(c=>n+=c.length);
  const all=new Float32Array(n);let o=0;chunks.forEach(c=>{all.set(c,o);o+=c.length});
  let pk=0;for(let i=0;i<n;i++){const a=Math.abs(all[i]);if(a>pk)pk=a}
  const g=pk>0.003&&pk<0.5?Math.min(20,0.8/pk):1;
  const to=16000,ratio=rate/to,len=Math.floor(n/ratio),dv=new DataView(new ArrayBuffer(44+len*2));
  const w=(off,s)=>{for(let i=0;i<s.length;i++)dv.setUint8(off+i,s.charCodeAt(i))};
  w(0,"RIFF");dv.setUint32(4,36+len*2,true);w(8,"WAVE");w(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,to,true);dv.setUint32(28,to*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,"data");dv.setUint32(40,len*2,true);
  for(let i=0;i<len;i++){const a=Math.floor(i*ratio),b=Math.max(a+1,Math.min(n,Math.floor((i+1)*ratio)));let s=0;for(let j=a;j<b;j++)s+=all[j];
    const v=Math.max(-1,Math.min(1,(s/(b-a))*g));dv.setInt16(44+i*2,v<0?v*0x8000:v*0x7fff,true)}
  return new Blob([dv.buffer],{type:"audio/wav"});
}
const MSG_DENEGADO=()=>IS_IOS?"El iPhone no dejó usar el micrófono. En Safari tocá «aA» (a la izquierda de la dirección) → Configuración del sitio web → Micrófono → Permitir. Mientras tanto se contesta con «Lo dije»."
  :"El navegador no dejó usar el micrófono. Tocá el candado (o el ícono de la cámara) al lado de la dirección y permití el micrófono. Mientras tanto se contesta con «Lo dije».";

// ---------------- escuchar una respuesta
// Se abre el micrófono, se espera a que el chico hable y se corta solo cuando termina (un silencio) o cuando se toca de nuevo el micrófono.
// → {blob} | {mudo:true} (no se oyó voz) | {cancelado:true} | {error:"…"}
let corrida=0,finalizar=null;
async function escuchar(o){
  o=o||{};
  primeAudio();                       // (primero y sin esperar nada: tiene que ocurrir dentro del toque)
  const id=++corrida;if(finalizar)finalizar("cancelado");
  let cap;
  try{cap=await capIniciar()}
  catch(e){
    const n=e&&e.name;
    if(n==="Cancelado")return {cancelado:true};
    if(n==="NotAllowedError"||n==="SecurityError"){micPerm="denied";return {error:MSG_DENEGADO()}}
    if(n==="NotFoundError"||n==="OverconstrainedError"){micPerm="nodev";return {error:"No se encontró un micrófono en este aparato."}}
    if(n==="AudioSuspendido")return {error:"El audio no arrancó. Volvé a tocar el micrófono."};
    return {error:"No se pudo abrir el micrófono ("+(n||"error")+"). Probá de nuevo."};
  }
  if(id!==corrida){capDetener();return {cancelado:true}}
  return new Promise(res=>{
    const frames=[];let primeraVoz=-1,ultimaVoz=-1,vocales=0,piso=1,pedido=false,fin=false;
    const t0=performance.now(),max=o.max||8000,sil=o.sil||1500,espera=o.espera||(max>10000?9000:6500);
    let tVoz=0;
    const cerrar=como=>{
      if(fin)return;fin=true;clearInterval(iv);cap.onFrame=null;finalizar=null;capDetener();rklog("escuchar: "+como);
      if(como==="cancelado")return res({cancelado:true});
      if(vocales<2||primeraVoz<0)return res({mudo:true});
      const a=Math.max(0,primeraVoz-4),b=Math.min(frames.length-1,ultimaVoz+5);   // un poco de aire antes y después de lo que dijo
      res({blob:_aWav(frames.slice(a,b+1).map(f=>f.d),cap.rate),ms:Math.round((b-a+1)*4096/cap.rate*1000)});
    };
    finalizar=cerrar;
    cap.onFrame=f=>{
      if(fin)return;
      let s=0;for(let i=0;i<f.length;i++)s+=f[i]*f[i];const rms=Math.sqrt(s/f.length);
      const k=frames.length;frames.push({d:new Float32Array(f),r:rms});
      if(k<6)piso=Math.min(piso,Math.max(rms,0.0005));   // el ruido de fondo: lo más bajo de la primera medio segundo
      const umbral=Math.max(0.018,Math.min(piso,0.012)*3);   // (el piso de ruido no puede ser alto: si el chico habla justo al tocar, la primera medio segundo ya es voz y el umbral quedaría por encima de lo que dice)
      const voz=rms>umbral;
      if(voz){vocales++;if(primeraVoz<0&&vocales>=2)primeraVoz=k-1;ultimaVoz=k;tVoz=performance.now()}
      if(o.onNivel)try{o.onNivel(Math.min(100,Math.round(rms*500)))}catch(e){}
    };
    if(o.alAbrir)try{o.alAbrir()}catch(e){}
    const iv=setInterval(()=>{
      if(fin)return;const t=performance.now()-t0;
      if(pedido)return cerrar("pedido");                                       // se tocó el micrófono otra vez: «ya dije»
      if(primeraVoz>=0&&performance.now()-tVoz>=sil)return cerrar("silencio");  // habló y se calló
      if(primeraVoz<0&&t>=espera)return cerrar("mudo");                        // no dijo nada
      if(t>=max)return cerrar("tope");
      if(!_cap||!_cap.stream.getTracks().some(x=>x.readyState==="live"))return cerrar("cortado");   // se cortó el micrófono (otra app, llamada…)
    },90);
    terminarAhora=()=>{pedido=true};
  });
}
let terminarAhora=null;
const terminar=()=>{if(terminarAhora)terminarAhora()};
function parar(){corrida++;terminarAhora=null;if(finalizar)finalizar("cancelado");else capDetener()}

// ---------------- pasar la voz a texto
let MOCK=null;   // sólo para las pruebas: {generar: async partes => texto}
let fallas=0,iaCaida=false;
const PROMPT_TRANSCRIBIR="Transcribe exactly what the speaker says in this audio. The speaker is a child of 6 or 7 from Argentina who is learning English: they say English words, letters, numbers, dates or short English sentences, with a Spanish accent. Write the English words with English spelling (for example: red, three, Monday, My name is…). Do not translate, do not correct the grammar and do not add words they did not say. If they say letters of the alphabet, write each letter. If they count, write the numbers as words. If there is no voice or only noise, answer with an empty string. Reply ONLY with the transcription, with no quotes and no comments.";
function ayudaDe(tema){   // palabras del tema que pueden aparecer (sólo para escribirlas bien si las dice)
  const t=I1.TEMA&&I1.TEMA[tema];if(!t||!t.items||!t.items.length)return "";
  const ws=[];t.items.forEach(x=>{if(!x.extra&&ws.length<30){ws.push(x.say&&x.say!==x.en?x.en+"/"+x.say:x.en)}});
  return ws.join(", ");
}
function limpiarTexto(t){
  let s=(typeof t==="string"||typeof t==="number"?String(t):"").trim().replace(/^["“«]+|["”»]+$/g,"").trim();
  if(/^[(\[].*[)\]]$/.test(s))return "";                       // «(silence)», «[no voice]»…
  s=s.replace(/\bsex\b/gi,"six");                              // la IA suele oír así el «six» de un chico hispanohablante: no se le muestra otra cosa
  return s.replace(/\s+/g," ").slice(0,200);
}
async function transcribir(blob,o){
  try{
    const ayuda=ayudaDe(o&&o.pista);
    const partes=[PROMPT_TRANSCRIBIR+(ayuda?"\nWords that may appear (only to spell them right if the child says them; do not add them if the child does not say them): "+ayuda:""),{inlineData:{mimeType:"audio/wav",data:await _blobB64(blob)}}];
    const txt=MOCK?await MOCK.generar(partes):await _fbGenerar({partes,temp:0,tokens:200,ms:12000+Math.min(20000,Math.round(blob.size/32000*400)),hedge:3500,pensar:true});
    fallas=0;return {texto:limpiarTexto(txt)};
  }catch(e){
    fallas++;rklog("IA: falló ("+_iaMsg(e).slice(0,80)+")");console.warn("[IA ingles1] transcribir:",e);
    if(fallas>=2&&!iaCaida){iaCaida=true;rklog("IA: falló 2 veces seguidas: se pasa a «lo dije»")}
    return {error:"No pude escuchar bien. "+(iaCaida?"Se contesta con «Lo dije».":"Probá de nuevo.")};
  }
}

// ---------------- qué respuestas valen
const N=s=>String(s==null?"":s).toLowerCase().replace(/[’'`´]/g,"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
function lev(a,b){
  if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length;
  let prev=[];for(let j=0;j<=b.length;j++)prev[j]=j;
  for(let i=1;i<=a.length;i++){const cur=[i];for(let j=1;j<=b.length;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=cur}
  return prev[b.length];
}
// dos palabras «son la misma»: iguales o casi (una letra de diferencia desde 5 letras, dos desde 8)
const parecidas=(a,b)=>a===b||(Math.min(a.length,b.length)>=5&&lev(a,b)<=1)||(Math.min(a.length,b.length)>=8&&lev(a,b)<=2);
// así se escriben las letras y los números cuando la IA los oye (nombres de las letras, números en cifras, palabras que suenan igual)
const LETRA_HOMO={A:["ay","eh","ei","hey a"],B:["bee","be","bi"],C:["see","sea","si","cee"],D:["dee","di"],E:["ee","i e"],F:["eff","ef","ef f"],G:["jee","gee","yi"],H:["aitch","haitch","eich","ach"],I:["eye","ai","aye"],J:["jay","yei","jei"],K:["kay","kei","ka"],L:["el","ell","l"],M:["em","m"],N:["en","n"],O:["oh","owe","o"],P:["pee","pea","pi"],Q:["cue","queue","kyu","kiu"],R:["ar","are","r"],S:["ess","es","s"],T:["tee","tea","ti"],U:["you","yu","u","ew"],V:["vee","vi","ve"],W:["double you","double u","doubleu","dabliu","w"],X:["ex","eks","x"],Y:["why","wye","wai","y"],Z:["zed","zee","zi","z"]};
const NUM_HOMO={1:["won","wan"],2:["to","too","tu"],3:["tree","free","tri"],4:["for","fore","four"],5:["fife"],6:["sicks"],7:["sevin"],8:["ate","eit"],9:["nain","nein"],10:["tan"],12:["twelf"],13:["thirten","tirteen"],15:["fifthteen"],20:["twenti"]};
const SING={eyes:"eye",ears:"ear",hands:"hand",arms:"arm",legs:"leg",fingers:"finger",toes:"toe",feet:"foot",crayons:"crayon"};
function aceptaDe(it){
  if(!it)return [];
  const out=new Set(),add=x=>{const n=N(x);if(n)out.add(n)};
  add(it.say);add(it.en);
  const id=String(it.id||"");
  if(/^l[A-Z]$/.test(id)){const L=id.slice(1);add(L);(LETRA_HOMO[L]||[]).forEach(add)}
  if(/^n\d+$/.test(id)&&it.n){add(String(it.n));(NUM_HOMO[it.n]||[]).forEach(add)}
  if(/^o\d+$/.test(id)&&it.n){add(String(it.n));add(I1.NUM_EN[it.n]||"")}
  if(SING[it.en])add(SING[it.en]);
  if(it.en==="grey")add("gray");
  if(it.en==="red")add("read");
  if(it.en==="blue"){add("blew");add("blu")}
  if(it.en==="green")add("grin");   // (así suena el «green» de un chico hispanohablante y así lo suele escribir la IA)
  if(it.en==="pencil")add("pensil");
  if(/^good (morning|afternoon)$/i.test(it.en))add(it.en.split(" ")[1]);
  return [...out];
}

// todas las palabras que el programa enseña (para no confundir «casi» con «dijo OTRA palabra»)
let CONOCIDAS=null;
function conocidas(){
  if(CONOCIDAS)return CONOCIDAS;CONOCIDAS=new Set();
  Object.keys(I1.ITEM||{}).forEach(k=>{const x=I1.ITEM[k];[x.en,x.say].forEach(v=>{const n=N(v);if(n&&n.length>1)CONOCIDAS.add(n)});aceptaDe(x).forEach(v=>{if(v.length>1&&!/^\d+$/.test(v))CONOCIDAS.add(v)})});
  return CONOCIDAS;
}
const PORTA=new Set("its it is this that thats im i am a an the number letter color colour uh um eh ah hm hmm mm well ok okay".split(" "));
const NUMW={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20};
const NUMH={};Object.keys(NUM_HOMO).forEach(n=>NUM_HOMO[n].forEach(w=>{NUMH[N(w)]=+n}));
// una palabra suelta que se dice como número → la palabra en inglés (cifras y palabras que suenan parecido); si no es número se queda igual
const comoNumero=w=>{if(/^\d{1,2}$/.test(w)&&+w<=20)return I1.NUM_EN[+w];if(NUMH[w]!==undefined&&NUMH[w]<=20&&!NUMW.hasOwnProperty(w))return I1.NUM_EN[NUMH[w]];return w};
function subsec(t,a){   // ¿la lista «a» aparece entera y seguida dentro de «t»?
  if(!a.length)return false;for(let i=0;i+a.length<=t.length;i++){let ok=true;for(let j=0;j<a.length;j++)if(t[i+j]!==a[j]){ok=false;break}if(ok)return true}return false;
}
function lcs(esp,dich,igual){   // cuántas de las palabras esperadas aparecen, en orden, entre lo dicho (con palabras de más o de menos en el medio)
  const m=esp.length,n=dich.length,d=[];for(let i=0;i<=m;i++){d.push(new Array(n+1).fill(0))}
  for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=igual(esp[i-1],dich[j-1])?d[i-1][j-1]+1:Math.max(d[i-1][j],d[i][j-1]);
  return d[m][n];
}
const R=(res,dijo)=>({res,dijo});
const CONTRAE={im:["i","am"],hes:["he","is"],shes:["she","is"],its:["it","is"],thats:["that","is"],whats:["what","is"],youre:["you","are"],theyre:["they","are"],dont:["do","not"],doesnt:["does","not"],cant:["can","not"],isnt:["is","not"],names:["name","is"]};
const expandir=ts=>ts.reduce((a,w)=>a.concat(CONTRAE[w]||[w]),[]);   // «im six» → «i am six»

// ·· una palabra (o una frase corta) que se repite o se nombra
function evPalabra(ev,texto){
  const full=N(texto);if(!full)return R("no","");
  const acepta=(ev.acepta||[]).map(N).filter(Boolean);if(!acepta.length)return R("no",full);
  const t0=full.split(" "),t1=t0.filter(w=>!PORTA.has(w)),sinNum=t0.map(comoNumero);
  const largas=acepta.filter(a=>a.split(" ").length>=3);
  // 1) lo dicho es una de las respuestas, o la contiene (con pocas palabras de más)
  if(acepta.indexOf(full)>=0)return R("ok",full);
  for(const a of acepta){
    const A=a.split(" ");
    if(A.length>=3)continue;
    const tope=A[0].length<=2?3:5;   // una letra suelta («a», «oh»): sólo si casi no dijo otra cosa
    for(const T of [t0,t1,sinNum])if(T.length<=tope&&subsec(T,A))return R("ok",full);
  }
  // 2) frases de tres palabras o más («Open your book»): se compara palabra por palabra, sin contar los artículos
  if(largas.length){
    let mejor=0;
    largas.forEach(a=>{const A=a.split(" ").filter(w=>w!=="a"&&w!=="an"&&w!=="the"),T=t0.filter(w=>w!=="a"&&w!=="an"&&w!=="the");mejor=Math.max(mejor,A.length?lcs(A,T,parecidas)/A.length:0)});
    if(mejor>=.99)return R("ok",full);if(mejor>=.6)return R("casi",full);
  }
  // 3) si dijo OTRA palabra que el programa enseña, no es «casi»: es otra cosa
  const K=conocidas(),propias=new Set(acepta);
  for(const T of [t1.join(" "),t0.join(" ")])if(T&&K.has(T)&&!propias.has(T))return R("no",full);
  if(t1.some(w=>K.has(w)&&!propias.has(w)&&!acepta.some(a=>a.split(" ").indexOf(w)>=0)))return R("no",full);
  // 4) se parece mucho: la IA oyó algo cercano (o dijo sólo una parte de una frase de dos palabras: «Sit» por «Sit down»)
  let casi=false;
  for(const a of acepta){const A=a.split(" "),T=t1.length?t1:t0;if(A.length===2&&T.length>=1&&T.length<A.length&&T.every(w=>A.some(x=>parecidas(w,x))))casi=true}
  for(const a of acepta){
    const A=a.split(" ");if(A.length>=3)continue;
    for(const cand of [t1.join(" "),t0.join(" "),...t1]){
      if(!cand)continue;
      const dist=lev(cand,a),L=Math.min(cand.length,a.length);
      if(L>=5&&dist<=1)return R("ok",full);
      if((L>=6&&dist<=2)||(L>=3&&dist<=1&&!K.has(cand)))casi=true;
    }
  }
  return R(casi?"casi":"no",full);
}

// ·· una serie en orden (contar, los días, los meses)
function evSerie(ev,texto){
  const full=N(texto);if(!full)return R("no","");
  const lista=ev.lista.map(N);let t=full.split(" ").map(comoNumero);
  const unidos=[];for(let i=0;i<t.length;i++){if(i+1<t.length&&lista.indexOf(t[i]+t[i+1])>=0&&lista.indexOf(t[i])<0){unidos.push(t[i]+t[i+1]);i++}else unidos.push(t[i])}   // «sun day» → «sunday»
  const n=lcs(lista,unidos,(a,b)=>a===b||(a.length>=5&&b.length>=5&&lev(a,b)<=(a.length>=7?2:1)));
  return R(n>=ev.min?"ok":n>=ev.casi?"casi":"no",full);
}

// ·· la fecha: «Today is Monday the 5th»
function evFecha(ev,texto){
  const full=N(texto);if(!full)return R("no","");
  const t=full.split(" "),dia=N(ev.dia),DIAS=I1.DIAS_EN.map(N);
  // el día: la palabra, o con una letra de diferencia; nunca «today» (a dos letras de «monday») ni otro día de la semana
  const tieneDia=t.some(w=>w===dia||(w.length>=5&&w!=="today"&&DIAS.indexOf(w)<0&&lev(w,dia)<=1));
  const n=ev.n,card=n<=20?(I1.NUM_EN[n]||""):(["","","twenty","thirty"][Math.floor(n/10)]+(n%10?" "+I1.NUM_EN[n%10]:""));
  const formas=[String(n),N(I1.ordNum(n)),N(I1.ORD_EN[n]||""),N(card)].filter(Boolean),ordUno=N(I1.ORD_EN[n]||"");   // «5», «5th», «fifth» / «twenty fifth», «five» / «twenty five»
  const decenas=new Set(["twenty","thirty"]);
  // el número: la palabra o las palabras seguidas; si lo de antes es «twenty» o «thirty», «fifth» es el 25, no el 5
  const hay=f=>{const F=f.split(" ");for(let i=0;i+F.length<=t.length;i++){let ok=true;for(let k=0;k<F.length;k++)if(t[i+k]!==F[k]){ok=false;break}if(ok&&(F.length>1||!decenas.has(t[i-1]||"")))return true}return false};
  const tieneNum=formas.some(hay)||t.some((w,i)=>w.length>=5&&ordUno.length>=5&&ordUno.indexOf(" ")<0&&lev(w,ordUno)<=1&&!decenas.has(t[i-1]||""));
  return R(tieneDia&&tieneNum?"ok":tieneDia||tieneNum?"casi":"no",full);
}

// ·· una frase entera
function evFrase(ev,texto){
  const full=N(texto);if(!full)return R("no","");
  const SIN=w=>w!=="a"&&w!=="an"&&w!=="the";
  const E=expandir(N(ev.frase).split(" ")).filter(SIN),T=expandir(full.split(" ").map(comoNumero)).filter(SIN);
  const n=lcs(E,T,parecidas),r=E.length?n/E.length:0;
  return R(r>=.99||(E.length>=6&&n>=E.length-1)?"ok":r>=.6?"casi":"no",full);
}

// ·· respuestas «con sus datos»: el nombre, la edad, cómo está, si le gusta algo
const ESTADOS=["fine","good","great","happy","ok","okay","well","sad","tired","hungry","sleepy","bad","so so","very well","not bad","angry","hot","cold","sick","excited","super"];
const NO_NOMBRE=new Set("yes no hello hi bye goodbye fine good thanks thank please ok okay maybe sorry what why how you i am is the my name are very well".split(" "));
function evAbierta(ev,texto){
  const full=N(texto);if(!full)return R("no","");
  const sinFiller=expandir(full.split(" ").filter(w=>["uh","um","eh","ah","hm","hmm","mm"].indexOf(w)<0)),s=sinFiller.join(" ");
  const tiene=x=>subsec(sinFiller,x.split(" "));
  const soyYo=tiene("i am");   // («I'm» ya se abrió como «i am»)
  if(ev.de==="nombre"){
    // «My name is Ana», «My name's Ana», «I'm Ana»: lo que viene después tiene que parecer un nombre (no «six», «fine» ni nada)
    let resto=null;const i=sinFiller.findIndex((w,k)=>w==="is"&&k>0&&sinFiller[k-1]==="name"),j=sinFiller.findIndex((w,k)=>w==="am"&&k>0&&sinFiller[k-1]==="i");
    if(i>=0)resto=sinFiller.slice(i+1);else if(j>=0)resto=sinFiller.slice(j+1);
    const ajeno=w=>NO_NOMBRE.has(w)||ESTADOS.indexOf(w)>=0||NUMW[comoNumero(w)]!==undefined||/^\d+$/.test(w)||w==="years"||w==="old";
    if(resto!==null)return R(resto.length&&!ajeno(resto[0])?"ok":"no",full);
    // dijo sólo algo suelto: si parece un nombre le falta la frase («casi»); si es otra palabra («hello», «yes», un color…) no
    if(sinFiller.length<=2&&!sinFiller.some(w=>ajeno(w)||conocidas().has(w)))return R("casi",full);
    return R("no",full);
  }
  if(ev.de==="edad"){
    const num=sinFiller.some(w=>{const c=comoNumero(w);return NUMW[c]!==undefined&&NUMW[c]>=3&&NUMW[c]<=15});
    if(!num)return R("no",full);
    return R(soyYo||tiene("years old")?"ok":"casi",full);   // «Six.» sola no alcanza: lo que se practica es «I'm six»
  }
  if(ev.de==="estado"){
    const feel=ESTADOS.some(e=>tiene(e));
    if(!feel)return R("no",full);
    return R(soyYo||tiene("thank you")||tiene("thanks")?"ok":"casi",full);
  }
  if(ev.de==="gusto"){
    if(/\b(know|understand|remember|sure)\b/.test(s))return R("no",full);   // «I don't know» no contesta la pregunta
    const si=sinFiller.some(w=>["yes","yeah","yep","yup"].indexOf(w)>=0),no=sinFiller.some(w=>w==="no"||w==="nope");
    const negFrase=tiene("do not")||tiene("hate"),posFrase=!tiene("do not")&&(tiene("i like")||tiene("i love")||tiene("i do"));
    if(si&&no)return R("no",full);
    if((si||posFrase)&&(no||negFrase))return R("casi",full);   // se contradice: «yes, I don't», «no, I do»
    if(si&&posFrase)return R("ok",full);                          // «yes, I do», «yes, I like pizza»
    if(no&&negFrase)return R("ok",full);                          // «no, I don't»
    if(posFrase||negFrase)return R("ok",full);                    // «I do», «I like pizza», «I don't», «I don't like pizza»
    if(si||no)return R("casi",full);                              // «yes» o «no» a secas: falta «I do» / «I don't»
    return R("no",full);
  }
  return R("no",full);
}
function evaluar(ev,texto){
  texto=String(texto==null?"":texto);
  try{
    switch(ev&&ev.k){
      case "palabra":return evPalabra(ev,texto);
      case "serie":return evSerie(ev,texto);
      case "fecha":return evFecha(ev,texto);
      case "frase":return evFrase(ev,texto);
      case "abierta":return evAbierta(ev,texto);
    }
  }catch(e){console.warn("[ingles1] evaluar:",e)}
  return R("no",N(texto));
}

// ---------------- lo que ve el resto de la app
async function preparar(ST){
  if(!fbListo()||(ST&&ST.ia===false))return "off";      // sin IA no hay micrófono que pedir: se contesta con «Lo dije»
  const p=MOCK?"ok":await prepMic();calentarIA();return p;
}
const disponible=ST=>({ia:!!(fbListo()||MOCK)&&!(ST&&ST.ia===false)&&!iaCaida&&micPerm!=="denied"&&micPerm!=="nodev"});
const msgPermiso=p=>p==="denied"?MSG_DENEGADO():p==="nodev"?"No se encontró un micrófono en este aparato. Se contesta con «Lo dije».":"";
I1.oral={configurada:fbListo,disponible,preparar,escuchar,terminar,parar,transcribir,evaluar,aceptaDe,msgPermiso,
  _t:{N,lev,evPalabra,evSerie,evFecha,evFrase,evAbierta,comoNumero,limpiarTexto,aWav:_aWav,log:LOG,
    mock:m=>{MOCK=m;fallas=0;iaCaida=false},reset:()=>{fallas=0;iaCaida=false;micPerm="unknown";corrida++},estado:()=>({fallas,iaCaida,micPerm})}};
})();
