"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface MetricItem {
  label: string;
  value: string;
  category: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

interface MetricsTableProps {
  metrics: MetricItem[];
  title: string;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

export function MetricsTable({
  metrics,
  isLoading = false,
}: MetricsTableProps) {
  const t = useTranslations("analytics");

  if (isLoading) {
    return (
      <div className="space-y-2 p-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            className="flex justify-between items-center"
            key={`skeleton-row-${i}-${Math.random()}`}
          >
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="">{t("metric")}</TableHead>
            <TableHead className="">{t("category")}</TableHead>
            <TableHead className="text-right ">{t("value")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric, index) => (
            <TableRow
              className={cn(
                "hover:bg-muted/50 transition-colors",
                index % 2 === 0 ? "bg-background" : "bg-muted/20"
              )}
              key={metric.label}
            >
              <TableCell className="font-medium">
                <div>
                  <span>{metric.label}</span>
                  {metric.description && (
                    <p className="text-xs text-muted-foreground">
                      {metric.description}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell className="">
                <Badge className="font-medium" variant="secondary">
                  {metric.category}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {metric.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
