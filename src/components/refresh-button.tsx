"use client";

import { handleRefresh } from "@/server/helpers/general-purpose";
import { Button } from "./ui/button";
import { useState } from "react";
import { RefreshCw } from "lucide-react";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);

  async function reloadAction() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await handleRefresh();
    setLoading(false);
  }

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={reloadAction}
      disabled={loading}
    >
      <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
    </Button>
  );
}
