'use client'

import { useRef } from 'react'

interface FileUploaderProps {
  onUpload: (files: FileList) => void
  onFolderUpload: (files: FileList) => void
}

export default function FileUploader({ onUpload, onFolderUpload }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative group">
      <button className="p-2 text-gray-400 hover:text-gray-300">
        <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path d="M14.5 2h-13l-.5.5v11l.5.5h13l.5-.5v-11l-.5-.5zM14 13H2V3h12v10z"/>
          <path d="M3 4h2v2H3V4z"/>
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      <div className="hidden group-hover:block absolute left-full ml-1 top-0 bg-gray-800 rounded-md shadow-lg border border-gray-700 py-1 min-w-[160px]">
        <button
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload File
        </button>
        <button
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
          onClick={() => folderInputRef.current?.click()}
        >
          Upload Folder
        </button>
      </div>

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
      <input
        type="file"
        ref={folderInputRef}
        className="hidden"
        webkitdirectory=""
        directory=""
        multiple
        onChange={(e) => e.target.files && onFolderUpload(e.target.files)}
      />
    </div>
  )
} 