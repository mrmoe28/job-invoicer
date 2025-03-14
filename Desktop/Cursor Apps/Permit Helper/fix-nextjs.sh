#!/bin/bash

# Navigate to the project directory
cd permithelper

# Remove Next.js cache and build files
echo "Removing Next.js cache and build files..."
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies
echo "Reinstalling dependencies..."
npm install

# Rebuild the application
echo "Rebuilding the application..."
npm run build

# Start the development server
echo "Starting the development server..."
npm run dev 