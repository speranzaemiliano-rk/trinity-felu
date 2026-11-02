# Baja el audio de cada frase de texts.json a ../../audio/<clave>.mp3 (voz inglesa de Google Translate, en-GB).
# Sólo baja las que faltan, así que se puede volver a correr sin problema.  Uso:  python3 bajar.py
import json, subprocess, os, time
from concurrent.futures import ThreadPoolExecutor
AQUI = os.path.dirname(os.path.abspath(__file__))
D = os.path.normpath(os.path.join(AQUI, '..', '..', 'audio')) + os.sep
items = json.load(open(os.path.join(AQUI, 'texts.json'), encoding='utf-8'))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def uno(it):
    k, t = it['k'], it['t']
    f = D + k + '.mp3'
    if os.path.exists(f) and os.path.getsize(f) > 800:
        return (k, True, 'ya estaba')
    for intento in range(4):
        r = subprocess.run(['curl', '-sS', '-m', '25', '-G', '-A', UA, '--data-urlencode', 'q=' + t, '-d', 'ie=UTF-8', '-d', 'client=tw-ob', '-d', 'tl=en-GB',
                            '-o', f + '.tmp', '-w', '%{http_code}', 'https://translate.google.com/translate_tts'], capture_output=True, text=True)
        ok = r.stdout.strip() == '200' and os.path.exists(f + '.tmp') and os.path.getsize(f + '.tmp') > 800
        if ok:
            head = open(f + '.tmp', 'rb').read(3)
            if head[:3] == b'ID3' or head[0:1] == b'\xff':
                os.replace(f + '.tmp', f)
                return (k, True, '')
        time.sleep(2 + intento * 3)
    if os.path.exists(f + '.tmp'):
        os.remove(f + '.tmp')
    return (k, False, t)

fallos = []
nuevos = [it for it in items if not (os.path.exists(D + it['k'] + '.mp3') and os.path.getsize(D + it['k'] + '.mp3') > 800)]
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
