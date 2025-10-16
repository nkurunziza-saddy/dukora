"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardPanel,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectPopup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Plus,
  Building2,
  Settings,
  Users,
  MapPin,
  Package,
  X,
} from "lucide-react";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/ui/stepper";
import { defaultCategories, userRolesObject } from "@/utils/constants";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { businessInitialization } from "@/server/actions/onboarding-actions";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import LocaleSwitcher from "./language-switcher";
const CATEGORY_LIMIT = 10;
const INVITATIONS_LIMIT = 5;
const WAREHOUSES_LIMIT = 5;
const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  currency: z.string().min(1, "Currency is required"),
  country: z.string().min(1, "Country is required"),
  timezone: z.string().min(1, "Timezone is required"),
  fiscalStartMonth: z.string().min(1, "Fiscal start month is required"),

  pricesIncludeTax: z.boolean(),
  defaultVatRate: z.string().optional(),

  teamMembers: z
    .array(
      z.object({
        email: z.string().email("Invalid email address"),
        role: z.enum([...USER_ROLES]),
      })
    )
    .max(INVITATIONS_LIMIT, `Maximum inivtations is ${INVITATIONS_LIMIT}`),
  categories: z
    .array(z.string())
    .max(CATEGORY_LIMIT, `You can select up to ${CATEGORY_LIMIT} categories`),

  warehouses: z
    .array(
      z.object({
        name: z.string().min(1, "Warehouse name is required"),
        isDefault: z.boolean(),
      })
    )
    .min(1, "At least one warehouse is required")
    .max(WAREHOUSES_LIMIT, `Allowed warehouses up to ${WAREHOUSES_LIMIT}`),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  {
    step: 1,
    title: "Business Profile",
    description: "Set up your business identity",
    icon: Building2,
  },
  {
    step: 2,
    title: "Tax Settings",
    description: "Configure pricing and taxes",
    icon: Settings,
  },
  {
    step: 3,
    title: "Team Setup",
    description: "Invite your team members",
    icon: Users,
  },
  {
    step: 4,
    title: "Categories",
    description: "Choose product categories",
    icon: Package,
  },
  {
    step: 5,
    title: "Warehouses/Branches",
    description: "Set up your business branches and warehouses management",
    icon: MapPin,
  },
];

