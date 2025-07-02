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
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { upsertUserSettings } from "@/server/actions/user-settings-actions";
import { getAll } from "@/server/repos/user-settings-repo";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export default function UserSettingsForm({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getAll>>["data"];
}) {
  const t = useTranslations("forms");
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

  const userSettingsSchema = z.object({
    lang: z.string(),
    theme: z.string(),
  });

  const form = useForm<z.infer<typeof userSettingsSchema>>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      lang: settingsObject.lang || "en",
      theme: settingsObject.theme || "system",
    },
  });

  const onSubmit = async (values: z.infer<typeof userSettingsSchema>) => {
    const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
      key,
      value,
    }));
    const req = await upsertUserSettings(settingsToUpdate);
    if (req.data?.success) {
      toast.success(t("userSettingsUpdated"), {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error(tCommon("error"), {
        description: t("userSettingsUpdateFailed"),
      });
    }
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />
          <FormField
            control={form.control}
            name="lang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("language")}</FormLabel>
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
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("theme")}</FormLabel>
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
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
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
