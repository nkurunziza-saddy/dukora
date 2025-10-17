"use client";

import { useForm } from "@tanstack/react-form";
import z from "zod";
import { CheckIcon, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
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
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "../ui/autocomplete";
import { toast } from "sonner";
import { createTransactionAndWarehouseItem } from "@/server/actions/transaction-actions";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

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

  const form = useForm({
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
    validators: {
      onSubmit: purchaseTransactionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const formData: Omit<
          InsertTransaction,
          "id" | "businessId" | "createdBy" | "warehouseItemId"
        > = {
          productId: value.productId,
          supplierId: value.supplierId,
          quantity: value.quantity,
          type: "PURCHASE",
          warehouseId: value.warehouseId,
          note: value.note,
          reference: value.reference,
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
    },
  });

  const {
    data: warehousesData,
    error: warehousesError,
    isLoading: isWarehousesLoading,
  } = useSwr<SelectWarehouse[]>(`/api/warehouses`, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

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
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup className="space-y-4">
        <Separator />

        <form.Field
          name="productId"
          children={(field) => (
            <Field>
              <FieldLabel>{tInventory("productName")} *</FieldLabel>
              {isProductsLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {t("loadingProducts")}
                  </span>
                </div>
              ) : productsData ? (
                <Autocomplete
                  items={productsData.map((p) => ({
                    value: p.id,
                    label: p.name,
                    ...p,
                  }))}
                  onValueChange={(item) => {
                    if (item) {
                      field.handleChange(item.value);
                      form.setFieldValue("warehouseId", "");
                    }
                  }}
                  value={field.state.value}
                >
                  <AutocompleteInput placeholder={t("searchProducts")} />
                  <AutocompletePopup>
                    <AutocompleteEmpty>{t("noProductsFound")}</AutocompleteEmpty>
                    <AutocompleteList>
                      {(product) => (
                        <AutocompleteItem
                          key={product.id}
                          value={product}
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
                                product.id === field.state.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        </AutocompleteItem>
                      )}
                    </AutocompleteList>
                  </AutocompletePopup>
                </Autocomplete>
              ) : null}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        {form.useStore((s) => s.values.productId) && (
          <form.Field
            name="warehouseId"
            children={(field) => (
              <Field>
                <FieldLabel>{tInventory("warehouse")} *</FieldLabel>
                {isWarehousesLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {t("loadingWarehouses")}
                    </span>
                  </div>
                ) : warehousesData ? (
                  <Autocomplete
                    items={warehousesData.map((w) => ({
                      value: w.id,
                      label: w.name,
                      ...w,
                    }))}
                    onValueChange={(item) => {
                      if (item) {
                        field.handleChange(item.value);
                      }
                    }}
                    value={field.state.value}
                  >
                    <AutocompleteInput
                      placeholder={t("searchWarehouses")}
                    />
                    <AutocompletePopup>
                      <AutocompleteEmpty>
                        {t("noWarehousesFound")}
                      </AutocompleteEmpty>
                      <AutocompleteList>
                        {(item) => (
                          <AutocompleteItem
                            key={item.id}
                            value={item}
                            disabled={!item.isActive}
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
                                  item.id === field.state.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                            </div>
                          </AutocompleteItem>
                        )}
                      </AutocompleteList>
                    </AutocompletePopup>
                  </Autocomplete>
                ) : warehousesError ? (
                  <Alert variant="error">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {t("failedToLoadWarehouses")}
                    </AlertDescription>
                  </Alert>
                ) : null}
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        )}

        <form.Field
          name="supplierId"
          children={(field) => (
            <Field>
              <FieldLabel>{tInventory("supplierName")} *</FieldLabel>
              {supplierLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {t("loadingSuppliers")}
                  </span>
                </div>
              ) : suppliersData ? (
                <Autocomplete
                  items={suppliersData.map((s) => ({
                    value: s.id,
                    label: s.name,
                    ...s,
                  }))}
                  onValueChange={(item) => {
                    if (item) {
                      field.handleChange(item.value);
                    }
                  }}
                  value={field.state.value}
                >
                  <AutocompleteInput placeholder={t("searchsuppliers")} />
                  <AutocompletePopup>
                    <AutocompleteEmpty>{t("nosuppliersFound")}</AutocompleteEmpty>
                    <AutocompleteList>
                      {(supplier) => (
                        <AutocompleteItem
                          key={supplier.id}
                          value={supplier}
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
                                supplier.id === field.state.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </div>
                        </AutocompleteItem>
                      )}
                    </AutocompleteList>
                  </AutocompletePopup>
                </Autocomplete>
              ) : null}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="quantity"
          children={(field) => (
            <Field>
              <FieldLabel>{tCommon("quantity")} *</FieldLabel>
              <Input
                {...field}
                type="number"
                placeholder={tCommon("quantity")}
                min="1"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              <FieldDescription>{t("addedToInventory")}</FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="reference"
          children={(field) => (
            <Field>
              <FieldLabel>{tCommon("reference")}</FieldLabel>
              <Input
                placeholder={t("referencePurchasePlaceholder")}
                {...field}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>
                {t("referencePurchaseDescription")}
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="note"
          children={(field) => (
            <Field>
              <FieldLabel>{tCommon("note")}</FieldLabel>
              <Textarea
                placeholder={t("notePurchasePlaceholder")}
                rows={3}
                {...field}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>
                {t("notePurchaseDescription")}
              </FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
            }}
            disabled={form.state.isSubmitting}
          >
            {t("resetForm")}
          </Button>
          <Button
            type="submit"
            disabled={form.state.isSubmitting || !form.state.isValid}
            className="min-w-[140px]"
          >
            {form.state.isSubmitting ? (
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
t>
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
