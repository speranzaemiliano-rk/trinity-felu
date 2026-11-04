// El motor adaptativo de «Sala de 5» (sala5/adaptar.js): lo que hace que los desafíos suban y bajen de a poco según cómo le va.
// Es un algoritmo puro, así que se prueba sin navegador: con «chicos virtuales» (que contestan con una probabilidad según su habilidad real) se comprueba que
// encuentra su nivel rápido y sin pasarse, que cada pregunta sale del nivel justo (con la parte decimal como chance de pasar al de arriba), que «Sorpresa» y
// «Desafío» eligen lo que conviene (lo que nunca jugó, lo que le cuesta, lo que hace rato no juega) y no repiten, y que nunca salen números fuera de rango.
const A=require('../sala5/adaptar.js');
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);
// azar con semilla: las pruebas dan siempre lo mismo
const sem=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const mediana=v=>{v=v.slice().sort((a,b)=>a-b);return v[Math.floor(v.length/2)]};

// ---------- 1) lo que se espera y cómo se puntúa una respuesta
chk('con la habilidad igual al nivel de la pregunta se espera acertar 3 de cada 4 (el punto justo: ni aburrido ni frustrante)',Math.abs(A.esperado(3,3)-.75)<.01,String(A.esperado(3,3)));
let mono=true;for(let h=1;h<=7;h+=.5)for(let L=1;L<=7;L++){if(!(A.esperado(h+.5,L)>A.esperado(h,L)&&A.esperado(h,L+1)<A.esperado(h,L)))mono=false}
chk('acertar se espera más cuanto más habilidad y menos cuanto más difícil la pregunta',mono);
chk('cómo salió una pregunta: a la primera 1; con 1 error .35; con 2 errores .15; con 3 o más (o se la mostramos) 0; y si esperó a que le marquen la respuesta, a lo sumo .6',
  A.resultado(0,false)===1&&A.resultado(1,false)===.35&&A.resultado(2,false)===.15&&A.resultado(3,false)===0&&A.resultado(9,false)===0&&A.resultado(0,true)===.6&&A.resultado(2,true)===.15);

// ---------- 2) actualizar: sube con los aciertos, baja con los errores, se acota y lleva la cuenta
let g={hab:3,n:0,racha:0};A.actualizar(g,3,1,7);const subio=g.hab;
chk('un acierto a la primera en una pregunta de su nivel sube la habilidad, y cuenta la pregunta y la racha',subio>3&&g.n===1&&g.racha===1,j(g));
g={hab:3,n:30,racha:0};A.actualizar(g,3,0,7);
chk('un error en una pregunta de su nivel la baja',g.hab<3&&g.racha===0,j(g));
g={hab:5,n:30,racha:0};A.actualizar(g,2,0,7);const bajaFacil=5-g.hab;g={hab:5,n:30,racha:0};A.actualizar(g,8,0,9);const bajaDificil=5-g.hab;
chk('fallar una fácil la baja mucho más que fallar una difícil (era de esperar) y acertar una difícil la sube más que una fácil',bajaFacil>bajaDificil*3,j([bajaFacil,bajaDificil]));
g={hab:3,n:30,racha:0};A.actualizar(g,6,1,9);const subeDificil=g.hab-3;g={hab:3,n:30,racha:0};A.actualizar(g,1,1,9);const subeFacil=g.hab-3;
chk('acertar una difícil sube más que acertar una fácil',subeDificil>subeFacil*3,j([subeDificil,subeFacil]));
g={hab:6.95,n:50,racha:4};A.actualizar(g,7,1,7);const g2={hab:1.02,n:50,racha:0};A.actualizar(g2,1,0,7);
chk('la habilidad nunca pasa del nivel más alto del juego ni baja del 1',g.hab<=7&&g2.hab>=1,j([g.hab,g2.hab]));
g={hab:2,n:0,racha:0};const k0=A.paso(0,0),k1=A.paso(40,0),k2=A.paso(40,3);
chk('al principio de cada juego se mueve más (para ubicarla rápido), después más despacio, y con una racha de 3 aciertos acelera',k0>A.paso(10,0)&&A.paso(10,0)>k1&&k2>k1,j([k0,A.paso(10,0),k1,k2]));
g={hab:2,n:10,racha:0};[1,1,1,1].forEach(o=>A.actualizar(g,2,o,7));const rachaOk=g.racha;A.actualizar(g,2,.6,7);const rachaConAyuda=g.racha;A.actualizar(g,2,.35,7);const rachaUnError=g.racha;
chk('la racha cuenta aciertos a la primera seguidos; una respuesta con ayuda (sin errores) no la corta ni la alarga, y cualquier error la reinicia',rachaOk===4&&rachaConAyuda===4&&rachaUnError===0,j([rachaOk,rachaConAyuda,rachaUnError]));

