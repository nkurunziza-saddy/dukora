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
  const date = new Date(month + "-01");
  date.setMonth(date.getMonth() - 1);
  return date.toISOString().slice(0, 7);
}

export function getMonthData(monthsAgo: number): {
  date: Date;
  monthName: string;
  year: string;
} {
  const targetDate = startOfMonth(subMonths(new Date(), monthsAgo));

  const monthName = format(targetDate, "MMMM");
  const year = format(targetDate, "yyyy");
  return { date: targetDate, monthName, year };
}
