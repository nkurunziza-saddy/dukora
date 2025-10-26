import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { GuardSkeleton } from "@/components/guard-skeleton";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import type { SessionSession } from "@/lib/auth";
import { getCurrentSession } from "@/server/actions/auth-actions";

function NotFoundGuard({
  session,
  t,
}: {
  session: SessionSession | null;
  t: (key: string) => string;
}) {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <Empty>
        <EmptyHeader>
          <EmptyTitle>{t("title")}</EmptyTitle>
          <EmptyDescription>{t("description")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <div className="flex gap-2 items-center">
            {session ? (
              <Button
                variant={"secondary"}
                size="sm"
                render={<Link href={"/dashboard"} />}
              >
                {t("goToDashboard")}
              </Button>
            ) : (
              <>
                <Button
                  variant={"secondary"}
                  size="sm"
                  render={<Link href={"/"} />}
                >
                  {t("goToLandingPage")}
                </Button>
                <Button
                  variant={"outline"}
                  size="sm"
                  render={<Link href={"/auth/sign-up"} />}
                >
                  {t("signUp")}
                </Button>
              </>
            )}
          </div>
          <EmptyDescription className="text-sm">
            {t("needHelp")}{" "}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}?subject=${encodeURIComponent(
                t("requestForSupport"),
              )}`}
              title="Email Dukora Support"
            >
              {t("contactSupport")}
            </a>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}
export default async function NotFound() {
  const session = await getCurrentSession();
  const t = await getTranslations("notFound");
  return (
    <Suspense fallback={<GuardSkeleton />}>
      <NotFoundGuard session={session} t={t} />
    </Suspense>
  );
}
