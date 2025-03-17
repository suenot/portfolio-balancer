"use client";

import React, { useMemo } from 'react';
import ReactFlow, {
  ConnectionLineType,
  Controls,
  Background,
  BackgroundVariant,
  Edge as FlowEdge,
  Node as FlowNode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { AssetNode } from '@/lib/types';
import PortfolioTreeNode from './PortfolioTreeNode';

// Регистрируем кастомные узлы
const nodeTypes = {
  portfolioNode: PortfolioTreeNode,
};

interface PortfolioTreeChartProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
  onNodeClick?: (node: AssetNode) => void;
}

export default function PortfolioTreeChart({
  data,
  type,
  onNodeClick,
}: PortfolioTreeChartProps) {
  // Преобразуем дерево активов в формат для ReactFlow
  const { nodes, edges } = useMemo(() => {
    const flowNodes: FlowNode[] = [];
    const flowEdges: FlowEdge[] = [];
    
    function processNode(
      node: AssetNode, 
      level: number, 
      position: { x: number, y: number },
      horizontalGap: number,
    ) {
      // Создаем узел для ReactFlow
      flowNodes.push({
        id: node.id,
        type: 'portfolioNode',
        position,
        data: { node, type },
      });
      
      // Если у узла есть дети, создаем связи и рекурсивно обрабатываем
      if (node.children && node.children.length > 0) {
        // Рассчитываем расположение дочерних узлов
        const childCount = node.children.length;
        const startX = position.x - (horizontalGap * (childCount - 1)) / 2;
        const childY = position.y + 150; // Вертикальный отступ
        
        node.children.forEach((child, index) => {
          // Создаем связь от родителя к дочернему узлу
          flowEdges.push({
            id: `e-${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            type: 'smoothstep',
          });
          
          // Рассчитываем позицию дочернего узла
          const childX = startX + index * horizontalGap;
          const childPosition = { x: childX, y: childY };
          
          // Рекурсивно обрабатываем дочерний узел
          const nextHorizontalGap = horizontalGap * 0.7; // Уменьшаем отступ для следующего уровня
          processNode(child, level + 1, childPosition, nextHorizontalGap);
        });
      }
    }
    
    // Начинаем с корневого узла
    processNode(data, 0, { x: 0, y: 0 }, 300);
    
    return { nodes: flowNodes, edges: flowEdges };
  }, [data, type]);
  
  // Обработчик клика по узлу
  const handleNodeClick = (_: React.MouseEvent, node: FlowNode) => {
    if (onNodeClick) {
      onNodeClick(node.data.node);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '500px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 