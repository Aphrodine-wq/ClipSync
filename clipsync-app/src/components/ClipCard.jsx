import { useState, useRef } from 'react';
import { 
  Copy, 
  Pin, 
  Trash2, 
  MoreHorizontal, 
  Check, 
  Share2,
  Code2,
  Braces,
  Link,
  Fingerprint,
  Palette,
  Mail,
  Globe,
  Key,
  Settings2,
  FolderOpen,
  Type,
  Sparkles,
  Clock
} from 'lucide-react';
import useClipStore from '../store/useClipStore';
import { getRelativeTime, truncateText } from '../utils/clipboard';
import Badge from './ui/Badge';

// Icon mapping for clip types
const typeIcons = {
  code: Code2,
  json: Braces,
  url: Link,
  uuid: Fingerprint,
  color: Palette,
  email: Mail,
  ip: Globe,
  token: Key,
  env: Settings2,
  path: FolderOpen,
  text: Type,
};

// Gradient mapping for clip types
const typeGradients = {
  code: 'from-sky-500 to-blue-600',
  json: 'from-violet-500 to-purple-600',
  url: 'from-emerald-500 to-teal-600',
  uuid: 'from-amber-500 to-orange-600',
  color: 'from-pink-500 to-rose-600',
  email: 'from-indigo-500 to-blue-600',
  ip: 'from-teal-500 to-cyan-600',
  token: 'from-red-500 to-rose-600',
  env: 'from-lime-500 to-green-600',
  path: 'from-orange-500 to-amber-600',
  text: 'from-zinc-500 to-slate-600',
};

// Light background mapping
const typeBgLight = {
  code: 'bg-sky-50',
  json: 'bg-violet-50',
  url: 'bg-emerald-50',
  uuid: 'bg-amber-50',
  color: 'bg-pink-50',
  email: 'bg-indigo-50',
  ip: 'bg-teal-50',
  token: 'bg-red-50',
  env: 'bg-lime-50',
  path: 'bg-orange-50',
  text: 'bg-zinc-50',
};

