const FloatingActionButton = () => {
  const handleClick = () => {
    // Trigger manual clipboard read
    navigator.clipboard.readText()
      .then(text => {
        console.log('Manual clipboard read:', text);
        // This would trigger adding the clip
      })
      .catch(err => {
        console.error('Failed to read clipboard:', err);
      });
  };

  return (
    <div className="fixed bottom-6 right-6">
      <button 
        onClick={handleClick}
        className="w-14 h-14 bg-zinc-900 rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 hover:shadow-xl"
        title="Add from clipboard"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default FloatingActionButton;
