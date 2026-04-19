import type { PredictionResponse } from "@/types/prediction";
import type { FairnessResponse, MetaResponse } from "@/types/fairness";

export async function predict(inputs: Record<string, number>): Promise<PredictionResponse> {
  const res = await fetch("/api/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Prediction failed (${res.status})`);
  }
  return res.json();
}

export async function streamChat(
  messages: Array<{ role: string; content: string }>,
  prediction: PredictionResponse | null,
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  const res = await fetch("/api/chat/stream", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, prediction }),
  });
  if (!res.ok || !res.body) throw new Error("Chat stream failed");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const line = part.trim();
      if (!line.startsWith("data:")) continue;
      try {
        const data = JSON.parse(line.slice(5).trim());
        if (data.chunk) onChunk(data.chunk);
        if (data.done) { onDone(); return; }
      } catch { /* ignore */ }
    }
  }
  onDone();
}

export async function getFairness(): Promise<FairnessResponse> {
  const res = await fetch("/api/fairness");
  if (!res.ok) throw new Error("Fairness fetch failed");
  return res.json();
}

export async function getMeta(): Promise<MetaResponse> {
  const res = await fetch("/api/meta");
  if (!res.ok) throw new Error("Meta fetch failed");
  return res.json();
}
