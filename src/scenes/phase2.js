import gsap from 'gsap';
import { sceneManager } from '../core/sceneManager.js';
import { transitionManager } from '../core/transitionManager.js';
import { Butterfly } from '../components/Butterfly.js';
import { STORY_CONTENT } from '../data/storyContent.js';
import { Typewriter } from '../utils/typewriter.js';
import { MemoryGallery } from './phase2/MemoryGallery.js';
import { MosaicWall } from './phase2/MosaicWall.js';
import { BloomingFlower } from './phase2/BloomingFlower.js';

/**
 * Phase 2 — Memories ("Mengenangmu")
 * Orchestrates:
 * 1. Opening monologue typewriter sequence
 * 2. 5 Hero Polaroid memory cards with water ripple clarify (MemoryGallery)
 * 3. Transition monologue: "Dan sebenarnya... masih ada begitu banyak kepingan..."
 * 4. Mosaic Wall (MosaicWall) displaying all 12 photos simultaneously in an interactive collage
 * 5. Interactive botanical blooming flower (BloomingFlower)
 * 6. Butterfly guide emergence & flight -> Transition to Phase 3
 */
export class Phase2Scene {
  constructor() {
    this.element = null;
    this.stage = null;
    this.gallery = null;
    this.mosaicWall = null;
    this.flower = null;
    this.butterfly = null;
    this.activeTimelines = [];
    this.timeouts = [];
  }

