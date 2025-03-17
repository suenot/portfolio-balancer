"use client";

import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { AssetNode } from '@/lib/types';

interface PortfolioTreeD3Props {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
  onNodeClick?: (node: AssetNode) => void;
}

export default function PortfolioTreeD3({
  data,
  type,
  onNodeClick,
}: PortfolioTreeD3Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Цвета для различных операций
  const operationColors: Record<string, string> = {
    buy: '#dcfce7', // green-100
    sell: '#fee2e2', // red-100
    hold: '#f3f4f6', // gray-100
  };

  // Цвета для разных типов портфелей
  const typeColors: Record<string, string> = {
    current: '#dbeafe', // blue-100
    desired: '#f3e8ff', // purple-100
    diff: '#f3f4f6', // gray-100
  };

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
  
  const formattedPercentage = (percentage?: number) => {
    if (percentage === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(percentage / 100);
  };

  // Создаем D3 дерево при монтировании компонента
  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Очищаем предыдущую визуализацию
    d3.select(svgRef.current).selectAll('*').remove();

    // Размеры и отступы
    const margin = { top: 40, right: 90, bottom: 50, left: 90 };
    const width = 1200 - margin.left - margin.right; // Увеличена ширина
    const height = 900 - margin.top - margin.bottom; // Увеличена высота

    // Создаем корневой элемент SVG с возможностью масштабирования
    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Добавляем возможность масштабирования и панорамирования
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        svg.attr('transform', event.transform);
      });

    d3.select(svgRef.current)
      .call(zoom as any)
      .on('dblclick.zoom', null); // Отключаем встроенное масштабирование по двойному клику

    // Преобразуем наши данные в формат, подходящий для d3.hierarchy
    const hierarchyData = d3.hierarchy(data);

    // Рассчитываем размер дерева с учетом количества узлов
    const nodeCount = hierarchyData.descendants().length;
    const leafCount = hierarchyData.leaves().length;

    // Динамически корректируем размер в зависимости от количества узлов
    const nodeSize: [number, number] = [
      Math.max(50, 100 - Math.log(nodeCount) * 5), // Динамическое расстояние между рядами
      Math.max(180, 200 - Math.log(nodeCount) * 5) // Динамическое расстояние между узлами в ряду
    ];

    // Создаем layout для дерева с настраиваемым размером узлов
    const treeLayout = d3.tree<AssetNode>()
      .size([height, width])
      .nodeSize(nodeSize)
      .separation((a, b) => {
        // Увеличиваем расстояние между узлами, особенно если они находятся в разных поддеревьях
        return a.parent === b.parent ? 1.2 : 2.0;
      });

    // Применяем layout к данным
    const treeData = treeLayout(hierarchyData);

    // Находим минимальные и максимальные координаты для центрирования
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    
    treeData.descendants().forEach(d => {
      minX = Math.min(minX, d.x);
      maxX = Math.max(maxX, d.x);
      minY = Math.min(minY, d.y);
      maxY = Math.max(maxY, d.y);
    });
    
    // Вычисляем смещение для центрирования
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;
    
    // Добавляем связи между узлами
    svg.selectAll('.link')
      .data(treeData.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<AssetNode>, d3.HierarchyPointNode<AssetNode>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('stroke-width', 1.5);

    // Создаем группы для узлов
    const nodes = svg.selectAll('.node')
      .data(treeData.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .on('click', (event, d) => {
        if (onNodeClick) {
          event.stopPropagation();
          onNodeClick(d.data);
        }
      });

    // Добавляем прямоугольники для узлов
    nodes.append('rect')
      .attr('width', 140)
      .attr('height', 70)
      .attr('x', -70)
      .attr('y', -35)
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('fill', d => {
        if (type === 'diff' && d.data.operation) {
          return operationColors[d.data.operation] || typeColors[type];
        }
        return typeColors[type];
      })
      .attr('stroke', d => {
        if (type === 'diff' && d.data.operation) {
          return d.data.operation === 'buy' ? '#22c55e' : 
                 d.data.operation === 'sell' ? '#ef4444' : '#9ca3af';
        }
        return type === 'current' ? '#3b82f6' : 
               type === 'desired' ? '#a855f7' : '#9ca3af';
      })
      .attr('stroke-width', 1.5);

    // Добавляем название актива
    nodes.append('text')
      .attr('dy', '-15')
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => {
        // Сокращаем длинные названия
        const name = d.data.name;
        return name.length > 13 ? `${name.slice(0, 12)}…` : name;
      })
      .append('title') // Добавляем полное название при наведении
      .text(d => d.data.name);

    // Добавляем значение
    nodes.append('text')
      .attr('dy', '5')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .text(d => formatCurrency(d.data.value, d.data.quoteId));

    // Добавляем процент для текущего и желаемого типов
    if (type !== 'diff') {
      nodes.append('text')
        .attr('dy', '20')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => {
          if (d.data.percentage !== undefined) {
            return `Share: ${formattedPercentage(d.data.percentage)}`;
          }
          return '';
        });
    }

    // Добавляем операцию для diff типа
    if (type === 'diff') {
      nodes.append('text')
        .attr('dy', '20')
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('fill', d => {
          if (d.data.operation === 'buy') return '#16a34a';
          if (d.data.operation === 'sell') return '#dc2626';
          return '#6b7280';
        })
        .text(d => {
          if (d.data.operation === 'buy') return 'Buy';
          if (d.data.operation === 'sell') return 'Sell';
          if (d.data.operation === 'hold') return 'Hold';
          return '';
        });
    }

    // Автоматически центрируем и масштабируем представление
    svg.attr('transform', 'translate(0,0)');
    
    // Начальное масштабирование для отображения всего дерева
    const initialScale = Math.min(
      width / (maxY - minY + 200),
      height / (maxX - minX + 200),
      1.0 // Максимальный масштаб
    );
    
    // Применяем масштабирование и центрирование
    const initialTransform = d3.zoomIdentity
      .translate(width / 2 - (maxY + minY) / 2 * initialScale, height / 2 - (maxX + minX) / 2 * initialScale)
      .scale(initialScale * 0.8); // Небольшой отступ по краям
      
    d3.select(svgRef.current).call(zoom.transform as any, initialTransform);

  }, [data, type, onNodeClick]);

  return (
    <div style={{ width: '100%', height: '900px', overflow: 'hidden' }}>
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
} 