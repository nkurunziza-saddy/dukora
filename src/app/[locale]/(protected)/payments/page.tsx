import { constructMetadata } from "@/lib/config/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import ColumnWrapper from "@/components/providers/column-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getInterBusinessPayments } from "@/server/actions/payment-actions";
import { ErrorCode } from "@/server/constants/errors";
import { PaymentColumn } from "@/utils/columns/payment-column";

export const metadata: Metadata = constructMetadata({
  title: "Payments",
});

export default async function PaymentsHistoryPage(
  props: PageProps<"/[locale]/payments">,
) {
  const query = await props.searchParams;
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const t = await getTranslations("payments");
  const tCommon = await getTranslations("common");

  const { data: paymentsData, error } = await getInterBusinessPayments({
    page,
    pageSize,
  });

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
        <Button variant={"link"}>
          <Link href="/payments/send">New payment</Link>
        </Button>
      </div>
      <Separator />
      <ColumnWrapper
        column={PaymentColumn}
        data={paymentsData?.payments!}
        totalCount={paymentsData?.totalCount || 0}
        page={page}
        pageSize={pageSize}
        tag="payments"
      />
    </div>
  );
}
