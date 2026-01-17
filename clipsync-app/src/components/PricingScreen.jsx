/**
 * Pricing Screen Component
 *
 * Displays all available plans with detailed comparison
 * Plans: Free, Professional, Business, Enterprise
 */

import { Check, ArrowRight } from 'lucide-react';

const PricingScreen = ({ onClose, currentPlan = 'free' }) => {
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      billing: 'forever',
      icon: '🚀',
      highlighted: false,
      features: [
        { text: '50 clips per month', included: true },
        { text: '1 device', included: true },
        { text: '100MB storage', included: true },
        { text: 'Offline support', included: true },
        { text: 'Basic search', included: true },
        { text: 'Team sharing', included: false },
        { text: 'API access', included: false },
        { text: 'Priority support', included: false },
      ],
      cta: currentPlan === 'free' ? 'Current Plan' : 'Get Started',
    },
    {
      name: 'Professional',
      description: 'For power users',
      price: 9.99,
      billing: '/month',
      icon: '⚡',
      highlighted: true,
      features: [
        { text: '500 clips per month', included: true },
        { text: '3 devices', included: true },
        { text: '1GB storage', included: true },
        { text: 'Cross-device sync', included: true },
        { text: 'Advanced search', included: true },
        { text: 'Team sharing (5 members)', included: true },
        { text: 'API access', included: true },
        { text: 'Email support', included: true },
      ],
      cta: currentPlan === 'professional' ? 'Current Plan' : 'Upgrade Now',
    },
    {
      name: 'Business',
      description: 'For teams and enterprises',
      price: 19.99,
      billing: '/month',
      icon: '💼',
      highlighted: false,
      features: [
        { text: '5,000 clips per month', included: true },
        { text: '10 devices', included: true },
        { text: '10GB storage', included: true },
        { text: 'Real-time collaboration', included: true },
        { text: 'Semantic search (AI)', included: true },
        { text: 'Team sharing (50 members)', included: true },
        { text: 'Advanced API', included: true },
        { text: 'Priority support & SSO', included: true },
      ],
      cta: currentPlan === 'business' ? 'Current Plan' : 'Upgrade Now',
    },
    {
      name: 'Enterprise',
      description: 'Unlimited everything',
      price: null,
      billing: 'custom',
      icon: '👑',
      highlighted: false,
      features: [
        { text: 'Unlimited clips', included: true },
        { text: 'Unlimited devices', included: true },
        { text: 'Unlimited storage', included: true },
        { text: 'Advanced collaboration', included: true },
        { text: 'Full AI integration', included: true },
        { text: 'Unlimited team members', included: true },
        { text: 'Webhooks & automation', included: true },
        { text: '24/7 phone & email support', included: true },
      ],
      cta: 'Contact Sales',
    },
  ];

  const handleUpgrade = (planName) => {
    if (planName === 'Enterprise') {
      window.location.href = '/contact';
    } else {
      window.location.href = `/checkout/${planName.toLowerCase()}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 py-16 px-6">
      <div className="max-w-7xl mx-auto">
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
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-zinc-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-zinc-600">
            Start free, upgrade when you need more. No credit card required.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-2xl p-8 relative transition-all duration-300 ${
                plan.highlighted
                  ? 'bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white shadow-2xl scale-105 ring-2 ring-white'
                  : 'bg-white border border-zinc-200 text-zinc-900 shadow-sm hover:shadow-lg'
              }`}
            >
              {/* Badge */}
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-400 text-zinc-900 text-xs font-bold rounded-full whitespace-nowrap">
                  MOST POPULAR
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8">
                <div className="text-3xl mb-3">{plan.icon}</div>
                <h3 className={`text-2xl font-bold mb-1 ${plan.highlighted ? 'text-white' : 'text-zinc-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-zinc-500'}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8">
                {plan.price !== null ? (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-zinc-900'}`}>
                        ${plan.price.toFixed(2)}
                      </span>
                      <span className={plan.highlighted ? 'text-indigo-100' : 'text-zinc-500'}>
                        {plan.billing}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className={`text-sm font-semibold ${plan.highlighted ? 'text-indigo-100' : 'text-zinc-500'}`}>
                    Custom Pricing
                  </div>
                )}
              </div>

              {/* Features List */}
              <div className="mb-8 space-y-3">
                {plan.features.map((feature, fIndex) => (
                  <div
                    key={fIndex}
                    className={`flex items-center gap-3 text-sm ${
                      plan.highlighted
                        ? feature.included
                          ? 'text-white'
                          : 'text-indigo-200'
                        : feature.included
                        ? 'text-zinc-700'
                        : 'text-zinc-400'
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        feature.included
                          ? plan.highlighted
                            ? 'bg-white/20'
                            : 'bg-indigo-100'
                          : 'bg-zinc-100'
                      }`}
                    >
                      {feature.included && (
                        <Check className={`w-3 h-3 ${plan.highlighted ? 'text-white' : 'text-indigo-600'}`} />
                      )}
                    </div>
                    <span className={feature.included ? '' : 'opacity-60'}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={() => handleUpgrade(plan.name)}
                className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  plan.highlighted
                    ? 'bg-white text-indigo-600 hover:bg-zinc-100 active:scale-95'
                    : currentPlan === plan.name.toLowerCase()
                    ? `${plan.highlighted ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'} cursor-default`
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
                disabled={currentPlan === plan.name.toLowerCase()}
              >
                {plan.cta}
                {plan.cta !== 'Current Plan' && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-semibold text-zinc-900">Feature</th>
                  {plans.map((plan, i) => (
                    <th key={i} className="px-8 py-4 text-center text-sm font-semibold text-zinc-900">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {[
                  { label: 'Clips per month', free: '50', pro: '500', business: '5,000', enterprise: '∞' },
                  { label: 'Devices', free: '1', pro: '3', business: '10', enterprise: '∞' },
                  { label: 'Storage', free: '100MB', pro: '1GB', business: '10GB', enterprise: '∞' },
                  { label: 'Cross-device sync', free: '✗', pro: '✓', business: '✓', enterprise: '✓' },
                  { label: 'Team collaboration', free: '✗', pro: '5 members', business: '50 members', enterprise: '∞' },
                  { label: 'API access', free: '✗', pro: '✓', business: '✓', enterprise: '✓' },
                  { label: 'Advanced search (AI)', free: '✗', pro: '✗', business: '✓', enterprise: '✓' },
                  { label: 'Priority support', free: '✗', pro: '✓', business: '✓', enterprise: '✓' },
                ].map((row, rIndex) => (
                  <tr key={rIndex} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-8 py-4 text-sm font-medium text-zinc-900">{row.label}</td>
                    <td className="px-8 py-4 text-center text-sm text-zinc-600">{row.free}</td>
                    <td className="px-8 py-4 text-center text-sm font-semibold text-indigo-600 bg-indigo-50/50">
                      {row.pro}
                    </td>
                    <td className="px-8 py-4 text-center text-sm text-zinc-600">{row.business}</td>
                    <td className="px-8 py-4 text-center text-sm text-zinc-600">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-zinc-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'Can I change my plan anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'What happens if I exceed my limit?',
                a: 'You can still use ClipSync, but you'll be prompted to upgrade to continue creating new clips.',
              },
              {
                q: 'Do you offer a trial period?',
                a: 'Absolutely! Start with our free plan with 50 clips per month. Upgrade anytime with no hidden fees.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and other payment methods through Stripe.',
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border border-zinc-200 rounded-lg p-6 cursor-pointer">
                <summary className="flex justify-between items-center font-semibold text-zinc-900 group-open:text-indigo-600">
                  {faq.q}
                  <span className="transition group-open:rotate-180">▼</span>
                </summary>
                <p className="mt-4 text-zinc-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingScreen;
