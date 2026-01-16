const KeyboardShortcutHint = () => {
  return (
    <div className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E5E5E5' }}>
      <span className="text-xs text-zinc-500">Press</span>
      <span className="text-xs font-mono bg-zinc-100 px-2 py-1 rounded text-zinc-700">⌘ + Shift + V</span>
      <span className="text-xs text-zinc-500">to quick open</span>
    </div>
  );
};

export default KeyboardShortcutHint;
