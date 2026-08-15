import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';

/**
 * Constellation Sub-Component (Phase 3 Moment 3)
 * Manages celestial sky constellation lines, companion stars,
 * permanently glowing focal star, and starlight illumination sequence.
 */
export class Constellation {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onActivated = options.onActivated || (() => {});

    this.isInteractive = false;
    this.isIlluminated = false;
    this.idleTimeout = null;
    this.idleInterval = null;
    this.activeTimelines = [];

    this.handleClick = null;
    this.handleKey = null;
  }

  mount() {
    this.bindEvents();
    this.disableInteraction();
  }

  bindEvents() {
    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (!starBtn) return;

    this.handleClick = () => {
      if (!this.isInteractive || this.isIlluminated) return;
      this.disableInteraction();
      this.activate();
    };

    this.handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && this.isInteractive && !this.isIlluminated) {
        this.disableInteraction();
        this.activate();
      }
    };

    starBtn.addEventListener('click', this.handleClick);
    starBtn.addEventListener('keydown', this.handleKey);
  }

  enableInteraction(idleDelay = 4800) {
    if (this.isIlluminated) return;
    this.isInteractive = true;
    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (starBtn) {
      starBtn.style.pointerEvents = 'auto';
      starBtn.style.cursor = 'pointer';
    }
    this.startIdleRipple(idleDelay);
  }

  disableInteraction() {
    this.isInteractive = false;
    this.stopIdleRipple();
    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (starBtn) {
      starBtn.style.pointerEvents = 'none';
      starBtn.style.cursor = 'default';
    }
  }

  triggerWaterRipple(targetElement, colorType = 'gold') {
    if (!targetElement || !targetElement.parentNode) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'idle-ripple-wrapper';

    const ripple1 = document.createElement('div');
    ripple1.className = `idle-water-ripple ${colorType === 'blue' ? 'ripple-blue' : ''}`;

    const ripple2 = document.createElement('div');
    ripple2.className = `idle-water-ripple ${colorType === 'blue' ? 'ripple-blue' : ''}`;

    wrapper.appendChild(ripple1);
    wrapper.appendChild(ripple2);
    targetElement.appendChild(wrapper);

    const tl = gsap.timeline({
      onComplete: () => {
        if (wrapper.parentNode) {
          wrapper.parentNode.removeChild(wrapper);
        }
      },
    });

    tl.fromTo(
      ripple1,
      { scale: 0.7, opacity: 0.85 },
      { scale: 2.2, opacity: 0, duration: 1.4, ease: 'power1.out' },
      0
    ).fromTo(
      ripple2,
      { scale: 0.5, opacity: 0.7 },
      { scale: 2.6, opacity: 0, duration: 1.5, ease: 'power1.out' },
      0.35
    );
  }

  startIdleRipple(idleDelay = 4800) {
    this.stopIdleRipple();
    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (!starBtn) return;

    this.idleTimeout = setTimeout(() => {
      if (this.isInteractive && !this.isIlluminated) {
        this.triggerWaterRipple(starBtn, 'gold');

        this.idleInterval = setInterval(() => {
          if (!this.isInteractive || this.isIlluminated) {
            this.stopIdleRipple();
            return;
          }
          this.triggerWaterRipple(starBtn, 'gold');
        }, idleDelay);
      }
    }, idleDelay);
  }

  stopIdleRipple() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (starBtn) {
      const ripples = starBtn.querySelectorAll('.idle-ripple-wrapper');
      ripples.forEach(r => r.remove());
    }
  }

  async activate() {
    this.isIlluminated = true;
    this.disableInteraction();

    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    const lines = this.container ? this.container.querySelectorAll('.p3-constellation-line') : [];
    const companionStars = this.container ? this.container.querySelectorAll('.p3-companion-star') : [];

    audioManager.playChime('sparkle', 0.38);
    audioManager.playStardustSprinkle(0.2);

    // Constellation Illumination Sequence
    const starTl = gsap.timeline();
    this.activeTimelines.push(starTl);

    starTl
      .to(starBtn, { scale: 1.8, duration: 0.8, ease: 'power2.out' })
      .to(
        lines,
        {
          attr: { stroke: '#fff8e7', 'stroke-width': 1.6, 'stroke-dasharray': 'none' },
          opacity: 0.95,
          filter: 'drop-shadow(0 0 8px #f2cb86)',
          stagger: 0.14,
          duration: 1.2,
          ease: 'power2.out',
        },
        0.1
      )
      .to(
        companionStars,
        {
          scale: 1.6,
          opacity: 1.0,
          stagger: 0.12,
          duration: 1.2,
          ease: 'back.out(2)',
        },
        0.15
      );

    this.onActivated();
  }

  destroy() {
    this.disableInteraction();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const starBtn = this.container ? this.container.querySelector('#p3-focal-star') : null;
    if (starBtn && this.handleClick) {
      starBtn.removeEventListener('click', this.handleClick);
      starBtn.removeEventListener('keydown', this.handleKey);
    }
  }
}

export default Constellation;
