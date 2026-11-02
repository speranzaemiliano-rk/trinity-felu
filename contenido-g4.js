// MÓDULO 2 · Trinity GESE Grade 4 (Raphina). Contenido: tema preparado (hoja de 4 puntos), conversación sobre 6 temas, textos para la IA, vocabulario y examen escrito.
// El motor (motor.js) es el mismo que usa el módulo de Felu y lee de acá lo que necesita (ver README, «Módulos»).
// Fuente: «GESE Grade 4 — Exam format» de Trinity College London (CEFR A2.2): examen de 10 minutos con dos fases evaluadas:
//   1) Tema preparado por el candidato (hasta 5 min): cuenta de a poco los 4 puntos de su hoja, responde preguntas y le hace al examinador AL MENOS UNA pregunta sobre el tema;
//   2) Conversación (hasta 5 min) sobre DOS de estos temas que elige el examinador: Holidays · Shopping · School and work · Hobbies and sports · Food · Weekend and seasonal activities.
// Lenguaje del grado: hablar del pasado (past simple regular e irregular), planes (going to), comparar (comparativos y superlativos), gustos (like + -ing / to), cada cuánto y cómo (adverbios), y el conector but.
const MOD={id:"g4",grado:4,nombre:"Raphina",titulo:"Trinity GESE Grade 4",minutos:10,notasKey:"trinity_g4_notas",iaMax:17};
const VISTAS_KEY="trinity_g4_vistas",PROB_REPREGUNTA=.65,TEMA_KEY="trinity_g4_tema",MODO_KEY="trinity_g4_modo";

// ---- cómo se reconoce, en lo que dice quien practica, lo que pide el grado (sirve para dar pistas, para la nota y para contar lo que usó)
const NO_ED="need|bed|red|hundred|sled|speed|seed|feed|weed|bleed|breed|shed|wed|fed|led|bred|tired|excited|bored|interested|scared|worried|relaxed|surprised|pleased|crowded|married|embarrassed|confused|annoyed|amazed|disappointed|frightened|exhausted|stressed|shocked|talented|naked";   // (los últimos son adjetivos: «I'm tired» no es pasado)
const PAS=new RegExp("\\b(?!(?:"+NO_ED+")\\b)\\w{2,}ed\\b|\\b(went|had|saw|ate|bought|made|took|came|got|gave|said|told|thought|found|left|met|sat|swam|wrote|ran|drank|slept|rode|was|were|did|didn'?t|wasn'?t|weren'?t|won|lost|felt|heard|knew|sang|flew|fell|built|taught|wore|spent|paid|sent|began|chose|drew|forgot|held|kept|stood|woke|brought|caught|sold|became|grew|threw|understood|drove|broke|fed|led|blew|spoke|hid|rang|lit|dug|swept|shook|stole|tore|rose|sank|stuck|bit|bent|lent|fought|hung|meant|learnt|burnt|dreamt|smelt|spelt)\\b");
const FUT=/\bgoing to\b|\bgonna\b/;
const GUS=/\b(like|likes|love|loves|enjoy|enjoys|prefer|prefers|favou?rite|hate|hates|dislike)\b|don'?t like|not like/;
const COMP=/\b\w+er than\b|\bmore \w+ than\b|\bless \w+ than\b|\bbetter\b|\bworse\b|\bthe (?!(?:rest|west|east|test|forest|nest|guest|chest|contest|request|interest|pest|vest|quest|crest|arrest|suggest|harvest)\b)\w+est\b|\bthe most \w+|\bthe (best|worst)\b|\bas \w+ as\b/;
const FREC=/\b(always|usually|often|sometimes|never|hardly ever|rarely|every|once|twice|\d+ times|(two|three|four|five|six|seven) times|a (day|week|month|year)|daily|weekly|on (mondays|tuesdays|wednesdays|thursdays|fridays|saturdays|sundays)|at the weekend|quickly|slowly|carefully|badly|fast|hard|loudly|quietly|easily|happily)\b|\bwell\b(?!,)/;   // («Well, I think…» no es un adverbio de modo)
const PREGUNTA=/\?|\b(what|where|when|who|why|how|which|do you|does|are you|is it|can you|have you|did you|were you|will you|would you|are you going)\b/;
const N_PAS=[PAS,"Contalo en pasado: <i>I went…</i>, <i>we played…</i>, <i>it was…</i>."];
const N_FUT=[FUT,"Usá <i>going to</i>: <i>I'm going to…</i>, <i>we're going to…</i>."];
const N_GUS=[GUS,"Decí lo que te gusta: <i>I like playing…</i>, <i>I love…</i>, <i>I don't like…</i>."];
const N_COM=[COMP,"Comparalo: <i>bigger than</i>, <i>more interesting than</i>, <i>the best</i>."];
const N_FRE=[FREC,"Decí cada cuánto o cómo: <i>every day</i>, <i>twice a week</i>, <i>always</i>, <i>quickly</i>."];

// ---- los 6 temas de la conversación (los elige el examinador)
const AREAS4={
 holidays:{es:"Holidays",ico:"🏖️",dicho:"holidays"},
 shopping:{es:"Shopping",ico:"🛍️",dicho:"shopping"},
 school:{es:"School and work",ico:"🏫",dicho:"school and work"},
 hobbies:{es:"Hobbies and sports",ico:"⚽",dicho:"hobbies and sports"},
 food:{es:"Food",ico:"🍕",dicho:"food"},
 weekend:{es:"Weekend and seasonal activities",ico:"🌤️",dicho:"the weekend and seasonal activities"}
};
const AREAS_KEYS=Object.keys(AREAS4);

