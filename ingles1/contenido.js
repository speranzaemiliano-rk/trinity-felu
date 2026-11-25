// «English · 1.er grado»: contenido (sólo datos y frases; la lógica está en app.js y oral.js).
// Pensado para un chico de 1.er grado (6-7 años) que está empezando a leer: todo se muestra con dibujos y se dice con VOZ. Los temas siguen la lista que pasó la familia
// (partes del cuerpo, números, días, alfabeto, meses, fecha, edad, colores, útiles del aula, saludos y rutinas, y las estructuras to be, I like / I don't like,
// This is a… / It's a… y My name is…) y están chequeados contra el programa de inglés de 1.er grado de la Ciudad de Buenos Aires (ver el README). Las palabras, los dibujos y las frases son propios.
// «extra:true» = palabras que quizás todavía no se vieron en la escuela: sólo se usan si en Ajustes (para grandes) se prende «Más palabras».
(function(){
"use strict";
const I1=window.I1=window.I1||{};
const slug=t=>String(t).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
const AUD={};   // clave → lo que dice la voz (las claves son los nombres de los mp3 de ingles1/audio/ cuando existan; mientras no, habla el aparato)
const K=t=>{const k="en_"+slug(t);if(!(k in AUD))AUD[k]=t;return k};   // (la clave no distingue mayúsculas ni signos: «Hello», «Hello.» y «Hello!» son el mismo audio; vale el primer texto que se registró)
I1.K=K;I1.slug=slug;I1.audio=AUD;

// ---------------- los temas
const em=e=>({e}),col=c=>({c}),svg=s=>({svg:s}),num=n=>({n});
function it(id,en,es,p,o){const x=Object.assign({id,en,es,p},o||{});x.say=x.say||en;x.k=K(x.say);return x}

// ·· saludos y rutinas del aula
const SALUDOS=[
  it("hello","Hello","Hola",em("🙂👋")),
  it("hi","Hi","Hola",em("🙋"),{extra:true}),
  it("goodbye","Goodbye","Chau",em("👋🚪")),
  it("bye","Bye","Chau",em("🤚"),{extra:true}),
  it("morning","Good morning","Buen día",em("🌅")),
  it("afternoon","Good afternoon","Buenas tardes",em("☀️"),{extra:true}),
  it("sit","Sit down","Sentate",em("💺")),
  it("stand","Stand up","Ponete de pie",em("🧍")),
  it("open","Open your book","Abrí tu libro",em("📖")),
  it("close","Close your book","Cerrá tu libro",em("📕")),
  it("listen","Listen","Escuchá",em("👂"),{extra:true}),
  it("look","Look","Mirá",em("👀"),{extra:true}),
  it("quiet","Be quiet","Silencio",em("🤫"),{extra:true}),
  it("thanks","Thank you","Gracias",em("🙏"),{extra:true})];

// ·· cuerpo (la lista que pasó la familia). «parte» es la zona del dibujo del muñeco que se toca.
const CUERPO=[
  it("head","head","cabeza",{svg:"parte:head"},{parte:"head"}),
  it("eyes","eyes","ojos",{svg:"parte:eyes"},{parte:"eyes"}),
  it("nose","nose","nariz",{svg:"parte:nose"},{parte:"nose"}),
  it("mouth","mouth","boca",{svg:"parte:mouth"},{parte:"mouth"}),
  it("ears","ears","orejas",{svg:"parte:ears"},{parte:"ears"}),
  it("hands","hands","manos",{svg:"parte:hands"},{parte:"hands"}),
  it("arms","arms","brazos",{svg:"parte:arms"},{parte:"arms"}),
  it("legs","legs","piernas",{svg:"parte:legs"},{parte:"legs"}),
  it("feet","feet","pies",{svg:"parte:feet"},{parte:"feet"}),
  it("fingers","fingers","dedos",{svg:"parte:fingers"},{parte:"fingers"}),
  it("toes","toes","deditos de los pies",{svg:"parte:toes"},{parte:"toes"}),
  it("body","body","cuerpo",{svg:"parte:body"},{parte:"body"})];

// ·· números
const NUM_EN=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
const NUM_ES=["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte"];
const NUMEROS=[];for(let n=1;n<=20;n++)NUMEROS.push(it("n"+n,NUM_EN[n],NUM_ES[n],num(n),{n,extra:n>10}));

// ·· días
const DIAS_EN=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],DIAS_ES=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
const DIAS=DIAS_EN.map((d,i)=>it("d"+(i+1),d,DIAS_ES[i],{t:d.slice(0,3),dia:i+1},{orden:i+1}));

// ·· meses
const MESES_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
const MESES_ES=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MESES=MESES_EN.map((m,i)=>it("m"+(i+1),m,MESES_ES[i],{t:m.slice(0,3),mes:i+1},{orden:i+1}));

// ·· la fecha: «Today is Monday the 5th.» (los ordinales de 1 a 10; del 11 al 31 son «extra»)
const ORD_EN=["","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth","eleventh","twelfth","thirteenth","fourteenth","fifteenth","sixteenth","seventeenth","eighteenth","nineteenth","twentieth","twenty-first","twenty-second","twenty-third","twenty-fourth","twenty-fifth","twenty-sixth","twenty-seventh","twenty-eighth","twenty-ninth","thirtieth","thirty-first"];
const ordNum=n=>n+(n%100>=11&&n%100<=13?"th":n%10===1?"st":n%10===2?"nd":n%10===3?"rd":"th");
const FECHA=[];for(let n=1;n<=31;n++)FECHA.push(it("o"+n,ordNum(n),"el "+n,{t:ordNum(n)},{n,say:ORD_EN[n],extra:n>10}));

// ·· alfabeto: cómo se dicen las letras en inglés (escritas «a lo fonético» para que la voz las diga bien) y una palabra de ejemplo
const LET_DICE=["ay","bee","see","dee","ee","eff","jee","aitch","eye","jay","kay","el","em","en","oh","pee","cue","ar","ess","tee","you","vee","double you","ex","why","zed"];
const LET_EJ=[["apple","🍎"],["ball","⚽"],["cat","🐱"],["dog","🐶"],["egg","🥚"],["fish","🐟"],["girl","👧"],["hat","🎩"],["ice cream","🍦"],["jacket","🧥"],["key","🔑"],["lion","🦁"],["milk","🥛"],["nose","👃"],["orange","🍊"],["pizza","🍕"],["queen","👸"],["rabbit","🐰"],["sun","☀️"],["tree","🌳"],["umbrella","☂️"],["van","🚐"],["water","💧"],["box","📦"],["yacht","⛵"],["zebra","🦓"]];
const LETRAS=LET_DICE.map((d,i)=>{const L=String.fromCharCode(65+i);return it("l"+L,L,"la "+L,{l:L},{say:d,ej:{en:LET_EJ[i][0],e:LET_EJ[i][1],k:K(LET_EJ[i][0])},orden:i+1})});

// ·· colores
const COLORES=[
  it("red","red","rojo",col("#e53935")),it("blue","blue","azul",col("#1e6fe0")),it("green","green","verde",col("#2e9d4a")),it("yellow","yellow","amarillo",col("#ffd21f")),
  it("orange","orange","naranja",col("#ff8a1f")),it("pink","pink","rosa",col("#ff7eb6")),it("purple","purple","violeta",col("#8a4fd6")),it("black","black","negro",col("#1d1d22")),
  it("white","white","blanco",col("#ffffff")),it("brown","brown","marrón",col("#8a5a3b")),it("grey","grey","gris",col("#9aa0a6"),{extra:true})];

// ·· útiles del aula
const AULA=[
  it("book","book","libro",em("📖")),it("pencil","pencil","lápiz",em("✏️")),it("chair","chair","silla",svg("silla")),it("desk","desk","pupitre",svg("pupitre")),it("board","board","pizarrón",svg("pizarron")),
  it("bag","bag","mochila",em("🎒"),{extra:true}),it("eraser","eraser","goma de borrar",svg("goma"),{extra:true}),it("ruler","ruler","regla",em("📏"),{extra:true}),
  it("crayons","crayons","crayones",em("🖍️"),{extra:true}),it("pen","pen","lapicera",em("🖊️"),{extra:true}),it("scissors","scissors","tijera",em("✂️"),{extra:true}),
  it("notebook","notebook","cuaderno",em("📓"),{extra:true}),it("door","door","puerta",em("🚪"),{extra:true})];

// ·· cosas para «I like / I don't like» y «This is a…» fuera del aula
const GUSTOS=[
  it("pizza","pizza","pizza",em("🍕")),it("icecream","ice cream","helado",em("🍦")),it("apple","apple","manzana",em("🍎")),it("banana","banana","banana",em("🍌")),
  it("milk","milk","leche",em("🥛")),it("fish","fish","pescado",em("🐟")),it("cat","cat","gato",em("🐱")),it("dog","dog","perro",em("🐶")),it("ball","ball","pelota",em("⚽"))];
I1.GUSTOS=GUSTOS;
I1.AMB=[["hello","hi"],["goodbye","bye"],["hello","goodbye"],["pen","pencil"],["pen","crayons"],["book","notebook"],["morning","afternoon"],["listen","look"],["open","close"]];
I1.ambiguos=(a,b)=>I1.AMB.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));

