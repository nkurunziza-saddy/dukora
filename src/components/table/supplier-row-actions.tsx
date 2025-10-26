"use client";

import { format } from "date-fns";
import { EditIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { type FC, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuTrigger,
} from "@/components/ui/menu";
import type { SelectSupplier } from "@/lib/schema/schema-types";
import SupplierForm from "../forms/create-supplier-form";
import { HoverPrefetchLink } from "../hover-prefetch-link";
import ConfirmDialog from "../shared/confirm-dialog";
import { StateDialog } from "../shared/reusable-form-dialog";

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
          render={<Button className="h-8 w-8 p-0" variant={"ghost"} />}
        >
          <span className="sr-only">{t_common("openMenu")}</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            <MenuGroupLabel>{t_common("actions")}</MenuGroupLabel>
            <MenuItem>
              <HoverPrefetchLink href={`/suppliers/${supplier.id}`}>
                {t("supplier.viewDetails")}
              </HoverPrefetchLink>
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              className="cursor-pointer"
              onClick={() => setIsUpdateDialogOpen(true)}
            >
              <EditIcon className="size-3.5" />
              {t_common("edit")}
            </MenuItem>
            <MenuItem
              className="cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(true)}
              variant="destructive"
            >
              <Trash2Icon className="size-3.5" />
              {t_common("delete")}
            </MenuItem>
          </MenuGroup>
        </MenuPopup>
      </Menu>

      <ConfirmDialog
        description={t("supplier.deleteDialogDescription")}
        handleConfirm={handleDeleteConfirm}
        isDialogOpen={isDeleteDialogOpen}
        isLoading={isLoading}
        setIsDialogOpen={setIsDeleteDialogOpen}
        title={t("supplier.deleteDialogTitle")}
      />
      <StateDialog
        description={t("supplier.editDialogDescription")}
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
        title={t("supplier.editDialogTitle")}
      >
        <SupplierForm supplier={supplier} />
      </StateDialog>
    </>
  );
};

export default React.memo(SupplierRowActions);
