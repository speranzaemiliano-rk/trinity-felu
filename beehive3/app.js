// «Beehive 3 · Prueba de inglés»: estudiar, practicar y hacer un simulacro de la evaluación de 4.º grado (Units 7 y 8).
// JavaScript vanilla, sin build. Todo queda en este aparato (localStorage «beehive3_estado»); no se manda nada a ningún lado.
// Cómo se aprende: cada palabra o verbo tiene una «caja» (0 a 4, como las cajitas de repaso): si la contestás bien sube, si te equivocás vuelve a la 0 y aparece más seguido.
(function(){
"use strict";
const B3=window.B3,$=id=>document.getElementById(id);
const azar=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const elegir=a=>a[Math.floor(Math.random()*a.length)];
const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sacar=(a,n)=>mezclar(a).slice(0,n);
const pausa=ms=>new Promise(r=>setTimeout(r,ms));
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FECHA=d=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const diasEntre=(a,b)=>{const f=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));return Math.round((f(b)-f(a))/864e5)};
const NUM=(x,max)=>Number.isFinite(+x)?Math.max(0,Math.min(max||1e9,Math.floor(+x))):0;

// ---------------- los temas y los ítems (por id; sin prototipo, así un id raro como «constructor» no existe)
const TEMAS=B3.TEMAS,ITEM=Object.create(null);
TEMAS.forEach(t=>t.items.forEach(it=>{ITEM[it.id]={t,it}}));

// ---------------- lo que se recuerda en este aparato
const KEY="beehive3_estado";
function cargar(){   // lo guardado se revisa campo por campo: si alguien lo tocó o quedó a medias, no rompe nada
  const base={v:1,voz:true,es:true,extra:false,items:Object.create(null),dias:{},sims:[],rondas:0};
  try{
    const o=JSON.parse(localStorage.getItem(KEY)||"null");
    if(o&&typeof o==="object"&&!Array.isArray(o)){
      base.voz=o.voz!==false;base.es=o.es!==false;base.extra=o.extra===true;base.rondas=NUM(o.rondas);
      if(o.items&&typeof o.items==="object"&&!Array.isArray(o.items))Object.keys(o.items).filter(id=>ITEM[id]).forEach(id=>{const e=o.items[id];if(e&&typeof e==="object")base.items[id]={c:NUM(e.c,4),ok:NUM(e.ok),mal:NUM(e.mal),u:/^\d{4}-\d{2}-\d{2}$/.test(String(e.u||""))?e.u:""}});
      if(o.dias&&typeof o.dias==="object"&&!Array.isArray(o.dias))Object.keys(o.dias).filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&Array.isArray(o.dias[k])).sort().slice(-60).forEach(k=>{base.dias[k]=[NUM(o.dias[k][0]),NUM(o.dias[k][1])]});
      if(Array.isArray(o.sims))base.sims=o.sims.slice(-20).filter(s=>s&&typeof s==="object").map(s=>({f:/^\d{4}-\d{2}-\d{2}$/.test(String(s.f||""))?s.f:"",p:NUM(s.p),t:Math.max(1,NUM(s.t,200))}));
    }
  }catch(e){}
  return base;
}
let ST=cargar();
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}

// ---------------- cuáles ítems se usan
const usa=it=>ST.extra||!it.extra;               // los «por si acaso» sólo si se prendió en Ajustes
const itemsDe=t=>t.items.filter(usa);
const caja=id=>{const e=ST.items[id];return e?e.c:-1};   // -1 = todavía no lo vio
function dominio(t){const l=itemsDe(t),ap=l.filter(it=>caja(it.id)>=3).length;return {n:l.length,aprendidas:ap,vistas:l.filter(it=>caja(it.id)>=0).length,pct:l.length?Math.round(100*ap/l.length):0}}
function anotar(id,ok){   // sube o baja la caja de ese ítem
  const e=ST.items[id]=ST.items[id]||{c:0,ok:0,mal:0,u:""};
  if(ok){e.ok++;e.c=Math.min(4,e.c+1)}else{e.mal++;e.c=0}
  e.u=FECHA();
}
function sumarDia(ok){   // «Hoy: n bien · n mal» cuenta PREGUNTAS (un «unir» de 4 pares es una sola)
  const hoy=FECHA(),d=ST.dias[hoy]=ST.dias[hoy]||[0,0];
  if(ok)d[0]++;else d[1]++;
  const dias=Object.keys(ST.dias).sort();dias.slice(0,Math.max(0,dias.length-60)).forEach(k=>delete ST.dias[k]);
}
const aprendiendo=id=>{const e=ST.items[id];return !!e&&e.mal>0&&e.c<2};   // «para repasar»: se equivocó alguna vez y todavía no lo contestó bien dos veces seguidas

// ---------------- voz: audios grabados (inglés británico) y, si falta alguno, la voz del aparato
const HAY=new Set(window.B3_AUDIO||[]);
const Voz={
  a:new Audio(),seq:0,
  uno(k,lento){
    return new Promise(res=>{
      if(!ST.voz)return res();
      const a=Voz.a;let listo=false;
      const fin=()=>{if(listo)return;listo=true;clearTimeout(t);a.onended=a.onerror=null;res()};
      const t=setTimeout(fin,12000);
      const local=()=>{try{const x=B3.audio[k];if(!x||!window.speechSynthesis)return fin();const u=new SpeechSynthesisUtterance(x);u.lang="en-GB";u.rate=lento?.65:.9;u.onend=u.onerror=fin;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){fin()}};
      if(!HAY.has(k))return local();
      a.onended=fin;a.onerror=()=>{a.onended=a.onerror=null;local()};
      a.src="audio/"+k+".mp3"+(window.B3_AUDIO_V?"?a="+window.B3_AUDIO_V:"");
      a.defaultPlaybackRate=lento?.7:1;a.playbackRate=lento?.7:1;try{a.preservesPitch=true;a.webkitPreservesPitch=true}catch(e){}
      try{const p=a.play();if(p&&p.catch)p.catch(fin)}catch(e){fin()}
    });
  },
  async decir(k,lento){if(!k)return;const id=++Voz.seq;Voz.parar();Voz.seq=id;B3.hablados.push(k);await Voz.uno(k,lento)},
  parar(){try{Voz.a.pause()}catch(e){}try{window.speechSynthesis&&speechSynthesis.cancel()}catch(e){}}
};
B3.hablados=[];   // (para las pruebas: cada clave que se pidió)

