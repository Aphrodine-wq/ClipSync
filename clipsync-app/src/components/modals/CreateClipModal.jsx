import { useState, useEffect } from 'react';
import { X, Tag, Folder, Lock, Pin, Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { detectClipType, getTypeStyle } from '../../utils/typeDetection';
import { autoCategorize } from '../../utils/autoCategorize';
import { detectSensitiveData } from '../../utils/sensitiveDataDetector';
import useClipStore from '../../store/useClipStore';

const CreateClipModal = ({ isOpen, onClose, initialContent = '' }) => {
  const { addClip } = useClipStore();
  const [content, setContent] = useState(initialContent);
  const [type, setType] = useState('text');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [folderId, setFolderId] = useState(null);
  const [pinned, setPinned] = useState(false);
  const [encrypt, setEncrypt] = useState(false);
  const [isTemplate, setIsTemplate] = useState(false);
  const [expiresInMinutes, setExpiresInMinutes] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-detect type and categorize when content changes
  useEffect(() => {
    if (content.trim()) {
      const detectedType = detectClipType(content);
      setType(detectedType);
      
      // Auto-categorize and suggest tags
      const categorization = autoCategorize(content, detectedType);
      
      // Auto-suggest tags if none exist
      if (tags.length === 0 && categorization.suggestedTags.length > 0) {
        // Don't auto-add, just show suggestion
        // User can add them manually
      }
      
      // Warn about sensitive data
      const sensitiveDetection = detectSensitiveData(content);
      if (sensitiveDetection.isSensitive && !encrypt) {
        // Show warning but don't auto-enable encryption
        // User should decide
      }
    }
  }, [content]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setContent(initialContent);
      setType(initialContent ? detectClipType(initialContent) : 'text');
      setTags([]);
      setTagInput('');
      setFolderId(null);
      setPinned(false);
      setEncrypt(false);
      setIsTemplate(false);
      setExpiresInMinutes(null);
      setError('');
    }
  }, [isOpen, initialContent]);

  // Handle tag input
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Extract placeholders if template
      let templatePlaceholders = null;
      if (isTemplate) {
        const placeholderRegex = /\{\{(\w+)\}\}/g;
        const matches = [...content.matchAll(placeholderRegex)];
        if (matches.length > 0) {
          templatePlaceholders = {};
          matches.forEach(match => {
            templatePlaceholders[match[1]] = '';
          });
        }
      }

      // Create clip with metadata
      await addClip(content, {
        type,
        pinned,
        folderId,
        tags,
        encrypt,
        template: isTemplate,
        templatePlaceholders,
        expiresInMinutes: expiresInMinutes ? parseInt(expiresInMinutes) : null,
        manual: true,
      });
      
      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create clip');
    } finally {
      setIsLoading(false);
    }
  };

  const typeStyle = getTypeStyle(type);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Clip"
      description="Add a new clip with categorization and organization"
      size="2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            loading={isLoading}
            disabled={!content.trim()}
          >
            Create Clip
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Content Input */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Content *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste or type your clip content here..."
            className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={8}
            required
            autoFocus
          />
          <p className="mt-1 text-xs text-zinc-500">
            {content.length} characters
          </p>
        </div>

        {/* Type Detection Preview */}
        {content.trim() && (
          <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700">Detected Type:</span>
            </div>
            <span
              className="px-3 py-1 rounded-lg text-xs font-semibold"
              style={{ backgroundColor: typeStyle.bg, color: typeStyle.text }}
            >
              {typeStyle.label}
            </span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="ml-auto px-3 py-1 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="json">JSON</option>
              <option value="code">Code</option>
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="uuid">UUID</option>
              <option value="token">Token</option>
              <option value="color">Color</option>
              <option value="ip">IP Address</option>
              <option value="path">File Path</option>
              <option value="env">Environment Variable</option>
            </select>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2 p-3 border border-zinc-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-lg text-xs font-medium"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? "Add tags (press Enter)" : ""}
              className="flex-1 min-w-[120px] outline-none text-sm"
            />
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Press Enter to add a tag
          </p>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Folder Selection */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              <Folder className="w-4 h-4 inline mr-1" />
              Folder
            </label>
            <select
              value={folderId || ''}
              onChange={(e) => setFolderId(e.target.value || null)}
              className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No folder</option>
              {/* TODO: Load folders from store */}
            </select>
          </div>

          {/* Encryption Toggle */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              <Lock className="w-4 h-4 inline mr-1" />
              Security
            </label>
            <label className="flex items-center gap-2 p-3 border border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={encrypt}
                onChange={(e) => setEncrypt(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-zinc-700">Encrypt this clip</span>
            </label>
          </div>
        </div>

        {/* Options Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Template Toggle */}
          <div>
            <label className="flex items-center gap-2 p-3 border border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={isTemplate}
                onChange={(e) => setIsTemplate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Sparkles className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700">Save as template</span>
            </label>
            {isTemplate && (
              <p className="mt-1 text-xs text-zinc-500">
                Use {"{{placeholder}}"} syntax for dynamic values
              </p>
            )}
          </div>

          {/* Pinned Toggle */}
          <div>
            <label className="flex items-center gap-2 p-3 border border-zinc-300 rounded-xl cursor-pointer hover:bg-zinc-50">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Pin className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-700">Pin this clip</span>
            </label>
          </div>
        </div>

        {/* Expiration */}
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Auto-expire (optional)
          </label>
          <input
            type="number"
            value={expiresInMinutes || ''}
            onChange={(e) => setExpiresInMinutes(e.target.value || null)}
            placeholder="Minutes until expiration"
            min="1"
            className="w-full px-3 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-zinc-500">
            Clip will be automatically deleted after this many minutes
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CreateClipModal;

