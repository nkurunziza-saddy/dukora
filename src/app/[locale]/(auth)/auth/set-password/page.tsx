"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
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
        <CardTitle className="text-lg md:text-xl">
          {t("setPassword.title")}
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          {t("setPassword.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="email">{t("fields.email")}</Label>
            <Input id="email" type="email" value={email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t("fields.password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder={t("fields.passwordPlaceholder")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="passwordConfirmation">
              {t("fields.confirmPassword")}
            </Label>
            <Input
              id="passwordConfirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder={t("fields.confirmPasswordPlaceholder")}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              t("setPassword.setPasswordButton")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <p className="text-xs text-muted-foreground">
          {t("setPassword.alreadyHaveAccount")}
        </p>
        <Button variant="link" onClick={() => router.push("/auth/sign-in")}>
          {t("setPassword.signInLink")}
        </Button>
      </CardFooter>
    </Card>
  );
}
