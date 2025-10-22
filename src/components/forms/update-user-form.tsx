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
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { USER_ROLES } from "@/lib/schema/models/enums";
import type { SelectUser } from "@/lib/schema/schema-types";
import { updateUser } from "@/server/actions/user-actions";
import { userRolesObject } from "@/utils/constants";

export function UpdateUserForm({ user }: { user: SelectUser }) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const session = useSession();

  const supplierSchema = z.object({
    name: z.string().min(1, t("userNameRequired")),
    email: z.string().min(1, t("userEmailRequired")).email(t("userEmailValid")),
    role: z.enum([...USER_ROLES]),
  });

  const form = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
    validators: {
      onSubmit: supplierSchema,
    },
    onSubmit: async ({ value }) => {
      const req = await updateUser({ userId: user.id, userData: value });
      if (req.data) {
        form.reset();
        toast.success(t("userUpdated"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error(tCommon("error"), {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    },
  });

  const isSelf = user.id === session.data?.user.id;

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
                  disabled={!isSelf}
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
                  disabled={!isSelf}
                  type="email"
                  placeholder={t("email")}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="role"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel>{tCommon("role")}</FieldLabel>
                <Select
                  value={field.state.value}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectPopup>
                    {userRolesObject.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={form.state.isSubmitting}
          className="min-w-[120px]"
        >
          {form.state.isSubmitting ? (
            <>
              <Loader2Icon className="size-3.5 animate-spin" />
              {t("updating")} ...
            </>
          ) : (
            t("update")
          )}
        </Button>
      </div>
    </form>
  );
}
