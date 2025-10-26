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
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PAYECalculator() {
  const t = useTranslations("financialCalculator");

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [employeeType, setEmployeeType] = useState("permanent"); // 'permanent' or 'casual'
  const [paye, setPaye] = useState(0);

  const calculatePAYE = () => {
    let tax = 0;
    if (employeeType === "permanent") {
      let remainingIncome = monthlyIncome;
      if (remainingIncome > 200000) {
        tax += (remainingIncome - 200000) * 0.3;
        remainingIncome = 200000;
      }
      if (remainingIncome > 100000) {
        tax += (remainingIncome - 100000) * 0.2;
        remainingIncome = 100000;
      }
      if (remainingIncome > 60000) {
        tax += (remainingIncome - 60000) * 0.1;
      }
    } else if (employeeType === "casual") {
      if (monthlyIncome > 60000) {
        tax = monthlyIncome * 0.15;
      }
    }
    setPaye(tax);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("payeCalculator.title")}</CardTitle>
        <CardDescription>{t("payeCalculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="monthlyIncome">
            {t("payeCalculator.monthlyIncomeLabel")}
          </Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
            onBlur={calculatePAYE}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="employeeType">
            {t("payeCalculator.employeeTypeLabel")}
          </Label>
          <Select value={employeeType} onValueChange={setEmployeeType}>
            <SelectTrigger id="employeeType">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="permanent">
                {t("payeCalculator.permanentEmployee")}
              </SelectItem>
              <SelectItem value="casual">
                {t("payeCalculator.casualLaborer")}
              </SelectItem>
            </SelectPopup>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paye">{t("payeCalculator.payeLabel")}</Label>
          <Input id="paye" type="number" value={paye.toFixed(2)} readOnly />
        </div>
      </CardPanel>
    </Card>
  );
}
