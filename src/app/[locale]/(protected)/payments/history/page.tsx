import { InterBusinessPaymentsDataTable } from "@/components/table/inter-business-payments-data-table";
import { Separator } from "@/components/ui/separator";
import { getInterBusinessPayments } from "@/server/actions/inter-business-payments-actions";
import { ErrorCode } from "@/server/constants/errors";
import { getTranslations } from "next-intl/server";

export default async function PaymentsHistoryPage() {
  const t = await getTranslations("payments");
  const tCommon = await getTranslations("common");

  const { data: payments, error } = await getInterBusinessPayments({});

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">{t("paymentHistory")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("paymentHistoryDescription")}
          </p>
        </div>
        <Separator />
        <div className="text-center text-red-500">
          {error === ErrorCode.UNAUTHORIZED
            ? tCommon("unauthorized")
            : tCommon("errorLoading")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("paymentHistory")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("paymentHistoryDescription")}
        </p>
      </div>
      <Separator />
      <InterBusinessPaymentsDataTable data={payments || []} />
    </div>
  );
}
