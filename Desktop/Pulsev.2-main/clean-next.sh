#!/bin/bash

# Clean Script for Next.js Build
# This script helps clean up Next.js build artifacts to prevent chunk errors

# Set colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Next.js build cleanup...${NC}"

# 1. Navigate to the project directory
cd "$(dirname "$0")" || { echo -e "${RED}Failed to navigate to script directory${NC}"; exit 1; }
cd apps/web || { echo -e "${RED}Failed to navigate to web app directory${NC}"; exit 1; }

# 2. Check if .next directory exists
if [ -d ".next" ]; then
  echo -e "${YELLOW}Removing old .next build folder...${NC}"
  rm -rf .next
  echo -e "${GREEN}Successfully removed .next folder${NC}"
else
  echo -e "${YELLOW}No .next folder found, skipping cleanup${NC}"
fi

# 3. Clear node_modules/.cache to ensure clean build
if [ -d "node_modules/.cache" ]; then
  echo -e "${YELLOW}Cleaning Next.js cache...${NC}"
  rm -rf node_modules/.cache
  echo -e "${GREEN}Successfully cleaned cache${NC}"
fi

# 4. Optional: Remove package-lock.json to resolve dependencies
# Uncomment if needed
# if [ -f "package-lock.json" ]; then
#   echo -e "${YELLOW}Removing package-lock.json...${NC}"
#   rm package-lock.json
#   echo -e "${GREEN}Successfully removed package-lock.json${NC}"
# fi

echo -e "${GREEN}Cleanup complete! Now you can run npm run build for a fresh build.${NC}"
echo -e "${YELLOW}Run this command: npm run build${NC}"

exit 0
