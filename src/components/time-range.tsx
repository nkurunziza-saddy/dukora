"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAvailableMonthsForAnalytics } from "@/server/helpers/time-date-forrmatters";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "./ui/skeleton";
import type { SessionSession } from "@/lib/auth";

interface TimeRangeProps {
  currentValue?: string;
  session?: SessionSession;
}

export function TimeRange({ currentValue = "0", session }: TimeRangeProps) {
  const [timeRange, setTimeRange] = useState(currentValue);

  const router = useRouter();
  const t = useTranslations("timeRange");
  if (!session) {
    return null;
  }
  const {
    data: availableMonths,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["available-months"],
    queryFn: () => getAvailableMonthsForAnalytics(session.user.businessId!),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && availableMonths && availableMonths.length > 0) {
      router.push(`/analytics/?t=${timeRange}`);
    }
  }, [timeRange, router, isLoading, availableMonths]);

  if (isLoading) {
    return <Skeleton className="h-10 w-40 rounded-lg sm:ml-auto" />;
  }
  if (error) {
    return null;
  }

  if (availableMonths && availableMonths.length === 0) {
    return (
      <Select value={timeRange} onValueChange={setTimeRange} disabled>
        <SelectTrigger
          className="w-40 rounded-lg sm:ml-auto"
          aria-label={t("selectTimeRange")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectPopup className="rounded-xl">
          <SelectItem value="0" className="rounded-lg">
            {t("noDataAvailable")}
          </SelectItem>
        </SelectPopup>
      </Select>
    );
  }

  return (
    <Select
      value={timeRange}
      onValueChange={setTimeRange}
      items={availableMonths!.map((p) => ({
        value: p.value.toString(),
        label: p.label,
      }))}
    >
      <SelectTrigger
        className="w-40 rounded-lg sm:ml-auto"
        aria-label={t("selectTimeRange")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectPopup className="rounded-xl">
        {availableMonths!.map((month) => (
          <SelectItem
            key={month.value}
            value={month.value.toString()}
            className="rounded-lg"
          >
            {month.label}
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
