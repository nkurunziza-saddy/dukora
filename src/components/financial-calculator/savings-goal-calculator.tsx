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

export function SavingsGoalCalculator() {
  const t = useTranslations('FinancialCalculator');

  const [targetAmount, setTargetAmount] = useState(0);
  const [currentSavings, setCurrentSavings] = useState(0);
  const [annualContribution, setAnnualContribution] = useState(0);
  const [yearsToGoal, setYearsToGoal] = useState(0);

  const calculateYearsToGoal = () => {
    if (annualContribution <= 0) {
      setYearsToGoal(Infinity);
      return;
    }
    setYearsToGoal((targetAmount - currentSavings) / annualContribution);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('savings_calculator.title')}</CardTitle>
        <CardDescription>{t('savings_calculator.description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="targetAmount">{t('savings_calculator.target_amount_label')}</Label>
          <Input
            id="targetAmount"
            type="number"
            value={targetAmount}
            onChange={(e) => setTargetAmount(parseFloat(e.target.value))}
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="currentSavings">{t('savings_calculator.current_savings_label')}</Label>
          <Input
            id="currentSavings"
            type="number"
            value={currentSavings}
            onChange={(e) => setCurrentSavings(parseFloat(e.target.value))}
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualContribution">{t('savings_calculator.annual_contribution_label')}</Label>
          <Input
            id="annualContribution"
            type="number"
            value={annualContribution}
            onChange={(e) => setAnnualContribution(parseFloat(e.target.value))}
            onBlur={calculateYearsToGoal}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="yearsToGoal">{t('savings_calculator.years_to_goal_label')}</Label>
          <Input id="yearsToGoal" type="number" value={yearsToGoal.toFixed(2)} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
