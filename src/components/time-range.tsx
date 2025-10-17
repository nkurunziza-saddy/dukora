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

export function TimeRange() {
  const [timeRange, setTimeRange] = useState("1");
  const router = useRouter();
  const t = useTranslations("timeRange");

  useEffect(() => {
    router.push(`/analytics/?t=${timeRange}`);
  }, [timeRange, router]);

  return (
    <Select value={timeRange} onValueChange={setTimeRange}>
      <SelectTrigger
        className="w-[160px] rounded-lg sm:ml-auto"
        aria-label={t("selectTimeRange")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectPopup className="rounded-xl">
        <SelectItem value="1" className="rounded-lg">
          {t("lastMonth")}
        </SelectItem>
        <SelectItem value="2" className="rounded-lg">
          {t("last2Months")}
        </SelectItem>
        <SelectItem value="3" className="rounded-lg">
          {t("last3Months")}
        </SelectItem>
      </SelectPopup>
    </Select>
  );
}
