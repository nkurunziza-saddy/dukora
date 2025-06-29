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

export default async function users() {
  const users = await getUsers();
  const invitations = await getInvitations();
  if (!users.data) return null;
  const t = await getTranslations("users");
  const statData = [
    {
      title: t("stat.totalUsers"),
      value: users.data ? users.data.length : 0,
      icon: Users,
    },
    {
      title: t("stat.activeUsers"),
      value: users.data ? users.data.filter((user) => user.isActive).length : 0,
      icon: Users,
    },
    {
      title: t("stat.admins"),
      value: users.data
        ? users.data.filter((user) => user.role === "ADMIN").length
        : 0,
      icon: Users,
    },
    {
      title: t("stat.pending"),
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
                {t("inviteUser.button")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("inviteUser.title")}</DialogTitle>
                <DialogDescription>
                  {t("inviteUser.description")}
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
          <TabsTrigger value="users">{t("tabs.users")}</TabsTrigger>
          <TabsTrigger value="invitations">{t("tabs.invitations")}</TabsTrigger>
          <TabsTrigger value="permissions">{t("tabs.permissions")}</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>{t("tabs.users")}</CardTitle>
              <CardDescription>{t("users.listDescription")}</CardDescription>
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
                <CardTitle>{t("tabs.invitations")}</CardTitle>
                <CardDescription>
                  {t("invitations.listDescription")}
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
      </Tabs>
    </div>
  );
}
