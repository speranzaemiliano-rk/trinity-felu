// MOTOR de los módulos Trinity (el mismo para todos): voz y micrófono, charla con el examinador (con y sin IA), nota, revisión de sonido, examen escrito, aviso de versión nueva.
// El contenido de cada módulo (preguntas, vocabulario, textos para la IA) está en contenido-gN.js, que se carga antes. Ver README, «Módulos».
// ---- ordinales
const ord=["first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth","thirteenth","fourteenth","fifteenth","sixteenth","seventeenth","eighteenth","nineteenth","twentieth","twenty-first","twenty-second","twenty-third","twenty-fourth","twenty-fifth","twenty-sixth","twenty-seventh","twenty-eighth","twenty-ninth","thirtieth","thirty-first"];
const irr=new Set([1,2,3,5,8,9,12,20,30]);
const suf=n=>(n%10==1&&n!=11)?"st":(n%10==2&&n!=12)?"nd":(n%10==3&&n!=13)?"rd":"th";
{const _ord=document.getElementById("ordinals");if(_ord)_ord.innerHTML=ord.map((w,i)=>{const n=i+1;return `<div role="button" tabindex="0" data-say="${w}" class="${irr.has(n)?'irr':''}"><span class="n">${n}${suf(n)}</span><span>${w}</span></div>`}).join("");}

// ---- conversación con el examinador (práctica y examen oral)
document.addEventListener("click",e=>{if(e.target.id!=="dgVoice")return;
  const lg=$("dgLog");lg.innerHTML="";const add=(ok,t)=>{const li=document.createElement("li");li.className=ok?"ok":"no";li.innerHTML=t;lg.appendChild(li)};
  if(!window.speechSynthesis){add(false,"Este navegador no puede leer en voz alta. Usá Chrome.");return}
  const v=speechSynthesis.getVoices(),en=v.filter(x=>/^en/i.test(x.lang));
  add(en.length>0,en.length?"Voces en inglés: <b>"+en.length+"</b>":"No hay voces en inglés instaladas ("+v.length+" voces en total). En Android: Ajustes → Texto a voz → Google → Instalar datos de voz → English.");
  say("Hello! Can you hear me? Very good!",m=>add(false,m)).then(()=>add(true,"Si escuchaste \"Hello, can you hear me?\", la voz anda. Si no, subí el volumen <b>multimedia</b> y sacá el modo silencio."));
});

// ---- probador de micrófono
(function(){
  const log=(ok,t)=>{const li=document.createElement("li");li.className=ok===true?"ok":ok===false?"no":"";li.innerHTML=t;$("dgLog").appendChild(li)};
  let stream=null,ctx=null,raf=0,r=null;
  function stop(){cancelAnimationFrame(raf);if(stream)stream.getTracks().forEach(t=>t.stop());if(ctx)ctx.close().catch(()=>{});stream=ctx=null;if(r){try{r.abort()}catch(e){}r=null};$("dgLvl").style.width="0"}
  $("dgGo").onclick=async()=>{
    stop();$("dgLog").innerHTML="";$("dgHeard").hidden=true;
    const ua=navigator.userAgent,isEdge=/Edg\//.test(ua),isChrome=/Chrome\//.test(ua)&&!isEdge&&!/OPR|Brave/.test(ua);
    const brave=!!(navigator.brave);
    log(null,"Navegador: <b>"+(brave?"Brave":isEdge?"Edge":/OPR/.test(ua)?"Opera":isChrome?"Chrome":/Firefox/.test(ua)?"Firefox":/Safari/.test(ua)?"Safari":"otro")+"</b>"+(brave||/OPR|Firefox/.test(ua)?" — este navegador no tiene dictado por voz. Usá <b>Chrome</b> o <b>Edge</b>.":""));
    log(location.protocol==="https:",location.protocol==="https:"?"Página segura (https)":"La página no es https: el micrófono no va a funcionar. Abrí el link de github.io.");
    // 1) nivel de sonido
    try{
      stream=await abrirMic({audio:true});
      const tr=stream.getAudioTracks()[0];log(true,"Permiso de micrófono OK. Usando: <b>"+esc(tr.label||"micrófono")+"</b>");
      ctx=new (window.AudioContext||window.webkitAudioContext)();const an=ctx.createAnalyser();an.fftSize=512;ctx.createMediaStreamSource(stream).connect(an);
      const buf=new Uint8Array(an.fftSize);let peak=0,t0=performance.now(),told=false;
      const tick=()=>{an.getByteTimeDomainData(buf);let m=0;for(const v of buf)m=Math.max(m,Math.abs(v-128));peak=Math.max(peak,m);$("dgLvl").style.width=Math.min(100,m*1.6)+"%";
        if(!told&&performance.now()-t0>4000){told=true;log(peak>8,peak>8?"El micrófono capta sonido.":"El micrófono no capta sonido. Probablemente Chrome está usando otro micrófono: entrá a <b>chrome://settings/content/microphone</b> y elegí el correcto en la lista de arriba. Revisá también que no esté silenciado en Windows.")}
        raf=requestAnimationFrame(tick)};tick();
    }catch(e){log(false,"No se pudo abrir el micrófono ("+esc(e.name)+"). "+(e.name==="InvalidStateError"?"El iPhone no pudo abrir el micrófono en este momento: cerrá otras apps que lo usen (llamada, Siri, grabador), recargá la página y probá de nuevo. ":"")+(e.name==="NotAllowedError"?"Tocá el ícono del candado junto a la dirección → Micrófono → Permitir, y recargá.":e.name==="NotFoundError"?"La PC no tiene micrófono conectado.":""));return}
    // 2) reconocimiento de voz
    const SRc=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SRc){log(false,"Este navegador no tiene reconocimiento de voz. Usá <b>Chrome</b> o <b>Edge</b>.");return}
    r=new SRc();r.lang="en-GB";r.interimResults=true;r.continuous=false;
    let got=false;
    r.onstart=()=>log(true,"Reconocimiento de voz iniciado. Decí <b>\"hello, my name is…\"</b>");
    r.onspeechstart=()=>log(true,"Detectó que estás hablando…");
    r.onresult=e=>{got=true;const t=[...e.results].map(x=>x[0].transcript).join(" ");$("dgHeard").hidden=false;$("dgHeard").innerHTML="Entendió: <b>"+esc(t)+"</b>"};
    r.onerror=e=>log(false,"Error del reconocimiento: <b>"+e.error+"</b>. "+({network:"No se puede conectar con el servicio de voz (lo bloquea la red, un antivirus o el navegador). Probá con <b>Edge</b> (PC) o Chrome (Android); en iPhone ningún navegador trae dictado confiable.","not-allowed":"Falta permiso de micrófono.","service-not-allowed":"El navegador no permite el dictado. Usá Chrome o Edge.","no-speech":"No escuchó voz: revisá qué micrófono usa Chrome (paso de arriba).","aborted":(IA_ON?"El dictado de Chrome se cortó solo: pasa con algunos micrófonos de notebook (Intel Smart Sound). No es grave: la conversación usa la grabación con IA y no necesita el dictado. Probala en Speaking.":"El dictado de Chrome se cortó solo. Probá con Edge o escribí con ⌨️."),"audio-capture":"No encuentra el micrófono."}[e.error]||""));
    r.onend=()=>{log(got,got?"¡Funciona! Ya podés usar la conversación.":"Terminó sin entender nada.");r=null;setTimeout(stop,1500)};
    try{r.start()}catch(e){log(false,"No se pudo iniciar: "+esc(e.message))}
  };
  $("diag").addEventListener("toggle",()=>{if(!$("diag").open)stop()});
})();

// ---- examinador con IA (opcional) y micrófono por grabación
// Hay dos maneras de conectar la IA (la primera tiene prioridad):
//  1) Firebase AI Logic: se completa firebase-config.js. Sin servidor y sin claves secretas en el sitio.
//  2) Un worker propio (carpeta ia-worker/): se guarda al abrir el sitio con ?ia=URL.
const _FB=window.TRINITY_FB||{};
const FB_VERSION="13.1.0";
const FB_MODELOS=["gemini-3.1-flash-lite","gemini-3.5-flash-lite","gemini-3.5-flash"];
function fbListo(){const c=_FB.config;return !!(c&&c.apiKey&&c.projectId&&c.appId)}
const IA_URL=(function(){try{const q=new URLSearchParams(location.search).get("ia");if(q&&/^https:\/\//.test(q))localStorage.setItem("trinity_ia_url",q);return localStorage.getItem("trinity_ia_url")||""}catch(e){return ""}})();
const IA_ON=fbListo()||!!IA_URL;
const IS_IOS=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
// Con IA, la voz se graba y se transcribe: anda igual en PC, Android e iPhone (el dictado del navegador falla en muchos equipos).
let sttRec=IA_ON;
// iOS 26 o más nuevo + app instalada: Apple tiene un error abierto (WebKit 295518 y 291892) que deja mudo el audio de las apps instaladas: play() responde bien y no suena
const IOS_VER=(function(){const m=/Version\/(\d+)/.exec(navigator.userAgent);return IS_IOS&&m?parseInt(m[1],10):0})();
const esInstalada=()=>!!(navigator.standalone||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches));

// --- Firebase AI Logic (se carga recién cuando hace falta)
let _fbP=null,_fbBueno="";
function fbCargar(){
  if(_fbP)return _fbP;
  _fbP=(async()=>{
    const base="https://www.gstatic.com/firebasejs/"+FB_VERSION+"/";
    const [A,I]=await Promise.all([import(base+"firebase-app.js"),import(base+"firebase-ai.js")]);
    const app=A.initializeApp(_FB.config);
    // App Check: sin esto Firebase rechaza los pedidos cuando se lo exige (obligatorio para AI Logic desde el 2/11/2026)
    if(_FB.appCheckSiteKey){
      const C=await import(base+"firebase-app-check.js");
      const prov=_FB.appCheckEnterprise?new C.ReCaptchaEnterpriseProvider(_FB.appCheckSiteKey):new C.ReCaptchaV3Provider(_FB.appCheckSiteKey);
      C.initializeAppCheck(app,{provider:prov,isTokenAutoRefreshEnabled:true});
    }
    return {ai:I.getAI(app,{backend:new I.GoogleAIBackend()}),getGenerativeModel:I.getGenerativeModel,Schema:I.Schema};
  })();
  _fbP.catch(()=>{_fbP=null});
  return _fbP;
}
// Precalentamiento: la primera llamada en frío tarda varios segundos (carga del SDK, App Check, conexión). Se hace antes de que la necesites.
let _calentada=false;
function calentarIA(){
  if(_calentada||!fbListo())return;_calentada=true;
  fbCargar().then(()=>_fbGenerar({contents:[{role:"user",parts:[{text:"hi"}]}],temp:0,tokens:2,ms:20000})).catch(()=>{_calentada=false});
}
// Prueba cada modelo de la lista: si uno no existe o no está disponible, pasa al siguiente
async function _fbGenerar(o){
  const {ai,getGenerativeModel,Schema}=await fbCargar();
  let nombres=(_FB.models&&_FB.models.length)?_FB.models.slice():FB_MODELOS.slice();
  if(o.fuerte)nombres.reverse();   // trabajos donde importa más la calidad que la rapidez (la nota): se prueba primero el modelo más capaz
  else if(_fbBueno&&nombres.indexOf(_fbBueno)>0)nombres=[_fbBueno].concat(nombres.filter(x=>x!==_fbBueno));
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
          const gc={temperature:o.temp,maxOutputTokens:o.tokens};if(o.json)gc.responseMimeType="application/json";
          if(o.schema&&Schema)gc.responseSchema=o.schema(Schema);   // la IA tiene que devolver exactamente estos campos
          const params={model:nombre,generationConfig:gc};if(o.system)params.systemInstruction=o.system;
          const m=getGenerativeModel(ai,params);
          const r=await m.generateContent(o.partes?o.partes:{contents:o.contents});
          const txt=r.response.text();
          _fbBueno=nombre;fin(resolve,txt);
        }catch(e){
          ultimo=e;console.warn("[IA] "+nombre+":",e);pend--;
          if(hecho)return;
          if(!reintentable.test(String(e&&e.message||e))){if(pend===0)fin(reject,e);return}   // cambiar de modelo no lo arregla
          if(!lanzar()&&pend===0)fin(reject,e);
        }
      })();
      clearTimeout(tCob);tCob=setTimeout(lanzar,cobertura);   // si este modelo tarda, se pide en paralelo al siguiente
      return true;
    };
    lanzar();
  });
}
function _iaMsg(e){
  let m=String((e&&e.message)||e||"").replace(/^AI:\s*/,"").replace(/Error fetching from \S+?:(\s+|$)/,"").trim();
  const d=e&&e.customErrorData;if(d&&d.status&&m.indexOf("["+d.status)<0)m="["+d.status+(d.statusText?" "+d.statusText:"")+"] "+m;
  let pista="";
  if(/failed to fetch|networkerror|load failed|network request/i.test(m)||!m)pista=" · El navegador no pudo llegar a Firebase: revisá la conexión y probá sin bloqueador de anuncios, antivirus o VPN.";
  else if(/app ?check/i.test(m))pista=" · Firebase exige App Check: falta registrar la app con reCAPTCHA.";
  else if(/referer|referrer|api key|api_key/i.test(m))pista=" · La clave de Firebase no permite este sitio.";
  else if(/quota|429|resource.?exhausted/i.test(m))pista=" · Se acabó el cupo gratis por ahora.";
  return (m||"sin detalle").slice(0,230)+pista;
}
function _jsonDe(t){t=String(t||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/,"");const i=t.indexOf("{"),j=t.lastIndexOf("}");if(i<0||j<i)throw new Error("respuesta inválida");return JSON.parse(t.slice(i,j+1))}
function _iaNorm(o){if(!o||!o.reply)throw new Error("respuesta vacía");
  const hints=(Array.isArray(o.hints)?o.hints:[]).map(h=>({es:String((h&&h.es)||"").slice(0,60),en:String((h&&h.en)||"").slice(0,60)})).filter(h=>h.es&&h.en).slice(0,3);
  return{reply:String(o.reply).slice(0,400),ok:!!o.ok,tip:String(o.tip||"").slice(0,200),model:String(o.model||"").slice(0,200),end:!!o.end,picture:String(o.picture||"").slice(0,30),hints,help:String(o.help||"").slice(0,200)}}
function _iaContents(messages){
  const cs=(messages||[]).slice(-24).map(m=>({role:m.role==="child"?"user":"model",parts:[{text:String(m.text||"").slice(0,480)}]}));
  if(!cs.length||cs[0].role!=="user")cs.unshift({role:"user",parts:[{text:"(The child sits down. Start the exam with a greeting and a first question.)"}]});
  return cs;
}
async function _iaWorker(body,ms){
  const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);
  try{const r=await fetch(IA_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:c.signal});
    if(!r.ok)throw new Error("HTTP "+r.status);return await r.json()}
  finally{clearTimeout(t)}
}
// La charla: devuelve {reply, ok, tip, model, end}
async function iaPedirReintentos(h,k,max,nota){   // a mitad de la charla se reintenta una vez antes de darse por vencido
  const intentos=k===1?1:2;let ult;
  for(let i=0;i<intentos;i++){
    try{return await iaPedir(h,k,max,nota)}
    catch(e){ult=e;console.warn("[IA] intento "+(i+1)+" falló:",e);if(i<intentos-1)await new Promise(r=>setTimeout(r,900))}
  }
  throw ult;
}
async function iaPedir(messages,turn,max,nota){
  if(fbListo()){
    const txt=await _fbGenerar({system:SISTEMA_IA+(_planIA?"\n"+_planIA:"")+(PIC_LISTA.length?"\nPICTURES AVAILABLE:\n"+PIC_LISTA.map(x=>x.e+" = "+x.d).join("\n"):"")+"\nturn="+turn+" max="+max+(nota?"\nNOTE: "+nota:""),contents:_iaContents(messages),json:true,temp:.8,tokens:1500,
      schema:S=>S.object({properties:{reply:S.string(),ok:S.boolean(),tip:S.string(),model:S.string(),end:S.boolean(),picture:S.string(),hints:S.array({items:S.object({properties:{es:S.string(),en:S.string()}})}),help:S.string()}})});
    let o;
    try{o=_jsonDe(txt)}
    catch(e){const t=String(txt||"").trim();   // si igual contestó en texto plano, se usa como pregunta del examinador
      if(t&&t.length<500&&!/[{}\[\]]/.test(t))o={reply:t,ok:true,tip:"",model:"",end:false,picture:"",hints:[],help:""};
      else throw new Error("respuesta inválida: "+t.slice(0,80));}
    return _iaNorm(o);
  }
  return _iaNorm(await _iaWorker({messages,turn,max},20000));
}
// La voz grabada (WAV) pasa a texto
const _blobB64=blob=>new Promise((ok,ko)=>{const f=new FileReader();f.onload=()=>ok(String(f.result).split(",")[1]);f.onerror=ko;f.readAsDataURL(blob)});
async function iaTranscribir(blob){
  let t;
  if(fbListo()){
    t=await _fbGenerar({partes:[PROMPT_TRANSCRIBIR,{inlineData:{mimeType:"audio/wav",data:await _blobB64(blob)}}],temp:0,tokens:400,ms:12000+Math.min(30000,Math.round(blob.size/32000*400)),hedge:3000});   // (más tiempo cuanto más largo el audio)
  }else{
    t=(await _iaWorker({audio:await _blobB64(blob),mime:"audio/wav"},25000)).text;
  }
  t=String(t||"").trim().replace(/^["“]+|["”]+$/g,"").trim();
  return /^[(\[].*[)\]]$/.test(t)?"":t;   // "(silencio)", "[no speech]"…
}

