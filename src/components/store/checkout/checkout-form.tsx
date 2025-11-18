"use client";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useForm } from "@tanstack/react-form";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardPanel, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { CartItem } from "@/lib/types";
import { createCustomerOrder } from "@/server/actions/customer-order-actions";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
);

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address"),
  customerPhone: z.string(),
  shippingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),
  billingAddress: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
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

    setIsProcessing(true);

    try {
      // Prepare order data
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

      // Create order and get client secret
      const result = await createCustomerOrder(orderData);
      if (result.error || !result.data) {
        toast.error("Failed to create order. Please try again.");
        return;
      }

      setClientSecret(result.data.clientSecret);

      // Confirm payment
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

  const sameAsShipping = form.state.values.sameAsShipping;

  if (clientSecret) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("paymentDetails")}</CardTitle>
          </CardHeader>
          <CardPanel>
            <PaymentElement />
            <div className="mt-4 flex space-x-2">
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
            </div>
          </CardPanel>
        </Card>
      </div>
    );
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>{t("customerInformation")}</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
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
        </CardPanel>
      </Card>

      {/* Shipping Address */}
      <Card>
        <CardHeader>
          <CardTitle>{t("shippingAddress")}</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
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
        </CardPanel>
      </Card>

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle>{t("billingAddress")}</CardTitle>
        </CardHeader>
        <CardPanel className="space-y-4">
          <form.Field
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>
                    {t("sameAsShipping")}
                  </FieldLabel>
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
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
            name="sameAsShipping"
          />

          {!sameAsShipping && (
            <>
              <form.Field
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
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
                        onChange={(e) => field.handleChange(e.target.value)}
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
                      field.state.meta.isTouched && !field.state.meta.isValid;
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
                  name="billingAddress.city"
                />

                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
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
                  name="billingAddress.state"
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
                  name="billingAddress.postalCode"
                />

                <form.Field
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
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
                  name="billingAddress.country"
                />
              </div>
            </>
          )}
        </CardPanel>
      </Card>

      {/* Order Notes */}
      <Card>
        <CardHeader>
          <CardTitle>{t("orderNotes")}</CardTitle>
        </CardHeader>
        <CardPanel>
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
        </CardPanel>
      </Card>

      <Button
        className="w-full"
        disabled={isProcessing || !form.state.isValid}
        type="submit"
      >
        {isProcessing ? t("processing") : t("proceedToPayment")}
      </Button>
    </form>
  );
}

export function CheckoutForm({ cartProducts }: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent cartProducts={cartProducts} />
    </Elements>
  );
}
