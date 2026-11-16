// Arma integradora/mapa.js (el mapa de la Argentina que usa el módulo «Prueba final integradora») a partir de los datos públicos de Natural Earth
// (https://www.naturalearthdata.com, dominio público): el archivo «ne_10m_admin_1_states_provinces.geojson» (las provincias) y, de ahí mismo, las Islas Malvinas.
// Uso:  node tools/mapa_integradora.js ruta/a/ne_10m_admin_1_states_provinces.geojson [ruta/a/ne_10m_admin_0_countries.geojson]
// Con el segundo archivo (los países, también de Natural Earth) arma además integradora/mapa-limitrofes.js: Chile, Bolivia, Paraguay, Brasil y Uruguay en el MISMO sistema de coordenadas que las provincias (así el contorno de la Argentina se reutiliza tal cual).
// Qué hace: se queda con las 23 provincias y la Ciudad de Buenos Aires, las proyecta (cónica equivalente de Albers, centrada en la Argentina), simplifica los bordes
// (Douglas–Peucker) y las escribe como trazados SVG listos para pintar, junto con un punto para ubicar cada una (el lugar más «adentro» de la provincia).
// Las Islas Malvinas se dibujan como parte de «Tierra del Fuego, Antártida e Islas del Atlántico Sur» (así figuran en los mapas oficiales de la escuela argentina).
const fs=require('fs'),path=require('path');
const origen=process.argv[2];
if(!origen){console.log('Uso: node tools/mapa_integradora.js ruta/a/ne_10m_admin_1_states_provinces.geojson');process.exit(1)}
const g=JSON.parse(fs.readFileSync(origen,'utf8'));
const ID={"Buenos Aires":"buenosaires","Ciudad de Buenos Aires":"caba","Catamarca":"catamarca","Chaco":"chaco","Chubut":"chubut","Córdoba":"cordoba","Corrientes":"corrientes","Entre Ríos":"entrerios","Formosa":"formosa","Jujuy":"jujuy","La Pampa":"lapampa","La Rioja":"larioja","Mendoza":"mendoza","Misiones":"misiones","Neuquén":"neuquen","Río Negro":"rionegro","Salta":"salta","San Juan":"sanjuan","San Luis":"sanluis","Santa Cruz":"santacruz","Santa Fe":"santafe","Santiago del Estero":"santiago","Tierra del Fuego":"tierradelfuego","Tucumán":"tucuman"};
const piezas={};   // id → lista de anillos [[lon,lat],…] (cada polígono: [exterior, huecos…])
const sumar=(id,geom)=>{const polis=geom.type==='Polygon'?[geom.coordinates]:geom.coordinates;(piezas[id]=piezas[id]||[]).push(...polis)};
g.features.forEach(f=>{const p=f.properties;
  if(p.adm0_a3==='ARG'&&ID[p.name])sumar(ID[p.name],f.geometry);
  else if(p.adm0_a3==='FLK')sumar('tierradelfuego',f.geometry)});
const faltan=Object.values(ID).filter(i=>!piezas[i]);
if(faltan.length){console.log('FALTAN en el archivo:',faltan);process.exit(1)}

// proyección cónica equivalente de Albers (paralelos -30 y -50, centro -40 / -64)
const rad=Math.PI/180,p1=-30*rad,p2=-50*rad,p0=-40*rad,l0=-64*rad;
const n=(Math.sin(p1)+Math.sin(p2))/2,C=Math.cos(p1)**2+2*n*Math.sin(p1),rho0=Math.sqrt(C-2*n*Math.sin(p0))/n;
const proy=(lon,lat)=>{const rho=Math.sqrt(C-2*n*Math.sin(lat*rad))/n,th=n*(lon*rad-l0);return [rho*Math.sin(th),-(rho0-rho*Math.cos(th))]};   // x hacia el este, y hacia el sur (como en pantalla)
// límites del país para fijar la escala
let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
Object.values(piezas).forEach(ps=>ps.forEach(r=>r[0].forEach(([lo,la])=>{const [x,y]=proy(lo,la);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)})));
const ALTO=720,esc=ALTO/(y1-y0),PAD=14,W=Math.round((x1-x0)*esc+PAD*2),H=ALTO+PAD*2;
const pt=([lo,la])=>{const [x,y]=proy(lo,la);return [(x-x0)*esc+PAD,(y-y0)*esc+PAD]};   // en unidades del dibujo (el alto del país mide 720)

