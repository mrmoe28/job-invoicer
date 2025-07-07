'use client';

import React, { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';
import { X, Download, RotateCcw, Check, Type, Upload, Palette, Camera } from 'lucide-react';

interface SignaturePickerProps {
  onSave: (signature: string) => void;
  onClose: () => void;
  documentName?: string;
}

// Color palette options
const COLOR_OPTIONS = [
  { name: 'Black', value: '#000000' },
  { name: 'Blue', value: '#0000FF' },
  { name: 'Green', value: '#008000' },
  { name: 'Red', value: '#FF0000' },
];

// Font options for typed signatures
const FONT_OPTIONS = [
  { name: 'Script', value: 'Great Vibes, cursive' },
  { name: 'Handwritten', value: 'Pacifico, cursive' },
  { name: 'Formal', value: 'Roboto Slab, serif' },
  { name: 'Professional', value: 'Libre Baskerville, serif' },
  { name: 'Elegant', value: 'Playfair Display, serif' },
];

export default function SignaturePicker({ onSave, onClose, documentName }: SignaturePickerProps) {
  // Mode state: 'draw', 'type', or 'upload'
  const [mode, setMode] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Canvas drawing state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  // Typed signature state
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].value);
  
  // Final signature state
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Pacifico&family=Roboto+Slab:wght@400;700&family=Libre+Baskerville&family=Playfair+Display&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [strokeColor, strokeWidth]);

  // Canvas drawing functions
  const startDrawing = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDrawing(true);
    setIsEmpty(false);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.nativeEvent.offsetX;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.nativeEvent.offsetY;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    setSignatureImage(null);
  };

  // Generate typed signature
  const generateTypedSignature = () => {
    if (!typedName.trim()) {
      alert('Please enter your name');
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 150;

    // Clear canvas
    ctx.fillStyle = 'transparent';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set font and draw signature
    ctx.fillStyle = strokeColor;
    ctx.font = `48px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

    // Convert to base64
    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
    setIsEmpty(false);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
      alert('Please upload a PNG or JPG image');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureImage(event.target?.result as string);
      setIsEmpty(false);
    };
    reader.readAsDataURL(file);
  };

  // Capture drawing as signature image
  const captureCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;

    const dataUrl = canvas.toDataURL('image/png');
    setSignatureImage(dataUrl);
  };

  // Save signature
  const saveSignature = () => {
    if (mode === 'draw' && !signatureImage) {
      captureCanvasSignature();
      setTimeout(() => {
        if (signatureImage) onSave(signatureImage);
      }, 100);
      return;
    }
    
    if (!signatureImage || isEmpty) return;
    onSave(signatureImage);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Add Your Signature</h3>
            {documentName && (
              <p className="text-sm text-gray-400 mt-1">Signing: {documentName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Signature Mode Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setMode('draw')}
            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${
              mode === 'draw'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="h-4 w-4" />
            Draw
          </button>
          <button
            onClick={() => setMode('type')}
            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${
              mode === 'type'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Type className="h-4 w-4" />
            Type
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex-1 p-3 flex items-center justify-center gap-2 transition-colors ${
              mode === 'upload'
                ? 'text-orange-500 border-b-2 border-orange-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="h-4 w-4" />
            Upload
          </button>
        </div>

        <div className="p-6">
          {/* Draw Mode */}
          {mode === 'draw' && (
            <div className="space-y-4">
              {/* Canvas */}
              <div className="bg-white rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  className="w-full h-48 cursor-crosshair touch-none"
                  style={{ backgroundColor: 'white' }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
              </div>
              
              {/* Drawing Tools */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 text-sm">Color:</div>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setStrokeColor(color.value)}
                        className={`w-6 h-6 rounded-full ${strokeColor === color.value ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-gray-400 text-sm">Width:</div>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-24"
                  />
                </div>
              </div>
              
              <p className="text-sm text-gray-400 text-center">
                Draw your signature above using your mouse or finger
              </p>
            </div>
          )}

          {/* Type Mode */}
          {mode === 'type' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Style
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    {FONT_OPTIONS.map(font => (
                      <option key={font.value} value={font.value}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Signature Color
                  </label>
                  <div className="flex gap-2 py-2">
                    {COLOR_OPTIONS.map(color => (
                      <button
                        key={color.value}
                        onClick={() => setStrokeColor(color.value)}
                        className={`w-6 h-6 rounded-full ${strokeColor === color.value ? 'ring-2 ring-white' : ''}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <button
                onClick={generateTypedSignature}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <Type className="w-4 h-4" />
                Generate Signature
              </button>
            </div>
          )}

          {/* Upload Mode */}
          {mode === 'upload' && (
            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-medium text-gray-300 mb-2">
                  Upload Signature Image
                </span>
                <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-orange-500 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-500" />
                  <p className="text-sm text-gray-400 mb-2">Click to browse or drag and drop</p>
                  <p className="text-xs text-gray-500">Supported formats: PNG, JPG</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="signature-upload"
                  />
                </div>
              </label>
            </div>
          )}

          {/* Signature Preview */}
          {signatureImage && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Signature Preview</h4>
              <div className="bg-white rounded-lg p-4">
                <img
                  src={signatureImage}
                  alt="Signature preview"
                  className="max-w-full h-auto mx-auto"
                  style={{ maxHeight: '100px' }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={clearSignature}
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={saveSignature}
              disabled={isEmpty && !signatureImage}
              className={`flex-1 px-4 py-2 rounded transition-colors flex items-center justify-center gap-2 ${
                isEmpty && !signatureImage
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              }`}
            >
              <Check className="h-4 w-4" />
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}