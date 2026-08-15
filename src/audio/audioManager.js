import { Howl, Howler } from 'howler';
import { eventBus } from '../core/eventBus.js';

/**
 * Track Configuration Registry
 * Placeholder paths for developer audio assets
 */
export const AUDIO_TRACKS = {
  AMBIENT_DUSK: {
    id: 'ambient_dusk',
    title: "i'm sorry. — Dark Ambient Relaxation",
    src: [
      '/assets/audio/Ambient Dusk.mp3',
      '/assets/audio/Ambient_Dusk.mp3',
      '/assets/audio/ambient-dusk.mp3',
      '/assets/audio/ambient_dusk.mp3',
      '/assets/audio/AmbientDusk.mp3',
    ],
    loop: true,
    volume: 0.25,
  },
  ENDING_1_TALK: {
    id: 'ending_1_talk',
    title: "Maliq & D'Essentials — Senja Teduh Pelita",
    src: ['/assets/audio/senja_teduh_pelita.mp3', '/assets/audio/senja-teduh-pelita.mp3'],
    loop: false,
    volume: 0.40,
  },
  ENDING_2_TIME: {
    id: 'ending_2_time',
    title: 'Nadin Amizah — Bunga Tidur',
    src: [
      '/assets/audio/Nadin_Amizah-Bunga_Tidur.mp3.mp3',
      '/assets/audio/Nadin_Amizah-Bunga_Tidur.mp3',
      '/assets/audio/bunga-tidur.mp3',
      '/assets/audio/bunga_tidur.mp3',
    ],
    loop: false,
    volume: 0.40,
  },
  ENDING_3_END: {
    id: 'ending_3_end',
    title: 'Lovarian — Perpisahan Termanis',
    src: [
      '/assets/audio/Lovarian-Perpisahan_Termanis.mp3',
      '/assets/audio/perpisahan-termanis.mp3',
      '/assets/audio/perpisahan_termanis.mp3',
    ],
    loop: false,
    volume: 0.40,
  },
};

/**
 * AudioManager - Handles background music, sound effects, crossfades, and mute state
 */
export class AudioManager {
  constructor() {
    this.sounds = new Map();
    this.currentTrackId = null;
    this.isMuted = false;
    this.isUnlocked = false;

    this.hudElement = null;
    this.toggleButton = null;
    this.titleElement = null;
    this.titleTimeout = null;
    this.fadeTimeouts = new Map();
    this.butterflyGlitterSounds = null;
    this.typewriterSound = null;

    this.initHUD();
  }

  /**
   * Lazily instantiate sound effect Howl instances on first user gesture
   */
  initSFX() {
    if (this.butterflyGlitterSounds && this.typewriterSound) return;

    this.butterflyGlitterSounds = [
      {
        howl: new Howl({
          src: ['/assets/audio/butterflyGlitter/Fairy Dust Sound Effect!.mp3'],
          html5: false,
          onloaderror: () => {},
        }),
        gainMult: 0.35,
      },
      {
        howl: new Howl({
          src: ['/assets/audio/butterflyGlitter/Magic Glitter Fairy Dust - Sound Effect HD.mp3'],
          html5: false,
          onloaderror: () => {},
        }),
        gainMult: 0.07,
      },
      {
        howl: new Howl({
          src: ['/assets/audio/butterflyGlitter/Magic Spell Sound Effect – Fairy Tale, Fantasy, No Copyright.mp3'],
          html5: false,
          onloaderror: () => {},
        }),
        gainMult: 0.06,
      },
    ];

    this.typewriterSound = new Howl({
      src: ['/assets/audio/typewriter/Typewriter Sound Effect Free.mp3'],
      volume: 0.08,
      html5: false,
      onloaderror: () => {},
    });
  }

  /**
   * Safely obtain Web Audio context only if unlocked
   */
  getAudioContext() {
    if (!this.isUnlocked) return null;
    return Howler.ctx || null;
  }

  /**
   * Clear any pending fade-out timeout for a specific track
   */
  clearFadeTimeout(trackKey) {
    if (!this.fadeTimeouts) {
      this.fadeTimeouts = new Map();
    }
    if (this.fadeTimeouts.has(trackKey)) {
      clearTimeout(this.fadeTimeouts.get(trackKey));
      this.fadeTimeouts.delete(trackKey);
    }
  }