// ---------- 3) chicos virtuales: ¿encuentra su nivel rápido y sin pasarse?
function corrida(tipo,theta,niv,N,semilla){
  const rnd=sem(semilla),g={hab:1,n:0,racha:0},hist=[],niveles=[];
  for(let i=0;i<N;i++){
    const L=A.nivelPregunta(g.hab,niv,rnd);niveles.push(L);
    const p=tipo==='logistico'?A.esperado(theta,L):(L<=theta+.5?.95:L<=theta+1.5?.45:.12);
    const e=rnd()<p?0:(rnd()<.6?1:rnd()<.5?2:3);
    A.actualizar(g,L,A.resultado(e,false),niv);hist.push(g.hab);
  }
  return {hist,niveles};
}
for(const tipo of ['logistico','umbral']){
  const malos=[];
  for(let theta=1;theta<=7;theta++){
    const rs=[];for(let s=1;s<=120;s++)rs.push(corrida(tipo,theta,7,100,s));
    const h25=mediana(rs.map(r=>r.hist[24])),h100=mediana(rs.map(r=>r.hist[99]));
    let dificil=0,facil=0,tot=0;rs.forEach(r=>r.niveles.slice(30).forEach(L=>{tot++;if(L>theta+1.5)dificil++;if(L<theta-2)facil++}));
    // a las 25 preguntas (5 rondas) ya está cerca de su nivel; a las 100 sigue ahí sin pasarse; y casi nada es muy difícil ni muy fácil
    if(!(h25>=Math.min(theta,7)-1.3&&h25<=theta+1.1&&h100>=theta-.6&&h100<=theta+1&&dificil/tot<.09&&facil/tot<.03))malos.push({theta,h25:+h25.toFixed(2),h100:+h100.toFixed(2),dificil:+(dificil/tot).toFixed(3),facil:+(facil/tot).toFixed(3)});
  }
  chk('chico virtual «'+tipo+'» con habilidad real de 1 a 7: a las 25 preguntas (5 rondas) ya está cerca de su nivel, a las 100 se queda ahí sin pasarse, y casi ninguna pregunta le sale muy difícil ni muy fácil',malos.length===0,j(malos));
}
// uno que mejora (aprende): el motor lo sigue hacia arriba
{
  const rs=[];for(let s=1;s<=100;s++){
    const rnd=sem(s*7),g={hab:1,n:0,racha:0};
    for(let i=0;i<200;i++){const theta=1+i/40;const L=A.nivelPregunta(g.hab,7,rnd);const e=rnd()<A.esperado(theta,L)?0:1;A.actualizar(g,L,A.resultado(e,false),7)}
    rs.push(g.hab);
  }
  chk('si la nena aprende (su habilidad real sube de 1 a 6 durante 200 preguntas), el motor la sigue: termina cerca de 6',Math.abs(mediana(rs)-6)<1,String(mediana(rs)));
}

// ---------- 4) el nivel de cada pregunta
{
  const rnd=sem(5);const conteo={};let suma=0;const N=20000;
  for(let i=0;i<N;i++){const L=A.nivelPregunta(3.0,7,rnd);conteo[L]=(conteo[L]||0)+1;suma+=L}
  chk('con habilidad 3,0 casi todo es de nivel 3, algo más fácil (2) y algo más difícil (4), y nada fuera de eso ('+j(conteo)+')',conteo[3]/N>.7&&conteo[2]/N>.05&&conteo[2]/N<.2&&conteo[4]/N>.04&&conteo[4]/N<.15&&!conteo[1]&&!conteo[5]&&!conteo[6]);
  const frac=h=>{const r=sem(11);let alto=0;for(let i=0;i<20000;i++)if(A.nivelPregunta(h,7,r)>=Math.ceil(h))alto++;return alto/20000};
  chk('la parte decimal de la habilidad es la chance de que la pregunta sea del nivel de arriba: 3,1 → pocas, 3,5 → la mitad, 3,9 → casi todas (así los desafíos cambian de a poco, sin saltos)',frac(3.1)<frac(3.5)&&frac(3.5)<frac(3.9)&&frac(3.1)<.3&&frac(3.9)>.7,j([frac(3.1),frac(3.5),frac(3.9)]));
  let fuera=0;const r2=sem(3);for(let i=0;i<20000;i++){const h=1+r2()*6,L=A.nivelPregunta(h,7,r2);if(!(L>=1&&L<=7&&Number.isInteger(L)))fuera++}
  for(const [h,niv] of [[1,1],[1,2],[2,2],[1.9,2]])for(let i=0;i<500;i++){const L=A.nivelPregunta(h,niv,r2);if(!(L>=1&&L<=niv))fuera++}
  chk('el nivel de la pregunta siempre es un entero entre 1 y el nivel más alto del juego (también en juegos de 1 o 2 niveles)',fuera===0,String(fuera));
}

