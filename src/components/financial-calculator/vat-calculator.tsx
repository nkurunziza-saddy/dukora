"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function VATCalculator() {
  const t = useTranslations("financialCalculator");

  const [salesAmount, setSalesAmount] = useState(0);
  const [purchasesAmount, setPurchasesAmount] = useState(0);
  const [vatDue, setVatDue] = useState(0);

  const calculateVAT = () => {
    const outputVAT = salesAmount * 0.18;
    const inputVAT = purchasesAmount * 0.18;
    setVatDue(outputVAT - inputVAT);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-sm font-medium text-foreground mb-4">
            Business Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm" htmlFor="salesAmount">
                {t("vatCalculator.salesAmountLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="salesAmount"
                onBlur={calculateVAT}
                onChange={(e) =>
                  setSalesAmount(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter sales amount"
                type="number"
                value={salesAmount}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm" htmlFor="purchasesAmount">
                {t("vatCalculator.purchasesAmountLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="purchasesAmount"
                onBlur={calculateVAT}
                onChange={(e) =>
                  setPurchasesAmount(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter purchases amount"
                type="number"
                value={purchasesAmount}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-sm font-medium text-success-foreground mb-4">
            VAT Calculation
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm text-success-foreground"
                htmlFor="vatDue"
              >
                {t("vatCalculator.vatDueLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success-foreground font-semibold text-lg border-success/20"
                id="vatDue"
                readOnly
                type="number"
                value={vatDue.toFixed(2)}
              />
            </div>
            {vatDue !== 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success-foreground">
                  <span className="font-medium">Output VAT (18%):</span> $
                  {(salesAmount * 0.18).toFixed(2)}
                </p>
                <p className="text-sm text-success-foreground">
                  <span className="font-medium">Input VAT (18%):</span> $
                  {(purchasesAmount * 0.18).toFixed(2)}
                </p>
                <p className="text-sm text-success-foreground">
                  <span className="font-medium">VAT Rate:</span> 18%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