  /**
   * Clear all pending fade-out timeouts
   */
  clearAllFadeTimeouts() {
    if (!this.fadeTimeouts) {
      this.fadeTimeouts = new Map();
      return;
    }
    this.fadeTimeouts.forEach((tid) => clearTimeout(tid));
    this.fadeTimeouts.clear();
  }

  /**
   * Bind DOM elements for the Audio HUD
   */
  initHUD() {
    // Run after DOM is loaded
    const bind = () => {
      this.hudElement = document.getElementById('audioHud');
      this.toggleButton = document.getElementById('audioToggleBtn');
      this.titleElement = document.getElementById('audioTrackTitle');

      if (this.hudElement) {
        this.hudElement.addEventListener('click', () => this.toggleMute());
      }

      // One-time user gesture listener to unlock Web Audio context gracefully on real user touch/click
      const onUserInteraction = () => {
        this.unlockAudio();
        window.removeEventListener('pointerdown', onUserInteraction);
        window.removeEventListener('click', onUserInteraction);
        window.removeEventListener('touchstart', onUserInteraction);
        window.removeEventListener('keydown', onUserInteraction);
      };

      window.addEventListener('pointerdown', onUserInteraction, { once: true, passive: true });
      window.addEventListener('click', onUserInteraction, { once: true, passive: true });
      window.addEventListener('touchstart', onUserInteraction, { once: true, passive: true });
      window.addEventListener('keydown', onUserInteraction, { once: true, passive: true });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bind);
    } else {
      bind();
    }
  }

  /**
   * Unlock AudioContext on first user gesture (e.g., Phase 1 "MULAI" button or initial screen tap)
   */
  unlockAudio() {
    if (this.isUnlocked) return;
    try {
      this.initSFX();
      if (Howler.ctx && Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().catch(() => {});
      }
      this.isUnlocked = true;
      if (this.hudElement) {
        this.hudElement.removeAttribute('hidden');
      }
      eventBus.emit('audio:unlocked');
    } catch (e) {
      console.warn('[AudioManager] AudioContext unlock error:', e);
    }
  }

  /**
   * Get or instantiate a Howl instance safely
   * @param {string} trackKey - key from AUDIO_TRACKS
   */
  getOrCreateSound(trackKey) {
    if (this.sounds.has(trackKey)) {
      return this.sounds.get(trackKey);
    }

    const config = AUDIO_TRACKS[trackKey];
    if (!config) {
      console.warn(`[AudioManager] Track configuration "${trackKey}" not found.`);
      return null;
    }

    const targetVolume = config.volume || 0.25;

    const sound = new Howl({
      src: config.src,
      loop: config.loop !== false,
      volume: targetVolume, // Default to audible target volume so HTML5 audio buffer never stalls at 0
      html5: true, // Stream larger audio files
      preload: true,
      onloaderror: (_id, err) => {
        console.info(`[AudioManager] Note: Asset "${config.src[0]}" is not yet placed in assets/audio/ (${err || '404'}). Audio player will safely continue in placeholder mode.`);
      },
    });

    this.sounds.set(trackKey, sound);
    return sound;
  }

  /**
   * Play track with clean seek & fade-in (guaranteed fresh start)
   * @param {string} trackKey
   * @param {number} fadeDuration - ms
   */
  play(trackKey, fadeDuration = 1000) {
    this.unlockAudio();
    const config = AUDIO_TRACKS[trackKey];
    if (!config) return;

    this.clearFadeTimeout(trackKey);
    const sound = this.getOrCreateSound(trackKey);
    if (!sound) return;

    this.currentTrackId = trackKey;
    this.updateHUDTitle(config.title);

    const targetVol = config.volume || 0.25;

    try {
      sound.stop();
      sound.seek(0);
      sound.volume(targetVol);
      const playId = sound.play();

      if (fadeDuration > 0) {
        if (sound.state() === 'loaded') {
          sound.fade(0, targetVol, fadeDuration, playId);
        } else {
          // If HTML5 audio is still buffering, attach fade to play event
          sound.once('play', (id) => {
            try {
              sound.fade(0, targetVol, fadeDuration, id);
            } catch (e) {}
          });
        }
      }
    } catch (err) {
      console.warn('[AudioManager] Play error:', err);
    }
  }

  /**
   * Crossfade smoothly between current active track and a new track
   * @param {string} nextTrackKey
   * @param {number} fadeDuration - ms
   */
  crossFade(nextTrackKey, fadeDuration = 2000) {
    const prevTrackKey = this.currentTrackId;

    // If already playing the same track, ensure volume is restored without fading out
    if (prevTrackKey === nextTrackKey) {
      this.clearFadeTimeout(nextTrackKey);
      const sound = this.getOrCreateSound(nextTrackKey);
      if (sound) {
        const config = AUDIO_TRACKS[nextTrackKey];
        const targetVol = config?.volume || 0.40;
        sound.fade(sound.volume(), targetVol, fadeDuration);
        if (!sound.playing()) {
          sound.play();
        }
      }
      return;
    }

    if (prevTrackKey && this.sounds.has(prevTrackKey)) {
      this.clearFadeTimeout(prevTrackKey);
      const prevSound = this.sounds.get(prevTrackKey);
      prevSound.fade(prevSound.volume(), 0, fadeDuration);
      const tid = setTimeout(() => {
        if (this.currentTrackId !== prevTrackKey) {
          prevSound.stop();
          const prevConfig = AUDIO_TRACKS[prevTrackKey];
          prevSound.volume(prevConfig?.volume || 0.25);
        }
        this.fadeTimeouts.delete(prevTrackKey);
      }, fadeDuration);
      this.fadeTimeouts.set(prevTrackKey, tid);
    }

    this.play(nextTrackKey, fadeDuration);
  }

  /**
   * Smoothly fade the volume of the current playing track
   * @param {number} targetVolume - volume 0 to 1
   * @param {number} duration - ms
   */
  fadeVolume(targetVolume, duration = 1200) {
    if (!this.currentTrackId) return;
    const sound = this.sounds.get(this.currentTrackId);
    if (sound) {
      try {
        const currentVol = sound.volume() || 0;
        sound.fade(currentVol, Math.max(0, Math.min(1, targetVolume)), duration);
      } catch (err) {
        console.warn('[AudioManager] fadeVolume error:', err);
      }
    }
  }

  /**
   * Stop current track
   */
  stop(fadeDuration = 800) {
    if (!this.currentTrackId) return;
    const trackKey = this.currentTrackId;
    this.clearFadeTimeout(trackKey);
    const sound = this.sounds.get(trackKey);
    if (sound) {
      if (fadeDuration > 0) {
        sound.fade(sound.volume(), 0, fadeDuration);
        const tid = setTimeout(() => {
          sound.stop();
          const config = AUDIO_TRACKS[trackKey];
          sound.volume(config?.volume || 0.25);
          this.fadeTimeouts.delete(trackKey);
        }, fadeDuration);
        this.fadeTimeouts.set(trackKey, tid);
      } else {
        sound.stop();
        const config = AUDIO_TRACKS[trackKey];
        sound.volume(config?.volume || 0.25);
      }
    }
    this.currentTrackId = null;
  }

  /**
   * Stop music alias for scenes
   */
  stopMusic(fadeDuration = 1000) {
    this.stop(typeof fadeDuration === 'number' && fadeDuration < 50 ? fadeDuration * 1000 : fadeDuration);
  }

  /**
   * Stop all music tracks unconditionally (used during replay loop)
   */
  stopAllMusic(fadeDuration = 800) {
    this.clearAllFadeTimeouts();
    const durMs = typeof fadeDuration === 'number' && fadeDuration < 50 ? fadeDuration * 1000 : fadeDuration;
    this.sounds.forEach((sound, key) => {
      if (sound) {
        if (durMs > 0 && sound.playing()) {
          sound.fade(sound.volume(), 0, durMs);
          const tid = setTimeout(() => {
            sound.stop();
            const config = AUDIO_TRACKS[key];
            sound.volume(config?.volume || 0.25);
            this.fadeTimeouts.delete(key);
          }, durMs);
          this.fadeTimeouts.set(key, tid);
        } else {
          sound.stop();
          const config = AUDIO_TRACKS[key];
          sound.volume(config?.volume || 0.25);
        }
      }
    });
    this.currentTrackId = null;
  }

  /**
   * Restart song cleanly from beginning (for review lyrics loop)
   */
  restartSong(choiceKey, fadeDuration = 600) {
    this.unlockAudio();
    const keyMap = {
      reconcile: 'ENDING_1_TALK',
      wait: 'ENDING_2_TIME',
      farewell: 'ENDING_3_END',
    };
    const trackKey = keyMap[choiceKey] || choiceKey;
    const config = AUDIO_TRACKS[trackKey];
    if (!config) return;

    const sound = this.getOrCreateSound(trackKey);
    if (!sound) return;

    this.currentTrackId = trackKey;
    this.updateHUDTitle(config.title);

    try {
      sound.stop();
      sound.seek(0);
      sound.volume(config.volume || 0.40);
      sound.play();
      if (fadeDuration > 0) {
        sound.fade(0, config.volume || 0.40, fadeDuration);
      }
    } catch (err) {
      console.warn('[AudioManager] restartSong error:', err);
    }
  }

  /**
   * Get current playback position in seconds of active track
   */
  getCurrentSeek() {
    if (!this.currentTrackId) return 0;
    const sound = this.sounds.get(this.currentTrackId);
    if (sound && sound.playing()) {
      return sound.seek() || 0;
    }
    return 0;
  }

  /**
   * Get duration in seconds of active track
   */
  getCurrentDuration() {
    if (!this.currentTrackId) return 0;
    const sound = this.sounds.get(this.currentTrackId);
    if (sound) {
      return sound.duration() || 0;
    }
    return 0;
  }

  /**
   * Play song by choice key ('reconcile' | 'wait' | 'farewell')
   */
  playSong(choiceKey, fadeDuration = 2000, restart = false) {
    if (restart) {
      this.restartSong(choiceKey, 600);
      return;
    }
    const keyMap = {
      reconcile: 'ENDING_1_TALK',
      wait: 'ENDING_2_TIME',
      farewell: 'ENDING_3_END',
    };
    const trackKey = keyMap[choiceKey] || choiceKey;
    const durMs = typeof fadeDuration === 'number' && fadeDuration < 50 ? fadeDuration * 1000 : fadeDuration;
    this.crossFade(trackKey, durMs);
  }

  /**
   * Card swipe / paper rustle alias for scenes
   */
  playPaperRustle(volume = 0.25) {
    this.playCardSwipe(volume);
  }

  /**
   * Toggle mute / unmute
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    Howler.mute(this.isMuted);

    if (!this.isMuted) {
      this.playClick(1.2, 0.22);
    }

    if (this.hudElement) {
      if (this.isMuted) {
        this.hudElement.classList.add('is-muted');
      } else {
        this.hudElement.classList.remove('is-muted');
      }
    }

    eventBus.emit('audio:mute-toggle', { isMuted: this.isMuted });
  }

  /**
   * Update audio title in HUD with temporary auto-expansion cue
   */
  updateHUDTitle(title) {
    if (this.titleElement) {
      this.titleElement.textContent = title || '';
    }

    // Auto-expand for 3.5s when a new track plays, then smoothly collapse back into compact circle
    if (this.hudElement && title) {
      this.hudElement.classList.add('is-expanded');
      if (this.titleTimeout) {
        clearTimeout(this.titleTimeout);
      }
      this.titleTimeout = setTimeout(() => {
        if (this.hudElement) {
          this.hudElement.classList.remove('is-expanded');
        }
      }, 3500);
    }
  }

  /* =========================================================
     Interactive Procedural Sound Effects (SFX) Engine
     ========================================================= */

  /**
   * Safely obtain active Web Audio context
   */
  getAudioContext() {
    if (typeof Howler !== 'undefined' && Howler.ctx) {
      if (Howler.ctx.state === 'suspended') {
        Howler.ctx.resume().catch(() => { });
      }
      return Howler.ctx;
    }
    if (!this.synthCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.synthCtx = new AudioCtxClass();
      }
    }
    if (this.synthCtx && this.synthCtx.state === 'suspended') {
      this.synthCtx.resume().catch(() => { });
    }
    return this.synthCtx;
  }

  /**
   * Soft acoustic glass / wooden click for buttons
   */
  playClick(pitch = 1.0, volume = 0.25) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750 * pitch, now);
      osc.frequency.exponentialRampToValueAtTime(180 * pitch, now + 0.045);

      gain.gain.setValueAtTime(volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch (e) { }
  }

  /**
   * Tactile card shuffle / brush whoosh for memory cards in Phase 2
   */
  playCardSwipe(volume = 0.22) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.14);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(450, now + 0.14);
      filter.Q.setValueAtTime(1.5, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch (e) { }
  }

  /**
   * Ethereal celestial sparkle / crystalline chime for blooming and starlight
   */
  playChime(type = 'sparkle', volume = 0.25) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const freqs = type === 'bloom'
        ? [523.25, 659.25, 783.99, 1046.5]
        : [659.25, 880.0, 1174.66, 1567.98];
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;
        const duration = 0.65;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch (e) { }
  }

  /**
   * Delicate envelope unfold and wax seal release sound
   */
  playEnvelopeOpen(volume = 0.3) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(900, now);
      filter.frequency.linearRampToValueAtTime(1600, now + 0.28);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 0.18);

      oscGain.gain.setValueAtTime(volume * 0.15, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) { }
  }

  /**
   * Soft page / paragraph turn whisper
   */
  playPageTurn(volume = 0.2) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) { }
  }

  /**
   * Deep, warm organic double heartbeat sound (lub-dub)
   * Supports dynamic mood variations (hopeful/fast, neutral/steady, sad/slow)
   */
  playHeartbeat(volume = 0.32, mood = 'neutral') {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      let f1 = 92;
      let f2 = 72;
      let gainMult = 1.0;

      if (mood === 'hopeful' || mood === 'reconcile') {
        f1 = 115;
        f2 = 90;
        gainMult = 1.15;
      } else if (mood === 'sad' || mood === 'farewell') {
        f1 = 78;
        f2 = 60;
        gainMult = 0.9;
      }

      // Lub-Dub double pulse
      [
        { delay: 0, freq: f1, dur: 0.13, gain: 0.75 },
        { delay: 0.12, freq: f2, dur: 0.16, gain: 0.6 },
      ].forEach((beat) => {
        const t = now + beat.delay;

        // 1. Deep Fundamental Sine
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(beat.freq, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + beat.dur);

        gain.gain.setValueAtTime(volume * beat.gain * gainMult, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + beat.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + beat.dur);

        // 2. Audible Warm Harmonic (ensures audibility on phone/laptop speakers)
        const harm = ctx.createOscillator();
        const harmGain = ctx.createGain();
        harm.type = 'triangle';
        harm.frequency.setValueAtTime(beat.freq * 1.8, t);
        harm.frequency.exponentialRampToValueAtTime(45, t + beat.dur * 0.85);

        harmGain.gain.setValueAtTime(volume * beat.gain * 0.35 * gainMult, t);
        harmGain.gain.exponentialRampToValueAtTime(0.0001, t + beat.dur * 0.85);

        harm.connect(harmGain);
        harmGain.connect(ctx.destination);
        harm.start(t);
        harm.stop(t + beat.dur * 0.85);
      });
    } catch (e) { }
  }

  /**
   * Procedural organic typewriter key click (ASMR tactile acoustic tap)
   * 100% Acoustic noise-sculpted tactile stroke — 0% electronic beep / synth tones
   * 1. Soft textured hammer-on-ribbon impulse
   * 2. Warm acoustic wood/paper cavity resonance (smooth bandpass, zero whistling)
   * 3. Gentle velvet damping
   */
  /**
   * Start typewriter sound playback once per sentence (Clear, crisp & tactile)
   */
  startTypewriterSentence(volume = 0.35) {
    if (this.isMuted || !this.isUnlocked) return;
    if (Howler.ctx && Howler.ctx.state !== 'running') return;

    // 1. Play real recorded typewriter sound effect if loaded (Warm & crisp tactile keying)
    if (this.typewriterSound && this.typewriterSound.state() === 'loaded') {
      try {
        this.typewriterSound.stop();
        this.typewriterSound.volume(volume * 0.85);
        this.typewriterSound.rate(0.96 + Math.random() * 0.08);
        this.typewriterSound.play();
      } catch (e) {}
      return;
    }

    // 2. Procedural Fallback: Acoustic noise-sculpted single stroke
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const pitchVariance = (Math.random() * 0.14) - 0.07;
      const duration = 0.014;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        const env = Math.exp(-t * 7.5);
        data[i] = ((Math.random() * 2 - 1) * 0.7 + (Math.random() * 2 - 1) * 0.3) * env;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(1250 * (1 + pitchVariance), now);
      bandpass.Q.setValueAtTime(1.4, now);

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(3600, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      source.connect(bandpass);
      bandpass.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(ctx.destination);

      source.start(now);
    } catch (e) {}
  }

  /**
   * Stop typewriter sound playback when sentence finishes typing
   */
  stopTypewriterSentence(fadeDuration = 200) {
    if (this.typewriterSound && this.typewriterSound.playing()) {
      try {
        this.typewriterSound.fade(this.typewriterSound.volume(), 0, fadeDuration);
        setTimeout(() => {
          if (this.typewriterSound) {
            this.typewriterSound.stop();
            this.typewriterSound.volume(0.35);
          }
        }, fadeDuration);
      } catch (e) {}
    }
  }

  /**
   * Legacy alias for typewriter click
   */
  playTypewriterKey(volume = 0.35) {
    this.startTypewriterSentence(volume);
  }

  /**
   * Soft, airy organic butterfly wing flutter / velvet breeze (Gentle whisper)
   */
  playButterflyFlap(volume = 0.08) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.07);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.linearRampToValueAtTime(180, now + 0.07);
      filter.Q.setValueAtTime(1.8, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch (e) { }
  }

  /**
   * Magical fairy dust / butterfly sparkle sound effect (Gentle & soft whisper)
   */
  playStardustSprinkle(volume = 0.12) {
    if (this.isMuted) return;

    // 1. Play authentic recorded MP3 sound effect from butterflyGlitter pool with per-track calibrated gain
    if (this.butterflyGlitterSounds && this.butterflyGlitterSounds.length > 0) {
      const readySounds = this.butterflyGlitterSounds.filter(s => s.howl && s.howl.state() === 'loaded');
      if (readySounds.length > 0) {
        const item = readySounds[Math.floor(Math.random() * readySounds.length)];
        const calibratedVol = volume * (item.gainMult || 0.2);
        item.howl.volume(calibratedVol);
        item.howl.play();
        return;
      }
    }

    // 2. Procedural Fallback: Magical fairy dust crystal chimes & sweep
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const magicScale = [1318.51, 1661.22, 1975.53, 2489.02, 2637.02, 3322.44, 3951.07];
      const noteCount = 8;

      for (let i = 0; i < noteCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + (i * 0.035) + (Math.random() * 0.015);
        const dur = 0.45 + (Math.random() * 0.2);
        const baseFreq = magicScale[i % magicScale.length] * (1 + (Math.random() * 0.06 - 0.03));

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, startTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.08, startTime + dur * 0.4);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.15, startTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur);
      }

      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3600, now);
      filter.frequency.exponentialRampToValueAtTime(5400, now + 0.25);
      filter.Q.setValueAtTime(4.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
    } catch (e) { }
  }

  /**
   * Ethereal flower blooming harmonic swell
   */
  playFlowerBloom(volume = 0.16) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chord = [293.66, 369.99, 440.0, 587.33, 739.99, 880.0];

      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.075;
        const dur = 0.95;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.01, startTime + dur);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(volume * 0.16, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    } catch (e) { }
  }

  /**
   * Textured parchment unfold and tactile paper flip sound
   */
  playPaperUnfold(volume = 0.16) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      [0, 0.09, 0.18].forEach((delay, idx) => {
        const t = now + delay;
        const bufferSize = Math.floor(ctx.sampleRate * 0.12);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 + idx * 300, t);
        filter.frequency.linearRampToValueAtTime(1800, t + 0.12);
        filter.Q.setValueAtTime(2.0, t);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume * (0.35 - idx * 0.08), t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start(t);
      });
    } catch (e) { }
  }

  /**
   * Delicate crystal fracture / ice-crackling texture
   */
  playHeartCrack(volume = 0.14) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Micro-crackle bursts
      for (let i = 0; i < 4; i++) {
        const t = now + i * 0.06 + Math.random() * 0.04;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const dur = 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1800 + Math.random() * 1200, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + dur);

        gain.gain.setValueAtTime(volume * 0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + dur);
      }
    } catch (e) { }
  }
}

export const audioManager = new AudioManager();
export default audioManager;
