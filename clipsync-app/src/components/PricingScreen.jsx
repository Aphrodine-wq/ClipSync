const PricingScreen = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button 
          onClick={onClose}
          className="mb-8 p-2 rounded-lg hover:bg-white transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-lg text-zinc-600">Start free, upgrade when you need more</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-1">Free</h3>
              <p className="text-sm text-zinc-500">For personal use</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900">$0</span>
              <span className="text-zinc-500 ml-2">forever</span>
            </div>
            <ul className="space-y-3 mb-8">
              {['50 clip history', '1 device', 'Basic transforms', 'Local storage only'].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all duration-150">
              Current Plan
            </button>
          </div>

          {/* Pro - Highlighted */}
          <div className="bg-zinc-900 rounded-3xl p-8 shadow-xl relative scale-105">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
              MOST POPULAR
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-1">Pro</h3>
              <p className="text-sm text-zinc-400">For power users</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-white">$6</span>
              <span className="text-zinc-400 ml-2">/month</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Unlimited history',
                'Unlimited devices',
                'Cross-device sync',
                'All transforms & utils',
                'Ollama AI integration',
                'Pinned clips & folders',
                'Share links',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold text-zinc-900 bg-white hover:bg-zinc-100 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]">
              Start Free Trial
            </button>
          </div>

          {/* Team */}
          <div className="bg-white rounded-3xl p-8 shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-zinc-800 mb-1">Team</h3>
              <p className="text-sm text-zinc-500">For collaboration</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold text-zinc-900">$9</span>
              <span className="text-zinc-500 ml-2">/user/mo</span>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                'Everything in Pro',
                'Unlimited team spaces',
                'Admin controls',
                'Shared pin libraries',
                'Audit log',
                'SSO (Google, GitHub)',
                'API access',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-all duration-150">
              Contact Sales
            </button>
          </div>
        </div>

        {/* Lifetime Option */}
        <div className="mt-12 bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💎</span>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Pro Lifetime</h4>
              <p className="text-sm text-zinc-500">One-time payment, yours forever</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div>
              <span className="text-3xl font-bold text-zinc-900">$99</span>
              <span className="text-zinc-500 ml-2">one-time</span>
            </div>
            <button className="px-6 py-3 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all">
              Buy Lifetime
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingScreen;
