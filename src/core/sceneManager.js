import { eventBus } from './eventBus.js';
import { transitionManager } from './transitionManager.js';

/**
 * SceneManager - Orchestrates Scene Registrations, Lifecycles, and Transitions
 */
export class SceneManager {
  constructor(stageContainerId = 'sceneStage') {
    this.stage = document.getElementById(stageContainerId);
    this.scenes = new Map();
    this.currentSceneId = null;
    this.currentScene = null;
    this.isTransitioning = false;
  }

  /**
   * Register a scene implementation with an ID
   * @param {string} id - e.g. 'phase1', 'phase2'
   * @param {object} sceneInstance - Object implementing Scene lifecycle methods
   */
  register(id, sceneInstance) {
    if (this.scenes.has(id)) {
      console.warn(`[SceneManager] Overwriting existing scene with id: "${id}"`);
    }
    this.scenes.set(id, sceneInstance);
    return this;
  }

  /**
   * Get the active scene ID
   */
  getCurrentSceneId() {
    return this.currentSceneId;
  }

  /**
   * Get the active scene instance
   */
  getCurrentScene() {
    return this.currentScene;
  }

  /**
   * Transition to a target scene
   * @param {string} targetId
   * @param {object} data - optional state payload passed to enter()
   */
  async goTo(targetId, data = {}) {
    if (this.isTransitioning) {
      console.warn(`[SceneManager] Transition already in progress, ignoring request to goTo("${targetId}")`);
      return false;
    }

    if (!this.scenes.has(targetId)) {
      console.error(`[SceneManager] Scene "${targetId}" is not registered.`);
      return false;
    }

    if (!this.stage) {
      this.stage = document.getElementById('sceneStage');
    }

    const nextScene = this.scenes.get(targetId);
    const prevScene = this.currentScene;
    const prevSceneId = this.currentSceneId;

    this.isTransitioning = true;

    eventBus.emit('scene:before-change', {
      from: prevSceneId,
      to: targetId,
      data,
    });

    try {
      // 1. If there's an active scene, execute its exit lifecycle
      let outEl = null;
      if (prevScene) {
        if (typeof prevScene.exit === 'function') {
          await prevScene.exit();
        }
        outEl = prevScene.element || null;
      }

      // 2. Initialize and mount next scene if not currently in DOM
      if (!nextScene.element || !nextScene.element.parentNode) {
        if (typeof nextScene.mount === 'function') {
          nextScene.mount(this.stage);
        }
      }

      const inEl = nextScene.element;

      // 3. Cinematic Dissolve / Transition
      if (outEl && inEl && outEl !== inEl) {
        await transitionManager.dissolve(outEl, inEl, 1.0);
      } else if (inEl) {
        inEl.classList.add('active');
        inEl.style.visibility = 'visible';
        inEl.style.opacity = '1';
      }

      // 4. Cleanup previous scene completely
      if (prevScene && prevScene !== nextScene) {
        if (typeof prevScene.unmount === 'function') {
          prevScene.unmount();
        } else if (typeof prevScene.destroy === 'function') {
          prevScene.destroy();
        } else if (outEl && outEl.parentNode) {
          outEl.parentNode.removeChild(outEl);
          prevScene.element = null;
        }
      }

      // 5. Activate next scene
      this.currentSceneId = targetId;
      this.currentScene = nextScene;

      if (typeof nextScene.enter === 'function') {
        await nextScene.enter(data);
      }

      eventBus.emit('scene:change', {
        current: targetId,
        from: prevSceneId,
        data,
      });

      eventBus.emit('scene:after-change', {
        current: targetId,
      });

      return true;
    } catch (error) {
      console.error(`[SceneManager] Error during transition from "${prevSceneId}" to "${targetId}":`, error);
      return false;
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Initialize initial scene on app boot
   * @param {string} initialSceneId
   */
  async start(initialSceneId = 'phase1') {
    if (!this.stage) {
      this.stage = document.getElementById('sceneStage');
    }
    return this.goTo(initialSceneId);
  }
}

export const sceneManager = new SceneManager();
export default sceneManager;
