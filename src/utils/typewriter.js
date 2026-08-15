import gsap from 'gsap';
import { audioManager } from '../audio/audioManager.js';

/**
 * Typewriter Engine for Poetic & Narrative Text
 * - Plays typewriter sound ONCE per sentence (starts on begin, stops on finish)
 * - Sequential line typing (Line 1 types -> stays visible -> Line 2 types -> all fade together)
 * - Natural reading cadence and clean fade transitions
 */
export class Typewriter {
  /**
   * Types text into a DOM element character-by-character
   * @param {HTMLElement} element - Target DOM element
   * @param {string} text - The text string to type
   * @param {object} options
   * @returns {Promise<void>}
   */
  static type(element, text, options = {}) {
    if (!element) return Promise.resolve();

    gsap.killTweensOf(element);
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    gsap.set(element, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'filter' });

    if (element.parentElement) {
      element.parentElement.style.visibility = 'visible';
      element.parentElement.style.opacity = '1';
    }

    const speed = options.speed || 38; // ms per char
    const addQuotes = options.quotes !== false;
    const cleanText = (text || '').trim();
    if (!cleanText) {
      element.textContent = '';
      return Promise.resolve();
    }

    const displayText = addQuotes && !cleanText.startsWith('"') ? `"${cleanText}"` : cleanText;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      element.textContent = displayText;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      element.textContent = '';

      // 1. Trigger typewriter audio ONCE per sentence (Warm & clear tactile volume)
      if (options.playSound !== false) {
        audioManager.startTypewriterSentence(options.volume || 0.35);
      }

      let i = 0;
      const typeChar = () => {
        if (i < displayText.length) {
          const char = displayText[i];
          element.textContent += char;
          i++;

          // Natural human cadence: pause slightly on punctuation
          let delay = speed;
          if (char === ',' || char === ';') delay = speed * 2.4;
          else if (char === '.' || char === '!' || char === '?') delay = speed * 3.6;
          else if (char === ' ') delay = speed * 1.1;

          setTimeout(typeChar, delay);
        } else {
          // 2. Stop typewriter sound cleanly when typing completes
          if (options.playSound !== false) {
            audioManager.stopTypewriterSentence(220);
          }
          resolve();
        }
      };

      typeChar();
    });
  }

  /**
   * Staged sequence: Types multiple lines sequentially (baris demi baris):
   * Line 1 types (sound plays once) -> stays visible ->
   * Line 2 types (sound plays once) -> stays visible ->
   * All lines stay visible together for reading -> then fade out together.
   * @param {HTMLElement} container - The container box to fade out at the end
   * @param {Array<{element: HTMLElement, text: string, options?: object}>} items - List of target elements and their texts
   * @param {number} holdDuration - Pause duration in ms after all lines finish typing before fading out together
   * @returns {Promise<void>}
   */
  static async sequence(container, items = [], holdDuration = 3000) {
    if (!items || items.length === 0) return;

    // Reset container to visible
    if (container) {
      gsap.killTweensOf(container);
      container.style.visibility = 'visible';
      container.style.opacity = '1';
      if (container.parentElement) {
        container.parentElement.style.visibility = 'visible';
        container.parentElement.style.opacity = '1';
      }
      gsap.set(container, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'filter' });
    }

    // Initialize all line elements: clear text and prepare them
    for (const item of items) {
      if (item.element) {
        gsap.killTweensOf(item.element);
        item.element.textContent = '';
        item.element.style.opacity = '1';
        item.element.style.visibility = 'visible';
        item.element.style.display = 'block';
        gsap.set(item.element, { opacity: 1, y: 0, scale: 1, filter: 'none', clearProps: 'filter' });
      }
    }

    // Type each line sequentially without hiding previous lines
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx];
      if (item.element && item.text) {
        // Type current line (sound plays once for this sentence)
        await this.type(item.element, item.text, item.options || {});

        // Short breathing pause before the next line begins
        if (idx < items.length - 1) {
          await new Promise(r => setTimeout(r, 450));
        }
      }
    }

    // Hold duration so the reader can comfortably read all lines together
    await new Promise(r => setTimeout(r, holdDuration));

    // Smoothly dissolve / fade out the container with all lines together
    if (container) {
      await new Promise(resolve => {
        gsap.to(container, {
          opacity: 0,
          y: -10,
          filter: 'blur(6px)',
          duration: 1.0,
          ease: 'power2.inOut',
          overwrite: 'auto',
          onComplete: () => {
            container.style.visibility = 'hidden';
            gsap.set(container, { clearProps: 'filter' });
            resolve();
          },
        });
      });
    }
  }
}

export default Typewriter;
