"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { publishProductToStore } from "@/server/actions/store/products-actions";

interface PublishProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    name: string;
    price: string;
    description?: string | null;
    imageUrl?: string | null;
  };
}

export function PublishProductDialog({
  open,
  onOpenChange,
  product,
}: PublishProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    storePrice: product.price || "",
    compareAtPrice: "",
    storeTitle: product.name || "",
    storeDescription: product.description || "",
    shortDescription: "",
    featured: false,
  });

  const handlePublish = async () => {
    setLoading(true);
    try {
      const result = await publishProductToStore({
        productId: product.id,
        options: {
          storePrice: formData.storePrice
            ? Number(formData.storePrice)
            : undefined,
          compareAtPrice: formData.compareAtPrice
            ? Number(formData.compareAtPrice)
            : undefined,
          storeTitle: formData.storeTitle || undefined,
          storeDescription: formData.storeDescription || undefined,
          shortDescription: formData.shortDescription || undefined,
          featured: formData.featured,
          images: product.imageUrl ? [product.imageUrl] : undefined,
        },
      });

      if (result.error) {
        toast.error("Failed to publish product", {
          description: result.error,
        });
        return;
      }

      toast.success("Product published!", {
        description: "Product is now live on your store",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to publish product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogPopup className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish to Store</DialogTitle>
          <DialogDescription>
            Configure how this product appears in your online store
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="storeTitle">Store Title</Label>
            <Input
              id="storeTitle"
              onChange={(e) =>
                setFormData({ ...formData, storeTitle: e.target.value })
              }
              placeholder="Product name for store"
              value={formData.storeTitle}
            />
            <p className="text-sm text-muted-foreground">
              Leave blank to use product name: "{product.name}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="storePrice">Store Price</Label>
              <Input
                id="storePrice"
                onChange={(e) =>
                  setFormData({ ...formData, storePrice: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                type="number"
                value={formData.storePrice}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">
                Compare at Price (optional)
              </Label>
              <Input
                id="compareAtPrice"
                onChange={(e) =>
                  setFormData({ ...formData, compareAtPrice: e.target.value })
                }
                placeholder="0.00"
                step="0.01"
                type="number"
                value={formData.compareAtPrice}
              />
              <p className="text-xs text-muted-foreground">
                Original price for showing discounts
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              maxLength={150}
              onChange={(e) =>
                setFormData({ ...formData, shortDescription: e.target.value })
              }
              placeholder="Brief description for product cards"
              value={formData.shortDescription}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storeDescription">Full Description</Label>
            <Textarea
              id="storeDescription"
              onChange={(e) =>
                setFormData({ ...formData, storeDescription: e.target.value })
              }
              placeholder="Detailed product description"
              rows={4}
              value={formData.storeDescription}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="featured">Featured Product</Label>
              <p className="text-sm text-muted-foreground">
                Show this product on the store homepage
              </p>
            </div>
            <Switch
              checked={formData.featured}
              id="featured"
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            disabled={loading}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button disabled={loading} onClick={handlePublish}>
            {loading ? <>Publishing...</> : <>Publish to Store</>}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
