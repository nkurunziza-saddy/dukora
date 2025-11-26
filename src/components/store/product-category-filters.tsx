"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import { getCategoriesForStore } from "@/server/actions/inventory/products-actions";

interface Category {
  id: string;
  value: string;
  description: string | null;
  productCount: number;
}

interface ProductCategoryFiltersProps {
  businessId: string;
}

export function ProductCategoryFilters({
  businessId,
}: ProductCategoryFiltersProps) {
  const t = useTranslations("store");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [categories, setCategories] = useState<Category[]>([]);

  const currentCategory = searchParams.get("category") || "";

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await getCategoriesForStore(businessId);
      if (data) {
        setCategories(data.filter((cat) => cat.productCount > 0));
      }
    };
    fetchCategories();
  }, [businessId]);

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (categoryId && categoryId !== currentCategory) {
      params.set("category", categoryId);
    } else {
      params.delete("category");
    }

    params.delete("page");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const visibleCategories = categories.slice(0, 3);

  return (
    <div className="flex flex-wrap gap-2">
      <Menu>
        <MenuTrigger
          render={
            <Button
              size="sm"
              variant={currentCategory === "" ? "default" : "outline"}
            />
          }
        >
          {t("allCategories")}
        </MenuTrigger>
        <MenuPopup className="min-w-48">
          <MenuItem onClick={() => handleCategoryChange("")}>
            {t("allCategories")}
          </MenuItem>
          {categories.map((category) => (
            <MenuItem
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.value}
              {category.productCount > 0 && (
                <span className="ml-auto text-xs opacity-70">
                  {category.productCount}
                </span>
              )}
            </MenuItem>
          ))}
        </MenuPopup>
      </Menu>

      {visibleCategories.map((category) => (
        <Button
          key={category.id}
          onClick={() => handleCategoryChange(category.id)}
          size="sm"
          variant={currentCategory === category.id ? "default" : "outline"}
        >
          {category.value}
        </Button>
      ))}
    </div>
  );
}
