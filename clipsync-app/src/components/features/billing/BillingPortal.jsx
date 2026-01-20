/**
 * BillingPortal Component
 * Manages subscription and billing
 */

import React, { useState, useEffect } from 'react';
import './BillingPortal.css';

export default function BillingPortal() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/subscription', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Failed to start checkout');
    }
  };

  const handleManageBilling = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Portal error:', error);
      setError('Failed to open billing portal');
    }
  };

  if (loading) {
    return <div className="billing-loading">Loading...</div>;
  }

  return (
    <div className="billing-portal">
      <h2>Billing & Subscription</h2>

      {error && <div className="billing-error">{error}</div>}

      <div className="current-plan">
        <h3>Current Plan</h3>
        <div className="plan-card">
          <div className="plan-name">
            {subscription?.plan || 'Free'}
          </div>
          {subscription?.status && (
            <div className={`plan-status ${subscription.status}`}>
              {subscription.status}
            </div>
          )}
          {subscription?.current_period_end && (
            <div className="plan-renewal">
              Renews: {new Date(subscription.current_period_end).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      <div className="plan-actions">
        {subscription?.stripe_subscription_id ? (
          <button onClick={handleManageBilling} className="manage-btn">
            Manage Billing
          </button>
        ) : (
          <div className="upgrade-options">
            <button onClick={() => handleUpgrade('pro')} className="upgrade-btn">
              Upgrade to Pro
            </button>
            <button onClick={() => handleUpgrade('team')} className="upgrade-btn">
              Upgrade to Team
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

