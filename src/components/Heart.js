import gsap from 'gsap';
import { audioManager } from '../audio/audioManager.js';

/**
 * Heart Character Component
 * Interactive character with organic SVG anatomy, dynamic heartbeat pulses,
 * concentric wave rings, and ultra-smooth GSAP gradient transitions.
 */
export class Heart {
  constructor(options = {}) {
    this.container = options.container || null;
    this.element = null;
    this.state = 'neutral'; // 'neutral'|'hopeful'|'waiting'|'sad'
    this.heartbeatInterval = null;
    this.currentBpm = 62;
    this.activeTimelines = [];
  }

  render() {
    if (this.element) return this.element;

    const wrapper = document.createElement('div');
    wrapper.className = 'actor-heart';
    wrapper.style.cssText = `
      position: relative;
      width: 140px;
      height: 140px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
    `;

    wrapper.innerHTML = `
      <!-- Concentric Radiating Heartbeat Waves Layer -->
      <div class="heart-waves-container" id="heart-waves" style="position: absolute; inset: -40px; pointer-events: none; display: flex; justify-content: center; align-items: center; z-index: 1;"></div>

      <!-- Main SVG Heart Character -->
      <svg id="heart-svg" viewBox="0 0 200 200" width="100%" height="100%" style="position: relative; z-index: 2; overflow: visible; filter: drop-shadow(0 12px 32px rgba(214, 123, 141, 0.45)); transform-origin: 50% 60%; will-change: transform, filter, opacity;">
        <!-- Gradients & Filters Definitions -->
        <defs>
          <!-- Dynamic Interpolated Body Gradient -->
          <linearGradient id="heart-grad-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop id="hgb-stop-0" offset="0%" stop-color="#fca8b8"/>
            <stop id="hgb-stop-1" offset="45%" stop-color="#e37b90"/>
            <stop id="hgb-stop-2" offset="80%" stop-color="#d65972"/>
            <stop id="hgb-stop-3" offset="100%" stop-color="#991f3d"/>
          </linearGradient>
        </defs>

        <!-- Heart Body -->
        <path id="heart-body" d="M100 170 C20 120, 10 60, 55 35 C80 20, 95 40, 100 55 C105 40, 120 20, 145 35 C190 60, 180 120, 100 170 Z" fill="url(#heart-grad-base)"/>

        <!-- Blush -->
        <circle id="heart-blush-left" cx="60" cy="100" r="10" fill="#ff7d90" opacity="0.35" filter="blur(3px)"/>
        <circle id="heart-blush-right" cx="140" cy="100" r="10" fill="#ff7d90" opacity="0.35" filter="blur(3px)"/>

        <!-- Eyes -->
        <g id="heart-eyes">
          <ellipse id="heart-eye-left" cx="75" cy="85" rx="5" ry="7" fill="#2d132c"/>
          <ellipse id="heart-eye-right" cx="125" cy="85" rx="5" ry="7" fill="#2d132c"/>
        </g>

        <!-- Mouth -->
        <path id="heart-mouth" d="M92 108 Q100 114 108 108" stroke="#2d132c" stroke-width="3" stroke-linecap="round" fill="none"/>

        <!-- Detailed Artistic Fracture / Crack Path (Lepaskan) -->
        <g id="heart-fracture-group" style="pointer-events: none;">
          <!-- Fissure Glow Shadow -->
          <path id="heart-crack-glow" d="M100 52 L94 76 L108 102 L90 132 L100 172" stroke="rgba(255, 255, 255, 0.45)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0"/>
          <!-- Main Jagged Fissure -->
          <path id="heart-crack-main" d="M100 52 L94 76 L108 102 L90 132 L100 172" stroke="rgba(26, 16, 32, 0.75)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-dasharray="140" stroke-dashoffset="140" opacity="0"/>
          <!-- Micro Branches -->
          <path id="heart-crack-branch1" d="M94 76 L82 86" stroke="rgba(26, 16, 32, 0.65)" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0"/>
          <path id="heart-crack-branch2" d="M108 102 L120 112" stroke="rgba(26, 16, 32, 0.65)" stroke-width="1.6" stroke-linecap="round" fill="none" opacity="0"/>
        </g>
      </svg>
    `;

    this.element = wrapper;
    if (this.container) {
      this.container.appendChild(wrapper);
    }

    // Start baseline gentle heartbeat loop
    this.startHeartbeatLoop(62, 'neutral');
    return this.element;
  }

