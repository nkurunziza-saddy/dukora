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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Financial Calculators
        </h1>
        <p className="text-muted-foreground">
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
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-primary">
                Simple Interest Calculator
              </h2>
              <SimpleCalculator />
            </div>
          </TabsPanel>

          <TabsPanel value="loan">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-primary">
                Loan Calculator
              </h2>
              <LoanCalculator />
            </div>
          </TabsPanel>

          <TabsPanel value="compound">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-primary">
                Compound Interest Calculator
              </h2>
              <CompoundInterestCalculator />
            </div>
          </TabsPanel>

          <TabsPanel value="savings">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-primary">
                Savings Goal Calculator
              </h2>
              <SavingsGoalCalculator />
            </div>
          </TabsPanel>

          <TabsPanel value="tax">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4 text-primary">
                Tax Calculator
              </h2>
              <TaxCalculator />
            </div>
          </TabsPanel>
        </div>
      </Tabs>
    </div>
  );
}
