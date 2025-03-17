export const dynamic = 'force-dynamic';

import PortfolioBalancer from '@/components/PortfolioBalancer';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <PortfolioBalancer />
    </div>
  );
}
