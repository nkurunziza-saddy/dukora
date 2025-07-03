"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncomeTaxCalculator } from "./income-tax-calculator";
import { PAYECalculator } from "./paye-calculator";
import { VATCalculator } from "./vat-calculator";
import { useTranslations } from "next-intl";

export function TaxCalculator() {
  const t = useTranslations("FinancialCalculator");

  return (
    <Tabs defaultValue="pit">
      <TabsList className="w-fit">
        <TabsTrigger value="pit">{t("tax_calculator.pit_tab")}</TabsTrigger>
        <TabsTrigger value="paye">{t("tax_calculator.paye_tab")}</TabsTrigger>
        <TabsTrigger value="vat">{t("tax_calculator.vat_tab")}</TabsTrigger>
      </TabsList>
      <TabsContent value="pit">
        <IncomeTaxCalculator />
      </TabsContent>
      <TabsContent value="paye">
        <PAYECalculator />
      </TabsContent>
      <TabsContent value="vat">
        <VATCalculator />
      </TabsContent>
    </Tabs>
  );
}
