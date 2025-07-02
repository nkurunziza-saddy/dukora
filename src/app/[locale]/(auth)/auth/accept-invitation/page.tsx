import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

export default async function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ code: string }>;
}) {
  const t = await getTranslations("invitation");
  const { code } = await searchParams;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("invitationTitle")}</CardTitle>
          <CardDescription>{t("invitationDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Link href={`/auth/accept-invitation?code=${code}`}>
              <Button className="w-full">{t("acceptButton")}</Button>
            </Link>
            <Link href={`/auth/accept-invitation?code=${code}`}>
              <Button className="w-full" variant="outline">
                {t("declineButton")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
