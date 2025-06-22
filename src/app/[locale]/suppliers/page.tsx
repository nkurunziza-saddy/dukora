"use client";

import { useState } from "react";
import { Plus, Star, Phone, Mail, MapPin, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useTranslations } from "next-intl";

// Mock data
const suppliers = [
  {
    id: 1,
    name: "AudioTech Inc",
    logo: "https://via.placeholder.com/40x40?text=AT",
    contact: "John Smith",
    email: "john@audiotech.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    rating: 4.8,
    totalOrders: 156,
    categories: ["Electronics", "Audio Equipment"],
  },
  {
    id: 2,
    name: "FurniCorp",
    logo: "https://via.placeholder.com/40x40?text=FC",
    contact: "Sarah Johnson",
    email: "sarah@furnicorp.com",
    phone: "+1 (555) 987-6543",
    location: "Chicago, IL",
    rating: 4.5,
    totalOrders: 89,
    categories: ["Furniture", "Office Supplies"],
  },
  {
    id: 3,
    name: "KeyCorp Ltd",
    logo: "https://via.placeholder.com/40x40?text=KC",
    contact: "Mike Chen",
    email: "mike@keycorp.com",
    phone: "+1 (555) 456-7890",
    location: "San Francisco, CA",
    rating: 4.9,
    totalOrders: 234,
    categories: ["Electronics", "Gaming"],
  },
];

const products = [
  { id: 1, sku: "WH-001", name: "Wireless Headphones", unitCost: 85.0 },
  { id: 2, sku: "KB-002", name: "Mechanical Keyboard", unitCost: 110.0 },
  { id: 3, sku: "MG-003", name: "Gaming Mouse", unitCost: 45.0 },
  { id: 4, sku: "TB-004", name: "Standing Desk", unitCost: 250.0 },
];

export default function SupplierManagement() {
  const t = useTranslations("suppliers");
  const [isNewPOOpen, setIsNewPOOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [orderItems, setOrderItems] = useState([
    { productId: "", quantity: 0, unitCost: 0 },
  ]);

  const addOrderItem = () => {
    setOrderItems([...orderItems, { productId: "", quantity: 0, unitCost: 0 }]);
  };

  const removeOrderItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateOrderItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    updated[index] = { ...updated[index], [field]: value };
    setOrderItems(updated);
  };

  const totalOrderValue = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitCost,
    0
  );

  const handleCreatePO = () => {
    console.log("Creating PO:", {
      supplier: selectedSupplier,
      deliveryDate,
      items: orderItems,
      total: totalOrderValue,
    });
    setIsNewPOOpen(false);
    // Reset form
    setSelectedSupplier("");
    setDeliveryDate(undefined);
    setOrderItems([{ productId: "", quantity: 0, unitCost: 0 }]);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <Dialog open={isNewPOOpen} onOpenChange={setIsNewPOOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("newPurchaseOrder")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("createPurchaseOrder")}</DialogTitle>
              <DialogDescription>
                {t("createPurchaseOrderDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Supplier Selection */}
              <div className="grid gap-2">
                <Label htmlFor="supplier">{t("supplier")}</Label>
                <Select
                  value={selectedSupplier}
                  onValueChange={setSelectedSupplier}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectSupplier")} />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem
                        key={supplier.id}
                        value={supplier.id.toString()}
                      >
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delivery Date */}
              <div className="grid gap-2">
                <Label>{t("deliveryDate")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !deliveryDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {deliveryDate
                        ? format(deliveryDate, "PPP")
                        : t("pickDate")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={deliveryDate}
                      onSelect={setDeliveryDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t("orderItems")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOrderItem}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {t("addItem")}
                  </Button>
                </div>

                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("product")}</TableHead>
                        <TableHead className="w-24">{t("quantity")}</TableHead>
                        <TableHead className="w-32">{t("unitCost")}</TableHead>
                        <TableHead className="w-32">{t("total")}</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item, index) => {
                        const selectedProduct = products.find(
                          (p) => p.id.toString() === item.productId
                        );
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <Select
                                value={item.productId}
                                onValueChange={(value) => {
                                  const product = products.find(
                                    (p) => p.id.toString() === value
                                  );
                                  updateOrderItem(index, "productId", value);
                                  if (product) {
                                    updateOrderItem(
                                      index,
                                      "unitCost",
                                      product.unitCost
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue
                                    placeholder={t("selectProduct")}
                                  />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((product) => (
                                    <SelectItem
                                      key={product.id}
                                      value={product.id.toString()}
                                    >
                                      {product.sku} - {product.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity || ""}
                                onChange={(e) =>
                                  updateOrderItem(
                                    index,
                                    "quantity",
                                    Number.parseInt(e.target.value) || 0
                                  )
                                }
                                placeholder={t("quantityPlaceholder")}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                value={item.unitCost || ""}
                                onChange={(e) =>
                                  updateOrderItem(
                                    index,
                                    "unitCost",
                                    Number.parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder={t("unitCostPlaceholder")}
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">
                                ${(item.quantity * item.unitCost).toFixed(2)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {orderItems.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOrderItem(index)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  ×
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {t("totalOrderValue")}
                    </p>
                    <p className="text-2xl font-bold">
                      ${totalOrderValue.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewPOOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={handleCreatePO}>
                {t("createPurchaseOrder")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Suppliers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={supplier.logo} alt={supplier.name} />
                  <AvatarFallback>
                    {supplier.name.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < Math.floor(supplier.rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {supplier.rating}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.location}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {supplier.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="text-xs">
                    {t(category.replace(/\s/g, "").toLowerCase(), {
                      default: category,
                    })}
                  </Badge>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t("totalOrders")}
                  </span>
                  <span className="font-medium">{supplier.totalOrders}</span>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                {t("viewOrders")}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
