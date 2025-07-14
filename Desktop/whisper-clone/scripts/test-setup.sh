#!/bin/bash

# Test script for Whisper Clone
set -e

echo "🎙️ Testing Whisper Clone Setup..."

# Check if whisper.cpp exists and is built
if [ ! -f "whisper.cpp/build/bin/whisper-cli" ]; then
    echo "❌ whisper.cpp not built. Please run: ./scripts/install-whisper.sh"
    exit 1
fi

# Check if model exists
if [ ! -f "whisper.cpp/models/ggml-base.bin" ]; then
    echo "❌ Whisper model not found. Downloading..."
    cd whisper.cpp
    bash ./models/download-ggml-model.sh base
    cd ..
fi

# Test whisper.cpp with a sample
echo "🧪 Testing whisper.cpp with sample audio..."
cd whisper.cpp
if [ -f "samples/jfk.wav" ]; then
    ./build/bin/whisper-cli -m models/ggml-base.bin -f samples/jfk.wav --output-txt
    echo "✅ whisper.cpp test successful"
else
    echo "⚠️ No sample audio found, skipping whisper test"
fi
cd ..

# Test Python backend
echo "🧪 Testing Python backend..."
cd backend
python3 -c "
import sys
try:
    from app import WhisperCloneServer
    print('✅ Backend imports successful')
    
    # Test server initialization
    server = WhisperCloneServer()
    print('✅ Backend server initialization successful')
    print(f'📂 Whisper executable: {server.whisper_path}')
    print(f'🤖 Model path: {server.model_path}')
    
except Exception as e:
    print(f'❌ Backend test failed: {e}')
    sys.exit(1)
"
cd ..

# Test frontend dependencies
echo "🧪 Testing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not installed. Run: npm install"
    exit 1
fi

echo "✅ All tests passed!"
echo ""
echo "🚀 Ready to run Whisper Clone:"
echo "   npm start"
echo ""
echo "📋 Manual testing steps:"
echo "   1. Run: npm start"
echo "   2. Click the microphone button"
echo "   3. Speak into your microphone"
echo "   4. Watch the transcript appear"
echo "   5. Click 'Send to Claude Code' to test integration"
