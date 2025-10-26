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

export function LoanCalculator() {
  const t = useTranslations("financialCalculator");

  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [loanTerm, setLoanTerm] = useState(0);
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  const calculateMonthlyPayment = () => {
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTerm * 12;
    const denominator = 1 - (1 + monthlyInterestRate) ** -numberOfPayments;
    if (denominator === 0) {
      setMonthlyPayment(0);
      return;
    }
    setMonthlyPayment((loanAmount * monthlyInterestRate) / denominator);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("loanCalculator.title")}</CardTitle>
        <CardDescription>{t("loanCalculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="loanAmount">
            {t("loanCalculator.loanAmountLabel")}
          </Label>
          <Input
            id="loanAmount"
            type="number"
            value={loanAmount}
            onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
            onBlur={calculateMonthlyPayment}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="interestRate">
            {t("loanCalculator.interestRateLabel")}
          </Label>
          <Input
            id="interestRate"
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
            onBlur={calculateMonthlyPayment}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="loanTerm">{t("loanCalculator.loanTermLabel")}</Label>
          <Input
            id="loanTerm"
            type="number"
            value={loanTerm}
            onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
            onBlur={calculateMonthlyPayment}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthlyPayment">
            {t("loanCalculator.monthlyPaymentLabel")}
          </Label>
          <Input
            id="monthlyPayment"
            type="number"
            value={monthlyPayment.toFixed(2)}
            readOnly
          />
        </div>
      </CardPanel>
    </Card>
  );
}
