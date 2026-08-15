import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';

/**
 * FirefliesCluster Sub-Component (Phase 3 Moment 1)
 * Manages focal interactive firefly, companion nodes, independent organic
 * floating and asynchronous twinkling, water ripples, and ignition cascade.
 */
export class FirefliesCluster {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onActivated = options.onActivated || (() => {});

    this.isInteractive = false;
    this.isIgnited = false;
    this.idleTimeout = null;
    this.idleInterval = null;
    this.activeTimelines = [];

    this.handleClick = null;
    this.handleKey = null;
  }

  mount() {
    this.initFloatingAndTwinkling();
    this.bindEvents();
    this.disableInteraction();
  }

  initFloatingAndTwinkling() {
    if (!this.container) return;
    const nodes = this.container.querySelectorAll('.firefly-node');

    nodes.forEach((node) => {
      // 1. Independent vertical & horizontal float drift
      const driftX = gsap.utils.random(-10, 10);
      const driftY = gsap.utils.random(-14, 14);
      const driftDur = gsap.utils.random(2.4, 4.4);
      const delay = gsap.utils.random(0, 1.8);

      const driftTl = gsap.to(node, {
        x: `+=${driftX}`,
        y: `+=${driftY}`,
        duration: driftDur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: delay,
      });
      this.activeTimelines.push(driftTl);

      // 2. Independent asynchronous blinking / twinkling
      const dotEl = node.querySelector('.firefly-dot') || node.querySelector('.focal-core');
      if (dotEl) {
        const blinkDur = gsap.utils.random(0.9, 2.2);
        const minScale = gsap.utils.random(0.75, 0.9);
        const maxScale = gsap.utils.random(1.2, 1.45);
        const minOpacity = gsap.utils.random(0.35, 0.6);
        const maxOpacity = gsap.utils.random(0.85, 1.0);

        const blinkTl = gsap.to(dotEl, {
          scale: maxScale,
          opacity: maxOpacity,
          duration: blinkDur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: gsap.utils.random(0, 1.5),
        });
        this.activeTimelines.push(blinkTl);
      }
    });
  }

  bindEvents() {
    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (!focalBtn) return;

    this.handleClick = () => {
      if (!this.isInteractive || this.isIgnited) return;
      this.disableInteraction();
      this.activate();
    };

    this.handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && this.isInteractive && !this.isIgnited) {
        this.disableInteraction();
        this.activate();
      }
    };

    focalBtn.addEventListener('click', this.handleClick);
    focalBtn.addEventListener('keydown', this.handleKey);
  }

  enableInteraction(idleDelay = 4800) {
    if (this.isIgnited) return;
    this.isInteractive = true;
    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (focalBtn) {
      focalBtn.style.pointerEvents = 'auto';
      focalBtn.style.cursor = 'pointer';
    }
    this.startIdleRipple(idleDelay);
  }

  disableInteraction() {
    this.isInteractive = false;
    this.stopIdleRipple();
    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (focalBtn) {
      focalBtn.style.pointerEvents = 'none';
      focalBtn.style.cursor = 'default';
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
    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (!focalBtn) return;

    this.idleTimeout = setTimeout(() => {
      if (this.isInteractive && !this.isIgnited) {
        this.triggerWaterRipple(focalBtn, 'gold');

        this.idleInterval = setInterval(() => {
          if (!this.isInteractive || this.isIgnited) {
            this.stopIdleRipple();
            return;
          }
          this.triggerWaterRipple(focalBtn, 'gold');
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
    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (focalBtn) {
      const ripples = focalBtn.querySelectorAll('.idle-ripple-wrapper');
      ripples.forEach(r => r.remove());
    }
  }

  async activate() {
    this.isIgnited = true;
    this.disableInteraction();

    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    const companions = this.container ? this.container.querySelectorAll('.companion-ff') : [];

    audioManager.playChime('sparkle', 0.28);

    // Chain reaction ignition across fireflies
    const igniteTl = gsap.timeline();
    this.activeTimelines.push(igniteTl);

    igniteTl.to(focalBtn, { scale: 1.6, duration: 0.6, ease: 'power2.out' });

    companions.forEach((ff, i) => {
      igniteTl.to(
        ff,
        {
          opacity: 1,
          scale: 1.5,
          duration: 0.8,
          ease: 'power1.out',
          onStart: () => ff.classList.add('is-ignited'),
        },
        0.15 + i * 0.12
      );
    });

    this.onActivated();
  }

  destroy() {
    this.disableInteraction();
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const focalBtn = this.container ? this.container.querySelector('#p3-focal-firefly') : null;
    if (focalBtn && this.handleClick) {
      focalBtn.removeEventListener('click', this.handleClick);
      focalBtn.removeEventListener('keydown', this.handleKey);
    }
  }
}

export default FirefliesCluster;
