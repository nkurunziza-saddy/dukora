"use client";

import { useState } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SelectProduct } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PublishProductDialog } from "./publish-product-dialog";

interface InventoryProductsTableProps {
  products: Array<{
    product: SelectProduct;
    totalStock: number;
    availableStock: number;
  }>;
}

export function InventoryProductsTable({
  products,
}: InventoryProductsTableProps) {
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SelectProduct | null>(
    null
  );

  const handlePublish = (product: SelectProduct) => {
    setSelectedProduct(product);
    setPublishDialogOpen(true);
  };

  if (products.length === 0) {
    return (
      <Card>
        <CardPanel>
          <Empty>
            <EmptyHeader>
              <EmptyTitle>All Products Published</EmptyTitle>
              <EmptyDescription>
                {" "}
                All your inventory products are already published to the store
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
          <CardTitle>Inventory Products</CardTitle>
          <CardDescription>
            Products from your inventory that are not yet published to the store
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(({ product, totalStock, availableStock }) => (
                <TableRow className="hover:bg-transparent" key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                        {product.imageUrl ? (
                          <img
                            alt={product.name}
                            className="h-full w-full object-cover rounded-md"
                            src={product.imageUrl}
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div> */}
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{product.categoryId || "Uncategorized"}</TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {formatCurrency(Number(product.price))}
                    </span>
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
                    <Badge variant="secondary">Not Published</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => handlePublish(product)} size="xs">
                      Publish
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardPanel>
      </Card>

      {selectedProduct && (
        <PublishProductDialog
          onOpenChange={setPublishDialogOpen}
          open={publishDialogOpen}
          product={selectedProduct}
        />
      )}
    </>
  );
}
