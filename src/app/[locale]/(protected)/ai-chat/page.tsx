"use client";

import { useChat } from "@ai-sdk/react";
import { RotateCcwIcon, SendIcon, SquareIcon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import "katex/dist/katex.min.css";
import { useCallback, useEffect, useRef, useState } from "react";
import { SIDEBAR_WIDTH } from "@/components/ui/sidebar";
import { useIsMobile } from "@/lib/hooks/use-mobile";
import { Message } from "./message-box";
import { TypingIndicator } from "./typing-indicator";
import { WelcomeScreen } from "./welcome-screen";

export default function AIChat() {
  const [input, setInput] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const {
    messages,
    setMessages,
    sendMessage,
    status,
    stop,
    error,
    regenerate,
  } = useChat();

  const isLoading = status === "submitted" || status === "streaming";
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useIsMobile();

  const handleDelete = useCallback(
    (id: string) => {
      setMessages((prev) => prev.filter((message) => message.id !== id));
    },
    [setMessages],
  );

  const handleCopyMessage = useCallback(
    async (content: string, messageId: string) => {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    },
    [],
  );

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      sendMessage({ text: input });
      setInput("");
    },
    [input, isLoading, sendMessage],
  );

  const handleClear = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  useEffect(() => {
    const vp = scrollAreaRef.current;
    if (!vp) return;

    requestAnimationFrame(() => {
      vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
    });
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .katex { font-size: 1em; font-family: inherit; }
      .katex-display { margin: 1.5em 0; overflow-x: auto; overflow-y: hidden; }
      .katex-display > .katex { display: block; text-align: center; }
    `;
    document.head.appendChild(style);
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="relative h-full w-full max-w-4xl mx-auto">
      <div className="h-full pb-32 overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  isLoading={isLoading}
                  onCopy={handleCopyMessage}
                  onDelete={handleDelete}
                  isCopied={copiedMessageId === message.id}
                />
              ))}

              {isLoading && <TypingIndicator />}

              <div className="h-8" />
            </div>
          </ScrollArea>
        )}
      </div>

      <div
        className="fixed bottom-0 right-0 border-t border-border/50 bg-background/95 backdrop-blur-sm flex justify-center"
        style={{ left: isMobile ? 0 : SIDEBAR_WIDTH }}
      >
        <div className="input-div max-w-4xl w-full p-4 mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive mb-2">
                Something went wrong
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => regenerate()}
                className="h-7 px-2 text-xs"
              >
                <RotateCcwIcon className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {(isLoading || messages.length > 0) && (
            <div className="flex gap-2 mb-4">
              {isLoading && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={stop}
                  className="h-7 px-3 text-xs"
                >
                  <SquareIcon className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              )}
              {messages.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerate()}
                    disabled={isLoading}
                    className="h-7 px-3 text-xs"
                  >
                    <RotateCcwIcon className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-7 px-3 text-xs text-muted-foreground"
                  >
                    Clear
                  </Button>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 h-11 border-border/50 focus:border-border bg-background"
              autoComplete="off"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 p-0 shrink-0"
            >
              <SendIcon className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
