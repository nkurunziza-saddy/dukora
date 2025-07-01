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
import { TriggerDialog } from "../shared/reusable-form-dialog";
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
import { useTranslations } from "next-intl";
import { TRANSACTION_TYPE } from "@/lib/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { transactionTypesObject } from "@/utils/constants";

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
    quantity: z.coerce.number().positive(t("quantityPositive")),
    note: z.string().optional(),
    reference: z.string().optional(),
    type: z.enum([...TRANSACTION_TYPE]),
  });

  type SaleTransactionFormData = z.infer<typeof saleTransactionSchema>;
  const {
    data: productsData,
    error: productsError,
    isLoading: isProductsLoading,
  } = useSwr<SelectProduct[]>("/api/products", fetcher);

  const form = useForm<SaleTransactionFormData>({
    resolver: zodResolver(saleTransactionSchema),
    defaultValues: {
      productId: transaction ? transaction.productId : "",
      warehouseItemId: transaction ? transaction.warehouseItemId : "",
      quantity: transaction ? Math.abs(transaction.quantity) : 1,
      note: transaction ? transaction.note ?? "" : "",
      reference: transaction ? transaction.reference ?? "" : "",
      type: transaction ? transaction.type : "DAMAGE",
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

  const onSubmit = async (data: SaleTransactionFormData) => {
    try {
      const formData: Omit<
        InsertTransaction,
        "id" | "businessId" | "createdBy"
      > = {
        productId: data.productId,
        warehouseItemId: data.warehouseItemId,
        quantity: data.quantity,
        type: data.type,
        warehouseId: selectedWarehouseItem?.warehouseId ?? "",
        note: data.note,
        reference: data.reference,
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
      console.log(error);
      toast.error(tCommon("error"), {
        description: t("transactionAddFailed"),
      });
    }
  };

  const { isSubmitting } = form.formState;

  if (productsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadProducts")}</AlertDescription>
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
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("type")}</FormLabel>
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
                    {transactionTypesObject.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
                            t("selectProduct")
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
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
                  <FormLabel>{t("warehouseLocation")} *</FormLabel>
                  {isProductDetailsLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {t("loadingWarehouses")}
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
                                  {tInventory("onHand")}:{" "}
                                  {selectedWarehouseItem?.quantity || 0}
                                </Badge>
                              </div>
                            ) : (
                              tInventory("selectWarehouse")
                            )}
                            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput placeholder={t("searchWarehouses")} />
                          <CommandList>
                            <CommandEmpty>
                              {t("noWarehousesFound")}
                            </CommandEmpty>
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
                                        {tInventory("onHand")}: {item.quantity}
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
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("quantity")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={t("enterQuantity")}
                    min="1"
                    max={selectedWarehouseItem?.quantity || undefined}
                    step="1"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tCommon("reference")} {t("poNumber")}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t("referencePlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{t("referenceDescription")}</FormDescription>
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
                    placeholder={t("notePlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormDescription>{t("noteDescription")}</FormDescription>
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
    </Form>
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
