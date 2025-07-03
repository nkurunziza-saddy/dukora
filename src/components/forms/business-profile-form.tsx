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
import { updateBusiness } from "@/server/actions/business-actions";
import { getBusinessById } from "@/server/actions/business-actions";
import {
  createStripeConnectedAccount,
  createStripeAccountLink,
} from "@/server/actions/stripe-connect-actions";

export default function BusinessProfileForm({
  business,
}: {
  business: Awaited<ReturnType<typeof getBusinessById>>["data"];
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tStripe = useTranslations("stripe");

  const businessProfileSchema = z.object({
    name: z.string().min(1, t("businessNameRequired")),
    domain: z.string().optional(),
    businessType: z.string().optional(),
    logoUrl: z.string().optional(),
    registrationNumber: z.string().optional(),
  });

  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: business?.name || "",
      domain: business?.domain || "",
      businessType: business?.businessType || "",
      logoUrl: business?.logoUrl || "",
      registrationNumber: business?.registrationNumber || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof businessProfileSchema>) => {
    if (!business?.id) return;
    const req = await updateBusiness({
      businessId: business.id,
      updates: values,
    });
    if (req.data) {
      toast.success(t("businessSettingsUpdated"), {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error(tCommon("error"), {
        description: t("businessSettingsUpdateFailed"),
      });
    }
  };

  const handleConnectStripe = async () => {
    if (!business?.id) {
      toast.error(tCommon("error"), {
        description: tStripe("businessIdMissing"),
      });
      return;
    }

    try {
      let stripeAccountId = business.stripeAccountId;

      if (!stripeAccountId) {
        const createAccountRes = await createStripeConnectedAccount({});
        if (createAccountRes.error || !createAccountRes.data?.id) {
          toast.error(tCommon("error"), {
            description:
              createAccountRes.error || tStripe("failedToCreateStripeAccount"),
          });
          return;
        }
        stripeAccountId = createAccountRes.data.id;
      }

      const accountLinkRes = await createStripeAccountLink({
        stripeAccountId: stripeAccountId,
        refreshUrl: `${window.location.origin}/dashboard/settings/business`,
        returnUrl: `${window.location.origin}/dashboard/settings/business`,
      });

      if (accountLinkRes.error || !accountLinkRes.data?.url) {
        toast.error(tCommon("error"), {
          description:
            accountLinkRes.error || tStripe("failedToCreateAccountLink"),
        });
        return;
      }

      window.location.href = accountLinkRes.data.url;
    } catch (error) {
      console.error("Stripe Connect error:", error);
      toast.error(tCommon("error"), {
        description: tStripe("stripeConnectError"),
      });
    }
  };

  const isStripeConnected = !!business?.stripeAccountId;
  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("businessName")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterBusinessName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("domain")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterDomain")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("businessType")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterBusinessType")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("logoUrl")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterLogoUrl")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("registrationNumber")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterRegistrationNumber")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Separator />
          <h3 className="text-lg font-medium">
            {tStripe("stripeIntegration")}
          </h3>
          <p className="text-sm text-muted-foreground">
            {tStripe("stripeIntegrationDescription")}
          </p>
          <Button
            type="button"
            onClick={handleConnectStripe}
            disabled={isSubmitting || isStripeConnected}
          >
            {isStripeConnected
              ? tStripe("stripeAccountConnected")
              : tStripe("connectStripeAccount")}
          </Button>
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
