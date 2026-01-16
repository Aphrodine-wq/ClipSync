/**
 * ThemeSelector Component
 * Theme selection and customization UI
 */

import React, { useState, useEffect } from 'react';
import { getThemes, getCurrentTheme, setTheme, createCustomTheme } from '../utils/themes';
import './ThemeSelector.css';

export default function ThemeSelector({ onClose }) {
  const [themes, setThemes] = useState([]);
  const [currentTheme, setCurrentThemeState] = useState(null);
  const [showCustom, setShowCustom] = useState(false);
  const [customColors, setCustomColors] = useState({});

  useEffect(() => {
    setThemes(getThemes());
    setCurrentThemeState(getCurrentTheme());
  }, []);

  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    setCurrentThemeState(getThemes().find(t => t.id === themeId));
  };

  const handleCustomColorChange = (colorKey, value) => {
    setCustomColors({
      ...customColors,
      [colorKey]: value,
    });
  };

  const handleSaveCustom = () => {
    const name = prompt('Theme name:');
    if (name) {
      createCustomTheme(name, customColors);
      setShowCustom(false);
      setThemes(getThemes());
    }
  };

  return (
    <div className="theme-selector">
      <div className="theme-selector-header">
        <h3>Select Theme</h3>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      <div className="theme-grid">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className={`theme-card ${currentTheme?.id === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.id)}
          >
            <div
              className="theme-preview"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
              }}
            />
            <div className="theme-name">{theme.name}</div>
          </div>
        ))}
      </div>

      <div className="theme-actions">
        <button
          className="custom-btn"
          onClick={() => setShowCustom(!showCustom)}
        >
          {showCustom ? 'Cancel' : 'Create Custom Theme'}
        </button>
      </div>

      {showCustom && (
        <div className="custom-theme-editor">
          <h4>Custom Theme</h4>
          <div className="color-inputs">
            {Object.keys(getCurrentTheme().colors).map((key) => (
              <div key={key} className="color-input">
                <label>{key}</label>
                <input
                  type="color"
                  value={customColors[key] || getCurrentTheme().colors[key]}
                  onChange={(e) => handleCustomColorChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <button className="save-btn" onClick={handleSaveCustom}>
            Save Custom Theme
          </button>
        </div>
      )}
    </div>
  );
}

