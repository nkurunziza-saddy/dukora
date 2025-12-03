"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";

export const LANGUAGE_ITEMS = [
  {
    value: "en",
    label: "English",
  },
  {
    value: "fr",
    label: "Français",
  },
  {
    value: "sw",
    label: "Kiswahili",
  },
  {
    value: "rw",
    label: "Kinyarwanda",
  },
];

export default function LocaleSwitcher() {
  const id = useId();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocaleChange = (value: unknown) => {
    if (typeof value !== "string") return;
    const newLocale = value;
    const newPath = (pathname ?? "").replace(`/${locale}`, `/${newLocale}`);
    router.replace(newPath);
  };

  if (!mounted) {
    return (
      <fieldset className="space-y-4">
        <legend className="text-foreground text-sm leading-none font-medium">
          Choose language
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGE_ITEMS.map((item) => (
            <div className="animate-pulse" key={item.value}>
              <div className="h-16 bg-muted rounded-md" />
              <div className="mt-2 h-4 bg-muted rounded w-16" />
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      <RadioGroup
        className="flex flex-wrap gap-2"
        onValueChange={handleLocaleChange}
        value={locale}
      >
        {LANGUAGE_ITEMS.map((item) => (
          <div
            className="border-input has-checked:border-primary/50 has-checked:bg-accent/50 relative flex flex-col items-center gap-3 rounded-md border p-3 shadow-xs outline-none transition-colors hover:bg-accent/30"
            key={`${id}-${item.value}`}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                className="after:absolute after:inset-0"
                id={`${id}-${item.value}`}
                value={item.value}
              />
              <Label
                className="text-xs font-medium cursor-pointer"
                htmlFor={`${id}-${item.value}`}
              >
                {item.label}
              </Label>
            </div>
          </div>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
