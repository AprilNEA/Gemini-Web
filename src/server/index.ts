import { z } from "zod";
import { procedure, router } from "./trpc";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? "");

export const appRouter = router({
  sayHello: procedure
    .meta({ /* 👉 */ openapi: { method: "GET", path: "/say-hello" } })
    .input(z.object({ name: z.string() }))
    .output(z.object({ greeting: z.string() }))
    .query(({ input }) => {
      return { greeting: `Hello ${input.name}!` };
    }),
  model: procedure
    .meta({
      method: "GET",
      path: "/chat",
    })
    .input(z.object({ apiKey: z.string() }))
    .output(z.any())
    .query(async ({ input }) => {}),
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
        apiKey: z.string().optional(),
      }),
    )
    .output(z.any())
    .mutation(async ({ input }) => {
      if (input.apiKey) {
        genAI.apiKey = input.apiKey;
      }

      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(input.prompt);
      const response = await result.response;
      const text = response.text();
      return {
        text,
      };
    }),
});
export type AppRouter = typeof appRouter;
