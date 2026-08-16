import gsap from 'gsap';
import { sceneManager } from '../core/sceneManager.js';
import { transitionManager } from '../core/transitionManager.js';
import { audioManager } from '../audio/audioManager.js';
import { Heart } from '../components/Heart.js';
import { Butterfly } from '../components/Butterfly.js';
import { STORY_CONTENT } from '../data/storyContent.js';
import { Typewriter } from '../utils/typewriter.js';

import { ChoiceSelector } from './phase5/ChoiceSelector.js';
import { SongLyricsPlayer } from './phase5/SongLyricsPlayer.js';
import { EndingCredits } from './phase5/EndingCredits.js';

/**
 * Phase 5 — The Choice & Endings ("Ke Mana Kita Membawa Langkah Ini?")
 * Orchestrates:
 * 1. Intro sequence: Heart focal spotlight & 3 opening reflective lines
 * 2. Choice Selection (ChoiceSelector)
 * 3. Choice Realization: Heart metamorphosis, atmosphere morphing, butterfly motion
 * 4. Synchronized Song Lyrics (SongLyricsPlayer)
 * 5. Epilogue Credits & Replay (EndingCredits)
 */
export class Phase5Scene {
  constructor() {
    this.element = null;
    this.stage = null;
    this.butterfly = null;
    this.heart = null;

    this.choiceSelector = null;
    this.lyricsPlayer = null;
    this.endingCredits = null;

    this.currentChoice = null;
    this.activeTimelines = [];
    this.timeouts = [];

    this.interactionClicks = 0;
    this.maxInteractionClicks = 5;
    this.endingInteracted = false;
    this.reconcileClickHandler = null;
    this.waitButterflyClickHandler = null;
    this.farewellHeartClickHandler = null;
  }

