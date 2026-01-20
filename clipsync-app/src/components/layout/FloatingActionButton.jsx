import { useState } from 'react';
import CreateClipModal from '../modals/CreateClipModal';

const FloatingActionButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clipboardContent, setClipboardContent] = useState('');

  const handleClick = async () => {
    // Try to read clipboard content
    try {
      const text = await navigator.clipboard.readText();
      setClipboardContent(text);
    } catch (err) {
      // Clipboard read failed, open modal with empty content
      setClipboardContent('');
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={handleClick}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 hover:shadow-xl text-white"
          title="Create new clip"
          aria-label="Create new clip"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <CreateClipModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialContent={clipboardContent}
      />
    </>
  );
};

export default FloatingActionButton;
