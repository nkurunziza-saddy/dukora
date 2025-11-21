"use client";

import { CheckIcon, FilterIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { markAllNotificationsAsRead } from "@/server/actions/notification-actions";

export function NotificationToolbar() {
  const router = useRouter();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await markAllNotificationsAsRead({});
      router.refresh();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div />
      <div className="flex gap-2">
        <Button disabled size="sm" variant="outline">
          <FilterIcon className="" />
          Filter
        </Button>
        <Button
          disabled={isMarkingAllRead}
          onClick={handleMarkAllAsRead}
          size="sm"
          variant="outline"
        >
          <CheckIcon className="" />
          {isMarkingAllRead ? "Marking..." : "Mark All Read"}
        </Button>
      </div>
    </div>
  );
}
