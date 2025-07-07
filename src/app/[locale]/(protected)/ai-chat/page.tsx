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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useEffect, useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { CodeBlock } from "./code-block";

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
        <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
          <MessageSquare className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome to AI Chat</h1>
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
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
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .katex { font-size: 1.1em; font-family: inherit; }
      .katex-display { margin: 1.5em 0; overflow-x: auto; overflow-y: hidden; }
      .katex-display > .katex { display: block; text-align: center; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const t = useTranslations("ai-chat");

  return (
    <div className="relative mx-auto max-w-4xl h-[89vh] overflow-hidden">
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col">
              <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
            </div>
          ) : (
            <ScrollArea ref={scrollAreaRef} className="px-4 h-full">
              <div className="space-y-6 pb-4 pt-4">
                {messages.map((message) => (
                  <div key={message.id} className="group">
                    <div
                      className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className="max-w-[80%] space-y-2">
                        <div
                          className={`rounded-lg px-4 py-3 text-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="markdown-content space-y-4 text-sm">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={markdownComponents}
                            >
                              {processMessage(message.content)}
                            </ReactMarkdown>
                          </div>
                        </div>

                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-muted-foreground"
                            onClick={() =>
                              handleCopyMessage(message.content, message.id)
                            }
                          >
                            {copiedMessageId === message.id ? (
                              <>
                                <Check className="size-3.5 mr-1" />
                                <span className="hidden sm:block">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3.5 mr-1" />
                                <span className="hidden sm:block">Copy</span>
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-sm text-destructive hover:text-destructive"
                            onClick={() => handleDelete(message.id)}
                            disabled={isLoading}
                          >
                            <Trash2 className="size-3.5 mr-1" />
                            <span className="hidden sm:block">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && <TypingIndicator />}
                <div className="h-20"></div>
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
          <div className="border-t bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-lg">
            <div className="py-4 px-6">
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive mb-2">
                    {t("errorOccurred")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => reload()}
                    className="h-8"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t("retry")}
                  </Button>
                </div>
              )}

              <div className="flex gap-2 mb-3">
                {isLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => stop()}
                    className="h-8"
                  >
                    <Square className="h-3 w-3 mr-1" />
                    {t("stop")}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => reload()}
                  disabled={isLoading || messages.length === 0}
                  className="h-8"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {t("regenerate")}
                </Button>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    messages.length === 0
                      ? "Ask me anything..."
                      : t("askAnythingPlaceholder")
                  }
                  disabled={isLoading}
                  className="flex-1 w-full"
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
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
