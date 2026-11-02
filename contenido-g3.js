// MÓDULO 1 · Trinity GESE Grade 3 (Felu). Contenido: preguntas del examinador, dibujos, textos para la IA, vocabulario y examen escrito.
// El motor (motor.js) es el mismo para todos los módulos y lee de acá lo que necesita (ver README, «Módulos»).
const MOD={id:"g3",grado:3,nombre:"Felu",titulo:"Trinity GESE Grade 3",minutos:7,notasKey:"trinity_notas",iaMax:14};
const OPEN=[
 {q:"Hello! Come in and sit down, please. How are you today?",a:"I'm fine, thank you. And you?",responde:true,
  need:[[/fine|\bgood\b|great|\bok\b|okay|\bwell\b|happy/,"Decí cómo estás: \"I'm fine, thank you\"."]],
  react:t=>/and you|how are you/.test(t)?"I'm very well, thank you for asking!":"Good! I'm very well too."},
 {q:"What's your name?",a:"My name is Felu.",
  need:[[/my name is|i'm \w|i am \w/,"Empezá con \"My name is…\"."]],
  react:t=>{const m=t.match(/(?:my name is|i'm|i am)\s+([a-z]+)/);if(m)kidName=cap(m[1]);return kidName?`Nice to meet you, ${kidName}!`:"Nice to meet you!"}}
];
// ---- Pasos de la charla, ordenados por los temas oficiales del Trinity GESE Grade 3 (A2.1):
// vida en casa · lugares del barrio y direcciones · lugar de estudio · rutina y horas · tiempo libre y can/can't ·
// familia y trabajos · clima y fechas · pasado (was/were) · describir dibujos (presente continuo) · pregunta del candidato.
// Cada paso: intro (frase de enlace), q (pregunta), a (respuesta modelo), need (qué tiene que tener la respuesta),
// hints (cómo se dice en inglés lo que probablemente necesite), picture (dibujo en emojis), follow (repregunta).
// Frases de enlace por tema: cada pregunta lleva una, así no arrancan todas igual.
const INTRO={
 casa:["Now, let's talk about your home. ","Tell me about your home. ","Let's talk about your house. "],
 barrio:["Let's talk about where you live. ","Now, let's talk about your neighbourhood. ","Tell me about your street. "],
 escuela:["Let's talk about your school. ","Now, let's talk about school. ","Tell me about your school. "],
 rutina:["Now tell me about your daily routine. ","Now tell me about your day. ","Let's talk about your day. "],
 libre:["Let's talk about your free time. ","Now, let's talk about your hobbies. ","Tell me about your free time. "],
 familia:["Let's talk about your family. ","Now, let's talk about your family. ","Tell me about your family. "],
 clima:["Now, a question about the weather. ","Let's talk about the weather. ","Now, let's talk about the seasons. "],
 fecha:["Now, let's talk about dates. ","Now, a question about days and months. ","Let's talk about days and months. "],
 pasado:["Now, let's talk about yesterday. ","Now, let's talk about last weekend. ","Let's talk about the past. "]
};
const MIDDLE=[
 // ---- casa (vida en casa)
 {g:"casa",intro:"Now, let's talk about your home. ",q:"How many rooms are there in your house?",a:"There are five rooms in my house.",
  need:[[NUM,"Decí cuántas habitaciones hay: un número."],[/there (is|are)/,"Empezá con \"There are… rooms\"."]],
  hints:[H("hay","there are"),H("habitaciones","rooms"),H("mi casa","my house")],
  react:()=>pick(["That sounds like a nice house!","Oh, that's a good size."]),
  follow:()=>({q:"And what is in your bedroom?",a:"There is a bed, a desk and a wardrobe.",hints:[H("cama","bed"),H("escritorio","desk"),H("ropero","wardrobe")],
    need:[[/bed|desk|wardrobe|lamp|chair|table|toy|tv|bookcase|carpet|curtain|nightstand/,"Nombrá cosas: a bed, a desk, a wardrobe…"]],react:()=>"Very nice."})},
 {g:"casa",intro:"Now, let's talk about your home. ",q:"What is your favourite room in your house? Why?",a:"My favourite room is the living room because I watch TV there.",
  need:[[/kitchen|bedroom|bathroom|living|dining|garage|garden|attic|room/,"Nombrá una habitación: kitchen, bedroom, living room…"],[/because/,"Explicá con \"because…\"."]],
  hints:[H("mi habitación favorita","my favourite room"),H("porque","because"),H("living","living room")],
  react:()=>"Nice choice!"},
 {g:"casa",intro:"Now, let's talk about your home. ",q:"Who do you live with?",a:"I live with my mum, my dad and my brother.",
  need:[[/i live with|with my/,"Usá \"I live with…\"."],[/mum|mom|dad|mother|father|brother|sister|grand|aunt|uncle|cousin|friend|dog|cat/,"Nombrá a quién: my mum, my dad…"]],
  hints:[H("vivo con","I live with"),H("mi mamá","my mum"),H("mi hermano","my brother")],
  react:()=>"That's a lovely family."},
 // ---- barrio (lugares del barrio, ubicación y direcciones)
 {g:"barrio",intro:"Let's talk about where you live. ",q:"Is your house near your school?",a:"Yes, it is. It's near my school.",
  need:[[/yes|no|near|far|\bis\b|isn't/,"Contestá \"Yes, it is\" o \"No, it isn't\"."]],
  hints:[H("cerca de","near"),H("lejos de","far from"),H("mi escuela","my school")],
  react:t=>NO.test(t)||/isn't|far/.test(t)?"I see. It's a little far.":"Oh, that's very handy!",
  follow:()=>({q:"What can you see near your house? A park? Some shops?",a:"There is a park and a supermarket near my house.",hints:[H("parque","park"),H("supermercado","supermarket"),H("negocios","shops")],
    need:[[/there (is|are)|i can see/,"Usá \"There is a… near my house\"."],[/park|shop|supermarket|bakery|school|square|library|church|cinema|playground|station|chemist|pharmacy|caf|butcher|greengrocer|museum|bank|street/,"Nombrá un lugar: a park, a supermarket…"]],react:()=>"Lovely!"})},
 {g:"barrio",intro:"Let's talk about where you live. ",q:"Where is the supermarket? Is it near your house?",a:"It's opposite the bank, near my house.",
  need:[[/near|opposite|next to|in front of|behind|between|on the (left|right)|far/,"Decí dónde está: near, opposite, next to, in front of, behind…"]],
  hints:[H("enfrente de","opposite"),H("al lado de","next to"),H("detrás de","behind")],
  react:()=>"Thank you. That's very clear."},
 {g:"barrio",intro:"Now imagine I am at your school. ",q:"How do I get to your house from your school?",a:"Go straight on and then turn left. My house is on the right.",
  need:[[/straight|left|right|turn|cross|along|up|down/,"Usá: go straight on, turn left, turn right, cross the street…"]],
  hints:[H("seguí derecho","go straight on"),H("doblá a la izquierda","turn left"),H("y después","and then")],
  react:()=>"Great! Thank you for the directions."},
 // ---- escuela (lugar de estudio)
 {g:"escuela",intro:"Let's talk about your school. ",q:"What subjects do you study at school?",a:"I study maths, English and science.",
  need:[[/\bi (study|have|like)|we (study|have)|maths|math|english|science|history|geography|art|music|pe\b|spanish/,"Nombrá materias: maths, English, science…"]],
  hints:[H("estudio","I study"),H("matemática","maths"),H("ciencias","science")],
  react:()=>pick(["That's a lot of subjects!","Interesting!"]),
  follow:()=>({q:"What time does school finish?",a:"School finishes at one o'clock.",hints:[H("la escuela termina","school finishes"),H("a la una","at one o'clock"),H("y media","half past")],
    need:[[HORA,"Decí la hora: at one o'clock, at half past four…"],[/\bat\b/,"Con la hora va \"at\": \"at one o'clock\"."]],react:()=>"OK, thank you."})},
 {g:"escuela",intro:"Let's talk about your school. ",q:"What is your favourite subject? Why?",a:"My favourite subject is English because it's fun.",
  need:[[/favou?rite subject is|i like|my favou?rite/,"Usá \"My favourite subject is…\"."],[/because/,"Explicá con \"because…\"."]],
  hints:[H("mi materia favorita","my favourite subject"),H("porque","because"),H("es divertida","it's fun")],
  react:()=>"That's a good choice!"},
 {g:"escuela",intro:"Let's talk about your school. ",q:"What is in your classroom?",a:"There is a board, a teacher's desk and thirty chairs.",
  need:[[/there (is|are)/,"Empezá con \"There is… / There are…\"."],[/board|desk|chair|table|teacher|window|door|book|map|computer|clock|bag/,"Nombrá cosas: a board, a desk, chairs…"]],
  hints:[H("hay","there is / there are"),H("pizarrón","board"),H("sillas","chairs")],
  react:()=>"That sounds like a nice classroom."},
 // ---- rutina (rutina diaria y horas)
 {g:"rutina",intro:"Now tell me about your daily routine. ",q:"What time do you get up?",a:"I get up at seven o'clock.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at seven o'clock\"."],[HORA,"Decí la hora: seven o'clock, half past seven…"]],
  hints:[H("me levanto","I get up"),H("a las siete","at seven o'clock"),H("y media","half past")],
  react:()=>"That's early!",
  follow:()=>({q:"And what do you do after school?",a:"I do my homework and then I play with my friends.",hints:[H("hago la tarea","I do my homework"),H("y después","and then"),H("juego con mis amigos","I play with my friends")],
    need:[[/\bi (do|play|watch|have|go|read|eat|help|visit|draw)/,"Contá qué hacés: \"I do my homework…\"."],[/\band\b|\bthen\b/,"Unilo con \"and\" o \"and then\": \"…and then I play\"."]],react:()=>"That sounds like a busy afternoon!"})},
 {g:"rutina",intro:"Now tell me about your day. ",q:"What time do you go to bed?",a:"I go to bed at ten o'clock.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at ten o'clock\"."],[HORA,"Decí la hora: ten o'clock, half past nine…"]],
  hints:[H("me voy a dormir","I go to bed"),H("a las diez","at ten o'clock"),H("temprano","early")],
  react:()=>"Good! Sleep is important.",
  follow:()=>({q:"What do you do before you go to bed?",a:"I brush my teeth and then I read a book.",hints:[H("me lavo los dientes","I brush my teeth"),H("leo un libro","I read a book"),H("y después","and then")],
    need:[[/\bi (brush|read|watch|wash|have|listen|play|say)/,"Contá qué hacés: \"I brush my teeth…\"."]],react:()=>"Very good."})},
 {g:"rutina",intro:"Now tell me about your day. ",q:"What do you do in the morning before school?",a:"I get up, and then I have breakfast. I go to school at eight.",
  need:[[/\bi (get|wake|have|wash|brush|go|eat|drink)/,"Contá tu mañana: \"I get up…, I have breakfast…\"."],[/\band\b|\bthen\b/,"Unilo con \"and then\": \"I get up, and then I have breakfast\"."]],
  hints:[H("desayuno","I have breakfast"),H("me lavo los dientes","I brush my teeth"),H("y después","and then")],
  react:()=>"Thank you, that's a good routine."},
 // ---- libre (tiempo libre, can / can't)
 {g:"libre",intro:"Let's talk about your free time. ",q:"What do you do in your free time?",a:"I play football and I watch TV.",
  need:[[/\bi (play|watch|read|listen|go|like|draw|paint|ride|swim|dance|love|visit|help|cook)/,"Usá \"I play…\", \"I like…\", \"I watch…\"."]],
  hints:[H("juego al fútbol","I play football"),H("miro tele","I watch TV"),H("escucho música","I listen to music")],
  react:()=>pick(["That sounds fun!","Oh, I like that too!"]),
  follow:()=>({q:"Can you swim?",a:"Yes, I can. I can swim very well.",hints:[H("puedo","I can"),H("no puedo","I can't"),H("nadar","swim")],
    need:[[/\bcan\b|\bcan't\b|cannot/,"Contestá \"Yes, I can\" o \"No, I can't\"."]],react:t=>/can't|cannot|^no/.test(t)?"That's OK!":"Well done!"})},
 {g:"libre",intro:"Let's talk about your free time. ",q:"What do you do at the weekend?",a:"I play football with my friends and then I watch TV.",
  need:[[/\bi (play|watch|go|visit|help|read|ride|eat|see|meet|stay)|we (play|go|watch)/,"Contá qué hacés: \"I play…\", \"I go…\"."],[/\band\b|\bthen\b/,"Sumá otra idea con \"and\" o \"and then\"."]],
  hints:[H("el fin de semana","at the weekend"),H("con mis amigos","with my friends"),H("y después","and then")],
  react:()=>"That sounds great!"},
 {g:"libre",intro:"Let's talk about your free time. ",q:"What can you do well? Can you ride a bike?",a:"Yes, I can ride a bike and I can swim.",
  need:[[/\bcan\b|\bcan't\b|cannot/,"Usá \"I can…\" o \"I can't…\"."]],
  hints:[H("puedo","I can"),H("no puedo","I can't"),H("andar en bici","ride a bike")],
  react:t=>/can't|cannot/.test(t)?"Don't worry, you can learn!":"Wow, very good!",
  follow:()=>({q:"What can't you do?",a:"I can't play the guitar.",hints:[H("no puedo","I can't"),H("tocar la guitarra","play the guitar"),H("cocinar","cook")],
    need:[[/can't|cannot|can not/,"Usá \"I can't…\"."]],react:()=>"Never mind. Thank you."})},
 // ---- familia (familia y trabajos)
 {g:"familia",intro:"Let's talk about your family. ",q:"What jobs do the people in your family have?",a:"My mum is a teacher and my dad is an architect.",
  need:[[/is a|is an|works|is the/,"Usá \"My mum is a…\" o \"My dad is an…\"."],[/mum|mom|dad|mother|father|brother|sister|grand|aunt|uncle/,"Nombrá a tu familia: my mum, my dad…"]],
  hints:[H("mi mamá es","my mum is"),H("maestra","a teacher"),H("arquitecto","an architect")],
  react:()=>"That's an interesting job.",
  follow:()=>({q:"And what do you want to be?",a:"I want to be a vet because I love animals.",hints:[H("quiero ser","I want to be"),H("veterinario","a vet"),H("porque","because")],
    need:[[/want to be|would like to be|i'd like|be a|be an/,"Usá \"I want to be a…\"."]],react:()=>"That's a wonderful idea!"})},
 // ---- clima y fechas
 {g:"clima",intro:"Now, a question about the weather. ",q:"What's the weather like today?",a:"It's sunny and hot.",
  need:[[/it'?s|it is/,"Empezá con \"It's…\"."],[/sun|hot|cold|rain|wind|cloud|storm|snow|warm|nice|cool/,"Usá una palabra del clima: sunny, cloudy, rainy, cold…"]],
  hints:[H("soleado","sunny"),H("nublado","cloudy"),H("llueve","it's raining")],
  react:t=>/rain|storm/.test(t)?"Oh no! Don't forget your umbrella.":/sun|hot|warm|nice/.test(t)?"Lovely! A good day for the park.":"I see.",
  follow:()=>({q:"What's your favourite season? Why?",a:"My favourite season is summer because it is hot.",hints:[H("estación","season"),H("verano","summer"),H("invierno","winter")],
    need:[[/summer|winter|spring|autumn|fall/,"Nombrá una estación: summer, winter, spring, autumn."]],react:()=>"Good choice!"})},
 {g:"fecha",intro:"Now, let's talk about dates. ",q:"What's the date today?",a:"It's the first of November.",
  need:[[ORD,"Usá un ordinal: the first, the second, the fifth…"],[MONTHS,"Decí también el mes: November, March…"]],
  hints:[H("el primero","the first"),H("de noviembre","of November"),H("hoy es","it's")],
  react:()=>"That's right. Thank you.",
  follow:()=>({q:"And when is your birthday?",a:"My birthday is on the fourteenth of March.",hints:[H("mi cumpleaños","my birthday"),H("el catorce","the fourteenth"),H("de marzo","of March")],
    need:[[ORD,"Usá un ordinal: the fourteenth…"],[/\bon\b|\bin\b/,"Con fechas va \"on\": \"on the fourteenth of March\"."]],react:()=>"Great! Happy birthday in advance!"})},
 {g:"clima",intro:"Now, a question about the weather. ",q:"What's the weather like in summer where you live? And in winter?",a:"In summer it's hot and sunny. In winter it's cold.",
  need:[[/summer|winter/,"Hablá de verano (summer) y de invierno (winter)."],[/hot|cold|sun|rain|wind|cloud|snow|warm|cool|nice/,"Usá palabras del clima: hot, cold, sunny, rainy…"]],
  hints:[H("en verano","in summer"),H("hace calor","it's hot"),H("hace frío","it's cold")],
  react:()=>"Thank you. That sounds like four different seasons!"},
 {g:"fecha",intro:"Now, let's talk about dates. ",q:"When is your birthday? What do you do on your birthday?",a:"My birthday is on the fourteenth of March. I have a party with my friends.",
  need:[[ORD,"Usá un ordinal: the fourteenth…"],[MONTHS,"Decí también el mes: March, July…"]],
  hints:[H("mi cumpleaños","my birthday"),H("el catorce","the fourteenth"),H("hago una fiesta","I have a party")],
  react:()=>"That sounds like a lot of fun!",
  follow:()=>({q:"And what day is it today?",a:"It's Saturday.",hints:[H("hoy es","it's"),H("lunes","Monday"),H("sábado","Saturday")],
    need:[[/monday|tuesday|wednesday|thursday|friday|saturday|sunday/,"Decí el día: Monday, Tuesday, Saturday…"]],react:()=>"That's right."})},
 // ---- pasado (was / were)
 {g:"pasado",intro:"Now, let's talk about yesterday. ",q:"Where were you yesterday?",a:"I was at home with my family.",
  need:[[/\bwas\b|\bwere\b/,"Es pasado: \"I was at…\"."]],
  hints:[H("estuve","I was"),H("en casa","at home"),H("en la escuela","at school")],
  react:()=>"I see.",
  follow:()=>({q:"Was it fun?",a:"Yes, it was. It was very fun.",hints:[H("sí, lo fue","yes, it was"),H("no lo fue","no, it wasn't"),H("divertido","fun")],
    need:[[/it was|it wasn't|was|wasn't/,"Contestá \"Yes, it was\" o \"No, it wasn't\"."]],react:()=>"I'm glad."})},
 {g:"pasado",intro:"Now, let's talk about last weekend. ",q:"Where were you last weekend?",a:"I was at my grandma's house.",
  need:[[/\bwas\b|\bwere\b/,"Es pasado: \"I was at…\"."]],
  hints:[H("el fin de semana pasado","last weekend"),H("estuve","I was"),H("la casa de mi abuela","my grandma's house")],
  react:()=>"That sounds nice.",
  follow:()=>({q:"Who was with you?",a:"My cousins were with me.",hints:[H("estaba conmigo","was with me"),H("estaban conmigo","were with me"),H("mis primos","my cousins")],
    need:[[/\bwas\b|\bwere\b|with me/,"Usá \"was\" o \"were\": \"My cousins were with me\"."]],react:()=>"How lovely."})},
 {g:"pasado",intro:"Now, let's talk about yesterday. ",q:"How was your day yesterday?",a:"It was good. I was at school and then I was at the park.",
  need:[[/it was|was/,"Es pasado: \"It was good\"."],[/\band\b|\bthen\b/,"Sumá otra idea con \"and then\"."]],
  hints:[H("fue bueno","it was good"),H("estuve en","I was at"),H("y después","and then")],
  react:()=>"That's nice to hear."},
 // ======== preguntas agregadas para que la charla cambie cada vez (cada una con su audio grabado; ver README, «Audios grabados») ========
 // ---- casa
 {g:"casa",intro:INTRO.casa[1],q:"Do you live in a house or in a flat?",a:"I live in a flat.",
  need:[[/house|flat|apartment/,"Decí si vivís en una casa (house) o en un departamento (flat)."]],
  hints:[H("vivo en","I live in"),H("una casa","a house"),H("un departamento","a flat")],
  react:R("I see. That sounds nice.","Oh, that's good.","Lovely!"),
  follow:[()=>({q:"Is it big or small?",a:"It's big.",hints:[H("grande","big"),H("chico","small"),H("es","it's")],
    need:[[/big|small|large|little|nice|new|old/,"Decí cómo es: big (grande) o small (chico)."]],react:R()})]},
 {g:"casa",intro:INTRO.casa[2],q:"How many bedrooms are there in your house?",a:"There are three bedrooms.",
  need:[[NUM,"Decí cuántos dormitorios hay: un número."],[/there (is|are)|i have/,"Empezá con \"There are… bedrooms\"."]],
  hints:[H("hay","there are"),H("dormitorios","bedrooms"),H("tres","three")],
  react:R("That's a big house!","Oh, that's nice."),
  follow:[()=>({q:"Do you have your own bedroom?",a:"Yes, I do. I have my own bedroom.",hints:[H("mi propia habitación","my own bedroom"),H("comparto con","I share with"),H("mi hermano","my brother")],
    need:[[/yes|no|my own|share|i do|i don't/,"Contestá \"Yes, I do\" o \"No, I share with my brother\"."]],react:R()})]},
 {g:"casa",intro:INTRO.casa[0],q:"What is in your living room?",a:"There is a sofa, a TV and a table.",
  need:[[/there (is|are)|i (can )?see|i have/,"Empezá con \"There is… / There are…\"."],[/sofa|couch|tv|television|table|chair|armchair|carpet|lamp|bookcase|plant|window|picture/,"Nombrá cosas: a sofa, a TV, a table…"]],
  hints:[H("hay","there is / there are"),H("sofá","sofa"),H("tele","TV")],
  react:R("That sounds cosy!","That sounds like a nice room.")},
 {g:"casa",intro:INTRO.casa[1],q:"Do you have a garden at home?",a:"Yes, I do. There is a small garden.",
  need:[[/yes|no|i do|i don't|garden|there is|there isn't/,"Contestá \"Yes, I do\" o \"No, I don't\"."]],
  hints:[H("jardín","garden"),H("sí, tengo","yes, I do"),H("no tengo","no, I don't")],
  react:t=>/\bno\b|don't|haven't/.test(t)?"That's OK. Many houses don't have a garden.":"A garden is lovely!",
  follow:[()=>({q:"Do you have a pet?",a:"Yes, I have a dog.",hints:[H("mascota","pet"),H("perro","dog"),H("gato","cat")],
    need:[[/yes|no|dog|cat|pet|fish|bird|rabbit|hamster|turtle|don't have|haven't/,"Contestá \"Yes, I have a dog\" o \"No, I don't have a pet\"."]],
    react:t=>/\bno\b|don't have|haven't/.test(t)?"I see. Maybe one day!":"Lovely! Pets are fun."})]},
 {g:"casa",intro:INTRO.casa[2],q:"What is in your kitchen?",a:"There is a fridge, a cooker and a table.",
  need:[[/there (is|are)|i (can )?see|i have/,"Empezá con \"There is… / There are…\"."],[/fridge|refrigerator|cooker|oven|stove|table|sink|chair|cupboard|microwave|window|dishwasher/,"Nombrá cosas: a fridge, a cooker, a table…"]],
  hints:[H("heladera","fridge"),H("cocina (artefacto)","cooker"),H("mesa","table")],
  react:R()},
 {g:"casa",intro:INTRO.casa[0],q:"Where do you do your homework at home?",a:"I do my homework in my bedroom.",
  need:[[/\bin\b|\bat\b|\bon\b/,"Decí dónde: \"in my bedroom\", \"at the table\"."],[/bedroom|room|table|desk|kitchen|living|garden|house|home|school/,"Nombrá el lugar: bedroom, kitchen, living room…"]],
  hints:[H("hago la tarea","I do my homework"),H("en mi habitación","in my bedroom"),H("en la mesa","at the table")],
  react:R("That's a good place to study!","I see. Thank you.")},
 {g:"casa",intro:INTRO.casa[1],q:"What colour is your bedroom?",a:"My bedroom is blue.",
  need:[[COL_RE,"Decí un color: blue, white, green, yellow…"]],
  hints:[H("de color","colour"),H("azul","blue"),H("blanco","white")],
  react:R("That's a lovely colour!","Nice!")},
 // ---- barrio
 {g:"barrio",intro:INTRO.barrio[2],q:"What can you see in your street?",a:"I can see some houses, a bakery and a park.",
  need:[[/there (is|are)|i (can )?see/,"Empezá con \"I can see…\" o \"There is…\"."],[/house|shop|bakery|park|school|supermarket|church|square|kiosk|cafe|café|restaurant|bank|garage|tree|car|building|flat|chemist/,"Nombrá lugares: a bakery, a park, some houses…"]],
  hints:[H("puedo ver","I can see"),H("panadería","bakery"),H("plaza","park")],
  react:R(),
  follow:[()=>({q:"Do you like your street?",a:"Yes, I do. It's quiet.",hints:[H("me gusta","I like"),H("tranquila","quiet"),H("ruidosa","noisy")],
    need:[[/yes|no|i do|i don't|like|quiet|noisy|nice|beautiful/,"Contestá \"Yes, I do\" o \"No, I don't\", y decí cómo es: quiet, noisy…"]],react:R()})]},
 {g:"barrio",intro:INTRO.barrio[1],q:"Is there a park near your house?",a:"Yes, there is. It's opposite my house.",
  need:[[/yes|no|there is|there isn't|near|opposite|next to|far/,"Contestá \"Yes, there is\" o \"No, there isn't\"."]],
  hints:[H("sí, hay","yes, there is"),H("no hay","no, there isn't"),H("enfrente de","opposite")],
  react:t=>/\bno\b|isn't/.test(t)?"I see. Thank you.":"Lovely! Parks are great.",
  follow:[()=>({q:"What do you do in the park?",a:"I play football with my friends.",hints:[H("juego","I play"),H("con mis amigos","with my friends"),H("paseo al perro","I walk my dog")],
    need:[[/\bi (play|ride|run|walk|go|meet|swim|read|eat|sit)/,"Contá qué hacés: \"I play…\", \"I ride my bike…\"."]],react:R("That sounds fun!","Lovely!")})]},
 {g:"barrio",intro:INTRO.barrio[0],q:"Where is the bus stop? Is it near your house?",a:"The bus stop is next to the school.",
  need:[[/near|next to|opposite|in front of|behind|between|far|corner|on the (left|right)/,"Decí dónde está: near, next to, opposite, behind…"]],
  hints:[H("parada de colectivo","bus stop"),H("al lado de","next to"),H("enfrente de","opposite")],
  react:R("Thank you. That's very clear.","OK, I see.")},
 {g:"barrio",intro:INTRO.barrio[1],q:"How do you go to school? By bus or by car?",a:"I go to school by car.",
  need:[[/by (car|bus|bike|bicycle|train|taxi|subway|metro)|on foot|\bwalk|\bcar\b|\bbus\b|\bbike\b/,"Decí cómo vas: \"by car\", \"by bus\", \"on foot\"."]],
  hints:[H("voy en auto","by car"),H("en colectivo","by bus"),H("caminando","on foot")],
  react:R(),
  follow:[()=>({q:"Is your school far from your house?",a:"No, it isn't. It's near.",hints:[H("lejos","far"),H("cerca","near"),H("no está lejos","it isn't far")],
    need:[[/yes|no|far|near|isn't|is/,"Contestá \"Yes, it is\" o \"No, it isn't\"."]],react:R()})]},
 {g:"barrio",intro:INTRO.barrio[2],q:"What is opposite your school?",a:"There is a bakery opposite my school.",
  need:[[/opposite|in front of|next to|behind|near|there is|there are/,"Decí qué hay: \"There is a… opposite my school\"."]],
  hints:[H("enfrente de","opposite"),H("hay","there is"),H("panadería","bakery")],
  react:R()},
 {g:"barrio",intro:INTRO.barrio[0],q:"Which shops are near your house?",a:"There is a bakery and a chemist's near my house.",
  need:[[/there (is|are)|i (can )?see/,"Empezá con \"There is… / There are…\"."],[/bakery|supermarket|chemist|pharmacy|butcher|greengrocer|kiosk|shop|shopping|bank|cafe|café|post office|market/,"Nombrá negocios: a bakery, a chemist's, a supermarket…"]],
  hints:[H("farmacia","chemist's"),H("verdulería","greengrocer's"),H("carnicería","butcher's")],
  react:R("That's very handy!","Lovely! That's useful.")},
 {g:"barrio",intro:"Now imagine I am at your house. ",q:"How do I get to the supermarket from your house?",a:"Go straight on and turn right. It's on the corner.",
  need:[[/straight|left|right|turn|cross|along|corner/,"Usá: go straight on, turn left, turn right, cross the street…"]],
  hints:[H("seguí derecho","go straight on"),H("doblá a la derecha","turn right"),H("en la esquina","on the corner")],
  react:R("Great! Thank you for the directions.","Thank you. That's very clear.")},
 // ---- escuela
 {g:"escuela",intro:INTRO.escuela[1],q:"What time does school start?",a:"School starts at eight o'clock.",
  need:[[HORA,"Decí la hora: at eight o'clock, at half past seven…"],[/\bat\b/,"Con la hora va \"at\": \"at eight o'clock\"."]],
  hints:[H("empieza","starts"),H("a las ocho","at eight o'clock"),H("y media","half past")],
  react:R("That's early!","OK, thank you."),
  follow:[()=>({q:"What do you do at break time?",a:"I play football with my friends.",hints:[H("recreo","break time"),H("juego","I play"),H("como","I eat")],
    need:[[/\bi (play|eat|have|talk|run|read|drink|sit|chat)/,"Contá qué hacés: \"I play…\", \"I eat…\"."]],react:R("That sounds fun!","Lovely!")})]},
 {g:"escuela",intro:INTRO.escuela[2],q:"Do you like your teacher?",a:"Yes, I do. My teacher is kind.",
  need:[[/yes|no|i do|i don't|like|kind|nice|funny|good|great|strict/,"Contestá \"Yes, I do\" y decí cómo es: kind, funny, nice…"]],
  hints:[H("me gusta","I like"),H("amable","kind"),H("divertida","funny")],
  react:R("That's lovely!","I'm glad.")},
 {g:"escuela",intro:INTRO.escuela[0],q:"What is in your schoolbag?",a:"There are my books, a notebook and a pencil case.",
  need:[[/there (is|are)|i have|my/,"Empezá con \"There is… / There are…\" o \"I have…\"."],[/book|notebook|pencil|pen|rubber|ruler|bottle|lunch|case|folder|calculator|snack/,"Nombrá cosas: books, a notebook, a pencil…"]],
  hints:[H("cuaderno","notebook"),H("lápiz","pencil"),H("regla","ruler")],
  react:R("That's a lot of things!","I see. Thank you.")},
 {g:"escuela",intro:INTRO.escuela[1],q:"Do you like your school? Why?",a:"Yes, I do because my friends are there.",
  need:[[/yes|no|i do|i don't|like/,"Contestá \"Yes, I do\" o \"No, I don't\"."],[/because/,"Explicá con \"because…\"."]],
  hints:[H("me gusta","I like"),H("porque","because"),H("mis amigos","my friends")],
  react:R("I'm glad.","That's a good reason.")},
 {g:"escuela",intro:INTRO.escuela[2],q:"How many students are there in your class?",a:"There are twenty-five students in my class.",
  need:[[NUM,"Decí cuántos hay: un número."],[/there (is|are)/,"Empezá con \"There are… students\"."]],
  hints:[H("hay","there are"),H("alumnos","students"),H("en mi clase","in my class")],
  react:R("That's a big class!","Oh, that's a nice number."),
  follow:[()=>({q:"Who is your best friend in your class?",a:"My best friend is Lucas.",hints:[H("mi mejor amigo/a","my best friend"),H("se llama","his name is"),H("es","is")],
    need:[[/friend|is|name/,"Contestá \"My best friend is…\"."]],react:R("That's nice!","Lovely!")})]},
 {g:"escuela",intro:INTRO.escuela[0],q:"What day do you have English?",a:"I have English on Tuesdays.",
  need:[[/monday|tuesday|wednesday|thursday|friday/,"Decí el día: Monday, Tuesday…"],[/\bon\b|\bi have\b|we have/,"Usá \"I have English on Tuesdays\"."]],
  hints:[H("tengo inglés","I have English"),H("los martes","on Tuesdays"),H("los viernes","on Fridays")],
  react:R()},
 {g:"escuela",intro:INTRO.escuela[1],q:"Do you have lunch at school?",a:"Yes, I do. I have lunch at school.",
  need:[[/yes|no|i do|i don't|lunch|school|home/,"Contestá \"Yes, I do\" o \"No, I don't. I have lunch at home\"."]],
  hints:[H("almuerzo","I have lunch"),H("en la escuela","at school"),H("en casa","at home")],
  react:R(),
  follow:[()=>({q:"What do you have for lunch?",a:"I have chicken and rice.",hints:[H("pollo","chicken"),H("arroz","rice"),H("ensalada","salad")],
    need:[[/\bi (have|eat)|chicken|rice|pasta|salad|meat|fish|pizza|sandwich|soup|potato|vegetables|fruit/,"Contá qué comés: \"I have chicken and rice\"."]],react:R("That sounds yummy!","Nice!")})]},
 // ---- rutina
 {g:"rutina",intro:INTRO.rutina[2],q:"What time do you have breakfast?",a:"I have breakfast at half past seven.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at seven o'clock\"."],[HORA,"Decí la hora: seven o'clock, half past seven…"]],
  hints:[H("desayuno","I have breakfast"),H("a las siete","at seven o'clock"),H("y media","half past")],
  react:R(),
  follow:[()=>({q:"What do you have for breakfast?",a:"I have milk and toast.",hints:[H("leche","milk"),H("tostadas","toast"),H("cereales","cereal")],
    need:[[/milk|toast|cereal|bread|egg|coffee|tea|juice|cookie|biscuit|fruit|yogurt|yoghurt|sandwich|croissant|medialuna/,"Nombrá qué desayunás: milk, toast, cereal…"]],react:R("Yummy!","That sounds good.")})]},
 {g:"rutina",intro:INTRO.rutina[0],q:"What time do you have lunch?",a:"I have lunch at twelve o'clock.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at twelve o'clock\"."],[HORA,"Decí la hora: twelve o'clock, half past twelve…"]],
  hints:[H("almuerzo","I have lunch"),H("a las doce","at twelve o'clock"),H("al mediodía","at noon")],
  react:R()},
 {g:"rutina",intro:INTRO.rutina[1],q:"What time do you go to school?",a:"I go to school at eight o'clock.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at eight o'clock\"."],[HORA,"Decí la hora: eight o'clock, half past seven…"]],
  hints:[H("voy a la escuela","I go to school"),H("a las ocho","at eight o'clock"),H("temprano","early")],
  react:R("That's early!","OK, thank you.")},
 {g:"rutina",intro:INTRO.rutina[2],q:"What time do you have dinner?",a:"I have dinner at nine o'clock.",
  need:[[/\bat\b/,"Con la hora va \"at\": \"at nine o'clock\"."],[HORA,"Decí la hora: eight o'clock, half past eight…"]],
  hints:[H("ceno","I have dinner"),H("a las nueve","at nine o'clock"),H("con mi familia","with my family")],
  react:R(),
  follow:[()=>({q:"Who do you have dinner with?",a:"I have dinner with my family.",hints:[H("ceno con","I have dinner with"),H("mi familia","my family"),H("mis papás","my parents")],
    need:[[/with|family|mum|dad|mom|brother|sister|grand|alone/,"Decí con quién: \"I have dinner with my family\"."]],react:R("That's lovely.","Nice!")})]},
 {g:"rutina",intro:INTRO.rutina[1],q:"What do you do after dinner?",a:"I watch TV and then I go to bed.",
  need:[[/\bi (watch|play|read|brush|wash|talk|do|go|help|listen|draw)/,"Contá qué hacés: \"I watch TV…\"."],[/\band\b|\bthen\b/,"Unilo con \"and\" o \"and then\"."]],
  hints:[H("miro tele","I watch TV"),H("me lavo los dientes","I brush my teeth"),H("y después","and then")],
  react:R("That sounds relaxing.","Very good.")},
 {g:"rutina",intro:INTRO.rutina[0],q:"Do you do your homework in the morning or in the afternoon?",a:"I do my homework in the afternoon.",
  need:[[/morning|afternoon|evening|night/,"Decí cuándo: in the morning, in the afternoon, in the evening."]],
  hints:[H("hago la tarea","I do my homework"),H("a la mañana","in the morning"),H("a la tarde","in the afternoon")],
  react:R()},
 // ---- libre
 {g:"libre",intro:INTRO.libre[1],q:"What is your favourite sport?",a:"My favourite sport is football.",
  need:[[/favou?rite sport is|i (like|love|play)/,"Usá \"My favourite sport is…\"."],[/football|soccer|tennis|basketball|volleyball|rugby|hockey|swimming|cycling|gymnastics|golf|baseball|cricket|athletics|running|skating|handball|padel|paddle|karate|judo|none/,"Nombrá un deporte: football, tennis, swimming…"]],
  hints:[H("mi deporte favorito","my favourite sport"),H("fútbol","football"),H("natación","swimming")],
  react:R("That's a great sport!","Oh, I like it too!"),
  follow:[()=>({q:"Do you play it with your friends?",a:"Yes, I do. I play it with my friends.",hints:[H("juego con","I play with"),H("mis amigos","my friends"),H("mi equipo","my team")],
    need:[[/yes|no|i do|i don't|friend|brother|sister|dad|team|school/,"Contestá \"Yes, I do\" y decí con quién jugás."]],react:R()})]},
 {g:"libre",intro:INTRO.libre[2],q:"What kind of music do you like?",a:"I like pop music.",
  need:[[/\bi (like|love|listen)|my favou?rite/,"Usá \"I like…\"."],[/pop|rock|cumbia|reggaeton|rap|classical|jazz|folk|music|songs|singer|band|tango|cuarteto|trap|electronic|disney/,"Nombrá un tipo de música: pop, rock, cumbia…"]],
  hints:[H("me gusta","I like"),H("música pop","pop music"),H("escucho música","I listen to music")],
  react:R("Great! Music is fun.","Interesting!")},
 {g:"libre",intro:INTRO.libre[0],q:"Can you play a musical instrument?",a:"Yes, I can play the guitar.",
  need:[[/\bcan\b|can't|cannot/,"Contestá \"Yes, I can\" o \"No, I can't\"."]],
  hints:[H("puedo","I can"),H("tocar la guitarra","play the guitar"),H("no puedo","I can't")],
  react:t=>/can't|cannot|^no/.test(t)?"That's OK. Maybe one day!":"Wow, that's great!",
  follow:[()=>({q:"Do you like singing?",a:"Yes, I do. I like singing.",hints:[H("me gusta cantar","I like singing"),H("no me gusta","I don't like"),H("canciones","songs")],
    need:[[/yes|no|i do|i don't|like|sing/,"Contestá \"Yes, I do\" o \"No, I don't\"."]],react:R()})]},
 {g:"libre",intro:INTRO.libre[1],q:"Do you like playing video games?",a:"Yes, I do. I play with my friends.",
  need:[[/yes|no|i do|i don't|like|play|game/,"Contestá \"Yes, I do\" o \"No, I don't\"."]],
  hints:[H("me gusta","I like"),H("juego","I play"),H("con mis amigos","with my friends")],
  react:t=>/\bno\b|don't/.test(t)?"OK, that's fine.":"That sounds like fun!"},
 {g:"libre",intro:INTRO.libre[2],q:"What do you like doing with your friends?",a:"I like playing football and riding my bike.",
  need:[[/\bi like|we (play|go|watch|ride)|\bwe\b/,"Usá \"I like…\" o \"We play…\"."],[/\w+ing\b|\bplay|\bwatch|\bride|\bgo\b/,"Contá una actividad: playing football, riding my bike…"]],
  hints:[H("me gusta","I like"),H("jugar al fútbol","playing football"),H("andar en bici","riding my bike")],
  react:R("That sounds great!","Lovely!")},
 {g:"libre",intro:INTRO.libre[0],q:"Can you cook? What can you make?",a:"Yes, I can. I can make a sandwich.",
  need:[[/\bcan\b|can't|cannot/,"Contestá \"Yes, I can\" o \"No, I can't\"."]],
  hints:[H("puedo","I can"),H("preparar","make"),H("un sándwich","a sandwich")],
  react:t=>/can't|cannot|^no/.test(t)?"That's OK. You can learn!":"Wow, yummy!"},
 // ---- familia
 {g:"familia",intro:INTRO.familia[1],q:"How many people are there in your family?",a:"There are four people in my family.",
  need:[[NUM,"Decí cuántos hay: un número."],[/there (is|are)|we are|we're/,"Empezá con \"There are… people\"."]],
  hints:[H("hay","there are"),H("personas","people"),H("en mi familia","in my family")],
  react:R("That's a nice family.","Lovely!"),
  follow:[()=>({q:"Who are they?",a:"My mum, my dad, my sister and me.",hints:[H("mi mamá","my mum"),H("mi papá","my dad"),H("mi hermana","my sister")],
    need:[[/mum|mom|dad|mother|father|brother|sister|grand|aunt|uncle|cousin|me\b/,"Nombrá a tu familia: my mum, my dad, my sister…"]],react:R()})]},
 {g:"familia",intro:INTRO.familia[2],q:"Do you have any brothers or sisters?",a:"Yes, I have one brother.",
  need:[[/yes|no|brother|sister|only child|don't have|haven't|i have/,"Contestá \"Yes, I have a brother\" o \"No, I don't\"."]],
  hints:[H("tengo","I have"),H("un hermano","a brother"),H("una hermana","a sister")],
  react:t=>/\bno\b|only child|don't have|haven't/.test(t)?"I see. Thank you.":"How nice!",
  follow:[()=>({q:"What do you like doing with your family?",a:"I like watching films with my family.",hints:[H("me gusta","I like"),H("mirar películas","watching films"),H("con mi familia","with my family")],
    need:[[/\bi like|we (watch|play|go|eat|visit|cook)|\bwith\b/,"Usá \"I like… with my family\"."]],react:R()})]},
 {g:"familia",intro:INTRO.familia[0],q:"What does your mum do?",a:"My mum is a teacher.",
  need:[[/is a|is an|works|she is|mum|mom|mother/,"Usá \"My mum is a…\"."]],
  hints:[H("mi mamá es","my mum is"),H("maestra","a teacher"),H("trabaja en","she works in")],
  react:R("That's an interesting job.","Oh, that's a good job!")},
 {g:"familia",intro:INTRO.familia[1],q:"What does your dad do?",a:"My dad is an architect.",
  need:[[/is a|is an|works|he is|dad|father/,"Usá \"My dad is a…\"."]],
  hints:[H("mi papá es","my dad is"),H("arquitecto","an architect"),H("trabaja en","he works in")],
  react:R("That's an interesting job.","Oh, that's a good job!"),
  follow:[()=>({q:"Does he like his job?",a:"Yes, he does. He likes his job.",hints:[H("sí, le gusta","yes, he does"),H("no le gusta","no, he doesn't"),H("su trabajo","his job")],
    need:[[/yes|no|does|doesn't|likes?/,"Contestá \"Yes, he does\" o \"No, he doesn't\"."]],react:R()})]},
 {g:"familia",intro:INTRO.familia[2],q:"What is your favourite animal?",a:"My favourite animal is the dog.",
  need:[[/favou?rite animal is|i like|i love/,"Usá \"My favourite animal is…\"."],[/dog|cat|horse|rabbit|lion|tiger|elephant|monkey|bird|fish|dolphin|panda|giraffe|bear|hamster|turtle|snake|shark|penguin|wolf|fox|animal|cow|sheep|pig|duck/,"Nombrá un animal: dog, cat, horse…"]],
  hints:[H("mi animal favorito","my favourite animal"),H("perro","dog"),H("caballo","horse")],
  react:R("Mine too!","That's a lovely animal."),
  follow:[()=>({q:"Do you have a pet at home?",a:"Yes, I have a dog.",hints:[H("mascota","pet"),H("tengo","I have"),H("no tengo","I don't have")],
    need:[[/yes|no|have|pet|dog|cat|fish|bird|rabbit|hamster|turtle|don't|haven't/,"Contestá \"Yes, I have a dog\" o \"No, I don't have a pet\"."]],
    react:t=>/\bno\b|don't have|haven't/.test(t)?"I see. Maybe one day!":"Lovely! Pets are fun."})]},
 {g:"familia",intro:INTRO.familia[0],q:"What do you want to be when you are older?",a:"I want to be a vet.",
  need:[[/want to be|would like to be|i'd like|be a|be an/,"Usá \"I want to be a…\"."]],
  hints:[H("quiero ser","I want to be"),H("veterinario","a vet"),H("médico","a doctor")],
  react:R("That's a wonderful idea!","A great job!"),
  follow:[()=>({q:"Why?",a:"Because I love animals.",hints:[H("porque","because"),H("me gusta","I like"),H("amo","I love")],
    need:[[/because|i (love|like)/,"Explicá con \"Because…\"."]],react:R()})]},
 {g:"familia",intro:INTRO.familia[1],q:"Do you help at home? What do you do?",a:"Yes, I do. I help my mum in the kitchen.",
  need:[[/yes|no|i do|i don't/,"Contestá \"Yes, I do\" o \"No, I don't\"."],[/\bi (help|wash|clean|cook|tidy|make|set|put|take|sweep|water)/,"Contá qué hacés: \"I help my mum\", \"I wash the dishes\"."]],
  hints:[H("ayudo","I help"),H("lavo los platos","I wash the dishes"),H("ordeno mi cuarto","I tidy my room")],
  react:R("That's very good!","What a good helper!")},
 // ---- clima
 {g:"clima",intro:INTRO.clima[1],q:"Is it sunny today?",a:"Yes, it is. It's sunny.",
  need:[[/yes|no|it is|it isn't|it's|sunny|cloudy|rain|cold|hot|wind/,"Contestá \"Yes, it is\" o \"No, it isn't\"."]],
  hints:[H("sí, está","yes, it is"),H("no está","no, it isn't"),H("nublado","cloudy")],
  react:R("I see. Thank you.","OK, that's good.")},
 {g:"clima",intro:INTRO.clima[0],q:"What do you do when it rains?",a:"I stay at home and I play games.",
  need:[[/\bi (stay|play|read|watch|go|draw|do|sleep|cook|help|listen)/,"Contá qué hacés: \"I stay at home…\"."]],
  hints:[H("cuando llueve","when it rains"),H("me quedo en casa","I stay at home"),H("juego","I play")],
  react:R("That sounds cosy!","Good idea!")},
 {g:"clima",intro:INTRO.clima[2],q:"What is your favourite season? Why?",a:"My favourite season is spring because it is warm.",
  need:[[/summer|winter|spring|autumn|fall/,"Nombrá una estación: summer, winter, spring, autumn."],[/because/,"Explicá con \"because…\"."]],
  hints:[H("mi estación favorita","my favourite season"),H("primavera","spring"),H("porque","because")],
  react:R("Good choice!","That's a lovely season."),
  follow:[()=>({q:"What do you do in summer?",a:"I go to the beach with my family.",hints:[H("voy a la playa","I go to the beach"),H("nado","I swim"),H("con mi familia","with my family")],
    need:[[/\bi (go|play|swim|visit|eat|stay|ride|travel|have)/,"Contá qué hacés: \"I go to the beach\"."]],react:R("That sounds fun!","Lovely!")})]},
 {g:"clima",intro:INTRO.clima[1],q:"Is it hot or cold in winter where you live?",a:"It's cold in winter.",
  need:[[/hot|cold|cool|warm|freez/,"Decí cómo es: hot, cold, cool, warm."],[/it'?s|it is/,"Empezá con \"It's…\"."]],
  hints:[H("hace frío","it's cold"),H("hace calor","it's hot"),H("en invierno","in winter")],
  react:R("I see. Thank you.","OK, thank you.")},
 {g:"clima",intro:INTRO.clima[0],q:"Do you like rainy days? Why?",a:"No, I don't because I can't play outside.",
  need:[[/yes|no|i do|i don't/,"Contestá \"Yes, I do\" o \"No, I don't\"."],[/because/,"Explicá con \"because…\"."]],
  hints:[H("me gusta","I like"),H("días de lluvia","rainy days"),H("porque","because")],
  react:R("I understand.","That's a good reason.")},
 {g:"clima",intro:INTRO.clima[2],q:"Does it snow where you live?",a:"No, it doesn't. It never snows.",
  need:[[/yes|no|snow|doesn't|does|never|sometimes/,"Contestá \"Yes, it does\" o \"No, it doesn't\"."]],
  hints:[H("nieva","it snows"),H("nunca","never"),H("a veces","sometimes")],
  react:R("Snow is beautiful, but cold!","I see. Thank you.")},
 {g:"clima",intro:INTRO.clima[1],q:"What is your favourite kind of weather?",a:"My favourite weather is sunny weather.",
  need:[[/weather|sunny|hot|rain|snow|wind|cloud|warm|cold|storm/,"Nombrá un clima: sunny, rainy, windy…"]],
  hints:[H("mi clima favorito","my favourite weather"),H("soleado","sunny"),H("ventoso","windy")],
  react:R("Mine too!","Interesting!")},
 // ---- fecha
 {g:"fecha",intro:INTRO.fecha[1],q:"What day is it today?",a:"It's Saturday.",
  need:[[/monday|tuesday|wednesday|thursday|friday|saturday|sunday/,"Decí el día: Monday, Tuesday, Saturday…"]],
  hints:[H("hoy es","it's"),H("lunes","Monday"),H("sábado","Saturday")],
  react:R("That's right.","Thank you.")},
 {g:"fecha",intro:INTRO.fecha[2],q:"What month is it now?",a:"It's November.",
  need:[[MONTHS,"Decí el mes: November, March…"]],
  hints:[H("mes","month"),H("noviembre","November"),H("diciembre","December")],
  react:R("That's right!","Thank you."),
  follow:[()=>({q:"What season is it now?",a:"It's spring.",hints:[H("estación","season"),H("primavera","spring"),H("verano","summer")],
    need:[[/summer|winter|spring|autumn|fall/,"Nombrá la estación: summer, winter, spring, autumn."]],react:R("That's right!","Good.")})]},
 {g:"fecha",intro:INTRO.fecha[0],q:"How many days are there in a week?",a:"There are seven days in a week.",
  need:[[NUM,"Decí cuántos hay: un número."],[/there (is|are)|seven/,"Empezá con \"There are… days\"."]],
  hints:[H("hay","there are"),H("siete","seven"),H("días","days")],
  react:R("That's right!","Correct!"),
  follow:[()=>({q:"Can you tell me the days of the week?",a:"Monday, Tuesday, Wednesday, Thursday, Friday, Saturday and Sunday.",hints:[H("lunes","Monday"),H("martes","Tuesday"),H("domingo","Sunday")],
    need:[[DIAS3,"Decí al menos tres días: Monday, Tuesday, Wednesday…"]],react:R("Very good!","Excellent!")})]},
 {g:"fecha",intro:INTRO.fecha[1],q:"What is your favourite day of the week? Why?",a:"My favourite day is Saturday because I play football.",
  need:[[/monday|tuesday|wednesday|thursday|friday|saturday|sunday/,"Decí un día: Monday, Friday, Saturday…"],[/because/,"Explicá con \"because…\"."]],
  hints:[H("mi día favorito","my favourite day"),H("sábado","Saturday"),H("porque","because")],
  react:R("That's a great day!","Good choice!")},
 {g:"fecha",intro:INTRO.fecha[0],q:"When is your mum's birthday?",a:"My mum's birthday is on the tenth of June.",
  need:[[ORD,"Usá un ordinal: the tenth, the second…"],[MONTHS,"Decí también el mes: June, July…"]],
  hints:[H("el cumpleaños de mi mamá","my mum's birthday"),H("el diez","the tenth"),H("de junio","of June")],
  react:R("That's a nice date.","Thank you.")},
 {g:"fecha",intro:INTRO.fecha[2],q:"What month is your birthday in?",a:"My birthday is in March.",
  need:[[MONTHS,"Decí el mes: March, July…"],[/\bin\b|\bon\b|my birthday/,"Usá \"My birthday is in…\"."]],
  hints:[H("mi cumpleaños","my birthday"),H("en marzo","in March"),H("en julio","in July")],
  react:R("That's a good month for a birthday!","Lovely!"),
  follow:[()=>({q:"And what is the date?",a:"It's on the fourteenth of March.",hints:[H("el catorce","the fourteenth"),H("de marzo","of March"),H("es el","it's on the")],
    need:[[ORD,"Usá un ordinal: the fourteenth…"]],react:R("Great! Happy birthday in advance!","Thank you.")})]},
 {g:"fecha",intro:INTRO.fecha[0],q:"What is the date of Christmas?",a:"Christmas is on the twenty-fifth of December.",
  need:[[ORD,"Usá un ordinal: the twenty-fifth…"],[/december/,"Decí el mes: December."]],
  hints:[H("Navidad","Christmas"),H("el veinticinco","the twenty-fifth"),H("de diciembre","of December")],
  react:R("That's right! A special day.","Correct!")},
 {g:"fecha",intro:INTRO.fecha[1],q:"What day comes after Wednesday?",a:"Thursday comes after Wednesday.",
  need:[[/thursday/,"Es Thursday."]],
  hints:[H("después de","after"),H("jueves","Thursday"),H("miércoles","Wednesday")],
  react:R("Correct!","That's right!")},
 {g:"fecha",intro:INTRO.fecha[2],q:"Which days do you go to school?",a:"I go to school from Monday to Friday.",
  need:[[/monday|tuesday|wednesday|thursday|friday|weekdays|every day/,"Decí los días: from Monday to Friday."]],
  hints:[H("voy a la escuela","I go to school"),H("de lunes","from Monday"),H("a viernes","to Friday")],
  react:R("I see. Thank you.","That's right.")},
 // ---- pasado
 {g:"pasado",intro:INTRO.pasado[0],q:"Were you at school yesterday?",a:"Yes, I was. I was at school.",
  need:[[/\bwas\b|\bwasn't\b|\bwere\b/,"Es pasado: \"Yes, I was\" o \"No, I wasn't\"."]],
  hints:[H("sí, estuve","yes, I was"),H("no estuve","no, I wasn't"),H("en la escuela","at school")],
  react:R("I see.","OK, thank you."),
  follow:[()=>({q:"Was it a good day?",a:"Yes, it was. It was a good day.",hints:[H("fue un buen día","it was a good day"),H("no fue","it wasn't"),H("divertido","fun")],
    need:[[/it was|it wasn't|was|wasn't/,"Contestá \"Yes, it was\" o \"No, it wasn't\"."]],react:R("I'm glad.","That's nice.")})]},
 {g:"pasado",intro:INTRO.pasado[2],q:"Where were you on your last birthday?",a:"I was at home with my friends.",
  need:[[/\bwas\b|\bwere\b/,"Es pasado: \"I was at…\"."]],
  hints:[H("mi último cumpleaños","my last birthday"),H("estuve","I was"),H("con mis amigos","with my friends")],
  react:R("That sounds like a nice party!","How lovely!"),
  follow:[()=>({q:"Were your friends there?",a:"Yes, they were.",hints:[H("sí, estaban","yes, they were"),H("no estaban","no, they weren't"),H("mis primos","my cousins")],
    need:[[/they were|they weren't|\bwere\b|weren't|yes|no/,"Contestá \"Yes, they were\" o \"No, they weren't\"."]],react:R()})]},
 {g:"pasado",intro:INTRO.pasado[0],q:"Was the weather good yesterday?",a:"Yes, it was. It was sunny.",
  need:[[/\bwas\b|\bwasn't\b|yes|no|sunny|rain|cold|hot|cloud|wind/,"Contestá \"Yes, it was\" o \"No, it wasn't\"."]],
  hints:[H("sí, fue","yes, it was"),H("no fue","no, it wasn't"),H("soleado","sunny")],
  react:R("I see.","Thank you.")},
 {g:"pasado",intro:INTRO.pasado[1],q:"Were you tired last night?",a:"Yes, I was. I was very tired.",
  need:[[/\bwas\b|\bwasn't\b|yes|no|tired/,"Contestá \"Yes, I was\" o \"No, I wasn't\"."]],
  hints:[H("sí, estaba","yes, I was"),H("cansado","tired"),H("muy","very")],
  react:t=>/\bno\b|wasn't/.test(t)?"Good! That's great.":"Oh, I see. Sleep well tonight!"},
 {g:"pasado",intro:INTRO.pasado[1],q:"Where were your parents yesterday?",a:"They were at work.",
  need:[[/\bwere\b|weren't|they were/,"Usá \"They were…\" (ellos estuvieron)."]],
  hints:[H("ellos estuvieron","they were"),H("en el trabajo","at work"),H("en casa","at home")],
  react:R("I see.","Thank you."),
  follow:[()=>({q:"Were you with them?",a:"No, I wasn't. I was with my grandma.",hints:[H("estuve con","I was with"),H("mi abuela","my grandma"),H("no estuve","I wasn't")],
    need:[[/\bwas\b|\bwasn't\b|yes|no|with/,"Contestá \"Yes, I was\" o \"No, I wasn't\"."]],react:R()})]},
 {g:"pasado",intro:INTRO.pasado[2],q:"Where were you on your last holiday?",a:"I was at the beach with my family.",
  need:[[/\bwas\b|\bwere\b/,"Es pasado: \"I was at…\"."]],
  hints:[H("mis vacaciones","my holiday"),H("estuve en la playa","I was at the beach"),H("con mi familia","with my family")],
  react:R("That sounds wonderful!","How lovely!"),
  follow:[()=>({q:"Was it hot?",a:"Yes, it was. It was very hot.",hints:[H("caluroso","hot"),H("frío","cold"),H("muy","very")],
    need:[[/\bwas\b|\bwasn't\b|yes|no|hot|cold|warm/,"Contestá \"Yes, it was\" o \"No, it wasn't\"."]],react:R()})]},
 {g:"pasado",intro:INTRO.pasado[0],q:"Who was with you at lunch yesterday?",a:"My mum and my brother were with me.",
  need:[[/\bwas\b|\bwere\b|with me|with/,"Usá \"was\" o \"were\": \"My mum was with me\"."]],
  hints:[H("estaba conmigo","was with me"),H("estaban conmigo","were with me"),H("mi mamá","my mum")],
  react:R("How nice.","I see.")},
];
// ---- Dibujos: el examinador muestra un dibujo y pregunta qué hacen / qué trabajo tienen (como en el examen real)
const PIC_INTROS=["Look at this picture. ","Now look at this picture. "];
const JOBS_PIC=[
 {e:"👩‍⚕️",who:"her",she:"She",job:"doctor",an:"a",re:/doctor|nurse/,hint:H("doctora","doctor")},
 {e:"👨‍🚒",who:"his",she:"He",job:"firefighter",an:"a",re:/fire/,hint:H("bombero","firefighter")},
 {e:"👩‍🏫",who:"her",she:"She",job:"teacher",an:"a",re:/teach/,hint:H("maestra","teacher")},
 {e:"🧑‍✈️",who:"his",she:"He",job:"pilot",an:"a",re:/pilot/,hint:H("piloto","pilot")},
 {e:"👨‍🌾",who:"his",she:"He",job:"farmer",an:"a",re:/farm/,hint:H("granjero","farmer")},
 {e:"👮",who:"his",she:"He",job:"police officer",an:"a",re:/police/,hint:H("policía","police officer")},
 {e:"👩‍🍳",who:"her",she:"She",job:"cook",an:"a",re:/cook|chef/,hint:H("cocinera","cook")},
 {e:"👨‍🍳",who:"his",she:"He",job:"cook",an:"a",re:/cook|chef/,hint:H("cocinero","cook")},
 {e:"👷",who:"his",she:"He",job:"builder",an:"a",re:/build|construction|worker/,hint:H("albañil","builder")}
];
const ACT_PIC=[
 {e:"🏊",q:"What is he doing?",a:"He is swimming.",re:/swim/,pron:"he",hint:H("nadando","swimming")},
 {e:"👩‍🍳",q:"What is she doing?",a:"She is cooking.",re:/cook/,pron:"she",hint:H("cocinando","cooking")},
 {e:"🧒⚽🧒",q:"What are they doing?",a:"They are playing football.",re:/play|football|soccer/,pron:"they",hint:H("jugando al fútbol","playing football")},
 {e:"🚴",q:"What is he doing?",a:"He is riding a bike.",re:/ride|riding|cycl|bike|bicycle/,pron:"he",hint:H("andando en bici","riding a bike")},
 {e:"🧒📖",q:"What is he doing?",a:"He is reading a book.",re:/read/,pron:"he",hint:H("leyendo un libro","reading a book")},
 {e:"👩‍🎨",q:"What is she doing?",a:"She is painting.",re:/paint|draw/,pron:"she",hint:H("pintando","painting")},
 {e:"💃",q:"What is she doing?",a:"She is dancing.",re:/danc/,pron:"she",hint:H("bailando","dancing")},
 {e:"🎸",q:"What is he doing?",a:"He is playing the guitar.",re:/guitar|play|music/,pron:"he",hint:H("tocando la guitarra","playing the guitar")},
 {e:"🏃",q:"What is he doing?",a:"He is running.",re:/run|jog/,pron:"he",hint:H("corriendo","running")},
 {e:"🧒🍎",q:"What is he doing?",a:"He is eating an apple.",re:/eat|apple/,pron:"he",hint:H("comiendo una manzana","eating an apple")},
 {e:"👧🎤",q:"What is she doing?",a:"She is singing.",re:/sing/,pron:"she",hint:H("cantando","singing")},
 {e:"🧒📺",q:"What is he doing?",a:"He is watching TV.",re:/watch|tv|television/,pron:"he",hint:H("mirando tele","watching TV")}
];
const jobQs=j=>[`What's ${j.who} job?`,`What does ${j.she.toLowerCase()} do?`];
const actQs=x=>x.pron==="they"?[x.q]:[x.q,x.q.replace("What is","What's")];
function stepJobPic(j,intro,q){return {g:"dibujo",intro:intro||pick(PIC_INTROS),picture:j.e,q:q||pick(jobQs(j)),a:`${j.she}'s ${j.an} ${j.job}.`,
  need:[[/(she|he)('s| is)|it's|it is/,`Empezá con \"${j.she}'s a…\".`],[j.re,`Mirá el dibujo: es ${j.hint.es} (${j.hint.en}).`]],
  hints:[H(j.she==="She"?"ella es":"él es",`${j.she}'s`),j.hint,H("trabajo","job")],react:R("That's right!","Yes, very good!")}}
function stepActionPic(x,intro,q){return {g:"dibujo",intro:intro||pick(PIC_INTROS),picture:x.e,q:q||pick(actQs(x)),a:x.a,
  need:[[x.pron==="they"?/they('re| are)/:/(he|she)('s| is)/,`Empezá con \"${x.a.split(' ').slice(0,2).join(' ')}…\".`],[/\w+ing\b/,"Usá el presente continuo: verbo + -ing (swimming, playing…)."],[x.re,`Mirá el dibujo: está ${x.hint.es} (${x.hint.en}).`]],
  hints:[x.hint,H("está","is / are"),H("están","are")],react:R("Yes, that's right!","Very good!")}}
// ---- Saludo, nombre y una pregunta más de calentamiento (a veces)
const SALUDOS=["Hello! Come in and sit down, please. How are you today?","Good morning! Please, take a seat. How are you today?","Hi there! Nice to see you. How are you today?","Hello! Welcome. Sit down, please. How are you feeling today?","Good afternoon! Please, sit down. How are you today?","Hello! Please, come in. How are you today?"];
const NOMBRES=["What's your name?","Can you tell me your name, please?","And what is your name?"];
const CALENT=[
 {g:"calent",q:"How old are you?",a:"I'm ten years old.",
  need:[[NUM,"Decí tu edad: un número."],[/i'?m|i am|years/,"Empezá con \"I'm… years old\"."]],
  hints:[H("tengo","I'm"),H("diez","ten"),H("años","years old")],react:R("That's a good age!","Great!","Thank you.")},
 {g:"calent",q:"Where do you live?",a:"I live in Buenos Aires.",
  need:[[/i live|\bin\b|my house|we live|i'm from/,"Empezá con \"I live in…\"."]],
  hints:[H("vivo en","I live in"),H("en Buenos Aires","in Buenos Aires"),H("cerca de","near")],react:R("That sounds nice.","Lovely!","I see.")}
];
// ---- Al final, el candidato le hace una pregunta al examinador (Trinity lo pide en el Grade 3)
const QSTEP_Q=["Now, do you have a question for me?","Now it's your turn. Can you ask me a question?","Would you like to ask me a question?"];
const QSTEP={g:"pregunta",q:QSTEP_Q[0],a:"Yes, I do. What's your favourite colour?",
  need:[[/\?|\b(what|where|when|who|why|how|which|do you|does|are you|is it|can you|have you|did you|were you)\b/,"Hacele una pregunta al examinador: \"What's your favourite food?\", \"Do you like your job?\"."]],
  hints:[H("¿Tenés…?","Do you have…?"),H("¿Qué…?","What…?"),H("¿Dónde…?","Where…?")],
  react:reaccionPregunta};   // (cómo contesta el examinador una pregunta: escucha.js, igual en los dos módulos)
const CLOSE_Q=["Thank you. That's the end of our conversation. Goodbye!","Thank you very much. That's all. Goodbye!","OK, that's the end of the exam. Thank you. Goodbye!","Thank you, that's all. Goodbye!","OK, that's all. Thank you very much. Goodbye!"];
const CLOSE={q:CLOSE_Q[0],a:"Goodbye, have a nice day!",
  need:[[/bye/,"Despedite: \"Goodbye!\"."]],react:R("Have a nice day!","See you soon!","Goodbye!"),last:true};

// ---- Para que NO pregunte siempre lo mismo:
//  · cada tema tiene varias preguntas y se elige una que no haya salido en las últimas charlas (memoria en localStorage «trinity_vistas»);
//  · entran 8 de los 9 temas, en orden al azar (los que hace más que no salen, primero);
//  · las repreguntas (follow) salen a veces y también se sortean;
//  · saludo, nombre, pregunta del candidato, despedida y dibujos tienen variantes.
// ⚠️ Cada frase del examinador necesita su audio grabado (en iPhone con manos libres no hay otra voz): al agregar o cambiar preguntas
// hay que volver a generar los audios (README, «Audios grabados»; tools/audio/).
const GRUPOS=["casa","barrio","escuela","rutina","libre","familia","clima","fecha","pasado"];
MIDDLE.forEach(s=>{s.escucha=true});   // preguntas de contenido: el examinador escucha la respuesta (escucha.js)
const VISTAS_KEY="trinity_vistas",PROB_REPREGUNTA=.65;
// arma una charla que pasa por casi todos los temas del Grade 3, en orden distinto cada vez, con dibujos, y termina con la pregunta del candidato
function armarPasos(){
  const V=vistasLeer(),n=(V._n||0)+1;V._n=n;
  const usar=(s,clave)=>{V[(clave||claveP)(s)]=n;return s};
  // saludo (según la hora del día), nombre y, a veces, una pregunta más de calentamiento
  const h=new Date().getHours();
  const saludo=pick(SALUDOS.filter(s=>!(/^Good morning/.test(s)&&h>=12)&&!(/^Good afternoon/.test(s)&&(h<12||h>=20))));
  const apertura=[Object.assign({},OPEN[0],{q:saludo}),Object.assign({},OPEN[1],{q:pick(NOMBRES)})];
  if(Math.random()<.55)apertura.push(usar(elegirNuevo(CALENT,claveP,V,n)));
  // temas: 8 de los 9 (primero los que hace más que no salen), en orden al azar
  const temas=GRUPOS.map(g=>({g,u:V["g:"+g]||0,r:Math.random()})).sort((a,b)=>a.u-b.u||a.r-b.r).slice(0,8).map(x=>x.g);
  const pas=shuffleA(temas).map(g=>{V["g:"+g]=n;return usar(elegirNuevo(MIDDLE.filter(s=>s.g===g),claveP,V,n))});
  // dibujos: un trabajo (justo después del tema de familia, si salió) y dos acciones (presente continuo), nunca dos dibujos seguidos
  const pk=x=>"p"+x.e;
  const j=usar(elegirNuevo(JOBS_PIC,pk,V,n),pk);
  const a1=usar(elegirNuevo(ACT_PIC.filter(x=>x.e!==j.e),pk,V,n),pk);
  const a2=usar(elegirNuevo(ACT_PIC.filter(x=>x.e!==j.e&&x!==a1),pk,V,n),pk);
  const esDib=s=>!!(s&&s.g==="dibujo");
  const ins=(item,desde)=>{const ok=[];for(let p=Math.max(1,desde);p<=pas.length;p++){if(!esDib(pas[p-1])&&!esDib(pas[p]))ok.push(p)}pas.splice(ok.length?pick(ok):pas.length,0,item)};
  const fi=pas.findIndex(s=>s.g==="familia"),trab=stepJobPic(j);
  if(fi>=0)pas.splice(fi+1,0,trab);else ins(trab,1);
  ins(stepActionPic(a1),2);ins(stepActionPic(a2),2);
  vistasGuardar(V);
  return [...apertura,...pas,Object.assign({},QSTEP,{q:pick(QSTEP_Q)}),Object.assign({},CLOSE,{q:pick(CLOSE_Q)})];
}
// ---- Examinador con IA: para que tampoco pregunte siempre lo mismo, la página sortea el orden de los temas y una pregunta-idea de cada uno
// (del mismo banco y con la misma memoria que el guion de siempre) y se lo pasa a la IA como «plan de la charla».
const TEMAS_IA={
 casa:"HOME LIFE (his house or flat, rooms and what is in them, who he lives with, his garden or pets; there is / there are)",
 barrio:"LOCAL AREA and DIRECTIONS (his street, shops and places near his house, how he goes to school, where a place is: near, opposite, next to, behind; or how to get somewhere: go straight on, turn left/right, cross the street). NOT about rooms of the house",
 escuela:"PLACE OF STUDY (school subjects, his classroom or schoolbag, break time, his teacher, what time school starts or finishes)",
 rutina:"DAILY ROUTINE and TIMES (what time he gets up, has breakfast, lunch or dinner, goes to bed; what he does after school or after dinner; encourage \"and\" / \"and then\")",
 libre:"FREE TIME and CAN / CAN'T (hobbies, sports, music, the weekend, what he can and can't do)",
 clima:"WEATHER and SEASONS (the weather today, in summer and winter, his favourite season, what he does when it rains)",
 fecha:"DAYS and DATES (what day or month it is, the date today, his birthday, the days of the week; ordinal numbers up to the 31st)",
 pasado:"PAST (was / were: where he was yesterday or last weekend, was it fun, who was with him)"
};
let _planIA="";
function planIA(esExamen){
  const V=vistasLeer(),n=(V._n||0)+1;V._n=n;
  const turnos=[3,4,5,6,7,8,10,11,12],orden=shuffleA(["casa","barrio","barrio","escuela","rutina","libre","clima","fecha","pasado"]),usadas=new Set();
  const lineas=turnos.map((t,i)=>{
    const g=orden[i],cand=MIDDLE.filter(x=>x.g===g&&!usadas.has(x.q)),x=elegirNuevo(cand,claveP,V,n);
    usadas.add(x.q);V[claveP(x)]=n;
    return " turn "+t+": "+TEMAS_IA[g]+'\n   Question idea (say it naturally in your own simple words; react to his last answer first): "'+x.q+'"';
  });
  vistasGuardar(V);
  return "SESSION PLAN (the page drew these topics and question ideas at random so that every exam is different; for the turns listed here it REPLACES the order of topics in the AGENDA above; turns 1, 2, 9, 13, max and max+1 stay exactly as in the AGENDA):\n"+lineas.join("\n");
}
// ---- El examinador escucha (ver escucha.js): preguntas «de interés» para cuando se menciona algo, y qué repreguntas ya quedaron contestadas.
// ESC_SEG[tema]: lo que pregunta el examinador cuando se mencionó ese tema (de nivel Grade 3: presente, can/can't, there is/are). ya: qué palabras muestran que ya lo contó.
const S3=(q,a,hs,ya)=>({q,a,need:[],corta:true,hints:hs.map(([es,en])=>H(es,en)),react:R(),ya});
const SN3=(q,a,need,hs,ya)=>({q,a,need:[[need,"Contestá con una oración corta: <i>"+a.split(".")[0]+".</i>"]],hints:hs.map(([es,en])=>H(es,en)),react:R(),ya});
const ESC_SEG={
 perro:[S3("What's your dog's name?","My dog's name is Max. He is brown and very friendly.",[["se llama","its name is"],["es marrón","he is brown"],["muy simpático","very friendly"]],/\b(named|called|name)\b/)],
 gato:[S3("What's your cat's name?","My cat's name is Luna. She is small and soft.",[["se llama","its name is"],["es chiquita","she is small"],["es suave","she is soft"]],/\b(named|called|name)\b/)],
 mascota:[S3("What's your pet's name?","My pet's name is Coco. It is very small.",[["se llama","its name is"],["es muy chico","it is very small"],["me gusta","I like it"]],/\b(named|called|name)\b/)],
 futbol:[S3("Who's your favourite player?","My favourite player is Messi.",[["mi jugador favorito","my favourite player"],["es","is"],["juega muy bien","plays very well"]],/\b(favou?rite|player|messi)\b/)],
 natacion:[S3("Where do you swim?","I swim in a pool near my house.",[["nado en","I swim in"],["una pileta","a pool"],["cerca de mi casa","near my house"]],/\b(pool|sea|river|club|beach|lake)\b/)],
 deporte:[S3("Where do you play it?","I play it at school and in the park.",[["lo juego en","I play it at"],["la escuela","school"],["el parque","the park"]],/\b(school|park|club|garden|gym)\b/)],
 musica:[SN3("Can you play an instrument?","Yes, I can. I can play the guitar.",/\bcan\b|can't|cannot|yes|no/,[["sé tocar","I can play"],["la guitarra","the guitar"],["no sé tocar","I can't play"]],/\b(piano|guitar|violin|drums|flute|instrument)\b/)],
 dibujo:[S3("What do you like to draw?","I like drawing animals and cars.",[["me gusta dibujar","I like drawing"],["animales","animals"],["autos","cars"]],/\bdrawing? (a|an|my|animals|cars|people|flowers|houses)\b/)],
 lectura:[S3("What's your favourite book?","My favourite book is about a dragon.",[["mi libro favorito","my favourite book"],["trata de","is about"],["un dragón","a dragon"]],/\bfavou?rite book\b/)],
 juegos:[S3("What's your favourite game?","My favourite game is Minecraft.",[["mi juego favorito","my favourite game"],["es","is"],["con mis amigos","with my friends"]],/\bfavou?rite game\b/)],
 peliculas:[S3("What's your favourite film?","My favourite film is about animals.",[["mi película favorita","my favourite film"],["trata de","is about"],["animales","animals"]],/\bfavou?rite (film|movie)\b/)],
 pizza:[S3("What do you like on your pizza?","I like cheese and tomato on my pizza.",[["me gusta con","I like … on it"],["queso","cheese"],["jamón","ham"]],/\b(cheese|tomato|ham|onions?|mushrooms?|olives)\b/)],
 pasta:[S3("Who cooks pasta at your house?","My dad cooks pasta. It's delicious.",[["cocina","cooks"],["mi papá","my dad"],["es riquísima","it's delicious"]],/\b(cooks?|makes?)\b/)],
 helado:[S3("What's your favourite flavour?","My favourite flavour is chocolate.",[["mi sabor favorito","my favourite flavour"],["chocolate","chocolate"],["frutilla","strawberry"]],/\b(flavou?r|chocolate|vanilla|strawberry|lemon)\b/)],
 dulces:[SN3("Do you eat sweets every day?","No, I don't. I eat sweets at the weekend.",/yes|no|i do|i don't|weekend|sometimes|every/,[["no los como todos los días","I don't eat them every day"],["el fin de semana","at the weekend"],["a veces","sometimes"]],/\b(every day|weekend|sometimes|never)\b/)],
 fruta:[S3("What's your favourite fruit?","My favourite fruit is the banana.",[["mi fruta favorita","my favourite fruit"],["manzana","apple"],["frutilla","strawberry"]],/\bfavou?rite fruit\b/)],
 asado:[S3("Who cooks it?","My dad cooks it. He is very good.",[["lo cocina","cooks it"],["mi papá","my dad"],["muy bueno","very good"]],/\b(cooks?|makes?)\b/)],
 playa:[SN3("Do you like swimming in the sea?","Yes, I do. I like swimming in the sea.",/yes|no|i do|i don't|swim|like/,[["me gusta nadar","I like swimming"],["en el mar","in the sea"],["la arena","the sand"]],/\bswim(ming)?\b/)],
 montana:[SN3("Is it cold in the mountains?","Yes, it is. It's very cold in winter.",/yes|no|is|isn't|cold|hot|warm|snow/,[["hace frío","it's cold"],["en invierno","in winter"],["hay nieve","there is snow"]],/\bcold\b/)],
 campo:[S3("What can you do there?","I can ride a horse and walk by the river.",[["puedo","I can"],["andar a caballo","ride a horse"],["caminar","walk"]],/\bi can\b/)],
 abuelos:[S3("Where do your grandparents live?","They live in a small town near my city.",[["viven en","they live in"],["un pueblo","a town"],["cerca de","near"]],/\b(live|lives) (in|near|far)\b/)],
 cumple:[SN3("Do you have a party on your birthday?","Yes, I do. I have a party with my family.",/yes|no|i do|i don't|party|cake|family|friends/,[["hago una fiesta","I have a party"],["con mi familia","with my family"],["una torta","a cake"]],/\bparty\b/)],
 viaje:[S3("Where do you go on holiday?","I go to the beach in summer.",[["voy a","I go to"],["la playa","the beach"],["en verano","in summer"]],/\b(go|went) to\b/)],
 cocina:[S3("What can you cook?","I can cook eggs and pasta.",[["sé cocinar","I can cook"],["huevos","eggs"],["pastas","pasta"]],/\bcan cook\b/)],
 baile:[SN3("Do you dance at parties?","Yes, I do. I love dancing with my friends.",/yes|no|i do|i don't|dance|love|like/,[["me gusta bailar","I like dancing"],["con mis amigos","with my friends"],["en las fiestas","at parties"]],/\bparties\b/)],
 mates:[SN3("Is maths difficult for you?","No, it isn't. It's easy for me.",/yes|no|is|isn't|easy|difficult|hard/,[["es difícil","it's difficult"],["es fácil","it's easy"],["para mí","for me"]],/\b(easy|difficult|hard)\b/)],
 ingles:[SN3("Do you like English?","Yes, I do. English is fun.",/yes|no|i do|i don't|like|fun/,[["me gusta","I like"],["es divertido","it's fun"],["aprendo","I learn"]],/\b(like|love) english|english (is|was) (fun|easy|difficult|great)\b/)],
 tarea:[S3("When do you do your homework?","I do my homework after school.",[["hago la tarea","I do my homework"],["después de la escuela","after school"],["a la tarde","in the afternoon"]],/\b(after school|before dinner|in the (afternoon|evening|morning))\b/)],
 amigos:[S3("What do you do with your friends?","We play football and we watch films.",[["jugamos","we play"],["miramos películas","we watch films"],["charlamos","we talk"]],/\bwe (play|watch|go|talk|ride|eat|study)\b/)]
};
// repreguntas que ya quedaron contestadas si la respuesta trae estas palabras (pregunta → palabras): el examinador no las hace
const ESC_YA={
 "And what is in your bedroom?":/\b(bed|desk|wardrobe|lamp|chair|toys?|tv|bookcase|carpet|curtains?)\b/,
 "What can you see near your house? A park? Some shops?":/\b(park|shops?|supermarket|bakery|square|library|church)\b/,
 "What time does school finish?":/\bfinish(es)?\b/,
 "And what do you do after school?":/after school/,
 "What do you do before you go to bed?":/\b(brush|before (i )?(go|bed)|read a book)\b/,
 "Can you swim?":/\bswim\b/,
 "What can't you do?":/\b(can't|cannot)\b/,
 "And what do you want to be?":/\b(want to be|would like to be|i'?d like to be)\b/,
 "What's your favourite season? Why?":/\bseason\b/,
 "And when is your birthday?":/\bbirthday\b/,
 "And what day is it today?":/\b(today is|it'?s) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/,
 "Was it fun?":/\b(fun|boring|great|good|nice|bad)\b/,
 "Who was with you?":/\b(with (my|me|him|her|them)|alone|my (mum|mom|dad|friends?|brother|sister|family))\b/,
 "Is it big or small?":/\b(big|small|large|little)\b/,
 "Do you have your own bedroom?":/\b(own (bedroom|room)|share)\b/,
 "Do you have a pet?":/\b(pets?|dogs?|cats?|fish|birds?|rabbits?|hamsters?|turtles?)\b/,
 "Do you like your street?":/\b(street|quiet|noisy)\b/,
 "What do you do in the park?":/\bpark\b/,
 "Is your school far from your house?":/\b(far|near|close)\b/,
 "What do you do at break time?":/\bbreak\b/,
 "Who is your best friend in your class?":/\bbest friend\b/,
 "What do you have for lunch?":/\blunch\b/,
 "What do you have for breakfast?":/\bbreakfast\b/,
 "Who do you have dinner with?":/\bdinner with\b/,
 "Do you play it with your friends?":/\bwith (my )?(friends?|brother|sister|dad|team)\b/,
 "Do you like singing?":/\bsing(ing)?\b/,
 "Who are they?":/\b(mum|mom|dad|mother|father|brother|sister|grand\w+|aunt|uncle|cousin)\b/,
 "What do you like doing with your family?":/\bwith (my )?family\b/,
 "Do you have a pet at home?":/\b(pets?|dogs?|cats?|fish|birds?|rabbits?|hamsters?|turtles?)\b/,
 "Why?":/\bbecause\b/,
 "What do you do in summer?":/\bin summer\b/,
 "What season is it now?":/\b(it'?s|season is) (summer|winter|spring|autumn)\b/,
 "Was it a good day?":/\b(good|great|fun|nice|bad|boring)\b/,
 "Were your friends there?":/\bfriends\b/,
 "Were you with them?":/\bwith (them|my friends|my family)\b/,
 "Was it hot?":/\b(hot|cold|warm)\b/
};
// Herramienta para generar los audios (no la usa la página): todas las frases que puede decir el examinador de siempre. Ver tools/audio/.
window.rkTextosGuion=function(){
  const out=new Set(),add=t=>{t=String(t||"").replace(/\s+/g," ").trim();if(t&&/[a-z]/i.test(t))out.add(t)};
  const muestras=["","fine thank you","no","yes i do","my name is felu","i live in a house","i have a dog","there are four","because it is big","i can swim","i can't swim","it is sunny","it is raining","football","i want to be a vet","my mum is a teacher","i get up at seven","it was good","the first of november","do you like your job","do you have pets","what is your favourite colour","what food do you like","where do you live","can you swim","what time do you get up","what do you do at the weekend","how old are you","what is your name","do you like music","do you have a brother","hello"];
  const reacciones=s=>{if(!s.react)return;for(let n=0;n<14;n++)muestras.forEach(m=>{try{const x=s.react(m);if(typeof x==="string")add(x)}catch(e){}})};
  const paso=(s,nivel)=>{add((s.intro||"")+s.q);add("Good try! You can say: "+s.a+" Now you try.");(s.hints||[]).forEach(h=>add(h.en));reacciones(s);
    if(nivel<2)seguidas(s).forEach(f=>paso(f("x"),nivel+1))};
  [...OPEN,...CALENT,...MIDDLE,CLOSE,QSTEP].forEach(s=>paso(s,0));
  SALUDOS.concat(NOMBRES,QSTEP_Q,CLOSE_Q,REPITE,NO_OIGO,SIGAMOS,GEN).forEach(add);
  escuchaFrases().forEach(add);ELICITAR.forEach(s=>paso(s,0));Object.keys(ESC_SEG).forEach(k=>ESC_SEG[k].forEach(s=>paso(s,0)));   // lo que dice el examinador cuando escucha (escucha.js)
  JOBS_PIC.forEach(j=>PIC_INTROS.forEach(i=>jobQs(j).forEach(q=>paso(stepJobPic(j,i,q),0))));
  ACT_PIC.forEach(x=>PIC_INTROS.forEach(i=>actQs(x).forEach(q=>paso(stepActionPic(x,i,q),0))));
  return [...out];
};
// Dibujos que puede mostrar el examinador. La IA elige SOLO de esta lista y sabe qué muestra cada uno,
// así puede corregir si la respuesta del chico coincide con el dibujo (antes no lo sabía y aprobaba cualquier cosa).
const PIC_LISTA=[
 {e:"🏊",d:"a boy swimming",k:"accion"},{e:"👩‍🍳",d:"a woman cooking",k:"accion"},{e:"🧒⚽🧒",d:"two children playing football",k:"accion"},{e:"🚴",d:"a person riding a bike",k:"accion"},
 {e:"🧒📖",d:"a boy reading a book",k:"accion"},{e:"👩‍🎨",d:"a woman painting",k:"accion"},{e:"💃",d:"a woman dancing",k:"accion"},{e:"🎸",d:"a man playing the guitar",k:"accion"},
 {e:"🏃",d:"a man running",k:"accion"},{e:"🧒🍎",d:"a boy eating an apple",k:"accion"},{e:"👧🎤",d:"a girl singing",k:"accion"},{e:"🧒📺",d:"a boy watching TV",k:"accion"},
 {e:"👩‍⚕️",d:"a woman doctor",k:"trabajo"},{e:"👨‍🚒",d:"a man firefighter",k:"trabajo"},{e:"👩‍🏫",d:"a woman teacher",k:"trabajo"},{e:"🧑‍✈️",d:"a pilot",k:"trabajo"},
 {e:"👨‍🌾",d:"a man farmer",k:"trabajo"},{e:"👮",d:"a police officer",k:"trabajo"},{e:"👨‍🍳",d:"a man cook",k:"trabajo"},{e:"👷",d:"a construction worker",k:"trabajo"}
];
const picInfo=e=>PIC_LISTA.find(x=>x.e===e)||null;
function elegirDibujo(reply){   // si el examinador habla de un dibujo y no mandó ninguno, se elige uno acorde a la pregunta (trabajo o acción, él / ella / ellos)
  const r=String(reply).toLowerCase(),trab=/\bjob\b|\bwork|what does (he|she) do\b|what do they do\b/.test(r);
  let c=PIC_LISTA.filter(x=>x.k===(trab?"trabajo":"accion"));
  const f=/\bthey\b|children|people/.test(r)?c.filter(x=>/children/.test(x.d)):/\bshe\b|\bher\b|woman|girl/.test(r)?c.filter(x=>/woman|girl/.test(x.d)):/\bhe\b|\bhis\b|\bman\b|boy/.test(r)?c.filter(x=>/\b(man|boy)\b/.test(x.d)):[];
  if(f.length)c=f;
  return pick(c);
}
const SISTEMA_IA=`You are a kind, patient examiner for the Trinity GESE Grade 3 oral exam (CEFR A2.1, "Initial stage"). The exam is ONE friendly conversation of up to 7 minutes.
You are talking with Felu, a 10-year-old child from Argentina who is learning English. Speak to him like a warm teacher.
STYLE
- Use very simple English (A1-A2): short sentences, easy words. Contractions are fine (it's, I'm).
- Ask ONE question at a time. Never repeat a question that was already asked (the only exception: ask your previous question again after answering a question from the child, see below).
- First react to the child's last answer in a few words (e.g. "Oh, that sounds nice!"), then link to the next question naturally ("Now, let's talk about your school."). The conversation must feel fluid, not like a list of questions.
- If the child did not understand or asks you to repeat, repeat more slowly with simpler words.
- NEVER say goodbye and NEVER set "end" to true before turn = max+1, even if his answer is short or is a question. If he asks you something earlier, answer in one short sentence and then continue with the next topic of the agenda. Do not skip topics.
- If he asks YOU a question INSTEAD of answering (for example "What is your name?" or "Do you like football?"), answer it in one short, friendly sentence (invent a simple answer about yourself), then say "Now, back to my question." and ask your previous question again. That is not a mistake: set "ok" to true and leave "tip" empty. If he answers AND asks you something ("I like pizza. And you?"), react to his answer, answer his question in a few words and then go on with the next question.
- All Spanish text you write ("tip", "help", the "es" of hints) must be Argentine Spanish with "vos" (decí, probá, podés), never "puedes" or "di".
LISTEN LIKE A REAL EXAMINER (inside the topic of each turn; still one short reaction + ONE question)
- Your short reaction must show that you LISTENED: mention ONE concrete detail of his last answer (a person, an animal, a food, a place or an activity) instead of a generic "Very good!" (for example "A dog! What a nice pet." or "Football, nice!").
- If his answer was sad, negative or "I don't know", do NOT cheer ("That sounds wonderful!"): show a little empathy ("Oh, I'm sorry to hear that." / "That's OK, don't worry.") and make the next question easy.
- Never ask something he has already told you in this conversation. Once or twice, refer back to something he said earlier ("You told me you like football.").
AGENDA (the real Grade 3 syllabus). "turn" is the number of this turn and "max" is the last question turn. On each turn you MUST cover exactly the topic of that turn, in this order, and link it naturally to the previous one. Never merge two topics in one turn and never skip a topic:
 1: greeting, "How are you today?" (warm-up, not assessed)
 2: his name (warm-up)
 3: HOME LIFE: his house, how many rooms, what is in his bedroom, or who he lives with (there is / there are)
 4: LOCAL AREA: is his house near his school, what can he see near his house (a park? shops?)
 5: LOCATIONS and DIRECTIONS in the NEIGHBOURHOOD (not about rooms of the house): ask where a place is, e.g. "Where is the supermarket? Is it near your house?" (near, opposite, in front of, behind, next to), or "How do I get from your school to your house?" (go straight on, turn left/right, cross the street, along, up, down)
 6: PLACE OF STUDY: school subjects, what is in his classroom, or what time school finishes
 7: DAILY ROUTINE and TIMES: what time he gets up / goes to bed, what he does after school (encourage "and" / "and then")
 8: FREE TIME and CAN / CAN'T: hobbies, the weekend, what he can and can't do
 9: FAMILY and JOBS with a PICTURE: show a person with a job and ask "What's his/her job?" (you may first ask what his mum or dad does)
 10: WEATHER: the weather today or in summer / winter, his favourite season
 11: DATES: what's the date today, or when is his birthday (ordinal numbers up to 31st)
 12: PAST (was / were): where he was yesterday or last weekend, was it fun
 13: PRESENT CONTINUOUS with a PICTURE: show a picture and ask "What is he/she doing?" or "What are they doing?"
 turn = max (14): say "Now, do you have a question for me?" (the candidate must ask the examiner at least one question)
 turn = max+1 (15): answer his question in one short sentence and say a warm goodbye. Set "end" to true.
HARD RULES FOR EVERY REPLY: one short reaction (at most 8 words) + ONE short question (at most 15 words). NEVER ask two questions in one reply and never join two questions with "and". A 10-year-old must be able to follow it.
GRAMMAR he should use: present simple for routines, present continuous for what is happening now or in a picture, can/can't, was/were, on/in/at, near/in front of/behind/opposite, and the link words "and" and "and then".
PICTURES: only on turns 9 and 13. To show a picture put EXACTLY one emoji string from the PICTURES AVAILABLE list (given below) in "picture", say "Look at this picture." in the reply and ask about it. If your reply mentions a picture you MUST fill "picture". On every other turn "picture" MUST be an empty string "" (never repeat a previous picture). The text after "=" says what the picture shows: when you judge the child's answer to a picture question, use it (ok=false if his answer does not match the picture).
HELP FOR THE CHILD (very important)
- "hints": 1 to 3 short items {"es": Spanish, "en": English} with the English words or phrases that will help him answer YOUR NEXT QUESTION (e.g. {"es":"enfrente de","en":"opposite"}). They are shown to the child between questions.
- "help": if his last answer contained Spanish words or he said he doesn't know ("no sé", "I don't know"), write one short sentence in Spanish telling him how to say it in English (e.g. "«perro» se dice dog."). Otherwise "".
Answer ONLY with JSON: {"reply": string, "ok": boolean, "tip": string, "model": string, "end": boolean, "picture": string, "hints": [{"es": string, "en": string}], "help": string}
- "reply": what the examiner says out loud (English only, no emojis).
- "ok": be a fair but DEMANDING judge, do not say yes just to be nice. true only if the last answer was relevant, in English, a sentence (not one word) and, for a picture, matched what the picture shows (small grammar mistakes are fine). false if it was empty, off-topic, in Spanish, one word, or did not match the picture. At the warm-up turns (1 and 2) always true.
- "tip": if ok is false, one short helpful tip in SPANISH (max 20 words); otherwise "".
- "model": if ok is false, a short correct example answer in English; otherwise "".
- "end": true only for the final goodbye.`;
const PROMPT_TRANSCRIBIR="Transcribe exactly what the speaker says. The speaker is a child called Felu (short for Felipe) learning English (Argentine Spanish accent) and the speech is meant to be in English. If you hear his name, write it as Felu. Output ONLY the transcription: no quotes, no comments, no translation. If there is no intelligible speech, output nothing.";
// --- Corrección final: la IA lee TODA la charla y la puntúa (0 a 10) con los criterios del Grade 3
const SISTEMA_EVAL=`You are a Trinity College London GESE examiner. You have just examined Felu, a 10-year-old child from Argentina, in the Grade 3 oral exam (Initial stage, CEFR A2.1). Now MARK the whole conversation.
The transcript has lines "EXAMINER:" and "FELU:". Felu's lines come from automatic speech-to-text: IGNORE punctuation, capital letters, spelling and tiny transcription slips (never count them as mistakes). "[picture shown to the child: ...]" says what the drawing showed. "(no answer)" means he said nothing. "[the examiner helped the child here]" means his first try was weak and the examiner modelled the answer, so his repetition counts for little.
LEVEL: Grade 3 is A2.1, very simple English. Short simple sentences ("I live in a house.", "He is swimming.") deserve a HIGH mark. Do not ask for more than a 10-year-old beginner can do.
MARK these four criteria with a whole number from 0 to 10:
- comprension: he understood the questions and answered WHAT WAS ASKED (relevant, on topic, and for a picture question, matching the picture shown). Answers in Spanish, off-topic answers, a wrong answer about the picture, "I don't know" and silence lower it.
- gramatica: accuracy of the Grade 3 grammar: present simple, present continuous (pictures), can / can't, was / were, there is / there are, prepositions (in, on, at, near, next to, opposite, in front of, behind), and the link words "and" / "and then". Small slips are fine; errors that make a sentence hard to understand lower it a lot.
- vocabulario: the right words for the Grade 3 topics (jobs, places in town, school, home, weather, free time, dates and times) and some variety.
- fluidez: how much he says: full sentences instead of one word, link words (and, and then, because), tries to say more than the minimum.
SCALE: 0-3 very weak; 4-5 weak; 6 pass; 7 good; 8 very good; 9-10 excellent for his level. Be honest, fair and consistent: not harsh and not flattering. Never give 8 or more if most answers were one word or in Spanish. Never give less than 5 if he answered most questions with correct simple sentences.
The message starts with FACTS counted by the app (they are exact, trust them). If most of his answers were a single word, silence, Spanish or "I don't know", "comprension" and "fluidez" must be 4 or less.
"pregunto": true ONLY if Felu asked the examiner at least one real question of his own (for example "Do you like pizza?" or "What is your favourite colour?").
TEXT FOR THE CHILD: write it in Argentine Spanish with "vos" (decí, probá, podés), warm and short, as if talking to a 10-year-old. English only inside quotes.
- "resumen": 2 short sentences: the overall impression and the single most important thing to improve.
- "bien": 2 or 3 short strings with what he did WELL, each with a real example of what he said.
- "mejorar": up to 4 items taken from what Felu REALLY said: "dijo" = his words copied EXACTLY from the transcript (English), "mejor" = the corrected or fuller English sentence a child of his level could say, "porque" = one short reason in Spanish. Only real mistakes, answers in Spanish or one-word answers. If there are none, return an empty list. Never invent what he said.
- "repasar": 1 to 4 short Spanish strings naming the Grade 3 topics or grammar he should study (for example "Presente continuo: He is swimming", "Direcciones: near, opposite, behind").
Answer ONLY with JSON: {"comprension": integer, "gramatica": integer, "vocabulario": integer, "fluidez": integer, "pregunto": boolean, "resumen": string, "bien": [string], "mejorar": [{"dijo": string, "mejor": string, "porque": string}], "repasar": [string]}`;
const EVAL_CRIT=[["comprension","🎧","Entender y responder"],["gramatica","🧩","Gramática"],["vocabulario","📚","Vocabulario"],["fluidez","💬","Fluidez"]];
// ---- vocabulario del documento (tocá una palabra para escucharla)
const VOCAB=[
 ["Days of the week","Días de la semana","Today is <b>Saturday</b>. / <b>On</b> Monday I go to school.",
  [["Monday","lunes"],["Tuesday","martes"],["Wednesday","miércoles"],["Thursday","jueves"],["Friday","viernes"],["Saturday","sábado"],["Sunday","domingo"]]],
 ["Months","Meses","My birthday is <b>in</b> March.",
  [["January","enero"],["February","febrero"],["March","marzo"],["April","abril"],["May","mayo"],["June","junio"],["July","julio"],["August","agosto"],["September","septiembre"],["October","octubre"],["November","noviembre"],["December","diciembre"]]],
 ["Seasons","Estaciones","My favourite season is <b>summer</b> because it is hot.",
  [["winter","invierno"],["spring","primavera"],["summer","verano"],["autumn","otoño"]]],
 ["Weather","El clima","What's the weather like? — <b>It's sunny</b>.",
  [["sunny","soleado"],["hot","caluroso"],["partly cloudy","parcialmente nublado"],["cold","frío"],["stormy","tormentoso"],["windy","ventoso"],["rainy","lluvioso"],["snowy","nevado"],["cloudy","nublado"],["hailing","está granizando"],["tornado","tornado"],["rainbow","arcoíris"]]],
 ["Parts of the house","Partes de la casa","There are three <b>bedrooms</b> in my house.",
  [["attic","altillo"],["bedroom","dormitorio"],["bathroom","baño"],["nursery","cuarto del bebé"],["home office","escritorio / estudio"],["living room","living"],["dining room","comedor"],["kitchen","cocina"],["laundry room","lavadero"],["basement","sótano"],["garage","garaje"]]],
 ["Household items","Cosas de la casa","There is a <b>bed</b> and a <b>desk</b> in my bedroom.",
  [["bed","cama"],["desk","escritorio"],["wardrobe","ropero"],["lamp","lámpara"],["nightstand","mesa de luz"],["bathtub","bañadera"],["toilet","inodoro"],["sink","pileta / lavatorio"],["shower","ducha"],["curtain","cortina"],["sofa","sofá"],["armchair","sillón"],["table","mesa"],["carpet","alfombra"],["bookcase","biblioteca (mueble)"],["TV / television","tele"],["fridge","heladera"],["chair","silla"],["cup","taza"],["cupboard","alacena"]]],
 ["Places in town","Lugares de la ciudad","There is a <b>bakery</b> near my house.",
  [["shopping centre","shopping"],["bus stop","parada de colectivo"],["supermarket","supermercado"],["town hall","municipalidad"],["house","casa"],["playground","plaza de juegos"],["library","biblioteca"],["square","plaza"],["sports centre","polideportivo"],["museum","museo"],["theatre","teatro"],["bakery","panadería"],["church","iglesia"],["cinema","cine"],["police station","comisaría"],["fire station","cuartel de bomberos"],["greengrocery","verdulería"],["chemist's","farmacia"],["butcher's","carnicería"],["café","café / bar"],["street","calle"],["post office","correo"]]],
 ["Sports","Deportes","I <b>play football</b> on Saturdays. / I <b>go swimming</b>.",
  [["basketball","básquet"],["football / soccer","fútbol"],["ice hockey","hockey sobre hielo"],["cricket","críquet"],["baseball","béisbol"],["American football","fútbol americano"],["volleyball","vóley"],["tennis","tenis"],["rugby","rugby"],["golf","golf"],["swimming","natación"]]],
 ["Free time activities","Tiempo libre","At the weekend <b>I watch TV</b> and <b>I play cards</b>.",
  [["I watch TV","miro tele"],["I listen to music","escucho música"],["I paint","pinto"],["I draw","dibujo"],["I dance","bailo"],["I fly a kite","remonto un barrilete"],["I take photos","saco fotos"],["I spend time with my family","paso tiempo con mi familia"],["I take a nap","duermo la siesta"],["I write stories","escribo cuentos"],["I read a book","leo un libro"],["I read the newspaper","leo el diario"],["I read magazines","leo revistas"],["I read comics","leo historietas"],["I read news online","leo noticias en internet"],["I watch videos online","miro videos en internet"],["I surf the internet","navego en internet"],["I check my social media","miro mis redes"],["I send messages to my friends","mando mensajes a mis amigos"],["I chat with my friends","charlo con mis amigos"],["I play cards","juego a las cartas"],["I play dominoes","juego al dominó"],["I play scrabble","juego al scrabble"],["I play with my dolls","juego con mis muñecas"],["I play with my toys","juego con mis juguetes"]]],
 ["Jobs","Trabajos","My dad <b>is an architect</b>. / I want to be <b>a vet</b>.",
  [["teacher","maestro/a"],["doctor","médico/a"],["nurse","enfermero/a"],["firefighter","bombero/a"],["police officer","policía"],["barber","peluquero"],["pilot","piloto"],["cook","cocinero/a"],["mail carrier","cartero/a"],["dentist","dentista"],["vet","veterinario/a"],["mechanic","mecánico/a"],["soldier","soldado"],["artist","artista"],["farmer","granjero/a"],["photographer","fotógrafo/a"],["singer","cantante"],["carpenter","carpintero/a"],["scientist","científico/a"],["worker","obrero/a"],["taxi driver","taxista"],["waiter","mozo/a"],["musician","músico/a"],["astronaut","astronauta"],["baker","panadero/a"]]]
];
VOCAB.push(
 ["School (place of study)","Lugar de estudio","I study <b>maths</b> and <b>English</b> at school.",
  [["classroom","aula"],["teacher","maestro/a"],["student","alumno/a"],["desk","pupitre"],["board","pizarrón"],["schoolbag","mochila"],["notebook","cuaderno"],["pencil","lápiz"],["pen","lapicera"],["rubber","goma de borrar"],["ruler","regla"],["library","biblioteca"],["playground","patio"],["lesson","clase"],["homework","tarea"],["break","recreo"],["timetable","horario"],["maths","matemática"],["English","inglés"],["science","ciencias"],["history","historia"],["geography","geografía"],["art","plástica"],["music","música"],["PE","educación física"]]],
 ["Daily routine","Rutina diaria","I <b>get up</b> at seven and I <b>have breakfast</b>.",
  [["get up","levantarse"],["wash my face","lavarme la cara"],["brush my teeth","lavarme los dientes"],["have breakfast","desayunar"],["go to school","ir a la escuela"],["have lunch","almorzar"],["finish school","terminar la escuela"],["do my homework","hacer la tarea"],["play with my friends","jugar con mis amigos"],["have dinner","cenar"],["go to bed","ir a dormir"]]],
 ["Directions","Direcciones","<b>Go straight on</b> and then <b>turn left</b>.",
  [["go straight on","seguir derecho"],["turn left","doblar a la izquierda"],["turn right","doblar a la derecha"],["cross the street","cruzar la calle"],["walk along","caminar por"],["go up","subir"],["go down","bajar"],["on the left","a la izquierda"],["on the right","a la derecha"],["on the corner","en la esquina"],["near","cerca de"],["opposite","enfrente de"],["in front of","delante de"],["behind","detrás de"],["next to","al lado de"]]],
 ["Times of the day","Momentos del día","I go to school <b>in the morning</b>.",
  [["in the morning","a la mañana"],["in the afternoon","a la tarde"],["in the evening","a la noche (temprano)"],["at night","de noche"],["o'clock","en punto"],["half past","y media"],["quarter past","y cuarto"],["quarter to","menos cuarto"],["noon","mediodía"],["midnight","medianoche"]]]
);
// ---- dibujos (emojis) para estudiar: vocabulario, números y gramática
const DIB={
 // días y meses
 monday:"🌙",tuesday:"🔥",wednesday:"🐸",thursday:"⚡",friday:"🎉",saturday:"⚽",sunday:"☀️",
 january:"⛄",february:"💌",march:"🍀",april:"🌧️",may:"🌷",june:"🏖️",july:"🎆",august:"🪁",september:"🍂",october:"🎃",november:"🍁",december:"🎄",
 // estaciones y clima
 winter:"❄️",spring:"🌸",summer:"🏖️",autumn:"🍂",
 sunny:"☀️",hot:"🥵",cold:"🥶","partly cloudy":"⛅",stormy:"⛈️",windy:"💨",rainy:"🌧️",snowy:"🌨️",cloudy:"☁️",hailing:"🧊",tornado:"🌪️",rainbow:"🌈",
 // casa
 attic:"🏚️",bedroom:"🛏️",bathroom:"🛁",nursery:"🍼","home office":"💻","living room":"🛋️","dining room":"🍽️",kitchen:"🍳","laundry room":"🧺",basement:"🪜",garage:"🚗",
 bed:"🛏️",desk:"🖥️",wardrobe:"🚪",lamp:"💡",nightstand:"🛎️",bathtub:"🛁",toilet:"🚽",sink:"🚰",shower:"🚿",curtain:"🪟",sofa:"🛋️",armchair:"💺",table:"🪑",carpet:"🟫",bookcase:"📚","tv / television":"📺",fridge:"🧊",chair:"🪑",cup:"☕",cupboard:"🗄️",
 // ciudad
 "shopping centre":"🛍️","bus stop":"🚏",supermarket:"🛒","town hall":"🏛️",house:"🏠",playground:"🛝",library:"📚",square:"⛲","sports centre":"🏟️",museum:"🖼️",theatre:"🎭",bakery:"🥖",church:"⛪",cinema:"🎬","police station":"🚓","fire station":"🚒",greengrocery:"🥦","chemist's":"💊","butcher's":"🥩","café":"☕",street:"🛣️","post office":"📮",
 // deportes
 basketball:"🏀","football / soccer":"⚽","ice hockey":"🏒",cricket:"🏏",baseball:"⚾","american football":"🏈",volleyball:"🏐",tennis:"🎾",rugby:"🏉",golf:"⛳",swimming:"🏊",
 // tiempo libre
 "i watch tv":"📺","i listen to music":"🎧","i paint":"🎨","i draw":"✏️","i dance":"💃","i fly a kite":"🪁","i take photos":"📸","i spend time with my family":"👨‍👩‍👧‍👦","i take a nap":"😴","i write stories":"📝","i read a book":"📖","i read the newspaper":"📰","i read magazines":"📔","i read comics":"🦸","i read news online":"📱","i watch videos online":"▶️","i surf the internet":"🌐","i check my social media":"👍","i send messages to my friends":"💬","i chat with my friends":"🗣️","i play cards":"🃏","i play dominoes":"🁢","i play scrabble":"🔤","i play with my dolls":"🪆","i play with my toys":"🧸",
 // trabajos
 teacher:"👩‍🏫",doctor:"👨‍⚕️",nurse:"👩‍⚕️",firefighter:"🧑‍🚒","police officer":"👮",barber:"💈",pilot:"🧑‍✈️",cook:"🧑‍🍳","mail carrier":"📬",dentist:"🦷",vet:"🐶",mechanic:"🔧",soldier:"🪖",artist:"🧑‍🎨",farmer:"🧑‍🌾",photographer:"📷",singer:"🎤",carpenter:"🪚",scientist:"🔬",worker:"👷","taxi driver":"🚕",waiter:"🍽️",musician:"🎸",astronaut:"🧑‍🚀",baker:"🧁"
};
Object.assign(DIB,{
 classroom:"🏫",teacher:"👩‍🏫",student:"🧑‍🎓",desk:"🪑",board:"🧑‍🏫",schoolbag:"🎒",notebook:"📓",pencil:"✏️",pen:"🖊️",rubber:"🧽",ruler:"📏",library:"📚",playground:"🛝",lesson:"📖",homework:"📝",break:"🥪",timetable:"🗓️",maths:"➗",english:"🇬🇧",science:"🔬",history:"🏛️",geography:"🌍",art:"🎨",music:"🎵",pe:"🏃",
 "get up":"⏰","wash my face":"🧼","brush my teeth":"🪥","have breakfast":"🥣","go to school":"🚸","have lunch":"🍝","finish school":"🔔","do my homework":"📝","play with my friends":"🧒","have dinner":"🍽️","go to bed":"🛏️",
 "go straight on":"⬆️","turn left":"⬅️","turn right":"➡️","cross the street":"🚸","walk along":"🚶","go up":"⤴️","go down":"⤵️","on the left":"◀️","on the right":"▶️","on the corner":"📍",near:"📍",opposite:"↔️","in front of":"⏩",behind:"⏪","next to":"🤝",
 "in the morning":"🌅","in the afternoon":"☀️","in the evening":"🌆","at night":"🌙","o'clock":"🕐","half past":"🕧","quarter past":"🕜","quarter to":"🕠",noon:"🕛",midnight:"🌌"
});
const DIB_CAT={"days of the week":"📅","months":"🗓️","seasons":"🍂","weather":"🌦️","parts of the house":"🏠","household items":"🛋️","places in town":"🏙️","sports":"⚽","free time activities":"🎮","jobs":"👩‍🏫",
 "ordinal numbers":"🔢","greetings":"👋","personal information":"🪪","pronouns":"👦","present simple":"☀️","present continuous":"🏃","prepositions of place":"📍","prepositions of movement":"➡️","prepositions of time":"⏰","wh- questions":"❓","can (ability)":"💪","past tense of the verb to be":"⏪"};
Object.assign(DIB_CAT,{"school (place of study)":"🏫","daily routine":"⏰","directions":"🧭","times of the day":"🕐","link words: and, and then":"🔗","telling the time":"🕒","giving directions":"🧭","questions to ask the examiner":"🙋","pronunciation":"🗣️"});
// escenas para las preposiciones (dos renglones = arriba / abajo)
const DIB_PREP={"in":"🐱📦","on":"📖<br>🪑","under":"🪑<br>⚽","next to":"🛋️💡","behind":"🚪🐕","in front of":"🚗🏠","between":"👦🧒👧","near":"🏫🏠","beside":"🦉📦","above":"💡<br>🪑","below":"📦<br>⚽","among":"🦉🦉🦜🦉",
 "up / down":"🪜⬆️⬇️","into / out of":"🐸➡️💧","across":"🚶↔️🛣️","along":"🚶🌊","through":"🚂🚇","over / under":"🐦🏠","past":"🦉🌳","to / from":"🏫🚶",
 "at":"🕒","on ":"📅"};
DIB_PREP["opposite"]="🏫↔️🏦";
// ---- examen
const bank=[
["Ordinal numbers","How do you write 3rd?",["third","threeth","thirth"],0],
["Ordinal numbers","Which is correct for 12th?",["twelveth","twelfth","twelvth"],1],
["Ordinal numbers","How do you write 22nd?",["twenty-second","twenty-twoth","twenty-secondth"],0],
["Ordinal numbers","Which number is 'fifth'?",["4th","5th","15th"],1],
["Ordinal numbers","How do you write 29th?",["twenty-nineth","twenty-ninth","twenty-nineteenth"],1],
["Ordinal numbers","My birthday is on the ___ of July (31).",["thirty-one","thirty-first","thirtieth"],1],
["Greetings","'Hello, how are you?' — Best answer:",["I'm eight.","I'm fine, thank you. And you?","My name is Ana."],1],
["Greetings","When you leave the room you say:",["Nice to meet you!","Goodbye, have a nice day!","How are you?"],1],
["Personal information","'How old are you?' —",["I am from Argentina.","I am nine years old.","I'm fine."],1],
["Personal information","'Where are you from?' —",["I am from Argentina.","I am Argentina years.","My favourite is Argentina."],0],
["Pronouns","Lucas is my friend. ___ is ten.",["She","He","It"],1],
["Pronouns","Mum and I are at home. ___ are happy.",["They","We","You"],1],
["Pronouns","Look at the dog! ___ is very big.",["It","He","They"],0],
["Present simple","She ___ football every Sunday.",["play","plays","playing"],1],
["Present simple","___ you like pizza?",["Does","Are","Do"],2],
["Present simple","My dad ___ TV at night.",["watchs","watches","watch"],1],
["Present continuous","Look! The baby ___.",["is sleeping","sleeps","are sleeping"],0],
["Present continuous","What are you doing? — I ___ a book.",["read","am reading","is reading"],1],
["Present continuous","They ___ in the park now.",["are running","is running","runs"],0],
["Prepositions of place","The ball is ___ the bed (debajo).",["on","under","in"],1],
["Prepositions of place","The book is ___ the table (encima).",["on","in","between"],0],
["Prepositions of place","I sit ___ Tom and Ana.",["next","between","behind"],1],
["Prepositions of movement","The train goes ___ the tunnel.",["through","on","at"],0],
["Prepositions of movement","Walk ___ the street to the shop (cruzar).",["across","under","into"],0],
["Prepositions of movement","The frog jumps ___ the water.",["into","out","on"],0],
["Prepositions of time","I get up ___ 7 o'clock.",["in","on","at"],2],
["Prepositions of time","My birthday is ___ Monday.",["on","in","at"],0],
["Prepositions of time","We go to the beach ___ summer.",["at","on","in"],2],
["Wh- questions","___ do you live? — In Buenos Aires.",["When","Where","Who"],1],
["Wh- questions","___ is your teacher? — Miss Laura.",["Who","What","Why"],0],
["Wh- questions","___ brothers have you got? — Two.",["How many","What","When"],0],
["Wh- questions","Why do you like cats? — ___ they are cute.",["Because","So","And"],0],
["Can (ability)","She ___ ride a bike.",["can","cans","can to"],0],
["Can (ability)","Fish ___ walk.",["can","can't","doesn't can"],1],
["Can (ability)","Can you swim? — Yes, I ___.",["do","am","can"],2],
["Past of to be","I ___ at school yesterday.",["were","was","am"],1],
["Past of to be","They ___ at the beach last week.",["was","were","are"],1],
["Past of to be","___ you at home yesterday? — Yes, I was.",["Was","Were","Did"],1],
["Weather","It's raining. Take an umbrella! It's ___.",["sunny","rainy","windy"],1],
["Weather","Después de la lluvia aparece un ___.",["rainbow","tornado","snowy"],0],
["Weather","'Hay viento' es: It's ___.",["cloudy","windy","cold"],1],
["Days and months","The day after Monday is ___.",["Wednesday","Sunday","Tuesday"],2],
["Days and months","The first month of the year is ___.",["January","June","December"],0],
["Days and months","The month after July is ___.",["June","August","September"],1],
["Days and months","'Otoño' en inglés es:",["autumn","spring","winter"],0],
["Days and months","It's very hot and we go to the beach. It's ___.",["winter","summer","autumn"],1],
["Parts of the house","You cook in the ___.",["bathroom","kitchen","garage"],1],
["Parts of the house","You sleep in the ___.",["bedroom","dining room","basement"],0],
["Parts of the house","The car is in the ___.",["attic","garage","living room"],1],
["Household items","You keep food cold in the ___.",["cupboard","fridge","wardrobe"],1],
["Household items","'Ropero' en inglés es:",["wardrobe","bookcase","desk"],0],
["Household items","You have a shower in the bathroom. 'Bañadera' es:",["sink","bathtub","toilet"],1],
["Places in town","You buy bread at the ___.",["bakery","butcher's","library"],0],
["Places in town","You buy medicine at the ___.",["chemist's","cinema","bus stop"],0],
["Places in town","You watch a film at the ___.",["museum","cinema","post office"],1],
["Places in town","You borrow books at the ___.",["library","supermarket","church"],0],
["Places in town","You send a letter at the ___.",["fire station","post office","square"],1],
["Sports","You play it with a racket and a ball:",["tennis","swimming","rugby"],0],
["Sports","You do it in the water:",["golf","swimming","cricket"],1],
["Free time","'Remonto un barrilete' es:",["I fly a kite","I take a nap","I draw"],0],
["Free time","'Duermo la siesta' es:",["I take photos","I take a nap","I paint"],1],
["Jobs","This person helps sick animals:",["vet","pilot","barber"],0],
["Jobs","This person flies a plane:",["farmer","pilot","waiter"],1],
["Jobs","This person makes bread:",["baker","dentist","singer"],0],
["Jobs","This person puts out fires:",["police officer","firefighter","mechanic"],1],
["Prepositions of place","The lamp is ___ the table (arriba, sin tocarla).",["above","below","among"],0],
["Prepositions of movement","The owl flies ___ the tree (pasa por al lado).",["past","into","on"],0],
["Prepositions of time","Santa comes ___ Christmas Day.",["in","on","at"],1],
["Prepositions of time","I go to bed ___ midnight.",["at","on","in"],0],
["Prepositions of time","I was born ___ 2017.",["on","at","in"],2]
];
