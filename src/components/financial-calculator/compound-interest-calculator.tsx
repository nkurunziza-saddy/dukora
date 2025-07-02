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

export function CompoundInterestCalculator() {
  const t = useTranslations('FinancialCalculator');

  const [principal, setPrincipal] = useState(0);
  const [annualRate, setAnnualRate] = useState(0);
  const [compoundingFrequency, setCompoundingFrequency] = useState(1);
  const [time, setTime] = useState(0);
  const [futureValue, setFutureValue] = useState(0);

  const calculateCompoundInterest = () => {
    const rate = annualRate / 100;
    const n = compoundingFrequency;
    const t_years = time;
    setFutureValue(principal * Math.pow(1 + rate / n, n * t_years));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t('compound_calculator.title')}</CardTitle>
        <CardDescription>{t('compound_calculator.description')}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="principal">{t('compound_calculator.principal_label')}</Label>
          <Input
            id="principal"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(parseFloat(e.target.value))}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="annualRate">{t('compound_calculator.annual_rate_label')}</Label>
          <Input
            id="annualRate"
            type="number"
            value={annualRate}
            onChange={(e) => setAnnualRate(parseFloat(e.target.value))}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="compoundingFrequency">{t('compound_calculator.compounding_frequency_label')}</Label>
          <Input
            id="compoundingFrequency"
            type="number"
            value={compoundingFrequency}
            onChange={(e) => setCompoundingFrequency(parseFloat(e.target.value))}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="time">{t('compound_calculator.time_label')}</Label>
          <Input
            id="time"
            type="number"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value))}
            onBlur={calculateCompoundInterest}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="futureValue">{t('compound_calculator.future_value_label')}</Label>
          <Input id="futureValue" type="number" value={futureValue.toFixed(2)} readOnly />
        </div>
      </CardContent>
    </Card>
  );
}
