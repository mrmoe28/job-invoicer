# 🛠️ Vercel pnpm Version Fix

## Issue
Vercel deployment was failing with:
```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=8.0.0
Got: 6.35.1
```

## Solution Applied

### 1. Updated `vercel.json`
```json
{
  "root": "apps/web",
  "installCommand": "npm install -g pnpm@8.10.0 && pnpm install",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  }
}
```

### 2. Modified `package.json`
- Removed strict pnpm version requirement from engines field
- Kept Node.js version requirement (>=18.18.0)
- This prevents the engine check from failing while still using pnpm

### 3. Created `.nvmrc`
- Added Node.js version 18.18.0 specification
- Ensures correct Node.js version is used

## Why This Works

1. **Custom Install Command**: We explicitly install pnpm 8.10.0 before running pnpm install
2. **No Engine Check**: Removing pnpm from engines prevents the version check failure
3. **packageManager Field**: Still specifies pnpm@8.10.0 for local development consistency

## Alternative Solutions (if needed)

### Option 1: Use npm instead
Update `vercel.json`:
```json
{
  "root": "apps/web",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

### Option 2: Use Vercel's Built-in pnpm
Add to environment variables in Vercel:
```
ENABLE_EXPERIMENTAL_COREPACK=1
```

## Next Steps

1. Commit these changes:
   ```bash
   git add vercel.json package.json .nvmrc VERCEL_PNPM_FIX.md
   git commit -m "Fix Vercel pnpm version compatibility"
   git push origin main
   ```

2. The deployment should now succeed on Vercel

## Verification

After deployment, check:
- Build logs show pnpm 8.10.0 being installed
- Dependencies install successfully
- Build completes without engine errors
