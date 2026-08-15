import gsap from 'gsap';
import { sceneManager } from '../core/sceneManager.js';
import { transitionManager } from '../core/transitionManager.js';
import { Butterfly } from '../components/Butterfly.js';
import { STORY_CONTENT } from '../data/storyContent.js';
import { Typewriter } from '../utils/typewriter.js';

import { FirefliesCluster } from './phase3/FirefliesCluster.js';
import { NightFlower } from './phase3/NightFlower.js';
import { Constellation } from './phase3/Constellation.js';
import { FloatingEnvelope } from './phase3/FloatingEnvelope.js';

/**
 * Phase 3 — The Journey ("Mengikuti Jejak yang Tertinggal")
 * Orchestrates:
 * 1. Night transition & simultaneous entry of all interactive elements
 * 2. Moment 1: Fireflies Cluster (FirefliesCluster) - Unlocked only after Butterfly arrives
 * 3. Moment 2: Night Flower Blossom (NightFlower) - Unlocked only after Butterfly arrives
 * 4. Moment 3: Sky Constellation Illumination (Constellation) - Unlocked only after Butterfly arrives
 * 5. Moment 4: Descending Sealed Envelope (FloatingEnvelope) -> Phase 4 handoff
 */
export class Phase3Scene {
  constructor() {
    this.element = null;
    this.stage = null;
    this.butterfly = null;
    this.currentStep = 0; // 0: transition/locked, 1: fireflies, 2: flower, 3: star, 4: envelope

    this.fireflies = null;
    this.flower = null;
    this.constellation = null;
    this.envelope = null;

    this.activeTimelines = [];
    this.timeouts = [];
  }

