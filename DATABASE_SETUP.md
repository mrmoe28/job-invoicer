# Database Setup Guide

This project uses Drizzle ORM with Neon (PostgreSQL) database.

## Quick Setup

1. **Get a Free Neon Database:**
   - Go to https://neon.tech
   - Sign up for a free account
   - Create a new database
   - Copy the connection string (it looks like: `postgresql://user:pass@host.neon.tech/dbname?sslmode=require`)

2. **Update your .env file:**
   ```
   DATABASE_URL="your-neon-connection-string-here"
   ```

3. **Run database migrations:**
   ```bash
   npm run db:push
   ```

## Alternative: Use Local PostgreSQL

If you have PostgreSQL installed locally:

1. Create a database:
   ```bash
   createdb job_invoicer
   ```

2. Update .env:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/job_invoicer"
   ```

3. Run migrations:
   ```bash
   npm run db:push
   ```

## Troubleshooting

- If you see "Failed to create customer" errors, make sure your DATABASE_URL is properly configured
- Check the console logs in your terminal for more detailed error messages
- The app will show warnings if DATABASE_URL is not configured
