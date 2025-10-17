import { Bot, Check, Copy, Trash2, User } from "lucide-react";
import { memo, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { markdownComponents } from "./markdown-components";

const Message = memo(
  ({
    message,
    isLoading,
    onCopy,
    onDelete,
    isCopied,
  }: {
    message: any;
    isLoading: boolean;
    onCopy: (content: string, id: string) => void;
    onDelete: (id: string) => void;
    isCopied: boolean;
  }) => {
    const processMessage = useCallback((content: string) => {
      return content.replace(
        /\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g,
        (_match, number) => {
          const num = Number.parseFloat(number.replace(/,/g, ""));
          return formatCurrency(num);
        },
      );
    }, []);

    const textContent = useMemo(() => {
      return message.parts
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("");
    }, [message.parts]);

    const processedContent = useMemo(
      () => processMessage(textContent),
      [textContent, processMessage],
    );

    return (
      <div className="group">
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
                  {processedContent}
                </ReactMarkdown>
              </div>
            </div>

            <div
              className={`flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onCopy(textContent, message.id)}
              >
                {isCopied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={() => onDelete(message.id)}
                disabled={isLoading}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  },
);
Message.displayName = "Message";

export { Message };
