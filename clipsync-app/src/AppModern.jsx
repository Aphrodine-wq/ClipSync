import { useEffect, useState } from 'react';
import useClipStore from './store/useClipStore';
import useAuthStore from './store/useAuthStore';
import useTeamStore from './store/useTeamStore';
import wsClient from './services/websocket';

// Modern Components
import NavigationModern from './components/NavigationModern';
import FilterBarModern from './components/FilterBarModern';
import ClipCardModern from './components/ClipCardModern';
import DetailSidebarModern from './components/DetailSidebarModern';
import { ToastProvider, useToast } from './components/ui/Toast';
import Card from './components/ui/Card';
import Button from './components/ui/Button';

// Existing Components (to be modernized later)
import FloatingActionButton from './components/FloatingActionButton';
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

// Icons
import { 
  Clipboard, 
  Sparkles, 
  Keyboard, 
  Command,
  Layers,
  Code2,
  Zap,
  GitBranch,
  Workflow,
  X
} from 'lucide-react';

// Modern Clip List Component
const ClipListModern = ({ onShareClick }) => {
  const { getFilteredClips, isLoading } = useClipStore();
  const clips = getFilteredClips();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div 
            key={i}
            className="h-32 bg-zinc-100 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <Card variant="gradient" padding="xl" className="text-center">
        <div className="py-8">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-violet-500 rounded-3xl opacity-20 animate-pulse" />
            <div className="absolute inset-3 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <Clipboard className="w-10 h-10 text-violet-500" strokeWidth={1.5} />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-zinc-900 mb-2">
            No clips yet
          </h3>
          <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
            Copy something to your clipboard and it will appear here automatically
          </p>
          
          <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-zinc-100 rounded-lg font-mono">Ctrl+C</kbd>
              <span>to copy</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-zinc-100 rounded-lg font-mono">Ctrl+V</kbd>
              <span>to paste</span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {clips.map(clip => (
        <ClipCardModern 
          key={clip.id} 
          clip={clip} 
          onShareClick={onShareClick}
        />
      ))}
    </div>
  );
};

