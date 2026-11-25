// «English · 1.er grado»: la app (estudiar, escribir, hablar y la prueba). JavaScript vanilla, sin build.
// Todo queda en este aparato (localStorage «ingles1_estado»). Lo único que sale es el AUDIO de la parte oral si se usa la IA (ver oral.js, y la nota en la pantalla de Hablar).
// Cómo se aprende: cada palabra o frase tiene una «caja» (0 a 4): si se contesta bien sube, si no vuelve a la 0 y aparece más seguido. Nunca hay «mal» a secas: el primer error pide «Try again!».
(function(){
"use strict";
const I1=window.I1,$=id=>document.getElementById(id);
const azar=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const elegir=a=>a[Math.floor(Math.random()*a.length)];
const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sacar=(a,n)=>mezclar(a).slice(0,n);
const pausa=ms=>new Promise(r=>setTimeout(r,ms));
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FECHA=d=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const NUM=(x,max)=>Number.isFinite(+x)?Math.max(0,Math.min(max||1e9,Math.floor(+x))):0;
const art=w=>/^[aeiou]/i.test(w)?"an":"a";   // «an apple», «an ice cream»

// ---------------- lo que se recuerda en este aparato
const KEY="ingles1_estado",ID_OK=/^[a-z][a-z0-9:_-]{0,23}$/i;
function mapa(o,campos,max){const r=Object.create(null);if(o&&typeof o==="object"&&!Array.isArray(o))Object.keys(o).filter(id=>ID_OK.test(id)).slice(0,600).forEach(id=>{const e=o[id];if(e&&typeof e==="object"){const x={};campos.forEach(c=>{x[c]=c==="u"?(/^\d{4}-\d{2}-\d{2}$/.test(String(e.u||""))?e.u:""):NUM(e[c],c==="c"?4:1e6)});r[id]=x}});return r}
function cargar(){   // lo guardado se revisa campo por campo: si alguien lo tocó o quedó a medias, no rompe nada
  const b={v:1,voz:true,sonido:true,es:true,extra:false,ia:true,mic:"alta",vel:"normal",vozNombre:"",nombre:"",items:Object.create(null),or:Object.create(null),dias:{},pruebas:[],convs:[],rondas:0,estrellas:0};
  try{
    const o=JSON.parse(localStorage.getItem(KEY)||"null");
    if(o&&typeof o==="object"&&!Array.isArray(o)){
      b.voz=o.voz!==false;b.sonido=o.sonido!==false;b.es=o.es!==false;b.extra=o.extra===true;b.ia=o.ia!==false;
      if(o.vel==="lenta"||o.vel==="rapida")b.vel=o.vel;
      if(o.mic==="normal"||o.mic==="muy")b.mic=o.mic;   // (sin tocar: «alta», que oye mejor a un chico que habla bajito)
      if(typeof o.vozNombre==="string"&&o.vozNombre.length<=160)b.vozNombre=o.vozNombre;
      if(typeof o.nombre==="string")b.nombre=o.nombre.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,"").slice(0,16);
      b.rondas=NUM(o.rondas,1e6);b.estrellas=NUM(o.estrellas,1e6);
      b.items=mapa(o.items,["c","ok","mal","u"]);b.or=mapa(o.or,["ok","casi","mal"]);
      if(o.dias&&typeof o.dias==="object"&&!Array.isArray(o.dias))Object.keys(o.dias).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(o.dias[k])).sort().slice(-60).forEach(k=>{b.dias[k]=[NUM(o.dias[k][0],1e5),NUM(o.dias[k][1],1e5)]});
      if(Array.isArray(o.convs))b.convs=o.convs.filter(c=>c&&typeof c==="object").slice(-10).map(c=>({f:/^\d{4}-\d{2}-\d{2}$/.test(String(c.f||""))?c.f:"",ok:NUM(c.ok,50),casi:NUM(c.casi,50),n:Math.max(1,NUM(c.n,50))}));
      if(Array.isArray(o.pruebas))b.pruebas=o.pruebas.filter(s=>s&&typeof s==="object").slice(-20).map(s=>({f:/^\d{4}-\d{2}-\d{2}$/.test(String(s.f||""))?s.f:"",e:[NUM(s.e&&s.e[0],200),Math.max(1,NUM(s.e&&s.e[1],200))],o:s.o&&s.o[1]?[NUM(s.o[0],200),Math.max(1,NUM(s.o[1],200))]:null}));
    }
  }catch(e){}
  return b;
}
let ST=cargar();
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}
const usa=it=>ST.extra||!it.extra;
const itemsDe=t=>t.items.filter(usa);
const caja=id=>{const e=ST.items[id];return e?e.c:-1};
function anotar(id,ok){if(!ID_OK.test(id))return;const e=ST.items[id]=ST.items[id]||{c:0,ok:0,mal:0,u:""};if(ok){e.ok++;e.c=Math.min(4,e.c+1)}else{e.mal++;e.c=0}e.u=FECHA()}
function anotarOral(id,res){if(!ID_OK.test(id))return;const e=ST.or[id]=ST.or[id]||{ok:0,casi:0,mal:0};if(res==="ok")e.ok++;else if(res==="casi")e.casi++;else e.mal++}
function sumarDia(ok){const h=FECHA(),d=ST.dias[h]=ST.dias[h]||[0,0];if(ok)d[0]++;else d[1]++;const ks=Object.keys(ST.dias).sort();ks.slice(0,Math.max(0,ks.length-60)).forEach(k=>delete ST.dias[k])}
// («Yo» se practica con sus 6 diálogos, las velitas de la edad y «My name is…»; «Frases», con el verbo to be y las frases para armar)
function dominio(t){const l=itemsDe(t),ap=l.filter(x=>caja(x.id)>=3).length,vi=l.filter(x=>caja(x.id)>=0).length;
  if(!l.length){const ids=t.id==="yo"?I1.PAT.yo.map(x=>x.id).concat(["edad","nm"]):I1.PAT.armarfrase.concat(I1.PAT.tobe).map(x=>x.id);const a=ids.filter(i=>caja(i)>=3).length;return {n:ids.length,aprendidas:a,vistas:ids.filter(i=>caja(i)>=0).length,pct:Math.round(100*a/ids.length),ids}}
  return {n:l.length,aprendidas:ap,vistas:vi,pct:l.length?Math.round(100*ap/l.length):0,ids:l.map(x=>x.id)}}
const estrellasDe=t=>{const p=dominio(t).pct;return p>=90?3:p>=60?2:p>=25?1:0};
const peso=id=>{const c=caja(id);return c<0?3:[3,2.4,1.6,1,.5][c]};   // lo que todavía no se sabe sale más seguido

// ---------------- sonidos (se generan: no hay archivos) y vibración
const Son={AC:null,
  init(){if(!ST.sonido)return;try{Son.AC=Son.AC||new(window.AudioContext||window.webkitAudioContext)();if(Son.AC.state==="suspended")Son.AC.resume()}catch(e){}},
  nota(f,ini,dur,vol,tipo){const A=Son.AC;if(!A||!ST.sonido)return;try{const o=A.createOscillator(),g=A.createGain(),t=A.currentTime+ini;o.type=tipo||"sine";o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.12,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+dur+.05)}catch(e){}},
  ok(){Son.init();Son.nota(660,0,.14);Son.nota(880,.09,.2)},
  mal(){Son.init();Son.nota(330,0,.18,.09,"triangle");Son.nota(262,.1,.22,.07,"triangle")},
  tic(){Son.init();Son.nota(520,0,.08,.07)},
  estrella(i){Son.init();Son.nota(700+i*140,0,.25,.1)},
  fin(){Son.init();[523,659,784,1047].forEach((f,i)=>Son.nota(f,i*.11,.3,.1))}
};
const vibrar=ms=>{try{if(ST.sonido&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}};

// ---------------- la voz: audios grabados (si algún día se suman) y, si no, la voz inglesa del aparato
const HAY=new Set(window.I1_AUDIO||[]);
const VEL={lenta:.8,normal:1,rapida:1.15};
const synth=window.speechSynthesis;
const Voz={
  a:new Audio(),seq:0,v:null,
  lista:()=>synth?synth.getVoices().filter(v=>/^en/i.test(v.lang)):[],
  id:v=>v.name+" · "+v.lang,
  elegir(){
    const l=Voz.lista();if(!l.length)return Voz.v=null;
    if(ST.vozNombre){const p=l.find(v=>Voz.id(v)===ST.vozNombre);if(p)return Voz.v=p}
    const buena=v=>/natural|neural|online|premium|enhanced|siri|daniel|kate|serena|google uk/i.test(v.name),ord=[/^en[-_]GB/i,/^en[-_](AU|IE|NZ|ZA)/i,/^en[-_]US/i,/^en/i],ls=l.filter(buena).length?l.filter(buena):l;
    for(const re of ord){const m=ls.filter(v=>re.test(v.lang));if(m.length)return Voz.v=m[0]}
    return Voz.v=l[0];
  },
  desbloquear(){if(!synth||Voz.desb)return;Voz.desb=true;try{const u=new SpeechSynthesisUtterance("ok");u.volume=0;u.lang="en-GB";synth.speak(u)}catch(e){}},
  uno(texto,lento,k){
    return new Promise(res=>{
      if(!ST.voz)return res();
      let listo=false;const a=Voz.a;
      const fin=()=>{if(listo)return;listo=true;clearTimeout(t);a.onended=a.onerror=null;res()};
      const t=setTimeout(fin,3000+texto.length*220);
      const local=()=>{try{if(!synth)return fin();const u=new SpeechSynthesisUtterance(texto),v=Voz.elegir();if(v){u.voice=v;u.lang=v.lang}else u.lang="en-GB";u.rate=(lento?.6:.85)*VEL[ST.vel];u.pitch=1.05;u.onend=u.onerror=fin;synth.cancel();synth.speak(u)}catch(e){fin()}};
      if(!k||!HAY.has(k))return local();
      a.onended=fin;a.onerror=()=>{a.onended=a.onerror=null;local()};
      a.src="audio/"+k+".mp3";a.playbackRate=(lento?.7:1)*VEL[ST.vel];try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}
      try{const p=a.play();if(p&&p.catch)p.catch(()=>local())}catch(e){local()}
    });
  },
  // x: una clave de audio (en_…) o el texto; devuelve cuando termina de hablar
  async decir(x,lento){if(!x)return;const k=I1.audio[x]!==undefined?x:I1.K(x),id=++Voz.seq;Voz.parar();Voz.seq=id;Voz.dichos.push(k);await Voz.uno(I1.audio[k],lento,k)},
  async secuencia(l,lento){const id=++Voz.seq;Voz.parar();Voz.seq=id;for(const x of l){if(Voz.seq!==id)return;const k=I1.audio[x]!==undefined?x:I1.K(x);Voz.dichos.push(k);await Voz.uno(I1.audio[k],lento,k);if(Voz.seq!==id)return;await pausa(120)}},
  parar(){Voz.seq++;try{Voz.a.pause()}catch(e){}try{synth&&synth.cancel()}catch(e){}},
  dichos:[]   // (para las pruebas: cada clave que se pidió)
};
if(synth){const f=()=>{Voz.elegir();if(typeof refrescarVoces==="function")refrescarVoces()};if(synth.addEventListener)synth.addEventListener("voiceschanged",f);else synth.onvoiceschanged=f}

// ---------------- armado de preguntas
// Una pregunta ESCRITA es {tipo:"mc"|"armar"|"ordenar"|"unir"|"parte", tema, ids:[lo que se anota], cons:[consigna en inglés, ayuda en castellano], cuerpo:html, hablar:[lo que se dice al empezar],
// ops:[{h,ok,aria,dec,cls}] (mc), mostrar:la respuesta, refuerzo:clave que se dice al acertar}. Una ORAL es {tipo:"oral", sub, ev:{k,…}} (ver oral.js: evaluar).
const pic=I1.pic,K=I1.K;
const dib=(p,cls)=>`<div class="dib">${pic(p,cls||"grande")}</div>`;
const oir=(x,lento)=>`<button type="button" class="oir" data-dec="${esc(x)}"${lento?' data-lento="1"':""} aria-label="${lento?"Listen slowly":"Listen"}">${lento?"🐢":"🔊"}</button>`;
const otros=(t,it,n,f)=>sacar(itemsDe(t).filter(x=>x.id!==it.id&&!I1.ambiguos(x.id,it.id)&&(!f||f(x))),n);
const opW=x=>({h:esc(x.en),aria:x.en,dec:x.say||x.en});
const opP=x=>({h:pic(x.p,"grande"),aria:x.en,dec:x.say||x.en});
const mc=(base,ok,mal,fn)=>Object.assign(base,{tipo:"mc",ops:mezclar([Object.assign(fn(ok),{ok:true})].concat(mal.map(x=>Object.assign(fn(x),{ok:false}))))});
const PLURAL=new Set(["eyes","ears","hands","arms","legs","feet","fingers","toes","crayons","scissors"]);
const COLOR_EN=/^(red|blue|green|yellow|orange|pink|purple|black|white|brown|grey)$/;
const EXCL=new Set(["hello","hi","goodbye","bye","morning","afternoon","thanks"]);   // saludos que se dicen con «!»
const fraseDe=it=>it.tema==="saludos"?it.en+(EXCL.has(it.id)?"!":"."):COLOR_EN.test(it.en)?`It's ${it.en}.`:PLURAL.has(it.en)?`These are ${it.en}.`:it.p&&(it.p.n!==undefined||it.p.l)?`This is ${it.en}.`:`This is ${art(it.en)} ${it.en}.`;
const ord=x=>x.orden||x.n||0;
const ordenados=t=>itemsDe(t).slice().sort((a,b)=>ord(a)-ord(b));
const mezclarDistinto=a=>{let m=mezclar(a),k=0;while(m.every((x,i)=>x===a[i])&&++k<12)m=mezclar(a);return m};
const SONIDO={B:"e",C:"e",D:"e",E:"e",G:"e",P:"e",T:"e",V:"e",Z:"e",F:"f",L:"f",M:"f",N:"f",S:"f",X:"f",A:"a",H:"a",J:"a",K:"a",I:"i",Y:"i",O:"o",Q:"o",U:"o",W:"o",R:"r"};   // letras que suenan parecido en inglés: no se ponen juntas
const GUSTA={pizza:"pizza",icecream:"ice cream",apple:"apples",banana:"bananas",milk:"milk",fish:"fish",cat:"cats",dog:"dogs",ball:"balls"};
const gusta=(x,like)=>like?`I like ${GUSTA[x.id]}.`:`I don't like ${GUSTA[x.id]}.`;
const pulgar=(x,like)=>`<span class="par">${x.p.e}<i>${like?"👍":"👎"}</i></span>`;
const calendario=(dia,n)=>`<span class="cal"><b>${esc(dia)}</b><i>${n}</i></span>`;
const cons=(en,es)=>[en,es];

