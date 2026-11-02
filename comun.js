// Ayudas que comparten los módulos (contenido-gN.js) y el motor (motor.js). Se carga PRIMERO.
// BASE: dónde está la carpeta del sitio respecto de la página (la página de un módulo en una subcarpeta pone window.RK_BASE="../").
const BASE=window.RK_BASE||"";
const $=id=>document.getElementById(id);
const NUMW=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty"];
const NUM=new RegExp("(\\b\\d+\\b|\\b("+NUMW.join("|")+")\\b)");
const COLOURS=["light blue","sky blue","red","blue","green","yellow","pink","purple","orange","black","white","brown","grey","gray"];
const ANIMALS=["dog","cat","horse","rabbit","lion","tiger","elephant","monkey","bird","fish","dolphin","panda","giraffe","bear","hamster","turtle","snake","shark","penguin","wolf","fox"];
const find=(t,list)=>list.find(w=>new RegExp("\\b"+w+"s?\\b").test(t));
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffleA=a=>{a=a.slice();for(let k=a.length-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[a[k],a[j]]=[a[j],a[k]]}return a};
const esc=s=>String(s).replace(/[<&]/g,c=>c==="<"?"&lt;":"&amp;");
let kidName="";
const NO=/^no\b|haven't|don't|have not/;
const ORD=/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|eleventh|twelfth|thirteenth|fourteenth|fifteenth|sixteenth|seventeenth|eighteenth|nineteenth|twentieth|twenty[- ](first|second|third|fourth|fifth|sixth|seventh|eighth|ninth)|thirtieth|thirty[- ]first|\d{1,2}(st|nd|rd|th))\b/;
const MONTHS=/january|february|march|april|may|june|july|august|september|october|november|december/;
const HORA=/o'?clock|half past|quarter (past|to)|\b\d{1,2}(:\d\d)?\b|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)\b/;
const H=(es,en)=>({es,en});
// Reacciones generales del examinador. R(...) arma una reacción que no repite la anterior; sin argumentos usa éstas.
const GEN=["Thank you.","I see.","That's nice!","Very good!","Lovely!","Great!","That's interesting!","OK, thank you.","That sounds good."];
let _ultReac="";
function _reac(l){const c=l.filter(x=>x!==_ultReac);const r=pick(c.length?c:l);_ultReac=r;return r}
const R=(...l)=>{const f=()=>_reac(l.length?l:GEN);f.generica=true;return f};   // «generica»: no depende de lo que se contestó, así que escucha.js puede cambiarla por una que sí
const COL_RE=new RegExp(COLOURS.join("|")+"|colou?r");
const DIAS3={test:t=>(String(t).match(/monday|tuesday|wednesday|thursday|friday|saturday|sunday/g)||[]).length>=3};
// Frases de relleno (no cuentan como pregunta): repetir, no se oyó y seguir
const REPITE=["Of course.","Sure.","No problem."];
const NO_OIGO=["Sorry, I can't hear you. Can you say that again?","Sorry, I didn't hear you. Can you say that again, please?"];
const SIGAMOS=["That's OK. Let's go on.","No problem. Let's go on.","That's all right. Let's continue."];
function vistasLeer(){try{const o=JSON.parse(localStorage.getItem(VISTAS_KEY)||"{}");return o&&typeof o==="object"&&!Array.isArray(o)?o:{}}catch(e){return {}}}
function vistasGuardar(o){try{
  const ks=Object.keys(o).filter(k=>k!=="_n");
  if(ks.length>500)ks.sort((a,b)=>(o[a]||0)-(o[b]||0)).slice(0,ks.length-350).forEach(k=>delete o[k]);
  localStorage.setItem(VISTAS_KEY,JSON.stringify(o))}catch(e){}}
const claveP=s=>"q"+_audioKey(s.q);   // por el texto de la pregunta: no depende del orden del banco
function elegirNuevo(lista,clave,V,n){   // una que no haya salido en las últimas charlas; si todas salieron hace poco, la que hace más que no sale
  if(lista.length<2)return lista[0];
  const K=Math.max(1,Math.floor(lista.length*.6));
  const libres=lista.filter(s=>{const u=V[clave(s)];return !u||n-u>K});
  if(libres.length)return pick(libres);
  return lista.slice().sort((a,b)=>(V[clave(a)]||0)-(V[clave(b)]||0)||Math.random()-.5)[0];
}
const seguidas=s=>Array.isArray(s.follow)?s.follow:s.follow?[s.follow]:[];
// (elegirSeguida, la repregunta de un paso, está en escucha.js: elige según lo que se dijo)
