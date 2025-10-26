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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("savingsCalculator.title")}</CardTitle>
        <CardDescription>{t("savingsCalculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="targetAmount">
            {t("savingsCalculator.targetAmountLabel")}
          </Label>
          <Input
            id="targetAmount"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentSavings">
            {t("savingsCalculator.currentSavingsLabel")}
          </Label>
          <Input
            id="currentSavings"
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(parseFloat(e.target.value) || 0)}
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualContribution">
            {t("savingsCalculator.annualContributionLabel")}
          </Label>
          <Input
            id="annualContribution"
            type="number"
            value={annualContribution}
            onChange={(e) =>
              setAnnualContribution(parseFloat(e.target.value) || 0)
            }
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="yearsToGoal">
            {t("savingsCalculator.yearsToGoalLabel")}
          </Label>
          <Input
            id="yearsToGoal"
            type="number"
            value={yearsToGoal.toFixed(2)}
            readOnly
          />
        </div>
      </CardPanel>
    </Card>
  );
}
