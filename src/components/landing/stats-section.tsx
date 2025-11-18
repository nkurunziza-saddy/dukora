"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function StatsSection() {
  const t = useTranslations("landing.stats");
  return (
    <section className="py-24 md:py-32 border-y border-border">
      <div className="pgtx">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <div className="space-y-2">
            <div className="text-4xl md:text-5xl font-bold text-foreground">
              {t("percentage")}
            </div>
            <div className="text-sm text-text-secondary">
              {t("openSourceFree")}
            </div>
          </div>
          <p className="text-xs text-text-tertiary max-w-lg mx-auto leading-relaxed">
            {t("description")}{" "}
            <Link
              className="text-foreground hover:underline"
              href="https://x.com/nk_saddy"
              rel="noopener noreferrer"
              target="_blank"
            >
              @nk_saddy
            </Link>
            . {t("contributeOn")}{" "}
            <Link
              className="text-foreground hover:underline"
              href="https://github.com/nkurunziza-saddy/dukora"
              rel="noopener noreferrer"
              target="_blank"
            >
              GitHub
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
