"use client";

import { Handle, NodeProps, Position } from 'reactflow';
import { AssetNode } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useTranslations } from 'next-intl';

// Цвета для различных операций
const operationColors = {
  buy: 'bg-green-100 border-green-500',
  sell: 'bg-red-100 border-red-500',
  hold: 'bg-gray-100 border-gray-300',
};

// Цвета для разных типов активов
const assetTypeColors: Record<string, string> = {
  'stocks-rus': 'border-b-2 border-b-blue-600', 
  'stocks-usa': 'border-b-2 border-b-red-600',
  'stocks-chn': 'border-b-2 border-b-yellow-600',
  default: '',
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
  const portfolioT = useTranslations('portfolio');
  const operationsT = useTranslations('operations');
  
  const formatCurrency = (value: number, quoteId?: string) => {
    const currency = quoteId || 'USD';
    
    // Если валюта - криптовалюта, форматируем с большим количеством знаков
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(currency);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isCrypto ? 'USD' : currency,
      maximumFractionDigits: isCrypto ? 8 : 0, // Убираем копейки для компактности
    }).format(value).replace('$', isCrypto ? currency + ' ' : '');
  };
  
  const formattedValue = formatCurrency(node.value, node.quoteId);
  
  const formattedPercentage = (percentage?: number) => {
    if (percentage === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 1, // Уменьшаем до одного знака после запятой
    }).format(percentage / 100);
  };
  
  // Определяем стиль узла в зависимости от типа (текущий, желаемый, разница)
  const getNodeStyle = () => {
    let baseStyle = '';
    
    if (type === 'diff' && node.operation) {
      baseStyle = operationColors[node.operation];
    } else {
      switch(type) {
        case 'current': baseStyle = 'bg-blue-100 border-blue-500'; break;
        case 'desired': baseStyle = 'bg-purple-100 border-purple-500'; break;
        default: baseStyle = 'bg-gray-100 border-gray-300';
      }
    }
    
    // Добавляем индикатор для российских/американских/китайских акций
    if (node.parentId) {
      const parentId = node.parentId as string;
      if (Object.keys(assetTypeColors).includes(parentId)) {
        return `${baseStyle} ${assetTypeColors[parentId]}`;
      }
    }
    
    return baseStyle;
  };
  
  // Функция для сокращения длинных имен
  const truncateName = (name: string, maxLength: number = 13) => {
    return name.length > maxLength ? `${name.slice(0, maxLength-1)}…` : name;
  };
  
  // Определяем метку группы, если нужно
  const getGroupLabel = () => {
    if (node.id === 'stocks-rus') return 'RU';
    if (node.id === 'stocks-usa') return 'US';
    if (node.id === 'stocks-chn') return 'CN';
    return null;
  };
  
  const groupLabel = getGroupLabel();
  
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-1.5 h-1.5" // Уменьшаем размер соединительных точек
      />
      
      <Card className={`w-44 shadow-sm border ${getNodeStyle()}`}>
        {groupLabel && (
          <div className="absolute top-0 right-0 bg-gray-800 text-white text-xs px-1 rounded-bl">
            {groupLabel}
          </div>
        )}
        <CardHeader className="p-2 pb-0">
          <CardTitle className="text-xs font-medium truncate" title={node.name}>
            {truncateName(node.name)}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {type !== 'diff' && (
            <>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px]">{portfolioT('sum')}:</span>
                <span className="font-semibold text-[10px]">{formattedValue}</span>
              </div>
              
              {node.percentage !== undefined && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-[10px]">{portfolioT('share')}:</span>
                  <span className="font-semibold text-[10px]">{formattedPercentage(node.percentage)}</span>
                </div>
              )}
              
              {type === 'desired' && node.desiredPercentage !== undefined && (
                <div className="flex justify-between items-center text-xs mt-1">
                  <span className="text-[10px]">{portfolioT('target')}:</span>
                  <span className="font-semibold text-[10px]">{formattedPercentage(node.desiredPercentage)}</span>
                </div>
              )}
              
              {node.percentage !== undefined && node.desiredPercentage !== undefined && (
                <div className="mt-1">
                  <Progress 
                    value={node.percentage} 
                    max={node.desiredPercentage > node.percentage ? node.desiredPercentage : 100} 
                    className="h-1" 
                  />
                </div>
              )}
            </>
          )}
          
          {type === 'diff' && node.operation && (
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px]">{operationsT('operation')}:</span>
                <span className={`font-semibold text-[10px] ${node.operation === 'buy' ? 'text-green-600' : node.operation === 'sell' ? 'text-red-600' : 'text-gray-600'}`}>
                  {node.operation === 'buy' ? operationsT('buy') : node.operation === 'sell' ? operationsT('sell') : operationsT('hold')}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px]">{portfolioT('sum')}:</span>
                <span className="font-semibold text-[10px]">{formattedValue}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-1.5 h-1.5" // Уменьшаем размер соединительных точек
      />
    </div>
  );
} 