// Sociales · «La sociedad colonial, la encomienda y la evangelización» (páginas 102 y 103 del libro). Textos y ejercicios PROPIOS, con otras palabras.
(function(){
"use strict";
const INT=window.INT,K=INT.idea;
// lo que dice cada pieza del triángulo de las castas al tocarla en la pantalla de estudio (en las preguntas sólo se tocan mestizos, mulatos y zambos)
INT.IDEAS.info.castas={
  blancos:{t:"Blancos",d:"Es uno de los tres orígenes del triángulo. Los hijos de blancos e indígenas eran los mestizos, y los hijos de blancos y africanos, los mulatos. La posición en el dibujo no quiere decir que unas personas valgan más que otras."},
  indigenas:{t:"Indígenas",d:"Es otro de los orígenes del triángulo. Los hijos de blancos e indígenas eran los mestizos, y los hijos de indígenas y africanos, los zambos."},
  africanos:{t:"Africanos",d:"Es el tercer origen del triángulo. Los hijos de blancos y africanos eran los mulatos, y los hijos de indígenas y africanos, los zambos."},
  mestizos:{t:"Mestizos",d:"Eran los hijos de blancos e indígenas. Formaban uno de los tres principales grupos del sistema de castas."},
  mulatos:{t:"Mulatos",d:"Eran los hijos de blancos y africanos. Formaban otro de los tres principales grupos del sistema de castas."},
  zambos:{t:"Zambos",d:"Eran los hijos de indígenas y africanos. Formaban el tercer grupo principal del sistema de castas, junto con los mestizos y los mulatos."}
};
INT.temaIdeas({
 area:"sociales",
 id:"sociedad",nombre:"La sociedad colonial",ico:"👥",paginas:"páginas 102 y 103",
 es:"Cómo era la sociedad colonial (grupos sociales y castas), qué fue la encomienda y cómo se evangelizó a los indígenas",
 grupos:[{id:"a",titulo:"Una sociedad desigual"},{id:"b",titulo:"El sistema de castas"},{id:"c",titulo:"Los indígenas y la encomienda"},{id:"d",titulo:"La evangelización"}],
 conceptos:[
  K("desigualdad","a","⚖️","Una sociedad desigual","En la sociedad colonial había una gran desigualdad: según las reglas de esa época, el color de la piel de cada persona marcaba sus derechos, sus obligaciones y sus trabajos. En las ciudades vivían personas de orígenes muy distintos: españoles, indígenas y africanos y afrodescendientes. Las personas descendientes de pueblos originarios o de africanos no tenían los mismos derechos que los españoles.",{
   mc:[["Según las reglas de la sociedad colonial, que era muy desigual, ¿qué marcaba los derechos, las obligaciones y los trabajos de cada persona?","El color de su piel",["La edad que tenía","El barrio donde vivía","Los estudios que había hecho"]],
       ["¿De qué orígenes eran las personas que vivían en las ciudades coloniales?","Españoles, indígenas y africanos",["Españoles, franceses y alemanes","Sólo españoles y criollos","Indígenas, ingleses y africanos"]]],
   vf:[["En las ciudades coloniales vivían personas de orígenes muy distintos.",true,"Había españoles, indígenas y africanos y afrodescendientes."],
       ["En la sociedad colonial, una persona descendiente de africanos tenía los mismos derechos que un español.",false,"Era una sociedad muy desigual: los descendientes de africanos no tenían los mismos derechos que los españoles."]],
   tipear:[["La sociedad colonial era muy… (una palabra: lo contrario de «igual»).",["desigual","muy desigual"],"Empieza con d"]]}),
  K("espanoles","a","🏰","Los españoles","Los españoles nacidos en España, junto con sus familias, eran el grupo más privilegiado de la sociedad colonial. Ellos tenían los cargos públicos más importantes.",{
   mc:[["¿Cuál era el grupo más privilegiado de la sociedad colonial?","Los españoles nacidos en España",["Los mestizos","Los indígenas","Los africanos y afrodescendientes"]],
       ["¿Quiénes tenían los cargos públicos más importantes?","Los españoles nacidos en España",["Los criollos, nacidos en América","Los mestizos y los mulatos","Los indígenas y los zambos"]]],
   vf:[["Las familias de los españoles nacidos en España también formaban parte del grupo más privilegiado.",true,"El grupo más privilegiado incluía a esos españoles y a sus familias."],
       ["Los españoles nacidos en España eran el grupo con menos privilegios de la sociedad colonial.",false,"Eran el grupo más privilegiado y tenían los cargos públicos más importantes."]]}),
  K("criollos","a","🌎","Los criollos","Se llamaba criollos a los españoles que habían nacido en América. Tenían privilegios, aunque con un límite: no podían llegar a los cargos más altos.",{
   mc:[["¿Dónde habían nacido los criollos?","En América",["En España","En África","En Portugal"]],
       ["¿Qué límite tenían los criollos en la sociedad colonial?","No podían llegar a los cargos más altos",["Tenían que dar tributos con trabajo o con dinero","No eran libres: en su gran mayoría estaban esclavizados","No tenían ningún privilegio"]]],
   vf:[["Los criollos podían ocupar los cargos más altos de la colonia.",false,"Tenían privilegios, pero no podían llegar a los cargos más altos."],
       ["Los criollos eran españoles que habían nacido en América.",true,"A diferencia de los españoles nacidos en España, ellos habían nacido en América."]],
   tipear:[["Los españoles que habían nacido en América se llamaban… (una palabra).",["criollos","los criollos","criollo","los criollo"],"Empieza con c"]]}),
  K("indigenas_libres","a","🔓","Los indígenas: libres, pero con tributos","Los indígenas eran libres según la ley, pero tenían la obligación de entregar tributos a los españoles, ya fuera con trabajo o con dinero.",{
   mc:[["¿Qué grupo era legalmente libre, pero estaba obligado a entregar tributos a los españoles?","Los indígenas",["Los criollos","Los españoles nacidos en España","Los africanos y afrodescendientes"]],
       ["Según el libro, ¿cómo eran los indígenas ante la ley?","Legalmente libres",["Esclavizados por ley","Los más privilegiados","Dueños de las encomiendas"]]],
   vf:[["Los indígenas debían entregar tributos a los españoles, en trabajo o en dinero.",true,"Aunque eran legalmente libres, tenían esa obligación."],
       ["Los indígenas eran esclavizados por la ley.",false,"Eran legalmente libres, aunque estaban obligados a entregar tributos."]],
   tipear:[["Los indígenas eran legalmente… (una palabra), pero debían entregar tributos a los españoles.",["libres","libre","eran libres"],"Es lo contrario de esclavizados"]]}),
  K("africanos","a","🌍","Los africanos y afrodescendientes","Más adelante, los españoles trajeron personas desde África para esclavizarlas y obligarlas a hacer los trabajos más exigentes. Los africanos y sus descendientes no eran libres (en su gran mayoría, estaban esclavizados) y no se les reconocían derechos: trabajaban como sirvientes en las minas, las haciendas y las casas.",{
   mc:[["¿Para qué trajeron los españoles personas desde África a las colonias?","Para esclavizarlas y que hicieran los trabajos más exigentes",["Para que ocuparan los cargos públicos más importantes de la colonia","Para que se encargaran de evangelizar a los pueblos indígenas","Para que fueran encomenderos de varias familias indígenas"]],
       ["¿Dónde debían trabajar los africanos y afrodescendientes, según el libro?","Como sirvientes, en las minas, las haciendas y las casas",["En los cabildos, como vecinos de cada ciudad","En las universidades, como maestros y estudiantes","En las iglesias, como sacerdotes y monjes"]],
       ["¿Cuál era la situación de la gran mayoría de los africanos y afrodescendientes?","Estaban esclavizados",["Eran legalmente libres","Ocupaban los cargos más altos","Eran los más privilegiados"]]],
   vf:[["La gran mayoría de los africanos y afrodescendientes de la colonia estaba esclavizada.",true,"No eran libres y no se les reconocían derechos."],
       ["Los africanos y afrodescendientes eran legalmente libres, igual que los indígenas.",false,"No eran libres: en su gran mayoría estaban esclavizados."]]}),
  K("mujeres","a","👩","Las mujeres","Además de la desigualdad según el origen, las mujeres, sin importar de qué origen fueran, tenían pocas libertades. Por ejemplo, los vecinos eran las personas entre las que se elegía a los miembros del cabildo, y para ser considerado vecino había que ser varón, entre otros requisitos.",{
   mc:[["Según el libro, ¿qué pasaba con las mujeres en la sociedad colonial?","Tenían pocas libertades, sin importar su origen",["Sólo las mujeres indígenas tenían pocas libertades","Sólo las mujeres africanas tenían pocas libertades","Las mujeres españolas tenían todas las libertades"]]],
   vf:[["Las mujeres tenían pocas libertades en la sociedad colonial, sin importar su origen.",true,"Eso valía para las mujeres de todos los orígenes."],
       ["Sólo las mujeres indígenas y africanas tenían pocas libertades; las españolas tenían todas.",false,"Sin importar su origen, las mujeres tenían pocas libertades."]]}),
  K("castas","b","🔺","El sistema de castas","Las autoridades coloniales no querían que personas de distintos orígenes formaran familias, pero con el tiempo nacieron hijos de padres de orígenes diferentes. Entonces crearon el sistema de castas: dividía a las personas en grupos según su origen y decidía qué derechos tenía cada grupo, o casta. Los grupos principales eran los mestizos, los mulatos y los zambos: así los llamaban las autoridades coloniales al clasificar a las personas. Se lo considera un sistema injusto: los derechos no eran iguales para todos.",{
   mc:[["¿Qué función tenía el sistema de castas?","Clasificar a las personas por su origen y definir sus derechos",["Repartir las encomiendas entre los conquistadores como «recompensa»","Controlar los viajes y el comercio entre España y América","Elegir cada año a los miembros del cabildo entre los vecinos"]],
       ["¿Cuáles eran los principales grupos del sistema de castas?","Mestizos, mulatos y zambos",["Españoles, criollos e indígenas","Mestizos, criollos y zambos","Mulatos, indígenas y africanos"]],
       ["¿Quiénes crearon el sistema de castas?","Las autoridades coloniales",["Los jesuitas de las misiones","Los propios indígenas","Los africanos y afrodescendientes"]]],
   vf:[["Con el tiempo nacieron niños con padres de orígenes diferentes, y entonces se creó el sistema de castas.",true,"Las autoridades coloniales no querían esas familias, pero igual nacieron hijos de padres de orígenes distintos."],
       ["Las autoridades coloniales querían que personas de distintos orígenes formaran familias entre sí.",false,"No querían que eso pasara, pero igual nacieron niños con padres de orígenes diferentes."],
       ["El sistema de castas se considera injusto porque los derechos de cada persona dependían de su origen.",true,"A cada grupo se le reconocían derechos distintos, según su origen."]],
   tipear:[["El sistema que dividía a las personas en grupos según su origen se llamaba sistema de… (una palabra).",["castas","las castas","casta"],"Empieza con c"]],
   ordenar:[["Ordená cómo se llegó al sistema de castas.",["Las autoridades no querían que personas de distintos orígenes formaran familias","Con el tiempo nacieron niños con padres de orígenes diferentes","Las autoridades coloniales crearon el sistema de castas"]]],
   tocar:[["castas","Tocá en el dibujo el grupo de las castas formado por los hijos de blancos e indígenas.","mestizos"],
          ["castas","Tocá en el dibujo el grupo de las castas formado por los hijos de blancos y africanos.","mulatos"],
          ["castas","Tocá en el dibujo el grupo de las castas formado por los hijos de indígenas y africanos.","zambos"]]}),
  K("mestizos","b","👪","Los mestizos","Los mestizos eran los hijos de blancos e indígenas. Formaban uno de los tres principales grupos del sistema de castas, junto con los mulatos y los zambos.",{
   mc:[["¿Cómo se llamaba, en el sistema de castas, a los hijos de blancos e indígenas?","Mestizos",["Mulatos","Zambos","Criollos"]]],
   vf:[["Los mestizos eran los hijos de blancos e indígenas.",true,"Es uno de los tres principales grupos del sistema de castas."],
       ["Los mestizos eran los hijos de indígenas y africanos.",false,"Los mestizos eran hijos de blancos e indígenas; los hijos de indígenas y africanos eran los zambos."]],
   tipear:[["Los hijos de blancos e indígenas se llamaban… (una palabra).",["mestizos","los mestizos","mestizo","los mestizo"],"Empieza con mes"]],
   tocar:[["castas","Tocá en el dibujo el grupo de personas cuyos padres eran blancos e indígenas.","mestizos"]]}),
  K("mulatos","b","👶","Los mulatos","Los mulatos eran los hijos de blancos y africanos. Formaban otro de los tres principales grupos del sistema de castas, junto con los mestizos y los zambos.",{
   mc:[["¿Cómo se llamaba, en el sistema de castas, a los hijos de blancos y africanos?","Mulatos",["Mestizos","Zambos","Criollos"]]],
   vf:[["Los mulatos eran los hijos de blancos y africanos.",true,"Es otro de los tres principales grupos del sistema de castas."],
       ["Los mulatos eran los hijos de blancos e indígenas.",false,"Los mulatos eran hijos de blancos y africanos; los hijos de blancos e indígenas eran los mestizos."]],
   tipear:[["Los hijos de blancos y africanos se llamaban… (una palabra).",["mulatos","los mulatos","mulato","los mulato"],"Empieza con mul"]],
   tocar:[["castas","Tocá en el dibujo el grupo de personas cuyos padres eran blancos y africanos.","mulatos"]]}),
  K("zambos","b","🍼","Los zambos","Los zambos eran los hijos de indígenas y africanos. Formaban el tercer grupo principal del sistema de castas, junto con los mestizos y los mulatos.",{
   mc:[["¿Cómo se llamaba, en el sistema de castas, a los hijos de indígenas y africanos?","Zambos",["Mestizos","Mulatos","Criollos"]]],
   vf:[["Los zambos eran los hijos de indígenas y africanos.",true,"Es uno de los tres principales grupos del sistema de castas."],
       ["Los zambos eran los hijos de blancos y africanos.",false,"Los zambos eran hijos de indígenas y africanos; los hijos de blancos y africanos eran los mulatos."]],
   tipear:[["Los hijos de indígenas y africanos se llamaban… (una palabra).",["zambos","los zambos","zambo","los zambo"],"Empieza con z"]],
   tocar:[["castas","Tocá en el dibujo el grupo de personas cuyos padres eran indígenas y africanos.","zambos"]]}),
  K("oficios_castas","b","🛠️","Oficios y límites de las castas","Algunas personas de las castas llegaron a ser dueñas de pequeñas propiedades, como tiendas, pulperías, chacras y postas. Otras trabajaron como artesanas, herreras o sastres. Pero ninguna alcanzaba el poder ni los privilegios de los españoles.",{
   mc:[["¿Qué podían llegar a ser algunas personas de las castas?","Dueños de tiendas o de chacras",["Virreyes de un virreinato","Miembros del Consejo de Indias","Funcionarios con los cargos más importantes"]],
       ["¿Cuál de estos oficios tuvieron algunas personas de las castas?","Herrero",["Virrey","Intendente","Capitán general"]],
       ["¿Qué límite tenían las personas de las castas frente a los españoles?","Ninguna llegaba a tener su poder y sus privilegios",["Ninguna podía ser dueña de una tienda ni de una chacra","Ninguna podía trabajar como artesana, herrera o sastre","Todas debían trabajar en las minas, las haciendas y las casas"]]],
   vf:[["Algunas personas de las castas fueron artesanos, herreros o sastres.",true,"Otras llegaron a ser dueñas de pequeñas propiedades, como tiendas o chacras."],
       ["Las personas de las castas llegaban a tener el mismo poder y los mismos privilegios que los españoles.",false,"Podían tener tiendas o ser artesanos, pero ninguna alcanzaba el poder ni los privilegios de los españoles."]]}),
  K("encomienda","c","📜","La encomienda","Al comienzo de la conquista, a los indígenas se los incluyó en el sistema de encomienda, una forma de trabajo forzado. Los conquistadores recibían las encomiendas del rey como una «recompensa».",{
   mc:[["¿Qué era la encomienda?","Un sistema de trabajo forzado de los indígenas",["Un sistema para elegir a los miembros del cabildo","Un impuesto que pagaban los españoles","Una escuela dirigida por los jesuitas"]],
       ["¿A quiénes entregaba el rey las encomiendas, como «recompensa»?","A los conquistadores",["A las familias indígenas","A los monjes y sacerdotes","A los criollos de las ciudades"]]],
   vf:[["La encomienda era un sistema de trabajo forzado.",true,"Los conquistadores recibían encomiendas del rey como «recompensa»."],
       ["El rey entregaba las encomiendas a los indígenas como «recompensa».",false,"Las encomiendas se entregaban a los conquistadores."]],
   tipear:[["El sistema de trabajo forzado en el que los indígenas quedaban a cargo de un español se llamaba… (una palabra).",["encomienda","la encomienda","sistema de encomienda","el sistema de encomienda"],"Empieza con enc"]]}),
  K("encomendero_tributo","c","🌽","El encomendero y el tributo","Según la teoría, el encomendero —el español a cargo de varias familias indígenas— tenía que convertirlas a la fe católica y protegerlas. A cambio de esos «servicios», los indígenas le entregaban un tributo: productos, por ejemplo maíz o tejidos, o bien trabajo agrícola, doméstico o textil, o trabajo en las minas.",{
   mc:[["¿Cómo se llamaba el español que recibía el tributo de las familias indígenas?","Encomendero",["Virrey","Intendente","Capitán general"]],
       ["En teoría, ¿qué tenía que hacer el encomendero con las familias indígenas?","Convertirlas a la fe católica y protegerlas",["Pagarles un sueldo y entregarles tierras para vivir","Enseñarles distintos oficios en una escuela","Llevarlas a vivir a las ciudades de España"]],
       ["¿Cuál de estos tributos era en productos, y no en trabajo?","Maíz",["Trabajo en las minas","Trabajo doméstico","Trabajo agrícola"]]],
   vf:[["El tributo al encomendero podía pagarse en productos o en trabajo.",true,"Por ejemplo, con maíz o tejidos, o con trabajo agrícola, doméstico, textil y minero."],
       ["Los indígenas debían entregar el tributo al rey y no al encomendero.",false,"El tributo se entregaba al encomendero."]],
   ordenar:[["Ordená cómo funcionaba la encomienda, de la teoría a la práctica.",["Varias familias indígenas quedaban a cargo de un español, el encomendero","En teoría, el encomendero tenía que convertirlas a la fe católica y protegerlas","A cambio, los indígenas le entregaban tributo en productos o en trabajo","En la práctica, muchos encomenderos los hacían trabajar sin pagarles ni dejarlos descansar"]]]}),
  K("abusos_encomienda","c","⚠️","Los abusos de la encomienda","En la práctica, muchos encomenderos hacían trabajar a los indígenas durante muchísimas horas, casi siempre sin pagarles y sin darles tiempo de descanso. La Corona española intentó fijar reglas de protección para los pueblos originarios, pero los abusos siguieron.",{
   mc:[["En la práctica, ¿qué hacían muchos encomenderos con los indígenas?","Los obligaban a trabajar muchas horas sin pagarles",["Les pagaban un sueldo justo por cada hora trabajada","Les daban mucho tiempo libre para descansar","Les entregaban tierras para que vivieran mejor"]],
       ["Aunque la Corona intentó fijar reglas de protección, ¿qué pasó con los abusos de los encomenderos?","Siguieron ocurriendo",["Terminaron en pocos años","Los encomenderos dejaron de cometerlos","Desaparecieron por completo"]]],
   vf:[["Muchos encomenderos hacían trabajar a los indígenas sin darles tiempo para descansar.",true,"Los obligaban a trabajar muchas horas, casi siempre sin pagarles."],
       ["Los encomenderos solían pagarles un buen sueldo a los indígenas.",false,"Muchos los hacían trabajar muchas horas, casi siempre sin pagarles."],
       ["La Corona española no hizo ningún intento de proteger a los pueblos originarios.",false,"Intentó fijar reglas de protección, pero los abusos siguieron."]]}),
  K("iglesia_apoyo","d","⛪","El apoyo de la Iglesia","La Iglesia católica apoyó a los reyes de España en la conquista de América, pero con una condición: los españoles tenían que difundir el catolicismo. Por eso viajaron muchos monjes y sacerdotes a América, acompañando a exploradores y soldados. En las ciudades se construyeron iglesias y templos, y el calendario religioso pasó a marcar los momentos importantes del año.",{
   mc:[["¿Con qué condición apoyó la Iglesia católica la conquista de los reyes de España?","Que los españoles se ocuparan de difundir el catolicismo",["Que los españoles dejaran de conquistar nuevos territorios","Que los españoles abandonaran las ciudades de América","Que los virreyes fueran elegidos por los sacerdotes"]],
       ["¿Qué miembros de la Iglesia llegaron a América junto con los exploradores y los soldados?","Muchos monjes y sacerdotes",["Los virreyes y los intendentes","Los criollos y los mestizos","Los encomenderos y los vecinos"]],
       ["¿Qué empezó a organizar los momentos importantes del año en las ciudades de los virreinatos?","El calendario religioso",["El calendario de los virreyes","El calendario del comercio","El calendario de las intendencias"]]],
   vf:[["La Iglesia católica apoyó a los reyes de España en la conquista de América.",true,"Lo hizo a cambio de que se difundiera el catolicismo."],
       ["Los monjes y sacerdotes llegaron a América mucho después que los exploradores y los soldados.",false,"Llegaron junto con ellos."],
       ["En las ciudades de los virreinatos no se construyeron iglesias ni templos.",false,"Sí se levantaron iglesias y templos en distintas ciudades."]]}),
  K("evangelizacion","d","🔔","La evangelización","Entre los objetivos más importantes estaba la evangelización de los indígenas: que se convirtieran al catolicismo. Esa tarea la realizaron miembros de órdenes religiosas.",{
   mc:[["¿Quiénes realizaron la tarea de evangelizar a los indígenas?","Miembros de órdenes religiosas",["Los virreyes y los intendentes","Los soldados y los exploradores","Los vecinos de los cabildos"]],
       ["Una de las metas principales era la evangelización. ¿A quiénes se quería evangelizar?","A los indígenas",["A los virreyes","A los españoles nacidos en España","A los criollos"]]],
   vf:[["La evangelización de los indígenas era uno de los principales objetivos.",true,"Esa tarea la realizaron miembros de órdenes religiosas."],
       ["La evangelización fue realizada por los virreyes y los capitanes generales.",false,"Fue una tarea de miembros de órdenes religiosas, como los jesuitas."]],
   tipear:[["Los monjes y sacerdotes que evangelizaron a los indígenas pertenecían a distintas… religiosas (una palabra).",["ordenes","órdenes","las ordenes","las órdenes"],"Empieza con o"]]}),
  K("jesuitas_reducciones","d","🏘️","Los jesuitas y las reducciones","Los jesuitas, una de las órdenes religiosas, crearon comunidades llamadas reducciones o misiones. En ellas habitaban grupos de indígenas, que aprendían distintos oficios y tenían la obligación de convertirse al catolicismo.",{
   mc:[["¿Cómo se llamaban las comunidades que creó la orden de los jesuitas?","Reducciones o misiones",["Cabildos o audiencias","Intendencias o gobernaciones","Virreinatos o capitanías"]],
       ["¿Qué aprendían los grupos de indígenas que vivían en las reducciones?","Varios oficios",["A gobernar un virreinato","A cobrar impuestos","A elaborar las leyes de América"]]],
   vf:[["Los jesuitas crearon comunidades de indígenas llamadas reducciones o misiones.",true,"Allí los indígenas aprendían distintos oficios."],
       ["Los indígenas que vivían en las reducciones podían elegir si querían convertirse al catolicismo.",false,"Tenían que convertirse al catolicismo."],
       ["Las reducciones o misiones fueron creadas por los virreyes.",false,"Las crearon los jesuitas, una de las órdenes religiosas."]],
   tipear:[["Una de las órdenes religiosas, la de los… (una palabra), creó comunidades llamadas reducciones o misiones.",["jesuitas","los jesuitas"],"Empieza con j"]]}),
  K("idiomas_escuelas","d","📚","Idiomas y escuelas","Para que su mensaje se entendiera, muchos monjes aprendieron las lenguas de los pueblos originarios. Otros colaboraron en la fundación de escuelas, seminarios y universidades.",{
   mc:[["¿Para qué estudiaron muchos monjes las lenguas de los pueblos originarios?","Para que su mensaje pudiera ser entendido",["Para cobrar los tributos a los encomenderos","Para gobernar los cabildos","Para controlar el comercio con España"]],
       ["¿Qué ayudaron a fundar otros monjes?","Escuelas, seminarios y universidades",["Cabildos, audiencias y capitanías generales","Minas, haciendas, chacras y pulperías","Casas de Contratación y puertos de mar"]]],
   vf:[["Muchos monjes estudiaron los idiomas que hablaban los pueblos originarios.",true,"Lo hicieron para que su mensaje se entendiera."],
       ["Ningún monje ayudó a fundar escuelas, seminarios ni universidades.",false,"Varios monjes sí colaboraron en la fundación de escuelas, seminarios y universidades."]],
   tipear:[["Algunos monjes colaboraron en la fundación de escuelas, seminarios y… (una palabra).",["universidades","las universidades"],"Empieza con u"]]}),
  K("misiones_hoy","d","📷","Las misiones de hoy","Por ejemplo, hoy se pueden ver dos de aquellas misiones jesuíticas. En el área de la laguna de los Padres (provincia de Buenos Aires) hay una reconstrucción de la reducción Nuestra Señora del Pilar. En la provincia de Misiones están las ruinas de San Ignacio Miní, una misión jesuítica creada para evangelizar a los guaraníes.",{
   mc:[["¿Qué hay hoy en el área de la laguna de los Padres (provincia de Buenos Aires)?","Una reconstrucción de la reducción Nuestra Señora del Pilar",["Las ruinas de San Ignacio Miní","La Casa de Contratación de Sevilla","El Cabildo de Salta, que sobrevivió desde la colonia"]],
       ["¿Para qué se creó el espacio de San Ignacio Miní?","Para evangelizar a los guaraníes",["Para controlar el comercio con España","Para que viviera allí el virrey con su familia","Para defender el puerto de los ingleses"]]],
   vf:[["San Ignacio Miní, una misión jesuítica en ruinas, está en la provincia de Misiones.",true,"Fue creada para evangelizar a los guaraníes."],
       ["La reconstrucción de la reducción Nuestra Señora del Pilar está en la provincia de Misiones.",false,"Está en la provincia de Buenos Aires, en el área de la laguna de los Padres."]],
   tipear:[["¿En qué provincia están las ruinas de San Ignacio Miní?",["misiones","en misiones","la provincia de misiones","en la provincia de misiones","provincia de misiones","en provincia de misiones"],"Se llama igual que las comunidades jesuíticas"]]})
 ],
 tableros:[
  {titulo:"Los grupos sociales",cols:["Grupo","Qué dice el libro"],pares:[["espanoles","Españoles nacidos en España","Los más privilegiados, con los cargos más importantes"],["criollos","Criollos","Españoles nacidos en América"],["indigenas_libres","Indígenas","Legalmente libres, pero obligados a dar tributos"],["africanos","Africanos y afrodescendientes","No eran libres: en su gran mayoría, esclavizados"],["mujeres","Las mujeres","Tenían pocas libertades, sin importar su origen"]]},
  {titulo:"Las castas",cols:["Idea","Qué es"],pares:[["castas","El sistema de castas","Dividía a las personas en grupos según su origen"],["mestizos","Mestizos","Hijos de blancos e indígenas"],["mulatos","Mulatos","Hijos de blancos y africanos"],["zambos","Zambos","Hijos de indígenas y africanos"],["oficios_castas","Lo que podían ser las personas de las castas","Dueños de tiendas o chacras, artesanos o sastres"]]},
  {titulo:"Encomienda y evangelización",cols:["Tema","Qué hay que saber"],pares:[["encomienda","La encomienda","Sistema de trabajo forzado de los indígenas"],["encomendero_tributo","El tributo al encomendero","Se pagaba en productos o en trabajo"],["iglesia_apoyo","La Iglesia y la conquista","Apoyó la conquista si se difundía el catolicismo"],["evangelizacion","La evangelización","Tarea de miembros de órdenes religiosas"],["jesuitas_reducciones","Los jesuitas","Crearon comunidades llamadas reducciones o misiones"]]},
  {titulo:"Otras ideas del tema",cols:["Idea","De qué se trata"],pares:[["desigualdad","La sociedad colonial","Una gran desigualdad, según el color de la piel"],["abusos_encomienda","Los abusos de la encomienda","Muchas horas de trabajo, casi sin pago ni descanso"],["idiomas_escuelas","Muchos monjes y la enseñanza","Aprendieron idiomas y ayudaron a fundar escuelas"],["misiones_hoy","San Ignacio Miní","Ruinas jesuíticas en la provincia de Misiones"]]}
 ],
 estudio:[
  {id:"resumen",titulo:"📖 Resumen"},
  {id:"cuadro",titulo:"📋 Los grupos de la sociedad colonial"},
  {id:"dibujos",titulo:"🖼️ Triángulo de las castas",dibujos:["castas"]},
  {id:"mapa",titulo:"🧠 Mapa conceptual"}
 ],
 cuadro:{cols:["Quiénes eran","Derechos y trabajos"],filas:[
  {t:"Españoles",v:["Personas nacidas en España, con sus familias","El grupo con más privilegios; tenían los cargos públicos más importantes"]},
  {t:"Criollos",v:["Españoles nacidos en América","Tenían privilegios, pero no podían llegar a los cargos más altos"]},
  {t:"Indígenas",v:["Personas de los pueblos originarios","Libres según la ley, pero obligados a dar tributos a los españoles, en trabajo o en dinero"]},
  {t:"Africanos y afrodescendientes",v:["Personas que los españoles trajeron desde África para esclavizarlas, y sus descendientes","No eran libres (en su gran mayoría, esclavizados) y no se les reconocían derechos; trabajaban como sirvientes en minas, haciendas y casas"]},
  {t:"Mestizos / mulatos / zambos",v:["Hijos de blancos e indígenas (mestizos), de blancos y africanos (mulatos) y de indígenas y africanos (zambos)","Algunos tenían tiendas, pulperías, chacras o postas; otros eran artesanos, herreros o sastres; ninguno alcanzaba el poder ni los privilegios de los españoles"]}
 ]},
 mapa:{raiz:"La sociedad colonial, la encomienda y la evangelización",ramas:[
  {t:"Una sociedad desigual",h:["Según el color de la piel se decidían los derechos, las obligaciones y los trabajos","Había españoles, indígenas y africanos y afrodescendientes","Las mujeres tenían pocas libertades, sin importar su origen"]},
  {t:"Los grupos de la sociedad",h:["Españoles: los más privilegiados, con los cargos públicos más importantes","Criollos: españoles nacidos en América, sin acceso a los cargos más altos","Indígenas: legalmente libres, pero con tributos","Africanos y afrodescendientes: no libres; en su gran mayoría, esclavizados"]},
  {t:"El sistema de castas",h:["Dividía a las personas en grupos según su origen y decidía sus derechos","Mestizos: los hijos de blancos e indígenas","Mulatos: los hijos de blancos y africanos","Zambos: los hijos de indígenas y africanos","Era un sistema injusto: los derechos no eran iguales"]},
  {t:"La encomienda",h:["Era un trabajo forzado de los indígenas","Los conquistadores la recibían del rey como «recompensa»","En teoría: el encomendero convertía a las familias a la fe católica y las protegía; ellas daban tributo a cambio de esos «servicios»","Tributo: productos (maíz, tejidos) o trabajo","Abusos: muchas horas de trabajo, casi siempre sin pago y sin descanso"]},
  {t:"La evangelización",h:["La Iglesia apoyó la conquista si se difundía el catolicismo","Llegaron monjes y sacerdotes; se construyeron iglesias","Las órdenes religiosas evangelizaron; los jesuitas crearon reducciones o misiones","Muchos monjes aprendieron idiomas; otros ayudaron a fundar escuelas y universidades","Hoy: Nuestra Señora del Pilar (reconstruida) y San Ignacio Miní (ruinas)"]}
 ]}
});
})();
