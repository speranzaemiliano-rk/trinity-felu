// «Sala de 5» · contenido: sólo datos y frases (la lógica de los juegos está en juego.js).
// Es para una nena de 5 años que todavía no lee: todo se dice con VOZ GRABADA (español rioplatense e inglés británico) y se muestra con dibujos.
// Todo lo que la app puede decir sale de acá (S5.frases()), así se sabe qué audios grabar (tools/audio/sala5.js). Si se agrega una frase nueva hay que volver a grabar.
(function(){
"use strict";
const S5=window.S5=window.S5||{};
const AUD={};   // clave → {l:'es'|'en', tts:'lo que dice la voz'}
const slug=t=>String(t).toLowerCase().replace(/ñ/g,"ny").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,60);
// A(idioma, texto, clave?) registra una frase con voz y devuelve su clave (= el nombre del mp3 en sala5/audio/)
function A(l,tts,clave){
  let k=l+"_"+(clave||slug(tts));const prev=AUD[k];
  if(prev&&prev.tts!==tts){let i=2;while(AUD[k+"-"+i]&&AUD[k+"-"+i].tts!==tts)i++;k=k+"-"+i}
  AUD[k]={l,tts};return k;
}
S5.A=A;S5.audio=AUD;
S5.frases=()=>Object.keys(AUD).sort().map(k=>({k,l:AUD[k].l,tts:AUD[k].tts}));

// ---------------- números (0 a 20)
const NUM_ES=["cero","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve","diez","once","doce","trece","catorce","quince","dieciséis","diecisiete","dieciocho","diecinueve","veinte"];
const NUM_EN=["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty"];
const numES=n=>A("es",NUM_ES[n],"n"+n),numEN=n=>A("en",NUM_EN[n],"n"+n);
for(let n=0;n<=20;n++){numES(n);numEN(n)}

// ---------------- letras (el nombre de cada una, escrito como suena para que la voz no lo lea como palabra)
const LETRAS="ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");
const NOM_ES={A:"a",B:"be",C:"ce",D:"de",E:"e",F:"efe",G:"ge",H:"hache",I:"i",J:"jota",K:"ka",L:"ele",M:"eme",N:"ene","Ñ":"eñe",O:"o",P:"pe",Q:"cu",R:"erre",S:"ese",T:"te",U:"u",V:"uve",W:"doble ve",X:"equis",Y:"i griega",Z:"zeta"};
const NOM_EN={A:"ay",B:"bee",C:"see",D:"dee",E:"ee",F:"eff",G:"jee",H:"aitch",I:"eye",J:"jay",K:"kay",L:"ell",M:"em",N:"en",O:"oh",P:"pee",Q:"queue",R:"ar",S:"ess",T:"tee",U:"you",V:"vee",W:"double you",X:"ex",Y:"why",Z:"zed"};
const cl=L=>L==="Ñ"?"nn":L.toLowerCase();
const letraES=L=>A("es",NOM_ES[L],"letra-"+cl(L)),tocaLetraES=L=>A("es","Tocá la letra "+NOM_ES[L],"toca-letra-"+cl(L));
const letraEN=L=>A("en",NOM_EN[L],"letter-"+cl(L)),tocaLetraEN=L=>A("en","Touch the letter "+NOM_EN[L],"touch-letter-"+cl(L));
LETRAS.forEach(L=>{letraES(L);tocaLetraES(L);if(NOM_EN[L]){letraEN(L);tocaLetraEN(L)}});

