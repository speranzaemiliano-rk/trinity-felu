// «Prueba final integradora · Felipe»: estudiar, practicar y hacer un simulacro. Sociales: las provincias argentinas y sus capitales, y los países limítrofes y sus capitales (con mapas para ubicarlos).
// Naturales: resúmenes, dibujos, cuadros y mapas conceptuales, y ejercicios, de las páginas del libro que se fueron pasando (cada tema es un archivo nat-*.js; las preguntas se arman acá).
// JavaScript vanilla, sin build. Todo queda en este aparato (localStorage «integradora_estado»); no se manda nada a ningún lado.
// Cómo se aprende: cada provincia (o país) tiene una «caja» (0 a 4, como las cajitas de repaso): si la contestás bien sube, si te equivocás vuelve a la 0 y aparece más seguido.
(function(){
"use strict";
const INT=window.INT,MAPA=window.MAPA,MLIM=window.MAPA_LIM,$=id=>document.getElementById(id);
const azar=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const elegir=a=>a[Math.floor(Math.random()*a.length)];
const mezclar=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const sacar=(a,n)=>mezclar(a).slice(0,n);
const mezclarDistinto=a=>{let m=mezclar(a),k=0;while(m.every((x,i)=>x===a[i])&&++k<12)m=mezclar(a);return m};
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const FECHA=d=>{d=d||new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};
const diasEntre=(a,b)=>{const f=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));return Math.round((f(b)-f(a))/864e5)};
const NUM=(x,max)=>Number.isFinite(+x)?Math.max(0,Math.min(max||1e9,Math.floor(+x))):0;
const FECHA_OK=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s||""));if(!m)return false;const y=+m[1],mo=+m[2],d=+m[3];if(y<2000||y>2100)return false;const t=new Date(Date.UTC(y,mo-1,d));return t.getUTCFullYear()===y&&t.getUTCMonth()===mo-1&&t.getUTCDate()===d};   // una fecha que existe de verdad (no «2026-13-45» ni un año a medio teclear como «0002»)
// cómo se comparan las respuestas escritas: sin mayúsculas, sin tildes, sin signos y sin espacios de más («cordoba» = «Córdoba»)
const NORM=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const igual=(dado,aceptar)=>aceptar.some(x=>NORM(x)===NORM(dado));
const fmtFecha=(s,min)=>{try{const t=new Date(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)).toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});return min?t:t.charAt(0).toUpperCase()+t.slice(1)}catch(e){return s}};

// ---------------- los ítems (por id; sin prototipo, así un id raro como «constructor» no existe)
const IDEAS=INT.IDEAS||{temas:[],conceptos:[],info:{}},DIB=window.DIB||{};   // Naturales: los conceptos (nat-*.js) y los dibujos (dibujos.js)
const ITEM=Object.create(null);INT.TODOS.forEach(it=>{ITEM[it.id]=it});IDEAS.conceptos.forEach(it=>{ITEM[it.id]=it});
const PROVS=INT.PROVINCIAS,CABA=INT.CABA,PAISES=INT.PAISES,TODOS=INT.TODOS,TODO=TODOS.concat(IDEAS.conceptos),TEMA=INT.tema("provincias");   // TODOS: lo de Sociales · TODO: Sociales y Naturales
let TEMA_ACT=TEMA;   // el tema que se está mirando (cualquiera de Sociales o de Naturales)

// ---------------- lo que se recuerda en este aparato
const KEY="integradora_estado";
function cargar(){   // lo guardado se revisa campo por campo: si alguien lo tocó o quedó a medias, no rompe nada
  const base={v:1,fecha:"",etq:false,items:Object.create(null),dias:{},sims:[],rondas:0};
  try{
    const o=JSON.parse(localStorage.getItem(KEY)||"null");
    if(o&&typeof o==="object"&&!Array.isArray(o)){
      base.rondas=NUM(o.rondas);base.etq=o.etq===true;if(FECHA_OK(o.fecha))base.fecha=o.fecha;
      if(o.items&&typeof o.items==="object"&&!Array.isArray(o.items))Object.keys(o.items).filter(id=>ITEM[id]).forEach(id=>{const e=o.items[id];if(e&&typeof e==="object")base.items[id]={c:NUM(e.c,4),ok:NUM(e.ok),mal:NUM(e.mal),u:FECHA_OK(e.u)?e.u:""}});
      if(o.dias&&typeof o.dias==="object"&&!Array.isArray(o.dias))Object.keys(o.dias).filter(k=>FECHA_OK(k)&&Array.isArray(o.dias[k])).sort().slice(-60).forEach(k=>{base.dias[k]=[NUM(o.dias[k][0]),NUM(o.dias[k][1])]});
      if(Array.isArray(o.sims))base.sims=o.sims.slice(-20).filter(s=>s&&typeof s==="object").map(s=>({f:FECHA_OK(s.f)?s.f:"",p:NUM(s.p),t:Math.max(1,NUM(s.t,200)),a:s.a==="naturales"?"naturales":"sociales"}));   // «a»: de qué área era el simulacro (los viejos son de Sociales)
    }
  }catch(e){}
  return base;
}
let ST=cargar();
function guardar(){try{localStorage.setItem(KEY,JSON.stringify(ST))}catch(e){}}
const caja=id=>{const e=ST.items[id];return e?e.c:-1};   // -1 = todavía no lo vio
function dominio(l){l=l||INT.ITEMS;const ap=l.filter(it=>caja(it.id)>=3).length;return {n:l.length,aprendidas:ap,vistas:l.filter(it=>caja(it.id)>=0).length,pct:Math.round(100*ap/l.length)}}   // sin lista: las provincias
function anotar(id,ok){   // sube o baja la caja de ese ítem
  const e=ST.items[id]=ST.items[id]||{c:0,ok:0,mal:0,u:""};
  if(ok){e.ok++;e.c=Math.min(4,e.c+1)}else{e.mal++;e.c=0}
  e.u=FECHA();
}
function sumarDia(ok){   // «Hoy: n bien · n mal» cuenta PREGUNTAS (un «unir» de 5 pares es una sola)
  const hoy=FECHA(),d=ST.dias[hoy]=ST.dias[hoy]||[0,0];
  if(ok)d[0]++;else d[1]++;
  const dias=Object.keys(ST.dias).sort();dias.slice(0,Math.max(0,dias.length-60)).forEach(k=>delete ST.dias[k]);
}
const aprendiendo=id=>{const e=ST.items[id];return !!e&&e.mal>0&&e.c<2};   // «para repasar»: se equivocó alguna vez y todavía no lo contestó bien dos veces seguidas
// qué ítem preguntar: los que no sabe o no vio pesan más
const peso=id=>{const e=ST.items[id];if(!e)return 6;const hoy=FECHA();return [8,5,3,2,1][Math.min(4,e.c)]*(1+Math.min(e.u?diasEntre(e.u,hoy):3,3)*.2)};
function elegirItem(lista,evitar){
  const l=lista.filter(x=>!evitar||x.id!==evitar),pes=l.map(x=>peso(x.id)),tot=pes.reduce((a,b)=>a+b,0);let r=Math.random()*tot;
  for(let i=0;i<l.length;i++){r-=pes[i];if(r<=0)return l[i]}
  return l[l.length-1]||lista[0];
}

// ---------------- el mapa (un dibujo SVG con las 23 provincias y la Ciudad de Buenos Aires; los trazados están en mapa.js)
// o: {res: la provincia pintada, ok: la acertada, mal: la equivocada, clic: se puede tocar, etq: con los nombres}
function mapaHTML(o){
  o=o||{};const M=MAPA,cl=id=>(o.res===id?" res":"")+(o.ok===id?" ok":"")+(o.mal===id?" mal":"");
  const marcada=id=>o.res===id||o.ok===id||o.mal===id;
  const ids=Object.keys(M.prov).filter(id=>id!=="caba"),orden=ids.filter(id=>!marcada(id)).concat(ids.filter(marcada));
  const trazos=orden.map(id=>`<path class="prov${cl(id)}" data-id="${id}" d="${M.prov[id].d}" fill-rule="evenodd"/>`).join("");
  const c=M.prov.caba,caba=`<g class="caba${cl("caba")}" data-id="caba"><path class="cabap" d="${c.d}" fill-rule="evenodd"/><circle class="cabar" cx="${c.cx}" cy="${c.cy}" r="3.6"/><circle class="cabah" cx="${c.cx}" cy="${c.cy}" r="${marcada("caba")?11:6.5}"/></g>`;
  const etq=o.etq?ids.map(id=>`<text class="et" x="${M.prov[id].cx}" y="${M.prov[id].cy}">${esc(ITEM[id].abrev)}</text>`).join("")+`<text class="et caba-et" x="${c.cx+9}" y="${c.cy+2.5}">CABA</text>`:"";
  return `<svg class="mapa${o.clic?" clic":""}" viewBox="0 0 ${M.w} ${M.h}" role="img" aria-label="Mapa de la Argentina con sus provincias" preserveAspectRatio="xMidYMid meet">${trazos}${caba}${etq}</svg>`;
}
// el mapa de los países limítrofes: la Argentina en un solo color (no se toca) y los cinco países (se pintan y se tocan). Los trazados están en mapa-limitrofes.js, en el mismo sistema de coordenadas que mapa.js
const ARG_ET=[150,380];   // dónde va el nombre «ARGENTINA» (bien adentro del país)
function mapaLimHTML(o){
  o=o||{};const L=MLIM,cl=id=>(o.res===id?" res":"")+(o.ok===id?" ok":"")+(o.mal===id?" mal":"");
  const marcada=id=>o.res===id||o.ok===id||o.mal===id,ids=Object.keys(L.pais);
  const pais=id=>`<path class="prov pais${cl(id)}" data-id="${id}" d="${L.pais[id].d}" fill-rule="evenodd"/>`;
  const arg=Object.keys(MAPA.prov).map(id=>`<path class="arg" d="${MAPA.prov[id].d}" fill-rule="evenodd"/>`).join("");
  const etq=o.etq?ids.map(id=>{const p=L.pais[id];return `<text class="et" x="${p.lx!==undefined?p.lx:p.cx}" y="${p.ly!==undefined?p.ly:p.cy}">${esc(ITEM[id].abrev)}</text>`}).join("")+`<text class="et arg-et" x="${ARG_ET[0]}" y="${ARG_ET[1]}">ARGENTINA</text>`:"";
  return `<svg class="mapa mapa-lim${o.clic?" clic":""}" viewBox="${L.vb.join(" ")}" role="img" aria-label="Mapa de la Argentina y de los países que limitan con ella" preserveAspectRatio="xMidYMid meet">${ids.filter(id=>!marcada(id)).map(pais).join("")}${arg}${ids.filter(marcada).map(pais).join("")}${etq}</svg>`;
}

