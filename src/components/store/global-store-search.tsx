"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { searchProductsGlobally } from "@/server/actions/inventory/products-actions";

interface GlobalStoreSearchProps {
  className?: string;
  placeholder?: string;
}

interface SearchResult {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
}

export function GlobalStoreSearch({
  className,
  placeholder,
}: GlobalStoreSearchProps) {
  const t = useTranslations("store");

  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const searchProducts = useCallback(async (query: string) => {
    if (!query || query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchProductsGlobally(query, 5);
      if (response.data) {
        setResults(response.data as SearchResult[]);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, searchProducts]);

  const handleResultClick = () => {
    setIsOpen(false);
    setValue("");
    setResults([]);
  };

  return (
    <Popover modal onOpenChange={setIsOpen} open={isOpen}>
      <PopoverTrigger
        className={cn("relative w-full", className)}
        render={<div />}
      >
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-7"
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder || t("searchProducts")}
          value={value}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </PopoverTrigger>
      <PopoverPopup
        align="start"
        className="w-[400px] max-w-[90vw] p-0"
        initialFocus={false}
        sideOffset={8}
      >
        {results.length > 0 ? (
          <div className="max-h-[400px] overflow-y-auto">
            {results.map((result) => (
              <Link
                className="flex items-start gap-3 p-3 hover:bg-surface transition-colors border-b border-border last:border-0"
                href={`/store/${result.businessId}/products/${result.id}`}
                key={result.id}
                onClick={handleResultClick}
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {result.name}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {result.businessName}
                  </p>
                  {result.description && (
                    <p className="text-xs text-text-secondary mt-1 line-clamp-1">
                      {result.description}
                    </p>
                  )}
                </div>
                <div className="text-sm font-semibold text-foreground whitespace-nowrap">
                  ${parseFloat(result.price || "0").toFixed(2)}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {value.trim().length > 0
              ? t("noResults")
              : "Start typing to search..."}
          </div>
        )}
      </PopoverPopup>
    </Popover>
  );
}
