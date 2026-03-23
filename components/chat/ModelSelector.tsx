"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { ModelConfig } from "@/types";
import { PROVIDER_LABELS, PROVIDER_COLORS } from "@/lib/ai/models";

interface Props {
  models: ModelConfig[];
  value: string;
  onChange: (model: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ models, value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = models.find((m) => m.id === value) ?? models[0];

  // Group by provider
  const grouped = models.reduce<Record<string, ModelConfig[]>>((acc, m) => {
    if (!acc[m.provider]) acc[m.provider] = [];
    acc[m.provider].push(m);
    return acc;
  }, {});

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10
                   hover:bg-white/10 hover:border-white/20 transition text-sm text-zinc-300
                   disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <span
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: PROVIDER_COLORS[selected?.provider ?? "openai"] }}
        />
        <span className="font-medium">{selected?.name ?? value}</span>
        <ChevronDown size={13} className={`text-zinc-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-64 rounded-xl bg-[#1a1a22] border border-white/10
                        shadow-xl shadow-black/50 z-50 overflow-hidden animate-fade-in">
          {Object.entries(grouped).map(([provider, providerModels]) => (
            <div key={provider}>
              <div className="px-3 py-1.5 flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: PROVIDER_COLORS[provider] }}
                />
                <span className="text-xs text-zinc-500 font-medium">
                  {PROVIDER_LABELS[provider] ?? provider}
                </span>
              </div>
              {providerModels.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onChange(model.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300
                             hover:bg-white/8 hover:text-white transition text-left"
                >
                  <Check
                    size={13}
                    className={`shrink-0 transition ${value === model.id ? "text-indigo-400" : "opacity-0"}`}
                  />
                  <span className="flex-1">{model.name}</span>
                  <span className="text-xs text-zinc-600">
                    {(model.contextWindow / 1000).toFixed(0)}k
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