  mount(container) {
    if (this.element) return this.element;
    this.stage = container;
    const content = STORY_CONTENT.phase5;

    const el = document.createElement('section');
    el.id = 'scene-phase5';
    el.className = 'scene scene-phase5';
    el.setAttribute('aria-label', content.meta);

    el.innerHTML = `
      <div class="p5-main-stage" id="p5-main-stage">
        <!-- 1. Opening Narrative & Prompt Text -->
        <div class="p5-narrative-box" id="p5-narrative-box">
          <p class="text-lyric" id="p5-nar-line" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); opacity: 0;"></p>
        </div>

        <!-- 2. Orbital Decision Arena (Heart in Center, Choices Surrounding) -->
        <div class="p5-decision-arena" id="p5-decision-arena">
          <!-- Heart Character & Spotlight Stage (Center) -->
          <div class="p5-heart-stage" id="p5-heart-stage">
            <div class="p5-heart-spotlight" id="p5-heart-spotlight"></div>
            <div id="p5-heart-wrap"></div>
          </div>

          <!-- Choices Group Surrounding Heart (Top-Left, Top-Right, Bottom) -->
          <div class="p5-choices-group" id="p5-choices-group" role="group" aria-label="Pilihan Arah Langkah">
            <!-- Pilihan 1: Kiri Atas Heart -->
            <button class="p5-choice-btn choice-reconcile pos-top-left" id="btn-choice-reconcile" data-choice="reconcile" aria-label="Pilih: ${content.choices.reconcile.title}" tabindex="0">
              <span class="p5-choice-num">I</span>
              <span class="p5-choice-title">${content.choices.reconcile.title}</span>
              <span class="p5-choice-spark">✦</span>
            </button>

            <!-- Pilihan 2: Kanan Atas Heart -->
            <button class="p5-choice-btn choice-wait pos-top-right" id="btn-choice-wait" data-choice="wait" aria-label="Pilih: ${content.choices.wait.title}" tabindex="0">
              <span class="p5-choice-num">II</span>
              <span class="p5-choice-title">${content.choices.wait.title}</span>
              <span class="p5-choice-spark">✦</span>
            </button>

            <!-- Pilihan 3: Bawah Heart -->
            <button class="p5-choice-btn choice-farewell pos-bottom-center" id="btn-choice-farewell" data-choice="farewell" aria-label="Pilih: ${content.choices.farewell.title}" tabindex="0">
              <span class="p5-choice-num">III</span>
              <span class="p5-choice-title">${content.choices.farewell.title}</span>
              <span class="p5-choice-spark">✦</span>
            </button>
          </div>
        </div>

        <!-- 3. Minimalist Aesthetic Confirmation Dialogue Overlay -->
        <div class="p5-confirm-overlay" id="p5-confirm-overlay" role="dialog" aria-modal="true" aria-labelledby="p5-confirm-question">
          <div class="p5-confirm-modal" id="p5-confirm-modal">
            <div class="p5-confirm-header">
              <span class="p5-confirm-ornament">✧</span>
              <div class="p5-confirm-choice-badge" id="p5-confirm-badge"></div>
              <span class="p5-confirm-ornament">✧</span>
            </div>
            <h3 class="p5-confirm-question" id="p5-confirm-question"></h3>
            <p class="p5-confirm-explanation" id="p5-confirm-explanation"></p>
            <div class="p5-confirm-actions">
              <button class="p5-btn-cancel" id="p5-btn-cancel" aria-label="Kembali memilih" tabindex="0">${content.btnCancel}</button>
              <button class="p5-btn-confirm" id="p5-btn-confirm" aria-label="Konfirmasi dan lanjutkan pilihan" tabindex="0">${content.btnConfirm}</button>
            </div>
          </div>
        </div>

        <!-- 5. Synchronized Song Lyrics Stage -->
        <div class="p5-lyrics-stage" id="p5-lyrics-stage">
          <div class="p5-song-badge" id="p5-song-badge" style="opacity: 0;">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 4px;">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span id="p5-song-title"></span>
          </div>
          <div class="p5-lyrics-box" id="p5-lyrics-box">
            <p class="p5-lyrics-line" id="p5-lyric-line1"></p>
            <p class="p5-lyrics-line secondary" id="p5-lyric-line2"></p>
          </div>

          <!-- 5-Dot Unique Tactile Interaction Progress -->
          <div class="p5-interact-progress" id="p5-interact-progress" style="opacity: 0;">
            <p class="p5-progress-hint" id="p5-progress-hint">Ketuk sembarang layar untuk memandu kupu-kupu</p>
            <div class="p5-progress-dots" id="p5-progress-dots">
              <span class="p5-progress-dot" data-index="0"></span>
              <span class="p5-progress-dot" data-index="1"></span>
              <span class="p5-progress-dot" data-index="2"></span>
              <span class="p5-progress-dot" data-index="3"></span>
              <span class="p5-progress-dot" data-index="4"></span>
            </div>
          </div>
        </div>

        <!-- 6. Ending Narrative Dialogue Stage -->
        <div class="p5-ending-stage" id="p5-ending-stage">
          <div class="p5-ending-box" id="p5-ending-box">
            <p class="text-lyric" id="p5-end-line1" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); opacity: 0;"></p>
            <p class="text-lyric" id="p5-end-line2" style="font-size: var(--text-lg); line-height: var(--leading-relaxed); margin-top: var(--space-md); opacity: 0;"></p>
          </div>
        </div>
      </div>

      <!-- 7. Epilogue Title, Credits & Replay Screen -->
      <div class="p5-credits-stage" id="p5-credits-stage" aria-label="Penutup dan Kredit Cerita">
        <h1 class="p5-credits-title-main" id="p5-cred-title">${content.credits.title}</h1>
        <p class="p5-credits-title-sub" id="p5-cred-sub">${content.credits.subtitle}</p>
        <div class="p5-credits-body" id="p5-credits-body">
          <p class="text-lyric" id="p5-cred-line1" style="font-size: var(--text-base); color: rgba(255,255,255,0.85); opacity: 0; margin-bottom: 0.8rem;"></p>
          <p class="text-lyric" id="p5-cred-line2" style="font-size: var(--text-base); color: rgba(255,255,255,0.85); opacity: 0; margin-bottom: 0.8rem;"></p>
          <p class="text-lyric" id="p5-cred-line3" style="font-size: var(--text-base); color: rgba(242,203,134,0.9); opacity: 0;"></p>
        </div>
        <div class="p5-credits-actions">
          <a class="p5-whatsapp-btn" id="p5-whatsapp-btn" href="#" target="_blank" rel="noopener noreferrer" aria-label="Kirim pilihan via WhatsApp" tabindex="0" style="opacity: 0;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm.01 1.67c2.2 0 4.26.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.42 0-2.82-.37-4.06-1.08l-.29-.17-3.12.82.83-3.04-.19-.3a8.217 8.217 0 0 1-1.26-4.46c0-4.54 3.7-8.24 8.24-8.24zm4.52 11.53c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.38-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.07-.1-.23-.17-.48-.29z"/>
            </svg>
            <span id="p5-whatsapp-btn-text">${content.credits.whatsapp?.buttonLabel || 'Kirim Pilihan ke WhatsApp'}</span>
          </a>
          <button class="p5-view-lyrics-btn" id="p5-view-lyrics-btn" aria-label="Dengarkan lirik lagu kembali" tabindex="0" style="opacity: 0;">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"></path>
              <circle cx="6" cy="18" r="3"></circle>
              <circle cx="18" cy="16" r="3"></circle>
            </svg>
            ${content.credits.viewLyricsButton || 'Dengarkan Lirik Lagi'}
          </button>
          <button class="p5-replay-btn" id="p5-replay-btn" aria-label="Mulai kembali dari awal" tabindex="0" style="opacity: 0;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            ${content.credits.replayButton}
          </button>
        </div>
        <!-- Ending 3 Replay Lock Poetic Toast Notice -->
        <div class="p5-farewell-notice" id="p5-farewell-notice" aria-live="polite" style="opacity: 0; visibility: hidden;">
          <span class="p5-notice-spark">✧</span>
          <span class="p5-notice-text" id="p5-notice-text">Ada akhir yang tak bisa diulang kembali, cukup diingat dengan penuh keikhlasan.</span>
          <span class="p5-notice-spark">✧</span>
        </div>
      </div>
    `;

    container.appendChild(el);
    this.element = el;

    // Sub-Components
    this.choiceSelector = new ChoiceSelector({
      container: this.element.querySelector('#p5-choices-group'),
      modalOverlay: this.element.querySelector('#p5-confirm-overlay'),
      onHoverChange: (choice) => this.handleChoiceHover(choice),
      onChoiceConfirmed: (choice) => this.handleChoiceConfirmed(choice),
    });
    this.choiceSelector.mount();

    this.lyricsPlayer = new SongLyricsPlayer({
      container: this.element.querySelector('#p5-lyrics-stage'),
    });
    this.lyricsPlayer.mount();

    this.endingCredits = new EndingCredits({
      container: this.element.querySelector('#p5-credits-stage'),
      onReplay: () => this.replayExperience(),
    });
    this.endingCredits.mount();

    return this.element;
  }

  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  handleChoiceHover(choice) {
    if (!this.heart) return;
    if (choice === 'reconcile') this.heart.setExpression('hopeful');
    else if (choice === 'wait') this.heart.setExpression('waiting');
    else if (choice === 'farewell') this.heart.setExpression('sad');
    else this.heart.setExpression('neutral');
  }

