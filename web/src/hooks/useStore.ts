"use client";
import { create } from "zustand";
import type { PredictionResponse } from "@/types/prediction";
import { FEATURE_META, FEATURE_COLS, type FeatureKey } from "@/lib/constants";

interface ChatMessage {
  id:      string;
  role:    "user" | "assistant";
  content: string;
  streaming?: boolean;
}

interface AppStore {
  // Assessment
  answers:    Record<FeatureKey, number>;
  step:       1 | 2 | 3;
  prediction: PredictionResponse | null;
  isLoading:  boolean;
  error:      string | null;

  // Chat
  chatMessages: ChatMessage[];
  isStreaming:  boolean;

  // Actions
  setAnswer(key: FeatureKey, value: number): void;
  setStep(s: 1 | 2 | 3): void;
  setPrediction(p: PredictionResponse): void;
  setLoading(b: boolean): void;
  setError(e: string | null): void;
  resetAssessment(): void;

  addMessage(msg: Omit<ChatMessage, "id">): string;
  appendToMessage(id: string, chunk: string): void;
  finalizeMessage(id: string): void;
  setStreaming(b: boolean): void;
  resetChat(): void;
}

const defaultAnswers = Object.fromEntries(
  FEATURE_COLS.map((k) => [k, FEATURE_META[k].default])
) as Record<FeatureKey, number>;

export const useStore = create<AppStore>((set, get) => ({
  answers:      defaultAnswers,
  step:         1,
  prediction:   null,
  isLoading:    false,
  error:        null,
  chatMessages: [],
  isStreaming:  false,

  setAnswer: (key, value) =>
    set((s) => ({ answers: { ...s.answers, [key]: value } })),

  setStep: (s) => set({ step: s }),

  setPrediction: (p) => set({ prediction: p }),

  setLoading: (b) => set({ isLoading: b }),

  setError: (e) => set({ error: e }),

  resetAssessment: () =>
    set({ answers: defaultAnswers, step: 1, prediction: null, error: null }),

  addMessage: (msg) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ chatMessages: [...s.chatMessages, { ...msg, id }] }));
    return id;
  },

  appendToMessage: (id, chunk) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, content: m.content + chunk } : m
      ),
    })),

  finalizeMessage: (id) =>
    set((s) => ({
      chatMessages: s.chatMessages.map((m) =>
        m.id === id ? { ...m, streaming: false } : m
      ),
    })),

  setStreaming: (b) => set({ isStreaming: b }),

  resetChat: () => set({ chatMessages: [], isStreaming: false }),
}));
