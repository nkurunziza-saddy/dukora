import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import type {
  SelectAuditLog,
  SelectBusiness,
  SelectExpense,
  SelectSchedule,
  SelectTransaction,
  SelectUser,
} from "@/lib/schema/schema-types";

type ExtendedUserPayload = SelectUser & {
  business: SelectBusiness | null;
  schedules: SelectSchedule[];
  auditLogs: SelectAuditLog[];
  expenses: SelectExpense[];
  transactions: SelectTransaction[];
};

export default async function UserSummaryCard({
  user,
}: {
  user: ExtendedUserPayload;
}) {
  const t = await getTranslations("users");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("about")}</CardTitle>
      </CardHeader>
      <CardPanel className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("email")}
          </p>
          <p>{user.email || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("role")}
          </p>
          <p>{user.role || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("role")}
          </p>
          <p>{user.role || "N/A"}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("createdAt")}
          </p>
          <p>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {t("businessName")}
          </p>
          <p>{user.business?.name || "N/A"}</p>
        </div>
      </CardPanel>
    </Card>
  );
}
