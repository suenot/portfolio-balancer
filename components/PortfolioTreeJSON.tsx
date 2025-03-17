"use client";

import React from 'react';
import { AssetNode } from '@/lib/types';

interface PortfolioTreeJSONProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
}

export default function PortfolioTreeJSON({
  data,
  type,
}: PortfolioTreeJSONProps) {
  // Функция для предварительной обработки данных перед отображением
  const prepareData = (node: AssetNode, type: 'current' | 'desired' | 'diff') => {
    const processedNode = { ...node };
    
    // Убираем лишние поля, которые не нужно показывать в JSON
    if (type === 'current') {
      // Для текущего представления нам нужны только текущие значения
      delete processedNode.desiredPercentage;
      delete processedNode.diffValue;
      delete processedNode.operation;
    } else if (type === 'desired') {
      // Для желаемого представления фокусируемся на целевых процентах
      delete processedNode.diffValue;
      delete processedNode.operation;
    }
    
    // Рекурсивно обрабатываем детей
    if (processedNode.children) {
      processedNode.children = processedNode.children.map(child => prepareData(child, type));
    }
    
    return processedNode;
  };
  
  // Подготавливаем данные для отображения
  const processedData = prepareData(data, type);
  
  // Преобразуем объект в отформатированную строку JSON с отступами
  const formattedJson = JSON.stringify(processedData, null, 2);
  
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-auto max-h-[700px]">
      <h3 className="text-lg font-semibold mb-2 text-gray-700">
        {type === 'current' ? 'Current Portfolio' : 
         type === 'desired' ? 'Desired Portfolio' : 'Portfolio Difference'}
      </h3>
      <pre className="text-sm whitespace-pre-wrap font-mono bg-white p-4 rounded shadow-inner overflow-auto">
        {formattedJson}
      </pre>
    </div>
  );
} 