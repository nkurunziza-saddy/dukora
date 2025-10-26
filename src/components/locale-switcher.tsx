"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect, useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "./ui/label";

const languageItems = [
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
  // const t = useTranslations("common");
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
          {languageItems.map((item) => (
            <div key={item.value} className="animate-pulse">
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
        value={locale}
        onValueChange={handleLocaleChange}
      >
        {languageItems.map((item) => (
          <div
            key={`${id}-${item.value}`}
            className="border-input has-checked:border-primary/50 has-checked:bg-accent/50 relative flex flex-col items-center gap-3 rounded-md border p-3 shadow-xs outline-none transition-colors hover:bg-accent/30"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem
                id={`${id}-${item.value}`}
                value={item.value}
                className="after:absolute after:inset-0"
              />
              <Label
                htmlFor={`${id}-${item.value}`}
                className="text-xs font-medium cursor-pointer"
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
