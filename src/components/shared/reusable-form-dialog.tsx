import { PlusIcon } from "lucide-react";
import type React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function TriggerDialog({
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
      <DialogTrigger
        render={
          <Button
            {...(big ? { size: "lg" } : { size: "sm" })}
            {...(outline ? { variant: "secondary" } : {})}
          />
        }
      >
        <PlusIcon />
        {triggerText ?? title}
      </DialogTrigger>
      <DialogPopup className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          <div className="pr-1">{children}</div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}

export function StateDialog({
  children,
  title,
  description,
  setIsDialogOpen,
  isDialogOpen,
  className = "",
}: {
  children: React.ReactNode;
  title: string;
  description: string;
  setIsDialogOpen: (t: boolean) => void;
  isDialogOpen: boolean;
  className?: string;
}) {
  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <DialogPopup
        className={cn("sm:max-w-5xl max-h-[90vh] flex flex-col", className)}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto">
          <div className="pr-1">{children}</div>
        </div>
      </DialogPopup>
    </Dialog>
  );
}
