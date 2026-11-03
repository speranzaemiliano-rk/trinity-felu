// «Sala de 5» · los juegos. Para una nena de 5 años que todavía no lee: se habla con voz grabada, se contesta tocando dibujos grandes y nunca hay «mal»:
// si se equivoca, la voz dice «Probá de nuevo», a la segunda el bueno late y a la tercera se le muestra. Cada ronda son 5 preguntas y da una pegatina.
(function(){
"use strict";
const S5=window.S5,C=S5.C,$=id=>document.getElementById(id);
const azar=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const elegir=a=>a[Math.floor(Math.random()*a.length)];
const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sacar=(a,n)=>mezclar(a).slice(0,n);
const pausa=ms=>new Promise(r=>setTimeout(r,ms));

// ---------------- lo que se recuerda en este aparato (nada sale de acá)
const KEY="sala5_estado";
const PEGATINAS=["🦄","🐶","🐱","🐼","🦁","🐯","🐸","🐵","🐰","🦊","🐻","🐨","🐮","🐷","🐥","🦋","🐞","🐝","🐢","🐙","🐬","🐳","🦖","🦒","🐘","🌈","🍭","🎈","🚀","🌟"];
const LIMPIAR_NOMBRE=s=>String(s||"").replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]/g,"").trim().slice(0,14);
const VELOCIDADES=[1,1.25,1.5];   // de la voz: normal, rápida (la de siempre) y muy rápida
const FECHA=d=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const NUM=(x,max)=>Number.isFinite(+x)?Math.max(0,Math.min(max||1e9,Math.floor(+x))):0;
function cargar(){   // lo guardado se revisa campo por campo: si alguien lo tocó o quedó a medias, no rompe nada
  const base={v:2,nombre:"",voz:true,vel:1.25,dif:0,min:false,juegos:{},peg:[],rondas:0,bien:0,mal:0,dias:{},fallas:{}};
  try{
    const o=JSON.parse(localStorage.getItem(KEY)||"null");
    if(o&&typeof o==="object"&&!Array.isArray(o)){
      base.nombre=typeof o.nombre==="string"?LIMPIAR_NOMBRE(o.nombre):"";
      base.voz=o.voz!==false;base.vel=VELOCIDADES.includes(+o.vel)?+o.vel:1.25;base.dif=o.dif===1||o.dif==="1"?1:0;base.min=o.min===true;base.rondas=NUM(o.rondas);
      base.bien=NUM(o.bien);base.mal=NUM(o.mal);
      if(o.juegos&&typeof o.juegos==="object"&&!Array.isArray(o.juegos))Object.keys(o.juegos).forEach(id=>{const g=o.juegos[id];if(g&&typeof g==="object")base.juegos[id]={nivel:Math.max(1,NUM(g.nivel,3)),rondas:NUM(g.rondas),perfectas:NUM(g.perfectas),mejor:NUM(g.mejor,5),bien:NUM(g.bien),mal:NUM(g.mal)}});
      if(Array.isArray(o.peg))base.peg=o.peg.filter((i,k,a)=>Number.isInteger(i)&&i>=0&&i<PEGATINAS.length&&a.indexOf(i)===k);
      if(o.dias&&typeof o.dias==="object"&&!Array.isArray(o.dias))Object.keys(o.dias).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(o.dias[k])).sort().slice(-60).forEach(k=>{base.dias[k]=[NUM(o.dias[k][0]),NUM(o.dias[k][1])]});
      if(o.fallas&&typeof o.fallas==="object"&&!Array.isArray(o.fallas))Object.keys(o.fallas).filter(k=>k&&k.length<=60&&NUM(o.fallas[k])>0).sort((a,b)=>NUM(o.fallas[b])-NUM(o.fallas[a])).slice(0,150).forEach(k=>{base.fallas[k]=NUM(o.fallas[k])});
    }
  }catch(e){}
  return base;
}
let ST=cargar();
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}

// ---------------- voz (mp3 grabados) y sonidos
const HAY=new Set(window.S5_AUDIO||[]);
S5.hablados=[];   // para las pruebas: cada clave que se pidió
const Voz={
  a:new Audio(),seq:0,fin:null,
  uno(k){
    return new Promise(res=>{
      S5.hablados.push(k);
      if(!ST.voz)return res();
      const a=Voz.a;let listo=false,local=false;
      // «fin» sólo suelta lo suyo: si ya empezó otra frase, una espera vieja no le puede apagar los avisos a la nueva (si no, tocar rápido dejaba frases colgadas 9 segundos)
      const fin=()=>{if(listo)return;listo=true;clearTimeout(t);if(Voz.fin===fin){Voz.fin=null;a.onended=a.onerror=null}res()};
      const t=setTimeout(fin,9000);Voz.fin=fin;
      if(!HAY.has(k)){hablarLocal(k,fin);return}   // sin mp3 (no debería pasar): la voz del aparato
      a.onended=fin;
      a.onerror=()=>{if(Voz.fin!==fin||listo)return;local=true;a.onended=a.onerror=null;hablarLocal(k,fin)};   // si el archivo no baja (sin internet), habla el aparato con su voz
      a.src="audio/"+k+".mp3"+(window.S5_AUDIO_V?"?a="+window.S5_AUDIO_V:"");   // (?a=… cambia cuando cambia algún audio: así no suena el viejo que quedó guardado)
      a.defaultPlaybackRate=ST.vel;a.playbackRate=ST.vel;try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}   // velocidad de la voz (el tono no cambia)
      try{const p=a.play();if(p&&p.catch)p.catch(()=>{if(!local)fin()})}catch(e){fin()}
    });
  },
  cortar(){   // lo que esté sonando se corta y su espera termina (no queda nada esperando)
    try{Voz.a.pause()}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}
    if(Voz.fin)Voz.fin();
  },
  async decir(claves){
    const id=++Voz.seq,lista=[].concat(claves).filter(Boolean);
    Voz.cortar();habla(true);   // una frase nueva corta la anterior (tocar rápido no las amontona)
    for(const k of lista){if(id!==Voz.seq)return false;await Voz.uno(k);if(id!==Voz.seq)return false;await pausa(40)}
    if(id===Voz.seq)habla(false);
    return id===Voz.seq;
  },
  parar(){Voz.seq++;Voz.cortar();habla(false)}
};
function habla(on){document.querySelectorAll(".mascota,.mascota-chica").forEach(e=>e.classList.toggle("habla",!!on))}
function hablarLocal(k,fin){
  try{const x=S5.audio[k];if(!x||!window.speechSynthesis)return fin();const u=new SpeechSynthesisUtterance(x.tts);u.lang=x.l==="es"?"es-AR":"en-GB";u.rate=ST.vel;u.volume=1;u.onend=u.onerror=fin;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){fin()}
}
let AC=null;
function sfx(t){   // «ding» al acertar, «bop» suave al errar, fanfarria al terminar (se generan, no son archivos)
  if(!ST.voz)return;
  try{
    AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==="suspended")AC.resume();
    const notas={ok:[[660,0],[880,.11]],no:[[240,0],[200,.1]],fin:[[523,0],[659,.13],[784,.26],[1047,.39]]}[t]||[];
    notas.forEach(([f,d])=>{const o=AC.createOscillator(),g=AC.createGain(),t0=AC.currentTime+d;o.type=t==="no"?"triangle":"sine";o.frequency.value=f;
      g.gain.setValueAtTime(.0001,t0);g.gain.exponentialRampToValueAtTime(.22,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.25);o.connect(g).connect(AC.destination);o.start(t0);o.stop(t0+.28)});
  }catch(e){}
}

