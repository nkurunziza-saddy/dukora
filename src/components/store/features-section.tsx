import { getTranslations } from "next-intl/server";

export async function FeaturesSection() {
  const t = await getTranslations("store");
  return (
    <section className="py-12 bg-muted/50 rounded">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{t("freeShipping")}</h3>
          <p className="text-muted-foreground">
            {t("freeShippingDescription")}
          </p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{t("easyReturns")}</h3>
          <p className="text-muted-foreground">{t("easyReturnsDescription")}</p>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">{t("securePayment")}</h3>
          <p className="text-muted-foreground">
            {t("securePaymentDescription")}
          </p>
        </div>
      </div>
    </section>
  );
}
