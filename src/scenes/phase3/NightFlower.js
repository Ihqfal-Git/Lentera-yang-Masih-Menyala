import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';

/**
 * NightFlower Sub-Component (Phase 3 Moment 2)
 * Manages closed botanical bud state, idle water ripple cues,
 * and radiant moonflower blossom animation.
 */
export class NightFlower {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onActivated = options.onActivated || (() => {});

    this.isInteractive = false;
    this.isBloomed = false;
    this.idleTimeout = null;
    this.idleInterval = null;
    this.activeTimelines = [];

    this.handleClick = null;
    this.handleKey = null;
  }

  mount() {
    this.setupInitialBudState();
    this.bindEvents();
    this.disableInteraction();
  }

  setupInitialBudState() {
    if (!this.container) return;
    const outerPetals = this.container.querySelectorAll('.np-outer');
    const innerPetals = this.container.querySelectorAll('.np-inner');
    const core = this.container.querySelector('#p3-nflower-core');
    const sepals = this.container.querySelectorAll('.np-sepal');

    gsap.set(outerPetals, { svgOrigin: '50 60' });
    gsap.set(innerPetals, { svgOrigin: '50 60' });
    gsap.set(sepals, { svgOrigin: '50 60' });

    // Fold petals snugly into a slender, aesthetic closed bud
    gsap.set('#np-o1', { scaleX: 0.32, scaleY: 0.88, rotation: -12, opacity: 0.85 });
    gsap.set('#np-o2', { scaleX: 0.34, scaleY: 0.92, rotation: -5, opacity: 0.9 });
    gsap.set('#np-o3', { scaleX: 0.35, scaleY: 0.95, rotation: 0, opacity: 0.95 });
    gsap.set('#np-o4', { scaleX: 0.34, scaleY: 0.92, rotation: 5, opacity: 0.9 });
    gsap.set('#np-o5', { scaleX: 0.32, scaleY: 0.88, rotation: 12, opacity: 0.85 });

    gsap.set(innerPetals, { scale: 0.25, opacity: 0 });
    gsap.set(core, { scale: 0.5, opacity: 0.35 });
    gsap.set('#p3-sepal-left', { rotation: -6 });
    gsap.set('#p3-sepal-right', { rotation: 6 });
  }

  bindEvents() {
    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (!flowerBtn) return;

    this.handleClick = () => {
      if (!this.isInteractive || this.isBloomed) return;
      this.disableInteraction();
      this.activate();
    };

    this.handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && this.isInteractive && !this.isBloomed) {
        this.disableInteraction();
        this.activate();
      }
    };

    flowerBtn.addEventListener('click', this.handleClick);
    flowerBtn.addEventListener('keydown', this.handleKey);
  }

  enableInteraction(idleDelay = 4800) {
    if (this.isBloomed) return;
    this.isInteractive = true;
    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (flowerBtn) {
      flowerBtn.style.pointerEvents = 'auto';
      flowerBtn.style.cursor = 'pointer';
    }
    this.startIdleRipple(idleDelay);
  }

  disableInteraction() {
    this.isInteractive = false;
    this.stopIdleRipple();
    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (flowerBtn) {
      flowerBtn.style.pointerEvents = 'none';
      flowerBtn.style.cursor = 'default';
    }
  }

  triggerWaterRipple(targetElement, colorType = 'blue') {
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
    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (!flowerBtn) return;

    this.idleTimeout = setTimeout(() => {
      if (this.isInteractive && !this.isBloomed) {
        this.triggerWaterRipple(flowerBtn, 'blue');

        this.idleInterval = setInterval(() => {
          if (!this.isInteractive || this.isBloomed) {
            this.stopIdleRipple();
            return;
          }
          this.triggerWaterRipple(flowerBtn, 'blue');
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
    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (flowerBtn) {
      const ripples = flowerBtn.querySelectorAll('.idle-ripple-wrapper');
      ripples.forEach(r => r.remove());
    }
  }

  async activate() {
    this.isBloomed = true;
    this.disableInteraction();

    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    const core = this.container ? this.container.querySelector('#p3-nflower-core') : null;
    const glow = this.container ? this.container.querySelector('#p3-nflower-glow') : null;

    audioManager.playFlowerBloom(0.35);

    // Organic Unfurl & Blossoming Timeline
    const bloomTl = gsap.timeline();
    this.activeTimelines.push(bloomTl);

    bloomTl
      .to('#np-o1', { scaleX: 1.0, scaleY: 1.0, rotation: -60, opacity: 0.95, duration: 1.8, ease: 'elastic.out(1.15, 0.45)' }, 0)
      .to('#np-o2', { scaleX: 1.0, scaleY: 1.0, rotation: -30, opacity: 0.95, duration: 1.8, ease: 'elastic.out(1.15, 0.45)' }, 0.06)
      .to('#np-o3', { scaleX: 1.0, scaleY: 1.0, rotation: 0, opacity: 1.0, duration: 1.8, ease: 'elastic.out(1.15, 0.45)' }, 0.12)
      .to('#np-o4', { scaleX: 1.0, scaleY: 1.0, rotation: 30, opacity: 0.95, duration: 1.8, ease: 'elastic.out(1.15, 0.45)' }, 0.06)
      .to('#np-o5', { scaleX: 1.0, scaleY: 1.0, rotation: 60, opacity: 0.95, duration: 1.8, ease: 'elastic.out(1.15, 0.45)' }, 0)

      .to('#np-i1', { scale: 1.0, rotation: -22, opacity: 0.95, duration: 1.6, ease: 'elastic.out(1.1, 0.5)' }, 0.2)
      .to('#np-i2', { scale: 1.0, rotation: 0, opacity: 0.98, duration: 1.6, ease: 'elastic.out(1.1, 0.5)' }, 0.25)
      .to('#np-i3', { scale: 1.0, rotation: 22, opacity: 0.95, duration: 1.6, ease: 'elastic.out(1.1, 0.5)' }, 0.2)

      .to('#p3-sepal-left', { rotation: -32, duration: 1.4, ease: 'power2.out' }, 0)
      .to('#p3-sepal-right', { rotation: 32, duration: 1.4, ease: 'power2.out' }, 0)

      .to(core, { scale: 1.6, opacity: 1, duration: 1.2, ease: 'back.out(2)' }, 0.2)
      .to(glow, { scale: 1.4, opacity: 1, duration: 1.4, ease: 'power2.out' }, 0.2);

    this.onActivated();
  }

  destroy() {
    this.disableInteraction();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const flowerBtn = this.container ? this.container.querySelector('#p3-night-flower') : null;
    if (flowerBtn && this.handleClick) {
      flowerBtn.removeEventListener('click', this.handleClick);
      flowerBtn.removeEventListener('keydown', this.handleKey);
    }
  }
}

export default NightFlower;
