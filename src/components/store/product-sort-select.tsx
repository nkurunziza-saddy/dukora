"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProductSortSelect() {
  const t = useTranslations("store");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const currentSort = searchParams.get("sortBy") || "name";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "") {
      params.set("sortBy", value);
    } else {
      params.delete("sortBy");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <Select onValueChange={handleSortChange} value={currentSort}>
      <SelectTrigger className="w-full md:w-48">
        <SelectValue className="capitalize" />
      </SelectTrigger>
      <SelectPopup>
        <SelectItem value="name">{t("sortByName")}</SelectItem>
        <SelectItem value="price">{t("sortByPrice")}</SelectItem>
        <SelectItem value="createdAt">{t("sortByNewest")}</SelectItem>
      </SelectPopup>
    </Select>
  );
}
