import type { NextApiRequest, NextApiResponse } from "next";
import EventEmitter from "events";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? "");

const stream = new EventEmitter();

const schema = z.object({
  apiKey: z.string().optional(),
  prompt: z.string(),
  history: z
    .object({
      role: z.enum(["user", "model"]),
      parts: z.string(),
    })
    .array(),
});
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const { apiKey, prompt, history } = schema.parse(req.body);

  if (apiKey) {
    genAI.apiKey = apiKey;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const chat = model.startChat({
    history: history,
    generationConfig: {
      maxOutputTokens: 100,
    },
  });

  try {
    const result = await chat.sendMessageStream([prompt]);

    stream.on("message", function (event, data) {
      res.write(`data: ${data}\n\n`); // <- the format here is important!
    });

    for await (const chunk of result.stream) {
      stream.emit("message", "data", JSON.stringify(chunk.text()));
    }

    res.end("done\n");
  } catch (e) {
    res.status(500);
  }
}
