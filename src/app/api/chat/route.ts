import { google } from "@ai-sdk/google";
import {
  consumeStream,
  convertToModelMessages,
  streamText,
  type UIMessage,
} from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const systemPrompt = `You are a professional financial assistant. You provide clear, accurate, and helpful financial guidance. 
  
Your responses should:
- Be professional and trustworthy
- Use clear, concise language
- Format financial data in tables when appropriate
- Provide actionable insights
- Include relevant disclaimers when necessary
- Use markdown formatting for better readability

Always maintain a helpful, knowledgeable tone while being mindful of the complexity of financial topics.`;

  const prompt = [
    { role: "system" as const, content: systemPrompt },
    ...convertToModelMessages(messages),
  ];

  const result = streamText({
    model: google("gemini-2.5-pro"),
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
