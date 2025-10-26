import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import { PlusIcon, UsersIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { InviteUserForm } from "@/components/forms/invite-user-form";
import ColumnWrapper from "@/components/providers/column-wrapper";
import StatCard from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { getInvitationsPaginated } from "@/server/actions/invitation-actions";
import { getUsersPaginated } from "@/server/actions/user-actions";
import { Permission } from "@/server/constants/permissions";
import { RolePermissions } from "@/server/helpers/role-permissions";
import { InvitationColumn } from "@/utils/columns/invitation-column";
import { UserColumn } from "@/utils/columns/user-column";

export const metadata: Metadata = constructMetadata({
  title: "Users",
});

export default async function Users(props: PageProps<"/[locale]/users">) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const usersData = await getUsersPaginated({ page, pageSize });
  const invitationsData = await getInvitationsPaginated({ page, pageSize });
  const t = await getTranslations("users");
  const statData = [
    {
      title: t("totalUsers"),
      value: usersData.data ? usersData.data.users.length : 0,
      icon: UsersIcon,
    },
    {
      title: t("activeUsers"),
      value: usersData.data
        ? usersData.data.users.filter((user) => user.isActive).length
        : 0,
      icon: UsersIcon,
    },
    {
      title: t("admins"),
      value: usersData.data
        ? usersData.data.users.filter((user) => user.role === "ADMIN").length
        : 0,
      icon: UsersIcon,
    },
    {
      title: t("pending"),
      value: invitationsData.data ? invitationsData.data.invitations.length : 0,
      icon: UsersIcon,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger render={<Button size={"sm"} />}>
              <PlusIcon className="size-3.5" />
              {t("inviteUserButton")}
            </DialogTrigger>
            <DialogPopup>
              <DialogHeader>
                <DialogTitle>{t("inviteUserTitle")}</DialogTitle>
                <DialogDescription>
                  {t("inviteUserDescription")}
                </DialogDescription>
              </DialogHeader>
              <InviteUserForm />
            </DialogPopup>
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
          <TabsTab value="users">{t("tabsUsers")}</TabsTab>
          <TabsTab value="invitations">{t("tabsInvitations")}</TabsTab>
          <TabsTab value="permissions">{t("tabsPermissions")}</TabsTab>
        </TabsList>
        <TabsPanel value="users">
          <Card className="bg-transparent border-0 px-0">
            <CardHeader className="px-0">
              <CardTitle>{t("tabsUsers")}</CardTitle>
              <CardDescription>{t("usersListDescription")}</CardDescription>
            </CardHeader>
            <CardPanel className="px-0">
              <ColumnWrapper
                column={UserColumn}
                data={usersData.data?.users ?? []}
                totalCount={usersData.data?.totalCount || 0}
                page={page}
                pageSize={pageSize}
                tag="users"
              />
            </CardPanel>
          </Card>
        </TabsPanel>
        <TabsPanel value="invitations">
          {invitationsData.data && (
            <Card className="bg-transparent border-0 px-0">
              <CardHeader className="px-0">
                <CardTitle>{t("tabsInvitations")}</CardTitle>
                <CardDescription>
                  {t("invitationsListDescription")}
                </CardDescription>
              </CardHeader>
              <CardPanel className="px-0">
                <ColumnWrapper
                  column={InvitationColumn}
                  data={invitationsData.data?.invitations}
                  totalCount={invitationsData.data?.totalCount || 0}
                  page={page}
                  pageSize={pageSize}
                  tag="invitations"
                />
              </CardPanel>
            </Card>
          )}
        </TabsPanel>
        <TabsPanel value="permissions">
          <Card className="bg-transparent border-0 px-0">
            <CardHeader className="px-0">
              <CardTitle>{t("tabsPermissions")}</CardTitle>
              <CardDescription>{t("permissionsDescription")}</CardDescription>
            </CardHeader>
            <CardPanel className="px-0">
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
            </CardPanel>
          </Card>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
