import { useState } from 'react';
import { 
  Clipboard, 
  Users, 
  Star, 
  Search, 
  Settings, 
  LogIn,
  Zap,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import useClipStore from '../store/useClipStore';
import useAuthStore from '../store/useAuthStore';

const Navigation = ({ onSettingsClick, onPricingClick, onLoginClick, syncStatus = 'disconnected' }) => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useClipStore();
  const { isAuthenticated, user, logout } = useAuthStore();

  const tabs = [
    { id: 'history', label: 'History', icon: Clipboard },
    { id: 'team', label: 'Team Space', icon: Users, requiresAuth: true },
    { id: 'pinned', label: 'Pinned', icon: Star },
  ];

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'connected':
        return { bg: 'bg-emerald-50', dot: 'bg-emerald-500', text: 'text-emerald-700' };
      case 'reconnecting':
        return { bg: 'bg-amber-50', dot: 'bg-amber-500', text: 'text-amber-700' };
      case 'disconnected':
      default:
        return { bg: 'bg-zinc-100', dot: 'bg-zinc-400', text: 'text-zinc-600' };
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'connected':
        return 'Synced';
      case 'reconnecting':
        return 'Syncing...';
      case 'disconnected':
      default:
        return 'Local only';
    }
  };

  const statusColors = getSyncStatusColor();

  return (
    <nav className="bg-white shadow-sm px-6 py-4 sticky top-0 z-50" style={{ borderBottom: '1px solid #E5E5E5' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-700 rounded-xl flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
              <Clipboard className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">ClipSync</span>
          </div>

          {/* Main Tabs */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            {tabs.map(tab => {
              const isDisabled = tab.requiresAuth && !isAuthenticated;
              const IconComponent = tab.icon;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 ease-out
                    ${activeTab === tab.id 
                      ? 'bg-white text-zinc-900 shadow-sm' 
                      : isDisabled
                      ? 'text-zinc-400 cursor-not-allowed'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4" strokeWidth={2} />
                  {tab.label}
                  {isDisabled && (
                    <span className="text-xs bg-amber-400 text-zinc-900 px-1.5 py-0.5 rounded font-bold">
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative group">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-zinc-600 transition-colors" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search clips..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 pr-20 py-2.5 w-64 bg-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-mono bg-white px-1.5 py-0.5 rounded border border-zinc-200">⌘K</span>
          </div>

          {/* Sync Status */}
          {isAuthenticated && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${statusColors.bg} transition-all`}>
              {syncStatus === 'connected' ? (
                <CheckCircle2 className={`w-4 h-4 ${statusColors.text}`} strokeWidth={2} />
              ) : syncStatus === 'reconnecting' ? (
                <AlertCircle className={`w-4 h-4 ${statusColors.text} animate-pulse`} strokeWidth={2} />
              ) : (
                <WifiOff className={`w-4 h-4 ${statusColors.text}`} strokeWidth={2} />
              )}
              <span className={`text-xs font-medium ${statusColors.text}`}>
                {getSyncStatusText()}
              </span>
            </div>
          )}

          {/* Settings Icon */}
          <button 
            onClick={onSettingsClick}
            className="p-2.5 rounded-lg hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-zinc-600 hover:text-zinc-900 transition-colors" strokeWidth={2} />
          </button>

          {/* User Menu or Login */}
          {isAuthenticated ? (
            <>
              {/* Pricing Link for Free Users */}
              {user?.plan === 'free' && (
                <button 
                  onClick={onPricingClick}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-900 rounded-lg text-sm font-semibold hover:from-amber-500 hover:to-amber-600 transition-all hover:shadow-md hover:scale-105 active:scale-95"
                >
                  <Zap className="w-4 h-4" strokeWidth={2.5} />
                  Upgrade
                </button>
              )}

              {/* User Avatar with Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 bg-zinc-900 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-zinc-200">
                    <p className="text-sm font-medium text-zinc-900">{user?.name}</p>
                    <p className="text-xs text-zinc-500">{user?.email}</p>
                    <span className="inline-block mt-1 text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                      {user?.plan?.toUpperCase()} Plan
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-xl transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={onPricingClick}
                className="px-3 py-2 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-all"
              >
                Pricing
              </button>
              <button 
                onClick={onLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-semibold hover:bg-zinc-800 transition-all hover:shadow-md hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4" strokeWidth={2} />
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
