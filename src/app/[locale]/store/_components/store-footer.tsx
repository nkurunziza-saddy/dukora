import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function StoreFooter() {
  const t = await getTranslations("store");

  return (
    <footer className="border-t bg-muted/50">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded bg-primary" />
              <span className="text-lg font-bold">Dukora Store</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("footerDescription")}
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store"
                >
                  {t("home")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/products"
                >
                  {t("products")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/categories"
                >
                  {t("categories")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("support")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/help"
                >
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/contact"
                >
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/shipping"
                >
                  {t("shippingInfo")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold">{t("legal")}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/privacy"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/terms"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  className="text-muted-foreground hover:text-foreground"
                  href="/store/refunds"
                >
                  {t("refundPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2024 Dukora Store. {t("allRightsReserved")}</p>
        </div>
      </div>
    </footer>
  );
}
