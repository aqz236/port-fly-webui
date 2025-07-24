// 画布状态管理的自定义Hook
import { useState, useCallback } from 'react';
import { CanvasState } from '../types';

/**
 * 画布状态管理Hook - 重构后不再使用 GroupNode
 * @returns 画布状态和操作函数
 */
export function useCanvasStates() {
  const [canvasStates, setCanvasStates] = useState<CanvasState>({});

  // 切换组展开/收起状态
  const handleToggleExpand = useCallback((groupId: number) => {
    setCanvasStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        isExpanded: !(prev[groupId]?.isExpanded ?? true),
      }
    }));
  }, []);

  // 更新组位置
  const updateGroupPosition = useCallback((groupId: number, position: { x: number; y: number }) => {
    setCanvasStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        position,
      }
    }));
  }, []);

  // 批量更新状态
  const updateCanvasStates = useCallback((newStates: CanvasState) => {
    setCanvasStates(newStates);
  }, []);

  // 重置所有状态
  const resetCanvasStates = useCallback(() => {
    setCanvasStates({});
  }, []);

  // 获取单个组状态
  const getGroupState = useCallback((groupId: number) => {
    return canvasStates[groupId] || { isExpanded: true, position: { x: 0, y: 0 } };
  }, [canvasStates]);

  // 初始化组状态
  const initializeGroupState = useCallback((groupId: number, position?: { x: number; y: number }) => {
    setCanvasStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId], // 保留已有状态
        isExpanded: prev[groupId]?.isExpanded ?? true,
        position: prev[groupId]?.position || position || { x: 0, y: 0 },
      }
    }));
  }, []);

  return {
    canvasStates,
    handleToggleExpand,
    updateGroupPosition,
    updateCanvasStates,
    resetCanvasStates,
    getGroupState,
    initializeGroupState,
  };
}

// 保持向后兼容的导出
export const useGroupStates = useCanvasStates;
