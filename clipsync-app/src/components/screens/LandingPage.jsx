import { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
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
  Linkedin,
  Moon,
  Sun,
  Layers,
  Rocket,
  Award,
  Coffee,
  Heart,
  Smile
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
      color: 'from-blue-500 to-blue-600',
      rotation: '-2deg'
    },
    {
      icon: RefreshCw,
      title: 'Sync Like Magic ✨',
      description: 'Copy on your laptop, paste on your phone. It just works. No setup, no hassle.',
      color: 'from-purple-500 to-purple-600',
      rotation: '1deg'
    },
    {
      icon: Users,
      title: 'Share with Your Team',
      description: 'Stop sending code snippets through Slack. Share clips instantly with your teammates.',
      color: 'from-emerald-500 to-emerald-600',
      rotation: '-1deg'
    },
    {
      icon: Zap,
      title: '50+ Quick Transforms',
      description: 'Format JSON, convert cases, encode stuff. All the utilities you actually use, built right in.',
      color: 'from-amber-500 to-amber-600',
      rotation: '2deg'
    },
    {
      icon: Brain,
      title: 'Smart AI (Runs Locally)',
      description: 'Auto-categorize clips and catch duplicates. Powered by Ollama, runs on your machine.',
      color: 'from-pink-500 to-pink-600',
      rotation: '-1.5deg'
    },
    {
      icon: Shield,
      title: 'Your Data Stays Yours',
      description: 'End-to-end encryption. We can\'t see your clips even if we wanted to. Privacy first, always.',
      color: 'from-red-500 to-red-600',
      rotation: '1.5deg'
    },
    {
      icon: Command,
      title: 'Keyboard Ninja Mode',
      description: 'Hit Ctrl+K and go. Search, transform, manage—all without touching your mouse.',
      color: 'from-indigo-500 to-indigo-600',
      rotation: '-2deg'
    },
    {
      icon: BookOpen,
      title: 'Your Snippet Library',
      description: 'Keep your favorite code snippets organized. Syntax highlighting, tags, the works.',
      color: 'from-cyan-500 to-cyan-600',
      rotation: '1deg'
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
      a: 'Absolutely. All synced clips are encrypted end-to-end. For local AI features, data never leaves your machine. We use industry-standard encryption and can\'t access your clipboard data even if we wanted to.'
    },
    {
      q: 'Can I use this offline?',
      a: 'Yep! ClipSync works perfectly offline with full functionality. When you reconnect, everything syncs automatically. No internet? No problem.'
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
    <div className="min-h-screen transition-theme" style={{ background: 'var(--gradient-hero)' }}>
      {/* Floating Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 w-14 h-14 rounded-full glass-strong flex items-center justify-center hover:scale-110 transition-all shadow-xl group"
        style={{ transform: 'rotate(-5deg)' }}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-6 h-6 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600 group-hover:-rotate-12 transition-transform duration-500" />
        )}
      </button>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Organic background blobs */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ borderRadius: '63% 37% 54% 46% / 55% 48% 52% 45%' }}></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '1s', borderRadius: '38% 62% 63% 37% / 41% 44% 56% 59%' }}></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s', borderRadius: '49% 51% 48% 52% / 62% 44% 56% 38%' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 relative">
          <div className="mb-16 animate-fadeIn">
            {/* Asymmetric layout */}
            <div className="max-w-4xl">
              <div className="inline-flex items-center justify-start mb-8">
                <div className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-all duration-500 glass-strong" style={{ transform: 'rotate(-3deg)' }}>
                  <ClipboardList className="w-16 h-16" style={{ color: 'var(--color-accent-primary)' }} />
                </div>
              </div>

              <h1 className="text-7xl font-bold mb-6 leading-tight" style={{ color: 'var(--color-text-primary)', textAlign: 'left' }}>
                Your clipboard,
                <br />
                <span className="italic" style={{ fontWeight: '800' }}>supercharged</span> ⚡
              </h1>

              <p className="text-3xl mb-4 font-medium" style={{ color: 'var(--color-text-secondary)', textAlign: 'left', maxWidth: '600px' }}>
                Stop losing stuff you copied 5 minutes ago
              </p>

              <p className="text-xl mb-12 leading-relaxed" style={{ color: 'var(--color-text-tertiary)', textAlign: 'left', maxWidth: '550px' }}>
                Real-time sync, team sharing, and 50+ developer tools.
                Built by developers who got tired of losing important snippets.
                <Coffee className="inline w-5 h-5 ml-2" />
              </p>

              <div className="flex gap-4 items-center flex-wrap">
                <button
                  onClick={onGetStarted}
                  className="px-10 py-5 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 group glass-strong"
                  style={{ color: 'var(--color-text-primary)', transform: 'rotate(-1deg)' }}
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {onDevMode && (
                  <button
                    onClick={onDevMode}
                    className="px-10 py-5 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center gap-2 glass"
                    style={{ color: 'var(--color-text-secondary)', transform: 'rotate(1deg)' }}
                  >
                    <Code className="w-5 h-5" />
                    Dev Mode
                  </button>
                )}
              </div>

              <div className="mt-12 flex items-center gap-8 text-sm flex-wrap" style={{ color: 'var(--color-text-tertiary)' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>14 days free</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Logos */}
      <div className="max-w-7xl mx-auto px-6 py-16 mb-16">
        <p className="text-sm font-semibold mb-8 uppercase tracking-wider" style={{ color: 'var(--color-text-tertiary)', textAlign: 'left', marginLeft: '20px' }}>
          Trusted by developers at →
        </p>
        <div className="flex flex-wrap items-center gap-12 ml-8">
          {customerLogos.map((logo, index) => (
            <div
              key={index}
              className="text-2xl font-bold opacity-50 hover:opacity-100 transition-opacity"
              style={{
                color: 'var(--color-text-secondary)',
                transform: `rotate(${index % 2 === 0 ? '-' : ''}${Math.random() * 2 + 0.5}deg)`
              }}
            >
              {logo}
            </div>
          ))}
        </div>
      </div>

      {/* Video Demo */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-12" style={{ textAlign: 'left', maxWidth: '600px' }}>
          <h2 className="text-5xl font-bold mb-4 animate-fadeIn" style={{ color: 'var(--color-text-primary)' }}>
            See it in action
          </h2>
          <p className="text-xl animate-fadeIn" style={{ color: 'var(--color-text-secondary)', animationDelay: '0.1s' }}>
            Watch how ClipSync makes your workflow smoother (under 2 min, promise)
          </p>
        </div>
        <div
          className="relative rounded-3xl overflow-hidden shadow-2xl glass-strong hover:scale-[1.02] transition-all duration-500"
          style={{ paddingBottom: '56.25%', transform: `rotate(-0.5deg)` }}
        >
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--color-bg-tertiary)' }}>
            <div className="text-center">
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="w-24 h-24 rounded-full glass-strong flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-all duration-300 cursor-pointer group"
                aria-label="Play demo video"
              >
                <Play className="w-12 h-12 group-hover:scale-125 transition-transform" style={{ color: 'var(--color-accent-primary)' }} />
              </button>
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                Click to watch demo
              </p>
            </div>
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
      <div className="max-w-7xl mx-auto px-6 py-16 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="text-center p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all glass-strong transform hover:-translate-y-1"
                style={{ transform: `rotate(${index % 2 === 0 ? '-' : ''}${Math.random() * 3 + 0.5}deg)` }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 glass">
                  <Icon className="w-6 h-6" style={{ color: 'var(--color-text-primary)' }} />
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left', maxWidth: '700px' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Everything you need
            <br />
            <span className="text-3xl font-normal italic" style={{ color: 'var(--color-text-secondary)' }}>
              (and nothing you don't)
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all transform hover:-translate-y-2 group cursor-pointer glass-strong"
                style={{ transform: `rotate(${feature.rotation})` }}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-6xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            How we stack up
          </h2>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Spoiler: pretty well 😎
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-2xl glass-strong" style={{ transform: 'rotate(0.5deg)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: 'var(--color-bg-tertiary)' }}>
                <th className="px-6 py-4 text-left font-semibold" style={{ color: 'var(--color-text-primary)' }}>Feature</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-text-primary)' }}>ClipSync</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Other Guy A</th>
                <th className="px-6 py-4 text-center font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Other Guy B</th>
              </tr>
            </thead>
            <tbody>
              {comparisonFeatures.map((item, index) => (
                <tr key={index} className="border-t" style={{ borderColor: 'var(--color-border-primary)' }}>
                  <td className="px-6 py-4" style={{ color: 'var(--color-text-primary)' }}>{item.feature}</td>
                  <td className="px-6 py-4 text-center">
                    {item.clipsync ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" /> : <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.competitor1 ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-50" /> : <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {item.competitor2 ? <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto opacity-50" /> : <span style={{ color: 'var(--color-text-tertiary)' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Tools */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="rounded-3xl p-12 shadow-2xl glass-strong" style={{ transform: 'rotate(-0.5deg)' }}>
          <div className="mb-12" style={{ textAlign: 'left' }}>
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Built for developers
              <br />
              <span className="text-2xl font-normal italic" style={{ color: 'var(--color-text-secondary)' }}>
                (by developers who actually code)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {devTools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <div key={index} className="glass rounded-2xl p-6 hover:scale-105 transition-all" style={{ transform: `rotate(${index % 2 === 0 ? '-' : ''}1deg)` }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 glass">
                    <Icon className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>{tool.name}</h3>
                  <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{tool.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="glass rounded-2xl p-8">
            <h3 className="text-2xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)', textAlign: 'left' }}>
              50+ text transforms (the ones you actually use)
            </h3>
            <div className="flex flex-wrap gap-3">
              {transforms.map((transform, index) => (
                <span
                  key={index}
                  className="px-5 py-2.5 glass rounded-lg text-sm font-medium hover:scale-105 transition-transform"
                  style={{
                    color: 'var(--color-text-primary)',
                    transform: `rotate(${index % 3 === 0 ? '-' : index % 3 === 1 ? '' : ''}${Math.random() * 2}deg)`
                  }}
                >
                  {transform}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Simple pricing
          </h2>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            No tricks, no hidden fees. Just honest pricing.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-3xl p-8 shadow-lg transition-all hover:shadow-2xl glass-strong ${plan.highlight ? 'scale-105 ring-2' : ''
                }`}
              style={{
                ringColor: plan.highlight ? 'var(--color-accent-primary)' : undefined,
                transform: `rotate(${index === 0 ? '-1' : index === 2 ? '1' : '0'}deg)`
              }}
            >
              <div className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-4 glass">
                {plan.badge}
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>{plan.name}</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{plan.price}</span>
                <span className="ml-2" style={{ color: 'var(--color-text-secondary)' }}>/{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span style={{ color: 'var(--color-text-secondary)' }}>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all ${plan.highlight ? 'glass-strong shadow-lg hover:scale-105' : 'glass hover:scale-105'
                  }`}
                style={{ color: 'var(--color-text-primary)' }}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            What people are saying
          </h2>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            Real reviews from real developers <Heart className="inline w-5 h-5 text-red-500" />
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all glass-strong"
              style={{ transform: `rotate(${index % 2 === 0 ? '-' : ''}${Math.random() * 2 + 0.5}deg)` }}
            >
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                "{testimonial.text}"
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{testimonial.name}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>{testimonial.role} at {testimonial.company}</p>
                </div>
                <span className="text-3xl">{testimonial.emoji}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use Cases */}
      <div className="max-w-7xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Perfect for...
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl p-10 hover:shadow-2xl transition-all glass-strong" style={{ transform: 'rotate(-1deg)' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Solo Devs</h3>
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Keep your workflow smooth. Unlimited history, smart search, powerful transforms, seamless sync.
            </p>
          </div>
          <div className="rounded-2xl p-10 hover:shadow-2xl transition-all glass-strong" style={{ transform: 'rotate(0.5deg)' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Dev Teams</h3>
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Share snippets instantly. Collaborate in real-time. Maintain standards. Speed up knowledge transfer.
            </p>
          </div>
          <div className="rounded-2xl p-10 hover:shadow-2xl transition-all glass-strong" style={{ transform: 'rotate(-0.5deg)' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>Enterprises</h3>
            <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
              Enterprise security, SSO, compliance-ready, audit trails, centralized admin controls.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-6 mb-32">
        <div className="mb-16" style={{ textAlign: 'left' }}>
          <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Questions?
          </h2>
          <p className="text-xl" style={{ color: 'var(--color-text-secondary)' }}>
            We've got answers
          </p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden glass-strong"
              style={{ transform: `rotate(${index % 2 === 0 ? '-' : ''}0.5deg)` }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
              >
                <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''
                    }`}
                  style={{ color: 'var(--color-text-secondary)' }}
                />
              </button>
              {openFaq === index && (
                <div className="px-6 py-4 glass">
                  <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="rounded-3xl p-16 shadow-2xl glass-strong" style={{ transform: 'rotate(-0.5deg)' }}>
          <div style={{ textAlign: 'left', maxWidth: '700px' }}>
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-text-primary)' }}>
              Ready to level up your workflow?
            </h2>
            <p className="text-2xl mb-12" style={{ color: 'var(--color-text-secondary)' }}>
              Join thousands of developers who stopped losing their clipboard history.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={onGetStarted}
              className="px-10 py-5 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl flex items-center gap-2 group glass-strong"
              style={{ color: 'var(--color-text-primary)', transform: 'rotate(-1deg)' }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {onDevMode && (
              <button
                onClick={onDevMode}
                className="px-10 py-5 rounded-2xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center gap-2 glass"
                style={{ color: 'var(--color-text-secondary)', transform: 'rotate(1deg)' }}
              >
                <Code className="w-5 h-5" />
                Try Dev Mode
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-12 glass-strong" style={{ borderColor: 'var(--color-border-primary)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="w-6 h-6" style={{ color: 'var(--color-accent-primary)' }} />
                <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>ClipSync</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Made with <Heart className="inline w-4 h-4 text-red-500" /> by developers, for developers.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Product</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Features</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Pricing</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Company</h4>
              <ul className="space-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                <li><a href="#" className="hover:opacity-70 transition-opacity">About</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Blog</a></li>
                <li><a href="#" className="hover:opacity-70 transition-opacity">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}><Twitter className="w-5 h-5" /></a>
                <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}><Github className="w-5 h-5" /></a>
                <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: 'var(--color-text-secondary)' }}><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm" style={{ borderColor: 'var(--color-border-primary)', color: 'var(--color-text-tertiary)' }}>
            <p>© 2024 ClipSync. Built by developers who actually code.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
