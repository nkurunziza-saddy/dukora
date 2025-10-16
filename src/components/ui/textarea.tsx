import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"textarea"> & {
  size?: "sm" | "default" | "lg" | number
}) {
  return (
    <span
      data-slot="textarea-control"
      className={cn(
        "relative inline-flex w-full rounded-lg border border-input bg-background bg-clip-padding text-base ring-ring/24 transition-[color,background-color,box-shadow,border-color] before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] not-has-disabled:before:shadow-sm has-focus-visible:border-ring has-focus-visible:ring-[3px] has-disabled:opacity-64 has-aria-invalid:border-destructive/36 has-aria-invalid:before:shadow-none has-focus-visible:has-aria-invalid:border-destructive/64 has-focus-visible:has-aria-invalid:ring-destructive/16 sm:text-sm dark:bg-input/32 dark:bg-clip-border dark:shadow-black/24 dark:not-has-disabled:shadow-sm dark:not-has-disabled:before:shadow-[0_-1px_--theme(--color-white/8%)] dark:has-aria-invalid:ring-destructive/24",
        className
      )}
    >
      <textarea
        data-slot="textarea"
        className={cn(
          "field-sizing-content min-h-17.5 w-full rounded-[inherit] px-[calc(--spacing(3)-1px)] py-[calc(--spacing(1.5)-1px)] outline-none max-sm:min-h-20.5",
          size === "sm" &&
            "min-h-16.5 px-[calc(--spacing(2.5)-1px)] py-[calc(--spacing(1)-1px)] max-sm:min-h-19.5",
          size === "lg" &&
            "min-h-18.5 py-[calc(--spacing(2)-1px)] max-sm:min-h-21.5"
        )}
        {...props}
      />
    </span>
  )
}

export { Textarea }