// Douglas–Peucker (tolerancia en unidades del dibujo)
function dp(pts,tol){
  if(pts.length<=2)return pts;
  const mantener=new Uint8Array(pts.length);mantener[0]=mantener[pts.length-1]=1;const pila=[[0,pts.length-1]];
  while(pila.length){const [a,b]=pila.pop();let max=0,im=-1;const [ax,ay]=pts[a],[bx,by]=pts[b],dx=bx-ax,dy=by-ay,l=Math.hypot(dx,dy)||1e-9;
    for(let i=a+1;i<b;i++){const d=Math.abs((pts[i][0]-ax)*dy-(pts[i][1]-ay)*dx)/l;if(d>max){max=d;im=i}}
    if(max>tol){mantener[im]=1;pila.push([a,im],[im,b])}}
  return pts.filter((_,i)=>mantener[i]);
}
const TOL=0.35;
const anillo=r=>{let p=r.map(pt);if(p.length>1&&p[0][0]===p[p.length-1][0]&&p[0][1]===p[p.length-1][1])p=p.slice(0,-1);p=dp(p,TOL);return p};
const area=p=>{let a=0;for(let i=0;i<p.length;i++){const [x,y]=p[i],[u,v]=p[(i+1)%p.length];a+=x*v-u*y}return a/2};
const trazo=p=>'M'+p.map(([x,y])=>(Math.round(x*10)/10)+' '+(Math.round(y*10)/10)).join('L')+'Z';
// el punto más «adentro» de un polígono (polylabel simple por cuadrícula refinada)
function adentro(ext,huecos){
  const dentro=(x,y,r)=>{let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const [xi,yi]=r[i],[xj,yj]=r[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)c=!c}return c};
  const distSeg=(x,y,a,b)=>{let dx=b[0]-a[0],dy=b[1]-a[1],t=dx||dy?((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy):0;t=Math.max(0,Math.min(1,t));return Math.hypot(x-(a[0]+t*dx),y-(a[1]+t*dy))};
  const borde=(x,y)=>{let m=1e9;[ext,...huecos].forEach(r=>{for(let i=0;i<r.length;i++)m=Math.min(m,distSeg(x,y,r[i],r[(i+1)%r.length]))});return m};
  const val=(x,y)=>{const ins=dentro(x,y,ext)&&!huecos.some(h=>dentro(x,y,h));return (ins?1:-1)*borde(x,y)};
  let xs=ext.map(p=>p[0]),ys=ext.map(p=>p[1]),mx=Math.min(...xs),Mx=Math.max(...xs),my=Math.min(...ys),My=Math.max(...ys),paso=Math.max(Mx-mx,My-my)/12,mejor=[(mx+Mx)/2,(my+My)/2,-1e9];
  for(let it=0;it<5;it++){for(let x=mx;x<=Mx;x+=paso)for(let y=my;y<=My;y+=paso){const v=val(x,y);if(v>mejor[2])mejor=[x,y,v]}
    mx=mejor[0]-paso;Mx=mejor[0]+paso;my=mejor[1]-paso;My=mejor[1]+paso;paso/=4}
  return mejor;
}
const out={};let total=0;
Object.keys(piezas).sort().forEach(id=>{
  const polis=piezas[id].map(pl=>pl.map(anillo)).filter(pl=>pl[0].length>=3&&Math.abs(area(pl[0]))>(id==='caba'?0:0.35));   // se descartan islitas de menos de ~0,35 unidades cuadradas (excepto la Ciudad de Buenos Aires, que es chica a propósito)
  const principal=polis.slice().sort((a,b)=>Math.abs(area(b[0]))-Math.abs(area(a[0])))[0];
  const d=polis.map(pl=>pl.map(trazo).join('')).join('');
  const [cx,cy]=adentro(principal[0],principal.slice(1));
  out[id]={d,cx:Math.round(cx*10)/10,cy:Math.round(cy*10)/10};total+=d.length;
});
const cab=out.caba;
const salida='// El mapa de la Argentina (23 provincias y la Ciudad de Buenos Aires) como trazados SVG. NO se edita a mano: lo arma tools/mapa_integradora.js con datos públicos de Natural Earth (dominio público).\n'+
 '// «cx / cy» es un punto bien adentro de cada provincia (para ubicar una marca o una flecha). Las Islas Malvinas forman parte de «tierradelfuego», como en los mapas oficiales.\n'+
 'window.MAPA='+JSON.stringify({w:W,h:H,prov:out})+';\n';
const destino=path.join(__dirname,'..','integradora','mapa.js');
fs.mkdirSync(path.dirname(destino),{recursive:true});fs.writeFileSync(destino,salida);
console.log('mapa.js: '+Math.round(salida.length/1024)+' KB | dibujo '+W+'×'+H+' | trazados '+Math.round(total/1024)+' KB | CABA en',cab.cx,cab.cy);