  mount(container) {
    if (this.element) return this.element;
    this.stage = container;
    const content = STORY_CONTENT.phase3;

    const el = document.createElement('section');
    el.id = 'scene-phase3';
    el.className = 'scene scene-phase3';
    el.setAttribute('aria-label', content.meta);

    el.innerHTML = `
      <!-- BACKGROUND LAYER: Moon, Sky Depth & Constellations -->
      <div class="p3-layer p3-layer-bg" id="p3-layer-bg">
        <div class="p3-moon-container" id="p3-moon" style="opacity: 0;">
          <div class="p3-moon-halo"></div>
          <svg viewBox="0 0 100 100" class="p3-moon-crescent">
            <defs>
              <linearGradient id="p3-moon-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="60%" stop-color="#fff8e7"/>
                <stop offset="100%" stop-color="#f2cb86"/>
              </linearGradient>
            </defs>
            <path d="M50 12 C68 12 84 28 84 50 C84 72 68 88 50 88 C40 88 32 84 26 78 C38 76 52 64 52 50 C52 36 38 24 26 22 C32 16 40 12 50 12 Z" fill="url(#p3-moon-grad)"/>
          </svg>
        </div>

        <!-- Interaction 3: Constellation Cluster -->
        <div class="p3-constellation-sky-area" id="p3-constellation-cluster" style="opacity: 0;">
          <div class="p3-constellation-nodes" id="p3-constellation-group">
            <svg class="p3-constellation-svg" viewBox="0 0 280 100" id="p3-constellation-svg">
              <defs>
                <filter id="p3-star-glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur"/>
                  <feMerge>
                    <feMergeNode in="blur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <line class="p3-constellation-line" id="p3-cline-1" x1="25" y1="30" x2="78" y2="55" stroke="rgba(242, 203, 134, 0.28)" stroke-width="1.2" stroke-dasharray="3 3"/>
              <line class="p3-constellation-line" id="p3-cline-2" x1="78" y1="55" x2="132" y2="28" stroke="rgba(242, 203, 134, 0.28)" stroke-width="1.2" stroke-dasharray="3 3"/>
              <line class="p3-constellation-line" id="p3-cline-3" x1="132" y1="28" x2="175" y2="62" stroke="rgba(242, 203, 134, 0.28)" stroke-width="1.2" stroke-dasharray="3 3"/>
              <line class="p3-constellation-line" id="p3-cline-4" x1="175" y1="62" x2="220" y2="32" stroke="rgba(242, 203, 134, 0.28)" stroke-width="1.2" stroke-dasharray="3 3"/>
              <line class="p3-constellation-line" id="p3-cline-5" x1="220" y1="32" x2="258" y2="52" stroke="rgba(242, 203, 134, 0.28)" stroke-width="1.2" stroke-dasharray="3 3"/>
              <circle class="p3-companion-star" id="p3-cstar-1" cx="25" cy="30" r="2.8" fill="#ffffff" opacity="0.45" filter="url(#p3-star-glow)"/>
              <circle class="p3-companion-star" id="p3-cstar-3" cx="132" cy="28" r="2.8" fill="#ffffff" opacity="0.45" filter="url(#p3-star-glow)"/>
              <circle class="p3-companion-star" id="p3-cstar-4" cx="175" cy="62" r="2.6" fill="#ffffff" opacity="0.45" filter="url(#p3-star-glow)"/>
              <circle class="p3-companion-star" id="p3-cstar-5" cx="220" cy="32" r="3.0" fill="#ffffff" opacity="0.45" filter="url(#p3-star-glow)"/>
              <circle class="p3-companion-star" id="p3-cstar-6" cx="258" cy="52" r="2.4" fill="#ffffff" opacity="0.4" filter="url(#p3-star-glow)"/>
            </svg>
          </div>
          <div class="p3-star-container" id="p3-star-target" style="left: calc(27.8% - 24px); top: calc(55% - 24px);">
            <button class="p3-star-btn" id="p3-focal-star" aria-label="Sentuh bintang fokal di rasi langit" tabindex="0">
              <div class="focal-star-core"></div>
            </button>
          </div>
        </div>
      </div>

      <!-- MIDGROUND LAYER: Fog, Meadow, Fireflies & Night Flower -->
      <div class="p3-layer p3-layer-mid" id="p3-layer-mid">
        <svg class="p3-meadow-silhouettes" id="p3-meadow" viewBox="0 0 1200 300" preserveAspectRatio="none" style="opacity: 0;">
          <defs>
            <linearGradient id="p3-grass-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#141c2e" stop-opacity="0.9"/>
              <stop offset="100%" stop-color="#070b14" stop-opacity="0.98"/>
            </linearGradient>
          </defs>
          <path d="M0 300 L0 180 Q120 140 240 170 T480 160 T720 180 T960 150 T1200 170 L1200 300 Z" fill="url(#p3-grass-grad)"/>
          <path d="M80 180 Q76 130 92 110 Q90 140 98 180 Z" fill="#182338" opacity="0.75"/>
          <path d="M96 180 Q106 125 118 105 Q110 145 112 180 Z" fill="#182338" opacity="0.75"/>
          <path d="M680 180 Q674 135 690 115 Q688 145 696 180 Z" fill="#182338" opacity="0.75"/>
          <path d="M700 180 Q712 128 722 108 Q716 148 718 180 Z" fill="#182338" opacity="0.75"/>
        </svg>

        <!-- Interaction 1: Fireflies Cluster -->
        <div class="p3-fireflies-layer" id="p3-fireflies-cluster" style="opacity: 0;">
          <button class="firefly-node is-focal" id="p3-focal-firefly" style="left: 32%; top: 62%;" aria-label="Sentuh kunang-kunang pembawa pendar" tabindex="0">
            <div class="focal-core"></div>
          </button>
          <div class="firefly-node companion-ff" id="ff-c1" style="left: 18%; top: 48%; width: 5px; height: 5px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #fff8e7; box-shadow: 0 0 7px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c2" style="left: 24%; top: 74%; width: 6px; height: 6px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #ffffff; box-shadow: 0 0 8px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c3" style="left: 38%; top: 52%; width: 4.5px; height: 4.5px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #ffd992; box-shadow: 0 0 6px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c4" style="left: 14%; top: 66%; width: 4px; height: 4px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #ffffff; box-shadow: 0 0 6px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c5" style="left: 42%; top: 76%; width: 5px; height: 5px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #fff8e7; box-shadow: 0 0 6px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c6" style="left: 28%; top: 42%; width: 4px; height: 4px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #ffd580; box-shadow: 0 0 5px #f2cb86;"></div>
          </div>
          <div class="firefly-node companion-ff" id="ff-c7" style="left: 46%; top: 60%; width: 3.5px; height: 3.5px;">
            <div class="firefly-dot" style="width: 100%; height: 100%; border-radius: 50%; background: #ffffff; box-shadow: 0 0 5px #f2cb86;"></div>
          </div>
        </div>

        <!-- Interaction 2: Night Flower -->
        <div class="p3-night-flower-container" id="p3-night-flower-target" style="opacity: 0;">
          <div class="night-flower-ambient-glow" id="p3-nflower-glow"></div>
          <button class="p3-night-flower-btn" id="p3-night-flower" aria-label="Sentuh kuncup bunga malam" tabindex="0">
            <svg viewBox="0 0 100 100" class="night-flower-svg" id="p3-night-flower-svg">
              <defs>
                <linearGradient id="p3-nflower-petal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="35%" stop-color="#d4e7ff"/>
                  <stop offset="75%" stop-color="#8bb4eb"/>
                  <stop offset="100%" stop-color="#4d6f9f"/>
                </linearGradient>
                <linearGradient id="p3-nflower-inner-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="50%" stop-color="#eaf3ff"/>
                  <stop offset="100%" stop-color="#a7c5eb"/>
                </linearGradient>
                <linearGradient id="p3-nflower-stem-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stop-color="#6082ac"/>
                  <stop offset="100%" stop-color="#1f2d42"/>
                </linearGradient>
                <radialGradient id="p3-nflower-core-glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="50%" stop-color="#fff0cc"/>
                  <stop offset="100%" stop-color="#f2cb86"/>
                </radialGradient>
              </defs>
              <g id="p3-nflower-leaves">
                <path d="M50 62 Q46 78 50 94" stroke="url(#p3-nflower-stem-grad)" stroke-width="3.2" stroke-linecap="round" fill="none"/>
                <path d="M48 76 Q32 72 26 80 Q36 84 48 78 Z" fill="#2d405b" opacity="0.85"/>
                <path d="M50 82 Q66 78 74 86 Q62 90 50 84 Z" fill="#2d405b" opacity="0.85"/>
                <path id="p3-sepal-left" class="np-sepal" d="M48 64 Q38 60 42 54 Q48 58 49 63 Z" fill="#3b5273"/>
                <path id="p3-sepal-right" class="np-sepal" d="M52 64 Q62 60 58 54 Q52 58 51 63 Z" fill="#3b5273"/>
              </g>
              <g id="p3-nflower-outer-petals">
                <path class="np-petal np-outer" id="np-o1" d="M50 60 C38 42, 36 24, 50 14 C64 24, 62 42, 50 60 Z" fill="url(#p3-nflower-petal-grad)" opacity="0.92"/>
                <path class="np-petal np-outer" id="np-o2" d="M50 60 C38 42, 36 24, 50 14 C64 24, 62 42, 50 60 Z" fill="url(#p3-nflower-petal-grad)" opacity="0.92"/>
                <path class="np-petal np-outer" id="np-o3" d="M50 60 C38 42, 36 24, 50 14 C64 24, 62 42, 50 60 Z" fill="url(#p3-nflower-petal-grad)" opacity="0.92"/>
                <path class="np-petal np-outer" id="np-o4" d="M50 60 C38 42, 36 24, 50 14 C64 24, 62 42, 50 60 Z" fill="url(#p3-nflower-petal-grad)" opacity="0.92"/>
                <path class="np-petal np-outer" id="np-o5" d="M50 60 C38 42, 36 24, 50 14 C64 24, 62 42, 50 60 Z" fill="url(#p3-nflower-petal-grad)" opacity="0.92"/>
              </g>
              <g id="p3-nflower-inner-petals">
                <path class="np-petal np-inner" id="np-i1" d="M50 60 C42 46, 40 32, 50 24 C60 32, 58 46, 50 60 Z" fill="url(#p3-nflower-inner-grad)" opacity="0.95"/>
                <path class="np-petal np-inner" id="np-i2" d="M50 60 C42 46, 40 32, 50 24 C60 32, 58 46, 50 60 Z" fill="url(#p3-nflower-inner-grad)" opacity="0.95"/>
                <path class="np-petal np-inner" id="np-i3" d="M50 60 C42 46, 40 32, 50 24 C60 32, 58 46, 50 60 Z" fill="url(#p3-nflower-inner-grad)" opacity="0.95"/>
              </g>
              <circle id="p3-nflower-core" cx="50" cy="56" r="4.5" fill="url(#p3-nflower-core-glow)" filter="drop-shadow(0 0 8px #a7c5eb)"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- FOREGROUND LAYER: Poetry & Floating Sealed Envelope -->
      <div class="p3-layer p3-layer-fore" id="p3-layer-fore">
        <div class="p3-poetry-stage" id="p3-poetry-stage">
          <div class="p3-poem-box" id="p3-poem-box">
            <p class="text-lyric" id="p3-poem-line1" style="font-size: var(--text-lg); line-height: var(--leading-relaxed);"></p>
            <p class="text-lyric" id="p3-poem-line2" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); margin-top: var(--space-sm);"></p>
          </div>
        </div>

        <div class="p3-envelope-stage" id="p3-envelope-stage">
          <button class="p3-envelope-btn" id="p3-envelope-btn" aria-label="Terima amplop surat perjalanan" tabindex="0">
            <div class="p3-envelope-card" id="p3-envelope-card">
              <div class="envelope-backlight"></div>
              <svg class="envelope-flap-path" viewBox="0 0 240 150">
                <path d="M0 0 L120 85 L240 0" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" fill="none"/>
                <path d="M0 150 L88 72" stroke="rgba(255,255,255,0.14)" stroke-width="1" fill="none"/>
                <path d="M240 150 L152 72" stroke="rgba(255,255,255,0.14)" stroke-width="1" fill="none"/>
              </svg>
              <div class="envelope-seal">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
              </div>
            </div>
          </button>
          <p class="p3-envelope-prompt text-caption" id="p3-envelope-prompt" style="opacity: 0; margin-top: 1.2rem; text-align: center; color: rgba(255,248,231,0.8);"></p>
        </div>
      </div>
    `;

    container.appendChild(el);
    this.element = el;

    // Initialize Sub-Components (all start in disabled state)
    this.fireflies = new FirefliesCluster({
      container: this.element.querySelector('#p3-fireflies-cluster'),
      onActivated: () => this.handleFireflyMomentComplete(),
    });
    this.fireflies.mount();

    this.flower = new NightFlower({
      container: this.element.querySelector('#p3-night-flower-target'),
      onActivated: () => this.handleFlowerMomentComplete(),
    });
    this.flower.mount();

    this.constellation = new Constellation({
      container: this.element.querySelector('#p3-constellation-cluster'),
      onActivated: () => this.handleConstellationMomentComplete(),
    });
    this.constellation.mount();

    this.envelope = new FloatingEnvelope({
      container: this.element.querySelector('#p3-envelope-stage'),
      onActivated: () => this.handleEnvelopeHandoff(),
    });
    this.envelope.mount();

    return this.element;
  }

  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  async enter() {
    if (this.element) {
      gsap.killTweensOf(this.element);
      this.element.classList.add('active');
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      gsap.set(this.element, { opacity: 1, scale: 1, clearProps: 'filter' });
    }

    this.currentStep = 0; // Locked during world entrance
    transitionManager.changeSkyMood('night', 3.0);

    // Re-instantiate Sub-Components for fresh playthrough
    if (this.fireflies) this.fireflies.destroy();
    if (this.flower) this.flower.destroy();
    if (this.constellation) this.constellation.destroy();
    if (this.envelope) this.envelope.destroy();

    this.fireflies = new FirefliesCluster({
      container: this.element.querySelector('#p3-fireflies-cluster'),
      onActivated: () => this.handleFireflyMomentComplete(),
    });
    this.fireflies.mount();

    this.flower = new NightFlower({
      container: this.element.querySelector('#p3-night-flower-target'),
      onActivated: () => this.handleFlowerMomentComplete(),
    });
    this.flower.mount();

    this.constellation = new Constellation({
      container: this.element.querySelector('#p3-constellation-cluster'),
      onActivated: () => this.handleConstellationMomentComplete(),
    });
    this.constellation.mount();

    this.envelope = new FloatingEnvelope({
      container: this.element.querySelector('#p3-envelope-stage'),
      onActivated: () => this.handleEnvelopeHandoff(),
    });
    this.envelope.mount();

    const moon = this.element.querySelector('#p3-moon');
    const meadow = this.element.querySelector('#p3-meadow');
    const firefliesEl = this.element.querySelector('#p3-fireflies-cluster');
    const flowerEl = this.element.querySelector('#p3-night-flower-target');
    const constellationEl = this.element.querySelector('#p3-constellation-cluster');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Reveal all 3 moments together into the night world
    if (prefersReducedMotion) {
      gsap.set(moon, { opacity: 0.9, y: 0 });
      gsap.set(meadow, { opacity: 0.85 });
      gsap.set(firefliesEl, { opacity: 1 });
      gsap.set(flowerEl, { opacity: 0.95 });
      gsap.set(constellationEl, { opacity: 0.9 });
    } else {
      const enterTl = gsap.timeline();
      this.activeTimelines.push(enterTl);

      enterTl
        .fromTo(moon, { opacity: 0, y: -24, filter: 'blur(8px)' }, { opacity: 0.9, y: 0, filter: 'blur(0px)', duration: 2.2, ease: 'power2.out' }, 0)
        .fromTo(meadow, { opacity: 0, y: 15 }, { opacity: 0.85, y: 0, duration: 2.4, ease: 'power2.out' }, 0.2)
        .fromTo(constellationEl, { opacity: 0, y: -10 }, { opacity: 0.9, y: 0, duration: 2.0, ease: 'power2.out' }, 0.3)
        .fromTo(firefliesEl, { opacity: 0 }, { opacity: 1, duration: 2.0, ease: 'power1.out' }, 0.5)
        .fromTo(flowerEl, { opacity: 0, scale: 0.9, filter: 'blur(6px)' }, { opacity: 0.95, scale: 1, filter: 'blur(0px)', duration: 2.2, ease: 'power2.out' }, 0.6);
    }

    await this.wait(600);

    // 2. Butterfly Guide Enters from OUTSIDE frame
    this.butterfly = new Butterfly({
      container: document.getElementById('globalActors') || this.stage,
    });

    const isMobile = window.innerWidth <= 600;
    const startX = isMobile ? '110%' : '112%';
    const startY = isMobile ? '10%' : '12%';

    await this.butterfly.emergeFrom(startX, startY);

    // 3. Butterfly glides to Moment 1 (Fireflies)
    const fireflyWaypoints = isMobile
      ? [
          { x: '75%', y: '28%', rotation: -12, duration: 2.2 },
          { x: '45%', y: '48%', rotation: -16, duration: 2.2 },
          { x: '35%', y: '58%', rotation: -10, duration: 2.0 },
        ]
      : [
          { x: '78%', y: '24%', rotation: -14, duration: 2.2 },
          { x: '48%', y: '45%', rotation: -18, duration: 2.4 },
          { x: '26%', y: '64%', rotation: -12, duration: 2.2 },
        ];

    await this.butterfly.flyCurvedPath(fireflyWaypoints);
    await this.butterfly.restAt(isMobile ? '35%' : '26%', isMobile ? '58%' : '64%');

    // UNLOCK MOMENT 1 (Instantly clickable as soon as butterfly settles)
    this.currentStep = 1;
    if (this.fireflies) {
      this.fireflies.enableInteraction(4800);
    }
  }

