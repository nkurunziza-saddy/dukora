"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
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
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Loan Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="loanAmount">
                {t("loanCalculator.loanAmountLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="loanAmount"
                onBlur={calculateMonthlyPayment}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                placeholder="Enter loan amount"
                type="number"
                value={loanAmount}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="interestRate">
                {t("loanCalculator.interestRateLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="interestRate"
                onBlur={calculateMonthlyPayment}
                onChange={(e) =>
                  setInterestRate(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter annual interest rate (%)"
                type="number"
                value={interestRate}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="loanTerm">
                {t("loanCalculator.loanTermLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="loanTerm"
                onBlur={calculateMonthlyPayment}
                onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
                placeholder="Enter loan term (years)"
                type="number"
                value={loanTerm}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
            Payment Calculation
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="monthlyPayment"
              >
                {t("loanCalculator.monthlyPaymentLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="monthlyPayment"
                readOnly
                type="number"
                value={monthlyPayment.toFixed(2)}
              />
            </div>
            {monthlyPayment > 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Total Payments:</span> $
                  {(monthlyPayment * loanTerm * 12).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Total Interest:</span> $
                  {(monthlyPayment * loanTerm * 12 - loanAmount).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Interest Rate:</span>{" "}
                  {interestRate}% annually
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