  async enter(data = {}) {
    if (this.element) {
      gsap.killTweensOf(this.element);
      this.element.classList.add('active');
      this.element.style.visibility = 'visible';
      this.element.style.opacity = '1';
      gsap.set(this.element, { opacity: 1, scale: 1, clearProps: 'filter' });
    }

    // 0. Smoothly fade out ambient music for solemn contemplative decision atmosphere
    audioManager.stopMusic(1400);

    this.currentChoice = null;

    const isMobile = window.innerWidth <= 600;
    const heartWrap = this.element.querySelector('#p5-heart-wrap');
    const narLine = this.element.querySelector('#p5-nar-line');
    const content = STORY_CONTENT.phase5;

    // Reset stages for clean replay loop
    const heartStage = this.element.querySelector('#p5-heart-stage');
    if (heartStage) {
      gsap.set(heartStage, { top: '50%' });
    }

    const choicesGroup = this.element.querySelector('#p5-choices-group');
    const confirmOverlay = this.element.querySelector('#p5-confirm-overlay');
    const lyricsStage = this.element.querySelector('#p5-lyrics-stage');
    const endingStage = this.element.querySelector('#p5-ending-stage');
    const creditsStage = this.element.querySelector('#p5-credits-stage');

    if (choicesGroup) {
      choicesGroup.classList.remove('is-visible');
      choicesGroup.style.visibility = 'hidden';
      choicesGroup.style.opacity = '0';
      choicesGroup.style.pointerEvents = 'none';
    }
    if (confirmOverlay) {
      confirmOverlay.classList.remove('is-active', 'is-open');
      confirmOverlay.style.visibility = 'hidden';
      confirmOverlay.style.opacity = '0';
      confirmOverlay.style.pointerEvents = 'none';
    }
    if (lyricsStage) {
      lyricsStage.classList.remove('is-active');
      lyricsStage.style.visibility = 'hidden';
      lyricsStage.style.opacity = '0';
    }
    if (endingStage) {
      endingStage.style.opacity = '0';
    }
    if (creditsStage) {
      creditsStage.classList.remove('is-visible', 'is-interactive');
      creditsStage.style.visibility = 'hidden';
      creditsStage.style.opacity = '0';
      creditsStage.style.pointerEvents = 'none';
    }

    this.cleanupEndingInteraction();
    const progressEl = this.element.querySelector('#p5-interact-progress');
    if (progressEl) {
      progressEl.style.opacity = '0';
      progressEl.style.visibility = 'hidden';
      const dots = progressEl.querySelectorAll('.p5-progress-dot');
      dots.forEach(d => d.classList.remove('is-filled'));
    }

    // Re-initialize Sub-Components for fresh playthrough
    if (this.choiceSelector) this.choiceSelector.destroy();
    this.choiceSelector = new ChoiceSelector({
      container: this.element.querySelector('#p5-choices-group'),
      modalOverlay: this.element.querySelector('#p5-confirm-overlay'),
      onHoverChange: (choice) => this.handleChoiceHover(choice),
      onChoiceConfirmed: (choice) => this.handleChoiceConfirmed(choice),
    });
    this.choiceSelector.mount();

    if (this.lyricsPlayer) this.lyricsPlayer.destroy();
    this.lyricsPlayer = new SongLyricsPlayer({
      container: this.element.querySelector('#p5-lyrics-stage'),
    });
    this.lyricsPlayer.mount();

    if (this.endingCredits) this.endingCredits.destroy();
    this.endingCredits = new EndingCredits({
      container: this.element.querySelector('#p5-credits-stage'),
      onReplay: () => this.replayExperience(),
      onViewLyrics: () => this.handleViewLyricsAgain(),
    });
    this.endingCredits.mount();

    // 1. Initialize Heart character
    if (heartWrap) {
      heartWrap.innerHTML = '';
      if (this.heart) this.heart.destroy();
      this.heart = new Heart({
        container: heartWrap,
        size: isMobile ? 120 : 140,
        enableFace: true,
      });
      this.heart.render();
      this.heart.setExpression('neutral');
    }

    // 2. Butterfly Guide entry
    if (data.butterfly) {
      this.butterfly = data.butterfly;
      this.butterfly.setFastFlap();
      this.butterfly.flyCurvedPath([
        { x: '50%', y: '9%', rotation: 0, duration: 2.0 },
      ]);
    } else {
      this.butterfly = new Butterfly({
        container: document.getElementById('globalActors') || this.stage,
      });
      await this.butterfly.emergeFrom('108%', '10%');
      await this.butterfly.flyCurvedPath([
        { x: '50%', y: '9%', rotation: 0, duration: 2.2 },
      ]);
    }
    this.butterfly.setRestingFlap();

    // 3. Opening Monologue Reflection
    const narBox = this.element.querySelector('#p5-narrative-box');
    if (narBox) {
      gsap.killTweensOf(narBox);
      narBox.style.visibility = 'visible';
      narBox.style.opacity = '1';
      gsap.set(narBox, { opacity: 1, y: 0 });
    }

    const lines = [
      content.openingThought1,
      content.openingThought2,
      content.promptQuestion,
    ].filter(Boolean);

    for (let i = 0; i < lines.length; i++) {
      if (narLine) {
        if (i > 0) {
          await new Promise(r => gsap.to(narLine, { opacity: 0, y: -6, duration: 0.4, onComplete: r }));
          await this.wait(250);
        }
        narLine.textContent = '';
        gsap.set(narLine, { opacity: 1, y: 0 });
        await Typewriter.type(narLine, lines[i], { speed: 38 });
        await this.wait(2200);
      }
    }

    // 4. Reveal Choices
    if (this.choiceSelector) {
      await this.choiceSelector.revealChoices();
    }
  }

