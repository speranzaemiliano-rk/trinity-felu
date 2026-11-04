# Pruebas

Pruebas de punta a punta con Playwright (Chromium, micrófono falso). Se corren desde la raíz del repo, una por una:

```
npm i playwright            # una vez (o usar un Playwright global)
node tests/variedad.js
```

Cada una imprime ✓/✗ por chequeo y termina con `TODO OK` (código 0) o `HAY FALLOS`.
Se puede probar el sitio publicado con `URL=https://speranzaemiliano-rk.github.io/trinity-felu/felu/ node tests/<nombre>.js` (las de Felu; las `g4_` con `…/raphina/`; no todas lo admiten). Ojo: la raíz del sitio es el **inicio** (el menú), no un módulo.

La IA (Firebase AI Logic) y el audio del iPhone **se simulan**: App Check no deja pasar desde un entorno de pruebas y nadie puede oír un iPhone desde afuera.
`mudo.js`, `formas.js` y `resume.js` simulan lo que oye el micrófono para probar la lógica; que el audio suene de verdad en un iPhone sólo se puede confirmar en el iPhone.

| Prueba | Qué cubre |
|---|---|
| `variedad.js` | banco de preguntas, orden al azar, memoria entre charlas, repreguntas, charla completa |
| `ia_plan.js` | plan al azar para el examinador con IA |
| `cobertura.js` | que las frases del examinador en 16 charlas completas tengan audio grabado |
| `mudo.js` | iPhone, manos libres: audio mudo → texto, otras formas de reproducir, aviso |
| `formas.js` | revisión de sonido, paso 3: prueba las otras formas si «Friday» no se oye |
| `resume.js` | app instalada con iOS 26+: recarga al volver del fondo |
| `sonido.js` | revisión de sonido de 3 pasos y los modos que elige |
| `ios_libres.js` / `ios_libres_examen.js` | iPhone manos libres (micrófono abierto toda la charla) |
| `per_turno.js` / `per_turno_examen.js` | PC y Android: el micrófono se abre en cada respuesta y se suelta antes de que hable el examinador |
| `pwa.js`, `ios_voz.js`, `retry.js`, `vis_mic.js` | audio en iPhone (AbortError, voz de desbloqueo, reintentos), medidor del micrófono |
| `version.js` | aviso de versión nueva |
| `informe.js` | informe de sonido para copiar |
| `nota.js`, `topes.js` | nota con IA y sus topes |
| `pics.js` | dibujos del examinador con IA |
| `guion.js`, `ia_ui.js` | charla de siempre y pantalla con IA |
| `pausa.js` | que no corte la oración al hacer una pausa (micrófono falso con una pausa de 1,6 s), esperar más si la frase parece cortada (~100 frases), que un ruido que sube después de hablar no frene el final, el dictado del navegador (espera y tope sin voz) y el selector «⏳ Pausas» |
| `examen_escrito.js` | el examen escrito: banco grande, 30 preguntas de todos los temas, que no se repitan con el examen anterior (ni al recargar) y que cuente cuántas eran nuevas |
| `pregunta.js` | el examinador contesta lo que le preguntan en cualquier momento (y no toma por pregunta una respuesta normal: «I have a dog», «it is a house»…), en los dos módulos |
| `sin_tocar.js` | que no haga falta apretar «Hablar» ni «Listo»: «Listo» escondido y tardío, un corte del micrófono no queda guardado, «Probar manos libres» |
| `escucha.js` | el examinador que escucha (los dos módulos): reconoce de qué se habló, reacciona (animales, deportes, comidas…, lo triste, el «no sé», lo largo), repregunta con criterio (no lo ya dicho, pide más si fue cortito, no apila sobre quien no pudo), se interesa por lo que se mencionó, se acuerda antes de despedirse, tiene audio para todo y se nota en una charla tecleada completa |
| `g4_banco.js` | Raphina (Grade 4): el banco del examinador —preguntas por función, áreas, tema, hoja de ejemplo—, los textos para la IA y que cada respuesta modelo cumpla lo que pide |
| `g4_charla.js` | Raphina: charlas completas (tema + 2 áreas, sólo tema, sólo conversación), pregunta obligatoria al examinador en el tema, variedad entre charlas y nota en su propia clave |
| `g4_cobertura.js` | Raphina: todo lo que puede decir el examinador, lo que se toca para estudiar y las preguntas del repaso escrito tienen audio grabado |
| `g4_ia.js` | Raphina con IA (simulada): plan de la sesión, turnos, nota y topes |
| `g4_hoja.js` | la hoja del tema: se completa, se guarda, avisa lo que falta, ideas, imprimir, modo de práctica |
| `g4_estudio.js` | la pantalla de estudio de Raphina (todo se toca para escuchar) y el repaso escrito de 30 preguntas |
| `g4_revision.js` | lo que salió de la revisión independiente del inglés de Raphina: la respuesta del examinador a la pregunta de quien rinde (sí/no según el auxiliar, datos generales para where/when/who/how), el repaso escrito con UNA respuesta posible y sin pista de «a/an», saludo y despedida que no traban, reacciones que valen para cualquier respuesta (y que acompañan si lo que se cuenta es triste), expresiones del pasado/comparativos/adverbios sin falsos positivos, y los textos de la IA |
| `sala5.js` | **Sala de 5** (la de la nena de 5 años; levanta un servidor local, o `URL=…/sala5/`): cada frase tiene su mp3 y no sobra ninguno, los 43 juegos arman ~16.000 preguntas sin una mal hecha (UNA respuesta correcta, opciones distintas, todo con audio), el primer sonido sale dentro del toque (iPhone), una ronda de cada tipo (elegir, contar, canasta, armar el nombre, **memotest**, **ordenar números**, **armar una palabra**), el **Desafío** (8 preguntas mezcladas, un solo premio, sin memotest), la Sorpresa y subir de nivel con su aviso, el doble toque sobre la misma equivocada (cuenta una vez), la espera de «no toca nada» con una consigna larga (empieza cuando termina de hablar), el menú de un área (se abre desde arriba) y «Borrar» con los desafíos, que equivocarse nunca trabe (probá de nuevo → late → se la muestra), la espera si no toca nada, niveles, figuritas y álbum lleno, el panel de grandes (apretar 1,4 s, nombre, sonido, dificultad 1 a 4, borrar en dos toques), lo guardado roto, sin almacenamiento, que no hable con ningún sitio, la voz del aparato si un mp3 no baja, el volumen de las voces (todos los mp3 llevan la marca del proceso y, con ffmpeg, se miden: nada bajito ni saturado), la velocidad de la voz, los resultados (bien y mal por pregunta, por juego, por día y lo que le cuesta; el panel, borrarlos, lo guardado roto y rótulos con HTML) y el diseño en 10 tamaños de pantalla (con el iPhone SE, el iPhone 8 y los Android de costado de 360 px de alto o menos) × todos los juegos y **cada nivel**, con el peor caso de los juegos de tamaño variable, el Desafío y las 8 estrellas del premio (se fija con `S5.nivelFijo`; también el panel de grandes y los resultados) |
| `sala5_nuevos.js` | **Sala de 5 · que las preguntas sean CIERTAS** (no sólo que estén bien armadas): ~16.000 preguntas de los niveles altos y de los juegos nuevos, en las que se comprueba que la cuenta dé lo que dice la opción correcta (sumar, restar, problemas hablados, «5 + ? = 9»), que el reloj marque la hora que se pide, que las decenas y unidades sumen el número, que lo que falta en una fila o en una palabra sea lo que falta, que el animal sea un animal y «el que no va» no sea del grupo, que el que «no rima» no rime, que lo contrario sea lo contrario y que las parejas del memotest sean parejas (probada «a sabotaje»: rompiendo un juego a propósito falla) |
| `adaptar.js` | **el motor adaptativo de Sala de 5**, sin navegador (`node tests/adaptar.js`): la probabilidad de acertar, cómo se mueve la habilidad (sube con un acierto difícil, baja con un error fácil, nunca sale de 1 al tope, se mueve más al principio y con rachas), «chicos virtuales» (de distintas habilidades y con una que aprende) que tienen que llegar cerca de su nivel en 25 preguntas y quedarse ahí, el nivel de cada pregunta (la parte decimal de la habilidad es la chance del nivel de arriba), y la elección de juegos del Desafío y la Sorpresa (más lo nuevo y lo que cuesta, casi nada lo que domina, sin repetir) |
| `sitio.js` | el sitio completo como en GitHub Pages: el **inicio** (menú) abre el Trinity 3, el Trinity 4 y Sala de 5, y los módulos de Trinity tienen la barra para volver o pasar al otro; rutas de las cuatro páginas, que cada módulo de Trinity pida el motor y los audios de la raíz y Sala de 5 sólo lo suyo, los cuatro manifiestos e íconos (ids distintos), service worker simulado (instala todo; sin internet el inicio y cada módulo abren SU página), aviso de versión nueva y datos de Felu y Raphina separados |

Antes de publicar: correr **todas** (`for f in tests/*.js; do node $f | tail -1; done`), porque los dos módulos comparten el motor. Después de subir, probar el sitio publicado con `URL=https://speranzaemiliano-rk.github.io/trinity-felu/raphina/ node tests/g4_<nombre>.js` (todas las `g4_` aceptan `URL`; `sitio.js` arma su propio «sitio»).
