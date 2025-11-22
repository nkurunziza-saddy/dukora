"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ErrorCode } from "@/server/constants/errors";

export async function change_password(
  currentPassword: string,
  newPassword: string,
  revokeOtherSessions: boolean = false,
) {
  if (!currentPassword || !newPassword) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions,
      },
    });

    if (!result) {
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to change password:", error);
    if (error instanceof Error && error.message.includes("password")) {
      return { data: null, error: ErrorCode.INVALID_CREDENTIALS };
    }
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function set_password(password: string) {
  if (!password) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await auth.api.setPassword({
      headers: await headers(),
      body: {
        newPassword: password,
      },
    });

    if (!result) {
      return { data: null, error: ErrorCode.FAILED_REQUEST };
    }

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to set password:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function revoke_session(sessionToken: string) {
  if (!sessionToken) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const result = await auth.api.revokeSession({
      headers: await headers(),
      body: {
        token: sessionToken,
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function revoke_all_other_sessions() {
  try {
    const result = await auth.api.revokeOtherSessions({
      headers: await headers(),
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to revoke other sessions:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}

export async function delete_account() {
  try {
    const result = await auth.api.deleteUser({
      headers: await headers(),
      body: {
        callbackURL: "/",
      },
    });

    return { data: result, error: null };
  } catch (error) {
    console.error("Failed to delete account:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
}
