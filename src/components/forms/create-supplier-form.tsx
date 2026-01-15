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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SelectSupplier } from "@/lib/schema/schema.types";
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
    note: z.string(),
    contactName: z.string(),
  });

  const form = useForm({
    defaultValues: {
      name: supplier ? supplier.name : "",
      email: supplier ? supplier.email : "",
      phone: supplier ? supplier.phone : "",
      address: supplier ? (supplier.address ?? "") : "",
      note: supplier ? (supplier.note ?? "") : "",
      contactName: supplier ? (supplier.contactName ?? "") : "",
    },
    validators: {
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
          },
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
      className="space-y-6"
      id="supplier-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <Separator />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("supplier")} {tCommon("name")} *
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterSupplierCompanyName")}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="flex items-center gap-2"
                    htmlFor={field.name}
                  >
                    {tCommon("email")} *
                  </FieldLabel>
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

          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel
                    className="flex items-center gap-2"
                    htmlFor={field.name}
                  >
                    {tCommon("phone")} *
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const formatted = formatPhoneNumber(e.target.value);
                      field.handleChange(formatted);
                    }}
                    placeholder={t("phone")}
                    value={field.state.value}
                  />
                  <FieldDescription>{t("enterPhoneNumber")}</FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="phone"
          />
        </div>

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel
                  className="flex items-center gap-2"
                  htmlFor={field.name}
                >
                  {tCommon("address")}
                </FieldLabel>
                <Textarea
                  aria-invalid={isInvalid}
                  className="min-h-20"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterBusinessAddress")}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="address"
        />
      </FieldGroup>

      <FieldGroup>
        <Separator />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("contactName")}</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterContactName")}
                  value={field.state.value}
                />
                <FieldDescription>{t("contactDescription")}</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="contactName"
        />
      </FieldGroup>

      <FieldGroup>
        <Separator />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{tCommon("note")}</FieldLabel>
                <Textarea
                  aria-invalid={isInvalid}
                  className="min-h-[100px]"
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("noteSupplierPlaceholder")}
                  value={field.state.value}
                />
                <FieldDescription>
                  {t("noteSupplierDescription")}
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="note"
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            disabled={form.state.isSubmitting}
            onClick={() => form.reset()}
            type="button"
            variant="outline"
          >
            {t("resetForm")}
          </Button>
          <Button
            className="min-w-[120px]"
            disabled={form.state.isSubmitting}
            form="supplier-form"
            type="submit"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
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
      description={t("createSupplierDescription")}
      title={t("createNewSupplier")}
      triggerText={t("createSupplier")}
    >
      <SupplierForm />
    </TriggerDialog>
  );
};
