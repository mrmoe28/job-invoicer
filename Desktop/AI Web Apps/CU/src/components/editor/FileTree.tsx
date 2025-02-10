'use client'

import { ChevronRight, ChevronDown, FileText, Folder } from 'lucide-react'
import { useState } from 'react'

interface FileNode {
  name: string
  type: 'file' | 'directory'
  children?: FileNode[]
}

interface FileTreeProps {
  files: FileNode[]
  onSelect?: (path: string) => void
}

export default function FileTree({ files, onSelect }: FileTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggleDir = (path: string) => {
    const newExpanded = new Set(expanded)
    if (expanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpanded(newExpanded)
  }

  const renderNode = (node: FileNode, path: string = '') => {
    const fullPath = `${path}/${node.name}`
    const isExpanded = expanded.has(fullPath)

    return (
      <div key={fullPath} className="select-none">
        <div
          className="flex items-center px-2 py-1 hover:bg-[#37373D] cursor-pointer text-gray-300"
          onClick={() => node.type === 'directory' ? toggleDir(fullPath) : onSelect?.(fullPath)}
        >
          {node.type === 'directory' && (
            <span className="mr-1">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          {node.type === 'directory' ? (
            <Folder size={16} className="mr-2 text-[#8A8A8A]" />
          ) : (
            <FileText size={16} className="mr-2 text-gray-400" />
          )}
          <span>{node.name}</span>
        </div>
        {node.type === 'directory' && isExpanded && (
          <div className="ml-4">
            {node.children?.map((child) => renderNode(child, fullPath))}
          </div>
        )}
      </div>
    )
  }

  return <div className="p-2">{files.map((f) => renderNode(f))}</div>
} 