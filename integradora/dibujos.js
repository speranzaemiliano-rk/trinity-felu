// Los dibujos de «Naturales» (SVG propios, hechos a mano; no son los esquemas del libro): el camino del Sol en un día, dónde sale y se pone el Sol en cada estación,
// la altura del Sol y las sombras al mediodía, las sombras de un gnomon durante el día y los árboles de las cuatro estaciones.
// Cada pieza que se puede tocar lleva data-id (las preguntas «Tocá en el dibujo» y la pantalla de estudio las usan). o = {res, ok, mal: ids marcados; clic: se puede tocar; tap: sin los nombres que regalan la respuesta; mezcla (sólo «alturas»): los paneles cambian de lugar}.
(function(){
"use strict";
const cl=(o,id)=>(o.res===id?" res":"")+(o.ok===id?" ok":"")+(o.mal===id?" mal":"");
const r1=n=>Math.round(n*10)/10;
const rad=Math.PI/180;
const svg=(clase,vb,etiqueta,o,dentro)=>`<svg class="dibujo ${clase}${o&&o.clic?" clic":""}" viewBox="${vb}" role="img" aria-label="${etiqueta}" preserveAspectRatio="xMidYMid meet">${dentro}</svg>`;

// ---- 1) el camino del Sol en un día (mirando hacia el norte: el este queda a la derecha y el oeste a la izquierda)
const POS={p1:[322,160],p2:[295,94],p3:[180,46],p4:[65,94],p5:[38,160]};
function sol(o){
  o=o||{};
  const zonas=[["oeste",0,"OESTE"],["norte",120,"NORTE"],["este",240,"ESTE"]].map(([id,x,t])=>`<g class="zona${cl(o,id)}" data-id="${id}"><rect x="${x}" y="170" width="120" height="70"/><text class="zona-et" x="${x+60}" y="233">${t}</text></g>`).join("");
  const pos=Object.keys(POS).map((id,i)=>{const [x,y]=POS[id];return `<g class="pos${cl(o,id)}" data-id="${id}"><circle class="d-sol" cx="${x}" cy="${y}" r="15"/><text class="d-num" x="${x}" y="${y+5.5}">${i+1}</text><circle class="hit" cx="${x}" cy="${y}" r="26"/></g>`}).join("");
  const deco=`<g class="deco"><rect x="66" y="150" width="6" height="20" fill="#8a5a2b"/><circle cx="69" cy="144" r="16" fill="#3f9f4a"/><rect x="286" y="152" width="34" height="20" fill="#e7c9a1"/><path d="M282 153 L303 136 L324 153 Z" fill="#c85a43"/><rect x="298" y="159" width="8" height="13" fill="#7a5230"/><circle cx="180" cy="187" r="6" fill="#d8a47f"/><rect x="173" y="193" width="14" height="22" rx="5" fill="#2a63d4"/></g>`;
  return svg("sol","0 0 360 240","El camino del Sol durante un día, visto mirando hacia el norte: sale a la derecha (este), sube hasta lo más alto hacia el norte y baja hasta ponerse a la izquierda (oeste)",o,
    `<rect class="d-cielo" x="0" y="0" width="360" height="170"/><rect class="d-suelo" x="0" y="170" width="360" height="70"/>${zonas}<line class="d-horiz" x1="0" y1="170" x2="360" y2="170"/>${deco}<path class="d-arco" d="M326 170 A146 124 0 0 0 34 170"/>${pos}`);
}

// ---- 2) dónde sale y dónde se pone el Sol el primer día de cada estación (visto desde arriba: el norte arriba, el este a la derecha)
function salidas(o){
  o=o||{};
  const P=(r,az)=>[r1(160+r*Math.sin(az*rad)),r1(160-r*Math.cos(az*rad))];
  const A={v:[112,117,243],e:[90,90,270],i:[68,63,297]};
  const arco=(k,gr)=>{const [r,a1,a2]=A[k],p=P(r,a1),q=P(r,a2);return `<path class="arc arc-${k}" d="M${p[0]} ${p[1]} A${r} ${r} 0 ${gr} 0 ${q[0]} ${q[1]}"/>`};
  const punto=(id,k,az,sale)=>{const [x,y]=P(A[k][0],az);return `<g class="pt pt-${k}${cl(o,id)}" data-id="${id}"><circle class="d-sol" cx="${x}" cy="${y}" r="10"/>${o.tap?"":`<text class="d-flecha" x="${x}" y="${y+4.5}">${sale?"↑":"↓"}</text>`}<circle class="hit" cx="${x}" cy="${y}" r="20"/></g>`};
  const puntos=punto("v_sale","v",117,1)+punto("v_pone","v",243,0)+punto("e_sale","e",90,1)+punto("e_pone","e",270,0)+punto("i_sale","i",63,1)+punto("i_pone","i",297,0);
  const nombres=`<g class="puntos-card"><text x="160" y="20">Norte</text><text x="160" y="312">Sur</text><text x="300" y="165" class="c-lado">Este</text><text x="20" y="165" class="c-lado">Oeste</text><text x="252" y="48" class="c-int">Noreste</text><text x="68" y="48" class="c-int">Noroeste</text><text x="252" y="282" class="c-int">Sureste</text><text x="68" y="282" class="c-int">Suroeste</text></g>`;
  const fila=(k,y,t)=>`<line class="lg-l lg-${k}" x1="100" y1="${y}" x2="124" y2="${y}"/><text class="lg-${k}" x="130" y="${y+4}">${t}</text>`;
  const leyenda=o.tap?"":`<g class="leyenda">${fila("v",196,"Verano")}${fila("e",214,"Otoño y primavera")}${fila("i",232,"Invierno")}<text class="d-nota" x="160" y="256">↑ sale · ↓ se pone</text></g>`;
  const sale="";
  return svg("salidas","0 0 320 322","Dibujo visto desde arriba: el Sol sale y se pone por puntos distintos del horizonte según la estación. En verano sale por el sureste y se pone por el suroeste; en otoño y primavera, casi por el este y el oeste; en invierno, por el noreste y el noroeste",o,
    `<circle class="d-suelo d-borde" cx="160" cy="160" r="124"/>${nombres}${arco("v",1)}${arco("e",0)}${arco("i",0)}${leyenda}<circle class="d-obs" cx="160" cy="165" r="5"/>${puntos}${sale}`);
}

// ---- 3) el Sol y la sombra de una varilla al mediodía, el primer día del verano, del otoño o la primavera, y del invierno
function alturas(o){
  o=o||{};
  const P=[["h_ver",8,23,5.8,"Verano"],["h_eq",124,32,21,"Otoño y primavera"],["h_inv",240,48,48,"Invierno"]];
  const orden=[8,124,240];if(o.mezcla)orden.sort(()=>Math.random()-.5);   // en las preguntas los tres paneles cambian de lugar (así no se contesta «el de la derecha», sino mirando el Sol y la sombra)
  const paneles=P.map(([id,x0,sy,L,nombre],i)=>{
    x0=orden[i];
    const px=x0+52,pt=78,sx=r1(px+56*Math.cos(Math.atan2(30,L))),sy2=r1(pt-56*Math.sin(Math.atan2(30,L)));
    return `<g class="panel${cl(o,id)}" data-id="${id}"><rect class="d-cielo pb" x="${x0}" y="6" width="112" height="102" rx="8"/><rect class="d-suelo" x="${x0}" y="96" width="112" height="14" rx="0"/>`+
      `<line class="rayo" x1="${sx}" y1="${sy2}" x2="${px+2}" y2="${pt}"/><rect class="sombra" x="${r1(px+2-L)}" y="105" width="${L}" height="5" rx="2"/><rect class="vara" x="${px}" y="${pt}" width="4" height="30"/>`+
      `<circle class="d-sol" cx="${sx}" cy="${sy2}" r="10"/>${o.tap?"":`<text class="p-et" x="${x0+56}" y="127">${nombre}</text>`}<rect class="hit" x="${x0}" y="6" width="112" height="116"/></g>`}).join("");
  return svg("alturas","0 0 360 136","El Sol y la sombra de una varilla al mediodía: el primer día del verano el Sol está más alto y la sombra es la más corta; el primer día del otoño y de la primavera la altura es intermedia; el primer día del invierno el Sol está más bajo y la sombra es la más larga",o,paneles);
}

// ---- 4) las sombras de una varilla (gnomon) durante un día, vistas desde arriba: por la mañana apuntan al oeste, al mediodía solar al sur, por la tarde al este
function gnomon(o){
  o=o||{};
  const S=[["s9",245,108,"9:00"],["s11",205,62,"11:00"],["s13",180,42,"13:00"],["s15",152,60,"15:00"],["s17",118,104,"17:00"]];
  const lineas=S.map(([id,az,L,h])=>{const x=r1(160+L*Math.sin(az*rad)),y=r1(160-L*Math.cos(az*rad)),lx=r1(160+(L+17)*Math.sin(az*rad)),ly=r1(160-(L+17)*Math.cos(az*rad));
    return `<g class="som${cl(o,id)}" data-id="${id}"><line class="som-hit" x1="160" y1="160" x2="${x}" y2="${y}"/><line class="som-l" x1="160" y1="160" x2="${x}" y2="${y}"/><circle class="som-p" cx="${x}" cy="${y}" r="3.5"/><circle class="hit" cx="${x}" cy="${y}" r="14"/><text class="som-h" x="${lx}" y="${r1(ly+4)}">${h}</text></g>`}).join("");
  const nombres=`<g class="puntos-card"><text x="160" y="20">Norte</text><text x="160" y="312">Sur</text><text x="300" y="165" class="c-lado">Este</text><text x="20" y="165" class="c-lado">Oeste</text></g>`;
  return svg("gnomon","0 0 320 322","Dibujo visto desde arriba: las sombras de una varilla vertical durante un día. A las 9 y a las 11 apuntan hacia el oeste y son largas y cada vez más cortas; a las 13, el mediodía solar, es la más corta y apunta hacia el sur; a las 15 y a las 17 apuntan hacia el este y son cada vez más largas",o,
    `<circle class="d-papel d-borde" cx="160" cy="160" r="128"/>${nombres}${lineas}<circle class="d-vara-c" cx="160" cy="160" r="5.5"/>${o.tap?"":`<text class="d-nota" x="160" y="146">varilla (gnomon)</text>`}`);
}

// ---- 5) un árbol en cada estación (para «¿Qué estación es?» y para el estudio)
const ARBOLES={
  verano:{cielo:"#bfe6ff",suelo:"#8fd16f",tronco:"#8a5a2b",extra:`<circle cx="98" cy="22" r="11" fill="#ffc933"/>${[0,45,90,135,180,225,270,315].map(a=>`<line x1="${r1(98+15*Math.cos(a*rad))}" y1="${r1(22+15*Math.sin(a*rad))}" x2="${r1(98+20*Math.cos(a*rad))}" y2="${r1(22+20*Math.sin(a*rad))}" stroke="#ffb300" stroke-width="2.5" stroke-linecap="round"/>`).join("")}`,
    copa:`<circle cx="60" cy="48" r="27" fill="#2f9e44"/><circle cx="40" cy="58" r="19" fill="#3fb34f"/><circle cx="80" cy="58" r="19" fill="#3fb34f"/><circle cx="56" cy="40" r="14" fill="#52c25f"/>`,suelto:"",pista:"Los árboles tienen muchas hojas verdes y hay mucho Sol: es verano."},
  otono:{cielo:"#fbe3bb",suelo:"#d7b27a",tronco:"#7a4c25",extra:"",
    copa:`<circle cx="60" cy="48" r="27" fill="#e0822c"/><circle cx="40" cy="58" r="19" fill="#d1621f"/><circle cx="80" cy="58" r="19" fill="#eaa23a"/><circle cx="58" cy="38" r="13" fill="#f2b94d"/>`,
    suelto:[[26,86,-30],[92,80,25],[70,96,-15],[44,106,20],[86,110,-35],[18,104,10]].map(([x,y,a])=>`<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="${a>0?"#d1621f":"#eaa23a"}" transform="rotate(${a} ${x} ${y})"/>`).join(""),pista:"Las hojas se ponen amarillas y naranjas y se caen: es otoño."},
  invierno:{cielo:"#cfd8e6",suelo:"#d9dde6",tronco:"#6d4a2b",extra:`<ellipse cx="96" cy="24" rx="16" ry="8" fill="#f4f6fa"/><ellipse cx="86" cy="28" rx="12" ry="7" fill="#f4f6fa"/><ellipse cx="106" cy="28" rx="11" ry="6" fill="#f4f6fa"/>`,
    copa:`<g stroke="#6d4a2b" stroke-linecap="round" fill="none"><path d="M60 68 L60 38" stroke-width="5"/><path d="M60 58 L42 40" stroke-width="4"/><path d="M60 58 L78 40" stroke-width="4"/><path d="M60 46 L50 26" stroke-width="3"/><path d="M60 46 L70 26" stroke-width="3"/><path d="M42 40 L32 36" stroke-width="2.5"/><path d="M78 40 L88 36" stroke-width="2.5"/><path d="M42 40 L38 28" stroke-width="2.5"/><path d="M78 40 L82 28" stroke-width="2.5"/></g>`,suelto:"",pista:"El árbol no tiene hojas: es invierno."},
  primavera:{cielo:"#dff0ff",suelo:"#a9e08a",tronco:"#7a4c25",extra:"",
    copa:`<circle cx="60" cy="48" r="27" fill="#b57edc"/><circle cx="40" cy="58" r="19" fill="#c995e8"/><circle cx="80" cy="58" r="19" fill="#e8a3d6"/><circle cx="58" cy="38" r="13" fill="#d8a8f0"/>${[[48,40],[70,34],[34,60],[84,62],[60,56],[50,70],[72,70]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("")}`,
    suelto:`${[[20,112],[36,118],[84,114],[100,108],[62,120]].map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="3.2" fill="${i%2?"#ff7eb6":"#ffd34d"}"/>`).join("")}<ellipse cx="22" cy="40" rx="5" ry="3" fill="#ffb347" transform="rotate(-30 22 40)"/><ellipse cx="29" cy="38" rx="5" ry="3" fill="#ff8ab4" transform="rotate(30 29 38)"/>`,pista:"El árbol se llena de flores: es primavera."}
};
const NOMBRES={verano:"verano",otono:"otoño",invierno:"invierno",primavera:"primavera"};
function arbol(est,o){
  o=o||{};const a=ARBOLES[est];
  return svg("arbol","0 0 120 130",o.sinNombre?"Dibujo de un árbol":"Dibujo de un árbol en "+NOMBRES[est],o,
    `<rect x="0" y="0" width="120" height="104" fill="${a.cielo}"/><rect x="0" y="100" width="120" height="30" fill="${a.suelo}"/>${a.extra}<path d="M54 102 L57 64 L63 64 L66 102 Z" fill="${a.tronco}"/>${a.copa}${a.suelto}`);
}
const arboles=()=>`<div class="arboles">${Object.keys(ARBOLES).map(e=>`<figure class="fig">${arbol(e)}<figcaption>${NOMBRES[e][0].toUpperCase()+NOMBRES[e].slice(1)}</figcaption></figure>`).join("")}</div>`;
window.DIB={sol,salidas,alturas,gnomon,arbol,arboles,ESTACIONES:Object.keys(ARBOLES),NOMBRES,PISTA:Object.fromEntries(Object.keys(ARBOLES).map(k=>[k,ARBOLES[k].pista]))};
})();
