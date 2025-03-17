export interface AssetNode {
  id: string;
  name: string;
  value: number; // текущая сумма
  quoteId?: string; // идентификатор валюты/котировки (USD, RUB, BTC, ETH и т.д.)
  percentage?: number; // текущий процент от родителя
  desiredPercentage?: number; // желаемый процент от родителя
  children?: AssetNode[]; // дочерние активы
  parentId?: string; // id родительского узла
  operation?: 'buy' | 'sell' | 'hold'; // операция для diff-дерева
}

export interface PortfolioState {
  current: AssetNode; // текущее дерево портфеля
  desired: AssetNode; // желаемое дерево портфеля (в процентах)
  diff?: AssetNode; // разница между текущим и желаемым (что нужно купить/продать)
}

export interface FlowNode {
  id: string;
  type: string;
  data: AssetNode;
  position: { x: number; y: number };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export type AssetOperation = 'buy' | 'sell' | 'hold';

export interface AssetDiff {
  id: string;
  name: string;
  currentValue: number;
  desiredValue: number;
  diffValue: number;
  operation: AssetOperation;
  quoteId?: string;
} 