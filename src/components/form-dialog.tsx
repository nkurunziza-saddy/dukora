import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Plus } from "lucide-react";

export function FormDialog({
  children,
  title,
  triggerText,
  description,
  outline = false,
  big = false,
}: {
  children: React.ReactNode;
  title: string;
  triggerText?: string;
  description: string;
  outline?: boolean;
  big?: boolean;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          {...(big ? { size: "lg" } : { size: "sm" })}
          {...(outline ? { variant: "secondary" } : {})}
        >
          <Plus className="w-4 h-4 mr-2 " />
          {triggerText ?? title}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}
      </DialogContent>
    </Dialog>
  );
}
