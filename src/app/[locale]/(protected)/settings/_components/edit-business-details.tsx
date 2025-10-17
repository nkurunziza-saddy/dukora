"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
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
import { Textarea } from "@/components/ui/textarea";
import type { SelectBusiness } from "@/lib/schema/schema-types";
import { updateBusiness } from "@/server/actions/business-actions";

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  DOMAIN_MAX: 253,
  LOGO_URL_MAX: 500,
  REGISTRATION_NUMBER_MAX: 50,
};

const formSchema = z.object({
  name: z
    .string()
    .min(LIMITS.NAME_MIN, `Name must be at least ${LIMITS.NAME_MIN} characters`)
    .max(LIMITS.NAME_MAX, `Name cannot exceed ${LIMITS.NAME_MAX} characters`),
  domain: z
    .string()
    .max(
      LIMITS.DOMAIN_MAX,
      `Domain cannot exceed ${LIMITS.DOMAIN_MAX} characters`,
    )
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Please enter a valid domain",
    ),
  businessType: z.string(),
  description: z.string(),
  logoUrl: z
    .url("Please enter a valid URL")
    .max(
      LIMITS.LOGO_URL_MAX,
      `Logo URL cannot exceed ${LIMITS.LOGO_URL_MAX} characters`,
    ),
  registrationNumber: z.string(),
  isActive: z.boolean(),
});

export function EditBusinessDetails({
  business,
}: {
  business: Omit<SelectBusiness, "createdAt" | "updatedAt" | "stripeAccountId">;
}) {
  const t = useTranslations("forms");

  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      name: business?.name || "",
      domain: business?.domain || "",
      description: business?.description || "",
      businessType: business?.businessType || "",
      logoUrl: business?.logoUrl || "",
      registrationNumber: business?.registrationNumber || "",
      isActive: business?.isActive || false,
    },
    onSubmit: async ({ value }) => {
      const result = await updateBusiness({
        businessId: business.id,
        updates: value,
      });
      if (result.error) {
        toast.error("Failed to update business details", {
          description: result.error,
        });
        return;
      }
      toast.success("Business details updated successfully", {
        description: "Your business details have been updated.",
      });
    },
  });

  const { name, domain, logoUrl } = form.state.values;

  const nameValue = name || "";
  const domainValue = domain || "";
  const logoUrlValue = logoUrl || "";

  const businessTypes = [
    { value: "retail", label: t("businessTypeRetail") },
    { value: "wholesale", label: t("businessTypeWholesale") },
    { value: "restaurant", label: t("businessTypeRestaurant") },
    { value: "manufacturing", label: t("businessTypeManufacturing") },
    { value: "service", label: t("businessTypeService") },
    { value: "other", label: t("businessTypeOther") },
  ];

  const nameRemaining = LIMITS.NAME_MAX - nameValue.length;
  const domainRemaining = LIMITS.DOMAIN_MAX - domainValue.length;
  const logoUrlRemaining = LIMITS.LOGO_URL_MAX - logoUrlValue.length;

  const isNameNearLimit = nameValue.length > LIMITS.NAME_MAX * 0.8;
  const isDomainNearLimit = domainValue.length > LIMITS.DOMAIN_MAX * 0.8;
  const isLogoUrlNearLimit = logoUrlValue.length > LIMITS.LOGO_URL_MAX * 0.8;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Name</span>
              <Badge
                variant={isNameNearLimit ? "error" : "secondary"}
                className="text-xs"
              >
                {nameValue.length}/{LIMITS.NAME_MAX}
              </Badge>
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Domain</span>
              <Badge
                variant={isDomainNearLimit ? "error" : "secondary"}
                className="text-xs"
              >
                {domainValue.length}/{LIMITS.DOMAIN_MAX}
              </Badge>
            </div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Logo URL</span>
              <Badge
                variant={isLogoUrlNearLimit ? "error" : "secondary"}
                className="text-xs"
              >
                {logoUrlValue.length}/{LIMITS.LOGO_URL_MAX}
              </Badge>
            </div>
          </div>
        </div>

        <form.Subscribe selector={(state) => [state.isTouched, state.isValid]}>
          {([isTouched, isValid]) =>
            isTouched && !isValid ? (
              <Alert variant="error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix the errors below before submitting.
                </AlertDescription>
              </Alert>
            ) : null
          }
        </form.Subscribe>

        <div>
          <h4 className="font-medium mb-4">{t("basicInformation")}</h4>
          <div className="space-y-4">
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>{t("businessName")}</FieldLabel>
                    <Input
                      placeholder={t("enterBusinessName")}
                      maxLength={LIMITS.NAME_MAX}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {nameRemaining} characters remaining
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="domain"
              children={(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>{t("domain")}</FieldLabel>
                    <Input
                      placeholder={t("enterDomain")}
                      maxLength={LIMITS.DOMAIN_MAX}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      type="url"
                    />
                    <FieldDescription>
                      {domainRemaining} characters remaining •{" "}
                      {t("domainDescription")}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="description"
              children={(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>{t("description")}</FieldLabel>
                    <Textarea
                      placeholder={t("enterBusinessDescription")}
                      className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="businessType"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("businessType")}</FieldLabel>
                  <Select
                    onValueChange={field.handleChange}
                    defaultValue={field.state.value || ""}
                    items={businessTypes}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {businessTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldDescription>
                    {t("businessTypeDescription")}
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="logoUrl"
              children={(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>{t("logoUrl")}</FieldLabel>
                    <Input
                      type="url"
                      placeholder={t("enterLogoUrl")}
                      maxLength={LIMITS.LOGO_URL_MAX}
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {logoUrlRemaining} characters remaining
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            {t("systemInformation")}
          </h4>
          <div className="space-y-4">
            <form.Field
              name="registrationNumber"
              children={(field) => {
                const isInvalid = field.state.meta.errors.length > 0;
                return (
                  <Field>
                    <FieldLabel>{t("registrationNumber")}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                    />
                    <FieldDescription>
                      {t("registrationNumberDescription")}
                    </FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                );
              }}
            />

            <form.Field
              name="isActive"
              children={(field) => (
                <div className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                  <div className="space-y-0.5">
                    <p className="text-base flex items-center gap-2 font-medium">
                      {t("accountStatus")}
                    </p>
                    <FieldDescription>
                      {t("accountStatusDescription")}
                    </FieldDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={field.state.value ? "default" : "secondary"}
                    >
                      {field.state.value ? t("active") : t("inactive")}
                    </Badge>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </FieldGroup>

      <div className="mt-6">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? t("saving") : t("saveDetails")}
        </Button>
      </div>
    </form>
  );
}
