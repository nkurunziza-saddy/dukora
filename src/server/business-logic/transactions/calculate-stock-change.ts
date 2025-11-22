import type { TransactionType } from "@/lib/schema/schema-types";

export function calculateStockChange(
  type: TransactionType,
  quantity: number,
): number {
  const decreaseTypes: TransactionType[] = [
    "SALE",
    "DAMAGE",
    "TRANSFER_OUT",
    "RETURN_PURCHASE",
  ];

  const increaseTypes: TransactionType[] = [
    "PURCHASE",
    "TRANSFER_IN",
    "RETURN_SALE",
  ];

  const absQuantity = Math.abs(quantity);

  if (decreaseTypes.includes(type)) {
    return -absQuantity;
  }

  if (increaseTypes.includes(type)) {
    return absQuantity;
  }

  if (type === "STOCK_ADJUSTMENT") {
    return quantity;
  }

  console.warn(`Unknown transaction type: ${type}`);
  return 0;
}

export function isStockDecreaseType(type: TransactionType): boolean {
  const decreaseTypes: TransactionType[] = [
    "SALE",
    "DAMAGE",
    "TRANSFER_OUT",
    "RETURN_PURCHASE",
  ];

  return decreaseTypes.includes(type);
}

export function isStockIncreaseType(type: TransactionType): boolean {
  const increaseTypes: TransactionType[] = [
    "PURCHASE",
    "TRANSFER_IN",
    "RETURN_SALE",
  ];

  return increaseTypes.includes(type);
}
