"use client";

import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { handleRefresh } from "@/server/helpers/general-purpose";
import { Button } from "./ui/button";

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