// ---------------- armado de cosas para mostrar
const objs=(obj,n,cols,extra,tag)=>{tag=tag||"span";return `<div class="objs${n>10?" muchos":""}" style="--c:${cols}">${Array.from({length:n},(_,i)=>`<${tag} class="obj${extra&&extra(i)?" "+extra(i):""}">${obj}</${tag}>`).join("")}</div>`};
const numOp=(k,ok,decirK)=>({h:`<span class="num">${k}</span>`,ok,decir:decirK?[decirK(k)]:[],aria:String(k)});
function numerales(n,min,max,cant){   // el correcto y vecinos cercanos, mezclados
  const pool=[];for(let k=Math.max(min,n-3);k<=Math.min(max,n+3);k++)if(k!==n)pool.push(k);
  return mezclar([n].concat(sacar(pool,cant-1)));
}
const cheers=l=>elegir(l==="en"?C.CHEERS_EN:C.CHEERS_ES);

// ---------------- los juegos. gen(nivel) devuelve una pregunta:
//   eleccion → {tipo:"eleccion", decir:[claves], est:html, montar(el), opciones:[{h,ok,decir,etiqueta,clase,estilo,aria}], cols, alAcertar:[claves], revelar(el), len:"es"|"en", clave}
//   canasta  → {tipo:"canasta", n, total, obj, decir}     nombre → {tipo:"nombre", letras, decir}
const JUEGOS=[];
const J=(id,area,ico,nom,niv,gen,ocultar,n)=>JUEGOS.push({id,area,ico,nom,niv,gen,ocultar,n:n||5});   // n = preguntas por ronda (5; «Mi nombre» son 3: armar el mismo nombre cinco veces seguidas cansa)