  async showPoetry(line1, line2 = null, readDuration = 3400) {
    const poemBox = this.element.querySelector('#p3-poem-box');
    const poem1 = this.element.querySelector('#p3-poem-line1');
    const poem2 = this.element.querySelector('#p3-poem-line2');

    if (!poemBox || !poem1) return;

    const items = [
      { element: poem1, text: line1, options: { speed: 36 } },
    ];

    if (line2 && poem2) {
      poem2.style.display = 'block';
      items.push({ element: poem2, text: line2, options: { speed: 36 } });
    } else if (poem2) {
      poem2.style.display = 'none';
    }

    await Typewriter.sequence(poemBox, items, readDuration);
  }

  async handleFireflyMomentComplete() {
    this.currentStep = 0; // Lock during narrative & flight
    const isMobile = window.innerWidth <= 600;

    await this.wait(600);

    // Butterfly ascends to top-left to clear reading zone
    if (this.butterfly) {
      this.butterfly.setFastFlap();
      await this.butterfly.flyCurvedPath([
        { x: isMobile ? '14%' : '16%', y: isMobile ? '12%' : '14%', rotation: -10, duration: 1.4 },
      ]);
      this.butterfly.setRestingFlap();
    }

    // Poetic Revelation 1
    await this.showPoetry(
      STORY_CONTENT.phase3.moment1PoetryLine1,
      STORY_CONTENT.phase3.moment1PoetryLine2,
      3600
    );

    // Guide Butterfly to Moment 2 (Night Flower)
    const flowerWaypoints = isMobile
      ? [
          { x: '50%', y: '45%', rotation: 15, duration: 2.2 },
          { x: '72%', y: '68%', rotation: 10, duration: 2.4 },
        ]
      : [
          { x: '52%', y: '42%', rotation: 18, duration: 2.4 },
          { x: '76%', y: '66%', rotation: 8, duration: 2.6 },
        ];

    if (this.butterfly) {
      await this.butterfly.flyCurvedPath(flowerWaypoints);
      await this.butterfly.restAt(isMobile ? '72%' : '76%', isMobile ? '68%' : '66%');
    }

    // UNLOCK MOMENT 2 (Instantly clickable as soon as butterfly arrives at flower)
    this.currentStep = 2;
    if (this.flower) {
      this.flower.enableInteraction(4800);
    }
  }

