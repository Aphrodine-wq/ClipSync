/**
 * Onboarding Component
 * Interactive tutorial and feature discovery
 */

import React, { useState } from 'react';
import './Onboarding.css';

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to ClipSync!',
    description: 'Your professional clipboard manager with real-time sync across all devices.',
    icon: '👋',
  },
  {
    id: 'basics',
    title: 'Clipboard Basics',
    description: 'Copy anything and it automatically syncs. Access your history from any device.',
    icon: '📋',
  },
  {
    id: 'search',
    title: 'Powerful Search',
    description: 'Search through your clipboard history with fuzzy matching and filters.',
    icon: '🔍',
  },
  {
    id: 'pinning',
    title: 'Pin Important Clips',
    description: 'Pin frequently used clips for quick access. Organize with folders and tags.',
    icon: '📌',
  },
  {
    id: 'teams',
    title: 'Team Collaboration',
    description: 'Share clips with your team. Real-time sync and collaboration features.',
    icon: '👥',
  },
  {
    id: 'shortcuts',
    title: 'Keyboard Shortcuts',
    description: 'Use Ctrl+Shift+V to open ClipSync, Ctrl+K to search, and more.',
    icon: '⌨️',
  },
];

export default function Onboarding({ onComplete, onSkip }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    if (onSkip) {
      onSkip();
    }
    // Store in localStorage
    localStorage.setItem('clipsync-onboarding-completed', 'true');
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
    localStorage.setItem('clipsync-onboarding-completed', 'true');
  };

  // Check if already completed
  if (localStorage.getItem('clipsync-onboarding-completed') && !skipped) {
    return null;
  }

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-modal">
        <div className="onboarding-header">
          <button className="skip-btn" onClick={handleSkip}>
            Skip
          </button>
        </div>

        <div className="onboarding-content">
          <div className="onboarding-icon">{step.icon}</div>
          <h2 className="onboarding-title">{step.title}</h2>
          <p className="onboarding-description">{step.description}</p>

          <div className="onboarding-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="progress-text">
              {currentStep + 1} of {STEPS.length}
            </div>
          </div>
        </div>

        <div className="onboarding-footer">
          <button
            className="nav-btn prev-btn"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <div className="step-indicators">
            {STEPS.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
          <button className="nav-btn next-btn" onClick={handleNext}>
            {currentStep === STEPS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

