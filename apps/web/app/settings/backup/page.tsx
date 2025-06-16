'use client';

import DashboardLayout from '../../../components/dashboard-layout';

export default function BackupPage() {
  return (
    <DashboardLayout title="Backup & Security">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Backup & Security</h1>
          </div>
          <p className="text-gray-300">Manage data backups and security configurations.</p>
        </div>

        {/* Backup Status */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Backup Status</h3>
            <p className="text-gray-400 text-sm">Current backup configuration and recent activity</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Last Backup</div>
                    <div className="text-gray-400 text-sm">June 14, 2025 2:00 AM</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Backup Size</div>
                    <div className="text-gray-400 text-sm">2.4 GB</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-medium">Next Backup</div>
                    <div className="text-gray-400 text-sm">Tonight at 2:00 AM</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white font-medium">Automatic Backups</div>
                  <div className="text-gray-400 text-sm">Daily backups at 2:00 AM</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
              
              <div className="flex justify-between items-center">
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
                  Create Manual Backup
                </button>
                <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium">
                  Download Latest Backup
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Security Settings</h3>
            <p className="text-gray-400 text-sm">Configure security and access controls</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">SSL/TLS Encryption</div>
                <div className="text-gray-400 text-sm">Secure data transmission</div>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Firewall Protection</div>
                <div className="text-gray-400 text-sm">Block unauthorized access attempts</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Login Monitoring</div>
                <div className="text-gray-400 text-sm">Track and alert on suspicious login attempts</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">Data Encryption at Rest</div>
                <div className="text-gray-400 text-sm">Encrypt stored database files</div>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">Enabled</span>
            </div>
          </div>
        </div>

        {/* Recent Backup History */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Recent Backup History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Type</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Size</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white">June 14, 2025 2:00 AM</td>
                  <td className="p-4 text-gray-300">Automatic</td>
                  <td className="p-4 text-gray-300">2.4 GB</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Success</span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white">June 13, 2025 2:00 AM</td>
                  <td className="p-4 text-gray-300">Automatic</td>
                  <td className="p-4 text-gray-300">2.3 GB</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Success</span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white">June 12, 2025 2:00 AM</td>
                  <td className="p-4 text-gray-300">Automatic</td>
                  <td className="p-4 text-gray-300">2.3 GB</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Success</span>
                  </td>
                  <td className="p-4">
                    <button className="text-blue-400 hover:text-blue-300 text-sm">Download</button>
                  </td>
                </tr>
              </tbody>
            </table>
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
