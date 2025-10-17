"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { SelectCategory } from "@/lib/schema/schema-types";
import { upsertManyCategories } from "@/server/actions/category-actions";
import { defaultCategories } from "@/utils/constants";

const CATEGORY_LIMIT = 10;

const formSchema = z.object({
  categories: z
    .array(z.string())
    .max(CATEGORY_LIMIT, `You can select up to ${CATEGORY_LIMIT} categories`),
});

export function EditCategories({
  categories,
}: {
  categories: SelectCategory[];
}) {
  const t = useTranslations("forms");

  const form = useForm({
    validators: {
      onSubmit: formSchema,
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

  const currentCategories = form.state.values.categories;
  const isAtLimit = currentCategories.length >= CATEGORY_LIMIT;
  const remainingSlots = CATEGORY_LIMIT - currentCategories.length;

  const removeCategory = (categoryToRemove: string) => {
    const currentCategories = form.state.values.categories;
    form.setFieldValue(
      "categories",
      currentCategories.filter((category) => category !== categoryToRemove),
    );
  };

  const addCustomCategory = () => {
    if (isAtLimit) return;

    const input = document.getElementById(
      "customCategoryInput",
    ) as HTMLInputElement;
    const categoryName = input?.value.trim();

    if (categoryName) {
      const currentCategories = form.state.values.categories;
      const categoryExists = currentCategories.some(
        (cat) => cat.toLowerCase() === categoryName.toLowerCase(),
      );

      if (!categoryExists && currentCategories.length < CATEGORY_LIMIT) {
        form.setFieldValue("categories", [...currentCategories, categoryName]);
        input.value = "";
      }
    }
  };

  const toggleDefaultCategory = (category: string) => {
    const currentCategories = form.state.values.categories;
    const isSelected = currentCategories.some((cat) => cat === category);

    if (isSelected) {
      form.setFieldValue(
        "categories",
        currentCategories.filter((cat) => cat !== category),
      );
    } else if (currentCategories.length < CATEGORY_LIMIT) {
      form.setFieldValue("categories", [...currentCategories, category]);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="space-y-6">
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
            {currentCategories.length}/{CATEGORY_LIMIT}
          </Badge>
        </div>

        {isAtLimit && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You&apos;ve reached the maximum limit of {CATEGORY_LIMIT}{" "}
              categories. Remove some categories to add new ones.
            </AlertDescription>
          </Alert>
        )}

        <form.Field
          name="categories"
          children={(field) => (
            <Field>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

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
                  type="button"
                  key={category}
                  className={`p-4 border rounded-lg transition-colors w-full text-left ${
                    isSelected
                      ? "border-input bg-muted/70"
                      : canSelect
                        ? "cursor-pointer hover:bg-muted/50"
                        : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={() => canSelect && toggleDefaultCategory(category)}
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
              id="customCategoryInput"
              placeholder={t("enterCategoryName")}
              disabled={isAtLimit}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomCategory();
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={addCustomCategory}
              disabled={isAtLimit}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {currentCategories.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("selectedCategories")}</p>
              <div className="flex flex-wrap gap-2">
                {currentCategories.map((category) => (
                  <Badge
                    key={category}
                    variant="secondary"
                    className="flex items-center"
                  >
                    {category}
                    <Button
                      type="button"
                      variant={"ghost"}
                      onClick={() => removeCategory(category)}
                      className="ml-0.5 px-0 rounded-full size-4"
                    >
                      <X className="size-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button type="submit">Submit</Button>
      </div>
    </form>
  );
}
