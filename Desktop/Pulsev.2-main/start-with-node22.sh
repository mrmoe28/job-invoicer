#!/bin/bash

echo "🔧 Setting up Node.js 22 for ConstructFlow"
echo "=========================================="

# Clean up npm config
echo "Cleaning up npm configuration..."
rm -f ~/.npmrc
unset npm_config_prefix

# Source NVM with clean environment
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 22
echo "Switching to Node.js 22..."
nvm use --delete-prefix v22.17.0

# Verify
echo ""
echo "✅ Current versions:"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"

# Clean install dependencies
echo ""
echo "📦 Installing project dependencies..."
cd /Users/edwardharrison/Desktop/constructflow-main/apps/web
rm -rf node_modules package-lock.json
npm install

echo ""
echo "🚀 Starting development server..."
npm run dev
