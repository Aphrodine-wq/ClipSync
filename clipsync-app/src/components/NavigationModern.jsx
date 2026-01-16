import { useState, useEffect } from 'react';
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
  WifiOff,
  Bell,
  Command,
  ChevronDown,
  LogOut,
  User,
  CreditCard,
  HelpCircle,
  Moon,
  Sun,
  Sparkles,
  Crown
} from 'lucide-react';
import useClipStore from '../store/useClipStore';
import useAuthStore from '../store/useAuthStore';
import Button from './ui/Button';
import Badge from './ui/Badge';

const NavigationModern = ({ 
  onSettingsClick, 
  onPricingClick, 
  onLoginClick, 
  syncStatus = 'disconnected' 
}) => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery } = useClipStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Tabs configuration
  const tabs = [
    { id: 'history', label: 'History', icon: Clipboard },
    { id: 'team', label: 'Team Space', icon: Users, requiresAuth: true, badge: 'New' },
    { id: 'pinned', label: 'Pinned', icon: Star },
  ];

  // Sync status configuration
  const syncConfig = {
    connected: {
      icon: CheckCircle2,
      label: 'Synced',
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
      dot: 'bg-emerald-500',
    },
    reconnecting: {
      icon: AlertCircle,
      label: 'Syncing...',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
      dot: 'bg-amber-500 animate-pulse',
    },
    disconnected: {
      icon: WifiOff,
      label: 'Offline',
      color: 'text-zinc-400',
      bg: 'bg-zinc-100',
      dot: 'bg-zinc-400',
    },
  };

  const currentSync = syncConfig[syncStatus] || syncConfig.disconnected;
  const SyncIcon = currentSync.icon;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
      setShowNotifications(false);
    };
    
    if (showUserMenu || showNotifications) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu, showNotifications]);

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
                  <Clipboard className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                {/* Animated ring on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 opacity-0 group-hover:opacity-20 scale-150 transition-all duration-300" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  ClipSync
                </span>
                <Badge variant="gradientPrimary" size="xs" className="ml-2">
                  Pro
                </Badge>
              </div>
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-1 p-1 bg-zinc-100/80 rounded-xl">
              {tabs.map(tab => {
                if (tab.requiresAuth && !isAuthenticated) return null;
                
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative
                      flex items-center gap-2
                      px-4 py-2
                      rounded-lg
                      text-sm font-medium
                      transition-all duration-200
                      ${isActive 
                        ? 'bg-white text-zinc-900 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-white/50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" strokeWidth={2} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <Badge variant="danger" size="xs">
                        {tab.badge}
                      </Badge>
                    )}
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-violet-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className={`
              relative
              transition-all duration-200
              ${searchFocused ? 'scale-105' : ''}
            `}>
              <Search 
                className={`
                  absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4
                  transition-colors duration-200
                  ${searchFocused ? 'text-violet-500' : 'text-zinc-400'}
                `} 
                strokeWidth={2} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search clips..."
                className={`
                  w-full
                  pl-10 pr-12
                  py-2.5
                  bg-zinc-100/80
                  border-2 border-transparent
                  rounded-xl
                  text-sm
                  placeholder:text-zinc-400
                  transition-all duration-200
                  ${searchFocused 
                    ? 'bg-white border-violet-500 ring-4 ring-violet-500/10' 
                    : 'hover:bg-zinc-100'
                  }
                `}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-zinc-200 rounded text-xs text-zinc-500 font-mono">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Sync Status */}
            <div 
              className={`
                flex items-center gap-2
                px-3 py-1.5
                rounded-lg
                ${currentSync.bg}
              `}
            >
              <div className={`w-2 h-2 rounded-full ${currentSync.dot}`} />
              <SyncIcon className={`w-4 h-4 ${currentSync.color}`} strokeWidth={2} />
              <span className={`text-xs font-medium ${currentSync.color}`}>
                {currentSync.label}
              </span>
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-zinc-600" strokeWidth={2} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div 
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-4 py-2 border-b border-zinc-100">
                        <h3 className="font-semibold text-zinc-900">Notifications</h3>
                      </div>
                      <div className="p-4 text-center text-sm text-zinc-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 text-zinc-300" strokeWidth={1.5} />
                        No new notifications
                      </div>
                    </div>
                  )}
                </div>

                {/* Settings */}
                <button
                  onClick={onSettingsClick}
                  className="p-2 rounded-xl hover:bg-zinc-100 transition-colors"
                >
                  <Settings className="w-5 h-5 text-zinc-600" strokeWidth={2} />
                </button>

                {/* Upgrade Button */}
                {user?.plan !== 'pro' && (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Crown}
                    onClick={onPricingClick}
                  >
                    Upgrade
                  </Button>
                )}

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-zinc-100 transition-colors"
                  >
                    {user?.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                        {user?.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <ChevronDown 
                      className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} 
                      strokeWidth={2} 
                    />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-zinc-200 py-2 animate-fadeIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-zinc-100">
                        <p className="font-semibold text-zinc-900">{user?.name}</p>
                        <p className="text-sm text-zinc-500">{user?.email}</p>
                        <Badge 
                          variant={user?.plan === 'pro' ? 'gradientPrimary' : 'default'} 
                          size="sm" 
                          className="mt-2"
                        >
                          {user?.plan?.toUpperCase() || 'FREE'} Plan
                        </Badge>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                          <User className="w-4 h-4" strokeWidth={2} />
                          Profile
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                          <CreditCard className="w-4 h-4" strokeWidth={2} />
                          Billing
                        </button>
                        <button 
                          onClick={() => setIsDarkMode(!isDarkMode)}
                          className="w-full flex items-center justify-between px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {isDarkMode ? (
                              <Moon className="w-4 h-4" strokeWidth={2} />
                            ) : (
                              <Sun className="w-4 h-4" strokeWidth={2} />
                            )}
                            Dark Mode
                          </div>
                          <div className={`w-8 h-5 rounded-full transition-colors ${isDarkMode ? 'bg-violet-500' : 'bg-zinc-200'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mt-0.5 ${isDarkMode ? 'translate-x-3.5 ml-0' : 'ml-0.5'}`} />
                          </div>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                          <HelpCircle className="w-4 h-4" strokeWidth={2} />
                          Help & Support
                        </button>
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-zinc-100 pt-2">
                        <button 
                          onClick={logout}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" strokeWidth={2} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <button 
                  onClick={onPricingClick}
                  className="px-3 py-2 text-zinc-600 rounded-lg text-sm font-medium hover:bg-zinc-100 transition-colors"
                >
                  Pricing
                </button>
                <Button
                  variant="primary"
                  size="md"
                  icon={LogIn}
                  onClick={onLoginClick}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationModern;
