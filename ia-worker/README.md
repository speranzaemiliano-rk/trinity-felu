# Examinador con IA (Cloudflare Worker)

Convierte la conversación en una charla real: el examinador inventa preguntas nuevas y reacciona a lo que contesta Felu.
La clave de Gemini queda guardada en Cloudflare como secreto, **no** en el sitio.

1. Crear cuenta gratis en https://dash.cloudflare.com → **Workers & Pages → Create → Create Worker** → nombre `trinity-felu-ia` → Deploy.
2. **Edit code**, pegar el contenido de `worker.js` y **Deploy**.
3. **Settings → Variables and Secrets**: agregar `GEMINI_API_KEY` (tipo *Secret*, la clave de https://aistudio.google.com/apikey) y, opcional, `ALLOWED_ORIGIN` = `https://speranzaemiliano-rk.github.io`.
4. Copiar la URL del worker (`https://trinity-felu-ia.<tu-usuario>.workers.dev`) y pasársela a Claude para dejarla en `motor.js` (constante `IA_URL`), o abrir un módulo una vez con `?ia=<esa URL>` (por ejemplo `…/trinity-felu/felu/?ia=…`).

Protecciones: sólo responde al origen del sitio, máx. 20 pedidos por minuto por IP, mensajes cortos y respuesta de máx. 400 tokens.
