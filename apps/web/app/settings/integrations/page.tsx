'use client';

import DashboardLayout from '../../../components/dashboard-layout';

export default function IntegrationsPage() {
  return (
    <DashboardLayout title="API & Integrations">
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h1 className="text-2xl font-bold text-white">API & Integrations</h1>
          </div>
          <p className="text-gray-300">Manage your API keys and third-party integrations.</p>
        </div>

        {/* API Keys */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">API Keys</h3>
            <p className="text-gray-400 text-sm">Generate and manage API keys for external access</p>
          </div>
          <div className="p-6">
            <div className="bg-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white font-medium">Production API Key</div>
                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">Active</span>
              </div>
              <div className="text-gray-300 font-mono text-sm bg-gray-600 p-2 rounded">
                pk_live_abc123...xyz789
              </div>
              <div className="text-gray-400 text-xs mt-2">Created on Dec 1, 2024 • Last used 2 hours ago</div>
            </div>
            
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
              Generate New Key
            </button>
          </div>
        </div>

        {/* Available Integrations */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Available Integrations</h3>
            <p className="text-gray-400 text-sm">Connect PulseCRM with your favorite tools</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 17.93A8.001 8.001 0 0 1 4 12c0-.424.033-.84.097-1.244L7 13.659v1.341c0 1.1.9 2 2 2v3.93zm6.806-2.14A1.99 1.99 0 0 0 16 16h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41A8.008 8.008 0 0 1 20 12a8.06 8.06 0 0 1-2.194 5.79z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">Slack</div>
                  <div className="text-gray-400 text-sm">Send notifications to Slack channels</div>
                </div>
              </div>
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">
                Connect
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.533 7.85c-.18-.403-.412-.787-.692-1.148C21.455 5.1 19.631 4.5 17.5 4.5c-1.261 0-2.438.347-3.402.948a7.35 7.35 0 0 0-1.598 1.502c-.597-.45-1.298-.8-2.052-1.022C9.295 5.55 8.074 5.5 6.5 5.5 4.369 5.5 2.545 6.1 1.159 7.702.879 8.063.647 8.447.467 8.85.107 9.653 0 10.622 0 11.5c0 .878.107 1.847.467 2.65.18.403.412.787.692 1.148C2.545 16.9 4.369 17.5 6.5 17.5c1.574 0 2.795-.05 3.948-.428.754-.222 1.455-.572 2.052-1.022.573.442 1.223.787 1.915.992 1.081.318 2.258.458 3.585.458 2.131 0 3.955-.6 5.341-2.202.28-.361.512-.745.692-1.148.36-.803.467-1.772.467-2.65 0-.878-.107-1.847-.467-2.65zM6.5 15.5c-1.574 0-2.795.05-3.948.428-.754.222-1.455.572-2.052 1.022C1.073 16.5.5 15.878.5 15s.573-1.5 1-1.95c.597-.45 1.298-.8 2.052-1.022C4.705 11.55 5.926 11.5 7.5 11.5c1.574 0 2.795.05 3.948.428.754.222 1.455.572 2.052 1.022.427.45 1 1.072 1 1.95s-.573 1.5-1 1.95c-.597.45-1.298.8-2.052 1.022C10.295 18.45 9.074 18.5 7.5 18.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">QuickBooks</div>
                  <div className="text-gray-400 text-sm">Sync invoices and financial data</div>
                </div>
              </div>
              <span className="bg-green-600 text-white px-3 py-1 rounded text-sm">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.04 9.333c-.04-2.293-.204-3.86-.433-5.226-.237-1.413-.585-2.679-1.13-3.905C20.365-.95 19.055-1.952 17.41-2.422c-1.643-.47-3.488-.56-5.41-.56s-3.767.09-5.41.56C4.945-1.952 3.635-.95 2.523.202 1.978 1.428 1.63 2.694 1.393 4.107c-.229 1.366-.393 2.933-.433 5.226C.92 11.626.88 12.293.88 15s.04 3.374.08 5.667c.04 2.293.204 3.86.433 5.226.237 1.413.585 2.679 1.13 3.905 1.112 1.152 2.422 2.154 4.067 2.624 1.643.47 3.488.56 5.41.56s3.767-.09 5.41-.56c1.645-.47 2.955-1.472 4.067-2.624.545-1.226.893-2.492 1.13-3.905.229-1.366.393-2.933.433-5.226.04-2.293.08-2.96.08-5.667s-.04-3.374-.08-5.667zM12 18.333c-3.682 0-6.667-2.985-6.667-6.667S8.318 5 12 5s6.667 2.985 6.667 6.666-2.985 6.667-6.667 6.667zm6.93-12.03c-.86 0-1.56-.7-1.56-1.56s.7-1.56 1.56-1.56 1.56.7 1.56 1.56-.7 1.56-1.56 1.56z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-white font-medium">Google Calendar</div>
                  <div className="text-gray-400 text-sm">Sync scheduling and appointments</div>
                </div>
              </div>
              <button className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