// letra al estilo Trinity (A Distinction · B Merit · C Pass · D todavía no) según la nota de 0 a 10
function notaLetra(n){
  return n>=8.5?{l:"A",en:"Distinction",msg:"¡Excelente! Estás muy bien preparado para el Trinity."}
   :n>=7?{l:"B",en:"Merit",msg:"¡Muy bien! Con un poco más de práctica llegás a la A."}
   :n>=5.5?{l:"C",en:"Pass",msg:"Aprobado. Repasá lo de abajo para subir la nota."}
   :{l:"D",en:"Todavía no",msg:"Seguí practicando: con lo de abajo vas a mejorar rápido."};
}
const fmtNota=n=>(Math.round(n*10)/10).toString().replace(".",",");
// Datos objetivos de la charla, contados por la página (no por la IA): sirven para avisarle a la IA y para poner topes si se pone generosa.
function _evalHechos(reg){
  const resp=reg.filter(x=>x.r==="K"),dijo=resp.filter(x=>x.t!=="(no answer)");
  const pal=x=>x.t.trim().split(/\s+/).filter(Boolean).length;
  const esp=x=>/[ñáéíóúü¿¡]|\b(yo|tengo|vivo|soy|estoy|casa|colegio|escuela|mam[aá]|pap[aá]|hermano|hermana|gracias|hola|perro|gato|muy|tambi[eé]n|porque|cuando|donde|qu[eé]|c[oó]mo|mi|mis|por|para|los|las|una|el|que|es)\b/i.test(x.t);
  const noSe=x=>/\b(i don'?t know|dont know|no idea|i don'?t understand|no s[eé])\b/i.test(x.t);
  const pareceP=x=>/\?/.test(x.t)||/^\s*(what|where|when|who|why|how|which|do you|does|did|are you|is |can you|have you|will you|would you|were you|was )/i.test(x.t);
  return {n:resp.length,callado:resp.length-dijo.length,suelta:dijo.filter(x=>pal(x)<=1).length,espanol:dijo.filter(esp).length,nose:dijo.filter(noSe).length,
    prom:dijo.length?Math.round(dijo.reduce((a,x)=>a+pal(x),0)/dijo.length*10)/10:0,parecePregunta:dijo.some(pareceP)};
}
// Topes: si la IA se pone generosa con una charla floja, la nota no puede pasar de lo que muestran los números. Cada tope se explica en la tarjeta.
function _evalTopes(c,h,pct){
  const aj=[],n=Math.max(1,h.n);
  const nom={comprension:"Entender y responder",gramatica:"Gramática",vocabulario:"Vocabulario",fluidez:"Fluidez"};
  const regla=(motivo,caps)=>{   // caps: {criterio: máximo}; sólo se avisa de los que realmente bajaron
    const bajaron=[];
    Object.keys(caps).forEach(k=>{if(c[k]>caps[k]){c[k]=caps[k];bajaron.push(nom[k]+" (máx. "+caps[k]+")")}});
    if(bajaron.length)aj.push(motivo+": "+bajaron.join(", ")+".");
  };
  const poco=(h.suelta+h.callado)/n,esp=h.espanol/n,nose=h.nose/n;
  if(poco>=.5)regla("La mayoría de las respuestas fueron una sola palabra o silencio",{fluidez:3,gramatica:5,comprension:5,vocabulario:5});
  else if(poco>=.3)regla("Varias respuestas fueron una sola palabra o silencio",{fluidez:5});
  if(esp>=.5)regla("Contestaste en español la mayoría de las veces",{comprension:4,vocabulario:4,gramatica:4,fluidez:4});
  else if(esp>=.3)regla("Varias respuestas fueron en español",{comprension:5,vocabulario:5,gramatica:6,fluidez:6});
  if(nose>=.3)regla("Dijiste «I don't know» o «no sé» varias veces",{comprension:5,fluidez:5});
  if(pct!==null&&pct!==undefined&&pct<.45)regla("En la charla muchas respuestas no coincidían con lo que se preguntaba",{comprension:pct<.3?4:5});
  return aj;
}
// lo que se le manda a la IA para corregir: los datos contados + la charla completa, con lo que mostraba cada dibujo
function transcripcion(reg){
  const h=_evalHechos(reg);
  const hechos="FACTS COUNTED BY THE APP: "+MOD.nombre+" answered "+h.n+" times; "+h.suelta+" answers were a single word; there was no answer "+h.callado+" times; "+h.espanol+" answers had Spanish words; \"I don't know\" was said "+h.nose+" times; the average answer has "+h.prom+" words."+(typeof evalExtra==="function"?" "+evalExtra(reg):"")+"\n\nTRANSCRIPT:\n";
  return hechos+reg.map(x=>x.r==="E"?"EXAMINER: "+x.t+(x.pic?" [picture shown to the child: "+x.pic+"]":"")+(x.coach?" [the examiner helped the child here]":""):MOD.nombre.toUpperCase()+": "+x.t).join("\n").slice(0,7000);
}
// La nota la calcula la página (promedio de los 4 criterios), no la IA: así es siempre coherente con las barras que se ven.
// Las frases que la IA dice que el chico dijo se comprueban contra lo que dijo de verdad (si inventó una, se descarta).
function _evalNorm(o,reg,pct){
  const ent=v=>{v=Math.round(Number(v));return isFinite(v)?Math.max(0,Math.min(10,v)):null};
  const c={};
  EVAL_CRIT.forEach(([k])=>{c[k]=ent(o&&o[k]);if(c[k]===null)throw new Error("la corrección vino incompleta")});
  const h=_evalHechos(reg);
  const pregunto=!!o.pregunto&&h.parecePregunta;   // la IA lo afirma Y hay alguna frase del chico que parece pregunta (si no, se lo inventó)
  if(!pregunto&&(typeof pideDePregunta!=="function"||pideDePregunta()))c.comprension=Math.min(c.comprension,6);   // el candidato tiene que hacerle al menos una pregunta al examinador (Grade 3: en la charla; Grade 4: en el tema; si el módulo practicó sin esa parte, no se espera)
  const ajustes=_evalTopes(c,h,pct);
  const nota=Math.round(EVAL_CRIT.reduce((a,[k])=>a+c[k],0)/EVAL_CRIT.length*10)/10;
  const nrm=x=>String(x||"").toLowerCase().replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim();
  const kid=reg.filter(x=>x.r==="K").map(x=>nrm(x.t));
  const real=d=>{const q=nrm(d).split(" ").filter(Boolean);if(!q.length)return false;
    return kid.some(l=>{const b=new Set(l.split(" "));return q.filter(w=>b.has(w)).length/q.length>=.8})};
  const txt=(x,n)=>String(x||"").trim().slice(0,n);
  const lista=(a,n,m)=>(Array.isArray(a)?a:[]).map(x=>txt(x,m)).filter(Boolean).slice(0,n);
  const mejorar=(Array.isArray(o.mejorar)?o.mejorar:[]).map(x=>({dijo:txt(x&&x.dijo,160),mejor:txt(x&&x.mejor,160),porque:txt(x&&x.porque,200)}))
    .filter(x=>x.dijo&&x.mejor&&nrm(x.dijo)!==nrm(x.mejor)&&real(x.dijo)).slice(0,4);
  return {c,nota,letra:notaLetra(nota),pregunto,ajustes,resumen:txt(o.resumen,320),bien:lista(o.bien,3,200),mejorar,repasar:lista(o.repasar,4,90)};
}
async function iaEvaluar(reg,pct){
  let ult;
  for(let i=0;i<2;i++){
    const t0=Date.now();
    try{
      const out=await _fbGenerar({system:SISTEMA_EVAL,contents:[{role:"user",parts:[{text:transcripcion(reg)}]}],json:true,temp:.2,tokens:4000,fuerte:true,ms:30000,hedge:10000,
        schema:S=>{const I=()=>S.integer?S.integer():S.number();
          return S.object({properties:{comprension:I(),gramatica:I(),vocabulario:I(),fluidez:I(),pregunto:S.boolean(),resumen:S.string(),
            bien:S.array({items:S.string()}),mejorar:S.array({items:S.object({properties:{dijo:S.string(),mejor:S.string(),porque:S.string()}})}),repasar:S.array({items:S.string()})}})}});
      let o;try{o=_jsonDe(out)}catch(e){throw new Error("la corrección vino en un formato que no entiendo")}
      return _evalNorm(o,reg,pct);
    }catch(e){ult=e;console.warn("[IA] corrección, intento "+(i+1)+":",e);
      if(/app ?check|401|403|api key|permission/i.test(String(e&&e.message||e)))break;   // reintentar no lo arregla
      if(Date.now()-t0>20000)break;   // ya esperó mucho: mejor mostrar el resumen simple que hacerlo esperar otra vez
      if(i<1)await new Promise(r=>setTimeout(r,900))}
  }
  throw ult;
}

