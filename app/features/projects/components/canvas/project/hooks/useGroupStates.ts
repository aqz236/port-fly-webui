// 组状态管理的自定义Hook
import { useState, useCallback } from 'react';
import { GroupNodeState } from '../types';

/**
 * 组状态管理Hook
 * @returns 组状态和操作函数
 */
export function useGroupStates() {
  const [groupStates, setGroupStates] = useState<GroupNodeState>({});

  // 切换组展开/收起状态
  const handleToggleExpand = useCallback((groupId: number) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        isExpanded: !(prev[groupId]?.isExpanded ?? true),
      }
    }));
  }, []);

  // 更新组位置
  const updateGroupPosition = useCallback((groupId: number, position: { x: number; y: number }) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: {
        ...prev[groupId],
        position,
      }
    }));
  }, []);

  // 批量更新组状态
  const updateGroupStates = useCallback((newStates: GroupNodeState) => {
    setGroupStates(newStates);
  }, []);

  // 重置组状态
  const resetGroupStates = useCallback(() => {
    setGroupStates({});
  }, []);

  // 获取特定组的状态
  const getGroupState = useCallback((groupId: number) => {
    return groupStates[groupId] || { isExpanded: true, position: { x: 0, y: 0 } };
  }, [groupStates]);

  // 设置组的默认状态
  const initializeGroupState = useCallback((groupId: number, position: { x: number; y: number }) => {
    setGroupStates(prev => ({
      ...prev,
      [groupId]: prev[groupId] || {
        isExpanded: true,
        position,
      }
    }));
  }, []);

  return {
    groupStates,
    handleToggleExpand,
    updateGroupPosition,
    updateGroupStates,
    resetGroupStates,
    getGroupState,
    initializeGroupState,
  };
}