// ===== MATEMÁTICA
J("m_contar","mates","🍎","Contar",3,nivel=>{
  const max=[5,10,20][nivel-1],min=[1,3,11][nivel-1],n=azar(min,max),obj=elegir(C.OBJ);
  return {tipo:"eleccion",clave:"c"+n,decir:[C.ES.cuantos],est:objs(obj,n,5,null,"button"),
    montar:el=>contarToques(el,C.numES),opciones:numerales(n,1,nivel===3?20:max,nivel===1?3:4).map(k=>numOp(k,k===n,C.numES)),alAcertar:[]};
});
J("m_dame","mates","🧺","Poné",2,nivel=>{
  const n=azar(1,nivel===1?5:10);return {tipo:"canasta",clave:"d"+n,rotulo:"Poné "+n+" en la canasta",n,total:Math.min(12,n+azar(2,4)),obj:elegir(C.OBJ),decir:[C.poneCanasta(n)]};
});
J("m_mas","mates","⚖️","Más y menos",3,nivel=>{
  const max=nivel===1?5:10,modo=nivel===1?"mas":elegir(["mas","menos"]);let a,b;
  do{a=azar(1,max);b=azar(1,max)}while(Math.abs(a-b)<(nivel===1?2:1));
  const obj=elegir(C.OBJ),gana=modo==="mas"?Math.max(a,b):Math.min(a,b),col=n=>n<=4?2:n<=9?3:4;
  return {tipo:"eleccion",clave:modo+a+"-"+b,rotulo:(modo==="mas"?"Dónde hay más: ":"Dónde hay menos: ")+a+" y "+b,decir:[modo==="mas"?C.ES.masGrupo:C.ES.menosGrupo],cols:2,
    opciones:[a,b].map(n=>({clase:"panel",estilo:"--c:"+col(n),h:Array.from({length:n},()=>`<span>${obj}</span>`).join(""),ok:n===gana,aria:String(n)})),alAcertar:[]};
});
J("m_sumar","mates","➕","Sumar",2,nivel=>{
  const max=nivel===1?5:10,total=azar(2,max),a=azar(1,total-1),b=total-a,obj=elegir(C.OBJ);
  const g=n=>`<div class="panel" style="--c:${n<=3?n:3}">${Array.from({length:n},()=>`<span>${obj}</span>`).join("")}</div>`;
  return {tipo:"eleccion",clave:a+"+"+b,rotulo:"Sumar: "+a+" + "+b,decir:[C.numES(a),C.ES.mas,C.numES(b),C.ES.cuantosSon],est:`<div class="grupos">${g(a)}<span class="signo">+</span>${g(b)}</div>`,
    opciones:numerales(total,1,max,3).map(k=>numOp(k,k===total,C.numES)),alAcertar:[]};
});
J("m_restar","mates","➖","Restar",2,nivel=>{
  const max=nivel===1?5:10,a=azar(2,max),b=azar(1,a-1),obj=elegir(C.OBJ);
  return {tipo:"eleccion",clave:a+"-"+b,rotulo:"Restar: "+a+" − "+b,decir:[C.numES(a),C.ES.menos,C.numES(b),C.ES.cuantosQuedan],est:objs(obj,a,5,i=>i>=a-b?"tachado":""),
    opciones:numerales(a-b,1,max,3).map(k=>numOp(k,k===a-b,C.numES)),alAcertar:[]};
});
J("m_falta","mates","❓","¿Qué falta?",3,nivel=>{
  const ini=nivel===1?1:nivel===2?azar(1,6):azar(10,16),lim=nivel===3?20:nivel===2?10:5,sec=[0,1,2,3,4].map(i=>ini+i),h=azar(nivel===1?1:0,3),falta=sec[h];
  const cajas=sec.map((n,i)=>i===h?`<span class="caja hueco">?</span>`:`<span class="caja">${n}</span>`).join("");
  return {tipo:"eleccion",clave:"f"+ini+"-"+h,rotulo:"Qué número falta: "+falta,decir:[C.ES.queFalta],est:`<div class="seq" style="--n:5">${cajas}</div>`,opciones:numerales(falta,Math.max(1,ini-1),Math.min(20,Math.max(lim,ini+5)),3).map(k=>numOp(k,k===falta,C.numES)),
    alAcertar:sec.map(C.numES),revelar:el=>{el.querySelector(".hueco").outerHTML=`<span class="caja lleno">${falta}</span>`}};
});
J("m_numeros","mates","7️⃣","Los números",3,nivel=>{
  const [min,max]=[[1,5],[1,10],[10,20]][nivel-1],t=azar(min,max);
  return {tipo:"eleccion",clave:"n"+t,decir:[C.tocaNum(t)],opciones:numerales(t,min,max,nivel===1?3:4).map(k=>numOp(k,k===t,C.numES)),alAcertar:[]};
});
const COL_FIG=["#e53935","#1e88e5","#43a047","#fb8c00","#8e24aa","#f9a825"];
J("m_figuras","mates","🔺","Figuras",3,nivel=>{
  const lista=[["circulo","cuadrado","triangulo"],["circulo","cuadrado","triangulo","rectangulo","estrella","corazon"],["circulo","cuadrado","triangulo","rectangulo","estrella","corazon","rombo","ovalo"]][nivel-1];
  const t=elegir(lista),ops=mezclar([t].concat(sacar(lista.filter(f=>f!==t),nivel===1?2:3))),cols=mezclar(COL_FIG);
  return {tipo:"eleccion",clave:"g"+t,decir:[C.tocaForma(t)],cols:nivel===1?3:2,opciones:ops.map((f,i)=>({h:C.svg(f,cols[i]),ok:f===t,aria:C.FORMAS[f].n})),alAcertar:[]};
});
const FICHAS=[C.punto("#e53935"),C.punto("#1e88e5"),C.punto("#fdd835"),C.punto("#43a047"),C.punto("#8e24aa"),C.punto("#fb8c00"),"🍎","🍌","🐶","🐱","⭐","🌸"];   // los círculos de color se dibujan con CSS (los emoji de círculos de colores son de 2019 y en aparatos más viejos saldrían como cuadrados vacíos)
const PATRONES=[[["A","B","A","B","A"],"B"],[["A","B","A","B","A","B"],"A"],[["A","B","C","A","B"],"C"],[["A","A","B","B","A"],"A"],[["A","B","C","A","B","C"],"A"],[["A","A","B","A","A"],"B"],[["A","B","B","A","B"],"B"],[["A","B","A","C","A"],"B"]];
J("m_patron","mates","🔁","¿Qué sigue?",3,nivel=>{
  const [sec,sig]=elegir(PATRONES.slice(nivel===1?0:nivel===2?2:5,nivel===1?2:nivel===2?5:8)),fs=sacar(FICHAS,3),mapa={A:fs[0],B:fs[1],C:fs[2]};
  const mostrar=sec.map(x=>`<span class="caja">${mapa[x]}</span>`).join("")+`<span class="caja hueco">?</span>`;
  const op=["A","B","C"].filter(x=>x!==sig).slice(0,2).concat(sig);
  return {tipo:"eleccion",clave:"p"+sec.join("")+sig+fs[0],rotulo:"Patrones: ¿qué sigue?",decir:[C.ES.queSigue],est:`<div class="seq" style="--n:${sec.length+1}">${mostrar}</div>`,opciones:mezclar(op).map((x,i)=>({h:`<span class="e">${mapa[x]}</span>`,ok:x===sig,aria:"opción "+(i+1)})),
    alAcertar:[],revelar:el=>{el.querySelector(".hueco").outerHTML=`<span class="caja lleno">${mapa[sig]}</span>`}};
});
J("m_tamano","mates","🐘","Grande y chico",2,nivel=>{
  const e=elegir(["🐶","🍎","⭐","🐱","🚗","🌸","🐻","🎈"]),tam=[["chico","min(8vw,9vh)"],["mediano","min(13vw,15vh)"],["grande","min(19vw,22vh)"]],t=nivel===1?elegir(["grande","chico"]):elegir(["grande","chico","mediano"]);
  return {tipo:"eleccion",clave:"t"+t+e,decir:[t==="grande"?C.ES.grande:t==="chico"?C.ES.chico:C.ES.mediano],cols:3,opciones:mezclar(tam).map(([n,fs])=>({h:`<span class="e" style="font-size:${fs}">${e}</span>`,estilo:"font-size:1rem",ok:n===t,aria:n})),alAcertar:[]};
});