// ---------------- los temas con lo que se practica en cada uno (los generadores están en app.js)
// esc = tipos de preguntas ESCRITAS, ora = tipos de tareas ORALES
const T=(id,ico,nombre,es,color,items,esc,ora,o)=>Object.assign({id,ico,nombre,es,color,items,esc,ora},o||{});
I1.TEMAS=[
  T("saludos","👋","Hello!","Saludos y el aula","#ffd9a8",SALUDOS,["look","listen","es","vf"],["repetir","saludar"]),
  T("cuerpo","🧒","My body","El cuerpo","#ffc9c9",CUERPO,["parte","listen","armar","vf","es"],["nombrar","repetir"],{figura:true}),
  T("numeros","🔢","Numbers","Los números","#cfe3ff",NUMEROS,["look","listen","armar","serie","numpal","contar"],["repetir","nombrar","contar"],{orden:true}),
  T("dias","📅","Days","Los días de la semana","#d5f5e3",DIAS,["listen","armar","serie","ordenar","es"],["repetir","dias","hoy"],{orden:true}),
  T("meses","🗓️","Months","Los meses","#e8dcff",MESES,["listen","armar","serie","ordenar","es"],["repetir","meses"],{orden:true}),
  T("fecha","📆","The date","La fecha","#fff3b0",FECHA,["fecha","ordenar"],["fecha","repetir"],{orden:true}),
  T("abc","🔤","ABC","El alfabeto","#ffe0f0",LETRAS,["letra","serie","ordenar","deletrear"],["letra","repetir"],{orden:true}),
  T("colores","🎨","Colours","Los colores","#ffe3b3",COLORES,["look","listen","armar","vf","unir"],["nombrar","repetir"]),
  T("aula","🎒","My classroom","El aula","#cdeee8",AULA,["look","listen","armar","vf","unir"],["nombrar","repetir","this"]),
  T("yo","🙋","About me","Yo: nombre y edad","#ffd6e7",[],["yo","nombre"],["yo"]),
  T("frases","💬","Sentences","I am… · I like… · This is a…","#dcecff",[],["tobe","gusto","this","armarfrase"],["gusto","this","frase"])
];
I1.ITEM=Object.create(null);I1.TEMAS.forEach(t=>t.items.forEach(x=>{x.tema=t.id;I1.ITEM[x.id]=x}));
I1.TEMA=Object.create(null);I1.TEMAS.forEach(t=>I1.TEMA[t.id]=t);
I1.NUM_EN=NUM_EN;I1.NUM_ES=NUM_ES;I1.ORD_EN=ORD_EN;I1.ordNum=ordNum;I1.DIAS_EN=DIAS_EN;I1.MESES_EN=MESES_EN;I1.LET_DICE=LET_DICE;

