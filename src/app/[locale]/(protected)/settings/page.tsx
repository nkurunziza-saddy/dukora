import {
  AlertCircleIcon,
  BellIcon,
  Building2Icon,
  CreditCardIcon,
  SettingsIcon,
  ShieldIcon,
  TagsIcon,
  UserIcon,
  WarehouseIcon,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import React, { Suspense } from "react";
import UserProfileForm from "@/components/forms/user-profile-form";
import { UserSettingsForm } from "@/components/forms/user-settings-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { constructMetadata } from "@/lib/config/metadata";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { getBusinessById } from "@/server/actions/business-actions";
import { getUserById } from "@/server/actions/user-actions";
import { ConnectStripe } from "./_components/connect-stripe";
import { EditBusinessDetails } from "./_components/edit-business-details";
import { EditBusinessSettings } from "./_components/edit-business-settings";
import { EditCategories } from "./_components/edit-categories";
import { EditWarehouses } from "./_components/edit-warehouses";

export const metadata: Metadata = constructMetadata({
  title: "Settings",
});

type TStripeFn = ReturnType<typeof getTranslations> extends Promise<infer R>
  ? R
  : never;

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <CardPanel>
              <p className="text-sm text-muted-foreground">Loading settings…</p>
            </CardPanel>
          </Card>
        </div>
      }
    >
      <SessionGuard />
    </Suspense>
  );
}

async function SessionGuard() {
  const session = await getCurrentSession();
  const tStripe = await getTranslations("stripe");
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;

  if (!userId || !businessId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="error" className="max-w-md">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Business or user not found. Please check your session.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const [businessRes, userRes] = await Promise.all([
    getBusinessById(businessId),
    getUserById(userId),
  ]);

  const business = businessRes.data;
  const user = userRes.data;

  if (!business) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="error" className="max-w-md">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Business data is not available. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedSettings business={business} user={user} tStripe={tStripe} />
  );
}

function ProtectedSettings({
  business,
  user,
  tStripe,
}: {
  business: any;
  user: any;
  tStripe: TStripeFn;
}) {
  const tabConfig = [
    {
      section: "Business",
      icon: Building2Icon,
      tabs: [
        {
          value: "business-details",
          label: "Business Details",
          icon: Building2Icon,
        },
        {
          value: "business-settings",
          label: "Business Settings",
          icon: SettingsIcon,
        },
        { value: "categories", label: "Categories", icon: TagsIcon },
        { value: "warehouses", label: "Warehouses", icon: WarehouseIcon },
        {
          value: "stripe",
          label: "Payments",
          icon: CreditCardIcon,
          disabled: true,
        },
      ],
    },
    {
      section: "Account",
      icon: UserIcon,
      tabs: [
        { value: "user-details", label: "Profile", icon: UserIcon },
        { value: "user-settings", label: "Preferences", icon: SettingsIcon },
        {
          value: "notifications",
          label: "Notifications",
          icon: BellIcon,
          disabled: true,
        },
        {
          value: "security",
          label: "Security",
          icon: ShieldIcon,
          disabled: true,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <h1 className="font-medium tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your business and account preferences
          </p>
        </div>

        <Tabs
          defaultValue="business-details"
          orientation="vertical"
          className="w-full flex-row gap-4"
        >
          <div className="w-60 shrink-0">
            <div className="sticky top-6">
              <TabsList className="flex flex-col gap-1 h-auto w-full bg-transparent border shadow-sm p-1">
                {tabConfig.map((section, sectionIndex) => (
                  <div key={section.section} className="w-full">
                    {sectionIndex > 0 && <Separator className="my-1" />}

                    <div className="px-2 py-1 border-b mb-2">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        {section.section}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      {section.tabs.map((tab) => (
                        <TabsTab
                          key={tab.value}
                          value={tab.value}
                          disabled={tab.disabled}
                          className="w-full justify-start text-sm font-medium"
                        >
                          <span className="truncate">{tab.label}</span>
                        </TabsTab>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsList>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <TabsPanel value="business-details" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    Update your business information and branding
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditBusinessDetails
                    business={{
                      businessType: business?.businessType || "",
                      domain: business?.domain || "",
                      description: business?.description || "",
                      id: business?.id || "",
                      isActive: business?.isActive || false,
                      logoUrl: business?.logoUrl || "",
                      name: business?.name || "",
                      registrationNumber: business?.registrationNumber || "",
                    }}
                  />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="business-settings" className="m-0">
              <Card>
                <CardPanel>
                  <EditBusinessSettings settings={business.businessSettings} />
                </CardPanel>
              </Card>
            </TabsPanel>
            <TabsPanel value="categories" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage product and service categories
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditCategories categories={business.categories} />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="warehouses" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouses</CardTitle>
                  <CardDescription>
                    Manage your warehouse locations and inventory
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditWarehouses warehouses={business.warehouses} />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="stripe" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>{tStripe("stripeIntegration")}</CardTitle>
                  <CardDescription>
                    {tStripe("stripeIntegrationDescription")}
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <ConnectStripe
                    stripeAccountId={business.stripeAccountId ?? undefined}
                  />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="user-details" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Details</CardTitle>
                  <CardDescription>
                    Update your personal information and profile
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <UserProfileForm user={user} />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="user-settings" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>User Settings</CardTitle>
                  <CardDescription>
                    Configure your account preferences and notifications
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <UserSettingsForm />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="notifications" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardPanel className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Order Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about order status changes
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Inventory Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Low stock and inventory warnings
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>System Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Platform updates and maintenance notices
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional content and newsletters
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                  <Button>Update Notifications</Button>
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel value="security" className="m-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>
                <CardPanel className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Password</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Last changed 30 days ago
                      </p>
                      <Button variant="outline" size="sm">
                        Change Password
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">
                        Two-Factor Authentication
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Active Sessions</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Manage your active login sessions across devices
                      </p>
                      <Button variant="outline" size="sm">
                        View Sessions
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Login History</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Review recent login activity
                      </p>
                      <Button variant="outline" size="sm">
                        View History
                      </Button>
                    </div>
                  </div>
                </CardPanel>
              </Card>
            </TabsPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
