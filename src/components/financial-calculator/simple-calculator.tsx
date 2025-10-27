"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SimpleCalculator() {
  const t = useTranslations("financialCalculator");

  const [principal, setPrincipal] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [time, setTime] = useState(0);
  const [result, setResult] = useState(0);

  const calculateSimpleInterest = () => {
    setResult(principal * (1 + (interestRate / 100) * time));
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Input Values
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="principal">
                {t("simpleCalculator.principalLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="principal"
                onBlur={calculateSimpleInterest}
                onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
                placeholder="Enter principal amount"
                type="number"
                value={principal}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="interestRate">
                {t("simpleCalculator.interestRateLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="interestRate"
                onBlur={calculateSimpleInterest}
                onChange={(e) =>
                  setInterestRate(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter interest rate (%)"
                type="number"
                value={interestRate}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="time">
                {t("simpleCalculator.timeLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="time"
                onBlur={calculateSimpleInterest}
                onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
                placeholder="Enter time period"
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
            Calculation Result
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="result"
              >
                {t("simpleCalculator.resultLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="result"
                readOnly
                type="number"
                value={result.toFixed(2)}
              />
            </div>
            {result > 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Interest Earned:</span> $
                  {(result - principal).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Total Amount:</span> $
                  {result.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
