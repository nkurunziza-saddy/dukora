"use client";

import { useState } from "react";
import {
  Send,
  Bot,
  User,
  FileText,
  BarChart3,
  Package,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

// Mock chat data
const initialMessages = [
  {
    id: 1,
    type: "assistant",
    content:
      "Hello! I'm your AI inventory assistant. I can help you with inventory management, generate reports, analyze trends, and answer questions about your stock. How can I assist you today?",
    timestamp: new Date("2024-01-20T09:00:00"),
  },
  {
    id: 2,
    type: "user",
    content: "Show me products that are running low on stock",
    timestamp: new Date("2024-01-20T09:01:00"),
  },
  {
    id: 3,
    type: "assistant",
    content:
      "I found 3 products with low stock levels:\n\n• Wireless Headphones (WH-001): 15 units (reorder level: 20)\n• Mechanical Keyboard (KB-002): 8 units (reorder level: 15)\n• Standing Desk (TB-004): 3 units (reorder level: 5)\n\nWould you like me to generate purchase orders for these items?",
    timestamp: new Date("2024-01-20T09:01:30"),
  },
];

const quickActions = [
  {
    icon: Package,
    title: "Check Stock Levels",
    description: "Get current inventory status",
    prompt: "Show me current stock levels for all products",
  },
  {
    icon: BarChart3,
    title: "Generate Sales Report",
    description: "Create this month's sales summary",
    prompt: "Generate a sales report for this month",
  },
  {
    icon: FileText,
    title: "Low Stock Alert",
    description: "Find products needing reorder",
    prompt: "Which products need to be reordered?",
  },
  {
    icon: Sparkles,
    title: "AI Recommendations",
    description: "Get optimization suggestions",
    prompt: "What are your recommendations to optimize inventory?",
  },
];

export default function AIChat() {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newUserMessage = {
      id: messages.length + 1,
      type: "user" as const,
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        type: "assistant" as const,
        content: generateAIResponse(inputValue),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (prompt: string) => {
    const lowercasePrompt = prompt.toLowerCase();

    if (
      lowercasePrompt.includes("stock") ||
      lowercasePrompt.includes("inventory")
    ) {
      return "Here's your current inventory status:\n\n• Total SKUs: 1,247\n• Low stock items: 12\n• Out of stock: 3\n• Total value: $2,847,293\n\nWould you like me to show you specific details for any category?";
    }

    if (
      lowercasePrompt.includes("sales") ||
      lowercasePrompt.includes("report")
    ) {
      return "📊 Sales Report Summary:\n\n• This month's revenue: $485,200\n• Total orders: 156\n• Best performing category: Electronics (45%)\n• Growth vs last month: +18%\n\nWould you like a detailed breakdown by product or time period?";
    }

    if (
      lowercasePrompt.includes("reorder") ||
      lowercasePrompt.includes("low")
    ) {
      return "🚨 Products requiring immediate attention:\n\n1. Standing Desk (TB-004) - Only 3 left\n2. Mechanical Keyboard (KB-002) - 8 units remaining\n3. Wireless Headphones (WH-001) - 15 units (high demand)\n\nShall I create purchase orders for these items?";
    }

    if (
      lowercasePrompt.includes("recommend") ||
      lowercasePrompt.includes("optimize")
    ) {
      return "🎯 My optimization recommendations:\n\n1. Increase Electronics inventory by 25% for Q1 season\n2. Consider bulk pricing with FurniCorp (potential 15% savings)\n3. Redistribute stock from WH-Central to WH-North for better efficiency\n4. Implement ABC analysis for better category management\n\nWould you like me to elaborate on any of these suggestions?";
    }

    return "I understand your question. Let me help you with that. As your AI assistant, I can provide insights on inventory management, generate reports, analyze trends, and suggest optimizations. Could you provide more specific details about what you'd like to know?";
  };

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t("quickActions")}
            </CardTitle>
            <CardDescription>{t("commonTasks")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleQuickAction(action.prompt)}
              >
                <div className="flex items-start gap-3">
                  <action.icon className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {t(action.title.replace(/\s/g, "").toLowerCase(), {
                        default: action.title,
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t(action.description.replace(/\s/g, "").toLowerCase(), {
                        default: action.description,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                {t("aiAssistantChat")}
              </CardTitle>
              <CardDescription>{t("askQuestions")}</CardDescription>
            </CardHeader>

            {/* Messages */}
            <CardContent className="flex-1 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.type === "assistant" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      message.type === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>

                  {message.type === "user" && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={t("askAnythingPlaceholder")}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {t("pressEnterOrQuickActions")}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
