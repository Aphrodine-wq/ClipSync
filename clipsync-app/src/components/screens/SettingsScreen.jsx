import { useState } from 'react';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Lock, 
  Star, 
  RefreshCw, 
  Monitor, 
  Brain, 
  Shield, 
  Trash2, 
  Download,
  Upload,
  Sparkles,
  Zap,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff
} from 'lucide-react';
import useClipStore from '../../store/useClipStore';
import useAuthStore from '../../store/useAuthStore';
import apiClient from '../../services/api';
import { getAllShortcuts, parseKeyCombo, validateShortcut, updateShortcut, resetShortcuts } from '../../utils/shortcuts';

const SettingsScreen = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const { clearAllClips, clips, incognitoMode, toggleIncognitoMode, exportClips, importClips, compactMode, toggleCompactMode } = useClipStore();
  const { user, updateUser } = useAuthStore();
  
  // Account editing state
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [editingPassword, setEditingPassword] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name || '');
  const [emailValue, setEmailValue] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all clips? This cannot be undone.')) {
      await clearAllClips();
    }
  };

  const handleExport = () => {
    try {
      exportClips();
      setSuccess('Clips exported successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to export clips');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setLoading(true);
      const imported = await importClips(file, 'merge');
      setSuccess(`Imported ${imported} clips successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to import clips');
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleUpdateName = async () => {
    if (!nameValue.trim()) {
      setError('Name cannot be empty');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiClient.updateProfile(nameValue.trim(), undefined);
      updateUser(data.user);
      setEditingName(false);
      setSuccess('Name updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update name');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!emailValue.trim()) {
      setError('Email cannot be empty');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue.trim())) {
      setError('Invalid email format');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await apiClient.updateProfile(undefined, emailValue.trim());
      updateUser(data.user);
      setEditingEmail(false);
      setSuccess('Email updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await apiClient.updatePassword(currentPassword, newPassword);
      setEditingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess('Password updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'sync', label: 'Sync & Devices', icon: RefreshCw },
    { id: 'ai', label: 'AI', icon: Brain },
    { id: 'privacy', label: 'Privacy & Data', icon: Shield },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Zap },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return renderAccountTab();
      case 'sync':
        return renderSyncTab();
      case 'ai':
        return renderAITab();
      case 'privacy':
        return renderPrivacyTab();
      case 'shortcuts':
        return renderKeyboardShortcutsTab();
      default:
        return renderAccountTab();
    }
  };

  const renderAccountTab = () => (
    <>
      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm flex items-center gap-2" style={{ border: '1px solid #A7F3D0' }}>
          <CheckCircle2 className="w-4 h-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-lg text-sm flex items-center gap-2" style={{ border: '1px solid #FCA5A5' }}>
          <Circle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white">
          <User className="w-8 h-8" />
        </div>
        <div>
          <p className="text-lg font-semibold text-zinc-900">{user?.name || 'Your Name'}</p>
          <p className="text-sm text-zinc-500">{user?.email || 'you@email.com'}</p>
        </div>
      </div>

      {/* Edit Name */}
      <div className="mb-4 p-4 bg-zinc-50 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
            <User className="w-4 h-4" />
            Name
          </label>
          {!editingName ? (
            <button 
              onClick={() => {
                setEditingName(true);
                setNameValue(user?.name || '');
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(user?.name || '');
                  setError('');
                }}
                className="text-sm text-zinc-600 hover:text-zinc-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateName}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        {editingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your name"
            disabled={loading}
          />
        ) : (
          <p className="text-sm text-zinc-600">{user?.name || 'Not set'}</p>
        )}
      </div>

      {/* Edit Email */}
      <div className="mb-4 p-4 bg-zinc-50 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </label>
          {!editingEmail ? (
            <button 
              onClick={() => {
                setEditingEmail(true);
                setEmailValue(user?.email || '');
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingEmail(false);
                  setEmailValue(user?.email || '');
                  setError('');
                }}
                className="text-sm text-zinc-600 hover:text-zinc-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateEmail}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        {editingEmail ? (
          <input
            type="email"
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            disabled={loading}
          />
        ) : (
          <p className="text-sm text-zinc-600">{user?.email || 'Not set'}</p>
        )}
      </div>

      {/* Change Password */}
      <div className="p-4 bg-zinc-50 rounded-xl" style={{ border: '1px solid #E5E5E5' }}>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-zinc-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Password
          </label>
          {!editingPassword ? (
            <button 
              onClick={() => {
                setEditingPassword(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Change
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingPassword(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                }}
                className="text-sm text-zinc-600 hover:text-zinc-700"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdatePassword}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>
        {editingPassword ? (
          <div className="space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Current password (optional for Google OAuth users)"
              disabled={loading}
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New password (min 8 characters)"
              disabled={loading}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              disabled={loading}
            />
          </div>
        ) : (
          <p className="text-sm text-zinc-600">••••••••</p>
        )}
      </div>

      {/* Plan Info */}
      <div className="mt-4 flex items-center justify-between p-4 bg-amber-50 rounded-xl" style={{ border: '1px solid #FDE68A' }}>
        <div className="flex items-center gap-3">
          <Star className="w-5 h-5 text-amber-700" />
          <div>
            <p className="text-sm font-semibold text-amber-800">{user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Free'} Plan</p>
            <p className="text-xs text-amber-600">Limited to 50 clips</p>
          </div>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
          Upgrade
        </button>
      </div>
    </>
  );

  const renderSyncTab = () => (
    <div className="divide-y divide-zinc-100">
      {[
        { name: 'This Browser', status: 'Active now', active: true },
      ].map((device, i) => (
        <div key={i} className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center">
              <Monitor className="w-6 h-6 text-zinc-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-800">{device.name}</p>
              <p className="text-xs text-zinc-500">{device.status}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-xs text-emerald-600 font-medium">Connected</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderAITab = () => (
    <>
      <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${ollamaConnected ? 'bg-emerald-50' : 'bg-zinc-50'}`} style={{ border: `1px solid ${ollamaConnected ? '#A7F3D0' : '#E5E5E5'}` }}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${ollamaConnected ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
            <Brain className={`w-6 h-6 ${ollamaConnected ? 'text-white' : 'text-zinc-500'}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${ollamaConnected ? 'text-emerald-800' : 'text-zinc-700'}`}>
              {ollamaConnected ? 'Ollama Connected' : 'Ollama Not Found'}
            </p>
            <p className={`text-xs ${ollamaConnected ? 'text-emerald-600' : 'text-zinc-500'}`}>
              {ollamaConnected ? 'Running llama3.2:3b' : 'AI features disabled'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setOllamaConnected(!ollamaConnected)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${ollamaConnected ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
        >
          {ollamaConnected ? 'Disconnect' : 'Setup'}
        </button>
      </div>
      <p className="text-xs text-zinc-500 leading-relaxed">
        Ollama runs AI models locally on your machine. Your clipboard data never leaves your device.{' '}
        <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more →</a>
      </p>
    </>
  );

  const [editingCommand, setEditingCommand] = useState(null);
  const [tempShortcut, setTempShortcut] = useState('');

  const renderKeyboardShortcutsTab = () => {
    const shortcuts = getAllShortcuts();
    
    const handleKeyDown = (command, event) => {
      event.preventDefault();
      const combo = getKeyString(event);
      setTempShortcut(combo);
      
      const validation = validateShortcut(combo, command);
      if (!validation.valid) {
        setError(`Shortcut conflicts with: ${validation.conflicts.join(', ')}`);
        setTimeout(() => setError(''), 3000);
        return;
      }
      
      updateShortcut(command, combo);
      setEditingCommand(null);
      setTempShortcut('');
      setSuccess('Shortcut updated successfully');
      setTimeout(() => setSuccess(''), 2000);
    };
    
    const shortcutLabels = {
      'command-palette': 'Command Palette',
      'new-clip': 'New Clip',
      'search': 'Search',
      'settings': 'Settings',
      'close': 'Close',
      'next-clip': 'Next Clip',
      'prev-clip': 'Previous Clip',
    };
    
    return (
      <div className="divide-y divide-zinc-100">
        {Object.entries(shortcuts).map(([command, shortcut]) => (
          <div key={command} className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-zinc-800">{shortcutLabels[command] || command}</p>
                <p className="text-xs text-zinc-500">Command: {command}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editingCommand === command ? (
                <input
                  type="text"
                  value={tempShortcut || shortcut}
                  onKeyDown={(e) => handleKeyDown(command, e)}
                  onBlur={() => setEditingCommand(null)}
                  className="px-3 py-2 bg-white border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono w-32"
                  placeholder="Press keys..."
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setEditingCommand(command);
                    setTempShortcut('');
                  }}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors font-mono"
                >
                  {shortcut || 'Not set'}
                </button>
              )}
            </div>
          </div>
        ))}
        <div className="pt-4">
          <button
            onClick={() => {
              if (confirm('Reset all shortcuts to defaults?')) {
                resetShortcuts();
                setSuccess('Shortcuts reset to defaults');
                setTimeout(() => setSuccess(''), 2000);
              }
            }}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors"
          >
            Reset to Defaults
          </button>
        </div>
      </div>
    );
  };

  const renderPrivacyTab = () => (
    <div className="divide-y divide-zinc-100">
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-sm font-medium text-zinc-800">End-to-end encryption</p>
            <p className="text-xs text-zinc-500">All synced clips are encrypted</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full">
          <CheckCircle2 className="w-4 h-4 text-zinc-600" />
          <span className="text-xs font-medium text-zinc-700">Local Only</span>
        </div>
      </div>
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {incognitoMode ? <EyeOff className="w-5 h-5 text-zinc-600" /> : <Eye className="w-5 h-5 text-zinc-600" />}
          <div>
            <p className="text-sm font-medium text-zinc-800">Incognito mode</p>
            <p className="text-xs text-zinc-500">{incognitoMode ? 'History recording paused' : 'History recording active'}</p>
          </div>
        </div>
        <button 
          onClick={toggleIncognitoMode}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            incognitoMode ? 'bg-red-500' : 'bg-zinc-300'
          }`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            incognitoMode ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-sm font-medium text-zinc-800">Compact mode</p>
            <p className="text-xs text-zinc-500">{compactMode ? 'Dense list view enabled' : 'Normal list view'}</p>
          </div>
        </div>
        <button 
          onClick={toggleCompactMode}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            compactMode ? 'bg-blue-500' : 'bg-zinc-300'
          }`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            compactMode ? 'translate-x-6' : 'translate-x-0'
          }`} />
        </button>
      </div>
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-sm font-medium text-zinc-800">Clipboard history</p>
            <p className="text-xs text-zinc-500">{clips.length} clips stored</p>
          </div>
        </div>
        <button 
          onClick={handleClearAll}
          className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          Clear all
        </button>
      </div>
      <div className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="w-5 h-5 text-zinc-600" />
          <div>
            <p className="text-sm font-medium text-zinc-800">Export data</p>
            <p className="text-xs text-zinc-500">Download all your clips as JSON</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExport}
            disabled={loading || clips.length === 0}
            className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={loading}
            />
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white transition-colors flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-zinc-600" />
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex border-b border-zinc-100 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? 'text-zinc-900 border-b-2 border-zinc-900 bg-zinc-50'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
