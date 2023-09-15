import { FileVideo, Upload } from "lucide-react";
import { fetchFile } from "@ffmpeg/util";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { FormEvent, useMemo, useRef, useState } from "react";
import { loadFFmpeg } from "@/lib/ffmpeg";
import { api } from "@/lib/axios";

type Status = "WAITING" | "CONVERTING" | "UPLOADING" | "GENERATING" | "SUCCESS";

const statusMessages = {
  CONVERTING: "Convertendo...",
  UPLOADING: "Carregando...",
  GENERATING: "Transcrevendo...",
  SUCCESS: "Sucesso!",
};

export function VideoInputForm() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("WAITING");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files?.length) return;

    const selectedFile = files[0];

    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    console.log("Conversion started");

    const ffmpeg = await loadFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    // ffmpeg.on('log', (log) => console.log(log));

    ffmpeg.on("progress", (e) => {
      console.log(`Conversion progress: ${Math.round(e.progress * 100)}%`);
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioBlob = new Blob([data], { type: "audio/mpeg" });

    const audioFile = new File([audioBlob], "audio.mp3", {
      type: "audio/mpeg",
    });

    console.log("Conversion finished");

    return audioFile;
  }

  async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setStatus("CONVERTING");

    if (!videoFile) return;

    const audio = await convertVideoToAudio(videoFile);

    setStatus("UPLOADING");

    const formData = new FormData();

    formData.append("file", audio);

    const response = await api.post("/videos", formData);

    const videoId = response.data.video.id;

    setStatus("GENERATING");

    const transcriptionResponse = await api.post(
      `/videos/${videoId}/transcription`,
      {
        prompt: promptInputRef.current?.value,
      }
    );

    setStatus("SUCCESS");
  }

  const previewURL = useMemo(() => {
    if (!videoFile) return;

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form className="space-y-6" onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className="relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground overflow-clip hover:bg-primary/5"
      >
        {previewURL ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute inset-0"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione o vídeo
          </>
        )}
      </label>
      <input
        type="file"
        id="video"
        accept="video/mp4"
        className="sr-only"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="transcription_prompt">Prompt de transcrição</Label>
        <Textarea
          ref={promptInputRef}
          id="transcription_prompt"
          disabled={status !== "WAITING"}
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua palavras chave mencionadas no vídeo separadas por vírgula (,)"
        />
      </div>

      <Button
        data-success={status === "SUCCESS"}
        disabled={status !== "WAITING"}
        type="submit"
        className="w-full data-[success=true]:bg-emerald-400"
      >
        {status === "WAITING" ? (
          <>
            Carregar vídeo
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMessages[status]
        )}
      </Button>
    </form>
  );
}
