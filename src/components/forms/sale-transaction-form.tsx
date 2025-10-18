"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { AlertCircle, CheckIcon, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { toast } from "sonner";
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
  SelectTransaction,
} from "@/lib/schema/schema-types";
import { cn } from "@/lib/utils";
import { createTransaction } from "@/server/actions/transaction-actions";
import { useProducts, useProductDetails } from "@/lib/hooks/use-queries";
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

export default function SaleTransactionForm({
  saleTransaction,
}: {
  saleTransaction?: SelectTransaction;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tInventory = useTranslations("inventory");

  const saleTransactionSchema = z.object({
    productId: z.string().min(1, t("productRequired")),
    warehouseItemId: z.string().min(1, t("warehouseRequired")),
    quantity: z.number().positive(t("quantityPositive")),
    note: z.string(),
    reference: z.string(),
    warehouseId: z.string().min(1, "Warehouse ID is required"),
  });

  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
  } = useProducts();

  const form = useForm({
    defaultValues: {
      productId: saleTransaction ? saleTransaction.productId : "",
      warehouseItemId: saleTransaction ? saleTransaction.warehouseItemId : "",
      quantity: saleTransaction ? Math.abs(saleTransaction.quantity) : 1,
      note: saleTransaction ? saleTransaction.note ?? "" : "",
      reference: saleTransaction ? saleTransaction.reference ?? "" : "",
      warehouseId: saleTransaction ? saleTransaction.warehouseId : "",
    },
    validators: {
      onSubmit: saleTransactionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const formData: Omit<
          InsertTransaction,
          "id" | "businessId" | "createdBy"
        > = {
          productId: value.productId,
          warehouseItemId: value.warehouseItemId,
          quantity: value.quantity,
          type: "SALE",
          warehouseId: value.warehouseId,
          note: value.note || undefined,
          reference: value.reference || undefined,
        };
        const req = await createTransaction(formData);
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

  const productId = form.state.values.productId;

  const {
    data: productDetailsData,
    error: productDetailsError,
    isLoading: isProductDetailsLoading,
  } = useProductDetails(productId);

  const warehouseItemId = form.state.values.warehouseItemId;
  const quantity = form.state.values.quantity;

  const selectedWarehouseItem = useMemo(
    () =>
      productDetailsData?.warehouseItems.find(
        (item) => item.id === warehouseItemId
      ),
    [productDetailsData?.warehouseItems, warehouseItemId]
  );

  const hasInsufficientStock = useMemo(
    () => selectedWarehouseItem && quantity > selectedWarehouseItem.quantity,
    [selectedWarehouseItem, quantity]
  );

  if (productsError) {
    return (
      <Alert variant="error">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadProducts")}</AlertDescription>
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
                      field.handleChange(item);
                      form.setFieldValue("warehouseItemId", "");
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
                        <AutocompleteItem key={product.id} value={product}>
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

        {productId && (
          <form.Field
            name="warehouseItemId"
            children={(field) => (
              <Field>
                <FieldLabel>{t("warehouseLocation")} *</FieldLabel>
                {isProductDetailsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      {t("loadingWarehouses")}
                    </span>
                  </div>
                ) : productDetailsData ? (
                  <Autocomplete
                    items={productDetailsData.warehouseItems.map((item) => ({
                      value: item.id,
                      label: item.warehouse.name,
                      ...item,
                    }))}
                    onValueChange={(item) => {
                      if (item) {
                        field.handleChange(item);
                        if (item) {
                          field.handleChange(item);
                          const warehouseId =
                            typeof item === "string"
                              ? productDetailsData?.warehouseItems.find(
                                  (w) => w.id === item
                                )?.warehouseId
                              : (item as any).warehouseId;
                          if (warehouseId) {
                            form.setFieldValue("warehouseId", warehouseId);
                          }
                        }
                      }
                    }}
                    value={field.state.value || undefined}
                    virtualized
                  >
                    <AutocompleteInput placeholder={t("searchWarehouses")} />
                    <AutocompletePopup>
                      <AutocompleteEmpty>
                        {productDetailsData.warehouseItems.length === 0
                          ? t("noWarehousesFoundForProd")
                          : t("noWarehousesFound")}
                      </AutocompleteEmpty>
                      <AutocompleteList>
                        {(item) => (
                          <AutocompleteItem key={item.id} value={item}>
                            <div className="flex items-center justify-between w-full">
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {item.warehouse.name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {tInventory("onHand")}: {item.quantity}
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
                ) : productDetailsError ? (
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
          name="quantity"
          children={(field) => (
            <Field>
              <FieldLabel>{tCommon("quantity")} *</FieldLabel>
              <Input
                type="number"
                placeholder={t("enterQuantity")}
                min="1"
                max={selectedWarehouseItem?.quantity || undefined}
                step="1"
                className={hasInsufficientStock ? "border-destructive" : ""}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              <FieldDescription className="flex items-center justify-between">
                <span>{t("deductedFromInventory")}</span>
                {selectedWarehouseItem && (
                  <span
                    className={cn(
                      "text-sm font-medium",
                      hasInsufficientStock
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {tInventory("onHand")}: {selectedWarehouseItem.quantity}
                  </span>
                )}
              </FieldDescription>
              {hasInsufficientStock && (
                <Alert variant="error">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {t("insufficientStock", {
                      count: selectedWarehouseItem?.quantity || 0,
                    })}
                  </AlertDescription>
                </Alert>
              )}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="reference"
          children={(field) => (
            <Field>
              <FieldLabel>
                {tCommon("reference")} {t("poNumber")}
              </FieldLabel>
              <Input
                placeholder={t("referencePlaceholder")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>{t("referenceDescription")}</FieldDescription>
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
                placeholder={t("notePlaceholder")}
                rows={3}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldDescription>{t("noteDescription")}</FieldDescription>
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
            disabled={
              form.state.isSubmitting ||
              !form.state.isValid ||
              hasInsufficientStock
            }
            className="min-w-[140px]"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {saleTransaction ? t("updating") : t("recording")}
              </>
            ) : (
              <>
                {saleTransaction ? t("update") : t("record")}{" "}
                {tInventory("title").split(" ")[0]}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export const CreateSaleTransactionDialog = () => {
  return (
    <TriggerDialog
      title={useTranslations("forms")("recordSaleTransaction")}
      triggerText={useTranslations("forms")("recordSale")}
      description={useTranslations("forms")("recordSaleDescription")}
    >
      <SaleTransactionForm />
    </TriggerDialog>
  );
};
