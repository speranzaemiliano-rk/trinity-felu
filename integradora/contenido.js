// «Prueba final integradora · Felipe»: el contenido. Por ahora, Sociales → provincias de la República Argentina y sus capitales (más la Ciudad Autónoma de Buenos Aires).
// Naturales todavía no tiene temas: la estructura (áreas → temas → ítems) está pensada para sumarlos sin tocar la lógica.
// El mapa (integradora/mapa.js) usa los mismos «id» de cada provincia que figuran acá.
(function(){
"use strict";
const INT=window.INT={NOMBRE:"Prueba final integradora",ALUMNO:"Felipe"};

// prov(id, nombre, nombre corto (el de las opciones), capital, abreviatura para el mapa, otras formas de escribir la provincia, otras formas de escribir la capital,
//      ciudades conocidas de esa provincia que NO son la capital (las «trampas» de las opciones), una nota para la corrección)
const prov=(id,nombre,corto,capital,abrev,altNombre,altCapital,trampas,nota)=>({id,tipo:"provincia",nombre,corto,capital,abrev,altNombre:altNombre||[],altCapital:altCapital||[],trampas:trampas||[],nota:nota||""});
const PROVINCIAS=[
 prov("buenosaires","Buenos Aires","Buenos Aires","La Plata","Bs. As.",["provincia de buenos aires","pcia de buenos aires","bs as"],[],["Mar del Plata","Bahía Blanca","Ciudad de Buenos Aires"],"OJO: la Ciudad de Buenos Aires NO es la capital de la provincia: es La Plata. La Ciudad de Buenos Aires es la capital del país."),
 prov("catamarca","Catamarca","Catamarca","San Fernando del Valle de Catamarca","Catamarca",[],["san fernando del valle","san fernando","catamarca"],[],"Se la suele llamar simplemente «Catamarca», pero su nombre completo es San Fernando del Valle de Catamarca."),
 prov("chaco","Chaco","Chaco","Resistencia","Chaco",[],[],["Roque Sáenz Peña"]),
 prov("chubut","Chubut","Chubut","Rawson","Chubut",[],[],["Comodoro Rivadavia","Trelew"],"Comodoro Rivadavia y Trelew son ciudades más grandes que Rawson, pero la capital es Rawson."),
 prov("cordoba","Córdoba","Córdoba","Córdoba","Córdoba",[],[],["Villa Carlos Paz"],"La provincia y su capital se llaman igual."),
 prov("corrientes","Corrientes","Corrientes","Corrientes","Corrientes",[],[],["Goya"],"La provincia y su capital se llaman igual."),
 prov("entrerios","Entre Ríos","Entre Ríos","Paraná","Entre Ríos",[],[],["Concordia","Gualeguaychú"]),
 prov("formosa","Formosa","Formosa","Formosa","Formosa",[],[],["Clorinda"],"La provincia y su capital se llaman igual."),
 prov("jujuy","Jujuy","Jujuy","San Salvador de Jujuy","Jujuy",[],["san salvador","jujuy"],["Palpalá"],"Se la suele llamar «Jujuy», pero su nombre completo es San Salvador de Jujuy."),
 prov("lapampa","La Pampa","La Pampa","Santa Rosa","La Pampa",[],[],["General Pico"]),
 prov("larioja","La Rioja","La Rioja","La Rioja","La Rioja",[],[],["Chilecito"],"La provincia y su capital se llaman igual."),
 prov("mendoza","Mendoza","Mendoza","Mendoza","Mendoza",[],[],["San Rafael"],"La provincia y su capital se llaman igual."),
 prov("misiones","Misiones","Misiones","Posadas","Misiones",[],[],["Oberá","Puerto Iguazú"]),
 prov("neuquen","Neuquén","Neuquén","Neuquén","Neuquén",[],[],["San Martín de los Andes"],"La provincia y su capital se llaman igual."),
 prov("rionegro","Río Negro","Río Negro","Viedma","Río Negro",[],[],["Bariloche","General Roca"],"Bariloche y General Roca son ciudades más grandes que Viedma, pero la capital es Viedma."),
 prov("salta","Salta","Salta","Salta","Salta",[],[],["Tartagal"],"La provincia y su capital se llaman igual."),
 prov("sanjuan","San Juan","San Juan","San Juan","San Juan",[],[],[],"La provincia y su capital se llaman igual."),
 prov("sanluis","San Luis","San Luis","San Luis","San Luis",[],[],["Villa Mercedes"],"La provincia y su capital se llaman igual."),
 prov("santacruz","Santa Cruz","Santa Cruz","Río Gallegos","Sta. Cruz",[],[],["Caleta Olivia","El Calafate"]),
 prov("santafe","Santa Fe","Santa Fe","Santa Fe","Santa Fe",[],["santa fe de la vera cruz"],["Rosario"],"Rosario es la ciudad más grande de la provincia, pero la capital es Santa Fe."),
 prov("santiago","Santiago del Estero","Santiago del Estero","Santiago del Estero","Sgo. del Estero",[],[],["La Banda"],"La provincia y su capital se llaman igual."),
 prov("tierradelfuego","Tierra del Fuego, Antártida e Islas del Atlántico Sur","Tierra del Fuego","Ushuaia","T. del Fuego",["tierra del fuego","tierra del fuego antartida e islas del atlantico sur","tierra del fuego e islas del atlantico sur"],[],["Río Grande"],"Esta provincia incluye también las Islas Malvinas, Georgias del Sur y Sandwich del Sur y la Antártida Argentina."),
 prov("tucuman","Tucumán","Tucumán","San Miguel de Tucumán","Tucumán",[],["san miguel","tucuman"],["Concepción"],"Se la suele llamar «Tucumán», pero su nombre completo es San Miguel de Tucumán. Es la provincia más chica del país.")
];
// la Ciudad Autónoma de Buenos Aires no es una provincia: es la capital del país. Está en el mapa y en las preguntas del mapa (no tiene «capital»)
const CABA={id:"caba",tipo:"ciudad",nombre:"Ciudad Autónoma de Buenos Aires",corto:"Ciudad de Buenos Aires",capital:null,abrev:"CABA",altNombre:["caba","capital federal","ciudad de buenos aires","ciudad autonoma de buenos aires","capital"],altCapital:[],trampas:[],nota:"No es una provincia: es la capital del país (se la llama Capital Federal o CABA). La capital de la provincia de Buenos Aires es La Plata."};
const ITEMS=PROVINCIAS.concat([CABA]);
INT.PROVINCIAS=PROVINCIAS;INT.CABA=CABA;INT.ITEMS=ITEMS;
INT.item=id=>ITEMS.find(x=>x.id===id);

// las áreas y sus temas
INT.AREAS=[
 {id:"sociales",nombre:"Sociales",ico:"🗺️",color:"azul",temas:[
  {id:"provincias",nombre:"Provincias y capitales",ico:"📍",es:"Las 23 provincias de la Argentina, la Ciudad de Buenos Aires y sus capitales",tipo:"provincias",items:ITEMS}
 ]},
 {id:"naturales",nombre:"Naturales",ico:"🌿",color:"verde",pronto:true,temas:[]}
];
INT.tema=id=>{for(const a of INT.AREAS){const t=a.temas.find(x=>x.id===id);if(t)return t}return null};
})();
