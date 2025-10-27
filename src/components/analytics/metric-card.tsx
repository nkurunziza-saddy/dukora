"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  isLoading?: boolean;
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  isLoading = false,
  className,
}: MetricCardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <div className="h-4 w-24 bg-muted rounded" />
        </CardHeader>
        <CardPanel>
          <div className="h-8 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-20 bg-muted rounded" />
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all hover:shadow-sm", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardPanel>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{value}</span>
            {trendValue && (
              <span className={cn("text-sm", getTrendColor())}>
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </div>
      </CardPanel>
    </Card>
  );
}
