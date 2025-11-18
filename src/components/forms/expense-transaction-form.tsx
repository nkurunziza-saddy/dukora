"use client";

import { useForm } from "@tanstack/react-form";
import { format } from "date-fns";
import { Loader2Icon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { SelectExpense } from "@/lib/schema/schema-types";
import { createExpense } from "@/server/actions/expense-actions";
import { TriggerDialog } from "../shared/reusable-form-dialog";
import { Separator } from "../ui/separator";

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
      return !Number.isNaN(num) && num >= 0;
    }, t("amountPositive")),
    note: z.string(),
    reference: z.string(),
  });

  const form = useForm({
    defaultValues: {
      amount: expenseTransaction ? expenseTransaction.amount : "",
      note: expenseTransaction ? (expenseTransaction.note ?? "") : "",
      reference: expenseTransaction ? (expenseTransaction.reference ?? "") : "",
    },
    validators: {
      onSubmit: expenseTransactionSchema,
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
      className="space-y-6"
      id="expense-transaction-form"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <Separator />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {tCommon("amount")} *
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  min="1"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterAmount")}
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

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {tCommon("reference")} {t("poNumber")}
                </FieldLabel>
                <Input
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("referencePlaceholder")}
                  value={field.state.value}
                />
                <FieldDescription>{t("referenceDescription")}</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="reference"
        />

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>{tCommon("note")}</FieldLabel>
                <Textarea
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  rows={3}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="note"
        />
      </FieldGroup>

      <div className="flex justify-end pt-6 border-t">
        <div className="flex gap-3">
          <Button
            disabled={form.state.isSubmitting}
            onClick={() => {
              form.reset();
            }}
            type="button"
            variant="outline"
          >
            {t("resetForm")}
          </Button>
          <Button
            className="min-w-[140px]"
            disabled={form.state.isSubmitting || !form.state.isValid}
            form="expense-transaction-form"
            type="submit"
          >
            {form.state.isSubmitting ? (
              <>
                <Loader2Icon className="size-3.5 animate-spin" />
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
      description={t("recordExpenseDescription")}
      title={t("recordExpenseTransaction")}
      triggerText={t("recordExpense")}
    >
      <ExpenseTransactionForm />
    </TriggerDialog>
  );
};
