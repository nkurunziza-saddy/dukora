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

export function VATCalculator() {
  const t = useTranslations("financial_calculator");

  const [salesAmount, setSalesAmount] = useState(0);
  const [purchasesAmount, setPurchasesAmount] = useState(0);
  const [vatDue, setVatDue] = useState(0);

  const calculateVAT = () => {
    const outputVAT = salesAmount * 0.18;
    const inputVAT = purchasesAmount * 0.18;
    setVatDue(outputVAT - inputVAT);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>{t("vat_calculator.title")}</CardTitle>
        <CardDescription>{t("vat_calculator.description")}</CardDescription>
      </CardHeader>
      <CardPanel className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="salesAmount">
            {t("vat_calculator.sales_amount_label")}
          </Label>
          <Input
            id="salesAmount"
            type="number"
            value={salesAmount}
            onChange={(e) => setSalesAmount(parseFloat(e.target.value) || 0)}
            onBlur={calculateVAT}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="purchasesAmount">
            {t("vat_calculator.purchases_amount_label")}
          </Label>
          <Input
            id="purchasesAmount"
            type="number"
            value={purchasesAmount}
            onChange={(e) =>
              setPurchasesAmount(parseFloat(e.target.value) || 0)
            }
            onBlur={calculateVAT}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="vatDue">{t("vat_calculator.vat_due_label")}</Label>
          <Input id="vatDue" type="number" value={vatDue.toFixed(2)} readOnly />
        </div>
      </CardPanel>
    </Card>
  );
}