  async handleChoiceConfirmed(choiceKey) {
    this.currentChoice = choiceKey;
    if (this.heart) {
      this.heart.pulse(choiceKey, true);
    }

    if (this.choiceSelector) {
      this.choiceSelector.lockAndDismiss();
    }

    // Narrative box fade out
    const narBox = this.element.querySelector('#p5-narrative-box');
    if (narBox) {
      gsap.to(narBox, { opacity: 0, duration: 0.6 });
    }

    // Smoothly animate Heart back up from center (50%) to upper position (14%) for all endings
    const heartStage = this.element.querySelector('#p5-heart-stage');
    const heartSpotlight = this.element.querySelector('#p5-heart-spotlight');
    if (heartStage) {
      const isMobile = window.innerWidth <= 600;
      await new Promise(resolve => {
        const tl = gsap.timeline({ onComplete: resolve });
        tl.to(heartStage, {
          top: isMobile ? '12%' : '14%',
          duration: 1.25,
          ease: 'power3.inOut',
        }, 0);
        if (heartSpotlight) {
          tl.to(heartSpotlight, {
            scale: 1.15,
            opacity: 0.9,
            duration: 1.25,
            ease: 'power3.inOut',
          }, 0);
        }
      });
    }

    // Setup the 5-dot unique tactile interaction
    this.setupEndingInteraction(choiceKey);

    // Execute choice realization
    if (choiceKey === 'reconcile') {
      await this.playReconcileEnding();
    } else if (choiceKey === 'wait') {
      await this.playWaitEnding();
    } else if (choiceKey === 'farewell') {
      await this.playFarewellEnding();
    }

    // Cleanup interaction listeners once ending concludes
    this.cleanupEndingInteraction();

    // Reveal Epilogue Credits
    if (this.endingCredits) {
      await this.endingCredits.revealCredits(choiceKey);
    }
  }

