"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Check, Loader2 } from "lucide-react";

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
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, fetcher } from "@/lib/utils";
import useSwr, { preload } from "swr";
import type { SelectCategory, SelectProduct } from "@/lib/schema/schema-types";
import { FormDialog } from "../form-dialog";
import { Separator } from "../ui/separator";
import { createProduct, updateProduct } from "@/server/actions/product-actions";
import { toast } from "sonner";
import { format } from "date-fns";

if (typeof window !== "undefined") {
  preload("/api/categories", fetcher);
}

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  price: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Price must be a positive number"),
  costPrice: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !isNaN(num) && num >= 0;
  }, "Cost price must be a positive number"),
  categoryId: z.string().optional(),
  reorderPoint: z.string().refine((val) => {
    const num = Number.parseInt(val);
    return !isNaN(num) && num >= 0;
  }, "Reorder point must be a positive number"),
  maxStock: z.string().refine((val) => {
    const num = Number.parseInt(val);
    return !isNaN(num) && num > 0;
  }, "Max stock must be greater than 0"),
  unit: z.string(),
  weight: z.string().optional(),
});

const units = [
  { value: "pcs", label: "Pieces" },
  { value: "kg", label: "Kilograms" },
  { value: "lbs", label: "Pounds" },
  { value: "m", label: "Meters" },
  { value: "ft", label: "Feet" },
  { value: "l", label: "Liters" },
  { value: "gal", label: "Gallons" },
];

export default function ProductForm({ product }: { product?: SelectProduct }) {
  const {
    data: categoriesData,
    error: categoriesError,
    isLoading: isCategoriesLoading,
  } = useSwr<SelectCategory[]>("/api/categories", fetcher);

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
    };
    const req = product
      ? await updateProduct(product.id, productData)
      : await createProduct(productData);
    if (req.data) {
      form.reset();
      toast.success("Product added successfully", {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error("error adding product", {
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
                <FormLabel>Product Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
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
                  <FormLabel>SKU *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., PROD-001" {...field} />
                  </FormControl>
                  <FormDescription>
                    Stock Keeping Unit (unique identifier)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="barcode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Barcode</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter barcode" {...field} />
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
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue placeholder="Select product's category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {isCategoriesLoading && <div>Loading categories...</div>}
                    {categoriesError && (
                      <div>Error loading categories. Please try again.</div>
                    )}

                    {categoriesData?.map((category) => (
                      <SelectItem
                        value={category.name}
                        key={category.id}
                        disabled={!category.isActive}
                      >
                        {category.name}
                        <Check
                          className={cn(
                            "ml-auto",
                            category.id === field.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </SelectItem>
                    ))}
                  </SelectContent>
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
                  <FormLabel>Selling Price *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                  <FormLabel>Cost Price *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
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
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Minimum stock level</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormDescription>Maximum stock level</FormDescription>
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
                  <FormLabel>Unit</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
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
                  <FormLabel>Weight</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Weight in kg</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {product ? "Updating" : "Creating"}...
              </>
            ) : (
              `${product ? "Update" : "Create"} Product`
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export const CreateProductDialog = () => {
  return (
    <FormDialog
      title="Create New Product"
      triggerText="Create Product"
      description="Fill in the details of the new product you want to add."
    >
      <ProductForm />
    </FormDialog>
  );
};
