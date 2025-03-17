"use client";

import React from 'react';
import { AssetNode, RenderingEngine } from '@/lib/types';
import PortfolioTreeChart from './PortfolioTreeChart';
import PortfolioTreeD3 from './PortfolioTreeD3';
import PortfolioTreeCytoscape from './PortfolioTreeCytoscape';
import PortfolioTreeJSON from './PortfolioTreeJSON';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface PortfolioRendererProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
  engine: RenderingEngine;
  onEngineChange: (engine: RenderingEngine) => void;
  onNodeClick?: (node: AssetNode) => void;
}

export default function PortfolioRenderer({
  data,
  type,
  engine,
  onEngineChange,
  onNodeClick,
}: PortfolioRendererProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Label htmlFor="engine-select">Движок отрисовки:</Label>
        <Select
          value={engine}
          onValueChange={(value) => onEngineChange(value as RenderingEngine)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Выберите движок" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="reactflow">React Flow</SelectItem>
            <SelectItem value="d3">D3.js</SelectItem>
            <SelectItem value="cytoscape">Cytoscape</SelectItem>
            <SelectItem value="json">JSON (raw)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {engine === 'reactflow' && (
        <PortfolioTreeChart 
          data={data} 
          type={type} 
          onNodeClick={onNodeClick} 
        />
      )}
      
      {engine === 'd3' && (
        <PortfolioTreeD3 
          data={data} 
          type={type} 
          onNodeClick={onNodeClick} 
        />
      )}
      
      {engine === 'cytoscape' && (
        <PortfolioTreeCytoscape 
          data={data} 
          type={type} 
          onNodeClick={onNodeClick} 
        />
      )}
      
      {engine === 'json' && (
        <PortfolioTreeJSON 
          data={data} 
          type={type} 
        />
      )}
    </div>
  );
} 