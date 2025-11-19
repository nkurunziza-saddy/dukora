import type { Metadata } from "next";
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

export default function financialCalculatorPage() {
  return (
    <div className="flex flex-col gap-y-6">
      <div className="head">
        <h1 className="">Financial Calculators</h1>
        <p className="">
          Calculate loans, interest, savings goals, and taxes with precision
        </p>
      </div>

      <Tabs className="w-full" defaultValue="simple">
        <TabsList className="">
          <TabsTab value="simple">Simple Interest</TabsTab>
          <TabsTab value="loan">Loan Calculator</TabsTab>
          <TabsTab value="compound">Compound Interest</TabsTab>
          <TabsTab value="savings">Savings Goal</TabsTab>
          <TabsTab value="tax">Tax Calculator</TabsTab>
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
