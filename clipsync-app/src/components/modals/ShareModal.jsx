import { useState, useEffect } from 'react';
import useClipStore from '../../store/useClipStore';
import apiClient from '../../services/api';
import { QrCode } from 'lucide-react';

const ShareModal = ({ onClose, clip }) => {
  const { selectedClip } = useClipStore();
  const clipToShare = clip || selectedClip;
  
  const [expiration, setExpiration] = useState('24h');
  const [isPasswordProtected, setIsPasswordProtected] = useState(false);
  const [password, setPassword] = useState('');
  const [isBurnAfterRead, setIsBurnAfterRead] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shareLink) {
      loadQRCode();
    }
  }, [shareLink]);

  const loadQRCode = async () => {
    if (!shareLink) return;
    try {
      const response = await apiClient.getShareQRCode(shareLink.id);
      setQrCode(response.qrCode);
    } catch (error) {
      console.error('Failed to load QR code:', error);
    }
  };

  const handleCreateShare = async () => {
    if (!clipToShare) {
      setError('No clip selected');
      return;
    }

    if (isPasswordProtected && !password) {
      setError('Password is required when password protection is enabled');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.createShareLink({
        clipId: clipToShare.id,
        content: clipToShare.content,
        type: clipToShare.type,
        password: isPasswordProtected ? password : null,
        expiresIn: expiration === 'never' ? null : expiration,
        oneTime: isBurnAfterRead,
      });

      setShareLink(response.share);
    } catch (err) {
      setError(err.message || 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (shareLink?.url) {
      navigator.clipboard.writeText(shareLink.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-900">Share Clip</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors"
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-5 space-y-5">
          {shareLink ? (
            <>
              {/* Generated Link */}
              <div>
                <label className="text-sm font-medium text-zinc-700 mb-2 block">Shareable Link</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 bg-zinc-50 rounded-xl text-sm font-mono text-zinc-600 truncate" style={{ border: '1px solid #E5E5E5' }}>
                    {shareLink.url}
                  </div>
                  <button 
                    onClick={handleCopy}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${copied ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                >
                  <QrCode className="w-5 h-5" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </button>
                {showQR && qrCode && (
                  <div className="mt-3 flex justify-center">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48 border-2 border-zinc-200 rounded-xl" />
                  </div>
                )}
              </div>

              {isBurnAfterRead && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <p className="text-sm text-orange-800">
                    ⚠️ This link will be deleted after the first view
                  </p>
                </div>
              )}
            </>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {isPasswordProtected && (
                <div>
                  <label className="text-sm font-medium text-zinc-700 mb-2 block">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </>
          )}

          {/* Expiration */}
          <div>
            <label className="text-sm font-medium text-zinc-700 mb-3 block">Expires after</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: '1h', label: '1 hour' },
                { value: '24h', label: '24 hours' },
                { value: '7d', label: '7 days' },
                { value: 'never', label: 'Never' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setExpiration(opt.value)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${expiration === opt.value ? 'bg-zinc-900 text-white shadow-md' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
                  style={{ border: expiration === opt.value ? 'none' : '1px solid #E5E5E5' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Password Protection */}
            <div 
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors"
              style={{ border: '1px solid #E5E5E5' }}
              onClick={() => setIsPasswordProtected(!isPasswordProtected)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">Password protect</p>
                  <p className="text-xs text-zinc-500">Require password to view</p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${isPasswordProtected ? 'bg-zinc-900' : 'bg-zinc-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isPasswordProtected ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>

            {/* Burn After Reading */}
            <div 
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl cursor-pointer hover:bg-zinc-100 transition-colors"
              style={{ border: '1px solid #E5E5E5' }}
              onClick={() => setIsBurnAfterRead(!isBurnAfterRead)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-800">Burn after reading</p>
                  <p className="text-xs text-zinc-500">Delete after first view</p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ${isBurnAfterRead ? 'bg-orange-500' : 'bg-zinc-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${isBurnAfterRead ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50 border-t border-zinc-100">
          {shareLink ? (
            <button 
              onClick={onClose}
              className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              Done
            </button>
          ) : (
            <button 
              onClick={handleCreateShare}
              disabled={isLoading}
              className="w-full py-3.5 bg-zinc-900 text-white rounded-xl font-semibold hover:bg-zinc-800 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Share Link'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
