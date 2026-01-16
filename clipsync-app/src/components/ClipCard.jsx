import useClipStore from '../store/useClipStore';
import { getTypeStyle } from '../utils/typeDetection';
import { getRelativeTime, truncateText } from '../utils/clipboard';

const ClipCard = ({ clip }) => {
  const { selectedClip, selectClip } = useClipStore();
  const isSelected = selectedClip?.id === clip.id;
  const typeStyle = getTypeStyle(clip.type);

  return (
    <div
      onClick={() => selectClip(clip)}
      className={`p-4 rounded-2xl cursor-pointer mb-3 transition-all duration-200 ease-out ${isSelected ? 'bg-zinc-900 text-white shadow-lg scale-[1.02]' : 'bg-white shadow-sm hover:shadow-md hover:scale-[1.01]'}`}
      style={{ border: isSelected ? 'none' : '1px solid #E5E5E5' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span 
            className="px-2 py-0.5 rounded-full text-xs font-semibold tracking-wide"
            style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
          >
            {typeStyle.label}
          </span>
          {clip.pinned && (
            <svg className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-amber-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )}
        </div>
        <span className={`text-xs ${isSelected ? 'text-zinc-400' : 'text-zinc-500'}`}>
          {getRelativeTime(clip.timestamp)}
        </span>
      </div>
      
      <pre className={`text-sm font-mono whitespace-pre-wrap break-words ${isSelected ? 'text-zinc-200' : 'text-zinc-700'}`}>
        {truncateText(clip.content, 120)}
      </pre>
    </div>
  );
};

export default ClipCard;
