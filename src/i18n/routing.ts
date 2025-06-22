import {defineRouting} from 'next-intl/routing';
import { localeNames } from './config';
 
export const routing = defineRouting({
  locales: Object.keys(localeNames),
  defaultLocale: 'fr'
});