// ===== LENGUA
const VOCALES=["A","E","I","O","U"],FACILES=["M","P","S","L","T"];
J("l_letra","lengua","🔤","Las letras",3,nivel=>{
  const pool=nivel===1?VOCALES:nivel===2?VOCALES.concat(FACILES):C.LETRAS,t=elegir(pool),ops=mezclar([t].concat(sacar(pool.filter(x=>x!==t),nivel===1?2:3)));
  return {tipo:"eleccion",clave:"L"+t,decir:[C.tocaLetraES(t)],cols:nivel===1?3:2,opciones:ops.map(L=>({h:`<span class="let">${L}${nivel===3&&ST.min?`<small style="font-size:.5em;margin-left:.15em">${L.toLowerCase()}</small>`:""}</span>`,ok:L===t,decir:[C.letraES(L)],aria:"letra "+L})),alAcertar:[]};
});
const palabrasCon=f=>C.PAL.filter(f);
J("l_inicial","lengua","🔠","¿Con qué letra empieza?",3,nivel=>{
  const filtro=nivel===1?x=>VOCALES.includes(x.ini)&&!x.ll:nivel===2?x=>"MPSLTNCDB".includes(x.ini)&&!x.ll&&!x.h:x=>!x.ll,w=elegir(palabrasCon(filtro));
  const pool=[...new Set(palabrasCon(filtro).map(x=>x.ini))].filter(x=>x!==w.ini&&!(C.SUENAN_IGUAL[w.ini]||"").includes(x)),ops=mezclar([w.ini].concat(sacar(pool,nivel===3?3:2)));   // (sin B con V, S con Z, C con Q…: suenan igual y la respuesta tendría dos lecturas)
  return {tipo:"eleccion",clave:"i"+w.p,rotulo:"Empieza con "+w.ini+": "+w.p,decir:[C.palClip(w),C.ES.conQue],est:`<div class="grande">${w.e}</div><div class="palabra" aria-hidden="true">&nbsp;</div>`,cols:nivel===3?2:3,ocultar:[0],
    opciones:ops.map(L=>({h:`<span class="let">${L}</span>`,ok:L===w.ini,decir:[C.letraES(L)],aria:"letra "+L})),alAcertar:[],
    revelar:el=>{const p=el.querySelector(".palabra");if(p)p.innerHTML=`<b>${w.p[0].toUpperCase()}</b>${w.p.slice(1).toUpperCase()}`}};
});
J("l_silabas","lengua","👏","Sílabas",2,nivel=>{
  const w=elegir(palabrasCon(x=>x.sil.length<=(nivel===1?3:4)&&!(nivel===2&&x.sil.length===1))),n=w.sil.length;
  return {tipo:"eleccion",clave:"s"+w.p,rotulo:"Sílabas de "+w.p+" ("+n+")",decir:[C.palClip(w),C.ES.silabas],est:`<div class="grande">${w.e}</div><div class="sil" id="silabas"></div>`,cols:nivel===1?3:4,
    opciones:Array.from({length:nivel===1?3:4},(_,i)=>numOp(i+1,i+1===n,C.numES)),alAcertar:[C.palClip(w)],
    revelar:el=>{const s=el.querySelector("#silabas");if(s)s.innerHTML=w.sil.map((x,i)=>`<span style="animation-delay:${i*.28}s">${x.toUpperCase()}</span>`).join("")}};
});
const rimaPorPalabra=p=>C.RIMAS.find(g=>g.includes(p));
J("l_rima","lengua","🎵","Rimas",2,nivel=>{
  const g=elegir(C.RIMAS.filter(g=>g.length>=2)),t=C.PALBY[elegir(g)],c=C.PALBY[elegir(g.filter(p=>p!==t.p))];
  const otros=C.PAL.filter(x=>rimaPorPalabra(x.p)&&rimaPorPalabra(x.p)!==g&&x.ase!==t.ase&&!x.ll),ds=[];
  mezclar(otros).forEach(x=>{if(ds.length<(nivel===1?2:3)&&!ds.some(y=>rimaPorPalabra(y.p)===rimaPorPalabra(x.p)))ds.push(x)});
  return {tipo:"eleccion",clave:"r"+t.p+c.p,rotulo:"Rima: "+t.p+" con "+c.p,decir:[C.rimaClip(t.p)],est:`<div class="grande">${t.e}</div>`,cols:nivel===1?3:2,
    opciones:mezclar([c].concat(ds)).map(x=>({h:`<span class="e">${x.e}</span>`,ok:x===c,decir:[C.palClip(x)],aria:x.p})),alAcertar:[]};
});
J("l_palabra","lengua","🖼️","Palabras",2,nivel=>{
  const w=elegir(C.PAL),ops=mezclar([w].concat(sacar(C.PAL.filter(x=>x!==w&&x.e!==w.e&&!C.ambPal(x,w)),nivel===1?2:3)));
  return {tipo:"eleccion",clave:"w"+w.p,decir:[C.ES.toca,C.palArtClip(w)],cols:nivel===1?3:2,opciones:ops.map(x=>({h:`<span class="e">${x.e}</span>`,ok:x===w,aria:x.p,etiqueta:x===w?x.p.toUpperCase():""})),alAcertar:[]};
});
J("l_leer","lengua","📖","Leer",3,nivel=>{
  const largo=x=>nivel===1?x.n<=4:nivel===2?x.n>=4&&x.n<=6:x.n>=5,w=elegir(C.PAL.filter(largo));
  const ds=[];mezclar(C.PAL.filter(x=>largo(x)&&x.p[0]!==w.p[0])).forEach(x=>{if(ds.length<(nivel===1?2:3)&&!ds.some(y=>y.p[0]===x.p[0]))ds.push(x)});
  return {tipo:"eleccion",clave:"e"+w.p,decir:[C.ES.tocaPalabra,C.palClip(w)],ocultar:[1],est:"",cols:nivel===1?3:2,
    opciones:mezclar([w].concat(ds)).map(x=>({h:`<span class="pal${x.p.length>=8?" muy-larga":x.p.length>=6?" larga":""}">${x.p.toUpperCase()}</span>`,ok:x===w,aria:x.p})),alAcertar:[],
    revelar:el=>{el.innerHTML=`<div class="grande">${w.e}</div>`}};
});
const letrasNombre=()=>[...C.sinAcento((ST.nombre||"").replace(/[ñÑ]/g,"\u0001")).toUpperCase()].map(x=>x==="\u0001"?"Ñ":x).filter(x=>C.LETRAS.includes(x));
J("l_nombre","lengua","✏️","Mi nombre",1,()=>({tipo:"nombre",letras:letrasNombre(),clave:"nombre",rotulo:"Armar su nombre",decir:[C.ES.nombre]}),()=>letrasNombre().length<2,3);

// ===== ENGLISH
function genPack(p,nivel){
  let pool=p.items;
  if(p.id==="abc")pool=p.items.slice(0,nivel===1?8:nivel===2?16:26);
  else if(p.id==="numbers")pool=p.items.slice(0,nivel===1?5:10);
  else if(p.id==="colors")pool=p.items.slice(0,nivel===1?5:10);
  else if(nivel===1)pool=p.items.slice(0,Math.min(8,p.items.length));
  const t=elegir(pool),cant=Math.min(pool.length,nivel===1?3:4),ops=mezclar([t].concat(sacar(pool.filter(x=>x!==t&&!C.ambEn(x,t)),cant-1))),cols=mezclar(COL_FIG);
  return {tipo:"eleccion",clave:p.id+t.w,len:"en",decir:[C.packFrase(p,t)],cols:cant<=3?3:2,
    opciones:ops.map((it,i)=>({h:it.forma?C.svg(it.forma,cols[i]):it.h,ok:it===t,decir:[C.packPalabra(p,it)],aria:it.w,etiqueta:(it===t&&!it.letra&&!it.n&&!it.forma&&p.id!=="colors")?it.w:""})),alAcertar:[]};
}
C.PACKS.forEach(p=>J("e_"+p.id,"ingles",p.ico,p.tit,p.id==="abc"?3:2,nivel=>genPack(p,nivel)));   // (ABC tiene 3 niveles: 8, 16 y las 26 letras)
J("e_contar","ingles","🧮","Count",2,nivel=>{
  const max=nivel===1?5:10,n=azar(1,max),obj=elegir(C.OBJ);
  return {tipo:"eleccion",clave:"ec"+n,len:"en",decir:[C.EN.howMany],est:objs(obj,n,5,null,"button"),
    montar:el=>contarToques(el,C.numEN),opciones:numerales(n,1,max,nivel===1?3:4).map(k=>numOp(k,k===n,C.numEN)),alAcertar:[]};
});

