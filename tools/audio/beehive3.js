// «Beehive 3 · Prueba»: arma la lista de TODAS las frases con voz (beehive3_texts.json), reescribe beehive3/audio/manifest.js con los mp3 que hay y dice cuántos faltan.
// Uso (desde esta carpeta):  node beehive3.js      (después:  python3 bajar_beehive3.py  y otra vez  node beehive3.js  hasta que diga «faltan: 0»)
// No hace falta navegador: carga beehive3/contenido.js tal cual, así la lista sigue sola a los cambios del contenido.
const fs=require('fs'),path=require('path');
const RAIZ=path.resolve(__dirname,'../..'),AUDIO=path.join(RAIZ,'beehive3/audio');
global.window={};require(path.join(RAIZ,'beehive3/contenido.js'));
const frases=window.B3.frases();
fs.writeFileSync(path.join(__dirname,'beehive3_texts.json'),JSON.stringify(frases));
fs.mkdirSync(AUDIO,{recursive:true});
const hay=new Set(fs.readdirSync(AUDIO).filter(f=>f.endsWith('.mp3')).map(f=>f.slice(0,-4)));
const claves=[...hay].sort();
// versión de los audios: un resumen de lo que hay adentro de todos los mp3 (la página la pone en la dirección de cada mp3, ?a=…: si un audio cambia, el navegador lo baja de nuevo)
const resumen=require('crypto').createHash('md5');claves.forEach(k=>{resumen.update(k);resumen.update(fs.readFileSync(path.join(AUDIO,k+'.mp3')))});
const versionAudio=resumen.digest('hex').slice(0,8);
fs.writeFileSync(path.join(AUDIO,'manifest.js'),'// Lista de audios guardados en beehive3/audio/ (la página usa esta lista para saber qué frases tienen voz grabada) y su versión. Se arma con: node tools/audio/beehive3.js\nwindow.B3_AUDIO='+JSON.stringify(claves)+';\nwindow.B3_AUDIO_V="'+versionAudio+'";\n');
const faltan=frases.filter(x=>!hay.has(x.k)),sobran=claves.filter(k=>!frases.some(x=>x.k===k));
console.log('frases con voz:',frases.length,'| con audio:',frases.length-faltan.length,'| faltan:',faltan.length,'| mp3 que ya no se usan:',sobran.length);
if(faltan.length&&faltan.length<=8)faltan.forEach(x=>console.log('  falta:',x.k,'«'+x.tts+'»'));
if(sobran.length){
  if(process.argv.includes('--borrar')){sobran.forEach(k=>fs.unlinkSync(path.join(AUDIO,k+'.mp3')));console.log('borrados:',sobran.length,'mp3 que ya no se usaban')}
  else console.log('  sobran (con --borrar se borran):',sobran.join(' '));
}
