import { useState } from 'react';
import { Copy, Pin, Trash2, MoreVertical, Check } from 'lucide-react';
import UserAvatar from './UserAvatar';
import { getUserColor } from '../utils/userColors';
import { getRelativeTime } from '../utils/clipboard';

const ClipBubble = ({ 
  clip, 
  isOwn = false, 
  onCopy, 
  onPin, 
  onDelete,
  showAvatar = true 
}) => {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const userColor = clip.user?.color || getUserColor(clip.user?.id || clip.user?.email);
  
  const handleCopy = async () => {
    await onCopy(clip);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bubbleAlignment = isOwn ? 'flex-row-reverse' : 'flex-row';
  const bubbleRadius = isOwn 
    ? 'rounded-2xl rounded-br-md' 
    : 'rounded-2xl rounded-bl-md';
  
  const bubbleAnimation = isOwn 
    ? 'animate-slideInRight' 
    : 'animate-slideInLeft';

  return (
    <div 
      className={`flex gap-3 mb-4 group ${bubbleAlignment} ${bubbleAnimation}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <UserAvatar 
          user={clip.user} 
          size="medium" 
          showOnline={true}
        />
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* User Name (for other users) */}
        {!isOwn && clip.user && (
          <div 
            className="text-xs font-semibold mb-1 px-2"
            style={{ color: userColor.bg }}
          >
            {clip.user.name || clip.user.email}
          </div>
        )}

        {/* Bubble */}
        <div 
          className={`
            relative
            ${bubbleRadius}
            px-4 py-3
            shadow-lg
            transition-all duration-200
            hover:shadow-xl
            hover:scale-[1.02]
            cursor-pointer
          `}
          style={{
            background: isOwn 
              ? userColor.gradient 
              : `linear-gradient(135deg, ${userColor.light} 0%, ${userColor.bg}15 100%)`,
            border: `2px solid ${isOwn ? userColor.dark : userColor.bg}30`,
          }}
          onClick={handleCopy}
        >
          {/* Bubble Tail */}
          <div 
            className={`
              absolute top-3 w-0 h-0
              ${isOwn ? 'right-[-8px]' : 'left-[-8px]'}
            `}
            style={{
              borderTop: `8px solid transparent`,
              borderBottom: `8px solid transparent`,
              [isOwn ? 'borderLeft' : 'borderRight']: `8px solid ${isOwn ? userColor.bg : userColor.light}`,
            }}
          />

          {/* Content */}
          <div 
            className={`text-sm whitespace-pre-wrap break-words ${isOwn ? 'text-white' : 'text-zinc-800'}`}
            style={{ 
              fontFamily: clip.type === 'code' ? 'monospace' : 'inherit',
            }}
          >
            {clip.content}
          </div>

          {/* Type Badge */}
          {clip.type && clip.type !== 'text' && (
            <div 
              className={`
                inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium
                ${isOwn ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-700'}
              `}
            >
              {clip.type}
            </div>
          )}

          {/* Pinned Indicator */}
          {clip.pinned && (
            <Pin 
              className={`absolute top-2 ${isOwn ? 'left-2' : 'right-2'} w-3 h-3`}
              style={{ color: isOwn ? 'white' : userColor.bg }}
              fill="currentColor"
            />
          )}
        </div>

        {/* Timestamp & Actions */}
        <div className={`flex items-center gap-2 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Timestamp */}
          <span className="text-xs text-zinc-500">
            {getRelativeTime(clip.timestamp)}
          </span>

          {/* Quick Actions (shown on hover) */}
          {showActions && (
            <div className="flex items-center gap-1 animate-fadeIn">
              {/* Copy Button */}
              <button
                onClick={handleCopy}
                className={`
                  p-1 rounded-lg transition-all
                  ${copied 
                    ? 'bg-emerald-100 text-emerald-600' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }
                `}
                title={copied ? 'Copied!' : 'Copy'}
              >
                {copied ? (
                  <Check className="w-3 h-3" strokeWidth={2.5} />
                ) : (
                  <Copy className="w-3 h-3" strokeWidth={2} />
                )}
              </button>

              {/* Pin Button */}
              <button
                onClick={() => onPin(clip)}
                className={`
                  p-1 rounded-lg transition-all
                  ${clip.pinned 
                    ? 'bg-amber-100 text-amber-600' 
                    : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                  }
                `}
                title={clip.pinned ? 'Unpin' : 'Pin'}
              >
                <Pin 
                  className="w-3 h-3" 
                  strokeWidth={2}
                  fill={clip.pinned ? 'currentColor' : 'none'}
                />
              </button>

              {/* Delete Button */}
              {isOwn && (
                <button
                  onClick={() => onDelete(clip)}
                  className="p-1 rounded-lg bg-zinc-100 text-red-600 hover:bg-red-50 transition-all"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" strokeWidth={2} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Avatar (for own messages) */}
      {showAvatar && isOwn && (
        <UserAvatar 
          user={clip.user} 
          size="medium" 
          showOnline={false}
        />
      )}
    </div>
  );
};

export default ClipBubble;
