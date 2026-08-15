import gsap from 'gsap';

/**
 * TransitionManager - Cinematic Transitions & Atmospheric Shifting
 */
export class TransitionManager {
  constructor() {
    this.curtain = document.getElementById('transitionCurtain');
    this.sky = document.getElementById('ambientSky');
  }

  /**
   * Fade in or out the transition curtain
   * @param {number} opacity - 0 (clear) to 1 (black)
   * @param {number} duration - seconds
   * @returns {Promise<void>}
   */
  fadeCurtain(opacity = 1, duration = 0.8) {
    return new Promise(resolve => {
      if (!this.curtain) {
        this.curtain = document.getElementById('transitionCurtain');
      }
      if (!this.curtain) return resolve();

      gsap.to(this.curtain, {
        opacity,
        duration,
        ease: 'power2.inOut',
        onComplete: resolve,
      });
    });
  }

  /**
   * Smooth dissolve between two DOM elements
   * @param {HTMLElement} currentElement
   * @param {HTMLElement} nextElement
   * @param {number} duration
   * @returns {Promise<void>}
   */
  dissolve(currentElement, nextElement, duration = 1.2) {
    return new Promise(resolve => {
      const half = duration / 2;
      const tl = gsap.timeline({
        onComplete: resolve,
      });

      if (currentElement) {
        tl.to(currentElement, {
          opacity: 0,
          scale: 0.98,
          filter: 'blur(4px)',
          duration: half,
          ease: 'power2.inOut',
        });
      }

      if (nextElement) {
        tl.set(nextElement, {
          opacity: 0,
          scale: 1.02,
          filter: 'blur(4px)',
          visibility: 'visible',
        });

        tl.to(nextElement, {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: half,
          ease: 'power2.out',
        });
      }
    });
  }

  /**
   * Change atmospheric sky gradient mood
   * @param {'sunset'|'night'|'desaturated'} mood
   * @param {number} duration
   */
  changeSkyMood(mood = 'sunset', duration = 2.0) {
    if (!this.sky) {
      this.sky = document.getElementById('ambientSky');
    }
    if (!this.sky) return;

    this.sky.className = `ambient-layer sky-gradient mood-${mood}`;
  }
}

export const transitionManager = new TransitionManager();
export default transitionManager;
