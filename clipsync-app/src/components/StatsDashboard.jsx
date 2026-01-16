import { useState, useEffect } from 'react';
import apiClient from '../services/api';
import { BarChart3, TrendingUp, Globe, Clock, FileText } from 'lucide-react';

const StatsDashboard = ({ onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getDashboardStats(days);
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="text-sm text-zinc-600 mt-4">Loading statistics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-zinc-100 p-6">
        <div className="max-w-7xl mx-auto">
          <button onClick={onClose} className="mb-4 text-zinc-600 hover:text-zinc-900">
            ← Back
          </button>
          <div className="text-center py-12">
            <p className="text-zinc-600">No statistics available</p>
          </div>
        </div>
      </div>
    );
  }

  const maxHourlyCount = Math.max(...stats.hourlyActivity.map(h => h.count), 1);

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">Statistics Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Your clipboard activity insights</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
              className="px-4 py-2 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Lifetime Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-zinc-600">Total Clips</h3>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{stats.lifetime.totalClips.toLocaleString()}</p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-zinc-600">Total Characters</h3>
            </div>
            <p className="text-3xl font-bold text-zinc-900">
              {(stats.lifetime.totalCharacters / 1000).toFixed(1)}K
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm font-medium text-zinc-600">Avg per Day</h3>
            </div>
            <p className="text-3xl font-bold text-zinc-900">
              {stats.daily.length > 0 
                ? Math.round(stats.daily.reduce((sum, d) => sum + d.clipCount, 0) / stats.daily.length)
                : 0}
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clips per Day */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Clips per Day</h3>
            <div className="h-64 flex items-end gap-2">
              {stats.daily.map((day, index) => {
                const maxCount = Math.max(...stats.daily.map(d => d.clipCount), 1);
                const height = (day.clipCount / maxCount) * 100;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${height}%`, minHeight: day.clipCount > 0 ? '4px' : '0' }}
                      title={`${new Date(day.date).toLocaleDateString()}: ${day.clipCount} clips`}
                    />
                    <span className="text-xs text-zinc-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Peak Activity Hours */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4">Peak Activity Hours</h3>
            <div className="space-y-2">
              {stats.hourlyActivity.map((hour, index) => {
                const width = (hour.count / maxHourlyCount) * 100;
                return (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 w-12 text-right">{hour.hour}:00</span>
                    <div className="flex-1 bg-zinc-100 rounded-full h-6 relative overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-purple-500 rounded-full transition-all"
                        style={{ width: `${width}%` }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-zinc-700">
                        {hour.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Domains */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-green-500" />
              Most Copied Domains
            </h3>
            <div className="space-y-3">
              {stats.topDomains.length > 0 ? (
                stats.topDomains.map((domain, index) => {
                  const maxCount = Math.max(...stats.topDomains.map(d => d.count), 1);
                  const width = (domain.count / maxCount) * 100;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-zinc-700 truncate">{domain.domain}</span>
                        <span className="text-sm text-zinc-500">{domain.count}</span>
                      </div>
                      <div className="w-full bg-zinc-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-zinc-500">No URL clips found</p>
              )}
            </div>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <h3 className="text-lg font-semibold text-zinc-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Recent Activity
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.daily.slice(-7).reverse().map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-zinc-700">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {day.clipCount} clips • {(day.totalCharacters / 1000).toFixed(1)}K chars
                    </p>
                  </div>
                  {day.peakHour !== null && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-500">Peak hour</p>
                      <p className="text-sm font-semibold text-zinc-700">{day.peakHour}:00</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;

