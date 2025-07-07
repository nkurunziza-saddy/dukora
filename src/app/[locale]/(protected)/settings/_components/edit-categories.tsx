"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, X, AlertCircle } from "lucide-react";
import type { SelectCategory } from "@/lib/schema/schema-types";
import { z } from "zod";
import { defaultCategories } from "@/utils/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { upsertManyCategories } from "@/server/actions/category-actions";
import { toast } from "sonner";

const CATEGORY_LIMIT = 10;

const formSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string().min(1, "Category name is required"),
        value: z.string().min(1, "Category name is required"),
      })
    )
    .max(CATEGORY_LIMIT, `You can select up to ${CATEGORY_LIMIT} categories`),
});

export function EditCategories({
  categories,
}: {
  categories: SelectCategory[];
}) {
  const t = useTranslations("forms");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: categories
        ? categories.map((cat) => ({
            name: cat.name,
            value: cat.value,
          }))
        : [],
    },
  });

  const {
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const currentCategories = watch("categories");
  const isAtLimit = currentCategories.length >= CATEGORY_LIMIT;
  const remainingSlots = CATEGORY_LIMIT - currentCategories.length;

  const removeCategory = (index: number) => {
    const currentCategories = getValues("categories");
    setValue(
      "categories",
      currentCategories.filter((_, i) => i !== index)
    );
  };

  const addCustomCategory = () => {
    if (isAtLimit) return;

    const input = document.getElementById(
      "customCategoryInput"
    ) as HTMLInputElement;
    const categoryName = input?.value.trim();

    if (categoryName) {
      const currentCategories = getValues("categories");
      const categoryExists = currentCategories.some(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );

      if (!categoryExists && currentCategories.length < CATEGORY_LIMIT) {
        const categoryValue = categoryName.toLowerCase().replace(/\s+/g, "-");
        setValue("categories", [
          ...currentCategories,
          { name: categoryName, value: categoryValue },
        ]);
        input.value = "";
      }
    }
  };

  const toggleDefaultCategory = (category: { name: string; value: string }) => {
    const currentCategories = getValues("categories");
    const isSelected = currentCategories.some(
      (cat) => cat.value === category.value
    );

    if (isSelected) {
      setValue(
        "categories",
        currentCategories.filter((cat) => cat.value !== category.value)
      );
    } else if (currentCategories.length < CATEGORY_LIMIT) {
      setValue("categories", [
        ...currentCategories,
        {
          name: category.name,
          value: category.value,
        },
      ]);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const result = await upsertManyCategories(values.categories);
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
    console.log("Categories submitted:", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {remainingSlots > 0
                  ? `${remainingSlots} ${remainingSlots === 1 ? "slot" : "slots"} remaining`
                  : "Category limit reached"}
              </p>
            </div>
            <Badge variant={isAtLimit ? "destructive" : "secondary"}>
              {currentCategories.length}/{CATEGORY_LIMIT}
            </Badge>
          </div>

          {isAtLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You&apos;ve reached the maximum limit of {CATEGORY_LIMIT}{" "}
                categories. Remove some categories to add new ones.
              </AlertDescription>
            </Alert>
          )}

          {errors.categories && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.categories.message}</AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-medium mb-4">{t("chooseCategories")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {defaultCategories.map((category) => {
                const isSelected = watch("categories").some(
                  (cat) => cat.value === category.value
                );
                const canSelect = !isAtLimit || isSelected;

                return (
                  <div
                    key={category.value}
                    className={`p-4 border rounded-lg transition-colors ${
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
                        <h5 className="font-medium text-sm">
                          {t(category.name)}
                        </h5>
                      </div>
                    </div>
                  </div>
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

            {watch("categories").length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("selectedCategories")}</p>
                <div className="flex flex-wrap gap-2">
                  {watch("categories").map((category, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center"
                    >
                      {category.name}
                      <Button
                        type="button"
                        variant={"ghost"}
                        onClick={() => removeCategory(index)}
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
    </Form>
  );
}
