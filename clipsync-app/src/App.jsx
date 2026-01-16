import { useEffect, useState } from 'react';
import useClipStore from './store/useClipStore';
import useAuthStore from './store/useAuthStore';
import useTeamStore from './store/useTeamStore';
import wsClient from './services/websocket';
import Navigation from './components/Navigation';
import ClipList from './components/ClipList';
import DetailSidebar from './components/DetailSidebar';
import FilterBar from './components/FilterBar';
import FloatingActionButton from './components/FloatingActionButton';
import KeyboardShortcutHint from './components/KeyboardShortcutHint';
import ShareModal from './components/ShareModal';
import SettingsScreen from './components/SettingsScreen';
import PricingScreen from './components/PricingScreen';
import AuthModal from './components/AuthModal';
import TeamsListScreen from './components/TeamsListScreen';
import CommandPalette from './components/CommandPalette';
import SnippetLibrary from './components/SnippetLibrary';
import DevTools from './components/DevTools';
import GitHelper from './components/GitHelper';
import WorkflowAutomation from './components/WorkflowAutomation';

function App() {
  const { initialize, addClip, syncClipFromRemote, updateClipFromRemote, deleteClipFromRemote, activeTab, setActiveTab } = useClipStore();
  const { initialize: initAuth, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const { syncTeamClipFromRemote, updateTeamClipFromRemote, deleteTeamClipFromRemote } = useTeamStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showSnippetLibrary, setShowSnippetLibrary] = useState(false);
  const [showDevTools, setShowDevTools] = useState(false);
  const [showGitHelper, setShowGitHelper] = useState(false);
  const [showWorkflowAutomation, setShowWorkflowAutomation] = useState(false);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Initialize auth and app
  useEffect(() => {
    const init = async () => {
      await initAuth();
      await initialize();
    };
    init();
  }, [initAuth, initialize]);

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
          await addClip(text);
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
            await addClip(text);
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

  // Show different screens based on state
  if (showSettings) {
    return <SettingsScreen onClose={() => setShowSettings(false)} />;
  }

  if (showPricing) {
    return <PricingScreen onClose={() => setShowPricing(false)} />;
  }

  if (showSnippetLibrary) {
    return <SnippetLibrary onClose={() => setShowSnippetLibrary(false)} />;
  }

  if (showDevTools) {
    return <DevTools onClose={() => setShowDevTools(false)} />;
  }

  if (showGitHelper) {
    return <GitHelper onClose={() => setShowGitHelper(false)} />;
  }

  if (showWorkflowAutomation) {
    return <WorkflowAutomation onClose={() => setShowWorkflowAutomation(false)} />;
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

  return (
    <div className="min-h-screen bg-zinc-100">
      <Navigation 
        onSettingsClick={() => setShowSettings(true)}
        onPricingClick={() => setShowPricing(true)}
        onLoginClick={() => setShowAuthModal(true)}
        syncStatus={syncStatus}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <FilterBar />
            <ClipList />
          </div>

          {/* Right Sidebar */}
          <DetailSidebar onShareClick={() => setShowShareModal(true)} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Keyboard Shortcut Hint */}
      <KeyboardShortcutHint />

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}

      {/* Command Palette */}
      <CommandPalette 
        isOpen={showCommandPalette} 
        onClose={() => setShowCommandPalette(false)} 
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

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

export default App;