  /**
   * Smoothly interpolate SVG linearGradient stop colors using GSAP
   * @param {string[]} colors - Array of 4 hex color strings [stop0, stop1, stop2, stop3]
   * @param {number} duration - Transition duration in seconds
   * @param {string} ease - GSAP easing equation
   */
  interpolateGradient(colors, duration = 2.4, ease = 'power2.inOut') {
    if (!this.element || !colors || colors.length < 4) return;
    const s0 = this.element.querySelector('#hgb-stop-0');
    const s1 = this.element.querySelector('#hgb-stop-1');
    const s2 = this.element.querySelector('#hgb-stop-2');
    const s3 = this.element.querySelector('#hgb-stop-3');
    const stops = [s0, s1, s2, s3];

    colors.forEach((col, i) => {
      if (stops[i]) {
        gsap.to(stops[i], {
          attr: { 'stop-color': col },
          duration: duration,
          ease: ease,
          overwrite: 'auto',
        });
      }
    });
  }

  /**
   * Start or update dynamic heartbeat interval loop
   * @param {number} bpm - Beats Per Minute
   * @param {string} mood - 'hopeful'|'waiting'|'sad'|'neutral'
   */
  startHeartbeatLoop(bpm = 62, mood = 'neutral') {
    this.stopHeartbeatLoop();
    this.currentBpm = bpm;
    if (bpm <= 0) return;

    const intervalMs = Math.round((60 / bpm) * 1000);

    // Initial immediate pulse
    this.pulse(mood);

    this.heartbeatInterval = setInterval(() => {
      this.pulse(mood);
    }, intervalMs);
  }

  stopHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Execute single anatomical lub-dub heartbeat pulse with radiating wave ripples & audio SFX
   */
  pulse(mood = this.state, playAudio = true) {
    if (!this.element) return;
    const heartSvg = this.element.querySelector('#heart-svg');
    const wavesContainer = this.element.querySelector('#heart-waves');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Play procedural heartbeat sound
    if (playAudio && this.currentBpm > 0) {
      audioManager.playHeartbeat(0.3, mood);
    }

    // 2. Anatomical Double-Pulse SVG Animation (lub-dub)
    if (heartSvg && !prefersReducedMotion && this.currentBpm > 0) {
      const pulseTl = gsap.timeline();
      this.activeTimelines.push(pulseTl);

      const amp = mood === 'hopeful' ? 1.2 : (mood === 'sad' ? 1.08 : 1.14);

      pulseTl
        .to(heartSvg, { scale: amp * 0.96, duration: 0.09, ease: 'power2.out' }, 0)
        .to(heartSvg, { scale: 1.05, duration: 0.07, ease: 'sine.inOut' }, 0.09)
        .to(heartSvg, { scale: amp, duration: 0.11, ease: 'power2.out' }, 0.16)
        .to(heartSvg, { scale: 1.0, duration: 0.55, ease: 'elastic.out(1.15, 0.45)' }, 0.27);
    }

    // 3. Emit Radiating Concentric Pulse Wave Rings
    if (wavesContainer && !prefersReducedMotion && this.currentBpm > 0) {
      this.spawnPulseWaveRing(wavesContainer, mood);
    }
  }

  /**
   * Spawn radiating ripple wave rings from heart center
   */
  spawnPulseWaveRing(container, mood = 'neutral') {
    let borderColor = 'rgba(252, 168, 184, 0.75)';
    let fillColor = 'rgba(252, 168, 184, 0.15)';
    let shadowColor = 'rgba(227, 123, 144, 0.4)';

    if (mood === 'hopeful' || mood === 'reconcile') {
      borderColor = 'rgba(242, 203, 134, 0.85)';
      fillColor = 'rgba(242, 203, 134, 0.2)';
      shadowColor = 'rgba(242, 203, 134, 0.5)';
    } else if (mood === 'waiting' || mood === 'wait') {
      borderColor = 'rgba(167, 197, 235, 0.8)';
      fillColor = 'rgba(167, 197, 235, 0.16)';
      shadowColor = 'rgba(167, 197, 235, 0.4)';
    } else if (mood === 'sad' || mood === 'farewell') {
      borderColor = 'rgba(200, 180, 215, 0.6)';
      fillColor = 'rgba(180, 160, 200, 0.12)';
      shadowColor = 'rgba(180, 160, 200, 0.3)';
    }

    const ring = document.createElement('div');
    ring.className = 'heart-wave-ring';
    ring.style.cssText = `
      position: absolute;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 1.5px solid ${borderColor};
      background: radial-gradient(circle, ${fillColor} 0%, transparent 70%);
      box-shadow: 0 0 16px ${shadowColor};
      pointer-events: none;
      transform-origin: center center;
    `;

    if (container.children.length >= 2 && container.firstChild) {
      container.removeChild(container.firstChild);
    }

    container.appendChild(ring);

    // Radiate outward & fade smoothly
    gsap.fromTo(
      ring,
      { scale: 0.82, opacity: 0.9 },
      {
        scale: 2.35,
        opacity: 0,
        duration: 1.35,
        ease: 'power1.out',
        onComplete: () => {
          if (ring.parentNode) {
            ring.parentNode.removeChild(ring);
          }
        },
      }
    );
  }

