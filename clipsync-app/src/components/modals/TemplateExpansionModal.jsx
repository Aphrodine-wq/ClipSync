import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import useClipStore from '../../store/useClipStore';

const TemplateExpansionModal = ({ isOpen, onClose, templateClip }) => {
  const { expandTemplate } = useClipStore();
  const [placeholders, setPlaceholders] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen && templateClip) {
      // Initialize placeholders from template
      const templatePlaceholders = templateClip.template_placeholders || {};
      setPlaceholders(templatePlaceholders);
      updatePreview(templatePlaceholders);
    }
  }, [isOpen, templateClip]);

  const updatePreview = (newPlaceholders) => {
    if (!templateClip) return;
    
    let previewContent = templateClip.content;
    Object.keys(newPlaceholders).forEach(key => {
      const value = newPlaceholders[key] || '';
      previewContent = previewContent.replace(
        new RegExp(`\\{\\{${key}\\}\\}`, 'g'),
        value
      );
    });
    setPreview(previewContent);
  };

  const handlePlaceholderChange = (key, value) => {
    const newPlaceholders = { ...placeholders, [key]: value };
    setPlaceholders(newPlaceholders);
    updatePreview(newPlaceholders);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!templateClip) return;

    setIsLoading(true);
    setError('');

    try {
      await expandTemplate(templateClip.id, placeholders);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to expand template');
    } finally {
      setIsLoading(false);
    }
  };

  if (!templateClip) return null;

  const placeholderKeys = Object.keys(placeholders);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Expand Template"
      description="Fill in the placeholder values to create a new clip"
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
          >
            Create Clip
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Placeholder Inputs */}
        {placeholderKeys.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-semibold text-zinc-700">
                Fill in the placeholders:
              </h3>
            </div>
            {placeholderKeys.map(key => (
              <div key={key}>
                <label className="block text-sm font-medium text-zinc-700 mb-2">
                  {key}
                </label>
                <Input
                  value={placeholders[key] || ''}
                  onChange={(e) => handlePlaceholderChange(key, e.target.value)}
                  placeholder={`Enter value for ${key}`}
                  required
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-800">
              No placeholders found in this template. The template will be copied as-is.
            </p>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Preview
            </label>
            <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200 max-h-48 overflow-y-auto">
              <pre className="text-sm text-zinc-800 whitespace-pre-wrap break-words">
                {preview}
              </pre>
            </div>
          </div>
        )}

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

export default TemplateExpansionModal;

