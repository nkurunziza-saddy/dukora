"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircleIcon, PlusIcon, XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SelectCategory } from "@/lib/schema/schema-types";
import { upsertManyCategories } from "@/server/actions/category-actions";
import { defaultCategories } from "@/utils/constants";
import { categoriesSchema, LIMITS } from "./settings-utils";

export function EditCategories({
  categories,
}: {
  categories: SelectCategory[];
}) {
  const t = useTranslations("forms");
  const [newCategory, setNewCategory] = useState("");

  const form = useForm({
    validators: {
      onBlur: categoriesSchema,
    },
    defaultValues: {
      categories: categories
        ? categories.map((cat) => {
            return cat.value;
          })
        : [],
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await upsertManyCategories(value.categories);
        if (result.error) {
          toast.error("Failed to update categories", {
            description: result.error,
          });
        } else {
          toast.success("Categories updated successfully", {
            description: "Your categories have been updated.",
          });
        }
      } catch (error) {
        console.error("Error updating categories:", error);
      }
    },
  });

  return (
    <form
      id="edit-categories-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <form.Field mode="array" name="categories">
        {(field) => {
          const currentCategories = field.state.value || [];
          const isAtLimit = currentCategories.length >= LIMITS.CATEGORY_LIMIT;
          const remainingSlots =
            LIMITS.CATEGORY_LIMIT - currentCategories.length;

          const toggleCategory = (category: string) => {
            const idx = currentCategories.indexOf(category);
            if (idx >= 0) {
              field.removeValue(idx);
            } else {
              if (currentCategories.length >= LIMITS.CATEGORY_LIMIT) {
                toast.error(
                  `You can select up to ${LIMITS.CATEGORY_LIMIT} categories.`,
                );
                return;
              }
              field.pushValue(category);
            }
          };

          const handleAddCustom = () => {
            const trimmed = newCategory.trim();
            if (!trimmed) return;
            if (currentCategories.includes(trimmed)) {
              toast.error("Category already added");
              return;
            }
            if (currentCategories.length >= LIMITS.CATEGORY_LIMIT) {
              toast.error(
                `You can select up to ${LIMITS.CATEGORY_LIMIT} categories.`,
              );
              return;
            }
            field.pushValue(trimmed);
            setNewCategory("");
          };

          return (
            <FieldGroup className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {remainingSlots > 0
                      ? `${remainingSlots} ${
                          remainingSlots === 1 ? "slot" : "slots"
                        } remaining`
                      : "Category limit reached"}
                  </p>
                </div>
                <Badge variant={isAtLimit ? "error" : "secondary"}>
                  {currentCategories.length}/{LIMITS.CATEGORY_LIMIT}
                </Badge>
              </div>

              {isAtLimit && (
                <Alert variant="error">
                  <AlertCircleIcon className="h-4 w-4" />
                  <AlertDescription>
                    You've reached the maximum limit of {LIMITS.CATEGORY_LIMIT}{" "}
                    categories. Remove some categories to add new ones.
                  </AlertDescription>
                </Alert>
              )}

              <FieldError errors={field.state.meta.errors} />

              <div>
                <h4 className="font-medium mb-4">{t("chooseCategories")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {defaultCategories.map((category) => {
                    const isSelected = currentCategories.some(
                      (cat) => cat === category,
                    );
                    const canSelect = !isAtLimit || isSelected;

                    return (
                      <button
                        className={`p-4 border rounded-lg transition-colors w-full text-left ${
                          isSelected
                            ? "border-input bg-muted/70"
                            : canSelect
                              ? "cursor-pointer hover:bg-muted/50"
                              : "opacity-50 cursor-not-allowed"
                        }`}
                        key={category}
                        onClick={() => canSelect && toggleCategory(category)}
                        type="button"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-sm">{category}</h5>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">{t("addCustomCategories")}</h4>
                <div className="flex gap-2 mb-4">
                  <Input
                    disabled={isAtLimit}
                    id="customCategoryInput"
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddCustom();
                      }
                    }}
                    placeholder={t("enterCategoryName")}
                    value={newCategory}
                  />
                  <Button
                    disabled={isAtLimit}
                    onClick={handleAddCustom}
                    type="button"
                    variant="outline"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                </div>

                {currentCategories.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {currentCategories.map((category, index) => (
                        <Button
                          aria-label={`Remove category ${index + 1}`}
                          key={`${category}-${index}`}
                          onClick={() => field.removeValue(index)}
                          size="xs"
                          type="button"
                          variant="outline"
                        >
                          <span className="">
                            {category} <XIcon className="inline-block ml-1" />
                          </span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FieldGroup>
          );
        }}
      </form.Field>
      <div className="mt-6">
        <Button
          disabled={form.state.isSubmitting}
          form="edit-categories-form"
          type="submit"
        >
          {form.state.isSubmitting ? t("saving") : t("saveCategories")}
        </Button>
      </div>
    </form>
  );
}