// letras para armar una palabra: las de la palabra (mezcladas) y, si va difícil, unas de más
function armarW(t,ids,w,p,k,consigna,opt){
  opt=opt||{};const W=w.toUpperCase(),n=W.length,dados=opt.dados!==undefined?opt.dados:(n>7?3:(ids.every(i=>caja(i)<1)?1:0));
  const extra=(ids.some(i=>caja(i)>=2)&&n<=6)?sacar("ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").filter(c=>W.indexOf(c)<0),2):[];
  const fichas=mezclarDistinto(W.split("").map((c,i)=>({c,i})).filter(x=>x.i>=dados).map(x=>x.c)).concat(extra);
  return {tipo:"armar",tema:t.id,ids,cons:consigna,cuerpo:dib(p),hablar:[k],w:W,dados,fichas:mezclar(fichas),mostrar:w,refuerzo:k};
}
const sinEsp=s=>String(s).replace(/ /g,"");

const GEN={
  look(t,it){if(!it||!it.p||it.p.t)return null;const o=otros(t,it,3);if(o.length<3)return null;
    return mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.look,cuerpo:dib(it.p),hablar:[],mostrar:it.en,refuerzo:it.say},it,o,opW)},
  listen(t,it){if(!it)return null;const o=otros(t,it,3);if(o.length<3)return null;const txt=!!(it.p&&it.p.t&&(t.id==="dias"||t.id==="meses"));
    return mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.listen,cuerpo:`<div class="dib">${oir(it.say)}</div>`,hablar:[it.say],mostrar:it.en,refuerzo:null},it,o,txt?opW:opP)},
  es(t,it){if(!it||!it.es)return null;const vistos=new Set([it.es]),o=sacar(itemsDe(t).filter(x=>x.id!==it.id&&!I1.ambiguos(x.id,it.id)&&x.es&&!vistos.has(x.es)&&vistos.add(x.es)),3);if(o.length<3)return null;   // (sin dos opciones iguales: «hello» y «hi» se traducen igual)
    return mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.es,cuerpo:`<div class="pal">${esc(it.en)}</div>${oir(it.say)}`,hablar:[it.say],mostrar:it.es,refuerzo:null},{es:it.es},o,x=>({h:esc(x.es),aria:x.es}))},
  armar(t,it){if(!it||!it.p)return null;const w=sinEsp(it.en);if(!/^[a-z]{3,9}$/i.test(w)||w.length!==it.en.length)return null;if(w.length>7&&!(t.id==="dias"||t.id==="meses"))return null;
    return armarW(t,[it.id],w,it.p,it.say,I1.CONSIGNA.armar)},
  vf(t,it){if(!it||!it.p||it.p.t)return null;const verdad=Math.random()<.5;let x=it;if(!verdad){const o=otros(t,it,1);if(!o.length)return null;x=o[0]}
    const f=fraseDe(x);K(f);
    return {tipo:"mc",tema:t.id,ids:[it.id],cons:I1.CONSIGNA.vf,cuerpo:dib(it.p)+`<div class="frase">${esc(f)}</div>`+oir(f),hablar:[f],vf:true,ops:[{h:"✔",aria:"Yes",ok:verdad,cls:"si"},{h:"✘",aria:"No",ok:!verdad,cls:"no"}],mostrar:fraseDe(it),refuerzo:fraseDe(it)}},
  unir(t){const l=sacar(itemsDe(t).filter(x=>x.p&&!x.p.t),4);if(l.length<4)return null;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(I1.ambiguos(l[i].id,l[j].id))return null;
    return {tipo:"unir",tema:t.id,ids:l.map(x=>x.id),cons:I1.CONSIGNA.unir,hablar:[],pares:l.map(x=>({id:x.id,izq:pic(x.p,"grande"),der:esc(x.en),dec:x.say,aria:x.en})),mostrar:l.map(x=>x.en).join(", ")}},
  parte(t,it){if(t.id!=="cuerpo"||!it||!it.parte)return null;const f="Touch the "+it.en+".";K(f);
    return {tipo:"parte",tema:t.id,ids:[it.id],cons:[f,"Tocá: "+it.es+"."],cuerpo:I1.svgCuerpo({activo:true}),hablar:[f],parte:it.parte,mostrar:it.en,refuerzo:it.say}},
  serie(t,it){if(!t.orden||!it||!ord(it))return null;const l=ordenados(t),i=l.findIndex(x=>x.id===it.id);if(i<0)return null;
    const antes=i>0&&(i===l.length-1||Math.random()<.35),obj=antes?l[i-1]:l[i+1];if(!obj)return null;
    const f=`What comes ${antes?"before":"after"} ${it.say}?`;K(f);const mal=sacar(l.filter(x=>x.id!==obj.id&&x.id!==it.id),3);if(mal.length<3)return null;
    return mc({tema:t.id,ids:[it.id,obj.id],cons:[`What comes ${antes?"before":"after"} ${it.en}?`,antes?"¿Qué viene ANTES?":"¿Qué viene DESPUÉS?"],cuerpo:`<div class="pal">${esc(it.en)}</div>${it.p&&it.p.n!==undefined?`<div class="dib">${pic(it.p)}</div>`:""}${oir(it.say)}`,hablar:[f],mostrar:obj.en,refuerzo:null},obj,mal,opW)},
  ordenar(t,it){
    if(t.id==="fecha")return GEN.fechaOrd(t);
    if(!t.orden)return null;const l=ordenados(t),n=t.id==="dias"?5:4;if(l.length<n)return null;const ini=azar(0,l.length-n),seg=l.slice(ini,ini+n);
    return {tipo:"ordenar",tema:t.id,ids:seg.map(x=>x.id),cons:I1.CONSIGNA.ordenar,cuerpo:"",hablar:[],fichas:mezclarDistinto(seg).map(x=>({id:x.id,h:esc(x.en),dec:x.say})),sol:seg.map(x=>x.id),mostrar:seg.map(x=>x.en).join(", ")}},
  numpal(t,it){if(t.id!=="numeros"||!it)return null;const o=otros(t,it,3);if(o.length<3)return null;
    return Math.random()<.5?mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.numpal,cuerpo:dib(it.p),hablar:[],mostrar:it.en,refuerzo:it.say},it,o,opW)
      :mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.numpal,cuerpo:`<div class="pal">${esc(it.en)}</div>${oir(it.say)}`,hablar:[it.say],mostrar:String(it.n),refuerzo:null},it,o,opP)},
  contar(t,it){if(t.id!=="numeros"||!it||it.n>20)return null;const n=it.n,e=elegir(["🍎","⭐","🐟","🎈","🍪"]);
    const cerca=itemsDe(t).filter(x=>x.id!==it.id&&Math.abs(x.n-n)<=3);if(cerca.length<3)return null;
    return mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.contar,cuerpo:`<div class="grupo" aria-label="${n}">${Array(n).fill(`<span>${e}</span>`).join("")}</div><div class="pal peq">How many?</div>`,hablar:["How many?"],mostrar:it.en,refuerzo:it.say},it,sacar(cerca,3),opW)},
  fecha(t,it){if(t.id!=="fecha"||!it)return null;const dia=elegir(I1.DIAS_EN),n=it.n,f=`Today is ${dia} the ${n}${I1.ordNum(n).replace(/^\d+/,"")}.`;
    const dicho=`Today is ${dia}, the ${I1.ORD_EN[n]}.`;K(dicho);
    const otrosN=sacar(itemsDe(t).filter(x=>x.n!==n),3),mal=otrosN.map((x,i)=>({dia:i===0?dia:elegir(I1.DIAS_EN.filter(d=>d!==dia)),n:x.n}));
    if(mal.length<3)return null;
    if(Math.random()<.5){   // se escucha la fecha → se elige la página del calendario
      return mc({tema:t.id,ids:[it.id],cons:cons("Listen and choose.","Escuchá la fecha y elegí el calendario."),cuerpo:`<div class="dib">${oir(dicho)}</div>`,hablar:[dicho],mostrar:f,refuerzo:null},{dia,n},mal,x=>({h:calendario(x.dia.slice(0,3),x.n),aria:x.dia+" "+x.n}))}
    mal.forEach(x=>K(`Today is ${x.dia}, the ${I1.ORD_EN[x.n]}.`));
    return mc({tema:t.id,ids:[it.id],cons:cons("Read and choose.","Mirá el calendario y elegí la frase."),cuerpo:`<div class="dib">${calendario(dia.slice(0,3),n)}</div>`,hablar:[],mostrar:f,refuerzo:dicho},{dia,n},mal,x=>({h:esc(`Today is ${x.dia} the ${I1.ordNum(x.n)}.`),aria:`Today is ${x.dia} the ${I1.ordNum(x.n)}`,dec:`Today is ${x.dia}, the ${I1.ORD_EN[x.n]}.`}))},
  fechaOrd(t){const dia=elegir(I1.DIAS_EN),n=elegir(itemsDe(t)).n,tk=["Today","is",dia,"the",I1.ordNum(n)],dicho=`Today is ${dia}, the ${I1.ORD_EN[n]}.`;K(dicho);
    return {tipo:"ordenar",tema:t.id,ids:["o"+n],cons:cons("Put the words in order.","Poné las palabras en orden."),cuerpo:`<div class="dib">${calendario(dia.slice(0,3),n)}</div>`,hablar:[dicho],fichas:mezclarDistinto(tk.map((w,i)=>({id:"w"+i,h:esc(w)}))),sol:tk.map((w,i)=>"w"+i),mostrar:tk.join(" ")+".",refuerzo:dicho,frase:true}},
  letra(t,it){if(t.id!=="abc"||!it)return null;const g=SONIDO[it.en],o=itemsDe(t).filter(x=>x.id!==it.id&&SONIDO[x.en]!==g);if(o.length<3)return null;
    return mc({tema:t.id,ids:[it.id],cons:I1.CONSIGNA.letra,cuerpo:`<div class="dib">${oir(it.say)}</div>`,hablar:[it.say],mostrar:it.en,refuerzo:null},it,sacar(o,3),opP)},
  deletrear(t,it){if(t.id!=="abc"||!it||!it.ej||!/^[a-z]{3,6}$/i.test(it.ej.en))return null;return armarW(t,[it.id],it.ej.en,{e:it.ej.e},it.ej.k,I1.CONSIGNA.deletrear)},
  yo(t){
    if(Math.random()<.3){const n=elegir(I1.PAT.edad),mal=I1.PAT.edad.filter(x=>x!==n);const f="How old are you?";K(f);
      return mc({tema:t.id,ids:["edad"],cons:cons("How old are you?","¿Cuántos años tiene? Contá las velitas."),cuerpo:`<div class="grupo" aria-label="${n}"><span>🎂</span>${Array(n).fill("<span>🕯️</span>").join("")}</div>`,hablar:[f],mostrar:`I'm ${I1.NUM_EN[n]}.`,refuerzo:null},n,sacar(mal,3),x=>({h:esc(`I'm ${I1.NUM_EN[x]}.`),aria:`I'm ${I1.NUM_EN[x]}`,dec:`I'm ${I1.NUM_EN[x]}.`}))}
    const p=elegir(I1.PAT.yo);return mc({tema:t.id,ids:[p.id],cons:cons("Listen and answer.","Escuchá y elegí la respuesta."),cuerpo:dib(p.p)+oir(p.q),hablar:[p.q],mostrar:p.ok,refuerzo:null},p.ok,p.mal,x=>({h:esc(x),aria:x,dec:K(x)}))},
  tobe(t){const p=elegir(I1.PAT.tobe);
    return mc({tema:t.id,ids:[p.id],cons:I1.CONSIGNA.tobe,cuerpo:dib(p.p)+`<div class="frase">${esc(p.f).replace("___",'<span class="hueco">___</span>')}</div>`,hablar:[],mostrar:p.f.replace("___",p.ok),refuerzo:K(p.f.replace("___",p.ok))},p.ok,["am","is","are"].filter(x=>x!==p.ok),x=>({h:esc(x),aria:x,dec:x}))},
  gusto(t){const x=elegir(I1.GUSTOS),like=Math.random()<.5,y=elegir(I1.GUSTOS.filter(z=>z.id!==x.id)),f=gusta(x,like);K(f);
    if(Math.random()<.5){   // se escucha → se elige el dibujo (con 👍 o 👎)
      const ops=[[x,like,true],[x,!like],[y,like],[y,!like]].map(a=>({h:pulgar(a[0],a[1]),aria:gusta(a[0],a[1]),ok:!!a[2]}));
      return {tipo:"mc",tema:t.id,ids:["g-"+x.id],cons:cons("Listen and choose.","Escuchá y elegí el dibujo."),cuerpo:`<div class="dib">${oir(f)}</div>`,hablar:[f],ops:mezclar(ops),mostrar:f,refuerzo:null}}
    const ops=[[x,like,true],[x,!like],[y,like],[y,!like]].map(a=>({h:esc(gusta(a[0],a[1])),aria:gusta(a[0],a[1]),ok:!!a[2],dec:K(gusta(a[0],a[1]))}));
    return {tipo:"mc",tema:t.id,ids:["g-"+x.id],cons:I1.CONSIGNA.gusto,cuerpo:`<div class="dib">${pulgar(x,like)}</div>`,hablar:[],ops:mezclar(ops),mostrar:f,refuerzo:f}},
  this(t){const pool=itemsDe(I1.TEMA.aula).concat(I1.GUSTOS.filter(x=>x.id!=="milk")).filter(z=>!PLURAL.has(z.en)),x=elegir(pool),malO=sacar(pool.filter(z=>z.id!==x.id&&!I1.ambiguos(z.id,x.id)),3),esIt=Math.random()<.5,
      fr=z=>esIt?`It's ${art(z.en)} ${z.en}.`:`This is ${art(z.en)} ${z.en}.`,preg=esIt?"What is it?":"What is this?";K(preg);
    return mc({tema:t.id,ids:[x.id],cons:cons(preg,esIt?"¿Qué es? Elegí «It's a…»":"¿Qué es esto? Elegí «This is a…»"),cuerpo:dib(x.p)+oir(preg),hablar:[preg],mostrar:fr(x),refuerzo:K(fr(x))},x,malO,z=>({h:esc(fr(z)),aria:fr(z),dec:K(fr(z))}))},
  nombre(t){const n=nombreOk()||elegir(I1.NOMBRES),tk=["My","name","is",n],dicho=`My name is ${n}.`;K(dicho);
    return {tipo:"ordenar",tema:t.id,ids:["nm"],cons:I1.CONSIGNA.nombre,cuerpo:dib({e:"🏷️"}),hablar:[dicho],fichas:mezclarDistinto(tk.map((w,i)=>({id:"w"+i,h:esc(w)}))),sol:tk.map((w,i)=>"w"+i),mostrar:dicho,refuerzo:dicho,frase:true}},
  armarfrase(t){const p=elegir(I1.PAT.armarfrase),tk=p.f.replace(/[.,]/g,"").split(" "),dicho=p.f;K(dicho);
    return {tipo:"ordenar",tema:t.id,ids:[p.id],cons:I1.CONSIGNA.armarfrase,cuerpo:dib(p.p),hablar:[dicho],fichas:mezclarDistinto(tk.map((w,i)=>({id:"w"+i,h:esc(w)}))),sol:tk.map((w,i)=>"w"+i),mostrar:p.f,refuerzo:dicho,frase:true}}
};

