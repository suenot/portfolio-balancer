"use client";

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Operation } from '@/lib/types';

interface PortfolioOperationsTableProps {
  operations: Operation[];
}

export default function PortfolioOperationsTable({ operations }: PortfolioOperationsTableProps) {
  const formatCurrency = (value: number, quoteId?: string) => {
    const currency = quoteId || 'USD';
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(currency);
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: isCrypto ? 'USD' : currency,
      maximumFractionDigits: isCrypto ? 8 : 0,
    }).format(value).replace('$', isCrypto ? currency + ' ' : '');
  };
  
  // Определение цвета операции
  const getOperationColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-600';
      case 'sell': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };
  
  // Перевод типа операции
  const translateOperationType = (type: string) => {
    switch (type) {
      case 'buy': return 'Купить';
      case 'sell': return 'Продать';
      default: return 'Держать';
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Актив</TableHead>
            <TableHead>Операция</TableHead>
            <TableHead className="text-right">Текущая сумма</TableHead>
            <TableHead className="text-right">Целевая сумма</TableHead>
            <TableHead className="text-right">Разница</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {operations.length > 0 ? (
            operations.map((op, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{op.assetName}</TableCell>
                <TableCell className={getOperationColor(op.type)}>
                  {translateOperationType(op.type)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(op.currentValue, op.quoteId)}
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(op.targetValue, op.quoteId)}
                </TableCell>
                <TableCell className={`text-right ${getOperationColor(op.type)}`}>
                  {formatCurrency(Math.abs(op.diffValue), op.quoteId)}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                Нет операций для отображения
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
} 