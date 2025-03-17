import PortfolioBalancer from '@/components/PortfolioBalancer';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t('appTitle')}</h1>
      <PortfolioBalancer />
    </div>
  );
} 