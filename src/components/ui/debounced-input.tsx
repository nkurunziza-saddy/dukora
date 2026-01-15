"use client";

import { type InputHTMLAttributes, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface DebouncedInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
}

/**
 * Input component with debounced onChange callback.
 * Provides immediate UI feedback while delaying external updates.
 */
export function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 300,
  className,
  ...props
}: DebouncedInputProps) {
  const [value, setValue] = useState<string | number>(initialValue);

  // Sync with external value changes
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // Debounce the onChange callback
  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, debounce, onChange]);

  return (
    <input
      {...props}
      className={cn(
        "w-[120px] rounded-lg border border-input bg-background text-base/5 ring-ring/24",
        "has-focus-visible:border-ring has-focus-visible:ring-[3px]",
        "h-7 px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)]",
        "outline-none placeholder:text-muted-foreground/64",
        "sm:text-sm dark:bg-input/32 outline-0 shadow-none",
        "sm:w-[150px] lg:w-[250px]",
        className,
      )}
      value={value ?? ""}
      onChange={(e) => {
        if (e.target.value === "") {
          setValue("");
          return;
        }
        if (props.type === "number") {
          setValue(e.target.valueAsNumber);
        } else {
          setValue(e.target.value);
        }
      }}
    />
  );
}
