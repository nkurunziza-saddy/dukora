"use client";

import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import type { getUserById } from "@/server/actions/users/users-actions";

export default function UserProfileForm({
  user,
}: {
  user: Awaited<ReturnType<typeof getUserById>>["data"];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const [name, setName] = useState(user?.name || "");
  const [isChangingName, setIsChangingName] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const saveName = async () => {
    try {
      setIsChangingName(true);
      const updateName = await authClient.updateUser({
        name: name,
      });

      if (updateName.data) {
        toast.success(t("userUpdated"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else if (updateName.error) {
        toast.error(tCommon("error"), {
          description: updateName.error.message,
        });
      } else {
        toast.error(tCommon("error"), {
          description: "Something went wrong",
        });
      }
    } catch (_error) {
      toast.error(tCommon("error"), {
        description: "Something went wrong",
      });
    } finally {
      setIsChangingName(false);
    }
  };
  const saveEmail = async () => {
    try {
      setIsChangingEmail(true);
      const updateEmail = await authClient.changeEmail({
        newEmail: email,
      });
      if (updateEmail.data) {
        toast.success(t("userUpdated"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else if (updateEmail.error) {
        toast.error(tCommon("error"), {
          description: updateEmail.error.message,
        });
      } else {
        toast.error(tCommon("error"), {
          description: "Something went wrong",
        });
      }
    } catch (_error) {
      toast.error(tCommon("error"), {
        description: "Something went wrong",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Change Name</CardTitle>
          <CardDescription>Update your name</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">{t("userName")}</FieldLabel>
              <Input
                disabled={isChangingName}
                id="name"
                name="name"
                onChange={(e) => setName(e.target.value)}
                placeholder={t("enterUserName")}
                value={name}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end pt-6 border-t">
            <Button
              className="min-w-[120px]"
              disabled={isChangingName}
              onClick={saveName}
            >
              {isChangingName ? "Changing..." : "Change Name"}
            </Button>
          </div>
        </CardPanel>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Email</CardTitle>
          <CardDescription>Update your email</CardDescription>
        </CardHeader>
        <CardPanel className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t("userEmail")}</FieldLabel>
              <Input
                disabled={isChangingEmail}
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("enterUserEmail")}
                value={email}
              />
            </Field>
          </FieldGroup>

          <div className="flex justify-end pt-6 border-t">
            <Button
              className="min-w-[120px]"
              disabled={isChangingEmail}
              onClick={saveEmail}
            >
              {isChangingEmail ? "Changing..." : "Change Email"}
            </Button>
          </div>
        </CardPanel>
      </Card>
    </div>
  );
}
