import { FastifyInstance } from "fastify";
import { z } from "zod";
import fs from "fs";
import { prisma } from "../lib/prisma";
import { openAi } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post("/videos/:videoId/transcription", async (req, reply) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    });

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { videoId } = paramsSchema.parse(req.params);

    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const audioReadStream = fs.createReadStream(video.path);

    const response = await openAi.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
      temperature: 0,
      prompt,
    });

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription: response.text,
      },
    });

    return reply.status(201).send({ transcription: response.text });
  });
}