// ---------------- pantalla en curso
const PANT=["pInicio","pArea","pJuego","pAlbum"];
let RONDA=0,Q=null,JACT=null,VOLVER="pInicio",VOLVER_AREA="",BLOQUEO=0;
// A esta edad el doble toque es lo normal: después de cambiar de pantalla se ignoran los toques de un instante (si no, el 2º toque caía sobre lo que había debajo: abría un área, arrancaba un juego, contestaba la 1ª pregunta…)
function bloquear(ms){BLOQUEO=Date.now()+ms}
function ir(p){
  PANT.forEach(x=>{$(x).hidden=x!==p});
  if(p!=="pJuego"){RONDA++;limpiarQ()}
  Voz.parar();window.scrollTo(0,0);bloquear(350);
}
function limpiarQ(){if(Q){clearTimeout(Q.idle);Q.cancelado=true;if(Q.fin)Q.fin(null)}Q=null}
function actualizarPegatinas(){["nPeg","aPeg","gPeg"].forEach(i=>{$(i).textContent=ST.peg.length})}
function saludo(){$("saludo").textContent=ST.nombre?"¡Hola, "+ST.nombre+"!":"¡Hola!"}
function inicio(){ir("pInicio");saludo();actualizarPegatinas()}

// ---- un área: los juegos como botones
const AREAS={lengua:{tit:"Lengua",voz:()=>C.ES.lengua},mates:{tit:"Matemática",voz:()=>C.ES.mates},ingles:{tit:"English",voz:()=>C.ES.ingles}};
function nivelDe(j){const g=ST.juegos[j.id];return Math.max(1,Math.min(j.niv,(g&&g.nivel)||1+ST.dif))}
function abrirArea(a){
  ir("pArea");$("pArea").dataset.area=a;$("aTitulo").textContent=AREAS[a].tit;actualizarPegatinas();
  const lista=JUEGOS.filter(j=>j.area===a&&!(j.ocultar&&j.ocultar()));
  const tiles=$("tiles");tiles.innerHTML=`<button class="tile sorpresa" data-j="*"><span class="tico">🎲</span><span class="tnom">Sorpresa</span></button>`+
    lista.map(j=>{const g=ST.juegos[j.id],n=g?Math.min(g.rondas,5):0;return `<button class="tile" data-j="${j.id}" aria-label="${j.nom}"><span class="tico">${j.ico}</span><span class="tnom">${j.nom}</span><span class="test">${n?"⭐".repeat(n):"　"}</span></button>`}).join("");
  tiles.querySelectorAll(".tile").forEach(b=>b.onclick=()=>{const j=b.dataset.j==="*"?elegir(lista):JUEGOS.find(x=>x.id===b.dataset.j);jugar(j)});
}

