# NLW IA - 13th edition

Upload.AI is a project that has been developed during the 13th edition of Next Level Week - by Rocketseat.
It's a web app which allows you to load a video, generate a transcription and, based on it, create titles and descriptions using Generative AI (GPT 3.5 currently).

## Installation

Use pnpm to install dependencies in both "web" (frontend) and "api" (backend) projects:

```bash
pnpm i
```

Start executing applications running:

```bash
pnpm run dev
```

To seed database with the 2 default prompt templates for the AI input, run (in `api` folder):

```bash
pnpm prisma db seed
```

## Usage

### 1. Open the application

![Image of the application in its initial state](./readme_assets/image1.png)

### 2. Select a video by clicking the top-right file input

![Image of the application with a video loaded](./readme_assets/image2.png)

### 3. In the first input, write the transcription prompt (keywords mentioned in the video), then click "Carregar Vídeo"

![Image of the application with transcription prompt provided](./readme_assets/image3.png)

### 4. After loading finished, select a prompt template, an AI model and a [temperature](https://platform.openai.com/docs/api-reference/audio#temperature)
![Image of the application with all inputs filled](./readme_assets/image4.png)

### 5. Click "Executar" and wait the response
![Image of the application while receiving AI response](./readme_assets/image5.png)


## Technical details

For the development, in the frontend application these are the main dependencies used:

- [TypeScript](https://www.typescriptlang.org)
- [Vite](https://vitejs.dev)
- [shadcn/ui](https://ui.shadcn.com)
  - [Radix UI](https://www.radix-ui.com)
  - [Tailwind](https://tailwindcss.com)
- [Vercel AI](https://sdk.vercel.ai/docs)

And for the backend application, these were the main dependencies:

- [TypeScript](https://www.typescriptlang.org)
- [Fastify](https://fastify.dev)
- [Prisma ORM](https://www.prisma.io)
- [OpenAI](https://github.com/openai/openai-node#readme)
- [Vercel AI](https://sdk.vercel.ai/docs)
