"use client";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, Check, Loader2 } from "lucide-react";
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
import { initiateInterBusinessPayment } from "@/server/actions/payment-actions";
import { useBusinesses } from "@/lib/hooks/use-queries";
import {
  Autocomplete,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  AutocompletePopup,
} from "../ui/autocomplete";

const paymentSchema = z.object({
  receiverBusinessId: z.string().min(1, "Receiver business is required"),
  amount: z.number().positive("Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  applicationFeeAmount: z
    .number()
    .positive("Application fee must be a positive number"),
});

export default function InitiatePaymentForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tPayments = useTranslations("payments");

  const {
    data: businessesData,
    error: businessesError,
    isLoading: isBusinessesLoading,
  } = useBusinesses();

  const form = useForm({
    defaultValues: {
      receiverBusinessId: "",
      amount: 0,
      currency: "USD",
      applicationFeeAmount: 0,
    },
    validators: {
      onSubmit: paymentSchema,
    },
    onSubmit: async ({ value }) => {
      const res = await initiateInterBusinessPayment({
        ...value,
        applicationFeeAmount: value.applicationFeeAmount || undefined,
      });
      if (res.data) {
        toast.success(tPayments("paymentInitiated"), {
          description: tPayments("paymentInitiatedDescription"),
        });
        form.reset();
      } else {
        toast.error(tCommon("error"), {
          description: res.error || tPayments("paymentInitiationFailed"),
        });
      }
    },
  });

  if (!businessesData || businessesError) {
    return (
      <Alert variant="error">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadBusinesses")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FieldGroup>
        <form.Field
          name="receiverBusinessId"
          children={(field) => (
            <Field>
              <FieldLabel>{tPayments("receiverBusiness")} *</FieldLabel>
              {isBusinessesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {tCommon("loading")}
                  </span>
                </div>
              ) : businessesData ? (
                <Autocomplete
                  items={businessesData.map((b) => ({
                    value: b.id,
                    label: b.name,
                    ...b,
                  }))}
                  onValueChange={(item) => {
                    if (item) {
                      field.handleChange(item);
                    }
                  }}
                  value={field.state.value || undefined}
                  virtualized
                >
                  <AutocompleteInput
                    placeholder={tPayments("searchBusinesses")}
                  />
                  <AutocompletePopup>
                    <AutocompleteEmpty>
                      {tPayments("noOtherBusinesses")}
                    </AutocompleteEmpty>
                    <AutocompleteList>
                      {(business) => (
                        <AutocompleteItem key={business.id} value={business}>
                          <div className="flex items-center gap-8 justify-between w-full">
                            <div className="flex gap-1">
                              <span className="font-medium">
                                {business.name}
                              </span>
                              -
                              <span className="font-medium">{business.id}</span>
                            </div>
                            <Check
                              className={
                                business.id === field.state.value
                                  ? "h-4 w-4 opacity-100"
                                  : "h-4 w-4 opacity-0"
                              }
                            />
                          </div>
                        </AutocompleteItem>
                      )}
                    </AutocompleteList>
                  </AutocompletePopup>
                </Autocomplete>
              ) : null}
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="amount"
          children={(field) => (
            <Field>
              <FieldLabel>{tPayments("amount")}</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder={tPayments("enterAmount")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="currency"
          children={(field) => (
            <Field>
              <FieldLabel>{tPayments("currency")}</FieldLabel>
              <Select
                onValueChange={field.handleChange}
                defaultValue={field.state.value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                </SelectPopup>
              </Select>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <form.Field
          name="applicationFeeAmount"
          children={(field) => (
            <Field>
              <FieldLabel>{tPayments("applicationFee")}</FieldLabel>
              <Input
                type="number"
                step="0.01"
                placeholder={tPayments("enterApplicationFee")}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        />

        <Button type="submit" disabled={form.state.isSubmitting}>
          {form.state.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tCommon("submitting")}...
            </>
          ) : (
            tPayments("initiatePayment")
          )}
        </Button>
      </FieldGroup>
    </form>
  );
}
