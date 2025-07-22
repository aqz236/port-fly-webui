/**
 * Tree Operations Manager
 * 
 * 负责处理树的各种操作逻辑，如拖拽、移动、选择等
 */

import type { DraggingPosition } from "react-complex-tree";
import type { 
  ProjectTreeNode, 
  TreeState, 
  DropTarget, 
  MoveNodeParams, 
  TreeOperations,
  TreeEvent,
  TreeEventType 
} from "./types";

/**
 * 树操作管理器
 */
export class TreeOperationsManager {
  private eventListeners: Map<TreeEventType, Set<(event: TreeEvent) => void>> = new Map();

  /**
   * 解析拖拽位置为标准的投放目标
   */
  parseDropTarget(draggingPosition: DraggingPosition): DropTarget {
    if (draggingPosition.targetType === 'item' && 'targetItem' in draggingPosition && draggingPosition.targetItem !== 'root') {
      return {
        type: 'item',
        targetId: draggingPosition.targetItem.toString(),
        position: 0,
      };
    }

    if (draggingPosition.targetType === 'between-items' && 'parentItem' in draggingPosition) {
      const childIndex = 'childIndex' in draggingPosition ? draggingPosition.childIndex : undefined;
      return {
        type: 'between-items',
        parentId: draggingPosition.parentItem && draggingPosition.parentItem !== 'root' 
          ? draggingPosition.parentItem.toString() 
          : undefined,
        position: typeof childIndex === 'number' ? childIndex : 0,
      };
    }

    const childIndex = 'childIndex' in draggingPosition ? draggingPosition.childIndex : undefined;
    return {
      type: 'root',
      position: typeof childIndex === 'number' ? childIndex : 0,
    };
  }

  /**
   * 将投放目标转换为移动参数
   */
  dropTargetToMoveParams(
    draggedNodeId: string,
    dropTarget: DropTarget,
    nodeMap: Map<string, ProjectTreeNode>
  ): MoveNodeParams | null {
    let newParentId: string | undefined;
    let position = dropTarget.position;

    switch (dropTarget.type) {
      case 'item':
        // 投放到项目上 - 作为该项目的子项
        newParentId = dropTarget.targetId;
        position = 0; // 添加到末尾
        break;

      case 'between-items':
        // 投放在两个项目之间
        newParentId = dropTarget.parentId;
        break;

      case 'root':
        // 投放到根级别
        newParentId = undefined;
        break;

      default:
        return null;
    }

    return {
      nodeId: draggedNodeId,
      newParentId,
      position,
    };
  }

  /**
   * 验证移动操作是否有效
   */
  validateMove(
    params: MoveNodeParams,
    nodeMap: Map<string, ProjectTreeNode>
  ): { valid: boolean; reason?: string } {
    const { nodeId, newParentId } = params;
    const node = nodeMap.get(nodeId);

    if (!node) {
      return { valid: false, reason: 'Source node not found' };
    }

    if (!node.canMove) {
      return { valid: false, reason: 'Node cannot be moved' };
    }

    // 不能移动到自己
    if (nodeId === newParentId) {
      return { valid: false, reason: 'Cannot move node to itself' };
    }

    // 检查是否移动到后代节点
    if (newParentId && this.isDescendant(newParentId, nodeId, nodeMap)) {
      return { valid: false, reason: 'Cannot move node to its descendant' };
    }

    // 检查目标父节点是否存在且可以接受子节点
    if (newParentId) {
      const targetParent = nodeMap.get(newParentId);
      if (!targetParent) {
        return { valid: false, reason: 'Target parent not found' };
      }
    }

    return { valid: true };
  }

  /**
   * 检查一个节点是否是另一个节点的后代
   */
  private isDescendant(
    checkNodeId: string,
    ancestorNodeId: string,
    nodeMap: Map<string, ProjectTreeNode>
  ): boolean {
    let currentNode = nodeMap.get(checkNodeId);
    
    while (currentNode?.parentId) {
      if (currentNode.parentId === ancestorNodeId) {
        return true;
      }
      currentNode = nodeMap.get(currentNode.parentId);
    }
    
    return false;
  }

  /**
   * 更新树状态中的展开项
   */
  updateExpandedItems(
    currentExpanded: string[],
    nodeId: string,
    expand: boolean
  ): string[] {
    if (expand) {
      return currentExpanded.includes(nodeId) 
        ? currentExpanded 
        : [...currentExpanded, nodeId];
    } else {
      return currentExpanded.filter(id => id !== nodeId);
    }
  }

  /**
   * 自动展开到指定节点的路径
   */
  expandToNode(
    nodeId: string,
    nodeMap: Map<string, ProjectTreeNode>,
    currentExpanded: string[]
  ): string[] {
    const pathToNode = this.getPathToNode(nodeId, nodeMap);
    const newExpanded = new Set(currentExpanded);
    
    // 展开路径上的所有父节点
    pathToNode.forEach(id => {
      if (id !== nodeId) { // 不包括目标节点本身
        newExpanded.add(id);
      }
    });
    
    return Array.from(newExpanded);
  }

