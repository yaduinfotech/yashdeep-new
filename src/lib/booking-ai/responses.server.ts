import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText, stepCountIs, type ModelMessage, type ToolSet, type UIMessage } from "ai";

export function createGeminiResponsesCall(
  request: Request,
  config: { baseURL?: string; apiKey: string; model: string },
  messages: ModelMessage[],
  instructions?: string,
  tools?: ToolSet,
  originalMessages?: UIMessage[],
) {
  // Connect to Google Gemini API using official endpoint
  const gemini = createOpenAICompatible({
    name: "gemini",
    baseURL: config.baseURL || "https://generativelanguage.googleapis.com/v1beta/openai/",
    apiKey: config.apiKey,
  });

  const result = streamText({
    model: gemini(config.model),
    system: instructions,
    messages,
    tools,
    stopWhen: stepCountIs(50),
    maxRetries: 0,
    abortSignal: request.signal,
  });

  return {
    result,
    response: async () => {
      return result.toUIMessageStreamResponse({
        originalMessages,
        sendReasoning: true,
      });
    },
  };
}
