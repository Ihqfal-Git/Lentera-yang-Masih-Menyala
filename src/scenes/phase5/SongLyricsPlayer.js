import gsap from 'gsap';
import { audioManager } from '../../audio/audioManager.js';

/**
 * Parse LRC string into sorted array of timestamped lines
 * @param {string} lrcText
 * @returns {Array<{ time: number, text: string }>}
 */
export function parseLRC(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];
  const lines = lrcText.split(/\r?\n/);
  const result = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const match = trimmed.match(/^\[(\d{1,2}):(\d{2}(?:\.\d+)?)\](.*)$/);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseFloat(match[2]);
      const totalSeconds = minutes * 60 + seconds;
      const text = match[3].trim();
      if (text) {
        result.push({ time: totalSeconds, text });
      }
    }
  }

  return result.sort((a, b) => a.time - b.time);
}

/**
 * SongLyricsPlayer Sub-Component (Phase 5)
 * Manages real-time LRC synced lyrics with smooth downward scrolling cascade animations
 * (Lirik lama bergulir ke bawah, lirik baru meluncur turun dari atas),
 * glowing song badge, dual-clock tracking, and seamless sequence completion hooks.
 */
export class SongLyricsPlayer {
  constructor(options = {}) {
    this.container = options.container || null;
    this.activeTimelines = [];
    this.timeouts = [];
    this.animationFrameId = null;
    this.isDestroyed = false;
    this.resolveCurrentSequence = null;
  }

  mount() {
    // Stage ready
  }

  wait(ms) {
    return new Promise(resolve => {
      const id = setTimeout(resolve, ms);
      this.timeouts.push(id);
    });
  }