  mount(container) {
    if (this.element) return this.element;
    this.stage = container;
    const content = STORY_CONTENT.phase2;

    const el = document.createElement('section');
    el.id = 'scene-phase2';
    el.className = 'scene scene-phase2';
    el.setAttribute('aria-label', content.meta);
    el.innerHTML = `
      <!-- 1. Opening Narrative Monologue -->
      <div class="phase2-monologue" id="p2-monologue" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--space-md); text-align: center; z-index: 12; pointer-events: none;">
        <p class="text-lyric p2-opening-line" id="p2-open-1" style="font-size: var(--text-lg); opacity: 0;">
          "${content.monologueLine1}"
        </p>
        <p class="text-lyric p2-opening-line" id="p2-open-2" style="font-size: var(--text-lg); margin-top: var(--space-md); opacity: 0;">
          "${content.monologueLine2}"
        </p>
      </div>

      <!-- 2. Memory Cards Deck Container (z-index 20 above nav-layer z-index 14) -->
      <div class="phase2-memories-container" id="p2-memories-stage" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 20;"></div>

      <!-- 2b. Interactive Navigation Zones -->
      <div class="memory-nav-layer" id="p2-nav-layer" aria-label="Navigasi Kartu Kenangan (Ketuk atau Geser Layar)">
        <button class="memory-nav-zone zone-left is-disabled" id="p2-nav-prev" aria-label="Kartu Sebelumnya" tabindex="0"></button>
        <button class="memory-nav-zone zone-right is-disabled is-locked" id="p2-nav-next" aria-label="Kartu Selanjutnya" tabindex="0"></button>
      </div>

      <!-- 2c. Intermediate Transition Monologue -->
      <div class="phase2-transition-monologue" id="p2-trans-monologue" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--space-md); text-align: center; z-index: 22; pointer-events: none; opacity: 0; visibility: hidden;">
        <p class="text-lyric p2-trans-line" id="p2-trans-1" style="font-size: var(--text-lg); opacity: 0; max-width: 500px;">
          "${content.transitionMonologueLine1}"
        </p>
        <p class="text-lyric p2-trans-line" id="p2-trans-2" style="font-size: var(--text-lg); margin-top: var(--space-md); opacity: 0; max-width: 500px;">
          "${content.transitionMonologueLine2}"
        </p>
      </div>

      <!-- 2d. Mosaic Wall Container (holds all 12 photos simultaneously) -->
      <div class="phase2-mosaic-stage" id="p2-mosaic-stage" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 25; opacity: 0; visibility: hidden;"></div>

      <!-- 3. Interactive Environment & Blooming Flower -->
      <div class="interactive-environment" id="p2-interactive" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--space-md); text-align: center; visibility: hidden; opacity: 0; pointer-events: none; z-index: 20;">
        <p class="text-lyric" id="p2-interactive-prompt" style="font-size: var(--text-base); max-width: 440px; opacity: 0;">
          "${content.interactivePrompt}"
        </p>

        <!-- Interactive Botanical Flower Button -->
        <button class="interactive-flower-btn" id="p2-flower-btn" role="button" tabindex="0" aria-label="${content.flowerAriaLabel}" style="opacity: 0;">
          <div class="flower-ambient-glow"></div>
          <div class="flower-radiance" id="p2-flower-radiance"></div>
          
          <svg viewBox="0 0 100 100" class="flower-svg" id="p2-flower-svg">
            <defs>
              <linearGradient id="p2-flower-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff8f2" stop-opacity="0.95"/>
                <stop offset="45%" stop-color="#f7a988" stop-opacity="0.9"/>
                <stop offset="100%" stop-color="#e37b90" stop-opacity="0.85"/>
              </linearGradient>

              <linearGradient id="p2-flower-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
                <stop offset="50%" stop-color="#fca8b8" stop-opacity="0.92"/>
                <stop offset="100%" stop-color="#d65d7a" stop-opacity="0.88"/>
              </linearGradient>

              <linearGradient id="p2-flower-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff5ea" stop-opacity="1"/>
                <stop offset="60%" stop-color="#fcd5b8" stop-opacity="0.95"/>
                <stop offset="100%" stop-color="#f7a988" stop-opacity="0.9"/>
              </linearGradient>

              <linearGradient id="p2-flower-stem" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#4a7c59"/>
                <stop offset="100%" stop-color="#243e2b"/>
              </linearGradient>
            </defs>

            <!-- Organic Stem & Foliage -->
            <g id="flower-stem-group">
              <path d="M50 52 Q48 75 50 100" stroke="url(#p2-flower-stem)" stroke-width="3" stroke-linecap="round" fill="none"/>
              <path d="M49 72 C40 70 35 63 38 58 C46 60 48 67 49 72 Z" fill="url(#p2-flower-stem)" opacity="0.85"/>
              <path d="M51 80 C60 77 65 70 62 66 C54 67 52 74 51 80 Z" fill="url(#p2-flower-stem)" opacity="0.85"/>
            </g>

            <!-- Pollen Halo -->
            <g id="flower-sparkles" style="pointer-events: none;">
              <circle class="flower-sparkle" cx="50" cy="50" r="1.4" fill="#ffffff" opacity="0"/>
              <circle class="flower-sparkle" cx="50" cy="50" r="1.6" fill="#f2cb86" opacity="0"/>
              <circle class="flower-sparkle" cx="50" cy="50" r="1.3" fill="#ffffff" opacity="0"/>
              <circle class="flower-sparkle" cx="50" cy="50" r="1.5" fill="#f7a988" opacity="0"/>
              <circle class="flower-sparkle" cx="50" cy="50" r="1.4" fill="#ffffff" opacity="0"/>
              <circle class="flower-sparkle" cx="50" cy="50" r="1.6" fill="#f2cb86" opacity="0"/>
            </g>

            <!-- 1. Outer Petals Ring -->
            <g id="flower-petals-outer">
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(0 50 50)"/>
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(60 50 50)"/>
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(120 50 50)"/>
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(180 50 50)"/>
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(240 50 50)"/>
              <path class="petal-outer" d="M50 50 C41 40 37 26 50 16 C63 26 59 40 50 50 Z" fill="url(#p2-flower-grad1)" transform="rotate(300 50 50)"/>
            </g>

            <!-- 2. Mid Petals Ring -->
            <g id="flower-petals-mid">
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(30 50 50)"/>
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(90 50 50)"/>
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(150 50 50)"/>
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(210 50 50)"/>
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(270 50 50)"/>
              <path class="petal-mid" d="M50 50 C43 42 40 30 50 22 C60 30 57 42 50 50 Z" fill="url(#p2-flower-grad2)" transform="rotate(330 50 50)"/>
            </g>

            <!-- 3. Inner Petals Bud -->
            <g id="flower-petals-inner">
              <path class="petal-inner" d="M50 50 C45 44 43 36 50 30 C57 36 55 44 50 50 Z" fill="url(#p2-flower-grad3)" transform="rotate(0 50 50)"/>
              <path class="petal-inner" d="M50 50 C45 44 43 36 50 30 C57 36 55 44 50 50 Z" fill="url(#p2-flower-grad3)" transform="rotate(72 50 50)"/>
              <path class="petal-inner" d="M50 50 C45 44 43 36 50 30 C57 36 55 44 50 50 Z" fill="url(#p2-flower-grad3)" transform="rotate(144 50 50)"/>
              <path class="petal-inner" d="M50 50 C45 44 43 36 50 30 C57 36 55 44 50 50 Z" fill="url(#p2-flower-grad3)" transform="rotate(216 50 50)"/>
              <path class="petal-inner" d="M50 50 C45 44 43 36 50 30 C57 36 55 44 50 50 Z" fill="url(#p2-flower-grad3)" transform="rotate(288 50 50)"/>
            </g>

            <!-- 4. Stamen Core -->
            <g id="flower-stamen-core">
              <circle cx="50" cy="44" r="1.5" fill="#ffffff" filter="drop-shadow(0 0 3px #f2cb86)"/>
              <circle cx="55" cy="47" r="1.5" fill="#fde1a9" filter="drop-shadow(0 0 3px #f2cb86)"/>
              <circle cx="54" cy="54" r="1.5" fill="#f2cb86" filter="drop-shadow(0 0 3px #f2cb86)"/>
              <circle cx="46" cy="54" r="1.5" fill="#f2cb86" filter="drop-shadow(0 0 3px #f2cb86)"/>
              <circle cx="45" cy="47" r="1.5" fill="#fde1a9" filter="drop-shadow(0 0 3px #f2cb86)"/>
              <circle cx="50" cy="50" r="5.5" fill="#ffffff" filter="drop-shadow(0 0 6px #f2cb86)"/>
              <circle cx="50" cy="50" r="3.2" fill="#f2cb86"/>
            </g>
          </svg>
        </button>
      </div>

      <!-- 4. Closing Narrative Handoff -->
      <div class="phase2-closing" id="p2-closing" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--space-md); text-align: center; z-index: 22; pointer-events: none; opacity: 0; visibility: hidden;">
        <p class="text-lyric" id="p2-closing-text" style="font-size: var(--text-lg); max-width: 460px;">
          "${content.closingText}"
        </p>
      </div>
    `;

    container.appendChild(el);
    this.element = el;

    // Initialize Sub-Components
    this.gallery = new MemoryGallery({
      container: this.element.querySelector('#p2-memories-stage'),
      navContainer: this.element.querySelector('#p2-nav-layer'),
      onFinish: () => this.onHeroCardsFinished(),
    });
    this.gallery.mount();

    this.mosaicWall = new MosaicWall({
      container: this.element.querySelector('#p2-mosaic-stage'),
      onFinish: () => this.revealInteractiveEnvironment(),
    });
    this.mosaicWall.mount();

    this.flower = new BloomingFlower({
      container: this.element.querySelector('#p2-interactive'),
      onActivated: () => this.onFlowerActivated(),
    });
    this.flower.mount();

    return this.element;
  }

  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  async enter() {
    transitionManager.changeSkyMood('sunset', 2.0);

    if (this.element) {
      gsap.killTweensOf(this.element);
      this.element.classList.add('active');
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      gsap.set(this.element, { opacity: 1, scale: 1, clearProps: 'filter' });
    }

    // Reset sub-stages
    const memStage = this.element.querySelector('#p2-memories-stage');
    if (memStage) {
      memStage.style.display = '';
      memStage.style.pointerEvents = 'none';
    }
    const navLayer = this.element.querySelector('#p2-nav-layer');
    if (navLayer) {
      navLayer.style.display = '';
      navLayer.style.pointerEvents = 'none';
    }
    const transMonologue = this.element.querySelector('#p2-trans-monologue');
    if (transMonologue) {
      transMonologue.style.visibility = 'hidden';
      transMonologue.style.opacity = '0';
    }
    const mosaicStage = this.element.querySelector('#p2-mosaic-stage');
    if (mosaicStage) {
      mosaicStage.style.visibility = 'hidden';
      mosaicStage.style.opacity = '0';
      mosaicStage.style.pointerEvents = 'none';
    }
    const interactiveSection = this.element.querySelector('#p2-interactive');
    if (interactiveSection) {
      interactiveSection.style.visibility = 'hidden';
      interactiveSection.style.opacity = '0';
      interactiveSection.style.pointerEvents = 'none';
    }
    const closingSection = this.element.querySelector('#p2-closing');
    if (closingSection) {
      closingSection.style.visibility = 'hidden';
      closingSection.style.opacity = '0';
      closingSection.style.pointerEvents = 'none';
    }

    // Re-initialize Sub-Components for fresh playthrough
    if (this.gallery) {
      this.gallery.destroy();
    }
    this.gallery = new MemoryGallery({
      container: this.element.querySelector('#p2-memories-stage'),
      navContainer: this.element.querySelector('#p2-nav-layer'),
      onFinish: () => this.onHeroCardsFinished(),
    });
    this.gallery.mount();

    if (this.mosaicWall) {
      this.mosaicWall.destroy();
    }
    this.mosaicWall = new MosaicWall({
      container: this.element.querySelector('#p2-mosaic-stage'),
      onFinish: () => this.revealInteractiveEnvironment(),
    });
    this.mosaicWall.mount();

    if (this.flower) {
      this.flower.destroy();
    }
    this.flower = new BloomingFlower({
      container: this.element.querySelector('#p2-interactive'),
      onActivated: () => this.onFlowerActivated(),
    });
    this.flower.mount();

    const monologue = this.element.querySelector('#p2-monologue');
    const openLine1 = this.element.querySelector('#p2-open-1');
    const openLine2 = this.element.querySelector('#p2-open-2');
    const content = STORY_CONTENT.phase2;

    // 1. Opening Monologue Sequence
    await Typewriter.sequence(
      monologue,
      [
        { element: openLine1, text: content.monologueLine1, options: { speed: 38 } },
        { element: openLine2, text: content.monologueLine2, options: { speed: 38 } },
      ],
      3200
    );

    // 2. Reveal First Memory Card (from 5 hero cards)
    if (this.gallery) {
      await this.gallery.revealFirstCard();
    }
  }

