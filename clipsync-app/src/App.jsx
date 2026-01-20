import { useEffect, useState, lazy, Suspense, memo, useMemo, useCallback } from 'react';
import useClipStore from './store/useClipStore';
import useAuthStore from './store/useAuthStore';
import useTeamStore from './store/useTeamStore';
import wsClient from './services/websocket';
import { ToastProvider, useToast } from './components/ui/Toast';
import LandingPage from './components/screens/LandingPage';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load heavy components
const Navigation = lazy(() => import('./components/layout/Navigation'));
const ClipList = lazy(() => import('./components/clips/ClipList'));
const DetailSidebar = lazy(() => import('./components/clips/DetailSidebar'));
const FilterBar = lazy(() => import('./components/clips/FilterBar'));
const FloatingActionButton = lazy(() => import('./components/layout/FloatingActionButton'));
const KeyboardShortcutHint = lazy(() => import('./components/layout/KeyboardShortcutHint'));
const ShareModal = lazy(() => import('./components/modals/ShareModal'));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen'));
const PricingScreen = lazy(() => import('./components/screens/PricingScreen'));
const AuthModal = lazy(() => import('./components/modals/AuthModal'));
const TeamsListScreen = lazy(() => import('./components/screens/TeamsListScreen'));
const CommandPalette = lazy(() => import('./components/features/developer/CommandPalette'));
const SnippetLibrary = lazy(() => import('./components/features/developer/SnippetLibrary'));
const DevTools = lazy(() => import('./components/features/developer/DevTools'));
const GitHelper = lazy(() => import('./components/features/developer/GitHelper'));
const WorkflowAutomation = lazy(() => import('./components/features/developer/WorkflowAutomation'));
const StatsDashboard = lazy(() => import('./components/screens/StatsDashboard'));
const BillingPortal = lazy(() => import('./components/features/billing/BillingPortal'));

// Loading fallback
const LoadingFallback = () => (
  <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
    <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
  </div>
);

