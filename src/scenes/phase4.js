import gsap from 'gsap';
import { sceneManager } from '../core/sceneManager.js';
import { transitionManager } from '../core/transitionManager.js';
import { audioManager } from '../audio/audioManager.js';
import { Letter } from '../components/Letter.js';
import { Heart } from '../components/Heart.js';
import { Butterfly } from '../components/Butterfly.js';
import { STORY_CONTENT } from '../data/storyContent.js';
import { Typewriter } from '../utils/typewriter.js';

/**
 * Phase 4 — The Conversation ("Hal-Hal yang Sulit Diucapkan")
 * Intimate, vulnerable, mature, and calm emotional core of the website:
 * Continuous butterfly guide -> Monologue reflection -> User taps envelope to open ->
 * User-driven staged reading -> Heart character introduction & conversational prompt -> Handoff to Phase 5.
 */
export class Phase4Scene {
  constructor() {
    this.element = null;
    this.stage = null;
    this.butterfly = null;
    this.letter = null;
    this.heart = null;

    this.activeTimelines = [];
    this.timeouts = [];

    // Bound listeners for cleanup
    this.handleNextClick = null;
    this.handleNextKey = null;
  }

  mount(container) {
    if (this.element) return this.element;
    this.stage = container;
    const content = STORY_CONTENT.phase4;

    const el = document.createElement('section');
    el.id = 'scene-phase4';
    el.className = 'scene scene-phase4';
    el.setAttribute('aria-label', content.meta);

    el.innerHTML = `
      <!-- 1. Opening Reflective Monologue (Centered Silence) -->
      <div class="p4-monologue-stage" id="p4-monologue-stage">
        <div class="p4-monologue-box" id="p4-monologue-box">
          <p class="text-lyric" id="p4-mono-line1" style="font-size: var(--text-lg); line-height: var(--leading-relaxed);"></p>
          <p class="text-lyric" id="p4-mono-line2" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); margin-top: var(--space-md);"></p>
          <p class="text-lyric" id="p4-mono-line3" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); margin-top: var(--space-md);"></p>
        </div>
      </div>

      <!-- 2. Letter Container Stage -->
      <div class="phase4-letter-container" id="p4-letter-stage" style="position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; pointer-events: auto; z-index: 20;"></div>

      <!-- 3. Final Reflections Box (Handoff to Phase 5) -->
      <div class="p4-reflection-stage" id="p4-reflection-stage" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: var(--space-md); text-align: center; z-index: 24; pointer-events: none; opacity: 0;">
        <div class="p4-reflection-box" style="max-width: 520px;">
          <p class="text-lyric" id="p4-ref-line1" style="font-size: var(--text-lg); line-height: var(--leading-relaxed);"></p>
          <p class="text-lyric" id="p4-ref-line2" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); margin-top: var(--space-md);"></p>
        </div>
      </div>
    `;

    container.appendChild(el);
    this.element = el;
    this.bindEvents();
    return this.element;
  }

  bindEvents() {
    // Phase 4 events are bound dynamically to letter and reflection stage
  }

