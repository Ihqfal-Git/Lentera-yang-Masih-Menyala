import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';

/**
 * BloomingFlower Sub-Component (Phase 2)
 * Manages the interactive blooming flower, idle water ripple cues (4.8s delay),
 * layered botanical blossoming animation, and celestial pollen radiance.
 */
export class BloomingFlower {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onActivated = options.onActivated || (() => {});
    
    this.isTriggered = false;
    this.idleTimeout = null;
    this.idleInterval = null;
    this.activeTimelines = [];

    this.handleClick = null;
    this.handleKeydown = null;
  }

  mount() {
    this.bindEvents();
  }

  bindEvents() {
    const flowerBtn = this.container ? this.container.querySelector('#p2-flower-btn') : null;
    if (!flowerBtn) return;

    this.handleClick = () => {
      if (this.isTriggered) return;
      this.activate();
    };

    this.handleKeydown = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && !this.isTriggered) {
        this.activate();
      }
    };

    flowerBtn.addEventListener('click', this.handleClick);
    flowerBtn.addEventListener('keydown', this.handleKeydown);
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

  startIdleTimer(idleDelay = 4800) {
    this.stopIdleTimer();
    const flowerBtn = this.container ? this.container.querySelector('#p2-flower-btn') : null;
    if (!flowerBtn) return;

    this.idleTimeout = setTimeout(() => {
      if (!this.isTriggered) {
        this.triggerWaterRipple(flowerBtn, 'gold');

        this.idleInterval = setInterval(() => {
          if (this.isTriggered) {
            this.stopIdleTimer();
            return;
          }
          this.triggerWaterRipple(flowerBtn, 'gold');
        }, idleDelay);
      }
    }, idleDelay);
  }

  stopIdleTimer() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
    const flowerBtn = this.container ? this.container.querySelector('#p2-flower-btn') : null;
    if (flowerBtn) {
      const ripples = flowerBtn.querySelectorAll('.idle-ripple-wrapper');
      ripples.forEach(r => r.remove());
    }
  }

  async activate() {
    this.isTriggered = true;
    this.stopIdleTimer();

    const flowerBtn = this.container ? this.container.querySelector('#p2-flower-btn') : null;
    const flowerSvg = this.container ? this.container.querySelector('#p2-flower-svg') : null;
    const radiance = this.container ? this.container.querySelector('#p2-flower-radiance') : null;

    if (flowerBtn) {
      flowerBtn.style.pointerEvents = 'none';
    }

    // Play blossom audio SFX
    audioManager.playFlowerBloom(0.42);

    const outerPetals = this.container.querySelectorAll('.petal-outer');
    const midPetals = this.container.querySelectorAll('.petal-mid');
    const innerPetals = this.container.querySelectorAll('.petal-inner');
    const sparkles = this.container.querySelectorAll('.flower-sparkle');
    const stamenCore = this.container.querySelector('#flower-stamen-core');

    const bloomTl = gsap.timeline();
    this.activeTimelines.push(bloomTl);

    // Multi-stage organic botanical blossoming
    bloomTl
      .to(flowerBtn, { scale: 1.08, duration: 0.8, ease: 'power2.out' }, 0)
      .to(radiance, { opacity: 0.95, scale: 1.6, duration: 2.2, ease: 'power2.out' }, 0.1)
      .to(
        outerPetals,
        { scale: 1.35, opacity: 1, duration: 2.2, stagger: 0.08, ease: 'elastic.out(1.15, 0.45)' },
        0.15
      )
      .to(
        midPetals,
        { scale: 1.3, opacity: 1, duration: 2.0, stagger: 0.08, ease: 'elastic.out(1.2, 0.5)' },
        0.35
      )
      .to(
        innerPetals,
        { scale: 1.25, opacity: 1, duration: 1.8, stagger: 0.06, ease: 'elastic.out(1.25, 0.55)' },
        0.55
      )
      .to(
        stamenCore,
        { scale: 1.4, duration: 1.4, ease: 'back.out(2)' },
        0.7
      )
      .to(
        sparkles,
        {
          opacity: 0.95,
          scale: 1.6,
          y: (i) => -18 - i * 8,
          x: (i) => (i % 2 === 0 ? -12 - i * 3 : 12 + i * 3),
          duration: 2.0,
          stagger: 0.12,
          ease: 'power1.out',
        },
        0.6
      )
      .to(
        flowerSvg,
        { filter: 'drop-shadow(0 0 45px rgba(242, 203, 134, 0.95)) drop-shadow(0 0 90px rgba(247, 169, 136, 0.65))', duration: 2.0 },
        0.4
      );

    await new Promise(r => setTimeout(r, 1400));
    this.onActivated();
  }

  destroy() {
    this.stopIdleTimer();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const flowerBtn = this.container ? this.container.querySelector('#p2-flower-btn') : null;
    if (flowerBtn && this.handleClick) {
      flowerBtn.removeEventListener('click', this.handleClick);
      flowerBtn.removeEventListener('keydown', this.handleKeydown);
    }
  }
}

export default BloomingFlower;
