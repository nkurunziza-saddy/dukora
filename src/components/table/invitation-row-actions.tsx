"use client";

import React, { FC, useState } from "react";
import { MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import ConfirmDialog from "../shared/confirm-dialog";
import type { ExtendedInvitationPayload } from "@/lib/schema/schema-types";
import { useTranslations } from "next-intl";

export interface InvitationRowActionsProps {
  invitation: ExtendedInvitationPayload;
}

const InvitationRowActions: FC<InvitationRowActionsProps> = ({
  invitation,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("table");

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation.id }),
      });
      if (resp.status !== 204) {
        const message = await resp.json().catch(() => ({}));
        setIsLoading(false);
        return toast.error("Error deleting invitation", {
          description: `${message}`,
        });
      }
      setIsDeleteDialogOpen(false);
      return toast.success("Invitation deleted successfully.", {
        description: `${format(new Date(), "PPP")}`,
      });
    } catch (err) {
      console.error(err);
      return toast.error("Error deleting invitation", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("actions")}</DropdownMenuLabel>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        handleConfirm={handleDeleteConfirm}
        isLoading={isLoading}
        title={t("deleteInvitation")}
        description={t("deleteInvitationDesc")}
      />
    </>
  );
};

export default React.memo(InvitationRowActions);
