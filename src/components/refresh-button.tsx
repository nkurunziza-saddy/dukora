"use client";

import { useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";
import { handleRefresh } from "@/server/helpers/general-purpose";
import { Button } from "./ui/button";

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
      disabled={loading}
      onClick={reloadAction}
      size="icon"
      variant="outline"
    >
      <RefreshCwIcon className={loading ? "animate-spin" : ""} size={16} />
    </Button>
  );
}
