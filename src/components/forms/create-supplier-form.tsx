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
import { FormDialog } from "../form-dialog";
import { SelectSupplier } from "@/lib/schema/schema-types";
import { Separator } from "../ui/separator";
import {
  createSupplier,
  updateSupplier,
} from "@/server/actions/supplier-actions";
import { toast } from "sonner";
import { format } from "date-fns";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z
    .string()
    .min(1, "Supplier email is required")
    .email("Please enter a valid email address"),
  phone: z.string().refine((val) => {
    const digits = val.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 15;
  }, "Phone number must be between 10-15 digits"),
  address: z.string().optional(),
  note: z.string().optional(),
  contactName: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

export default function SupplierForm({
  supplier,
}: {
  supplier?: SelectSupplier;
}) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier ? supplier.name : "",
      email: supplier ? supplier.email : "",
      phone: supplier ? supplier.phone : "",
      address: supplier ? supplier.address ?? "" : "",
      note: supplier ? supplier.note ?? "" : "",
      contactName: supplier ? supplier.contactName ?? "" : "",
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    const req = supplier
      ? await updateSupplier(supplier.id, data)
      : await createSupplier(data);
    if (req.data) {
      form.reset();
      toast.success("Supplier added successfully", {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error("error", {
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
                <FormLabel>Company Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Enter supplier company name" {...field} />
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
                    Email Address *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="supplier@company.com"
                      {...field}
                    />
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
                    Phone Number *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123-456-7890"
                      {...field}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value);
                        field.onChange(formatted);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter phone number (10-15 digits)
                  </FormDescription>
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
                  Address
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter complete business address including street, city, state, and postal code"
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
                <FormLabel>Contact Person Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter primary contact person name"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Primary person to contact at this supplier
                </FormDescription>
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
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes about this supplier (payment terms, delivery schedules, special requirements, etc.)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional notes about payment terms, delivery, or other
                  important details
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
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {supplier ? "Updating" : "Creating"}...
                </>
              ) : (
                `${supplier ? "Update" : "Create"} Supplier`
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}

export const CreateSupplierDialog = () => {
  return (
    <FormDialog
      title="Create New Supplier"
      triggerText="Create Supplier"
      description="Fill in the details of the new supplier you want to add."
    >
      <SupplierForm />
    </FormDialog>
  );
};