  setupEndingInteraction(choiceKey) {
    this.interactionClicks = 0;
    this.maxInteractionClicks = 5;
    this.endingInteracted = false;

    const progressEl = this.element ? this.element.querySelector('#p5-interact-progress') : null;
    const hintEl = this.element ? this.element.querySelector('#p5-progress-hint') : null;
    const dots = this.element ? this.element.querySelectorAll('.p5-progress-dot') : [];

    if (!progressEl) return;

    // Reset dots & theme
    dots.forEach(dot => {
      dot.classList.remove('is-filled');
    });

    progressEl.className = `p5-interact-progress theme-${choiceKey}`;
    progressEl.style.visibility = 'visible';

    // Hint description based on chosen ending
    let baseHint = 'Ketuk sembarang layar untuk memandu kupu-kupu';
    if (choiceKey === 'reconcile') {
      baseHint = 'Sentuh layar untuk memandu kupu-kupu';
    } else if (choiceKey === 'wait') {
      baseHint = 'Sentuh kupu-kupu yang beristirahat';
    } else if (choiceKey === 'farewell') {
      baseHint = 'Sentuh lentera hati untuk mengikhlaskan';
    }

    if (hintEl) {
      hintEl.textContent = baseHint;
      hintEl.classList.remove('is-cooling-down');
    }

    // Fade in progress bar
    gsap.fromTo(
      progressEl,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 1.0, delay: 0.6, ease: 'power2.out' }
    );

