"use client";

import { useState } from "react";
import { UserPlus, Shield, User, Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useTranslations } from "next-intl";

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
      settings: true,
    },
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
      settings: false,
    },
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
      settings: false,
    },
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
      settings: false,
    },
  },
];

const rolePermissions = {
  Admin: {
    description: "Full access to all features and settings",
    permissions: [
      "Inventory Management",
      "Order Processing",
      "Analytics & Reports",
      "User Management",
      "System Settings",
    ],
  },
  Manager: {
    description: "Access to inventory, orders, and reports",
    permissions: [
      "Inventory Management",
      "Order Processing",
      "Analytics & Reports",
    ],
  },
  Staff: {
    description: "Basic inventory access only",
    permissions: ["Inventory Management (Read Only)"],
  },
};

export default function UsersPermissions() {
  const t = useTranslations("users");
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "",
  });

  const filteredUsers =
    selectedRole === "All"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Manager":
        return "default";
      case "Staff":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  const handleInviteUser = () => {
    console.log("Inviting user:", newUser);
    setIsInviteModalOpen(false);
    setNewUser({ name: "", email: "", role: "" });
  };

  const toggleUserPermission = (userId: number, permission: string) => {
    // In a real app, this would make an API call
    console.log(`Toggling ${permission} for user ${userId}`);
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

        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("inviteUser")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("inviteNewUser")}</DialogTitle>
              <DialogDescription>
                {t("inviteNewUserDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t("fullName")}</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  placeholder={t("enterFullName")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("emailAddress")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  placeholder={t("enterEmailAddress")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">{t("role")}</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) =>
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Admin">{t("admin")}</SelectItem>
                    <SelectItem value="Manager">{t("manager")}</SelectItem>
                    <SelectItem value="Staff">{t("staff")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleInviteUser}>
                {t("sendInvitation")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Role-based Tabs */}
      <Tabs value={selectedRole} onValueChange={setSelectedRole}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="Admin">{t("admin")}</TabsTrigger>
          <TabsTrigger value="Manager">{t("manager")}</TabsTrigger>
          <TabsTrigger value="Staff">{t("staff")}</TabsTrigger>
          <TabsTrigger value="All">{t("allUsers")}</TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          {/* Role Permissions Overview */}
          {selectedRole !== "All" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  {t("rolePermissions", { role: selectedRole })}
                </CardTitle>
                <CardDescription>
                  {
                    rolePermissions[
                      selectedRole as keyof typeof rolePermissions
                    ]?.description
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rolePermissions[
                    selectedRole as keyof typeof rolePermissions
                  ]?.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">
                        {t(permission.replace(/\s|\(|\)/g, "").toLowerCase(), {
                          default: permission,
                        })}
                      </span>
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
                {selectedRole === "All"
                  ? t("allUsers")
                  : t("roleUsers", { role: selectedRole })}
              </CardTitle>
              <CardDescription>
                {t("showingUsers", { count: filteredUsers.length })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("user")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("lastLogin")}</TableHead>
                    <TableHead>{t("permissions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                              {user.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleColor(user.role)}>
                          {t(user.role.toLowerCase(), { default: user.role })}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(user.status)}>
                          {t(user.status.toLowerCase(), {
                            default:
                              user.status.charAt(0).toUpperCase() +
                              user.status.slice(1),
                          })}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{t("inventory")}</span>
                            <Switch
                              checked={user.permissions.inventory}
                              onCheckedChange={() =>
                                toggleUserPermission(user.id, "inventory")
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{t("orders")}</span>
                            <Switch
                              checked={user.permissions.orders}
                              onCheckedChange={() =>
                                toggleUserPermission(user.id, "orders")
                              }
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{t("reports")}</span>
                            <Switch
                              checked={user.permissions.reports}
                              onCheckedChange={() =>
                                toggleUserPermission(user.id, "reports")
                              }
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
                <CardTitle className="text-sm font-medium">
                  {t("totalUsers")}
                </CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  {t("activeTeamMembers")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("activeUsers")}
                </CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((user) => user.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("currentlyActive")}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t("adminUsers")}
                </CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter((user) => user.role === "Admin").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("fullAccessUsers")}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  );
}
