import { memo } from "react";

const TypingIndicator = memo(() => {
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
});

TypingIndicator.displayName = "TypingIndicator";
export { TypingIndicator };