// Memoized App component for performance
const App = memo(() => {
  const { initialize, addClip, syncClipFromRemote, updateClipFromRemote, deleteClipFromRemote, activeTab, setActiveTab } = useClipStore();
  const { initialize: initAuth, isAuthenticated, isLoading: authLoading, enableDevMode } = useAuthStore();
  const { syncTeamClipFromRemote, updateTeamClipFromRemote, deleteTeamClipFromRemote } = useTeamStore();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSnippetLibrary, setShowSnippetLibrary] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showGitHelper, setShowGitHelper] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [showStatsDashboard, setShowStatsDashboard] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Memoized callbacks
  const handleAddClip = useCallback(async (text) => {
    await addClip(text);
  }, [addClip]);

  const handleSettingsClick = useCallback(() => setShowSettings(true), []);
  const handlePricingClick = useCallback(() => setShowPricing(true), []);
  const handleLoginClick = useCallback(() => setShowAuthModal(true), []);
  const handleSnippetsClick = useCallback(() => setShowSnippetLibrary(true), []);
  const handleCloseShareModal = useCallback(() => setShowShareModal(false), []);
  const handleCloseCommandPalette = useCallback(() => setShowCommandPalette(false), []);
  const handleCloseAuthModal = useCallback(() => setShowAuthModal(false), []);

  // Initialize auth and app
  useEffect(() => {
    const init = async () => {
      await initAuth();
      await initialize();
    };
    init();
  }, [initAuth, initialize]);

  // Listen for "copied again" events
  useEffect(() => {
    const handleCopiedAgain = (event) => {
      const { clip, copyCount } = event.detail;
      toast.info(`Copied again (${copyCount}x total)`, {
        title: 'Clip Duplicate',
        duration: 2000
      });
    };

    window.addEventListener('clipCopiedAgain', handleCopiedAgain);
    return () => {
      window.removeEventListener('clipCopiedAgain', handleCopiedAgain);
    };
  }, [toast]);

  // Set up WebSocket sync listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    // Connection status
    wsClient.on('connection-status', ({ connected }) => {
      setSyncStatus(connected ? 'connected' : 'disconnected');
    });

    wsClient.on('reconnecting', () => {
      setSyncStatus('reconnecting');
    });

    // Clip sync events
    wsClient.on('clip:created', (clip) => {
      console.log('Remote clip created:', clip);
      syncClipFromRemote(clip);
    });

    wsClient.on('clip:updated', (clip) => {
      console.log('Remote clip updated:', clip);
      updateClipFromRemote(clip);
    });

    wsClient.on('clip:deleted', (clipId) => {
      console.log('Remote clip deleted:', clipId);
      deleteClipFromRemote(clipId);
    });

    // Team clip sync events
    wsClient.on('team-clip:created', ({ teamId, clip }) => {
      console.log('Remote team clip created:', teamId, clip);
      syncTeamClipFromRemote(teamId, clip);
    });

    wsClient.on('team-clip:updated', ({ teamId, clip }) => {
      console.log('Remote team clip updated:', teamId, clip);
      updateTeamClipFromRemote(teamId, clip);
    });

    wsClient.on('team-clip:deleted', ({ teamId, clipId }) => {
      console.log('Remote team clip deleted:', teamId, clipId);
      deleteTeamClipFromRemote(teamId, clipId);
    });

    return () => {
      // Clean up listeners
      wsClient.off('connection-status');
      wsClient.off('reconnecting');
      wsClient.off('clip:created');
      wsClient.off('clip:updated');
      wsClient.off('clip:deleted');
      wsClient.off('team-clip:created');
      wsClient.off('team-clip:updated');
      wsClient.off('team-clip:deleted');
    };
  }, [isAuthenticated, syncClipFromRemote, updateClipFromRemote, deleteClipFromRemote, syncTeamClipFromRemote, updateTeamClipFromRemote, deleteTeamClipFromRemote]);

  // Listen for clipboard changes (manual paste detection)
  useEffect(() => {
    const handlePaste = async (e) => {
      try {
        const text = e.clipboardData.getData('text');
        if (text) {
          await handleAddClip(text);
        }
      } catch (error) {
        console.error('Failed to capture clipboard:', error);
      }
    };

    // Add paste event listener to document
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [addClip]);

  // Listen for Electron clipboard changes (desktop app)
  useEffect(() => {
    // Check if running in Electron
    if (typeof window !== 'undefined' && window.electronAPI) {
      console.log('Electron detected - setting up clipboard monitoring');

      // Listen for clipboard changes from Electron
      const cleanup = window.electronAPI.onClipboardChanged(async (text) => {
        console.log('Clipboard changed (Electron):', text?.substring(0, 50));
        try {
          if (text) {
            await handleAddClip(text);
          }
        } catch (error) {
          console.error('Failed to add clip from Electron:', error);
        }
      });

      // Listen for quick paste shortcut
      const cleanupQuickPaste = window.electronAPI.onQuickPaste(() => {
        console.log('Quick paste triggered');
        setShowCommandPalette(true);
      });

      // Listen for settings shortcut
      const cleanupSettings = window.electronAPI.onOpenSettings(() => {
        console.log('Settings triggered');
        setShowSettings(true);
      });

      // Cleanup on unmount
      return () => {
        if (cleanup) cleanup();
        if (cleanupQuickPaste) cleanupQuickPaste();
        if (cleanupSettings) cleanupSettings();
      };
    } else {
      console.log('Running in browser mode - using paste events only');
    }
  }, [addClip]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K - Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Cmd/Ctrl + Shift + S - Snippet Library
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        setShowSnippetLibrary(true);
      }

      // Cmd/Ctrl + Shift + D - Dev Tools
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        setShowDevTools(true);
      }

      // Cmd/Ctrl + Shift + G - Git Helper
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        setShowGitHelper(true);
      }

      // Cmd/Ctrl + Shift + W - Workflow Automation
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'w') {
        e.preventDefault();
        setShowWorkflowAutomation(true);
      }

      // Cmd/Ctrl + Shift + V - Quick paste
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'v') {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      // Escape - Clear selection or close modals
      if (e.key === 'Escape') {
        if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (showSnippetLibrary) {
          setShowSnippetLibrary(false);
        } else if (showDevTools) {
          setShowDevTools(false);
        } else if (showGitHelper) {
          setShowGitHelper(false);
        } else if (showWorkflowAutomation) {
          setShowWorkflowAutomation(false);
        } else {
          useClipStore.getState().clearSelection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showCommandPalette, showSnippetLibrary, showDevTools, showGitHelper, showWorkflowAutomation]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  // Show loading screen while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">Y</span>
          </div>
          <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-600 mt-4">Loading ClipSync...</p>
        </div>
      </div>
    );
  }

  // Show different screens based on state (pricing accessible without auth)
  if (showPricing) {
    return <PricingScreen onClose={() => setShowPricing(false)} />;
  }

  // Require authentication before using the service
  // Show landing page when not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LandingPage
          onGetStarted={handleLoginClick}
          onDevMode={enableDevMode}
        />
        {showAuthModal && (
          <Suspense fallback={null}>
            <AuthModal onClose={handleCloseAuthModal} />
          </Suspense>
        )}
      </>
    );
  }

  // Show different screens based on state
  if (showSettings) {
    return (
      <ErrorBoundary onReset={() => setShowSettings(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <SettingsScreen onClose={() => setShowSettings(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showSnippetLibrary) {
    return (
      <ErrorBoundary onReset={() => setShowSnippetLibrary(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <SnippetLibrary onClose={() => setShowSnippetLibrary(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showDevTools) {
    return (
      <ErrorBoundary onReset={() => setShowDevTools(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <DevTools onClose={() => setShowDevTools(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showGitHelper) {
    return (
      <ErrorBoundary onReset={() => setShowGitHelper(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <GitHelper onClose={() => setShowGitHelper(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showWorkflowAutomation) {
    return (
      <ErrorBoundary onReset={() => setShowWorkflowAutomation(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <WorkflowAutomation onClose={() => setShowWorkflowAutomation(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (showBilling) {
    return (
      <ErrorBoundary onReset={() => setShowBilling(false)}>
        <Suspense fallback={<LoadingFallback />}>
          <BillingPortal onClose={() => setShowBilling(false)} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show Teams screen if team tab is active
  if (activeTab === 'team') {
    return (
      <>
        <Navigation
          onSettingsClick={() => setShowSettings(true)}
          onPricingClick={() => setShowPricing(true)}
          onLoginClick={() => setShowAuthModal(true)}
          onSnippetsClick={() => setShowSnippetLibrary(true)}
          onBillingClick={() => setShowBilling(true)}
          syncStatus={syncStatus}
        />
        <TeamsListScreen />

        {/* Command Palette */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
        />

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  // Show Stats Dashboard if stats tab is active
  if (activeTab === 'stats') {
    return (
      <>
        <Navigation
          onSettingsClick={() => setShowSettings(true)}
          onPricingClick={() => setShowPricing(true)}
          onLoginClick={() => setShowAuthModal(true)}
          onSnippetsClick={() => setShowSnippetLibrary(true)}
          onBillingClick={() => setShowBilling(true)}
          syncStatus={syncStatus}
        />
        <Suspense fallback={<LoadingFallback />}>
          <StatsDashboard onClose={() => setActiveTab('history')} />
        </Suspense>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <Suspense fallback={<LoadingFallback />}>
        <Navigation
          onSettingsClick={handleSettingsClick}
          onPricingClick={handlePricingClick}
          onLoginClick={handleLoginClick}
          onBillingClick={() => setShowBilling(true)}
          syncStatus={syncStatus}
        />

        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex gap-6">
            {/* Main Content */}
            <div className="flex-1">
              <Suspense fallback={<LoadingFallback />}>
                <FilterBar />
                <ClipList />
              </Suspense>
            </div>

            {/* Right Sidebar */}
            <Suspense fallback={<LoadingFallback />}>
              <DetailSidebar onShareClick={() => setShowShareModal(true)} />
            </Suspense>
          </div>
        </div>

        {/* Floating Action Button */}
        <Suspense fallback={null}>
          <FloatingActionButton />
        </Suspense>

        {/* Keyboard Shortcut Hint */}
        <Suspense fallback={null}>
          <KeyboardShortcutHint />
        </Suspense>

        {/* Share Modal */}
        {showShareModal && (
          <Suspense fallback={null}>
            <ShareModal onClose={handleCloseShareModal} />
          </Suspense>
        )}

        {/* Command Palette */}
        <Suspense fallback={null}>
          <CommandPalette
            isOpen={showCommandPalette}
            onClose={handleCloseCommandPalette}
          />
        </Suspense>

        {/* Auth Modal */}
        {showAuthModal && (
          <Suspense fallback={null}>
            <AuthModal onClose={handleCloseAuthModal} />
          </Suspense>
        )}
      </Suspense>

      {/* Keyboard Shortcuts Overlay */}
      <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs text-zinc-600 border border-zinc-200 max-w-xs">
        <div className="font-semibold mb-2 flex items-center gap-2">
          <span>⌨️</span>
          <span>Keyboard Shortcuts</span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span>Command Palette</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-xs">Ctrl+K</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Snippets</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-xs">Ctrl+Shift+S</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Dev Tools</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-xs">Ctrl+Shift+D</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Git Helper</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-xs">Ctrl+Shift+G</kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Workflows</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded border border-zinc-300 text-xs">Ctrl+Shift+W</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

);

App.displayName = 'App';

// Wrap App with ToastProvider
const AppWithProviders = () => {
  return (
    <ToastProvider>
      <App />
    </ToastProvider>
  );
};

export default AppWithProviders;
