/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import {
  Check,
  Copy,
  Loader2,
  RotateCcw,
  Send,
  Square,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

function CodeBlock({
  children,
  className,
  ...props
}: React.PropsWithChildren<
  { className?: string } & React.HTMLAttributes<HTMLElement>
>) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const isCodeBlock = match;

  const copyToClipboard = async () => {
    const text = String(children).replace(/\n$/, "");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isCodeBlock) {
    return (
      <div className="relative group">
        <pre
          className={`${className} overflow-x-auto p-3 rounded-md bg-muted text-sm`}
          {...props}
        >
          <code>{children}</code>
        </pre>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <code
      className={`${className} bg-muted px-1 py-0.5 rounded text-sm`}
      {...props}
    >
      {children}
    </code>
  );
}

export default function AIChat() {
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    stop,
    error,
    reload,
  } = useChat({});
  const isLoading = status === "submitted" || status === "streaming";
  const handleDelete = (id: string) => {
    setMessages(messages.filter((message) => message.id !== id));
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
    <div className="container mx-auto max-w-4xl p-4 h-screen flex gap-4">
      <div className="flex-1 flex flex-col gap-4">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div key={message.id} className="group">
                <div
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
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
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                    onClick={() => handleDelete(message.id)}
                    disabled={isLoading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 text-sm flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  {t("thinking")}...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="px-6 pb-6">
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

          <Separator className="mb-4" />

          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder={t("askAnythingPlaceholder")}
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
  // img: ({ alt, src, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  //   <img
  //     alt={alt}
  //     src={src || "/placeholder.svg"}
  //     className="max-w-full h-auto rounded-md my-4"
  //     {...props}
  //   />
  // ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-6 border-t border-border" {...props} />
  ),
  pre: ({ children, ...props }: React.PropsWithChildren<{}>) => (
    <pre className="mb-4" {...props}>
      {children}
    </pre>
  ),
};
