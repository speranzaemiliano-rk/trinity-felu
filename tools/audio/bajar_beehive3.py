# Baja el audio de cada frase de beehive3_texts.json (voz de Google Translate en inglés británico, en-GB) a tools/audio/crudos_beehive3/<clave>.mp3
# y lo procesa (volumen, sin silencios: el mismo proceso que «Sala de 5», ver procesar_sala5.py) a ../../beehive3/audio/<clave>.mp3.
# Sólo baja y procesa lo que falta, así que se puede volver a correr sin problema.  Uso:  python3 bajar_beehive3.py      (hace falta ffmpeg)
import json, subprocess, os, time, sys
from concurrent.futures import ThreadPoolExecutor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import procesar_sala5 as P
AQUI = os.path.dirname(os.path.abspath(__file__))
P.CRUDOS = os.path.join(AQUI, 'crudos_beehive3') + os.sep
P.FINAL = os.path.normpath(os.path.join(AQUI, '..', '..', 'beehive3', 'audio')) + os.sep
items = json.load(open(os.path.join(AQUI, 'beehive3_texts.json'), encoding='utf-8'))
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

def crudo_ok(f):
    return os.path.exists(f) and os.path.getsize(f) > 600

def uno(it):
    k, t = it['k'], it['tts']
    crudo, final = P.CRUDOS + k + '.mp3', P.FINAL + k + '.mp3'
    if not crudo_ok(crudo):
        for intento in range(4):
            r = subprocess.run(['curl', '-sS', '-m', '25', '-G', '-A', UA, '--data-urlencode', 'q=' + t, '-d', 'ie=UTF-8', '-d', 'client=tw-ob', '-d', 'tl=en-GB',
                                '-o', crudo + '.tmp', '-w', '%{http_code}', 'https://translate.google.com/translate_tts'], capture_output=True, text=True)
            ok = r.stdout.strip() == '200' and crudo_ok(crudo + '.tmp')
            if ok:
                head = open(crudo + '.tmp', 'rb').read(3)
                if head[:3] == b'ID3' or head[0:1] == b'\xff':
                    os.replace(crudo + '.tmp', crudo)
                    break
            time.sleep(2 + intento * 3)
        if os.path.exists(crudo + '.tmp'):
            os.remove(crudo + '.tmp')
        if not crudo_ok(crudo):
            return (k, False, t)
    if not P.procesado(final):
        try:
            P.procesar(crudo, final)
        except Exception as e:  # noqa
            return (k, False, 'no se pudo procesar: ' + str(e))
    return (k, True, '')

os.makedirs(P.CRUDOS, exist_ok=True)
os.makedirs(P.FINAL, exist_ok=True)
fallos = []
pendientes = [it for it in items if not P.procesado(P.FINAL + it['k'] + '.mp3')]
print('por bajar o procesar:', len(pendientes), 'de', len(items), flush=True)
with ThreadPoolExecutor(4) as ex:
    for i, (k, ok, info) in enumerate(ex.map(uno, pendientes)):
        if not ok:
            fallos.append(info)
        if i % 50 == 0:
            print('progreso', i, '/', len(pendientes), flush=True)
print('LISTO. fallaron:', len(fallos), fallos[:10], flush=True)
