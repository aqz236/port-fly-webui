// 节点管理器状态存储
import React from 'react';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { Node } from '@xyflow/react';
import { 
  NodeConfig, 
  NodeCategory, 
  BaseNodeData, 
  CreateNodeParams, 
  UpdateNodeParams 
} from './types';

// 节点管理器状态接口
interface NodeManagerStore {
  // 注册的节点类别
  categories: Record<string, NodeCategory>;
  // 注册的节点配置
  nodeConfigs: Record<string, NodeConfig>;
  // 当前画布节点
  nodes: Node[];
  // 选中的节点
  selectedNode: Node | null;
  // 对话框状态
  dialog: {
    isOpen: boolean;
    mode: 'create' | 'edit' | 'view';
    nodeType?: string;
    selectedNode?: Node;
  };
  // 搜索和过滤状态
  filters: {
    searchTerm: string;
    selectedCategoryId?: string;
    selectedTags: string[];
  };

  // 节点类别管理
  registerCategory: (category: NodeCategory) => void;
  unregisterCategory: (categoryId: string) => void;
  getCategories: () => NodeCategory[];
  getCategoryById: (id: string) => NodeCategory | undefined;

  // 节点配置管理
  registerNodeConfig: (config: NodeConfig) => void;
  unregisterNodeConfig: (nodeType: string) => void;
  getNodeConfigs: () => NodeConfig[];
  getNodeConfigByType: (type: string) => NodeConfig | undefined;
  getNodeConfigsByCategory: (categoryId: string) => NodeConfig[];
  
  // 从nodeTypes映射中发现和注册节点
  discoverNodesFromTypes: (nodeTypes: Record<string, React.ComponentType<any>>) => void;

  // 节点实例管理
  setNodes: (nodes: Node[]) => void;
  addNode: (params: CreateNodeParams) => Node | null;
  updateNode: (params: UpdateNodeParams) => boolean;
  deleteNode: (nodeId: string) => boolean;
  duplicateNode: (nodeId: string) => Node | null;
  selectNode: (node: Node | null) => void;
  getNodeById: (nodeId: string) => Node | undefined;

  // 对话框管理
  openDialog: (mode: 'create' | 'edit' | 'view', nodeType?: string, node?: Node) => void;
  closeDialog: () => void;

  // 过滤和搜索
  setSearchTerm: (term: string) => void;
  setSelectedCategory: (categoryId?: string) => void;
  toggleTag: (tag: string) => void;
  clearFilters: () => void;
  getFilteredConfigs: () => NodeConfig[];

  // 工具方法
  generateNodeId: (prefix?: string) => string;
  validateNodeData: (type: string, data: any) => boolean;
}

// 默认节点类别
const DEFAULT_CATEGORIES: NodeCategory[] = [
  {
    id: 'host',
    name: '主机节点',
    description: 'SSH主机连接节点',
    color: '#3b82f6'
  },
  {
    id: 'service',
    name: '服务节点',
    description: '服务和应用程序节点',
    color: '#10b981'
  },
  {
    id: 'database',
    name: '数据库节点',
    description: '数据库连接节点',
    color: '#f59e0b'
  },
  {
    id: 'network',
    name: '网络节点',
    description: '网络设备和连接节点',
    color: '#8b5cf6'
  },
  {
    id: 'custom',
    name: '自定义节点',
    description: '用户自定义节点',
    color: '#6b7280'
  }
];