// ---------------- armado de preguntas
// Una pregunta es {tipo:"mc"|"tipear"|"unir"|"mapa", tag, ids:[ítems que se anotan], consigna, ayuda, cuerpo (html), opciones:[{t,ok}] | aceptar:[…] | izq+der | (mapa: se toca), mostrar (la respuesta), explic, resumen}
const raiz=t=>{const w=NORM(t).split(" ")[0];return w.startsWith("san")?"san":w};   // san, santa y santiago se confunden entre sí
const opciones=(ok,malas,n)=>{const m=[...new Set(malas.filter(x=>x&&x!==ok))];return mezclar([{t:ok,ok:true}].concat(m.slice(0,(n||4)-1).map(t=>({t,ok:false}))))};
function malasCaps(it,c){   // otras capitales: con una «trampa» (una ciudad conocida de esa provincia o país que NO es la capital) desde la caja 1, y una que se le parezca
  if(it.tipo==="pais"){   // las de los otros países, la de la Argentina («Buenos Aires») y, desde la caja 1, una ciudad conocida que no es la capital; «Santiago» se parece a «Santiago del Estero»
    const otras=PAISES.filter(x=>x!==it).map(x=>x.capital).concat(["Buenos Aires"]);
    const trampa=c>=1&&it.trampas.length?[elegir(it.trampas)]:[],par=it.capital==="Santiago"?["Santiago del Estero"]:[];
    return [...trampa,...par,...mezclar(otras)];
  }
  const otras=PROVS.filter(x=>x!==it).map(x=>x.capital);
  const trampa=c>=1&&it.trampas.length?[elegir(it.trampas)]:[],par=mezclar(otras.filter(x=>raiz(x)===raiz(it.capital))).slice(0,1);
  return [...trampa,...par,...mezclar(otras)];
}
function malasProvs(it){   // otras provincias (o países): con la Ciudad de Buenos Aires de «trampa» para Buenos Aires, y una que se le parezca
  if(it.tipo==="pais")return mezclar(PAISES.filter(x=>x!==it).map(x=>x.corto));
  const otras=PROVS.filter(x=>x!==it).map(x=>it.id==="caba"&&x.id==="buenosaires"?"Provincia de Buenos Aires":x.corto).concat(it.id==="caba"?[]:[CABA.corto]);   // para el punto de la Ciudad la provincia se llama «Provincia de Buenos Aires»: el punto ES «Buenos Aires» para un chico
  const par=mezclar(otras.filter(x=>raiz(x)===raiz(it.corto))).slice(0,1);
  const trampa=it.id==="buenosaires"?[CABA.corto]:it.id==="caba"?["Provincia de Buenos Aires"]:[];
  return [...trampa,...par,...mezclar(otras)];
}
const expCap=it=>`La capital de ${it.corto} es ${it.capital}.`+(it.nota?" "+it.nota:"");
const expProv=it=>it.capital?`Es ${it.corto}: su capital es ${it.capital}.`+(it.nota?" "+it.nota:""):`Es la ${it.nombre}. ${it.nota}`;
// cómo se pregunta cada tipo de ítem (una provincia no se dice igual que un país)
const KIND={
  provincia:{sub:"provincia",capEleg:"Elegí la capital de esta provincia.",provEleg:"¿De qué provincia es capital?",provEleg_a:"Elegí la provincia.",capTipear:"Escribí la capital de esta provincia.",provTipear:"Escribí de qué provincia es capital.",provTipear_a:"Escribí el nombre de la provincia.",provTipear_p:"La provincia es…",
    mapaEleg:"¿Qué provincia está pintada en el mapa?",mapaTipear:"Escribí el nombre de la provincia pintada.",mapaTipear_p:"La provincia es…",resMapa:"En el mapa: la provincia pintada",toca_a:"Tocá la provincia que se pide.",
    unir:"Uní cada provincia con su capital.",unir_a:"Tocá una provincia y después su capital.",colA:"Provincias",vf:it=>`La capital de la provincia de ${it.corto} es `},
  pais:{sub:"país",capEleg:"Elegí la capital de este país.",provEleg:"¿De qué país es capital?",provEleg_a:"Elegí el país.",capTipear:"Escribí la capital de este país.",provTipear:"Escribí de qué país es capital.",provTipear_a:"Escribí el nombre del país.",provTipear_p:"El país es…",
    mapaEleg:"¿Qué país está pintado en el mapa?",mapaTipear:"Escribí el nombre del país pintado.",mapaTipear_p:"El país es…",resMapa:"En el mapa: el país pintado",toca_a:"Tocá el país que se pide.",
    unir:"Uní cada país con su capital.",unir_a:"Tocá un país y después su capital.",colA:"Países",vf:it=>`La capital de ${it.corto} es `}
};
const kindDe=it=>KIND[it.tipo==="pais"?"pais":"provincia"];
const grupoDe=it=>it.tipo==="pais"?PAISES:PROVS;
const mapaDe=(it,o)=>it.tipo==="pais"?mapaLimHTML(o):mapaHTML(o);
const nombreProv=it=>`<div class="pal">${esc(it.corto)}</div><div class="sub2">${it.tipo==="ciudad"?"capital del país":kindDe(it).sub}</div>`;
const aceptaProv=it=>[it.corto,it.nombre,it.abrev,...it.altNombre];   // también la abreviatura que se ve en el mapa («Sta. Cruz», «T. del Fuego»…)

function tableroUnir(l,K){   // un tablero de «unir»: 5 provincias (o los 5 países) a la izquierda y sus capitales, desordenadas, a la derecha
  K=K||KIND.provincia;
  return {ids:l.map(x=>x.id),tipo:"unir",tag:"unir",resumen:"Unir "+K.colA.toLowerCase()+" con sus capitales",consigna:K.unir,ayuda:K.unir_a,colA:K.colA,izq:l.map(x=>({t:x.corto,id:x.id})),der:mezclarDistinto(l.map(x=>({t:x.capital,id:x.id}))),mostrar:l.map(x=>x.corto+" → "+x.capital).join("  ·  "),explic:l.map(x=>x.corto+": "+x.capital).join("  ·  ")};
}
function generar(tipo,it,c,vistas){
  c=Math.max(0,c||0);
  if(it.tipo==="concepto")return generarIdea(tipo,it,c,vistas);   // Naturales: las preguntas de cada concepto
  if(it.tipo==="ciudad"&&!["mapaEleg","mapaTipear","vf"].includes(tipo))throw new Error("la Ciudad de Buenos Aires no tiene capital: "+tipo);
  const K=kindDe(it),base={ids:[it.id],tag:tipo};
  switch(tipo){
    case "capEleg":return {...base,tipo:"mc",resumen:"Capital de "+it.corto,consigna:K.capEleg,ayuda:"¿Cuál es la capital?",cuerpo:nombreProv(it),opciones:opciones(it.capital,malasCaps(it,c),4),mostrar:it.capital,explic:expCap(it)};
    case "provEleg":return {...base,tipo:"mc",resumen:K.provEleg.replace(/\?$/," "+it.capital+"?"),consigna:K.provEleg,ayuda:K.provEleg_a,cuerpo:`<div class="sub2">capital</div><div class="pal">${esc(it.capital)}</div>`,opciones:opciones(it.corto,malasProvs(it),4),mostrar:it.corto,explic:expCap(it)};
    case "vf":{
      let texto,ok,explic;
      if(it.tipo==="ciudad"){ok=Math.random()<.5;texto=ok?"La Ciudad de Buenos Aires es la capital de la Argentina.":"La Ciudad de Buenos Aires es la capital de la provincia de Buenos Aires.";explic=it.nota}
      else{ok=Math.random()<.5;const falsa=elegir(malasCaps(it,1).slice(0,2));texto=K.vf(it)+(ok?it.capital:(falsa===CABA.corto?"la "+falsa:falsa))+".";explic=ok?expCap(it):"En realidad, "+expCap(it).replace(/^L/,"l")}
      return {...base,tipo:"mc",resumen:texto,consigna:"¿Verdadero o falso?",ayuda:"Leé la oración y decidí.",cuerpo:`<div class="frase">${esc(texto)}</div>`,opciones:[{t:"Verdadero",ok:ok},{t:"Falso",ok:!ok}],mostrar:ok?"Verdadero":"Falso",explic};
    }
    case "capTipear":return {...base,tipo:"tipear",resumen:"Capital de "+it.corto,consigna:K.capTipear,ayuda:"Escribila (no hace falta poner tildes ni mayúsculas).",pista:"La capital es…",cuerpo:nombreProv(it),aceptar:[it.capital,...it.altCapital],mostrar:it.capital,explic:expCap(it)};
    case "provTipear":return {...base,tipo:"tipear",resumen:K.provEleg.replace(/\?$/," "+it.capital+"?"),consigna:K.provTipear,ayuda:K.provTipear_a,pista:K.provTipear_p,cuerpo:`<div class="sub2">capital</div><div class="pal">${esc(it.capital)}</div>`,aceptar:aceptaProv(it),mostrar:it.corto,explic:expCap(it)};
    case "mapaEleg":return {...base,tipo:"mc",mapa:1,resumen:K.resMapa,consigna:it.tipo==="ciudad"?"¿Qué es el punto pintado en el mapa?":K.mapaEleg,ayuda:"Mirá bien el mapa.",cuerpo:mapaDe(it,{res:it.id}),opciones:opciones(it.corto,malasProvs(it),4),mostrar:it.corto,explic:expProv(it)};
    case "mapaTipear":return {...base,tipo:"tipear",mapa:1,resumen:K.resMapa,consigna:it.tipo==="ciudad"?"Escribí qué es el punto pintado en el mapa.":K.mapaTipear,ayuda:"Escribila (no hace falta poner tildes ni mayúsculas).",pista:it.tipo==="ciudad"?"Es…":K.mapaTipear_p,cuerpo:mapaDe(it,{res:it.id}),aceptar:aceptaProv(it),mostrar:it.corto,explic:expProv(it)};
    case "mapaToca":return {...base,tipo:"mapa",mapa:1,resumen:"Tocar en el mapa: "+it.corto,consigna:"Tocá en el mapa:",ayuda:K.toca_a,cuerpo:`<div class="pal">${esc(it.corto)}</div>`+mapaDe(it,{clic:true}),mostrar:it.corto,explic:expProv(it)};
    case "unir":return tableroUnir([it,...sacar(grupoDe(it).filter(x=>x!==it),4)],K);
  }
  throw new Error("tipo raro: "+tipo);
}
// qué tipos de pregunta le tocan a un ítem según su caja (la 0: elegir; la 1 y la 2: ubicar en el mapa, unir y trampas; de la 3 en adelante: escribir, como en la prueba)
const POOL=[["capEleg","provEleg","mapaEleg","vf"],["mapaEleg","mapaToca","capEleg","provEleg","unir","vf"],["capTipear","provTipear","mapaTipear","mapaToca","unir"]];
function tipoPara(it,c){
  if(it.tipo==="concepto")return tipoParaIdea(it,c);
  let p=POOL[c<1?0:c<3?1:2].slice();
  if(it.tipo==="ciudad")p=p.filter(x=>["mapaEleg","mapaTipear","vf"].includes(x));
  return elegir(p.length?p:["mapaEleg"]);
}
// a qué ítems se les puede hacer cada tipo de pregunta (la Ciudad de Buenos Aires no tiene capital ni se toca bien en el mapa)
const CON_CAPITAL=PROVS.concat(PAISES);
const ELEGIBLES={capEleg:CON_CAPITAL,provEleg:CON_CAPITAL,capTipear:CON_CAPITAL,provTipear:CON_CAPITAL,mapaToca:CON_CAPITAL,unir:CON_CAPITAL,vf:TODOS,mapaEleg:TODOS,mapaTipear:TODOS};
const ACTIVIDADES=[
  ["capEleg","📍","Elegir la capital","Te dan la provincia, elegís su capital"],
  ["provEleg","🏙️","Elegir la provincia","Te dan la capital, elegís la provincia"],
  ["mapaEleg","🗺️","¿Cuál está en el mapa?","Una provincia pintada: elegís cuál es"],
  ["mapaToca","👆","Tocá en el mapa","Te dicen una provincia y la tocás"],
  ["capTipear","✍️","Escribir la capital","Escribís la capital de cada provincia"],
  ["mapaTipear","📝","Mapa mudo","Escribís el nombre de la provincia pintada"],
  ["unir","🔗","Unir","Unís 5 provincias con sus capitales"],
  ["vf","✅","Verdadero o falso","Decidís si la oración está bien"]
];
const ACTIVIDADES_PAIS=[
  ["capEleg","📍","Elegir la capital","Te dan el país, elegís su capital"],
  ["provEleg","🏙️","Elegir el país","Te dan la capital, elegís el país"],
  ["mapaEleg","🗺️","¿Cuál está en el mapa?","Un país pintado: elegís cuál es"],
  ["mapaToca","👆","Tocá en el mapa","Te dicen un país y lo tocás"],
  ["capTipear","✍️","Escribir la capital","Escribís la capital de cada país"],
  ["mapaTipear","📝","Mapa mudo","Escribís el nombre del país pintado"],
  ["unir","🔗","Unir","Unís los 5 países con sus capitales"],
  ["vf","✅","Verdadero o falso","Decidís si la oración está bien"]
];

