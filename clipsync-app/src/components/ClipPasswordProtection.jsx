/**
 * ClipPasswordProtection Component
 * Password protection UI for individual clips
 */

import React, { useState } from 'react';
import './ClipPasswordProtection.css';

export default function ClipPasswordProtection({ clip, onUnlock, onSetPassword, onRemovePassword }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUnlock = async () => {
    if (!password) {
      setError('Please enter password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clips/${clip.id}/unlock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (onUnlock) {
          onUnlock(data.content);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Incorrect password');
      }
    } catch (error) {
      setError('Failed to unlock clip');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    if (!newPassword) {
      setError('Please enter a password');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clips/${clip.id}/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        if (onSetPassword) {
          onSetPassword();
        }
        setShowSetPassword(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to set password');
      }
    } catch (error) {
      setError('Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePassword = async () => {
    if (!confirm('Are you sure you want to remove password protection?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/clips/${clip.id}/remove-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        if (onRemovePassword) {
          onRemovePassword();
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to remove password');
      }
    } catch (error) {
      setError('Failed to remove password');
    } finally {
      setLoading(false);
    }
  };

  if (clip.password_protected && !clip.unlocked) {
    return (
      <div className="password-protection">
        <div className="lock-icon">🔒</div>
        <h3>Password Protected</h3>
        <p>This clip is protected with a password</p>

        <div className="password-input-group">
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
            className="password-input"
            autoFocus
          />
          <button
            onClick={handleUnlock}
            disabled={loading || !password}
            className="unlock-btn"
          >
            {loading ? 'Unlocking...' : 'Unlock'}
          </button>
        </div>

        {error && <div className="password-error">{error}</div>}
      </div>
    );
  }

  if (showSetPassword) {
    return (
      <div className="set-password-form">
        <h3>Set Password</h3>
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="password-input"
        />
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="password-input"
        />
        <div className="password-actions">
          <button onClick={handleSetPassword} disabled={loading} className="set-btn">
            Set Password
          </button>
          <button
            onClick={() => {
              setShowSetPassword(false);
              setError('');
            }}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
        {error && <div className="password-error">{error}</div>}
      </div>
    );
  }

  return (
    <div className="password-management">
      {clip.password_protected ? (
        <button onClick={handleRemovePassword} className="remove-password-btn">
          Remove Password Protection
        </button>
      ) : (
        <button onClick={() => setShowSetPassword(true)} className="set-password-btn">
          Set Password Protection
        </button>
      )}
    </div>
  );
}

