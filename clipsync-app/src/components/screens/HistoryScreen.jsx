import { lazy, Suspense } from 'react';
import useClipStore from '../../store/useClipStore';
import ClipList from '../clips/ClipList';
import FilterBar from '../clips/FilterBar';

const LoadingFallback = () => (
  <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
    <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
  </div>
);

const HistoryScreen = ({ onClose }) => {
  const { clips, activeTab, setActiveTab } = useClipStore();

  // Ensure we're on history tab
  if (activeTab !== 'history') {
    setActiveTab('history');
  }

  // Sort clips by creation date (newest first)
  const sortedClips = [...clips].sort((a, b) => {
    const timeA = a.timestamp || a.created_at || 0;
    const timeB = b.timestamp || b.created_at || 0;
    return timeB - timeA;
  });

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Header with back button */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-2xl font-bold text-zinc-900">History</h1>
            <span className="text-sm text-zinc-500 ml-auto">
              {sortedClips.length} {sortedClips.length === 1 ? 'clip' : 'clips'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Suspense fallback={<LoadingFallback />}>
              <FilterBar />
              <ClipList />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryScreen;

