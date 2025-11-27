"use client";

import { format } from "date-fns";
import { Eye, MoreHorizontalIcon, TrendingUp } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditStoreProductDialog } from "@/components/commerce/admin/update-store-product-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Menu, MenuItem, MenuPopup, MenuTrigger } from "@/components/ui/menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectProduct, SelectStoreProduct } from "@/lib/types";
import { formatCurrencyWithCode } from "@/lib/utils/currency-utils";
import { unpublishProduct } from "@/server/actions/store/products-actions";

interface ExtendedProduct {
  storeProduct: SelectStoreProduct;
  product: SelectProduct;
  totalStock: number;
  availableStock: number;
}

interface StoreProductsTableProps {
  products: Array<ExtendedProduct>;
}

export function StoreProductsTable({ products }: StoreProductsTableProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedStoreProduct, setSelectedStoreProduct] =
    useState<SelectStoreProduct | null>(null);

  const handleEdit = (storeProduct: SelectStoreProduct) => {
    setSelectedStoreProduct(storeProduct);
    setPublishDialogOpen(true);
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardPanel>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No Products Published</EmptyTitle>
              <EmptyDescription>
                {" "}
                Get started by publishing products from your inventory to your
                online store
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardPanel>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Published Products</CardTitle>
          <CardDescription>
            Manage products that are live on your store
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(
                ({ storeProduct, product, totalStock, availableStock }) => {
                  const title = storeProduct.storeTitle || product.name;
                  const price = storeProduct.storePrice || product.price;

                  return (
                    <TableRow
                      className="hover:bg-transparent"
                      key={storeProduct.id}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{title}</div>
                            <div className="text-sm text-muted-foreground">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {storeProduct.isPublished ? (
                            <Badge className="w-fit" variant="success">
                              Published
                            </Badge>
                          ) : (
                            <Badge className="w-fit" variant="secondary">
                              Draft
                            </Badge>
                          )}
                          {storeProduct.featured && (
                            <Badge className="w-fit" variant="outline">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {formatCurrencyWithCode(Number(price))}
                          </span>
                          {storeProduct.compareAtPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              {formatCurrencyWithCode(
                                Number(storeProduct.compareAtPrice)
                              )}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span>{availableStock} available</span>
                          <span className="text-muted-foreground">
                            {totalStock} total
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span>{storeProduct.viewCount || 0} views</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            <span>{storeProduct.soldCount || 0} sold</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          {format(
                            new Date(storeProduct.createdAt),
                            "MMM d, yyyy"
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Menu>
                          <MenuTrigger
                            render={
                              <Button size={"icon-sm"} variant={"ghost"} />
                            }
                          >
                            <MoreHorizontalIcon />
                          </MenuTrigger>
                          <MenuPopup align="end">
                            <MenuItem
                              closeOnClick
                              onClick={() => handleEdit(storeProduct)}
                            >
                              Edit
                            </MenuItem>
                            <MenuItem
                              onClick={async () => {
                                try {
                                  const result = await unpublishProduct(
                                    storeProduct.id
                                  );
                                  if (result.error) {
                                    toast.error("Failed to unpublish product", {
                                      description: result.error,
                                    });
                                    return;
                                  }

                                  toast.success("Product unpublished!", {
                                    description:
                                      "Product is now not available on your store",
                                  });
                                } catch (error) {
                                  toast.error("Failed to unpublish product");
                                }
                              }}
                            >
                              Unpublish
                            </MenuItem>
                          </MenuPopup>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </CardPanel>
      </Card>

      {selectedStoreProduct && (
        <EditStoreProductDialog
          onOpenChange={setPublishDialogOpen}
          open={publishDialogOpen}
          storeProduct={selectedStoreProduct}
        />
      )}
    </>
  );
}
