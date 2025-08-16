import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateAllMetrics,
  calculateClosingStock,
  calculateCOGS,
} from "@/server/helpers/accounting-formulas";
import {
  ProductStatus,
  type ExtendedWarehouseItemPayload,
  type SelectExpense,
  type SelectProduct,
  type SelectTransaction,
} from "@/lib/schema/schema-types";

type MockTransaction = SelectTransaction & { product: SelectProduct };

describe("Accounting Formulas", () => {
  let mockTransactions: MockTransaction[];
  let mockExpenses: SelectExpense[];
  let mockProduct: SelectProduct;

  beforeEach(() => {
    mockProduct = {
      id: "prod-1",
      name: "Test Product",
      price: "100.00",
      costPrice: "60.00",
      sku: "TEST-001",
      description: "Test product description",
      businessId: "biz-1",
      createdAt: new Date(),
      status: ProductStatus.ACTIVE,
      updatedAt: new Date(),
      categoryId: "cat-1",
      barcode: "123456789",
      weight: "1",
      version: 1,
      unit: "kg",
      reorderPoint: 10,
      maxStock: 100,
      length: null,
      width: null,
      height: null,
      imageUrl: null,
      deletedAt: null,
    };

    mockTransactions = [
      {
        id: "trans-1",
        productId: "prod-1",
        warehouseId: "wh-1",
        warehouseItemId: "whi-1",
        type: "SALE",
        quantity: -10,
        reference: "SALE-001",
        businessId: "biz-1",
        supplierId: null,
        note: null,
        createdAt: new Date(),
        createdBy: "user-1",
        product: mockProduct,
      },
      {
        id: "trans-2",
        productId: "prod-1",
        warehouseId: "wh-1",
        warehouseItemId: "whi-1",
        type: "PURCHASE",
        quantity: 20,
        reference: "PUR-001",
        businessId: "biz-1",
        supplierId: "sup-1",
        note: null,
        createdAt: new Date(),
        createdBy: "user-1",
        product: mockProduct,
      },
    ];

    mockExpenses = [
      {
        id: "exp-1",
        amount: "500.00",
        reference: "EXP-001",
        businessId: "biz-1",
        note: "Office rent",
        createdAt: new Date(),
        createdBy: "user-1",
      },
    ];
  });

  describe("calculateCOGS", () => {
    it("should calculate COGS correctly with valid inputs", () => {
      const result = calculateCOGS(1000, 500, 800);
      expect(result).toBe(700); // 1000 + 500 - 800
    });

    it("should not return negative COGS", () => {
      const result = calculateCOGS(100, 50, 200);
      expect(result).toBe(0); // Math.max(0, 100 + 50 - 200)
    });
  });

  describe("calculateClosingStock", () => {
    it("should calculate closing stock correctly", () => {
      const warehouseItems: ExtendedWarehouseItemPayload[] = [
        {
          id: "whi-1",
          productId: "prod-1",
          warehouseId: "wh-1",
          quantity: 10,
          lastUpdated: new Date(),
          product: mockProduct,
          deletedAt: null,
          reservedQty: 0,
        },
      ];

      const result = calculateClosingStock(warehouseItems);
      expect(result).toBe(600); // 10 * 60.00
    });
  });

  describe("calculateAllMetrics", () => {
    it("should calculate all metrics correctly with the new COGS logic", () => {
      const result = calculateAllMetrics(
        mockTransactions,
        mockExpenses,
        1000, // opening stock
        800 // closing stock
      );

      // Assertions based on the corrected formulas
      expect(result.grossRevenue).toBe(1000); // abs(-10) * 100
      expect(result.netRevenue).toBe(1000); // no returns
      expect(result.purchases).toBe(1200); // 20 * 60
      expect(result.costOfGoodsSold).toBe(600); // abs(-10) * 60 (cost price of goods sold)
      expect(result.grossProfit).toBe(400); // 1000 (netRevenue) - 600 (costOfGoodsSold)
      expect(result.operatingExpenses).toBe(500);
      expect(result.operatingIncome).toBe(-100); // 400 (grossProfit) - 500 (operatingExpenses)
      expect(result.netIncome).toBe(-100); // Simplified, same as operatingIncome
      expect(result.grossMargin).toBe(40); // (400 / 1000) * 100
      expect(result.netMargin).toBe(-10); // (-100 / 1000) * 100
      expect(result.operatingMargin).toBe(-10);
      expect(result.transactionCount).toBe(1); // only sales count
      expect(result.averageOrderValue).toBe(1000); // 1000 / 1
      expect(result.averageQuantityPerTransaction).toBe(10); // abs(-10) / 1

      // Data Quality Assertions
      expect(result.dataQuality).toBeDefined();
      expect(result.dataQuality.totalTransactions).toBe(2);
      expect(result.dataQuality.validTransactions).toBe(2);
      expect(result.dataQuality.hasInventoryData).toBe(true);
      expect(result.dataQuality.hasExpenseData).toBe(true);
    });

    it("should handle returns correctly", () => {
      const transactionsWithReturns: MockTransaction[] = [
        ...mockTransactions,
        {
          id: "trans-3",
          productId: "prod-1",
          warehouseId: "wh-1",
          warehouseItemId: "whi-1",
          type: "RETURN_SALE",
          quantity: 2, // Returns have positive quantity
          reference: "RET-001",
          businessId: "biz-1",
          supplierId: null,
          note: null,
          createdAt: new Date(),
          createdBy: "user-1",
          product: mockProduct,
        },
      ];

      const result = calculateAllMetrics(
        transactionsWithReturns,
        mockExpenses,
        1000,
        800
      );

      expect(result.grossRevenue).toBe(1000); // From the original sale
      expect(result.returns).toBe(200); // abs(2) * 100
      expect(result.netRevenue).toBe(800); // 1000 - 200
      expect(result.returnRate).toBe(20); // (200 / 1000) * 100
    });

    it("should calculate inventory metrics based on new COGS", () => {
      const result = calculateAllMetrics(
        mockTransactions,
        mockExpenses,
        1000, // opening stock
        800 // closing stock
      );

      expect(result.openingStock).toBe(1000);
      expect(result.closingStock).toBe(800);
      expect(result.averageInventory).toBe(900); // (1000 + 800) / 2
      expect(result.costOfGoodsSold).toBe(600); // This is the new, correct COGS
      expect(result.inventoryTurnover).toBe(0.67); // 600 / 900, rounded to 2 decimals
      expect(result.inventoryGrowth).toBe(-20); // ((800 - 1000) / 1000) * 100
    });

    it("should calculate advanced KPIs correctly", () => {
      const multiProductTransactions: MockTransaction[] = [
        ...mockTransactions,
        {
          ...mockTransactions[0], // Another sale transaction
          id: "trans-4",
          productId: "prod-2",
          product: { ...mockProduct, id: "prod-2", name: "Product 2" },
        },
      ];

      const result = calculateAllMetrics(
        multiProductTransactions,
        mockExpenses,
        1000,
        800
      );

      expect(result.uniqueProductsSold).toBe(2);
      expect(result.averageQuantityPerTransaction).toBe(10); // (abs(-10) + abs(-10)) / 2
      expect(result.grossRevenue).toBe(2000); // 1000 + 1000
      expect(result.netRevenue).toBe(2000);
      expect(result.expenseRatio).toBe(25); // (500 / 2000) * 100
    });

    it("should handle edge cases with zero values", () => {
      const result = calculateAllMetrics([], [], 0, 0);

      // Check a subset of metrics to ensure they are zero
      const metricsToCheck = [
        "grossRevenue",
        "netRevenue",
        "purchases",
        "costOfGoodsSold",
        "grossProfit",
        "operatingExpenses",
        "inventoryTurnover",
        "daysOnHand",
        "averageOrderValue",
        "assetTurnover",
        "grossMargin",
        "netMargin",
      ];

      for (const metric of metricsToCheck) {
        expect(result[metric as keyof typeof result]).toBe(0);
      }
    });

    it("should validate input parameters", () => {
      // Test with invalid transactions array
      // @ts-expect-error - Testing invalid input
      const result1 = calculateAllMetrics(null, mockExpenses, 1000, 800);
      expect(result1.grossRevenue).toBe(0);
      expect(result1.dataQuality.totalTransactions).toBe(0);

      // Test with invalid expenses array
      // @ts-expect-error - Testing invalid input
      const result2 = calculateAllMetrics(
        mockTransactions,
        null,
        1000,
        800
      );
      expect(result2.operatingExpenses).toBe(0);
      expect(result2.dataQuality.hasExpenseData).toBe(false);

      // Test with negative stock values, which should be corrected to 0
      const result3 = calculateAllMetrics(
        mockTransactions,
        mockExpenses,
        -100,
        -50
      );
      expect(result3.openingStock).toBe(0);
      expect(result3.closingStock).toBe(0);
    });
  });
});
