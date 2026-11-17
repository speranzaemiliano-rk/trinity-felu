// Naturales · tema 1: «El Sol sobre el horizonte» (página 122 del libro). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada pieza del dibujo «El camino del Sol» al tocarla en la pantalla de estudio (los números son los del dibujo)
INT.IDEAS.info.sol={
  p1:{t:"1 · La salida del Sol (el amanecer)",d:"El Sol sale siempre por alguna posición del sector este del horizonte."},
  p2:{t:"2 · El Sol se eleva",d:"Durante varias horas el Sol sube y se mueve por el sector este."},
  p3:{t:"3 · El mediodía solar",d:"El Sol está en su posición más alta, hacia el norte. En la Ciudad de Buenos Aires ocurre cerca de las 13 horas, no a las 12."},
  p4:{t:"4 · El Sol baja",d:"Durante varias horas el Sol disminuye su altura y se mueve por el sector oeste."},
  p5:{t:"5 · La puesta del Sol",d:"El Sol se pone siempre por alguna posición del sector oeste del horizonte."},
  este:{t:"Este",d:"Por este lado sale el Sol y se mueve mientras sube. Mirando hacia el norte, el este queda a tu derecha."},
  norte:{t:"Norte",d:"Hacia el norte está el Sol en el mediodía solar, cuando llega a su posición más alta. Es hacia donde mirás en este dibujo."},
  oeste:{t:"Oeste",d:"Por este lado baja el Sol y se pone. Mirando hacia el norte, el oeste queda a tu izquierda."}
};
INT.temaIdeas({
 id:"sol",nombre:"El Sol sobre el horizonte",ico:"☀️",paginas:"página 122",
 es:"Cómo se mueve el Sol durante un día: horizonte, puntos cardinales, salida, mediodía solar y puesta",
 grupos:[{id:"a",titulo:"El día y la noche"},{id:"b",titulo:"Para orientarse"},{id:"c",titulo:"El camino del Sol durante un día"},{id:"d",titulo:"Un dato curioso"}],
 conceptos:[
  K("horizonte","a","🌄","El horizonte","El horizonte es la línea donde parece que la Tierra se junta con el cielo.",{
   mc:[["¿Qué es el horizonte?","La línea donde parece que la Tierra se junta con el cielo",["El punto más alto al que llega el Sol","Un instrumento para orientarse","La sombra que deja un objeto"]],
       ["Para que sea de día, ¿dónde tiene que estar el Sol respecto del horizonte?","Sobre el horizonte",["Bajo el horizonte","Justo en el horizonte, sin moverse","Detrás de la brújula"]]],
   vf:[["El horizonte es un borde real que separa la Tierra del cielo.",false,"Es una línea aparente: parece que ahí se juntan la Tierra y el cielo, pero no es un borde de verdad."]],
   tipear:[["La línea donde parece que se juntan la Tierra y el cielo se llama…",["horizonte","el horizonte"],"Empieza con h"]]}),
  K("dia_noche","a","🌗","El día y la noche","Es de día cuando el Sol está sobre el horizonte. Es de noche cuando el Sol está bajo el horizonte.",{
   mc:[["¿Cuándo es de día en un lugar?","Cuando el Sol está sobre el horizonte",["Cuando el Sol está bajo el horizonte","Cuando hace calor","Cuando no se ve la Luna"]],
       ["¿Dónde está el Sol durante la noche?","Bajo el horizonte",["Sobre el horizonte","Justo en el punto cardinal norte","Se apaga hasta la mañana"]],
       ["Completá: «Es de día cuando el Sol está ______ el horizonte».","sobre",["bajo","detrás de","lejos de"]]],
   vf:[["Durante la noche, el Sol está sobre el horizonte.",false,"De noche el Sol está bajo el horizonte."],
       ["Mientras el Sol está sobre el horizonte, es de día.",true,"Eso es lo que caracteriza al día."]],
   tipear:[["Cuando el Sol está bajo el horizonte, es de…",["noche","de noche"],"Es lo contrario del día"]]}),
  K("dos_dias","a","📖","Dos significados de «día»","La palabra «día» tiene dos significados: el tiempo en que el Sol está sobre el horizonte (lo contrario de la noche) y el período completo de 24 horas.",{
   mc:[["¿Cuáles son los dos significados de la palabra «día»?","El tiempo en que hay Sol sobre el horizonte y el período de 24 horas",["Sólo el período de 24 horas","El mediodía y la puesta del Sol","El verano y el invierno"]],
       ["«Salimos a jugar durante el día, antes de que anochezca». ¿Qué significa «día» acá?","El tiempo en que el Sol está sobre el horizonte",["El período de 24 horas","El mediodía solar","Una estación del año"]],
       ["«Una semana tiene siete días». ¿Qué significa «día» acá?","El período de 24 horas",["El tiempo en que el Sol está sobre el horizonte","La parte de la jornada sin luz","El punto más alto del Sol"]]],
   vf:[["La palabra «día» siempre significa lo contrario de «noche».",false,"También se usa para hablar del período de 24 horas, que incluye la noche."]]}),
  K("puntos_cardinales","b","🧭","Los puntos cardinales","Los puntos cardinales principales son norte, sur, este y oeste. Entre ellos hay otros: noreste, noroeste, sureste y suroeste.",{
   mc:[["¿Cuáles son los cuatro puntos cardinales principales?","Norte, sur, este y oeste",["Adelante, atrás, derecha e izquierda","Norte, sur, arriba y abajo","Mañana, tarde, noche y madrugada"]],
       ["¿Cuál de estos es un punto cardinal intermedio?","Suroeste",["Mediodía","Horizonte","Brújula"]],
       ["El punto cardinal que queda entre el norte y el este es el…","noreste",["noroeste","sureste","suroeste"]]],
   vf:[["El noroeste queda entre el norte y el oeste.",true,"Noroeste: entre el norte y el oeste."],
       ["El sureste queda entre el sur y el oeste.",false,"El sureste queda entre el sur y el este; entre el sur y el oeste está el suroeste."]],
   tipear:[["El punto cardinal que queda entre el sur y el oeste es el…",["suroeste","sudoeste","sur oeste"],"Empieza con «sur»"]]}),
  K("brujula","b","🧲","La brújula","La brújula es un instrumento de orientación: permite saber dónde están el norte, el sur, el este y el oeste. Sirve para decir con precisión dónde está el Sol, porque «adelante», «atrás», «derecha» e «izquierda» cambian cuando girás, pero los puntos cardinales no.",{
   mc:[["¿Para qué sirve una brújula?","Para orientarse y saber dónde están los puntos cardinales",["Para medir cuántas horas dura el día","Para medir el largo de una sombra","Para saber cuántos días tiene el año"]],
       ["Si querés decir con precisión dónde está el Sol, ¿qué conviene usar?","Los puntos cardinales, con ayuda de una brújula",["Las palabras «adelante» y «atrás»","Las palabras «a mi derecha» o «a mi izquierda»","El color del cielo"]],
       ["Si girás 180°, el Sol que estaba adelante tuyo pasa a estar…","Atrás tuyo",["Adelante tuyo","Siempre al norte","Bajo el horizonte"]]],
   vf:[["La brújula sirve para saber qué hora es.",false,"Sirve para orientarse: indica dónde están los puntos cardinales."],
       ["«Adelante» y «atrás» cambian cuando girás; el norte y el sur no.",true,"Por eso se usan los puntos cardinales para ubicar el Sol."]],
   tipear:[["El instrumento que sirve para orientarse y encontrar los puntos cardinales se llama…",["brujula","la brujula","una brujula"],"Tiene una aguja"]]}),
  K("salida","c","🌅","La salida del Sol","El Sol sale (es el amanecer) siempre por alguna posición del sector este del horizonte.",{
   mc:[["¿Por qué sector del horizonte sale el Sol?","Por el sector este",["Por el sector oeste","Por el sector norte","Por el sector sur"]],
       ["¿Cómo se llama el momento en que el Sol sale?","Amanecer",["Anochecer","Mediodía solar","Estación"]]],
   vf:[["El Sol sale por el sector este del horizonte.",true,"Siempre sale por alguna posición del sector este."],
       ["El Sol sale por el oeste y se pone por el este.",false,"Es al revés: sale por el este y se pone por el oeste."]],
   tipear:[["El Sol sale por el sector… del horizonte (escribí el punto cardinal).",["este","el este"],"Es el opuesto del oeste"]],
   tocar:[["sol","Tocá en el dibujo el lugar donde sale el Sol.","p1"],["sol","Tocá en el dibujo el punto cardinal por donde sale el Sol.","este"]]}),
  K("ascenso","c","⬆️","El Sol se eleva","Después de salir, durante varias horas el Sol se eleva: va subiendo y se mueve por el sector este.",{
   mc:[["Después de salir, durante varias horas, el Sol…","Se eleva y se mueve por el sector este",["Baja y se mueve por el sector oeste","Se queda quieto en el horizonte","Se mueve por el sector sur sin cambiar de altura"]]],
   vf:[["Después de salir, el Sol va subiendo durante varias horas.",true,"Se eleva mientras se mueve por el sector este."]],
   tocar:[["sol","Tocá en el dibujo dónde está el Sol mientras se eleva por el sector este.","p2"]]}),
  K("mediodia_solar","c","☀️","El mediodía solar","El mediodía solar es el momento en que el Sol está en su posición más alta. En ese momento está hacia el norte. En la Ciudad de Buenos Aires ocurre cerca de las 13 horas, no a las 12.",{
   mc:[["¿Cómo se llama el momento en que el Sol está en su posición más alta?","Mediodía solar",["Amanecer","Anochecer","Estación"]],
       ["En el mediodía solar, ¿hacia qué punto cardinal está el Sol?","Hacia el norte",["Hacia el sur","Hacia el este","Hacia el oeste"]],
       ["En la Ciudad de Buenos Aires, el mediodía solar ocurre cerca de las…","13 horas",["6 horas","12 horas en punto","18 horas"]]],
   vf:[["En la Ciudad de Buenos Aires el mediodía solar ocurre justo a las 12 horas.",false,"Ocurre cerca de las 13 horas, no a las 12."],
       ["En el mediodía solar el Sol está en su posición más alta del día.",true,"Eso es lo que define al mediodía solar."]],
   tipear:[["Cuando el Sol está en su posición más alta decimos que es el mediodía… (una palabra)",["solar","mediodia solar"],"Tiene que ver con el Sol"],
           ["En la Ciudad de Buenos Aires el mediodía solar ocurre cerca de las… horas (escribí el número).",["13","trece","13 horas","trece horas","13 h","las 13","las 13 horas","13 00"],"Es un número"]],
   tocar:[["sol","Tocá en el dibujo dónde está el Sol en el mediodía solar.","p3"],["sol","Tocá en el dibujo el punto cardinal hacia el que está el Sol en el mediodía solar.","norte"]]}),
  K("descenso","c","⬇️","El Sol baja","Después del mediodía solar, durante varias horas el Sol baja: disminuye su altura y se mueve por el sector oeste.",{
   mc:[["Después del mediodía solar, durante varias horas, el Sol…","Disminuye su altura y se mueve por el sector oeste",["Aumenta su altura por el sector este","Se queda en su posición más alta","Vuelve a salir por el sector este"]]],
   vf:[["Después del mediodía solar, el Sol baja moviéndose por el sector oeste.",true,"Disminuye su altura mientras se acerca a la puesta."]],
   tocar:[["sol","Tocá en el dibujo dónde está el Sol mientras baja por el sector oeste.","p4"]]}),
  K("puesta","c","🌇","La puesta del Sol","El Sol se pone siempre por alguna posición del sector oeste del horizonte.",{
   mc:[["¿Por qué sector del horizonte se pone el Sol?","Por el sector oeste",["Por el sector este","Por el sector norte","Por el sector sur"]],
       ["Cuando el Sol se pone y queda bajo el horizonte, ¿qué empieza?","La noche",["El día","El mediodía solar","El verano"]]],
   vf:[["El Sol se pone por el sector oeste del horizonte.",true,"Siempre se pone por alguna posición del sector oeste."]],
   tipear:[["El Sol se pone por el sector… del horizonte (escribí el punto cardinal).",["oeste","el oeste"],"Es el opuesto del este"]],
   tocar:[["sol","Tocá en el dibujo el lugar donde se pone el Sol.","p5"],["sol","Tocá en el dibujo el punto cardinal por donde se pone el Sol.","oeste"]]}),
  K("mismo_tiempo","c","⚖️","¿Por qué «mediodía»?","Entre la salida del Sol y el mediodía solar pasa el mismo tiempo que entre el mediodía solar y la puesta. Por eso se llama «mediodía»: queda justo en la mitad.",{
   mc:[["¿Por qué el mediodía solar se llama «mediodía»?","Porque pasa el mismo tiempo desde la salida hasta él que desde él hasta la puesta",["Porque siempre ocurre a las 12 en punto","Porque es cuando el Sol está más bajo","Porque dura medio día"]]],
   vf:[["Entre la salida y el mediodía solar pasa el mismo tiempo que entre el mediodía solar y la puesta.",true,"Por eso se lo llama «mediodía»."],
       ["Desde la salida hasta el mediodía solar pasa más tiempo que desde el mediodía solar hasta la puesta.",false,"Pasa el mismo tiempo."]]}),
  K("un_dia","c","⏰","Un día: 24 horas","Cada vez que se repite el mediodía solar, más o menos cada 24 horas, decimos que pasó un día.",{
   mc:[["¿Cuándo decimos que pasó un día?","Cuando el mediodía solar se repite, más o menos cada 24 horas",["Cuando cambia la estación","Cuando la brújula marca el norte","Cuando el Sol sale por el sur"]],
       ["¿Cada cuánto tiempo se repite el mediodía solar?","Más o menos cada 24 horas",["Más o menos cada 12 horas","Cada semana","Cada estación"]]],
   vf:[["Entre un mediodía solar y el siguiente pasan unas 24 horas.",true,"Cada vez que se repite el mediodía solar pasó un día."],
       ["Un día completo dura unas 12 horas.",false,"Un día completo dura unas 24 horas."]],
   tipear:[["Más o menos cada… horas se repite el mediodía solar (escribí el número).",["24","veinticuatro","24 horas","veinticuatro horas"],"Es un número"]]}),
  K("arco","c","🌈","El arco del Sol","Durante el día el Sol parece dibujar un arco en el cielo: sale por el este, sube hasta su posición más alta (el mediodía solar) y baja hasta ponerse por el oeste.",{
   mc:[["En un cuento aparece la frase «el Sol dibujaba un arco en el cielo». ¿Qué explica esa frase?","Sale, sube hasta el mediodía solar y baja hasta ponerse: parece un arco",["El Sol queda quieto en un solo punto del cielo","El Sol da vueltas alrededor de la brújula","Las estaciones cambian todos los días"]]],
   vf:[["Durante el día, el recorrido del Sol en el cielo parece un arco.",true,"Sale, sube, llega a su punto más alto y baja."]],
   ordenar:[["Ordená lo que hace el Sol durante el día, desde el amanecer.",["Sale por el sector este (amanecer)","Se eleva durante varias horas","Llega a su posición más alta (mediodía solar)","Baja durante varias horas por el sector oeste","Se pone por el sector oeste"]]]}),
  K("shamash","d","🏺","El dios Shamash","En la antigua Mesopotamia (en el actual Oriente Medio), la gente creía en un dios del Sol llamado Shamash, que cada día cruzaba el cielo en un carro de fuego.",{
   mc:[["En la antigua Mesopotamia se creía en un dios del Sol. ¿Cómo se llamaba?","Shamash",["Zeus","Poseidón","Atenea"]],
       ["Según esa creencia, ¿cómo cruzaba el cielo cada día el dios del Sol?","En un carro de fuego",["Volando como un pájaro","Caminando por el horizonte","En un barco"]]],
   vf:[["En la antigua Mesopotamia se imaginaba que el dios del Sol cruzaba el cielo en un carro de fuego.",true,"Así se lo imaginaba esa gente."]]})
 ],
 tableros:[
  {titulo:"El camino del Sol",cols:["Momento","Qué pasa"],pares:[["salida","La salida del Sol","Sale por el sector este"],["ascenso","Después de salir","Se eleva por el sector este"],["mediodia_solar","El mediodía solar","El Sol en su punto más alto, hacia el norte"],["descenso","Después del mediodía solar, por varias horas","Baja por el sector oeste"],["puesta","La puesta del Sol","Se pone por el sector oeste"]]},
  {titulo:"Día, noche y orientación",cols:["Idea","Qué significa"],pares:[["horizonte","El horizonte","Donde parece juntarse la Tierra con el cielo"],["dia_noche","Es de día","El Sol está sobre el horizonte"],["puntos_cardinales","Puntos cardinales","Norte, sur, este y oeste"],["brujula","La brújula","Instrumento para orientarse"],["dos_dias","La palabra «día»","Tiene dos significados"]]},
  {titulo:"El tiempo",cols:["Tema","Qué dice"],pares:[["un_dia","Un día","Unas 24 horas"],["mismo_tiempo","¿Por qué «mediodía»?","Queda justo en la mitad del tiempo con Sol"],["arco","El recorrido del Sol en un día","Parece un arco en el cielo"],["shamash","Shamash","Dios del Sol de la antigua Mesopotamia"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"dibujos",titulo:"🖼️ Dibujo",dibujos:["sol"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 mapa:{raiz:"El Sol y el horizonte",ramas:[
  {t:"El día y la noche",h:["De día: el Sol está sobre el horizonte","De noche: el Sol está bajo el horizonte","«Día» tiene dos significados: el tiempo con Sol y las 24 horas"]},
  {t:"Para orientarse",h:["La brújula, un instrumento de orientación","Los puntos cardinales: norte, sur, este y oeste","Los intermedios: noreste, noroeste, sureste y suroeste"]},
  {t:"El camino del Sol durante un día",h:["1 · Sale por el sector este (amanecer)","2 · Se eleva por el sector este","3 · Mediodía solar: lo más alto, hacia el norte (en Buenos Aires, cerca de las 13 h)","4 · Baja por el sector oeste","5 · Se pone por el sector oeste"]},
  {t:"El tiempo",h:["Pasa el mismo tiempo desde la salida hasta el mediodía solar que desde él hasta la puesta","De un mediodía solar al siguiente: unas 24 horas = un día"]}
 ]}
});
})();
