import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function StoreFooter() {
  const t = await getTranslations("store");

  return (
    <footer className="border-t border-border bg-background" id="contact">
      <div className="pgtx py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-semibold text-foreground">
                {t("brand")} Store
              </span>
            </div>
            <p className="text-xs max-w-48 text-text-secondary mb-6 leading-relaxed">
              {t("footerDescription")}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="/store"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="/store/track-order"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("support")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="/store/help"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="/store/contact"
                >
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-secondary hover:text-foreground transition"
                  href="/store/shipping"
                >
                  {t("shippingInfo")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-4">
              {t("legal")}
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  className="text-xs text-text-tertiary hover:text-text-secondary transition"
                  href="/store/privacy"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-tertiary hover:text-text-secondary transition"
                  href="/store/terms"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-xs text-text-tertiary hover:text-text-secondary transition"
                  href="/store/refunds"
                >
                  {t("refundPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-tertiary">
            &copy; 2024 Dukora Store. {t("allRightsReserved")}
          </p>
        </div>
      </div>
    </footer>
  );
}
