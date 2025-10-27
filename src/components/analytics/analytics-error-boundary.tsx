"use client";

import { AlertCircleIcon, RefreshCwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsErrorBoundaryProps {
  error: Error;
  reset: () => void;
  errorType?: "data" | "calculation" | "network" | "permission";
}

export function AnalyticsErrorBoundary({
  error,
  reset,
  errorType = "data",
}: AnalyticsErrorBoundaryProps) {
  const t = useTranslations("analytics");

  useEffect(() => {
    console.error("Analytics error:", error);
  }, [error]);

  const getErrorMessage = () => {
    switch (errorType) {
      case "permission":
        return t("errorPermission");
      case "network":
        return t("errorNetwork");
      case "calculation":
        return t("errorCalculation");
      default:
        return t("errorGeneric");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircleIcon className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{t("errorTitle")}</CardTitle>
          <CardDescription>{getErrorMessage()}</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <Alert variant="error">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {error.message || t("errorDetails")}
            </AlertDescription>
          </Alert>
          <div className="flex gap-2">
            <Button className="flex-1" onClick={reset}>
              <RefreshCwIcon className="mr-2 h-4 w-4" />
              {t("retry")}
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
              {t("reloadPage")}
            </Button>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
