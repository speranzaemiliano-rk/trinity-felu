// Sociales · tema «La organización de las colonias» (páginas 100 y 101 del libro). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada pieza del esquema «Las autoridades de las colonias» al tocarla (en la pantalla de estudio y como respuesta de las preguntas «Tocá en el esquema»)
INT.IDEAS.info.autoridades={
  rey:{t:"El rey de España",d:"Los reyes de España mandaron crear instituciones para ayudar a gobernar el extenso territorio de América. El virrey los representaba en las colonias."},
  consejo:{t:"Consejo de Indias",d:"Era una institución de España. Elaboraba todas las leyes para América y nombraba a los funcionarios que eran enviados allá."},
  casa:{t:"Casa de Contratación de Sevilla",d:"Era una institución de España. Controlaba la navegación y el comercio entre España y América: los viajeros y las mercancías pasaban primero por ella."},
  virrey:{t:"El virrey",d:"Era la autoridad máxima de cada virreinato y el representante del rey en las colonias. Contaba con la ayuda de las reales audiencias."},
  audiencias:{t:"Reales audiencias",d:"Ayudaban al virrey y administraban la justicia en América."},
  capitan:{t:"El capitán general",d:"Gobernaba una capitanía general, un territorio un poco más chico que un virreinato. Tenía poder militar."},
  cabildo:{t:"El cabildo",d:"Gobernaba la ciudad y se ocupaba de la seguridad, la limpieza de las calles, los mercados, los precios y los impuestos. Sus miembros se elegían entre los vecinos cada año."},
  vecinos:{t:"Los vecinos",d:"Entre ellos se elegían los miembros del cabildo. Pero no todas las personas podían votar: para ser vecino había que ser varón, español o descendiente de españoles, ser jefe de familia, tener casa y tener «sangre limpia» (así llamaban las autoridades a no tener origen indígena ni africano: una idea injusta)."}
};
INT.temaIdeas({
 area:"sociales",
 id:"colonias",nombre:"La organización de las colonias",ico:"🏛️",paginas:"páginas 100 y 101",
 es:"Cómo se gobernaban las colonias de España en América: instituciones, virreinatos, capitanías, virrey, audiencias y cabildos",
 grupos:[{id:"a",titulo:"Las instituciones en España"},{id:"b",titulo:"Cómo se dividió el territorio"},{id:"c",titulo:"Las autoridades en América"}],
 conceptos:[
  K("instituciones","a","👑","Instituciones para gobernar","España conquistó en América un territorio enorme. Para poder gobernarlo, los reyes de España mandaron crear instituciones que ayudaran en esa tarea. Según el libro, en España había dos que ayudaban a administrar las colonias: el Consejo de Indias y la Casa de Contratación de Sevilla.",{
   mc:[["¿Quiénes mandaron crear instituciones para ayudar a gobernar el territorio de América?","Los reyes de España",["Los virreyes","Los vecinos de cada ciudad","Los capitanes generales","Los miembros de los cabildos"]],
       ["Según el libro, ¿cuáles eran las instituciones de España que ayudaban a administrar las colonias de América?","El Consejo de Indias y la Casa de Contratación",["El Consejo de Indias y las reales audiencias","La Casa de Contratación y el cabildo","Las reales audiencias y el capitán general"]]],
   vf:[["Los reyes de España mandaron crear instituciones para ayudar a gobernar el territorio de América.",true,"Era un territorio muy extenso y hacía falta ayuda para gobernarlo."],
       ["Según el libro, en España había cinco instituciones que ayudaban a administrar las colonias de América.",false,"Según el libro eran dos: el Consejo de Indias y la Casa de Contratación de Sevilla."]],
   tocar:[["autoridades","Tocá en el esquema a quien mandó crear las instituciones para ayudar a gobernar América.","rey"]]}),
  K("consejo_indias","a","📜","El Consejo de Indias","El Consejo de Indias era una de las dos instituciones de España que ayudaban a administrar las colonias. Elaboraba todas las leyes para América y también nombraba a los funcionarios que eran enviados allá.",{
   mc:[["¿Qué institución de España elaboraba las leyes para América?","El Consejo de Indias",["La Casa de Contratación de Sevilla","Las reales audiencias","El capitán general"]],
       ["¿Quién nombraba a los funcionarios que eran enviados a América?","El Consejo de Indias",["La Casa de Contratación de Sevilla","El cabildo de cada ciudad","Los vecinos"]]],
   vf:[["El Consejo de Indias elaboraba las leyes que se aplicaban en América.",true,"Era la institución de España encargada de hacer todas las leyes para América."],
       ["El Consejo de Indias era el que controlaba la navegación y el comercio con América.",false,"Eso lo hacía la Casa de Contratación de Sevilla; el Consejo elaboraba las leyes."]],
   tipear:[["La institución de España que elaboraba las leyes para América se llamaba Consejo de… (una palabra).",["Indias","de Indias","las Indias","de las Indias","Consejo de Indias","Consejo de las Indias","el Consejo de Indias","el Consejo de las Indias"],"Empieza con I"]],
   tocar:[["autoridades","Tocá en el esquema la institución de España que elaboraba todas las leyes para América.","consejo"],
          ["autoridades","Tocá en el esquema la institución de España que nombraba a los funcionarios enviados a América.","consejo"]]}),
  K("casa_contratacion","a","🚢","La Casa de Contratación de Sevilla","La Casa de Contratación de Sevilla era la otra institución de España que ayudaba con las colonias. Controlaba la navegación y el comercio entre España y América: los viajeros y las mercancías que iban de un lado al otro tenían que pasar primero por ella.",{
   mc:[["¿Qué institución controlaba la navegación y el comercio entre España y América?","La Casa de Contratación de Sevilla",["El Consejo de Indias","Las reales audiencias","El capitán general"]],
       ["¿Por dónde tenían que pasar primero los viajeros y las mercancías entre España y América?","Por la Casa de Contratación de Sevilla",["Por el Consejo de Indias, en España","Por una de las reales audiencias de América","Por el cabildo de la ciudad de destino"]]],
   vf:[["La Casa de Contratación de Sevilla controlaba la navegación y el comercio entre España y América.",true,"Los viajeros y las mercancías pasaban primero por ella."],
       ["La Casa de Contratación de Sevilla elaboraba las leyes para América.",false,"Las leyes las elaboraba el Consejo de Indias; la Casa controlaba la navegación y el comercio."]],
   tipear:[["La Casa de Contratación llevaba el nombre de una ciudad de España. ¿Cuál? (Casa de Contratación de…)",["Sevilla","de Sevilla"],"Empieza con S"]],
   tocar:[["autoridades","Tocá en el esquema la institución que se ocupaba de controlar la navegación y el comercio entre España y América.","casa"],
          ["autoridades","Tocá en el esquema la institución por la que tenían que pasar primero los viajeros y las mercancías que iban a América.","casa"]]}),
  K("dificil_gobernar","b","🧩","Gobernar seguía siendo difícil","Aunque existían esas instituciones, a España todavía le costaba gobernar sus colonias. Entonces los reyes tomaron varias medidas para facilitar la tarea. Una fue dividir el territorio en virreinatos y, más adelante, se crearon otras divisiones, como las capitanías generales.",{
   mc:[["Además de crear el Consejo de Indias y la Casa de Contratación, ¿qué otra medida tomaron los reyes para gobernar mejor las colonias?","Dividir el territorio en virreinatos",["Unir todo el territorio en un solo virreinato","Dar todo el gobierno de las colonias a los cabildos","Prohibir que viajaran españoles a América"]],
       ["¿Cuál de estas fue una nueva división del territorio que se creó cuando las dificultades continuaron?","Las capitanías generales",["El Consejo de Indias","La Casa de Contratación de Sevilla","Los vecinos"]]],
   vf:[["Aun con el Consejo de Indias y la Casa de Contratación, seguía siendo difícil gobernar las colonias.",true,"Los reyes tomaron entonces varias medidas para facilitar la tarea."],
       ["Con las instituciones de España ya no hacía falta tomar otras medidas para gobernar las colonias.",false,"Gobernar seguía siendo difícil, y por eso los reyes tomaron varias medidas más."]],
   ordenar:[["Ordená lo que pasó para organizar el territorio de las colonias.",["España conquistó un territorio muy extenso en América","Los reyes mandaron crear instituciones para ayudar a gobernarlo","Aun así, gobernar las colonias seguía siendo difícil","Se dividió el territorio en virreinatos: al comienzo, sólo dos","Con el tiempo se crearon otras divisiones, como las capitanías generales"]]]}),
  K("virreinatos","b","🗺️","Los virreinatos","Un virreinato era un territorio de las colonias gobernado por un virrey. Dividir América en virreinatos fue una de las medidas de los reyes para gobernarla mejor. Al comienzo hubo únicamente dos: el de Nueva España y el del Perú.",{
   mc:[["¿Cuántos virreinatos hubo al comienzo en toda América?","Dos",["Uno","Tres","Cuatro","Cinco"]],
       ["¿Cuáles fueron los dos primeros virreinatos de América?","Nueva España y Perú",["Nueva España y Río de la Plata","Perú y Nueva Granada","Río de la Plata y Nueva Granada"]]],
   vf:[["Al comienzo hubo solamente dos virreinatos en toda América.",true,"Fueron el de Nueva España y el del Perú."],
       ["Cada virreinato estaba gobernado por un cabildo.",false,"Lo gobernaba un virrey; los cabildos gobernaban las ciudades."]],
   tipear:[["Cada territorio gobernado por un virrey se llamaba… (una palabra).",["virreinato","un virreinato","el virreinato","virreynato","un virreynato","el virreynato"],"Empieza con v"]]}),
  K("nueva_espana","b","🏙️","Virreinato de Nueva España","El Virreinato de Nueva España fue el primero de los dos virreinatos que hubo al comienzo. Se creó en 1535 y su capital era la Ciudad de México.",{
   mc:[["¿Cuál es el año de creación del Virreinato de Nueva España?","1535",["1542","1776","1782"]],
       ["¿Cuál era la capital del Virreinato de Nueva España?","La Ciudad de México",["Lima","Sevilla","Buenos Aires"]]],
   vf:[["El Virreinato de Nueva España se creó en 1535.",true,"Fue uno de los dos primeros virreinatos de América."],
       ["La capital del Virreinato de Nueva España era Lima.",false,"Su capital era la Ciudad de México; Lima era la capital del Virreinato del Perú."]],
   tipear:[["El Virreinato de Nueva España se creó en el año… (escribí el número).",["1535"],"Empieza con 15"],
           ["La capital del Virreinato de Nueva España era la Ciudad de… (una palabra).",["México","Ciudad de México","la Ciudad de México"],"Empieza con M"]]}),
  K("peru","b","🌆","Virreinato del Perú","El Virreinato del Perú fue el otro de los dos primeros virreinatos de América. Se creó en 1542, después del de Nueva España, y su capital era Lima.",{
   mc:[["¿Cuál es el año de creación del Virreinato del Perú?","1542",["1535","1776","1782"]],
       ["¿Cuál era la capital del Virreinato del Perú?","Lima",["La Ciudad de México","Sevilla","Buenos Aires"]]],
   vf:[["La capital del Virreinato del Perú era Lima.",true,"Fue uno de los dos primeros virreinatos; se creó en 1542."],
       ["El Virreinato del Perú se creó antes que el de Nueva España.",false,"Nueva España se creó en 1535 y el Perú en 1542, más tarde."]],
   tipear:[["El Virreinato del Perú se creó en el año… (escribí el número).",["1542"],"Empieza con 15"],
           ["La capital del Virreinato del Perú era… (una ciudad).",["Lima"],"Empieza con L"]]}),
  K("capitanias","b","🛡️","Capitanías generales","Las capitanías generales eran territorios un poco más chicos que los virreinatos. Se crearon más adelante, cuando seguía siendo difícil administrar los territorios. Solían coincidir con guarniciones militares o de frontera (lugares donde había tropas), y las gobernaba un capitán general, con poder militar.",{
   mc:[["¿Cómo se llamaba la autoridad que gobernaba una capitanía general?","El capitán general",["El virrey","El cabildo","El Consejo de Indias"]],
       ["¿Qué tipo de poder tenía el capitán general?","Poder militar",["Poder para elaborar las leyes","Poder para administrar la justicia","Poder para controlar el comercio con España"]],
       ["Comparadas con los virreinatos, ¿cómo eran las capitanías generales?","Un poco más pequeñas",["Más grandes","Del mismo tamaño","Abarcaban toda América"]]],
   vf:[["Una capitanía general estaba gobernada por un capitán general con poder militar.",true,"Eran territorios un poco más chicos que los virreinatos."],
       ["Las capitanías generales eran territorios más grandes que los virreinatos.",false,"Eran un poco más pequeñas que los virreinatos."]],
   tipear:[["La autoridad con poder militar que gobernaba una capitanía general era el… (dos palabras).",["capitán general","el capitán general"],"Empieza con c"]],
   tocar:[["autoridades","Tocá en el esquema a la autoridad con poder militar que gobernaba territorios un poco más chicos que los virreinatos.","capitan"]]}),
  K("virrey","c","🎩","El virrey","El virrey era la autoridad máxima de cada virreinato y el representante del rey en las colonias. Contaba con la ayuda de las reales audiencias.",{
   mc:[["¿Quién era la autoridad máxima de cada virreinato?","El virrey",["El capitán general","El cabildo","El Consejo de Indias"]],
       ["¿A quién representaba el virrey en las colonias?","Al rey",["A los vecinos","Al capitán general","A las reales audiencias"]]],
   vf:[["El virrey era la autoridad máxima de cada virreinato.",true,"Era el representante del rey en las colonias."],
       ["El virrey era la autoridad máxima de cada ciudad.",false,"Era la autoridad de un virreinato; las ciudades estaban gobernadas por cabildos."]],
   tipear:[["La autoridad máxima de cada virreinato, que representaba al rey, se llamaba… (una palabra).",["virrey","el virrey"],"Empieza con v"]],
   tocar:[["autoridades","Tocá en el esquema a la autoridad máxima de cada virreinato.","virrey"],
          ["autoridades","Tocá en el esquema a quien el virrey representaba en las colonias.","rey"]]}),
  K("audiencias","c","⚖️","Las reales audiencias","Las reales audiencias eran las encargadas de administrar la justicia en América. Eran la ayuda del virrey, la autoridad máxima de cada virreinato.",{
   mc:[["¿Qué administraban las reales audiencias en América?","La justicia",["El comercio entre España y América","Los mercados de la ciudad","La defensa militar del territorio"]],
       ["¿Qué autoridad ayudaba al virrey y administraba la justicia en América?","Las reales audiencias",["El Consejo de Indias","La Casa de Contratación de Sevilla","El capitán general"]]],
   vf:[["Las reales audiencias ayudaban al virrey.",true,"Además, administraban la justicia en América."],
       ["Las reales audiencias elaboraban las leyes para América.",false,"Esa tarea era del Consejo de Indias; las audiencias administraban la justicia."]],
   tipear:[["Las reales audiencias administraban la… (una palabra).",["justicia","la justicia"],"Empieza con j"]],
   tocar:[["autoridades","Tocá en el esquema a quienes ayudaban al virrey y administraban la justicia en América.","audiencias"]]}),
  K("cabildos","c","🏘️","Los cabildos","Las ciudades de las colonias estaban gobernadas por los cabildos. Los miembros de cada cabildo se elegían entre los vecinos, una vez por año.",{
   mc:[["¿Quiénes gobernaban las ciudades en las colonias?","Los cabildos",["Los virreyes","Los capitanes generales","Las reales audiencias"]],
       ["¿Cada cuánto tiempo se elegían los miembros del cabildo?","Una vez al año",["Todos los meses","Cada diez años","Una sola vez en la vida"]],
       ["¿Entre quiénes se elegían los miembros del cabildo?","Entre los vecinos",["Entre los virreyes","Entre los capitanes generales","Entre los funcionarios del Consejo de Indias"]]],
   vf:[["Las ciudades de las colonias estaban gobernadas por cabildos.",true,"Sus miembros se elegían entre los vecinos."],
       ["Los miembros del cabildo eran nombrados por el rey y no se elegían.",false,"Se elegían entre los vecinos, una vez por año."]],
   tipear:[["Las ciudades de las colonias estaban gobernadas por los… (una palabra).",["cabildos","los cabildos","cabildo","el cabildo"],"Empieza con c"]],
   tocar:[["autoridades","Tocá en el esquema a quienes gobernaban las ciudades de las colonias.","cabildo"]]}),
  K("vecinos","c","🏠","Los vecinos","Los miembros del cabildo se elegían entre los vecinos, pero no todas las personas podían votar. Para ser considerado vecino había que ser varón, español o descendiente de españoles, ser jefe de familia, tener casa y tener «sangre limpia»: así llamaban las autoridades a no tener origen indígena ni africano. Era una idea injusta: dejaba afuera a muchas personas por su origen.",{
   mc:[["Según el libro, ¿cuál de estas personas podía ser vecino?","Un varón español, jefe de familia y con casa",["Una mujer española, jefa de familia y con casa","Un varón indígena, jefe de familia y con casa","Un varón español, jefe de familia y sin casa"]],
       ["¿Cuál de estas condiciones se pedía para ser vecino?","Ser jefe de familia",["Ser mujer","Tener origen indígena","Tener origen africano"]],
       ["Las autoridades pedían «sangre limpia» para ser vecino. ¿Qué significaba?","No tener origen indígena ni africano",["Ser dueño de una casa","Ser jefe de familia","Haber nacido en España"]]],
   vf:[["En las ciudades coloniales todas las personas podían votar para elegir el cabildo.",false,"No todas podían votar: había que ser considerado vecino, y eso exigía varios requisitos."],
       ["Para ser vecino había que ser varón y tener casa, entre otros requisitos.",true,"También había que ser español o descendiente de españoles, jefe de familia y tener «sangre limpia»."],
       ["Según el libro, una mujer española que fuera jefa de familia y tuviera casa podía ser vecina.",false,"Había que ser varón, además de cumplir los otros requisitos."]],
   tipear:[["Para ser vecino había que ser jefe de… (una palabra).",["familia","de familia"],"Empieza con f"]],
   tocar:[["autoridades","Tocá en el esquema al grupo de personas entre las que se elegían los miembros del cabildo.","vecinos"],
          ["autoridades","Tocá en el esquema al grupo que debía ser varón, jefe de familia y tener una casa, entre otros requisitos.","vecinos"]]}),
  K("funciones_cabildo","c","🧹","Qué hacía el cabildo","El cabildo se ocupaba de la vida de la ciudad: de que las calles estuvieran limpias, de la seguridad, de cuidar los mercados y de controlar los precios. Además, recaudaba impuestos y resolvía los problemas que había entre los vecinos.",{
   mc:[["¿De cuál de estas tareas se ocupaba el cabildo?","De la limpieza de las calles",["De elaborar las leyes para América","De vigilar la navegación hacia América","De nombrar a los funcionarios enviados a América"]],
       ["¿Qué autoridad se ocupaba de los impuestos de la ciudad y de los problemas entre los vecinos?","El cabildo",["La Casa de Contratación de Sevilla","El Consejo de Indias","El capitán general"]]],
   vf:[["El cabildo se ocupaba de la seguridad de la ciudad.",true,"También cuidaba los mercados y controlaba los precios."],
       ["El cabildo se ocupaba de controlar el comercio entre España y América.",false,"Eso lo hacía la Casa de Contratación de Sevilla; el cabildo se ocupaba de la vida de la ciudad."]],
   tipear:[["Una de las tareas del cabildo era recaudar… (una palabra).",["impuestos","los impuestos"],"Empieza con i"]],
   tocar:[["autoridades","Tocá en el esquema a la autoridad que se ocupaba de la seguridad, la limpieza de las calles, los mercados y los precios de la ciudad.","cabildo"]]}),
  K("cabildo_abierto","c","📢","El Cabildo Abierto","Cuando había una situación de emergencia, se hacía un Cabildo Abierto. Era una reunión de todos los vecinos, donde se tomaban decisiones.",{
   mc:[["¿Quiénes acudían a un Cabildo Abierto?","Todos los vecinos",["Sólo los miembros del cabildo","Sólo el virrey y las reales audiencias","Sólo los funcionarios enviados desde España"]],
       ["¿Cuándo se hacía un Cabildo Abierto?","Cuando ocurría una emergencia",["Todos los días","Una vez por semana","Cada diez años"]],
       ["¿Para qué acudían los vecinos a un Cabildo Abierto?","Para tomar decisiones",["Para elaborar las leyes de América","Para controlar el comercio con España","Para administrar la justicia en América"]]],
   vf:[["A un Cabildo Abierto acudían todos los vecinos.",true,"Se hacía cuando había una situación de emergencia."],
       ["En un Cabildo Abierto sólo participaban los miembros del cabildo.",false,"Participaban todos los vecinos en la toma de decisiones."]],
   tipear:[["Cuando había una emergencia, se hacía una reunión de todos los vecinos llamada Cabildo… (una palabra).",["abierto","cabildo abierto","el cabildo abierto"],"Empieza con A"]],
   ordenar:[["Ordená lo que pasaba cuando ocurría una emergencia.",["Sucedía una situación de emergencia","Se llamaba a un Cabildo Abierto","Acudían todos los vecinos","Los vecinos tomaban decisiones"]]]}),
  K("cabildos_historicos","c","🏰","Cabildos Monumento Histórico","En la Argentina hay cinco cabildos de la época colonial declarados Monumento Histórico Nacional: los de Buenos Aires, Luján, Córdoba, Salta y Jujuy. El de Buenos Aires está en nuestra ciudad. El libro dice que el Cabildo de Salta se cuenta entre los pocos cabildos coloniales que sobrevivieron.",{
   mc:[["¿Cuál de estas ciudades tiene un cabildo colonial declarado Monumento Histórico Nacional?","Luján",["Rosario","Posadas","Bahía Blanca"]],
       ["Según el libro, ¿qué se sabe del Cabildo de Salta?","Se cuenta entre los pocos cabildos coloniales que sobrevivieron",["Es el único cabildo colonial que sobrevivió","Se construyó después de la época colonial","Está en la Ciudad de Buenos Aires"]]],
   vf:[["En la Argentina hay cinco cabildos coloniales declarados Monumento Histórico Nacional.",true,"Son los de Buenos Aires, Luján, Córdoba, Salta y Jujuy."],
       ["El Cabildo de Salta es el único cabildo que sobrevivió desde la época colonial.",false,"Se cuenta entre los pocos que sobrevivieron, pero no es el único."]],
   tipear:[["¿Cuántos cabildos coloniales de la Argentina fueron declarados Monumento Histórico Nacional? (escribí el número)",["5","cinco"],"Es un número menor que diez"]]})
 ],
 tableros:[
  {titulo:"¿Quién hacía qué?",cols:["Autoridad","Qué hacía"],pares:[["consejo_indias","Consejo de Indias","Elaboraba las leyes para América"],["casa_contratacion","Casa de Contratación de Sevilla","Controlaba la navegación y el comercio con América"],["virrey","El virrey","Era la autoridad máxima de un virreinato"],["audiencias","Las reales audiencias","Administraban la justicia en América"],["capitanias","El capitán general","Gobernaba una capitanía con poder militar"]]},
  {titulo:"Virreinatos y capitanías",cols:["Tema","Qué dice"],pares:[["dificil_gobernar","Una medida de los reyes","Dividir el territorio en virreinatos"],["virreinatos","Virreinatos al comienzo","Sólo dos en toda América"],["nueva_espana","Virreinato de Nueva España","Creado en 1535 · capital: Ciudad de México"],["peru","Virreinato del Perú","Creado en 1542 · capital: Lima"],["capitanias","Capitanías generales","Un poco más chicas que los virreinatos"]]},
  {titulo:"El cabildo",cols:["Pregunta o tema","Respuesta"],pares:[["cabildos","¿Quiénes gobernaban cada ciudad?","Los cabildos"],["vecinos","¿Entre quiénes se elegía el cabildo?","Entre los vecinos"],["funciones_cabildo","Tareas del cabildo","Seguridad, limpieza, mercados, precios e impuestos"],["cabildo_abierto","El Cabildo Abierto","Reunión de todos los vecinos ante una emergencia"],["cabildos_historicos","Cabildos Monumento Histórico Nacional","Cinco: Buenos Aires, Luján, Córdoba, Salta y Jujuy"]]},
  {titulo:"¿Quién gobernaba dónde?",cols:["Dónde","Quién gobernaba o ayudaba"],pares:[["instituciones","En España, para ayudar con las colonias","El Consejo de Indias y la Casa de Contratación"],["virrey","En cada virreinato","El virrey"],["capitanias","En una capitanía general","El capitán general"],["cabildos","En cada ciudad","El cabildo"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"cuadro",titulo:"📋 Cuadro: quién hacía qué"},
  {id:"dibujos",titulo:"🖼️ Esquema de autoridades",dibujos:["autoridades"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 cuadro:{cols:["Dónde actuaba","Qué hacía"],filas:[
  {t:"Consejo de Indias",v:["En España","Elaboraba todas las leyes para América y nombraba a los funcionarios que eran enviados allá"]},
  {t:"Casa de Contratación de Sevilla",v:["En España (Sevilla)","Controlaba la navegación y el comercio entre España y América: los viajeros y las mercancías pasaban primero por ella"]},
  {t:"Virrey",v:["En cada virreinato","Era la autoridad máxima y el representante del rey en las colonias"]},
  {t:"Reales audiencias",v:["En América, ayudando al virrey","Administraban la justicia"]},
  {t:"Capitán general",v:["En una capitanía general","Gobernaba ese territorio, un poco más chico que un virreinato, con poder militar"]},
  {t:"Cabildo",v:["En cada ciudad","Gobernaba la ciudad: seguridad, limpieza de las calles, mercados, precios, impuestos y problemas entre vecinos; sus miembros se elegían entre los vecinos cada año"]}
 ]},
 mapa:{raiz:"La organización de las colonias",ramas:[
  {t:"Instituciones en España",h:["Los reyes mandaron crear instituciones para gobernar un territorio muy extenso","Consejo de Indias: elaboraba las leyes y nombraba a los funcionarios enviados a América","Casa de Contratación de Sevilla: se ocupaba de controlar la navegación y el comercio con América"]},
  {t:"El territorio se divide",h:["Aun con las instituciones, era difícil gobernar: los reyes tomaron medidas","Virreinatos: al comienzo sólo dos, Nueva España y Perú","Nueva España: 1535, capital Ciudad de México","Perú: 1542, capital Lima","Capitanías generales: un poco más chicas, con capitán general y poder militar"]},
  {t:"Las autoridades de cada virreinato",h:["El virrey: autoridad máxima y representante del rey en las colonias","Las reales audiencias: ayudaban al virrey y administraban la justicia"]},
  {t:"El cabildo",h:["Gobernaba la ciudad","Sus miembros se elegían entre los vecinos una vez por año","Cuidaba la seguridad, la limpieza de las calles, los mercados y los precios","Recaudaba impuestos y resolvía problemas entre vecinos"]},
  {t:"Los vecinos y el Cabildo Abierto",h:["Para ser vecino: varón, español o descendiente de españoles, con casa y jefe de familia","«Sangre limpia»: así llamaban las autoridades a no tener origen indígena ni africano (una idea injusta)","No todas las personas podían votar","Cabildo Abierto: reunión de todos los vecinos ante una emergencia"]},
  {t:"Cabildos que quedan",h:["Hay cinco cabildos coloniales declarados Monumento Histórico Nacional","Buenos Aires, Luján, Córdoba, Salta y Jujuy","El libro dice que el Cabildo de Salta se cuenta entre los pocos cabildos coloniales que sobrevivieron"]}
 ]}
});
})();
