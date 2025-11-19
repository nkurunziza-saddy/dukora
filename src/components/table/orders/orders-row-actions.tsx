"use client";

import { EditIcon, MoreHorizontalIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { type FC } from "react";
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

export interface OrderRowActionsProps {
  order: SelectPurchaseOrder;
}

const OrdersRowActions: FC<OrderRowActionsProps> = ({ order }) => {
  const t = useTranslations();
  const t_common = useTranslations("common");

  return (
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
          <MenuSeparator />
          <MenuItem className="cursor-pointer">
            <EditIcon className="size-3.5" />
            {t("orders.toggleStatus")}
          </MenuItem>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
};

export default React.memo(OrdersRowActions);
