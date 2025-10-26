"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function HeroSection() {
  const t = useTranslations("landing.hero");
  return (
    <section className="pt-10 pb-24 md:pt-16 md:pb-32 lg:pt-20 lg:pb-40">
      <div className="max-w-6xl mx-auto px-4 lg:px-12">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-border text-xs text-text-secondary">
            {t("badge")}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] text-balance">
            {t("title")}
          </h1>

          <p className="text-sm md:text-base text-text-secondary max-w-xl mx-auto leading-relaxed text-pretty">
            {t("description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href={"/auth/sign-up"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-foreground text-background text-xs font-medium hover:bg-primary-hover transition-all"
            >
              {t("ctaPrimary")}
            </Link>
            <Link
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-foreground text-xs font-medium hover:bg-surface transition-all"
            >
              {t("ctaSecondary")}
            </Link>
          </div>

          <p className="text-xs text-text-tertiary pt-4">{t("tagline")}</p>
        </div>
      </div>
    </section>
  );
}
