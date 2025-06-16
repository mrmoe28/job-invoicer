'use client';

import DashboardLayout from '../../../components/dashboard-layout';

export default function SystemPage() {
  return (
    <DashboardLayout title="System Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">System Settings</h1>
          </div>
          <p className="text-gray-300">Configure system-wide settings and preferences.</p>
        </div>

        {/* General Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">General Settings</h3>
            <p className="text-gray-400 text-sm">Basic system configuration options</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">System Name</label>
              <input
                type="text"
                defaultValue="PulseCRM Production"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Time Zone</label>
              <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC-6 (Central Time)</option>
                <option>UTC-7 (Mountain Time)</option>
                <option>UTC-8 (Pacific Time)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Date Format</label>
              <select className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                <option>MM/DD/YYYY</option>
                <option>DD/MM/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Performance Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Performance & Storage</h3>
            <p className="text-gray-400 text-sm">Manage system performance and storage options</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-white font-medium">CPU Usage</div>
                <div className="text-2xl font-bold text-green-400">12%</div>
                <div className="text-gray-400 text-sm">4 cores available</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-white font-medium">Memory Usage</div>
                <div className="text-2xl font-bold text-yellow-400">68%</div>
                <div className="text-gray-400 text-sm">16 GB total</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-white font-medium">Storage</div>
                <div className="text-2xl font-bold text-orange-400">45%</div>
                <div className="text-gray-400 text-sm">500 GB available</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Auto-cleanup Old Logs</div>
                  <div className="text-gray-400 text-sm">Remove logs older than 30 days</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Cache Optimization</div>
                  <div className="text-gray-400 text-sm">Enable advanced caching for better performance</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">System Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-gray-400 text-sm">Version</div>
                <div className="text-white font-medium">PulseCRM v2.1.0</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Last Update</div>
                <div className="text-white font-medium">June 10, 2025</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Database</div>
                <div className="text-white font-medium">PostgreSQL 15.3</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Uptime</div>
                <div className="text-white font-medium">15 days, 6 hours</div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
