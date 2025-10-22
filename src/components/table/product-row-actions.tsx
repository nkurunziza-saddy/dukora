"use client";

import { format } from "date-fns";
import { EditIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { type FC, useState } from "react";
import { toast } from "sonner";
import { StateDialog } from "@/components/shared/reusable-form-dialog";
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
import type { SelectProduct } from "@/lib/schema/schema-types";
import ProductForm from "../forms/create-product-form";
import ConfirmDialog from "../shared/confirm-dialog";

export interface ProductRowActionsProps {
  product: SelectProduct;
}

const ProductRowActions: FC<ProductRowActionsProps> = ({ product }) => {
  const t = useTranslations();
  const t_common = useTranslations("common");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });
      const r = await resp.json();
      if (r.success) {
        setIsDeleteDialogOpen(false);
        toast.success(t("product.deleteSuccess"), {
          description: `${format(new Date(), "PPP")}`,
        });
        return;
      }

      setIsLoading(false);
      toast.error(t("product.deleteError"), {
        description: `${t}`,
      });
    } catch (err) {
      console.error(err);
      return toast.error(t("product.deleteError"), {
        description:
          err instanceof Error
            ? err.message
            : t_common("unexpectedErrorOccurred"),
      });
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
          <MoreHorizontalIcon className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            <MenuGroupLabel>{t_common("actions")}</MenuGroupLabel>

            <MenuItem>
              <Link href={`/products/${product.id}`} prefetch>
                {t("product.viewDetails")}
              </Link>
            </MenuItem>
            <MenuSeparator />
            <MenuItem
              onClick={() => setIsUpdateDialogOpen(true)}
              className="cursor-pointer"
            >
              <EditIcon className="size-3.5" />
              {t_common("edit")}
            </MenuItem>
            <MenuItem
              variant="destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="cursor-pointer"
            >
              <Trash2Icon className="size-3.5" />
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
        title={t("product.deleteDialogTitle")}
        description={t("product.deleteDialogDescription")}
      />
      <StateDialog
        title={t("product.editDialogTitle")}
        description={t("product.editDialogDescription")}
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
      >
        <ProductForm product={product} />
      </StateDialog>
    </>
  );
};

export default React.memo(ProductRowActions);
