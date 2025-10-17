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
import type {
  SelectTransaction,
  SelectProduct,
  ExtendedProductPayload,
  InsertTransaction,
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
import { createTransaction } from "@/server/actions/transaction-actions";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { TRANSACTION_TYPE } from "@/lib/schema";
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionTypesObject } from "@/utils/constants";
import { useMemo } from "react";

if (typeof window !== "undefined") {
  preload("/api/products", fetcher);
}

export default function AnyTransactionForm({
  transaction,
}: {
  transaction?: SelectTransaction;
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
    type: z.enum([...TRANSACTION_TYPE]),
    warehouseId: z.string().min(1, "Warehouse ID is required"),
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

  const form = useForm({
    defaultValues: {
      productId: transaction ? transaction.productId : "",
      warehouseItemId: transaction ? transaction.warehouseItemId : "",
      quantity: transaction ? Math.abs(transaction.quantity) : 1,
      note: transaction ? transaction.note ?? "" : "",
      reference: transaction ? transaction.reference ?? "" : "",
      type: transaction ? transaction.type : "DAMAGE",
      warehouseId: transaction ? transaction.warehouseId : "",
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
          type: value.type,
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
  } = useSwr<ExtendedProductPayload>(
    productId ? `/api/products/${productId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  );

  const warehouseItemId = form.state.values.warehouseItemId;
  const selectedWarehouseItem = useMemo(
    () =>
      productDetailsData?.warehouseItems.find(
        (item) => item.id === warehouseItemId
      ),
    [productDetailsData, warehouseItemId]
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
          name="type"
          children={(field) => (
            <Field>
              <FieldLabel>{t("type")}</FieldLabel>
              <Select
                onValueChange={field.handleChange}
                defaultValue={field.state.value}
                items={transactionTypesObject}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {transactionTypesObject.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />
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
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
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
            disabled={form.state.isSubmitting || !form.state.isValid}
            className="min-w-[140px]"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {transaction ? t("updating") : t("recording")}
              </>
            ) : (
              <>
                {transaction ? t("update") : t("record")}{" "}
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
      title={useTranslations("forms")("recordTransaction")}
      triggerText={useTranslations("common")("record")}
      description={useTranslations("forms")("recordTransactionDescription")}
    >
      <AnyTransactionForm />
    </TriggerDialog>
  );
};
