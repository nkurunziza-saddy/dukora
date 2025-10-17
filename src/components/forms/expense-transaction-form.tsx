"use client";

import { useForm } from "@tanstack/react-form";
import z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";
import type { SelectExpense } from "@/lib/schema/schema-types";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { createExpense } from "@/server/actions/expense-actions";

export default function ExpenseTransactionForm({
  expenseTransaction,
}: {
  expenseTransaction?: SelectExpense;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tInventory = useTranslations("inventory");
  const expenseTransactionSchema = z.object({
    amount: z.string().refine((val) => {
      const num = Number.parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, t("amountPositive")),
    note: z.string(),
    reference: z.string(),
  });

  const form = useForm({
    defaultValues: {
      amount: expenseTransaction ? expenseTransaction.amount : "",
      note: expenseTransaction ? expenseTransaction.note ?? "" : "",
      reference: expenseTransaction ? expenseTransaction.reference ?? "" : "",
    },
    validators: {
      onSubmit: expenseTransactionSchema,
      onChange: expenseTransactionSchema,
      onBlur: expenseTransactionSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        const req = await createExpense(value);
        if (req.data) {
          form.reset();
          toast.success(t("expenseRecorded"), {
            description: format(new Date(), "MMM dd, yyyy"),
          });
        } else {
          toast.error(tCommon("error"), {
            description: req.error?.split("_").join(" ").toLowerCase(),
          });
        }
      } catch (error) {
        console.error(error);
        toast.error(tCommon("error"), {
          description: t("recordFailed"),
        });
      }
    },
  });

  return (
    <form
      id="expense-transaction-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup className="space-y-4">
        <Separator />

        <form.Field
          name="amount"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {tCommon("amount")} *
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  type="number"
                  placeholder={t("enterAmount")}
                  min="1"
                  step="0.01"
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="reference"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {tCommon("reference")} {t("poNumber")}
                </FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("referencePlaceholder")}
                  aria-invalid={isInvalid}
                />
                <FieldDescription>{t("referenceDescription")}</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />

        <form.Field
          name="note"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{tCommon("note")}</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  rows={3}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.reset();
            }}
            disabled={form.state.isSubmitting}
          >
            {t("resetForm")}
          </Button>
          <Button
            type="submit"
            form="expense-transaction-form"
            disabled={form.state.isSubmitting || !form.state.isValid}
            className="min-w-[140px]"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {expenseTransaction ? t("updating") : t("recording")}
              </>
            ) : (
              <>
                {expenseTransaction ? t("update") : t("record")}{" "}
                {tInventory("title").split(" ")[0]}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

export const CreateExpenseTransactionDialog = () => {
  const t = useTranslations("forms");
  return (
    <TriggerDialog
      title={t("recordExpenseTransaction")}
      triggerText={t("recordExpense")}
      description={t("recordExpenseDescription")}
    >
      <ExpenseTransactionForm />
    </TriggerDialog>
  );
};
