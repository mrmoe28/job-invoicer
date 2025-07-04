// This file is imported during build to validate database configuration
// It helps catch configuration errors early in the build process

const isDevelopment = process.env.NODE_ENV === 'development';
const isVercelBuild = process.env.VERCEL === '1';

// Skip database validation during Vercel builds if DATABASE_URL is not set
if (isVercelBuild && !process.env.DATABASE_URL) {
  console.log('⚠️  Skipping database validation during Vercel build. DATABASE_URL will be required at runtime.');
  process.exit(0);
}

// Only validate in development or local builds
if (!isVercelBuild && !process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not configured!');
  console.error('');
  console.error('To fix this:');
  console.error('1. Create a free Neon database at https://neon.tech');
  console.error('2. Copy your connection string');
  console.error('3. Add it to your .env file:');
  console.error('   DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname?sslmode=require"');
  console.error('');

  if (!isDevelopment) {
    process.exit(1);
  }
}

export { };
