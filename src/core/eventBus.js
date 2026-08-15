/**
 * EventBus - Lightweight Pub/Sub for cross-module decoupled events
 */
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[EventBus] Error handling event "${event}":`, err);
        }
      });
    }
  }

  clear() {
    this.events.clear();
  }
}

export const eventBus = new EventBus();
export default eventBus;
