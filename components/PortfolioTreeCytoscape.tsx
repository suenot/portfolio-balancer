"use client";

import React, { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import { AssetNode } from '@/lib/types';

interface PortfolioTreeCytoscapeProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
  onNodeClick?: (node: AssetNode) => void;
}

// Расширяем типы для данных узла Cytoscape
interface NodeData {
  id: string;
  name: string;
  value: number;
  desiredPercentage?: number;
  quoteId?: string;
  diffValue?: number;
  depth: number;
  parent?: string;
  originalData: AssetNode;
}

export default function PortfolioTreeCytoscape({
  data,
  type,
  onNodeClick,
}: PortfolioTreeCytoscapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Функция для преобразования данных в формат для Cytoscape
  const transformDataForCytoscape = (node: AssetNode) => {
    // Список элементов для Cytoscape
    const elements: cytoscape.ElementDefinition[] = [];
    
    // Функция для рекурсивного обхода дерева
    const traverse = (node: AssetNode, depth: number) => {
      // Добавляем узел
      elements.push({
        data: {
          id: node.id,
          name: node.name,
          value: node.value,
          desiredPercentage: node.desiredPercentage,
          quoteId: node.quoteId,
          diffValue: node.diffValue,
          depth: depth,
          parent: node.parentId,
          originalData: node,
        },
      });
      
      // Если у узла есть родитель, добавляем ребро
      if (node.parentId) {
        elements.push({
          data: {
            id: `edge-${node.parentId}-${node.id}`,
            source: node.parentId,
            target: node.id,
          },
        });
      }
      
      // Обрабатываем дочерние узлы
      if (node.children) {
        node.children.forEach(child => {
          traverse(child, depth + 1);
        });
      }
    };
    
    // Начинаем обход с корневого узла
    traverse(node, 0);
    
    return elements;
  };

  // Получаем стиль для узлов в зависимости от типа визуализации
  const getNodeStyle = () => {
    const baseStyle: Partial<cytoscape.Css.Node> = {
      'shape': 'round-rectangle',
      'width': 'label',
      'height': 'label',
      'text-valign': 'center',
      'text-halign': 'center',
      'padding': '10px',
      'border-width': 2,
      'border-color': '#888',
      'font-size': '12px',
      'text-wrap': 'wrap',
      'text-max-width': '120px',
    };
    
    // Разные цвета для разных типов визуализации
    switch (type) {
      case 'current':
        return {
          ...baseStyle,
          'background-color': '#e3f2fd',
          'border-color': '#2196f3',
        };
      case 'desired':
        return {
          ...baseStyle,
          'background-color': '#e8f5e9',
          'border-color': '#4caf50',
        };
      case 'diff':
        return {
          ...baseStyle,
          'background-color': '#ffebee',
          'border-color': '#f44336',
        };
      default:
        return baseStyle;
    }
  };

  useEffect(() => {
    if (!containerRef.current || !data) return;
    
    // Преобразуем данные для Cytoscape
    const elements = transformDataForCytoscape(data);
    
    // Создаем экземпляр Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: [
        // Стиль для узлов
        {
          selector: 'node',
          style: {
            ...getNodeStyle(),
            'label': (el) => {
              const nodeData = el.data() as NodeData;
              let labelText = nodeData.name;
              
              // Добавляем значение в зависимости от типа визуализации
              if (type === 'current') {
                labelText += `\n${nodeData.value.toLocaleString()} ${nodeData.quoteId || ''}`;
              } else if (type === 'desired') {
                labelText += `\n${nodeData.desiredPercentage || 0}%`;
              } else if (type === 'diff') {
                labelText += `\n${nodeData.diffValue?.toLocaleString() || 0} ${nodeData.quoteId || ''}`;
              }
              
              return labelText;
            },
          } as any,
        },
        // Стиль для ребер
        {
          selector: 'edge',
          style: {
            'width': 2,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
          } as any,
        },
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        padding: 30,
        spacingFactor: 1.5,
        animate: true,
      },
    });
    
    // Добавляем обработчик клика по узлу
    cy.on('tap', 'node', (evt) => {
      if (onNodeClick) {
        const nodeData = evt.target.data('originalData') as AssetNode;
        onNodeClick(nodeData);
      }
    });
    
    // Сохраняем экземпляр Cytoscape для возможного использования позже
    cyRef.current = cy;
    
    // Центрируем граф
    cy.fit();
    cy.center();
    
    // Очищаем ресурсы при размонтировании
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [data, type, onNodeClick]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '700px', border: '1px solid #ddd' }}
    />
  );
} 