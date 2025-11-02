"use client";

import { useForm } from "@tanstack/react-form";
import { AlertCircleIcon, Check, Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  customerEmail: z.string().email("Invalid email address").optional(),
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
    onSubmit: async ({ value }) => {
      try {
        const validatedData = paymentLinkSchema.parse(value);

        const { data, error } = await createCustomerPaymentLink({
          amount: validatedData.amount,
          currency: validatedData.currency,
          description: validatedData.description,
          customerEmail: validatedData.customerEmail,
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
        <Field
          name={form.getFieldValue("description")}
          valid={form.state.errors.description}
        >
          <FieldLabel>{t("description")}</FieldLabel>
          <Input
            onChange={(e) => form.setFieldValue("description", e.target.value)}
            placeholder={tPayments("enterDescription")}
            value={form.getFieldValue("description")}
          />
          <FieldError>{form.state.errors.description}</FieldError>
        </Field>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup>
          <Field
            name={form.getFieldValue("amount")}
            valid={form.state.errors.amount}
          >
            <FieldLabel>{t("amount")}</FieldLabel>
            <Input
              onChange={(e) =>
                form.setFieldValue("amount", parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
              step="0.01"
              type="number"
              value={form.getFieldValue("amount")}
            />
            <FieldError>{form.state.errors.amount}</FieldError>
          </Field>
        </FieldGroup>

        <FieldGroup>
          <Field
            name={form.getFieldValue("currency")}
            valid={form.state.errors.currency}
          >
            <FieldLabel>{t("currency")}</FieldLabel>
            <Select
              onValueChange={(value) => form.setFieldValue("currency", value)}
              value={form.getFieldValue("currency")}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("selectCurrency")} />
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
            <FieldError>{form.state.errors.currency}</FieldError>
          </Field>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Field
          name={form.getFieldValue("customerEmail")}
          valid={form.state.errors.customerEmail}
        >
          <FieldLabel>
            {t("customerEmail")} ({t("optional")})
          </FieldLabel>
          <Input
            onChange={(e) =>
              form.setFieldValue("customerEmail", e.target.value)
            }
            placeholder={tPayments("enterCustomerEmail")}
            type="email"
            value={form.getFieldValue("customerEmail")}
          />
          <FieldError>{form.state.errors.customerEmail}</FieldError>
        </Field>
      </FieldGroup>

      {form.state.errors.root && (
        <Alert variant="error">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertDescription>{form.state.errors.root}</AlertDescription>
        </Alert>
      )}

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
