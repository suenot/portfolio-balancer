"use client";

import { Handle, NodeProps, Position } from 'reactflow';
import { AssetNode } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

// Цвета для различных операций
const operationColors = {
  buy: 'bg-green-100 border-green-500',
  sell: 'bg-red-100 border-red-500',
  hold: 'bg-gray-100 border-gray-300',
};

type PortfolioNodeData = {
  node: AssetNode;
  type: 'current' | 'desired' | 'diff';
};

export default function PortfolioTreeNode({ 
  data, 
  isConnectable, 
}: NodeProps<PortfolioNodeData>) {
  const { node, type } = data;
  
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
  
  const formattedValue = formatCurrency(node.value, node.quoteId);
  
  const formattedPercentage = (percentage?: number) => {
    if (percentage === undefined) return '';
    return new Intl.NumberFormat('ru-RU', {
      style: 'percent',
      maximumFractionDigits: 2,
    }).format(percentage / 100);
  };
  
  // Определяем стиль узла в зависимости от типа (текущий, желаемый, разница)
  const getNodeStyle = () => {
    if (type === 'diff' && node.operation) {
      return operationColors[node.operation];
    }
    
    switch(type) {
      case 'current': return 'bg-blue-100 border-blue-500';
      case 'desired': return 'bg-purple-100 border-purple-500';
      default: return 'bg-gray-100 border-gray-300';
    }
  };
  
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
      
      <Card className={`w-64 shadow-md border-2 ${getNodeStyle()}`}>
        <CardHeader className="p-3 pb-0">
          <CardTitle className="text-sm font-medium">{node.name}</CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          {type !== 'diff' && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span>Сумма:</span>
                <span className="font-semibold">{formattedValue}</span>
              </div>
              
              {node.percentage !== undefined && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span>Текущая доля:</span>
                  <span className="font-semibold">{formattedPercentage(node.percentage)}</span>
                </div>
              )}
              
              {type === 'desired' && node.desiredPercentage !== undefined && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span>Целевая доля:</span>
                  <span className="font-semibold">{formattedPercentage(node.desiredPercentage)}</span>
                </div>
              )}
              
              {node.percentage !== undefined && node.desiredPercentage !== undefined && (
                <div className="mt-2">
                  <Progress 
                    value={node.percentage} 
                    max={node.desiredPercentage > node.percentage ? node.desiredPercentage : 100} 
                    className="h-1.5" 
                  />
                </div>
              )}
            </>
          )}
          
          {type === 'diff' && node.operation && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span>Операция:</span>
                <span className={`font-semibold ${node.operation === 'buy' ? 'text-green-600' : node.operation === 'sell' ? 'text-red-600' : 'text-gray-600'}`}>
                  {node.operation === 'buy' ? 'Купить' : node.operation === 'sell' ? 'Продать' : 'Без изменений'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Сумма:</span>
                <span className="font-semibold">{formattedValue}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2"
      />
    </div>
  );
} 