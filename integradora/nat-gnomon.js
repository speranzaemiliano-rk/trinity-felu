// Naturales · tema 3: «Observación y registro: el gnomon» (página 127 del libro). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada sombra del dibujo al tocarla en la pantalla de estudio (la hora es la de un día de ejemplo: el mediodía solar cae cerca de las 13 h)
INT.IDEAS.info.gnomon={
  s9:{t:"9:00 · sombra de la mañana (día de ejemplo)",d:"Apunta hacia el sector oeste y es larga. A medida que avanza la mañana se va acortando."},
  s11:{t:"11:00 · sombra de la mañana (día de ejemplo)",d:"Sigue apuntando hacia el sector oeste y ya es más corta: el Sol se está elevando."},
  s13:{t:"13:00 · mediodía solar (día de ejemplo)",d:"Es la sombra más corta del día y apunta hacia el sur. Así se reconoce el norte (del lado opuesto) y los demás puntos cardinales."},
  s15:{t:"15:00 · sombra de la tarde (día de ejemplo)",d:"Ya apunta hacia el sector este y se está alargando: el Sol va bajando."},
  s17:{t:"17:00 · sombra de la tarde (día de ejemplo)",d:"Apunta hacia el sector este y es larga. A medida que avanza la tarde se va alargando más."}
};
INT.temaIdeas({
 id:"gnomon",nombre:"Observación y registro: el gnomon",ico:"📏",paginas:"página 127",
 es:"Cómo descubrir el mediodía solar y los puntos cardinales observando y registrando las sombras de una varilla",
 grupos:[{id:"a",titulo:"El gnomon"},{id:"b",titulo:"Registrar las sombras"},{id:"c",titulo:"Qué se descubre"},{id:"d",titulo:"Observar y registrar"}],
 conceptos:[
  K("gnomon","a","📏","El gnomon","El gnomon es un instrumento simple: una varilla vertical que tiene que quedar fija. Con la sombra que proyecta el Sol sobre ella podés saber dónde está el Sol y orientarte.",{
   mc:[["¿Qué es un gnomon?","Una varilla vertical y fija que proyecta sombra",["Un tipo de brújula","Un reloj que suena","Una lupa para mirar el Sol"]],
       ["¿Para qué sirve observar la sombra de un gnomon?","Para saber dónde está el Sol y orientarse",["Para saber cuántos días tiene el año","Para medir la temperatura","Para ver las estrellas"]]],
   vf:[["El gnomon es una varilla vertical que debe quedar fija.",true,"Si se mueve, las sombras que se registran no sirven."],
       ["El gnomon se mueve de lugar durante el día para seguir al Sol.",false,"Tiene que quedar fijo."]],
   tipear:[["El instrumento formado por una varilla vertical y fija se llama…",["gnomon","el gnomon"],"Empieza con g"]]}),
  K("gnomon_lugar","a","📍","Dónde se instala","El gnomon se instala un día soleado, en un lugar descubierto y lo más alejado posible de paredes y de otros objetos grandes que puedan hacer sombra e interferir con la sombra de la varilla.",{
   mc:[["¿Cómo tiene que ser el día para instalar el gnomon?","Soleado",["Nublado","Lluvioso","De noche"]],
       ["¿Dónde conviene instalar el gnomon?","En un lugar descubierto, lejos de paredes y de objetos grandes",["Contra una pared alta","Debajo de un árbol","Dentro de una habitación"]]],
   vf:[["El gnomon se puede instalar pegado a una pared.",false,"Conviene alejarlo de paredes y de objetos grandes que hagan sombra."]]}),
  K("registrar_sombras","b","✏️","Cómo se registran las sombras","Para registrar una sombra se puede dibujar su contorno sobre un papel o hacer una marca en el piso en el extremo de la sombra. Junto a cada sombra hay que anotar la hora.",{
   mc:[["¿Cómo se puede registrar una sombra?","Dibujando su contorno en un papel o marcando en el piso su extremo",["Sin dibujar ni marcar nada, sólo recordándola","Esperando a que desaparezca","Midiéndola con una brújula"]],
       ["Junto a cada sombra registrada hay que anotar…","La hora",["El color del piso","La temperatura del piso","El nombre del Sol"]]],
   vf:[["Al registrar una sombra conviene anotar la hora junto a ella.",true,"Así se sabe cuándo se formó cada sombra."]],
   tipear:[["Junto a cada sombra que registrás tenés que anotar la… (una palabra).",["hora","la hora"],"Es lo que marca el reloj"]],
   ordenar:[["Ordená los pasos para usar el gnomon.",["Elegir un día soleado y un lugar descubierto","Instalar la varilla vertical y dejarla fija","Marcar el extremo de la sombra y anotar la hora (por la mañana)","Repetir el registro cerca del mediodía","Repetir el registro por la tarde","Buscar la sombra más corta: es la del mediodía solar"]]]}),
  K("cuando_registrar","b","⏰","Cuándo registrar","Conviene registrar la sombra en tres momentos del día: por la mañana, cerca del mediodía y por la tarde.",{
   mc:[["¿En qué momentos del día conviene registrar la sombra?","Por la mañana, cerca del mediodía y por la tarde",["Sólo de noche","Sólo una vez, a cualquier hora","Sólo al amanecer"]],
       ["¿En cuántos momentos del día conviene registrar la sombra?","En tres: mañana, cerca del mediodía y tarde",["En uno solo","En dos, los dos a la tarde","En ninguno: alcanza con mirar"]]],
   vf:[["Para registrar las sombras alcanza con hacerlo una sola vez por la mañana.",false,"Conviene registrarlas en tres momentos: por la mañana, cerca del mediodía y por la tarde."]]}),
  K("sombra_manana","c","🌤️","La sombra de la mañana","Por la mañana la sombra del gnomon apunta hacia el sector oeste y es cada vez más corta, porque el Sol se va elevando.",{
   mc:[["Por la mañana, ¿hacia dónde apunta la sombra del gnomon?","Hacia el sector oeste",["Hacia el sector este","Hacia el norte","Hacia ninguna parte"]],
       ["A medida que avanza la mañana, la sombra se va poniendo…","Más corta",["Más larga","Más ancha","Más fría"]]],
   vf:[["Por la mañana la sombra del gnomon apunta hacia el sector este.",false,"Apunta hacia el oeste, del lado contrario al Sol."]],
   tocar:[["gnomon","Tocá en el dibujo la sombra más larga de la mañana.","s9"]]}),
  K("sombra_mediodia","c","☀️","La sombra del mediodía solar","La sombra más corta del día es la del mediodía solar, cuando el Sol está en su posición más alta (cerca de las 13 h). En ese momento la sombra apunta hacia el sur. Así se reconoce el norte (del lado opuesto) y los demás puntos cardinales.",{
   mc:[["¿Cuándo es más corta la sombra del gnomon durante el día?","Al mediodía solar",["Al amanecer","Al anochecer","A la medianoche"]],
       ["En el mediodía solar, la sombra del gnomon apunta hacia el…","sur",["norte","este","oeste"]],
       ["Si encontrás hacia dónde apunta la sombra más corta del día, ¿qué punto cardinal reconocés del lado opuesto?","El norte",["El sur","El este","El oeste"]]],
   vf:[["La sombra más corta del día apunta hacia el sur.",true,"Es la del mediodía solar: el Sol está hacia el norte y la sombra cae del lado opuesto."],
       ["La sombra más corta del día se forma al amanecer.",false,"Se forma en el mediodía solar, cuando el Sol está más alto."]],
   tipear:[["La sombra más corta del día se forma en el mediodía… (una palabra).",["solar","mediodia solar"],"No es el de las 12 en punto"],
           ["En el mediodía solar la sombra del gnomon apunta hacia el… (punto cardinal).",["sur","el sur"],"Es el opuesto del norte"]],
   tocar:[["gnomon","Tocá en el dibujo la sombra que se forma al mediodía solar.","s13"],
          ["gnomon","Tocá en el dibujo la sombra más corta del día.","s13"],
          ["gnomon","Tocá en el dibujo la sombra que apunta justo hacia el sur.","s13"]]}),
  K("sombra_tarde","c","🌇","La sombra de la tarde","Por la tarde la sombra del gnomon apunta hacia el sector este y es cada vez más larga, porque el Sol va bajando.",{
   mc:[["Por la tarde, ¿hacia dónde apunta la sombra del gnomon?","Hacia el sector este",["Hacia el sector oeste","Hacia el norte","Hacia el sur"]],
       ["A medida que avanza la tarde, la sombra se va poniendo…","Más larga",["Más corta","Más angosta","Más cálida"]]],
   vf:[["Por la tarde la sombra del gnomon es cada vez más larga.",true,"El Sol va bajando y la sombra se alarga."]],
   tocar:[["gnomon","Tocá en el dibujo la sombra más larga de la tarde.","s17"]]}),
  K("observar","d","👀","Observar no es mirar","Observar no es sólo mirar: hay que tener todos los sentidos en alerta y la mente en acción, y preguntarse si el lugar y el día elegidos son los adecuados y si algo tapa la sombra de la varilla.",{
   mc:[["Cuando observás un fenómeno de la naturaleza, ¿qué hay que hacer?","Tener todos los sentidos en alerta y la mente en acción",["Mirar rápido y no anotar nada","Observar sólo con los ojos cerrados","Esperar a que otra persona lo cuente"]],
       ["¿Qué conviene revisar antes de registrar las sombras del gnomon?","Que el lugar y el día sean adecuados y que nada tape la sombra de la varilla",["Que haya muchas nubes","Que haya mucho viento","Que sea de noche"]]],
   vf:[["Observar es lo mismo que mirar un ratito.",false,"Observar exige tener todos los sentidos en alerta y la mente en acción."]]}),
  K("registrar_datos","d","📝","Registrar y analizar los datos","Registrar lo que observamos es escribirlo, dibujarlo, fotografiarlo o grabarlo. El registro de datos y su análisis son esenciales en una investigación.",{
   mc:[["¿Cómo se puede registrar lo que se observa?","Escribiéndolo, dibujándolo, fotografiándolo o grabándolo",["Sólo recordándolo de memoria","Sólo comentándolo con alguien","Sólo mirándolo con atención"]],
       ["En una investigación, el registro de datos y su análisis son…","Esenciales",["Opcionales","Innecesarios","Una pérdida de tiempo"]]],
   vf:[["Registrar datos puede ser dibujar o fotografiar lo que se observa.",true,"También se puede escribir o grabar."]]}),
  K("repetir_registros","d","🔁","Repetir los registros","Si se repite el registro dentro de dos meses, va a haber semejanzas y diferencias: el patrón del día se mantiene (sombra larga a la mañana, la más corta al mediodía solar apuntando al sur, y larga otra vez a la tarde), pero el largo de las sombras puede ser distinto porque el recorrido del Sol cambia durante el año.",{
   mc:[["Si repetís los registros de sombras dentro de dos meses, ¿qué esperás que se mantenga igual?","Que la sombra más corta sigue siendo la del mediodía solar y apunta al sur",["Que las sombras miden exactamente lo mismo","Que la sombra más corta aparece al amanecer","Que ya no hay sombras"]],
       ["Si repetís los registros dentro de dos meses, ¿qué puede ser distinto?","El largo de las sombras, porque el recorrido del Sol cambia durante el año",["Hacia qué punto cardinal apunta la sombra más corta del día","Que el Sol sale por el oeste","Que el gnomon crece"]]],
   vf:[["Dentro de dos meses, las sombras del gnomon van a medir exactamente lo mismo que hoy a la misma hora.",false,"El largo puede cambiar porque el recorrido del Sol cambia durante el año."]]})
 ],
 tableros:[
  {titulo:"El gnomon y su registro",cols:["Tema","Qué hay que saber"],pares:[["gnomon","El gnomon","Varilla vertical y fija"],["gnomon_lugar","Dónde se instala","Un día soleado y un lugar descubierto"],["registrar_sombras","Registrar una sombra","Contorno o marca del extremo, y la hora"],["cuando_registrar","Cuándo registrar","Mañana, cerca del mediodía y tarde"]]},
  {titulo:"Las sombras y la observación",cols:["Tema","Qué pasa"],pares:[["sombra_manana","Sombra de la mañana","Apunta al oeste y se acorta"],["sombra_mediodia","Sombra del mediodía solar","La más corta, apunta al sur"],["sombra_tarde","Sombra de la tarde","Apunta al este y se alarga"],["observar","Observar no es mirar","Sentidos en alerta y mente en acción"],["registrar_datos","Registrar datos","Escribir, dibujar, fotografiar o grabar"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"dibujos",titulo:"🖼️ Dibujo",dibujos:["gnomon"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 mapa:{raiz:"El gnomon: observar y registrar sombras",ramas:[
  {t:"¿Qué es?",h:["Una varilla vertical que tiene que quedar fija","Con su sombra se sabe dónde está el Sol y se encuentran los puntos cardinales"]},
  {t:"¿Dónde y cuándo?",h:["Un día soleado, en un lugar descubierto, lejos de paredes y objetos grandes","Tres momentos: mañana, cerca del mediodía y tarde"]},
  {t:"¿Cómo se registra?",h:["Dibujando el contorno de la sombra en un papel, o marcando su extremo en el piso","Anotando la hora junto a cada sombra"]},
  {t:"¿Qué se descubre?",h:["Mañana: la sombra apunta al sector oeste y se acorta","Mediodía solar (cerca de las 13 h): la sombra más corta, apunta al sur","Tarde: apunta al sector este y se alarga","Así se reconoce el norte y los demás puntos cardinales"]},
  {t:"Observar y registrar",h:["Observar no es mirar: sentidos en alerta y mente en acción","Registrar: escribir, dibujar, fotografiar o grabar","Analizar los datos es esencial en una investigación"]}
 ]}
});
})();
