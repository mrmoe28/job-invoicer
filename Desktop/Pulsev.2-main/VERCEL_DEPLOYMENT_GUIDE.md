# 🚀 Vercel Deployment Guide for ConstructFlow/PulseCRM

## Prerequisites

1. **Update Node.js Locally** (for development):
   ```bash
   # Install Node.js 20.x using nvm
   nvm install 20
   nvm use 20
   ```

2. **Vercel Account**: Sign up at https://vercel.com

## Step 1: Environment Setup

### Create Environment Variables in Vercel Dashboard:

```env
# Required
NODE_ENV=production
NEXTAUTH_SECRET=<generate-a-32-character-random-string>
NEXTAUTH_URL=https://your-app-name.vercel.app

# Database (Option A: File-based for testing)
# Leave database variables empty to use file-based storage

# Database (Option B: Vercel Postgres - Recommended)
# These are auto-populated when you connect Vercel Postgres
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=
POSTGRES_USER=
POSTGRES_HOST=
POSTGRES_PASSWORD=
POSTGRES_DATABASE=

# Optional: Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM="PulseCRM <noreply@your-domain.com>"
```

## Step 2: Vercel Project Settings

1. **Import from GitHub**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `constructflow` repository

2. **Configure Build Settings**:
   - Framework Preset: `Other`
   - Build Command: `pnpm turbo build --filter=@pulsecrm/web`
   - Output Directory: `apps/web/.next`
   - Install Command: `pnpm install --no-frozen-lockfile`

3. **Environment Variables**:
   - Add all variables from Step 1
   - Generate NEXTAUTH_SECRET: `openssl rand -base64 32`

4. **Node.js Version**:
   - Go to Settings → General
   - Set Node.js Version to `20.x`

## Step 3: Database Setup (Choose One)

### Option A: File-based (Quick Start)
- No setup needed
- Data stored in JSON files
- Good for testing/demo
- ⚠️ Data resets on each deployment

### Option B: Vercel Postgres (Recommended)
1. Go to your Vercel project dashboard
2. Click "Storage" tab
3. Create a new Postgres database
4. It will auto-populate database environment variables
5. Run database migrations (see below)

## Step 4: Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Setup for Vercel deployment"
   git push origin main
   ```

2. **Vercel Auto-Deploy**:
   - Vercel automatically deploys on push
   - Check deployment logs in Vercel dashboard

## Step 5: Post-Deployment

### If using Vercel Postgres:

1. **Run Migrations** (one-time setup):
   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Link to your project
   vercel link

   # Pull environment variables
   vercel env pull .env.local

   # Run migrations
   cd apps/web
   pnpm db:push
   ```

2. **Seed Initial Data** (optional):
   ```bash
   pnpm db:seed
   ```

## Troubleshooting

### Build Errors

1. **"Cannot install with frozen-lockfile"**:
   - We use `--no-frozen-lockfile` in install command
   - This allows pnpm to update lockfile if needed

2. **"Module not found"**:
   - Check all imports use correct paths
   - Ensure dependencies are in package.json

3. **Database Connection**:
   - Verify all Postgres env vars are set
   - Check Vercel Postgres is provisioned

### Common Issues

1. **Authentication Not Working**:
   - Verify NEXTAUTH_URL matches your deployment URL
   - Ensure NEXTAUTH_SECRET is set

2. **Emails Not Sending**:
   - Configure email service credentials
   - For Gmail, use App Password, not regular password

3. **404 Errors**:
   - Check middleware.ts configuration
   - Verify routes are properly exported

## Production Checklist

- [ ] Node.js version set to 20.x in Vercel
- [ ] All environment variables configured
- [ ] Database connected (file-based or Postgres)
- [ ] NEXTAUTH_SECRET generated and set
- [ ] NEXTAUTH_URL matches deployment URL
- [ ] Email service configured (optional)
- [ ] Custom domain configured (optional)

## Monitoring

1. **Vercel Analytics**: Enable in project settings
2. **Function Logs**: View in Vercel dashboard
3. **Error Tracking**: Consider adding Sentry

## Updates and Maintenance

1. **Deploy Updates**:
   ```bash
   git push origin main
   ```

2. **Environment Changes**:
   - Update in Vercel dashboard
   - Redeploy to apply changes

3. **Database Migrations**:
   - Run `pnpm db:push` after schema changes
   - Always backup data before migrations

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Issues**: Check deployment logs in Vercel dashboard

---

Your app is now ready for production deployment on Vercel! 🎉
