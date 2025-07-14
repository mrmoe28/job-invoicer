#!/bin/bash

# Installation script for whisper.cpp optimized for macOS
set -e

echo "🎙️ Installing Whisper Clone dependencies..."

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ This script is designed for macOS only"
    exit 1
fi

# Check for Xcode Command Line Tools
if ! xcode-select -p &> /dev/null; then
    echo "📦 Installing Xcode Command Line Tools..."
    xcode-select --install
    echo "⏳ Please complete the Xcode installation and run this script again"
    exit 1
fi

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "🍺 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install required system dependencies
echo "📦 Installing system dependencies..."
brew install git cmake pkg-config portaudio ffmpeg

# Clone and build whisper.cpp
if [ ! -d "whisper.cpp" ]; then
    echo "🔄 Cloning whisper.cpp..."
    git clone https://github.com/ggerganov/whisper.cpp.git
fi

cd whisper.cpp

echo "🔨 Building whisper.cpp..."
make clean
make -j$(sysctl -n hw.ncpu)

# Download the base model for testing
echo "📥 Downloading Whisper base model..."
if [ ! -f "models/ggml-base.bin" ]; then
    bash ./models/download-ggml-model.sh base
fi

cd ..

echo "✅ whisper.cpp installation complete!"
echo "🎯 Model location: whisper.cpp/models/"
echo "🚀 Ready to transcribe!"