// --- grabación en WAV (funciona en Safari/iPhone, que no tiene dictado confiable)
let _actx=null,_cap=null;
function primeAudio(){   // se llama DENTRO de un toque: en iPhone el audio sólo arranca así
  try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;if(!_actx||_actx.state==="closed")_actx=new AC();if(_actx.state==="suspended")_actx.resume()}catch(e){}
}
function audioSesion(tipo){try{if(navigator.audioSession)navigator.audioSession.type=tipo}catch(e){}}
// Abrir el micrófono. En iPhone, si el audio quedó en modo "solo reproducir", Safari lo rechaza con InvalidStateError:
// por eso se pasa a "grabar" antes de pedirlo y, si igual falla, se suelta y se reintenta una vez.
async function abrirMic(constraints){
  audioSesion("play-and-record");
  try{return await navigator.mediaDevices.getUserMedia(constraints)}
  catch(e){
    if(e&&e.name==="InvalidStateError"){
      audioSesion("auto");await new Promise(r=>setTimeout(r,400));audioSesion("play-and-record");
      return await navigator.mediaDevices.getUserMedia(constraints);
    }
    throw e;
  }
}
// ⚠️ El micrófono se abre SÓLO mientras el chico contesta y se SUELTA (pistas paradas y AudioContext cerrado) antes de que hable el examinador.
// En iPhone, con el micrófono abierto: (1) la voz del navegador (speechSynthesis) silencia la pista del micrófono y no se puede reactivar
// (bug de WebKit 218815, reproducido en iOS 27) y (2) el audio de la página sale muteado o degradado. Ya pasó una vez: dejarlo abierto toda la charla
// («manos libres» v1) dejó mudo al examinador. Por eso cada turno abre y suelta; lo automático es abrirlo SOLO, sin tocar 🎤.
// Si el navegador no deja abrirlo sin un toque (Safari), listenRec pasa al modo «tocar 🎤» y avisa.
async function capIniciar(){
  if(_cap&&_cap.stream&&_cap.stream.getTracks().some(t=>t.readyState==="live"))return _cap;
  if(_cap)capDetener();
  primeAudio();
  const ctx=_actx;
  let stream;
  try{stream=await abrirMic({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}})}   // sin supresión de ruido: en varias notebooks "recorta" la voz suave
  catch(e){   // rechazado (en iPhone: Safari sin un toque): no puede quedar nada abierto ni el modo «grabar y reproducir», que deja mudo al examinador
    if(_actx===ctx){_actx=null;try{ctx.close().catch(()=>{})}catch(x){}}
    audioSesion("auto");rklog("mic: no se pudo abrir ("+(e&&e.name||e)+")");throw e}
  const soltar=()=>{stream.getTracks().forEach(t=>t.stop());if(_actx===ctx)_actx=null;try{ctx.close().catch(()=>{})}catch(e){}audioSesion("auto")};
  if(_actx!==ctx){soltar();const e=new Error("cancelado");e.name="Cancelado";throw e}   // frenaron la charla mientras se abría
  if(ctx.state!=="running")await Promise.race([ctx.resume(),new Promise(r=>setTimeout(r,1500))]);
  if(ctx.state!=="running"){soltar();const e=new Error("el audio del navegador no arrancó sin un toque");e.name="AudioSuspendido";throw e}   // iPhone: sin un toque el audio queda «suspended»
  const src=ctx.createMediaStreamSource(stream),proc=ctx.createScriptProcessor(4096,1,1);
  const cap={stream,src,proc,rate:ctx.sampleRate,onFrame:null,frames:0};
  proc.onaudioprocess=e=>{cap.frames++;if(cap.onFrame)cap.onFrame(e.inputBuffer.getChannelData(0))};
  src.connect(proc);proc.connect(ctx.destination);
  stream.getTracks().forEach(t=>{t.onended=()=>{if(_cap===cap)_cap=null}});
  _cap=cap;rklog("mic abierto ("+Math.round(ctx.sampleRate)+" Hz, audioSession="+((navigator.audioSession&&navigator.audioSession.type)||"n/d")+")");return cap;
}
function capDetener(){   // suelta TODO (pistas, AudioContext y modo de audio), aunque no hubiera captura: si queda algo abierto, en iPhone la voz del examinador queda muda
  const c=_cap;_cap=null;
  if(c){rklog("mic soltado");
    try{c.proc.onaudioprocess=null;c.proc.disconnect()}catch(e){}try{c.src.disconnect()}catch(e){}
    c.stream.getTracks().forEach(t=>t.stop())}
  if(_actx){const x=_actx;_actx=null;try{x.close().catch(()=>{})}catch(e){}}
  audioSesion("auto");_soltarEl();
}
async function abrirSesionMic(){   // "ok" | "denied" | "nodev" | "error:X"  (deja el micrófono ABIERTO: sólo para manos libres en iPhone y para la revisión de sonido)
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){micPermState="nodev";return "nodev"}
  try{await capIniciar();micPermState="ok";return "ok"}
  catch(e){
    capDetener();audioSesion("auto");const n=e&&e.name;
    micPermState=(n==="NotAllowedError"||n==="SecurityError")?"denied":(n==="NotFoundError"||n==="OverconstrainedError")?"nodev":"error:"+(n||"desconocido");
    return micPermState}
}
function _aWav(chunks,rate){
  let n=0;chunks.forEach(c=>n+=c.length);
  const all=new Float32Array(n);let o=0;chunks.forEach(c=>{all.set(c,o);o+=c.length});
  // micrófonos de notebook suelen grabar muy bajito: se sube el volumen (máx. 20×)
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

// ---- voz del examinador
const synth=window.speechSynthesis;let voice=null,keep=null,unlocked=false;
const ANDROID=/Android/i.test(navigator.userAgent);let noEnVoice=false;
function pickVoice(){if(!synth)return;const v=synth.getVoices();if(!v.length)return;
  const en=v.filter(x=>/^en/i.test(x.lang));noEnVoice=!en.length;
  voice=en.find(x=>/en[-_]GB/i.test(x.lang)&&/google|natural|premium|enhanced/i.test(x.name))||en.find(x=>/en[-_]GB/i.test(x.lang))||en.find(x=>/google|natural/i.test(x.name))||en[0]||null}
if(synth){pickVoice();if(synth.addEventListener)synth.addEventListener("voiceschanged",pickVoice);else synth.onvoiceschanged=pickVoice}
// En celulares y Safari la voz solo arranca si se "desbloquea" con un toque: se hace en el primer clic de la página
// iPhone: Safari sólo deja hablar a la voz del navegador si el PRIMER intento ocurre dentro de un toque que termina (click / touchend).
// "touchstart" y "pointerdown" no cuentan. Por eso se reintenta en cada toque hasta que una voz arranque de verdad (_voiceOk).
let _voiceOk=false,_unlockPend=false,_localMuda=false,_iaVozAgotada=false;
let MP3_OK=true,SIN_VOZ=false;   // los pone la «Revisión de sonido» según lo que la persona dice que escucha (ver abrirSonido)
// MANOS LIBRES en iPhone: el micrófono queda abierto toda la charla (se abre con el toque de «Empezar», que es el único momento en que Safari lo deja) y el examinador
// habla SÓLO con audios grabados: la voz del celular (speechSynthesis) corta la pista del micrófono abierto (WebKit 218815) y después deja de sonar.
let PERSISTENTE=false;
let _unlockN=0;
function unlockVoice(forzar){
  forzar=forzar===true;   // (como oyente de eventos recibe el evento: sólo cuenta el true explícito)
  unlockAudioEl();
  if(!synth||_voiceOk||_unlockPend||PERSISTENTE)return;   // (en manos libres no se usa la voz del celular)
  // la voz silenciosa de «desbloqueo» no puede arrancar con un audio sonando: en Safari, speechSynthesis.speak interrumpe los demás medios (WebKit 218815) y cortaba al examinador (AbortError)
  if(_audioSonando())return;
  if(_unlockN>=3&&!forzar)return;   // no se repite en cada toque
  _unlockN++;_unlockPend=true;setTimeout(()=>{_unlockPend=false},2500);
  try{const u=new SpeechSynthesisUtterance("ok");u.volume=0;u.lang="en-GB";u.onstart=()=>{_voiceOk=true};u.onend=()=>{_voiceOk=true};synth.speak(u)}catch(e){}
}
["click","touchend","keydown"].forEach(ev=>document.addEventListener(ev,unlockVoice,{capture:true,passive:true}));
// Chrome corta la voz a los ~15 s si no se la "despierta"
let ttsTimer=null;
function ttsKeepAlive(on){clearInterval(ttsTimer);if(on)ttsTimer=setInterval(()=>{if(synth.speaking&&!synth.paused){synth.pause();synth.resume()}},9000)}
// Plan B: si la PC/el celu no tiene voz en inglés instalada, se reproduce desde un servicio en línea (no depende de las voces del sistema)
// Audios guardados en el propio sitio (carpeta audio/): suenan igual en iPhone, Android y PC, sin depender de voces del navegador
function _audioKey(t){
  t=String(t).toLowerCase().replace(/\s+/g," ").trim();
  let h1=0xdeadbeef,h2=0x41c6ce57;
  for(let i=0,ch;i<t.length;i++){ch=t.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677)}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);
  h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);
  return (4294967296*(2097151&h2)+(h1>>>0)).toString(36);
}
const _AUDIO_SET=new Set(window.TRINITY_AUDIO||[]);
// Velocidad de la voz del examinador (se guarda en el equipo). Los estudios (palabras sueltas) siguen a velocidad normal.
let VEL_EX=(function(){try{return localStorage.getItem("trinity_vel")||"rapida"}catch(e){return "rapida"}})();
let VOZ_IOS=(function(){try{return localStorage.getItem("trinity_voz2")||"celu"}catch(e){return "celu"}})();
const velAudio=()=>VEL_EX==="rapida"?1.2:1;     // audios guardados y de Gemini
const velVoz=()=>VEL_EX==="rapida"?1.12:.95;    // voz del navegador
let _aud=null,_audOk=false,_playCorta=null,_audAct=null;
const _SILENCIO=BASE+"audio/silencio.mp3";
function unlockAudioEl(){   // iPhone: el primer play() tiene que ocurrir dentro de un toque; después el mismo elemento puede sonar solo
  if(_audOk||_playCorta)return;   // (con un audio de verdad sonando no se le cambia el origen)
  _audOk=true;
  try{_aud=_aud||new Audio();_aud.src=_SILENCIO;const p=_aud.play();
    if(p&&p.catch)p.catch(e=>{if(e&&e.name==="AbortError")return;_audOk=false})}   // AbortError = otro audio lo reemplazó: no es un rechazo del navegador
  catch(e){_audOk=false}
}
const _sonando=a=>!!(a&&!a.paused&&!a.ended);
const _audioSonando=()=>!!(_playCorta||_sonando(_audAct)||_sonando(_aud));   // (el compartido también suena con la pausa silenciosa de desbloqueo)
function _pararAudio(){   // un audio grabado sonando se corta antes de hablar con la voz del celular (en Safari se interrumpen entre sí)
  if(_playCorta){_playCorta();_playCorta=null}
  try{if(_sonando(_audAct))_audAct.pause()}catch(e){}
  try{if(_sonando(_aud))_aud.pause()}catch(e){}
}
// Manos libres en iPhone: si el audio del examinador "suena" pero no llega al micrófono (o sea, no se oye), se prueba otra forma de reproducirlo:
//   0 el mismo <audio> de siempre · 1 un <audio> nuevo en cada frase · 2 un <video> nuevo (el iPhone suele mandarlo al parlante) · 3 Web Audio por el contexto del micrófono.
// La que funciona queda guardada en el equipo («trinity_estr»). Fuera de manos libres siempre se usa la 0.
const ESTRATEGIAS=["audio compartido","audio nuevo en cada frase","video","Web Audio"];
let _estrategia=(function(){try{const n=+localStorage.getItem("trinity_estr");return n>=0&&n<ESTRATEGIAS.length?n:0}catch(e){return 0}})();
let ECO_MIN_MS=1300;   // una frase más corta que esto no se juzga (el eco de una palabra suelta no dice nada)
let _elTmp=null;   // el <audio>/<video> descartable de la última frase
function _soltarEl(){if(_elTmp){try{_elTmp.pause();_elTmp.removeAttribute("src");if(_elTmp.parentNode)_elTmp.parentNode.removeChild(_elTmp)}catch(e){}_elTmp=null}}
function _elNuevo(modo){
  if(modo===2){const v=document.createElement("video");v.setAttribute("playsinline","");v.playsInline=true;v.setAttribute("aria-hidden","true");
    v.style.cssText="position:fixed;left:-9px;top:-9px;width:1px;height:1px;opacity:0;pointer-events:none";document.body.appendChild(v);return v}
  return new Audio();
}
let _audErr="";
// Registro corto de lo que pasó con la voz y el micrófono: se copia desde 🔧 Diagnóstico → 📋 Copiar informe (para revisar sin consola ni capturas)
const _RK=[];
function rklog(t){try{_RK.push(new Date().toTimeString().slice(0,8)+" "+t);if(_RK.length>80)_RK.shift()}catch(e){}}
function _playUrl(url,vel){
  if(PERSISTENTE&&_estrategia===3&&_actx&&_actx.state==="running")return _playWebAudio(url,vel).then(ok=>ok||_playEl(url,vel,0));
  return _playEl(url,vel,PERSISTENTE&&_estrategia<3?_estrategia:0);
}
function _playEl(url,vel,modo){
  return new Promise(r=>{
    if(_playCorta){_playCorta();_playCorta=null}   // un audio nuevo corta el anterior (sin que el anterior pase a "falló")
    let fin=false,t=null;const ok=v=>{if(!fin){fin=true;clearTimeout(t);if(_playCorta===cortar)_playCorta=null;rklog("audio "+String(url).replace(/^.*\//,"").slice(0,22)+(v?" terminó":" FALLÓ ("+_audErr+")"));r(v)}};
    const cortar=()=>ok(true);_playCorta=cortar;
    let a;
    if(modo>0){_soltarEl();a=_elTmp=_elNuevo(modo)}   // elemento nuevo (el compartido sigue siendo el que se desbloqueó con un toque)
    else a=_aud||(_aud=new Audio());
    _audAct=a;a.onended=()=>ok(true);a.onerror=()=>{_audErr="error del reproductor "+(a.error?a.error.code:"?");ok(false)};
    t=setTimeout(()=>ok(false),20000);
    let intentos=0;
    const arrancar=()=>{
      intentos++;
      try{if(synth&&(synth.speaking||synth.pending))synth.cancel()}catch(e){}   // una voz pendiente (p. ej. la de desbloqueo) interrumpiría este audio
      a.src=url;try{a.defaultPlaybackRate=vel||1;a.playbackRate=vel||1}catch(e){}
      rklog("audio play "+String(url).replace(/^.*\//,"").slice(0,22)+(modo>0?" ["+ESTRATEGIAS[modo]+"]":"")+(intentos>1?" (reintento "+intentos+")":""));
      const pl=a.play();
      if(pl&&pl.catch)pl.catch(e=>{
        if(e&&e.name==="AbortError"&&intentos<3&&!fin){setTimeout(()=>{if(!fin)arrancar()},150);return}   // algo interrumpió el arranque: se vuelve a intentar
        _audErr=e&&e.name?e.name:"no se pudo reproducir";ok(false)});
    };
    arrancar();
  });
}
function _playWebAudio(url,vel){   // el audio se decodifica y suena por el MISMO AudioContext que está abierto para el micrófono
  return new Promise(res=>{
    let fin=false,src=null,t=null;
    const ok=v=>{if(fin)return;fin=true;clearTimeout(t);if(_playCorta===cortar)_playCorta=null;rklog("audio "+String(url).replace(/^.*\//,"").slice(0,22)+" [Web Audio]"+(v?" terminó":" FALLÓ ("+_audErr+")"));res(v)};
    const cortar=()=>{try{if(src)src.stop()}catch(e){}ok(true)};
    if(_playCorta){_playCorta();_playCorta=null}
    _playCorta=cortar;
    (async()=>{
      try{
        const ctx=_actx,r=await fetch(url);if(!r.ok)throw new Error("HTTP "+r.status);
        const buf=await r.arrayBuffer();
        const dec=await new Promise((a,b)=>{const p=ctx.decodeAudioData(buf,a,b);if(p&&p.then)p.then(a,b)});
        if(fin)return;
        src=ctx.createBufferSource();src.buffer=dec;try{src.playbackRate.value=vel||1}catch(e){}
        src.connect(ctx.destination);src.onended=()=>ok(true);
        src.start();
        t=setTimeout(()=>ok(true),dec.duration/(vel||1)*1000+1500);
      }catch(e){_audErr="Web Audio: "+(e&&e.name||e);ok(false)}
    })();
  });
}
const TTS_MODELOS=["gemini-2.5-flash-preview-tts","gemini-3.1-flash-tts-preview"];
const _vozCache=new Map();
function _pcmAWav(b64,rate){   // Gemini devuelve PCM de 16 bits, mono; se le pone encabezado WAV para que cualquier navegador lo reproduzca
  const bin=atob(b64),n=bin.length,dv=new DataView(new ArrayBuffer(44+n));
  const w=(o,x)=>{for(let i=0;i<x.length;i++)dv.setUint8(o+i,x.charCodeAt(i))};
  w(0,"RIFF");dv.setUint32(4,36+n,true);w(8,"WAVE");w(12,"fmt ");dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,1,true);
  dv.setUint32(24,rate,true);dv.setUint32(28,rate*2,true);dv.setUint16(32,2,true);dv.setUint16(34,16,true);w(36,"data");dv.setUint32(40,n,true);
  for(let i=0;i<n;i++)dv.setUint8(44+i,bin.charCodeAt(i));
  return new Blob([dv.buffer],{type:"audio/wav"});
}
async function _vozGenerar(x){   // devuelve la URL del audio de una frase (o null)
  if(_vozCache.has(x))return _vozCache.get(x);
  let ai,getGenerativeModel;
  try{({ai,getGenerativeModel}=await fbCargar())}catch(e){return null}
  const nombres=(_FB.ttsModels&&_FB.ttsModels.length)?_FB.ttsModels:TTS_MODELOS;
  for(const nombre of nombres){
    try{
      const m=getGenerativeModel(ai,{model:nombre,generationConfig:{responseModalities:["AUDIO"],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:"Kore"}}}}});
      const r=await Promise.race([m.generateContent("Say briskly, in a clear friendly British voice, like a kind teacher talking to a child: "+x),new Promise((_,ko)=>setTimeout(()=>ko(new Error("tiempo agotado")),14000))]);
      const pt=(r.response.inlineDataParts?r.response.inlineDataParts():[])[0];
      if(!pt)throw new Error("sin audio");
      const rate=+((/rate=(\d+)/.exec(pt.inlineData.mimeType)||[])[1])||24000;
      const url=URL.createObjectURL(_pcmAWav(pt.inlineData.data,rate));
      _vozCache.set(x,url);return url;
    }catch(e){console.warn("[IA] voz "+nombre+":",e);if(/429|quota|resource.?exhausted/i.test(String(e&&e.message||e)))_iaVozAgotada=_iaVozAgotada||nombres.indexOf(nombre)===nombres.length-1}
  }
  return null;
}
async function iaVoz(t,op){   // true si sonó · {resto} si falló a mitad · false si no sonó nada
  if(!fbListo())return false;
  const vel=(op&&op.ex)?velAudio():1;
  // la frase se parte en oraciones y todas se generan A LA VEZ: la primera suena apenas está lista
  let partes=String(t).length<=110?[String(t)]:(String(t).match(/[^.!?]+[.!?]*/g)||[t]).map(x=>x.trim()).filter(Boolean);
  const juntas=[];partes.forEach(x=>{if(juntas.length&&juntas[juntas.length-1].length<22)juntas[juntas.length-1]+=" "+x;else juntas.push(x)});
  partes=juntas.length?juntas:[String(t)];
  const gen=partes.map(x=>_vozGenerar(x));
  for(let i=0;i<partes.length;i++){
    const url=await gen[i];
    if(!url)return i===0?false:{resto:partes.slice(i).join(" ")};
    const ok=await _playUrl(url,vel);
    if(!ok)return i===0?false:{resto:partes.slice(i).join(" ")};
  }
  return true;
}
function sayOnline(t){
  const partes=t.match(/[^.!?]+[.!?]*/g)||[t];const trozos=[];let cur="";
  partes.forEach(x=>{if((cur+x).length>180&&cur){trozos.push(cur);cur=x}else cur+=x});if(cur.trim())trozos.push(cur);
  return trozos.reduce((pr,tr)=>pr.then(ok=>ok===false?false:_playUrl("https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en-GB&q="+encodeURIComponent(tr.trim()))),Promise.resolve(true));
}
// clave del audio grabado de una frase; si lleva un nombre («Thank you, Felu.») y sólo existe grabada SIN el nombre, se usa ésa (en pantalla queda el nombre)
function _claveAudio(t){
  const k=_audioKey(t);if(_AUDIO_SET.has(k))return k;
  const k2=_audioKey(String(t).replace(/,\s+[A-ZÁÉÍÓÚÑ][\wáéíóúñ]*(?=[.!?]|$)/,""));
  return _AUDIO_SET.has(k2)?k2:null;
}
function say(t,status,op){   // op.ex = lo dice el examinador (velocidad configurable)
  const k=_claveAudio(t);
  if(SIN_VOZ){rklog("say [sin voz: en este equipo no se oye nada] "+String(t).slice(0,44));return Promise.resolve(false)}
  rklog("say "+(k&&MP3_OK?"[mp3] ":"[voz] ")+String(t).slice(0,44));
  if(k&&MP3_OK){unlockVoice();return _playUrl(BASE+"audio/"+k+".mp3",op&&op.ex?velAudio():1).then(ok=>{if(ok)return true;if(PERSISTENTE)return false;if(status)status("⚠️ El audio no pudo sonar ("+_audErr+"). Probando otra voz…");return _sayResto(t,status,op)})}
  if(PERSISTENTE){rklog("say [sin audio grabado: se lee] "+String(t).slice(0,44));return Promise.resolve(false)}   // manos libres: nada de voz del celular
  return _sayResto(t,status,op);
}
async function _sayResto(t,status,op){   // devuelve true si algo sonó
  if(PERSISTENTE)return false;
  // La voz de Gemini tiene un tope de 10 pedidos por día en el plan gratis: sólo va primera si el usuario la elige.
  if(IS_IOS&&fbListo()&&VOZ_IOS==="ia"&&!_iaVozAgotada){
    unlockVoice();if(status)status("🔊 Preparando la voz del examinador…");
    const r=await iaVoz(t,op);
    if(r===true){if(status)status("");return true}
    if(r&&r.resto){if(status)status("");return await sayLocal(r.resto,status,op)}
  }
  if(IS_IOS)unlockVoice();
  if(!_localMuda){
    const ok=await sayLocal(t,status,op);
    if(ok){if(status)status("");return true}
  }
  // la voz del navegador no arrancó: última carta, la voz de Gemini
  if(fbListo()&&!_iaVozAgotada){
    if(status)status("🔊 Probando la voz de la IA…");
    const r=await iaVoz(t,op);
    if(r===true){if(status)status("");return true}
    if(r&&r.resto){if(status)status("");return await sayLocal(r.resto,status,op)}
  }
  return false;
}
// ---- 🔊 Revisión de sonido (3 pruebas). Nadie puede probar el audio de un iPhone desde afuera: quien lo usa dice QUÉ escucha y la app elige sola cómo hacer la charla.
//   1) sin micrófono: la voz del celular dice «Monday» y un audio grabado dice «Tuesday»
//   2) después de usar el micrófono: un audio grabado dice «Wednesday» y la voz del celular «Thursday»
//   3) con el micrófono abierto: un audio grabado dice «Friday»
// Campos guardados: tts, mp3 (1), mp3d, ttsd (2), mp3a (3); 1 = se oyó, 0 = no, ausente = no se probó (p. ej. no abrió el micrófono).
// Modo que sale (en iPhone): con el micrófono abierto se oye → "libres" (charla de verdad, sin tocar: micrófono abierto toda la charla + preguntas grabadas) ·
// la voz del celular se oye después del micrófono → "toque-ia" (examinador con IA, tocando 🎤) · sólo el audio grabado → "toque" (preguntas de siempre, tocando 🎤) · nada → "lectura".
function modoDe(r){
  if(!r)return "";
  const mp3Tras=r.mp3d!==undefined?r.mp3d===1:r.mp3===1,ttsTras=r.ttsd!==undefined?r.ttsd===1:r.tts===1;   // si no se pudo probar con el micrófono, vale lo de antes
  if(r.mp3a===1)return "libres";
  if(ttsTras)return "toque-ia";
  if(mp3Tras)return "toque";
  return "lectura";
}
function pastilla(){   // rincón de la pantalla: versión + qué modo salió de la revisión de sonido (una captura cualquiera ya dice todo)
  const r=leerSonido(),e=document.getElementById("rkVer");if(!e)return;
  const n={libres:"manos libres","toque-ia":"con IA, tocando 🎤",toque:"preguntas grabadas, tocando 🎤",lectura:"no se oye"};
  e.textContent=BUILD+" · sonido: "+(r?n[modoDe(r)]:"sin revisar");
}
const ECO_OFF_KEY="trinity_eco_off";
const ecoIgnorado=()=>{try{return localStorage.getItem(ECO_OFF_KEY)==="1"}catch(e){return false}};
function ecoIgnorar(on){try{if(on)localStorage.setItem(ECO_OFF_KEY,"1");else localStorage.removeItem(ECO_OFF_KEY)}catch(e){}}
// Nivel (0 a 1) con el que el micrófono oyó, en la revisión de sonido, un audio que la persona SÍ oyó. 0 = no hay con qué comparar: si ella lo oyó y el micrófono
// no, medir el eco en este equipo no dice nada y no se juzga si el examinador suena.
function ecoRef(){
  const r=leerSonido();if(!r||r.mp3a!==1||!(r.ecoA>0))return 0;
  return r.ecoA>=Math.max(2.5,(r.ecoAmb||0)*2.5)?r.ecoA/100:0;
}
function leerSonido(){
  try{const r=JSON.parse(localStorage.getItem("trinity_sonido3")||"null");if(!r)return null;
    const algo=r.tts||r.mp3||r.mp3d||r.ttsd||r.mp3a,edad=r.t?Date.now()-r.t:0;
    return edad>(algo?7*864e5:10*60e3)?null:r}   // «no se oye nada» suele ser pasajero (silencio, volumen, Bluetooth): no se guarda para siempre; lo demás se vuelve a revisar a la semana
  catch(e){return null}
}
function aplicarSonido(r){
  if(!r)return;
  const modo=modoDe(r);
  MP3_OK=!(r.mp3===0&&r.mp3d!==1&&r.mp3a!==1);   // el audio grabado se descarta sólo si no se oyó en ninguna prueba
  _localMuda=r.tts===0&&r.ttsd!==1;              // la voz del celular, igual
  SIN_VOZ=modo==="lectura";
  const q=(sel,f)=>document.querySelectorAll(sel).forEach(f);
  _tapAuto=false;   // (si la app había puesto «tocar 🎤» sola, esta revisión es más nueva)
  if(IS_IOS){   // en iPhone el modo sale de la prueba (salvo que la persona haya elegido tocar o no tocar: eso manda)
    const elegido=tapElegido();
    q('input[id$="-tap"]',x=>x.checked=elegido!==null?elegido:(modo==="toque"||modo==="toque-ia"));
    q('input[id$="-ia"]',x=>x.checked=modo==="toque-ia");
  }else{   // en otras plataformas el micrófono se abre solo en cada turno: sólo se mira qué voz usar
    q('input[id$="-ia"]',x=>x.checked=!(_localMuda&&MP3_OK));
  }
  if(SIN_VOZ)q('input[id$="-txt"]',x=>{if(!x.checked){x.checked=true;x.dispatchEvent(new Event("change"))}});
}
async function rkCopiar(msgEl){
  const t=window.rkInforme?window.rkInforme():"";let ok=false;
  try{await navigator.clipboard.writeText(t);ok=true}catch(e){}
  if(!ok){const ta=document.createElement("textarea");ta.value=t;ta.style.cssText="position:fixed;left:-999px;top:0";document.body.appendChild(ta);ta.select();try{ok=document.execCommand("copy")}catch(e){}ta.remove()}
  if(msgEl)msgEl.textContent=ok?"✅ Informe copiado: pegalo en el chat.":"No pude copiarlo solo: abrí 🔧 Diagnóstico de sonido y tocá «Copiar informe».";
}
function abrirSonido(alTerminar){
  if(document.getElementById("rkSonido"))return;
  if(activeStop)activeStop();PERSISTENTE=false;capDetener();   // si hay una charla andando, se pausa y se suelta el micrófono
  const m=document.createElement("div");m.id="rkSonido";m.className="rk-modal";m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");
  m.innerHTML='<div class="rk-caja"></div>';document.body.appendChild(m);
  // (si se cierra a mitad de las pruebas, la forma de reproducir vuelve a la de antes)
  const caja=()=>m.querySelector(".rk-caja"),cerrar=()=>{capDetener();if(P3.intentos>0&&R.mp3a!==1)_estrategia=P3.inicial;m.remove()},pausa=ms=>new Promise(r=>setTimeout(r,ms)),url=w=>BASE+"audio/"+_audioKey(w)+".mp3";
  const R={},sincro=[];   // R: lo que la persona marcó
  const nivel=(c,desde)=>{let amb=0,aud=0;const t0=performance.now();c.onFrame=d=>{let x=0;for(let i=0;i<d.length;i+=8){const a=Math.abs(d[i]);if(a>x)x=a}if(performance.now()-t0<desde){if(x>amb)amb=x}else if(x>aud)aud=x};return ()=>({amb,aud})};
  function preguntar(cfg,det,repetir){
    caja().innerHTML=`<h3>¿Qué escuchaste?</h3><p>Tocá lo que oíste (podés marcar varias; si no oíste nada, tocá «Listo» sin marcar):</p>
      <div class="rk-op rk-col">${cfg.chips.map(c=>`<button class="rk-chip" data-k="${c[0]}" aria-pressed="false">${c[1]} «${c[2]}»<small>${c[3]}</small></button>`).join("")}</div>
      <div class="sbtns"><button class="btn" id="rkSnListo">Listo</button><button class="btn ghost" id="rkSnOtra">🔁 Escuchar de nuevo</button></div>`;
    caja().querySelectorAll(".rk-chip").forEach(b=>b.onclick=()=>b.setAttribute("aria-pressed",b.getAttribute("aria-pressed")==="true"?"false":"true"));
    caja().querySelector("#rkSnOtra").onclick=repetir;
    caja().querySelector("#rkSnListo").onclick=()=>{
      const oyo=[];cfg.chips.forEach(c=>{const v=caja().querySelector('[data-k="'+c[0]+'"]').getAttribute("aria-pressed")==="true"?1:0;R[c[0]]=v;if(v)oyo.push("«"+c[2]+"»")});
      if(det&&det.micOyo!==undefined){R.ecoA=det.micOyo;R.ecoAmb=det.ambiente}   // lo que oyó el micrófono con el audio sonando: sirve de referencia para vigilar que el examinador se siga oyendo
      rklog("prueba de sonido "+cfg.n+"/3: se oyó "+(oyo.length?oyo.join(" "):"nada")+" · la app detectó "+JSON.stringify(det));
      cfg.sig()};
  }
  function paso(cfg){
    const ejecutar=async()=>{
      caja().innerHTML='<h3>🔊 Escuchando…</h3><p>Prestá atención a las palabras que suenen.</p>';
      let det={};try{det=await cfg.reproducir()||{}}catch(e){rklog("prueba de sonido "+cfg.n+"/3: error "+(e&&e.name||e));det={error:String(e&&e.name||e)}}
      if(det.sinMic){rklog("prueba de sonido "+cfg.n+"/3: el micrófono no abrió ("+det.sinMic+"): se salta");return cfg.saltar()}
      preguntar(cfg,det,ejecutar)};
    caja().innerHTML=`<h3>${cfg.tit}</h3><p>${cfg.txt}</p><div class="sbtns"><button class="btn" id="rkSnPlay">▶ Escuchar</button><button class="btn ghost" id="rkSnCerrar">Cerrar</button></div>`;
    caja().querySelector("#rkSnPlay").onclick=ejecutar;caja().querySelector("#rkSnCerrar").onclick=cerrar;
  }
  const P3={n:3,tit:"Paso 3 de 3 · con el micrófono abierto",txt:"El micrófono se abre y, con él abierto, suena una voz grabada que dice «Friday». Es lo que hace falta para hablar <b>sin tocar nada</b>.",
    chips:[["mp3a","🎙️","Friday","audio grabado, con el micrófono abierto"]],intentos:0,inicial:0,
    reproducir:async()=>{
      unlockAudioEl();
      const est=await abrirSesionMic();   // (se llama dentro del toque)
      if(est!=="ok")return {sinMic:est};
      const med=nivel(_cap,500);await pausa(520);
      PERSISTENTE=true;   // así suena con la forma de reproducir elegida (_estrategia), igual que en la charla de manos libres
      let ok;try{ok=await _playUrl(url("Friday"),1)}finally{PERSISTENTE=false}
      const r=med();if(_cap)_cap.onFrame=null;capDetener();
      rklog("prueba de sonido 3/3: con el micrófono abierto, el micrófono oyó el audio: máx "+(r.aud*100).toFixed(1)+"% (ambiente "+(r.amb*100).toFixed(1)+"%) · forma "+_estrategia+" ("+ESTRATEGIAS[_estrategia]+")");
      return {grabadoAbierto:ok,forma:_estrategia,micOyo:+(r.aud*100).toFixed(1),ambiente:+(r.amb*100).toFixed(1)}},
    saltar:()=>fin(),
    sig:()=>{   // si no se oyó, se prueba otra forma de reproducir el audio (con un toque más, que el iPhone pide para abrir el micrófono)
      if(R.mp3a===1){try{localStorage.setItem("trinity_estr",String(_estrategia))}catch(e){}return fin()}
      if(P3.intentos>=ESTRATEGIAS.length-1){_estrategia=P3.inicial;return fin()}   // ninguna se oyó: queda todo como estaba
      P3.intentos++;_estrategia=(_estrategia+1)%ESTRATEGIAS.length;
      rklog("prueba de sonido 3/3: no se oyó; se prueba otra forma de reproducir: "+ESTRATEGIAS[_estrategia]);
      P3.tit="Paso 3 de 3 · otra forma de reproducir ("+(P3.intentos+1)+" de "+ESTRATEGIAS.length+")";
      P3.txt="No oíste «Friday», así que probamos otra forma de reproducir el audio con el micrófono abierto (<b>"+ESTRATEGIAS[_estrategia]+"</b>). Tocá ▶ y marcá si ahora lo oís.";
      paso(P3)}};
  const resetP3=()=>{P3.intentos=0;P3.inicial=_estrategia;P3.tit="Paso 3 de 3 · con el micrófono abierto";P3.txt="El micrófono se abre y, con él abierto, suena una voz grabada que dice «Friday». Es lo que hace falta para hablar <b>sin tocar nada</b>."};
  const P2={n:2,tit:"Paso 2 de 3 · después de usar el micrófono",txt:"El micrófono se abre un momento y se cierra; después suenan dos voces: una grabada que dice «Wednesday» y la voz del celular que dice «Thursday».",
    chips:[["mp3d","🔈","Wednesday","audio grabado, después del micrófono"],["ttsd","🗣️","Thursday","voz del celular, después del micrófono"]],
    reproducir:async()=>{
      unlockVoice(true);unlockAudioEl();
      const est=await abrirSesionMic();   // (se llama dentro del toque)
      if(est!=="ok")return {sinMic:est};
      await pausa(1200);capDetener();await pausa(450);
      const g=await _playUrl(url("Wednesday"),1);await pausa(450);
      const v=await sayLocal("Thursday",()=>{},{});
      return {grabado:g,vozCelular:v}},
    saltar:()=>fin(),sig:()=>{resetP3();paso(P3)}};
  const P1={n:1,tit:"Paso 1 de 3 · sin micrófono",txt:"Primero la voz del celular dice «Monday» y después una voz grabada dice «Tuesday».",
    chips:[["tts","🗣️","Monday","voz del celular"],["mp3","🔈","Tuesday","audio grabado"]],
    reproducir:async()=>{
      unlockVoice(true);unlockAudioEl();
      const pTts=sayLocal("Monday",()=>{},{});   // la voz del celular tiene que EMPEZAR dentro del toque
      const v=await pTts;await pausa(450);
      const g=await _playUrl(url("Tuesday"),1);
      return {vozCelular:v,grabado:g}},
    sig:()=>paso(P2)};
  function fin(){
    const r={t:Date.now()};["tts","mp3","mp3d","ttsd","mp3a","ecoA","ecoAmb"].forEach(k=>{if(R[k]!==undefined)r[k]=R[k]});ecoIgnorar(false);   // (rehacer la revisión vuelve a activar la vigilancia)
    try{localStorage.setItem("trinity_sonido3",JSON.stringify(r))}catch(e){}
    try{localStorage.removeItem(TAP_KEY)}catch(e){}   // rehacer la revisión es pedir que se decida de nuevo si hace falta tocar 🎤
    aplicarSonido(r);resultado(r)}
  function resultado(r){
    const modo=modoDe(r);let ico,txt;
    if(modo==="libres"){ico="🎙️";txt="Se oye con el micrófono abierto: la charla va a ser <b>manos libres</b>, sin botón «Hablar». El examinador usa las preguntas grabadas y vos contestás cuando termina de preguntar."+(_estrategia>0?" (Se oyó con una forma especial de reproducir el audio: <b>"+ESTRATEGIAS[_estrategia]+"</b>. La app la recuerda.)":"")}
    else if(modo==="toque-ia"){ico="🤖";txt="La voz del celular se oye después de usar el micrófono: vas a poder usar el <b>examinador con IA</b>, tocando <b>🎤 Hablar</b> para contestar (con el micrófono abierto el audio no se oyó)."}
    else if(modo==="toque"){ico="🔈";txt="Se oye el audio grabado pero no con el micrófono abierto: la charla va a usar las <b>preguntas grabadas</b> y vas a tocar <b>🎤 Hablar</b> para contestar. "+(r.tts===0?"La voz del celular no se oyó: en el iPhone casi siempre es el <b>modo silencio</b> 🔕 (interruptor del costado).":"")}
    else{ico="😕";txt="No se oyó nada. Revisá el <b>volumen</b>, el <b>modo silencio</b> 🔕 y que no haya <b>auriculares, Bluetooth o AirPlay</b> conectados (Centro de control → ícono de audio) y probá de nuevo. Mientras tanto vas a poder <b>leer</b> las preguntas en pantalla."}
    pastilla();
    const pwa=(IS_IOS&&esInstalada()&&modo!=="libres")?'<p><b>Estás en la app instalada:</b> en iOS 26 y 27 el audio de las apps instaladas puede fallar (error de Apple, ver WebKit 295518). Probá abriendo el sitio en <b>Safari</b>, no desde el ícono.</p>':'';
    caja().innerHTML=`<h3>${ico} Resultado</h3><p>${txt}</p>${pwa}
      <p class="es">Si seguís sin oír al examinador, sacá una captura de esta pantalla: acá abajo está el informe.</p>
      <textarea class="rk-inf" readonly rows="11" aria-label="Informe">${esc(window.rkInforme?window.rkInforme(8):"")}</textarea><p class="es" id="rkSnMsg"></p>
      <div class="sbtns"><button class="btn" id="rkSnGo">${alTerminar?"Empezar":"Cerrar"}</button><button class="btn ghost" id="rkSnOtra">🔁 Repetir la prueba</button><button class="btn ghost" id="rkSnCopiar">📋 Copiar informe</button></div>`;
    caja().querySelector("#rkSnGo").onclick=()=>{cerrar();if(alTerminar)alTerminar()};
    caja().querySelector("#rkSnOtra").onclick=()=>{for(const k in R)delete R[k];paso(P1)};   // (P3 se reinicia al llegar a él)
    caja().querySelector("#rkSnCopiar").onclick=()=>rkCopiar(caja().querySelector("#rkSnMsg"));
  }
  caja().innerHTML=`<h3>🔊 Revisión de sonido</h3>
    <p>Son <b>3 pasos cortos</b>. Antes, revisá que el <b>volumen esté arriba</b>, que <b>no haya una campanita tachada 🔕</b> junto a la hora (interruptor del costado) y que no haya <b>auriculares, Bluetooth o AirPlay</b> conectados.</p>
    <p>En cada paso suenan palabras y vos marcás las que oís. Con eso la app elige la mejor forma de hacer la charla en <b>este</b> celular.</p>
    <div class="sbtns"><button class="btn" id="rkSnIni">Empezar la prueba</button><button class="btn ghost" id="rkSnCerrar">Cerrar</button></div>`;
  caja().querySelector("#rkSnIni").onclick=()=>paso(P1);caja().querySelector("#rkSnCerrar").onclick=cerrar;
}
function sayLocal(t,status,op){
  return new Promise(res=>{
    const fallback=()=>setTimeout(res,Math.min(6000,600+t.length*55));
    if(!synth){return sayOnline(t).then(ok=>{if(!ok)status("Este navegador no puede leer en voz alta. Abrí el link en <b>Chrome</b> o <b>Edge</b>.");return !!ok})}
    _pararAudio();unlockVoice();if(!_cap)audioSesion("playback");   // sólo mientras habla la voz del navegador (con el micrófono abierto no se toca el modo)
    let started=false,ended=false,tries=0;
    const maxMs=Math.max(12000,t.length*160+6000);
    const fin=()=>{if(ended)return;ended=true;ttsKeepAlive(false);if(!_cap)audioSesion("auto");rklog("voz del navegador: fin"+(started?"":" SIN haber empezado"));res(started)};
    const go=()=>{
      if(!voice)pickVoice();
      const u=new SpeechSynthesisUtterance(t);
      // 1er intento: voz inglesa elegida (en Android solo el idioma). 2º intento: voz por defecto del celu, para que al menos suene
      if(tries===0){u.lang=(voice&&voice.lang.replace('_','-'))||"en-GB";if(voice&&!ANDROID)u.voice=voice}
      u.rate=(op&&op.ex)?velVoz():.88;u.pitch=1;u.volume=1;keep=u;
      u.onstart=()=>{started=true;_voiceOk=true;ttsKeepAlive(true);rklog("voz del navegador: empezó")};
      u.onend=fin;
      u.onerror=e=>{
        rklog("voz del navegador: error "+e.error);
        if(e.error==="interrupted"||e.error==="canceled"){if(!started&&tries<2&&!ended){tries++;setTimeout(go,150);return}return fin()}
        if(e.error==="not-allowed"){status("El navegador bloqueó la voz. Tocá la pantalla una vez y probá de nuevo.");return fin()}
        (IS_IOS?Promise.resolve(false):sayOnline(t)).then(ok=>{if(ok)started=true;else status("No se pudo reproducir la voz ("+e.error+").");fin()})};
      rklog("voz del navegador: speak (intento "+(tries+1)+")");
      synth.speak(u);
      // si a los 2,5 s no arrancó, reintento una vez; si sigue mudo, aviso
      setTimeout(()=>{if(started||ended)return;if(tries<1){tries++;try{synth.cancel()}catch(e){}setTimeout(go,150)}else{(IS_IOS?Promise.resolve(false):sayOnline(t)).then(ok=>{if(ok){started=true;return fin()}if(IS_IOS)_localMuda=true;status((noEnVoice?"Tu celular no tiene voz en inglés instalada: Ajustes → Texto a voz → Google → Instalar datos de voz → English. ":"")+(IS_IOS?"No se escucha la voz. <b>En el iPhone casi siempre es el modo silencio</b>: fijate si hay una <b>campanita tachada 🔕</b> arriba junto a la hora y sacalo con el interruptor del costado (o desde el Centro de control), y subí el volumen con los botones. ":"No se escucha la voz. Subí el volumen multimedia o probá con <b>Chrome</b> / <b>Edge</b>. ")+"Podés activar <b>Ver lo que dice el examinador</b> para leer las preguntas.");fin()})}},1600);
    };
    // Si no hay nada sonando, se habla EN EL ACTO: los celulares sólo dejan hablar dentro del toque (con demora no suena)
    if(synth.speaking||synth.pending){try{synth.cancel()}catch(e){}setTimeout(()=>{try{synth.resume()}catch(e){}go()},(ANDROID||IS_IOS)?450:120)}
    else{try{synth.resume()}catch(e){}go()}
    setTimeout(fin,maxMs);
  });
}
const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let activeStop=null; // para frenar la otra conversación si se empieza una nueva
// Pide el permiso del micrófono UNA vez al empezar (el cartel del navegador tarda y antes se confundía con "no anda")
let micPermState="unknown";
// «Tocar 🎤 para hablar». Se guarda SÓLO lo que la persona eligió con la casilla: «1» = quiero tocar · «0» = quiero hablar sin tocar. Sin nada guardado manda la revisión de sonido.
// Lo que la app pone sola (Safari que no deja abrir el micrófono, una llamada que lo corta) NO se guarda: antes quedaba «pegado» (trinity_tap2) y obligaba a tocar 🎤 Hablar para siempre.
const TAP_KEY="trinity_tap3";
try{localStorage.removeItem("trinity_tap2")}catch(e){}   // la clave de antes mezclaba lo elegido con lo que había puesto la app sola
function tapElegido(){try{const v=localStorage.getItem(TAP_KEY);return v==="1"?true:v==="0"?false:null}catch(e){return null}}   // true/false = lo eligió la persona · null = sin elegir
const TAP_GUARDADO=tapElegido()===true;
function tapPoner(on){document.querySelectorAll('input[id$="-tap"]').forEach(x=>x.checked=!!on)}   // sólo la casilla, sin guardar
function recordarTap(on){try{localStorage.setItem(TAP_KEY,on?"1":"0")}catch(e){}tapPoner(on)}   // la persona lo eligió: se guarda
let _tapAuto=false;   // la casilla la tildó la app sola (un corte del micrófono): en la próxima charla se vuelve a probar sin tocar
let LISTO_TARDE_MS=10000;   // «Listo» aparece recién cuando el micrófono lleva tanto escuchando (la respuesta termina sola con una pausa)
// Cuándo se da por terminada una respuesta (listenRec). Antes bastaba 1,25 s de silencio y quien armaba la frase en inglés con una pausa para buscar una palabra quedaba cortado a la mitad.
// Ahora: pausa de 2 s; si lo que dijo parece una frase a medias («…and», «…with my», «…um») se espera hasta 3,5 s; y una vez que habló, la voz que se apaga también cuenta como voz.
let SIL_ADELANTO_MS=1000,SIL_FIN_MS=2000,SIL_FIN_MAX_MS=3500,SIL_TEXTO_MS=3200,TOPE_RESP_MS=45000;
// «⏳ Pausas» (Normal / Más paciencia): quien todavía se siente cortado le da más tiempo al micrófono. Se guarda en el aparato (trinity_pausa) y vale para los dos módulos.
const PAUSA_KEY="trinity_pausa";
const pausaLarga=()=>{try{return localStorage.getItem(PAUSA_KEY)==="larga"}catch(e){return false}};
function pausaAplicar(larga){SIL_FIN_MS=larga?3200:2000;SIL_FIN_MAX_MS=larga?5000:3500;SIL_TEXTO_MS=larga?4200:3200}
pausaAplicar(pausaLarga());
const SONIDO_OK=(function(){const r=leerSonido();return !!(r&&modoDe(r)!=="lectura")})();   // ya se confirmó que se oyen las dos voces
const MSG_MIC_DENEGADO=()=>IS_IOS?"El iPhone no dejó usar el micrófono. Arreglalo así: en Safari tocá <b>aA</b> (a la izquierda de la dirección) → <b>Configuración del sitio web</b> → <b>Micrófono → Permitir</b>. Después tocá <b>🎤 Probar el micrófono otra vez</b>, acá abajo. (Si abriste el link desde WhatsApp, Instagram o un mail, abrilo en <b>Safari</b>.) Mientras tanto, escribí o dictá con el 🎤 del teclado:":"No hay permiso para el micrófono. Tocá el candado junto a la dirección → Micrófono → Permitir. Después tocá <b>🎤 Probar el micrófono otra vez</b>, acá abajo. Mientras tanto, escribí:";
async function prepMic(){
  if(micPermState==="ok")return "ok";
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){micPermState="nodev";return "nodev"}
  try{const st=await abrirMic({audio:true});st.getTracks().forEach(t=>t.stop());audioSesion("auto");micPermState="ok";rklog("permiso de micrófono: ok");return "ok"}
  catch(e){
    audioSesion("auto");
    const n=e&&e.name;
    micPermState=(n==="NotAllowedError"||n==="SecurityError")?"denied":(n==="NotFoundError"||n==="OverconstrainedError")?"nodev":"error:"+(n||"desconocido");
    rklog("permiso de micrófono: "+micPermState);
    return micPermState}
}

// ---- crea una conversación dentro de un contenedor. mode: "practice" | "exam"
function mountConv(rootId,mode){
  const P=rootId+"-",E=mode==="exam";
  const root=$(rootId);
  root.innerHTML=`<div class="card">
  <div class="row" style="margin:0"><span class="tag" id="${P}n">${E?"Examen oral":"Conversación"}</span>
    <label class="chk"><input type="checkbox" id="${P}txt" ${(!E||(IS_IOS&&!SONIDO_OK))?"checked":""}> Ver lo que dice el examinador</label>
    <label class="chk"><input type="checkbox" id="${P}help" ${E?"":"checked"}> 💡 Ayudas (cómo se dice)</label>
    <label class="chk">⏩ Velocidad <select id="${P}vel"><option value="normal">Normal</option><option value="rapida">Rápida</option></select></label>
    <label class="chk" title="Cuánto espera el micrófono cuando hacés una pausa, antes de darse cuenta de que terminaste de hablar">⏳ Pausas <select id="${P}pausa"><option value="normal">Normal</option><option value="larga">Más paciencia</option></select></label>
    ${IS_IOS&&fbListo()?`<label class="chk">🔊 Voz <select id="${P}voz"><option value="celu">Del celular (rápida)</option><option value="ia">Natural (IA, 10 por día)</option></select></label>`:""}
    <label class="chk"><input type="checkbox" id="${P}tap" ${TAP_GUARDADO?"checked":""}> Tocar 🎤 para hablar</label>
    ${IA_ON?`<label class="chk"><input type="checkbox" id="${P}ia" ${IS_IOS?"":"checked"}> 🤖 Examinador con IA${IS_IOS?" <small>(en iPhone, con «tocar 🎤»)</small>":""}</label>`:""}</div>
  <div class="bar"><i id="${P}bar"></i></div>
  <div class="chat" id="${P}chat" aria-live="polite"><div class="msg tip">${E
    ?"Como en el Trinity: el examinador charla con vos hasta "+MOD.minutos+" minutos y no te ayuda. Si no entendés, podés decir <b>\"Sorry, can you repeat, please?\"</b>"
    :"Tocá <b>Empezar</b> y charlá con el examinador en voz alta: cuando hagas una pausa, él sigue solo (no hace falta tocar nada). Si querés, <b>preguntale vos también</b>: te contesta."}</div></div>
  <div class="mic" id="${P}mic" hidden><span class="dot"></span><div class="live"><b id="${P}mict">Te escucho…</b><span id="${P}heard"></span><div class="meter lvl"><i id="${P}lvl"></i></div></div><button class="btn alt" id="${P}talk" hidden>🎤 Hablar</button><button class="btn" id="${P}done" hidden>Listo</button></div>
  <div class="status" id="${P}st" role="status" hidden></div>
  <div id="${P}type" hidden>
    <label for="${P}in" class="es" id="${P}tmsg">El micrófono no funciona en este navegador. Escribí la respuesta (en el celu podés dictarla con el 🎤 del teclado):</label>
    <div class="sbtns"><input id="${P}in" type="text" autocomplete="off" placeholder="My name is…"><button class="btn alt" id="${P}send">Enviar</button></div>
  </div>
  <div id="${P}howbox" hidden>
    <label for="${P}howin" class="es">Escribí en español lo que querés decir y te digo cómo se dice en inglés:</label>
    <div class="sbtns"><input id="${P}howin" type="text" autocomplete="off" placeholder="perro, mi cumpleaños, doblar a la izquierda…" style="flex:2 1 180px;min-width:0;font:600 1rem var(--body);padding:12px;border-radius:12px;border:2px solid var(--line);background:var(--paper);color:var(--ink)"><button class="btn alt" id="${P}howgo">Buscar</button></div>
  </div>
  <div class="sbtns">
    <button class="btn ghost" id="${P}how" ${E?"hidden":""}>❓ ¿Cómo se dice…?</button>
    <button class="btn alt" id="${P}start">${E?"Empezar examen oral":"Empezar conversación"}</button>
    <button class="btn ghost" id="${P}rep" hidden>Repetir pregunta</button>
    <button class="btn ghost" id="${P}kb" hidden>⌨️ Escribir</button>
    <button class="btn ghost" id="${P}stop" hidden>${E?"Terminar":"Pausa"}</button>
    <button class="btn ghost" id="${P}snd">🔊 ¿No se oye? Probar el sonido</button>
  </div></div>`;
  const el=k=>$(P+k);
  const status=m=>{const s=el("st");s.hidden=!m;s.innerHTML=m||""};
  let micBroken=!SR&&!IA_ON,typedResolve=null,rec=null,finishNow=null,run=0,curQ="";
  const typeMode=m=>{capDetener();PERSISTENTE=false;micBroken=true;el("type").hidden=false;if(m)el("tmsg").innerHTML=m;el("done").hidden=true;el("kb").textContent="🎤 Probar el micrófono otra vez"};
  if(!SR&&!IA_ON)typeMode();
  // «Listo» ya no hace falta: la respuesta termina sola cuando hacés una pausa. Queda escondido y aparece TARDE (si seguís en «Te escucho» pasados unos segundos),
  // por si el ruido de fondo no deja que la app note que ya terminaste. (Antes estaba siempre a la vista y el texto de la pantalla mandaba a tocarlo.)
  let tListo=null;
  const listoOcultar=()=>{clearTimeout(tListo);tListo=null;el("done").hidden=true};
  const listoTarde=()=>{listoOcultar();tListo=setTimeout(()=>{tListo=null;if(finishNow&&el("talk").hidden&&!el("mic").hidden)el("done").hidden=false},LISTO_TARDE_MS)};
  const micUI=(on,txt)=>{el("mic").hidden=!on;if(txt)el("mict").textContent=txt;if(!on){el("heard").textContent="";listoOcultar()}};

  // Medidor en vivo: muestra si el micrófono manda sonido y avisa si llega silencio total
  let lvlStream=null,lvlCtx=null,lvlRaf=0,lvlPeak=0,recAbort=null;
  function lvlStop(){cancelAnimationFrame(lvlRaf);if(lvlStream)lvlStream.getTracks().forEach(t=>t.stop());if(lvlCtx)lvlCtx.close().catch(()=>{});lvlStream=lvlCtx=null;if(el("lvl"))el("lvl").style.width="0"}
  async function lvlStart(){
    lvlStop();lvlPeak=0;
    try{
      lvlStream=await abrirMic({audio:true});
      lvlCtx=new (window.AudioContext||window.webkitAudioContext)();if(lvlCtx.state==="suspended")lvlCtx.resume();
      const an=lvlCtx.createAnalyser();an.fftSize=512;lvlCtx.createMediaStreamSource(lvlStream).connect(an);
      const buf=new Uint8Array(an.fftSize);
      const tick=()=>{an.getByteTimeDomainData(buf);let m=0;for(const v of buf)m=Math.max(m,Math.abs(v-128));lvlPeak=Math.max(lvlPeak,m);el("lvl").style.width=Math.min(100,m*2.2)+"%";lvlRaf=requestAnimationFrame(tick)};tick();
    }catch(e){}
  }

  // Escucha por grabación: graba en WAV, corta sola tras un silencio (o con «Listo») y la IA lo pasa a texto
  function listenRec(){
    return new Promise(async res=>{
      let chunks=[],done=false,spoke=false,lastVoice=0,t0=0,capT=null,vigia=null,nf=0,th=0.02,rate=44100,pk=0,adelanto=null,ultFuerte=0;
      const cleanup=()=>{clearTimeout(capT);clearTimeout(vigia);finishNow=null;recAbort=null;listoOcultar();
        if(PERSISTENTE&&_cap)_cap.onFrame=null;   // manos libres: el micrófono sigue abierto, sólo se deja de escuchar hasta la próxima pregunta
        else capDetener();                        // si no: se suelta SIEMPRE, así el examinador se oye
        el("lvl").style.width="0"};
      recAbort=()=>{if(done)return;done=true;cleanup();micUI(false);res(null)};
      const terminar=async()=>{
        if(done)return;done=true;cleanup();
        const seg=chunks.reduce((n,c)=>n+c.length,0)/rate;
        // si el volumen nunca pasó el umbral pero hubo señal, igual se manda a la IA (hay micrófonos que graban muy bajito)
        if(!spoke&&pk<0.008){micUI(false);status("No llegó sonido del micrófono (volumen máx. "+Math.round(pk*100)+" %). Acercate más, hablá más fuerte o subí el volumen de entrada en Windows (Sistema → Sonido → Entrada). También podés usar <b>⌨️ Escribir</b>.");return res(null)}
        micUI(true,"Entendiendo lo que dijiste…");
        try{let t;
          try{t=adelanto?await adelanto.p:await iaTranscribir(_aWav(chunks,rate))}
          catch(e0){if(!adelanto)throw e0;t=await iaTranscribir(_aWav(chunks,rate))}   // si la transcripción adelantada falló, se hace de nuevo
          micUI(false);
          if(!t)status("Grabé "+seg.toFixed(1).replace(".",",")+" s (volumen máx. "+Math.round(pk*100)+" %) pero la IA no entendió palabras. Probá hablar más cerca y más fuerte, o usá <b>⌨️ Escribir</b>.");
          res(t||null)}
        catch(e){console.warn("[IA] transcribir:",e);micUI(false);status("No pude pasar tu voz a texto ("+esc(_iaMsg(e))+"). Tocá <b>⌨️ Escribir</b>.");res(null)}
      };
      // el navegador no deja abrir el micrófono solo (Safari en iPhone sin un toque, audio suspendido, micrófono mudo): se pasa a «tocar 🎤» y se sigue con la misma pregunta
      const caer=e=>{
        if(done)return;done=true;cleanup();micUI(false);
        const eraLibres=PERSISTENTE;
        capDetener();PERSISTENTE=false;   // se suelta todo y se sigue tocando 🎤
        rklog("mic: pasa a «tocar 🎤» → "+(e.name||e.message)+(eraLibres?" (se cortó el micrófono de manos libres)":""));
        if(!el("tap").checked){_tapAuto=true;tapPoner(true)}   // sólo por esta charla y SIN guardarlo (antes quedaba pegado y obligaba a tocar 🎤 Hablar siempre): en la próxima se vuelve a probar sin tocar
        cambioDeModo=true;el("rep").hidden=false;
        status(eraLibres?"Se cortó el micrófono ("+esc(e.name||e.message)+"). Tocá <b>🎤 Hablar</b> para seguir. (Es sólo por esta charla: en la próxima vuelvo a probar sin que toques nada.)"
          :(IS_IOS?"Safari no me deja abrir el micrófono solo en este iPhone ("+esc(e.name||e.message)+"). ":"No pude abrir el micrófono solo ("+esc(e.name||e.message)+"). ")+"Tocá <b>🎤 Hablar</b> cuando quieras contestar. (Es sólo por esta charla: en la próxima vuelvo a probar sin que toques nada.)"+(e.name==="NotAllowedError"?" Si no te deja, en iPhone: Ajustes → Safari → Micrófono → Permitir.":""));
        res(null)};
      try{
        el("talk").hidden=true;listoOcultar();
        micUI(true,"Abriendo el micrófono…");
        const c=await capIniciar();      // se abre sólo para esta respuesta y se suelta al terminar (ver capIniciar); en manos libres ya está abierto
        if(done){capDetener();return}    // frenaron la charla mientras se abría
        if(PERSISTENTE){await new Promise(r=>setTimeout(r,350));if(done)return}   // manos libres: se espera a que se apague el eco del audio del examinador
        const f0=c.frames;
        vigia=setTimeout(()=>{if(done)return;if(c.frames===f0){const e=new Error("no llegó audio");e.name="MicMudo";caer(e)}else if(IS_IOS&&pk===0){const e=new Error("el micrófono llegó mudo");e.name="MicMudo";caer(e)}},3000);   // sin datos (o sólo ceros en iPhone) no hay nada que escuchar
        rate=c.rate;t0=performance.now();
        c.onFrame=d=>{
          if(done)return;
          chunks.push(new Float32Array(d));
          let m=0;for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>m)m=a}
          if(m>pk)pk=m;el("lvl").style.width=Math.min(100,m*260)+"%";
          const now=performance.now();
          if(now-t0<500){if(m>nf)nf=m;th=Math.min(0.04,Math.max(0.008,nf*3))}   // los primeros 0,5 s miden el ruido de fondo
          else{
            if(m>th)ultFuerte=now;
            // Una vez que habló, la voz que se apaga (el final de una palabra) también cuenta, PERO sólo hasta 1,2 s después de la última voz fuerte: más allá, un ruido que sube
            // (el control automático de ganancia del micrófono, un ventilador) no puede «seguir hablando» para siempre. Si volvió a hablar se descarta la transcripción adelantada.
            if(m>th||(spoke&&now-ultFuerte<1200&&m>Math.min(th,Math.max(th*.7,nf*2)))){if(!spoke)el("heard").textContent="🎙️ te escucho…";spoke=true;lastVoice=now;adelanto=null}
          }
          const sil=now-lastVoice;
          if(spoke&&!adelanto&&sil>SIL_ADELANTO_MS){   // 1 s de silencio: se empieza a pasar a texto ya (si sigue hablando, se descarta)
            const a={texto:undefined};a.p=iaTranscribir(_aWav(chunks.slice(),rate)).then(x=>{a.texto=x||"";return x},e=>{a.texto=null;throw e});a.p.catch(()=>{});adelanto=a}
          if(spoke&&sil>SIL_FIN_MS){
            // pausa larga: se da por terminada la respuesta… salvo que lo dicho parezca una frase a la mitad («I went to the beach with my…»): ahí se espera un poco más
            const tx=adelanto?adelanto.texto:null;
            if(sil>=SIL_FIN_MAX_MS||(tx===undefined&&sil>=SIL_TEXTO_MS)||(tx!==undefined&&!escuchaIncompleta(tx)))terminar();
          }else if(!spoke&&now-t0>12000)terminar();
        };
        micUI(true,"Te escucho… hablá ahora");
        finishNow=()=>terminar();capT=setTimeout(terminar,TOPE_RESP_MS);listoTarde();
      }catch(e){
        if(e&&e.name==="Cancelado"){if(!done){done=true;cleanup();micUI(false);res(null)}return}
        caer(e);
      }
    });
  }

  // Cambiar de modo (hablar ↔ escribir) a mitad de una pregunta no es "no te escuché": se vuelve a escuchar sin avisar a la IA
  let cambioDeModo=false;
  async function escuchar(){let t;do{cambioDeModo=false;t=await listen()}while(t===null&&cambioDeModo&&run>=0);return t}
  function listen(){
    if(micBroken)return new Promise(res=>{typedResolve=res;el("type").hidden=false;micUI(true,"Escribí tu respuesta…");el("in").focus()});
    return (el("tap").checked?new Promise(r=>{
      // Se espera un toque antes de abrir el reconocimiento: así arranca igual que el probador (que anda) y con la voz del examinador ya terminada
      micUI(true,"Tocá 🎤 Hablar y contestá");el("talk").hidden=false;listoOcultar();
      el("talk").onclick=()=>{primeAudio();el("talk").hidden=true;r()};
      typedResolve=null;finishNow=()=>{el("talk").hidden=true;finishNow=null;r("cancel")}
    }):Promise.resolve()).then(go=>go==="cancel"?null:(sttRec&&IA_ON)?listenRec():new Promise(res=>{
      try{synth.cancel()}catch(e){}
      let done=false,started=false,text="",silence=null,noSound=null,cap=null,capSin=null;
      let lastErr="",restarts=0,base="";
      const fin=v=>{if(done)return;done=true;lvlStop();clearTimeout(silence);clearTimeout(noSound);clearTimeout(cap);clearTimeout(capSin);finishNow=null;
        if(rec){try{rec.stop()}catch(e){}}rec=null;micUI(false);res(v&&v.trim()?v.trim():null)};
      finishNow=()=>fin(text);
      try{rec=new SR()}catch(e){typeMode();return listen().then(res)}
      rec.lang="en-GB";rec.continuous=false;rec.interimResults=true;rec.maxAlternatives=1;
      rec.onstart=rec.onaudiostart=()=>{if(started)return;started=true;micUI(true,"Te escucho… hablá ahora");listoTarde();
        noSound=setTimeout(async()=>{if(text)return;el("type").hidden=false;
          // recién ahora se abre el medidor (abrirlo desde el principio compite con el reconocimiento en algunos micrófonos)
          status("Revisando el micrófono… <b>hablá ahora</b>");await lvlStart();await new Promise(r=>setTimeout(r,3000));const pk=lvlPeak;lvlStop();if(done||text)return;
          if(IA_ON&&pk>=2&&!sttRec){sttRec=true;status("El dictado del navegador no responde en este equipo: <b>paso a modo grabación con IA</b>. Tocá 🎤 Hablar de nuevo.");return fin(null)}
          status(pk<2?"Casi no llega sonido del micrófono: hablá más cerca y más fuerte, o subí el volumen de entrada en Windows (Sistema → Sonido → Entrada). Mientras, tocá <b>⌨️ Escribir</b>.":"El micrófono sí capta tu voz, pero el servicio de voz de Chrome no devuelve texto"+(lastErr?" (error: <b>"+lastErr+"</b>)":"")+". Suele ser la red, una VPN, un antivirus o el navegador. Probá en <b>Microsoft Edge</b> (PC) o <b>Chrome</b> (Android). En iPhone ningún navegador trae dictado confiable: ahí hace falta la IA o el 🎤 del teclado. Mientras, tocá <b>⌨️ Escribir</b>.")},6000)};
      rec.onresult=e=>{let s="";for(let r=0;r<e.results.length;r++)s+=e.results[r][0].transcript+" ";text=(base+" "+s).replace(/\s+/g," ").trim();
        el("heard").textContent=text;status("");clearTimeout(noSound);clearTimeout(silence);
        silence=setTimeout(()=>fin(text),(escuchaIncompleta(text)?SIL_FIN_MAX_MS:SIL_FIN_MS)+1000)};   // (el dictado del navegador corta solo antes: se le da un segundo más que a la grabación)
      rec.onerror=e=>{lastErr=e.error;
        if(e.error==="not-allowed"||e.error==="service-not-allowed"){done=true;rec=null;micUI(false);if(IS_IOS)return typeMode("En iPhone el dictado de Safari necesita <b>Ajustes → General → Teclado → Activar dictado</b> (y Siri activado). Mientras, escribí o dictá con el 🎤 del teclado:"),void listen().then(res);typeMode("No hay permiso para el micrófono. Tocá el ícono del micrófono o del candado junto a la dirección → Permitir, y recargá. Mientras tanto, escribí:");listen().then(res)}
        else if(e.error==="audio-capture"){done=true;rec=null;micUI(false);typeMode("No se encontró micrófono. Escribí la respuesta:");listen().then(res)}
        else if(e.error==="network"){status("El reconocimiento de voz necesita internet. Revisá la conexión.");fin(text)}
        else if(e.error!=="no-speech"&&e.error!=="aborted")status("Error del micrófono: "+e.error)};
      rec.onend=()=>{if(!done){ if(text){base=text;try{rec.start()}catch(e){fin(text)}} else { restarts++;try{rec.lang=restarts%2?"en-US":"en-GB";rec.start()}catch(e){fin(null)} } }};
      cap=setTimeout(()=>fin(text),TOPE_RESP_MS);capSin=setTimeout(()=>{if(!text)fin(text)},20000);   // si en 20 s no salió ni una palabra, se da por no contestada (el tope largo es sólo para quien sí está hablando)
      micUI(true,"Preparando el micrófono…");
      setTimeout(()=>{if(!started&&!done){done=true;try{rec.abort()}catch(e){}rec=null;micUI(false);typeMode("El micrófono no arrancó. Escribí la respuesta (o probá con <b>Chrome</b> / <b>Edge</b>):");listen().then(res)}},9000);
      try{rec.start()}catch(e){done=true;rec=null;typeMode();listen().then(res)}
    }));
  }
  el("done").onclick=()=>{if(finishNow)finishNow()};
  el("send").onclick=()=>{const v=el("in").value.trim();if(v&&typedResolve){el("in").value="";const r=typedResolve;typedResolve=null;micUI(false);r(v)}};
  el("in").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();el("send").click()}});

  const bubble=(cls,html)=>{const d=document.createElement("div");d.className="msg "+cls;d.innerHTML=html;el("chat").appendChild(d);d.scrollIntoView({block:"nearest",behavior:"smooth"});return d};
  // ❓ ¿Cómo se dice…? : busca primero en el vocabulario del sitio (instantáneo, sin internet) y, si no está, pregunta a la IA
  const sinTildes=t=>String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[¿?¡!.,;:]/g,"").replace(/\s+/g," ").trim();
  function buscarEnVocab(es){
    const q=sinTildes(es);if(!q)return [];const exactas=[],parciales=[];
    VOCAB.forEach(c=>c[3].forEach(([en,esw])=>{
      const alts=sinTildes(esw).split(/\s*[\/(),]\s*/).filter(Boolean);
      if(alts.indexOf(q)>=0)exactas.push({es:esw,en});
      else if(q.length>=4&&alts.some(a=>a.indexOf(q)>=0||(a.length>=4&&q.indexOf(a)>=0)))parciales.push({es:esw,en});
    }));
    return exactas.concat(parciales).slice(0,4);
  }
  async function preguntarIA(es){
    const txt=await _fbGenerar({system:'You are a friendly English teacher for a 10-year-old child from Argentina (level A1-A2). The child writes a word or phrase in Spanish. Answer ONLY with JSON: {"en": the most natural simple English for it, "example": one short simple English sentence that uses it, "example_es": that sentence in Spanish}.',
      contents:[{role:"user",parts:[{text:String(es).slice(0,120)}]}],json:true,temp:.2,tokens:300});
    const o=_jsonDe(txt);if(!o.en)throw new Error("sin respuesta");
    return {en:String(o.en).slice(0,80),example:String(o.example||"").slice(0,140),example_es:String(o.example_es||"").slice(0,140)};
  }
  async function comoSeDice(){
    const es=el("howin").value.trim();if(!es)return;
    el("howin").value="";
    const chip=t=>`<button class="hchip" data-say="${attr(t)}"><b>${esc(t)}</b> 🔊</button>`;
    const hall=buscarEnVocab(es);
    let html;
    if(hall.length&&sinTildes(hall[0].es).split(/\s*[\/(),]\s*/).indexOf(sinTildes(es))>=0){
      html=`<b>«${esc(es)}»</b> se dice ${hall.slice(0,3).map(h=>chip(h.en)).join(" ")}`;
    }else if(fbListo()){
      status("Buscando cómo se dice…");
      try{const r=await preguntarIA(es);status("");
        html=`<b>«${esc(es)}»</b> se dice ${chip(r.en)}`+(r.example?`<br>Ejemplo: ${chip(r.example)}${r.example_es?` <span class="es">— ${esc(r.example_es)}</span>`:""}`:"");
      }catch(e){status("");console.warn("[IA] cómo se dice:",e);
        html=hall.length?`<b>«${esc(es)}»</b> se parece a ${hall.map(h=>chip(h.en)+" <span class=\"es\">("+esc(h.es)+")</span>").join(" ")}`:`No pude buscar «${esc(es)}» ahora (${esc(_iaMsg(e))}). Probá con otra palabra.`}
    }else{
      html=hall.length?`<b>«${esc(es)}»</b> se parece a ${hall.map(h=>chip(h.en)+" <span class=\"es\">("+esc(h.es)+")</span>").join(" ")}`:`No encontré «${esc(es)}» en el vocabulario del sitio. Probá con otra palabra.`;
    }
    bubble("tip",`💡 ${html}`);
  }
  const sincronizarAjustes=()=>{document.querySelectorAll('select[id$="-vel"]').forEach(x=>x.value=VEL_EX);document.querySelectorAll('select[id$="-voz"]').forEach(x=>x.value=VOZ_IOS)};
  el("vel").onchange=()=>{VEL_EX=el("vel").value;try{localStorage.setItem("trinity_vel",VEL_EX)}catch(e){}sincronizarAjustes()};
  if(el("voz"))el("voz").onchange=()=>{VOZ_IOS=el("voz").value;try{localStorage.setItem("trinity_voz2",VOZ_IOS)}catch(e){}sincronizarAjustes()};
  sincronizarAjustes();
  el("how").onclick=()=>{const b=el("howbox");b.hidden=!b.hidden;if(!b.hidden)el("howin").focus()};
  el("howgo").onclick=comoSeDice;
  el("howin").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();comoSeDice()}});
  // Ayudas "cómo se dice": se muestran entre preguntas, con 🔊 para escuchar cada una (sólo si la casilla está tildada)
  const attr=t=>String(t).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  function mostrarAyudas(hints){
    if(!hints||!hints.length||!el("help")||!el("help").checked)return;
    bubble("hint",`<span class="who">💡 Cómo se dice</span><span class="hchips">${hints.map(h=>`<button class="hchip" data-say="${attr(h.en)}"><span class="es">${esc(h.es)}</span> → <b>${esc(h.en)}</b> 🔊</button>`).join("")}</span>`);
  }
  let avisoManosLibres=false,probandoLibres=false;
  // iPhone en «tocar 🎤» porque la revisión de sonido no oyó al examinador con el micrófono abierto (no porque la persona lo haya pedido): se ofrece probar sin tocar nada.
  // Esa revisión puede equivocarse (modo silencio puesto, volumen bajo) y es lo que obliga a tocar «Hablar» en cada respuesta. Elegir probar se guarda («sin tocar») y
  // deja a la vista lo que dice el examinador, por si de verdad no se oye; si no anda, tildar «Tocar 🎤 para hablar» vuelve a como estaba.
  function ofrecerManosLibres(){
    const b=bubble("tip","🎤 Esta charla es <b>tocando «Hablar»</b> en cada respuesta, porque la revisión de sonido no oyó al examinador con el micrófono abierto. ¿Querés <b>probar sin tocar nada</b>?<div class=\"sbtns\"><button type=\"button\" class=\"btn alt\">🙌 Probar manos libres</button></div>");
    b.querySelector("button").onclick=()=>{
      recordarTap(false);probandoLibres=true;
      const t=el("txt");if(t&&!t.checked){t.checked=true;t.dispatchEvent(new Event("change"))}
      stopAll();activeStop=null;endUI();el("start").click()};
  }
  // ---- Manos libres: con el micrófono abierto se mide si el audio del examinador llega al micrófono (si el parlante suena, el micrófono lo oye).
  // Si una frase "sonó" pero no llegó, no se está oyendo (en iPhone con iOS 26/27 pasa con las apps instaladas: WebKit 295518): se muestra el texto,
  // se repite la frase con otra forma de reproducirla (ESTRATEGIAS) y, si ninguna anda, se explica qué hacer. Sólo si en la revisión de sonido la persona
  // SÍ oyó un audio y el micrófono también lo captó (ecoRef): si no, medir el eco en este equipo no dice nada y no se juzga.
  let _mudo={n:0,reint:0,aviso:false};
  async function decirManosLibres(text,burbuja){
    const ref=ecoRef(),inicial=_estrategia;
    for(let vez=0;vez<ESTRATEGIAS.length;vez++){
      if(!_cap)return await say(text,status,{ex:true});   // se cortó el micrófono
      let amb=0,aud=0;const t0=performance.now();
      _cap.onFrame=d=>{let m=0;for(let i=0;i<d.length;i+=8){const a=Math.abs(d[i]);if(a>m)m=a}if(performance.now()-t0<250){if(m>amb)amb=m}else if(m>aud)aud=m};
      await new Promise(r=>setTimeout(r,260));   // primero el ambiente, antes de que hable
      const t1=performance.now();_audErr="";
      const sono=await say(text,status,{ex:true});
      const dur=performance.now()-t1;
      if(_cap)_cap.onFrame=null;
      rklog("eco del examinador en el micrófono: máx "+(aud*100).toFixed(1)+"% (ambiente "+(amb*100).toFixed(1)+"%) · forma "+_estrategia+" ("+ESTRATEGIAS[_estrategia]+")"+(ref?" · referencia "+(ref*100).toFixed(1)+"%":" · sin referencia"));
      // esta forma de reproducir ni siquiera arrancó (el navegador no la deja sin un toque): se pasa a la siguiente
      if(sono===false&&_estrategia>0&&/NotAllowed/.test(_audErr)&&vez<ESTRATEGIAS.length-1){rklog("forma "+_estrategia+" rechazada por el navegador: se prueba la siguiente");_estrategia=(_estrategia+1)%ESTRATEGIAS.length;continue}
      if(sono!==true||!ref||ecoIgnorado()||dur<ECO_MIN_MS)return sono;   // sólo se juzga una frase que sonó, con referencia y que no sea cortita
      if(aud>=Math.max(.012,amb*2.2,ref*.25)){   // llegó al micrófono: se oye
        _mudo.n=0;try{localStorage.setItem("trinity_estr",String(_estrategia))}catch(e){}
        return true}
      // no llegó: no se está oyendo
      _mudo.n++;burbuja.classList.remove("hide");   // por lo menos se puede leer
      if(el("txt")&&!el("txt").checked){el("txt").checked=true}
      rklog("AUDIO MUDO: la frase terminó pero el micrófono no la oyó (forma "+_estrategia+", "+ESTRATEGIAS[_estrategia]+")");
      if(_mudo.reint>=3||vez>=ESTRATEGIAS.length-1){_estrategia=inicial;avisarMudo();return true}   // ya se probó todo: se vuelve a la de antes y se sigue leyendo
      _mudo.reint++;_estrategia=(_estrategia+1)%ESTRATEGIAS.length;   // (se guarda sólo la que funciona)
      rklog("se repite la frase con otra forma de reproducirla: "+ESTRATEGIAS[_estrategia]);
    }
    return true;
  }
  function avisarMudo(){
    if(_mudo.aviso)return;_mudo.aviso=true;
    const b=bubble("tip",'🔇 <b>No detecto que el examinador se esté oyendo</b> (probé varias formas de reproducirlo). Te muestro lo que dice para que puedas seguir <b>leyendo y contestando</b>. Si estás con auriculares, es normal.<br>Si no, en el iPhone casi siempre se arregla <b>cerrando la app del todo</b> (deslizá hacia arriba) y abriéndola de nuevo, o usando el sitio desde <b>Safari</b> en vez del ícono: iOS 26 y 27 tienen un error de audio en las apps instaladas.<div class="sbtns" style="margin-top:8px"><button class="btn ghost" data-a="snd">🔊 Probar el sonido</button><button class="btn ghost" data-a="oigo">👍 Sí lo oigo bien</button></div>');
    b.querySelector('[data-a="snd"]').onclick=()=>el("snd").click();
    b.querySelector('[data-a="oigo"]').onclick=()=>{ecoIgnorar(true);b.remove()};
  }
  async function examiner(text,extra){
    extra=extra||{};
    if(!extra.relleno)curQ=text;   // lo de relleno («Of course.», «Good try…») no reemplaza a la pregunta que «Repetir pregunta» tiene que decir
    registro.push({r:"E",t:String(text),pic:extra.picture&&picInfo(extra.picture)?picInfo(extra.picture).d:"",coach:/^Good try! You can say:/.test(text)});
    const pic=extra.picture?`<span class="bigpic" role="img" aria-label="dibujo">${esc(extra.picture)}</span><span class="piccap">🖼️ Mirá el dibujo</span>`:"";
    const ctx=extra.contexto?`<span class="ctx">${esc(extra.contexto)}</span>`:"";   // p. ej. el punto de la hoja del tema que se está charlando (no se esconde aunque el texto del examinador sí)
    const burbuja=bubble("ex"+(el("txt").checked?"":" hide"),`<span class="who">Examinador</span>${pic}${ctx}${esc(text)}`);
    mostrarAyudas(extra.hints);
    const sono=PERSISTENTE&&_cap?await decirManosLibres(text,burbuja):await say(text,status,{ex:true});
    rklog("examinador: "+(sono===false?"NINGUNA voz sonó":"voz ok"));
    if(sono===false&&PERSISTENTE){burbuja.classList.remove("hide")}   // manos libres: esta frase no tiene audio grabado, se lee
    else if(sono===false){   // ninguna voz funcionó: se muestra lo que dice para poder seguir
      el("txt").checked=true;el("chat").querySelectorAll(".msg.ex.hide").forEach(m=>m.classList.remove("hide"));
      if(!avisoSinVoz){avisoSinVoz=true;bubble("tip","🔇 No pude reproducir la voz del examinador, así que te muestro lo que dice y podés seguir leyendo. <br><button class=\'btn\' style=\'margin-top:8px\' onclick=\'abrirSonido()\'>🔊 Probar el sonido</button>")}
    }
    await new Promise(r=>setTimeout(r,120))}
  const check=(step,t)=>{const low=t.toLowerCase().replace(/[.,!?]/g,"");const tips=step.need.filter(([re])=>!re.test(low)).map(m=>m[1]);
    if(!step.last&&!step.corta&&low.split(/\s+/).filter(Boolean).length<3&&!tips.length)tips.push("Contestá con una oración completa.");return{low,tips}};

  let avisoSinVoz=false;
  let pts=0,total=0,review=[],registro=[],iaCaida=false;
  let _ultTurno={ok:true};   // cómo le fue en la última pregunta: {ok:false} si no contestó o hubo que ayudarla (el examinador no insiste con otra pregunta)
  async function turn(step,id,qtxt){   // qtxt: lo que se le preguntó (para repetirlo si lo pide)
    total++;_ultTurno={ok:true};let nPreg=0;
    for(let attempt=0;attempt<2;attempt++){
      const t=await escuchar();if(run!==id)return null;
      if(t===null){
        _ultTurno.ok=false;registro.push({r:"K",t:"(no answer)"});
        if(attempt===0){await examiner(pick(NO_OIGO),{relleno:true});if(run!==id)return null;continue}
        await examiner(pick(SIGAMOS),{relleno:true});review.push(step);return "";
      }
      bubble("kid",esc(t));registro.push({r:"K",t});_ultTurno.t=t;
      const {low,tips}=check(step,t);
      // le hizo una pregunta al examinador EN VEZ de contestar («What's your name?»): se la contesta, se vuelve a la pregunta y no cuenta como respuesta (no se lo corrige como si hubiera contestado mal)
      if(nPreg<2&&!step.responde&&!step.last&&!step.solo&&step.react!==reaccionPregunta){
        const ep=escuchaPregunta(t);
        if(ep.pregunta&&ep.solo){nPreg++;total--;await examiner(reaccionPregunta(ep.q));if(run!==id)return null;await examiner(pick(ESC_VUELTA),{relleno:true});if(run!==id)return null;await examiner(qtxt||curQ);if(run!==id)return null;total++;attempt--;continue}
      }
      // pidió que se repita: «Of course.» y la misma pregunta, cada una con su audio grabado (juntas no tenían)
      if(/repeat|sorry|don't understand|pardon|what do you mean|say (that )?again/.test(low)&&attempt===0){total--;await examiner(pick(REPITE),{relleno:true});if(run!==id)return null;await examiner(qtxt||curQ);if(run!==id)return null;total++;continue}
      if(tips.length)_ultTurno.ok=false;
      if(!tips.length){pts+=attempt===0?1:.6;return low}
      if(E){pts+=.4;review.push(step);return low}
      if(attempt===0){bubble("tip","<b>Casi.</b> "+tips.join(" ")+`<br>Ejemplo: <i>${esc(step.a)}</i>`);
        await examiner("Good try! You can say: "+step.a+" Now you try.",{relleno:true});if(run!==id)return null}
      else{review.push(step);return low}
    }
  }
  // Charla con IA: el examinador inventa las preguntas y reacciona a lo que dice el chico.
  // La IA juzga cada respuesta (ok/tip/model) en la vuelta SIGUIENTE, por eso se anota con "prev".
  async function conversationIA(id){
    const max=MOD.iaMax||14;let hist=[],prev=null;
    _planIA=planIA(E);   // temas y preguntas-idea distintos en cada examen (ver planIA)
    try{return await conversationIA2(id,max,hist,prev)}finally{_planIA=""}
  }
  async function conversationIA2(id,max,hist,prev){
    for(let k=1;k<=max+1;k++){
      el("n").textContent=`${E?"Examen oral":"Charla con IA"} · ${Math.min(k,max)} de ${max}`;el("bar").style.width=(Math.min(k-1,max)/max*100)+"%";
      let r;
      status("🤔 El examinador está pensando…");
      try{r=await iaPedirReintentos(hist,k,max);status("")}catch(e){
        if(run!==id)return false;
        if(k===1){iaCaida=true;if(/app ?check|not enabled|api key|referer|referrer|permission|40[13]/i.test(String(e&&e.message||e)))sttRec=false;status("No pude conectarme con la IA ("+esc(_iaMsg(e))+"). Sigo con las preguntas de siempre.");console.warn("[IA] sin conexión:",e);return null}
        console.warn("[IA] se cortó la charla:",e);status("Se cortó la conexión con la IA ("+esc(_iaMsg(e))+"): cerramos la charla.");r={reply:"Thank you. That's the end of our conversation. Goodbye!",ok:true,tip:"",model:"",end:true}}
      if(r.end&&k<max&&fbListo()){   // se despidió antes de tiempo: se le pide que siga con el próximo tema del plan
        try{const r2=await iaPedir(hist,k,max,"The exam is NOT over yet. Do not say goodbye and do not set end to true. React to the child's last answer in a few words and continue with the next topic of the agenda.");if(r2&&r2.reply&&!r2.end)r=r2}catch(e){}
      }
      if(run!==id)return false;
      if(prev){total++;
        if(r.ok)pts+=1;
        else{pts+=.4;review.push({q:prev,a:r.model||"…"});
          if(!E&&(r.tip||r.model))bubble("tip",`<b>Casi.</b> ${esc(r.tip||"")}${r.model?`<br>Ejemplo: <i>${esc(r.model)}</i>`:""}`)}}
      // dibujo: sólo de la lista; si habla de un dibujo y no mandó ninguno, se pone uno; si manda uno sin hablar de él, no se muestra
      const habla=PIC_LISTA.length>0&&/picture|photo|image|drawing|look at (this|the)/i.test(r.reply);
      let pic=picInfo(r.picture)?r.picture:"";
      if(!pic&&habla)pic=elegirDibujo(r.reply).e;
      if(pic&&!habla)pic="";
      hist.push({role:"examiner",text:r.reply+(pic?" [PICTURE SHOWN TO THE CHILD: "+pic+" = "+picInfo(pic).d+"]":"")});
      if(r.help)bubble("tip",`💡 ${esc(r.help)}`);
      await examiner(r.reply,{picture:pic,hints:r.hints});if(run!==id)return false;
      if(r.end||k>max)break;
      const t=await escuchar();if(run!==id)return false;
      if(t===null){hist.push({role:"child",text:"(silence)"});registro.push({r:"K",t:"(no answer)"});prev=r.reply;continue}
      bubble("kid",esc(t));hist.push({role:"child",text:t});registro.push({r:"K",t});prev=r.reply;
    }
    return true}
  async function conversation(){
    if(activeStop)activeStop();activeStop=halt;
    const id=++run;pts=0;total=0;review=[];registro=[];iaCaida=false;kidName="";_mudo={n:0,reint:0,aviso:false};
    el("chat").innerHTML="";el("chat").classList.remove("fin");el("start").hidden=true;el("stop").hidden=false;el("rep").hidden=PERSISTENTE;el("kb").hidden=false;status("");
    const prueba=probandoLibres;probandoLibres=false;   // (sólo vale para la charla que se arma justo después de tocar «Probar manos libres»)
    if(PERSISTENTE){bubble("tip","🎙️ <b>Charla manos libres.</b> El examinador usa preguntas grabadas y vos contestás hablando, sin tocar nada: cuando hacés una pausa, él sigue solo. Si no entendés, decí <i>“Sorry, can you repeat, please?”</i> y si querés saber algo, <b>preguntale</b>."+(avisoManosLibres?" (El examinador con IA habla con la voz del celular, que en iPhone no anda con el micrófono abierto: para usarlo tildá «Tocar 🎤 para hablar».)":"")+(prueba?" <b>Es una prueba:</b> si no oís al examinador, tildá «Tocar 🎤 para hablar» (arriba) y seguí tocando 🎤 Hablar.":""))}
    else if(IS_IOS&&el("tap").checked&&tapElegido()!==true&&!_tapAuto&&!micBroken&&!(el("ia")&&el("ia").checked))ofrecerManosLibres();   // iPhone en «tocar 🎤» sin que la persona lo haya pedido (lo puso la revisión de sonido)
    if(IA_ON&&el("ia")&&el("ia").checked){const ok=await conversationIA(id);if(ok===false)return;if(ok===true){el("bar").style.width="100%";finish();return}}
    // el guion de siempre: preguntas distintas cada vez (banco grande, orden al azar, sin repetir lo reciente; ver armarPasos)
    const steps=armarPasos(E?"exam":"practice"),preguntadas=new Set(),mem=escuchaNueva();   // mem: de qué se habló (escucha.js)
    for(let k=0;k<steps.length;k++){
      const step=steps[k];
      el("n").textContent=`${step.rotulo||(E?"Examen oral":"Tema")} · ${k+1} de ${steps.length}`;el("bar").style.width=(k/steps.length*100)+"%";
      const q=(step.intro||"")+(step.last&&kidName?step.q.replace("Thank you.",`Thank you, ${kidName}.`):step.q);
      preguntadas.add(_audioKey(step.q));
      if(step.last){const rec=escuchaRecuerdo(mem);if(rec){await examiner(rec,{relleno:true});if(run!==id)return}}   // «It was nice to hear about your dog.» y recién después la despedida
      await examiner(q,{picture:step.picture,hints:step.hints,contexto:step.contexto,relleno:!!step.solo});if(run!==id)return;
      if(step.solo)continue;   // el examinador habla (p. ej. «Now let's talk about food.») y no se espera respuesta
      const low=await turn(step,id,q);if(run!==id||low===null)return;
      const an=low?escuchaAnalizar(low):null,flojo=!_ultTurno.ok;
      const preg=low&&!step.last&&!step.responde&&step.react!==reaccionPregunta?escuchaResponder(_ultTurno.t||low):null;   // contestó Y le preguntó algo al examinador («…And you?»)
      if(an){mem.n++;escuchaRecordar(mem,an)}
      const fol=low&&!preg?elegirSeguida(step,low,preguntadas,{an,mem,flojo}):null;   // la repregunta sale según lo que dijo (escucha.js); si preguntó él, el examinador contesta y sigue
      if(low){
        if(preg){if(!(step.react&&step.react.generica))await examiner(step.react(low));if(run!==id)return;await examiner(preg)}   // (lo suyo, p. ej. «Nice to meet you, Felu!», y después la respuesta)
        else await examiner(escuchaReaccion(step,low,an,mem,flojo)||step.react(low));
      }
      if(run!==id)return;
      if(fol){preguntadas.add(_audioKey(fol.q));await examiner(fol.q,{hints:fol.hints});if(run!==id)return;const l2=await turn(fol,id,fol.q);if(run!==id||l2===null)return;
        if(l2){const a2=escuchaAnalizar(l2);escuchaRecordar(mem,a2);const pr2=escuchaResponder(_ultTurno.t||l2);await examiner(pr2||escuchaReaccion(fol,l2,a2,mem,!_ultTurno.ok)||fol.react(l2))}if(run!==id)return}
    }
    el("bar").style.width="100%";finish();
  }
  // Al terminar: la IA lee toda la charla y pone una nota. Si no hay IA, no contestó al empezar o falla, queda el resumen simple de antes.
  async function finish(){
    const id=run;
    const hablo=registro.filter(x=>x.r==="K"&&x.t!=="(no answer)").length;
    endUI();el("start").textContent=E?"Hacer otro examen oral":"Otra conversación (preguntas nuevas)";activeStop=null;
    if(!(IA_ON&&fbListo())||iaCaida)return finishViejo(IA_ON&&fbListo()?"La IA no estaba disponible en esta charla, así que no puedo ponerte la nota de 0 a 10. Te dejo el resumen simple:":"");
    if(hablo<3)return finishViejo("Hablaste muy poco como para ponerte una nota. Probá de nuevo contestando cada pregunta con una oración.");
    const espera=bubble("tip","⏳ <b>La IA está corrigiendo tu examen…</b> (unos segundos)");
    let ev=null,err=null;
    try{ev=await iaEvaluar(registro,total>=6?pts/total:null)}catch(e){err=e}
    if(run!==id)return;   // tocó «Empezar» otra vez mientras corregía
    espera.remove();
    if(ev){guardarNota(ev,id);mostrarNota(ev);return}
    finishViejo("No pude conectarme con la IA para ponerte la nota ("+esc(_iaMsg(err))+"). Te dejo el resumen simple:");
  }
  function notasGuardadas(){try{const a=JSON.parse(localStorage.getItem(MOD.notasKey)||"[]");return Array.isArray(a)?a:[]}catch(e){return[]}}
  const modoNota=()=>E?"examen":"charla";
  function guardarNota(ev){try{const a=notasGuardadas();a.push({f:Date.now(),m:modoNota(),n:ev.nota});localStorage.setItem(MOD.notasKey,JSON.stringify(a.slice(-40)))}catch(e){}}
  function mostrarNota(ev){
    const prev=notasGuardadas().filter(x=>x&&x.m===modoNota()&&isFinite(x.n)).slice(0,-1).slice(-4);   // la última es la que se acaba de guardar
    const col=v=>v>=7?"var(--good)":v>=5.5?"var(--accent)":"var(--bad)";
    const crit=EVAL_CRIT.map(([k,ic,nom])=>`<div class="nc"><span>${ic} ${nom}</span><span class="nb"><i style="width:${ev.c[k]*10}%;background:${col(ev.c[k])}"></i></span><b>${ev.c[k]}</b></div>`).join("");
    const preg=ev.pregunto?"✅ Le hiciste una pregunta al examinador.":"❗ No le hiciste ninguna pregunta al examinador (en el examen se pide al menos una), por eso «Entender y responder» no pasa de 6.";
    const aj=ev.ajustes&&ev.ajustes.length?`<p class="es nota-aj">ℹ️ ${ev.ajustes.map(esc).join(" ")}</p>`:"";
    const bien=ev.bien.length?`<h4>👍 Lo que hiciste bien</h4><ul>${ev.bien.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"";
    const mej=ev.mejorar.length?`<h4>🛠️ Para mejorar</h4><ul class="mej">${ev.mejorar.map(x=>`<li>Dijiste: <i>«${esc(x.dijo)}»</i><br>Mejor: <button class="hchip" data-say="${attr(x.mejor)}"><b>${esc(x.mejor)}</b> 🔊</button>${x.porque?`<br><span class="es">${esc(x.porque)}</span>`:""}</li>`).join("")}</ul>`:"";
    const rep=ev.repasar.length?`<h4>📖 Para repasar en «Estudiar»</h4><div class="nrep">${ev.repasar.map(x=>`<span>${esc(x)}</span>`).join("")}</div>`:"";
    const ult=prev.length?`<p class="es">Tus últimas notas: ${prev.map(x=>fmtNota(x.n)).join(" → ")} → <b>${fmtNota(ev.nota)}</b> ${ev.nota-prev[prev.length-1].n>=.5?"· ▲ ¡subiste!":ev.nota-prev[prev.length-1].n<=-.5?"· ▼ bajaste un poco":"· parecida"}</p>`:"";
    el("chat").classList.add("fin");
    const tarjeta=bubble("nota",`<div class="nota-top"><div class="nota-num">${fmtNota(ev.nota)}<small>de 10</small></div><div><div class="nota-tit">${E?"Nota del examen oral":"Nota de la charla"}</div><div class="nota-let"><b>${ev.letra.l}</b> · ${ev.letra.en}</div><div>${ev.letra.msg}</div></div></div>`
      +(ev.resumen?`<p>${esc(ev.resumen)}</p>`:"")+`<div class="ncs">${crit}</div><p>${preg}</p>`+aj+bien+mej+rep+ult
      +`<p class="es nota-pie">Es una estimación de la IA para practicar, no la nota oficial. Se calcula con lo que dijiste (en texto): la pronunciación así no se puede medir, pedile a un adulto que te escuche.</p>`);
    tarjeta.scrollIntoView({block:"start",behavior:"smooth"});   // se ve primero la nota, no el final de la tarjeta
  }
  function finishViejo(aviso){
    const pct=total?Math.round(pts/total*100):0;
    let grade,msg;
    if(pct>=85){grade="Distinction";msg="¡Excelente! Estás listo para el Trinity."}
    else if(pct>=65){grade="Merit";msg="¡Muy bien! Repasá las preguntas de abajo."}
    else if(pct>=45){grade="Pass";msg="Aprobado. Practicá las respuestas de abajo para subir la nota."}
    else{grade="Todavía no";msg="Seguí practicando en la pestaña Speaking y probá otra vez."}
    const rv=review.length?`<br>Para practicar:<ul>${review.map(s=>`<li>${esc(s.q)}<br><span class="r">✓ ${esc(s.a)}</span></li>`).join("")}</ul>`:"<br>¡Todas las respuestas completas!";
    bubble("tip",(aviso?`${aviso}<br><br>`:"")+(E?`<span class="grade">${grade}</span><br><b>${pct}%</b> — ${msg}${rv}`:`<b>¡Terminaste la conversación!</b><br>Respuestas completas: <b>${pct}%</b>${rv}`));
    endUI();el("start").textContent=E?"Hacer otro examen oral":"Otra conversación (preguntas nuevas)";activeStop=null;
  }
  function endUI(){capDetener();PERSISTENTE=false;el("type").hidden=true;el("start").hidden=false;el("stop").hidden=true;el("rep").hidden=true;el("kb").hidden=true;micUI(false)}
  function stopAll(){run++;capDetener();PERSISTENTE=false;lvlStop();if(recAbort){recAbort();recAbort=null}if(synth)synth.cancel();if(rec){try{rec.abort()}catch(e){}rec=null}finishNow=null;typedResolve=null;micUI(false)}
  function halt(){const was=!el("start").hidden?false:true;stopAll();if(was){endUI();el("start").textContent=E&&total>0?"Hacer otro examen oral":"Empezar de nuevo";bubble("tip","Conversación en pausa.")}activeStop=null}
  el("start").onclick=async()=>{
    stopAll();if(activeStop)activeStop();      // si hay otra charla andando se la frena ANTES de abrir el micrófono
    if(IS_IOS&&!leerSonido()&&!window.__sonidoVisto){window.__sonidoVisto=true;abrirSonido(()=>el("start").click());return}   // iPhone: primero se confirma qué se escucha (una sola vez)
    if(_tapAuto){_tapAuto=false;tapPoner(false)}   // el «tocar 🎤» lo puso la app por un corte de la charla anterior: se vuelve a probar sin tocar
    PERSISTENTE=IS_IOS&&!el("tap").checked&&!micBroken;   // iPhone sin «tocar 🎤»: manos libres con el micrófono abierto toda la charla
    avisoManosLibres=false;
    if(PERSISTENTE&&el("ia")&&el("ia").checked){el("ia").checked=false;avisoManosLibres=true}   // el examinador con IA habla con la voz del celular, que en manos libres no se puede usar
    unlockVoice();calentarIA();   // (sin primeAudio(): no debe quedar ningún audio abierto cuando habla el examinador)
    if(!micBroken){
      status("Permitile al navegador usar el micrófono (aparece un cartel arriba a la izquierda)…");
      const m=PERSISTENTE?await abrirSesionMic():await prepMic();status("");   // manos libres: queda abierto · si no, sólo se pide el permiso y se suelta: se abre de nuevo en cada respuesta
      if(PERSISTENTE&&m!=="ok")PERSISTENTE=false;
      if(m==="denied")typeMode(MSG_MIC_DENEGADO());
      else if(m==="nodev")typeMode("No se encontró micrófono. Escribí la respuesta:");
      else if(m.indexOf("error:")===0){micPermState="unknown";status("El micrófono no abrió ahora ("+esc(m.slice(6))+"). Probá tocar 🎤 Hablar igual; si no anda, cerrá otras apps que usen el micrófono y recargá, o usá ⌨️ Escribir.")}
    }
    conversation()};
  el("stop").onclick=()=>{stopAll();activeStop=null;if(E&&total>0){finish();return}endUI();el("start").textContent="Empezar de nuevo";bubble("tip","Conversación en pausa.")};
  el("rep").onclick=()=>{if(curQ)say(curQ,status,{ex:true})};
  el("snd").onclick=()=>{if(el("start").hidden)tapPoner(true);abrirSonido(()=>el("start").click())};   // si se apretó en plena charla: vuelve a «tocar 🎤», el modo que andaba (sin guardarlo; la revisión de sonido decide después)
  // alternar entre hablar y escribir en cualquier momento
  el("kb").onclick=async()=>{
    if(!micBroken){typeMode("Escribí tu respuesta (en el celu podés dictarla con el 🎤 del teclado):");el("kb").textContent="🎤 Volver al micrófono";if(finishNow){cambioDeModo=true;const f=finishNow;f()}return}
    // volver al micrófono: se pide el permiso de nuevo DENTRO del toque (así el iPhone vuelve a preguntar)
    micPermState="unknown";
    const sinDictado=!SR&&!IA_ON;
    let m="ok";
    const libres=IS_IOS&&!el("tap").checked&&!sinDictado;
    if(!sinDictado){status("Probando el micrófono…");m=libres?await abrirSesionMic():await prepMic();status("");PERSISTENTE=libres&&m==="ok"}
    if(m==="denied"){typeMode(MSG_MIC_DENEGADO());return}
    if(m==="nodev"){typeMode("No se encontró micrófono. Escribí la respuesta:");return}
    if(m.indexOf("error:")===0){status("El micrófono no abrió ("+esc(m.slice(6))+"). Cerrá otras apps que lo usen, recargá la página y probá de nuevo.");return}
    micBroken=sinDictado;el("type").hidden=!micBroken;listoOcultar();
    el("kb").textContent="⌨️ Escribir";el("tmsg").innerHTML="Escribí tu respuesta:";
    if(!micBroken)status(el("tap").checked?"✅ Micrófono listo. Cuando el examinador pregunte, tocá <b>🎤 Hablar</b>.":"✅ Micrófono listo. Te escucho solo cuando el examinador termine de preguntar.");
    if(typedResolve){cambioDeModo=true;const r=typedResolve;typedResolve=null;micUI(false);r(null)}   // retoma la pregunta ahora con el micrófono
  };
  el("tap").onchange=()=>recordarTap(el("tap").checked);
  el("pausa").value=pausaLarga()?"larga":"normal";
  el("pausa").onchange=()=>{const l=el("pausa").value==="larga";try{if(l)localStorage.setItem(PAUSA_KEY,"larga");else localStorage.removeItem(PAUSA_KEY)}catch(e){}pausaAplicar(l);document.querySelectorAll('select[id$="-pausa"]').forEach(x=>x.value=l?"larga":"normal")};
  if(el("ia"))el("ia").onchange=()=>{if(IS_IOS&&el("ia").checked)document.querySelectorAll('input[id$="-tap"]').forEach(x=>x.checked=true)};   // la voz del celular sólo anda tocando 🎤 (con el micrófono abierto se corta)
  el("txt").onchange=e=>el("chat").querySelectorAll(".msg.ex").forEach(m=>m.classList.toggle("hide",!e.target.checked));
}
mountConv("practice","practice");
mountConv("oral","exam");
aplicarSonido(leerSonido());   // lo que la persona dijo que escucha la última vez

document.getElementById("vocab").innerHTML=VOCAB.map(([en,es,ex,w])=>`<details><summary>${en} <span class="es">· ${es}</span></summary>
<p class="es"><button class="ejem" data-say="${ex.replace(/<[^>]+>/g,"").replace(/ \/ /g,". ").replace(/"/g,"")}">🔊 Ejemplo: ${ex}</button></p><div class="chips">${w.map(([a,b])=>`<button class="chip" data-say="${a.replace(/"/g,"")}"><b>${a}</b><span>${b}</span></button>`).join("")}</div></details>`).join("");
function toast(m){let t=$("toast");if(!t){t=document.createElement("div");t.id="toast";t.setAttribute("role","status");document.body.appendChild(t)}t.innerHTML=m;t.classList.add("on");clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove("on"),5000)}
function _sonidoDe(el){   // qué texto se lee al tocar este elemento
  let c=el.closest("[data-say]"),txt=c&&c.dataset.say.replace(" / "," or ");
  if(!c){c=el.closest("ul.ex li");if(!c)return null;const k=c.cloneNode(true);k.querySelectorAll(".es").forEach(x=>x.remove());
    txt=k.textContent.replace(/^\s*(Negativo|Pregunta|Afirmativo|Afirmativa|Respuesta|Ejemplo|Corta)s?:\s*/i,"").replace(/[.]?\s*\/\s*/g,". ").replace(/\s+/g," ").trim()}
  return txt?{c,txt}:null;
}
function tocarSonido(e){
  const r=_sonidoDe(e.target);if(!r)return;
  r.c.classList.add("pressed");say(r.txt,toast).then(()=>r.c.classList.remove("pressed"))}
