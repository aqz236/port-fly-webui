/**
 * Project Tree Core Types
 * 
 * 这个文件定义了项目树组件的核心类型，独立于具体的UI库实现
 */

import type { TreeItemIndex, DraggingPosition } from "react-complex-tree";
import type { Project } from "~/shared/types/api";

// ===== 核心树节点类型 =====

/**
 * 树节点的基础接口
 */
export interface TreeNode {
  /** 节点唯一标识 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 是否为文件夹 */
  isFolder: boolean;
  /** 子节点ID列表 */
  children: string[];
  /** 是否可以移动 */
  canMove: boolean;
  /** 是否可以重命名 */
  canRename: boolean;
  /** 排序权重 */
  sort: number;
  /** 父节点ID */
  parentId?: string;
  /** 节点深度 */
  level: number;
}

/**
 * 项目树节点 - 继承基础树节点，添加项目特定信息
 */
export interface ProjectTreeNode extends TreeNode {
  /** 关联的项目数据 */
  project?: Project;
  /** 节点类型 */
  type: 'root' | 'project';
}

/**
 * 树的状态接口
 */
export interface TreeState {
  /** 聚焦的节点 */
  focusedItem?: string;
  /** 展开的节点列表 */
  expandedItems: string[];
  /** 选中的节点列表 */
  selectedItems: string[];
}

// ===== 操作相关类型 =====

/**
 * 拖拽操作的目标信息
 */
export interface DropTarget {
  /** 目标类型 */
  type: 'item' | 'between-items' | 'root';
  /** 目标节点ID */
  targetId?: string;
  /** 父节点ID（用于 between-items） */
  parentId?: string;
  /** 插入位置索引 */
  position: number;
}

/**
 * 节点移动操作的参数
 */
export interface MoveNodeParams {
  /** 要移动的节点ID */
  nodeId: string;
  /** 新的父节点ID */
  newParentId?: string;
  /** 在新位置的索引 */
  position: number;
}

/**
 * 树操作的回调函数类型
 */
export interface TreeOperations {
  /** 选择节点 */
  onSelectNode?: (nodeId: string) => void;
  /** 移动节点 */
  onMoveNode?: (params: MoveNodeParams) => Promise<void>;
  /** 重命名节点 */
  onRenameNode?: (nodeId: string, newName: string) => Promise<void>;
  /** 删除节点 */
  onDeleteNode?: (nodeId: string) => Promise<void>;
  /** 创建子节点 */
  onCreateChild?: (parentId: string, name: string) => Promise<void>;
}

// ===== 配置类型 =====

/**
 * 树组件的配置选项
 */
export interface TreeConfig {
  /** 是否启用拖拽 */
  enableDragAndDrop: boolean;
  /** 是否可以拖拽到文件夹 */
  canDropOnFolder: boolean;
  /** 是否可以拖拽到非文件夹 */
  canDropOnNonFolder: boolean;
  /** 是否可以重排序 */
  canReorderItems: boolean;
  /** 是否启用搜索 */
  enableSearch: boolean;
  /** 是否显示根节点 */
  showRootNode: boolean;
  /** 根节点ID */
  rootNodeId: string;
}

/**
 * 默认的树配置
 */
export const DEFAULT_TREE_CONFIG: TreeConfig = {
  enableDragAndDrop: true,
  canDropOnFolder: true,
  canDropOnNonFolder: true,
  canReorderItems: true,
  enableSearch: false,
  showRootNode: false,
  rootNodeId: 'root',
};

// ===== 事件类型 =====

/**
 * 树事件的类型
 */
export type TreeEventType = 
  | 'node-select'
  | 'node-expand'
  | 'node-collapse'
  | 'node-focus'
  | 'node-move'
  | 'node-rename'
  | 'node-delete'
  | 'node-create';

/**
 * 树事件的数据
 */
export interface TreeEvent<T = any> {
  type: TreeEventType;
  nodeId: string;
  data?: T;
  timestamp: number;
}

// ===== 适配器类型 =====

/**
 * 树数据适配器的接口
 * 用于将外部数据转换为树内部使用的格式
 */
export interface TreeDataAdapter<TSource = any> {
  /** 将源数据转换为树节点 */
  toTreeNodes(sourceData: TSource[]): ProjectTreeNode[];
  /** 将树节点转换回源数据格式 */
  fromTreeNode(node: ProjectTreeNode): TSource;
  /** 创建根节点 */
  createRootNode(): ProjectTreeNode;
}
