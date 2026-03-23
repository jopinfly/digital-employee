import { ChatOpenAI } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from "@langchain/core/messages";
import { getModelConfig } from "./models";
import { buildTools } from "./tools";
import type { MessagePayload } from "@/types";

const SYSTEM_PROMPT = `你是一个专业的数字员工助手，由公司内部部署。你可以帮助员工：
- 回答工作相关问题
- 搜索最新信息
- 分析数据和文档
- 协助编写文字材料
- 进行数学计算

请始终保持专业、准确，并用中文回复（除非用户用其他语言提问）。`;

function buildLLM(modelId: string) {
  const config = getModelConfig(modelId);

  switch (config.provider) {
    case "openai":
      return new ChatOpenAI({
        model: modelId,
        apiKey: process.env.OPENAI_API_KEY,
        streaming: true,
      });

    case "anthropic":
      return new ChatAnthropic({
        model: modelId,
        apiKey: process.env.ANTHROPIC_API_KEY,
        streaming: true,
      });

    case "google":
      return new ChatGoogleGenerativeAI({
        model: modelId,
        apiKey: process.env.GOOGLE_API_KEY,
        streaming: true,
      });

    case "deepseek":
      return new ChatOpenAI({
        model: modelId,
        apiKey: process.env.DEEPSEEK_API_KEY,
        configuration: {
          baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com/v1",
        },
        streaming: true,
      });

    default:
      throw new Error(`Unsupported model provider: ${config.provider}`);
  }
}

function convertMessages(history: MessagePayload[]): BaseMessage[] {
  return history.map((msg) => {
    switch (msg.role) {
      case "user":
        return new HumanMessage(msg.content);
      case "assistant":
        return new AIMessage(msg.content);
      case "system":
        return new SystemMessage(msg.content);
      default:
        return new HumanMessage(msg.content);
    }
  });
}

/**
 * Stream a response from the agent or plain LLM.
 * Yields text chunks as they arrive.
 */
export async function* streamAgentResponse(
  modelId: string,
  history: MessagePayload[],
  userMessage: string,
  useAgent: boolean
): AsyncGenerator<string> {
  const llm = buildLLM(modelId);

  const messages: BaseMessage[] = [
    new SystemMessage(SYSTEM_PROMPT),
    ...convertMessages(history),
    new HumanMessage(userMessage),
  ];

  if (!useAgent) {
    // Plain LLM streaming
    const stream = await llm.stream(messages);
    for await (const chunk of stream) {
      const text = typeof chunk.content === "string" ? chunk.content : "";
      if (text) yield text;
    }
    return;
  }

  // LangGraph ReAct Agent with tools
  const tools = buildTools();
  const modelConfig = getModelConfig(modelId);

  if (!modelConfig.supportsTools || tools.length === 0) {
    // Fallback to plain LLM if model/tools not supported
    const stream = await llm.stream(messages);
    for await (const chunk of stream) {
      const text = typeof chunk.content === "string" ? chunk.content : "";
      if (text) yield text;
    }
    return;
  }

  const agent = createReactAgent({
    llm: llm as Parameters<typeof createReactAgent>[0]["llm"],
    tools,
    messageModifier: SYSTEM_PROMPT,
  });

  const agentMessages = [
    ...convertMessages(history),
    new HumanMessage(userMessage),
  ];

  const stream = await agent.stream(
    { messages: agentMessages },
    { streamMode: "values" }
  );

  let lastAssistantContent = "";

  for await (const chunk of stream) {
    const msgs: BaseMessage[] = chunk.messages ?? [];
    const last = msgs[msgs.length - 1];

    if (!last) continue;

    const isAI = last._getType() === "ai";
    if (!isAI) continue;

    const content = typeof last.content === "string" ? last.content : "";
    if (content && content !== lastAssistantContent) {
      // Yield only the new delta
      const delta = content.slice(lastAssistantContent.length);
      if (delta) yield delta;
      lastAssistantContent = content;
    }
  }
}
