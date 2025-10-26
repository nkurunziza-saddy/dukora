"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("incomeTaxCalculator.title")}</CardTitle>
        <CardDescription>
          {t("incomeTaxCalculator.description")}
        </CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="annualIncome">
            {t("incomeTaxCalculator.annualIncomeLabel")}
          </Label>
          <Input
            id="annualIncome"
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(parseFloat(e.target.value) || 0)}
            onBlur={calculatePIT}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualTax">
            {t("incomeTaxCalculator.annualTaxLabel")}
          </Label>
          <Input
            id="annualTax"
            type="number"
            value={annualTax.toFixed(2)}
            readOnly
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthlyTax">
            {t("incomeTaxCalculator.monthlyTaxLabel")}
          </Label>
          <Input
            id="monthlyTax"
            type="number"
            value={monthlyTax.toFixed(2)}
            readOnly
          />
        </div>
      </CardPanel>
    </Card>
  );
}
