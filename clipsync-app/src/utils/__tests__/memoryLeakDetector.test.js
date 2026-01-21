import memoryLeakDetector from '../memoryLeakDetector';

describe('memoryLeakDetector', () => {
  beforeEach(() => {
    memoryLeakDetector.reset();
  });

  describe('Event Listener Tracking', () => {
    test('tracks event listener registration', () => {
      const handler = () => {};
      memoryLeakDetector.trackEventListener('TestComponent', window, 'click', handler);

      const report = memoryLeakDetector.getReport();
      expect(report.totalEventListeners).toBe(1);
    });

    test('detects duplicate event listeners', () => {
      const handler = () => {};
      for (let i = 0; i < 6; i++) {
        memoryLeakDetector.trackEventListener('TestComponent', window, 'click', handler);
      }

      const leaks = memoryLeakDetector.checkForLeaks();
      expect(leaks.found).toBe(true);
      expect(leaks.issues).toHaveLength(1);
      expect(leaks.issues[0].type).toBe('event_listener');
    });

    test('tracks event listener cleanup', () => {
      const handler = () => {};
      memoryLeakDetector.trackEventListener('TestComponent', window, 'click', handler);
      memoryLeakDetector.trackEventListenerCleanup('TestComponent', 'click');

      const report = memoryLeakDetector.getReport();
      expect(report.totalEventListeners).toBe(0);
    });
  });

  describe('Subscription Tracking', () => {
    test('tracks subscription registration', () => {
      const subscription = { unsubscribe: () => {} };
      memoryLeakDetector.trackSubscription('TestComponent', 'sub1', subscription);

      const report = memoryLeakDetector.getReport();
      expect(report.totalSubscriptions).toBe(1);
    });

    test('tracks subscription cleanup', () => {
      const subscription = { unsubscribe: () => {} };
      memoryLeakDetector.trackSubscription('TestComponent', 'sub1', subscription);
      memoryLeakDetector.trackSubscriptionCleanup('TestComponent', 'sub1');

      const report = memoryLeakDetector.getReport();
      expect(report.totalSubscriptions).toBe(0);
    });
  });

  describe('Component Lifecycle Tracking', () => {
    test('tracks component mount', () => {
      memoryLeakDetector.trackComponentMount('TestComponent');

      const report = memoryLeakDetector.getReport();
      expect(report.totalComponents).toBe(1);
      expect(report.details.components[0].mountCount).toBe(1);
    });

    test('tracks component unmount', () => {
      memoryLeakDetector.trackComponentMount('TestComponent');
      memoryLeakDetector.trackComponentUnmount('TestComponent');

      const report = memoryLeakDetector.getReport();
      expect(report.details.components[0].unmountCount).toBe(1);
    });

    test('detects mount/unmount mismatch', () => {
      for (let i = 0; i < 12; i++) {
        memoryLeakDetector.trackComponentMount('TestComponent');
      }

      const leaks = memoryLeakDetector.checkForLeaks();
      expect(leaks.found).toBe(true);
      const lifecycleIssue = leaks.issues.find(issue => issue.type === 'component_lifecycle');
      expect(lifecycleIssue).toBeDefined();
    });
  });

  describe('Memory Leak Detection', () => {
    test('identifies no leaks when properly cleaned up', () => {
      memoryLeakDetector.trackComponentMount('TestComponent');
      memoryLeakDetector.trackEventListener('TestComponent', window, 'click', () => {});
      memoryLeakDetector.trackEventListenerCleanup('TestComponent', 'click');
      memoryLeakDetector.trackComponentUnmount('TestComponent');

      const leaks = memoryLeakDetector.checkForLeaks();
      expect(leaks.found).toBe(false);
    });

    test('generates comprehensive report', () => {
      memoryLeakDetector.trackComponentMount('Component1');
      memoryLeakDetector.trackEventListener('Component1', window, 'click', () => {});
      memoryLeakDetector.trackSubscription('Component1', 'sub1', {});

      const report = memoryLeakDetector.getReport();
      expect(report.totalEventListeners).toBeGreaterThan(0);
      expect(report.totalSubscriptions).toBeGreaterThan(0);
      expect(report.totalComponents).toBeGreaterThan(0);
      expect(report.details).toBeDefined();
    });

    test('tracks warnings', () => {
      for (let i = 0; i < 6; i++) {
        memoryLeakDetector.trackEventListener('TestComponent', window, 'click', () => {});
      }

      const report = memoryLeakDetector.getReport();
      expect(report.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Reset Functionality', () => {
    test('clears all tracking data', () => {
      memoryLeakDetector.trackComponentMount('Component1');
      memoryLeakDetector.trackEventListener('Component1', window, 'click', () => {});
      memoryLeakDetector.trackSubscription('Component1', 'sub1', {});

      memoryLeakDetector.reset();

      const report = memoryLeakDetector.getReport();
      expect(report.totalEventListeners).toBe(0);
      expect(report.totalSubscriptions).toBe(0);
      expect(report.totalComponents).toBe(0);
      expect(report.warnings).toHaveLength(0);
    });
  });
});