// ---- tareas ORALES (el profe pregunta y se contesta hablando). «ev» le dice a oral.js qué respuestas valen.
const ORAL={
  repetir(t,it){if(!it)return null;
    return {tipo:"oral",sub:"repetir",tema:t.id,ids:[it.id],cons:cons("Listen and repeat.","Escuchá y repetí."),cuerpo:(t.id==="cuerpo"?`<div class="dib fig">${I1.svgCuerpo({resalta:it.parte})}</div>`:dib(it.p))+`<div class="pal">${esc(it.en)}</div>`,hablar:[it.say],ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:it.en,dire:it.say}},
  nombrar(t,it){if(!it||!it.p||it.p.t)return null;
    const preg=t.id==="colores"?"What colour is it?":t.id==="numeros"?"What number is it?":t.id==="cuerpo"?"What's this?":"What is it?";K(preg);
    return {tipo:"oral",sub:"nombrar",tema:t.id,ids:[it.id],cons:cons(preg,"Mirá y decilo en inglés."),cuerpo:t.id==="cuerpo"?`<div class="dib fig">${I1.svgCuerpo({resalta:it.parte})}</div>`:dib(it.p),hablar:[preg],ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:it.en,dire:it.say}},
  contar(t){const hasta=itemsDe(t).filter(x=>caja(x.id)>=2).length>=4?10:5,f="Count to "+I1.NUM_EN[hasta]+".";K(f);
    return {tipo:"oral",sub:"contar",tema:t.id,ids:itemsDe(t).filter(x=>x.n<=hasta).map(x=>x.id),cons:cons(f,"Contá en voz alta en inglés."),cuerpo:`<div class="grupo grande-num">${I1.NUM_EN.slice(1,hasta+1).map((w,i)=>`<span>${i+1}</span>`).join("")}</div>`,hablar:[f],ev:{k:"serie",lista:I1.NUM_EN.slice(1,hasta+1),min:hasta,casi:Math.ceil(hasta*.6)},mostrar:I1.NUM_EN.slice(1,hasta+1).join(", "),dire:I1.NUM_EN.slice(1,hasta+1).join(", ")}},
  dias(t){const f="Say the days of the week.";K(f);return {tipo:"oral",sub:"dias",tema:t.id,ids:itemsDe(t).map(x=>x.id),cons:cons(f,"Decí los días de la semana, en orden."),cuerpo:`<div class="grupo dias">${I1.DIAS_EN.map(d=>`<span>${d.slice(0,3)}</span>`).join("")}</div>`,hablar:[f],ev:{k:"serie",lista:I1.DIAS_EN,min:6,casi:4},mostrar:I1.DIAS_EN.join(", "),dire:I1.DIAS_EN.join(", ")}},
  meses(t){const f="Say the months.";K(f);return {tipo:"oral",sub:"meses",tema:t.id,ids:itemsDe(t).map(x=>x.id),cons:cons(f,"Decí los meses del año, en orden."),cuerpo:`<div class="grupo dias">${I1.MESES_EN.map(d=>`<span>${d.slice(0,3)}</span>`).join("")}</div>`,hablar:[f],ev:{k:"serie",lista:I1.MESES_EN,min:10,casi:6},mostrar:I1.MESES_EN.join(", "),dire:I1.MESES_EN.join(", ")}},
  hoy(t){const d=new Date(),i=(d.getDay()+6)%7,f="What day is it today?";K(f);return {tipo:"oral",sub:"hoy",tema:t.id,ids:["d"+(i+1)],cons:cons(f,"¿Qué día es hoy? Decilo en inglés."),cuerpo:dib({e:"📅"}),hablar:[f],ev:{k:"palabra",acepta:[I1.DIAS_EN[i].toLowerCase()]},mostrar:I1.DIAS_EN[i],dire:I1.DIAS_EN[i]}},
  fecha(t,it){const d=new Date(),pool=itemsDe(t).map(x=>x.n);let n=d.getDate(),i=(d.getDay()+6)%7;
    if(pool.indexOf(n)<0){n=elegir(pool);i=azar(0,6)}   // la fecha de hoy sólo si esos ordinales ya se estudian (del 11 al 31 son «más palabras»); si no, la de un calendario cualquiera
    const f="What's the date?",dicho=`Today is ${I1.DIAS_EN[i]}, the ${I1.ORD_EN[n]}.`;K(f);K(dicho);
    return {tipo:"oral",sub:"fecha",tema:t.id,ids:["o"+n],cons:cons(f,"Mirá el calendario y decí la fecha. Por ejemplo: «Today is Monday the 5th»."),cuerpo:`<div class="dib">${calendario(I1.DIAS_EN[i].slice(0,3),n)}</div>`,hablar:[f],ev:{k:"fecha",dia:I1.DIAS_EN[i].toLowerCase(),n},mostrar:`Today is ${I1.DIAS_EN[i]} the ${I1.ordNum(n)}.`,dire:dicho}},
  letra(t,it){if(!it)return null;const f="What letter is it?";K(f);
    return {tipo:"oral",sub:"letra",tema:t.id,ids:[it.id],cons:cons(f,"Mirá la letra y decí cómo se llama en inglés."),cuerpo:dib(it.p),hablar:[f],ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:it.en+" ("+it.say+")",dire:it.say}},
  saludar(t){const p=elegir([["Hello!",["hello","hi"]],["Goodbye!",["goodbye","bye","bye bye"]],["Good morning!",["good morning","morning"]]]);K(p[0]);
    return {tipo:"oral",sub:"saludar",tema:t.id,ids:[{"Hello!":"hello","Goodbye!":"goodbye","Good morning!":"morning"}[p[0]]],cons:cons(p[0],"Contestá el saludo en inglés."),cuerpo:dib({e:{"Hello!":"🙂👋","Goodbye!":"👋🚪","Good morning!":"🌅"}[p[0]]}),hablar:[p[0]],ev:{k:"palabra",acepta:p[1]},mostrar:p[0],dire:p[1][0]}},
  yo(t){const p=elegir([["What's your name?","nombre","🏷️","My name is…"],["How old are you?","edad","🎂","I'm six."],["How are you?","estado","🙂","I'm fine, thank you."]]);K(p[0]);
    return {tipo:"oral",sub:"yo",tema:t.id,ids:[{nombre:"y1",edad:"y2",estado:"y3"}[p[1]]],cons:cons(p[0],"Contestá con tus datos, en inglés."),cuerpo:dib({e:p[2]}),hablar:[p[0]],ev:{k:"abierta",de:p[1]},mostrar:p[3],dire:p[1]==="nombre"?"My name is "+(nombreOk()||"Ana")+".":p[3]}},
  gusto(t){const x=elegir(I1.GUSTOS),f="Do you like "+(GUSTA[x.id])+"?";K(f);
    return {tipo:"oral",sub:"gusto",tema:t.id,ids:["g-"+x.id],cons:cons(f,"Contestá «Yes, I do» o «No, I don't»."),cuerpo:dib(x.p),hablar:[f],ev:{k:"abierta",de:"gusto",cosa:GUSTA[x.id]},mostrar:"Yes, I do. · No, I don't.",dire:"Yes, I do."}},
  this(t){const pool=itemsDe(I1.TEMA.aula).concat(I1.GUSTOS.filter(z=>z.id!=="milk")).filter(z=>!PLURAL.has(z.en)),x=elegir(pool),f="What is it?";K(f);
    return {tipo:"oral",sub:"this",tema:t.id,ids:[x.id],cons:cons(f,"Decí «It's a…» o «This is a…»."),cuerpo:dib(x.p),hablar:[f],ev:{k:"palabra",acepta:I1.oral.aceptaDe(x)},mostrar:`It's ${art(x.en)} ${x.en}.`,dire:`It's ${art(x.en)} ${x.en}.`}},
  frase(t){const p=elegir(I1.PAT.armarfrase);K(p.f);
    return {tipo:"oral",sub:"frase",tema:t.id,ids:[p.id],cons:cons("Say the sentence.","Escuchá y repetí la frase entera."),cuerpo:dib(p.p)+`<div class="frase">${esc(p.f)}</div>`,hablar:[p.f],ev:{k:"frase",frase:p.f},mostrar:p.f,dire:p.f}}
};

// ---------------- armado de rondas
function elegirItems(t,n,excluir){
  let pool=itemsDe(t).filter(x=>!(excluir||[]).includes(x.id));if(!pool.length)pool=itemsDe(t);const out=[];
  while(out.length<n&&pool.length){const tot=pool.reduce((a,x)=>a+peso(x.id),0);let r=Math.random()*tot,i=0;for(;i<pool.length;i++){r-=peso(pool[i].id);if(r<=0)break}out.push(pool.splice(Math.min(i,pool.length-1),1)[0])}
  return out;
}
function generar(modo,t,it){
  const G=modo==="oral"?ORAL:GEN;
  for(const tp of mezclar(modo==="oral"?t.ora:t.esc)){const f=G[tp];if(!f)continue;let q=null;try{q=f(t,it)}catch(e){console.warn("[ingles1] no se pudo armar «"+tp+"»:",e)}if(q){q.gen=tp;return q}}
  return null;
}
function elegirTema(temas,out){   // más seguido los que menos estrellas tienen y los que todavía no salieron en la ronda
  const w=temas.map(t=>(1+(3-estrellasDe(t)))/(1+2*out.filter(q=>q.tema===t.id).length)),tot=w.reduce((a,b)=>a+b,0);let r=Math.random()*tot,i=0;for(;i<w.length;i++){r-=w[i];if(r<=0)break}return temas[Math.min(i,temas.length-1)];
}
function armarRonda(modo,temaId,n,soloTemas){
  const temas=temaId?[I1.TEMA[temaId]]:(soloTemas||I1.TEMAS).filter(t=>(modo==="oral"?t.ora:t.esc).length),out=[],usados=[];let k=0;
  while(out.length<n&&k++<n*14&&temas.length){
    const t=temaId?temas[0]:elegirTema(temas,out),it=t.items.length?elegirItems(t,1,usados)[0]:null,q=generar(modo,t,it);
    if(!q)continue;const clave=q.gen+"|"+q.ids.join(",");if(out.some(x=>x.gen+"|"+x.ids.join(",")===clave))continue;
    if(it)usados.push(it.id);out.push(q);
  }
  return out;
}
// la prueba: 14 preguntas escritas (de todos los temas) y 8 tareas orales (de 8 temas distintos)
function armarPrueba(){
  const escritas=[],ts=mezclar(I1.TEMAS);let k=0;
  while(escritas.length<14&&k++<80){const t=ts[escritas.length%ts.length],q=armarRonda("escrito",t.id,1)[0];if(q&&!escritas.some(x=>x.gen+"|"+x.ids.join(",")===q.gen+"|"+q.ids.join(",")))escritas.push(q)}
  const orales=[];for(const t of mezclar(I1.TEMAS.filter(t=>t.ora.length))){if(orales.length>=8)break;const q=armarRonda("oral",t.id,1)[0];if(q)orales.push(q)}
  return {escritas,orales};
}

// ---------------- pantallas
const PANT=["pInicio","pTema","pPreg","pFin","pPrueba","pAjustes","pConv"];
let ULT_NAV=0,TEMA_ACT=null,R=null;
function ir(p,arranque){if(I1.oral&&I1.oral.parar)I1.oral.parar();Voz.parar();PANT.forEach(x=>$(x).hidden=x!==p);if(!arranque)ULT_NAV=performance.now();window.scrollTo(0,0)}
const bloq=()=>window.__I1_SIN_ESPERA!==true&&performance.now()-ULT_NAV<350;   // un doble toque (el segundo cae sobre la pantalla nueva) no contesta lo que viene
const estrellas=(n,max)=>Array.from({length:max||3},(_,i)=>`<span class="star${i<n?" on":""}" aria-hidden="true">★</span>`).join("");
const aria=(n,max)=>`<span class="vh">${n} de ${max||3} estrellas</span>`;
const nombreOk=()=>/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(ST.nombre)?ST.nombre.trim():"";   // (sólo espacios o guiones no es un nombre)
const nombreHola=()=>nombreOk()?", "+esc(nombreOk()):"";

// ---- inicio
function pintarInicio(){
  const hoy=ST.dias[FECHA()]||[0,0];
  $("pInicio").innerHTML=`
   <header class="barra"><div class="logo">English <small>1.er grado</small></div><button type="button" class="aj" id="bAj" aria-label="Para grandes (mantené apretado)"><span aria-hidden="true">⚙️</span><i class="anillo" aria-hidden="true"></i></button></header>
   <p class="hola">Hi${nombreHola()}! <span aria-hidden="true">👋</span> <button type="button" class="oir chico" data-dec="Hello! Let's learn English!" aria-label="Listen">🔊</button></p>
   <div class="modos">
     <button type="button" class="modo m-esc" data-modo="escrito"><span class="mi" aria-hidden="true">✏️</span><b>Escribir</b><small>Writing</small></button>
     <button type="button" class="modo m-ora" data-modo="oral"><span class="mi" aria-hidden="true">🗣️</span><b>Hablar</b><small>Speaking</small></button>
     <button type="button" class="modo m-pru" id="bPrueba"><span class="mi" aria-hidden="true">🏆</span><b>Mi prueba</b><small>Test</small></button>
   </div>
   <button type="button" class="conv" id="bConv"><span class="mi" aria-hidden="true">💬</span><span class="ct"><b>Conversar</b><small>Let's talk · el profe pregunta y se contesta hablando</small></span>${ST.convs.length?`<span class="ult-c">Última: ${ST.convs[ST.convs.length-1].ok} de ${ST.convs[ST.convs.length-1].n}</span>`:""}</button>
   <h2>Temas</h2>
   <div class="temas">${I1.TEMAS.map(t=>{const e=estrellasDe(t);return `<button type="button" class="tema" data-tema="${t.id}" style="--tc:${t.color}"><span class="ico" aria-hidden="true">${t.ico}</span><b>${esc(t.nombre)}</b><small>${esc(t.es)}</small><span class="ests">${estrellas(e)}${aria(e)}</span></button>`}).join("")}</div>
   <p class="hoyc">Hoy: <b>${hoy[0]}</b> bien · <b>${hoy[1]}</b> a repasar · ⭐ <b>${ST.estrellas}</b></p>`;
  ligarAjustes();
}