    this.cleanupEndingInteraction();
    this.isInteractionCoolingDown = false;

    const onDotClick = (e) => {
      if (this.endingInteracted || this.isInteractionCoolingDown) return;
      this.isInteractionCoolingDown = true;
      this.interactionClicks++;

      const dotIdx = this.interactionClicks - 1;
      if (dots[dotIdx]) {
        dots[dotIdx].classList.add('is-filled');
        gsap.fromTo(
          dots[dotIdx],
          { scale: 0.6 },
          { scale: 1.4, duration: 0.45, ease: 'back.out(2)' }
        );
      }

      // Temporary listening pause hint to encourage hearing the song
      if (hintEl) {
        hintEl.textContent = 'Dengarkan alunannya sejenak...';
        hintEl.classList.add('is-cooling-down');
      }

      if (this.interactionClicks >= this.maxInteractionClicks) {
        this.endingInteracted = true;
        this.cleanupEndingInteraction();

        // Allow final note & dot to resonate before transitioning to credits
        this.cooldownTimeout = setTimeout(() => {
          gsap.to(progressEl, {
            opacity: 0,
            y: -10,
            duration: 0.9,
            ease: 'power2.in',
            onComplete: () => {
              progressEl.style.visibility = 'hidden';
            },
          });

          if (this.lyricsPlayer) {
            this.lyricsPlayer.fadeOutStage();
          }
        }, 2800);
      } else {
        // Cooldown delay (3.0s) between each click so user takes time to listen to the song
        this.cooldownTimeout = setTimeout(() => {
          this.isInteractionCoolingDown = false;
          if (hintEl && !this.endingInteracted) {
            hintEl.classList.remove('is-cooling-down');
            hintEl.textContent = 'Sentuh kembali untuk melanjutkan';
          }
        }, 3000);
      }
    };

    // 1. Ending 1: Click anywhere on screen -> Butterfly flies to click coordinates
    if (choiceKey === 'reconcile') {
      this.reconcileClickHandler = (e) => {
        if (this.endingInteracted || this.isInteractionCoolingDown) return;
        if (e.target.closest('#p5-confirm-overlay') || e.target.closest('#p5-credits-stage')) return;

        const clickX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
        const clickY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

        if (this.butterfly) {
          this.butterfly.flyToTarget(clickX + 'px', clickY + 'px', 1.3);
        }
        audioManager.playClick(1.1, 0.2);
        onDotClick(e);
      };
      window.addEventListener('click', this.reconcileClickHandler);
    }

