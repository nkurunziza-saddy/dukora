import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInterBusinessPayments } from "@/server/actions/payment-actions";
import { ErrorCode } from "@/server/constants/errors";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { PaymentColumn } from "@/utils/columns/payment-column";

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
        <div className="text-center text-destructive/80">
          {error === ErrorCode.UNAUTHORIZED
            ? tCommon("unauthorized")
            : tCommon("errorLoading")}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <div></div>
        <Button asChild variant={"link"}>
          <Link href="/payments/send">New payment</Link>
        </Button>
      </div>
      <Separator />
      <ColumnWrapper column={PaymentColumn} data={payments!} tag="payments" />
    </div>
  );
}
