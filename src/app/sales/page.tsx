"use client"

import { useState } from "react"
import { Download, TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Mock data for sales chart
const salesData = [
  { date: "2024-01-01", revenue: 12500 },
  { date: "2024-01-02", revenue: 15200 },
  { date: "2024-01-03", revenue: 9800 },
  { date: "2024-01-04", revenue: 18900 },
  { date: "2024-01-05", revenue: 22100 },
  { date: "2024-01-06", revenue: 19500 },
  { date: "2024-01-07", revenue: 25800 },
]

// Mock orders data
const recentOrders = [
  {
    id: "ORD-001",
    customer: "Tech Solutions Inc",
    total: 2499.97,
    items: 15,
    status: "completed",
    date: "2024-01-20",
    paymentMethod: "Credit Card"
  },
  {
    id: "ORD-002",
    customer: "Creative Agency",
    total: 1850.50,
    items: 8,
    status: "processing",
    date: "2024-01-20",
    paymentMethod: "Bank Transfer"
  },
  {
    id: "ORD-003",
    customer: "StartupHub",
    total: 750.25,
    items: 3,
    status: "shipped",
    date: "2024-01-19",
    paymentMethod: "PayPal"
  },
  {
    id: "ORD-004",
    customer: "Enterprise Corp",
    total: 5200.00,
    items: 25,
    status: "pending",
    date: "2024-01-19",
    paymentMethod: "Credit Card"
  },
  {
    id: "ORD-005",
    customer: "Design Studio",
    total: 3100.75,
    items: 12,
    status: "completed",
    date: "2024-01-18",
    paymentMethod: "Bank Transfer"
  }
]

const salesStats = {
  todayRevenue: 25800,
  totalOrders: 156,
  avgOrderValue: 1650,
  conversionRate: 3.2
}

export default function SalesTracking() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "processing":
        return "secondary"
      case "shipped":
        return "outline"
      case "pending":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const exportToCSV = () => {
    const csvContent = [
      "Order ID,Customer,Total,Items,Status,Date,Payment Method",
      ...recentOrders.map(order =>
        `${order.id},${order.customer},${order.total},${order.items},${order.status},${order.date},${order.paymentMethod}`
      )
    ].join("\\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "sales_report.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales Tracking</h1>
            <p className="text-muted-foreground">Monitor your sales performance and revenue trends</p>
          </div>
        </div>

        <Button onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Sales Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.todayRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">+8% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${salesStats.avgOrderValue}</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">+0.5% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daily Sales Revenue</CardTitle>
              <CardDescription>Revenue trends over the last 7 days</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedPeriod === "7d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("7d")}
              >
                7 Days
              </Button>
              <Button
                variant={selectedPeriod === "30d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("30d")}
              >
                30 Days
              </Button>
              <Button
                variant={selectedPeriod === "90d" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod("90d")}
              >
                90 Days
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Simple line chart representation */}
          <div className="h-80 flex items-end justify-between gap-2 p-4 bg-muted/20 rounded-lg">
            {salesData.map((data, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div
                  className="w-full bg-primary rounded-t-sm transition-all hover:bg-primary/80"
                  style={{ height: `${(data.revenue / 30000) * 100}%`, minHeight: "20px" }}
                />
                <span className="text-xs text-muted-foreground">
                  {new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Total Revenue: ${salesData.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{order.items}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(order.status)}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {order.paymentMethod}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
