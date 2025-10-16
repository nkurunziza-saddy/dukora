import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Tabs, TabsPanel, TabsList, TabsTab } from "@/components/ui/tabs";
import { getUserById } from "@/server/actions/user-actions";
import UserSummaryCard from "./_components/user-summary-card";
import UserSchedules from "./_components/user-schedules";
import UserAuditLogs from "./_components/user-audit-logs";
import UserExpenses from "./_components/user-expenses";
import UserTransactions from "./_components/user-transactions";
import { db } from "@/lib/db";

export async function generateStaticParams() {
  const res = await db.query.usersTable.findMany();
  if (!res) return Array.from({ length: 2 }).map((i) => ({ id: i }));
  return res.map((unit) => ({
    id: unit.id,
  }));
}

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
          <TabsTab value="schedules">{t("schedules")}</TabsTab>
          <TabsTab value="auditLogs">{t("auditLogs")}</TabsTab>
          <TabsTab value="expenses">{t("expenses")}</TabsTab>
          <TabsTab value="transactions">{t("transactions")}</TabsTab>
        </TabsList>
        <TabsPanel value="schedules">
          <UserSchedules schedules={user.schedules} />
        </TabsPanel>
        <TabsPanel value="auditLogs">
          <UserAuditLogs auditLogs={user.auditLogs} />
        </TabsPanel>
        <TabsPanel value="expenses">
          <UserExpenses expenses={user.expenses} />
        </TabsPanel>
        <TabsPanel value="transactions">
          <UserTransactions transactions={user.transactions} />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
