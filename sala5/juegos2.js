// «Sala de 5» · juegos 2: las actividades que se sumaron para Lengua y Matemática (la nena resolvía muy rápido lo primero que había). Se carga después de juego.js y usa lo que deja en S5.H.
// Cada juego tiene varios niveles; el motor adaptativo (adaptar.js) elige cuál toca en cada pregunta. Los audios de todo lo que se dice salen de contenido.js y contenido2.js.
(function(){
"use strict";
const S5=window.S5,C=S5.C,H=S5.H,ES=C.ES,{J,azar,elegir,mezclar,sacar,numOp,numerales,cercanos,palabrasCon,VOCALES,PAUSA}=H;
const limpia=x=>/^[a-z]+$/.test(x.p);   // palabras de letras simples (sin tilde, ñ ni ü): para armarlas y completarlas letra por letra
const SONIDO_RARO=w=>w.h||w.ll||w.p==="girasol";   // la H no suena, la LL es una sola letra en el habla y «girasol» empieza con sonido de J: no sirven para «empieza igual»
const parecen=(a,b)=>(C.SUENAN_IGUAL[a]||"").includes(b)||(C.SUENAN_IGUAL[b]||"").includes(a);   // letras que suenan igual al empezar una palabra
const FEAS=new Set(["puto","puta","pito","pedo","caga","cago","culo","pija","poto","pete","caca","teta"]);   // palabras que no deben formarse nunca con una letra equivocada (P_TO con U, CA_A con G…)

// ===================================================================== MATEMÁTICA
// ---- cuántos hay con decenas y unidades (bloques: cada barra es una decena de 10 cuadraditos y cada bolita una unidad)
const bloques=(d,u)=>`<div class="b10" style="--d:${d}" aria-hidden="true"><div class="decs">${Array.from({length:d},()=>`<div class="dec">${"<i></i>".repeat(10)}</div>`).join("")}</div><div class="unis">${"<i></i>".repeat(u)}</div></div>`;
J("m_decenas","mates","🧱","Decenas y unidades",3,nivel=>{
  const [dmin,dmax]=[[1,1],[2,5],[5,9]][nivel-1],d=azar(dmin,dmax),u=azar(0,9),n=d*10+u;
  const cuenta=Array.from({length:d},(_,i)=>C.numES(10*(i+1))).concat(u?[C.numES(n)]:[]);   // «diez, veinte, treinta, treinta y cuatro»: cada barra vale diez
  return {tipo:"eleccion",clave:"dec"+n,rotulo:"Decenas y unidades: "+n,decir:[ES.cuantos],est:bloques(d,u),
    opciones:cercanos(n,1,99,nivel===1?2:3).map(k=>{const o=numOp(k,k===n,C.numES);if(k===n)o.decir=cuenta;return o}),alAcertar:[]};
});

// ---- ¿cuál es el número más grande / más chico?
J("m_comparar","mates","🆚","¿Cuál es más grande?",3,nivel=>{
  const modo=elegir(["grande","chico"]),[min,max,cant]=[[1,10,2],[1,20,3],[10,99,3]][nivel-1];
  let nums=[];
  if(nivel===3&&Math.random()<.6){   // dos con las mismas cifras (38 y 83): hay que mirar cuál va primero
    let a;do{a=azar(12,98)}while(String(a)[0]===String(a)[1]||String(a)[1]==="0");
    nums=[a,+(String(a)[1]+String(a)[0])];let c;do{c=azar(min,max)}while(nums.includes(c));nums.push(c);
  }else while(nums.length<cant){const k=azar(min,max);if(!nums.includes(k))nums.push(k)}
  const gana=modo==="grande"?Math.max(...nums):Math.min(...nums);
  return {tipo:"eleccion",clave:"cmp"+modo+nums.slice().sort((x,y)=>x-y).join("-"),rotulo:"El número más "+modo+": "+nums.join(", "),decir:[modo==="grande"?ES.numGrande:ES.numChico],
    opciones:mezclar(nums).map(k=>numOp(k,k===gana,C.numES)),alAcertar:[]};
});

// ---- ordenar números (tocarlos en orden, de menor a mayor o al revés); usa lo mismo que «Mi nombre»
J("m_orden","mates","🔢","Ordená los números",4,nivel=>{
  const [cant,max]=[[3,10],[4,20],[4,20],[4,99]][nivel-1],baja=nivel>=3&&Math.random()<.5,nums=sacar(Array.from({length:max},(_,i)=>i+1),cant).sort((a,b)=>baja?b-a:a-b);
  return {tipo:"nombre",numeros:true,letras:nums.map(String),decirItem:t=>C.numES(+t),clave:"ord"+nums.join(","),rotulo:"Ordenar "+(baja?"de mayor a menor: ":"de menor a mayor: ")+nums.join(", "),decir:[baja?ES.mayorMenor:ES.menorMayor]};
});

// ---- problemas hablados («Tengo 5 manzanas. Me regalan 3 más. ¿Cuántas tengo ahora?»): las cantidades no se dibujan, hay que escuchar
J("m_problemas","mates","📖","Problemas",4,nivel=>{
  const o=elegir(C.PROB),tengo=o.f?ES.cuantasTengo:ES.cuantosTengo,quedan=o.f?ES.cuantasMeQuedan:ES.cuantosMeQuedan,tipo=nivel===1?"suma":nivel<=3?elegir(["suma","resta"]):"dos";
  let decir,res,txt;
  if(tipo==="suma"){
    const a=nivel===1?azar(2,3):azar(2,nivel===2?6:12),b=nivel===1?azar(2,3):azar(2,(nivel===2?10:20)-a);
    decir=[ES.tengo,C.numES(a),o.k,PAUSA,ES.meRegalan,C.numES(b),ES.mas,PAUSA,tengo];res=a+b;txt=a+" + "+b;
  }else if(tipo==="resta"){
    const a=nivel===2?azar(4,10):azar(11,20),b=nivel===2?azar(2,a-1):azar(2,9);
    decir=[ES.tengo,C.numES(a),o.k,PAUSA,ES.seVan,C.numES(b),PAUSA,quedan];res=a-b;txt=a+" − "+b;
  }else{   // dos pasos: me regalan y después regalo
    const a=azar(3,9),b=azar(2,9),c=azar(2,a+b-1);
    decir=[ES.tengo,C.numES(a),o.k,PAUSA,ES.meRegalan,C.numES(b),ES.mas,PAUSA,ES.seVan,C.numES(c),PAUSA,quedan];res=a+b-c;txt=a+" + "+b+" − "+c;
  }
  return {tipo:"eleccion",clave:"pr"+txt+o.e,rotulo:"Problema: "+txt+" "+o.pl,decir,est:`<div class="grande peq">${o.e}</div>`,
    opciones:numerales(res,1,nivel<=2?10:20,nivel===1?3:4).map(k=>numOp(k,k===res,C.numES)),alAcertar:[]};
});

// ---- la hora (en punto): leer el reloj, o encontrar el reloj de las N
function reloj(h,chico,guia){
  const rad=(h%12)*Math.PI/6,num=Array.from({length:12},(_,i)=>{const k=i+1,a=k*Math.PI/6;return `<text class="rn" x="${(50+37*Math.sin(a)).toFixed(1)}" y="${(54-37*Math.cos(a)).toFixed(1)}" text-anchor="middle">${k}</text>`}).join("");
  return `<svg class="reloj${chico?" chico":""}${guia?" guia":""}" viewBox="0 0 100 100" aria-hidden="true"><circle class="rc" cx="50" cy="50" r="47"/>${num}<line class="rh" x1="50" y1="50" x2="${(50+20*Math.sin(rad)).toFixed(1)}" y2="${(50-20*Math.cos(rad)).toFixed(1)}"/><line class="rm" x1="50" y1="50" x2="50" y2="22"/><circle class="rp" cx="50" cy="50" r="3.5"/></svg>`;
}
J("m_hora","mates","🕒","La hora",3,nivel=>{
  const h=azar(1,12),otras=Array.from({length:12},(_,i)=>i+1).filter(k=>k!==h);
  if(nivel===3){   // ¿cuál reloj dice las N?
    const hs=mezclar([h].concat(sacar(otras,2)));
    return {tipo:"eleccion",clave:"rj"+h+hs.join(""),rotulo:"Reloj de las "+h,decir:[C.tocaReloj(h)],est:"",
      claseOps:"ops-reloj",opciones:hs.map(k=>({h:reloj(k,true),clase:"op op-reloj",ok:k===h,decir:[C.sonLas(k)],aria:"reloj de las "+k})),alAcertar:[]};
  }
  const cerca=[...new Set([h-1,h+1,h-2,h+2].map(k=>((k+11)%12)+1))],ds=nivel===1?sacar(otras.filter(k=>k!==12),2):sacar(cerca,2).concat(sacar(otras.filter(k=>!cerca.includes(k)),1));
  return {tipo:"eleccion",clave:"hr"+h,rotulo:"La hora: las "+h,decir:nivel===1?[ES.queHora,ES.manitoCorta]:[ES.queHora],est:`<div class="reloj-grande">${reloj(h,false,nivel===1)}</div>`,
    opciones:mezclar([h].concat(ds)).map(k=>numOp(k,k===h,C.numES)),alAcertar:[C.sonLas(h)]};
});

// ---- memotest de números: números y cantidades, y después cuentas y sus resultados
const cositas=(n,e)=>`<span class="q">${Array.from({length:n},()=>`<i>${e}</i>`).join("")}</span>`;
J("m_memo","mates","🃏","Memotest de números",4,nivel=>{
  let pares=[];
  if(nivel<=2){   // un número y esa cantidad de cositas
    const e=elegir(C.OBJ),ns=sacar(nivel===1?[1,2,3,4,5]:[1,2,3,4,5,6],nivel===1?3:4);
    pares=ns.map(n=>({a:`<span class="num">${n}</span>`,b:cositas(n,e),ka:[C.numES(n)],kb:[C.numES(n)]}));
  }else{   // una cuenta y su resultado (los resultados no se repiten)
    const cant=nivel===3?4:6,max=nivel===3?10:15,usados=[];let k=0;
    while(pares.length<cant&&++k<300){const t=azar(3,max),a=azar(1,t-1),b=t-a;if(usados.includes(t))continue;usados.push(t);
      pares.push({a:`<span class="eq">${a}+${b}</span>`,b:`<span class="num">${t}</span>`,ka:[C.numES(a),ES.mas,C.numES(b)],kb:[C.numES(t)]})}
  }
  return {tipo:"memo",clave:"mm"+nivel+Math.random(),rotulo:"Memotest de números",decir:[ES.parejas],pares};
},null,2,true);

// ===================================================================== LENGUA
// ---- el abecedario: ¿qué letra falta?
J("l_abc","lengua","🔡","El abecedario",3,nivel=>{
  const L=C.LETRAS,largo=nivel===1?4:5,ini=azar(nivel===3?10:0,(nivel===1?10:27)-largo),sec=L.slice(ini,ini+largo),h=azar(nivel===1?1:0,largo-2),falta=sec[h],idx=L.indexOf(falta);
  const cand=[1,-1,2,-2,3,-3,4,-4,5,-5,6,-6].map(d=>L[idx+d]).filter(x=>x&&!sec.includes(x)).slice(0,nivel===3?3:2);
  const cajas=sec.map((x,i)=>i===h?`<span class="caja hueco">?</span>`:`<span class="caja">${x}</span>`).join("");
  return {tipo:"eleccion",clave:"abc"+sec.join("")+h,rotulo:"El abecedario: falta la "+falta,decir:[ES.letraFalta],est:`<div class="seq" style="--n:${largo}">${cajas}</div>`,cols:nivel===3?2:3,
    opciones:mezclar([falta].concat(cand)).map(x=>({h:`<span class="let">${x}</span>`,ok:x===falta,decir:[C.letraES(x)],aria:"letra "+x})),
    alAcertar:sec.map(C.letraES),revelar:el=>{el.querySelector(".hueco").outerHTML=`<span class="caja lleno">${falta}</span>`}};
});

// ---- ¿cuál empieza igual? (por la letra y el sonido: se dejan afuera las palabras con H, con LL y «girasol»)
J("l_igual","lengua","🤝","¿Cuál empieza igual?",3,nivel=>{
  const lista=palabrasCon(x=>!SONIDO_RARO(x)),socias=x=>lista.filter(y=>y!==x&&y.ini===x.ini&&y.e!==x.e&&!C.ambPal(x,y)),facil=nivel===1?"AEIOUMPSLT":null;
  const w=elegir(lista.filter(x=>socias(x).length>=1&&(!facil||facil.includes(x.ini)))),par=elegir(socias(w));
  const ds=[];
  mezclar(lista.filter(y=>y.ini!==w.ini&&!parecen(w.ini,y.ini)&&y.e!==w.e&&!C.ambPal(y,w)&&!C.ambPal(y,par)&&C.altInicial(y.p)!==w.ini)).forEach(y=>{if(ds.length<(nivel===3?3:2)&&!ds.some(z=>z.ini===y.ini||parecen(z.ini,y.ini)||C.ambPal(z,y)))ds.push(y)});
  return {tipo:"eleccion",clave:"ig"+w.p+par.p,rotulo:"Empieza igual que "+w.p+": "+par.p,decir:[C.palClip(w),ES.empiezaIgual],est:`<div class="grande">${w.e}</div>`,cols:nivel===3?2:3,
    opciones:mezclar([par].concat(ds)).map(y=>({h:`<span class="e">${y.e}</span>`,ok:y===par,decir:[C.palClip(y)],aria:y.p})),alAcertar:[]};
});

// ---- ¿qué letra falta? en una palabra con dibujo (la primera, la última o una del medio)
J("l_completar","lengua","🧩","¿Qué letra falta?",3,nivel=>{
  const w=elegir(palabrasCon(x=>limpia(x)&&x.n>=3&&x.n<=6&&!/h|ll|rr|ch|qu|gu/.test(x.p))),n=w.n,pos=nivel===1?0:nivel===2?n-1:azar(1,n-2),letra=w.p[pos].toUpperCase();
  const otraVocal=pos===n-1&&(letra==="O"||letra==="A")?(letra==="O"?"A":"O"):"",arma=x=>w.p.slice(0,pos)+x.toLowerCase()+w.p.slice(pos+1);   // (PATO / PATA)
  const buena=x=>x!=="Ñ"&&x!=="H"&&x!==letra&&x!==otraVocal&&!parecen(x,letra)&&!FEAS.has(arma(x)),otras=C.LETRAS.filter(buena),vocal=VOCALES.includes(letra);
  const ds=(vocal?sacar(VOCALES.filter(buena),2).concat(sacar(otras.filter(x=>!VOCALES.includes(x)),1)):sacar(otras.filter(x=>!VOCALES.includes(x)),2).concat(sacar(VOCALES.filter(buena),1))).slice(0,nivel===1?2:3);
  const mostrar=[...w.p.toUpperCase()].map((x,i)=>i===pos?`<b class="falta"></b>`:x).join("");
  return {tipo:"eleccion",clave:"cf"+w.p+pos,rotulo:"Letra que falta en «"+w.p+"»: "+letra,decir:[C.palClip(w),ES.letraFalta],est:`<div class="grande">${w.e}</div><div class="palabra" aria-hidden="true">${mostrar}</div>`,cols:nivel===1?3:2,ocultar:[0],
    opciones:mezclar([letra].concat(ds)).map(x=>({h:`<span class="let">${x}</span>`,ok:x===letra,decir:[C.letraES(x)],aria:"letra "+x})),alAcertar:[C.palClip(w)],
    revelar:el=>{const b=el.querySelector(".palabra b");if(b){b.textContent=letra;b.classList.remove("falta")}}};
});

// ---- armá la palabra: las letras en desorden, hay que tocarlas en orden (usa lo mismo que «Mi nombre»)
J("l_armar","lengua","🔀","Armá la palabra",3,nivel=>{
  const w=elegir(palabrasCon(x=>limpia(x)&&x.n===nivel+2&&!/h|ll|rr|ch|qu|gu/.test(x.p)));   // (sin perro, queso, huevo, leche…: a quien no lee no le alcanza el sonido para saber cómo se escriben)
  return {tipo:"nombre",letras:[...w.p.toUpperCase()],dibujo:w.e,clave:"ar"+w.p,rotulo:"Armar la palabra «"+w.p+"»",decir:[ES.armar,C.palClip(w)],ocultar:[1]};
});

// ---- grupos: tocá el animal / la fruta…; y, más difícil, el que no va con los demás
J("l_categoria","lengua","🗂️","Grupos",3,nivel=>{
  const G=C.CATEGORIAS;
  for(let intento=0;intento<60;intento++){
    const g=elegir(G),pals=g.pal.map(p=>C.PALBY[p]);
    if(nivel<=2){   // un animal, una fruta… entre cosas de otros grupos
      const bien=elegir(pals),ds=[],cant=nivel===1?2:3;
      mezclar(G.filter(x=>x!==g)).forEach(o=>{const y=C.PALBY[elegir(o.pal)];if(ds.length<cant&&!ds.some(z=>C.ambPal(z,y))&&!C.ambPal(y,bien))ds.push(y)});
      if(ds.length<cant)continue;
      return {tipo:"eleccion",clave:"gr"+g.id+bien.p,rotulo:"Grupos: "+g.id+" ("+bien.p+")",decir:[g.k],cols:nivel===1?3:2,
        opciones:mezclar([bien].concat(ds)).map(y=>({h:`<span class="e">${y.e}</span>`,ok:y===bien,decir:[C.palClip(y)],aria:y.p})),alAcertar:[]};
    }
    if(g.pal.length<3)continue;   // el que no va: tres del mismo grupo y uno de otro
    const tres=sacar(pals,3),raro=C.PALBY[elegir(elegir(G.filter(x=>x!==g)).pal)],todos=tres.concat(raro);
    if(todos.some((a,i)=>todos.some((b,k)=>k>i&&(a.e===b.e||C.ambPal(a,b)))))continue;
    return {tipo:"eleccion",clave:"nv"+g.id+todos.map(y=>y.p).sort().join(""),rotulo:"Grupos: no va «"+raro.p+"» ("+g.id+")",decir:[ES.noVa],cols:2,
      opciones:mezclar(todos).map(y=>({h:`<span class="e">${y.e}</span>`,ok:y===raro,decir:[C.palClip(y)],aria:y.p})),alAcertar:[]};
  }
  throw new Error("l_categoria: no se pudo armar una pregunta");
});

// ---- lo contrario (grande ↔ chico, día ↔ noche…): se dice la palabra y hay que tocar el dibujo de su contrario
J("l_contrario","lengua","↔️","Lo contrario",2,nivel=>{
  const O=C.OPUESTOS,par=elegir(O),ida=Math.random()<.5,dice=ida?par.a:par.b,ed=ida?par.ea:par.eb,otra=ida?par.b:par.a,eo=ida?par.eb:par.ea,ds=[];
  mezclar(O.filter(x=>x.fam!==par.fam)).forEach(x=>{if(ds.length<(nivel===1?2:3)&&!ds.some(d=>d.fam===x.fam)){const lado=Math.random()<.5;ds.push({fam:x.fam,w:lado?x.a:x.b,e:lado?x.ea:x.eb})}});
  return {tipo:"eleccion",clave:"co"+dice,rotulo:"Lo contrario de "+dice+": "+otra,decir:[ES.contrarioDe,C.opClip(dice)],est:nivel===1?`<div class="grande">${ed}</div>`:"",cols:nivel===1?3:2,
    opciones:mezclar([{w:otra,e:eo,ok:true}].concat(ds)).map(x=>({h:`<span class="e">${x.e}</span>`,ok:!!x.ok,decir:x.ok?[C.opClip(dice),C.opClip(otra)]:[C.opClip(x.w)],aria:x.w})),alAcertar:[]};
});

// ---- memotest de letras: mayúscula y minúscula, y después una letra y el dibujo de algo que empieza con ella
J("l_memo","lengua","🃏","Memotest de letras",4,nivel=>{
  let pares=[];
  if(nivel<=2){
    const pool=nivel===1?VOCALES:C.LETRAS.filter(x=>!"IL".includes(x)&&x!=="Ñ");
    pares=sacar(pool,nivel===1?3:4).map(L=>({a:`<span class="let">${L}</span>`,b:`<span class="let">${L.toLowerCase()}</span>`,ka:[C.letraES(L)],kb:[C.letraES(L)]}));
  }else{   // una letra y un dibujo que empieza con ella (letras que no suenan parecido)
    const cant=nivel===3?4:6,usadas=[],lista=palabrasCon(x=>!SONIDO_RARO(x)&&x.ini!=="Q");let k=0;
    while(pares.length<cant&&++k<400){
      const w=elegir(lista);
      if(usadas.some(u=>u===w.ini||parecen(u,w.ini))||pares.some(p=>C.ambPal(p.w,w)||C.altInicial(p.w.p)===w.ini||C.altInicial(w.p)===p.w.ini))continue;
      usadas.push(w.ini);pares.push({w,a:`<span class="let">${w.ini}</span>`,b:`<span class="e">${w.e}</span>`,ka:[C.letraES(w.ini)],kb:[C.palClip(w)]});
    }
  }
  return {tipo:"memo",clave:"lm"+nivel+Math.random(),rotulo:"Memotest de letras",decir:[ES.parejas],pares};
},null,2,true);

// ===================================================================== el orden de los juegos en cada área (de lo más fácil a lo más difícil; lo que no está en la lista queda al final)
const ORDEN=["m_contar","m_dame","m_numeros","m_mas","m_comparar","m_sumar","m_restar","m_problemas","m_falta","m_decenas","m_orden","m_hora","m_figuras","m_patron","m_tamano","m_memo",
  "l_letra","l_abc","l_inicial","l_igual","l_completar","l_armar","l_silabas","l_rima","l_palabra","l_leer","l_categoria","l_contrario","l_nombre","l_memo"];
const todos=S5.juegos,pos=j=>{const i=ORDEN.indexOf(j.id);return i<0?1e3+todos.indexOf(j):i};
const orden=todos.map((j,i)=>({j,k:pos(j),i})).sort((a,b)=>a.k-b.k||a.i-b.i).map(x=>x.j);
todos.splice(0,todos.length,...orden);
})();
