import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { AcceptInvitationSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { constructI18nMetadata } from "@/lib/config/i18n-metadata";

export async function generateMetadata(): Promise<Metadata> {
  return constructI18nMetadata({
    pageKey: "acceptInvitation",
  });
}

async function AcceptInvitationContent({ code }: { code: string }) {
  const t = await getTranslations("auth.invitation");

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex gap-4">
          <Link
            className="flex-1"
            href={`/auth/accept-invitation?code=${code}`}
          >
            <Button className="w-full">{t("acceptInvitationButton")}</Button>
          </Link>
          <Link
            className="flex-1"
            href={`/auth/accept-invitation?code=${code}`}
          >
            <Button className="w-full bg-transparent" variant="outline">
              {t("declineInvitationButton")}
            </Button>
          </Link>
        </div>
      </CardPanel>
    </Card>
  );
}

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const { code } = await searchParams;

  if (!code) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex items-center justify-center">
      <Suspense fallback={<AcceptInvitationSkeleton />}>
        <AcceptInvitationContent code={code} />
      </Suspense>
    </div>
  );
}
