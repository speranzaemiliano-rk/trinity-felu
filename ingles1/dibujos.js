// «English · 1.er grado»: los dibujos propios (el muñeco con sus partes del cuerpo y algunos útiles del aula) y cómo se muestra cada «dibujo» de una palabra.
(function(){
"use strict";
const I1=window.I1=window.I1||{};
const PIEL="#f4c7a1",PIEL_B="#d9a07a",REMERA="#4c8df6",PANT="#2f4ea8";

// ---- el muñeco: cada zona que se toca es una forma transparente (clase «hit») con data-parte; la que se resalta se pinta con un halo.
// El orden importa: lo que está más abajo en la lista de «hit» queda arriba en el dibujo, así lo chico (ojos, nariz, dedos) le gana a lo grande (cabeza, cuerpo).
const DEDOS=(x0,dir)=>[[0,0],[1,2],[2,3],[3,1]].map(([i,y])=>`<line x1="${x0+dir*i*7}" y1="${284+y}" x2="${x0+dir*i*7+dir*(i-1.5)*2}" y2="${300+y}" stroke="${PIEL}" stroke-width="7" stroke-linecap="round"/>`).join("");
const DEDOS_PIE=(x0)=>[0,1,2,3,4].map(i=>`<circle cx="${x0+i*10}" cy="${406}" r="${i===0||i===4?5.5:5}" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="1.5"/>`).join("");
const HITS=[   // [parte, forma svg (con la clase hit)]
  ["body",`<rect x="96" y="164" width="108" height="140" rx="32"/>`],
  ["legs",`<rect x="102" y="290" width="46" height="98" rx="18"/><rect x="152" y="290" width="46" height="98" rx="18"/>`],
  ["head",`<circle cx="150" cy="92" r="64"/>`],
  ["arms",`<polygon points="122.5,199.3 89.5,176.7 41.5,246.7 74.5,269.3"/><polygon points="210.5,176.7 177.5,199.3 225.5,269.3 258.5,246.7"/>`],
  ["feet",`<ellipse cx="120" cy="396" rx="34" ry="17"/><ellipse cx="180" cy="396" rx="34" ry="17"/>`],
  ["hands",`<circle cx="52" cy="270" r="23"/><circle cx="248" cy="270" r="23"/>`],
  ["ears",`<circle cx="88" cy="98" r="21"/><circle cx="212" cy="98" r="21"/>`],
  ["eyes",`<circle cx="128" cy="94" r="17"/><circle cx="172" cy="94" r="17"/>`],
  ["nose",`<ellipse cx="150" cy="112" rx="14" ry="15"/>`],
  ["mouth",`<ellipse cx="150" cy="134" rx="29" ry="15"/>`],
  ["toes",`<rect x="92" y="399" width="56" height="20" rx="10"/><rect x="152" y="399" width="56" height="20" rx="10"/>`],
  ["fingers",`<rect x="26" y="280" width="52" height="30" rx="12"/><rect x="222" y="280" width="52" height="30" rx="12"/>`]];
const ES_PARTE={head:"cabeza",eyes:"ojos",nose:"nariz",mouth:"boca",ears:"orejas",hands:"manos",arms:"brazos",legs:"piernas",feet:"pies",fingers:"dedos",toes:"deditos de los pies",body:"cuerpo"};
I1.ES_PARTE=ES_PARTE;I1.PARTES=HITS.map(h=>h[0]);

// opc: {resalta: «parte» a pintar, activo: true si las zonas se tocan (si no, es sólo un dibujo), mini: true si es chico (sin etiquetas)}
function svgCuerpo(opc){
  opc=opc||{};const r=opc.resalta||"",act=!!opc.activo;
  const visual=`
    <ellipse cx="90" cy="98" rx="11" ry="17" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="3"/><ellipse cx="210" cy="98" rx="11" ry="17" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="3"/>
    <circle cx="150" cy="92" r="60" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="3"/>
    <path d="M90 88 C84 8 216 8 210 88 C192 64 108 64 90 88 Z" fill="#5a3b27"/>
    <rect x="138" y="146" width="24" height="26" rx="8" fill="${PIEL}"/>
    <rect x="98" y="166" width="104" height="134" rx="30" fill="${REMERA}"/><path d="M130 166 Q150 186 170 166" fill="none" stroke="#2f6de0" stroke-width="5" stroke-linecap="round"/>
    <rect x="108" y="292" width="38" height="94" rx="16" fill="${PANT}"/><rect x="154" y="292" width="38" height="94" rx="16" fill="${PANT}"/>
    <ellipse cx="120" cy="396" rx="29" ry="14" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="2"/><ellipse cx="180" cy="396" rx="29" ry="14" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="2"/>
    ${DEDOS_PIE(100)}${DEDOS_PIE(160)}
    <path d="M104 188 L60 256" stroke="${PIEL}" stroke-width="24" stroke-linecap="round" fill="none"/><path d="M196 188 L240 256" stroke="${PIEL}" stroke-width="24" stroke-linecap="round" fill="none"/>
    <path d="M104 188 L90 210" stroke="${REMERA}" stroke-width="30" stroke-linecap="round" fill="none"/><path d="M196 188 L210 210" stroke="${REMERA}" stroke-width="30" stroke-linecap="round" fill="none"/>
    <circle cx="52" cy="270" r="17" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="2"/><circle cx="248" cy="270" r="17" fill="${PIEL}" stroke="${PIEL_B}" stroke-width="2"/>
    ${DEDOS(36,1)}${DEDOS(236,1)}
    <circle cx="128" cy="94" r="9" fill="#fff"/><circle cx="172" cy="94" r="9" fill="#fff"/><circle cx="129" cy="95" r="4.6" fill="#243055"/><circle cx="171" cy="95" r="4.6" fill="#243055"/>
    <ellipse cx="150" cy="111" rx="6" ry="8" fill="#e7a37c"/>
    <path d="M130 130 Q150 150 170 130" fill="none" stroke="#b03a2e" stroke-width="5" stroke-linecap="round"/>`;
  const hits=HITS.map(([p,forma])=>`<g class="hit${p===r?" on":""}" data-parte="${p}"${act?` tabindex="0" role="button" aria-label="${p}"`:""}>${forma}</g>`).join("");
  return `<svg viewBox="0 0 300 430" class="muneco${act?" activo":""}${opc.mini?" mini":""}" ${act?'role="group" aria-label="Body"':'role="img" aria-label="'+(r?ES_PARTE[r]:"cuerpo")+'"'} focusable="false">${visual}<g class="hits">${hits}</g></svg>`;
}
I1.svgCuerpo=svgCuerpo;

// ---- útiles del aula (dibujos simples de 100 × 100)
const OBJ={
  silla:`<rect x="28" y="6" width="10" height="52" rx="3" fill="#b9733a"/><rect x="40" y="14" width="30" height="7" rx="2" fill="#d9954f"/><rect x="40" y="28" width="30" height="7" rx="2" fill="#d9954f"/><rect x="26" y="54" width="54" height="11" rx="4" fill="#e0a257"/><rect x="30" y="65" width="9" height="30" rx="2" fill="#a8672f"/><rect x="68" y="65" width="9" height="30" rx="2" fill="#a8672f"/>`,
  pupitre:`<rect x="8" y="26" width="84" height="12" rx="4" fill="#e0a257"/><rect x="14" y="38" width="7" height="52" fill="#7d8b99"/><rect x="79" y="38" width="7" height="52" fill="#7d8b99"/><rect x="21" y="56" width="58" height="9" rx="3" fill="#c98a45"/>`,
  pizarron:`<rect x="6" y="12" width="88" height="62" rx="5" fill="#2f6f4f" stroke="#a9794c" stroke-width="6"/><path d="M20 58 L30 28 L40 58 M24 48 L36 48" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M52 30 L52 58 M52 30 Q70 30 70 38 Q70 46 52 46 Q74 46 74 52 Q74 58 52 58" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="26" y="78" width="48" height="7" rx="3" fill="#a9794c"/>`,
  goma:`<rect x="10" y="34" width="80" height="34" rx="8" fill="#ff8fb3"/><rect x="10" y="34" width="34" height="34" rx="8" fill="#4c8df6"/><rect x="36" y="34" width="8" height="34" fill="#4c8df6"/>`
};
I1.OBJ=OBJ;
const svgObj=n=>`<svg viewBox="0 0 100 100" class="obj" aria-hidden="true" focusable="false">${OBJ[n]||""}</svg>`;

// ---- el «dibujo» de una palabra, según cómo esté descripto en el contenido ({e:emoji} {c:color} {n:número} {l:letra} {t:texto} {svg:nombre})
const esc=t=>String(t).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function pic(p,cls){
  cls=cls?" "+cls:"";
  if(!p)return "";
  if(p.e){const n=(String(p.e).match(/\p{Extended_Pictographic}/gu)||[]).length;return `<span class="pic pe${n>1?" pe2":""}${cls}" aria-hidden="true">${esc(p.e)}</span>`}   // (dos emojis: se dibujan más chicos, uno al lado del otro)
  if(p.c)return `<span class="pic pc${cls}" style="background:${esc(p.c)}" aria-hidden="true"></span>`;
  if(p.n!==undefined)return `<span class="pic pn${cls}" aria-hidden="true">${esc(p.n)}</span>`;
  if(p.l)return `<span class="pic pl${cls}" aria-hidden="true">${esc(p.l)}</span>`;
  if(p.t)return `<span class="pic pt${cls}" aria-hidden="true">${esc(p.t)}</span>`;
  if(p.svg){
    if(p.svg.indexOf("parte:")===0)return `<span class="pic ps pcuerpo${cls}" aria-hidden="true">${svgCuerpo({resalta:p.svg.slice(6),mini:true})}</span>`;
    return `<span class="pic ps${cls}" aria-hidden="true">${svgObj(p.svg)}</span>`;
  }
  return "";
}
I1.pic=pic;
})();
