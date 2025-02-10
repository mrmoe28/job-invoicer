'use client'

import { useState } from 'react'
import { Terminal, Settings, ChevronRight, X } from 'lucide-react'
import CodeEditor from '@/components/editor/CodeEditor'
import FileTree from '@/components/editor/FileTree'
import FileUploader from '@/components/editor/FileUploader'
import TerminalComponent from '@/components/terminal/Terminal'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [isTerminalExpanded, setIsTerminalExpanded] = useState(false)
  const [files, setFiles] = useState([
    {
      name: 'next.config.js',
      content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig`
    }
  ])

  const fileTree = [
    {
      name: '.next',
      type: 'directory' as const,
      children: []
    },
    {
      name: 'node_modules',
      type: 'directory' as const,
      children: []
    },
    {
      name: 'src',
      type: 'directory' as const,
      children: [
        {
          name: 'app',
          type: 'directory' as const,
          children: [
            {
              name: 'page.tsx',
              type: 'file' as const,
            }
          ]
        }
      ]
    },
    {
      name: 'next.config.js',
      type: 'file' as const,
    },
    {
      name: 'package.json',
      type: 'file' as const,
    },
    {
      name: 'tsconfig.json',
      type: 'file' as const,
    }
  ]

  const handleFileUpload = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFiles(prev => [...prev, { name: file.name, content }])
      }
      reader.readAsText(file)
    })
  }

  const handleFolderUpload = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      // Handle folder structure
      const path = file.webkitRelativePath || file.name
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setFiles(prev => [...prev, { name: path, content }])
      }
      reader.readAsText(file)
    })
  }

  return (
    <div className="flex flex-col h-full bg-[#1E1E1E]">
      <div className="flex flex-1 min-h-0">
        {/* Left Sidebar */}
        <div className="w-12 bg-[#333333] border-r border-[#2D2D2D] flex flex-col items-center py-2">
          <FileUploader
            onUpload={handleFileUpload}
            onFolderUpload={handleFolderUpload}
          />
        </div>

        {/* File Explorer */}
        <div className="w-64 border-r border-[#2D2D2D] bg-[#252526] flex flex-col">
          <div className="h-9 border-b border-[#2D2D2D] bg-[#333333] flex items-center px-4">
            <span className="text-gray-300 text-xs uppercase font-semibold">Explorer</span>
          </div>
          <FileTree files={fileTree} onSelect={setSelectedFile} />
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="h-9 bg-[#333333] border-b border-[#2D2D2D] flex items-center">
            <div className="flex h-full">
              <div className="px-4 h-full flex items-center border-r border-[#2D2D2D] bg-[#2D2D2D] text-gray-300 text-sm">
                <span>next.config.js</span>
                <button className="ml-2 hover:bg-gray-700 rounded">
                  <X size={14} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Editor */}
          <div className="flex-1 overflow-hidden bg-[#1E1E1E]">
            <CodeEditor content={files[0].content} />
          </div>
        </div>

        {/* Right Chat Panel */}
        <div className="w-[400px] bg-[#1E1E1E] flex flex-col border-l border-[#2D2D2D]">
          <div className="h-9 border-b border-[#2D2D2D] flex items-center px-4">
            <span className="text-gray-300 text-sm">Chat</span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="text-gray-400 text-center mt-8">
              <Terminal className="w-12 h-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2">AI Code Assistant</h3>
              <p className="text-sm">
                Ask questions about your code or request changes.
                <br />
                The AI will help you understand and modify your code.
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-[#2D2D2D]">
            <div className="bg-[#2D2D2D] rounded-lg p-3 flex items-center">
              <input
                type="text"
                placeholder="Ask about your code..."
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-300 text-sm"
              />
              <button className="ml-2 text-gray-400 hover:text-gray-300">
                <Settings size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <TerminalComponent
        isExpanded={isTerminalExpanded}
        onToggleExpand={() => setIsTerminalExpanded(!isTerminalExpanded)}
      />
    </div>
  )
} 