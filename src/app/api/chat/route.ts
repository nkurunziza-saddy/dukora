import { openrouter } from "@openrouter/ai-sdk-provider";
import { convertToModelMessages, streamText } from "ai";
import { ErrorCode } from "@/server/constants/errors";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const modelMessages = convertToModelMessages(messages);

    const result = streamText({
      model: openrouter("deepseek/deepseek-r1-0528-qwen3-8b:free"),
      system: "You are a helpful assistant.",
      messages: modelMessages,
    });

    return result.toUIMessageStreamResponse({
      originalMessages: messages,

      onFinish: async ({ messages, responseMessage }) => {
        // TODO: Save to database
        console.log("Chat completed:", responseMessage);
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 429
    ) {
      return new Response("Rate limit exceeded", { status: 429 });
    }
    return new Response(ErrorCode.API_ERROR, { status: 500 });
  }
}
