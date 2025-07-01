"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingCart,
  Plus,
  Users,
  Settings,
  FileText,
} from "lucide-react";
import { useTranslations } from "next-intl";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import CreateProductForm from "./forms/create-product-form";
import PurchaseTransactionForm from "@/components/forms/purchase-transaction-form";
import SupplierForm from "@/components/forms/create-supplier-form";
import { Button } from "./ui/button";
import SaleTransactionForm from "./forms/sale-transaction-form";
import { StateDialog } from "./shared/reusable-form-dialog";
import ExpenseTransactionForm from "./forms/expense-transaction-form";
import AnyTransactionForm from "./forms/create-any-transaction-form";

export default function QuickActions() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const t = useTranslations("quickActions");

  const [productDialogOpen, setProductDialogOpen] = React.useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = React.useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = React.useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] =
    React.useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }

      if (e.key === "p" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setProductDialogOpen(true);
      }

      if (e.key === "s" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setSupplierDialogOpen(true);
      }

      if (e.key === "t" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setSaleDialogOpen(true);
      }
      if (e.key === "b" && (e.metaKey || e.ctrlKey) && e.shiftKey) {
        e.preventDefault();
        setPurchaseDialogOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleNavigation = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const handleDialogAction = (action: string) => {
    setOpen(false);

    switch (action) {
      case "create-product":
        setProductDialogOpen(true);
        break;
      case "create-supplier":
        setSupplierDialogOpen(true);
        break;
      case "record-sale":
        setSaleDialogOpen(true);
        break;
      case "record-purchase":
        setPurchaseDialogOpen(true);
        break;
      case "record-expense":
        setExpenseDialogOpen(true);
        break;
      case "record-transaction":
        setTransactionDialogOpen(true);
        break;
    }
  };

  return (
    <>
      <Button size="sm" variant={"secondary"} onClick={() => setOpen(true)}>
        <span className="flex grow items-center">
          <span className="text-muted-foreground/70 font-normal group-hover:text-foreground transition-colors">
            {t("quickActions")}
          </span>
        </span>
        <kbd className="bg-background text-muted-foreground/70 ms-8 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("searchActionsPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("noResultsFound")}</CommandEmpty>

          <CommandGroup heading={t("quickActionsGroup")}>
            <CommandItem onSelect={() => handleDialogAction("create-product")}>
              <Package size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("createNewProduct")}</span>
              <CommandShortcut className="justify-center">⇧⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("create-supplier")}>
              <ShoppingCart
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>{t("createNewSupplier")}</span>
              <CommandShortcut className="justify-center">⇧⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("record-sale")}>
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("recordSaleTransaction")}</span>
              <CommandShortcut className="justify-center">⇧⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("record-purchase")}>
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("recordPurchaseTransaction")}</span>
              <CommandShortcut className="justify-center">⇧⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("record-expense")}>
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("recordExpenseTransaction")}</span>
              <CommandShortcut className="justify-center">⇧⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => handleDialogAction("record-transaction")}
            >
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("recordAnyTransaction")}</span>
              <CommandShortcut className="justify-center">⇧⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading={t("managementGroup")}>
            <CommandItem onSelect={() => handleNavigation("/categories")}>
              <FileText size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("productCategories")}</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/suppliers")}>
              <Users size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("supplierManagement")}</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/settings")}>
              <Settings size={16} className="opacity-60" aria-hidden="true" />
              <span>{t("systemSettings")}</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <StateDialog
        title={t("createNewProduct")}
        description={t("createNewProductDesc")}
        isDialogOpen={productDialogOpen}
        setIsDialogOpen={setProductDialogOpen}
      >
        <CreateProductForm />
      </StateDialog>
      <StateDialog
        title={t("createNewSupplier")}
        description={t("createNewSupplierDesc")}
        isDialogOpen={supplierDialogOpen}
        setIsDialogOpen={setSupplierDialogOpen}
      >
        <SupplierForm />
      </StateDialog>
      <StateDialog
        className="sm:max-w-2xl max-h-[90vh]"
        title={t("recordSaleTransaction")}
        description={t("recordSaleTransactionDesc")}
        isDialogOpen={saleDialogOpen}
        setIsDialogOpen={setSaleDialogOpen}
      >
        <SaleTransactionForm />
      </StateDialog>
      <StateDialog
        className="sm:max-w-2xl max-h-[90vh]"
        title={t("recordPurchaseTransaction")}
        description={t("recordPurchaseTransactionDesc")}
        isDialogOpen={purchaseDialogOpen}
        setIsDialogOpen={setPurchaseDialogOpen}
      >
        <PurchaseTransactionForm />
      </StateDialog>
      <StateDialog
        className="sm:max-w-2xl max-h-[90vh]"
        title={t("recordExpenseTransaction")}
        description={t("recordExpenseTransactionDesc")}
        isDialogOpen={expenseDialogOpen}
        setIsDialogOpen={setExpenseDialogOpen}
      >
        <ExpenseTransactionForm />
      </StateDialog>
      <StateDialog
        className="sm:max-w-2xl max-h-[90vh]"
        title={t("recordTransaction")}
        description={t("recordTransactionDescription")}
        isDialogOpen={transactionDialogOpen}
        setIsDialogOpen={setTransactionDialogOpen}
      >
        <AnyTransactionForm />
      </StateDialog>
    </>
  );
}
