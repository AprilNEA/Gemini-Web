import {initTRPC} from '@trpc/server';

import {OpenApiMeta} from 'trpc-openapi';

const trpc = initTRPC.meta<OpenApiMeta>().create();

export const middleware = trpc.middleware;
export const router = trpc.router;
export const procedure = trpc.procedure;
