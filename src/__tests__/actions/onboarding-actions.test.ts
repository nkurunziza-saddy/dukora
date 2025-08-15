import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { businessInitialization } from "@/server/actions/onboarding-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import * as invitationActions from "@/server/actions/invitation-actions";
import * as warehouseActions from "@/server/actions/warehouse-actions";
import * as businessActions from "@/server/actions/business-actions";
import * as categoryActions from "@/server/actions/category-actions";
import * as businessSettingsActions from "@/server/actions/business-settings-actions";
import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { UserRole } from "@/lib/schema/schema-types";
import { getUserIfHasPermission } from "@/server/actions/auth/permission-middleware";

vi.mock("@/server/helpers/role-permissions");
vi.mock("@/server/actions/invitation-actions");
vi.mock("@/server/actions/warehouse-actions");
vi.mock("@/server/actions/business-actions");
vi.mock("@/server/actions/category-actions");
vi.mock("@/server/actions/business-settings-actions");
vi.mock("@/server/actions/auth/permission-middleware", () => ({
  getUserIfHasPermission: vi.fn(),
}));

describe("Onboarding Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: UserRole.OWNER,
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockOnboardingData = {
    businessName: "Test Business",
    businessType: "retail",
    teamMembers: [{ email: "test@example.com", role: UserRole.ADMIN }],
    warehouses: [{ name: "Main Warehouse", isDefault: true }],
    categories: ["electronics", "books"],
    currency: "USD",
    country: "US",
    timezone: "America/New_York",
    fiscalStartMonth: "January",
    pricesIncludeTax: false,
    defaultVatRate: "10",
  };

  const mockBusiness = { id: "biz-1", name: "New Business" };
  const mockInvitation = {
    id: "inv-1",
    email: "member1@example.com",
    role: "ADMIN",
  };
  const mockWarehouse = { id: "wh-1", name: "Main Warehouse", isDefault: true };
  const mockCategory = { id: "cat-1", value: "Electronics" };
  const mockSettings = { key: "setting1", value: "value1" };

  beforeEach(() => {
    vi.clearAllMocks();
    (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
    (businessActions.createBusiness as Mock).mockResolvedValue({
      data: mockBusiness,
      error: null,
    });
    (invitationActions.createManyInvitations as Mock).mockResolvedValue({
      data: [mockInvitation],
      error: null,
    });
    (warehouseActions.createManyWarehouses as Mock).mockResolvedValue({
      data: [mockWarehouse],
      error: null,
    });
    (categoryActions.upsertManyCategories as Mock).mockResolvedValue({
      data: [mockCategory],
      error: null,
    });
    (
      businessSettingsActions.upsertManyBusinessSettings as Mock
    ).mockResolvedValue({ data: [mockSettings], error: null });
  });

  describe("businessInitialization", () => {
    it("should successfully initialize business", async () => {
      (getUserIfHasPermission as vi.Mock).mockResolvedValue(mockUser);
      (businessActions.createBusiness as Mock).mockResolvedValue({
        data: mockBusiness,
        error: null,
      });
      (invitationActions.createManyInvitations as Mock).mockResolvedValue({
        data: [mockInvitation],
        error: null,
      });
      (warehouseActions.createManyWarehouses as Mock).mockResolvedValue({
        data: [mockWarehouse],
        error: null,
      });
      (categoryActions.upsertManyCategories as Mock).mockResolvedValue({
        data: [mockCategory],
        error: null,
      });
      (
        businessSettingsActions.upsertManyBusinessSettings as Mock
      ).mockResolvedValue({
        data: [mockSettings],
        error: null,
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(businessActions.createBusiness).toHaveBeenCalledWith({
        name: mockOnboardingData.businessName,
        businessType: mockOnboardingData.businessType,
      });

      expect(invitationActions.createManyInvitations).toHaveBeenCalledWith(
        mockOnboardingData.teamMembers
      );

      expect(warehouseActions.createManyWarehouses).toHaveBeenCalledWith({
        created: mockOnboardingData.warehouses,
        deleted: [],
      });

      expect(categoryActions.upsertManyCategories).toHaveBeenCalledWith(
        mockOnboardingData.categories
      );

      const expectedBusinessSettings = Object.entries({
        currency: mockOnboardingData.currency,
        country: mockOnboardingData.country,
        timezone: mockOnboardingData.timezone,
        fiscalStartMonth: mockOnboardingData.fiscalStartMonth,
        pricesIncludeTax: mockOnboardingData.pricesIncludeTax,
        ...(mockOnboardingData.defaultVatRate && {
          defaultVatRate: mockOnboardingData.defaultVatRate,
        }),
      }).map(([key, value]) => ({ key, value }));

      expect(
        businessSettingsActions.upsertManyBusinessSettings
      ).toHaveBeenCalledWith(expectedBusinessSettings);

      expect(result).toEqual({
        data: {
          business: mockBusiness,
          invitation: [mockInvitation],
          warehouse: [mockWarehouse],
          category: [mockCategory],
          settings: [mockSettings],
        },
        error: null,
      });
    });

    it("should return unauthorized error if user lacks permission", async () => {
      (getUserIfHasPermission as vi.Mock).mockResolvedValue(null);

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
      expect(businessActions.createBusiness).not.toHaveBeenCalled();
    });

    it("should return error if createBusiness fails", async () => {
      (businessActions.createBusiness as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.UNAUTHORIZED,
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should return error if createManyInvitations fails", async () => {
      (invitationActions.createManyInvitations as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.UNAUTHORIZED,
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should return error if createManyWarehouses fails", async () => {
      (warehouseActions.createManyWarehouses as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.UNAUTHORIZED,
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should return error if upsertManyCategories fails", async () => {
      (categoryActions.upsertManyCategories as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.UNAUTHORIZED,
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should return error if upsertManyBusinessSettings fails", async () => {
      (
        businessSettingsActions.upsertManyBusinessSettings as Mock
      ).mockResolvedValue({ data: null, error: ErrorCode.UNAUTHORIZED });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });
    });

    it("should catch and return FAILED_REQUEST for unexpected errors", async () => {
      const originalObjectEntries = Object.entries;
      Object.entries = vi.fn(() => {
        throw new Error("Simulated internal error");
      });

      const result = await businessInitialization(mockOnboardingData);

      expect(result).toEqual({ data: null, error: ErrorCode.UNAUTHORIZED });

      Object.entries = originalObjectEntries;
    });
  });
});
