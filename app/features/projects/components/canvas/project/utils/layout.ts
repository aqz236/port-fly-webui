// 布局计算相关的工具函数
import { Group } from '~/shared/types/group';

// 布局配置接口
export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  spacing: { x: number; y: number };
  padding: { x: number; y: number };
}

// 默认布局配置
export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 400,
  nodeHeight: 300,
  spacing: { x: 100, y: 150 },
  padding: { x: 50, y: 50 },
};

/**
 * 计算网格布局位置
 * @param groups 组列表
 * @param config 布局配置
 * @returns 位置数组
 */
export function calculateGridLayout(
  groups: Group[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Array<{ x: number; y: number }> {
  const nodesPerRow = Math.ceil(Math.sqrt(groups.length));
  
  return groups.map((group, index) => {
    const row = Math.floor(index / nodesPerRow);
    const col = index % nodesPerRow;
    
    return {
      x: col * (config.nodeWidth + config.spacing.x) + config.padding.x,
      y: row * (config.nodeHeight + config.spacing.y) + config.padding.y,
    };
  });
}

/**
 * 计算层次布局位置（未来可扩展）
 * @param groups 组列表
 * @param config 布局配置
 * @returns 位置数组
 */
export function calculateHierarchicalLayout(
  groups: Group[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Array<{ x: number; y: number }> {
  // 目前使用网格布局，未来可以实现更复杂的层次布局
  return calculateGridLayout(groups, config);
}

/**
 * 计算圆形布局位置
 * @param groups 组列表
 * @param config 布局配置
 * @returns 位置数组
 */
export function calculateCircularLayout(
  groups: Group[], 
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): Array<{ x: number; y: number }> {
  if (groups.length === 0) return [];
  if (groups.length === 1) {
    return [{ x: config.padding.x, y: config.padding.y }];
  }

  const centerX = 400;
  const centerY = 300;
  const radius = Math.max(200, groups.length * 30);
  const angleStep = (2 * Math.PI) / groups.length;

  return groups.map((group, index) => {
    const angle = index * angleStep;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  });
}

/**
 * 检查位置是否在视窗范围内
 * @param position 位置
 * @param viewportWidth 视窗宽度
 * @param viewportHeight 视窗高度
 * @returns 是否在范围内
 */
export function isPositionInViewport(
  position: { x: number; y: number },
  viewportWidth: number,
  viewportHeight: number
): boolean {
  return (
    position.x >= 0 &&
    position.y >= 0 &&
    position.x <= viewportWidth &&
    position.y <= viewportHeight
  );
}

/**
 * 获取节点的边界框
 * @param position 节点位置
 * @param config 布局配置
 * @returns 边界框
 */
export function getNodeBounds(
  position: { x: number; y: number },
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): { x: number; y: number; width: number; height: number } {
  return {
    x: position.x,
    y: position.y,
    width: config.nodeWidth,
    height: config.nodeHeight,
  };
}
