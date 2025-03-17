import { AssetDiff, AssetNode, AssetOperation } from './types';

// Рассчитывает процентное соотношение для каждого узла в дереве
export function calculatePercentages(node: AssetNode): AssetNode {
  if (!node.children || node.children.length === 0) {
    return node;
  }

  const totalValue = node.children.reduce((sum, child) => sum + child.value, 0);
  
  return {
    ...node,
    children: node.children.map(child => ({
      ...child,
      percentage: totalValue > 0 ? (child.value / totalValue) * 100 : 0,
      children: child.children 
        ? calculatePercentages(child).children 
        : undefined
    }))
  };
}

// Преобразует дерево с желаемыми процентами в дерево с суммами
export function calculateDesiredValues(
  currentRoot: AssetNode, 
  desiredRoot: AssetNode
): AssetNode {
  const totalValue = currentRoot.value;
  
  function processNode(desiredNode: AssetNode, parentValue: number): AssetNode {
    const desiredValue = (desiredNode.desiredPercentage || 0) * parentValue / 100;
    
    return {
      ...desiredNode,
      value: desiredValue,
      children: desiredNode.children 
        ? desiredNode.children.map(child => processNode(child, desiredValue))
        : undefined
    };
  }
  
  return processNode(desiredRoot, totalValue);
}

// Создает дерево разницы между текущим и желаемым портфелем
export function calculateDiffTree(
  current: AssetNode, 
  desired: AssetNode
): AssetNode {
  function processNode(
    currentNode: AssetNode, 
    desiredNode: AssetNode
  ): AssetNode {
    const diffValue = desiredNode.value - currentNode.value;
    const operation: AssetOperation = 
      diffValue > 0 ? 'buy' : 
      diffValue < 0 ? 'sell' : 'hold';
    
    return {
      id: currentNode.id,
      name: currentNode.name,
      value: Math.abs(diffValue),
      percentage: Math.abs(
        (desiredNode.percentage || 0) - (currentNode.percentage || 0)
      ),
      parentId: currentNode.parentId,
      operation,
      children: currentNode.children && desiredNode.children 
        ? currentNode.children.map((child, index) => 
            processNode(child, desiredNode.children![index])
          )
        : undefined
    };
  }
  
  return processNode(current, desired);
}

// Преобразует дерево в плоский список операций для выполнения
export function generateOperationsList(
  diffTree: AssetNode, 
  currentTree?: AssetNode, 
  desiredTree?: AssetNode
): AssetDiff[] {
  const operations: AssetDiff[] = [];
  
  // Создаем карты для быстрого поиска узлов по ID
  const currentMap: Record<string, AssetNode> = {};
  const desiredMap: Record<string, AssetNode> = {};
  
  if (currentTree) {
    mapNodeById(currentTree, currentMap);
  }
  
  if (desiredTree) {
    mapNodeById(desiredTree, desiredMap);
  }
  
  function mapNodeById(node: AssetNode, map: Record<string, AssetNode>) {
    map[node.id] = node;
    if (node.children) {
      node.children.forEach(child => mapNodeById(child, map));
    }
  }
  
  function traverseNode(node: AssetNode, currentPath: string[] = []): void {
    const path = [...currentPath, node.name];
    
    if (!node.children || node.children.length === 0) {
      const currentNode = currentMap[node.id];
      const desiredNode = desiredMap[node.id];
      
      operations.push({
        id: node.id,
        name: path.join(' / '),
        currentValue: currentNode?.value || 0,
        desiredValue: desiredNode?.value || 0,
        diffValue: node.value,
        operation: (node as any).operation || 'hold',
        quoteId: currentNode?.quoteId || desiredNode?.quoteId || 'USD'
      });
    } else {
      node.children.forEach(child => {
        traverseNode(child, path);
      });
    }
  }
  
  traverseNode(diffTree);
  return operations;
}

// Превращает плоскую структуру в древовидную
export function arrayToTree(items: any[]): AssetNode {
  const rootItems = items.filter(item => !item.parentId);
  if (rootItems.length !== 1) {
    throw new Error('В списке должен быть ровно один корневой элемент');
  }
  
  const root = { ...rootItems[0] };
  const itemMap: Record<string, AssetNode> = { [root.id]: root };
  
  items.forEach(item => {
    if (item.id !== root.id) {
      itemMap[item.id] = { ...item };
    }
  });
  
  items.forEach(item => {
    if (item.parentId && item.id !== root.id) {
      const parent = itemMap[item.parentId];
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(itemMap[item.id]);
      }
    }
  });
  
  return root;
} 