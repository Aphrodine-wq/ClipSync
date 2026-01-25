import { useEffect, useState } from 'react';
import useAuthStore from '../../store/useAuthStore';
import PaywallModal from './PaywallModal';
import { Github } from 'lucide-react';

const AuthModal = ({ onClose }) => {
  const { loginWithGoogle, loginWithGitHub, error, clearError, paywallData, clearPaywall, register, login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [setError] = useState(null);

  useEffect(() => {
    // Load Google Sign-In script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: 350,
          text: 'continue_with',
        }
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleGoogleResponse = async (response) => {
    try {
      setIsLoading(true);
      clearError();

      await loginWithGoogle(response.credential);

      // Close modal on success
      onClose();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setIsLoading(false);

      // Show paywall if device limit exceeded
      if (error.paywallData) {
        setShowPaywall(true);
      }
    }
  };

  const handleGitHubLogin = async () => {
    try {
      setIsLoading(true);
      clearError();

      await loginWithGitHub();

      // Close modal on success
      onClose();
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      setIsLoading(false);

      if (error.paywallData) {
        setShowPaywall(true);
      }
    }
  };

  const handleAuthAction = async (e) => {
    e.preventDefault();
    try {
      if (authMode === 'login') {
        await login(email, password);
        alert('Login Successful');
      } else if (authMode === 'register') {
        await register(email, name, password);
        alert('Registration Successful');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    }
  };
  
  // Show paywall when paywallData is set
  useEffect(() => {
    if (paywallData) {
      setShowPaywall(true);
    }
  }, [paywallData]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo and title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl font-bold text-white">Y</span>
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Welcome to ClipSync</h2>
          <p className="text-zinc-600">Sign in to sync your clipboard across devices</p>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-red-800">Sign in failed</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleAuthAction} className="space-y-4 mb-6">
        
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full py-3 px-4 text-zinc-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {authMode === 'register' && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full py-3 px-4 text-zinc-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />          
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full py-3 px-4 text-zinc-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {authMode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>

        {/* Social Sign-In buttons */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-center" id="google-signin-button"></div>
          <button
            onClick={handleGitHubLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>
        </div>
        {isLoading && (
          <div className="text-center">
            <div className="inline-block w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
            <p className="text-sm text-zinc-600 mt-2">Signing in...</p>
          </div>
        )}

        <p 
          className="text-sm text-center text-zinc-500 hover:cursor-pointer underline"
          onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
        >
          {authMode === 'login' ? 'Need an account? Register' : 'Already have an account? Sign in'}
        </p>

        {/* Features */}
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-4">What you get</p>
          <div className="space-y-3">
            {[
              { icon: '🔄', text: 'Sync across all your devices' },
              { icon: '📋', text: 'Unlimited clipboard history' },
              { icon: '🔒', text: 'End-to-end encryption' },
              { icon: '👥', text: 'Team collaboration' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{feature.icon}</span>
                <span className="text-sm text-zinc-700">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-zinc-500 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
      
      {/* Paywall Modal */}
      {showPaywall && paywallData && (
        <PaywallModal
          isOpen={showPaywall}
          onClose={() => {
            setShowPaywall(false);
            clearPaywall();
          }}
          currentPlan={paywallData.currentPlan}
          requiredPlan={paywallData.requiredPlan}
          currentDevices={paywallData.currentDevices}
          maxDevices={paywallData.maxDevices}
        />
      )}
    </div>
  );
};

export default AuthModal;
