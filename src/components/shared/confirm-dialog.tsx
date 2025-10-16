import React, { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPopup,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";

interface DialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (t: boolean) => void;
  handleConfirm: () => void;
  title: string;
  description: string;
  isLoading?: boolean;
}

const ConfirmDialog: FC<DialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  title,
  description,
  handleConfirm,
  isLoading = false,
}) => {
  const t = useTranslations("common");
  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
    >
      <DialogPopup className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            disabled={isLoading}
            onClick={() => setIsDialogOpen(false)}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? <>{t("wait")}</> : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
};

export default ConfirmDialog;
