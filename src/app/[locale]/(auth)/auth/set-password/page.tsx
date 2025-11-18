"use client";

import { Loader2Icon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPasswordForInvitation } from "@/server/actions/invitation-actions";

export default function SetPassword() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const invitationCode = searchParams.get("invitationCode") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);

  if (!email || !invitationCode) {
    router.push("/auth/sign-in");
    return null;
  }

  const handleSubmit = async () => {
    if (!email || !invitationCode) {
      toast.error(t("setPassword.missingInfo"));
      return;
    }
    if (password !== passwordConfirmation) {
      toast.error(t("setPassword.passwordMismatch"));
      return;
    }
    setLoading(true);
    const result = await setPasswordForInvitation({
      email,
      invitationCode,
      password,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.data) {
      toast.success(t("setPassword.success"));
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{t("setPassword.title")}</CardTitle>
        <CardDescription>{t("setPassword.description")}</CardDescription>
      </CardHeader>
      <CardPanel>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">{t("fields.email")}</Label>
            <Input disabled id="email" type="email" value={email} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("fields.password")}</Label>
            <Input
              autoComplete="new-password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("fields.passwordPlaceholder")}
              type="password"
              value={password}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirmation">
              {t("fields.confirmPassword")}
            </Label>
            <Input
              autoComplete="new-password"
              id="passwordConfirmation"
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder={t("fields.confirmPasswordPlaceholder")}
              type="password"
              value={passwordConfirmation}
            />
          </div>
          <Button className="w-full" disabled={loading} type="submit">
            {loading ? (
              <Loader2Icon className="animate-spin" size={16} />
            ) : (
              t("setPassword.setPasswordButton")
            )}
          </Button>
        </form>
      </CardPanel>
      <CardFooter className="flex items-center">
        <p className="text-xs text-muted-foreground">
          {t("setPassword.alreadyHaveAccount")}
        </p>
        <Button
          className="text-xs p-0 ml-1"
          onClick={() => router.push("/auth/sign-in")}
          variant="link"
        >
          {t("setPassword.signInLink")}
        </Button>
      </CardFooter>
    </Card>
  );
}
