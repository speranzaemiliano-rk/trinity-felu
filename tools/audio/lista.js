// Arma la lista de TODAS las frases que la página puede decir con un audio grabado (texts.json).
// Uso (desde esta carpeta):  node lista.js        — hace falta Playwright (npm i playwright)
// Mira la página real, así que sigue solo a los cambios del banco de preguntas: no hay otra lista que mantener.
const {chromium}=require('playwright');
const path=require('path');
const fs=require('fs');
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:900,height:900}});
  // sin IA ni red: sólo interesa el contenido de la página
  await p.route('**/firebase-config.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:'window.TRINITY_FB={config:{},models:[]};'}));
  await p.goto('file://'+path.resolve(__dirname,'../../index.html'));
  const r=await p.evaluate(()=>{
    const out=new Map();
    const add=(t,fuente)=>{t=String(t||'').replace(/\s+/g,' ').trim();if(t&&/[a-z]/i.test(t)&&t.length<=190&&!out.has(t.toLowerCase()))out.set(t.toLowerCase(),{t,fuente})};
    // 1) todo lo que se toca para estudiar (misma regla que el sitio)
    document.querySelectorAll('[data-say], ul.ex li').forEach(el=>{const r=_sonidoDe(el);if(r)add(r.txt,'estudiar')});
    // 2) preguntas del examen escrito
    bank.forEach(x=>add(String(x[1]).replace(/_{2,}/g,' blank ').replace(/\([^)]*\)/g,'').replace(/\s+/g,' ').trim(),'examen escrito'));
    // 3) el examinador de siempre (banco de preguntas, repreguntas, reacciones, dibujos, saludos, despedidas, ayudas)
    window.rkTextosGuion().forEach(t=>add(t,'examinador'));
    // 4) frases fijas del diagnóstico y de la revisión de sonido
    ['Monday','Tuesday','Wednesday','Thursday','Friday','Hello, can you hear me?'].forEach(t=>add(t,'sonido'));
    return [...out.values()].map(x=>({...x,k:_audioKey(x.t)}));
  });
  fs.writeFileSync(path.join(__dirname,'texts.json'),JSON.stringify(r));
  const porFuente={};r.forEach(x=>porFuente[x.fuente]=(porFuente[x.fuente]||0)+1);
  const hay=new Set(fs.readdirSync(path.resolve(__dirname,'../../audio')).filter(f=>f.endsWith('.mp3')).map(f=>f.slice(0,-4)));
  console.log('frases únicas:',r.length,JSON.stringify(porFuente),'| ya tienen audio:',r.filter(x=>hay.has(x.k)).length,'| faltan:',r.filter(x=>!hay.has(x.k)).length);
  await b.close();
})().catch(e=>{console.log('FALLO',e.message);process.exit(1)});
