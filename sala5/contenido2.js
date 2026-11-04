// «Sala de 5» · contenido 2: lo que se sumó para los niveles más altos de Lengua y Matemática (números hasta 100, la hora, problemas, grupos, contrarios, letras que faltan…).
// Igual que contenido.js: sólo datos y frases. Todo lo que la app puede decir sale de acá (S5.frases()); tools/audio/sala5.js lee los dos archivos para saber qué audios grabar.
(function(){
"use strict";
const S5=window.S5,C=S5.C,A=S5.A,slug=S5.slug,ES=C.ES;

// ---------------- números del 21 al 100 (se dicen «veintiuno», «treinta y dos»… «cien»)
const UNI=["","uno","dos","tres","cuatro","cinco","seis","siete","ocho","nueve"];
const VEINTI=["veinte","veintiuno","veintidós","veintitrés","veinticuatro","veinticinco","veintiséis","veintisiete","veintiocho","veintinueve"];
const DEC=["","diez","veinte","treinta","cuarenta","cincuenta","sesenta","setenta","ochenta","noventa"];
for(let n=21;n<=100;n++){C.NUM_ES[n]=n===100?"cien":n<30?VEINTI[n-20]:DEC[Math.floor(n/10)]+(n%10?" y "+UNI[n%10]:"");C.numES(n)}
for(let n=21;n<=100;n++)C.tocaNum(n);   // «Tocá el treinta y cuatro» (hasta el 20 ya estaban)
for(let n=11;n<=12;n++)C.poneCanasta(n);   // «Poné once / doce en la canasta» (el nivel 3 de ese juego)

// ---------------- frases sueltas
Object.assign(ES,{
  armar:A("es","Armá la palabra"),letraFalta:A("es","¿Qué letra falta?"),empiezaIgual:A("es","¿Cuál empieza igual?"),termina:A("es","¿Con qué letra termina?"),
  masSilabas:A("es","Tocá el que tiene más sílabas"),menosSilabas:A("es","Tocá el que tiene menos sílabas"),noRima:A("es","Tocá el que no rima"),noVa:A("es","¿Cuál no va con los demás?"),
  contrarioDe:A("es","Lo contrario de"),parejas:A("es","Encontrá las parejas"),
  numGrande:A("es","Tocá el número más grande"),numChico:A("es","Tocá el número más chico"),menorMayor:A("es","Tocá los números del más chico al más grande"),mayorMenor:A("es","Tocá los números del más grande al más chico"),
  cuantosLados:A("es","¿Cuántos lados tiene?"),masLargo:A("es","Tocá el más largo"),masCorto:A("es","Tocá el más corto"),
  cuantoQ:A("es","¿Cuánto?"),esIgualA:A("es","es igual a"),cuantoDa:A("es","¿Cuánto da?"),queHora:A("es","¿Qué hora es?"),manitoCorta:A("es","Mirá la manito corta"),
  tengo:A("es","Tengo"),meRegalan:A("es","Me regalan"),seVan:A("es","Se van"),
  cuantasTengo:A("es","¿Cuántas tengo ahora?"),cuantosTengo:A("es","¿Cuántos tengo ahora?"),cuantasMeQuedan:A("es","¿Cuántas me quedan?"),cuantosMeQuedan:A("es","¿Cuántos me quedan?")
});

// ---------------- la hora (sólo «en punto»)
const laHora=n=>n===1?"la una":"las "+C.NUM_ES[n];
C.sonLas=n=>A("es",(n===1?"Es la una":"Son las "+C.NUM_ES[n])+" en punto","son-las-"+n);
C.tocaReloj=n=>A("es","Tocá el reloj de "+laHora(n),"toca-reloj-"+n);
for(let n=1;n<=12;n++){C.sonLas(n);C.tocaReloj(n)}

// ---------------- problemas: [dibujo, plural, femenino?]. El plural es una frase suelta; «Tengo» + número + plural + «Me regalan» + número + «más»… se arma pegando frases ("|" en una lista de frases es una pausa entre oraciones)
C.PROB=[["🍎","manzanas",1],["🍓","frutillas",1],["⭐","estrellas",1],["🐟","pececitos",0],["🎈","globos",0],["🚗","autitos",0],["🌸","flores",1],["⚽","pelotas",1],
  ["🦋","mariposas",1],["🍪","galletitas",1],["🧸","ositos",0],["🍌","bananas",1],["🐥","pollitos",0]].map(([e,pl,f])=>({e,pl,f:!!f,k:A("es",pl,"plural-"+slug(pl))}));

// ---------------- grupos de cosas (Lengua · «Grupos»): palabras con dibujo que se pueden agrupar sin discusión
const CATEGORIAS=[
  {id:"animal",k:A("es","Tocá el animal","grupo-animal"),pal:["araña","abeja","ardilla","elefante","oso","oveja","mariposa","mono","pato","perro","pez","pingüino","serpiente","león","lobo","tortuga","tigre","caballo","conejo","delfín","ballena","gato","gallina","jirafa","rana","ratón","vaca","zorro","loro","hormiga"]},
  {id:"fruta",k:A("es","Tocá la fruta","grupo-fruta"),pal:["manzana","pera","banana","uva","naranja","frutilla","sandía","limón"]},
  {id:"vehiculo",k:A("es","Tocá el vehículo","grupo-vehiculo"),pal:["avión","barco","bicicleta","camión","moto","tren","cohete"]},
  {id:"cuerpo",k:A("es","Tocá una parte del cuerpo","grupo-cuerpo"),pal:["mano","ojo","oreja","nariz","boca","dedo","pie","diente"]},
  {id:"instrumento",k:A("es","Tocá el instrumento","grupo-instrumento"),pal:["guitarra","tambor","violín","campana"]},
  {id:"ropa",k:A("es","Tocá la ropa","grupo-ropa"),pal:["sombrero","bota","gorra"]}
];
CATEGORIAS.forEach(g=>g.pal.forEach(p=>{if(!C.PALBY[p])throw new Error("grupo «"+g.id+"»: falta la palabra «"+p+"»")}));
C.CATEGORIAS=CATEGORIAS;

// ---------------- lo contrario: dos palabras con su dibujo. «fam» = familia de ideas: no se mezclan en una pregunta (el sol es «día» pero también «calor»; el elefante es «grande» pero también «lento»…)
const OPUESTOS=[
  {a:"grande",ea:"🐘",b:"chico",eb:"🐭",fam:"tam"},{a:"lento",ea:"🐢",b:"rápido",eb:"🐇",fam:"tam"},
  {a:"caliente",ea:"🔥",b:"frío",eb:"❄️",fam:"clima"},{a:"día",ea:"☀️",b:"noche",eb:"🌙",fam:"clima"},
  {a:"arriba",ea:"⬆️",b:"abajo",eb:"⬇️",fam:"lugar"},{a:"abierto",ea:"🔓",b:"cerrado",eb:"🔒",fam:"puerta"},{a:"feliz",ea:"😀",b:"triste",eb:"😢",fam:"animo"}
];
C.opClip=w=>A("es",w,"op-"+slug(w));
OPUESTOS.forEach(o=>{C.opClip(o.a);C.opClip(o.b)});
C.OPUESTOS=OPUESTOS;
})();
