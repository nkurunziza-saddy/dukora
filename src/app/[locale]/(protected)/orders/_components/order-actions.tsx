"use client";

import { EyeIcon, MoreHorizontalIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";

interface OrderActionsProps {
  order: {
    id: string;
    orderNumber: string;
    status: string;
  };
}

export function OrderActions({ order }: OrderActionsProps) {
  const t = useTranslations("orders");

  return (
    <Menu>
      <MenuTrigger render={<Button size="icon" variant="ghost" />}>
        <MoreHorizontalIcon className="h-4 w-4" />
      </MenuTrigger>
      <MenuPopup align="end">
        <MenuItem render={<Link href={`/orders/${order.id}`} />}>
          <EyeIcon className="mr-2 h-4 w-4" />
          {t("viewDetails")}
        </MenuItem>
      </MenuPopup>
    </Menu>
  );
}
