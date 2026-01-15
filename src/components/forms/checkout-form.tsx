"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem } from "@/lib/types";
import { createCustomerOrder } from "@/server/actions/shopper/orders-actions";
import getStripe from "@/utils/get-stripe";
import { Separator } from "../ui/separator";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.email("Invalid email address"),
  customerPhone: z.string(),
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }),
  sameAsShipping: z.boolean(),
  notes: z.string(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  cartProducts: Array<CartItem & { quantity: number }>;
}

function CheckoutFormContent({ cartProducts }: CheckoutFormProps) {
  const t = useTranslations("store.checkout");
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const handleSubmit = async ({ value }: { value: CheckoutFormData }) => {
    if (!stripe || !elements) return;

    // setIsProcessing(true);

    try {
      const orderData = {
        customerEmail: value.customerEmail,
        customerName: value.customerName,
        customerPhone: value.customerPhone,
        shippingAddress: value.shippingAddress,
        billingAddress: value.sameAsShipping
          ? value.shippingAddress
          : value.billingAddress,
        items: cartProducts.map((product) => ({
          productId: product.id,
          quantity: product.quantity,
          unitPrice: (product.price || 0).toString(),
          discount: "0",
        })),
        guestCheckout: true,
        notes: value.notes,
      };

      const result = await createCustomerOrder(orderData);
      if (result.error || !result.data) {
        toast.error("Failed to create order. Please try again.");
        return;
      }
      setClientSecret(result.data.clientSecret);

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/store/checkout/success?order=${result.data.orderNumber}`,
        },
      });

      if (error) {
        toast.error(error.message || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const form = useForm({
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      billingAddress: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      sameAsShipping: true,
      notes: "",
    },
    validators: {
      onSubmit: checkoutSchema,
    },
    onSubmit: handleSubmit,
  });

  if (clientSecret) {
    return (
      <section className="space-y-6">
        <header className="border-b pb-8 px-4">
          <h2 className="mb-6 text-base font-medium">{t("paymentDetails")}</h2>
          <PaymentElement />
        </header>

        <footer className="px-4 flex gap-2">
          <Button
            disabled={isProcessing}
            onClick={() => setClientSecret(null)}
            variant="outline"
          >
            {t("backToForm")}
          </Button>
          <Button
            className="flex-1"
            disabled={!stripe || isProcessing}
            onClick={() => form.handleSubmit()}
          >
            {isProcessing ? t("processing") : t("completeOrder")}
          </Button>
        </footer>
      </section>
    );
  }

  return (
    <form
      className="space-y-4 border py-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <section className="px-4">
        <header className="mb-6">
          <h2 className="text-base font-medium">{t("customerInformation")}</h2>
        </header>

        <div className="space-y-4">
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("fullName")} *
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t("enterFullName")}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="customerName"
          />

          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("emailAddress")} *
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t("enterEmail")}
                    type="email"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="customerEmail"
          />

          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("phoneNumber")} *
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t("enterPhone")}
                    type="tel"
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="customerPhone"
          />
        </div>
      </section>

      <Separator />

      <section className="px-4">
        <header className="mb-6">
          <h2 className="text-base font-medium">{t("shippingAddress")}</h2>
        </header>

        <div className="space-y-4">
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("streetAddress")} *
                  </FieldLabel>
                  <Input
                    aria-invalid={isInvalid}
                    id={field.name}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t("enterStreetAddress")}
                    value={field.state.value}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="shippingAddress.street"
          />

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>{t("city")} *</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("enterCity")}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="shippingAddress.city"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>{t("state")}</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("enterState")}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="shippingAddress.state"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>
                      {t("postalCode")}
                    </FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("enterPostalCode")}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="shippingAddress.postalCode"
            />

            <form.Field
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>{t("country")}</FieldLabel>
                    <Input
                      aria-invalid={isInvalid}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={t("enterCountry")}
                      value={field.state.value}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
              name="shippingAddress.country"
            />
          </div>
        </div>
      </section>

      <Separator />

      <section className="px-4">
        <header className="mb-6">
          <h2 className="text-base font-medium">{t("billingAddress")}</h2>
        </header>

        <div className="space-y-4">
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    <Checkbox
                      aria-invalid={isInvalid}
                      checked={field.state.value}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onCheckedChange={(checked) =>
                        field.handleChange(checked as boolean)
                      }
                    />
                    {t("sameAsShipping")}
                  </FieldLabel>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="sameAsShipping"
          />

          <form.Subscribe
            selector={(state) => state.values.sameAsShipping}
            children={(sameAsShipping) => (
              <>
                {!sameAsShipping && (
                  <>
                    <form.Field
                      children={(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid;
                        return (
                          <Field data-invalid={isInvalid}>
                            <FieldLabel htmlFor={field.name}>
                              {t("streetAddress")}
                            </FieldLabel>
                            <Input
                              aria-invalid={isInvalid}
                              id={field.name}
                              name={field.name}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
                              placeholder={t("enterStreetAddress")}
                              value={field.state.value}
                            />
                            {isInvalid && (
                              <FieldError errors={field.state.meta.errors} />
                            )}
                          </Field>
                        );
                      }}
                      name="billingAddress.street"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <form.Field
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                {t("city")}
                              </FieldLabel>
                              <Input
                                aria-invalid={isInvalid}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder={t("enterCity")}
                                value={field.state.value}
                              />
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                        name="billingAddress.city"
                      />

                      <form.Field
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                {t("state")}
                              </FieldLabel>
                              <Input
                                aria-invalid={isInvalid}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder={t("enterState")}
                                value={field.state.value}
                              />
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                        name="billingAddress.state"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <form.Field
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                {t("postalCode")}
                              </FieldLabel>
                              <Input
                                aria-invalid={isInvalid}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder={t("enterPostalCode")}
                                value={field.state.value}
                              />
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                        name="billingAddress.postalCode"
                      />

                      <form.Field
                        children={(field) => {
                          const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid;
                          return (
                            <Field data-invalid={isInvalid}>
                              <FieldLabel htmlFor={field.name}>
                                {t("country")}
                              </FieldLabel>
                              <Input
                                aria-invalid={isInvalid}
                                id={field.name}
                                name={field.name}
                                onBlur={field.handleBlur}
                                onChange={(e) =>
                                  field.handleChange(e.target.value)
                                }
                                placeholder={t("enterCountry")}
                                value={field.state.value}
                              />
                              {isInvalid && (
                                <FieldError errors={field.state.meta.errors} />
                              )}
                            </Field>
                          );
                        }}
                        name="billingAddress.country"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          />
        </div>
      </section>

      <Separator />

      <section className="px-4">
        <header className="mb-6">
          <h2 className="text-base font-medium">{t("orderNotes")}</h2>
        </header>

        <form.Field
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>
                  {t("specialInstructions")}
                </FieldLabel>
                <Textarea
                  aria-invalid={isInvalid}
                  id={field.name}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={t("enterSpecialInstructions")}
                  rows={3}
                  value={field.state.value}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
          name="notes"
        />
      </section>

      <footer className="px-4 pt-4">
        <Button
          className="w-full"
          disabled={isProcessing || !form.state.isValid}
          type="submit"
        >
          {isProcessing ? t("processing") : t("proceedToPayment")}
        </Button>
      </footer>
    </form>
  );
}

export function CheckoutForm({ cartProducts }: CheckoutFormProps) {
  return (
    <Elements stripe={getStripe()}>
      <CheckoutFormContent cartProducts={cartProducts} />
    </Elements>
  );
}
