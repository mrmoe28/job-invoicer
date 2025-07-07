# Vercel Deployment Guide for ConstructFlow/PulseCRM

## ✅ Deployment Fixes Applied

### 1. **Vercel Configuration Fixed**
- ✅ Updated `vercel.json` with proper pnpm and monorepo support
- ✅ Configured Next.js framework detection
- ✅ Set proper build and install commands
- ✅ Added API function configuration

### 2. **Build Process Optimized**
- ✅ Removed conflicting Netlify dependencies
- ✅ Added Vercel-specific build scripts
- ✅ Created deployment validation script
- ✅ Optimized .vercelignore for faster uploads

### 3. **Environment Variables Ready**
- ✅ Created `.env.vercel` template
- ✅ Configured automatic VERCEL_URL usage
- ✅ Set production environment defaults

## 🚀 Deployment Steps

### **Step 1: Connect to Vercel**
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to your Vercel account
vercel login

# Link your project
vercel link
```

### **Step 2: Environment Variables**
In your Vercel dashboard, add these environment variables:

**Required:**
- `NODE_ENV` = `production`
- `NEXT_TELEMETRY_DISABLED` = `1`

**Optional (for future features):**
- `DATABASE_URL` = Your database connection string
- `NEXTAUTH_SECRET` = Random string for authentication

### **Step 3: Deploy**
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🔧 Configuration Files

### **vercel.json**
- ✅ Proper pnpm support
- ✅ Monorepo build configuration
- ✅ API function settings
- ✅ Next.js optimization

### **Package.json Changes**
- ✅ Added Vercel-specific build scripts
- ✅ Removed conflicting dependencies
- ✅ Added build validation

### **.vercelignore**
- ✅ Excludes unnecessary files
- ✅ Includes required dependencies
- ✅ Optimized for faster uploads

## 🛠️ Troubleshooting

### **Common Issues & Solutions:**

1. **Build Fails**
   ```bash
   # Test build locally first
   cd apps/web
   pnpm install
   pnpm run build
   ```

2. **API Routes Not Working**
   - Verify tRPC endpoints in `/api/trpc/[trpc]/route.ts`
   - Check environment variables in Vercel dashboard

3. **Module Resolution Errors**
   - Ensure all imports use relative paths
   - Check Next.js configuration in `next.config.js`

4. **Performance Issues**
   - Vercel function timeout set to 30s
   - Optimized for US East (Virginia) region
   - Build cache enabled

## 📁 Project Structure for Deployment

```
constructflow/
├── apps/web/              # Main Next.js app (deploys to Vercel)
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/             # Utilities and API
│   └── package.json     # Dependencies
├── vercel.json          # Vercel configuration
├── .vercelignore        # Deployment exclusions
└── scripts/
    └── build-vercel.sh  # Build validation script
```

## 🎯 Expected Deployment URLs

- **Production**: `https://your-project.vercel.app`
- **API Endpoint**: `https://your-project.vercel.app/api/trpc/hello`
- **Dashboard**: `https://your-project.vercel.app/dashboard`

## ✅ Verification Checklist

After deployment, verify these work:
- [ ] Homepage loads (`/`)
- [ ] Dashboard loads (`/dashboard`)
- [ ] API responds (`/api/trpc/hello`)
- [ ] Authentication flow (`/auth`)
- [ ] All navigation links work
- [ ] Static assets load correctly

## 🔄 Auto-Deployment

Once connected to GitHub:
- ✅ Pushes to `main` branch auto-deploy to production
- ✅ Pull requests create preview deployments
- ✅ Environment variables sync automatically

The application is now ready for seamless Vercel deployment! 🚀