document.addEventListener("click",tocarSonido);
document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches&&e.target.matches('.ord div[data-say]')){e.preventDefault();tocarSonido(e)}});


// ---- todo lo de estudiar se puede escuchar: celdas en inglés de las tablas
(function(){
  const ES=/^(espa[ñn]ol|significa|con)$/i;
  document.querySelectorAll("#v-study table").forEach(t=>{
    const hs=[...t.querySelectorAll("tr:first-child th")].map(h=>h.textContent.trim());
    t.querySelectorAll("tr").forEach((tr,ri)=>{if(!ri)return;
      [...tr.children].forEach((td,ci)=>{
        if(td.tagName!=="TD"||ES.test(hs[ci]||""))return;
        const c=td.cloneNode(true);c.querySelectorAll(".scene").forEach(x=>x.remove());
        const txt=c.textContent.replace(/[…]+/g," ").replace(/[.]?\s*\/\s*/g,". ").replace(/\s+/g," ").trim();
        if(!txt||!/[a-z]/i.test(txt))return;
        td.classList.add("say-td");td.dataset.say=txt;td.setAttribute("title","Tocá para escuchar")})})});
})();

(function(){
  // 1) iconos en los títulos de cada tema
  document.querySelectorAll("details > summary").forEach(sm=>{
    if(sm.closest(".diag"))return;
    const nom=sm.firstChild&&sm.firstChild.nodeType===3?sm.firstChild.textContent:sm.textContent;
    const ic=DIB_CAT[nom.trim().toLowerCase()];if(ic){const i=document.createElement("span");i.className="cat-ic";i.textContent=ic;i.setAttribute("aria-hidden","true");sm.insertBefore(i,sm.firstChild)}
  });
  // 2) cada palabra del vocabulario lleva su dibujo
  document.querySelectorAll(".chip").forEach(c=>{
    const b=c.querySelector("b");if(!b)return;const k=b.textContent.trim().toLowerCase();
    const e=DIB[k];if(e){const s=document.createElement("span");s.className="pic";s.textContent=e;s.setAttribute("aria-hidden","true");c.insertBefore(s,c.firstChild)}
  });
  // 3) escenas en las tablas de preposiciones
  document.querySelectorAll("details").forEach(d=>{
    const sm=d.querySelector("summary");if(!sm)return;
    const t=sm.textContent.toLowerCase();
    if(!/prepositions of (place|movement|time)/.test(t))return;
    d.querySelectorAll("table tr").forEach((tr,i)=>{
      if(!i)return;const td=tr.querySelector("td"),b=tr.querySelector("b");if(!td||!b)return;
      const k=b.textContent.trim().toLowerCase();const key=/time/.test(t)&&k==="on"?"on ":k;
      if(DIB_PREP[key])td.insertAdjacentHTML("afterbegin",'<span class="scene" aria-hidden="true">'+DIB_PREP[key]+"</span><br>")});
  });
  // 4) números ordinales: medallas, puntitos y calendario
  document.querySelectorAll("#ordinals div").forEach((d,i)=>{
    const n=i+1;let g=n===1?"🥇":n===2?"🥈":n===3?"🥉":n<=10?"🏅":"📅";
    const s=document.createElement("span");s.className="og";s.setAttribute("aria-hidden","true");s.textContent=g;d.insertBefore(s,d.children[1]);
  });
})();

