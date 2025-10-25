import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
            href={`/auth/accept-invitation?code=${code}`}
            className="flex-1"
          >
            <Button className="w-full">{t("acceptInvitationButton")}</Button>
          </Link>
          <Link
            href={`/auth/accept-invitation?code=${code}`}
            className="flex-1"
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

function AcceptInvitationSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-7 w-48" />
        </CardTitle>
        <CardDescription>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4 mt-1" />
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
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
