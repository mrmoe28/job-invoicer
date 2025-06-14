# PulseCRM ‑ Rebuild  
A next-generation, **crew–centric CRM** that unifies contacts, jobs, tasks, documents and schedules in a real-time workspace.  
Re-imagined from the original Replit prototype, this version focuses on developer experience, performance and extensibility.

---

## ✨ Highlights
| Category      | What’s New                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------------- |
| Modern Stack  | Next.js 14 • React 18 • tRPC v10 • Drizzle ORM • PostgreSQL 15 • Redis                                         |
| Design System | Tailwind 3 + Radix Primitives generated via **shadcn/ui**                                                     |
| Realtime      | WebSockets + Redis pub/sub for live updates & presence                                                        |
| Collaboration | CRDT-powered shared editor (Yjs + TipTap)                                                                     |
| Mobile        | Installable PWA with offline cache & background sync                                                          |
| Dev XP        | Turborepo § pnpm • strict TypeScript • ESLint/Prettier • Vitest • Storybook • GitHub Actions                  |
| Deploy        | Docker images → Railway / Fly.io / Render / Vercel (static)                                                   |

---

## 1 · Prerequisites
| Tool                | Version (min) | Notes                         |
| ------------------- | ------------- | ----------------------------- |
| Node.js             | 18.17.0       | LTS; enables Bun, PNPM etc.   |
| pnpm                | 8             | `npm i -g pnpm`               |
| Turbo CLI           | 1.11         | `pnpm i -g turbo`             |
| Docker + Compose    | 23.x          | optional for local containers |
| PostgreSQL client   | psql 15       | useful for DB inspection      |

---

## 2 · Monorepo Layout
```
pulsecrm/
├─ apps/
│  └─ web/               # Next.js frontend + API routes
├─ packages/
│  ├─ api/               # tRPC routers (server + client)
│  ├─ db/                # Drizzle schema, migrations, seed
│  ├─ ui/                # Re-usable design-system
│  └─ config/            # Shared ESLint/Tailwind/TSConfig presets
├─ docker/               # Dockerfiles & compose
├─ turbo.json            # Turborepo pipeline
└─ .env.example          # Environment template
```

---

## 3 · Quick Start

### 3.1 Clone & install
```bash
git clone https://github.com/your-org/pulsecrm.git
cd pulsecrm
pnpm install
```

### 3.2 Environment variables
```bash
cp .env.example .env
# Edit values in .env for DB, Redis, auth, etc.
```

### 3.3 Start services  
Option A – local machine *(uses existing Postgres instance)*:
```bash
pnpm dev                # turbo runs db:push → web
```

Option B – Docker:
```bash
docker compose -f docker/docker-compose.dev.yml up -d postgres redis
pnpm dev
```

Open `http://localhost:3000` and sign up.

---

## 4 · Database & Migrations
1. Connection string: `DATABASE_URL` in `.env`.  
2. Schema lives in `packages/db/src/schema/*`.  
3. Generate SQL:
   ```bash
   pnpm db:generate        # generates migration files
   ```
4. Push to database:
   ```bash
   pnpm db:push
   ```

DrizzleKit tracks migrations in `drizzle/`.

---

## 5 · Everyday Developer Commands

| Task                      | Command                               |
| ------------------------- | ------------------------------------- |
| Start dev servers         | `pnpm dev`                            |
| Type-check repo           | `pnpm typecheck`                      |
| Lint fix                  | `pnpm lint` or `pnpm format`          |
| Run unit/tests            | `pnpm test` / `pnpm test:watch`       |
| Storybook                 | `pnpm storybook`                      |
| Clean outputs             | `pnpm clean`                          |
| Build all packages        | `pnpm build`                          |
| Launch interactive DB UI  | `pnpm db:studio` (Drizzle Studio)     |

---

## 6 · Docker Images

### Local production build
```bash
docker build -f docker/prod.Dockerfile -t pulsecrm:local .
docker run -p 3000:3000 --env-file .env pulsecrm:local
```

### Compose (dev)  
`docker/docker-compose.dev.yml` spins up Postgres, Redis, PgAdmin and (optionally) the web container.

---

## 7 · Deployment Options

### 7.1 Railway *(recommended full-stack)*

1. `railway init` → choose **From Repo**.  
2. Add Postgres & Redis plugins.  
3. Set env vars from `.env`.  
4. Railway auto-detects Turbo/Next build:  
   ```
   Build:  pnpm build
   Start:  node apps/web/server.js
   ```
5. `railway up`.

### 7.2 Fly.io *(edge machines)*

```bash
fly launch --postgres
fly secrets import < .env
fly deploy
```

### 7.3 Render

1. New → Web Service.  
2. Build: `pnpm build`. Start: `node apps/web/server.js`.  
3. Add Postgres & Redis services.  
4. Apply env vars.

### 7.4 Vercel *(static preview)*  
Deploy `apps/web` as static only if serverless API not required.

---

## 8 · CI / CD
GitHub Actions pipeline (`.github/workflows/ci.yml`):

1. **Install** (`pnpm install –frozen-lockfile`)  
2. **Lint + Test + Typecheck**  
3. **Build** Turbo cache artifacts  
4. **Docker publish** → GHCR  
5. **Deploy** (Railway/Fly) using secrets

PRs get preview URLs via comment.

---

## 9 · Contributing

1. Fork & create feature branch.  
2. Follow *Conventional Commits*: `feat:`, `fix:` …  
3. `pnpm test && pnpm lint`.  
4. Open PR; CI must pass.  
5. Small, focused PRs appreciated!

---

## 10 · FAQ

| Question                              | Answer |
| ------------------------------------- | ------ |
| *Can I use Prisma instead of Drizzle?*| Yes – schemas are isolated in `packages/db`; swap driver & regenerate. |
| *Where is authentication?*            | Lucia Auth stored in `packages/api/src/router/auth`. |
| *How do I enable AI features?*        | Set `OPENAI_API_KEY` and `ENABLE_AI_FEATURES=true` in `.env`. |
| *Does it work offline?*               | PWA uses service-worker caching; background sync requires HTTPS. |

---

## 11 · Roadmap
- [ ] Gantt-style schedule board  
- [ ] Granular role-based permissions & audit log  
- [ ] Native mobile wrappers via Capacitor  
- [ ] Plugin marketplace (widgets & automations)  

Track progress in **GitHub Projects → Roadmap**.

---

## 12 · License
MIT — Use it, change it, ship it.  
If it helps your crews, we’re happy! 🚀
