"use client";

import {
  CopyIcon,
  DownloadIcon,
  RefreshCcwIcon,
  Trash2Icon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Action, Actions } from "@/components/ai-components/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-components/conversation";
import { Message, MessageContent } from "@/components/ai-components/message";
import {
  PromptInput,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-components/prompt-input";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "@/components/ai-components/reasoning";
import { Response } from "@/components/ai-components/response";
import { SuggestionCard } from "@/components/ai-components/suggestion-card";
import { usePersistedMessages } from "@/lib/hooks/use-persisted-messages";

const suggestions = [
  {
    title: "Financial analysis",
    description: "How do I analyze a balance sheet?",
  },
  {
    title: "Tax guidance",
    description: "What expenses are tax-deductible for small businesses?",
  },
  {
    title: "Investment advice",
    description: "What's the difference between stocks and bonds?",
  },
  {
    title: "Budget planning",
    description: "How can I create an effective monthly budget?",
  },
];

export default function AIChat() {
  const [inputValue, setInputValue] = useState("");

  const {
    messages,
    sendMessage,
    setMessages,
    status,
    stop,
    error,
    regenerate,
    clearMessages,
  } = usePersistedMessages({
    api: "/api/chat",
    storageKey: "ai-chat-messages",
    maxMessages: 50,
  });

  const handleDelete = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    sendMessage({ text });
    setInputValue("");
  };

  const handleSuggestionClick = (description: string) => {
    handleSendMessage(description);
  };

  const handleClearAll = () => {
    if (
      confirm(
        "Are you sure you want to clear all messages? This action cannot be undone."
      )
    ) {
      clearMessages();
    }
  };

  const handleDownload = () => {
    const chatContent = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "Financial Assistant";
        const content = msg.parts
          .filter((part) => part.type === "text")
          .map((part) => (part.type === "text" ? part.text : ""))
          .join("\n");
        return `${role}:\n${content}\n\n`;
      })
      .join("---\n\n");

    const blob = new Blob([chatContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-chat-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLoading = status === "submitted" || status === "streaming";
  console.log(messages);
  return (
    <div className="flex flex-col h-screen bg-background">
      <Conversation className="flex-1">
        <ConversationContent>
          <div className="max-w-4xl mx-auto">
            {messages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-8">
                  <h1 className="text-2xl font-bold mb-2">
                    Welcome to your AI Assistant
                  </h1>
                  <p className="text-muted-foreground">
                    Start a conversation or try one of these suggestions
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
                  {suggestions.map((suggestion, index) => (
                    <SuggestionCard
                      description={suggestion.description}
                      key={index}
                      onClick={() =>
                        handleSuggestionClick(suggestion.description)
                      }
                      title={suggestion.title}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Conversation</h2>
                <Action label="Clear All" onClick={handleClearAll} size={"sm"}>
                  <Trash2Icon className="size-3.5" /> Clear all
                </Action>
              </div>
            )}
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <Message from={message.role} key={message.id}>
                  <div className="flex flex-col gap-0.5">
                    <MessageContent>
                      {message.parts?.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <Response key={`${message.id}-${i}`}>
                                {part.text}
                              </Response>
                            );
                          case "reasoning":
                            return (
                              <Reasoning
                                defaultOpen={false}
                                isStreaming={status === "streaming"}
                                key={`${message.id}-${i}`}
                              >
                                <ReasoningTrigger />
                                <ReasoningContent>{part.text}</ReasoningContent>
                              </Reasoning>
                            );
                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                    {message.role === "assistant" &&
                      message.id === messages[messages.length - 1].id && (
                        <Actions className="mt-2">
                          <Action label="Retry" onClick={() => regenerate()}>
                            <RefreshCcwIcon className="size-3.5" />
                          </Action>
                          <Action
                            label="Copy"
                            onClick={() =>
                              navigator.clipboard.writeText(
                                message.parts.find(
                                  (part) => part.type === "text"
                                )?.text || ""
                              )
                            }
                          >
                            <CopyIcon className="size-3.5" />
                          </Action>
                          <Action
                            label="Download"
                            onClick={handleDownload}
                            tooltip="Download conversation"
                          >
                            <DownloadIcon className="size-3.5" />
                          </Action>
                        </Actions>
                      )}
                    {message.role === "user" && (
                      <Actions className="mt-2">
                        <Action
                          label="Delete"
                          onClick={() => handleDelete(message.id)}
                        >
                          <TrashIcon className="size-3.5" />
                        </Action>
                      </Actions>
                    )}
                  </div>
                </Message>
              ))}
              {isLoading && (
                <div className="py-2 text-muted-foreground animate-pulse text-sm">
                  Generating response ...
                </div>
              )}
            </div>
          </div>
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="">
        <div className="max-w-4xl mx-auto">
          <PromptInput
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputValue);
            }}
          >
            <PromptInputTextarea
              disabled={isLoading}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about financial analysis, tax guidance, investments..."
              value={inputValue}
            />
            <PromptInputToolbar>
              <div />
              <PromptInputSubmit
                disabled={!inputValue.trim()}
                onClick={() => {
                  if (isLoading) {
                    stop();
                  } else {
                    handleSendMessage(inputValue);
                  }
                }}
                status={status}
              />
            </PromptInputToolbar>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
