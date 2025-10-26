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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("compoundCalculator.title")}</CardTitle>
        <CardDescription>{t("compoundCalculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="principal">
            {t("compoundCalculator.principalLabel")}
          </Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualRate">
            {t("compoundCalculator.annualRateLabel")}
          </Label>
          <Input
            id="annualRate"
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(parseFloat(e.target.value) || 0)}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="compoundingFrequency">
            {t("compoundCalculator.compoundingFrequencyLabel")}
          </Label>
          <Input
            id="compoundingFrequency"
            type="number"
            value={compoundingFrequency}
            onChange={(e) =>
              setCompoundingFrequency(parseFloat(e.target.value) || 0)
            }
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">{t("compoundCalculator.timeLabel")}</Label>
          <Input
            id="time"
            type="number"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="futureValue">
            {t("compoundCalculator.futureValueLabel")}
          </Label>
          <Input
            id="futureValue"
            type="number"
            value={futureValue.toFixed(2)}
            readOnly
          />
        </div>
      </CardPanel>
    </Card>
  );
}