  /**
   * Set Expression & Adjust Heartbeat Rhythm accordingly
   */
  setExpression(expression, syncBpm = true) {
    this.state = expression;
    if (!this.element) return;

    const mouth = this.element.querySelector('#heart-mouth');
    const blushL = this.element.querySelector('#heart-blush-left');
    const blushR = this.element.querySelector('#heart-blush-right');

    if (mouth && blushL && blushR) {
      switch (expression) {
        case 'hopeful':
          gsap.to(mouth, { attr: { d: 'M90 106 Q100 120 110 106' }, duration: 0.5 });
          gsap.to([blushL, blushR], { opacity: 0.65, scale: 1.25, duration: 0.5 });
          if (syncBpm) this.startHeartbeatLoop(88, 'hopeful');
          break;
        case 'sad':
          gsap.to(mouth, { attr: { d: 'M90 114 Q100 106 110 114' }, duration: 0.5 });
          gsap.to([blushL, blushR], { opacity: 0.15, scale: 0.9, duration: 0.5 });
          if (syncBpm) this.startHeartbeatLoop(42, 'sad');
          break;
        case 'waiting':
          gsap.to(mouth, { attr: { d: 'M92 108 Q100 112 108 108' }, duration: 0.5 });
          gsap.to([blushL, blushR], { opacity: 0.35, scale: 1.0, duration: 0.5 });
          if (syncBpm) this.startHeartbeatLoop(56, 'waiting');
          break;
        default:
          gsap.to(mouth, { attr: { d: 'M92 108 Q100 114 108 108' }, duration: 0.5 });
          gsap.to([blushL, blushR], { opacity: 0.35, scale: 1.0, duration: 0.5 });
          if (syncBpm) this.startHeartbeatLoop(62, 'neutral');
          break;
      }
    }
  }

  /**
   * VISUAL TRANSFORMATION 1: "Bicara Kembali" (Warm Golden Sunrise Bloom)
   * Smooth 2.4s gradient interpolation with celebratory joyous bloom & golden halo
   */
  bloomAndGlow() {
    if (!this.element) return;
    const heartSvg = this.element.querySelector('#heart-svg');
    const blushL = this.element.querySelector('#heart-blush-left');
    const blushR = this.element.querySelector('#heart-blush-right');
    const mouth = this.element.querySelector('#heart-mouth');

    // 1. Smoothly interpolate gradient stops to Golden Dawn over 2.4s
    this.interpolateGradient(['#fff8e0', '#f2cb86', '#f7a988', '#d67b8d'], 2.4, 'power2.inOut');

    // 2. Joyful warm smile morph
    if (mouth) {
      gsap.to(mouth, {
        attr: { d: 'M86 104 Q100 124 114 104' },
        duration: 1.6,
        ease: 'elastic.out(1.1, 0.5)',
      });
    }

    // 3. Blush glows golden
    if (blushL && blushR) {
      gsap.to([blushL, blushR], {
        attr: { fill: '#f2cb86' },
        opacity: 0.75,
        scale: 1.35,
        duration: 1.8,
        ease: 'power2.out',
      });
    }

    // 4. Heart does a gentle celebratory expansion bounce & warm golden aura
    if (heartSvg) {
      const bloomTl = gsap.timeline();
      this.activeTimelines.push(bloomTl);

      bloomTl
        .to(heartSvg, {
          scale: 1.15,
          filter: 'drop-shadow(0 18px 45px rgba(242, 203, 134, 0.65))',
          duration: 1.0,
          ease: 'power2.out',
        }, 0)
        .to(heartSvg, {
          scale: 1.0,
          duration: 1.2,
          ease: 'elastic.out(1.15, 0.45)',
        }, 0.8);
    }

    // 5. Accelerate heartbeat smoothly
    setTimeout(() => {
      this.startHeartbeatLoop(88, 'hopeful');
    }, 400);
  }

