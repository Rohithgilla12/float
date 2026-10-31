import numpy as np
from scipy.io import wavfile
import subprocess
import os

SAMPLE_RATE = 48000
DURATION = 15.0
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION)
t = np.linspace(0, DURATION, TOTAL_SAMPLES, endpoint=False)

left = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
right = np.zeros(TOTAL_SAMPLES, dtype=np.float32)

BPM = 120.0
BEAT_DUR = 60.0 / BPM  # 0.5s per beat

def add_tone(start_t, dur, freq, amp=0.3, wave_type='sine', pan=0.0, attack=0.01, decay=0.1):
    start_idx = int(start_t * SAMPLE_RATE)
    dur_samples = int(dur * SAMPLE_RATE)
    end_idx = min(start_idx + dur_samples, TOTAL_SAMPLES)
    if start_idx >= TOTAL_SAMPLES:
        return
    actual_len = end_idx - start_idx
    local_t = np.linspace(0, actual_len / SAMPLE_RATE, actual_len, endpoint=False)
    
    if wave_type == 'sine':
        sig = np.sin(2 * np.pi * freq * local_t)
    elif wave_type == 'saw':
        sig = 2.0 * (local_t * freq - np.floor(local_t * freq + 0.5))
    elif wave_type == 'square':
        sig = np.sign(np.sin(2 * np.pi * freq * local_t))
    elif wave_type == 'triangle':
        sig = 2.0 * np.abs(2.0 * (local_t * freq - np.floor(local_t * freq + 0.5))) - 1.0
    else:
        sig = np.sin(2 * np.pi * freq * local_t)

    # Envelope
    env = np.ones(actual_len, dtype=np.float32)
    att_samples = int(attack * SAMPLE_RATE)
    dec_samples = int(decay * SAMPLE_RATE)
    if att_samples > 0:
        att_len = min(att_samples, actual_len)
        env[:att_len] = np.linspace(0, 1, att_len)
    if dec_samples > 0:
        dec_len = min(dec_samples, actual_len)
        env[-dec_len:] *= np.linspace(1, 0, dec_len)

    sig = sig * env * amp
    l_gain = np.cos((pan + 1.0) * np.pi / 4.0)
    r_gain = np.sin((pan + 1.0) * np.pi / 4.0)
    left[start_idx:end_idx] += sig * l_gain
    right[start_idx:end_idx] += sig * r_gain

