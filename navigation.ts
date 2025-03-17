import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'ru'];
export const defaultLocale = 'en';

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales }); 