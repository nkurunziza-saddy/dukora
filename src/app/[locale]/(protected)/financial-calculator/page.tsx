import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CompoundInterestCalculator } from "@/components/financial-calculator/compound-interest-calculator";
import { LoanCalculator } from "@/components/financial-calculator/loan-calculator";
import { SavingsGoalCalculator } from "@/components/financial-calculator/savings-goal-calculator";
import { SimpleCalculator } from "@/components/financial-calculator/simple-calculator";
import { TaxCalculator } from "@/components/financial-calculator/tax-calculator";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { constructMetadata } from "@/lib/config/metadata";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale,
    namespace: "financialCalculator",
  });

  return constructMetadata({
    title: t("metaTitle"),
  });
}

export default function financialCalculatorPage() {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="simple">
        <TabsList className="w-fit">
          <TabsTab value="simple">Simple</TabsTab>
          <TabsTab value="loan">Loan</TabsTab>
          <TabsTab value="compound">Compound Interest</TabsTab>
          <TabsTab value="savings">Savings Goal</TabsTab>
          <TabsTab value="tax">Tax</TabsTab>
        </TabsList>
        <TabsPanel value="simple">
          <SimpleCalculator />
        </TabsPanel>
        <TabsPanel value="loan">
          <LoanCalculator />
        </TabsPanel>
        <TabsPanel value="compound">
          <CompoundInterestCalculator />
        </TabsPanel>
        <TabsPanel value="savings">
          <SavingsGoalCalculator />
        </TabsPanel>
        <TabsPanel value="tax">
          <TaxCalculator />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