// ---------------- Naturales: las preguntas de cada concepto (los textos están en nat-*.js; acá sólo se arman)
const nombreEst=e=>{const n=(DIB.NOMBRES||{})[e]||e;return n.charAt(0).toUpperCase()+n.slice(1)};
// los tableros de «unir» de un tema donde figura un concepto: [{n: número del tablero dentro del tema, tab}]
function tablerosDe(it){
  const t=IDEAS.temas.find(x=>x.id===it.tema);if(!t)return [];
  return t.tableros.map((tab,n)=>({n,tab})).filter(z=>z.tab.pares.some(p=>p[0]===it.id));
}
function tableroUnirIdea(t,n){   // un tablero de «unir»: las ideas a la izquierda y, desordenado, lo que les corresponde a la derecha
  const tab=t.tableros[n],ps=tab.pares,cols=tab.cols||["Ideas","Qué le corresponde"];
  return {ids:ps.map(p=>p[0]),tipo:"unir",tag:"cnUnir",clave:t.id+"|unir|"+n,resumen:"Unir: "+tab.titulo,consigna:"Uní cada idea con lo que le corresponde.",ayuda:"Tocá una de la izquierda y después la que va con ella.",colA:cols[0],colB:cols[1],
    izq:ps.map(p=>({t:p[1],id:p[0]})),der:mezclarDistinto(ps.map(p=>({t:p[2],id:p[0]}))),mostrar:ps.map(p=>p[1]+" → "+p[2]).join("  ·  "),explic:tab.titulo};
}
// de las variantes de un concepto (sus preguntas de un tipo) elige una que todavía no salió en esta ronda
function variante(l,clave,vistas){
  const idx=l.map((_,i)=>i),libres=vistas?idx.filter(i=>!vistas.has(clave(i))):idx;
  return elegir(libres.length?libres:idx);
}
function generarIdea(tipo,it,c,vistas){
  const base={ids:[it.id],tag:tipo};
  switch(tipo){
    case "cnMc":{const i=variante(it.mc,k=>it.id+"|mc|"+k,vistas),[q,ok,mal]=it.mc[i];
      return {...base,tipo:"mc",clave:it.id+"|mc|"+i,resumen:q,consigna:q,ayuda:"Elegí la respuesta correcta.",opciones:opciones(ok,mezclar(mal),4),mostrar:ok,explic:it.resumen};}
    case "cnVf":{const i=variante(it.vf,k=>it.id+"|vf|"+k,vistas),[t,v,e]=it.vf[i];
      return {...base,tipo:"mc",clave:it.id+"|vf|"+i,resumen:t,consigna:"¿Verdadero o falso?",ayuda:"Leé la oración y decidí.",cuerpo:`<div class="frase">${esc(t)}</div>`,opciones:[{t:"Verdadero",ok:v},{t:"Falso",ok:!v}],mostrar:v?"Verdadero":"Falso",explic:e||it.resumen};}
    case "cnTipear":{const i=variante(it.tipear,k=>it.id+"|ti|"+k,vistas),[q,ac,pista]=it.tipear[i];
      return {...base,tipo:"tipear",clave:it.id+"|ti|"+i,resumen:q,consigna:q,ayuda:"Escribila (no hace falta poner tildes ni mayúsculas).",pista:pista||"Escribí acá…",aceptar:ac,mostrar:ac[0],explic:it.resumen};}
    case "cnOrdenar":{const i=variante(it.ordenar,k=>it.id+"|or|"+k,vistas),[cons,pasos]=it.ordenar[i];
      return {...base,tipo:"ordenar",clave:it.id+"|or|"+i,resumen:cons,consigna:cons,ayuda:"Tocá cada paso en el orden correcto (si te equivocás, tocalo de nuevo) y después «Listo».",pasos:mezclarDistinto(pasos),correcto:pasos.slice(),mostrar:pasos.map((p,k)=>(k+1)+") "+p).join("  ·  "),explic:it.resumen};}
    case "cnUnir":{const t=IDEAS.temas.find(x=>x.id===it.tema),z=tablerosDe(it),libres=z.filter(x=>!vistas||!vistas.has(t.id+"|unir|"+x.n));
      return tableroUnirIdea(t,elegir(libres.length?libres:z).n);}
    case "cnTocar":{const i=variante(it.tocar,k=>it.id+"|to|"+k,vistas),[d,cons,pieza]=it.tocar[i],inf=(IDEAS.info[d]||{})[pieza]||{};
      return {...base,tipo:"mapa",mapa:1,dib:d,objetivo:pieza,clave:it.id+"|to|"+i,resumen:cons,consigna:cons,ayuda:"Tocá la parte del dibujo que se pide.",cuerpo:DIB[d]({clic:true,tap:true,mezcla:true}),mostrar:inf.t||pieza,explic:inf.d||it.resumen};}
    case "cnEstacion":{const ESTS=DIB.ESTACIONES,libres=ESTS.filter(e=>!vistas||!vistas.has(it.id+"|es|"+e)),e=elegir(libres.length?libres:ESTS);
      return {...base,tipo:"mc",mapa:1,dib:"arbol",clave:it.id+"|es|"+e,resumen:"Reconocer la estación por el dibujo de un árbol",consigna:"¿Qué estación del año muestra el dibujo?",ayuda:"Mirá bien el árbol y el cielo.",cuerpo:DIB.arbol(e,{sinNombre:true}),opciones:ESTS.map(x=>({t:nombreEst(x),ok:x===e})),mostrar:nombreEst(e),explic:DIB.PISTA[e]};}
  }
  throw new Error("tipo raro: "+tipo);
}
// qué conceptos admiten cada tipo de pregunta (cada concepto trae las que se escribieron para él en nat-*.js)
const IDEA_TIPOS={cnMc:x=>x.mc.length>0,cnVf:x=>x.vf.length>0,cnTipear:x=>x.tipear.length>0,cnOrdenar:x=>x.ordenar.length>0,cnTocar:x=>x.tocar.length>0,cnEstacion:x=>!!x.estacion,cnUnir:x=>tablerosDe(x).length>0};
Object.keys(IDEA_TIPOS).forEach(k=>{ELEGIBLES[k]=IDEAS.conceptos.filter(IDEA_TIPOS[k])});
const ACTIVIDADES_IDEAS=[
  ["cnMc","🔘","Elegir la respuesta","Una pregunta y cuatro opciones"],
  ["cnVf","✅","Verdadero o falso","Decidís si la oración está bien"],
  ["cnTipear","✍️","Escribir la respuesta","Escribís una palabra o una frase corta"],
  ["cnOrdenar","🔢","Ordenar","Ponés los pasos en el orden correcto"],
  ["cnUnir","🔗","Unir","Unís cada idea con lo que le corresponde"],
  ["cnTocar","👆","Tocá en el dibujo","Tocás la parte del dibujo que se pide"],
  ["cnEstacion","🍂","¿Qué estación es?","Mirás un árbol y decís qué estación es"]
];
// los conceptos nuevos arrancan con preguntas de elegir; a medida que los sabe, aparecen las de ordenar, unir, tocar y escribir
const POOL_IDEA=[["cnMc","cnVf","cnEstacion"],["cnMc","cnVf","cnTocar","cnEstacion","cnOrdenar","cnUnir"],["cnTipear","cnTocar","cnOrdenar","cnUnir","cnEstacion","cnMc"]];
function tipoParaIdea(it,c){
  const hay=t=>ELEGIBLES[t].includes(it);
  let p=POOL_IDEA[c<1?0:c<3?1:2].filter(hay);
  if(!p.length)p=Object.keys(IDEA_TIPOS).filter(hay);
  return elegir(p.length?p:["cnMc"]);
}
// cuántas preguntas DISTINTAS hay de un tipo en un tema (una ronda de esa actividad no pide más que eso, para no repetir)
const SUMA=(l,f)=>l.reduce((s,x)=>s+f(x),0);
function cuantas(tipo,t){
  const l=t.items.filter(x=>ELEGIBLES[tipo]&&ELEGIBLES[tipo].includes(x));
  switch(tipo){
    case "cnMc":return SUMA(l,x=>x.mc.length);
    case "cnVf":return SUMA(l,x=>x.vf.length);
    case "cnTipear":return SUMA(l,x=>x.tipear.length);
    case "cnOrdenar":return SUMA(l,x=>x.ordenar.length);
    case "cnTocar":return SUMA(l,x=>x.tocar.length);
    case "cnEstacion":return l.length?DIB.ESTACIONES.length:0;
    case "cnUnir":return new Set(l.flatMap(x=>tablerosDe(x).map(z=>z.n))).size;
  }
  return 0;
}
// cuántas preguntas tiene una ronda de una actividad
const nRonda=(tipo,t)=>tipo==="unir"?(t.tipo==="paises"?2:4):t.tipo==="ciencia"?Math.max(1,Math.min(tipo==="cnUnir"?3:10,cuantas(tipo,t))):10;

