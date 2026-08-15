import gsap from 'gsap';
import { audioManager } from '../audio/audioManager.js';
import { STORY_CONTENT } from '../data/storyContent.js';

/**
 * Letter Component
 * Unified physical SVG envelope, user tap to open, idle quiver feedback, and user-driven staged reading with minimalist indicator.
 */
export class Letter {
  constructor(options = {}) {
    this.container = options.container || null;
    this.name = options.name || STORY_CONTENT.meta.partnerName || 'Dia';
    this.onFinish = options.onFinish || null;
    this.onBeforeOpen = options.onBeforeOpen || null;
    this.element = null;
    this.isOpen = false;
    this.currentSection = 0;
    
    // Dynamic paragraphs from central story content
    this.letterData = STORY_CONTENT.phase4.letter;
    this.totalSections = this.letterData.paragraphs.length + 1; // 0: Greeting, 1..N: Paragraphs, N+1: Signature
    this.isAdvancing = false;
    this.isFinished = false;
    this.idleInterval = null;
    this.activeTimelines = [];

    this.handleEnvelopeClick = null;
    this.handleEnvelopeKey = null;
    this.handleAdvanceClick = null;
    this.handleKeyDown = null;
  }

  render() {
    if (this.element) return this.element;

    const wrapper = document.createElement('div');
    wrapper.className = 'letter-component-wrapper';
    wrapper.setAttribute('aria-label', 'Surat Percakapan');

    // Build paragraphs dynamically
    const paragraphsHtml = this.letterData.paragraphs.map((text, idx) => {
      return `<p class="letter-paragraph" id="p4-lp-${idx + 1}">${text}</p>`;
    }).join('\n');

    const signatureId = `p4-lp-${this.letterData.paragraphs.length + 1}`;

    wrapper.innerHTML = `
      <!-- 1. Unified Cinematic SVG Envelope Shell (Tap to open) -->
      <button class="p4-envelope-unfold-shell" id="p4-envelope-shell" aria-label="${this.letterData.envelopeAriaLabel}" tabindex="0">
        <div class="envelope-backlight"></div>
        <svg class="p4-envelope-svg" viewBox="0 0 280 175">
          <defs>
            <!-- Envelope Body Gradient -->
            <linearGradient id="p4-env-base-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2a2038" stop-opacity="0.95"/>
              <stop offset="60%" stop-color="#1e1628" stop-opacity="0.95"/>
              <stop offset="100%" stop-color="#140e1c" stop-opacity="0.98"/>
            </linearGradient>

            <!-- Bottom Pocket Gradient -->
            <linearGradient id="p4-env-pocket-grad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stop-color="#140e1c" stop-opacity="0.98"/>
              <stop offset="60%" stop-color="#20172c" stop-opacity="0.96"/>
              <stop offset="100%" stop-color="#2c223a" stop-opacity="0.92"/>
            </linearGradient>

            <!-- Top Flap Gradient -->
            <linearGradient id="p4-env-flap-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#342846" stop-opacity="0.98"/>
              <stop offset="50%" stop-color="#241b32" stop-opacity="0.96"/>
              <stop offset="100%" stop-color="#1a1224" stop-opacity="0.94"/>
            </linearGradient>

            <!-- Wax Seal Gradient -->
            <radialGradient id="p4-wax-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#f2cb86"/>
              <stop offset="60%" stop-color="#d99252"/>
              <stop offset="100%" stop-color="#a65432"/>
            </radialGradient>
          </defs>

          <!-- Envelope Back Plate -->
          <rect x="0" y="0" width="280" height="175" rx="14" fill="url(#p4-env-base-grad)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2"/>

          <!-- Interior Lining Depth -->
          <rect x="8" y="8" width="264" height="159" rx="10" fill="#120c18" opacity="0.85"/>

          <!-- Side Fold Flaps -->
          <path d="M0 0 L115 87.5 L0 175 Z" fill="url(#p4-env-base-grad)" opacity="0.95" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.8"/>
          <path d="M280 0 L165 87.5 L280 175 Z" fill="url(#p4-env-base-grad)" opacity="0.95" stroke="rgba(255, 255, 255, 0.12)" stroke-width="0.8"/>

          <!-- Bottom Front Pocket -->
          <path d="M0 175 L140 82 L280 175 Z" fill="url(#p4-env-pocket-grad)" stroke="rgba(255, 255, 255, 0.18)" stroke-width="1.2"/>

          <!-- Top Opening Flap (Animated with GSAP rotation) -->
          <g id="p4-env-top-flap-group">
            <path id="p4-top-flap-path" d="M0 0 L140 98 L280 0 Z" fill="url(#p4-env-flap-grad)" stroke="rgba(255, 255, 255, 0.22)" stroke-width="1.2"/>
            <!-- Integrated Wax Seal -->
            <g id="p4-env-seal-group">
              <circle cx="140" cy="94" r="18" fill="url(#p4-wax-grad)" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.5))" stroke="rgba(255,255,255,0.4)" stroke-width="0.8"/>
              <!-- Starlight Crest inside seal -->
              <path d="M140 84 L142.5 91.5 L150 94 L142.5 96.5 L140 104 L137.5 96.5 L130 94 L137.5 91.5 Z" fill="#2b1810"/>
            </g>
          </g>
        </svg>
      </button>

      <!-- 2. Warm Ivory Letter Paper Card (Scrollable, Staged Reading) -->
      <div class="letter-paper-card" id="p4-letter-paper" tabindex="0" role="article" aria-label="Isi Surat Percakapan" style="pointer-events: none;">
        <div class="paper-texture-overlay"></div>
        <div class="letter-content-body" id="p4-letter-body">
          <!-- Greeting -->
          <div class="letter-greeting letter-paragraph is-revealed" id="p4-lp-0">${this.letterData.greeting}</div>

          <!-- Paragraphs -->
          ${paragraphsHtml}

          <!-- Signature -->
          <div class="letter-signature" id="${signatureId}">
            ${this.letterData.signature}
          </div>
        </div>

        <!-- Minimalist Pure Visual Advance Indicator Cue (No Text) -->
        <div class="letter-tap-cue-bar" id="p4-letter-cue-bar">
          <div class="minimal-cue-indicator" id="p4-minimal-cue" aria-label="Lanjutkan membaca" role="button" tabindex="0">
            <svg class="minimal-cue-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
    `;

    this.element = wrapper;
    if (this.container) {
      this.container.appendChild(wrapper);
    }

    this.bindEvents();
    return this.element;
  }

