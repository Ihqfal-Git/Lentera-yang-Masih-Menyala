import gsap from 'gsap';
import { audioManager } from '../audio/audioManager.js';

/**
 * Butterfly Component
 * Interactive & narrative guide SVG actor with dynamic wing-flapping,
 * broad ethereal wings, stardust glitter flight trail,
 * curved organic flight paths, resting states, horizon exit,
 * and interactive tap/touch flutter reaction when resting.
 */
export class Butterfly {
  constructor(options = {}) {
    this.container = options.container || document.getElementById('globalActors') || document.body;
    this.element = null;
    this.wingLeft = null;
    this.wingRight = null;
    this.flapTimeline = null;
    this.flightTimeline = null;
    this.glitterInterval = null;
    this.glitterParticles = [];
    this.isResting = false;
    this.isFluttering = false;
  }

  render() {
    if (this.element) return this.element;

    const wrapper = document.createElement('div');
    wrapper.className = 'actor-butterfly';
    wrapper.setAttribute('role', 'button');
    wrapper.setAttribute('aria-label', 'Kupu-kupu Pembimbing');
    wrapper.setAttribute('tabindex', '0');
    wrapper.style.cssText = `
      position: absolute;
      width: 72px;
      height: 72px;
      padding: 5px;
      pointer-events: none;
      z-index: 35;
      opacity: 0;
      transform: translate(-50%, -50%);
      will-change: transform, left, top, opacity;
      touch-action: manipulation;
      user-select: none;
    `;

    wrapper.innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%" class="butterfly-svg" style="overflow: visible;">
        <defs>
          <linearGradient id="bf-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.98"/>
            <stop offset="35%" stop-color="#fff2d6" stop-opacity="0.96"/>
            <stop offset="70%" stop-color="#f2cb86" stop-opacity="0.92"/>
            <stop offset="100%" stop-color="#e89d58" stop-opacity="0.88"/>
          </linearGradient>

          <linearGradient id="bf-grad-peach" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fff6ee" stop-opacity="0.96"/>
            <stop offset="50%" stop-color="#f7a988" stop-opacity="0.92"/>
            <stop offset="100%" stop-color="#cf6f83" stop-opacity="0.88"/>
          </linearGradient>

          <radialGradient id="bf-cell-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff" stop-opacity="0.8"/>
            <stop offset="50%" stop-color="#fde1a9" stop-opacity="0.4"/>
            <stop offset="100%" stop-color="#f2cb86" stop-opacity="0"/>
          </radialGradient>

          <linearGradient id="bf-grad-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="55%" stop-color="#fde5b4"/>
            <stop offset="100%" stop-color="#d99252"/>
          </linearGradient>

          <!-- Ambient glow: STATIC, not attached to the wing groups -->
          <radialGradient id="bf-ambient-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#f2cb86" stop-opacity="0.55"/>
            <stop offset="60%" stop-color="#f7a988" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="#f7a988" stop-opacity="0"/>
          </radialGradient>
        </defs>

        <!-- Static ambient glow layer, centered on the body -->
        <circle cx="50" cy="50" r="46" fill="url(#bf-ambient-glow)"/>

        <!-- Left Wing Assembly -->
        <g id="bf-wing-left">
          <path d="M50 50 C20 8, 0 22, 6 52 C10 68, 30 70, 50 54 Z" fill="url(#bf-grad-gold)"/>
          <ellipse cx="26" cy="38" rx="11" ry="15" transform="rotate(-26 26 38)" fill="url(#bf-cell-glow)"/>
          <path d="M50 50 Q30 32 16 35" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.7"/>
          <path d="M50 50 Q28 44 12 50" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M50 50 Q34 25 25 18" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.55"/>

          <path d="M50 54 C30 65, 16 78, 24 90 C35 98, 48 83, 50 58 Z" fill="url(#bf-grad-peach)"/>
          <path d="M50 54 Q35 73 28 85" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.65"/>
          <circle cx="19" cy="74" r="1.3" fill="#ffffff" opacity="0.95"/>
          <circle cx="22" cy="84" r="1.4" fill="#ffffff" opacity="1"/>
          <circle cx="30" cy="91" r="1.3" fill="#ffffff" opacity="0.95"/>
        </g>

        <!-- Right Wing Assembly -->
        <g id="bf-wing-right">
          <path d="M50 50 C80 8, 100 22, 94 52 C90 68, 70 70, 50 54 Z" fill="url(#bf-grad-gold)"/>
          <ellipse cx="74" cy="38" rx="11" ry="15" transform="rotate(26 74 38)" fill="url(#bf-cell-glow)"/>
          <path d="M50 50 Q70 32 84 35" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.7"/>
          <path d="M50 50 Q72 44 88 50" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.65"/>
          <path d="M50 50 Q66 25 75 18" stroke="#ffffff" stroke-width="0.7" stroke-linecap="round" fill="none" opacity="0.55"/>

          <path d="M50 54 C70 65, 84 78, 76 90 C65 98, 52 83, 50 58 Z" fill="url(#bf-grad-peach)"/>
          <path d="M50 54 Q65 73 72 85" stroke="#ffffff" stroke-width="0.8" stroke-linecap="round" fill="none" opacity="0.65"/>
          <circle cx="81" cy="74" r="1.3" fill="#ffffff" opacity="0.95"/>
          <circle cx="78" cy="84" r="1.4" fill="#ffffff" opacity="1"/>
          <circle cx="70" cy="91" r="1.3" fill="#ffffff" opacity="0.95"/>
        </g>

        <!-- Body, Thorax & Antennae -->
        <ellipse cx="50" cy="46" rx="2.4" ry="7" fill="#ffffff"/>
        <path d="M48.5 53 Q50 69 50 72 Q50 69 51.5 53 Z" fill="url(#bf-grad-body)" opacity="0.95"/>
        <circle cx="50" cy="37.5" r="2.2" fill="#ffffff"/>

        <path d="M49.2 36 Q41 22 33 20" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.9"/>
        <circle cx="33" cy="20" r="1.6" fill="#ffffff"/>

        <path d="M50.8 36 Q59 22 67 20" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" fill="none" opacity="0.9"/>
        <circle cx="67" cy="20" r="1.6" fill="#ffffff"/>
      </svg>
    `;

    if (this.container) {
      this.container.appendChild(wrapper);
    }

    this.element = wrapper;
    this.wingLeft = wrapper.querySelector('#bf-wing-left');
    this.wingRight = wrapper.querySelector('#bf-wing-right');

    this.bindTapEvents();
    return this.element;
  }

  /**
   * Bind interactive tap/click listener so user can tap resting butterfly
   */
  bindTapEvents() {
    if (!this.element) return;

    this.handleTap = () => {
      if (this.isResting && !this.isFluttering) {
        this.onTapFlutter();
      }
    };

    this.handleKey = (e) => {
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') && this.isResting && !this.isFluttering) {
        this.onTapFlutter();
      }
    };

    this.element.addEventListener('click', this.handleTap);
    this.element.addEventListener('keydown', this.handleKey);
  }

  /**
   * Wing flap reaction when user taps the resting butterfly:
   * Flaps wings gently without sound or jumps, then returns to resting flap.
   */
  onTapFlutter() {
    if (this.isFluttering || !this.wingLeft || !this.wingRight || !this.element) return;
    this.isFluttering = true;

    if (this.flapTimeline) this.flapTimeline.kill();

    gsap.set([this.wingLeft, this.wingRight], {
      svgOrigin: '50 50',
    });

    const flutterTl = gsap.timeline({
      onComplete: () => {
        this.isFluttering = false;
        if (this.isResting) {
          this.setRestingFlap();
        }
      },
    });

    // Clean, natural wing flap (3 gentle flaps)
    flutterTl
      .to(
        this.wingLeft,
        { scaleX: 0.54, scaleY: 0.97, skewY: -4, duration: 0.1, repeat: 5, yoyo: true, ease: 'sine.inOut' },
        0
      )
      .to(
        this.wingRight,
        { scaleX: 0.54, scaleY: 0.97, skewY: 4, duration: 0.1, repeat: 5, yoyo: true, ease: 'sine.inOut' },
        0
      );
  }

  /**
   * Start wing flapping animation.
   * @param {number} speed - flap cycle duration
   */
  startFlapping(speed = 0.18) {
    if (!this.wingLeft || !this.wingRight) return;
    if (this.flapTimeline) this.flapTimeline.kill();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    gsap.set([this.wingLeft, this.wingRight], {
      svgOrigin: '50 50',
    });

    this.flapTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    this.flapTimeline
      .to(
        this.wingLeft,
        {
          scaleX: 0.58,
          scaleY: 0.97,
          skewY: -4,
          duration: speed,
          ease: 'sine.inOut',
        },
        0
      )
      .to(
        this.wingRight,
        {
          scaleX: 0.58,
          scaleY: 0.97,
          skewY: 4,
          duration: speed,
          ease: 'sine.inOut',
        },
        0
      );
  }

  startGlitterTrail() {
    if (this.glitterInterval) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const isMobile = window.innerWidth <= 768;
    const intervalMs = isMobile ? 80 : 60;

    this.glitterInterval = setInterval(() => {
      this.emitGlitter();
    }, intervalMs);
  }

  stopGlitterTrail() {
    if (this.glitterInterval) {
      clearInterval(this.glitterInterval);
      this.glitterInterval = null;
    }
  }

  emitGlitter() {
    if (!this.element || !this.element.parentNode || !this.container) return;

    // Limit max active particles in DOM to prevent GPU memory pressure
    if (this.glitterParticles.length >= 8) return;

    // Use fast offset values instead of forced layout recalculation
    const x = this.element.offsetLeft + (Math.random() - 0.5) * 14;
    const y = this.element.offsetTop + (Math.random() - 0.5) * 10;

    const particle = document.createElement('div');
    particle.className = 'butterfly-glitter-particle';

    const colors = ['#ffffff', '#fff8e7', '#f2cb86', '#ffd580', '#f7a988'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = 2.5 + Math.random() * 2.5;

    particle.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      box-shadow: 0 0 8px ${color};
      pointer-events: none;
      z-index: 34;
      opacity: 0.95;
      transform: translate(-50%, -50%) scale(1);
    `;

    this.container.appendChild(particle);
    this.glitterParticles.push(particle);

    const driftX = (Math.random() - 0.5) * 22;
    const driftY = 8 + Math.random() * 20;
    const duration = 0.75 + Math.random() * 0.45;

    gsap.to(particle, {
      x: `+=${driftX}`,
      y: `+=${driftY}`,
      scale: 0.2,
      opacity: 0,
      duration: duration,
      ease: 'power1.out',
      onComplete: () => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
        const idx = this.glitterParticles.indexOf(particle);
        if (idx !== -1) this.glitterParticles.splice(idx, 1);
      },
    });
  }

  /**
   * Slow, broad-winged resting flap.
   */
  setRestingFlap() {
    this.isResting = true;
    this.stopGlitterTrail();

    if (this.element) {
      this.element.classList.add('is-resting');
      this.element.style.pointerEvents = 'auto';
      this.element.style.cursor = 'pointer';
    }

    if (!this.wingLeft || !this.wingRight) return;
    if (this.flapTimeline) this.flapTimeline.kill();

    gsap.set([this.wingLeft, this.wingRight], {
      svgOrigin: '50 50',
    });

    this.flapTimeline = gsap.timeline({ repeat: -1, yoyo: true });
    this.flapTimeline
      .to(
        this.wingLeft,
        { scaleX: 0.85, scaleY: 0.99, skewY: -2, duration: 0.65, ease: 'sine.inOut' },
        0
      )
      .to(
        this.wingRight,
        { scaleX: 0.85, scaleY: 0.99, skewY: 2, duration: 0.65, ease: 'sine.inOut' },
        0
      );
  }

  setFastFlap() {
    this.isResting = false;
    if (this.element) {
      this.element.classList.remove('is-resting');
      this.element.style.pointerEvents = 'none';
    }
    this.startGlitterTrail();
    this.startFlapping(0.16);
  }

  emergeFrom(x, y) {
    this.render();

    return new Promise(resolve => {
      gsap.set(this.element, {
        left: x,
        top: y,
        scale: 0.2,
        opacity: 0,
        rotation: -8,
      });

      const emergeTl = gsap.timeline({
        onComplete: () => {
          this.setFastFlap();
          resolve();
        },
      });

      emergeTl
        .to(this.element, {
          y: -24,
          scale: 1,
          opacity: 1,
          duration: 1.6,
          ease: 'power2.out',
        })
        .add(() => {
          this.startFlapping(0.24);
          this.startGlitterTrail();
        }, 0.4)
        .to(this.element, {
          y: -32,
          duration: 0.8,
          ease: 'sine.inOut',
        });
    });
  }

  flyCurvedPath(waypoints) {
    this.setFastFlap();
    audioManager.playButterflyFlap(0.08);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return new Promise(resolve => {
      if (this.flightTimeline) this.flightTimeline.kill();
      this.flightTimeline = gsap.timeline({ onComplete: resolve });

      if (prefersReducedMotion && waypoints.length > 0) {
        const last = waypoints[waypoints.length - 1];
        this.flightTimeline.to(this.element, {
          left: last.x,
          top: last.y,
          duration: 1.5,
          ease: 'power1.inOut',
        });
        return;
      }

      waypoints.forEach((wp, idx) => {
        if (idx % 2 === 1) {
          audioManager.playStardustSprinkle(0.10);
        }
        this.flightTimeline.to(this.element, {
          left: wp.x,
          top: wp.y,
          rotation: wp.rotation !== undefined ? wp.rotation : '+=15',
          duration: wp.duration || 2.4,
          ease: 'sine.inOut',
        });
      });
    });
  }

  /**
   * Fly directly to user click coordinates or dynamic screen point
   * @param {string|number} x
   * @param {string|number} y
   * @param {number} duration
   */
  flyToTarget(x, y, duration = 1.2) {
    if (!this.element) return Promise.resolve();
    this.setFastFlap();
    audioManager.playButterflyFlap(0.12);
    audioManager.playStardustSprinkle(0.15);

    return new Promise(resolve => {
      if (this.flightTimeline) this.flightTimeline.kill();

      const currentRect = this.element.getBoundingClientRect();
      const targetNumX = typeof x === 'number' ? x : parseFloat(x);
      const angle = targetNumX > currentRect.left ? 18 : -18;

      this.flightTimeline = gsap.timeline({
        onComplete: () => {
          this.setRestingFlap();
          resolve();
        },
      });

      this.flightTimeline.to(this.element, {
        left: x,
        top: y,
        rotation: angle,
        duration: duration,
        ease: 'power2.out',
      });
    });
  }

  restAt(x, y) {
    this.setRestingFlap();
    return new Promise(resolve => {
      gsap.to(this.element, {
        left: x,
        top: y,
        rotation: 5,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          // Continuous gentle resting float in place
          gsap.to(this.element, {
            y: '-=6',
            duration: 1.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
          });
          resolve();
        },
      });
    });
  }

  flyAway(targetX = '85%', targetY = '-20%', duration = 3.2) {
    this.setFastFlap();
    return new Promise(resolve => {
      gsap.to(this.element, {
        left: targetX,
        top: targetY,
        scale: 0.45,
        opacity: 0,
        duration,
        ease: 'power1.in',
        onComplete: () => {
          this.destroy();
          resolve();
        },
      });
    });
  }

  destroy() {
    this.stopGlitterTrail();

    if (this.element && this.handleTap) {
      this.element.removeEventListener('click', this.handleTap);
      this.element.removeEventListener('keydown', this.handleKey);
    }

    if (this.flapTimeline) {
      this.flapTimeline.kill();
      this.flapTimeline = null;
    }
    if (this.flightTimeline) {
      this.flightTimeline.kill();
      this.flightTimeline = null;
    }

    this.glitterParticles.forEach(p => {
      if (p && p.parentNode) {
        p.parentNode.removeChild(p);
      }
    });
    this.glitterParticles = [];

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

export default Butterfly;