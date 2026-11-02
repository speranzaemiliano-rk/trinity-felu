// Raphina: la pantalla de estudio (todo se puede tocar para escuchar) y el repaso escrito de 30 preguntas.
const {chromium}=require('playwright');const path=require('path');
const URL=process.env.URL||'file://'+path.resolve(__dirname,'..','raphina','index.html');
(async()=>{const b=await chromium.launch();
const res=[];const chk=(n,v,x)=>{res.push(!!v);console.log(v?'✓':'✗',n,x||'')};
const ctx=await b.newContext({viewport:{width:430,height:900},serviceWorkers:'block'});const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
await p.addInitScript(()=>{window.__dichos=[]});
await p.goto(URL);await p.evaluate(()=>{window.say=async t=>{window.__dichos.push(String(t))}});

// ---- encabezado y estructura
chk('el encabezado dice Grade 4 y Raphina; el título de la pestaña también',await p.evaluate(()=>/Grade 4/.test(document.querySelector('header h1').textContent)&&/Raphina/.test(document.querySelector('header p').textContent)&&/Grade 4/.test(document.title)&&/Raphina/.test(document.title)));
chk('la página es de Raphina: ni «Felu» ni «Grade 3» en ninguna parte',await p.evaluate(()=>!/Felu|Grade 3/.test(document.body.innerText.replace(/Otros módulos:[^\n]*/,''))));
// (el título de cada tema es el primer texto del <summary>: antes va el dibujito de la categoría)
await p.evaluate(()=>{window.tituloDe=s=>{const n=[...s.childNodes].find(x=>x.nodeType===3&&x.textContent.trim());return n?n.textContent.trim():''}});
const est=await p.evaluate(()=>({det:document.querySelectorAll('#v-study > .stack > details').length,vocab:document.querySelectorAll('#vocab details').length,
  resumen:[...document.querySelectorAll('#v-study > .stack > details > summary')].map(window.tituloDe)}));
chk('el estudio tiene '+est.det+' temas de gramática y '+est.vocab+' de vocabulario',est.det>=12&&est.vocab===10);
chk('están los temas oficiales del grado: past simple, irregulares, going to, like + -ing, adverbios, comparativos, but, pronunciación del -ed, la hoja del tema',["Past simple","Irregular past verbs","Going to (plans)","Like + -ing","Adverbs of frequency and manner","Comparatives and superlatives","The link word but","Pronunciation of -ed","The topic phase","Questions to ask the examiner"].every(t=>est.resumen.includes(t)),JSON.stringify(est.resumen));
chk('los 6 temas de la conversación están en el vocabulario',await p.evaluate(()=>["Holidays","Shopping","School and work","Hobbies and sports","Food","Weekend and seasonal activities"].every(t=>[...document.querySelectorAll('#vocab > details > summary')].some(s=>window.tituloDe(s)===t))));
chk('cada tema lleva su dibujito y cada palabra el suyo',await p.evaluate(()=>document.querySelectorAll('#v-study summary .cat-ic').length>=15&&document.querySelectorAll('.chip .pic').length>=250));

// ---- todo lo de estudiar se escucha al tocarlo
const toca=async(sel,n=0)=>{await p.evaluate(()=>{window.__dichos.length=0});await p.locator(sel).nth(n).click();await p.waitForTimeout(150);return p.evaluate(()=>window.__dichos.slice())};
await p.evaluate(()=>document.querySelectorAll('#v-study details').forEach(d=>d.open=true));
let d=await toca('ul.ex li',0);chk('tocar un ejemplo lo lee en inglés sin la traducción («'+d[0]+'»)',d.length===1&&/^[A-Za-z]/.test(d[0])&&!/—/.test(d[0]));
d=await toca('#vocab .chip',3);chk('tocar una palabra del vocabulario la lee («'+d[0]+'»)',d.length===1&&/^[A-Za-z]/.test(d[0]));
d=await toca('#vocab .ejem',0);chk('tocar el ejemplo de un tema lo lee entero («'+d[0]+'»)',d.length===1&&d[0].length>20);
d=await p.evaluate(()=>{window.__dichos.length=0;const td=[...document.querySelectorAll('#v-study table td.say-td')];return td.length});
chk('las celdas en inglés de las tablas son tocables ('+d+') y las de «Español» no',d>150&&await p.evaluate(()=>![...document.querySelectorAll('#v-study table')].some(t=>{const hs=[...t.querySelectorAll('tr:first-child th')].map(h=>h.textContent.trim());return [...t.querySelectorAll('tr')].slice(1).some(tr=>[...tr.children].some((td,ci)=>/^español$/i.test(hs[ci]||'')&&td.classList.contains('say-td')))})));
chk('el verbo irregular «went» se escucha al tocarlo',await (async()=>{await p.evaluate(()=>{window.__dichos.length=0});await p.locator('#v-study table td.say-td',{hasText:/^went$/}).first().click();await p.waitForTimeout(150);return (await p.evaluate(()=>window.__dichos))[0]==="went"})());

// ---- el repaso escrito
await p.click('#t-exam');await p.click('#start');
const e1=await p.evaluate(()=>({n:qs.length,temas:new Set(qs.map(q=>q.t)).size,total:new Set(bank.map(x=>x[0])).size,tag:document.querySelector('#exam .tag').textContent}));
chk('empieza con 30 preguntas de '+e1.temas+' temas distintos (de '+e1.total+') y dice «Pregunta 1 de 30»',e1.n===30&&e1.temas===e1.total&&/Pregunta 1 de 30/.test(e1.tag));
await p.click('#qsay');await p.waitForTimeout(150);
chk('«Escuchar la pregunta» la lee con «blank» en lugar de los guiones',await p.evaluate(()=>{const t=window.__dichos[window.__dichos.length-1];return !/_/.test(t)&&t.length>5}));
// una mal y el resto bien
await p.evaluate(()=>{const q=qs[0];const k=[0,1,2].find(x=>x!==q.a);document.querySelector('.opt[data-k="'+k+'"]').click()});
chk('contestar mal muestra «La correcta es: …»',await p.evaluate(()=>/La correcta es: /.test(document.getElementById('fb').textContent)));
for(let i=0;i<30;i++){
  if(i>0)await p.evaluate(()=>document.querySelector('.opt[data-k="'+qs[i].a+'"]').click());
  await p.evaluate(()=>document.getElementById('next').click());
}
const r=await p.evaluate(()=>({score:document.querySelector('.score').textContent,txt:document.getElementById('exam').innerText}));
chk('al final muestra 29 / 30, los temas para repasar y el error cometido',/29 \/ 30/.test(r.score)&&/Temas para repasar/.test(r.txt)&&/Tus errores/.test(r.txt));
chk('«Hacer otro examen» arranca de nuevo con preguntas distintas',await p.evaluate(()=>{const a=qs.map(q=>q.q).join('|');document.getElementById('again').click();return qs.length===30&&a!==qs.map(q=>q.q).join('|')}));
chk('sin errores de página',p.errs.length===0,JSON.stringify(p.errs));
await b.close();
console.log(res.every(Boolean)?'\nTODO OK ('+res.length+' chequeos)':'\nHAY FALLOS: '+res.filter(x=>!x).length);
process.exit(res.every(Boolean)?0:1)})().catch(e=>{console.log('FALLO',e.stack||e.message);process.exit(1)})
