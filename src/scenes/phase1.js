import gsap from 'gsap';
import { sceneManager } from '../core/sceneManager.js';
import { audioManager } from '../audio/audioManager.js';
import { transitionManager } from '../core/transitionManager.js';
import { STORY_CONTENT } from '../data/storyContent.js';
import { Typewriter } from '../utils/typewriter.js';

/**
 * Phase 1 — The Beginning ("Ruang Hening")
 * Atmospheric, Literary & Cinematic Opening Scene for "Lentera yang Masih Menyala"
 */
export class Phase1Scene {
  constructor() {
    this.element = null;
    this.introTimeline = null;
    this.butterflyTimeline = null;
    this.startBtn = null;
    this.handleStartClick = null;
  }

  mount(container) {
    if (this.element) return this.element;
    const content = STORY_CONTENT.phase1;

    const el = document.createElement('section');
    el.id = 'scene-phase1';
    el.className = 'scene scene-phase1';
    el.setAttribute('aria-label', `Fase 1: ${content.meta}`);
    el.innerHTML = `
      <!-- Subtle Distant Butterfly Silhouette (Foreshadowing, Non-interactive) -->
      <div class="distant-butterfly-foreshadow" id="p1-butterfly" aria-hidden="true">
        <svg viewBox="0 0 100 100" width="100%" height="100%" class="distant-butterfly-svg">
          <g class="distant-wing-group">
            <path d="M50 50 C24 16, 4 32, 16 58 C24 72, 42 70, 50 55 C58 70, 76 72, 84 58 C96 32, 76 16, 50 50 Z" fill="#f2cb86" opacity="0.32" />
          </g>
        </svg>
      </div>

      <!-- Main Narrative Content with Celestial Aura -->
      <div class="phase-content p1-narrative-stage">
        <!-- Floating Lantern Ember Symbol -->
        <div class="p1-lantern-symbol" id="p1-lantern" style="opacity: 0;">
          <div class="p1-lantern-glow"></div>
          <svg class="p1-lantern-svg" viewBox="0 0 48 48" width="46" height="46" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <!-- Lantern Top Ring & Roof -->
            <circle cx="24" cy="7" r="3.2" stroke="#f2cb86" stroke-width="1.6" />
            <path d="M15 13 L33 13 L29 17 L19 17 Z" fill="rgba(242, 203, 134, 0.22)" stroke="#f2cb86" />
            <!-- Lantern Glass Chamber -->
            <path d="M18 17 L15 33 L33 33 L30 17 Z" fill="rgba(255, 255, 255, 0.05)" stroke="#f2cb86" />
            <!-- Inner Glowing Flame / Ember -->
            <path class="p1-flame-core" d="M24 23 C21.5 26.5 21.5 28.5 24 31 C26.5 28.5 26.5 26.5 24 23 Z" fill="#f2cb86" />
            <!-- Lantern Base -->
            <path d="M15 33 L33 33 L30 37 L18 37 Z" fill="rgba(242, 203, 134, 0.28)" stroke="#f2cb86" />
            <!-- Soft Radiating Ambient Dots -->
            <circle cx="9" cy="25" r="1.2" fill="#f2cb86" opacity="0.6" />
            <circle cx="39" cy="25" r="1.2" fill="#f2cb86" opacity="0.6" />
            <circle cx="24" cy="42" r="1.2" fill="#f2cb86" opacity="0.6" />
          </svg>
        </div>

        <!-- Meta Tag with Ornamental Stars -->
        <div class="p1-meta-badge" id="p1-meta" style="opacity: 0;">
          <span class="p1-star">✧</span>
          <span class="p1-meta-text">${content.meta}</span>
          <span class="p1-star">✧</span>
        </div>

        <!-- Grand Master Title -->
        <h1 class="p1-title title-poetic" id="p1-title" style="opacity: 0;">
          <span class="p1-title-text">${content.title}</span>
        </h1>

        <!-- Poetic Quotes Framed Box -->
        <div class="p1-quotes-card" id="p1-quotes-card">
          <p class="text-lyric p1-quote" id="p1-quote1" style="opacity: 0;"></p>
          <p class="text-lyric p1-quote" id="p1-quote2" style="margin-top: var(--space-sm); opacity: 0;"></p>
        </div>

        <!-- Aesthetic Cinematic Start Button -->
        <div class="action-wrapper p1-action-wrap" style="margin-top: clamp(1.8rem, 4vh, 2.8rem);">
          <button class="btn-cinematic p1-start-btn" id="p1-start-btn" aria-label="Mulai Perjalanan" style="opacity: 0;">
            <span class="p1-btn-spark">✦</span>
            <span class="p1-btn-label">${content.startButton}</span>
            <span class="p1-btn-spark">✦</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(el);
    this.element = el;
    this.startBtn = el.querySelector('#p1-start-btn');
    this.bindEvents();
    return this.element;
  }

  bindEvents() {
    if (!this.startBtn) return;

    this.handleStartClick = () => {
      // Remove breathing animation class
      this.startBtn.classList.remove('is-idle-breathing');

      // 1. Unlock Web Audio Context and initiate soft ambient soundtrack
      audioManager.unlockAudio();
      audioManager.playClick(1.0, 0.35);
      audioManager.play('AMBIENT_DUSK', 1600);

      // 2. Smoothly fade out button with subtle scale & blur
      gsap.to(this.startBtn, {
        opacity: 0,
        scale: 0.94,
        filter: 'blur(6px)',
        duration: 0.65,
        ease: 'power2.in',
        onComplete: () => {
          // 3. Transition into Phase 2 (Memories)
          sceneManager.goTo('phase2');
        },
      });
    };

    this.startBtn.addEventListener('click', this.handleStartClick);
  }

  /**
   * Enter lifecycle: executes sequential intro pacing & subtle butterfly foreshadowing
   */
  async enter() {
    transitionManager.changeSkyMood('sunset', 2.5);
    
    if (this.element) {
      gsap.killTweensOf(this.element);
      this.element.classList.add('active');
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      gsap.set(this.element, { opacity: 1, scale: 1, clearProps: 'filter' });
    }

    const content = STORY_CONTENT.phase1;
    const lantern = this.element.querySelector('#p1-lantern');
    const meta = this.element.querySelector('#p1-meta');
    const title = this.element.querySelector('#p1-title');
    const q1 = this.element.querySelector('#p1-quote1');
    const q2 = this.element.querySelector('#p1-quote2');
    const butterfly = this.element.querySelector('#p1-butterfly');

    // Reset all sub-elements for clean repeat playthrough
    if (lantern) gsap.set(lantern, { opacity: 0, y: -16, scale: 0.88, filter: 'blur(8px)' });
    if (meta) gsap.set(meta, { opacity: 0, y: 10, filter: 'blur(6px)' });
    if (title) gsap.set(title, { opacity: 0, y: 16, filter: 'blur(12px)' });
    if (q1) {
      q1.textContent = '';
      gsap.set(q1, { opacity: 0, y: 0, filter: 'none' });
    }
    if (q2) {
      q2.textContent = '';
      gsap.set(q2, { opacity: 0, y: 0, filter: 'none' });
    }
    if (this.startBtn) {
      this.startBtn.classList.remove('is-idle-breathing');
      gsap.set(this.startBtn, { opacity: 0, scale: 0.94, filter: 'blur(6px)', clearProps: 'transform' });
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      gsap.set([lantern, meta, title, q1, q2, this.startBtn], { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' });
      if (q1) q1.textContent = `"${content.quote1}"`;
      if (q2) q2.textContent = `"${content.quote2}"`;
      if (this.startBtn) {
        this.startBtn.classList.add('is-idle-breathing');
      }
      return;
    }

    // Intro Cinematic Sequence
    this.introTimeline = gsap.timeline({
      delay: 0.35,
    });

    this.introTimeline
      // Step 1: Lantern Ember Emergence
      .fromTo(
        lantern,
        { opacity: 0, y: -18, scale: 0.85, filter: 'blur(8px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.8, ease: 'power2.out' }
      )
      // Step 2: Label / Meta Badge ("Ruang Hening")
      .fromTo(
        meta,
        { opacity: 0, y: 10, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4, ease: 'power2.out' },
        '-=0.8'
      )
      // Step 3: Main Grand Title ("Lentera yang Masih Menyala")
      .fromTo(
        title,
        { opacity: 0, y: 18, filter: 'blur(12px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 2.0, ease: 'power2.out' },
        '-=0.6'
      );

    await new Promise(resolve => this.introTimeline.eventCallback('onComplete', resolve));

    // Step 4: Typewriter effect for Quotes (Line 1 types -> stays visible -> Line 2 types)
    if (q1 && content.quote1) {
      await Typewriter.type(q1, content.quote1, { speed: 34, quotes: true });
      await new Promise(r => setTimeout(r, 450));
    }
    if (q2 && content.quote2) {
      await Typewriter.type(q2, content.quote2, { speed: 34, quotes: true });
      await new Promise(r => setTimeout(r, 600));
    }

    // Step 5: Reveal Start Button
    if (this.startBtn) {
      gsap.fromTo(
        this.startBtn,
        { opacity: 0, scale: 0.92, y: 12, filter: 'blur(6px)' },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.4,
          ease: 'power2.out',
          onComplete: () => {
            if (this.startBtn) {
              this.startBtn.classList.add('is-idle-breathing');
            }
          },
        }
      );
    }

    // Subtle Distant Butterfly Silhouette Foreshadowing (Non-interactive)
    if (butterfly) {
      this.butterflyTimeline = gsap.timeline({ delay: 2.8 });
      this.butterflyTimeline
        .set(butterfly, {
          x: -60,
          y: 0,
          opacity: 0,
          scale: 0.7,
        })
        .to(butterfly, {
          opacity: 0.22,
          duration: 3.0,
          ease: 'power1.in',
        }, 0)
        .to(butterfly, {
          x: () => window.innerWidth + 120,
          y: -40,
          duration: 16.0,
          ease: 'sine.inOut',
        }, 0)
        .to(butterfly, {
          opacity: 0,
          duration: 3.5,
          ease: 'power1.out',
        }, '-=3.5');
    }

    return this.introTimeline;
  }

  /**
   * Exit lifecycle: Clean up active timelines & transitions
   */
  async exit() {
    if (this.introTimeline) {
      this.introTimeline.kill();
      this.introTimeline = null;
    }
    if (this.butterflyTimeline) {
      this.butterflyTimeline.kill();
      this.butterflyTimeline = null;
    }
    if (this.startBtn) {
      this.startBtn.classList.remove('is-idle-breathing');
    }

    return gsap.to(this.element, {
      opacity: 0,
      scale: 0.98,
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }

  /**
   * Unmount lifecycle: Complete teardown of DOM and event listeners
   */
  unmount() {
    if (this.startBtn && this.handleStartClick) {
      this.startBtn.removeEventListener('click', this.handleStartClick);
      this.startBtn.removeEventListener('touchend', this.handleStartClick);
    }
    if (this.introTimeline) {
      this.introTimeline.kill();
      this.introTimeline = null;
    }
    if (this.butterflyTimeline) {
      this.butterflyTimeline.kill();
      this.butterflyTimeline = null;
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

export const phase1Scene = new Phase1Scene();
export default phase1Scene;
