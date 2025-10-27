"use client";

import {
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon,
  DownloadIcon,
  RefreshCcwIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Action, Actions } from "@/components/ai-components/actions";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-components/conversation";
import { Message, MessageContent } from "@/components/ai-components/message";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { usePersistedMessages } from "@/lib/hooks/use-persisted-messages";
import { cn } from "@/lib/utils";
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from "../ai-components/reasoning";
import { Response } from "../ai-components/response";

interface AIAnalyticsAssistantProps {
  analyticsData: Record<string, unknown>;
  timeRange: string;
  monthName: string;
  year: number;
}

export function AIAnalyticsAssistant({
  analyticsData,
  timeRange,
  monthName,
  year,
}: AIAnalyticsAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { messages, sendMessage, regenerate, status, clearMessages } =
    usePersistedMessages({
      api: "/api/chat/analytics",
      storageKey: "ai-analytics-messages",
      maxMessages: 30,
    });

  const isLoading = status === "submitted" || status === "streaming";

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage = text.trim();

      const systematicPrompt = createAnalyticsPrompt(
        analyticsData,
        timeRange,
        monthName,
        year,
        userMessage
      );

      sendMessage({ text: systematicPrompt });
    },
    [analyticsData, timeRange, monthName, year, sendMessage, isLoading]
  );

  const handleClearMessages = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to clear all analytics messages? This action cannot be undone."
      )
    ) {
      clearMessages();
    }
  }, [clearMessages]);

  console.log({ messages });
  const handleDownload = () => {
    const chatContent = messages
      .map((msg) => {
        const role = msg.role === "user" ? "You" : "AI Analytics Assistant";
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

  const suggestions = [
    "Analyze the revenue trends and provide insights",
    "What are the key performance indicators showing?",
    "Identify potential areas for improvement",
    "Explain the inventory turnover and its implications",
    "Provide a summary of financial health",
  ];

  return (
    <div className="mt-6 border rounded-lg p-4 bg-card shadow-sm">
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex gap-4 items-center justify-between p-2 hover:bg-muted/50 rounded-md transition-colors">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <h4 className="font-medium text-foreground">
                AI Analytics Assistant
              </h4>
            </div>
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2 flex-wrap items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {suggestions.map((suggestion) => (
                  <Button
                    className="text-xs hover:bg-primary/10 hover:border-primary/50 transition-colors"
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion.trim())}
                    size="sm"
                    variant="outline"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
              {messages.length > 0 && (
                <Button
                  className="text-xs hover:bg-destructive/10 hover:border-destructive/50 transition-colors"
                  onClick={handleClearMessages}
                  size="sm"
                  variant="outline"
                >
                  <Trash2Icon className="size-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
            <Conversation className="flex-1">
              <ConversationContent
                className={cn(messages.length > 0 ? "py-0" : "py-4")}
              >
                <div className="space-y-4">
                  {(() => {
                    const latestAssistantMessage = [...messages]
                      .reverse()
                      .find((m) => m.role === "assistant");
                    if (!latestAssistantMessage) return null;
                    return (
                      <Message from="assistant" key={latestAssistantMessage.id}>
                        <div className="flex flex-col gap-0.5">
                          <MessageContent>
                            {latestAssistantMessage.parts.map((part, i) => {
                              switch (part.type) {
                                case "text":
                                  return (
                                    <Response
                                      key={`${latestAssistantMessage.id}-${i}`}
                                    >
                                      {part.text}
                                    </Response>
                                  );
                                case "reasoning":
                                  return (
                                    <Reasoning
                                      defaultOpen={false}
                                      isStreaming={status === "streaming"}
                                      key={`${latestAssistantMessage.id}-${i}`}
                                    >
                                      <ReasoningTrigger />
                                      <ReasoningContent>
                                        {part.text}
                                      </ReasoningContent>
                                    </Reasoning>
                                  );
                                default:
                                  return null;
                              }
                            })}
                          </MessageContent>
                          <Actions className="mt-2">
                            <Action label="Retry" onClick={() => regenerate()}>
                              <RefreshCcwIcon className="size-3.5" />
                            </Action>
                            <Action
                              label="Copy"
                              onClick={() =>
                                navigator.clipboard.writeText(
                                  latestAssistantMessage.parts.find(
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
                        </div>
                      </Message>
                    );
                  })()}
                  {isLoading && (
                    <div className="py-2 text-muted-foreground animate-pulse text-sm">
                      Generating response ...
                    </div>
                  )}
                </div>
              </ConversationContent>
              <ConversationScrollButton />
            </Conversation>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

function createAnalyticsPrompt(
  analyticsData: Record<string, unknown>,
  timeRange: string,
  monthName: string,
  year: number,
  userQuestion: string
): string {
  const dataContext = `
ANALYTICS DATA CONTEXT:
Period: ${monthName} ${year} (Time Range: ${timeRange})

REVENUE METRICS:
- Total Revenue: $${analyticsData?.grossRevenue || 0}
- Net Revenue: $${analyticsData?.netRevenue || 0}
- Gross Profit: $${analyticsData?.grossProfit || 0}
- Net Income: $${analyticsData?.netIncome || 0}

OPERATING METRICS:
- Operating Income: $${analyticsData?.operatingIncome || 0}
- Operating Expenses: $${analyticsData?.operatingExpenses || 0}
- Expense Ratio: ${analyticsData?.expenseRatio || 0}%

SALES PERFORMANCE:
- Transaction Count: ${analyticsData?.transactionCount || 0}
- Average Order Value: $${analyticsData?.averageOrderValue || 0}
- Unique Products Sold: ${analyticsData?.uniqueProductsSold || 0}
- Returns: $${analyticsData?.returns || 0}
- Return Rate: ${analyticsData?.returnRate || 0}%

INVENTORY METRICS:
- Opening Stock: $${analyticsData?.openingStock || 0}
- Closing Stock: $${analyticsData?.closingStock || 0}
- Purchases: $${analyticsData?.purchases || 0}
- Cost of Goods Sold: $${analyticsData?.costOfGoodsSold || 0}
- Inventory Turnover: ${analyticsData?.inventoryTurnover || 0}
- Days on Hand: ${analyticsData?.daysOnHand || 0} days
- Inventory Growth: ${analyticsData?.inventoryGrowth || 0}%

PROFITABILITY METRICS:
- Gross Margin: ${analyticsData?.grossMargin || 0}%
- Net Margin: ${analyticsData?.netMargin || 0}%
- Operating Margin: ${analyticsData?.operatingMargin || 0}%
- Asset Turnover: ${analyticsData?.assetTurnover || 0}

DATA QUALITY:
- Total Transactions: ${(analyticsData?.dataQuality as Record<string, unknown>)?.totalTransactions || 0}
- Valid Transactions: ${(analyticsData?.dataQuality as Record<string, unknown>)?.validTransactions || 0}
- Has Inventory Data: ${(analyticsData?.dataQuality as Record<string, unknown>)?.hasInventoryData ? "Yes" : "No"}
- Has Expense Data: ${(analyticsData?.dataQuality as Record<string, unknown>)?.hasExpenseData ? "Yes" : "No"}

INSTRUCTIONS:
You are a financial analytics expert. Analyze the provided data and answer the user's question with:
1. Clear, actionable insights
2. Specific recommendations based on the data
3. Identify trends, patterns, and potential issues
4. Use business-friendly language
5. Provide concrete next steps when appropriate
6. Highlight both strengths and areas for improvement
7. Consider the data quality indicators in your analysis

USER QUESTION: ${userQuestion}

Please provide a comprehensive analysis based on the data above.`;

  return dataContext;
}
