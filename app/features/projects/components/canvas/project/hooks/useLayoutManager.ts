// 布局管理的自定义Hook
import { useCallback } from 'react';
import { Group } from '~/shared/types/group';
import { 
  calculateGridLayout, 
  calculateCircularLayout, 
  calculateHierarchicalLayout,
  DEFAULT_LAYOUT_CONFIG,
  LayoutConfig 
} from '../utils/layout';
import { GroupNodeState } from '../types';

export type LayoutType = 'grid' | 'circular' | 'hierarchical';

/**
 * 布局管理Hook
 * @param groups 组列表
 * @param groupStates 组状态
 * @param updateGroupStates 更新组状态函数
 * @param config 布局配置
 * @returns 布局操作函数
 */
export function useLayoutManager(
  groups: Group[],
  groupStates: GroupNodeState,
  updateGroupStates: (states: GroupNodeState) => void,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
) {
  // 应用自动布局
  const applyAutoLayout = useCallback((layoutType: LayoutType = 'grid') => {
    if (!groups || groups.length === 0) return;
    
    let positions: Array<{ x: number; y: number }>;
    
    switch (layoutType) {
      case 'circular':
        positions = calculateCircularLayout(groups, config);
        break;
      case 'hierarchical':
        positions = calculateHierarchicalLayout(groups, config);
        break;
      case 'grid':
      default:
        positions = calculateGridLayout(groups, config);
        break;
    }
    
    const newGroupStates = { ...groupStates };
    
    groups.forEach((group, index) => {
      newGroupStates[group.id] = {
        ...newGroupStates[group.id],
        position: positions[index],
      };
    });
    
    updateGroupStates(newGroupStates);
  }, [groups, groupStates, updateGroupStates, config]);

  // 网格布局
  const applyGridLayout = useCallback(() => {
    applyAutoLayout('grid');
  }, [applyAutoLayout]);

  // 圆形布局
  const applyCircularLayout = useCallback(() => {
    applyAutoLayout('circular');
  }, [applyAutoLayout]);

  // 层次布局
  const applyHierarchicalLayout = useCallback(() => {
    applyAutoLayout('hierarchical');
  }, [applyAutoLayout]);

  // 适应窗口
  const fitToView = useCallback(() => {
    // 这里可以计算所有节点的边界框，并调整视窗
    setTimeout(() => {
      const reactFlowInstance = (window as any).reactFlowInstance;
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.1 });
      }
    }, 100);
  }, []);

  // 居中显示
  const centerView = useCallback(() => {
    setTimeout(() => {
      const reactFlowInstance = (window as any).reactFlowInstance;
      if (reactFlowInstance) {
        const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        reactFlowInstance.setCenter(center.x, center.y, { zoom: 1 });
      }
    }, 100);
  }, []);

  return {
    applyAutoLayout,
    applyGridLayout,
    applyCircularLayout,
    applyHierarchicalLayout,
    fitToView,
    centerView,
  };
}
