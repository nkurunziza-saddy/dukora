"use client";
import { EditBusinessDetails } from "./edit-business-details";
import { EditBusinessSettings } from "./edit-business-settings";
import { EditCategories } from "./edit-categories";
import { EditWarehouses } from "./edit-warehouses";
import { ConnectStripe } from "./connect-stripe";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building2,
  Settings,
  Tag,
  Warehouse,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import type {
  SelectBusiness,
  SelectBusinessSetting,
  SelectCategory,
  SelectWarehouse,
} from "@/lib/schema/schema-types";

export type BusinessPayload = SelectBusiness & {
  businessSettings: SelectBusinessSetting[];
  categories: SelectCategory[];
  warehouses: SelectWarehouse[];
};

interface BusinessSettingsProps {
  business?: BusinessPayload;
}

export function BusinessSettingsForm({ business }: BusinessSettingsProps) {
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

  // Calculate completion status
  const completionStats = {
    details: business.name && business.businessType ? 1 : 0,
    settings: business.businessSettings.length > 0 ? 1 : 0,
    categories: business.categories.length > 0 ? 1 : 0,
    warehouses: business.warehouses.length > 0 ? 1 : 0,
    stripe: business.stripeAccountId ? 1 : 0,
  };

  const totalSections = Object.keys(completionStats).length;
  const completedSections = Object.values(completionStats).reduce(
    (sum, status) => sum + status,
    0
  );
  const completionPercentage = Math.round(
    (completedSections / totalSections) * 100
  );

  return (
    <div className="space-y-8">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Business Settings</h1>
            <p className="text-muted-foreground">
              Configure your business information and preferences
            </p>
          </div>
          <Badge
            variant={completionPercentage === 100 ? "default" : "secondary"}
            className="text-sm"
          >
            {completionPercentage}% Complete
          </Badge>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Building2 className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Details</p>
              <Badge
                variant={completionStats.details ? "default" : "secondary"}
                className="text-xs"
              >
                {completionStats.details ? "Complete" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Settings className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Settings</p>
              <Badge
                variant={completionStats.settings ? "default" : "secondary"}
                className="text-xs"
              >
                {completionStats.settings ? "Complete" : "Pending"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Tag className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Categories</p>
              <Badge
                variant={completionStats.categories ? "default" : "secondary"}
                className="text-xs"
              >
                {business.categories.length} Items
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Warehouse className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Warehouses</p>
              <Badge
                variant={completionStats.warehouses ? "default" : "secondary"}
                className="text-xs"
              >
                {business.warehouses.length} Locations
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <CreditCard className="h-4 w-4" />
            <div>
              <p className="text-xs font-medium">Stripe</p>
              <Badge
                variant={completionStats.stripe ? "default" : "secondary"}
                className="text-xs"
              >
                {completionStats.stripe ? "Connected" : "Not Connected"}
              </Badge>
            </div>
          </div>
        </div>

        {completionPercentage < 100 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete all sections to unlock full business functionality.
              Missing sections may limit some features.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Business Details</h2>
          <Badge variant={completionStats.details ? "default" : "secondary"}>
            {completionStats.details ? "Complete" : "Incomplete"}
          </Badge>
        </div>
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
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Business Settings</h2>
          <Badge variant={completionStats.settings ? "default" : "secondary"}>
            {business.businessSettings.length} Settings
          </Badge>
        </div>
        <EditBusinessSettings settings={business.businessSettings} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Categories</h2>
          <Badge variant={completionStats.categories ? "default" : "secondary"}>
            {business.categories.length} Categories
          </Badge>
        </div>
        <EditCategories categories={business.categories} />
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Warehouses & Locations</h2>
          <Badge variant={completionStats.warehouses ? "default" : "secondary"}>
            {business.warehouses.length} Locations
          </Badge>
        </div>
        <EditWarehouses warehouses={business.warehouses} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Payment Integration</h2>
          <Badge variant={completionStats.stripe ? "default" : "secondary"}>
            {completionStats.stripe ? "Connected" : "Not Connected"}
          </Badge>
        </div>
        <ConnectStripe
          stripeAccountId={business.stripeAccountId ?? undefined}
        />
      </div>

      {completionPercentage === 100 && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="default">🎉 Setup Complete</Badge>
          </div>
          <p className="text-sm text-green-800 dark:text-green-200">
            Congratulations! Your business setup is complete. All systems are
            configured and ready for use.
          </p>
        </div>
      )}
    </div>
  );
}
