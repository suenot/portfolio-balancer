"use client";

import React, { useRef, useEffect } from 'react';
import cytoscape from 'cytoscape';
import { AssetNode } from '@/lib/types';

interface PortfolioTreeCytoscapeProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
  onNodeClick?: (node: AssetNode) => void;
}

export default function PortfolioTreeCytoscape({
  data,
  type,
  onNodeClick,
}: PortfolioTreeCytoscapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);

  // Функция для форматирования валюты
  const formatCurrency = (value: number, quoteId?: string) => {
    const currency = quoteId || 'USD';
    
    // Если валюта - криптовалюта, форматируем с большим количеством знаков
    const isCrypto = ['BTC', 'ETH', 'USDT'].includes(currency);
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: isCrypto ? 'USD' : currency,
      maximumFractionDigits: isCrypto ? 8 : 0,
    }).format(value).replace('$', isCrypto ? currency + ' ' : '');
  };
  
  // Функция для форматирования процентов
  const formattedPercentage = (percentage?: number) => {
    if (percentage === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(percentage / 100);
  };

  // Функция для преобразования данных в формат Cytoscape
  const convertToCytoscapeFormat = (node: AssetNode, parentId?: string): cytoscape.ElementDefinition[] => {
    const result: cytoscape.ElementDefinition[] = [];
    
    // Создаем метку для узла в зависимости от типа визуализации
    let label = node.name;
    let sublabel = formatCurrency(node.value, node.quoteId);
    
    if (type === 'current' || type === 'desired') {
      sublabel += node.percentage !== undefined ? ` (${formattedPercentage(node.percentage)})` : '';
    } else if (type === 'diff' && node.operation) {
      const operationText = node.operation === 'buy' ? 'Buy' : 
                          node.operation === 'sell' ? 'Sell' : 'Hold';
      sublabel = `${operationText}: ${sublabel}`;
    }
    
    // Определяем цвет узла
    let bgColor = '#f3f4f6'; // gray-100, по умолчанию
    let borderColor = '#9ca3af'; // gray-400, по умолчанию
    
    if (type === 'current') {
      bgColor = '#dbeafe'; // blue-100
      borderColor = '#3b82f6'; // blue-500
    } else if (type === 'desired') {
      bgColor = '#f3e8ff'; // purple-100
      borderColor = '#a855f7'; // purple-500
    } else if (type === 'diff' && node.operation) {
      if (node.operation === 'buy') {
        bgColor = '#dcfce7'; // green-100
        borderColor = '#22c55e'; // green-500
      } else if (node.operation === 'sell') {
        bgColor = '#fee2e2'; // red-100
        borderColor = '#ef4444'; // red-500
      }
    }
    
    // Добавляем узел
    result.push({
      data: {
        id: node.id,
        label,
        sublabel,
        originalNode: node, // Сохраняем оригинальный узел для обработчика клика
        bgColor,
        borderColor,
        parentId,
      },
    });
    
    // Добавляем связи с родительским узлом
    if (parentId) {
      result.push({
        data: {
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
        },
      });
    }
    
    // Обрабатываем дочерние узлы рекурсивно
    if (node.children && node.children.length > 0) {
      node.children.forEach(child => {
        result.push(...convertToCytoscapeFormat(child, node.id));
      });
    }
    
    return result;
  };

  useEffect(() => {
    if (!containerRef.current || !data) return;
    
    // Подготавливаем данные для Cytoscape
    const elements = convertToCytoscapeFormat(data);
    
    // Создаем экземпляр Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(bgColor)',
            'border-color': 'data(borderColor)',
            'border-width': 2,
            'width': '180px',
            'height': '80px',
            'shape': 'roundrectangle',
            'font-size': '12px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-wrap': 'wrap',
            'text-max-width': '160px',
            'label': 'data(label)',
            'color': '#000000',
            'padding': '10px',
          }
        },
        {
          selector: 'node[sublabel]',
          style: {
            'label': function(ele: cytoscape.NodeSingular) {
              return ele.data('label') + '\n' + ele.data('sublabel');
            },
            'text-wrap': 'wrap',
            'text-max-width': '160px',
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '10px',
            'color': '#4b5563',
            'text-background-opacity': 0,
            'text-background-padding': '2px',
            'text-border-opacity': 0,
            'text-events': 'yes'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': '2px',
            'line-color': '#cbd5e1',
            'target-arrow-color': '#cbd5e1',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier'
          } as cytoscape.Css.Edge
        }
      ],
      layout: {
        name: 'breadthfirst' as const, // Используем алгоритм "breadthfirst" для автоматического размещения
        directed: true, // Направленный граф
        padding: 30, // Отступы от края
        spacingFactor: 1.2, // Фактор расстояния между узлами
        avoidOverlap: true, // Избегать перекрытия узлов
        roots: [data.id], // Корневой узел (должен быть массивом для Cytoscape)
        animate: true, // Анимация при построении
      }
    });
    
    // Добавляем обработчик клика на узел
    cy.on('tap', 'node', (event) => {
      if (onNodeClick) {
        const node = event.target.data('originalNode');
        if (node) {
          onNodeClick(node);
        }
      }
    });
    
    // Сохраняем экземпляр для возможного доступа позже
    cyRef.current = cy;
    
    // Центрируем и масштабируем граф
    cy.fit();
    cy.center();
    
    // Очистка при размонтировании
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
      style={{ 
        width: '100%', 
        height: '700px', 
        border: '1px solid #e5e7eb', 
        borderRadius: '8px',
        overflow: 'hidden'
      }} 
    />
  );
} 