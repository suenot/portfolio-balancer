"use client";

import React from 'react';
import { AssetNode } from '@/lib/types';
import { Card, CardContent } from './ui/card';

interface PortfolioTreeJSONProps {
  data: AssetNode;
  type: 'current' | 'desired' | 'diff';
}

export default function PortfolioTreeJSON({
  data,
  type,
}: PortfolioTreeJSONProps) {
  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2">
          {type === 'current' ? 'Текущий портфель' : 
           type === 'desired' ? 'Желаемый портфель' : 
           'Разница портфелей'} (JSON)
        </h3>
        <div className="bg-slate-100 p-4 rounded-md overflow-auto max-h-[600px]">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
} 