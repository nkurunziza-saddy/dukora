import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { streamText } from "ai";
import { openrouter } from "@openrouter/ai-sdk-provider";

// Mock external modules
vi.mock("ai", () => ({
  streamText: vi.fn(),
}));
vi.mock("@openrouter/ai-sdk-provider", () => ({
  openrouter: vi.fn(),
}));

// Import the handler after mocking
import { POST } from "@/app/api/chat/route";
import { ErrorCode } from "@/server/constants/errors";

describe("Chat API Route", () => {
  const mockMessages = [{ role: "user", content: "Hello" }];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the streamText return value
    (streamText as vi.Mock).mockReturnValue({
      toDataStreamResponse: vi.fn(() => new Response("mock stream")), // Mock a simple Response object
    });
    (openrouter as vi.Mock).mockReturnValue("mock-model");
  });

  it("should return a streaming response with status 200", async () => {
    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: mockMessages }),
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe(
      "text/plain;charset=UTF-8"
    ); // Default for simple Response
    expect(await response.text()).toBe("mock stream");
    expect(streamText).toHaveBeenCalledWith({
      model: "mock-model",
      system: "You are a helpful assistant.",
      messages: mockMessages,
    });
    expect(openrouter).toHaveBeenCalledWith(
      "deepseek/deepseek-r1-0528-qwen3-8b:free"
    );
  });

  it("should handle rate limit exceeded error (status 429)", async () => {
    (streamText as vi.Mock).mockImplementation(() => {
      const error = new Error("Rate limit");
      (error as any).status = 429; // Simulate a 429 status from the AI SDK
      throw error;
    });

    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: mockMessages }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(429);
    expect(text).toBe("Rate limit exceeded");
  });

  it("should handle generic errors (status 500)", async () => {
    (streamText as vi.Mock).mockImplementation(() => {
      throw new Error("Something went wrong");
    });

    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: mockMessages }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toBe(ErrorCode.API_ERROR);
  });

  it("should handle non-Error objects thrown", async () => {
    (streamText as vi.Mock).mockImplementation(() => {
      throw "Non-error object"; // Simulate throwing a non-Error object
    });

    const request = new NextRequest("http://localhost/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: mockMessages }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(500);
    expect(text).toBe(ErrorCode.API_ERROR);
  });
});
