# Trinity GESE Grade 3

Sitio de estudio para el examen oral Trinity GESE Grade 3 (para Felu). Un solo `index.html`, sin build.
Se publica en https://speranzaemiliano-rk.github.io/trinity-felu/ y se puede instalar como app.

## Examinador con IA (Firebase AI Logic)

Sin esto el sitio funciona igual, con preguntas armadas de antemano y el dictado del navegador.
Con la IA conectada:
- el examinador inventa preguntas nuevas y reacciona a lo que contesta Felu;
- la voz **se graba y la transcribe Gemini**, así el micrófono anda también en Safari/iPhone y donde el dictado del navegador falla.

No hay servidor ni claves secretas en el sitio: la IA corre por Firebase AI Logic.

### Pasos (con la cuenta dueña de Firebase)
1. https://console.firebase.google.com → crear un proyecto (ej. `trinity-felu`). El plan gratis (Spark) alcanza.
2. **AI Services → AI Logic → Get started** → elegir **Gemini Developer API** y seguir el asistente.
3. ⚙️ **Configuración del proyecto → Tus apps → Web (`</>`)** → registrar la app → copiar el bloque `firebaseConfig`.
4. **App Check → Apps →** la app web → **reCAPTCHA**: crear la clave en https://www.google.com/recaptcha/admin con el dominio `speranzaemiliano-rk.github.io`, pegar la clave *secreta* en Firebase y copiar la clave *de sitio*. (Firebase la exige para AI Logic desde el 2/11/2026.)
5. Pegar los valores en `firebase-config.js` (`config` y `appCheckSiteKey`) y subir el cambio. Esos valores son públicos.

Los modelos a usar están en `firebase-config.js` (`models`); si uno no existe, prueba el siguiente.

### Alternativa: worker propio
`ia-worker/` tiene un Cloudflare Worker equivalente (ver su README). Se activa abriendo el sitio una vez con `?ia=<URL del worker>`.
