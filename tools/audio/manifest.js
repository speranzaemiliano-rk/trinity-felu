// Reescribe ../../audio/manifest.js con la lista de audios que hay en la carpeta (la página usa esa lista para saber qué frases tienen audio).
// Uso:  node manifest.js
const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'../../audio');
const claves=fs.readdirSync(dir).filter(f=>f.endsWith('.mp3')&&f!=='silencio.mp3').map(f=>f.slice(0,-4)).sort();
fs.writeFileSync(path.join(dir,'manifest.js'),'// Lista de audios guardados en este sitio (carpeta audio/). Se arma con la misma clave que _audioKey() de index.html.\nwindow.TRINITY_AUDIO='+JSON.stringify(claves)+';\n');
console.log('manifest.js:',claves.length,'audios');
