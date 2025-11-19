import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import SidebarContainer from "@/components/providers/sidebar-container";
import { GuardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";

async function SessionGuard({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("common");

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <Button render={<Link href="/dashboard" />} size="sm" variant="ghost">
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          {t("backToDashboard")}
        </Button>
        <div className="flex-1">
          <h1 className=" font-medium">{t("createNew")}</h1>
        </div>
      </div>

      <div>{children}</div>
    </div>
  );
}

export default function CreateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <SessionGuard>
        <SidebarContainer>{children}</SidebarContainer>
      </SessionGuard>
    </Suspense>
  );
}
