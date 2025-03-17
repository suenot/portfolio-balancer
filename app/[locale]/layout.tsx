import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from '../../lib/get-messages';
import { Navbar } from '../../components/ui/navbar';

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
          <div className="relative flex flex-col min-h-screen">
            <Navbar />
            <div className="relative flex-1">
              {children}
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
} 