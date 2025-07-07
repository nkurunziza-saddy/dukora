"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SelectWarehouse } from "@/lib/schema/schema-types";
import { createManyWarehouses } from "@/server/actions/warehouse-actions";
import { toast } from "sonner";

const WAREHOUSE_LIMIT = 10;
const NAME_LIMIT = 100;

const formSchema = z
  .object({
    warehouses: z
      .array(
        z.object({
          name: z
            .string()
            .min(1, "Warehouse name is required")
            .max(NAME_LIMIT, `Name cannot exceed ${NAME_LIMIT} characters`),
          isDefault: z.boolean(),
        })
      )
      .min(1, "At least one warehouse is required")
      .max(WAREHOUSE_LIMIT, `You can have up to ${WAREHOUSE_LIMIT} warehouses`),
  })
  .refine((data) => data.warehouses.filter((w) => w.isDefault).length === 1, {
    message: "Exactly one warehouse must be set as default",
    path: ["warehouses"],
  });

export function EditWarehouses({
  warehouses,
}: {
  warehouses?: SelectWarehouse[];
}) {
  const t = useTranslations("forms");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      warehouses: warehouses?.length
        ? warehouses.map((w) => ({
            name: w.name,
            isDefault: w.isDefault || false,
          }))
        : [
            {
              name: "",
              isDefault: true,
            },
          ],
    },
  });

  const {
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = form;

  const currentWarehouses = watch("warehouses");
  const isAtLimit = currentWarehouses.length >= WAREHOUSE_LIMIT;
  const remainingSlots = WAREHOUSE_LIMIT - currentWarehouses.length;

  const addWarehouse = () => {
    if (isAtLimit) return;

    const currentWarehouses = getValues("warehouses");
    setValue("warehouses", [
      ...currentWarehouses,
      {
        name: "",
        isDefault: false,
      },
    ]);
  };

  const removeWarehouse = (index: number) => {
    const currentWarehouses = getValues("warehouses");
    if (currentWarehouses.length <= 1) return;

    const warehouseToRemove = currentWarehouses[index];
    const updatedWarehouses = currentWarehouses.filter((_, i) => i !== index);

    if (warehouseToRemove.isDefault && updatedWarehouses.length > 0) {
      updatedWarehouses[0].isDefault = true;
    }

    setValue("warehouses", updatedWarehouses);
  };

  const setDefaultWarehouse = (index: number) => {
    const currentWarehouses = getValues("warehouses");
    const updatedWarehouses = currentWarehouses.map((warehouse, i) => ({
      ...warehouse,
      isDefault: i === index,
    }));
    setValue("warehouses", updatedWarehouses);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await createManyWarehouses(values.warehouses);
    if (result.error) {
      toast.error("Failed to update warehouses", {
        description: result.error,
      });
      return;
    } else if (result.data) {
      toast.success("Warehouses updated successfully", {
        description: "Your warehouses have been updated.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                {t("warehousesAndBranches")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("warehouseDescription")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {remainingSlots > 0
                  ? `${remainingSlots} ${remainingSlots === 1 ? "slot" : "slots"} remaining`
                  : "Warehouse limit reached"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAtLimit ? "destructive" : "secondary"}>
                {currentWarehouses.length}/{WAREHOUSE_LIMIT}
              </Badge>
              <Button
                type="button"
                variant="outline"
                onClick={addWarehouse}
                disabled={isAtLimit}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("addLocation")}
              </Button>
            </div>
          </div>

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve reached the maximum limit of {WAREHOUSE_LIMIT}{" "}
                warehouses. Remove some warehouses to add new ones.
              </AlertDescription>
            </Alert>
          )}

          {errors.warehouses && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.warehouses.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {watch("warehouses").map(
              (
                warehouse: { name: string; isDefault: boolean },
                index: number
              ) => {
                const nameLength = warehouse.name?.length || 0;
                const nameRemaining = NAME_LIMIT - nameLength;
                const isNameNearLimit = nameLength > NAME_LIMIT * 0.8;

                return (
                  <div
                    key={index}
                    className="flex gap-4 items-start p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <FormField
                        control={form.control}
                        name={`warehouses.${index}.name` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                placeholder={t("warehousePlaceholder")}
                                maxLength={NAME_LIMIT}
                                {...field}
                              />
                            </FormControl>
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{nameRemaining} characters remaining</span>
                              <Badge
                                variant={
                                  isNameNearLimit ? "destructive" : "secondary"
                                }
                                className="text-xs"
                              >
                                {nameLength}/{NAME_LIMIT}
                              </Badge>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {warehouse.isDefault && (
                        <Badge variant="default">{t("default")}</Badge>
                      )}

                      {!warehouse.isDefault && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setDefaultWarehouse(index)}
                        >
                          {t("setDefault")}
                        </Button>
                      )}

                      {watch("warehouses").length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => removeWarehouse(index)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("saveWarehouses")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
