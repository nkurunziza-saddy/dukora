"use client";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Form } from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { countries, currencies, months } from "@/utils/constants";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import type { SelectBusinessSetting } from "@/lib/schema/schema-types";
import { toast } from "sonner";
import { upsertBusinessSettings } from "@/server/actions/business-settings-actions";
import { format } from "date-fns";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
    .optional(),
  invoicePrefix: z
    .string()
    .max(10, "Invoice prefix cannot exceed 10 characters")
    .optional(),
  invoiceNumberStart: z
    .number()
    .min(1, "Invoice number must start from 1")
    .optional(),
});

export function EditBusinessSettings({
  settings,
}: {
  settings: SelectBusinessSetting[];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
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
  });

  const {
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  const vatRate = watch("defaultVatRate") || 0;
  const invoicePrefix = watch("invoicePrefix") || "";

  const isVatRateAtLimit = vatRate >= LIMITS.VAT_RATE_MAX;
  const invoicePrefixLength = invoicePrefix.length;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
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
  }
  console.log(errors);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <CardHeader className="px-0">
            <CardTitle>{t("businessSettings")}</CardTitle>
            <CardDescription>
              {t("businessSettingsDescription")}
            </CardDescription>
          </CardHeader>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">VAT Rate</span>
                <Badge
                  variant={isVatRateAtLimit ? "destructive" : "secondary"}
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
                  variant={
                    invoicePrefixLength > 8 ? "destructive" : "secondary"
                  }
                  className="text-xs"
                >
                  {invoicePrefixLength}/10
                </Badge>
              </div>
            </div>
          </div>

          {isVatRateAtLimit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                VAT rate has reached the maximum limit of {LIMITS.VAT_RATE_MAX}
                %. Please verify this rate is correct.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-medium mb-4">{t("regionalSettings")}</h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("currency")} *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCurrency")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem
                            key={currency.value}
                            value={currency.value}
                          >
                            {t(currency.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("country")} *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const country = countries.find(
                          (c) => c.value === value
                        );
                        if (country) {
                          setValue("timezone", country.timezone);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectCountry")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.value} value={country.value}>
                            {t(country.label)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("timezone")}</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>{t("timezoneAutoFill")}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fiscalStartMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fiscalStartMonth")} *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("selectMonth")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {months.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {t(month.label)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">{t("taxSettings")}</h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="pricesIncludeTax"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        {t("pricesIncludeTax")}
                      </FormLabel>
                      <FormDescription>
                        {t("pricesIncludeTaxDescription")}
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="defaultVatRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("defaultVatRate")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={LIMITS.VAT_RATE_MIN}
                        max={LIMITS.VAT_RATE_MAX}
                        placeholder={t("vatRatePlaceholder")}
                        {...field}
                        onChange={(e) => {
                          const value = Number.parseFloat(e.target.value);
                          if (
                            !Number.isNaN(value) &&
                            value >= LIMITS.VAT_RATE_MIN &&
                            value <= LIMITS.VAT_RATE_MAX
                          ) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("defaultVatRateDescription")} (Range:{" "}
                      {LIMITS.VAT_RATE_MIN}% - {LIMITS.VAT_RATE_MAX}%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">{t("invoiceSettings")}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="invoicePrefix"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("invoicePrefix")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("invoicePrefixPlaceholder")}
                        maxLength={10}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {10 - invoicePrefixLength} characters remaining
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="invoiceNumberStart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("invoiceNumberStart")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        placeholder="1"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number.parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      {t("invoiceNumberStartDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("saveSettings")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