// ---- una ronda: 5 preguntas
function puntos(i,N){$("jPuntos").innerHTML=Array.from({length:N||5},(_,k)=>`<i class="${k<i?"ya":k===i?"ahora":""}"></i>`).join("")}
async function jugar(j){
  const id=++RONDA;limpiarQ();Voz.parar();JACT=j;ir("pJuego");RONDA=id;
  $("pJuego").dataset.area=j.area;
  const nivel=nivelDe(j),usadas=new Set(),N=j.n||5;let aciertos=0;
  for(let i=0;i<N;i++){
    puntos(i,N);let q,k=0;do{q=j.gen(nivel,i)}while(q.clave&&usadas.has(q.clave)&&++k<12);usadas.add(q.clave);
    const r=await preguntar(q,id);
    if(id!==RONDA)return;
    if(r)aciertos++;
  }
  puntos(N,N);await pausa(250);if(id!==RONDA)return;
  terminar(j,aciertos,nivel,N);
}
// ---- resultados: cada pregunta que se termina cuenta «bien» (la contestó a la primera) o «mal» (se equivocó o necesitó ayuda); lo mal se anota con un rótulo para ver qué le cuesta
const rotulo=(j,q)=>{if(q.rotulo)return q.rotulo;const ok=(q.opciones||[]).find(o=>o.ok);return j.nom+(ok&&ok.aria?": "+ok.aria:"")};
function registrar(q,ok){
  const j=JACT;if(!j)return;
  const g=ST.juegos[j.id]=ST.juegos[j.id]||{nivel:Math.max(1,1+ST.dif),rondas:0,perfectas:0,mejor:0};
  g.bien=g.bien||0;g.mal=g.mal||0;
  const hoy=FECHA(),d=ST.dias[hoy]=ST.dias[hoy]||[0,0];
  if(ok===true){ST.bien++;g.bien++;d[0]++}
  else{ST.mal++;g.mal++;d[1]++;const r=String(rotulo(j,q)).slice(0,60);ST.fallas[r]=(ST.fallas[r]||0)+1}
  const dias=Object.keys(ST.dias).sort();dias.slice(0,Math.max(0,dias.length-60)).forEach(k=>delete ST.dias[k]);   // sólo los últimos 60 días
  const fs=Object.keys(ST.fallas);if(fs.length>150){fs.sort((a,b)=>ST.fallas[a]-ST.fallas[b]).slice(0,fs.length-150).forEach(k=>delete ST.fallas[k])}
  guardar();
}
function preguntar(q,id){
  return new Promise(res=>{
    const Qc={q,errores:0,resuelta:false,id,fin:res,res:v=>{clearTimeout(Qc.idle);registrar(q,v);res(v)}};
    Q=Qc;
    $("jTexto").textContent=(q.decir||[]).map((k,i)=>q.ocultar&&q.ocultar.includes(i)?"…":(S5.audio[k]?S5.audio[k].tts:"")).join(" ");   // (en «Leer» y «¿Con qué letra empieza?» no se imprime la palabra: sería la respuesta)
    if(q.tipo==="canasta")return canasta(q,id);
    if(q.tipo==="nombre")return nombre(q,id);
    mostrar(q);hablarPregunta();
  });
}
function hablarPregunta(){if(Q){Voz.decir(Q.q.decir);esperar()}}
function esperar(){   // si no toca nada: repite la consigna y después marca la respuesta
  if(!Q)return;clearTimeout(Q.idle);const q=Q;
  q.idle=setTimeout(()=>{if(Q!==q||q.resuelta)return;Voz.decir(q.q.decir);q.idle=setTimeout(()=>{if(Q===q&&!q.resuelta)pista()},10000)},13000);
}
function pista(){if(Q&&Q.ayuda){Q.ayuda();return}document.querySelectorAll("#jOps [data-ok],#jEst [data-ok]").forEach(e=>e.classList.add("pista"))}
const rearmar=()=>{if(Q&&!Q.resuelta)esperar()};
function mostrar(q){
  $("jEst").innerHTML=q.est||"";
  const ops=$("jOps");ops.style.setProperty("--cols",q.cols||q.opciones.length);ops.dataset.n=q.opciones.length;ops.dataset.c=q.cols||q.opciones.length;ops.innerHTML="";
  q.opciones.forEach((o,i)=>{
    const b=document.createElement("button");b.className=o.clase||"op";if(o.estilo)b.setAttribute("style",o.estilo);b.innerHTML=o.h;b.dataset.i=i;if(o.ok)b.dataset.ok="1";b.setAttribute("aria-label",o.aria||"opción");
    b.onclick=()=>elegirOp(i);ops.appendChild(b);
  });
  if(q.montar)q.montar($("jEst"));
}
async function elegirOp(i){
  const Qc=Q;if(!Qc||Qc.resuelta||Qc.q.tipo!=="eleccion")return;
  const id=RONDA,q=Qc.q,o=q.opciones[i],el=$("jOps").children[i],L=q.len||"es";
  clearTimeout(Qc.idle);
  if(o.ok){
    Qc.resuelta=true;sfx("ok");el.classList.add("si");el.classList.remove("pista");
    if(o.etiqueta)el.insertAdjacentHTML("beforeend",`<small>${o.etiqueta}</small>`);
    if(q.revelar)q.revelar($("jEst"));
    await Voz.decir([].concat(o.decir||[],q.alAcertar||[],cheers(L)));
    if(id!==RONDA||Q!==Qc)return;await pausa(250);if(id!==RONDA||Q!==Qc)return;
    Qc.res(Qc.errores===0);
  }else{
    Qc.errores++;sfx("no");el.classList.remove("pista");el.classList.add("no");
    if(Qc.errores>=3){   // se la mostramos: así nunca se queda trabada
      Qc.resuelta=true;const bueno=document.querySelector("#jOps [data-ok]");if(bueno)bueno.classList.add("pista");
      if(q.revelar)q.revelar($("jEst"));
      await Voz.decir([C.ES.esEste].concat((q.opciones.find(x=>x.ok)||{}).decir||[]));
      if(id!==RONDA||Q!==Qc)return;await pausa(700);if(id!==RONDA||Q!==Qc)return;Qc.res(false);
    }else{
      if(Qc.errores===2)pista();
      await Voz.decir([].concat(o.decir||[],C.ES.retry));
      if(Q===Qc&&!Qc.resuelta)esperar();
    }
  }
}
function contarToques(el,numClip){   // tocar cada cosa la cuenta en voz alta: uno, dos, tres…
  let k=0;
  el.querySelectorAll(".obj").forEach(b=>b.onclick=()=>{if(b.classList.contains("contado"))return;k++;b.classList.add("contado");b.insertAdjacentHTML("beforeend",`<span class="cuenta">${k}</span>`);Voz.decir(numClip(k));rearmar()});
}

// ---- «Poné 4 en la canasta»
function canasta(q,id){
  const est=$("jEst"),ops=$("jOps"),Qc=Q;
  est.innerHTML=`<div class="canasta-meta">${q.n}</div><div class="pila"></div><div class="canasta"></div>`;
  ops.style.setProperty("--cols",1);ops.innerHTML=`<button class="listo" aria-label="Listo">✔</button>`;
  const pila=est.querySelector(".pila"),cest=est.querySelector(".canasta"),listo=ops.querySelector(".listo");
  const cuadra=()=>{listo.classList.toggle("pista",cest.children.length===q.n);cest.classList.remove("pista")};   // con la cantidad justa el ✔ late solo
  Qc.ayuda=()=>{if(cest.children.length===q.n)listo.classList.add("pista");else cest.classList.add("pista")};
  const mover=(b,a)=>{a.appendChild(b);cuadra();if(a===cest)Voz.decir(C.numES(cest.children.length));rearmar()};
  for(let i=0;i<q.total;i++){const b=document.createElement("button");b.className="ficha";b.textContent=q.obj;b.setAttribute("aria-label","cosa");b.onclick=()=>{if(Qc.resuelta)return;mover(b,b.parentNode===cest?pila:cest)};pila.appendChild(b)}
  hablarPregunta();
  listo.onclick=async()=>{
    if(Qc.resuelta||Q!==Qc)return;clearTimeout(Qc.idle);
    if(cest.children.length===q.n){
      Qc.resuelta=true;sfx("ok");await Voz.decir([C.numES(q.n),cheers("es")]);if(id!==RONDA||Q!==Qc)return;await pausa(250);if(id!==RONDA||Q!==Qc)return;Qc.res(Qc.errores===0);
    }else{
      Qc.errores++;sfx("no");
      if(Qc.errores>=3){   // se lo armamos
        Qc.resuelta=true;while(cest.children.length<q.n&&pila.firstChild)cest.appendChild(pila.firstChild);while(cest.children.length>q.n)pila.appendChild(cest.lastChild);cuadra();
        await Voz.decir([C.ES.esEste,C.numES(q.n)]);if(id!==RONDA||Q!==Qc)return;await pausa(500);if(id!==RONDA||Q!==Qc)return;Qc.res(false);
      }else{if(Qc.errores===2)Qc.ayuda();await Voz.decir([C.numES(cest.children.length),C.ES.retry]);if(Q===Qc&&!Qc.resuelta)esperar()}
    }
  };
}

