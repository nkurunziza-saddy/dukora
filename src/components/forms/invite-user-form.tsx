"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "@tanstack/react-form";
import z from "zod";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Loader2, AlertCircle } from "lucide-react";
import { userRolesObject } from "@/utils/constants";
import { format } from "date-fns";
import { createInvitation } from "@/server/actions/invitation-actions";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserRole } from "@/lib/schema/schema-types";

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
      onChange: supplierSchema,
      onBlur: supplierSchema,
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
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("emailVerificationDown")}</AlertDescription>
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
        <FieldGroup className="space-y-4">
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
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