// ---------------- la ronda en curso (práctica, una actividad, repaso o simulacro)
let R=null;
function ronda(opts){   // opts: {tipo (una sola actividad), ids (ítems puntuales), tema (se pregunta sólo de ese tema), n, test, qs}
  const qs=[];
  if(opts.qs)opts.qs.forEach(q=>qs.push(q));
  else{
    const n=opts.n||10,vistas=new Set();let ult=null;   // vistas: las preguntas de Naturales ya armadas en esta ronda (para que no salga dos veces la misma)
    for(let i=0;i<n;i++){
      let pool=opts.ids?opts.ids.map(id=>ITEM[id]).filter(Boolean):opts.tema?opts.tema.items:TODO;
      if(opts.tipo)pool=pool.filter(x=>ELEGIBLES[opts.tipo].includes(x));
      if(!pool.length)pool=opts.tipo?ELEGIBLES[opts.tipo]:TODO;
      const armar=y=>{const tipo=opts.tipo||tipoPara(y,Math.max(0,caja(y.id)));try{return generar(tipo,y,Math.max(0,caja(y.id)),vistas)}catch(e){return y.tipo==="concepto"?generar("cnMc",y,0,vistas):generar("mapaEleg",y,0)}};
      let x,q,k=0;
      do{x=elegirItem(pool,k<6?ult:null);q=armar(x)}while(q.clave&&vistas.has(q.clave)&&++k<12);   // no la misma idea dos veces seguidas… salvo que sea la única forma de no repetir una pregunta (a partir del 7.º intento)
      if(q.clave&&vistas.has(q.clave))for(const y of mezclar(pool)){const r=armar(y);if(r.clave&&!vistas.has(r.clave)){x=y;q=r;break}}   // sigue repetida: se prueba, idea por idea, alguna que todavía tenga una pregunta de este tipo sin hacer
      ult=x.id;if(q.clave)vistas.add(q.clave);
      qs.push(q);
    }
  }
  R={qs,i:0,ok:0,mal:0,errores:[],test:!!opts.test,reint:{},tipo:opts.tipo||null,tema:opts.tema||null,area:opts.area||null};
  mostrarPregunta();
}
const actual=()=>R&&R.qs[R.i];

// ---------------- pantallas
const PANT=["pInicio","pTema","pMapa","pEst","pPreg","pMemo","pFin","pAjustes"];
// un doble toque (o un toque apurado justo después de que cambia la pantalla) no tiene que contestar lo que quedó debajo del dedo: durante 400 ms no se atiende nada (las pruebas lo apagan con window.__INT_SIN_ESPERA)
let ULT_NAV=-1e9,ULT_RESP=-1e9;   // «hace mucho»: al abrir la app no hay nada que esperar
const esperando=()=>window.__INT_SIN_ESPERA!==true&&performance.now()-ULT_NAV<400;
function ir(p,arranque){PANT.forEach(x=>{$(x).hidden=x!==p});if(!arranque)ULT_NAV=performance.now();window.scrollTo(0,0)}   // al abrir la app no corre la espera (el primer toque es de verdad)
function barra(titulo,atras,extra){return `<header class="barra"><button class="atras" data-ir="${atras}" aria-label="Volver">⬅</button><div class="titulo">${titulo}</div>${extra||"<span></span>"}</header>`}
const barraProg=i=>`<span class="prog" aria-hidden="true"><i style="width:${i}%"></i></span>`;

