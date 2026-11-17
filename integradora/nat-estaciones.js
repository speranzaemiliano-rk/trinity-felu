// Naturales · tema 2: «Las estaciones del año» (páginas 123 a 126 del libro). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada pieza de los dibujos al tocarla en la pantalla de estudio
INT.IDEAS.info.salidas={
  v_sale:{t:"Primer día del verano · sale",d:"El Sol sale por el sureste. Es el día con el arco más grande y el día más largo del año."},
  v_pone:{t:"Primer día del verano · se pone",d:"El Sol se pone por el suroeste."},
  e_sale:{t:"Primer día del otoño o de la primavera · sale",d:"El Sol sale casi por el este (es un equinoccio): el día y la noche duran unas 12 horas cada uno."},
  e_pone:{t:"Primer día del otoño o de la primavera · se pone",d:"El Sol se pone casi por el oeste."},
  i_sale:{t:"Primer día del invierno · sale",d:"El Sol sale por el noreste. Es el día con el arco más chico y el día más corto del año."},
  i_pone:{t:"Primer día del invierno · se pone",d:"El Sol se pone por el noroeste."}
};
INT.IDEAS.info.alturas={
  h_ver:{t:"Mediodía del primer día del verano",d:"El Sol está en su posición más alta del año y la sombra es la más corta."},
  h_eq:{t:"Mediodía del primer día del otoño o de la primavera",d:"El Sol está a una altura intermedia y la sombra mide más que en verano y menos que en invierno."},
  h_inv:{t:"Mediodía del primer día del invierno",d:"El Sol está en su posición más baja del año y la sombra es la más larga."}
};
INT.temaIdeas({
 id:"estaciones",nombre:"Las estaciones del año",ico:"🍂",paginas:"páginas 123 a 126",
 es:"Cómo cambia el recorrido del Sol durante el año: sombras, temperaturas, las cuatro estaciones, solsticios y equinoccios",
 grupos:[{id:"a",titulo:"El año y las estaciones"},{id:"b",titulo:"Cómo cambia el Sol durante el año"},{id:"c",titulo:"Las cuatro estaciones"},{id:"d",titulo:"Cuándo empieza cada estación"}],
 conceptos:[
  K("recorrido_cambia","a","🔄","El recorrido cambia","Todos los días el Sol sale por el sector este, llega a su posición más alta y se pone por el sector oeste. Pero cada día cambia el tiempo que está sobre el horizonte: el Sol no hace exactamente el mismo recorrido durante todo el año.",{
   mc:[["A lo largo del año, el tiempo que el Sol está sobre el horizonte…","Cambia de un día a otro",["Es siempre exactamente el mismo","Cambia sólo cuando hay nubes","Cambia una sola vez por año"]],
       ["Te despertás siempre a las 7 de la mañana. ¿Qué puede pasar a lo largo del año?","Según la época del año puede ser de día o de noche",["Siempre es de día","Siempre es de noche","Siempre es el mediodía solar"]]],
   vf:[["El Sol hace exactamente el mismo recorrido todos los días del año.",false,"Cada día cambia el tiempo que el Sol está sobre el horizonte."],
       ["Aunque te despiertes siempre a la misma hora, en algunas épocas del año puede ser de noche y en otras de día.",true,"Pasa porque el recorrido del Sol cambia durante el año."]]}),
  K("sombra_cambia","a","📏","Las sombras cambian","Si registrás la sombra de un objeto fijo, a la misma hora y en distintos días, vas a ver que no mide siempre lo mismo: es más corta en una época del año que en otra.",{
   mc:[["Medís la sombra de un poste a la misma hora, en distintos días del año. ¿Qué observás?","Que el largo de la sombra cambia según la época del año",["Que mide siempre lo mismo","Que sólo cambia si cambia la hora","Que desaparece en invierno"]],
       ["¿Cómo podés comprobar si el Sol hace el mismo recorrido durante todo el año?","Registrando la sombra de un objeto fijo, a la misma hora, en distintos días",["Mirando sólo el amanecer de un día","Contando cuántas estrellas se ven de noche","Contando cuántas nubes hay"]]],
   vf:[["La sombra de un objeto fijo, a la misma hora, mide siempre lo mismo durante todo el año.",false,"Es más corta en una época del año que en otra."]],
   tipear:[["La sombra de un objeto fijo, a la misma hora, cambia de largo según la… del año (una palabra).",["epoca","la epoca","estacion","la estacion"],"Por ejemplo, el verano"]]}),
  K("temperaturas","a","🌡️","Calor, frío y templado","Durante el año hay meses con temperaturas altas, bajas y templadas. Esos cambios muestran que el recorrido del Sol cambia durante el año.",{
   mc:[["Que haya meses con temperaturas altas, bajas y templadas nos indica que…","El recorrido del Sol cambia durante el año",["El Sol se apaga algunos meses","La Tierra deja de girar","La brújula cambia de lugar"]]],
   vf:[["Los cambios de temperatura durante el año son una pista de que el recorrido del Sol cambia.",true,"Junto con el largo de las sombras, muestran que el recorrido del Sol varía."]]}),
  K("estaciones","a","🍂","Las estaciones del año","Los días con características parecidas se agrupan en períodos llamados estaciones del año. Hay cuatro: verano, otoño, invierno y primavera.",{
   mc:[["¿Cuántas estaciones del año hay?","Cuatro",["Dos","Tres","Seis"]],
       ["¿Cuáles son las cuatro estaciones del año?","Verano, otoño, invierno y primavera",["Verano, invierno, día y noche","Calor, frío, templado y lluvia","Mañana, tarde, noche y madrugada"]],
       ["¿Qué es una estación del año?","Un período de días con características parecidas",["Un punto cardinal","Un instrumento para orientarse","El momento en que el Sol está más alto"]]],
   vf:[["Hay cinco estaciones del año.",false,"Hay cuatro: verano, otoño, invierno y primavera."],
       ["La primavera es una de las estaciones del año.",true,"Las cuatro son verano, otoño, invierno y primavera."]],
   tipear:[["Verano, otoño, invierno y… (la estación que falta).",["primavera","la primavera"],"Empieza con p"]],
   ordenar:[["Ordená las estaciones del año empezando por el verano.",["Verano","Otoño","Invierno","Primavera"]]],
   estacion:true}),
  K("polos","a","🧊","Cerca de los polos","Cerca de los polos de la Tierra hay una época del año con días enteros en los que el Sol nunca sale y, meses después, días enteros en los que nunca se pone. En nuestra Ciudad eso no pasa: siempre hay día y noche.",{
   mc:[["Cerca de los polos, en una época del año…","Hay días enteros en los que el Sol nunca sale",["El Sol sale por el oeste","Nunca se ve el Sol en todo el año","El Sol sale cuatro veces por día"]]],
   vf:[["En la Ciudad de Buenos Aires hay días enteros en los que el Sol nunca sale.",false,"Acá siempre hay día y noche: eso sólo pasa cerca de los polos."],
       ["Cerca de los polos hay días enteros en los que el Sol nunca se pone.",true,"Pasa en otra época del año, meses después de los días sin Sol."]]}),
  K("ano","a","📆","¿Qué es un año?","Cuando se completa el ciclo de las cuatro estaciones, decimos que transcurrió un año. Las estaciones no empiezan siempre el mismo día, pero sí en días muy cercanos (entre el 20 y el 23 del mes). Cuando termina la primavera, el ciclo se repite.",{
   mc:[["¿Cuándo decimos que transcurrió un año?","Cuando se completa el ciclo de las cuatro estaciones",["Cuando pasan siete días","Cuando el Sol sale por el este","Cuando el día dura 12 horas"]],
       ["¿Las estaciones empiezan siempre exactamente el mismo día de cada año?","No, pero sí en días muy cercanos de un año a otro",["Sí, siempre el mismo día","No, cada año empiezan en meses distintos","Sí, pero sólo el verano"]]],
   vf:[["El ciclo de las estaciones se repite una y otra vez.",true,"Después de la primavera empieza un nuevo verano."],
       ["Las estaciones empiezan siempre el mismo día de cada año, sin variar nunca.",false,"Empiezan en días muy cercanos de un año a otro, pero no siempre el mismo."]],
   tipear:[["Cuando se completa el ciclo de las cuatro estaciones transcurre un… (una palabra).",["año","un año","ano"],"Es más largo que un mes"]],
   ordenar:[["Ordená los días que marcan el comienzo de cada estación, empezando por diciembre.",["Solsticio de verano (diciembre)","Equinoccio de otoño (marzo)","Solsticio de invierno (junio)","Equinoccio de primavera (septiembre)"]]]}),
  K("puntos_sale_pone","b","🧭","Dónde sale y se pone el Sol","A lo largo del año el Sol no sale ni se pone siempre por el mismo punto. El primer día del verano sale por el sureste y se pone por el suroeste. El primer día del otoño y el de la primavera sale casi por el este y se pone casi por el oeste. El primer día del invierno sale por el noreste y se pone por el noroeste.",{
   mc:[["El primer día del verano, ¿por qué sector sale el Sol?","Por el sureste",["Por el noreste","Por el noroeste","Por el suroeste"]],
       ["El primer día del invierno, ¿por qué sector se pone el Sol?","Por el noroeste",["Por el suroeste","Por el sureste","Por el noreste"]],
       ["El primer día del otoño y el de la primavera, el Sol sale casi por el…","este",["noreste","sureste","sur"]]],
   vf:[["El primer día del verano el Sol sale por el sureste.",true,"Y se pone por el suroeste."],
       ["El primer día del invierno el Sol sale por el sureste.",false,"Sale por el noreste y se pone por el noroeste."]],
   tocar:[["salidas","Tocá en el dibujo el punto por donde sale el Sol el primer día del verano.","v_sale"],
          ["salidas","Tocá en el dibujo el punto por donde se pone el Sol el primer día del verano.","v_pone"],
          ["salidas","Tocá en el dibujo el punto por donde sale el Sol el primer día del invierno.","i_sale"],
          ["salidas","Tocá en el dibujo el punto por donde se pone el Sol el primer día del invierno.","i_pone"],
          ["salidas","Tocá en el dibujo el punto por donde sale el Sol el primer día del otoño.","e_sale"],
          ["salidas","Tocá en el dibujo el punto por donde se pone el Sol el primer día de la primavera.","e_pone"]]}),
  K("altura_mediodia","b","⬆️","Qué tan alto llega el Sol","Al mediodía solar el Sol no llega siempre a la misma altura. Su posición más alta del año es el primer día del verano y la más baja es el primer día del invierno. En los esquemas del libro, el Sol dibujado en lo más alto de cada arco representa el mediodía solar.",{
   mc:[["¿Cuándo está el Sol en su posición más alta del año, al mediodía?","El primer día del verano",["El primer día del invierno","El primer día del otoño","El primer día de la primavera"]],
       ["¿Cuándo está el Sol en su posición más baja del año, al mediodía?","El primer día del invierno",["El primer día del verano","El primer día del otoño","El primer día de la primavera"]]],
   vf:[["Al mediodía solar el Sol llega siempre a la misma altura, durante todo el año.",false,"Cambia: es más alto en verano y más bajo en invierno."],
       ["En los esquemas, el Sol dibujado en lo más alto del arco representa el mediodía solar.",true,"Es el momento en que el Sol está en su posición más alta."]],
   tocar:[["alturas","Tocá el dibujo del mediodía del primer día del verano.","h_ver"],
          ["alturas","Tocá el dibujo del mediodía del primer día del invierno.","h_inv"],
          ["alturas","Tocá el dibujo del mediodía del primer día del otoño o de la primavera.","h_eq"]]}),
  K("sombras_estaciones","b","📐","Las sombras en cada estación","Cuanto más alto está el Sol, más corta es la sombra. Por eso las sombras son más cortas en verano, se van alargando en otoño, son más largas en invierno y se vuelven a acortar en primavera.",{
   mc:[["¿En qué estación son más cortas las sombras?","En verano",["En otoño","En invierno","Miden lo mismo todo el año"]],
       ["¿En qué estación son más largas las sombras?","En invierno",["En verano","En primavera","Miden lo mismo todo el año"]],
       ["Cuando el Sol está más alto en el cielo, la sombra de un objeto es…","Más corta",["Más larga","Igual","Imposible de medir"]]],
   vf:[["En verano las sombras son más largas que en invierno.",false,"Es al revés: en verano el Sol está más alto y las sombras son más cortas."],
       ["En otoño las sombras son más largas que en verano.",true,"Del verano al invierno el Sol baja y las sombras se van alargando."]]}),
  K("dia_noche_duracion","b","🌓","Días y noches en cada estación","En verano y en primavera los días duran más que las noches. En otoño y en invierno los días duran menos que las noches. Los primeros días del otoño y de la primavera, el día y la noche duran unas 12 horas cada uno.",{
   mc:[["¿En qué estaciones los días duran más que las noches?","En verano y en primavera",["En otoño y en invierno","En verano y en otoño","En invierno y en primavera"]],
       ["¿En qué estaciones los días duran menos que las noches?","En otoño y en invierno",["En verano y en primavera","En verano y en invierno","En otoño y en primavera"]],
       ["El primer día del otoño y el primer día de la primavera, el día y la noche duran…","Unas 12 horas cada uno",["14 horas el día y 10 la noche","10 horas el día y 14 la noche","Mucho más el día que la noche"]]],
   vf:[["En invierno los días duran menos que las noches.",true,"En otoño y en invierno los días son más cortos que las noches."],
       ["En primavera los días duran menos que las noches.",false,"En primavera los días duran más que las noches."]]}),
  K("cambio_diario","b","⏱️","Cuánto cambia cada día","Mientras avanza una estación, la duración del día cambia unos 2 minutos por día. En verano y en otoño cada día dura unos 2 minutos menos que el anterior (el Sol sale un minuto más tarde y se pone un minuto más temprano). En invierno y en primavera cada día dura unos 2 minutos más (sale un minuto más temprano y se pone un minuto más tarde).",{
   mc:[["En verano, la duración de cada día respecto del anterior…","Se acorta unos 2 minutos",["Se alarga unos 2 minutos","Se mantiene igual","Se acorta unas 2 horas"]],
       ["En invierno, la duración de cada día respecto del anterior…","Se alarga unos 2 minutos",["Se acorta unos 2 minutos","Se mantiene igual","Se alarga unas 2 horas"]],
       ["En primavera, cada día el Sol sale…","Un minuto más temprano, y se pone un minuto más tarde",["Un minuto más tarde, y se pone un minuto más temprano","A la misma hora que el día anterior","Dos horas más temprano"]]],
   vf:[["En otoño cada día dura unos 2 minutos más que el anterior.",false,"En otoño cada día se acorta unos 2 minutos."],
       ["En primavera cada día dura unos 2 minutos más que el anterior.",true,"En invierno y en primavera los días se van alargando."]],
   tipear:[["En verano, cada día se acorta unos… minutos respecto del anterior (escribí el número).",["2","dos","2 minutos","dos minutos"],"Es un número"]]}),
  K("arco_cambia","b","🌈","El arco cambia durante el año","En verano y en otoño, cada día el arco del Sol es menor y el mediodía alcanza menos altura. En invierno y en primavera, cada día el arco es mayor y el mediodía alcanza más altura.",{
   mc:[["Durante el otoño, cada día el arco que hace el Sol…","Es menor, y el mediodía alcanza menos altura",["Es mayor, y el mediodía alcanza más altura","Es igual","Desaparece"]],
       ["Durante la primavera, cada día el arco que hace el Sol…","Es mayor, y el mediodía alcanza más altura",["Es menor, y el mediodía alcanza menos altura","Es igual","Desaparece"]]],
   vf:[["Durante el verano, el arco del Sol se va haciendo cada día mayor.",false,"En verano el arco se va achicando: es el más grande el primer día del verano."],
       ["Durante el invierno, el arco del Sol se va haciendo cada día mayor.",true,"Desde el primer día del invierno el arco crece."]]}),
  K("verano","c","🏖️","El verano","En verano los días duran más que las noches, el Sol está alto en el cielo y las temperaturas suelen ser elevadas. Mientras pasan los días del verano, cada día dura unos 2 minutos menos que el anterior.",{
   mc:[["¿Cómo suelen ser las temperaturas en verano?","Elevadas",["Bajas","Siempre templadas","Menores que en invierno"]],
       ["En verano, los días duran…","Más que las noches",["Menos que las noches","Lo mismo que las noches","Doce horas exactas todos los días"]]],
   vf:[["En verano los días duran menos que las noches.",false,"En verano los días duran más que las noches."],
       ["En verano el Sol se encuentra alto en el cielo.",true,"Por eso los días son largos y las temperaturas, en general, elevadas."]],
   tipear:[["La estación del año en que los días son más largos y hace más calor es el…",["verano","el verano"],"Empieza con v"]]}),
  K("otono","c","🍁","El otoño","En otoño los días duran menos que las noches y las temperaturas suelen ser menores que en verano. Cada día dura unos 2 minutos menos que el anterior y las sombras son más largas que en verano.",{
   mc:[["En otoño, los días duran…","Menos que las noches",["Más que las noches","Lo mismo que las noches","Catorce horas"]],
       ["Comparadas con las del verano, las temperaturas del otoño suelen ser…","Menores",["Mayores","Exactamente iguales","Siempre elevadas"]]],
   vf:[["En otoño los días duran más que las noches.",false,"En otoño los días duran menos que las noches."],
       ["En otoño las temperaturas suelen ser menores que en verano.",true,"Los días son más cortos y las temperaturas bajan."]],
   tipear:[["La estación que viene después del verano es el…",["otoño","otono","el otoño"],"Las hojas de los árboles se caen"]]}),
  K("invierno","c","❄️","El invierno","En invierno los días duran menos que las noches y las temperaturas suelen ser bajas. Cada día dura unos 2 minutos más que el anterior, aunque todavía hay más tiempo de oscuridad que de luz. Las sombras son más largas que en otoño.",{
   mc:[["¿Cómo suelen ser las temperaturas en invierno?","Bajas",["Elevadas","Mayores que en verano","Siempre templadas"]],
       ["Durante el invierno, cada día…","Dura unos 2 minutos más que el anterior",["Dura unos 2 minutos menos que el anterior","Dura exactamente lo mismo que el anterior","Dura 2 horas más que el anterior"]]],
   vf:[["Durante el invierno las temperaturas suelen ser bajas.",true,"Los días son cortos y el Sol está bajo en el cielo."],
       ["En invierno las sombras son más cortas que en verano.",false,"En invierno el Sol está más bajo y las sombras son más largas."]],
   tipear:[["La estación en que los días son más cortos y hace más frío es el…",["invierno","el invierno"],"Empieza con i"]]}),
  K("primavera","c","🌸","La primavera","En primavera los días duran más que las noches y las temperaturas suelen ser mayores que en invierno. Cada día dura unos 2 minutos más que el anterior. La primavera sigue hasta que el Sol llega a su mayor altura y el día es el más largo del año: ahí empieza un nuevo verano.",{
   mc:[["En primavera, los días duran…","Más que las noches",["Menos que las noches","Lo mismo que las noches","Nueve horas"]],
       ["¿Qué comienza cuando el día llega a ser el más largo del año?","Un nuevo verano",["Un nuevo invierno","El otoño","El equinoccio de otoño"]]],
   vf:[["En primavera las temperaturas suelen ser mayores que en invierno.",true,"Los días se van alargando y hace más calor."],
       ["Después de la primavera viene el invierno.",false,"Después de la primavera comienza un nuevo verano: el ciclo se repite."]],
   tipear:[["La estación que viene después del invierno es la…",["primavera","la primavera"],"Florecen las plantas"]]}),
  K("sol_verano","d","🔆","Solsticio de verano","El solsticio de verano ocurre entre el 20 y el 23 de diciembre y marca el comienzo del verano. Ese día el arco del Sol es el más grande del año y el día es el más largo (en 2025: casi 14 horas y media, con salida a las 5:37 por el sureste y puesta a las 20:06 por el suroeste). Al mediodía el Sol llega a su mayor altura, aunque en la Ciudad nunca queda justo arriba de nuestras cabezas, y las sombras son las más cortas del año.",{
   mc:[["¿Cómo se llama el día en que comienza el verano?","Solsticio de verano",["Equinoccio de verano","Solsticio de otoño","Equinoccio de primavera"]],
       ["¿Entre qué fechas ocurre el solsticio de verano?","Entre el 20 y el 23 de diciembre",["Entre el 20 y el 23 de marzo","Entre el 20 y el 23 de junio","Entre el 20 y el 23 de septiembre"]],
       ["El día del solsticio de verano, el día dura casi…","14 horas y media",["12 horas","10 horas","9 horas y 50 minutos"]],
       ["El día del solsticio de verano, el arco que hace el Sol es…","El más grande del año",["El más chico del año","Igual que el del equinoccio","Inexistente"]]],
   vf:[["El día del solsticio de verano es el día de mayor duración del año.",true,"Es el día en que el arco del Sol es el más grande."],
       ["En la Ciudad de Buenos Aires, en el solsticio de verano, el Sol queda justo arriba de nuestras cabezas.",false,"Alcanza su máxima altura, pero nunca está justo arriba de nuestras cabezas."]],
   tipear:[["El día en que el arco del Sol es el más grande del año se llama solsticio de… (escribí la estación).",["verano","de verano"],"Empieza con v"]]}),
  K("eq_otono","d","🍃","Equinoccio de otoño","El equinoccio de otoño ocurre entre el 20 y el 23 de marzo y marca el comienzo del otoño. Ese día el Sol sale casi por el este y se pone casi por el oeste, y el día y la noche duran unas 12 horas cada uno (en 2026: salida a las 6:57 y puesta a las 19:05). Después, los días se van acortando.",{
   mc:[["¿Cómo se llama el día en que comienza el otoño?","Equinoccio de otoño",["Solsticio de otoño","Equinoccio de verano","Solsticio de invierno"]],
       ["¿Entre qué fechas ocurre el equinoccio de otoño?","Entre el 20 y el 23 de marzo",["Entre el 20 y el 23 de diciembre","Entre el 20 y el 23 de junio","Entre el 20 y el 23 de septiembre"]],
       ["En el equinoccio, el Sol sale casi por el…","este",["sureste","noreste","sur"]]],
   vf:[["En el equinoccio de otoño el día y la noche duran unas 12 horas cada uno.",true,"Después de ese día los días se van acortando."],
       ["En el equinoccio de otoño el día dura casi 14 horas y media.",false,"Eso pasa en el solsticio de verano; en el equinoccio el día dura unas 12 horas."]]}),
  K("sol_invierno","d","🥶","Solsticio de invierno","El solsticio de invierno ocurre entre el 20 y el 23 de junio y marca el comienzo del invierno. Ese día el Sol sale por el noreste, al mediodía llega a su altura más baja del año y se pone por el noroeste: el arco es el más chico y el día el más corto (en 2026: sale a las 8:00 y se pone a las 17:50, ¡14 horas y 10 minutos de noche!).",{
   mc:[["¿Cómo se llama el día en que comienza el invierno?","Solsticio de invierno",["Equinoccio de invierno","Solsticio de verano","Equinoccio de otoño"]],
       ["¿Entre qué fechas ocurre el solsticio de invierno?","Entre el 20 y el 23 de junio",["Entre el 20 y el 23 de diciembre","Entre el 20 y el 23 de marzo","Entre el 20 y el 23 de septiembre"]],
       ["El día del solsticio de invierno, el arco que hace el Sol es…","El más chico del año",["El más grande del año","Igual que el del verano","Inexistente"]],
       ["En el solsticio de invierno hay…","14 horas y 10 minutos de noche",["12 horas de noche","9 horas y 50 minutos de noche","14 horas y media de noche"]]],
   vf:[["El día del solsticio de invierno es el día de menor duración del año.",true,"Es el día en que el arco del Sol es el más chico."],
       ["El día del solsticio de invierno el Sol sale por el sureste.",false,"Sale por el noreste y se pone por el noroeste."]]}),
  K("eq_primavera","d","🌼","Equinoccio de primavera","El equinoccio de primavera ocurre entre el 20 y el 23 de septiembre y marca el comienzo de la primavera. Ese día el Sol sale casi por el este y se pone casi por el oeste, y el día y la noche duran unas 12 horas cada uno (en 2026: salida a las 6:43 y puesta a las 18:50). Después, los días se van alargando.",{
   mc:[["¿Cómo se llama el día en que comienza la primavera?","Equinoccio de primavera",["Solsticio de primavera","Equinoccio de verano","Solsticio de verano"]],
       ["¿Entre qué fechas ocurre el equinoccio de primavera?","Entre el 20 y el 23 de septiembre",["Entre el 20 y el 23 de diciembre","Entre el 20 y el 23 de marzo","Entre el 20 y el 23 de junio"]],
       ["Después del equinoccio de primavera, los días…","Se van alargando",["Se van acortando","Quedan iguales todo el año","Duran exactamente 12 horas siempre"]]],
   vf:[["En el equinoccio de primavera el día y la noche duran unas 12 horas cada uno.",true,"Después de ese día los días se van alargando."],
       ["El equinoccio de primavera ocurre entre el 20 y el 23 de marzo.",false,"Ocurre entre el 20 y el 23 de septiembre; en marzo es el equinoccio de otoño."]]})
 ],
 tableros:[
  {titulo:"Cuándo empieza cada estación",cols:["Estación","Empieza"],pares:[["sol_verano","Verano","Alrededor del 21 de diciembre"],["eq_otono","Otoño","Alrededor del 20 de marzo"],["sol_invierno","Invierno","Alrededor del 21 de junio"],["eq_primavera","Primavera","Alrededor del 22 de septiembre"]]},
  {titulo:"Las temperaturas",cols:["Estación","Temperaturas"],pares:[["verano","Verano","Temperaturas elevadas"],["otono","Otoño","Van bajando después del verano"],["invierno","Invierno","Temperaturas generalmente bajas"],["primavera","Primavera","Van subiendo después del invierno"]]},
  {titulo:"Solsticios y equinoccios",cols:["Día","Qué pasa"],pares:[["sol_verano","Solsticio de verano","El arco más grande y el día más largo"],["sol_invierno","Solsticio de invierno","El arco más chico y el día más corto"],["eq_otono","Equinoccio de otoño","Día y noche de 12 horas; los días se acortan"],["eq_primavera","Equinoccio de primavera","Día y noche de 12 horas; los días se alargan"]]},
  {titulo:"Más sobre el año",cols:["Idea","Qué dice"],pares:[["ano","Un año","Se completa el ciclo de las estaciones"],["sombra_cambia","La sombra de un objeto fijo","Cambia de largo según la época"],["temperaturas","Las temperaturas durante el año","Hay meses de calor, de frío y templados"],["polos","Cerca de los polos","Días sin que salga el Sol y días sin que se ponga"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"cuadro",titulo:"📋 Cuadro de las estaciones"},
  {id:"dibujos",titulo:"🖼️ Dibujos",dibujos:["salidas","alturas","arboles"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 cuadro:{cols:["Verano","Otoño","Invierno","Primavera"],filas:[
  {t:"Empieza (más o menos)",v:["21 de diciembre","20 de marzo","21 de junio","22 de septiembre"]},
  {t:"Ese día se llama",v:["Solsticio de verano","Equinoccio de otoño","Solsticio de invierno","Equinoccio de primavera"]},
  {t:"Ese día el Sol sale por…",v:["el sureste","casi el este","el noreste","casi el este"]},
  {t:"Ese día el Sol se pone por…",v:["el suroeste","casi el oeste","el noroeste","casi el oeste"]},
  {t:"Cuánto dura ese día",v:["Casi 14 h y media (el más largo)","Unas 12 h, como la noche","Menos de 10 h (el más corto)","Unas 12 h, como la noche"]},
  {t:"El arco del Sol",v:["El más grande; después se achica","Se va achicando","El más chico; después se agranda","Se va agrandando"]},
  {t:"El Sol al mediodía",v:["En su posición más alta; después baja","Va bajando","En su posición más baja; después sube","Va subiendo"]},
  {t:"Las sombras",v:["Las más cortas del año","Más largas que en verano","Las más largas del año","Se van acortando"]},
  {t:"Días y noches",v:["Los días duran más que las noches","Los días duran menos que las noches","Los días duran menos que las noches","Los días duran más que las noches"]},
  {t:"Las temperaturas",v:["Elevadas","Menores que en verano","Bajas","Mayores que en invierno"]},
  {t:"Cada día…",v:["Dura unos 2 minutos menos","Dura unos 2 minutos menos","Dura unos 2 minutos más","Dura unos 2 minutos más"]}
 ]},
 mapa:{raiz:"Las estaciones del año",ramas:[
  {t:"El recorrido del Sol cambia durante el año",h:["Cambia cuánto tiempo está el Sol sobre el horizonte","Se nota en el largo de las sombras","Se nota en las temperaturas","Los días parecidos se agrupan en estaciones: verano, otoño, invierno y primavera"]},
  {t:"Verano (desde el 20-23 de diciembre)",h:["Solsticio de verano: el arco más grande y el día más largo","Sale por el sureste y se pone por el suroeste","Los días duran más que las noches","Sol alto, sombras cortas, temperaturas elevadas","Cada día dura unos 2 minutos menos"]},
  {t:"Otoño (desde el 20-23 de marzo)",h:["Equinoccio de otoño: día y noche de unas 12 horas","Sale casi por el este y se pone casi por el oeste; después, por el noreste y el noroeste","Los días duran menos que las noches; temperaturas menores","Cada día dura unos 2 minutos menos"]},
  {t:"Invierno (desde el 20-23 de junio)",h:["Solsticio de invierno: el arco más chico y el día más corto","Sale por el noreste y se pone por el noroeste","Los días duran menos que las noches; sombras largas; temperaturas bajas","Cada día dura unos 2 minutos más"]},
  {t:"Primavera (desde el 20-23 de septiembre)",h:["Equinoccio de primavera: día y noche de unas 12 horas","Sale casi por el este y se pone casi por el oeste; después, por el sureste y el suroeste","Los días duran más que las noches; temperaturas mayores que en invierno","Cada día dura unos 2 minutos más","Cuando el día es el más largo del año empieza un nuevo verano"]},
  {t:"Un año",h:["Se completa el ciclo de las cuatro estaciones","El ciclo se repite una y otra vez"]}
 ]}
});
})();
