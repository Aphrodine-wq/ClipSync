import { useState, useEffect, useRef } from 'react';
import useClipStore from '../store/useClipStore';
import { Copy, Trash2, Pin, Share2, Edit, Scissors, Clock, ExternalLink } from 'lucide-react';

const ClipContextMenu = ({ clip, x, y, onClose, onShareClick }) => {
  const { 
    copyClip, 
    deleteClip, 
    togglePin, 
    expandTemplate, 
    setClipExpiration, 
    splitClip 
  } = useClipStore();
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.right > window.innerWidth) {
        menuRef.current.style.left = `${x - rect.width}px`;
      }
      if (rect.bottom > window.innerHeight) {
        menuRef.current.style.top = `${y - rect.height}px`;
      }
    }
  }, [x, y]);

  const handleCopy = async () => {
    await copyClip(clip);
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this clip?')) {
      await deleteClip(clip.id);
      onClose();
    }
  };

  const handlePin = async () => {
    await togglePin(clip.id);
    onClose();
  };

  const handleShare = () => {
    onShareClick();
    onClose();
  };

  const handleSplit = async () => {
    const delimiter = prompt('Enter delimiter (default: newline):', '\n');
    if (delimiter !== null) {
      try {
        await splitClip(clip.id, delimiter || '\n');
      } catch (error) {
        alert(error.message || 'Failed to split clip');
      }
    }
    onClose();
  };

  const handleExpire = async () => {
    const minutes = prompt('Expire in how many minutes?', '60');
    if (minutes && parseInt(minutes) > 0) {
      try {
        await setClipExpiration(clip.id, parseInt(minutes));
      } catch (error) {
        alert(error.message || 'Failed to set expiration');
      }
    }
    onClose();
  };

  const menuItems = [
    { icon: Copy, label: 'Copy', action: handleCopy },
    { icon: Pin, label: clip.pinned ? 'Unpin' : 'Pin', action: handlePin },
    { icon: Share2, label: 'Share', action: handleShare },
    ...(clip.template ? [{ icon: ExternalLink, label: 'Expand Template', action: () => { expandTemplate(clip.id, {}); onClose(); } }] : []),
    { icon: Scissors, label: 'Split', action: handleSplit },
    { icon: Clock, label: 'Set Expiration', action: handleExpire },
    { icon: Trash2, label: 'Delete', action: handleDelete, danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-xl shadow-2xl border border-zinc-200 py-2 min-w-[200px]"
      style={{ left: `${x}px`, top: `${y}px` }}
    >
      {menuItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={item.action}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-zinc-100 ${
              item.danger ? 'text-red-600 hover:bg-red-50' : 'text-zinc-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ClipContextMenu;

