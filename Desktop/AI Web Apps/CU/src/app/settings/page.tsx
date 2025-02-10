'use client'

import { Settings, Bell, Shield, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="text-purple-500" size={24} />
          Settings
        </h1>
      </div>

      <div className="grid gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Bell size={20} className="text-yellow-500" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Certificate Expiry Alerts</label>
              <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                <option>30 days before</option>
                <option>14 days before</option>
                <option>7 days before</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Email Notifications</label>
              <input
                type="checkbox"
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-green-500" />
            Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Auto-renew Certificates</label>
              <input
                type="checkbox"
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Minimum TLS Version</label>
              <select className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white">
                <option>TLS 1.3</option>
                <option>TLS 1.2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw size={20} className="text-blue-500" />
            Updates
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-gray-300">Check for Updates</label>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                Check Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 