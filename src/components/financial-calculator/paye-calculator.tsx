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
  const t = useTranslations("financial_calculator");

  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [employeeType, setEmployeeType] = useState("permanent"); // 'permanent' or 'casual'
  const [paye, setPaye] = useState(0);

  const calculatePAYE = () => {
    let tax = 0;
    let remainingIncome = monthlyIncome;

    if (employeeType === "permanent") {
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
        remainingIncome = 60000;
      }
      // 0 - 60,000 is 0%
    } else if (employeeType === "casual") {
      if (remainingIncome > 60000) {
        tax += (remainingIncome - 60000) * 0.15;
      }
      // 0 - 60,000 is 0%
    }
    setPaye(tax);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("paye_calculator.title")}</CardTitle>
        <CardDescription>{t("paye_calculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="monthlyIncome">
            {t("paye_calculator.monthly_income_label")}
          </Label>
          <Input
            id="monthlyIncome"
            type="number"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(parseFloat(e.target.value))}
            onBlur={calculatePAYE}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="employeeType">
            {t("paye_calculator.employee_type_label")}
          </Label>
          <Select value={employeeType} onValueChange={setEmployeeType}>
            <SelectTrigger id="employeeType">
              <SelectValue />
            </SelectTrigger>
            <SelectPopup>
              <SelectItem value="permanent">
                {t("paye_calculator.permanent_employee")}
              </SelectItem>
              <SelectItem value="casual">
                {t("paye_calculator.casual_laborer")}
              </SelectItem>
            </SelectPopup>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="paye">{t("paye_calculator.paye_label")}</Label>
          <Input id="paye" type="number" value={paye.toFixed(2)} readOnly />
        </div>
      </CardPanel>
    </Card>
  );
}
