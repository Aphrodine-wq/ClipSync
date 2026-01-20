import { useState } from 'react';
import { 
  Copy, 
  Pin, 
  Trash2, 
  Share2, 
  Check,
  Sparkles,
  Wand2,
  ArrowRight,
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
  Clock,
  Hash,
  FileText,
  Zap,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import useClipStore from '../../store/useClipStore';
import { getRelativeTime } from '../../utils/clipboard';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

// Icon mapping
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

// Quick transforms based on type
const quickTransforms = {
  code: [
    { label: 'Format', icon: Wand2, action: 'format' },
    { label: 'Minify', icon: Zap, action: 'minify' },
    { label: 'Add Comments', icon: FileText, action: 'comment' },
  ],
  json: [
    { label: 'Format', icon: Wand2, action: 'format' },
    { label: 'Minify', icon: Zap, action: 'minify' },
    { label: 'To TypeScript', icon: Code2, action: 'toTs' },
  ],
  url: [
    { label: 'Decode', icon: Wand2, action: 'decode' },
    { label: 'Extract Params', icon: Hash, action: 'params' },
    { label: 'Open', icon: ExternalLink, action: 'open' },
  ],
  text: [
    { label: 'Uppercase', icon: Type, action: 'upper' },
    { label: 'Lowercase', icon: Type, action: 'lower' },
    { label: 'Summarize', icon: Sparkles, action: 'summarize' },
  ],
  default: [
    { label: 'Transform', icon: Wand2, action: 'transform' },
    { label: 'Analyze', icon: Sparkles, action: 'analyze' },
  ],
};

const DetailSidebar = ({ onShareClick }) => {
  const { selectedClip, copyClip, togglePin, deleteClip } = useClipStore();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Empty state
  if (!selectedClip) {
    return (
      <div className="w-96">
        <Card variant="gradient" padding="lg" className="sticky top-24">
          <div className="text-center py-8">
            {/* Animated Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500 to-violet-500 rounded-2xl opacity-20 animate-pulse" />
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-violet-500" strokeWidth={1.5} />
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Select a clip
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              Click on any clip to view details, transform, and share
            </p>
            
            {/* Keyboard Hints */}
            <div className="space-y-2 text-xs text-zinc-400">
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-100 rounded-lg font-mono">↑↓</kbd>
                <span>Navigate clips</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-100 rounded-lg font-mono">Enter</kbd>
                <span>Copy selected</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <kbd className="px-2 py-1 bg-zinc-100 rounded-lg font-mono">T</kbd>
                <span>Transform</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  const TypeIcon = typeIcons[selectedClip.type] || Type;
  const transforms = quickTransforms[selectedClip.type] || quickTransforms.default;
  
  const handleCopy = async () => {
    try {
      await copyClip(selectedClip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
    if (!confirm('Are you sure you want to delete this clip?')) return;
    
    setIsDeleting(true);
    try {
      await deleteClip(selectedClip.id);
    } catch (error) {
      console.error('Failed to delete:', error);
      setIsDeleting(false);
    }
  };
  
  // Color preview for color type
  const isColor = selectedClip.type === 'color';
  const colorValue = isColor ? selectedClip.content.trim() : null;
  
  return (
    <div className="w-96">
      <div className="sticky top-24 space-y-4">
        {/* Main Card */}
        <Card variant="elevated" padding="none" className="overflow-hidden">
          {/* Header with Gradient */}
          <div className="relative p-6 pb-4">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 to-violet-500/10" />
            
            <div className="relative">
              {/* Type & Actions */}
              <div className="flex items-center justify-between mb-4">
                <Badge 
                  variant="gradientPrimary" 
                  size="md"
                  icon={TypeIcon}
                >
                  {selectedClip.type.toUpperCase()}
                </Badge>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePin}
                    className={`
                      p-2 rounded-xl transition-all duration-200
                      ${selectedClip.pinned 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'hover:bg-zinc-100 text-zinc-500'
                      }
                    `}
                    title={selectedClip.pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin 
                      className="w-4 h-4" 
                      strokeWidth={2}
                      fill={selectedClip.pinned ? 'currentColor' : 'none'}
                    />
                  </button>
                  
                  <button
                    onClick={() => onShareClick?.(selectedClip)}
                    className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{getRelativeTime(selectedClip.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{selectedClip.content.length} chars</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Content Preview */}
          <div className="px-6 pb-4">
            {/* Color Preview */}
            {isColor && colorValue && (
              <div className="flex items-center gap-4 mb-4 p-3 bg-zinc-50 rounded-xl">
                <div 
                  className="w-16 h-16 rounded-xl shadow-inner border border-black/10"
                  style={{ backgroundColor: colorValue }}
                />
                <div>
                  <p className="font-mono text-sm font-medium text-zinc-900">{colorValue}</p>
                  <p className="text-xs text-zinc-500 mt-1">Click to copy color code</p>
                </div>
              </div>
            )}
            
            {/* Text Content */}
            <div className="relative">
              <pre 
                className="
                  bg-zinc-50 
                  rounded-xl 
                  p-4 
                  text-sm 
                  font-mono 
                  text-zinc-800 
                  overflow-x-auto 
                  max-h-48 
                  overflow-y-auto 
                  whitespace-pre-wrap 
                  break-words
                  border border-zinc-100
                "
              >
                {selectedClip.content}
              </pre>
              
              {/* Copy overlay on hover */}
              <div 
                className="
                  absolute inset-0 
                  bg-gradient-to-t from-zinc-900/80 to-transparent 
                  opacity-0 hover:opacity-100
                  transition-opacity duration-200
                  rounded-xl
                  flex items-end justify-center
                  pb-4
                  cursor-pointer
                "
                onClick={handleCopy}
              >
                <span className="text-white text-sm font-medium flex items-center gap-2">
                  <Copy className="w-4 h-4" strokeWidth={2} />
                  Click to copy
                </span>
              </div>
            </div>
          </div>
          
          {/* Copy Button */}
          <div className="px-6 pb-6">
            <Button
              variant={copied ? 'success' : 'primary'}
              size="lg"
              fullWidth
              icon={copied ? Check : Copy}
              onClick={handleCopy}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            </Button>
          </div>
        </Card>
        
        {/* Quick Transforms Card */}
        <Card variant="default" padding="md">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
              <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <div>
              <h4 className="font-semibold text-zinc-900">Quick Transforms</h4>
              <p className="text-xs text-zinc-500">AI-powered transformations</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {transforms.map((transform, index) => {
              const Icon = transform.icon;
              return (
                <button
                  key={index}
                  className="
                    w-full
                    flex items-center justify-between
                    p-3
                    rounded-xl
                    bg-zinc-50
                    hover:bg-zinc-100
                    transition-all duration-200
                    group
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      <Icon className="w-4 h-4 text-zinc-600" strokeWidth={2} />
                    </div>
                    <span className="text-sm font-medium text-zinc-700">{transform.label}</span>
                  </div>
                  <ChevronRight 
                    className="w-4 h-4 text-zinc-400 group-hover:translate-x-1 transition-transform" 
                    strokeWidth={2} 
                  />
                </button>
              );
            })}
          </div>
          
          {/* More Transforms Link */}
          <button className="
            w-full
            flex items-center justify-center gap-2
            mt-4 pt-4
            border-t border-zinc-100
            text-sm font-medium text-violet-600
            hover:text-violet-700
            transition-colors
          ">
            <Wand2 className="w-4 h-4" strokeWidth={2} />
            <span>View all transforms</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </button>
        </Card>
        
        {/* Keyboard Shortcuts */}
        <Card variant="ghost" padding="sm">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600 font-mono">C</kbd>
              <span>Copy</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600 font-mono">P</kbd>
              <span>Pin</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-zinc-200 rounded text-zinc-600 font-mono">Del</kbd>
              <span>Delete</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DetailSidebar;
