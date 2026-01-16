import useClipStore from '../store/useClipStore';
import ClipCard from './ClipCard';

const ClipList = () => {
  const { getFilteredClips, isLoading, activeTab } = useClipStore();
  const clips = getFilteredClips();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-zinc-300 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500">Loading clips...</p>
        </div>
      </div>
    );
  }

  if (clips.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-800 mb-2">No clips yet</h3>
          <p className="text-sm text-zinc-500 mb-4">
            {activeTab === 'pinned' 
              ? 'Pin your favorite clips to see them here'
              : 'Copy something to get started'}
          </p>
          <p className="text-xs text-zinc-400">
            Press <kbd className="px-2 py-1 bg-zinc-100 rounded font-mono">Ctrl+C</kbd> or{' '}
            <kbd className="px-2 py-1 bg-zinc-100 rounded font-mono">⌘+C</kbd> to copy
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {clips.map(clip => (
        <ClipCard key={clip.id} clip={clip} />
      ))}
    </div>
  );
};

export default ClipList;