  async handleFlowerMomentComplete() {
    this.currentStep = 0; // Lock during narrative & flight
    const isMobile = window.innerWidth <= 600;

    await this.wait(700);

    if (this.butterfly) {
      this.butterfly.setRestingFlap();
    }

    // Poetic Revelation 2
    await this.showPoetry(
      STORY_CONTENT.phase3.moment2PoetryLine1,
      STORY_CONTENT.phase3.moment2PoetryLine2,
      3400
    );

    // Guide Butterfly to Moment 3 (Constellation) - position on the rightmost non-clickable star node
    const skyWaypoints = isMobile
      ? [
          { x: '58%', y: '36%', rotation: -8, duration: 1.8 },
          { x: '68%', y: '13%', rotation: 6, duration: 2.0 },
        ]
      : [
          { x: '52%', y: '34%', rotation: -8, duration: 1.8 },
          { x: '42%', y: '14%', rotation: 6, duration: 2.0 },
        ];

    if (this.butterfly) {
      if (this.butterfly.element) {
        this.butterfly.element.style.pointerEvents = 'none';
      }
      await this.butterfly.flyCurvedPath(skyWaypoints);
      await this.butterfly.restAt(isMobile ? '68%' : '42%', isMobile ? '13%' : '14%');
      if (this.butterfly.element) {
        this.butterfly.element.style.pointerEvents = 'none';
      }
    }

    // UNLOCK MOMENT 3 (Instantly clickable as soon as butterfly arrives at constellation)
    this.currentStep = 3;
    if (this.constellation) {
      this.constellation.enableInteraction(4800);
    }
  }

