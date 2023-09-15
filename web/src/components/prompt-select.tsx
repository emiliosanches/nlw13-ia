import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { api } from "@/lib/axios";

type Prompt = {
  id: string;
  title: string;
  template: string;
};

type PromptSelectProps = {
  onPromptSelect: (template: string) => void;
};

export function PromptSelect({ onPromptSelect }: PromptSelectProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);

  useEffect(() => {
    api.get("prompts").then((response) => {
      setPrompts(response.data);
    });
  }, []);

  function handlePromptSelected(promptId: string) {
    const prompt = prompts?.find((p) => p.id === promptId);

    if (prompt) onPromptSelect(prompt.template);
  }

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione um prompt" />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => (
          <SelectItem key={prompt.id} value={prompt.id}>
            {prompt.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
