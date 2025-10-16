import { Button } from "@/components/ui/button";
import {
  Card,
  CardPanel,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const t = await getTranslations("auth.invitation");
  const { code } = await searchParams;
  if (!code) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="flex gap-4">
            <Link href={`/auth/accept-invitation?code=${code}`}>
              <Button className="w-full">{t("acceptInvitationButton")}</Button>
            </Link>
            <Link href={`/auth/accept-invitation?code=${code}`}>
              <Button className="w-full" variant="outline">
                {t("declineInvitationButton")}
              </Button>
            </Link>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
