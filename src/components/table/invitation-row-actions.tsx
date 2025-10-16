"use client";

import React, { FC, useState } from "react";
import { MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuGroup,
  MenuGroupLabel,
} from "@/components/ui/menu";
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
  const t_invitation = useTranslations("invitation");
  const t_common = useTranslations("common");

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invitation.id }),
      });
      const r = await resp.json();
      if (r.success) {
        setIsDeleteDialogOpen(false);
        toast.success(t_invitation("deleteSuccess"), {
          description: `${format(new Date(), "PPP")}`,
        });
        return;
      }

      const message = await resp.json().catch(() => ({}));
      setIsLoading(false);
      toast.error(t_invitation("deleteError"), {
        description: `${message}`,
      });
      return;
    } catch (err) {
      console.error(err);
      toast.error(t_invitation("deleteError"), {
        description:
          err instanceof Error
            ? err.message
            : t_common("unexpectedErrorOccurred"),
      });
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Menu>
        <MenuTrigger
          render={<Button variant={"ghost"} className="h-8 w-8 p-0" />}
        >
          <span className="sr-only">{t_common("openMenu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            <MenuGroupLabel>{t("actions")}</MenuGroupLabel>

            <MenuItem
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t("delete")}
            </MenuItem>
          </MenuGroup>
        </MenuPopup>
      </Menu>

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
