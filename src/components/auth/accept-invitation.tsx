import {
  Card,
  CardPanel,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { acceptInvitation } from "@/server/actions/invitation-actions";

export const AcceptInvitation: React.FC<{ code: string }> = ({ code }) => {
  const t = useTranslations("invitation");
  const accept = async () => {
    "use server";
    await acceptInvitation({ code, action: "accept" });
  };
  const decline = async () => {
    "use server";
    await acceptInvitation({ code, action: "decline" });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("invitationTitle")}</CardTitle>
        <CardDescription>{t("invitationDescription")}</CardDescription>
      </CardHeader>
      <CardPanel>
        <div className="flex gap-4">
          <Button className="w-full" onClick={accept}>
            {t("acceptButton")}
          </Button>
          <Button className="w-full" variant="outline" onClick={decline}>
            {t("declineButton")}
          </Button>
        </div>
      </CardPanel>
    </Card>
  );
};
