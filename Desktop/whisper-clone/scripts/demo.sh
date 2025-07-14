#!/bin/bash

# Whisper Clone Demo Script
# This script demonstrates the working system by starting both backend and opening a web browser

set -e

echo "🎙️ Whisper Clone - Real-time Speech-to-Text for Claude Code"
echo "============================================================"
echo ""

# Check prerequisites
if [ ! -f "whisper.cpp/build/bin/whisper-cli" ]; then
    echo "❌ whisper.cpp not found. Please run: ./scripts/install-whisper.sh"
    exit 1
fi

if [ ! -f "whisper.cpp/models/ggml-base.bin" ]; then
    echo "❌ Whisper model not found"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Start the Python backend server
echo "🚀 Starting Whisper Clone Backend Server..."
cd backend

# Start server in background
python3 app.py --host 127.0.0.1 --port 5000 &
BACKEND_PID=$!

echo "📡 Backend server started (PID: $BACKEND_PID)"
echo "🌐 Server URL: http://127.0.0.1:5000"

# Wait for server to start
sleep 3

# Check if server is running
if curl -s http://127.0.0.1:5000/health > /dev/null; then
    echo "✅ Backend server is healthy"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

cd ..

echo ""
echo "🎙️ Whisper Clone is now running!"
echo ""
echo "📋 How to test:"
echo "   1. Open: http://127.0.0.1:5000/health (API health check)"
echo "   2. The backend supports real-time microphone transcription"
echo "   3. Transcriptions can be sent to Claude Code terminal"
echo ""
echo "🛠️  Available API endpoints:"
echo "   • GET  /health                 - Health check"
echo "   • POST /start-recording        - Start microphone recording"
echo "   • POST /stop-recording         - Stop recording"
echo "   • POST /transcribe-file        - Transcribe uploaded audio"
echo ""
echo "🔗 WebSocket connection: ws://127.0.0.1:5000/socket.io/"
echo ""
echo "💡 To integrate with Claude Code:"
echo "   • Transcriptions are automatically written to ~/.claude-code-input.txt"
echo "   • On macOS, text is sent directly to Terminal via AppleScript"
echo "   • You can extend this to integrate with Claude Code's API"
echo ""
echo "Press Ctrl+C to stop the server..."

# Handle cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down Whisper Clone..."
    kill $BACKEND_PID 2>/dev/null || true
    echo "👋 Goodbye!"
}

trap cleanup EXIT INT TERM

# Keep script running
wait $BACKEND_PID
