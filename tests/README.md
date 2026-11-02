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
| `sitio.js` | el sitio completo como en GitHub Pages: el **inicio** (menú) abre el Trinity 3 y el Trinity 4 y los módulos tienen la barra para volver o pasar al otro; rutas de las tres páginas, que cada módulo pida el motor y los audios de la raíz, los tres manifiestos e íconos (ids distintos), service worker simulado (instala todo; sin internet el inicio y cada módulo abren SU página), aviso de versión nueva y datos de Felu y Raphina separados |

Antes de publicar: correr **todas** (`for f in tests/*.js; do node $f | tail -1; done`), porque los dos módulos comparten el motor. Después de subir, probar el sitio publicado con `URL=https://speranzaemiliano-rk.github.io/trinity-felu/raphina/ node tests/g4_<nombre>.js` (todas las `g4_` aceptan `URL`; `sitio.js` arma su propio «sitio»).
