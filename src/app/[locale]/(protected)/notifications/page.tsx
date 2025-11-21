import { BellIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
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
  getNotificationStats,
  getNotifications,
} from "@/server/actions/notification-actions";
import { NotificationActions } from "./notification-actions";
import { NotificationToolbar } from "./notification-toolbar";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "notifications",
  });
}

async function NotificationsContent({
  searchParams,
}: {
  searchParams: { page?: string; pageSize?: string };
}) {
  const t = await getTranslations("notifications");

  const page = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.pageSize) || 10;

  const { data: notificationsData, error: notificationsError } =
    await getNotifications({
      page,
      pageSize,
    });

  const { data: statsData, error: statsError } = await getNotificationStats({});

  if (notificationsError || statsError) {
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
  const totalCount = notificationsData?.totalCount || 0;
  const totalPages = notificationsData?.totalPages || 0;
  const unreadCount = statsData?.unread || 0;
  const highPriorityCount = statsData?.highPriority || 0;
  const totalNotifications = statsData?.total || 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive-foreground";
      case "medium":
        return "bg-warning/10 text-warning-foreground";
      case "low":
        return "bg-info/10 text-info-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatTimestamp = (createdAt: string | Date) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
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
      value: formatNumber(totalNotifications),
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

      <NotificationToolbar />

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
                  className={`flex items-start gap-4 p-4 border rounded-lg transition-colors ${
                    !notification.read
                      ? "bg-primary/5 border-primary/10"
                      : "bg-card border-border"
                  }`}
                  key={notification.id}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary/80 rounded-full"></div>
                          )}
                          <h3
                            className={`font-medium ${
                              !notification.read
                                ? "text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {notification.title}
                          </h3>
                        </div>
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "text-foreground/80"
                              : "text-muted-foreground"
                          }`}
                        >
                          {notification.message}
                        </p>
                        {!!notification.data && (
                          <div className="mt-2 text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border">
                            {notification.type === "order" && (
                              <div className="flex flex-col gap-1">
                                {(
                                  notification.data as unknown as {
                                    orderNumber?: string;
                                  }
                                ).orderNumber && (
                                  <div className="flex gap-4">
                                    <span>
                                      Order #:{" "}
                                      {
                                        (
                                          notification.data as unknown as {
                                            orderNumber: string;
                                          }
                                        ).orderNumber
                                      }
                                    </span>
                                    <span>
                                      Amount:{" "}
                                      {formatCurrency(
                                        (
                                          notification.data as unknown as {
                                            amount: number;
                                          }
                                        ).amount
                                      )}
                                    </span>
                                  </div>
                                )}
                                {(
                                  notification.data as unknown as {
                                    productName?: string;
                                  }
                                ).productName && (
                                  <div className="flex gap-4">
                                    <span>
                                      Product:{" "}
                                      {
                                        (
                                          notification.data as unknown as {
                                            productName: string;
                                          }
                                        ).productName
                                      }
                                    </span>
                                    <span>
                                      Qty:{" "}
                                      {
                                        (
                                          notification.data as unknown as {
                                            quantity: number;
                                          }
                                        ).quantity
                                      }
                                    </span>
                                    <span>
                                      Amount:{" "}
                                      {formatCurrency(
                                        (
                                          notification.data as unknown as {
                                            amount: number;
                                          }
                                        ).amount
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                            {notification.type === "payment" && (
                              <div className="flex gap-4">
                                <span>
                                  Amount:{" "}
                                  {formatCurrency(
                                    (
                                      notification.data as unknown as {
                                        amount: number;
                                      }
                                    ).amount
                                  )}
                                </span>
                                <span>
                                  Currency:{" "}
                                  {(
                                    notification.data as unknown as {
                                      currency: string;
                                    }
                                  ).currency?.toUpperCase()}
                                </span>
                              </div>
                            )}
                            {notification.type === "inventory" && (
                              <div className="flex gap-4">
                                <span>
                                  Product:{" "}
                                  {
                                    (
                                      notification.data as unknown as {
                                        productName: string;
                                      }
                                    ).productName
                                  }
                                </span>
                                <span>
                                  Qty:{" "}
                                  {
                                    (
                                      notification.data as unknown as {
                                        quantity: number;
                                      }
                                    ).quantity
                                  }
                                </span>
                                <span>
                                  Amount:{" "}
                                  {formatCurrency(
                                    (
                                      notification.data as unknown as {
                                        amount: number;
                                      }
                                    ).amount
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={getPriorityColor(notification.priority)}
                      variant="secondary"
                    >
                      {t(`priorities.${notification.priority}`)}
                    </Badge>
                    <NotificationActions
                      isRead={notification.read}
                      notificationId={notification.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} ({totalCount} total notifications)
              </p>
              <div className="flex gap-2">
                <Button
                  disabled={page <= 1}
                  render={
                    <Link href={`?page=${page - 1}&pageSize=${pageSize}`} />
                  }
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={page >= totalPages}
                  render={
                    <Link href={`?page=${page + 1}&pageSize=${pageSize}`} />
                  }
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardPanel>
      </Card>
    </div>
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <NotificationsContent searchParams={await searchParams} />
    </Suspense>
  );
}
