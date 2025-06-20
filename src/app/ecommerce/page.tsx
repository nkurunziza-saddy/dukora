"use client"

import { useState } from "react"
import { Link, Store, Globe, CheckCircle, AlertCircle, Clock, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Mock data
const connectedStores = [
  {
    id: 1,
    name: "Main Store",
    domain: "store.example.com",
    platform: "Shopify",
    status: "connected",
    lastSync: new Date("2024-01-20T10:30:00"),
    products: 1247,
    orders: 156,
    autoSync: true
  },
  {
    id: 2,
    name: "Amazon Store",
    domain: "amazon.com/seller/123",
    platform: "Amazon",
    status: "syncing",
    lastSync: new Date("2024-01-20T09:45:00"),
    products: 890,
    orders: 89,
    autoSync: true
  },
  {
    id: 3,
    name: "eBay Store",
    domain: "ebay.com/store/456",
    platform: "eBay",
    status: "error",
    lastSync: new Date("2024-01-19T16:20:00"),
    products: 234,
    orders: 23,
    autoSync: false
  }
]

const syncActivities = [
  {
    id: 1,
    store: "Main Store",
    action: "Product sync completed",
    status: "success",
    timestamp: new Date("2024-01-20T10:30:00"),
    details: "1,247 products synchronized"
  },
  {
    id: 2,
    store: "Amazon Store",
    action: "Order sync in progress",
    status: "syncing",
    timestamp: new Date("2024-01-20T10:25:00"),
    details: "Processing 23 new orders"
  },
  {
    id: 3,
    store: "eBay Store",
    action: "Connection failed",
    status: "error",
    timestamp: new Date("2024-01-20T09:15:00"),
    details: "Authentication expired"
  },
  {
    id: 4,
    store: "Main Store",
    action: "Inventory updated",
    status: "success",
    timestamp: new Date("2024-01-20T08:45:00"),
    details: "Stock levels synchronized"
  }
]

const syncStats = {
  totalStores: 3,
  activeStores: 2,
  totalProducts: 2371,
  dailySyncs: 24,
  lastFullSync: new Date("2024-01-20T06:00:00")
}

export default function EcommerceSync() {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const [newStore, setNewStore] = useState({
    name: "",
    domain: "",
    platform: ""
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "default"
      case "syncing":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4" />
      case "syncing":
        return <Clock className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const handleConnectStore = () => {
    console.log("Connecting store:", newStore)
    setIsConnectModalOpen(false)
    setNewStore({ name: "", domain: "", platform: "" })
  }

  const triggerSync = (storeId: number) => {
    console.log(`Triggering sync for store ${storeId}`)
    // In a real app, this would trigger an API call
  }

  const toggleAutoSync = (storeId: number) => {
    console.log(`Toggling auto-sync for store ${storeId}`)
    // In a real app, this would update the store settings
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">E-commerce Sync</h1>
            <p className="text-muted-foreground">Connect and synchronize your online stores with inventory management</p>
          </div>
        </div>

        <Dialog open={isConnectModalOpen} onOpenChange={setIsConnectModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Link className="h-4 w-4 mr-2" />
              Connect Store
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect New Store</DialogTitle>
              <DialogDescription>
                Add a new e-commerce store to synchronize with your inventory.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  value={newStore.name}
                  onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                  placeholder="Enter store name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="domain">Store Domain/URL</Label>
                <Input
                  id="domain"
                  value={newStore.domain}
                  onChange={(e) => setNewStore({...newStore, domain: e.target.value})}
                  placeholder="store.example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="platform">Platform</Label>
                <Select value={newStore.platform} onValueChange={(value) => setNewStore({...newStore, platform: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="woocommerce">WooCommerce</SelectItem>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                    <SelectItem value="magento">Magento</SelectItem>
                    <SelectItem value="bigcommerce">BigCommerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleConnectStore}>Connect Store</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sync Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stores</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.totalStores}</div>
            <p className="text-xs text-muted-foreground">Connected platforms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Stores</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.activeStores}</div>
            <p className="text-xs text-muted-foreground">Currently syncing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all stores</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Syncs</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncStats.dailySyncs}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Full Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {syncStats.lastFullSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground">
              {syncStats.lastFullSync.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Connected Stores */}
        <Card>
          <CardHeader>
            <CardTitle>Connected Stores</CardTitle>
            <CardDescription>Manage your e-commerce store connections</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectedStores.map((store) => (
              <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getStatusIcon(store.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{store.name}</p>
                      <Badge variant={getStatusColor(store.status)} className="text-xs">
                        {store.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{store.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      Platform: {store.platform} • {store.products} products • {store.orders} orders
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last sync: {store.lastSync.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerSync(store.id)}
                    disabled={store.status === "syncing"}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sync
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">Auto</span>
                    <Switch
                      checked={store.autoSync}
                      onCheckedChange={() => toggleAutoSync(store.id)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Sync Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sync Activity</CardTitle>
            <CardDescription>Latest synchronization events and status updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {syncActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="mt-1">
                    {getStatusIcon(activity.status)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <Badge variant={getStatusColor(activity.status)} className="text-xs">
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.store}</p>
                    <p className="text-xs text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sync Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Progress</CardTitle>
          <CardDescription>Current synchronization status across all stores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Amazon Store - Product Sync</span>
                <span>75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Main Store - Inventory Update</span>
                <span>100%</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Sync Health</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
