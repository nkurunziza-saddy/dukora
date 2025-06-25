import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DialogProps {
  children: React.ReactNode;
  isDialogOpen: boolean;
  setIsDialogOpen: (t: boolean) => void;
  title: string;
  description: string;
}

const UpdateDialog: FC<DialogProps> = ({
  children,
  isDialogOpen,
  setIsDialogOpen,
  title,
  description,
}) => {
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 px-1 overflow-auto">
          <div className="px-1 space-y-4">{children}</div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;
