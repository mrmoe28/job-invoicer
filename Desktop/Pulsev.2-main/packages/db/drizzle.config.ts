import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL || process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/pulsecrm',
  },
} satisfies Config;
