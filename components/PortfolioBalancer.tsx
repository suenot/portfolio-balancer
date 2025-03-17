"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { AssetNode, PortfolioState } from '@/lib/types';
import { calculatePercentages, calculateDesiredValues, calculateDiffTree, generateOperationsList } from '@/lib/portfolio-utils';
import PortfolioTreeChart from './PortfolioTreeChart';
import PortfolioOperationsTable from './PortfolioOperationsTable';
import PortfolioEditor from './PortfolioEditor';
import { Edit2 } from 'lucide-react';

// Пример текущего портфеля
const sampleCurrentPortfolio: AssetNode = {
  id: 'root',
  name: 'Портфель',
  value: 1000000,
  quoteId: 'USD',
  children: [
    {
      id: 'stocks',
      name: 'Акции',
      value: 400000,
      quoteId: 'USD',
      parentId: 'root',
      children: [
        { id: 'stocks-rus', name: 'Российские', value: 250000, quoteId: 'USD', parentId: 'stocks' },
        { id: 'stocks-usa', name: 'Американские', value: 150000, quoteId: 'USD', parentId: 'stocks' },
      ],
    },
    {
      id: 'bonds',
      name: 'Облигации',
      value: 300000,
      quoteId: 'USD',
      parentId: 'root',
      children: [
        { id: 'bonds-gov', name: 'Государственные', value: 200000, quoteId: 'USD', parentId: 'bonds' },
        { id: 'bonds-corp', name: 'Корпоративные', value: 100000, quoteId: 'USD', parentId: 'bonds' },
      ],
    },
    {
      id: 'cash',
      name: 'Наличные',
      value: 300000,
      quoteId: 'USD',
      parentId: 'root',
    },
  ],
};

// Пример желаемой структуры портфеля (в процентах)
const sampleDesiredPortfolio: AssetNode = {
  id: 'root',
  name: 'Портфель',
  desiredPercentage: 100,
  value: 0, // будет рассчитано
  quoteId: 'USD',
  children: [
    {
      id: 'stocks',
      name: 'Акции',
      desiredPercentage: 50, // 50% от общего портфеля
      value: 0,
      quoteId: 'USD',
      parentId: 'root',
      children: [
        { id: 'stocks-rus', name: 'Российские', desiredPercentage: 60, value: 0, quoteId: 'USD', parentId: 'stocks' }, // 60% от акций
        { id: 'stocks-usa', name: 'Американские', desiredPercentage: 40, value: 0, quoteId: 'USD', parentId: 'stocks' }, // 40% от акций
      ],
    },
    {
      id: 'bonds',
      name: 'Облигации',
      desiredPercentage: 30, // 30% от общего портфеля
      value: 0,
      quoteId: 'USD',
      parentId: 'root',
      children: [
        { id: 'bonds-gov', name: 'Государственные', desiredPercentage: 70, value: 0, quoteId: 'USD', parentId: 'bonds' }, // 70% от облигаций
        { id: 'bonds-corp', name: 'Корпоративные', desiredPercentage: 30, value: 0, quoteId: 'USD', parentId: 'bonds' }, // 30% от облигаций
      ],
    },
    {
      id: 'cash',
      name: 'Наличные',
      desiredPercentage: 20, // 20% от общего портфеля
      value: 0,
      quoteId: 'USD',
      parentId: 'root',
    },
  ],
};

export default function PortfolioBalancer() {
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
    current: sampleCurrentPortfolio,
    desired: sampleDesiredPortfolio,
  });
  
  const [activeEditor, setActiveEditor] = useState<'current' | 'desired' | null>(null);
  
  // Рассчитываем процентное соотношение и разницу при монтировании
  useEffect(() => {
    calculateBalancing();
  }, []);
  
  // Функция для пересчета балансировки
  const calculateBalancing = () => {
    // Рассчитываем текущее процентное соотношение
    const currentWithPercentages = calculatePercentages(portfolioState.current);
    
    // Рассчитываем желаемые суммы на основе процентов
    const desiredWithValues = calculateDesiredValues(
      portfolioState.current,
      portfolioState.desired
    );
    
    // Рассчитываем разницу (что нужно купить/продать)
    const diff = calculateDiffTree(currentWithPercentages, desiredWithValues);
    
    // Обновляем состояние
    setPortfolioState({
      current: currentWithPercentages,
      desired: desiredWithValues,
      diff,
    });
  };
  
  // Обработчики для редактирования портфелей
  const handleSavePortfolio = (updatedPortfolio: AssetNode) => {
    if (activeEditor === 'current') {
      setPortfolioState(prev => ({
        ...prev,
        current: updatedPortfolio,
      }));
    } else if (activeEditor === 'desired') {
      setPortfolioState(prev => ({
        ...prev,
        desired: updatedPortfolio,
      }));
    }
    
    setActiveEditor(null);
    // Пересчитываем балансировку с новыми данными
    setTimeout(calculateBalancing, 0);
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Балансировщик портфеля</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <Tabs defaultValue="current" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="current">Текущий портфель</TabsTrigger>
              <TabsTrigger value="desired">Желаемый портфель</TabsTrigger>
              <TabsTrigger value="diff">Необходимые изменения</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Dialog open={activeEditor !== null} onOpenChange={(open) => !open && setActiveEditor(null)}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveEditor('current')}>
                    <Edit2 className="mr-2 h-4 w-4" /> 
                    Редактировать текущий
                  </Button>
                </DialogTrigger>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setActiveEditor('desired')}>
                    <Edit2 className="mr-2 h-4 w-4" /> 
                    Редактировать желаемый
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                  {activeEditor === 'current' && (
                    <PortfolioEditor
                      portfolioData={portfolioState.current}
                      type="current"
                      onSave={handleSavePortfolio}
                    />
                  )}
                  {activeEditor === 'desired' && (
                    <PortfolioEditor
                      portfolioData={portfolioState.desired}
                      type="desired"
                      onSave={handleSavePortfolio}
                    />
                  )}
                </DialogContent>
              </Dialog>
              
              <Button onClick={calculateBalancing}>
                Пересчитать балансировку
              </Button>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <TabsContent value="current" className="mt-0">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Текущая структура портфеля</CardTitle>
                  <CardDescription>
                    Древовидное представление текущего состояния вашего портфеля
                  </CardDescription>
                </CardHeader>
                
                <PortfolioTreeChart 
                  data={portfolioState.current} 
                  type="current" 
                />
              </TabsContent>
              
              <TabsContent value="desired" className="mt-0">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Желаемая структура портфеля</CardTitle>
                  <CardDescription>
                    Структура портфеля, к которой вы стремитесь
                  </CardDescription>
                </CardHeader>
                
                <PortfolioTreeChart 
                  data={portfolioState.desired} 
                  type="desired" 
                />
              </TabsContent>
              
              <TabsContent value="diff" className="mt-0">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Необходимые изменения в портфеле</CardTitle>
                  <CardDescription>
                    Операции, которые нужно выполнить для достижения желаемой структуры
                  </CardDescription>
                </CardHeader>
                
                {portfolioState.diff ? (
                  <>
                    <PortfolioTreeChart 
                      data={portfolioState.diff} 
                      type="diff" 
                    />
                    
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-4">Список операций</h3>
                      <PortfolioOperationsTable 
                        operations={generateOperationsList(
                          portfolioState.diff,
                          portfolioState.current,
                          portfolioState.desired
                        )} 
                      />
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    Нажмите "Пересчитать балансировку" для расчета необходимых изменений
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </div>
  );
} 