const N=30, ex=document.getElementById("exam");
let qs=[],i=0,score=0,wrong=[];
const shuffle=a=>{a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};
function intro(){
  ex.innerHTML=`<div class="card"><div class="tag">Antes de empezar</div><p>Elegí la respuesta correcta. Vas a ver enseguida si está bien. Al final aparece tu nota y las que tenés que repasar.</p><p class="es">Cada examen trae preguntas distintas: el banco tiene ${bank.length} y cada examen usa ${N}, empezando por las que hace más que no te salen.</p><button class="btn alt" id="start">Empezar examen</button></div>`;
  document.getElementById("start").onclick=start;
}
// ---- Qué preguntas salen en cada examen. Antes eran 30 al azar de un banco chico y sin memoria, así que de un examen al siguiente se repetían muchas.
// Ahora se recuerda qué examen vio cada pregunta (localStorage, una memoria por módulo) y se eligen primero las que NUNCA salieron y después las que hace más que no salen;
// siempre una de cada tema (la más vieja de ese tema) para que el examen cubra todo. Se anota que una pregunta se vio recién cuando se la muestra: si dejás el examen a medias, las que no llegaste a ver siguen siendo «nuevas».
const ESC_KEY=VISTAS_KEY+"_esc";
function escMemLeer(){try{const o=JSON.parse(localStorage.getItem(ESC_KEY)||"{}");return o&&typeof o==="object"&&!Array.isArray(o)?o:{}}catch(e){return {}}}
function escMemGuardar(o){try{const ks=Object.keys(o).filter(k=>k!=="_n");if(ks.length>900)ks.sort((a,b)=>(o[a]||0)-(o[b]||0)).slice(0,ks.length-700).forEach(k=>delete o[k]);localStorage.setItem(ESC_KEY,JSON.stringify(o))}catch(e){}}
const escClave=q=>"e"+_audioKey(q[1]+"|"+q[2].join("|"));
function armarExamen(banco,cant,V){   // → las preguntas de este examen (V: la memoria; V._n = cuántos exámenes se armaron)
  const n=(V._n||0)+1;
  const edad=q=>{const u=V[escClave(q)];return u?n-u:1e6};   // hace cuántos exámenes salió (1e6 = nunca)
  const orden=l=>l.map(q=>[q,edad(q)+Math.random()*.9]).sort((a,b)=>b[1]-a[1]).map(x=>x[0]);   // la que hace más que no sale, primero; entre iguales, al azar
  const porTema={};banco.forEach(q=>(porTema[q[0]]=porTema[q[0]]||[]).push(q));
  const base=Object.values(porTema).map(l=>orden(l)[0]);   // una de cada tema (la que hace más que no sale)
  // el resto: primero las que NUNCA salieron, cuidando que un tema chico no se agote antes que los grandes (cada examen le saca una por la regla de arriba): se le deja una reserva
  // de sin ver (5 y, si no alcanza, se va aflojando) y recién cuando no queda nada sin ver se completa con las más viejas. Así una pregunta no vuelve antes de los ~6 exámenes.
  const resto=orden(banco.filter(q=>base.indexOf(q)<0)),falta=cant-base.length,extras=[],sinVer={},gasto={};
  resto.forEach(q=>{if(edad(q)>=1e6)sinVer[q[0]]=(sinVer[q[0]]||0)+1});
  for(let reserva=5;reserva>=0&&extras.length<falta;reserva--){
    for(const q of resto){
      if(extras.length>=falta)break;
      if(edad(q)<1e6||extras.indexOf(q)>=0)continue;
      if((sinVer[q[0]]||0)-(gasto[q[0]]||0)>reserva){extras.push(q);gasto[q[0]]=(gasto[q[0]]||0)+1}
    }
  }
  for(const q of resto){if(extras.length>=falta)break;if(extras.indexOf(q)<0)extras.push(q)}
  return shuffle(base.concat(extras).slice(0,cant));
}
let examNro=0,examNuevas=0;
function start(){
  const V=escMemLeer(),pick=armarExamen(bank,N,V);
  examNuevas=pick.filter(q=>!V[escClave(q)]).length;examNro=(V._n||0)+1;
  V._n=examNro;escMemGuardar(V);
  qs=pick.map(([t,q,o,a])=>{const idx=shuffle(o.map((_,k)=>k));return{t,q,o:idx.map(k=>o[k]),a:idx.indexOf(a),k:escClave([t,q,o,a])}});
  i=0;score=0;wrong=[];show();
}
function show(){
  const q=qs[i];
  {const V=escMemLeer();V[q.k]=V._n||examNro||1;escMemGuardar(V)}   // desde ahora esta pregunta cuenta como «ya vista»
  ex.innerHTML=`<div class="row" style="margin:0"><span class="tag">Pregunta ${i+1} de ${qs.length}</span><span class="tag">Correctas: ${score}</span></div>
  <div class="bar"><i style="width:${i/qs.length*100}%"></i></div>
  <div class="card"><div class="tag">${q.t}</div><div class="qtext">${q.q}</div><button class="link qsay" id="qsay">🔊 Escuchar la pregunta</button>
  <div class="opts">${q.o.map((o,k)=>`<button class="opt" id="opt${k}" data-k="${k}">${o}</button>`).join("")}</div>
  <div class="fb" id="fb"></div>
  <div class="row"><span></span><button class="btn" id="next" hidden>${i+1<qs.length?"Siguiente":"Ver resultado"}</button></div></div>`;
  ex.querySelectorAll(".opt").forEach(b=>b.onclick=()=>answer(+b.dataset.k));
  $("qsay").onclick=()=>say(q.q.replace(/_{2,}/g," blank ").replace(/\([^)]*\)/g,"").replace(/\s+/g," ").trim(),toast);
}
function answer(k){
  const q=qs[i],btns=ex.querySelectorAll(".opt"),fb=document.getElementById("fb");
  btns.forEach(b=>b.disabled=true);
  btns[q.a].classList.add("ok");
  if(k===q.a){score++;fb.className="fb ok";fb.textContent="¡Muy bien!"}
  else{btns[k].classList.add("no");fb.className="fb no";fb.textContent="La correcta es: "+q.o[q.a];wrong.push(q)}
  const n=document.getElementById("next");n.hidden=false;n.focus();
  n.onclick=()=>{i++;i<qs.length?show():result()};
}
function result(){
  const pct=Math.round(score/qs.length*100);
  const msg=pct>=90?"¡Excelente! Estás listo/a para el examen.":pct>=70?"¡Muy bien! Repasá los temas que fallaste.":pct>=50?"Vas bien, pero conviene repasar.":"Volvé a la pestaña Estudiar y probá de nuevo.";
  const topics=[...new Set(wrong.map(q=>q.t))];
  ex.innerHTML=`<div class="card"><div class="tag">Resultado</div><div class="score">${score} / ${qs.length}</div><p><b>${pct}%</b> — ${msg}</p>${examNro>1?`<p class="es">🆕 ${examNuevas} de las ${qs.length} preguntas de este examen eran nuevas para vos.</p>`:""}
  ${topics.length?`<h3>Temas para repasar</h3><p>${topics.join(" · ")}</p><h3>Tus errores</h3><ol class="review">${wrong.map(q=>`<li>${q.q}<br><span class="r">✓ ${q.o[q.a]}</span></li>`).join("")}</ol>`:"<p>¡Sin errores!</p>"}
  <div class="row"><button class="btn alt" id="again">Hacer otro examen</button></div></div>`;
  document.getElementById("again").onclick=start;
}
intro();

