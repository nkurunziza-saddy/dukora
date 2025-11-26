"use client";

import { GridIcon, ListIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "@/lib/hooks/use-product-view";

export function ProductViewToggle() {
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const savedView = localStorage.getItem("productView") as ViewMode;
    if (savedView) {
      setView(savedView);
    }
  }, []);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    localStorage.setItem("productView", newView);
    window.dispatchEvent(new CustomEvent("viewChange", { detail: newView }));
  };

  return (
    <div className="flex border rounded-lg">
      <Button
        className="rounded-r-none"
        onClick={() => handleViewChange("grid")}
        size="sm"
        variant={view === "grid" ? "default" : "ghost"}
      >
        <GridIcon className="h-4 w-4" />
      </Button>
      <Button
        className="rounded-l-none"
        onClick={() => handleViewChange("list")}
        size="sm"
        variant={view === "list" ? "default" : "ghost"}
      >
        <ListIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
