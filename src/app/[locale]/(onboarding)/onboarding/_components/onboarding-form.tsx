"use client";

import { useForm } from "@tanstack/react-form";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { Switch } from "@/components/ui/switch";
import { UserRole } from "@/lib/schema/schema-types";
import { defaultCategories, userRolesObject } from "@/utils/constants";
import LocaleSwitcher from "./language-switcher";
import {
  getBusinessTypes,
  getCountries,
  getCurrencies,
  getMonths,
  INVITATIONS_LIMIT,
  onboardingSchema,
  steps,
  WAREHOUSES_LIMIT,
} from "./onboarding-utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { businessInitialization } from "@/server/actions/onboarding-actions";

const CATEGORY_LIMIT = 10;

export default function OnboardingFlow() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const [currentStep, setCurrentStep] = useState(1);
  const [newCategory, setNewCategory] = useState("");

  const form = useForm({
    defaultValues: {
      businessName: "",
      businessType: "",
      currency: "RWF",
      country: "RW",
      timezone: "Africa/Kigali",
      fiscalStartMonth: "1",
      pricesIncludeTax: false,
      defaultVatRate: "",
      teamMembers: [] as Array<{ email: string; role: UserRole }>,
      categories: [] as string[],
      warehouses: [{ name: "Main Warehouse", isDefault: true }],
    },
    validators: {
      onBlur: onboardingSchema,
    },
    onSubmit: async ({ value }) => {
      if (currentStep !== steps.length) {
        return;
      }

      try {
        const req = await businessInitialization(value);
        if (req.data) {
          form.reset();
          toast.success(tCommon("redirecting"), {});
        } else {
          toast.error(tCommon("error"), {
            description: req.error?.split("_").join(" ").toLowerCase(),
          });
        }
      } catch (error) {
        console.error("Onboarding error:", error);
        toast.error("Setup failed. Check console for details.");
      }
    },
    onSubmitInvalid({ formApi }) {
      const errorMap = formApi.state.errorMap.onChange!;
      const inputs = Array.from(
        document.querySelectorAll("#onboarding-form input")
      ) as HTMLInputElement[];

      let firstInput: HTMLInputElement | undefined;
      for (const input of inputs) {
        if (!!errorMap[input.name]) {
          firstInput = input;
          break;
        }
      }
      firstInput?.focus();
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);

    let isValid = true;
    for (const fieldName of fieldsToValidate) {
      const field = form.getFieldMeta(fieldName as any);
      if (field?.errors && field.errors.length > 0) {
        isValid = false;
        break;
      }
    }

    if (isValid && currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(1, s - 1));
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return [
          "businessName",
          "businessType",
          "currency",
          "country",
          "timezone",
          "fiscalStartMonth",
        ];
      case 2:
        return ["pricesIncludeTax", "defaultVatRate"];
      case 3:
        return ["teamMembers"];
      case 4:
        return ["categories"];
      case 5:
        return ["warehouses"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <CardHeader className="mb-8 px-0">
          <CardTitle>Welcome to Your Inventory System</CardTitle>
          <CardDescription>
            Let&apos;s set up your business in just a few steps
          </CardDescription>
        </CardHeader>

        <div className="mb-8">
          <Stepper value={currentStep} onValueChange={setCurrentStep}>
            {steps.map(({ step, title }) => (
              <StepperItem
                key={step}
                step={step}
                className="not-last:flex-1 max-md:items-start"
              >
                <StepperTrigger className="rounded hover:cursor-pointer max-md:flex-col">
                  <StepperIndicator />
                  <div className="text-center md:text-left">
                    <StepperTitle className="flex items-center gap-2">
                      {title}
                    </StepperTitle>
                  </div>
                </StepperTrigger>
                {step < steps.length && (
                  <StepperSeparator className="max-md:mt-3.5 md:mx-4" />
                )}
              </StepperItem>
            ))}
          </Stepper>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <div className="flex flex-col gap-2">
                <CardTitle className="flex items-center gap-2">
                  {steps.find((s) => s.step === currentStep)?.title}
                </CardTitle>
                <CardDescription>
                  {steps.find((s) => s.step === currentStep)?.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <form
            id="onboarding-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-6"
          >
            <CardPanel>
              {currentStep === 1 && (
                <div className="space-y-4">
                  <form.Field name="businessName">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <div className="space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Business Name *
                          </label>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="Enter your business name"
                            aria-invalid={isInvalid}
                            autoComplete="off"
                          />
                          {isInvalid && (
                            <p className="text-sm text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </form.Field>

                  <form.Field name="businessType">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;

                      return (
                        <div className="space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Business Type *
                          </label>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => field.handleChange(value)}
                            items={getBusinessTypes(t)}
                          >
                            <SelectTrigger id={field.name}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectPopup alignItemWithTrigger={false}>
                              {getBusinessTypes(t).map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectPopup>
                          </Select>
                          {isInvalid && (
                            <p className="text-sm text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </form.Field>

                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <form.Field name="currency">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0;
                        return (
                          <div className="space-y-2">
                            <label
                              htmlFor={field.name}
                              className="text-sm font-medium"
                            >
                              Currency *
                            </label>
                            <Select
                              value={field.state.value}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
                              items={getCurrencies(t)}
                            >
                              <SelectTrigger id={field.name}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectPopup>
                                {getCurrencies(t).map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            {isInvalid && (
                              <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        );
                      }}
                    </form.Field>

                    <form.Field name="country">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0;
                        return (
                          <div className="space-y-2">
                            <label
                              htmlFor={field.name}
                              className="text-sm font-medium"
                            >
                              Country *
                            </label>
                            <Select
                              value={field.state.value}
                              onValueChange={(value) => {
                                field.handleChange(value);
                                const country = getCountries(t).find(
                                  (c) => c.value === value
                                );
                                if (country) {
                                  form.setFieldValue(
                                    "timezone",
                                    country.timezone
                                  );
                                }
                              }}
                              items={getCountries(t)}
                            >
                              <SelectTrigger id={field.name}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectPopup>
                                {getCountries(t).map((country) => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            {isInvalid && (
                              <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        );
                      }}
                    </form.Field>
                  </FieldGroup>

                  <FieldGroup className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                    <form.Field name="timezone">
                      {(field) => (
                        <div className="space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Timezone
                          </label>
                          <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            disabled
                          />
                          <p className="text-sm text-muted-foreground">
                            Auto-filled based on selected country
                          </p>
                        </div>
                      )}
                    </form.Field>

                    <form.Field name="fiscalStartMonth">
                      {(field) => {
                        const isInvalid =
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0;
                        return (
                          <div className="space-y-2">
                            <label
                              htmlFor={field.name}
                              className="text-sm font-medium"
                            >
                              Fiscal Year Start Month *
                            </label>
                            <Select
                              value={field.state.value}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
                              items={getMonths(t)}
                            >
                              <SelectTrigger id={field.name}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectPopup>
                                {getMonths(t).map((month) => (
                                  <SelectItem
                                    key={month.value}
                                    value={month.value}
                                  >
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            {isInvalid && (
                              <p className="text-sm text-destructive">
                                {field.state.meta.errors.join(", ")}
                              </p>
                            )}
                          </div>
                        );
                      }}
                    </form.Field>
                  </FieldGroup>
                </div>
              )}

              {currentStep === 2 && (
                <FieldGroup className="space-y-6">
                  <form.Field name="pricesIncludeTax">
                    {(field) => (
                      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <label
                            htmlFor="pricesIncludeTax"
                            className="text-base font-medium"
                          >
                            Prices Include Tax
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Toggle whether your product prices include tax or
                            are tax-exclusive
                          </p>
                        </div>
                        <Switch
                          id="pricesIncludeTax"
                          checked={field.state.value}
                          onCheckedChange={(checked) =>
                            field.handleChange(checked)
                          }
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="defaultVatRate">
                    {(field) => {
                      const isInvalid =
                        field.state.meta.isTouched &&
                        field.state.meta.errors.length > 0;
                      return (
                        <div className="space-y-2">
                          <label
                            htmlFor={field.name}
                            className="text-sm font-medium"
                          >
                            Default VAT Rate (%)
                          </label>
                          <Input
                            id={field.name}
                            name={field.name}
                            type="number"
                            step="0.01"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g., 18"
                          />
                          <p className="text-sm text-muted-foreground">
                            Optional: Set a default VAT rate for your products
                          </p>
                          {isInvalid && (
                            <p className="text-sm text-destructive">
                              {field.state.meta.errors.join(", ")}
                            </p>
                          )}
                        </div>
                      );
                    }}
                  </form.Field>
                </FieldGroup>
              )}

              {currentStep === 3 && (
                <form.Field name="teamMembers" mode="array">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          Add up to {INVITATIONS_LIMIT} team invitations.
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          {(field.state.value || []).map(
                            (_: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-1 items-start"
                              >
                                <form.Field
                                  name={`teamMembers[${index}].email` as any}
                                >
                                  {(subField) => {
                                    const isSubFieldInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        orientation="horizontal"
                                        data-invalid={isSubFieldInvalid}
                                      >
                                        <FieldContent>
                                          <InputGroup>
                                            <InputGroupInput
                                              id={`onboarding-form-teamMember-email-${index}`}
                                              name={subField.name}
                                              value={subField.state.value}
                                              onBlur={subField.handleBlur}
                                              aria-invalid={isSubFieldInvalid}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value as any
                                                )
                                              }
                                              placeholder="name@example.com"
                                              type="email"
                                              autoComplete="email"
                                            />
                                          </InputGroup>
                                          {isSubFieldInvalid && (
                                            <FieldError
                                              errors={
                                                subField.state.meta.errors
                                              }
                                            />
                                          )}
                                        </FieldContent>
                                      </Field>
                                    );
                                  }}
                                </form.Field>

                                <form.Field
                                  name={`teamMembers[${index}].role` as any}
                                >
                                  {(subField) => {
                                    const isSubFieldInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        orientation="horizontal"
                                        data-invalid={isSubFieldInvalid}
                                        className="w-48"
                                      >
                                        <FieldContent>
                                          <Select
                                            value={subField.state.value}
                                            onValueChange={(value) =>
                                              subField.handleChange(
                                                value as any
                                              )
                                            }
                                          >
                                            <SelectTrigger id={subField.name}>
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectPopup
                                              alignItemWithTrigger={false}
                                            >
                                              {userRolesObject.map((role) => (
                                                <SelectItem
                                                  key={role.value}
                                                  value={role.value}
                                                >
                                                  {role.label}
                                                </SelectItem>
                                              ))}
                                            </SelectPopup>
                                          </Select>
                                          {isSubFieldInvalid && (
                                            <FieldError
                                              errors={
                                                subField.state.meta.errors
                                              }
                                            />
                                          )}
                                        </FieldContent>
                                      </Field>
                                    );
                                  }}
                                </form.Field>

                                <div>
                                  {(field.state.value || []).length > 1 && (
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton
                                        type="button"
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => field.removeValue(index)}
                                        aria-label={`Remove teammember ${
                                          index + 1
                                        }`}
                                      >
                                        <XIcon />
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  )}
                                </div>
                              </div>
                            )
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            onClick={() =>
                              field.pushValue({
                                email: "",
                                role: UserRole.MEMBER,
                              })
                            }
                            disabled={
                              (field.state.value || []).length >=
                              INVITATIONS_LIMIT
                            }
                          >
                            Add member
                          </Button>
                        </FieldGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldSet>
                    );
                  }}
                </form.Field>
              )}

              {currentStep === 4 && (
                <form.Field name="categories" mode="array">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const currentCategories = field.state.value || [];

                    const toggleCategory = (category: string) => {
                      const idx = currentCategories.indexOf(category);
                      if (idx >= 0) {
                        field.removeValue(idx);
                      } else {
                        if (currentCategories.length >= CATEGORY_LIMIT) {
                          toast.error(
                            `You can select up to ${CATEGORY_LIMIT} categories.`
                          );
                          return;
                        }
                        field.pushValue(category);
                      }
                    };

                    const handleAddCustom = () => {
                      const trimmed = newCategory.trim();
                      if (!trimmed) return;
                      if (currentCategories.includes(trimmed)) {
                        toast.error("Category already added");
                        return;
                      }
                      if (currentCategories.length >= CATEGORY_LIMIT) {
                        toast.error(
                          `You can select up to ${CATEGORY_LIMIT} categories.`
                        );
                        return;
                      }
                      field.pushValue(trimmed);
                      setNewCategory("");
                    };

                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          Make your own product categories
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {defaultCategories.map((category) => {
                              const isSelected = currentCategories.some(
                                (c: any) => c === category
                              );
                              return (
                                <button
                                  type="button"
                                  key={category}
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors w-full text-left flex items-center justify-between ${
                                    isSelected ? "border bg-muted/70" : ""
                                  }`}
                                  onClick={() => toggleCategory(category)}
                                  aria-pressed={isSelected}
                                >
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">
                                      {category}
                                    </h5>
                                  </div>
                                  <div className="ml-3 text-sm">
                                    {isSelected ? "Selected" : "Add"}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-2 items-center">
                            <Input
                              id="new-category"
                              value={newCategory}
                              onChange={(e) => setNewCategory(e.target.value)}
                              placeholder="Add custom category (e.g., Food)"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustom();
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={handleAddCustom}
                              variant="outline"
                              size="sm"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="ml-auto text-sm text-muted-foreground tabular-nums">
                            {currentCategories.length} / {CATEGORY_LIMIT}
                          </div>
                          {currentCategories.length > 0 && (
                            <div className="flex gap-0.5 flex-wrap">
                              {currentCategories.map(
                                (cat: any, idx: number) => (
                                  <Button
                                    key={`${cat}-${idx}`}
                                    type="button"
                                    variant="outline"
                                    size="xs"
                                    onClick={() => field.removeValue(idx)}
                                    aria-label={`Remove category ${idx + 1}`}
                                  >
                                    <span className="">
                                      {cat}{" "}
                                      <XIcon className="inline-block ml-1" />
                                    </span>
                                  </Button>
                                )
                              )}
                            </div>
                          )}
                        </FieldGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldSet>
                    );
                  }}
                </form.Field>
              )}

              {currentStep === 5 && (
                <form.Field name="warehouses" mode="array">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const handleSetDefault = (index: number) => {
                      const newArr = (field.state.value || []).map(
                        (w: any, i: number) => ({
                          ...w,
                          isDefault: i === index,
                        })
                      );
                      if (!newArr.some((w: any) => w.isDefault)) {
                        newArr[0].isDefault = true;
                      }
                      field.setValue(newArr);
                    };

                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          Add up to {WAREHOUSES_LIMIT} warehouses.
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          {field.state.value.map((_, index) => (
                            <div
                              key={index}
                              className="flex gap-1 items-center"
                            >
                              <form.Field name={`warehouses[${index}].name`}>
                                {(subField) => {
                                  const isSubFieldInvalid =
                                    subField.state.meta.isTouched &&
                                    !subField.state.meta.isValid;
                                  return (
                                    <Field
                                      orientation="horizontal"
                                      data-invalid={isSubFieldInvalid}
                                    >
                                      <FieldContent>
                                        <InputGroup>
                                          <InputGroupInput
                                            id={`onboarding-form-warehouse-name-${index}`}
                                            name={subField.name}
                                            value={subField.state.value}
                                            onBlur={subField.handleBlur}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value
                                              )
                                            }
                                            aria-invalid={isSubFieldInvalid}
                                            placeholder="Gishushu Branch"
                                          />
                                        </InputGroup>
                                        {isSubFieldInvalid && (
                                          <FieldError
                                            errors={subField.state.meta.errors}
                                          />
                                        )}
                                      </FieldContent>
                                    </Field>
                                  );
                                }}
                              </form.Field>

                              <Button
                                id={`warehouse-default-${index}`}
                                type="button"
                                variant={
                                  field.state.value[index]?.isDefault === true
                                    ? "default"
                                    : "outline"
                                }
                                className="w-fit"
                                size="sm"
                                onClick={() => handleSetDefault(index)}
                              >
                                {field.state.value[index]?.isDefault === true
                                  ? "Is Default"
                                  : "Set Default"}
                              </Button>

                              <div>
                                {(field.state.value || []).length > 1 && (
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      type="button"
                                      variant="ghost"
                                      size="icon-xs"
                                      onClick={() => field.removeValue(index)}
                                      aria-label={`Remove warehouse ${
                                        index + 1
                                      }`}
                                    >
                                      <XIcon />
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                )}
                              </div>
                            </div>
                          ))}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-fit"
                            onClick={() =>
                              field.pushValue({ name: "", isDefault: false })
                            }
                            disabled={
                              (field.state.value || []).length >=
                              WAREHOUSES_LIMIT
                            }
                          >
                            Add warehouse
                          </Button>
                        </FieldGroup>

                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </FieldSet>
                    );
                  }}
                </form.Field>
              )}

              <Separator className={"my-4"} />
            </CardPanel>
            <CardFooter>
              <Field orientation="horizontal" className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>

                {currentStep < steps.length && (
                  <Button type="button" onClick={nextStep}>
                    Next
                  </Button>
                )}

                {currentStep === steps.length && (
                  <Button
                    type="submit"
                    form="onboarding-form"
                    disabled={form.state.isSubmitting}
                  >
                    {form.state.isSubmitting
                      ? "Setting up..."
                      : "Complete Setup"}
                  </Button>
                )}
              </Field>
            </CardFooter>
          </form>
        </Card>
      </div>

      <div className="absolute bottom-2 right-2">
        <LocaleSwitcher />
      </div>
    </div>
  );
}
