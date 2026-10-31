// Configuración PÚBLICA de Firebase para el examinador con IA (Firebase AI Logic).
// Estos valores NO son secretos: los muestra la consola de Firebase y viajan igual al navegador.
// Se completan con lo que da: Firebase → Configuración del proyecto → Tus apps → Web (</>) → "Configuración del SDK".
// Mientras estén vacíos, el sitio usa las preguntas de siempre (sin IA).
window.TRINITY_FB = {
  config: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },
  // Clave de sitio de reCAPTCHA (Firebase → App Check → Apps → Web). Obligatoria para AI Logic desde el 2/11/2026.
  appCheckSiteKey: "",
  appCheckEnterprise: false,   // true sólo si se eligió reCAPTCHA Enterprise en vez de reCAPTCHA v3
  // Modelos a probar en orden (si uno no está disponible pasa al siguiente)
  models: ["gemini-3.8-flash", "gemini-3.5-flash-lite"]
};