// ---- un tema: aprender (con voz) y los botones para escribir y hablar
const TRAD=it=>ST.es&&it.es?`<small class="es">${esc(it.es)}</small>`:"";
function tarjetas(t){
  if(t.figura)return `<div class="fig-caja">${I1.svgCuerpo({activo:true})}<div class="fig-eti" id="figEti" role="status" aria-live="polite">Tocá una parte del cuerpo <span aria-hidden="true">👆</span></div></div>
    <div class="chips">${itemsDe(t).map(it=>`<button type="button" class="chip" data-parte="${it.parte}" data-k="${it.k}">${esc(it.en)}${TRAD(it)}</button>`).join("")}</div>`;
  if(t.id==="abc")return `<div class="cards letras">${itemsDe(t).map(it=>`<button type="button" class="card letra" data-k="${it.k}" data-ej="${it.ej.k}"><span class="pl">${it.en}<i>${it.en.toLowerCase()}</i></span><b>${esc(it.say)}</b><span class="ej">${it.ej.e} ${esc(it.ej.en)}</span></button>`).join("")}</div>`;
  if(t.id==="yo")return `<div class="frases">${I1.PAT.yo.map(p=>`<div class="fr"><button type="button" class="oir" data-dec="${esc(p.q)}" aria-label="Listen">🔊</button><div><b>${esc(p.q)}</b>${ST.es?`<small class="es">${esc(p.es)}</small>`:""}</div></div><div class="fr resp"><button type="button" class="oir" data-dec="${esc(p.ok)}" aria-label="Listen">🔊</button><div>${esc(p.ok)}</div></div>`).join("")}</div>`;
  if(t.id==="frases")return `<h3>I am · you are · he is · she is</h3><div class="frases">${I1.PAT.tobe.map(p=>{const f=p.f.replace("___",p.ok);return `<button type="button" class="fr bt" data-dec="${esc(f)}"><span class="pe">${p.p.e}</span><div><b>${esc(f)}</b>${ST.es?`<small class="es">${esc(p.es)}</small>`:""}</div></button>`}).join("")}</div>
    <h3>I like · I don't like</h3><div class="frases">${I1.GUSTOS.slice(0,6).map((x,i)=>{const like=i%2===0,f=gusta(x,like);K(f);return `<button type="button" class="fr bt" data-dec="${esc(f)}"><span class="pe">${x.p.e}${like?"👍":"👎"}</span><div><b>${esc(f)}</b></div></button>`}).join("")}</div>
    <h3>This is a… · It's a…</h3><div class="frases">${itemsDe(I1.TEMA.aula).slice(0,5).map((x,i)=>{const f=(i%2?"It's ":"This is ")+art(x.en)+" "+x.en+".";K(f);return `<button type="button" class="fr bt" data-dec="${esc(f)}"><span class="pe">${pic(x.p)}</span><div><b>${esc(f)}</b></div></button>`}).join("")}</div>`;
  if(t.id==="fecha")return `<div class="fr bt-ej"><button type="button" class="fr bt" data-dec="Today is Monday, the fifth."><span class="pe">${calendario("Mon",5)}</span><div><b>Today is Monday the 5th.</b>${ST.es?'<small class="es">Hoy es lunes 5.</small>':""}</div></button></div>
    <div class="cards">${itemsDe(t).map(it=>`<button type="button" class="card" data-k="${it.k}"><span class="pic pt">${esc(it.en)}</span><b>${esc(it.say)}</b></button>`).join("")}</div>`;
  return `<div class="cards">${itemsDe(t).map(it=>`<button type="button" class="card" data-k="${it.k}">${pic(it.p,"mediana")}<b>${esc(it.en)}</b>${TRAD(it)}</button>`).join("")}</div>`;
}
function pintarTema(id,aprender){
  const t=I1.TEMA[id];TEMA_ACT=t;const d=dominio(t);
  $("pTema").innerHTML=`
   <header class="barra"><button type="button" class="atras" data-act="atras" aria-label="Volver">←</button><b class="tit">${esc(t.nombre)}</b><span></span></header>
   <section class="tcab" style="--tc:${t.color}"><span class="ico" aria-hidden="true">${t.ico}</span><div><h1>${esc(t.nombre)}</h1><p>${esc(t.es)}</p><p class="prog-t">${estrellas(estrellasDe(t))}${aria(estrellasDe(t))} · ${d.aprendidas} de ${d.n} aprendidas</p></div></section>
   <div class="acciones"><button type="button" class="btn grande" id="bEsc">✏️ Escribir<small>Writing</small></button><button type="button" class="btn grande sec" id="bHab">🗣️ Hablar<small>Speaking</small></button></div>
   <h2>Aprender <small class="sub">Tocá y escuchá · Touch and listen</small></h2>
   <div class="estudio" id="estudio">${tarjetas(t)}</div>`;
  ir("pTema");
}
function ligarEstudio(){
  const fig=$("pTema").querySelector(".muneco");
  const tocarParte=p=>{const it=I1.TEMA.cuerpo.items.find(x=>x.parte===p);if(!it)return;fig.querySelectorAll(".hit.on").forEach(h=>h.classList.remove("on"));fig.querySelectorAll('.hit[data-parte="'+p+'"]').forEach(h=>h.classList.add("on"));
    $("pTema").querySelectorAll(".chip").forEach(c=>c.classList.toggle("on",c.dataset.parte===p));const e=$("figEti");if(e)e.innerHTML=`<b>${esc(it.en)}</b>${ST.es?` · ${esc(it.es)}`:""}`;Voz.decir(it.say);Son.tic()};
  if(fig){fig.addEventListener("click",e=>{const h=e.target.closest&&e.target.closest(".hit");if(h)tocarParte(h.dataset.parte)});fig.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.dataset&&e.target.dataset.parte){e.preventDefault();tocarParte(e.target.dataset.parte)}})}
  $("pTema").querySelectorAll(".chip").forEach(c=>c.addEventListener("click",()=>tocarParte(c.dataset.parte)));
}

// ---- ajustes (para grandes): se abre manteniendo apretado el engranaje
function ligarAjustes(){
  const b=$("bAj");if(!b)return;let t=null,a=null;
  const cancelar=()=>{clearTimeout(t);t=null;b.classList.remove("apretando")};
  const iniciar=e=>{if(e.button>0)return;cancelar();b.classList.add("apretando");t=setTimeout(()=>{cancelar();pintarAjustes();ir("pAjustes")},window.__I1_SIN_ESPERA?200:1400)};
  b.addEventListener("pointerdown",iniciar);["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,cancelar));
  b.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();if(!b.dataset.k){b.dataset.k="1";iniciar({button:0});}}});b.addEventListener("keyup",()=>{delete b.dataset.k;cancelar()});
  b.addEventListener("contextmenu",e=>e.preventDefault());
}
function opcionesVoces(){const l=Voz.lista().slice().sort((a,b)=>(/en[-_]GB/i.test(a.lang)?0:1)-(/en[-_]GB/i.test(b.lang)?0:1)||a.name.localeCompare(b.name)),v=Voz.elegir();
  return `<option value="">Automática${v&&!ST.vozNombre?" ("+esc(v.name)+")":""}</option>`+l.map(x=>`<option value="${esc(Voz.id(x))}"${Voz.id(x)===ST.vozNombre?" selected":""}>${esc(x.name)} · ${esc(x.lang)}</option>`).join("")}
function refrescarVoces(){const s=$("ajVoz");if(s&&document.activeElement!==s)s.innerHTML=opcionesVoces()}
function pintarAjustes(){
  const dias=Object.keys(ST.dias).sort().slice(-7).reverse(),oral=Object.keys(ST.or).filter(id=>(ST.or[id].ok+ST.or[id].casi+ST.or[id].mal)>0).length;
  const iaOk=I1.oral&&I1.oral.configurada&&I1.oral.configurada();
  $("pAjustes").innerHTML=`
   <header class="barra"><button type="button" class="atras" data-act="atras" aria-label="Volver">←</button><b class="tit">Para grandes</b><span></span></header>
   <p class="nota-aj">Esta pantalla es para los adultos. Todo se guarda sólo en este aparato.</p>
   <label class="fila"><span>👦 Nombre del chico (para saludarlo y para «My name is…»)</span><input id="ajNombre" type="text" maxlength="16" autocomplete="off" value="${esc(ST.nombre)}" placeholder="Ana"></label>
   <label class="fila"><input type="checkbox" id="ajVozOn" ${ST.voz?"checked":""}><span>🔊 Que hable en inglés (voz del aparato)</span></label>
   <label class="fila"><span>🗣️ Voz</span><select id="ajVoz">${opcionesVoces()}</select></label>
   <label class="fila"><span>⏩ Velocidad</span><select id="ajVel"><option value="lenta"${ST.vel==="lenta"?" selected":""}>Pausada</option><option value="normal"${ST.vel==="normal"?" selected":""}>Normal</option><option value="rapida"${ST.vel==="rapida"?" selected":""}>Rápida</option></select></label>
   <div class="fila"><button type="button" class="btn sec chico" id="ajProbar">🔊 Probar la voz</button><span id="ajProbado" class="nota-aj" role="status"></span></div>
   <p class="nota-aj">Si suena robótica: en el iPhone, Ajustes → Accesibilidad → Contenido hablado → Voces → English, y bajá una «Mejorada» o «Premium»; después elegila acá.</p>
   <label class="fila"><input type="checkbox" id="ajSon" ${ST.sonido?"checked":""}><span>🎵 Sonidos y vibración al contestar</span></label>
   <label class="fila"><input type="checkbox" id="ajEs" ${ST.es?"checked":""}><span>🇦🇷 Mostrar la ayuda en castellano</span></label>
   <label class="fila"><input type="checkbox" id="ajExtra" ${ST.extra?"checked":""}><span>➕ Más palabras (números hasta 20, más útiles y saludos, fechas del 11 al 31): por si todavía no se vieron en la escuela</span></label>
   <label class="fila"><input type="checkbox" id="ajIA" ${ST.ia?"checked":""} ${iaOk?"":"disabled"}><span>🤖 Hablar con ayuda de la IA ${iaOk?"":"(no está configurada en este sitio)"}</span></label>
   <label class="fila"><span>🎤 Sensibilidad del micrófono</span><select id="ajMic"><option value="normal"${ST.mic==="normal"?" selected":""}>Normal</option><option value="alta"${ST.mic==="alta"?" selected":""}>Alta</option><option value="muy"${ST.mic==="muy"?" selected":""}>Muy alta</option></select></label>
   <p class="nota-aj">Si el micrófono «escucha muy bajo», subila. «Alta» es la que viene puesta; «Muy alta» sirve si el chico habla muy bajito o lejos del aparato, pero puede tomar el ruido del cuarto por voz.</p>
   <div class="fila"><button type="button" class="btn sec chico" id="ajProbarMic">🎤 Probar el micrófono</button><span id="ajMicRes" class="nota-aj" role="status" aria-live="polite"></span></div>
   <div class="nivel nivel-aj" aria-hidden="true"><i id="ajNivel"></i></div>
   <p class="nota-aj">${iaOk?"Para saber si contestó bien, el <b>audio</b> de cada respuesta oral se manda a la IA de Google (Gemini) y vuelve como texto; acá no se guarda ningún audio. Si la apagás, en «Hablar» el chico dice la respuesta y un grande toca ✔ si estuvo bien.":"Sin la IA, en «Hablar» el chico dice la respuesta en voz alta y un grande toca ✔ si estuvo bien."}</p>
   <h2>Cómo le va</h2>
   <p class="nota-aj">Palabras y frases aprendidas: <b>${I1.TEMAS.reduce((a,t)=>a+dominio(t).aprendidas,0)}</b> · tareas orales practicadas: <b>${oral}</b> · estrellas: <b>${ST.estrellas}</b> · rondas: <b>${ST.rondas}</b></p>
   <ul class="lista-dias">${dias.map(d=>`<li>${d.slice(8)}/${d.slice(5,7)}: ${ST.dias[d][0]} bien · ${ST.dias[d][1]} a repasar</li>`).join("")||"<li>Todavía no practicó.</li>"}</ul>
   <ul class="lista-dias">${I1.TEMAS.map(t=>{const d=dominio(t);return `<li>${t.ico} ${esc(t.nombre)}: ${d.aprendidas} de ${d.n}</li>`}).join("")}</ul>
   <h3>Conversaciones</h3><ul class="lista-dias">${ST.convs.slice().reverse().map(c=>`<li>${c.f.slice(8)}/${c.f.slice(5,7)}: ${c.ok} de ${c.n} bien${c.casi?" · "+c.casi+" casi":""}</li>`).join("")||"<li>Todavía no conversó.</li>"}</ul>
   <h3>Pruebas hechas</h3><ul class="lista-dias">${ST.pruebas.slice().reverse().map(p=>`<li>${p.f.slice(8)}/${p.f.slice(5,7)}: escrito ${p.e[0]} de ${p.e[1]}${p.o?" · oral "+p.o[0]+" de "+p.o[1]:""}</li>`).join("")||"<li>Todavía no hizo ninguna.</li>"}</ul>
   <button type="button" class="btn peligro" id="ajBorrar">🗑️ Borrar todo lo que hizo</button>`;
}

