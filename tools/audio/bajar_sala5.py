# Baja el audio de cada frase de sala5_texts.json a ../../sala5/audio/<clave>.mp3 (voz de Google Translate: es-419 = español latinoamericano, en-GB = inglés británico).
# Sólo baja las que faltan, así que se puede volver a correr sin problema.  Uso:  python3 bajar_sala5.py
import json, subprocess, os, time
from concurrent.futures import ThreadPoolExecutor
AQUI = os.path.dirname(os.path.abspath(__file__))
D = os.path.normpath(os.path.join(AQUI, '..', '..', 'sala5', 'audio')) + os.sep
items = json.load(open(os.path.join(AQUI, 'sala5_texts.json'), encoding='utf-8'))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'
IDIOMA = {'es': 'es-419', 'en': 'en-GB'}

def uno(it):
    k, t, tl = it['k'], it['tts'], IDIOMA[it['l']]
    f = D + k + '.mp3'
    if os.path.exists(f) and os.path.getsize(f) > 600:
        return (k, True, 'ya estaba')
    for intento in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '25', '-G', '-A', UA, '--data-urlencode', 'q=' + t, '-d', 'ie=UTF-8', '-d', 'client=tw-ob', '-d', 'tl=' + tl,
                            '-o', f + '.tmp', '-w', '%{http_code}', 'https://translate.google.com/translate_tts'], capture_output=True, text=True)
        ok = r.stdout.strip() == '200' and os.path.exists(f + '.tmp') and os.path.getsize(f + '.tmp') > 600
        if ok:
            head = open(f + '.tmp', 'rb').read(3)
            if head[:3] == b'ID3' or head[0:1] == b'\xff':
                os.replace(f + '.tmp', f)
                return (k, True, '')
        time.sleep(2 + intento * 3)
    if os.path.exists(f + '.tmp'):
        os.remove(f + '.tmp')
    return (k, False, t)

os.makedirs(D, exist_ok=True)
fallos = []
nuevos = [it for it in items if not (os.path.exists(D + it['k'] + '.mp3') and os.path.getsize(D + it['k'] + '.mp3') > 600)]
print('por bajar:', len(nuevos), 'de', len(items), flush=True)
with ThreadPoolExecutor(4) as ex:
    for i, (k, ok, info) in enumerate(ex.map(uno, items)):
        if not ok:
            fallos.append(info)
        if i % 100 == 0:
            print('progreso', i, '/', len(items), flush=True)
print('LISTO. fallaron:', len(fallos), fallos[:10], flush=True)
mp3 = [f for f in os.listdir(D) if f.endswith('.mp3')]
print('archivos:', len(mp3), '| peso total: %.1f MB' % (sum(os.path.getsize(D + f) for f in mp3) / 1e6), flush=True)
