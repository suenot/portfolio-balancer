"use client";

import { useState } from 'react';
import { AssetNode } from '@/lib/types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Trash2, Plus, ChevronsRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Список доступных валют и котировок
const AVAILABLE_QUOTES = [
  { id: 'USD', name: 'US Dollar ($)' },
  { id: 'RUB', name: 'Российский рубль (₽)' },
  { id: 'EUR', name: 'Euro (€)' },
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'USDT', name: 'Tether' },
];

interface PortfolioEditorProps {
  portfolioData: AssetNode;
  type: 'current' | 'desired';
  onSave: (updatedPortfolio: AssetNode) => void;
}

export default function PortfolioEditor({
  portfolioData,
  type,
  onSave,
}: PortfolioEditorProps) {
  const [portfolio, setPortfolio] = useState<AssetNode>({ ...portfolioData });

  // Обновление значения узла
  const updateNodeValue = (
    nodeId: string, 
    field: 'value' | 'desiredPercentage' | 'quoteId', 
    value: number | string
  ) => {
    const updateNode = (node: AssetNode): AssetNode => {
      if (node.id === nodeId) {
        return { ...node, [field]: value };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => updateNode(child))
        };
      }
      
      return node;
    };
    
    setPortfolio(prev => updateNode(prev));
  };

  // Добавление дочернего узла
  const addChildNode = (parentId: string) => {
    const newId = `node-${Date.now()}`;
    
    const addChild = (node: AssetNode): AssetNode => {
      if (node.id === parentId) {
        const newChild: AssetNode = {
          id: newId,
          name: 'Новый актив',
          value: type === 'current' ? 0 : 0,
          quoteId: node.quoteId || 'USD', // Наследуем валюту родителя или используем USD по умолчанию
          desiredPercentage: type === 'desired' ? 0 : undefined,
          parentId: node.id
        };
        
        return {
          ...node,
          children: [...(node.children || []), newChild]
        };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => addChild(child))
        };
      }
      
      return node;
    };
    
    setPortfolio(prev => addChild(prev));
  };

  // Удаление узла
  const deleteNode = (nodeId: string) => {
    const removeNode = (node: AssetNode): AssetNode | null => {
      if (node.id === nodeId) {
        return null;
      }
      
      if (node.children) {
        const filteredChildren = node.children
          .map(child => removeNode(child))
          .filter(Boolean) as AssetNode[];
        
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }
      
      return node;
    };
    
    setPortfolio(prev => {
      const result = removeNode(prev);
      return result || prev; // Если пытаемся удалить корневой узел, возвращаем исходное дерево
    });
  };

  // Обновление имени узла
  const updateNodeName = (nodeId: string, name: string) => {
    const updateName = (node: AssetNode): AssetNode => {
      if (node.id === nodeId) {
        return { ...node, name };
      }
      
      if (node.children) {
        return {
          ...node,
          children: node.children.map(child => updateName(child))
        };
      }
      
      return node;
    };
    
    setPortfolio(prev => updateName(prev));
  };

  // Рекурсивный рендер узлов дерева
  const renderNode = (node: AssetNode, depth = 0) => {
    return (
      <div key={node.id} className="mb-4" style={{ marginLeft: `${depth * 20}px` }}>
        <Card className="border shadow-sm">
          <CardHeader className="p-3 pb-0">
            <div className="flex items-center justify-between">
              <Input 
                value={node.name} 
                onChange={e => updateNodeName(node.id, e.target.value)}
                className="font-medium text-sm h-8"
              />
              
              {node.id !== 'root' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-destructive"
                  onClick={() => deleteNode(node.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="p-3">
            <div className="space-y-2">
              {type === 'current' ? (
                <>
                  <div className="flex items-center space-x-2">
                    <Label className="min-w-24">Сумма:</Label>
                    <Input 
                      type="number" 
                      value={node.value || 0} 
                      onChange={e => updateNodeValue(node.id, 'value', parseFloat(e.target.value) || 0)}
                      className="h-8"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label className="min-w-24">Валюта:</Label>
                    <Select 
                      value={node.quoteId || 'USD'} 
                      onValueChange={value => updateNodeValue(node.id, 'quoteId', value)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Выберите валюту" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_QUOTES.map(quote => (
                          <SelectItem key={quote.id} value={quote.id}>
                            {quote.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Label className="min-w-24">Процент (%):</Label>
                  <Input 
                    type="number" 
                    value={node.desiredPercentage || 0} 
                    onChange={e => updateNodeValue(node.id, 'desiredPercentage', parseFloat(e.target.value) || 0)}
                    className="h-8"
                  />
                </div>
              )}
            </div>
            
            <div className="mt-3 flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7"
                onClick={() => addChildNode(node.id)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Добавить актив
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {node.children && node.children.length > 0 && (
          <div className="mt-2 ml-4 pl-4 border-l-2 border-gray-200">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-xl">
          {type === 'current' ? 'Редактирование текущего портфеля' : 'Редактирование целевого портфеля'}
        </CardTitle>
        
        <Button onClick={() => onSave(portfolio)}>
          Сохранить изменения
        </Button>
      </div>
      
      <Separator />
      
      <div className="space-y-4 mt-4">
        {renderNode(portfolio)}
      </div>
    </div>
  );
} 