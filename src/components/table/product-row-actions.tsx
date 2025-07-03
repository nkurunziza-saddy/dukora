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
import { SelectProduct } from "@/lib/schema/schema-types";
import ProductForm from "../forms/create-product-form";
import { StateDialog } from "@/components/shared/reusable-form-dialog";
import { useTranslations } from "next-intl";

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
      if (resp.status !== 204) {
        const message = await resp.json().catch(() => ({}));
        setIsLoading(false);
        return toast.error(t("product.deleteError"), {
          description: `${message}`,
        });
      }
      setIsDeleteDialogOpen(false);
      return toast.success(t("product.deleteSuccess"), {
        description: `${format(new Date(), "PPP")}`,
      });
    } catch (err) {
      console.error(err);
      return toast.error(t("product.deleteError"), {
        description:
          err instanceof Error ? err.message : t_common("unexpectedErrorOccurred"),
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
            onClick={() => navigator.clipboard.writeText(product.id)}
          >
            {t("product.copyId")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/products/${product.id}`} prefetch>
              {t("product.viewDetails")}
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
