// Examinador con IA para Trinity GESE Grade 3 — Cloudflare Worker (plan gratuito alcanza)
// La clave de Gemini vive SOLO acá como secreto (GEMINI_API_KEY); nunca en el sitio público.
// Variables: GEMINI_API_KEY (secreto) · ALLOWED_ORIGIN (ej. https://speranzaemiliano-rk.github.io) · MODEL (opcional)
const SISTEMA = `You are a kind, patient examiner for the Trinity GESE Grade 3 oral exam (CEFR A1-A2).
You are talking with Felu, a 10-year-old child from Argentina learning English.
Rules:
- Use very simple English: short sentences, easy words. Speak like a friendly teacher.
- Ask ONE question at a time. Never repeat a question already asked. Vary the topics: family, pets, school, daily routine, favourite things, weekend, house, town, food, sports, weather, birthday, jobs, past (was/were), can/can't, prepositions of place.
- First react briefly to what the child said (one short sentence), then ask the next question. Use the child's name or details when you can.
- If the child did not understand or asks to repeat, repeat more slowly with simpler words.
- Grade 3 grammar only: present simple, present continuous, can, there is/are, was/were, prepositions, wh- questions.
- When turn >= max, say a warm goodbye instead of a question and set "end": true.
Answer ONLY with JSON: {"reply": string, "ok": boolean, "tip": string, "model": string, "end": boolean}
- "reply": what the examiner says out loud (English only).
- "ok": true if the child's last answer was a complete, relevant sentence in English (small mistakes are fine); false if it was empty, off-topic, in Spanish or only one word.
- "tip": if ok is false, one short helpful tip in SPANISH (max 20 words); otherwise "".
- "model": if ok is false, a short correct example answer in English; otherwise "".
- "end": true only for the goodbye.`;

const limite = new Map(); // límite por IP (aproximado, por instancia)
const json = (o, s, h) => new Response(JSON.stringify(o), { status: s || 200, headers: { 'Content-Type': 'application/json', ...h } });

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const permitido = env.ALLOWED_ORIGIN || 'https://speranzaemiliano-rk.github.io';
    const cors = { 'Access-Control-Allow-Origin': origin === permitido ? origin : permitido, 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST') return json({ error: 'método no permitido' }, 405, cors);
    if (origin !== permitido) return json({ error: 'origen no permitido' }, 403, cors);

    const ip = req.headers.get('CF-Connecting-IP') || 'x', ahora = Date.now();
    const r = (limite.get(ip) || []).filter(t => ahora - t < 60000);
    if (r.length >= 30) return json({ error: 'demasiados pedidos, esperá un minuto' }, 429, cors);
    r.push(ahora); limite.set(ip, r);

    let body; try { body = await req.json(); } catch (e) { return json({ error: 'JSON inválido' }, 400, cors); }
    // Transcripción de audio (plan B cuando el dictado del navegador no anda)
    if (body.audio) {
      if (!env.GEMINI_API_KEY) return json({ error: 'falta GEMINI_API_KEY' }, 500, cors);
      const mime = String(body.mime || 'audio/webm').split(';')[0];
      if (!/^audio\/(webm|ogg|mp4|mpeg|wav|aac)$/.test(mime) || String(body.audio).length > 2000000) return json({ error: 'audio no válido' }, 400, cors);
      const rs = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${env.MODEL || 'gemini-2.5-flash'}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ inlineData: { mimeType: mime, data: body.audio } }, { text: 'Transcribe exactly what the speaker says. The speaker is a child learning English; the speech is English (sometimes with a Spanish accent). Output ONLY the transcription text, nothing else. If there is no speech, output an empty string.' }] }], generationConfig: { temperature: 0, maxOutputTokens: 200 } })
      });
      if (!rs.ok) return json({ error: 'la IA no respondió (' + rs.status + ')' }, 502, cors);
      const dd = await rs.json();
      const text = ((dd.candidates && dd.candidates[0] && dd.candidates[0].content && dd.candidates[0].content.parts) || []).map(x => x.text || '').join('').trim().slice(0, 300);
      return json({ text }, 200, cors);
    }
    const msgs = Array.isArray(body.messages) ? body.messages.slice(-24) : [];
    const turn = Math.min(30, Math.max(1, +body.turn || 1)), max = Math.min(14, Math.max(4, +body.max || 8));
    const contents = msgs.map(m => ({ role: m.role === 'child' ? 'user' : 'model', parts: [{ text: String(m.text || '').slice(0, 300) }] }));
    if (!contents.length || contents[0].role !== 'user') contents.unshift({ role: 'user', parts: [{ text: '(The child sits down. Start the exam with a greeting and a first question.)' }] });
    if (!env.GEMINI_API_KEY) return json({ error: 'falta GEMINI_API_KEY' }, 500, cors);

    const modelo = env.MODEL || 'gemini-2.5-flash';
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SISTEMA + `\nturn=${turn} max=${max}` }] },
        contents, generationConfig: { temperature: 0.9, maxOutputTokens: 400, responseMimeType: 'application/json' }
      })
    });
    if (!resp.ok) return json({ error: 'la IA no respondió (' + resp.status + ')' }, 502, cors);
    const d = await resp.json();
    let o; try { o = JSON.parse(d.candidates[0].content.parts.map(p => p.text).join('')); } catch (e) { return json({ error: 'respuesta inválida de la IA' }, 502, cors); }
    return json({ reply: String(o.reply || '').slice(0, 400), ok: !!o.ok, tip: String(o.tip || '').slice(0, 200), model: String(o.model || '').slice(0, 200), end: !!o.end }, 200, cors);
  }
};
