import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import ExpenseTransactionForm from "@/components/forms/expense-transaction-form";
import { GuardSkeleton } from "@/components/skeletons";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "createExpense",
  });
}

export default async function CreateExpensePage() {
  const t = await getTranslations("createExpense");

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">{t("description")}</p>
        </div>

        <Suspense fallback={<GuardSkeleton />}>
          <ExpenseTransactionForm />
        </Suspense>
      </div>
    </div>
  );
}