  /**
   * Play synced lyrics sequence
   * @param {Array|string} lyricsData - Fallback array or custom text
   * @param {string} [lrcString] - Optional LRC timestamped text
   * @param {string} [songTitle] - Track title for display badge
   */
  async playLyricsSequence(lyricsData, lrcString, songTitle = '') {
    if (!this.container) return;
    this.isDestroyed = false;

    const songBadge = this.container.querySelector('#p5-song-badge');
    const songTitleEl = this.container.querySelector('#p5-song-title');
    const lyricsBox = this.container.querySelector('#p5-lyrics-box');
    const lyricLine1 = this.container.querySelector('#p5-lyric-line1');
    const lyricLine2 = this.container.querySelector('#p5-lyric-line2');

    // Reset animations
    gsap.killTweensOf([this.container, lyricsBox, songBadge, lyricLine1, lyricLine2]);
    this.container.classList.add('is-active');
    this.container.style.visibility = 'visible';
    this.container.style.opacity = '1';

    if (lyricsBox) {
      lyricsBox.style.visibility = 'visible';
      lyricsBox.style.opacity = '1';
    }

    // Show song title badge
    if (songBadge && songTitle) {
      if (songTitleEl) songTitleEl.textContent = songTitle;
      songBadge.style.visibility = 'visible';
      gsap.fromTo(
        songBadge,
        { opacity: 0, y: -12, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power2.out' }
      );
    }

    // Parse LRC if provided
    const lrcSource = lrcString || (typeof lyricsData === 'string' ? lyricsData : null);
    const parsedLRC = lrcSource ? parseLRC(lrcSource) : [];

    if (parsedLRC.length > 0) {
      return this.playLRCSequence(parsedLRC, lyricsBox, lyricLine1, lyricLine2);
    }

    // Fallback timed sequence with downward cascade animation
    const dataList = Array.isArray(lyricsData) ? lyricsData : [];
    if (dataList.length === 0) return;

    return new Promise(resolve => {
      this.resolveCurrentSequence = resolve;

      (async () => {
        let prevText = '';

        for (let i = 0; i < dataList.length; i++) {
          if (this.isDestroyed) break;
          const item = dataList[i];

          // Downward roll transition
          if (lyricLine2 && prevText) {
            lyricLine2.textContent = prevText;
            gsap.fromTo(
              lyricLine2,
              { y: -10, opacity: 0.85, filter: 'blur(2px)' },
              { y: 0, opacity: 0.5, filter: 'blur(0px)', duration: 0.65, ease: 'power2.out' }
            );
          }

          if (lyricLine1 && item.line1) {
            lyricLine1.textContent = `"${item.line1}"`;
            gsap.fromTo(
              lyricLine1,
              { y: -20, opacity: 0, filter: 'blur(6px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' }
            );
            prevText = `"${item.line1}"`;
          }

          await this.wait(item.duration || 3400);

          if (item.line2 && lyricLine1) {
            if (lyricLine2 && prevText) {
              lyricLine2.textContent = prevText;
              gsap.fromTo(
                lyricLine2,
                { y: -10, opacity: 0.85, filter: 'blur(2px)' },
                { y: 0, opacity: 0.5, filter: 'blur(0px)', duration: 0.65, ease: 'power2.out' }
              );
            }
            lyricLine1.textContent = `"${item.line2}"`;
            gsap.fromTo(
              lyricLine1,
              { y: -20, opacity: 0, filter: 'blur(6px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' }
            );
            prevText = `"${item.line2}"`;
            await this.wait(item.duration || 3400);
          }
        }

        if (!this.isDestroyed) {
          await this.fadeOutStage();
        }
      })();
    });
  }

  /**
   * Real-time LRC synchronized playback with downward cascade animation
   * (Lirik sebelumnya meluncur ke bawah, lirik baru turun dari atas)
   */
  playLRCSequence(parsedLRC, lyricsBox, lyricLine1, lyricLine2) {
    return new Promise(resolve => {
      this.resolveCurrentSequence = resolve;
      let currentIndex = -1;
      let previousLineText = '';
      const startTime = performance.now();

      if (lyricsBox) {
        lyricsBox.style.visibility = 'visible';
        gsap.set(lyricsBox, { opacity: 1, y: 0 });
      }

      // Display initial intro cue while waiting for first vocal line
      if (lyricLine1 && parsedLRC[0] && parsedLRC[0].time > 2.5) {
        lyricLine1.textContent = '♪ Melodi pengantar mengalun...';
        lyricLine1.style.opacity = '0.65';
        lyricLine1.style.fontStyle = 'italic';
      }

      const updateFrame = () => {
        if (this.isDestroyed) {
          if (this.resolveCurrentSequence) {
            this.resolveCurrentSequence();
            this.resolveCurrentSequence = null;
          }
          return;
        }

        // Dual-clock: Live audio seek position with elapsed real-time fallback
        const seekPos = audioManager.getCurrentSeek();
        const elapsedSec = (performance.now() - startTime) / 1000;
        const currentTime = seekPos > 0 ? seekPos : elapsedSec;

        // Find current active LRC item
        let activeIndex = -1;
        for (let i = 0; i < parsedLRC.length; i++) {
          if (currentTime >= parsedLRC[i].time) {
            activeIndex = i;
          } else {
            break;
          }
        }

        if (activeIndex !== currentIndex && activeIndex >= 0) {
          currentIndex = activeIndex;
          const currentItem = parsedLRC[currentIndex];

          // 1. Shift previous primary line down to secondary line (sliding downward)
          if (lyricLine2 && previousLineText) {
            lyricLine2.textContent = previousLineText;
            gsap.killTweensOf(lyricLine2);
            gsap.fromTo(
              lyricLine2,
              { y: -10, opacity: 0.85, filter: 'blur(3px)' },
              { y: 0, opacity: 0.48, filter: 'blur(0px)', duration: 0.7, ease: 'power2.out' }
            );
          }

          // 2. Animate brand new lyric line sliding down from above
          if (lyricLine1) {
            lyricLine1.textContent = currentItem.text;
            lyricLine1.style.fontStyle = 'normal';
            gsap.killTweensOf(lyricLine1);
            gsap.fromTo(
              lyricLine1,
              { y: -22, opacity: 0, filter: 'blur(6px)' },
              { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.75, ease: 'power2.out' }
            );
            previousLineText = currentItem.text;
          }
        }

        // Check if passed last lyric by 5 seconds
        const lastItem = parsedLRC[parsedLRC.length - 1];
        if (lastItem && currentTime > lastItem.time + 5.0) {
          this.fadeOutStage();
          return;
        }

        this.animationFrameId = requestAnimationFrame(updateFrame);
      };

      this.animationFrameId = requestAnimationFrame(updateFrame);
    });
  }

  async fadeOutStage() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const lyricsBox = this.container ? this.container.querySelector('#p5-lyrics-box') : null;
    const songBadge = this.container ? this.container.querySelector('#p5-song-badge') : null;

    if (this.container) {
      await new Promise(res => {
        gsap.to([lyricsBox, songBadge, this.container], {
          opacity: 0,
          y: -10,
          duration: 0.8,
          ease: 'power2.in',
          onComplete: () => {
            if (this.container) {
              this.container.classList.remove('is-active');
              this.container.style.visibility = 'hidden';
            }
            res();
          },
        });
      });
    }

    if (this.resolveCurrentSequence) {
      this.resolveCurrentSequence();
      this.resolveCurrentSequence = null;
    }
  }

  destroy() {
    this.isDestroyed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.activeTimelines.forEach(tl => {
      if (tl) tl.kill();
    });
    this.activeTimelines = [];

    this.timeouts.forEach(id => clearTimeout(id));
    this.timeouts = [];

    if (this.container) {
      this.container.classList.remove('is-active');
      this.container.style.visibility = 'hidden';
      this.container.style.opacity = '0';
    }

    if (this.resolveCurrentSequence) {
      this.resolveCurrentSequence();
      this.resolveCurrentSequence = null;
    }
  }
}

export default SongLyricsPlayer;
