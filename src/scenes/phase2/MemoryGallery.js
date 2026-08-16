import { MemoryCard } from '../../components/MemoryCard.js';
import { audioManager } from '../../audio/audioManager.js';
import { STORY_CONTENT } from '../../data/storyContent.js';

/**
 * MemoryGallery Sub-Component (Phase 2)
 * Manages:
 * 1. Stack of 3 Polaroid memory cards with water ripple unblur interaction
 * 2. Mandatory unblur requirement on Card 0 before allowing skip/next
 * 3. Free skipping on Card 1 and Card 2 (caption only shows if clarified)
 * 4. Persistent clarification state across next/prev navigation
 * 5. Distinct touch zones without overlapping center card tap area
 */
export class MemoryGallery {
  constructor(options = {}) {
    this.container = options.container || null;
    this.navContainer = options.navContainer || null;
    this.onFinish = options.onFinish || (() => {});

    this.cards = [];
    this.currentIndex = 0;
    this.isNavigating = false;
    this.isFinished = false;
    this.cardIdleInterval = null;

    // Gesture tracking state
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchDeltaX = 0;
    this.isSwiping = false;

    // Bound listeners for cleanup
    this.handlePrevClick = null;
    this.handleNextClick = null;
    this.handlePrevMouseEnter = null;
    this.handlePrevMouseLeave = null;
    this.handleNextMouseEnter = null;
    this.handleNextMouseLeave = null;
    this.handleTouchStart = null;
    this.handleTouchMove = null;
    this.handleTouchEnd = null;
    this.handleKeyDown = null;
  }

  mount() {
    if (!this.container) return;

    this.cards = STORY_CONTENT.phase2.memories.map((mem, index) => {
      return new MemoryCard({
        index: index,
        container: this.container,
        imageSrc: mem.imageSrc,
        caption: mem.caption,
        captionSecondary: mem.captionSecondary,
        aspectRatio: '4 / 5',
        onClarified: (idx) => this.handleCardClarified(idx),
      });
    });

    this.cards.forEach(card => card.render());
    this.bindNavigation();
  }

  handleCardClarified(idx) {
    if (idx === 0) {
      // Unlock navigation for the 1st card
      this.updateNavZones();

      // Gentle glow pulse on the next button to indicate it's now unlocked
      const btnNext = this.navContainer ? this.navContainer.querySelector('#p2-nav-next') : null;
      if (btnNext) {
        btnNext.classList.add('is-unlocked-pulse');
        setTimeout(() => {
          if (btnNext) btnNext.classList.remove('is-unlocked-pulse');
        }, 1200);
      }
    }
  }

