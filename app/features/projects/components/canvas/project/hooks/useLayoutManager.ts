// 布局管理的自定义Hook - 新架构版本
import { useCallback } from 'react';
import { Node } from '@xyflow/react';

/**
 * 布局配置
 */
interface LayoutConfig {
  nodeSpacing: {
    x: number;
    y: number;
  };
  gridColumns: number;
  startPosition: {
    x: number;
    y: number;
  };
  circularRadius?: number;
}

const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeSpacing: {
    x: 300,
    y: 200,
  },
  gridColumns: 3,
  startPosition: {
    x: 100,
    y: 100,
  },
  circularRadius: 250,
};

export type LayoutType = 'grid' | 'circular' | 'force';

/**
 * 计算网格布局位置
 */
function calculateGridLayout(nodeCount: number, config: LayoutConfig = DEFAULT_LAYOUT_CONFIG) {
  const positions: Array<{ x: number; y: number }> = [];
  
  for (let i = 0; i < nodeCount; i++) {
    const row = Math.floor(i / config.gridColumns);
    const col = i % config.gridColumns;
    
    positions.push({
      x: config.startPosition.x + col * config.nodeSpacing.x,
      y: config.startPosition.y + row * config.nodeSpacing.y,
    });
  }
  
  return positions;
}

/**
 * 计算圆形布局位置
 */
function calculateCircularLayout(nodeCount: number, config: LayoutConfig = DEFAULT_LAYOUT_CONFIG) {
  const positions: Array<{ x: number; y: number }> = [];
  const centerX = config.startPosition.x + 200;
  const centerY = config.startPosition.y + 200;
  const radius = config.circularRadius || 250;
  
  for (let i = 0; i < nodeCount; i++) {
    const angle = (2 * Math.PI * i) / nodeCount;
    positions.push({
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  }
  
  return positions;
}

/**
 * 布局管理Hook - 新架构版本
 * 
 * 重构说明：
 * - 移除了 GroupNode 相关的布局逻辑
 * - 直接对 ReactFlow 节点进行布局操作
 * - 简化了接口，只处理节点位置更新
 * 
 * @param nodes 当前的 ReactFlow 节点
 * @param setNodes 设置节点的函数
 * @param config 布局配置
 * @returns 布局操作函数
 */
export function useLayoutManager(
  nodes: Node[],
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
) {
  // 应用网格布局
  const applyGridLayout = useCallback(() => {
    if (!nodes || nodes.length === 0) return;
    
    const positions = calculateGridLayout(nodes.length, config);
    
    setNodes((currentNodes) =>
      currentNodes.map((node, index) => ({
        ...node,
        position: positions[index] || node.position,
      }))
    );
  }, [nodes, setNodes, config]);

  // 应用圆形布局
  const applyCircularLayout = useCallback(() => {
    if (!nodes || nodes.length === 0) return;
    
    const positions = calculateCircularLayout(nodes.length, config);
    
    setNodes((currentNodes) =>
      currentNodes.map((node, index) => ({
        ...node,
        position: positions[index] || node.position,
      }))
    );
  }, [nodes, setNodes, config]);

  // 应用自动布局（默认为网格）
  const applyAutoLayout = useCallback((layoutType: LayoutType = 'grid') => {
    switch (layoutType) {
      case 'circular':
        applyCircularLayout();
        break;
      case 'grid':
      default:
        applyGridLayout();
        break;
      case 'force':
        // 力导向布局可以使用 ReactFlow 内置的功能
        console.log('Force layout not implemented yet');
        break;
    }
  }, [applyGridLayout, applyCircularLayout]);

  // 适应视图 - 这个功能由 ReactFlow 实例提供
  const fitToView = useCallback(() => {
    // 通过 ReactFlow 实例调用 fitView
    if ((window as any).reactFlowInstance) {
      (window as any).reactFlowInstance.fitView();
    }
  }, []);

  // 重置所有节点位置
  const resetLayout = useCallback(() => {
    applyGridLayout();
  }, [applyGridLayout]);

  return {
    applyAutoLayout,
    applyGridLayout,
    applyCircularLayout,
    fitToView,
    resetLayout,
    config,
  };
}
