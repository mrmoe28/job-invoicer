# Pulse CRM - Simplified Setup (No Turborepo)

## 🚀 Quick Start
```bash
cd apps/web
npm run dev
```

## 📦 What We Removed
- Turborepo configuration
- Monorepo complexity  
- Build orchestration overhead

## 🎯 Current Structure
```
Pulsev.2-main/
├── apps/web/          # Main Next.js app
├── packages/db/       # Database package (optional)
└── package.json       # Root package (simplified)
```

## ✅ Benefits
- Direct Next.js development
- Faster build times
- Easier debugging
- Simplified deployment

## 🔄 Migration Complete
Your Pulse CRM now runs as a standard Next.js app without Turborepo overhead.

Access your app at: http://localhost:3001
Demo login: admin@pulsecrm.com / admin123
