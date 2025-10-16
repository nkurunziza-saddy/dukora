"use client";

import React, { FC, useState } from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuTrigger,
  MenuPopup,
  MenuItem,
  MenuSeparator,
  MenuGroupLabel,
  MenuGroup,
} from "@/components/ui/menu";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import ConfirmDialog from "../shared/confirm-dialog";
import { SelectUser } from "@/lib/schema/schema-types";
import { StateDialog } from "../shared/reusable-form-dialog";
import { UpdateUserForm } from "../forms/update-user-form";
import { useTranslations } from "next-intl";

export interface UserRowActionsProps {
  user: SelectUser;
}

const UserRowActions: FC<UserRowActionsProps> = ({ user }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("users");
  const t_common = useTranslations("common");

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      const r = await resp.json();
      if (r.success) {
        setIsDeleteDialogOpen(false);
        toast.success(t("userDeletedSuccessfully"), {
          description: `${format(new Date(), "PPP")}`,
        });
        return;
      }

      const message = await resp.json().catch(() => ({}));
      setIsLoading(false);
      toast.error(t("errorDeletingUser"), {
        description: `${message}`,
      });
      return;
    } catch (err) {
      console.error(err);
      toast.error(t("errorDeletingUser"), {
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
          render={<Button variant="ghost" className="h-8 w-8 p-0" />}
        >
          <span className="sr-only">{t_common("openMenu")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            <MenuGroupLabel>{t_common("actions")}</MenuGroupLabel>
            <MenuItem onClick={() => navigator.clipboard.writeText(user.id)}>
              {t_common("copyUserId")}
            </MenuItem>
            <MenuSeparator />
            <MenuItem>
              <Link href={`/users/${user.id}`} prefetch>
                {t_common("viewUserDetails")}
              </Link>
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onClick={() => setIsUpdateDialogOpen(true)}
              className="cursor-pointer"
            >
              <Edit className="mr-2 h-4 w-4" />
              {t_common("edit")}
            </MenuItem>
            <MenuItem
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer"
            >
              <Trash className="mr-2 h-4 w-4" />
              {t_common("delete")}
            </MenuItem>
          </MenuGroup>
        </MenuPopup>
      </Menu>

      <ConfirmDialog
        isDialogOpen={isDeleteDialogOpen}
        setIsDialogOpen={setIsDeleteDialogOpen}
        handleConfirm={handleDeleteConfirm}
        isLoading={isLoading}
        title={t_common("deleteUser")}
        description={t_common("areYouSureYouWantToDeleteThisUser")}
      />
      <StateDialog
        title={t_common("editUser")}
        description={t_common("updateTheDetailsOfTheSelectedUser")}
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
      >
        <UpdateUserForm user={user} />
      </StateDialog>
    </>
  );
};

export default React.memo(UserRowActions);
