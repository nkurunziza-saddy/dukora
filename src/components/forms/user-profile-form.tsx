"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { getUserById } from "@/server/actions/user-actions";
import { updateUser } from "@/server/actions/user-actions";

export default function UserProfileForm({
  user,
}: {
  user: Awaited<ReturnType<typeof getUserById>>["data"];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const userProfileSchema = z.object({
    name: z.string().min(1, t("userNameRequired")),
    email: z.email(t("userEmailValid")),
  });

  const form = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
    validators: {
      onSubmit: userProfileSchema,
    },
    onSubmit: async ({ value }) => {
      if (!user?.id) return;
      const req = await updateUser({ userId: user.id, userData: value });
      if (req.data) {
        toast.success(t("userUpdated"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error(tCommon("error"), {
          description: t("userSettingsUpdateFailed"),
        });
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("userName")} *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterUserName")}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("userEmail")} *</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="email"
                  placeholder={t("email")}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <Button
          type="submit"
          disabled={form.state.isSubmitting}
          className="min-w-[120px]"
        >
          {form.state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tCommon("saving")}...
            </>
          ) : (
            tCommon("saveChanges")
          )}
        </Button>
      </div>
    </form>
  );
}
