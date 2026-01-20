/**
 * ShortcutHints Component
 * Displays keyboard shortcut hints
 */

import React, { useState, useEffect } from 'react';
import { getAllShortcuts, formatShortcut } from '../../utils/shortcuts';
import './ShortcutHints.css';

export default function ShortcutHints({ visible = true }) {
  const [shortcuts, setShortcuts] = useState({});
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShortcuts(getAllShortcuts());
  }, []);

  if (!visible) return null;

  const commonShortcuts = {
    openApp: shortcuts.openApp,
    search: shortcuts.search,
    newClip: shortcuts.newClip,
  };

  const allShortcuts = shortcuts;

  return (
    <div className="shortcut-hints">
      <div className="hints-header">
        <span className="hints-title">Keyboard Shortcuts</span>
        <button
          className="toggle-btn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show Less' : 'Show All'}
        </button>
      </div>

      <div className="hints-list">
        {Object.entries(showAll ? allShortcuts : commonShortcuts).map(
          ([name, shortcut]) => (
            <div key={name} className="hint-item">
              <span className="hint-name">{formatShortcutName(name)}</span>
              <span className="hint-shortcut">{formatShortcut(shortcut)}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function formatShortcutName(name) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

