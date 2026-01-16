/**
 * AnalyticsDashboard Component
 * Usage insights and productivity metrics
 */

import React, { useState, useEffect } from 'react';
import './AnalyticsDashboard.css';

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="analytics-loading">Loading analytics...</div>;
  }

  if (!analytics) {
    return <div className="analytics-empty">No analytics data available</div>;
  }

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h2>Analytics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="time-range-select"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      <div className="analytics-grid">
        <div className="stat-card">
          <div className="stat-label">Total Clips</div>
          <div className="stat-value">{analytics.totalClips || 0}</div>
          <div className="stat-change">
            +{analytics.clipsChange || 0} this period
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Characters Copied</div>
          <div className="stat-value">
            {(analytics.totalCharacters || 0).toLocaleString()}
          </div>
          <div className="stat-change">
            Avg: {analytics.avgClipLength || 0} chars/clip
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Most Active Hour</div>
          <div className="stat-value">{analytics.peakHour || 'N/A'}</div>
          <div className="stat-change">
            {analytics.peakHourClips || 0} clips
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Top Type</div>
          <div className="stat-value">{analytics.topType || 'N/A'}</div>
          <div className="stat-change">
            {analytics.topTypeCount || 0} clips
          </div>
        </div>
      </div>

      {analytics.dailyStats && (
        <div className="chart-section">
          <h3>Daily Activity</h3>
          <div className="chart-container">
            {analytics.dailyStats.map((day, index) => (
              <div key={index} className="chart-bar-container">
                <div
                  className="chart-bar"
                  style={{
                    height: `${(day.count / analytics.maxDailyCount) * 100}%`,
                  }}
                  title={`${day.date}: ${day.count} clips`}
                />
                <div className="chart-label">{day.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.topDomains && analytics.topDomains.length > 0 && (
        <div className="top-domains">
          <h3>Top Sources</h3>
          <div className="domains-list">
            {analytics.topDomains.map((domain, index) => (
              <div key={index} className="domain-item">
                <span className="domain-name">{domain.domain}</span>
                <span className="domain-count">{domain.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

