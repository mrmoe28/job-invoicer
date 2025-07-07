'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowsMaximize, ArrowsMinimize, MoveVertical, Move } from 'lucide-react';

interface SignatureOverlayProps {
  id: string;
  imageUrl: string;
  initialPosition: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  containerRef: React.RefObject<HTMLDivElement>;
  onPositionChange: (id: string, x: number, y: number, width: number, height: number) => void;
  onRemove: (id: string) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export default function SignatureOverlay({
  id,
  imageUrl,
  initialPosition,
  containerRef,
  onPositionChange,
  onRemove,
  isSelected,
  onSelect,
}: SignatureOverlayProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Update position from props
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Calculate new position within container bounds
    let newX = e.clientX - dragStart.x;
    let newY = e.clientY - dragStart.y;
    
    // Constrain to container
    newX = Math.max(0, Math.min(newX, containerRect.width - position.width));
    newY = Math.max(0, Math.min(newY, containerRect.height - position.height));
    
    setPosition(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
    
    // Update parent
    onPositionChange(id, newX, newY, position.width, position.height);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle resizing
  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(id);
    setIsResizing(true);
    setResizeStart({
      width: position.width,
      height: position.height,
      x: e.clientX,
      y: e.clientY
    });
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResize = (e: MouseEvent) => {
    if (!isResizing || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    // Calculate new dimensions, maintaining aspect ratio
    const aspectRatio = resizeStart.width / resizeStart.height;
    let newWidth = Math.max(50, resizeStart.width + deltaX);
    const newHeight = newWidth / aspectRatio;
    
    // Constrain to container
    newWidth = Math.min(newWidth, containerRect.width - position.x);
    
    setPosition(prev => ({
      ...prev,
      width: newWidth,
      height: newHeight
    }));
    
    // Update parent
    onPositionChange(id, position.x, position.y, newWidth, newHeight);
  };

  return (
    <div
      ref={overlayRef}
      className={`absolute cursor-move group ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        height: position.height,
        zIndex: isSelected ? 20 : 10,
        touchAction: 'none'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onMouseDown={handleMouseDown}
    >
      <img
        src={imageUrl}
        alt="Signature"
        className="w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
      
      {isSelected && (
        <>
          {/* Controls */}
          <div className="absolute -top-8 right-0 flex gap-1 bg-gray-900/90 p-1 rounded shadow">
            <button
              className="p-1 text-white hover:text-orange-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(id);
              }}
              title="Remove signature"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-6 h-6 bg-orange-500 rounded-full cursor-se-resize flex items-center justify-center"
            onMouseDown={handleResizeStart}
          >
            <ArrowsMaximize className="w-3 h-3 text-white" />
          </div>
          
          {/* Move indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-50 transition-opacity">
            <Move className="w-6 h-6 text-orange-500" />
          </div>
        </>
      )}
    </div>
  );
}