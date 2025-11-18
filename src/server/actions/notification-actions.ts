"use server";

import { ErrorCode } from "@/server/constants/errors";
import { Permission } from "@/server/constants/permissions";
import { createProtectedAction } from "@/server/helpers/action-factory";
import * as notificationRepo from "@/server/repos/notification-repo";

export const getNotifications = createProtectedAction(
  Permission.NOTIFICATION_VIEW,
  async (user, { page, pageSize }: { page: number; pageSize: number }) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const notifications = await notificationRepo.get_all_paginated(
      user.businessId,
      page,
      pageSize,
    );

    if (notifications.error) {
      return { data: null, error: notifications.error };
    }

    return { data: notifications.data, error: null };
  },
);

export const markNotificationAsRead = createProtectedAction(
  Permission.NOTIFICATION_UPDATE,
  async (user, { notificationId }: { notificationId: string }) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.mark_as_read(
      notificationId,
      user.businessId,
    );

    if (result.error) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  },
);

export const markAllNotificationsAsRead = createProtectedAction(
  Permission.NOTIFICATION_UPDATE,
  async (user) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.mark_all_as_read(user.businessId);

    if (result.error) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  },
);

export const deleteNotification = createProtectedAction(
  Permission.NOTIFICATION_DELETE,
  async (user, { notificationId }: { notificationId: string }) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.delete_notification(
      notificationId,
      user.businessId,
    );

    if (result.error) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  },
);

export const getUnreadCount = createProtectedAction(
  Permission.NOTIFICATION_VIEW,
  async (user, _params) => {
    if (!user.businessId) {
      return { data: null, error: ErrorCode.BUSINESS_NOT_FOUND };
    }

    const result = await notificationRepo.get_unread_count(user.businessId);

    if (result.error) {
      return { data: null, error: result.error };
    }

    return { data: result.data, error: null };
  },
);
