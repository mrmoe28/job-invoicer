'use client'

import { Save, FileText } from 'lucide-react'

export default function ConfigPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileText className="text-blue-500" size={24} />
          TLS Configuration
        </h1>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
          <Save size={20} />
          Save Changes
        </button>
      </div>

      <div className="grid gap-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            Certificate Settings
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-gray-300">Certificate Path</label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="/path/to/certificate"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-gray-300">Private Key Path</label>
              <input
                type="text"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                placeholder="/path/to/private/key"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-white mb-4">
            TLS Options
          </h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="verify_peer"
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <label htmlFor="verify_peer" className="text-gray-300">
                Verify Peer Certificates
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="use_sni"
                className="w-4 h-4 bg-gray-700 border-gray-600 rounded"
              />
              <label htmlFor="use_sni" className="text-gray-300">
                Enable SNI Support
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 