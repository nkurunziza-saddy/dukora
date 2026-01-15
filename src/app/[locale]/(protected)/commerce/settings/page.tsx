import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreSettingsForm } from "@/components/commerce/admin/store-settings-form";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getStoreSettings } from "@/server/actions/store/settings-actions";
import { getWarehouses } from "@/server/actions/warehouse/warehouses-actions";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "commerce",
  });
}

async function SettingsContent() {
  const [settingsResult, warehousesResult] = await Promise.all([
    getStoreSettings({}),
    getWarehouses({}),
  ]);

  const warehouses = warehousesResult.data || [];

  return (
    <StoreSettingsForm settings={settingsResult.data} warehouses={warehouses} />
  );
}

export default async function StoreSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="head">
          <h1 className="">Store Settings</h1>
          <p className="">
            {" "}
            Configure your online store settings and preferences
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div
                className="h-64 bg-muted animate-pulse rounded-lg"
                key={`settings-skeleton-${i}`}
              />
            ))}
          </div>
        }
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}