const progresoTema=t=>{const m=dominio(t.items);return `<button class="tema-btn" data-tema="${t.id}"><span class="tb-t"><b>${esc(t.ico)} ${esc(t.nombre)}</b><small>${m.aprendidas} de ${m.n} aprendidas</small></span>${barraProg(m.pct)}</button>`};
function pintarInicio(){
  const hoy=FECHA(),d=ST.fecha?diasEntre(hoy,ST.fecha):null;
  const cuenta=ST.fecha?`<div>${d>1?`Faltan <b>${d} días</b>`:d===1?`<b>¡Es mañana!</b>`:d===0?`<b>¡Es hoy! Mucha suerte</b>`:`La prueba fue el ${esc(fmtFecha(ST.fecha,true))}`}</div><small>${esc(fmtFecha(ST.fecha))}</small>`:`<div>¡Hola, ${esc(INT.ALUMNO)}!</div><small>Elegí qué querés estudiar</small>`;
  const err=TODO.filter(it=>aprendiendo(it.id)),mejorDe=a=>{const l=ST.sims.filter(x=>x.a===a);return l.length?Math.max(...l.map(x=>Math.round(100*x.p/x.t))):null},mejor=mejorDe("sociales"),mejorNat=mejorDe("naturales");
  $("pInicio").innerHTML=`<header class="barra"><div class="logo">📚</div><div class="titulo">${esc(INT.NOMBRE)}</div><button class="atras" data-ir="pAjustes" aria-label="Ajustes">⚙️</button></header>
    <section class="cuenta">${cuenta}</section>
    <div class="areas">${INT.AREAS.map(a=>a.pronto?`<div class="area a-${a.color} pronto"><span class="aico" aria-hidden="true">${a.ico}</span><span class="atxt"><b>${esc(a.nombre)}</b><small>Pronto: se van a sumar los temas</small></span></div>`:
      `<div class="area a-${a.color}" data-area="${a.id}"><span class="aico" aria-hidden="true">${a.ico}</span><span class="atxt"><b>${esc(a.nombre)}</b><span class="temas">${a.temas.map(progresoTema).join("")}</span></span></div>`).join("")}</div>
    <div class="acciones"><button class="btn grande" id="bSim">📝 Simulacro de Sociales<small>${mejor===null?N_SIM+" preguntas como las de una prueba, sin ver si estuvo bien hasta el final":"tu mejor resultado: "+mejor+" %"}</small></button>${IDEAS.temas.length?`<button class="btn grande nat" id="bSimNat">📝 Simulacro de Naturales<small>${mejorNat===null?N_SIM_NAT+" preguntas como las de una prueba, sin ver si estuvo bien hasta el final":"tu mejor resultado: "+mejorNat+" %"}</small></button>`:""}
      <button class="btn sec" id="bErrores" ${err.length?"":"disabled"}>🔁 Repasar lo que me salió mal<small>${err.length?err.length+(err.length===1?" cosa":" cosas"):"nada por ahora"}</small></button></div>
    <p class="pie">Hoy: ${(ST.dias[hoy]||[0,0])[0]} bien · ${(ST.dias[hoy]||[0,0])[1]} mal</p>`;
}
const puntos=c=>`<span class="cajas" aria-label="Caja ${Math.max(0,c)} de 4">${[1,2,3,4].map(k=>`<i class="${c>=k?"on":""}"></i>`).join("")}</span>`;
function pintarTema(t){
  if(t.tipo==="ciencia")return pintarTemaIdeas(t);
  const m=dominio(t.items),P=t.tipo==="paises",acts=P?ACTIVIDADES_PAIS:ACTIVIDADES,que=P?"país":"provincia";
  const filas=t.items.map(it=>`<button class="fila-prov" data-ver="${it.id}" aria-label="${esc(it.corto)}: ver en el mapa"><span class="fp-n">${esc(it.corto)}</span><span class="fp-c">${esc(it.capitalTxt||it.capital||"capital del país")}</span>${puntos(caja(it.id))}</button>`).join("");
  const aviso=P?`<div class="nota-ciudad">🏛️ <b>Bolivia</b> tiene dos capitales: <b>Sucre</b> (la capital constitucional) y <b>La Paz</b> (donde funciona el gobierno). Valen las dos.</div>`:`<div class="nota-ciudad">🏙️ La <b>Ciudad de Buenos Aires</b> no es una provincia: es la capital del país. La capital de la provincia de Buenos Aires es <b>La Plata</b>.</div>`;
  $("pTema").innerHTML=barra(`${t.ico} ${esc(t.nombre)}`,"pInicio")+
    `<div class="sub">${esc(t.es)}</div>
     <div class="dom">${barraProg(m.pct)}<small>${m.aprendidas} de ${m.n} aprendidas</small></div>
     <button class="btn grande" id="bPracticar">▶ Practicar<small>10 preguntas mezcladas, las que más te cuestan primero</small></button>
     <h2>Actividades</h2>
     <div class="acts">${acts.map(([k,i,n,d])=>`<button class="act" data-act="${k}"><span class="ai" aria-hidden="true">${i}</span><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join("")}<button class="act" id="bMemo"><span class="ai" aria-hidden="true">🃏</span><b>Memotest</b><small>Encontrá cada ${que} con su capital</small></button></div>
     <h2>Para estudiar</h2>
     <button class="btn sec" id="bMapaEst">🗺️ Mapa para estudiar<small>Tocá ${P?"un país":"una provincia"} y mirá su nombre y su capital</small></button>
     ${aviso}
     <div class="lista-prov" role="list">${filas}</div>`;
}
// ---- Naturales: la pantalla de un tema, y la de estudio (resumen · cuadro · dibujos · mapa conceptual)
function pintarTemaIdeas(t){
  const m=dominio(t.items),acts=ACTIVIDADES_IDEAS.filter(a=>cuantas(a[0],t)>0),est=(t.def.estudio||[]).map(x=>x.titulo.replace(/^\S+\s+/,"").toLowerCase());
  const filas=t.items.map(it=>`<button class="fila-prov fila-con" data-ver="${esc(it.id)}" aria-label="${esc(it.titulo)}: ver el resumen"><span class="fp-n">${esc(it.ico)} ${esc(it.titulo)}</span>${puntos(caja(it.id))}</button>`).join("");
  $("pTema").innerHTML=barra(`${esc(t.ico)} ${esc(t.nombre)}`,"pInicio")+
    `<div class="sub">${esc(t.es)}</div>
     <div class="dom">${barraProg(m.pct)}<small>${m.aprendidas} de ${m.n} aprendidas</small></div>
     <button class="btn grande" id="bPracticar">▶ Practicar<small>10 preguntas mezcladas, las que más te cuestan primero</small></button>
     <h2>Para estudiar</h2>
     <button class="btn sec" id="bEstudiar">📖 Estudiar este tema<small>${esc(est.join(" · "))}</small></button>
     <h2>Actividades</h2>
     <div class="acts">${acts.map(([k,i,n,d])=>`<button class="act" data-act="${k}"><span class="ai" aria-hidden="true">${i}</span><b>${esc(n)}</b><small>${esc(d)}</small></button>`).join("")}<button class="act" id="bMemo"><span class="ai" aria-hidden="true">🃏</span><b>Memotest</b><small>Encontrá cada idea con lo que le corresponde</small></button></div>
     <h2>Las ideas de este tema</h2>
     <div class="lista-prov" role="list">${filas}</div>`;
}
const DIB_TIT={sol:"El camino del Sol durante un día",salidas:"Dónde sale y dónde se pone el Sol",alturas:"El Sol y la sombra al mediodía",gnomon:"Las sombras del gnomon durante un día",arboles:"Un árbol en cada estación",autoridades:"Las autoridades coloniales",castas:"El triángulo de las castas",linea:"Línea de tiempo (los años no están a escala)",virreinato:"El Virreinato del Río de la Plata en el mapa de hoy"};
const DIB_NOTA={virreinato:"Los países se pintan enteros, pero el virreinato no coincidía exactamente con las fronteras de hoy: el libro dice que abarcaba su territorio «total o parcialmente»."};   // aclaración que va bajo el dibujo, si hace falta
let EST={t:null,tab:"resumen"};   // lo que se está estudiando
function pintarEstudio(t,tab,foco){
  const def=t.def,tabs=def.estudio&&def.estudio.length?def.estudio:[{id:"resumen",titulo:"📖 Resumen"}];
  tab=tabs.some(x=>x.id===tab)?tab:tabs[0].id;EST={t,tab};
  const cont=tab==="cuadro"?estCuadro(def):tab==="dibujos"?estDibujos(tabs.find(x=>x.id==="dibujos")):tab==="mapa"?estMapa(def):estResumen(def);
  $("pEst").innerHTML=barra(`${esc(t.ico)} ${esc(t.nombre)}`,"pTema")+
    `<div class="tabs" role="tablist">${tabs.map(x=>`<button class="tab${x.id===tab?" on":""}" role="tab" aria-selected="${x.id===tab}" data-tab="${esc(x.id)}">${esc(x.titulo)}</button>`).join("")}</div><div class="est-cont">${cont}</div>`;
  const e=foco&&$("c-"+foco);if(e){e.classList.add("foco");setTimeout(()=>{try{e.scrollIntoView({block:"center"})}catch(x){}},60)}   // desde la lista de ideas: se abre el resumen en la que se tocó
}
function estResumen(def){
  const gr=(def.grupos||[]).slice(),conocidos=new Set(gr.map(g=>g.id)),sueltos=def.conceptos.filter(c=>!conocidos.has(c.grupo));
  if(sueltos.length)gr.push({id:"__otros",titulo:"Más ideas"});
  const de=g=>g.id==="__otros"?sueltos:def.conceptos.filter(c=>c.grupo===g.id);
  return gr.map(g=>{const cs=de(g);return cs.length?`<section class="grupo"><h2>${esc(g.titulo)}</h2>${cs.map(c=>`<article class="con" id="c-${esc(c.id)}"><div class="con-t"><h3>${esc(c.ico)} ${esc(c.titulo)}</h3>${puntos(caja(c.id))}</div><p>${esc(c.resumen)}</p></article>`).join("")}</section>`:""}).join("")+
    `<p class="nota-aj">Resumido con otras palabras a partir del libro (${esc(def.paginas||"")}). Si algo no coincide con tu libro, vale el libro.</p>`;
}
function estCuadro(def){
  const q=def.cuadro;if(!q)return `<p class="sin">Este tema no tiene cuadro.</p>`;
  return `<div class="cuadro-w"><table class="cuadro"><thead><tr><th scope="col"><span class="vh">Dato</span></th>${q.cols.map((c,i)=>`<th scope="col" class="k${i%4}">${esc(c)}</th>`).join("")}</tr></thead><tbody>${q.filas.map(f=>`<tr><th scope="row">${esc(f.t)}</th>${f.v.map((v,i)=>`<td class="k${i%4}" data-col="${esc(q.cols[i]||"")}">${esc(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
}
function estDibujos(tab){
  return ((tab&&tab.dibujos)||[]).map(d=>{
    const inf=IDEAS.info[d],f=DIB[d];if(!f)return "";
    return `<section class="dib-est" data-dib="${esc(d)}"><h2>${esc(DIB_TIT[d]||"")}</h2><div class="dib-w">${f({clic:!!inf})}</div>${inf?`<div class="info vacio" id="info-${esc(d)}" role="status" aria-live="polite">Tocá una parte del dibujo para ver qué significa.</div>`:""}${DIB_NOTA[d]?`<p class="nota-aj">${esc(DIB_NOTA[d])}</p>`:""}</section>`}).join("");
}
function estMapa(def){
  const m=def.mapa;if(!m)return `<p class="sin">Este tema no tiene mapa conceptual.</p>`;
  return `<div class="mc"><div class="mc-raiz">${esc(m.raiz)}</div><div class="mc-ramas">${m.ramas.map((r,i)=>`<section class="mc-rama r${i%6}"><h3>${esc(r.t)}</h3><ul>${r.h.map(x=>`<li>${esc(x)}</li>`).join("")}</ul></section>`).join("")}</div></div>`;
}
function infoDibujo(svg,id){   // en la pantalla de estudio, tocar una parte del dibujo dice qué es
  const sec=svg.closest("[data-dib]"),d=sec&&sec.dataset.dib,inf=d&&(IDEAS.info[d]||{})[id],box=d&&$("info-"+d);if(!inf||!box)return;
  svg.querySelectorAll(".res").forEach(e=>e.classList.remove("res"));
  svg.querySelectorAll("[data-id]").forEach(e=>{if(e.dataset.id===id)e.classList.add("res")});
  box.className="info";box.innerHTML=`<b>${esc(inf.t)}</b><p>${esc(inf.d||"")}</p>`;
}
function pintarMapaEstudio(sel){
  const P=TEMA_ACT.tipo==="paises",it=sel&&ITEM[sel];
  const info=it?`<div class="info"><b>${esc(it.nombre)}</b>${it.capital?`<div>Capital: <b>${esc(it.capitalTxt||it.capital)}</b></div>`:`<div>Es la <b>capital del país</b>.</div>`}${it.limita?`<p>${esc(it.limita)}</p>`:""}${it.nota?`<p>${esc(it.nota)}</p>`:""}</div>`:`<div class="info vacio">Tocá ${P?"un país":"una provincia"} del mapa para ver su nombre y su capital.</div>`;
  $("pMapa").innerHTML=barra("🗺️ Mapa para estudiar","pTema")+
    `<label class="fila"><input type="checkbox" id="mEtq" ${ST.etq?"checked":""}><span>Mostrar los nombres en el mapa</span></label>
     <div class="mapa-est">${(P?mapaLimHTML:mapaHTML)({res:sel,clic:true,etq:ST.etq})}${info}</div>`;
  $("pMapa").dataset.sel=sel||"";
}

// ---- una pregunta
function barraPreg(){
  const n=R.qs.length;
  return `<header class="barra"><button class="atras" id="bSalir" aria-label="Salir">✕</button><div class="pasos" aria-label="Pregunta ${R.i+1} de ${n}">${barraProg(Math.round(100*R.i/n))}<small>${R.i+1} / ${n}</small></div><span></span></header>`;
}
function mostrarPregunta(){
  const q=actual();if(!q)return terminar();
  ir("pPreg");
  let h=barraPreg()+(q.parte?`<div class="parte">${esc(q.parte)}</div>`:"")+`<div class="consigna"><b>${esc(q.consigna)}</b><small>${esc(q.ayuda||"")}</small></div>`+(q.cuerpo||q.tipo==="unir"?`<div class="cuerpo${q.mapa?" conmapa"+(q.tipo==="mapa"?" toca":""):""}${q.dib?" condib":""}">${q.cuerpo||""}</div>`:"");
  if(q.tipo==="mc")h+=`<div class="opciones n${q.opciones.length}${q.opciones.some(o=>o.t.length>22)?" largas":""}">${q.opciones.map((o,i)=>`<button class="opcion" data-i="${i}">${esc(o.t)}</button>`).join("")}</div>`;
  else if(q.tipo==="tipear")h+=`<input id="resp" class="resp" type="text" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${esc(q.pista||"Escribí acá…")}" aria-label="Tu respuesta"><button class="btn" id="bCheck">Listo ✔</button>`;
  else if(q.tipo==="unir")h+=`<div class="unir"><div class="col" id="izq"><div class="colt">${esc(q.colA||"Provincias")}</div>${q.izq.map((x,i)=>`<button class="par" data-lado="i" data-i="${i}">${esc(x.t)}</button>`).join("")}</div><div class="col" id="der"><div class="colt">${esc(q.colB||"Capitales")}</div>${q.der.map((x,i)=>`<button class="par" data-lado="d" data-i="${i}">${esc(x.t)}</button>`).join("")}</div></div>${R.test?`<button class="btn" id="bUnirListo" disabled>Listo ✔</button>`:""}`;
  else if(q.tipo==="ordenar")h+=`<div class="orden" id="orden">${q.pasos.map((t,i)=>`<button class="paso" data-p="${i}" aria-pressed="false"><span class="paso-n" aria-hidden="true"></span><span class="paso-t">${esc(t)}</span></button>`).join("")}</div><button class="btn" id="bOrdenListo" disabled>Listo ✔</button>`;
  h+=`<div class="feedback" id="feedback" role="status" aria-live="polite" hidden></div>`;
  $("pPreg").innerHTML=h;$("pPreg").classList.toggle("pmapa",!!q.mapa);
  q.estado={pares:0,fallos:0,resuelta:false,sel:[],orden:[]};
  if(q.tipo==="tipear"){const r=$("resp");setTimeout(()=>{try{r.focus({preventScroll:true})}catch(e){}},60)}
}
function resolver(q,ok,dado){   // se corrigió la pregunta: se anota, se muestra qué pasó y se pasa a la siguiente
  if(q.estado.resuelta)return;ULT_RESP=performance.now();q.estado.resuelta=true;q.estado.ok=ok;q.estado.dado=dado;
  if(!q.reintento){if(ok)R.ok++;else{R.mal++;R.errores.push(q)}}
  if(q.tipo==="unir"){const malos=new Set(q.estado.malos||[]);q.ids.forEach(id=>anotar(id,ok||!malos.has(id)))}else q.ids.forEach(id=>anotar(id,ok));   // un tablero que cuenta como bien (a lo sumo un tropiezo) no baja a nadie a la caja 0: antes decía «¡Muy bien!» y mandaba 2 provincias a repasar
  sumarDia(ok);
  // lo que falló vuelve a aparecer al final de la ronda (una sola vez, y esa vuelta no cuenta en el puntaje)
  if(!R.test&&!ok&&!q.reintento&&!R.reint[q.ids.join()]&&q.tipo!=="unir"){R.reint[q.ids.join()]=1;const it=ITEM[q.ids[0]];if(it){try{const r=generar(q.tag,it,0);r.reintento=true;R.qs.push(r)}catch(e){}}}
  if(!R.test){
    const fb=$("feedback");fb.hidden=false;fb.className="feedback "+(ok?"bien":"mal");
    fb.innerHTML=`<div class="fbt">${ok?"✔ ¡Muy bien!":"✘ Casi… la respuesta es:"}</div>${ok?"":`<div class="fbr">${esc(q.mostrar||"")}</div>`}${q.nota?`<div class="fbn">${esc(q.nota)}</div>`:""}<div class="fbe">${esc(q.explic||"")}</div><button class="btn" id="bSig">${R.i+1>=R.qs.length?"Ver resultado":"Siguiente →"}</button>`;
    const b=$("bSig");setTimeout(()=>{try{b&&b.focus({preventScroll:true});fb.scrollIntoView({block:"nearest",behavior:"smooth"})}catch(e){}},30);
  }else setTimeout(()=>siguiente(),250);
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
  r.disabled=true;const b=$("bCheck");if(b)b.disabled=true;const ok=igual(dado,q.aceptar);if(!R.test)r.classList.add(ok?"si":"no");resolver(q,ok,dado);
}
function tocarMapaPreg(id){   // «Tocá en el mapa» (o «Tocá en el dibujo»): un toque es la respuesta
  const q=actual();if(!q||q.tipo!=="mapa"||q.estado.resuelta||esperando())return;
  const meta=q.dib?q.objetivo:q.ids[0],sv=$("pPreg").querySelector(q.dib?"svg.dibujo":"svg.mapa"),ok=id===meta;
  sv.classList.remove("clic");
  if(!R.test)sv.querySelectorAll("[data-id]").forEach(e=>{if(e.dataset.id===meta)e.classList.add("ok");else if(e.dataset.id===id)e.classList.add("mal")});
  resolver(q,ok,q.dib?(((IDEAS.info[q.dib]||{})[id]||{}).t||id):(ITEM[id]?ITEM[id].corto:""));
}
// «Ordenar»: cada toque pone un paso en el siguiente lugar (con su número); tocarlo de nuevo lo saca. Con todos puestos, «Listo» corrige (en el simulacro, sin decir si está bien)
function tocarPaso(i){
  const q=actual();if(!q||q.tipo!=="ordenar"||q.estado.resuelta)return;
  const o=q.estado.orden,k=o.indexOf(i);if(k>=0)o.splice(k,1);else o.push(i);
  $("orden").querySelectorAll(".paso").forEach((b,j)=>{const p=o.indexOf(j);b.classList.toggle("puesto",p>=0);b.setAttribute("aria-pressed",p>=0?"true":"false");b.querySelector(".paso-n").textContent=p>=0?String(p+1):""});
  $("bOrdenListo").disabled=o.length<q.pasos.length;
}
function terminarOrden(){
  const q=actual();if(!q||q.tipo!=="ordenar"||q.estado.resuelta||q.estado.orden.length<q.pasos.length)return;
  const o=q.estado.orden,dado=o.map(i=>q.pasos[i]),ok=dado.every((t,k)=>t===q.correcto[k]);
  $("orden").querySelectorAll(".paso").forEach((b,j)=>{b.disabled=true;if(!R.test)b.classList.add(q.correcto[o.indexOf(j)]===q.pasos[j]?"si":"no")});
  $("bOrdenListo").disabled=true;
  resolver(q,ok,dado.map((t,k)=>(k+1)+") "+t).join("  ·  "));
}
function tocarPar(lado,i){
  const q=actual();if(!q||q.estado.resuelta)return;const e=q.estado;
  const btn=$("pPreg").querySelector(`.par[data-lado="${lado}"][data-i="${i}"]`);if(!btn)return;
  if(R.test)return tocarParExamen(q,e,lado,i,btn);
  if(btn.classList.contains("hecho"))return;
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
// en el simulacro «unir» tampoco avisa si está bien: cada pareja queda marcada con un número (se deshace tocándola de nuevo) y se corrige todo junto al tocar «Listo»
function tocarParExamen(q,e,lado,i,btn){
  const P=$("pPreg"),par=e.parejas=e.parejas||[],bt=(l,k)=>P.querySelector(`.par[data-lado="${l}"][data-i="${k}"]`);
  const hecha=par.find(x=>(lado==="i"?x.a:x.d)===i);
  if(hecha){par.splice(par.indexOf(hecha),1);[bt("i",hecha.a),bt("d",hecha.d)].forEach(b=>{b.classList.remove("unido");b.removeAttribute("data-n")});$("bUnirListo").disabled=true;return}
  const prev=e.sel.find(s=>s.lado===lado);
  if(prev){bt(lado,prev.i).classList.remove("elegida");e.sel=e.sel.filter(s=>s.lado!==lado)}
  btn.classList.add("elegida");e.sel.push({lado,i});
  if(e.sel.length===2){
    const a=e.sel.find(s=>s.lado==="i").i,d=e.sel.find(s=>s.lado==="d").i;e.sel=[];
    const usados=new Set(par.map(x=>x.n));let n=1;while(usados.has(n))n++;
    par.push({a,d,n});
    [bt("i",a),bt("d",d)].forEach(b=>{b.classList.remove("elegida");b.classList.add("unido");b.dataset.n=n});
    $("bUnirListo").disabled=par.length<q.izq.length;
  }
}
function terminarUnir(){
  const q=actual();if(!q||q.tipo!=="unir"||q.estado.resuelta||!q.estado.parejas||q.estado.parejas.length<q.izq.length)return;
  const malos=[];q.estado.parejas.forEach(x=>{if(q.izq[x.a].id!==q.der[x.d].id)malos.push(q.izq[x.a].id,q.der[x.d].id)});
  q.estado.malos=malos;q.estado.fallos=malos.length/2;
  resolver(q,malos.length===0,"");
}
// el enunciado de una pregunta en una línea (para la lista «Para repasar»)
const enunciado=q=>q.resumen&&q.resumen!==q.consigna?q.resumen:"";   // en Naturales la consigna ES la pregunta: no se muestra dos veces
function terminar(){
  const n=R.qs.filter(q=>!q.reintento).length;
  if(R.test){ST.sims.push({f:FECHA(),p:R.ok,t:n,a:R.area||"sociales"});ST.sims=ST.sims.slice(-20)}
  ST.rondas++;guardar();
  const pct=Math.round(100*R.ok/n),msg=pct>=90?"🏆 ¡Excelente! Estás muy bien preparado.":pct>=70?"👏 ¡Muy bien! Repasá lo que falló y estás listo.":pct>=50?"💪 Vas bien. Un repaso más de lo que falló y mejora.":"📚 Hay que repasar un poco más. ¡Se puede!";
  ir("pFin");
  const falló=R.errores;
  $("pFin").innerHTML=`<header class="barra"><span></span><div class="titulo">${R.test?"Resultado del simulacro":"Resultado"}</div><span></span></header>
    <div class="nota"><div class="gran">${R.ok} <small>de ${n}</small></div><div class="pct2">${pct} %</div><p>${msg}</p></div>
    ${R.test?porParte():""}
    ${falló.length?`<h2>Para repasar (${falló.length})</h2><div class="errs">${falló.map(q=>`<div class="err"><div class="eq">${esc(q.consigna)}</div>${enunciado(q)?`<div class="ep">${esc(enunciado(q))}</div>`:""}<div class="er">✔ ${esc(q.mostrar||"")}</div>${q.estado.dado?`<div class="eu">✘ ${esc(q.estado.dado)}</div>`:""}<div class="ee">${esc(q.explic||"")}</div></div>`).join("")}</div>`:`<p class="sin">¡Sin errores!</p>`}
    <div class="acciones">${falló.length?`<button class="btn grande" id="bRepetirErr">🔁 Repasar lo que falló</button>`:""}${R.tipo?`<button class="btn" id="bOtra" data-act="${R.tipo}">▶ Otra ronda</button>`:!R.test?`<button class="btn" id="bOtraMezcla">▶ Otra ronda</button>`:""}<button class="btn sec" id="bInicioFin">🏠 Inicio</button></div>`;
}
// cómo le fue en cada parte del simulacro (para saber qué estudiar)
function porParte(){
  const m=new Map();R.qs.forEach(q=>{if(!q.parte)return;const e=m.get(q.parte)||{ok:0,t:0};e.t++;if(q.estado&&q.estado.ok)e.ok++;m.set(q.parte,e)});
  return `<h2>Por parte</h2><div class="partes">${[...m].map(([k,e])=>`<div class="pt"><span>${esc(k)}</span><b>${e.ok} / ${e.t}</b>${barraProg(Math.round(100*e.ok/e.t))}</div>`).join("")}</div>`;
}
// ---- simulacro: como una prueba (sin ver si estuvo bien hasta el final)
const N_SIM=35+(IDEAS.temas.some(t=>t.area==="sociales")?5:0);   // 30 de provincias (6 partes), 5 de los países limítrofes (parte G) y, si hay temas de ideas de Sociales, 5 de ellos (parte H)
const AYUDA_UNIR_EXAMEN="Tocá una provincia y después su capital. Para cambiar una pareja, tocala de nuevo. Al terminar, tocá «Listo».";
function armarSimulacro(){
  const qs=[],P=mezclar(PROVS),T=mezclar(INT.ITEMS);
  const poner=(lista,tipo,parte)=>lista.forEach(it=>qs.push({...generar(tipo,it,1),parte}));
  // las provincias se reparten para que lo que se ve en una parte no le regale la respuesta a otra: B (unir) y C (verdadero o falso) muestran 14 provincias con su capital;
  // D y F preguntan por 9 que NO aparecieron ahí; y A (la primera, antes de todo) puede repetir cualquiera de las 14
  const B=[P.slice(0,5),P.slice(5,10)],C=P.slice(10,14),D=P.slice(14,19),F=P.slice(19,23),A=sacar(P.slice(0,14),7);
  poner(A,"capEleg","A · Elegí la capital");
  B.forEach(l=>qs.push({...tableroUnir(l),ayuda:AYUDA_UNIR_EXAMEN,parte:"B · Uní provincias y capitales"}));
  poner(C,"vf","C · Verdadero o falso");
  poner(D,"capTipear","D · Escribí la capital");
  const mapa=T.slice(0,8);poner(mapa.slice(0,5),"mapaEleg","E · Mirá el mapa");poner(mapa.slice(5,8),"mapaTipear","E · Mirá el mapa");
  poner(F,"provEleg","F · ¿De qué provincia es capital?");
  // los cinco países limítrofes, uno por pregunta y de distinto tipo
  const tg=mezclar(["capEleg","mapaEleg","capTipear","provEleg","vf"]);
  mezclar(PAISES).forEach((it,i)=>qs.push({...generar(tg[i%tg.length],it,1),parte:"G · Países limítrofes"}));
  // H · las ideas de Sociales (la época colonial): 2 de elegir, 1 de verdadero o falso, 1 de escribir y un tablero de unir, todo de ideas distintas
  if(ideasDe("sociales").length){const us=new Set(),H="H · La época colonial";
    qs.push(...preguntasIdeas("sociales","cnMc",2,H,us),...preguntasIdeas("sociales","cnVf",1,H,us),...preguntasIdeas("sociales","cnTipear",1,H,us),...tablerosExamen("sociales",1,H,AYUDA_UNIR_IDEAS,us));
  }
  return qs;
}
// ---- las ideas y los temas de cada materia (Naturales y Sociales traen temas de ideas), y cómo se arman con ellos las preguntas de una prueba
const temasDe=a=>IDEAS.temas.filter(t=>t.area===a),ideasDe=a=>[].concat(...temasDe(a).map(t=>t.conceptos));
const AYUDA_UNIR_IDEAS="Tocá una idea y después lo que le corresponde. Para cambiar una pareja, tocala de nuevo. Al terminar, tocá «Listo».";
// n preguntas de un tipo, de ideas distintas de una materia (primero las que todavía no salieron en la prueba, que se anotan en «usados»)
function preguntasIdeas(area,tipo,n,parte,usados){
  const propias=new Set(ideasDe(area).map(x=>x.id)),l=mezclar(ELEGIBLES[tipo].filter(x=>propias.has(x.id))),orden=l.filter(x=>!usados.has(x.id)).concat(l.filter(x=>usados.has(x.id))),vistas=new Set(),qs=[];
  for(const it of orden){if(qs.length>=n)break;const q=generarIdea(tipo,it,1,vistas);if(vistas.has(q.clave))continue;vistas.add(q.clave);usados.add(it.id);qs.push({...q,parte})}
  return qs;
}
// n tableros de unir, de temas distintos de una materia (sus ideas pasan a «usados»: los tableros son lo que más «regala», porque muestran muchas ideas con su respuesta)
function tablerosExamen(area,n,parte,ayuda,usados){
  return mezclar(temasDe(area).filter(t=>t.tableros.length)).slice(0,n).map(t=>{const i=azar(0,t.tableros.length-1);t.tableros[i].pares.forEach(p=>usados.add(p[0]));return {...tableroUnirIdea(t,i),ayuda,parte}});
}
// ---- simulacro de Naturales (también sin ver si estuvo bien hasta el final): preguntas de todos sus temas en seis partes; se procura que una idea no aparezca en dos partes
const N_SIM_NAT=19+Math.min(2,temasDe("naturales").length);   // 6 + 4 + 4 + 2 + 3 y dos tableros de unir
function armarSimulacroNat(){
  const usados=new Set(),poner=(tipo,n,parte)=>preguntasIdeas("naturales",tipo,n,parte,usados);
  const E=tablerosExamen("naturales",2,"E · Uní las ideas",AYUDA_UNIR_IDEAS,usados);   // primero los tableros: sus ideas se evitan en las demás partes
  const A=poner("cnMc",6,"A · Elegí la respuesta"),B=poner("cnVf",4,"B · Verdadero o falso"),C=poner("cnTocar",3,"C · Mirá el dibujo").concat(poner("cnEstacion",1,"C · Mirá el dibujo")),D=poner("cnOrdenar",2,"D · Ordená"),F=poner("cnTipear",3,"F · Escribí");
  return [...A,...B,...C,...D,...E,...F];
}
// ---- memotest: se dan vuelta de a dos cartas (una provincia o un país y su capital; en Naturales, una idea y lo que le corresponde)
let MM=null;
function memotestIdeas(t){   // las parejas de UN tablero del tema (4 o 5): si se mezclaran tableros, el texto de una pareja podría servir también para otra idea y el chico tendría razón y el juego no
  const tab=elegir(t.def.tableros),pares=tab.pares.slice();
  MM={cartas:mezclar(pares.flatMap(p=>[{id:p[0],lado:"n",t:p[1]},{id:p[0],lado:"c",t:p[2]}])),abiertas:[],hechas:new Set(),intentos:0,fallos:{},bloq:false,items:pares.map(p=>ITEM[p[0]]),tema:t};
  pintarMemo();ir("pMemo");
}
function memotest(){
  if(TEMA_ACT.tipo==="ciencia")return memotestIdeas(TEMA_ACT);
  const t=TEMA_ACT,pool=t.items.filter(x=>x.tipo!=="ciudad"),n=Math.min(6,pool.length),x=[];
  for(let i=0;i<n;i++)x.push(elegirItem(pool.filter(p=>!x.includes(p)),null));
  MM={cartas:mezclar(x.flatMap(it=>[{id:it.id,lado:"n",t:it.corto},{id:it.id,lado:"c",t:it.capital}])),abiertas:[],hechas:new Set(),intentos:0,fallos:{},bloq:false,items:x,tema:t};
  pintarMemo();ir("pMemo");
}
function pintarMemo(){
  $("pMemo").innerHTML=`<header class="barra"><button class="atras" id="bSalirMemo" aria-label="Salir">✕</button><div class="titulo">🃏 Memotest</div><span class="intentos" id="mmInt" aria-live="polite">${MM.intentos}</span></header>
    <div class="sub">Dale vuelta a dos cartas: ${MM.tema.tipo==="ciencia"?"una idea y lo que le corresponde":MM.tema.tipo==="paises"?"un país y su capital":"una provincia y su capital"}.</div>
    <div class="memo n${MM.cartas.length}${MM.tema.tipo==="ciencia"?" largo":""}">${MM.cartas.map((c,i)=>`<button class="cm ${c.lado==="n"?"prov":"capi"}" data-c="${i}" aria-label="Carta ${i+1}"><span class="cm-f" aria-hidden="true">?</span><span class="cm-b">${esc(c.t)}</span></button>`).join("")}</div>`;
}
function tocarCarta(i){
  if(!MM||MM.bloq||MM.abiertas.includes(i)||MM.hechas.has(i))return;
  const bs=$("pMemo").querySelectorAll(".cm");bs[i].classList.add("abierta");bs[i].setAttribute("aria-label",MM.cartas[i].t);MM.abiertas.push(i);
  if(MM.abiertas.length<2)return;
  MM.intentos++;$("mmInt").textContent=MM.intentos;
  const [a,b]=MM.abiertas,ca=MM.cartas[a],cb=MM.cartas[b];
  if(ca.id===cb.id&&ca.lado!==cb.lado){MM.hechas.add(a);MM.hechas.add(b);bs[a].classList.add("hecha");bs[b].classList.add("hecha");MM.abiertas=[];if(MM.hechas.size===MM.cartas.length)setTimeout(finMemo,500)}
  else{MM.fallos[ca.id]=(MM.fallos[ca.id]||0)+1;MM.fallos[cb.id]=(MM.fallos[cb.id]||0)+1;MM.bloq=true;
    setTimeout(()=>{bs[a].classList.remove("abierta");bs[b].classList.remove("abierta");bs[a].setAttribute("aria-label","Carta "+(a+1));bs[b].setAttribute("aria-label","Carta "+(b+1));MM.abiertas=[];MM.bloq=false},850)}
}
function finMemo(){
  if(!MM)return;
  MM.items.forEach(it=>{const ok=(MM.fallos[it.id]||0)<2;anotar(it.id,ok);sumarDia(ok)});
  ST.rondas++;guardar();
  const n=MM.intentos,k=MM.items.length;ir("pFin");
  $("pFin").innerHTML=`<header class="barra"><span></span><div class="titulo">Memotest</div><span></span></header>
    <div class="nota"><div class="gran">${n} <small>intentos</small></div><p>${n<=k+2?"🏆 ¡Memoria de campeón!":n<=2*k?"👏 ¡Muy bien!":"💪 Seguí practicando: cada vez sale mejor."} (lo mejor posible son ${k})</p></div>
    <div class="acciones"><button class="btn grande" id="bOtraMemo">🃏 Otro memotest</button><button class="btn sec" id="bInicioFin">🏠 Inicio</button></div>`;
  MM=null;R=null;
}
// ---- ajustes
function pintarAjustes(){
  $("pAjustes").innerHTML=barra("⚙️ Ajustes","pInicio")+`<div class="ajustes">
    <label class="campo" for="aFecha"><span>📅 Fecha de la prueba (para la cuenta regresiva)</span><input type="date" id="aFecha" value="${esc(ST.fecha)}"></label>
    <button class="btn sec" id="aSinFecha" ${ST.fecha?"":"disabled"}>Sacar la fecha</button>
    <label class="fila"><input type="checkbox" id="aEtq" ${ST.etq?"checked":""}><span>Mostrar los nombres en el mapa para estudiar</span></label>
    <p class="nota-aj">Las provincias y sus capitales son las de la República Argentina (23 provincias y la Ciudad Autónoma de Buenos Aires); los países limítrofes son Chile, Bolivia, Paraguay, Brasil y Uruguay. Los mapas se armaron con datos públicos de Natural Earth. ${IDEAS.temas.length?`Los resúmenes, los dibujos y los ejercicios de ${[["Naturales","naturales"],["Sociales","sociales"]].filter(([,a])=>temasDe(a).length).map(([n,a])=>n+" ("+temasDe(a).map(t=>t.paginas).join(", ")+")").join(" y de ")} están hechos con otras palabras a partir de las páginas del libro: si algo no coincide con el libro, vale el libro. `:""}Todo lo que hacés queda sólo en este aparato.</p>
    <button class="btn peligro" id="aBorrar">Borrar mi progreso</button></div>`;
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
  const refrescar=()=>{if(!$("pInicio").hidden)pintarInicio()};   // la cuenta regresiva cambia a la medianoche: si el inicio quedó abierto, se actualiza al volver a la pestaña
  document.addEventListener("visibilitychange",()=>{if(!document.hidden)refrescar()});window.addEventListener("pageshow",refrescar);
  document.addEventListener("click",e=>{
    const svg=e.target.closest&&e.target.closest("svg.mapa,svg.dibujo");
    if(svg){const el=e.target.closest("[data-id]");if(!el)return;const id=el.dataset.id;
      if(svg.closest("#pMapa")){pintarMapaEstudio(id);return}
      if(svg.closest("#pEst")){infoDibujo(svg,id);return}
      if(svg.closest("#pPreg")&&svg.classList.contains("clic"))tocarMapaPreg(id);
      return}
    const el=e.target.closest("button");if(!el)return;
    if(esperando())return;
    if(el.id==="bSig"&&window.__INT_SIN_ESPERA!==true&&performance.now()-ULT_RESP<400)return;   // «Siguiente» no se activa con el segundo toque (o la segunda tecla Enter) de la misma respuesta
    if(el.dataset.ir){const d=el.dataset.ir;if(d==="pAjustes")pintarAjustes();if(d==="pInicio")pintarInicio();if(d==="pTema")pintarTema(TEMA_ACT);return ir(d)}
    if(el.dataset.tema){const t=INT.tema(el.dataset.tema);if(t){TEMA_ACT=t;pintarTema(t);return ir("pTema")}return}
    if(el.dataset.ver){if(TEMA_ACT.tipo==="ciencia"){pintarEstudio(TEMA_ACT,"resumen",el.dataset.ver);return ir("pEst")}pintarMapaEstudio(el.dataset.ver);return ir("pMapa")}
    if(el.dataset.tab){pintarEstudio(EST.t||TEMA_ACT,el.dataset.tab);window.scrollTo(0,0);return}
    if(el.id==="bEstudiar"){pintarEstudio(TEMA_ACT,null);return ir("pEst")}
    if(el.id==="bMapaEst"){pintarMapaEstudio(null);return ir("pMapa")}
    if(el.id==="bPracticar")return ronda({n:10,tema:TEMA_ACT});
    if(el.id==="bOtraMezcla")return ronda({n:10,tema:R&&R.tema||null});
    if(el.dataset.act){const t=el.id==="bOtra"&&R&&R.tema?R.tema:TEMA_ACT;return ronda({tipo:el.dataset.act,tema:t,n:nRonda(el.dataset.act,t)})}
    if(el.id==="bMemo"||el.id==="bOtraMemo")return memotest();
    if(el.id==="bSalirMemo"){confirmar("¿Salir del memotest? No se guarda lo que hiciste.",()=>{MM=null;pintarTema(TEMA_ACT);ir("pTema")},"Salir");return}
    if(el.classList.contains("cm"))return tocarCarta(+el.dataset.c);
    if(el.id==="bSim")return ronda({qs:armarSimulacro(),test:true,area:"sociales"});
    if(el.id==="bSimNat")return ronda({qs:armarSimulacroNat(),test:true,area:"naturales"});
    if(el.id==="bErrores"){const ids=TODO.filter(it=>aprendiendo(it.id)).map(it=>it.id);if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2))});return}
    if(el.id==="bRepetirErr"){const ids=[...new Set(R.errores.flatMap(q=>q.tipo==="unir"&&q.estado.malos&&q.estado.malos.length?q.estado.malos:q.ids))].filter(id=>ITEM[id]);if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2)),tipo:R.tipo,tema:R.tema});return}
    if(el.id==="bInicioFin"){pintarInicio();return ir("pInicio")}
    if(el.id==="bSalir"){confirmar("¿Salir de la ronda? Lo que ya contestaste queda guardado.",()=>{R=null;pintarInicio();ir("pInicio")},"Salir");return}
    if(el.id==="bSig")return siguiente();
    if(el.id==="bCheck")return comprobarTipear();
    if(el.classList.contains("opcion"))return comprobarMC(+el.dataset.i);
    if(el.classList.contains("paso"))return tocarPaso(+el.dataset.p);
    if(el.id==="bOrdenListo")return terminarOrden();
    if(el.classList.contains("par"))return tocarPar(el.dataset.lado,+el.dataset.i);
    if(el.id==="bUnirListo")return terminarUnir();
    if(el.id==="aSinFecha"){ST.fecha="";guardar();pintarAjustes();return}
    if(el.id==="aBorrar"){confirmar("¿Borrar todo lo que hiciste (lo aprendido, los simulacros y los días)? No se puede deshacer.",()=>{ST={v:1,fecha:ST.fecha,etq:ST.etq,items:Object.create(null),dias:{},sims:[],rondas:0};guardar();pintarAjustes()},"Borrar");return}
  });
  document.addEventListener("change",e=>{
    const i=e.target.id;
    if(i==="aFecha"){const v=e.target.value,b=$("aSinFecha");if(v===""){ST.fecha="";guardar();if(b)b.disabled=true}else if(FECHA_OK(v)){ST.fecha=v;guardar();if(b)b.disabled=false}}   // sin volver a pintar: un año a medio teclear («0002») no se guarda y el campo no se pierde
    else if(i==="aEtq"||i==="mEtq"){ST.etq=e.target.checked;guardar();if(!$("pMapa").hidden)pintarMapaEstudio($("pMapa").dataset.sel||null)}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="resp"){e.preventDefault();comprobarTipear()}else if(e.key==="Escape"&&!$("modal").hidden){$("modal").hidden=true;$("modal").innerHTML=""}});
}
// para las pruebas
INT.gen=(tipo,id,c)=>generar(tipo,ITEM[id],c);INT.tipos=()=>POOL;INT.ELEGIBLES=ELEGIBLES;INT.ACTIVIDADES=ACTIVIDADES;INT.ACTIVIDADES_PAIS=ACTIVIDADES_PAIS;INT.N_SIM=N_SIM;
INT.rondaCon=(qs,test)=>ronda({qs,test:!!test});INT.estado=()=>ST;INT.actual=actual;INT.ronda=()=>R;INT.armarSimulacro=armarSimulacro;INT.NORM=NORM;INT.dominio=dominio;INT.mapaHTML=mapaHTML;INT.mapaLimHTML=mapaLimHTML;INT.memo=()=>MM;
INT.ACTIVIDADES_IDEAS=ACTIVIDADES_IDEAS;INT.N_SIM_NAT=N_SIM_NAT;INT.armarSimulacroNat=armarSimulacroNat;INT.tablerosDe=tablerosDe;INT.cuantas=cuantas;INT.nRonda=nRonda;INT.POOL_IDEA=POOL_IDEA;
arrancar();pintarInicio();ir("pInicio",true);
})();
