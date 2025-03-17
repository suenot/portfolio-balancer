"use client";

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog';
import { AssetNode, PortfolioState, RenderingEngine } from '@/lib/types';
import { calculatePercentages, calculateDesiredValues, calculateDiffTree, generateOperationsList } from '@/lib/portfolio-utils';
import PortfolioRenderer from './PortfolioRenderer';
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
        { 
          id: 'stocks-rus', 
          name: 'Российские', 
          value: 150000, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-rus-1', name: 'Газпром', value: 30000, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-2', name: 'Сбербанк', value: 30000, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-3', name: 'Роснефть', value: 30000, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-4', name: 'Лукойл', value: 30000, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-5', name: 'ВТБ', value: 30000, quoteId: 'USD', parentId: 'stocks-rus' },
          ]
        },
        { 
          id: 'stocks-usa', 
          name: 'Американские', 
          value: 150000, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-usa-1', name: 'Apple', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-2', name: 'Microsoft', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-3', name: 'Amazon', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-4', name: 'Google', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-5', name: 'Facebook', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-6', name: 'Tesla', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-7', name: 'NVIDIA', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-8', name: 'Netflix', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-9', name: 'Intel', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-10', name: 'AMD', value: 15000, quoteId: 'USD', parentId: 'stocks-usa' },
          ]
        },
        { 
          id: 'stocks-chn', 
          name: 'Китайские', 
          value: 100000, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-chn-1', name: 'Alibaba', value: 20000, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-2', name: 'Tencent', value: 20000, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-3', name: 'Baidu', value: 20000, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-4', name: 'JD.com', value: 20000, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-5', name: 'PDD', value: 20000, quoteId: 'USD', parentId: 'stocks-chn' },
          ]
        },
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
        { 
          id: 'stocks-rus', 
          name: 'Российские', 
          desiredPercentage: 30, 
          value: 0, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-rus-1', name: 'Газпром', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-2', name: 'Сбербанк', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-3', name: 'Роснефть', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-4', name: 'Лукойл', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-rus' },
            { id: 'stocks-rus-5', name: 'ВТБ', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-rus' },
          ]
        },
        { 
          id: 'stocks-usa', 
          name: 'Американские', 
          desiredPercentage: 40, 
          value: 0, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-usa-1', name: 'Apple', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-2', name: 'Microsoft', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-3', name: 'Amazon', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-4', name: 'Google', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-5', name: 'Facebook', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-6', name: 'Tesla', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-7', name: 'NVIDIA', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-8', name: 'Netflix', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-9', name: 'Intel', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
            { id: 'stocks-usa-10', name: 'AMD', desiredPercentage: 10, value: 0, quoteId: 'USD', parentId: 'stocks-usa' },
          ]
        },
        { 
          id: 'stocks-chn', 
          name: 'Китайские', 
          desiredPercentage: 30, 
          value: 0, 
          quoteId: 'USD', 
          parentId: 'stocks',
          children: [
            { id: 'stocks-chn-1', name: 'Alibaba', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-2', name: 'Tencent', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-3', name: 'Baidu', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-4', name: 'JD.com', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-chn' },
            { id: 'stocks-chn-5', name: 'PDD', desiredPercentage: 20, value: 0, quoteId: 'USD', parentId: 'stocks-chn' },
          ]
        },
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
    current: calculatePercentages(sampleCurrentPortfolio),
    desired: calculatePercentages(sampleDesiredPortfolio),
  });
  const [selectedNode, setSelectedNode] = useState<AssetNode | null>(null);
  const [operationsVisible, setOperationsVisible] = useState(false);
  const [renderingEngine, setRenderingEngine] = useState<RenderingEngine>('reactflow');
  
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
    setPortfolioState(prev => ({
      ...prev,
      current: updatedPortfolio,
    }));
    // Пересчитываем балансировку с новыми данными
    setTimeout(calculateBalancing, 0);
  };
  
  const handleSaveDesiredPortfolio = (updatedPortfolio: AssetNode) => {
    setPortfolioState(prev => ({
      ...prev,
      desired: updatedPortfolio,
    }));
    // Пересчитываем балансировку с новыми данными
    setTimeout(calculateBalancing, 0);
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Балансировка портфеля</h1>
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="current">Текущий портфель</TabsTrigger>
          <TabsTrigger value="desired">Желаемый портфель</TabsTrigger>
          <TabsTrigger value="diff">Изменения</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Текущий портфель</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                    <PortfolioEditor 
                      portfolioData={portfolioState.current} 
                      type="current"
                      onSave={handleSavePortfolio}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Текущее распределение активов в вашем портфеле
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioRenderer 
                data={portfolioState.current}
                type="current"
                engine={renderingEngine}
                onEngineChange={setRenderingEngine}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="desired">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Желаемый портфель</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
                    <PortfolioEditor 
                      portfolioData={portfolioState.desired} 
                      type="desired"
                      onSave={handleSaveDesiredPortfolio}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                Целевое распределение активов в процентах
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PortfolioRenderer 
                data={portfolioState.desired}
                type="desired"
                engine={renderingEngine}
                onEngineChange={setRenderingEngine}
                onNodeClick={(node) => setSelectedNode(node)}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="diff">
          <Card>
            <CardHeader>
              <CardTitle>Необходимые изменения</CardTitle>
              <CardDescription>
                Операции для приведения текущего портфеля к желаемому
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolioState.diff ? (
                <>
                  <div className="mb-6">
                    <Button 
                      onClick={() => setOperationsVisible(!operationsVisible)}
                      className="mb-4"
                    >
                      {operationsVisible ? 'Скрыть список операций' : 'Показать список операций'}
                    </Button>
                    
                    {operationsVisible && (
                      <PortfolioOperationsTable 
                        operations={generateOperationsList(
                          portfolioState.diff,
                          portfolioState.current,
                          portfolioState.desired
                        )}
                      />
                    )}
                  </div>
                  
                  <PortfolioRenderer 
                    data={portfolioState.diff}
                    type="diff"
                    engine={renderingEngine}
                    onEngineChange={setRenderingEngine}
                    onNodeClick={(node) => setSelectedNode(node)}
                  />
                </>
              ) : (
                <div className="text-center p-8">
                  <p className="mb-4">Нет данных для отображения. Сначала выполните расчет.</p>
                  <Button onClick={calculateBalancing}>Рассчитать балансировку</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 