"use client"

import { useState } from "react"
import { Plus, UserPlus, Shield, User, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"

// Mock data
const users = [
  {
    id: 1,
    name: "John Smith",
    email: "john@company.com",
    role: "Admin",
    avatar: "https://via.placeholder.com/40x40?text=JS",
    status: "active",
    lastLogin: "2024-01-20",
    permissions: {
      inventory: true,
      orders: true,
      reports: true,
      users: true,
      settings: true
    }
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@company.com",
    role: "Manager",
    avatar: "https://via.placeholder.com/40x40?text=SJ",
    status: "active",
    lastLogin: "2024-01-20",
    permissions: {
      inventory: true,
      orders: true,
      reports: true,
      users: false,
      settings: false
    }
  },
  {
    id: 3,
    name: "Mike Chen",
    email: "mike@company.com",
    role: "Staff",
    avatar: "https://via.placeholder.com/40x40?text=MC",
    status: "active",
    lastLogin: "2024-01-19",
    permissions: {
      inventory: true,
      orders: false,
      reports: false,
      users: false,
      settings: false
    }
  },
  {
    id: 4,
    name: "Lisa Wong",
    email: "lisa@company.com",
    role: "Manager",
    avatar: "https://via.placeholder.com/40x40?text=LW",
    status: "inactive",
    lastLogin: "2024-01-15",
    permissions: {
      inventory: true,
      orders: true,
      reports: true,
      users: false,
      settings: false
    }
  }
]

const rolePermissions = {
  Admin: {
    description: "Full access to all features and settings",
    permissions: ["Inventory Management", "Order Processing", "Analytics & Reports", "User Management", "System Settings"]
  },
  Manager: {
    description: "Access to inventory, orders, and reports",
    permissions: ["Inventory Management", "Order Processing", "Analytics & Reports"]
  },
  Staff: {
    description: "Basic inventory access only",
    permissions: ["Inventory Management (Read Only)"]
  }
}

export default function UsersPermissions() {
  const [selectedRole, setSelectedRole] = useState("Admin")
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: ""
  })

  const filteredUsers = selectedRole === "All"
    ? users
    : users.filter(user => user.role === selectedRole)

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive"
      case "Manager":
        return "default"
      case "Staff":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary"
  }

  const handleInviteUser = () => {
    console.log("Inviting user:", newUser)
    setIsInviteModalOpen(false)
    setNewUser({ name: "", email: "", role: "" })
  }

  const toggleUserPermission = (userId: number, permission: string) => {
    // In a real app, this would make an API call
    console.log(`Toggling ${permission} for user ${userId}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users & Permissions</h1>
            <p className="text-muted-foreground">Manage team access and permissions</p>
          </div>
        </div>

        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation to join your team.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleInviteUser}>Send Invitation</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role-based Tabs */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="Admin">Admin</TabsTrigger>
          <TabsTrigger value="Manager">Manager</TabsTrigger>
          <TabsTrigger value="Staff">Staff</TabsTrigger>
          <TabsTrigger value="All">All Users</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          {/* Role Permissions Overview */}
          {selectedRole !== "All" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {selectedRole} Role Permissions
                </CardTitle>
                <CardDescription>{rolePermissions[selectedRole as keyof typeof rolePermissions]?.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rolePermissions[selectedRole as keyof typeof rolePermissions]?.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {selectedRole === "All" ? "All Users" : `${selectedRole} Users`}
              </CardTitle>
              <CardDescription>
                Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Permissions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.status)}>
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Inventory</span>
                            <Switch
                              checked={user.permissions.inventory}
                              onCheckedChange={() => toggleUserPermission(user.id, "inventory")}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Orders</span>
                            <Switch
                              checked={user.permissions.orders}
                              onCheckedChange={() => toggleUserPermission(user.id, "orders")}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">Reports</span>
                            <Switch
                              checked={user.permissions.reports}
                              onCheckedChange={() => toggleUserPermission(user.id, "reports")}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">Active team members</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(user => user.role === "Admin").length}
                </div>
                <p className="text-xs text-muted-foreground">Full access users</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
