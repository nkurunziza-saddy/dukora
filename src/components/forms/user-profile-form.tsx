'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { updateUser } from '@/server/actions/user-actions';
import { getUserById } from '@/server/actions/user-actions';

export default function UserProfileForm({
  user,
}: {
  user: Awaited<ReturnType<typeof getUserById>>["data"];
}) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');

  const userProfileSchema = z.object({
    name: z.string().min(1, t('userNameRequired')),
    email: z.string().email(t('userEmailValid')),
  });

  const form = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof userProfileSchema>) => {
    if (!user?.id) return;
    const req = await updateUser({ userId: user.id, userData: values });
    if (req.data) {
      toast.success(t('userUpdated'), {
        description: format(new Date(), 'MMM dd, yyyy'),
      });
    } else {
      toast.error(tCommon('error'), {
        description: t('userSettingsUpdateFailed'),
      });
    }
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
                <FormLabel>{t('userName')} *</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterUserName')} {...field} />
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
                <FormLabel>{t('userEmail')} *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('email')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {tCommon('saving')}...
              </>
            ) : (
              tCommon('saveChanges')
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
