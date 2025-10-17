"use client";

import { CheckIcon, MinusIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const themeItems = [
  { value: "light", label: "Light", image: "/ui-light.png" },
  { value: "dark", label: "Dark", image: "/ui-dark.png" },
  { value: "system", label: "System", image: "/ui-system.png" },
];

export function ThemeSwitcher() {
  const id = useId();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <fieldset className="space-y-4">
        <legend className="text-foreground text-sm leading-none font-medium">
          Choose a theme
        </legend>
        <div className="flex gap-3">
          {themeItems.map((item) => (
            <div key={item.value} className="animate-pulse">
              <div className="w-[88px] h-[70px] bg-muted rounded-md" />
              <div className="mt-2 h-4 bg-muted rounded w-12" />
            </div>
          ))}
        </div>
      </fieldset>
    );
  }

  return (
    <fieldset className="space-y-4">
      {/* <legend className="text-foreground text-sm leading-none font-medium">
        Choose a theme
      </legend> */}
      <RadioGroup
        className="flex gap-3"
        value={theme}
        onValueChange={(value: unknown, _eventDetails) =>
          setTheme(value as string)
        }
      >
        {themeItems.map((item) => (
          <label key={`${id}-${item.value}`} className="cursor-pointer">
            <RadioGroupItem
              id={`${id}-${item.value}`}
              value={item.value}
              className="peer sr-only after:absolute after:inset-0"
            />
            <Image
              src={item.image || "/placeholder.svg"}
              alt={`${item.label} theme preview`}
              width={88}
              height={70}
              className="border-input peer-focus-visible:ring-ring/50 peer-data-[state=checked]:border-ring peer-data-[state=checked]:bg-accent relative cursor-pointer overflow-hidden rounded-md border shadow-xs transition-[color,box-shadow] outline-none peer-focus-visible:ring-[3px] peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-50"
            />
            <span className="group peer-data-[state=unchecked]:text-muted-foreground/70 mt-2 flex items-center gap-1">
              <CheckIcon
                size={16}
                className="group-peer-data-[state=unchecked]:hidden text-primary"
                aria-hidden="true"
              />
              <MinusIcon
                size={16}
                className="group-peer-data-[state=checked]:hidden"
                aria-hidden="true"
              />
              <span className="text-xs font-medium">{item.label}</span>
            </span>
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
