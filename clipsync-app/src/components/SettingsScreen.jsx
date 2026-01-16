import { useState } from 'react';
import useClipStore from '../store/useClipStore';

const SettingsScreen = ({ onClose }) => {
  const [ollamaConnected, setOllamaConnected] = useState(false);
  const { clearAllClips, clips } = useClipStore();

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all clips? This cannot be undone.')) {
      await clearAllClips();
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white transition-colors"
          >
            <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Account</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                Y
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-900">Your Name</p>
                <p className="text-sm text-zinc-500">you@email.com</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl" style={{ border: '1px solid #FDE68A' }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">⭐</span>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Free Plan</p>
                  <p className="text-xs text-amber-600">Limited to 50 clips</p>
                </div>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-100 rounded-lg transition-colors">
                Upgrade
              </button>
            </div>
          </div>
        </div>

        {/* Sync Section */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Sync & Devices</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            {[
              { name: 'This Browser', icon: '💻', status: 'Active now', active: true },
            ].map((device, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{device.icon}</span>
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
        </div>

        {/* AI Section */}
        <div className="bg-white rounded-2xl shadow-sm mb-6 overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Local AI (Ollama)</h2>
          </div>
          <div className="p-6">
            <div className={`flex items-center justify-between p-4 rounded-xl mb-4 ${ollamaConnected ? 'bg-emerald-50' : 'bg-zinc-50'}`} style={{ border: `1px solid ${ollamaConnected ? '#A7F3D0' : '#E5E5E5'}` }}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ollamaConnected ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
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
          </div>
        </div>

        {/* Privacy Section */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
          <div className="px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">Privacy & Data</h2>
          </div>
          <div className="divide-y divide-zinc-100">
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-800">End-to-end encryption</p>
                <p className="text-xs text-zinc-500">All synced clips are encrypted</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-full">
                <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-medium text-zinc-700">Local Only</span>
              </div>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-800">Clipboard history</p>
                <p className="text-xs text-zinc-500">{clips.length} clips stored</p>
              </div>
              <button 
                onClick={handleClearAll}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-800">Export data</p>
                <p className="text-xs text-zinc-500">Download all your clips as JSON</p>
              </div>
              <button className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
