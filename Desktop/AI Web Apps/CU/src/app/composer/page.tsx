'use client'

import { Bold, Italic, Link, Image as ImageIcon, List, ListOrdered } from 'lucide-react'

export default function ComposerPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <Bold size={20} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <Italic size={20} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <Link size={20} />
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <List size={20} />
          </button>
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <ListOrdered size={20} />
          </button>
          <div className="h-6 w-px bg-gray-700" />
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <ImageIcon size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="Title"
            className="w-full bg-transparent text-3xl font-bold text-white mb-4 focus:outline-none"
          />
          <textarea
            placeholder="Start writing..."
            className="w-full h-[calc(100vh-300px)] bg-transparent text-gray-300 resize-none focus:outline-none"
          />
        </div>
      </div>

      <div className="border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex justify-end space-x-4">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
            Save Draft
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
            Publish
          </button>
        </div>
      </div>
    </div>
  )
} 