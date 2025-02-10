'use client'

import { useState, useRef, useEffect } from 'react'
import { Terminal as TerminalIcon, Maximize2, Minimize2 } from 'lucide-react'

interface TerminalProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export default function Terminal({ isExpanded, onToggleExpand }: TerminalProps) {
  const [commands, setCommands] = useState<string[]>([
    '$ npm install',
    '> Installing dependencies...',
    '✓ Dependencies installed successfully'
  ])
  const [currentCommand, setCurrentCommand] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [commands])

  const handleCommand = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentCommand.trim()) {
      setCommands(prev => [...prev, `$ ${currentCommand}`, '> Processing...'])
      setCurrentCommand('')
    }
  }

  return (
    <div className={`bg-[#1E1E1E] border-t border-[#2D2D2D] ${isExpanded ? 'h-80' : 'h-40'}`}>
      {/* Terminal Header */}
      <div className="h-9 bg-[#2D2D2D] border-b border-[#2D2D2D] flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <TerminalIcon size={16} className="text-gray-400" />
          <span className="text-gray-300 text-sm">Terminal</span>
        </div>
        <button
          onClick={onToggleExpand}
          className="text-gray-400 hover:text-gray-300"
        >
          {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Terminal Content */}
      <div 
        ref={terminalRef}
        className="h-[calc(100%-36px)] overflow-auto p-4 font-mono text-sm"
      >
        {commands.map((cmd, i) => (
          <div 
            key={i} 
            className={`mb-1 ${
              cmd.startsWith('$') ? 'text-gray-300' : 'text-gray-500'
            }`}
          >
            {cmd}
          </div>
        ))}
        <div className="flex items-center text-gray-300">
          <span className="mr-2">$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => setCurrentCommand(e.target.value)}
            onKeyDown={handleCommand}
            className="flex-1 bg-transparent outline-none"
            placeholder="Enter a command..."
          />
        </div>
      </div>
    </div>
  )
} 