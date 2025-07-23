"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
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
import { SelectSupplier } from "@/lib/schema/schema-types";
import { Separator } from "../ui/separator";
import {
  createSupplier,
  updateSupplier,
} from "@/server/actions/supplier-actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { useTranslations } from "next-intl";

export default function SupplierForm({
  supplier,
}: {
  supplier?: SelectSupplier;
}) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const supplierSchema = z.object({
    name: z.string().min(1, t("supplierNameRequired")),
    email: z
      .string()
      .min(1, t("supplierEmailRequired"))
      .email(t("supplierEmailValid")),
    phone: z.string().refine((val) => {
      const digits = val.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 15;
    }, t("phoneDigits")),
    address: z.string().optional(),
    note: z.string().optional(),
    contactName: z.string().optional(),
  });
  type SupplierFormData = z.infer<typeof supplierSchema>;
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier ? supplier.name : "",
      email: supplier ? supplier.email : "",
      phone: supplier ? supplier.phone : "",
      address: supplier ? (supplier.address ?? "") : "",
      note: supplier ? (supplier.note ?? "") : "",
      contactName: supplier ? (supplier.contactName ?? "") : "",
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    const req = supplier
      ? await updateSupplier({ supplierId: supplier.id, updates: data })
      : await createSupplier(data);
    if (req.data) {
      form.reset();
      toast.success(
        supplier
          ? tCommon("edit") + " " + t("supplier") + " " + tCommon("confirm")
          : t("supplier") + " " + tCommon("add") + " " + tCommon("confirm"),
        {
          description: format(new Date(), "MMM dd, yyyy"),
        }
      );
    } else {
      toast.error(tCommon("error"), {
        description: req.error?.split("_").join(" ").toLowerCase(),
      });
    }
  };

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const { isSubmitting } = form.formState;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <Separator />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("supplier")} {tCommon("name")} *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("enterSupplierCompanyName")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {tCommon("email")} *
                  </FormLabel>
                  <FormControl>
                    <Input type="email" placeholder={t("email")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    {tCommon("phone")} *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("phone")}
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>{t("enterPhoneNumber")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  {tCommon("address")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("enterBusinessAddress")}
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Separator />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("contactName")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterContactName")} {...field} />
                </FormControl>
                <FormDescription>{t("contactDescription")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <Separator />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tCommon("note")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("noteSupplierPlaceholder")}
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  {t("noteSupplierDescription")}
                </FormDescription>
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
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              {t("resetForm")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {supplier ? t("updating") : t("creating")}
                </>
              ) : (
                `${supplier ? t("updateSupplier") : t("createSupplier")}`
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const CreateSupplierDialog = () => {
  const t = useTranslations("forms");
  return (
    <TriggerDialog
      title={t("createNewSupplier")}
      triggerText={t("createSupplier")}
      description={t("createSupplierDescription")}
    >
      <SupplierForm />
    </TriggerDialog>
  );
};
