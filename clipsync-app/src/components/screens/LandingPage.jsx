import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import {
  ClipboardList,
  RefreshCw,
  Users,
  Zap,
  Brain,
  Shield,
  Globe,
  Lock,
  Award,
  Command,
  BookOpen,
  Code,
  GitBranch,
  Wrench,
  Sparkles,
  CheckCircle2,
  Star,
  Play,
  ArrowRight,
  ChevronDown,
  Twitter,
  Github,
  Linkedin,
  Moon,
  Sun,
  Coffee,
  Heart
} from 'lucide-react';

const LandingPage = ({ onGetStarted, onDevMode }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: ClipboardList,
      title: 'Never Lose Anything',
      description: 'Your entire clipboard history, always there when you need it. Search through everything you\'ve ever copied.',
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      icon: RefreshCw,
      title: 'Sync Like Magic',
      description: 'Copy on your laptop, paste on your phone. It just works. No setup, no hassle.',
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      icon: Users,
      title: 'Share with Your Team',
      description: 'Stop sending code snippets through Slack. Share clips instantly with your teammates.',
      color: 'text-emerald-500 bg-emerald-500/10'
    },
    {
      icon: Zap,
      title: '50+ Quick Transforms',
      description: 'Format JSON, convert cases, encode stuff. All the utilities you actually use, built right in.',
      color: 'text-amber-500 bg-amber-500/10'
    },
    {
      icon: Brain,
      title: 'Smart AI (Local)',
      description: 'Auto-categorize clips and catch duplicates. Powered by Ollama, runs 100% on your machine.',
      color: 'text-pink-500 bg-pink-500/10'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'End-to-end encryption. We can\'t see your clips even if we wanted to. Your data stays yours.',
      color: 'text-red-500 bg-red-500/10'
    },
    {
      icon: Command,
      title: 'Keyboard First',
      description: 'Hit Ctrl+K and go. Search, transform, manage—all without touching your mouse.',
      color: 'text-indigo-500 bg-indigo-500/10'
    },
    {
      icon: BookOpen,
      title: 'Snippet Library',
      description: 'Keep your favorite code snippets organized. Syntax highlighting, tags, the works.',
      color: 'text-cyan-500 bg-cyan-500/10'
    }
  ];

  const devTools = [
    { icon: Command, name: 'Command Palette', desc: 'Everything at your fingertips' },
    { icon: Wrench, name: 'Dev Tools', desc: 'Regex, JSON, diff, API testing' },
    { icon: GitBranch, name: 'Git Helper', desc: 'Commit messages that don\'t suck' },
    { icon: Sparkles, name: 'Workflows', desc: 'Chain transforms together' }
  ];

  const transforms = [
    'JSON Formatting', 'Case Conversion', 'Base64 Encoding', 'URL Encoding',
    'Hash Generation', 'UUID Generation', 'Markdown → HTML', 'SQL Formatting',
    'Code Formatting', 'Color Conversion', 'Timestamps', '+ 40 more...'
  ];

  const stats = [
    { value: '50+', label: 'Text Transforms', icon: Zap, suffix: '' },
    { value: '100', label: 'Privacy Score', icon: Shield, suffix: '%' },
    { value: '<100', label: 'Sync Time', icon: RefreshCw, suffix: 'ms' },
    { value: '∞', label: 'Clip History', icon: ClipboardList, suffix: '' }
  ];

  const testimonials = [
    {
      name: 'Alex Chen',
      role: 'Senior Dev',
      company: 'Tech Corp',
      text: 'Honestly game-changing. The real-time sync is so smooth I forget it\'s even there. Just works.',
      rating: 5,
      emoji: '🚀'
    },
    {
      name: 'Sarah Johnson',
      role: 'Tech Lead',
      company: 'StartupXYZ',
      text: 'Best clipboard manager I\'ve tried, and I\'ve tried them all. Team features are chef\'s kiss.',
      rating: 5,
      emoji: '💯'
    },
    {
      name: 'Mike Rodriguez',
      role: 'Full Stack Dev',
      company: 'DevStudio',
      text: 'The local AI is brilliant. Saves me hours every week. Worth every penny.',
      rating: 5,
      emoji: '⭐'
    }
  ];

  const faqs = [
    {
      q: 'How does the sync actually work?',
      a: 'We use WebSocket connections for instant sync across all your devices. Everything is encrypted end-to-end before it leaves your device, so even we can\'t see your clips.'
    },
    {
      q: 'Is my data really secure?',
      a: 'Absolutely. All synced clips are encrypted end-to-end. For local AI features, data never leaves your machine. We use industry-standard encryption.'
    },
    {
      q: 'Can I use this offline?',
      a: 'Yep! ClipSync works perfectly offline with full functionality. When you reconnect, everything syncs automatically.'
    },
    {
      q: 'What platforms do you support?',
      a: 'Windows, macOS, Linux, and web. Basically everywhere you work. Native apps for desktop, web app for everything else.'
    },
    {
      q: 'How much does it cost?',
      a: 'Free plan gets you 50 clips. Pro is $9/month for unlimited everything. No hidden fees, cancel anytime.'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      features: ['50 clips history', '2 devices', 'Basic transforms', 'Local storage'],
      highlight: false,
      badge: 'Try it out'
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'month',
      features: ['Unlimited clips', 'Unlimited devices', 'All transforms', 'Cloud sync', 'Share links', 'AI features'],
      highlight: true,
      badge: 'Most popular'
    },
    {
      name: 'Team',
      price: '$15',
      period: 'per person/mo',
      features: ['Everything in Pro', 'Team collaboration', 'Real-time sync', 'Admin controls', 'SSO integration'],
      highlight: false,
      badge: 'For teams'
    }
  ];

  const customerLogos = [
    'TechCorp', 'DevStudio', 'StartupXYZ', 'CodeLabs', 'InnovateCo', 'BuildFast'
  ];

  const comparisonFeatures = [
    { feature: 'Unlimited History', clipsync: true, competitor1: false, competitor2: true },
    { feature: 'Real-time Sync', clipsync: true, competitor1: true, competitor2: false },
    { feature: 'Team Collaboration', clipsync: true, competitor1: false, competitor2: false },
    { feature: '50+ Transforms', clipsync: true, competitor1: false, competitor2: false },
    { feature: 'Local AI', clipsync: true, competitor1: false, competitor2: false },
    { feature: 'End-to-End Encryption', clipsync: true, competitor1: false, competitor2: true },
    { feature: 'Developer Tools', clipsync: true, competitor1: false, competitor2: false },
    { feature: 'Offline Support', clipsync: true, competitor1: true, competitor2: false }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600" />
        )}
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/20 via-slate-50/0 to-slate-50/0 dark:from-indigo-900/20 dark:via-slate-900/0 dark:to-slate-900/0"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-8 animate-fadeIn">
            <Sparkles className="w-4 h-4" />
            <span>New: Local AI Integration Available Now</span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 dark:text-white mb-8 leading-tight">
            Your clipboard, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              supercharged.
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12 leading-relaxed">
            Stop losing snippets. ClipSync gives you infinite history, real-time sync across devices, and 50+ developer tools right at your fingertips.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-semibold text-lg hover:bg-indigo-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
            {onDevMode && (
              <button
                onClick={onDevMode}
                className="px-8 py-4 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
              >
                <Code className="w-5 h-5" />
                Dev Mode
              </button>
            )}
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>14-day free trial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-12 border-y border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-8">
            Trusted by developers at
          </p>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-60 hover:opacity-100 transition-opacity">
            {customerLogos.map((logo, index) => (
              <span key={index} className="text-xl font-bold text-slate-700 dark:text-slate-300">{logo}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Video Demo Section */}
      <div className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative bg-slate-900 aspect-video group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            {/* Placeholder for video thumbnail */}
            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <span className="text-slate-500 font-medium">Demo Video Placeholder</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">
              We built the tools we wished we had. Now they're yours.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all group"
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              SOC 2
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Type II Certified
            </p>
          </div>
          <div className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <Lock className="w-12 h-12 mx-auto mb-4 text-blue-500" />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              256-bit
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              AES Encryption
            </p>
          </div>
          <div className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <Award className="w-12 h-12 mx-auto mb-4 text-amber-500" />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              99.9%
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Uptime SLA
            </p>
          </div>
          <div className="glass-strong rounded-2xl p-6 text-center hover:scale-105 transition-all">
            <Globe className="w-12 h-12 mx-auto mb-4 text-purple-500" />
            <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Global
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              CDN Network
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 rounded-lg bg-white/10 text-white mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-1">
                    {stat.value}{stat.suffix}
                  </div>
                  <div className="text-indigo-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Built for developers,<br />
                by developers.
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                ClipSync isn't just a clipboard manager. It's a complete developer utility belt. 
                Format JSON, generate UUIDs, or clean up code snippets without leaving your keyboard.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {devTools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">{tool.name}</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{tool.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4">50+ Built-in Transforms</h4>
                <div className="flex flex-wrap gap-2">
                  {transforms.slice(0, 8).map((t, i) => (
                    <span key={i} className="px-3 py-1 text-xs font-medium rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300">
                      {t}
                    </span>
                  ))}
                  <span className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                    +40 more
                  </span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl bg-slate-900 shadow-2xl p-6 border border-slate-800">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="font-mono text-sm text-slate-300 space-y-2">
                  <div className="flex gap-4">
                    <span className="text-slate-500">1</span>
                    <span className="text-purple-400">const</span> <span className="text-blue-400">data</span> = <span className="text-yellow-300">await</span> clip.json();
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500">2</span>
                    <span className="text-slate-500">// Auto-formatted instantly</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500">3</span>
                    <span className="text-purple-400">console</span>.<span className="text-blue-400">log</span>(data.<span className="text-blue-400">formatted</span>);
                  </div>
                  <div className="flex gap-4">
                    <span className="text-slate-500">4</span>
                    <span className="text-green-400">"{'{ "id": 123, "status": "active" }'}"</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
            How we stack up
          </h2>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-5 text-left font-semibold text-slate-900 dark:text-white">Feature</th>
                  <th className="px-6 py-5 text-center font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/10">ClipSync</th>
                  <th className="px-6 py-5 text-center font-medium text-slate-500 dark:text-slate-400">Other A</th>
                  <th className="px-6 py-5 text-center font-medium text-slate-500 dark:text-slate-400">Other B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">{item.feature}</td>
                    <td className="px-6 py-4 text-center bg-indigo-50/30 dark:bg-indigo-900/5">
                      {item.clipsync ? <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto" /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.competitor1 ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {item.competitor2 ? <CheckCircle2 className="w-5 h-5 text-slate-400 mx-auto" /> : <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-slate-600 dark:text-slate-400">Start for free, upgrade when you need to.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-3xl p-8 border ${
                  plan.highlight 
                    ? 'border-indigo-600 shadow-2xl scale-105 z-10 bg-white dark:bg-slate-800' 
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                } transition-all`}
              >
                {plan.highlight && (
                  <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <div className="mb-6 flex items-baseline">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                  <span className="ml-2 text-slate-500 dark:text-slate-400">/{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                      : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
            Loved by developers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-slate-600 dark:text-slate-300 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xl">
                    {testimonial.emoji}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-slate-900 dark:text-white mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform ${openFaq === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 py-5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-700">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="rounded-3xl p-12 md:p-16 bg-indigo-600 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to stop losing clips?
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Join thousands of developers who have already supercharged their workflow.
              </p>
              <button
                onClick={onGetStarted}
                className="px-10 py-4 rounded-xl bg-white text-indigo-600 font-bold text-lg hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Get Started for Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xl font-bold text-slate-900 dark:text-white">ClipSync</span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                The clipboard manager built for developers. Secure, fast, and packed with tools.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Github className="w-5 h-5" /></a>
                <a href="#" className="text-slate-400 hover:text-indigo-600 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Docs</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Company</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 dark:text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <p>© 2024 ClipSync. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> by developers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;