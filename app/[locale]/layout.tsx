import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '../../lib/get-messages';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Portfolio Balancer',
  description: 'An app to balance your investment portfolio',
};

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ru' }];
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative">
            <div className="absolute top-4 right-4">
              <LanguageSwitcher />
            </div>
            {children}
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 