  bindEvents() {
    const shell = this.element.querySelector('#p4-envelope-shell');
    const paper = this.element.querySelector('#p4-letter-paper');
    const cue = this.element.querySelector('#p4-minimal-cue');

    // 1. Envelope Tap Handler (User must tap envelope to open)
    const triggerOpen = async () => {
      if (this.isOpen) return;
      if (typeof this.onBeforeOpen === 'function') {
        await this.onBeforeOpen();
      }
      await this.openEnvelope();
    };

    this.handleEnvelopeClick = triggerOpen;
    this.handleEnvelopeKey = (e) => {
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
        triggerOpen();
      }
    };

    if (shell) {
      shell.addEventListener('click', this.handleEnvelopeClick);
      shell.addEventListener('keydown', this.handleEnvelopeKey);
    }

    // 2. Reading Advance Handlers
    this.handleAdvanceClick = () => {
      if (!this.isOpen || this.isAdvancing) return;
      this.advance();
    };

    this.handleKeyDown = (e) => {
      if (!this.isOpen || this.isAdvancing) return;
      if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'PageDown') {
        this.advance();
      }
    };

    if (paper) {
      paper.addEventListener('click', this.handleAdvanceClick);
      paper.addEventListener('keydown', this.handleKeyDown);
    }

    if (cue) {
      cue.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleAdvanceClick(e);
      });
    }
  }

  /**
   * Start Minimalist Idle Cue Indicator: gently pulses the indicator icon when user is idle
   */
  startIdleCue() {
    this.stopIdleCue();
    this.idleInterval = setInterval(() => {
      if (!this.isOpen || this.isAdvancing || this.isFinished) return;
      const cue = this.element ? this.element.querySelector('#p4-minimal-cue') : null;
      if (cue) {
        gsap.fromTo(
          cue,
          { scale: 0.95, y: 0 },
          { scale: 1.15, y: 4, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }
        );
      }
    }, 4200);
  }

  stopIdleCue() {
    if (this.idleInterval) {
      clearInterval(this.idleInterval);
      this.idleInterval = null;
    }
  }

  /**
   * Unified Physical SVG Envelope Opening Sequence
   */
  async openEnvelope() {
    const shell = this.element.querySelector('#p4-envelope-shell');
    const flapGroup = this.element.querySelector('#p4-env-top-flap-group');
    const sealGroup = this.element.querySelector('#p4-env-seal-group');
    const paper = this.element.querySelector('#p4-letter-paper');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!shell || !paper) return;

    this.isOpen = true;
    shell.classList.add('is-opening');
    shell.style.pointerEvents = 'none';

    audioManager.playEnvelopeOpen(0.32);
    audioManager.playPaperUnfold(0.28);

    if (prefersReducedMotion) {
      gsap.set(shell, { opacity: 0, display: 'none' });
      gsap.set(paper, { opacity: 1, scale: 1, y: 0, pointerEvents: 'auto' });
      this.revealSection(0);
      this.revealSection(1);
      this.currentSection = 1;
      this.startIdleCue();
      return;
    }

    const openTl = gsap.timeline();
    this.activeTimelines.push(openTl);

    // 1. Seal glows warmly & dissolves
    openTl.to(sealGroup, { scale: 1.25, opacity: 0, duration: 0.6, ease: 'power2.in', svgOrigin: '140 94' }, 0);

    // 2. Top Flap flips open 180° along the top hinge
    openTl.to(
      flapGroup,
      {
        rotationX: -180,
        svgOrigin: '140 0',
        duration: 1.4,
        ease: 'power2.inOut',
      },
      0.15
    );

    // 3. Inner Paper Card slides up smoothly from inside the envelope pocket
    openTl.fromTo(
      paper,
      {
        y: 80,
        scale: 0.88,
        opacity: 0,
        filter: 'blur(6px)',
        pointerEvents: 'none',
      },
      {
        y: 0,
        scale: 1.0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1.6,
        ease: 'power2.out',
        pointerEvents: 'auto',
      },
      0.6
    );

    // 4. Envelope Shell gently fades and sinks as paper ascends
    openTl.to(
      shell,
      {
        opacity: 0,
        y: 40,
        scale: 0.94,
        filter: 'blur(8px)',
        duration: 1.0,
        ease: 'power2.inOut',
      },
      1.1
    );

    await new Promise(resolve => openTl.eventCallback('onComplete', resolve));

    if (shell) shell.style.display = 'none';

    // Reveal Greeting and Paragraph 1
    this.revealSection(0);
    this.revealSection(1);
    this.currentSection = 1;

    this.startIdleCue();
  }

  /**
   * Advance to the next paragraph block
   */
  async advance() {
    if (this.isAdvancing) return;
    this.isAdvancing = true;
    this.stopIdleCue();

    const nextSection = this.currentSection + 1;

    if (nextSection <= this.totalSections) {
      audioManager.playPageTurn(0.22);
      this.revealSection(nextSection);
      this.currentSection = nextSection;

      await this.scrollToActive(nextSection);
      this.startIdleCue();
      this.isAdvancing = false;
    } else {
      // User has reached the end of the letter
      this.isFinished = true;
      this.stopIdleCue();
      const cueBar = this.element.querySelector('#p4-letter-cue-bar');
      if (cueBar) {
        gsap.to(cueBar, { opacity: 0, duration: 0.6, ease: 'power2.in' });
      }

      if (typeof this.onFinish === 'function') {
        this.onFinish();
      }
    }
  }

  /**
   * Reveal a specific paragraph element
   */
  revealSection(index) {
    const targetEl = this.element.querySelector(`#p4-lp-${index}`);
    if (targetEl) {
      targetEl.classList.remove('is-past');
      targetEl.classList.add('is-revealed');
    }

    // Mark previous elements as past
    for (let i = 0; i < index; i++) {
      const prevEl = this.element.querySelector(`#p4-lp-${i}`);
      if (prevEl && prevEl.classList.contains('is-revealed')) {
        prevEl.classList.remove('is-revealed');
        prevEl.classList.add('is-past');
      }
    }
  }

  /**
   * Smoothly scroll paper card to keep the active paragraph in view
   */
  scrollToActive(index) {
    return new Promise(resolve => {
      const paper = this.element.querySelector('#p4-letter-paper');
      const targetEl = this.element.querySelector(`#p4-lp-${index}`);

      if (!paper || !targetEl) return resolve();

      const paperRect = paper.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const targetRelativeTop = targetRect.top - paperRect.top + paper.scrollTop;
      const scrollDest = Math.max(0, targetRelativeTop - 60);

      gsap.to(paper, {
        scrollTop: scrollDest,
        duration: 0.8,
        ease: 'power2.out',
        onComplete: resolve,
      });
    });
  }

  /**
   * Fade out the letter paper card smoothly
   */
  fadePaper(duration = 1.2) {
    const paper = this.element ? this.element.querySelector('#p4-letter-paper') : null;
    if (!paper) return Promise.resolve();

    return new Promise(resolve => {
      gsap.to(paper, {
        opacity: 0,
        y: -15,
        filter: 'blur(8px)',
        duration,
        ease: 'power2.inOut',
        onComplete: resolve,
      });
    });
  }

  destroy() {
    this.stopIdleCue();

    const shell = this.element ? this.element.querySelector('#p4-envelope-shell') : null;
    const paper = this.element ? this.element.querySelector('#p4-letter-paper') : null;

    if (shell) {
      if (this.handleEnvelopeClick) {
        shell.removeEventListener('click', this.handleEnvelopeClick);
        shell.removeEventListener('touchend', this.handleEnvelopeClick);
      }
      if (this.handleEnvelopeKey) {
        shell.removeEventListener('keydown', this.handleEnvelopeKey);
      }
    }

    if (paper) {
      if (this.handleAdvanceClick) {
        paper.removeEventListener('click', this.handleAdvanceClick);
        paper.removeEventListener('touchend', this.handleAdvanceClick);
      }
      if (this.handleKeyDown) {
        paper.removeEventListener('keydown', this.handleKeyDown);
      }
    }

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

export default Letter;
