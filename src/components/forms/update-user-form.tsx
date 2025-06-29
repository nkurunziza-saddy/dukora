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
import { Loader2 } from "lucide-react";
import { userRolesObject } from "@/utils/constants";
import { format } from "date-fns";
import { USER_ROLES } from "@/lib/schema/models/enums";
import { SelectUser } from "@/lib/schema/schema-types";
import { updateUser } from "@/server/actions/user-actions";
import { useSession } from "@/lib/auth-client";
import { useTranslations } from "next-intl";

export function UpdateUserForm({ user }: { user: SelectUser }) {
  const t = useTranslations("forms");
  const tCommon = useTranslations("common");
  const session = useSession();

  const supplierSchema = z.object({
    name: z.string().min(1, t("userNameRequired")),
    email: z.string().min(1, t("userEmailRequired")).email(t("userEmailValid")),
    role: z.enum([...USER_ROLES]),
  });

  type updateUserFormData = z.infer<typeof supplierSchema>;
  const form = useForm<updateUserFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
  const isSelf = user.id === session.data?.user.id;
  const onSubmit = async (values: updateUserFormData) => {
    const req = await updateUser(user.id, values);
    if (req.data) {
      form.reset();
      toast.success(t("userUpdated"), {
        description: format(new Date(), "MMM dd, yyyy"),
      });
    } else {
      toast.error(tCommon("error"), {
        description: req.error?.split("_").join(" ").toLowerCase(),
      });
    }
  };
  const { isSubmitting } = form.formState;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            disabled={!isSelf}
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
            disabled={!isSelf}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("userEmail")} *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t("email")} {...field} />
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
                <FormLabel>{tCommon("role")}</FormLabel>
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
                {t("updating")} ...
              </>
            ) : (
              t("update")
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
