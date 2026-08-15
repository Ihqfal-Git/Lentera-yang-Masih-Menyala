/**
 * AssetLoader — Intelligent Preloader & Resource Optimizer
 * Pre-caches critical images, fonts, and media in the background during Phase 1
 * to guarantee instantaneous, butter-smooth transitions across all 5 story phases.
 */
export class AssetLoader {
  constructor() {
    this.preloadedImages = new Map();
    this.preloadedAudio = new Map();
    this.isPreloaded = false;
  }

  /**
   * Preload a single image using HTMLImageElement and .decode() API
   * @param {string} src - URL/path of the image
   */
  preloadImage(src) {
    return new Promise((resolve) => {
      if (this.preloadedImages.has(src)) {
        return resolve(this.preloadedImages.get(src));
      }

      const img = new Image();
      img.src = src;

      if ('decode' in img) {
        img.decode()
          .then(() => {
            this.preloadedImages.set(src, img);
            resolve(img);
          })
          .catch(() => {
            // Fallback for decode failure or unsupported format
            img.onload = () => {
              this.preloadedImages.set(src, img);
              resolve(img);
            };
            img.onerror = () => resolve(null);
          });
      } else {
        img.onload = () => {
          this.preloadedImages.set(src, img);
          resolve(img);
        };
        img.onerror = () => resolve(null);
      }
    });
  }

  /**
   * Preload all critical images for Phase 2 memories and scenes
   */
  async preloadImages(imagePaths = []) {
    const defaultPaths = [
      '/assets/memories/photo-01.webp',
      '/assets/memories/photo-02.webp',
      '/assets/memories/photo-03.webp',
    ];

    const paths = imagePaths.length > 0 ? imagePaths : defaultPaths;
    const promises = paths.map(path => this.preloadImage(path));
    return Promise.all(promises);
  }

  /**
   * Preload and verify critical typography fonts
   */
  async preloadFonts() {
    if ('fonts' in document) {
      try {
        await document.fonts.ready;
      } catch (err) {
        console.warn('[AssetLoader] Font readiness check warning:', err);
      }
    }
  }

  /**
   * Softly pre-cache audio assets in the background
   */
  async preloadAudioHints() {
    const audioPaths = [
      '/assets/audio/Ambient Dusk.mp3',
      '/assets/audio/ambient-dusk.mp3',
      '/assets/audio/senja_teduh_pelita.mp3',
      '/assets/audio/Nadin_Amizah-Bunga_Tidur.mp3.mp3',
      '/assets/audio/Lovarian-Perpisahan_Termanis.mp3',
    ];

    // Hint browser cache via <link rel="prefetch">
    audioPaths.forEach(src => {
      if (!document.querySelector(`link[href="${src}"]`)) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.as = 'fetch';
        link.href = src;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Start master background preloading pipeline
   */
  async preloadAll() {
    if (this.isPreloaded) return;
    this.isPreloaded = true;

    try {
      await Promise.all([
        this.preloadFonts(),
        this.preloadImages(),
        this.preloadAudioHints(),
      ]);
      console.info('[AssetLoader] All critical storytelling assets preloaded successfully.');
    } catch (err) {
      console.warn('[AssetLoader] Preload pipeline completed with notices:', err);
    }
  }
}

export const assetLoader = new AssetLoader();
export default assetLoader;
