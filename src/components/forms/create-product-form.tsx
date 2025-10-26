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
import { useCategories } from "@/lib/hooks/use-queries";
import type { SelectProduct } from "@/lib/schema/schema-types";
import { createProduct, updateProduct } from "@/server/actions/product-actions";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";

export default function ProductForm({ product }: { product?: SelectProduct }) {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useCategories();

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
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        <Separator />
        <form.Field
          name="name"
          children={(field) => (
            <Field>
              <FieldLabel>{t("productName")} *</FieldLabel>
              <Input
                placeholder={t("enterProductName")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <Field>
              <FieldLabel>{t("description")}</FieldLabel>
              <Textarea
                placeholder={t("enterProductDescription")}
                className="min-h-20"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            name="sku"
            children={(field) => (
              <Field>
                <FieldLabel>{t("SKU")} *</FieldLabel>
                <Input
                  placeholder={t("SKUDescription")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>{t("SKUDescription")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="barcode"
            children={(field) => (
              <Field>
                <FieldLabel>{t("barcode")}</FieldLabel>
                <Input
                  placeholder={t("barcodePlaceholder")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </div>
        <form.Field
          name="categoryId"
          children={(field) => (
            <Field>
              <FieldLabel>{t("categoryId")}</FieldLabel>
              <Select
                onValueChange={field.handleChange}
                defaultValue={field.state.value || undefined}
              >
                <SelectTrigger className="w-full sm:w-1/2">
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  {isCategoriesLoading && <div>{t("loading")}...</div>}
                  {categoriesError && <div>{t("errorLoading")}</div>}

                  {categoriesData?.map((category) => (
                    <SelectItem
                      value={category.id}
                      key={category.id}
                      disabled={!category.isActive}
                    >
                      {category.value}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />
      </FieldGroup>

      <FieldGroup>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <form.Field
            name="price"
            children={(field) => (
              <Field>
                <FieldLabel>{t("price")} *</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("price")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="costPrice"
            children={(field) => (
              <Field>
                <FieldLabel>{t("costPrice")} *</FieldLabel>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={t("costPrice")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <FieldGroup>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            name="reorderPoint"
            children={(field) => (
              <Field>
                <FieldLabel>{t("reorderPoint")}</FieldLabel>
                <Input
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>{t("reorderPoint")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />

          <form.Field
            name="maxStock"
            children={(field) => (
              <Field>
                <FieldLabel>{t("maxStock")}</FieldLabel>
                <Input
                  type="number"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>{t("maxStockDescription")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            name="unit"
            children={(field) => (
              <Field>
                <FieldLabel>{t("unit")}</FieldLabel>
                <Select
                  onValueChange={field.handleChange}
                  defaultValue={field.state.value}
                  items={units}
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
          />
          <form.Field
            name="weight"
            children={(field) => (
              <Field>
                <FieldLabel>{t("weight")}</FieldLabel>
                <Input
                  type="number"
                  step="0.001"
                  placeholder={t("weight")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                <FieldDescription>{t("weight")}</FieldDescription>
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          />
        </div>
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.state.isSubmitting}
          >
            {tCommon("cancel")}
          </Button>
          <Button
            type="submit"
            disabled={form.state.isSubmitting}
            className="min-w-[120px]"
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
  // TODO: No translation for dialog title/trigger/description
  return (
    <TriggerDialog
      title="Create New Product"
      triggerText="Create Product"
      description="Fill in the details of the new product you want to add."
    >
      <ProductForm />
    </TriggerDialog>
  );
};
