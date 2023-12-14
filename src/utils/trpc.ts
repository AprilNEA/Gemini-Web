// import toast from 'react-hot-toast';

// @ts-ignore
import {QueryCache} from '@tanstack/query-core';
import {httpBatchLink} from '@trpc/client';
import {createTRPCNext} from '@trpc/next';
import {TRPCError} from '@trpc/server';

import type {AppRouter} from '@/server';

function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';

  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;

  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config({ctx}) {
    if (typeof window !== 'undefined') {
      // during client requests
      return {
        links: [
          httpBatchLink({
            /**
             * If you want to use SSR, you need to use the server's full URL
             * @link https://trpc.io/docs/ssr
             **/
            url: `${getBaseUrl()}/api/trpc`,

            // You can pass any HTTP headers you wish here
            async headers() {
              return {};
            },
          }),
        ],

        queryClientConfig: {
          queryCache: new QueryCache({
            onError: (error: unknown) => {
              if (error instanceof TRPCError) {
                switch (error.code) {
                  case 'UNAUTHORIZED':
                    break;
                  default:
                    // toast.error(`[Unknown]: ${error.message}`);
                    break;
                }
              } else {
                // toast.error(`Something went wrong: ${error}`);
              }
            },
            // toast.error(`Something went wrong: ${error.message}`),
          }),
        },
      };
    }
    return {
      // transformer: superjson, // optional - adds superjson serialization
      links: [
        httpBatchLink({
          // The server needs to know your app's full url
          url: `${getBaseUrl()}/api/trpc`,
          /**
           * Set custom request headers on every request from tRPC
           * @link https://trpc.io/docs/v10/header
           */
          headers() {
            if (!ctx?.req?.headers) {
              return {};
            }
            // To use SSR properly, you need to forward client headers to the server
            // This is so you can pass through things like cookies when we're server-side rendering
            return {
              cookie: ctx.req.headers.cookie,
            };
          },
        }),
      ],
    };
  },

  /**
   * @link https://trpc.io/docs/ssr
   **/
  ssr: true,
});
