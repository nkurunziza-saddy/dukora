import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserById } from "@/server/actions/user-actions";
import UserSummaryCard from "./_components/user-summary-card";
import UserSchedules from "./_components/user-schedules";
import UserAuditLogs from "./_components/user-audit-logs";
import UserExpenses from "./_components/user-expenses";
import UserTransactions from "./_components/user-transactions";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: user, error } = await getUserById((await params).id);

  if (error || !user) {
    notFound();
  }

  const t = await getTranslations("users");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{user.name}</h1>
      <UserSummaryCard user={user} />
      <Tabs defaultValue="schedules">
        <TabsList>
          <TabsTrigger value="schedules">{t("schedules")}</TabsTrigger>
          <TabsTrigger value="auditLogs">{t("auditLogs")}</TabsTrigger>
          <TabsTrigger value="expenses">{t("expenses")}</TabsTrigger>
          <TabsTrigger value="transactions">{t("transactions")}</TabsTrigger>
        </TabsList>
        <TabsContent value="schedules">
          <UserSchedules schedules={user.schedules} />
        </TabsContent>
        <TabsContent value="auditLogs">
          <UserAuditLogs auditLogs={user.auditLogs} />
        </TabsContent>
        <TabsContent value="expenses">
          <UserExpenses expenses={user.expenses} />
        </TabsContent>
        <TabsContent value="transactions">
          <UserTransactions transactions={user.transactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
