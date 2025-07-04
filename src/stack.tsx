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

let stackServerApp: StackServerApp;

// Only initialize Stack Auth on server side and when properly configured
if (isStackAuthConfigured) {
  try {
    stackServerApp = new StackServerApp({
      tokenStore: "nextjs-cookie",
    });
  } catch (error) {
    console.error('Failed to initialize Stack Auth:', error);
    // Create a minimal fallback to prevent type errors
    stackServerApp = new StackServerApp({
      tokenStore: "nextjs-cookie",
    });
  }
} else {
  console.warn('Stack Auth not configured. Using default configuration.');
  // Create a default configuration to prevent null errors
  stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
  });
}

// Helper function to check if Stack Auth is available
export const isStackAuthAvailable = () => isStackAuthConfigured && stackServerApp !== null;

export { stackServerApp };
