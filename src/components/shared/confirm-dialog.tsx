import { useTranslations } from "next-intl";
import type { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";

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
      onOpenChange={(open) => {
        setIsDialogOpen(open);
      }}
      open={isDialogOpen}
    >
      <DialogPopup className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            disabled={isLoading}
            onClick={() => setIsDialogOpen(false)}
            variant="outline"
          >
            {t("cancel")}
          </Button>
          <Button
            className="min-w-[100px]"
            disabled={isLoading}
            onClick={handleConfirm}
          >
            {isLoading ? t("wait") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
};

export default ConfirmDialog;
