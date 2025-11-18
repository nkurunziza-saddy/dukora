"use client";

import { useForm } from "@tanstack/react-form";
import { Check, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCustomerPaymentLink } from "@/server/actions/payment-actions";

const paymentLinkSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  description: z.string().min(1, "Description is required"),
  customerEmail: z.string().email("Invalid email address"),
});

export default function CreateCustomerPaymentForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tPayments = useTranslations("payments");

  const form = useForm({
    defaultValues: {
      amount: 0,
      currency: "USD",
      description: "",
      customerEmail: "",
    },
    validators: {
      onSubmit: paymentLinkSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const { data, error } = await createCustomerPaymentLink({
          amount: value.amount,
          currency: value.currency,
          description: value.description,
          customerEmail: value.customerEmail,
        });

        if (error) {
          toast.error(tCommon("errorOccurred"));
          return;
        }

        if (data?.url) {
          // Copy payment link to clipboard
          await navigator.clipboard.writeText(data.url);
          toast.success(tPayments("paymentLinkCreated"));
        }
      } catch (error) {
        console.error("Failed to create payment link:", error);
        toast.error(tCommon("errorOccurred"));
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{t("description")}</FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tPayments("enterDescription")}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="description"
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t("amount")}</FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(parseFloat(e.target.value) || 0)
                    }
                    placeholder="0.00"
                    step="0.01"
                    type="number"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="amount"
          />
        </FieldGroup>

        <FieldGroup>
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>{t("currency")}</FieldLabel>
                  <Select
                    onValueChange={(value) => field.handleChange(value)}
                    value={field.state.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectPopup>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="RWF">RWF</SelectItem>
                      <SelectItem value="KES">KES</SelectItem>
                      <SelectItem value="TZS">TZS</SelectItem>
                    </SelectPopup>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="currency"
          />
        </FieldGroup>
      </div>

      <FieldGroup>
        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("customerEmail")} ({t("optional")})
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={tPayments("enterCustomerEmail")}
                  type="email"
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="customerEmail"
        />
      </FieldGroup>

      <Button
        className="w-full"
        disabled={form.state.isSubmitting}
        type="submit"
      >
        {form.state.isSubmitting ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            {t("creating")}...
          </>
        ) : (
          <>
            <Check className="mr-2 h-4 w-4" />
            {tPayments("createPaymentLink")}
          </>
        )}
      </Button>
    </form>
  );
}
