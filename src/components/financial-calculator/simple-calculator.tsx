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
  const t = useTranslations("financial_calculator");

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
        <CardTitle>{t("simple_calculator.title")}</CardTitle>
        <CardDescription>{t("simple_calculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="principal">
            {t("simple_calculator.principal_label")}
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
            {t("simple_calculator.interest_rate_label")}
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
          <Label htmlFor="time">{t("simple_calculator.time_label")}</Label>
          <Input
            id="time"
            type="number"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value) || 0)}
            onBlur={calculateSimpleInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="result">{t("simple_calculator.result_label")}</Label>
          <Input id="result" type="number" value={result.toFixed(2)} readOnly />
        </div>
      </CardPanel>
    </Card>
  );
}
