"use client";

import { useEffect, useState } from "react";

export type ViewMode = "grid" | "list";

export function useProductView() {
  const [view, setView] = useState<ViewMode>("grid");

  useEffect(() => {
    const savedView = localStorage.getItem("productView") as ViewMode;
    if (savedView) {
      setView(savedView);
    }

    const handleViewChange = (e: Event) => {
      const customEvent = e as CustomEvent<ViewMode>;
      setView(customEvent.detail);
    };

    window.addEventListener("viewChange", handleViewChange);
    return () => window.removeEventListener("viewChange", handleViewChange);
  }, []);

  return view;
}
