// «Sala de 5» · motor adaptativo. Cada pregunta se arma con el nivel que le toca a la nena según cómo le fue, y «Sorpresa» / «Desafío» eligen qué juego conviene ahora.
// No es un modelo de lenguaje ni usa internet: es un algoritmo que aprende de cada respuesta (parecido al «Elo» del ajedrez), corre en el aparato y no manda nada a ningún lado.
//
//  · habilidad (hab): un número de 1 al nivel más alto del juego, con decimales. 3,4 quiere decir «nivel 3, y a punto de pasar al 4».
//  · cada pregunta se sortea con el nivel de la habilidad; la parte decimal es la chance de que sea del nivel de arriba (así los desafíos cambian de a poco, sin saltos).
//  · después de cada pregunta la habilidad sube o baja según lo que se esperaba: acertar a la primera una pregunta difícil sube mucho; fallar una fácil baja mucho.
//  · al principio de cada juego sube más rápido (para ubicarla enseguida) y con rachas de aciertos también.
(function(root){
"use strict";
const A={};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const AHORA=()=>{const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")};

// probabilidad de acertar a la primera una pregunta de nivel L teniendo habilidad h (con h = L da 0,75: el punto justo, ni aburrido ni frustrante)
A.esperado=(h,L)=>1/(1+Math.exp(-(1.5*(h-L)+1.1)));

// qué tan bien salió una pregunta (0 a 1): a la primera = 1; con 1 error .35; con 2 errores .15; con 3 (o si se la mostramos) = 0; si esperó a que le marquemos la respuesta, a lo sumo .6
A.resultado=(errores,ayudada)=>{
  let o=errores<=0?1:errores===1?.35:errores===2?.15:0;
  if(ayudada)o=Math.min(o,.6);
  return o;
};

// cuánto se mueve la habilidad con cada respuesta: más al principio (para ubicarla rápido) y con rachas
A.paso=(n,racha)=>{let k=n<8?1.1:n<25?.65:.35;if(racha>=3)k*=1.5;return k};

// anota una respuesta en el registro del juego g ({hab,n,racha}); L = nivel de la pregunta, o = resultado (0 a 1), niv = nivel más alto del juego
A.actualizar=(g,L,o,niv)=>{
  g.n=(g.n||0)+1;
  const r=g.racha||0,k=A.paso(g.n-1,r),h=g.hab||1;
  g.hab=clamp(h+k*(o-A.esperado(h,L)),1,niv);
  g.racha=o>=1?(r>0?r+1:1):o<.5?0:r;
  return g;
};

// nivel de la próxima pregunta: el de la habilidad (la parte decimal es la chance de pasar al de arriba), a veces uno más fácil (confianza y repaso) o uno más difícil (tantear)
A.nivelPregunta=(h,niv,rnd)=>{
  rnd=rnd||Math.random;
  const base=Math.floor(h),frac=h-base;
  let L=base+(rnd()<frac?1:0);
  const r=rnd();
  if(r<.12&&L>1)L--;else if(r>.92&&L<niv)L++;
  return clamp(L,1,niv);
};

const dias=(a,b)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(a||""))return 14;const f=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10));return Math.max(0,Math.round((f(b)-f(a))/864e5))};
A.diasDesde=dias;

// qué tan «pendiente» está un juego (más = conviene jugarlo ahora): los que nunca jugó, los que todavía le quedan por subir, los que hace rato no juega y los que le cuestan
A.peso=(j,g,hoy)=>{
  let w=1;
  if(!g||!(g.n>0))w*=3;
  else{
    const margen=(j.niv-(g.hab||1))/Math.max(1,j.niv-1);
    w*=.4+1.6*clamp(margen,0,1);
    w*=1+Math.min(dias(g.ult,hoy),7)*.15;
    const t=(g.bien||0)+(g.mal||0);
    if(t>=5&&(g.mal||0)/t>.4)w*=1.5;
  }
  return w;
};

// elige un juego de la lista (sorteo con esos pesos). opt: {rnd, hoy, evitar (id del que acaba de jugar), contar ({id: veces} en este desafío)}
A.elegirJuego=(lista,estado,opt)=>{
  opt=opt||{};const rnd=opt.rnd||Math.random,hoy=opt.hoy||AHORA(),jg=(estado&&estado.juegos)||{};
  const pesos=lista.map(j=>{
    let w=A.peso(j,jg[j.id],hoy);
    if(opt.evitar&&j.id===opt.evitar)w*=.03;
    if(opt.contar&&opt.contar[j.id])w/=1+opt.contar[j.id]*2;
    return w;
  });
  const tot=pesos.reduce((a,b)=>a+b,0);let x=rnd()*tot;
  for(let i=0;i<lista.length;i++){x-=pesos[i];if(x<=0)return lista[i]}
  return lista[lista.length-1];
};

root.S5=root.S5||{};root.S5.adapt=A;
if(typeof module!=="undefined"&&module.exports)module.exports=A;
})(typeof window!=="undefined"?window:globalThis);