// ---------- 5) qué juego conviene ahora
const juegos=[{id:'nuevo',niv:6},{id:'domina',niv:6},{id:'cuesta',niv:6},{id:'hace_rato',niv:6},{id:'ayer',niv:6},{id:'ingles',niv:2}];
const estado={juegos:{
  domina:{hab:6,n:60,bien:50,mal:5,ult:'2026-11-03'},
  cuesta:{hab:3,n:40,bien:12,mal:18,ult:'2026-11-03'},
  hace_rato:{hab:3,n:40,bien:30,mal:5,ult:'2026-10-20'},
  ayer:{hab:3,n:40,bien:30,mal:5,ult:'2026-11-02'},
  ingles:{hab:2,n:40,bien:35,mal:3,ult:'2026-11-03'}}};
const peso=id=>A.peso(juegos.find(x=>x.id===id),estado.juegos[id],'2026-11-03');
chk('pesos: lo que nunca jugó pesa más que todo, lo que domina casi no, lo que le cuesta más que lo parejo, y lo que hace rato no juega más que lo de ayer',
  peso('nuevo')>peso('cuesta')&&peso('cuesta')>peso('ayer')&&peso('hace_rato')>peso('ayer')&&peso('ayer')>peso('domina')&&peso('domina')<peso('nuevo')/3,j(juegos.map(x=>[x.id,+peso(x.id).toFixed(2)])));
{
  const r=sem(9),veces={};for(let i=0;i<6000;i++){const e=A.elegirJuego(juegos,estado,{rnd:r,hoy:'2026-11-03'});veces[e.id]=(veces[e.id]||0)+1}
  chk('«Sorpresa»: elige de todo, pero más lo que conviene (nuevo y lo que le cuesta) que lo que ya domina ('+j(veces)+')',juegos.every(x=>veces[x.id]>0)&&veces.nuevo>veces.domina*3&&veces.cuesta>veces.domina*2);
  const seg={};let repetido=0,antes=null;const r3=sem(21);
  for(let i=0;i<3000;i++){const e=A.elegirJuego(juegos,estado,{rnd:r3,hoy:'2026-11-03',evitar:antes});if(e.id===antes)repetido++;antes=e.id}
  chk('no repite el juego que acaba de jugar (salvo casi nunca)',repetido/3000<.02,String(repetido));
  const contar={};let max=0;const r4=sem(33),en={};
  for(let k=0;k<400;k++){const c={};let ant=null;for(let i=0;i<8;i++){const e=A.elegirJuego(juegos,estado,{rnd:r4,hoy:'2026-11-03',evitar:ant,contar:c});c[e.id]=(c[e.id]||0)+1;ant=e.id;en[e.id]=(en[e.id]||0)+1}max=Math.max(max,...Object.values(c))}
  chk('un desafío de 8 preguntas mezcla juegos: casi nunca el mismo más de 3 veces y todos los juegos tienen su lugar',max<=5&&juegos.every(x=>en[x.id]>0),j([max,en]));
  const vacio=A.elegirJuego(juegos,{juegos:{}},{rnd:sem(1)});
  chk('sin nada jugado todavía elige igual (y siempre devuelve un juego de la lista)',juegos.includes(vacio)&&juegos.includes(A.elegirJuego([juegos[0]],estado,{rnd:()=>.999999})));
}
chk('los días desde que lo jugó: de fecha a fecha; una fecha mal escrita o vacía cuenta como «hace rato»',A.diasDesde('2026-10-20','2026-11-03')===14&&A.diasDesde('2026-11-03','2026-11-03')===0&&A.diasDesde('','2026-11-03')===14&&A.diasDesde('ayer','2026-11-03')===14&&A.diasDesde('2026-12-01','2026-11-03')===0);

const mal=res.filter(x=>!x).length;
console.log(mal?'HAY FALLOS ('+mal+' de '+res.length+')':'TODO OK ('+res.length+' chequeos)');
process.exit(mal?1:0);
