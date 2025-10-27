"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
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
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <div className="rounded-lg border bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            Employee Details
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="monthlyIncome">
                {t("payeCalculator.monthlyIncomeLabel")}
              </Label>
              <Input
                className="focus:ring-2 focus:ring-primary/20"
                id="monthlyIncome"
                onBlur={calculatePAYE}
                onChange={(e) =>
                  setMonthlyIncome(parseFloat(e.target.value) || 0)
                }
                placeholder="Enter monthly income"
                type="number"
                value={monthlyIncome}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium" htmlFor="employeeType">
                {t("payeCalculator.employeeTypeLabel")}
              </Label>
              <Select onValueChange={setEmployeeType} value={employeeType}>
                <SelectTrigger
                  className="focus:ring-2 focus:ring-primary/20"
                  id="employeeType"
                >
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
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-success/20 bg-muted/50 p-4">
          <h3 className="text-lg font-semibold text-success mb-4 flex items-center gap-2">
            PAYE Calculation
          </h3>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label
                className="text-sm font-medium text-success"
                htmlFor="paye"
              >
                {t("payeCalculator.payeLabel")}
              </Label>
              <Input
                className="bg-success/10 text-success font-semibold text-lg border-success/20"
                id="paye"
                readOnly
                type="number"
                value={paye.toFixed(2)}
              />
            </div>
            {paye > 0 && (
              <div className="mt-4 p-3 rounded-md bg-success/5 border border-success/20">
                <p className="text-sm text-success">
                  <span className="font-medium">Net Monthly Income:</span> $
                  {(monthlyIncome - paye).toFixed(2)}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Employee Type:</span>{" "}
                  {employeeType === "permanent" ? "Permanent" : "Casual"}
                </p>
                <p className="text-sm text-success">
                  <span className="font-medium">Tax Rate:</span>{" "}
                  {((paye / monthlyIncome) * 100).toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