// ---------------- patrones de frases (los temas «Yo» y «Sentences» no tienen una lista de palabras: practican estas)
const P=(id,o)=>Object.assign({id},o);
const NOMBRES=["Ana","Tom","Sam","Lia","Max","Eva"];
I1.NOMBRES=NOMBRES;
I1.PAT={
  // verbo to be: se elige am / is / are
  tobe:[P("tb1",{f:"I ___ a boy.",ok:"am",p:em("👦"),es:"Soy un nene."}),P("tb2",{f:"I ___ a girl.",ok:"am",p:em("👧"),es:"Soy una nena."}),P("tb3",{f:"I ___ six years old.",ok:"am",p:em("🎂"),es:"Tengo seis años."}),
    P("tb4",{f:"You ___ my friend.",ok:"are",p:em("🤝"),es:"Vos sos mi amigo."}),P("tb5",{f:"You ___ seven.",ok:"are",p:em("🎂"),es:"Vos tenés siete."}),
    P("tb6",{f:"He ___ a boy.",ok:"is",p:em("👦"),es:"Él es un nene."}),P("tb7",{f:"She ___ a girl.",ok:"is",p:em("👧"),es:"Ella es una nena."}),
    P("tb8",{f:"He ___ my dad.",ok:"is",p:em("👨"),es:"Él es mi papá."}),P("tb9",{f:"She ___ my mum.",ok:"is",p:em("👩"),es:"Ella es mi mamá."}),P("tb10",{f:"It ___ a cat.",ok:"is",p:em("🐱"),es:"Es un gato."})],
  // «Sentences»: ordenar las palabras (se ve el dibujo)
  armarfrase:[P("af1",{f:"I like pizza.",p:em("🍕")}),P("af2",{f:"This is a book.",p:em("📖")}),P("af3",{f:"He is a boy.",p:em("👦")}),P("af4",{f:"She is a girl.",p:em("👧")}),
    P("af5",{f:"I am six.",p:em("🎂")}),P("af6",{f:"It is a cat.",p:em("🐱")}),P("af7",{f:"I like cats.",p:em("🐱")}),P("af8",{f:"This is a pencil.",p:em("✏️")}),P("af9",{f:"Hello, I am Ana.",p:em("🙂👋")}),P("af10",{f:"Today is Monday.",p:em("📅")})],
  // «Yo»: contestar la pregunta que se escucha (se elige la respuesta)
  yo:[P("y1",{q:"What's your name?",ok:"My name is Ana.",mal:["I'm six.","Goodbye.","I'm fine, thank you."],p:em("🏷️"),es:"¿Cómo te llamás?"}),
    P("y2",{q:"How old are you?",ok:"I'm six.",mal:["My name is Tom.","Hello.","I'm fine, thank you."],p:em("🎂"),es:"¿Cuántos años tenés?"}),
    P("y3",{q:"How are you?",ok:"I'm fine, thank you.",mal:["I'm six.","My name is Sam.","Goodbye."],p:em("🙂"),es:"¿Cómo estás?"}),
    P("y4",{q:"Hello!",ok:"Hello!",mal:["Goodbye.","Thank you.","I'm six."],p:em("🙂👋"),es:"¡Hola!"}),
    P("y5",{q:"Goodbye!",ok:"Goodbye!",mal:["Hello.","My name is Eva.","I'm six."],p:em("👋🚪"),es:"¡Chau!"}),
    P("y6",{q:"Good morning!",ok:"Good morning!",mal:["Goodbye.","I'm six.","My name is Max."],p:em("🌅"),es:"¡Buen día!"})],
  // cumpleaños: «I'm ___ years old.» (se cuentan las velitas)
  edad:[5,6,7,8]
};
I1.PAT.todos=[].concat(I1.PAT.tobe,I1.PAT.armarfrase,I1.PAT.yo);
I1.PATID=Object.create(null);I1.PAT.todos.forEach(x=>{I1.PATID[x.id]=x});
I1.PAT.todos.forEach(x=>{[x.f,x.q,x.ok,x.es?null:null].concat(x.mal||[]).filter(Boolean).forEach(t=>K(String(t).replace(/___/g,"")))});
I1.PAT.tobe.forEach(x=>{["am","is","are"].forEach(w=>K(x.f.replace("___",w)))});
["I'm five.","I'm six.","I'm seven.","I'm eight."].forEach(K);

