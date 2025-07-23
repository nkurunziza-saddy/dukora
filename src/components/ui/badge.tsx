import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        green:
          "bg-green-50 text-green-800 ring-0 ring-green-600/20 dark:bg-green-900/40 backdrop-blur-sm dark:text-green-200 dark:ring-green-400/20",
        blue: "bg-blue-50 text-blue-800 ring-0 ring-inset ring-blue-600/20 dark:bg-blue-900/40 backdrop-blur-sm dark:text-blue-200 dark:ring-blue-400/20",
        teal: "bg-teal-50 text-teal-800 ring-0 ring-inset ring-teal-600/20 dark:bg-teal-900/40 backdrop-blur-sm dark:text-teal-200 dark:ring-teal-400/20",
        yellow:
          "bg-yellow-50 text-yellow-800 ring-0 ring-inset ring-yellow-600/20 dark:bg-yellow-900/40 backdrop-blur-sm dark:text-yellow-200 dark:ring-yellow-400/20",
        orange:
          "bg-orange-50 text-orange-800 ring-0 ring-inset ring-orange-600/20 dark:bg-orange-900/40 backdrop-blur-sm dark:text-orange-200 dark:ring-orange-400/20",
        purple:
          "bg-purple-50 text-purple-800 ring-0 ring-inset ring-purple-600/20 dark:bg-purple-900/40 backdrop-blur-sm dark:text-purple-200 dark:ring-purple-400/20",
        red: "bg-red-50 text-red-800 ring-0 ring-inset ring-red-600/20 dark:bg-red-900/40 backdrop-blur-sm dark:text-red-200 dark:ring-red-400/20",
        redStrong:
          "bg-red-50 text-red-900 ring-0 ring-inset ring-red-600/20 dark:bg-red-900/40 backdrop-blur-sm dark:text-red-300 dark:ring-red-400/20",
        pink: "bg-pink-50 text-pink-800 ring-0 ring-inset ring-pink-600/20 dark:bg-pink-900/40 backdrop-blur-sm dark:text-pink-200 dark:ring-pink-400/20",
        indigo:
          "bg-indigo-50 text-indigo-800 ring-0 ring-inset ring-indigo-600/20 dark:bg-indigo-900/40 backdrop-blur-sm dark:text-indigo-200 dark:ring-indigo-400/20",
        gray: "bg-gray-50 text-gray-800 ring-0 ring-inset ring-gray-600/20 dark:bg-gray-900/40 backdrop-blur-sm dark:text-gray-200 dark:ring-gray-400/20",
        grayStrong:
          "bg-gray-50 text-gray-700 ring-0 ring-inset ring-gray-600/20 dark:bg-gray-900/40 backdrop-blur-sm dark:text-gray-300 dark:ring-gray-400/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
