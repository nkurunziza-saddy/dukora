import { getBusinessSettings } from "@/server/actions/business-settings-actions";
import { getUserSettings } from "@/server/actions/user-settings-actions";
import { getBusinessById } from "@/server/actions/business-action";
import { getUserById } from "@/server/actions/user-actions";
import BusinessProfileForm from "@/components/forms/business-profile-form";
import BusinessSettingsForm from "@/components/forms/business-settings-form";
import UserProfileForm from "@/components/forms/user-profile-form";
import UserSettingsForm from "@/components/forms/user-settings-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";
import { getCurrentSession } from "@/lib/auth";

export default async function SettingsPage() {
  const session = await getCurrentSession();
  const businessId = session?.user.businessId;
  const userId = session?.user.id;

  if (!businessId || !userId) {
    return <div>Business or user not found</div>;
  }

  const [businessRes, businessSettingsRes, userRes, userSettingsRes, t] = await Promise.all([
    getBusinessById(businessId),
    getBusinessSettings({}),
    getUserById(userId),
    getUserSettings({}),
    getTranslations("settings"),
  ]);

  const business = businessRes.data;
  const businessSettings = businessSettingsRes.data;
  const user = userRes.data;
  const userSettings = userSettingsRes.data;

  return (
    <div className="space-y-6">
      {/* <h1 className="text-2xl font-semibold">{t("title")}</h1> */}
      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">{t("business")}</TabsTrigger>
          <TabsTrigger value="user">{t("user")}</TabsTrigger>
        </TabsList>
        <TabsContent value="business" className="space-y-6">
          <BusinessProfileForm business={business} />
          <BusinessSettingsForm settings={businessSettings} />
        </TabsContent>
        <TabsContent value="user" className="space-y-6">
          <UserProfileForm user={user} />
          <UserSettingsForm settings={userSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
