# Context Documentation for Code Error Fixes

This file contains important information and solutions for fixing various code errors in the job-invoicer project.

## Vercel Deployment Errors

### Error Solutions
<!-- Add your Vercel deployment error solutions here -->

### Vercel Deployment Methods Documentation

**Deployment Methods:**

1. **Git Integration**
   - Most common method via connected Git repository (GitHub, GitLab, Bitbucket, Azure DevOps)
   - Each commit/PR triggers automatic deployment
   - Can deploy specific commits/branches manually via Dashboard

2. **Vercel CLI**
   - Install: `npm i -g vercel`
   - Deploy to production: `vercel --prod`
   - Creates `.vercel` directory with Project/Organization IDs
   - Works with or without Git connection

3. **Deploy Hooks**
   - Requires connected Git repository
   - Unique URL per project
   - Trigger via HTTP GET/POST request
   - No new commit required

4. **Vercel REST API**
   - HTTP POST to deployment endpoint
   - Generate SHA for each file
   - Upload files to Vercel
   - Create deployment with file references

**Environments:**
- Local Development
- Preview (testing/QA)
- Production (user-facing with production domain)

### Detailed Environments Documentation

**Three Default Environments:**

1. **Local Development Environment**
   - Develop and test on local machine
   - Setup:
     ```bash
     npm install -g vercel
     vercel link
     vercel env pull  # Populates .env.local file
     ```

2. **Preview Environment (Pre-production)**
   - Deploy and test without affecting production
   - Created automatically when:
     - Push to non-production branch
     - Create PR on GitHub/GitLab/Bitbucket
     - Deploy via CLI without `--prod` flag
   - Two URL types:
     - Branch-specific: Always points to latest branch changes
     - Commit-specific: Points to exact deployment

3. **Production Environment**
   - Live, user-facing site
   - Triggered by:
     - Push/merge to production branch (usually `main`)
     - CLI: `vercel --prod`
   - Updates production domains automatically on success

**Custom Environments (Pro/Enterprise only):**
- For specialized workflows (staging, QA, etc.)
- Creation methods:
  - Dashboard: Project Settings → Environments → Create
  - cURL API request
  - Vercel SDK
- Features:
  - Branch tracking
  - Custom domains
  - Import variables from other environments

**CLI Commands for Custom Environments:**
```bash
vercel deploy --target=staging        # Deploy to custom env
vercel pull --environment=staging     # Pull env variables
vercel env add MY_KEY staging        # Add env variables
```

**Limits:**
- Pro: 1 custom environment per project
- Enterprise: 12 custom environments per project

**Dashboard Features:**
- Resources Tab: View middleware, static assets, functions
- Deployment Summary: Build time, framework, logs/errors
- Management: Redeploy, inspect logs, assign domains, promote to production

## Build Errors

### Common Build Issues
<!-- Add common build error solutions here -->

### Troubleshooting Build Errors

**Troubleshooting Views:**
- **Build logs**: Console output during deployment (found under Deployment Status)
- **Resources tab**: Functions, middleware, and assets from build
- **Source tab**: Build output after successful deployment (also accessible via `/_src`)

**Investigating Build Failures:**

1. **Access Build Logs:**
   - Dashboard → Project → Deployments tab
   - Select errored deployment (shows error status)
   - Check preview section for error summary
   - Expand "Building" accordion in Deployment Details
   - Look for red "Error" sections in logs

2. **Local Testing:**
   - Always build locally first: `npm run build` or `yarn build`
   - Catches code-specific and dependency issues

3. **Build Logs Not Available:**
   - Occurs when preconditions fail:
     - Invalid `vercel.json` configuration
     - Ignored Build Steps
     - Non-team member commits
   - Error shown as overlay instead of logs

**Build Container Resources:**

| Resource | Hobby/Pro | Enterprise |
|----------|-----------|------------|
| Memory | 8192 MB | Custom |
| Disk space | 23 GB | Custom |
| CPUs | 2 (Hobby) / 4 (Pro) | Custom |

