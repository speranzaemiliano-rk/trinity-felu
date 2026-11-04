// «Sala de 5» · los niveles altos y las actividades nuevas de Lengua y Matemática (sala5/juegos2.js y lo que se subió de nivel en juego.js).
// tests/sala5.js comprueba que TODAS las preguntas estén bien armadas (una correcta, opciones distintas, audio). Acá se comprueba que sean CIERTAS: que la cuenta dé lo que dice la opción correcta,
// que el reloj marque la hora que se pide, que el animal sea un animal, que la palabra que falta sea la que falta, que el memotest tenga parejas de verdad…
// Es la prueba que habría atrapado un «2 + 3 = 6». No necesita navegador más que para cargar la página (los generadores corren en ella).
// Se puede probar el sitio publicado:  URL=https://speranzaemiliano-rk.github.io/trinity-felu/sala5/ node tests/sala5_nuevos.js
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const http=require('http');
const RAIZ=path.resolve(__dirname,'..');
let URL=process.env.URL||null;
const TIPOS={'.css':'text/css','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.html':'text/html; charset=utf-8','.mp3':'audio/mpeg'};
const servir=()=>new Promise(ok=>{const sv=http.createServer((rq,rs)=>{
  let rel=decodeURIComponent(rq.url.split('?')[0]).replace(/^\/+/,'');if(rel===''||rel.endsWith('/'))rel+='index.html';
  const f=path.resolve(RAIZ,rel);
  if(!f.startsWith(RAIZ+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){rs.writeHead(404);return rs.end('no')}
  rs.writeHead(200,{'content-type':TIPOS[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});rs.end(fs.readFileSync(f))});
  sv.listen(0,'127.0.0.1',()=>ok(sv))});
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,v?'':(x||''))};
const j=o=>JSON.stringify(o);

