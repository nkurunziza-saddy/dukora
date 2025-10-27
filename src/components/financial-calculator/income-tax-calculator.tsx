"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function IncomeTaxCalculator() {
  const t = useTranslations("financialCalculator");

  const [annualIncome, setAnnualIncome] = useState(0);
  const [annualTax, setAnnualTax] = useState(0);
  const [monthlyTax, setMonthlyTax] = useState(0);

  const calculatePIT = () => {
    let tax = 0;
    let remainingIncome = annualIncome;

    if (remainingIncome > 2400000) {
      tax += (remainingIncome - 2400000) * 0.3;
      remainingIncome = 2400000;
    }
    if (remainingIncome > 1200000) {
      tax += (remainingIncome - 1200000) * 0.2;
      remainingIncome = 1200000;
    }
    if (remainingIncome > 720000) {
      tax += (remainingIncome - 720000) * 0.1;
      remainingIncome = 720000;
    }
    // 0 - 720,000 is 0%

    setAnnualTax(tax);
    setMonthlyTax(tax / 12);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Income Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="annualIncome">
                {t("incomeTaxCalculator.annualIncomeLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="annualIncome"
                onBlur={calculatePIT}
                onChange={(e) =>
                  setAnnualIncome(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter annual income"
                type="number"
                value={annualIncome}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
            Tax Calculation
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="annualTax"
              >
                {t("incomeTaxCalculator.annualTaxLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="annualTax"
                readOnly
                type="number"
                value={annualTax.toFixed(2)}
              />
            </div>
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="monthlyTax"
              >
                {t("incomeTaxCalculator.monthlyTaxLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="monthlyTax"
                readOnly
                type="number"
                value={monthlyTax.toFixed(2)}
              />
            </div>
            {annualTax > 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Net Annual Income:</span> $
                  {(annualIncome - annualTax).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Net Monthly Income:</span> $
                  {((annualIncome - annualTax) / 12).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Tax Rate:</span>{" "}
                  {((annualTax / annualIncome) * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
