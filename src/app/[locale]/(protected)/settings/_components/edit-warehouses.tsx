"use client";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { SelectWarehouse } from "@/lib/schema/schema-types";
import { createManyWarehouses } from "@/server/actions/warehouse-actions";
import { toast } from "sonner";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";

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

type WarehouseFormData = z.infer<typeof formSchema>;

export function EditWarehouses({
  warehouses,
}: {
  warehouses?: SelectWarehouse[];
}) {
  const t = useTranslations("forms");
  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      warehouses: warehouses
        ? warehouses.map((w) => ({
            name: w.name,
            isDefault: w.isDefault || false,
          }))
        : [
            {
              name: "Main Warehouse",
              isDefault: true,
            },
          ],
    },
    onSubmit: async ({ value }) => {
      if (!warehouses) return;
      const existingNames = new Set(warehouses.map((w) => w.name));
      const expectedNames = new Set(value.warehouses.map((w) => w.name));

      const created = value.warehouses.filter(
        (w) => !existingNames.has(w.name)
      );

      const deleted = warehouses.filter((w) => !expectedNames.has(w.name));

      const result = await createManyWarehouses({
        created,
        deleted,
      });
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
    },
  });

  const currentWarehouses = form.state.values.warehouses;
  const isAtLimit = currentWarehouses.length >= WAREHOUSE_LIMIT;
  const remainingSlots = WAREHOUSE_LIMIT - currentWarehouses.length;

  const addWarehouse = () => {
    if (isAtLimit) return;

    const currentWarehouses = form.state.values.warehouses;
    form.setFieldValue("warehouses", [
      ...currentWarehouses,
      {
        name: "",
        isDefault: false,
      },
    ]);
  };

  const removeWarehouse = (index: number) => {
    const currentWarehouses = form.state.values.warehouses;
    if (currentWarehouses.length <= 1) return;

    const warehouseToRemove = currentWarehouses[index];
    const updatedWarehouses = currentWarehouses.filter((_, i) => i !== index);

    if (warehouseToRemove.isDefault && updatedWarehouses.length > 0) {
      updatedWarehouses[0].isDefault = true;
    }

    form.setFieldValue("warehouses", updatedWarehouses);
  };

  const setDefaultWarehouse = (index: number) => {
    const currentWarehouses = form.state.values.warehouses;
    const updatedWarehouses = currentWarehouses.map((warehouse, i) => ({
      ...warehouse,
      isDefault: i === index,
    }));
    form.setFieldValue("warehouses", updatedWarehouses);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingSlots > 0
                ? `${remainingSlots} ${
                    remainingSlots === 1 ? "slot" : "slots"
                  } remaining`
                : "Warehouse limit reached"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAtLimit ? "error" : "secondary"}>
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
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You&apos;ve reached the maximum limit of {WAREHOUSE_LIMIT}{" "}
              warehouses. Remove some warehouses to add new ones.
            </AlertDescription>
          </Alert>
        )}

        <form.Field
          name="warehouses"
          children={(field) => <FieldError errors={field.state.meta.errors} />}
        />

        <div className="space-y-4">
          {currentWarehouses.map(
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
                    <form.Field
                      name={`warehouses[${index}].name` as const}
                      children={(field) => (
                        <Field>
                          <Input
                            placeholder={t("warehousePlaceholder")}
                            maxLength={NAME_LIMIT}
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{nameRemaining} characters remaining</span>
                            <Badge
                              variant={isNameNearLimit ? "error" : "secondary"}
                              className="text-xs"
                            >
                              {nameLength}/{NAME_LIMIT}
                            </Badge>
                          </div>
                          <FieldError errors={field.state.meta.errors} />
                        </Field>
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

                    {currentWarehouses.length > 1 && (
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
      </FieldGroup>

      <div className="mt-6">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? t("saving") : t("saveWarehouses")}
        </Button>
      </div>
    </form>
  );
}
