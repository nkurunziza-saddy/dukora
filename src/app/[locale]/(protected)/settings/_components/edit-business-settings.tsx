"use client";
import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { AlertCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
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
import { Switch } from "@/components/ui/switch";
import type { SelectBusinessSetting } from "@/lib/schema/schema-types";
import { upsertBusinessSettings } from "@/server/actions/business-settings-actions";
import { LIMITS, settingsSchema } from "./settings-utils";
import {
  getCountries,
  getCurrencies,
  getMonths,
} from "@/app/[locale]/(onboarding)/onboarding/_components/onboarding-utils";
import { Label } from "@/components/ui/label";

export function EditBusinessSettings({
  settings,
}: {
  settings: SelectBusinessSetting[];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const form = useForm({
    validators: {
      onBlur: settingsSchema,
    },
    defaultValues: {
      currency:
        (settings.find((s) => s.key === "currency")?.value as string) || "",
      country:
        (settings.find((s) => s.key === "country")?.value as string) || "",
      timezone:
        (settings.find((s) => s.key === "timezone")?.value as string) || "",
      fiscalStartMonth:
        String(
          settings.find((s) => s.key === "fiscalStartMonth")?.value || "",
        ) || "",
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
      id="edit-business-settings-form"
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
            <AlertCircleIcon className="h-4 w-4" />
            <AlertDescription>
              VAT rate has reached the maximum limit of {LIMITS.VAT_RATE_MAX}% .
              Please verify this rate is correct.
            </AlertDescription>
          </Alert>
        )}

        <div>
          <h4 className="font-medium mb-4">{t("regionalSettings")}</h4>
          <div className="space-y-4">
            <form.Field name="currency">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {t("currency")} *
                  </Label>
                  <Select
                    onValueChange={field.handleChange}
                    value={field.state.value}
                    items={getCurrencies(t)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {getCurrencies(t).map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="country">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {t("country")} *
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      field.handleChange(value);
                      const country = getCountries(t).find(
                        (c) => c.value === value,
                      );
                      if (country) {
                        form.setFieldValue("timezone", country.timezone);
                      }
                    }}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      {getCountries(t).map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectPopup>
                  </Select>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
              <form.Field name="timezone">
                {(field) => (
                  <Field>
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {t("timezone")}
                    </Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      disabled
                    />
                    <FieldDescription>{t("timezoneAutoFill")}</FieldDescription>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>

              <form.Field name="fiscalStartMonth">
                {(field) => (
                  <Field>
                    <Label htmlFor={field.name} className="text-sm font-medium">
                      {t("fiscalStartMonth")} *
                    </Label>
                    <Select
                      onValueChange={field.handleChange}
                      value={field.state.value}
                      items={getMonths(t)}
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectPopup>
                        {getMonths(t).map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectPopup>
                    </Select>
                    <FieldError errors={field.state.meta.errors} />
                  </Field>
                )}
              </form.Field>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">{t("taxSettings")}</h4>
          <div className="space-y-4">
            <form.Field name="pricesIncludeTax">
              {(field) => (
                <Field
                  orientation="horizontal"
                  className="flex flex-row items-center justify-between rounded-lg border p-4"
                >
                  <FieldContent>
                    <Label className="text-base font-medium">
                      {t("pricesIncludeTax")}
                    </Label>
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
            </form.Field>

            <form.Field name="defaultVatRate">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {t("defaultVatRate")}
                  </Label>
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
            </form.Field>
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-4">{t("invoiceSettings")}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <form.Field name="invoicePrefix">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {t("invoicePrefix")}
                  </Label>
                  <Input
                    placeholder={t("invoicePrefixPlaceholder")}
                    maxLength={10}
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldDescription>
                    {10 - invoicePrefixLength} characters remaining
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>

            <form.Field name="invoiceNumberStart">
              {(field) => (
                <Field>
                  <Label htmlFor={field.name} className="text-sm font-medium">
                    {t("invoiceNumberStart")}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(Number.parseInt(e.target.value, 10))
                    }
                  />
                  <FieldDescription>
                    {t("invoiceNumberStartDescription")}
                  </FieldDescription>
                  <FieldError errors={field.state.meta.errors} />
                </Field>
              )}
            </form.Field>
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
