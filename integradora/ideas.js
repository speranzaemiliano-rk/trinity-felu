// «Temas de ideas» de la prueba final integradora: la base. Un tema de ideas es un grupo de páginas del libro hecho de IDEAS (un concepto = una idea con su resumen y sus preguntas), con su
// resumen, sus dibujos, su cuadro comparativo y su mapa conceptual. Cada tema es un archivo propio que llama a INT.temaIdeas({...}): los de Naturales son nat-*.js (nat-sol.js, nat-estaciones.js,
// nat-gnomon.js) y los de Sociales soc-*.js; así sumar las páginas que lleguen es un archivo nuevo, sin tocar la lógica de app.js.
// Todo el texto es PROPIO (resúmenes y ejercicios con otras palabras): el repositorio es público y no se copia el libro.
(function(){
"use strict";
const INT=window.INT,IDEAS=INT.IDEAS={temas:[],conceptos:[],info:{}};
// INT.idea(id, grupo, ícono, título, resumen, extras): una idea = un concepto del tema, con sus preguntas.
//   extras.mc      [[pregunta, correcta, [3 o más incorrectas]]]            (elegir)
//   extras.vf      [[afirmación, verdadera?, explicación]]                  (verdadero o falso)
//   extras.tipear  [[pregunta, [respuestas que valen], pista]]              (escribir)
//   extras.ordenar [[consigna, [pasos en el orden correcto]]]               (ordenar)
//   extras.tocar   [[dibujo, consigna, pieza del dibujo que hay que tocar]] (tocar en el dibujo)
//   extras.estacion true                                                    (¿qué estación es? con los dibujos de árboles)
INT.idea=(id,grupo,ico,titulo,resumen,ex)=>Object.assign({id,grupo,ico,titulo,resumen},ex||{});
// INT.temaIdeas({area, id, nombre, ico, paginas, es, grupos:[{id,titulo}], conceptos:[INT.idea(...)], tableros:[{titulo, cols:[izquierda, derecha], pares:[[idDeLaIdea, izquierda, derecha]]}],
//                estudio:[{id,titulo,dibujos}], cuadro:{cols,filas}, mapa:{raiz,ramas}})
//   area: en qué materia aparece el tema («naturales» si no se dice; «sociales» para los de Sociales).
//   estudio: las pestañas de la pantalla de estudio, en orden: «resumen», «cuadro», «dibujos» (con la lista de dibujos que trae dibujos.js) y «mapa».
INT.temaIdeas=function(def){
  const items=def.conceptos.map(c=>Object.assign({tipo:"concepto",tema:def.id,corto:c.titulo,capital:"",mc:[],vf:[],tipear:[],ordenar:[],tocar:[],estacion:false},c));
  def.area=def.area||"naturales";def.conceptos=items;def.tableros=def.tableros||[];
  IDEAS.temas.push(def);items.forEach(x=>IDEAS.conceptos.push(x));
  const area=INT.AREAS.find(a=>a.id===def.area);
  area.pronto=false;
  area.temas.push({id:def.id,nombre:def.nombre,ico:def.ico,es:def.es,tipo:"ciencia",items:items,def:def});
};
// una búsqueda por id que también encuentra las ideas
const itemBase=INT.item;INT.item=id=>itemBase(id)||IDEAS.conceptos.find(x=>x.id===id);
})();