- Exceeding limits cancels build
- System report generated on failure
- Enable for all builds: `VERCEL_BUILD_SYSTEM_REPORT=1`

**Build Duration:**
- Maximum: 45 minutes
- Includes: building, checking, assigning domains
- Exceeding limit cancels deployment

**Build Cache:**
- Maximum size: 1 GB
- Retention: 1 month
- Cache key based on: Account, Project, Framework, Root Dir, Node version, Package Manager, Git branch

**Cached Files by Framework:**
- Next.js: `.next/cache/**`
- Nuxt.js: `.nuxt/**`
- Gatsby.js: `{.cache,public}/**`
- Eleventy: `.cache/**`
- Jekyll/Middleman: `{vendor/bin,vendor/cache,vendor/bundle}/**`

**Managing Build Cache:**
- Redeploy without cache: Uncheck "Use existing Build Cache"
- CLI: `vercel --force`
- Environment variables:
  - `VERCEL_FORCE_NO_BUILD_CACHE=1`
  - `TURBO_FORCE=true` (for Turborepo)
- API: `forceNew=1` query parameter

**Common Build Errors:**
- Missing Build script
- Recursive invocation of commands
- Pnpm engine unsupported
- Module not found (syntax error at build time)

**Optimization Tips:**
- Skip dev dependencies: `npm install --only=production` or `yarn install --production`
- Ensure correct framework preset in Build settings
- First builds take longer (empty cache)

### Troubleshooting Build Errors Documentation

**Troubleshooting Views:**
- **Build logs**: Console output during deployment (found under Deployment Status)
- **Resources tab**: Functions, middleware, and assets from build
- **Source tab**: Build output after successful deployment (also accessible via `/_src`)

**Investigating Build Failures:**

1. **Accessing Build Logs:**
   - Go to Vercel dashboard → Select project → Deployments tab
   - Click on failed deployment (shows error status)
   - Check preview section for error summary
   - Expand "Building" accordion for detailed logs
   - Look for red "Error" sections (often the actual error is above generic exit messages)

2. **Build Logs Not Available:**
   - Occurs when preconditions fail (invalid vercel.json, ignored build steps, non-team member commits)
   - Error displayed as overlay instead of logs

**Build Resource Limits:**

| Resource | Hobby/Pro | Enterprise |
|----------|-----------|------------|
| Memory | 8192 MB | Custom |
| Disk space | 23 GB | Custom |
| CPUs | 2/4 | Custom |
| Max duration | 45 minutes | 45 minutes |
| Cache size | 1 GB | 1 GB |

**Build Cache:**

**What's Cached:**
- `node_modules/**`
- Framework-specific:
  - Next.js: `.next/cache/**`
  - Nuxt.js: `.nuxt/**`
  - Gatsby: `{.cache,public}/**`
  - Eleventy: `.cache/**`
  - Jekyll/Middleman: `{vendor/bin,vendor/cache,vendor/bundle}/**`

**Cache Key Factors:**
- Account/Team
- Project
- Framework Preset
- Root Directory
- Node.js Version
- Package Manager
- Git branch

**Managing Build Cache:**
- Redeploy without cache: Uncheck "Use existing Build Cache"
- CLI: `vercel --force`
- Environment variables:
  - `VERCEL_FORCE_NO_BUILD_CACHE=1`
  - `TURBO_FORCE=true` (for Turborepo)
- API: `forceNew=1` query parameter

**Common Build Errors:**
- Missing Build script
- Recursive invocation of commands
- Pnpm engine unsupported
- Module not found errors

**Performance Tips:**
- Build locally first to catch issues
- Exclude dev dependencies: `npm install --only=production`
- Set `VERCEL_BUILD_SYSTEM_REPORT=1` for detailed resource reports

## Runtime Errors

### Known Runtime Issues
<!-- Add runtime error solutions here -->

## Database/Prisma Errors

### Database Connection Issues
<!-- Add database error solutions here -->

## Dependencies Issues

### Package Installation Problems
<!-- Add dependency error solutions here -->

---

Please add your error documentation and solutions below each relevant section.