  /**
   * Called when all 5 Hero Cards have been navigated through
   */
  async onHeroCardsFinished() {
    const transMonologue = this.element.querySelector('#p2-trans-monologue');
    const transLine1 = this.element.querySelector('#p2-trans-1');
    const transLine2 = this.element.querySelector('#p2-trans-2');
    const content = STORY_CONTENT.phase2;

    // 1. Transition Monologue Sequence ("Dan sebenarnya... tidak hanya lima kepingan itu")
    if (transMonologue && transLine1 && transLine2) {
      transMonologue.style.visibility = 'visible';
      transMonologue.style.pointerEvents = 'auto';

      await Typewriter.sequence(
        transMonologue,
        [
          { element: transLine1, text: content.transitionMonologueLine1, options: { speed: 36 } },
          { element: transLine2, text: content.transitionMonologueLine2, options: { speed: 36 } },
        ],
        3000
      );

      transMonologue.style.visibility = 'hidden';
      transMonologue.style.pointerEvents = 'none';
    }

    // 2. Hide hero cards and nav layer to unload GPU memory before mosaic wall
    const memStage = this.element.querySelector('#p2-memories-stage');
    const navLayer = this.element.querySelector('#p2-nav-layer');
    if (memStage) {
      memStage.style.display = 'none';
      memStage.style.pointerEvents = 'none';
    }
    if (navLayer) {
      navLayer.style.display = 'none';
      navLayer.style.pointerEvents = 'none';
    }

    // 3. Reveal Floating Mosaic Wall of all 12 photos
    if (this.mosaicWall) {
      await this.mosaicWall.reveal();
    }
  }

