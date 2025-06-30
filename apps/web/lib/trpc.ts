import { createTRPCReact } from '@trpc/react-query';
import { type AppRouter } from '@pulsecrm/api';

export const trpc = createTRPCReact<AppRouter>();
export const api = trpc;
