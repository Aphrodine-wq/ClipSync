import { useState } from 'react';
import useClipStore from '../store/useClipStore';
import ClipCard from './ClipCard';
import ClipListSkeleton from './ClipListSkeleton';
import ClipContextMenu from './ClipContextMenu';
import { Calendar, ChevronDown, ChevronRight, Copy, X, Tag, Download as DownloadIcon, Play } from 'lucide-react';
import { useToast } from './ui/Toast';

const ClipList = () => {
  const { 
    getFilteredClips, 
    isLoading, 
    activeTab, 
    getGroupedClips, 
    selectedClips, 
    toggleClipSelection,
    mergeClips,
    bulkDeleteClips,
    bulkTagClips,
    exportClips,
    pasteSequence,
    clearSelection
  } = useClipStore();
  const { toast } = useToast();
  const clips = getFilteredClips();
  const groupedClips = getGroupedClips();
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [groupByTime, setGroupByTime] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  
  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };
  
  const getGroupLabel = (groupName) => {
    switch (groupName) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'thisWeek': return 'This Week';
      case 'older': return 'Older';
      default: return groupName;
    }
  };
  
  const handleMergeClips = async () => {
    try {
      await mergeClips('\n');
      setSelectionMode(false);
      setShowBulkMenu(false);
    } catch (error) {
      console.error('Failed to merge clips:', error);
    }
  };
  
  const handleBulkDelete = async () => {
    if (confirm(`Delete ${selectedClips.length} selected clips?`)) {
      try {
        await bulkDeleteClips(selectedClips);
        setSelectionMode(false);
        setShowBulkMenu(false);
      } catch (error) {
        console.error('Failed to delete clips:', error);
      }
    }
  };
  
  const handleExportSelected = () => {
    exportClips(selectedClips);
    setSelectionMode(false);
    setShowBulkMenu(false);
  };
  
  const handlePasteSequence = async () => {
    if (selectedClips.length === 0) return;
    try {
      await pasteSequence(selectedClips);
      setSelectionMode(false);
      setShowBulkMenu(false);
      toast.success(`Pasted ${selectedClips.length} clips in sequence`, {
        title: 'Quick Sequence',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to paste sequence:', error);
      toast.error('Failed to paste sequence', {
        title: 'Error',
        duration: 3000
      });
    }
  };
  
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      clearSelection();
    }
    setShowBulkMenu(false);
  };

  if (isLoading) {
    return <ClipListSkeleton />;
  }
  
  // Bulk Actions Bar
  const hasSelection = selectedClips.length > 0;

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

  // Render with smart grouping
  if (groupByTime && activeTab === 'history') {
    return (
      <div className="space-y-4">
        {/* Selection Mode Toggle & Bulk Actions */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <button
            onClick={toggleSelectionMode}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
              selectionMode
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
          </button>
          
          {selectionMode && hasSelection && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-600">
                {selectedClips.length} selected
              </span>
              <button
                onClick={() => setShowBulkMenu(!showBulkMenu)}
                className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
              >
                Actions
              </button>
              
              {showBulkMenu && (
                <div className="absolute mt-12 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 z-50">
                  <button
                    onClick={handlePasteSequence}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Paste Sequence ({selectedClips.length} clips)
                  </button>
                  <button
                    onClick={handleMergeClips}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Merge Selected
                  </button>
                  <button
                    onClick={handleExportSelected}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    Export Selected
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                  >
                    <X className="w-4 h-4" />
                    Delete Selected
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {Object.entries(groupedClips).map(([groupName, groupClips]) => {
          if (groupClips.length === 0) return null;
          const isCollapsed = collapsedGroups[groupName];
          
          return (
            <div key={groupName} className="space-y-2">
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(groupName)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors w-full text-left"
                style={{ border: '1px solid #E5E5E5' }}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-600" />
                )}
                <Calendar className="w-4 h-4 text-zinc-600" />
                <span className="text-sm font-semibold text-zinc-700">{getGroupLabel(groupName)}</span>
                <span className="text-xs text-zinc-500 ml-auto">({groupClips.length})</span>
              </button>
              
              {/* Group Clips */}
              {!isCollapsed && (
                <div className="space-y-0 ml-4">
                  {groupClips.map((clip, index) => (
                    <div
                      key={clip.id}
                      className="animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        setContextMenu({ clip, x: e.clientX, y: e.clientY });
                      }}
                    >
                      <ClipCard clip={clip} selectionMode={selectionMode} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Render without grouping (default)
  return (
    <div className="space-y-4">
      {/* Selection Mode Toggle & Bulk Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={toggleSelectionMode}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 ${
            selectionMode
              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          {selectionMode ? 'Cancel Selection' : 'Select Multiple'}
        </button>
        
        {selectionMode && hasSelection && (
          <div className="flex items-center gap-2 relative">
            <span className="text-sm text-zinc-600">
              {selectedClips.length} selected
            </span>
            <button
              onClick={() => setShowBulkMenu(!showBulkMenu)}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              Actions
            </button>
            
            {showBulkMenu && (
              <div className="absolute mt-12 right-0 bg-white rounded-xl shadow-lg border border-zinc-200 p-2 z-50 min-w-[180px]">
                <button
                  onClick={handlePasteSequence}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Paste Sequence ({selectedClips.length} clips)
                </button>
                <button
                  onClick={handleMergeClips}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Merge Selected
                </button>
                <button
                  onClick={handleExportSelected}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-zinc-100 text-sm flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Export Selected
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                >
                  <X className="w-4 h-4" />
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-0">
        {clips.map((clip, index) => (
          <div
            key={clip.id}
            className="animate-fadeIn"
            style={{ animationDelay: `${index * 50}ms` }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ clip, x: e.clientX, y: e.clientY });
            }}
          >
            <ClipCard clip={clip} selectionMode={selectionMode} />
          </div>
        ))}
        
        {/* Context Menu */}
        {contextMenu && (
          <ClipContextMenu
            clip={contextMenu.clip}
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onShareClick={() => {
              // Share modal will be handled by parent
              setContextMenu(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ClipList;