  async handleConstellationMomentComplete() {
    this.currentStep = 0; // Lock during narrative & envelope reveal
    await this.wait(700);

    // Poetic Revelation 3
    await this.showPoetry(
      STORY_CONTENT.phase3.moment3PoetryLine1,
      STORY_CONTENT.phase3.moment3PoetryLine2,
      3400
    );

    // Reveal Final Moment (Envelope)
    await this.revealEnvelopeSequence();
  }

  async revealEnvelopeSequence() {
    const isMobile = window.innerWidth <= 600;

    if (this.butterfly) {
      await this.butterfly.flyCurvedPath([
        { x: '50%', y: '24%', rotation: 0, duration: 2.2 },
      ]);
      this.butterfly.setRestingFlap();
    }

    await this.wait(400);

    if (this.envelope) {
      await this.envelope.reveal();
    }

    await this.wait(1400);

    if (this.butterfly) {
      await this.butterfly.flyCurvedPath([
        { x: isMobile ? '68%' : '64%', y: isMobile ? '46%' : '44%', rotation: -8, duration: 1.6 },
      ]);
      await this.butterfly.restAt(isMobile ? '68%' : '64%', isMobile ? '46%' : '44%');
    }

    // UNLOCK MOMENT 4 (Instantly clickable as soon as butterfly settles near envelope)
    this.currentStep = 4;
    if (this.envelope) {
      this.envelope.enableInteraction();
    }
  }

  async handleEnvelopeHandoff() {
    this.currentStep = 5;

    if (this.butterfly) {
      this.butterfly.flyCurvedPath([
        { x: '50%', y: '22%', rotation: 0, duration: 1.6 },
      ]);
      this.butterfly.setRestingFlap();
    }

    await this.wait(800);

    // Seamless handoff to Phase 4
    await sceneManager.goTo('phase4', { butterfly: this.butterfly });
  }

  exit() {
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    if (this.fireflies) {
      this.fireflies.destroy();
      this.fireflies = null;
    }
    if (this.flower) {
      this.flower.destroy();
      this.flower = null;
    }
    if (this.constellation) {
      this.constellation.destroy();
      this.constellation = null;
    }
    if (this.envelope) {
      this.envelope.destroy();
      this.envelope = null;
    }

    if (this.butterfly) {
      this.butterfly.destroy();
      this.butterfly = null;
    }

    if (this.element) {
      this.element.classList.remove('active');
    }
  }

  unmount() {
    this.exit();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }

  destroy() {
    this.unmount();
  }
}

export const phase3Scene = new Phase3Scene();
export default phase3Scene;
