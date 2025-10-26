"use client";

import { useTranslations } from "next-intl";

export function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      title: t("realtimeInventory.title"),
      description: t("realtimeInventory.description"),
    },
    {
      title: t("multiWarehouse.title"),
      description: t("multiWarehouse.description"),
    },
    {
      title: t("aiAssistant.title"),
      description: t("aiAssistant.description"),
    },
    {
      title: t("financialAnalytics.title"),
      description: t("financialAnalytics.description"),
    },
    {
      title: t("transactionTracking.title"),
      description: t("transactionTracking.description"),
    },
    {
      title: t("roleBasedAccess.title"),
      description: t("roleBasedAccess.description"),
    },
    {
      title: t("supplierManagement.title"),
      description: t("supplierManagement.description"),
    },
    {
      title: t("taskScheduling.title"),
      description: t("taskScheduling.description"),
    },
    {
      title: t("multiLanguage.title"),
      description: t("multiLanguage.description"),
    },
    {
      title: t("completeAuditLog.title"),
      description: t("completeAuditLog.description"),
    },
    {
      title: t("secureByDesign.title"),
      description: t("secureByDesign.description"),
    },
    {
      title: t("mobileReady.title"),
      description: t("mobileReady.description"),
    },
  ];
  return (
    <section id="features" className="py-24 md:py-32 lg:py-40">
      <div className="max-w-7xl mx-auto px-4 lg:px-12">
        <div className="max-w-2xl mb-16 md:mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            {t("title")}
          </h2>
          <p className="text-sm text-text-secondary text-pretty">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background p-8 md:p-10 hover:bg-surface transition-colors group"
            >
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
