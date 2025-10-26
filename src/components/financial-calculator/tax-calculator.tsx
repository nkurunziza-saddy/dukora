"use client";

import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { IncomeTaxCalculator } from "./income-tax-calculator";
import { PAYECalculator } from "./paye-calculator";
import { VATCalculator } from "./vat-calculator";

export function TaxCalculator() {
  const t = useTranslations("financialCalculator");

  return (
    <Tabs defaultValue="pit">
      <TabsList className="w-fit">
        <TabsTab value="pit">{t("taxCalculator.pitTab")}</TabsTab>
        <TabsTab value="paye">{t("taxCalculator.payeTab")}</TabsTab>
        <TabsTab value="vat">{t("taxCalculator.vatTab")}</TabsTab>
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
