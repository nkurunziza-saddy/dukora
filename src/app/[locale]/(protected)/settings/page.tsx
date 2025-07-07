import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getCurrentSession } from "@/server/actions/auth-actions";
// import { getUserSettings } from "@/server/actions/user-settings-actions";
import { getBusinessById } from "@/server/actions/business-actions";
import { getUserById } from "@/server/actions/user-actions";
// import {getTranslations} from 'next-intl/server';
import UserProfileForm from "@/components/forms/user-profile-form";
// import UserSettingsForm from "@/components/forms/user-settings-form";
import { EditBusinessDetails } from "./_components/edit-business-details";
import { EditBusinessSettings } from "./_components/edit-business-settings";
import { EditCategories } from "./_components/edit-categories";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { EditWarehouses } from "./_components/edit-warehouses";
import { ConnectStripe } from "./_components/connect-stripe";
import { UserSettingsForm } from "@/components/forms/user-settings-form";

export default async function SettingsPage() {
  const session = await getCurrentSession();
  const businessId = session?.user.businessId;
  const userId = session?.user.id;

  if (!businessId || !userId) {
    return <div>Business or user not found</div>;
  }

  const [businessRes, userRes] = await Promise.all([
    getBusinessById(businessId),
    // getBusinessSettings({}),
    getUserById(userId),
    // getUserSettings({}),
    //   getTranslations("settings"),
  ]);

  const business = businessRes.data;
  // const businessSettings = businessSettingsRes.data;
  const user = userRes.data;
  // const userSettings = userSettingsRes.data;
  if (!business) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Business data is not available. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }
  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="business-details"
        orientation="vertical"
        className="w-full flex-row gap-4"
      >
        <TabsList className="flex flex-col gap-1 justify-start bg-transparent">
          <h3 className="w-full text-sm text-muted-foreground">Business</h3>
          <TabsTrigger
            value="business-details"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            Business Details
          </TabsTrigger>
          <TabsTrigger
            value="business-settings"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            Business Settings
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="warehouses"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            Warehouses
          </TabsTrigger>
          <TabsTrigger
            value="stripe"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            Stripe
          </TabsTrigger>

          <h3 className="w-full text-sm text-muted-foreground">User</h3>

          <TabsTrigger
            value="user-details"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            User details
          </TabsTrigger>
          <TabsTrigger
            value="user-settings"
            className="w-full justify-start data-[state=active]:shadow-none ml-3 text-sm"
          >
            User settings
          </TabsTrigger>
        </TabsList>

        <div className="grow rounded-md text-start">
          <TabsContent value="business-details">
            {" "}
            <EditBusinessDetails
              business={{
                businessType: business?.businessType || "",
                domain: business?.domain || "",
                id: business?.id || "",
                isActive: business?.isActive || false,
                logoUrl: business?.logoUrl || "",
                name: business?.name || "",
                registrationNumber: business?.registrationNumber || "",
              }}
              businessTypes={[
                { value: "corporation", label: "Corporation" },
                { value: "llc", label: "Limited Liability Company (LLC)" },
                { value: "partnership", label: "Partnership" },
                { value: "sole_proprietorship", label: "Sole Proprietorship" },
                { value: "nonprofit", label: "Non-Profit Organization" },
                { value: "other", label: "Other" },
              ]}
            />
          </TabsContent>
          <TabsContent value="business-settings">
            {" "}
            <EditBusinessSettings settings={business.businessSettings} />
          </TabsContent>
          <TabsContent value="categories">
            {" "}
            <EditCategories categories={business.categories} />
          </TabsContent>
          <TabsContent value="warehouses">
            {" "}
            <EditWarehouses warehouses={business.warehouses} />
          </TabsContent>
          <TabsContent value="stripe">
            {" "}
            <ConnectStripe
              stripeAccountId={business.stripeAccountId ?? undefined}
            />
          </TabsContent>

          <TabsContent value="user-details">
            {" "}
            <UserProfileForm user={user} />
          </TabsContent>
          <TabsContent value="user-settings">
            {" "}
            <UserSettingsForm />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
