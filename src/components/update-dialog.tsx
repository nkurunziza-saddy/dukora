import React, { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default UpdateDialog;
