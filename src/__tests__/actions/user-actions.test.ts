import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { getUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus } from "@/server/actions/user-actions";
import * as userRepo from "@/server/repos/user-repo";
import * as authActions from "@/server/actions/auth-actions";
import * as rolePermissions from "@/server/helpers/role-permissions";
import { ErrorCode } from "@/server/constants/errors";
import { revalidatePath } from "next/cache";

vi.mock("@/server/repos/user-repo");
vi.mock("@/server/actions/auth-actions");
vi.mock("@/server/helpers/role-permissions");
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
    unstable_cache: vi.fn((fn) => fn),
}));

describe("User Actions", () => {
  const mockUser = {
    id: "user-1",
    businessId: "biz-1",
    role: "OWNER",
    name: "Test User",
    email: "test@user.com",
    createdAt: new Date(),
  };

  const mockUsersData = {
    data: [
        { id: "user-1", name: "Test User 1", email: "user1@example.com" },
        { id: "user-2", name: "Test User 2", email: "user2@example.com" },
    ],
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return users successfully when user has permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.get_all_cached as Mock).mockResolvedValue(mockUsersData);

      const result = await getUsers();

      expect(authActions.getCurrentSession).toHaveBeenCalled();
      expect(rolePermissions.roleHasPermission).toHaveBeenCalled();
      expect(userRepo.get_all_cached).toHaveBeenCalledWith("biz-1");
      expect(result.data).toEqual(mockUsersData.data);
      expect(result.error).toBeNull();
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getUsers();

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.get_all_cached).not.toHaveBeenCalled();
    });
    
    it("should return unauthorized error when there is no session", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue(null);

      const result = await getUsers();

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.get_all_cached).not.toHaveBeenCalled();
    });

    it("should return an error if the repo call fails", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.get_all_cached as Mock).mockResolvedValue({
        data: null,
        error: ErrorCode.DATABASE_ERROR,
      });

      const result = await getUsers();

      expect(result.data).toBeNull();
      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
    });
  });

  describe("getUserById", () => {
    const targetUserId = "user-2";
    const mockUserData = {
      data: { id: targetUserId, name: "Test User 2", email: "user2@example.com" },
      error: null,
    };

    it("should return a user successfully when user has permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.get_by_id as Mock).mockResolvedValue(mockUserData);

      const result = await getUserById(targetUserId);

      expect(userRepo.get_by_id).toHaveBeenCalledWith(targetUserId, "biz-1");
      expect(result.data).toEqual(mockUserData.data);
      expect(result.error).toBeNull();
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await getUserById(targetUserId);

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return missing input error if userId is not provided", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await getUserById(" ");

      expect(result.error).toBe(ErrorCode.MISSING_INPUT);
      expect(result.data).toBeNull();
      expect(userRepo.get_by_id).not.toHaveBeenCalled();
    });

    it("should return not found error if user does not exist", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.get_by_id as Mock).mockResolvedValue({ data: null, error: ErrorCode.USER_NOT_FOUND });

      const result = await getUserById(targetUserId);

      expect(result.error).toBe(ErrorCode.USER_NOT_FOUND);
      expect(result.data).toBeNull();
    });

    it("should return an error if the repo call fails", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.get_by_id as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await getUserById(targetUserId);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe("createUser", () => {
    const newUserPayload = { name: "New User", email: "new@example.com", role: "MEMBER" as const };
    const createdUser = { id: "user-3", ...newUserPayload, businessId: "biz-1" };

    it("should create a user successfully", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.create as Mock).mockResolvedValue({ data: createdUser, error: null });

      const result = await createUser(newUserPayload);

      expect(userRepo.create).toHaveBeenCalledWith({ ...newUserPayload, businessId: "biz-1" });
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
      expect(result.data).toEqual(createdUser);
      expect(result.error).toBeNull();
    });

    it("should return missing input error if name is missing", async () => {
        (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
        (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  
        const result = await createUser({ ...newUserPayload, name: "" });
  
        expect(result.error).toBe(ErrorCode.MISSING_INPUT);
        expect(result.data).toBeNull();
        expect(userRepo.create).not.toHaveBeenCalled();
      });

      it("should return missing input error if email is missing", async () => {
        (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
        (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
  
        const result = await createUser({ ...newUserPayload, email: " " });
  
        expect(result.error).toBe(ErrorCode.MISSING_INPUT);
        expect(result.data).toBeNull();
        expect(userRepo.create).not.toHaveBeenCalled();
      });

    it("should return an error if the repo call fails", async () => {
        (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
        (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
        (userRepo.create as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });
  
        const result = await createUser(newUserPayload);
  
        expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
        expect(result.data).toBeNull();
      });

    it("should return unauthorized error when user lacks permission", async () => {
        (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
        (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);
  
        const result = await createUser(newUserPayload);
  
        expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
        expect(result.data).toBeNull();
        expect(userRepo.create).not.toHaveBeenCalled();
      });
  });

  describe("updateUser", () => {
    const targetUserId = "user-2";
    const updates = { name: "Updated Name" };
    const updatedUser = { id: targetUserId, name: "Updated Name", email: "user2@example.com" };

    it("should update a user successfully", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.update as Mock).mockResolvedValue({ data: updatedUser, error: null });

      const result = await updateUser({ userId: targetUserId, userData: updates });

      expect(userRepo.update).toHaveBeenCalledWith(targetUserId, updates, "biz-1");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
      expect(result.data).toEqual(updatedUser);
      expect(result.error).toBeNull();
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await updateUser({ userId: targetUserId, userData: updates });

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it("should return missing input error if userId is not provided", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await updateUser({ userId: " ", userData: updates });

      expect(result.error).toBe(ErrorCode.MISSING_INPUT);
      expect(result.data).toBeNull();
      expect(userRepo.update).not.toHaveBeenCalled();
    });

    it("should return an error if the repo call fails", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.update as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await updateUser({ userId: targetUserId, userData: updates });

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe("deleteUser", () => {
    const targetUserId = "user-2";

    it("should delete a user successfully", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.remove as Mock).mockResolvedValue({ data: { success: true }, error: null });

      const result = await deleteUser(targetUserId);

      expect(userRepo.remove).toHaveBeenCalledWith(targetUserId, "biz-1");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
      expect(result.data).toEqual({ success: true });
      expect(result.error).toBeNull();
    });

    it("should return an error when trying to delete oneself", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await deleteUser(mockUser.id);

      expect(result.error).toBe(ErrorCode.CANNOT_DELETE_SELF);
      expect(result.data).toBeNull();
      expect(userRepo.remove).not.toHaveBeenCalled();
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await deleteUser(targetUserId);

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.remove).not.toHaveBeenCalled();
    });

    it("should return missing input error if userId is not provided", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await deleteUser(" ");

      expect(result.error).toBe(ErrorCode.MISSING_INPUT);
      expect(result.data).toBeNull();
      expect(userRepo.remove).not.toHaveBeenCalled();
    });

    it("should return an error if the repo call fails", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.remove as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await deleteUser(targetUserId);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });
  });

  describe("toggleUserStatus", () => {
    const targetUserId = "user-2";
    const updatedUser = { id: targetUserId, name: "Test User 2", email: "user2@example.com", isActive: false };

    it("should toggle user status successfully", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.toggle_active as Mock).mockResolvedValue({ data: updatedUser, error: null });

      const result = await toggleUserStatus(targetUserId);

      expect(userRepo.toggle_active).toHaveBeenCalledWith(targetUserId, "biz-1");
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/users");
      expect(result.data).toEqual(updatedUser);
      expect(result.error).toBeNull();
    });

    it("should return an error when trying to deactivate oneself", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await toggleUserStatus(mockUser.id);

      expect(result.error).toBe(ErrorCode.CANNOT_DEACTIVATE_SELF);
      expect(result.data).toBeNull();
      expect(userRepo.toggle_active).not.toHaveBeenCalled();
    });

    it("should return unauthorized error when user lacks permission", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(false);

      const result = await toggleUserStatus(targetUserId);

      expect(result.error).toBe(ErrorCode.UNAUTHORIZED);
      expect(result.data).toBeNull();
      expect(userRepo.toggle_active).not.toHaveBeenCalled();
    });

    it("should return missing input error if userId is not provided", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);

      const result = await toggleUserStatus(" ");

      expect(result.error).toBe(ErrorCode.MISSING_INPUT);
      expect(result.data).toBeNull();
      expect(userRepo.toggle_active).not.toHaveBeenCalled();
    });

    it("should return an error if the repo call fails", async () => {
      (authActions.getCurrentSession as Mock).mockResolvedValue({ user: mockUser });
      (rolePermissions.roleHasPermission as Mock).mockReturnValue(true);
      (userRepo.toggle_active as Mock).mockResolvedValue({ data: null, error: ErrorCode.DATABASE_ERROR });

      const result = await toggleUserStatus(targetUserId);

      expect(result.error).toBe(ErrorCode.DATABASE_ERROR);
      expect(result.data).toBeNull();
    });
  });
});