// ---- los países limítrofes (sólo si se pasó el segundo archivo)
if(process.argv[3]){
  const gp=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  const A3={CHL:'chile',BOL:'bolivia',PRY:'paraguay',BRA:'brasil',URY:'uruguay'};
  const polisPais={};
  gp.features.forEach(f=>{const a3=f.properties.ADM0_A3||f.properties.adm0_a3;if(!A3[a3])return;const g=f.geometry;(polisPais[A3[a3]]=polisPais[A3[a3]]||[]).push(...(g.type==='Polygon'?[g.coordinates]:g.coordinates))});
  const faltanP=Object.values(A3).filter(i=>!polisPais[i]);
  if(faltanP.length){console.log('FALTAN países en el archivo:',faltanP);process.exit(1)}
  // la ventana que se ve: la Argentina entera y lo que la rodea (Bolivia entera; Brasil y Chile, hasta donde alcanza el dibujo). En unidades del dibujo (el mismo sistema que las provincias)
  const V={x0:-36,y0:-246,x1:446,y1:766};
  // recorte de un anillo contra el rectángulo de la ventana (Sutherland–Hodgman, un borde por vez)
  const bordes=[
    [p=>p[0]>=V.x0,(a,b)=>{const t=(V.x0-a[0])/(b[0]-a[0]);return [V.x0,a[1]+t*(b[1]-a[1])]}],
    [p=>p[0]<=V.x1,(a,b)=>{const t=(V.x1-a[0])/(b[0]-a[0]);return [V.x1,a[1]+t*(b[1]-a[1])]}],
    [p=>p[1]>=V.y0,(a,b)=>{const t=(V.y0-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),V.y0]}],
    [p=>p[1]<=V.y1,(a,b)=>{const t=(V.y1-a[1])/(b[1]-a[1]);return [a[0]+t*(b[0]-a[0]),V.y1]}]];
  const recortar=pts=>{let r=pts;for(const [dentro,inter] of bordes){const o=[];for(let i=0;i<r.length;i++){const a=r[i],b=r[(i+1)%r.length],da=dentro(a),db=dentro(b);if(da&&db)o.push(b);else if(da&&!db)o.push(inter(a,b));else if(!da&&db){o.push(inter(a,b));o.push(b)}}r=o;if(!r.length)break}return r};
  const ETQ_P={};   // si hiciera falta mover el nombre de algún país: {id:[x,y]} (sale como lx / ly)
  const TOL_P=1.0,MIN_P=5;   // los vecinos son contexto: se simplifican más que las provincias (los fiordos de Chile pesaban 40 KB) y se descartan las islas de menos de ~130 km²
  const anilloP=r=>{let p=r.map(pt);if(p.length>1&&p[0][0]===p[p.length-1][0]&&p[0][1]===p[p.length-1][1])p=p.slice(0,-1);p=recortar(p);return p.length>=3?dp(p,TOL_P):[]};
  const salidaP={};let totalP=0;
  Object.keys(polisPais).sort().forEach(id=>{
    const polis=polisPais[id].map(pl=>pl.map(anilloP)).filter(pl=>pl[0].length>=3&&Math.abs(area(pl[0]))>MIN_P).map(pl=>pl.filter((r,k)=>k===0||(r.length>=3&&Math.abs(area(r))>MIN_P)));
    const principal=polis.slice().sort((a,b)=>Math.abs(area(b[0]))-Math.abs(area(a[0])))[0];
    const d=polis.map(pl=>pl.map(trazo).join('')).join('');
    const [cx,cy]=adentro(principal[0],principal.slice(1));
    salidaP[id]={d,cx:Math.round(cx*10)/10,cy:Math.round(cy*10)/10};totalP+=d.length;
    if(ETQ_P[id]){salidaP[id].lx=ETQ_P[id][0];salidaP[id].ly=ETQ_P[id][1]}
  });
  const txt='// Los países limítrofes de la Argentina (Chile, Bolivia, Paraguay, Brasil y Uruguay) como trazados SVG, en el MISMO sistema de coordenadas que mapa.js (el contorno de la Argentina sale de ahí). NO se edita a mano: lo arma tools/mapa_integradora.js con datos públicos de Natural Earth (dominio público).\n'+
   '// «vb» es la ventana que se ve (x, y, ancho, alto); lo que sobra de Brasil, Bolivia y Chile se recortó en el borde. «cx / cy» es un punto bien adentro de lo que se ve de cada país.\n'+
   'window.MAPA_LIM='+JSON.stringify({vb:[V.x0,V.y0,V.x1-V.x0,V.y1-V.y0],pais:salidaP})+';\n';
  const dest2=path.join(__dirname,'..','integradora','mapa-limitrofes.js');
  fs.writeFileSync(dest2,txt);
  console.log('mapa-limitrofes.js: '+Math.round(txt.length/1024)+' KB | ventana',V.x1-V.x0,'×',V.y1-V.y0,'| puntos interiores',JSON.stringify(Object.fromEntries(Object.entries(salidaP).map(([k,v])=>[k,[v.cx,v.cy]]))));
}
