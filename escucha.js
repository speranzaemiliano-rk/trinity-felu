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
// todas las frases sueltas que puede decir (para grabar los audios); los pasos (ELICITAR y ESC_SEG) los recorre rkTextosGuion de cada módulo
function escuchaFrases(){
  const o=[];ESC_TEMAS.forEach(x=>{x.r.forEach(s=>o.push(s));if(x.rec)o.push(x.rec)});
  [ESC_TRIST,ESC_NO,ESC_NOSE,ESC_POS,ESC_RICA,ESC_NEUTRO].forEach(l=>l.forEach(s=>o.push(s)));return o;
}
