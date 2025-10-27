"use client";

import { cn } from "@/lib/utils";

interface SuggestionCardProps {
  title: string;
  description: string;
  onClick: () => void;
  className?: string;
}

export function SuggestionCard({
  title,
  description,
  onClick,
  className,
}: SuggestionCardProps) {
  return (
    <button
      className={cn(
        "w-full p-4 text-left border rounded-lg hover:bg-muted/50 transition-all duration-200 group cursor-pointer",
        "hover:border-muted-foreground/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-muted-foreground/20",
        "active:scale-[0.98] active:transition-transform",
        className
      )}
      onClick={onClick}
      type="button"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-medium text-sm mb-1 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
