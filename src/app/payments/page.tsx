"use client"

import { useState } from "react"
import { Download, CreditCard, Smartphone, Wifi, FileText, Receipt } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Mock data
const paymentMethods = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept credit cards and online payments",
    icon: CreditCard,
    enabled: true,
    fees: "2.9% + 30¢"
  },
  {
    id: "mtn-momo",
    name: "MTN Mobile Money",
    description: "Mobile money payments for MTN subscribers",
    icon: Smartphone,
    enabled: true,
    fees: "1.5%"
  },
  {
    id: "airtel-money",
    name: "Airtel Money",
    description: "Mobile money payments for Airtel subscribers",
    icon: Wifi,
    enabled: false,
    fees: "1.8%"
  }
]

const transactions = [
  {
    id: "TXN-001",
    invoice: "INV-2024-001",
    customer: "Tech Solutions Inc",
    amount: 2499.97,
    method: "Stripe",
    status: "completed",
    date: "2024-01-20T10:30:00",
    reference: "pi_1234567890"
  },
  {
    id: "TXN-002",
    invoice: "INV-2024-002",
    customer: "Creative Agency",
    amount: 1850.50,
    method: "MTN MoMo",
    status: "completed",
    date: "2024-01-20T09:15:00",
    reference: "mtn_9876543210"
  },
  {
    id: "TXN-003",
    invoice: "INV-2024-003",
    customer: "StartupHub",
    amount: 750.25,
    method: "Stripe",
    status: "pending",
    date: "2024-01-19T16:45:00",
    reference: "pi_0987654321"
  },
  {
    id: "TXN-004",
    invoice: "INV-2024-004",
    customer: "Enterprise Corp",
    amount: 5200.00,
    method: "Bank Transfer",
    status: "failed",
    date: "2024-01-19T14:20:00",
    reference: "bt_1357924680"
  }
]

const paymentStats = {
  totalRevenue: 48250.72,
  successRate: 94.5,
  avgTransactionValue: 1850.25,
  pendingAmount: 2100.50
}

export default function PaymentsInvoices() {
  const [enabledMethods, setEnabledMethods] = useState(
    Object.fromEntries(paymentMethods.map(method => [method.id, method.enabled]))
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "stripe":
        return <CreditCard className="h-4 w-4" />
      case "mtn momo":
        return <Smartphone className="h-4 w-4" />
      case "airtel money":
        return <Wifi className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const togglePaymentMethod = (methodId: string) => {
    setEnabledMethods(prev => ({
      ...prev,
      [methodId]: !prev[methodId]
    }))
  }

  const generateInvoice = (transactionId: string) => {
    // Mock invoice generation
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction) return

    const invoiceContent = `
INVOICE ${transaction.invoice}

Customer: ${transaction.customer}
Amount: $${transaction.amount}
Payment Method: ${transaction.method}
Date: ${new Date(transaction.date).toLocaleDateString()}
Reference: ${transaction.reference}

Thank you for your business!
    `.trim()

    const blob = new Blob([invoiceContent], { type: "text/plain;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `invoice-${transaction.invoice}.txt`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments & Invoices</h1>
          <p className="text-muted-foreground">Manage payment methods and transaction records</p>
        </div>
      </div>

      {/* Payment Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentStats.successRate}%</div>
            <p className="text-xs text-muted-foreground">Payment success rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentStats.avgTransactionValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Average value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${paymentStats.pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Configure available payment options</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <method.icon className="h-5 w-5 mt-1 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">{method.name}</p>
                    <p className="text-sm text-muted-foreground">{method.description}</p>
                    <Badge variant="outline" className="text-xs">
                      Fee: {method.fees}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={enabledMethods[method.id]}
                  onCheckedChange={() => togglePaymentMethod(method.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Latest payment transactions and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p>{transaction.id}</p>
                          <p className="text-xs text-muted-foreground">{transaction.invoice}</p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.customer}</TableCell>
                      <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMethodIcon(transaction.method)}
                          <span className="text-sm">{transaction.method}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(transaction.status)}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateInvoice(transaction.id)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
