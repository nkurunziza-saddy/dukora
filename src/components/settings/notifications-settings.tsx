"use client";

import { BellIcon, MailIcon, SmartphoneIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { FieldLabel } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

interface NotificationSettings {
  email: {
    lowStock: boolean;
    newOrders: boolean;
    payments: boolean;
    reports: boolean;
  };
  push: {
    lowStock: boolean;
    newOrders: boolean;
    payments: boolean;
  };
  sms: {
    criticalAlerts: boolean;
    paymentConfirmations: boolean;
  };
}

export function NotificationsSettings() {
  const t = useTranslations("settings.notifications");
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      lowStock: true,
      newOrders: true,
      payments: false,
      reports: true,
    },
    push: {
      lowStock: true,
      newOrders: true,
      payments: false,
    },
    sms: {
      criticalAlerts: true,
      paymentConfirmations: false,
    },
  });

  const updateSetting = (
    category: keyof NotificationSettings,
    key: string,
    value: boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value,
      },
    }));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    console.log("Saving notification settings:", settings);
  };

  const handleSendTestNotification = () => {
    // TODO: Implement test notification sending
    console.log("Sending test notification...");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <Separator />

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailIcon className="h-5 w-5" />
            {t("emailNotifications")}
          </CardTitle>
          <CardDescription>
            {t("emailNotificationsDescription")}
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="email-lowStock"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("lowStockAlerts")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("lowStockAlertsDescription")}
              </p>
            </div>
            <Switch
              id="email-lowStock"
              checked={settings.email.lowStock}
              onCheckedChange={(value) =>
                updateSetting("email", "lowStock", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="email-newOrders"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{t("newOrders")}</p>
              <p className="text-muted-foreground text-xs">
                {t("newOrdersDescription")}
              </p>
            </div>
            <Switch
              id="email-newOrders"
              checked={settings.email.newOrders}
              onCheckedChange={(value) =>
                updateSetting("email", "newOrders", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="email-payments"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("paymentUpdates")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("paymentUpdatesDescription")}
              </p>
            </div>
            <Switch
              id="email-payments"
              checked={settings.email.payments}
              onCheckedChange={(value) =>
                updateSetting("email", "payments", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="email-reports"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{t("reports")}</p>
              <p className="text-muted-foreground text-xs">
                {t("reportsDescription")}
              </p>
            </div>
            <Switch
              id="email-reports"
              checked={settings.email.reports}
              onCheckedChange={(value) =>
                updateSetting("email", "reports", value)
              }
            />
          </FieldLabel>
        </CardPanel>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            {t("pushNotifications")}
          </CardTitle>
          <CardDescription>{t("pushNotificationsDescription")}</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="push-lowStock"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("lowStockAlerts")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("lowStockAlertsDescription")}
              </p>
            </div>
            <Switch
              id="push-lowStock"
              checked={settings.push.lowStock}
              onCheckedChange={(value) =>
                updateSetting("push", "lowStock", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="push-newOrders"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">{t("newOrders")}</p>
              <p className="text-muted-foreground text-xs">
                {t("newOrdersDescription")}
              </p>
            </div>
            <Switch
              id="push-newOrders"
              checked={settings.push.newOrders}
              onCheckedChange={(value) =>
                updateSetting("push", "newOrders", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="push-payments"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("paymentUpdates")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("paymentUpdatesDescription")}
              </p>
            </div>
            <Switch
              id="push-payments"
              checked={settings.push.payments}
              onCheckedChange={(value) =>
                updateSetting("push", "payments", value)
              }
            />
          </FieldLabel>
        </CardPanel>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SmartphoneIcon className="h-5 w-5" />
            {t("smsNotifications")}
          </CardTitle>
          <CardDescription>{t("smsNotificationsDescription")}</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="sms-criticalAlerts"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("criticalAlerts")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("criticalAlertsDescription")}
              </p>
            </div>
            <Switch
              id="sms-criticalAlerts"
              checked={settings.sms.criticalAlerts}
              onCheckedChange={(value) =>
                updateSetting("sms", "criticalAlerts", value)
              }
            />
          </FieldLabel>

          <FieldLabel
            className="flex items-center gap-6 rounded-lg border p-3 hover:bg-accent/50 has-data-[state=checked]:border-primary/48 has-data-[state=checked]:bg-accent/50"
            htmlFor="sms-paymentConfirmations"
          >
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium leading-none">
                {t("paymentConfirmations")}
              </p>
              <p className="text-muted-foreground text-xs">
                {t("paymentConfirmationsDescription")}
              </p>
            </div>
            <Switch
              id="sms-paymentConfirmations"
              checked={settings.sms.paymentConfirmations}
              onCheckedChange={(value) =>
                updateSetting("sms", "paymentConfirmations", value)
              }
            />
          </FieldLabel>
        </CardPanel>
      </Card>

      <div className="flex justify-between">
        <Button onClick={handleSendTestNotification} variant="outline">
          Send Test Notification
        </Button>
        <Button onClick={handleSave}>{t("saveSettings")}</Button>
      </div>
    </div>
  );
}
