"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { CheckCircleIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import {
  createStripeAccountLink,
  createStripeConnectedAccount,
} from "@/server/actions/stripe-connect-actions";
import { stripeConnectSchema } from "./settings-utils";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      onBlur: stripeConnectSchema,
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

  const formValues = form.state.values;
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
    <div>
      <form
        id="connect-stripe-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field name="stripeAccountId">
            {(field) => (
              <Field
                data-invalid={
                  field.state.meta.isTouched && !field.state.meta.isValid
                }
              >
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
                  aria-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                />

                <FieldDescription>
                  {isStripeConnected
                    ? tStripe("stripeConnectedDescription")
                    : tStripe("stripeNotConnectedDescription")}
                </FieldDescription>

                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        </FieldGroup>
      </form>

      <div className="mt-6">
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
                <CheckCircleIcon className="h-4 w-4" />
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
      </div>
    </div>
  );
}
