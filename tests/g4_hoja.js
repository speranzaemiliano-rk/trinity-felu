// Raphina: la hoja del tema (título + 4 puntos con su función), las ideas de temas, los avisos, imprimir la hoja y cómo se elige qué practicar.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
await p.goto(URL);await p.click('#t-speak');
const aviso=()=>p.textContent('#temaAviso');

chk('cada punto tiene un selector con las 6 funciones y por defecto: pasado, gustos, comparar, planes',await p.evaluate(()=>[1,2,3,4].every(i=>document.querySelectorAll('#temaT'+i+' option').length===6)&&[1,2,3,4].map(i=>document.getElementById('temaT'+i).value).join()==="pasado,gustos,comparar,futuro"));
chk('cada punto muestra la ayuda de su función («Usá el pasado…»)',await p.evaluate(()=>/pasado/.test(document.getElementById('temaA1').textContent)&&/going to/.test(document.getElementById('temaA4').textContent)));
chk('con la hoja vacía el aviso pide el título y dice que se usa un tema de ejemplo',/título/.test(await aviso())&&/ejemplo/.test(await aviso()));

// un tema prohibido
await p.fill('#temaTitulo','Holidays');
chk('«Holidays» como título avisa que es uno de los temas de la conversación',/uno de los temas de la <b>conversación|uno de los temas de la conversación/.test(await p.innerHTML('#temaAviso')));
await p.fill('#temaTitulo','My trip to Bariloche');
chk('«My trip to Bariloche» no da ese aviso',!/uno de los temas de la/.test(await aviso()));

// ideas
await p.click('#temaIdeasBtn');
chk('«Ideas de temas» abre una lista de 12 temas con los íconos de sus funciones',await p.evaluate(()=>!document.getElementById('temaIdeas').hidden&&document.querySelectorAll('#temaIdeas [data-idea]').length===12));
await p.click('#temaIdeas [data-idea="0"]');
const f1=await p.evaluate(()=>({t:document.getElementById('temaTitulo').value,p:[1,2,3,4].map(i=>document.getElementById('temaP'+i).value),s:[1,2,3,4].map(i=>document.getElementById('temaT'+i).value),g:temaLeer()}));
chk('elegir una idea completa el título y los 4 puntos con sus funciones y los guarda ('+f1.t+')',f1.t==="My best birthday"&&f1.p.every(x=>x.length>3)&&f1.s.join()==="pasado,gustos,comparar,futuro"&&temaOk(f1.g));
function temaOk(g){return g&&g.t==="My best birthday"&&g.p.length===4}
chk('con la hoja completa el aviso dice que está lista',/La hoja está lista/.test(await aviso()));
chk('todas las ideas están completas, usan 3 o más funciones y ninguna es uno de los 6 temas de la conversación',await p.evaluate(()=>IDEAS4.every(i=>temaCompleto({t:i.t,p:i.p})&&new Set(i.p.map(x=>x[1])).size>=3&&!TEMAS_PROHIBIDOS.test(i.t)&&i.p.every(x=>TIPOS[x[1]]))));

// persiste
await p.reload();await p.click('#t-speak');
chk('al recargar la hoja sigue ahí',await p.evaluate(()=>document.getElementById('temaTitulo').value==="My best birthday"&&document.getElementById('temaP4').value.length>3&&document.getElementById('temaT4').value==="futuro"));

// cambiar la función de un punto
await p.selectOption('#temaT3','frecuencia');
chk('cambiar la función de un punto cambia su ayuda y se guarda',await p.evaluate(()=>/adverbios/.test(document.getElementById('temaA3').innerHTML)&&temaLeer().p[2][1]==="frecuencia"));
// todas iguales
for(let i=1;i<=4;i++)await p.selectOption('#temaT'+i,'gustos');
chk('si los 4 puntos son de la misma función, el aviso sugiere 3 o 4 funciones distintas',/3 o 4 funciones distintas/.test(await p.innerHTML('#temaAviso')));
await p.selectOption('#temaT1','pasado');await p.selectOption('#temaT2','futuro');await p.selectOption('#temaT3','comparar');
// imprimir
const [hoja]=await Promise.all([ctx.waitForEvent('page'),p.click('#temaImprimir')]);
await hoja.waitForLoadState();
const html=await hoja.content();
chk('«Imprimir la hoja» abre la hoja con el título, los 4 puntos con su función y el nombre',/Topic Form — Grade 4/.test(html)&&/My best birthday/.test(html)&&(html.match(/class="c"/g)||[]).length===4&&/Name: Raphina/.test(html)&&/Plans for my next birthday/.test(html));
await hoja.close();
// hoja incompleta: no se imprime
await p.fill('#temaP2','');
let abrio=false;ctx.once('page',()=>{abrio=true});await p.click('#temaImprimir');await p.waitForTimeout(500);
chk('con la hoja incompleta no se abre nada y se avisa',!abrio&&await p.evaluate(()=>/Completá el título y los 4 puntos/.test(document.getElementById('toast').textContent)));

// borrar
p.once('dialog',d=>d.accept());await p.click('#temaBorrar');
chk('«Borrar» (con confirmación) vacía la hoja',await p.evaluate(()=>document.getElementById('temaTitulo').value===""&&[1,2,3,4].every(i=>document.getElementById('temaP'+i).value==="")));

// cómo se practica
await p.selectOption('#g4modo','tema');
chk('«Sólo mi tema» esconde el selector de conversación y se recuerda al recargar',await p.evaluate(()=>document.getElementById('g4area').closest('label').hidden));
await p.reload();await p.click('#t-speak');
chk('… y al recargar sigue en «Sólo mi tema»',await p.evaluate(()=>document.getElementById('g4modo').value==="tema"&&document.getElementById('g4area').closest('label').hidden));
await p.selectOption('#g4modo','conv');await p.selectOption('#g4area','shopping');await p.reload();
chk('el tema de conversación elegido (Shopping) también se recuerda',await p.evaluate(()=>document.getElementById('g4modo').value==="conv"&&document.getElementById('g4area').value==="shopping"));
chk('el selector de conversación ofrece «Dos temas al azar» y los 6 temas',await p.evaluate(()=>[...document.querySelectorAll('#g4area option')].map(o=>o.textContent).join('|').includes('Dos temas al azar')&&document.querySelectorAll('#g4area option').length===7));
chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
