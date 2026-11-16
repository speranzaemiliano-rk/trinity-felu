// «Prueba final integradora · Felipe»: estudiar, practicar y hacer un simulacro. Por ahora, Sociales: las provincias argentinas y sus capitales, y los países limítrofes y sus capitales (con mapas para ubicarlos).
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
const FECHA_OK=s=>/^\d{4}-\d{2}-\d{2}$/.test(String(s||""))&&!isNaN(Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)));
// cómo se comparan las respuestas escritas: sin mayúsculas, sin tildes, sin signos y sin espacios de más («cordoba» = «Córdoba»)
const NORM=s=>String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const igual=(dado,aceptar)=>aceptar.some(x=>NORM(x)===NORM(dado));
const fmtFecha=s=>{try{const t=new Date(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)).toLocaleDateString("es-AR",{weekday:"long",day:"numeric",month:"long"});return t.charAt(0).toUpperCase()+t.slice(1)}catch(e){return s}};

// ---------------- los ítems (por id; sin prototipo, así un id raro como «constructor» no existe)
const ITEM=Object.create(null);INT.TODOS.forEach(it=>{ITEM[it.id]=it});
const PROVS=INT.PROVINCIAS,CABA=INT.CABA,PAISES=INT.PAISES,TODOS=INT.TODOS,TEMA=INT.tema("provincias");
let TEMA_ACT=TEMA;   // el tema que se está mirando (las provincias o los países limítrofes)

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
      if(Array.isArray(o.sims))base.sims=o.sims.slice(-20).filter(s=>s&&typeof s==="object").map(s=>({f:FECHA_OK(s.f)?s.f:"",p:NUM(s.p),t:Math.max(1,NUM(s.t,200))}));
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
  const otras=PROVS.filter(x=>x!==it).map(x=>x.corto).concat(it.id==="caba"?[]:[CABA.corto]);
  const par=mezclar(otras.filter(x=>raiz(x)===raiz(it.corto))).slice(0,1);
  const trampa=it.id==="buenosaires"?[CABA.corto]:it.id==="caba"?[ITEM.buenosaires.corto]:[];
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
const aceptaProv=it=>[it.corto,it.nombre,...it.altNombre];

