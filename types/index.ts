export type UserRole = "USER" | "ADMIN";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

export type ModelProvider = "openai" | "anthropic" | "google" | "deepseek";

export interface ModelConfig {
  id: string;
  name: string;
  provider: ModelProvider;
  contextWindow: number;
  supportsVision: boolean;
  supportsTools: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  model: string;
  updatedAt: Date;
}

export interface MessagePayload {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  conversationId?: string;
  message: string;
  model: string;
  useAgent: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: Date;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}
