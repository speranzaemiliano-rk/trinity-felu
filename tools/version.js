// Pone una versión nueva en TODO el sitio de una vez (hay que correrlo en cada publicación):
//   node tools/version.js "2026-11-03 · módulos 2"
// · motor.js: const BUILD (es lo que muestra la pastilla de abajo y lo que compara el aviso de «versión nueva»);
// · cada página (index.html y las de cada módulo, p. ej. raphina/index.html): el ?b=… de los scripts y estilos (sin eso el navegador puede mezclar una página nueva con un motor viejo del caché);
// · sw.js: sube el número del caché.
const fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'..');
const build=process.argv[2];
if(!build){console.log('Uso: node tools/version.js "2026-11-03 · módulos 2"');process.exit(1)}
const token=build.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let n=0;
// motor.js
const mp=path.join(RAIZ,'motor.js');let m=fs.readFileSync(mp,'utf8');
if(!/const BUILD="[^"]*"/.test(m)){console.log('motor.js no tiene const BUILD');process.exit(1)}
m=m.replace(/const BUILD="[^"]*"/,'const BUILD="'+build+'"');fs.writeFileSync(mp,m);n++;
// páginas
const paginas=['index.html'].concat(fs.readdirSync(RAIZ).filter(d=>!/^(\.|node_modules|tools|tests|audio|ia-worker)/.test(d)&&fs.existsSync(path.join(RAIZ,d,'index.html'))).map(d=>d+'/index.html'));
paginas.forEach(f=>{const p=path.join(RAIZ,f);let h=fs.readFileSync(p,'utf8');
  const nuevo=h.replace(/((?:src|href)="[^"]*\.(?:js|css))\?b=[^"]*"/g,'$1?b='+token+'"');
  if(nuevo!==h){fs.writeFileSync(p,nuevo);n++}console.log((nuevo!==h?'actualizada ':'sin ?b= ')+f)});
// sw.js
const sp=path.join(RAIZ,'sw.js');let s=fs.readFileSync(sp,'utf8');
s=s.replace(/trinity-felu-v(\d+)/,(x,k)=>'trinity-felu-v'+(+k+1));fs.writeFileSync(sp,s);
console.log('versión:',build,'| token:',token,'| '+s.match(/trinity-felu-v\d+/)[0]);
