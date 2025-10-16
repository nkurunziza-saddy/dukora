"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Loader2 } from "lucide-react";

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
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetcher } from "@/lib/utils";
import useSwr, { preload } from "swr";
import type { SelectCategory, SelectProduct } from "@/lib/schema/schema-types";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";
import { createProduct, updateProduct } from "@/server/actions/product-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

if (typeof window !== "undefined") {
  preload("/api/categories", fetcher);
}

export default function ProductForm({ product }: { product?: SelectProduct }) {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useSwr<SelectCategory[]>("/api/categories", fetcher);

  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const productSchema = z.object({
    name: z.string().min(1, t("productNameRequired")),
    description: z.string().optional(),
    sku: z.string().min(1, t("skuRequired")),
    barcode: z.string().optional(),
    price: z.string().refine((val) => {
      const num = Number.parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, t("pricePositive")),
    costPrice: z.string().refine((val) => {
      const num = Number.parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, t("costPricePositive")),
    categoryId: z.string().optional(),
    reorderPoint: z.string().refine((val) => {
      const num = Number.parseInt(val);
      return !isNaN(num) && num >= 0;
    }, t("reorderPointPositive")),
    maxStock: z.string().refine((val) => {
      const num = Number.parseInt(val);
      return !isNaN(num) && num > 0;
    }, t("maxStockPositive")),
    unit: z.string(),
    weight: z
      .string()
      .optional()
      .refine((val) => {
        if (val === undefined || val === "") return true;
        const num = Number.parseFloat(val);
        return !isNaN(num);
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

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product ? product.name : "",
      description: product ? product.description ?? "" : "",
      sku: product ? product.sku : "",
      barcode: product ? product.barcode ?? "" : "",
      price: product ? product.price : "",
      costPrice: product ? product.costPrice : "",
      categoryId: product ? product.categoryId ?? "" : "",
      reorderPoint: product ? product.reorderPoint.toString() : "10",
      maxStock: product ? product.maxStock.toString() : "1000",
      unit: product ? product.unit : "pcs",
      weight: product ? product.weight ?? "" : "",
    },
  });

  const onSubmit = async (values: z.infer<typeof productSchema>) => {
    const productData = {
      ...values,
      categoryId:
        values.categoryId && values.categoryId.trim() !== ""
          ? values.categoryId
          : null,
      reorderPoint: Number.parseInt(values.reorderPoint, 10),
      maxStock: Number.parseInt(values.maxStock, 10),
      weight:
        values.weight && values.weight.trim() !== "" ? values.weight : null,
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
        }
      );
    } else {
      toast.error(tCommon("error"), {
        description: req.error?.split("_").join(" ").toLowerCase(),
      });
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("productName")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterProductName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("enterProductDescription")}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("SKU")} *</FormLabel>
                  <FormControl>
                    <Input placeholder={t("SKUDescription")} {...field} />
                  </FormControl>
                  <FormDescription>{t("SKUDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("barcode")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("barcodePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("categoryId")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("price")} *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("price")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="costPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("costPrice")} *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("costPrice")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="reorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reorderPoint")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>{t("reorderPoint")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("maxStock")}</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>{t("maxStockDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("unit")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectPopup>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("weight")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder={t("weight")}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>{t("weight")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {product ? tCommon("edit") : tCommon("add")}...
                </>
              ) : (
                `${product ? tCommon("edit") : tCommon("add")} ${t(
                  "productName"
                )}`
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const CreateProductDialog = () => {
  // comment: No translation for dialog title/trigger/description
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
