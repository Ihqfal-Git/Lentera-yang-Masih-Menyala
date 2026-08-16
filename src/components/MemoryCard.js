import gsap from 'gsap';
import { audioManager } from '../audio/audioManager.js';

/**
 * MemoryCard Component
 * Displays partner memory photo with:
 * 1. Initial atmospheric blur state & hidden caption
 * 2. Pure ambient water ripple indicator (inviting touch like Phase 3)
 * 3. Tap anywhere on photo to trigger dynamic water ripple wave & unblur transition
 * 4. 3D depth deck-shuffling physics on swipe/click navigation
 * 5. Persistent clarification state across next/prev navigation
 */
export class MemoryCard {
  constructor(options = {}) {
    this.container = options.container || null;
    this.element = null;
    this.index = options.index || 0;
    this.imageSrc = options.imageSrc || '/assets/memories/photo-01.webp';
    this.caption = options.caption || '';
    this.captionSecondary = options.captionSecondary || null;
    this.aspectRatio = options.aspectRatio || '4 / 5';
    this.onClarified = options.onClarified || (() => {});

    // State
    this.isClarified = false;
    this.timeline = null;
    this.handleClarifyClick = null;
  }

  render() {
    if (this.element) return this.element;

    const wrapper = document.createElement('article');
    wrapper.className = `memory-fragment card-idx-${this.index}`;
    wrapper.setAttribute('aria-label', `Fragmen Ingatan ${this.index + 1}`);
    wrapper.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: var(--space-md);
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      z-index: 5;
    `;

    wrapper.innerHTML = `
      <div class="memory-card-inner" style="position: relative; display: flex; flex-direction: column; align-items: center; max-width: min(82vw, 340px); width: 100%; pointer-events: none;">
        
        <!-- Photo Frame Wrapper (holds photo & peeking glow shadows) -->
        <div class="memory-frame-wrapper" style="position: relative; width: 100%; aspect-ratio: ${this.aspectRatio}; pointer-events: none;">
          
          <!-- Peeking Glow Left (active when hovering/dragging left zone) -->
          <div class="memory-peeking-glow glow-left" aria-hidden="true"></div>
          
          <!-- Peeking Glow Right (active when hovering/dragging right zone) -->
          <div class="memory-peeking-glow glow-right" aria-hidden="true"></div>

          <!-- The Main Photo Frame (receives tap to clarify) -->
          <div class="memory-photo-frame" role="button" tabindex="0" aria-label="Sentuh foto untuk menjernihkan" style="position: relative; width: 100%; height: 100%; border-radius: 16px; overflow: hidden; background: linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(20,15,30,0.8) 100%); border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55), 0 0 30px rgba(242, 203, 134, 0.08); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 22; pointer-events: auto; cursor: pointer; will-change: transform, opacity, filter; -webkit-tap-highlight-color: transparent; outline: none;">
            
            <!-- Artistic Placeholder Backdrop (shown if photo is missing) -->
            <div class="memory-placeholder-art" style="position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: center; background: radial-gradient(circle at 50% 40%, rgba(247, 169, 136, 0.18) 0%, rgba(30, 20, 45, 0.85) 80%); color: var(--accent-gold); padding: 1.5rem; text-align: center; pointer-events: none;">
              <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.55; margin-bottom: 0.75rem;">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <span style="font-family: var(--font-serif); font-size: var(--text-sm); font-style: italic; opacity: 0.7; letter-spacing: var(--tracking-wide);">Potret Sosok dalam Ingatan</span>
            </div>

            <!-- The Real Partner Photo (starts blurred until tapped) -->
            <img class="memory-img is-blurred" src="${this.imageSrc}" alt="Potret dalam ingatan" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center 25%; opacity: 0; pointer-events: none;" loading="${this.index === 0 ? 'eager' : 'lazy'}" decoding="async" />
            
            <!-- Ambient Water Ripple Beacon (Pure Visual Touch Cue like Phase 3, ONLY on Photo 1) -->
            ${this.index === 0 ? `
              <div class="memory-ambient-ripple-beacon" aria-hidden="true" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 23;">
                <div class="ambient-ripple-core"></div>
                <div class="ambient-water-ring ring-1"></div>
                <div class="ambient-water-ring ring-2"></div>
                <div class="ambient-water-ring ring-3"></div>
              </div>
            ` : ''}

            <!-- Dynamic Tap Water Ripples Container -->
            <div class="memory-water-ripples-container" aria-hidden="true" style="position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 24;"></div>

            <!-- Soft Atmospheric Frame Vignette -->
            <div class="memory-inner-vignette" style="position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 60%, rgba(10, 8, 18, 0.45) 100%); pointer-events: none; z-index: 4;"></div>
          </div>
        </div>

        <!-- Poetic Caption Container (starts hidden until unblurred) -->
        <div class="memory-caption-wrapper" style="margin-top: var(--space-lg); text-align: center; max-width: 480px; z-index: 2; opacity: 0; visibility: hidden; filter: blur(8px); transform: translateY(14px); pointer-events: none; will-change: transform, opacity, filter;">
          <p class="memory-caption text-lyric" style="font-size: var(--text-base); line-height: var(--leading-relaxed); color: var(--text-primary); text-shadow: 0 2px 12px rgba(0,0,0,0.5);">
            "${this.caption}"
          </p>
          ${this.captionSecondary ? `
            <p class="memory-caption-secondary text-lyric" style="font-size: var(--text-base); line-height: var(--leading-relaxed); color: var(--text-secondary); margin-top: var(--space-xs); text-shadow: 0 2px 12px rgba(0,0,0,0.5);">
              "${this.captionSecondary}"
            </p>
          ` : ''}
        </div>
      </div>
    `;

    // Handle image load / error gracefully
    const img = wrapper.querySelector('.memory-img');
    const placeholderArt = wrapper.querySelector('.memory-placeholder-art');
    
    if (img) {
      img.onload = () => {
        img.style.opacity = '1';
        if (placeholderArt) placeholderArt.style.display = 'none';
      };
      img.onerror = () => {
        img.style.display = 'none';
        if (placeholderArt) placeholderArt.style.display = 'flex';
      };
    }

    // Bind tap to clarify
    this.bindClarifyTrigger(wrapper);

    this.element = wrapper;
    if (this.container) {
      this.container.appendChild(wrapper);
    }
    return this.element;
  }

  /**
   * Bind clarify tap listener on the photo frame
   */
  bindClarifyTrigger(wrapper) {
    const photoFrame = wrapper.querySelector('.memory-photo-frame');
    if (!photoFrame) return;

    this.handleClarifyClick = (e) => {
      e.stopPropagation();
      if (this.isClarified) return;

      const rect = photoFrame.getBoundingClientRect();
      let clickX = rect.width / 2;
      let clickY = rect.height / 2;

      if (e.clientX && e.clientY) {
        clickX = e.clientX - rect.left;
        clickY = e.clientY - rect.top;
      }

      this.clarify(clickX, clickY);
    };

    photoFrame.addEventListener('click', this.handleClarifyClick);
  }

  /**
   * Perform pure water ripple clarify animation and reveal caption
   * @param {number} x - Relative X coordinate inside the photo frame
   * @param {number} y - Relative Y coordinate inside the photo frame
   */
  clarify(x = null, y = null) {
    if (this.isClarified || !this.element) return;
    this.isClarified = true;

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const img = this.element.querySelector('.memory-img');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const ambientBeacon = this.element.querySelector('.memory-ambient-ripple-beacon');
    const ripplesContainer = this.element.querySelector('.memory-water-ripples-container');

    // 1. Play crystal water drop sound effect
    audioManager.playWaterRipple(0.38);

    // 2. Fade out ambient ripple beacon
    if (ambientBeacon) {
      gsap.to(ambientBeacon, {
        opacity: 0,
        scale: 0.6,
        duration: 0.45,
        ease: 'power2.in',
        onComplete: () => {
          ambientBeacon.style.display = 'none';
        },
      });
    }

    // 3. Spawn dynamic water ripple wave rings from tap coordinates
    if (ripplesContainer && photoFrame) {
      const frameRect = photoFrame.getBoundingClientRect();
      const originX = x !== null ? x : frameRect.width / 2;
      const originY = y !== null ? y : frameRect.height / 2;

      // Spawn 2 clean concentric wave rings
      for (let i = 0; i < 2; i++) {
        const ripple = document.createElement('div');
        ripple.className = `memory-water-ripple ring-wave-${i + 1}`;
        ripple.style.cssText = `
          position: absolute;
          left: ${originX}px;
          top: ${originY}px;
          width: 30px;
          height: 30px;
          margin-left: -15px;
          margin-top: -15px;
          border-radius: 50%;
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          background: radial-gradient(circle, rgba(242, 203, 134, 0.3) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 70%);
          box-shadow: 0 0 14px rgba(242, 203, 134, 0.65);
          pointer-events: none;
          transform: scale(0.1);
          opacity: 0.9;
        `;
        ripplesContainer.appendChild(ripple);

        gsap.to(ripple, {
          scale: 4.8 + i * 1.5,
          opacity: 0,
          duration: 0.85 + i * 0.15,
          delay: i * 0.08,
          ease: 'power2.out',
          onComplete: () => {
            if (ripple.parentNode) {
              ripple.parentNode.removeChild(ripple);
            }
          },
        });
      }
    }

    // 4. Smoothly clear photo blur & reset scale
    if (img) {
      img.classList.remove('is-blurred');
      img.classList.add('is-clarified');
      img.style.filter = '';
      gsap.to(img, {
        filter: 'blur(0px) brightness(1)',
        scale: 1.0,
        duration: 0.85,
        ease: 'power2.out',
      });
    }

    // 5. Reveal poetic caption
    if (captionWrapper) {
      captionWrapper.style.visibility = 'visible';
      captionWrapper.style.pointerEvents = 'auto';
      gsap.fromTo(
        captionWrapper,
        { opacity: 0, y: 14, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.85, delay: 0.15, ease: 'power2.out' }
      );
    }

    // 6. Notify gallery that this card has been clarified
    this.onClarified(this.index);
  }

  /**
   * Subtle water ripple pulse cue if user attempts to skip Card 0 without unblurring
   */
  pulseClarifyCue() {
    if (!this.element || this.isClarified) return;
    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const ambientCore = this.element.querySelector('.ambient-ripple-core');

    if (photoFrame) {
      // Gentle card wobble
      gsap.fromTo(
        photoFrame,
        { x: -6 },
        {
          x: 6,
          duration: 0.1,
          yoyo: true,
          repeat: 3,
          ease: 'power2.inOut',
          onComplete: () => {
            gsap.set(photoFrame, { x: 0 });
          },
        }
      );
    }

    if (ambientCore) {
      gsap.fromTo(
        ambientCore,
        { scale: 1 },
        {
          scale: 2.2,
          duration: 0.25,
          yoyo: true,
          repeat: 3,
          ease: 'power2.inOut',
        }
      );
    }
  }

  /**
   * Synchronize visual state (blurred vs clarified) when emerging or switching
   */
  syncClarificationVisuals() {
    if (!this.element) return;
    const img = this.element.querySelector('.memory-img');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const ambientBeacon = this.element.querySelector('.memory-ambient-ripple-beacon');
    const photoFrame = this.element.querySelector('.memory-photo-frame');

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'auto';
    }

    if (this.isClarified) {
      if (img) {
        img.classList.remove('is-blurred');
        img.classList.add('is-clarified');
        img.style.filter = '';
        gsap.set(img, { filter: 'blur(0px) brightness(1)', scale: 1.0, opacity: 1 });
      }
      if (ambientBeacon) {
        ambientBeacon.style.display = 'none';
        ambientBeacon.style.opacity = '0';
      }
      if (captionWrapper) {
        captionWrapper.style.visibility = 'visible';
        captionWrapper.style.pointerEvents = 'auto';
        gsap.set(captionWrapper, { opacity: 1, y: 0, filter: 'blur(0px)' });
      }
    } else {
      if (img) {
        img.classList.add('is-blurred');
        img.classList.remove('is-clarified');
        img.style.filter = '';
        gsap.set(img, { scale: 1.04, opacity: 1 });
      }
      if (ambientBeacon) {
        ambientBeacon.style.display = 'flex';
        ambientBeacon.style.opacity = '1';
        gsap.set(ambientBeacon, { opacity: 1, scale: 1 });
      }
      if (captionWrapper) {
        captionWrapper.style.visibility = 'hidden';
        captionWrapper.style.pointerEvents = 'none';
        gsap.set(captionWrapper, { opacity: 0, y: 14, filter: 'blur(8px)' });
      }
    }
  }

  /**
   * Set hover state to activate glowing peeking card frame
   * @param {'right'|'left'|null} side
   */
  setHoverState(side) {
    if (!this.element) return;
    const inner = this.element.querySelector('.memory-card-inner');
    if (!inner) return;

    inner.classList.remove('is-hover-right', 'is-hover-left');
    if (side === 'right') {
      inner.classList.add('is-hover-right');
    } else if (side === 'left') {
      inner.classList.add('is-hover-left');
    }
  }

  /**
   * Real-time tactile feedback during mobile finger drag/swipe
   * @param {number} deltaX - Horizontal drag offset in px
   */
  setLiveDragOffset(deltaX) {
    if (!this.element) return;
    const photoFrame = this.element.querySelector('.memory-photo-frame');
    if (!photoFrame) return;

    const clampedX = Math.max(-130, Math.min(130, deltaX * 0.48));
    const rotation = clampedX * 0.045;

    gsap.to(photoFrame, {
      x: clampedX,
      rotation: rotation,
      duration: 0.08,
      ease: 'power1.out',
      overwrite: 'auto',
    });

    if (deltaX < -15) {
      this.setHoverState('right');
    } else if (deltaX > 15) {
      this.setHoverState('left');
    } else {
      this.setHoverState(null);
    }
  }

  /**
   * Smoothly snap photo frame back to center after finger release
   */
  resetLiveDrag() {
    if (!this.element) return;
    const photoFrame = this.element.querySelector('.memory-photo-frame');
    this.setHoverState(null);

    if (photoFrame) {
      gsap.to(photoFrame, {
        x: 0,
        rotation: 0,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }
  }

  /**
   * Play a brief idle peek cue when user is idle, then return to normal
   * @param {'right'|'left'} side
   */
  playIdlePeekCue(side = 'right') {
    if (!this.element) return Promise.resolve();
    const inner = this.element.querySelector('.memory-card-inner');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !inner) return Promise.resolve();

    const className = side === 'left' ? 'is-hover-left' : 'is-hover-right';

    return new Promise(resolve => {
      inner.classList.add(className);
      setTimeout(() => {
        if (inner) inner.classList.remove(className);
        resolve();
      }, 1100);
    });
  }

  /**
   * Initial entrance of the card stack
   */
  initialEnter(duration = 1.4) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.element.style.visibility = 'visible';
    this.element.style.pointerEvents = 'none';
    this.element.style.zIndex = '10';

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'auto';
    }

    this.syncClarificationVisuals();

    if (prefersReducedMotion) {
      gsap.set(this.element, { opacity: 1 });
      gsap.set(photoFrame, { scale: 1, x: 0, y: 0 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({ onComplete: resolve });
      this.timeline
        .set(this.element, { opacity: 1 })
        .fromTo(
          photoFrame,
          { opacity: 0, scale: 1.05, y: 15, x: 0, rotation: 0 },
          { opacity: 1, scale: 1, y: 0, x: 0, rotation: 0, duration: duration, ease: 'power2.out' }
        );
    });
  }

  /**
   * NEXT SWIPE: Active card slides out to the LEFT, then swoops down into the CENTER-BACK
   * @param {number} duration
   */
  shuffleLeftToBack(duration = 0.75) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'none';
    }

    if (prefersReducedMotion) {
      gsap.set(this.element, { opacity: 0, visibility: 'hidden', zIndex: 1 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.element.style.zIndex = '2';
          this.element.style.visibility = 'hidden';
          if (photoFrame) {
            gsap.set(photoFrame, { x: 0, rotation: 0, scale: 1, opacity: 1 });
          }
          resolve();
        },
      });

      // 1. Caption dissolves if it was visible
      if (this.isClarified && captionWrapper) {
        this.timeline.to(captionWrapper, {
          opacity: 0,
          y: -10,
          filter: 'blur(6px)',
          duration: duration * 0.35,
          ease: 'power2.in',
        }, 0);
      }

      // 2. Active card slides out to the LEFT
      this.timeline.to(photoFrame, {
        x: -130,
        rotation: -6,
        scale: 1.02,
        duration: duration * 0.4,
        ease: 'power2.out',
      }, 0);

      // 3. Drop layer to back and curve into CENTER (BEHIND DECK)
      this.timeline
        .set(this.element, { zIndex: 2 })
        .to(photoFrame, {
          x: 0,
          rotation: 0,
          scale: 0.88,
          opacity: 0,
          duration: duration * 0.5,
          ease: 'power2.inOut',
        }, '+=0.02');
    });
  }

  /**
   * NEXT SWIPE: Next card starts from CENTER-BACK, swings slightly to the RIGHT, and swoops forward into FRONT
   * @param {number} duration
   */
  emergeRightToFront(duration = 0.75) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.element.style.visibility = 'visible';
    this.element.style.zIndex = '10';

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'auto';
    }

    this.syncClarificationVisuals();

    if (prefersReducedMotion) {
      gsap.set(this.element, { opacity: 1, zIndex: 10 });
      gsap.set(photoFrame, { x: 0, y: 0, scale: 1, opacity: 1 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.element.style.zIndex = '10';
          resolve();
        },
      });

      // 1. Start from CENTER-BACK, swing slightly RIGHT, and swoop forward to CENTER-FRONT
      this.timeline
        .set(this.element, { opacity: 1, zIndex: 10 })
        .fromTo(
          photoFrame,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 0.86,
            opacity: 0.25,
          },
          {
            x: 60,
            rotation: 3.5,
            scale: 0.94,
            opacity: 0.85,
            duration: duration * 0.48,
            ease: 'power2.out',
          },
          0
        )
        .to(
          photoFrame,
          {
            x: 0,
            rotation: 0,
            scale: 1.0,
            opacity: 1,
            duration: duration * 0.52,
            ease: 'power2.out',
          },
          `>-=0.05`
        );

      // Emerge caption only if already clarified previously
      if (this.isClarified && captionWrapper) {
        this.timeline.fromTo(
          captionWrapper,
          { opacity: 0, y: 12, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: duration * 0.7, ease: 'power2.out' },
          `-=${duration * 0.4}`
        );
      }
    });
  }

  /**
   * PREV SWIPE: Active card slides out to the RIGHT, then swoops down into the CENTER-BACK
   * @param {number} duration
   */
  shuffleRightToBack(duration = 0.75) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'none';
    }

    if (prefersReducedMotion) {
      gsap.set(this.element, { opacity: 0, visibility: 'hidden', zIndex: 1 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.element.style.zIndex = '2';
          this.element.style.visibility = 'hidden';
          if (photoFrame) {
            gsap.set(photoFrame, { x: 0, rotation: 0, scale: 1, opacity: 1 });
          }
          resolve();
        },
      });

      // 1. Caption dissolves if visible
      if (this.isClarified && captionWrapper) {
        this.timeline.to(captionWrapper, {
          opacity: 0,
          y: -10,
          filter: 'blur(6px)',
          duration: duration * 0.35,
          ease: 'power2.in',
        }, 0);
      }

      // 2. Active card slides out to the RIGHT
      this.timeline.to(photoFrame, {
        x: 130,
        rotation: 6,
        scale: 1.02,
        duration: duration * 0.4,
        ease: 'power2.out',
      }, 0);

      // 3. Drop layer to back and curve into CENTER (BEHIND DECK)
      this.timeline
        .set(this.element, { zIndex: 2 })
        .to(photoFrame, {
          x: 0,
          rotation: 0,
          scale: 0.88,
          opacity: 0,
          duration: duration * 0.5,
          ease: 'power2.inOut',
        }, '+=0.02');
    });
  }

  /**
   * PREV SWIPE: Previous card starts from CENTER-BACK, swings slightly to the LEFT, and swoops forward into FRONT
   * @param {number} duration
   */
  emergeLeftToFront(duration = 0.75) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.element.style.visibility = 'visible';
    this.element.style.zIndex = '10';

    if (photoFrame) {
      photoFrame.style.pointerEvents = 'auto';
    }

    this.syncClarificationVisuals();

    if (prefersReducedMotion) {
      gsap.set(this.element, { opacity: 1, zIndex: 10 });
      gsap.set(photoFrame, { x: 0, y: 0, scale: 1, opacity: 1 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.element.style.zIndex = '10';
          resolve();
        },
      });

      // 1. Start from CENTER-BACK, swing slightly LEFT, and swoop forward to CENTER-FRONT
      this.timeline
        .set(this.element, { opacity: 1, zIndex: 10 })
        .fromTo(
          photoFrame,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 0.86,
            opacity: 0.25,
          },
          {
            x: -60,
            rotation: -3.5,
            scale: 0.94,
            opacity: 0.85,
            duration: duration * 0.48,
            ease: 'power2.out',
          },
          0
        )
        .to(
          photoFrame,
          {
            x: 0,
            rotation: 0,
            scale: 1.0,
            opacity: 1,
            duration: duration * 0.52,
            ease: 'power2.out',
          },
          `>-=0.05`
        );

      // Emerge caption if clarified
      if (this.isClarified && captionWrapper) {
        this.timeline.fromTo(
          captionWrapper,
          { opacity: 0, y: 12, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: duration * 0.7, ease: 'power2.out' },
          `-=${duration * 0.4}`
        );
      }
    });
  }

  /**
   * Dismiss final card when transitioning to the flower
   */
  dismissFinal(duration = 0.9) {
    if (!this.element) return Promise.resolve();

    const photoFrame = this.element.querySelector('.memory-photo-frame');
    const captionWrapper = this.element.querySelector('.memory-caption-wrapper');

    return new Promise(resolve => {
      this.timeline = gsap.timeline({
        onComplete: () => {
          this.element.style.visibility = 'hidden';
          resolve();
        },
      });

      this.timeline
        .to(captionWrapper, {
          opacity: 0,
          y: -10,
          filter: 'blur(6px)',
          duration: duration * 0.5,
          ease: 'power2.in',
        }, 0)
        .to(photoFrame, {
          opacity: 0,
          scale: 0.96,
          filter: 'blur(10px)',
          y: -12,
          duration: duration,
          ease: 'power2.inOut',
        }, 0);
    });
  }

  destroy() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }

    const photoFrame = this.element ? this.element.querySelector('.memory-photo-frame') : null;
    if (photoFrame && this.handleClarifyClick) {
      photoFrame.removeEventListener('click', this.handleClarifyClick);
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

export default MemoryCard;
