import { format, isValid, parse, set, startOfMonth, subMonths } from "date-fns";

export function parseMonth(monthNum: number): Date {
  const year = new Date().getFullYear();
  return startOfMonth(set(new Date(), { year, month: monthNum - 1, date: 1 }));
}

export function parseMonthYearShort(monthYear: string): Date {
  const dt = parse(monthYear, "M/yy", new Date());
  if (!isValid(dt)) throw new Error(`Invalid argument ${monthYear}`);
  return dt;
}

export function getPreviousMonth(month: string): string {
  const date = new Date(`${month}-01`);
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

export function getMonthData(monthsAgo: number): {
  date: Date;
  monthName: string;
  year: string;
} {
  const adjustedMonthsAgo = Math.max(1, monthsAgo + 1);
  const targetDate = startOfMonth(subMonths(new Date(), adjustedMonthsAgo));

  const monthName = format(targetDate, "MMMM");
  const year = format(targetDate, "yyyy");
  return { date: targetDate, monthName, year };
}

export function getCurrentMonthBoundary(): Date {
  const now = new Date();
  const currentMonth = startOfMonth(now);
  return subMonths(currentMonth, 1);
}

export function getAvailableMonthsForAnalytics(businessCreatedAt: Date): Array<{
  value: number;
  label: string;
  date: Date;
}> {
  const months = [];
  const currentBoundary = getCurrentMonthBoundary();
  const businessStart = startOfMonth(businessCreatedAt);

  let monthsBack = 1;
  let targetDate = currentBoundary;

  while (targetDate >= businessStart && monthsBack <= 24) {
    months.push({
      value: monthsBack - 1,
      label: `${format(targetDate, "MMMM yyyy")}`,
      date: targetDate,
    });

    monthsBack++;
    targetDate = subMonths(currentBoundary, monthsBack - 1);
  }

  return months;
}
