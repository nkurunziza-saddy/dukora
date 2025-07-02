// "use client"

// import { useState, useCallback, useMemo } from "react"
// import { Command, CommandInput, CommandEmpty } from "@/components/ui/command"
// import { VirtualizedProductList } from "./virtualized-product-list"
// import { VirtualizedWarehouseList } from "./virtualized-warehouse-list"
// import type { SelectProduct } from "@/lib/schema/schema-types"

// interface WarehouseItem {
//   id: string
//   quantity: number
//   warehouse: {
//     name: string
//   }
// }

// interface VirtualizedCommandListProps {
//   type: "products" | "warehouses"
//   products?: SelectProduct[]
//   warehouseItems?: WarehouseItem[]
//   selectedId: string
//   onSelect: (id: string) => void
//   searchPlaceholder: string
//   emptyMessage: string
//   height?: number
// }

// export function VirtualizedCommandList({
//   type,
//   products,
//   warehouseItems,
//   selectedId,
//   onSelect,
//   searchPlaceholder,
//   emptyMessage,
//   height = 200,
// }: VirtualizedCommandListProps) {
//   const [searchQuery, setSearchQuery] = useState("")

//   const handleSearch = useCallback((value: string) => {
//     setSearchQuery(value)
//   }, [])

//   const handleSelect = useCallback(
//     (id: string) => {
//       onSelect(id)
//       setSearchQuery("") // Clear search after selection
//     },
//     [onSelect],
//   )

//   const isEmpty = useMemo(() => {
//     if (type === "products") {
//       return !products || products.length === 0
//     }
//     return !warehouseItems || warehouseItems.length === 0
//   }, [type, products, warehouseItems])

//   return (
//     <Command shouldFilter={false}>
//       <CommandInput placeholder={searchPlaceholder} value={searchQuery} onValueChange={handleSearch} />
//       {isEmpty ? (
//         <CommandEmpty>{emptyMessage}</CommandEmpty>
//       ) : (
//         <div className="max-h-[300px] overflow-hidden">
//           {type === "products" && products ? (
//             <VirtualizedProductList
//               products={products}
//               selectedProductId={selectedId}
//               onSelect={handleSelect}
//               searchQuery={searchQuery}
//               height={height}
//             />
//           ) : warehouseItems ? (
//             <VirtualizedWarehouseList
//               warehouseItems={warehouseItems}
//               selectedWarehouseItemId={selectedId}
//               onSelect={handleSelect}
//               searchQuery={searchQuery}
//               height={height}
//             />
//           ) : null}
//         </div>
//       )}
//     </Command>
//   )
// }

// "use client"

// import type React from "react"

// import { FixedSizeList as List } from "react-window"
// import { CheckIcon } from "lucide-react"
// import { CommandItem } from "@/components/ui/command"
// import { cn } from "@/lib/utils"
// import type { SelectProduct } from "@/lib/schema/schema-types"
// import { forwardRef, useMemo } from "react"

// interface VirtualizedProductListProps {
//   products: SelectProduct[]
//   selectedProductId: string
//   onSelect: (productId: string) => void
//   searchQuery: string
//   height?: number
//   itemHeight?: number
// }

// interface ProductItemProps {
//   index: number
//   style: React.CSSProperties
//   data: {
//     products: SelectProduct[]
//     selectedProductId: string
//     onSelect: (productId: string) => void
//   }
// }

// const ProductItem = ({ index, style, data }: ProductItemProps) => {
//   const product = data.products[index]

//   return (
//     <div style={style}>
//       <CommandItem key={product.id} onSelect={() => data.onSelect(product.id)} className="cursor-pointer">
//         <div className="flex items-center justify-between w-full">
//           <div className="flex flex-col">
//             <span className="font-medium">{product.name}</span>
//             <span className="text-sm text-muted-foreground">{product.sku}</span>
//           </div>
//           <CheckIcon className={cn("h-4 w-4", product.id === data.selectedProductId ? "opacity-100" : "opacity-0")} />
//         </div>
//       </CommandItem>
//     </div>
//   )
// }

// export const VirtualizedProductList = forwardRef<HTMLDivElement, VirtualizedProductListProps>(
//   ({ products, selectedProductId, onSelect, searchQuery, height = 200, itemHeight = 60 }, ref) => {
//     const filteredProducts = useMemo(() => {
//       if (!searchQuery) return products

//       const query = searchQuery.toLowerCase()
//       return products.filter(
//         (product) => product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query),
//       )
//     }, [products, searchQuery])

//     const itemData = useMemo(
//       () => ({
//         products: filteredProducts,
//         selectedProductId,
//         onSelect,
//       }),
//       [filteredProducts, selectedProductId, onSelect],
//     )

//     if (filteredProducts.length === 0) {
//       return <div className="py-6 text-center text-sm text-muted-foreground">No products found</div>
//     }

//     return (
//       <div ref={ref}>
//         <List
//           height={Math.min(height, filteredProducts.length * itemHeight)}
//           itemCount={filteredProducts.length}
//           itemSize={itemHeight}
//           itemData={itemData}
//           overscanCount={5}
//         >
//           {ProductItem}
//         </List>
//       </div>
//     )
//   },
// )

// VirtualizedProductList.displayName = "VirtualizedProductList"
