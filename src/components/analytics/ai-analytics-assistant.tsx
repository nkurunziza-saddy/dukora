"use client";

import { useChat } from "@ai-sdk/react";
import {
  BotIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SendIcon,
  SquareIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

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
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const {
    messages: chatMessages,
    sendMessage: sendChatMessage,
    stop,
    error,
  } = useChat({
    onFinish: () => {
      setIsLoading(false);
    },
    onError: () => {
      setIsLoading(false);
    },
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;

      const userMessage = input.trim();
      setInput("");
      setIsLoading(true);

      const systematicPrompt = createAnalyticsPrompt(
        analyticsData,
        timeRange,
        monthName,
        year,
        userMessage
      );

      sendChatMessage({ text: systematicPrompt });
    },
    [
      input,
      isLoading,
      analyticsData,
      timeRange,
      monthName,
      year,
      sendChatMessage,
    ]
  );

  const handleClear = useCallback(() => {
    window.location.reload();
  }, []);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      scrollArea.scrollTo({ top: scrollArea.scrollHeight, behavior: "smooth" });
    }
  }, []);

  const suggestions = [
    "Analyze the revenue trends and provide insights",
    "What are the key performance indicators showing?",
    "Identify potential areas for improvement",
    "Explain the inventory turnover and its implications",
    "Provide a summary of financial health",
  ];

  return (
    <div className="mt-6 border rounded-md p-4">
      <Collapsible onOpenChange={setIsOpen} open={isOpen}>
        <CollapsibleTrigger className={""}>
          <div className="flex gap-4 items-center justify-between">
            <h4 className="flex items-center gap-2">AI Analytics Assistant</h4>
            {isOpen ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4">
          <div className="pt-0">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Ask me anything about your analytics data:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <Button
                        className="text-xs"
                        key={suggestion}
                        onClick={() => handleSuggestionClick(suggestion)}
                        size="sm"
                        variant="outline"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {chatMessages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Conversation</p>
                    <Button
                      className="h-7 px-2 text-xs"
                      onClick={handleClear}
                      size="sm"
                      variant="ghost"
                    >
                      Clear
                    </Button>
                  </div>

                  <ScrollArea
                    className="h-64 border rounded-lg"
                    ref={scrollAreaRef}
                  >
                    <div className="p-4 space-y-4">
                      {chatMessages.map((message) => {
                        const textContent = message.parts
                          .filter((part: any) => part.type === "text")
                          .map((part: any) => part.text)
                          .join("");
                        return (
                          <div
                            className={cn(
                              "flex gap-3",
                              message.role === "user" ? "flex-row-reverse" : ""
                            )}
                            key={message.id}
                          >
                            <div
                              className={cn(
                                "flex-1 space-y-2",
                                message.role === "user"
                                  ? "max-w-[75%]"
                                  : "max-w-[85%]"
                              )}
                            >
                              <div
                                className={cn(
                                  "px-3 py-2 rounded-lg text-sm",
                                  message.role === "user"
                                    ? "bg-muted/40 text-foreground ml-auto"
                                    : "bg-background text-foreground border"
                                )}
                              >
                                <div className="prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                  {textContent}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="flex-1 space-y-2 max-w-[85%]">
                            <div className="px-3 py-2 rounded-lg text-sm bg-background text-foreground border">
                              <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                                <span className="text-muted-foreground">
                                  Analyzing your data...
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {error && (
                <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">
                    Something went wrong. Please try again.
                  </p>
                </div>
              )}

              <form className="flex gap-2" onSubmit={handleSubmit}>
                <Input
                  className="flex-1"
                  disabled={isLoading}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about your analytics data..."
                  value={input}
                />
                {isLoading ? (
                  <Button
                    className="px-3"
                    onClick={stop}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <SquareIcon className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    className="px-3"
                    disabled={!input.trim()}
                    size="sm"
                    type="submit"
                  >
                    <SendIcon className="w-4 h-4" />
                  </Button>
                )}
              </form>
            </div>
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
- Total Transactions: ${(analyticsData?.dataQuality as any)?.totalTransactions || 0}
- Valid Transactions: ${(analyticsData?.dataQuality as any)?.validTransactions || 0}
- Has Inventory Data: ${(analyticsData?.dataQuality as any)?.hasInventoryData ? "Yes" : "No"}
- Has Expense Data: ${(analyticsData?.dataQuality as any)?.hasExpenseData ? "Yes" : "No"}

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
