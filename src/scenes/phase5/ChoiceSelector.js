import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';
import { STORY_CONTENT } from '../../data/storyContent.js';

/**
 * ChoiceSelector Sub-Component (Phase 5)
 * Manages the 3 interactive choice cards, modal confirmation overlay,
 * locking during introductory thoughts, and choice selection events.
 */
export class ChoiceSelector {
  constructor(options = {}) {
    this.container = options.container || null;
    this.modalOverlay = options.modalOverlay || null;
    this.onHoverChange = options.onHoverChange || (() => {});
    this.onChoiceConfirmed = options.onChoiceConfirmed || (() => {});

    this.choiceLocked = true;
    this.pendingChoice = null;
    this.activeTimelines = [];

    this.handleChoiceClick = null;
    this.handleChoiceMouseEnter = null;
    this.handleChoiceMouseLeave = null;
    this.handleConfirmClick = null;
    this.handleCancelClick = null;
  }

  mount() {
    this.bindEvents();
  }

  bindEvents() {
    if (!this.container) return;
    const choiceButtons = this.container.querySelectorAll('.p5-choice-btn, .p5-choice-card');
    const confirmBtn = this.modalOverlay ? this.modalOverlay.querySelector('#p5-btn-confirm') : null;
    const cancelBtn = this.modalOverlay ? this.modalOverlay.querySelector('#p5-btn-cancel') : null;

    // 1. Choice Card Click / Tap
    this.handleChoiceClick = (e) => {
      if (this.choiceLocked) return;
      const btn = e.currentTarget;
      const choice = btn.getAttribute('data-choice');
      if (choice) {
        audioManager.playClick(1.05, 0.28);
        this.showConfirmModal(choice);
      }
    };

    // 2. Choice Hover Expressions
    this.handleChoiceMouseEnter = (e) => {
      if (this.choiceLocked || this.pendingChoice) return;
      const choice = e.currentTarget.getAttribute('data-choice');
      this.onHoverChange(choice);
    };

    this.handleChoiceMouseLeave = () => {
      if (this.choiceLocked || this.pendingChoice) return;
      this.onHoverChange(null);
    };

    choiceButtons.forEach(btn => {
      btn.addEventListener('click', this.handleChoiceClick);
      btn.addEventListener('mouseenter', this.handleChoiceMouseEnter);
      btn.addEventListener('mouseleave', this.handleChoiceMouseLeave);
    });

    // 3. Modal Confirm Action
    this.handleConfirmClick = () => {
      if (this.choiceLocked || !this.pendingChoice) return;
      const chosen = this.pendingChoice;
      this.onChoiceConfirmed(chosen);
    };

    if (confirmBtn) {
      confirmBtn.addEventListener('click', this.handleConfirmClick);
    }

    // 4. Modal Cancel Action
    this.handleCancelClick = () => {
      if (this.choiceLocked) return;
      audioManager.playClick(0.9, 0.22);
      this.hideConfirmModal();
    };

    if (cancelBtn) {
      cancelBtn.addEventListener('click', this.handleCancelClick);
    }
  }

  async revealChoices() {
    if (!this.container) return;
    const choiceCards = this.container.querySelectorAll('.p5-choice-btn, .p5-choice-card');

    this.container.classList.add('is-visible');
    this.container.style.visibility = 'visible';

    const choicesTl = gsap.timeline({
      onComplete: () => {
        this.container.style.pointerEvents = 'auto';
        this.choiceLocked = false;
      },
    });
    this.activeTimelines.push(choicesTl);

    choicesTl
      .to(this.container, { opacity: 1, duration: 0.6 })
      .fromTo(
        choiceCards,
        { opacity: 0, y: 35, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.16, duration: 1.2, ease: 'power2.out' },
        0
      );
  }

  showConfirmModal(choiceKey) {
    if (!this.modalOverlay) return;
    this.pendingChoice = choiceKey;
    const choiceData = STORY_CONTENT.phase5.choices[choiceKey];
    if (!choiceData) return;

    const modal = this.modalOverlay.querySelector('#p5-confirm-modal');
    const badge = this.modalOverlay.querySelector('#p5-confirm-badge');
    const question = this.modalOverlay.querySelector('#p5-confirm-question');
    const explanation = this.modalOverlay.querySelector('#p5-confirm-explanation');

    if (badge) badge.textContent = choiceData.confirmBadge;
    if (question) question.textContent = choiceData.confirmQuestion;
    if (explanation) explanation.textContent = choiceData.confirmExplanation;

    this.modalOverlay.classList.add('is-active', 'is-open');
    this.modalOverlay.style.visibility = 'visible';
    this.modalOverlay.style.pointerEvents = 'auto';
    this.modalOverlay.style.opacity = '1';

    if (modal) {
      gsap.fromTo(
        modal,
        { scale: 0.88, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }

  hideConfirmModal() {
    if (!this.modalOverlay) return;
    this.pendingChoice = null;
    const modal = this.modalOverlay.querySelector('#p5-confirm-modal');

    if (modal) {
      gsap.to(modal, {
        scale: 0.92,
        opacity: 0,
        y: 15,
        duration: 0.35,
        ease: 'power2.in',
        onComplete: () => {
          this.modalOverlay.classList.remove('is-active', 'is-open');
          this.modalOverlay.style.visibility = 'hidden';
          this.modalOverlay.style.pointerEvents = 'none';
          this.modalOverlay.style.opacity = '0';
        },
      });
    } else {
      this.modalOverlay.classList.remove('is-active', 'is-open');
      this.modalOverlay.style.visibility = 'hidden';
      this.modalOverlay.style.pointerEvents = 'none';
      this.modalOverlay.style.opacity = '0';
    }
  }

  lockAndDismiss() {
    this.choiceLocked = true;
    if (this.modalOverlay) {
      gsap.to(this.modalOverlay, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.in',
        onComplete: () => {
          this.modalOverlay.classList.remove('is-active', 'is-open');
          this.modalOverlay.style.visibility = 'hidden';
          this.modalOverlay.style.pointerEvents = 'none';
          this.modalOverlay.style.opacity = '0';
        },
      });
    }

    if (this.container) {
      gsap.to(this.container, {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          this.container.style.visibility = 'hidden';
          this.container.style.pointerEvents = 'none';
        },
      });
    }
  }

  destroy() {
    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    const choiceButtons = this.container ? this.container.querySelectorAll('.p5-choice-btn, .p5-choice-card') : [];
    choiceButtons.forEach(btn => {
      if (this.handleChoiceClick) btn.removeEventListener('click', this.handleChoiceClick);
      if (this.handleChoiceMouseEnter) btn.removeEventListener('mouseenter', this.handleChoiceMouseEnter);
      if (this.handleChoiceMouseLeave) btn.removeEventListener('mouseleave', this.handleChoiceMouseLeave);
    });

    const confirmBtn = this.modalOverlay ? this.modalOverlay.querySelector('#p5-btn-confirm') : null;
    const cancelBtn = this.modalOverlay ? this.modalOverlay.querySelector('#p5-btn-cancel') : null;

    if (confirmBtn && this.handleConfirmClick) confirmBtn.removeEventListener('click', this.handleConfirmClick);
    if (cancelBtn && this.handleCancelClick) cancelBtn.removeEventListener('click', this.handleCancelClick);
  }
}

export default ChoiceSelector;
