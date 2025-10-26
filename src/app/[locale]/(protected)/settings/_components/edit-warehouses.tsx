"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircleIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SelectWarehouse } from "@/lib/schema/schema-types";
import { createManyWarehouses } from "@/server/actions/warehouse-actions";
import { LIMITS, warehousesSchema } from "./settings-utils";

export function EditWarehouses({
  warehouses,
}: {
  warehouses?: SelectWarehouse[];
}) {
  const t = useTranslations("forms");
  const form = useForm({
    validators: {
      onBlur: warehousesSchema,
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
        (w) => !existingNames.has(w.name),
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

  return (
    <form
      id="edit-warehouses-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field name="warehouses" mode="array">
        {(field) => {
          const currentWarehouses = field.state.value;
          const isAtLimit = currentWarehouses.length >= LIMITS.WAREHOUSE_LIMIT;
          const remainingSlots =
            LIMITS.WAREHOUSE_LIMIT - currentWarehouses.length;

          const setDefaultWarehouse = (index: number) => {
            const updatedWarehouses = currentWarehouses.map((warehouse, i) => ({
              ...warehouse,
              isDefault: i === index,
            }));
            field.setValue(updatedWarehouses);
          };

          return (
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
                    {currentWarehouses.length}/{LIMITS.WAREHOUSE_LIMIT}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      field.pushValue({ name: "", isDefault: false })
                    }
                    disabled={isAtLimit}
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {t("addLocation")}
                  </Button>
                </div>
              </div>

              {isAtLimit && (
                <Alert variant="error">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    You've reached the maximum limit of {LIMITS.WAREHOUSE_LIMIT}{" "}
                    warehouses. Remove some warehouses to add new ones.
                  </AlertDescription>
                </Alert>
              )}

              <FieldError errors={field.state.meta.errors} />

              <div className="space-y-4">
                {currentWarehouses.map((warehouse, index) => {
                  const nameLength = warehouse.name?.length || 0;
                  const nameRemaining = LIMITS.NAME_MAX - nameLength;
                  const isNameNearLimit = nameLength > LIMITS.NAME_MAX * 0.8;

                  return (
                    <div
                      key={index}
                      className="flex gap-4 items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1 space-y-2">
                        <form.Field name={`warehouses[${index}].name` as const}>
                          {(subField) => (
                            <Field>
                              <Input
                                placeholder={t("warehousePlaceholder")}
                                maxLength={LIMITS.NAME_MAX}
                                id={subField.name}
                                name={subField.name}
                                value={subField.state.value}
                                onBlur={subField.handleBlur}
                                onChange={(e) =>
                                  subField.handleChange(e.target.value)
                                }
                              />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {nameRemaining} characters remaining
                                </span>
                                <Badge
                                  variant={
                                    isNameNearLimit ? "error" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {nameLength}/{LIMITS.NAME_MAX}
                                </Badge>
                              </div>
                              <FieldError errors={subField.state.meta.errors} />
                            </Field>
                          )}
                        </form.Field>
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
                            onClick={() => field.removeValue(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2Icon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </FieldGroup>
          );
        }}
      </form.Field>
      <div className="mt-6">
        <Button
          type="submit"
          form="edit-warehouses-form"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting ? t("saving") : t("saveWarehouses")}
        </Button>
      </div>
    </form>
  );
}
