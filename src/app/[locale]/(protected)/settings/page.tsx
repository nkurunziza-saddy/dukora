import { AlertCircleIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import UserProfileForm from "@/components/forms/user-profile-form";
import { UserSettingsForm } from "@/components/forms/user-settings-form";
import { ConnectStripe } from "@/components/settings/connect-stripe";
import { EditBusinessDetails } from "@/components/settings/edit-business-details";
import { EditBusinessSettings } from "@/components/settings/edit-business-settings";
import { EditCategories } from "@/components/settings/edit-categories";
import { EditWarehouses } from "@/components/settings/edit-warehouses";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { SettingsSkeleton } from "@/components/skeletons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getCurrentSession } from "@/server/actions/auth-actions";
import { getBusinessById } from "@/server/actions/business/business-actions";
import { getUserById } from "@/server/actions/users/users-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "settings",
  });
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SessionGuard />
    </Suspense>
  );
}

async function SessionGuard() {
  const session = await getCurrentSession();
  const tStripe = await getTranslations("stripe");
  const tForms = await getTranslations("forms");
  const userId = session?.user?.id;
  const businessId = session?.user?.businessId;

  if (!userId || !businessId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-xl" variant="error">
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
        <Alert className="max-w-xl" variant="error">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Business data is not available. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ProtectedSettings
      business={business}
      tForms={tForms}
      tStripe={tStripe}
      user={user}
    />
  );
}

function ProtectedSettings({
  business,
  user,
  tStripe,
  tForms,
}: {
  business: Awaited<ReturnType<typeof getBusinessById>>["data"];
  user: Awaited<ReturnType<typeof getUserById>>["data"];
  tStripe: (key: string) => string;
  tForms: (key: string) => string;
}) {
  const tabConfig = [
    {
      section: "Business",
      tabs: [
        {
          value: "business-details",
          label: "Business Details",
        },
        {
          value: "business-settings",
          label: "Business Settings",
        },
        { value: "categories", label: "Categories" },
        { value: "warehouses", label: "Warehouses" },
        {
          value: "stripe",
          label: "Payments",
          disabled: true,
        },
      ],
    },
    {
      section: "Account",
      tabs: [
        { value: "user-details", label: "Profile" },
        { value: "user-settings", label: "Preferences" },
        {
          value: "notifications",
          label: "Notifications",
        },
        {
          value: "security",
          label: "Security",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-2">
          <h1 className="font-medium tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground max-w-48">
            Manage your preferences
          </p>
        </div>

        <Tabs
          className="w-full flex-row gap-4"
          defaultValue="business-details"
          orientation="vertical"
        >
          <div className="w-60 shrink-0">
            <div className="sticky top-6">
              <TabsList className="flex flex-col gap-1 h-auto w-full bg-transparent border shadow-sm p-1">
                {tabConfig.map((section, sectionIndex) => (
                  <div className="w-full" key={section.section}>
                    {sectionIndex > 0 && <Separator className="my-1" />}

                    <div className="px-2 py-1 border-b mb-2">
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        {section.section}
                      </h3>
                    </div>

                    <div className="space-y-1">
                      {section.tabs.map((tab) => (
                        <TabsTab
                          className="w-full justify-start text-sm font-medium"
                          disabled={tab.disabled}
                          key={tab.value}
                          value={tab.value}
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
            <TabsPanel className="m-0" value="business-details">
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

            <TabsPanel className="m-0" value="business-settings">
              <Card>
                <CardHeader className="">
                  <CardTitle>{tForms("businessSettings")}</CardTitle>
                  <CardDescription>
                    {tForms("businessSettingsDescription")}
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditBusinessSettings
                    settings={business?.businessSettings ?? []}
                  />
                </CardPanel>
              </Card>
            </TabsPanel>
            <TabsPanel className="m-0" value="categories">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>
                    Manage product and service categories
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditCategories categories={business?.categories ?? []} />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel className="m-0" value="warehouses">
              <Card>
                <CardHeader>
                  <CardTitle>Warehouses</CardTitle>
                  <CardDescription>
                    Manage your warehouse locations and inventory
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <EditWarehouses warehouses={business?.warehouses ?? []} />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel className="m-0" value="stripe">
              <Card>
                <CardHeader>
                  <CardTitle>{tStripe("stripeIntegration")}</CardTitle>
                  <CardDescription>
                    {tStripe("stripeIntegrationDescription")}
                  </CardDescription>
                </CardHeader>
                <CardPanel>
                  <ConnectStripe
                    stripeAccountId={business?.stripeAccountId ?? undefined}
                  />
                </CardPanel>
              </Card>
            </TabsPanel>

            <TabsPanel className="m-0" value="user-details">
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

            <TabsPanel className="m-0" value="user-settings">
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

            <TabsPanel className="m-0" value="notifications">
              <NotificationsSettings />
            </TabsPanel>

            <TabsPanel className="m-0" value="security">
              <SecuritySettings />
            </TabsPanel>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