// ---------------- frases sueltas
const ES={
  hola:A("es","¡Hola! ¿A qué querés jugar?"),
  lengua:A("es","Lengua"),mates:A("es","Matemática"),ingles:A("es","English","english-es"),
  retry:A("es","Probá de nuevo"),esEste:A("es","¡Es este!"),
  premio:A("es","¡Terminaste! ¡Ganaste una pegatina!"),albumLleno:A("es","¡Completaste el álbum!"),chau:A("es","¡Hasta pronto!"),
  nombre:A("es","Armá tu nombre"),
  cuantos:A("es","¿Cuántos hay?"),mas:A("es","más"),menos:A("es","menos"),cuantosSon:A("es","¿Cuántos son?"),cuantosQuedan:A("es","¿Cuántos quedan?"),
  masGrupo:A("es","Tocá donde hay más"),menosGrupo:A("es","Tocá donde hay menos"),queFalta:A("es","¿Qué número falta?"),queSigue:A("es","¿Qué sigue?"),
  grande:A("es","Tocá el más grande"),chico:A("es","Tocá el más chico"),mediano:A("es","Tocá el mediano"),
  conQue:A("es","¿Con qué letra empieza?"),silabas:A("es","¿Cuántas sílabas tiene?"),toca:A("es","Tocá"),tocaPalabra:A("es","Tocá la palabra")
};
const CHEERS_ES=["¡Muy bien!","¡Genial!","¡Excelente!","¡Bravo!","¡Lo lograste!"].map(t=>A("es",t));
const CHEERS_EN=["Very good!","Great!","Well done!","Excellent!","Super!"].map(t=>A("en",t));
const EN={retry:A("en","Try again"),esEste:A("en","This one!"),howMany:A("en","How many?")};
const poneCanasta=n=>A("es","Poné "+NUM_ES[n]+" en la canasta");
const tocaNum=n=>A("es","Tocá el "+NUM_ES[n]);
const touchNum=n=>A("en","Touch number "+NUM_EN[n]);
for(let n=1;n<=10;n++){poneCanasta(n);touchNum(n)}
for(let n=1;n<=20;n++)tocaNum(n);

// ---------------- figuras (dibujos SVG; el color lo pone el juego)
const FORMAS={
  circulo:{n:"círculo",art:"el",en:"circle",d:c=>`<circle cx="50" cy="50" r="42" fill="${c}"/>`},
  cuadrado:{n:"cuadrado",art:"el",en:"square",d:c=>`<rect x="10" y="10" width="80" height="80" rx="6" fill="${c}"/>`},
  triangulo:{n:"triángulo",art:"el",en:"triangle",d:c=>`<polygon points="50,8 94,90 6,90" fill="${c}"/>`},
  rectangulo:{n:"rectángulo",art:"el",en:"rectangle",d:c=>`<rect x="5" y="24" width="90" height="52" rx="5" fill="${c}"/>`},
  estrella:{n:"estrella",art:"la",en:"star",d:c=>`<polygon points="50,6 61,38 95,38 67,58 78,92 50,72 22,92 33,58 5,38 39,38" fill="${c}"/>`},
  corazon:{n:"corazón",art:"el",en:"heart",d:c=>`<path d="M50 90 C18 64 6 46 6 31 C6 17 18 8 31 8 C40 8 47 12 50 20 C53 12 60 8 69 8 C82 8 94 17 94 31 C94 46 82 64 50 90 Z" fill="${c}"/>`},
  rombo:{n:"rombo",art:"el",d:c=>`<polygon points="50,5 93,50 50,95 7,50" fill="${c}"/>`},
  ovalo:{n:"óvalo",art:"el",d:c=>`<ellipse cx="50" cy="50" rx="44" ry="28" fill="${c}"/>`}
};
const svg=(f,c)=>`<svg class="fig" viewBox="0 0 100 100" aria-hidden="true">${FORMAS[f].d(c)}</svg>`;
Object.keys(FORMAS).forEach(k=>A("es","Tocá "+FORMAS[k].art+" "+FORMAS[k].n,"toca-"+k));
const tocaForma=k=>A("es","Tocá "+FORMAS[k].art+" "+FORMAS[k].n,"toca-"+k);

// ---------------- colores
const COLORES={red:"#e53935",blue:"#1e88e5",yellow:"#fdd835",green:"#43a047",orange:"#fb8c00",purple:"#8e24aa",pink:"#f06292",black:"#212121",white:"#ffffff",brown:"#6d4c41"};
const punto=c=>`<span class="punto" style="background:${c}" aria-hidden="true"></span>`;

// ---------------- cosas para contar
const OBJ=["🍎","🍓","⭐","🐟","🎈","🚗","🌸","⚽","🐞","🦋","🍪","🧸","🍌","🐥"];

