import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InviteUserForm } from "@/components/forms/invite-user-form";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { UserColumn } from "@/utils/columns/user-column";
import { getUsers } from "@/server/actions/user-actions";
import { getInvitations } from "@/server/actions/invitation-actions";
import { InvitationColumn } from "@/utils/columns/invitation-column";
import StatCard from "@/components/shared/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTranslations } from "next-intl/server";
import { RolePermissions } from "@/server/helpers/role-permissions";
import { Permission } from "@/server/constants/permissions";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

export default async function users() {
  const users = await getUsers({});
  const invitations = await getInvitations({});
  if (!users.data) return null;
  const t = await getTranslations("users");
  const statData = [
    {
      title: t("totalUsers"),
      value: users.data ? users.data.length : 0,
      icon: Users,
    },
    {
      title: t("activeUsers"),
      value: users.data ? users.data.filter((user) => user.isActive).length : 0,
      icon: Users,
    },
    {
      title: t("admins"),
      value: users.data
        ? users.data.filter((user) => user.role === "ADMIN").length
        : 0,
      icon: Users,
    },
    {
      title: t("pending"),
      value: invitations.data ? invitations.data.length : 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("inviteUserButton")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inviteUserTitle")}</DialogTitle>
                <DialogDescription>
                  {t("inviteUserDescription")}
                </DialogDescription>
              </DialogHeader>
              <InviteUserForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statData.map((item) => (
          <StatCard
            key={`${item.title}-`}
            icon={item.icon}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">{t("tabsUsers")}</TabsTrigger>
          <TabsTrigger value="invitations">{t("tabsInvitations")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("tabsPermissions")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabsUsers")}</CardTitle>
              <CardDescription>{t("usersListDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ColumnWrapper
                column={UserColumn}
                data={users.data ?? []}
                tag="users"
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="invitations">
          {invitations.data && (
            <Card>
              <CardHeader>
                <CardTitle>{t("tabsInvitations")}</CardTitle>
                <CardDescription>
                  {t("invitationsListDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColumnWrapper
                  column={InvitationColumn}
                  data={invitations.data}
                  tag="invitations"
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabsPermissions")}</CardTitle>
              <CardDescription>{t("permissionsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Table className="min-w-full text-sm border">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-2 border">
                        {t("permissionsPermission")}
                      </TableHead>
                      <TableHead className="px-4 py-2 border">Owner</TableHead>
                      <TableHead className="px-4 py-2 border">Admin</TableHead>
                      <TableHead className="px-4 py-2 border">Member</TableHead>
                      <TableHead className="px-4 py-2 border">
                        View Only
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(Permission).map((perm) => (
                      <TableRow key={perm}>
                        <TableCell className="px-4 py-2 border font-mono">
                          {perm}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center">
                          {RolePermissions.OWNER.includes(perm) ? "✔️" : ""}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center">
                          {RolePermissions.ADMIN.includes(perm) ? "✔️" : ""}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center">
                          {RolePermissions.MEMBER.includes(perm) ? "✔️" : ""}
                        </TableCell>
                        <TableCell className="px-4 py-2 border text-center">
                          {RolePermissions.VIEW_ONLY.includes(perm) ? "✔️" : ""}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
