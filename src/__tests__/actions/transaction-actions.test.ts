import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import * as authActions from "@/server/actions/auth-actions";
import * as transactionActions from "@/server/actions/transaction-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as transactionRepo from "@/server/repos/transaction-repo";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";

// Mock dependencies
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/repos/transaction-repo");
vi.mock("@/server/helpers/role-permissions");

describe("Transaction Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockTransaction = {
    id: "trans-1",
    productId: "prod-1",
    warehouseId: "wh-1",
    warehouseItemId: "whi-1",
    type: "SALE",
    quantity: 10,
    reference: "REF-001",
    businessId: "biz-1",
    createdBy: "user-1",
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (authActions.getCurrentSession as vi.Mock).mockResolvedValue({
      user: mockUser,
    });
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  });

  describe("getTransactions", () => {
    it("should return transactions if user has permission", async () => {
      (transactionRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: [mockTransaction],
        error: null,
      });

      const result = await transactionActions.getTransactions({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionRepo.get_all_cached).toHaveBeenCalledWith(
        mockUser.businessId
      );
      expect(result).toEqual({ data: [mockTransaction], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.getTransactions({});

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_all_cached fails", async () => {
      (transactionRepo.get_all_cached as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await transactionActions.getTransactions({});

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getTransactionsPaginated", () => {
    it("should return paginated transactions if user has permission", async () => {
      const mockPaginatedData = {
        data: [mockTransaction],
        error: null,
        page: 1,
        limit: 50,
        total: 100,
        totalPages: 2,
      };
      (transactionRepo.get_paginated as vi.Mock).mockResolvedValue(
        mockPaginatedData
      );

      const result = await transactionActions.getTransactionsPaginated({});

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionRepo.get_paginated).toHaveBeenCalledWith(
        mockUser.businessId,
        1,
        50
      );
      expect(result).toEqual({
        data: mockPaginatedData.data,
        error: null,
        pagination: {
          page: mockPaginatedData.page,
          limit: mockPaginatedData.limit,
          total: mockPaginatedData.total,
          totalPages: mockPaginatedData.totalPages,
        },
      });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.getTransactionsPaginated({});

      expect(result).toEqual({
        data: null,
        error: ErrorCode.UNAUTHORIZED,
      });
      expect(transactionRepo.get_paginated).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_paginated fails", async () => {
      (transactionRepo.get_paginated as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
        total: 0,
      });

      const result = await transactionActions.getTransactionsPaginated({});

      expect(result).toEqual({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
        pagination: null,
      });
    });
  });

  describe("getTransactionsByTimeInterval", () => {
    const startDate = new Date("2024-01-01");
    const endDate = new Date("2024-01-31");

    it("should return transactions by time interval if user has permission", async () => {
      (
        transactionRepo.get_time_interval_with_with as vi.Mock
      ).mockResolvedValue({
        data: [mockTransaction],
        error: null,
      });

      const result = await transactionActions.getTransactionsByTimeInterval({
        startDate,
        endDate,
      });

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionRepo.get_time_interval_with_with).toHaveBeenCalledWith(
        mockUser.businessId,
        startDate,
        endDate
      );
      expect(result).toEqual({ data: [mockTransaction], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.getTransactionsByTimeInterval({
        startDate,
        endDate,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(
        transactionRepo.get_time_interval_with_with
      ).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_time_interval_with_with fails", async () => {
      (
        transactionRepo.get_time_interval_with_with as vi.Mock
      ).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await transactionActions.getTransactionsByTimeInterval({
        startDate,
        endDate,
      });

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getTransactionById", () => {
    it("should return transaction by id if user has permission", async () => {
      (transactionRepo.get_by_id as vi.Mock).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await transactionActions.getTransactionById(
        mockTransaction.id
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionRepo.get_by_id).toHaveBeenCalledWith(
        mockTransaction.id,
        mockUser.businessId
      );
      expect(result).toEqual({ data: mockTransaction, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.getTransactionById(
        mockTransaction.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if transactionId is empty", async () => {
      const result = await transactionActions.getTransactionById(" ");

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(transactionRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_id fails", async () => {
      (transactionRepo.get_by_id as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.NOT_FOUND,
      });

      const result = await transactionActions.getTransactionById(
        mockTransaction.id
      );

      expect(result).toEqual({ data: null, error: ErrorCode.NOT_FOUND });
    });
  });

  describe("createTransaction", () => {
    const newTransactionData = {
      productId: "prod-2",
      warehouseId: "wh-2",
      warehouseItemId: "whi-2",
      type: "PURCHASE",
      quantity: 5,
      reference: "NEW-REF",
    };

    it("should create a transaction successfully", async () => {
      (transactionRepo.create as vi.Mock).mockResolvedValue({
        data: mockTransaction,
        error: null,
      });

      const result = await transactionActions.createTransaction(
        newTransactionData
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.TRANSACTION_PURCHASE_CREATE
      );
      expect(transactionRepo.create).toHaveBeenCalledWith({
        ...newTransactionData,
        businessId: mockUser.businessId,
        createdBy: mockUser.id,
      });
      expect(result).toEqual({ data: mockTransaction, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.createTransaction(
        newTransactionData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionRepo.create).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if required fields are missing", async () => {
      let result = await transactionActions.createTransaction({
        ...newTransactionData,
        productId: " ",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await transactionActions.createTransaction({
        ...newTransactionData,
        warehouseItemId: " ",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await transactionActions.createTransaction({
        ...newTransactionData,
        type: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await transactionActions.createTransaction({
        ...newTransactionData,
        quantity: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return error from repo if create fails", async () => {
      (transactionRepo.create as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await transactionActions.createTransaction(
        newTransactionData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("createTransactionAndWarehouseItem", () => {
    const newTransactionData = {
      productId: "prod-2",
      warehouseId: "wh-2",
      type: "PURCHASE",
      quantity: 5,
      reference: "NEW-REF",
    };

    it("should create a transaction and warehouse item successfully", async () => {
      (transactionRepo.create_with_warehouse_item as vi.Mock).mockResolvedValue(
        {
          data: mockTransaction,
          error: null,
        }
      );

      const result = await transactionActions.createTransactionAndWarehouseItem(
        newTransactionData
      );

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.TRANSACTION_PURCHASE_CREATE
      );
      expect(transactionRepo.create_with_warehouse_item).toHaveBeenCalledWith({
        ...newTransactionData,
        businessId: mockUser.businessId,
        createdBy: mockUser.id,
      });
      expect(result).toEqual({ data: mockTransaction, error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.createTransactionAndWarehouseItem(
        newTransactionData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionRepo.create_with_warehouse_item).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if required fields are missing", async () => {
      let result = await transactionActions.createTransactionAndWarehouseItem({
        ...newTransactionData,
        productId: " ",
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await transactionActions.createTransactionAndWarehouseItem({
        ...newTransactionData,
        type: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });

      result = await transactionActions.createTransactionAndWarehouseItem({
        ...newTransactionData,
        quantity: undefined as any,
      });
      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
    });

    it("should return error from repo if create_with_warehouse_item fails", async () => {
      (transactionRepo.create_with_warehouse_item as vi.Mock).mockResolvedValue(
        {
          data: null,
          error: ErrorCode.DATABASE_ERROR,
        }
      );

      const result = await transactionActions.createTransactionAndWarehouseItem(
        newTransactionData
      );

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });

  describe("getTransactionsByType", () => {
    it("should return transactions by type if user has permission", async () => {
      (transactionRepo.get_by_type as vi.Mock).mockResolvedValue({
        data: [mockTransaction],
        error: null,
      });

      const result = await transactionActions.getTransactionsByType("SALE");

      expect(rolePermissions.roleHasPermission).toHaveBeenCalledWith(
        mockUser.role,
        Permission.FINANCIAL_VIEW
      );
      expect(transactionRepo.get_by_type).toHaveBeenCalledWith(
        mockUser.businessId,
        "SALE"
      );
      expect(result).toEqual({ data: [mockTransaction], error: null });
    });

    it("should return UNAUTHORIZED if user lacks permission", async () => {
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await transactionActions.getTransactionsByType("SALE");

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(transactionRepo.get_by_type).not.toHaveBeenCalled();
    });

    it("should return MISSING_INPUT if type is empty", async () => {
      const result = await transactionActions.getTransactionsByType(
        undefined as any
      );

      expect(result).toEqual({ data: null, error: ErrorCode.MISSING_INPUT });
      expect(transactionRepo.get_by_type).not.toHaveBeenCalled();
    });

    it("should return error from repo if get_by_type fails", async () => {
      (transactionRepo.get_by_type as vi.Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await transactionActions.getTransactionsByType("SALE");

      expect(result).toEqual({ data: null, error: ErrorCode.DATABASE_ERROR });
    });
  });
});
