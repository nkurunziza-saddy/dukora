
import { SimpleCalculator } from '@/components/financial-calculator/simple-calculator';
import { getTranslations } from 'next-intl/server';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoanCalculator } from '@/components/financial-calculator/loan-calculator';
import { CompoundInterestCalculator } from '@/components/financial-calculator/compound-interest-calculator';
import { SavingsGoalCalculator } from '@/components/financial-calculator/savings-goal-calculator';
import { TaxCalculator } from '@/components/financial-calculator/tax-calculator';

export async function generateMetadata() {
  const t = await getTranslations('FinancialCalculator');

  return {
    title: t('meta_title'),
  };
}

export default function FinancialCalculatorPage() {
  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue="simple">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="loan">Loan</TabsTrigger>
          <TabsTrigger value="compound">Compound Interest</TabsTrigger>
          <TabsTrigger value="savings">Savings Goal</TabsTrigger>
          <TabsTrigger value="tax">Tax</TabsTrigger>
        </TabsList>
        <TabsContent value="simple">
          <SimpleCalculator />
        </TabsContent>
        <TabsContent value="loan">
          <LoanCalculator />
        </TabsContent>
        <TabsContent value="compound">
          <CompoundInterestCalculator />
        </TabsContent>
        <TabsContent value="savings">
          <SavingsGoalCalculator />
        </TabsContent>
        <TabsContent value="tax">
          <TaxCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
