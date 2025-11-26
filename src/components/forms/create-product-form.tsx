"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBusinessSettings, useCategories } from "@/lib/hooks/use-queries";
import type { SelectProduct } from "@/lib/schema/schema-types";
import { createProduct, updateProduct } from "@/server/actions/inventory/products-actions";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";

export default function ProductForm({ product }: { product?: SelectProduct }) {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useCategories();

  const { data: settings } = useBusinessSettings();
  const pricesIncludeTax =
    settings?.find((s) => s.key === "pricesIncludeTax")?.value === "true";

  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const productSchema = z.object({
    name: z.string().min(1, t("productNameRequired")),
    description: z.string(),
    sku: z.string().min(1, t("skuRequired")),
    barcode: z.string(),
    price: z.string().refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num >= 0;
    }, t("pricePositive")),
    costPrice: z.string().refine((val) => {
      const num = Number.parseFloat(val);
      return !Number.isNaN(num) && num >= 0;
    }, t("costPricePositive")),
    categoryId: z.string(),
    reorderPoint: z.string().refine((val) => {
      const num = Number.parseInt(val, 10);
      return !Number.isNaN(num) && num >= 0;
    }, t("reorderPointPositive")),
    maxStock: z.string().refine((val) => {
      const num = Number.parseInt(val, 10);
      return !Number.isNaN(num) && num > 0;
    }, t("maxStockPositive")),
    unit: z.string(),
    weight: z.string().refine((val) => {
      if (val === "") return true;
      const num = Number.parseFloat(val);
      return !Number.isNaN(num);
    }, t("weightMustBeNumber")),
  });

  const units = [
    { value: "pcs", label: t("unitPieces") },
    { value: "kg", label: t("unitKilograms") },
    { value: "lbs", label: t("unitPounds") },
    { value: "m", label: t("unitMeters") },
    { value: "ft", label: t("unitFeet") },
    { value: "l", label: t("unitLiters") },
    { value: "gal", label: t("unitGallons") },
  ];

  const form = useForm({
    defaultValues: {
      name: product ? product.name : "",
      description: product ? (product.description ?? "") : "",
      sku: product ? product.sku : "",
      barcode: product ? (product.barcode ?? "") : "",
      price: product ? product.price : "",
      costPrice: product ? product.costPrice : "",
      categoryId: product ? (product.categoryId ?? "") : "",
      reorderPoint: product ? product.reorderPoint.toString() : "10",
      maxStock: product ? product.maxStock.toString() : "1000",
      unit: product ? product.unit : "pcs",
      weight: product ? (product.weight ?? "") : "",
    },
    validators: {
      onSubmit: productSchema,
    },
    onSubmit: async ({ value }) => {
      const productData = {
        ...value,
        categoryId:
          value.categoryId && value.categoryId.trim() !== ""
            ? value.categoryId
            : null,
        reorderPoint: Number.parseInt(value.reorderPoint, 10),
        maxStock: Number.parseInt(value.maxStock, 10),
        weight:
          value.weight && value.weight.trim() !== "" ? value.weight : null,
      };
      const req = product
        ? await updateProduct({ productId: product.id, updates: productData })
        : await createProduct(productData);
      if (req.data) {
        form.reset();
        toast.success(
          product
            ? `${tCommon("edit")} ${t("productName")} ${tCommon("confirm")}`
            : `${t("productName")} ${tCommon("add")} ${tCommon("confirm")}`,
          {
            description: format(new Date(), "MMM dd, yyyy"),
          },
        );
      } else {
        toast.error(tCommon("error"), {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <Separator />
        <form.Field
          children={(field) => (
            <Field>
              <FieldLabel>{t("productName")} *</FieldLabel>
              <Input
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t("enterProductName")}
                value={field.state.value}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
          name="name"
        />

        <form.Field
          children={(field) => (
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <Textarea
                className="min-h-20"
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={t("enterProductDescription")}
                value={field.state.value}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
          name="description"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("SKU")} *</FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("SKUDescription")}
                  value={field.state.value}
                />
                <FieldDescription>{t("SKUDescription")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="sku"
          />

          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("barcode")}</FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("barcodePlaceholder")}
                  value={field.state.value}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="barcode"
          />
        </div>
        <form.Field
          children={(field) => (
            <Field>
              <FieldLabel>{t("categoryId")}</FieldLabel>
              <Select
                onValueChange={(val) => field.handleChange(val ?? "")}
                value={field.state.value ?? ""}
              >
                <SelectTrigger className="w-full sm:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {isCategoriesLoading && <div>{t("loading")}...</div>}
                  {categoriesError && <div>{t("errorLoading")}</div>}

                  {categoriesData?.map((category) => (
                    <SelectItem
                      disabled={!category.isActive}
                      key={category.id}
                      value={category.id}
                    >
                      {category.value}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
          name="categoryId"
        />
      </FieldGroup>

      <FieldGroup>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>
                  {t("price")}{" "}
                  {pricesIncludeTax ? tCommon("inclTax") : tCommon("exclTax")} *
                </FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("price")}
                  step="0.01"
                  type="number"
                  value={field.state.value}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="price"
          />

          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>
                  {t("costPrice")}{" "}
                  {pricesIncludeTax ? tCommon("inclTax") : tCommon("exclTax")} *
                </FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("costPrice")}
                  step="0.01"
                  type="number"
                  value={field.state.value}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="costPrice"
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("reorderPoint")}</FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  value={field.state.value}
                />
                <FieldDescription>{t("reorderPoint")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="reorderPoint"
          />

          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("maxStock")}</FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  value={field.state.value}
                />
                <FieldDescription>{t("maxStockDescription")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="maxStock"
          />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("unit")}</FieldLabel>
                <Select
                  items={units}
                  onValueChange={(val) => field.handleChange(val ?? "")}
                  value={field.state.value ?? ""}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {units.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="unit"
          />
          <form.Field
            children={(field) => (
              <Field>
                <FieldLabel>{t("weight")}</FieldLabel>
                <Input
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("weight")}
                  step="0.001"
                  type="number"
                  value={field.state.value}
                />
                <FieldDescription>{t("weight")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
            name="weight"
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            disabled={form.state.isSubmitting}
            onClick={() => form.reset()}
            type="button"
            variant="outline"
          >
            {tCommon("cancel")}
          </Button>
          <Button
            className="min-w-[120px]"
            disabled={form.state.isSubmitting}
            type="submit"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                {product ? tCommon("edit") : tCommon("add")}...
              </>
            ) : (
              `${product ? tCommon("edit") : tCommon("add")} ${t(
                "productName",
              )}`
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export const CreateProductDialog = () => {
  const t = useTranslations("forms");
  return (
    <TriggerDialog
      description={t("createProductDescription")}
      title={t("createProductTitle")}
      triggerText={t("createProduct")}
    >
      <ProductForm />
    </TriggerDialog>
  );
};
