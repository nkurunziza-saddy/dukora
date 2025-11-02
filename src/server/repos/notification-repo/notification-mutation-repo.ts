"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { notificationsTable } from "@/lib/schema";
import { ErrorCode } from "@/server/constants/errors";

export const create = async (data: {
  businessId: string;
  userId?: string;
  type: string;
  priority: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}) => {
  if (
    !data.businessId ||
    !data.type ||
    !data.priority ||
    !data.title ||
    !data.message
  ) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [notification] = await db
      .insert(notificationsTable)
      .values({
        businessId: data.businessId,
        userId: data.userId,
        type: data.type,
        priority: data.priority,
        title: data.title,
        message: data.message,
        data: data.data,
        read: false,
      })
      .returning();

    return { data: notification, error: null };
  } catch (error) {
    console.error("Failed to create notification:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const mark_as_read = async (
  notificationId: string,
  businessId: string
) => {
  if (!notificationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [notification] = await db
      .update(notificationsTable)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.businessId, businessId)
        )
      )
      .returning();

    if (!notification) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: notification, error: null };
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const mark_all_as_read = async (businessId: string) => {
  if (!businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    await db
      .update(notificationsTable)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notificationsTable.businessId, businessId),
          eq(notificationsTable.read, false)
        )
      );

    return { data: { success: true }, error: null };
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};

export const delete_notification = async (
  notificationId: string,
  businessId: string
) => {
  if (!notificationId || !businessId) {
    return { data: null, error: ErrorCode.MISSING_INPUT };
  }

  try {
    const [notification] = await db
      .delete(notificationsTable)
      .where(
        and(
          eq(notificationsTable.id, notificationId),
          eq(notificationsTable.businessId, businessId)
        )
      )
      .returning();

    if (!notification) {
      return { data: null, error: ErrorCode.NOT_FOUND };
    }

    return { data: notification, error: null };
  } catch (error) {
    console.error("Failed to delete notification:", error);
    return { data: null, error: ErrorCode.FAILED_REQUEST };
  }
};
