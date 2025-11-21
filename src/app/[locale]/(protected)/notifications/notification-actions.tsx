"use client";

import { CheckIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  deleteNotification,
  markNotificationAsRead,
} from "@/server/actions/notification-actions";

interface NotificationActionsProps {
  notificationId: string;
  isRead: boolean;
}

export function NotificationActions({
  notificationId,
  isRead,
}: NotificationActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async () => {
    setIsLoading(true);
    try {
      await markNotificationAsRead({ notificationId });
      router.refresh();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteNotification({ notificationId });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-1">
      {!isRead && (
        <Button
          disabled={isLoading}
          onClick={handleMarkAsRead}
          size="icon-sm"
          variant="ghost"
        >
          <CheckIcon className="h-4 w-4" />
        </Button>
      )}
      <Button
        disabled={isLoading}
        onClick={handleDelete}
        size="icon-sm"
        variant="ghost"
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}
