#!/bin/bash
# Quick start script for Pulse CRM with correct Node.js version

echo "🚀 Starting Pulse CRM Development Server"
echo "========================================"

# Check if we're in the right directory
if [ ! -d "apps/web" ]; then
    echo "❌ Please run this from the Pulse CRM root directory"
    exit 1
fi

# Clean up any npm config issues
unset npm_config_prefix 2>/dev/null || true

# Use Node.js 22 if available
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "📋 Current Node.js version: $NODE_VERSION"
    
    # Check if version is compatible
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -ge 20 ]; then
        echo "✅ Node.js version is compatible"
    else
        echo "⚠️  Node.js version might be too old, but trying anyway..."
    fi
fi

# Navigate to web app directory
cd apps/web

echo "📦 Installing dependencies if needed..."
npm install --silent 2>/dev/null || true

echo "🌐 Starting Next.js development server..."
echo "📍 URL: http://localhost:3000"
echo ""
echo "Demo Login Credentials:"
echo "Email: admin@pulsecrm.com"
echo "Password: admin123"
echo ""

# Start the development server directly with Next.js
NODE_ENV=development npx next dev --port 3000