document.addEventListener('touchstart',()=>{},{passive:true});
// ---- pestañas
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>{
  document.querySelectorAll("nav button").forEach(x=>x.setAttribute("aria-selected",String(x===b)));
  ["study","speak","exam"].forEach(v=>document.getElementById("v-"+v).hidden=v!==b.dataset.v);
  if(activeStop)activeStop();
  if(b.dataset.v==="speak"||b.dataset.v==="exam")calentarIA();
  window.scrollTo({top:0});
}));

// ---- diagnóstico de sonido (para saber qué falla en un celular sin consola)
const BUILD="2026-11-04 · desafío y juegos nuevos (ajustes)";
(function(){
  const log=$("dsLog");
  const L=(ok,t)=>{const li=document.createElement("li");li.className=ok===true?"ok":ok===false?"no":"";li.textContent=t;log.appendChild(li)};
  const modo=()=>((navigator.standalone||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches))?"app instalada":"navegador");
  function cabecera(){
    log.innerHTML="";
    L(null,"Versión del sitio: "+BUILD);
    L(null,"Dispositivo: "+(IS_IOS?"iPhone/iPad":/Android/i.test(navigator.userAgent)?"Android":"PC")+" · abierto en: "+modo());
    L(null,"Modo silencio de Safari (audioSession): "+(navigator.audioSession?navigator.audioSession.type:"no disponible en este iPhone"));
    L(null,"Audios guardados en el sitio: "+_AUDIO_SET.size+" · IA conectada: "+(fbListo()?"sí":"no"));
    L(null,"Voz del navegador desbloqueada: "+(_voiceOk?"sí":"todavía no")+" · voz del celular descartada en esta sesión: "+(_localMuda?"sí":"no")+" · voz de la IA agotada hoy: "+(_iaVozAgotada?"sí":"no"));
  }
  // informe completo (dispositivo, ajustes, registro de lo que pasó con la voz y el micrófono) para pegarlo en el chat
  function informe(n){
    const ua=navigator.userAgent,ios=(/OS (\d+[_\d]*) like Mac OS X/.exec(ua)||[])[1];
    let tap="(sin elegir)";try{const v=localStorage.getItem(TAP_KEY);if(v==="1")tap="elegido: tocar";else if(v==="0")tap="elegido: sin tocar"}catch(e){}
    tap+=" · casilla "+((document.querySelector('input[id$="-tap"]')||{}).checked?"tildada":"destildada")+(_tapAuto?" (la puso la app por un corte)":"");
    const l=["Informe Trinity · "+MOD.id+" · "+BUILD+" · "+new Date().toLocaleString("es-AR"),
      "Dispositivo: "+(IS_IOS?"iPhone/iPad"+(()=>{const v=IOS_VER>=26?(/Version\/([\d.]+)/.exec(ua)||[])[1]:(ios?ios.replace(/_/g,"."):(IOS_VER||""));return v?" · iOS "+v:""})():/Android/i.test(ua)?"Android":"PC")+" · abierto en: "+modo()+" · pantalla "+innerWidth+"x"+innerHeight,
      (n?null:"Navegador: "+ua)+(n?"":(IOS_VER?" · iOS/Safari "+IOS_VER:"")+" · app instalada: "+(esInstalada()?"sí":"no")),
      "audioSession: "+((navigator.audioSession&&navigator.audioSession.type)||"no disponible")+" · IA conectada: "+(fbListo()?"sí":"no")+" · tocar 🎤: "+tap+" · velocidad: "+VEL_EX+" · voz iPhone: "+VOZ_IOS,
      "Audio en manos libres: forma "+_estrategia+" ("+ESTRATEGIAS[_estrategia]+") · referencia de eco: "+(ecoRef()?(ecoRef()*100).toFixed(1)+"%":"no hay (no se vigila)")+" · vigilancia: "+(ecoIgnorado()?"apagada por la persona":"activa")+" · app instalada: "+(esInstalada()?"sí":"no"),
      "Voz del navegador desbloqueada: "+(_voiceOk?"sí":"no")+" · voz del celular descartada: "+(_localMuda?"sí":"no")+" · voz de la IA agotada: "+(_iaVozAgotada?"sí":"no")+" · permiso de micrófono: "+micPermState+" · revisión de sonido: "+(localStorage.getItem("trinity_sonido3")||"(sin hacer)")+" · audio grabado usado: "+(MP3_OK?"sí":"no")+" · sin voz: "+(SIN_VOZ?"sí":"no"),
      "--- registro ("+(n?"la prueba de sonido y lo último":"lo último, abajo")+") ---"].concat(_RK.length?(n?_RK.filter(x=>/prueba de sonido/.test(x)).slice(-n).concat(_RK.slice(-3)).filter((x,i,a)=>a.indexOf(x)===i):_RK.slice(-80)):["(todavía no pasó nada: hacé una charla y volvé a copiar)"]);
    for(let i=l.length-1;i>=0;i--)if(l[i]===null)l.splice(i,1);
    if(!n&&log.children.length){l.push("--- diagnóstico ---");[...log.children].forEach(li=>l.push((li.className==="ok"?"[OK] ":li.className==="no"?"[FALLA] ":"")+li.textContent))}
    return l.join("\n");
  }
  window.rkInforme=informe;
  $("dsCopy").onclick=async()=>{
    const t=informe();let ok=false;
    try{await navigator.clipboard.writeText(t);ok=true}catch(e){}
    const ta=$("dsInforme");ta.hidden=false;ta.value=t;
    if(!ok){ta.focus();ta.select();try{ok=document.execCommand("copy")}catch(e){}}
    $("dsCopiado").textContent=ok?"✅ Informe copiado: pegalo en el chat.":"No pude copiarlo solo: mantené apretado el cuadro de abajo, elegí «Seleccionar todo» → «Copiar» y pegalo en el chat."};
  $("dsA").onclick=()=>{
    cabecera();
    const k=_audioKey("Monday"),url=BASE+"audio/"+k+".mp3";
    const a=new Audio();a.src=url;                         // play() es lo PRIMERO que se hace, dentro del toque
    const pr=a.play();
    a.onended=()=>L(true,"Audio del sitio: terminó. Si escuchaste «Monday», el audio del sitio anda.");
    a.onerror=()=>L(false,"Audio del sitio: error del reproductor (código "+(a.error?a.error.code:"?")+(a.error&&a.error.message?" · "+a.error.message:"")+")");
    if(pr&&pr.then)pr.then(()=>L(true,"Audio del sitio: empezó a reproducirse (¿lo escuchaste?)")).catch(e=>L(false,"Audio del sitio: el celular NO lo dejó sonar → "+e.name+": "+e.message));
    fetch(url,{headers:{Range:"bytes=0-1"}}).then(r=>L(r.status===206,"Descarga del audio por partes: "+r.status+(r.status===206?" (correcto)":" (el iPhone necesita 206)"))).catch(e=>L(false,"No se pudo bajar el audio ("+e.message+"): revisá la conexión"));
  };
  $("dsB").onclick=()=>{
    cabecera();
    if(!window.speechSynthesis){L(false,"Este navegador no tiene voz propia.");return}
    const v=speechSynthesis.getVoices();L(null,"Voces del navegador: "+v.length+" · en inglés: "+v.filter(x=>/^en/i.test(x.lang)).length);
    try{speechSynthesis.cancel()}catch(e){}
    const u=new SpeechSynthesisUtterance("Hello, can you hear me?");u.lang="en-GB";u.volume=1;
    u.onstart=()=>L(true,"Voz del navegador: empezó a hablar (¿la escuchaste?)");u.onend=()=>L(true,"Voz del navegador: terminó");
    u.onerror=e=>L(false,"Voz del navegador: error → "+e.error);
    speechSynthesis.speak(u);
    setTimeout(()=>{if(!speechSynthesis.speaking)L(false,"Voz del navegador: no llegó a empezar (el iPhone la bloquea o no hay voz en inglés)")},2500);
  };
  $("dsC").onclick=async()=>{
    cabecera();unlockAudioEl();
    if(!fbListo()){L(false,"La IA no está conectada.");return}
    L(null,"Pidiendo la voz a Gemini… (tarda unos segundos)");
    const t0=performance.now();
    try{const ok=await iaVoz("Hello, can you hear me? This is the voice of the examiner.");
      L(ok,"Voz de la IA: "+(ok?"sonó (":"no pudo generarse (")+((performance.now()-t0)/1000).toFixed(1).replace(".",",")+" s)")}
    catch(e){L(false,"Voz de la IA: error → "+_iaMsg(e))}
  };
  $("dsD").onclick=async()=>{
    cabecera();primeAudio();audioSesion("play-and-record");
    const md=navigator.mediaDevices;
    L(null,"Sitio seguro (https): "+(window.isSecureContext?"sí":"NO")+" · getUserMedia: "+(md&&md.getUserMedia?"disponible":"NO disponible"));
    if(!md||!md.getUserMedia){L(false,"Este navegador o ventana no permite usar el micrófono. Abrí el link en Safari.");return}
    L(null,"Pidiendo permiso del micrófono… (si aparece un cartel, tocá Permitir)");
    let stream,tr;
    try{stream=await abrirMic({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:true}})}
    catch(e){L(false,"Permiso del micrófono: "+e.name+(e.message?" · "+e.message:"")+(e.name==="NotAllowedError"?" → en Safari tocá aA → Configuración del sitio web → Micrófono → Permitir":""));return}
    tr=stream.getAudioTracks()[0];
    L(true,"Permiso OK · micrófono: "+((tr&&tr.label)||"(sin nombre)")+" · estado: "+(tr?tr.readyState:"?")+(tr&&tr.muted?" · SILENCIADO por el sistema":""));
    let ctx=_actx;
    try{if(ctx.state!=="running")await Promise.race([ctx.resume(),new Promise(r=>setTimeout(r,2000))])}catch(e){}
    L(ctx.state==="running","Audio del navegador (AudioContext): "+ctx.state+" · "+ctx.sampleRate+" Hz"+(ctx.state==="running"?"":" → no arrancó: tocá el botón otra vez"));
    let frames=0,peak=0,chunks=[];
    const src=ctx.createMediaStreamSource(stream),proc=ctx.createScriptProcessor(4096,1,1);
    proc.onaudioprocess=e=>{const d=e.inputBuffer.getChannelData(0);frames++;chunks.push(new Float32Array(d));for(let i=0;i<d.length;i++){const a=Math.abs(d[i]);if(a>peak)peak=a}};
    src.connect(proc);proc.connect(ctx.destination);
    L(null,"🎙️ HABLÁ AHORA en inglés durante 4 segundos…");
    await new Promise(r=>setTimeout(r,4000));
    try{proc.onaudioprocess=null;proc.disconnect();src.disconnect()}catch(e){}
    stream.getTracks().forEach(t=>t.stop());audioSesion("auto");
    const rate=ctx.sampleRate;try{ctx.close()}catch(e){}_actx=null;
    L(frames>0,"Bloques de audio recibidos: "+frames+(frames?"":" → el iPhone no está entregando audio"));
    L(peak>0.01,"Volumen máximo captado: "+Math.round(peak*100)+" %"+(peak>0.01?"":" → muy bajo o nada: acercate y hablá más fuerte"));
    if(!frames||peak<=0.008)return;
    if(!fbListo()){L(null,"La IA no está conectada: no se puede pasar a texto.");return}
    L(null,"Enviando tu voz a la IA para pasarla a texto…");
    try{const t=await iaTranscribir(_aWav(chunks,rate));L(!!t,"La IA entendió: «"+(t||"nada")+"»")}
    catch(e){L(false,"Error al pasar la voz a texto: "+_iaMsg(e))}
  };
  $("buildInfo").textContent="Versión "+BUILD;
})();

