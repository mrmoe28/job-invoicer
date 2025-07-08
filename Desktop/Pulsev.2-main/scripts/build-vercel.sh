#!/bin/bash

# Vercel Deployment Build Script for ConstructFlow/PulseCRM
# This script ensures proper build process for monorepo deployment using NPM

set -e

echo "🚀 Starting ConstructFlow build process with NPM..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --no-frozen-lockfile --legacy-peer-deps

# Build the web application
echo "🔧 Building web application..."
cd apps/web

# Ensure clean build
rm -rf .next

# Run the build
npm run build

echo "✅ Build completed successfully!"

# Verify build output
if [ -d ".next" ]; then
    echo "✅ Next.js build output found"
else
    echo "❌ Next.js build output missing"
    exit 1
fi

# Check for static files
if [ -f ".next/BUILD_ID" ]; then
    echo "✅ Build ID file found"
else
    echo "❌ Build ID file missing"
    exit 1
fi

echo "🎉 Deployment build ready!"
