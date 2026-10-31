import os
import subprocess
import numpy as np
from scipy.io import wavfile

SAMPLE_RATE = 48000
DURATION = 15.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)

# Load synth bed
sr, bed = wavfile.read('videos/float-intro/synth_bed.wav')
if bed.dtype != np.float32:
    bed = bed.astype(np.float32) / 32768.0

if len(bed) < TOTAL_SAMPLES:
    bed = np.pad(bed, ((0, TOTAL_SAMPLES - len(bed)), (0, 0)))
else:
    bed = bed[:TOTAL_SAMPLES]

# Helper to load and resample/convert an audio file using ffmpeg
def load_sfx(path):
    out_wav = path.replace('.mp3', '.wav')
    cmd = [
        'ffmpeg', '-y', '-i', path,
        '-ar', str(SAMPLE_RATE),
        '-ac', '2',
        '-sample_fmt', 's16',
        out_wav
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
    _, data = wavfile.read(out_wav)
    os.remove(out_wav)
    return data.astype(np.float32) / 32768.0

# Sound effects to layer with exact timing and gains
sfx_cues = [
    # (time_sec, sfx_file, volume_gain)
    (0.2, 'videos/float-intro/sfx/whoosh-short.mp3', 0.45),
    (3.4, 'videos/float-intro/sfx/whoosh-cinematic.mp3', 0.65),
    (3.6, 'videos/float-intro/sfx/pop.mp3', 0.35),
    (5.25, 'videos/float-intro/sfx/pop.mp3', 0.6),
    (5.32, 'videos/float-intro/sfx/chime.mp3', 0.55),
    (7.4, 'videos/float-intro/sfx/whoosh.mp3', 0.5),
    (8.35, 'videos/float-intro/sfx/pop.mp3', 0.45),
    (8.4, 'videos/float-intro/sfx/sparkle.mp3', 0.4),
    (10.5, 'videos/float-intro/sfx/riser.mp3', 0.5),
    (11.25, 'videos/float-intro/sfx/impact-bass-1.mp3', 0.85),
    (11.35, 'videos/float-intro/sfx/chime.mp3', 0.6),
    (12.0, 'videos/float-intro/sfx/sparkle.mp3', 0.45),
]

# Mix bed and SFX
mix = np.copy(bed) * 0.85

for t_sec, sfx_path, vol in sfx_cues:
    if not os.path.exists(sfx_path):
        continue
    sfx_data = load_sfx(sfx_path) * vol
    start_idx = int(t_sec * SAMPLE_RATE)
    avail_len = min(len(sfx_data), TOTAL_SAMPLES - start_idx)
    if avail_len > 0 and start_idx < TOTAL_SAMPLES:
        mix[start_idx:start_idx + avail_len] += sfx_data[:avail_len]

# Master Limiter / Soft Clip
peak = np.max(np.abs(mix))
if peak > 0.96:
    mix = mix * (0.94 / peak)

# Fade out last 0.5s smoothly
fade_samples = int(0.6 * SAMPLE_RATE)
fade_env = np.linspace(1.0, 0.0, fade_samples)
mix[-fade_samples:, 0] *= fade_env
mix[-fade_samples:, 1] *= fade_env

out_mix_wav = 'videos/float-intro/soundtrack.wav'
wavfile.write(out_mix_wav, SAMPLE_RATE, np.int16(mix * 32767))

# Convert to high-quality AAC/MP3
out_mp3 = 'videos/float-intro/soundtrack.mp3'
subprocess.run([
    'ffmpeg', '-y', '-i', out_mix_wav,
    '-b:a', '256k',
    out_mp3
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

print("soundtrack.mp3 generated and mastered!")
