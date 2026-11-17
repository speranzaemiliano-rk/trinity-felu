// Sociales · tema 4: «Las Reformas borbónicas y el Virreinato del Río de la Plata» (páginas 104 y 105 del libro; la línea de tiempo usa además dos fechas de la página 100). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada año de la línea de tiempo al tocarlo (1535 y 1542 son de la página 100; el resto, de las páginas 104 y 105)
INT.IDEAS.info.linea={
  t1535:{t:"1535 · Virreinato de Nueva España",d:"Nació el Virreinato de Nueva España y su capital fue la Ciudad de México. Fue uno de los dos primeros virreinatos de toda América."},
  t1542:{t:"1542 · Virreinato del Perú",d:"Nació el Virreinato del Perú, con capital en Lima. Junto con el de Nueva España, fue uno de los dos primeros."},
  t1700:{t:"1700 · Empiezan a reinar los Borbones",d:"Empezó a reinar en España la familia de los Borbones. Hicieron las Reformas borbónicas para tener más control sobre los territorios."},
  t1717:{t:"1717 · Virreinato de Nueva Granada",d:"Nació uno de los dos virreinatos nuevos de los Borbones. Antes de ser virreinato, Nueva Granada había sido una capitanía."},
  t1776:{t:"1776 · Virreinato del Río de la Plata",d:"Los Borbones crearon un virreinato más, con capital en Buenos Aires. Abarcaba, total o parcialmente, Argentina, Uruguay, Paraguay y Bolivia."},
  t1782:{t:"1782 · Ocho intendencias",d:"Los Borbones repartieron en ocho intendencias la zona del Río de la Plata, que ya era virreinato desde 1776. Las gobernaban intendentes."}
};
// lo que dice cada país del mapa al tocarlo: el libro nombra a Argentina, Uruguay, Paraguay y Bolivia como los países de hoy que el virreinato abarcaba, total o parcialmente
INT.IDEAS.info.virreinato={
  argentina:{t:"Argentina",d:"En este país está Buenos Aires, la ciudad que fue capital del virreinato y donde vivía el virrey. El virreinato abarcaba el territorio de este país, total o parcialmente."},
  uruguay:{t:"Uruguay",d:"El libro lo nombra entre los países de hoy cuyo territorio abarcaba el virreinato, total o parcialmente."},
  paraguay:{t:"Paraguay",d:"El libro lo nombra entre los países de hoy cuyo territorio abarcaba el virreinato, total o parcialmente."},
  bolivia:{t:"Bolivia",d:"El libro lo nombra entre los países de hoy cuyo territorio abarcaba el virreinato, total o parcialmente."},
  chile:{t:"Chile",d:"Según el libro, una de las capitanías que crearon los Borbones se llamaba Chile. En el mapa de estudio no está pintado porque el libro no lo nombra entre los países de hoy que el virreinato abarcaba."},
  brasil:{t:"Brasil",d:"El libro no nombra a Brasil entre los países de hoy que el virreinato abarcaba, total o parcialmente. Por eso, en el mapa de estudio no está pintado."}
};
INT.temaIdeas({
 area:"sociales",
 id:"borbones",nombre:"Los Borbones y el Virreinato del Río de la Plata",ico:"👑",paginas:"páginas 104 y 105",
 es:"Los cambios que hicieron los Borbones en las colonias de América y el nacimiento del virreinato con capital en Buenos Aires",
 grupos:[{id:"a",titulo:"Los Borbones y sus reformas"},{id:"b",titulo:"El Virreinato del Río de la Plata"}],
 conceptos:[
  K("dos_primeros_virreinatos","a","🏰","Antes de los Borbones: dos virreinatos","Al principio sólo hubo dos virreinatos en toda América. El de Nueva España nació en 1535 y su capital era la Ciudad de México. El del Perú nació en 1542 y su capital era Lima. Más tarde se sumaron otras divisiones.",{
   mc:[["¿Cuántos virreinatos hubo en América al principio?","Dos",["Uno","Tres","Cuatro"]],
       ["¿Cuál de estos fue uno de los dos primeros virreinatos de América?","Nueva España",["Nueva Granada","Río de la Plata","Chile"]],
       ["¿En qué ciudad estaba la capital del Virreinato del Perú, uno de los dos primeros?","Lima",["Ciudad de México","Buenos Aires","Sevilla"]]],
   vf:[["El Virreinato del Perú nació en 1542 y su capital era Lima.",true,"El de Nueva España había nacido antes, en 1535."],
       ["Los dos primeros virreinatos de América tuvieron su capital en Buenos Aires.",false,"Sus capitales eran la Ciudad de México (Nueva España) y Lima (Perú); Buenos Aires fue capital de un virreinato posterior."]],
   tipear:[["La capital del Virreinato del Perú era… (escribí el nombre de la ciudad).",["lima","la ciudad de lima"],"Empieza con L"]],
   tocar:[["linea","Tocá en la línea el año en que se creó el Virreinato de Nueva España.","t1535"],
          ["linea","Tocá en la línea el año en que se creó el Virreinato del Perú.","t1542"]]}),
  K("borbones","a","👑","Los Borbones y las reformas","Desde el año 1700 el trono de España quedó en manos de los Borbones, una familia nueva. Esos reyes impulsaron varios cambios, las Reformas borbónicas, en la forma de administrar las colonias españolas de América.",{
   mc:[["¿En qué año empezó a reinar en España la familia de los Borbones?","1700",["1535","1717","1776"]],
       ["¿Quiénes hicieron las Reformas borbónicas?","Los reyes Borbones de España",["Los virreyes de América","Los cabildos de las ciudades","Los jesuitas de las misiones"]],
       ["¿Qué fueron las Reformas borbónicas?","Cambios en la administración de las colonias",["Una orden religiosa que evangelizaba a los indígenas","Una reunión de todos los vecinos en una emergencia","Un impuesto que pagaban los indígenas a los españoles"]]],
   vf:[["Los Borbones empezaron a reinar en España en el año 1776.",false,"Empezaron a reinar en 1700; en 1776 se creó un virreinato nuevo, el del Río de la Plata."],
       ["Las Reformas borbónicas cambiaron la manera de administrar las colonias de América.",true,"Eran cambios para tener más control sobre los territorios."]],
   tocar:[["linea","Tocá en la línea el año en que empezó a reinar en España la familia de los Borbones.","t1700"]]}),
  K("por_que_reformas","a","🎯","¿Para qué hicieron las reformas?","Los Borbones querían tener más control sobre los territorios de América. Algunas personas no pagaban impuestos, había contrabando y hacía falta defender las colonias frente a países como Inglaterra y Portugal, que querían avanzar sobre ellas.",{
   mc:[["¿Para qué hicieron los Borbones las reformas en las colonias?","Para tener más control sobre los territorios",["Para que los jesuitas tuvieran más poder","Para dejar de cobrar impuestos","Para que los criollos ocuparan los cargos más importantes"]],
       ["Los Borbones debían defender las colonias de otros países que querían quedarse con ellas. ¿De cuáles, por ejemplo?","Inglaterra y Portugal",["Chile y Cuba","Perú y Nueva España","Paraguay y Bolivia"]]],
   vf:[["Uno de los motivos de las reformas era que algunas personas no pagaban impuestos.",true,"Era una de las razones, junto con el contrabando y el avance de otros países."],
       ["El contrabando era el único motivo de las reformas de los Borbones.",false,"Había más motivos: algunas personas no pagaban impuestos y había que proteger los territorios de otros países."]]}),
  K("contrabando","a","📦","El contrabando","El contrabando es comerciar de forma ilegal. Algunos españoles residentes en América comerciaban con otros países a escondidas de España. Era uno de los problemas que los Borbones querían resolver con las reformas.",{
   mc:[["¿Qué es el contrabando?","Comerciar de forma ilegal",["Un impuesto nuevo de los Borbones","Un cargo para españoles de España","Una división dentro de un virreinato"]],
       ["¿Con quiénes comerciaban a escondidas de España algunos españoles de América?","Con otros países",["Con la Casa de Contratación","Con el Consejo de Indias","Con las reales audiencias"]]],
   vf:[["El contrabando era comerciar con permiso de España.",false,"Era comerciar de forma ilegal, a escondidas de España."],
       ["Los Borbones querían frenar el contrabando.",true,"Era uno de los problemas que los llevaron a hacer las reformas."]],
   tipear:[["El comercio ilegal se llama… (una palabra).",["contrabando","el contrabando"],"Empieza con c"]]}),
  K("nuevos_virreinatos","a","🌎","Los dos virreinatos nuevos","Como parte de las reformas, los Borbones crearon dos virreinatos más. En 1717 nació el de Nueva Granada, que había sido una capitanía. En 1776 nació el del Río de la Plata. Así se sumaron a los dos primeros: Nueva España y Perú.",{
   mc:[["¿Cuáles son los dos virreinatos que crearon los Borbones?","Nueva Granada y Río de la Plata",["Nueva España y Perú","Nueva España y Río de la Plata","Perú y Nueva Granada"]],
       ["Antes de ser virreinato, Nueva Granada era…","Una capitanía",["Una intendencia","Una reducción jesuítica","Un cabildo"]]],
   vf:[["En 1717 nació el Virreinato de Nueva Granada, una creación de los Borbones.",true,"Y en 1776 crearon otro virreinato, el del Río de la Plata."],
       ["El Virreinato de Nueva España fue uno de los dos virreinatos nuevos de los Borbones.",false,"Nueva España existía desde antes; los virreinatos nuevos fueron Nueva Granada y Río de la Plata."]],
   tipear:[["El Virreinato de Nueva Granada se creó en el año… (escribí el número).",["1717"],"Es un número de cuatro cifras"]],
   ordenar:[["Ordená estos hechos, del más antiguo al más nuevo.",["1535: nace el Virreinato de Nueva España","1542: nace el Virreinato del Perú","1700: empiezan a reinar los Borbones en España","1717: nace el Virreinato de Nueva Granada","1776: nace el virreinato con capital en Buenos Aires","1782: la zona del Río de la Plata se divide en ocho intendencias"]]],
   tocar:[["linea","Tocá en la línea el año en que se creó el Virreinato de Nueva Granada.","t1717"]]}),
  K("nuevas_capitanias","a","⚔️","Nuevas capitanías","Según el libro, los Borbones también crearon capitanías generales, como las de Chile, Cuba, Venezuela y Guatemala. Una capitanía era un territorio un poco más chico que un virreinato, que solía coincidir con guarniciones militares o de frontera (lugares donde había tropas). Su gobernante era el capitán general, con poder militar.",{
   mc:[["Según el libro, ¿cuál de estas fue una capitanía creada por los Borbones?","Chile",["Perú","Nueva España","Río de la Plata"]],
       ["¿Quién gobernaba una capitanía general?","Un capitán general, con poder militar",["Un virrey, el representante del rey","Un intendente enviado desde España","El cabildo, elegido entre los vecinos"]]],
   vf:[["Según el libro, Chile, Cuba, Venezuela y Guatemala fueron capitanías creadas por los Borbones.",true,"Una capitanía era un territorio un poco más chico que un virreinato."],
       ["Chile fue uno de los dos virreinatos nuevos que crearon los Borbones.",false,"Chile fue una capitanía; los virreinatos nuevos fueron Nueva Granada y Río de la Plata."]],
   tocar:[["virreinato","Según el libro, los Borbones crearon una capitanía que se llamaba igual que uno de estos países de hoy. Tocá ese país en el mapa.","chile"]]}),
  K("intendencias","a","🗂️","Las intendencias","Dentro de cada virreinato, los Borbones crearon todavía más subdivisiones: las intendencias. Eran grandes divisiones, aunque más chicas que un virreinato, y servían para que el gobierno tuviera más control sobre cada zona.",{
   mc:[["¿Qué eran las intendencias?","Subdivisiones más chicas dentro de cada virreinato",["Los virreinatos nuevos de los Borbones","Comunidades de indígenas con los jesuitas","Reuniones de todos los vecinos en una emergencia"]],
       ["¿Para qué crearon los Borbones las intendencias?","Para que el gobierno controlara más cada zona",["Para que el gobierno tuviera menos control","Para unir todos los virreinatos en uno solo","Para que los jesuitas gobernaran cada región"]]],
   vf:[["Las intendencias eran subdivisiones dentro de un virreinato.",true,"Los Borbones las crearon para aumentar el control sobre territorios más chicos."],
       ["Las intendencias eran más grandes que los virreinatos.",false,"Eran subdivisiones dentro de cada virreinato, o sea, más chicas."]]}),
  K("nuevos_impuestos","a","💰","Nuevos impuestos","Los Borbones pusieron nuevos impuestos en las colonias y así pudieron recaudar más riquezas. Era una de las reformas.",{
   mc:[["¿Qué reforma de los Borbones les permitió recaudar más riquezas en las colonias?","Imponer nuevos impuestos",["Fundar misiones jesuíticas","Crear la capitanía de Chile","Reservar los cargos para españoles de España"]]],
   vf:[["Con los nuevos impuestos, los Borbones aumentaron lo que recaudaban en las colonias.",true,"Fue una de las reformas."],
       ["Los Borbones bajaron los impuestos en las colonias.",false,"Al revés: impusieron nuevos impuestos para recaudar más riquezas."]],
   tipear:[["Para recaudar más riquezas, los Borbones impusieron nuevos… (una palabra).",["impuestos","los impuestos","nuevos impuestos"],"Empieza con i"]]}),
  K("expulsion_jesuitas","a","⛪","La expulsión de los jesuitas","Los Borbones expulsaron a los jesuitas, una orden religiosa, de España y de América. Los jesuitas habían juntado mucho poder e influencia en el continente y a los reyes no les gustaba. San Ignacio Miní, en la provincia de Misiones, conserva ruinas jesuíticas: un lugar pensado para evangelizar a los guaraníes.",{
   mc:[["¿Qué decidieron los Borbones sobre los jesuitas?","Expulsarlos de España y de América",["Expulsarlos sólo de España","Expulsarlos sólo de América","Darles los cargos más importantes"]],
       ["¿Por qué a los Borbones no les gustaba la situación de los jesuitas?","Habían acumulado mucho poder e influencia en América",["Tenían muy poco poder e influencia en América","Rechazaban la religión católica y no la enseñaban","Se negaban a evangelizar a los indígenas"]]],
   vf:[["Los jesuitas fueron expulsados de España y de América por los Borbones.",true,"Era una orden religiosa con mucho poder e influencia, y a los reyes no les agradaba."],
       ["A los Borbones les gustaba que los jesuitas tuvieran tanto poder e influencia.",false,"No les agradaba esa situación y por eso los expulsaron."],
       ["San Ignacio Miní, con sus ruinas jesuíticas, queda en la provincia de Misiones.",true,"Fue un espacio pensado para evangelizar a los guaraníes."]],
   tipear:[["Los Borbones expulsaron a una orden religiosa con mucho poder: los… (una palabra).",["jesuitas","los jesuitas"],"Empieza con j"]]}),
  K("cargos_peninsulares","a","🎩","Cargos importantes para españoles nacidos en España","Los Borbones entregaron los puestos de mayor importancia en el gobierno de las colonias a españoles nacidos en España. Los criollos, que habían nacido en América, no podían ocuparlos, y eso creó un gran descontento.",{
   mc:[["¿A quiénes entregaron los Borbones los cargos de mayor importancia en el gobierno de las colonias?","A españoles nacidos en España",["A los criollos nacidos en América","A los indígenas de cada región","A los jesuitas de las misiones"]],
       ["Los criollos no podían ocupar los cargos de mayor importancia en el gobierno de las colonias. ¿Cómo reaccionaron?","Con gran descontento",["Con gran alegría","Con gran tranquilidad","Con gran orgullo"]]],
   vf:[["Los criollos podían ocupar los cargos de mayor importancia en el gobierno de las colonias.",false,"Esos cargos eran para españoles nacidos en España; los criollos quedaron afuera."],
       ["Los puestos de mayor importancia en las colonias quedaron en manos de españoles nacidos en España.",true,"Los criollos no podían ocuparlos y por eso estaban muy descontentos."]]}),
  K("rio_plata_causas","b","🔍","¿Por qué se creó el nuevo virreinato?","Los territorios coloniales eran tan extensos que a España le costaba controlarlos. Algunos españoles de América hacían contrabando, Inglaterra y Portugal querían apoderarse de las colonias y los Borbones querían que las colonias dieran más riquezas a España y controlarlas con más firmeza. Por eso hicieron reformas, y una de ellas fue crear virreinatos nuevos, entre ellos el del Río de la Plata.",{
   mc:[["¿Por qué le resultaba tan difícil a España controlar sus colonias en América?","Porque los territorios eran muy extensos",["Porque los territorios eran muy pequeños","Porque los criollos ocupaban los cargos más importantes","Porque España no enviaba ningún funcionario a América"]],
       ["¿Qué querían los reyes Borbones que hicieran las colonias?","Que dieran más riquezas a España",["Que dejaran de pagar impuestos","Que comerciaran libremente con otros países","Que se gobernaran sin ayuda de España"]]],
   vf:[["Inglaterra y Portugal querían quedarse con territorios coloniales de España.",true,"Por eso había que proteger los territorios: era uno de los motivos de las reformas."],
       ["Controlar las colonias era fácil para España porque los territorios eran pequeños.",false,"Eran tan extensos que controlarlos era muy difícil."]]}),
  K("rio_plata_1776","b","📅","Virreinato del Río de la Plata (1776)","En 1776 los Borbones crearon un virreinato más: el del Río de la Plata. Su territorio abarcaba, total o parcialmente, lo que hoy es Argentina, Uruguay, Paraguay y Bolivia.",{
   mc:[["¿En qué año se creó el virreinato con capital en Buenos Aires?","1776",["1717","1782","1700"]],
       ["Según el libro, ¿cuál de estos países de hoy estaba incluido, total o parcialmente, en el virreinato?","Paraguay",["Cuba","Venezuela","Guatemala"]]],
   vf:[["El virreinato con capital en Buenos Aires se creó en el año 1782.",false,"Se creó en 1776; en 1782 se lo dividió en ocho intendencias."],
       ["Bolivia es uno de los países de hoy que el virreinato abarcaba, total o parcialmente.",true,"Los otros son Argentina, Uruguay y Paraguay."]],
   tipear:[["Según el libro, el virreinato abarcaba, total o parcialmente, Argentina, Paraguay, Bolivia y… (escribí el país que falta).",["uruguay","el uruguay"],"Empieza con U"]],
   ordenar:[["Ordená estos hechos del más antiguo al más nuevo.",["1700: empiezan a reinar los Borbones en España","1776: nace el virreinato con capital en Buenos Aires","1782: se crean ocho intendencias en la zona del Río de la Plata"]]],
   tocar:[["linea","Tocá en la línea el año en que se creó el Virreinato del Río de la Plata.","t1776"]]}),
  K("capital_buenos_aires","b","🏙️","Buenos Aires, la capital","Buenos Aires fue escogida como capital del virreinato creado en 1776: ahí vivía el virrey, la autoridad más importante. Se la eligió por ser un lugar estratégico, con un puerto desde el que se podía vigilar el comercio, frenar el contrabando y protegerse de ingleses y portugueses.",{
   mc:[["¿Qué ciudad fue elegida como capital del virreinato creado en 1776?","Buenos Aires",["Lima","Ciudad de México","Sevilla"]],
       ["¿Por qué se eligió Buenos Aires como capital?","Por ser un lugar estratégico, con un puerto",["Porque allí funcionaba el Consejo de Indias","Porque allí funcionaba la Casa de Contratación","Porque allí vivía el rey de España"]]],
   vf:[["Buenos Aires se eligió como capital porque tenía un puerto y era un lugar estratégico.",true,"Con el puerto se podía vigilar el comercio, frenar el contrabando y defenderse de ingleses y portugueses."],
       ["El virrey del virreinato con capital en Buenos Aires vivía en Lima.",false,"Vivía en Buenos Aires; Lima era la capital del Virreinato del Perú."]],
   tocar:[["virreinato","Tocá el país de hoy donde estaba la ciudad capital del Virreinato del Río de la Plata.","argentina"]]}),
  K("buenos_aires_crece","b","📈","Buenos Aires empieza a crecer","Buenos Aires empezó a crecer cuando pasó a ser, a la vez, la capital del virreinato y un puerto autorizado. Allí vivía el virrey y su puerto servía para controlar el comercio.",{
   mc:[["¿Qué hizo que Buenos Aires empezara a crecer?","Ser a la vez capital del virreinato y puerto autorizado",["Ser a la vez sede del Consejo de Indias y de la Casa de Contratación","Ser a la vez capital de Nueva Granada y puerto de contrabando","Ser a la vez capital de una capitanía y sede de los jesuitas"]]],
   vf:[["Buenos Aires empezó a crecer cuando fue a la vez capital del virreinato y puerto autorizado.",true,"Esas dos cosas juntas hicieron que la ciudad comenzara a crecer."],
       ["Buenos Aires dejó de crecer cuando se convirtió en capital y puerto autorizado.",false,"Al revés: fue entonces cuando comenzó a crecer."]]}),
  K("intendencias_1782","b","🔢","Ocho intendencias en 1782","En 1782 los Borbones repartieron en ocho intendencias la zona del virreinato con capital en Buenos Aires, para controlarla mejor. Eran grandes divisiones gobernadas por intendentes.",{
   mc:[["¿En cuántas intendencias dividieron los Borbones el virreinato con capital en Buenos Aires?","Ocho",["Cuatro","Seis","Diez"]],
       ["¿En qué año dividieron los Borbones en intendencias el virreinato con capital en Buenos Aires?","1782",["1776","1717","1700"]]],
   vf:[["En 1782 los Borbones repartieron en ocho intendencias el territorio del virreinato con capital en Buenos Aires.",true,"Cada una era una gran división, gobernada por intendentes."],
       ["Las ocho intendencias se crearon antes que el virreinato con capital en Buenos Aires.",false,"El virreinato se creó en 1776 y las intendencias llegaron después, en 1782."]],
   tocar:[["linea","Tocá en la línea el año en que los Borbones dividieron en intendencias la zona del Virreinato del Río de la Plata.","t1782"]]}),
  K("intendente","b","👔","El intendente","Los intendentes gobernaban las intendencias. Eran personas muy importantes, con mucho poder, enviadas directamente desde España. Cobraban impuestos, impulsaban el comercio y la producción de su región, hacían cumplir las leyes y organizaban la defensa del territorio.",{
   mc:[["¿Quién gobernaba una intendencia?","Un intendente",["Un capitán general","Un encomendero","El cabildo"]],
       ["¿De dónde era enviado el intendente?","Directamente desde España",["Desde Buenos Aires","Desde Lima","Desde la Ciudad de México"]],
       ["¿Cuál de estas era una tarea del intendente?","Preparar la defensa del territorio",["Elaborar todas las leyes de América","Controlar los viajes entre España y América","Ser el representante del rey en las colonias"]]],
   vf:[["Los intendentes eran personas muy importantes enviadas directamente desde España.",true,"Tenían mucho poder."],
       ["El intendente era elegido entre los vecinos de la ciudad una vez al año.",false,"Eso pasaba con los miembros del cabildo; el intendente era enviado desde España."],
       ["El intendente cobraba impuestos y hacía cumplir las leyes.",true,"También impulsaba el comercio y la producción de su región y organizaba la defensa."]]}),
  K("gobernaciones_militares","b","💂","Gobernaciones militares","Además de las intendencias, los Borbones crearon gobernaciones militares en las zonas de frontera. Su tarea era encargarse de la defensa de esos lugares.",{
   mc:[["¿De qué se encargaban las gobernaciones militares?","De la defensa",["De elaborar las leyes de América","De administrar la justicia","De controlar los viajes entre España y América"]]],
   vf:[["Las gobernaciones militares se crearon en zonas de frontera.",true,"Su tarea era la defensa."],
       ["Las gobernaciones militares eran las encargadas de administrar la justicia.",false,"Su tarea era la defensa; la justicia la administraban las reales audiencias."]]})
 ],
 tableros:[
  {titulo:"Fechas importantes",cols:["Año","Qué pasó"],pares:[["dos_primeros_virreinatos","1535 y 1542","Nacen los virreinatos de Nueva España y del Perú"],["borbones","1700","Los Borbones empiezan a reinar en España"],["nuevos_virreinatos","1717","Nace el Virreinato de Nueva Granada"],["rio_plata_1776","1776","Se crea el virreinato con capital en Buenos Aires"],["intendencias_1782","1782","El Río de la Plata se divide en ocho intendencias"]]},
  {titulo:"Qué hicieron los Borbones",cols:["Cambio","En qué consistió"],pares:[["nuevos_virreinatos","Dos virreinatos nuevos","Nueva Granada y Río de la Plata"],["nuevas_capitanias","Nuevas capitanías (según el libro)","Chile, Cuba, Venezuela y Guatemala"],["intendencias","Las intendencias","Divisiones más chicas dentro de cada virreinato"],["nuevos_impuestos","Nuevos impuestos","Servían para recaudar más riquezas"],["expulsion_jesuitas","Los jesuitas","Fueron expulsados de España y de América"]]},
  {titulo:"El Virreinato del Río de la Plata",cols:["Tema","Qué dice"],pares:[["rio_plata_1776","Países que abarcaba, total o parcialmente","Argentina, Uruguay, Paraguay y Bolivia"],["capital_buenos_aires","Su ciudad capital","Buenos Aires"],["buenos_aires_crece","Al ser capital y puerto autorizado…","La ciudad comenzó a crecer"],["intendente","Los intendentes","Enviados desde España, con mucho poder"],["gobernaciones_militares","Las gobernaciones militares","Defendían las zonas de frontera"]]},
  {titulo:"Motivos y consecuencias",cols:["Idea","Qué dice"],pares:[["por_que_reformas","Para qué se hicieron las reformas","Tener más control sobre los territorios"],["contrabando","El contrabando","Comerciar de forma ilegal"],["rio_plata_causas","Querían avanzar sobre las colonias","Inglaterra y Portugal"],["cargos_peninsulares","Criollos sin los cargos más importantes","Quedaron con gran descontento"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"cuadro",titulo:"📋 El virrey y el intendente"},
  {id:"dibujos",titulo:"🖼️ Línea de tiempo y mapa",dibujos:["linea","virreinato"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 cuadro:{cols:["Virrey","Intendente"],filas:[
  {t:"Qué cargo tenía",v:["Era la autoridad máxima de un virreinato","Gobernaba una intendencia"]},
  {t:"Qué poder tenía",v:["El más alto: era la autoridad más importante","Mucho poder: era una persona muy importante"]},
  {t:"A quién representaba o de dónde venía",v:["Era el representante del rey en las colonias","Era enviado directamente desde España"]},
  {t:"Dónde mandaba",v:["En todo un virreinato (en el del Río de la Plata, vivía en Buenos Aires, la capital)","En una intendencia, una gran división de la zona del virreinato"]}
 ]},
 mapa:{raiz:"Los Borbones y el Virreinato del Río de la Plata",ramas:[
  {t:"Los Borbones y las reformas",h:["En 1700 empezó a reinar en España la familia de los Borbones","Hicieron las Reformas borbónicas: cambios en la forma de administrar las colonias","Querían tener más control sobre los territorios"]},
  {t:"Por qué hicieron las reformas",h:["Los territorios eran muy extensos y difíciles de controlar","Había personas que no pagaban impuestos y había contrabando","Inglaterra y Portugal querían apoderarse de las colonias","Los Borbones querían más riquezas y un control más estricto"]},
  {t:"Nuevas divisiones",h:["Dos virreinatos nuevos: Nueva Granada (1717) y Río de la Plata (1776)","Capitanías, según el libro: Chile, Cuba, Venezuela y Guatemala","Intendencias, dentro de cada virreinato"]},
  {t:"Otros cambios",h:["Nuevos impuestos para recaudar más riquezas","Los jesuitas, expulsados de España y de América","Los cargos más importantes, para españoles nacidos en España","Los criollos quedaron muy descontentos"]},
  {t:"Virreinato del Río de la Plata",h:["Nació en 1776","Abarcaba, total o parcialmente, Argentina, Uruguay, Paraguay y Bolivia","Capital: Buenos Aires, donde vivía el virrey","Buenos Aires: lugar estratégico, con puerto","Al ser capital y puerto autorizado, la ciudad empezó a crecer"]},
  {t:"Intendencias y defensa (1782)",h:["En 1782: ocho intendencias, gobernadas por intendentes","El intendente: enviado desde España, con mucho poder","Cobraba impuestos y hacía cumplir las leyes","Impulsaba el comercio y la producción, y organizaba la defensa","Gobernaciones militares: la defensa de las zonas de frontera"]}
 ]}
});
})();
