import {NextApiRequest, NextApiResponse} from 'next';

import {createOpenApiNextHandler} from 'trpc-openapi';

import {appRouter} from '@/server';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {

  // Handle incoming OpenAPI requests
  return createOpenApiNextHandler({
    router: appRouter,
    createContext: () => ({}),
    onError: () => ({}),
    responseMeta: () => ({})
  })(req, res);
};

export default handler;
