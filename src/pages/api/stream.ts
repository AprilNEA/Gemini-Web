import type { NextApiRequest, NextApiResponse } from "next";
import EventEmitter from "events";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.API_KEY ?? "");

const stream = new EventEmitter();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>,
) {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");

  const { apiKey, prompt } = req.body;
  if (apiKey) {
    genAI.apiKey = apiKey;
  }

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  try {
    const result = await model.generateContentStream([prompt]);

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