  /**
   * 获取到指定节点的路径
   */
  private getPathToNode(
    nodeId: string,
    nodeMap: Map<string, ProjectTreeNode>
  ): string[] {
    const path: string[] = [];
    let currentNode = nodeMap.get(nodeId);
    
    while (currentNode) {
      path.unshift(currentNode.id);
      if (currentNode.parentId) {
        currentNode = nodeMap.get(currentNode.parentId);
      } else {
        break;
      }
    }
    
    return path;
  }

  /**
   * 处理键盘导航
   */
  handleKeyboardNavigation(
    key: string,
    currentFocused: string | undefined,
    currentExpanded: string[],
    nodeMap: Map<string, ProjectTreeNode>
  ): { 
    newFocused?: string; 
    newExpanded?: string[]; 
    action?: 'select' | 'expand' | 'collapse' 
  } {
    if (!currentFocused) return {};

    const currentNode = nodeMap.get(currentFocused);
    if (!currentNode) return {};

    switch (key) {
      case 'ArrowDown':
        return { newFocused: this.getNextNode(currentFocused, nodeMap, currentExpanded) };
      
      case 'ArrowUp':
        return { newFocused: this.getPreviousNode(currentFocused, nodeMap, currentExpanded) };
      
      case 'ArrowRight':
        if (currentNode.isFolder && !currentExpanded.includes(currentFocused)) {
          return { 
            newExpanded: this.updateExpandedItems(currentExpanded, currentFocused, true),
            action: 'expand'
          };
        } else if (currentNode.children.length > 0) {
          return { newFocused: currentNode.children[0] };
        }
        break;
      
      case 'ArrowLeft':
        if (currentNode.isFolder && currentExpanded.includes(currentFocused)) {
          return { 
            newExpanded: this.updateExpandedItems(currentExpanded, currentFocused, false),
            action: 'collapse'
          };
        } else if (currentNode.parentId) {
          return { newFocused: currentNode.parentId };
        }
        break;
      
      case 'Enter':
      case ' ':
        return { action: 'select' };
    }

    return {};
  }

  /**
   * 获取下一个可见节点
   */
  private getNextNode(
    currentNodeId: string,
    nodeMap: Map<string, ProjectTreeNode>,
    expanded: string[]
  ): string | undefined {
    const visibleNodes = this.getVisibleNodes(nodeMap, expanded);
    const currentIndex = visibleNodes.findIndex(node => node.id === currentNodeId);
    
    if (currentIndex >= 0 && currentIndex < visibleNodes.length - 1) {
      return visibleNodes[currentIndex + 1].id;
    }
    
    return undefined;
  }

  /**
   * 获取上一个可见节点
   */
  private getPreviousNode(
    currentNodeId: string,
    nodeMap: Map<string, ProjectTreeNode>,
    expanded: string[]
  ): string | undefined {
    const visibleNodes = this.getVisibleNodes(nodeMap, expanded);
    const currentIndex = visibleNodes.findIndex(node => node.id === currentNodeId);
    
    if (currentIndex > 0) {
      return visibleNodes[currentIndex - 1].id;
    }
    
    return undefined;
  }

  /**
   * 获取所有可见节点（按显示顺序）
   */
  private getVisibleNodes(
    nodeMap: Map<string, ProjectTreeNode>,
    expanded: string[]
  ): ProjectTreeNode[] {
    const visibleNodes: ProjectTreeNode[] = [];
    const rootNode = nodeMap.get('root');
    
    if (!rootNode) return visibleNodes;

    const traverse = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node || node.id === 'root') return;
      
      visibleNodes.push(node);
      
      if (node.isFolder && expanded.includes(nodeId)) {
        node.children.forEach(childId => traverse(childId));
      }
    };

    rootNode.children.forEach(childId => traverse(childId));
    return visibleNodes;
  }

  /**
   * 添加事件监听器
   */
  addEventListener(eventType: TreeEventType, listener: (event: TreeEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(eventType: TreeEventType, listener: (event: TreeEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emitEvent(eventType: TreeEventType, nodeId: string, data?: any): void {
    const event: TreeEvent = {
      type: eventType,
      nodeId,
      data,
      timestamp: Date.now(),
    };

    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }

  /**
   * 触发节点选择事件
   */
  emitNodeSelect(nodeId: string): void {
    this.emitEvent('node-select', nodeId);
  }

  /**
   * 触发节点移动事件
   */
  emitNodeMove(nodeId: string, params: MoveNodeParams): void {
    this.emitEvent('node-move', nodeId, params);
  }

  /**
   * 触发节点展开事件
   */
  emitNodeExpand(nodeId: string): void {
    this.emitEvent('node-expand', nodeId);
  }

  /**
   * 触发节点折叠事件
   */
  emitNodeCollapse(nodeId: string): void {
    this.emitEvent('node-collapse', nodeId);
  }
}
