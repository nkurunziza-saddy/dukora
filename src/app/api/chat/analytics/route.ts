import { openrouter } from "@openrouter/ai-sdk-provider";
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const systemPrompt = `You are a professional financial analytics assistant. You provide detailed, data-driven insights and analysis.

Your responses should:
- Be comprehensive and analytical
- Use tables, lists, and structured formatting
- Include specific metrics and calculations when relevant
- Provide actionable recommendations
- Use markdown formatting for clarity
- Be professional and precise

Focus on delivering high-quality financial analysis that would be valuable in a business context.`;

  const prompt = [
    { role: "system" as const, content: systemPrompt },
    ...convertToModelMessages(messages),
  ];

  const result = streamText({
    model: openrouter("deepseek/deepseek-r1-0528-qwen3-8b:free"),
    prompt,
    abortSignal: req.signal,
    maxOutputTokens: 2000,
    temperature: 0.7,
  });

  return result.toUIMessageStreamResponse({
    onFinish: async ({ isAborted }) => {
      if (isAborted) {
        console.log("Chat request aborted");
      }
    },
    consumeSseStream: consumeStream,
  });
}
