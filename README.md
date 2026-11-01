# Trinity GESE Grade 3

Sitio de estudio para el examen oral Trinity GESE Grade 3 (para Felu). Un solo `index.html`, sin build.
Se publica en https://speranzaemiliano-rk.github.io/trinity-felu/ y se puede instalar como app.

## Examinador con IA (Firebase AI Logic)

Sin esto el sitio funciona igual, con preguntas armadas de antemano y el dictado del navegador.
Con la IA conectada:
- el examinador inventa preguntas nuevas y reacciona a lo que contesta Felu;
- la voz **se graba y la transcribe Gemini**, así el micrófono anda también en Safari/iPhone y donde el dictado del navegador falla.

No hay servidor ni claves secretas en el sitio: la IA corre por Firebase AI Logic.

### Cómo funciona la charla y la nota
- **Manos libres:** cada respuesta abre el micrófono solo (sin tocar 🎤) y lo **suelta antes de que hable el examinador**. Si el navegador no deja abrirlo sin un toque (Safari en iPhone), pasa a «tocar 🎤», avisa y lo recuerda (`trinity_tap`).
  - ⚠️ **Regla de audio en iPhone: nada abierto mientras habla el examinador.** Con el micrófono (o un AudioContext) abierto, la voz del navegador (`speechSynthesis`) silencia la pista del micrófono y no se puede reactivar ([WebKit 218815](https://bugs.webkit.org/show_bug.cgi?id=218815), reproducido en iOS 27) y el audio de la página sale muteado o degradado. «Manos libres v1» dejó el micrófono abierto toda la charla y el examinador quedó mudo. `capIniciar()` abre, `capDetener()` suelta (pistas, AudioContext y `audioSession`) y `per_turno.js` comprueba esa regla.
  - Si algo falla en un celular: 🔧 **Diagnóstico de sonido → 📋 Copiar informe** copia el dispositivo, los ajustes y un registro de lo que pasó con cada voz y cada apertura del micrófono (`rklog`).
- **Dibujos:** el examinador elige de una lista fija (`PIC_LISTA`) y la IA sabe qué muestra cada uno. Si la IA habla de un dibujo y no manda ninguno, la página pone uno acorde; si manda uno sin hablar de él, no se muestra. Así nunca pregunta por una imagen que no se ve.
- **Nota con IA (`iaEvaluar`):** al terminar, la IA lee toda la charla y puntúa de 0 a 10 cuatro criterios (entender y responder, gramática, vocabulario, fluidez). **La nota la calcula la página** (promedio), con letra A–D al estilo Trinity (≥8,5 A · ≥7 B · ≥5,5 C · menos D), y muestra qué hizo bien, qué mejorar (con 🔊 de la versión correcta), temas para repasar y el historial de notas (`localStorage` `trinity_notas`).
  - La página le pasa a la IA **datos contados por ella** (respuestas de una palabra, en español, «no sé», silencios) y **pone topes** si la IA se pone generosa (`_evalTopes`): una charla toda de una palabra o toda en español no puede sacar más de 4–5. Cada tope se explica en la tarjeta.
  - Las frases que la IA dice que el chico dijo se comprueban contra lo que dijo de verdad; si inventó una, se descarta. «Le hizo una pregunta al examinador» también se verifica.
  - La pronunciación **no se mide** (la IA lee el texto transcripto); la tarjeta lo aclara. Es una estimación para practicar, no la nota oficial.
  - Sin IA, o si falla, queda el resumen simple de siempre (porcentaje de respuestas completas).

### Pasos (con la cuenta dueña de Firebase)
1. https://console.firebase.google.com → crear un proyecto (ej. `trinity-felu`). El plan gratis (Spark) alcanza.
2. **AI Services → AI Logic → Get started** → elegir **Gemini Developer API** y seguir el asistente.
3. ⚙️ **Configuración del proyecto → Tus apps → Web (`</>`)** → registrar la app → copiar el bloque `firebaseConfig`.
4. **App Check → Apps →** la app web → **reCAPTCHA**: crear la clave en https://www.google.com/recaptcha/admin con el dominio `speranzaemiliano-rk.github.io`, pegar la clave *secreta* en Firebase y copiar la clave *de sitio*. (Firebase la exige para AI Logic desde el 2/11/2026.)
5. Pegar los valores en `firebase-config.js` (`config` y `appCheckSiteKey`) y subir el cambio. Esos valores son públicos.

Los modelos a usar están en `firebase-config.js` (`models`); si uno no existe, prueba el siguiente.

### Alternativa: worker propio
`ia-worker/` tiene un Cloudflare Worker equivalente (ver su README). Se activa abriendo el sitio una vez con `?ia=<URL del worker>`.