  bindNavigation() {
    const btnPrev = this.navContainer ? this.navContainer.querySelector('#p2-nav-prev') : null;
    const btnNext = this.navContainer ? this.navContainer.querySelector('#p2-nav-next') : null;

    // 1. Click on Left / Right Navigation Zones
    if (btnPrev) {
      this.handlePrevClick = (e) => {
        e.stopPropagation();
        this.stopCardIdleTimer();
        this.prevCard();
      };
      this.handlePrevMouseEnter = () => {
        if (this.isNavigating || this.isFinished || this.currentIndex <= 0) return;
        const card = this.cards[this.currentIndex];
        if (card) card.setHoverState('left');
      };
      this.handlePrevMouseLeave = () => {
        const card = this.cards[this.currentIndex];
        if (card) card.setHoverState(null);
      };

      btnPrev.addEventListener('click', this.handlePrevClick);
      btnPrev.addEventListener('mouseenter', this.handlePrevMouseEnter);
      btnPrev.addEventListener('mouseleave', this.handlePrevMouseLeave);
    }

    if (btnNext) {
      this.handleNextClick = (e) => {
        e.stopPropagation();
        this.stopCardIdleTimer();
        this.nextCard();
      };
      this.handleNextMouseEnter = () => {
        if (this.isNavigating || this.isFinished) return;
        if (this.currentIndex === 0 && !this.cards[0].isClarified) return;
        const card = this.cards[this.currentIndex];
        if (card) card.setHoverState('right');
      };
      this.handleNextMouseLeave = () => {
        const card = this.cards[this.currentIndex];
        if (card) card.setHoverState(null);
      };

      btnNext.addEventListener('click', this.handleNextClick);
      btnNext.addEventListener('mouseenter', this.handleNextMouseEnter);
      btnNext.addEventListener('mouseleave', this.handleNextMouseLeave);
    }

    // 2. Touch Swipe Gestures
    this.handleTouchStart = (e) => {
      if (this.isNavigating || this.isFinished) return;
      this.stopCardIdleTimer();
      const touch = e.touches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchDeltaX = 0;
      this.isSwiping = true;
    };

    this.handleTouchMove = (e) => {
      if (!this.isSwiping || this.isNavigating || this.isFinished) return;
      const touch = e.touches[0];
      this.touchDeltaX = touch.clientX - this.touchStartX;
      const deltaY = touch.clientY - this.touchStartY;

      // Allow vertical page scroll if predominantly vertical
      if (Math.abs(deltaY) > Math.abs(this.touchDeltaX) * 1.5) {
        return;
      }

      const activeCard = this.cards[this.currentIndex];
      if (activeCard) {
        // If on card 0 and not yet clarified, resist left swipe
        if (this.currentIndex === 0 && !activeCard.isClarified && this.touchDeltaX < 0) {
          activeCard.setLiveDragOffset(this.touchDeltaX * 0.25);
        } else {
          activeCard.setLiveDragOffset(this.touchDeltaX);
        }
      }
    };

    this.handleTouchEnd = () => {
      if (!this.isSwiping || this.isNavigating || this.isFinished) return;
      this.isSwiping = false;

      const activeCard = this.cards[this.currentIndex];
      const threshold = 35;

      if (this.touchDeltaX < -threshold) {
        // Swipe Left -> Next Card (checks validation in nextCard)
        this.nextCard();
      } else if (this.touchDeltaX > threshold) {
        // Swipe Right -> Prev Card
        this.prevCard();
      } else if (activeCard) {
        activeCard.resetLiveDrag();
      }
      this.touchDeltaX = 0;
    };

    window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    window.addEventListener('touchend', this.handleTouchEnd, { passive: true });

    // 3. Keyboard Arrow Navigation
    this.handleKeyDown = (e) => {
      if (this.isNavigating || this.isFinished) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        this.stopCardIdleTimer();
        this.nextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.stopCardIdleTimer();
        this.prevCard();
      }
    };
    window.addEventListener('keydown', this.handleKeyDown);
  }

  async revealFirstCard() {
    if (this.cards.length === 0) return;

    if (this.navContainer) {
      this.navContainer.classList.add('is-active');
      this.navContainer.style.visibility = 'visible';
      this.navContainer.style.pointerEvents = 'auto';
    }

    await this.cards[0].initialEnter();
    this.updateNavZones();
    this.startCardIdleTimer();
  }

  startCardIdleTimer() {
    this.stopCardIdleTimer();
    this.cardIdleInterval = setInterval(() => {
      if (this.isNavigating || this.isFinished) return;
      if (this.currentIndex === 0 && !this.cards[0].isClarified) {
        // On card 0, pulse clarify cue if user is idle
        if (this.cards[0]) this.cards[0].pulseClarifyCue();
        return;
      }
      if (this.cards[this.currentIndex]) {
        this.cards[this.currentIndex].playIdlePeekCue('right');
      }
    }, 4800);
  }

  stopCardIdleTimer() {
    if (this.cardIdleInterval) {
      clearInterval(this.cardIdleInterval);
      this.cardIdleInterval = null;
    }
  }

  updateNavZones() {
    const btnPrev = this.navContainer ? this.navContainer.querySelector('#p2-nav-prev') : null;
    const btnNext = this.navContainer ? this.navContainer.querySelector('#p2-nav-next') : null;

    if (btnPrev) {
      if (this.currentIndex === 0) {
        btnPrev.classList.add('is-disabled');
      } else {
        btnPrev.classList.remove('is-disabled');
      }
    }

    if (btnNext) {
      if (this.currentIndex === 0) {
        if (!this.cards[0].isClarified) {
          btnNext.classList.add('is-locked', 'is-disabled');
          btnNext.setAttribute('aria-disabled', 'true');
          btnNext.setAttribute('title', 'Ketuk foto untuk menjernihkan ingatan terlebih dahulu');
        } else {
          btnNext.classList.remove('is-locked', 'is-disabled', 'is-final');
          btnNext.removeAttribute('aria-disabled');
          btnNext.removeAttribute('title');
        }
      } else if (this.currentIndex >= this.cards.length - 1) {
        btnNext.classList.remove('is-locked', 'is-disabled');
        btnNext.classList.add('is-final');
        btnNext.removeAttribute('aria-disabled');
        btnNext.removeAttribute('title');
      } else {
        btnNext.classList.remove('is-locked', 'is-disabled', 'is-final');
        btnNext.removeAttribute('aria-disabled');
        btnNext.removeAttribute('title');
      }
    }
  }

  async nextCard() {
    if (this.isNavigating || this.isFinished) return;
    this.stopCardIdleTimer();

    const currCard = this.cards[this.currentIndex];

    // Card 0 constraint: User MUST unblur before proceeding!
    if (this.currentIndex === 0 && !currCard.isClarified) {
      currCard.resetLiveDrag();
      currCard.pulseClarifyCue();
      return;
    }

    // If on the 3rd/last card, advance out of photos to blooming flower
    if (this.currentIndex >= this.cards.length - 1) {
      this.isFinished = true;
      this.isNavigating = true;
      audioManager.playPaperRustle(0.35);

      if (currCard) {
        await currCard.dismissFinal();
      }
      this.disableNavZones();
      this.onFinish();
      return;
    }

    this.isNavigating = true;
    audioManager.playPaperRustle(0.35);

    const nextIdx = this.currentIndex + 1;
    const nextCard = this.cards[nextIdx];

    currCard.shuffleLeftToBack(0.75);
    if (nextCard) {
      await nextCard.emergeRightToFront(0.75);
    }

    this.currentIndex = nextIdx;
    this.updateNavZones();
    this.isNavigating = false;
    this.startCardIdleTimer();
  }

  async prevCard() {
    if (this.isNavigating || this.isFinished || this.currentIndex <= 0) return;
    this.stopCardIdleTimer();
    this.isNavigating = true;

    audioManager.playPaperRustle(0.35);

    const prevIdx = this.currentIndex - 1;
    const prevCard = this.cards[prevIdx];
    const currCard = this.cards[this.currentIndex];

    if (currCard) {
      currCard.shuffleRightToBack(0.75);
    }
    if (prevCard) {
      await prevCard.emergeLeftToFront(0.75);
    }

    this.currentIndex = prevIdx;
    this.updateNavZones();
    this.isNavigating = false;
    this.startCardIdleTimer();
  }

  disableNavZones() {
    if (this.navContainer) {
      this.navContainer.classList.remove('is-active');
      this.navContainer.style.pointerEvents = 'none';
      this.navContainer.style.visibility = 'hidden';
    }
  }

  destroy() {
    this.stopCardIdleTimer();

    const btnPrev = this.navContainer ? this.navContainer.querySelector('#p2-nav-prev') : null;
    const btnNext = this.navContainer ? this.navContainer.querySelector('#p2-nav-next') : null;

    if (btnPrev && this.handlePrevClick) {
      btnPrev.removeEventListener('click', this.handlePrevClick);
      btnPrev.removeEventListener('mouseenter', this.handlePrevMouseEnter);
      btnPrev.removeEventListener('mouseleave', this.handlePrevMouseLeave);
    }
    if (btnNext && this.handleNextClick) {
      btnNext.removeEventListener('click', this.handleNextClick);
      btnNext.removeEventListener('mouseenter', this.handleNextMouseEnter);
      btnNext.removeEventListener('mouseleave', this.handleNextMouseLeave);
    }

    if (this.handleTouchStart) {
      window.removeEventListener('touchstart', this.handleTouchStart);
      window.removeEventListener('touchmove', this.handleTouchMove);
      window.removeEventListener('touchend', this.handleTouchEnd);
    }

    if (this.handleKeyDown) {
      window.removeEventListener('keydown', this.handleKeyDown);
    }

    this.cards.forEach(card => card.destroy());
    this.cards = [];
  }
}

export default MemoryGallery;
