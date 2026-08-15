import './styles/main.css';
import { sceneManager } from './core/sceneManager.js';
import { audioManager } from './audio/audioManager.js';
import { assetLoader } from './core/assetLoader.js';

// Import Scenes
import { phase1Scene } from './scenes/phase1.js';
import { phase2Scene } from './scenes/phase2.js';
import { phase3Scene } from './scenes/phase3.js';
import { phase4Scene } from './scenes/phase4.js';
import { phase5Scene } from './scenes/phase5.js';

/**
 * Fix mobile dynamic viewport height quirks
 */
function setupViewportHeightFix() {
  const setVh = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };
  setVh();
  window.addEventListener('resize', setVh, { passive: true });
  window.addEventListener('orientationchange', () => {
    setTimeout(setVh, 100);
  });
}

/**
 * Bootstrap the Interactive Storytelling Experience
 */
async function bootstrapApp() {
  setupViewportHeightFix();

  // Preload critical assets in background during Phase 1
  assetLoader.preloadAll();

  // Register all 5 phases into SceneManager
  sceneManager
    .register('phase1', phase1Scene)
    .register('phase2', phase2Scene)
    .register('phase3', phase3Scene)
    .register('phase4', phase4Scene)
    .register('phase5', phase5Scene);

  // Start with Phase 1 (The Beginning)
  await sceneManager.start('phase1');

  console.info(
    '%c Di Antara Jeda dan Aksara %c Foundation Initialized Successfully %c',
    'background: #2e182d; color: #f2cb86; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
    'background: #1b1226; color: #ffffff; padding: 4px 8px; border-radius: 0 4px 4px 0;',
    'background: transparent;'
  );
}

// Run bootstrap when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapApp);
} else {
  bootstrapApp();
}
