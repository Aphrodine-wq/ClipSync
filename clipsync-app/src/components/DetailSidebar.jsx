import { useState } from 'react';
import useClipStore from '../store/useClipStore';
import { getTypeStyle } from '../utils/typeDetection';
import TransformPanel from './TransformPanel';

const DetailSidebar = ({ onShareClick }) => {
  const { selectedClip, copyClip, togglePin, deleteClip } = useClipStore();
  const [copySuccess, setCopySuccess] = useState(false);

  if (!selectedClip) {
    return (
      <div className="w-96">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center sticky top-24" style={{ border: '1px solid #E5E5E5' }}>
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-800 mb-2">Select a clip</h3>
          <p className="text-sm text-zinc-500">Click on any clip to view details and transforms</p>
        </div>
      </div>
    );
  }

  const typeStyle = getTypeStyle(selectedClip.type);

  const handleCopy = async () => {
    try {
      await copyClip(selectedClip);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handlePin = async () => {
    try {
      await togglePin(selectedClip.id);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this clip?')) {
      try {
        await deleteClip(selectedClip.id);
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  return (
    <div className="w-96">
      <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24" style={{ border: '1px solid #E5E5E5' }}>
        {/* Clip Detail Header */}
        <div className="flex items-center justify-between mb-4">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {typeStyle.label}
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePin}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              title={selectedClip.pinned ? 'Unpin' : 'Pin'}
            >
              <svg className={`w-5 h-5 ${selectedClip.pinned ? 'text-amber-500' : 'text-zinc-500'}`} fill={selectedClip.pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
            <button 
              onClick={onShareClick}
              className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              title="Share"
            >
              <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button 
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
              title="Delete"
            >
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Clip Content */}
        <pre className="bg-zinc-50 rounded-xl p-4 text-sm font-mono text-zinc-800 overflow-x-auto mb-4 max-h-48 overflow-y-auto whitespace-pre-wrap break-words" style={{ border: '1px solid #E5E5E5' }}>
          {selectedClip.content}
        </pre>

        {/* Copy Button */}
        <button 
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl font-medium mb-6 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] ${copySuccess ? 'bg-emerald-500 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
        >
          {copySuccess ? '✓ Copied!' : 'Copy to Clipboard'}
        </button>

        {/* Transform Panel */}
        <TransformPanel clip={selectedClip} />
      </div>
    </div>
  );
};

export default DetailSidebar;