    // 2. Ending 2: Click on Butterfly -> Butterfly flies to random screen spots
    else if (choiceKey === 'wait') {
      if (this.butterfly && this.butterfly.element) {
        this.butterfly.element.classList.add('is-interactive', 'is-resting');
        this.butterfly.element.style.pointerEvents = 'auto';
        this.butterfly.element.style.cursor = 'pointer';
        this.butterfly.element.style.zIndex = '60';

        this.waitButterflyClickHandler = (e) => {
          if (e) e.stopPropagation();
          if (this.endingInteracted || this.isInteractionCoolingDown) return;

          const randomX = Math.floor(window.innerWidth * (0.15 + Math.random() * 0.70)) + 'px';
          const randomY = Math.floor(window.innerHeight * (0.15 + Math.random() * 0.50)) + 'px';

          this.butterfly.flyToTarget(randomX, randomY, 1.4).then(() => {
            if (this.butterfly && this.butterfly.element) {
              this.butterfly.element.classList.add('is-interactive', 'is-resting');
              this.butterfly.element.style.pointerEvents = 'auto';
              this.butterfly.element.style.cursor = 'pointer';
              this.butterfly.element.style.zIndex = '60';
            }
          });
          audioManager.playClick(1.15, 0.22);
          onDotClick(e);
        };

        this.butterfly.element.addEventListener('click', this.waitButterflyClickHandler);
      }
    }

