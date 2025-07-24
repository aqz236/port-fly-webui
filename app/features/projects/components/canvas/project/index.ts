// 项目画布模块导出 - 新架构版本
export { ProjectCanvas } from './ProjectCanvas';
export type { ProjectCanvasProps } from './types';

// 导出子模块
export { CanvasToolbar } from './components/CanvasToolbar';
export { CanvasInfoPanel } from './components/CanvasInfoPanel';
export { CanvasEmptyStateV2 } from './components/CanvasEmptyStateV2';
export { CanvasEmptyWithManager } from './components/CanvasEmptyWithManager';

// 导出新架构的Hooks
export { useCanvasHandlers } from './hooks/useCanvasHandlers';
export { useLayoutManager } from './hooks/useLayoutManager';
export { useNodeGenerator } from './hooks/useNodeGenerator';

// 导出工具函数 - 新版本
export * from './utils/export';

// 类型导出
export type { LayoutType } from './hooks/useLayoutManager';
