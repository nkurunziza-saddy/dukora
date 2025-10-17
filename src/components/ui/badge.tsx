import { mergeProps } from "@base-ui-components/react/merge-props";
import { useRender } from "@base-ui-components/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-1 rounded-sm border border-transparent font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3 [button,a&]:cursor-pointer [button,a&]:pointer-coarse:after:absolute [button,a&]:pointer-coarse:after:size-full [button,a&]:pointer-coarse:after:min-h-11 [button,a&]:pointer-coarse:after:min-w-11",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground [button,a&]:hover:bg-primary/90",
        outline:
          "border-border bg-background dark:bg-input/32 [button,a&]:hover:bg-accent/50 dark:[button,a&]:hover:bg-input/48",
        secondary:
          "bg-secondary text-secondary-foreground [button,a&]:hover:bg-secondary/90",
        info: "bg-info/8 text-info-foreground dark:bg-info/16",
        success: "bg-success/8 text-success-foreground dark:bg-success/16",
        warning: "bg-warning/8 text-warning-foreground dark:bg-warning/16",
        error:
          "bg-destructive/8 text-destructive-foreground dark:bg-destructive/16",
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
      size: {
        default: "px-[calc(--spacing(1)-1px)] text-xs",
        sm: "rounded-[calc(var(--radius-sm)-2px)] px-[calc(--spacing(1)-1px)] text-[.625rem]",
        lg: "px-[calc(--spacing(1.5)-1px)] text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface BadgeProps extends useRender.ComponentProps<"span"> {
  variant?: VariantProps<typeof badgeVariants>["variant"];
  size?: VariantProps<typeof badgeVariants>["size"];
}

function Badge({ className, variant, size, render, ...props }: BadgeProps) {
  const defaultProps = {
    "data-slot": "badge",
    className: cn(badgeVariants({ variant, size, className })),
  };

  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(defaultProps, props),
  });
}

export { Badge, badgeVariants };
