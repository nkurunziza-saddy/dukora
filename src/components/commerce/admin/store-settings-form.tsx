"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { InsertStoreSetting } from "@/lib/schema/schema.types";
import {
  toggleStoreEnabled,
  updateStoreSettings,
} from "@/server/actions/store/settings-actions";

interface StoreSettingsFormProps {
  settings: any;
  warehouses: Array<{ id: string; name: string }>;
}

export function StoreSettingsForm({
  settings,
  warehouses,
}: StoreSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    isStoreEnabled: settings?.isStoreEnabled || false,
    storeName: settings?.storeName || "",
    storeDescription: settings?.storeDescription || "",
    storeLogo: settings?.storeLogo || "",
    defaultWarehouseId: settings?.defaultWarehouseId || "",
    autoPublishNewProducts: settings?.autoPublishNewProducts || false,
    requireInventory: settings?.requireInventory ?? true,
    lowStockThreshold: settings?.lowStockThreshold || 10,
    syncMode: settings?.syncMode || "AUTO",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: Partial<InsertStoreSetting> = {
        storeName: formData.storeName || null,
        storeDescription: formData.storeDescription || null,
        storeLogo: formData.storeLogo || null,
        defaultWarehouseId: formData.defaultWarehouseId || null,
        autoPublishNewProducts: formData.autoPublishNewProducts,
        requireInventory: formData.requireInventory,
        lowStockThreshold: formData.lowStockThreshold,
        syncMode: formData.syncMode as any,
      };

      const result = await updateStoreSettings(updates);

      if (result.error) {
        toast.error("Failed to update settings", {
          description: result.error,
        });
        return;
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStore = async (enabled: boolean) => {
    try {
      const result = await toggleStoreEnabled(enabled);
      if (result.error) {
        toast.error("Failed to toggle store");
        return;
      }
      setFormData({ ...formData, isStoreEnabled: enabled });
      toast.success(enabled ? "Store enabled" : "Store disabled");
    } catch (error) {
      toast.error("Failed to toggle store");
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Store Status</CardTitle>
          <CardDescription>Enable or disable your online store</CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Store Enabled</Label>
              <p className="text-sm text-muted-foreground">
                Make your store visible to customers
              </p>
            </div>
            <Switch
              checked={formData.isStoreEnabled}
              onCheckedChange={handleToggleStore}
            />
          </div>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Branding</CardTitle>
          <CardDescription>
            Customize how your store appears to customers
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              onChange={(e) =>
                setFormData({ ...formData, storeName: e.target.value })
              }
              placeholder="My Store"
              value={formData.storeName}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Store Description</Label>
            <Textarea
              id="storeDescription"
              onChange={(e) =>
                setFormData({ ...formData, storeDescription: e.target.value })
              }
              placeholder="Brief description of your store"
              rows={3}
              value={formData.storeDescription}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeLogo">Store Logo URL</Label>
            <Input
              id="storeLogo"
              onChange={(e) =>
                setFormData({ ...formData, storeLogo: e.target.value })
              }
              placeholder="https://example.com/logo.png"
              type="url"
              value={formData.storeLogo}
            />
          </div>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fulfillment Settings</CardTitle>
          <CardDescription>Configure how orders are fulfilled</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="defaultWarehouse">Default Warehouse</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, defaultWarehouseId: value })
              }
              value={formData.defaultWarehouseId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                {warehouses.map((warehouse) => (
                  <SelectItem key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </SelectItem>
                ))}
              </SelectPopup>
            </Select>
            <p className="text-sm text-muted-foreground">
              Orders will be fulfilled from this warehouse by default
            </p>
          </div>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Management</CardTitle>
          <CardDescription>
            Control how inventory is managed for the store
          </CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-publish New Products</Label>
              <p className="text-sm text-muted-foreground">
                Automatically publish new inventory products to store
              </p>
            </div>
            <Switch
              checked={formData.autoPublishNewProducts}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, autoPublishNewProducts: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Inventory</Label>
              <p className="text-sm text-muted-foreground">
                Only allow purchases when inventory is available
              </p>
            </div>
            <Switch
              checked={formData.requireInventory}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, requireInventory: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              min="0"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  lowStockThreshold: Number(e.target.value),
                })
              }
              type="number"
              value={formData.lowStockThreshold}
            />
            <p className="text-sm text-muted-foreground">
              Alert when stock falls below this level
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="syncMode">Inventory Sync Mode</Label>
            <Select
              onValueChange={(value) =>
                setFormData({ ...formData, syncMode: value })
              }
              value={formData.syncMode}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="AUTO">Automatic</SelectItem>
                <SelectItem value="MANUAL">Manual</SelectItem>
              </SelectPopup>
            </Select>
            <p className="text-sm text-muted-foreground">
              AUTO: Stock syncs automatically | MANUAL: Sync manually when
              needed
            </p>
          </div>
        </CardPanel>
      </Card>

      <div className="flex justify-end">
        <Button disabled={loading} size="lg" type="submit">
          {loading ? <span>Saving...</span> : <span>Save Settings</span>}
        </Button>
      </div>
    </form>
  );
}
