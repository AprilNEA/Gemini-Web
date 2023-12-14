import { z } from "zod";
import { procedure, router } from "./trpc";

export const appRouter = router({
  sayHello: procedure
    .meta({ /* 👉 */ openapi: { method: "GET", path: "/say-hello" } })
    .input(z.object({ name: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),
  chat: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/chat",
      },
    })
    .input(
      z.object({
        prompt: z.string(),
        apiKey: z.string(),
      }),
    )
    .output(z.object({ data: z.any() }))
    .query(async ({ input }) => {
      const result = await fetch(
        `https://generativelanguage.googleapis.com/v1beta3/models/text-bison-001:generateText?key=${input.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: {
              text: input.prompt,
            },
          }),
        },
      ).then((res) => res.json());
      return {
        data: result,
      };
    }),
});
export type AppRouter = typeof appRouter;
