#!/bin/bash

# Unset npm prefix to avoid conflicts
unset npm_config_prefix

# Source nvm and use Node 20
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 20

# Verify the version
echo "Using Node version: $(node --version)"

# Start the development server
npm run dev
