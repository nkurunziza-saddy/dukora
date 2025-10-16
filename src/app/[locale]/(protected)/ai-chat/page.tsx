/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import {
  Check,
  Copy,
  RotateCcw,
  Send,
  Square,
  Trash2,
  MessageSquare,
  Sparkles,
  Zap,
  Brain,
  User,
  Bot,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useEffect, useState, useRef } from "react";
import { CodeBlock } from "./code-block";
import { SIDEBAR_WIDTH } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg px-4 py-3 text-sm flex items-center gap-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"></div>
        </div>
        <span className="text-muted-foreground">AI is thinking...</span>
      </div>
    </div>
  );
}

function WelcomeScreen({
  onSuggestionClick,
}: {
  onSuggestionClick: (suggestion: string) => void;
}) {
  const suggestions = [
    {
      icon: <Brain className="size-4" />,
      title: "Explain an accounting concept",
      description: "What is double-entry bookkeeping?",
    },
    {
      icon: <Sparkles className="size-4" />,
      title: "Financial analysis",
      description: "How do I analyze a balance sheet?",
    },
    {
      icon: <Zap className="size-4" />,
      title: "Tax guidance",
      description: "What expenses are tax-deductible for small businesses?",
    },
    {
      icon: <MessageSquare className="size-4" />,
      title: "Investment advice",
      description: "What are the basics of stock market investing?",
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-8">
        {/* <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
          <MessageSquare className="size-6 text-primary" />
        </div> */}
        <h1 className="text-2xl font-bold mb-2">
          Welcome to your AI Assistant
        </h1>
        <p className="text-muted-foreground">
          Start a conversation or try one of these suggestions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.description)}
            className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-start gap-3">
              <div className="text-primary group-hover:scale-110 transition-transform">
                {suggestion.icon}
              </div>
              <div>
                <h3 className="font-medium text-sm mb-1">{suggestion.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {suggestion.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AIChat() {
  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat({});

  const isLoading = status === "submitted" || status === "streaming";
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
  };

  const handleCopyMessage = async (content: string, messageId: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const processMessage = (content: string) => {
    return content.replace(
      /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
      (match, number) => {
        const num = Number.parseFloat(number.replace(/,/g, ""));
        return formatCurrency(num);
      }
    );
  };

  useEffect(() => {
    const vp = scrollAreaRef.current;
    if (!vp) return;
    vp.scrollTop = vp.scrollHeight;
    vp.scrollTo({ top: vp.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .katex { font-size: 1em; font-family: inherit; }
      .katex-display { margin: 1.5em 0; overflow-x: auto; overflow-y: hidden; }
      .katex-display > .katex { display: block; text-align: center; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  const isMobile = useIsMobile();
  return (
    <div className="relative h-full w-full max-w-4xl mx-auto">
      <div className="h-full pb-32 overflow-hidden">
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        ) : (
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id} className="group">
                  <div
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-foreground text-background"
                          : "bg-muted"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-3.5 h-3.5" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 max-w-[85%] space-y-2">
                      <div
                        className={`px-4 py-3 rounded-lg ${
                          message.role === "user"
                            ? "bg-foreground text-background ml-auto"
                            : "bg-muted/50 text-foreground"
                        }`}
                      >
                        <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={markdownComponents}
                          >
                            {processMessage(message.content)}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div
                        className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            handleCopyMessage(message.content, message.id)
                          }
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(message.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
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
        <div className="input-div max-w-4xl w-full p-6 mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive mb-2">
                Something went wrong
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => reload()}
                className="h-7 px-2 text-xs"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
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
                  onClick={() => stop()}
                  className="h-7 px-3 text-xs"
                >
                  <Square className="w-3 h-3 mr-1" />
                  Stop
                </Button>
              )}
              {messages.length > 0 && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => reload()}
                    disabled={isLoading}
                    className="h-7 px-3 text-xs"
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMessages([])}
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
              onChange={handleInputChange}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 h-11 border-border/50 focus:border-border bg-background"
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 p-0 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

const markdownComponents = {
  code: CodeBlock,
  p: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <p className="mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  h1: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h1 className="text-xl font-bold mb-4 mt-6" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h2 className="text-lg font-bold mb-3 mt-5" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <h3 className="text-md font-bold mb-3 mt-4" {...props}>
      {children}
    </h3>
  ),
  ul: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <ul className="list-disc pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <ol className="list-decimal pl-6 mb-4 space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <blockquote className="border-l-4 border-muted pl-4 italic mb-4" {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <div className="overflow-x-auto mb-4">
      <table
        className="min-w-full border-collapse border border-border"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <th
      className="border border-border bg-muted px-2 py-1 text-left font-medium"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <td className="border border-border px-2 py-1" {...props}>
      {children}
    </td>
  ),
  a: ({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href?: string }>) => (
    <a href={href} className="text-primary hover:underline" {...props}>
      {children}
    </a>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-6 border-t border-border" {...props} />
  ),
  pre: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <pre className="mb-4" {...props}>
      {children}
    </pre>
  ),
};
