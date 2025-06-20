"use client"

import { useState } from "react"
import { Plus, Scan, Package2, ChevronDown, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

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
    description: "Premium wireless headphones with noise cancellation"
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
    description: "RGB mechanical keyboard with blue switches"
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
    description: "Electric height-adjustable standing desk"
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
    description: "Ergonomic office chair with lumbar support"
  },
]

const categories = ["All", "Electronics", "Furniture", "Office Supplies", "Accessories"]

export default function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "",
    barcode: "",
    batch: "",
    unitPrice: ""
  })

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter(product => product.category === selectedCategory)

  const toggleRowExpansion = (productId: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId)
    } else {
      newExpanded.add(productId)
    }
    setExpandedRows(newExpanded)
  }

  const handleAddProduct = () => {
    // In a real app, this would make an API call
    console.log("Adding product:", newProduct)
    setIsAddModalOpen(false)
    setNewProduct({
      name: "",
      sku: "",
      category: "",
      barcode: "",
      batch: "",
      unitPrice: ""
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Catalog</h1>
            <p className="text-muted-foreground">Manage your product inventory and catalog information</p>
          </div>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
              <DialogDescription>
                Enter the details for the new product. All fields are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Enter product name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                  placeholder="Enter SKU"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newProduct.category} onValueChange={(value) => setNewProduct({...newProduct, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Furniture">Furniture</SelectItem>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={newProduct.barcode}
                  onChange={(e) => setNewProduct({...newProduct, barcode: e.target.value})}
                  placeholder="Enter barcode"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batch">Batch Number</Label>
                <Input
                  id="batch"
                  value={newProduct.batch}
                  onChange={(e) => setNewProduct({...newProduct, batch: e.target.value})}
                  placeholder="Enter batch number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Unit Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newProduct.unitPrice}
                  onChange={(e) => setNewProduct({...newProduct, unitPrice: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleAddProduct}>Add Product</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filters */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Products {selectedCategory !== "All" && `- ${selectedCategory}`}
              </CardTitle>
              <CardDescription>
                Showing {filteredProducts.length} products
                {selectedCategory !== "All" && ` in ${selectedCategory} category`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead>Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <>
                      <TableRow
                        key={product.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRowExpansion(product.id)}
                      >
                        <TableCell>
                          {expandedRows.has(product.id) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.sku}</TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${product.unitPrice}</TableCell>
                        <TableCell>{product.supplier}</TableCell>
                      </TableRow>

                      {expandedRows.has(product.id) && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-muted/20">
                            <div className="p-4 space-y-3">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-2">
                                  <Scan className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-sm font-medium">Barcode</p>
                                    <p className="text-sm text-muted-foreground">{product.barcode}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Batch Number</p>
                                  <p className="text-sm text-muted-foreground">{product.batch}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Description</p>
                                  <p className="text-sm text-muted-foreground">{product.description}</p>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
