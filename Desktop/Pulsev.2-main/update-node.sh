#!/bin/bash

echo "🚀 Updating Node.js to version 22.x"
echo "=================================="

# Unset npm prefix to avoid conflicts
unset npm_config_prefix

# Source NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Check current version
echo "Current Node.js version:"
node --version

# Install Node.js 22
echo ""
echo "Installing Node.js 22..."
nvm install 22

# Use Node.js 22
echo ""
echo "Switching to Node.js 22..."
nvm use 22

# Set as default
echo ""
echo "Setting Node.js 22 as default..."
nvm alias default 22

# Verify installation
echo ""
echo "✅ Node.js updated to:"
node --version
echo "✅ NPM version:"
npm --version

echo ""
echo "🎉 Update complete! Node.js 22.x is now installed and set as default."
echo ""
echo "To use Node.js 22 in your current terminal, run:"
echo "source ~/.nvm/nvm.sh && nvm use 22"
