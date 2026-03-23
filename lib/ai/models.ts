import type { ModelConfig } from "@/types";

export const SUPPORTED_MODELS: ModelConfig[] = [
  // OpenAI
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "openai",
    contextWindow: 128000,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "openai",
    contextWindow: 128000,
    supportsVision: true,
    supportsTools: true,
  },
  // Anthropic
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "anthropic",
    contextWindow: 200000,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "claude-3-opus-20240229",
    name: "Claude 3 Opus",
    provider: "anthropic",
    contextWindow: 200000,
    supportsVision: true,
    supportsTools: true,
  },
  // Google
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "google",
    contextWindow: 1000000,
    supportsVision: true,
    supportsTools: true,
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    provider: "google",
    contextWindow: 1000000,
    supportsVision: true,
    supportsTools: true,
  },
  // DeepSeek
  {
    id: "deepseek-chat",
    name: "DeepSeek V3",
    provider: "deepseek",
    contextWindow: 64000,
    supportsVision: false,
    supportsTools: true,
  },
  {
    id: "deepseek-reasoner",
    name: "DeepSeek R1",
    provider: "deepseek",
    contextWindow: 64000,
    supportsVision: false,
    supportsTools: false,
  },
];

export const DEFAULT_MODEL = "gpt-4o";

export function getModelConfig(modelId: string): ModelConfig {
  return (
    SUPPORTED_MODELS.find((m) => m.id === modelId) ??
    SUPPORTED_MODELS.find((m) => m.id === DEFAULT_MODEL)!
  );
}

export const PROVIDER_LABELS: Record<string, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  google: "Google",
  deepseek: "DeepSeek",
};

export const PROVIDER_COLORS: Record<string, string> = {
  openai: "#10a37f",
  anthropic: "#c9562c",
  google: "#4285f4",
  deepseek: "#5d5fef",
};