// ---- «Mi nombre»: tocar las letras en orden
function nombre(q,id){
  const est=$("jEst"),ops=$("jOps"),Qc=Q,L=q.letras;let pos=0,seguidos=0;
  est.innerHTML=`<div class="huecos">${L.map(()=>`<span class="hueco-l"></span>`).join("")}</div><div class="fichas"></div>`;
  ops.innerHTML="";ops.style.setProperty("--cols",1);
  const huecos=est.querySelectorAll(".hueco-l"),fichas=est.querySelector(".fichas");
  const siguiente=()=>[...fichas.children].find(f=>f.dataset.l===L[pos]&&!f.classList.contains("usada"));
  const marcar=()=>{const f=siguiente();if(f)f.classList.add("pista")};
  Qc.ayuda=marcar;
  const poner=(b,aMano)=>{   // la letra que sigue va a su hueco (aMano: la pusimos nosotros después de tres equivocaciones seguidas)
    const x=b.dataset.l;b.classList.remove("pista");b.classList.add("usada");huecos[pos].textContent=x;huecos[pos].classList.add("puesto");pos++;seguidos=0;sfx("ok");
    const dice=[].concat(aMano?[C.ES.esEste]:[],C.letraES(x));
    if(pos===L.length){Qc.resuelta=true;(async()=>{await Voz.decir(dice.concat(cheers("es")));if(id!==RONDA||Q!==Qc)return;await pausa(350);if(id!==RONDA||Q!==Qc)return;Qc.res(Qc.errores===0)})()}
    else Voz.decir(dice);
  };
  mezclar(L.map((x,i)=>({x,i}))).forEach(({x})=>{
    const b=document.createElement("button");b.className="letra-f";b.textContent=x;b.dataset.l=x;b.setAttribute("aria-label","letra "+x);
    b.onclick=()=>{
      if(Qc.resuelta||b.classList.contains("usada"))return;rearmar();
      if(x===L[pos])poner(b,false);
      else{
        Qc.errores++;seguidos++;sfx("no");b.classList.remove("no");void b.offsetWidth;b.classList.add("no");
        if(seguidos>=3){const f=siguiente();if(f)poner(f,true)}   // nunca se queda trabada
        else{if(seguidos>=2)marcar();Voz.decir(C.ES.retry)}
      }
    };
    fichas.appendChild(b);
  });
  hablarPregunta();
}

// ---- fin de la ronda: sube de nivel solo y da una pegatina
function terminar(j,aciertos,nivel,N){
  const g=ST.juegos[j.id]=ST.juegos[j.id]||{nivel:Math.max(1,1+ST.dif),rondas:0,perfectas:0,mejor:0};
  g.rondas++;if(aciertos===N)g.perfectas++;g.mejor=Math.max(g.mejor||0,aciertos);
  let subio=false;if(aciertos>=Math.min(4,N-1)&&g.nivel<j.niv&&nivel>=g.nivel){g.nivel=Math.min(j.niv,g.nivel+1);subio=true}
  ST.rondas++;
  const libres=PEGATINAS.map((_,i)=>i).filter(i=>!ST.peg.includes(i));let peg=-1;if(libres.length){peg=elegir(libres);ST.peg.push(peg)}
  guardar();actualizarPegatinas();premio(j,aciertos,peg,subio,N);
}
function premio(j,aciertos,peg,subio,N){
  $("premioPeg").textContent=peg>=0?PEGATINAS[peg]:"🏆";
  $("premioTit").textContent=peg>=0?"¡Ganaste una figurita!":"¡Completaste el álbum!";
  $("premioEst").textContent="⭐".repeat(aciertos)+"☆".repeat(Math.max(0,N-aciertos));
  $("premioRes").textContent="✔ "+aciertos+" bien · ✖ "+Math.max(0,N-aciertos)+" mal";
  $("premio").hidden=false;bloquear(700);sfx("fin");confeti();
  Voz.decir([peg>=0?C.ES.premio:C.ES.albumLleno]);
  $("premioOtra").onclick=()=>{$("premio").hidden=true;jugar(j)};
  $("premioSalir").onclick=()=>{$("premio").hidden=true;abrirArea(j.area)};
}
function confeti(){
  const c=document.createElement("div");c.className="confeti";
  c.innerHTML=Array.from({length:26},()=>`<span style="left:${azar(0,96)}%;animation-duration:${(Math.random()*1.6+1.8).toFixed(2)}s;animation-delay:${(Math.random()*.6).toFixed(2)}s">${elegir(["🎉","⭐","🌟","✨","🎈","💖"])}</span>`).join("");
  document.body.appendChild(c);setTimeout(()=>c.remove(),4200);
}

// ---- las pegatinas
function abrirAlbum(desde){
  VOLVER=desde||"pInicio";if(VOLVER==="pArea")VOLVER_AREA=$("pArea").dataset.area||"";ir("pAlbum");actualizarPegatinas();
  $("pegatinas").innerHTML=PEGATINAS.map((e,i)=>ST.peg.includes(i)?`<div class="peg">${e}</div>`:`<div class="peg no">❔</div>`).join("");
}

