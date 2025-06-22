import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslations } from "next-intl";

// Mock data
const products = [
  {
    id: 1,
    sku: "WH-001",
    name: "Wireless Headphones",
    category: "Electronics",
    barcode: "123456789012",
    batch: "BTH-2024-001",
    unitPrice: 99.99,
    supplier: "AudioTech Inc",
    description: "Premium wireless headphones with noise cancellation",
  },
  {
    id: 2,
    sku: "KB-002",
    name: "Mechanical Keyboard",
    category: "Electronics",
    barcode: "123456789013",
    batch: "BTH-2024-002",
    unitPrice: 129.99,
    supplier: "KeyCorp Ltd",
    description: "RGB mechanical keyboard with blue switches",
  },
  {
    id: 3,
    sku: "TB-004",
    name: "Standing Desk",
    category: "Furniture",
    barcode: "123456789014",
    batch: "BTH-2024-003",
    unitPrice: 299.99,
    supplier: "FurniCorp",
    description: "Electric height-adjustable standing desk",
  },
  {
    id: 4,
    sku: "CH-005",
    name: "Office Chair",
    category: "Furniture",
    barcode: "123456789015",
    batch: "BTH-2024-004",
    unitPrice: 199.99,
    supplier: "FurniCorp",
    description: "Ergonomic office chair with lumbar support",
  },
];

// const categories = [
//   "All",
//   "Electronics",
//   "Furniture",
//   "Office Supplies",
//   "Accessories",
// ];

export default function ProductCatalog() {
  const t = useTranslations("products");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="sr-only">uuu</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("sku")}</TableHead>
                <TableHead>{t("productName")}</TableHead>
                <TableHead>{t("category")}</TableHead>
                <TableHead className="text-right">{t("unitPrice")}</TableHead>
                <TableHead>{t("supplier")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{product.sku}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${product.unitPrice}
                  </TableCell>
                  <TableCell>{product.supplier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
