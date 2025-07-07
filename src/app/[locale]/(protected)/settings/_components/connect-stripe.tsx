"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormDescription,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import {
  createStripeConnectedAccount,
  createStripeAccountLink,
} from "@/server/actions/stripe-connect-actions";

const formSchema = z.object({
  stripeAccountId: z.string().optional(),
  isConnected: z.boolean(),
});

export function ConnectStripe({
  stripeAccountId,
}: {
  stripeAccountId: string | undefined;
}) {
  const tStripe = useTranslations("stripe");
  const tCommon = useTranslations("common");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      stripeAccountId: stripeAccountId || "",
      isConnected: !!stripeAccountId,
    },
  });

  const {
    formState: { isSubmitting },
    watch,
  } = form;

  const isStripeConnected = watch("isConnected");

  const handleConnectStripe = async () => {
    try {
      let currentStripeAccountId = stripeAccountId;

      // If stripeAccountId is not provided, create a new account
      if (!currentStripeAccountId) {
        const createAccountRes = await createStripeConnectedAccount({});

        if (createAccountRes.error || !createAccountRes.data?.id) {
          toast.error(tCommon("error"), {
            description:
              createAccountRes.error || tStripe("failedToCreateStripeAccount"),
          });
          return;
        }

        currentStripeAccountId = createAccountRes.data.id;
      }

      // Create account link for onboarding
      const accountLinkRes = await createStripeAccountLink({
        stripeAccountId: currentStripeAccountId,
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

  const handleManageStripe = async () => {
    if (!stripeAccountId) return;

    try {
      const accountLinkRes = await createStripeAccountLink({
        stripeAccountId,
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

      window.open(accountLinkRes.data.url, "_blank");
    } catch (error) {
      console.error("Stripe manage error:", error);
      toast.error(tCommon("error"), {
        description: tStripe("stripeManageError"),
      });
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Stripe form submitted:", values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                {tStripe("stripeIntegration")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tStripe("stripeIntegrationDescription")}
              </p>
            </div>
            <Badge
              variant={isStripeConnected ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {isStripeConnected ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  {tStripe("connected")}
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  {tStripe("notConnected")}
                </>
              )}
            </Badge>
          </div>

          <div className="p-4 border rounded-lg">
            <FormItem>
              <FormLabel className="text-base">
                {tStripe("connectionStatus")}
              </FormLabel>
              <FormDescription>
                {isStripeConnected
                  ? tStripe("stripeConnectedDescription")
                  : tStripe("stripeNotConnectedDescription")}
              </FormDescription>

              {stripeAccountId && (
                <div className="mt-2 p-2 bg-muted rounded text-xs font-mono">
                  <span className="text-muted-foreground">Account ID: </span>
                  {stripeAccountId}
                </div>
              )}
            </FormItem>
          </div>

          {!isStripeConnected && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">{tStripe("stripeBenefits")}</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Accept payments directly in your app</li>
                    <li>
                      • Payouts to your bank account without leaving the
                      platform
                    </li>
                    <li>• Secure and compliant payment processing</li>
                    <li>• Manage refunds and disputes easily</li>
                    <li>• Access to detailed transaction analytics</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            {!isStripeConnected ? (
              <Button
                type="button"
                onClick={handleConnectStripe}
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting
                  ? tStripe("connecting")
                  : tStripe("connectStripeAccount")}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManageStripe}
                  className="flex items-center gap-2 bg-transparent"
                >
                  {tStripe("manageStripeAccount")}
                </Button>
                <Button
                  type="button"
                  onClick={handleConnectStripe}
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                >
                  {tStripe("reconnectStripeAccount")}
                </Button>
              </>
            )}
          </div>

          {isStripeConnected && (
            <Badge>
              <strong>{tStripe("summary")}</strong>{" "}
              {tStripe("stripeAccountActive")}
              {stripeAccountId && ` • ID: ${stripeAccountId.slice(0, 12)}...`}
            </Badge>
          )}
        </div>
      </form>
    </Form>
  );
}
