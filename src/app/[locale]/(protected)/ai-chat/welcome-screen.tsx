import { Brain, MessageSquare, Sparkles, Zap } from "lucide-react";
import { memo } from "react";

const WelcomeScreen = memo(
  ({
    onSuggestionClick,
  }: {
    onSuggestionClick: (suggestion: string) => void;
  }) => {
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
          <h1 className="text-2xl font-bold mb-2">
            Welcome to your AI Assistant
          </h1>
          <p className="text-muted-foreground">
            Start a conversation or try one of these suggestions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mb-8">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.title}
              onClick={() => onSuggestionClick(suggestion.description)}
              className="p-4 text-left border rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-start gap-3">
                <div className="text-primary group-hover:scale-110 transition-transform">
                  {suggestion.icon}
                </div>
                <div>
                  <h3 className="font-medium text-sm mb-1">
                    {suggestion.title}
                  </h3>
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
  },
);

WelcomeScreen.displayName = "WelcomeScreen";

export { WelcomeScreen };
