import { getTranslations } from "next-intl/server";
import InitiatePaymentForm from "@/components/forms/initiate-payment-form";
import { Separator } from "@/components/ui/separator";

export default async function SendPaymentPage() {
  const t = await getTranslations("payments");

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("initiateNewPayment")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("initiateNewPaymentDescription")}
        </p>
      </div>
      <Separator />
      <InitiatePaymentForm />
    </div>
  );
}
