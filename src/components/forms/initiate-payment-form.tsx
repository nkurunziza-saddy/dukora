"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Loader2, AlertCircle, ChevronDown, Check } from "lucide-react";
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
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { initiateInterBusinessPayment } from "@/server/actions/payment-actions";
import { Select } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { SelectBusiness } from "@/lib/schema/schema-types";
import { fetcher } from "@/lib/utils";
import { preload } from "swr";
import useSwr from "swr";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "../ui/badge";

if (typeof window !== "undefined") {
  preload("/api/businesses", fetcher);
}

const paymentSchema = z.object({
  receiverBusinessId: z.string().min(1, "Receiver business is required"),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  currency: z.string().min(1, "Currency is required"),
  applicationFeeAmount: z.coerce
    .number()
    .positive("Application fee must be a positive number")
    .optional()
    .or(z.literal("")),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function InitiatePaymentForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tPayments = useTranslations("payments");

  const {
    data: businessesData,
    error: businessesError,
    isLoading: isBusinessesLoading,
  } = useSwr<SelectBusiness[]>("/api/businesses", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiverBusinessId: "",
      amount: 0,
      currency: "USD",
      applicationFeeAmount: undefined,
    },
  });

  const onSubmit = async (values: PaymentFormValues) => {
    const res = await initiateInterBusinessPayment({
      ...values,
      applicationFeeAmount:
        typeof values.applicationFeeAmount === "string" &&
        values.applicationFeeAmount === ""
          ? undefined
          : Number(values.applicationFeeAmount),
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
  };

  const { isSubmitting } = form.formState;

  if (!businessesData || businessesError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("failedToLoadBusinesses")}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="receiverBusinessId"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-2">
              <FormLabel>{tPayments("receiverBusiness")} *</FormLabel>
              {isBusinessesLoading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    {tCommon("loading")}
                  </span>
                </div>
              ) : businessesData ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={
                          !field.value
                            ? "text-muted-foreground justify-between"
                            : "justify-between"
                        }
                      >
                        {field.value ? (
                          <div className="flex gap-4">
                            <span className="flex items-center gap-2">
                              {
                                businessesData.find((b) => b.id === field.value)
                                  ?.name
                              }
                            </span>

                            <Badge
                              className="flex items-center gap-2"
                              variant={"secondary"}
                            >
                              {
                                businessesData.find((b) => b.id === field.value)
                                  ?.id
                              }
                            </Badge>
                          </div>
                        ) : (
                          tPayments("selectReceiverBusiness")
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={tPayments("searchBusinesses")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {tPayments("noOtherBusinesses")}
                        </CommandEmpty>
                        <CommandGroup>
                          {businessesData.map((business) => (
                            <CommandItem
                              key={business.id}
                              onSelect={() => {
                                form.setValue(
                                  "receiverBusinessId",
                                  business.id
                                );
                              }}
                            >
                              <div className="flex items-center gap-8 justify-between w-full">
                                <div className="flex gap-1">
                                  <span className="font-medium">
                                    {business.name}
                                  </span>
                                  -
                                  <span className="font-medium">
                                    {business.id}
                                  </span>
                                </div>
                                <Check
                                  className={
                                    business.id === field.value
                                      ? "h-4 w-4 opacity-100"
                                      : "h-4 w-4 opacity-0"
                                  }
                                />
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tPayments("amount")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={tPayments("enterAmount")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tPayments("currency")}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={tPayments("selectCurrency")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="RWF">RWF</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="applicationFeeAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tPayments("applicationFee")}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={tPayments("enterApplicationFee")}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {tCommon("submitting")}...
            </>
          ) : (
            tPayments("initiatePayment")
          )}
        </Button>
      </form>
    </Form>
  );
}
