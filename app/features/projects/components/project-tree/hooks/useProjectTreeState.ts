/**
 * Project Tree State Hook
 * 
 * 管理项目树的状态和操作
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Project, MoveProjectParams } from '~/shared/types/api';
import type { ProjectTreeNode, TreeState, MoveNodeParams } from '../core/types';
import { ProjectTreeAdapter } from '../core/adapter';
import { TreeOperationsManager } from '../core/operations';

interface UseProjectTreeState {
  projects: Project[];
  onMoveProject?: (params: MoveProjectParams) => Promise<void>;
  onSelectProject?: (projectId: number) => void;
  initialExpanded?: string[];
  initialSelected?: string[];
}

interface UseProjectTreeReturn {
  // 树数据
  treeNodes: ProjectTreeNode[];
  nodeMap: Map<string, ProjectTreeNode>;
  
  // 树状态
  treeState: TreeState;
  
  // 状态更新函数
  setFocusedItem: (nodeId?: string) => void;
  setExpandedItems: (items: string[]) => void;
  setSelectedItems: (items: string[]) => void;
  
  // 操作函数
  handleSelectItems: (items: string[]) => void;
  handleExpandItem: (nodeId: string) => void;
  handleCollapseItem: (nodeId: string) => void;
  handleFocusItem: (nodeId: string) => void;
  handleMoveNode: (nodeId: string, params: MoveNodeParams) => Promise<void>;
  
  // 工具函数
  expandToNode: (nodeId: string) => void;
  selectProject: (projectId: number) => void;
  
  // 管理器实例
  operationsManager: TreeOperationsManager;
  adapter: ProjectTreeAdapter;
}

export function useProjectTreeState({
  projects,
  onMoveProject,
  onSelectProject,
  initialExpanded = ['root'],
  initialSelected = [],
}: UseProjectTreeState): UseProjectTreeReturn {
  // 创建适配器和操作管理器实例
  const adapter = useMemo(() => new ProjectTreeAdapter(), []);
  const operationsManager = useMemo(() => new TreeOperationsManager(), []);

  // 基础状态
  const [focusedItem, setFocusedItem] = useState<string | undefined>();
  const [expandedItems, setExpandedItems] = useState<string[]>(initialExpanded);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialSelected);
  
  // 乐观更新的树节点状态
  const [optimisticNodes, setOptimisticNodes] = useState<ProjectTreeNode[] | null>(null);

  // 将项目数据转换为树节点
  const baseTreeNodes = useMemo(() => {
    return adapter.toTreeNodes(projects);
  }, [adapter, projects]);

  // 使用乐观更新的节点或基础节点
  const treeNodes = optimisticNodes || baseTreeNodes;

  // 当基础数据变化时，延迟清除乐观更新状态
  useEffect(() => {
    if (optimisticNodes) {
      // 给API足够的时间返回，然后清除乐观更新
      // 这样确保用户能看到立即的反馈，同时最终使用服务器的数据
      const timer = setTimeout(() => {
        setOptimisticNodes(null);
      }, 2000); // 给2秒时间，确保API调用完成
      return () => clearTimeout(timer);
    }
  }, [optimisticNodes]);

  // 构建节点映射
  const nodeMap = useMemo(() => {
    return adapter.buildNodeMap(treeNodes);
  }, [adapter, treeNodes]);

  // 树状态对象
  const treeState = useMemo((): TreeState => ({
    focusedItem,
    expandedItems,
    selectedItems,
  }), [focusedItem, expandedItems, selectedItems]);

  // 处理节点选择
  const handleSelectItems = useCallback((items: string[]) => {
    setSelectedItems(items);
    
    if (items.length === 1 && items[0] !== 'root') {
      const node = nodeMap.get(items[0]);
      if (node?.project && onSelectProject) {
        onSelectProject(node.project.id);
      }
    }
  }, [nodeMap, onSelectProject]);

  // 处理节点展开
  const handleExpandItem = useCallback((nodeId: string) => {
    setExpandedItems(prev => 
      operationsManager.updateExpandedItems(prev, nodeId, true)
    );
    operationsManager.emitNodeExpand(nodeId);
  }, [operationsManager]);

  // 处理节点折叠
  const handleCollapseItem = useCallback((nodeId: string) => {
    setExpandedItems(prev => 
      operationsManager.updateExpandedItems(prev, nodeId, false)
    );
    operationsManager.emitNodeCollapse(nodeId);
  }, [operationsManager]);

  // 处理节点聚焦
  const handleFocusItem = useCallback((nodeId: string) => {
    setFocusedItem(nodeId);
  }, []);

  // 处理节点移动
  const handleMoveNode = useCallback(async (nodeId: string, params: MoveNodeParams) => {
    if (!onMoveProject) return;

    const node = nodeMap.get(nodeId);
    if (!node?.project) return;

    // 验证移动操作
    const validation = operationsManager.validateMove(params, nodeMap);
    if (!validation.valid) {
      console.warn('Invalid move operation:', validation.reason);
      return;
    }

    // 立即进行乐观更新
    const optimisticUpdatedNodes = adapter.optimisticUpdateNodes(
      treeNodes,
      nodeId,
      params.newParentId,
      params.position
    );
    
    console.log('Setting optimistic nodes:', {
      nodeId,
      newParentId: params.newParentId,
      position: params.position,
      optimisticUpdatedNodes: optimisticUpdatedNodes.map(n => ({ id: n.id, isFolder: n.isFolder, children: n.children }))
    });
    
    setOptimisticNodes(optimisticUpdatedNodes);

    // 如果新父节点存在，自动展开它
    if (params.newParentId && !expandedItems.includes(params.newParentId)) {
      setExpandedItems(prev => [...prev, params.newParentId!]);
    }

    try {
      // 转换为项目移动参数
      const projectParams: MoveProjectParams = {
        project_id: node.project.id,
        parent_id: params.newParentId ? parseInt(params.newParentId) : undefined,
        position: params.position,
      };

      await onMoveProject(projectParams);
      operationsManager.emitNodeMove(nodeId, params);
    } catch (error) {
      console.error('Failed to move project:', error);
      // 回滚乐观更新
      setOptimisticNodes(null);
      throw error;
    }
  }, [nodeMap, onMoveProject, operationsManager, treeNodes, adapter, expandedItems]);

  // 展开到指定节点
  const expandToNode = useCallback((nodeId: string) => {
    const newExpanded = operationsManager.expandToNode(nodeId, nodeMap, expandedItems);
    setExpandedItems(newExpanded);
  }, [operationsManager, nodeMap, expandedItems]);

  // 选择项目
  const selectProject = useCallback((projectId: number) => {
    const nodeId = projectId.toString();
    const node = nodeMap.get(nodeId);
    
    if (node) {
      // 自动展开到该节点
      expandToNode(nodeId);
      // 选择该节点
      setSelectedItems([nodeId]);
      // 聚焦该节点
      setFocusedItem(nodeId);
    }
  }, [nodeMap, expandToNode]);

  return {
    // 树数据
    treeNodes,
    nodeMap,
    
    // 树状态
    treeState,
    
    // 状态更新函数
    setFocusedItem,
    setExpandedItems,
    setSelectedItems,
    
    // 操作函数
    handleSelectItems,
    handleExpandItem,
    handleCollapseItem,
    handleFocusItem,
    handleMoveNode,
    
    // 工具函数
    expandToNode,
    selectProject,
    
    // 管理器实例
    operationsManager,
    adapter,
  };
}
