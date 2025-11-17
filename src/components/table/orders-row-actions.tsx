"use client";

import { format } from "date-fns";
import { EditIcon, MoreHorizontalIcon, Trash2Icon } from "lucide-react";
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
import type { SelectPurchaseOrder } from "@/lib/schema/schema-types";
import OrderForm from "../forms/create-order-form";
import { HoverPrefetchLink } from "../hover-prefetch-link";
import ConfirmDialog from "../shared/confirm-dialog";

export interface OrderRowActionsProps {
  order: SelectPurchaseOrder;
}

const OrdersRowActions: FC<OrderRowActionsProps> = ({ order }) => {
  const t = useTranslations();
  const t_common = useTranslations("common");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.id }),
      });
      const r = await resp.json();
      if (r.success) {
        setIsDeleteDialogOpen(false);
        toast.success(t("order.deleteSuccess"), {
          description: `${format(new Date(), "PPP")}`,
        });
        return;
      }

      setIsLoading(false);
      toast.error(t("order.deleteError"), {
        description: `${t}`,
      });
    } catch (err) {
      console.error(err);
      return toast.error(t("order.deleteError"), {
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
          render={<Button className="h-8 w-8 p-0" variant={"ghost"} />}
        >
          <span className="sr-only">{t_common("openMenu")}</span>
          <MoreHorizontalIcon className="h-4 w-4" />
        </MenuTrigger>
        <MenuPopup align="end">
          <MenuGroup>
            <MenuGroupLabel>{t_common("actions")}</MenuGroupLabel>

            <MenuItem>
              <HoverPrefetchLink href={`/orders/${order.id}`}>
                {t("order.viewDetails")}
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
        description={t("order.deleteDialogDescription")}
        handleConfirm={handleDeleteConfirm}
        isDialogOpen={isDeleteDialogOpen}
        isLoading={isLoading}
        setIsDialogOpen={setIsDeleteDialogOpen}
        title={t("order.deleteDialogTitle")}
      />
      <StateDialog
        description={t("order.editDialogDescription")}
        isDialogOpen={isUpdateDialogOpen}
        setIsDialogOpen={setIsUpdateDialogOpen}
        title={t("order.editDialogTitle")}
      >
        <OrderForm order={order} />
      </StateDialog>
    </>
  );
};

export default React.memo(OrdersRowActions);
