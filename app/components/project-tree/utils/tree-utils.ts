/**
 * Project Tree Utilities
 * 
 * 项目树的工具函数
 */

import type { TreeItemIndex } from 'react-complex-tree';
import type { ProjectTreeNode, TreeConfig } from '../core/types';
import { DEFAULT_TREE_CONFIG } from '../core/types';

/**
 * 将树节点转换为 react-complex-tree 需要的格式
 */
export function convertToRCTFormat(
  nodes: ProjectTreeNode[]
): Record<TreeItemIndex, any> {
  const treeData: Record<TreeItemIndex, any> = {};

  nodes.forEach(node => {
    treeData[node.id] = {
      index: node.id,
      canMove: node.canMove,
      canRename: node.canRename,
      data: node.name,
      children: node.children,
      isFolder: node.isFolder,
    };
  });

  return treeData;
}

/**
 * 获取节点的显示标题
 */
export function getNodeTitle(node: any): string {
  return node.data || 'Untitled';
}

/**
 * 创建默认的树配置
 */
export function createTreeConfig(overrides: Partial<TreeConfig> = {}): TreeConfig {
  return {
    ...DEFAULT_TREE_CONFIG,
    ...overrides,
  };
}

/**
 * 获取节点的图标组件名称
 */
export function getNodeIcon(node: ProjectTreeNode, isExpanded: boolean): string {
  if (node.type === 'root') {
    return 'folder';
  }

  if (node.isFolder) {
    return isExpanded ? 'folder-open' : 'folder';
  }

  return 'file-text';
}

/**
 * 计算节点的层级缩进
 */
export function calculateNodeIndent(level: number, indentSize: number = 16): number {
  return level * indentSize;
}

/**
 * 检查节点是否匹配搜索关键词
 */
export function nodeMatchesSearch(node: ProjectTreeNode, searchTerm: string): boolean {
  if (!searchTerm.trim()) {
    return true;
  }

  const term = searchTerm.toLowerCase();
  return node.name.toLowerCase().includes(term) ||
         (node.project?.description?.toLowerCase().includes(term) ?? false);
}

/**
 * 过滤树节点（用于搜索）
 */
export function filterTreeNodes(
  nodes: ProjectTreeNode[],
  searchTerm: string
): ProjectTreeNode[] {
  if (!searchTerm.trim()) {
    return nodes;
  }

  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const matchedNodes = new Set<string>();
  const ancestorNodes = new Set<string>();

  // 第一步：找到所有匹配的节点
  nodes.forEach(node => {
    if (nodeMatchesSearch(node, searchTerm)) {
      matchedNodes.add(node.id);
    }
  });

  // 第二步：添加匹配节点的所有祖先
  matchedNodes.forEach(nodeId => {
    let currentNode = nodeMap.get(nodeId);
    while (currentNode?.parentId) {
      ancestorNodes.add(currentNode.parentId);
      currentNode = nodeMap.get(currentNode.parentId);
    }
  });

  // 第三步：添加匹配节点的所有后代
  const addDescendants = (nodeId: string) => {
    const node = nodeMap.get(nodeId);
    if (!node) return;
    
    node.children.forEach(childId => {
      if (nodeMap.has(childId)) {
        matchedNodes.add(childId);
        addDescendants(childId);
      }
    });
  };

  Array.from(matchedNodes).forEach(addDescendants);

  // 合并所有需要显示的节点
  const visibleNodes = new Set([...matchedNodes, ...ancestorNodes]);

  return nodes.filter(node => visibleNodes.has(node.id));
}

/**
 * 获取展开状态的建议（基于搜索结果）
 */
export function getExpandedSuggestions(
  filteredNodes: ProjectTreeNode[],
  searchTerm: string
): string[] {
  if (!searchTerm.trim()) {
    return [];
  }

  const nodeMap = new Map(filteredNodes.map(node => [node.id, node]));
  const toExpand = new Set<string>();

  // 展开所有包含匹配项的文件夹
  filteredNodes.forEach(node => {
    if (node.isFolder && node.children.some(childId => {
      const child = nodeMap.get(childId);
      return child && nodeMatchesSearch(child, searchTerm);
    })) {
      toExpand.add(node.id);
    }
  });

  return Array.from(toExpand);
}

/**
 * 验证树结构的完整性
 */
export function validateTreeStructure(nodes: ProjectTreeNode[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  // 检查是否有根节点
  const rootNode = nodes.find(node => node.type === 'root');
  if (!rootNode) {
    errors.push('Missing root node');
  }

  // 检查父子关系
  nodes.forEach(node => {
    if (node.parentId && !nodeMap.has(node.parentId)) {
      errors.push(`Node ${node.id} references non-existent parent ${node.parentId}`);
    }

    node.children.forEach(childId => {
      const child = nodeMap.get(childId);
      if (!child) {
        errors.push(`Node ${node.id} references non-existent child ${childId}`);
      } else if (child.parentId !== node.id) {
        errors.push(`Child ${childId} has incorrect parent reference`);
      }
    });
  });

  // 检查循环引用
  const visited = new Set<string>();
  const visiting = new Set<string>();

  const hasCycle = (nodeId: string): boolean => {
    if (visiting.has(nodeId)) {
      return true; // 发现循环
    }
    if (visited.has(nodeId)) {
      return false;
    }

    visiting.add(nodeId);
    const node = nodeMap.get(nodeId);
    
    if (node) {
      for (const childId of node.children) {
        if (hasCycle(childId)) {
          return true;
        }
      }
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
  };

  if (rootNode && hasCycle(rootNode.id)) {
    errors.push('Tree structure contains cycles');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * 深度克隆树节点（用于状态更新）
 */
export function cloneTreeNodes(nodes: ProjectTreeNode[]): ProjectTreeNode[] {
  return nodes.map(node => ({
    ...node,
    children: [...node.children],
  }));
}

/**
 * 获取节点的完整路径
 */
export function getNodePath(
  nodeId: string,
  nodeMap: Map<string, ProjectTreeNode>,
  separator: string = ' > '
): string {
  const path: string[] = [];
  let currentNode = nodeMap.get(nodeId);

  while (currentNode && currentNode.type !== 'root') {
    path.unshift(currentNode.name);
    currentNode = currentNode.parentId ? nodeMap.get(currentNode.parentId) : undefined;
  }

  return path.join(separator);
}
