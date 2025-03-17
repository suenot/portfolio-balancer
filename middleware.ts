import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './navigation';

export default createMiddleware({
  // Список поддерживаемых локалей
  locales,
  
  // Используется, когда нет совпадения локали
  defaultLocale
});

export const config = {
  // Маска для обработки интернационализированных путей
  matcher: ['/((?!api|_next|.*\\..*).*)']
}; 