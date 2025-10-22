"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
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
import { businessDetailsSchema, LIMITS } from "./settings-utils";

export function EditBusinessDetails({
  business,
}: {
  business: Omit<SelectBusiness, "createdAt" | "updatedAt" | "stripeAccountId">;
}) {
  const t = useTranslations("forms");

  const form = useForm({
    validators: {
      // @ts-expect-error
      onBlur: businessDetailsSchema,
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
      id="edit-business-details-form"
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
                <AlertCircleIcon className="h-4 w-4" />
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
            <form.Field name="name">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("businessName")}
                  </label>
                  <Input
                    placeholder={t("enterBusinessName")}
                    maxLength={LIMITS.NAME_MAX}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <FieldDescription>
                    {nameRemaining} characters remaining
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="domain">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("domain")}
                  </label>
                  <Input
                    placeholder={t("enterDomain")}
                    maxLength={LIMITS.DOMAIN_MAX}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                    type="url"
                  />
                  <FieldDescription>
                    {domainRemaining} characters remaining •{" "}
                    {t("domainDescription")}
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="description">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("description")}
                  </label>
                  <Textarea
                    placeholder={t("enterBusinessDescription")}
                    className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="businessType">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("businessType")}
                  </label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value || ""}
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
            </form.Field>

            <form.Field name="logoUrl">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("logoUrl")}
                  </label>
                  <Input
                    type="url"
                    placeholder={t("enterLogoUrl")}
                    maxLength={LIMITS.LOGO_URL_MAX}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <FieldDescription>
                    {logoUrlRemaining} characters remaining
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            {t("systemInformation")}
          </h4>
          <div className="space-y-4">
            <form.Field name="registrationNumber">
              {(field) => (
                <Field>
                  <label htmlFor={field.name} className="text-sm font-medium">
                    {t("registrationNumber")}
                  </label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.errors.length > 0}
                  />
                  <FieldDescription>
                    {t("registrationNumberDescription")}
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="isActive">
              {(field) => (
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
            </form.Field>
          </div>
        </div>
      </FieldGroup>

      <div className="mt-6">
        <Button
          type="submit"
          form="edit-business-details-form"
          disabled={form.state.isSubmitting}
        >
          {form.state.isSubmitting ? t("saving") : t("saveDetails")}
        </Button>
      </div>
    </form>
  );
}
