import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';
import { STORY_CONTENT } from '../../data/storyContent.js';

/**
 * MosaicWall Component (Phase 2)
 * Renders all 12 Polaroid memory fragments simultaneously:
 * 1. Initial state: All photos in atmospheric blur
 * 2. Clean aesthetic labels ("Fragmen I", "Fragmen II", etc.)
 * 3. Tap to trigger dynamic water ripple, unblur polaroid, and open Spotlight Modal
 * 4. Persistent unblurred state on mosaic grid
 * 5. Smooth proceed button to transition to the Blooming Flower
 */
export class MosaicWall {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onFinish = options.onFinish || (() => {});
    this.element = null;
    this.modal = null;
    this.timeline = null;
    this.photos = STORY_CONTENT.phase2.mosaic.photos || [];
    this.clarifiedMap = new Set(); // Stores IDs of clarified photos
    this.activePhotoId = null;
  }

  mount() {
    if (!this.container || this.element) return this.element;
    const content = STORY_CONTENT.phase2.mosaic;

    const el = document.createElement('div');
    el.className = 'mosaic-wall-container';
    el.id = 'p2-mosaic-wall';
    el.setAttribute('aria-label', content.title);

    // Build Polaroid Items (starts in blurred state)
    const itemsHTML = this.photos.map((item, idx) => {
      const tilts = [-3.5, 2.5, -2, 3.8, -1.8, 2.8, -4, 1.5, -2.5, 3.2, -1.5, 2.2];
      const tilt = tilts[idx % tilts.length];

      return `
        <button class="mosaic-polaroid-item item-${idx + 1}" type="button" data-id="${item.id}" aria-label="${item.label}" style="--item-tilt: ${tilt}deg;" tabindex="0">
          <div class="mosaic-polaroid-inner">
            <div class="mosaic-img-wrap">
              <img src="${item.imageSrc}" alt="${item.label}" class="mosaic-img is-blurred" loading="lazy" decoding="async" />
              <div class="mosaic-ripple-container" aria-hidden="true"></div>
              <div class="mosaic-img-vignette"></div>
            </div>
            <div class="mosaic-label-wrap">
              <span class="mosaic-item-title">${item.label}</span>
            </div>
          </div>
        </button>
      `;
    }).join('');

    el.innerHTML = `
      <!-- Header Prompt -->
      <div class="mosaic-header">
        <h2 class="mosaic-title text-title">${content.title}</h2>
        <p class="mosaic-subtitle text-lyric">${content.prompt}</p>
      </div>

      <!-- Scrollable / Responsive Mosaic Grid -->
      <div class="mosaic-grid" id="p2-mosaic-grid">
        ${itemsHTML}
      </div>

      <!-- Action Button to Proceed to Flower & Phase 3 -->
      <div class="mosaic-footer">
        <button class="mosaic-proceed-btn cta-breathe" id="p2-mosaic-cta" type="button" aria-label="Lanjutkan ke tahap berikutnya" tabindex="0">
          <span class="mosaic-cta-text">${content.ctaButton}</span>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mosaic-cta-icon">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      <!-- Spotlight Modal for detailed photo reading -->
      <div class="mosaic-spotlight-modal" id="p2-spotlight-modal" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="spotlight-backdrop" id="p2-spotlight-backdrop"></div>
        <div class="spotlight-card" id="p2-spotlight-card">
          <button class="spotlight-close-btn" id="p2-spotlight-close" aria-label="Tutup pratinjau" tabindex="0">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          <div class="spotlight-photo-frame">
            <img class="spotlight-img" id="p2-spotlight-img" src="" alt="Pratinjau Foto" />
            <div class="spotlight-vignette"></div>
          </div>
          
          <div class="spotlight-content">
            <h3 class="spotlight-title text-title" id="p2-spotlight-title"></h3>
            <p class="spotlight-caption text-lyric" id="p2-spotlight-caption"></p>
          </div>
        </div>
      </div>
    `;

    this.element = el;
    this.container.appendChild(el);
    this.bindEvents();
    return this.element;
  }

  bindEvents() {
    if (!this.element) return;

    // 1. Polaroid Item Clicks (Unblur & Open Spotlight)
    const items = this.element.querySelectorAll('.mosaic-polaroid-item');
    items.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.getAttribute('data-id'), 10);
        this.clarifyAndOpen(btn, id, e);
      });
    });

    // 2. Close Spotlight
    const modalBackdrop = this.element.querySelector('#p2-spotlight-backdrop');
    const closeBtn = this.element.querySelector('#p2-spotlight-close');

    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', () => this.closeSpotlight());
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeSpotlight());
    }

    // 3. CTA Proceed Button
    const ctaBtn = this.element.querySelector('#p2-mosaic-cta');
    if (ctaBtn) {
      ctaBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        audioManager.playPaperRustle(0.35);
        await this.dismiss();
        this.onFinish();
      });
    }
  }

  /**
   * Unblur polaroid item with dynamic water ripple & open spotlight modal
   */
  clarifyAndOpen(buttonEl, photoId, event) {
    const photo = this.photos.find(p => p.id === photoId);
    if (!photo || !this.element) return;

    // 1. Unblur the photo on the grid permanently
    const img = buttonEl.querySelector('.mosaic-img');
    const rippleWrap = buttonEl.querySelector('.mosaic-ripple-container');

    if (!this.clarifiedMap.has(photoId)) {
      this.clarifiedMap.add(photoId);
      audioManager.playWaterRipple(0.38);

      if (img) {
        img.classList.remove('is-blurred');
        img.classList.add('is-clarified');
        gsap.to(img, {
          filter: 'blur(0px) brightness(1)',
          scale: 1.0,
          duration: 0.7,
          ease: 'power2.out',
        });
      }

      // Spawn water ripple inside polaroid
      if (rippleWrap) {
        const ripple = document.createElement('div');
        ripple.className = 'mosaic-water-ripple';
        rippleWrap.appendChild(ripple);

        gsap.fromTo(
          ripple,
          { scale: 0.1, opacity: 0.9 },
          {
            scale: 3.5,
            opacity: 0,
            duration: 0.9,
            ease: 'power2.out',
            onComplete: () => {
              if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
            },
          }
        );
      }
    } else {
      audioManager.playWaterRipple(0.25);
    }

    // 2. Open high-resolution detail spotlight
    this.openSpotlight(photo);
  }

  /**
   * Open high-resolution detail spotlight for a photo
   */
  openSpotlight(photo) {
    const modal = this.element.querySelector('#p2-spotlight-modal');
    const img = this.element.querySelector('#p2-spotlight-img');
    const title = this.element.querySelector('#p2-spotlight-title');
    const caption = this.element.querySelector('#p2-spotlight-caption');
    const card = this.element.querySelector('#p2-spotlight-card');
    const backdrop = this.element.querySelector('#p2-spotlight-backdrop');

    if (!modal || !img || !title || !caption || !card) return;

    this.activePhotoId = photo.id;
    img.src = photo.imageSrc;
    title.textContent = photo.label;
    caption.textContent = `"${photo.caption}"`;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    gsap.killTweensOf([backdrop, card]);
    gsap.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.4, ease: 'power2.out' }
    );
    gsap.fromTo(
      card,
      { opacity: 0, scale: 0.88, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
    );
  }

  /**
   * Close spotlight modal
   */
  closeSpotlight() {
    if (!this.element) return;
    const modal = this.element.querySelector('#p2-spotlight-modal');
    const card = this.element.querySelector('#p2-spotlight-card');
    const backdrop = this.element.querySelector('#p2-spotlight-backdrop');

    if (!modal || !card || !backdrop) return;

    audioManager.playPageTurn(0.18);

    gsap.to(card, {
      opacity: 0,
      scale: 0.9,
      y: 12,
      duration: 0.3,
      ease: 'power2.in',
    });

    gsap.to(backdrop, {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        this.activePhotoId = null;
      },
    });
  }

  /**
   * Cinematic entrance of the entire mosaic wall
   */
  reveal() {
    if (!this.element) return Promise.resolve();

    if (this.container) {
      this.container.classList.add('is-active');
      this.container.style.visibility = 'visible';
      this.container.style.opacity = '1';
      this.container.style.pointerEvents = 'auto';
      gsap.set(this.container, { opacity: 1, visibility: 'visible', pointerEvents: 'auto' });
    }

    const header = this.element.querySelector('.mosaic-header');
    const items = this.element.querySelectorAll('.mosaic-polaroid-item');
    const footer = this.element.querySelector('.mosaic-footer');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.element.style.visibility = 'visible';
    this.element.style.pointerEvents = 'auto';

    if (prefersReducedMotion) {
      gsap.set([this.element, header, items, footer], { opacity: 1, y: 0, scale: 1 });
      return Promise.resolve();
    }

    return new Promise(resolve => {
      this.timeline = gsap.timeline({ onComplete: resolve });

      this.timeline
        .fromTo(
          this.element,
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: 'power2.out' }
        )
        .fromTo(
          header,
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo(
          items,
          { opacity: 0, scale: 0.75, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.06,
            ease: 'back.out(1.3)',
          },
          '-=0.5'
        )
        .fromTo(
          footer,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.3'
        );
    });
  }

  /**
   * Smoothly dismiss mosaic wall when proceeding to the Blooming Flower
   */
  dismiss() {
    if (!this.element) return Promise.resolve();
    this.closeSpotlight();

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      this.element.style.visibility = 'hidden';
      this.element.style.pointerEvents = 'none';
      if (this.container) {
        this.container.classList.remove('is-active');
        this.container.style.visibility = 'hidden';
        this.container.style.opacity = '0';
        this.container.style.pointerEvents = 'none';
      }
      return Promise.resolve();
    }

    return new Promise(resolve => {
      gsap.to(this.element, {
        opacity: 0,
        scale: 0.94,
        y: -15,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
          this.element.style.visibility = 'hidden';
          this.element.style.pointerEvents = 'none';
          if (this.container) {
            this.container.classList.remove('is-active');
            this.container.style.visibility = 'hidden';
            this.container.style.opacity = '0';
            this.container.style.pointerEvents = 'none';
          }
          resolve();
        },
      });
    });
  }

  destroy() {
    if (this.timeline) {
      this.timeline.kill();
      this.timeline = null;
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }
}

export default MosaicWall;
