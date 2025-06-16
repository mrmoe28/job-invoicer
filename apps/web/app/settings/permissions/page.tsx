'use client';

import DashboardLayout from '../../../components/dashboard-layout';

export default function PermissionsPage() {
  return (
    <DashboardLayout title="Permissions">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">Permissions</h1>
          </div>
          <p className="text-gray-300">Manage role-based access controls and permissions.</p>
        </div>

        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Administrator</h3>
                <p className="text-gray-400 text-sm">Full system access</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-green-400 text-sm">✓ All permissions</div>
              <div className="text-green-400 text-sm">✓ User management</div>
              <div className="text-green-400 text-sm">✓ System settings</div>
              <div className="text-gray-400 text-xs">2 users assigned</div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Manager</h3>
                <p className="text-gray-400 text-sm">Project oversight</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-green-400 text-sm">✓ Job management</div>
              <div className="text-green-400 text-sm">✓ Task assignment</div>
              <div className="text-green-400 text-sm">✓ Team management</div>
              <div className="text-gray-400 text-xs">4 users assigned</div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Crew Member</h3>
                <p className="text-gray-400 text-sm">Field operations</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-green-400 text-sm">✓ Task updates</div>
              <div className="text-green-400 text-sm">✓ Schedule viewing</div>
              <div className="text-red-400 text-sm">✗ Job creation</div>
              <div className="text-gray-400 text-xs">18 users assigned</div>
            </div>
          </div>
        </div>

        {/* Detailed Permissions Matrix */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Permission Matrix</h3>
            <p className="text-gray-400 text-sm">Detailed view of role permissions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">Permission</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Administrator</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Manager</th>
                  <th className="text-center p-4 text-gray-300 font-medium">Crew Member</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">View Dashboard</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">Manage Jobs</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">Create Tasks</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">Update Task Status</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">Manage Contacts</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-yellow-400">View Only</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">Upload Documents</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">System Settings</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                </tr>
                <tr className="border-t border-gray-700">
                  <td className="p-4 text-white font-medium">User Management</td>
                  <td className="p-4 text-center">
                    <span className="text-green-400">✓</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-red-400">✗</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium">
            Reset to Defaults
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium">
            Save Changes
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
