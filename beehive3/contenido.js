// «Beehive 3 · Prueba de inglés»: lo que entra en la evaluación de 4.º grado (Units 7 y 8 del Student's Book), organizado por tema.
// Sólo datos y frases: las palabras y las estructuras salen del libro (Housework, Party preparations, Everyday things, A Roman town; past simple regular afirmativo y negativo,
// «had to» y past simple irregular), y las ORACIONES de ejemplo y de ejercicio son propias (no se copian las hojas del libro: el sitio es público).
// Todo lo que la app puede decir en inglés se registra con A(): tools/audio/beehive3.js lee este archivo para saber qué audios grabar.
(function(){
"use strict";
const B3=window.B3={PRUEBA:"2026-11-12",PRUEBA_TXT:"jueves 12 de noviembre"};
const AUD={};   // clave → texto en inglés
const slug=t=>String(t).toLowerCase().replace(/[’']/g,"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,70);
function A(tts){
  let k="en_"+slug(tts),i=2;
  while(AUD[k]&&AUD[k]!==tts)k="en_"+slug(tts)+"-"+(i++);
  AUD[k]=tts;return k;
}
B3.A=A;B3.audio=AUD;B3.frases=()=>Object.keys(AUD).sort().map(k=>({k,l:"en",tts:AUD[k]}));
const LLENO=(ctx,en)=>ctx.replace("____",en);

// ---------------- vocabulario: palabra o frase, su traducción, un dibujo (si hay uno que no se preste a confusión) y una oración con un hueco que sólo encaja con esa palabra
const v=(id,en,es,emoji,ctx,extra)=>Object.assign({id,en,es,emoji:emoji||"",ctx,k:A(en),kLleno:A(LLENO(ctx,en)),lleno:LLENO(ctx,en)},extra||{});
const VOCAB=[
 {id:"housework",unit:7,pag:"84",ico:"🧹",nombre:"Housework",es:"Tareas de la casa",tipo:"vocab",items:[
  v("hw_hoover","hoover the floor","pasar la aspiradora","🧹","The carpet is full of dust. Dad will use the vacuum cleaner to ____."),
  v("hw_dishes","wash the dishes","lavar los platos","🧽","The plates are dirty. I will ____ in the sink."),
  v("hw_load","load the dishwasher","cargar el lavavajillas","","The dishwasher is empty. Please ____ with the dirty plates."),
  v("hw_water","water the plants","regar las plantas","🌱","The plants are dry. Please ____."),
  v("hw_room","clean my room","limpiar mi cuarto","🛏️","My room is a mess! I must ____."),
  v("hw_table","clear the table","levantar la mesa","🍽️","Lunch is over. Please ____ and take the plates to the kitchen."),
  v("hw_cook","cook the dinner","cocinar la cena","🍳","We're hungry! Dad will ____."),
  v("hw_car","wash the car","lavar el auto","🚗","The car is very dirty. Let's ____.")]},
 {id:"party",unit:7,pag:"88",ico:"🎉",nombre:"Party preparations",es:"Preparar una fiesta",tipo:"vocab",items:[
  v("pp_invite","invite guests","invitar gente a la fiesta","✉️","I'm writing cards for my birthday party. I want to ____."),
  v("pp_food","prepare food","preparar la comida","🥗","There is no food for the guests yet. Mum will ____."),
  v("pp_tidy","tidy up","ordenar","","There are toys on the floor. We must ____."),
  v("pp_decorate","decorate","decorar","🎈","We have balloons and flags for the walls. Let's ____!"),
  v("pp_dress","dress up","vestirse elegante (o disfrazarse)","👔","It's a special party, so I will ____ in my best clothes."),
  v("pp_set","set the table","poner la mesa","🍴","The guests are coming and we need plates and forks on the table. Let's ____.")]},
 {id:"everyday",unit:8,pag:"96",ico:"🏺",nombre:"Everyday things",es:"Cosas de todos los días (de antes y de ahora)",tipo:"vocab",items:[
  v("ev_helmet","helmet","casco","⛑️","A soldier wore a ____ to keep his head safe."),
  v("ev_cup","cup","taza","☕","I drink hot tea from a ____ with a handle."),
  v("ev_bowl","bowl","cuenco, bol","🥣","Mum put the soup in a big, round ____."),
  v("ev_fan","fan","abanico (o ventilador)","","It's very hot. I need a ____ to cool the air."),
  v("ev_lamp","lamp","lámpara","💡","It's dark in my room. Turn on the ____ to get some light."),
  v("ev_phone","phone","teléfono","☎️","I call my grandma on the ____."),
  v("ev_comb","comb","peine","","I use a ____ to do my hair."),
  v("ev_coins","coins","monedas","💰","People paid with gold ____ in the past.")]},
 {id:"roman",unit:8,pag:"100",ico:"🏛️",nombre:"A Roman town",es:"Una ciudad romana",tipo:"vocab",items:[
  v("rt_walls","walls","murallas","🧱","The tall ____ were all around the town."),
  v("rt_gate","gate","puerta de la ciudad (portón)","🚪","Soldiers stood at the ____ to let people in and out of the town."),
  v("rt_street","street","calle","🛣️","People walked along the ____ with shops on both sides."),
  v("rt_market","market square","plaza del mercado","⛲","Farmers sold fruit at stalls in the big, open ____ of the town."),
  v("rt_theatre","theatre","teatro","🎭","People sat and watched the actors on the stage in the ____."),
  v("rt_hall","town hall","municipalidad (ayuntamiento)","🏛️","The leaders of the town worked in the ____.")]}
];

// ---------------- verbos: los regulares (+ed) y los irregulares. «aff» y «neg» son oraciones de ejemplo propias; «regla» dice cómo se arma el pasado
const verbo=(base,past,es,aff,affEs,neg,negEs,extra)=>Object.assign({id:"vb_"+base,base,past,es,aff,affEs,neg,negEs,kBase:A(base),kPast:A(past),kAff:A(aff),kNeg:A(neg)},extra||{});
const REG=[
 verbo("load","loaded","cargar","Tom loaded the dishwasher after dinner.","Tom cargó el lavavajillas después de cenar.","Tom didn't load the dishwasher after dinner.","Tom no cargó el lavavajillas después de cenar.",{regla:"ed",obj:"the dishwasher",emoji:"📥",casa:1}),
 verbo("wash","washed","lavar","Mia washed the dishes yesterday.","Mia lavó los platos ayer.","Mia didn't wash the dishes yesterday.","Mia no lavó los platos ayer.",{regla:"ed",obj:"the dishes",emoji:"🍽️",casa:1}),
 verbo("hoover","hoovered","pasar la aspiradora","Dad hoovered the floor on Saturday.","Papá pasó la aspiradora el sábado.","Dad didn't hoover the floor on Saturday.","Papá no pasó la aspiradora el sábado.",{regla:"ed",obj:"the floor",emoji:"🧹",casa:1}),
 verbo("water","watered","regar","We watered the plants last week.","Regamos las plantas la semana pasada.","We didn't water the plants last week.","No regamos las plantas la semana pasada.",{regla:"ed",obj:"the plants",emoji:"🌱",casa:1}),
 verbo("cook","cooked","cocinar","Grandma cooked the dinner last night.","La abuela cocinó la cena anoche.","Grandma didn't cook the dinner last night.","La abuela no cocinó la cena anoche.",{regla:"ed",obj:"the dinner",emoji:"🍳",casa:1}),
 verbo("clear","cleared","levantar (la mesa)","Lucy cleared the table after lunch.","Lucy levantó la mesa después del almuerzo.","Lucy didn't clear the table after lunch.","Lucy no levantó la mesa después del almuerzo.",{regla:"ed",obj:"the table",emoji:"🍴",casa:1}),
 verbo("clean","cleaned","limpiar","I cleaned my room on Sunday.","Limpié mi cuarto el domingo.","I didn't clean my room on Sunday.","No limpié mi cuarto el domingo.",{regla:"ed",obj:"the room",emoji:"🛏️",casa:1}),
 verbo("tidy","tidied","ordenar","Emma tidied her room yesterday.","Emma ordenó su cuarto ayer.","Emma didn't tidy her room yesterday.","Emma no ordenó su cuarto ayer.",{regla:"ied",obj:"the toys",emoji:"🧸",casa:1}),
 verbo("watch","watched","mirar","Ben watched TV after dinner.","Ben miró tele después de cenar.","Ben didn't watch TV after dinner.","Ben no miró tele después de cenar.",{regla:"ed"}),
 verbo("listen","listened","escuchar","We listened to music in the car.","Escuchamos música en el auto.","We didn't listen to music in the car.","No escuchamos música en el auto.",{regla:"ed"}),
 verbo("play","played","jugar","Peter played tennis with his brother.","Peter jugó al tenis con su hermano.","Peter didn't play tennis with his brother.","Peter no jugó al tenis con su hermano.",{regla:"ed"}),
 verbo("paint","painted","pintar","Lucy painted a picture of her dog.","Lucy pintó un cuadro de su perro.","Lucy didn't paint a picture of her dog.","Lucy no pintó un cuadro de su perro.",{regla:"ed"}),
 verbo("design","designed","diseñar","Max designed a robot for his project.","Max diseñó un robot para su proyecto.","Max didn't design a robot for his project.","Max no diseñó un robot para su proyecto.",{regla:"ed"}),
 verbo("help","helped","ayudar","Ben helped his mum yesterday.","Ben ayudó a su mamá ayer.","Ben didn't help his mum yesterday.","Ben no ayudó a su mamá ayer.",{regla:"ed"}),
 verbo("want","wanted","querer","The children wanted a party.","Los chicos querían una fiesta.","The children didn't want a party.","Los chicos no querían una fiesta.",{regla:"ed"}),
 verbo("visit","visited","visitar","Sara visited her grandparents last Sunday.","Sara visitó a sus abuelos el domingo pasado.","Sara didn't visit her grandparents last Sunday.","Sara no visitó a sus abuelos el domingo pasado.",{regla:"ed"}),
 verbo("decorate","decorated","decorar","They decorated the garden for the party.","Decoraron el jardín para la fiesta.","They didn't decorate the garden for the party.","No decoraron el jardín para la fiesta.",{regla:"d",obj:"the garden",emoji:"🎈"}),
 verbo("invite","invited","invitar","We invited all our friends.","Invitamos a todos nuestros amigos.","We didn't invite all our friends.","No invitamos a todos nuestros amigos.",{regla:"d"}),
 verbo("prepare","prepared","preparar","Mum prepared the food in the morning.","Mamá preparó la comida a la mañana.","Mum didn't prepare the food in the morning.","Mamá no preparó la comida a la mañana.",{regla:"d",obj:"the food",emoji:"🥗"}),
 verbo("bake","baked","hornear","Grandma baked a cake for the party.","La abuela horneó una torta para la fiesta.","Grandma didn't bake a cake for the party.","La abuela no horneó una torta para la fiesta.",{regla:"d"}),
 verbo("dance","danced","bailar","They danced at the party.","Bailaron en la fiesta.","They didn't dance at the party.","No bailaron en la fiesta.",{regla:"d"}),
 verbo("live","lived","vivir","My uncle lived in Italy last year.","Mi tío vivió en Italia el año pasado.","My uncle didn't live in Italy last year.","Mi tío no vivió en Italia el año pasado.",{regla:"d"}),
 verbo("use","used","usar","The Egyptians used boats on the river.","Los egipcios usaban barcos en el río.","The Egyptians didn't use plastic boats.","Los egipcios no usaban barcos de plástico.",{regla:"d"}),
 // por si acaso (no están en las páginas del libro: sirven para practicar las reglas de escritura)
 verbo("study","studied","estudiar","Anna studied English last night.","Anna estudió inglés anoche.","Anna didn't study English last night.","Anna no estudió inglés anoche.",{regla:"ied",extra:1}),
 verbo("carry","carried","llevar (cargando)","Dad carried the boxes upstairs.","Papá llevó las cajas arriba.","Dad didn't carry the boxes upstairs.","Papá no llevó las cajas arriba.",{regla:"ied",extra:1}),
 verbo("stop","stopped","parar","The bus stopped at the gate.","El colectivo paró en el portón.","The bus didn't stop at the gate.","El colectivo no paró en el portón.",{regla:"doble",extra:1}),
 verbo("plan","planned","planear","We planned a surprise party.","Planeamos una fiesta sorpresa.","We didn't plan a surprise party.","No planeamos una fiesta sorpresa.",{regla:"doble",extra:1})
];
// irregulares: los del libro (p. 98 y 99: go, have, make, eat, drink, see, write, fly, build, buy y wear) y, aparte, unos «por si acaso»
// «mal» son las formas con las que se suele equivocar (para las opciones); «cue» es la frase de las consignas «escribí una oración» (sin el sujeto) y «cueRest» lo que va después del pasado
const IRR=[
 verbo("go","went","ir","We went to the park on Sunday.","Fuimos al parque el domingo.","We didn't go to school on Sunday.","No fuimos a la escuela el domingo.",{mal:["goed","gone"],cue:"go to school",cueRest:"to school"}),
 verbo("have","had","tener, comer (una comida)","We had dinner at a restaurant.","Cenamos en un restaurante.","We didn't have dinner at home.","No cenamos en casa.",{mal:["haved","has"],cue:"have dinner at a restaurant",cueRest:"dinner at a restaurant"}),
 verbo("make","made","hacer","Mum made cupcakes last night.","Mamá hizo cupcakes anoche.","Mum didn't make a cake last night.","Mamá no hizo una torta anoche.",{mal:["maked","makes"],cue:"make cupcakes",cueRest:"cupcakes"}),
 verbo("eat","ate","comer","I ate pasta for lunch yesterday.","Ayer comí pasta para el almuerzo.","I didn't eat fish yesterday.","Ayer no comí pescado.",{mal:["eated","eaten"],cue:"eat fruit",cueRest:"fruit"}),
 verbo("drink","drank","beber","He drank a glass of milk.","Tomó un vaso de leche.","He didn't drink any juice.","No tomó nada de jugo.",{mal:["drinked","drunk"],cue:"drink milk",cueRest:"milk"}),
 verbo("see","saw","ver","I saw a big castle on the trip.","Vi un castillo grande en el paseo.","I didn't see the castle on the trip.","No vi el castillo en el paseo.",{mal:["seed","seen"],cue:"see a film",cueRest:"a film"}),
 verbo("write","wrote","escribir","She wrote a letter to her friend.","Escribió una carta a su amiga.","She didn't write a letter to her friend.","No escribió una carta a su amiga.",{mal:["writed","written"],cue:"write a letter",cueRest:"a letter"}),
 verbo("fly","flew","volar","The boy flew a kite in the park.","El nene voló un barrilete en el parque.","The boy didn't fly a kite yesterday.","El nene no voló un barrilete ayer.",{mal:["flied","flown"],cue:"fly a kite",cueRest:"a kite"}),
 verbo("build","built","construir","The Romans built walls around their towns.","Los romanos construyeron murallas alrededor de sus ciudades.","The Vikings didn't build pyramids.","Los vikingos no construyeron pirámides.",{mal:["builded","builted"],cue:"build a wall",cueRest:"a wall"}),
 verbo("buy","bought","comprar","Dad bought some flowers.","Papá compró unas flores.","Dad didn't buy any flowers.","Papá no compró flores.",{mal:["buyed","buy"],cue:"buy a book",cueRest:"a book"}),
 verbo("wear","wore","usar (ropa), llevar puesto","Jack wore jeans yesterday.","Jack usó jeans ayer.","Jack didn't wear a coat yesterday.","Jack no usó abrigo ayer.",{mal:["weared","worn"],cue:"wear jeans",cueRest:"jeans"}),
 // por si acaso (verbos irregulares muy comunes; no están en las páginas del libro)
 verbo("take","took","tomar, llevar","We took a bus to the museum.","Tomamos un colectivo al museo.","We didn't take a bus to the museum.","No tomamos un colectivo al museo.",{mal:["taked","taken"],cue:"take a bus",cueRest:"a bus",extra:1}),
 verbo("come","came","venir","Many guests came to the party.","Vinieron muchos invitados a la fiesta.","My cousins didn't come to the party.","Mis primos no vinieron a la fiesta.",{mal:["comed","come"],cue:"come to the party",cueRest:"to the party",extra:1}),
 verbo("give","gave","dar","Mia gave me a present.","Mia me dio un regalo.","Mia didn't give me a present.","Mia no me dio un regalo.",{mal:["gived","given"],cue:"give a present",cueRest:"a present",extra:1}),
 verbo("get","got","conseguir, recibir","I got a new bike for my birthday.","Recibí una bici nueva para mi cumpleaños.","I didn't get a new bike for my birthday.","No recibí una bici nueva para mi cumpleaños.",{mal:["getted","gotten"],cue:"get a present",cueRest:"a present",extra:1}),
 verbo("run","ran","correr","The children ran in the garden.","Los chicos corrieron en el jardín.","The children didn't run in the garden.","Los chicos no corrieron en el jardín.",{mal:["runned","run"],cue:"run in the park",cueRest:"in the park",extra:1}),
 verbo("swim","swam","nadar","We swam in the river.","Nadamos en el río.","We didn't swim in the river.","No nadamos en el río.",{mal:["swimmed","swum"],cue:"swim in the river",cueRest:"in the river",extra:1}),
 verbo("sleep","slept","dormir","The baby slept all night.","El bebé durmió toda la noche.","The baby didn't sleep all night.","El bebé no durmió toda la noche.",{mal:["sleeped","sleept"],cue:"sleep all night",cueRest:"all night",extra:1}),
 verbo("find","found","encontrar","I found a coin in the garden.","Encontré una moneda en el jardín.","I didn't find my keys.","No encontré mis llaves.",{mal:["finded","fownd"],cue:"find a coin",cueRest:"a coin",extra:1}),
 verbo("sing","sang","cantar","They sang a song at the party.","Cantaron una canción en la fiesta.","They didn't sing at the party.","No cantaron en la fiesta.",{mal:["singed","sung"],cue:"sing a song",cueRest:"a song",extra:1})
];
// la corrección de la tabla «¿qué hicieron ayer?» (✘ = didn't + verbo) y de «escribí una oración» dice la respuesta que se muestra
REG.filter(v=>v.casa).forEach(v=>{v.kDidnt=A("didn't "+v.base)});
IRR.forEach(v=>{v.kEsc=A("I "+v.past+" "+v.cueRest+".");v.kEscNeg=A("I didn't "+v.cue+".")});
// «be» (was / were) va aparte: cambia según quién sea. «ok» es la forma correcta; «neg» dice si la oración es negativa
const BE=[
 {id:"be1",s:"The brothers ____ friends again.",ok:"were",neg:0,es:"Los hermanos volvieron a ser amigos."},
 {id:"be2",s:"Max ____ angry at first.",ok:"was",neg:0,es:"Max estaba enojado al principio."},
 {id:"be3",s:"The old houses ____ very big.",ok:"weren't",neg:1,es:"Las casas viejas no eran muy grandes."},
 {id:"be4",s:"The market ____ very busy.",ok:"was",neg:0,es:"El mercado estaba muy concurrido."},
 {id:"be5",s:"I ____ at school yesterday.",ok:"wasn't",neg:1,es:"Ayer no estuve en la escuela."},
 {id:"be6",s:"The Romans ____ good builders.",ok:"were",neg:0,es:"Los romanos eran buenos constructores."},
 {id:"be7",s:"The street ____ clean.",ok:"wasn't",neg:1,es:"La calle no estaba limpia."},
 {id:"be8",s:"We ____ at the party.",ok:"weren't",neg:1,es:"No estuvimos en la fiesta."}
].map(x=>Object.assign(x,{lleno:LLENO(x.s,x.ok),kLleno:A(LLENO(x.s,x.ok))}));
B3.kBe={was:A("was"),were:A("were"),wasnt:A("wasn't"),werent:A("weren't")};

// ---------------- «had to» (tuve que): afirmativo y negativo
const ht=(id,aff,affEs,neg,negEs)=>({id,aff,affEs,neg,negEs,kAff:A(aff),kNeg:A(neg)});
const HADTO=[
 ht("ht_tidy","Emma had to tidy up her room.","Emma tuvo que ordenar su cuarto.","Emma didn't have to tidy up her room.","Emma no tuvo que ordenar su cuarto."),
 ht("ht_set","We had to set the table for ten people.","Tuvimos que poner la mesa para diez personas.","We didn't have to set the table.","No tuvimos que poner la mesa."),
 ht("ht_dress","I had to dress up for the party.","Tuve que vestirme elegante para la fiesta.","I didn't have to dress up for the party.","No tuve que vestirme elegante para la fiesta."),
 ht("ht_food","Mum had to prepare food all morning.","Mamá tuvo que preparar comida toda la mañana.","Mum didn't have to prepare food.","Mamá no tuvo que preparar comida."),
 ht("ht_decorate","The boys had to decorate the hall.","Los chicos tuvieron que decorar el salón.","The boys didn't have to decorate the hall.","Los chicos no tuvieron que decorar el salón."),
 ht("ht_invite","Dad had to invite our neighbours.","Papá tuvo que invitar a nuestros vecinos.","Dad didn't have to invite our neighbours.","Papá no tuvo que invitar a nuestros vecinos."),
 ht("ht_dishes","Anna had to wash the dishes after the party.","Anna tuvo que lavar los platos después de la fiesta.","Anna didn't have to wash the dishes after the party.","Anna no tuvo que lavar los platos después de la fiesta."),
 ht("ht_hoover","They had to hoover the floor.","Tuvieron que pasar la aspiradora.","They didn't have to hoover the floor.","No tuvieron que pasar la aspiradora."),
 ht("ht_room","I had to clean my room on Saturday.","Tuve que limpiar mi cuarto el sábado.","I didn't have to clean my room on Saturday.","No tuve que limpiar mi cuarto el sábado."),
 ht("ht_water","Tom had to water the plants.","Tom tuvo que regar las plantas.","Tom didn't have to water the plants.","Tom no tuvo que regar las plantas.")
];

// la «lista de cosas por hacer» (to-do list) de la p. 89: cada renglón es [quién, qué, el ítem de «had to» que practica, traducción]. Las oraciones salen de acá («Leo had to set the table.») y tienen su audio
const LISTAS=[
 {titulo:"To do before the party",items:[["Ana","invite guests","ht_invite","Ana tuvo que invitar gente a la fiesta."],["Leo","set the table","ht_set","Leo tuvo que poner la mesa."],["Mum","prepare food","ht_food","Mamá tuvo que preparar la comida."],["Dad","decorate the hall","ht_decorate","Papá tuvo que decorar el salón."]]},
 {titulo:"To do before the party",items:[["Sofi","tidy up","ht_tidy","Sofi tuvo que ordenar."],["Tom","hoover the floor","ht_hoover","Tom tuvo que pasar la aspiradora."],["Grandma","wash the dishes","ht_dishes","La abuela tuvo que lavar los platos."],["Max","water the plants","ht_water","Max tuvo que regar las plantas."]]},
 {titulo:"To do before the party",items:[["Lucy","dress up","ht_dress","Lucy tuvo que vestirse elegante."],["Ben","clean his room","ht_room","Ben tuvo que limpiar su cuarto."]]}
];
LISTAS.forEach(l=>l.items=l.items.map(([who,task,id,es])=>({who,task,id,es,oracion:who+" had to "+task+".",k:A(who+" had to "+task+".")})));
// frases útiles para hablar (p. 85, «I have to…»)
VOCAB[0].util=[["How do you help at home?","¿Cómo ayudás en tu casa?"],["I have to water the plants.","Tengo que regar las plantas."],["I have to load the dishwasher.","Tengo que cargar el lavavajillas."]].map(([en,es])=>({en,es,k:A(en)}));

// «have to / has to / had to»: el contraste presente / pasado (p. 85 «I have to…» y p. 89 «had to es el pasado de have to»). sub = el sujeto, vp = lo que tenía que hacer
const SUBVP={ht_tidy:["Emma","tidy up her room"],ht_set:["we","set the table"],ht_dress:["I","dress up for the party"],ht_food:["Mum","prepare food"],ht_decorate:["the boys","decorate the hall"],ht_invite:["Dad","invite our neighbours"],ht_dishes:["Anna","wash the dishes"],ht_hoover:["they","hoover the floor"],ht_room:["I","clean my room"],ht_water:["Tom","water the plants"]};
HADTO.forEach(h=>{h.sub=SUBVP[h.id][0];h.vp=SUBVP[h.id][1]});
B3.kHT={had:A("had to"),has:A("has to"),have:A("have to")};

// ---------------- historias y lecturas de la Unit 7 (pp. 90 a 93): hechos que se preguntan de varias maneras. Todas las oraciones son propias (un resumen), no las del libro
// hecho(id, pregunta, respuesta, tres respuestas falsas, la pregunta en castellano, oración verdadera, su traducción, versión falsa, principio, final, orden en la historia)
const hecho=(id,q,ok,mal,es,ver,verEs,falso,izq,der,ev,orden)=>({id,q,ok,mal,es,ver,verEs,falso,izq,der,ev:ev||"",orden:orden||0,kVer:A(ver)});
const HIST7=[
 hecho("hf_party","What did the animals want to have?","a party",["a picnic","a concert","a race"],"¿Qué querían hacer los animales?","The animals wanted to have a party.","Los animales querían hacer una fiesta.","The animals wanted to go to the beach.","The animals wanted","to have a party.","The animals wanted to have a party.",1),
 hecho("hf_tidy","Who tidied up the farmyard?","Donkey",["the ducks","the cat","the horse"],"¿Quién ordenó la granja?","Donkey tidied up the farmyard.","El burro ordenó la granja.","The ducks tidied up the farmyard.","Donkey","tidied up the farmyard.","Donkey tidied up the farmyard.",2),
 hecho("hf_busy","Why didn't the other animals help Donkey?","They were busy or tired.",["They were asleep.","They were at school.","They didn't know about the party."],"¿Por qué los otros animales no ayudaron al burro?","The other animals said they were busy or tired.","Los otros animales dijeron que estaban ocupados o cansados.","The other animals helped Donkey with everything.","The other animals said they were","busy or tired."),
 hecho("hf_food","Who prepared the food?","Donkey",["the cat","the horse","the ducks"],"¿Quién preparó la comida?","Donkey prepared the food.","El burro preparó la comida.","The cat prepared the food.","Then Donkey","prepared the food.","Then Donkey prepared the food.",3),
 hecho("hf_nofun","How was the party at first?","It wasn't much fun.",["It was a lot of fun.","It was in the city.","It was at school."],"¿Cómo fue la fiesta al principio?","At first, the party wasn't much fun.","Al principio, la fiesta no fue muy divertida.","At first, the party was a lot of fun.","At first, the party","wasn't much fun.","At first, the party wasn't much fun.",4),
 hecho("hf_no","Why did Donkey say no to the other animals?","Because they didn't help.",["Because they were late.","Because there was no food.","Because they were noisy."],"¿Por qué el burro les dijo que no a los otros animales?","Donkey said no because the other animals didn't help.","El burro dijo que no porque los otros animales no ayudaron.","Donkey said no because the other animals were late.","Donkey said no because they","didn't help.","Donkey said no to the other animals.",5),
 hecho("hf_sorry","How did the other animals feel in the end?","very sorry",["very angry","very bored","very hungry"],"¿Cómo se sintieron los otros animales al final?","The other animals were very sorry.","Los otros animales se sintieron muy mal y pidieron perdón.","The other animals were very angry.","The other animals were","very sorry.","The other animals were very sorry.",6),
 hecho("hf_tidy2","What did they all do after the party?","They all helped to tidy up.",["They went shopping.","They decorated the farmyard.","They cooked dinner."],"¿Qué hicieron todos después de la fiesta?","After the party, they all helped to tidy up.","Después de la fiesta, todos ayudaron a ordenar.","After the party, nobody helped to tidy up.","After the party, they all","helped to tidy up.","After the party, they all helped to tidy up.",7)
];
const CULT7=[
 hecho("cf_japan","Which country has «Grandparents' day»?","Japan",["the USA","Argentina","England"],"¿Qué país tiene el «Día de los abuelos»?","Grandparents' day is a festival in Japan.","El Día de los abuelos es una fiesta de Japón.","Grandparents' day is a festival in the USA.","Grandparents' day is a festival in","Japan."),
 hecho("cf_sept","When is Grandparents' day in Japan?","in September",["in November","in January","in June"],"¿Cuándo es el Día de los abuelos en Japón?","Grandparents' day is in September.","El Día de los abuelos es en septiembre.","Grandparents' day is in November.","Grandparents' day is in","September."),
 hecho("cf_concert","What does Yukiko's school have for the older people?","a concert",["a football match","a picnic","a market"],"¿Qué hace la escuela de Yukiko para los mayores?","Yukiko's school has a concert.","La escuela de Yukiko hace un concierto.","Yukiko's school has a football match.","Yukiko's school has","a concert."),
 hecho("cf_sing","Who sings and dances at the concert?","the children",["the older people","the teachers","the parents"],"¿Quiénes cantan y bailan en el concierto?","The children sing and dance for the older people.","Los chicos cantan y bailan para los mayores.","The older people sing and dance for the children.","The children sing and dance for","the older people."),
 hecho("cf_visit","Who does Yukiko visit after school?","her grandparents",["her teacher","her cousins","her friends"],"¿A quién visita Yukiko después de la escuela?","After school, Yukiko visits her grandparents.","Después de la escuela, Yukiko visita a sus abuelos.","After school, Yukiko visits her cousins.","After school, Yukiko visits","her grandparents."),
 hecho("cf_present","What does Yukiko make for her grandparents?","a present",["a cake","a robot","a hat"],"¿Qué hace Yukiko para sus abuelos?","Yukiko makes a present and buys flowers.","Yukiko hace un regalo y compra flores.","Yukiko makes a cake and buys a hat.","Yukiko makes a present and buys","flowers."),
 hecho("cf_garden","What did Yukiko and her brother do last year?","They decorated the garden.",["They built a house.","They painted a car.","They cooked all the food."],"¿Qué hicieron Yukiko y su hermano el año pasado?","Last year, Yukiko and her little brother helped to decorate the garden.","El año pasado, Yukiko y su hermanito ayudaron a decorar el jardín.","Last year, Yukiko and her brother built a house.","Last year, they helped to decorate","the garden."),
 hecho("cf_usa","In which country is Thanksgiving a festival?","the USA",["Japan","England","Italy"],"¿En qué país se festeja Thanksgiving?","Thanksgiving is a festival in the USA.","Thanksgiving es una fiesta de Estados Unidos.","Thanksgiving is a festival in Japan.","Thanksgiving is a festival in","the USA."),
 hecho("cf_clear","Who clears the table after the Thanksgiving meal?","the children",["the grandparents","the guests","the cook"],"¿Quiénes levantan la mesa después de la comida de Thanksgiving?","After the meal, the children clear the table.","Después de la comida, los chicos levantan la mesa.","After the meal, the grandparents clear the table.","After the meal, the children","clear the table.")
];

// ---------------- preguntas en pasado (p. 101): «Did + sujeto + verbo en forma base …?» y las respuestas cortas «Yes, they did. / No, they didn't.»
// dq(id, sujeto, pronombre de la respuesta corta, verbo, su pasado, lo que sigue, la pregunta en castellano, la oración afirmativa en pasado)
const dq=(id,sujeto,pron,base,past,resto,es,decl)=>{
  const q="Did "+sujeto+" "+base+" "+resto+"?",si="Yes, "+pron+" did.",no="No, "+pron+" didn't.";
  return {id,sujeto,pron,base,past,resto,q,es,si,no,decl,kQ:A(q),kSi:A(si),kNo:A(no),kDecl:A(decl)};
};
const DID=[
 dq("dq_have","the Romans","they","have","had","a theatre","¿Los romanos tenían un teatro?","The Romans had a theatre."),
 dq("dq_build","the Romans","they","build","built","walls","¿Los romanos construyeron murallas?","The Romans built walls."),
 dq("dq_wear","the soldiers","they","wear","wore","helmets","¿Los soldados usaban cascos?","The soldiers wore helmets."),
 dq("dq_make","the Romans","they","make","made","coins","¿Los romanos hacían monedas?","The Romans made coins."),
 dq("dq_play","the children","they","play","played","in the garden","¿Los chicos jugaron en el jardín?","The children played in the garden."),
 dq("dq_buy","Dad","he","buy","bought","some flowers","¿Papá compró flores?","Dad bought some flowers."),
 dq("dq_fly","the boy","he","fly","flew","a kite","¿El nene voló un barrilete?","The boy flew a kite."),
 dq("dq_clean","Tom","he","clean","cleaned","his room","¿Tom limpió su cuarto?","Tom cleaned his room."),
 dq("dq_eat","Anna","she","eat","ate","pasta for lunch","¿Anna comió pasta en el almuerzo?","Anna ate pasta for lunch."),
 dq("dq_write","Mia","she","write","wrote","a letter","¿Mia escribió una carta?","Mia wrote a letter."),
 dq("dq_go","you","I","go","went","to the park on Sunday","¿Fuiste al parque el domingo?","You went to the park on Sunday."),
 dq("dq_see","you","I","see","saw","the castle","¿Viste el castillo?","You saw the castle.")
];

B3.VOCAB=VOCAB;B3.REG=REG;B3.IRR=IRR;B3.BE=BE;B3.HADTO=HADTO;B3.LISTAS=LISTAS;B3.DID=DID;B3.HIST7=HIST7;B3.CULT7=CULT7;
// los temas en el orden de las units
B3.TEMAS=[
 VOCAB[0],
 {id:"regular",unit:7,pag:"86 y 87",ico:"⏮️",nombre:"Past simple: regular verbs",es:"Verbos regulares en pasado (+ed): afirmativo y negativo",tipo:"regular",items:REG},
 VOCAB[1],
 {id:"hadto",unit:7,pag:"89",ico:"📋",nombre:"Had to",es:"«Tuve que…»: had to / didn't have to",tipo:"hadto",items:HADTO},
 {id:"historia1",unit:7,pag:"90 y 91",ico:"🐴",nombre:"Story: The farmyard party",es:"La historia «La fiesta en la granja»",tipo:"historia",fuente:"la historia «The farmyard party»",items:HIST7,
  notas:["Los animales de la granja quieren hacer una fiesta, pero casi todo el trabajo (ordenar y preparar la comida) lo hace el burro, <b>Donkey</b>, porque los demás dicen que están ocupados o cansados. Al principio la fiesta no es divertida; después los animales piden perdón y al final <b>todos ayudan</b>.","En la historia se usan las estructuras de la unit: <i>had to</i> (<i>they had to tidy up</i>), el negativo con <i>didn't</i> (<i>you didn't help</i>), <i>was / were</i> (<i>the animals were sorry</i>) y verbos en <b>-ed</b> (<i>tidied, prepared, helped</i>)."]},
 {id:"cultura1",unit:7,pag:"92 y 93",ico:"🎎",nombre:"Culture: Family festivals",es:"Fiestas de familia: Estados Unidos y Japón",tipo:"lectura",fuente:"la lectura",items:CULT7,
  notas:["<b>Thanksgiving</b> (Día de Acción de Gracias) es una fiesta de Estados Unidos: se invita gente, se prepara comida y se hace una gran comida en familia. En Japón hay un <b>Día de los abuelos</b> (<i>Grandparents' day</i> o <i>Respect for the elderly day</i>), en septiembre: los chicos hacen un concierto para los mayores y Yukiko visita a sus abuelos.","Palabras de la lectura: <b>parents</b> (padres), <b>grandparents</b> (abuelos), <b>son</b> (hijo), <b>daughter</b> (hija), <b>festival</b> (fiesta), <b>present</b> (regalo). Recordá: el pasado regular lleva <b>-ed</b>; si termina en <b>y</b> (tidy) pasa a <b>-ied</b>; si termina en <b>e</b> (dance, bake) sólo se agrega <b>-d</b>.","<b>Proyecto de la unidad (p. 94):</b> armar un póster de fiestas familiares: hacer una lista de fiestas y elegir una, dibujar tres cosas que se hacen para prepararse, escribir una oración por cada dibujo, escribir qué se recuerda de la fiesta del año pasado (en pasado) y presentar el póster a la clase."]},
 VOCAB[2],
 {id:"irregular",unit:8,pag:"98, 99 y 101",ico:"⚡",nombre:"Past simple: irregular verbs",es:"Verbos irregulares en pasado",tipo:"irregular",items:IRR.concat([{id:"vb_be",be:1,base:"be",past:"was / were",es:"ser, estar"}])},
 VOCAB[3],
 {id:"preguntas",unit:8,pag:"101",ico:"❓",nombre:"Past simple: questions",es:"Preguntas en pasado: Did …? Yes, they did. / No, they didn't.",tipo:"preguntas",items:DID}
];
B3.tema=id=>B3.TEMAS.find(t=>t.id===id);

// reglas (en castellano) que se muestran al corregir
B3.REGLAS={
  ed:"Los verbos regulares forman el pasado con -ed: wash → washed.",
  d:"Si el verbo ya termina en -e, sólo se agrega -d: decorate → decorated.",
  ied:"Si termina en consonante + y, la y se cambia por -ied: tidy → tidied.",
  doble:"Si el verbo tiene UNA sola sílaba y termina en consonante + vocal + consonante, se repite la última letra: stop → stopped, plan → planned.",
  didnt:"En negativo se usa didn't + el verbo en su forma base (sin -ed): She didn't wash the dishes.",
  irr:"Es un verbo irregular: no lleva -ed y hay que aprenderlo de memoria (go → went).",
  irrNeg:"En negativo también se usa didn't + la forma base: I didn't go (no «didn't went»).",
  hadto:"had to + verbo = «tuve (o tuvo) que…» (es el pasado de have to). En negativo: didn't have to + verbo: «no tuve que…».",
  did:"En las preguntas en pasado se usa Did + sujeto + el verbo en forma base (sin -ed ni pasado): Did he wear a helmet? Se contesta Yes, he did. / No, he didn't (sin repetir el verbo).",
  was:"was va con I, he, she, it; were va con we, you, they y con plurales. Negativo: wasn't / weren't."
};
})();
