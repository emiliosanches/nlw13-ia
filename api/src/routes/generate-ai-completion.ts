import { FastifyInstance } from "fastify";
import { z } from "zod";
import { OpenAIStream, streamToResponse } from "ai";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";

const modelParams = {
  "gpt-3.5-turbo": {
    defaultModelCharLimit: 4750,
    increasedTokensModelName: "gpt-3.5-turbo-16k",
  },
  "gpt-4": {
    defaultModelCharLimit: 9500,
    increasedTokensModelName: "gpt-4-32k",
  },
} as const;

export async function generateAiCompletionRoute(app: FastifyInstance) {
  app.post("/ai-completion", async (req, reply) => {
    const bodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
      model: z.enum(["gpt-3.5-turbo", "gpt-4"]),
    });

    const { videoId, prompt, temperature, model } = bodySchema.parse(
      req.body
    );

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    if (!video.transcription)
      return reply.status(400).send({
        error: "Video transcription not generated yet",
      });

    const promptMessage = prompt.replace(
      /{transcription}/g,
      video.transcription
    );

    const response = await openAi.chat.completions.create({
      model:
        promptMessage.length > modelParams[model].defaultModelCharLimit
          ? modelParams[model].increasedTokensModelName
          : model,
      temperature,
      messages: [{ role: "user", content: promptMessage }],
      stream: true,
    });

    const stream = OpenAIStream(response);

    streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      }
    });
  });
}
