#!/bin/bash

# Navigate to the web app directory
cd /Users/edwardharrison/Desktop/constructflow-main/apps/web

# Kill any existing processes on port 3010
lsof -ti:3010 | xargs kill -9 2>/dev/null || true

# Clear Next.js cache
rm -rf .next

# Set environment variables
export NODE_ENV=development
export NODE_OPTIONS='--max-old-space-size=8192'
export NEXT_TELEMETRY_DISABLED=1

# Start Next.js directly with npx, bypassing version check
npx --yes next@14.2.18 dev --port 3010
