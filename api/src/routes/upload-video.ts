import { fastifyMultipart } from "@fastify/multipart";
import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import path from "path";
import fs from "fs";
import { promisify } from "node:util";
import { pipeline } from "node:stream";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline);

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1024 * 1024 * 25,
    },
  });

  app.post("/videos", async (request, reply) => {
    const data = await request.file();

    if (!data)
      return reply.status(400).send({
        error: "Missing file input",
      });

    const extension = path.extname(data.filename);

    if (extension !== ".mp3")
      return reply.status(400).send({
        error: "Invalid input type. Please upload a MP3 file",
      });

    const fileBaseName = path.basename(data.filename, extension);

    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;

    const uploadDestination = path.resolve(
      __dirname,
      "../../tmp",
      fileUploadName
    );

    await pump(data.file, fs.createWriteStream(uploadDestination));

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    });

    return reply.status(201).send({
      video
    });
  });
}
