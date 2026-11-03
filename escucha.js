// El examinador ESCUCHA. Es el «cerebro» del guion grabado (en iPhone con manos libres es el único examinador): en vez de contestar siempre lo mismo, mira QUÉ se dijo
// y elige entre frases ya grabadas.
//  · Reacciona a lo que se contó: un animal, un deporte, una comida, un lugar…; algo triste («Oh, I'm sorry to hear that.»); un «no sé»; una respuesta larga.
//  · Repregunta con criterio: no pregunta lo que ya se dijo, pide más si la respuesta fue cortita y no insiste si fue larga.
//  · Se interesa: si se menciona algo («I have a dog») pregunta por eso («What's your dog's name?»). Las preguntas son de cada módulo, de su nivel (ESC_SEG).
//  · Se acuerda: antes de despedirse nombra de qué se habló («It was nice to hear about your dog.»).
// Se carga después de comun.js y antes del contenido de cada módulo. Todo lo que puede decir está acá o en ESC_SEG de cada módulo, y sale en escuchaFrases() / rkTextosGuion()
// para grabar los audios (tools/audio/). Con la IA (la que inventa las frases) esto no se usa: lo hace la IA, con las indicaciones «LISTEN LIKE A REAL EXAMINER» de su prompt.

// ---- de qué se habló. Orden = prioridad (lo específico antes que lo general). r: reacciones · rec: recuerdo al despedirse · gen: tema muy general (para el recuerdo se prefiere uno específico)
const ESC_TEMAS=[
 {id:"perro",re:/\b(dogs?|puppy|puppies)\b/,r:["Dogs are great pets!","A dog! That's lovely."],rec:"It was nice to hear about your dog."},
 {id:"gato",re:/\b(cats?|kittens?)\b/,r:["Cats are lovely pets!","A cat! That's nice."],rec:"It was nice to hear about your cat."},
 {id:"mascota",re:/\b(pets?|rabbits?|hamsters?|turtles?|parrots?|guinea pigs?)\b/,r:["Pets are great company!","What a nice pet!"],rec:"It was nice to hear about your pet."},
 {id:"futbol",re:/\b(football|soccer)\b/,r:["Football is a great sport!","Football is very popular!"],rec:"It was nice to hear about football."},
 {id:"natacion",re:/\b(swim|swims|swimming|swam)\b/,r:["Swimming is great exercise!","Swimming is a lovely sport!"],rec:"It was nice to hear about swimming."},
 {id:"deporte",re:/\b(tennis|basketball|volleyball|hockey|rugby|gymnastics|karate|judo|skating|cycling|athletics|handball|padel|paddle)\b/,r:["That's a great sport!","Sport is very good for you!"],rec:"It was nice to hear about your sport."},
 {id:"musica",re:/\b(music|guitar|piano|violin|drums|flute|sing|sings|singing|song|songs|singer)\b/,r:["Music is wonderful!","Music is a lovely hobby!"],rec:"It was nice to hear about your music."},
 {id:"dibujo",re:/\b(draw|draws|drawing|drawings|paint|painting)\b/,r:["Drawing is a lovely hobby!","That's a creative hobby!"],rec:"It was nice to hear about your drawings."},
 {id:"lectura",re:/\b(read|reads|reading|book|books|comics?)\b/,r:["Reading is a great hobby!","Books are great!"],rec:"It was nice to hear about your books."},
 {id:"juegos",re:/\b(video ?games?|playstation|xbox|minecraft|roblox|fortnite|nintendo)\b/,r:["Video games can be great fun!","Games can be really fun!"],rec:"It was nice to hear about your games."},
 {id:"peliculas",re:/\b(films?|movies?|cartoons?|cinema|netflix)\b/,r:["Films are fun to watch!","Watching films is great fun!"],rec:"It was nice to hear about films."},
 {id:"pizza",re:/\bpizzas?\b/,r:["Pizza is delicious!","Pizza is a good choice!"],rec:"It was nice to hear about pizza."},
 {id:"pasta",re:/\b(pasta|spaghetti|noodles|ravioli|gnocchi)\b/,r:["Pasta is delicious!","Pasta is a good choice!"],rec:"It was nice to hear about pasta."},
 {id:"helado",re:/\bice ?cream\b/,r:["Ice cream is a lovely treat!","Ice cream is delicious!"],rec:"It was nice to hear about ice cream."},
 {id:"dulces",re:/\b(chocolate|cakes?|biscuits?|cookies?|sweets|candy|alfajor|alfajores)\b/,r:["That sounds like a tasty treat!","That sounds very tasty!"],rec:"It was nice to hear about tasty treats."},
 {id:"fruta",re:/\b(fruits?|apples?|bananas?|strawberr(y|ies)|grapes|pears?|vegetables|salad)\b/,r:["That's very healthy!","Fruit and vegetables are healthy!"],rec:"It was nice to hear about healthy food."},
 {id:"asado",re:/\b(asado|barbecue|bbq|steak|meat|empanadas?|milanesas?|chicken)\b/,r:["That sounds tasty!","That sounds like a good meal!"],rec:"It was nice to hear about your favourite food."},
 {id:"playa",re:/\b(beach|sea|ocean|sand)\b/,r:["The beach is a lovely place!","That sounds relaxing."],rec:"It was nice to hear about the beach."},
 {id:"montana",re:/\b(mountains?|ski|skiing|snow)\b/,r:["The mountains are beautiful!","Snow can be great fun!"],rec:"It was nice to hear about the mountains."},
 {id:"campo",re:/\b(farm|countryside|lake|river|forest|camping|campsite|tent|horses?)\b/,r:["Nature is wonderful!","That sounds like a lovely place!"],rec:"It was nice to hear about nature."},
 {id:"abuelos",re:/\b(grandma|grandmother|grandpa|grandfather|grandparents|nonna|nonno)\b/,r:["Grandparents are very special!","It's lovely to spend time with grandparents."],rec:"It was nice to hear about your grandparents."},
 {id:"cumple",re:/\b(birthday|party|parties|presents?|gifts?|christmas|new year)\b/,r:["Celebrations are always fun!","A party is always fun!"],rec:"It was nice to hear about your celebrations."},
 {id:"viaje",re:/\b(plane|airport|hotel|trip|trips|travel|travelled|traveled|travelling|traveling|holiday|holidays|vacation)\b/,r:["Travelling sounds exciting!","Trips are always interesting!"],rec:"It was nice to hear about your trips."},
 {id:"cocina",re:/\b(cook|cooks|cooking|bake|baking)\b/,r:["Cooking is a useful skill!","Cooking is great fun!"],rec:"It was nice to hear about cooking."},
 {id:"baile",re:/\b(dance|dances|dancing|ballet)\b/,r:["Dancing is great fun!","Dancing is a lovely hobby!"],rec:"It was nice to hear about dancing."},
 {id:"mates",re:/\b(maths?|mathematics)\b/,r:["Maths can be tricky, but it's useful!","Maths is very useful!"],rec:"It was nice to hear about your school subjects.",gen:true},
 {id:"ingles",re:/\benglish\b/,r:["English is a very useful language!","English is great to learn!"],rec:"It was nice to hear about your English.",gen:true},
 {id:"tarea",re:/\bhomework\b/,r:["Homework isn't always fun!","Homework is important."],rec:"It was nice to hear about your school day.",gen:true},
 {id:"verano",re:/\bsummer\b/,r:["Summer is a lovely season!","Summer is great!"],rec:"",gen:true},
 {id:"invierno",re:/\bwinter\b/,r:["Winter can be fun!","Winter can be cosy."],rec:"",gen:true},
 {id:"amigos",re:/\b(friends?|classmates?)\b/,r:["Friends are very important!","It's great to have good friends."],rec:"It was nice to hear about your friends.",gen:true},
 {id:"familia",re:/\b(family|parents|mum|mom|mother|dad|father|brothers?|sisters?|cousins?|aunt|uncle)\b/,r:["Family is very important!","It's nice to be with family."],rec:"It was nice to hear about your family.",gen:true}
];
const ESC_IDX={};ESC_TEMAS.forEach(t=>{ESC_IDX[t.id]=t});
// ---- reacciones por cómo fue la respuesta
const ESC_TRIST=["Oh, I'm sorry to hear that.","Oh dear. I see."];                                   // algo triste: se acompaña, no se festeja
const ESC_NO=["I see. That's OK.","OK, no problem."];                                             // «No.» / «Nothing.»
const ESC_NOSE=["That's OK. Don't worry.","No problem. It's difficult sometimes."];                // «I don't know», español
const ESC_POS=["That's great to hear!","How nice to hear that!"];                                 // algo que gustó mucho
const ESC_RICA=["That's a very good answer!","Very good! You can say a lot.","Excellent! That was a long answer."];   // una respuesta larga
const ESC_NEUTRO=["I see.","OK, thank you.","Thank you."];                                      // no contestó lo que se preguntaba: nada de festejar «la pregunta» (ya tienen audio: son de GEN)
// ---- cuando la respuesta fue cortita y no hay una repregunta mejor: pedir un poco más (sin pedir razones: eso es de grados más altos)
const ELICITAR=[
 {q:"Can you tell me a little more?",a:"Yes. I like it a lot and I do it with my friends.",need:[],hints:[H("puedo contarte más","I can tell you more"),H("me gusta mucho","I like it a lot"),H("con mis amigos","with my friends")],react:R()},
 {q:"Oh, really? What else can you tell me?",a:"I can also tell you that it is very fun.",need:[],hints:[H("también","also"),H("es muy divertido","it is very fun"),H("te cuento","I can tell you")],react:R()},
 {q:"I see. Tell me more, please.",a:"It is a big part of my week and I enjoy it.",need:[],hints:[H("es parte de mi semana","it is a part of my week"),H("lo disfruto","I enjoy it"),H("todas las semanas","every week")],react:R()}
];

