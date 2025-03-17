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
    
    // Константы для размещения
    const NODE_WIDTH = 180;      // Ширина узла
    const NODE_HEIGHT = 100;     // Высота узла
    const HORIZONTAL_GAP = 40;   // Горизонтальный отступ между узлами в одном ряду
    const VERTICAL_GAP = 100;    // Вертикальный отступ между рядами узлов
    const PARENT_CHILD_GAP = 150; // Вертикальный отступ между родителем и дочерними узлами
    const GROUP_GAP = 100;      // Горизонтальный отступ между группами узлов
    const MAX_NODES_PER_ROW = 5; // Максимальное количество узлов в одном ряду для листового уровня
    
    // Создание карты с информацией о каждом узле
    const nodeInfoMap = new Map<string, {
      node: AssetNode,
      level: number,
      childCount: number,
      width: number,
    }>();
    
    // Первый проход: вычисляем данные каждого узла
    function calculateNodeInfo(node: AssetNode, level: number): number {
      let childrenCount = 0;
      let nodeWidth = NODE_WIDTH;
      
      if (node.children && node.children.length > 0) {
        // Для промежуточных узлов (с детьми)
        node.children.forEach(child => {
          childrenCount += calculateNodeInfo(child, level + 1);
        });
        
        // Узел должен быть как минимум шириной своих детей
        nodeWidth = Math.max(nodeWidth, childrenCount * NODE_WIDTH + (childrenCount - 1) * HORIZONTAL_GAP);
      } else {
        // Для листовых узлов
        childrenCount = 1;
      }
      
      nodeInfoMap.set(node.id, {
        node,
        level,
        childCount: childrenCount,
        width: nodeWidth,
      });
      
      return childrenCount;
    }
    
    // Вычисляем данные для всех узлов
    calculateNodeInfo(data, 0);
    
    // Второй проход: размещаем узлы
    function positionNodes(
      node: AssetNode, 
      x: number, 
      y: number
    ) {
      const nodeInfo = nodeInfoMap.get(node.id);
      if (!nodeInfo) return { width: NODE_WIDTH, bottomY: y + NODE_HEIGHT };
      
      // Создаем узел для ReactFlow
      flowNodes.push({
        id: node.id,
        type: 'portfolioNode',
        position: { x, y },
        data: { node, type },
      });
      
      // Если у узла нет детей, просто возвращаем его размеры
      if (!node.children || node.children.length === 0) {
        return { width: NODE_WIDTH, bottomY: y + NODE_HEIGHT };
      }
      
      let currentX = x - (nodeInfo.width / 2);
      let maxBottomY = y + NODE_HEIGHT;
      
      // Обрабатываем каждую группу детей
      node.children.forEach(child => {
        const childInfo = nodeInfoMap.get(child.id);
        if (!childInfo) return;
        
        // Размещаем группу детей на следующем уровне
        const childY = y + PARENT_CHILD_GAP;
        const childX = currentX + (childInfo.width / 2);
        
        // Создаем ребро от родителя к ребенку
        flowEdges.push({
          id: `e-${node.id}-${child.id}`,
          source: node.id,
          target: child.id,
          type: 'smoothstep',
        });
        
        // Рекурсивно размещаем детей текущего узла
        const { width: actualWidth, bottomY } = positionNodes(child, childX, childY);
        maxBottomY = Math.max(maxBottomY, bottomY);
        
        // Обновляем текущую X-позицию
        currentX += actualWidth + GROUP_GAP;
      });
      
      // Для листовых уровней (акции, облигации и т.д.)
      if (nodeInfo.level >= 2) {
        // Для обработки глубоких уровней используем многорядное размещение
        let currentLeafX = x - (nodeInfo.width / 2);
        let currentLeafY = y + PARENT_CHILD_GAP;
        let itemsInCurrentRow = 0;
        
        node.children.forEach(child => {
          // Создаем ребро от родителя к дочернему узлу
          flowEdges.push({
            id: `e-${node.id}-${child.id}`,
            source: node.id,
            target: child.id,
            type: 'smoothstep',
          });
          
          // Размещаем листовые узлы в ряды
          flowNodes.push({
            id: child.id,
            type: 'portfolioNode',
            position: { x: currentLeafX + NODE_WIDTH/2, y: currentLeafY },
            data: { node: child, type },
          });
          
          // Обновляем позицию для следующего узла
          currentLeafX += NODE_WIDTH + HORIZONTAL_GAP;
          itemsInCurrentRow++;
          
          // Переход к следующему ряду, если текущий заполнен
          if (itemsInCurrentRow >= MAX_NODES_PER_ROW && 
              node.children && 
              node.children.indexOf(child) < node.children.length - 1) {
            currentLeafX = x - (nodeInfo.width / 2);
            currentLeafY += NODE_HEIGHT + VERTICAL_GAP;
            itemsInCurrentRow = 0;
            
            // Обновляем максимальную Y-позицию
            maxBottomY = Math.max(maxBottomY, currentLeafY + NODE_HEIGHT);
          }
        });
      }
      
      return { width: nodeInfo.width, bottomY: maxBottomY };
    }
    
    // Начинаем размещение с корневого узла
    positionNodes(data, 0, 0);
    
    return { nodes: flowNodes, edges: flowEdges };
  }, [data, type]);
  
  // Обработчик клика по узлу
  const handleNodeClick = (_: React.MouseEvent, node: FlowNode) => {
    if (onNodeClick) {
      onNodeClick(node.data.node);
    }
  };
  
  return (
    <div style={{ width: '100%', height: '700px' }}> {/* Увеличиваем высоту для больших деревьев */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-left"
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 