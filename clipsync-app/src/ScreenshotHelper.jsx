/**
 * Screenshot Helper Component
 *
 * This component allows you to render any ClipSync component in isolation
 * for easy screenshot capture. Perfect for creating marketing materials
 * and documentation screenshots.
 *
 * Usage:
 * 1. Add route to router: /screenshots
 * 2. Navigate to http://localhost:5173/screenshots
 * 3. Click buttons to show different components
 * 4. Capture screenshots with browser DevTools
 */

import { useState } from 'react';
import AuthModal from './components/AuthModal';
import PaywallModal from './components/PaywallModal';
import PricingScreen from './components/PricingScreen';
import DeviceManagement from './components/DeviceManagement';
import UsageQuota from './components/UsageQuota';

const ScreenshotHelper = () => {
  const [currentView, setCurrentView] = useState('menu');
  const [showModal, setShowModal] = useState(false);

  // Sample data
  const sampleDevices = [
    {
      id: '1',
      name: 'MacBook Pro',
      type: 'desktop',
      lastActivity: new Date().toISOString(),
    },
  ];

  const scenarios = {
    // Auth Modal
    authModal: {
      title: 'Auth Modal',
      component: () => <AuthModal onClose={() => setShowModal(false)} />,
    },

    // Paywall Modals
    paywallDevice: {
      title: 'Paywall - Device Limit',
      component: () => (
        <PaywallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          limitType="device"
          currentPlan="free"
          currentValue={2}
          maxValue={1}
        />
      ),
    },

    paywallClip: {
      title: 'Paywall - Clip Limit',
      component: () => (
        <PaywallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          limitType="clip"
          currentPlan="free"
          currentValue={50}
          maxValue={50}
          resetDate="2026-02-01"
        />
      ),
    },

    paywallStorage: {
      title: 'Paywall - Storage Limit',
      component: () => (
        <PaywallModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          limitType="storage"
          currentPlan="free"
          currentValue={100}
          maxValue={100}
        />
      ),
    },

    // Pricing Screen
    pricingScreen: {
      title: 'Pricing Screen',
      fullScreen: true,
      component: () => (
        <PricingScreen
          onClose={() => setCurrentView('menu')}
          currentPlan="free"
        />
      ),
    },

    // Device Management
    deviceManagement: {
      title: 'Device Management',
      component: () => (
        <div className="max-w-2xl mx-auto p-8">
          <DeviceManagement
            devices={sampleDevices}
            maxDevices={1}
            currentPlan="free"
          />
        </div>
      ),
    },

    // Usage Quota - Good State (50% usage)
    usageQuotaGood: {
      title: 'Usage Quota - Good (50%)',
      component: () => (
        <div className="max-w-4xl mx-auto p-8">
          <UsageQuota
            clipsThisMonth={25}
            clipsLimit={50}
            storageUsedMB={50}
            storageLimitMB={102.4}
            currentPlan="free"
          />
        </div>
      ),
    },

    // Usage Quota - Warning State (85% usage)
    usageQuotaWarning: {
      title: 'Usage Quota - Warning (85%)',
      component: () => (
        <div className="max-w-4xl mx-auto p-8">
          <UsageQuota
            clipsThisMonth={42}
            clipsLimit={50}
            storageUsedMB={87}
            storageLimitMB={102.4}
            currentPlan="free"
          />
        </div>
      ),
    },

    // Usage Quota - Critical State (100% usage)
    usageQuotaCritical: {
      title: 'Usage Quota - Critical (100%)',
      component: () => (
        <div className="max-w-4xl mx-auto p-8">
          <UsageQuota
            clipsThisMonth={50}
            clipsLimit={50}
            storageUsedMB={102}
            storageLimitMB={102.4}
            currentPlan="free"
          />
        </div>
      ),
    },
  };

  const renderMenu = () => (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">
            📸 Screenshot Helper
          </h1>
          <p className="text-zinc-600 mb-6">
            Click any button below to render the component in isolation for easy screenshot capture.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">How to capture:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Click a button to show the component</li>
              <li>2. Press F12 to open DevTools</li>
              <li>3. Press Ctrl+Shift+P (Windows) or Cmd+Shift+P (Mac)</li>
              <li>4. Type "screenshot" and select "Capture screenshot"</li>
              <li>5. Save to <code className="bg-blue-100 px-1 rounded">screenshots/</code> folder</li>
            </ol>
          </div>
        </div>

        {/* Modals Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Modals</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setCurrentView('authModal');
                setShowModal(true);
              }}
              className="p-4 bg-indigo-50 hover:bg-indigo-100 border-2 border-indigo-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-indigo-900">Auth Modal</div>
              <div className="text-sm text-indigo-600">Login screen with OAuth</div>
            </button>

            <button
              onClick={() => {
                setCurrentView('paywallDevice');
                setShowModal(true);
              }}
              className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-purple-900">Paywall - Device</div>
              <div className="text-sm text-purple-600">Device limit reached</div>
            </button>

            <button
              onClick={() => {
                setCurrentView('paywallClip');
                setShowModal(true);
              }}
              className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-purple-900">Paywall - Clip</div>
              <div className="text-sm text-purple-600">Clip limit reached</div>
            </button>

            <button
              onClick={() => {
                setCurrentView('paywallStorage');
                setShowModal(true);
              }}
              className="p-4 bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-purple-900">Paywall - Storage</div>
              <div className="text-sm text-purple-600">Storage limit reached</div>
            </button>
          </div>
        </div>

        {/* Full Screens Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Full Screens</h2>
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setCurrentView('pricingScreen')}
              className="p-4 bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-green-900">Pricing Screen</div>
              <div className="text-sm text-green-600">All 4 pricing tiers</div>
            </button>
          </div>
        </div>

        {/* Components Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Components</h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('deviceManagement')}
              className="p-4 bg-amber-50 hover:bg-amber-100 border-2 border-amber-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-amber-900">Device Management</div>
              <div className="text-sm text-amber-600">Device list & limits</div>
            </button>

            <button
              onClick={() => setCurrentView('usageQuotaGood')}
              className="p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-blue-900">Usage Quota - Good</div>
              <div className="text-sm text-blue-600">50% usage (green)</div>
            </button>

            <button
              onClick={() => setCurrentView('usageQuotaWarning')}
              className="p-4 bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-orange-900">Usage Quota - Warning</div>
              <div className="text-sm text-orange-600">85% usage (amber)</div>
            </button>

            <button
              onClick={() => setCurrentView('usageQuotaCritical')}
              className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-lg text-left transition-colors"
            >
              <div className="font-semibold text-red-900">Usage Quota - Critical</div>
              <div className="text-sm text-red-600">100% usage (red)</div>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-zinc-50 rounded-lg p-6 border border-zinc-200">
          <h3 className="font-semibold text-zinc-900 mb-2">💡 Tips</h3>
          <ul className="text-sm text-zinc-600 space-y-1">
            <li>• For best quality, capture at 1920x1080 resolution</li>
            <li>• Use "Capture full size screenshot" for scrollable content</li>
            <li>• Make sure to capture modals with backdrop visible</li>
            <li>• Save files as PNG for best quality</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    if (currentView === 'menu') {
      return renderMenu();
    }

    const scenario = scenarios[currentView];
    if (!scenario) {
      return renderMenu();
    }

    return (
      <div className={scenario.fullScreen ? '' : 'min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100'}>
        {!scenario.fullScreen && (
          <div className="p-4">
            <button
              onClick={() => {
                setCurrentView('menu');
                setShowModal(false);
              }}
              className="px-4 py-2 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              ← Back to Menu
            </button>
          </div>
        )}

        <div className="relative">
          <div className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold z-50 shadow-lg">
            {scenario.title}
          </div>
          {scenario.component()}
        </div>
      </div>
    );
  };

  return renderCurrentView();
};

export default ScreenshotHelper;
