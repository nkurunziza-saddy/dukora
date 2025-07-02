"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { upsertBusinessSettings } from "@/server/actions/business-settings-actions";
import { getAll } from "@/server/repos/business-settings-repo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function BusinessSettingsForm({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getAll>>["data"];
}) {
  const t = useTranslations("forms");
  const tOnboarding = useTranslations("onboarding");
  const tCommon = useTranslations("common");

  const settingsObject = Array.isArray(settings)
    ? settings.reduce(
        (acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {} as Record<string, any>
      )
    : {};

  const businessSettingsSchema = z.object({
    currency: z.string().min(1, "Currency is required"),
    timezone: z.string().min(1, "Timezone is required"),
    fiscalStartMonth: z.string().min(1, "Fiscal start month is required"),
    pricesIncludeTax: z.boolean(),
    defaultVatRate: z.string().optional(),
  });

  const form = useForm<z.infer<typeof businessSettingsSchema>>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      currency: settingsObject.currency || "RWF",
      timezone: settingsObject.timezone || "Africa/Kigali",
      fiscalStartMonth: settingsObject.fiscalStartMonth || "1",
      pricesIncludeTax: settingsObject.pricesIncludeTax || false,
      defaultVatRate: settingsObject.defaultVatRate || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof businessSettingsSchema>) => {
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
  };

  const { isSubmitting } = form.formState;

  const currencies = [
    { value: "RWF", label: tOnboarding("currencyRWF") },
    { value: "USD", label: tOnboarding("currencyUSD") },
    { value: "EUR", label: tOnboarding("currencyEUR") },
    { value: "GBP", label: tOnboarding("currencyGBP") },
  ];

  const months = [
    { value: "1", label: tOnboarding("monthJanuary") },
    { value: "2", label: tOnboarding("monthFebruary") },
    { value: "3", label: tOnboarding("monthMarch") },
    { value: "4", label: tOnboarding("monthApril") },
    { value: "5", label: tOnboarding("monthMay") },
    { value: "6", label: tOnboarding("monthJune") },
    { value: "7", label: tOnboarding("monthJuly") },
    { value: "8", label: tOnboarding("monthAugust") },
    { value: "9", label: tOnboarding("monthSeptember") },
    { value: "10", label: tOnboarding("monthOctober") },
    { value: "11", label: tOnboarding("monthNovember") },
    { value: "12", label: tOnboarding("monthDecember") },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("currency")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
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
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("timezone")}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="fiscalStartMonth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fiscalStartMonth")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon("saving")}...
              </>
            ) : (
              tCommon("saveChanges")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