  async revealInteractiveEnvironment() {
    const interactiveSection = this.element.querySelector('#p2-interactive');
    const promptText = this.element.querySelector('#p2-interactive-prompt');
    const flowerBtn = this.element.querySelector('#p2-flower-btn');

    if (!interactiveSection || !flowerBtn) return;

    // Set initial unbloomed flower state
    const outerPetals = this.element.querySelectorAll('.petal-outer');
    const midPetals = this.element.querySelectorAll('.petal-mid');
    const innerPetals = this.element.querySelectorAll('.petal-inner');
    const stamenCore = this.element.querySelector('#flower-stamen-core');

    gsap.set(outerPetals, { scale: 0.35, opacity: 0.7, svgOrigin: '50 50' });
    gsap.set(midPetals, { scale: 0.45, opacity: 0.8, svgOrigin: '50 50' });
    gsap.set(innerPetals, { scale: 0.65, opacity: 0.9, svgOrigin: '50 50' });
    gsap.set(stamenCore, { scale: 0.85, svgOrigin: '50 50' });

    interactiveSection.style.visibility = 'visible';
    interactiveSection.style.pointerEvents = 'auto';

    const revealTl = gsap.timeline({
      onComplete: () => {
        // Start idle water ripple cue ONLY after flower reveal completes
        if (this.flower) {
          this.flower.startIdleTimer(4800);
        }
      },
    });
    this.activeTimelines.push(revealTl);

    revealTl
      .to(interactiveSection, { opacity: 1, duration: 0.8 })
      .fromTo(promptText, { opacity: 0, y: 12, filter: 'blur(6px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' })
      .fromTo(flowerBtn, { opacity: 0, scale: 0.85, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.4, ease: 'back.out(1.4)' }, '-=0.6');
  }

