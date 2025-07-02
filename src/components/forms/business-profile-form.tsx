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
import { updateBusiness } from '@/server/actions/business-action';
import { getBusinessById } from '@/server/actions/business-action';

export default function BusinessProfileForm({
  business,
}: {
  business: Awaited<ReturnType<typeof getBusinessById>>["data"];
}) {
  const t = useTranslations('forms');
  const tCommon = useTranslations('common');

  const businessProfileSchema = z.object({
    name: z.string().min(1, t('businessNameRequired')),
    domain: z.string().optional(),
    businessType: z.string().optional(),
    logoUrl: z.string().optional(),
    registrationNumber: z.string().optional(),
  });

  const form = useForm<z.infer<typeof businessProfileSchema>>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: business?.name || '',
      domain: business?.domain || '',
      businessType: business?.businessType || '',
      logoUrl: business?.logoUrl || '',
      registrationNumber: business?.registrationNumber || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof businessProfileSchema>) => {
    if (!business?.id) return;
    const req = await updateBusiness({ businessId: business.id, updates: values });
    if (req.data) {
      toast.success(t('businessSettingsUpdated'), {
        description: format(new Date(), 'MMM dd, yyyy'),
      });
    } else {
      toast.error(tCommon('error'), {
        description: t('businessSettingsUpdateFailed'),
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
                <FormLabel>{t('businessName')} *</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterBusinessName')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('domain')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterDomain')} {...field} />
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
                <FormLabel>{t('businessType')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterBusinessType')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('logoUrl')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterLogoUrl')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('registrationNumber')}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('enterRegistrationNumber')}
                    {...field}
                  />
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
