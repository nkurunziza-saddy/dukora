"use client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { SelectBusiness } from "@/lib/schema/schema-types";
import { updateBusiness } from "@/server/actions/business-actions";
import { toast } from "sonner";
import { de } from "@faker-js/faker";
import { Textarea } from "@/components/ui/textarea";

const LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  DOMAIN_MAX: 253,
  LOGO_URL_MAX: 500,
  REGISTRATION_NUMBER_MAX: 50,
};

const formSchema = z.object({
  name: z
    .string()
    .min(LIMITS.NAME_MIN, `Name must be at least ${LIMITS.NAME_MIN} characters`)
    .max(LIMITS.NAME_MAX, `Name cannot exceed ${LIMITS.NAME_MAX} characters`),
  domain: z
    .string()
    .max(
      LIMITS.DOMAIN_MAX,
      `Domain cannot exceed ${LIMITS.DOMAIN_MAX} characters`
    )
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/,
      "Please enter a valid domain"
    )
    .optional()
    .or(z.literal("")),
  businessType: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z
    .string()
    .url("Please enter a valid URL")
    .max(
      LIMITS.LOGO_URL_MAX,
      `Logo URL cannot exceed ${LIMITS.LOGO_URL_MAX} characters`
    )
    // .nullable()
    .optional()
    .or(z.literal("")),
  registrationNumber: z.string().optional(),
  isActive: z.boolean(),
});

export function EditBusinessDetails({
  business,
}: {
  business: Omit<SelectBusiness, "createdAt" | "updatedAt" | "stripeAccountId">;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: business?.name || "",
      domain: business?.domain || "",
      description: business?.description || "",
      businessType: business?.businessType || "",
      logoUrl: business?.logoUrl || "",
      registrationNumber: business?.registrationNumber || "",
      isActive: business?.isActive || false,
    },
  });

  const {
    watch,
    formState: { errors, isSubmitting },
  } = form;

  const nameValue = watch("name") || "";
  const domainValue = watch("domain") || "";
  const logoUrlValue = watch("logoUrl") || "";

  const businessTypes = [
    { value: "retail", label: t("businessTypeRetail") },
    { value: "wholesale", label: t("businessTypeWholesale") },
    { value: "restaurant", label: t("businessTypeRestaurant") },
    { value: "manufacturing", label: t("businessTypeManufacturing") },
    { value: "service", label: t("businessTypeService") },
    { value: "other", label: t("businessTypeOther") },
  ];

  const nameRemaining = LIMITS.NAME_MAX - nameValue.length;
  const domainRemaining = LIMITS.DOMAIN_MAX - domainValue.length;
  const logoUrlRemaining = LIMITS.LOGO_URL_MAX - logoUrlValue.length;

  const isNameNearLimit = nameValue.length > LIMITS.NAME_MAX * 0.8;
  const isDomainNearLimit = domainValue.length > LIMITS.DOMAIN_MAX * 0.8;
  const isLogoUrlNearLimit = logoUrlValue.length > LIMITS.LOGO_URL_MAX * 0.8;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateBusiness({
      businessId: business.id,
      updates: values,
    });
    if (result.error) {
      toast.error("Failed to update business details", {
        description: result.error,
      });
      return;
    }
    toast.success("Business details updated successfully", {
      description: "Your business details have been updated.",
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Name</span>
                <Badge
                  variant={isNameNearLimit ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {nameValue.length}/{LIMITS.NAME_MAX}
                </Badge>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Domain</span>
                <Badge
                  variant={isDomainNearLimit ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {domainValue.length}/{LIMITS.DOMAIN_MAX}
                </Badge>
              </div>
            </div>
            <div className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">Logo URL</span>
                <Badge
                  variant={isLogoUrlNearLimit ? "destructive" : "secondary"}
                  className="text-xs"
                >
                  {logoUrlValue.length}/{LIMITS.LOGO_URL_MAX}
                </Badge>
              </div>
            </div>
          </div>

          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please fix the errors below before submitting.
              </AlertDescription>
            </Alert>
          )}

          <div>
            <h4 className="font-medium mb-4">{t("basicInformation")}</h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("businessName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("enterBusinessName")}
                        maxLength={LIMITS.NAME_MAX}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {nameRemaining} characters remaining
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("domain")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("enterDomain")}
                        maxLength={LIMITS.DOMAIN_MAX}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {domainRemaining} characters remaining •{" "}
                      {t("domainDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("description")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("enterBusinessDescription")}
                        className="field-sizing-content max-h-29.5 min-h-0 resize-none py-1.75"
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
                    <FormLabel>{t("businessType")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("selectBusinessType")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {businessTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t("businessTypeDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("logoUrl")}</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder={t("enterLogoUrl")}
                        maxLength={LIMITS.LOGO_URL_MAX}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {logoUrlRemaining} characters remaining
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4 flex items-center gap-2">
              {t("systemInformation")}
            </h4>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="registrationNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("registrationNumber")}</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      {t("registrationNumberDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base flex items-center gap-2">
                        {t("accountStatus")}
                      </FormLabel>
                      <FormDescription>
                        {t("accountStatusDescription")}
                      </FormDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={field.value ? "default" : "secondary"}>
                        {field.value ? t("active") : t("inactive")}
                      </Badge>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t("saving") : t("saveDetails")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
