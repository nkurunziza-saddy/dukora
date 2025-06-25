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
  Zap,
} from "lucide-react";

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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import CreateProductForm from "./forms/create-product-form";
import PurchaseTransactionForm from "@/components/forms/purchase-transaction-form";
import SupplierForm from "@/components/forms/create-supplier-form";
import { Button } from "./ui/button";
import SaleTransactionForm from "./forms/sale-transaction-form";

export default function QuickActions() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  const [productDialogOpen, setProductDialogOpen] = React.useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = React.useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = React.useState(false);
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
    }
  };

  return (
    <>
      <Button size="sm" variant={"secondary"} onClick={() => setOpen(true)}>
        <span className="flex grow items-center">
          <Zap
            className="text-muted-foreground/80 -ms-1 me-3 group-hover:text-primary transition-colors"
            size={14}
            aria-hidden="true"
          />
          <span className="text-muted-foreground/70 font-normal group-hover:text-foreground transition-colors">
            Quick Actions
          </span>
        </span>
        <kbd className="bg-background text-muted-foreground/70 ms-8 -me-1 inline-flex h-5 max-h-full items-center rounded border px-1 font-[inherit] text-[0.625rem] font-medium">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for actions or navigate to pages..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Quick Actions">
            <CommandItem onSelect={() => handleDialogAction("create-product")}>
              <Package size={16} className="opacity-60" aria-hidden="true" />
              <span>Create New Product</span>
              <CommandShortcut className="justify-center">⇧⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("create-supplier")}>
              <ShoppingCart
                size={16}
                className="opacity-60"
                aria-hidden="true"
              />
              <span>Create New Supplier</span>
              <CommandShortcut className="justify-center">⇧⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("record-sale")}>
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>Record Sale Transaction</span>
              <CommandShortcut className="justify-center">⇧⌘T</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => handleDialogAction("record-purchase")}>
              <Plus size={16} className="opacity-60" aria-hidden="true" />
              <span>Record Purchase Transaction</span>
              <CommandShortcut className="justify-center">⇧⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Management">
            <CommandItem onSelect={() => handleNavigation("/categories")}>
              <FileText size={16} className="opacity-60" aria-hidden="true" />
              <span>Product Categories</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/suppliers")}>
              <Users size={16} className="opacity-60" aria-hidden="true" />
              <span>Supplier Management</span>
            </CommandItem>
            <CommandItem onSelect={() => handleNavigation("/settings")}>
              <Settings size={16} className="opacity-60" aria-hidden="true" />
              <span>System Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <CreateProductForm />
        </DialogContent>
      </Dialog>

      <Dialog open={supplierDialogOpen} onOpenChange={setSupplierDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <SupplierForm />
        </DialogContent>
      </Dialog>

      <Dialog open={saleDialogOpen} onOpenChange={setSaleDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <SaleTransactionForm />
        </DialogContent>
      </Dialog>
      <Dialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
          <PurchaseTransactionForm />
        </DialogContent>
      </Dialog>
    </>
  );
}