  async onFlowerActivated() {
    const isMobile = window.innerWidth <= 600;

    // 1. Butterfly emerges directly from flower center
    this.butterfly = new Butterfly({
      container: document.getElementById('globalActors') || this.stage,
    });

    const flowerRect = this.element.querySelector('#p2-flower-btn').getBoundingClientRect();
    const stageRect = (this.stage || document.body).getBoundingClientRect();
    const flowerCenterX = `${((flowerRect.left - stageRect.left + flowerRect.width / 2) / stageRect.width) * 100}%`;
    const flowerCenterY = `${((flowerRect.top - stageRect.top + flowerRect.height / 2) / stageRect.height) * 100}%`;

    await this.butterfly.emergeFrom(flowerCenterX, flowerCenterY);

    // 2. Dissolve flower & prompt smoothly as butterfly takes flight
    const interactiveSection = this.element.querySelector('#p2-interactive');
    if (interactiveSection) {
      gsap.to(interactiveSection, {
        opacity: 0,
        scale: 0.92,
        filter: 'blur(8px)',
        duration: 1.4,
        ease: 'power2.inOut',
        onComplete: () => {
          interactiveSection.style.visibility = 'hidden';
          interactiveSection.style.pointerEvents = 'none';
        },
      });
    }

    // 3. Butterfly takes flight along organic curved path
    const flightWaypoints = isMobile
      ? [
          { x: '35%', y: '42%', rotation: -18, duration: 1.8 },
          { x: '22%', y: '26%', rotation: 12, duration: 2.0 },
          { x: '50%', y: '16%', rotation: 22, duration: 2.2 },
          { x: '78%', y: '24%', rotation: 8, duration: 2.0 },
          { x: '82%', y: '34%', rotation: -6, duration: 1.8 },
        ]
      : [
          { x: '38%', y: '40%', rotation: -20, duration: 2.0 },
          { x: '24%', y: '22%', rotation: 14, duration: 2.2 },
          { x: '50%', y: '14%', rotation: 25, duration: 2.4 },
          { x: '76%', y: '20%', rotation: 10, duration: 2.2 },
          { x: '80%', y: '32%', rotation: -8, duration: 2.0 },
        ];

    this.butterfly.flyCurvedPath(flightWaypoints);

    await this.wait(1000);

    // 4. Reveal Closing Narrative Reflection in center stage
    const closingSection = this.element.querySelector('#p2-closing');
    const closingText = this.element.querySelector('#p2-closing-text');

    if (closingSection && closingText) {
      closingSection.style.visibility = 'visible';
      closingSection.style.pointerEvents = 'auto';
      gsap.to(closingSection, { opacity: 1, duration: 0.6 });

      await Typewriter.type(closingText, `"${STORY_CONTENT.phase2.closingText}"`, { speed: 38 });
      await this.wait(2200);
    }

    // 5. Butterfly flies away towards the horizon
    await this.butterfly.flyAway('108%', '14%', 2.6);

    // 6. Seamless Transition to Phase 3
    await sceneManager.goTo('phase3');
  }

  exit() {
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    if (this.gallery) {
      this.gallery.destroy();
      this.gallery = null;
    }
    if (this.mosaicWall) {
      this.mosaicWall.destroy();
      this.mosaicWall = null;
    }
    if (this.flower) {
      this.flower.destroy();
      this.flower = null;
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

export const phase2Scene = new Phase2Scene();
export default phase2Scene;