export default function OnboardingFlow() {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const businessTypes = [
    { value: "retail", label: t("businessTypeRetail") },
    { value: "wholesale", label: t("businessTypeWholesale") },
    { value: "restaurant", label: t("businessTypeRestaurant") },
    { value: "manufacturing", label: t("businessTypeManufacturing") },
    { value: "service", label: t("businessTypeService") },
    { value: "other", label: t("businessTypeOther") },
  ];

  const currencies = [
    { value: "RWF", label: t("currencyRWF") },
    { value: "USD", label: t("currencyUSD") },
    { value: "EUR", label: t("currencyEUR") },
    { value: "GBP", label: t("currencyGBP") },
  ];

  const countries = [
    { value: "RW", label: t("countryRW"), timezone: "Africa/Kigali" },
    { value: "US", label: t("countryUS"), timezone: "America/New_York" },
    { value: "GB", label: t("countryGB"), timezone: "Europe/London" },
    { value: "DE", label: t("countryDE"), timezone: "Europe/Berlin" },
  ];

  const months = [
    { value: "1", label: t("monthJanuary") },
    { value: "2", label: t("monthFebruary") },
    { value: "3", label: t("monthMarch") },
    { value: "4", label: t("monthApril") },
    { value: "5", label: t("monthMay") },
    { value: "6", label: t("monthJune") },
    { value: "7", label: t("monthJuly") },
    { value: "8", label: t("monthAugust") },
    { value: "9", label: t("monthSeptember") },
    { value: "10", label: t("monthOctober") },
    { value: "11", label: t("monthNovember") },
    { value: "12", label: t("monthDecember") },
  ];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      currency: "RWF",
      country: "RW",
      timezone: "Africa/Kigali",
      fiscalStartMonth: "1",
      pricesIncludeTax: false,
      defaultVatRate: "",
      teamMembers: [],
      categories: [],
      warehouses: [{ name: "Main Warehouse", isDefault: true }],
    },
  });

  const { watch, setValue, getValues } = form;

  const addTeamMember = () => {
    const currentMembers = getValues("teamMembers");
    setValue("teamMembers", [...currentMembers, { email: "", role: "ADMIN" }]);
  };

  const removeTeamMember = (index: number) => {
    const currentMembers = getValues("teamMembers");
    setValue(
      "teamMembers",
      currentMembers.filter((_, i) => i !== index)
    );
  };

  const addWarehouse = () => {
    const currentWarehouses = getValues("warehouses");
    setValue("warehouses", [
      ...currentWarehouses,
      { name: "", isDefault: false },
    ]);
  };

  const removeWarehouse = (index: number) => {
    const currentWarehouses = getValues("warehouses");
    if (currentWarehouses.length > 1) {
      setValue(
        "warehouses",
        currentWarehouses.filter((_, i) => i !== index)
      );
    }
  };

  const setDefaultWarehouse = (index: number) => {
    const currentWarehouses = getValues("warehouses");
    const updatedWarehouses = currentWarehouses.map((warehouse, i) => ({
      ...warehouse,
      isDefault: i === index,
    }));
    setValue("warehouses", updatedWarehouses);
  };

  const removeCategory = (index: number) => {
    const currentCategories = getValues("categories");
    setValue(
      "categories",
      currentCategories.filter((_, i) => i !== index)
    );
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await form.trigger(fieldsToValidate);

    if (isValid && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof OnboardingFormData)[] => {
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

  const onSubmit = async (data: OnboardingFormData) => {
    if (currentStep !== steps.length) {
      return;
    }
    setIsSubmitting(true);
    try {
      const req = await businessInitialization(data);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <CardHeader className="mb-8 px-0">
          <CardTitle className="">Welcome to Your Inventory System</CardTitle>
          <CardDescription className="">
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
                <StepperTrigger className="rounded max-md:flex-col">
                  <StepperIndicator />
                  <div className="text-center md:text-left">
                    <StepperTitle className="flex items-center gap-2">
                      {/* <Icon className="h-4 w-4" /> */}
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
                  {(() => {
                    const currentStepData = steps.find(
                      (s) => s.step === currentStep
                    );
                    // const CurrentIcon = currentStepData?.icon;
                    return (
                      <>
                        {/* {CurrentIcon && <CurrentIcon className="h-5 w-5" />} */}
                        {currentStepData?.title}
                      </>
                    );
                  })()}
                </CardTitle>
                <CardDescription>
                  {steps.find((s) => s.step === currentStep)?.description}
                </CardDescription>
              </div>
              {currentStep === 3 && (
                <Button
                  type="button"
                  size={"sm"}
                  variant="outline"
                  onClick={addTeamMember}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              )}
              {currentStep === 5 && (
                <Button type="button" variant="outline" onClick={addWarehouse}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              )}
            </div>
          </CardHeader>
          <CardPanel>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your business name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />{" "}
                              </SelectTrigger>
                            </FormControl>
                            <SelectPopup>
                              {businessTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectPopup>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-4">
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />{" "}
                                </SelectTrigger>
                              </FormControl>
                              <SelectPopup>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value);
                                const country = countries.find(
                                  (c) => c.value === value
                                );
                                if (country) {
                                  setValue("timezone", country.timezone);
                                }
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />{" "}
                                </SelectTrigger>
                              </FormControl>
                              <SelectPopup>
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.value}
                                    value={country.value}
                                  >
                                    {country.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 items-start  gap-4">
                      <FormField
                        control={form.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <FormControl>
                              <Input {...field} disabled />
                            </FormControl>
                            <FormDescription>
                              Auto-filled based on selected country
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fiscalStartMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiscal Year Start Month *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />{" "}
                                </SelectTrigger>
                              </FormControl>
                              <SelectPopup>
                                {months.map((month) => (
                                  <SelectItem
                                    key={month.value}
                                    value={month.value}
                                  >
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectPopup>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="pricesIncludeTax"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Prices Include Tax
                            </FormLabel>
                            <FormDescription>
                              Toggle whether your product prices include tax or
                              are tax-exclusive
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="defaultVatRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default VAT Rate (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="e.g., 18"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Set a default VAT rate for your products
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    {watch("teamMembers").length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No team members added yet</p>
                        <p className="text-sm">
                          You can add team members now or skip this step
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {watch("teamMembers").map((_, index) => (
                          <div key={index} className="flex gap-4 items-start">
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.email`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="team@example.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`teamMembers.${index}.role`}
                              render={({ field }) => (
                                <FormItem className="w-40">
                                  <FormLabel>Role</FormLabel>
                                  <div className="flex gap-2">
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />{" "}
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectPopup>
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
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => removeTeamMember(index)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-4">
                        Choose from default categories:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {defaultCategories.map((category) => {
                          const isSelected = watch("categories").some(
                            (cat) => cat === category
                          );

                          return (
                            <div
                              key={category}
                              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                isSelected ? "border bg-muted/70" : ""
                              }`}
                              onClick={() => {
                                const currentCategories =
                                  getValues("categories");
                                if (isSelected) {
                                  setValue(
                                    "categories",
                                    currentCategories.filter(
                                      (cat) => cat !== category
                                    )
                                  );
                                } else {
                                  setValue("categories", [
                                    ...currentCategories,
                                    category,
                                  ]);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-sm">
                                    {category}
                                  </h5>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">
                        Add custom categories:
                      </h4>
                      <div className="flex gap-2 mb-4">
                        <Input
                          id="customCategoryInput"
                          placeholder="Enter category name"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const input = e.target as HTMLInputElement;
                              const categoryName = input.value.trim();

                              if (categoryName) {
                                const currentCategories =
                                  getValues("categories");
                                const categoryExists = currentCategories.some(
                                  (cat) =>
                                    cat.toLowerCase() ===
                                    categoryName.toLowerCase()
                                );

                                if (!categoryExists) {
                                  setValue("categories", [
                                    ...currentCategories,
                                    categoryName,
                                  ]);
                                  input.value = "";
                                }
                              }
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const input = document.getElementById(
                              "customCategoryInput"
                            ) as HTMLInputElement;
                            const categoryName = input?.value.trim();

                            if (categoryName) {
                              const currentCategories = getValues("categories");
                              const categoryExists = currentCategories.some(
                                (cat) =>
                                  cat.toLowerCase() ===
                                  categoryName.toLowerCase()
                              );

                              if (!categoryExists) {
                                setValue("categories", [
                                  ...currentCategories,
                                  categoryName,
                                ]);
                                input.value = "";
                              }
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {watch("categories").length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Selected categories ({watch("categories").length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {watch("categories").map((category, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="flex items-center"
                              >
                                {category}
                                <Button
                                  type="button"
                                  variant={"ghost"}
                                  onClick={() => removeCategory(index)}
                                  className="ml-0.5 px-0 rounded-full size-4"
                                >
                                  <X className="size-3" />
                                </Button>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {watch("warehouses").map((warehouse, index) => (
                        <div
                          key={index}
                          className="flex gap-4 items-start p-4 border rounded-lg"
                        >
                          <FormField
                            control={form.control}
                            name={`warehouses.${index}.name`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input
                                    placeholder="Warehouse/Branch name"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex items-center gap-2">
                            {warehouse.isDefault && (
                              <Badge variant="default">Default</Badge>
                            )}
                            {!warehouse.isDefault && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setDefaultWarehouse(index)}
                              >
                                Set Default
                              </Button>
                            )}
                            {watch("warehouses").length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeWarehouse(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                  >
                    Previous
                  </Button>

                  {currentStep < 5 && (
                    <Button type="button" onClick={nextStep}>
                      Next
                    </Button>
                  )}

                  {currentStep === 5 && (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Setting up..." : "Complete Setup"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardPanel>
        </Card>
      </div>
      <div className="absolute bottom-2 right-2">
        <LocaleSwitcher />
      </div>
    </div>
  );
}
