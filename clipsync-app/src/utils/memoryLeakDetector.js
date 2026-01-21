/**
 * Memory Leak Detection Utility for ClipSync
 *
 * This utility helps detect potential memory leaks in React components by:
 * 1. Tracking event listeners
 * 2. Monitoring component mount/unmount cycles
 * 3. Detecting orphaned subscriptions
 * 4. Tracking large object allocations
 */

class MemoryLeakDetector {
  constructor() {
    this.eventListeners = new Map();
    this.subscriptions = new Map();
    this.componentLifecycles = new Map();
    this.largeObjects = new WeakSet();
    this.isProduction = process.env.NODE_ENV === 'production';
    this.warnings = [];
  }

  /**
   * Track event listener registration
   */
  trackEventListener(component, target, event, handler) {
    if (this.isProduction) return;

    const key = `${component}-${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }

    this.eventListeners.get(key).push({
      target,
      event,
      handler,
      timestamp: Date.now(),
    });

    // Check for duplicate listeners
    if (this.eventListeners.get(key).length > 5) {
      this.warn(`[Memory Leak] Potential duplicate event listeners for ${event} in ${component}`);
    }
  }

  /**
   * Track event listener cleanup
   */
  trackEventListenerCleanup(component, event) {
    if (this.isProduction) return;

    const key = `${component}-${event}`;
    if (this.eventListeners.has(key)) {
      this.eventListeners.delete(key);
    }
  }

  /**
   * Track subscription registration
   */
  trackSubscription(component, subscriptionId, subscription) {
    if (this.isProduction) return;

    const key = `${component}-${subscriptionId}`;
    this.subscriptions.set(key, {
      subscription,
      timestamp: Date.now(),
      cleaned: false,
    });
  }

  /**
   * Track subscription cleanup
   */
  trackSubscriptionCleanup(component, subscriptionId) {
    if (this.isProduction) return;

    const key = `${component}-${subscriptionId}`;
    if (this.subscriptions.has(key)) {
      const sub = this.subscriptions.get(key);
      sub.cleaned = true;
      this.subscriptions.delete(key);
    }
  }

  /**
   * Track component mount
   */
  trackComponentMount(component) {
    if (this.isProduction) return;

    if (!this.componentLifecycles.has(component)) {
      this.componentLifecycles.set(component, {
        mountCount: 0,
        unmountCount: 0,
        lastMount: null,
        lastUnmount: null,
      });
    }

    const lifecycle = this.componentLifecycles.get(component);
    lifecycle.mountCount++;
    lifecycle.lastMount = Date.now();
  }

  /**
   * Track component unmount
   */
  trackComponentUnmount(component) {
    if (this.isProduction) return;

    if (this.componentLifecycles.has(component)) {
      const lifecycle = this.componentLifecycles.get(component);
      lifecycle.unmountCount++;
      lifecycle.lastUnmount = Date.now();

      // Check for mount/unmount mismatch
      if (lifecycle.mountCount - lifecycle.unmountCount > 10) {
        this.warn(`[Memory Leak] Component ${component} has mount/unmount mismatch`);
      }
    }

    // Check for orphaned event listeners
    const orphanedListeners = [];
    this.eventListeners.forEach((listeners, key) => {
      if (key.startsWith(component)) {
        orphanedListeners.push(key);
      }
    });

    if (orphanedListeners.length > 0) {
      this.warn(`[Memory Leak] Component ${component} has ${orphanedListeners.length} orphaned event listeners`);
    }

    // Check for orphaned subscriptions
    const orphanedSubscriptions = [];
    this.subscriptions.forEach((sub, key) => {
      if (key.startsWith(component) && !sub.cleaned) {
        orphanedSubscriptions.push(key);
      }
    });

    if (orphanedSubscriptions.length > 0) {
      this.warn(`[Memory Leak] Component ${component} has ${orphanedSubscriptions.length} orphaned subscriptions`);
    }
  }

  /**
   * Track large object allocation
   */
  trackLargeObject(obj, size, component) {
    if (this.isProduction) return;

    const sizeInMB = size / (1024 * 1024);
    if (sizeInMB > 10) {
      this.warn(`[Memory Warning] Large object (${sizeInMB.toFixed(2)}MB) allocated in ${component}`);
    }

    this.largeObjects.add(obj);
  }

  /**
   * Log warning
   */
  warn(message) {
    console.warn(message);
    this.warnings.push({
      message,
      timestamp: Date.now(),
    });
  }

  /**
   * Get memory leak report
   */
  getReport() {
    const report = {
      totalEventListeners: this.eventListeners.size,
      totalSubscriptions: this.subscriptions.size,
      totalComponents: this.componentLifecycles.size,
      warnings: this.warnings,
      details: {
        eventListeners: Array.from(this.eventListeners.entries()).map(([key, listeners]) => ({
          key,
          count: listeners.length,
        })),
        subscriptions: Array.from(this.subscriptions.entries()).map(([key, sub]) => ({
          key,
          cleaned: sub.cleaned,
          age: Date.now() - sub.timestamp,
        })),
        components: Array.from(this.componentLifecycles.entries()).map(([component, lifecycle]) => ({
          component,
          ...lifecycle,
          balance: lifecycle.mountCount - lifecycle.unmountCount,
        })),
      },
    };

    return report;
  }

  /**
   * Check for memory leaks
   */
  checkForLeaks() {
    const leaks = {
      found: false,
      issues: [],
    };

    // Check event listeners
    this.eventListeners.forEach((listeners, key) => {
      if (listeners.length > 5) {
        leaks.found = true;
        leaks.issues.push({
          type: 'event_listener',
          key,
          count: listeners.length,
        });
      }
    });

    // Check subscriptions
    this.subscriptions.forEach((sub, key) => {
      if (!sub.cleaned && Date.now() - sub.timestamp > 60000) {
        leaks.found = true;
        leaks.issues.push({
          type: 'subscription',
          key,
          age: Date.now() - sub.timestamp,
        });
      }
    });

    // Check component lifecycles
    this.componentLifecycles.forEach((lifecycle, component) => {
      const balance = lifecycle.mountCount - lifecycle.unmountCount;
      if (balance > 10) {
        leaks.found = true;
        leaks.issues.push({
          type: 'component_lifecycle',
          component,
          balance,
        });
      }
    });

    return leaks;
  }

  /**
   * Clear all tracking data
   */
  reset() {
    this.eventListeners.clear();
    this.subscriptions.clear();
    this.componentLifecycles.clear();
    this.warnings = [];
  }
}

// Create singleton instance
const memoryLeakDetector = new MemoryLeakDetector();

// Expose to window for debugging (only in development)
if (process.env.NODE_ENV !== 'production') {
  window.memoryLeakDetector = memoryLeakDetector;
}

// Helper React Hook for automatic tracking
export const useMemoryLeakDetection = (componentName) => {
  if (process.env.NODE_ENV === 'production') {
    return {
      trackListener: () => {},
      trackSubscription: () => {},
    };
  }

  const trackListener = (target, event, handler) => {
    memoryLeakDetector.trackEventListener(componentName, target, event, handler);
    return () => {
      memoryLeakDetector.trackEventListenerCleanup(componentName, event);
    };
  };

  const trackSubscription = (subscriptionId, subscription) => {
    memoryLeakDetector.trackSubscription(componentName, subscriptionId, subscription);
    return () => {
      memoryLeakDetector.trackSubscriptionCleanup(componentName, subscriptionId);
    };
  };

  // Track component lifecycle
  React.useEffect(() => {
    memoryLeakDetector.trackComponentMount(componentName);
    return () => {
      memoryLeakDetector.trackComponentUnmount(componentName);
    };
  }, [componentName]);

  return {
    trackListener,
    trackSubscription,
  };
};

export default memoryLeakDetector;
