'use client';

import DashboardLayout from '../../../components/dashboard-layout';

export default function UsersPage() {
  return (
    <DashboardLayout title="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <div>
                <h1 className="text-2xl font-bold text-white">User Management</h1>
                <p className="text-gray-300">Manage users, roles, and access permissions.</p>
              </div>
            </div>
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add User
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Active Users</h3>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-64 pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <svg className="w-4 h-4 absolute left-3 top-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <select className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                  <option>All Roles</option>
                  <option>Administrator</option>
                  <option>Manager</option>
                  <option>Crew Member</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="text-left p-4 text-gray-300 font-medium">
                    <input type="checkbox" className="rounded bg-gray-600 border-gray-500" />
                  </th>
                  <th className="text-left p-4 text-gray-300 font-medium">User</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Email</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Role</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Last Login</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">
                    <input type="checkbox" className="rounded bg-gray-600 border-gray-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">A</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">Admin User</div>
                        <div className="text-gray-400 text-sm">System Administrator</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">admin@pulsecrm.com</td>
                  <td className="p-4">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm">Administrator</span>
                  </td>
                  <td className="p-4 text-gray-300">2 hours ago</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Active</span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                
                <tr className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">
                    <input type="checkbox" className="rounded bg-gray-600 border-gray-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">J</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">John Manager</div>
                        <div className="text-gray-400 text-sm">Project Manager</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">john.manager@pulsecrm.com</td>
                  <td className="p-4">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">Manager</span>
                  </td>
                  <td className="p-4 text-gray-300">Yesterday</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Active</span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>

                <tr className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-4">
                    <input type="checkbox" className="rounded bg-gray-600 border-gray-500" />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">M</span>
                      </div>
                      <div>
                        <div className="text-white font-medium">Mike Worker</div>
                        <div className="text-gray-400 text-sm">Crew Member</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">mike.worker@pulsecrm.com</td>
                  <td className="p-4">
                    <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">Crew Member</span>
                  </td>
                  <td className="p-4 text-gray-300">3 days ago</td>
                  <td className="p-4">
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm">Inactive</span>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="text-yellow-400 hover:text-yellow-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Total Users</div>
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-green-400 text-sm">+3 this month</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Active Users</div>
            <div className="text-2xl font-bold text-white">21</div>
            <div className="text-green-400 text-sm">87.5% online</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Administrators</div>
            <div className="text-2xl font-bold text-white">2</div>
            <div className="text-gray-400 text-sm">Super users</div>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="text-gray-400 text-sm">Crew Members</div>
            <div className="text-2xl font-bold text-white">18</div>
            <div className="text-blue-400 text-sm">Field workers</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
