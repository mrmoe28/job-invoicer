import "server-only";

import { StackServerApp } from "@stackframe/stack";

// Check if Stack Auth environment variables are properly configured
const isStackAuthConfigured =
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID &&
  process.env.NEXT_PUBLIC_STACK_PROJECT_ID !== 'YOUR_NEON_AUTH_PROJECT_ID' &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY &&
  process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY !== 'YOUR_NEON_AUTH_PUBLISHABLE_KEY' &&
  process.env.STACK_SECRET_SERVER_KEY &&
  process.env.STACK_SECRET_SERVER_KEY !== 'YOUR_NEON_AUTH_SECRET_KEY';

let stackServerApp: StackServerApp | null = null;

// Only initialize Stack Auth on server side and when properly configured
if (isStackAuthConfigured) {
  try {
    stackServerApp = new StackServerApp({
      tokenStore: "nextjs-cookie",
    });
  } catch (error) {
    console.error('Failed to initialize Stack Auth:', error);
    stackServerApp = null;
  }
} else {
  console.warn('Stack Auth not configured. Authentication features will be disabled.');
}

// Helper function to check if Stack Auth is available
export const isStackAuthAvailable = () => isStackAuthConfigured && stackServerApp !== null;

export { stackServerApp };
