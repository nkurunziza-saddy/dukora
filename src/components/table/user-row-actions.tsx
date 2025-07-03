"use client";

import React, { FC, useState } from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";
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
  const t = useTranslations("user");
  const t_common = useTranslations("common");

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id }),
      });
      if (resp.status !== 204) {
        const message = await resp.json().catch(() => ({}));
        setIsLoading(false);
        return toast.error(t("errorDeletingUser"), {
          description: `${message}`,
        });
      }
      setIsDeleteDialogOpen(false);
      return toast.success(t("userDeletedSuccessfully"), {
        description: `${format(new Date(), "PPP")}`,
      });
    } catch (err) {
      console.error(err);
      return toast.error(t("errorDeletingUser"), {
        description:
          err instanceof Error ? err.message : t("unexpectedErrorOccurred"),
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
            <span className="sr-only">{t_common("openMenu")}</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t_common("actions")}</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(user.id)}
          >
            {t_common("copyUserId")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/users/${user.id}`} prefetch>
              {t_common("viewUserDetails")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsUpdateDialogOpen(true)}
            className="cursor-pointer"
          >
            <Edit className="mr-2 h-4 w-4" />
            {t_common("edit")}
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="cursor-pointer"
          >
            <Trash className="mr-2 h-4 w-4" />
            {t_common("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