(async()=>{
let srv=null;if(!URL){srv=await servir();URL='http://127.0.0.1:'+srv.address().port+'/sala5/'}
const b=await chromium.launch();const p=await b.newPage({viewport:{width:390,height:844}});p.errs=[];
p.on('pageerror',e=>p.errs.push(e.message));
await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
await p.goto(URL);await p.waitForSelector('#bJugar');

// todo corre dentro de la página: F(juego, nivel, veces, función) arma la pregunta muchas veces y la función devuelve un texto si algo está mal
const r=await p.evaluate(()=>{
  const C=S5.C,ES=C.ES,HAY=new Set(S5_AUDIO),mal={},cuenta={},FEAS=new Set(['puto','puta','pito','pedo','caga','cago','culo','pija','poto','pete','caca','teta']);
  const J=id=>S5.juegos.find(x=>x.id===id),tts=k=>(S5.audio[k]||{}).tts||'';
  const ok=q=>q.opciones.find(o=>o.ok),arias=q=>q.opciones.map(o=>o.aria);
  const doc=h=>{const d=document.createElement('div');d.innerHTML=h;return d};
  const num=k=>+String(k).slice(4);   // «es_n12» → 12
  const nombreNum=t=>C.NUM_ES.indexOf(String(t).trim().toLowerCase());
  const F=(id,niv,veces,fn)=>{const g=id+' n'+niv;for(let i=0;i<veces;i++){
    let q;try{q=J(id).gen(niv)}catch(e){(mal[g]=mal[g]||[]).push('al armar: '+e.message);return}
    cuenta[g]=(cuenta[g]||0)+1;
    let m;try{m=fn(q)}catch(e){m='error '+e.message}
    if(m){(mal[g]=mal[g]||[]).push(m+' · '+(q.rotulo||''));if(mal[g].length>=2)return}}};
  const horaDe=h=>{const m=/class="rh" x1="50" y1="50" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/.exec(h),mn=/class="rm" x1="50" y1="50" x2="(-?[\d.]+)" y2="(-?[\d.]+)"/.exec(h);
    if(!m||!mn||+mn[1]!==50||+mn[2]>=50)return -1;   // el minutero tiene que apuntar al 12
    let a=Math.atan2(+m[1]-50,50-+m[2])*180/Math.PI;if(a<0)a+=360;return Math.round(a/30)||12};

  // ---------------- Matemática
  for(let n=1;n<=4;n++)F('m_contar',n,120,q=>{const e=doc(q.est),k=e.querySelectorAll('.obj').length,[a,z]=[[1,5],[3,10],[11,20],[21,30]][n-1];
    if(k!==+ok(q).aria)return 'hay '+k+' y la correcta es '+ok(q).aria;if(k<a||k>z)return 'fuera de rango '+k;if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones'});
  F('m_dame',3,120,q=>{if(!(q.n>=8&&q.n<=12&&q.total>=q.n+2&&q.total<=14))return 'canasta n='+q.n+' total='+q.total;if(!tts(q.decir[0]).includes(C.NUM_ES[q.n]))return 'la voz no dice '+C.NUM_ES[q.n]});
  for(let n=1;n<=5;n++)F('m_numeros',n,150,q=>{const t=+ok(q).aria,[a,z]=[[1,5],[1,10],[10,20],[21,50],[51,99]][n-1];if(t<a||t>z)return 'fuera de rango';
    const dice=q.decir.map(tts).join(' ');if(dice!=='Tocá el '+C.NUM_ES[t])return 'la voz no dice «Tocá el '+C.NUM_ES[t]+'»: '+dice;
    if(n>=4){if(q.opciones.length!==4)return q.opciones.length+' opciones';const ns=arias(q).map(Number);if(ns.some(x=>x<1||x>99))return 'una opción fuera de 1 a 99';if(!ns.some(x=>x!==t&&Math.abs(x-t)<=10||(String(x).length===2&&String(x)[1]+String(x)[0]===String(t))))return 'ninguna se le parece'}});
  for(let n=1;n<=3;n++)F('m_comparar',n,150,q=>{const modo=q.decir[0].includes('grande')?'grande':'chico',ns=arias(q).map(Number),gana=modo==='grande'?Math.max(...ns):Math.min(...ns),[a,z,c]=[[1,10,2],[1,20,3],[10,99,3]][n-1];
    if(+ok(q).aria!==gana)return 'la correcta no es el más '+modo;if(ns.length!==c||new Set(ns).size!==c)return 'cantidad rara';if(ns.some(x=>x<a||x>z))return 'fuera de rango';if(!tts(q.decir[0]).includes(modo==='grande'?'grande':'chico'))return 'la voz no dice «'+modo+'»'});
  for(let n=1;n<=5;n++)F('m_sumar',n,200,q=>{
    const m=/^Sumar: (\d+) \+ (?:(\d+)|\? = (\d+))$/.exec(q.rotulo);if(!m)return 'rótulo raro';const a=+m[1],b=m[2]?+m[2]:+m[3]-a,res=m[2]?a+b:b;
    if(+ok(q).aria!==res)return 'la correcta no es '+res;if(a<1||b<1)return 'un sumando menor que 1';
    if(n<=3){const ps=[...doc(q.est).querySelectorAll('.panel')].map(x=>x.querySelectorAll('span').length);if(ps.length!==2||ps[0]!==a||ps[1]!==b)return 'los dibujos no son '+a+' y '+b+' ('+ps+')'}
    if(n===1&&a+b>5)return 'el nivel 1 pasa de 5';if(n===2&&a+b>10)return 'el nivel 2 pasa de 10';
    if((n===3||n===4)&&!(a+b>=11&&a+b<=20&&a<=10&&b<=10))return 'el nivel '+n+' tiene que pasar del 10 con sumandos de hasta 10';
    if(n===5&&a+b>20)return 'el nivel 5 pasa de 20';
    if(n<=4&&!(q.decir[0]==='es_n'+a&&q.decir[1]==='es_mas'&&q.decir[2]==='es_n'+b))return 'la voz no dice la cuenta';
    if(n===5&&!(q.decir[0]==='es_n'+a&&q.decir[1]==='es_mas'&&q.decir[2]===ES.cuantoQ&&q.decir[3]===ES.esIgualA&&q.decir[4]==='es_n'+(a+b)))return 'la voz no dice «a más ¿cuánto? es igual a total»';
    if(n>=4&&doc(q.est).querySelectorAll('.panel,.obj').length)return 'el nivel '+n+' tiene que ser sin dibujos'});
  for(let n=1;n<=5;n++)F('m_restar',n,200,q=>{
    const m=/^Restar: (\d+) − (\d+)$/.exec(q.rotulo);if(!m)return 'rótulo raro';const a=+m[1],b=+m[2];
    if(+ok(q).aria!==a-b)return 'la correcta no es '+(a-b);if(b<1||b>=a)return 'la resta no da positivo';
    if(n<=4){const e=doc(q.est);if(e.querySelectorAll('.obj').length!==a||e.querySelectorAll('.obj.tachado').length!==b)return 'los dibujos no son '+a+' con '+b+' tachados'}
    const [lo,hi]=[[2,5],[2,10],[6,15],[11,20],[10,20]][n-1];if(a<lo||a>hi)return 'fuera de rango '+a;
    if(!(q.decir[0]==='es_n'+a&&q.decir[1]==='es_menos'&&q.decir[2]==='es_n'+b))return 'la voz no dice la cuenta';
    if(n===5&&doc(q.est).querySelectorAll('.obj').length)return 'el nivel 5 tiene que ser sin dibujos'});
  for(let n=1;n<=4;n++)F('m_problemas',n,250,q=>{
    const d=q.decir,nums=d.filter(k=>/^es_n\d+$/.test(k)).map(num),suma=d.includes('es_me-regalan'),resta=d.includes('es_se-van');let res;
    if(suma&&!resta)res=nums[0]+nums[1];else if(resta&&!suma)res=nums[0]-nums[1];else if(suma&&resta)res=nums[0]+nums[1]-nums[2];else return 'ni suma ni resta';
    if(+ok(q).aria!==res)return 'la correcta no es '+res+' (los números: '+nums+')';if(res<1)return 'el resultado es menor que 1';if(nums.some(x=>x<2))return 'un número menor que 2: diría «uno»';
    const pl=C.PROB.find(x=>d.includes(x.k));if(!pl)return 'la voz no dice qué se cuenta';
    const fem=d.some(k=>/cuantas/.test(k)),masc=d.some(k=>/cuantos/.test(k));if(pl.f?(!fem||masc):(!masc||fem))return 'el género no concuerda con «'+pl.pl+'»';
    if(!doc(q.est).textContent.includes(pl.e))return 'el dibujo no es de lo que se cuenta';
    {const d=document.createElement('div');q.revelar(d);if(d.querySelectorAll('.obj').length!==res||!d.textContent.includes(pl.e))return 'al contestar se tienen que ver '+res+' cosas y se ven '+d.querySelectorAll('.obj').length}
    if(n===1&&(resta||res>6||nums.some(x=>x>3)))return 'el nivel 1 son sumas de 2 o 3 más 2 o 3';if(n===2&&Math.max(...nums,res)>10)return 'el nivel 2 pasa de 10';if(n===3&&Math.max(...nums,res)>20)return 'el nivel 3 pasa de 20';
    if(n===4&&!(suma&&resta))return 'el nivel 4 son dos pasos';if(n===3&&suma&&resta)return 'el nivel 3 no es de dos pasos';
    if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones';
    if(d.filter(k=>k==='|').length<2)return 'sin pausas entre las oraciones';if(d.includes('es_regalo'))return 'quedó «Regalo» (se confunde con «Me regalan»)'});
  for(let n=1;n<=5;n++)F('m_falta',n,200,q=>{
    const cajas=[...doc(q.est).querySelectorAll('.caja')];if(cajas.length!==5)return 'no son 5 cajas';const h=cajas.findIndex(c=>c.classList.contains('hueco'));if(h<0||h===4)return 'el hueco está mal';
    const v=cajas.map(c=>+c.textContent),falta=+ok(q).aria,full=q.alAcertar.map(num);
    if(full.length!==5||full.some((x,i)=>i!==h&&x!==v[i])||full[h]!==falta)return 'la fila completa no coincide con lo que se ve';
    const pasos=full.slice(1).map((x,i)=>x-full[i]);if(new Set(pasos).size!==1)return 'no es una progresión: '+full;const paso=pasos[0];
    if(n<=3&&paso!==1)return 'los tres primeros niveles son de uno en uno';if(n===4&&!([2,5,10].includes(paso)&&full[0]%paso===0))return 'el nivel 4 es de 2, 5 o 10 en 10 (paso '+paso+')';
    if(n===5&&Math.abs(paso)!==1)return 'el nivel 5 es de uno en uno (cuenta regresiva o números grandes)';
    if(n===5&&!(paso===-1?full[0]>=6&&full[0]<=20:full[0]>=21))return 'el nivel 5: ni cuenta regresiva ni números grandes ('+full+')';
    if(Math.max(...full)>(n===1?5:n===2?10:n===3?20:n===4?100:99)||Math.min(...full)<1)return 'fuera de rango '+full;
    if(q.opciones.length!==(n<=3?3:4))return q.opciones.length+' opciones';
    if(q.opciones.some(o=>+o.aria!==falta&&full.includes(+o.aria)))return 'una opción incorrecta ya se ve en la fila (se acierta por descarte)';
    if(q.opciones.some(o=>+o.aria>99))return 'una opción de tres cifras («'+arias(q)+'»): en un celular de costado no entra en el botón'});
  F('m_decenas',1,60,q=>{return null});
  for(let n=1;n<=3;n++)F('m_decenas',n,150,q=>{
    const e=doc(q.est),d=e.querySelectorAll('.dec').length,u=e.querySelectorAll('.unis i').length,t=+ok(q).aria;
    if(d*10+u!==t)return 'se ven '+d+' decenas y '+u+' unidades y la correcta es '+t;if([...e.querySelectorAll('.dec')].some(x=>x.querySelectorAll('i').length!==10))return 'una decena no tiene 10';if(u>9)return 'más de 9 unidades';
    const [a,z]=[[1,1],[2,5],[5,9]][n-1];if(d<a||d>z)return 'decenas fuera de rango '+d;if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones';
    if(!arias(q).map(Number).every(x=>x>=1&&x<=99))return 'una opción fuera de 1 a 99';
    const dice=ok(q).decir.map(num);if(dice.slice(0,d).join()!==Array.from({length:d},(_,i)=>10*(i+1)).join()||(u&&dice[d]!==t)||dice.length!==d+(u?1:0))return 'al acertar no cuenta de diez en diez y termina en el número: '+dice});
  for(let n=1;n<=4;n++)F('m_orden',n,150,q=>{
    if(q.tipo!=='nombre'||!q.numeros)return 'no es de ordenar';const ns=q.letras.map(Number),baja=q.decir[0].includes('del-mas-grande-al-mas-chico'),[cant,max]=[[3,10],[4,20],[4,20],[4,99]][n-1];
    if(ns.length!==cant||new Set(ns).size!==cant)return 'cantidad rara o repetidos';if(ns.some(x=>x<1||x>max))return 'fuera de rango';
    const orden=ns.slice().sort((a,b)=>baja?b-a:a-b);if(orden.join()!==ns.join())return 'no está en el orden que se pide';if(n<=2&&baja)return 'los niveles 1 y 2 son de menor a mayor';
    if(!q.letras.every(t=>HAY.has(q.decirItem(t))))return 'una ficha sin audio'});
  for(let n=1;n<=3;n++)F('m_hora',n,150,q=>{
    const h=+ok(q).aria;
    if(n<=2){const hh=horaDe(q.est);if(hh!==h)return 'el reloj marca '+hh+' y la correcta es '+h;if(q.alAcertar[0]!=='es_son-las-'+h)return 'no dice «Son las '+h+'»';if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones';
      if(n===1&&(q.decir[1]!==ES.manitoCorta||!/class="reloj guia"/.test(q.est)||(h!==12&&arias(q).includes('12'))))return 'el nivel 1: dice qué manito mirar, la larga se ve finita y el 12 no es distractor';if(n===2&&q.decir.length!==1)return 'el nivel 2 no lleva ayuda'}
    else{const pedida=/la una/.test(tts(q.decir[0]))?1:nombreNum(tts(q.decir[0]).split(' ').pop()),hs=q.opciones.map(o=>horaDe(o.h));
      if(hs.some(x=>x<1))return 'un reloj mal dibujado';if(new Set(hs).size!==3)return 'relojes repetidos';if(horaDe(ok(q).h)!==pedida)return 'el reloj correcto marca '+horaDe(ok(q).h)+' y se pide el de las '+pedida}});
  for(let n=1;n<=5;n++)F('m_figuras',n,150,q=>{
    if(n===5){const m=/^Lados del (.+): (\d)$/.exec(q.rotulo);if(!m)return 'rótulo raro';const e=doc(q.est),pol=e.querySelector('polygon'),lados=pol?pol.getAttribute('points').trim().split(/\s+/).length:e.querySelector('rect')?4:-1;
      if(lados!==+m[2]||+ok(q).aria!==lados)return 'el dibujo tiene '+lados+' lados y la correcta es '+ok(q).aria;if(arias(q).join()!=='3,4,5,6')return 'las opciones no son 3, 4, 5, 6'}
    else{const f=ok(q).aria;if(!tts(q.decir[0]).includes(f))return 'la voz no dice «'+f+'»';if(n===4&&q.opciones.length!==4)return q.opciones.length+' opciones'}});
  for(let n=1;n<=5;n++)F('m_patron',n,200,q=>{
    const cajas=[...doc(q.est).querySelectorAll('.caja')],s=cajas.slice(0,-1).map(c=>c.innerHTML);if(!cajas[cajas.length-1].classList.contains('hueco'))return 'el hueco no está al final';
    let per=0;for(let p=1;p<=s.length-1&&!per;p++)if(s.every((x,i)=>i<p||x===s[i-p]))per=p;   // el período más corto (en los patrones largos, como AABB, sólo se ve repetido el principio del segundo ciclo)if(!per)return 'no se repite un patrón';
    const sig=s[s.length-per],h=doc(ok(q).h).querySelector('.e').innerHTML;if(h!==sig)return 'la correcta no es la que sigue';
    if(s.length+1>8)return 'no entra en una fila ('+(s.length+1)+' cajas)';if(n>=4&&q.opciones.length!==4)return q.opciones.length+' opciones'});
  F('m_tamano',3,150,q=>{const ws=q.opciones.map(o=>+/width:(\d+)%/.exec(o.h)[1]),mas=q.decir[0].includes('largo');const gana=mas?Math.max(...ws):Math.min(...ws);
    if(ws[q.opciones.findIndex(o=>o.ok)]!==gana)return 'la correcta no es la más '+(mas?'larga':'corta');if(new Set(ws).size!==3)return 'barras iguales';if(Math.max(...ws)-Math.min(...ws)<30)return 'barras muy parecidas'});
  const memoN=(id,niv,veces,fn)=>F(id,niv,veces,q=>{
    if(q.tipo!=='memo')return 'no es memotest';const cant=[3,4,4,6][niv-1];if(q.pares.length!==cant)return q.pares.length+' pares y tocan '+cant;
    const caras=q.pares.flatMap(p=>[p.a,p.b]);if(new Set(caras).size!==caras.length)return 'cartas repetidas';
    if(!q.pares.every(p=>(p.ka||[]).concat(p.kb||[]).every(k=>HAY.has(k))))return 'una carta sin audio';return fn(q)});
  for(let n=1;n<=4;n++)memoN('m_memo',n,60,q=>{
    for(const p of q.pares){
      if(n<=2){const a=+doc(p.a).textContent,k=doc(p.b).querySelectorAll('i').length;if(a!==k)return 'la carta dice '+a+' y hay '+k+' cositas';if(p.ka[0]!=='es_n'+a||p.kb[0]!=='es_n'+a)return 'la voz no dice '+a}
      else{const m=/^(\d+)\+(\d+)$/.exec(doc(p.a).textContent),t=+doc(p.b).textContent;if(!m||+m[1]+ +m[2]!==t)return 'la cuenta '+doc(p.a).textContent+' no da '+t;if(p.kb[0]!=='es_n'+t)return 'la voz no dice '+t;if(t>(n===3?10:15))return 'resultado muy grande'}}
    if(n>=3){const ts=q.pares.map(p=>+doc(p.b).textContent);if(new Set(ts).size!==ts.length)return 'dos cuentas con el mismo resultado'}});

  // ---------------- Lengua
  if(C.NOM_ES.B!=='be larga'||C.NOM_ES.V!=='ve corta')mal['letras']=['la B es «be larga» y la V «ve corta» (en Argentina; «uve» es de España)'];
  for(let n=1;n<=4;n++)F('l_letra',n,150,q=>{const L=ok(q).aria.replace('letra ','');
    if(!tts(q.decir[0]).endsWith(C.NOM_ES[L.toUpperCase()]))return 'la voz no dice el nombre de la letra '+L;
    if(n===4){if(!arias(q).every(a=>/^letra [a-zñ]$/.test(a)))return 'en el nivel 4 todas las letras son minúsculas';if(q.opciones.length!==4)return q.opciones.length+' opciones'}});
  for(let n=1;n<=3;n++)F('l_abc',n,200,q=>{
    const cajas=[...doc(q.est).querySelectorAll('.caja')],h=cajas.findIndex(c=>c.classList.contains('hueco')),falta=ok(q).aria.replace('letra ','');
    if(cajas.length!==(n===1?4:5)||h<0||h===cajas.length-1)return 'cajas o hueco mal';const L=C.LETRAS,sec=cajas.map((c,i)=>i===h?falta:c.textContent),idx=sec.map(x=>L.indexOf(x));
    if(idx.some(i=>i<0)||idx.slice(1).some((x,i)=>x!==idx[i]+1))return 'no son letras seguidas del abecedario: '+sec.join('');
    if(n===1&&idx[idx.length-1]>9)return 'el nivel 1 es de la A a la J';if(n===3&&idx[0]<10)return 'el nivel 3 es de la K en adelante';
    if(q.alAcertar.join()!==sec.map(x=>'es_letra-'+(x==='Ñ'?'nn':x.toLowerCase())).join())return 'la voz no dice la fila completa';
    if(q.opciones.length!==(n===3?4:3))return q.opciones.length+' opciones';if(q.opciones.some(o=>o.aria!=='letra '+falta&&sec.includes(o.aria.replace('letra ',''))))return 'una incorrecta ya se ve en la fila'});
  for(let n=1;n<=4;n++)F('l_inicial',n,150,q=>{
    if(n===4){const m=/^Termina con (.): (.+)$/.exec(q.rotulo);if(!m)return 'rótulo raro';const fin=C.sinAcento(m[2]).slice(-1).toUpperCase();if(fin!==m[1]||ok(q).aria!=='letra '+fin)return 'la palabra termina con '+fin;
      if(q.decir[1]!==ES.termina)return 'no pregunta con qué termina';if(arias(q).some(a=>a!=='letra '+fin&&(C.SUENAN_IGUAL[fin]||'').includes(a.slice(-1))))return 'una opción suena igual a la correcta'}});
  for(let n=1;n<=3;n++)F('l_silabas',n,200,q=>{
    if(n<3)return null;const ws=q.opciones.map(o=>C.PALBY[o.aria]),mas=q.decir[0].includes('mas-silabas'),ls=ws.map(w=>w.sil.length),gana=mas?Math.max(...ls):Math.min(...ls);
    if(new Set(ls).size!==3)return 'dos con la misma cantidad de sílabas';if(ls[q.opciones.findIndex(o=>o.ok)]!==gana)return 'la correcta no es la que tiene '+(mas?'más':'menos');
    if(q.decir.slice(1).join()!==q.opciones.map(o=>o.decir[0]).join())return 'la voz no dice las palabras en el orden en que se ven'});
  F('l_rima',3,200,q=>{
    const ws=q.opciones.map(o=>o.aria),raro=ok(q).aria,resto=ws.filter(w=>w!==raro),g=C.RIMAS.find(g=>resto.every(w=>g.includes(w)));
    if(!g)return 'los otros tres no riman entre sí';if(g.includes(raro))return 'el que «no rima» sí rima';if(q.decir.slice(1).join()!==q.opciones.map(o=>o.decir[0]).join())return 'la voz no dice las palabras en el orden en que se ven';
    if(C.RIMAS.some(h=>h.includes(raro)&&h.some(w=>resto.includes(w))))return 'rima con alguno'});
  for(let n=1;n<=4;n++)F('l_leer',n,150,q=>{if(n<4)return null;
    const w=tts(q.decir[1]),ini=q.opciones.map(o=>o.aria[0]);if(ok(q).aria!==w)return 'la voz dice «'+w+'» y la correcta es '+ok(q).aria;if(new Set(ini).size!==1)return 'no todas empiezan igual';if(q.opciones.length!==4)return q.opciones.length+' opciones'});
  for(let n=1;n<=3;n++)F('l_igual',n,250,q=>{
    const w=C.PALBY[tts(q.decir[0])],par=C.PALBY[ok(q).aria];if(!w||!par)return 'palabra que no existe';if(w.ini!==par.ini)return 'la correcta no empieza igual';
    if([w,par].some(x=>x.h||x.ll||x.p==='girasol'))return 'palabra con sonido raro';
    for(const o of q.opciones){if(o.ok)continue;const y=C.PALBY[o.aria];if(y.ini===w.ini||(C.SUENAN_IGUAL[w.ini]||'').includes(y.ini))return '«'+y.p+'» empieza igual (o suena) que «'+w.p+'»';if(C.altInicial(y.p)===w.ini)return '«'+y.p+'» también se llama «'+C.ALT_NOMBRE[y.p]+'» y empieza igual que «'+w.p+'»'}
    if(q.opciones.length!==(n===3?4:3))return q.opciones.length+' opciones';if(n===1&&!'AEIOUMPSLT'.includes(w.ini))return 'el nivel 1 son letras fáciles'});
  for(let n=1;n<=3;n++)F('l_completar',n,250,q=>{
    const w=tts(q.decir[0]),letra=ok(q).aria.replace('letra ',''),txt=doc(doc(q.est).querySelector('.palabra').innerHTML.replace('<b class="falta"></b>','_')).textContent,pos=txt.indexOf('_');
    if(txt.replace('_',letra)!==w.toUpperCase())return 'con «'+letra+'» queda «'+txt.replace('_',letra)+'» y la palabra es «'+w+'»';
    if(/h|ll|rr|ch|qu|gu/.test(w)||!/^[a-z]+$/.test(w))return 'palabra con letras difíciles';
    if(n===1&&pos!==0)return 'el nivel 1 es la primera letra';if(n===2&&pos!==w.length-1)return 'el nivel 2 es la última';if(n===3&&!(pos>0&&pos<w.length-1))return 'el nivel 3 es una del medio';
    for(const o of q.opciones){const x=o.aria.replace('letra ','');if(x===letra)continue;if((C.SUENAN_IGUAL[letra]||'').includes(x)||(C.SUENAN_IGUAL[x]||'').includes(letra))return 'la opción '+x+' suena igual a '+letra;
      const forma=w.slice(0,pos)+x.toLowerCase()+w.slice(pos+1);if(FEAS.has(forma))return 'con la opción '+x+' se forma «'+forma+'»';if(pos===w.length-1&&((letra==='O'&&x==='A')||(letra==='A'&&x==='O')))return 'la opción '+x+' arma el otro género («'+forma+'»)'}});
  for(let n=1;n<=3;n++)F('l_armar',n,150,q=>{
    const w=tts(q.decir[1]);if(q.letras.join('')!==w.toUpperCase())return 'las letras no arman «'+w+'»';if(w.length!==n+2||!/^[a-z]+$/.test(w))return 'largo o letras raras';if(!doc(q.dibujo).textContent&&!q.dibujo)return 'sin dibujo';
    if(C.PALBY[w].e!==q.dibujo)return 'el dibujo no es de «'+w+'»';if(q.decir[0]!==ES.armar)return 'no dice «Armá la palabra»';
    if(/h|ll|rr|ch|qu|gu/.test(w))return '«'+w+'» se escribe distinto de como suena';if(!(q.ocultar||[]).includes(1))return 'el subtítulo imprime la palabra (la respuesta)'});
  const cat=p=>C.CATEGORIAS.filter(g=>g.pal.includes(p)).map(g=>g.id);
  const icono={};S5.juegos.forEach(g=>{(icono[g.area]=icono[g.area]||{});(icono[g.area][g.ico]=icono[g.area][g.ico]||[]).push(g.id)});
  const iconosRepetidos=[].concat(...Object.values(icono).map(m=>Object.values(m).filter(l=>l.length>1)));
  if(iconosRepetidos.length)mal['íconos']=['dos juegos de la misma área con el mismo dibujo: '+JSON.stringify(iconosRepetidos)];
  for(let n=1;n<=3;n++)F('l_categoria',n,250,q=>{
    const ws=q.opciones.map(o=>o.aria);
    if(n<=2){const g=C.CATEGORIAS.find(g=>g.k===q.decir[0]);if(!g)return 'no pide un grupo';if(!g.pal.includes(ok(q).aria))return '«'+ok(q).aria+'» no es de ese grupo';
      const dentro=ws.filter(w=>g.pal.includes(w)).length;if(dentro!==1)return dentro+' del grupo entre las opciones';if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones'}
    else{if(q.decir[0]!==ES.noVa)return 'no pregunta cuál no va';const raro=ok(q).aria,resto=ws.filter(w=>w!==raro),g=C.CATEGORIAS.find(g=>resto.every(w=>g.pal.includes(w)));
      if(!g)return 'los otros tres no son del mismo grupo';if(g.pal.includes(raro))return 'el que «no va» es del grupo'}});
  for(let n=1;n<=2;n++)F('l_contrario',n,250,q=>{
    const m=/^Lo contrario de (.+): (.+)$/.exec(q.rotulo);if(!m)return 'rótulo raro';const par=C.OPUESTOS.find(o=>(o.a===m[1]&&o.b===m[2])||(o.b===m[1]&&o.a===m[2]));if(!par)return 'no son contrarios';
    if(ok(q).aria!==m[2])return 'la correcta no es «'+m[2]+'»';if(q.decir[0]!==ES.contrarioDe||q.decir[1]!==C.opClip(m[1]))return 'la voz no dice «Lo contrario de '+m[1]+'»';
    for(const o of q.opciones){if(o.ok)continue;const pp=C.OPUESTOS.find(x=>x.a===o.aria||x.b===o.aria);if(!pp||pp.fam===par.fam)return '«'+o.aria+'» es de la misma familia de ideas'}
    const emoji=(w)=>{const x=C.OPUESTOS.find(y=>y.a===w||y.b===w);return x.a===w?x.ea:x.eb};if(!ok(q).h.includes(emoji(m[2])))return 'el dibujo de la correcta no es el de «'+m[2]+'»';
    if(n===1&&!q.est.includes(emoji(m[1])))return 'el nivel 1 muestra el dibujo de lo que se dice';if(n===2&&q.est)return 'el nivel 2 no muestra el dibujo';if(q.opciones.length!==(n===1?3:4))return q.opciones.length+' opciones'});
  for(let n=1;n<=4;n++)memoN('l_memo',n,60,q=>{
    for(const p of q.pares){
      if(n<=2){const A=doc(p.a).textContent,a=doc(p.b).textContent;if(A!==a.toUpperCase()||A===a)return 'no es mayúscula y minúscula: '+A+' '+a;if(n===1&&!'AEIOU'.includes(A))return 'el nivel 1 son vocales';if(n===2&&('ILÑ'.includes(A)))return 'letra que se confunde'}
      else{const L=doc(p.a).textContent,w=C.PALBY[tts(p.kb[0])];if(!w||w.ini!==L)return 'la letra '+L+' no es la inicial de «'+(w&&w.p)+'»';if(w.h||w.ll||w.p==='girasol'||L==='Q')return 'palabra con sonido raro'}}
    const ls=q.pares.map(p=>doc(p.a).textContent);if(n>=3)for(const a of ls)for(const z of ls)if(a<z&&((C.SUENAN_IGUAL[a]||'').includes(z)||(C.SUENAN_IGUAL[z]||'').includes(a)))return 'letras que suenan parecido: '+a+' '+z;
    if(n>=3){const ws=q.pares.map(p=>C.PALBY[tts(p.kb[0])]);for(const x of ws)for(const y of ws)if(x!==y&&C.altInicial(x.p)===y.ini)return 'el dibujo de «'+x.p+'» (también «'+C.ALT_NOMBRE[x.p]+'») podría ser de la letra '+y.ini}});
  return {preguntas:Object.values(cuenta).reduce((a,b)=>a+b,0),grupos:Object.keys(cuenta).length,mal};
});
const malos=Object.keys(r.mal);
chk('niveles altos y juegos nuevos: '+r.preguntas+' preguntas en '+r.grupos+' juego×nivel, TODAS ciertas (la cuenta da, el reloj marca la hora que se pide, el animal es un animal, la palabra que falta es la que falta, el que no rima no rima, las parejas son parejas…)',malos.length===0,j(Object.fromEntries(malos.slice(0,6).map(k=>[k,r.mal[k]]))));
chk('sin errores de página',p.errs.length===0,j(p.errs));
await b.close();if(srv)srv.close();
const mal=res.filter(x=>!x).length;
console.log(mal?'HAY FALLOS ('+mal+' de '+res.length+')':'TODO OK ('+res.length+' chequeos)');
process.exit(mal?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
