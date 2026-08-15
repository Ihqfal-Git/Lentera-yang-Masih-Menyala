import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';
import { STORY_CONTENT } from '../../data/storyContent.js';

/**
 * FloatingEnvelope Sub-Component (Phase 3 Final Moment)
 * Manages the descending floating envelope with pulsating backlight halo,
 * gentle gravity sway, and touch interaction to transition to Phase 4.
 */
export class FloatingEnvelope {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onActivated = options.onActivated || (() => {});

    this.isInteractive = false;
    this.isActivated = false;
    this.activeTimelines = [];

    this.handleClick = null;
    this.handleKey = null;
  }

  mount() {
    this.bindEvents();
    this.disableInteraction();
  }

  bindEvents() {
    const envBtn = this.container ? this.container.querySelector('#p3-envelope-btn') : null;
    if (!envBtn) return;

    this.handleClick = () => {
      if (!this.isInteractive || this.isActivated) return;
      this.disableInteraction();
      this.activate();
    };

    this.handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && this.isInteractive && !this.isActivated) {
        this.disableInteraction();
        this.activate();
      }
    };

    envBtn.addEventListener('click', this.handleClick);
    envBtn.addEventListener('keydown', this.handleKey);
  }

  enableInteraction() {
    if (this.isActivated) return;
    this.isInteractive = true;
    const envBtn = this.container ? this.container.querySelector('#p3-envelope-btn') : null;
    if (envBtn) {
      envBtn.style.pointerEvents = 'auto';
      envBtn.style.cursor = 'pointer';
    }
  }

  disableInteraction() {
    this.isInteractive = false;
    const envBtn = this.container ? this.container.querySelector('#p3-envelope-btn') : null;
    if (envBtn) {
      envBtn.style.pointerEvents = 'none';
      envBtn.style.cursor = 'default';
    }
  }

  async reveal() {
    const envelopeStage = this.container;
    const envelopeCard = this.container ? this.container.querySelector('#p3-envelope-card') : null;
    const envelopePrompt = this.container ? this.container.querySelector('#p3-envelope-prompt') : null;

    if (!envelopeStage || !envelopeCard) return;

    if (envelopePrompt) {
      envelopePrompt.textContent = STORY_CONTENT.phase3.envelopePrompt;
    }

    envelopeStage.style.visibility = 'visible';
    envelopeStage.style.opacity = '1';

    const envTl = gsap.timeline();
    this.activeTimelines.push(envTl);

    envTl.fromTo(
      envelopeCard,
      { opacity: 0, y: -70, rotation: -6, scale: 0.88, filter: 'blur(10px)' },
      { opacity: 1, y: 0, rotation: 0, scale: 1.0, filter: 'blur(0px)', duration: 2.2, ease: 'power2.out' }
    );

    if (envelopePrompt) {
      envTl.fromTo(
        envelopePrompt,
        { opacity: 0, y: 10, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' },
        '-=0.6'
      );
    }
  }

  async activate() {
    this.isActivated = true;
    this.disableInteraction();

    const envelopeCard = this.container ? this.container.querySelector('#p3-envelope-card') : null;

    audioManager.playClick(1.05, 0.3);

    // Warm focal pulse on envelope
    if (envelopeCard) {
      gsap.to(envelopeCard, {
        scale: 1.06,
        boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(242,203,134,0.6)',
        duration: 0.8,
        ease: 'power2.out',
      });
    }

    this.onActivated();
  }

  destroy() {
    this.disableInteraction();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const envBtn = this.container ? this.container.querySelector('#p3-envelope-btn') : null;
    if (envBtn && this.handleClick) {
      envBtn.removeEventListener('click', this.handleClick);
      envBtn.removeEventListener('keydown', this.handleKey);
    }
  }
}

export default FloatingEnvelope;