// Modern Keyboard Shortcuts Panel
const KeyboardShortcutsPanel = ({ onClose }) => {
  const shortcuts = [
    { keys: ['Ctrl', 'K'], label: 'Command Palette', icon: Command },
    { keys: ['Ctrl', 'Shift', 'S'], label: 'Snippets', icon: Layers },
    { keys: ['Ctrl', 'Shift', 'D'], label: 'Dev Tools', icon: Code2 },
    { keys: ['Ctrl', 'Shift', 'G'], label: 'Git Helper', icon: GitBranch },
    { keys: ['Ctrl', 'Shift', 'W'], label: 'Workflows', icon: Workflow },
  ];

  return (
    <Card 
      variant="elevated" 
      padding="md" 
      className="fixed bottom-4 right-4 w-72 animate-slideUp"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-violet-500" strokeWidth={2} />
          <span className="font-semibold text-zinc-900 text-sm">Shortcuts</span>
        </div>
        <button 
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4 text-zinc-400" strokeWidth={2} />
        </button>
      </div>
      
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => {
          const Icon = shortcut.icon;
          return (
            <div 
              key={index}
              className="flex items-center justify-between py-1.5"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-zinc-400" strokeWidth={2} />
                <span className="text-xs text-zinc-600">{shortcut.label}</span>
              </div>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, i) => (
                  <kbd 
                    key={i}
                    className="px-1.5 py-0.5 bg-zinc-100 rounded text-[10px] font-mono text-zinc-600"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// Main App Content
function AppContent() {
  const { initialize, addClip, syncClipFromRemote, updateClipFromRemote, deleteClipFromRemote, activeTab } = useClipStore();
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
  const [showShortcuts, setShowShortcuts] = useState(true);
  const [syncStatus, setSyncStatus] = useState('disconnected');

  // Initialize auth and app
  useEffect(() => {
    const init = async () => {
      await initAuth();
      await initialize();
    };
    init();
  }, [initAuth, initialize]);

  // WebSocket sync listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    wsClient.on('connection-status', ({ connected }) => {
      setSyncStatus(connected ? 'connected' : 'disconnected');
    });

    wsClient.on('reconnecting', () => {
      setSyncStatus('reconnecting');
    });

    wsClient.on('clip:created', (clip) => syncClipFromRemote(clip));
    wsClient.on('clip:updated', (clip) => updateClipFromRemote(clip));
    wsClient.on('clip:deleted', (clipId) => deleteClipFromRemote(clipId));
    wsClient.on('team-clip:created', ({ teamId, clip }) => syncTeamClipFromRemote(teamId, clip));
    wsClient.on('team-clip:updated', ({ teamId, clip }) => updateTeamClipFromRemote(teamId, clip));
    wsClient.on('team-clip:deleted', ({ teamId, clipId }) => deleteTeamClipFromRemote(teamId, clipId));

    return () => {
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

  // Clipboard listeners
  useEffect(() => {
    const handlePaste = async (e) => {
      try {
        const text = e.clipboardData.getData('text');
        if (text) await addClip(text);
      } catch (error) {
        console.error('Failed to capture clipboard:', error);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [addClip]);

  // Electron clipboard monitoring
  useEffect(() => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      console.log('Electron detected - setting up clipboard monitoring');
      
      const cleanup = window.electronAPI.onClipboardChanged(async (text) => {
        if (text) await addClip(text);
      });

      const cleanupQuickPaste = window.electronAPI.onQuickPaste(() => {
        setShowCommandPalette(true);
      });

      const cleanupSettings = window.electronAPI.onOpenSettings(() => {
        setShowSettings(true);
      });

      return () => {
        if (cleanup) cleanup();
        if (cleanupQuickPaste) cleanupQuickPaste();
        if (cleanupSettings) cleanupSettings();
      };
    }
  }, [addClip]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 's') {
        e.preventDefault();
        setShowSnippetLibrary(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'd') {
        e.preventDefault();
        setShowDevTools(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'g') {
        e.preventDefault();
        setShowGitHelper(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'w') {
        e.preventDefault();
        setShowWorkflowAutomation(true);
      }
      if (e.key === 'Escape') {
        if (showCommandPalette) setShowCommandPalette(false);
        else if (showSnippetLibrary) setShowSnippetLibrary(false);
        else if (showDevTools) setShowDevTools(false);
        else if (showGitHelper) setShowGitHelper(false);
        else if (showWorkflowAutomation) setShowWorkflowAutomation(false);
        else { 
          useClipStore.getState().clearSelection();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette, showSnippetLibrary, showDevTools, showGitHelper, showWorkflowAutomation]);

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-violet-600 rounded-2xl animate-pulse" />
            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
              <Clipboard className="w-8 h-8 text-violet-500" strokeWidth={2} />
            </div>
          </div>
          <div className="inline-block w-8 h-8 border-2 border-zinc-200 border-t-violet-500 rounded-full animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Loading ClipSync...</p>
        </div>
      </div>
    );
  }

  // Full-screen views
  if (showSettings) return <SettingsScreen onClose={() => setShowSettings(false)} />;
  if (showPricing) return <PricingScreen onClose={() => setShowPricing(false)} />;
  if (showSnippetLibrary) return <SnippetLibrary onClose={() => setShowSnippetLibrary(false)} />;
  if (showDevTools) return <DevTools onClose={() => setShowDevTools(false)} />;
  if (showGitHelper) return <GitHelper onClose={() => setShowGitHelper(false)} />;
  if (showWorkflowAutomation) return <WorkflowAutomation onClose={() => setShowWorkflowAutomation(false)} />;

  // Teams view
  if (activeTab === 'team') {
    return (
      <>
        <NavigationModern 
          onSettingsClick={() => setShowSettings(true)}
          onPricingClick={() => setShowPricing(true)}
          onLoginClick={() => setShowAuthModal(true)}
          syncStatus={syncStatus}
        />
        <TeamsListScreen />
        <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
        {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      </>
    );
  }

  // Main view
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      <NavigationModern 
        onSettingsClick={() => setShowSettings(true)}
        onPricingClick={() => setShowPricing(true)}
        onLoginClick={() => setShowAuthModal(true)}
        syncStatus={syncStatus}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <FilterBarModern />
            <ClipListModern onShareClick={() => setShowShareModal(true)} />
          </div>

          {/* Right Sidebar */}
          <DetailSidebarModern onShareClick={() => setShowShareModal(true)} />
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Keyboard Shortcuts Panel */}
      {showShortcuts && (
        <KeyboardShortcutsPanel onClose={() => setShowShortcuts(false)} />
      )}

      {/* Modals */}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} />}
      <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

// App with Providers
function AppModern() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}

export default AppModern;
