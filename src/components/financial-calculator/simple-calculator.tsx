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
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("simpleCalculator.title")}</CardTitle>
        <CardDescription>{t("simpleCalculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="principal">
            {t("simpleCalculator.principalLabel")}
          </Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            onBlur={calculateSimpleInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interestRate">
            {t("simpleCalculator.interestRateLabel")}
          </Label>
          <Input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            onBlur={calculateSimpleInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">{t("simpleCalculator.timeLabel")}</Label>
          <Input
            id="time"
            type="number"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
            onBlur={calculateSimpleInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="result">{t("simpleCalculator.resultLabel")}</Label>
          <Input id="result" type="number" value={result.toFixed(2)} readOnly />
        </div>
      </CardPanel>
    </Card>
  );
}
