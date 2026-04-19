"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useStore } from "@/hooks/useStore";
import { streamChat } from "@/lib/api";
import { TIER_STYLES } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: "😴", text: "How to sleep better?" },
  { icon: "🤝", text: "I've been feeling lonely" },
  { icon: "📚", text: "Managing academic stress" },
  { icon: "🎯", text: "I feel lost and unmotivated" },
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div key={i}
          className="w-2 h-2 rounded-full bg-brand/50"
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { prediction, chatMessages, addMessage, appendToMessage, finalizeMessage, setStreaming, isStreaming, resetChat } = useStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const tier = prediction ? TIER_STYLES[prediction.risk_tier] : null;

  // Welcome message on first load — ref guard prevents StrictMode double-fire
  const welcomeSent = useRef(false);
  useEffect(() => {
    if (welcomeSent.current) return;
    welcomeSent.current = true;
    const score = prediction?.gad7_score;
    const tierName = prediction?.risk_tier;
    const welcome = score != null
      ? `Hi 👋 I'm MindBridge — an AI wellness guide here to support you.\n\nYour estimated GAD-7 score is **${Math.round(score)}/21** (${tierName} range). I can see what factors shaped that score, so our conversation can be grounded in your actual responses.\n\nWhat's on your mind? I'm here to listen.`
      : "Hi 👋 I'm MindBridge — an AI wellness guide for students.\n\nI'm here to talk through whatever's weighing on you — sleep, stress, loneliness, purpose, or anything else. Complete the Check-In first to get personalized context, or just start chatting!\n\n*Remember: I'm an AI assistant, not a mental health professional.*";
    addMessage({ role: "assistant", content: welcome });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-resize textarea
  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    addMessage({ role: "user", content: text });
    const msgs = [...chatMessages, { role: "user" as const, content: text }];
    const assistantId = addMessage({ role: "assistant", content: "", streaming: true });
    setStreaming(true);

    try {
      await streamChat(
        msgs.map((m) => ({ role: m.role, content: m.content })),
        prediction,
        (chunk) => appendToMessage(assistantId, chunk),
        () => { finalizeMessage(assistantId); setStreaming(false); }
      );
    } catch {
      appendToMessage(assistantId, "\n\n⚠️ Connection error. Is the backend running?");
      finalizeMessage(assistantId);
      setStreaming(false);
    }
  }, [isStreaming, chatMessages, prediction, addMessage, appendToMessage, finalizeMessage, setStreaming]);

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    if (inputRef.current) { inputRef.current.style.height = "auto"; }
    sendMessage(text);
  };

  return (
    /*
      Mobile-first layout:
      - The outer div fills the viewport height minus the navbar (~56px) and crisis strip (~36px)
      - We use flex-col so the messages area stretches and the input sticks to the bottom
      - On iOS, env(safe-area-inset-bottom) handles the home indicator
    */
    <div
      className="flex flex-col rounded-2xl overflow-hidden border border-border"
      style={{ height: "calc(100dvh - 120px)", minHeight: 400 }}
    >
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex-shrink-0" style={{ background: "linear-gradient(135deg, #2D5A40, #52906A)" }}>
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg flex-shrink-0">🌿</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-white text-sm leading-tight">MindBridge AI Wellness Guide</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 flex-shrink-0" />
              <p className="text-[11px] text-white/65 truncate">AI assistant · not a therapist · academic demo</p>
            </div>
          </div>
          {prediction && (
            <div className="bg-white/15 rounded-full px-2.5 py-1 text-xs font-semibold text-white/90 flex-shrink-0">
              {Math.round(prediction.gad7_score)}/21
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="mx-3 mb-3 bg-black/20 rounded-lg px-3 py-1.5 text-[11px] text-white/70">
          ⚠️ <strong className="text-white/85">AI only — not a therapist.</strong> In crisis? Call or text <strong className="text-white">988</strong>.
        </div>
      </div>

      {/* Context strip */}
      {prediction && tier && (
        <div className="flex-shrink-0 bg-bg2 border-b border-border px-4 py-1.5 text-[11px] text-fg3">
          <strong style={{ color: tier.color }}>Context:</strong>{" "}
          {Math.round(prediction.gad7_score)}/21 ({prediction.risk_tier}) ·{" "}
          {prediction.top_factors.slice(0, 2).map((f) => `${f.icon} ${f.label}`).join(" · ")}
        </div>
      )}

      {/* ── Messages ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto bg-bg px-3 py-4 space-y-4 overscroll-contain">

        {/* Quick prompts (first turn only) */}
        {chatMessages.length <= 1 && !isStreaming && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-1">
            <p className="text-[10px] text-fg3 font-semibold uppercase tracking-wider mb-2">Try asking</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.map(({ icon, text }) => (
                <button key={text} onClick={() => sendMessage(text)}
                  className="inline-flex items-center gap-1 bg-bg2 hover:bg-brand/10 border border-border hover:border-brand/40 rounded-full px-3 py-1.5 text-xs text-fg2 hover:text-brand transition-all active:scale-95">
                  {icon} {text}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* History */}
        <AnimatePresence initial={false}>
          {chatMessages.map((msg) => (
            <motion.div key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5
                ${msg.role === "assistant" ? "bg-brand/15" : "bg-bg3"}`}>
                {msg.role === "assistant" ? "🌿" : "🧑‍🎓"}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] sm:max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed chat-bubble
                ${msg.role === "assistant"
                  ? "bg-bg2 text-fg border border-border rounded-tl-sm"
                  : "bg-gradient-to-br from-brand-dark to-brand text-white rounded-tr-sm shadow-lg shadow-brand/20"}`}
              >
                {msg.streaming && msg.content === "" ? (
                  <TypingDots />
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      a: ({ children, href }) => (
                        <a href={href} target="_blank" rel="noopener noreferrer" className="underline opacity-75 hover:opacity-100">{children}</a>
                      ),
                    }}>
                    {msg.content + (msg.streaming ? " ▌" : "")}
                  </ReactMarkdown>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} className="h-1" />
      </div>

      {/* ── Input ────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-bg2 border-t border-border px-3 py-2.5"
           style={{ paddingBottom: "max(0.625rem, env(safe-area-inset-bottom))" }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); resizeTextarea(e.target); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask about sleep, stress, loneliness, motivation…"
            rows={1}
            disabled={isStreaming}
            className="flex-1 bg-bg3 border border-border rounded-xl px-3.5 py-2.5 text-sm text-fg placeholder:text-fg3 resize-none outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition-all disabled:opacity-50"
            style={{ minHeight: 40, maxHeight: 120 }}
          />
          <button
            onClick={handleSend}
            disabled={isStreaming || !input.trim()}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-dark to-brand text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-brand/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:transform-none"
          >
            {isStreaming ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <span className="text-base leading-none">↑</span>
            )}
          </button>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          <button onClick={resetChat} className="text-[11px] text-fg3 hover:text-fg transition-colors active:opacity-70">
            🔄 Reset
          </button>
          <p className="text-[11px] text-fg3">Session-only · Not clinical advice</p>
        </div>
      </div>
    </div>
  );
}