// ---------------- frases fijas (consignas, felicitaciones, preguntas de la parte oral)
// Lo que dice «el profe» al empezar cada tipo de pregunta (en inglés, corto) y la ayuda en castellano que se ve escrita
I1.CONSIGNA={
  look:["Look and choose.","Mirá el dibujo y elegí la palabra."],listen:["Listen and touch.","Escuchá y tocá el dibujo."],es:["What does it mean?","¿Qué quiere decir?"],
  armar:["Look and spell.","Mirá el dibujo y armá la palabra con las letras."],vf:["Yes or no?","¿Es verdad (✔) o no (✘)?"],parte:["Touch the…","Tocá la parte del cuerpo."],
  serie:["What comes next?","¿Qué viene después?"],ordenar:["Put them in order.","Ponelos en orden."],numpal:["Match the number.","Elegí el mismo número."],contar:["Count!","Contá y elegí el número."],
  fecha:["Today is…","Completá la fecha."],letra:["Which letter?","Escuchá y elegí la letra."],deletrear:["Spell it.","Deletreá la palabra con las letras."],unir:["Match.","Uní cada dibujo con su palabra."],
  yo:["About me.","Completá con tus datos."],tobe:["I am, you are, he is.","Elegí: am, is o are."],gusto:["I like… / I don't like…","Mirá el dibujo y elegí la frase."],this:["This is a…","Elegí la frase para el dibujo."],
  nombre:["My name is…","Armá la frase."],armarfrase:["Put the words in order.","Poné las palabras en orden."]};
I1.BIEN=["Great!","Very good!","Super!","Excellent!","Well done!","Good job!","Perfect!"];
I1.PROBA=["Try again!","Let's try again!"];
I1.CASI=["Almost!","Nearly!"];
I1.PREGUNTAS_ORAL=["What's your name?","How old are you?","How are you?","What colour is it?","What is it?","Do you like pizza?","What day is it today?","Count to ten.","Say the days.","Say the months."];
[].concat(I1.BIEN,I1.PROBA,I1.CASI,I1.PREGUNTAS_ORAL,["Listen and repeat.","Say it!","Your turn.","Now you.","Let's play!","Hello! Let's learn English!","I'm fine, thank you.","My name is Ana.","I'm six years old.","Yes, I do.","No, I don't.","This is a pencil.","It's a book.","I like pizza.","I don't like fish.","Today is Monday.","Today is Monday the 5th."]).forEach(K);
Object.keys(I1.CONSIGNA).forEach(k=>K(I1.CONSIGNA[k][0]));
// los patrones de frases (to be, like, this, name) y las preguntas de «Yo» generan sus frases en app.js; I1.frases() las junta con lo que se haya pedido a la voz
I1.frases=()=>Object.keys(AUD).sort().map(k=>({k,tts:AUD[k]}));
})();
