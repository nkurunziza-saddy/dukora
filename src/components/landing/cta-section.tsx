"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function CTASection() {
  const t = useTranslations("landing.cta");
  return (
    <section className="py-24 md:py-32 lg:py-40">
      <div className="max-w-4xl mx-auto px-4 lg:px-12 text-center">
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground text-balance">
            {t("title")}
          </h2>
          <p className="text-sm text-text-secondary max-w-2xl mx-auto">
            {t("description")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={"/auth/sign-up"}
              className="w-full sm:w-auto sm:min-w-36 inline-flex items-center justify-center gap-2 px-4 py-3 bg-foreground text-background text-xs font-medium hover:bg-primary-hover transition-all"
            >
              {t("button")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