  /**
   * VISUAL TRANSFORMATION 2: "Beri Waktu" (Frosted Celestial Moonlit Blue)
   * Smooth 2.6s gradient interpolation with deep calm meditative breath & moonlit aura
   */
  freezeInMoonlight() {
    if (!this.element) return;
    const heartSvg = this.element.querySelector('#heart-svg');
    const blushL = this.element.querySelector('#heart-blush-left');
    const blushR = this.element.querySelector('#heart-blush-right');
    const mouth = this.element.querySelector('#heart-mouth');

    // 1. Smoothly interpolate gradient stops to Frosted Moonlit Blue over 2.6s
    this.interpolateGradient(['#edf4ff', '#a7c5eb', '#7a9fd1', '#48607f'], 2.6, 'power2.inOut');

    // 2. Serene calm expression
    if (mouth) {
      gsap.to(mouth, {
        attr: { d: 'M92 110 Q100 114 108 110' },
        duration: 1.6,
        ease: 'power2.out',
      });
    }

    // 3. Blush softens to moonlit cyan-blue
    if (blushL && blushR) {
      gsap.to([blushL, blushR], {
        attr: { fill: '#a7c5eb' },
        opacity: 0.4,
        scale: 1.05,
        duration: 2.0,
        ease: 'power2.out',
      });
    }

    // 4. Meditative deep breathing motion & soft celestial aura
    if (heartSvg) {
      const breathTl = gsap.timeline();
      this.activeTimelines.push(breathTl);

      breathTl
        .to(heartSvg, {
          scale: 1.08,
          filter: 'drop-shadow(0 16px 40px rgba(167, 197, 235, 0.6))',
          duration: 1.6,
          ease: 'sine.inOut',
        }, 0)
        .to(heartSvg, {
          scale: 0.98,
          duration: 1.4,
          ease: 'sine.inOut',
        }, 1.6)
        .to(heartSvg, {
          scale: 1.0,
          duration: 1.0,
          ease: 'sine.inOut',
        }, 3.0);
    }

    // 5. Decelerate heartbeat smoothly to calm meditative tempo
    setTimeout(() => {
      this.startHeartbeatLoop(56, 'waiting');
    }, 400);
  }

