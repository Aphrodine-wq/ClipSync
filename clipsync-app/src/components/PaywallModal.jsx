/**
 * Paywall Modal Component
 * Shows upgrade prompt when device limit is exceeded
 */

import { useEffect } from 'react';
import { X, Zap, Shield, Infinity, Check } from 'lucide-react';

const PaywallModal = ({ isOpen, onClose, currentPlan = 'free', requiredPlan = 'pro', currentDevices = 1, maxDevices = 1 }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = () => {
    // Navigate to pricing or trigger upgrade flow
    window.location.href = '/pricing';
  };

  const features = [
    { icon: Infinity, text: 'Unlimited devices' },
    { icon: Zap, text: 'Advanced features' },
    { icon: Shield, text: 'Priority support' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full animate-slideUp">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 rounded-t-2xl p-6 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIzMCIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="mt-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Device Limit Reached</h2>
                  <p className="text-white/80 text-sm">Upgrade to unlock more</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-zinc-600">Current Plan</span>
              <span className="px-3 py-1 bg-zinc-200 rounded-full text-xs font-semibold text-zinc-700 uppercase">
                {currentPlan}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600">Devices Used</span>
              <span className="text-lg font-bold text-zinc-900">
                {currentDevices} / {maxDevices}
              </span>
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <p className="text-zinc-700 leading-relaxed">
              Your <span className="font-semibold">{currentPlan}</span> plan allows {maxDevices} device{maxDevices !== 1 ? 's' : ''}. 
              You're currently using {currentDevices} device{currentDevices !== 1 ? 's' : ''}.
            </p>
            <p className="text-zinc-600 text-sm mt-2">
              Upgrade to <span className="font-semibold text-indigo-600">{requiredPlan}</span> to use ClipSync on unlimited devices.
            </p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3">What you'll get with {requiredPlan}:</h3>
            <div className="space-y-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div 
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100 animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">{feature.text}</span>
                    <Check className="w-4 h-4 text-green-500 ml-auto" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium rounded-xl transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/50"
            >
              Upgrade Now
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PaywallModal;

