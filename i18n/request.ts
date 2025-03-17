import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from '../navigation';

export default getRequestConfig(async ({ requestLocale }) => {
  // Получаем локаль из запроса
  let locale = await requestLocale;
  
  // Проверяем, что локаль валидна
  if (!locale || !locales.includes(locale as any)) {
    locale = defaultLocale;
  }
  
  return {
    locale,
    messages: (await import(`../messages/${locale}/index.json`)).default
  };
}); 