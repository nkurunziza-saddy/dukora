export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  costPrice: string;
  currency: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  createdAt: Date;
  updatedAt: Date;
  totalStock: number;
  availableStock: number;
  categoryValue: string | null;
  categoryDescription: string | null;
  warehouseItemId?: string;
};

export type StoreProduct = CartItem & {
  unit: string;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
};