// ---- para grandes: se abre manteniendo apretado el ⚙️
const TXT_BORRAR="Borrar figuritas, avances y resultados";
function abrirPadres(){
  $("pNombre").value=ST.nombre||"";$("pVoz").checked=!!ST.voz;$("pVel").value=String(ST.vel);$("pDif").value=String(ST.dif||0);$("pMin").checked=!!ST.min;
  $("pBorrar").textContent=TXT_BORRAR;$("pBorrar").dataset.seguro="";$("padres").hidden=false;
}
const velElegida=()=>VELOCIDADES.includes(+$("pVel").value)?+$("pVel").value:1.25;
function cerrarPadres(){
  ST.nombre=LIMPIAR_NOMBRE($("pNombre").value);ST.voz=$("pVoz").checked;ST.vel=velElegida();ST.dif=+$("pDif").value||0;ST.min=$("pMin").checked;
  guardar();$("padres").hidden=true;bloquear(350);saludo();if(!$("pArea").hidden)abrirArea($("pArea").dataset.area);
}
// ---- resultados para los grandes: cuántas preguntas bien y cuántas mal en todo, hoy, por área, por juego y lo que más le cuesta
const ESC=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const PCT=(b,m)=>b+m?Math.round(100*b/(b+m)):0;
const AREA_NOM={lengua:"Lengua",mates:"Matemática",ingles:"English"};
const filaRes=(nom,b,m,extra)=>`<div class="fila-res"><span class="rnom">${nom}${extra?` <small>${extra}</small>`:""}</span><span class="rb">✔ ${b}</span><span class="rm">✖ ${m}</span><span class="rp">${PCT(b,m)}%</span><span class="barra-res" aria-hidden="true"><i style="width:${PCT(b,m)}%"></i></span></div>`;
function abrirResultados(){
  const tot=ST.bien+ST.mal,hoy=ST.dias[FECHA()]||[0,0];let h="";
  if(!tot)h=`<p class="res-vacio">Todavía no hay resultados. Cuando juegue, van a aparecer acá cuántas preguntas contestó bien y cuántas mal.</p>`;
  else{
    h+=`<div class="res-grande"><div class="res-num bien"><b>${ST.bien}</b><span>✔ bien</span></div><div class="res-num mal"><b>${ST.mal}</b><span>✖ mal</span></div><div class="res-num"><b>${PCT(ST.bien,ST.mal)}%</b><span>de ${tot} en todo</span></div></div>`;
    h+=`<h3>Hoy</h3>`+(hoy[0]+hoy[1]?filaRes("Preguntas de hoy",hoy[0],hoy[1]):`<p class="res-vacio">Hoy todavía no jugó.</p>`);
    const dias=Object.keys(ST.dias).filter(k=>k!==FECHA()).sort().reverse().slice(0,7);
    if(dias.length)h+=`<h3>Días anteriores</h3>`+dias.map(k=>{const f=k.slice(5).split("-");return filaRes(f[1]+"/"+f[0],ST.dias[k][0],ST.dias[k][1])}).join("");
    h+=`<h3>Por área</h3>`+Object.keys(AREA_NOM).map(a=>{let b=0,m=0;JUEGOS.filter(j=>j.area===a).forEach(j=>{const g=ST.juegos[j.id];if(g){b+=g.bien||0;m+=g.mal||0}});return b+m?filaRes(AREA_NOM[a],b,m):""}).join("");
    h+=`<h3>Por juego</h3>`+JUEGOS.filter(j=>{const g=ST.juegos[j.id];return g&&(g.bien||0)+(g.mal||0)>0}).map(j=>{const g=ST.juegos[j.id];return filaRes(j.ico+" "+ESC(j.nom),g.bien||0,g.mal||0,"nivel "+Math.min(g.nivel,j.niv)+" de "+j.niv)}).join("");
    const f=Object.keys(ST.fallas).sort((a,b)=>ST.fallas[b]-ST.fallas[a]||(a<b?-1:1)).slice(0,10);
    if(f.length)h+=`<h3>Lo que más le cuesta</h3><ul class="res-fallas">`+f.map(k=>`<li>${ESC(k)} <b>✖ ${ST.fallas[k]}</b></li>`).join("")+`</ul>`;
  }
  h+=`<p class="res-nota">Cada pregunta cuenta una vez: <b>✔ bien</b> si la contestó a la primera, <b>✖ mal</b> si se equivocó o necesitó ayuda. Se cuenta desde que se actualizó la app; «Borrar» también borra estos resultados.</p>`;
  $("resCuerpo").innerHTML=h;$("resultados").hidden=false;$("resultados").querySelector(".caja-modal").scrollTop=0;
}
function iniciarEventos(){
  document.addEventListener("click",e=>{if(Date.now()<BLOQUEO&&!window.S5_SIN_BLOQUEO){e.stopPropagation();e.preventDefault()}},true);   // (S5_SIN_BLOQUEO: lo prenden las pruebas para no tener que esperar)
  document.querySelectorAll(".area").forEach(b=>b.onclick=()=>{const a=b.dataset.area;abrirArea(a);Voz.decir(AREAS[a].voz())});
  $("aAtras").onclick=inicio;$("jAtras").onclick=()=>{if(JACT)abrirArea(JACT.area);else inicio()};$("gAtras").onclick=()=>{if(VOLVER==="pArea"&&VOLVER_AREA)abrirArea(VOLVER_AREA);else inicio()};
  $("bAlbum").onclick=()=>abrirAlbum("pInicio");$("aAlbum").onclick=()=>abrirAlbum("pArea");
  $("jRepetir").onclick=()=>{if(Q&&!Q.resuelta)hablarPregunta()};
  const bp=$("bPadres");let tp=null;
  const soltar=()=>{clearTimeout(tp);bp.classList.remove("apretando")};
  bp.addEventListener("pointerdown",()=>{soltar();bp.classList.add("apretando");tp=setTimeout(()=>{soltar();abrirPadres()},1400)});
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>bp.addEventListener(ev,soltar));
  bp.addEventListener("contextmenu",e=>e.preventDefault());
  $("pCerrar").onclick=cerrarPadres;
  $("pProbar").onclick=()=>{ST.vel=velElegida();ST.voz=$("pVoz").checked;Voz.decir(C.ES.hola)};   // para oír cómo suena con lo elegido (se guarda con «Listo»)
  $("pResultados").onclick=abrirResultados;
  $("resCerrar").onclick=()=>{$("resultados").hidden=true;bloquear(350)};
  $("pBorrar").onclick=()=>{
    const b=$("pBorrar");
    if(!b.dataset.seguro){b.dataset.seguro="1";b.dataset.t=String(Date.now());b.textContent="¿Seguro? Tocá otra vez para borrar";setTimeout(()=>{b.dataset.seguro="";b.textContent=TXT_BORRAR},4000);return}
    if(Date.now()-(+b.dataset.t||0)<1200)return;   // un doble toque apurado no alcanza para borrar todo
    ST.juegos={};ST.peg=[];ST.rondas=0;ST.bien=0;ST.mal=0;ST.dias={};ST.fallas={};guardar();actualizarPegatinas();b.dataset.seguro="";b.textContent="Listo: se borró todo";
  };
  $("bJugar").onclick=()=>{
    $("splash").hidden=true;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}
    inicio();Voz.decir(C.ES.hola);
  };
  document.addEventListener("visibilitychange",()=>{if(document.hidden){Voz.parar();if(Q)clearTimeout(Q.idle)}else rearmar()});
}

S5.voz=Voz;S5.juegos=JUEGOS;S5.gen=(id,n)=>JUEGOS.find(j=>j.id===id).gen(n||1);S5.estado=()=>ST;S5.nivelDe=nivelDe;S5.jugar=id=>{jugar(JUEGOS.find(j=>j.id===id))};   // (sin devolver la promesa de toda la ronda: las pruebas no tienen que esperarla)
const ajustarVh=()=>document.documentElement.style.setProperty("--vh",(window.innerHeight/100)+"px");   // «vh» de verdad: el alto que se ve (en Safari con la barra de direcciones, 100vh es más alto que la pantalla visible)
ajustarVh();window.addEventListener("resize",ajustarVh);window.addEventListener("orientationchange",ajustarVh);
iniciarEventos();
$("pInicio").hidden=false;saludo();actualizarPegatinas();
})();
