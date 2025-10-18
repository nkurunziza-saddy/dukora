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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SelectSupplier } from "@/lib/schema/schema-types";
import {
  createSupplier,
  updateSupplier,
} from "@/server/actions/supplier-actions";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";

export default function SupplierForm({
  supplier,
}: {
  supplier?: SelectSupplier;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const supplierSchema = z.object({
    name: z.string().min(1, t("supplierNameRequired")),
    email: z.email(t("supplierEmailValid")),
    phone: z.string().refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, t("phoneDigits")),
    address: z.string(),
    note: z.string().optional(),
    contactName: z.string().optional(),
  });

  const form = useForm({
    defaultValues: {
      name: supplier ? supplier.name : "",
      email: supplier ? supplier.email : "",
      phone: supplier ? supplier.phone : "",
      address: supplier ? supplier.address ?? "" : "",
      note: supplier ? supplier.note ?? "" : "",
      contactName: supplier ? supplier.contactName ?? "" : "",
    },
    validators: {
      // @ts-expect-error
      onSubmit: supplierSchema,
    },
    onSubmit: async ({ value }) => {
      const req = supplier
        ? await updateSupplier({ supplierId: supplier.id, updates: value })
        : await createSupplier(value);
      if (req.data) {
        form.reset();
        toast.success(
          supplier
            ? `${tCommon("edit")} ${t("supplier")} ${tCommon("confirm")}`
            : `${t("supplier")} ${tCommon("add")} ${tCommon("confirm")}`,
          {
            description: format(new Date(), "MMM dd, yyyy"),
          }
        );
      } else {
        toast.error(tCommon("error"), {
          description: req.error?.split("_").join(" ").toLowerCase(),
        });
      }
    },
  });

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  return (
    <form
      id="supplier-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup className="space-y-4">
        <Separator />

        <form.Field
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("supplier")} {tCommon("name")} *
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder={t("enterSupplierCompanyName")}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="flex items-center gap-2"
                  >
                    {tCommon("email")} *
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    placeholder={t("email")}
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
            name="phone"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    htmlFor={field.name}
                    className="flex items-center gap-2"
                  >
                    {tCommon("phone")} *
                  </FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    placeholder={t("phone")}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.handleChange(formatted);
                    }}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>{t("enterPhoneNumber")}</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </div>

        <form.Field
          name="address"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  htmlFor={field.name}
                  className="flex items-center gap-2"
                >
                  {tCommon("address")}
                </FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder={t("enterBusinessAddress")}
                  className="min-h-[80px]"
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
      </FieldGroup>

      <FieldGroup className="space-y-4">
        <Separator />

        <form.Field
          name="contactName"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("contactName")}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder={t("enterContactName")}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{t("contactDescription")}</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <FieldGroup className="space-y-4">
        <Separator />

        <form.Field
          name="note"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{tCommon("note")}</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  placeholder={t("noteSupplierPlaceholder")}
                  className="min-h-[100px]"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>
                  {t("noteSupplierDescription")}
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={form.state.isSubmitting}
          >
            {t("resetForm")}
          </Button>
          <Button
            type="submit"
            form="supplier-form"
            disabled={form.state.isSubmitting}
            className="min-w-[120px]"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {supplier ? t("updating") : t("creating")}
              </>
            ) : (
              `${supplier ? t("updateSupplier") : t("createSupplier")}`
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export const CreateSupplierDialog = () => {
  const t = useTranslations("forms");
  return (
    <TriggerDialog
      title={t("createNewSupplier")}
      triggerText={t("createSupplier")}
      description={t("createSupplierDescription")}
    >
      <SupplierForm />
    </TriggerDialog>
  );
};
