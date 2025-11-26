import { PlusIcon, UsersIcon } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { InviteUserForm } from "@/components/forms/invite-user-form";
import ColumnWrapper from "@/components/providers/column-wrapper";
import StatCard from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { CardPanel } from "@/components/ui/card";
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
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";
import { getInvitationsPaginated } from "@/server/actions/invitation-actions";
import { getUsersPaginated } from "@/server/actions/users/users-actions";
import { PERMISSION } from "@/server/constants/permissions";
import { RolePermissions } from "@/server/helpers/role-permissions";
import { InvitationColumn } from "@/utils/columns/invitation-column";
import { UserColumn } from "@/utils/columns/user-column";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "users",
  });
}

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
            icon={item.icon}
            key={`${item.title}-`}
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
          <div>
            <div className="en_head">
              <h1>{t("tabsUsers")}</h1>
              <p>{t("usersListDescription")}</p>
            </div>
            <div className="">
              <ColumnWrapper
                column={UserColumn}
                data={usersData.data?.users ?? []}
                page={page}
                pageSize={pageSize}
                tag="users"
                totalCount={usersData.data?.totalCount || 0}
              />
            </div>
          </div>
        </TabsPanel>
        <TabsPanel value="invitations">
          {invitationsData.data && (
            <div className="">
              <div className="en_head">
                <h1>{t("tabsInvitations")}</h1>
                <p>{t("invitationsListDescription")}</p>
              </div>
              <CardPanel className="px-0">
                <ColumnWrapper
                  column={InvitationColumn}
                  data={invitationsData.data?.invitations}
                  page={page}
                  pageSize={pageSize}
                  tag="invitations"
                  totalCount={invitationsData.data?.totalCount || 0}
                />
              </CardPanel>
            </div>
          )}
        </TabsPanel>
        <TabsPanel value="permissions">
          <div className="">
            <div className="en_head">
              <h1>{t("tabsPermissions")}</h1>
              <p>{t("permissionsDescription")}</p>
            </div>
            <div className="">
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
                  {Object.values(PERMISSION).map((perm) => (
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
          </div>
        </TabsPanel>
      </Tabs>
    </div>
  );
}
