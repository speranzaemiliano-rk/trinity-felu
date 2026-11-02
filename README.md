# Trinity GESE · Grade 3 (Felu) y Grade 4 (Raphina)

Sitio de estudio y práctica para el examen oral Trinity GESE, con **un módulo por grado** que comparten el mismo motor. Sin build: se edita y se sube.
Se publica en GitHub Pages y cada módulo se puede instalar como app aparte (ícono y datos propios).

| Módulo | Para | Examen | Dirección |
|---|---|---|---|
| **Grade 3** | Felu | charla de 7 minutos con el examinador | https://speranzaemiliano-rk.github.io/trinity-felu/ |
| **Grade 4** | Raphina | 10 minutos: tema preparado + conversación | https://speranzaemiliano-rk.github.io/trinity-felu/raphina/ |

## Cómo está armado

Nada se compila: son archivos que el navegador carga en este orden. **El motor no sabe de ningún grado**: cada módulo le pasa su contenido.

| Archivo | Qué tiene |
|---|---|
| `estilos.css` | los estilos de todos los módulos (cada página sólo cambia los colores) |
| `comun.js` | lo que usan todos: `BASE`, ayudas (`$`, `esc`, `pick`, `shuffleA`…), las frases de siempre (`REPITE`, `NO_OIGO`…) y la memoria de «lo ya preguntado» (`vistasLeer`/`vistasGuardar`/`elegirNuevo`) |
| `contenido-g3.js` · `contenido-g4.js` | **todo lo que es de un grado**: el objeto `MOD` (id, nombre, minutos, claves de almacenamiento), el guion del examinador, los textos de la IA, el vocabulario con sus dibujos y el banco del repaso escrito |
| `motor.js` | voz, micrófono, iPhone manos libres, revisión de sonido, IA, nota, repaso escrito y aviso de versión nueva. Lee a `MOD` y a los ganchos del contenido |
| `index.html` · `raphina/index.html` | la página de cada módulo (misma estructura; otra paleta y otros textos). `raphina/` también tiene su `manifest.json` y sus íconos |
| `sw.js` | el service worker, **uno solo para todo el sitio**: guarda las dos páginas para abrirlas sin internet y cada una cae en la suya |