// ---------------- cómo se comparan las respuestas escritas (mayúsculas, puntos y «did not» = «didn't» no importan)
const NORM=s=>String(s).toLowerCase().replace(/[’‘`´]/g,"'").replace(/[.!?¿¡,;:]/g,"").replace(/\s+/g," ").trim().replace(/\bdid not\b/g,"didn't");
const SINAP=s=>NORM(s).replace(/'/g,"");
const igual=(a,aceptar)=>aceptar.some(x=>NORM(x)===NORM(a)||SINAP(x)===SINAP(a));
const faltaApostrofo=(a,aceptar)=>!aceptar.some(x=>NORM(x)===NORM(a))&&aceptar.some(x=>SINAP(x)===SINAP(a));

// ---------------- armado de preguntas
// Una pregunta es {tipo:"mc"|"tipear"|"ordenar"|"unir", tag, tema, ids:[ítems que se anotan], consigna (en inglés), ayuda (en castellano), cuerpo (html), audio, opciones:[{t,ok}] | aceptar:[…] | fichas+sol | pares, mostrar (la respuesta), explic, hablar}
const ing=v=>v.regla==="doble"?v.base+v.base.slice(-1)+"ing":/e$/.test(v.base)?v.base.slice(0,-1)+"ing":v.base+"ing";
const hueco=(s,x)=>s.replace(x,"____");
const trad=es=>ST.es&&es?`<div class="trad">${esc(es)}</div>`:"";
const opcionesMC=(ok,malas,n)=>{const m=[...new Set(malas.filter(x=>x&&x!==ok))];return mezclar([{t:ok,ok:true}].concat(sacar(m,(n||4)-1).map(t=>({t,ok:false}))))};
const mezclarDistinto=a=>{let m=mezclar(a),k=0;while(m.every((x,i)=>x===a[i])&&++k<12)m=mezclar(a);return m};
// «cuándo / dónde» que se puede poner al principio sin cambiar nada más: «Mia washed the dishes yesterday.» = «Yesterday Mia washed the dishes.»
const ADV=["after the party","for the party","at the party","last night","last week","last year","last Sunday","on Sunday","on Saturday","after dinner","after lunch","in the morning","all morning","all night","at a restaurant","in the garden","in the park","in the river","in the car","on the trip","at home","yesterday"];
const frontales=s=>{const a=ADV.find(x=>s.endsWith(" "+x+"."));return a?[a+" "+s.slice(0,s.length-a.length-2)]:[]};
const fichasDe=s=>{const sol=s.split(" ");let f=mezclar(sol),k=0;while(f.join(" ")===sol.join(" ")&&++k<12)f=mezclar(sol);return {fichas:f,sol}};

// --- vocabulario
function genVocab(t,it,tipo){
  const otros=t.items.filter(x=>x!==it&&usa(x));
  const base={tema:t.id,ids:[it.id]};
  const expl=`${it.en} = ${it.es}`;
  switch(tipo){
    case "emoji2en":return {...base,tipo:"mc",tag:tipo,consigna:"Look and choose.",ayuda:"Mirá el dibujo y elegí la palabra.",cuerpo:`<div class="dib">${it.emoji}</div>`,opciones:opcionesMC(it.en,otros.map(x=>x.en)),mostrar:it.en,explic:expl,hablar:it.k};
    case "audio2en":return {...base,tipo:"mc",tag:tipo,consigna:"Listen and choose.",ayuda:"Escuchá y elegí lo que dice.",cuerpo:`<button class="oir grande" data-k="${it.k}" aria-label="Escuchar">🔊</button>`,audio:it.k,opciones:opcionesMC(it.en,otros.map(x=>x.en)),mostrar:it.en,explic:expl,hablar:it.k};
    case "en2es":return {...base,tipo:"mc",tag:tipo,consigna:"What does it mean?",ayuda:"¿Qué quiere decir?",cuerpo:`<div class="pal">${esc(it.en)}</div><button class="oir" data-k="${it.k}" aria-label="Escuchar">🔊</button>`,opciones:opcionesMC(it.es,otros.map(x=>x.es)),mostrar:it.es,explic:expl,hablar:it.k};
    case "es2en":return {...base,tipo:"mc",tag:tipo,consigna:"How do you say it in English?",ayuda:"¿Cómo se dice en inglés?",cuerpo:`<div class="pal es">${esc(it.es)}</div>`,opciones:opcionesMC(it.en,otros.map(x=>x.en)),mostrar:it.en,explic:expl,hablar:it.k};
    case "cloze":return {...base,tipo:"mc",tag:tipo,consigna:"Read and choose.",ayuda:"Leé y elegí la que completa la oración.",cuerpo:`<div class="frase">${esc(it.ctx).replace("____",'<span class="hueco">____</span>')}</div>`,opciones:opcionesMC(it.en,otros.map(x=>x.en)),mostrar:it.en,explic:expl,hablar:it.kLleno};
    case "spell":return {...base,tipo:"tipear",tag:tipo,consigna:"Listen and write.",ayuda:"Escuchá y escribí la palabra (o la frase).",cuerpo:(it.emoji?`<div class="dib">${it.emoji}</div>`:"")+`<button class="oir grande" data-k="${it.k}" aria-label="Escuchar">🔊</button>`+(ST.es?`<div class="trad">${esc(it.es)}</div>`:""),audio:it.k,aceptar:[it.en],mostrar:it.en,explic:expl,hablar:it.k};
    case "write":return {...base,tipo:"tipear",tag:tipo,consigna:"Look and write.",ayuda:"Mirá el dibujo y escribí la palabra (podés tocar una de la lista).",cuerpo:`<div class="dib">${it.emoji}</div>`,banco:t.items.filter(usa).map(x=>x.en),aceptar:B3.VOCAB.flatMap(x=>x.items).filter(x=>x.emoji&&x.emoji===it.emoji).map(x=>x.en),mostrar:it.en,explic:expl,hablar:it.k};
    case "unir":{
      const l=sacar(t.items.filter(x=>usa(x)),Math.min(4,t.items.filter(usa).length)),conDib=l.every(x=>x.emoji);
      return {tema:t.id,ids:l.map(x=>x.id),tipo:"unir",tag:tipo,consigna:conDib?"Read and number.":"Match.",ayuda:conDib?"Uní cada palabra con su dibujo.":"Uní cada palabra con su traducción.",
        izq:l.map(x=>({t:x.en,id:x.id,k:x.k})),der:(d=>{const m=mezclarDistinto(d.map((_,i)=>i));return m.map(i=>d[i])})(l.map(x=>({t:conDib?x.emoji:x.es,id:x.id,emoji:conDib}))),mostrar:l.map(x=>x.en+" = "+(conDib?x.emoji:x.es)).join("  ·  "),explic:l.map(x=>x.en+" = "+x.es).join("  ·  ")};
    }
  }
  throw new Error("vocab: tipo raro "+tipo);
}
// --- verbos regulares
function malPast(v){return [v.base,ing(v),v.regla==="ed"?"will "+v.base:v.base+"ed"]}
function genReg(t,v,tipo){
  const base={tema:t.id,ids:[v.id]},stem=hueco(v.aff,v.past),stemNeg=hueco(v.neg,"didn't "+v.base),regla=B3.REGLAS[v.regla];
  switch(tipo){
    case "choosePast":return {...base,tipo:"mc",tag:tipo,consigna:"Complete with the past simple.",ayuda:"Completá con el pasado simple.",cuerpo:`<div class="frase">${esc(stem).replace("____",'<span class="hueco">____</span>')} <small>(${v.base})</small></div>${trad(v.affEs)}`,opciones:opcionesMC(v.past,malPast(v)),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kAff};
    case "forma":return {...base,tipo:"mc",tag:tipo,consigna:"What is the past simple?",ayuda:"¿Cuál es el pasado simple?",cuerpo:`<div class="pal">${v.base}</div><div class="trad">${esc(v.es)}</div>`,opciones:opcionesMC(v.past,malPast(v)),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
    case "typePast":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the past simple.",ayuda:"Escribí el pasado simple del verbo.",cuerpo:`<div class="frase">${esc(stem).replace("____",'<span class="hueco">____</span>')} <small>(${v.base})</small></div>${trad(v.affEs)}`,aceptar:[v.past],mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kAff};
    case "chooseNeg":return {...base,tipo:"mc",tag:tipo,consigna:"Make it negative (past simple).",ayuda:"Elegí la forma negativa en pasado.",cuerpo:`<div class="frase">${esc(stemNeg).replace("____",'<span class="hueco">____</span>')} <small>(✘ ${v.base})</small></div>${trad(v.negEs)}`,opciones:opcionesMC("didn't "+v.base,["didn't "+v.past,"not "+v.past,"wasn't "+v.base]),mostrar:"didn't "+v.base,explic:B3.REGLAS.didnt,hablar:v.kNeg};
    case "typeNeg":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the negative.",ayuda:"Escribí la forma negativa (didn't + verbo).",cuerpo:`<div class="frase">${esc(stemNeg).replace("____",'<span class="hueco">____</span>')} <small>(✘ ${v.base})</small></div>${trad(v.negEs)}`,aceptar:["didn't "+v.base],mostrar:"didn't "+v.base,explic:B3.REGLAS.didnt,hablar:v.kNeg};
    case "typeForma":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the verb in the past.",ayuda:"Escribí el verbo en pasado.",cuerpo:`<div class="pal">${v.base}</div>${trad(v.es)}`,aceptar:[v.past],mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
    case "ordenarAff":case "ordenarNeg":{const s=tipo==="ordenarAff"?v.aff:v.neg,f=fichasDe(s);return {...base,tipo:"ordenar",tag:tipo,consigna:"Order the words.",ayuda:"Ordená las palabras para armar la oración (empieza con mayúscula y termina con punto).",cuerpo:trad(tipo==="ordenarAff"?v.affEs:v.negEs),fichas:f.fichas,sol:f.sol,alt:frontales(s),mostrar:s,explic:tipo==="ordenarAff"?regla:B3.REGLAS.didnt,hablar:tipo==="ordenarAff"?v.kAff:v.kNeg}}
    case "spot":{
      const neg=Math.random()<.5,ok=neg?v.neg:v.aff,malas=neg?[v.neg.replace("didn't "+v.base,"didn't "+v.past),v.neg.replace("didn't "+v.base,"not "+v.base),v.aff]:[v.aff.replace(v.past,v.base),v.aff.replace(v.past,"did "+v.past),v.neg];
      return {...base,tipo:"mc",tag:tipo,consigna:"Choose the sentence that matches.",ayuda:"Elegí la oración en inglés que dice lo MISMO que la frase en castellano (mirá el tiempo: ¿hoy o ayer?).",cuerpo:`<div class="trad grande">${esc(neg?v.negEs:v.affEs)}</div>`,opciones:opcionesMC(ok,malas,3),mostrar:ok,explic:neg?B3.REGLAS.didnt:regla,hablar:neg?v.kNeg:v.kAff};
    }
    case "listen":return {...base,tipo:"mc",tag:tipo,consigna:"Listen and choose.",ayuda:"Escuchá y elegí cómo se escribe.",cuerpo:`<button class="oir grande" data-k="${v.kPast}" aria-label="Escuchar">🔊</button>`,audio:v.kPast,opciones:opcionesMC(v.past,malPast(v),3),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
  }
  throw new Error("reg: tipo raro "+tipo);
}
// tabla de «ayer»: ✔ lo hizo (past simple) y ✘ no lo hizo (didn't + base), como en las hojas de la unidad
function genTabla(t,quien){   // «quien» = el verbo por el que se pregunta (si no viene, uno cualquiera)
  const casa=B3.REG.filter(v=>v.casa&&v.obj),vs=mezclar((quien&&casa.includes(quien)?[quien].concat(sacar(casa.filter(v=>v!==quien),2)):sacar(casa,3))),pers=[["Tom","👦"],["Mia","👧"]],celdas=pers.map(()=>vs.map(()=>Math.random()<.5));
  const p=azar(0,1),c=quien&&vs.includes(quien)?vs.indexOf(quien):azar(0,2),v=vs[c],hizo=celdas[p][c],nombre=pers[p][0];
  const filas=pers.map((q,i)=>`<tr><th>${q[1]} ${q[0]}</th>${vs.map((x,j)=>`<td class="${celdas[i][j]?"si":"no"}${i===p&&j===c?" marca":""}">${celdas[i][j]?"✔":"✘"}</td>`).join("")}</tr>`).join("");
  const cab=`<tr><th></th>${vs.map(x=>`<th>${x.emoji}<br><small>${x.base}</small></th>`).join("")}</tr>`;
  const ok=hizo?v.past:"didn't "+v.base;
  return {tema:"regular",ids:[v.id],tipo:"mc",tag:"tabla",consigna:"What did they do yesterday? Look and complete.",ayuda:"¿Qué hicieron ayer? ✔ lo hizo, ✘ no lo hizo.",cuerpo:`<table class="tabla">${cab}${filas}</table><div class="frase">${nombre} <span class="hueco">____</span> ${v.obj}.</div>`,
    opciones:mezclar([{t:ok,ok:true}].concat([hizo?"didn't "+v.base:v.past,v.base,"didn't "+v.past].map(x=>({t:x,ok:false})))),mostrar:`${nombre} ${ok} ${v.obj}.`,explic:hizo?`✔ = lo hizo: pasado simple (${v.past}).`:`✘ = no lo hizo: didn't + ${v.base}.`,hablar:hizo?v.kPast:v.kDidnt};
}
// --- had to
function genHad(t,h,tipo){
  const base={tema:t.id,ids:[h.id]},expl=B3.REGLAS.hadto;
  const aff=h.aff,neg=h.neg,huecoAff=hueco(aff,"had to"),huecoNeg=hueco(neg,"didn't have to");
  const malas=s=>[s.replace("had to","has to"),s.replace("had to","have to"),s.replace("didn't have to","didn't had to"),s.replace("didn't have to","hadn't to")];
  switch(tipo){
    case "choose":{const n=Math.random()<.5;return {...base,tipo:"mc",tag:tipo,consigna:"Complete the sentence.",ayuda:n?"✘ = no tuvo que: elegí la forma negativa.":"✔ = tuvo que: elegí la forma afirmativa.",cuerpo:`<div class="frase">${esc(n?huecoNeg:huecoAff).replace("____",'<span class="hueco">____</span>')} <small>${n?"✘":"✔"}</small></div>${trad(n?h.negEs:h.affEs)}`,opciones:opcionesMC(n?"didn't have to":"had to",n?["didn't had to","hadn't to","had to","not had to"]:["has to","have to","didn't have to","had"]),mostrar:n?"didn't have to":"had to",explic:expl,hablar:n?h.kNeg:h.kAff}}
    case "typeFill":{const n=Math.random()<.5;return {...base,tipo:"tipear",tag:tipo,consigna:"Complete the sentence.",ayuda:n?"✘ = no tuvo que: escribí didn't have to.":"✔ = tuvo que: escribí had to.",cuerpo:`<div class="frase">${esc(n?huecoNeg:huecoAff).replace("____",'<span class="hueco">____</span>')} <small>${n?"✘":"✔"}</small></div>${trad(n?h.negEs:h.affEs)}`,aceptar:[n?"didn't have to":"had to"],mostrar:n?"didn't have to":"had to",explic:expl,hablar:n?h.kNeg:h.kAff}}
    case "ordenarAff":case "ordenarNeg":{const a=tipo==="ordenarAff",s=a?aff:neg,f=fichasDe(s);return {...base,tipo:"ordenar",tag:tipo,consigna:"Order the words.",ayuda:"Ordená las palabras para armar la oración (empieza con mayúscula y termina con punto).",cuerpo:trad(a?h.affEs:h.negEs),fichas:f.fichas,sol:f.sol,alt:frontales(s),mostrar:s,explic:expl,hablar:a?h.kAff:h.kNeg}}
    case "lista":{   // «Look at the to-do list and write sentences with had to» (p. 89)
      const L=B3.LISTAS.find(l=>l.items.some(e=>e.id===h.id)),e=L.items.find(x=>x.id===h.id);
      const filas=L.items.map(x=>`<li><span class="cb" aria-hidden="true">☐</span> ${esc(x.task)} – <b>${esc(x.who)}</b></li>`).join("");
      return {...base,tipo:"tipear",tag:tipo,consigna:"Look at the to-do list and complete with had to.",ayuda:"Mirá la lista y escribí lo que tuvo que hacer (had to + lo que hizo).",pista:"had to …",cuerpo:`<div class="todo"><b>${esc(L.titulo)}…</b><ul>${filas}</ul></div><div class="frase">Before the party, ${esc(e.who)} <span class="hueco">____</span>.</div>${trad(e.es)}`,aceptar:["had to "+e.task,e.who+" had to "+e.task],mostrar:"had to "+e.task,explic:expl,hablar:e.k}
    }
    case "es2en":{const n=Math.random()<.5,ok=n?neg:aff;return {...base,tipo:"mc",tag:tipo,consigna:"How do you say it in English?",ayuda:"¿Cómo se dice en inglés?",cuerpo:`<div class="trad grande">${esc(n?h.negEs:h.affEs)}</div>`,opciones:opcionesMC(ok,[n?aff:neg].concat(malas(ok)),3),mostrar:ok,explic:expl,hablar:n?h.kNeg:h.kAff}}
    case "spot":{const n=Math.random()<.5,ok=n?neg:aff;return {...base,tipo:"mc",tag:tipo,consigna:"Choose the sentence that matches.",ayuda:"Elegí la oración en inglés que dice lo MISMO que la frase en castellano (mirá el tiempo: ¿hoy o ayer?).",cuerpo:`<div class="trad grande">${esc(n?h.negEs:h.affEs)}</div>`,opciones:opcionesMC(ok,malas(ok),3),mostrar:ok,explic:expl,hablar:n?h.kNeg:h.kAff}}
  }
  throw new Error("hadto: tipo raro "+tipo);
}
// --- verbos irregulares
function genIrr(t,v,tipo){
  if(v.be)return genBe(t);
  const base={tema:t.id,ids:[v.id]},stem=hueco(v.aff,v.past),stemNeg=hueco(v.neg,"didn't "+v.base),regla=B3.REGLAS.irr,otros=B3.IRR.filter(x=>x!==v&&usa(x));
  switch(tipo){
    case "choosePast":return {...base,tipo:"mc",tag:tipo,consigna:"Complete with the past simple.",ayuda:"Completá con el pasado simple.",cuerpo:`<div class="frase">${esc(stem).replace("____",'<span class="hueco">____</span>')} <small>(${v.base})</small></div>${trad(v.affEs)}`,opciones:opcionesMC(v.past,v.mal.concat([v.base])),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kAff};
    case "baseToPast":return {...base,tipo:"mc",tag:tipo,consigna:"What is the past simple?",ayuda:"¿Cuál es el pasado simple?",cuerpo:`<div class="pal">${v.base}</div><div class="trad">${esc(v.es)}</div>`,opciones:opcionesMC(v.past,v.mal.concat(otros.map(x=>x.past))),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
    case "pastToBase":return {...base,tipo:"mc",tag:tipo,consigna:"What is the verb?",ayuda:"¿Cuál es el verbo (la forma base)?",cuerpo:`<div class="pal">${v.past}</div><button class="oir" data-k="${v.kPast}" aria-label="Escuchar">🔊</button>`,opciones:opcionesMC(v.base,otros.map(x=>x.base)),mostrar:v.base,explic:`${v.past} = pasado de ${v.base}. ${regla}`,hablar:v.kBase};
    case "typePast":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the past simple.",ayuda:"Escribí el pasado simple del verbo.",cuerpo:`<div class="frase">${esc(stem).replace("____",'<span class="hueco">____</span>')} <small>(${v.base})</small></div>${trad(v.affEs)}`,aceptar:[v.past],mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kAff};
    case "chooseNeg":return {...base,tipo:"mc",tag:tipo,consigna:"Make it negative (past simple).",ayuda:"Elegí la forma negativa en pasado.",cuerpo:`<div class="frase">${esc(stemNeg).replace("____",'<span class="hueco">____</span>')} <small>(✘ ${v.base})</small></div>${trad(v.negEs)}`,opciones:opcionesMC("didn't "+v.base,["didn't "+v.past,"not "+v.past,"wasn't "+v.base]),mostrar:"didn't "+v.base,explic:B3.REGLAS.irrNeg,hablar:v.kNeg};
    case "typeForma":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the verb in the past.",ayuda:"Escribí el verbo en pasado (es irregular).",cuerpo:`<div class="pal">${v.base}</div>${trad(v.es)}`,aceptar:[v.past],mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
    case "typeNeg":return {...base,tipo:"tipear",tag:tipo,consigna:"Write the negative.",ayuda:"Escribí la forma negativa (didn't + verbo en forma base).",cuerpo:`<div class="frase">${esc(stemNeg).replace("____",'<span class="hueco">____</span>')} <small>(✘ ${v.base})</small></div>${trad(v.negEs)}`,aceptar:["didn't "+v.base],mostrar:"didn't "+v.base,explic:B3.REGLAS.irrNeg,hablar:v.kNeg};
    case "ordenarAff":case "ordenarNeg":{const a=tipo==="ordenarAff",s=a?v.aff:v.neg,f=fichasDe(s);return {...base,tipo:"ordenar",tag:tipo,consigna:"Order the words.",ayuda:"Ordená las palabras para armar la oración (empieza con mayúscula y termina con punto).",cuerpo:trad(a?v.affEs:v.negEs),fichas:f.fichas,sol:f.sol,alt:frontales(s),mostrar:s,explic:a?regla:B3.REGLAS.irrNeg,hablar:a?v.kAff:v.kNeg}}
    case "spot":{
      const neg=Math.random()<.5,ok=neg?v.neg:v.aff,malas=neg?[v.neg.replace("didn't "+v.base,"didn't "+v.past),v.neg.replace("didn't "+v.base,"not "+v.base),v.aff]:[v.aff.replace(v.past,v.mal[0]),v.aff.replace(v.past,v.base),v.aff.replace(v.past,"did "+v.past)];
      return {...base,tipo:"mc",tag:tipo,consigna:"Choose the sentence that matches.",ayuda:"Elegí la oración en inglés que dice lo MISMO que la frase en castellano (mirá el tiempo: ¿hoy o ayer?).",cuerpo:`<div class="trad grande">${esc(neg?v.negEs:v.affEs)}</div>`,opciones:opcionesMC(ok,malas,3),mostrar:ok,explic:neg?B3.REGLAS.irrNeg:regla,hablar:neg?v.kNeg:v.kAff};
    }
    case "listen":return {...base,tipo:"mc",tag:tipo,consigna:"Listen and choose.",ayuda:"Escuchá y elegí cómo se escribe.",cuerpo:`<button class="oir grande" data-k="${v.kPast}" aria-label="Escuchar">🔊</button>`,audio:v.kPast,opciones:opcionesMC(v.past,v.mal.concat([v.base]),3),mostrar:v.past,explic:`${v.base} → ${v.past}. ${regla}`,hablar:v.kPast};
    case "escribir":{   // «escribí una oración sobre lo que hiciste (o no) ayer»: con ✔ o ✘ queda UNA sola respuesta
      const neg=Math.random()<.5,ok=neg?`I didn't ${v.cue}.`:`I ${v.past} ${v.cueRest}.`,sin=ok.slice(0,-1);
      return {...base,tipo:"tipear",tag:tipo,consigna:"Write a sentence about yesterday.",ayuda:(neg?"✘ = no lo hiciste: I didn't + verbo.":"✔ = lo hiciste: I + pasado simple.")+" (Si querés, podés agregar «yesterday».)",cuerpo:`<div class="frase"><b>I</b> … <small>(${v.cue}) ${neg?"✘":"✔"}</small></div>`,aceptar:[ok,sin+" yesterday.","Yesterday "+sin+"."],mostrar:ok,explic:neg?B3.REGLAS.irrNeg:`${v.base} → ${v.past}. ${regla}`,hablar:neg?v.kEscNeg:v.kEsc,largo:1};
    }
    case "unir":{
      const l=sacar(B3.IRR.filter(usa).filter(x=>!x.extra||ST.extra),Math.min(5,B3.IRR.filter(usa).length));
      return {tema:t.id,ids:l.map(x=>x.id),tipo:"unir",tag:tipo,consigna:"Match.",ayuda:"Uní cada verbo con su pasado.",izq:l.map(x=>({t:x.base,id:x.id,k:x.kBase})),der:(d=>{const m=mezclarDistinto(d.map((_,i)=>i));return m.map(i=>d[i])})(l.map(x=>({t:x.past,id:x.id,k:x.kPast}))),mostrar:l.map(x=>x.base+" → "+x.past).join("  ·  "),explic:B3.REGLAS.irr};
    }
  }
  throw new Error("irr: tipo raro "+tipo);
}
// was / were
function genBe(t){
  const b=elegir(B3.BE),malas=b.neg?["wasn't","weren't"]:["was","were"];
  return {tema:t.id,ids:["vb_be"],tipo:"mc",tag:"was",consigna:"Read and circle.",ayuda:"Elegí cuál va: "+(b.neg?"wasn't o weren't":"was o were")+".",cuerpo:`<div class="frase">${esc(b.s).replace("____",'<span class="hueco">____</span>')} <small>${b.neg?"✘":"✔"}</small></div>${trad(b.es)}`,opciones:mezclar(malas.map(x=>({t:x,ok:x===b.ok}))),mostrar:b.ok,explic:B3.REGLAS.was,hablar:b.kLleno};
}

// qué tipos de pregunta le tocan a un ítem según su caja (la 0: elegir; la 1 y la 2: ordenar o completar; de la 3 en adelante: escribir, como en la prueba)
const POOLS={
  vocab:[["emoji2en","audio2en","en2es","cloze"],["es2en","cloze","audio2en","write"],["spell","es2en","cloze","write"]],
  regular:[["choosePast","forma","spot","listen","chooseNeg"],["ordenarAff","ordenarNeg","tabla","choosePast","spot"],["typePast","typeForma","typeNeg","ordenarNeg","tabla"]],
  hadto:[["spot","es2en","choose"],["ordenarAff","ordenarNeg","choose","spot","lista"],["ordenarNeg","typeFill","es2en","lista"]],
  irregular:[["choosePast","baseToPast","pastToBase","listen"],["chooseNeg","ordenarAff","ordenarNeg","spot","unir"],["typePast","typeForma","typeNeg","escribir","ordenarNeg"]]
};
function tipoPara(t,it,c){
  let pool=POOLS[t.tipo][c<1?0:c<3?1:2].slice();
  if(t.tipo==="vocab"&&!it.emoji)pool=pool.filter(x=>x!=="emoji2en"&&x!=="write");
  if(t.tipo==="regular"&&!(it.casa&&it.obj))pool=pool.filter(x=>x!=="tabla");
  if(t.tipo==="irregular"&&!it.cue)pool=pool.filter(x=>x!=="escribir");
  if(t.tipo==="vocab"&&t.items.filter(usa).length<4)pool=pool.filter(x=>x!=="unir");
  return elegir(pool);
}
function generar(t,it,tipo){
  tipo=tipo||tipoPara(t,it,Math.max(0,caja(it.id)));
  if(t.tipo==="vocab")return genVocab(t,it,tipo);
  if(t.tipo==="regular")return tipo==="tabla"?genTabla(t,it):genReg(t,it,tipo);
  if(t.tipo==="hadto")return genHad(t,it,tipo);
  return genIrr(t,it,tipo);
}
// qué ítem preguntar: los que no sabe o no vio pesan más
const peso=id=>{const e=ST.items[id];if(!e)return 6;const hoy=FECHA();return [8,5,3,2,1][Math.min(4,e.c)]*(1+Math.min(e.u?diasEntre(e.u,hoy):3,3)*.2)};
function elegirItem(lista,evitar){
  const l=lista.filter(x=>!evitar||x.id!==evitar),pes=l.map(x=>peso(x.id)),tot=pes.reduce((a,b)=>a+b,0);let r=Math.random()*tot;
  for(let i=0;i<l.length;i++){r-=pes[i];if(r<=0)return l[i]}
  return l[l.length-1]||lista[0];
}

// ---------------- la ronda en curso (práctica o simulacro)
let R=null;
function ronda(opts){   // opts: {tema, ids (ítems puntuales), n, test, qs}
  const qs=[];
  if(opts.qs)opts.qs.forEach(q=>qs.push(q));
  else{
    const pool=opts.ids?opts.ids.map(id=>ITEM[id]).filter(Boolean):itemsDe(opts.tema).map(it=>({t:opts.tema,it})),n=opts.n||10;let ult=null,unirHecho=false;
    for(let i=0;i<n;i++){
      const x=elegirItem(pool.map(p=>p.it),ult),p=pool.find(y=>y.it===x)||pool[0];ult=x.id;
      let tipo=null;
      if(!opts.ids&&!unirHecho&&i===Math.floor(n/2)&&(p.t.tipo==="vocab"||p.t.tipo==="irregular")&&Math.random()<.7){tipo="unir";unirHecho=true}
      let q;try{q=generar(p.t,p.it,tipo)}catch(e){q=generar(p.t,p.it,"cloze")}
      qs.push(q);
    }
  }
  R={tema:opts.tema||null,qs,i:0,ok:0,mal:0,errores:[],test:!!opts.test,reint:{},titulo:opts.titulo||""};
  mostrarPregunta();
}
const actual=()=>R&&R.qs[R.i];

// ---------------- pantallas
const PANT=["pInicio","pTema","pPreg","pFin","pAjustes"];
function ir(p){PANT.forEach(x=>{$(x).hidden=x!==p});Voz.parar();window.scrollTo(0,0)}
function barra(titulo,atras,extra){return `<header class="barra"><button class="atras" data-ir="${atras}" aria-label="Volver">⬅</button><div class="titulo">${titulo}</div>${extra||"<span></span>"}</header>`}

function recomendado(){
  const l=TEMAS.map(t=>({t,d:dominio(t)})).filter(x=>x.d.pct<100);
  if(!l.length)return null;
  l.sort((a,b)=>a.d.pct-b.d.pct||a.d.vistas-b.d.vistas);
  return l[0].t;
}
function pintarInicio(){
  const hoy=FECHA(),d=diasEntre(hoy,B3.PRUEBA);
  const cuenta=d>1?`Faltan <b>${d} días</b>`:d===1?`<b>¡Es mañana!</b>`:d===0?`<b>¡Es hoy! Mucha suerte</b>`:`La prueba fue el ${B3.PRUEBA_TXT}`;
  const rec=recomendado(),err=Object.keys(ST.items).filter(id=>ITEM[id]&&usa(ITEM[id].it)&&aprendiendo(id)),sims=ST.sims;
  const mejor=sims.length?Math.max(...sims.map(s=>Math.round(100*s.p/s.t))):null;
  const tarjeta=t=>{const m=dominio(t);return `<button class="tema" data-tema="${t.id}" aria-label="${esc(t.nombre)}"><span class="tico">${t.ico}</span><span class="ttxt"><b>${esc(t.nombre)}</b><small>Unit ${t.unit} · p. ${t.pag}</small><span class="prog" aria-hidden="true"><i style="width:${m.pct}%"></i></span><small class="pct">${m.aprendidas} de ${m.n} aprendidas</small></span></button>`};
  $("pInicio").innerHTML=`<header class="barra"><div class="logo">🐝</div><div class="titulo">Beehive 3 · Prueba de inglés</div><button class="atras" data-ir="pAjustes" aria-label="Ajustes">⚙️</button></header>
    <section class="cuenta"><div>${cuenta}</div><small>${B3.PRUEBA_TXT} · Units 7 y 8 · 4.º grado</small></section>
    ${rec?`<button class="seguir" data-tema="${rec.id}">▶ Seguí con: <b>${esc(rec.nombre)}</b><small>${dominio(rec).aprendidas} de ${dominio(rec).n} aprendidas</small></button>`:`<div class="seguir ok">🏆 ¡Aprendiste todo! Hacé un simulacro para confirmarlo.</div>`}
    <h2>Unit 7</h2><div class="temas">${TEMAS.filter(t=>t.unit===7).map(tarjeta).join("")}</div>
    <h2>Unit 8</h2><div class="temas">${TEMAS.filter(t=>t.unit===8).map(tarjeta).join("")}</div>
    <div class="acciones"><button class="btn grande" id="bSim">📝 Simulacro de la prueba<small>${mejor===null?N_SIM+" preguntas, con las mismas actividades que las hojas de la unit":"tu mejor resultado: "+mejor+" %"}</small></button>
      <button class="btn sec" id="bErrores" ${err.length?"":"disabled"}>🔁 Repasar lo que me salió mal<small>${err.length?err.length+(err.length===1?" cosa":" cosas"):"nada por ahora"}</small></button></div>
    <p class="pie">Hoy: ${(ST.dias[hoy]||[0,0])[0]} bien · ${(ST.dias[hoy]||[0,0])[1]} mal</p>`;
}
function pintarTema(t){
  const m=dominio(t),lista=itemsDe(t);let estudio="";
  if(t.tipo==="vocab"){
    estudio=`<div class="cartas">${lista.map(it=>`<div class="carta"><div class="cdib">${it.emoji||"🔤"}</div><div class="cen">${esc(it.en)}</div>${ST.es?`<div class="ces">${esc(it.es)}</div>`:""}<div class="cbot"><button class="oir" data-k="${it.k}" aria-label="Escuchar ${esc(it.en)}">🔊</button><button class="oir" data-k="${it.k}" data-lento="1" aria-label="Escuchar despacio">🐢</button></div><div class="cej" data-k="${it.kLleno}">${esc(it.lleno)} <span>🔊</span></div></div>`).join("")}</div>`+
      (t.util?`<h3>Para hablar</h3><div class="verbos">${t.util.map(u=>`<div class="verbo"><div class="ve" data-k="${u.k}">${esc(u.en)} <span>🔊</span></div>${ST.es?`<div class="vt">${esc(u.es)}</div>`:""}</div>`).join("")}</div>`:"");
  }else if(t.tipo==="regular"){
    const reglas=[["ed","Casi todos: +ed"],["d","Terminan en -e: +d"],["ied","Consonante + y: -ied"],["doble","Una sílaba y consonante-vocal-consonante: se repite la última"]];
    estudio=`<div class="regla"><b>Past simple (regular)</b><p>Afirmativo: <b>verbo + ed</b> → <i>Mia washed the dishes.</i></p><p>Negativo: <b>didn't + verbo (sin -ed)</b> → <i>Mia didn't wash the dishes.</i></p></div>`+
      reglas.map(([r,tt])=>{const vs=lista.filter(v=>v.regla===r);return vs.length?`<h3>${tt}</h3><div class="verbos">${vs.map(v=>`<div class="verbo"><div class="vv"><button class="oir" data-k="${v.kBase}" aria-label="Escuchar ${v.base}">🔊</button> <b>${v.base}</b> → <b class="pas">${v.past}</b> <button class="oir" data-k="${v.kPast}" aria-label="Escuchar ${v.past}">🔊</button></div><div class="ve" data-k="${v.kAff}">${esc(v.aff)} <span>🔊</span></div><div class="ve neg" data-k="${v.kNeg}">${esc(v.neg)} <span>🔊</span></div>${ST.es?`<div class="vt">${esc(v.es)}</div>`:""}</div>`).join("")}</div>`:""}).join("");
  }else if(t.tipo==="hadto"){
    estudio=`<div class="regla"><b>had to / didn't have to</b><p>Afirmativo: <b>had to + verbo</b> → <i>I had to tidy up.</i> (tuve que…)</p><p>Negativo: <b>didn't have to + verbo</b> → <i>I didn't have to tidy up.</i> (no tuve que…)</p><p><i>had to</i> es el pasado de <i>have to</i>: <i>I have to clean my room</i> (hoy) → <i>I had to clean my room</i> (ayer).</p></div>`+
      `<h3>Lista de cosas por hacer (to-do list)</h3><div class="todo"><b>${esc(B3.LISTAS[0].titulo)}…</b><ul>${B3.LISTAS[0].items.map(x=>`<li><span class="cb" aria-hidden="true">☐</span> ${esc(x.task)} – <b>${esc(x.who)}</b></li>`).join("")}</ul></div><div class="verbos">${B3.LISTAS[0].items.map(x=>`<div class="verbo"><div class="ve" data-k="${x.k}">${esc(x.oracion)} <span>🔊</span></div>${ST.es?`<div class="vt">${esc(x.es)}</div>`:""}</div>`).join("")}</div><h3>Más oraciones</h3><div class="verbos">`+lista.map(h=>`<div class="verbo"><div class="ve" data-k="${h.kAff}">${esc(h.aff)} <span>🔊</span></div><div class="ve neg" data-k="${h.kNeg}">${esc(h.neg)} <span>🔊</span></div>${ST.es?`<div class="vt">${esc(h.affEs)}</div>`:""}</div>`).join("")+`</div>`;
  }else{
    estudio=`<div class="regla"><b>Past simple (irregular)</b><p>No llevan -ed: hay que aprenderlos. Negativo: <b>didn't + verbo base</b> → <i>I didn't go.</i></p></div><div class="verbos">`+lista.map(v=>v.be?`<div class="verbo"><div class="vv"><b>be</b> → <b class="pas">was / were</b> <button class="oir" data-k="${B3.kBe.was}" aria-label="Escuchar was">🔊 was</button> <button class="oir" data-k="${B3.kBe.were}" aria-label="Escuchar were">🔊 were</button></div><div class="ve">I <b>was</b> · he / she / it <b>was</b> · we / you / they <b>were</b></div><div class="ve neg">✘ wasn't <button class="oir" data-k="${B3.kBe.wasnt}" aria-label="Escuchar wasn't">🔊</button> · weren't <button class="oir" data-k="${B3.kBe.werent}" aria-label="Escuchar weren't">🔊</button></div></div>`:`<div class="verbo"><div class="vv"><button class="oir" data-k="${v.kBase}" aria-label="Escuchar ${v.base}">🔊</button> <b>${v.base}</b> → <b class="pas">${v.past}</b> <button class="oir" data-k="${v.kPast}" aria-label="Escuchar ${v.past}">🔊</button>${v.extra?` <em class="extra">por si acaso</em>`:""}</div><div class="ve" data-k="${v.kAff}">${esc(v.aff)} <span>🔊</span></div><div class="ve neg" data-k="${v.kNeg}">${esc(v.neg)} <span>🔊</span></div>${ST.es?`<div class="vt">${esc(v.es)}</div>`:""}</div>`).join("")+`</div>`;
  }
  $("pTema").innerHTML=barra(`${t.ico} ${esc(t.nombre)}`,"pInicio")+
    `<div class="sub">Unit ${t.unit} · p. ${t.pag} · ${esc(t.es)}</div>
     <div class="dom"><span class="prog" aria-hidden="true"><i style="width:${m.pct}%"></i></span><small>${m.aprendidas} de ${m.n} aprendidas</small></div>
     <button class="btn grande" id="bPracticar" data-tema="${t.id}">▶ Practicar este tema<small>10 preguntas, las que más te cuestan primero</small></button>
     <h2>Para estudiar</h2>${estudio}`;
  $("pTema").dataset.tema=t.id;
}

// el enunciado de una pregunta en una línea (para la lista «Para repasar»: sin esto no se sabe qué se preguntaba)
function enunciado(q){
  const d=document.createElement("div");d.innerHTML=q.cuerpo||"";
  d.querySelectorAll("table,.todo,button,.trad").forEach(x=>x.remove());
  let t=d.textContent.replace(/\s+/g," ").trim();
  if(!t&&q.audio)t="🔊 (se escuchaba una palabra)";
  if(!t&&q.tipo==="unir")t=q.izq.map(x=>x.t).join(" · ");
  return t.length>120?t.slice(0,117)+"…":t;
}

// ---- una pregunta
function barraPreg(){
  const n=R.qs.length;
  return `<header class="barra"><button class="atras" id="bSalir" aria-label="Salir">✕</button><div class="pasos" aria-label="Pregunta ${R.i+1} de ${n}"><span class="pbar" aria-hidden="true"><i style="width:${Math.round(100*R.i/n)}%"></i></span><small>${R.i+1} / ${n}</small></div><button class="oirtop" id="bOir" aria-label="Escuchar otra vez">🔊</button></header>`;
}
function mostrarPregunta(){
  const q=actual();if(!q){return terminar()}
  ir("pPreg");
  let h=barraPreg()+`${q.parte?`<div class="parte">${esc(q.parte)}</div>`:""}<div class="consigna"><b>${esc(q.consigna)}</b><small>${esc(q.ayuda||"")}</small></div><div class="cuerpo">${q.cuerpo||""}</div>`;
  if(q.tipo==="mc")h+=`<div class="opciones n${q.opciones.length}${q.opciones.some(o=>o.t.length>22)?" largas":""}">${q.opciones.map((o,i)=>`<button class="opcion" data-i="${i}">${esc(o.t)}</button>`).join("")}</div>`;
  else if(q.tipo==="tipear")h+=`${q.banco?`<div class="banco">${q.banco.map(b=>`<button class="chip" data-b="${esc(b)}">${esc(b)}</button>`).join("")}</div>`:""}<input id="resp" class="resp" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${q.pista||(q.largo?"Escribí la oración…":"Escribí acá…")}" aria-label="Tu respuesta"><button class="btn" id="bCheck">Check ✔</button>`;
  else if(q.tipo==="ordenar")h+=`<div class="armada" id="armada" aria-label="Tu oración"></div><div class="fichas" id="fichas">${q.fichas.map((f,i)=>`<button class="ficha" data-f="${i}">${esc(f)}</button>`).join("")}</div><button class="btn" id="bCheck" disabled>Check ✔</button>`;
  else if(q.tipo==="unir")h+=`<div class="unir"><div class="col" id="izq">${q.izq.map((x,i)=>`<button class="par" data-lado="i" data-i="${i}">${esc(x.t)}</button>`).join("")}</div><div class="col" id="der">${q.der.map((x,i)=>`<button class="par${x.emoji?" emo":""}" data-lado="d" data-i="${i}">${esc(x.t)}</button>`).join("")}</div></div>`;
  h+=`<div class="feedback" id="feedback" role="status" aria-live="polite" hidden></div>`;
  $("pPreg").innerHTML=h;
  q.estado={sel:[],pares:0,fallos:0,resuelta:false};
  if(q.tipo==="tipear"){const r=$("resp");r.focus&&setTimeout(()=>{try{r.focus({preventScroll:true})}catch(e){}},50)}
  if(q.audio)Voz.decir(q.audio);
}
function resolver(q,ok,dado){   // se corrigió la pregunta: se anota, se muestra qué pasó y se pasa a la siguiente
  if(q.estado.resuelta)return;q.estado.resuelta=true;
  q.estado.ok=ok;q.estado.dado=dado;
  if(!q.reintento){if(ok)R.ok++;else{R.mal++;R.errores.push(q)}}
  if(q.tipo==="unir"){const malos=new Set(q.estado.malos||[]);q.ids.forEach(id=>anotar(id,!malos.has(id)))}else q.ids.forEach(id=>anotar(id,ok));
  sumarDia(ok);
  // lo que falló vuelve a aparecer al final de la ronda (una sola vez, y esa vuelta no cuenta en el puntaje)
  if(!R.test&&!ok&&!q.reintento&&!R.reint[q.ids.join()]&&q.tipo!=="unir"){R.reint[q.ids.join()]=1;const it=ITEM[q.ids[0]];if(it){try{const r=generar(it.t,it.it,q.tag==="tabla"?"tabla":null);r.reintento=true;R.qs.push(r)}catch(e){}}}
  if(!R.test){
    const fb=$("feedback");fb.hidden=false;fb.className="feedback "+(ok?"bien":"mal");
    fb.innerHTML=`<div class="fbt">${ok?"✔ Very good!":"✘ Casi… la respuesta es:"}</div>${ok?"":`<div class="fbr">${esc(q.mostrar||"")}</div>`}${q.nota?`<div class="fbn">${esc(q.nota)}</div>`:""}<div class="fbe">${esc(q.explic||"")}</div><button class="btn" id="bSig">${R.i+1>=R.qs.length?"Ver resultado":"Next →"}</button>`;
    const b=$("bSig");setTimeout(()=>{try{b&&b.focus({preventScroll:true});fb.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}},30);
    if(q.hablar)Voz.decir(q.hablar);
  }else setTimeout(()=>siguiente(),ok?250:250);
  guardar();
}
function siguiente(){R.i++;if(R.i>=R.qs.length)terminar();else mostrarPregunta()}
function comprobarMC(i){
  const q=actual();if(!q||q.estado.resuelta)return;const o=q.opciones[i],bs=[...$("pPreg").querySelectorAll(".opcion")];
  if(R.test){bs.forEach((b,k)=>{b.disabled=true;if(k===i)b.classList.add("elegida")});return resolver(q,!!o.ok,o.t)}
  bs.forEach((b,k)=>{b.disabled=true;if(q.opciones[k].ok)b.classList.add("si");else if(k===i)b.classList.add("no")});
  resolver(q,!!o.ok,o.t);
}
function comprobarTipear(){
  const q=actual(),r=$("resp");if(!q||q.estado.resuelta||!r)return;const dado=r.value;if(!NORM(dado))return;
  r.disabled=true;const ok=igual(dado,q.aceptar);if(ok&&faltaApostrofo(dado,q.aceptar))q.nota="Ojo: se escribe con apóstrofo → "+q.mostrar;if(!R.test)r.classList.add(ok?"si":"no");resolver(q,ok,dado);
}
function ordenarRefrescar(q){
  const e=q.estado,arm=$("armada");
  arm.innerHTML=e.sel.map((fi,k)=>`<button class="ficha puesta" data-q="${k}">${esc(q.fichas[fi])}</button>`).join("");
  [...$("fichas").children].forEach((b,i)=>b.classList.toggle("usada",e.sel.includes(i)));
  $("bCheck").disabled=e.sel.length!==q.fichas.length;
}
function comprobarOrdenar(){
  const q=actual();if(!q||q.estado.resuelta)return;const e=q.estado,dado=e.sel.map(i=>q.fichas[i]).join(" "),ok=[q.sol.join(" ")].concat(q.alt||[]).some(x=>NORM(dado)===NORM(x));
  $("pPreg").querySelectorAll(".ficha,#bCheck").forEach(b=>b.disabled=true);
  if(!R.test)$("armada").classList.add(ok?"si":"no");resolver(q,ok,dado);
}
function tocarPar(lado,i){
  const q=actual();if(!q||q.estado.resuelta)return;const e=q.estado,bs=$("pPreg").querySelectorAll(".par");
  const btn=$("pPreg").querySelector(`.par[data-lado="${lado}"][data-i="${i}"]`);if(!btn||btn.classList.contains("hecho"))return;
  if(lado==="i"&&q.izq[i].k)Voz.decir(q.izq[i].k);
  if(lado==="d"&&q.der[i].k)Voz.decir(q.der[i].k);
  const prev=e.sel.find(s=>s.lado===lado);
  if(prev){$("pPreg").querySelector(`.par[data-lado="${lado}"][data-i="${prev.i}"]`).classList.remove("elegida");e.sel=e.sel.filter(s=>s.lado!==lado)}
  btn.classList.add("elegida");e.sel.push({lado,i});
  if(e.sel.length===2){
    const a=e.sel.find(s=>s.lado==="i"),d=e.sel.find(s=>s.lado==="d"),ba=$("pPreg").querySelector(`.par[data-lado="i"][data-i="${a.i}"]`),bd=$("pPreg").querySelector(`.par[data-lado="d"][data-i="${d.i}"]`);
    e.sel=[];ba.classList.remove("elegida");bd.classList.remove("elegida");
    if(q.izq[a.i].id===q.der[d.i].id){ba.classList.add("hecho");bd.classList.add("hecho");ba.disabled=bd.disabled=true;e.pares++;
      if(e.pares===q.izq.length)resolver(q,e.fallos<=1,"");}
    else{e.fallos++;(e.malos=e.malos||[]).push(q.izq[a.i].id,q.der[d.i].id);ba.classList.add("no");bd.classList.add("no");setTimeout(()=>{ba.classList.remove("no");bd.classList.remove("no")},450)}
  }
}
function terminar(){
  const n=R.qs.filter(q=>!q.reintento).length;
  if(R.test){ST.sims.push({f:FECHA(),p:R.ok,t:n});ST.sims=ST.sims.slice(-20)}
  ST.rondas++;guardar();
  const pct=Math.round(100*R.ok/n),msg=pct>=90?"🏆 ¡Excelente! Estás listo para la prueba.":pct>=70?"👏 ¡Muy bien! Repasá lo que falló y estás listo.":pct>=50?"💪 Vas bien. Un repaso más de lo que falló y mejora.":"📚 Hay que repasar un poco más. ¡Se puede!";
  ir("pFin");
  const falló=R.errores;
  $("pFin").innerHTML=`<header class="barra"><span></span><div class="titulo">${R.test?"Resultado del simulacro":"Resultado"}</div><span></span></header>
    <div class="nota"><div class="gran">${R.ok} <small>de ${n}</small></div><div class="pct2">${pct} %</div><p>${msg}</p></div>
    ${R.test?porParte():""}
    ${falló.length?`<h2>Para repasar (${falló.length})</h2><div class="errs">${falló.map(q=>`<div class="err"><div class="eq">${esc(q.consigna)}</div>${enunciado(q)?`<div class="ep">${esc(enunciado(q))}</div>`:""}<div class="er">✔ ${esc(q.mostrar||"")}</div>${q.estado.dado?`<div class="eu">✘ ${esc(q.estado.dado)}</div>`:""}<div class="ee">${esc(q.explic||"")}</div></div>`).join("")}</div>`:`<p class="sin">¡Sin errores!</p>`}
    <div class="acciones">${falló.length?`<button class="btn grande" id="bRepetirErr">🔁 Repasar lo que falló</button>`:""}${R.tema?`<button class="btn" id="bOtra" data-tema="${R.tema.id}">▶ Otra ronda</button>`:""}<button class="btn sec" id="bInicioFin">🏠 Inicio</button></div>`;
}

// cómo le fue en cada parte del simulacro (para saber qué estudiar)
function porParte(){
  const m=new Map();R.qs.forEach(q=>{if(!q.parte)return;const e=m.get(q.parte)||{ok:0,t:0};e.t++;if(q.estado&&q.estado.ok)e.ok++;m.set(q.parte,e)});
  return `<h2>Por parte</h2><div class="partes">${[...m].map(([k,e])=>`<div class="pt"><span>${esc(k)}</span><b>${e.ok} / ${e.t}</b><span class="prog" aria-hidden="true"><i style="width:${Math.round(100*e.ok/e.t)}%"></i></span></div>`).join("")}</div>`;
}
// ---- simulacro: las mismas actividades que se piden en las hojas de las units, sin ver si estuvo bien hasta el final
const N_SIM=30;
function armarSimulacro(){
  const qs=[],hay=t=>itemsDe(t);
  const dib=[];TEMAS.filter(t=>t.tipo==="vocab").forEach(t=>hay(t).filter(it=>it.emoji).forEach(it=>dib.push({t,it})));
  sacar(dib,6).forEach(p=>qs.push({...genVocab(p.t,p.it,"write"),parte:"A · Look and write"}));
  const reg=hay(B3.tema("regular")).filter(v=>!v.extra);
  sacar(reg,5).forEach(v=>qs.push({...genReg(B3.tema("regular"),v,"typePast"),parte:"B · Complete with the past simple"}));
  qs.push({...genTabla(B3.tema("regular")),parte:"B · Complete with the past simple"});
  const had=hay(B3.tema("hadto"));
  sacar(had,4).forEach((h,i)=>qs.push({...genHad(B3.tema("hadto"),h,i%2?"ordenarNeg":"ordenarAff"),parte:"C · Order the words"}));
  const irr=hay(B3.tema("irregular")).filter(v=>!v.be&&!v.extra);
  sacar(irr,5).forEach(v=>qs.push({...genIrr(B3.tema("irregular"),v,"escribir"),parte:"D · Write sentences"}));
  for(let i=0;i<3;i++)qs.push({...genBe(B3.tema("irregular")),parte:"E · Read and circle"});
  sacar(hay(B3.tema("hadto")),2).forEach(h=>qs.push({...genHad(B3.tema("hadto"),h,"choose"),parte:"E · Read and circle"}));
  const cl=[];TEMAS.filter(t=>t.tipo==="vocab").forEach(t=>hay(t).forEach(it=>cl.push({t,it})));
  sacar(cl,4).forEach(p=>qs.push({...genVocab(p.t,p.it,"cloze"),parte:"F · Read and complete"}));
  return qs;
}

// ---- ajustes
function pintarAjustes(){
  $("pAjustes").innerHTML=barra("⚙️ Ajustes","pInicio")+`<div class="ajustes">
    <label class="fila"><input type="checkbox" id="aVoz" ${ST.voz?"checked":""}><span>Con sonido (la voz en inglés)</span></label>
    <label class="fila"><input type="checkbox" id="aEs" ${ST.es?"checked":""}><span>Mostrar las traducciones al castellano</span></label>
    <label class="fila"><input type="checkbox" id="aExtra" ${ST.extra?"checked":""}><span>Practicar también los verbos «por si acaso» (los que no están en las hojas de las units)</span></label>
    <p class="nota-aj">Las palabras y los verbos salen de las Units 7 y 8 de <i>Beehive 3</i>. Las oraciones de ejemplo son propias. Todo lo que hacés queda sólo en este aparato.</p>
    <button class="btn peligro" id="aBorrar">Borrar mi progreso</button>
    <p class="nota-aj">Versión de los audios: ${esc(window.B3_AUDIO_V||"—")} · ${HAY.size} frases con voz grabada</p></div>`;
}

// ---------------- un cartel propio para confirmar (los diálogos del navegador se ven feos y se bloquean en algunas apps)
function confirmar(msg,si,textoSi){
  const m=$("modal");
  m.innerHTML=`<div class="caja-modal" role="alertdialog" aria-modal="true" aria-label="${esc(msg)}"><p>${esc(msg)}</p><div class="acciones"><button class="btn peligro" id="mSi">${esc(textoSi||"Sí")}</button><button class="btn sec" id="mNo">No, seguir</button></div></div>`;
  m.hidden=false;
  const cerrar=()=>{m.hidden=true;m.innerHTML=""};
  $("mNo").onclick=cerrar;$("mSi").onclick=()=>{cerrar();si()};
  try{$("mNo").focus()}catch(e){}
}

// ---------------- eventos
function arrancar(){
  document.addEventListener("click",e=>{
    const el=e.target.closest("button,[data-k],.cej,.ve");if(!el)return;
    if(el.dataset.ir){const d=el.dataset.ir;if(d==="pAjustes")pintarAjustes();if(d==="pInicio")pintarInicio();return ir(d)}
    if(el.dataset.tema&&el.id!=="bPracticar"&&el.id!=="bOtra"){const t=B3.tema(el.dataset.tema);pintarTema(t);return ir("pTema")}
    if(el.id==="bPracticar"||el.id==="bOtra"){return ronda({tema:B3.tema(el.dataset.tema),n:10})}
    if(el.id==="bSim")return ronda({qs:armarSimulacro(),test:true,titulo:"Simulacro"});
    if(el.id==="bErrores"){const ids=Object.keys(ST.items).filter(id=>ITEM[id]&&usa(ITEM[id].it)&&aprendiendo(id));if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2))});return}
    if(el.id==="bRepetirErr"){const ids=[...new Set(R.errores.flatMap(q=>q.tipo==="unir"&&q.estado.malos&&q.estado.malos.length?q.estado.malos:q.ids))].filter(id=>ITEM[id]);if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2)),tema:R.tema});return}
    if(el.id==="bInicioFin"){pintarInicio();return ir("pInicio")}
    if(el.id==="bSalir"){confirmar("¿Salir de la ronda? Lo que ya contestaste queda guardado.",()=>{R=null;pintarInicio();ir("pInicio")},"Salir");return}
    if(el.id==="bOir"){const q=actual();if(q){const k=q.audio||q.hablar;k&&Voz.decir(k)}return}
    if(el.id==="bSig")return siguiente();
    if(el.id==="bCheck"){const q=actual();return q&&(q.tipo==="tipear"?comprobarTipear():comprobarOrdenar())}
    if(el.classList.contains("opcion"))return comprobarMC(+el.dataset.i);
    if(el.classList.contains("chip")){const r=$("resp");if(r&&!r.disabled){r.value=el.dataset.b;r.focus()}return}
    if(el.classList.contains("ficha")&&el.dataset.f!==undefined){const q=actual();if(q&&!q.estado.resuelta&&!q.estado.sel.includes(+el.dataset.f)){q.estado.sel.push(+el.dataset.f);ordenarRefrescar(q)}return}
    if(el.classList.contains("puesta")){const q=actual();if(q&&!q.estado.resuelta){q.estado.sel.splice(+el.dataset.q,1);ordenarRefrescar(q)}return}
    if(el.classList.contains("par"))return tocarPar(el.dataset.lado,+el.dataset.i);
    if(el.classList.contains("oir")){Voz.decir(el.dataset.k,!!el.dataset.lento);return}
    if(el.dataset.k){Voz.decir(el.dataset.k);return}
    if(el.id==="aBorrar"){confirmar("¿Borrar todo lo que hiciste (las palabras aprendidas, los simulacros y los días)? No se puede deshacer.",()=>{ST={v:1,voz:ST.voz,es:ST.es,extra:ST.extra,items:Object.create(null),dias:{},sims:[],rondas:0};guardar();pintarAjustes()},"Borrar");return}
  });
  document.addEventListener("change",e=>{
    const i=e.target.id;if(i==="aVoz"){ST.voz=e.target.checked;guardar()}else if(i==="aEs"){ST.es=e.target.checked;guardar()}else if(i==="aExtra"){ST.extra=e.target.checked;guardar()}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="resp"){e.preventDefault();comprobarTipear()}else if(e.key==="Escape"&&!$("modal").hidden){$("modal").hidden=true;$("modal").innerHTML=""}});
  document.addEventListener("visibilitychange",()=>{if(document.hidden)Voz.parar()});
}
// para las pruebas
B3.gen=(temaId,itemId,tipo)=>{const t=B3.tema(temaId),it=t.items.find(x=>x.id===itemId);return generar(t,it,tipo)};
B3.tipos=tema=>POOLS[B3.tema(tema).tipo];
B3.rondaCon=(qs,test)=>ronda({qs,test:!!test});B3.estado=()=>ST;B3.actual=actual;B3.ronda=()=>R;B3.armarSimulacro=armarSimulacro;B3.genTabla=()=>genTabla(B3.tema("regular"));B3.genBe=()=>genBe(B3.tema("irregular"));B3.NORM=NORM;B3.dominio=dominio;
arrancar();pintarInicio();ir("pInicio");
})();
