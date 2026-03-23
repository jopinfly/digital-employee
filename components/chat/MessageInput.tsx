"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Send, Square, Paperclip } from "lucide-react";

interface Props {
  onSend: (content: string) => void;
  onStop: () => void;
  isStreaming: boolean;
}

export function MessageInput({ onSend, onStop, isStreaming }: Props) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSend() {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }

  return (
    <div className="flex items-end gap-2 px-3 py-2.5 rounded-2xl bg-white/5 border border-white/10 focus-within:border-indigo-500/40 focus-within:bg-white/8 transition">
      <button
        className="p-1.5 text-zinc-600 hover:text-zinc-400 transition shrink-0 mb-0.5"
        title="上传文件（开发中）"
        disabled
      >
        <Paperclip size={16} />
      </button>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder="输入消息... （Shift+Enter 换行）"
        rows={1}
        className="flex-1 bg-transparent resize-none outline-none text-sm text-zinc-200 placeholder:text-zinc-600
                   leading-6 max-h-[200px] py-0.5"
        style={{ scrollbarWidth: "none" }}
      />

      <div className="shrink-0 mb-0.5">
        {isStreaming ? (
          <button
            onClick={onStop}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30
                       text-red-400 hover:bg-red-500/30 transition"
            title="停止生成"
          >
            <Square size={14} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            className="flex items-center justify-center w-8 h-8 rounded-xl
                       bg-indigo-600 text-white shadow-lg shadow-indigo-500/25
                       hover:bg-indigo-500 active:scale-95
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
                       transition"
            title="发送 (Enter)"
          >
            <Send size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
