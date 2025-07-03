"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, AlertCircle } from "lucide-react";
import { userRolesObject } from "@/utils/constants";
import { format } from "date-fns";
import { createInvitation } from "@/server/actions/invitation-actions";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function InviteUserForm() {
  const t = useTranslations("forms");
  const supplierSchema = z.object({
    name: z.string().min(1, t("userNameRequired")),
    email: z.string().min(1, t("userEmailRequired")).email(t("userEmailValid")),
    role: z.enum([...USER_ROLES]),
  });

  type inviteUserFormData = z.infer<typeof supplierSchema>;
  const form = useForm<inviteUserFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "MEMBER",
    },
  });

  const onSubmit = async (values: inviteUserFormData) => {
    const req = await createInvitation(values);
    if (req.data) {
      form.reset();
      toast.success(t("invitationSent"), {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error(t("error"), {
        description: req.error?.split("_").join(" ").toLowerCase(),
      });
    }
  };

  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t("emailVerificationDown")}</AlertDescription>
      </Alert>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("userName")} *</FormLabel>
                <FormControl>
                  <Input placeholder={t("enterUserName")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("userEmail")} *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("enterUserEmail")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("role")}</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {userRolesObject.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("sending")} ...
              </>
            ) : (
              t("send")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
