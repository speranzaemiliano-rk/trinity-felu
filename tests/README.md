# Pruebas

Pruebas de punta a punta con Playwright (Chromium, micrófono falso). Se corren desde la raíz del repo, una por una:

```
npm i playwright            # una vez (o usar un Playwright global)
node tests/variedad.js
```

Cada una imprime ✓/✗ por chequeo y termina con `TODO OK` (código 0) o `HAY FALLOS`.
Se puede probar el sitio publicado con `URL=https://speranzaemiliano-rk.github.io/trinity-felu/ node tests/<nombre>.js` (no todas lo admiten).

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