// ---------------- una ronda (de escribir o de hablar) o la prueba
// R: {modo:"escrito"|"oral"|"prueba", parte:"escrita"|"oral", tema, qs, i, ok, casi, mal, res:[], tok}
let EMPEZANDO=false;   // (pedir el permiso del micrófono tarda: un segundo toque en «Hablar» no tiene que armar otra ronda encima)
async function empezar(modo,temaId){
  if(EMPEZANDO)return;EMPEZANDO=true;
  try{
    Son.init();Voz.desbloquear();
    let permiso="ok";
    if(modo==="oral"&&I1.oral)permiso=await I1.oral.preparar(ST);
    const qs=armarRonda(modo,temaId,modo==="oral"?5:6);
    if(!qs.length)return;
    R={modo,parte:modo==="oral"?"oral":"escrita",tema:temaId||null,qs,i:0,ok:0,casi:0,mal:0,res:[],tok:0,permiso};
    ir("pPreg");mostrar();
  }finally{EMPEZANDO=false}
}
const dichosInicio=q=>[q.cons[0]].concat(q.hablar||[]).filter((x,i,a)=>x&&a.indexOf(x)===i);
function mostrar(){
  const q=R.qs[R.i],total=R.qs.length,pct=Math.round(100*R.i/total);q.errores=0;q.hecho=false;q.intentos=0;R.tok++;
  $("pPreg").innerHTML=`
   <header class="pbarra"><button type="button" class="x" id="bSalir" aria-label="Salir">✕</button><span class="prog" aria-hidden="true"><i style="width:${pct}%"></i></span><span class="pnum" aria-label="Pregunta ${R.i+1} de ${total}">${R.i+1}/${total}</span></header>
   <section class="preg t-${q.tipo}" data-tipo="${q.tipo}">
     <div class="cons"><button type="button" class="oir grande-oir" id="bOir" aria-label="Listen">🔊</button><div class="cons-t"><b>${esc(q.cons[0])}</b>${ST.es?`<small>${esc(q.cons[1])}</small>`:""}</div></div>
     <div class="cuerpo">${q.cuerpo||""}</div>
     <div class="area" id="area"></div>
     <div class="msg" id="msg" role="status" aria-live="polite"></div>
   </section>
   <footer class="pie"><button type="button" class="btn grande" id="bSig" hidden>Next ➜</button></footer>`;
  ULT_NAV=performance.now();
  RENDER[q.tipo](q);
  Voz.secuencia(dichosInicio(q));
}
function mensaje(t,cls){const m=$("msg");if(m){m.className="msg "+(cls||"");m.textContent=t}}
const enPrueba=()=>R&&R.modo==="prueba";
// cierra la pregunta: la anota y muestra «Next» (en la prueba pasa sola a la que sigue, sin decir si estuvo bien)
async function cerrar(q,res,opc){
  if(q.cerrada)return;q.cerrada=true;q.hecho=true;opc=opc||{};
  const bien=res!=="no";
  R.res.push({gen:q.gen,ids:q.ids,res,tema:q.tema});if(res==="ok")R.ok++;else if(res==="casi")R.casi++;else R.mal++;
  q.ids.forEach(id=>{if(res!=="casi")anotar(id,res==="ok")});   // (un «casi» no sube la caja ni la baja)
  if(q.tipo==="oral")q.ids.forEach(id=>anotarOral(id,res));sumarDia(bien);guardar();
  const tok=R.tok;
  if(enPrueba()){await pausa(window.__I1_SIN_ESPERA?20:450);while(R&&R.tok===tok&&!$("modal").hidden)await pausa(250);   // (si está el cartel «¿Salir de la prueba?» abierto, la prueba espera)
    if(R&&R.tok===tok)siguiente();return}
  const sig=$("bSig");if(sig){sig.hidden=false;try{sig.focus({preventScroll:true})}catch(e){}}
  if(opc.hablar!==false&&q.refuerzo){await Voz.decir(q.refuerzo)}
  await pausa(window.__I1_SIN_ESPERA?30:900);
  if(R&&R.tok===tok&&$("bSig")&&!$("bSig").hidden&&!q.noAuto)siguiente();
}
function siguiente(){
  if(!R)return;R.tok++;   // (lo que haya quedado esperando para pasar solo —el «Next» automático— ya no vale: si no, tocar «Next» justo antes contaría dos veces el final de la ronda)
  Voz.parar();if(I1.oral&&I1.oral.parar)I1.oral.parar();
  R.i++;if(R.i>=R.qs.length)return terminarParte();mostrar();
}
function acierto(q){Son.ok();vibrar(15);mensaje(elegir(I1.BIEN),"bien");cerrar(q,q.errores===0?"ok":"no")}
function revelar(q,txt){q.noAuto=true;mensaje((txt||"It's: ")+q.mostrar,"info");Voz.decir(q.refuerzo||q.hablar&&q.hablar[0]||q.mostrar);cerrar(q,"no",{hablar:false})}

const RENDER={};
// ·· elegir una opción (texto o dibujo): también es el ✔ / ✘
RENDER.mc=q=>{
  const clase=q.vf?"ops vf":q.ops.length===2?"ops dos":"ops";
  $("area").innerHTML=`<div class="${clase}">${q.ops.map((o,i)=>`<button type="button" class="op ${o.cls||""}${/^<span class="pic/.test(o.h)||/class="(par|cal)"/.test(o.h)?" conpic":""}" data-i="${i}" aria-label="${esc(o.aria||"")}" style="--i:${i}">${o.h}</button>`).join("")}</div>`;
  $("area").querySelectorAll(".op").forEach(b=>b.addEventListener("click",()=>{
    if(q.hecho||bloq()||b.disabled)return;const o=q.ops[+b.dataset.i];Son.init();
    if(enPrueba()){q.ops.forEach((_,i)=>$("area").querySelectorAll(".op")[i].disabled=true);b.classList.add("sel");Son.tic();return cerrar(q,o.ok?"ok":"no")}
    if(o.ok){b.classList.add("ok");$("area").querySelectorAll(".op").forEach(x=>x.disabled=true);acierto(q)}
    else{q.errores++;b.classList.add("mal");b.disabled=true;Son.mal();vibrar(30);
      if(q.errores>=2||q.ops.filter(x=>!x.ok).length<=q.errores){$("area").querySelectorAll(".op").forEach((x,i)=>{x.disabled=true;if(q.ops[i].ok)x.classList.add("ok")});revelar(q)}
      else{mensaje(elegir(I1.PROBA),"info");Voz.decir(I1.PROBA[0])}}
  }));
};
// ·· armar una palabra con las letras
RENDER.armar=q=>{
  const W=q.w;
  $("area").innerHTML=`<div class="slots" id="slots">${W.split("").map((c,i)=>i<q.dados?`<span class="slot dado">${c}</span>`:`<button type="button" class="slot" data-i="${i}" aria-label="Letra ${i+1}: vacío"></button>`).join("")}</div>
   <div class="banco" id="banco">${q.fichas.map((c,i)=>`<button type="button" class="ficha" data-i="${i}">${c}</button>`).join("")}</div>`;
  const slots=[...$("slots").children],fichas=[...$("banco").children],est=Array(W.length).fill(null);for(let i=0;i<q.dados;i++)est[i]=-1;
  const etq=i=>{if(i>=q.dados)slots[i].setAttribute("aria-label","Letra "+(i+1)+": "+(est[i]===null||est[i]===-1?"vacío":q.fichas[est[i]]))};
  const limpiar=()=>{est.forEach((x,i)=>{if(i>=q.dados&&x!==null){est[i]=null;slots[i].textContent="";slots[i].classList.remove("puesta","mal");etq(i)}});fichas.forEach(f=>{f.disabled=false;f.classList.remove("usada")})};
  fichas.forEach(f=>f.addEventListener("click",()=>{
    if(q.hecho||bloq()||f.disabled)return;const i=est.findIndex((x,k)=>x===null&&k>=q.dados);if(i<0)return;Son.init();
    est[i]=+f.dataset.i;slots[i].textContent=q.fichas[est[i]];slots[i].classList.add("puesta");etq(i);f.disabled=true;f.classList.add("usada");Son.tic();
    if(est.every(x=>x!==null))verificar();
  }));
  slots.forEach((s,i)=>s.addEventListener("click",()=>{if(q.hecho||i<q.dados||est[i]===null||bloq())return;const fi=est[i];est[i]=null;s.textContent="";s.classList.remove("puesta");etq(i);const f=fichas[fi];f.disabled=false;f.classList.remove("usada")}));
  function verificar(){
    const pal=est.map((x,i)=>x===-1?W[i]:q.fichas[x]).join("");
    if(pal===W){if(enPrueba())return cerrar(q,q.errores===0?"ok":"no");slots.forEach(s=>s.classList.add("ok"));return acierto(q)}
    q.errores++;
    if(enPrueba()){q.hecho=true;return cerrar(q,"no")}   // (en la prueba no se dice si estuvo bien: ni colores, ni sonido, ni la solución)
    slots.forEach((s,i)=>{if(i>=q.dados)s.classList.add("mal")});Son.mal();vibrar(30);   // (la letra regalada no se pinta de rojo)
    if(q.errores>=2){q.hecho=true;slots.forEach((s,i)=>{s.textContent=W[i];s.classList.remove("mal");s.classList.add("ok")});return revelar(q)}
    mensaje(elegir(I1.PROBA),"info");Voz.decir(I1.PROBA[0]);setTimeout(()=>{if(!q.hecho)limpiar()},700);
  }
};
// ·· ordenar fichas (una serie o una frase)
RENDER.ordenar=q=>{
  $("area").innerHTML=`<div class="ofila${q.frase?" frase":""}" id="ofila">${q.sol.map((_,i)=>`<button type="button" class="hueco-o" data-i="${i}" aria-label="Lugar ${i+1}"><i>${i+1}</i></button>`).join("")}</div><div class="banco${q.frase?" frase":""}" id="banco">${q.fichas.map(f=>`<button type="button" class="ficha${q.frase?" palabra":""}" data-id="${f.id}">${f.h}</button>`).join("")}</div>`;
  const huecos=[...$("ofila").children],banco=[...$("banco").children],puestas=[];
  const txt=id=>{const f=q.fichas.find(x=>x.id===id);return f?f.h:""};
  const pintar=()=>{huecos.forEach((h,i)=>{const id=puestas[i],f=q.fichas.find(x=>x.id===id);h.innerHTML=f?f.h:`<i>${i+1}</i>`;h.classList.toggle("puesta",!!f);h.setAttribute("aria-label","Lugar "+(i+1)+(f?": "+h.textContent:""))});banco.forEach(b=>{const u=puestas.includes(b.dataset.id);b.disabled=u;b.classList.toggle("usada",u)})};
  banco.forEach(b=>b.addEventListener("click",()=>{if(q.hecho||bloq()||b.disabled||puestas.length>=q.sol.length)return;Son.init();puestas.push(b.dataset.id);Son.tic();pintar();if(puestas.length===q.sol.length)verificar()}));
  huecos.forEach((h,i)=>h.addEventListener("click",()=>{if(q.hecho||bloq()||i>=puestas.length)return;puestas.splice(i,1);pintar()}));
  function verificar(){
    if(puestas.map(txt).join("|")===q.sol.map(txt).join("|")){if(enPrueba())return cerrar(q,q.errores===0?"ok":"no");huecos.forEach(h=>h.classList.add("ok"));return acierto(q)}   // (por lo que dice cada ficha: dos fichas iguales valen lo mismo)
    q.errores++;
    if(enPrueba()){q.hecho=true;return cerrar(q,"no")}
    huecos.forEach(h=>h.classList.add("mal"));Son.mal();vibrar(30);
    if(q.errores>=2){q.hecho=true;huecos.forEach((h,i)=>{const f=q.fichas.find(x=>x.id===q.sol[i]);h.innerHTML=f.h;h.classList.remove("mal");h.classList.add("ok","puesta")});return revelar(q)}
    mensaje(elegir(I1.PROBA),"info");Voz.decir(I1.PROBA[0]);setTimeout(()=>{if(!q.hecho){puestas.length=0;huecos.forEach(h=>h.classList.remove("mal"));pintar()}},700);
  }
};
// ·· unir dibujos con palabras
RENDER.unir=q=>{
  const der=mezclarDistinto(q.pares);
  $("area").innerHTML=`<div class="unir"><div class="col">${q.pares.map(p=>`<button type="button" class="u u-i" data-id="${p.id}" aria-label="${esc(p.aria||"")}">${p.izq}</button>`).join("")}</div><div class="col">${der.map(p=>`<button type="button" class="u u-d" data-id="${p.id}">${p.der}</button>`).join("")}</div></div>`;
  let sel=null,hechos=0;const todos=[...$("area").querySelectorAll(".u")];
  todos.forEach(b=>b.addEventListener("click",()=>{
    if(q.hecho||bloq()||b.disabled)return;Son.init();const lado=b.classList.contains("u-i")?"i":"d";
    if(!sel||sel.lado===lado){todos.forEach(x=>x.classList.remove("sel"));if(sel&&sel.b===b){sel=null;return}sel={lado,id:b.dataset.id,b};b.classList.add("sel");Son.tic();return}
    const igual=sel.id===b.dataset.id,otro=sel.b;sel=null;todos.forEach(x=>x.classList.remove("sel"));
    if(enPrueba()){   // en la prueba no se dice si el par es el bueno: queda elegido y se sigue; se cuenta al final
      [b,otro].forEach(x=>{x.classList.add("fijo");x.disabled=true});Son.tic();if(!igual)q.errores++;hechos++;
      if(hechos===q.pares.length){q.hecho=true;cerrar(q,q.errores<=1?"ok":"no")}return}
    if(igual){[b,otro].forEach(x=>{x.classList.add("hecho");x.disabled=true});Son.ok();Voz.decir(q.pares.find(p=>p.id===b.dataset.id).dec);hechos++;if(hechos===q.pares.length){q.hecho=true;if(enPrueba())return cerrar(q,q.errores<=1?"ok":"no");mensaje(elegir(I1.BIEN),"bien");cerrar(q,q.errores<=1?"ok":"no",{hablar:false})}}
    else{q.errores++;[b,otro].forEach(x=>{x.classList.add("mal");setTimeout(()=>x.classList.remove("mal"),500)});Son.mal();vibrar(30);if(!enPrueba())mensaje(elegir(I1.PROBA),"info")}
  }));
};
// ·· tocar una parte del cuerpo
RENDER.parte=q=>{
  const fig=$("pPreg").querySelector(".muneco");
  const tocar=p=>{if(q.hecho||bloq())return;Son.init();const hit=fig.querySelector('.hit[data-parte="'+p+'"]');
    if(enPrueba()){q.hecho=true;Son.tic();return cerrar(q,p===q.parte?"ok":"no")}   // (en la prueba no se dice si estuvo bien)
    if(p===q.parte){fig.querySelectorAll('.hit[data-parte="'+p+'"]').forEach(h=>h.classList.add("on"));return acierto(q)}
    q.errores++;if(hit)hit.classList.add("mal");setTimeout(()=>hit&&hit.classList.remove("mal"),500);Son.mal();vibrar(30);
    if(q.errores>=2){fig.querySelectorAll('.hit[data-parte="'+q.parte+'"]').forEach(h=>h.classList.add("on"));return revelar(q,"Here: ")}
    mensaje(elegir(I1.PROBA),"info");Voz.decir(I1.PROBA[0]);
  };
  fig.addEventListener("click",e=>{const h=e.target.closest&&e.target.closest(".hit");if(h)tocar(h.dataset.parte)});
  fig.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.dataset&&e.target.dataset.parte){e.preventDefault();tocar(e.target.dataset.parte)}});
};
// ·· hablar (ver oral.js: el micrófono, la IA que pasa la voz a texto y la comprobación)
// El micrófono de UNA respuesta (lo usan «Hablar» y «Conversar»). q: la tarea ({ev, tema, hecho, ocupado, oyendo, tAbrio}).
// io: lo que cambia entre una pantalla y otra {antes, micT, estado, nivel, vigente, aviso, falla, resultado}.
async function hablarUnaVez(q,io){
  if(q.hecho||bloq())return;
  if(q.ocupado){if(q.oyendo&&performance.now()-(q.tAbrio||0)>600)I1.oral.terminar();return}   // (un toque doble de un chico justo al abrir no corta la grabación)
  q.ocupado=true;q.oyendo=false;Voz.parar();Son.init();io.antes();
  io.micT("Abriendo el micrófono…");
  const r=await I1.oral.escuchar({mic:ST.mic,max:q.ev.k==="serie"?(q.ev.lista.length>7?24000:14000):8000,sil:q.ev.k==="serie"?2200:1500,
    alAbrir:()=>{q.oyendo=true;q.tAbrio=performance.now();io.estado("oyendo");io.micT(MIC_OYENDO);vibrar(10)},onNivel:io.nivel,
    onBajo:()=>io.micT("Te oigo muy bajito: acercate y hablá más fuerte"),onVoz:()=>io.micT(MIC_OYENDO)});
  q.oyendo=false;
  if(q.hecho||!io.vigente()){q.ocupado=false;return}   // (ya es otra pantalla u otra vuelta: no se toca nada de lo que se ve, el micrófono de ahora puede ser otro)
  io.nivel(0);
  const libre=()=>{io.estado("");q.ocupado=false;io.micT("Tocá el micrófono y hablá")};
  if(r.cancelado)return libre();
  if(r.error){libre();return io.aviso(r.error)}
  if(r.mudo){libre();io.aviso(r.bajo?"Te escuché muy bajito. Acercate un poco al aparato y hablá más fuerte. Try again!":"No te escuché. Try again!");return Voz.decir("Try again!")}
  io.estado("pensando");io.micT("Pensando…");
  const t=await I1.oral.transcribir(r.blob,{pista:q.tema});
  if(q.hecho||!io.vigente()){q.ocupado=false;return}   // (se salteó o se salió mientras la IA pensaba: el resultado viejo se descarta sin tocar la pantalla de ahora)
  libre();
  if(t.error)return io.falla(t.error);
  // sin ninguna palabra (un ruido que se tomó por voz, una voz demasiado baja) no hay nada que juzgar: no cuenta como intento, se vuelve a probar
  if(!t.texto){io.aviso(r.bajo?"Te escuché muy bajito y no entendí nada. Acercate un poco y hablá más fuerte. Try again!":"No entendí lo que dijiste. Try again!");return Voz.decir("Try again!")}
  io.resultado(I1.oral.evaluar(q.ev,t.texto,ST),t.texto,{bajo:!!r.bajo});
}
const MIC_OYENDO="Te escucho… ¡hablá!";
// el veredicto, a la vista y sin vueltas: ✅ ¡Correcto! · 🟡 Casi · ❌ Todavía no, con lo que la IA escuchó y (al final) cómo era
const VERE={ok:["✅","¡Correcto!"],casi:["🟡","Casi"],no:["❌","Todavía no"]};
function vereHTML(res,texto,modelo,dire,bajo){
  const v=VERE[res]||VERE.no,oi=texto?`Escuché: <b>«${esc(texto)}»</b>`:"No entendí palabras.";
  const mod=modelo?`<span class="mod">Había que decir: <b lang="en">«${esc(modelo)}»</b><button type="button" class="oir chico" data-dec="${esc(dire||modelo)}" aria-label="Listen">🔊</button><button type="button" class="oir chico" data-dec="${esc(dire||modelo)}" data-lento="1" aria-label="Listen slowly">🐢</button></span>`:"";
  const baj=bajo&&res!=="ok"?`<span class="baj">🔉 Se oyó muy bajito: acercate un poco al aparato y hablá más fuerte.</span>`:"";
  return `<span class="vere ${res}"><span class="vi" aria-hidden="true">${v[0]}</span><span class="vt"><b>${v[1]}</b><span>${oi}</span>${baj}${mod}</span></span>`;
}
RENDER.oral=(q,otraVez)=>{
  if(otraVez)ULT_NAV=performance.now();   // (el micrófono se cambia por «Lo dije» en el mismo lugar: un doble toque no tiene que contestar por el chico)
  const d=I1.oral.disponible(ST),ia=d.ia&&R.permiso!=="denied"&&R.permiso!=="nodev";q.ia=ia;q.ocupado=false;
  if(!ia&&!otraVez&&!enPrueba()){const m=I1.oral.msgPermiso(R.permiso);if(m)mensaje(m,"info")}
  $("area").innerHTML=`<div class="oral-caja">
    <div class="oyo" id="oyo" role="status" aria-live="polite"></div>
    ${ia?`<button type="button" class="mic" id="bMic" aria-label="Tocar y hablar"><span class="mic-ico" aria-hidden="true">🎤</span><i class="ondas" aria-hidden="true"></i></button><div class="mic-t" id="micT">Tocá el micrófono y hablá</div><div class="nivel" aria-hidden="true"><i id="nivel"></i></div>`
      :`<div class="mic-t" id="micT">Decilo en voz alta y después tocá ✔</div><div class="auto-bot"><button type="button" class="btn grande" id="bHecho">✔ Lo dije</button><button type="button" class="btn sec" id="bOtraVez">🔁 Otra vez</button></div>`}
    <button type="button" class="btn sec chico" id="bSaltar">⏭️ Saltear · Skip</button></div>`;
  const micT=t=>{const e=$("micT");if(e)e.textContent=t},mic=$("bMic");
  $("bSaltar").addEventListener("click",()=>{if(q.hecho||bloq())return;if(I1.oral)I1.oral.parar();q.hecho=true;mensaje("","");cerrar(q,"no",{hablar:false})});
  if(!ia){
    $("bHecho").addEventListener("click",()=>{if(q.hecho||bloq())return;q.auto=true;if(!enPrueba()){Son.ok();vibrar(15);mensaje(elegir(I1.BIEN),"bien")}else Son.tic();cerrar(q,"ok")});
    $("bOtraVez").addEventListener("click",()=>{if(bloq())return;Voz.secuencia(dichosInicio(q))});return;
  }
  const estado=e=>{mic.classList.toggle("oyendo",e==="oyendo");mic.classList.toggle("pensando",e==="pensando");mic.setAttribute("aria-pressed",String(e==="oyendo"))};
  const io={antes:()=>{$("oyo").textContent="";mensaje("","")},micT,estado,nivel:v=>{const n=$("nivel");if(n)n.style.width=Math.min(100,v)+"%"},
    vigente:()=>!!R&&R.qs[R.i]===q,aviso:t=>mensaje(t,"info"),falla:t=>{RENDER.oral(q,true);mensaje(t,"info")},resultado:(ev,texto,x)=>resultadoOral(q,ev,texto,x)};
  mic.addEventListener("click",()=>hablarUnaVez(q,io));
};
function resultadoOral(q,ev,texto,x){
  q.intentos++;
  const oyo=$("oyo");
  if(enPrueba()){if(oyo)oyo.innerHTML=texto?`Escuché: <b>«${esc(texto)}»</b>`:"No entendí palabras.";q.hecho=true;return cerrar(q,ev.res)}   // (en la prueba no se dice si estuvo bien)
  const dire=q.dire||q.mostrar,final=ev.res==="ok"||q.intentos>=2;   // («dire»: lo que se dice de la respuesta, si lo que se muestra no se puede leer en voz alta)
  if(oyo)oyo.innerHTML=vereHTML(ev.res,texto,final&&ev.res!=="ok"?q.mostrar:"",dire,x&&x.bajo);
  if(ev.res==="ok"){q.hecho=true;Son.ok();vibrar(15);const f=elegir(I1.BIEN);mensaje(f,"bien");q.refuerzo=f;return cerrar(q,"ok")}   // (se festeja también con la voz: «Great!»)
  if(q.intentos<2){Son.mal();mensaje((ev.res==="casi"?elegir(I1.CASI):elegir(I1.PROBA)),"info");Voz.secuencia([ev.res==="casi"?"Almost!":"Try again!",q.hablar[q.hablar.length-1]]);return}
  q.hecho=true;q.noAuto=true;
  if(ev.res==="casi"){mensaje("Almost! "+q.mostrar,"info");Voz.decir(dire);return cerrar(q,"casi",{hablar:false})}
  mensaje("Listen: "+q.mostrar,"info");Voz.decir(dire);cerrar(q,"no",{hablar:false});
}

