import { useState } from 'react';
import {
  ClipboardList,
  RefreshCw,
  Users,
  Zap,
  Brain,
  Shield,
  Command,
  BookOpen,
  Code,
  GitBranch,
  Wrench,
  Sparkles,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
  Globe,
  Lock,
  ArrowRight,
  ChevronDown,
  Play,
  Download,
  Github,
  Twitter,
  Linkedin
} from 'lucide-react';

const LandingPage = ({ onGetStarted, onDevMode }) => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: ClipboardList,
      title: 'Unlimited Clipboard History',
      description: 'Never lose a copied snippet. Access your entire clipboard history with powerful search and instant retrieval.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: RefreshCw,
      title: 'Real-Time Sync',
      description: 'Sync clipboard across all your devices instantly. Copy on one device, paste on another - seamless experience.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Share clips with your team in real-time. Perfect for pair programming, code sharing, and knowledge transfer.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      icon: Zap,
      title: '50+ Text Transforms',
      description: 'Developer utilities: JSON formatting, case conversion, encoding, hashing, UUID generation, and more.',
      color: 'from-amber-500 to-amber-600'
    },
    {
      icon: Brain,
      title: 'Local AI Integration',
      description: 'Smart categorization and duplicate detection powered by Ollama - all running locally on your machine.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'End-to-end encryption. Your clipboard data never leaves your control. Privacy by design.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: Command,
      title: 'Command Palette',
      description: 'Lightning-fast access with Ctrl+K. Search, transform, and manage clips instantly with keyboard shortcuts.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: BookOpen,
      title: 'Snippet Library',
      description: 'Organize and share code snippets with syntax highlighting, categories, and full-text search.',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const devTools = [
    { icon: Command, name: 'Command Palette', desc: '50+ commands at your fingertips' },
    { icon: Wrench, name: 'Developer Tools', desc: 'Regex, JSON path, diff, API tester' },
    { icon: GitBranch, name: 'Git Helper', desc: 'Commit messages, branches, PR templates' },
    { icon: Sparkles, name: 'Workflow Automation', desc: 'Chain transforms, custom workflows' }
  ];

  const transforms = [
    'JSON Formatting', 'Case Conversion', 'Base64 Encoding', 'URL Encoding',
    'Hash Generation', 'UUID Generation', 'Markdown to HTML', 'SQL Formatting',
    'Code Formatting', 'Color Conversion', 'Timestamp Conversion', 'And 40+ more...'
  ];

  const stats = [
    { value: '50+', label: 'Text Transforms', icon: Zap },
    { value: '100%', label: 'Privacy First', icon: Shield },
    { value: 'Real-time', label: 'Sync Speed', icon: RefreshCw },
    { value: 'Unlimited', label: 'Clip History', icon: ClipboardList }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Developer',
      company: 'Tech Corp',
      text: 'ClipSync has completely transformed my workflow. The real-time sync is flawless and the developer tools are incredibly useful.',
      rating: 5
    },
    {
      name: 'Sarah Johnson',
      role: 'Tech Lead',
      company: 'StartupXYZ',
      text: 'Best clipboard manager I\'ve used. The team collaboration features are a game-changer for our remote team.',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      role: 'Full Stack Developer',
      company: 'DevStudio',
      text: 'The local AI integration is brilliant. Smart categorization saves me hours every week. Highly recommend!',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'How does real-time sync work?',
      a: 'ClipSync uses WebSocket connections to sync your clipboard across all devices instantly. Changes are encrypted end-to-end before transmission.'
    },
    {
      q: 'Is my data secure?',
      a: 'Absolutely! All synced clips are encrypted end-to-end. For local AI features, data never leaves your machine. We use industry-standard encryption.'
    },
    {
      q: 'Can I use ClipSync offline?',
      a: 'Yes! ClipSync works offline with full functionality. Sync happens automatically when you reconnect to the internet.'
    },
    {
      q: 'What platforms does ClipSync support?',
      a: 'ClipSync works on Windows, macOS, and Linux. We also have a web app that works in all modern browsers.'
    },
    {
      q: 'How much does ClipSync cost?',
      a: 'We offer a free plan with 50 clips. Pro plans start at $9/month with unlimited clips and advanced features.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['50 clips history', '2 devices', 'Basic transforms', 'Local storage'],
      highlight: false
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'month',
      features: ['Unlimited clips', 'Unlimited devices', 'All transforms', 'Cloud sync', 'Share links', 'AI features'],
      highlight: true
    },
    {
      name: 'Team',
      price: '$15',
      period: 'user/month',
      features: ['Everything in Pro', 'Team collaboration', 'Real-time sync', 'Admin controls', 'SSO integration'],
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100">
      {/* Hero Section with Animation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/5 via-transparent to-zinc-900/5"></div>
        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <ClipboardList className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-7xl font-bold text-zinc-900 mb-6 leading-tight">
              ClipSync
            </h1>
            <p className="text-3xl text-zinc-600 mb-4 max-w-3xl mx-auto font-medium">
              The Clipboard Manager Built for Developers
            </p>
            <p className="text-xl text-zinc-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              Real-time sync, team collaboration, and powerful developer tools all in one beautiful, privacy-first interface.
            </p>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <button
                onClick={onGetStarted}
                className="px-10 py-5 bg-zinc-900 text-white rounded-2xl font-semibold text-lg hover:bg-zinc-800 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {onDevMode && (
                <button
                  onClick={onDevMode}
                  className="px-10 py-5 bg-white text-zinc-700 rounded-2xl font-semibold text-lg hover:bg-zinc-50 transition-all transform hover:scale-105 border-2 border-zinc-300 shadow-lg flex items-center gap-2"
                >
                  <Code className="w-5 h-5" />
                  Dev Mode
                </button>
              )}
            </div>
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-zinc-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all border border-zinc-200">
                <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-zinc-700" />
                </div>
                <div className="text-3xl font-bold text-zinc-900 mb-2">{stat.value}</div>
                <div className="text-sm text-zinc-600">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Grid with Icons */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Everything You Need
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Powerful features designed for developers and teams who demand the best
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2 border border-zinc-200 group cursor-pointer"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Developer Tools Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-12 shadow-2xl">
          <div className="text-center mb-12 text-white">
            <h2 className="text-5xl font-bold mb-4">
              Developer-First Features
            </h2>
            <p className="text-xl text-zinc-300 max-w-2xl mx-auto">
              Built by developers, for developers. Every feature is designed to make your workflow faster and more efficient.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {devTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{tool.name}</h3>
                  <p className="text-sm text-zinc-300">{tool.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-6 text-center">
              50+ Text Transforms
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {transforms.map((transform, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 bg-white/20 backdrop-blur rounded-lg text-sm font-medium text-white border border-white/30"
                >
                  {transform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-3xl p-8 shadow-lg border-2 ${
                plan.highlight ? 'border-zinc-900 scale-105' : 'border-zinc-200'
              } transition-all hover:shadow-xl`}
            >
              {plan.highlight && (
                <div className="inline-block px-3 py-1 bg-zinc-900 text-white text-xs font-semibold rounded-full mb-4">
                  POPULAR
                </div>
              )}
              <h3 className="text-2xl font-bold text-zinc-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-zinc-900">{plan.price}</span>
                <span className="text-zinc-600 ml-2">/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-zinc-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.highlight
                    ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                    : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Loved by Developers Worldwide
          </h2>
          <p className="text-xl text-zinc-600 max-w-2xl mx-auto">
            Join thousands of developers who trust ClipSync to boost their productivity
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-lg border border-zinc-200 hover:shadow-xl transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-6 leading-relaxed italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-semibold text-zinc-900">{testimonial.name}</p>
                <p className="text-sm text-zinc-600">{testimonial.role} at {testimonial.company}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Perfect For
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-10 border border-blue-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mb-6">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Individual Developers</h3>
            <p className="text-zinc-700 leading-relaxed">
              Keep your workflow smooth with unlimited clipboard history, smart search, powerful transforms, and seamless sync across devices.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-10 border border-purple-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Development Teams</h3>
            <p className="text-zinc-700 leading-relaxed">
              Share code snippets instantly, collaborate in real-time, maintain team standards, and accelerate knowledge transfer between team members.
            </p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-10 border border-emerald-200 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-4">Enterprises</h3>
            <p className="text-zinc-700 leading-relaxed">
              Enterprise-grade security, SSO integration, compliance-ready architecture, audit trails, and centralized admin controls.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 mb-32">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-zinc-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors"
              >
                <span className="font-semibold text-zinc-900">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-zinc-600 transition-transform ${
                    openFaq === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-200">
                  <p className="text-zinc-700 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-3xl p-16 text-center text-white shadow-2xl">
          <h2 className="text-5xl font-bold mb-4">Ready to Transform Your Workflow?</h2>
          <p className="text-2xl text-zinc-300 mb-12 max-w-2xl mx-auto">
            Join thousands of developers who use ClipSync to boost productivity and collaborate seamlessly.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={onGetStarted}
              className="px-10 py-5 bg-white text-zinc-900 rounded-2xl font-semibold text-lg hover:bg-zinc-100 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 group"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {onDevMode && (
              <button
                onClick={onDevMode}
                className="px-10 py-5 bg-zinc-800 text-white rounded-2xl font-semibold text-lg hover:bg-zinc-700 transition-all transform hover:scale-105 border-2 border-zinc-700 flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                Try Dev Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-200 bg-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-6 h-6 text-zinc-900" />
                <span className="text-xl font-bold text-zinc-900">ClipSync</span>
              </div>
              <p className="text-sm text-zinc-600">
                The clipboard manager built for developers, by developers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><a href="#" className="hover:text-zinc-900">Features</a></li>
                <li><a href="#" className="hover:text-zinc-900">Pricing</a></li>
                <li><a href="#" className="hover:text-zinc-900">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-600">
                <li><a href="#" className="hover:text-zinc-900">About</a></li>
                <li><a href="#" className="hover:text-zinc-900">Blog</a></li>
                <li><a href="#" className="hover:text-zinc-900">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900 mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-zinc-600 hover:text-zinc-900"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-zinc-600 hover:text-zinc-900"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-zinc-600 hover:text-zinc-900"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-zinc-200 pt-8 text-center text-sm text-zinc-600">
            <p>© 2024 ClipSync. Built for developers, by developers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