const ClipCard = ({ clip, onShareClick }) => {
  const { selectedClip, selectClip, copyClip, togglePin, deleteClip } = useClipStore();
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef(null);
  
  const isSelected = selectedClip?.id === clip.id;
  const TypeIcon = typeIcons[clip.type] || Type;
  const gradient = typeGradients[clip.type] || typeGradients.text;
  const bgLight = typeBgLight[clip.type] || typeBgLight.text;
  
  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await copyClip(clip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };
  
  const handlePin = async (e) => {
    e.stopPropagation();
    try {
      await togglePin(clip.id);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };
  
  const handleDelete = async (e) => {
    e.stopPropagation();
    setIsDeleting(true);
    
    // Animate out
    if (cardRef.current) {
      cardRef.current.style.transform = 'translateX(100%)';
      cardRef.current.style.opacity = '0';
    }
    
    setTimeout(async () => {
      try {
        await deleteClip(clip.id);
      } catch (error) {
        console.error('Failed to delete:', error);
        // Reset animation on error
        if (cardRef.current) {
          cardRef.current.style.transform = '';
          cardRef.current.style.opacity = '';
        }
        setIsDeleting(false);
      }
    }, 200);
  };
  
  // Detect if content is a color and show preview
  const isColorContent = clip.type === 'color';
  const colorValue = isColorContent ? clip.content.trim() : null;
  
  return (
    <div
      ref={cardRef}
      onClick={() => selectClip(clip)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`
        group
        relative
        p-4
        rounded-2xl
        cursor-pointer
        transition-all duration-300 ease-out
        ${isSelected 
          ? 'bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-xl scale-[1.02] ring-2 ring-zinc-700' 
          : 'bg-white hover:shadow-lg hover:scale-[1.01] border border-zinc-200 hover:border-zinc-300'
        }
        ${isDeleting ? 'pointer-events-none' : ''}
      `}
      style={{
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Gradient Accent Line */}
      <div 
        className={`
          absolute top-0 left-4 right-4 h-1 rounded-full
          bg-gradient-to-r ${gradient}
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ${isSelected ? 'opacity-100' : ''}
        `}
      />
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {/* Type Badge with Icon */}
          <div 
            className={`
              flex items-center gap-1.5
              px-2.5 py-1
              rounded-lg
              text-xs font-semibold
              ${isSelected 
                ? 'bg-white/10 text-white' 
                : `${bgLight} text-zinc-700`
              }
            `}
          >
            <TypeIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="uppercase tracking-wide">{clip.type}</span>
          </div>
          
          {/* Pinned Badge */}
          {clip.pinned && (
            <div 
              className={`
                flex items-center gap-1
                px-2 py-1
                rounded-lg
                text-xs font-semibold
                ${isSelected 
                  ? 'bg-amber-500/20 text-amber-300' 
                  : 'bg-amber-100 text-amber-700'
                }
              `}
            >
              <Pin className="w-3 h-3" fill="currentColor" strokeWidth={0} />
              <span>Pinned</span>
            </div>
          )}
        </div>
        
        {/* Timestamp */}
        <div 
          className={`
            flex items-center gap-1
            text-xs
            ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}
          `}
        >
          <Clock className="w-3 h-3" strokeWidth={2} />
          <span>{getRelativeTime(clip.timestamp)}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {/* Color Preview */}
        {isColorContent && colorValue && (
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl shadow-inner border border-black/10"
              style={{ backgroundColor: colorValue }}
            />
            <span 
              className={`
                font-mono text-sm font-medium
                ${isSelected ? 'text-zinc-200' : 'text-zinc-700'}
              `}
            >
              {colorValue}
            </span>
          </div>
        )}
        
        {/* Text Content */}
        {!isColorContent && (
          <pre 
            className={`
              text-sm font-mono
              whitespace-pre-wrap break-words
              leading-relaxed
              ${isSelected ? 'text-zinc-200' : 'text-zinc-700'}
              ${clip.type === 'code' || clip.type === 'json' ? 'bg-zinc-50/50 p-2 rounded-lg' : ''}
              ${isSelected && (clip.type === 'code' || clip.type === 'json') ? 'bg-white/5' : ''}
            `}
          >
            {truncateText(clip.content, 150)}
          </pre>
        )}
        
        {/* Fade overlay for long content */}
        {clip.content.length > 150 && (
          <div 
            className={`
              absolute bottom-0 left-0 right-0 h-8
              bg-gradient-to-t
              ${isSelected ? 'from-zinc-900' : 'from-white'}
              to-transparent
              pointer-events-none
            `}
          />
        )}
      </div>
      
      {/* Quick Actions */}
      <div 
        className={`
          flex items-center justify-end gap-1
          mt-3 pt-3
          border-t
          ${isSelected ? 'border-zinc-700' : 'border-zinc-100'}
          transition-all duration-200
          ${showActions || isSelected ? 'opacity-100' : 'opacity-0'}
        `}
      >
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={`
            flex items-center gap-1.5
            px-3 py-1.5
            rounded-lg
            text-xs font-medium
            transition-all duration-150
            ${copied 
              ? 'bg-emerald-500 text-white' 
              : isSelected 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }
          `}
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Copy</span>
            </>
          )}
        </button>
        
        {/* Pin Button */}
        <button
          onClick={handlePin}
          className={`
            p-1.5
            rounded-lg
            transition-all duration-150
            ${clip.pinned 
              ? 'bg-amber-500 text-white' 
              : isSelected 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }
          `}
          title={clip.pinned ? 'Unpin' : 'Pin'}
        >
          <Pin 
            className="w-3.5 h-3.5" 
            strokeWidth={2}
            fill={clip.pinned ? 'currentColor' : 'none'}
          />
        </button>
        
        {/* Share Button */}
        {onShareClick && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShareClick(clip);
            }}
            className={`
              p-1.5
              rounded-lg
              transition-all duration-150
              ${isSelected 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }
            `}
            title="Share"
          >
            <Share2 className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        )}
        
        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className={`
            p-1.5
            rounded-lg
            transition-all duration-150
            ${isSelected 
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30' 
              : 'bg-red-50 text-red-500 hover:bg-red-100'
            }
          `}
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
      
      {/* AI Transform Hint */}
      {isSelected && (
        <div 
          className="
            flex items-center gap-2
            mt-3 pt-3
            border-t border-zinc-700
            text-xs text-zinc-400
          "
        >
          <Sparkles className="w-3.5 h-3.5" strokeWidth={2} />
          <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-300">T</kbd> to transform with AI</span>
        </div>
      )}
    </div>
  );
};

export default ClipCard;