// ---------------- resultados
function terminarParte(){
  const parteId=R.modo+"/"+R.parte;if(R.cerrada===parteId)return;R.cerrada=parteId;   // (cada parte se cierra una sola vez)
  if(R.modo==="prueba"&&R.parte==="escrita"){R.esc=[R.ok,R.qs.length];return pintarPruebaOral()}
  if(R.modo==="prueba")return terminarPrueba();
  const total=R.qs.length,puntos=R.ok+R.casi*.5,pct=puntos/total,est=pct>=.84?3:pct>=.6?2:pct>=.3?1:0;
  ST.rondas++;ST.estrellas+=est;guardar();Son.fin();
  const repasar=R.res.filter(r=>r.res==="no").flatMap(r=>r.ids).filter((id,i,a)=>a.indexOf(id)===i).map(id=>I1.ITEM[id]).filter(Boolean).slice(0,8);
  const msg=est===3?"Excellent!":est===2?"Very good!":est===1?"Good job!":"Let's try again!";
  $("pFin").innerHTML=`<section class="fin"><div class="fin-ests" role="img" aria-label="${est} de 3 estrellas">${estrellas(est)}</div><h1>${msg}</h1>
    <p class="fin-cuenta"><b>${R.ok}</b> de ${total} bien${R.casi?` · ${R.casi} casi`:""}</p>
    ${repasar.length?`<h2>Para repasar</h2><div class="cards rep">${repasar.map(it=>`<button type="button" class="card" data-k="${it.k}">${pic(it.p,"mediana")}<b>${esc(it.en)}</b>${TRAD(it)}</button>`).join("")}</div>`:""}
    <button type="button" class="btn grande" id="bOtra">🔁 Again</button><button type="button" class="btn sec" id="bInicio">🏠 Inicio</button></section>`;
  ir("pFin");Voz.decir(msg);
}
function pintarPrueba(){
  const ult=ST.pruebas[ST.pruebas.length-1];
  $("pPrueba").innerHTML=`<header class="barra"><button type="button" class="atras" data-act="atras" aria-label="Volver">←</button><b class="tit">Mi prueba</b><span></span></header>
   <section class="intro"><div class="gran" aria-hidden="true">🏆</div><h1>My test</h1><p>Una prueba como la de la escuela, con dos partes:</p>
   <ol class="partes"><li><b>✏️ Escrita</b> — 14 preguntas de todos los temas. No se dice si estuvo bien hasta el final.</li><li><b>🗣️ Oral</b> — 8 tareas: el profe pregunta y se contesta hablando.</li></ol>
   ${ult?`<p class="ult">Última vez (${ult.f.slice(8)}/${ult.f.slice(5,7)}): escrito ${ult.e[0]} de ${ult.e[1]}${ult.o?" · oral "+ult.o[0]+" de "+ult.o[1]:""}</p>`:""}
   <button type="button" class="btn grande" id="bEmpPrueba">▶ Empezar · Start</button></section>`;
  ir("pPrueba");
}
async function empezarPrueba(){
  Son.init();Voz.desbloquear();const p=armarPrueba();if(!p.escritas.length)return;
  R={modo:"prueba",parte:"escrita",tema:null,qs:p.escritas,orales:p.orales,i:0,ok:0,casi:0,mal:0,res:[],tok:0,permiso:"ok",esc:null,ora:null};
  ir("pPreg");mostrar();
}
function pintarPruebaOral(){
  $("pPrueba").innerHTML=`<header class="barra"><span></span><b class="tit">Mi prueba</b><span></span></header>
   <section class="intro"><div class="gran" aria-hidden="true">🗣️</div><h1>Part 2 · Speaking</h1><p>¡Terminó la parte escrita! Ahora la parte oral: el profe pregunta y se contesta en voz alta.</p>
   <button type="button" class="btn grande" id="bEmpOral">▶ Empezar · Start</button><button type="button" class="btn sec" id="bSinOral">Terminar sin la parte oral</button></section>`;
  ir("pPrueba");
}
async function empezarOralPrueba(){
  if(EMPEZANDO)return;EMPEZANDO=true;
  try{
    Son.init();Voz.desbloquear();let permiso="ok";if(I1.oral)permiso=await I1.oral.preparar(ST);
    if(!R||R.modo!=="prueba")return;   // (salió de la prueba mientras se pedía el permiso)
    R.parte="oral";R.qs=R.orales;R.i=0;R.ok=0;R.casi=0;R.mal=0;R.permiso=permiso;R.res=R.res||[];R.tok++;ir("pPreg");mostrar();
  }finally{EMPEZANDO=false}
}
function terminarPrueba(){
  const nE=R.esc||[0,1],ora=R.parte==="oral"?[Math.floor(R.ok+R.casi*.5),R.qs.length]:null;
  ST.pruebas.push({f:FECHA(),e:[nE[0],nE[1]],o:ora});ST.pruebas=ST.pruebas.slice(-20);
  const pct=(nE[0]+(ora?ora[0]:0))/(nE[1]+(ora?ora[1]:0)),est=pct>=.84?3:pct>=.6?2:pct>=.3?1:0;ST.estrellas+=est;ST.rondas++;guardar();Son.fin();
  const temas=Object.create(null);R.todas=(R.todas||[]).concat(R.res);
  const repasar=[...new Set(R.res.filter(r=>r.res==="no").map(r=>r.tema))].map(id=>I1.TEMA[id]).filter(Boolean);
  const msg=est===3?"Excellent!":est===2?"Very good!":est===1?"Good job!":"Let's keep practicing!";
  $("pFin").innerHTML=`<section class="fin"><div class="fin-ests" role="img" aria-label="${est} de 3 estrellas">${estrellas(est)}</div><h1>${msg}</h1>
   <div class="dos-notas"><div><b>${nE[0]} de ${nE[1]}</b><span>✏️ Escrito</span></div>${ora?`<div><b>${ora[0]} de ${ora[1]}</b><span>🗣️ Oral</span></div>`:""}</div>
   ${repasar.length?`<h2>Para repasar</h2><div class="chips-t">${repasar.map(t=>`<button type="button" class="tema chico" data-tema="${t.id}" style="--tc:${t.color}"><span class="ico" aria-hidden="true">${t.ico}</span><b>${esc(t.nombre)}</b></button>`).join("")}</div>`:""}
   <button type="button" class="btn grande" id="bOtraPrueba">🔁 Otra prueba</button><button type="button" class="btn sec" id="bInicio">🏠 Inicio</button></section>`;
  ir("pFin");Voz.decir(msg);
}

