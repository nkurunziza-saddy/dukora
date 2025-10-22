"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { USER_ROLES } from "@/lib/schema/models/enums";
import { UserRole } from "@/lib/schema/schema-types";
import { createInvitation } from "@/server/actions/invitation-actions";
import { userRolesObject } from "@/utils/constants";

export function InviteUserForm() {
  const t = useTranslations("forms");
  const supplierSchema = z.object({
    name: z.string().min(1, t("userNameRequired")),
    email: z.string().min(1, t("userEmailRequired")).email(t("userEmailValid")),
    role: z.enum([...USER_ROLES]),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      role: UserRole.MEMBER,
    },
    validators: {
      onSubmit: supplierSchema,
    },
    onSubmit: async ({ value }) => {
      const req = await createInvitation(value);
      if (req.data) {
        form.reset();
        toast.success(t("invitationSent"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error(t("error"), {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    },
  });

  return (
    <>
      <Alert variant="error">
        <AlertCircleIcon className="h-4 w-4" />
        <AlertDescription>
          {t("emailVerificationDown", {
            moreContent: "Their email won't be verified for now.",
          })}
        </AlertDescription>
      </Alert>
      <form
        id="invite-user-form"
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
                  <FieldLabel htmlFor={field.name}>
                    {t("userName")} *
                  </FieldLabel>
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
                  <FieldLabel htmlFor={field.name}>
                    {t("userEmail")} *
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder={t("enterUserEmail")}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                  <FieldLabel htmlFor={field.name}>{t("role")}</FieldLabel>
                  <Select
                    name={field.name}
                    value={field.state.value}
                    onValueChange={field.handleChange}
                    items={userRolesObject}
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
            form="invite-user-form"
            disabled={form.state.isSubmitting}
            className="min-w-[120px]"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
                {t("sending")} ...
              </>
            ) : (
              t("send")
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
