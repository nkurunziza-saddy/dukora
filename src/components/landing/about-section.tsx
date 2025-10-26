"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function AboutSection() {
  const t = useTranslations("landing.about");
  return (
    <section id="about" className="py-24 md:py-32 lg:py-40">
      <div className="max-w-4xl mx-auto px-4 lg:px-12">
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
              href={"/auth/sign-up"}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border text-foreground text-xs font-medium hover:bg-surface transition-all"
            >
              {t("cta")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