// ---------------- conversar: el profe pregunta lo básico y el chico contesta hablando
// Es una charla corta (9 o 10 vueltas): saludo, nombre, edad, cómo está y algunos temas de los que ya se estudian (gustos, colores, contar, un útil, una parte del cuerpo, el día), y la despedida.
// Cada vuelta tiene la pregunta del profe, lo que se espera («ev», el mismo evaluador de «Hablar»), la respuesta modelo («dire») y cómo reacciona el profe si estuvo bien.
// Un error pide intentar otra vez; al segundo, el profe dice cómo era y se sigue con «Seguir».
const cap=x=>x.charAt(0).toUpperCase()+x.slice(1);
const convHola=()=>{const d=elegir(["Hello!","Hi!"]);K(d);return {sub:"hola",tema:"saludos",ids:["hello"],dice:d,es:"¡Hola!",cuerpo:dib({e:"🙂👋"}),ev:{k:"palabra",acepta:["hello","hi","hey","good morning","good afternoon"]},mostrar:"Hello!",dire:"Hello!",rea:["Nice to see you!","I'm happy to see you!"]}};
const convNombre=()=>{const n=nombreOk(),d="What's your name?";K(d);return {sub:"nombre",tema:"yo",ids:["y1"],dice:d,es:"¿Cómo te llamás?",cuerpo:dib({e:"🏷️"}),ev:{k:"abierta",de:"nombre"},mostrar:"My name is…",dire:"My name is "+(n||"Ana")+".",rea:[n?"Nice to meet you, "+n+"!":"Nice to meet you!"]}};
const convEdad=()=>{const d="How old are you?";K(d);return {sub:"edad",tema:"yo",ids:["y2"],dice:d,es:"¿Cuántos años tenés?",cuerpo:dib({e:"🎂"}),ev:{k:"abierta",de:"edad"},mostrar:"I'm six.",dire:"I'm six.",rea:["Great!","Wow, great!"]}};
const convEstado=()=>{const d="How are you?";K(d);return {sub:"estado",tema:"yo",ids:["y3"],dice:d,es:"¿Cómo estás?",cuerpo:dib({e:"🙂"}),ev:{k:"abierta",de:"estado"},mostrar:"I'm fine, thank you.",dire:"I'm fine, thank you.",rea:["I'm fine too, thank you!","Great! I'm happy too!"]}};
const convGusto=()=>{const x=elegir(I1.GUSTOS),d="Do you like "+GUSTA[x.id]+"?";K(d);return {sub:"gusto",tema:"frases",ids:["g-"+x.id],dice:d,es:"¿Te gusta? Contestá «Yes, I do» o «No, I don't».",cuerpo:dib(x.p),ev:{k:"abierta",de:"gusto",cosa:GUSTA[x.id]},mostrar:"Yes, I do. · No, I don't.",dire:"Yes, I do.",rea:["OK, thank you!","Good!"]}};
const convColor=()=>{const it=elegirItems(I1.TEMA.colores,1)[0],d="What colour is it?";K(d);return {sub:"color",tema:"colores",ids:[it.id],dice:d,es:"¿De qué color es?",cuerpo:dib(it.p),ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:it.en,dire:"It's "+it.en+".",rea:["Yes! It's "+it.en+"!"]}};
const convContar=()=>{const t=I1.TEMA.numeros,hasta=itemsDe(t).filter(x=>caja(x.id)>=2).length>=4?10:5,l=I1.NUM_EN.slice(1,hasta+1),d="Count to "+I1.NUM_EN[hasta]+".";K(d);
  return {sub:"contar",tema:"numeros",ids:itemsDe(t).filter(x=>x.n<=hasta).map(x=>x.id),dice:d,es:"Contá en voz alta, en inglés.",cuerpo:`<div class="grupo grande-num">${l.map((w,i)=>`<span>${i+1}</span>`).join("")}</div>`,ev:{k:"serie",lista:l,min:hasta,casi:Math.ceil(hasta*.6)},mostrar:l.join(", "),dire:l.join(", "),rea:["Excellent counting!","Wow! You can count!"]}};
const convObjeto=()=>{const it=elegir(itemsDe(I1.TEMA.aula).filter(z=>z.p&&!PLURAL.has(z.en))),d="What's this?",fr="It's "+art(it.en)+" "+it.en+".";K(d);return {sub:"objeto",tema:"aula",ids:[it.id],dice:d,es:"¿Qué es esto?",cuerpo:dib(it.p),ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:fr,dire:fr,rea:["Yes! "+fr]}};
const convCuerpo=()=>{const it=elegirItems(I1.TEMA.cuerpo,1)[0],d="What's this?";K(d);return {sub:"cuerpo",tema:"cuerpo",ids:[it.id],dice:d,es:"¿Qué parte del cuerpo es?",cuerpo:`<div class="dib fig">${I1.svgCuerpo({resalta:it.parte})}</div>`,ev:{k:"palabra",acepta:I1.oral.aceptaDe(it)},mostrar:it.en,dire:it.say,rea:["Yes! "+cap(it.en)+"!"]}};
const convDia=()=>{const i=(new Date().getDay()+6)%7,dia=I1.DIAS_EN[i],d="What day is it today?";K(d);return {sub:"dia",tema:"dias",ids:["d"+(i+1)],dice:d,es:"¿Qué día es hoy?",cuerpo:dib({e:"📅"}),ev:{k:"palabra",acepta:[dia.toLowerCase()]},mostrar:dia,dire:dia,rea:["Yes! Today is "+dia+"."]}};
const convChau=()=>{const d="Goodbye!";K(d);return {sub:"chau",tema:"saludos",ids:["goodbye"],dice:d,es:"¡Chau!",cuerpo:dib({e:"👋🚪"}),ev:{k:"palabra",acepta:["goodbye","bye","bye bye","see you","see you soon"]},mostrar:"Goodbye!",dire:"Goodbye!",rea:["Goodbye! See you soon!","Bye bye! See you!"]}};
function armarConv(){
  const turnos=[convHola(),convNombre(),convEdad(),convEstado()];
  mezclar([convGusto,convColor,convContar,convObjeto,convCuerpo,convDia]).slice(0,4+azar(0,1)).forEach(f=>turnos.push(f()));
  turnos.push(convChau());return turnos;
}
let C=null;   // la conversación en curso
function pintarConv(){
  $("pConv").innerHTML=`
   <header class="pbarra"><button type="button" class="x" id="bConvSalir" aria-label="Salir">✕</button><span class="prog" aria-hidden="true"><i id="convProg" style="width:0%"></i></span><span class="pnum" id="convNum"></span></header>
   <div class="chat" id="chat" role="log" aria-live="polite" aria-label="Conversación"></div>
   <footer class="convctl" id="convCtl"></footer>`;
  try{if(CONV_RO)CONV_RO.disconnect();if(window.ResizeObserver){CONV_RO=new ResizeObserver(()=>{convPieAlto();convAVista()});CONV_RO.observe($("convCtl"))}}catch(e){}   // (si el pie cambia de alto, la última burbuja se vuelve a acomodar)
}
let CONV_RO=null;
// si el pie ocupa más de la mitad de la pantalla (letra muy grande en un celular chico) deja de ser fijo: tapaba la pregunta
function convPieAlto(){const c=$("convCtl");if(c)c.classList.toggle("alto",c.offsetHeight>innerHeight*0.5)}
function burbuja(quien,html,cls){
  const c=$("chat");if(!c)return null;
  const d=document.createElement("div");d.className="burb "+quien+(cls?" "+cls:"");d.innerHTML=(quien==="prof"?'<span class="av" aria-hidden="true">🧑‍🏫</span>':"")+`<div class="cb">${html}</div>`;c.appendChild(d);
  convAVista();
  return d;
}
// Deja a la vista la última burbuja entre la barra de arriba y el pie fijo, que mide distinto según lo que muestre (el micrófono, «Seguir», los avisos…): si entra, justo sobre el pie;
// si es más alta que el espacio libre, desde arriba (la pregunta va primero). Sólo se mueve si hace falta. Antes usaba scrollIntoView con el alto del pie de ESE momento, y el pie
// de la vuelta nueva se dibuja después: la pregunta quedaba media tapada. Un ResizeObserver (pintarConv) la vuelve a acomodar cuando el pie cambia de alto.
function convAVista(){
  const pc=$("pConv"),c=$("chat"),d=c&&c.lastElementChild;if(!C||!d||!pc||pc.hidden)return;
  const ctl=$("convCtl"),bar=pc.querySelector(".pbarra"),fijo=!!ctl&&getComputedStyle(ctl).position==="sticky",arriba=(bar?bar.offsetHeight:0)+8,abajo=(fijo?ctl.offsetHeight:0)+10,r=d.getBoundingClientRect(),libre=innerHeight-arriba-abajo;
  const y=r.height<=libre?(r.bottom>innerHeight-abajo?r.bottom-(innerHeight-abajo):r.top<arriba?r.top-arriba:0):r.top-arriba;
  if(Math.abs(y)<1)return;
  try{window.scrollBy({top:y,behavior:window.matchMedia&&matchMedia("(prefers-reduced-motion:reduce)").matches?"auto":"smooth"})}catch(e){window.scrollBy(0,y)}
}
// una nota del sistema dentro del chat (no en el pie fijo): se queda a la vista y no le saca lugar a la pregunta
function convNota(texto){
  const c=$("chat");if(!c||!texto)return;
  const d=document.createElement("div");d.className="burb sis";d.innerHTML=`<div class="cb">${esc(texto)}</div>`;c.appendChild(d);
  convAVista();
}
const convDice=(T,previa)=>`${previa?`<p class="rea" lang="en">${esc(previa)}</p>`:""}<p class="dice" lang="en"><b>${esc(T.dice)}</b><button type="button" class="oir chico" data-dec="${esc(T.dice)}" aria-label="Listen">🔊</button></p>${ST.es?`<small class="es">${esc(T.es)}</small>`:""}<div class="dib-b">${T.cuerpo}</div>`;
function convTurno(demo){
  const T=C.turnos[C.i];C.tok++;T.intentos=0;T.hecho=false;T.ocupado=false;T.oyendo=false;
  const previa=C.previa;C.previa="";
  const prog=$("convProg"),num=$("convNum");if(prog)prog.style.width=Math.round(100*C.i/C.turnos.length)+"%";if(num)num.textContent=(C.i+1)+"/"+C.turnos.length;
  convCtl(T);
  burbuja("prof",convDice(T,previa));
  if(!demo)Voz.secuencia(previa?[previa,T.dice]:[T.dice]);
}
// el pie: el micrófono (o «Lo dijo bien» si no hay IA o permiso) y «Saltear»; después de fallar, «Seguir»
function convCtl(T,seguir){
  const ctl=$("convCtl");if(!ctl)return;
  const ia=I1.oral.disponible(ST).ia&&C.permiso!=="denied"&&C.permiso!=="nodev";T.ia=ia;const tok=C.tok;
  const foco=ctl.contains(document.activeElement)||C.foco;C.foco=false;   // (si el teclado estaba en el pie, que siga en el pie nuevo)
  const alFoco=()=>{if(foco)try{(ctl.querySelector("#bConvMic,#bConvSig,#bConvDije")||ctl).focus({preventScroll:true})}catch(e){}};
  ULT_NAV=performance.now();   // el pie nuevo aparece en el mismo lugar que el viejo: un doble toque (en «Saltear», en el micrófono) no tiene que apretar también el botón que aparece
  if(seguir){ctl.innerHTML=`<button type="button" class="btn grande" id="bConvSig">Seguir ➜</button>`;alFoco();return}
  ctl.innerHTML=`<div class="aviso-c" id="convAviso" role="status" aria-live="polite"></div>
   ${ia?`<button type="button" class="mic chico" id="bConvMic" aria-label="Tocar y hablar"><span class="mic-ico" aria-hidden="true">🎤</span><i class="ondas" aria-hidden="true"></i></button><div class="ct"><div class="mic-t" id="convMicT">Tocá el micrófono y contestá</div><div class="nivel" aria-hidden="true"><i id="convNivel"></i></div></div><button type="button" class="btn sec chico" id="bConvSaltar">⏭️ Saltear · Skip</button>`
     :`<div class="ct solo"><div class="mic-t">Contestá en voz alta y tocá ✔</div></div><button type="button" class="btn" id="bConvDije">✔ Lo dijo bien</button><div class="dos"><button type="button" class="btn sec chico" id="bConvRep">🔁 Otra vez</button><button type="button" class="btn sec chico" id="bConvSaltar">⏭️ Saltear · Skip</button></div>`}`;
  const avisar=t=>{const a=$("convAviso");if(a)a.textContent=t||""};
  const vigente=()=>!!C&&C.tok===tok&&C.turnos[C.i]===T;
  $("bConvSaltar").addEventListener("click",()=>{if(!vigente()||T.hecho||bloq())return;if(I1.oral)I1.oral.parar();T.hecho=true;avisar("");convRegistrar(T,"no");convModelo(T)});
  if(!ia){
    $("bConvDije").addEventListener("click",()=>{if(!vigente()||T.hecho||bloq())return;T.hecho=true;burbuja("yo",`<span class="vere ok"><span class="vi" aria-hidden="true">✅</span><span class="vt"><b>¡Correcto!</b><span>Lo dijo bien (lo confirma un grande).</span></span></span>`,"ok");Son.ok();vibrar(15);convRegistrar(T,"ok");convSigue(T)});
    $("bConvRep").addEventListener("click",()=>{if(!vigente()||bloq())return;Voz.decir(T.dice)});
    alFoco();return;
  }
  const mic=$("bConvMic");
  const io={antes:()=>avisar(""),micT:t=>{const e=$("convMicT");if(e)e.textContent=t},
    estado:e=>{const m=$("bConvMic");if(!m)return;m.classList.toggle("oyendo",e==="oyendo");m.classList.toggle("pensando",e==="pensando");m.setAttribute("aria-pressed",String(e==="oyendo"))},
    nivel:v=>{const n=$("convNivel");if(n)n.style.width=Math.min(100,v)+"%"},vigente,aviso:avisar,
    // si la IA se cayó el pie pasa a «Lo dijo bien»: lo que explica el cambio va como nota en el chat (en el pie se perdía al volver a dibujarlo)
    falla:t=>{if(I1.oral.disponible(ST).ia)avisar(t);else{convCtl(T);convNota(t)}},resultado:(ev,texto,x)=>convResultado(T,ev,texto,x)};
  mic.addEventListener("click",()=>hablarUnaVez(T,io));
  alFoco();
}
function convRegistrar(T,res){
  C.res.push({sub:T.sub,ids:T.ids,res,tema:T.tema});if(res==="ok")C.ok++;else if(res==="casi")C.casi++;else C.mal++;
  T.ids.forEach(id=>{if(res!=="casi")anotar(id,res==="ok")});T.ids.forEach(id=>anotarOral(id,res));sumarDia(res!=="no");guardar();
}
function convResultado(T,ev,texto,x){
  T.intentos++;const ultimo=ev.res==="ok"||T.intentos>=2;
  burbuja("yo",vereHTML(ev.res,texto,ultimo&&ev.res!=="ok"?T.mostrar:"",T.dire,x&&x.bajo),ev.res);
  if(ev.res==="ok"){T.hecho=true;convRegistrar(T,"ok");Son.ok();vibrar(15);return convSigue(T)}
  if(!ultimo){Son.mal();const d=ev.res==="casi"?"Almost! Try again.":"Try again!";burbuja("prof",`<p class="rea" lang="en">${d}</p>`);Voz.secuencia([ev.res==="casi"?"Almost!":"Try again!",T.dice]);return}
  T.hecho=true;convRegistrar(T,ev.res);convModelo(T);
}
// la segunda vez que no sale (o «Saltear»): el profe dice cómo era y se sigue con «Seguir»
function convModelo(T){
  burbuja("prof",`<p class="rea" lang="en">Listen: <b>${esc(T.mostrar)}</b></p><p><button type="button" class="oir chico" data-dec="${esc(T.dire)}" aria-label="Listen">🔊</button><button type="button" class="oir chico" data-dec="${esc(T.dire)}" data-lento="1" aria-label="Listen slowly">🐢</button></p>`);
  Voz.decir(T.dire);convCtl(T,true);
}
// después de contestar bien: el profe reacciona y sigue (en la última vuelta se despide y sale el resultado)
async function convSigue(T,sinReaccion){
  const tok=C.tok,ultima=C.i>=C.turnos.length-1;
  C.previa=sinReaccion?(ultima?"OK! See you soon!":elegir(["OK, let's continue!","Let's go on!"])):elegir(T.rea);   // (en la última vuelta no se dice «sigamos»: viene el resultado)
  if(ultima){
    const f=C.previa;C.previa="";burbuja("prof",`<p class="rea" lang="en">${esc(f)}</p>`);$("convCtl").innerHTML="";
    await Voz.decir(f);await pausa(window.__I1_SIN_ESPERA?30:900);if(C&&C.tok===tok)convFin();return;
  }
  C.foco=$("convCtl").contains(document.activeElement);$("convCtl").innerHTML="";   // (si el teclado estaba en el pie, pasa al pie de la vuelta que sigue)
  await pausa(window.__I1_SIN_ESPERA?30:700);if(!C||C.tok!==tok)return;
  C.i++;convTurno();
}
function convFin(){
  const total=C.turnos.length,puntos=C.ok+C.casi*.5,pct=puntos/total,est=pct>=.84?3:pct>=.6?2:pct>=.3?1:0;
  ST.rondas++;ST.estrellas+=est;ST.convs.push({f:FECHA(),ok:C.ok,casi:C.casi,n:total});ST.convs=ST.convs.slice(-10);guardar();Son.fin();
  const repasar=C.res.filter(r=>r.res!=="ok").map(r=>C.turnos.find(t=>t.sub===r.sub)).filter(Boolean);
  const msg=est===3?"Excellent!":est===2?"Very good!":est===1?"Good job!":"Let's talk again!";
  $("pFin").innerHTML=`<section class="fin"><div class="fin-ests" role="img" aria-label="${est} de 3 estrellas">${estrellas(est)}</div><h1>${msg}</h1>
    <p class="fin-cuenta"><b>${C.ok}</b> de ${total} bien${C.casi?` · ${C.casi} casi`:""}</p>
    ${repasar.length?`<h2>Para repasar</h2><ul class="repaso">${repasar.map(t=>`<li><button type="button" class="oir chico" data-dec="${esc(t.dire)}" aria-label="Listen">🔊</button><span><b lang="en">${esc(t.dice)}</b> → <span lang="en">${esc(t.mostrar)}</span></span></li>`).join("")}</ul>`:""}
    <button type="button" class="btn grande" id="bConvOtra">💬 Otra conversación</button><button type="button" class="btn sec" id="bInicio">🏠 Inicio</button></section>`;
  C=null;ir("pFin");Voz.decir(msg);
}
async function convEmpezar(){
  if(EMPEZANDO)return;EMPEZANDO=true;
  try{
    Son.init();Voz.desbloquear();
    const permiso=I1.oral?await I1.oral.preparar(ST):"off";
    C={turnos:armarConv(),i:0,ok:0,casi:0,mal:0,res:[],tok:0,permiso,previa:""};
    pintarConv();ir("pConv");
    convNota(I1.oral?I1.oral.msgPermiso(permiso):"");   // (sin permiso de micrófono: cómo permitirlo, una sola vez y a la vista; antes se repetía en el pie de cada vuelta y lo llenaba)
    convTurno();
  }finally{EMPEZANDO=false}
}