// ---- instalar como app
if("serviceWorker"in navigator&&location.protocol==="https:")navigator.serviceWorker.register(BASE+"sw.js").catch(()=>{});
// ---- ¿Hay una versión nueva? En el iPhone una app que vuelve del fondo NO se recarga sola: puede quedar horas o días con la versión vieja en memoria
// («sigue igual» aunque ya esté arreglado). Al abrir se recarga sola si quedó una versión vieja; al volver del fondo sólo avisa, para no cortar lo que se estaba haciendo.
pastilla();
(function(){   // iPhone con iOS 26+ y la app instalada: se avisa del error de Apple y se explica cómo usarla en Safari
  if(!(IS_IOS&&IOS_VER>=26&&esInstalada()))return;
  const hoy=new Date().toISOString().slice(0,10);let visto="";try{visto=localStorage.getItem("trinity_aviso_pwa")||""}catch(e){}
  if(visto===hoy)return;
  const d=document.createElement("div");d.className="rk-pwa";d.setAttribute("role","note");
  d.innerHTML='<b>⚠️ Estás usando la app instalada.</b> En iPhone con iOS 26 o más nuevo, las apps instaladas <b>pueden quedarse sin audio</b> (error de Apple, todavía sin arreglar). Si no escuchás al examinador, <b>cerrala del todo</b> (deslizá hacia arriba) y abrila de nuevo; si sigue igual, abrí este sitio en <b>Safari</b> (no desde el ícono).<div class="sbtns" style="margin-top:8px"><button class="btn ghost" id="rkPwaCopiar">📋 Copiar dirección</button><button class="btn ghost" id="rkPwaOk">Entendido</button></div><p class="es" id="rkPwaMsg" style="margin:6px 0 0"></p>';
  const nav=document.querySelector("nav");if(!nav)return;nav.parentNode.insertBefore(d,nav);
  d.querySelector("#rkPwaCopiar").onclick=async()=>{let ok=false;const url=location.origin+location.pathname;
    try{await navigator.clipboard.writeText(url);ok=true}catch(e){}
    d.querySelector("#rkPwaMsg").textContent=ok?"✅ Dirección copiada: abrí Safari, pegala en la barra y listo.":"Abrí Safari y escribí: "+url};
  d.querySelector("#rkPwaOk").onclick=()=>{try{localStorage.setItem("trinity_aviso_pwa",hoy)}catch(e){}d.remove()};
})();
(function(){   // iPhone con iOS 26+ y la app instalada: al volver del fondo el audio puede quedar mudo (WebKit 295518) y se oía "una vez y después no". Si la app no está
  // haciendo nada, se recarga sola al volver (queda como recién abierta, que es cuando el audio sí andaba): como máximo una vez por minuto, y nunca en medio de una
  // charla, un examen, un texto escrito o la revisión de sonido. Se vuelve a la misma pestaña.
  try{const t=sessionStorage.getItem("rk_volver");if(t){sessionStorage.removeItem("rk_volver");const b=document.getElementById("t-"+t);if(b&&b.getAttribute("aria-selected")!=="true")b.click()}}catch(e){}
  try{const m=sessionStorage.getItem("rk_resume_log");if(m){sessionStorage.removeItem("rk_resume_log");rklog(m)}}catch(e){}   // (el registro no sobrevive a la recarga: queda anotado para el informe)
  if(!(IS_IOS&&IOS_VER>=26&&esInstalada()))return;
  let desde=0;
  const ocupado=()=>{
    if(activeStop||document.getElementById("rkSonido"))return true;
    if(document.querySelector("#practice-chat .msg.kid,#oral-chat .msg.kid,#practice-chat .msg.nota,#oral-chat .msg.nota"))return true;
    if(["practice-start","oral-start"].some(id=>{const b=document.getElementById(id);return b&&b.hidden}))return true;
    if(qs.length&&i<qs.length)return true;   // examen escrito empezado
    return [...document.querySelectorAll("input[type=text],textarea")].some(x=>!x.readOnly&&String(x.value||"").trim());
  };
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden){desde=Date.now();return}
    const fuera=desde?Date.now()-desde:0;desde=0;
    if(fuera<10000||ocupado())return;
    let ult=0;try{ult=+sessionStorage.getItem("rk_resume")||0}catch(e){}
    if(Date.now()-ult<60000)return;
    try{sessionStorage.setItem("rk_resume",String(Date.now()));const t=document.querySelector('nav button[aria-selected="true"]');if(t&&t.dataset.v)sessionStorage.setItem("rk_volver",t.dataset.v)}catch(e){}
    try{sessionStorage.setItem("rk_resume_log","la app se recargó sola al volver del fondo ("+Math.round(fuera/1000)+" s) para que el audio no quede mudo")}catch(e){}
    location.replace(location.pathname+"?v="+Date.now());
  });
})();
(function(){
  if(location.protocol!=="https:")return;
  let avisado=false,ultimo=0;
  const enCharla=()=>!!document.querySelector("#practice-chat .msg.kid,#oral-chat .msg.kid,#practice-chat .msg.nota,#oral-chat .msg.nota")||["practice-start","oral-start"].some(id=>{const b=document.getElementById(id);return b&&b.hidden});
  function recargar(nueva){
    try{sessionStorage.setItem("rk_recarga",nueva)}catch(e){}
    (async()=>{try{if(window.caches){const ks=await caches.keys();await Promise.all(ks.map(k=>caches.delete(k)))}}catch(e){}
      location.replace(location.pathname+"?v="+Date.now())})();   // una dirección nueva: no sale del caché del navegador
  }
  function aviso(nueva){
    if(document.querySelector(".rk-nuevo"))return;
    const d=document.createElement("div");d.className="rk-nuevo";d.setAttribute("role","status");
    d.innerHTML='<span>🔄 Hay una versión nueva de la app.</span><button class="ok">Actualizar</button><button class="x" aria-label="Cerrar">✕</button>';
    d.querySelector(".ok").onclick=()=>recargar(nueva);d.querySelector(".x").onclick=()=>d.remove();
    document.body.appendChild(d);
  }
  async function revisar(alAbrir){
    const ahora=Date.now();if(avisado||ahora-ultimo<8000)return;ultimo=ahora;   // (varios eventos seguidos no repiten la consulta)
    try{
      const r=await fetch(BASE+"motor.js?c="+ahora,{cache:"no-store"});   // la versión vive en motor.js (la comparten todos los módulos)
      if(!r.ok)return;
      const m=/const BUILD="([^"]+)"/.exec(await r.text());
      if(!m||m[1]===BUILD)return;
      let yaProbo="";try{yaProbo=sessionStorage.getItem("rk_recarga")||""}catch(e){}
      avisado=true;
      if(alAbrir&&!enCharla()&&yaProbo!==m[1])recargar(m[1]);   // recién abierta y vieja: se recarga sola (una sola vez, para no entrar en un ciclo)
      else aviso(m[1]);}
    catch(e){}
  }
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)revisar(false)});
  window.addEventListener("pageshow",e=>{if(e.persisted)revisar(false)});
  setTimeout(()=>revisar(true),2500);
  if(/[?&]v=\d+/.test(location.search)){try{history.replaceState(null,"",location.pathname+location.hash)}catch(e){}}   // se limpia la dirección después de recargar
})();
let instPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();instPrompt=e;$("instalar").hidden=false});
$("instalar").onclick=async()=>{if(!instPrompt)return;instPrompt.prompt();await instPrompt.userChoice;instPrompt=null;$("instalar").hidden=true};
window.addEventListener("appinstalled",()=>{$("instalar").hidden=true});
// iPhone/iPad: Safari no ofrece botón de instalar; se explica el camino manual (sólo si todavía no está instalada)
try{if(IS_IOS&&!navigator.standalone&&!(window.matchMedia&&matchMedia("(display-mode: standalone)").matches))$("instalarIos").hidden=false}catch(e){}
