import gsap from 'gsap';
import { Typewriter } from '../../utils/typewriter.js';
import { STORY_CONTENT } from '../../data/storyContent.js';
import { audioManager } from '../../audio/audioManager.js';

/**
 * EndingCredits Sub-Component (Phase 5 Epilogue)
 * Manages epilogue presentation, poetic credits lines, view lyrics option, and replay interaction.
 * - Ending 1 & 2: Replay button restarts the story cleanly.
 * - Ending 3 ("Lepaskan"): Replay is poetically locked; tapping reveals a tender literary reflection toast.
 */
export class EndingCredits {
  constructor(options = {}) {
    this.container = options.container || null;
    this.onReplay = options.onReplay || (() => {});
    this.onViewLyrics = options.onViewLyrics || (() => {});
    this.currentChoiceKey = null;
    this.activeTimelines = [];
    this.timeouts = [];
    this.noticeTimeout = null;
    this.handleReplayClick = null;
    this.handleViewLyricsClick = null;
  }

  mount() {
    this.bindEvents();
  }

  bindEvents() {
    const replayBtn = this.container ? this.container.querySelector('#p5-replay-btn') : null;
    const viewLyricsBtn = this.container ? this.container.querySelector('#p5-view-lyrics-btn') : null;
    const noticeEl = this.container ? this.container.querySelector('#p5-farewell-notice') : null;
    const noticeText = this.container ? this.container.querySelector('#p5-notice-text') : null;

    if (replayBtn) {
      this.handleReplayClick = (e) => {
        if (e) e.stopPropagation();

        // 1. Ending 3 ("Lepaskan"): Replay is locked with a gentle poetic reflection
        if (this.currentChoiceKey === 'farewell') {
          audioManager.playClick(0.85, 0.2);

          // Gentle tactile nudge
          gsap.fromTo(
            replayBtn,
            { x: -4 },
            { x: 4, duration: 0.08, repeat: 3, yoyo: true, ease: 'sine.inOut', onComplete: () => gsap.set(replayBtn, { x: 0 }) }
          );

          if (noticeEl) {
            const msg = STORY_CONTENT.phase5.choices.farewell.replayNotice ||
                        STORY_CONTENT.phase5.credits.farewellReplayNotice ||
                        'Ada akhir yang tak bisa diulang kembali, cukup diingat dengan penuh keikhlasan.';
            if (noticeText) noticeText.textContent = msg;

            gsap.killTweensOf(noticeEl);
            noticeEl.style.visibility = 'visible';
            gsap.fromTo(
              noticeEl,
              { opacity: 0, y: 10, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power2.out' }
            );

            if (this.noticeTimeout) clearTimeout(this.noticeTimeout);
            this.noticeTimeout = setTimeout(() => {
              gsap.to(noticeEl, {
                opacity: 0,
                y: -6,
                duration: 0.8,
                ease: 'power2.in',
                onComplete: () => {
                  noticeEl.style.visibility = 'hidden';
                },
              });
            }, 3800);
          }
          return;
        }

        // 2. Normal replay for Ending 1 ("Bicara Kembali") & Ending 2 ("Beri Waktu")
        replayBtn.style.pointerEvents = 'none';
        gsap.to(replayBtn, { opacity: 0.5, scale: 0.95, duration: 0.2 });
        this.onReplay();
      };
      replayBtn.addEventListener('click', this.handleReplayClick);
    }

    if (viewLyricsBtn) {
      this.handleViewLyricsClick = (e) => {
        if (e) e.stopPropagation();
        viewLyricsBtn.style.pointerEvents = 'none';
        gsap.to(viewLyricsBtn, { opacity: 0.6, scale: 0.95, duration: 0.2 });
        this.onViewLyrics();
      };
      viewLyricsBtn.addEventListener('click', this.handleViewLyricsClick);
    }
  }

  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  async revealCredits(choiceKey) {
    if (!this.container) return;
    this.currentChoiceKey = choiceKey;

    const content = STORY_CONTENT.phase5;
    const creditsStage = this.container;
    const credTitle = creditsStage.querySelector('#p5-cred-title');
    const credSub = creditsStage.querySelector('#p5-cred-sub');
    const credLine1 = creditsStage.querySelector('#p5-cred-line1');
    const credLine2 = creditsStage.querySelector('#p5-cred-line2');
    const credLine3 = creditsStage.querySelector('#p5-cred-line3');
    const waBtn = creditsStage.querySelector('#p5-whatsapp-btn');
    const viewLyricsBtn = creditsStage.querySelector('#p5-view-lyrics-btn');
    const replayBtn = creditsStage.querySelector('#p5-replay-btn');
    const noticeEl = creditsStage.querySelector('#p5-farewell-notice');

    // Reset epilogue lines, notice, and buttons for clean reveal
    if (credLine1) { credLine1.textContent = ''; gsap.set(credLine1, { opacity: 0 }); }
    if (credLine2) { credLine2.textContent = ''; gsap.set(credLine2, { opacity: 0 }); }
    if (credLine3) { credLine3.textContent = ''; gsap.set(credLine3, { opacity: 0 }); }
    if (noticeEl) {
      gsap.killTweensOf(noticeEl);
      noticeEl.style.visibility = 'hidden';
      noticeEl.style.opacity = '0';
    }
    
    // Configure WhatsApp URL with choice-specific draft message
    if (waBtn) {
      const waConfig = content.credits.whatsapp;
      if (waConfig && waConfig.enabled !== false) {
        const rawPhone = (waConfig.phoneNumber || '').replace(/[^0-9]/g, '');
        const draft = waConfig.draftMessages?.[choiceKey] || `Hai, aku telah memilih langkah: ${choiceKey}`;
        const waUrl = rawPhone ? `https://wa.me/${rawPhone}?text=${encodeURIComponent(draft)}` : `https://wa.me/?text=${encodeURIComponent(draft)}`;
        waBtn.href = waUrl;

        const waBtnText = waBtn.querySelector('#p5-whatsapp-btn-text');
        if (waBtnText) {
          const choiceLabels = {
            reconcile: 'Sampaikan: Bicara Kembali',
            wait: 'Sampaikan: Beri Waktu',
            farewell: 'Sampaikan: Lepaskan',
          };
          waBtnText.textContent = choiceLabels[choiceKey] || waConfig.buttonLabel || 'Nyatakan Pilihanmu';
        }

        waBtn.style.display = 'inline-flex';
        gsap.set(waBtn, { opacity: 0, y: 15, scale: 0.95 });
        waBtn.style.pointerEvents = 'auto';
      } else {
        waBtn.style.display = 'none';
      }
    }

    if (viewLyricsBtn) {
      gsap.set(viewLyricsBtn, { opacity: 0, y: 15, scale: 0.95 });
      viewLyricsBtn.style.pointerEvents = 'auto';
    }
    if (replayBtn) {
      gsap.set(replayBtn, { opacity: 0, y: 15, scale: 0.95 });
      replayBtn.style.pointerEvents = 'auto';
    }

    creditsStage.classList.add('is-visible', 'is-interactive');
    creditsStage.style.visibility = 'visible';
    creditsStage.style.pointerEvents = 'auto';

    // 1. Smoothly fade in credits stage overlay
    gsap.to(creditsStage, { opacity: 1, duration: 1.4, ease: 'power2.out' });

    // 2. Title & Subtitle Fade In
    const titleTl = gsap.timeline();
    this.activeTimelines.push(titleTl);

    titleTl
      .fromTo(credTitle, { opacity: 0, y: -16, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.6, ease: 'power2.out' })
      .fromTo(credSub, { opacity: 0, y: 8 }, { opacity: 0.85, y: 0, duration: 1.2, ease: 'power2.out' }, '-=0.6');

    await this.wait(1400);

    // 3. Dynamic 3-line Credit Epilogue tailored to the chosen ending
    const choiceEndingNarrative = content.choices[choiceKey]?.endingNarratives?.[0];
    const textLine1 = choiceEndingNarrative?.line1 || content.credits.line1;
    const textLine2 = choiceEndingNarrative?.line2 || content.credits.line2;
    const textLine3 = content.credits.line3;

    if (credLine1 && textLine1) {
      await Typewriter.type(credLine1, textLine1, { speed: 38 });
      await this.wait(500);
    }

    if (credLine2 && textLine2) {
      await Typewriter.type(credLine2, textLine2, { speed: 36 });
      await this.wait(500);
    }

    if (credLine3 && textLine3) {
      await Typewriter.type(credLine3, textLine3, { speed: 36 });
      await this.wait(900);
    }

    // 4. Action Buttons Fade In (WhatsApp, View Lyrics & Replay)
    const actionBtns = [waBtn, viewLyricsBtn, replayBtn].filter(btn => btn && btn.style.display !== 'none');
    if (actionBtns.length > 0) {
      gsap.fromTo(
        actionBtns,
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1.0, stagger: 0.16, ease: 'power2.out' }
      );
    }
  }

  async hide() {
    if (!this.container) return;
    await new Promise(resolve => {
      gsap.to(this.container, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.in',
        onComplete: () => {
          this.container.classList.remove('is-visible', 'is-interactive');
          this.container.style.visibility = 'hidden';
          this.container.style.pointerEvents = 'none';
          resolve();
        },
      });
    });
  }

  destroy() {
    if (this.noticeTimeout) {
      clearTimeout(this.noticeTimeout);
      this.noticeTimeout = null;
    }

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    const replayBtn = this.container ? this.container.querySelector('#p5-replay-btn') : null;
    if (replayBtn && this.handleReplayClick) {
      replayBtn.removeEventListener('click', this.handleReplayClick);
    }

    const viewLyricsBtn = this.container ? this.container.querySelector('#p5-view-lyrics-btn') : null;
    if (viewLyricsBtn && this.handleViewLyricsClick) {
      viewLyricsBtn.removeEventListener('click', this.handleViewLyricsClick);
    }

    if (this.container) {
      this.container.classList.remove('is-visible', 'is-interactive');
      this.container.style.visibility = 'hidden';
      this.container.style.opacity = '0';
      this.container.style.pointerEvents = 'none';
    }
  }
}

export default EndingCredits;
