'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

export function IncomeTaxCalculator() {
  const t = useTranslations('FinancialCalculator');

  const [annualIncome, setAnnualIncome] = useState(0);
  const [annualTax, setAnnualTax] = useState(0);
  const [monthlyTax, setMonthlyTax] = useState(0);

  const calculatePIT = () => {
    let tax = 0;
    let remainingIncome = annualIncome;

    if (remainingIncome > 2400000) {
      tax += (remainingIncome - 2400000) * 0.30;
      remainingIncome = 2400000;
    }
    if (remainingIncome > 1200000) {
      tax += (remainingIncome - 1200000) * 0.20;
      remainingIncome = 1200000;
    }
    if (remainingIncome > 720000) {
      tax += (remainingIncome - 720000) * 0.10;
      remainingIncome = 720000;
    }
    // 0 - 720,000 is 0%

    setAnnualTax(tax);
    setMonthlyTax(tax / 12);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('income_tax_calculator.title')}</CardTitle>
        <CardDescription>{t('income_tax_calculator.description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="annualIncome">{t('income_tax_calculator.annual_income_label')}</Label>
          <Input
            id="annualIncome"
            type="number"
            value={annualIncome}
            onChange={(e) => setAnnualIncome(parseFloat(e.target.value))}
            onBlur={calculatePIT}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualTax">{t('income_tax_calculator.annual_tax_label')}</Label>
          <Input id="annualTax" type="number" value={annualTax.toFixed(2)} readOnly />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="monthlyTax">{t('income_tax_calculator.monthly_tax_label')}</Label>
          <Input id="monthlyTax" type="number" value={monthlyTax.toFixed(2)} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