// 创建存储
export const useNodeManagerStore = create<NodeManagerStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // 初始状态
      categories: DEFAULT_CATEGORIES.reduce((acc, cat) => ({ ...acc, [cat.id]: cat }), {}),
      nodeConfigs: {},
      nodes: [],
      selectedNode: null,
      dialog: {
        isOpen: false,
        mode: 'create'
      },
      filters: {
        searchTerm: '',
        selectedTags: []
      },

      // 节点类别管理
      registerCategory: (category) => set((state) => ({
        categories: { ...state.categories, [category.id]: category }
      })),

      unregisterCategory: (categoryId) => set((state) => {
        const { [categoryId]: removed, ...categories } = state.categories;
        return { categories };
      }),

      getCategories: () => Object.values(get().categories),

      getCategoryById: (id) => get().categories[id],

      // 节点配置管理
      registerNodeConfig: (config) => {
        const state = get();
        
        // 检查类别是否存在
        if (!state.categories[config.categoryId]) {
          console.warn(`节点类型 ${config.type} 的类别 ${config.categoryId} 不存在`);
          return;
        }

        set((state) => ({
          nodeConfigs: { ...state.nodeConfigs, [config.type]: config }
        }));

        console.log(`节点类型 ${config.type} 已注册到管理器`);
      },

      unregisterNodeConfig: (nodeType) => set((state) => {
        const { [nodeType]: removed, ...nodeConfigs } = state.nodeConfigs;
        return { nodeConfigs };
      }),

      getNodeConfigs: () => Object.values(get().nodeConfigs),

      getNodeConfigByType: (type) => get().nodeConfigs[type],

      getNodeConfigsByCategory: (categoryId) => 
        Object.values(get().nodeConfigs).filter(config => config.categoryId === categoryId),

      // 从nodeTypes映射中发现和注册节点
      discoverNodesFromTypes: (nodeTypes) => {
        const state = get();
        
        Object.entries(nodeTypes).forEach(([nodeType, Component]) => {
          // 检查组件是否已经有节点配置（通过装饰器注册）
          if (state.nodeConfigs[nodeType]) {
            console.log(`节点类型 ${nodeType} 已通过装饰器注册，跳过自动发现`);
            return;
          }

          // 检查组件是否有节点配置元数据
          const nodeConfig = (Component as any).__nodeConfig;
          if (nodeConfig) {
            // 使用组件上的配置元数据
            state.registerNodeConfig({
              ...nodeConfig,
              type: nodeType,
              component: Component
            });
            console.log(`自动发现并注册节点类型: ${nodeType}`);
          } else {
            // 为没有配置的组件创建基础配置
            const basicConfig: NodeConfig = {
              type: nodeType,
              displayName: nodeType.replace(/([A-Z])/g, ' $1').trim(),
              description: `${nodeType} 节点`,
              icon: React.createElement('div', { className: 'w-4 h-4 bg-gray-400 rounded' }),
              categoryId: 'custom',
              version: '1.0.0',
              tags: ['自动发现'],
              component: Component,
              createNodeData: (params: any) => ({
                id: params.id || '',
                type: nodeType,
                label: params.label || nodeType,
                description: params.description || `${nodeType} 节点`,
                status: 'inactive' as const,
                metadata: {}
              }),
              validateNodeData: (data: any) => !!(data && data.id && data.type),
              defaultStyle: {
                width: 200,
                height: 100,
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                borderWidth: 1,
                borderRadius: 8
              }
            };
            
            state.registerNodeConfig(basicConfig);
            console.log(`自动创建基础配置并注册节点类型: ${nodeType}`);
          }
        });
      },

      // 节点实例管理
      setNodes: (nodes) => set({ nodes }),

      addNode: (params) => {
        const { nodeConfigs } = get();
        const config = nodeConfigs[params.type];
        
        if (!config) {
          console.error(`未找到节点类型: ${params.type}`);
          return null;
        }

        try {
          const nodeData = config.createNodeData(params.data);
          const nodeId = get().generateNodeId(params.type);
          
          const newNode: Node = {
            id: nodeId,
            type: params.type,
            position: params.position,
            data: nodeData,
            ...config.defaultStyle && { style: config.defaultStyle },
            draggable: config.draggable ?? true,
            selectable: config.selectable ?? true,
            deletable: config.deletable ?? true,
            connectable: config.connectable ?? true,
          };

          set((state) => ({
            nodes: [...state.nodes, newNode]
          }));

          return newNode;
        } catch (error) {
          console.error('创建节点失败:', error);
          return null;
        }
      },

      updateNode: (params) => {
        const { nodes } = get();
        const nodeIndex = nodes.findIndex(node => node.id === params.nodeId);
        
        if (nodeIndex === -1) {
          console.error(`未找到节点: ${params.nodeId}`);
          return false;
        }

        set((state) => ({
          nodes: state.nodes.map(node => 
            node.id === params.nodeId 
              ? { ...node, data: { ...node.data, ...params.data } }
              : node
          )
        }));

        return true;
      },

      deleteNode: (nodeId) => {
        const { nodes } = get();
        const nodeExists = nodes.some(node => node.id === nodeId);
        
        if (!nodeExists) {
          console.error(`未找到节点: ${nodeId}`);
          return false;
        }

        set((state) => ({
          nodes: state.nodes.filter(node => node.id !== nodeId),
          selectedNode: state.selectedNode?.id === nodeId ? null : state.selectedNode
        }));

        return true;
      },

      duplicateNode: (nodeId) => {
        const { nodes } = get();
        const originalNode = nodes.find(node => node.id === nodeId);
        
        if (!originalNode) {
          console.error(`未找到节点: ${nodeId}`);
          return null;
        }

        const newNodeId = get().generateNodeId(originalNode.type);
        const newNode: Node = {
          ...originalNode,
          id: newNodeId,
          position: {
            x: originalNode.position.x + 50,
            y: originalNode.position.y + 50
          },
          data: {
            ...originalNode.data,
            id: newNodeId,
            label: `${originalNode.data.label} (副本)`
          }
        };

        set((state) => ({
          nodes: [...state.nodes, newNode]
        }));

        return newNode;
      },

      selectNode: (node) => set({ selectedNode: node }),

      getNodeById: (nodeId) => get().nodes.find(node => node.id === nodeId),

      // 对话框管理
      openDialog: (mode, nodeType, node) => set({
        dialog: {
          isOpen: true,
          mode,
          nodeType,
          selectedNode: node
        }
      }),

      closeDialog: () => set({
        dialog: {
          isOpen: false,
          mode: 'create'
        }
      }),

      // 过滤和搜索
      setSearchTerm: (term) => set((state) => ({
        filters: { ...state.filters, searchTerm: term }
      })),

      setSelectedCategory: (categoryId) => set((state) => ({
        filters: { ...state.filters, selectedCategoryId: categoryId }
      })),

      toggleTag: (tag) => set((state) => ({
        filters: {
          ...state.filters,
          selectedTags: state.filters.selectedTags.includes(tag)
            ? state.filters.selectedTags.filter(t => t !== tag)
            : [...state.filters.selectedTags, tag]
        }
      })),

      clearFilters: () => set({
        filters: {
          searchTerm: '',
          selectedTags: []
        }
      }),

      getFilteredConfigs: () => {
        const { nodeConfigs, filters } = get();
        const configs = Object.values(nodeConfigs);
        
        return configs.filter(config => {
          // 搜索词过滤
          if (filters.searchTerm) {
            const searchLower = filters.searchTerm.toLowerCase();
            const matchesSearch = 
              config.displayName.toLowerCase().includes(searchLower) ||
              config.description.toLowerCase().includes(searchLower) ||
              config.type.toLowerCase().includes(searchLower) ||
              config.tags?.some(tag => tag.toLowerCase().includes(searchLower));
            
            if (!matchesSearch) return false;
          }

          // 类别过滤
          if (filters.selectedCategoryId && config.categoryId !== filters.selectedCategoryId) {
            return false;
          }

          // 标签过滤
          if (filters.selectedTags.length > 0) {
            const hasMatchingTag = filters.selectedTags.some(tag => 
              config.tags?.includes(tag)
            );
            if (!hasMatchingTag) return false;
          }

          return true;
        });
      },

      // 工具方法
      generateNodeId: (prefix = 'node') => 
        `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,

      validateNodeData: (type, data) => {
        const config = get().nodeConfigs[type];
        if (!config) return false;
        
        return config.validateNodeData ? config.validateNodeData(data) : true;
      }
    })),
    {
      name: 'node-manager-store',
      partialize: (state: NodeManagerStore) => ({
        categories: state.categories,
        nodeConfigs: state.nodeConfigs
      })
    }
  )
);

// 节点注册器 - 用于自动注册节点
export class NodeRegistrar {
  private static instance: NodeRegistrar;
  
  static getInstance(): NodeRegistrar {
    if (!NodeRegistrar.instance) {
      NodeRegistrar.instance = new NodeRegistrar();
    }
    return NodeRegistrar.instance;
  }

  // 注册节点配置
  register(config: NodeConfig): void {
    const store = useNodeManagerStore.getState();
    store.registerNodeConfig(config);
  }

  // 批量注册节点配置
  registerBatch(configs: NodeConfig[]): void {
    configs.forEach(config => this.register(config));
  }

  // 注册节点类别
  registerCategory(category: NodeCategory): void {
    const store = useNodeManagerStore.getState();
    store.registerCategory(category);
  }
}

// 导出单例实例
export const nodeRegistrar = NodeRegistrar.getInstance();
