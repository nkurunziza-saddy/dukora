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
import { SelectSupplier } from "@/lib/schema/schema-types";
import SupplierForm from "../forms/create-supplier-form";
import { StateDialog } from "../shared/reusable-form-dialog";
import { useTranslations } from "next-intl";

export interface SupplierRowActionsProps {
  supplier: SelectSupplier;
}

const SupplierRowActions: FC<SupplierRowActionsProps> = ({ supplier }) => {
  const t = useTranslations();
  const t_common = useTranslations("common");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/suppliers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: supplier.id }),
      });
      const r = await resp.json();
      if (r.success) {
        setIsDeleteDialogOpen(false);
        toast.success(t("supplier.deleteSuccess"), {
          description: `${format(new Date(), "PPP")}`,
        });
        return;
      }

      const message = await resp.json().catch(() => ({}));
      setIsLoading(false);
      toast.error(t("supplier.deleteError"), {
        description: `${message}`,
      });
      return;
    } catch (err) {
      console.error(err);
      toast.error(t("supplier.deleteError"), {
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
            <MenuGroupLabel>{t_common("actions")}</MenuGroupLabel>
            <MenuItem>
              <Link href={`/suppliers/${supplier.id}`} prefetch>
                {t("supplier.viewDetails")}
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
        title={t("supplier.deleteDialogTitle")}
        description={t("supplier.deleteDialogDescription")}
      />
      <StateDialog
        title={t("supplier.editDialogTitle")}
        description={t("supplier.editDialogDescription")}
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
      >
        <SupplierForm supplier={supplier} />
      </StateDialog>
    </>
  );
};

export default React.memo(SupplierRowActions);
