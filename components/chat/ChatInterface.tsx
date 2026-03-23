"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ModelSelector } from "./ModelSelector";
import type { ModelConfig } from "@/types";
import { Bot, Zap, ZapOff } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: Date;
}

interface Props {
  userId: string;
  conversationId: string | null;
  initialMessages: Message[];
  initialModel: string;
  supportedModels: ModelConfig[];
  defaultUseAgent?: boolean;
}

export function ChatInterface({
  conversationId: initialConvId,
  initialMessages,
  initialModel,
  supportedModels,
  defaultUseAgent = false,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [useAgent, setUseAgent] = useState(defaultUseAgent);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [convId, setConvId] = useState<string | null>(initialConvId);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  async function sendMessage(content: string) {
    if (!content.trim() || isStreaming) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent("");

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          model: selectedModel,
          conversationId: convId,
          useAgent,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "meta" && data.conversationId) {
              setConvId(data.conversationId);
              if (!initialConvId) {
                router.replace(`/chat/${data.conversationId}`, { scroll: false });
              }
            } else if (data.type === "chunk" && data.text) {
              accumulated += data.text;
              setStreamingContent(accumulated);
            } else if (data.type === "done") {
              const aiMsg: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: accumulated,
                createdAt: new Date(),
              };
              setMessages((prev) => [...prev, aiMsg]);
              setStreamingContent("");
            } else if (data.type === "error") {
              throw new Error(data.error);
            }
          } catch {
            // ignore parse errors on individual lines
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: `⚠️ 发生错误：${err.message}`,
            createdAt: new Date(),
          },
        ]);
      }
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-[#0f0f12] shrink-0">
        <ModelSelector
          models={supportedModels}
          value={selectedModel}
          onChange={setSelectedModel}
          disabled={isStreaming}
        />
        <button
          onClick={() => setUseAgent(!useAgent)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                      ${useAgent
              ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
              : "bg-white/5 border border-white/10 text-zinc-500 hover:text-zinc-300"
            }`}
          title={useAgent ? "关闭 Agent 模式" : "开启 Agent 模式（可使用工具）"}
        >
          {useAgent ? <Zap size={13} /> : <ZapOff size={13} />}
          Agent 模式
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
              <Bot size={28} className="text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">数字员工助手</h2>
            <p className="text-zinc-500 text-sm max-w-md">
              我是你的 AI 工作助手，可以帮你搜索信息、分析文档、编写代码等。
              <br />
              {useAgent && (
                <span className="text-indigo-400">Agent 模式已开启，我可以自主调用工具完成复杂任务。</span>
              )}
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto w-full px-4 py-6 space-y-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {streamingContent && (
              <MessageBubble role="assistant" content={streamingContent} isStreaming />
            )}
            {isStreaming && !streamingContent && (
              <div className="flex items-center gap-3 py-4">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-zinc-500 animate-pulse-dot"
                      style={{ animationDelay: `${i * 0.16}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/[0.06] bg-[#0f0f12]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <MessageInput
            onSend={sendMessage}
            onStop={stopStreaming}
            isStreaming={isStreaming}
          />
          <p className="text-center text-xs text-zinc-700 mt-2">
            AI 生成内容仅供参考，请自行判断准确性
          </p>
        </div>
      </div>
    </div>
  );
}
