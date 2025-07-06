# 🛠️ Vercel pnpm Version Fix - UPDATED

## Issue
Vercel deployment was failing with two different errors:

1. First error (pnpm version):
```
ERR_PNPM_UNSUPPORTED_ENGINE  Unsupported environment (bad pnpm and/or Node.js version)
Expected version: >=8.0.0
Got: 6.35.1
```

2. Second error (ERR_INVALID_THIS):
```
WARN GET https://registry.npmjs.org/@types%2Fnode error (ERR_INVALID_THIS). Will retry in 10 seconds. 2 retries left.
ERR_PNPM_META_FETCH_FAIL GET https://registry.npmjs.org/[package]: Value of "this" must be of type URLSearchParams
```

## Solution Applied

### 1. Updated `vercel.json` with Corepack
```json
{
  "root": "apps/web",
  "installCommand": "corepack enable && corepack prepare pnpm@8.10.0 --activate && pnpm install",
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs20.x"
    }
  }
}
```

### 2. Add Environment Variable in Vercel Dashboard
**IMPORTANT**: You must add this environment variable in your Vercel project settings:
- Key: `ENABLE_EXPERIMENTAL_COREPACK`
- Value: `1`

### 3. Modified `package.json`
- Removed strict pnpm version requirement from engines field
- Kept Node.js version requirement (>=18.18.0)
- This prevents the engine check from failing while still using pnpm

### 4. Created `.nvmrc`
- Added Node.js version 18.18.0 specification
- Ensures correct Node.js version is used

## Why This Works

1. **Corepack**: Uses Node.js's built-in package manager management tool
2. **ENABLE_EXPERIMENTAL_COREPACK**: Enables Corepack support in Vercel
3. **Explicit Version**: `corepack prepare pnpm@8.10.0 --activate` ensures the exact version is used
4. **No Engine Check**: Removing pnpm from engines prevents version check failures
5. **Compatibility**: This approach fixes the Node.js 20 URLSearchParams compatibility issue

## Steps to Deploy

1. **Add Environment Variable in Vercel**:
   - Go to your Vercel project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `ENABLE_EXPERIMENTAL_COREPACK = 1`

2. **Commit and Push Changes**:
   ```bash
   git add vercel.json package.json .nvmrc VERCEL_PNPM_FIX.md
   git commit -m "Fix Vercel pnpm ERR_INVALID_THIS error with corepack"
   git push origin main
   ```

3. **Vercel will automatically redeploy**

## Alternative Solutions (if the above doesn't work)

### Option 1: Use npm instead
Update `vercel.json`:
```json
{
  "root": "apps/web",
  "installCommand": "npm install",
  "buildCommand": "npm run build"
}
```

### Option 2: Downgrade Node.js version
Update `.nvmrc` to use Node 18 instead of 20:
```
18.17.0
```

### Option 3: Use Yarn
Update `vercel.json`:
```json
{
  "root": "apps/web",
  "installCommand": "yarn install",
  "buildCommand": "yarn build"
}
```

## Verification

After deployment, check:
- Build logs show corepack being enabled
- pnpm 8.10.0 is activated successfully
- Dependencies install without ERR_INVALID_THIS errors
- Build completes successfully

## References
- https://github.com/pnpm/pnpm/issues/6424
- https://jelaniharris.com/blog/fixing-errinvalidthis-error-on-vercel-using-pnpm/
- https://vercel.com/guides/corepack-errors-github-actions
