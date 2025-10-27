"use client";

import {
  FileTextIcon,
  PackageIcon,
  PlusIcon,
  SettingsIcon,
  ShoppingCartIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";
import SupplierForm from "@/components/forms/create-supplier-form";
import PurchaseTransactionForm from "@/components/forms/purchase-transaction-form";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useMobileDrawer } from "@/lib/hooks/use-mobile-drawer";
import AnyTransactionForm from "./forms/create-any-transaction-form";
import CreateProductForm from "./forms/create-product-form";
import ExpenseTransactionForm from "./forms/expense-transaction-form";
import SaleTransactionForm from "./forms/sale-transaction-form";
import { StateDialog } from "./shared/reusable-form-dialog";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./ui/drawer";

export default function QuickActions() {
  const [open, setOpen] = React.useState(false);
  const {
    isMobile,
    isOpen: drawerOpen,
    open: openDrawer,
    close: closeDrawer,
  } = useMobileDrawer();
  const router = useRouter();
  const t = useTranslations("quickActions");

  const [productDialogOpen, setProductDialogOpen] = React.useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = React.useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false);
  const [expenseDialogOpen, setExpenseDialogOpen] = React.useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] =
    React.useState(false);
  const [saleDialogOpen, setSaleDialogOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const evaluateMath = (input: string) => {
    const mathRegex = /^[\d+\-*/().\s]+$/;
    const hasOperator = /[+\-*/]/.test(input);

    if (mathRegex.test(input) && hasOperator && input.trim()) {
      try {
        const result = new Function(`return ${input}`)();
        return { isMath: true, result: result.toString() };
      } catch {
        return { isMath: false, result: null };
      }
    }
    return { isMath: false, result: null };
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const mathResult = evaluateMath(search);
      if (mathResult.isMath && mathResult.result) {
        setSearch(`${search} = ${mathResult.result}`);
      }
    }
  };

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
    if (isMobile) closeDrawer();
    router.push(path);
  };

  const handleDialogAction = (action: string) => {
    setOpen(false);
    if (isMobile) closeDrawer();

    if (isMobile) {
      switch (action) {
        case "create-product":
          router.push("/create/product");
          break;
        case "create-supplier":
          router.push("/create/supplier");
          break;
        case "record-sale":
          router.push("/create/sale");
          break;
        case "record-purchase":
          router.push("/create/purchase");
          break;
        case "record-expense":
          router.push("/create/expense");
          break;
        case "record-transaction":
          router.push("/create/transaction");
          break;
      }
    } else {
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
    }
  };

  return (
    <>
      <Button
        onClick={() => (isMobile ? openDrawer() : setOpen(true))}
        size="sm"
        variant={"secondary"}
      >
        <span className="hidden sm:flex grow items-center">
          <span className="text-muted-foreground/70 font-normal group-hover:text-foreground transition-colors">
            {t("quickActions")}
          </span>
        </span>
        <kbd className="hidden bg-background text-muted-foreground/70 ms-8 -me-1 sm:inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
        <ZapIcon className="size-3 sm:hidden" />
      </Button>

      {isMobile ? (
        <Drawer
          onOpenChange={(open) => (open ? openDrawer() : closeDrawer())}
          open={drawerOpen}
        >
          <DrawerTrigger>
            <div />
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{t("quickActions")}</DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {t("quickActionsGroup")}
                </h3>
                <div className="space-y-1">
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("product")}
                    type="button"
                  >
                    <PackageIcon className="h-4 w-4" />
                    <span>{t("createNewProduct")}</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("supplier")}
                    type="button"
                  >
                    <UsersIcon className="h-4 w-4" />
                    <span>{t("createNewSupplier")}</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("sale")}
                    type="button"
                  >
                    <ShoppingCartIcon className="h-4 w-4" />
                    <span>{t("recordSaleTransaction")}</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("purchase")}
                    type="button"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    <span>{t("recordPurchaseTransaction")}</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("expense")}
                    type="button"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    <span>{t("recordExpenseTransaction")}</span>
                  </button>
                  <button
                    className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleDialogAction("transaction")}
                    type="button"
                  >
                    <FileTextIcon className="h-4 w-4" />
                    <span>{t("recordTransaction")}</span>
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {t("navigationGroup")}
                  </h3>
                  <div className="space-y-1">
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/dashboard")}
                      type="button"
                    >
                      <ZapIcon className="h-4 w-4" />
                      <span>{t("dashboard")}</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/products")}
                      type="button"
                    >
                      <PackageIcon className="h-4 w-4" />
                      <span>{t("products")}</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/suppliers")}
                      type="button"
                    >
                      <UsersIcon className="h-4 w-4" />
                      <span>{t("suppliers")}</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/transactions")}
                      type="button"
                    >
                      <FileTextIcon className="h-4 w-4" />
                      <span>{t("transactions")}</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/analytics")}
                      type="button"
                    >
                      <ShoppingCartIcon className="h-4 w-4" />
                      <span>{t("analytics")}</span>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 rounded-md px-0 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      onClick={() => handleNavigation("/settings")}
                      type="button"
                    >
                      <SettingsIcon className="h-4 w-4" />
                      <span>{t("settings")}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Command>
          <CommandDialog onOpenChange={setOpen} open={open}>
            <CommandInput
              onKeyDown={handleKeyDown}
              onValueChange={setSearch}
              placeholder={t("searchActionsPlaceholder")}
              value={search}
            />
            <CommandList>
              <CommandEmpty>{t("noResultsFound")}</CommandEmpty>

              <CommandGroup heading={t("quickActionsGroup")}>
                <CommandItem
                  onSelect={() => handleDialogAction("create-product")}
                >
                  <PackageIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("createNewProduct")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘P
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleDialogAction("create-supplier")}
                >
                  <ShoppingCartIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("createNewSupplier")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘S
                  </CommandShortcut>
                </CommandItem>
                <CommandItem onSelect={() => handleDialogAction("record-sale")}>
                  <PlusIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("recordSaleTransaction")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘T
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleDialogAction("record-purchase")}
                >
                  <PlusIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("recordPurchaseTransaction")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘B
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleDialogAction("record-expense")}
                >
                  <PlusIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("recordExpenseTransaction")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘B
                  </CommandShortcut>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleDialogAction("record-transaction")}
                >
                  <PlusIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("recordAnyTransaction")}</span>
                  <CommandShortcut className="justify-center">
                    ⇧⌘B
                  </CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <CommandGroup heading={t("managementGroup")}>
                <CommandItem onSelect={() => handleNavigation("/products")}>
                  <FileTextIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("productManagement")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/suppliers")}>
                  <UsersIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("supplierManagement")}</span>
                </CommandItem>
                <CommandItem onSelect={() => handleNavigation("/settings")}>
                  <SettingsIcon
                    aria-hidden="true"
                    className="opacity-60"
                    size={16}
                  />
                  <span>{t("settings")}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </CommandDialog>
        </Command>
      )}

      {!isMobile && (
        <>
          <StateDialog
            description={t("createNewProductDesc")}
            isDialogOpen={productDialogOpen}
            setIsDialogOpen={setProductDialogOpen}
            title={t("createNewProduct")}
          >
            <CreateProductForm />
          </StateDialog>
          <StateDialog
            description={t("createNewSupplierDesc")}
            isDialogOpen={supplierDialogOpen}
            setIsDialogOpen={setSupplierDialogOpen}
            title={t("createNewSupplier")}
          >
            <SupplierForm />
          </StateDialog>
          <StateDialog
            className="sm:max-w-2xl max-h-[90vh]"
            description={t("recordSaleTransactionDesc")}
            isDialogOpen={saleDialogOpen}
            setIsDialogOpen={setSaleDialogOpen}
            title={t("recordSaleTransaction")}
          >
            <SaleTransactionForm />
          </StateDialog>
          <StateDialog
            className="sm:max-w-2xl max-h-[90vh]"
            description={t("recordPurchaseTransactionDesc")}
            isDialogOpen={purchaseDialogOpen}
            setIsDialogOpen={setPurchaseDialogOpen}
            title={t("recordPurchaseTransaction")}
          >
            <PurchaseTransactionForm />
          </StateDialog>
          <StateDialog
            className="sm:max-w-2xl max-h-[90vh]"
            description={t("recordExpenseTransactionDesc")}
            isDialogOpen={expenseDialogOpen}
            setIsDialogOpen={setExpenseDialogOpen}
            title={t("recordExpenseTransaction")}
          >
            <ExpenseTransactionForm />
          </StateDialog>
          <StateDialog
            className="sm:max-w-2xl max-h-[90vh]"
            description={t("recordTransactionDescription")}
            isDialogOpen={transactionDialogOpen}
            setIsDialogOpen={setTransactionDialogOpen}
            title={t("recordTransaction")}
          >
            <AnyTransactionForm />
          </StateDialog>
        </>
      )}
    </>
  );
}
