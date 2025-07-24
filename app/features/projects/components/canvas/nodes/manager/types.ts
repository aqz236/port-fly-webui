// 节点管理器类型定义
import { Node, NodeProps } from '@xyflow/react';
import { ReactNode } from 'react';

// 节点类别定义（动态可扩展）
export interface NodeCategory {
  id: string;
  name: string;
  description?: string;
  icon?: ReactNode;
  color?: string;
}

// 节点基础模板接口
export interface BaseNodeTemplate {
  // 节点类型标识（唯一）
  type: string;
  // 节点显示名称
  displayName: string;
  // 节点描述
  description: string;
  // 节点图标
  icon: ReactNode;
  // 节点类别ID（引用NodeCategory.id）
  categoryId: string;
  // 节点版本（用于升级兼容）
  version?: string;
  // 节点标签（用于搜索和过滤）
  tags?: string[];
  // 是否可调整大小
  resizable?: boolean;
  // 是否可连接
  connectable?: boolean;
  // 是否可删除
  deletable?: boolean;
  // 是否可拖拽
  draggable?: boolean;
  // 是否可选择
  selectable?: boolean;
  // 默认样式
  defaultStyle?: {
    width?: number;
    height?: number;
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
  };
  // 自定义属性
  customProps?: Record<string, any>;
}

// 节点数据基础接口
export interface BaseNodeData extends Record<string, any> {
  id: string;
  type: string;
  label: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error' | 'pending';
  metadata?: Record<string, any>;
  // 操作回调
  onEdit?: (nodeId: string) => void;
  onDelete?: (nodeId: string) => void;
  onDuplicate?: (nodeId: string) => void;
  onConnect?: (nodeId: string) => void;
  onDisconnect?: (nodeId: string) => void;
}

// 节点配置
export interface NodeConfig extends BaseNodeTemplate {
  // 节点组件
  component: React.ComponentType<NodeProps>;
  // 创建节点数据的函数
  createNodeData: (params: any) => BaseNodeData;
  // 验证节点数据
  validateNodeData?: (data: any) => boolean;
  // 节点默认位置
  defaultPosition?: { x: number; y: number };
}

// 节点注册表
export interface NodeRegistry {
  [key: string]: NodeConfig;
}

// 节点创建参数
export interface CreateNodeParams {
  type: string;
  position: { x: number; y: number };
  data: any;
}

// 节点更新参数
export interface UpdateNodeParams {
  nodeId: string;
  data: Partial<BaseNodeData>;
}

// 节点管理器状态
export interface NodeManagerState {
  nodes: Node[];
  selectedNode: Node | null;
  isDialogOpen: boolean;
  dialogMode: 'create' | 'edit' | 'view';
  availableTypes: NodeConfig[];
}

// 节点操作类型
export type NodeAction = 
  | { type: 'SET_NODES'; payload: Node[] }
  | { type: 'ADD_NODE'; payload: Node }
  | { type: 'UPDATE_NODE'; payload: { nodeId: string; data: Partial<BaseNodeData> } }
  | { type: 'DELETE_NODE'; payload: string }
  | { type: 'SELECT_NODE'; payload: Node | null }
  | { type: 'OPEN_DIALOG'; payload: { mode: 'create' | 'edit' | 'view'; node?: Node } }
  | { type: 'CLOSE_DIALOG' };

// 节点管理器回调接口
export interface NodeManagerCallbacks {
  onNodesChange?: (nodes: Node[]) => void;
  onNodeCreate?: (node: Node) => void;
  onNodeUpdate?: (nodeId: string, data: Partial<BaseNodeData>) => void;
  onNodeDelete?: (nodeId: string) => void;
  onNodeSelect?: (node: Node | null) => void;
}