  /**
   * VISUAL TRANSFORMATION 3: "Lepaskan" (Gentle Desaturation to Lavender-Gray, Fracture Seam, Stillness)
   * Smooth 3.4s gradient desaturation, subtle tender tremor, and graceful fracture drawing
   */
  async crackAndFade() {
    if (!this.element) return;
    const heartSvg = this.element.querySelector('#heart-svg');
    const crackMain = this.element.querySelector('#heart-crack-main');
    const crackGlow = this.element.querySelector('#heart-crack-glow');
    const crackB1 = this.element.querySelector('#heart-crack-branch1');
    const crackB2 = this.element.querySelector('#heart-crack-branch2');
    const blushL = this.element.querySelector('#heart-blush-left');
    const blushR = this.element.querySelector('#heart-blush-right');
    const mouth = this.element.querySelector('#heart-mouth');

    // 1. Smoothly desaturate gradient stops to Twilight Lavender-Gray over 3.4s
    this.interpolateGradient(['#e6dbe8', '#b8a8c2', '#80728c', '#4e4458'], 3.4, 'power1.inOut');

    // 2. Expression softens into bittersweet tender acceptance
    if (mouth) {
      gsap.to(mouth, {
        attr: { d: 'M92 114 Q100 108 108 114' },
        duration: 1.8,
        ease: 'power2.out',
      });
    }
    if (blushL && blushR) {
      gsap.to([blushL, blushR], { opacity: 0.05, duration: 2.0 });
    }

    this.startHeartbeatLoop(42, 'sad');

    // 3. Subtle emotional tremor before fracture begins
    if (heartSvg) {
      const shakeTl = gsap.timeline({ delay: 0.4 });
      this.activeTimelines.push(shakeTl);

      shakeTl
        .to(heartSvg, { x: -2.5, rotation: -0.8, duration: 0.08, ease: 'power1.inOut' })
        .to(heartSvg, { x: 2.5, rotation: 0.8, duration: 0.08, ease: 'power1.inOut' })
        .to(heartSvg, { x: -1.5, rotation: -0.4, duration: 0.08, ease: 'power1.inOut' })
        .to(heartSvg, { x: 1.5, rotation: 0.4, duration: 0.08, ease: 'power1.inOut' })
        .to(heartSvg, { x: 0, rotation: 0, duration: 0.12, ease: 'power1.out' });
    }

    // 4. Fracture splits gracefully down the heart with synchronized sound
    const crackTl = gsap.timeline({
      delay: 0.8,
      onStart: () => {
        audioManager.playHeartCrack(0.26);
      },
    });
    this.activeTimelines.push(crackTl);

    if (crackMain && crackGlow) {
      crackTl
        .set([crackMain, crackGlow], { opacity: 0.9, strokeDashoffset: 140 })
        .to(crackGlow, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' }, 0)
        .to(crackMain, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut' }, 0);
    }

    if (crackB1 && crackB2) {
      crackTl.to([crackB1, crackB2], { opacity: 0.8, duration: 1.0, ease: 'power1.out' }, '-=1.0');
    }

    // 5. Heart opacity and shadow gently settle into a translucent silhouette
    if (heartSvg) {
      crackTl.to(
        heartSvg,
        {
          opacity: 0.58,
          filter: 'drop-shadow(0 8px 24px rgba(120, 110, 135, 0.22))',
          duration: 3.5,
          ease: 'power1.out',
        },
        '-=1.5'
      );
    }

    // 6. Progressive deceleration of heartbeat into sacred stillness
    await new Promise(r => setTimeout(r, 2600));
    this.startHeartbeatLoop(28, 'sad');

    await new Promise(r => setTimeout(r, 3200));
    this.stopHeartbeatLoop(); // Heart settles in peace
  }

  /**
   * Reset Visuals back to initial base rose state (used during Replay)
   */
  resetVisuals() {
    if (!this.element) return;
    const heartSvg = this.element.querySelector('#heart-svg');
    const crackMain = this.element.querySelector('#heart-crack-main');
    const crackGlow = this.element.querySelector('#heart-crack-glow');
    const crackB1 = this.element.querySelector('#heart-crack-branch1');
    const crackB2 = this.element.querySelector('#heart-crack-branch2');
    const blushL = this.element.querySelector('#heart-blush-left');
    const blushR = this.element.querySelector('#heart-blush-right');

    // Restore base rose gradient
    this.interpolateGradient(['#fca8b8', '#e37b90', '#d65972', '#991f3d'], 0.8, 'power2.out');

    if (crackMain) gsap.set(crackMain, { opacity: 0, strokeDashoffset: 140 });
    if (crackGlow) gsap.set(crackGlow, { opacity: 0, strokeDashoffset: 140 });
    if (crackB1 && crackB2) gsap.set([crackB1, crackB2], { opacity: 0 });
    if (blushL && blushR) gsap.set([blushL, blushR], { attr: { fill: '#ff7d90' }, opacity: 0.35, scale: 1 });
    if (heartSvg) gsap.set(heartSvg, { opacity: 1, filter: 'drop-shadow(0 12px 32px rgba(214, 123, 141, 0.45))', scale: 1, x: 0, y: 0, rotation: 0 });

    this.setExpression('neutral');
  }

  /**
   * Universal helper to apply ending transformation by choice key
   * @param {'reconcile'|'wait'|'farewell'} choiceKey
   */
  applyChoiceAnimation(choiceKey) {
    if (choiceKey === 'reconcile') {
      return this.bloomAndGlow();
    } else if (choiceKey === 'wait') {
      return this.freezeInMoonlight();
    } else if (choiceKey === 'farewell') {
      return this.crackAndFade();
    }
  }

  /**
   * Set Atmosphere alias for expressions
   */
  setAtmosphere(mood = 'neutral') {
    this.setExpression(mood);
  }

  destroy() {
    this.stopHeartbeatLoop();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

export default Heart;