    // 3. Ending 3: Click on Heart -> Heart pulses with radiating warmth
    else if (choiceKey === 'farewell') {
      const heartWrap = this.element.querySelector('#p5-heart-wrap') || (this.heart && this.heart.element);
      if (heartWrap) {
        heartWrap.style.pointerEvents = 'auto';
        heartWrap.style.cursor = 'pointer';

        this.farewellHeartClickHandler = (e) => {
          e.stopPropagation();
          if (this.endingInteracted || this.isInteractionCoolingDown) return;

          if (this.heart) {
            this.heart.pulse('farewell', true);
          }
          audioManager.playClick(1.0, 0.25);
          audioManager.playHeartbeat(0.32);
          onDotClick(e);
        };

        heartWrap.addEventListener('click', this.farewellHeartClickHandler);
      }
    }
  }

  cleanupEndingInteraction() {
    if (this.cooldownTimeout) {
      clearTimeout(this.cooldownTimeout);
      this.cooldownTimeout = null;
    }
    this.isInteractionCoolingDown = false;

    if (this.reconcileClickHandler) {
      window.removeEventListener('click', this.reconcileClickHandler);
      this.reconcileClickHandler = null;
    }
    if (this.butterfly && this.butterfly.element && this.waitButterflyClickHandler) {
      this.butterfly.element.removeEventListener('click', this.waitButterflyClickHandler);
      this.waitButterflyClickHandler = null;
    }
    const heartWrap = this.element ? this.element.querySelector('#p5-heart-wrap') : null;
    if (heartWrap && this.farewellHeartClickHandler) {
      heartWrap.removeEventListener('click', this.farewellHeartClickHandler);
      this.farewellHeartClickHandler = null;
    }
  }

  async playReconcileEnding() {
    transitionManager.changeSkyMood('dawn', 4.0);
    audioManager.playSong('reconcile', 1.0);

    if (this.heart) {
      this.heart.applyChoiceAnimation('reconcile');
    }

    if (this.butterfly) {
      this.butterfly.setFastFlap();
      this.butterfly.flyCurvedPath([
        { x: '42%', y: '32%', rotation: -15, duration: 1.8 },
        { x: '58%', y: '32%', rotation: 15, duration: 1.8 },
        { x: '50%', y: '26%', rotation: 0, duration: 1.6 },
      ]).then(() => {
        if (this.butterfly) this.butterfly.setRestingFlap();
      });
    }

    const choice = STORY_CONTENT.phase5.choices.reconcile;
    const lyricsData = choice.songLyrics || [];
    const lrcLyrics = choice.lrcLyrics || null;
    const songTitle = choice.songTrackName || '';
    if (this.lyricsPlayer) {
      await this.lyricsPlayer.playLyricsSequence(lyricsData, lrcLyrics, songTitle);
    }
  }

  async playWaitEnding() {
    transitionManager.changeSkyMood('night', 4.0);
    audioManager.playSong('wait', 1.0);

    if (this.heart) {
      this.heart.applyChoiceAnimation('wait');
    }

    if (this.butterfly) {
      this.butterfly.setFastFlap();
      this.butterfly.flyCurvedPath([
        { x: '68%', y: '28%', rotation: -8, duration: 2.6 },
      ]).then(() => {
        if (this.butterfly) {
          this.butterfly.setRestingFlap();
          if (this.butterfly.element) {
            this.butterfly.element.classList.add('is-interactive', 'is-resting');
            this.butterfly.element.style.pointerEvents = 'auto';
            this.butterfly.element.style.cursor = 'pointer';
            this.butterfly.element.style.zIndex = '60';
          }
        }
      });
    }

    const choice = STORY_CONTENT.phase5.choices.wait;
    const lyricsData = choice.songLyrics || [];
    const lrcLyrics = choice.lrcLyrics || null;
    const songTitle = choice.songTrackName || '';
    if (this.lyricsPlayer) {
      await this.lyricsPlayer.playLyricsSequence(lyricsData, lrcLyrics, songTitle);
    }
  }

  async playFarewellEnding() {
    transitionManager.changeSkyMood('desaturated', 4.5);
    audioManager.playSong('farewell', 1.0);

    if (this.heart) {
      this.heart.applyChoiceAnimation('farewell');
    }

    if (this.butterfly) {
      this.butterfly.setFastFlap();
      this.butterfly.flyAway('115%', '10%', 3.8);
    }

    const choice = STORY_CONTENT.phase5.choices.farewell;
    const lyricsData = choice.songLyrics || [];
    const lrcLyrics = choice.lrcLyrics || null;
    const songTitle = choice.songTrackName || '';
    if (this.lyricsPlayer) {
      await this.lyricsPlayer.playLyricsSequence(lyricsData, lrcLyrics, songTitle);
    }
  }

  async handleViewLyricsAgain() {
    if (!this.currentChoice) return;
    audioManager.playClick(1.0, 0.25);

    const choiceKey = this.currentChoice;
    const choice = STORY_CONTENT.phase5.choices[choiceKey];
    if (!choice) return;

    // 1. Hide credits stage smoothly
    if (this.endingCredits) {
      await this.endingCredits.hide();
    }

    const lyricsData = choice.songLyrics || [];
    const lrcLyrics = choice.lrcLyrics || null;
    const songTitle = choice.songTrackName || '';

    // Re-trigger / ensure song is playing
    audioManager.playSong(choiceKey, 1.0);

    // Setup the 5-dot interaction again
    this.setupEndingInteraction(choiceKey);

    // Play lyrics sequence and await completion
    if (this.lyricsPlayer) {
      await this.lyricsPlayer.playLyricsSequence(lyricsData, lrcLyrics, songTitle);
    }

    this.cleanupEndingInteraction();

    // Reveal Epilogue Credits again
    if (this.endingCredits) {
      await this.endingCredits.revealCredits(choiceKey);
    }
  }

  replayExperience() {
    this.cleanupEndingInteraction();
    audioManager.stopAllMusic(1000);
    sceneManager.goTo('phase1');
  }

  exit() {
    this.cleanupEndingInteraction();

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    if (this.choiceSelector) {
      this.choiceSelector.destroy();
      this.choiceSelector = null;
    }
    if (this.lyricsPlayer) {
      this.lyricsPlayer.destroy();
      this.lyricsPlayer = null;
    }
    if (this.endingCredits) {
      this.endingCredits.destroy();
      this.endingCredits = null;
    }

    if (this.butterfly) {
      this.butterfly.destroy();
      this.butterfly = null;
    }
    if (this.heart) {
      this.heart.destroy();
      this.heart = null;
    }

    if (this.element) {
      this.element.classList.remove('active');
    }
  }

  unmount() {
    this.exit();
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }
  }

  destroy() {
    this.unmount();
  }
}

export const phase5Scene = new Phase5Scene();
export default phase5Scene;