// ---------------- palabras con dibujo (lengua): [palabra, dibujo, artículo, sílabas]
const PAL_RAW=[
 ["avión","✈️","el","a-vión"],["araña","🕷️","la","a-ra-ña"],["abeja","🐝","la","a-be-ja"],["árbol","🌳","el","ár-bol"],["anillo","💍","el","a-ni-llo"],["ardilla","🐿️","la","ar-di-lla"],
 ["elefante","🐘","el","e-le-fan-te"],["escalera","🪜","la","es-ca-le-ra"],["estrella","⭐","la","es-tre-lla"],["escoba","🧹","la","es-co-ba"],
 ["iglesia","⛪","la","i-gle-sia"],["isla","🏝️","la","is-la"],["iguana","🦎","la","i-gua-na"],["imán","🧲","el","i-mán"],
 ["oso","🐻","el","o-so"],["ojo","👁️","el","o-jo"],["oveja","🐑","la","o-ve-ja"],["oreja","👂","la","o-re-ja"],["ola","🌊","la","o-la"],
 ["uva","🍇","la","u-va"],["unicornio","🦄","el","u-ni-cor-nio"],["uno","1️⃣","el","u-no"],
 ["mariposa","🦋","la","ma-ri-po-sa"],["manzana","🍎","la","man-za-na"],["mono","🐵","el","mo-no"],["moto","🏍️","la","mo-to"],["mochila","🎒","la","mo-chi-la"],["mano","✋","la","ma-no"],
 ["pato","🦆","el","pa-to"],["pelota","⚽","la","pe-lo-ta"],["perro","🐶","el","pe-rro"],["pez","🐟","el","pez"],["pan","🍞","el","pan"],["payaso","🤡","el","pa-ya-so"],["paraguas","☂️","el","pa-ra-guas"],["pingüino","🐧","el","pin-güi-no"],["pera","🍐","la","pe-ra"],["pie","🦶","el","pie"],["puente","🌉","el","puen-te"],
 ["sol","☀️","el","sol"],["silla","🪑","la","si-lla"],["sandía","🍉","la","san-dí-a"],["serpiente","🐍","la","ser-pien-te"],["sombrero","🎩","el","som-bre-ro"],["semáforo","🚦","el","se-má-fo-ro"],
 ["luna","🌙","la","lu-na"],["león","🦁","el","le-ón"],["lápiz","✏️","el","lá-piz"],["leche","🥛","la","le-che"],["lobo","🐺","el","lo-bo"],["limón","🍋","el","li-món"],["libro","📖","el","li-bro"],["loro","🦜","el","lo-ro"],["llama","🦙","la","lla-ma"],
 ["tren","🚂","el","tren"],["tortuga","🐢","la","tor-tu-ga"],["tigre","🐯","el","ti-gre"],["tomate","🍅","el","to-ma-te"],["teléfono","📞","el","te-lé-fo-no"],["tijera","✂️","la","ti-je-ra"],["tambor","🥁","el","tam-bor"],
 ["nube","☁️","la","nu-be"],["naranja","🍊","la","na-ran-ja"],["nariz","👃","la","na-riz"],["nieve","❄️","la","nie-ve"],
 ["casa","🏠","la","ca-sa"],["caballo","🐴","el","ca-ba-llo"],["conejo","🐰","el","co-ne-jo"],["cama","🛏️","la","ca-ma"],["camión","🚚","el","ca-mión"],["corazón","❤️","el","co-ra-zón"],["cohete","🚀","el","co-he-te"],["cuchara","🥄","la","cu-cha-ra"],["campana","🔔","la","cam-pa-na"],
 ["dedo","☝️","el","de-do"],["dinosaurio","🦖","el","di-no-sau-rio"],["dado","🎲","el","da-do"],["delfín","🐬","el","del-fín"],["diente","🦷","el","dien-te"],
 ["barco","🚢","el","bar-co"],["bicicleta","🚲","la","bi-ci-cle-ta"],["ballena","🐳","la","ba-lle-na"],["banana","🍌","la","ba-na-na"],["bota","👢","la","bo-ta"],["beso","💋","el","be-so"],["bandera","🚩","la","ban-de-ra"],["boca","👄","la","bo-ca"],
 ["flor","🌸","la","flor"],["fresa","🍓","la","fre-sa"],["fuego","🔥","el","fue-go"],["fantasma","👻","el","fan-tas-ma"],
 ["gato","🐱","el","ga-to"],["globo","🎈","el","glo-bo"],["guitarra","🎸","la","gui-ta-rra"],["gorra","🧢","la","go-rra"],["gallina","🐔","la","ga-lli-na"],["girasol","🌻","el","gi-ra-sol"],["gota","💧","la","go-ta"],
 ["jirafa","🦒","la","ji-ra-fa"],["jabón","🧼","el","ja-bón"],["jugo","🧃","el","ju-go"],
 ["rana","🐸","la","ra-na"],["ratón","🐭","el","ra-tón"],["reloj","⏰","el","re-loj"],["robot","🤖","el","ro-bot"],["rosa","🌹","la","ro-sa"],["regalo","🎁","el","re-ga-lo"],["rojo","🔴","el","ro-jo"],
 ["vaca","🐮","la","va-ca"],["vela","🕯️","la","ve-la"],["volcán","🌋","el","vol-cán"],["violín","🎻","el","vio-lín"],
 ["zapato","👞","el","za-pa-to"],["zorro","🦊","el","zo-rro"],["zanahoria","🥕","la","za-na-ho-ria"],
 ["queso","🧀","el","que-so"],
 ["helado","🍦","el","he-la-do"],["huevo","🥚","el","hue-vo"],["hormiga","🐜","la","hor-mi-ga"],["hoja","🍃","la","ho-ja"],["hueso","🦴","el","hue-so"]
];
const sinAcento=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/ü/g,"u");
const vocalesFinales=p=>(sinAcento(p).replace(/[^aeiou]/g,"")).slice(-2);   // para que una «rima» no sea sólo asonante (cama / rana)
const PAL=PAL_RAW.map(([p,e,art,sil])=>({p,e,art,sil:sil.split("-"),ini:sinAcento(p)[0].toUpperCase(),ll:/^ll/.test(p),h:/^h/.test(p),ase:vocalesFinales(p),n:p.length}));
const PALBY={};PAL.forEach(x=>PALBY[x.p]=x);
const palClip=x=>A("es",x.p,"pal-"+slug(x.p)),palArtClip=x=>A("es",x.art+" "+x.p,"art-"+slug(x.p));
PAL.forEach(x=>{palClip(x);palArtClip(x)});

