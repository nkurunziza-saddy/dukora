"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
    note: z.string().optional(),
    reference: z.string().optional(),
  });

  type ExpenseTransactionFormData = z.infer<typeof expenseTransactionSchema>;

  const form = useForm<ExpenseTransactionFormData>({
    resolver: zodResolver(expenseTransactionSchema),
    defaultValues: {
      amount: expenseTransaction ? expenseTransaction.amount : "",
      note: expenseTransaction ? expenseTransaction.note ?? "" : "",
      reference: expenseTransaction ? expenseTransaction.reference ?? "" : "",
    },
  });

  const onSubmit = async (data: ExpenseTransactionFormData) => {
    try {
      const formData = {
        amount: data.amount,
        note: data.note,
        reference: data.reference,
      };
      const req = await createExpense(formData);
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
      console.log(error);
      toast.error(tCommon("error"), {
        description: t("recordFailed"),
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
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("amount")} *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={t("enterAmount")}
                    min="1"
                    step="0.01"
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {tCommon("reference")} {t("poNumber")}
                </FormLabel>
                <FormControl>
                  <Input placeholder={t("referencePlaceholder")} {...field} />
                </FormControl>
                <FormDescription>{t("referenceDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("note")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("notePlaceholder")}
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
              }}
              disabled={isSubmitting}
            >
              {t("resetForm")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !form.formState.isValid}
              className="min-w-[140px]"
            >
              {isSubmitting ? (
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
    </Form>
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