function tableroUnir(l,K){   // un tablero de «unir»: 5 provincias (o los 5 países) a la izquierda y sus capitales, desordenadas, a la derecha
  K=K||KIND.provincia;
  return {ids:l.map(x=>x.id),tipo:"unir",tag:"unir",resumen:"Unir "+K.colA.toLowerCase()+" con sus capitales",consigna:K.unir,ayuda:K.unir_a,colA:K.colA,izq:l.map(x=>({t:x.corto,id:x.id})),der:mezclarDistinto(l.map(x=>({t:x.capital,id:x.id}))),mostrar:l.map(x=>x.corto+" → "+x.capital).join("  ·  "),explic:l.map(x=>x.corto+": "+x.capital).join("  ·  ")};
}
function generar(tipo,it,c){
  c=Math.max(0,c||0);
  if(it.tipo==="ciudad"&&!["mapaEleg","mapaTipear","vf"].includes(tipo))throw new Error("la Ciudad de Buenos Aires no tiene capital: "+tipo);
  const K=kindDe(it),base={ids:[it.id],tag:tipo};
  switch(tipo){
    case "capEleg":return {...base,tipo:"mc",resumen:"Capital de "+it.corto,consigna:K.capEleg,ayuda:"¿Cuál es la capital?",cuerpo:nombreProv(it),opciones:opciones(it.capital,malasCaps(it,c),4),mostrar:it.capital,explic:expCap(it)};
    case "provEleg":return {...base,tipo:"mc",resumen:K.provEleg.replace(/\?$/," "+it.capital+"?"),consigna:K.provEleg,ayuda:K.provEleg_a,cuerpo:`<div class="sub2">capital</div><div class="pal">${esc(it.capital)}</div>`,opciones:opciones(it.corto,malasProvs(it),4),mostrar:it.corto,explic:expCap(it)};
    case "vf":{
      let texto,ok,explic;
      if(it.tipo==="ciudad"){ok=Math.random()<.5;texto=ok?"La Ciudad de Buenos Aires es la capital de la Argentina.":"La Ciudad de Buenos Aires es la capital de la provincia de Buenos Aires.";explic=it.nota}
      else{ok=Math.random()<.5;const falsa=elegir(malasCaps(it,1).slice(0,2));texto=K.vf(it)+(ok?it.capital:falsa)+".";explic=ok?expCap(it):"En realidad, "+expCap(it).replace(/^L/,"l")}
      return {...base,tipo:"mc",resumen:texto,consigna:"¿Verdadero o falso?",ayuda:"Leé la oración y decidí.",cuerpo:`<div class="frase">${esc(texto)}</div>`,opciones:[{t:"Verdadero",ok:ok},{t:"Falso",ok:!ok}],mostrar:ok?"Verdadero":"Falso",explic};
    }
    case "capTipear":return {...base,tipo:"tipear",resumen:"Capital de "+it.corto,consigna:K.capTipear,ayuda:"Escribila (no hace falta poner tildes ni mayúsculas).",pista:"La capital es…",cuerpo:nombreProv(it),aceptar:[it.capital,...it.altCapital],mostrar:it.capital,explic:expCap(it)};
    case "provTipear":return {...base,tipo:"tipear",resumen:K.provEleg.replace(/\?$/," "+it.capital+"?"),consigna:K.provTipear,ayuda:K.provTipear_a,pista:K.provTipear_p,cuerpo:`<div class="sub2">capital</div><div class="pal">${esc(it.capital)}</div>`,aceptar:aceptaProv(it),mostrar:it.corto,explic:expCap(it)};
    case "mapaEleg":return {...base,tipo:"mc",mapa:1,resumen:K.resMapa,consigna:it.tipo==="ciudad"?"¿Qué es el punto pintado en el mapa?":K.mapaEleg,ayuda:"Mirá bien el mapa.",cuerpo:mapaDe(it,{res:it.id}),opciones:opciones(it.corto,malasProvs(it),4),mostrar:it.corto,explic:expProv(it)};
    case "mapaTipear":return {...base,tipo:"tipear",mapa:1,resumen:K.resMapa,consigna:it.tipo==="ciudad"?"Escribí qué es el punto pintado en el mapa.":K.mapaTipear,ayuda:"Escribila (no hace falta poner tildes ni mayúsculas).",pista:K.mapaTipear_p,cuerpo:mapaDe(it,{res:it.id}),aceptar:aceptaProv(it),mostrar:it.corto,explic:expProv(it)};
    case "mapaToca":return {...base,tipo:"mapa",mapa:1,resumen:"Tocar en el mapa: "+it.corto,consigna:"Tocá en el mapa:",ayuda:K.toca_a,cuerpo:`<div class="pal">${esc(it.corto)}</div>`+mapaDe(it,{clic:true}),mostrar:it.corto,explic:expProv(it)};
    case "unir":return tableroUnir([it,...sacar(grupoDe(it).filter(x=>x!==it),4)],K);
  }
  throw new Error("tipo raro: "+tipo);
}
// qué tipos de pregunta le tocan a un ítem según su caja (la 0: elegir; la 1 y la 2: ubicar en el mapa, unir y trampas; de la 3 en adelante: escribir, como en la prueba)
const POOL=[["capEleg","provEleg","mapaEleg","vf"],["mapaEleg","mapaToca","capEleg","provEleg","unir","vf"],["capTipear","provTipear","mapaTipear","mapaToca","unir"]];
function tipoPara(it,c){
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

// ---------------- la ronda en curso (práctica, una actividad, repaso o simulacro)
let R=null;
function ronda(opts){   // opts: {tipo (una sola actividad), ids (ítems puntuales), tema (se pregunta sólo de ese tema), n, test, qs}
  const qs=[];
  if(opts.qs)opts.qs.forEach(q=>qs.push(q));
  else{
    const n=opts.n||10;let ult=null;
    for(let i=0;i<n;i++){
      let pool=opts.ids?opts.ids.map(id=>ITEM[id]).filter(Boolean):opts.tema?opts.tema.items:TODOS;
      if(opts.tipo)pool=pool.filter(x=>ELEGIBLES[opts.tipo].includes(x));
      if(!pool.length)pool=opts.tipo?ELEGIBLES[opts.tipo]:TODOS;
      const x=elegirItem(pool,ult);ult=x.id;
      const tipo=opts.tipo||tipoPara(x,Math.max(0,caja(x.id)));
      let q;try{q=generar(tipo,x,Math.max(0,caja(x.id)))}catch(e){q=generar("mapaEleg",x,0)}
      qs.push(q);
    }
  }
  R={qs,i:0,ok:0,mal:0,errores:[],test:!!opts.test,reint:{},tipo:opts.tipo||null,tema:opts.tema||null};
  mostrarPregunta();
}
const actual=()=>R&&R.qs[R.i];

// ---------------- pantallas
const PANT=["pInicio","pTema","pMapa","pPreg","pMemo","pFin","pAjustes"];
function ir(p){PANT.forEach(x=>{$(x).hidden=x!==p});window.scrollTo(0,0)}
function barra(titulo,atras,extra){return `<header class="barra"><button class="atras" data-ir="${atras}" aria-label="Volver">⬅</button><div class="titulo">${titulo}</div>${extra||"<span></span>"}</header>`}
const barraProg=i=>`<span class="prog" aria-hidden="true"><i style="width:${i}%"></i></span>`;

const progresoTema=t=>{const m=dominio(t.items);return `<button class="tema-btn" data-tema="${t.id}"><span class="tb-t"><b>${esc(t.ico)} ${esc(t.nombre)}</b><small>${m.aprendidas} de ${m.n} aprendidas</small></span>${barraProg(m.pct)}</button>`};
function pintarInicio(){
  const hoy=FECHA(),d=ST.fecha?diasEntre(hoy,ST.fecha):null;
  const cuenta=ST.fecha?`<div>${d>1?`Faltan <b>${d} días</b>`:d===1?`<b>¡Es mañana!</b>`:d===0?`<b>¡Es hoy! Mucha suerte</b>`:`La prueba fue el ${esc(fmtFecha(ST.fecha))}`}</div><small>${esc(fmtFecha(ST.fecha))}</small>`:`<div>¡Hola, ${esc(INT.ALUMNO)}!</div><small>Elegí qué querés estudiar</small>`;
  const err=TODOS.filter(it=>aprendiendo(it.id)),sims=ST.sims,mejor=sims.length?Math.max(...sims.map(s=>Math.round(100*s.p/s.t))):null;
  $("pInicio").innerHTML=`<header class="barra"><div class="logo">📚</div><div class="titulo">${esc(INT.NOMBRE)}</div><button class="atras" data-ir="pAjustes" aria-label="Ajustes">⚙️</button></header>
    <section class="cuenta">${cuenta}</section>
    <div class="areas">${INT.AREAS.map(a=>a.pronto?`<div class="area a-${a.color} pronto"><span class="aico" aria-hidden="true">${a.ico}</span><span class="atxt"><b>${esc(a.nombre)}</b><small>Pronto: se van a sumar los temas</small></span></div>`:
      `<div class="area a-${a.color}" data-area="${a.id}"><span class="aico" aria-hidden="true">${a.ico}</span><span class="atxt"><b>${esc(a.nombre)}</b><span class="temas">${a.temas.map(progresoTema).join("")}</span></span></div>`).join("")}</div>
    <div class="acciones"><button class="btn grande" id="bSim">📝 Simulacro de la prueba<small>${mejor===null?N_SIM+" preguntas como las de una prueba, sin ver si estuvo bien hasta el final":"tu mejor resultado: "+mejor+" %"}</small></button>
      <button class="btn sec" id="bErrores" ${err.length?"":"disabled"}>🔁 Repasar lo que me salió mal<small>${err.length?err.length+(err.length===1?" cosa":" cosas"):"nada por ahora"}</small></button></div>
    <p class="pie">Hoy: ${(ST.dias[hoy]||[0,0])[0]} bien · ${(ST.dias[hoy]||[0,0])[1]} mal</p>`;
}
const puntos=c=>`<span class="cajas" aria-label="Caja ${Math.max(0,c)} de 4">${[1,2,3,4].map(k=>`<i class="${c>=k?"on":""}"></i>`).join("")}</span>`;
function pintarTema(t){
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
  let h=barraPreg()+(q.parte?`<div class="parte">${esc(q.parte)}</div>`:"")+`<div class="consigna"><b>${esc(q.consigna)}</b><small>${esc(q.ayuda||"")}</small></div><div class="cuerpo${q.mapa?" conmapa"+(q.tipo==="mapa"?" toca":""):""}">${q.cuerpo||""}</div>`;
  if(q.tipo==="mc")h+=`<div class="opciones n${q.opciones.length}${q.opciones.some(o=>o.t.length>22)?" largas":""}">${q.opciones.map((o,i)=>`<button class="opcion" data-i="${i}">${esc(o.t)}</button>`).join("")}</div>`;
  else if(q.tipo==="tipear")h+=`<input id="resp" class="resp" type="text" autocomplete="off" autocapitalize="sentences" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${esc(q.pista||"Escribí acá…")}" aria-label="Tu respuesta"><button class="btn" id="bCheck">Listo ✔</button>`;
  else if(q.tipo==="unir")h+=`<div class="unir"><div class="col" id="izq"><div class="colt">${esc(q.colA||"Provincias")}</div>${q.izq.map((x,i)=>`<button class="par" data-lado="i" data-i="${i}">${esc(x.t)}</button>`).join("")}</div><div class="col" id="der"><div class="colt">Capitales</div>${q.der.map((x,i)=>`<button class="par" data-lado="d" data-i="${i}">${esc(x.t)}</button>`).join("")}</div></div>`;
  h+=`<div class="feedback" id="feedback" role="status" aria-live="polite" hidden></div>`;
  $("pPreg").innerHTML=h;$("pPreg").classList.toggle("pmapa",!!q.mapa);
  q.estado={pares:0,fallos:0,resuelta:false,sel:[]};
  if(q.tipo==="tipear"){const r=$("resp");setTimeout(()=>{try{r.focus({preventScroll:true})}catch(e){}},60)}
}
function resolver(q,ok,dado){   // se corrigió la pregunta: se anota, se muestra qué pasó y se pasa a la siguiente
  if(q.estado.resuelta)return;q.estado.resuelta=true;q.estado.ok=ok;q.estado.dado=dado;
  if(!q.reintento){if(ok)R.ok++;else{R.mal++;R.errores.push(q)}}
  if(q.tipo==="unir"){const malos=new Set(q.estado.malos||[]);q.ids.forEach(id=>anotar(id,!malos.has(id)))}else q.ids.forEach(id=>anotar(id,ok));
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
function tocarMapaPreg(id){   // «Tocá en el mapa»: un toque es la respuesta
  const q=actual();if(!q||q.tipo!=="mapa"||q.estado.resuelta)return;
  const ok=id===q.ids[0];
  if(!R.test){const sv=$("pPreg").querySelector("svg.mapa");sv.classList.remove("clic");sv.querySelectorAll("[data-id]").forEach(e=>{if(e.dataset.id===q.ids[0])e.classList.add("ok");else if(e.dataset.id===id)e.classList.add("mal")})}
  else $("pPreg").querySelector("svg.mapa").classList.remove("clic");
  resolver(q,ok,ITEM[id]?ITEM[id].corto:"");
}
function tocarPar(lado,i){
  const q=actual();if(!q||q.estado.resuelta)return;const e=q.estado;
  const btn=$("pPreg").querySelector(`.par[data-lado="${lado}"][data-i="${i}"]`);if(!btn||btn.classList.contains("hecho"))return;
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
// el enunciado de una pregunta en una línea (para la lista «Para repasar»)
const enunciado=q=>q.resumen||q.consigna||"";
function terminar(){
  const n=R.qs.filter(q=>!q.reintento).length;
  if(R.test){ST.sims.push({f:FECHA(),p:R.ok,t:n});ST.sims=ST.sims.slice(-20)}
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
const N_SIM=35;   // 30 de provincias (6 partes) y 5 de los países limítrofes (parte G)
function armarSimulacro(){
  const qs=[],P=mezclar(PROVS),T=mezclar(INT.ITEMS);
  const poner=(lista,tipo,parte)=>lista.forEach(it=>qs.push({...generar(tipo,it,1),parte}));
  poner(P.slice(0,7),"capEleg","A · Elegí la capital");
  // dos tableros de unir con 5 provincias cada uno (10 provincias distintas)
  [P.slice(7,12),P.slice(12,17)].forEach(l=>qs.push({...tableroUnir(l),parte:"B · Uní provincias y capitales"}));
  poner(P.slice(17,21),"vf","C · Verdadero o falso");
  poner(sacar(PROVS,5),"capTipear","D · Escribí la capital");
  const mapa=T.slice(0,8);poner(mapa.slice(0,5),"mapaEleg","E · Mirá el mapa");poner(mapa.slice(5,8),"mapaTipear","E · Mirá el mapa");
  poner(sacar(PROVS,4),"provEleg","F · ¿De qué provincia es capital?");
  // los cinco países limítrofes, uno por pregunta y de distinto tipo
  const tg=mezclar(["capEleg","mapaEleg","capTipear","provEleg","vf"]);
  mezclar(PAISES).forEach((it,i)=>qs.push({...generar(tg[i%tg.length],it,1),parte:"G · Países limítrofes"}));
  return qs;
}
// ---- memotest: se dan vuelta de a dos cartas (una provincia o un país y su capital)
let MM=null;
function memotest(){
  const t=TEMA_ACT,pool=t.items.filter(x=>x.tipo!=="ciudad"),n=Math.min(6,pool.length),x=[];
  for(let i=0;i<n;i++)x.push(elegirItem(pool.filter(p=>!x.includes(p)),null));
  MM={cartas:mezclar(x.flatMap(it=>[{id:it.id,lado:"n",t:it.corto},{id:it.id,lado:"c",t:it.capital}])),abiertas:[],hechas:new Set(),intentos:0,fallos:{},bloq:false,items:x,tema:t};
  pintarMemo();ir("pMemo");
}
function pintarMemo(){
  $("pMemo").innerHTML=`<header class="barra"><button class="atras" id="bSalirMemo" aria-label="Salir">✕</button><div class="titulo">🃏 Memotest</div><span class="intentos" id="mmInt" aria-live="polite">${MM.intentos}</span></header>
    <div class="sub">Dale vuelta a dos cartas: ${MM.tema.tipo==="paises"?"un país":"una provincia"} y su capital.</div>
    <div class="memo n${MM.cartas.length}">${MM.cartas.map((c,i)=>`<button class="cm ${c.lado==="n"?"prov":"capi"}" data-c="${i}" aria-label="Carta ${i+1}"><span class="cm-f" aria-hidden="true">?</span><span class="cm-b">${esc(c.t)}</span></button>`).join("")}</div>`;
}
function tocarCarta(i){
  if(!MM||MM.bloq||MM.abiertas.includes(i)||MM.hechas.has(i))return;
  const bs=$("pMemo").querySelectorAll(".cm");bs[i].classList.add("abierta");MM.abiertas.push(i);
  if(MM.abiertas.length<2)return;
  MM.intentos++;$("mmInt").textContent=MM.intentos;
  const [a,b]=MM.abiertas,ca=MM.cartas[a],cb=MM.cartas[b];
  if(ca.id===cb.id&&ca.lado!==cb.lado){MM.hechas.add(a);MM.hechas.add(b);bs[a].classList.add("hecha");bs[b].classList.add("hecha");MM.abiertas=[];if(MM.hechas.size===MM.cartas.length)setTimeout(finMemo,500)}
  else{MM.fallos[ca.id]=(MM.fallos[ca.id]||0)+1;MM.fallos[cb.id]=(MM.fallos[cb.id]||0)+1;MM.bloq=true;
    setTimeout(()=>{bs[a].classList.remove("abierta");bs[b].classList.remove("abierta");MM.abiertas=[];MM.bloq=false},850)}
}
function finMemo(){
  if(!MM)return;
  MM.items.forEach(it=>{const ok=(MM.fallos[it.id]||0)<2;anotar(it.id,ok);sumarDia(ok)});
  ST.rondas++;guardar();
  const n=MM.intentos,k=MM.items.length;ir("pFin");
  $("pFin").innerHTML=`<header class="barra"><span></span><div class="titulo">Memotest</div><span></span></header>
    <div class="nota"><div class="gran">${n} <small>intentos</small></div><p>${n<=k+2?"🏆 ¡Memoria de campeón!":n<=2*k?"👏 ¡Muy bien!":"💪 Sigan practicando: cada vez sale mejor."} (lo mejor posible son ${k})</p></div>
    <div class="acciones"><button class="btn grande" id="bOtraMemo">🃏 Otro memotest</button><button class="btn sec" id="bInicioFin">🏠 Inicio</button></div>`;
  MM=null;R=null;
}
// ---- ajustes
function pintarAjustes(){
  $("pAjustes").innerHTML=barra("⚙️ Ajustes","pInicio")+`<div class="ajustes">
    <label class="campo" for="aFecha"><span>📅 Fecha de la prueba (para la cuenta regresiva)</span><input type="date" id="aFecha" value="${esc(ST.fecha)}"></label>
    <button class="btn sec" id="aSinFecha" ${ST.fecha?"":"disabled"}>Sacar la fecha</button>
    <label class="fila"><input type="checkbox" id="aEtq" ${ST.etq?"checked":""}><span>Mostrar los nombres en el mapa para estudiar</span></label>
    <p class="nota-aj">Las provincias y sus capitales son las de la República Argentina (23 provincias y la Ciudad Autónoma de Buenos Aires); los países limítrofes son Chile, Bolivia, Paraguay, Brasil y Uruguay. Los mapas se armaron con datos públicos de Natural Earth. Todo lo que hacés queda sólo en este aparato.</p>
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
  document.addEventListener("click",e=>{
    const svg=e.target.closest&&e.target.closest("svg.mapa");
    if(svg){const el=e.target.closest("[data-id]");if(!el)return;const id=el.dataset.id;
      if(svg.closest("#pMapa")){pintarMapaEstudio(id);return}
      if(svg.closest("#pPreg")&&svg.classList.contains("clic"))tocarMapaPreg(id);
      return}
    const el=e.target.closest("button");if(!el)return;
    if(el.dataset.ir){const d=el.dataset.ir;if(d==="pAjustes")pintarAjustes();if(d==="pInicio")pintarInicio();if(d==="pTema")pintarTema(TEMA_ACT);return ir(d)}
    if(el.dataset.tema){const t=INT.tema(el.dataset.tema);if(t){TEMA_ACT=t;pintarTema(t);return ir("pTema")}return}
    if(el.dataset.ver){pintarMapaEstudio(el.dataset.ver);return ir("pMapa")}
    if(el.id==="bMapaEst"){pintarMapaEstudio(null);return ir("pMapa")}
    if(el.id==="bPracticar")return ronda({n:10,tema:TEMA_ACT});
    if(el.id==="bOtraMezcla")return ronda({n:10,tema:R&&R.tema||null});
    if(el.dataset.act){const t=el.id==="bOtra"&&R&&R.tema?R.tema:TEMA_ACT;return ronda({tipo:el.dataset.act,tema:t,n:el.dataset.act==="unir"?(t.tipo==="paises"?2:4):10})}
    if(el.id==="bMemo"||el.id==="bOtraMemo")return memotest();
    if(el.id==="bSalirMemo"){confirmar("¿Salir del memotest? No se guarda lo que hiciste.",()=>{MM=null;pintarTema(TEMA_ACT);ir("pTema")},"Salir");return}
    if(el.classList.contains("cm"))return tocarCarta(+el.dataset.c);
    if(el.id==="bSim")return ronda({qs:armarSimulacro(),test:true});
    if(el.id==="bErrores"){const ids=TODOS.filter(it=>aprendiendo(it.id)).map(it=>it.id);if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2))});return}
    if(el.id==="bRepetirErr"){const ids=[...new Set(R.errores.flatMap(q=>q.tipo==="unir"&&q.estado.malos&&q.estado.malos.length?q.estado.malos:q.ids))].filter(id=>ITEM[id]);if(ids.length)ronda({ids,n:Math.min(10,Math.max(5,ids.length*2)),tipo:R.tipo,tema:R.tema});return}
    if(el.id==="bInicioFin"){pintarInicio();return ir("pInicio")}
    if(el.id==="bSalir"){confirmar("¿Salir de la ronda? Lo que ya contestaste queda guardado.",()=>{R=null;pintarInicio();ir("pInicio")},"Salir");return}
    if(el.id==="bSig")return siguiente();
    if(el.id==="bCheck")return comprobarTipear();
    if(el.classList.contains("opcion"))return comprobarMC(+el.dataset.i);
    if(el.classList.contains("par"))return tocarPar(el.dataset.lado,+el.dataset.i);
    if(el.id==="aSinFecha"){ST.fecha="";guardar();pintarAjustes();return}
    if(el.id==="aBorrar"){confirmar("¿Borrar todo lo que hiciste (lo aprendido, los simulacros y los días)? No se puede deshacer.",()=>{ST={v:1,fecha:ST.fecha,etq:ST.etq,items:Object.create(null),dias:{},sims:[],rondas:0};guardar();pintarAjustes()},"Borrar");return}
  });
  document.addEventListener("change",e=>{
    const i=e.target.id;
    if(i==="aFecha"){ST.fecha=FECHA_OK(e.target.value)?e.target.value:"";guardar();pintarAjustes()}
    else if(i==="aEtq"||i==="mEtq"){ST.etq=e.target.checked;guardar();if(!$("pMapa").hidden)pintarMapaEstudio($("pMapa").dataset.sel||null)}
  });
  document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target.id==="resp"){e.preventDefault();comprobarTipear()}else if(e.key==="Escape"&&!$("modal").hidden){$("modal").hidden=true;$("modal").innerHTML=""}});
}
// para las pruebas
INT.gen=(tipo,id,c)=>generar(tipo,ITEM[id],c);INT.tipos=()=>POOL;INT.ELEGIBLES=ELEGIBLES;INT.ACTIVIDADES=ACTIVIDADES;INT.ACTIVIDADES_PAIS=ACTIVIDADES_PAIS;INT.N_SIM=N_SIM;
INT.rondaCon=(qs,test)=>ronda({qs,test:!!test});INT.estado=()=>ST;INT.actual=actual;INT.ronda=()=>R;INT.armarSimulacro=armarSimulacro;INT.NORM=NORM;INT.dominio=dominio;INT.mapaHTML=mapaHTML;INT.mapaLimHTML=mapaLimHTML;INT.memo=()=>MM;
arrancar();pintarInicio();ir("pInicio");
})();