// ---- las funciones del grado: cada punto de la hoja del tema es de uno de estos tipos y el examinador pregunta distinto según el tipo.
// Las preguntas son GENERALES (valen para cualquier tema) y tienen su audio grabado; el punto del tema se ve en pantalla («📌 …») mientras se charla.
const GEN_SEG=[
 {q:"Can you tell me more about that?",a:"Yes. I can tell you more. I like it a lot.",need:[],hints:[H("puedo contarte más","I can tell you more"),H("me gusta mucho","I like it a lot"),H("es muy divertido","it's really fun")],react:R()},
 {q:"Really? What else can you tell me?",a:"I can also tell you about the people and the food.",need:[],hints:[H("también","also"),H("la gente","the people"),H("la comida","the food")],react:R()}
];
const TIPOS={
 pasado:{ico:"🕒",nom:"Algo que pasó (pasado)",ayuda:"Usá el <b>pasado</b>: <i>I went</i>, <i>we played</i>, <i>it was</i>, <i>I bought</i>…",
  need:[N_PAS],a:"Last summer we went to the beach. We played in the sea and we ate ice cream.",
  hints:[H("fui / fuimos","I went / we went"),H("jugué / jugamos","I played / we played"),H("fue muy lindo","it was very nice")],
  react:R("That sounds wonderful!","Oh, how nice!","I see. That sounds like fun!"),
  preg:[{intro:"Let's talk about this point. ",q:"What happened? Tell me about it."},{intro:"Now, this point. ",q:"When did it happen, and who was there?"},{intro:"OK, let's look at this one. ",q:"What did you do?"},{intro:"And this point? ",q:"Can you tell me what happened last time?"},{intro:"Tell me about this point. ",q:"What was the best part?"}],
  seg:[{q:"What happened next?",a:"Then we had lunch and we took some photos.",need:[N_PAS],hints:[H("después","then"),H("almorzamos","we had lunch"),H("sacamos fotos","we took photos")],react:R()},
       {q:"How did you feel?",a:"I felt very happy and a little tired.",need:[[/felt|was|were/,"Contalo en pasado: <i>I felt…</i>, <i>I was…</i>."]],hints:[H("me sentí","I felt"),H("feliz","happy"),H("cansado/a","tired")],react:R()},
       {q:"Who was with you?",a:"My mum, my dad and my cousins were with me.",need:[[/was|were|with/,"Decí quién estaba: <i>… were with me</i>."]],hints:[H("estaban conmigo","were with me"),H("mis primos","my cousins"),H("mis amigos","my friends")],react:R()}]},
 futuro:{ico:"🔮",nom:"Lo que voy a hacer (going to)",ayuda:"Usá <b>going to</b>: <i>I'm going to visit…</i>, <i>we're going to play…</i>.",
  need:[N_FUT],a:"Next month I'm going to visit my grandma. We're going to make a cake.",
  hints:[H("voy a","I'm going to"),H("vamos a","we're going to"),H("el mes que viene","next month")],
  react:R("That sounds great!","Oh, I'd like to do that too!","Lovely plans!"),
  preg:[{intro:"Let's talk about this point. ",q:"What are you going to do?"},{intro:"Now, this one. ",q:"What are you going to do next time?"},{intro:"OK, and this point. ",q:"Where and when are you going to do it?"},{intro:"And this one. ",q:"Who are you going to do it with?"}],
  seg:[{q:"Are you excited about it?",a:"Yes, I am. I'm very excited!",need:[[/yes|no|am|excited|happy|nervous|not/,"Contestá: <i>Yes, I am. I'm very excited!</i>"]],hints:[H("estoy emocionado/a","I'm excited"),H("nervioso/a","nervous"),H("muy","very")],react:R()},
       {q:"What else are you going to do?",a:"I'm going to take photos and I'm going to buy a present.",need:[N_FUT],hints:[H("voy a sacar fotos","I'm going to take photos"),H("voy a comprar","I'm going to buy"),H("un regalo","a present")],react:R()},
       {q:"Are you going to do it alone or with other people?",a:"I'm going to do it with my friends.",need:[[/with|alone|myself|friends|family/,"Decí con quién: <i>with my friends</i>, <i>alone</i>."]],hints:[H("con mis amigos","with my friends"),H("solo/a","alone"),H("con mi familia","with my family")],react:R()}]},
 gustos:{ico:"❤️",nom:"Lo que me gusta / no me gusta",ayuda:"Usá <b>like / love / enjoy + -ing</b> y <b>but</b>: <i>I like swimming, but I don't like running</i>.",
  need:[N_GUS],a:"I like playing with my friends. I love the music, but I don't like waiting in line.",
  hints:[H("me gusta","I like"),H("me encanta","I love"),H("no me gusta","I don't like")],
  react:R("That sounds fun!","Oh, I like that too!","Great!"),
  preg:[{intro:"Let's talk about this point. ",q:"What do you like about it?"},{intro:"Now, this one. ",q:"Do you like it? Tell me more."},{intro:"OK, this point. ",q:"What do you like best? And what don't you like?"},{intro:"Tell me about this one. ",q:"What is your favourite part?"}],
  seg:[{q:"Is there anything you don't like?",a:"Yes, there is. I don't like waiting a long time.",need:[[/don'?t like|not like|hate|dislike|boring|nothing|no\b/,"Decí algo que no te gusta: <i>I don't like…</i>."]],hints:[H("no me gusta","I don't like"),H("odio","I hate"),H("aburrido","boring")],react:R()},
       {q:"What do you enjoy doing most?",a:"I enjoy playing with my friends the most.",need:[N_GUS],hints:[H("disfruto","I enjoy"),H("más que nada","the most"),H("con mis amigos","with my friends")],react:R()}]},
 comparar:{ico:"⚖️",nom:"Comparar (más que / el mejor)",ayuda:"Usá <b>comparativos y superlativos</b>: <i>bigger than</i>, <i>more fun than</i>, <i>the best</i>, <i>the most interesting</i>.",
  need:[N_COM],a:"My dog is bigger than my cat, but my cat is faster. The best one is my dog.",
  hints:[H("más grande que","bigger than"),H("más divertido que","more fun than"),H("el mejor","the best")],
  react:R("That's interesting!","Oh, I see. Good comparison!","Very good!"),
  preg:[{intro:"Let's talk about this point. ",q:"Can you compare it with something else?"},{intro:"Now, this one. ",q:"Is it better or worse than other things? Tell me."},{intro:"OK, this point. ",q:"What is the best one you know?"},{intro:"And this one. ",q:"Is it different from other ones? How?"}],
  seg:[{q:"Which one do you like more?",a:"I like the dog more than the cat, but I like both.",need:[[/more|better|best|than|like/,"Elegí uno: <i>I like … more than …</i>."]],hints:[H("me gusta más","I like … more"),H("que","than"),H("pero","but")],react:R()},
       {q:"What is the biggest difference?",a:"The biggest difference is the size. The dog is much bigger.",need:[N_COM],hints:[H("la mayor diferencia","the biggest difference"),H("el tamaño","the size"),H("mucho más grande","much bigger")],react:R()}]},
 frecuencia:{ico:"🔁",nom:"Cada cuánto / cómo lo hago",ayuda:"Usá <b>adverbios</b>: <i>always, usually, often, sometimes, never</i>, <i>every day</i>, <i>twice a week</i>, <i>quickly</i>, <i>well</i>.",
  need:[N_FRE],a:"I do it three times a week. I usually do it after school, and I do it quickly.",
  hints:[H("tres veces por semana","three times a week"),H("siempre","always"),H("rápidamente","quickly")],
  react:R("I see.","That sounds like a good routine!","Interesting!"),
  preg:[{intro:"Let's talk about this point. ",q:"How often do you do it?"},{intro:"Now, this one. ",q:"How do you do it? Do you do it well?"},{intro:"OK, this point. ",q:"When do you usually do it?"},{intro:"And this one. ",q:"Do you do it every day? How often?"}],
  seg:[{q:"Are you good at it?",a:"Yes, I am. I do it quite well, but I'm not the best.",need:[[/good|well|bad|not|best|quite|better/,"Decí qué tan bien lo hacés: <i>I do it well</i>."]],hints:[H("lo hago bien","I do it well"),H("soy bueno/a en","I'm good at"),H("pero","but")],react:R()},
       {q:"Do you do it alone or with friends?",a:"I usually do it with my friends.",need:[[/alone|with|friends|family|myself|usually|sometimes/,"Decí con quién: <i>with my friends</i>."]],hints:[H("con mis amigos","with my friends"),H("solo/a","alone"),H("a veces","sometimes")],react:R()}]},
 otro:{ico:"⭐",nom:"Otra cosa (describir)",ayuda:"Contá lo que sepas: <i>It's…</i>, <i>I like it because…</i>.",
  need:[],a:"It's a special thing for me. I like it very much.",
  hints:[H("es algo","it's something"),H("especial para mí","special for me"),H("me gusta mucho","I like it very much")],
  react:R("That's interesting!","I see.","Very nice!"),
  preg:[{intro:"Let's talk about this point. ",q:"Can you tell me about it?"},{intro:"Now, this one. ",q:"What can you tell me about this?"}],
  seg:[]}
};
Object.keys(TIPOS).forEach(k=>{TIPOS[k].seg=TIPOS[k].seg.concat(GEN_SEG)});

// ---- La conversación: 6 temas × 10 preguntas. En cada tema hay preguntas de las funciones del grado:
//   f: "pasado" (3) · "futuro" (2) · "gustos" (2) · "comparar" (2) · "frecuencia" (1). Cada charla toma 4 de las 5 funciones por tema.
// Cada paso: q (pregunta), a (respuesta modelo), need (qué tiene que tener la respuesta), hints (cómo se dice), react (reacción del examinador), follow (repreguntas).
const CONV4=[
 // ======== Holidays
 {g:"holidays",f:"pasado",q:"Where did you go on your last holiday?",a:"I went to the beach with my family. We stayed in a hotel.",
  need:[N_PAS],hints:[H("fui a","I went to"),H("la playa","the beach"),H("nos quedamos en un hotel","we stayed in a hotel")],
  react:R("That sounds wonderful!","Lovely!","How nice!"),
  follow:[()=>({q:"Who did you go with?",a:"I went with my parents and my brother.",need:[[/with/,"Decí con quién: <i>I went with…</i>."]],hints:[H("fui con","I went with"),H("mis papás","my parents"),H("mi hermano","my brother")],react:R()}),
          ()=>({q:"How did you travel there?",a:"We travelled by car. It was a long trip.",need:[[/by (car|bus|plane|train|boat)|drove|flew|travell?ed|took/,"Decí cómo viajaron: <i>by car</i>, <i>by plane</i>, <i>we travelled…</i>"]],hints:[H("viajamos en auto","we travelled by car"),H("en avión","by plane"),H("un viaje largo","a long trip")],react:R()})]},
 {g:"holidays",f:"pasado",q:"What did you do on your last holiday?",a:"We swam in the sea and we played on the sand.",
  need:[N_PAS],hints:[H("nadamos","we swam"),H("en el mar","in the sea"),H("jugamos en la arena","we played on the sand")],
  react:R("That sounds like fun!","Lovely!","Oh, I like that!"),
  follow:[()=>({q:"What did you eat there?",a:"We ate fish and ice cream.",need:[N_PAS],hints:[H("comimos","we ate"),H("pescado","fish"),H("helado","ice cream")],react:R()})]},
 {g:"holidays",f:"pasado",q:"What was the weather like on your last holiday?",a:"It was sunny and hot. It rained one day.",
  need:[N_PAS,[/sun|hot|cold|rain|wind|cloud|warm|snow|storm|nice|bad|good/,"Decí cómo estaba el clima: <i>sunny</i>, <i>hot</i>, <i>rainy</i>…"]],hints:[H("estaba soleado","it was sunny"),H("hacía calor","it was hot"),H("llovió","it rained")],
  react:R("I see. Thank you.","That sounds nice!","Lovely!")},
 {g:"holidays",f:"futuro",q:"Where are you going to go on your next holiday?",a:"I'm going to go to the mountains.",
  need:[N_FUT],hints:[H("voy a ir a","I'm going to go to"),H("las montañas","the mountains"),H("el año que viene","next year")],
  react:R("That sounds great!","Oh, lovely!","I'd like to go there too!"),
  follow:[()=>({q:"Who are you going to go with?",a:"I'm going to go with my cousins.",need:[[/with|alone|myself|going to/,"Decí con quién: <i>with my cousins</i>."]],hints:[H("voy a ir con","I'm going to go with"),H("mis primos","my cousins"),H("solo/a","alone")],react:R()})]},
 {g:"holidays",f:"futuro",q:"What are you going to do on your next holiday?",a:"I'm going to swim and I'm going to visit my grandma.",
  need:[N_FUT],hints:[H("voy a nadar","I'm going to swim"),H("voy a visitar","I'm going to visit"),H("mi abuela","my grandma")],
  react:R("That sounds fun!","Lovely plans!","How nice!")},
 {g:"holidays",f:"gustos",q:"Do you like going on holiday? What do you like doing?",a:"Yes, I do. I like swimming in the sea.",
  need:[N_GUS],hints:[H("me gusta nadar","I like swimming"),H("jugar en la playa","playing on the beach"),H("conocer lugares nuevos","visiting new places")],
  react:R("That sounds fun!","Oh, I like that too!","Great!"),
  follow:[()=>({q:"Is there anything you don't like about holidays?",a:"I don't like travelling for a long time, but I love the beach.",need:[[/don'?t like|not like|hate|boring|nothing|no\b/,"Decí algo que no te gusta: <i>I don't like…</i>."]],hints:[H("no me gusta viajar mucho tiempo","I don't like travelling for a long time"),H("pero","but"),H("me encanta","I love")],react:R()})]},
 {g:"holidays",f:"gustos",q:"Do you like travelling by plane, by car or by bus?",a:"I like travelling by plane, but I don't like travelling by bus.",
  need:[N_GUS],hints:[H("me gusta viajar en avión","I like travelling by plane"),H("en auto","by car"),H("pero","but")],
  react:R("I see. Thank you.","That's interesting!","Me too!")},
 {g:"holidays",f:"comparar",q:"Which is better for a holiday, the beach or the mountains?",a:"The beach is better than the mountains, but the mountains are more beautiful.",
  need:[N_COM],hints:[H("mejor que","better than"),H("más lindo","more beautiful"),H("pero","but")],
  react:R("That's interesting!","Good answer!","I see!"),
  follow:[()=>({q:"Which is more expensive, a holiday by plane or by car?",a:"A holiday by plane is more expensive than a holiday by car.",need:[N_COM],hints:[H("más caro que","more expensive than"),H("en avión","by plane"),H("en auto","by car")],react:R()})]},
 {g:"holidays",f:"comparar",q:"What was the best holiday you ever had?",a:"The best holiday was in Bariloche. It was the most exciting.",
  need:[[/\b(was|were)\b|went|had/,"Contalo en pasado: <i>The best holiday was…</i>"],[/best|better|most|more|nicer|funnier|favou?rite/,"Usá el superlativo: <i>the best</i>, <i>the most exciting</i>."]],hints:[H("la mejor","the best"),H("la más divertida","the most fun"),H("fue en","it was in")],
  react:R("That sounds wonderful!","Lucky you!","How lovely!")},
 {g:"holidays",f:"frecuencia",q:"How often do you go on holiday?",a:"I go on holiday twice a year. We usually go in summer.",
  need:[N_FRE],hints:[H("dos veces por año","twice a year"),H("generalmente","usually"),H("en verano","in summer")],
  react:R("I see. That's nice!","OK, thank you.","Lovely!")},

 // ======== Shopping
 {g:"shopping",f:"pasado",q:"What did you buy the last time you went shopping?",a:"I bought a T-shirt and some shoes.",
  need:[N_PAS],hints:[H("compré","I bought"),H("una remera","a T-shirt"),H("zapatillas","shoes")],
  react:R("Nice choice!","That sounds great!","Lovely!"),
  follow:[()=>({q:"Where did you buy it?",a:"I bought it at the shopping centre.",need:[[/at|in|from|shop|centre|store|online/,"Decí dónde: <i>at the shopping centre</i>."]],hints:[H("lo compré en","I bought it at"),H("el shopping","the shopping centre"),H("por internet","online")],react:R()}),
          ()=>({q:"Was it expensive?",a:"No, it wasn't. It was cheap.",need:[[/was|wasn'?t|yes|no|expensive|cheap/,"Contestá: <i>It was cheap</i> / <i>It wasn't expensive</i>."]],hints:[H("era barato","it was cheap"),H("era caro","it was expensive"),H("no fue","it wasn't")],react:R()})]},
 {g:"shopping",f:"pasado",q:"Who did you go shopping with?",a:"I went shopping with my mum. We bought food for the week.",
  need:[N_PAS],hints:[H("fui de compras con","I went shopping with"),H("mi mamá","my mum"),H("compramos","we bought")],
  react:R("That sounds nice!","I see.","How nice!")},
 {g:"shopping",f:"pasado",q:"Did you buy anything yesterday?",a:"Yes, I did. I bought a snack at the kiosk.",
  need:[[/yes|no|did|didn'?t|bought|nothing/,"Contestá con <i>Yes, I did</i> / <i>No, I didn't</i> y contá qué compraste."]],hints:[H("sí, compré","yes, I bought"),H("no, no compré","no, I didn't"),H("una golosina","a snack")],
  react:R("I see. Thank you.","Nice!","Lovely!")},
 {g:"shopping",f:"futuro",q:"What are you going to buy with your pocket money?",a:"I'm going to buy a new game.",
  need:[N_FUT],hints:[H("voy a comprar","I'm going to buy"),H("un juego nuevo","a new game"),H("mi plata","my pocket money")],
  react:R("That sounds great!","Good idea!","Lovely!"),
  follow:[()=>({q:"How much is it going to cost?",a:"It's going to cost a lot of money, but I'm going to save.",need:[[/cost|expensive|cheap|dollars|pesos|money|\d/,"Decí cuánto sale: <i>It costs…</i>, <i>It's expensive</i>."]],hints:[H("va a costar","it's going to cost"),H("mucha plata","a lot of money"),H("voy a ahorrar","I'm going to save")],react:R()})]},
 {g:"shopping",f:"futuro",q:"Where are you going to go shopping next week?",a:"I'm going to go to the supermarket with my dad.",
  need:[N_FUT],hints:[H("voy a ir al supermercado","I'm going to go to the supermarket"),H("con mi papá","with my dad"),H("la semana que viene","next week")],
  react:R("I see. Thank you.","That sounds good!","Lovely!")},
 {g:"shopping",f:"gustos",q:"Do you like shopping? What do you like buying?",a:"Yes, I do. I like buying clothes and toys.",
  need:[N_GUS],hints:[H("me gusta comprar","I like buying"),H("ropa","clothes"),H("juguetes","toys")],
  react:R("That sounds fun!","Oh, I like that too!","Great!"),
  follow:[()=>({q:"Do you like shopping online?",a:"Yes, I do, but I like going to the shops more.",need:[N_GUS],hints:[H("me gusta comprar por internet","I like shopping online"),H("pero","but"),H("más","more")],react:R()})]},
 {g:"shopping",f:"gustos",q:"What is your favourite shop? What do you like about it?",a:"My favourite shop is the toy shop. I like looking at the games.",
  need:[N_GUS],hints:[H("mi tienda favorita","my favourite shop"),H("la juguetería","the toy shop"),H("me gusta mirar","I like looking at")],
  react:R("That sounds great!","I like that shop too!","Lovely!")},
 {g:"shopping",f:"comparar",q:"Is it better to shop online or in a shop?",a:"Shopping in a shop is better than shopping online, but online is faster.",
  need:[N_COM],hints:[H("mejor que","better than"),H("más rápido","faster"),H("por internet","online")],
  react:R("That's interesting!","Good answer!","I see!"),
  follow:[()=>({q:"Which is cheaper, a small shop or a supermarket?",a:"A supermarket is cheaper than a small shop.",need:[N_COM],hints:[H("más barato que","cheaper than"),H("un supermercado","a supermarket"),H("una tienda chica","a small shop")],react:R()})]},
 {g:"shopping",f:"comparar",q:"What is the most expensive thing you want to buy?",a:"The most expensive thing is a new bike. It's more expensive than a game.",
  need:[N_COM],hints:[H("lo más caro","the most expensive"),H("una bicicleta nueva","a new bike"),H("más caro que","more expensive than")],
  react:R("Oh, I see!","That's interesting!","Wow!")},
 {g:"shopping",f:"frecuencia",q:"How often do you go shopping with your family?",a:"We go shopping every Saturday. Sometimes I go with my friends.",
  need:[N_FRE],hints:[H("todos los sábados","every Saturday"),H("a veces","sometimes"),H("una vez por semana","once a week")],
  react:R("I see. That's nice!","That sounds fun!","Lovely!")},

 // ======== School and work
 {g:"school",f:"pasado",q:"What did you do at school on your last school day?",a:"I had maths and English. I played football at break.",
  need:[N_PAS],hints:[H("tuve","I had"),H("jugué al fútbol","I played football"),H("en el recreo","at break")],
  react:R("That sounds like a busy day!","I see. Thank you.","Lovely!"),
  follow:[()=>({q:"Who were you with at break?",a:"I was with my friends from my class.",need:[[/with|friends|classmates|alone/,"Decí con quién: <i>I was with…</i>."]],hints:[H("estuve con","I was with"),H("mis amigos","my friends"),H("de mi clase","from my class")],react:R()}),
          ()=>({q:"Did you do your homework?",a:"Yes, I did. I did it in the afternoon.",need:[[/yes|no|did|didn'?t|homework/,"Contestá: <i>Yes, I did</i> / <i>No, I didn't</i>."]],hints:[H("sí, la hice","yes, I did it"),H("no la hice","no, I didn't"),H("a la tarde","in the afternoon")],react:R()})]},
 {g:"school",f:"pasado",q:"What was the best thing about your last school day?",a:"The best thing was the art lesson. I painted a picture.",
  need:[N_PAS],hints:[H("lo mejor fue","the best thing was"),H("la clase de arte","the art lesson"),H("pinté","I painted")],
  react:R("That sounds fun!","Lovely!","That sounds interesting!")},
 {g:"school",f:"pasado",q:"What did your mum or dad do at work last week?",a:"My dad worked in his office. My mum visited a client.",
  need:[N_PAS],hints:[H("trabajó en","worked in"),H("su oficina","his office"),H("visitó","visited")],
  react:R("I see. Thank you.","That sounds interesting!","Very good!")},
 {g:"school",f:"futuro",q:"What are you going to do after school today?",a:"I'm going to do my homework and then I'm going to play.",
  need:[N_FUT],hints:[H("voy a hacer la tarea","I'm going to do my homework"),H("y después","and then"),H("voy a jugar","I'm going to play")],
  react:R("That sounds good!","A busy afternoon!","Lovely!")},
 {g:"school",f:"futuro",q:"What are you going to be when you grow up?",a:"I'm going to be a vet because I love animals.",
  need:[[/going to|want to be|would like to be|be a|be an/,"Usá <i>I'm going to be…</i> o <i>I want to be…</i>."]],hints:[H("voy a ser","I'm going to be"),H("veterinario/a","a vet"),H("cuando sea grande","when I grow up")],
  react:R("That's a wonderful idea!","A great job!","Very good!"),
  follow:[()=>({q:"Are you going to study English at university?",a:"Yes, I am. I'm going to study English and biology.",need:[[/yes|no|am|going to|not|study/,"Contestá: <i>Yes, I am</i> / <i>No, I'm not</i>."]],hints:[H("voy a estudiar","I'm going to study"),H("en la universidad","at university"),H("biología","biology")],react:R()})]},
 {g:"school",f:"gustos",q:"Do you like school? What do you like best?",a:"Yes, I do. I like studying English and playing football at break.",
  need:[N_GUS],hints:[H("me gusta estudiar","I like studying"),H("lo que más me gusta","what I like best"),H("el recreo","break")],
  react:R("That sounds great!","I'm glad!","Lovely!")},
 {g:"school",f:"gustos",q:"What lessons do you like and what lessons don't you like?",a:"I like art, but I don't like maths.",
  need:[N_GUS],hints:[H("me gusta","I like"),H("pero no me gusta","but I don't like"),H("matemática","maths")],
  react:R("I see. Thank you.","That's interesting!","Me too!")},
 {g:"school",f:"comparar",q:"Which lesson is more difficult, maths or English?",a:"Maths is more difficult than English, but I like it.",
  need:[N_COM],hints:[H("más difícil que","more difficult than"),H("más fácil","easier"),H("pero","but")],
  react:R("I see!","That's interesting!","Good answer!")},
 {g:"school",f:"comparar",q:"Who is the tallest student in your class?",a:"Lucas is the tallest in my class. He is taller than me.",
  need:[N_COM],hints:[H("el más alto","the tallest"),H("más alto que","taller than"),H("de mi clase","in my class")],
  react:R("Oh, I see!","That's funny!","Interesting!")},
 {g:"school",f:"frecuencia",q:"How often do you have English lessons at school?",a:"I have English three times a week. We usually have it in the morning.",
  need:[N_FRE],hints:[H("tres veces por semana","three times a week"),H("generalmente","usually"),H("a la mañana","in the morning")],
  react:R("That's good!","I see. Lovely!","That sounds nice!")},

 // ======== Hobbies and sports
 {g:"hobbies",f:"pasado",q:"When did you start playing your favourite sport or hobby?",a:"I started when I was six. My dad taught me.",
  need:[N_PAS],hints:[H("empecé","I started"),H("cuando tenía seis","when I was six"),H("me enseñó","taught me")],
  react:R("How nice!","That's interesting!","Lovely!"),
  follow:[()=>({q:"Did you like it at the beginning?",a:"Yes, I did. It was a bit difficult, but I liked it.",need:[[/yes|no|did|didn'?t|was|liked/,"Contestá: <i>Yes, I did</i> / <i>No, I didn't</i>."]],hints:[H("al principio","at the beginning"),H("era difícil","it was difficult"),H("pero me gustó","but I liked it")],react:R()})]},
 {g:"hobbies",f:"pasado",q:"What was the last match or game you played? Did you win?",a:"I played a match last Saturday and we won.",
  need:[N_PAS],hints:[H("jugué un partido","I played a match"),H("el sábado pasado","last Saturday"),H("ganamos / perdimos","we won / we lost")],
  react:R("Good game!","I see. Thank you.","Oh, I see!"),
  follow:[()=>({q:"How did you feel?",a:"I felt very happy.",need:[[/felt|was|were/,"Contalo en pasado: <i>I felt…</i>, <i>I was…</i>."]],hints:[H("me sentí","I felt"),H("feliz","happy"),H("cansado/a","tired")],react:R()})]},
 {g:"hobbies",f:"pasado",q:"What did you play last weekend?",a:"I played video games with my brother.",
  need:[N_PAS],hints:[H("jugué","I played"),H("videojuegos","video games"),H("con mi hermano","with my brother")],
  react:R("That sounds fun!","I see!","Lovely!")},
 {g:"hobbies",f:"futuro",q:"What are you going to practise this week?",a:"I'm going to practise the guitar and I'm going to go to football training.",
  need:[N_FUT],hints:[H("voy a practicar","I'm going to practise"),H("la guitarra","the guitar"),H("entrenamiento","training")],
  react:R("That sounds good!","Very good!","Lovely!")},
 {g:"hobbies",f:"futuro",q:"What new hobby or sport are you going to try?",a:"I'm going to try tennis next year.",
  need:[N_FUT],hints:[H("voy a probar","I'm going to try"),H("tenis","tennis"),H("el año que viene","next year")],
  react:R("That's a great idea!","Good luck!","Lovely!")},
 {g:"hobbies",f:"gustos",q:"What do you like doing in your free time?",a:"I like playing football and drawing.",
  need:[N_GUS],hints:[H("me gusta jugar","I like playing"),H("dibujar","drawing"),H("en mi tiempo libre","in my free time")],
  react:R("That sounds fun!","Oh, I like that too!","Great!"),
  follow:[()=>({q:"Do you like playing with other people or alone?",a:"I like playing with other people, but sometimes I like playing alone.",need:[N_GUS],hints:[H("con otras personas","with other people"),H("solo/a","alone"),H("a veces","sometimes")],react:R()})]},
 {g:"hobbies",f:"gustos",q:"Do you like watching sport or playing sport?",a:"I like playing sport more than watching it.",
  need:[N_GUS],hints:[H("me gusta jugar","I like playing"),H("mirar deportes","watching sport"),H("más que","more than")],
  react:R("I see. Thank you.","Me too!","That's interesting!")},
 {g:"hobbies",f:"comparar",q:"Which sport is more exciting, football or tennis?",a:"Football is more exciting than tennis, but tennis is easier.",
  need:[N_COM],hints:[H("más emocionante que","more exciting than"),H("más fácil","easier"),H("pero","but")],
  react:R("That's interesting!","Good answer!","I see!"),
  follow:[()=>({q:"Which is the most dangerous sport?",a:"I think rugby is the most dangerous sport.",need:[N_COM],hints:[H("el más peligroso","the most dangerous"),H("creo que","I think"),H("rugby","rugby")],react:R()})]},
 {g:"hobbies",f:"comparar",q:"Who is the best player in your team?",a:"Santi is the best player. He runs faster than me.",
  need:[N_COM],hints:[H("el mejor jugador","the best player"),H("corre más rápido que yo","he runs faster than me"),H("mi equipo","my team")],
  react:R("I see!","That's nice!","Oh, that sounds great!")},
 {g:"hobbies",f:"frecuencia",q:"How often do you practise your sport or hobby?",a:"I practise three times a week. I always play on Saturday.",
  need:[N_FRE],hints:[H("tres veces por semana","three times a week"),H("siempre","always"),H("los sábados","on Saturdays")],
  react:R("Very good!","That sounds great!","I see. Thank you.")},

 // ======== Food
 {g:"food",f:"pasado",q:"What did you have for breakfast today?",a:"I had milk and toast.",
  need:[N_PAS],hints:[H("tomé / comí","I had / I ate"),H("leche","milk"),H("tostadas","toast")],
  react:R("That sounds good!","Yummy!","I see."),
  follow:[()=>({q:"Did you like it?",a:"Yes, I did. It was delicious.",need:[[/yes|no|did|didn'?t|was|delicious|tasty/,"Contestá: <i>Yes, I did</i> / <i>No, I didn't</i>."]],hints:[H("estaba riquísimo","it was delicious"),H("no me gustó","I didn't like it"),H("sabroso","tasty")],react:R()})]},
 {g:"food",f:"pasado",q:"What did you eat last night for dinner?",a:"I ate pizza and I drank orange juice.",
  need:[N_PAS],hints:[H("comí","I ate"),H("tomé","I drank"),H("jugo de naranja","orange juice")],
  react:R("That sounds delicious!","Yummy!","Lovely!")},
 {g:"food",f:"pasado",q:"What did you cook, or help to cook, last time?",a:"I helped my mum. We made a cake.",
  need:[N_PAS],hints:[H("ayudé a","I helped"),H("hicimos una torta","we made a cake"),H("mezclé","I mixed")],
  react:R("That sounds fun!","How nice!","Lovely!")},
 {g:"food",f:"futuro",q:"What are you going to have for dinner tonight?",a:"I'm going to have pasta.",
  need:[N_FUT],hints:[H("voy a comer","I'm going to have"),H("pastas","pasta"),H("esta noche","tonight")],
  react:R("That sounds good!","Yummy!","Lovely!")},
 {g:"food",f:"futuro",q:"What are you going to eat on your next birthday?",a:"We're going to eat a big cake and pizza.",
  need:[N_FUT],hints:[H("vamos a comer","we're going to eat"),H("una torta grande","a big cake"),H("en mi cumpleaños","on my birthday")],
  react:R("That sounds delicious!","Yummy!","Lovely!")},
 {g:"food",f:"gustos",q:"What food do you like? And what food don't you like?",a:"I like pizza and fruit, but I don't like fish.",
  need:[N_GUS],hints:[H("me gusta","I like"),H("no me gusta","I don't like"),H("pescado","fish")],
  react:R("I see. Thank you.","Me too!","That's interesting!")},
 {g:"food",f:"gustos",q:"Do you like cooking? What do you like to cook?",a:"Yes, I do. I like cooking pasta.",
  need:[N_GUS],hints:[H("me gusta cocinar","I like cooking"),H("pastas","pasta"),H("con mi mamá","with my mum")],
  react:R("That sounds fun!","Yummy!","Great!"),
  follow:[()=>({q:"Who do you cook with?",a:"I cook with my mum.",need:[[/with|cook|alone|myself/,"Decí con quién: <i>I cook with…</i>."]],hints:[H("cocino con","I cook with"),H("mi mamá","my mum"),H("solo/a","alone")],react:R()})]},
 {g:"food",f:"comparar",q:"Which is healthier, an apple or a biscuit?",a:"An apple is healthier than a biscuit, but a biscuit is tastier.",
  need:[N_COM],hints:[H("más saludable que","healthier than"),H("más rico","tastier"),H("manzana","apple")],
  react:R("I see!","Good answer!","That's interesting!")},
 {g:"food",f:"comparar",q:"What is the best food in the world, in your opinion?",a:"I think the best food is pizza. It's tastier than other food.",
  need:[N_COM],hints:[H("la mejor comida","the best food"),H("más rica que","tastier than"),H("en mi opinión","in my opinion")],
  react:R("Me too!","Yummy!","That's interesting!")},
 {g:"food",f:"frecuencia",q:"How often do you eat fruit and vegetables?",a:"I eat fruit every day, but I sometimes eat vegetables.",
  need:[N_FRE],hints:[H("todos los días","every day"),H("a veces","sometimes"),H("verduras","vegetables")],
  react:R("OK, thank you.","Good!","I see!")},

 // ======== Weekend and seasonal activities
 {g:"weekend",f:"pasado",q:"What did you do last weekend?",a:"I played football on Saturday and I visited my grandma on Sunday.",
  need:[N_PAS],hints:[H("jugué al fútbol","I played football"),H("visité a mi abuela","I visited my grandma"),H("el sábado","on Saturday")],
  react:R("That sounds lovely!","What a nice weekend!","I see!"),
  follow:[()=>({q:"Did you have a good time?",a:"Yes, I did. It was great.",need:[[/yes|no|did|didn'?t|was|great|good/,"Contestá: <i>Yes, I did</i> / <i>No, I didn't</i>."]],hints:[H("la pasé bien","I had a good time"),H("fue genial","it was great"),H("no mucho","not really")],react:R()})]},
 {g:"weekend",f:"pasado",q:"What did you do last summer?",a:"I went to the beach and I swam every day.",
  need:[N_PAS],hints:[H("el verano pasado","last summer"),H("fui a la playa","I went to the beach"),H("nadé","I swam")],
  react:R("That sounds wonderful!","Lovely!","How nice!")},
 {g:"weekend",f:"pasado",q:"Where did you go last Saturday?",a:"I went to my friend's house. We played games.",
  need:[N_PAS],hints:[H("fui a","I went to"),H("la casa de mi amigo","my friend's house"),H("jugamos","we played")],
  react:R("That sounds fun!","Lovely!","I see!")},
 {g:"weekend",f:"futuro",q:"What are you going to do this weekend?",a:"I'm going to watch a film and I'm going to play with my friends.",
  need:[N_FUT],hints:[H("voy a mirar una película","I'm going to watch a film"),H("jugar con mis amigos","play with my friends"),H("este fin de semana","this weekend")],
  react:R("That sounds great!","Have a nice weekend!","Lovely plans!"),
  follow:[()=>({q:"Are you going to go out or stay at home?",a:"I'm going to go out with my friends.",need:[N_FUT],hints:[H("voy a salir","I'm going to go out"),H("quedarme en casa","stay at home"),H("con mis amigos","with my friends")],react:R()})]},
 {g:"weekend",f:"futuro",q:"What are you going to do next summer?",a:"I'm going to go to the beach with my family.",
  need:[N_FUT],hints:[H("el próximo verano","next summer"),H("voy a ir a la playa","I'm going to go to the beach"),H("con mi familia","with my family")],
  react:R("That sounds wonderful!","Lucky you!","Lovely!")},
 {g:"weekend",f:"gustos",q:"What do you like doing at the weekend?",a:"I like sleeping late and playing games.",
  need:[N_GUS],hints:[H("me gusta dormir hasta tarde","I like sleeping late"),H("jugar","playing games"),H("mirar películas","watching films")],
  react:R("That sounds relaxing!","Me too!","Great!")},
 {g:"weekend",f:"gustos",q:"What is your favourite season? What do you like doing then?",a:"My favourite season is summer. I like swimming in the pool.",
  need:[N_GUS],hints:[H("mi estación favorita","my favourite season"),H("verano","summer"),H("me gusta nadar","I like swimming")],
  react:R("That sounds fun!","Good choice!","Lovely!")},
 {g:"weekend",f:"comparar",q:"Which is better, summer or winter?",a:"Summer is better than winter. It's hotter and the days are longer.",
  need:[N_COM],hints:[H("mejor que","better than"),H("más caluroso","hotter"),H("más largos","longer")],
  react:R("That's interesting!","I see!","Good answer!")},
 {g:"weekend",f:"comparar",q:"Which is the best day of the weekend, Saturday or Sunday?",a:"Saturday is better than Sunday, but Sunday is more relaxing.",
  need:[N_COM],hints:[H("el mejor día","the best day"),H("más relajante","more relaxing"),H("pero","but")],
  react:R("I see!","That's interesting!","Good answer!")},
 {g:"weekend",f:"frecuencia",q:"How often do you visit your family or friends at the weekend?",a:"I visit my grandma every Sunday. Sometimes I go to my cousin's house.",
  need:[N_FRE],hints:[H("todos los domingos","every Sunday"),H("a veces","sometimes"),H("una vez por mes","once a month")],
  react:R("That's nice!","Lovely!","I see!")}
];

// ======== La parte del TEMA PREPARADO ========
// Ideas de temas: cada una trae sus 4 puntos y de qué función es cada punto (como en la hoja oficial de ejemplo: pasado, pasado, gustos y planes).
// Ojo con el consejo de Trinity: el tema NO puede ser uno de los 6 temas de la conversación (Holidays, Shopping, Food…): tiene que ser algo más personal y concreto.
const IDEAS4=[
 {t:"My best birthday",p:[["Who came and what we did","pasado"],["What I liked best on the day","gustos"],["Is it better than my other birthdays?","comparar"],["Plans for my next birthday","futuro"]]},
 {t:"My trip to the mountains",p:[["Where we went and what we did","pasado"],["What I like best about the mountains","gustos"],["Mountains or beach: which is better?","comparar"],["Where I'm going to go next","futuro"]]},
 {t:"My first football match",p:[["When we went and who came","pasado"],["How often I play football now","frecuencia"],["Football or other sports: which is more fun?","comparar"],["My plans for the next match","futuro"]]},
 {t:"My dog",p:[["How we got him","pasado"],["What he likes to eat and do","gustos"],["How often we walk and play","frecuencia"],["My dog and my cat: who is faster?","comparar"]]},
 {t:"A school trip",p:[["Where we went and what we saw","pasado"],["What I liked best","gustos"],["How it was different from a normal day","comparar"],["Where I'm going to go next year","futuro"]]},
 {t:"Learning to play the guitar",p:[["How I started","pasado"],["How often I practise","frecuencia"],["What I like playing","gustos"],["The song I'm going to learn next","futuro"]]},
 {t:"Making pizza at home",p:[["The first time we made it","pasado"],["What I like on my pizza","gustos"],["Pizza or pasta: which is tastier?","comparar"],["The pizza I'm going to make","futuro"]]},
 {t:"A film I really like",p:[["When and where I watched it","pasado"],["My favourite character","gustos"],["The film or the book: which is better?","comparar"],["The next film I'm going to watch","futuro"]]},
 {t:"My best friend",p:[["How we met","pasado"],["What we like doing together","gustos"],["How often we see each other","frecuencia"],["What we're going to do this summer","futuro"]]},
 {t:"A day at the amusement park",p:[["What we did and ate","pasado"],["The ride I liked best","gustos"],["The biggest and scariest ride","comparar"],["When I'm going to go again","futuro"]]},
 {t:"My drawing book",p:[["When I started drawing","pasado"],["What I like drawing","gustos"],["How often I draw and how well","frecuencia"],["What I'm going to draw next","futuro"]]},
 {t:"Christmas with my family",p:[["What we did last Christmas","pasado"],["What I like best","gustos"],["Christmas or my birthday: which is better?","comparar"],["What we're going to do this year","futuro"]]}
];
// la hoja del tema se guarda en el equipo: {t:"título", p:[["punto","tipo"] ×4]}
function temaLeer(){try{const o=JSON.parse(localStorage.getItem(TEMA_KEY)||"null");return o&&typeof o==="object"?o:null}catch(e){return null}}
function temaGuardar(o){try{localStorage.setItem(TEMA_KEY,JSON.stringify(o))}catch(e){}}
const temaCompleto=f=>!!(f&&String(f.t||"").trim().length>=3&&Array.isArray(f.p)&&f.p.length===4&&f.p.every(x=>x&&String(x[0]||"").trim().length>=3));
// la hoja guardada; si todavía no está completa, un tema de ejemplo (así la práctica y el examen andan igual)
function temaOEjemplo(){
  const f=temaLeer();
  if(temaCompleto(f))return {t:String(f.t).trim(),p:f.p.map(x=>({texto:String(x[0]).trim(),tipo:TIPOS[x[1]]?x[1]:"otro"})),ejemplo:false};
  const i=pick(IDEAS4);return {t:i.t,p:i.p.map(x=>({texto:x[0],tipo:x[1]})),ejemplo:true};
}
const TEMAS_PROHIBIDOS=/^(holidays?|shopping|school( and work)?|work|hobbies( and sports)?|sports?|food|weekend( and seasonal activities)?|seasonal activities|seasons?)$/i;

// ---- Los pasos del examinador en el tema (todo GENERAL y grabado: lo del tema se ve en pantalla en «📌 …»)
const SALUDOS4=["Hello! Come in and sit down, please. How are you today?","Good morning! Please, take a seat. How are you today?","Hi there! Nice to see you. How are you today?","Hello! Welcome. Sit down, please. How are you feeling today?","Good afternoon! Please, sit down. How are you today?","Hello! Please, come in. How are you today?"];
// (el saludo y la despedida no se evalúan en el examen real: cualquier respuesta corta sirve y el examinador contesta algo que va con lo que se dijo)
const SALUDO4={g:"saludo",rotulo:"Saludo",q:SALUDOS4[0],a:"I'm fine, thank you. And you?",corta:true,
  need:[],hints:[H("estoy bien","I'm fine"),H("gracias","thank you"),H("¿y vos?","and you?")],
  react:t=>/and you|how are you/.test(t)?"I'm very well, thank you for asking!":/not bad/.test(t)?"Good! I'm very well too.":/\b(tired|sad|bad|sick|ill|hungry|nervous|worried|so so|not (good|well|fine|ok|okay))\b/.test(t)?"Oh, I see. Don't worry, we're going to have a nice chat.":"Good! I'm very well too."};
const FORMA4=[
 {g:"tema",rotulo:"Tu tema",q:"We're going to start with your topic. Can I have your topic form, please?",a:"Here you are.",corta:true,
  need:[[/here|yes|sure|ok|okay|thank|of course|there/,"Decí <i>Here you are.</i> al darle la hoja."]],hints:[H("tomá / acá tenés","here you are"),H("sí, claro","yes, sure"),H("la hoja del tema","my topic form")],react:R("Thank you.","Thank you very much.","Thanks!")},
 {g:"tema",rotulo:"Tu tema",q:"OK, let's start with your topic. Can I see your topic form, please?",a:"Yes, of course. Here you are.",corta:true,
  need:[[/here|yes|sure|ok|okay|thank|of course|there/,"Decí <i>Here you are.</i> al darle la hoja."]],hints:[H("tomá / acá tenés","here you are"),H("sí, claro","yes, of course"),H("la hoja del tema","my topic form")],react:R("Thank you.","Thank you very much.","Thanks!")}
];
const TITULO4=[
 {g:"tema",rotulo:"Tu tema",q:"So, what are we going to talk about?",a:"We're going to talk about my best birthday.",corta:true,need:[],hints:[H("vamos a hablar de","we're going to talk about"),H("mi tema","my topic"),H("el título","the title")],react:R("That sounds interesting!","Oh, nice! I'd like to hear about that.","Great! Let's talk about it.")},
 {g:"tema",rotulo:"Tu tema",q:"Thank you. What is your topic?",a:"My topic is my best birthday.",corta:true,need:[],hints:[H("mi tema es","my topic is"),H("sobre","about"),H("el título","the title")],react:R("That sounds interesting!","Oh, nice! I'd like to hear about that.","Great! Let's talk about it.")},
 {g:"tema",rotulo:"Tu tema",q:"Thank you. So, we're going to talk about…? Tell me the title of your topic.",a:"My best birthday.",corta:true,need:[],hints:[H("el título es","the title is"),H("mi tema","my topic"),H("sobre","about")],react:R("That sounds interesting!","Oh, nice! I'd like to hear about that.","Great! Let's talk about it.")}
];
// después del 2.º punto: quien rinde le hace una pregunta al examinador (en el Grade 4 es obligatorio en el tema)
const PREG4_Q=[["Do you want to ask me a question about your topic?","Yes, I do."],["Now, do you have a question for me about your topic?","Yes, I do."],["Would you like to ask me something about your topic?","Yes, I would."]];
// El examinador contesta la pregunta de quien rinde con una frase corta que NO contradice lo que se preguntó. El tema es libre, así que no se mira
// DE QUÉ trata la pregunta sino CÓMO empieza: «Did you…?» → «Yes, I did.»; «Where…?», «How often…?» → un dato general que sirve para cualquier tema.
const _SUJ={you:"I",i:"you",he:"he",she:"she",it:"it",they:"they",we:"we",there:"there",this:"it",that:"it"};
const _ELLA=/^(mum|mom|mother|sister|grandma|grandmother|aunt|wife|daughter)$/,_EL=/^(dad|father|brother|grandpa|grandfather|uncle|husband|son)$/,_ADJ=/^(best|new|old|little|big|small|favou?rite|first|last|next|other|good|great)$/;
function reaccionPregunta(t){
  const x=String(t||"").toLowerCase().replace(/[’`]/g,"'").replace(/\b(what|where|who|how|when|which)'?s\b/g,"$1 is").replace(/[^a-z' ]+/g," ").replace(/\s+/g," ").trim();
  // la pregunta es la última que aparece (puede venir después de un «yes, I do»): se busca dónde empieza
  const ultimo=re=>{let m,u=-1;while((m=re.exec(x)))u=m.index;return u};
  const iw=ultimo(/\b(what|where|when|who|whose|why|how|which)\b/g),ia=ultimo(/\b(do|does|did|is|are|am|was|were|can|could|will|would|have|has|should) (you|he|she|it|they|we|there|this|that|i|your|the|my|a|an)\b/g);
  const u=(iw>=0&&(ia<0||ia<iw||x.slice(iw,ia).split(" ").length<=4))?iw:ia;
  const q=u>=0?x.slice(u):x,p=q.split(" "),w=p[0],w2=p[1]||"",tiene=r=>r.test(q);
  // —— sí / no: empiezan con un auxiliar
  if(/^(do|does|did|is|are|am|was|were|can|could|will|would|have|has|should)$/.test(w)){
    if(/ or /.test(" "+q+" "))return tiene(/like|love|prefer|enjoy|favou?rite/)?pick(["I like both!","Both, I think!"]):"The first one, I think.";
    if(w==="have"&&w2==="you")return pick(["No, I haven't, but I'd like to!","Yes, I have. Once, a long time ago."]);
    let suj=_SUJ[w2];
    if(!suj&&/^(your|the|my)$/.test(w2)){const n=p[2]||"";suj=_ADJ.test(n)?"":_ELLA.test(n)?"she":_EL.test(n)?"he":/[^s]s$/.test(n)?"they":"it"}
    if(!suj)return "Yes, I think so.";                                  // «Does your best friend…?»: no se sabe quién es
    if(w==="do"&&suj==="I"&&tiene(/\b(like|love|enjoy)\b/))return pick(["Yes, I do. I like it very much.","Yes, I do. A lot!"]);
    let v=w;if(w==="are"&&suj==="I")v="am";else if(w==="were"&&suj==="I")v="was";else if(w==="am")v="are";
    return "Yes, "+suj+" "+v+".";
  }
  // —— con palabra de pregunta
  if(w==="how"){
    if(w2==="often")return pick(["About twice a week.","Quite often, I think."]);
    if(w2==="old")return "I'm thirty-five years old.";
    if(w2==="many")return "Three or four, I think.";
    if(w2==="much")return tiene(/\b(cost|price|pay|spend)\b/)?"It's not very expensive.":"A lot, I think.";
    if(w2==="long")return "About two hours.";
    if(w2==="well")return "Quite well, I think.";
    if(w2==="are"&&p[2]==="you")return "I'm very well, thank you.";
    if(w2==="was"||w2==="were")return "It was great, thank you!";
    if(w2==="is")return "It's great, thank you!";
    if(tiene(/\b(go|get|travel|come|arrive)\b/))return tiene(/\bdid\b/)?"By car, with my family.":"By bus, usually.";
    return "It's easy and fun!";
  }
  if(w==="what"){
    if(tiene(/\bname\b/))return "My name is Alex.";
    if(tiene(/\b(old|age)\b/))return "I'm thirty-five years old.";
    if(tiene(/\btime\b/))return "At about seven o'clock.";
    if(tiene(/\bgoing to\b/))return "I'm going to visit my family.";
    if(tiene(/\bdid you\b/))return tiene(/\b(eat|have|drink)\b/)?"I had pasta. It was delicious.":tiene(/\bplay/)?"I played tennis with a friend.":tiene(/\b(watch|see)\b/)?"I watched an adventure film.":tiene(/\b(buy|get)\b/)?"I bought a book.":tiene(/\b(cook|make)\b/)?"I made a cake with my mum.":"I stayed at home and relaxed.";
    if(tiene(/\blike (doing|to do)\b/))return "I like reading and walking.";
    if(tiene(/\bdo you (usually |often )?do\b/))return "I read, I play sport and I see my friends.";
    if(tiene(/\bcolou?r\b/))return "My favourite colour is blue.";
    if(tiene(/\b(food|eat|dish|meal|breakfast|lunch|dinner|snack|fruit|pizza|pasta|drink)\b/))return "I love pasta!";
    if(tiene(/\b(music|sing|singer|song|band|guitar|instrument)\b/))return "I like pop music.";
    if(tiene(/\b(sport|football|tennis|team|game|match|play|hobby|hobbies)\b/))return "I like football and tennis.";
    if(tiene(/\b(subject|lesson|school|class|teacher)\b/))return "I like English and music.";
    if(tiene(/\b(animal|pet|dog|cat)\b/))return "I like dogs.";
    if(tiene(/\b(film|movie|cartoon|series|programme|show|book)\b/))return "I like adventure films.";
    if(tiene(/\b(season|summer|winter|spring|autumn|weather)\b/))return "I like summer.";
    if(tiene(/\b(day|weekend|saturday|sunday)\b/))return "I like Saturday.";
    if(tiene(/\b(place|country|city|town|holiday|travel|trip)\b/))return "I like the mountains.";
    if(tiene(/\bbirthday\b/))return "My birthday is in July.";
    return "That's a good question! I like lots of things.";
  }
  if(w==="where"){
    if(tiene(/\bfrom\b/))return "I'm from a small town near the sea.";
    if(tiene(/\blive\b/))return "I live in a small town near the sea.";
    if(tiene(/\b(going to|will)\b/))return "I'm going to go to the mountains.";
    if(tiene(/\b(did|was|were)\b/))return tiene(/\b(go|travel|visit)\b/)?"I went to the mountains.":"At home, with my family.";
    return "In a nice place near my house.";
  }
  if(w==="when"){
    if(tiene(/\bbirthday\b/))return "My birthday is in July.";
    if(tiene(/\b(start|begin|began|first|learn)\b/))return "About two years ago.";
    if(tiene(/\b(going to|will)\b/))return "Next month, I think.";
    if(tiene(/\b(did|was|were)\b/))return "Last year, I think.";
    return "At the weekend, usually.";
  }
  if(w==="who"||w==="whose")return tiene(/\b(favou?rite|best)\b/)?"I have a few. It's hard to choose!":tiene(/\b(with|go|went|play|played|live|come|came)\b/)?"With my family and my friends.":"A friend of mine.";
  if(w==="why")return pick(["Because it's fun!","Because I like it a lot."]);
  if(w==="which")return "That's a difficult choice. I like them all!";
  return "That's a very good question. Thank you!";   // lo que no se reconoce
}
// preguntas de ejemplo: sirven para armar la lista de audios (cada respuesta posible del examinador tiene que tener el suyo) y para las pruebas
const PREGUNTAS_MUESTRA=["Do you like football?","Do you like dogs or cats?","Do you play the guitar?","Does your mum like football?","Do they play football?","Did you go on holiday last summer?","Did he win?","Are you going to travel this year?","Are you tall?","Are they friends?","Is it big?","Is your dog big?","Is there a park?","Was it fun?","Were you there?","Can you swim?","Can I ask you something?","Will you come?","Would you like to play?","Have you ever been to the beach?","Has it got a pool?","What is your name?","How old are you?","What is your favourite colour?","What is your favourite sport?","What do you like doing?","What did you do last weekend?","What did you eat yesterday?","What did you play?","What did you watch?","What did you buy?","What did you cook?","What are you going to do?","What time do you get up?","What do you do at the weekend?","What music do you like?","What food do you like?","What subject do you like?","What animal do you like?","What film do you like?","What season do you like?","What day do you like?","What place do you like?","What is your birthday?","What is that?","Where do you live?","Where are you from?","Where did you go?","Where did you celebrate your birthday?","Where are you going to go?","Where do you play?","When did you start?","When is your birthday?","When are you going to go?","When do you play?","When was it?","Who is your favourite player?","Who did you go with?","Who is that?","Why do you like it?","Which team do you like?","How often do you play?","How many friends do you have?","How much does it cost?","How much do you like it?","How long did it take?","How well do you play?","How are you?","How was your holiday?","How is your dog?","How did you go?","How do you go to school?","How do you play?","Pipa?"];
const PREG4=PREG4_Q.map(([q,si])=>({g:"tema",rotulo:"Tu tema",q,a:si+" Do you like football?",
  need:[[PREGUNTA,"Hacele una pregunta al examinador sobre tu tema: <i>Do you like…?</i>, <i>When…?</i>, <i>What…?</i>"]],
  hints:[H("¿Te gusta…?","Do you like…?"),H("¿Cuándo…?","When…?"),H("¿Qué…?","What…?")],react:reaccionPregunta}));
// un punto de la hoja → un paso: pregunta general según la función del punto (la elegida no se repite hace poco) y repreguntas generales
function pasoPunto(pt,V,n){
  const T=TIPOS[pt.tipo]||TIPOS.otro;
  const v=elegirNuevo(T.preg,claveP,V,n);V[claveP(v)]=n;
  return {g:"tema",tipo:pt.tipo,rotulo:"Tu tema",intro:v.intro,q:v.q,contexto:"📌 "+pt.texto,a:T.a,need:T.need,hints:T.hints,react:T.react,follow:T.seg.map(s=>()=>s)};
}
// ---- La conversación: el examinador anuncia el tema («Let's talk about food.») y hace 4 preguntas de funciones distintas
const CLOSE_Q4=["Thank you. That's the end of our conversation. Goodbye!","Thank you very much. That's all. Goodbye!","OK, that's the end of the exam. Thank you. Goodbye!","Thank you, that's all. Goodbye!","OK, that's all. Thank you very much. Goodbye!"];
const CLOSE4={g:"cierre",rotulo:"Fin",q:CLOSE_Q4[0],a:"Goodbye, have a nice day!",corta:true,need:[[/bye|thank|see you|nice day|good day|cheers/,"Despedite: <i>Goodbye!</i>"]],react:R("Have a nice day!","See you soon!","Goodbye!"),last:true};
function pasoAbre(area,pos,hayTema){   // paso «solo»: el examinador habla y no se espera respuesta
  const d=AREAS4[area].dicho;
  return {g:"conv",solo:true,rotulo:AREAS4[area].ico+" "+AREAS4[area].es,
    q:pos===0?(hayTema?"Thank you. And now we're going to talk about something different. Let's talk about "+d+".":"Let's talk about "+d+"."):"Thank you. Now let's talk about "+d+"."};
}
// cómo se practica (pestaña Speaking): examen completo · sólo el tema · sólo la conversación (dos temas al azar o uno elegido). El examen (pestaña Examen) es siempre completo.
function modoLeer(){const m=$("g4modo"),a=$("g4area");return {modo:m?m.value:"completo",area:a?a.value:"azar"}}
let _g4Modo="completo";   // lo que se practicó en la última charla (la corrección lo usa: sin tema no se espera una pregunta)
function pideDePregunta(){return _g4Modo!=="conv"}
function areasAlAzar(V,cuantas){   // el primero es el que hace más que no sale; el segundo se sortea entre los 3 siguientes (así los pares cambian y no quedan «parejas fijas»)
  const orden=AREAS_KEYS.map(k=>({k,u:V["g:"+k]||0,r:Math.random()})).sort((a,b)=>a.u-b.u||a.r-b.r).map(x=>x.k);
  return cuantas<2?[orden[0]]:shuffleA([orden[0],pick(orden.slice(1,4))]);
}
// Si lo que se contó es triste (se enfermó, se rompió, lloró…) el examinador no festeja con un «That sounds wonderful!»: lo acompaña y sigue.
const TRISTE=/\b(sad|cried|cry|crying|died|dead|sick|ill|hurt|broke|broken|accident|angry|scared|afraid|upset|worried|terrible|awful)\b/;
const TRIST=["Oh, I'm sorry to hear that.","Oh dear. I see."];
function conCompasion(s){
  if(!s||s._comp||s.solo||s.react===reaccionPregunta||s.g==="saludo"||s.g==="cierre")return s;   // (la pregunta de Raphina y el saludo ya tienen su propia respuesta)
  s._comp=true;
  if(typeof s.react==="function"){const r=s.react;s.react=t=>TRISTE.test(String(t||"").toLowerCase())?_reac(TRIST):r(t)}
  if(Array.isArray(s.follow))s.follow=s.follow.map(f=>(...a)=>conCompasion(f(...a)));
  return s;
}
function armarPasos(vista){
  const V=vistasLeer(),n=(V._n||0)+1;V._n=n;
  const usar=(s,c)=>{V[(c||claveP)(s)]=n;return s};
  const m=vista==="practice"?modoLeer():{modo:"completo",area:"azar"};
  _g4Modo=m.modo;
  const hacerTema=m.modo!=="conv",hacerConv=m.modo!=="tema",pasos=[];
  const h=new Date().getHours();
  pasos.push(Object.assign({},SALUDO4,{q:pick(SALUDOS4.filter(s=>!(/^Good morning/.test(s)&&h>=12)&&!(/^Good afternoon/.test(s)&&(h<12||h>=20))))}));
  if(hacerTema){
    const f=temaOEjemplo();
    pasos.push(Object.assign({},pick(FORMA4)));
    pasos.push(Object.assign({},pick(TITULO4),{contexto:"📌 "+(f.ejemplo?"(tema de ejemplo: completá «Mi tema» para usar el tuyo) ":"")+"«"+f.t+"»"}));
    shuffleA(f.p).forEach((pt,i)=>{pasos.push(pasoPunto(pt,V,n));if(i===1)pasos.push(Object.assign({},pick(PREG4)))});
  }
  if(hacerConv){
    const areas=(m.area!=="azar"&&AREAS4[m.area])?[m.area]:areasAlAzar(V,2);
    areas.forEach((a,i)=>{
      V["g:"+a]=n;pasos.push(pasoAbre(a,i,hacerTema));
      shuffleA(["pasado","futuro","gustos","comparar","frecuencia"]).slice(0,areas.length===1?5:4).forEach(f=>{
        const it=elegirNuevo(CONV4.filter(x=>x.g===a&&x.f===f),claveP,V,n);
        pasos.push(Object.assign({},usar(it),{rotulo:AREAS4[a].ico+" "+AREAS4[a].es}))});
    });
  }
  pasos.push(Object.assign({},CLOSE4,{q:pick(CLOSE_Q4)}));
  pasos.forEach(conCompasion);
  vistasGuardar(V);return pasos;
}

// ======== Examinador con IA ========
const TIPOS_EN={pasado:"talking about past events",futuro:"talking about future plans and intentions",gustos:"expressing likes and dislikes",comparar:"expressing simple comparisons",frecuencia:"describing manner and frequency",otro:"describing"};
// «plan de la charla» que la página sortea y le pasa a la IA: la hoja del tema (o un tema de ejemplo) y los dos temas de la conversación con preguntas-idea
function planIA(esExamen){
  const V=vistasLeer(),n=(V._n||0)+1;V._n=n;
  _g4Modo="completo";   // con la IA siempre se hace el examen completo
  const f=temaOEjemplo(),areas=areasAlAzar(V,2),L=[];
  L.push('SESSION PLAN (chosen by the page for THIS exam; follow it):');
  L.push('TOPIC FORM'+(f.ejemplo?' (the candidate did not fill in a form, so this is a SAMPLE topic: treat it as if the candidate had prepared it)':'')+': title "'+f.t+'". The four discussion points (cover all four, in any order):');
  f.p.forEach((pt,i)=>L.push(' point '+(i+1)+': "'+pt.texto+'" (language function: '+TIPOS_EN[pt.tipo]+')'));
  areas.forEach((a,i)=>{
    V["g:"+a]=n;
    const ideas=shuffleA(["pasado","futuro","gustos","comparar","frecuencia"]).slice(0,4).map(t=>{const it=elegirNuevo(CONV4.filter(x=>x.g===a&&x.f===t),claveP,V,n);V[claveP(it)]=n;return it.q});
    L.push((i?'SECOND':'FIRST')+' CONVERSATION AREA: '+AREAS4[a].es+' (say "'+AREAS4[a].dicho+'"). Question ideas (rephrase naturally, one per turn): '+ideas.map(q=>'"'+q+'"').join(' ; '));
  });
  vistasGuardar(V);return L.join("\n");
}
const PIC_LISTA=[];   // en el Grade 4 no hay dibujos
const picInfo=()=>null;
function elegirDibujo(){return null}
const SISTEMA_IA=`You are a kind, patient examiner for the Trinity GESE Grade 4 oral exam (CEFR A2.2, "Elementary stage"). The exam lasts 10 minutes and has two phases: (1) a TOPIC discussion about a topic that the candidate prepared (up to 5 minutes) and (2) a CONVERSATION on two subject areas chosen by the examiner (up to 5 minutes).
You are talking with ${MOD.nombre}, a child from Argentina who is learning English. Speak like a warm teacher. Do not use "he" or "she" for the child: say "you". Never guess the child's gender: in Spanish text avoid words with a gender ending ("contento/a", "preparado/a", "listo/a", "orgulloso/a") and use neutral wording.
STYLE
- Use simple English (A2): short sentences, easy words. Contractions are fine (it's, I'm).
- Ask ONE question at a time. Never repeat a question that was already asked.
- First react to the last answer in a few words (e.g. "That sounds nice!"), then ask the next question. Ask for more information, facts or details when an answer is short ("Can you tell me more?", "What else?").
- If the child did not understand or asks you to repeat, repeat more slowly with simpler words.
- NEVER say goodbye and NEVER set "end" to true before turn = max+1, even if the answer is short or is a question. If the child asks you something, answer in one short sentence and continue.
- All Spanish text you write ("tip", "help", the "es" of hints) must be Argentine Spanish with "vos" (decí, probá, podés), never "puedes" or "di".
STRUCTURE. "turn" is the number of this turn and "max" is the last question turn. The SESSION PLAN (below) gives the topic form and the two conversation areas of THIS exam:
 turn 1: greeting, "Hello! Come in and sit down, please. How are you today?" (warm-up, not assessed)
 turn 2: say "We're going to start with your topic. Can I have your topic form, please?"
 turn 3: react to "Here you are." in two words and say "So, we're going to talk about…?" and WAIT for the candidate to tell you the title of the topic (the title is on the form in the plan). Do not say the title yourself.
 turns 4 to 11: TOPIC PHASE. Ask about the four discussion points of the plan, in ANY order (not always the order of the form), about two questions for each point. Ask for more details. Use the language function of each point (past events, future plans, comparisons, likes and dislikes, frequency and manner). Between turns 6 and 9 say "Do you want to ask me a question about your topic?" (the candidate must ask at least one question; answer it in ONE short sentence at the start of your next reply and then continue).
 turn 12: say "Thank you. And now we're going to talk about something different. Let's talk about" + the FIRST conversation area, then ask the first question of that area.
 turns 13 and 14: two more questions on the first area.
 turn 15: say "Thank you. Now let's talk about" + the SECOND conversation area, then ask the first question of that area.
 turns 16 and 17: two more questions on the second area. (max = 17)
 turn = max+1 (18): answer the last answer in a few words and say a warm goodbye ("Thank you. That's the end of the exam. Goodbye!"). Set "end" to true.
GRADE 4 LANGUAGE (invite it with your questions): past simple of regular and common irregular verbs ("What did you do…?", "Where did you go…?"), going to future ("What are you going to do…?"), comparatives and superlatives ("Which is better…?", "What is the best…?"), likes and dislikes ("Do you like…?", "What do you like doing?"), manner and frequency ("How often do you…?", "How well do you…?") and the link word "but". Reasons with "because" are Grade 5: do not push for them.
PICTURES: this grade has no pictures: "picture" MUST always be an empty string "".
HARD RULES FOR EVERY REPLY: one short reaction (at most 8 words) + ONE short question (at most 15 words). NEVER ask two questions in one reply. A child must be able to follow it.
HELP FOR THE CHILD (very important)
- "hints": 1 to 3 short items {"es": Spanish, "en": English} with the English words or phrases that will help the child answer YOUR NEXT QUESTION (e.g. {"es":"fui a","en":"I went to"}). They are shown to the child between questions.
- "help": if the child's last answer contained Spanish words or they said they don't know ("no sé", "I don't know"), write one short sentence in Spanish telling how to say it in English (e.g. "«perro» se dice dog."). Otherwise "".
Answer ONLY with JSON: {"reply": string, "ok": boolean, "tip": string, "model": string, "end": boolean, "picture": string, "hints": [{"es": string, "en": string}], "help": string}
- "reply": what the examiner says out loud (English only, no emojis).
- "ok": be a fair but DEMANDING judge, do not say yes just to be nice. true only if the last answer was relevant, in English, a sentence (not one word) and used the language the question asked for (small grammar mistakes are fine). false if it was empty, off-topic, in Spanish, or one word. At the warm-up turns (1 and 2) always true.
- "tip": if ok is false, one short helpful tip in SPANISH (max 20 words); otherwise "".
- "model": if ok is false, a short correct example answer in English; otherwise "".
- "end": true only for the final goodbye.`;
const PROMPT_TRANSCRIBIR="Transcribe exactly what the speaker says. The speaker is a child called "+MOD.nombre+" (Argentine Spanish accent) learning English and the speech is meant to be in English. If you hear the name, write it as "+MOD.nombre+". Output ONLY the transcription: no quotes, no comments, no translation. If there is no intelligible speech, output nothing.";

// ======== Corrección con IA ========
const SISTEMA_EVAL=`You are a Trinity College London GESE examiner. You have just examined ${MOD.nombre}, a child from Argentina, in the Grade 4 oral exam (Elementary stage, CEFR A2.2): a discussion of a topic prepared by the candidate (four discussion points) followed by a conversation on two subject areas. Now MARK the whole conversation.
The transcript has lines "EXAMINER:" and "${MOD.nombre.toUpperCase()}:". The child's lines come from automatic speech-to-text: IGNORE punctuation, capital letters, spelling and tiny transcription slips (never count them as mistakes). "(no answer)" means nothing was said. "[the examiner helped the child here]" means the first try was weak and the examiner modelled the answer, so the repetition counts for little.
If the transcript has no topic phase (it goes from the greeting straight to the subject areas) the candidate was practising only the conversation: do not expect a question from the candidate. If it has no conversation phase (only the topic), mark only the topic.
LEVEL: Grade 4 is A2.2, elementary English. Short simple sentences with the grammar of the grade ("Last summer I went to the beach.", "I'm going to visit my grandma.", "Football is more exciting than tennis, but tennis is easier.") deserve a HIGH mark. Do not ask for more than a child at this level can do.
MARK these four criteria with a whole number from 0 to 10:
- comprension: understood the questions and answered WHAT WAS ASKED (relevant, on topic). In the topic phase: gave information about the points in limited long turns (not one-word answers), added details or facts when asked, and did not just recite a learnt text. Answers in Spanish, off-topic answers, "I don't know" and silence lower it.
- gramatica: accuracy of the Grade 4 grammar: past simple (regular and common irregular verbs), going to future, like/love/enjoy + -ing, comparatives and superlatives of adjectives, adverbs of manner and frequency, and the link word "but" (earlier grades: present simple, present continuous, can, was/were, there is/are, prepositions). Small slips are fine; errors that make a sentence hard to understand lower it a lot. The FACTS line says how many examples of the Grade 4 language the app found: if the questions invited a function and the child never used it (for example no past tense after "What did you do?"), the grammar mark must not be above 6.
- vocabulario: the right words for the topic and the subject areas (holidays, shopping, school and work, hobbies and sports, food, weekend and seasonal activities), expressions of frequency and past time, and some variety.
- fluidez: how much was said: several connected sentences instead of one word, link words (and, but, then), tries to say more than the minimum, natural rhythm.
SCALE: 0-3 very weak; 4-5 weak; 6 pass; 7 good; 8 very good; 9-10 excellent for the level. Be honest, fair and consistent: not harsh and not flattering. Never give 8 or more if most answers were one word or in Spanish. Never give less than 5 if most questions were answered with correct simple sentences.
The message starts with FACTS counted by the app (they are exact, trust them). If most answers were a single word, silence, Spanish or "I don't know", "comprension" and "fluidez" must be 4 or less.
"pregunto": true ONLY if the child asked the examiner at least one real question of their own about the topic (for example "Do you like football?" or "When did you start?").
TEXT FOR THE CHILD: write it in Argentine Spanish with "vos" (decí, probá, podés), warm and short, speaking to the child directly ("hiciste", "dijiste"), never in the third person. Never show the child's gender: no "contento/a", "preparado/a", "orgulloso/a"; use neutral wording. English only inside quotes.
- "resumen": 2 short sentences: the overall impression and the single most important thing to improve.
- "bien": 2 or 3 short strings with what the child did WELL, each with a real example of what was said.
- "mejorar": up to 4 items taken from what the child REALLY said: "dijo" = the words copied EXACTLY from the transcript (English), "mejor" = the corrected or fuller English sentence a child of this level could say, "porque" = one short reason in Spanish. Only real mistakes, answers in Spanish or one-word answers. If there are none, return an empty list. Never invent what was said.
- "repasar": 1 to 4 short Spanish strings naming the Grade 4 grammar or topics to study (for example "Pasado: I went, we played", "Comparar: bigger than, the best", "Going to: I'm going to…", "Frecuencia: twice a week").
Answer ONLY with JSON: {"comprension": integer, "gramatica": integer, "vocabulario": integer, "fluidez": integer, "pregunto": boolean, "resumen": string, "bien": [string], "mejorar": [{"dijo": string, "mejor": string, "porque": string}], "repasar": [string]}`;
const EVAL_CRIT=[["comprension","🎧","Entender y responder"],["gramatica","🧩","Gramática"],["vocabulario","📚","Vocabulario"],["fluidez","💬","Fluidez"]];
// datos que cuenta la página (no la IA) sobre el lenguaje del grado que se usó: se le pasan a la IA junto con los demás hechos
function evalExtra(reg){
  const kid=reg.filter(x=>x.r==="K"&&x.t!=="(no answer)").map(x=>x.t.toLowerCase().replace(/[.,!?]/g," "));
  const cuenta=re=>kid.reduce((s,t)=>s+((t.match(new RegExp(re.source,"g"))||[]).length),0);
  return "GRADE 4 LANGUAGE FOUND BY THE APP in the child's answers: past tense forms: "+cuenta(PAS)+"; going to: "+cuenta(FUT)+"; comparatives or superlatives: "+cuenta(COMP)+"; like/love/enjoy: "+cuenta(GUS)+"; frequency or manner words: "+cuenta(FREC)+"; the word but: "+cuenta(/\bbut\b/)+".";
}

// ======== Vocabulario para estudiar (tocá una palabra para escucharla) ========
const VOCAB=[
 ["Holidays","Vacaciones","I <b>went</b> to the <b>beach</b> and I stayed in a <b>hotel</b>.",
  [["holiday","vacaciones"],["trip","viaje"],["journey","viaje largo"],["beach","playa"],["sea","mar"],["sand","arena"],["mountains","montañas"],["lake","lago"],["countryside","campo"],["city","ciudad"],["hotel","hotel"],["campsite","camping"],["tent","carpa"],["suitcase","valija"],["passport","pasaporte"],["ticket","pasaje / entrada"],["airport","aeropuerto"],["plane","avión"],["boat","barco"],["sightseeing","hacer turismo"],["museum","museo"],["souvenir","recuerdo"],["photo","foto"],["swim","nadar"],["sunbathe","tomar sol"],["relax","relajarse"],["travel","viajar"],["stay","quedarse"],["visit","visitar"],["pack","hacer la valija"]]],
 ["Shopping","De compras","I <b>bought</b> a T-shirt and some shoes. It was <b>cheap</b>.",
  [["shop","tienda"],["supermarket","supermercado"],["shopping centre","shopping"],["market","feria"],["kiosk","kiosco"],["buy","comprar"],["sell","vender"],["pay","pagar"],["cost","costar"],["price","precio"],["cheap","barato"],["expensive","caro"],["money","plata"],["change","vuelto"],["receipt","comprobante"],["bag","bolsa"],["basket","canasta"],["trolley","carrito"],["size","talle"],["try on","probarse"],["clothes","ropa"],["shoes","zapatos"],["T-shirt","remera"],["jeans","jeans"],["jacket","campera"],["present","regalo"],["customer","cliente"],["shop assistant","vendedor/a"],["queue","cola"],["sale","liquidación"],["discount","descuento"],["cash","efectivo"],["credit card","tarjeta de crédito"]]],
 ["School and work","Escuela y trabajo","My dad <b>works</b> in an <b>office</b>. I <b>had</b> maths and English yesterday.",
  [["subject","materia"],["lesson","clase"],["timetable","horario"],["test","prueba"],["exam","examen"],["homework","tarea"],["classmate","compañero/a"],["headteacher","director/a"],["break","recreo"],["canteen","comedor"],["uniform","uniforme"],["study","estudiar"],["learn","aprender"],["teach","enseñar"],["job","trabajo"],["work","trabajar"],["office","oficina"],["factory","fábrica"],["hospital","hospital"],["boss","jefe/a"],["colleague","compañero/a de trabajo"],["meeting","reunión"],["client","cliente"],["busy","ocupado/a"],["tired","cansado/a"],["engineer","ingeniero/a"],["architect","arquitecto/a"],["lawyer","abogado/a"],["driver","conductor/a"]]],
 ["Hobbies and sports","Pasatiempos y deportes","I <b>like playing</b> football. We <b>won</b> the match.",
  [["hobby","pasatiempo"],["team","equipo"],["match","partido"],["player","jugador/a"],["win","ganar"],["lose","perder"],["draw","empatar"],["score","hacer un gol"],["practise","practicar"],["training","entrenamiento"],["coach","entrenador/a"],["race","carrera"],["swimming pool","pileta"],["pitch","cancha de fútbol"],["court","cancha de tenis"],["gym","gimnasio"],["skate","patinar"],["cycle","andar en bici"],["run","correr"],["jump","saltar"],["climb","trepar"],["dance","bailar"],["paint","pintar"],["play the guitar","tocar la guitarra"],["collect","coleccionar"],["chess","ajedrez"],["video games","videojuegos"],["board games","juegos de mesa"],["gymnastics","gimnasia"],["volleyball","vóley"],["basketball","básquet"],["hockey","hockey"]]],
 ["Food","Comida","I <b>ate</b> pasta for lunch. Pizza is <b>tastier</b> than salad.",
  [["breakfast","desayuno"],["lunch","almuerzo"],["dinner","cena"],["snack","snack"],["dessert","postre"],["fruit","fruta"],["vegetables","verduras"],["meat","carne"],["chicken","pollo"],["fish","pescado"],["rice","arroz"],["pasta","pastas"],["bread","pan"],["cheese","queso"],["egg","huevo"],["milk","leche"],["juice","jugo"],["water","agua"],["ice cream","helado"],["chocolate","chocolate"],["cake","torta"],["biscuit","galletita"],["pizza","pizza"],["sandwich","sándwich"],["salad","ensalada"],["soup","sopa"],["delicious","riquísimo"],["tasty","sabroso"],["sweet","dulce"],["salty","salado"],["sour","ácido"],["spicy","picante"],["healthy","saludable"],["unhealthy","poco saludable"],["cook","cocinar"],["bake","hornear"],["fry","freír"],["boil","hervir"],["mix","mezclar"],["recipe","receta"],["ingredients","ingredientes"],["plate","plato"],["fork","tenedor"],["knife","cuchillo"],["spoon","cuchara"]]],
 ["Weekend and seasonal activities","Fin de semana y estaciones","At the weekend I <b>sleep late</b>. Next summer we're <b>going to</b> go camping.",
  [["weekend","fin de semana"],["sleep late","dormir hasta tarde"],["go for a walk","salir a caminar"],["go for a bike ride","salir en bici"],["have a barbecue","hacer un asado"],["have a picnic","hacer un picnic"],["visit my grandparents","visitar a mis abuelos"],["go to the cinema","ir al cine"],["watch a film","mirar una película"],["meet my friends","encontrarme con mis amigos"],["go shopping","ir de compras"],["birthday party","fiesta de cumpleaños"],["play in the park","jugar en el parque"],["swim in the sea","nadar en el mar"],["swim in the pool","nadar en la pileta"],["go camping","ir de camping"],["build a snowman","hacer un muñeco de nieve"],["go skiing","esquiar"],["go ice skating","patinar sobre hielo"],["fly a kite","volar un barrilete"],["pick flowers","juntar flores"],["collect leaves","juntar hojas"],["coat","abrigo"],["scarf","bufanda"],["gloves","guantes"],["umbrella","paraguas"],["sunglasses","anteojos de sol"],["sun cream","protector solar"],["Christmas","Navidad"],["Easter","Pascua"]]],
 ["Expressions of past time","Para hablar del pasado","I went to the beach <b>last summer</b>. We watched a film <b>yesterday</b>.",
  [["yesterday","ayer"],["last night","anoche"],["last week","la semana pasada"],["last weekend","el fin de semana pasado"],["last month","el mes pasado"],["last year","el año pasado"],["last summer","el verano pasado"],["two days ago","hace dos días"],["a week ago","hace una semana"],["a month ago","hace un mes"],["when I was six","cuando tenía seis"],["this morning","esta mañana"],["then","después / entonces"],["after that","después de eso"],["finally","al final"]]],
 ["Frequency (how often)","Cada cuánto","I <b>always</b> play on Saturday. I swim <b>twice a week</b>.",
  [["always","siempre"],["usually","generalmente"],["often","seguido"],["sometimes","a veces"],["hardly ever","casi nunca"],["never","nunca"],["every day","todos los días"],["every week","todas las semanas"],["once a week","una vez por semana"],["twice a month","dos veces por mes"],["three times a year","tres veces por año"],["on Saturdays","los sábados"],["at the weekend","el fin de semana"],["all the time","todo el tiempo"]]],
 ["Adverbs of manner (how)","Cómo se hace algo","She runs <b>quickly</b>. He plays the guitar <b>well</b>.",
  [["quickly","rápidamente"],["slowly","lentamente"],["carefully","con cuidado"],["badly","mal"],["well","bien"],["loudly","fuerte (ruidoso)"],["quietly","despacito, sin ruido"],["easily","fácilmente"],["happily","felizmente"],["hard","con esfuerzo"],["fast","rápido"],["politely","con educación"]]],
 ["Adjectives to compare","Adjetivos para comparar","My dog is <b>bigger than</b> my cat. This is <b>the best</b> pizza.",
  [["big, bigger, the biggest","grande"],["small, smaller, the smallest","chico"],["tall, taller, the tallest","alto"],["short, shorter, the shortest","bajo / corto"],["long, longer, the longest","largo"],["fast, faster, the fastest","rápido"],["cheap, cheaper, the cheapest","barato"],["old, older, the oldest","viejo"],["young, younger, the youngest","joven"],["hot, hotter, the hottest","caluroso"],["easy, easier, the easiest","fácil"],["happy, happier, the happiest","feliz"],["funny, funnier, the funniest","gracioso"],["expensive, more expensive, the most expensive","caro"],["interesting, more interesting, the most interesting","interesante"],["exciting, more exciting, the most exciting","emocionante"],["difficult, more difficult, the most difficult","difícil"],["beautiful, more beautiful, the most beautiful","lindo"],["good, better, the best","bueno"],["bad, worse, the worst","malo"]]]
];
// dibujitos (emojis) que se ponen delante de cada palabra y de cada tema (la clave es la palabra en minúsculas)
const DIB={
 holiday:"🏖️",trip:"🧳",journey:"🛤️",beach:"🏖️",sea:"🌊",sand:"🏝️",mountains:"⛰️",lake:"🏞️",countryside:"🌾",city:"🏙️",hotel:"🏨",campsite:"🏕️",tent:"⛺",suitcase:"🧳",passport:"🛂",ticket:"🎫",airport:"🛫",plane:"✈️",boat:"⛴️",sightseeing:"📸",museum:"🖼️",souvenir:"🎁",photo:"📷",swim:"🏊",sunbathe:"😎",relax:"😌",travel:"🌍",stay:"🛌",visit:"👋",pack:"🎒",
 shop:"🏪",supermarket:"🛒","shopping centre":"🛍️",market:"🥕",kiosk:"🍬",buy:"💳",sell:"🏷️",pay:"💵",cost:"💲",price:"🏷️",cheap:"🏷️",expensive:"💎",money:"💰",change:"🪙",receipt:"🧾",bag:"👜",basket:"🧺",trolley:"🛒",size:"📏","try on":"👗",clothes:"👚",shoes:"👟","t-shirt":"👕",jeans:"👖",jacket:"🧥",present:"🎁",customer:"🙋","shop assistant":"💁",queue:"🚶",sale:"🔖",discount:"％",cash:"💵","credit card":"💳",
 subject:"📘",lesson:"📖",timetable:"🗓️",test:"📝",exam:"✍️",homework:"📓",classmate:"🧑‍🎓",headteacher:"👩‍💼",break:"🥪",canteen:"🍽️",uniform:"👔",study:"📚",learn:"💡",teach:"🧑‍🏫",job:"💼",work:"🛠️",office:"🏢",factory:"🏭",hospital:"🏥",boss:"👔",colleague:"🤝",meeting:"🗣️",client:"🙋",busy:"⏳",tired:"🥱",engineer:"👷",architect:"📐",lawyer:"⚖️",driver:"🚗",
 hobby:"🎨",team:"👥",match:"🏟️",player:"🏃",win:"🏆",lose:"😞",draw:"🤝",score:"🥅",practise:"🔁",training:"🏋️",coach:"📣",race:"🏁","swimming pool":"🏊",pitch:"⚽",court:"🎾",gym:"💪",skate:"🛹",cycle:"🚴",run:"🏃",jump:"🦘",climb:"🧗",dance:"💃",paint:"🖌️","play the guitar":"🎸",collect:"🗃️",chess:"♟️","video games":"🎮","board games":"🎲",gymnastics:"🤸",volleyball:"🏐",basketball:"🏀",hockey:"🏑",
 breakfast:"🥣",lunch:"🍝",dinner:"🍽️",snack:"🍿",dessert:"🍰",fruit:"🍎",vegetables:"🥦",meat:"🥩",chicken:"🍗",fish:"🐟",rice:"🍚",pasta:"🍝",bread:"🍞",cheese:"🧀",egg:"🥚",milk:"🥛",juice:"🧃",water:"💧","ice cream":"🍦",chocolate:"🍫",cake:"🎂",biscuit:"🍪",pizza:"🍕",sandwich:"🥪",salad:"🥗",soup:"🍲",delicious:"😋",tasty:"😋",sweet:"🍭",salty:"🧂",sour:"🍋",spicy:"🌶️",healthy:"🥕",unhealthy:"🍟",cook:"🧑‍🍳",bake:"🥧",fry:"🍳",boil:"♨️",mix:"🥄",recipe:"📜",ingredients:"🧅",plate:"🍽️",fork:"🍴",knife:"🔪",spoon:"🥄",
 weekend:"🎉","sleep late":"😴","go for a walk":"🚶","go for a bike ride":"🚲","have a barbecue":"🥩","have a picnic":"🧺","visit my grandparents":"👵","go to the cinema":"🎬","watch a film":"🍿","meet my friends":"🧑‍🤝‍🧑","go shopping":"🛍️","birthday party":"🎈","play in the park":"🛝","swim in the sea":"🌊","swim in the pool":"🏊","go camping":"🏕️","build a snowman":"⛄","go skiing":"⛷️","go ice skating":"⛸️","fly a kite":"🪁","pick flowers":"🌷","collect leaves":"🍂",coat:"🧥",scarf:"🧣",gloves:"🧤",umbrella:"☂️",sunglasses:"🕶️","sun cream":"🧴",christmas:"🎄",easter:"🐰",
 yesterday:"⏪","last night":"🌙","last week":"📆","last weekend":"🎉","last month":"🗓️","last year":"📅","last summer":"🏖️","two days ago":"⏮️","a week ago":"📆","a month ago":"🗓️","when i was six":"🧒","this morning":"🌅",then:"➡️","after that":"⏭️",finally:"🏁",
 always:"💯",usually:"👍",often:"🔁",sometimes:"🤷","hardly ever":"🤏",never:"🚫","every day":"📅","every week":"🗓️","once a week":"1️⃣","twice a month":"2️⃣","three times a year":"3️⃣","on saturdays":"⚽","at the weekend":"🎉","all the time":"♾️",
 quickly:"⚡",slowly:"🐢",carefully:"🧐",badly:"👎",well:"👍",loudly:"📢",quietly:"🤫",easily:"😎",happily:"😄",hard:"💪",fast:"🏎️",politely:"🙏",
 "big, bigger, the biggest":"🐘","small, smaller, the smallest":"🐜","tall, taller, the tallest":"🦒","short, shorter, the shortest":"📎","long, longer, the longest":"🐍","fast, faster, the fastest":"🐆","cheap, cheaper, the cheapest":"🪙","old, older, the oldest":"👴","young, younger, the youngest":"👶","hot, hotter, the hottest":"🔥","easy, easier, the easiest":"🍰","happy, happier, the happiest":"😊","funny, funnier, the funniest":"🤣","expensive, more expensive, the most expensive":"💎","interesting, more interesting, the most interesting":"🔍","exciting, more exciting, the most exciting":"🎢","difficult, more difficult, the most difficult":"🧩","beautiful, more beautiful, the most beautiful":"🌸","good, better, the best":"🌟","bad, worse, the worst":"⛈️"
};
const DIB_CAT={"holidays":"🏖️","shopping":"🛍️","school and work":"🏫","hobbies and sports":"⚽","food":"🍕","weekend and seasonal activities":"🌤️","expressions of past time":"⏪","frequency (how often)":"🔁","adverbs of manner (how)":"⚡","adjectives to compare":"⚖️",
 "past simple":"🕒","going to (plans)":"🔮","like + -ing":"❤️","comparatives and superlatives":"⚖️","adverbs of frequency and manner":"🔁","the link word but":"🔗","the topic phase":"📝","pronunciation of -ed":"🗣️","useful phrases":"💬","irregular past verbs":"🕒","past simple questions":"❓","questions to ask the examiner":"🙋"};
const DIB_PREP={};

// ======== Examen escrito (30 preguntas al azar de este banco) ========
const bank=[
["Past simple (regular)","Yesterday I ___ football with my friends.",["play","played","playing"],1],
["Past simple (regular)","She ___ the door and went out.",["closed","closeed","closing"],0],
["Past simple (regular)","We ___ to music last night.",["listen","listened","listenned"],1],
["Past simple (regular)","He ___ his room on Saturday.",["cleaned","cleaning","cleanned"],0],
["Past simple (regular)","The bus ___ at the school gate.",["stoped","stopped","stopt"],1],
["Past simple (regular)","She ___ English yesterday.",["studyed","studied","studies"],1],
["Past simple (regular)","I ___ my homework last night.",["finished","finish","finishd"],0],
["Past simple (irregular)","Last summer we ___ to the beach.",["go","went","goed"],1],
["Past simple (irregular)","I ___ a new T-shirt yesterday.",["buyed","bought","buy"],1],
["Past simple (irregular)","She ___ a big cake for my birthday.",["maked","made","make"],1],
["Past simple (irregular)","They ___ a film last night.",["saw","seed","see"],0],
["Past simple (irregular)","He ___ pizza for dinner.",["eated","ate","eat"],1],
["Past simple (irregular)","Last summer we ___ in the sea every day.",["swam","swimmed","swim"],0],
["Past simple (irregular)","Yesterday I ___ a letter to my friend.",["writed","wrote","write"],1],
["Past simple (irregular)","My dad ___ me a present.",["gived","gave","give"],1],
["Past simple (irregular)","She ___ me about her holiday.",["telled","told","tell"],1],
["Past simple (irregular)","Yesterday we ___ lunch at one o'clock.",["haved","had","have"],1],
["Past simple (irregular)","I ___ my keys yesterday.",["losed","lost","lose"],1],
["Past simple (irregular)","He ___ home at six.",["comed","came","come"],1],
["Past simple (questions and negatives)","___ you go to school yesterday?",["Do","Did","Does"],1],
["Past simple (questions and negatives)","I didn't ___ the match.",["watched","watch","watching"],1],
["Past simple (questions and negatives)","Did she ___ the cake?",["made","make","makes"],1],
["Past simple (questions and negatives)","We ___ play football last Sunday.",["don't","didn't","doesn't"],1],
["Past simple (questions and negatives)","Where ___ you go on holiday last summer?",["did","do","were"],0],
["Past simple (questions and negatives)","What did you ___ for breakfast?",["ate","eat","eaten"],1],
["Past simple (questions and negatives)","He ___ like the film.",["didn't","don't","wasn't"],0],
["Going to (plans)","Tomorrow I ___ visit my grandma.",["am going to","going to","am go to"],0],
["Going to (plans)","We ___ going to play tennis on Saturday.",["is","are","am"],1],
["Going to (plans)","She is going to ___ a new bike.",["buys","buy","buying"],1],
["Going to (plans)","What ___ you going to do next summer?",["are","do","is"],0],
["Going to (plans)","They aren't going to ___ to the party.",["come","comes","coming"],0],
["Going to (plans)","I'm going to ___ pizza tonight.",["make","makes","making"],0],
["Going to (plans)","___ he going to study English?",["Is","Does","Are"],0],
["Going to (plans)","It's ___ to rain this afternoon.",["go","going","goes"],1],
["Comparatives","My dog is ___ than my cat.",["big","bigger","biggest"],1],
["Comparatives","This bag is ___ than that one.",["cheaper","cheapest","more cheap"],0],
["Comparatives","English is ___ than maths for me.",["more easy","easier","easiest"],1],
["Comparatives","A plane is ___ than a car.",["faster","more fast","fastest"],0],
["Comparatives","This film is ___ than the other one.",["more interesting","interestinger","most interesting"],0],
["Comparatives","My brother is ___ than me.",["tall","taller","tallest"],1],
["Comparatives","Summer is ___ than winter.",["hot","hotter","hottest"],1],
["Comparatives","Pizza is ___ than salad.",["tastier","tasty","tastiest"],0],
["Comparatives","The weather today is ___ than yesterday.",["good","better","best"],1],
["Superlatives","Messi is the ___ player in the world.",["good","better","best"],2],
["Superlatives","This is the ___ shop in town.",["bigger","biggest","more big"],1],
["Superlatives","It was the ___ holiday of my life.",["most exciting","more exciting","excitingest"],0],
["Superlatives","Lucas is the ___ in my class.",["tallest","taller","most tall"],0],
["Superlatives","That is the ___ expensive phone of all.",["more","most","much"],1],
["Superlatives","She is the ___ student in the school.",["young","younger","youngest"],2],
["Superlatives","Football is the ___ popular sport in the world.",["most","more","mostest"],0],
["Superlatives","Today is the ___ day of the year.",["hottest","hotter","most hot"],0],
["Like + -ing","I like ___ football.",["play","playing","played"],1],
["Like + -ing","She likes ___ pasta.",["cooking","cook","cooks"],0],
["Like + -ing","We enjoy ___ in the sea.",["swim","swimming","swam"],1],
["Like + -ing","He doesn't like ___ early.",["get up","getting up","got up"],1],
["Like + -ing","I like to ___ books.",["read","reading","reads"],0],
["Like + -ing","My sister hates ___ vegetables.",["eat","eating","ate"],1],
["Adverbs of manner","She speaks English very ___.",["good","well","goodly"],1],
["Adverbs of manner","He runs ___.",["quick","quickly","quickness"],1],
["Adverbs of manner","Please walk ___ on the stairs.",["careful","carefully","care"],1],
["Adverbs of manner","The baby is sleeping. Speak ___.",["quiet","quietly","quietness"],1],
["Adverbs of manner","They play very ___. They always lose.",["bad","badly","badness"],1],
["Adverbs of manner","He works ___ at school.",["hard","hardly","harded"],0],
["Adverbs of frequency","I ___ go to school by bus. (every day)",["never","always","sometimes"],1],
["Adverbs of frequency","She is ___ late. (0%)",["never","usually","always"],0],
["Adverbs of frequency","We ___ play video games on Sunday. (50%)",["sometimes","always","never"],0],
["Adverbs of frequency","They are ___ at home on Saturdays.",["usually","usual","usuallys"],0],
["Adverbs of frequency","I go to the cinema ___ a month.",["once","one","first"],0],
["Adverbs of frequency","He practises the guitar ___ a week.",["three time","three times","third times"],1],
["Adverbs of frequency","We have English ___ day.",["many","every","each of"],1],
["The link word but","I like pizza, ___ I don't like pasta.",["but","or","then"],0],
["The link word but","She is tall, ___ her brother is short.",["but","so","or"],0],
["The link word but","It was sunny, ___ we stayed at home.",["but","or","too"],0],
["The link word but","I want to play, ___ I'm tired.",["but","then","also"],0],
["The link word but","The film was long, ___ it was very good.",["but","because","so"],0],
["Past time expressions","I went to the beach ___ summer.",["last","past","next"],0],
["Past time expressions","We watched a film ___ night.",["yesterday","last","ago"],1],
["Past time expressions","She called me two days ___.",["last","next","ago"],2],
["Past time expressions","I was at school ___ morning.",["yesterday","last","ago"],0],
["Past time expressions","My birthday was ___ week.",["past","last","before"],1],
["Past time expressions","I started playing football ___ I was six.",["when","then","while"],0],
["Pronunciation of -ed","Which word ends with the sound /t/?",["played","walked","wanted"],1],
["Pronunciation of -ed","Which word ends with the sound /d/?",["watched","played","visited"],1],
["Pronunciation of -ed","Which word ends with the sound /id/ (an extra syllable)?",["wanted","jumped","cleaned"],0],
["Pronunciation of -ed","'Watched' ends with the sound…",["/t/","/d/","/id/"],0],
["Pronunciation of -ed","'Painted' ends with the sound…",["/t/","/d/","/id/"],2],
["Pronunciation of -ed","'Listened' ends with the sound…",["/t/","/d/","/id/"],1],
["Holidays","You sleep in a ___ when you go camping.",["tent","ticket","passport"],0],
["Holidays","You show your ___ at the airport.",["suitcase","passport","souvenir"],1],
["Holidays","A ___ is something you buy to remember a trip.",["souvenir","ticket","hotel"],0],
["Holidays","You stay in a ___ when you travel.",["hotel","kiosk","canteen"],0],
["Holidays","At the beach there is ___.",["sand","snow","chalk"],0],
["Shopping","A shop assistant ___ things to customers.",["sells","buys","wins"],0],
["Shopping","This T-shirt only costs five dollars. It's very ___.",["cheap","expensive","heavy"],0],
["Shopping","You can try on ___ in a clothes shop.",["jeans","rice","milk"],0],
["Shopping","How much does it ___?",["cost","costs","costed"],0],
["Shopping","Here is your ___: it's five pesos.",["change","size","queue"],0],
["School and work","A ___ shows the lessons of the week.",["timetable","uniform","canteen"],0],
["School and work","You have lunch in the school ___.",["canteen","library","office"],0],
["School and work","My mum works in the ___. She uses a computer.",["office","factory","farm"],0],
["School and work","A doctor works in a ___.",["hospital","bank","library"],0],
["School and work","We have a ___ every Friday in maths.",["test","trip","holiday"],0],
["Hobbies and sports","In football, the team that scores more goals ___.",["wins","loses","draws"],0],
["Hobbies and sports","You play tennis on a ___.",["court","pitch","pool"],0],
["Hobbies and sports","You play football on a ___.",["pitch","court","pool"],0],
["Hobbies and sports","A ___ helps the team to train.",["coach","customer","waiter"],0],
["Hobbies and sports","I ___ the guitar after school.",["play","make","do"],0],
["Hobbies and sports","We swim in a ___.",["swimming pool","gym","court"],0],
["Food","Pizza with lots of chilli is ___.",["spicy","sweet","sour"],0],
["Food","Sugar is ___.",["sweet","salty","sour"],0],
["Food","An apple is ___ for you.",["healthy","spicy","bitter"],0],
["Food","You eat soup with a ___.",["spoon","fork","knife"],0],
["Food","Mum is baking a ___ for my birthday.",["cake","soup","salad"],0],
["Weekend and seasonal activities","In winter, when it snows, you can build a ___.",["snowman","sandcastle","picnic"],0],
["Weekend and seasonal activities","We have a ___ in the park on sunny days.",["picnic","test","meeting"],0],
["Weekend and seasonal activities","It's raining. Take your ___.",["umbrella","sunglasses","kite"],0],
["Weekend and seasonal activities","At the weekend I sleep ___ and I don't go to school.",["late","hard","fast"],0],
["Weekend and seasonal activities","In summer you put on sun ___.",["cream","soup","coat"],0]
];

// ======== La hoja del tema (pantalla Speaking): título + 4 puntos, cada uno con su función ========
(function(){
  const tit=$("temaTitulo");if(!tit)return;   // (la página no tiene la hoja: nada que armar)
  const P=[1,2,3,4].map(i=>({t:$("temaP"+i),s:$("temaT"+i),a:$("temaA"+i)}));
  const aviso=$("temaAviso"),ideas=$("temaIdeas");
  P.forEach(p=>{p.s.innerHTML=Object.keys(TIPOS).map(k=>`<option value="${k}">${TIPOS[k].ico} ${TIPOS[k].nom}</option>`).join("")});
  const leer=()=>({t:tit.value,p:P.map(p=>[p.t.value,p.s.value])});
  function pintar(f){tit.value=f&&f.t?f.t:"";P.forEach((p,i)=>{const x=f&&f.p&&f.p[i];p.t.value=x?x[0]:"";p.s.value=x&&TIPOS[x[1]]?x[1]:["pasado","gustos","comparar","futuro"][i]});ayudas()}
  function ayudas(){P.forEach(p=>{if(p.a)p.a.innerHTML=TIPOS[p.s.value].ayuda})}
  function revisar(){   // qué le falta a la hoja (no bloquea nada: sólo avisa)
    if(!aviso)return;const f=leer(),m=[];
    if(!String(f.t).trim())m.push("Escribí el <b>título</b> de tu tema (en inglés, por ejemplo <i>My best birthday</i>).");
    else if(TEMAS_PROHIBIDOS.test(String(f.t).trim()))m.push("⚠️ «"+esc(f.t.trim())+"» es uno de los temas de la <b>conversación</b>: el examen real pide un tema más personal y concreto (por ejemplo <i>My trip to Bariloche</i> en vez de <i>Holidays</i>).");
    const llenos=f.p.filter(x=>String(x[0]).trim().length>=3).length;
    if(llenos<4)m.push("Te faltan <b>"+(4-llenos)+"</b> de los 4 puntos. Sin la hoja completa, la práctica usa un tema de ejemplo.");
    const tipos=new Set(f.p.filter(x=>String(x[0]).trim()).map(x=>x[1]));
    if(llenos===4&&tipos.size<3)m.push("💡 Probá que los puntos sean de <b>3 o 4 funciones distintas</b> (pasado, planes, gustos, comparar…): así mostrás todo lo que pide el grado.");
    aviso.innerHTML=m.length?m.join("<br>"):"✅ La hoja está lista. Tocá <b>Empezar</b> en la práctica o en el examen: el examinador te la va a pedir.";
  }
  function guardar(){const f=leer();temaGuardar(f);ayudas();revisar()}
  [tit].concat(P.map(p=>p.t)).forEach(x=>x.addEventListener("input",guardar));
  P.forEach(p=>p.s.addEventListener("change",guardar));
  pintar(temaLeer());revisar();
  // ideas de temas
  if(ideas){
    ideas.innerHTML=IDEAS4.map((i,k)=>`<button class="chip" data-idea="${k}"><b>${esc(i.t)}</b><span>${i.p.map(x=>TIPOS[x[1]].ico).join(" ")}</span></button>`).join("");
    ideas.addEventListener("click",e=>{const b=e.target.closest("[data-idea]");if(!b)return;const i=IDEAS4[+b.dataset.idea];pintar({t:i.t,p:i.p});guardar();toast("Listo: «"+esc(i.t)+"». Cambiá los puntos para que sean tuyos.")});
  }
  const btn=id=>$(id);
  if(btn("temaIdeasBtn"))btn("temaIdeasBtn").onclick=()=>{if(ideas)ideas.hidden=!ideas.hidden};
  if(btn("temaBorrar"))btn("temaBorrar").onclick=()=>{if(confirm("¿Borrar la hoja del tema?")){pintar(null);guardar()}};
  if(btn("temaImprimir"))btn("temaImprimir").onclick=imprimir;
  // la hoja impresa (como la «Topic Form — Grade 4» de Trinity: título en el medio y los 4 puntos alrededor)
  function imprimir(){
    const f=leer();
    if(!temaCompleto(f)){toast("Completá el título y los 4 puntos para imprimir la hoja.");return}
    const w=window.open("","_blank");
    if(!w){toast("El navegador no dejó abrir la hoja: permití las ventanas emergentes de este sitio y probá de nuevo.");return}
    const caja=i=>`<div class="c"><small>${TIPOS[f.p[i][1]].ico} ${esc(TIPOS[f.p[i][1]].nom)}</small><p>${esc(f.p[i][0].trim())}</p></div>`;
    w.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Topic Form — Grade 4</title><style>
      @page{size:A4;margin:14mm}body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0}
      h1{font-size:18px;margin:0 0 2px}h2{font-size:13px;font-weight:400;margin:0 0 14px;color:#555}
      .t{border:3px solid #6d3fc4;border-radius:16px;padding:14px;text-align:center;margin:0 auto 14px;max-width:420px}
      .t small{display:block;letter-spacing:.1em;text-transform:uppercase;color:#6d3fc4;font-size:11px}.t b{font-size:24px}
      .g{display:grid;grid-template-columns:1fr 1fr;gap:12px}.c{border:2px solid #bbb;border-radius:14px;padding:12px;min-height:130px}
      .c small{color:#6d3fc4;font-weight:700;font-size:11px}.c p{font-size:18px;margin:8px 0 0}
      .n{margin-top:18px;font-size:13px;color:#444;display:flex;justify-content:space-between;gap:20px}.n span{flex:1;border-bottom:1px solid #999;padding-bottom:2px}
      .f{margin-top:16px;font-size:12px;color:#666}
    </style></head><body>
      <h1>Graded Examinations in Spoken English</h1><h2>Topic Form — Grade 4</h2>
      <div class="t"><small>Title of topic</small><b>${esc(f.t.trim())}</b></div>
      <div class="g">${caja(0)}${caja(1)}${caja(2)}${caja(3)}</div>
      <div class="n"><span>Name: ${esc(MOD.nombre)}</span><span>Date:</span></div>
      <p class="f">Four discussion points. Use some language of the grade: past events · future plans · comparisons · likes and dislikes · frequency and manner.</p>
    </body></html>`);
    w.document.close();w.focus();setTimeout(()=>{try{w.print()}catch(e){}},400);
  }
  // cómo se practica (la pestaña Examen siempre hace el examen completo)
  const sm=$("g4modo"),sa=$("g4area");
  if(sa)sa.innerHTML='<option value="azar">Dos temas al azar</option>'+AREAS_KEYS.map(k=>`<option value="${k}">${AREAS4[k].ico} ${AREAS4[k].es}</option>`).join("");
  try{const g=JSON.parse(localStorage.getItem(MODO_KEY)||"null");if(g){if(sm&&["completo","tema","conv"].includes(g.modo))sm.value=g.modo;if(sa&&(g.area==="azar"||AREAS4[g.area]))sa.value=g.area}}catch(e){}
  const modoVisible=()=>{if(sa)sa.closest("label").hidden=!sm||sm.value==="tema"};
  const guardarModo=()=>{try{localStorage.setItem(MODO_KEY,JSON.stringify(modoLeer()))}catch(e){}modoVisible()};
  if(sm)sm.onchange=guardarModo;if(sa)sa.onchange=guardarModo;modoVisible();
})();

// ======== Herramienta para generar los audios (no la usa la página): todas las frases que puede decir el examinador de siempre. Ver tools/audio/. ========
window.rkTextosGuion=function(){
  const out=new Set(),add=t=>{t=String(t||"").replace(/\s+/g," ").trim();if(t&&/[a-z]/i.test(t))out.add(t)};
  const muestras=["","fine thank you","no","yes i do","here you are","my best birthday","i went to the beach","i'm going to play","i like swimming","it is bigger than","i play twice a week","do you like football","do you like music","have you ever been there","what is your favourite colour","how old are you","what is your name","where do you live","when did you start","who went with you","why do you like it","are you going to go","hello","i'm tired","not bad","and you","how are you"];
  const reacciones=s=>{if(!s.react)return;for(let n=0;n<14;n++)muestras.forEach(m=>{try{const x=s.react(m);if(typeof x==="string")add(x)}catch(e){}})};
  const paso=(s,nivel)=>{add((s.intro||"")+s.q);add("Good try! You can say: "+s.a+" Now you try.");(s.hints||[]).forEach(h=>add(h.en));reacciones(s);
    if(nivel<2)seguidas(s).forEach(f=>paso(f("x"),nivel+1))};
  SALUDOS4.forEach(add);paso(SALUDO4,0);
  FORMA4.concat(TITULO4,PREG4,CONV4,[CLOSE4]).forEach(s=>paso(s,0));
  PREGUNTAS_MUESTRA.forEach(q=>{for(let n=0;n<14;n++)add(reaccionPregunta(q))});TRIST.forEach(add);
  Object.keys(TIPOS).forEach(k=>{const T=TIPOS[k];T.preg.forEach(v=>paso({intro:v.intro,q:v.q,a:T.a,hints:T.hints,react:T.react,follow:T.seg.map(s=>()=>s)},0))});
  AREAS_KEYS.forEach(a=>[0,1].forEach(pos=>[true,false].forEach(ht=>add(pasoAbre(a,pos,ht).q))));
  CLOSE_Q4.concat(REPITE,NO_OIGO,SIGAMOS,GEN).forEach(add);
  return [...out];
};