def add_kick(start_t, amp=0.8):
    start_idx = int(start_t * SAMPLE_RATE)
    dur = 0.28
    actual_len = min(int(dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    if actual_len <= 0 or start_idx >= TOTAL_SAMPLES:
        return
    local_t = np.linspace(0, actual_len / SAMPLE_RATE, actual_len, endpoint=False)
    freq = 150.0 * np.exp(-local_t * 28.0) + 45.0
    phase = 2 * np.pi * np.cumsum(freq) / SAMPLE_RATE
    sig = np.sin(phase) * np.exp(-local_t * 12.0) * amp
    click = (np.random.rand(min(120, actual_len)) * 2 - 1) * amp * 0.3 * np.exp(-np.linspace(0, 1, min(120, actual_len)) * 8)
    sig[:len(click)] += click
    left[start_idx:start_idx+actual_len] += sig * 0.7
    right[start_idx:start_idx+actual_len] += sig * 0.7

def add_snare(start_t, amp=0.5):
    start_idx = int(start_t * SAMPLE_RATE)
    dur = 0.22
    actual_len = min(int(dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    if actual_len <= 0 or start_idx >= TOTAL_SAMPLES:
        return
    local_t = np.linspace(0, actual_len / SAMPLE_RATE, actual_len, endpoint=False)
    tone = np.sin(2 * np.pi * 185.0 * local_t) * np.exp(-local_t * 22.0) * 0.4
    noise = (np.random.rand(actual_len) * 2 - 1) * np.exp(-local_t * 16.0) * 0.6
    sig = (tone + noise) * amp
    left[start_idx:start_idx+actual_len] += sig * 0.7
    right[start_idx:start_idx+actual_len] += sig * 0.7

def add_hat(start_t, amp=0.2, pan=0.0):
    start_idx = int(start_t * SAMPLE_RATE)
    dur = 0.06
    actual_len = min(int(dur * SAMPLE_RATE), TOTAL_SAMPLES - start_idx)
    if actual_len <= 0 or start_idx >= TOTAL_SAMPLES:
        return
    local_t = np.linspace(0, actual_len / SAMPLE_RATE, actual_len, endpoint=False)
    noise = (np.random.rand(actual_len) * 2 - 1) * np.exp(-local_t * 60.0) * amp
    l_gain = np.cos((pan + 1.0) * np.pi / 4.0)
    r_gain = np.sin((pan + 1.0) * np.pi / 4.0)
    left[start_idx:start_idx+actual_len] += noise * l_gain
    right[start_idx:start_idx+actual_len] += noise * r_gain

# 1. Warm Ambient Pad Intro (0s - 3.5s)
# Chords: F minor (F3, Ab3, C4, Eb4) -> Db major (Db3, F3, Ab3, C4)
intro_chords = [
    (0.0, 3.4, [174.61, 207.65, 261.63, 311.13]), # Fm7
]
for start_t, dur, freqs in intro_chords:
    for i, f in enumerate(freqs):
        pan = (i / (len(freqs) - 1)) * 1.2 - 0.6 if len(freqs) > 1 else 0.0
        add_tone(start_t, dur, f, amp=0.12, wave_type='triangle', pan=pan, attack=0.8, decay=0.6)
        add_tone(start_t, dur, f * 1.003, amp=0.08, wave_type='saw', pan=-pan, attack=0.9, decay=0.6)
        # Deep Sub Drone
        add_tone(start_t, dur, freqs[0] / 2.0, amp=0.22, wave_type='sine', pan=0.0, attack=0.5, decay=0.5)

# 2. Main Groove Drums & Synths (3.5s - 11.0s)
# 120 BPM: beats at 3.5, 4.0, 4.5, 5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0, 10.5
beat_times = np.arange(3.5, 10.8, 0.5)
for i, bt in enumerate(beat_times):
    # Kicks on beats 1 & 3 of measure
    if i % 2 == 0:
        add_kick(bt, amp=0.85)
    else:
        # Snares on beats 2 & 4
        add_snare(bt, amp=0.55)
    
    # 16th note hi-hats
    for sub in [0.0, 0.125, 0.25, 0.375]:
        hat_time = bt + sub
        if hat_time < 10.8:
            pan = 0.3 if sub in [0.125, 0.375] else -0.3
            amp = 0.22 if sub == 0.0 else 0.14
            add_hat(hat_time, amp=amp, pan=pan)

# Arpeggio Synth Pattern (3.5s - 10.8s)
# Notes in Fm pentatonic: F4 (349.23), Ab4 (415.30), Bb4 (466.16), C5 (523.25), Eb5 (622.25), F5 (698.46)
arp_notes = [349.23, 415.30, 523.25, 622.25, 466.16, 523.25, 415.30, 349.23]
for step, arp_t in enumerate(np.arange(3.5, 10.8, 0.25)):
    note_freq = arp_notes[step % len(arp_notes)]
    pan = ((step % 4) / 3.0) * 1.2 - 0.6
    add_tone(arp_t, 0.22, note_freq, amp=0.11, wave_type='triangle', pan=pan, attack=0.01, decay=0.18)
    add_tone(arp_t, 0.20, note_freq * 2.0, amp=0.04, wave_type='sine', pan=-pan, attack=0.01, decay=0.15)

# Bassline (3.5s - 10.8s)
bass_steps = [
    (3.5, 1.9, 87.31),   # F1
    (5.5, 1.9, 103.83),  # Ab1
    (7.5, 1.9, 116.54),  # Bb1
    (9.5, 1.3, 130.81),  # C2
]
for b_start, b_dur, b_freq in bass_steps:
    add_tone(b_start, b_dur, b_freq, amp=0.35, wave_type='sine', pan=0.0, attack=0.02, decay=0.1)
    add_tone(b_start, b_dur, b_freq * 2.0, amp=0.15, wave_type='triangle', pan=0.0, attack=0.02, decay=0.1)

# 3. Riser / Filter Sweep (10.0s - 11.2s)
riser_start = 10.0
riser_dur = 1.2
riser_idx = int(riser_start * SAMPLE_RATE)
riser_len = int(riser_dur * SAMPLE_RATE)
riser_t = np.linspace(0, riser_dur, riser_len, endpoint=False)
riser_freq = 180.0 * np.exp(riser_t * 2.5) # 180Hz to 3600Hz
riser_phase = 2 * np.pi * np.cumsum(riser_freq) / SAMPLE_RATE
riser_noise = (np.random.rand(riser_len) * 2 - 1) * np.linspace(0.05, 0.45, riser_len)
riser_sig = (np.sin(riser_phase) * 0.3 + riser_noise) * np.linspace(0.05, 0.6, riser_len)
left[riser_idx:riser_idx+riser_len] += riser_sig * 0.8
right[riser_idx:riser_idx+riser_len] += riser_sig * 0.8

# 4. Climax / Brand Lockup (11.2s - 15.0s)
# Massive Bass Drop & Lush Victory Chord: Db Major 9 / F (Db3, F3, Ab3, C4, Eb4, G4)
climax_t = 11.25
add_kick(climax_t, amp=1.0)
add_kick(climax_t + 0.05, amp=0.6)

# Deep Sub Impact Hit (40Hz decaying)
sub_len = int(2.5 * SAMPLE_RATE)
sub_idx = int(climax_t * SAMPLE_RATE)
sub_t = np.linspace(0, 2.5, sub_len, endpoint=False)
sub_wave = np.sin(2 * np.pi * 48.0 * sub_t) * np.exp(-sub_t * 1.5) * 0.6
left[sub_idx:sub_idx+sub_len] += sub_wave
right[sub_idx:sub_idx+sub_len] += sub_wave

climax_chords = [
    (11.25, 3.75, [138.59, 174.61, 207.65, 261.63, 311.13, 392.00]),
]
for start_t, dur, freqs in climax_chords:
    for i, f in enumerate(freqs):
        pan = (i / (len(freqs) - 1)) * 1.4 - 0.7 if len(freqs) > 1 else 0.0
        add_tone(start_t, dur, f, amp=0.18, wave_type='triangle', pan=pan, attack=0.04, decay=1.2)
        add_tone(start_t, dur, f * 1.002, amp=0.12, wave_type='saw', pan=-pan, attack=0.06, decay=1.2)
        add_tone(start_t, dur, f * 2.0, amp=0.06, wave_type='sine', pan=pan, attack=0.05, decay=1.5)

# Soft pulsing beats during finale
add_kick(12.25, amp=0.6)
add_snare(12.75, amp=0.35)
add_kick(13.25, amp=0.45)

# Normalization & Master Limiter
max_val = max(np.max(np.abs(left)), np.max(np.abs(right)))
if max_val > 0.95:
    scale = 0.92 / max_val
    left *= scale
    right *= scale

# Convert to 16-bit PCM WAV
left_16 = np.int16(left * 32767)
right_16 = np.int16(right * 32767)
stereo = np.column_stack((left_16, right_16))

wavfile.write('videos/float-intro/synth_bed.wav', SAMPLE_RATE, stereo)
print("synth_bed.wav generated successfully!")
