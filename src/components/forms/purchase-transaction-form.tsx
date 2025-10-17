"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { AlertCircle, CheckIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import useSwr, { preload } from "swr";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  InsertTransaction,
  SelectProduct,
  SelectSupplier,
  SelectTransaction,
  SelectWarehouse,
} from "@/lib/schema/schema-types";
import { cn, fetcher } from "@/lib/utils";
import { createTransactionAndWarehouseItem } from "@/server/actions/transaction-actions";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "../ui/autocomplete";
import { Separator } from "../ui/separator";

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
    quantity: z.number().positive(t("quantityPositive")),
    note: z.string(),
    reference: z.string(),
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
        ? (purchaseTransaction.supplierId ?? "")
        : "",
      warehouseId: purchaseTransaction ? purchaseTransaction.warehouseId : "",
      quantity: purchaseTransaction
        ? Math.abs(purchaseTransaction.quantity)
        : 1,
      note: purchaseTransaction ? (purchaseTransaction.note ?? "") : "",
      reference: purchaseTransaction
        ? (purchaseTransaction.reference ?? "")
        : "",
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
          note: value.note || undefined,
          reference: value.reference || undefined,
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
                  }))}
                  onValueChange={(value) => {
                    field.handleChange(value || "");
                    if (value) {
                      form.setFieldValue("warehouseId", "");
                    }
                  }}
                  value={field.state.value || undefined}
                  virtualized
                >
                  <AutocompleteInput placeholder={t("searchProducts")} />
                  <AutocompletePopup>
                    <AutocompleteEmpty>
                      {t("noProductsFound")}
                    </AutocompleteEmpty>
                    <AutocompleteList>
                      {(product) => (
                        <AutocompleteItem
                          key={product.id}
                          value={product.value}
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
                                  : "opacity-0",
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

        {form.state.values.productId && (
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
                    onValueChange={(value) => {
                      field.handleChange(value || "");
                    }}
                    value={field.state.value || undefined}
                    virtualized
                  >
                    <AutocompleteInput placeholder={t("searchWarehouses")} />
                    <AutocompletePopup>
                      <AutocompleteEmpty>
                        {t("noWarehousesFound")}
                      </AutocompleteEmpty>
                      <AutocompleteList>
                        {(item) => (
                          <AutocompleteItem
                            key={item.id}
                            value={item.value}
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
                                    : "opacity-0",
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
                  onValueChange={(value) => {
                    field.handleChange(value || "");
                  }}
                  value={field.state.value || undefined}
                >
                  <AutocompleteInput placeholder={t("searchsuppliers")} />
                  <AutocompletePopup>
                    <AutocompleteEmpty>
                      {t("nosuppliersFound")}
                    </AutocompleteEmpty>
                    <AutocompleteList>
                      {(supplier) => (
                        <AutocompleteItem
                          key={supplier.id}
                          value={supplier.value}
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
                                  : "opacity-0",
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
                type="number"
                placeholder={tCommon("quantity")}
                min="1"
                step="1"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) =>
                  field.handleChange(e.target.valueAsNumber || 0)
                }
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
            ) : purchaseTransaction ? (
              `${tCommon("edit")} ${tInventory("productName")}`
            ) : (
              `${tCommon("add")} ${tInventory("productName")}`
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
