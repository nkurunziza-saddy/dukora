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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
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
    value: boolean
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
          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("lowStockAlerts")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("lowStockAlertsDescription")}
                </p>
              </div>
              <Switch
                checked={settings.email.lowStock}
                onCheckedChange={(value) =>
                  updateSetting("email", "lowStock", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("newOrders")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("newOrdersDescription")}
                </p>
              </div>
              <Switch
                checked={settings.email.newOrders}
                onCheckedChange={(value) =>
                  updateSetting("email", "newOrders", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("paymentUpdates")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("paymentUpdatesDescription")}
                </p>
              </div>
              <Switch
                checked={settings.email.payments}
                onCheckedChange={(value) =>
                  updateSetting("email", "payments", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("reports")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("reportsDescription")}
                </p>
              </div>
              <Switch
                checked={settings.email.reports}
                onCheckedChange={(value) =>
                  updateSetting("email", "reports", value)
                }
              />
            </Field>
          </FieldGroup>
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
          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("lowStockAlerts")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("lowStockAlertsDescription")}
                </p>
              </div>
              <Switch
                checked={settings.push.lowStock}
                onCheckedChange={(value) =>
                  updateSetting("push", "lowStock", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("newOrders")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("newOrdersDescription")}
                </p>
              </div>
              <Switch
                checked={settings.push.newOrders}
                onCheckedChange={(value) =>
                  updateSetting("push", "newOrders", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("paymentUpdates")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("paymentUpdatesDescription")}
                </p>
              </div>
              <Switch
                checked={settings.push.payments}
                onCheckedChange={(value) =>
                  updateSetting("push", "payments", value)
                }
              />
            </Field>
          </FieldGroup>
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
          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("criticalAlerts")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("criticalAlertsDescription")}
                </p>
              </div>
              <Switch
                checked={settings.sms.criticalAlerts}
                onCheckedChange={(value) =>
                  updateSetting("sms", "criticalAlerts", value)
                }
              />
            </Field>
          </FieldGroup>

          <FieldGroup>
            <Field className="flex items-center justify-between">
              <div className="space-y-0.5">
                <FieldLabel>{t("paymentConfirmations")}</FieldLabel>
                <p className="text-sm text-muted-foreground">
                  {t("paymentConfirmationsDescription")}
                </p>
              </div>
              <Switch
                checked={settings.sms.paymentConfirmations}
                onCheckedChange={(value) =>
                  updateSetting("sms", "paymentConfirmations", value)
                }
              />
            </Field>
          </FieldGroup>
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
