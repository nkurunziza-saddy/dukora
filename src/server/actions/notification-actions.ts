"use server";

import { revalidateTag } from "next/cache";
import { ERROR_CODE } from "@/server/constants/errors";
import { PERMISSION } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as notificationRepo from "@/server/repos/shared/notification-repo";
import * as statisticsRepo from "@/server/repos/shared/statistics-repo";

export const getNotifications = createProtectedAction(
  PERMISSION.NOTIFICATION_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const notifications = await notificationRepo.get_all_paginated(
      user.businessId,
      page,
      pageSize
    );

    if (notifications.error) {
      return { data: null, error: notifications.error };
    }

    return { data: notifications.data, error: null };
  }
);

export const markNotificationAsRead = createProtectedAction(
  PERMISSION.NOTIFICATION_UPDATE,
  async (user, { notificationId }: { notificationId: string }) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.mark_as_read(
      notificationId,
      user.businessId
    );

    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`notifications-${user.id}`, "max");
    revalidateTag(`notification-${notificationId}`, "max");
    revalidateTag("notifications", "max");
    return { data: result.data, error: null };
  }
);

export const markAllNotificationsAsRead = createProtectedAction(
  PERMISSION.NOTIFICATION_UPDATE,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.mark_all_as_read(user.businessId);

    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`notifications-${user.id}`, "max");
    revalidateTag("notifications", "max");
    return { data: result.data, error: null };
  }
);

export const deleteNotification = createProtectedAction(
  PERMISSION.NOTIFICATION_DELETE,
  async (user, { notificationId }: { notificationId: string }) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.delete_notification(
      notificationId,
      user.businessId
    );

    if (result.error) {
      return { data: null, error: result.error };
    }
    revalidateTag(`notifications-${user.businessId}`, "max");
    revalidateTag("notifications", "max");
    return { data: result.data, error: null };
  }
);

export const getNotificationStats = createProtectedAction(
  PERMISSION.NOTIFICATION_VIEW,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ERROR_CODE.BUSINESS_NOT_FOUND };
    }

    const result = await statisticsRepo.get_notification_stats(user.businessId);

    if (result.error) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  }
);
