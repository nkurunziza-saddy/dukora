"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { upsertUserSettings } from "@/server/actions/user-settings-actions";
import { getAll } from "@/server/repos/user-settings-repo";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames } from "@/i18n/config";

export default function UserSettingsForm({
  settings,
}: {
  settings: Awaited<ReturnType<typeof getAll>>["data"];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const { setTheme, resolvedTheme } = useTheme();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

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

  // Helper to update a single setting in DB
  const updateSetting = async (key: string, value: string) => {
    const req = await upsertUserSettings([{ key, value }]);
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
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />
          {/* Language Switcher */}
          <div>
            <label className="block mb-1 font-medium">{t("language")}</label>
            <div className="relative inline-block w-full sm:w-1/2">
              <button
                type="button"
                className="flex items-center w-full border rounded px-3 py-2 bg-background"
                aria-haspopup="listbox"
                aria-expanded="false"
                onClick={(e) => {
                  e.currentTarget.nextElementSibling?.classList.toggle(
                    "hidden"
                  );
                }}
              >
                <span className="mr-2">🌐</span>
                {localeNames[locale as keyof typeof localeNames]}
              </button>
              <ul
                className="absolute z-10 mt-1 w-full bg-popover border rounded shadow-lg hidden"
                role="listbox"
              >
                {locales.map((loc) => (
                  <li
                    key={loc}
                    className="cursor-pointer px-4 py-2 hover:bg-accent"
                    onClick={async () => {
                      if (locale !== loc) {
                        const newPath = pathname.replace(
                          `/${locale}`,
                          `/${loc}`
                        );
                        router.replace(newPath);
                        await updateSetting("lang", loc);
                      }
                    }}
                    role="option"
                    aria-selected={locale === loc}
                  >
                    {localeNames[loc]}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Theme Switcher */}
          <div>
            <label className="block mb-1 font-medium">{t("theme")}</label>
            <div className="relative inline-block w-full sm:w-1/2">
              <button
                type="button"
                className="flex items-center w-full border rounded px-3 py-2 bg-background"
                aria-haspopup="listbox"
                aria-expanded="false"
                onClick={(e) => {
                  e.currentTarget.nextElementSibling?.classList.toggle(
                    "hidden"
                  );
                }}
              >
                {resolvedTheme === "system" && <span className="mr-2">🖥️</span>}
                {resolvedTheme === "light" && <span className="mr-2">🌞</span>}
                {resolvedTheme === "dark" && <span className="mr-2">🌙</span>}
                {(resolvedTheme ?? "system").charAt(0).toUpperCase() +
                  (resolvedTheme ?? "system").slice(1)}
              </button>
              <ul
                className="absolute z-10 mt-1 w-full bg-popover border rounded shadow-lg hidden"
                role="listbox"
              >
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-accent"
                  onClick={async () => {
                    setTheme("system");
                    await updateSetting("theme", "system");
                  }}
                  role="option"
                  aria-selected={resolvedTheme === "system"}
                >
                  System
                </li>
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-accent"
                  onClick={async () => {
                    setTheme("light");
                    await updateSetting("theme", "light");
                  }}
                  role="option"
                  aria-selected={resolvedTheme === "light"}
                >
                  Light
                </li>
                <li
                  className="cursor-pointer px-4 py-2 hover:bg-accent"
                  onClick={async () => {
                    setTheme("dark");
                    await updateSetting("theme", "dark");
                  }}
                  role="option"
                  aria-selected={resolvedTheme === "dark"}
                >
                  Dark
                </li>
              </ul>
            </div>
          </div>
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
    </div>
  );
}
