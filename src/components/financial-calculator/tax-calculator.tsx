"use client";

import { Tabs, TabsPanel, TabsList, TabsTab } from "@/components/ui/tabs";
import { IncomeTaxCalculator } from "./income-tax-calculator";
import { PAYECalculator } from "./paye-calculator";
import { VATCalculator } from "./vat-calculator";
import { useTranslations } from "next-intl";

export function TaxCalculator() {
  const t = useTranslations("FinancialCalculator");

  return (
    <Tabs defaultValue="pit">
      <TabsList className="w-fit">
        <TabsTab value="pit">{t("tax_calculator.pit_tab")}</TabsTab>
        <TabsTab value="paye">{t("tax_calculator.paye_tab")}</TabsTab>
        <TabsTab value="vat">{t("tax_calculator.vat_tab")}</TabsTab>
      </TabsList>
      <TabsPanel value="pit">
        <IncomeTaxCalculator />
      </TabsPanel>
      <TabsPanel value="paye">
        <PAYECalculator />
      </TabsPanel>
      <TabsPanel value="vat">
        <VATCalculator />
      </TabsPanel>
    </Tabs>
  );
}
