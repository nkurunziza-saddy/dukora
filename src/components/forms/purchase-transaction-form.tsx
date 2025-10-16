"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { CheckIcon, Loader2, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type {
  SelectTransaction,
  SelectProduct,
  InsertTransaction,
  SelectWarehouse,
  SelectSupplier,
} from "@/lib/schema/schema-types";
import { fetcher, cn } from "@/lib/utils";
import useSwr from "swr";
import { preload } from "swr";
import { Popover, PopoverPopup, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { toast } from "sonner";
import { createTransactionAndWarehouseItem } from "@/server/actions/transaction-actions";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

if (typeof window !== "undefined") {
  preload("/api/products", fetcher);
  preload("/api/suppliers", fetcher);
}

export default function PurchaseTransactionForm({
  purchaseTransaction,
}: {
  purchaseTransaction?: SelectTransaction;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tInventory = useTranslations("inventory");
  const purchaseTransactionSchema = z.object({
    productId: z.string().min(1, t("productRequired")),
    supplierId: z.string().min(1, t("supplierRequired")),
    warehouseId: z.string().min(1, t("warehouseRequired")),
    quantity: z.coerce.number().positive(t("quantityPositive")),
    note: z.string().optional(),
    reference: z.string().optional(),
  });

  type PurchaseTransactionFormData = z.infer<typeof purchaseTransactionSchema>;
  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
  } = useSwr<SelectProduct[]>("/api/products", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const {
    data: suppliersData,
    error: suppliersError,
    isLoading: supplierLoading,
  } = useSwr<SelectSupplier[]>("/api/suppliers", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const form = useForm<PurchaseTransactionFormData>({
    resolver: zodResolver(purchaseTransactionSchema),
    defaultValues: {
      productId: purchaseTransaction ? purchaseTransaction.productId : "",
      supplierId: purchaseTransaction
        ? purchaseTransaction.supplierId ?? ""
        : "",
      warehouseId: purchaseTransaction ? purchaseTransaction.warehouseId : "",
      quantity: purchaseTransaction
        ? Math.abs(purchaseTransaction.quantity)
        : 1,
      note: purchaseTransaction ? purchaseTransaction.note ?? "" : "",
      reference: purchaseTransaction ? purchaseTransaction.reference ?? "" : "",
    },
  });

  const formValues = form.watch(["productId", "warehouseId", "quantity"]);

  const [productId] = formValues;
  const selectedProduct = useMemo(
    () => productsData?.find((p) => p.id === productId),
    [productsData, productId]
  );

  const {
    data: warehousesData,
    error: warehousesError,
    isLoading: isWarehousesLoading,
  } = useSwr<SelectWarehouse[]>(`/api/warehouses`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const onSubmit = async (data: PurchaseTransactionFormData) => {
    try {
      const formData: Omit<
        InsertTransaction,
        "id" | "businessId" | "createdBy" | "warehouseItemId"
      > = {
        productId: data.productId,
        supplierId: data.supplierId,
        quantity: data.quantity,
        type: "PURCHASE",
        warehouseId: data.warehouseId,
        note: data.note,
        reference: data.reference,
      };
      const req = await createTransactionAndWarehouseItem(formData);
      if (req.data) {
        form.reset();
        toast.success(t("transactionAdded"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error(tCommon("error"), {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error(tCommon("error"), {
        description: t("transactionAddFailed"),
      });
    }
  };

  const { isSubmitting } = form.formState;

  if (productsError) {
    return (
      <Alert variant="error">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadProducts")}</AlertDescription>
      </Alert>
    );
  }

  if (suppliersError) {
    return (
      <Alert variant="error">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadSuppliers")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />

          <FormField
            control={form.control}
            name="productId"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>{tInventory("productName")} *</FormLabel>
                {isProductsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {t("loadingProducts")}
                    </span>
                  </div>
                ) : productsData ? (
                  <Popover>
                    <PopoverTrigger render={<FormControl />}>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <span>{selectedProduct?.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {selectedProduct?.sku}
                            </Badge>
                          </div>
                        ) : (
                          t("selectProduct")
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverPopup className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("searchProducts")} />
                        <CommandList>
                          <CommandEmpty>{t("noProductsFound")}</CommandEmpty>
                          <CommandGroup>
                            {productsData.map((product) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  form.setValue("productId", product.id);
                                  form.setValue("warehouseId", "");
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {product.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {product.sku}
                                    </span>
                                  </div>
                                  <CheckIcon
                                    className={cn(
                                      "h-4 w-4",
                                      product.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverPopup>
                  </Popover>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          {productId && (
            <FormField
              control={form.control}
              name="warehouseId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>{tInventory("warehouse")} *</FormLabel>
                  {isWarehousesLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {t("loadingWarehouses")}
                      </span>
                    </div>
                  ) : warehousesData ? (
                    <Popover>
                      <PopoverTrigger render={<FormControl />}>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            <div className="flex items-center gap-2">
                              <span>
                                {
                                  warehousesData.find(
                                    (item) => item.id === field.value
                                  )?.name
                                }
                              </span>
                            </div>
                          ) : (
                            tInventory("selectWarehouse")
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverPopup className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder={t("searchWarehouses")} />
                          <CommandList>
                            <CommandEmpty>
                              {t("noWarehousesFound")}
                            </CommandEmpty>
                            <CommandGroup>
                              {warehousesData.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  disabled={!item.isActive}
                                  onSelect={() => {
                                    form.setValue("warehouseId", item.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {item.name} - {item.code}
                                      </span>
                                    </div>
                                    <CheckIcon
                                      className={cn(
                                        "h-4 w-4",
                                        item.id === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverPopup>
                    </Popover>
                  ) : warehousesError ? (
                    <Alert variant="error">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {t("failedToLoadWarehouses")}
                      </AlertDescription>
                    </Alert>
                  ) : null}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="supplierId"
            render={({ field }) => (
              <FormItem className="flex flex-col space-y-2">
                <FormLabel>{tInventory("supplierName")} *</FormLabel>
                {supplierLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {t("loadingSuppliers")}
                    </span>
                  </div>
                ) : suppliersData ? (
                  <Popover>
                    <PopoverTrigger render={<FormControl />}>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <span>
                              {
                                suppliersData?.find((p) => p.id === field.value)
                                  ?.name
                              }
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {
                                suppliersData?.find((p) => p.id === field.value)
                                  ?.contactName
                              }
                            </Badge>
                          </div>
                        ) : (
                          t("selectsupplier")
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverPopup className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder={t("searchsuppliers")} />
                        <CommandList>
                          <CommandEmpty>{t("nosuppliersFound")}</CommandEmpty>
                          <CommandGroup>
                            {suppliersData.map((supplier) => (
                              <CommandItem
                                key={supplier.id}
                                onSelect={() => {
                                  form.setValue("supplierId", supplier.id);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {supplier.name}
                                    </span>
                                  </div>
                                  <CheckIcon
                                    className={cn(
                                      "h-4 w-4",
                                      supplier.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverPopup>
                  </Popover>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("quantity")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={tCommon("quantity")}
                    min="1"
                    step="1"
                  />
                </FormControl>
                <FormDescription>{t("addedToInventory")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("reference")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("referencePurchasePlaceholder")}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("referencePurchaseDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("note")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("notePurchasePlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("notePurchaseDescription")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
              }}
              disabled={isSubmitting}
            >
              {t("resetForm")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {purchaseTransaction ? tCommon("edit") : tCommon("add")}...
                </>
              ) : (
                <>
                  {purchaseTransaction
                    ? `${tCommon("edit")} ${tInventory("productName")}`
                    : `${tCommon("add")} ${tInventory("productName")}`}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const CreatePurchaseTransactionDialog = () => {
  const t = useTranslations("forms");
  return (
    <TriggerDialog
      title={t("recordPurchaseTransaction")}
      triggerText={t("recordPurchase")}
      description={t("recordPurchaseDescription")}
    >
      <PurchaseTransactionForm />
    </TriggerDialog>
  );
};
