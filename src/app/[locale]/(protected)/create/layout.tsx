import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";

export default async function CreateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("create");

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/dashboard" />} size="sm" variant="ghost">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t("backToDashboard")}
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{t("createNew")}</h1>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

