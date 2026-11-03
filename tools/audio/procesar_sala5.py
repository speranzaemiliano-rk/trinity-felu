#!/usr/bin/env python3
"""«Sala de 5»: deja las voces FUERTES y SIN SILENCIOS.

Las voces que baja Google Translate salen bajitas (unos -20 dB de volumen medio, picos en -4 dB) y con 0,1 a 0,3 s de silencio antes de hablar,
que en una nena de 5 años se sienten como «lenta y baja». Este proceso, para cada frase:
  1. saca el silencio del principio y del final (con una entrada y una salida suaves, para que no haga «clic»);
  2. corta los graves que no son voz (filtro de 90 Hz) y comprime un poco (el habla tiene picos altos que no dejan subir el volumen);
  3. sube el volumen medio a unos -13,5 dB (lo que suena un podcast o un video), dejando el pico en -2 dB con un limitador;
  4. vuelve a armar el mp3 (mono, 24 kHz, 64 kbps) con la marca «sala5-audio-v2» en la etiqueta (las pruebas comprueban que ninguno haya quedado sin procesar).

Los mp3 «crudos» (tal cual los baja Google) quedan en tools/audio/crudos/ (no se suben al repositorio) para poder volver a procesarlos con otros valores
sin bajarlos de nuevo.  Uso (desde esta carpeta):
    python3 procesar_sala5.py          # procesa los que faltan (o los que no tienen la marca)
    python3 procesar_sala5.py --todo   # vuelve a procesar TODOS desde los crudos (después de cambiar los valores de abajo)
Lo usa también bajar_sala5.py para cada frase nueva.
"""
import os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

AQUI = os.path.dirname(os.path.abspath(__file__))
CRUDOS = os.path.join(AQUI, 'crudos') + os.sep
FINAL = os.path.normpath(os.path.join(AQUI, '..', '..', 'sala5', 'audio')) + os.sep
MARCA = b'sala5-audio-v2'

OBJ_MEDIA = -13.5        # volumen medio buscado (dB)
TECHO = -2.0             # pico máximo (dBFS): al volver a armar el mp3 el pico puede subir hasta 1 dB, y así no llega a la saturación
MARGEN_LIMITADOR = 4.0   # cuántos dB de pico puede recortar el limitador para llegar al volumen buscado

# 1 y 2: sin silencio al principio y al final (el del final se saca dando vuelta el audio), entrada y salida suaves, sin graves, y un poco de compresión
PRE = ("silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.005:detection=peak,"
       "areverse,silenceremove=start_periods=1:start_threshold=-50dB:start_duration=0.005:detection=peak,afade=t=in:d=0.02,areverse,"
       "afade=t=in:d=0.008,highpass=f=90,"
       "acompressor=threshold=-24dB:ratio=3.5:attack=3:release=60:makeup=1")


def procesado(f):
    """¿Ya está procesado (existe y tiene la marca en la etiqueta)?"""
    try:
        if os.path.getsize(f) < 600:
            return False
        with open(f, 'rb') as a:
            return MARCA in a.read(600)
    except OSError:
        return False


def _medir(af, f):
    v = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', f, '-af', af + ',volumedetect', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m, p = re.search(r'mean_volume: (-?[\d.]+)', v), re.search(r'max_volume: (-?[\d.]+)', v)
    if not m or not p:
        raise RuntimeError('no se pudo medir ' + f)
    return float(m.group(1)), float(p.group(1))


def procesar(src, dst):
    """crudo → procesado. Devuelve la ganancia aplicada (dB).
    Después de armar el mp3 se mide el pico de verdad (el mp3 puede pasarse hasta 2 dB de lo que dejó el limitador, sobre todo en los «sh» y «s»):
    si quedó arriba de -1 dB se baja el techo lo que se pasó y se vuelve a armar."""
    media, pico = _medir(PRE, src)
    techo = TECHO
    tmp = dst + '.tmp.mp3'
    for _ in range(4):
        g = min(OBJ_MEDIA - media, (techo - pico) + MARGEN_LIMITADOR)
        af = PRE + ',volume=%.2fdB,alimiter=limit=%.3f:attack=1.5:release=25:level=false' % (g, 10 ** (techo / 20))
        subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', src, '-af', af, '-ar', '24000', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '64k',
                        '-metadata', 'comment=' + MARCA.decode(), tmp], check=True)
        _, pico_final = _medir('anull', tmp)
        if pico_final <= -1.0:
            break
        techo -= pico_final + 1.5
    os.replace(tmp, dst)
    return g


def estadisticas(archivos):
    """volumen medio y pico de cada mp3 procesado (para comprobar el resultado)"""
    res = []
    for f in archivos:
        try:
            res.append((f,) + _medir('anull', f))
        except RuntimeError:
            res.append((f, None, None))
    return res


if __name__ == '__main__':
    todo = '--todo' in sys.argv
    if not os.path.isdir(CRUDOS):
        sys.exit('no hay crudos en ' + CRUDOS + ' (se llenan con bajar_sala5.py, o copiando los mp3 de sala5/audio/ antes de procesarlos por primera vez)')
    os.makedirs(FINAL, exist_ok=True)
    claves = sorted(f[:-4] for f in os.listdir(CRUDOS) if f.endswith('.mp3'))
    pendientes = [k for k in claves if todo or not procesado(FINAL + k + '.mp3')]
    print('crudos:', len(claves), '| por procesar:', len(pendientes), flush=True)
    fallos = []

    def uno(k):
        try:
            return k, procesar(CRUDOS + k + '.mp3', FINAL + k + '.mp3'), None
        except Exception as e:  # noqa
            return k, None, str(e)

    with ThreadPoolExecutor(6) as ex:
        for i, (k, g, err) in enumerate(ex.map(uno, pendientes)):
            if err:
                fallos.append((k, err))
            if i % 100 == 0:
                print('progreso', i, '/', len(pendientes), flush=True)
    print('LISTO. fallaron:', len(fallos), fallos[:5], flush=True)
    if pendientes:
        est = [x for x in estadisticas([FINAL + k + '.mp3' for k in pendientes]) if x[1] is not None]
        if est:
            medias = [x[1] for x in est]
            picos = [x[2] for x in est]
            print('volumen medio: de %.1f a %.1f dB (promedio %.1f) | picos: de %.1f a %.1f dB' % (min(medias), max(medias), sum(medias) / len(medias), min(picos), max(picos)))
