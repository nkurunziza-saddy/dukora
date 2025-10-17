"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { z } from "zod";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardPanel,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  createStripeAccountLink,
  createStripeConnectedAccount,
} from "@/server/actions/stripe-connect-actions";

const formSchema = z.object({
  stripeAccountId: z.string().optional(),
  isConnected: z.boolean(),
});

type FormType = z.infer<typeof formSchema>;

export function ConnectStripe({
  stripeAccountId,
}: {
  stripeAccountId: string | undefined;
}) {
  const tStripe = useTranslations("stripe");
  const tCommon = useTranslations("common");

  const form = useForm({
    defaultValues: {
      stripeAccountId: stripeAccountId ?? "",
      isConnected: !!stripeAccountId,
    },
    validators: {
      onSubmit: (values) => {
        try {
          formSchema.parse(values);
          return {};
        } catch (e) {
          const zErr = e as z.ZodError;
          const errors: Record<string, string> = {};
          zErr.issues.forEach((err) => {
            const key = String(err.path?.[0] ?? "form");
            errors[key] = err.message;
          });
          return errors;
        }
      },
    },
    onSubmit: async ({ value }) => {
      toast("Form submitted", {
        description: (
          <pre className="bg-code text-code-foreground mt-2 w-[320px] overflow-x-auto rounded-md p-4">
            <code>{JSON.stringify(value, null, 2)}</code>
          </pre>
        ),
      });
    },
  });

  const [isLoading, setIsLoading] = React.useState(false);

  const formValues = form.state.values as FormType;
  const displayedStripeAccountId =
    formValues?.stripeAccountId ?? stripeAccountId ?? "";
  const isStripeConnected = formValues?.isConnected ?? !!stripeAccountId;

  const handleConnectStripe = async () => {
    try {
      setIsLoading(true);

      let currentStripeAccountId = displayedStripeAccountId;

      if (!currentStripeAccountId) {
        const createAccountRes = await createStripeConnectedAccount({});

        if (createAccountRes.error || !createAccountRes.data?.id) {
          toast.error(tCommon("error"), {
            description:
              createAccountRes.error || tStripe("failedToCreateStripeAccount"),
          });
          setIsLoading(false);
          return;
        }

        currentStripeAccountId = createAccountRes.data.id;
      }

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
        setIsLoading(false);
        return;
      }

      window.location.href = accountLinkRes.data.url;
    } catch (error) {
      console.error("Stripe Connect error:", error);
      toast.error(tCommon("error"), {
        description: tStripe("stripeConnectError"),
      });
      setIsLoading(false);
    }
  };

  const handleManageStripe = async () => {
    const currentStripeAccountId = displayedStripeAccountId;
    if (!currentStripeAccountId) {
      toast.error(tCommon("error"), {
        description: tStripe("noStripeAccountId"),
      });
      return;
    }

    try {
      setIsLoading(true);
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
        setIsLoading(false);
        return;
      }

      window.open(accountLinkRes.data.url, "_blank");
      setIsLoading(false);
    } catch (error) {
      console.error("Stripe manage error:", error);
      toast.error(tCommon("error"), {
        description: tStripe("stripeManageError"),
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full sm:max-w-lg">
      <CardHeader>
        <CardTitle>{tStripe("stripeIntegration")}</CardTitle>
        <CardDescription>
          {tStripe("stripeIntegrationDescription")}
        </CardDescription>
      </CardHeader>

      <CardPanel>
        <form
          id="connect-stripe-form"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="stripeAccountId"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <div data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {tStripe("connectionStatus")}
                    </FieldLabel>

                    <Input
                      id={field.name}
                      name={field.name}
                      value={String(displayedStripeAccountId ?? "")}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={tStripe("stripeAccountIdPlaceholder") ?? ""}
                      readOnly
                      aria-invalid={isInvalid}
                    />

                    <FieldDescription>
                      {isStripeConnected
                        ? tStripe("stripeConnectedDescription")
                        : tStripe("stripeNotConnectedDescription")}
                    </FieldDescription>

                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </div>
                );
              }}
            />
          </FieldGroup>
        </form>
      </CardPanel>

      <CardFooter>
        <Field orientation="horizontal">
          <div className="flex items-center gap-3">
            {!isStripeConnected ? (
              <Button
                type="button"
                onClick={handleConnectStripe}
                disabled={isLoading}
              >
                {isLoading
                  ? tStripe("connecting")
                  : tStripe("connectStripeAccount")}
              </Button>
            ) : (
              <>
                <Badge
                  variant="default"
                  className="flex items-center gap-2 px-3 py-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  {tStripe("connected")}
                </Badge>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleManageStripe}
                  disabled={isLoading}
                >
                  {tStripe("manageStripeAccount")}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleConnectStripe}
                  disabled={isLoading}
                >
                  {tStripe("reconnectStripeAccount")}
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              {tCommon("reset") ?? "Reset"}
            </Button>
          </div>
        </Field>
      </CardFooter>
    </Card>
  );
}
