# 🚀 Vercel Deployment Guide

Deploy ConstructFlow/PulseCRM to Vercel with full monorepo support.

## ⚡ Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project root
cd /Volumes/ORICO/Development/constructflow
cp deployment/vercel/vercel.json apps/web/
cd apps/web
vercel
```

## 🔧 Configuration Setup

### 1. Environment Variables
Set these in Vercel dashboard:

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars
NEXTAUTH_URL=https://your-app.vercel.app

# Optional
REDIS_URL=redis://host:6379
SENTRY_DSN=https://your-sentry-dsn
ANALYZE=false
```

### 2. Build Configuration
The `vercel.json` configures:
- Monorepo build commands
- API function timeouts
- CORS headers
- Environment variable mapping

### 3. Database Setup
Choose your database option:

#### Option A: Vercel Postgres (Recommended)
```bash
# Add Vercel Postgres integration
vercel integration add postgres
```

#### Option B: External Database
Use Neon, PlanetScale, or Supabase:
```bash
# Set DATABASE_URL in Vercel dashboard
DATABASE_URL=postgresql://user:pass@external-host/db
```

## 📦 Deployment Process

### Automatic Deployment
1. Push to `main` branch
2. Vercel builds automatically
3. Database migrations run
4. Health checks verify deployment

### Manual Deployment
```bash
# Production deployment
vercel --prod

# Preview deployment
vercel

# Check deployment status
vercel ls
```

## 🏗️ Build Optimization

### Monorepo Support
The build process:
1. Installs all workspace dependencies
2. Builds shared packages first
3. Builds web app with transpiled packages
4. Optimizes bundle for production

### Bundle Analysis
```bash
# Analyze bundle size
ANALYZE=true vercel build

# View bundle analyzer
npm run analyze
```

## 🔍 Monitoring & Debugging

### Logs
```bash
# View deployment logs
vercel logs

# View function logs
vercel logs --follow
```

### Performance
- Automatic Web Vitals tracking
- Edge function optimization
- Image optimization included
- Static asset caching

## 🚀 Custom Domain

```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME: www → cname.vercel-dns.com
# Add A: @ → 76.76.19.61
```

## 🛠️ Advanced Configuration

### Edge Functions
For global performance:
```javascript
// apps/web/middleware.ts
export const config = {
  matcher: '/api/:path*',
  runtime: 'edge'
}
```

### ISR (Incremental Static Regeneration)
```javascript
// pages/dashboard.tsx
export async function getStaticProps() {
  return {
    props: { data },
    revalidate: 60 // Revalidate every minute
  }
}
```

## 📊 Database Migrations

### Automatic Migrations
Set up in `package.json`:
```json
{
  "scripts": {
    "vercel-build": "pnpm build && pnpm db:migrate"
  }
}
```

### Manual Migrations
```bash
# Run migrations after deployment
vercel env pull .env.local
pnpm db:migrate
```

## 🔒 Security

### Environment Variables
- Never commit `.env` files
- Use Vercel dashboard for secrets
- Enable branch protection

### CORS Configuration
Configured in `vercel.json`:
- API routes properly secured
- Frontend origins whitelisted
- Headers configured for security

## 🆘 Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Check build logs
vercel inspect [deployment-url]

# Local build test
vercel build
```

**Database Connection:**
```bash
# Test database connection
vercel env pull .env.local
pnpm db:studio
```

**Function Timeouts:**
- Increase timeout in `vercel.json`
- Optimize database queries
- Consider background jobs

### Debug Mode
```bash
# Deploy with debug info
vercel --debug

# Enable function logs
vercel logs --follow
```

## 💰 Pricing Considerations

### Free Tier Limits
- 100GB bandwidth
- 6,000 function invocations
- 100MB function size

### Pro Features
- Custom domains
- Team collaboration
- Advanced analytics
- Priority support

## 🔄 CI/CD Integration

### GitHub Integration
1. Connect repository in Vercel dashboard
2. Configure branch settings
3. Set up preview deployments
4. Enable automatic deployments

### Preview Deployments
- Every PR gets preview URL
- Test changes before merge
- Share with stakeholders
- Visual regression testing

---

**Your app will be live at: `https://your-app.vercel.app` 🚀**