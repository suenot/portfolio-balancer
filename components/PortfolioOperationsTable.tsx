"use client";

import { AssetDiff } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

interface PortfolioOperationsTableProps {
  operations: AssetDiff[];
}

export default function PortfolioOperationsTable({
  operations,
}: PortfolioOperationsTableProps) {
  const formatCurrency = (value: number, quoteId?: string) => {
    const currency = quoteId || 'USD';
    
    // Если валюта - криптовалюта, форматируем с большим количеством знаков
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(currency);
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: isCrypto ? 'USD' : currency,
      maximumFractionDigits: isCrypto ? 8 : 2,
    }).format(value).replace('$', isCrypto ? currency + ' ' : '');
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Актив</TableHead>
          <TableHead>Текущее значение</TableHead>
          <TableHead>Целевое значение</TableHead>
          <TableHead>Изменение</TableHead>
          <TableHead>Операция</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {operations.map((op) => (
          <TableRow key={op.id}>
            <TableCell className="font-medium">{op.name}</TableCell>
            <TableCell>{formatCurrency(op.currentValue, op.quoteId)}</TableCell>
            <TableCell>{formatCurrency(op.desiredValue, op.quoteId)}</TableCell>
            <TableCell
              className={
                op.operation === 'buy'
                  ? 'text-green-600'
                  : op.operation === 'sell'
                  ? 'text-red-600'
                  : ''
              }
            >
              {op.operation !== 'hold' && (op.operation === 'buy' ? '+' : '-')}
              {formatCurrency(op.diffValue, op.quoteId)}
            </TableCell>
            <TableCell>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  op.operation === 'buy'
                    ? 'bg-green-100 text-green-800'
                    : op.operation === 'sell'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {op.operation === 'buy'
                  ? 'Купить'
                  : op.operation === 'sell'
                  ? 'Продать'
                  : 'Без изменений'}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 