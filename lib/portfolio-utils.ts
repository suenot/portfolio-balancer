import { AssetDiff, AssetNode, AssetOperation, Operation } from './types';

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

// Функция для генерации списка операций на основе diff-дерева
export function generateOperationsList(
  diffTree: AssetNode,
  currentTree: AssetNode,
  desiredTree: AssetNode
): Operation[] {
  const operations: Operation[] = [];
  
  // Рекурсивная функция обхода дерева
  function processNode(node: AssetNode) {
    // Добавляем операцию, если у узла есть операция и это не 'hold'
    if (node.operation && node.operation !== 'hold' && node.value !== 0) {
      operations.push({
        assetName: node.name,
        type: node.operation,
        currentValue: findNodeValue(node.id, currentTree),
        targetValue: findNodeValue(node.id, desiredTree),
        diffValue: node.value,
        quoteId: node.quoteId,
      });
    }
    
    // Обрабатываем дочерние узлы
    if (node.children) {
      node.children.forEach(processNode);
    }
  }
  
  // Вспомогательная функция для поиска значения узла по ID
  function findNodeValue(id: string, tree: AssetNode): number {
    // Если это корневой узел
    if (tree.id === id) {
      return tree.value;
    }
    
    // Рекурсивный поиск
    if (tree.children) {
      for (const child of tree.children) {
        // Рекурсивный вызов
        const result = findNodeValue(id, child);
        if (result !== -1) {
          return result;
        }
      }
    }
    
    return -1; // Узел не найден
  }
  
  // Начинаем обход с корневого узла
  processNode(diffTree);
  
  // Сортируем операции по абсолютному значению разницы (сначала большие)
  return operations.sort((a, b) => Math.abs(b.diffValue) - Math.abs(a.diffValue));
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