/**
 * Usage Quota Display Component
 *
 * Shows usage metrics and remaining quota for clips and storage
 */

import { TrendingUp, HardDrive, AlertTriangle } from 'lucide-react';

const UsageQuota = ({
  clipsThisMonth = 0,
  clipsLimit = 50,
  storageUsedMB = 0,
  storageLimitMB = 102.4, // 100MB default
  currentPlan = 'free',
}) => {
  const clipsPercent = (clipsThisMonth / clipsLimit) * 100;
  const storagePercent = (storageUsedMB / storageLimitMB) * 100;

  const formatStorage = (mb) => {
    if (mb < 1024) return `${Math.round(mb)}MB`;
    return `${(mb / 1024).toFixed(2)}GB`;
  };

  const getClipsStatus = () => {
    if (clipsPercent >= 100) return { color: 'red', text: 'Limit reached', bg: 'bg-red-50', border: 'border-red-200' };
    if (clipsPercent >= 80) return { color: 'amber', text: 'Getting close', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { color: 'green', text: 'Good', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const getStorageStatus = () => {
    if (storagePercent >= 100) return { color: 'red', text: 'Limit reached', bg: 'bg-red-50', border: 'border-red-200' };
    if (storagePercent >= 80) return { color: 'amber', text: 'Getting close', bg: 'bg-amber-50', border: 'border-amber-200' };
    return { color: 'green', text: 'Good', bg: 'bg-green-50', border: 'border-green-200' };
  };

  const clipsStatus = getClipsStatus();
  const storageStatus = getStorageStatus();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Clips Quota */}
      <div className={`rounded-xl border ${clipsStatus.border} ${clipsStatus.bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Clips This Month</h3>
              <p className="text-xs text-zinc-600">Monthly allowance</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            clipsStatus.color === 'red' ? 'bg-red-200 text-red-700' :
            clipsStatus.color === 'amber' ? 'bg-amber-200 text-amber-700' :
            'bg-green-200 text-green-700'
          }`}>
            {clipsStatus.text}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-zinc-900">{clipsThisMonth} / {clipsLimit} clips</span>
            <span className="text-zinc-600">{Math.round(clipsPercent)}%</span>
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                clipsStatus.color === 'red' ? 'bg-red-500' :
                clipsStatus.color === 'amber' ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(clipsPercent, 100)}%` }}
            />
          </div>
        </div>

        {clipsPercent >= 80 && (
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {clipsPercent >= 100
                ? 'Upgrade to create more clips'
                : `Only ${clipsLimit - clipsThisMonth} clips remaining this month`}
            </span>
          </div>
        )}

        {clipsPercent < 80 && (
          <p className="text-sm text-zinc-600">
            {clipsLimit - clipsThisMonth} clips remaining until reset next month
          </p>
        )}
      </div>

      {/* Storage Quota */}
      <div className={`rounded-xl border ${storageStatus.border} ${storageStatus.bg} p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Storage Usage</h3>
              <p className="text-xs text-zinc-600">Cloud storage</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold ${
            storageStatus.color === 'red' ? 'bg-red-200 text-red-700' :
            storageStatus.color === 'amber' ? 'bg-amber-200 text-amber-700' :
            'bg-green-200 text-green-700'
          }`}>
            {storageStatus.text}
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="font-medium text-zinc-900">
              {formatStorage(storageUsedMB)} / {formatStorage(storageLimitMB)}
            </span>
            <span className="text-zinc-600">{Math.round(storagePercent)}%</span>
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                storageStatus.color === 'red' ? 'bg-red-500' :
                storageStatus.color === 'amber' ? 'bg-amber-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(storagePercent, 100)}%` }}
            />
          </div>
        </div>

        {storagePercent >= 80 && (
          <div className="flex items-center gap-2 text-sm text-zinc-700">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>
              {storagePercent >= 100
                ? 'Upgrade to store more files'
                : `Only ${Math.round(storageLimitMB - storageUsedMB)}MB remaining`}
            </span>
          </div>
        )}

        {storagePercent < 80 && (
          <p className="text-sm text-zinc-600">
            {Math.round(storageLimitMB - storageUsedMB)}MB available
          </p>
        )}
      </div>

      {/* Plan Info */}
      <div className="md:col-span-2 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">Current Plan: {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
          <br />
          {currentPlan === 'free' && '50 clips/month, 100MB storage'}
          {currentPlan === 'professional' && '500 clips/month, 1GB storage'}
          {currentPlan === 'business' && '5,000 clips/month, 10GB storage'}
          {currentPlan === 'enterprise' && 'Unlimited clips and storage'}
        </p>
        {(clipsPercent >= 100 || storagePercent >= 100) && (
          <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
            Upgrade Now
          </button>
        )}
      </div>
    </div>
  );
};

export default UsageQuota;
