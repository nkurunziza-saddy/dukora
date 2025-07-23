import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKeys(key: string) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (str) => str.toUpperCase());
}

export const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function getMonthName(monthNumber: number) {
  const date = new Date();
  date.setMonth(monthNumber - 1);

  return format(date, "MMMM");
}

export const formatCurrency = (value: number | string | null | undefined) => {
  if (!value) return "$0.00";

  const numberValue = typeof value === "string" ? parseFloat(value) : value;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(numberValue);
};

export const formatNumber = (value: number | null | undefined) => {
  if (!value) return "0";
  return new Intl.NumberFormat("en-US").format(value);
};
