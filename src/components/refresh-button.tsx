"use client";

import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { handleRefresh } from "@/server/helpers/general-purpose";
import { Button } from "./ui/button";
import { useQueryClient } from "@tanstack/react-query";

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  async function reloadAction() {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await handleRefresh();
    await queryClient.invalidateQueries();
    setLoading(false);
  }

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={reloadAction}
      disabled={loading}
    >
      <RefreshCwIcon size={16} className={loading ? "animate-spin" : ""} />
    </Button>
  );
}
