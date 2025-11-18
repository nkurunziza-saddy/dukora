"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export function BlogSection() {
  const t = useTranslations("landing.blog");

  const posts = [
    {
      slug: "ai-inventory-predictions",
      category: t("aiInventoryPredictions.category"),
      title: t("aiInventoryPredictions.title"),
      description: t("aiInventoryPredictions.description"),
      date: t("aiInventoryPredictions.date"),
    },
    {
      slug: "multi-warehouse-setup",
      category: t("multiWarehouseSetup.category"),
      title: t("multiWarehouseSetup.title"),
      description: t("multiWarehouseSetup.description"),
      date: t("multiWarehouseSetup.date"),
    },
    {
      slug: "optimize-cash-flow",
      category: t("optimizeCashFlow.category"),
      title: t("optimizeCashFlow.title"),
      description: t("optimizeCashFlow.description"),
      date: t("optimizeCashFlow.date"),
    },
  ];
  return (
    <section className="py-24 md:py-32 bg-surface" id="insights">
      <div className="pgtx">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t("latestInsights")}
          </h2>
          <p className="text-sm text-text-secondary">{t("description")}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {posts.map((post) => (
            <Link
              className="bg-background p-8 hover:bg-surface-elevated transition-colors group"
              href={`/insights/${post.slug}`}
              key={post.slug}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {post.date}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-foreground group-hover:text-text-secondary transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {post.description}
                </p>
                <div className="text-xs text-foreground pt-2">
                  {t("readMore")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
