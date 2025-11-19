"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
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
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("userName")}</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterUserName")}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="name"
        />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("userEmail")}</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("email")}
                  type="email"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="email"
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <Button
          className="min-w-[120px]"
          disabled={form.state.isSubmitting}
          type="submit"
        >
          {form.state.isSubmitting ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
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
