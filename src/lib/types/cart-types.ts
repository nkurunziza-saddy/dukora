export type CartItem = {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  price: string;
  costPrice: string;
  imageUrl: string | null;
  status: "ACTIVE" | "INACTIVE" | "DISCONTINUED";
  createdAt: Date;
  updatedAt: Date;
  totalStock: number;
  availableStock: number;
  categoryValue: string | null;
  categoryDescription: string | null;
};

export type StoreProduct = CartItem & {
  unit: string;
  weight: string | null;
  length: string | null;
  width: string | null;
  height: string | null;
};
