/**
 * Project Tree Module Exports
 * 
 * 项目树模块的主要导出
 */

// 核心组件
export { ProjectTree } from './components/ProjectTree';
export { ProjectTreeSection } from './components/ProjectTreeSection';
export { ProjectTreeActions } from './components/ProjectTreeActions';

// 核心类型
export type {
  TreeNode,
  ProjectTreeNode,
  TreeState,
  DropTarget,
  MoveNodeParams,
  TreeOperations,
  TreeConfig,
  TreeEventType,
  TreeEvent,
  TreeDataAdapter,
} from './core/types';

// 核心类
export { ProjectTreeAdapter } from './core/adapter';
export { TreeOperationsManager } from './core/operations';

// Hooks
export { useProjectTreeState } from './hooks/useProjectTreeState';
export { useProjectTreeDragDrop } from './hooks/useProjectTreeDragDrop';

// 工具函数
export {
  convertToRCTFormat,
  getNodeTitle,
  createTreeConfig,
  getNodeIcon,
  calculateNodeIndent,
  nodeMatchesSearch,
  filterTreeNodes,
  getExpandedSuggestions,
  validateTreeStructure,
  cloneTreeNodes,
  getNodePath,
} from './utils/tree-utils';

// 常量
export { DEFAULT_TREE_CONFIG } from './core/types';
