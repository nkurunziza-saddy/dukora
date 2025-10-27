"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CompoundInterestCalculator() {
  const t = useTranslations("financialCalculator");

  const [principal, setPrincipal] = useState(0);
  const [annualRate, setAnnualRate] = useState(0);
  const [compoundingFrequency, setCompoundingFrequency] = useState(1);
  const [time, setTime] = useState(0);
  const [futureValue, setFutureValue] = useState(0);

  const calculateCompoundInterest = () => {
    const rate = annualRate / 100;
    const n = compoundingFrequency;
    const t_years = time;
    setFutureValue(principal * (1 + rate / n) ** (n * t_years));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Investment Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="principal">
                {t("compoundCalculator.principalLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="principal"
                onBlur={calculateCompoundInterest}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                placeholder="Enter principal amount"
                type="number"
                value={principal}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="annualRate">
                {t("compoundCalculator.annualRateLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="annualRate"
                onBlur={calculateCompoundInterest}
                onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
                placeholder="Enter annual interest rate (%)"
                type="number"
                value={annualRate}
              />
            </div>
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium"
                htmlFor="compoundingFrequency"
              >
                {t("compoundCalculator.compoundingFrequencyLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="compoundingFrequency"
                onBlur={calculateCompoundInterest}
                onChange={(e) =>
                  setCompoundingFrequency(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter compounding frequency"
                type="number"
                value={compoundingFrequency}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="time">
                {t("compoundCalculator.timeLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="time"
                onBlur={calculateCompoundInterest}
                onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
                placeholder="Enter time period (years)"
                type="number"
                value={time}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
            Future Value
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="futureValue"
              >
                {t("compoundCalculator.futureValueLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="futureValue"
                readOnly
                type="number"
                value={futureValue.toFixed(2)}
              />
            </div>
            {futureValue > 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Interest Earned:</span> $
                  {(futureValue - principal).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Total Amount:</span> $
                  {futureValue.toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Compounding:</span>{" "}
                  {compoundingFrequency}x per year
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