**Lo que define un contenido** (`contenido-gN.js`): `MOD`, `VISTAS_KEY`, `armarPasos(vista)` (la lista de pasos de la charla), `planIA(esExamen)` (el plan al azar que se le pasa a la IA), `SISTEMA_IA`, `SISTEMA_EVAL`, `PROMPT_TRANSCRIBIR`, `EVAL_CRIT`, `PIC_LISTA`, `VOCAB`, `DIB*`, `bank` y `rkTextosGuion()` (todas las frases que puede decir el examinador, para generar los audios). Opcionales: `evalExtra(reg)` (datos que cuenta la página para corregir) y `pideDePregunta()` (si en ese momento se exige que le pregunte algo al examinador). Un **paso** de la charla es `{g, q, a, need, hints, react, follow, …}`; el Grade 4 sumó `rotulo` (la etiqueta de la burbuja), `contexto` (una línea fija sobre la pregunta, p. ej. el punto del tema), `solo` (el examinador habla y no espera respuesta: «Let's talk about food») y `corta` (acepta una respuesta corta).

**Versión y caché.** `window.RK_BASE` (`""` en la raíz, `"../"` en una carpeta) se vuelve `BASE`: de ahí salen los audios, el `sw.js` y la consulta de versión nueva. Los scripts y estilos se piden con `?b=<marca>` (a propósito no numérica: el service worker deja pasar directo las consultas `?c=`/`?v=` con número), así el navegador nunca mezcla una página nueva con un motor viejo del caché. La versión (`BUILD`) vive en `motor.js` y es lo que compara el aviso de «versión nueva». **En cada publicación:**
```
node tools/version.js "2026-11-03 · lo que cambió"
```
(pone el `BUILD`, actualiza la marca `?b=` de todas las páginas y sube el número del caché de `sw.js`).

**Los datos de cada módulo** (mismo sitio = mismo `localStorage`) llevan su propio prefijo: Felu `trinity_notas` y `trinity_vistas`; Raphina `trinity_g4_notas`, `trinity_g4_vistas`, `trinity_g4_tema` (la hoja del tema) y `trinity_g4_modo`. Lo que es **del aparato** se comparte a propósito: la revisión de sonido (`trinity_sonido3`), la voz y la velocidad (`trinity_voz2`, `trinity_vel`), «tocar 🎤» (`trinity_tap2`), la estrategia de audio (`trinity_estr`) y la URL de la IA (`trinity_ia_url`): el celular suena igual en los dos módulos y no tiene sentido hacer la revisión de sonido dos veces.

**Para sumar otro módulo** (otro grado u otro chico):
1. Copiá `contenido-g4.js` como `contenido-gN.js`; cambiá `MOD` y **todas las claves de almacenamiento** (con un prefijo propio) y reescribí el contenido.
2. Copiá la carpeta `raphina/` con otro nombre; en su `index.html` cambiá textos, paleta y el `<script src="../contenido-gN.js?b=…">`; en `manifest.json` cambiá `name`, `short_name`, `id` y colores (un `id` distinto es lo que hace que se instale como otra app).
3. Sumá los archivos nuevos a `ARCHIVOS` de `sw.js` (si uno falta, el service worker no se instala) y la página a `PAGINAS` de `tools/audio/lista.js`.
4. Generá los audios (ver «Audios grabados»), escribí `tests/gN_*.js` y corré `node tools/version.js "…"`.

## Módulo de Raphina · Trinity GESE Grade 4 (`/raphina/`)

Sigue el formato oficial del grado (CEFR A2.2, *Elementary stage*) de la [Guide for Teachers – GESE Elementary Stage](https://www.trinitycollege.com/resource?id=5649) de Trinity ([todas las guías de Grades 4–6](https://trinitycollege.com/qualifications/english-language/GESE/GESE-grades-4-6-elementary-resources/GESE-grades-4-6-guides)): **10 minutos en dos fases**.

1. **Tema preparado** (hasta 5 min). Se elige un tema propio y se completa la **hoja del tema** (*topic form*): un título y **4 puntos de discusión**, cada uno de una función del grado (pasado, planes, gustos, comparar, cada cuánto y cómo). El examinador pide la hoja, charla sobre los 4 puntos **en el orden que sortea** (no se recita) y quien rinde tiene que **hacerle al menos una pregunta** sobre el tema. Si el título es una de las 6 áreas de la conversación (*Holidays*, *Food*…) la página avisa: el examen real no lo permite. La hoja se guarda en el aparato, tiene 12 temas de ejemplo y se imprime con el formato de la hoja oficial. Sin hoja completa, la práctica usa un tema de ejemplo.
2. **Conversación** (hasta 5 min). El examinador elige **2 de las 6 áreas** —*Holidays, Shopping, School and work, Hobbies and sports, Food, Weekend and seasonal activities*— y las anuncia («Let's talk about food» · «Thank you. Now let's talk about…»), unos 2–2,5 min cada una. Acá **no** se exige preguntar. Sale primero el área que hace más que no sale, y la otra se sortea entre las siguientes.

Pestañas: **Estudiar** (los temas del grado —pasado regular e irregular, preguntas y negativos, *going to*, *like + -ing*, adverbios de frecuencia y modo, comparativos y superlativos, *but*, los 3 sonidos del *-ed*, la fase del tema y las preguntas para el examinador— y vocabulario de las 6 áreas con un dibujo por palabra; todo se toca para escuchar), **Speaking** (la hoja del tema y la práctica: examen completo, sólo el tema, o sólo la conversación de un área) y **Examen** (el simulacro oral de ~10 minutos, sin ayudas, y el **repaso escrito** de 30 preguntas de 18 temas).

Cómo habla el examinador:
- **Sin IA** (y en iPhone con manos libres): `armarPasos` arma la charla con frases grabadas —saludo → «Can I have your topic form, please?» → título → los 4 puntos (preguntas de la función de cada uno, con repreguntas) → «¿Querés preguntarme algo?» (después del 2.º punto) → las 2 áreas (cada una con 4 preguntas de funciones distintas) → despedida—. Cambia en cada charla y la página recuerda lo ya preguntado. Si lo que se contesta es corto o le falta el lenguaje del grado (pasado, *going to*, comparar…), el examinador muestra un ejemplo y deja intentar de nuevo (en el simulacro del examen no ayuda).
- **Con IA:** `planIA` le pasa el plan de la sesión (el tema y sus 4 puntos, las 2 áreas sorteadas y la función que toca cubrir en cada turno) y la IA conversa dentro de ese plan (hasta 17 turnos). No hay dibujos en este grado.
- **Nota:** mismos 4 criterios que Felu (entender y responder, gramática, vocabulario, fluidez). `evalExtra` le cuenta a la IA qué usó (pasado, *going to*, gustos, comparaciones, frecuencia) y si **le hizo una pregunta al examinador en la fase del tema**; el tope de «Entender y responder» por no preguntar sólo rige cuando hubo tema (`pideDePregunta`: practicando sólo la conversación no se exige).
- Los **audios** de las dos páginas salen de la misma carpeta `audio/` (una frase repetida entre módulos se baja una sola vez).

## Examinador con IA (Firebase AI Logic) — los dos módulos

Sin esto el sitio funciona igual, con preguntas armadas de antemano y el dictado del navegador.
Con la IA conectada:
- el examinador inventa preguntas nuevas y reacciona a lo que contesta el chico (Felu o Raphina);
- la voz **se graba y la transcribe Gemini**, así el micrófono anda también en Safari/iPhone y donde el dictado del navegador falla.

No hay servidor ni claves secretas en el sitio: la IA corre por Firebase AI Logic.

### Cómo funciona la charla y la nota
- **Manos libres:** en PC y Android cada respuesta abre el micrófono solo (sin tocar 🎤) y lo **suelta antes de que hable el examinador**. **En iPhone es distinto** (ver abajo): Safari no deja abrir el micrófono sin un toque, así que el micrófono se abre con el toque de *Empezar* y queda **abierto toda la charla**, y el examinador habla **sólo con audios grabados**.
  - ⚠️ **Regla de audio en iPhone: nada abierto mientras habla el examinador.** Con el micrófono (o un AudioContext) abierto, la voz del navegador (`speechSynthesis`) silencia la pista del micrófono y no se puede reactivar ([WebKit 218815](https://bugs.webkit.org/show_bug.cgi?id=218815), reproducido en iOS 27) y el audio de la página sale muteado o degradado. «Manos libres v1» dejó el micrófono abierto toda la charla y el examinador quedó mudo. `capIniciar()` abre, `capDetener()` suelta (pistas, AudioContext y `audioSession`) y `per_turno.js` comprueba esa regla.
  - Si el micrófono se **rechaza** (Safari sin un toque), `capIniciar()` también suelta todo (AudioContext y modo de audio): una versión anterior dejaba `audioSession` en «grabar y reproducir» con un AudioContext vivo, que es justo lo que deja mudo al examinador (`per_turno.js` lo vigila).
  - **iPhone, manos libres (`PERSISTENTE`):** el micrófono queda abierto toda la charla (`abrirSesionMic`), el examinador usa el guion con **audios grabados** (nunca la voz del celular: `speechSynthesis` corta la pista del micrófono abierto, [WebKit 218815](https://bugs.webkit.org/show_bug.cgi?id=218815), y después deja de sonar) y no hay botón «Repetir pregunta» (se le pide al examinador). Mientras habla se mide si el audio llega al micrófono (`eco del examinador…` en el informe: si el parlante suena, el micrófono lo oye). Si se corta el micrófono (una llamada, otra app) pasa a «tocar 🎤» sólo por esa vez. El examinador **con IA** habla con la voz del celular y por eso en iPhone pide «tocar 🎤» (micrófono abierto sólo mientras se contesta). `ios_libres.js` lo prueba.
  - **🔊 Revisión de sonido en 3 pasos** (`abrirSonido`, `modoDe`): nadie puede probar el audio de un iPhone desde afuera, así que la persona marca lo que oye y la app **elige sola el modo**: (1) sin micrófono: «Monday» (voz del celular) y «Tuesday» (grabado); (2) después de usar el micrófono: «Wednesday» (grabado) y «Thursday» (voz); (3) con el micrófono abierto: «Friday» (grabado). Si se oye con el micrófono abierto → *manos libres*; si se oye la voz del celular después del micrófono → *IA tocando 🎤*; si sólo el audio grabado → *preguntas grabadas tocando 🎤*; si nada → se leen las preguntas. Se guarda en `trinity_sonido3` (con nada oído vence a los 10 minutos, lo demás a los 7 días) y en iPhone se ofrece sola la primera vez que se toca *Empezar*; siempre está el botón «🔊 ¿No se oye? Probar el sonido».
  - **Si «Friday» no se oye, el paso 3 prueba otras formas de reproducir el audio** (`ESTRATEGIAS`, una por toque, que el iPhone exige para abrir el micrófono): 0 el mismo `<audio>` de siempre · 1 un `<audio>` nuevo en cada frase · 2 un `<video>` nuevo (el iPhone suele mandar el video al parlante) · 3 Web Audio por el mismo contexto que abre el micrófono. La que se oye queda en `trinity_estr` y la charla manos libres la usa. Si ninguna se oye, todo queda como estaba. `formas.js` lo prueba.
  - **Vigilancia del audio en la charla manos libres** (`decirManosLibres`, `ecoRef`): mientras habla el examinador, el micrófono abierto mide si el audio le llega. Como referencia usa lo que oyó el micrófono en el paso 3 con un audio que la persona **sí** oyó (`ecoA`/`ecoAmb` en `trinity_sonido3`); si ahí el micrófono casi no lo captó (`ecoRef` = 0), medir el eco no sirve en ese equipo y **no se juzga nada**. Una frase de más de 1,3 s (`ECO_MIN_MS`) que terminó pero no llegó al micrófono es **audio mudo**: se muestra escrita, se repite con la forma siguiente (hasta probar las 4, una sola vez por charla) y, si ninguna anda, un aviso explica qué hacer (cerrar la app del todo / usar Safari) con los botones «Probar el sonido» y «Sí lo oigo bien» (apaga la vigilancia: `trinity_eco_off`; rehacer la revisión la vuelve a prender). Se guarda sólo la forma que funcionó. Esto es lo que cubre el «se oye una vez y después no más»: no se puede probar un iPhone desde afuera, así que la app lo mide ella. `mudo.js` lo simula.
  - **App instalada con iOS 26+: recarga sola al volver del fondo.** Si estuvo ≥ 10 s afuera y no hay nada en curso (charla, examen escrito empezado, texto escrito, revisión de sonido, tarjeta de nota) la página se recarga (como cuando se actualiza, que es cuando el audio volvía a andar); como máximo una vez por minuto y vuelve a la misma pestaña. El informe lo anota. `resume.js` lo prueba.
  - ⚠️ **iPhone con iOS 26/27 y la app instalada (Home Screen): el audio puede quedar mudo.** Es un error abierto de Apple ([WebKit 295518](https://bugs.webkit.org/show_bug.cgi?id=295518): `<audio>` deja de sonar al reabrir la app instalada y `play()` responde bien; [WebKit 291892](https://bugs.webkit.org/show_bug.cgi?id=291892): igual con Web Audio). **En Safari común anda.** Se vio en un iPhone con iOS 27.2: los eventos terminan bien y no se oye nada, y anda un momento y después falla. La app avisa cuando detecta iOS ≥ 26 + app instalada (`esInstalada`, `IOS_VER`) y el informe lo registra. Lo que sí es nuestro y se corrigió: la voz silenciosa de «desbloqueo» (`unlockVoice`) interrumpía el audio en curso (en Safari `speechSynthesis.speak` interrumpe los demás medios, [WebKit 218815](https://bugs.webkit.org/show_bug.cgi?id=218815)) y producía `AbortError`; ahora no arranca con un audio sonando, no se repite en cada toque, y `_playUrl` reintenta ante un `AbortError`.
  - La revisión de sonido guardada **vence** (si no se oyó nada, a los 10 minutos; si se oyó algo, a los 7 días), porque «no se oye nada» suele ser pasajero y no debe dejar la app sin voz para siempre. Las frases con nombre («Thank you, Felu.») usan el audio grabado sin el nombre si no hay uno con nombre (`_claveAudio`). `tests/cobertura.js` mide que el examinador de siempre tenga audio grabado en todas sus frases (hoy 100 %).
  - **«Tocar 🎤» guardado** (`trinity_tap2`): si en iPhone se cortó el micrófono de manos libres sólo por una vez no se recuerda; sí se recuerda si la persona lo elige o aprieta «¿No se oye?» en plena charla. Mientras el sonido no esté confirmado, en iPhone el examinador también se lee en pantalla.
  - **Versión nueva:** la versión (y lo que dijo la revisión de sonido) se ve siempre abajo a la izquierda; al abrir, la app se recarga sola una vez si quedó una versión vieja, y al volver del fondo avisa con un botón *Actualizar* (en iPhone una app que vuelve del fondo no se recarga sola).
  - Si algo falla en un celular: 🔧 **Diagnóstico de sonido → 📋 Copiar informe** copia el dispositivo, los ajustes y un registro de lo que pasó con cada voz y cada apertura del micrófono (`rklog`).
- **Preguntas distintas en cada charla — Grade 3 / Felu** (el examinador «de siempre», sin IA; es el que se usa en iPhone con manos libres; el del Grade 4 está en su propia sección, arriba): `MIDDLE` (en `contenido-g3.js`) tiene ~85 preguntas, **8–11 por cada uno de los 9 temas** del Grade 3 (casa, barrio, escuela, rutina, tiempo libre, familia, clima, fechas, pasado), cada una con su respuesta modelo, ayudas y reacciones; y ~40 repreguntas. `armarPasos()` arma cada charla así: saludo (según la hora) y nombre con variantes, a veces una pregunta más de calentamiento (edad / dónde vive), **8 de los 9 temas en orden al azar** (primero los que hace más que no salen), un dibujo de trabajo (después de «familia» si salió) y dos de acción, nunca dos dibujos seguidos, la pregunta del candidato y la despedida, también con variantes. Dentro de cada tema se elige una pregunta que **no haya salido en las últimas charlas**: la memoria está en `localStorage` (`trinity_vistas`, ~2 KB; se guarda por el texto de la pregunta, así que no importa el orden del banco). Las repreguntas salen el 65 % de las veces (`PROB_REPREGUNTA`) y nunca una ya hecha en la charla. «Repetir» dice «Of course.» y **la misma pregunta**, cada una con su audio. `variedad.js` lo prueba.
  - **Examinador con IA:** `planIA()` sortea el orden de los 9 temas de los turnos 3–8 y 10–12 y una pregunta-idea del banco para cada uno, y se lo pasa a la IA como «plan de la charla» (reemplaza el orden de la AGENDA; los turnos 1, 2, 9, 13 y el final siguen como estaban). `ia_plan.js` lo prueba.
  - ⚠️ **Cada frase del examinador tiene que tener su audio grabado** (en iPhone con manos libres no hay otra voz): si se agregan o cambian preguntas hay que volver a generar los audios (ver «Audios grabados»).
- **Dibujos:** el examinador elige de una lista fija (`PIC_LISTA`) y la IA sabe qué muestra cada uno. Si la IA habla de un dibujo y no manda ninguno, la página pone uno acorde; si manda uno sin hablar de él, no se muestra. Así nunca pregunta por una imagen que no se ve.
- **Nota con IA (`iaEvaluar`):** al terminar, la IA lee toda la charla y puntúa de 0 a 10 cuatro criterios (entender y responder, gramática, vocabulario, fluidez). **La nota la calcula la página** (promedio), con letra A–D al estilo Trinity (≥8,5 A · ≥7 B · ≥5,5 C · menos D), y muestra qué hizo bien, qué mejorar (con 🔊 de la versión correcta), temas para repasar y el historial de notas (`localStorage` `trinity_notas`).
  - La página le pasa a la IA **datos contados por ella** (respuestas de una palabra, en español, «no sé», silencios) y **pone topes** si la IA se pone generosa (`_evalTopes`): una charla toda de una palabra o toda en español no puede sacar más de 4–5. Cada tope se explica en la tarjeta.
  - Las frases que la IA dice que el chico dijo se comprueban contra lo que dijo de verdad; si inventó una, se descarta. «Le hizo una pregunta al examinador» también se verifica.
  - La pronunciación **no se mide** (la IA lee el texto transcripto); la tarjeta lo aclara. Es una estimación para practicar, no la nota oficial.
  - Sin IA, o si falla, queda el resumen simple de siempre (porcentaje de respuestas completas).

### Audios grabados
`audio/` tiene un mp3 por frase (voz inglesa de Google Translate, `en-GB`), con nombre = clave de `_audioKey(texto)`, y `audio/manifest.js` con la lista. La página usa el audio grabado si existe y, si no, la voz del celular. **Después de tocar el banco de preguntas, las palabras de estudio o el examen escrito:**
```
cd tools/audio
node lista.js      # arma texts.json con TODAS las frases de las páginas de los dos módulos y dice cuántas faltan (hace falta Playwright)
python3 bajar.py   # baja sólo los mp3 que faltan
node manifest.js   # reescribe audio/manifest.js
node lista.js      # debe decir «faltan: 0»
```
`tests/cobertura.js` (Felu) y `tests/g4_cobertura.js` (Raphina) miden que las frases que de verdad dice el examinador en varias charlas completas —y todo lo que se toca para estudiar, y las preguntas del repaso escrito— tengan audio (hoy 100 %). Los mp3 se pueden compartir entre módulos: el nombre sale del texto de la frase.

### Pasos (con la cuenta dueña de Firebase)
1. https://console.firebase.google.com → crear un proyecto (ej. `trinity-felu`). El plan gratis (Spark) alcanza.
2. **AI Services → AI Logic → Get started** → elegir **Gemini Developer API** y seguir el asistente.
3. ⚙️ **Configuración del proyecto → Tus apps → Web (`</>`)** → registrar la app → copiar el bloque `firebaseConfig`.
4. **App Check → Apps →** la app web → **reCAPTCHA**: crear la clave en https://www.google.com/recaptcha/admin con el dominio `speranzaemiliano-rk.github.io`, pegar la clave *secreta* en Firebase y copiar la clave *de sitio*. (Firebase la exige para AI Logic desde el 2/11/2026.)
5. Pegar los valores en `firebase-config.js` (`config` y `appCheckSiteKey`) y subir el cambio. Esos valores son públicos.

Los modelos a usar están en `firebase-config.js` (`models`); si uno no existe, prueba el siguiente.

### Alternativa: worker propio
`ia-worker/` tiene un Cloudflare Worker equivalente (ver su README). Se activa abriendo el sitio una vez con `?ia=<URL del worker>`.

## Pruebas
`tests/` tiene las pruebas de punta a punta (Playwright + Chromium con micrófono falso; la IA y el audio del iPhone se simulan, porque Firebase App Check no deja que corra desde un entorno de pruebas). Se corre cada una con `node tests/<nombre>.js` (hace falta `npm i playwright`); ver `tests/README.md`. Las que empiezan con `g4_` son las del módulo de Raphina; `g4_sitio.js` prueba el sitio completo (rutas, service worker sin internet, versión nueva y que los datos de los dos módulos no se mezclen). Antes de publicar conviene correr **todas**: los dos módulos comparten el motor.
