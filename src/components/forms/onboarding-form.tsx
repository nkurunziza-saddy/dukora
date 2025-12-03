"use client";

import { useForm } from "@tanstack/react-form";
import { XIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
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
import { businessInitialization } from "@/server/actions/onboarding-actions";
import { defaultCategories, userRolesObject } from "@/utils/constants";
import LocaleSwitcher from "./language-switcher";
import {
  CATEGORY_LIMIT,
  getBusinessTypes,
  getCountries,
  getCurrencies,
  getMonths,
  getSteps,
  INVITATIONS_LIMIT,
  onboardingSchema,
  type OnboardingFormData,
  WAREHOUSES_LIMIT,
} from "./onboarding-utils";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "onboarding-form-data";

export default function OnboardingForm() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const tOnboarding = useTranslations("onboarding");
  const steps = getSteps(tOnboarding);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [newCategory, setNewCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    } as OnboardingFormData,
    validators: {
      onBlur: onboardingSchema,
    },
    onSubmit: async ({ value }) => {
      if (currentStep !== getSteps(tOnboarding).length) {
        return;
      }

      try {
        const req = await businessInitialization(value);
        if (req.data) {
          form.reset();
          localStorage.removeItem(STORAGE_KEY);
          toast.success(tCommon("redirecting"));
          router.push("/dashboard");
        } else {
          toast.error(tCommon("error"), {
            description: req.error?.split("_").join(" ").toLowerCase(),
          });
        }
      } catch (error) {
        console.error("Onboarding error:", error);
        toast.error(tOnboarding("errors.setupFailed"));
      }
    },
    onSubmitInvalid({ formApi }) {
      const errorMap = formApi.state.errorMap.onChange!;
      if (!formRef.current) return;

      const inputs = Array.from(
        formRef.current.querySelectorAll("input")
      ) as HTMLInputElement[];

      let firstInput: HTMLInputElement | undefined;
      for (const input of inputs) {
        if (errorMap[input.name]) {
          firstInput = input;
          break;
        }
      }
      firstInput?.focus();
    },
  });

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);

    await Promise.all(
      fieldsToValidate.map((fieldName) =>
        form.validateField(fieldName as keyof OnboardingFormData, "blur")
      )
    );

    let isValid = true;
    for (const fieldName of fieldsToValidate) {
      const field = form.getFieldMeta(fieldName as keyof OnboardingFormData);
      if (field?.errors && field.errors.length > 0) {
        isValid = false;
        break;
      }
    }

    if (isValid && currentStep < getSteps(tOnboarding).length) {
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

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        Object.keys(data).forEach((key) => {
          form.setFieldValue(key as keyof OnboardingFormData, data[key]);
        });
      } catch (error) {
        console.error("Failed to load saved form data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const formData = form.state.values;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 1000);

    return () => clearTimeout(timer);
  }, [form.state.values]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasData =
        form.state.values.businessName ||
        form.state.values.teamMembers.length > 0 ||
        form.state.values.categories.length > 0;

      if (hasData && !form.state.isSubmitting) {
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.state.values, form.state.isSubmitting]);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <CardHeader className="mb-8 px-0">
          <CardTitle>{tOnboarding("welcome.title")}</CardTitle>
          <CardDescription>
            {tOnboarding("welcome.description")}
          </CardDescription>
        </CardHeader>

        <div className="mb-8">
          <Stepper onValueChange={setCurrentStep} value={currentStep}>
            {steps.map((stepInfo) => (
              <StepperItem
                className="not-last:flex-1 max-md:items-start"
                key={stepInfo.step}
                step={stepInfo.step}
              >
                <StepperTrigger className="rounded hover:cursor-pointer max-md:flex-col">
                  <StepperIndicator />
                  <div className="text-center md:text-left">
                    <StepperTitle className="flex items-center gap-2">
                      {stepInfo.title}
                    </StepperTitle>
                  </div>
                </StepperTrigger>
                {stepInfo.step < getSteps(tOnboarding).length && (
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
            className="space-y-6"
            id="onboarding-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            ref={formRef}
          >
            <div aria-live="polite" className="sr-only">
              Step {currentStep} of {steps.length}:{" "}
              {steps.find((s) => s.step === currentStep)?.title}
            </div>
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
                            className="text-sm font-medium"
                            htmlFor={field.name}
                          >
                            {tOnboarding("businessName.label")} *
                          </label>
                          <Input
                            aria-invalid={isInvalid}
                            autoComplete="off"
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder={tOnboarding(
                              "businessName.placeholder"
                            )}
                            value={field.state.value}
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
                            className="text-sm font-medium"
                            htmlFor={field.name}
                          >
                            {tOnboarding("businessType.label")} *
                          </label>
                          <Select
                            items={getBusinessTypes(t)}
                            onValueChange={(value) => field.handleChange(value)}
                            value={field.state.value}
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
                              className="text-sm font-medium"
                              htmlFor={field.name}
                            >
                              {tOnboarding("currency.label")} *
                            </label>
                            <Select
                              items={getCurrencies()}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
                              value={field.state.value}
                            >
                              <SelectTrigger id={field.name}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectPopup>
                                {getCurrencies().map((currency) => (
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
                              className="text-sm font-medium"
                              htmlFor={field.name}
                            >
                              {tOnboarding("country.label")} *
                            </label>
                            <Select
                              items={getCountries(t)}
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
                              value={field.state.value}
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
                            className="text-sm font-medium"
                            htmlFor={field.name}
                          >
                            {tOnboarding("timezone.label")}
                          </label>
                          <Input
                            disabled
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                          />
                          <p className="text-sm text-muted-foreground">
                            {tOnboarding("timezone.autoFillDescription")}
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
                              className="text-sm font-medium"
                              htmlFor={field.name}
                            >
                              {tOnboarding("fiscalYearStartMonth.label")} *
                            </label>
                            <Select
                              items={getMonths(t)}
                              onValueChange={(value) =>
                                field.handleChange(value)
                              }
                              value={field.state.value}
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
                            className="text-base font-medium"
                            htmlFor="pricesIncludeTax"
                          >
                            {tOnboarding("pricesIncludeTax.label")}
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {tOnboarding("pricesIncludeTax.description")}
                          </p>
                        </div>
                        <Switch
                          checked={field.state.value}
                          id="pricesIncludeTax"
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
                            className="text-sm font-medium"
                            htmlFor={field.name}
                          >
                            {tOnboarding("defaultVatRate.label")}
                          </label>
                          <Input
                            id={field.name}
                            name={field.name}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder={tOnboarding(
                              "defaultVatRate.placeholder"
                            )}
                            step="0.01"
                            type="number"
                            value={field.state.value}
                          />
                          <p className="text-sm text-muted-foreground">
                            {tOnboarding("defaultVatRate.description")}
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
                <form.Field mode="array" name="teamMembers">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          {tOnboarding("teamMembers.addUpTo", {
                            limit: INVITATIONS_LIMIT,
                          })}
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          {(field.state.value || []).map(
                            (member, index: number) => (
                              <div
                                className="flex gap-1 items-start"
                                key={index}
                              >
                                <form.Field
                                  name={
                                    `teamMembers[${index}].email` as `teamMembers[${number}].email`
                                  }
                                >
                                  {(subField) => {
                                    const isSubFieldInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        data-invalid={isSubFieldInvalid}
                                        orientation="horizontal"
                                      >
                                        <FieldContent>
                                          <InputGroup>
                                            <InputGroupInput
                                              aria-invalid={isSubFieldInvalid}
                                              autoComplete="email"
                                              id={`onboarding-form-teamMember-email-${index}`}
                                              name={subField.name}
                                              onBlur={subField.handleBlur}
                                              onChange={(e) =>
                                                subField.handleChange(
                                                  e.target.value
                                                )
                                              }
                                              placeholder={tOnboarding(
                                                "teamMembers.emailPlaceholder"
                                              )}
                                              type="email"
                                              value={subField.state.value}
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
                                  name={
                                    `teamMembers[${index}].role` as `teamMembers[${number}].role`
                                  }
                                >
                                  {(subField) => {
                                    const isSubFieldInvalid =
                                      subField.state.meta.isTouched &&
                                      !subField.state.meta.isValid;
                                    return (
                                      <Field
                                        className="w-48"
                                        data-invalid={isSubFieldInvalid}
                                        orientation="horizontal"
                                      >
                                        <FieldContent>
                                          <Select
                                            onValueChange={(value) =>
                                              subField.handleChange(value)
                                            }
                                            value={subField.state.value}
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
                                        aria-label={`Remove teammember ${
                                          index + 1
                                        }`}
                                        onClick={() => field.removeValue(index)}
                                        size="icon-xs"
                                        type="button"
                                        variant="ghost"
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
                            className="w-fit"
                            disabled={
                              (field.state.value || []).length >=
                              INVITATIONS_LIMIT
                            }
                            onClick={() =>
                              field.pushValue({
                                email: "",
                                role: UserRole.MEMBER,
                              })
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {tOnboarding("teamMembers.addMember")}
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
                <form.Field mode="array" name="categories">
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
                        toast.error(tOnboarding("errors.alreadyAdded"));
                        return;
                      }
                      if (currentCategories.length >= CATEGORY_LIMIT) {
                        toast.error(
                          tOnboarding("errors.maxCategories", {
                            limit: CATEGORY_LIMIT,
                          })
                        );
                        return;
                      }
                      field.pushValue(trimmed);
                      setNewCategory("");
                    };

                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          {tOnboarding("categories.makeYourOwn")}
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {defaultCategories.map((category) => {
                              const isSelected = currentCategories.some(
                                (c) => c === category
                              );
                              return (
                                <button
                                  aria-pressed={isSelected}
                                  className={`p-4 border rounded-lg cursor-pointer transition-colors w-full text-left flex items-center justify-between ${
                                    isSelected ? "border bg-muted/70" : ""
                                  }`}
                                  key={category}
                                  onClick={() => toggleCategory(category)}
                                  type="button"
                                >
                                  <div className="flex-1">
                                    <h5 className="font-medium text-sm">
                                      {category}
                                    </h5>
                                  </div>
                                  <div className="ml-3 text-sm">
                                    {isSelected
                                      ? tOnboarding("categories.selected")
                                      : tOnboarding("categories.add")}
                                  </div>
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex gap-2 items-center">
                            <Input
                              id="new-category"
                              onChange={(e) => setNewCategory(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleAddCustom();
                                }
                              }}
                              placeholder={tOnboarding(
                                "categories.placeholder"
                              )}
                              value={newCategory}
                            />
                            <Button
                              onClick={handleAddCustom}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              {tOnboarding("categories.addButton")}
                            </Button>
                          </div>
                          <div className="ml-auto text-sm text-muted-foreground tabular-nums">
                            {currentCategories.length} / {CATEGORY_LIMIT}
                          </div>
                          {currentCategories.length > 0 && (
                            <div className="flex gap-0.5 flex-wrap">
                              {currentCategories.map((cat, idx: number) => (
                                <Button
                                  aria-label={`Remove category ${idx + 1}`}
                                  key={`${cat}-${idx}`}
                                  onClick={() => field.removeValue(idx)}
                                  size="xs"
                                  type="button"
                                  variant="outline"
                                >
                                  <span className="">
                                    {cat}{" "}
                                    <XIcon className="inline-block ml-1" />
                                  </span>
                                </Button>
                              ))}
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
                <form.Field mode="array" name="warehouses">
                  {(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;
                    const handleSetDefault = (index: number) => {
                      const newArr = (field.state.value || []).map(
                        (w, i: number) => ({
                          ...w,
                          isDefault: i === index,
                        })
                      );
                      field.setValue(newArr);
                    };

                    const handleRemoveWarehouse = (index: number) => {
                      const warehouses = field.state.value || [];
                      const wasDefault = warehouses[index]?.isDefault;

                      field.removeValue(index);

                      // If we removed the default warehouse, set the first one as default
                      if (wasDefault && warehouses.length > 1) {
                        setTimeout(() => {
                          const updated = field.state.value || [];
                          if (
                            updated.length > 0 &&
                            !updated.some((w) => w.isDefault)
                          ) {
                            handleSetDefault(0);
                          }
                        }, 0);
                      }
                    };

                    return (
                      <FieldSet className="gap-4">
                        <FieldDescription>
                          {tOnboarding("warehouses.addUpTo", {
                            limit: WAREHOUSES_LIMIT,
                          })}
                        </FieldDescription>

                        <FieldGroup className="gap-4">
                          {field.state.value.map((_, index) => (
                            <div
                              className="flex gap-1 items-center"
                              key={index}
                            >
                              <form.Field name={`warehouses[${index}].name`}>
                                {(subField) => {
                                  const isSubFieldInvalid =
                                    subField.state.meta.isTouched &&
                                    !subField.state.meta.isValid;
                                  return (
                                    <Field
                                      data-invalid={isSubFieldInvalid}
                                      orientation="horizontal"
                                    >
                                      <FieldContent>
                                        <InputGroup>
                                          <InputGroupInput
                                            aria-invalid={isSubFieldInvalid}
                                            id={`onboarding-form-warehouse-name-${index}`}
                                            name={subField.name}
                                            onBlur={subField.handleBlur}
                                            onChange={(e) =>
                                              subField.handleChange(
                                                e.target.value
                                              )
                                            }
                                            placeholder={tOnboarding(
                                              "warehouses.placeholder"
                                            )}
                                            value={subField.state.value}
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
                                className="w-fit"
                                id={`warehouse-default-${index}`}
                                onClick={() => handleSetDefault(index)}
                                size="sm"
                                type="button"
                                variant={
                                  field.state.value[index]?.isDefault === true
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {field.state.value[index]?.isDefault === true
                                  ? tOnboarding("warehouses.isDefault")
                                  : tOnboarding("warehouses.setDefault")}
                              </Button>

                              <div>
                                {(field.state.value || []).length > 1 && (
                                  <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                      aria-label={`Remove warehouse ${
                                        index + 1
                                      }`}
                                      onClick={() =>
                                        handleRemoveWarehouse(index)
                                      }
                                      size="icon-xs"
                                      type="button"
                                      variant="ghost"
                                    >
                                      <XIcon />
                                    </InputGroupButton>
                                  </InputGroupAddon>
                                )}
                              </div>
                            </div>
                          ))}

                          <Button
                            className="w-fit"
                            disabled={
                              (field.state.value || []).length >=
                              WAREHOUSES_LIMIT
                            }
                            onClick={() =>
                              field.pushValue({ name: "", isDefault: false })
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            {tOnboarding("warehouses.addWarehouse")}
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
              <Field className="flex justify-between" orientation="horizontal">
                <Button
                  disabled={currentStep === 1}
                  onClick={prevStep}
                  type="button"
                  variant="outline"
                >
                  {tOnboarding("buttons.previous")}
                </Button>

                {currentStep < getSteps(tOnboarding).length && (
                  <Button onClick={nextStep} type="button">
                    {tOnboarding("buttons.next")}
                  </Button>
                )}

                {currentStep === getSteps(tOnboarding).length && (
                  <Button
                    disabled={form.state.isSubmitting}
                    form="onboarding-form"
                    type="submit"
                  >
                    {form.state.isSubmitting
                      ? tOnboarding("buttons.settingUp")
                      : tOnboarding("buttons.completeSetup")}
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
