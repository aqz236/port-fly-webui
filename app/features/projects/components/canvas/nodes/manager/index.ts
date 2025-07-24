// 节点管理器入口文件
export { useNodeManagerStore, nodeRegistrar } from './store';
export { 
  registerNode, 
  registerCategory, 
  createNodeConfig, 
  withNodeBase, 
  useNodeLifecycle,
  attachNodeConfig 
} from './decorators';
export { NodeManagerDialog } from './NodeManagerDialog';
export { CanvasNodeManager } from './CanvasNodeManager';
export type {
  BaseNodeTemplate,
  NodeCategory,
  BaseNodeData,
  NodeConfig,
  NodeRegistry,
  CreateNodeParams,
  UpdateNodeParams,
  NodeManagerState,
  NodeAction,
  NodeManagerCallbacks
} from './types';

// 自动注册已有节点
import './auto-register';
