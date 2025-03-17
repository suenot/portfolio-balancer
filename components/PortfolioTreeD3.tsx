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

  // Цветовая схема в зависимости от типа
  const getColor = (nodeType: 'current' | 'desired' | 'diff') => {
    switch (nodeType) {
      case 'current':
        return d3.scaleOrdinal(d3.schemeBlues[9]);
      case 'desired':
        return d3.scaleOrdinal(d3.schemeGreens[9]);
      case 'diff':
        return d3.scaleOrdinal(d3.schemeReds[9]);
      default:
        return d3.scaleOrdinal(d3.schemeBlues[9]);
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Очистка перед рендерингом

    const width = 800;
    const height = 700;
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    
    // Настройка иерархии
    const hierarchy = d3.hierarchy(data);
    const treeLayout = d3.tree<typeof data>()
      .size([height - margin.top - margin.bottom, width - margin.right - margin.left]);
    
    // Применяем макет к данным
    const rootNode = treeLayout(hierarchy);
    
    // Создаем группу для графика и смещаем ее с учетом отступов
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Цветовая схема
    const color = getColor(type);
    
    // Рисуем связи
    g.selectAll(".link")
      .data(rootNode.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 2)
      .attr("d", d3.linkHorizontal<any, any>()
        .x(d => d.y)
        .y(d => d.x)
      );
    
    // Создаем группы для узлов
    const node = g.selectAll(".node")
      .data(rootNode.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        if (onNodeClick) {
          // Явное приведение типов 
          onNodeClick(d.data as AssetNode);
        }
      });
    
    // Добавляем круги для узлов
    node.append("circle")
      .attr("r", 10)
      .style("fill", d => {
        // Получаем глубину узла для определения цвета
        const depth = d.depth < 9 ? d.depth : 8;
        return color(depth.toString());
      })
      .style("stroke", "#fff")
      .style("stroke-width", 2);
    
    // Добавляем текст
    node.append("text")
      .attr("dy", ".35em")
      .attr("x", d => d.children ? -12 : 12)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => (d.data as AssetNode).name)
      .style("font-size", "12px");
    
    // Добавляем подпись со значением узла
    node.append("text")
      .attr("dy", "1.5em")
      .attr("x", d => d.children ? -12 : 12)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => {
        // Отображаем разную информацию в зависимости от типа визуализации
        const nodeData = d.data as AssetNode;
        if (type === 'current') {
          return `${nodeData.value.toLocaleString()} ${nodeData.quoteId || ''}`;
        } else if (type === 'desired') {
          return `${nodeData.desiredPercentage || 0}%`;
        } else if (type === 'diff') {
          return `${nodeData.diffValue?.toLocaleString() || 0} ${nodeData.quoteId || ''}`;
        }
        return "";
      })
      .style("font-size", "10px")
      .style("fill", "#666");
    
    // Добавляем функцию зума
    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });
    
    svg.call(zoom);
    
    // Центрируем граф
    svg.call(
      zoom.transform, 
      d3.zoomIdentity.translate(margin.left, height / 2)
    );
    
  }, [data, type, onNodeClick]);

  return (
    <div style={{ width: '100%', height: '700px', overflow: 'hidden' }}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 800 700"
        style={{ cursor: 'grab' }}
      />
    </div>
  );
} 