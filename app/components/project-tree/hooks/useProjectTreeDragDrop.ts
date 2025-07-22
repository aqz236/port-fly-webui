/**
 * Project Tree Drag and Drop Hook
 * 
 * 处理项目树的拖拽操作
 */

import { useCallback } from 'react';
import type { TreeItem as RCTTreeItem, DraggingPosition } from 'react-complex-tree';
import type { ProjectTreeNode, MoveNodeParams } from '../core/types';
import { TreeOperationsManager } from '../core/operations';

interface UseProjectTreeDragDropProps {
  nodeMap: Map<string, ProjectTreeNode>;
  operationsManager: TreeOperationsManager;
  onMoveNode: (nodeId: string, params: MoveNodeParams) => Promise<void>;
}

interface UseProjectTreeDragDropReturn {
  handleDrop: (items: RCTTreeItem<any>[], target: DraggingPosition) => Promise<void>;
  canDropAt: (items: RCTTreeItem<any>[], target: DraggingPosition) => boolean;
}

export function useProjectTreeDragDrop({
  nodeMap,
  operationsManager,
  onMoveNode,
}: UseProjectTreeDragDropProps): UseProjectTreeDragDropReturn {
  
  /**
   * 处理拖拽放置
   */
  const handleDrop = useCallback(async (
    items: RCTTreeItem<any>[], 
    target: DraggingPosition
  ) => {
    if (items.length !== 1) {
      console.warn('Only single item drop is supported');
      return;
    }

    const draggedItem = items[0];
    const draggedNodeId = draggedItem.index.toString();

    // 解析拖拽目标
    const dropTarget = operationsManager.parseDropTarget(target);
    
    // 转换为移动参数
    const moveParams = operationsManager.dropTargetToMoveParams(
      draggedNodeId,
      dropTarget,
      nodeMap
    );

    if (!moveParams) {
      console.warn('Unable to determine move parameters');
      return;
    }

    // 验证移动操作
    const validation = operationsManager.validateMove(moveParams, nodeMap);
    if (!validation.valid) {
      console.warn('Invalid move operation:', validation.reason);
      return;
    }

    try {
      await onMoveNode(draggedNodeId, moveParams);
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  }, [nodeMap, operationsManager, onMoveNode]);

  /**
   * 检查是否可以在指定位置放置
   */
  const canDropAt = useCallback((
    items: RCTTreeItem<any>[], 
    target: DraggingPosition
  ): boolean => {
    if (items.length !== 1) {
      return false;
    }

    const draggedItem = items[0];
    const draggedNodeId = draggedItem.index.toString();
    const draggedNode = nodeMap.get(draggedNodeId);

    if (!draggedNode?.canMove) {
      return false;
    }

    // 解析拖拽目标
    const dropTarget = operationsManager.parseDropTarget(target);
    
    // 转换为移动参数
    const moveParams = operationsManager.dropTargetToMoveParams(
      draggedNodeId,
      dropTarget,
      nodeMap
    );

    if (!moveParams) {
      return false;
    }

    // 验证移动操作
    const validation = operationsManager.validateMove(moveParams, nodeMap);
    return validation.valid;
  }, [nodeMap, operationsManager]);

  return {
    handleDrop,
    canDropAt,
  };
}
