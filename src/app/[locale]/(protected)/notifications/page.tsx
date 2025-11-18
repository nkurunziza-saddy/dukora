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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import {
  getNotifications,
  getUnreadCount,
} from "@/server/actions/notification-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "notifications",
  });
}

export default async function NotificationsPage() {
  const t = await getTranslations("notifications");

  // Get real data from server actions
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
        return "bg-red-100 text-red-800";
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <FilterIcon className="mr-2 h-4 w-4" />
            {t("filter")}
          </Button>
          <Button size="sm" variant="outline">
            <CheckIcon className="mr-2 h-4 w-4" />
            {t("markAllRead")}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Notification Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("unread")}</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">
              {t("newNotifications")}
            </p>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("highPriority")}
            </CardTitle>
            <BellIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold text-red-600">
              {highPriorityCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("requireAttention")}
            </p>
          </CardPanel>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total")}</CardTitle>
            <BellIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardPanel>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("allNotifications")}
            </p>
          </CardPanel>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentNotifications")}</CardTitle>
          <CardDescription>{t("latestNotifications")}</CardDescription>
        </CardHeader>
        <CardPanel>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BellIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t("noNotifications")}</p>
              <p className="text-sm">{t("noNotificationsDescription")}</p>
            </div>
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

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{t("notificationPreferences")}</CardTitle>
          <CardDescription>{t("manageNotifications")}</CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">{t("emailNotifications")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("receiveEmailNotifications")}
              </p>
              <Button size="sm" variant="outline">
                {t("configureEmailSettings")}
              </Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("pushNotifications")}</h4>
              <p className="text-sm text-muted-foreground">
                {t("getInstantNotifications")}
              </p>
              <Button size="sm" variant="outline">
                {t("configurePushSettings")}
              </Button>
            </div>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