// ---- cómo se reconoce lo que se dijo (sobre el texto en minúsculas y sin puntuación que le llega al paso)
const ESC_NEG=/\b(don'?t|doesn'?t|didn'?t|do not|does not|did not|never|hate|hates|hated|dislike|can'?t|cannot|afraid|scared|allergic|boring|bored|not|no)\b/;
const ESC_TRISTE=/\b(sad|cried|cry|crying|died|dead|sick|ill|hurt|broke|broken|accident|angry|scared|afraid|upset|worried|terrible|awful)\b/;
const ESC_RE_NOSE=/\b(i don'?t know|dont know|i do not know|no idea|i don'?t understand|i can'?t say|no s[eé])\b/;
const ESC_ESP=/[ñáéíóúü¿¡]|\b(yo|tengo|vivo|soy|estoy|casa|colegio|escuela|mam[aá]|pap[aá]|hermano|hermana|gracias|hola|perro|gato|muy|tambi[eé]n|porque|cuando|donde|qu[eé]|c[oó]mo|mi|mis|por|para|los|las|una|el|que|es)\b/i;
function escuchaAnalizar(low){
  const t=String(low||"").toLowerCase().replace(/[’`]/g,"'").replace(/[.,!?¿¡;:]+/g," ").replace(/\bhot ?dogs?\b/g," ").replace(/\s+/g," ").trim();
  const n=t?t.split(" ").length:0,neg=ESC_NEG.test(t),triste=ESC_TRISTE.test(t);
  return {t,n,neg,triste,nose:ESC_RE_NOSE.test(t),espanol:ESC_ESP.test(t)&&n<=8,no:n<=5&&/^(no|nope|not really|none|nothing)\b/.test(t),
    pos:/\b(love|loved|amazing|fantastic|wonderful|awesome|great|fun|funny|favou?rite|enjoy|enjoyed|happy)\b/.test(t),
    corta:n<=3,rica:n>=14||(n>=10&&/\b(and|but|because|then|so|when|while)\b/.test(t)),
    temas:(neg||triste)?[]:ESC_TEMAS.filter(x=>x.re.test(t)).map(x=>x.id)};   // si dice «no me gusta…» o algo triste no se festeja el tema
}
// lo que se va acordando durante UNA charla
function escuchaNueva(){return {n:0,temas:{},rx:{},interes:0,ultInteres:-9,elic:0,ultElic:-9}}
function escuchaRecordar(mem,an){if(!mem||!an)return;an.temas.forEach(id=>{mem.temas[id]=(mem.temas[id]||0)+1})}
// Reacción a lo que se dijo, o null si no hay nada mejor que la de siempre del paso. Sólo toca los pasos con reacción «genérica» (R(...)): el saludo, el nombre,
// la respuesta a la pregunta de quien rinde y la despedida tienen la suya.
function escuchaReaccion(step,low,an,mem,flojo){
  if(!step||typeof step.react!=="function"||!step.react.generica||step.last||step.solo)return null;
  an=an||escuchaAnalizar(low);mem=mem||escuchaNueva();
  if(an.triste)return _reac(ESC_TRIST);
  if(an.nose||an.espanol)return _reac(ESC_NOSE);
  if(an.no)return _reac(ESC_NO);
  if(an.temas.length&&Math.random()<.85){
    const id=an.temas.find(x=>!mem.rx[x]);
    if(id){mem.rx[id]=1;return _reac(ESC_IDX[id].r)}
  }
  if(an.pos&&Math.random()<.5)return _reac(ESC_POS);
  if(an.rica&&Math.random()<.6)return _reac(ESC_RICA);
  if(flojo)return _reac(ESC_NEUTRO);   // no contestó lo que se preguntaba: la reacción «de la pregunta» («Wow, yummy!») no va con lo que dijo
  return null;
}
// ---- repreguntas
const escuchaEsSiNo=s=>/^\s*(do|does|did|is|are|am|was|were|can|could|will|would|have|has|had)\b/i.test(String(s&&s.q||""));
const escuchaEsDato=s=>/what time|what day|what.s the date|what is the date|how many|how old|how often|how much|how long|how far|what.s your name|when is your birthday|what.s the weather|what season/i.test(String(s&&s.q||""));
function escuchaYaDicho(o,t){   // la repregunta pide algo que la respuesta ya trajo (ESC_YA, de cada módulo: pregunta → qué palabras lo muestran)
  const re=(o&&o.ya)||(typeof ESC_YA!=="undefined"&&ESC_YA?ESC_YA[o.q]:null);
  return !!(re&&re.test(t));
}
function escuchaInteres(an,mem,preguntadas,flojo){   // algo que se mencionó y por lo que el examinador se interesa (máx. 2 por charla, no seguidas)
  if(flojo||!mem||mem.interes>=2||mem.n-mem.ultInteres<3||typeof ESC_SEG==="undefined")return null;
  for(const id of an.temas){
    const lista=(ESC_SEG[id]||[]).filter(o=>!preguntadas.has(_audioKey(o.q))&&!escuchaYaDicho(o,an.t));
    if(lista.length)return pick(lista);
  }
  return null;
}
// La repregunta de un paso: a veces (no siempre) y según lo que se dijo. ctx: {an, mem, flojo} (flojo = le costó contestar: no se insiste).
// Sólo las preguntas «de contenido» (las que el módulo marca con escucha:true: el banco de preguntas y los puntos del tema) se interesan, piden más o no insisten;
// el saludo, el título del tema, la despedida, los dibujos… siguen como siempre (sólo se saltea lo que ya se contestó).
function elegirSeguida(step,low,preguntadas,ctx){
  ctx=ctx||{};const an=ctx.an||escuchaAnalizar(low),mem=ctx.mem||null,flojo=!!ctx.flojo,activo=!!(step&&step.escucha&&mem);
  let objs=seguidas(step).map(f=>{try{return f(low)}catch(e){return null}}).filter(o=>o&&o.q&&!preguntadas.has(_audioKey(o.q))&&!escuchaYaDicho(o,an.t));
  if(activo&&!an.no&&!an.nose&&!an.triste&&!an.espanol){
    const it=escuchaInteres(an,mem,preguntadas,flojo);
    if(it&&Math.random()<.8){mem.interes++;mem.ultInteres=mem.n;return it}
  }
  let p=PROB_REPREGUNTA;
  if(activo){
    if(an.no||an.nose||an.triste||an.espanol||flojo)p=0;               // no se apila nada sobre quien no pudo o no quiso contestar
    else if(an.rica)p=.2;                                              // contó mucho: se sigue con lo próximo
    else if(an.corta&&!escuchaEsSiNo(step)&&!escuchaEsDato(step)&&mem.elic<3&&mem.n-mem.ultElic>=2){
      p=1;                                                             // contestó cortito una pregunta abierta: se le pide un poco más
      if(!objs.length){const e=ELICITAR.filter(o=>!preguntadas.has(_audioKey(o.q)));if(e.length){objs=e;mem.elic++;mem.ultElic=mem.n}}
    }
  }
  if(!objs.length||Math.random()>=p)return null;
  const V=vistasLeer(),n=V._n||1,o=elegirNuevo(objs,claveP,V,n);
  V[claveP(o)]=n;vistasGuardar(V);return o;
}
// Antes de la despedida: de qué se habló (el tema más específico que más salió), o «» si no hubo con qué
function escuchaRecuerdo(mem){
  if(!mem||mem.n<4)return "";
  const c=Object.keys(mem.temas).filter(id=>ESC_IDX[id]&&ESC_IDX[id].rec).sort((a,b)=>((ESC_IDX[b].gen?0:100)+mem.temas[b])-((ESC_IDX[a].gen?0:100)+mem.temas[a]));
  return c.length&&Math.random()<.85?ESC_IDX[c[0]].rec:"";
}
// El examinador contesta la pregunta de quien rinde con una frase corta que NO contradice lo que se preguntó. El tema es libre, así que no se mira
// DE QUÉ trata la pregunta sino CÓMO empieza: «Did you…?» → «Yes, I did.»; «Where…?», «How often…?» → un dato general que sirve para cualquier tema.
const _SUJ={you:"I",i:"you",he:"he",she:"she",it:"it",they:"they",we:"we",there:"there",this:"it",that:"it"};
const _ELLA=/^(mum|mom|mother|sister|grandma|grandmother|aunt|wife|daughter)$/,_EL=/^(dad|father|brother|grandpa|grandfather|uncle|husband|son)$/,_ADJ=/^(best|new|old|little|big|small|favou?rite|first|last|next|other|good|great)$/;
function reaccionPregunta(t){
  const x0=String(t||"").toLowerCase();
  if(/^\s*(no|nope|not now|no thanks?|no thank you|no question)\b/.test(x0)&&!/\?/.test(x0))return pick(SIGAMOS);   // «No, gracias»: no tiene una pregunta, se sigue
  const x=x0.replace(/[’`]/g,"'").replace(/\b(what|where|who|how|when|which)'?s\b/g,"$1 is").replace(/[^a-z' ]+/g," ").replace(/\s+/g," ").trim();
  if(/^(and you|(what|how) about you)$/.test(x))return pick(ESC_GRACIAS);   // «And you?» / «What about you?» solos
  // la pregunta es la última que aparece (puede venir después de un «yes, I do»): se busca dónde empieza
  const ultimo=re=>{let m,u=-1;while((m=re.exec(x)))u=m.index;return u};
  const iw=ultimo(/\b(what|where|when|who|whose|why|how|which)\b/g),ia=ultimo(/\b(do|does|did|is|are|am|was|were|can|could|will|would|have|has|should) (you|he|she|it|they|we|there|this|that|i|your|the|my|a|an)\b/g);
  const u=(iw>=0&&(ia<0||ia<iw||x.slice(iw,ia).split(" ").length<=4))?iw:ia;
  if(u<0&&/\b(and you|what about you|how about you)\b/.test(x))return pick(ESC_GRACIAS);   // «…And you?»
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
const PREGUNTAS_MUESTRA=["Do you like football?","Do you like dogs or cats?","Do you play the guitar?","Does your mum like football?","Do they play football?","Did you go on holiday last summer?","Did he win?","Are you going to travel this year?","Are you tall?","Are they friends?","Is it big?","Is your dog big?","Is there a park?","Was it fun?","Were you there?","Can you swim?","Can I ask you something?","Will you come?","Would you like to play?","Have you ever been to the beach?","Has it got a pool?","What is your name?","How old are you?","What is your favourite colour?","What is your favourite sport?","What do you like doing?","What did you do last weekend?","What did you eat yesterday?","What did you play?","What did you watch?","What did you buy?","What did you cook?","What are you going to do?","What time do you get up?","What do you do at the weekend?","What music do you like?","What food do you like?","What subject do you like?","What animal do you like?","What film do you like?","What season do you like?","What day do you like?","What place do you like?","What is your birthday?","What is that?","Where do you live?","Where are you from?","Where did you go?","Where did you celebrate your birthday?","Where are you going to go?","Where do you play?","When did you start?","When is your birthday?","When are you going to go?","When do you play?","When was it?","Who is your favourite player?","Who did you go with?","Who is that?","Why do you like it?","Which team do you like?","How often do you play?","How many friends do you have?","How much does it cost?","How much do you like it?","How long did it take?","How well do you play?","How are you?","How was your holiday?","How is your dog?","How did you go?","How do you go to school?","How do you play?","And you?","What about you?","No, thank you.","Pipa?"];

// ---- ¿Le hicieron una pregunta al examinador? (en cualquier momento, no sólo cuando él lo pide)
// Una pregunta siempre ARRANCA una cláusula («Do you…?», «What is…?», «Sorry, can I…?»); un auxiliar en medio de una frase NO es una pregunta
// («I have a dog», «it is a house», «my mum has a car», «when it is hot»). Por eso se miran las cláusulas (cortadas por . ? ! , ; :) y la pregunta tiene que
// arrancar una. Ante la duda NO se toma por pregunta: equivocarse acá es que el examinador conteste algo que nadie le preguntó.
const ESC_VUELTA=["Now, back to my question.","OK. Now it's your turn to answer."];                    // después de contestarle algo que no era la respuesta: se vuelve a la pregunta
const ESC_GRACIAS=["Thank you for asking!","That's kind of you to ask!"];                          // «…and you?»
const ESC_FILLER=/^(yes|yeah|yep|no|nope|ok|okay|well|um|uh|hmm|mm|sorry|please|and|so|but|then|now|thank|thanks|you|excuse|me|teacher|sir|miss|mister|mr|mrs|ms|examiner|madam)$/;   // lo que puede ir antes de una pregunta sin ser una respuesta
const ESC_SALTAR=/^(yes|yeah|yep|no|nope|ok|okay|well|um|uh|hmm|mm|sorry|please|and|so|but|then|now|excuse|me|teacher|sir|miss|mister|mr|mrs|ms|examiner|madam)$/;
const ESC_AUX=/^(?:(?:do|does|did|is|are|was|were|could|would|have|has|should)(?:n't)?|am|can(?:'t)?|will|won't)$/,ESC_WH=/^(what|where|when|who|whose|why|how|which)$/;
const ESC_ACLARAR=/\b(repeat|again|slowly|don'?t understand|do not understand|what do you mean|what does that mean|say that)\b|^\W*(pardon|excuse me|sorry|what|eh|huh)\W*$/;   // pedir que repita no es una pregunta para el examinador
const ESC_FORMULA=/\b(how are you|how old are you|what is your name|where are you from|where do you live|do you (?:like|have|play|live|speak|want) )/;   // las que se dicen de corrido aunque el dictado no ponga puntos: «I'm fine how are you»
// ¿una pregunta arranca en la palabra s de la cláusula c? (cq: la cláusula terminaba en «?»). Con «?» alcanza con que arranque con una palabra de pregunta o un auxiliar
// («Who cooks pasta?», «Is maths difficult?»); sin «?» (dictado) se pide la forma completa, y «do my homework» o «have a nice day» —respuestas cortas— no cuentan.
function _escEsPregunta(c,s,cq){
  const w=c[s]||"",w1=c[s+1]||"",largo=c.length-s>=3;
  if(ESC_WH.test(w)){   // palabra de pregunta + (algún sustantivo) + auxiliar: «what is…», «what time do…», «what kind of music do…»; «when it is hot» o «where we went» no
    for(let k=1;k<=5&&s+k<c.length;k++){
      if(ESC_AUX.test(c[s+k]))return true;
      if(/^(i|we|they|he|she|it|you|my|your|his|her|our|their|the|a|an|this|that|there)$/.test(c[s+k]))break}
    return cq&&largo}   // sin auxiliar pero con «?»: «What day comes after Wednesday?», «Who cooks it?» (sin «?», «when it is hot» o «where we went» no son preguntas)
  if(ESC_AUX.test(w)){
    if(cq&&largo)return true;                                                           // «Is maths difficult for you?»
    if(/^(do|does|did)(n't)?$/.test(w))return /^(you|he|she|they|we|there)$/.test(w1);   // «do my homework», «do the dishes» son respuestas, no preguntas
    if(/^(have|has)(n't)?$/.test(w))return /^(you|he|she|it|they|we|there)$/.test(w1);   // «have a dog» (tener) tampoco
    return /^(you|he|she|it|they|we|there|this|that|your|the|my|a|an|i|his|her|our|their)$/.test(w1)}
  return false;
}
function escuchaPregunta(raw){   // → {pregunta: ¿hay una pregunta para el examinador?, solo: ¿es TODO lo que dijo? (no contestó lo que se le preguntó), q: la pregunta}
  const NO={pregunta:false,solo:false,q:""};
  const t=String(raw||"").toLowerCase().replace(/[’`]/g,"'").replace(/\b(what|where|who|how|when|which)'s\b/g,"$1 is").trim();
  if(!t||ESC_ACLARAR.test(t))return NO;
  const partes=t.split(/([.?!,;:\n]+)/),cl=[];   // cláusulas, cada una con sus palabras y si terminaba en «?»
  for(let i=0;i<partes.length;i+=2){const ws=partes[i].replace(/[^a-z' ]+/g," ").split(/\s+/).filter(Boolean);if(ws.length)cl.push({w:ws,q:/\?/.test(partes[i+1]||"")})}
  let hay=null;
  cl.forEach((k,ci)=>{
    const c=k.w;let s=0;const salt=()=>{while(s<c.length&&ESC_SALTAR.test(c[s]))s++};
    salt();if(/^thanks?$/.test(c[s]||"")){s+=c[s+1]==="you"?2:1;salt()}
    const ult=c.slice(-3).join(" "),ult2=c.slice(-2).join(" ");
    if(s<c.length&&_escEsPregunta(c,s,k.q))hay={ci,s};
    else if(/^(what|how) about you$/.test(ult))hay={ci,s:c.length-3};                    // «…What about you?»
    else if(ult2==="and you"&&c.length>=2)hay={ci,s:c.length-2};                        // «…And you?»
    else{const m=ESC_FORMULA.exec(c.join(" "));if(m){const n=c.join(" ").slice(0,m.index).split(" ").filter(Boolean).length;if(n>=1)hay={ci,s:n}}}   // «I'm fine how are you»
  });
  if(!hay)return NO;
  const prev=[];for(let i=0;i<hay.ci;i++)prev.push(...cl[i].w);prev.push(...cl[hay.ci].w.slice(0,hay.s));
  const despues=cl.slice(hay.ci+1).reduce((n,k)=>n+k.w.length,0);
  return {pregunta:true,solo:prev.every(w=>ESC_FILLER.test(w))&&despues<4,q:cl[hay.ci].w.slice(hay.s).concat(...cl.slice(hay.ci+1).map(k=>k.w)).join(" ")};
}
// ¿Lo que se dijo parece una frase CORTADA a la mitad? (termina en una palabra que pide otra: «and», «with my», «because», «I'm»…, en una coma, en «…» o en un «um»).
// Sirve para esperar un poco más antes de dar la respuesta por terminada: quien arma la frase en inglés hace pausas para buscar una palabra y no tiene que quedar cortado.
// Hay palabras que no pueden cerrar una frase (siempre piden otra: «the», «in», «I'm», «it's») y otras que sí («Come on.», «It's Felu's.», «I like her.», «Yes, I am.»): esas sólo
// cuentan si no cerró con punto. Una pregunta cerrada con «?» está completa, las cifras cuentan como palabra («I'm 10.») y hay frases hechas que terminan en una palabra «floja»
// («here you are», «so do I»). La IA a veces le pone punto a una frase cortada: por eso las palabras que nunca cierran valen aunque haya punto.
const ESC_COLGADA=/^(and|but|or|because|if|when|while|than|the|a|an|my|your|our|their|of|with|for|from|in|at|by|about|as|um|uh|uhm|er|eh|ehh|mm|hmm)$|'(m|re|ve|ll|d)$|^(it|he|she|that|there|what|who|here|let|how|where)'s$|(^|\s)name's$/;   // no cierran una frase ni con punto
const ESC_COLGADA_FLOJA=/^(to|on|his|her|also|very|i|like|is|are|am|was|were|have|has|had)$|'s$|n't$/;   // sólo si no cerró con punto
const ESC_CIERRA_RESPUESTA=/^(is|are|am|was|were|have|has|had)$|n't$/;   // «Yes, it is» · «No, I don't»: una respuesta corta que termina así está completa…
const ESC_PRONOMBRE=/^(i|you|he|she|it|we|they|there|that|this)$/;        // …si lo anterior es un pronombre («Yes, I am»; no «No, my brother is»)
const ESC_FRASE_HECHA=/(^|\s)(here you are|here it is|here they are|come on|you too|me too|me neither|so (do|am|can|did|have|will) i|neither (do|am|can|did|have) i)$/;
const ESC_PREGUNTA_WH=/^(what|where|who|whom|which|how|why)\b.*\b(do|does|did|is|are|am|was|were|can|could|will|would)\s+(you|he|she|it|they|we|i)\b/;   // «Where are you from», «What food do you like» (sin «?», como lo escribe el dictado)
const ESC_MEDIAS=/^(i|we|they|you|he|she)\s+(want|wants|wanted|need|needs|needed|love|loves|loved|went|think|thinks|live|lives|study|studies|visit|visits|visited|play|plays|played|go|goes|eat|eats|ate|watch|watches|watched)$|^(he|she|they|we|i|it)$|^(my|his|her|your|our|their)\s+(name|favou?rite(\s+\w+)?)$|^because\s+(it|i|he|she|we|they|you|my|the|a)$/;   // frases que no se sostienen solas
function escuchaIncompleta(t){
  t=String(t||"").trim();if(!t)return false;
  if(/\?["')\]]*\s*$/.test(t))return false;                           // una pregunta cerrada
  if(/(,|…|\.\.\.|–|—|-|:)\s*$/.test(t))return true;                  // se quedó en una coma, en puntos suspensivos o en un guion
  const fin=/[.!]["')\]]*\s*$/.test(t),ws=t.toLowerCase().replace(/[’`]/g,"'").replace(/[^a-z0-9' ]+/g," ").split(/\s+/).filter(Boolean),u=ws[ws.length-1]||"",ant=ws[ws.length-2]||"",sola=ws.join(" ");
  if(!u)return false;
  if(ESC_MEDIAS.test(sola))return true;
  if(ESC_FRASE_HECHA.test(sola))return false;
  const pideMas=ESC_COLGADA.test(u),floja=ESC_COLGADA_FLOJA.test(u);
  if(!pideMas&&!floja)return false;
  if(ESC_PREGUNTA_WH.test(sola)&&!/^(and|but|or|because|if|when|while|than|the|a|an|my|your|our|their|of|um|uh|uhm|er|eh|ehh|mm|hmm)$/.test(u))return false;   // una pregunta suya que termina en «from», «with», «like»…
  if(pideMas)return true;
  if(fin)return false;
  if(/^(yes|yeah|yep|no|nope)$/.test(ws[0])&&ESC_CIERRA_RESPUESTA.test(u)&&ESC_PRONOMBRE.test(ant))return false;
  return true;
}
function escuchaResponder(raw){const e=escuchaPregunta(raw);return e.pregunta?reaccionPregunta(e.q):null}   // lo que contesta el examinador, o null si no le preguntaron nada

// todas las frases sueltas que puede decir (para grabar los audios); los pasos (ELICITAR y ESC_SEG) los recorre rkTextosGuion de cada módulo
function escuchaFrases(){
  const o=[];ESC_TEMAS.forEach(x=>{x.r.forEach(s=>o.push(s));if(x.rec)o.push(x.rec)});
  [ESC_TRIST,ESC_NO,ESC_NOSE,ESC_POS,ESC_RICA,ESC_NEUTRO,ESC_VUELTA,ESC_GRACIAS].forEach(l=>l.forEach(s=>o.push(s)));
  PREGUNTAS_MUESTRA.forEach(q=>{for(let n=0;n<14;n++)o.push(reaccionPregunta(q))});   // todo lo que puede contestar cuando le hacen una pregunta
  return o;
}
