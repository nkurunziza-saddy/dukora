"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function AboutSection() {
  const t = useTranslations("landing.about");
  return (
    <section className="py-24 md:py-32 lg:py-40" id="about">
      <div className="pgtx">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-balance">
            {t("title")}
          </h2>
          <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
            <p>{t("para1")}</p>
            <p>{t("para2")}</p>
            <p>{t("para3")}</p>
          </div>
          <div className="pt-4">
            <Link
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-xs font-medium hover:bg-surface transition-all"
              href={"/auth/sign-up"}
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
