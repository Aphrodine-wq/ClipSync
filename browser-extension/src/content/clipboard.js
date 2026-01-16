/**
 * Content Script
 * Monitors clipboard changes on web pages
 */

(function() {
  'use strict';

  let lastClipboardContent = '';
  let isMonitoring = false;

  // Start monitoring clipboard changes
  function startMonitoring() {
    if (isMonitoring) return;
    isMonitoring = true;

    // Monitor paste events
    document.addEventListener('paste', handlePaste, true);
    
    // Monitor copy events
    document.addEventListener('copy', handleCopy, true);

    // Periodic clipboard check (fallback)
    setInterval(async () => {
      try {
        const content = await navigator.clipboard.readText();
        if (content && content !== lastClipboardContent) {
          lastClipboardContent = content;
          notifyBackground(content);
        }
      } catch (error) {
        // Clipboard access may be denied
        console.debug('Clipboard read:', error.message);
      }
    }, 1000);
  }

  // Handle paste event
  function handlePaste(event) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    if (clipboardData) {
      const text = clipboardData.getData('text/plain');
      if (text && text !== lastClipboardContent) {
        lastClipboardContent = text;
        notifyBackground(text);
      }
    }
  }

  // Handle copy event
  function handleCopy(event) {
    const selection = window.getSelection()?.toString();
    if (selection) {
      // Small delay to ensure clipboard is updated
      setTimeout(() => {
        navigator.clipboard.readText().then(text => {
          if (text && text !== lastClipboardContent) {
            lastClipboardContent = text;
            notifyBackground(text);
          }
        }).catch(() => {});
      }, 100);
    }
  }

  // Notify background script
  function notifyBackground(content) {
    const isChrome = typeof chrome !== 'undefined' && chrome.runtime;
    const isFirefox = typeof browser !== 'undefined' && browser.runtime;

    if (isChrome) {
      chrome.runtime.sendMessage({
        type: 'clip-captured',
        content,
      });
    } else if (isFirefox) {
      browser.runtime.sendMessage({
        type: 'clip-captured',
        content,
      });
    }
  }

  // Listen for messages from background
  const isChrome = typeof chrome !== 'undefined' && chrome.runtime;
  const isFirefox = typeof browser !== 'undefined' && browser.runtime;

  if (isChrome) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'start-monitoring') {
        startMonitoring();
        sendResponse({ success: true });
      }
      return true;
    });
  } else if (isFirefox) {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'start-monitoring') {
        startMonitoring();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  // Auto-start monitoring
  startMonitoring();
})();

