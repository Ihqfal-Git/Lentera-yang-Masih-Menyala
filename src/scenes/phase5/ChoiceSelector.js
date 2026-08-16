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
    const btn1 = this.container.querySelector('.choice-reconcile');
    const btn2 = this.container.querySelector('.choice-wait');
    const btn3 = this.container.querySelector('.choice-farewell');

    this.container.style.display = '';
    this.container.classList.add('is-visible');
    this.container.style.visibility = 'visible';

    const choicesTl = gsap.timeline({
      onComplete: () => {
        this.container.style.pointerEvents = 'auto';
        this.choiceLocked = false;
      },
    });
    this.activeTimelines.push(choicesTl);

    choicesTl.to(this.container, { opacity: 1, duration: 0.4 });

    if (btn1) {
      choicesTl.fromTo(
        btn1,
        { opacity: 0, scale: 0.92, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        0
      );
    }
    if (btn2) {
      choicesTl.fromTo(
        btn2,
        { opacity: 0, scale: 0.92, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        0.08
      );
    }
    if (btn3) {
      choicesTl.fromTo(
        btn3,
        { opacity: 0, scale: 0.92, y: 10 },
        { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        0.16
      );
    }
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

    this.modalOverlay.style.display = '';
    this.modalOverlay.classList.add('is-active', 'is-open');
    this.modalOverlay.style.visibility = 'visible';
    this.modalOverlay.style.pointerEvents = 'auto';
    this.modalOverlay.style.opacity = '1';

    if (modal) {
      gsap.killTweensOf(modal);
      gsap.fromTo(
        modal,
        { scale: 0.94, opacity: 0, y: 12 },
        { scale: 1, opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' }
      );
    }
  }

  hideConfirmModal() {
    if (!this.modalOverlay) return;
    this.pendingChoice = null;
    const modal = this.modalOverlay.querySelector('#p5-confirm-modal');

    if (modal) {
      gsap.killTweensOf(modal);
      gsap.to(modal, {
        scale: 0.94,
        opacity: 0,
        y: 8,
        duration: 0.18,
        ease: 'power1.in',
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
        duration: 0.22,
        ease: 'power1.out',
        onComplete: () => {
          this.modalOverlay.classList.remove('is-active', 'is-open');
          this.modalOverlay.style.visibility = 'hidden';
          this.modalOverlay.style.display = 'none';
          this.modalOverlay.style.pointerEvents = 'none';
          this.modalOverlay.style.opacity = '0';
        },
      });
    }

    if (this.container) {
      gsap.to(this.container, {
        opacity: 0,
        y: 10,
        duration: 0.22,
        ease: 'power1.out',
        onComplete: () => {
          this.container.style.visibility = 'hidden';
          this.container.style.display = 'none';
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
