import {
  BellIcon,
  CheckIcon,
  FilterIcon,
  MailIcon,
  SmartphoneIcon,
  XIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import StatCard from "@/components/shared/stat-card";
import { ListSkeleton } from "@/components/skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { formatCurrency, formatNumber } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
} from "@/server/actions/notification-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "notifications",
  });
}

async function NotificationsContent() {
  const t = await getTranslations("notifications");

  const { data: notificationsData, error: notificationsError } =
    await getNotifications({
      page: 1,
      pageSize: 10,
    });

  const { data: unreadCountData, error: unreadCountError } =
    await getUnreadCount({});

  if (notificationsError || unreadCountError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Separator />
        <div className="text-center text-destructive/80">
          Error loading notifications
        </div>
      </div>
    );
  }

  const notifications = notificationsData?.notifications || [];
  const unreadCount = unreadCountData || 0;
  const highPriorityCount = notifications.filter(
    (n) => n.priority === "high" && !n.read,
  ).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <MailIcon className="h-5 w-5" />;
      case "inventory":
        return <BellIcon className="h-5 w-5" />;
      case "order":
        return <BellIcon className="h-5 w-5" />;
      case "system":
        return <SmartphoneIcon className="h-5 w-5" />;
      default:
        return <BellIcon className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (createdAt: string | Date) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60),
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const notificationStats = [
    {
      title: t("unread"),
      subText: t("newNotifications"),
      value: formatNumber(unreadCount),
      icon: BellIcon,
    },
    {
      title: t("highPriority"),
      subText: t("requireAttention"),
      value: formatNumber(highPriorityCount),
      icon: BellIcon,
    },
    {
      title: t("total"),
      subText: t("allNotifications"),
      value: formatCurrency(notifications.length),
      icon: BellIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="head">
          <h1 className="">{t("title")}</h1>
          <p className="">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FilterIcon className="" />
            {t("filter")}
          </Button>
          <Button size="sm" variant="outline">
            <CheckIcon className="" />
            {t("markAllRead")}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {notificationStats.map((item) => (
          <StatCard
            icon={item.icon}
            key={`${item.title}-${item.subText}`}
            subText={item.subText}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("recentNotifications")}</CardTitle>
          <CardDescription>{t("latestNotifications")}</CardDescription>
        </CardHeader>
        <CardPanel>
          {notifications.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t("noNotifications")}</EmptyTitle>
                <EmptyDescription>
                  {t("noNotificationsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  className={`flex items-start gap-4 p-4 border rounded-lg ${
                    !notification.read
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white"
                  }`}
                  key={notification.id}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.read
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3
                          className={`font-medium ${
                            !notification.read
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "text-blue-700"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Badge
                          className={getPriorityColor(notification.priority)}
                          variant="secondary"
                        >
                          {t(`priorities.${notification.priority}`)}
                        </Badge>

                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {!notification.read && (
                      <Button size="sm" variant="ghost">
                        <CheckIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost">
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardPanel>
      </Card>
    </div>
  );
}

export default async function NotificationsPage() {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}