// ---- «Probar el micrófono» (Ajustes): escucha unos segundos y dice cómo se oyó con la sensibilidad elegida. No se manda nada a la IA.
let PROBANDO=false;
async function probarMic(){
  if(PROBANDO||!I1.oral||!I1.oral.probar)return;PROBANDO=true;
  const b=$("ajProbarMic"),t=$("ajMicRes"),n=$("ajNivel"),dec=x=>{if(t)t.textContent=x};
  if(b)b.disabled=true;Voz.parar();Son.init();dec("Abriendo el micrófono…");
  try{
    const r=await I1.oral.probar({mic:ST.mic,alAbrir:()=>dec("Decí algo, por ejemplo: «Hello, my name is…»"),onNivel:v=>{const e=$("ajNivel");if(e)e.style.width=Math.min(100,v)+"%"},
      onBajo:()=>dec("Te oigo muy bajito: acercate y hablá más fuerte"),onVoz:()=>dec("Te escucho…")});
    const m={bien:"✅ Se oye bien. Con esta sensibilidad el micrófono anda.",bajito:"🔉 Se oye muy bajito. Acercate al aparato, hablá más fuerte o subí la sensibilidad (arriba).",
      fuerte:"🔊 Se oye muy fuerte: alejate un poco o bajá la sensibilidad.",nada:"🤫 No se oyó nada. ¿Está tapado el micrófono o el volumen del aparato en cero?"}[r.res];
    dec(r.res==="error"?r.msg:r.res==="cancelado"?"":m||"");
  }finally{PROBANDO=false;const e=$("ajNivel");if(e)e.style.width="0%";const bb=$("ajProbarMic");if(bb)bb.disabled=false}
}

// ---------------- los toques (un solo oyente en el documento)
document.addEventListener("click",e=>{
  const b=e.target.closest&&e.target.closest("button,.card,.fr");if(!b)return;
  if(!window.__I1_SIN_ESPERA&&false)return;
  Son.init();Voz.desbloquear();
  if(b.classList.contains("oir")&&b.dataset.dec){return Voz.decir(b.dataset.dec,b.dataset.lento==="1")}
  if(b.id==="bOir"&&R){return Voz.secuencia(dichosInicio(R.qs[R.i]))}
  if(b.classList.contains("card")&&b.dataset.k){if(b.dataset.ej){Voz.secuencia([b.dataset.k,b.dataset.ej])}else Voz.decir(b.dataset.k);b.classList.remove("late");void b.offsetWidth;b.classList.add("late");return}
  if(b.classList.contains("fr")&&b.dataset.dec)return Voz.decir(b.dataset.dec);
  if(b.dataset&&b.dataset.act==="atras"){if(bloq())return;pintarInicio();ir("pInicio");return}   // («←» de las pantallas de tema, prueba y ajustes: no es un id porque se repite en varias pantallas)
  if(b.dataset&&b.dataset.modo){if(bloq())return;return empezar(b.dataset.modo,null)}
  if(b.classList.contains("tema")&&b.dataset.tema){if(bloq())return;if(b.closest("#pFin")){pintarTema(b.dataset.tema);return ligarEstudio()}pintarTema(b.dataset.tema);return ligarEstudio()}
  switch(b.id){
    case "bPrueba":if(!bloq())pintarPrueba();return;
    case "bEmpPrueba":if(!bloq())empezarPrueba();return;
    case "bEmpOral":if(!bloq())empezarOralPrueba();return;
    case "bSinOral":if(!bloq())terminarPrueba();return;
    case "bOtraPrueba":if(!bloq())empezarPrueba();return;
    case "bEsc":if(!bloq())empezar("escrito",TEMA_ACT.id);return;
    case "bHab":if(!bloq())empezar("oral",TEMA_ACT.id);return;
    case "bSig":if(!bloq())siguiente();return;
    case "bSalir":if(R&&R.modo==="prueba"){confirmar("¿Salir de la prueba? Se pierde lo que hiciste.",()=>{R=null;pintarInicio();ir("pInicio")});return}R=null;pintarInicio();ir("pInicio");return;
    case "bOtra":if(!bloq())empezar(R.modo,R.tema);return;
    case "bInicio":if(!bloq()){R=null;C=null;pintarInicio();ir("pInicio")}return;
    case "bConv":if(!bloq())convEmpezar();return;
    case "bConvOtra":if(!bloq())convEmpezar();return;
    case "bConvSalir":C=null;pintarInicio();ir("pInicio");return;
    case "bConvSig":if(C&&!bloq()){const T=C.turnos[C.i];if(T&&T.hecho)convSigue(T,true)}return;
    case "ajProbarMic":if(!bloq())probarMic();return;
    case "ajProbar":Voz.decir("Hello! Let's learn English!").then(()=>{const p=$("ajProbado");if(p)p.textContent="Si lo escuchaste, la voz anda."});return;
    case "ajBorrar":confirmar("¿Borrar todo lo que hizo (palabras aprendidas, estrellas y días)? No se puede deshacer.",()=>{try{localStorage.removeItem(KEY)}catch(x){}ST=cargar();pintarInicio();ir("pInicio")});return;
  }
});
document.addEventListener("change",e=>{
  const i=e.target.id;if(!i||i.indexOf("aj")!==0)return;
  if(i==="ajVozOn")ST.voz=e.target.checked;else if(i==="ajSon")ST.sonido=e.target.checked;else if(i==="ajEs")ST.es=e.target.checked;else if(i==="ajExtra")ST.extra=e.target.checked;
  else if(i==="ajIA")ST.ia=e.target.checked;else if(i==="ajVel")ST.vel=e.target.value==="lenta"||e.target.value==="rapida"?e.target.value:"normal";
  else if(i==="ajVoz"){ST.vozNombre=String(e.target.value||"").slice(0,160);Voz.elegir()}
  else if(i==="ajMic")ST.mic=e.target.value==="normal"||e.target.value==="muy"?e.target.value:"alta";
  guardar();
});
document.addEventListener("input",e=>{if(e.target.id==="ajNombre"){ST.nombre=e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' -]/g,"").slice(0,16);guardar()}});
function confirmar(msg,si){
  const m=$("modal"),previo=document.activeElement;m.hidden=false;m.innerHTML=`<div class="modal-caja" role="dialog" aria-modal="true" aria-label="${esc(msg)}"><p>${esc(msg)}</p><button type="button" class="btn peligro" id="mSi">Sí</button><button type="button" class="btn sec" id="mNo">No, seguir</button></div>`;
  const tecla=e=>{if(e.key==="Escape"){e.preventDefault();cerrarM()}};
  const cerrarM=()=>{m.hidden=true;m.innerHTML="";document.removeEventListener("keydown",tecla,true);try{if(previo&&previo.focus&&document.contains(previo))previo.focus({preventScroll:true})}catch(e){}};
  document.addEventListener("keydown",tecla,true);
  $("mSi").onclick=()=>{cerrarM();si()};$("mNo").onclick=cerrarM;try{$("mNo").focus()}catch(e){}
}
document.addEventListener("visibilitychange",()=>{if(document.hidden){Voz.parar();if(I1.oral&&I1.oral.parar)I1.oral.parar()}});

// ---------------- arranque
function arrancar(){
  pintarInicio();ir("pInicio",true);
  // para las pruebas
  window.I1_T={estado:()=>ST,ronda:()=>R,armarRonda,armarPrueba,GEN,ORAL,dominio,estrellasDe,empezar,generar,pintarTema,cargar,usa,itemsDe,Voz,fraseDe,gusta,art,opcionesVoces,pintarAjustes,
    // muestra UNA pregunta ya armada (para mirar cada tipo en pantalla)
    probar:(q,modo)=>{R={modo:modo||"escrito",parte:modo==="oral"?"oral":"escrita",tema:q.tema,qs:[q],i:0,ok:0,casi:0,mal:0,res:[],tok:0,permiso:"ok"};ir("pPreg");mostrar()},
    terminarParte,pintarInicio,pintarPrueba,empezarPrueba,pintarPruebaOral,empezarOralPrueba,terminarPrueba,ir,
    armarConv,conv:()=>C,convEmpezar,vereHTML,
    // arma una conversación a medias, sin micrófono (para mirar cómo se ve): n vueltas ya contestadas (bien, casi, mal…) y la que sigue
    convDemo:(n,permiso)=>{C={turnos:armarConv(),i:0,ok:0,casi:0,mal:0,res:[],tok:0,permiso:permiso||"ok",previa:""};pintarConv();ir("pConv");convNota(I1.oral.msgPermiso(C.permiso));
      const res=["ok","casi","no","ok"];for(let k=0;k<n;k++){convTurno(true);const T=C.turnos[C.i],r=res[k%res.length];burbuja("yo",vereHTML(r,r==="no"?"banana":T.dire,r==="ok"?"":T.mostrar,T.dire),r);if(r!=="ok")burbuja("prof",`<p class="rea" lang="en">Listen: <b>${esc(T.mostrar)}</b></p>`);C.previa=elegir(T.rea);C.i++}convTurno(true)}};
}
arrancar();
})();
