import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CompoundInterestCalculator } from "@/components/financial-calculator/compound-interest-calculator";
import { LoanCalculator } from "@/components/financial-calculator/loan-calculator";
import { SavingsGoalCalculator } from "@/components/financial-calculator/savings-goal-calculator";
import { SimpleCalculator } from "@/components/financial-calculator/simple-calculator";
import { TaxCalculator } from "@/components/financial-calculator/tax-calculator";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "financialCalculator",
    canonicalUrl: "/financial-calculator",
  });
}

export default async function financialCalculatorPage() {
  const t = await getTranslations("financialCalculator");
  const tTabs = await getTranslations("financialCalculator.tabs");

  return (
    <div className="flex flex-col gap-y-6">
      <div className="head">
        <h1 className="">{t("title")}</h1>
        <p className="">{t("description")}</p>
      </div>

      <Tabs className="w-full" defaultValue="simple">
        <TabsList className="">
          <TabsTab value="simple">{tTabs("simpleInterest")}</TabsTab>
          <TabsTab value="loan">{tTabs("loanCalculator")}</TabsTab>
          <TabsTab value="compound">{tTabs("compoundInterest")}</TabsTab>
          <TabsTab value="savings">{tTabs("savingsGoal")}</TabsTab>
          <TabsTab value="tax">{tTabs("taxCalculator")}</TabsTab>
        </TabsList>

        <div className="mt-6">
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
        </div>
      </Tabs>
    </div>
  );
}
