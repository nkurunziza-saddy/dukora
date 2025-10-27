"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SavingsGoalCalculator() {
  const t = useTranslations("financialCalculator");

  const [targetAmount, setTargetAmount] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(0);
  const [yearsToGoal, setYearsToGoal] = useState(0);

  const calculateYearsToGoal = () => {
    if (annualContribution <= 0) {
      setYearsToGoal(Infinity);
      return;
    }
    setYearsToGoal((targetAmount - currentSavings) / annualContribution);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Savings Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="targetAmount">
                {t("savingsCalculator.targetAmountLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="targetAmount"
                onBlur={calculateYearsToGoal}
                onChange={(e) =>
                  setTargetAmount(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter target amount"
                type="number"
                value={targetAmount}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="currentSavings">
                {t("savingsCalculator.currentSavingsLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="currentSavings"
                onBlur={calculateYearsToGoal}
                onChange={(e) =>
                  setCurrentSavings(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter current savings"
                type="number"
                value={currentSavings}
              />
            </div>
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium"
                htmlFor="annualContribution"
              >
                {t("savingsCalculator.annualContributionLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="annualContribution"
                onBlur={calculateYearsToGoal}
                onChange={(e) =>
                  setAnnualContribution(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter annual contribution"
                type="number"
                value={annualContribution}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
            Time to Goal
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="yearsToGoal"
              >
                {t("savingsCalculator.yearsToGoalLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="yearsToGoal"
                readOnly
                type="number"
                value={yearsToGoal === Infinity ? "∞" : yearsToGoal.toFixed(2)}
              />
            </div>
            {yearsToGoal > 0 && yearsToGoal !== Infinity && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Remaining Amount:</span> $
                  {(targetAmount - currentSavings).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Annual Contribution:</span> $
                  {annualContribution.toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Monthly Contribution:</span> $
                  {(annualContribution / 12).toFixed(2)}
                </p>
              </div>
            )}
            {yearsToGoal === Infinity && (
              <div className="mt-4 p-3 rounded-md bg-warning/5 border border-warning/20">
                <p className="text-sm text-warning">
                  <span className="font-medium">Cannot reach goal:</span> Annual
                  contribution is too low
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
