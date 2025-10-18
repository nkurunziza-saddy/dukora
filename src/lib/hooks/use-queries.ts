import { getBusinesses } from "@/server/actions/business-actions";
import { getCategories } from "@/server/actions/category-actions";
import { getProductById, getProducts } from "@/server/actions/product-actions";
import { getSuppliers } from "@/server/actions/supplier-actions";
import { getUserById } from "@/server/actions/user-actions";
import { getWarehouses } from "@/server/actions/warehouse-actions";
import { getWarehouseItems } from "@/server/actions/warehouse-item-actions";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
  const res = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useProductDetails = (productId: string | null) => {
  const res = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProductById(productId!),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useUserData = (userId: string | null) => {
  const res = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useBusinesses = () => {
  const res = useQuery({
    queryKey: ["businesses"],
    queryFn: () => getBusinesses({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

// TODO: Connect this to productId in-function
export const useWarehouseItems = (productId: string | null) => {
  const res = useQuery({
    queryKey: ["warehouse-items", productId],
    queryFn: () => getWarehouseItems({ productId: productId! }),
    enabled: !!productId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useSuppliers = () => {
  const res = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => getSuppliers({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useWarehouses = () => {
  const res = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => getWarehouses({}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};

export const useCategories = () => {
  const res = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories({}),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
  return { ...res, data: res.data?.data };
};