  /**
   * Safe timer utility with tracking for lifecycle cleanup
   */
  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  /**
   * Main Enter Lifecycle:
   * Continuous butterfly guide -> Monologue reflection -> User taps envelope to open
   */
  async enter(data = {}) {
    if (this.element) {
      gsap.killTweensOf(this.element);
      this.element.classList.add('active');
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      gsap.set(this.element, { opacity: 1, scale: 1, clearProps: 'filter' });
    }

    transitionManager.changeSkyMood('night', 2.5);

    // 1. Lower ambient music volume slightly for intimate letter focus
    audioManager.fadeVolume(0.2, 2200);

    const content = STORY_CONTENT.phase4;
    const monologueBox = this.element.querySelector('#p4-monologue-box');
    const mono1 = this.element.querySelector('#p4-mono-line1');
    const mono2 = this.element.querySelector('#p4-mono-line2');
    const mono3 = this.element.querySelector('#p4-mono-line3');
    const letterStage = this.element.querySelector('#p4-letter-stage');
    const heartStage = this.element.querySelector('#p4-heart-stage');
    const refStage = this.element.querySelector('#p4-reflection-stage');

    // Clean reset of sub-stages for repeat playthrough
    if (monologueBox) {
      monologueBox.style.display = 'block';
      monologueBox.style.visibility = 'visible';
      monologueBox.style.opacity = '1';
    }
    if (letterStage) {
      letterStage.innerHTML = '';
      letterStage.style.visibility = 'visible';
      letterStage.style.opacity = '1';
    }
    if (heartStage) {
      heartStage.style.visibility = 'hidden';
      heartStage.style.opacity = '0';
      const heartWrap = this.element.querySelector('#p4-heart-wrap');
      if (heartWrap) heartWrap.innerHTML = '';
    }
    if (refStage) {
      refStage.style.visibility = 'hidden';
      refStage.style.opacity = '0';
    }
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 2. Butterfly Guide stays seamlessly present from Phase 3 without any destruction or reappearance
    if (data.butterfly && data.butterfly.element) {
      this.butterfly = data.butterfly;
      this.butterfly.setRestingFlap();
      if (this.butterfly.element) gsap.set(this.butterfly.element, { opacity: 0.9 });
    } else {
      this.butterfly = new Butterfly({
        container: document.getElementById('globalActors') || this.stage,
      });
      await this.butterfly.emergeFrom('50%', '30%');
      this.butterfly.setRestingFlap();
    }

    // 3. Opening 3-Part Monologue with Typewriter effect and reading hold
    await Typewriter.sequence(
      monologueBox,
      [
        { element: mono1, text: content.monologueLine1, options: { speed: 36 } },
        { element: mono2, text: content.monologueLine2, options: { speed: 36 } },
        { element: mono3, text: content.monologueLine3, options: { speed: 36 } },
      ],
      3400 // Comfortable pause before envelope arrives
    );

    if (monologueBox) monologueBox.style.display = 'none';

    // 5. Letter Envelope Emerges Closed in Center, Waiting for User Tap
    this.letter = new Letter({
      container: letterStage,
      name: STORY_CONTENT.meta.partnerName || 'Dia',
      onFinish: () => this.onLetterFinished(),
      onBeforeOpen: async () => {
        // Butterfly moves aside to top-left corner (clear of audio pill and letter content)
        if (this.butterfly) {
          const isMobile = window.innerWidth <= 600;
          await this.butterfly.flyCurvedPath([
            { x: isMobile ? '12%' : '14%', y: isMobile ? '10%' : '12%', rotation: -10, duration: 1.8 },
          ]);
          this.butterfly.setRestingFlap();
        }
      },
    });
    this.letter.render();
  }

  /**
   * Triggered when the user finishes reading all sections of the letter
   */
  async onLetterFinished() {
    const isMobile = window.innerWidth <= 600;
    const refStage = this.element.querySelector('#p4-reflection-stage');
    const ref1 = this.element.querySelector('#p4-ref-line1');
    const ref2 = this.element.querySelector('#p4-ref-line2');

    // 1. Butterfly glides safely to the top-left corner
    if (this.butterfly) {
      await this.butterfly.flyCurvedPath([
        { x: isMobile ? '12%' : '14%', y: isMobile ? '10%' : '12%', rotation: -8, duration: 2.0 },
      ]);
      this.butterfly.setRestingFlap();
    }

    await this.wait(600);

    // 2. Letter Paper Fades Smoothly
    if (this.letter) {
      await this.letter.fadePaper(1.4);
    }

    // 3. Final Reflections Reveal with Typewriter Sequence
    if (refStage && ref1 && ref2) {
      await Typewriter.sequence(
        refStage,
        [
          { element: ref1, text: STORY_CONTENT.phase4.reflectionLine1, options: { speed: 36 } },
          { element: ref2, text: STORY_CONTENT.phase4.reflectionLine2, options: { speed: 36 } },
        ],
        3400 // Hold pause before transitioning to Phase 5
      );
    }

    await this.wait(800);

    // 4. Smooth Cinematic Handoff directly to Phase 5 (The Choice & Endings)
    await this.goToPhase5();
  }

  /**
   * Final handoff: Smooth transition to Phase 5
   */
  async goToPhase5() {
    this.isPassingButterfly = true;
    sceneManager.goTo('phase5', { butterfly: this.butterfly });
  }

  /**
   * Exit lifecycle: Kill all active animations and cleanup
   */
  async exit() {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    if (this.letter) {
      this.letter.destroy();
      this.letter = null;
    }

    if (this.heart) {
      this.heart.destroy();
      this.heart = null;
    }

    if (!this.isPassingButterfly && this.butterfly) {
      this.butterfly.destroy();
      this.butterfly = null;
    }

    return gsap.to(this.element, {
      opacity: 0,
      scale: 0.98,
      filter: 'blur(6px)',
      duration: 1.0,
      ease: 'power2.inOut',
    });
  }

  /**
   * Unmount lifecycle: Complete teardown of DOM and event listeners
   */
  unmount() {
    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    if (this.letter) {
      this.letter.destroy();
      this.letter = null;
    }

    if (!this.isPassingButterfly && this.butterfly) {
      this.butterfly.destroy();
      this.butterfly = null;
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }

  destroy() {
    this.unmount();
  }
}

export const phase4Scene = new Phase4Scene();
export default phase4Scene;
