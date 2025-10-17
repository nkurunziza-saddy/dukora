"use client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { countries, currencies, months } from "@/utils/constants";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import type { SelectBusinessSetting } from "@/lib/schema/schema-types";
import { toast } from "sonner";
import { upsertBusinessSettings } from "@/server/actions/business-settings-actions";
import { format } from "date-fns";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";

const LIMITS = {
  VAT_RATE_MIN: 0,
  VAT_RATE_MAX: 100,
  BUSINESS_NAME_MAX: 100,
  DESCRIPTION_MAX: 500,
};

const formSchema = z.object({
  currency: z.string().min(1, "Currency is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  fiscalStartMonth: z.string().min(1, "Fiscal start month is required"),
  pricesIncludeTax: z.boolean(),
  defaultVatRate: z
    .number()
    .min(
      LIMITS.VAT_RATE_MIN,
      `VAT rate must be at least ${LIMITS.VAT_RATE_MIN}%`
    )
    .max(LIMITS.VAT_RATE_MAX, `VAT rate cannot exceed ${LIMITS.VAT_RATE_MAX}%`),
  businessDescription: z
    .string()
    .max(
      LIMITS.DESCRIPTION_MAX,
      `Description cannot exceed ${LIMITS.DESCRIPTION_MAX} characters`
    )
    .default(""),
  invoicePrefix: z
    .string()
    .max(10, "Invoice prefix cannot exceed 10 characters"),
  invoiceNumberStart: z.number().min(1, "Invoice number must start from 1"),
});

export function EditBusinessSettings({
  settings,
}: {
  settings: SelectBusinessSetting[];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const form = useForm({
    validators: {
      onSubmit: formSchema,
    },
    defaultValues: {
      currency:
        (settings.find((s) => s.key === "currency")?.value as string) || "",
      country:
        (settings.find((s) => s.key === "country")?.value as string) || "",
      timezone:
        (settings.find((s) => s.key === "timezone")?.value as string) || "",
      fiscalStartMonth:
        (settings.find((s) => s.key === "fiscalStartMonth")?.value as string) ||
        "",
      pricesIncludeTax:
        (settings.find((s) => s.key === "pricesIncludeTax")
          ?.value as boolean) || false,
      defaultVatRate:
        (settings.find((s) => s.key === "defaultVatRate")?.value as number) ||
        0,
      invoicePrefix:
        (settings.find((s) => s.key === "invoicePrefix")?.value as string) ||
        "",
      invoiceNumberStart:
        (settings.find((s) => s.key === "invoiceNumberStart")
          ?.value as number) || 1,
    },
    onSubmit: async ({ value }) => {
      const settingsToUpdate = Object.entries(value).map(([key, value]) => ({
        key,
        value,
      }));

      const req = await upsertBusinessSettings(settingsToUpdate);
      if (req.data?.success) {
        toast.success(t("businessSettingsUpdated"), {
          description: format(new Date(), "MMM dd, yyyy"),
        });
      } else {
        toast.error(tCommon("error"), {
          description: t("businessSettingsUpdateFailed"),
        });
      }
    },
  });

  const { defaultVatRate, invoicePrefix } = form.state.values;

  const vatRate = defaultVatRate || 0;
  const invoicePrefixValue = invoicePrefix || "";

  const isVatRateAtLimit = vatRate >= LIMITS.VAT_RATE_MAX;
  const invoicePrefixLength = invoicePrefixValue.length;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup className="space-y-6">
        <CardHeader className="px-0">
          <CardTitle>{t("businessSettings")}</CardTitle>
          <CardDescription>{t("businessSettingsDescription")}</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">VAT Rate</span>
              <Badge
                variant={isVatRateAtLimit ? "error" : "secondary"}
                className="text-xs"
              >
                {vatRate}%/{LIMITS.VAT_RATE_MAX}%
              </Badge>
            </div>
          </div>

          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Invoice Prefix</span>
              <Badge
                variant={invoicePrefixLength > 8 ? "error" : "secondary"}
                className="text-xs"
              >
                {invoicePrefixLength}/10
              </Badge>
            </div>
          </div>
        </div>

        {isVatRateAtLimit && (
          <Alert variant="error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              VAT rate has reached the maximum limit of {LIMITS.VAT_RATE_MAX}% .
              Please verify this rate is correct.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h4 className="font-medium mb-4">{t("regionalSettings")}</h4>
          <div className="space-y-4">
            <form.Field
              name="currency"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("currency")} *</FieldLabel>
                  <Select
                    onValueChange={field.handleChange}
                    defaultValue={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {t(currency.label)}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="country"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("country")} *</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.handleChange(value);
                      const country = countries.find((c) => c.value === value);
                      if (country) {
                        form.setFieldValue("timezone", country.timezone);
                      }
                    }}
                    defaultValue={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {countries.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {t(country.label)}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
              <form.Field
                name="timezone"
                children={(field) => (
                  <Field>
                    <FieldLabel>{t("timezone")}</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      type="datetime-local"
                    />
                    <FieldDescription>{t("timezoneAutoFill")}</FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />

              <form.Field
                name="fiscalStartMonth"
                children={(field) => (
                  <Field>
                    <FieldLabel>{t("fiscalStartMonth")} *</FieldLabel>
                    <Select
                      onValueChange={field.handleChange}
                      defaultValue={field.state.value}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {t(month.label)}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">{t("taxSettings")}</h4>
          <div className="space-y-4">
            <form.Field
              name="pricesIncludeTax"
              children={(field) => (
                <Field
                  orientation="horizontal"
                  className="flex flex-row items-center justify-between rounded-lg border p-4"
                >
                  <FieldContent>
                    <FieldLabel className="text-base">
                      {t("pricesIncludeTax")}
                    </FieldLabel>
                    <FieldDescription>
                      {t("pricesIncludeTaxDescription")}
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.state.value}
                    onCheckedChange={field.handleChange}
                  />
                </Field>
              )}
            />

            <form.Field
              name="defaultVatRate"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("defaultVatRate")}</FieldLabel>
                  <Input
                    type="number"
                    step="0.01"
                    min={LIMITS.VAT_RATE_MIN}
                    max={LIMITS.VAT_RATE_MAX}
                    placeholder={t("vatRatePlaceholder")}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value);
                      if (
                        !Number.isNaN(value) &&
                        value >= LIMITS.VAT_RATE_MIN &&
                        value <= LIMITS.VAT_RATE_MAX
                      ) {
                        field.handleChange(value);
                      }
                    }}
                  />
                  <FieldDescription>
                    {t("defaultVatRateDescription")} (Range:{" "}
                    {LIMITS.VAT_RATE_MIN}% - {LIMITS.VAT_RATE_MAX}%)
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">{t("invoiceSettings")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field
              name="invoicePrefix"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("invoicePrefix")}</FieldLabel>
                  <Input
                    placeholder={t("invoicePrefixPlaceholder")}
                    maxLength={10}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                  />
                  <FieldDescription>
                    {10 - invoicePrefixLength} characters remaining
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />

            <form.Field
              name="invoiceNumberStart"
              children={(field) => (
                <Field>
                  <FieldLabel>{t("invoiceNumberStart")}</FieldLabel>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(Number.parseInt(e.target.value))
                    }
                  />
                  <FieldDescription>
                    {t("invoiceNumberStartDescription")}
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            />
          </div>
        </div>
      </FieldGroup>

      <div className="mt-6">
        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? t("saving") : t("saveSettings")}
        </Button>
      </div>
    </form>
  );
}
