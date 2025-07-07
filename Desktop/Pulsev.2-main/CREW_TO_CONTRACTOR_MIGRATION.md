# 🔄 Crew → Contractor Migration Plan

## Overview
Safely rename "Crew" to "Contractor" throughout the application while maintaining Vercel deployment compatibility.

## Pre-Change Checklist
- ✅ Development server is running
- ✅ Current build is working
- ✅ Vercel deployment is successful
- ⚠️ There are existing TypeScript errors related to crewMembers

## Change Scope

### 1. Database Schema Changes
- `crew_members` table → `contractors` table
- `crewMembers` references → `contractors` references
- Update all foreign key references

### 2. Frontend Changes
- Navigation: `/dashboard/crew` → `/dashboard/contractors`
- Page title: "Crew Management" → "Contractor Management"
- All UI text references
- Type definitions

### 3. API/Backend Changes
- API routes referencing crew
- Database queries
- Type exports

## Vercel-Safe Migration Steps

### Phase 1: Database Schema
1. Create new schema with contractors table
2. Update schema exports
3. Fix TypeScript errors

### Phase 2: Type Definitions
1. Update all TypeScript interfaces
2. Rename CrewMember → Contractor
3. Update type imports

### Phase 3: Frontend Components
1. Rename crew page to contractors
2. Update navigation links
3. Update all text references

### Phase 4: Testing
1. Run local build: `pnpm turbo build --filter=@pulsecrm/web`
2. Check for TypeScript errors
3. Test all functionality

### Phase 5: Deployment
1. Commit with clear message
2. Push to trigger Vercel build
3. Monitor for any issues

## Files to Change

### High Priority (Breaking Changes)
1. `/apps/web/app/dashboard/crew/` → `/apps/web/app/dashboard/contractors/`
2. Database schema files
3. Type definitions

### Medium Priority (UI/UX)
1. Navigation components
2. Dashboard references
3. Help documentation

### Low Priority (Text Only)
1. Comments and documentation
2. Variable names (can be done gradually)

## Rollback Plan
If issues occur:
1. Git revert the commit
2. Push to trigger rebuild
3. Vercel will auto-deploy previous version