// rimas: grupos de palabras con la misma terminación (rima de verdad, no sólo las vocales)
const RIMAS=[["gato","pato","zapato"],["rana","manzana","campana","banana"],["mariposa","rosa"],["avión","camión","corazón","ratón","limón","jabón"],["queso","hueso","beso"],
  ["pelota","bota","gota"],["cama","llama"],["pera","escalera","bandera"],["silla","ardilla"],["diente","serpiente","puente"],["ojo","rojo"]];
const rimaClip=p=>A("es","¿Cuál rima con "+p+"?","rima-"+slug(p));
RIMAS.forEach(g=>g.forEach(p=>{if(!PALBY[p])throw new Error("rima: falta la palabra «"+p+"»");rimaClip(p)}));

// ---------------- inglés: packs de vocabulary. Cada item = {w: la palabra, h: el dibujo}. «tpl» = lo que dice la voz
const em=(w,e)=>({w,h:`<span class="e">${e}</span>`});
const PACKS=[
 {id:"animals",ico:"🐶",tit:"Animals",tpl:"Touch the {w}",items:[em("dog","🐶"),em("cat","🐱"),em("bird","🐦"),em("fish","🐟"),em("horse","🐴"),em("cow","🐮"),em("pig","🐷"),em("duck","🦆"),em("rabbit","🐰"),em("elephant","🐘"),em("lion","🦁"),em("monkey","🐵"),em("sheep","🐑"),em("frog","🐸"),em("bear","🐻"),em("mouse","🐭")]},
 {id:"food",ico:"🍎",tit:"Food",tpl:"Touch the {w}",items:[em("apple","🍎"),em("banana","🍌"),em("bread","🍞"),em("milk","🥛"),em("cheese","🧀"),em("egg","🥚"),em("orange","🍊"),em("cake","🎂"),em("ice cream","🍦"),em("pizza","🍕"),em("carrot","🥕"),em("grapes","🍇"),em("strawberry","🍓"),em("juice","🧃")]},
 {id:"body",ico:"✋",tit:"Body",tpl:"Touch the {w}",items:[em("hand","✋"),em("foot","🦶"),em("eye","👁️"),em("nose","👃"),em("mouth","👄"),em("ear","👂"),em("tooth","🦷"),em("leg","🦵"),em("arm","💪")]},
 {id:"family",ico:"👪",tit:"Family",tpl:"Touch the {w}",items:[em("mum","👩"),em("dad","👨"),em("baby","👶"),em("boy","👦"),em("girl","👧"),em("grandma","👵"),em("grandpa","👴")]},
 {id:"things",ico:"🏠",tit:"Things",tpl:"Touch the {w}",items:[em("house","🏠"),em("car","🚗"),em("ball","⚽"),em("book","📖"),em("bed","🛏️"),em("chair","🪑"),em("star","⭐"),em("sun","☀️"),em("moon","🌙"),em("tree","🌳"),em("flower","🌸"),em("balloon","🎈"),em("bike","🚲"),em("boat","⛵"),em("train","🚂"),em("plane","✈️"),em("clock","⏰"),em("door","🚪"),em("key","🔑"),em("kite","🪁")]},
 {id:"clothes",ico:"👕",tit:"Clothes",tpl:"Touch the {w}",items:[em("hat","🎩"),em("shoes","👟"),em("socks","🧦"),em("shirt","👕"),em("dress","👗"),em("coat","🧥"),em("glasses","👓"),em("bag","🎒")]},
 {id:"colors",ico:"🎨",tit:"Colors",tpl:"Touch {w}",items:Object.keys(COLORES).map(w=>({w,h:punto(COLORES[w])}))},
 {id:"numbers",ico:"🔢",tit:"Numbers",tpl:"Touch number {w}",items:NUM_EN.slice(1,11).map((w,i)=>({w,h:`<span class="num">${i+1}</span>`,n:i+1}))},
 {id:"feelings",ico:"😀",tit:"Feelings",tpl:"I'm {w}",items:[em("happy","😀"),em("sad","😢"),em("angry","😠"),em("tired","😴"),em("scared","😨"),em("hot","🥵"),em("cold","🥶"),em("hungry","🤤")]},
 {id:"actions",ico:"🏃",tit:"Actions",tpl:"I can {w}",items:[em("run","🏃"),em("walk","🚶"),em("swim","🏊"),em("dance","💃"),em("clap","👏"),em("sing","🎤"),em("eat","🍽️"),em("drink","🥤"),em("sleep","🛌")]},
 {id:"shapes",ico:"🔺",tit:"Shapes",tpl:"Touch the {w}",items:["circulo","cuadrado","triangulo","rectangulo","estrella","corazon"].map(k=>({w:FORMAS[k].en,forma:k}))},
 {id:"abc",ico:"🔤",tit:"ABC",tpl:null,items:LETRAS.filter(L=>NOM_EN[L]).map(L=>({w:L,letra:L,h:`<span class="let">${L}</span>`}))}
];
const PACKBY={};PACKS.forEach(p=>PACKBY[p.id]=p);
const packFrase=(p,it)=>p.id==="abc"?tocaLetraEN(it.w):p.id==="numbers"?touchNum(it.n):A("en",p.tpl.replace("{w}",it.w),"p-"+p.id+"-"+slug(it.w));
const packPalabra=(p,it)=>p.id==="abc"?letraEN(it.w):p.id==="numbers"?numEN(it.n):A("en",it.w,"w-"+slug(it.w));
PACKS.forEach(p=>p.items.forEach(it=>{packFrase(p,it);packPalabra(p,it)}));

S5.C={NUM_ES,NUM_EN,numES,numEN,LETRAS,NOM_ES,NOM_EN,letraES,tocaLetraES,letraEN,tocaLetraEN,ES,EN,CHEERS_ES,CHEERS_EN,poneCanasta,tocaNum,touchNum,FORMAS,svg,tocaForma,
  COLORES,punto,OBJ,PAL,PALBY,palClip,palArtClip,RIMAS,rimaClip,PACKS,PACKBY,packFrase,packPalabra,sinAcento};
})();
