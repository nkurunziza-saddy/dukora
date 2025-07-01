import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatKeys(key: string) {
  return key
    .replace(/_/g, " ")
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

  export const getLogTypes = (type: LogType) => {
    switch (type) {
      case "NEW_SUPPLIER":
        return {
          color:
            "bg-green-50 text-green-800 ring-1 ring-inset ring-green-600/20 dark:bg/40 backdrop-blur-sm-green-900 dark:text-green-200 dark:ring-green-400/20",
          title: "New supplier",
        };
      case "NEW_PRODUCT":
        return {
          color:
            "bg-blue-50 text-blue-800 ring-1 ring-inset ring-blue-600/20 dark:bg-blue-900/40 backdrop-blur-sm dark:text-blue-200 dark:ring-blue-400/20",
          title: "New product",
        };
      case "NEW_PRODUCT_VERSION":
        return {
          color:
            "bg-teal-50 text-teal-800 ring-1 ring-inset ring-teal-600/20 dark:bg-teal-900/40 backdrop-blur-sm dark:text-teal-200 dark:ring-teal-400/20",
          title: "New product version",
        };
      case "SUPPLIER_UPDATE":
        return {
          color:
            "bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20 dark:bg-yellow-900/40 backdrop-blur-sm dark:text-yellow-200 dark:ring-yellow-400/20",
          title: "Supplier update",
        };
      case "PRODUCT_UPDATE":
        return {
          color:
            "bg-orange-50 text-orange-800 ring-1 ring-inset ring-orange-600/20 dark:bg-orange-900/40 backdrop-blur-sm dark:text-orange-200 dark:ring-orange-400/20",
          title: "Product update",
        };
      case "PRODUCT_VERSION_UPDATE":
        return {
          color:
            "bg-purple-50 text-purple-800 ring-1 ring-inset ring-purple-600/20 dark:bg-purple-900/40 backdrop-blur-sm dark:text-purple-200 dark:ring-purple-400/20",
          title: "Product version update",
        };
      case "PRODUCT_DELETE":
        return {
          color:
            "bg-red-50 text-red-800 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/40 backdrop-blur-sm dark:text-red-200 dark:ring-red-400/20",
          title: "Product deleted",
        };
      case "PRODUCT_VERSION_DELETE":
        return {
          color:
            "bg-red-50 text-red-900 ring-1 ring-inset ring-red-600/20 dark:bg-red-900/40 backdrop-blur-sm dark:text-red-300 dark:ring-red-400/20",
          title: "Product version deleted",
        };
      case "SUPPLIER_DELETE":
        return {
          color:
            "bg-pink-50 text-pink-800 ring-1 ring-inset ring-pink-600/20 dark:bg-pink-900/40 backdrop-blur-sm dark:text-pink-200 dark:ring-pink-400/20",
          title: "Supplier deleted",
        };
      case "STOCK_MOVEMENT":
        return {
          color:
            "bg-indigo-50 text-indigo-800 ring-1 ring-inset ring-indigo-600/20 dark:bg-indigo-900/40 backdrop-blur-sm dark:text-indigo-200 dark:ring-indigo-400/20",
          title: "Stock movement",
        };
      case "USER_ACTION":
        return {
          color:
            "bg-gray-50 text-gray-800 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-900/40 backdrop-blur-sm dark:text-gray-200 dark:ring-gray-400/20",
          title: "User action",
        };
      default:
        return {
          color:
            "bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20 dark:bg-gray-900/40 backdrop-blur-sm dark:text-gray-300 dark:ring-gray-400/20",
          title: "Unknown action",
        };
    }
  };