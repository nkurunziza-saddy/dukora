"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { FormDialog } from "../form-dialog";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  SelectTransaction,
  SelectProduct,
  ExtendedProductPayload,
  InsertTransaction,
} from "@/lib/schema/schema-types";
import { fetcher, cn } from "@/lib/utils";
import useSwr from "swr";
import { preload } from "swr";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { toast } from "sonner";
import { createTransaction } from "@/server/actions/transaction-actions";
import { format } from "date-fns";

if (typeof window !== "undefined") {
  preload("/api/products", fetcher);
}

const saleTransactionSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  warehouseItemId: z.string().min(1, "Warehouse is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().optional(),
  reference: z.string().optional(),
});

type SaleTransactionFormData = z.infer<typeof saleTransactionSchema>;

export default function SaleTransactionForm({
  saleTransaction,
}: {
  saleTransaction?: SelectTransaction;
}) {
  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
  } = useSwr<SelectProduct[]>("/api/products", fetcher);

  const form = useForm<SaleTransactionFormData>({
    resolver: zodResolver(saleTransactionSchema),
    defaultValues: {
      productId: saleTransaction ? saleTransaction.productId : "",
      warehouseItemId: saleTransaction ? saleTransaction.warehouseItemId : "",
      quantity: saleTransaction ? Math.abs(saleTransaction.quantity) : 1,
      notes: saleTransaction ? saleTransaction.notes ?? "" : "",
      reference: saleTransaction ? saleTransaction.reference ?? "" : "",
    },
  });

  const productId = form.watch("productId");
  const selectedProduct = productsData?.find((p) => p.id === productId);

  const {
    data: productDetailsData,
    error: productDetailsError,
    isLoading: isProductDetailsLoading,
  } = useSwr<ExtendedProductPayload>(
    productId ? `/api/products/${productId}` : null,
    fetcher
  );

  const selectedWarehouseItem = productDetailsData?.warehouseItems.find(
    (item) => item.id === form.watch("warehouseItemId")
  );
  const quantity = form.watch("quantity");
  const hasInsufficientStock =
    selectedWarehouseItem && quantity > selectedWarehouseItem.quantity;
  const onSubmit = async (data: SaleTransactionFormData) => {
    try {
      const formData: Omit<
        InsertTransaction,
        "id" | "businessId" | "createdBy"
      > = {
        productId: data.productId,
        warehouseItemId: data.warehouseItemId,
        quantity: data.quantity,
        type: "SALE",
        warehouseId: selectedWarehouseItem?.warehouseId ?? "",
        notes: data.notes,
        reference: data.reference,
      };
      const req = await createTransaction(formData);
      if (req.data) {
        form.reset();
        toast.success("Transaction added successfully", {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error("error", {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error", {
        description: "Failed to record sale transaction",
      });
    }
  };

  const { isSubmitting } = form.formState;

  if (productsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load products. Please refresh the page and try again.
        </AlertDescription>
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
                <FormLabel>Product *</FormLabel>
                {isProductsLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Loading products...
                    </span>
                  </div>
                ) : productsData ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
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
                            "Select product"
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search products..." />
                        <CommandList>
                          <CommandEmpty>No products found.</CommandEmpty>
                          <CommandGroup>
                            {productsData.map((product) => (
                              <CommandItem
                                key={product.id}
                                onSelect={() => {
                                  form.setValue("productId", product.id);
                                  form.setValue("warehouseItemId", "");
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
                    </PopoverContent>
                  </Popover>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />

          {productId && (
            <FormField
              control={form.control}
              name="warehouseItemId"
              render={({ field }) => (
                <FormItem className="flex flex-col space-y-2">
                  <FormLabel>Warehouse Location *</FormLabel>
                  {isProductDetailsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        Loading warehouses...
                      </span>
                    </div>
                  ) : productDetailsData ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
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
                                  {selectedWarehouseItem?.warehouse.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  Stock: {selectedWarehouseItem?.quantity || 0}
                                </Badge>
                              </div>
                            ) : (
                              "Select warehouse"
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search warehouses..." />
                          <CommandList>
                            <CommandEmpty>No warehouses found.</CommandEmpty>
                            <CommandGroup>
                              {productDetailsData.warehouseItems.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => {
                                    form.setValue("warehouseItemId", item.id);
                                  }}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {item.warehouse.name}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        Current Stock: {item.quantity}
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
                      </PopoverContent>
                    </Popover>
                  ) : productDetailsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load warehouse locations
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity Sold *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter quantity"
                    min="1"
                    max={selectedWarehouseItem?.quantity || undefined}
                    step="1"
                    className={hasInsufficientStock ? "border-red-500" : ""}
                  />
                </FormControl>
                <FormDescription className="flex items-center justify-between">
                  <span>This will be deducted from your inventory</span>
                  {selectedWarehouseItem && (
                    <span
                      className={cn(
                        "text-sm font-medium",
                        hasInsufficientStock
                          ? "text-red-500"
                          : "text-muted-foreground"
                      )}
                    >
                      Available: {selectedWarehouseItem.quantity}
                    </span>
                  )}
                </FormDescription>
                {hasInsufficientStock && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Insufficient stock. Only {selectedWarehouseItem?.quantity}{" "}
                      units available.
                    </AlertDescription>
                  </Alert>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reference/PO Number</FormLabel>
                <FormControl>
                  <Input placeholder="INV-001, SO-123, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Sales order number, invoice reference, or other identifier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Customer information, delivery notes, special instructions, etc."
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional notes about this sale transaction
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
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting || !form.formState.isValid || hasInsufficientStock
              }
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {saleTransaction ? "Updating" : "Recording"}...
                </>
              ) : (
                <>{saleTransaction ? "Update" : "Record"} Sale</>
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const CreateSaleTransactionDialog = () => {
  return (
    <FormDialog
      title="Record Sale Transaction"
      triggerText="Record Sale"
      description="Add new inventory by recording a sale transaction."
    >
      <SaleTransactionForm />
    </FormDialog>
  );
};
