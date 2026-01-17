/**
 * Device Management Component
 *
 * Displays registered devices and allows management
 * Shows device limits based on current plan
 */

import { Trash2, Smartphone, Laptop, Globe, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const DeviceManagement = ({ devices = [], maxDevices = 1, currentPlan = 'free' }) => {
  const [selectedDevice, setSelectedDevice] = useState(null);

  const deviceIcons = {
    mobile: <Smartphone className="w-5 h-5" />,
    desktop: <Laptop className="w-5 h-5" />,
    web: <Globe className="w-5 h-5" />,
    extension: <Globe className="w-5 h-5" />,
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
  };

  const canAddDevice = devices.length < maxDevices;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-2">Registered Devices</h2>
        <p className="text-sm text-zinc-600">
          {devices.length} of {maxDevices} devices
          {!canAddDevice && maxDevices < 10 && (
            <span className="block mt-2 flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-4 h-4" />
              Device limit reached. Upgrade to add more.
            </span>
          )}
        </p>
      </div>

      {/* Device List */}
      <div className="space-y-3 mb-6">
        {devices.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>No devices registered yet</p>
            <p className="text-sm">Your devices will appear here once you log in</p>
          </div>
        ) : (
          devices.map((device) => (
            <div
              key={device.id}
              className="flex items-center justify-between p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  {deviceIcons[device.type] || deviceIcons.web}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-zinc-900">{device.name}</h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mt-1">
                    <span className="capitalize bg-zinc-200 px-2 py-1 rounded">
                      {device.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(device.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>
              {devices.length > 1 && (
                <button
                  onClick={() => setSelectedDevice(device.id)}
                  className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Usage Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-zinc-900">Device Usage</span>
          <span className="text-sm text-zinc-600">
            {devices.length}/{maxDevices}
          </span>
        </div>
        <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              devices.length >= maxDevices
                ? 'bg-red-500'
                : devices.length >= maxDevices - 1
                ? 'bg-amber-500'
                : 'bg-indigo-500'
            }`}
            style={{ width: `${(devices.length / maxDevices) * 100}%` }}
          />
        </div>
      </div>

      {/* Plan Info */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
        <p className="text-sm text-indigo-900">
          <span className="font-semibold">Your {currentPlan} plan includes {maxDevices} device{maxDevices !== 1 ? 's' : ''}</span>
        </p>
        {!canAddDevice && maxDevices < 10 && (
          <button className="mt-3 w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm">
            Upgrade Plan
          </button>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
